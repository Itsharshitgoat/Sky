# Sky — Local-First Desktop Companion

Sky is a persistent, local-first desktop companion that interprets user intent, generates constrained skill-based plans, validates them, executes them step-by-step, and adapts in real time using a self-healing and security-aware system.

## 1. Core Definition
Sky is built as 7 tightly controlled layers:
UI Shell → Intent & Planning (LLM) → Skill Registry → Validation Gate → Safety + Semantic Firewall → Execution Engine → Memory + Context (SQL)

## Prerequisites & Installation

### A. System Requirements
- **OS**: macOS or Linux (Windows supported via WSL, but native execution tools might vary).
- **Node.js**: Version 22+ recommended.

### B. Installing Local AI (Ollama)
Sky is designed to run entirely locally using Ollama.
1. Download and install Ollama from [ollama.com](https://ollama.com/).
2. Pull a local model to use for inference. We recommend Mistral or Llama 3 for best performance/footprint.
   \`\`\`bash
   ollama pull mistral
   \`\`\`
   *(Keep Ollama running in the background while using Sky).*

### C. Installing App Dependencies
1. Clone the repository and navigate into the project directory.
2. Install the Node.js dependencies:
   \`\`\`bash
   npm install
   \`\`\`

### D. Running the Application
1. **Development Mode**: Run Vite and Electron concurrently.
   Use the package scripts to boot the app.
   \`\`\`bash
   npm run build
   npm run preview
   \`\`\`
   This will launch the transparent, frameless UI window.

## System Architecture

### Skill System (Execution Contract)
The LLM does NOT generate actions. It SELECTS from allowed skills.
Skills are predefined, parameterized, and validated.
- **Safe**: \`open_app\`, \`search_web\`, \`read_file\`
- **Sensitive**: \`send_email\`, \`overwrite_file\`, \`delete_file\`

### Context System
- **Immediate Context**: active app, selected text, window title
- **Temporal Context**: Breadcrumb log of recent events
- **Persistent Memory (SQL)**: command history, habits, file index (Stored locally in \`electron/db/sky_memory.sqlite\`)

### Execution Pipeline & Self-Healing
User Input → Intent Parsing → Skill-based Plan Generation → Validation Gate (UI) → Safety Check → Execution Engine → Self-Healing Loop → Logging → Response.
If an action fails (e.g., file not found), the Self-Healing system automatically falls back to an alternative or asks for user direction.

### Security System (Semantic Firewall)
- **Input Sanitization**: blocks "ignore previous instructions", injection patterns, and dangerous shell commands like \`rm -rf\`.
- **Validation Gate**: UI highlights sensitive actions and waits for user confirmation (non-modal).
