import React, { useEffect, useState } from "react";

function MyList({ userId, setView, setCurrentBook }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookName, setBookName] = useState("");
  const [authorName, setAuthorName] = useState(""); // Nuevo estado para el autor
  const [showInput, setShowInput] = useState(false);
  const [actionType, setActionType] = useState("");

  // Obtener libros del servidor
  const fetchBooks = async () => {
    try {
      const response = await fetch(`http://localhost:5000/user/${userId}/books`);
      if (!response.ok) {
        throw new Error(response.status === 404 ? "No se encontraron libros para este usuario." : "Error al obtener los libros.");
      }
      const data = await response.json();
      setBooks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (books.length === 0) return <div>No hay libros en tu lista.</div>;

  // Función para descargar libros
  const handleDownloadBook = async (bookName, authorName) => {
    try {
      const response = await fetch(`http://localhost:5000/user/${userId}/books/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookName, authorName }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Descarga completada. Revisa la carpeta 'libros'.");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Error al descargar el libro.");
    }
  };

  // Otras funciones (Eliminar, Agregar, Leer)
  const handleDeleteBook = async (bookName) => {
    try {
      const response = await fetch(`http://localhost:5000/user/${userId}/books/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookName }),
      });

      const data = await response.json();
      if (response.ok) {
        setBooks((prevBooks) => prevBooks.filter((book) => book.titulo !== bookName));
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Error al eliminar el libro.");
    }
  };

  const handleAddBook = async (bookName) => {
    try {
      const response = await fetch(`http://localhost:5000/addBook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, tituloLibro: bookName, fecha_lec: new Date().toISOString().split("T")[0] }),
      });

      const data = await response.json();
      if (response.ok) {
        setBooks((prevBooks) => [...prevBooks, data.newBook]);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Error al agregar el libro.");
    }
  };

  const handleReadBook = (bookName, currentPage) => {
    setCurrentBook({ bookName, currentPage });
    setView("readBook");
  };

  // Mostrar input según la acción
  const handleButtonClick = (type) => {
    setActionType(type);
    setShowInput(true);
  };

  // Ejecutar la acción correspondiente
  const handleAction = () => {
    if (!bookName) {
      setError("Por favor, ingresa el nombre del libro.");
      return;
    }

    if (actionType === "download" && !authorName) {
      setError("Por favor, ingresa el nombre del autor.");
      return;
    }

    if (actionType === "add") {
      handleAddBook(bookName);
    } else if (actionType === "delete") {
      handleDeleteBook(bookName);
    } else if (actionType === "read") {
      handleReadBook(bookName, 0);  // Inicialmente, comenzamos desde la página 0
    } else if (actionType === "download") {
      handleDownloadBook(bookName, authorName);
    }

    setShowInput(false);
    setBookName("");
    setAuthorName("");
  };

  return (
    <div>
      <h2>Your Book List</h2>
      <ul>
        {books.map((book) => (
          <li key={book.id_libro}>
            <strong>{book.titulo}</strong>
            <br />
            Fecha de lectura: {book.fecha_lectura}
            <br />
            Página actual: {book.pagina_actual}
            <br />
            <button onClick={() => handleReadBook(book.titulo, book.pagina_actual)}>Leer</button>
          </li>
        ))}
      </ul>
      <div>
        <button onClick={() => handleButtonClick("add")}>Agregar libro a mi Lista</button>
        <button onClick={() => handleButtonClick("delete")}>Eliminar libro de mi Lista</button>
        <button onClick={() => handleButtonClick("download")}>Descargar libro</button>
      </div>
      {showInput && (
        <div>
          <input
            type="text"
            value={bookName}
            onChange={(e) => setBookName(e.target.value)}
            placeholder="Nombre del libro"
          />
          {actionType === "download" && (
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Nombre del autor"
            />
          )} 
          <button onClick={handleAction}>Confirmar</button>
        </div>
      )}
    </div>
  );
}

export default MyList;