import { useEffect, useState } from "react";
import { useVoiceConversation } from "../hooks/useVoiceConversation";

function VoiceConversation({
  question,
  questionIndex,
  totalQuestions,
  onSubmitAnswer,
  voiceEnabled,
  isProcessing,
}) {
  const [draft, setDraft] = useState("");
  const [manualEdit, setManualEdit] = useState(false);

  const { askQuestion, transcript, isListening, isSpeaking, status } = useVoiceConversation({
    onSendToBackend: async (text) => {
      onSubmitAnswer(text);
      return { status: "done" }; // Simular respuesta del backend
    },
  });

  useEffect(() => {
    if (voiceEnabled && question) {
      askQuestion(question);
    }
  }, [voiceEnabled, question, askQuestion]);

  useEffect(() => {
    if (transcript) {
      setDraft(transcript);
      setManualEdit(false);
    }
  }, [transcript]);

  const handleDraftChange = (event) => {
    setDraft(event.target.value);
    setManualEdit(true);
  };

  const handleSubmit = () => {
    if (!draft || draft.trim().length === 0) {
      alert("Escribe o di una respuesta antes de enviar.");
      return;
    }
    onSubmitAnswer(draft.trim());
  };

  const statusLabels = {
    idle: "Listo para hablar",
    speaking: "Hablando...",
    listening: "Escuchando...",
    processing: "Procesando...",
  };

  const voiceStatus = statusLabels[status] || "Listo";

  return (
    <div className="voice-panel">
      <div className="voice-panel-header">
        <div>
          <p className="meta">Modo de conversación</p>
          <h4 className="section-title">Asistente de voz</h4>
        </div>
      </div>

      <div className="voice-status-row">
        <span className="voice-status-pill">{voiceStatus}</span>
        {isSpeaking && <span className="voice-indicator voice-speaking">Hablando</span>}
        {isListening && <span className="voice-indicator voice-listening">Escuchando</span>}
      </div>

      <div className="voice-card">
        <p className="meta">Pregunta actual {questionIndex} de {totalQuestions}</p>
        <p>{question || "No hay preguntas abiertas."}</p>
      </div>

      <div className="voice-card">
        <p className="meta">Transcripción</p>
        <textarea
          className="textarea-field"
          rows={6}
          value={draft}
          onChange={handleDraftChange}
          placeholder="Aquí aparecerá lo que digas. Puedes corregirlo antes de enviar."
        />
      </div>

      <div className="voice-actions">
        <button
          type="button"
          onClick={() => askQuestion(question)}
          disabled={!voiceEnabled || !question || isProcessing}
          className="button button-secondary"
        >
          Repetir pregunta
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isProcessing || !draft || draft.trim().length === 0}
          className="button button-primary"
        >
          {isProcessing ? "Enviando..." : "Enviar respuesta"}
        </button>
      </div>

      <p className="voice-note">
        {voiceEnabled
          ? "Escucha la pregunta y di tu respuesta en voz alta."
          : "Activa el modo de voz para empezar la conversación por audio."}
      </p>
    </div>
  );
}

export default VoiceConversation;
