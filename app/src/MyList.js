import React from "react";

function MyList({ userId }) {
  return (
    <div>
      <h2>Your List</h2>
      <p>Displaying your list of books for user {userId}.</p>
      {/* You can fetch and display the user's list of books here */}
    </div>
  );
}

export default MyList;
