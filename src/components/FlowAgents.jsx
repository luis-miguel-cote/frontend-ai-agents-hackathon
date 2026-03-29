import { useState } from "react";
import ReactFlow from "reactflow";
import "reactflow/dist/style.css";
import "../styles/FlowAgents.css";
const initialNodes = [
  { id: "1", data: { label: "👤 User" }, position: { x: 0, y: 100 } },
  { id: "2", data: { label: "🧠 Orchestrator" }, position: { x: 200, y: 100 } },
  { id: "3", data: { label: "📋 Requirement" }, position: { x: 400, y: 0 } },
  { id: "4", data: { label: "💻 Development" }, position: { x: 400, y: 200 } },
  { id: "5", data: { label: "🧪 QA" }, position: { x: 600, y: 100 } },
  { id: "6", data: { label: "🚀 Output" }, position: { x: 800, y: 100 } },
];

const initialEdges = [
  { id: "e1-2", source: "1", target: "2", animated: true },
  { id: "e2-3", source: "2", target: "3", animated: true },
  { id: "e2-4", source: "2", target: "4", animated: true },
  { id: "e3-5", source: "3", target: "5", animated: true },
  { id: "e4-5", source: "4", target: "5", animated: true },
  { id: "e5-6", source: "5", target: "6", animated: true },
];

function FlowAgents() {
  const [nodes, setNodes] = useState(initialNodes);

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  const updateNodeStatus = (id, status) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                label: `${node.data.label.split(" - ")[0]} - ${status.toUpperCase()}`
              },
              style: {
                background: "#020617",
                color: "white",
                border:
                  status === "processing"
                    ? "2px solid #facc15"
                    : status === "done"
                    ? "2px solid #22d3ee"
                    : "1px solid #1e293b",
                boxShadow:
                  status === "processing"
                    ? "0 0 15px #facc15"
                    : status === "done"
                    ? "0 0 20px #22d3ee"
                    : "none",
                borderRadius: "10px",
                padding: "10px",
                transition: "0.3s",
              },
            }
          : node
      )
    );
  };

  const runSimulation = async () => {
    // reset estados
    setNodes(initialNodes);

    await delay(500);

    updateNodeStatus("2", "processing");
    await delay(1200);
    updateNodeStatus("2", "done");

    updateNodeStatus("3", "processing");
    await delay(1200);
    updateNodeStatus("3", "done");

    updateNodeStatus("4", "processing");
    await delay(1200);
    updateNodeStatus("4", "done");

    updateNodeStatus("5", "processing");
    await delay(1200);
    updateNodeStatus("5", "done");

    updateNodeStatus("6", "processing");
    await delay(1200);
    updateNodeStatus("6", "done");
  };

  return (
    <div>
      {/* BOTÓN */}
      <button
        onClick={runSimulation}
        style={{
          marginBottom: "15px",
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          background: "linear-gradient(135deg, #22d3ee, #4ade80)",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        ▶ Ejecutar simulación
      </button>

      {/* FLOW */}
      <div
        style={{
          height: "500px",
          background: "radial-gradient(circle at top, #020617, #000)",
          borderRadius: "12px",
          padding: "10px",
        }}
      >
        <ReactFlow nodes={nodes} edges={initialEdges} fitView />
      </div>
    </div>
  );
}

export default FlowAgents;