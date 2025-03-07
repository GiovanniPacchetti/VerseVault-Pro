import React, { useEffect, useState, useRef } from "react";
import './ReadBook.css';

function ReadBook({ userId, bookName, currentPage, setView }) {
  const [bookContent, setBookContent] = useState("");
  const [leftPageContent, setLeftPageContent] = useState("");
  const [rightPageContent, setRightPageContent] = useState("");
  const [currentPageState, setCurrentPageState] = useState(currentPage || 0);
  const [error, setError] = useState(null);
  const [addingBookmark, setAddingBookmark] = useState(false);
  const [bookmarkPage, setBookmarkPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const leftContentRef = useRef(null);
  const rightContentRef = useRef(null);

  // Load book from server
  const fetchBook = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://versevault-pro.onrender.com/user/${userId}/books/content?bookName=${bookName}`);
      
      if (!response.ok) {
        throw new Error("Failed to retrieve the tome.");
      }
      
      const data = await response.json();
      setBookContent(data.content);
      
      // If there's a bookmark, open to the bookmark page
      if (data.bookmarkPage) {
        setCurrentPageState(data.bookmarkPage % 2 === 0 ? data.bookmarkPage - 1 : data.bookmarkPage);
        setBookmarkPage(data.bookmarkPage);
      }
    } catch (err) {
      setError(err.message || "Failed to summon the tome.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBook();
  }, [userId, bookName]);

  // Display content of current pages
  useEffect(() => {
    const adjustPageContent = () => {
      if (!bookContent || !leftContentRef.current || !rightContentRef.current) return;
      
      const linesPerPage = 10; // Initial number of lines per page
      const lines = bookContent.split('\n');
      const startLeft = currentPageState * linesPerPage;
      let endLeft = startLeft + linesPerPage;
      const startRight = endLeft;
      let endRight = startRight + linesPerPage;

      const leftPageText = lines.slice(startLeft, endLeft).join('\n');
      const rightPageText = lines.slice(startRight, endRight).join('\n');
      setLeftPageContent(leftPageText);
      setRightPageContent(rightPageText);

      // Adjust content to fit left container
      while (leftContentRef.current.scrollHeight > leftContentRef.current.clientHeight && endLeft > startLeft) {
        endLeft--;
        setLeftPageContent(lines.slice(startLeft, endLeft).join('\n'));
      }

      // Adjust content to fit right container
      while (rightContentRef.current.scrollHeight > rightContentRef.current.clientHeight && endRight > startRight) {
        endRight--;
        setRightPageContent(lines.slice(startRight, endRight).join('\n'));
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
      const pageToSave = bookmarkPage !== null ? bookmarkPage : currentPageState;
      await fetch(`https://versevault-pro.onrender.com/user/${userId}/books/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, bookName, page: pageToSave }),
      });
      setView("list"); // Return to book list
    } catch (err) {
      setError("Failed to save your progress.");
    }
  };

  const handleAddBookmark = () => {
    setAddingBookmark(true);
  };

  const handlePageClick = async (page) => {
    if (addingBookmark) {
      setBookmarkPage(page);
      setAddingBookmark(false);
      try {
        await fetch(`https://versevault-pro.onrender.com/user/${userId}/books/bookmark`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, bookName, page }),
        });
      } catch (err) {
        setError("Failed to place the bookmark.");
      }
    }
  };

  if (loading) {
    return (
      <div className="view-container">
        <div className="loading-indicator">
          <div className="loading-symbol"></div>
          <p>Deciphering ancient script...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="view-container readbook-container">
      <h2 className="view-title tome-name">{bookName}</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="tome-display">
        <div className="tome-spine"></div>
        
        <div 
          className={`tome-page left-page ${addingBookmark ? 'adding-bookmark' : ''}`} 
          ref={leftContentRef} 
          onClick={() => handlePageClick(currentPageState + 1)}
        >
          <div className="page-content">
            <pre>{leftPageContent}</pre>
          </div>
          <div className="page-number">{currentPageState + 1}</div>
          {bookmarkPage === currentPageState + 1 && (
            <div className="bookmark-indicator left"></div>
          )}
        </div>
        
        <div 
          className={`tome-page right-page ${addingBookmark ? 'adding-bookmark' : ''}`} 
          ref={rightContentRef} 
          onClick={() => handlePageClick(currentPageState + 2)}
        >
          <div className="page-content">
            <pre>{rightPageContent}</pre>
          </div>
          <div className="page-number">{currentPageState + 2}</div>
          {bookmarkPage === currentPageState + 2 && (
            <div className="bookmark-indicator right"></div>
          )}
        </div>
      </div>
      
      {addingBookmark && (
        <div className="bookmark-prompt">
          Click on a page to place your bookmark
        </div>
      )}
      
      <div className="tome-navigation">
        <button 
          className="nav-button previous-button" 
          onClick={handlePreviousPage}
          disabled={currentPageState <= 0}
        >
          Previous
        </button>
        
        <button 
          className="nav-button bookmark-button" 
          onClick={handleAddBookmark}
        >
          {bookmarkPage !== null ? "Move Bookmark" : "Add Bookmark"}
        </button>
        
        <button 
          className="nav-button close-button" 
          onClick={handleCloseBook}
        >
          Close Tome
        </button>
        
        <button 
          className="nav-button next-button" 
          onClick={handleNextPage}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default ReadBook;