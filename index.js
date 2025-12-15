const express = require("express");
const mysql = require("mysql2");
const bodyparser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
const post = "5000";

// Enable CORS for all origins (allowing frontend to connect)
app.use(cors());

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "animales",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.get("/cats", (req, res) => {
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

// Get cats by id
app.get("/cats/:id", (req, res) => {
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

// Delete
app.delete("/cats/:id", (req, res) => {
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

//post cats
app.post("/cats", (req, res) => {
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

// Update a record by ID (Dynamic Update)
app.put("/cats/:id", (req, res) => {
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

app.listen(post, () => {
  console.log("Server is running on port " + post);
});
