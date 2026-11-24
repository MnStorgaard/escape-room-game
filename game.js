// "Detektiven i fængslet" - a small escape room for kids aged 6-9.
// Puzzle chain:
//   wall math (3+4) -> number lock under bed -> mirror 🪞
//   painting fruits -> color box -> cheese 🧀
//   mirror + mirrored note -> reveals loose brick
//   pattern puzzle on brick -> fishing rod 🎣
//   rod + cheese on guard (twist: guard is Mester Mus) -> key 🔑
//   key on door -> escaped!

const ITEMS = {
  mirror: { emoji: "🪞", name: "spejlstykke" },
  cheese: { emoji: "🧀", name: "ost" },
  rod: { emoji: "🎣", name: "fiskestang" },
  key: { emoji: "🔑", name: "nøgle" },
};

let state;
let timerId = null;

function newState() {
  return {
    inventory: [],
    noteRead: false,
    brickOpen: false,
    boxOpen: false,
    lockOpen: false,
    guardDone: false,
    seconds: 0,
    hintsUsed: 0,
    hintStep: {},
  };
}

const has = (id) => state.inventory.includes(id);

// ---------- Room objects ----------
// x / y are percentages of the scene; size is in vw (capped by the scene width)
const OBJECTS = [
  { id: "door", emoji: "🚪", x: 8, y: 48, size: 9, onClick: clickDoor },
  { id: "guard", emoji: "💂", x: 21, y: 66, size: 6, zzz: true, onClick: clickGuard },
  { id: "keys", emoji: "🔑", x: 24, y: 74, size: 2.2, onClick: clickGuard },
  { id: "painting", emoji: "🖼️", x: 33, y: 22, size: 6, onClick: clickPainting },
  { id: "scratch", html: "🐭🐭🐭 + 🐭🐭🐭🐭", x: 50, y: 12, cls: "scratch", onClick: clickScratch },
  { id: "window", emoji: "🪟", x: 64, y: 26, size: 6, onClick: clickWindow },
  { id: "brick", emoji: "🧱", x: 64, y: 50, size: 3.5, hiddenUntil: () => state.noteRead, onClick: clickBrick },
  { id: "table", emoji: "📦", x: 42, y: 68, size: 5, onClick: clickBox },
  { id: "note", emoji: "📜", x: 55, y: 86, size: 3.5, onClick: clickNote },
  { id: "bed", emoji: "🛏️", x: 78, y: 70, size: 9, onClick: clickBed },
  { id: "toilet", emoji: "🚽", x: 93, y: 68, size: 5, onClick: clickToilet },
  { id: "spider", emoji: "🕷️", x: 88, y: 8, size: 2.5, onClick: clickSpider },
];

function buildScene() {
  const scene = document.getElementById("scene");
  scene.querySelectorAll(".obj").forEach((el) => el.remove());
  OBJECTS.forEach((o) => {
    const el = document.createElement("div");
    el.className = "obj " + (o.cls || "");
    el.id = "obj-" + o.id;
    el.style.left = o.x + "%";
    el.style.top = o.y + "%";
    if (o.size) el.style.fontSize = `min(${o.size}vw, ${o.size * 11}px)`;
    el.innerHTML = o.html || o.emoji;
    if (o.zzz) el.innerHTML += '<span class="zzz">💤</span>';
    el.addEventListener("click", () => { Sound.play("click"); o.onClick(); });
    scene.appendChild(el);
  });
  refreshScene();
}

function refreshScene() {
  OBJECTS.forEach((o) => {
    const el = document.getElementById("obj-" + o.id);
    if (o.hiddenUntil) el.classList.toggle("hidden", !o.hiddenUntil());
  });
  document.getElementById("obj-keys").classList.toggle("hidden", state.guardDone);
  if (state.guardDone) document.getElementById("obj-guard").innerHTML = "🐭";
}

// ---------- UI helpers ----------
function say(text) {
  document.getElementById("message").textContent = text;
}

