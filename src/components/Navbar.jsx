import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "15px",
      background: "#1e293b"
    }}>
      <h2>🤖 AI Dev Team</h2>
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  );
}

export default Navbar;