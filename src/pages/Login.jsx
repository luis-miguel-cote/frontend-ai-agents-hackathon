import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (email) {
      localStorage.setItem("user", email);
      navigate("/dashboard");
    }
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh"
    }}>
      <form onSubmit={handleLogin} style={{
        background: "#1e293b",
        padding: "40px",
        borderRadius: "12px"
      }}>
        <h2>Login</h2>

        <input
          type="email"
          placeholder="Correo"
          onChange={(e) => setEmail(e.target.value)}
        />

        <br /><br />

        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
}

export default Login;