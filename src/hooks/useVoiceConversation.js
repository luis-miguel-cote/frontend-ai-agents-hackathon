import { useState, useRef } from "react";

export const useVoiceConversation = ({ onSendToBackend }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("idle"); // idle | speaking | listening | processing

  const recognitionRef = useRef(null);

  // 🎤 Inicializar reconocimiento de voz
  const initRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Tu navegador no soporta reconocimiento de voz");
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      setStatus("listening");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);

      // enviar automáticamente al backend
      sendAnswer(text);
    };

    recognition.onerror = (err) => {
      console.error("Error reconocimiento:", err);
      setStatus("idle");
    };

    recognitionRef.current = recognition;
    return recognition;
  };

  // 🔊 Hablar (TTS)
  const speak = (text) => {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-ES";

      utterance.onstart = () => {
        setIsSpeaking(true);
        setStatus("speaking");
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };

      speechSynthesis.speak(utterance);
    });
  };

  // 🎤 Escuchar
  const listen = () => {
    const recognition = initRecognition();
    if (recognition) recognition.start();
  };

  // 🔁 Flujo completo: hablar → escuchar
  const askQuestion = async (question) => {
    await speak(question);
    listen();
  };

  // 📡 Enviar respuesta al backend
  const sendAnswer = async (text) => {
    setStatus("processing");

    try {
      const response = await onSendToBackend(text);

      /**
       * El backend debe responder algo así:
       * {
       *   status: "next_question" | "done",
       *   question?: "siguiente pregunta"
       * }
       */

      if (response.status === "next_question") {
        askQuestion(response.question);
      } else if (response.status === "done") {
        setStatus("idle");
        console.log("Flujo completado 🚀");
      }
    } catch (error) {
      console.error("Error backend:", error);
      setStatus("idle");
    }
  };

  return {
    askQuestion,
    transcript,
    isListening,
    isSpeaking,
    status,
  };
};
