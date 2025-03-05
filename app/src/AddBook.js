import React, { useState } from "react";

function AddBook() {
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");

  const handleAddBook = async (e) => {
    e.preventDefault();
    // Send request to the backend to add the book (you need to set up this API)
    console.log("Book Added:", bookTitle, bookAuthor);
  };

  return (
    <div>
      <h2>Add a New Book</h2>
      <form onSubmit={handleAddBook}>
        <input
          type="text"
          placeholder="Book Title"
          value={bookTitle}
          onChange={(e) => setBookTitle(e.target.value)}
        />
        <br />
        <input
          type="text"
          placeholder="Book Author"
          value={bookAuthor}
          onChange={(e) => setBookAuthor(e.target.value)}
        />
        <br />
        <button type="submit">Add Book</button>
      </form>
    </div>
  );
}

export default AddBook;
