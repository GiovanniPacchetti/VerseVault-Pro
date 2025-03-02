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

app.post("/logout", (req, res) => {
    res.json({ message: "Logout successful" });
});
  

app.get("/user/:userId/books", (req, res) => {
  const { userId } = req.params;
  let books = [];

  // Consulta para obtener los libros del cliente
  const sql = `
    SELECT p.id_libro, p.fecha_lec, p.pag_actual
    FROM Progreso p
    WHERE p.id_cl = ?;
  `;
  db.all(sql, [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Error en la consulta de la base de datos", error: err.message });
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: "No se encontraron libros para este usuario." });
    }

    // Para cada libro, obtenemos su título
    let queryCount = 0;
    rows.forEach((row) => {
      const { id_libro, fecha_lec, pag_actual } = row;

      // Consultamos el título del libro
      const titleSql = "SELECT titulo FROM Libro WHERE id_libro = ?";
      db.get(titleSql, [id_libro], (err, titleRow) => {
        if (err) {
          return res.status(500).json({ message: "Error al obtener el título del libro", error: err.message });
        }

        if (titleRow) {
          books.push({
            id_libro,
            titulo: titleRow.titulo,
            fecha_lectura: fecha_lec,
            pagina_actual: pag_actual
          });
        }

        queryCount++;

        // Si todos los títulos han sido procesados, devolver la respuesta
        if (queryCount === rows.length) {
          if (books.length === 0) {
            return res.status(404).json({ message: "No se encontraron libros en tu lista." });
          }
          return res.json(books);  // Devolver los libros con la información
        }
      });
    });
  });
});


app.post("/addBook", (req, res) => {
  const { userId, tituloLibro, fecha_lec } = req.body;

  // Consultar si el libro existe en la base de datos
  const sql = `SELECT id_libro, titulo FROM Libro WHERE titulo = ?`;
  db.get(sql, [tituloLibro], (err, row) => {
    if (err) {
      return res.status(500).json({ message: "Error en la consulta de la base de datos", error: err.message });
    }

    if (!row) {
      return res.status(404).json({ message: "No se encontró un libro con el título proporcionado" });
    }

    const { id_libro, titulo } = row;

    // Mostrar los detalles del libro
    console.log("Libro agregado a la lista personal:");
    console.log(`Titulo: ${titulo}`);

    // Llamar a guardar el progreso
    guardarProgreso(userId, id_libro, fecha_lec, 0)
      .then(() => {
        res.json({
          newBook: {
            id_libro,
            titulo,
            fecha_lectura: fecha_lec,
            pagina_actual: 0
          }
        });
        
      })
      .catch((err) => {
        res.status(500).json({ message: "Error al guardar el progreso del libro", error: err.message });
      });
  });
});


function guardarProgreso(id_cliente, id_libro, fecha_lec, pag_actual) {
  return new Promise((resolve, reject) => {
    // Insertar el progreso del libro en la tabla Progreso
    const sql = `INSERT INTO Progreso (id_cl, id_libro, fecha_lec, pag_actual) VALUES (?, ?, ?, ?)`;
    db.run(sql, [id_cliente, id_libro, fecha_lec, pag_actual], function (err) {
      if (err) {
        return reject(err);
      }

      console.log("Progreso del libro guardado correctamente.");
      resolve();
    });
  });
}



app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
