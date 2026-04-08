export const BASE_URL = import.meta.env.VITE_BACKEND_URL ?? "http://127.0.0.1:8000";

const safeFetch = async (path, options = {}) => {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let errorText = await response.text();
    try {
      const errorJson = JSON.parse(errorText);
      errorText = errorJson.detail || errorJson.message || JSON.stringify(errorJson);
    } catch (_) {
      // mantener el texto original si no es JSON
    }
    throw new Error(`${response.status} - ${errorText}`);
  }

  return response.json();
};

export const startProject = async (descripcion) => {
  return safeFetch("/proyecto/iniciar", {
    method: "POST",
    body: JSON.stringify({ descripcion }),
  });
};

export const answerProjectQuestions = async (sessionId, payload) => {
  const bodyPayload =
    payload && (payload.respuestas !== undefined || payload.respuesta !== undefined)
      ? payload
      : { respuestas: payload };

  return safeFetch(`/proyecto/${sessionId}/responder`, {
    method: "POST",
    body: JSON.stringify(bodyPayload),
  });
};

export const generateProject = async (sessionId, skipQa = false) => {
  return safeFetch(`/proyecto/${sessionId}/generar?skip_qa=${skipQa}`, {
    method: "POST",
  });
};

export const getProjectStatus = async (sessionId) => {
  return safeFetch(`/proyecto/${sessionId}/estado`);
};

export const listProjects = async () => {
  return safeFetch("/proyectos");
};

export const readProjectFile = async (projectName, filePath) => {
  return safeFetch(`/proyecto/${projectName}/archivos/${encodeURIComponent(filePath)}`);
};
