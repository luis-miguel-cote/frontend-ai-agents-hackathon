import { useEffect, useRef, useState } from "react";
import ReactFlow from "reactflow";
import "reactflow/dist/style.css";
import "../styles/FlowAgents.css";
import LogsPanel from "./LogsPanel";
import OutputPanel from "./OutputPanel";
import ProjectPreview from "./ProjectPreview";
import VoiceConversation from "./VoiceConversation";
import {
  startProject,
  answerProjectQuestions,
  generateProject,
  getProjectStatus,
  BASE_URL,
} from "../services/api";




function FlowAgents({ inputData }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [pipelineLoading, setPipelineLoading] = useState(true);
  const [pipelineError, setPipelineError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [preguntas, setPreguntas] = useState([]);
  const [answers, setAnswers] = useState({});
  const [requerimientos, setRequerimientos] = useState(null);
  const [readyToGenerate, setReadyToGenerate] = useState(false);
  const [readyMessage, setReadyMessage] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState({ fase: "Esperando", porcentaje: 0, archivos_listos: [] });
  const [resultado, setResultado] = useState(null);
  const [voiceMode, setVoiceMode] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceSubmitting, setVoiceSubmitting] = useState(false);
  const [voiceError, setVoiceError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [error, setError] = useState(null);
  const [rutaProyecto, setRutaProyecto] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const pollRef = useRef(null);
  const lastFaseRef = useRef("");
  const questionsRef = useRef(null);
  const newQuestionsRef = useRef(false);

  // Función para recargar pipeline
  const fetchPipeline = (showLoading = true) => {
    if (showLoading) setPipelineLoading(true);
    setPipelineError(null);
    fetch(`${BASE_URL}/pipeline`)
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo cargar el pipeline");
        return res.json();
      })
      .then((data) => {
        // Adaptar nodos al formato React Flow: { id, data: { label }, position }
        const rfNodes = (data.nodes || []).map((n, i) => ({
          ...n,
          data: { label: n.label },
          position: n.position && typeof n.position.x === 'number' && typeof n.position.y === 'number'
            ? n.position
            : { x: 120 * i, y: 80 * i },
        }));
        setNodes(rfNodes);
        // Asegurar que cada edge tenga un id único
        const rfEdges = (data.edges || []).map((e, i) => ({
          ...e,
          id: e.id ? e.id : `e-${e.source}-${e.target}-${i}`,
        }));
        setEdges(rfEdges);
        if (showLoading) setPipelineLoading(false);
      })
      .catch((err) => {
        setPipelineError(err.message);
        if (showLoading) setPipelineLoading(false);
      });
  };

  // Cargar pipeline dinámico al montar
  useEffect(() => {
    fetchPipeline();
  }, []);

  // Si hay error en el pipeline, mostrar un pipeline básico por defecto
  useEffect(() => {
    if (pipelineError) {
      // Pipeline básico por defecto
      const defaultNodes = [
        { id: "1", label: "User", position: { x: 100, y: 100 } },
        { id: "2", label: "Orchestrator", position: { x: 300, y: 100 } },
        { id: "3", label: "Requirement", position: { x: 500, y: 100 } },
        { id: "4", label: "Development", position: { x: 300, y: 250 } },
        { id: "5", label: "QA", position: { x: 500, y: 250 } },
        { id: "6", label: "Output", position: { x: 700, y: 175 } },
      ];
      const defaultEdges = [
        { id: "e1-2", source: "1", target: "2" },
        { id: "e2-3", source: "2", target: "3" },
        { id: "e2-4", source: "2", target: "4" },
        { id: "e3-5", source: "3", target: "5" },
        { id: "e4-5", source: "4", target: "5" },
        { id: "e5-6", source: "5", target: "6" },
      ];
      setNodes(defaultNodes);
      setEdges(defaultEdges);
      setPipelineLoading(false);
    }
  }, [pipelineError]);

  useEffect(() => {
    const hasSpeechSynthesis = typeof window !== "undefined" && typeof window.speechSynthesis !== "undefined";
    const hasSpeechRecognition = typeof window !== "undefined" &&
      (typeof window.SpeechRecognition !== "undefined" || typeof window.webkitSpeechRecognition !== "undefined");
    setVoiceSupported(hasSpeechSynthesis && hasSpeechRecognition);
  }, []);

  useEffect(() => {
    setCurrentQuestionIndex(0);
  }, [preguntas]);

  useEffect(() => {
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, []);

  // Auto-scroll a nuevas preguntas
  useEffect(() => {
    if (newQuestionsRef.current && questionsRef.current) {
      questionsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      newQuestionsRef.current = false;
    }
  }, [preguntas]);

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
    setReadyMessage(null);
    setLogs([]);
    // Reiniciar pipeline a lo que venga del backend
    fetchPipeline();
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
              data: { label: `${(node.data?.label || node.label || "").split(" - ")[0]} - ${status.toUpperCase()}` },
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
    if (!(inputData?.text && inputData.text.trim().length > 0) && !inputData?.fileName) {
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
        setReadyMessage(null);
      } else {
        addLog("Ya está listo para generar el proyecto.", "success");
        updateNodeStatus("3", "done");
        setReadyMessage("¡Perfecto! Los requerimientos están completos. Ya puedes generar el proyecto.");
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

    // Validar que todas las preguntas tengan respuestas
    for (let i = 0; i < preguntas.length; i++) {
      if (!answers[i] || answers[i].trim() === "") {
        alert(`Por favor responde la pregunta ${i + 1}`);
        return;
      }
    }

    setError(null);
    addLog("Enviando respuestas al backend...", "info");
    try {
      // Convertir respuestas a objeto {"0": "respuesta1", ...}
      const respuestasObj = {};
      preguntas.forEach((_, index) => {
        respuestasObj[String(index)] = answers[index] || "";
      });
      const response = await answerProjectQuestions(sessionId, respuestasObj);
      
      // Limpiar respuestas después de enviar
      setAnswers({});
      
      // Establecer nuevas preguntas y marcar que hay nuevas
      if (response.preguntas && response.preguntas.length > 0) {
        newQuestionsRef.current = true;
      }
      
      setPreguntas(response.preguntas || []);
      setReadyToGenerate(response.listo_para_generar);
      addLog("Respuestas enviadas. Backend actualizó el análisis.", "success");
      updateNodeStatus("3", response.preguntas?.length > 0 ? "processing" : "done");
      if (response.preguntas?.length === 0) {
        addLog("Listo para generar.", "success");
        setReadyMessage("¡Genial! Has respondido todas las preguntas. Ahora puedes generar el proyecto.");
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
          // Sincronizar logs del backend con el estado local
          if (status.progreso && Array.isArray(status.progreso.logs)) {
            // Mapear logs a formato { message, type }
            const backendLogs = status.progreso.logs.map((msg) => {
              // Heurística simple para tipo
              let type = "info";
              if (msg.includes("error") || msg.includes("❌")) type = "error";
              else if (msg.includes("warning") || msg.includes("⚠️")) type = "warning";
              else if (msg.includes("success") || msg.includes("✅")) type = "success";
              else if (msg.includes("completado")) type = "success";
              else if (msg.includes("autocorrección") || msg.includes("♻️")) type = "warning";
              return { message: msg, type };
            });
            setLogs(backendLogs);
          }
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
            addLog("Generación completada", "success");
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

  const handleVoiceAnswerSubmit = async (answerText) => {
    if (!sessionId) return;
    if (!answerText || answerText.trim().length === 0) {
      setVoiceError("No se ha detectado ninguna respuesta válida.");
      return;
    }

    setVoiceError(null);
    const trimmedAnswer = answerText.trim();
    const updatedAnswers = {
      ...answers,
      [currentQuestionIndex]: trimmedAnswer,
    };
    setAnswers(updatedAnswers);

    const nextQuestionIndex = preguntas.findIndex((_, index) => !updatedAnswers[index]?.trim());
    const allAnswered = nextQuestionIndex === -1;

    if (!allAnswered) {
      setCurrentQuestionIndex(nextQuestionIndex);
      return;
    }

    setVoiceSubmitting(true);
    addLog("Enviando respuestas por voz al backend...", "info");

    try {
      const respuestasObj = {};
      preguntas.forEach((_, index) => {
        respuestasObj[String(index)] = updatedAnswers[index] || "";
      });

      const response = await answerProjectQuestions(sessionId, { respuestas: respuestasObj });
      setVoiceError(null);
      setAnswers({});
      setCurrentQuestionIndex(0);
      setPreguntas(response.preguntas || []);
      setReadyToGenerate(response.listo_para_generar);
      if (response.preguntas?.length > 0) {
        newQuestionsRef.current = true;
        addLog("El backend devolvió una nueva pregunta de aclaración.", "warning");
        setReadyMessage(null);
      } else {
        addLog("No hay más preguntas. Listo para continuar con el flujo.", "success");
        setReadyMessage("¡Excelente! Todas las preguntas han sido respondidas. El proyecto está listo para generarse.");
      }
      updateNodeStatus("3", response.preguntas?.length > 0 ? "processing" : "done");
      if (response.action === "repetir_pregunta") {
        setVoiceError("El sistema sugiere repetir la pregunta. Intenta nuevamente.");
      }
    } catch (err) {
      setVoiceError(err.message);
      addLog(`Error en /proyecto/${sessionId}/responder: ${err.message}`, "error");
    } finally {
      setVoiceSubmitting(false);
    }
  };

  const isFormComplete = () => {
    if (!preguntas || preguntas.length === 0) return false;
    return preguntas.every((_, index) => answers[index] && answers[index].trim() !== "");
  };

  const renderQuestions = () => {
    if (!preguntas || preguntas.length === 0) return null;

    return (
      <section className="section-card" ref={questionsRef} style={{ scrollMarginTop: '20px' }}>
        <div className="card-header" style={{ alignItems: 'center', gap: '12px' }}>
          <div>
            <p className="section-label">Interacción</p>
            <h3 className="section-title">
              Preguntas de aclaración
              <span className="new-indicator" title="Nuevas preguntas disponibles">↓ NUEVAS</span>
            </h3>
          </div>
          <div className="voice-toggle-controls">
            <button
              type="button"
              onClick={() => setVoiceMode((prev) => !prev)}
              className={voiceMode ? "button button-secondary" : "button button-primary"}
              disabled={!voiceSupported}
            >
              {voiceMode ? "Modo voz activado" : "Usar modo voz"}
            </button>
          </div>
        </div>

        {!voiceSupported && (
          <div className="status-item" style={{ marginTop: '12px', borderColor: 'rgba(148, 163, 184, 0.25)' }}>
            <div className="meta">Compatibilidad de voz</div>
            <div className="value">
              Tu navegador no soporta la API de voz completa. Usa el modo de texto o prueba en Chrome.
            </div>
          </div>
        )}

        {voiceMode ? (
          <>
            <VoiceConversation
              question={preguntas[currentQuestionIndex]}
              questionIndex={currentQuestionIndex + 1}
              totalQuestions={preguntas.length}
              onSubmitAnswer={handleVoiceAnswerSubmit}
              voiceEnabled={voiceMode}
              isProcessing={voiceSubmitting}
            />
            <form onSubmit={handleAnswerSubmit} className="panel-grid" style={{ marginTop: '16px' }}>
              {preguntas.map((pregunta, index) => (
                <div
                  key={index}
                  className={`question-item ${index === currentQuestionIndex ? 'current-question' : ''}`}
                >
                  <div>
                    <p className="meta">Pregunta {index + 1}</p>
                    <p>{pregunta}</p>
                  </div>
                  <textarea
                    rows={3}
                    className="textarea-field"
                    placeholder="Escribe tu respuesta aquí..."
                    value={answers[index] || ""}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    required
                  />
                </div>
              ))}

              <button type="submit" disabled={generating || !isFormComplete()} className="button button-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14" />
                  <path d="M13 6l6 6-6 6" />
                </svg>
                Responder y continuar
              </button>
            </form>
          </>
        ) : (
          <form onSubmit={handleAnswerSubmit} className="panel-grid">
            {preguntas.map((pregunta, index) => (
              <div key={index} className="question-item">
                <div>
                  <p className="meta">Pregunta {index + 1}</p>
                  <p>{pregunta}</p>
                </div>
                <textarea
                  rows={3}
                  className="textarea-field"
                  placeholder="Escribe tu respuesta aquí..."
                  value={answers[index] || ""}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  required
                />
              </div>
            ))}

            <button type="submit" disabled={generating || !isFormComplete()} className="button button-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
              </svg>
              Responder y continuar
            </button>
          </form>
        )}

        {readyMessage && (
          <div className="status-item" style={{ marginTop: '12px', borderColor: 'rgba(34, 197, 94, 0.35)', background: 'rgba(34, 197, 94, 0.08)' }}>
            <div className="meta">Estado de requerimientos</div>
            <div className="value" style={{ color: 'var(--success)', fontWeight: '600' }}>{readyMessage}</div>
          </div>
        )}
      </section>
    );
  };

  const renderStatusPanel = () => {
    return (
      <section className="section-card">
        <div className="card-header">
          <div>
            <p className="section-label">Estado del proyecto</p>
            <h3 className="section-title">Monitor de ejecución</h3>
          </div>
        </div>

        <div className="status-summary">
          <div className="status-item">
            <div className="meta">Sesión</div>
            <div className="value">{sessionId || "No iniciada"}</div>
          </div>
          <div className="status-item">
            <div className="meta">Fase actual</div>
            <div className="value">{progress.fase || "-"}</div>
          </div>
          <div className="status-item">
            <div className="meta">Progreso</div>
            <div className="value">{progress.porcentaje ?? 0}%</div>
          </div>
          <div className="status-item">
            <div className="meta">Archivos listos</div>
            <div className="value">{progress.archivos_listos?.length ?? 0}</div>
          </div>
          {preguntas?.length > 0 && (
            <div className="status-item">
              <div className="meta">Preguntas abiertas</div>
              <div className="value">{preguntas.length}</div>
            </div>
          )}
        </div>

        {requerimientos && (
          <div className="status-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <p className="meta">Requerimientos detectados</p>
            <p><strong>Título:</strong> {requerimientos.titulo}</p>
            <p><strong>Resumen:</strong> {requerimientos.resumen || "Sin resumen"}</p>
            <p><strong>Funcionales:</strong> {requerimientos.total_funcionales}</p>
            <p><strong>No funcionales:</strong> {requerimientos.total_no_funcionales}</p>
          </div>
        )}

        {error && (
          <div className="status-item" style={{ borderColor: 'rgba(251, 113, 133, 0.25)' }}>
            <div className="meta">Error</div>
            <div className="value" style={{ color: 'var(--danger)' }}>{error}</div>
          </div>
        )}

        {readyToGenerate && !generating && (
          <div className="status-item" style={{ borderColor: 'rgba(74, 222, 128, 0.25)' }}>
            <div className="meta">Listo para generar</div>
            <div className="value" style={{ color: 'var(--success)' }}>Preparado</div>
          </div>
        )}
      </section>
    );
  };

  const currentProgressLabel = progress.fase || "Esperando ejecución";
  const currentPercent = progress.porcentaje ?? 0;

  return (
    <div className="flow-shell">
      {!voiceSupported && (
        <div className="status-item" style={{ marginBottom: '18px', borderColor: 'rgba(148, 163, 184, 0.25)', background: 'rgba(244, 63, 94, 0.06)' }}>
          <div className="meta">Modo voz</div>
          <div className="value" style={{ color: '#f97316' }}>
            La API de voz no está disponible en este navegador. Prueba en Chrome o usa el modo de texto.
          </div>
        </div>
      )}
      <div className="page-actions">
        <button onClick={handleStart} disabled={generating} className="button button-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Iniciar proyecto
        </button>
        <button
          onClick={handleGenerate}
          disabled={!readyToGenerate || generating || !sessionId}
          className="button button-secondary"
        >
          {generating ? (
            <>
              <span className="spin-icon" role="img" aria-label="cargando">⏳</span>
              Generando proyecto...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
              </svg>
              Generar proyecto
            </>
          )}
        </button>
        <button onClick={resetWorkflow} disabled={generating} className="button button-ghost">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.11-9.78L23 10" />
          </svg>
          Reiniciar flujo
        </button>
        {rutaProyecto && (
          <button onClick={() => setShowPreview(true)} className="button button-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10 17l5-5-5-5" />
            </svg>
            Ver preview
          </button>
        )}
      </div>

      {renderQuestions()}
      <div className="flow-layout">
        <section className="flow-panel">
          <div className="flow-status">
            <div className="card-header">
              <div>
                <p className="section-label">Simulación</p>
                <h3 className="section-title">Flujo de agentes</h3>
              </div>
              <span className="status-chip">{currentProgressLabel}</span>
            </div>

            <div className="progress-context">
              <div className="current-step">Ejecución actual</div>
              <div className="current-percent">{currentPercent}%</div>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${currentPercent}%` }} />
            </div>
          </div>

          <div className="flow-preview">
            {pipelineLoading ? (
              <div className="status-item" style={{ justifyContent: 'center', textAlign: 'center' }}>
                <span className="spin-icon" role="img" aria-label="cargando">⏳</span>
                Cargando pipeline...
              </div>
            ) : pipelineError ? (
              <div className="status-item" style={{ justifyContent: 'center', textAlign: 'center', color: 'var(--danger)' }}>
                Error: {pipelineError}
              </div>
            ) : (
              <ReactFlow 
                nodes={nodes} 
                edges={edges} 
                fitView={{
                  padding: 0.2,
                  includeHiddenNodes: false,
                  minZoom: 0.1,
                  maxZoom: 2
                }}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                panOnDrag={false}
                panOnScroll={false}
                zoomOnScroll={false}
              />
            )}
          </div>
        </section>

        <div className="flow-bottom-section">
          <aside className="sidebar-panel">
            {renderStatusPanel()}
            <section className="section-card logs-timeline">
              <div className="card-header">
                <div>
                  <p className="section-label">Flujo y registro</p>
                  <h3 className="section-title">Timeline de eventos</h3>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </svg>
              </div>
              <p className="timeline-notice">Los logs se sincronizan con cada paso activo del flujo.</p>
              <LogsPanel logs={logs} />
            </section>
          </aside>

          <OutputPanel resultado={resultado} rutaProyecto={rutaProyecto} loading={generating} />
        </div>
      </div>

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