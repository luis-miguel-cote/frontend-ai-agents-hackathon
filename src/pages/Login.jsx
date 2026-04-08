import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import logo from "../assets/logo.png";
function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();

        if (email === "usuario_demo@test.com" && password === "demohackatonciadetabril2026") {
            localStorage.setItem("user", email);
            navigate("/dashboard");
        } else {
            alert("Credenciales incorrectas");
        }
    };

    return (
        <div className="container">
            <form onSubmit={handleLogin} className="card">
                <img src={logo} alt="logo" className="logo" />
                <div className="title">ParchAI</div>

                <input
                    type="email"
                    placeholder="Correo"
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                />

                <input
                    type="password"
                    placeholder="Contraseña"
                    onChange={(e) => setPassword(e.target.value)}
                    className="input"
                />

                <button type="submit" className="button">
                    Ingresar
                </button>
            </form>
        </div>
    );
}

export default Login;