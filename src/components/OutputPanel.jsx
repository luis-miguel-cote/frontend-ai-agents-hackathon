function OutputPanel({ output, loading }) {
  return (
    <div style={{
      marginTop: "20px",
      padding: "15px",
      borderRadius: "10px",
      background: "#020617",
      border: "1px solid rgba(34, 211, 238, 0.2)"
    }}>
      <h3>📦 Output del sistema</h3>

      {loading ? (
        <p style={{ color: "#22d3ee", animation: "pulse 1s infinite" }}>
          🤖 Generando resultado...
        </p>
      ) : output ? (
        <pre style={{
          whiteSpace: "pre-wrap",
          fontSize: "12px",
          color: "#22d3ee"
        }}>
          {output}
        </pre>
      ) : (
        <p style={{ opacity: 0.5 }}>
          Ejecuta la simulación para generar el resultado 🚀
        </p>
      )}
    </div>
  );
}

export default OutputPanel;