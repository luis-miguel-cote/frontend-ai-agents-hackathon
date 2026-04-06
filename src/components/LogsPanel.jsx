import { useEffect, useRef, useState } from "react";
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
      <h3>🧠 System Logs</h3>

      <div className="logs-box">
        {logs.map((log, index) => (
          <div key={index} className={`log ${log.type}`}>
            {log.message}
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}

export default LogsPanel;