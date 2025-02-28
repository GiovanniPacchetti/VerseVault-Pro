const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

// Conectar a la base de datos SQLite
const db = new sqlite3.Database("libreria.db", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database.");
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT
      )`
    );
  }
});

// Endpoint para autenticación
app.post("/login", (req, res) => {
    const { email, password } = req.body;
  
    const sql = "SELECT id_cl FROM Cliente WHERE email_cl = ? AND pass_cl = ?";
    db.get(sql, [email, password], (err, row) => {
      if (err) {
        return res.status(500).json({ message: "Server error" });
      }
      if (!row) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      res.json({ message: "Login successful", userId: row.id_cl });
    });
});
  


app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
