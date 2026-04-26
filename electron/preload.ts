import { ipcRenderer, contextBridge } from 'electron'
import type { IpcRendererEvent } from 'electron'

// We need to keep a map of listener wrappers to remove them later correctly.
// A more robust preload script would just expose `ipcRenderer` and its specific typings,
// but for the sake of mapping `(event, ...args)` nicely without `IpcRendererEvent` directly exposed:
contextBridge.exposeInMainWorld('ipcRenderer', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(channel: string, listener: (...args: any[]) => void) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscription = (_event: IpcRendererEvent, ...args: any[]) => listener(...args)
    ipcRenderer.on(channel, subscription)

    // Return a cleanup function so the frontend can easily remove the exact listener wrapper.
    return () => {
      ipcRenderer.off(channel, subscription)
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  send(channel: string, ...args: any[]) {
    return ipcRenderer.send(channel, ...args)
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  invoke(channel: string, ...args: any[]) {
    return ipcRenderer.invoke(channel, ...args)
  },
})
