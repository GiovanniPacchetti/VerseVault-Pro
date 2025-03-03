import React, { useEffect, useState, useRef } from "react";
import './ReadBook.css'; // Importar el archivo CSS

function ReadBook({ userId, bookName, currentPage, setView }) {
  const [bookContent, setBookContent] = useState("");
  const [leftPageContent, setLeftPageContent] = useState("");
  const [rightPageContent, setRightPageContent] = useState("");
  const [currentPageState, setCurrentPageState] = useState(currentPage);
  const [error, setError] = useState(null);
  const leftContentRef = useRef(null);
  const rightContentRef = useRef(null);

  // Cargar el libro desde el servidor
  const fetchBook = async () => {
    try {
      const response = await fetch(`http://localhost:5000/user/${userId}/books/content?bookName=${bookName}`);
      const data = await response.json();
      setBookContent(data.content);
    } catch (err) {
      setError("Error al cargar el libro.");
    }
  };

  useEffect(() => {
    fetchBook();
  }, []);

  // Mostrar contenido de las páginas actuales
  useEffect(() => {
    const adjustPageContent = () => {
      if (leftContentRef.current && rightContentRef.current) {
        const linesPerPage = 24; // Número inicial de líneas por página
        const lines = bookContent.split('\n');
        const startLeft = currentPageState * linesPerPage;
        let endLeft = startLeft + linesPerPage;
        const startRight = endLeft;
        let endRight = startRight + linesPerPage;

        const leftPageText = lines.slice(startLeft, endLeft).join('\n');
        const rightPageText = lines.slice(startRight, endRight).join('\n');
        setLeftPageContent(leftPageText);
        setRightPageContent(rightPageText);

        // Ajustar el contenido para que se ajuste al contenedor izquierdo
        const { scrollHeight: leftScrollHeight, clientHeight: leftClientHeight } = leftContentRef.current;
        while (leftContentRef.current.scrollHeight > leftContentRef.current.clientHeight && endLeft > startLeft) {
          endLeft--;
          setLeftPageContent(lines.slice(startLeft, endLeft).join('\n'));
        }

        // Ajustar el contenido para que se ajuste al contenedor derecho
        const { scrollHeight: rightScrollHeight, clientHeight: rightClientHeight } = rightContentRef.current;
        while (rightContentRef.current.scrollHeight > rightContentRef.current.clientHeight && endRight > startRight) {
          endRight--;
          setRightPageContent(lines.slice(startRight, endRight).join('\n'));
        }
      }
    };

    adjustPageContent();
  }, [bookContent, currentPageState]);

  const handleNextPage = () => {
    setCurrentPageState(currentPageState + 2);
  };

  const handlePreviousPage = () => {
    if (currentPageState > 0) {
      setCurrentPageState(currentPageState - 2);
    }
  };

  const handleCloseBook = async () => {
    try {
      await fetch(`http://localhost:5000/user/${userId}/books/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, bookName, page: currentPageState }),
      });
      setView("list"); // Regresar a la lista de libros
    } catch (err) {
      setError("Error al guardar el progreso.");
    }
  };

  return (
    <div className="read-book-container">
      <h2>{bookName}</h2>
      <p>{error && `Error: ${error}`}</p>
      <div className="book-content">
        <div className="page-content" ref={leftContentRef}>
          <pre>{leftPageContent}</pre>
          <div className="page-number">Página {currentPageState + 1}</div>
        </div>
        <div className="page-content" ref={rightContentRef}>
          <pre>{rightPageContent}</pre>
          <div className="page-number">Página {currentPageState + 2}</div>
        </div>
      </div>
      <div className="navigation-buttons">
        <button onClick={handlePreviousPage}>Anterior</button>
        <button onClick={handleNextPage}>Siguiente</button>
        <button onClick={handleCloseBook}>Cerrar libro</button>
      </div>
    </div>
  );
}

export default ReadBook;