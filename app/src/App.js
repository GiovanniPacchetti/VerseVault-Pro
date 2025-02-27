import { useState } from "react";
import logo from "./logo/Adobe Express - file (1).png";
import "./App.css"; 

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === "user@example.com" && password === "password") {
      setMessage("Login successful!");
    } else {
      setMessage("Invalid email or password");
    }
  };

  return (
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
  );
}

export default App;
  
/*  In the code above, we have created a simple login form with email and password fields. We have used the  useState  hook to create state variables for email, password, and message. The  handleLogin  function is called when the form is submitted. It checks if the email and password match the hardcoded values and sets the message accordingly. 
  Now, let’s run the application and see the login form in action. 
  Run the React Application 
  To run the React application, execute the following command in the terminal: 
  npm start
  
  This will start the development server and open the application in the default web browser. You should see the login form with email and password fields. 
  Enter the email and password as */