import React, { useEffect, useState } from "react";
import MyList from "./MyList";
import SearchBook from "./SearchBook";
import ReadBook from "./ReadBook"; // Importar ReadBook

function Home({ userId, setIsLoggedIn, handleLogout }) {
  const [userData, setUserData] = useState(null);
  const [view, setView] = useState("home");
  const [currentBook, setCurrentBook] = useState(null); // Estado para el libro actual

  useEffect(() => {
    const fetchUserData = async () => {
      const response = await fetch(`http://localhost:5000/user/${userId}`);
      const data = await response.json();
      setUserData(data);
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  return (
    <div>
      {view === "home" && (
        <div>
          <h2>Welcome, {userData ? userData.name : "Guest"}!</h2>
          {userData ? (
            <div>
              <p>Email: {userData.email}</p>
              <p>Member since: {userData.dateJoined}</p>
            </div>
          ) : (
            <p>Loading your data...</p>
          )}
          <div>
            <button onClick={() => setView("list")}>See My List</button>
            <button onClick={() => setView("searchBook")}>Search a Book</button>
            <button onClick={() => { handleLogout(); setView("home"); }}>Log Out</button>
          </div>
        </div>
      )}

      {view === "list" && (
        <div>
          <h3>Your Book List</h3>
          <MyList userId={userId} setView={setView} setCurrentBook={setCurrentBook} />
          <button onClick={() => setView("home")}>Go Back</button>
        </div>
      )}

      {view === "searchBook" && (
        <div>
          <h3>Search a Book</h3>
          <SearchBook userId={userId} />
          <button onClick={() => setView("home")}>Go Back</button>
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