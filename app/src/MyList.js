import React, { useEffect, useState } from "react";
import './MyList.css'; // Import CSS file

function MyList({ userId, setView, setCurrentBook }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookName, setBookName] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [actionType, setActionType] = useState("");
  const [downloadingBook, setDownloadingBook] = useState(null);

  // Fetch books from server
  const fetchBooks = async () => {
    try {
      const response = await fetch(`https://versevault-pro.onrender.com/user/${userId}/books`);
      if (!response.ok) {
        throw new Error(response.status === 404 
          ? "No books found for this user." 
          : "Error fetching books."
        );
      }
      const data = await response.json();

      // Check if books are downloaded
      const booksWithDownloadStatus = await Promise.all(
        data.map(async (book) => {
          const downloadResponse = await fetch(`https://versevault-pro.onrender.com/user/${userId}/books/${book.id_libro}/isDownloaded`);
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

  // Function to download books
  const handleDownloadBook = async (bookName, authorName) => {
    setDownloadingBook(bookName);
    try {
      const response = await fetch(`https://versevault-pro.onrender.com/user/${userId}/books/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookName, authorName }),
      });

      const data = await response.json();
      if (response.ok) {
        setBooks((prevBooks) =>
          prevBooks.map((book) =>
            book.titulo === bookName ? { ...book, descargado: true } : book
          )
        );
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Error downloading the book.");
    } finally {
      setDownloadingBook(null);
    }
  };

  // Delete book function
  const handleDeleteBook = async (bookName) => {
    try {
      const response = await fetch(`https://versevault-pro.onrender.com/user/${userId}/books/delete`, {
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
      setError("Error deleting the book.");
    }
  };

  // Add book function
  const handleAddBook = async (bookName) => {
    try {
      const response = await fetch(`https://versevault-pro.onrender.com/addBook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId, 
          tituloLibro: bookName, 
          fecha_lec: new Date().toISOString().split("T")[0] 
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setBooks((prevBooks) => [...prevBooks, data.newBook]);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Error adding the book.");
    }
  };

  // Read book function
  const handleReadBook = (bookName, currentPage) => {
    setCurrentBook({ bookName, currentPage });
    setView("readBook");
  };

  // Show input based on action
  const handleButtonClick = (type) => {
    setActionType(type);
    setShowInput(true);
  };

  // Execute corresponding action
  const handleAction = () => {
    if (!bookName) {
      setError("Please enter the book name.");
      return;
    }

    if (actionType === "add") {
      handleAddBook(bookName);
    } else if (actionType === "delete") {
      handleDeleteBook(bookName);
    }

    setShowInput(false);
    setBookName("");
  };

  // Loading state
  if (loading) {
    return (
      <div className="loading-indicator">
        <div className="loading-symbol"></div>
        <p>Searching the tome archives...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  // Empty books state
  if (books.length === 0) {
    return (
      <div className="view-container">
        <h2 className="view-title">Your Grimoire</h2>
        <div className="empty-list">
          <p>Your collection of tomes is empty.</p>
          <button 
            className="action-button" 
            onClick={() => handleButtonClick("add")}
          >
            Add your first tome
          </button>
        </div>
        {showInput && (
          <div className="input-container">
            <input
              type="text"
              value={bookName}
              onChange={(e) => setBookName(e.target.value)}
              placeholder="Enter the title of your tome"
              className="tome-input"
            />
            <button className="action-button" onClick={handleAction}>
              Confirm
            </button>
          </div>
        )}
        <button className="back-button" onClick={() => setView("home")}>
          Return
        </button>
      </div>
    );
  }

  return (
    <div className="view-container mylist-container">
      <h2 className="view-title">Your Grimoire</h2>
      
      <ul className="tome-list">
        {books.map((book) => (
          <li key={book.id_libro} className="tome-item">
            <div className="tome-header">
              <h3 className="tome-title">{book.titulo}</h3>
              <span className="tome-author">{book.autor}</span>
            </div>
            
            <div className="tome-details">
              <div className="detail-row">
                <span className="detail-label">Last reading:</span>
                <span className="detail-value">{book.fecha_lectura}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Current page:</span>
                <span className="detail-value">{book.pagina_actual}</span>
              </div>
            </div>
            
            <div className="tome-actions">
              {book.descargado ? (
                <button 
                  className="action-button read-button" 
                  onClick={() => handleReadBook(book.titulo, book.pagina_actual)}
                >
                  <span className="button-text">Read</span>
                </button>
              ) : (
                <div className="download-container">
                  <button 
                    className="action-button download-button" 
                    onClick={() => handleDownloadBook(book.titulo, book.autor)}
                    disabled={downloadingBook === book.titulo}
                  >
                    <span className="button-text">
                      {downloadingBook === book.titulo ? "Summoning..." : "Summon"}
                    </span>
                  </button>
                  {downloadingBook === book.titulo && (
                    <div className="loading-indicator small">
                      <div className="loading-symbol"></div>
                    </div>
                  )}
                </div>
              )}
              <button 
                className="action-button delete-button" 
                onClick={() => handleDeleteBook(book.titulo)}
              >
                <span className="button-text">Banish</span>
              </button>
            </div>
          </li>
        ))}
      </ul>
      
      <div className="list-actions">
        <button 
          className="action-button add-button" 
          onClick={() => handleButtonClick("add")}
        >
          <span className="button-text">Add Tome</span>
        </button>
      </div>
      
      {showInput && (
        <div className="input-container">
          <input
            type="text"
            value={bookName}
            onChange={(e) => setBookName(e.target.value)}
            placeholder="Enter the title of your tome"
            className="tome-input"
          />
          <button 
            className="action-button confirm-button" 
            onClick={handleAction}
          >
            <span className="button-text">Confirm</span>
          </button>
        </div>
      )}
      
      <button className="back-button" onClick={() => setView("home")}>
        Return
      </button>
    </div>
  );
}

export default MyList;