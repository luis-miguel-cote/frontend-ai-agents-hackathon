import { useEffect, useRef, useState } from "react";
import "../styles/LogsPanel.css";
function LogsPanel({ logs }) {
  const endRef = useRef(null);
  const [hasAutoScrolled, setHasAutoScrolled] = useState(false);

  useEffect(() => {
    if (!hasAutoScrolled && logs.length > 0) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
      setHasAutoScrolled(true); // 🔥 solo una vez
    }
  }, [logs, hasAutoScrolled]);

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