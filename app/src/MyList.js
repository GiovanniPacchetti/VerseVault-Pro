import React, { useEffect, useState } from "react";
import loadingGif from './assets/logo/loading.gif'; // Importar el GIF de carga

function MyList({ userId, setView, setCurrentBook }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookName, setBookName] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [actionType, setActionType] = useState("");
  const [downloadingBook, setDownloadingBook] = useState(null); // Estado para el libro que se está descargando

  // Obtener libros del servidor
  const fetchBooks = async () => {
    try {
      const response = await fetch(`http://localhost:5000/user/${userId}/books`);
      if (!response.ok) {
        throw new Error(response.status === 404 ? "No se encontraron libros para este usuario." : "Error al obtener los libros.");
      }
      const data = await response.json();

      // Verificar si los libros están descargados
      const booksWithDownloadStatus = await Promise.all(
        data.map(async (book) => {
          const downloadResponse = await fetch(`http://localhost:5000/user/${userId}/books/${book.id_libro}/isDownloaded`);
          const downloadData = await downloadResponse.json();
          return { ...book, descargado: downloadData.isDownloaded };
        })
      );

      setBooks(booksWithDownloadStatus);
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
    setDownloadingBook(bookName); // Mostrar el GIF de carga
    try {
      const response = await fetch(`http://localhost:5000/user/${userId}/books/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookName, authorName }),
      });

      const data = await response.json();
      if (response.ok) {
        //alert("Descarga completada. Revisa la carpeta 'libros'.");
        setBooks((prevBooks) =>
          prevBooks.map((book) =>
            book.titulo === bookName ? { ...book, descargado: true } : book
          )
        );
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Error al descargar el libro.");
    } finally {
      setDownloadingBook(null); // Ocultar el GIF de carga
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

    if (actionType === "add") {
      handleAddBook(bookName);
    } else if (actionType === "delete") {
      handleDeleteBook(bookName);
    } else if (actionType === "read") {
      handleReadBook(bookName, 0);  // Inicialmente, comenzamos desde la página 0
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
            <strong>{book.titulo}</strong> - {book.autor}
            <br />
            Fecha de lectura: {book.fecha_lectura}
            <br />
            Página actual: {book.pagina_actual}
            <br />
            {book.descargado ? (
              <button onClick={() => handleReadBook(book.titulo, book.pagina_actual)}>Leer</button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <button onClick={() => handleDownloadBook(book.titulo, book.autor)}>Descargar</button>
                {downloadingBook === book.titulo && <img src={loadingGif} alt="Loading..." style={{ width: '20px', marginLeft: '10px' }} />}
              </div>
            )}
          </li>
        ))}
      </ul>
      <div>
        <button onClick={() => handleButtonClick("add")}>Agregar libro a mi Lista</button>
        <button onClick={() => handleButtonClick("delete")}>Eliminar libro de mi Lista</button>
      </div>
      {showInput && (
        <div>
          <input
            type="text"
            value={bookName}
            onChange={(e) => setBookName(e.target.value)}
            placeholder="Nombre del libro"
          />
          <button onClick={handleAction}>Confirmar</button>
        </div>
      )}
    </div>
  );
}

export default MyList;