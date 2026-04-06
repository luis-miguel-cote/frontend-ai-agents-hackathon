import { useState } from "react";
import { BASE_URL } from "../services/api";
import "../styles/ProjectPreview.css";

function ProjectPreview({ projectName, onClose }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const previewUrl = `${BASE_URL}/proyectos_static/${encodeURIComponent(projectName)}/index.html`;

  return (
    <div className={`preview-overlay ${isFullscreen ? "preview-fullscreen" : ""}`}>
      <div className="preview-modal">
        <div className="preview-header">
          <h3>Vista previa del proyecto</h3>
          <div className="preview-actions">
            <button
              className="preview-btn"
              title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
              onClick={() => setIsFullscreen((prev) => !prev)}
            >
              {isFullscreen ? "⬜" : "⛶"}
            </button>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="preview-btn"
              title="Abrir en nueva pestaña"
            >
              ↗
            </a>
            <button className="preview-btn preview-close" onClick={onClose} title="Cerrar">
              ✕
            </button>
          </div>
        </div>
        <iframe
          src={previewUrl}
          title="Project Preview"
          className="preview-iframe"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </div>
    </div>
  );
}

export default ProjectPreview;
