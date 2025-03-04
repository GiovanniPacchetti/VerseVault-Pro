const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bcrypt = require("bcrypt");
const fs = require("fs");
const fetch = require("node-fetch");
const path = require("path");

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

const downloadBook = async (bookName, authorName) => {
  try {
    // Construir la URL de búsqueda en Gutendex
    const query = `http://gutendex.com/books/?search=${encodeURIComponent(bookName)}%20${encodeURIComponent(authorName)}`;
    const response = await fetch(query);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      throw new Error("No se encontró el libro en la API de Gutenberg.");
    }

    // Obtener el enlace del archivo de texto en formato UTF-8
    const bookData = data.results[0];
    const txtUrl = bookData.formats["text/plain; charset=us-ascii"];

    if (!txtUrl) {
      throw new Error("No se encontró un enlace válido para descargar el libro.");
    }

    // Descargar el contenido del libro
    const bookResponse = await fetch(txtUrl);
    const bookContent = await bookResponse.text();

    // Crear la carpeta "libros" si no existe
    const dirPath = path.join(__dirname, "libros");
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Guardar el archivo en la carpeta "libros"
    const filePath = path.join(dirPath, `${bookData.title}.txt`);
    fs.writeFileSync(filePath, bookContent, "utf8");

    console.log(`Libro guardado en: ${filePath}`);
    return { message: "Libro descargado con éxito", filePath };
  } catch (error) {
    console.error("Error al descargar el libro:", error.message);
    throw error;
  }
};

// **Nuevo endpoint para la descarga**
app.post("/user/:userId/books/download", async (req, res) => {
  const { bookName, authorName } = req.body;

  if (!bookName || !authorName) {
    return res.status(400).json({ message: "Se requiere el nombre del libro y el autor" });
  }

  try {
    const result = await downloadBook(bookName, authorName);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// **Nuevo endpoint para verificar si un libro está descargado**
app.get("/user/:userId/books/:bookId/isDownloaded", (req, res) => {
  const { bookId } = req.params;

  // Obtener el título del libro basado en el ID
  const sqlGetBookTitle = `SELECT titulo FROM Libro WHERE id_libro = ?`;
  db.get(sqlGetBookTitle, [bookId], (err, row) => {
    if (err) {
      return res.status(500).json({ message: "Error al buscar el libro en la base de datos", error: err.message });
    }

    if (!row) {
      return res.status(404).json({ message: "No se encontró un libro con ese ID" });
    }

    const bookTitle = row.titulo;
    const filePath = path.join(__dirname, "libros", `${bookTitle}.txt`);

    if (fs.existsSync(filePath)) {
      res.json({ isDownloaded: true });
    } else {
      res.json({ isDownloaded: false });
    }
  });
});

app.get("/user/:userId", (req, res) => {
  const { userId } = req.params;

  const sql = "SELECT nom_cl, email_cl, fecha_n_cl FROM Cliente WHERE id_cl = ?";
  db.get(sql, [userId], (err, row) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err.message });
    }

    if (!row) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      name: row.nom_cl,
      email: row.email_cl,
      dateJoined: row.fecha_n_cl
    });
  });
});

app.get("/user/:userId/books", (req, res) => {
  const { userId } = req.params;
  let books = [];

  // Consulta para obtener los libros del cliente
  const sql = `
    SELECT p.id_libro, p.fecha_lec, p.pag_actual, l.titulo, a.nom_autor
    FROM Progreso p
    JOIN Libro l ON p.id_libro = l.id_libro
    JOIN Autor a ON l.id_autor = a.id_autor
    WHERE p.id_cl = ?;
  `;
  db.all(sql, [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Error en la consulta de la base de datos", error: err.message });
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: "No se encontraron libros para este usuario." });
    }

    books = rows.map(row => ({
      id_libro: row.id_libro,
      titulo: row.titulo,
      autor: row.nom_autor,
      fecha_lectura: row.fecha_lec,
      pagina_actual: row.pag_actual
    }));

    res.json(books);
  });
});

app.delete("/user/:userId/books/delete", (req, res) => {
  const { userId } = req.params;
  const { bookName } = req.body;

  // Obtener el ID del libro basado en el título
  const sqlGetBookId = `SELECT id_libro FROM Libro WHERE titulo = ?`;
  db.get(sqlGetBookId, [bookName], (err, row) => {
    if (err) {
      return res.status(500).json({ message: "Error al buscar el libro en la base de datos", error: err.message });
    }

    if (!row) {
      return res.status(404).json({ message: "No se encontró un libro con ese título" });
    }

    const bookId = row.id_libro;

    // Eliminar el libro de la lista de progreso del usuario
    const sqlDeleteBook = `DELETE FROM Progreso WHERE id_cl = ? AND id_libro = ?`;
    db.run(sqlDeleteBook, [userId, bookId], function (err) {
      if (err) {
        return res.status(500).json({ message: "Error al eliminar el libro de la lista", error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: "El libro no estaba en la lista del usuario" });
      }

      res.json({ message: "Libro eliminado correctamente" });
    });
  });
});

// Endpoint para obtener el contenido de un libro
app.get("/user/:userId/books/content", (req, res) => {
  const { bookName } = req.query;

  // Construir la ruta del archivo
  const filePath = path.join(__dirname, "libros", `${bookName}.txt`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "Libro no encontrado." });
  }

  const content = fs.readFileSync(filePath, "utf8");
  res.json({ content });
});

// Endpoint para guardar el progreso del libro
app.post("/user/:userId/books/progress", (req, res) => {
  const { userId, bookName, page } = req.body;

  // Consultar si el libro existe
  const sqlGetBookId = `SELECT id_libro FROM Libro WHERE titulo = ?`;
  db.get(sqlGetBookId, [bookName], (err, row) => {
    if (err) {
      return res.status(500).json({ message: "Error al buscar el libro en la base de datos", error: err.message });
    }

    if (!row) {
      return res.status(404).json({ message: "Libro no encontrado." });
    }

    const bookId = row.id_libro;

    // Actualizar el progreso del libro en la tabla Progreso
    const sqlUpdateProgress = `UPDATE Progreso SET pag_actual = ? WHERE id_cl = ? AND id_libro = ?`;
    db.run(sqlUpdateProgress, [page, userId, bookId], function (err) {
      if (err) {
        return res.status(500).json({ message: "Error al actualizar el progreso", error: err.message });
      }

      res.json({ message: "Progreso actualizado correctamente" });
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