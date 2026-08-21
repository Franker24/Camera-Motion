# Camera Motion Lab 🔬⚡

Camera Motion Lab is a high-performance computer vision, WebGL 3D interaction, Web Audio, voice control, and WebSocket motion telemetry application built with React, Vite, TypeScript, Three.js, MediaPipe Tasks Vision, Express, and Socket.io.

## 🚀 Key Features & Experiences

1. **Dual Device Motion Telemetry (Smartphone Sensor → PC Receiver)**
   - **Mobile Sensor Mode (`/sensor`)**: Utilizes mobile camera, executes local MediaPipe vision engine at 60 FPS, and streams `MotionState` via Socket.io.
   - **PC Receiver Mode (`/pc-receiver`)**: Camera-free PC screen that receives remote telemetry from smartphone and drives spatial experiences.
2. **Air Canvas 3D (`/lab/air-canvas`)**:
   - Draw 3D strokes in WebGL space using index finger pointer coordinates and pinch gesture start/stop.
   - Integrated geometry shape recognizer (`ShapeRecognizer`) detecting circles, lines, squares, triangles.
3. **3D Viewport Lab (`/lab/three`)**:
   - Interactive Three.js WebGL scene with real-time gesture manipulation: pinch to grab & move, head rotation (yaw/pitch) to turn objects, two-hand pinch to scale.
4. **Hands-Free Web Showcase (`/lab/hands-free`)**:
   - Virtual mouse pointer driven by MediaPipe hand tracking with exponential smoothing. Pinch gesture triggers real DOM click events.
5. **Air Theremin Audio Synthesizer (`/lab/theremin`)**:
   - Web Audio API oscillator synthesizer. Hand vertical position ($Y$) controls pitch frequency, horizontal position ($X$) controls gain volume.
6. **Spatial AR Camera Viewport (`/lab/ar`)**:
   - Live camera background overlayed with interactive Three.js 3D meshes reacting to hands and head orientation.
7. **Motion Arcade Minigame (`/lab/arcade`)**:
   - "Energy Sphere Catcher" paddle game controlled by hand movement.
8. **Web Speech Voice Controller (`/lab/voice`)**:
   - Speech-to-text NLP parser converting spoken commands into Socket.io action payloads.

---

## 🛠️ Stack & Architecture

- **Frontend**: React 18, Vite 5, TypeScript 5, Three.js, `@react-three/fiber`, `@react-three/drei`, `@mediapipe/tasks-vision`, `socket.io-client`, `lucide-react`.
- **Backend**: Node.js, Express, Socket.io (WebSocket Port 3001).
- **Computer Vision**: MediaPipe Tasks Vision (HandLandmarker & FaceLandmarker) using official WASM and GPU delegates with CPU fallback.

---

## 💻 Getting Started & Running Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Application (Frontend + Backend concurrently)
```bash
npm run dev
```

This starts:
- **Vite Client**: `http://localhost:5173`
- **Express / Socket.io Server**: `http://localhost:3001`

### 3. Connect Smartphone to PC
1. Ensure both your PC and Smartphone are on the same local Wi-Fi network.
2. Open `http://<YOUR_PC_LOCAL_IP>:5173/sensor` on your Smartphone camera.
3. Open `http://localhost:5173/pc-receiver` on your PC.
4. Watch real-time motion telemetry stream seamlessly from phone to PC!
