/* ==========================================================================
   KARTIK OS — script.js
   Boot sequence, window manager (drag/focus/minimize/maximize), taskbar,
   start menu, context menu, terminal engine, matrix rain, easter eggs.
   ========================================================================== */

/* ---------- EDIT ME: quick config ---------- */
const CONFIG = {
  email: "kartikp9595@gmail.com",
  github: "https://github.com/Kartik-git95",
  linkedin: "https://linkedin.com/in/kartik-padmanabhan",
  resume: "https://kartik-git95.github.io/kartikpadmanabhan_portfolio/assets/kartikpadmanabhan_Resume.pdf"
};

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile = () => matchMedia("(max-width: 640px)").matches;

/* ---------- Toasts ---------- */
function toast(text, ms = 4200) {
  const box = $("#toasts");
  if (!box) return;
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = text;
  box.appendChild(el);
  setTimeout(() => {
    el.classList.add("out");
    setTimeout(() => el.remove(), 350);
  }, ms);
}

/* ---------- Window manager ---------- */
const APPS = {
  terminal: { x: 0.46, y: 0.08, w: 620, h: 430, title: "terminal" },
  about:    { x: 0.16, y: 0.12, w: 560, h: 580, title: "about.txt" },
  skills:   { x: 0.22, y: 0.10, w: 680, h: 550, title: "skills.exe" },
  projects: { x: 0.15, y: 0.07, w: 660, h: 600, title: "projects/" },
  education:{ x: 0.26, y: 0.14, w: 600, h: 520, title: "education.log" },
  contact:  { x: 0.30, y: 0.11, w: 560, h: 580, title: "contact.cfg" },
  bin:      { x: 0.50, y: 0.28, w: 520, h: 460, title: "recycle bin" }
};

const wm = {
  z: 100,
  windows: new Map(), // app -> { el, taskbarBtn, minimized }

  open(app) {
    const el = $("#win-" + app);
    if (!el) return;
    let state = this.windows.get(app);

    if (!state) {
      state = { el, minimized: false };
      this.windows.set(app, state);
      this.place(el, app);
      el.classList.add("hidden");
    }

    el.classList.remove("hidden");
    el.classList.remove("minimized");
    state.minimized = false;

    if (!el.classList.contains("open")) {
      el.classList.add("open");
      setTimeout(() => { el.style.opacity = ""; }, 300);
    }

    this.focus(app);
    this.syncTaskbar(app);

    if (app === "terminal") {
      setTimeout(() => $("#termInput")?.focus({ preventScroll: true }), 80);
      termGreet();
    }
    if (app === "skills") animateSkills();
  },

  place(el, app) {
    const cfg = APPS[app];
    const d = $("#desktop");
    const dw = d.clientWidth, dh = d.clientHeight;
    let w = Math.min(cfg.w, dw - 24);
    let h = Math.min(cfg.h, dh - 24);
    el.style.width = w + "px";
    el.style.height = h + "px";
    el.style.left = Math.max(6, Math.round((dw - w) * cfg.x)) + "px";
    el.style.top = Math.max(6, Math.round((dh - h) * cfg.y)) + "px";
  },

  focus(app) {
    const state = this.windows.get(app);
    if (!state) return;
    $$(".window").forEach((w) => w.classList.remove("active"));
    state.el.classList.add("active");
    state.el.style.zIndex = ++this.z;
    this.syncTaskbar(app);
  },

  close(app) {
    const state = this.windows.get(app);
    if (!state) return;
    state.el.classList.add("hidden");
    state.el.classList.remove("open", "active", "maximized");
    state.el.style.opacity = "";
    this.windows.delete(app);
    this.syncTaskbar(app);
  },

  minimize(app) {
    const state = this.windows.get(app);
    if (!state) return;
    state.el.classList.add("minimized");
    state.minimized = true;
    this.syncTaskbar(app);
  },

  maximize(app) {
    const state = this.windows.get(app);
    if (!state) return;
    state.el.classList.toggle("maximized");
    this.focus(app);
  },

  toggleFromTaskbar(app) {
    const state = this.windows.get(app);
    if (!state) return this.open(app);
    if (state.minimized) { this.open(app); return; }
    if (state.el.classList.contains("active")) this.minimize(app);
    else this.focus(app);
  },

  syncTaskbar(activeApp) {
    const bar = $("#taskbarApps");
    if (!bar) return;
    bar.innerHTML = "";
    for (const [app, state] of this.windows) {
      if (!bar.querySelector('[data-tbapp="' + app + '"]')) {
        const btn = document.createElement("button");
        btn.className = "tb-app";
        btn.dataset.tbapp = app;
        btn.innerHTML = '<span class="tb-label">' + APPS[app].title + "</span>";
        btn.addEventListener("click", () => this.toggleFromTaskbar(app));
        bar.appendChild(btn);
      }
    }
    $$(".tb-app", bar).forEach((b) => {
      const app = b.dataset.tbapp;
      const st = this.windows.get(app);
      const isActive = app === activeApp && st && !st.minimized && st.el.classList.contains("active");
      b.classList.toggle("active", isActive);
    });
  }
};

