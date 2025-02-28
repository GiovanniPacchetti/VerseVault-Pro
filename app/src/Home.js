import React, { useEffect, useState } from "react";

function Home({ userId }) {
  const [userData, setUserData] = useState(null);

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

  return (
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
    </div>
  );
}

export default Home;
