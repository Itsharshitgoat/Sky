/// <reference types="vite/client" />

interface Window {
  ipcRenderer: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    on(channel: string, listener: (event: unknown, ...args: any[]) => void): void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    off(channel: string, listener?: (event: unknown, ...args: any[]) => void): void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    send(channel: string, ...args: any[]): void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    invoke(channel: string, ...args: any[]): Promise<any>;
  }
}
