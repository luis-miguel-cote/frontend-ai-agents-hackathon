import { useEffect, useRef } from "react";
import "../styles/LogsPanel.css";

function LogsPanel({ logs }) {
  const endRef = useRef(null);

  useEffect(() => {
    if (logs.length > 0) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  return (
    <div className="logs-container">
      <div className="logs-box">
        {logs.map((log, index) => (
          <div key={index} className={`log-entry ${log.type}`}>
            <span className="log-dot" />
            <div className="log-message">
              <strong>{log.type.toUpperCase()}</strong>
              <span>{log.message}</span>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}

export default LogsPanel;