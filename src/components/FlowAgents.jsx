import { useEffect, useRef, useState } from "react";
import ReactFlow from "reactflow";
import "reactflow/dist/style.css";
import "../styles/FlowAgents.css";
import LogsPanel from "./LogsPanel";
import OutputPanel from "./OutputPanel";
import ProjectPreview from "./ProjectPreview";
import {
  startProject,
  answerProjectQuestions,
  generateProject,
  getProjectStatus,
} from "../services/api";

const initialNodes = [
  { id: "1", data: { label: "User" }, position: { x: 0, y: 100 } },
  { id: "2", data: { label: "Orchestrator" }, position: { x: 200, y: 100 } },
  { id: "3", data: { label: "Requirement" }, position: { x: 400, y: 0 } },
  { id: "4", data: { label: "Development" }, position: { x: 400, y: 200 } },
  { id: "5", data: { label: "QA" }, position: { x: 600, y: 100 } },
  { id: "6", data: { label: "Output" }, position: { x: 800, y: 100 } },
];

const initialEdges = [
  { id: "e1-2", source: "1", target: "2", animated: true },
  { id: "e2-3", source: "2", target: "3", animated: true },
  { id: "e2-4", source: "2", target: "4", animated: true },
  { id: "e3-5", source: "3", target: "5", animated: true },
  { id: "e4-5", source: "4", target: "5", animated: true },
  { id: "e5-6", source: "5", target: "6", animated: true },
];