/* Window events: controls + focus + drag */
$$(".window").forEach((win) => {
  const app = win.dataset.app;

  win.addEventListener("pointerdown", () => wm.focus(app), true);

  $$(".tb-btn", win).forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const a = btn.dataset.action;
      if (a === "close") wm.close(app);
      if (a === "minimize") wm.minimize(app);
      if (a === "maximize") wm.maximize(app);
    });
  });

  const bar = $("[data-titlebar]", win);
  if (bar) {
    bar.addEventListener("dblclick", () => wm.maximize(app));
    makeDraggable(win, bar);
  }
});

function makeDraggable(win, handle) {
  let startX = 0, startY = 0, startL = 0, startT = 0, dragging = false;

  handle.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".tb-btn")) return;
    if (win.classList.contains("maximized") || isMobile()) return;
    dragging = true;
    startX = e.clientX; startY = e.clientY;
    startL = win.offsetLeft; startT = win.offsetTop;
    handle.setPointerCapture(e.pointerId);
  });

  handle.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const d = $("#desktop");
    const nl = Math.min(Math.max(0, startL + e.clientX - startX), d.clientWidth - 80);
    const nt = Math.min(Math.max(0, startT + e.clientY - startY), d.clientHeight - 40);
    win.style.left = nl + "px";
    win.style.top = nt + "px";
  });

  const stop = () => { dragging = false; };
  handle.addEventListener("pointerup", stop);
  handle.addEventListener("pointercancel", stop);
}

/* Desktop icons + start menu app buttons */
$$("[data-app]").forEach((el) => {
  el.addEventListener("click", () => {
    wm.open(el.dataset.app);
    closeStartMenu();
  });
});

$$("[data-link]").forEach((el) => {
  el.addEventListener("click", () => {
    window.open(el.dataset.link, "_blank", "noopener");
    toast("opening resume.pdf in a new tab...");
  });
});

/* ---------- Start menu ---------- */
const startMenu = $("#startMenu");
const startBtn = $("#startBtn");

function closeStartMenu() {
  startMenu?.classList.remove("open");
  startBtn?.classList.remove("open");
  if (startBtn) startBtn.setAttribute("aria-expanded", "false");
}

startBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  const open = startMenu.classList.toggle("open");
  startBtn.classList.toggle("open", open);
  startBtn.setAttribute("aria-expanded", String(open));
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".start-menu") && !e.target.closest(".start-btn")) closeStartMenu();
  if (!e.target.closest(".ctx-menu")) $("#ctxMenu")?.classList.remove("open");
});

/* ---------- Context menu (right-click desktop) ---------- */
const ctxMenu = $("#ctxMenu");
$("#desktop").addEventListener("contextmenu", (e) => {
  if (e.target.closest(".window")) return;
  e.preventDefault();
  ctxMenu.classList.add("open");
  const mw = ctxMenu.offsetWidth, mh = ctxMenu.offsetHeight;
  ctxMenu.style.left = Math.min(e.clientX, innerWidth - mw - 8) + "px";
  ctxMenu.style.top = Math.min(e.clientY, innerHeight - mh - 54) + "px";
});

