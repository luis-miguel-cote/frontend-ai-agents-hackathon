import { useState, useEffect } from "react";
import { BASE_URL, readProjectFile } from "../services/api";
import "../styles/ProjectPreview.css";

function ProjectPreview({ projectName, onClose }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasIndex, setHasIndex] = useState(true);
  const [fileList, setFileList] = useState([]);
  const previewUrl = `${BASE_URL}/proyectos_static/${encodeURIComponent(projectName)}/index.html`;

  useEffect(() => {
    // Verificar si existe index.html
    fetch(previewUrl, { method: "HEAD" })
      .then((res) => {
        if (!res.ok) setHasIndex(false);
        else setHasIndex(true);
      })
      .catch(() => setHasIndex(false));
    // Obtener lista de archivos
    fetch(`${BASE_URL}/proyectos`)
      .then((res) => res.json())
      .then((data) => {
        const proyecto = (data.proyectos || []).find((p) => p.nombre === projectName);
        setFileList(proyecto ? proyecto.archivos : []);
      });
  }, [projectName]);

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
            {hasIndex && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="preview-btn"
                title="Abrir en nueva pestaña"
              >
                ↗
              </a>
            )}
            <button className="preview-btn preview-close" onClick={onClose} title="Cerrar">
              ✕
            </button>
          </div>
        </div>
        {hasIndex ? (
          <iframe
            src={previewUrl}
            title="Project Preview"
            className="preview-iframe"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        ) : (
          <div className="preview-backend-msg">
            <p><strong>Este proyecto es solo backend o no tiene archivos visuales (index.html).</strong></p>
            <p>Puedes explorar y descargar los archivos generados:</p>
            <ul style={{ maxHeight: 300, overflowY: 'auto', marginTop: 12 }}>
              {fileList.map((file) => (
                <li key={file}>
                  <a
                    href={`${BASE_URL}/proyectos_static/${encodeURIComponent(projectName)}/${file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {file}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectPreview;
