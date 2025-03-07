import React, { useEffect, useState } from "react";
import MyList from "./MyList";
import SearchBook from "./SearchBook";
import ReadBook from "./ReadBook";
import "./Home.css";

function Home({ userId, setIsLoggedIn, handleLogout }) {
  const [userData, setUserData] = useState(null);
  const [view, setView] = useState("home");
  const [currentBook, setCurrentBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`https://versevault-pro.onrender.com/user/${userId}`);
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  return (
    <div className="home-container">
      <div className="brand-symbol"></div>

      {view === "home" && (
        <div className="home-content">
          <h2 className="home-title">Welcome to your Sanctuary, {userData ? userData.name : "Struggler"}</h2>
          
          {isLoading ? (
            <div className="loading-indicator">
              <div className="loading-symbol"></div>
              <p>Gathering your chronicles...</p>
            </div>
          ) : userData ? (
            <div className="user-info">
              <div className="user-card">
                <div className="user-detail">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{userData.email}</span>
                </div>
                <div className="user-detail">
                  <span className="detail-label">Member since:</span>
                  <span className="detail-value">{userData.dateJoined}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="error-message">Could not retrieve your data. Please try again.</p>
          )}
          
          <div className="home-actions">
            <button className="home-button my-books" onClick={() => setView("list")}>
              <span className="button-icon">📚</span>
              <span className="button-text">My Collection</span>
            </button>
            
            <button className="home-button search" onClick={() => setView("searchBook")}>
              <span className="button-icon">🔍</span>
              <span className="button-text">Discover Tomes</span>
            </button>
            
            <button className="home-button logout" onClick={() => { handleLogout(); setView("home"); }}>
              <span className="button-icon">⚔️</span>
              <span className="button-text">Return to Battle</span>
            </button>
          </div>
        </div>
      )}

      {view === "list" && (
        <div className="view-container">
          <h3 className="view-title">Your Collection of Tomes</h3>
          <MyList userId={userId} setView={setView} setCurrentBook={setCurrentBook} />
          <button className="back-button" onClick={() => setView("home")}>Return to Sanctuary</button>
        </div>
      )}

      {view === "searchBook" && (
        <div className="view-container">
          <h3 className="view-title">Discover New Chronicles</h3>
          <SearchBook userId={userId} />
          <button className="back-button" onClick={() => setView("home")}>Return to Sanctuary</button>
        </div>
      )}

      {view === "readBook" && currentBook && (
        <ReadBook
          userId={userId}
          bookName={currentBook.bookName}
          currentPage={currentBook.currentPage}
          setView={setView}
        />
      )}
    </div>
  );
}

export default Home;