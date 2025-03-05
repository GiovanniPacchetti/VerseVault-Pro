import React ,{useState } from "react";

function SearchBook() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    // Send request to the backend to search for books
    console.log("Searching for:", searchQuery);
  };

  return (
    <div>
      <h2>Search a Book</h2>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Enter book title"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <br />
        <button type="submit">Search</button>
      </form>
      <div>
        <h3>Results:</h3>
        <ul>
          {searchResults.map((book, index) => (
            <li key={index}>{book}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default SearchBook;
