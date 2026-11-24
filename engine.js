// Core game engine: state, rooms, inventory (select / combine / use), popups, hints, timer.
const Game = (() => {
  const rooms = {};
  const ITEMS = {};
  const RECIPES = {};
  const ROOM_ORDER = [];
  let state = null;
  let timerId = null;
  let roomTimers = [];

  const $ = (id) => document.getElementById(id);

  // ---------- Definitions (called from room files) ----------
  function item(id, icon, name) { ITEMS[id] = { icon, name }; }
  function recipe(a, b, result, text) { RECIPES[[a, b].sort().join("+")] = { result, text }; }
  function room(def) { rooms[def.id] = def; ROOM_ORDER.push(def.id); }

  // ---------- State helpers ----------
  const api = {
    flag: (k) => !!state.flags[k],
    set: (k, v = true) => { state.flags[k] = v; render(); },
    has: (id) => state.inventory.includes(id),
    give(id) {
      if (api.has(id)) return;
      state.inventory.push(id);
      Sound.play("item");
      renderInventory(id);
    },
    take(id) {
      state.inventory = state.inventory.filter((i) => i !== id);
      if (state.selected === id) state.selected = null;
      renderInventory();
    },
    say(text) { $("message").innerHTML = text; },
    sound: (name) => Sound.play(name),
    modal: openModal,
    close: closeModal,
    shake: shakeModal,
    render: () => render(),
    goTo: enterRoom,
    win,
    every(ms, fn) { roomTimers.push(setInterval(fn, ms)); },
    itemName: (id) => ITEMS[id].name,
    codeLock,
  };

  // ---------- Rendering ----------
  function render() {
    const r = rooms[state.room];
    const objs = r.objects
      .filter((o) => !o.visible || o.visible(api))
      .map((o) => `<g class="hot ${o.cls || ""}" data-id="${o.id}">${o.draw(api)}</g>`)
      .join("");
    $("scene").innerHTML =
      `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">${Art.defs}${r.background(api)}${objs}` +
      `${r.foreground ? r.foreground(api) : ""}<rect width="1600" height="900" fill="url(#vignette)" pointer-events="none"/></svg>`;
    if (r.afterRender) r.afterRender(api);
  }

  function renderInventory(newId) {
    $("invItems").innerHTML = state.inventory
      .map((id) => `<button class="inv-item ${state.selected === id ? "selected" : ""} ${newId === id ? "new" : ""}"
        data-id="${id}" title="${ITEMS[id].name}">${ITEMS[id].icon}</button>`)
      .join("") || `<span class="inv-empty">Tom</span>`;
  }

  // ---------- Input ----------
  function onSceneClick(e) {
    const g = e.target.closest(".hot");
    if (!g) return;
    const r = rooms[state.room];
    const obj = r.objects.find((o) => o.id === g.dataset.id);
    if (!obj) return;
    if (state.selected) {
      const itemId = state.selected;
      if (obj.use && obj.use(itemId, api)) {
        state.selected = null;
        renderInventory();
      } else {
        Sound.play("wrong");
        api.say(`${ITEMS[itemId].icon} ${cap(ITEMS[itemId].name)} virker ikke her.`);
      }
      return;
    }
    Sound.play("click");
    if (obj.click) obj.click(api);
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
      api.say(`Du holder: ${ITEMS[id].icon} <b>${ITEMS[id].name}</b>. Klik på noget i rummet for at bruge den, eller på en anden ting i rygsækken for at sætte dem sammen.`);
    }
    renderInventory();
  }

  function tryCombine(a, b) {
    const r = RECIPES[[a, b].sort().join("+")];
    state.selected = null;
    if (!r) {
      Sound.play("wrong");
      api.say(`${ITEMS[a].icon} + ${ITEMS[b].icon} kan ikke sættes sammen.`);
      return;
    }
    api.take(a);
    api.take(b);
    api.give(r.result);
    Sound.play("success");
    openModal(`<div class="modal-icon">${ITEMS[a].icon} + ${ITEMS[b].icon} = ${ITEMS[r.result].icon}</div><p>${r.text}</p>`);
    api.say(`Du lavede: ${ITEMS[r.result].icon} <b>${ITEMS[r.result].name}</b>`);
  }

  // ---------- Popup ----------
  function openModal(html, onMount) {
    $("modalContent").innerHTML = html;
    $("modal").classList.remove("hidden");
    if (onMount) onMount($("modalContent"));
  }
  function closeModal() { $("modal").classList.add("hidden"); }
  function shakeModal() {
    const box = $("modalBox");
    box.classList.remove("shake");
    void box.offsetWidth;
    box.classList.add("shake");
    Sound.play("wrong");
  }

  // Number keypad lock. opts: { icon, text, clue, length, answer, onSolve }
  function codeLock(opts) {
    let input = "";
    let keys = "";
    for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9, "⌫", 0, "✔"]) keys += `<button data-k="${n}">${n}</button>`;
    openModal(
      `<div class="modal-icon">${opts.icon || "🔒"}</div><p>${opts.text}</p>${opts.clue || ""}
       <div class="lock-display" id="lockDisplay"></div><div class="keypad">${keys}</div>`,
      (root) => {
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
      }
    );
  }

  // ---------- Hints ----------
  function giveHint() {
    const r = rooms[state.room];
    const goal = r.goal(api);
    const list = r.hints[goal];
    const step = state.hintStep[goal] || 0;
    api.say("💡 " + list[Math.min(step, list.length - 1)]);
    state.hintStep[goal] = step + 1;
    state.hintsUsed++;
  }

  // ---------- Rooms / flow ----------
  function enterRoom(id) {
    roomTimers.forEach(clearInterval);
    roomTimers = [];
    closeModal();
    state.room = id;
    state.selected = null;
    $("scene").className = "";
    const r = rooms[id];
    const n = ROOM_ORDER.indexOf(id) + 1;
    $("roomName").textContent = `Rum ${n}/${ROOM_ORDER.length}: ${r.title}`;
    render();
    renderInventory();
    api.say(r.intro);
    if (r.enter) r.enter(api);
    const banner = $("banner");
    banner.innerHTML = `<small>Rum ${n} af ${ROOM_ORDER.length}</small>${r.title}`;
    banner.classList.remove("show");
    void banner.offsetWidth;
    banner.classList.add("show");
    if (n > 1) Sound.play("door");
  }

  function fmt(s) { return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; }

  function start() {
    Sound.init();
    Sound.startMusic();
    state = { room: null, inventory: [], selected: null, flags: {}, seconds: 0, hintsUsed: 0, hintStep: {} };
    $("startScreen").classList.add("hidden");
    $("endScreen").classList.add("hidden");
    $("timer").textContent = "⏱️ 00:00";
    clearInterval(timerId);
    timerId = setInterval(() => { state.seconds++; $("timer").textContent = "⏱️ " + fmt(state.seconds); }, 1000);
    const startRoom = new URLSearchParams(location.search).get("room"); // for testing: ?room=corridor
    enterRoom(rooms[startRoom] ? startRoom : ROOM_ORDER[0]);
  }

  function win(html) {
    clearInterval(timerId);
    roomTimers.forEach(clearInterval);
    closeModal();
    Sound.stopMusic();
    Sound.play("win");
    const hintText = state.hintsUsed === 0 ? "helt uden hjælp! 🏆" : `og brugte ${state.hintsUsed} × 💡`;
    $("endText").innerHTML = `Tid: <b>${fmt(state.seconds)}</b> ${hintText}<br><br>${html}`;
    $("endScreen").classList.remove("hidden");
  }

  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  function init() {
    $("scene").addEventListener("click", onSceneClick);
    $("invItems").addEventListener("click", onInventoryClick);
    $("startBtn").addEventListener("click", start);
    $("againBtn").addEventListener("click", start);
    $("hintBtn").addEventListener("click", () => { Sound.play("click"); giveHint(); });
    $("modalClose").addEventListener("click", closeModal);
    $("modal").addEventListener("click", (e) => { if (e.target.id === "modal") closeModal(); });
    $("soundBtn").addEventListener("click", (e) => { e.currentTarget.textContent = Sound.toggle() ? "🔇" : "🔊"; });
  }

  return { item, recipe, room, init, api, get state() { return state; } };
})();
