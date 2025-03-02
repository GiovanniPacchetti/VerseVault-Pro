import React, { useEffect, useState } from "react";
import MyList from "./MyList";
import SearchBook from "./SearchBook";

function Home({ userId, setIsLoggedIn, handleLogout }) { // Recibe handleLogout
  const [userData, setUserData] = useState(null);
  const [view, setView] = useState("home");

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
          <h2>Welcome, user {userId}!</h2>
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
            <button onClick={() => { handleLogout(); setView("home"); }}>Log Out</button> {/* Llamamos a handleLogout */}
          </div>
        </div>
      )}

      {view === "list" && (
        <div>
          <h3>Your Book List</h3>
          <MyList userId={userId} />
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
    </div>
  );
}

export default Home;
