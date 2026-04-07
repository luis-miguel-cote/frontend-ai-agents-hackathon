import { BASE_URL } from "../services/api";

function OutputPanel({ resultado, rutaProyecto, loading }) {
  const downloadUrl = rutaProyecto
    ? `${BASE_URL}/proyecto/${encodeURIComponent(rutaProyecto)}/descargar`
    : null;

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
      ) : resultado ? (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            <div>
              <p style={{ margin: "4px 0", color: "#94a3b8", fontSize: "12px" }}>Proyecto</p>
              <p style={{ margin: 0, color: "#e2e8f0", fontWeight: "bold" }}>{resultado.nombre}</p>
            </div>
            <div>
              <p style={{ margin: "4px 0", color: "#94a3b8", fontSize: "12px" }}>Tipo</p>
              <p style={{ margin: 0, color: "#e2e8f0" }}>{resultado.tipo_proyecto || "-"}</p>
            </div>
            <div>
              <p style={{ margin: "4px 0", color: "#94a3b8", fontSize: "12px" }}>Archivos generados</p>
              <p style={{ margin: 0, color: "#e2e8f0" }}>{resultado.archivos?.length ?? 0}</p>
            </div>
            <div>
              <p style={{ margin: "4px 0", color: "#94a3b8", fontSize: "12px" }}>QA</p>
              <p style={{
                margin: 0,
                color: resultado.qa?.verdict === "PASS" ? "#4ade80" : "#fb7185",
                fontWeight: "bold"
              }}>
                {resultado.qa?.verdict || "-"} ({resultado.qa?.pass_rate ?? 0}%)
              </p>
            </div>
          </div>

          {resultado.archivos?.length > 0 && (
            <details style={{ marginBottom: "12px" }}>
              <summary style={{ cursor: "pointer", color: "#22d3ee", fontSize: "13px" }}>
                Ver lista de archivos ({resultado.archivos.length})
              </summary>
              <ul style={{ marginTop: "8px", paddingLeft: "18px" }}>
                {resultado.archivos.map((archivo) => (
                  <li key={archivo} style={{ fontSize: "12px", color: "#94a3b8" }}>{archivo}</li>
                ))}
              </ul>
            </details>
          )}

          {resultado.qa?.critical_issues?.length > 0 && (
            <details style={{ marginBottom: "12px" }}>
              <summary style={{ cursor: "pointer", color: "#fda4af", fontSize: "13px" }}>
                Issues críticos ({resultado.qa.critical_issues.length})
              </summary>
              <ul style={{ marginTop: "8px", paddingLeft: "18px" }}>
                {resultado.qa.critical_issues.map((issue, i) => (
                  <li key={i} style={{ fontSize: "12px", color: "#fda4af" }}>{issue}</li>
                ))}
              </ul>
            </details>
          )}

          <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
            {downloadUrl && (
              <a
                href={downloadUrl}
                download
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #22d3ee, #4ade80)",
                  color: "#020617",
                  fontWeight: "bold",
                  fontSize: "13px",
                  textDecoration: "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                ⬇ Descargar proyecto (.zip)
              </a>
            )}
          </div>
        </div>
      ) : (
        <p style={{ opacity: 0.5 }}>
          Ejecuta la simulación para generar el resultado 🚀
        </p>
      )}
    </div>
  );
}

export default OutputPanel;