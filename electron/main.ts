import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { IntentEngine } from './engine/IntentEngine'
import { ExecutionEngine } from './engine/ExecutionEngine'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const intentEngine = new IntentEngine()
const executionEngine = new ExecutionEngine()

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

let win: BrowserWindow | null

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC || '', 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
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
    // 1. Parse Intent
    const plan = await intentEngine.parseIntent(input)

    // Send plan back to UI
    event.sender.send('plan-generated', plan)

    // 2. Execute Steps sequentially
    for (let i = 0; i < plan.steps.length; i++) {
      const step = plan.steps[i]

      event.sender.send('step-started', { index: i, step })

      const result = await executionEngine.executeStep(step, () => {
        // We could send detailed progress, but for now just send step completion
      })

      event.sender.send('step-completed', { index: i, result })
    }

    return { status: 'completed', plan }
  })
})