$$(".ctx-item").forEach((item) => {
  item.addEventListener("click", () => {
    ctxMenu.classList.remove("open");
    const a = item.dataset.ctx;
    if (a === "terminal") wm.open("terminal");
    if (a === "about") wm.open("about");
    if (a === "theme") { toggleTheme(); toast("theme switched."); }
    if (a === "refresh") toast("refreshed nothing — it's all in RAM.");
  });
});

/* ---------- Theme ---------- */
function toggleTheme() {
  const root = document.documentElement;
  const next = root.dataset.theme === "phosphor" ? "amber" : "phosphor";
  root.dataset.theme = next;
  try { localStorage.setItem("os-theme", next); } catch (e) {}
  window.dispatchEvent(new CustomEvent("themechange"));
}
$("#themeToggle")?.addEventListener("click", () => {
  toggleTheme();
  toast(document.documentElement.dataset.theme === "amber" ? "amber CRT online." : "phosphor CRT online.");
});

/* ---------- Clock ---------- */
(function clock() {
  const el = $("#clock");
  if (!el) return;
  const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const p = (n) => String(n).padStart(2, "0");
  function tick() {
    const d = new Date();
    el.textContent = DAYS[d.getDay()] + " " + p(d.getDate()) + " " + MON[d.getMonth()] + " · " +
      p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
  }
  tick();
  setInterval(tick, 1000);
})();

/* ---------- Skills: animate bars + end-task joke ---------- */
function animateSkills() {
  const rows = $$("#win-skills .taskman-row[data-cpu]");
  const count = $("#skillCount");
  if (count) count.textContent = rows.length;
  rows.forEach((row, i) => {
    const v = Math.min(100, Math.max(0, Number(row.dataset.cpu) || 0));
    const fill = $(".tm-bar i", row);
    if (fill) {
      fill.style.width = "0";
      setTimeout(() => { fill.style.width = v + "%"; }, 60 + i * 45);
    }
    const label = $(".tm-cpu b", row);
    if (label) label.textContent = v + "%";
  });
}

$$(".tm-end").forEach((btn) => {
  btn.addEventListener("click", () => {
    const row = btn.closest(".taskman-row");
    row.classList.remove("denied");
    void row.offsetWidth;
    row.classList.add("denied");
    const name = $(".tm-name", row)?.textContent || "process";
    toast(name + " cannot be ended — it's load-bearing.");
  });
});

/* ---------- Recycle bin joke ---------- */
$("#emptyBin")?.addEventListener("click", () => {
  toast("recycle bin emptied. it was already empty — like a black box.");
});

/* ---------- Contact form (mailto) ---------- */
$("#mailForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("#cfName"), email = $("#cfEmail"), msg = $("#cfMsg");
  const bad = [name, email, msg].filter((f) =>
    !f.value.trim() || (f === email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim()))
  );
  if (bad.length) {
    bad.forEach((f) => {
      f.classList.add("error");
      setTimeout(() => f.classList.remove("error"), 700);
    });
    toast("transmission failed — check the fields.", true);
    return;
  }
  const subject = encodeURIComponent("KARTIK OS contact — " + name.value.trim());
  const body = encodeURIComponent(msg.value.trim() + "\n\n— " + name.value.trim() + " (" + email.value.trim() + ")");
  window.location.href = "mailto:" + CONFIG.email + "?subject=" + subject + "&body=" + body;
  toast("opening your email client to transmit...");
  e.target.reset();
});

/* ---------- Matrix rain ---------- */
(function matrix() {
  const canvas = $("#matrix");
  if (!canvas || REDUCED) return;
  const ctx = canvas.getContext("2d");
  const CHARS = "0101Σσμλ%$#*+=<>";
  let w, h, cols, drops, timer = null;

  function color() {
    return getComputedStyle(document.documentElement).getPropertyValue("--rain").trim() || "61, 255, 124";
  }
  let rgb = color();

  function resize() {
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
    cols = Math.floor(w / 16);
    drops = Array.from({ length: cols }, () => Math.floor(Math.random() * -60));
  }

  function draw() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.14)";
    ctx.fillRect(0, 0, w, h);
    ctx.font = "14px 'Share Tech Mono', monospace";
    for (let i = 0; i < cols; i++) {
      const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
      ctx.fillStyle = "rgba(" + rgb + ", 0.85)";
      ctx.fillText(ch, i * 16, drops[i] * 16);
      if (drops[i] * 16 > h && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }

  function start() { if (!timer) timer = setInterval(draw, 80); }
  function stop() { clearInterval(timer); timer = null; }

  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());
  window.addEventListener("themechange", () => { rgb = color(); });

  resize();
  start();
})();

