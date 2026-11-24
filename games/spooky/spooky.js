// Game 5: The haunted house (hard, spooky)
// Room 1 Hallen (dark):   coat -> flashlight, drawer -> batteries, combine -> strong light
//                         dusty mirror (needs strong light) -> "quarter past nine" -> set clock hands -> library key
//                         portrait back = symbol table (needed in room 2!)
// Room 2 Biblioteket:     rainbow painting -> books in rainbow order -> blank page
//                         diary symbols + portrait table -> VARME -> desk drawer -> matches (kept)
//                         wood + matches on fireplace -> fire; blank page on fire -> 731 -> secret bookcase
// Room 3 Loftet (dark):   matches on oil lamp -> light; doll house logic -> crank
//                         crank on music box -> dancing order -> toy chest -> teddy -> give to the ghost
(() => {
  const G = Game.define("spooky", {
    title: "Spøgelseshuset",
    emoji: "👻",
    difficulty: 4,
    minutes: 35,
    accent: "#b07cff",
    tagline: "Din bold fløj ind i det gamle hus på bakken. Døren smækkede bag dig... og du er ikke alene.",
    story: `<p>Din bold fløj ind gennem et knust vindue i <b>det gamle hus på bakken</b>. Alle siger, det er hjemsøgt...</p>
            <p>Da du kravlede ind efter den, <b>SMÆKKEDE</b> døren bag dig. Det er bælgmørkt, og du hører nogen hviske dit navn. 👻</p>
            <p><i>Svært spil: Nogle spor skal bruges i et andet rum. Husk hvad du ser!</i></p>`,
    winTitle: "Du slap ud af spøgelseshuset!",
    music: { notes: [220, 0, 207, 0, 196, 0, 185, 0, 175, 0, 0, 0], ms: 520, wave: "sine", bass: 55 },
  });

  G.item("torchWeak", "🔦", "lommelygte (uden batterier)");
  G.item("batteries", "🔋", "batterier");
  G.item("torch", "🔦✨", "lommelygte der lyser");
  G.item("libKey", "🗝️", "rusten nøgle");
  G.item("page", "📄", "tomt papir");
  G.item("codePage", "📜", "papir med tal");
  G.item("matches", "🔥", "tændstikker");
  G.item("wood", "🪵", "brænde");
  G.item("crank", "⚙️", "lille håndsving");
  G.item("teddy", "🧸", "gammel bamse");
  G.recipe("torchWeak", "batteries", "torch", "Du sætter batterierne i lommelygten...<br><b>KLIK!</b> Et stærkt lys skærer gennem mørket.");

  // ---------- Shared drawing ----------
  const defs = `<defs>
    <pattern id="damask" width="120" height="120" patternUnits="userSpaceOnUse">
      <rect width="120" height="120" fill="#2c2238"/>
      <path d="M60 15 q20 25 0 45 q-20 -20 0 -45z M60 75 q20 25 0 45 q-20 -20 0 -45z M0 45 q20 25 0 45 M120 45 q-20 25 0 45" fill="#3a2d4a"/>
      <circle cx="60" cy="60" r="5" fill="#45365a"/>
    </pattern>
    <pattern id="oldWood" width="200" height="40" patternUnits="userSpaceOnUse">
      <rect width="200" height="40" fill="#3a2a20"/><rect width="100" height="20" fill="#33251c"/><rect x="100" y="20" width="100" height="20" fill="#33251c"/>
      <path d="M0 20 H200 M100 0 V20 M0 20 V40" stroke="#22180f" stroke-width="3"/>
    </pattern>
    <radialGradient id="ghostGlow"><stop offset="0" stop-color="#e8f4ff" stop-opacity=".6"/><stop offset="1" stop-color="#e8f4ff" stop-opacity="0"/></radialGradient>
    <radialGradient id="fireGlow"><stop offset="0" stop-color="#ffb347" stop-opacity=".55"/><stop offset="1" stop-color="#ff7a1a" stop-opacity="0"/></radialGradient>
  </defs>`;

  const cobweb = (x, y, s = 1, flip = 1) => `<g transform="translate(${x} ${y}) scale(${s * flip} ${s})" stroke="#bbb" stroke-width="1.5" fill="none" opacity=".45">
    <path d="M0 0 L120 0 M0 0 L0 120 M0 0 L100 60 M0 0 L60 100 M0 0 L110 30 M0 0 L30 110"/>
    <path d="M30 0 Q22 22 0 30 M60 0 Q45 45 0 60 M90 0 Q68 68 0 90"/></g>`;

  function ghost(x, y, s = 1, op = 0.8) {
    return `<g transform="translate(${x} ${y}) scale(${s})" opacity="${op}">
      <circle cx="0" cy="-120" r="150" fill="url(#ghostGlow)"/>
      <path d="M-70 40 Q-80 -120 0 -190 Q80 -120 70 40 q-17 -20 -35 0 q-17 -20 -35 0 q-17 -20 -35 0 q-17 -20 -35 0 Z" fill="#eef6ff"/>
      <path d="M-40 -175 q-40 30 -30 90 M40 -175 q40 30 30 90" stroke="#dfe9f5" stroke-width="10" fill="none"/>
      <path d="M-28 -200 l-22 -16 v32 z M-28 -200 l22 -16 v32 z" fill="#9a7fd0"/>
      <ellipse cx="-22" cy="-130" rx="11" ry="16" fill="#1a1426"/><ellipse cx="22" cy="-130" rx="11" ry="16" fill="#1a1426"/>
      <ellipse cx="0" cy="-95" rx="9" ry="12" fill="#1a1426"/>
    </g>`;
  }

  const candle = (x, y) => `<rect x="${x - 8}" y="${y}" width="16" height="40" rx="3" fill="#f3ead2"/>
    <g class="flicker"><ellipse cx="${x}" cy="${y - 10}" rx="7" ry="13" fill="#ffcf5a"/><circle cx="${x}" cy="${y - 10}" r="60" fill="url(#fireGlow)"/></g>`;

  // Random spooky whispers and ghost flashes
  const WHISPERS = ["🌫️ <i>...leg med mig...</i>", "🌫️ <i>...hvorfor går du?...</i>", "👂 Knirk... knirk... trin på trappen?", "🌫️ <i>...min bamse... hvor er min bamse...</i>", "🥶 Det bliver pludselig iskoldt..."];
  function haunt(api, every = 16000) {
    api.every(every, () => {
      if (api.modalOpen()) return;
      api.say(WHISPERS[Math.floor(Math.random() * WHISPERS.length)]);
      api.sound(Math.random() < 0.5 ? "ghost" : "creak");
      const f = document.getElementById("ghostFlash");
      if (f && Math.random() < 0.6) { f.classList.remove("ghost-flash"); void f.getBoundingClientRect(); f.classList.add("ghost-flash"); }
    });
  }

  // ================= ROOM 1: Dark hall =================
  const SYMBOLS = [["◆", "V"], ["●", "A"], ["▲", "R"], ["■", "M"], ["★", "E"], ["✚", "L"], ["◐", "N"], ["⬟", "S"]];
  G.room({
    id: "hall",
    title: "Den mørke hall",
    intro: "Bælgmørkt... 😨 Din telefon lyser kun lidt. Bevæg musen for at lyse rundt.",
    particles: { type: "dust", count: 30, color: "#d8d0ff" },
    dark: (api) => (api.has("torch") || api.flag("torchOn") ? 270 : 125),
    enter(api) {
      haunt(api);
      api.every(60, () => {
        const p = api.pointer();
        [["eyeL", 742, 214], ["eyeR", 774, 214]].forEach(([id, cx, cy]) => {
          const el = document.getElementById(id);
          if (!el) return;
          const a = Math.atan2(p.y - cy, p.x - cx);
          el.setAttribute("cx", cx + Math.cos(a) * 4);
          el.setAttribute("cy", cy + Math.sin(a) * 3);
        });
      });
    },
    background: () => `${defs}
      <rect width="1600" height="660" fill="url(#damask)"/>
      <rect y="640" width="1600" height="260" fill="url(#oldWood)"/><rect y="640" width="1600" height="260" fill="url(#floorShade)"/>
      <rect y="630" width="1600" height="16" fill="#1a1210"/>
      ${cobweb(0, 0, 1.4)}${cobweb(1600, 0, 1.2, -1)}
      <path d="M1280 640 L1600 300 V640 Z" fill="#2a1d16"/>
      ${Array.from({ length: 8 }, (_, i) => `<rect x="${1290 + i * 40}" y="${600 - i * 40}" width="320" height="14" fill="#4a352a"/>`).join("")}
      <path d="M1380 520 l60 -40 l40 30 l-30 50z" fill="#2a1d16" stroke="#111" stroke-width="3"/><text x="1420" y="470" font-size="26">🚧</text>`,
    foreground: () => `<g id="ghostFlash" opacity="0" pointer-events="none">${ghost(1100, 470, 0.8, 1)}</g>`,
    objects: [
      {
        id: "frontDoor", label: "Hoveddøren",
        draw: () => `
          <rect x="40" y="200" width="220" height="445" fill="#2a1a10" stroke="#120a06" stroke-width="12"/>
          <path d="M40 200 Q150 120 260 200" fill="#1e120a" stroke="#120a06" stroke-width="10"/>
          <rect x="65" y="240" width="75" height="170" fill="#3a2516"/><rect x="160" y="240" width="75" height="170" fill="#3a2516"/>
          <rect x="65" y="440" width="75" height="170" fill="#3a2516"/><rect x="160" y="440" width="75" height="170" fill="#3a2516"/>
          <circle cx="225" cy="430" r="12" fill="#8a7a50"/>`,
        click(api) {
          api.sound("scare");
          api.modal(`<div class="modal-icon">🚪😱</div><p>Du hiver i håndtaget... Døren rokker sig ikke en millimeter!</p><p><i>En kold stemme hvisker lige bag dig:</i><br><b>"Du må ikke gå... før du har fundet den..."</b></p>`);
        },
      },
      {
        id: "coat", label: "Knagerække med frakke",
        draw: () => `
          <rect x="320" y="300" width="14" height="340" fill="#2a1a10"/><rect x="290" y="630" width="74" height="14" rx="5" fill="#2a1a10"/>
          <path d="M327 300 l-30 20 M327 300 l30 20" stroke="#2a1a10" stroke-width="8"/>
          <path d="M290 320 Q327 300 364 320 L380 540 H274 Z" fill="#4a3a5a"/><rect x="335" y="430" width="34" height="34" rx="4" fill="#3a2d4a"/>
          <circle cx="327" cy="290" r="26" fill="#3a2a20"/>`,
        click(api) {
          if (api.flag("coatSearched")) return api.say("Frakken er tom. Den lugter af gammelt støv.");
          api.set("coatSearched");
          api.give("torchWeak");
          api.modal(`<div class="modal-icon">🧥🔦</div><p>I frakkens lomme finder du en gammel <b>lommelygte</b>.<br>Du trykker på knappen... den virker ikke. Batterierne mangler!</p>`);
        },
      },
      {
        id: "portrait", label: "Portræt",
        draw: () => `
          <rect x="680" y="110" width="160" height="210" fill="#6a4a1a" stroke="#c9a227" stroke-width="10"/>
          <rect x="695" y="125" width="130" height="180" fill="#2a2236"/>
          <path d="M710 305 Q760 220 810 305 Z" fill="#5a3a6a"/>
          <circle cx="758" cy="215" r="34" fill="#d9c2a8"/>
          <path d="M724 210 Q758 160 792 210 Q790 185 758 178 Q726 185 724 210" fill="#4a2a1a"/>
          <path d="M738 182 l-14 -10 v20z M738 182 l14 -10 v20z" fill="#9a7fd0"/>
          <circle cx="742" cy="214" r="7" fill="#fff"/><circle cx="774" cy="214" r="7" fill="#fff"/>
          <circle id="eyeL" cx="742" cy="214" r="3.5" fill="#111"/><circle id="eyeR" cx="774" cy="214" r="3.5" fill="#111"/>
          <path d="M750 234 q8 4 16 0" stroke="#7a3a3a" stroke-width="2" fill="none"/>
          <text x="790" y="295" font-size="30">🧸</text>
          <rect x="720" y="330" width="80" height="22" rx="4" fill="#c9a227"/><text x="760" y="346" text-anchor="middle" font-size="14" fill="#2a1a10" font-weight="bold">ELNA</text>`,
        click(api) {
          api.modal(`<div class="modal-icon">🖼️👧</div><p>Et gammelt maleri af en pige med en <b>bamse</b> 🧸. På skiltet står: <b>ELNA</b>.</p><p><i>Det føles som om, hendes øjne følger dig...</i> 😨</p>
            <div class="row"><button class="action" id="liftPortrait">Løft maleriet</button></div>`, (root) => {
            root.querySelector("#liftPortrait").addEventListener("click", () => {
              api.sound("creak");
              api.set("portraitSeen");
              api.modal(`<div class="modal-icon">🖼️🔄</div><p>Bagpå maleriet er der ridset en <b>hemmelig tabel</b>:</p>
                <div class="dark-box" style="font-size:1.6rem;letter-spacing:2px">${SYMBOLS.map(([s, l]) => `${s} = ${l}`).join(" &nbsp; ")}</div><p class="small-text">Husk den! Den kan være nyttig senere...</p>`);
            });
          });
        },
      },
      {
        id: "mirror", label: "Støvet spejl",
        draw: (api) => `
          <ellipse cx="1010" cy="250" rx="85" ry="115" fill="#6a4a1a" stroke="#c9a227" stroke-width="8"/>
          <ellipse cx="1010" cy="250" rx="70" ry="100" fill="#8a96a8"/>
          <ellipse cx="1010" cy="250" rx="70" ry="100" fill="#cdbfa8" opacity=".55"/>
          ${api.flag("mirrorRead") ? `<text x="1010" y="230" text-anchor="middle" font-size="15" fill="#3a2a20" font-family="Comic Sans MS">KVART</text><text x="1010" y="255" text-anchor="middle" font-size="15" fill="#3a2a20" font-family="Comic Sans MS">OVER NI</text>` : ""}`,
        click(api) {
          if (!api.has("torch") && !api.flag("torchOn")) return api.modal(`<div class="modal-icon">🪞</div><p>Et støvet spejl. Du kan næsten ikke se noget i det her mørke...</p><p>Det ser ud som om, nogen har skrevet i støvet med en finger.</p>`);
          const first = !api.flag("mirrorRead");
          api.set("mirrorRead");
          if (first) api.sound("scare");
          api.modal(`<div class="modal-icon">🪞${first ? "👻" : ""}</div>${first ? `<p><b>AAH!</b> Et hvidt ansigt bag dig i spejlet!... Du vender dig om. Der er ingen. 😰</p>` : ""}
            <p>I lyset fra lommelygten kan du læse, hvad der står i støvet:</p><div class="clue-box">ELNAS SENGETID:<br><b>KVART OVER NI</b></div>`);
        },
      },
      {
        id: "clock", label: "Bornholmerur",
        draw: (api) => `
          ${Art.shadow(540, 645, 80)}
          <rect x="480" y="180" width="120" height="460" rx="10" fill="#4a2e18" stroke="#2a1a0e" stroke-width="6"/>
          <path d="M470 190 Q540 120 610 190 Z" fill="#3a2412"/>
          <circle cx="540" cy="250" r="46" fill="#f3ead2" stroke="#c9a227" stroke-width="5"/>
          ${[...Array(12)].map((_, i) => `<circle cx="${540 + 38 * Math.cos((i * Math.PI) / 6)}" cy="${250 + 38 * Math.sin((i * Math.PI) / 6)}" r="2.5" fill="#333"/>`).join("")}
          ${api.flag("clockSet") ? `<line x1="540" y1="250" x2="512" y2="250" stroke="#111" stroke-width="5"/><line x1="540" y1="250" x2="575" y2="250" stroke="#111" stroke-width="3"/>`
                                 : `<line x1="540" y1="250" x2="540" y2="222" stroke="#111" stroke-width="5"/><line x1="540" y1="250" x2="540" y2="214" stroke="#111" stroke-width="3"/>`}
          <rect x="505" y="320" width="70" height="270" rx="6" fill="#2a1a0e"/>
          <g class="${api.flag("clockSet") ? "swing" : ""}" style="transform-origin:540px 330px"><line x1="540" y1="330" x2="540" y2="520" stroke="#c9a227" stroke-width="4"/><circle cx="540" cy="530" r="20" fill="#c9a227"/></g>`,
        click(api) {
          if (api.flag("clockSet")) return api.say("Uret tikker igen... tik... tak... 🕰️");
          const hands = (h, m) => {
            const ah = ((h % 12) / 12) * 360 - 90, am = (m / 60) * 360 - 90, r = (a) => (a * Math.PI) / 180;
            return `<svg viewBox="-40 -40 80 80" width="56" height="56"><circle r="36" fill="#f3ead2" stroke="#6a4a1a" stroke-width="4"/>
              <line x2="${20 * Math.cos(r(ah))}" y2="${20 * Math.sin(r(ah))}" stroke="#111" stroke-width="5"/><line x2="${30 * Math.cos(r(am))}" y2="${30 * Math.sin(r(am))}" stroke="#111" stroke-width="2.5"/></svg>`;
          };
          const opts = [[9, 45, "a"], [3, 45, "b"], [9, 15, "c"], [3, 15, "d"]];
          api.modal(`<div class="modal-icon">🕰️</div><p>Uret er gået i stå. Der er en lille låge i uret, men den er låst.<br>Under urskiven står: <i>"Stil mig på hendes sengetid."</i></p>
            <div class="row">${opts.map(([h, m, v]) => `<button class="choice clock-btn" data-v="${v}">${hands(h + m / 60, m)}</button>`).join("")}</div>`,
            (root) => root.querySelectorAll(".clock-btn").forEach((b) => b.addEventListener("click", () => {
              if (b.dataset.v !== "c") return api.shake();
              api.sound("bell");
              api.set("clockSet");
              api.give("libKey");
              api.modal(`<div class="modal-icon">🕰️➜🗝️</div><p><b>DONG... DONG...</b> Uret slår, og den lille låge springer op.<br>Indeni ligger en <b>rusten nøgle</b>.</p>`);
            })));
        },
      },
      {
        id: "table", label: "Lille bord med skuffe",
        draw: () => `
          ${Art.shadow(800, 645, 90)}
          <rect x="720" y="520" width="160" height="16" rx="4" fill="#4a2e18"/><rect x="735" y="535" width="130" height="40" fill="#3a2412"/><circle cx="800" cy="555" r="5" fill="#c9a227"/>
          <path d="M735 575 l-8 70 M865 575 l8 70" stroke="#3a2412" stroke-width="10"/>
          ${candle(760, 480)}`,
        click(api) {
          if (api.flag("drawerSearched")) return api.say("Skuffen er tom. Der kravler en edderkop rundt. 🕷️");
          api.set("drawerSearched");
          api.give("batteries");
          api.modal(`<div class="modal-icon">🗄️🕷️🔋</div><p>Du åbner skuffen... en <b>edderkop</b> løber op ad din arm! 😖<br>Men nede i skuffen ligger et par <b>batterier</b>.</p>`);
        },
      },
      {
        id: "libDoor", label: "Dør til biblioteket",
        draw: () => `
          <rect x="1140" y="300" width="140" height="340" fill="#2a1a10" stroke="#120a06" stroke-width="10"/>
          <rect x="1160" y="330" width="100" height="130" fill="#3a2516"/><rect x="1160" y="480" width="100" height="130" fill="#3a2516"/>
          <circle cx="1255" cy="475" r="9" fill="#8a7a50"/><text x="1210" y="290" text-anchor="middle" font-size="30">📚</text>`,
        click(api) {
          if (api.flag("libOpen")) return api.goTo("library");
          if (api.has("libKey")) return this.use("libKey", api);
          api.modal(`<div class="modal-icon">🚪📚</div><p>Døren til biblioteket er låst. Nøglehullet er stort og rustent.</p>`);
        },
        use(item, api) {
          if (item !== "libKey") return false;
          api.take("libKey");
          api.set("libOpen");
          api.goTo("library");
          return true;
        },
      },
    ],
    goal(api) {
      if (!api.has("torch") && !api.flag("torchOn")) {
        if (!api.flag("coatSearched")) return "coat";
        if (!api.flag("drawerSearched")) return "drawer";
        return "combine";
      }
      if (!api.flag("mirrorRead")) return "mirror";
      if (!api.flag("clockSet")) return "clock";
      if (!api.flag("portraitSeen")) return "portrait";
      return "door";
    },
    hints: {
      coat: ["Du har brug for mere lys. Lys rundt med musen.", "Undersøg frakken på knagerækken."],
      drawer: ["Lommelygten mangler batterier.", "Kig i skuffen på det lille bord med lyset."],
      combine: ["Klik på 🔦 og derefter på 🔋 i rygsækken."],
      mirror: ["Med lommelygten kan du se mere. Der står noget i støvet på spejlet."],
      clock: ["Spejlet siger: kvart over ni. Uret skal stilles på det.", "Den lille viser peger på 9. Den store viser peger på 3 (kvart over).", "Det er det tredje ur."],
      portrait: ["Har du kigget bag maleriet af Elna? Det er vigtigt senere!"],
      door: ["Brug den rustne nøgle på døren til biblioteket."],
    },
  });

  // ================= ROOM 2: Library =================
  const BOOKS = [["red", "#d32f2f"], ["orange", "#f57c00"], ["yellow", "#fbc02d"], ["green", "#388e3c"], ["blue", "#1976d2"], ["purple", "#7b1fa2"]];
  G.room({
    id: "library",
    title: "Biblioteket",
    intro: "Biblioteket. Stearinlysene brænder af sig selv... og gyngestolen gynger, selvom ingen sidder i den. 😨",
    particles: { type: "dust", count: 34, color: "#ffe9c0" },
    enter: (api) => haunt(api, 18000),
    background: () => `${defs}
      <rect width="1600" height="660" fill="url(#damask)"/>
      <rect y="640" width="1600" height="260" fill="url(#oldWood)"/><rect y="640" width="1600" height="260" fill="url(#floorShade)"/>
      ${cobweb(0, 0, 1.2)}${cobweb(1600, 0, 1.4, -1)}
      <rect x="60" y="80" width="360" height="560" fill="#3a2412" stroke="#22150a" stroke-width="10"/>
      ${[0, 1, 2, 3].map((r) => `<rect x="70" y="${200 + r * 115}" width="340" height="12" fill="#22150a"/>
        ${Array.from({ length: 11 }, (_, i) => `<rect x="${78 + i * 30}" y="${118 + r * 115}" width="24" height="${74 + ((i * 7 + r * 3) % 10)}" fill="${["#5a2a2a", "#2a3a5a", "#3a4a2a", "#5a4a2a", "#4a2a4a"][(i + r) % 5]}"/>`).join("")}`).join("")}
      <rect x="600" y="110" width="300" height="130" fill="#1e1a2a" stroke="#c9a227" stroke-width="8"/>
      ${BOOKS.map(([, c], i) => `<path d="M${640 + i * 8} 225 a${110 - i * 8} ${90 - i * 8} 0 0 1 ${220 - i * 16} 0" stroke="${c}" stroke-width="8" fill="none"/>`).join("")}`,
    foreground: () => `<g id="ghostFlash" opacity="0" pointer-events="none">${ghost(330, 520, 0.7, 1)}</g>`,
    objects: [
      {
        id: "backDoor", label: "Tilbage til hallen",
        draw: () => `<path d="M10 640 V420 h40 v220z" fill="#2a1a10"/><text x="30" y="410" text-anchor="middle" font-size="30">⬅</text>`,
        click: (api) => api.goTo("hall"),
      },
      {
        id: "books", label: "Bøger i mange farver",
        draw: (api) => `
          <rect x="72" y="440" width="336" height="105" fill="#2a1a0e"/>
          ${[["green", 0], ["red", 1], ["purple", 2], ["yellow", 3], ["blue", 4], ["orange", 5]].map(([c, i]) => `<rect x="${110 + i * 46}" y="${api.flag("booksSolved") ? 465 : 450}" width="38" height="${api.flag("booksSolved") ? 80 : 95}" rx="4" fill="${BOOKS.find((b) => b[0] === c)[1]}" stroke="#111" stroke-width="2"/><rect x="${116 + i * 46}" y="${api.flag("booksSolved") ? 480 : 465}" width="26" height="6" fill="#ffd86b" opacity=".7"/>`).join("")}`,
        click(api) {
          if (api.flag("booksSolved")) return api.say("Bøgerne står i regnbuens orden nu 🌈");
          const order = ["green", "red", "purple", "yellow", "blue", "orange"];
          api.sequenceLock({
            icon: "📚", text: "Seks bøger i hver sin farve. Ryggene sidder løst... Måske skal de trækkes ud i en bestemt rækkefølge?",
            buttons: order.map((c) => ({ v: c, html: "📕", cls: "c-" + c })),
            answer: BOOKS.map((b) => b[0]),
            onSolve() {
              api.set("booksSolved");
              api.sound("creak");
              api.give("page");
              api.modal(`<div class="modal-icon">📚🌈➜📄</div><p><b>Klik!</b> Bag bøgerne åbner en lille skjult låge.<br>Indeni ligger et <b>tomt stykke papir</b>... helt tomt? Mærkeligt.</p>`);
            },
          });
        },
      },
      {
        id: "rainbow", label: "Maleri af en regnbue",
        draw: () => `<rect x="600" y="110" width="300" height="130" fill="transparent"/>`,
        click: (api) => api.modal(`<div class="modal-icon">🌈</div><p>Et maleri af en regnbue. På rammen står:</p><div class="clue-box"><i>"Alt i dette hus står i regnbuens orden"</i><br>— Elna</div>`),
      },
      {
        id: "fireplace", label: "Pejs",
        draw: (api) => `
          <rect x="560" y="300" width="380" height="30" fill="#5a4a4a"/>
          <rect x="580" y="330" width="340" height="310" fill="#4a3a3a" stroke="#2a2020" stroke-width="8"/>
          <path d="M640 640 V430 Q750 360 860 430 V640 Z" fill="#120c0c"/>
          ${api.flag("woodIn") ? `<rect x="680" y="600" width="140" height="20" rx="8" fill="#6a4a2a"/><rect x="700" y="585" width="100" height="18" rx="8" fill="#7a5a3a"/>` : ""}
          ${api.flag("fireLit") ? `<g class="flicker"><circle cx="750" cy="560" r="180" fill="url(#fireGlow)"/>
            <path d="M690 600 Q700 520 730 540 Q740 470 760 520 Q790 480 795 540 Q820 520 810 600 Z" fill="#ff7a1a"/>
            <path d="M720 600 Q730 550 750 560 Q765 520 775 565 Q790 560 785 600 Z" fill="#ffd23a"/></g>` : ""}
          ${candle(610, 260)}${candle(890, 260)}`,
        click(api) {
          if (api.flag("fireLit")) return api.say("Ilden knitrer og varmer. Puha, det er rart. 🔥");
          api.modal(`<div class="modal-icon">🧱</div><p>En kold, mørk pejs. ${api.flag("woodIn") ? "Der ligger brænde i den nu." : "Der er intet brænde i den."}</p>`);
        },
        use(item, api) {
          if (item === "wood" && !api.flag("woodIn")) { api.take("wood"); api.set("woodIn"); api.say("Du lægger brændet i pejsen 🪵"); return true; }
          if (item === "matches") {
            if (api.flag("fireLit")) return false;
            if (!api.flag("woodIn")) { api.say("🔥 Tændstikken brænder ud... Der er intet i pejsen, der kan brænde!"); return true; }
            api.set("fireLit"); api.sound("whoosh"); api.say("WHOOSH! 🔥 Ilden blusser op i pejsen."); return true;
          }
          if (item === "page") {
            if (!api.flag("fireLit")) { api.say("📄 Papiret er stadig tomt..."); return true; }
            api.take("page"); api.give("codePage");
            api.modal(`<div class="modal-icon">📄🔥➜📜</div><p>Du holder papiret op mod varmen...<br>Langsomt dukker der <b>brune tal</b> frem! Det er usynligt blæk!</p><div class="clue-box" style="font-size:2.2rem;letter-spacing:10px">7 3 1</div>`);
            return true;
          }
          return false;
        },
      },
      {
        id: "basket", label: "Brændekurv",
        draw: (api) => `
          <path d="M960 560 h120 l-12 80 h-96 z" fill="#6a4a2a" stroke="#3a2412" stroke-width="4"/>
          ${api.has("wood") || api.flag("woodIn") ? "" : `<rect x="975" y="540" width="90" height="18" rx="8" fill="#7a5a3a"/><rect x="985" y="525" width="80" height="18" rx="8" fill="#6a4a2a"/>`}`,
        click(api) {
          if (api.has("wood") || api.flag("woodIn")) return api.say("Kurven er tom.");
          api.give("wood"); api.render(); api.say("Du tog noget brænde 🪵");
        },
      },
      {
        id: "chair", label: "Gyngestol",
        draw: () => `
          <g class="rock" style="transform-origin:1180px 640px">
            <path d="M1100 640 Q1180 670 1270 640" stroke="#3a2412" stroke-width="10" fill="none"/>
            <rect x="1120" y="520" width="130" height="20" rx="6" fill="#5a3a1e"/><rect x="1215" y="380" width="22" height="160" rx="6" fill="#5a3a1e"/>
            <path d="M1125 540 v90 M1245 540 v90" stroke="#5a3a1e" stroke-width="10"/>
          </g>`,
        click(api) {
          api.sound("creak");
          api.say("😨 Gyngestolen stopper brat, da du rører den... og begynder så at gynge igen. Af sig selv.");
        },
      },
      {
        id: "desk", label: "Skrivebord",
        draw: (api) => `
          ${Art.shadow(1360, 645, 140)}
          <rect x="1230" y="500" width="270" height="20" rx="4" fill="#4a2e18"/><rect x="1245" y="520" width="240" height="120" fill="#3a2412"/>
          <rect x="1300" y="545" width="120" height="40" rx="4" fill="#2a1a0e" stroke="#c9a227" stroke-width="2"/>
          ${api.flag("drawerOpen") ? "" : [0, 1, 2, 3, 4].map((i) => `<rect x="${1306 + i * 22}" y="552" width="18" height="26" rx="3" fill="#c9a227"/>`).join("")}
          <path d="M1270 498 l50 -14 l50 14 v-6 l-50 -14 l-50 14 z" fill="#e8dcc0" stroke="#6a4a1a" stroke-width="2"/>
          ${candle(1460, 450)}`,
        click(api) {
          api.modal(`<div class="modal-icon">📔</div><p>På skrivebordet ligger <b>Elnas dagbog</b>. Den er skrevet med mærkelige tegn:</p>
            <div class="dark-box" style="font-size:2.4rem;letter-spacing:12px">◆ ● ▲ ■ ★</div>
            <p>Skrivebordsskuffen har en <b>ordlås med 5 bogstaver</b>.</p>
            ${api.flag("drawerOpen") ? "<p><i>Skuffen er åben og tom.</i></p>" : `<div class="row"><button class="action" id="tryDrawer">Prøv ordlåsen</button></div>`}`, (root) => {
            const b = root.querySelector("#tryDrawer");
            if (b) b.addEventListener("click", () => api.wordLock({
              icon: "🗄️🔤", text: "Skriv ordet fra dagbogen:", clue: `<div class="dark-box" style="font-size:2rem;letter-spacing:10px">◆ ● ▲ ■ ★</div>`, answer: "VARME",
              onSolve() {
                api.set("drawerOpen");
                api.give("matches");
                api.modal(`<div class="modal-icon">🗄️➜🔥</div><p>Skuffen glider op. Indeni ligger en æske <b>tændstikker</b>.</p><p class="small-text">Gem dem godt – de kan bruges flere gange.</p>`);
              },
            }));
          });
        },
      },
      {
        id: "secret", label: "Mærkelig bogreol",
        draw: () => `
          <rect x="1520" y="80" width="80" height="560" fill="#3a2412" stroke="#22150a" stroke-width="8"/>
          ${[0, 1, 2, 3].map((r) => `<rect x="1525" y="${200 + r * 115}" width="75" height="10" fill="#22150a"/>${[0, 1].map((i) => `<rect x="${1532 + i * 30}" y="${126 + r * 115}" width="24" height="72" fill="#4a2a4a"/>`).join("")}`).join("")}
          <rect x="1530" y="420" width="60" height="40" rx="4" fill="#1a1210" stroke="#c9a227" stroke-width="2"/><text x="1560" y="446" text-anchor="middle" font-size="16" fill="#c9a227">🔒</text>`,
        click(api) {
          api.codeLock({
            icon: "📚🔒", text: "Bag en bog i reolen gemmer sig en lille <b>talkode-lås</b> med 3 tal.<br>Reolen ser ud som om, den kan svinge op som en dør...",
            length: 3, answer: "731",
            onSolve() {
              api.take("codePage");
              api.sound("creak");
              api.goTo("attic");
            },
          });
        },
      },
    ],
    goal(api) {
      if (!api.flag("booksSolved")) return "books";
      if (!api.flag("drawerOpen")) return "diary";
      if (!api.flag("woodIn")) return "wood";
      if (!api.flag("fireLit")) return "fire";
      if (!api.has("codePage")) return "page";
      return "secret";
    },
    hints: {
      books: ["Maleriet siger: Alt står i regnbuens orden.", "Regnbuens farver: rød, orange, gul, grøn, blå, lilla.", "Tryk bøgerne i den rækkefølge."],
      diary: ["Dagbogens tegn kan oversættes. Har du set tegnene før? Måske i hallen...", "Bag maleriet af Elna i hallen er der en tabel. Gå tilbage og se!", "◆●▲■★ = VARME. Skriv det i skuffen."],
      wood: ["Pejsen er kold. Der er brænde i kurven.", "Brug brændet 🪵 på pejsen."],
      fire: ["Brug tændstikkerne 🔥 på pejsen."],
      page: ["Ordet i dagbogen var VARME. Hvad sker der med det tomme papir ved varme?", "Brug det tomme papir 📄 på pejsen, når den brænder."],
      secret: ["Reolen helt til højre har en talkode.", "Tallene fra papiret: 731."],
    },
  });

  // ================= ROOM 3: Attic =================
  const DANCE = ["🐴", "🐻", "🦢", "🐰"];
  G.room({
    id: "attic",
    title: "Loftet",
    intro: "Loftet... Her er iskoldt. Og derhenne ved vinduet... svæver der NOGEN. 👻",
    particles: { type: "dust", count: 40, color: "#e0e8ff" },
    dark: (api) => (api.flag("lampLit") ? 0 : 250),
    enter(api) {
      api.sound("scare");
      haunt(api, 20000);
    },
    background: () => `${defs}
      <rect width="1600" height="900" fill="#241a2c"/>
      <path d="M0 0 L800 -40 L1600 0 V660 H0 Z" fill="url(#damask)" opacity=".6"/>
      <path d="M0 260 L800 0 L1600 260" stroke="#3a2412" stroke-width="40" fill="none"/>
      ${[200, 500, 1100, 1400].map((x) => `<line x1="${x}" y1="${x < 800 ? 260 - (x / 800) * 260 : ((x - 800) / 800) * 260}" x2="${x}" y2="660" stroke="#3a2412" stroke-width="26"/>`).join("")}
      <rect y="640" width="1600" height="260" fill="url(#oldWood)"/><rect y="640" width="1600" height="260" fill="url(#floorShade)"/>
      <circle cx="800" cy="190" r="90" fill="url(#nightSky)" stroke="#3a2412" stroke-width="16"/><circle cx="830" cy="170" r="30" fill="#fff3c4"/>
      <path d="M710 190 H890 M800 100 V280" stroke="#3a2412" stroke-width="10"/>
      ${cobweb(0, 0, 1.6)}${cobweb(1600, 0, 1.6, -1)}${cobweb(560, 120, 0.6)}`,
    objects: [
      {
        id: "lamp", label: "Olielampe",
        draw: (api) => `
          <rect x="140" y="560" width="120" height="90" fill="#5a3a1e" stroke="#3a2412" stroke-width="4"/>
          <path d="M175 560 h50 l-8 -20 h-34 z" fill="#c9a227"/><ellipse cx="200" cy="510" rx="22" ry="32" fill="#e8f0ff" opacity=".5" stroke="#c9a227" stroke-width="3"/>
          ${api.flag("lampLit") ? `<g class="flicker"><ellipse cx="200" cy="512" rx="8" ry="14" fill="#ffcf5a"/><circle cx="200" cy="510" r="260" fill="url(#fireGlow)"/></g>` : ""}`,
        click(api) {
          if (api.flag("lampLit")) return api.say("Olielampen lyser hele loftet op 🪔");
          api.modal(`<div class="modal-icon">🪔</div><p>En gammel <b>olielampe</b>. Der er stadig olie i den.<br>Du skal bruge noget til at tænde den med.</p>`);
        },
        use(item, api) {
          if (item !== "matches" || api.flag("lampLit")) return false;
          api.take("matches");
          api.set("lampLit");
          api.sound("whoosh");
          api.say("🪔 Lampen lyser! Nu kan du se hele loftet... og spøgelset kan se dig.");
          return true;
        },
      },
      {
        id: "dollhouse", label: "Dukkehus",
        draw: (api) => `
          ${Art.shadow(420, 650, 120)}
          <path d="M310 330 L420 250 L530 330 Z" fill="#7b2d26"/>
          <rect x="320" y="330" width="200" height="315" fill="#e8d8c0" stroke="#6a4a2a" stroke-width="6"/>
          <line x1="320" y1="435" x2="520" y2="435" stroke="#6a4a2a" stroke-width="6"/><line x1="320" y1="540" x2="520" y2="540" stroke="#6a4a2a" stroke-width="6"/>
          <text x="420" y="395" text-anchor="middle" font-size="34">🛏️</text><text x="420" y="500" text-anchor="middle" font-size="34">🛋️</text><text x="420" y="605" text-anchor="middle" font-size="34">🍳</text>
          ${api.flag("dollsSolved") ? `<text x="470" y="400" font-size="26">👧</text><text x="470" y="505" font-size="26">👦</text><text x="470" y="610" font-size="26">👩</text>` : ""}`,
        click(api) {
          if (api.flag("dollsSolved")) return api.say("Dukkefamilien er hjemme igen 🏠");
          api.pickLock({
            icon: "🏠", text: "Et dukkehus med tre etager: <b>Øverst</b> 🛏️ soveværelse, <b>Midt</b> 🛋️ stue, <b>Nederst</b> 🍳 køkken.<br>Tre dukker ligger på gulvet. En seddel siger:",
            clue: `<div class="clue-box" style="text-align:left">👩 <b>Mor</b> laver mad.<br>👦 <b>Bror</b> må ikke være øverst.<br>👧 <b>Lillesøster</b> er træt og skal sove.</div>`,
            rows: [
              { seq: "👩 Mor", options: ["Øverst", "Midt", "Nederst"], answer: "Nederst" },
              { seq: "👦 Bror", options: ["Øverst", "Midt", "Nederst"], answer: "Midt" },
              { seq: "👧 Lillesøster", options: ["Øverst", "Midt", "Nederst"], answer: "Øverst" },
            ],
            button: "Sæt dukkerne ind",
            onSolve() {
              api.set("dollsSolved");
              api.give("crank");
              api.modal(`<div class="modal-icon">🏠➜⚙️</div><p>Da den sidste dukke er på plads, falder der noget ud af skorstenen:<br>et lille <b>håndsving</b>!</p>`);
            },
          });
        },
      },
      {
        id: "musicbox", label: "Spilledåse",
        draw: (api) => `
          <rect x="620" y="560" width="60" height="90" fill="#3a2412"/>
          <rect x="580" y="510" width="140" height="56" rx="6" fill="#7b2d26" stroke="#c9a227" stroke-width="4"/>
          <path d="M580 510 l10 -30 h120 l10 30" fill="#9a3a30" stroke="#c9a227" stroke-width="4"/>
          ${api.flag("musicPlayed") ? `<text x="650" y="470" text-anchor="middle" font-size="30" class="bob">🎶</text>` : `<circle cx="728" cy="538" r="6" fill="#222"/>`}`,
        click(api) {
          if (!api.flag("musicPlayed")) return api.modal(`<div class="modal-icon">🎼</div><p>En smuk gammel <b>spilledåse</b>. Der er et hul i siden, hvor der mangler et håndsving.</p>`);
          playDance(api);
        },
        use(item, api) {
          if (item !== "crank" || api.flag("musicPlayed")) return false;
          api.take("crank");
          api.set("musicPlayed");
          playDance(api);
          return true;
        },
      },
      {
        id: "chest", label: "Legetøjskiste",
        draw: (api) => `
          ${Art.shadow(1010, 650, 130)}
          <rect x="890" y="540" width="240" height="110" rx="8" fill="#5a3a1e" stroke="#3a2412" stroke-width="5"/>
          <path d="M890 540 Q1010 480 1130 540" fill="#6a4a2a" stroke="#3a2412" stroke-width="5"/>
          <rect x="970" y="560" width="80" height="40" rx="6" fill="#2a1a0e" stroke="#c9a227" stroke-width="3"/>
          <text x="1010" y="588" text-anchor="middle" font-size="16" fill="#c9a227">${api.flag("chestOpen") ? "ÅBEN" : "? ? ? ?"}</text>`,
        click(api) {
          if (api.flag("chestOpen")) return api.say("Kisten er tom nu.");
          api.cycleLock({
            icon: "🧰", text: "Legetøjskisten har en lås med fire dyre-hjul.<br>Hvilken rækkefølge?",
            symbols: ["🦢", "🐴", "🐻", "🐰"], answer: DANCE, start: [0, 0, 0, 0], button: "Åbn kisten",
            onSolve() {
              api.set("chestOpen");
              api.give("teddy");
              api.sound("ghost");
              api.modal(`<div class="modal-icon">🧰➜🧸</div><p>Kisten knirker op... Øverst ligger en gammel, slidt <b>bamse</b>.<br>Det er bamsen fra maleriet!</p><p><i>Bag dig bliver der helt stille...</i> 😰</p>`);
            },
          });
        },
      },
      {
        id: "horse", label: "Gyngehest",
        draw: () => `
          <g class="rock" style="transform-origin:1290px 650px">
            <path d="M1200 650 Q1290 690 1380 650" stroke="#5a3a1e" stroke-width="10" fill="none"/>
            <ellipse cx="1290" cy="560" rx="70" ry="34" fill="#e8d8c0" stroke="#6a4a2a" stroke-width="3"/>
            <path d="M1350 545 l30 -60 l25 10 l-20 60 z" fill="#e8d8c0" stroke="#6a4a2a" stroke-width="3"/><circle cx="1390" cy="495" r="4" fill="#222"/>
            <path d="M1240 590 l-20 55 M1340 590 l20 55" stroke="#6a4a2a" stroke-width="10"/>
          </g>`,
        click: (api) => { api.sound("creak"); api.say("Gyngehesten gynger... knirk... knirk... Hvem skubbede til den?! 😨"); },
      },
      {
        id: "ghost", label: "Elna (spøgelset)",
        draw: (api) => `<g class="bob">${ghost(1080, 400, 0.85, api.flag("lampLit") ? 0.85 : 0.55)}</g>`,
        click(api) {
          api.sound("ghost");
          api.modal(`<div class="modal-icon">👻</div><p>Spøgelsespigen <b>Elna</b> svæver foran dig. Hendes stemme er som vind:</p>
            <p><b>"Du må ikke gå... Jeg har været alene i hundrede år... og jeg har mistet min bamse..."</b></p>
            <p><i>Hun ser så trist ud.</i> 😢</p>`);
        },
        use(item, api) {
          if (item !== "teddy") return false;
          api.take("teddy");
          api.win(`Du rækker bamsen frem. Elna tager den forsigtigt... og <b>smiler</b> for første gang i hundrede år. 👻🧸<br><br>
            <i>"Tak... Du må gerne gå nu. Men kom og leg igen en dag?"</i><br><br>
            Nede fra hallen lyder et <b>KLIK</b> – hoveddøren går op af sig selv. Du løber ud i måneskinnet med din bold. ⚽🌙<br>
            Bag dig, i vinduet på loftet, vinker en lille hvid skikkelse farvel... 👋`);
          return true;
        },
      },
    ],
    goal(api) {
      if (!api.flag("lampLit")) return "lamp";
      if (!api.flag("dollsSolved")) return "dolls";
      if (!api.flag("musicPlayed")) return "music";
      if (!api.flag("chestOpen")) return "chest";
      return "ghost";
    },
    hints: {
      lamp: ["Det er mørkt. Olielampen kan tændes.", "Brug tændstikkerne 🔥 fra biblioteket på olielampen."],
      dolls: ["Dukkehuset har tre dukker og en seddel.", "Mor laver mad (køkken = nederst). Lillesøster sover (øverst).", "Mor nederst, Bror midt, Lillesøster øverst."],
      music: ["Spilledåsen mangler et håndsving.", "Brug håndsvinget ⚙️ på spilledåsen."],
      chest: ["Spilledåsens figurer dansede i en bestemt rækkefølge.", "Klik på spilledåsen igen for at se dansen.", "Rækkefølgen er 🐴 🐻 🦢 🐰."],
      ghost: ["Elna savner sin bamse.", "Giv bamsen 🧸 til spøgelset."],
    },
  });

  // Music box: figurines dance one at a time while the melody plays
  function playDance(api) {
    const tones = [392, 330, 294, 262];
    api.modal(`<div class="modal-icon">🎼</div><p>Spilledåsen spiller en sørgmodig melodi...<br>Små figurer danser frem <b>én ad gangen</b>:</p>
      <div class="big-emoji" id="danceRow" style="min-height:3.6rem">&nbsp;</div>
      <div class="row"><button class="action" id="replay">🔁 Spil igen</button></div>`, (root) => {
      const row = root.querySelector("#danceRow");
      let timers = [];
      const run = () => {
        timers.forEach(clearTimeout);
        row.innerHTML = "&nbsp;";
        timers = DANCE.map((f, i) => setTimeout(() => {
          row.innerHTML = DANCE.slice(0, i + 1).join(" ");
          Sound.note(tones[i]);
        }, 700 * (i + 1)));
      };
      root.querySelector("#replay").addEventListener("click", run);
      run();
    });
  }
})();
