import { BrowserWindow as e, app as t, ipcMain as n } from "electron";
import r from "node:path";
import { fileURLToPath as i } from "node:url";
//#region electron/engine/IntentEngine.ts
var a = class {
	async parseIntent(e) {
		return console.log(`Parsing intent for: ${e}`), await new Promise((e) => setTimeout(e, 1e3)), e.toLowerCase().includes("marques") || e.toLowerCase().includes("mkbhd") ? {
			goal: "play latest video",
			entities: {
				creator: "MKBHD",
				platform: "YouTube"
			},
			steps: [
				{
					action: "open_app",
					target: "chrome"
				},
				{
					action: "search_web",
					query: "MKBHD latest video"
				},
				{ action: "extract_url" },
				{ action: "open_url" },
				{ action: "play_video" }
			],
			confidence: .87
		} : {
			goal: "execute generic command",
			entities: {},
			steps: [{
				action: "echo",
				target: e
			}],
			confidence: .5
		};
	}
}, o = class {
	async executeStep(e, t) {
		return t(`Executing: ${e.action}`), await new Promise((e) => setTimeout(e, 800)), e.action === "open_app" ? (t(`Opened app: ${e.target}`), { success: !0 }) : e.action === "search_web" ? (t(`Searched web for: ${e.query}`), { success: !0 }) : e.action === "extract_url" ? (t("Extracted URL successfully."), { success: !0 }) : e.action === "open_url" ? (t("Opened URL."), { success: !0 }) : e.action === "play_video" ? (t("Video playback started."), { success: !0 }) : (t(`Completed generic action: ${e.action}`), { success: !0 });
	}
}, s = r.dirname(i(import.meta.url)), c = new a(), l = new o();
process.env.DIST = r.join(s, "../dist"), process.env.VITE_PUBLIC = t.isPackaged ? process.env.DIST : r.join(process.env.DIST || "", "../public");
var u, d = process.env.VITE_DEV_SERVER_URL;
function f() {
	u = new e({
		icon: r.join(process.env.VITE_PUBLIC || "", "electron-vite.svg"),
		webPreferences: { preload: r.join(s, "preload.js") },
		width: 800,
		height: 600,
		frame: !1,
		transparent: !0
	}), u.webContents.on("did-finish-load", () => {
		u?.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
	}), d ? u.loadURL(d) : u.loadFile(r.join(process.env.DIST || "", "index.html"));
}
t.on("window-all-closed", () => {
	process.platform !== "darwin" && (t.quit(), u = null);
}), t.on("activate", () => {
	e.getAllWindows().length === 0 && f();
}), t.whenReady().then(() => {
	f(), n.handle("execute-command", async (e, t) => {
		let n = await c.parseIntent(t);
		e.sender.send("plan-generated", n);
		for (let t = 0; t < n.steps.length; t++) {
			let r = n.steps[t];
			e.sender.send("step-started", {
				index: t,
				step: r
			});
			let i = await l.executeStep(r, () => {});
			e.sender.send("step-completed", {
				index: t,
				result: i
			});
		}
		return {
			status: "completed",
			plan: n
		};
	});
});
//#endregion