function openModal(html) {
  document.getElementById("modalContent").innerHTML = html;
  document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

function shakeModal() {
  const box = document.getElementById("modalBox");
  box.classList.remove("shake");
  void box.offsetWidth; // restart animation
  box.classList.add("shake");
  Sound.play("wrong");
}

function giveItem(id) {
  if (has(id)) return;
  state.inventory.push(id);
  Sound.play("item");
  renderInventory();
}

function removeItem(id) {
  state.inventory = state.inventory.filter((i) => i !== id);
  renderInventory();
}

function renderInventory() {
  document.getElementById("invItems").innerHTML = state.inventory
    .map((id) => `<span class="inv-item" title="${ITEMS[id].name}">${ITEMS[id].emoji}</span>`)
    .join("");
}

// ---------- Puzzle 1: wall math + number lock ----------
function clickScratch() {
  openModal(`
    <div>Nogen har ridset noget ind i væggen:</div>
    <div class="row"><div class="wall-math">🐭🐭🐭 + 🐭🐭🐭🐭 = ❓</div></div>`);
}

function clickBed() {
  if (state.lockOpen) {
    say("Under sengen står den åbne kasse. Den er tom nu.");
    return;
  }
  let keys = "";
  for (let n = 1; n <= 9; n++) keys += `<button data-n="${n}">${n}</button>`;
  keys += `<button data-n="0">0</button>`;
  openModal(`
    <div class="modal-emoji">🔒</div>
    <div>Under sengen er en kasse med en talkode.<br>Hvilket tal skal der stå?</div>
    <div class="lock-display" id="lockDisplay">_</div>
    <div class="keypad">${keys}</div>`);
  document.querySelectorAll(".keypad button").forEach((b) =>
    b.addEventListener("click", () => tryLock(b.dataset.n))
  );
}

function tryLock(n) {
  document.getElementById("lockDisplay").textContent = n;
  if (n === "7") {
    state.lockOpen = true;
    Sound.play("success");
    giveItem("mirror");
    openModal(`
      <div class="modal-emoji">🔓🪞</div>
      <div><b>Klik!</b> Kassen gik op.<br>Indeni ligger et lille stykke spejl.</div>`);
    say("Du fandt et spejlstykke 🪞");
  } else {
    shakeModal();
  }
}

// ---------- Puzzle 2: painting + color box ----------
function clickPainting() {
  openModal(`
    <div>Et maleri med frugt. Der står noget med småt:</div>
    <div class="row"><div class="painting">🍓 🍌 🫐 🥝</div></div>
    <div><i>"Farverne viser vejen"</i></div>`);
}

let colorInput = [];
const COLOR_CODE = ["red", "yellow", "blue", "green"];
const COLOR_DOT = { red: "🔴", yellow: "🟡", blue: "🔵", green: "🟢" };

function clickBox() {
  if (state.boxOpen) {
    say("Kassen på bordet er tom nu.");
    return;
  }
  colorInput = [];
  openModal(`
    <div class="modal-emoji">📦</div>
    <div>En kasse med fire farvede knapper.<br>Tryk dem i den rigtige rækkefølge.</div>
    <div class="dots" id="dots"></div>
    <div class="row">
      ${["red", "yellow", "blue", "green"].map((c) => `<button class="color-btn ${c}" data-c="${c}"></button>`).join("")}
    </div>`);
  // Buttons are shown in a shuffled visual order so it's not just left-to-right
  const row = document.querySelector("#modalContent .row");
  ["green", "red", "blue", "yellow"].forEach((c) => row.appendChild(row.querySelector(`[data-c="${c}"]`)));
  document.querySelectorAll(".color-btn").forEach((b) =>
    b.addEventListener("click", () => pressColor(b.dataset.c))
  );
}

function pressColor(c) {
  colorInput.push(c);
  document.getElementById("dots").textContent = colorInput.map((x) => COLOR_DOT[x]).join(" ");
  const i = colorInput.length - 1;
  if (colorInput[i] !== COLOR_CODE[i]) {
    shakeModal();
    colorInput = [];
    setTimeout(() => { const d = document.getElementById("dots"); if (d) d.textContent = ""; }, 400);
    return;
  }
  Sound.play("click");
  if (colorInput.length === COLOR_CODE.length) {
    state.boxOpen = true;
    Sound.play("success");
    giveItem("cheese");
    openModal(`
      <div class="modal-emoji">📦🧀</div>
      <div><b>Klonk!</b> Låget springer op.<br>Indeni ligger... en stor, stinkende ost!</div>`);
    say("Du fandt en ost 🧀 Hvem mon kan lide ost?");
  }
}

// ---------- Puzzle 3: mirrored note ----------
const NOTE_TEXT = "KIG UNDER VINDUET";

function clickNote() {
  if (state.noteRead) {
    openModal(`<div class="modal-emoji">📜</div><div class="note-text">${NOTE_TEXT}</div>`);
    return;
  }
  const mirrorBtn = has("mirror")
    ? `<div class="row"><button class="action" id="useMirror">Brug 🪞 spejlet</button></div>`
    : `<div><i>Hmm... Det er svært at læse.</i></div>`;
  openModal(`
    <div class="modal-emoji">📜</div>
    <div>En seddel på gulvet. Skriften ser mærkelig ud:</div>
    <div class="row"><span class="mirror">${NOTE_TEXT}</span></div>
    ${mirrorBtn}`);
  const btn = document.getElementById("useMirror");
  if (btn) btn.addEventListener("click", () => {
    state.noteRead = true;
    removeItem("mirror");
    Sound.play("success");
    openModal(`
      <div class="modal-emoji">🪞📜</div>
      <div>I spejlet kan du læse det:</div>
      <div class="row"><span class="note-text">${NOTE_TEXT}</span></div>`);
    say("Der er en løs sten under vinduet! 🧱");
    refreshScene();
  });
}

// ---------- Puzzle 4: pattern behind the loose brick ----------
function clickWindow() {
  openModal(`
    <div class="modal-emoji">🪟</div>
    <div>Der er tremmer for vinduet. Udenfor ser du månen 🌙<br>Du kan ikke komme ud her.</div>`);
}

function clickBrick() {
  if (state.brickOpen) {
    say("Hullet i muren er tomt nu.");
    return;
  }
  const options = ["🔺", "🔵", "⭐"];
  openModal(`
    <div class="modal-emoji">🧱</div>
    <div>Stenen sidder løst, men den er låst med et mønster.<br>Hvad kommer så?</div>
    <div class="row pattern">🔺🔵🔵🔺🔵🔵🔺🔵 ❓</div>
    <div class="row">${options.map((o) => `<button class="choice" data-o="${o}">${o}</button>`).join("")}</div>`);
  document.querySelectorAll(".choice").forEach((b) =>
    b.addEventListener("click", () => {
      if (b.dataset.o === "🔵") {
        state.brickOpen = true;
        Sound.play("success");
        giveItem("rod");
        openModal(`
          <div class="modal-emoji">🧱🎣</div>
          <div>Stenen glider ud!<br>Bag den ligger en lille fiskestang.</div>`);
        say("Du fandt en fiskestang 🎣 Den kan nå langt!");
      } else {
        shakeModal();
      }
    })
  );
}

// ---------- Finale: the guard ----------
function clickGuard() {
  if (state.guardDone) {
    say("Mester Mus 🐭 sidder og gnasker ost. Han har glemt alt om dig!");
    return;
  }
  if (has("rod") && has("cheese")) {
    openModal(`
      <div class="modal-emoji">💂💤🔑</div>
      <div>Vagten sover tungt. Nøglerne hænger i bæltet.</div>
      <div class="row"><button class="action" id="useRod">Brug 🎣 + 🧀</button></div>`);
    document.getElementById("useRod").addEventListener("click", guardTwist);
    return;
  }
  let text = "Vagten sover. Nøglerne hænger i hans bælte, men du kan ikke nå dem.";
  if (has("rod")) text = "Med fiskestangen kan du nå... men vagten holder fast om nøglerne. Hvis bare du kunne lokke ham...";
  else if (has("cheese")) text = "Vagtens næse snuser lidt til osten... men du kan stadig ikke nå nøglerne.";
  openModal(`<div class="modal-emoji">💂💤</div><div>${text}</div>`);
}

function guardTwist() {
  state.guardDone = true;
  removeItem("rod");
  removeItem("cheese");
  giveItem("key");
  Sound.play("success");
  openModal(`
    <div class="modal-emoji">🎣🧀 ➜ 💂 ➜ 🐭❗</div>
    <div>Du hænger osten på fiskestangen...<br>
    Vagten snuser... hatten falder af... og det er <b>MESTER MUS</b> 🐭!<br><br>
    Han griber osten og glemmer alt andet.<br>
    Imens fisker du nøglen! 🔑</div>`);
  say("Du har nøglen 🔑 Hurtigt, til døren!");
  refreshScene();
}

// ---------- Door / filler objects ----------
function clickDoor() {
  if (has("key")) {
    escape();
  } else {
    openModal(`<div class="modal-emoji">🚪🔒</div><div>Døren er låst. Du skal bruge en nøgle.</div>`);
  }
}

function clickToilet() {
  openModal(`<div class="modal-emoji">🚽</div><div>Bvadr! 🤢<br>Her er ikke noget... heldigvis.</div>`);
}

function clickSpider() {
  openModal(`<div class="modal-emoji">🕷️</div><div>Edderkoppen hvisker:<br><i>"Har du kigget på væggen?"</i></div>`);
}

// ---------- Hints ----------
const HINTS = {
  mirror: [
    "Kig på væggen. Nogen har ridset noget ind.",
    "Tæl musene på væggen. Hvor mange er der i alt?",
    "3 + 4 = 7. Prøv låsen under sengen.",
  ],
  cheese: [
    "Kassen på bordet har farvede knapper.",
    "Se på maleriet. Hvilken farve har frugterne?",
    "Jordbær = rød, banan = gul, blåbær = blå, kiwi = grøn.",
  ],
  note: [
    "Sedlen på gulvet er skrevet med spejlskrift.",
    "Klik på sedlen og brug spejlet.",
  ],
  rod: [
    "Kig under vinduet. En sten sidder løst.",
    "Mønstret er: trekant, cirkel, cirkel, trekant, cirkel, cirkel...",
    "Svaret er den blå cirkel 🔵",
  ],
  key: [
    "Vagten har nøglerne, men du kan ikke nå dem med hånden.",
    "Hvad kan nå langt? Og hvad elsker en mus?",
    "Klik på vagten og brug fiskestangen og osten.",
  ],
  door: ["Brug nøglen på døren! 🚪"],
};

function currentGoal() {
  if (!state.lockOpen) return "mirror";
  if (!state.boxOpen) return "cheese";
  if (!state.noteRead) return "note";
  if (!state.brickOpen) return "rod";
  if (!state.guardDone) return "key";
  return "door";
}

function giveHint() {
  const goal = currentGoal();
  const step = state.hintStep[goal] || 0;
  const list = HINTS[goal];
  say("💡 " + list[Math.min(step, list.length - 1)]);
  state.hintStep[goal] = step + 1;
  state.hintsUsed++;
}

// ---------- Timer / start / end ----------
function formatTime(s) {
  const m = String(Math.floor(s / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${m}:${sec}`;
}

function startTimer() {
  clearInterval(timerId);
  timerId = setInterval(() => {
    state.seconds++;
    document.getElementById("timer").textContent = "⏱️ " + formatTime(state.seconds);
  }, 1000);
}

function startGame() {
  Sound.init();
  Sound.startMusic();
  state = newState();
  buildScene();
  renderInventory();
  document.getElementById("timer").textContent = "⏱️ 00:00";
  say("Du sidder i en celle 🔒 Klik på ting for at undersøge dem.");
  document.getElementById("startScreen").classList.add("hidden");
  document.getElementById("endScreen").classList.add("hidden");
  startTimer();
}

function escape() {
  clearInterval(timerId);
  closeModal();
  Sound.stopMusic();
  Sound.play("win");
  const hintText = state.hintsUsed === 0 ? "helt uden hjælp! 🏆" : `med ${state.hintsUsed} hjælp 💡`;
  document.getElementById("endText").innerHTML =
    `Du låste døren op og slap ud på <b>${formatTime(state.seconds)}</b> ${hintText}<br><br>` +
    `Politiet 👮 fangede Mester Mus 🐭, mens han stadig spiste ost.<br>Godt klaret, detektiv! 🕵️`;
  document.getElementById("endScreen").classList.remove("hidden");
}

// ---------- Wire up ----------
document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("againBtn").addEventListener("click", startGame);
document.getElementById("hintBtn").addEventListener("click", () => { Sound.play("click"); giveHint(); });
document.getElementById("modalClose").addEventListener("click", closeModal);
document.getElementById("modal").addEventListener("click", (e) => { if (e.target.id === "modal") closeModal(); });
document.getElementById("soundBtn").addEventListener("click", (e) => {
  const muted = Sound.toggle();
  e.target.textContent = muted ? "🔇" : "🔊";
});
state = newState();
