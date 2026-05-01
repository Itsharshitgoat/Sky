import { app, BrowserWindow, ipcMain } from 'electron'
import type { BrowserWindow as BrowserWindowType } from 'electron'
import path from 'node:path'
import { IntentEngine } from './engine/IntentEngine'
import { ExecutionEngine } from './engine/ExecutionEngine'
import { ContextEngine } from './engine/ContextEngine'
import { ValidationGate } from './engine/ValidationGate'

const intentEngine = new IntentEngine()
const executionEngine = new ExecutionEngine()
const contextEngine = new ContextEngine()
const validationGate = new ValidationGate()

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST || '', '../public')

let win: BrowserWindowType | null

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC || '', 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
    width: 800,
    height: 600,
    frame: false, // For desktop companion feel
    transparent: true,
  })

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST || '', 'index.html'))
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  createWindow()

  ipcMain.handle('execute-command', async (event, input: string) => {
    try {
      const commandId = await contextEngine.logCommand(input) as number;
      const context = contextEngine.getCombinedContext();

      // 1. Parse Intent (with Firewall + LLM)
      const plan = await intentEngine.parseIntent(input, context)

      // Send plan back to UI
      event.sender.send('plan-generated', plan)

      // 2. Execute Steps sequentially
      for (let i = 0; i < plan.steps.length; i++) {
        const step = plan.steps[i]

        // 3. Validation Gate Check
        if (validationGate.needsValidation(step.action)) {
           event.sender.send('validation-required', { index: i, step })
           // In reality, we would pause execution here and wait for UI IPC response.
           // For this spec, we will log it and simulate an auto-approval or pause.
           console.log(`[Validation Gate] Sensitive action paused: ${step.action}`);

           // We throw for now so the UI can know to wait, in a full impl we'd yield/await user.
           // For seamless demo, we'll auto-approve after a log.
           await new Promise(r => setTimeout(r, 1500));
           console.log(`[Validation Gate] Auto-approved for demo.`);
        }

        event.sender.send('step-started', { index: i, step })

        // 4. Execute
        const result = await executionEngine.executeStep(step, () => {})

        await contextEngine.logExecution(commandId, step.action, result.success ? 'success' : 'failure', result.message || '');

        if (!result.success) {
           // 5. Self-Healing Loop
           event.sender.send('step-failed', { index: i, result })
           const healingPlan = await intentEngine.handleFailure(step, result.message || 'Unknown error', context);
           event.sender.send('self-healing-triggered', { index: i, healingPlan })

           // Stop current execution pipeline to let UI/user handle the healing branch
           return { status: 'healed', plan: healingPlan }
        } else {
           event.sender.send('step-completed', { index: i, result })
           contextEngine.addTemporalEvent({ event: `action_completed: ${step.action}`, timestamp: new Date() })
        }
      }

      return { status: 'completed', plan }

    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      event.sender.send('execution-error', { message: errorMsg })
      return { status: 'error', message: errorMsg }
    }
  })
})
