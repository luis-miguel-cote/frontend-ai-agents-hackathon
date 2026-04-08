import useVoiceConversation from "./useVoiceConversation";

/**
 * useVoiceAssistant es un alias limpio y reusable para la lógica de voz.
 * Permite cambiar el nombre en el futuro sin modificar el componente.
 */
export default function useVoiceAssistant(options) {
  return useVoiceConversation(options);
}
