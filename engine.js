// Core game engine: several games, each with rooms, items and recipes.
// Handles menu, intro, state, inventory (select / combine / use), popups, puzzle widgets,
// hints, timer, darkness/flashlight, particles and hover labels.
const Game = (() => {
  const games = {};
  const GAME_ORDER = [];
  let game = null; // current game definition
  let state = null;
  let timerId = null;
  let roomTimers = [];
  let pointer = { x: 800, y: 450 };

  const $ = (id) => document.getElementById(id);
  const room = () => game.rooms[state.room];

  // ---------- Definitions (called from game files) ----------
  function builder(g) {
    return {
      item: (id, icon, name) => { g.items[id] = { icon, name }; },
      recipe: (a, b, result, text) => { g.recipes[[a, b].sort().join("+")] = { result, text }; },
      room: (def) => { g.rooms[def.id] = def; g.order.push(def.id); },
    };
  }
  // meta: { title, emoji, difficulty (1-4), tagline, story, minutes, accent, music }
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
    set: (k, v = true) => { state.flags[k] = v; render(); },
    has: (id) => state.inventory.includes(id),
    give(id) {
      if (api.has(id)) return;
      state.inventory.push(id);
      Sound.play("item");
      renderInventory(id);
      render(); // scenes may look different depending on what you carry
    },
    take(id) {
      state.inventory = state.inventory.filter((i) => i !== id);
      if (state.selected === id) state.selected = null;
      renderInventory();
      render();
    },
    say(text) { $("message").innerHTML = text; },
    sound: (name) => Sound.play(name),
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
    codeLock,
    pickLock,
    cycleLock,
    sequenceLock,
    wordLock,
  };

  // Type a word. opts: { icon, text, clue, answer, onSolve }
  function wordLock(opts) {
    openModal(`${head(opts)}
      <div class="row"><input id="wordInput" class="word-input" maxlength="${opts.answer.length + 4}" autocomplete="off" placeholder="${"_ ".repeat(opts.answer.length).trim()}"></div>
      <div class="row"><button class="action" id="tryWord">Prøv</button></div>`, (root) => {
      const input = root.querySelector("#wordInput");
      input.focus();
      const check = () => {
        if (input.value.trim().toUpperCase() === opts.answer.toUpperCase()) { Sound.play("success"); opts.onSolve(); }
        else { shakeModal(); input.value = ""; input.focus(); }
      };
      root.querySelector("#tryWord").addEventListener("click", check);
      input.addEventListener("keydown", (e) => { if (e.key === "Enter") check(); });
    });
  }

  // Fake API used for menu thumbnails (nothing solved, nothing in inventory)
  const thumbApi = { ...api, flag: () => false, get: () => undefined, has: () => false };

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
    $("invItems").innerHTML = state.inventory
      .map((id) => `<button class="inv-item ${state.selected === id ? "selected" : ""} ${newId === id ? "new" : ""}"
        data-id="${id}" title="${game.items[id].name}">${game.items[id].icon}</button>`)
      .join("") || `<span class="inv-empty">Tom</span>`;
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
      api.say(`Du holder: ${game.items[id].icon} <b>${game.items[id].name}</b>. Klik på noget i rummet for at bruge den, eller på en anden ting i rygsækken for at sætte dem sammen.`);
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
    Sound.play("success");
    openModal(`<div class="modal-icon">${game.items[a].icon} + ${game.items[b].icon} = ${game.items[r.result].icon}</div><p>${r.text}</p>`);
    api.say(`Du lavede: ${game.items[r.result].icon} <b>${game.items[r.result].name}</b>`);
  }

  // ---------- Popup ----------
  // locked = the player cannot close it themselves (used for short "freeze" events)
  let modalLocked = false;
  function openModal(html, onMount, locked = false) {
    modalLocked = locked;
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
        if (input === String(opts.answer)) { Sound.play("success"); opts.onSolve(); }
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
        if (opts.rows.every((r, i) => pick[i] === r.answer)) { Sound.play("success"); opts.onSolve(); }
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
        if (idx.every((s, i) => opts.symbols[s] === opts.answer[i])) { Sound.play("success"); opts.onSolve(); }
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
        dots.innerHTML = input.map((v) => opts.buttons.find((x) => x.v === v).html).join(" ");
        const i = input.length - 1;
        if (input[i] !== opts.answer[i]) {
          shakeModal();
          input = [];
          setTimeout(() => { dots.innerHTML = ""; }, 400);
        } else if (input.length === opts.answer.length) {
          setTimeout(() => { Sound.play("success"); opts.onSolve(); }, 250);
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
    $("scene").className = "";
    const r = room();
    const n = game.order.indexOf(id) + 1;
    $("roomName").textContent = `${game.emoji} Rum ${n}/${game.order.length}: ${r.title}`;
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

  function showMenu() {
    clearInterval(timerId);
    clearTimers();
    closeModal(true);
    Sound.stopMusic();
    document.body.style.removeProperty("--accent");
    showScreen("menuScreen");
    $("gameGrid").innerHTML = GAME_ORDER.map((id, i) => {
      const g = games[id];
      const d = DIFFICULTY[g.difficulty];
      return `<button class="game-card" data-game="${id}" style="--accent:${g.accent}">
        <div class="card-art">${roomSvg(g.rooms[g.order[0]], thumbApi, false)}</div>
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
    state = { room: null, inventory: [], selected: null, flags: {}, seconds: 0, hintsUsed: 0, hintStep: {} };
    ["menuScreen", "introScreen", "endScreen"].forEach((s) => $(s).classList.add("hidden"));
    $("gameGrid").innerHTML = "";
    $("introArt").innerHTML = "";
    $("timer").textContent = "⏱️ 00:00";
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
    const hintText = state.hintsUsed === 0 ? "helt uden hjælp! 🏆" : `og brugte ${state.hintsUsed} × 💡`;
    $("endTitle").textContent = game.winTitle || "Du slap ud!";
    $("endText").innerHTML = `Tid: <b>${fmt(state.seconds)}</b> ${hintText}<br><br>${html}`;
    showScreen("endScreen");
  }

  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  function init() {
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
    $("hintBtn").addEventListener("click", () => { Sound.play("click"); giveHint(); });
    $("modalClose").addEventListener("click", closeModal);
    $("modal").addEventListener("click", (e) => { if (e.target.id === "modal") closeModal(); });
    $("soundBtn").addEventListener("click", (e) => { e.currentTarget.textContent = Sound.toggle() ? "🔇" : "🔊"; });
    const params = new URLSearchParams(location.search);
    if (games[params.get("game")]) showIntro(params.get("game"));
    else showMenu();
  }

  return { define, use, init, api, get state() { return state; } };
})();
