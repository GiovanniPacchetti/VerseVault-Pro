import { useState } from "react";
import logo from "./logo/Adobe Express - file (1).png";
import "./App.css";
import Home from "./Home"; // Import the new component

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setIsLoggedIn(true);  // Set logged in state to true
        setUserId(data.userId);  // Set user ID
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage("Server error");
    }
  };

  return (
    <div>
      {isLoggedIn ? (
        <Home userId={userId} setIsLoggedIn={setIsLoggedIn} />  // Pasamos la función de logout
      ) : (
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <br />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <br />
              <button type="submit">Login</button>
            </form>
            {message && <p>{message}</p>}
          </header>
        </div>
      )}
    </div>
  );
}

export default App;
