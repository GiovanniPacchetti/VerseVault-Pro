import React, { useEffect, useState } from "react";

function MyList({ userId }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookName, setBookName] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [actionType, setActionType] = useState("");

  // Función para obtener los libros del servidor
  const fetchBooks = async () => {
    try {
      const response = await fetch(`http://localhost:5000/user/${userId}/books`);

      // Verificamos si la respuesta no es exitosa
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("No se encontraron libros para este usuario.");
        } else if (response.status === 500) {
          throw new Error("Error en el servidor al intentar obtener los libros.");
        } else {
          throw new Error("Hubo un error desconocido.");
        }
      }

      const data = await response.json();
      setBooks(data); // Establecer los libros obtenidos
    } catch (err) {
      setError(err.message); // Manejar el error con un mensaje específico
    } finally {
      setLoading(false); // Termina la carga
    }
  };

  // Efecto para obtener los libros cuando el componente se monta
  useEffect(() => {
    fetchBooks();
  }, [userId]);

  // Mostrar información mientras carga
  if (loading) {
    return <div>Loading...</div>;
  }

  // Mostrar error si ocurre
  if (error) {
    return <div>Error: {error}</div>;
  }

  // Si no hay libros en la lista
  if (books.length === 0) {
    return <div>No hay libros en tu lista.</div>;
  }

  // Función para eliminar un libro de la lista
  const handleDeleteBook = async (bookName) => {
    try {
      const response = await fetch(`http://localhost:5000/user/${userId}/books/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookName }),
      });

      const data = await response.json();
      if (response.ok) {
        // Eliminar el libro de la lista en el frontend
        setBooks((prevBooks) => prevBooks.filter((book) => book.titulo !== bookName));
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Error al eliminar el libro.");
    }
  };

  // Función para agregar un libro a la lista
  const handleAddBook = async (bookName) => {
    try {
      const response = await fetch(`http://localhost:5000/addBook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, tituloLibro: bookName, fecha_lec: new Date().toISOString().split('T')[0] }),
      });
  
      const data = await response.json();
      if (response.ok) {
        // Añadir el libro a la lista con los datos completos
        setBooks((prevBooks) => [...prevBooks, data.newBook]);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Error al agregar el libro.");
    }
  };
  


  // Función para descargar un libro
  const handleDownloadBook = async (bookName) => {
    try {
      const response = await fetch(`http://localhost:5000/user/${userId}/books/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookName }),
      });

      const data = await response.json();
      if (response.ok) {
        setError(data.message); // Aquí puedes manejar la descarga (mostrar enlace o similar)
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Error al descargar el libro.");
    }
  };

  // Función para marcar un libro como leído
  const handleReadBook = async (bookName) => {
    try {
      const response = await fetch(`http://localhost:5000/user/${userId}/books/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookName }),
      });

      const data = await response.json();
      if (response.ok) {
        setBooks((prevBooks) => 
          prevBooks.map((book) =>
            book.titulo === bookName ? { ...book, leido: true } : book
          )
        );
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Error al marcar el libro como leído.");
    }
  };

  const handleButtonClick = (type) => {
    setActionType(type);
    setShowInput(true);
  };

  const handleAction = () => {
    if (bookName) {
      if (actionType === "add") {
        handleAddBook(bookName);
      } else if (actionType === "delete") {
        handleDeleteBook(bookName);
      } else if (actionType === "read") {
        handleReadBook(bookName);
      } else if (actionType === "download") {
        handleDownloadBook(bookName);
      }
    } else {
      setError("Libro no encontrado.");
    }
    setShowInput(false);
    setBookName("");
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
          </li>
        ))}
      </ul>
      <div>
        <button onClick={() => handleButtonClick("add")}>Agregar libro a mi Lista</button>
        <button onClick={() => handleButtonClick("delete")}>Eliminar libro de mi Lista</button>
        <button onClick={() => handleButtonClick("read")}>Leer libro</button>
        <button onClick={() => handleButtonClick("download")}>Descargar libro</button>
      </div>
      {showInput && (
        <div>
          <input
            type="text"
            value={bookName}
            onChange={(e) => setBookName(e.target.value)}
            placeholder="Escribe el nombre del libro"
          />
          <button onClick={handleAction}>Confirmar</button>
        </div>
      )}
    </div>
  );
}

export default MyList;