/* ---------- Terminal engine ---------- */
const termOut = $("#termOut");
const termInput = $("#termInput");
let termGreeted = false;
const history = [];
let histIdx = -1;

function termGreet() {
  if (termGreeted || !termOut) return;
  termGreeted = true;
  printLines([
    ["KARTIK OS [v8.05] — data science terminal", "t-bright"],
    ["welcome, guest. this machine runs on python, sql & patience.", "t-dim"],
    ["type 'help' to see available commands.", "t-dim"],
    [""]
  ]);
}

function printLine(text, cls) {
  const div = document.createElement("div");
  div.className = "term-line" + (cls ? " " + cls : "");
  div.textContent = text;
  termOut.appendChild(div);
  termOut.scrollTop = termOut.scrollHeight;
  return div;
}

function printLines(lines) {
  lines.forEach(([text, cls], i) => {
    if (REDUCED) { printLine(text, cls); return; }
    setTimeout(() => printLine(text, cls), i * 26);
  });
}

const COMMANDS = {
  help: () => printLines([
    ["AVAILABLE COMMANDS", "t-bright"],
    ["  about         who is kartik"],
    ["  skills        task manager of skills"],
    ["  projects      flagship builds"],
    ["  education     academic log"],
    ["  contact       how to reach me"],
    ["  socials       github / linkedin / email / resume"],
    ["  neofetch      system info, the fun way"],
    ["  open <app>    launch a window: about|skills|projects|education|contact|bin"],
    ["  theme         switch phosphor / amber"],
    ["  clear         clear the screen"],
    ["  exit          close terminal"],
    ["psst — try 'sudo hire kartik' or 'hack'", "t-dim"]
  ]),

  about: () => printLines([
    ["kartik padmanabhan — data analyst (open to roles)", "t-bright"],
    ["location : kothamangalam, kerala, IN"],
    ["study    : B.Tech CSE (data science), MA college — CGPA 8.05"],
    ["focus    : explainable AI · churn prediction · real-time CV"],
    ["", "t-dim"],
    ["i turn messy, imbalanced datasets into models people actually"],
    ["trust — then explain why the model said what it said."],
    ["run 'open about' for the full system properties.", "t-dim"]
  ]),

  skills: () => printLines([
    ["python, sql and the usual suspects:", "t-bright"],
    ["pandas · numpy · scikit-learn · xgboost · shap · matplotlib"],
    ["flask · power bi · excel · mysql · git · jupyter"],
    ["run 'open skills' to see the task manager.", "t-dim"]
  ]),

  projects: () => printLines([
    ["[1] churn_prediction_xai.app", "t-bright"],
    ["    ~7,000 telecom records · 26% imbalance · SHAP explainability"],
    ["[2] crowd_detection_framework.sys", "t-bright"],
    ["    YOLOv8 (sparse) + CSRNet (dense) · live flask alerts"],
    ["run 'open projects' for the full specs.", "t-dim"]
  ]),

  education: () => printLines([
    ["2023 — present : B.Tech CSE (data science), MA college, 8.05 CGPA"],
    ["2021 — 2023    : biology science, govt HSS vayakkara, 99.25%"],
    ["run 'open education' to read the full log.", "t-dim"]
  ]),

  contact: () => printLines([
    ["email    : " + CONFIG.email, "t-bright"],
    ["github   : github.com/Kartik-git95"],
    ["linkedin : linkedin.com/in/kartik-padmanabhan"],
    ["run 'open contact' to compose a message.", "t-dim"]
  ]),

  socials: () => printLines([
    ["github   → " + CONFIG.github, "t-bright"],
    ["linkedin → " + CONFIG.linkedin, "t-bright"],
    ["email    → " + CONFIG.email, "t-bright"],
    ["resume   → " + CONFIG.resume, "t-bright"]
  ]),

  neofetch: () => printLines([
    ["     ██╗  ██╗ █████╗ ██████╗ ██╗  ██╗██╗  ██╗", "t-ascii"],
    ["     ██║ ██╔╝██╔══██╗██╔══██╗██║ ██╔╝██║ ██╔╝", "t-ascii"],
    ["     █████╔╝ ███████║██████╔╝██████╔╝█████╔╝", "t-ascii"],
    ["     ██╔═██╗ ██╔══██║██╔══██╗██╔═██╗██╔═██╗", "t-ascii"],
    ["     ██║  ██╗██║  ██║██║  ██╗██║  ██╗██║  ██╗", "t-ascii"],
    ["     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝", "t-ascii"],
    ["  kartik@os", "t-bright"],
    ["  ─────────────────────────────────────", "t-dim"],
    ["  OS        KARTIK OS v8.05 (CGPA edition)"],
    ["  HOST      kothamangalam, kerala, IN"],
    ["  KERNEL    python 3.x + suspicion of black boxes"],
    ["  SHELL     jupyter-notebook"],
    ["  UPTIME    B.Tech CSE (DS) since 2023"],
    ["  PACKAGES  pandas numpy sklearn xgboost shap"],
    ["  MEMORY    8.05 / 10 CGPA"],
    ["  RESOLUTION ROC-AUC friendly"]
  ]),

  whoami: () => printLine("guest — but you could be a hiring manager. type 'about'.", "t-bright"),

  ls: () => printLines([
    ["projects/   skills/   about.txt   contact.cfg   education.log"],
    ["no_black_boxes/   resume.pdf", "t-dim"]
  ]),

  date: () => printLine(new Date().toString()),

  clear: () => { termOut.innerHTML = ""; },

  theme: () => {
    toggleTheme();
    printLine("theme → " + document.documentElement.dataset.theme, "t-bright");
  },

  hack: () => {
    const burst = document.createElement("div");
    burst.className = "burst";
    burst.textContent = "ACCESSING MAINFRAME...";
    document.body.appendChild(burst);
    setTimeout(() => {
      burst.remove();
      printLine("just kidding. the only thing i hack is class imbalance.", "t-bright");
    }, 1400);
  },

  exit: () => {
    printLine("closing terminal...", "t-dim");
    setTimeout(() => wm.close("terminal"), 350);
  },

  sudo: (args) => {
    if (args.join(" ").toLowerCase().replace(/\s+/g, " ").trim() === "hire kartik") {
      printLines([
        ["[sudo] password for guest: ********", "t-dim"],
        ["ACCESS GRANTED.", "t-bright"],
        ["hiring initiative queued → " + CONFIG.email, "t-bright"],
        ["smart move. offer letter template attached.", "t-dim"]
      ]);
    } else {
      printLine("guest is not in the sudoers file. this incident will be reported.", "t-err");
    }
  },

  open: (args) => {
    const app = (args[0] || "").toLowerCase();
    if (APPS[app] && app !== "terminal") {
      wm.open(app);
      printLine("launching " + APPS[app].title + "...", "t-bright");
    } else if (app === "terminal") {
      printLine("terminal is already running. you are inside it.", "t-dim");
    } else {
      printLine("open: unknown app '" + app + "' — try about, skills, projects, education, contact, bin", "t-err");
    }
  },

  resume: () => {
    printLine("opening resume.pdf in a new tab...", "t-bright");
    window.open(CONFIG.resume, "_blank", "noopener");
  },

  echo: (args) => printLine(args.join(" "))
};

