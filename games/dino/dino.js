// Game 1: Night at the dinosaur museum (easy)
// Room 1 Fossilhallen: count eggs -> display case -> bone -> fix T-rex -> key -> door
// Room 2 Junglen:      leaf (not meat!) -> feed brachiosaurus -> flashlight -> cave painting -> volcano color buttons
// Room 3 Lobbyen:      plush dinos small->big -> coin -> capsule machine -> horn -> wake night guard
(() => {
  const G = Game.define("dino", {
    title: "Dinosaur-museet",
    emoji: "🦖",
    difficulty: 1,
    minutes: 10,
    accent: "#5fbf4a",
    tagline: "Du faldt i søvn på skoleudflugten. Nu er museet låst, og dinoerne vågner...",
    story: `<p>På skoleudflugten faldt du i søvn bag den store <b>T-rex</b> 🦖 ...</p>
            <p>Da du vågner, er museet mørkt og låst! Find vej gennem dinosaur-hallen, junglen og lobbyen, så du kan komme hjem.</p>`,
    winTitle: "Du kom ud af museet!",
    music: { notes: [262, 330, 392, 330, 294, 349, 440, 349], ms: 480, wave: "triangle", bass: 131 },
  });

  G.item("bone", "🦴", "dino-knogle");
  G.item("key", "🗝️", "gammel nøgle");
  G.item("leaf", "🌿", "stort blad");
  G.item("meat", "🍖", "kødben");
  G.item("flashlight", "🔦", "lommelygte");
  G.item("coin", "🪙", "guldmønt");
  G.item("horn", "📯", "dino-trut");

  // ---------- Shared drawing ----------
  const BONE = "#f1e7cf", BONE_LINE = "#b9a77f";

  // Points along a quadratic curve
  const qpts = (p0, p1, p2, n) => Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    return [(1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0], (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]];
  });

  function trexSkeleton(fixed) {
    const spine = qpts([1010, 330], [930, 360], [850, 440], 9);
    const tail = qpts([850, 440], [720, 500], [560, 530], 10);
    const vert = (pts, r) => pts.map(([x, y]) => `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r}" fill="${BONE}" stroke="${BONE_LINE}" stroke-width="3"/>`).join("");
    const ribs = spine.slice(2, 8).map(([x, y], i) => `<path d="M${x} ${y} q${-10 - i * 2} ${50 + i * 6} ${-30} ${100 - i * 4}" stroke="${BONE}" stroke-width="9" fill="none" stroke-linecap="round"/>`).join("");
    const tailPts = fixed ? tail : tail.filter((_, i) => i !== 6);
    const gap = tail[6];
    const leg = (pts) => `<path d="M${pts.join(" L")}" stroke="${BONE_LINE}" stroke-width="30" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M${pts.join(" L")}" stroke="${BONE}" stroke-width="22" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    return `
      ${leg(["840 450", "800 570", "850 640", "800 690"])}
      ${leg(["880 455", "920 575", "880 640", "930 690"])}
      ${ribs}
      ${vert(spine, 15)}${vert(tailPts, 13)}
      ${fixed ? "" : `<circle cx="${gap[0]}" cy="${gap[1]}" r="16" fill="none" stroke="#ffd86b" stroke-width="3" stroke-dasharray="6 5" class="pulse"/>`}
      <path d="M965 385 l25 30 l-8 6" stroke="${BONE}" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M995 330 L1035 262 Q1100 235 1160 262 L1168 296 Q1135 305 1112 312 L1160 320 Q1130 352 1060 345 Q1020 345 995 330 Z" fill="${BONE}" stroke="${BONE_LINE}" stroke-width="4"/>
      <circle cx="1075" cy="275" r="15" fill="#2a2236"/><circle cx="1040" cy="300" r="10" fill="#2a2236"/>
      ${[1070, 1090, 1110, 1130, 1150].map((x) => `<path d="M${x} 305 l6 14 l6 -14" fill="#fff" stroke="${BONE_LINE}" stroke-width="2"/>`).join("")}`;
  }

  function brachio(lowered) {
    const neck = lowered ? "M1070 520 Q980 470 1000 560" : "M1250 510 Q1300 330 1320 170";
    const head = lowered ? [995, 578] : [1330, 150];
    return `
      ${Art.shadow(1190, 760, 200)}
      <path d="M1330 560 Q1400 610 1415 700" stroke="#4f8f4a" stroke-width="36" fill="none" stroke-linecap="round"/>
      ${[1070, 1130, 1230, 1290].map((x) => `<rect x="${x - 22}" y="590" width="44" height="170" rx="16" fill="#46833f"/>`).join("")}
      <ellipse cx="1180" cy="560" rx="170" ry="95" fill="#5aa152"/>
      <ellipse cx="1180" cy="590" rx="120" ry="45" fill="#7cc26f"/>
      ${[1110, 1160, 1210].map((x) => `<circle cx="${x}" cy="520" r="12" fill="#4f8f4a"/>`).join("")}
      <path d="${neck}" stroke="#5aa152" stroke-width="46" fill="none" stroke-linecap="round"/>
      <ellipse cx="${head[0]}" cy="${head[1]}" rx="48" ry="30" fill="#5aa152"/>
      <circle cx="${head[0] + (lowered ? -14 : 14)}" cy="${head[1] - 8}" r="7" fill="#222"/>
      <path d="M${head[0] + (lowered ? -40 : 10)} ${head[1] + 12} q15 8 30 0" stroke="#2a4a26" stroke-width="3" fill="none"/>
      ${lowered ? "" : `<g class="bob"><line x1="1320" y1="200" x2="1320" y2="240" stroke="#333" stroke-width="3"/><rect x="1300" y="238" width="40" height="18" rx="5" fill="#f2c230"/><circle cx="1340" cy="247" r="8" fill="#fff8c0"/></g>`}`;
  }

  function plush(x, y, s, color) {
    return `<g transform="translate(${x} ${y}) scale(${s})">
      <ellipse cx="0" cy="-30" rx="40" ry="28" fill="${color}"/>
      <path d="M30 -40 Q50 -90 70 -90 Q86 -90 82 -76 Q66 -78 56 -40 Z" fill="${color}"/>
      <path d="M-38 -30 Q-70 -20 -76 -6 Q-50 -12 -36 -18 Z" fill="${color}"/>
      <rect x="-28" y="-10" width="14" height="14" rx="5" fill="${color}"/><rect x="14" y="-10" width="14" height="14" rx="5" fill="${color}"/>
      <circle cx="72" cy="-84" r="3" fill="#222"/></g>`;
  }

  const museumWall = (top, bottom) => `
    <rect width="1600" height="660" fill="url(#museumWall)"/>
    <rect y="640" width="1600" height="260" fill="url(#marble)"/>
    <rect y="640" width="1600" height="260" fill="url(#floorShade)"/>
    <rect y="628" width="1600" height="16" fill="#8a6f4f"/>
    <defs>
      <linearGradient id="museumWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>
      <pattern id="marble" width="160" height="80" patternUnits="userSpaceOnUse">
        <rect width="160" height="80" fill="#cbbfa8"/><rect width="80" height="40" fill="#bfb29a"/><rect x="80" y="40" width="80" height="40" fill="#bfb29a"/>
        <path d="M10 20 q30 10 60 -5 M90 60 q30 -12 60 4" stroke="#a89a80" stroke-width="2" fill="none" opacity=".6"/>
      </pattern>
    </defs>`;

  const column = (x) => `
    <rect x="${x - 45}" y="80" width="90" height="560" fill="#e9dfc9"/>
    ${[0, 1, 2, 3].map((i) => `<rect x="${x - 35 + i * 20}" y="100" width="8" height="520" fill="#d6c9ad"/>`).join("")}
    <rect x="${x - 60}" y="60" width="120" height="30" fill="#d6c9ad"/><rect x="${x - 60}" y="620" width="120" height="24" fill="#d6c9ad"/>`;

  const archWindow = (x) => `
    <path d="M${x - 80} 380 V180 Q${x} 80 ${x + 80} 180 V380 Z" fill="url(#nightSky)" stroke="#8a7656" stroke-width="10"/>
    <line x1="${x}" y1="105" x2="${x}" y2="380" stroke="#8a7656" stroke-width="6"/><line x1="${x - 80}" y1="250" x2="${x + 80}" y2="250" stroke="#8a7656" stroke-width="6"/>
    <polygon points="${x - 75},380 ${x + 75},380 ${x + 260},880 ${x - 40},880" fill="#cfe0ff" opacity=".07" pointer-events="none"/>`;

  // ================= ROOM 1: Fossil hall =================
  G.room({
    id: "hall",
    title: "Dinosaur-hallen",
    intro: "Det er mørkt i museet 🌙 Døren er låst. Kig dig omkring!",
    particles: { type: "dust", count: 30 },
    background: () => `
      ${museumWall("#6a5a7a", "#a08a78")}
      ${archWindow(420)}${archWindow(1220)}
      ${column(120)}${column(1500)}
      <path d="M560 40 H1040 V110 L800 140 L560 110 Z" fill="#7b2d26"/>
      <text x="800" y="95" text-anchor="middle" font-size="40" font-weight="bold" fill="#ffd86b" font-family="Trebuchet MS">DINO-HALLEN</text>
      <rect x="560" y="690" width="640" height="44" rx="6" fill="#5a4636"/><rect x="560" y="690" width="640" height="10" fill="#7a6048"/>`,
    objects: [
      {
        id: "door", label: "Dør til junglen",
        draw: () => `
          <rect x="190" y="300" width="170" height="340" rx="8" fill="#5a3a22" stroke="#3a2412" stroke-width="10"/>
          <path d="M190 300 Q275 220 360 300" fill="#4a2e18" stroke="#3a2412" stroke-width="10"/>
          <rect x="210" y="330" width="130" height="130" rx="6" fill="#6e4526"/><rect x="210" y="480" width="130" height="130" rx="6" fill="#6e4526"/>
          <circle cx="330" cy="470" r="10" fill="#e8c14a"/><rect x="315" y="485" width="30" height="34" rx="4" fill="#e8c14a"/><circle cx="330" cy="498" r="5" fill="#333"/>
          <text x="275" y="285" text-anchor="middle" font-size="44">🌴</text>`,
        click(api) {
          if (api.has("key")) return this.use("key", api);
          api.modal(`<div class="modal-icon">🚪🔒</div><p>Døren til junglen er låst.<br>Du skal bruge en <b>nøgle</b>.</p>`);
        },
        use(item, api) {
          if (item !== "key") return false;
          api.take("key");
          api.goTo("jungle");
          return true;
        },
      },
      {
        id: "nest", label: "Dino-rede",
        draw: () => `
          ${Art.shadow(300, 765, 130)}
          <ellipse cx="300" cy="740" rx="130" ry="40" fill="#a57a3c"/>
          ${[[-110, 0], [-60, 15], [0, 20], [60, 15], [110, 0]].map(([dx, dy]) => `<path d="M${200 + dx + 100} ${745 + dy} q-20 -10 -30 -2" stroke="#7a5a28" stroke-width="5" fill="none"/>`).join("")}
          ${[[225, 715, "#9fd36f"], [270, 705, "#6fb6e0"], [318, 708, "#f2a65a"], [362, 718, "#e57373"], [295, 728, "#c38fe0"]]
            .map(([x, y, c]) => `<ellipse cx="${x}" cy="${y}" rx="22" ry="30" fill="${c}" stroke="#00000033" stroke-width="3"/><circle cx="${x - 6}" cy="${y - 10}" r="5" fill="#ffffff66"/>`).join("")}
          <path d="M175 740 Q300 790 425 740 Q420 770 300 780 Q180 770 175 740 Z" fill="#8a6230"/>`,
        click: (api) => api.modal(`<div class="modal-icon">🪺</div><p>En rede med farvede <b>dino-æg</b>.</p><p class="big-emoji">🥚🥚🥚🥚🥚</p><p>Hvor mange er der?</p>`),
      },
      {
        id: "trex", label: "T-rex skelet",
        draw: (api) => trexSkeleton(api.flag("boneFixed")),
        click(api) {
          if (api.flag("boneFixed")) return api.say("T-rex'en blinker til dig 😉 ... eller var det bare noget, du forestillede dig?");
          api.modal(`<div class="modal-icon">🦖💀</div><p>Et kæmpe <b>T-rex skelet</b>!<br>Der mangler en knogle i halen. Der er et tomt hul.</p>`);
        },
        use(item, api) {
          if (item !== "bone" || api.flag("boneFixed")) return false;
          api.take("bone");
          api.set("boneFixed");
          api.sound("roar");
          api.give("key");
          api.modal(`<div class="modal-icon">🦴➜🦖</div><p>Du sætter knoglen i halen... Klik!</p><p>Skelettet ryster... <b>ROOOAR!</b> 😱<br>En <b>gammel nøgle</b> falder ud af munden på det!</p>`);
          api.say("Du fik en nøgle 🗝️ Hvilken dør passer den til?");
          return true;
        },
      },
      {
        id: "case", label: "Glasmontre",
        draw: (api) => `
          ${Art.shadow(1350, 765, 110)}
          <rect x="1265" y="600" width="170" height="160" fill="#4a3a2c"/><rect x="1265" y="600" width="170" height="14" fill="#6a5440"/>
          <rect x="1270" y="440" width="160" height="160" fill="#bfe3ff" opacity=".25" stroke="#e5f3ff" stroke-width="5"/>
          ${api.flag("caseOpen") ? "" : `<path d="M1320 560 l60 -20" stroke="${BONE}" stroke-width="16" stroke-linecap="round"/><circle cx="1318" cy="560" r="11" fill="${BONE}"/><circle cx="1382" cy="540" r="11" fill="${BONE}"/>`}
          <rect x="1270" y="440" width="160" height="160" fill="url(#glass)"/>
          <rect x="1315" y="640" width="70" height="40" rx="6" fill="#222"/>
          <text x="1350" y="668" text-anchor="middle" font-size="20" fill="#7dff8a" font-family="Consolas">${api.flag("caseOpen") ? "OK" : "🥚 ?"}</text>`,
        click(api) {
          if (api.flag("caseOpen")) return api.say("Montren er tom nu.");
          api.codeLock({
            icon: "🔒",
            text: "En glasmontre med en <b>knogle</b> indeni.<br>På låsen står der: <b>🥚 = ?</b>",
            length: 1,
            answer: "5",
            onSolve() {
              api.set("caseOpen");
              api.give("bone");
              api.modal(`<div class="modal-icon">🔓🦴</div><p>Montren går op!<br>Du tager <b>dino-knoglen</b>.</p>`);
              api.say("Du fandt en dino-knogle 🦴 Hvor mangler der en knogle?");
            },
          });
        },
      },
      {
        id: "bench", label: "Din rygsæk",
        draw: () => `
          <rect x="460" y="700" width="200" height="18" rx="5" fill="url(#wood)"/>
          <rect x="475" y="716" width="14" height="60" fill="#5a3a1e"/><rect x="630" y="716" width="14" height="60" fill="#5a3a1e"/>
          <path d="M520 700 Q515 640 560 635 Q605 640 600 700 Z" fill="#d04545"/><rect x="535" y="660" width="50" height="22" rx="5" fill="#b03535"/>`,
        click: (api) => api.modal(`<div class="modal-icon">🎒🥪</div><p>Din egen rygsæk fra skoleudflugten.<br>Der er en halv madpakke i. Mums!</p>`),
      },
    ],
    goal(api) {
      if (!api.flag("caseOpen")) return "case";
      if (!api.flag("boneFixed")) return "trex";
      return "door";
    },
    hints: {
      case: ["Montren spørger, hvor mange æg der er. Kig i reden.", "Der er 5 æg. Skriv 5 på låsen."],
      trex: ["T-rex'en mangler en knogle i halen.", "Klik på 🦴 i rygsækken og derefter på T-rex'en."],
      door: ["Brug nøglen 🗝️ på døren med palmen."],
    },
  });

  // ================= ROOM 2: Jungle =================
  const ghostColors = [["🔵", "blue"], ["🔴", "red"], ["🟡", "yellow"]];
  G.room({
    id: "jungle",
    title: "Junglen",
    intro: "Du er i jungle-udstillingen 🌴 Der er en kæmpe dinosaur... den bevæger sig!",
    particles: { type: "sparks", count: 22, color: "#c8ff8a" },
    background: () => `
      <defs><linearGradient id="jungleSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16352a"/><stop offset="1" stop-color="#2f6b4a"/></linearGradient></defs>
      <rect width="1600" height="900" fill="url(#jungleSky)"/>
      ${[[80, 640, 1.4], [300, 660, 1], [1500, 650, 1.3], [700, 660, .9]].map(([x, y, s]) => `
        <g transform="translate(${x} ${y}) scale(${s})" fill="#1f4d33">
          <rect x="-12" y="-300" width="24" height="300" fill="#4a3322"/>
          ${[-60, -20, 20, 60].map((a) => `<ellipse cx="0" cy="-300" rx="120" ry="26" transform="rotate(${a} 0 -300)"/>`).join("")}
        </g>`).join("")}
      <rect y="660" width="1600" height="240" fill="#3a5a2a"/>
      <rect y="660" width="1600" height="240" fill="url(#floorShade)"/>
      ${Array.from({ length: 22 }, (_, i) => `<path d="M${i * 75} 670 q20 -50 40 0" fill="#2e7d32"/>`).join("")}`,
    objects: [
      {
        id: "waterfall", label: "Vandfald og hule",
        draw: (api) => `
          <path d="M60 640 V250 Q170 180 280 250 V640 Z" fill="#3b3f4a"/>
          <ellipse cx="170" cy="460" rx="80" ry="120" fill="#0b0b12"/>
          ${api.flag("caveLit") ? `<circle cx="170" cy="460" r="110" fill="#fff6b0" opacity=".25"/>
            <text x="125" y="455" font-size="40">🔵</text><text x="150" y="505" font-size="40">🔴</text><text x="175" y="455" font-size="40">🟡</text>` : ""}
          <rect x="110" y="250" width="120" height="390" fill="#7fc8ff" opacity=".45"/>
          ${[0, 1, 2, 3, 4].map((i) => `<rect x="${118 + i * 24}" y="250" width="6" height="390" fill="#e6f6ff" opacity=".6" class="pulse" style="animation-delay:-${i * 0.3}s"/>`).join("")}
          <ellipse cx="170" cy="650" rx="140" ry="24" fill="#7fc8ff" opacity=".6"/>`,
        click(api) {
          if (api.flag("caveLit")) return api.modal(`<div class="modal-icon">🖐️</div><p>Hulemalerier med farvede håndaftryk:</p><p class="big-emoji">🔵 🔴 🟡</p>`);
          api.modal(`<div class="modal-icon">🌊🕳️</div><p>Bag vandfaldet er der en mørk <b>hule</b>.<br>Det er alt for mørkt til at se noget...</p>`);
        },
        use(item, api) {
          if (item !== "flashlight") return false;
          api.take("flashlight");
          api.set("caveLit");
          api.modal(`<div class="modal-icon">🔦🖐️</div><p>Du lyser ind i hulen...<br>Der er <b>hulemalerier</b> med farvede håndaftryk!</p><p class="big-emoji">🔵 🔴 🟡</p>`);
          api.say("Hulemalerierne viser: 🔵 🔴 🟡");
          return true;
        },
      },
      {
        id: "bush", label: "Busk med blade",
        draw: (api) => `
          ${Art.shadow(440, 770, 110)}
          ${[[380, 700, 70], [450, 680, 80], [510, 710, 60], [430, 740, 70]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#2f7d3a"/>`).join("")}
          ${api.has("leaf") || api.flag("fed") ? "" : `<path d="M470 640 q40 -40 70 -10 q-30 40 -70 10z" fill="#7ed957" stroke="#3a7a2a" stroke-width="3"/>`}
          ${[[400, 690], [470, 720], [430, 660]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#ff7aa2"/>`).join("")}`,
        click(api) {
          if (api.has("leaf") || api.flag("fed")) return api.say("En busk med blomster.");
          api.give("leaf");
          api.render();
          api.say("Du plukkede et stort, saftigt blad 🌿");
        },
      },
      {
        id: "basket", label: "Picnickurv",
        draw: (api) => `
          <path d="M600 740 h110 l-12 50 h-86z" fill="#c68a4a" stroke="#7a5228" stroke-width="4"/>
          <path d="M610 740 q45 -50 90 0" stroke="#7a5228" stroke-width="6" fill="none"/>
          <path d="M600 755 h110 M604 772 h102" stroke="#7a5228" stroke-width="3"/>
          ${api.has("meat") ? "" : `<path d="M640 735 q20 -25 40 -5" stroke="#b5533c" stroke-width="16" stroke-linecap="round"/>`}`,
        click(api) {
          if (api.has("meat")) return api.say("Picnickurven er tom.");
          api.give("meat");
          api.render();
          api.say("Du fandt et kødben 🍖 i picnickurven.");
        },
      },
      {
        id: "brachio", label: "Brachiosaurus",
        draw: (api) => brachio(api.flag("fed")),
        click(api) {
          if (api.flag("fed")) {
            if (api.has("flashlight") || api.flag("caveLit")) return api.say("Brachiosaurus'en tygger glad på sit blad 🌿");
            api.give("flashlight");
            api.render();
            return api.modal(`<div class="modal-icon">🦕🔦</div><p>Nu kan du nå dinoens hals.<br>Du tager <b>lommelygten</b>, der hang der!</p>`);
          }
          api.modal(`<div class="modal-icon">🦕</div><p>En kæmpe <b>Brachiosaurus</b> 🦕 ... den rører på sig!<br>Den ser <b>sulten</b> ud.</p><p>Helt oppe ved loftet hænger der noget gult om halsen på den.</p>`);
        },
        use(item, api) {
          if (api.flag("fed")) return false;
          if (item === "meat") { api.say("🦕 Brachiosaurus rynker på næsen. Den er <b>planteæder</b> og spiser ikke kød!"); return true; }
          if (item !== "leaf") return false;
          api.take("leaf");
          api.set("fed");
          api.sound("success");
          api.modal(`<div class="modal-icon">🌿➜🦕</div><p>Mmm! Dinoen spiser bladet og <b>sænker hovedet</b> helt ned til dig.</p><p>Der hænger en lommelygte om halsen på den!</p>`);
          return true;
        },
      },
      {
        id: "volcano", label: "Vulkan-model",
        draw: (api) => `
          ${Art.shadow(800, 780, 150)}
          <rect x="660" y="690" width="280" height="90" rx="8" fill="#5a4636"/>
          ${api.flag("erupted") ? `<circle cx="800" cy="430" r="120" fill="#ff7a2f" opacity=".3"/><g class="bob">${[[770, 420], [810, 390], [850, 430]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="30" fill="#777" opacity=".7"/>`).join("")}</g>` : ""}
          <path d="M680 690 L770 500 H830 L920 690 Z" fill="#6b4a3a"/>
          <path d="M770 500 H830 L815 540 Q800 520 785 540 Z" fill="#ff5a1f"/>
          <path d="M790 540 q-20 60 -10 120 M815 540 q15 60 -5 120" stroke="#ff8a3d" stroke-width="8" fill="none" opacity=".8"/>
          <rect x="700" y="710" width="200" height="50" rx="8" fill="#2b2b33"/>
          ${["#e53935", "#fdd835", "#1e88e5", "#43a047"].map((c, i) => `<circle cx="${730 + i * 47}" cy="735" r="14" fill="${c}" stroke="#111" stroke-width="3"/>`).join("")}`,
        click(api) {
          if (api.flag("erupted")) return api.say("Vulkanen ryger stadig. Døren er åben!");
          api.sequenceLock({
            icon: "🌋",
            text: "Vulkan-modellen har fire farvede knapper.<br>Tryk dem i den rigtige rækkefølge.",
            buttons: [
              { v: "red", html: "", cls: "c-red" }, { v: "yellow", html: "", cls: "c-yellow" },
              { v: "blue", html: "", cls: "c-blue" }, { v: "green", html: "", cls: "c-green" },
            ],
            answer: ghostColors.map((c) => c[1]),
            onSolve() {
              api.set("erupted");
              api.sound("roar");
              api.modal(`<div class="modal-icon">🌋💨</div><p><b>BUMMELUM!</b> Vulkanen sprøjter røg ud!<br>Den hemmelige dør til <b>lobbyen</b> glider op!</p>`);
              api.say("Døren til lobbyen er åben 🚪");
            },
          });
        },
      },
      {
        id: "exit", label: "Dør til lobbyen",
        draw: (api) => `
          <rect x="1440" y="380" width="140" height="260" rx="6" fill="${api.flag("erupted") ? "#ffe9a8" : "#4a3a2c"}" stroke="#2a1f16" stroke-width="10"/>
          ${api.flag("erupted") ? `<circle cx="1510" cy="510" r="140" fill="#ffe9a8" opacity=".2"/>` : `<rect x="1460" y="400" width="100" height="220" fill="#5a4636"/>`}
          <rect x="1450" y="335" width="120" height="36" rx="6" fill="#1e8449"/><text x="1510" y="361" text-anchor="middle" font-size="20" fill="#fff" font-weight="bold">LOBBY</text>`,
        click(api) {
          if (api.flag("erupted")) return api.goTo("lobby");
          api.modal(`<div class="modal-icon">🚪</div><p>Døren til lobbyen er lukket.<br>Der er intet håndtag... Måske åbner den på en anden måde?</p>`);
        },
      },
    ],
    goal(api) {
      if (!api.flag("fed") && !api.has("leaf")) return "leaf";
      if (!api.flag("fed")) return "feed";
      if (!api.has("flashlight") && !api.flag("caveLit")) return "flashlight";
      if (!api.flag("caveLit")) return "cave";
      if (!api.flag("erupted")) return "volcano";
      return "exit";
    },
    hints: {
      leaf: ["Dinoen er sulten. Hvad spiser en langhalset dino?", "Pluk et blad fra busken."],
      feed: ["Giv dinoen bladet 🌿, ikke kød!", "Klik på 🌿 i rygsækken og derefter på dinoen."],
      flashlight: ["Dinoen har sænket hovedet. Hvad hænger om halsen?", "Klik på dinoen for at tage lommelygten."],
      cave: ["Hulen bag vandfaldet er mørk.", "Brug lommelygten 🔦 på vandfaldet."],
      volcano: ["Hulemalerierne viser farver: 🔵 🔴 🟡.", "Tryk blå, rød og gul på vulkanen."],
      exit: ["Gå gennem døren til lobbyen."],
    },
  });

  // ================= ROOM 3: Lobby =================
  G.room({
    id: "lobby",
    title: "Lobbyen",
    intro: "Lobbyen! Udgangen er lige der... men glasdørene er låst, og natvagten sover.",
    particles: { type: "dust", count: 24 },
    background: () => `
      ${museumWall("#3a4a6a", "#7a7f98")}
      <rect x="560" y="120" width="480" height="420" fill="url(#nightSky)" stroke="#d6c9ad" stroke-width="12"/>
      ${[1, 2, 3].map((i) => `<line x1="${560 + i * 120}" y1="120" x2="${560 + i * 120}" y2="540" stroke="#d6c9ad" stroke-width="8"/>`).join("")}
      <circle cx="930" cy="210" r="40" fill="#fff3c4"/><circle cx="930" cy="210" r="90" fill="url(#moonGlow)"/>
      <path d="M520 60 H1080 V110 H520 Z" fill="#7b2d26"/><text x="800" y="98" text-anchor="middle" font-size="36" font-weight="bold" fill="#ffd86b">VELKOMMEN</text>
      ${column(90)}${column(1510)}`,
    objects: [
      {
        id: "shop", label: "Butikken",
        draw: (api) => `
          <rect x="170" y="330" width="330" height="310" fill="#e9dfc9" stroke="#8a7656" stroke-width="6"/>
          <rect x="170" y="290" width="330" height="50" fill="#c0392b"/><text x="335" y="325" text-anchor="middle" font-size="30" font-weight="bold" fill="#fff">BUTIK</text>
          <rect x="190" y="460" width="290" height="12" fill="url(#wood)"/><rect x="190" y="600" width="290" height="12" fill="url(#wood)"/>
          ${plush(230, 460, 0.5, "#9b59b6")}${plush(300, 460, 0.9, "#e67e22")}${plush(410, 460, 0.7, "#3498db")}${plush(260, 600, 1.1, "#e74c3c")}
          ${api.flag("plushSorted") ? "" : `<text x="420" y="590" font-size="40">🪙</text>`}`,
        click(api) {
          if (api.flag("plushSorted")) return api.say("Bamse-dinoerne står pænt på række nu 🦕🦕🦕🦕");
          const sizes = [["s", 1.4], ["m", 2], ["l", 2.7], ["xl", 3.4]];
          const shuffled = [sizes[2], sizes[0], sizes[3], sizes[1]];
          api.sequenceLock({
            icon: "🧸",
            text: "Et skilt: <b>Sæt bamse-dinoerne på række, fra den mindste til den største.</b><br>Så får du en guldmønt!",
            buttons: shuffled.map(([v, s]) => ({ v, html: `<span style="font-size:${s}rem">🦕</span>` })),
            answer: ["s", "m", "l", "xl"],
            onSolve() {
              api.set("plushSorted");
              api.give("coin");
              api.modal(`<div class="modal-icon">🦕🦕🦕🦕 ➜ 🪙</div><p>Perfekt række!<br>Du får en <b>guldmønt</b>.</p>`);
              api.say("Du fik en guldmønt 🪙");
            },
          });
        },
      },
      {
        id: "machine", label: "Overraskelses-automat",
        draw: () => `
          ${Art.shadow(620, 780, 70)}
          <rect x="560" y="560" width="120" height="220" rx="12" fill="#e74c3c" stroke="#8e2b22" stroke-width="5"/>
          <circle cx="620" cy="560" r="62" fill="#bfe3ff" opacity=".5" stroke="#fff" stroke-width="5"/>
          ${[[595, 545, "#f1c40f"], [630, 530, "#2ecc71"], [645, 570, "#9b59b6"], [600, 580, "#3498db"]].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="16" fill="${c}"/>`).join("")}
          <rect x="590" y="650" width="60" height="16" rx="6" fill="#222"/><circle cx="620" cy="710" r="18" fill="#f1c40f" stroke="#a37514" stroke-width="4"/>`,
        click: (api) => api.modal(`<div class="modal-icon">🎰🥚</div><p>En automat med overraskelses-æg.<br>Der står: <b>1 guldmønt</b>.</p>`),
        use(item, api) {
          if (item !== "coin") return false;
          api.take("coin");
          api.give("horn");
          api.modal(`<div class="modal-icon">🪙➜🥚➜📯</div><p>Klonk! Ud kommer et overraskelses-æg...<br>Indeni er en <b>dino-trut</b>! Den er HØJ!</p>`);
          api.say("Du fik en dino-trut 📯");
          return true;
        },
      },
      {
        id: "guard", label: "Natvagt",
        draw: (api) => `
          <rect x="930" y="600" width="160" height="30" rx="8" fill="#6a4a3a"/><rect x="940" y="628" width="14" height="140" fill="#4a2e18"/><rect x="1066" y="628" width="14" height="140" fill="#4a2e18"/>
          <rect x="1070" y="460" width="24" height="170" rx="8" fill="#6a4a3a"/>
          ${Art.guard(1010, 760, 0.85, { facing: -1, mood: api.flag("awake") ? "awake" : "sleep" })}
          ${api.flag("awake") ? "" : `<text x="930" y="510" font-size="40" class="bob">💤</text><rect x="1035" y="640" width="40" height="26" rx="4" fill="#fff" stroke="#333" stroke-width="2"/>`}`,
        click(api) {
          if (api.flag("awake")) return api.say("Natvagten smiler og vinker til dig 👋");
          api.modal(`<div class="modal-icon">💂😴</div><p>Natvagten sover TUNGT og snorker. 😴<br>Han har <b>nøglekortet</b> til udgangen.</p><p>Du prøver at prikke til ham... han vågner ikke!</p>`);
        },
        use(item, api) {
          if (item !== "horn" || api.flag("awake")) return false;
          api.take("horn");
          api.set("awake");
          api.sound("alarm");
          api.modal(`<div class="modal-icon">📯💥😲</div><p><b>TUUUUT!</b> Natvagten hopper op af stolen!</p>
            <p>"Der er du jo! Hele skolen har ledt efter dig! Kom, jeg lukker dig ud."</p>`);
          return true;
        },
      },
      {
        id: "exitDoors", label: "Udgang",
        draw: (api) => `
          <rect x="1180" y="300" width="250" height="340" fill="${api.flag("awake") ? "#ffe9a8" : "#1a2238"}" stroke="#d6c9ad" stroke-width="10"/>
          <line x1="1305" y1="300" x2="1305" y2="640" stroke="#d6c9ad" stroke-width="8"/>
          <rect x="1180" y="300" width="250" height="340" fill="url(#glass)"/>
          <rect x="1240" y="250" width="130" height="40" rx="6" fill="#1e8449"/><text x="1305" y="279" text-anchor="middle" font-size="22" fill="#fff" font-weight="bold">UDGANG</text>
          <rect x="1440" y="440" width="30" height="50" rx="5" fill="#333"/><circle cx="1455" cy="455" r="6" fill="${api.flag("awake") ? "#2ecc71" : "#e74c3c"}"/>`,
        click(api) {
          if (!api.flag("awake")) return api.modal(`<div class="modal-icon">🚪🔒</div><p>Glasdørene er låst.<br>De åbner kun med <b>nøglekortet</b>, og det har natvagten.</p>`);
          api.win(`Natvagten åbner døren, og udenfor står din lærer og hele klassen! 🚌<br>
            "Hvor har du været?!" råber de.<br><br>
            Du kigger tilbage ind i museet... og T-rex'en <b>blinker</b> til dig. 🦖😉`);
        },
      },
    ],
    goal(api) {
      if (!api.flag("plushSorted")) return "shop";
      if (!api.has("horn") && !api.flag("awake")) return "machine";
      if (!api.flag("awake")) return "guard";
      return "exit";
    },
    hints: {
      shop: ["Butikken har bamse-dinoer, der skal på række.", "Tryk fra den mindste dino til den største."],
      machine: ["Automaten koster 1 guldmønt.", "Brug guldmønten 🪙 på automaten."],
      guard: ["Natvagten sover tungt. Noget HØJT kan vække ham!", "Brug dino-trutten 📯 på natvagten."],
      exit: ["Gå ud gennem udgangen! 🚪"],
    },
  });
})();
