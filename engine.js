// Core game engine: several games, each with rooms, items and recipes.
// Handles menu, intro, state, inventory (select / combine / use), popups, puzzle widgets,
// hints, timer, darkness/flashlight, particles and hover labels.
// Optional per-game UX extras (meta.ux): notebook, fx (sparkles, flying items, room fades),
// itemLabels (names under inventory icons), progress (room dots) and a CSS theme (meta.theme).
const Game = (() => {
  const games = {};
  const GAME_ORDER = [];
  let game = null; // current game definition
  let state = null;
  let timerId = null;
  let roomTimers = [];
  let pointer = { x: 800, y: 450 };
  let lastClient = { x: innerWidth / 2, y: innerHeight / 2 };

  const $ = (id) => document.getElementById(id);
  const room = () => game.rooms[state.room];
  const ux = (k) => !!(game && game.ux && game.ux[k]);

  // ---------- Definitions (called from game files) ----------
  function builder(g) {
    return {
      item: (id, icon, name) => { g.items[id] = { icon, name }; },
      recipe: (a, b, result, text) => { g.recipes[[a, b].sort().join("+")] = { result, text }; },
      room: (def) => { g.rooms[def.id] = def; g.order.push(def.id); },
    };
  }
  // meta: { title, emoji, difficulty (1-4), tagline, story, minutes, accent, music, ux, theme, winEmoji }
  function define(id, meta) {
    games[id] = { id, ...meta, rooms: {}, order: [], items: {}, recipes: {} };
    GAME_ORDER.push(id);
    return builder(games[id]);
  }
  const use = (id) => builder(games[id]);

  const DIFFICULTY = {
    1: { label: "Nem", cls: "d1", dots: "●○○○" },
    2: { label: "Normal", cls: "d2", dots: "●●○○" },
    3: { label: "Normal+", cls: "d3", dots: "●●●○" },
    4: { label: "Svær", cls: "d4", dots: "●●●●" },
  };

  // ---------- API given to rooms ----------
  const api = {
    flag: (k) => !!state.flags[k],
    get: (k) => state.flags[k],
    set: (k, v = true) => { state.flags[k] = v; state.just[k] = Date.now(); render(); },
    // true right after a flag was set: use it to play an "appear" animation only once
    just: (k) => !!(state && state.just[k] && Date.now() - state.just[k] < 900),
    has: (id) => state.inventory.includes(id),
    give(id) {
      if (api.has(id)) return;
      state.inventory.push(id);
      Sound.play("item");
      renderInventory(id);
      if (ux("fx")) flyItem(id);
      render(); // scenes may look different depending on what you carry
    },
    take(id) {
      state.inventory = state.inventory.filter((i) => i !== id);
      if (state.selected === id) state.selected = null;
      renderInventory();
      render();
    },
    say(text) {
      const m = $("message");
      m.innerHTML = text;
      if (ux("fx")) { m.classList.remove("msg-in"); void m.offsetWidth; m.classList.add("msg-in"); }
    },
    sound: (name) => (name === "success" ? success() : Sound.play(name)),
    modal: openModal,
    close: closeModal,
    modalOpen: () => !$("modal").classList.contains("hidden"),
    shake: shakeModal,
    render: () => render(),
    goTo: enterRoom,
    win,
    every(ms, fn) { roomTimers.push(setInterval(fn, ms)); },
    later(ms, fn) { roomTimers.push(setTimeout(fn, ms)); },
    itemName: (id) => game.items[id].name,
    pointer: () => pointer,
    burst: (x, y, n) => burst(x ?? lastClient.x, y ?? lastClient.y, n),
    note: addNote,
    codeLock,
    pickLock,
    cycleLock,
    sequenceLock,
    wordLock,
  };

  // ---------- Effects ----------
  function success() {
    Sound.play("success");
    if (ux("fx")) burst(lastClient.x, lastClient.y);
  }

  function burst(x, y, n = 14) {
    const layer = $("fx");
    const chars = game.fxChars || ["✨", "⭐", "❄️"];
    for (let i = 0; i < n; i++) {
      const s = document.createElement("span");
      s.className = "fx-spark";
      s.textContent = chars[i % chars.length];
      const a = (Math.PI * 2 * i) / n + Math.random() * 0.5;
      const d = 50 + Math.random() * 70;
      s.style.left = x + "px";
      s.style.top = y + "px";
      s.style.setProperty("--dx", Math.cos(a) * d + "px");
      s.style.setProperty("--dy", Math.sin(a) * d - 20 + "px");
      s.style.fontSize = 12 + Math.random() * 14 + "px";
      layer.appendChild(s);
      setTimeout(() => s.remove(), 900);
    }
  }

  function flyItem(id) {
    const target = $("invItems").querySelector(`[data-id="${id}"]`);
    if (!target) return;
    const r = target.getBoundingClientRect();
    const s = document.createElement("span");
    s.className = "fx-fly";
    s.textContent = game.items[id].icon;
    s.style.left = lastClient.x + "px";
    s.style.top = lastClient.y + "px";
    $("fx").appendChild(s);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      s.style.transform = `translate(${r.left + r.width / 2 - lastClient.x}px, ${r.top + r.height / 2 - lastClient.y}px) scale(.6)`;
      s.style.opacity = ".4";
    }));
    setTimeout(() => s.remove(), 650);
  }

  function toast(html) {
    const t = $("toast");
    t.innerHTML = html;
    t.classList.remove("show");
    void t.offsetWidth;
    t.classList.add("show");
  }

  // ---------- Notebook ----------
  function addNote(id, title, html) {
    if (!ux("notebook") || state.notes.some((n) => n.id === id)) return;
    state.notes.push({ id, title, html });
    updateNoteBtn(true);
    toast(`📓 Skrevet i notesbogen: <b>${title}</b>`);
  }
  function updateNoteBtn(pulse) {
    const b = $("noteBtn");
    b.classList.toggle("hidden", !ux("notebook"));
    $("noteCount").textContent = state && state.notes.length ? state.notes.length : "";
    if (pulse) { b.classList.remove("pulse-btn"); void b.offsetWidth; b.classList.add("pulse-btn"); }
  }
  function showNotebook() {
    Sound.play("click");
    const list = state.notes.length
      ? state.notes.map((n, i) => `<div class="note-entry"><div class="note-num">${i + 1}</div><div><b>${n.title}</b><div>${n.html}</div></div></div>`).join("")
      : `<p><i>Tom endnu. Når du finder spor, skriver du dem automatisk ned her.</i></p>`;
    openModal(`<div class="modal-icon">📓</div><h2 class="help-title">Notesbog</h2><div class="notebook">${list}</div>`, null, false, { cls: "notebook-box" });
  }

  // Type a word. opts: { icon, text, clue, answer, onSolve }
  function wordLock(opts) {
    openModal(`${head(opts)}
      <div class="row"><input id="wordInput" class="word-input" maxlength="${opts.answer.length + 4}" autocomplete="off" placeholder="${"_ ".repeat(opts.answer.length).trim()}"></div>
      <div class="row"><button class="action" id="tryWord">Prøv</button></div>`, (root) => {
      const input = root.querySelector("#wordInput");
      input.focus();
      const check = () => {
        if (input.value.trim().toUpperCase() === opts.answer.toUpperCase()) { success(); opts.onSolve(); }
        else { shakeModal(); input.value = ""; input.focus(); }
      };
      root.querySelector("#tryWord").addEventListener("click", check);
      input.addEventListener("keydown", (e) => { if (e.key === "Enter") check(); });
    });
  }

  // Fake API used for menu thumbnails (nothing solved, nothing in inventory)
  const thumbApi = { ...api, flag: () => false, get: () => undefined, has: () => false, just: () => false };

  // ---------- Rendering ----------
  function roomSvg(r, a, withDark) {
    const objs = r.objects
      .filter((o) => !o.visible || o.visible(a))
      .map((o) => `<g class="hot ${o.cls || ""}" data-id="${o.id}">${o.draw(a)}</g>`)
      .join("");
    const dark = withDark && r.dark ? r.dark(a) : 0;
    const darkLayer = dark
      ? `<defs><radialGradient id="flashGrad"><stop offset=".55" stop-color="#000"/><stop offset="1" stop-color="#fff"/></radialGradient>
         <mask id="darkMask"><rect width="1600" height="900" fill="#fff"/>
         <circle id="flash" cx="${pointer.x}" cy="${pointer.y}" r="${dark}" fill="url(#flashGrad)"/></mask></defs>
         <rect width="1600" height="900" fill="#03020a" opacity=".95" mask="url(#darkMask)" pointer-events="none"/>`
      : "";
    return `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">${Art.defs}${r.background(a)}${objs}` +
      `${r.foreground ? r.foreground(a) : ""}${Art.particles(r.particles)}${darkLayer}` +
      `<rect width="1600" height="900" fill="url(#vignette)" pointer-events="none"/></svg>`;
  }

  function render() {
    $("scene").innerHTML = roomSvg(room(), api, true);
    if (room().afterRender) room().afterRender(api);
  }

  function renderInventory(newId) {
    const labels = ux("itemLabels");
    $("invItems").innerHTML = state.inventory
      .map((id) => `<button class="inv-item ${state.selected === id ? "selected" : ""} ${newId === id ? (ux("fx") ? "arriving" : "new") : ""} ${labels ? "labelled" : ""}"
        data-id="${id}" title="${game.items[id].name}"><span class="inv-icon">${game.items[id].icon}</span>${labels ? `<span class="inv-name">${game.items[id].name}</span>` : ""}</button>`)
      .join("") || `<span class="inv-empty">${labels ? "Din sæk er tom – find ting i rummet" : "Tom"}</span>`;
  }

  function renderRoomName() {
    const r = room();
    const n = game.order.indexOf(state.room) + 1;
    if (!ux("progress")) {
      $("roomName").textContent = `${game.emoji} Rum ${n}/${game.order.length}: ${r.title}`;
      return;
    }
    const dots = game.order.map((id, i) => `<span class="prog-dot ${i < n - 1 ? "done" : i === n - 1 ? "now" : ""}" title="${game.rooms[id].title}">${i < n - 1 ? "✓" : i + 1}</span>`).join("<span class=\"prog-line\"></span>");
    $("roomName").innerHTML = `<div class="prog">${dots}</div><div class="prog-title">${r.title}</div>`;
  }

  // ---------- Input ----------
  function findObj(target) {
    const g = target.closest && target.closest(".hot");
    return g ? room().objects.find((o) => o.id === g.dataset.id) : null;
  }

  function onSceneClick(e) {
    const obj = findObj(e.target);
    if (!obj) return;
    if (state.selected) {
      const itemId = state.selected;
      api.say("");
      if (obj.use && obj.use(itemId, api)) {
        state.selected = null;
        renderInventory();
      } else {
        Sound.play("wrong");
        api.say(`${game.items[itemId].icon} ${cap(game.items[itemId].name)} virker ikke her.`);
      }
      return;
    }
    Sound.play("click");
    if (obj.click) obj.click(api);
  }

  function onSceneMove(e) {
    const svg = $("scene").querySelector("svg");
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    pointer = { x: p.x, y: p.y };
    const flash = svg.querySelector("#flash");
    if (flash) { flash.setAttribute("cx", p.x); flash.setAttribute("cy", p.y); }
    // Hover label
    const obj = findObj(e.target);
    const tip = $("tip");
    const label = obj && (typeof obj.label === "function" ? obj.label(api) : obj.label);
    if (label) {
      tip.textContent = label;
      tip.style.left = e.clientX + 16 + "px";
      tip.style.top = e.clientY + 14 + "px";
      tip.classList.add("show");
    } else tip.classList.remove("show");
  }

  function onInventoryClick(e) {
    const btn = e.target.closest(".inv-item");
    if (!btn) return;
    const id = btn.dataset.id;
    Sound.play("click");
    if (state.selected === id) {
      state.selected = null;
      api.say("");
    } else if (state.selected) {
      tryCombine(state.selected, id);
    } else {
      state.selected = id;
      api.say(`Du holder: ${game.items[id].icon} <b>${game.items[id].name}</b>. Klik på noget i rummet for at bruge den, eller på en anden ting i ${ux("itemLabels") ? "sækken" : "rygsækken"} for at sætte dem sammen.`);
    }
    renderInventory();
  }

  function tryCombine(a, b) {
    const r = game.recipes[[a, b].sort().join("+")];
    state.selected = null;
    if (!r) {
      Sound.play("wrong");
      api.say(`${game.items[a].icon} + ${game.items[b].icon} kan ikke sættes sammen.`);
      return;
    }
    api.take(a);
    api.take(b);
    api.give(r.result);
    success();
    openModal(`<div class="modal-icon">${game.items[a].icon} + ${game.items[b].icon} = ${game.items[r.result].icon}</div><p>${r.text}</p>`);
    api.say(`Du lavede: ${game.items[r.result].icon} <b>${game.items[r.result].name}</b>`);
  }

  // ---------- Popup ----------
  // locked = the player cannot close it themselves (used for short "freeze" events)
  // opts: { cls: extra class on the box (e.g. "wide"), onClose: called once when closed }
  let modalLocked = false;
  let modalOpts = {};
  function openModal(html, onMount, locked = false, opts = {}) {
    if (modalOpts.onClose) { const f = modalOpts.onClose; modalOpts = {}; f(); }
    modalLocked = locked;
    modalOpts = opts;
    const box = $("modalBox");
    box.className = opts.cls || "";
    $("modalClose").classList.toggle("hidden", locked);
    $("modalContent").innerHTML = html;
    $("modal").classList.remove("hidden");
    if (onMount) onMount($("modalContent"));
  }
  function closeModal(force) {
    if (modalLocked && force !== true) return;
    modalLocked = false;
    $("modalClose").classList.remove("hidden");
    $("modal").classList.add("hidden");
    $("modalBox").className = "";
    if (modalOpts.onClose) { const f = modalOpts.onClose; modalOpts = {}; f(); }
    modalOpts = {};
  }
  function shakeModal() {
    const box = $("modalBox");
    box.classList.remove("shake");
    void box.offsetWidth;
    box.classList.add("shake");
    Sound.play("wrong");
  }

  const head = (o) => `<div class="modal-icon">${o.icon || "🔒"}</div>${o.text ? `<p>${o.text}</p>` : ""}${o.clue || ""}`;

  // Number keypad lock. opts: { icon, text, clue, length, answer, onSolve }
  function codeLock(opts) {
    let input = "";
    let keys = "";
    for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9, "⌫", 0, "✔"]) keys += `<button data-k="${n}">${n}</button>`;
    openModal(`${head(opts)}<div class="lock-display" id="lockDisplay"></div><div class="keypad">${keys}</div>`, (root) => {
      const show = () => { root.querySelector("#lockDisplay").textContent = input.padEnd(opts.length, "_").split("").join(" "); };
      show();
      root.querySelectorAll(".keypad button").forEach((b) => b.addEventListener("click", () => {
        const k = b.dataset.k;
        if (k === "⌫") input = input.slice(0, -1);
        else if (k === "✔") check();
        else if (input.length < opts.length) { input += k; Sound.play("click"); }
        show();
        if (input.length === opts.length && k !== "✔" && k !== "⌫") setTimeout(check, 150);
      }));
      function check() {
        if (input === String(opts.answer)) { success(); opts.onSolve(); }
        else { shakeModal(); input = ""; show(); }
      }
    });
  }

  // Several rows, pick one option in each. rows: [{ seq, options, answer }]
  function pickLock(opts) {
    const pick = [];
    openModal(`${head(opts)}${opts.rows.map((r, i) => `
        ${r.seq ? `<div class="seq">${r.seq}</div>` : ""}
        <div class="row" data-row="${i}">${r.options.map((o) => `<button class="choice" data-v="${o}">${o}</button>`).join("")}</div>`).join("")}
        <div class="row"><button class="action" id="tryPick">${opts.button || "Prøv"}</button></div>`, (root) => {
      root.querySelectorAll("[data-row] .choice").forEach((b) => b.addEventListener("click", () => {
        pick[+b.parentElement.dataset.row] = b.dataset.v;
        b.parentElement.querySelectorAll(".choice").forEach((x) => x.classList.toggle("picked", x === b));
        Sound.play("click");
      }));
      root.querySelector("#tryPick").addEventListener("click", () => {
        if (opts.rows.every((r, i) => pick[i] === r.answer)) { success(); opts.onSolve(); }
        else shakeModal();
      });
    });
  }

  // Slots that cycle through symbols when clicked. answer: array of symbols
  function cycleLock(opts) {
    const idx = opts.answer.map((_, i) => (opts.start ? opts.start[i] : i) % opts.symbols.length);
    openModal(`${head(opts)}<p class="small-text">Klik for at skifte.</p>
      <div class="row" id="slots">${idx.map((s, i) => `<button class="choice slot" data-i="${i}">${opts.symbols[s]}</button>`).join("")}</div>
      <div class="row"><button class="action" id="tryCycle">${opts.button || "Prøv"}</button></div>`, (root) => {
      root.querySelectorAll("#slots .choice").forEach((b) => b.addEventListener("click", () => {
        const i = +b.dataset.i;
        idx[i] = (idx[i] + 1) % opts.symbols.length;
        b.innerHTML = opts.symbols[idx[i]];
        Sound.play("click");
      }));
      root.querySelector("#tryCycle").addEventListener("click", () => {
        if (idx.every((s, i) => opts.symbols[s] === opts.answer[i])) { success(); opts.onSolve(); }
        else shakeModal();
      });
    });
  }

  // Press buttons in the right order. buttons: [{ v, html, cls, tone }], answer: array of v
  function sequenceLock(opts) {
    let input = [];
    openModal(`${head(opts)}<div class="dots" id="seqDots"></div>
      <div class="row ${opts.rowCls || ""}">${opts.buttons.map((b) => `<button class="seq-btn ${b.cls || ""}" data-v="${b.v}">${b.html}</button>`).join("")}</div>`, (root) => {
      const dots = root.querySelector("#seqDots");
      root.querySelectorAll(".seq-btn").forEach((btn) => btn.addEventListener("click", () => {
        const b = opts.buttons.find((x) => x.v === btn.dataset.v);
        input.push(b.v);
        if (b.tone) Sound.note(b.tone); else Sound.play("click");
        btn.classList.remove("hit"); void btn.offsetWidth; btn.classList.add("hit");
        dots.innerHTML = input.map((v) => opts.buttons.find((x) => x.v === v).html).join(" ");
        const i = input.length - 1;
        if (input[i] !== opts.answer[i]) {
          shakeModal();
          input = [];
          setTimeout(() => { dots.innerHTML = ""; }, 400);
        } else if (input.length === opts.answer.length) {
          setTimeout(() => { success(); opts.onSolve(); }, 250);
        }
      }));
    });
  }

  // ---------- Hints ----------
  function giveHint() {
    const r = room();
    const goal = r.goal(api);
    const list = r.hints[goal];
    const step = state.hintStep[goal] || 0;
    api.say("💡 " + list[Math.min(step, list.length - 1)]);
    state.hintStep[goal] = step + 1;
    state.hintsUsed++;
  }

  // ---------- Rooms / flow ----------
  function clearTimers() {
    roomTimers.forEach((t) => { clearInterval(t); clearTimeout(t); });
    roomTimers = [];
  }

  function enterRoom(id) {
    clearTimers();
    closeModal(true);
    state.room = id;
    state.selected = null;
    const scene = $("scene");
    scene.className = "";
    if (ux("fx")) { void scene.offsetWidth; scene.classList.add("room-enter"); }
    const r = room();
    const n = game.order.indexOf(id) + 1;
    renderRoomName();
    render();
    renderInventory();
    api.say(r.intro);
    if (r.enter) r.enter(api);
    const banner = $("banner");
    banner.innerHTML = `<small>Rum ${n} af ${game.order.length}</small>${r.title}`;
    banner.classList.remove("show");
    void banner.offsetWidth;
    banner.classList.add("show");
    if (n > 1) Sound.play("door");
  }

  function fmt(s) { return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; }

  function showScreen(id) {
    ["menuScreen", "introScreen", "endScreen"].forEach((s) => $(s).classList.toggle("hidden", s !== id));
    // Thumbnails are removed when hidden so their SVG ids never shadow the live scene
    if (id !== "menuScreen") $("gameGrid").innerHTML = "";
    if (id !== "introScreen") $("introArt").innerHTML = "";
  }

  function setTheme(t) {
    document.body.className = document.body.className.replace(/\btheme-\S+/g, "").trim();
    if (t) document.body.classList.add("theme-" + t);
  }

  function showMenu() {
    clearInterval(timerId);
    clearTimers();
    closeModal(true);
    Sound.stopMusic();
    document.body.style.removeProperty("--accent");
    setTheme(null);
    showScreen("menuScreen");
    $("gameGrid").innerHTML = GAME_ORDER.map((id, i) => {
      const g = games[id];
      const d = DIFFICULTY[g.difficulty];
      return `<button class="game-card ${g.isNew ? "is-new" : ""}" data-game="${id}" style="--accent:${g.accent}">
        <div class="card-art">${roomSvg(g.rooms[g.order[0]], thumbApi, false)}${g.isNew ? `<span class="new-badge">NYT!</span>` : ""}</div>
        <div class="card-body">
          <div class="card-num">Spil ${i + 1}</div>
          <div class="card-title">${g.emoji} ${g.title}</div>
          <div class="card-tag">${g.tagline}</div>
          <div class="card-meta"><span class="diff ${d.cls}">${d.dots} ${d.label}</span><span>${g.order.length} rum · ca. ${g.minutes} min</span></div>
        </div></button>`;
    }).join("");
  }

  function showIntro(id) {
    game = games[id];
    document.body.style.setProperty("--accent", game.accent);
    setTheme(game.theme);
    showScreen("introScreen");
    const d = DIFFICULTY[game.difficulty];
    $("introArt").innerHTML = roomSvg(game.rooms[game.order[0]], thumbApi, false);
    $("introTitle").textContent = `${game.emoji} ${game.title}`;
    $("introDiff").innerHTML = `<span class="diff ${d.cls}">${d.dots} ${d.label}</span> · ${game.order.length} rum · ca. ${game.minutes} min`;
    $("introStory").innerHTML = game.story;
  }

  function start() {
    Sound.init();
    Sound.startMusic(game.music);
    state = { room: null, inventory: [], selected: null, flags: {}, just: {}, notes: [], seconds: 0, hintsUsed: 0, hintStep: {} };
    ["menuScreen", "introScreen", "endScreen"].forEach((s) => $(s).classList.add("hidden"));
    $("gameGrid").innerHTML = "";
    $("introArt").innerHTML = "";
    $("timer").textContent = "⏱️ 00:00";
    updateNoteBtn(false);
    clearInterval(timerId);
    timerId = setInterval(() => { state.seconds++; $("timer").textContent = "⏱️ " + fmt(state.seconds); }, 1000);
    const startRoom = new URLSearchParams(location.search).get("room"); // testing: ?game=prison&room=corridor
    enterRoom(game.rooms[startRoom] ? startRoom : game.order[0]);
  }

  function win(html) {
    clearInterval(timerId);
    clearTimers();
    closeModal(true);
    Sound.stopMusic();
    Sound.play("win");
    const hintText = state.hintsUsed === 0 ? "helt uden ledetråde! 🏆" : `og brugte ${state.hintsUsed} × 💡`;
    $("endTitle").textContent = game.winTitle || "Du slap ud!";
    $("endEmoji").textContent = game.winEmoji || "🎉🕵️🎉";
    $("endText").innerHTML = `Tid: <b>${fmt(state.seconds)}</b> ${hintText}<br><br>${html}`;
    showScreen("endScreen");
    if (ux("fx")) [0, 250, 500, 800].forEach((t, i) => setTimeout(() => burst(innerWidth * (0.2 + 0.2 * i), innerHeight * 0.3, 18), t));
  }

  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  function init() {
    // Remember where the player last clicked (used for sparkles and flying items)
    document.addEventListener("pointerdown", (e) => { lastClient = { x: e.clientX, y: e.clientY }; }, true);
    $("scene").addEventListener("click", onSceneClick);
    $("scene").addEventListener("mousemove", onSceneMove);
    $("scene").addEventListener("mouseleave", () => $("tip").classList.remove("show"));
    $("invItems").addEventListener("click", onInventoryClick);
    $("gameGrid").addEventListener("click", (e) => {
      const card = e.target.closest(".game-card");
      if (card) { Sound.init(); Sound.play("click"); showIntro(card.dataset.game); }
    });
    $("startBtn").addEventListener("click", start);
    $("introBack").addEventListener("click", showMenu);
    $("againBtn").addEventListener("click", start);
    $("menuBtn").addEventListener("click", showMenu);
    $("endMenuBtn").addEventListener("click", showMenu);
    $("noteBtn").addEventListener("click", showNotebook);
    $("hintBtn").addEventListener("click", () => { Sound.play("click"); giveHint(); });
    const howTo = $("howToTpl").innerHTML;
    document.querySelectorAll(".how-slot").forEach((el) => { el.innerHTML = howTo; });
    $("helpBtn").addEventListener("click", () => {
      Sound.play("click");
      openModal(`<div class="modal-icon">❓</div><h2 class="help-title">Sådan spiller du</h2>
        <div class="help-how">${howTo}</div>
        ${ux("notebook") ? `<p class="small-text">📓 I dette spil skriver du automatisk vigtige spor ned i <b>notesbogen</b>.</p>` : ""}
        <div class="clue-box help-tips"><b>Sidder du fast? Prøv det her:</b><br>
          🔍 Klik på <b>alt</b> i rummet – også på ting, du allerede har kigget på<br>
          🔢 Kig efter <b>tal, bogstaver, farver og symboler</b>. De er ofte svaret på en lås<br>
          🎒 Prøv at <b>bruge</b> dine ting på forskellige ting i rummet<br>
          🧩 Prøv at <b>sætte to ting sammen</b><br>
          💡 Stadig fast? Tryk på <b>Ledetråd</b></div>`);
    });
    $("modalClose").addEventListener("click", closeModal);
    $("modal").addEventListener("click", (e) => { if (e.target.id === "modal") closeModal(); });
    $("soundBtn").addEventListener("click", (e) => { e.currentTarget.textContent = Sound.toggle() ? "🔇" : "🔊"; });
    const params = new URLSearchParams(location.search);
    if (games[params.get("game")]) showIntro(params.get("game"));
    else showMenu();
  }

  return { define, use, init, api, get state() { return state; } };
})();
