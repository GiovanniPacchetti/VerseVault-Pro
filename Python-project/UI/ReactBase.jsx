import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useState } from "react";
import "./App.css";

function Navbar() {
  return (
    <nav className="navbar">
      <h1>Librería Virtual</h1>
      <ul>
        <li><Link to="/">Inicio</Link></li>
        <li><Link to="/login">Iniciar Sesión</Link></li>
      </ul>
    </nav>
  );
}

function Home() {
  return <h2>Bienvenido a la Librería Virtual</h2>;
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Email:", email, "Password:", password);
  };

  return (
    <div className="login-container">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}
