import React, { useEffect, useState } from "react";
import MyList from "./MyList"; // Import your MyList component
import AddBook from "./AddBook"; // Import your AddBook component

function Home({ userId }) {
  const [userData, setUserData] = useState(null);
  const [view, setView] = useState("home"); // This will track the current view

  useEffect(() => {
    // Example: Fetching additional user data after login
    const fetchUserData = async () => {
      const response = await fetch(`http://localhost:5000/user/${userId}`);
      const data = await response.json();
      setUserData(data);
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  // Handlers for button actions
  const handleViewList = () => {
    setView("list"); // Set the view to show the user's list
  };

  const handleAddBook = () => {
    setView("addBook"); // Set the view to add a book
  };

  const handleGoBack = () => {
    setView("home"); // Go back to the home view
  };

  return (
    <div>
      {view === "home" && (
        <div>
          <h2>Welcome, user {userId}!</h2>
          {userData ? (
            <div>
              <p>Email: {userData.email}</p>
              <p>Member since: {userData.xº}</p>
              {/* Display other user data */}
            </div>
          ) : (
            <p>Loading your data...</p>
          )}

          {/* Buttons */}
          <div>
            <button onClick={handleViewList}>See My List</button>
            <button onClick={handleAddBook}>Add a Book</button>
          </div>
        </div>
      )}

      {view === "list" && (
        <div>
          <h3>Your Book List</h3>
          <MyList userId={userId} /> {/* Render your MyList component */}
          <button onClick={handleGoBack}>Go Back</button>
        </div>
      )}

      {view === "addBook" && (
        <div>
          <h3>Add a Book</h3>
          <AddBook userId={userId} /> {/* Render your AddBook component */}
          <button onClick={handleGoBack}>Go Back</button>
        </div>
      )}
    </div>
  );
}

export default Home;
