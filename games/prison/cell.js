// Room 1: The cell
// Chain: drawer (pattern) -> mirror -> read note -> string in pillow
//        count stars/mice/bars -> lock box 475 -> magnet
//        magnet + string -> magnet line -> drain grate -> key -> door
(() => {
  const G = Game.use("prison");
  G.item("mirror", "🪞", "spejlstykke");
  G.item("string", "🧵", "snor");
  G.item("magnet", "🧲", "magnet");
  G.item("magnetLine", "🧲🧵", "magnet på snor");
  G.item("cellKey", "🗝️", "cellenøgle");
  G.recipe("magnet", "string", "magnetLine", "Du binder magneten fast på snoren.<br>Nu har du en <b>magnet-fiskeline</b>!");

  const spiderTips = [
    "Edderkoppen hvisker: <i>Har du talt stjernerne?</i> 🕷️",
    "Edderkoppen hvisker: <i>Spejle kan læse baglæns...</i> 🕷️",
    "Edderkoppen hvisker: <i>Magneter elsker metal!</i> 🕷️",
  ];
  let spiderIdx = 0;

  // ---------- Puzzle: drawer with two-row pattern lock ----------
  function drawerPuzzle(api) {
    if (api.flag("drawerOpen")) return api.say("Skuffen er tom nu.");
    const pick = { shape: null, num: null };
    api.modal(`
      <div class="modal-icon">🗄️</div>
      <p>Skuffen har en mønsterlås med to rækker.<br>Hvad kommer så?</p>
      <div class="seq">🔺 🔵 🟩 🔺 🔵 <b>❓</b></div>
      <div class="row" data-row="shape">${["🔺", "🔵", "🟩"].map((x) => `<button class="choice" data-v="${x}">${x}</button>`).join("")}</div>
      <div class="seq">10 · 8 · 6 · <b>❓</b></div>
      <div class="row" data-row="num">${["2", "4", "5"].map((x) => `<button class="choice" data-v="${x}">${x}</button>`).join("")}</div>
      <div class="row"><button class="action" id="tryDrawer">Åbn skuffen</button></div>`,
      (root) => {
        root.querySelectorAll("[data-row] .choice").forEach((b) => b.addEventListener("click", () => {
          const row = b.parentElement.dataset.row;
          pick[row] = b.dataset.v;
          b.parentElement.querySelectorAll(".choice").forEach((x) => x.classList.toggle("picked", x === b));
          api.sound("click");
        }));
        root.querySelector("#tryDrawer").addEventListener("click", () => {
          if (pick.shape === "🟩" && pick.num === "4") {
            api.set("drawerOpen");
            api.give("mirror");
            api.modal(`<div class="modal-icon">🗄️➜🪞</div><p><b>Klik!</b> Skuffen glider op.<br>Indeni ligger et lille <b>spejlstykke</b>.</p>`);
            api.say("Du fandt et spejlstykke 🪞");
          } else api.shake();
        });
      });
  }

  G.room({
    id: "cell",
    title: "Cellen",
    particles: { type: "dust", count: 26 },
    intro: "Du sidder i en celle 🔒 Find en vej ud! Klik på ting for at undersøge dem.",

    background: () => `
      <rect width="1600" height="660" fill="url(#bricks)"/>
      <rect y="640" width="1600" height="260" fill="url(#stoneFloor)"/>
      <rect y="640" width="1600" height="260" fill="url(#floorShade)"/>
      <rect y="630" width="1600" height="18" fill="#3a3445"/>
      ${Art.lamp(800)}`,

    objects: [
      {
        id: "door",
        label: "Celledør",
        draw: () => `
          <rect x="50" y="140" width="260" height="505" fill="#1c1b24"/>
          <rect x="50" y="140" width="260" height="505" fill="none" stroke="#3d3f4a" stroke-width="18"/>
          ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${72 + i * 34}" y="150" width="12" height="490" rx="5" fill="url(#metal)"/>`).join("")}
          <rect x="58" y="270" width="244" height="14" fill="url(#metal)"/><rect x="58" y="520" width="244" height="14" fill="url(#metal)"/>
          <rect x="222" y="360" width="66" height="84" rx="8" fill="#4b4f5c" stroke="#2a2c33" stroke-width="4"/>
          <circle cx="255" cy="392" r="9" fill="#111"/><rect x="251" y="392" width="8" height="24" fill="#111"/>`,
        click(api) {
          if (api.has("cellKey")) return this.use("cellKey", api);
          api.modal(`<div class="modal-icon">🚪🔒</div><p>Celledøren er låst.<br>Du skal bruge en nøgle.</p>`);
        },
        use(item, api) {
          if (item !== "cellKey") return false;
          api.take("cellKey");
          api.sound("success");
          api.goTo("corridor");
          return true;
        },
      },
      {
        id: "poster",
        label: "Plakat",
        draw: () => `
          <g transform="rotate(-3 450 225)">
            <rect x="360" y="110" width="180" height="230" rx="4" fill="#f3e6c4" stroke="#c9b48a" stroke-width="4"/>
            <text x="450" y="150" text-anchor="middle" font-size="26" font-weight="bold" fill="#3a3a6a" font-family="Trebuchet MS">GOD NAT</text>
            ${Art.star(400, 200, 20)}${Art.star(500, 195, 20)}${Art.star(420, 290, 20)}${Art.star(495, 285, 20)}
            <circle cx="455" cy="245" r="24" fill="#ffe08a"/><circle cx="467" cy="237" r="22" fill="#f3e6c4"/>
            <circle cx="450" cy="118" r="7" fill="#c33"/>
          </g>`,
        click: (api) => api.modal(`<div class="poster-zoom"><div>GOD NAT</div><div>⭐ &nbsp; ⭐<br>🌙<br>⭐ &nbsp; ⭐</div></div><p>En plakat med stjerner og en måne.</p>`),
      },
      {
        id: "scratches",
        label: "Ridser i væggen",
        draw: () => `
          <rect x="580" y="350" width="340" height="90" fill="transparent"/>
          ${Art.mouseDoodle(610, 400)}${Art.mouseDoodle(655, 400)}${Art.mouseDoodle(700, 400)}
          <text x="745" y="412" font-size="40" fill="#e8e2f0" opacity=".8" font-weight="bold">+</text>
          ${Art.mouseDoodle(795, 400)}${Art.mouseDoodle(840, 400)}${Art.mouseDoodle(885, 400)}${Art.mouseDoodle(840, 370)}`,
        click: (api) => api.modal(`<div class="scratch-zoom">🐭🐭🐭 &nbsp;+&nbsp; 🐭🐭🐭<br>🐭</div><p>Nogen har ridset mus ind i væggen.<br>Mester Mus har været her!</p>`),
      },
      {
        id: "window",
        label: "Vindue",
        draw: () => `
          <rect x="930" y="100" width="240" height="200" rx="6" fill="#2c2a33"/>
          <rect x="945" y="115" width="210" height="170" fill="url(#nightSky)"/>
          <circle cx="1110" cy="165" r="60" fill="url(#moonGlow)"/><circle cx="1110" cy="165" r="22" fill="#fff3c4"/>
          ${[1, 2, 3, 4, 5].map((i) => `<rect x="${945 + i * 35 - 5}" y="115" width="10" height="170" rx="4" fill="url(#metal)"/>`).join("")}
          <rect x="920" y="295" width="260" height="16" rx="4" fill="#5a5566"/>`,
        click: (api) => api.modal(`<div class="modal-icon">🪟🌙</div><p>Der er tremmer for vinduet.<br>Du kan se månen, men du kan ikke komme ud her.</p>`),
      },
      {
        id: "note",
        label: "Seddel",
        draw: () => `
          <g transform="rotate(4 1295 200)">
            <rect x="1220" y="130" width="150" height="130" fill="#fffbe9" stroke="#d8cfa8" stroke-width="3"/>
            <circle cx="1295" cy="140" r="7" fill="#2b7bd6"/>
            <g transform="translate(2590 0) scale(-1 1)" font-family="Comic Sans MS, Trebuchet MS" font-size="24" fill="#333" text-anchor="middle" font-weight="bold">
              <text x="1295" y="180">SNOREN</text><text x="1295" y="210">ER I</text><text x="1295" y="240">PUDEN</text>
            </g>
          </g>`,
        click(api) {
          if (api.flag("noteRead")) return api.modal(`<div class="modal-icon">📜</div><p class="note-text">SNOREN ER I PUDEN</p>`);
          const tip = api.has("mirror") ? `<p class="tip">Tip: Klik på 🪞 i rygsækken, og klik så på sedlen.</p>` : "";
          api.modal(`<div class="modal-icon">📜</div><p>En seddel med mærkelig skrift:</p><p class="mirror">SNOREN ER I PUDEN</p><p><i>Den er svær at læse...</i></p>${tip}`);
        },
        use(item, api) {
          if (item !== "mirror") return false;
          api.take("mirror");
          api.set("noteRead");
          api.sound("success");
          api.modal(`<div class="modal-icon">🪞📜</div><p>I spejlet kan du læse sedlen:</p><p class="note-text">SNOREN ER I PUDEN</p>`);
          api.say("Sedlen siger: SNOREN ER I PUDEN 🧵");
          return true;
        },
      },
      {
        id: "table",
        label: "Bord med skuffe",
        draw: () => `
          ${Art.shadow(595, 775, 160)}
          <rect x="475" y="610" width="18" height="160" fill="url(#darkWood)"/><rect x="697" y="610" width="18" height="160" fill="url(#darkWood)"/>
          <rect x="455" y="585" width="280" height="30" rx="6" fill="url(#wood)"/>
          <rect x="530" y="615" width="130" height="55" rx="4" fill="url(#darkWood)" stroke="#3a2412" stroke-width="3"/>
          <circle cx="595" cy="642" r="7" fill="#e8c14a"/>
          ${api_flag("drawerOpen") ? "" : `<path d="M575 625 h12 v-6 a6 6 0 0 1 12 0 v6" stroke="#ccc" stroke-width="3" fill="none"/>`}`,
        click: drawerPuzzle,
      },
      {
        id: "toilet",
        label: "Toilet",
        draw: () => `
          ${Art.shadow(1010, 728, 60)}
          <rect x="1030" y="560" width="60" height="90" rx="8" fill="#e9eef3" stroke="#b9c3cc" stroke-width="3"/>
          <path d="M955 650 H1080 Q1080 720 1030 725 H990 Q955 715 955 650 Z" fill="#f4f7fa" stroke="#b9c3cc" stroke-width="3"/>
          <ellipse cx="1015" cy="650" rx="62" ry="12" fill="#dde3e9" stroke="#b9c3cc" stroke-width="3"/>`,
        click: (api) => api.modal(`<div class="modal-icon">🚽</div><p>Bvadr! 🤢<br>Her er heldigvis ikke noget.</p>`),
      },
      {
        id: "grate",
        label: "Kloakrist",
        draw: (api) => `
          <defs><clipPath id="grateClip"><ellipse cx="840" cy="805" rx="80" ry="24"/></clipPath></defs>
          <ellipse cx="840" cy="805" rx="88" ry="30" fill="#2c2833"/>
          <ellipse cx="840" cy="805" rx="80" ry="24" fill="#0e0d12"/>
          <g clip-path="url(#grateClip)" stroke="#6a6475" stroke-width="7">
            ${[-3, -2, -1, 0, 1, 2, 3].map((i) => `<line x1="${840 + i * 22}" y1="775" x2="${840 + i * 22}" y2="835"/>`).join("")}
          </g>
          ${api.flag("keyFound") ? "" : `<g class="twinkle">${Art.star(860, 800, 10, "#fff6b0")}</g>`}`,
        click(api) {
          if (api.flag("keyFound")) return api.say("Risten er tom nu.");
          api.modal(`<div class="modal-icon">🕳️✨</div><p>Nede i risten glimter noget...<br>Det er <b>cellenøglen</b>! 🗝️<br>Vagten må have tabt den.</p><p>Den ligger alt for dybt til dine fingre.</p>`);
        },
        use(item, api) {
          if (api.flag("keyFound")) return false;
          if (item === "magnet") { api.say("🧲 Magneten kan ikke nå så langt ned. Den skal hænge i noget..."); return true; }
          if (item === "string") { api.say("🧵 Snoren alene kan ikke samle nøglen op."); return true; }
          if (item !== "magnetLine") return false;
          api.take("magnetLine");
          api.set("keyFound");
          api.give("cellKey");
          api.modal(`<div class="modal-icon">🧲🧵➜🗝️</div><p>Du sænker magneten ned gennem risten...<br><b>KLONK!</b> Nøglen sidder fast på magneten!</p>`);
          api.say("Du har cellenøglen 🗝️ Prøv den på døren!");
          return true;
        },
      },
      {
        id: "bed",
        label: "Seng",
        draw: () => `
          ${Art.shadow(1320, 728, 220)}
          <rect x="1135" y="610" width="16" height="115" fill="#3a3a44"/><rect x="1490" y="610" width="16" height="115" fill="#3a3a44"/>
          <rect x="1500" y="470" width="28" height="255" rx="6" fill="#4a4a56"/>
          <rect x="1120" y="590" width="400" height="30" rx="6" fill="#55555f"/>
          <rect x="1125" y="558" width="385" height="40" rx="12" fill="#e2dccd"/>
          <rect x="1125" y="552" width="270" height="70" rx="14" fill="#4f6fae"/>
          <path d="M1150 552 V622 M1200 552 V622 M1250 552 V622 M1300 552 V622 M1350 552 V622" stroke="#5d7fc0" stroke-width="10"/>`,
        click: (api) => api.modal(`<div class="modal-icon">🛏️</div><p>En hård fængselsseng.<br>Der står en metalkasse under den.</p>`),
      },
      {
        id: "pillow",
        label: "Pude",
        draw: () => `<ellipse cx="1448" cy="548" rx="58" ry="24" fill="#f4f1e8" stroke="#d6d0c0" stroke-width="3"/>
          <path d="M1400 548 h96" stroke="#d6d0c0" stroke-dasharray="6 6" stroke-width="2"/>`,
        click(api) {
          if (api.flag("stringFound")) return api.say("Puden er flad nu.");
          if (!api.flag("noteRead")) return api.modal(`<div class="modal-icon">🛌</div><p>En klumpet pude.<br>Der er noget hårdt indeni... men hvad?</p>`);
          api.set("stringFound");
          api.give("string");
          api.modal(`<div class="modal-icon">🛌➜🧵</div><p>Du stikker hånden ind i puden...<br>og finder en lang <b>snor</b>!</p>`);
          api.say("Du fandt en snor 🧵");
        },
      },
      {
        id: "lockbox",
        label: "Metalkasse",
        draw: (api) => `
          <rect x="1215" y="650" width="120" height="72" rx="8" fill="#5f6672" stroke="#3a3f47" stroke-width="4"/>
          <rect x="1240" y="668" width="70" height="26" rx="4" fill="${api.flag("boxOpen") ? "#3a7d44" : "#222"}"/>
          <text x="1275" y="688" text-anchor="middle" font-size="18" fill="#7dff8a" font-family="Consolas">${api.flag("boxOpen") ? "OK" : "???"}</text>`,
        click(api) {
          if (api.flag("boxOpen")) return api.say("Kassen under sengen er tom nu.");
          api.codeLock({
            icon: "🔒",
            text: "En metalkasse med en kodelås.<br>På låget er der tegnet:",
            clue: `<div class="clue-row"><span>⭐</span><span>🐭</span><span>🪟<small>tremmer</small></span></div>`,
            length: 3,
            answer: "475",
            onSolve() {
              api.set("boxOpen");
              api.give("magnet");
              api.modal(`<div class="modal-icon">🔓🧲</div><p><b>Klik!</b> Kassen springer op.<br>Indeni ligger en stærk <b>magnet</b>!</p>`);
              api.say("Du fandt en magnet 🧲");
            },
          });
        },
      },
      {
        id: "spider",
        label: "Edderkop",
        draw: () => `
          <line x1="1460" y1="0" x2="1460" y2="80" stroke="#ddd" stroke-width="2" opacity=".6"/>
          <g class="swing">
            <path d="M1440 80 l-16 -10 M1440 88 l-18 0 M1440 96 l-16 10 M1480 80 l16 -10 M1480 88 l18 0 M1480 96 l16 10" stroke="#111" stroke-width="4"/>
            <circle cx="1460" cy="90" r="20" fill="#1a1a1a"/><circle cx="1452" cy="86" r="4" fill="#fff"/><circle cx="1468" cy="86" r="4" fill="#fff"/>
          </g>`,
        click: (api) => { api.say(spiderTips[spiderIdx++ % spiderTips.length]); },
      },
    ],

    goal(api) {
      if (!api.flag("drawerOpen")) return "drawer";
      if (!api.flag("noteRead")) return "note";
      if (!api.flag("stringFound")) return "pillow";
      if (!api.flag("boxOpen")) return "box";
      if (!api.flag("keyFound") && !api.has("magnetLine")) return "combine";
      if (!api.flag("keyFound")) return "grate";
      return "door";
    },
    hints: {
      drawer: ["Bordet har en skuffe med en lås.", "Mønstret gentager sig: 🔺 🔵 🟩 🔺 🔵 ...", "Tallene bliver 2 mindre hver gang: 10, 8, 6 ...", "Svaret er 🟩 og 4."],
      note: ["Sedlen ved vinduet er skrevet med spejlskrift.", "Klik på spejlet 🪞 i rygsækken, og klik så på sedlen."],
      pillow: ["Sedlen siger: SNOREN ER I PUDEN.", "Klik på puden på sengen."],
      box: ["Kassen under sengen har en kode med ⭐, 🐭 og tremmer.", "Tæl stjernerne på plakaten, musene på væggen og tremmerne i vinduet.", "4 stjerner, 7 mus og 5 tremmer = 475."],
      combine: ["Magneten og snoren hører sammen.", "Klik på 🧲 i rygsækken og derefter på 🧵."],
      grate: ["Noget glimter i risten på gulvet.", "Brug magnet-fiskelinen på risten."],
      door: ["Brug nøglen på celledøren! 🚪"],
    },
  });

  // Small helper so draw() functions without api can read flags
  function api_flag(k) { return Game.state && Game.state.flags[k]; }
})();
