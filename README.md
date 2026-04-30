# ☁️ Sky — Local-First Desktop Companion

Sky is a persistent, local-first desktop companion that interprets user intent, generates constrained skill-based plans, validates them, executes them step-by-step, and adapts in real-time using a self-healing and security-aware system. It runs entirely on your machine without phoning home to a cloud server.

---

## 🧭 1. Architecture Overview
Sky is structured into 7 tightly controlled, isolated layers to prevent runaway actions and ensure transparency:

**`UI Shell` → `Intent & Planning (LLM)` → `Skill Registry` → `Validation Gate` → `Safety + Semantic Firewall` → `Execution Engine` → `Memory + Context (SQL)`**

---

## 📦 2. Prerequisites & Installation Guide

### A. System Requirements
- **OS**: macOS or Linux (Windows supported via WSL, but native execution tools might vary).
- **Node.js**: Version 22 or higher recommended.
- **Hardware**: A machine capable of running 4-bit/5-bit quantized local LLMs (at least 8GB RAM, Apple Silicon / Dedicated GPU preferred).

### B. Installing the Local AI Engine (Ollama)
Sky relies on Ollama to provide the "brain" for Intent Parsing and Self-Healing without relying on cloud APIs like OpenAI.
1. Download and install Ollama from [ollama.com](https://ollama.com/).
2. Pull a local model to use for inference. We recommend Mistral or Llama 3 for the best balance between performance and system footprint (~5GB).
   `ollama pull mistral`
   *(Ensure Ollama is running in the background before booting Sky).*

### C. Installing Application Dependencies
1. Clone the repository and navigate into the project directory.
2. Install the necessary Node.js dependencies:
   `npm install`

### D. Running the Application
Sky uses Vite for the frontend UI and Electron for the backend execution and system framing.

**To run the application in Development Mode (Live Reloading):**
`npm run dev &`

**To build and run the production application:**
`npm run build`
`npm run preview &`
*Note: This will launch a frameless, transparent window in the bottom right of your screen. Click the floating "Sparkle" icon to expand the UI.*

---

## 📂 3. Directory Structure & File Manifest

Understanding the codebase is essential for extending Sky. Every layer of the 7-tier architecture has a dedicated file.

### 💻 `electron/` (Backend / System Control)
This is the heart of Sky. It handles everything outside the UI.
- **`main.ts`**: The orchestrator. Creates the transparent window, registers the IPC (Inter-Process Communication) handlers, and wires the execution pipeline from user input to final step completion.
- **`preload.ts`**: The security bridge. Securely exposes the IPC methods (`on`, `invoke`, `send`) to the frontend React app.
- **`engine/`**: The Core Intelligence and Execution modules.
  - **`IntentEngine.ts`**: Acts as the LLM interface. Takes user input, runs it through the firewall, and mocks calling Ollama to return a structured JSON task plan. Also handles the `Self-Healing Loop` for failed tasks.
  - **`ExecutionEngine.ts`**: The "Hands" of Sky. Takes a parsed skill and executes it using local shell commands. It ensures it ONLY executes skills defined in the registry.
  - **`SkillRegistry.ts`**: The "Execution Contract". A strict definition of allowed actions (e.g., `open_app`, `send_email`). This prevents the LLM from hallucinating destructive commands.
  - **`ValidationGate.ts`**: Checks if an upcoming action from the LLM plan is marked as "sensitive". If so, pauses execution to await user confirmation.
  - **`Firewall.ts`**: The "Semantic Firewall". Sanitizes input to block prompt injections (`"ignore previous instructions"`) and dangerous commands (`"rm -rf"`).
  - **`ContextEngine.ts`**: Manages the Immediate Context (Active App) and Temporal Context (Breadcrumb log of recent events) to allow the LLM to understand commands like "send *that* file".
- **`db/`**:
  - **`database.ts`**: Initializes the persistent SQLite memory (`sky_memory.sqlite`). It tracks command history, execution logs, and session data.

### 🎨 `src/` (Frontend / UI Shell)
The visual representation of Sky, built with React and TailwindCSS.
- **`App.tsx`**: The main interface. Handles toggling between the floating "Idle State" and the glassmorphic "Expanded Panel". Renders the visible step-by-step task execution blocks and handles the non-blocking validation/self-healing user prompts.
- **`index.css`**: Tailwind base imports and custom scrollbar definitions.
- **`vite-env.d.ts`**: TypeScript definitions for the custom window `ipcRenderer` APIs injected by the preload script.

### ⚙️ Configuration Files
- **`vite.config.ts`**: Configures Vite to build both the React frontend and compile the Electron main/preload scripts.
- **`tailwind.config.js`**: Defines styling parameters for the UI.
- **`tsconfig.json`**: TypeScript compiler rules.

---

## 🧠 4. Deep Dive: Key Systems

### Skill System & Bounded Intelligence
The LLM does NOT generate actions. It SELECTS from allowed skills.
Skills are predefined, parameterized, and validated.
- **Safe (Auto-Execute)**: `open_app`, `search_web`, `read_file`
- **Sensitive (Requires Gate)**: `send_email`, `overwrite_file`, `delete_file`

### Execution Pipeline & Adaptive Continuation (Self-Healing)
1. **User Input** → 2. **Intent Parsing** → 3. **Skill-based Plan Generation** → 4. **Validation Gate (UI)** → 5. **Safety Check** → 6. **Execution Engine**
If an action fails (e.g., "file not found" during `read_file`), Sky does not crash or throw an opaque error. It falls into the **Self-Healing Loop**, where it sends the error and context back to the LLM to generate an alternative method or to gracefully ask the user for direction.

### Security System (Semantic Firewall)
Sky operates as a *sandboxed agent*, not a raw AI.
- **Input Sanitization**: Blocks "ignore previous instructions", injection patterns, and dangerous shell commands.
- **Validation Gate**: UI highlights sensitive actions (like deleting a file) and waits for user confirmation (non-modal).
- **Skill Restriction**: The LLM cannot invent new skills to bypass the registry.
