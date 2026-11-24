// Game 4: Space station (normal+)
// Room 1 Kabinen:   arrow sticker -> gravity switches -> toolbox falls -> screwdriver
//                   count planets + astronauts (83) -> locker -> manual; screwdriver on door panel -> wire mapping from manual
// Room 2 Kontrol:   star map (find the W) -> battery; food dispenser -> snack -> cat drops chip
//                   battery + chip on robot -> robot explains lamp values 4-2-1 -> lamp code 536 -> door
// Room 3 Luftsluse: biggest planet crate -> oxygen; suit size logic -> suit; suit + oxygen -> airlock procedure
//                   radar coordinates (C4) -> pod launch
(() => {
  const G = Game.define("space", {
    title: "Rumstationen",
    emoji: "🚀",
    difficulty: 3,
    minutes: 25,
    accent: "#36d6e7",
    tagline: "Alarm på rumstation Nova! Alle er flygtet – nu skal du nå redningskapslen.",
    story: `<p>Du er den yngste astronaut på rumstationen <b>Nova</b> 🛰️. Mens du sov, ramte en meteor stationen!</p>
            <p>Alle andre er flygtet, og strømmen svigter. Kom fra din kabine, gennem kontrolrummet og ud til <b>redningskapslen</b>, før det er for sent!</p>
            <p><i>...og hvad er det for nogle mærkelige lyde? 👽</i></p>`,
    winTitle: "Du kom hjem til Jorden!",
    music: { notes: [196, 0, 294, 0, 262, 0, 392, 330, 0, 294, 0, 247], ms: 320, wave: "sine", bass: 98 },
  });

  G.item("screwdriver", "🪛", "skruetrækker");
  G.item("manual", "📘", "manual");
  G.item("battery", "🔋", "power-celle");
  G.item("snack", "🍣", "rum-snack");
  G.item("chip", "💾", "robot-chip");
  G.item("oxygen", "🫧", "iltflaske");
  G.item("suit", "🧑‍🚀", "rumdragt");
  G.item("suitReady", "🧑‍🚀🫧", "rumdragt med ilt");
  G.recipe("suit", "oxygen", "suitReady", "Du kobler iltflasken på rumdragten.<br>Pssst! Nu kan du trække vejret i rummet!");

  // ---------- Shared drawing ----------
  const defs = `<defs>
    <pattern id="hull" width="200" height="140" patternUnits="userSpaceOnUse">
      <rect width="200" height="140" fill="#3a4458"/><rect x="4" y="4" width="192" height="132" rx="10" fill="#465269"/>
      <circle cx="16" cy="16" r="4" fill="#2b3344"/><circle cx="184" cy="16" r="4" fill="#2b3344"/><circle cx="16" cy="124" r="4" fill="#2b3344"/><circle cx="184" cy="124" r="4" fill="#2b3344"/>
    </pattern>
    <pattern id="grate" width="40" height="40" patternUnits="userSpaceOnUse">
      <rect width="40" height="40" fill="#2b3140"/><path d="M0 20 H40 M20 0 V40" stroke="#1c212c" stroke-width="5"/>
    </pattern>
    <radialGradient id="earthGrad" cx=".35" cy=".35"><stop offset="0" stop-color="#7fd3ff"/><stop offset="1" stop-color="#1a5fb4"/></radialGradient>
    <radialGradient id="space" cx=".5" cy=".5"><stop offset="0" stop-color="#1a1440"/><stop offset="1" stop-color="#05040f"/></radialGradient>
  </defs>`;

  const neon = (x1, y1, x2, y2, c = "#36d6e7") => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="6" opacity=".9"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="22" opacity=".15"/>`;

  const stationBg = (alarm) => `${defs}
    <rect width="1600" height="900" fill="url(#hull)"/>
    <rect y="680" width="1600" height="220" fill="url(#grate)"/><rect y="680" width="1600" height="220" fill="url(#floorShade)"/>
    <rect y="670" width="1600" height="14" fill="#1c212c"/><rect y="0" width="1600" height="40" fill="#2b3140"/>
    ${neon(0, 44, 1600, 44)}${neon(0, 664, 1600, 664)}
    ${alarm ? `<g class="pulse" pointer-events="none"><rect width="1600" height="900" fill="#ff2a2a" opacity=".08"/></g>` : ""}`;

  function porthole(x, y, r, inner) {
    return `<defs><clipPath id="port${x}"><circle cx="${x}" cy="${y}" r="${r}"/></clipPath></defs>
      <circle cx="${x}" cy="${y}" r="${r + 22}" fill="#5d6a82" stroke="#2b3140" stroke-width="6"/>
      <g clip-path="url(#port${x})"><rect x="${x - r}" y="${y - r}" width="${r * 2}" height="${r * 2}" fill="url(#space)"/>
        ${[[0.2, 0.3], [0.7, 0.2], [0.5, 0.8], [0.85, 0.6], [0.3, 0.7], [0.6, 0.45]].map(([a, b]) => `<circle cx="${x - r + a * 2 * r}" cy="${y - r + b * 2 * r}" r="2" fill="#fff"/>`).join("")}
        ${inner}</g>
      <circle cx="${x}" cy="${y}" r="${r}" fill="url(#glass)"/>
      ${Array.from({ length: 8 }, (_, i) => `<circle cx="${x + (r + 11) * Math.cos(i * Math.PI / 4)}" cy="${y + (r + 11) * Math.sin(i * Math.PI / 4)}" r="4" fill="#2b3140"/>`).join("")}`;
  }
  const earth = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#earthGrad)"/>
    <path d="M${x - r * 0.5} ${y - r * 0.3} q${r * 0.3} ${-r * 0.3} ${r * 0.5} 0 q${-r * 0.1} ${r * 0.4} ${-r * 0.5} 0z M${x + r * 0.1} ${y + r * 0.2} q${r * 0.4} ${-r * 0.1} ${r * 0.5} ${r * 0.3} q${-r * 0.3} ${r * 0.3} ${-r * 0.5} ${-r * 0.3}z" fill="#4caf50"/>`;

  function robot(x, y, on) {
    return `<g transform="translate(${x} ${y})">
      ${Art.shadow(0, 0, 70)}
      <rect x="-40" y="-40" width="26" height="40" rx="8" fill="#8a97ad"/><rect x="14" y="-40" width="26" height="40" rx="8" fill="#8a97ad"/>
      <rect x="-60" y="-170" width="120" height="135" rx="22" fill="#c9d3e2" stroke="#7a879d" stroke-width="5"/>
      <rect x="-30" y="-140" width="60" height="30" rx="6" fill="#7a879d"/><circle cx="-12" cy="-125" r="6" fill="${on ? "#7dff8a" : "#444"}"/><circle cx="12" cy="-125" r="6" fill="${on ? "#ffd23a" : "#444"}"/>
      <rect x="-25" y="-95" width="50" height="40" rx="6" fill="#2b3140" stroke="#7a879d" stroke-width="3"/>
      ${on ? "" : `<text x="0" y="-68" text-anchor="middle" font-size="20">🔋?</text>`}
      <g transform="rotate(${on ? 0 : 18} 0 -180)">
        <rect x="-50" y="-260" width="100" height="85" rx="20" fill="#c9d3e2" stroke="#7a879d" stroke-width="5"/>
        <rect x="-38" y="-248" width="76" height="56" rx="12" fill="${on ? "#0a2a3a" : "#1a1a22"}"/>
        ${on ? `<circle cx="-15" cy="-225" r="8" fill="#36d6e7"/><circle cx="15" cy="-225" r="8" fill="#36d6e7"/><path d="M-15 -205 q15 12 30 0" stroke="#36d6e7" stroke-width="4" fill="none"/>`
             : `<path d="M-22 -225 h14 M8 -225 h14" stroke="#555" stroke-width="4"/>`}
        <line x1="0" y1="-260" x2="0" y2="-290" stroke="#7a879d" stroke-width="5"/><circle cx="0" cy="-295" r="9" fill="${on ? "#ff4a4a" : "#555"}" class="${on ? "pulse" : ""}"/>
        <rect x="-62" y="-235" width="12" height="30" rx="5" fill="#7a879d"/><rect x="50" y="-235" width="12" height="30" rx="5" fill="#7a879d"/>
      </g>
      <path d="M-60 -140 q-30 30 -20 70 M60 -140 q30 30 20 70" stroke="#8a97ad" stroke-width="16" fill="none" stroke-linecap="round"/>
    </g>`;
  }

  function cat(x, y, s = 1) {
    return `<g transform="translate(${x} ${y}) scale(${s})">
      ${Art.shadow(0, 0, 50)}
      <path d="M40 -20 Q90 -30 80 -80" stroke="#f08a2a" stroke-width="12" fill="none" stroke-linecap="round"/>
      <ellipse cx="0" cy="-30" rx="45" ry="32" fill="#f39a3a"/>
      <circle cx="-30" cy="-70" r="30" fill="#f39a3a"/>
      <path d="M-55 -85 l5 -30 l18 20z M-20 -95 l15 -25 l8 28z" fill="#f39a3a"/>
      <circle cx="-40" cy="-72" r="5" fill="#222"/><circle cx="-20" cy="-72" r="5" fill="#222"/>
      <path d="M-34 -60 q4 5 8 0" stroke="#222" stroke-width="2" fill="none"/>
      <path d="M-50 -60 h-20 M-50 -56 l-18 6 M-10 -60 h20 M-10 -56 l18 6" stroke="#fff" stroke-width="2"/>
      <circle cx="-30" cy="-70" r="40" fill="#bfe3ff" opacity=".2" stroke="#e5f3ff" stroke-width="3"/>
    </g>`;
  }

  // ================= ROOM 1: Cabin =================
  const floaters = [["🍎", 520, 330], ["🧸", 700, 260], ["✏️", 1250, 380], ["🧦", 400, 450]];
  G.room({
    id: "cabin",
    title: "Kabinen",
    intro: "🚨 ALARM! Du vågner i din kabine. Alt svæver rundt – tyngdekraften er slukket!",
    particles: { type: "sparks", count: 20, color: "#9fefff" },
    background: (api) => `${stationBg(true)}
      ${porthole(800, 230, 120, earth(830, 270, 70))}
      <rect x="40" y="60" width="200" height="40" rx="8" fill="#2b3140"/><text x="140" y="88" text-anchor="middle" font-size="22" font-weight="bold" fill="#ff5a5a" class="pulse">⚠ ALARM</text>
      ${api.flag && api.flag("gravity") ? "" : floaters.map(([e, x, y], i) => `<text x="${x}" y="${y}" font-size="54" class="bob" style="animation-duration:${2.5 + i * 0.6}s">${e}</text>`).join("")}
      ${api.flag && api.flag("gravity") ? floaters.map(([e], i) => `<text x="${380 + i * 70}" y="790" font-size="44">${e}</text>`).join("") : ""}`,
    objects: [
      {
        id: "bunk", label: "Køje",
        draw: () => `
          ${Art.shadow(1280, 780, 230)}
          <rect x="1060" y="520" width="450" height="30" rx="10" fill="#5d6a82"/><rect x="1060" y="490" width="450" height="40" rx="14" fill="#e8eef7"/>
          <rect x="1060" y="488" width="300" height="50" rx="14" fill="#3a7fd0"/><rect x="1440" y="470" width="60" height="30" rx="12" fill="#fff"/>
          <rect x="1075" y="550" width="16" height="220" fill="#2b3140"/><rect x="1480" y="550" width="16" height="220" fill="#2b3140"/>
          <rect x="1150" y="600" width="120" height="70" rx="6" fill="#ffe680" transform="rotate(-3 1210 635)"/>
          <text x="1210" y="645" text-anchor="middle" font-size="30" transform="rotate(-3 1210 635)">⬆⬇⬆</text>`,
        click: (api) => api.modal(`<div class="modal-icon">🛏️</div><p>Din køje. Der er klistret et gult mærkat på siden:</p><div class="clue-box" style="font-size:2.4rem">⬆ ⬇ ⬆</div><p><i>Det har du selv skrevet, så du ikke glemmer det...</i></p>`),
      },
      {
        id: "gravity", label: "Tyngdekraft-panel",
        draw: (api) => `
          <rect x="330" y="150" width="190" height="170" rx="12" fill="#1c212c" stroke="#5d6a82" stroke-width="5"/>
          <text x="425" y="180" text-anchor="middle" font-size="16" fill="#9fefff">TYNGDEKRAFT</text>
          <text x="425" y="210" text-anchor="middle" font-size="22" font-weight="bold" fill="${api.flag("gravity") ? "#7dff8a" : "#ff5a5a"}">${api.flag("gravity") ? "TÆNDT" : "SLUKKET"}</text>
          ${[0, 1, 2].map((i) => `<rect x="${360 + i * 45}" y="235" width="30" height="62" rx="8" fill="#465269"/><circle cx="${375 + i * 45}" cy="${api.flag("gravity") ? [250, 282, 250][i] : 266}" r="12" fill="#c9d3e2"/>`).join("")}`,
        click(api) {
          if (api.flag("gravity")) return api.say("Tyngdekraften er tændt. Alt ligger på gulvet nu.");
          api.cycleLock({
            icon: "🌍⬇", text: "Tyngdekraft-panelet har tre kontakter.<br>Sæt dem rigtigt for at tænde tyngdekraften.",
            symbols: ["⬆", "⬇"], answer: ["⬆", "⬇", "⬆"], start: [1, 0, 1], button: "Tænd",
            onSolve() {
              api.set("gravity");
              api.sound("whoosh");
              api.modal(`<div class="modal-icon">⬇️💥</div><p><b>WHUMP!</b> Tyngdekraften tænder!<br>Alt der svævede, falder ned på gulvet – også <b>værktøjskassen</b> fra loftet!</p>`);
            },
          });
        },
      },
      {
        id: "toolbox", label: "Værktøjskasse",
        draw: (api) => {
          const down = api.flag("gravity");
          const [x, y] = down ? [600, 700] : [870, 410];
          return `<g class="${down ? "" : "bob"}" transform="rotate(${down ? 0 : 15} ${x + 60} ${y + 30})">
            <rect x="${x}" y="${y}" width="120" height="65" rx="8" fill="#e53935" stroke="#8e2b22" stroke-width="4"/>
            <path d="M${x + 35} ${y} v-18 h50 v18" stroke="#555" stroke-width="7" fill="none"/><rect x="${x}" y="${y + 22}" width="120" height="8" fill="#8e2b22"/></g>`;
        },
        click(api) {
          if (!api.flag("gravity")) return api.modal(`<div class="modal-icon">🧰☁️</div><p>En værktøjskasse svæver helt oppe under loftet.<br>Du kan ikke nå den, når alt svæver...</p>`);
          if (api.has("screwdriver") || api.flag("panelOpen")) return api.say("Værktøjskassen er tom.");
          api.give("screwdriver");
          api.say("Du fandt en skruetrækker 🪛");
        },
      },
      {
        id: "poster", label: "Plakat: Solsystemet",
        draw: () => `
          <rect x="1010" y="120" width="260" height="170" rx="6" fill="#0d1235" stroke="#9fefff" stroke-width="4"/>
          <text x="1140" y="148" text-anchor="middle" font-size="18" fill="#ffd23a" font-weight="bold">SOLSYSTEMET</text>
          <circle cx="1010" cy="220" r="40" fill="#ffd23a"/>
          ${[[1065, 6, "#aaa"], [1090, 9, "#e8b86a"], [1115, 9, "#3a8fd6"], [1138, 7, "#d65a3a"], [1170, 18, "#d9a066"], [1210, 15, "#e8cf8a"], [1240, 11, "#8fd8e8"], [1262, 10, "#3a5ad6"]]
            .map(([x, r, c]) => `<circle cx="${x}" cy="220" r="${r}" fill="${c}"/>`).join("")}
          <ellipse cx="1210" cy="220" rx="24" ry="5" fill="none" stroke="#c9a66b" stroke-width="3"/>`,
        click: (api) => api.modal(`<div class="modal-icon">🪐</div><p>En plakat af <b>solsystemet</b>.</p><p class="big-emoji">☀️ ⚫🟤🔵🔴🟠🪐🔵🔵</p><p>Solen og alle planeterne.</p>`),
      },
      {
        id: "photo", label: "Holdbillede",
        draw: () => `
          <rect x="560" y="420" width="150" height="110" fill="#fff" stroke="#c9d3e2" stroke-width="6" transform="rotate(4 635 475)"/>
          <g transform="rotate(4 635 475)"><rect x="572" y="432" width="126" height="70" fill="#1a1440"/>
          <text x="635" y="485" text-anchor="middle" font-size="30">👩‍🚀🧑‍🚀👨‍🚀</text>
          <text x="635" y="520" text-anchor="middle" font-size="13" fill="#333">HOLD NOVA</text></g>`,
        click: (api) => api.modal(`<div class="modal-icon">📷</div><p>Et billede af hele holdet på stationen:</p><p class="big-emoji">👩‍🚀 🧑‍🚀 👨‍🚀</p><p>Hvor er de alle sammen nu?</p>`),
      },
      {
        id: "locker", label: "Skab",
        draw: (api) => `
          ${Art.shadow(160, 780, 100)}
          <rect x="60" y="340" width="200" height="440" rx="10" fill="#c9d3e2" stroke="#7a879d" stroke-width="5"/>
          <line x1="160" y1="345" x2="160" y2="775" stroke="#7a879d" stroke-width="4"/>
          <rect x="120" y="420" width="80" height="44" rx="6" fill="#1c212c"/>
          <text x="160" y="450" text-anchor="middle" font-size="16" fill="${api.flag("lockerOpen") ? "#7dff8a" : "#9fefff"}">${api.flag("lockerOpen") ? "ÅBEN" : "🪐? 👩‍🚀?"}</text>`,
        click(api) {
          if (api.flag("lockerOpen")) return api.say("Skabet er tomt.");
          api.codeLock({
            icon: "🗄️", text: "Dit skab har en kodelås med 2 tal.<br>Over tastaturet står:", clue: `<div class="clue-row"><span>🪐<small>planeter</small></span><span>👩‍🚀<small>astronauter</small></span></div>`,
            length: 2, answer: "83",
            onSolve() {
              api.set("lockerOpen");
              api.give("manual");
              api.modal(`<div class="modal-icon">🗄️➜📘</div><p>Skabet går op! Du finder en <b>manual</b> til stationens døre.</p>`);
            },
          });
        },
      },
      {
        id: "door", label: "Kabinedør",
        draw: (api) => `
          <rect x="1290" y="150" width="0" height="0"/>
          <rect x="1300" y="160" width="0" height="0"/>
          <path d="M1530 680 V200 Q1530 160 1490 160 H1350 Q1310 160 1310 200 V680 Z" fill="#5d6a82" stroke="#2b3140" stroke-width="10"/>
          <rect x="1330" y="200" width="180" height="470" rx="20" fill="#465269"/><line x1="1420" y1="200" x2="1420" y2="670" stroke="#2b3140" stroke-width="6"/>
          <rect x="1550" y="380" width="44" height="90" rx="6" fill="${api.flag("panelOpen") ? "#1c212c" : "#7a879d"}" stroke="#2b3140" stroke-width="3"/>
          ${api.flag("panelOpen") ? ["#e53935", "#1e88e5", "#43a047", "#fdd835"].map((c, i) => `<path d="M1558 ${392 + i * 18} q14 6 28 0" stroke="${c}" stroke-width="5" fill="none"/>`).join("") : `<circle cx="1560" cy="390" r="3" fill="#333"/><circle cx="1584" cy="460" r="3" fill="#333"/>`}`,
        click(api) {
          if (!api.flag("panelOpen")) return api.modal(`<div class="modal-icon">🚪⚡</div><p>Døren har ingen strøm. Ved siden af den er et <b>panel</b>, der er skruet fast.</p>`);
          const syms = ["⭐", "🌙", "☀️", "🪐"];
          api.pickLock({
            icon: "🔌", text: "Bag panelet er fire løse ledninger. Hvor skal de sættes i?",
            clue: api.has("manual")
              ? `<div class="clue-box" style="text-align:left">📘 <b>Manualen siger:</b><br>Den røde ledning går til <b>planeten</b>.<br>Den blå går til <b>månen</b>.<br>Den grønne går til <b>stjernen</b>.<br>Den gule går til <b>solen</b>.</div>`
              : `<p class="tip">Du ved ikke, hvordan de skal sidde... Måske står det i en manual?</p>`,
            rows: [["🔴", "🪐"], ["🔵", "🌙"], ["🟢", "⭐"], ["🟡", "☀️"]].map(([c, a]) => ({ seq: `${c} ➜`, options: syms, answer: a })),
            button: "Tænd strømmen",
            onSolve() {
              api.take("manual");
              api.sound("beep");
              api.goTo("control");
            },
          });
        },
        use(item, api) {
          if (item === "manual") { if (api.flag("panelOpen")) this.click(api); else api.say("📘 Manualen handler om ledningerne bag panelet. Panelet er skruet fast."); return true; }
          if (item !== "screwdriver" || api.flag("panelOpen")) return false;
          api.take("screwdriver");
          api.set("panelOpen");
          api.modal(`<div class="modal-icon">🪛➜🔌</div><p>Du skruer panelet af. Der er fire løse ledninger: 🔴 🔵 🟢 🟡</p><p>Hvordan skal de kobles?</p>`);
          return true;
        },
      },
    ],
    goal(api) {
      if (!api.flag("gravity")) return "gravity";
      if (!api.has("screwdriver") && !api.flag("panelOpen")) return "toolbox";
      if (!api.flag("lockerOpen")) return "locker";
      if (!api.flag("panelOpen")) return "panel";
      return "wires";
    },
    hints: {
      gravity: ["Tyngdekraft-panelet har tre kontakter. Har du skrevet koden ned et sted?", "Se på mærkatet på køjen.", "Kontakterne skal stå ⬆ ⬇ ⬆."],
      toolbox: ["Nu er værktøjskassen faldet ned. Kig i den."],
      locker: ["Skabet vil have antal planeter og antal astronauter.", "Tæl planeterne på plakaten (ikke solen!) og astronauterne på billedet.", "8 planeter og 3 astronauter: 83."],
      panel: ["Panelet ved døren er skruet fast.", "Brug skruetrækkeren 🪛 på døren."],
      wires: ["Klik på døren. Manualen 📘 fortæller, hvor ledningerne skal sidde.", "Rød ➜ planet 🪐, blå ➜ måne 🌙, grøn ➜ stjerne ⭐, gul ➜ sol ☀️."],
    },
  });

  // ================= ROOM 2: Control room =================
  const LAMPS = [[1, 0, 1], [0, 1, 1], [1, 1, 0]]; // 5, 3, 6
  G.room({
    id: "control",
    title: "Kontrolrummet",
    intro: "Kontrolrummet! Robotten Bip er slukket, og der kommer mærkelige lyde fra et sted... 👽",
    particles: { type: "sparks", count: 24, color: "#9fefff" },
    enter(api) {
      api.every(9000, () => { if (!api.flag("catFed") && !api.modalOpen()) { api.sound("ghost"); api.say("👂 ...miiiav? Hvad var DET for en lyd?"); } });
    },
    background: () => `${stationBg(false)}
      <rect x="380" y="80" width="840" height="300" rx="20" fill="#0a1020" stroke="#5d6a82" stroke-width="10"/>
      <g clip-path="url(#screenClip)"><defs><clipPath id="screenClip"><rect x="390" y="90" width="820" height="280" rx="14"/></clipPath></defs>
        <rect x="390" y="90" width="820" height="280" fill="url(#space)"/>${earth(1000, 330, 160)}
        <text x="420" y="130" font-size="22" fill="#ff5a5a" font-family="Consolas" class="pulse">STRØM: 12% · ILT: OK · METEOR-SKADE</text></g>`,
    objects: [
      {
        id: "starmap", label: "Stjernekort",
        draw: (api) => `
          <rect x="60" y="120" width="260" height="220" rx="14" fill="#0a1020" stroke="#5d6a82" stroke-width="6"/>
          ${[[100, 170], [140, 230], [180, 180], [220, 240], [260, 175], [120, 290], [240, 300]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#fff"/>`).join("")}
          <text x="190" y="325" text-anchor="middle" font-size="16" fill="#9fefff">${api.flag("starSolved") ? "✅ FUNDET" : "FIND KASSIOPEIA"}</text>`,
        click(api) {
          if (api.flag("starSolved")) return api.say("Stjernekortet viser Kassiopeia ✅");
          const shape = (pts) => `<svg viewBox="0 0 120 80" width="110" height="74">${pts.map(([x, y], i) => `${i ? `<line x1="${pts[i - 1][0]}" y1="${pts[i - 1][1]}" x2="${x}" y2="${y}" stroke="#9fefff" stroke-width="2"/>` : ""}`).join("")}${pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#fff"/>`).join("")}</svg>`;
          const W = [[10, 20], [35, 60], [60, 30], [85, 60], [110, 20]];
          const DIPPER = [[10, 20], [35, 25], [55, 30], [75, 40], [80, 65], [110, 65], [110, 40]];
          const TRI = [[20, 65], [60, 15], [100, 65], [20, 65]];
          api.modal(`<div class="modal-icon">🌌</div><p>Stjernekortet spørger:<br><b>"Hvilket stjernebillede er Kassiopeia?"</b></p>
            <div class="clue-box">Kassiopeia ligner bogstavet <b>W</b>.</div>
            <div class="row">${[["dip", DIPPER], ["w", W], ["tri", TRI]].map(([v, p]) => `<button class="choice star-btn" data-v="${v}" style="background:#0a1020">${shape(p)}</button>`).join("")}</div>`,
            (root) => root.querySelectorAll(".star-btn").forEach((b) => b.addEventListener("click", () => {
              if (b.dataset.v !== "w") return api.shake();
              api.sound("success");
              api.set("starSolved");
              api.give("battery");
              api.modal(`<div class="modal-icon">🌌✅🔋</div><p>Rigtigt! Under stjernekortet åbner en lille lem.<br>Indeni er en <b>power-celle</b>!</p>`);
            })));
        },
      },
      {
        id: "dispenser", label: "Mad-automat",
        draw: () => `
          <rect x="1300" y="400" width="150" height="270" rx="12" fill="#c9d3e2" stroke="#7a879d" stroke-width="5"/>
          <rect x="1320" y="430" width="110" height="80" rx="8" fill="#0a2a3a"/><text x="1375" y="480" text-anchor="middle" font-size="34">🍣</text>
          <rect x="1335" y="560" width="80" height="40" rx="6" fill="#1c212c"/><circle cx="1375" cy="535" r="12" fill="#43a047"/>`,
        click(api) {
          if (api.has("snack") || api.flag("catFed")) return api.say("Mad-automaten siger: <i>Kun én snack pr. astronaut!</i>");
          api.give("snack");
          api.say("Du trykker på knappen... Ud kommer en <b>rum-snack</b> 🍣 med fisk.");
        },
      },
      {
        id: "console", label: "Kontrolpult",
        draw: (api) => `
          ${Art.shadow(800, 690, 330)}
          <path d="M470 560 L1130 560 L1170 680 L430 680 Z" fill="#5d6a82" stroke="#2b3140" stroke-width="5"/>
          <rect x="500" y="575" width="600" height="40" rx="8" fill="#1c212c"/>
          ${Array.from({ length: 12 }, (_, i) => `<circle cx="${530 + i * 50}" cy="595" r="9" fill="${["#ff5a5a", "#7dff8a", "#ffd23a", "#36d6e7"][i % 4]}" class="pulse" style="animation-delay:-${i * 0.2}s"/>`).join("")}
          ${api.flag("catFed") ? cat(640, 560, 0.9) : `<path d="M760 680 q30 -20 60 0 q20 20 50 -10" stroke="#f08a2a" stroke-width="12" fill="none" stroke-linecap="round" class="bob"/>`}`,
        click(api) {
          if (api.flag("catFed")) return api.say("🐱 Stationskatten Pixel spinder på kontrolpulten. Purrr...");
          api.modal(`<div class="modal-icon">🎛️👀</div><p>Under kontrolpulten stikker en <b>orange hale</b> ud!<br>Det er stationskatten <b>Pixel</b> 🐱 – med en lille <b>chip</b> mellem poterne.</p><p>Hun hvæser, når du rækker ud efter den. Hun er vist sulten...</p>`);
        },
        use(item, api) {
          if (item !== "snack" || api.flag("catFed")) return false;
          api.take("snack");
          api.set("catFed");
          api.give("chip");
          api.modal(`<div class="modal-icon">🍣➜🐱➜💾</div><p>Pixel snupper snacken og hopper op på pulten.<br>Hun har glemt alt om chippen – du tager den!</p>`);
          return true;
        },
      },
      {
        id: "robot", label: "Robotten Bip",
        draw: (api) => robot(260, 690, api.flag("robotOn")),
        click(api) {
          if (api.flag("robotOn")) return api.modal(`<div class="modal-icon">🤖💬</div><p><b>Bip:</b> "BIP BOP! Luftsluse-døren har en lampe-kode!<br>Hver række lamper er ét tal. Lamperne er værd:"</p>
            <div class="clue-box" style="font-size:2rem">4 &nbsp; 2 &nbsp; 1</div><p>"Læg de <b>tændte</b> lamper sammen i hver række. BIP!"</p>`);
          const need = [!api.flag("robotBattery") && "🔋 strøm", !api.flag("robotChip") && "💾 chip"].filter(Boolean).join(" og ");
          api.modal(`<div class="modal-icon">🤖💤</div><p>Robotten <b>Bip</b> er slukket.<br>Der mangler: <b>${need}</b>.</p>`);
        },
        use(item, api) {
          if (api.flag("robotOn")) return false;
          if (item === "battery") { api.take("battery"); api.set("robotBattery"); }
          else if (item === "chip") { api.take("chip"); api.set("robotChip"); }
          else return false;
          if (api.flag("robotBattery") && api.flag("robotChip")) {
            api.set("robotOn");
            api.sound("beep");
            api.modal(`<div class="modal-icon">🤖✨</div><p><b>BIP BOP!</b> Robotten tænder!<br>"Hej astronaut! Luftsluse-døren har en lampe-kode. Hver række er ét tal. Lamperne er værd <b>4, 2 og 1</b>. Læg de tændte sammen!"</p>`);
          } else api.say(`🤖 Bip blinker lidt... Der mangler stadig ${api.flag("robotBattery") ? "en 💾 chip" : "🔋 strøm"}.`);
          return true;
        },
      },
      {
        id: "lampDoor", label: "Dør til luftslusen",
        draw: () => `
          <path d="M1490 680 V230 Q1490 190 1530 190 H1600 V680 Z" fill="#465269" stroke="#2b3140" stroke-width="8"/>
          <rect x="1480" y="140" width="120" height="36" rx="6" fill="#1e5bb8"/><text x="1540" y="165" text-anchor="middle" font-size="16" fill="#fff" font-weight="bold">LUFTSLUSE</text>
          <rect x="1210" y="420" width="70" height="0"/>
          <rect x="1505" y="300" width="80" height="110" rx="8" fill="#1c212c"/>
          ${LAMPS.map((row, r) => row.map((on, c) => `<circle cx="${1522 + c * 23}" cy="${325 + r * 32}" r="9" fill="${on ? "#ffd23a" : "#333"}"/>`).join("")).join("")}`,
        click(api) {
          api.codeLock({
            icon: "💡🚪", text: "Døren til luftslusen har en lampe-kode:",
            clue: `<div class="dark-box" style="font-size:2rem;letter-spacing:8px">${LAMPS.map((r) => r.map((o) => (o ? "🟡" : "⚫")).join("")).join("<br>")}</div>`,
            length: 3, answer: "536",
            onSolve() { api.goTo("airlock"); },
          });
        },
      },
    ],
    goal(api) {
      if (!api.flag("starSolved") && !api.flag("robotBattery")) return "star";
      if (!api.flag("catFed") && !api.has("snack")) return "food";
      if (!api.flag("catFed")) return "cat";
      if (!api.flag("robotOn")) return "robot";
      return "lamps";
    },
    hints: {
      star: ["Stjernekortet vil have, at du finder Kassiopeia.", "Kassiopeia ligner et W."],
      food: ["Lydene kommer fra kontrolpulten. Måske er nogen sultne?", "Tag en snack fra mad-automaten."],
      cat: ["Katten Pixel har en chip. Hun er sulten.", "Brug rum-snacken 🍣 på kontrolpulten."],
      robot: ["Robotten Bip mangler strøm og en chip.", "Brug både 🔋 og 💾 på robotten."],
      lamps: ["Lamperne er værd 4, 2 og 1. Læg de tændte sammen i hver række.", "Første række: 🟡⚫🟡 = 4 + 1 = 5.", "Rækkerne giver 5, 3 og 6. Koden er 536."],
    },
  });

  // ================= ROOM 3: Airlock + pod =================
  const RADAR = { col: "C", row: "4" };
  G.room({
    id: "airlock",
    title: "Luftslusen",
    intro: "Luftslusen! Redningskapslen venter derude. Men du skal have rumdragt på for at komme gennem slusen.",
    particles: { type: "sparks", count: 18, color: "#9fefff" },
    background: () => `${stationBg(true)}
      ${porthole(1300, 250, 110, `<g class="bob"><rect x="1240" y="220" width="120" height="70" rx="35" fill="#e8eef7"/><circle cx="1300" cy="255" r="20" fill="#36d6e7"/><path d="M1360 255 l30 -15 v30z" fill="#ff7a2f"/></g>`)}`,
    objects: [
      {
        id: "crate", label: "Forsyningskasse",
        draw: (api) => `
          ${Art.shadow(180, 690, 110)}
          <rect x="80" y="560" width="200" height="130" rx="10" fill="#e8a33a" stroke="#8a5a14" stroke-width="5"/>
          <path d="M80 600 H280" stroke="#8a5a14" stroke-width="5"/><rect x="150" y="575" width="60" height="16" rx="4" fill="#1c212c"/>
          <text x="180" y="650" text-anchor="middle" font-size="22" font-weight="bold" fill="#5a3a0a">${api.flag("crateOpen") ? "ÅBEN" : "ILT"}</text>`,
        click(api) {
          if (api.flag("crateOpen")) return api.say("Forsyningskassen er tom.");
          const planet = (name, size, c) => `<span style="display:inline-flex;flex-direction:column;align-items:center;font-size:.9rem"><span style="width:${size}px;height:${size}px;border-radius:50%;background:${c};display:inline-block"></span>${name}</span>`;
          api.pickLock({
            icon: "📦🔒", text: "Kassens lås spørger: <b>Hvilken planet er den STØRSTE?</b>",
            rows: [{ options: ["Mars", "Jupiter", "Jorden"], answer: "Jupiter" }],
            clue: `<div class="row" style="align-items:flex-end;gap:24px">${planet("Mars", 26, "#d65a3a")}${planet("Jupiter", 90, "#d9a066")}${planet("Jorden", 40, "#3a8fd6")}</div>`,
            button: "Åbn",
            onSolve() {
              api.set("crateOpen");
              api.give("oxygen");
              api.modal(`<div class="modal-icon">📦➜🫧</div><p>Kassen går op. Indeni ligger en <b>iltflaske</b>.</p>`);
            },
          });
        },
      },
      {
        id: "suits", label: "Rumdragter",
        draw: (api) => `
          <rect x="330" y="200" width="380" height="470" rx="12" fill="#2b3140" stroke="#5d6a82" stroke-width="6"/>
          ${[["S", 400, 0.75], ["M", 520, 0.9], ["L", 640, 1.05]].map(([n, x, s]) => (api.flag("suitTaken") && n === "M") ? "" : `
            <g transform="translate(${x} 600) scale(${s})">
              <rect x="-35" y="-230" width="70" height="150" rx="25" fill="#e8eef7"/><circle cx="0" cy="-260" r="36" fill="#e8eef7"/><circle cx="0" cy="-260" r="24" fill="#36d6e7" opacity=".7"/>
              <rect x="-35" y="-85" width="28" height="85" rx="12" fill="#e8eef7"/><rect x="7" y="-85" width="28" height="85" rx="12" fill="#e8eef7"/>
              <rect x="-20" y="-200" width="40" height="30" rx="6" fill="#ff7a2f"/>
            </g>
            <text x="${x}" y="660" text-anchor="middle" font-size="22" fill="#fff" font-weight="bold">${n}</text>`).join("")}`,
        click(api) {
          if (api.flag("suitTaken")) return api.say("Der hænger to dragter tilbage. De passer ikke til dig.");
          api.pickLock({
            icon: "🧑‍🚀", text: "Tre rumdragter: <b>S</b>, <b>M</b> og <b>L</b>. Der hænger et skilt:",
            clue: `<div class="clue-box" style="text-align:left">S passer til dem under <b>120 cm</b>.<br>M passer til <b>120–150 cm</b>.<br>L passer til dem over <b>150 cm</b>.<br><br>Dit astronaut-kort siger: <b>Højde 134 cm</b>.</div>`,
            rows: [{ options: ["S", "M", "L"], answer: "M" }], button: "Tag dragten",
            onSolve() {
              api.set("suitTaken");
              api.give("suit");
              api.modal(`<div class="modal-icon">🧑‍🚀✅</div><p>Dragt <b>M</b> passer perfekt!<br>Men uden <b>ilt</b> kan du ikke bruge den i rummet.</p>`);
            },
          });
        },
      },
      {
        id: "sign", label: "Sikkerhedsskilt",
        draw: () => `
          <rect x="760" y="140" width="300" height="200" rx="10" fill="#ffd23a" stroke="#8a6a00" stroke-width="5"/>
          <text x="910" y="180" text-anchor="middle" font-size="24" font-weight="bold" fill="#222">⚠ SIKKERHED</text>
          <text x="790" y="225" font-size="18" fill="#222">1. Luk altid døren bag dig</text>
          <text x="790" y="260" font-size="18" fill="#222">2. Fjern luften fra slusen</text>
          <text x="790" y="295" font-size="18" fill="#222">3. Først da: åbn yderdøren</text>`,
        click: (api) => api.modal(`<div class="modal-icon">⚠️</div><p class="note-text">SIKKERHED</p><div class="clue-box" style="text-align:left">1. Luk altid døren bag dig<br>2. Fjern luften fra slusen<br>3. Først da: åbn yderdøren</div>`),
      },
      {
        id: "airlock", label: "Luftsluse",
        draw: (api) => `
          <rect x="1090" y="380" width="200" height="300" rx="16" fill="${api.flag("airlockDone") ? "#0a1020" : "#5d6a82"}" stroke="#2b3140" stroke-width="10"/>
          ${api.flag("airlockDone") ? `<circle cx="1190" cy="530" r="60" fill="#36d6e7" opacity=".2"/>` : `<circle cx="1190" cy="530" r="55" fill="#465269" stroke="#2b3140" stroke-width="8"/><path d="M1190 480 V580 M1140 530 H1240" stroke="#2b3140" stroke-width="8"/>`}
          <rect x="1110" y="350" width="160" height="26" rx="5" fill="#ff5a5a"/><text x="1190" y="369" text-anchor="middle" font-size="16" fill="#fff" font-weight="bold">LUFTSLUSE</text>`,
        click(api) {
          if (api.flag("airlockDone")) return api.say("Slusen er åben. Redningskapslen er lige derude!");
          api.modal(`<div class="modal-icon">🚪🌌</div><p>Gennem slusen kommer du ud til redningskapslen.<br>Men derude er der <b>ingen luft</b>!</p><p>Du skal have en <b>rumdragt med ilt</b> på.</p>`);
        },
        use(item, api) {
          if (api.flag("airlockDone")) return false;
          if (item === "suit") { api.say("🧑‍🚀 Dragten mangler ilt! Uden ilt kan du ikke trække vejret derude."); return true; }
          if (item !== "suitReady") return false;
          api.sequenceLock({
            icon: "🧑‍🚀🚪", text: "Du har dragten på. Nu skal slusen bruges i den <b>rigtige rækkefølge</b>:",
            buttons: [
              { v: "open", html: "🔓 Åbn yderdør" }, { v: "light", html: "💡 Tænd lys" },
              { v: "close", html: "🚪 Luk indre dør" }, { v: "pump", html: "💨 Fjern luften" },
            ],
            answer: ["close", "pump", "open"],
            onSolve() {
              api.take("suitReady");
              api.set("airlockDone");
              api.sound("whoosh");
              api.modal(`<div class="modal-icon">💨🚪🌌</div><p><b>PSSSHHH!</b> Luften suser ud, og yderdøren glider op.<br>Redningskapslen er lige foran dig!</p>`);
            },
          });
          return true;
        },
      },
      {
        id: "radar", label: "Radar",
        draw: () => `
          <rect x="760" y="390" width="270" height="270" rx="14" fill="#0a1020" stroke="#5d6a82" stroke-width="6"/>
          ${[0, 1, 2, 3, 4, 5].map((i) => `<line x1="${790 + i * 42}" y1="420" x2="${790 + i * 42}" y2="630" stroke="#1f6a4a" stroke-width="2"/><line x1="790" y1="${420 + i * 42}" x2="1000" y2="${420 + i * 42}" stroke="#1f6a4a" stroke-width="2"/>`).join("")}
          ${"ABCDE".split("").map((l, i) => `<text x="${811 + i * 42}" y="414" text-anchor="middle" font-size="14" fill="#7dff8a">${l}</text>`).join("")}
          ${[1, 2, 3, 4, 5].map((n, i) => `<text x="778" y="${447 + i * 42}" text-anchor="middle" font-size="14" fill="#7dff8a">${n}</text>`).join("")}
          ${earth(895, 567, 15)}<circle cx="895" cy="567" r="20" fill="none" stroke="#7dff8a" stroke-width="2" class="pulse"/>
          <circle cx="853" cy="462" r="6" fill="#aaa"/>`,
        click: (api) => api.modal(`<div class="modal-icon">📡</div><p>Radaren viser, hvor <b>Jorden</b> 🌍 er.<br>Bogstaverne står foroven, tallene i siden.</p>
          <div class="dark-box" style="font-family:Consolas;line-height:1.3">&nbsp;&nbsp;A B C D E<br>1 · · · · ·<br>2 · 🌑 · · ·<br>3 · · · · ·<br>4 · · 🌍 · ·<br>5 · · · · ·</div>`),
      },
      {
        id: "pod", label: "Redningskapsel",
        draw: (api) => `
          <g transform="translate(1440 560)" ${api.flag("airlockDone") ? "" : 'opacity=".55"'}>
            ${Art.shadow(0, 120, 120)}
            <path d="M-110 100 Q-120 -60 0 -140 Q120 -60 110 100 Z" fill="#e8eef7" stroke="#7a879d" stroke-width="6"/>
            <circle cx="0" cy="-40" r="40" fill="#36d6e7" stroke="#7a879d" stroke-width="6"/><circle cx="-12" cy="-52" r="10" fill="#fff" opacity=".7"/>
            <rect x="-110" y="40" width="220" height="20" fill="#ff7a2f"/>
            <path d="M-80 100 l-20 40 h60 z M80 100 l20 40 h-60 z" fill="#7a879d"/>
          </g>`,
        click(api) {
          if (!api.flag("airlockDone")) return api.say("Redningskapslen er på den anden side af luftslusen.");
          api.pickLock({
            icon: "🚀🧭", text: "Kapslens computer: <b>\"Indtast Jordens koordinater på radaren.\"</b>",
            rows: [{ seq: "Bogstav", options: ["A", "B", "C", "D", "E"], answer: RADAR.col }, { seq: "Tal", options: ["1", "2", "3", "4", "5"], answer: RADAR.row }],
            button: "🚀 AFFYR!",
            onSolve() {
              api.sound("whoosh");
              api.win(`3... 2... 1... <b>WHOOOSH!</b> 🚀 Redningskapslen suser mod Jorden!<br><br>
                Pludselig hører du igen den mærkelige lyd: <i>"Miiiav!"</i> 👽?<br>
                Det er <b>Pixel</b> 🐱, stationskatten! Hun har gemt sig i kapslen hele tiden.<br><br>
                I lander med et plask i havet 🌊, og hele holdet venter på jer. Velkommen hjem, astronaut! 🧑‍🚀🌍`);
            },
          });
        },
      },
    ],
    goal(api) {
      if (!api.flag("crateOpen")) return "crate";
      if (!api.flag("suitTaken")) return "suit";
      if (!api.flag("airlockDone") && !api.has("suitReady")) return "combine";
      if (!api.flag("airlockDone")) return "airlock";
      return "pod";
    },
    hints: {
      crate: ["Forsyningskassen spørger om den største planet.", "Jupiter er den største planet."],
      suit: ["Rumdragterne har størrelser. Du er 134 cm høj.", "134 cm er mellem 120 og 150 – tag dragt M."],
      combine: ["Dragten skal have ilt.", "Klik på 🧑‍🚀 og derefter på 🫧 i rygsækken."],
      airlock: ["Brug rumdragten med ilt på luftslusen.", "Se sikkerhedsskiltet: luk døren, fjern luften, åbn yderdøren."],
      pod: ["Kapslen vil have Jordens koordinater fra radaren.", "Jorden står i kolonne C og række 4."],
    },
  });
})();
