# Gemelo Digital – Frontend

## Demo en video

Mira el funcionamiento completo del sistema en este video de YouTube:
[![Demo en YouTube](https://img.shields.io/badge/Ver%20demo%20en%20YouTube-red?logo=youtube)](https://youtu.be/8BS_5ewmwf0)

Frontend en React para el generador de proyectos web con agentes de IA.

## Descripción
Interfaz visual para interactuar con el backend de Gemelo Digital. Permite iniciar sesión, crear proyectos, responder preguntas de aclaración, visualizar el flujo de agentes y descargar documentación generada.

## Requisitos
- Node.js 18+
- npm o yarn
- Tener el backend corriendo (ver instrucciones en el repo backend)

## Instalación y uso

```bash
# 1. Clona el repositorio
git clone https://github.com/luis-miguel-cote/frontend-ai-agents-hackathon.git
cd frontend-ai-agents-hackathon

# 2. Instala dependencias
npm install
# o
yarn install

# 3. Inicia la app en modo desarrollo
npm run dev
# o
yarn dev
```

La app estará disponible en `http://localhost:5173` (o el puerto que indique Vite).

## Conexión con el backend
Asegúrate de que el backend esté corriendo en `http://localhost:8000` (o el puerto configurado). Si usas otra URL, actualiza las rutas de la API en los servicios del frontend (`src/services/`).

## Inicio de sesión de prueba
- Usuario: `usuario_demo@test.com`
- Contraseña: `demohackatonciadetabril2026`

## Funcionalidades principales
- Login y control de sesión
- Creación de proyectos web mediante agentes de IA
- Visualización del pipeline y timeline de eventos
- Descarga de documentación y logs en PDF

## Personalización
Puedes modificar estilos en `src/styles/` y componentes en `src/components/`.

## Licencia
MIT
