# 🐱 Cat Gallery

A beautiful, modern cat gallery web application with CRUD operations, user authentication, and cat adoption features. Built with Node.js, Express, and MySQL.

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Express](https://img.shields.io/badge/Express-5.x-blue)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)

## ✨ Features

- **User Authentication** - Register, login, and JWT-based session management
- **Cat Gallery** - View, add, edit, and delete cat entries
- **Cat Adoption** - Adopt cats with per-user session storage
- **Search & Filter** - Find cats by name/breed and filter by color
- **Pagination** - Navigate through large collections easily
- **Modern UI** - Dark theme with glassmorphism design

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MySQL** (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/)
- **Git** - [Download](https://git-scm.com/)

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/oussama-boutira/Node_project.git
cd Node_project
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up the database

Create a MySQL database and run the following SQL:

```sql
CREATE DATABASE animales;
USE animales;

-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cats table
CREATE TABLE cats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type_name VARCHAR(100) NOT NULL,
  color VARCHAR(50) NOT NULL,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
### 4. Start the server

```bash
npm start
```

The application will be available at: **http://localhost:5000**

---

## 🔧 Environment Variables

| Variable         | Description                       | Required |
| ---------------- | --------------------------------- | -------- |
| `DB_HOST`        | MySQL host address                | Yes      |
| `DB_USER`        | MySQL username                    | Yes      |
| `DB_PASSWORD`    | MySQL password                    | Yes      |
| `DB_NAME`        | Database name                     | Yes      |
| `DB_PORT`        | MySQL port (default: 3306)        | No       |
| `JWT_SECRET`     | Secret key for JWT tokens         | Yes      |
| `JWT_EXPIRES_IN` | JWT expiration time (default: 7d) | No       |
| `SESSION_SECRET` | Secret key for session cookies    | Yes      |
| `PORT`           | Server port (default: 5000)       | No       |

---

## 📁 Project Structure

```
Node_project/
├── public/              # Frontend files
│   ├── index.html       # Main gallery page
│   ├── login.html       # Login page
│   ├── register.html    # Registration page
│   ├── app.js           # Frontend JavaScript
│   └── styles.css       # CSS styles
├── index.js             # Express server & API routes
├── package.json         # Dependencies
├── .env                 # Environment variables (create this)
└── README.md            # This file
```

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint             | Description           |
| ------ | -------------------- | --------------------- |
| POST   | `/api/auth/register` | Register new user     |
| POST   | `/api/auth/login`    | Login user            |
| GET    | `/api/auth/me`       | Get current user info |

### Cats (Protected - requires auth)

| Method | Endpoint    | Description   |
| ------ | ----------- | ------------- |
| GET    | `/cats`     | Get all cats  |
| GET    | `/cats/:id` | Get cat by ID |
| POST   | `/cats`     | Add new cat   |
| PUT    | `/cats/:id` | Update cat    |
| DELETE | `/cats/:id` | Delete cat    |

### Adoptions (Protected - per user)

| Method | Endpoint                | Description               |
| ------ | ----------------------- | ------------------------- |
| GET    | `/api/adoptions`        | Get adopted cat IDs       |
| POST   | `/api/adoptions/:catId` | Adopt a cat               |
| DELETE | `/api/adoptions/:catId` | Remove adoption           |
| GET    | `/api/adoptions/cats`   | Get full adopted cat data |

---

## 🖥️ Usage

1. **Register** a new account or **Login** with existing credentials
2. **Browse** the cat gallery with search and filter options
3. **Add** new cats using the "Add New Cat" button
4. **Edit** or **Delete** cats using the buttons on each card
5. **Adopt** cats by clicking the "Adopt" button
6. View your **Adopted cats** by clicking the heart button in the navbar

---

