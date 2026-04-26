# Sky — Local-First Desktop Companion

## 1. Core Definition
Sky is a persistent, local-first desktop companion that interprets user intent, generates constrained skill-based plans, validates them, executes them step-by-step, and adapts in real time using a self-healing and security-aware system.

## 2. High-Level System Layers
UI Shell → Intent & Planning (LLM) → Skill Registry → Validation Gate → Safety + Semantic Firewall → Execution Engine → Memory + Context (SQL)

## 3. Skill System (Execution Contract)
The LLM does NOT generate actions. It SELECTS from allowed skills.
Skills are predefined, parameterized, and validated.
Categories:
- Safe (auto-execute): `open_app`, `search_web`, `read_file`
- Sensitive (requires gate): `send_email`, `overwrite_file`, `delete_file`

## 4. Context System
- Immediate Context: active app, selected text, window title
- Temporal Context: Breadcrumb log of recent events
- Persistent Memory (SQL): command history, habits, file index

## 5. Execution Pipeline
User Input → Intent Parsing → Skill-based Plan Generation → Validation Gate (UI) → Safety Check → Execution Engine → Self-Healing Loop → Logging → Response

## 6. Self-Healing System
When a step fails, Sky sends the error to the LLM to generate a retry, alternative method, or ask the user. Sky adapts instead of just stopping.

## 7. Validation Gate
For sensitive or ambiguous actions, UI highlights affected items and allows confirm, skip, or edit. Non-blocking and non-modal.

## 8. Security System (Semantic Firewall)
- Instruction Isolation: system prompt is immutable.
- Input Sanitization: blocks "ignore previous instructions", injection patterns.
- Skill Restriction: LLM cannot invent skills.
- Human-in-the-Loop: Required for delete, overwrite, send.

## 9. Resource Management
Model Lifecycle Manager handles loading/unloading models based on activity. Optimizes with quantized models (under ~5GB) and thermal awareness.

## 10. Memory System (SQL Core)
SQL = long-term memory. Stores commands, execution logs, file index.

## 11. UI System
Idle state: floating icon. Expanded: glass blur chat and task list.
