import { contextBridge as e, ipcRenderer as t } from "electron";
//#region electron/preload.ts
e.exposeInMainWorld("ipcRenderer", {
	on(e, n) {
		let r = (e, ...t) => n(...t);
		return t.on(e, r), () => {
			t.off(e, r);
		};
	},
	send(e, ...n) {
		return t.send(e, ...n);
	},
	invoke(e, ...n) {
		return t.invoke(e, ...n);
	}
});
//#endregion
