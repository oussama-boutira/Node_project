const express = require("express");
const mysql = require("mysql2");
const bodyparser = require("body-parser");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// JWT Configuration from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "cat_gallery_secret_key_2024";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Enable CORS for all origins (allowing frontend to connect)
app.use(cors());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

// Database configuration from environment variables
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "animales",
  port: process.env.DB_PORT || 3306,
  ssl:
    process.env.DB_HOST && process.env.DB_HOST.includes("tidbcloud")
      ? {
          minVersion: "TLSv1.2",
          rejectUnauthorized: true,
        }
      : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ==================== AUTH MIDDLEWARE ====================

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token." });
    }
    req.user = user;
    next();
  });
};

// Optional auth - doesn't block, just attaches user if token exists
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }
  next();
};

// ==================== AUTH ROUTES ====================

// Register new user
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password } = req.body;

  // Validation
  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ error: "Username, email, and password are required." });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters." });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  try {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    pool.getConnection((err, connection) => {
      if (err) {
        console.error("DB connection error:", err);
        return res.status(500).json({ error: "Database connection error." });
      }

      // Check if user already exists
      connection.query(
        "SELECT id FROM users WHERE email = ? OR username = ?",
        [email, username],
        (checkErr, existingUsers) => {
          if (checkErr) {
            connection.release();
            console.error("Query error:", checkErr);
            return res.status(500).json({ error: "Database error." });
          }

          if (existingUsers.length > 0) {
            connection.release();
            return res
              .status(409)
              .json({ error: "Username or email already exists." });
          }

          // Insert new user
          connection.query(
            "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
            [username, email, passwordHash],
            (insertErr, result) => {
              connection.release();

              if (insertErr) {
                console.error("Insert error:", insertErr);
                return res
                  .status(500)
                  .json({ error: "Failed to create user." });
              }

              // Generate token
              const token = jwt.sign(
                { id: result.insertId, username, email },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
              );

              res.status(201).json({
                message: "User registered successfully!",
                token,
                user: { id: result.insertId, username, email },
              });
            }
          );
        }
      );
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error during registration." });
  }
});

// Login user
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("DB connection error:", err);
      return res.status(500).json({ error: "Database connection error." });
    }

    connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (queryErr, users) => {
        connection.release();

        if (queryErr) {
          console.error("Query error:", queryErr);
          return res.status(500).json({ error: "Database error." });
        }

        if (users.length === 0) {
          return res.status(401).json({ error: "Invalid email or password." });
        }

        const user = users[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
          return res.status(401).json({ error: "Invalid email or password." });
        }

        // Generate token
        const token = jwt.sign(
          { id: user.id, username: user.username, email: user.email },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({
          message: "Login successful!",
          token,
          user: { id: user.id, username: user.username, email: user.email },
        });
      }
    );
  });
});

// Get current user info
app.get("/api/auth/me", authenticateToken, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
    },
  });
});

// ==================== CAT ROUTES (PROTECTED) ====================

// Get all cats (protected - requires login)
app.get("/cats", authenticateToken, (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "DB connection error" });
    }
    connection.query("SELECT * FROM cats", (qerr, rows) => {
      connection.release();
      if (qerr) {
        console.log(qerr);
        return res.status(500).json({ error: "Query error" });
      }
      res.json(rows);
    });
  });
});

// Get cat by id (protected)
app.get("/cats/:id", authenticateToken, (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("DB connection error:", err);
      return res.status(500).json({ error: "DB connection error" });
    }
    connection.query(
      "SELECT * FROM cats where id = ?",
      [req.params.id],
      (qErr, rows) => {
        connection.release();
        if (qErr) {
          console.error("Query error:", qErr);
          return res.status(500).json({ error: "Query error" });
        }
        res.json(rows);
      }
    );
  });
});

// ==================== CAT ROUTES (PROTECTED) ====================

// Delete cat (protected)
app.delete("/cats/:id", authenticateToken, (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("DB connection error:", err);
      return res.status(500).json({ error: "DB connection error" });
    }
    connection.query(
      "DELETE FROM cats where id = ?",
      [req.params.id],
      (qErr, rows) => {
        connection.release();
        if (qErr) {
          console.error("Query error:", qErr);
          return res.status(500).json({ error: "Query error" });
        }
        res.json({
          message: `Record Num: ${req.params.id} deleted successfully`,
        });
      }
    );
  });
});

// Add cat (protected)
app.post("/cats", authenticateToken, (req, res) => {
  const { image_url, type_name, color } = req.body;
  if (!image_url || !type_name || !color) {
    return res.status(400).json({
      error:
        "Missing required fields: image_url, type_name, and color are all required.",
    });
  }
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "DB connection error" });
    }
    const query =
      "INSERT INTO cats (image_url, type_name, color) VALUES (?, ?, ?)";
    const values = [image_url, type_name, color];
    connection.query(query, values, (qerr, result) => {
      connection.release();
      if (qerr) {
        console.log(qerr);
        return res.status(500).json({ error: "Query error" });
      }
      res.status(201).json({
        message: "Cat added successfully",
        id: result.insertId,
        type_name: type_name,
        color: color,
      });
    });
  });
});

// Update cat (protected)
app.put("/cats/:id", authenticateToken, (req, res) => {
  const catId = req.params.id;
  const updates = req.body;
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No fields provided for update." });
  }
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "DB connection error" });
    }
    const fields = [];
    const values = [];
    for (const key in updates) {
      if (["image_url", "type_name", "color"].includes(key)) {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    }
    values.push(catId);
    const query = `
      UPDATE cats 
      SET ${fields.join(", ")} 
      WHERE id = ?
    `;
    connection.query(query, values, (qerr, result) => {
      connection.release();
      if (qerr) {
        console.log(qerr);
        return res.status(500).json({ error: "Query error" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: `Cat with ID ${catId} not found or no change was made.`,
        });
      }
      res.json({
        message: `Record Num: ${catId} updated successfully (Fields updated: ${fields.length})`,
      });
    });
  });
});

app.listen(port, () => {
  console.log("Server is running on port " + port);
});