function runCommand(raw) {
  const input = raw.trim();
  printLine("kartik@os:~$ " + input, "t-cmd");
  if (!input) return;
  history.push(input);
  histIdx = history.length;

  const parts = input.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);

  if (COMMANDS[cmd]) COMMANDS[cmd](args);
  else printLine("command not found: " + cmd + " — try 'help'", "t-err");
}

termInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    runCommand(termInput.value);
    termInput.value = "";
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (histIdx > 0) { histIdx--; termInput.value = history[histIdx] || ""; }
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    if (histIdx < history.length) { histIdx++; termInput.value = history[histIdx] || ""; }
  }
});

/* Clicking terminal focuses input (unless selecting text) */
$("#win-terminal")?.addEventListener("click", () => {
  if (window.getSelection().isCollapsed) termInput?.focus({ preventScroll: true });
});

/* ---------- Shutdown / reboot ---------- */
const shutdownOverlay = $("#shutdownOverlay");

$("#shutdownBtn")?.addEventListener("click", () => {
  closeStartMenu();
  shutdownOverlay.hidden = false;
});

shutdownOverlay?.addEventListener("click", () => {
  shutdownOverlay.hidden = true;
  reboot();
});

/* ---------- Boot sequence ---------- */
const BOOT_LINES = [
  ["KARTIK BIOS v8.05 — CGPA EDITION", ""],
  ["CHECKING MEMORY ......... 8.05 / 8.05 OK", ""],
  ["DETECTING DATASETS ...... 7,000 RECORDS FOUND", ""],
  ["CLASS IMBALANCE ......... 26% — COMPENSATING", ""],
  ["LOADING shap.xai ........ EXPLAINABILITY ENABLED", "b-bright"],
  ["MOUNTING /projects ...... 2 PROJECTS MOUNTED", ""],
  ["LOADING skills.sys ...... 22 MODULES LOADED", ""],
  ["QUARANTINE SCAN ......... 0 BLACK BOXES FOUND", "b-bright"]
];

