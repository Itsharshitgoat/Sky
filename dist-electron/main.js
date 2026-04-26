import { BrowserWindow as e, app as t, ipcMain as n } from "electron";
import r from "node:path";
import { fileURLToPath as i } from "node:url";
import a from "path";
import { fileURLToPath as o } from "url";
//#region \0rolldown/runtime.js
var s = Object.create, c = Object.defineProperty, l = Object.getOwnPropertyDescriptor, u = Object.getOwnPropertyNames, d = Object.getPrototypeOf, f = Object.prototype.hasOwnProperty, p = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), m = (e, t, n, r) => {
	if (t && typeof t == "object" || typeof t == "function") for (var i = u(t), a = 0, o = i.length, s; a < o; a++) s = i[a], !f.call(e, s) && s !== n && c(e, s, {
		get: ((e) => t[e]).bind(null, s),
		enumerable: !(r = l(t, s)) || r.enumerable
	});
	return e;
}, h = (e, t, n) => (n = e == null ? {} : s(d(e)), m(t || !e || !e.__esModule ? c(n, "default", {
	value: e,
	enumerable: !0
}) : n, e)), g = /* @__PURE__ */ ((e) => typeof require < "u" ? require : typeof Proxy < "u" ? new Proxy(e, { get: (e, t) => (typeof require < "u" ? require : e)[t] }) : e)(function(e) {
	if (typeof require < "u") return require.apply(this, arguments);
	throw Error("Calling `require` for \"" + e + "\" in an environment that doesn't expose the `require` function. See https://rolldown.rs/in-depth/bundling-cjs#require-external-modules for more details.");
}), _ = class {
	sanitizeInput(e) {
		let t = e.toLowerCase();
		return !(t.includes("ignore previous instructions") || t.includes("system prompt") || t.includes("bypass") || t.includes("run sudo") || t.includes("rm -rf") || t.match(/;\s*rm/));
	}
}, v = class {
	firewall;
	constructor() {
		this.firewall = new _();
	}
	async parseIntent(e, t) {
		if (!this.firewall.sanitizeInput(e)) throw Error("Input blocked by Semantic Firewall: Potentially unsafe instructions detected.");
		console.log(`Parsing intent for: ${e} with context:`, t), await new Promise((e) => setTimeout(e, 1e3));
		let n = e.toLowerCase();
		return n.includes("marques") || n.includes("mkbhd") ? {
			goal: "play latest video",
			steps: [{
				action: "open_app",
				target: "chrome"
			}, {
				action: "search_web",
				query: "MKBHD latest video"
			}],
			confidence: .87
		} : n.includes("invoice") && n.includes("delete") ? {
			goal: "delete invoice file",
			steps: [{
				action: "delete_file",
				path: "Invoice_Final.pdf"
			}],
			confidence: .95
		} : n.includes("invoice") && n.includes("open") ? {
			goal: "open invoice",
			steps: [{
				action: "read_file",
				path: "Invoice_Final.pdf"
			}]
		} : {
			goal: "execute generic command",
			steps: [{
				action: "search_web",
				query: e
			}],
			confidence: .5
		};
	}
	async handleFailure(e, t, n) {
		return console.log(`Self-Healing triggered for failed step: ${e.action}. Error: ${t}`), await new Promise((e) => setTimeout(e, 800)), e.action === "read_file" ? {
			type: "ask_user",
			message: `I couldn't find '${e.path}' locally. Do you want me to check your recent email attachments?`
		} : {
			type: "retry_alternative",
			alternativeStep: {
				action: "search_web",
				query: "help with " + e.action
			}
		};
	}
}, y = {
	open_app: {
		name: "open_app",
		category: "safe",
		params: ["target"],
		description: "Opens an application by name."
	},
	search_web: {
		name: "search_web",
		category: "safe",
		params: ["query"],
		description: "Searches the web for a query."
	},
	read_file: {
		name: "read_file",
		category: "safe",
		params: ["path"],
		description: "Reads the contents of a local file."
	},
	send_email: {
		name: "send_email",
		category: "sensitive",
		params: [
			"to",
			"subject",
			"body"
		],
		description: "Sends an email."
	},
	overwrite_file: {
		name: "overwrite_file",
		category: "sensitive",
		params: ["path", "content"],
		description: "Overwrites a file with new content."
	},
	delete_file: {
		name: "delete_file",
		category: "sensitive",
		params: ["path"],
		description: "Deletes a file."
	}
}, b = class {
	async executeStep(e, t) {
		let n = y[e.action];
		return n ? (t(`Executing skill: ${n.name}`), await new Promise((e) => setTimeout(e, 800)), e.action === "read_file" && e.path?.includes("Invoice_Final.pdf") ? {
			success: !1,
			message: `File not found: ${e.path}`
		} : (t(`Completed skill: ${n.name}`), {
			success: !0,
			message: `Executed ${n.name} successfully.`
		})) : {
			success: !1,
			message: `Skill ${e.action} not found in registry.`
		};
	}
}, x = /* @__PURE__ */ p(((e, t) => {
	var n = g("path").sep || "/";
	t.exports = r;
	function r(e) {
		if (typeof e != "string" || e.length <= 7 || e.substring(0, 7) != "file://") throw TypeError("must pass in a file:// URI to convert to a file path");
		var t = decodeURI(e.substring(7)), r = t.indexOf("/"), i = t.substring(0, r), a = t.substring(r + 1);
		return i == "localhost" && (i = ""), i &&= n + n + i, a = a.replace(/^(.+)\|/, "$1:"), n == "\\" && (a = a.replace(/\//g, "\\")), /^.+\:/.test(a) || (a = n + a), i + a;
	}
})), S = /* @__PURE__ */ p(((e, t) => {
	var n = g("fs"), r = g("path"), i = x(), a = r.join, o = r.dirname, s = n.accessSync && function(e) {
		try {
			n.accessSync(e);
		} catch {
			return !1;
		}
		return !0;
	} || n.existsSync || r.existsSync, c = {
		arrow: process.env.NODE_BINDINGS_ARROW || " → ",
		compiled: process.env.NODE_BINDINGS_COMPILED_DIR || "compiled",
		platform: process.platform,
		arch: process.arch,
		nodePreGyp: "node-v" + process.versions.modules + "-" + process.platform + "-" + process.arch,
		version: process.versions.node,
		bindings: "bindings.node",
		try: [
			[
				"module_root",
				"build",
				"bindings"
			],
			[
				"module_root",
				"build",
				"Debug",
				"bindings"
			],
			[
				"module_root",
				"build",
				"Release",
				"bindings"
			],
			[
				"module_root",
				"out",
				"Debug",
				"bindings"
			],
			[
				"module_root",
				"Debug",
				"bindings"
			],
			[
				"module_root",
				"out",
				"Release",
				"bindings"
			],
			[
				"module_root",
				"Release",
				"bindings"
			],
			[
				"module_root",
				"build",
				"default",
				"bindings"
			],
			[
				"module_root",
				"compiled",
				"version",
				"platform",
				"arch",
				"bindings"
			],
			[
				"module_root",
				"addon-build",
				"release",
				"install-root",
				"bindings"
			],
			[
				"module_root",
				"addon-build",
				"debug",
				"install-root",
				"bindings"
			],
			[
				"module_root",
				"addon-build",
				"default",
				"install-root",
				"bindings"
			],
			[
				"module_root",
				"lib",
				"binding",
				"nodePreGyp",
				"bindings"
			]
		]
	};
	function l(t) {
		typeof t == "string" ? t = { bindings: t } : t ||= {}, Object.keys(c).map(function(e) {
			e in t || (t[e] = c[e]);
		}), t.module_root ||= e.getRoot(e.getFileName()), r.extname(t.bindings) != ".node" && (t.bindings += ".node");
		for (var n = typeof __webpack_require__ == "function" ? __non_webpack_require__ : g, i = [], o = 0, s = t.try.length, l, u, d; o < s; o++) {
			l = a.apply(null, t.try[o].map(function(e) {
				return t[e] || e;
			})), i.push(l);
			try {
				return u = t.path ? n.resolve(l) : n(l), t.path || (u.path = l), u;
			} catch (e) {
				if (e.code !== "MODULE_NOT_FOUND" && e.code !== "QUALIFIED_PATH_RESOLUTION_FAILED" && !/not find/i.test(e.message)) throw e;
			}
		}
		throw d = /* @__PURE__ */ Error("Could not locate the bindings file. Tried:\n" + i.map(function(e) {
			return t.arrow + e;
		}).join("\n")), d.tries = i, d;
	}
	t.exports = e = l, e.getFileName = function(e) {
		var t = Error.prepareStackTrace, n = Error.stackTraceLimit, r = {}, a;
		return Error.stackTraceLimit = 10, Error.prepareStackTrace = function(t, n) {
			for (var r = 0, i = n.length; r < i; r++) if (a = n[r].getFileName(), a !== __filename) if (e) {
				if (a !== e) return;
			} else return;
		}, Error.captureStackTrace(r), r.stack, Error.prepareStackTrace = t, Error.stackTraceLimit = n, a.indexOf("file://") === 0 && (a = i(a)), a;
	}, e.getRoot = function(e) {
		for (var t = o(e), n;;) {
			if (t === "." && (t = process.cwd()), s(a(t, "package.json")) || s(a(t, "node_modules"))) return t;
			if (n === t) throw Error("Could not find module root given file: \"" + e + "\". Do you have a `package.json` file? ");
			n = t, t = a(t, "..");
		}
	};
})), C = /* @__PURE__ */ p(((e, t) => {
	t.exports = S()("node_sqlite3.node");
})), w = /* @__PURE__ */ p(((e) => {
	var t = g("util");
	function n(e, n, i) {
		let a = e[n];
		e[n] = function() {
			let o = /* @__PURE__ */ Error(), s = e.constructor.name + "#" + n + "(" + Array.prototype.slice.call(arguments).map(function(e) {
				return t.inspect(e, !1, 0);
			}).join(", ") + ")";
			i === void 0 && (i = -1), i < 0 && (i += arguments.length);
			let c = arguments[i];
			return typeof arguments[i] == "function" && (arguments[i] = function() {
				let e = arguments[0];
				return e && e.stack && !e.__augmented && (e.stack = r(e).join("\n"), e.stack += "\n--> in " + s, e.stack += "\n" + r(o).slice(1).join("\n"), e.__augmented = !0), c.apply(this, arguments);
			}), a.apply(this, arguments);
		};
	}
	e.extendTrace = n;
	function r(e) {
		return e.stack.split("\n").filter(function(e) {
			return e.indexOf(__filename) < 0;
		});
	}
})), T = /* @__PURE__ */ h((/* @__PURE__ */ p(((e, t) => {
	var n = g("path"), r = C(), i = g("events").EventEmitter;
	t.exports = e = r;
	function a(e) {
		return function(t) {
			let n, r = Array.prototype.slice.call(arguments, 1);
			if (typeof r[r.length - 1] == "function") {
				let e = r[r.length - 1];
				n = function(t) {
					t && e(t);
				};
			}
			let i = new c(this, t, n);
			return e.call(this, i, r);
		};
	}
	function o(e, t) {
		for (let n in t.prototype) e.prototype[n] = t.prototype[n];
	}
	r.cached = {
		Database: function(e, t, i) {
			if (e === "" || e === ":memory:") return new s(e, t, i);
			let a;
			if (e = n.resolve(e), !r.cached.objects[e]) a = r.cached.objects[e] = new s(e, t, i);
			else {
				a = r.cached.objects[e];
				let n = typeof t == "number" ? i : t;
				if (typeof n == "function") {
					function e() {
						n.call(a, null);
					}
					a.open ? process.nextTick(e) : a.once("open", e);
				}
			}
			return a;
		},
		objects: {}
	};
	var s = r.Database, c = r.Statement, l = r.Backup;
	o(s, i), o(c, i), o(l, i), s.prototype.prepare = a(function(e, t) {
		return t.length ? e.bind.apply(e, t) : e;
	}), s.prototype.run = a(function(e, t) {
		return e.run.apply(e, t).finalize(), this;
	}), s.prototype.get = a(function(e, t) {
		return e.get.apply(e, t).finalize(), this;
	}), s.prototype.all = a(function(e, t) {
		return e.all.apply(e, t).finalize(), this;
	}), s.prototype.each = a(function(e, t) {
		return e.each.apply(e, t).finalize(), this;
	}), s.prototype.map = a(function(e, t) {
		return e.map.apply(e, t).finalize(), this;
	}), s.prototype.backup = function() {
		let e;
		return e = arguments.length <= 2 ? new l(this, arguments[0], "main", "main", !0, arguments[1]) : new l(this, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]), e.retryErrors = [r.BUSY, r.LOCKED], e;
	}, c.prototype.map = function() {
		let e = Array.prototype.slice.call(arguments), t = e.pop();
		return e.push(function(e, n) {
			if (e) return t(e);
			let r = {};
			if (n.length) {
				let e = Object.keys(n[0]), t = e[0];
				if (e.length > 2) for (let e = 0; e < n.length; e++) r[n[e][t]] = n[e];
				else {
					let i = e[1];
					for (let e = 0; e < n.length; e++) r[n[e][t]] = n[e][i];
				}
			}
			t(e, r);
		}), this.all.apply(this, e);
	};
	var u = !1, d = [
		"trace",
		"profile",
		"change"
	];
	s.prototype.addListener = s.prototype.on = function(e) {
		let t = i.prototype.addListener.apply(this, arguments);
		return d.indexOf(e) >= 0 && this.configure(e, !0), t;
	}, s.prototype.removeListener = function(e) {
		let t = i.prototype.removeListener.apply(this, arguments);
		return d.indexOf(e) >= 0 && !this._events[e] && this.configure(e, !1), t;
	}, s.prototype.removeAllListeners = function(e) {
		let t = i.prototype.removeAllListeners.apply(this, arguments);
		return d.indexOf(e) >= 0 && this.configure(e, !1), t;
	}, r.verbose = function() {
		if (!u) {
			let e = w();
			[
				"prepare",
				"get",
				"run",
				"all",
				"each",
				"map",
				"close",
				"exec"
			].forEach(function(t) {
				e.extendTrace(s.prototype, t);
			}), [
				"bind",
				"get",
				"run",
				"all",
				"each",
				"map",
				"reset",
				"finalize"
			].forEach(function(t) {
				e.extendTrace(c.prototype, t);
			}), u = !0;
		}
		return r;
	};
})))(), 1), E = a.dirname(o(import.meta.url)), D = a.join(E, "sky_memory.sqlite"), O = new T.default.Database(D, (e) => {
	e ? console.error("Error opening database", e.message) : (console.log("Connected to the SQLite database."), O.run("\n      CREATE TABLE IF NOT EXISTS commands (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,\n        input TEXT\n      )\n    "), O.run("\n      CREATE TABLE IF NOT EXISTS execution_logs (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        command_id INTEGER,\n        action TEXT,\n        status TEXT,\n        details TEXT,\n        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,\n        FOREIGN KEY (command_id) REFERENCES commands(id)\n      )\n    "), O.run("\n      CREATE TABLE IF NOT EXISTS session_history (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        event_type TEXT,\n        data TEXT,\n        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP\n      )\n    "));
}), k = class {
	temporalBreadcrumbs = [];
	getImmediateContext() {
		return {
			activeApp: "VS Code",
			selectedText: "",
			windowTitle: "Sky Project"
		};
	}
	addTemporalEvent(e) {
		this.temporalBreadcrumbs.push(e), this.temporalBreadcrumbs.length > 10 && this.temporalBreadcrumbs.shift();
	}
	getTemporalContext() {
		return this.temporalBreadcrumbs;
	}
	async logCommand(e) {
		return new Promise((t, n) => {
			O.run("INSERT INTO commands (input) VALUES (?)", [e], function(e) {
				e ? n(e) : t(this.lastID);
			});
		});
	}
	async logExecution(e, t, n, r) {
		return new Promise((i, a) => {
			O.run("INSERT INTO execution_logs (command_id, action, status, details) VALUES (?, ?, ?, ?)", [
				e,
				t,
				n,
				r
			], function(e) {
				e ? a(e) : i(this.lastID);
			});
		});
	}
	getCombinedContext() {
		return {
			immediate: this.getImmediateContext(),
			temporal: this.getTemporalContext()
		};
	}
}, A = class {
	needsValidation(e) {
		let t = y[e];
		return t ? t.category === "sensitive" : !1;
	}
}, j = r.dirname(i(import.meta.url)), M = new v(), N = new b(), P = new k(), F = new A();
process.env.DIST = r.join(j, "../dist"), process.env.VITE_PUBLIC = t.isPackaged ? process.env.DIST : r.join(process.env.DIST || "", "../public");
var I, L = process.env.VITE_DEV_SERVER_URL;
function R() {
	I = new e({
		icon: r.join(process.env.VITE_PUBLIC || "", "electron-vite.svg"),
		webPreferences: { preload: r.join(j, "preload.js") },
		width: 800,
		height: 600,
		frame: !1,
		transparent: !0
	}), I.webContents.on("did-finish-load", () => {
		I?.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
	}), L ? I.loadURL(L) : I.loadFile(r.join(process.env.DIST || "", "index.html"));
}
t.on("window-all-closed", () => {
	process.platform !== "darwin" && (t.quit(), I = null);
}), t.on("activate", () => {
	e.getAllWindows().length === 0 && R();
}), t.whenReady().then(() => {
	R(), n.handle("execute-command", async (e, t) => {
		try {
			let n = await P.logCommand(t), r = P.getCombinedContext(), i = await M.parseIntent(t, r);
			e.sender.send("plan-generated", i);
			for (let t = 0; t < i.steps.length; t++) {
				let a = i.steps[t];
				F.needsValidation(a.action) && (e.sender.send("validation-required", {
					index: t,
					step: a
				}), console.log(`[Validation Gate] Sensitive action paused: ${a.action}`), await new Promise((e) => setTimeout(e, 1500)), console.log("[Validation Gate] Auto-approved for demo.")), e.sender.send("step-started", {
					index: t,
					step: a
				});
				let o = await N.executeStep(a, () => {});
				if (await P.logExecution(n, a.action, o.success ? "success" : "failure", o.message || ""), o.success) e.sender.send("step-completed", {
					index: t,
					result: o
				}), P.addTemporalEvent({
					event: `action_completed: ${a.action}`,
					timestamp: /* @__PURE__ */ new Date()
				});
				else {
					e.sender.send("step-failed", {
						index: t,
						result: o
					});
					let n = await M.handleFailure(a, o.message || "Unknown error", r);
					return e.sender.send("self-healing-triggered", {
						index: t,
						healingPlan: n
					}), {
						status: "healed",
						plan: n
					};
				}
			}
			return {
				status: "completed",
				plan: i
			};
		} catch (t) {
			let n = t instanceof Error ? t.message : "Unknown error";
			return e.sender.send("execution-error", { message: n }), {
				status: "error",
				message: n
			};
		}
	});
});
//#endregion
