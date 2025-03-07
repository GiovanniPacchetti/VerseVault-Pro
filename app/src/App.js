import { useState } from "react";
import logo from "./assets/logo/Adobe Express - file (1).png";
import "./App.css";
import Home from "./Home";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("https://versevault-pro.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setIsLoggedIn(true);
        setUserId(data.userId);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage("Connection error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setEmail("");
    setPassword("");
    setIsLoggedIn(false);
    setMessage("");
  };

  return (
    <div>
      {isLoggedIn ? (
        <Home userId={userId} setIsLoggedIn={setIsLoggedIn} handleLogout={handleLogout} />
      ) : (
        <div className="login-container">
          <div className="login-card">
            <div className="login-logo-container">
              <img src={logo} className="login-logo" alt="VerseVault Logo" />
            </div>
            
            <p className="login-subtitle">Enter the Struggle</p>
            
            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                  disabled={isLoading}
                />
              </div>
              
              {message && <div className="login-message">{message}</div>}
              
              <button 
                type="submit" 
                className="login-button"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Begin Journey"}
              </button>
            </form>
            
            <div className="login-options">
              <a href="#" className="login-link">Forgot Password?</a>
              <a href="#" className="login-link">Create Account</a>
            </div>
            
            <div className="login-footer">
              The Sanctuary for Strugglers
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;