function barText(pct) {
  const filled = Math.round(pct * 22);
  return "[" + "█".repeat(filled) + "░".repeat(22 - filled) + "] " + Math.round(pct * 100) + "%";
}

let bootDone = false;

function finishBoot() {
  if (bootDone) return;
  bootDone = true;
  const boot = $("#boot");
  boot.classList.add("done");

  if (!REDUCED) {
    const flash = document.createElement("div");
    flash.className = "crt-on";
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 600);
  }

  document.body.classList.remove("booting");
  setTimeout(() => {
    boot.remove();
    wm.open("terminal");
    toast("system ready — explore the desktop or type 'help'.");
  }, REDUCED ? 100 : 450);
}

function runBoot() {
  const log = $("#bootLog");
  if (!log) return finishBoot();
  bootDone = false;
  log.textContent = "";
  document.body.classList.add("booting");

  if (REDUCED) {
    log.textContent = BOOT_LINES.map((l) => l[0]).join("\n") + "\n\n" + barText(1) + "\nSTARTING KARTIK OS ...";
    setTimeout(finishBoot, 400);
    return;
  }

  let i = 0;
  const barLine = document.createElement("div");
  barLine.className = "b-dim";

  function next() {
    if (bootDone) return;
    if (i < BOOT_LINES.length) {
      const [text, cls] = BOOT_LINES[i];
      const div = document.createElement("div");
      if (cls) div.className = cls;
      div.textContent = text;
      log.appendChild(div);
      i++;
      setTimeout(next, 140 + Math.random() * 200);
    } else {
      log.appendChild(barLine);
      log.appendChild(document.createTextNode("\nSTARTING KARTIK OS ..."));
      let p = 0;
      const iv = setInterval(() => {
        if (bootDone) return clearInterval(iv);
        p += 0.07 + Math.random() * 0.07;
        barLine.textContent = barText(Math.min(1, p));
        if (p >= 1) { clearInterval(iv); setTimeout(finishBoot, 350); }
      }, 110);
    }
  }
  next();
}

function reboot() {
  // close everything for a fresh session
  for (const app of [...wm.windows.keys()]) wm.close(app);
  termGreeted = false;
  if (termOut) termOut.innerHTML = "";
  history.length = 0;
  histIdx = 0;

  const old = document.getElementById("boot");
  if (!old) {
    const boot = document.createElement("div");
    boot.className = "boot";
    boot.id = "boot";
    boot.innerHTML = '<div class="boot-inner"><pre class="boot-log mono" id="bootLog"></pre><p class="boot-skip mono">press any key to skip</p></div>';
    document.body.appendChild(boot);
  }
  runBoot();
}

/* Skip boot on keypress / click */
["keydown", "pointerdown"].forEach((ev) => {
  document.addEventListener(ev, (e) => {
    if (!bootDone && $("#boot") && !$("#boot").classList.contains("done")) {
      if (ev === "keydown" || e.target.closest(".boot")) finishBoot();
    }
  });
});

runBoot();
