import { BASE_URL } from "../services/api";

function OutputPanel({ resultado, rutaProyecto, loading }) {
  const downloadUrl = rutaProyecto
    ? `${BASE_URL}/proyecto/${encodeURIComponent(rutaProyecto)}/descargar`
    : null;

  return (
    <section className="section-card">
      <div className="card-header">
        <div>
          <p className="section-label">Output del sistema</p>
          <h3 className="section-title">Resultado final</h3>
        </div>
      </div>

      {loading ? (
        <div className="status-item" style={{ alignItems: 'center', gap: '12px' }}>
          <span className="spin-icon" role="img" aria-label="cargando">⏳</span>
          <span>Generando resultado...</span>
        </div>
      ) : resultado ? (
        <div className="status-summary">
          <div className="status-item">
            <div className="meta">Proyecto</div>
            <div className="value">{resultado.nombre}</div>
          </div>
          <div className="status-item">
            <div className="meta">Tipo</div>
            <div className="value">{resultado.tipo_proyecto || '-'}</div>
          </div>
          <div className="status-item">
            <div className="meta">Archivos generados</div>
            <div className="value">{resultado.archivos?.length ?? 0}</div>
          </div>
          <div className="status-item">
            <div className="meta">QA</div>
            <div className="value" style={{ color: resultado.qa?.verdict === 'PASS' ? 'var(--success)' : 'var(--danger)' }}>
              {resultado.qa?.verdict || '-'} ({resultado.qa?.pass_rate ?? 0}%)
            </div>
          </div>

          {resultado.archivos?.length > 0 && (
            <details style={{ marginBottom: '12px' }}>
              <summary style={{ cursor: 'pointer', color: 'var(--accent)', fontSize: '13px' }}>
                Ver lista de archivos ({resultado.archivos.length})
              </summary>
              <ul style={{ marginTop: '8px', paddingLeft: '18px' }}>
                {resultado.archivos.map((archivo) => (
                  <li key={archivo} style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{archivo}</li>
                ))}
              </ul>
            </details>
          )}

          {resultado.qa?.critical_issues?.length > 0 && (
            <details style={{ marginBottom: '12px' }}>
              <summary style={{ cursor: 'pointer', color: '#fda4af', fontSize: '13px' }}>
                Issues críticos ({resultado.qa.critical_issues.length})
              </summary>
              <ul style={{ marginTop: '8px', paddingLeft: '18px' }}>
                {resultado.qa.critical_issues.map((issue, i) => (
                  <li key={i} style={{ fontSize: '12px', color: '#fda4af' }}>{issue}</li>
                ))}
              </ul>
            </details>
          )}

          {downloadUrl && (
            <a
              href={downloadUrl}
              download
              className="button button-secondary"
              style={{ width: 'fit-content' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Descargar proyecto (.zip)
            </a>
          )}
        </div>
      ) : (
        <p style={{ opacity: 0.75, color: 'var(--text-muted)' }}>
          Ejecuta la simulación para generar el resultado.
        </p>
      )}
    </section>
  );
}

export default OutputPanel;