function FlowAgents({ inputData }) {
  const [nodes, setNodes] = useState(initialNodes);
  const [logs, setLogs] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [preguntas, setPreguntas] = useState([]);
  const [answers, setAnswers] = useState({});
  const [requerimientos, setRequerimientos] = useState(null);
  const [readyToGenerate, setReadyToGenerate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState({ fase: "Esperando", porcentaje: 0, archivos_listos: [] });
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const [rutaProyecto, setRutaProyecto] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const pollRef = useRef(null);
  const lastFaseRef = useRef("");

  useEffect(() => {
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, []);

  const resetWorkflow = () => {
    setSessionId(null);
    setPreguntas([]);
    setAnswers({});
    setRequerimientos(null);
    setReadyToGenerate(false);
    setGenerating(false);
    setProgress({ fase: "Esperando", porcentaje: 0, archivos_listos: [] });
    setResultado(null);
    setRutaProyecto(null);
    setShowPreview(false);
    setError(null);
    setLogs([]);
    setNodes(initialNodes);
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const addLog = (message, type = "info") => {
    setLogs((prev) => [...prev, { message, type }]);
  };

  const updateNodeStatus = (id, status) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? {
              ...node,
              data: { label: `${node.data.label.split(" - ")[0]} - ${status.toUpperCase()}` },
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

  const updateNodeByPhase = (fase) => {
    if (fase.includes("Definiendo arquitectura") || fase.includes("Generando archivos")) {
      updateNodeStatus("4", "processing");
    }
    if (fase.includes("Validando calidad")) {
      updateNodeStatus("5", "processing");
    }
    if (fase.includes("Guardando proyecto") || fase.includes("Descargando imagenes")) {
      updateNodeStatus("6", "processing");
    }
    if (fase.includes("Completado")) {
      updateNodeStatus("4", "done");
      updateNodeStatus("5", "done");
      updateNodeStatus("6", "done");
    }
  };

  const handleStart = async () => {
    if (!inputData?.text) {
      alert("Ingresa texto o sube un archivo antes de ejecutar la simulación.");
      return;
    }

    resetWorkflow();
    setError(null);
    addLog("Iniciando proyecto en backend...", "info");
    updateNodeStatus("2", "processing");

    try {
      const response = await startProject(inputData.text);
      setSessionId(response.session_id);
      setRequerimientos(response.requerimientos);
      setPreguntas(response.preguntas || []);
      setReadyToGenerate(response.listo_para_generar);

      addLog("Requerimientos procesados por el backend.", "success");
      if (response.preguntas?.length > 0) {
        addLog(`Se han detectado ${response.preguntas.length} preguntas de aclaración.`, "warning");
        updateNodeStatus("3", "processing");
      } else {
        addLog("Ya está listo para generar el proyecto.", "success");
        updateNodeStatus("3", "done");
      }
    } catch (err) {
      setError(err.message);
      addLog(`Error en /proyecto/iniciar: ${err.message}`, "error");
      updateNodeStatus("2", "done");
    } finally {
      updateNodeStatus("2", "done");
    }
  };

  const handleAnswerSubmit = async (event) => {
    event.preventDefault();
    if (!sessionId) return;

    setError(null);
    addLog("Enviando respuestas al backend...", "info");
    try {
      const response = await answerProjectQuestions(sessionId, answers);
      setPreguntas(response.preguntas || []);
      setReadyToGenerate(response.listo_para_generar);
      addLog("Respuestas enviadas. Backend actualizó el análisis.", "success");
      updateNodeStatus("3", response.preguntas?.length > 0 ? "processing" : "done");
      if (response.preguntas?.length === 0) {
        addLog("Listo para generar.", "success");
      }
    } catch (err) {
      setError(err.message);
      addLog(`Error en /proyecto/${sessionId}/responder: ${err.message}`, "error");
    }
  };

  const handleGenerate = async () => {
    if (!sessionId) return;
    if (!readyToGenerate) {
      alert("Debes responder todas las preguntas antes de generar.");
      return;
    }

    setError(null);
    setGenerating(true);
    addLog("Solicitando generación de proyecto...", "info");
    updateNodeStatus("4", "processing");

    try {
      await generateProject(sessionId);
      lastFaseRef.current = "";
      pollRef.current = setInterval(async () => {
        try {
          const status = await getProjectStatus(sessionId);
          setProgress(status.progreso || {});
          const faseActual = status.progreso?.fase || "";
          if (faseActual && faseActual !== lastFaseRef.current) {
            addLog(`Estado: ${faseActual}`, "info");
            lastFaseRef.current = faseActual;
          }
          updateNodeByPhase(faseActual);

          if (status.estado === "completado") {
            clearInterval(pollRef.current);
            pollRef.current = null;
            const res = status.resultado || null;
            setResultado(res);
            setRutaProyecto(status.ruta_proyecto || res?.nombre || null);
            setGenerating(false);
            addLog("Generación completada ✅", "success");
          }
          if (status.estado === "error") {
            clearInterval(pollRef.current);
            pollRef.current = null;
            setGenerating(false);
            setError(status.progreso?.fase || "Ocurrió un error durante la generación.");
            addLog("Ocurrió un error durante la generación.", "error");
          }
        } catch (pollError) {
          clearInterval(pollRef.current);
          pollRef.current = null;
          setGenerating(false);
          setError(pollError.message);
          addLog(`Error de consulta de estado: ${pollError.message}`, "error");
        }
      }, 1500);
    } catch (err) {
      setGenerating(false);
      setError(err.message);
      addLog(`Error en /proyecto/${sessionId}/generar: ${err.message}`, "error");
      updateNodeStatus("4", "done");
    }
  };

  const handleAnswerChange = (index, value) => {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  };

  const renderQuestions = () => {
    if (!preguntas || preguntas.length === 0) return null;

    return (
      <div style={{ marginTop: "20px", padding: "18px", background: "#0f172a", borderRadius: "12px" }}>
        <h3>Preguntas de aclaración</h3>
        <form onSubmit={handleAnswerSubmit}>
          {preguntas.map((pregunta, index) => (
            <div key={index} style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px" }}>
                {index + 1}. {pregunta}
              </label>
              <textarea
                rows={3}
                value={answers[index] || ""}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                style={{ width: "100%", borderRadius: "8px", padding: "10px" }}
                required
              />
            </div>
          ))}
          <button type="submit" disabled={generating} style={{ marginTop: "8px" }}>
            Responder y continuar
          </button>
        </form>
      </div>
    );
  };

  const renderStatusPanel = () => {
    return (
      <div style={{ marginTop: "20px", display: "grid", gap: "16px" }}>
        <div style={{ padding: "18px", background: "#0f172a", borderRadius: "12px" }}>
          <h3>Estado del proyecto</h3>
          <p>Sesión: {sessionId || "No iniciada"}</p>
          <p>Fase: {progress.fase || "-"}</p>
          <p>Porcentaje: {progress.porcentaje ?? 0}%</p>
          <p>Archivos listos: {progress.archivos_listos?.length ?? 0}</p>
          {preguntas?.length > 0 && <p>Preguntas abiertas: {preguntas.length}</p>}
          {readyToGenerate && !generating && <p style={{ color: "#4ade80" }}>Listo para generar</p>}
          {error && <p style={{ color: "#fb7185" }}>Error: {error}</p>}
        </div>

        {requerimientos && (
          <div style={{ padding: "18px", background: "#0f172a", borderRadius: "12px" }}>
            <h3>Requerimientos detectados</h3>
            <p><strong>Título:</strong> {requerimientos.titulo}</p>
            <p><strong>Resumen:</strong> {requerimientos.resumen || "Sin resumen"}</p>
            <p><strong>Funcionales:</strong> {requerimientos.total_funcionales}</p>
            <p><strong>No funcionales:</strong> {requerimientos.total_no_funcionales}</p>
          </div>
        )}

        {resultado && (
          <div style={{ padding: "18px", background: "#0f172a", borderRadius: "12px" }}>
            <h3>Resultado final</h3>
            <p><strong>Proyecto:</strong> {resultado.nombre}</p>
            <p><strong>Tipo:</strong> {resultado.tipo_proyecto}</p>
            <p><strong>QA:</strong> {resultado.qa?.verdict} ({resultado.qa?.pass_rate ?? 0}%)</p>
            {resultado.archivos?.length > 0 && (
              <div style={{ marginTop: "10px" }}>
                <strong>Archivos generados:</strong>
                <ul style={{ marginTop: "8px", paddingLeft: "18px" }}>
                  {resultado.archivos.map((archivo) => (
                    <li key={archivo} style={{ fontSize: "13px" }}>{archivo}</li>
                  ))}
                </ul>
              </div>
            )}
          {resultado.qa?.critical_issues?.length > 0 && (
            <div style={{ marginTop: "12px", color: "#fda4af" }}>
              <strong>Issues críticos QA:</strong>
              <ul style={{ marginTop: "8px", paddingLeft: "18px" }}>
                {resultado.qa.critical_issues.map((issue, index) => (
                  <li key={index} style={{ fontSize: "13px" }}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
          {resultado.qa?.warnings?.length > 0 && (
            <div style={{ marginTop: "12px", color: "#fef08a" }}>
              <strong>Observaciones QA:</strong>
              <ul style={{ marginTop: "8px", paddingLeft: "18px" }}>
                {resultado.qa.warnings.map((warning, index) => (
                  <li key={index} style={{ fontSize: "13px" }}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
        <button onClick={handleStart} disabled={generating} className="run-button">
          ▶ Iniciar proyecto
        </button>
        <button
          onClick={handleGenerate}
          disabled={!readyToGenerate || generating || !sessionId}
          className="run-button"
        >
          {generating ? "⏳ Generando proyecto..." : "🚀 Generar proyecto"}
        </button>
        <button onClick={resetWorkflow} disabled={generating} className="run-button">
          🔄 Reiniciar flujo
        </button>
        {rutaProyecto && (
          <button onClick={() => setShowPreview(true)} className="run-button">
            👁 Ver preview
          </button>
        )}
      </div>

      {renderQuestions()}
      {renderStatusPanel()}

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

      <LogsPanel logs={logs} />
      <OutputPanel output={resultado ? JSON.stringify(resultado, null, 2) : ""} loading={generating} />

      {showPreview && rutaProyecto && (
        <ProjectPreview
          projectName={rutaProyecto}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}

export default FlowAgents;