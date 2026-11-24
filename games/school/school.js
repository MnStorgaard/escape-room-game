// Game 3: Locked in at school (normal)
// Room 1 Klassen:     number note + ABC poster -> word FISK -> teacher drawer -> fish food -> aquarium -> key
//                     fruit equations on blackboard -> 346 -> door (key + code)
// Room 2 Gymnastik:   hide from the janitor when he comes (reaction event)
//                     count balls on poster + scoreboard rule -> 84 -> equipment room -> ball -> hoop -> keys -> exit
// Room 3 Hallen:      piano melody (tones) -> scissors; lost & found logic -> Clara's cap -> code = year on banner 1958
//                     -> janitor office -> master key + alarm panel (cut the yellow wire, like the sun logo) -> main door
(() => {
  const G = Game.define("school", {
    title: "Skolen",
    emoji: "🏫",
    difficulty: 2,
    minutes: 20,
    accent: "#4aa3ff",
    tagline: "Du faldt i søvn under gemmeleg. Nu er det fredag aften, og pedellen låser skolen!",
    story: `<p>Det var gemmeleg, og du fandt det PERFEKTE gemmested... så perfekt, at du faldt i søvn! 😴</p>
            <p>Nu er alle gået hjem, og <b>Pedel Pedersen</b> låser skolen for weekenden. Slip ud, før det er for sent – og pas på, han ikke finder dig!</p>`,
    winTitle: "Du slap ud af skolen!",
    music: { notes: [392, 330, 392, 440, 392, 330, 294, 330], ms: 420, wave: "triangle", bass: 196 },
  });

  G.item("fishFood", "🐟🥫", "fiskefoder");
  G.item("classKey", "🔑", "klassenøgle");
  G.item("ball", "🏀", "basketball");
  G.item("gymKeys", "🗝️", "pedellens nøgleknippe");
  G.item("scissors", "✂️", "saks");
  G.item("masterKey", "🔐", "hovednøgle");

  // ---------- Shared drawing ----------
  const defs = `<defs>
    <pattern id="planks" width="240" height="40" patternUnits="userSpaceOnUse">
      <rect width="240" height="40" fill="#c8955a"/><rect width="120" height="20" fill="#bd8a50"/><rect x="120" y="20" width="120" height="20" fill="#bd8a50"/>
      <path d="M0 20 H240 M0 40 H240 M120 0 V20 M0 20 V40 M240 20 V40" stroke="#9c6d3c" stroke-width="2"/>
    </pattern>
    <pattern id="lino" width="100" height="100" patternUnits="userSpaceOnUse">
      <rect width="100" height="100" fill="#efe3cc"/><rect width="50" height="50" fill="#b9473f"/><rect x="50" y="50" width="50" height="50" fill="#b9473f"/>
    </pattern>
    <linearGradient id="eveningSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b5fb0"/><stop offset=".6" stop-color="#f19a7a"/><stop offset="1" stop-color="#ffd48a"/></linearGradient>
  </defs>`;

  function janitor(x, y, s = 1) {
    return `<g transform="translate(${x} ${y}) scale(${s})">
      ${Art.shadow(0, 0, 50)}
      <rect x="-28" y="-95" width="24" height="92" rx="8" fill="#5a4a3a"/><rect x="4" y="-95" width="24" height="92" rx="8" fill="#5a4a3a"/>
      <ellipse cx="-14" cy="-4" rx="20" ry="9" fill="#222"/><ellipse cx="18" cy="-4" rx="20" ry="9" fill="#222"/>
      <rect x="-44" y="-205" width="88" height="120" rx="24" fill="#c94f3d"/>
      <rect x="-30" y="-180" width="60" height="100" rx="8" fill="#7a5a3a"/><rect x="-30" y="-195" width="10" height="40" fill="#7a5a3a"/><rect x="20" y="-195" width="10" height="40" fill="#7a5a3a"/>
      <line x1="60" y1="-260" x2="40" y2="0" stroke="#9c6d3c" stroke-width="8"/><path d="M20 0 h45 l-5 -20 h-35z" fill="#ddd"/>
      <path d="M38 -170 Q55 -150 55 -120" stroke="#c94f3d" stroke-width="20" stroke-linecap="round" fill="none"/>
      <circle cx="0" cy="-236" r="38" fill="#f2c9a0"/>
      <circle cx="-12" cy="-242" r="5" fill="#222"/><circle cx="14" cy="-242" r="5" fill="#222"/>
      <path d="M-22 -222 q22 14 44 0 q-8 10 -22 10 q-14 0 -22 -10z" fill="#999"/>
      <path d="M-40 -258 Q0 -296 40 -258 Z" fill="#555"/><rect x="-10" y="-262" width="60" height="10" rx="4" fill="#444"/>
      <circle cx="40" cy="-120" r="10" fill="#e8c14a"/><text x="40" y="-114" font-size="14" text-anchor="middle">🔑</text>
    </g>`;
  }

  const door = (x, y, w, h, color, sign) => `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${color}" stroke="#3a3a44" stroke-width="8"/>
    <rect x="${x + w * 0.2}" y="${y + 30}" width="${w * 0.6}" height="${h * 0.3}" rx="4" fill="#cfe6ff" opacity=".8"/>
    <circle cx="${x + w - 22}" cy="${y + h * 0.55}" r="9" fill="#ddd"/>
    ${sign ? `<rect x="${x + 10}" y="${y - 44}" width="${w - 20}" height="34" rx="6" fill="#1e5bb8"/><text x="${x + w / 2}" y="${y - 20}" text-anchor="middle" font-size="20" font-weight="bold" fill="#fff">${sign}</text>` : ""}`;

  // ================= ROOM 1: Classroom =================
  const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ".split("");
  G.room({
    id: "classroom",
    title: "Klasseværelset",
    intro: "Du vågner i klasseværelset. Alle er gået hjem! 😱 Døren er låst...",
    particles: { type: "dust", count: 26, color: "#fff2c0" },
    background: () => `${defs}
      <defs><linearGradient id="classWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe3c4"/><stop offset="1" stop-color="#a9c99c"/></linearGradient></defs>
      <rect width="1600" height="660" fill="url(#classWall)"/>
      <rect y="470" width="1600" height="180" fill="#d9c09a"/><rect y="465" width="1600" height="10" fill="#a8885e"/>
      <rect y="640" width="1600" height="260" fill="url(#planks)"/><rect y="640" width="1600" height="260" fill="url(#floorShade)"/>
      <rect x="1180" y="110" width="360" height="330" fill="url(#eveningSky)" stroke="#fff" stroke-width="14"/>
      <circle cx="1300" cy="380" r="45" fill="#ffd24a"/><circle cx="1300" cy="380" r="110" fill="#ffd24a" opacity=".2"/>
      <line x1="1360" y1="110" x2="1360" y2="440" stroke="#fff" stroke-width="10"/><line x1="1180" y1="275" x2="1540" y2="275" stroke="#fff" stroke-width="10"/>
      <polygon points="1180,440 1540,440 1300,900 800,900" fill="#ffd48a" opacity=".12" pointer-events="none"/>
      <circle cx="1080" cy="100" r="42" fill="#fff" stroke="#333" stroke-width="6"/><line x1="1080" y1="100" x2="1080" y2="72" stroke="#222" stroke-width="5"/><line x1="1080" y1="100" x2="1102" y2="112" stroke="#222" stroke-width="4"/>`,
    objects: [
      {
        id: "door", label: "Klassedør",
        draw: () => `${door(30, 260, 150, 380, "#e0a03a")}
          <rect x="135" y="430" width="34" height="50" rx="5" fill="#222"/>${[0, 1, 2].map((r) => `<rect x="${141}" y="${436 + r * 13}" width="22" height="8" rx="2" fill="#7dff8a" opacity=".7"/>`).join("")}`,
        click(api) {
          if (!api.has("classKey")) return api.modal(`<div class="modal-icon">🚪🔒🔢</div><p>Døren er låst med en <b>nøgle</b> OG en <b>kodelås</b> med 3 tal.</p>`);
          api.codeLock({
            icon: "🚪🔢", text: "Du sætter nøglen i... nu mangler koden!<br>Ved siden af låsen står: <b>🍎 🍌 🍐</b>", length: 3, answer: "346",
            onSolve() { api.take("classKey"); api.goTo("gym"); },
          });
        },
        use(item, api) { if (item !== "classKey") return false; this.click(api); return true; },
      },
      {
        id: "abc", label: "Alfabet-plakat",
        draw: () => `
          <rect x="215" y="120" width="170" height="270" rx="6" fill="#fff" stroke="#1e5bb8" stroke-width="5"/>
          <text x="300" y="152" text-anchor="middle" font-size="24" font-weight="bold" fill="#1e5bb8">A B C</text>
          ${ABC.map((l, i) => `<text x="${235 + (i % 5) * 31}" y="${182 + Math.floor(i / 5) * 34}" font-size="15" fill="#333"><tspan font-weight="bold">${l}</tspan><tspan font-size="11" fill="#c0392b">${i + 1}</tspan></text>`).join("")}`,
        click: (api) => api.modal(`<div class="modal-icon">🔤</div><p>Alfabet-plakaten. Hvert bogstav har et tal:</p>
          <div class="abc">${ABC.map((l, i) => `<span><b>${l}</b> = ${i + 1}</span>`).join("")}</div>`),
      },
      {
        id: "board", label: "Tavle",
        draw: () => `
          <rect x="420" y="130" width="600" height="290" rx="8" fill="#2f5a3e" stroke="#8a5a2c" stroke-width="14"/>
          <g font-family="Comic Sans MS, Trebuchet MS" font-size="38" fill="#f4f4ec">
            <text x="470" y="200">🍎 + 🍎 = 6</text><text x="470" y="270">🍎 + 🍌 = 7</text><text x="470" y="340">🍌 + 🍐 = 10</text>
          </g>
          <text x="800" y="400" font-size="22" fill="#f4f4ec" opacity=".8">Hvad er 🍎 🍌 🍐 ?</text>
          <rect x="460" y="420" width="520" height="12" fill="#8a5a2c"/><rect x="520" y="410" width="40" height="12" rx="3" fill="#fff"/>`,
        click: (api) => api.modal(`<div class="modal-icon">🧮</div><p>Der står regnestykker på tavlen:</p>
          <div class="dark-box">🍎 + 🍎 = 6<br>🍎 + 🍌 = 7<br>🍌 + 🍐 = 10<br><br>Hvad er 🍎 🍌 🍐 ?</div>`),
      },
      {
        id: "studentDesk", label: "Elevbord med seddel",
        draw: () => `
          ${Art.shadow(330, 790, 120)}
          <rect x="240" y="640" width="190" height="18" rx="4" fill="#e7c48a"/><rect x="250" y="656" width="12" height="130" fill="#777"/><rect x="408" y="656" width="12" height="130" fill="#777"/>
          <rect x="300" y="618" width="80" height="26" fill="#fffbe9" transform="rotate(-6 340 630)"/>
          <text x="340" y="637" text-anchor="middle" font-size="13" fill="#333" transform="rotate(-6 340 630)">6·9·19·11</text>
          <rect x="230" y="700" width="70" height="12" fill="#d84" /><rect x="235" y="710" width="8" height="70" fill="#777"/>`,
        click: (api) => api.modal(`<div class="modal-icon">📄</div><p>En hemmelig seddel fra en klassekammerat:</p>
          <div class="clue-box" style="font-size:2rem;letter-spacing:6px">6 · 9 · 19 · 11</div><p><i>Psst! Det er et hemmeligt ord...</i></p>`),
      },
      {
        id: "teacherDesk", label: "Lærerens skrivebord",
        draw: (api) => `
          ${Art.shadow(910, 790, 170)}
          <rect x="740" y="560" width="340" height="24" rx="4" fill="#8a5a2c"/>
          <rect x="755" y="582" width="310" height="190" fill="#a26a35"/>
          <rect x="890" y="610" width="150" height="60" rx="5" fill="#8a5a2c" stroke="#5a3a1e" stroke-width="3"/>
          ${api.flag("drawerOpen") ? "" : [0, 1, 2, 3].map((i) => `<rect x="${902 + i * 33}" y="625" width="27" height="30" rx="4" fill="#eee" stroke="#555" stroke-width="2"/><text x="${915 + i * 33}" y="647" text-anchor="middle" font-size="16">?</text>`).join("")}
          <rect x="780" y="520" width="80" height="40" fill="#e8e0d0" stroke="#999" stroke-width="2"/>`,
        click(api) {
          if (api.flag("drawerOpen")) return api.say("Skuffen er tom nu.");
          api.wordLock({
            icon: "🗄️🔤", text: "Lærerens skuffe har en <b>ordlås</b> med 4 bogstaver.", answer: "FISK",
            onSolve() {
              api.set("drawerOpen");
              api.give("fishFood");
              api.modal(`<div class="modal-icon">🗄️➜🐟🥫</div><p>Skuffen går op!<br>Indeni: <b>fiskefoder</b> og en seddel: <i>"Husk at fodre fiskene fredag!"</i></p>`);
              api.say("Du fandt fiskefoder 🐟🥫");
            },
          });
        },
      },
      {
        id: "globe", label: "Globus",
        draw: () => `
          <rect x="800" y="548" width="40" height="12" fill="#5a3a1e"/><path d="M820 548 V520" stroke="#5a3a1e" stroke-width="5"/>
          <circle cx="820" cy="490" r="34" fill="#3a8fd6"/><path d="M800 470 q15 10 10 25 q-10 5 -14 -10z M828 480 q14 -4 18 12 q-6 16 -18 8z" fill="#5cb85c"/>
          <path d="M786 490 a34 34 0 0 0 68 0" stroke="#c9a227" stroke-width="4" fill="none"/>`,
        click: (api) => api.say("🌍 Du drejer globussen... Danmark er så lille! Men her er ikke noget gemt."),
      },
      {
        id: "aquarium", label: "Akvarium",
        draw: (api) => {
          const fed = api.flag("fed");
          const fish = (x, y, c, flip) => `<g transform="translate(${x} ${y}) scale(${flip ? -1 : 1} 1)"><ellipse cx="0" cy="0" rx="18" ry="11" fill="${c}"/><path d="M14 0 l14 -10 v20z" fill="${c}"/><circle cx="-9" cy="-3" r="3" fill="#111"/></g>`;
          return `
            ${Art.shadow(1440, 790, 120)}
            <rect x="1340" y="660" width="200" height="120" fill="#6a4a3a"/>
            <rect x="1340" y="500" width="200" height="160" rx="6" fill="#4aa8d8" opacity=".75" stroke="#ddd" stroke-width="6"/>
            <path d="M1355 655 q10 -50 0 -90 M1380 655 q-12 -40 6 -70" stroke="#2e8b57" stroke-width="7" fill="none"/>
            <path d="M1450 655 v-50 h12 v10 h10 v-10 h12 v10 h10 v-10 h12 v50z" fill="#a0a0b0"/><rect x="1470" y="625" width="20" height="30" rx="10" fill="#555"/>
            ${fed ? `<g class="twinkle">${Art.star(1478, 640, 9, "#ffe680")}</g>` : ""}
            ${fed ? fish(1400, 530, "#ff8c3a") + fish(1460, 528, "#ffd23a", true) + fish(1510, 540, "#ff5a8a")
                  : fish(1460, 630, "#ff8c3a") + fish(1495, 615, "#ffd23a", true) + fish(1475, 600, "#ff5a8a")}
            <rect x="1340" y="500" width="200" height="160" fill="url(#glass)"/>
            ${api.has("classKey") || api.flag("keyTaken") ? "" : ""}`;
        },
        click(api) {
          if (api.flag("keyTaken")) return api.say("Fiskene svømmer glade rundt 🐠");
          if (!api.flag("fed")) return api.modal(`<div class="modal-icon">🐠</div><p>Fiskene sidder tæt sammen nede ved <b>slottet</b>.<br>Det ser ud som om, de gemmer på noget... og de ser sultne ud!</p>`);
          api.set("keyTaken");
          api.give("classKey");
          api.modal(`<div class="modal-icon">🏰🔑</div><p>Nu hvor fiskene er væk fra slottet, kan du se det:<br>Der ligger en <b>nøgle</b> i slottets dør! Du fisker den op.</p>`);
          api.say("Du fandt klassenøglen 🔑");
        },
        use(item, api) {
          if (item !== "fishFood") return false;
          api.take("fishFood");
          api.set("fed");
          api.modal(`<div class="modal-icon">🥫➜🐠🐠🐠</div><p>Du drysser foder i vandet...<br>Fiskene svømmer op for at spise! Nu er der frit ved <b>slottet</b>.</p>`);
          return true;
        },
      },
    ],
    goal(api) {
      if (!api.flag("drawerOpen")) return "word";
      if (!api.flag("fed")) return "feed";
      if (!api.flag("keyTaken")) return "key";
      return "door";
    },
    hints: {
      word: ["Sedlen på elevbordet har tal. Alfabet-plakaten har tal til hvert bogstav.", "6 = F, 9 = I ...", "Ordet er FISK. Skriv det i lærerens skuffe."],
      feed: ["Fiskene i akvariet ser sultne ud.", "Brug fiskefoderet 🐟🥫 på akvariet."],
      key: ["Fiskene er svømmet op. Kig ved slottet i akvariet."],
      door: ["Døren skal bruge nøglen og en kode med 🍎 🍌 🍐 fra tavlen.", "🍎 + 🍎 = 6, så 🍎 = 3. Så er 🍌 = 4.", "🍐 = 10 − 4 = 6. Koden er 346."],
    },
  });

  // ================= ROOM 2: Gym (hide from the janitor) =================
  let janPhase = "idle"; // idle | coming | passing | off
  let janTimer = 14;
  let hidden = false;

  G.room({
    id: "gym",
    title: "Gymnastiksalen",
    intro: "Gymnastiksalen. 👣 Pedellen går runder! Når han kommer, så gem dig HURTIGT bag måtterne.",
    particles: { type: "dust", count: 20 },
    enter(api) {
      janPhase = "idle"; janTimer = 12; hidden = false;
      const scene = document.getElementById("scene");
      api.every(1000, () => {
        if (api.flag("gymKeysFound")) { janPhase = "off"; scene.classList.remove("jan-coming"); return; }
        if (janPhase === "idle") {
          if (api.modalOpen()) return;
          if (--janTimer <= 0) {
            janPhase = "coming"; janTimer = 5; hidden = false;
            scene.classList.add("jan-coming");
            api.sound("alarm");
            api.say("👣👣 <b>PEDELLEN KOMMER!</b> Gem dig bag måtterne – HURTIGT!");
          }
        } else if (janPhase === "coming") {
          if (hidden) { janPhase = "passing"; janTimer = 3; return; }
          if (--janTimer <= 0) {
            janPhase = "passing"; janTimer = 4;
            api.modal(`<div class="modal-icon">🧹😠</div><p><b>Pedel Pedersen: "Hvem der?!"</b></p><p>Du står musestille som en statue... 🗿<br>Han kigger rundt... og rundt...</p>`, null, true);
          }
        } else if (janPhase === "passing") {
          if (--janTimer <= 0) {
            scene.classList.remove("jan-coming");
            if (!hidden) { api.close(true); api.say("Puha! Pedellen så dig ikke. Næste gang: gem dig bag måtterne!"); }
            else api.say("🤫 Puha! Pedellen gik forbi uden at se dig.");
            hidden = false; janPhase = "idle"; janTimer = 22 + Math.floor(Math.random() * 10);
          }
        }
      });
    },
    background: () => `${defs}
      <rect width="1600" height="660" fill="#c9d4e0"/><rect y="0" width="1600" height="60" fill="#9fb0c4"/>
      ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${i * 280 + 40}" y="70" width="200" height="90" fill="#e8f2ff" stroke="#8a9ab0" stroke-width="6"/>`).join("")}
      <rect y="640" width="1600" height="260" fill="url(#planks)"/>
      <path d="M0 760 Q800 700 1600 760" stroke="#e8e8e8" stroke-width="6" fill="none"/><path d="M780 640 V900" stroke="#e8e8e8" stroke-width="6"/>
      <ellipse cx="780" cy="780" rx="120" ry="40" stroke="#c0392b" stroke-width="6" fill="none"/>
      <rect y="640" width="1600" height="260" fill="url(#floorShade)"/>
      <g stroke="#b5814a" stroke-width="12">${[80, 160, 240, 320].map((x) => `<line x1="${x}" y1="190" x2="${x}" y2="645"/>`).join("")}</g>
      <g stroke="#d8a66a" stroke-width="9">${Array.from({ length: 11 }, (_, i) => `<line x1="80" y1="${220 + i * 40}" x2="320" y2="${220 + i * 40}"/>`).join("")}</g>
      ${[620, 690].map((x) => `<path d="M${x} 60 Q${x + 8} 300 ${x} 560" stroke="#c9a66b" stroke-width="12" fill="none"/>`).join("")}`,
    objects: [
      {
        id: "scoreboard", label: "Måltavle",
        draw: (api) => `
          <rect x="820" y="180" width="300" height="120" rx="10" fill="#1a1a1a" stroke="#555" stroke-width="6"/>
          <text x="895" y="215" text-anchor="middle" font-size="18" fill="#ffd23a">HJEMME</text><text x="1045" y="215" text-anchor="middle" font-size="18" fill="#ffd23a">UDE</text>
          <text x="895" y="275" text-anchor="middle" font-size="46" fill="#ff4a3a" font-family="Consolas">${api.flag("scoreSet") ? "8" : "0"}</text>
          <text x="1045" y="275" text-anchor="middle" font-size="46" fill="#ff4a3a" font-family="Consolas">${api.flag("scoreSet") ? "4" : "0"}</text>
          <rect x="910" y="310" width="120" height="40" rx="6" fill="#fffbe9"/><text x="970" y="336" text-anchor="middle" font-size="14" fill="#333">REGLER ↓</text>`,
        click(api) {
          if (api.flag("scoreSet")) return api.say("Måltavlen viser 8 – 4. Redskabsrummet er åbent!");
          api.codeLock({
            icon: "🏆", text: "Måltavlen. Under den hænger et skilt:",
            clue: `<div class="clue-box">HJEMME = ⚽ + 🏀<br>UDE = 🏐 + 🏐<br><small>Tæl boldene fra dagens træning!</small></div>`,
            length: 2, answer: "84",
            onSolve() {
              api.set("scoreSet");
              api.sound("bell");
              api.modal(`<div class="modal-icon">🏆✅</div><p><b>BZZZT!</b> Måltavlen blinker 8 – 4.<br>Du hører et klik fra <b>redskabsrummet</b>!</p>`);
            },
          });
        },
      },
      {
        id: "poster", label: "Dagens træning",
        draw: () => `
          <rect x="400" y="200" width="180" height="230" rx="6" fill="#fff" stroke="#c0392b" stroke-width="5"/>
          <text x="490" y="232" text-anchor="middle" font-size="18" font-weight="bold" fill="#c0392b">DAGENS TRÆNING</text>
          <text x="490" y="285" text-anchor="middle" font-size="26">⚽⚽⚽⚽⚽</text><text x="490" y="340" text-anchor="middle" font-size="26">🏀🏀🏀</text><text x="490" y="395" text-anchor="middle" font-size="26">🏐🏐</text>`,
        click: (api) => api.modal(`<div class="modal-icon">📋</div><p class="note-text">DAGENS TRÆNING</p><p class="big-emoji">⚽⚽⚽⚽⚽<br>🏀🏀🏀<br>🏐🏐</p>`),
      },
      {
        id: "hoop", label: "Basketkurv",
        draw: (api) => `
          <rect x="1300" y="180" width="200" height="130" rx="6" fill="#fff" stroke="#999" stroke-width="5"/><rect x="1365" y="225" width="70" height="55" fill="none" stroke="#c0392b" stroke-width="5"/>
          <ellipse cx="1400" cy="320" rx="50" ry="10" fill="none" stroke="#ff6a1a" stroke-width="7"/>
          <path d="M1352 322 L1370 390 H1430 L1448 322 M1370 322 L1385 390 M1400 322 V390 M1430 322 L1415 390" stroke="#eee" stroke-width="3" fill="none"/>
          ${api.flag("gymKeysFound") ? "" : `<g class="twinkle">${Art.star(1400, 360, 10, "#ffe680")}</g><text x="1385" y="372" font-size="22">🗝️</text>`}`,
        click(api) {
          if (api.flag("gymKeysFound")) return api.say("En tom basketkurv.");
          api.modal(`<div class="modal-icon">🏀🗝️</div><p>Pedellens <b>nøgleknippe</b> sidder fast oppe i nettet på kurven!<br>Det er alt for højt oppe til at nå.</p>`);
        },
        use(item, api) {
          if (item !== "ball" || api.flag("gymKeysFound")) return false;
          api.take("ball");
          api.set("gymKeysFound");
          api.give("gymKeys");
          api.modal(`<div class="modal-icon">🏀💥🗝️</div><p>Du kaster bolden... <b>SWISH!</b> Lige i kurven!<br>Nøgleknippet falder ned. Du griber det!</p>`);
          return true;
        },
      },
      {
        id: "mats", label: "Måtter (gemmested)",
        draw: () => `
          ${Art.shadow(560, 790, 150)}
          ${[0, 1, 2, 3].map((i) => `<rect x="${420 + i * 4}" y="${740 - i * 34}" width="270" height="36" rx="10" fill="${i % 2 ? "#2f6bb3" : "#3a7fd0"}" stroke="#1f4a80" stroke-width="3"/>`).join("")}
          <rect x="430" y="600" width="250" height="40" rx="12" fill="#e74c3c" stroke="#a5281a" stroke-width="3"/>`,
        click() {
          if (janPhase === "coming" || (janPhase === "passing" && hidden)) {
            hidden = true;
            Game.api.say("🤫 Du gemmer dig bag måtterne... Shhh!");
          } else Game.api.say("Et godt gemmested, hvis pedellen kommer! 🤫");
        },
      },
      {
        id: "storage", label: "Redskabsrum",
        draw: (api) => `${door(1050, 330, 180, 310, api.flag("scoreSet") ? "#7fb069" : "#8a8f9c", "REDSKABSRUM")}
          ${api.flag("scoreSet") && !api.has("ball") && !api.flag("gymKeysFound") ? `<circle cx="1140" cy="580" r="34" fill="#ff7a1a" stroke="#a04a10" stroke-width="3"/><path d="M1106 580 h68 M1140 546 v68" stroke="#a04a10" stroke-width="3"/>` : ""}`,
        click(api) {
          if (!api.flag("scoreSet")) return api.modal(`<div class="modal-icon">🚪🔒</div><p>Redskabsrummet er låst.<br>Der står: <i>"Åbner, når måltavlen viser dagens resultat."</i></p>`);
          if (api.has("ball") || api.flag("gymKeysFound")) return api.say("Der er kun springbuk og hulahop-ringe tilbage.");
          api.give("ball");
          api.render();
          api.say("Du tog en basketball 🏀");
        },
      },
      {
        id: "exit", label: "Dør til hallen",
        draw: () => `${door(1440, 330, 150, 310, "#4a9a5a", "HALLEN")}`,
        click(api) {
          if (!api.has("gymKeys")) return api.modal(`<div class="modal-icon">🚪🔒</div><p>Døren til hallen er låst. Pedellen har nøglerne!</p>`);
          api.take("gymKeys");
          api.goTo("hall");
        },
        use(item, api) { if (item !== "gymKeys") return false; this.click(api); return true; },
      },
      {
        id: "janitor",
        cls: "janitor",
        draw: () => janitor(1520, 650, 0.95),
        click: (api) => api.say("😱 Pedellen! Gem dig bag måtterne!"),
      },
    ],
    goal(api) {
      if (!api.flag("scoreSet")) return "score";
      if (!api.has("ball") && !api.flag("gymKeysFound")) return "storage";
      if (!api.flag("gymKeysFound")) return "hoop";
      return "exit";
    },
    hints: {
      score: ["Måltavlen har regler. Plakaten viser dagens bolde.", "Der er 5 ⚽, 3 🏀 og 2 🏐.", "HJEMME = 5 + 3 = 8. UDE = 2 + 2 = 4. Koden er 84."],
      storage: ["Redskabsrummet er åbent nu. Tag noget derinde."],
      hoop: ["Nøglerne sidder i basketkurven.", "Brug basketballen 🏀 på kurven."],
      exit: ["Brug nøgleknippet på døren til hallen."],
    },
  });

  // ================= ROOM 3: Entrance hall =================
  const NOTES = [["C", 262], ["D", 294], ["E", 330], ["F", 349], ["G", 392], ["A", 440], ["H", 494]];
  G.room({
    id: "hall",
    title: "Hallen",
    intro: "Hovedindgangen! Men den store dør er låst, og der er en tyverialarm. 🚨",
    particles: { type: "dust", count: 24 },
    background: () => `${defs}
      <defs><linearGradient id="hallWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3dfb8"/><stop offset="1" stop-color="#dcc196"/></linearGradient></defs>
      <rect width="1600" height="660" fill="url(#hallWall)"/>
      <rect y="640" width="1600" height="260" fill="url(#lino)"/><rect y="640" width="1600" height="260" fill="url(#floorShade)"/>
      <rect x="500" y="30" width="600" height="120" rx="14" fill="#1e5bb8"/>
      <circle cx="575" cy="90" r="38" fill="#ffd23a"/>${Array.from({ length: 8 }, (_, i) => `<line x1="575" y1="90" x2="${575 + 56 * Math.cos(i * Math.PI / 4)}" y2="${90 + 56 * Math.sin(i * Math.PI / 4)}" stroke="#ffd23a" stroke-width="6"/>`).join("")}
      <circle cx="575" cy="90" r="38" fill="#ffd23a"/>
      <text x="850" y="95" text-anchor="middle" font-size="44" font-weight="bold" fill="#fff">SOLSKOLEN</text>
      <text x="850" y="132" text-anchor="middle" font-size="22" fill="#cfe3ff">SIDEN 1958</text>
      ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${40 + i * 50}" y="300" width="46" height="340" rx="4" fill="${["#e74c3c", "#3498db", "#f1c40f", "#2ecc71", "#9b59b6", "#e67e22"][i]}" stroke="#333" stroke-width="3"/>
        <rect x="${52 + i * 50}" y="320" width="22" height="6" fill="#333"/><rect x="${52 + i * 50}" y="332" width="22" height="6" fill="#333"/><circle cx="${76 + i * 50}" cy="470" r="4" fill="#333"/>`).join("")}`,
    objects: [
      {
        id: "board", label: "Opslagstavle",
        draw: () => `
          <rect x="370" y="200" width="250" height="220" rx="6" fill="#c8955a" stroke="#7a5228" stroke-width="8"/>
          <rect x="390" y="220" width="110" height="130" fill="#fff" transform="rotate(-4 445 285)"/>
          <text x="445" y="250" text-anchor="middle" font-size="14" font-weight="bold" fill="#333" transform="rotate(-4 445 285)">SKOLESANGEN</text>
          <text x="445" y="290" text-anchor="middle" font-size="20" fill="#1e5bb8" transform="rotate(-4 445 285)">♪ ♪ ♪</text>
          <text x="445" y="325" text-anchor="middle" font-size="16" fill="#333" transform="rotate(-4 445 285)">G E C E G</text>
          <rect x="515" y="240" width="90" height="70" fill="#ffe680" transform="rotate(5 560 275)"/><text x="560" y="282" text-anchor="middle" font-size="13" fill="#333" transform="rotate(5 560 275)">Fodbold 🏆</text>
          <circle cx="445" cy="222" r="6" fill="#c33"/><circle cx="560" cy="243" r="6" fill="#2b7bd6"/>`,
        click: (api) => api.modal(`<div class="modal-icon">📌🎵</div><p>På opslagstavlen hænger noderne til <b>skolesangen</b>:</p><div class="clue-box" style="font-size:2rem;letter-spacing:10px">G E C E G</div>`),
      },
      {
        id: "piano", label: "Klaver",
        draw: (api) => `
          ${Art.shadow(510, 775, 150)}
          <rect x="380" y="500" width="260" height="260" rx="8" fill="#2b1d14"/>
          <rect x="395" y="600" width="230" height="40" fill="#fff"/>${Array.from({ length: 9 }, (_, i) => `<line x1="${395 + i * 25.5}" y1="600" x2="${395 + i * 25.5}" y2="640" stroke="#333" stroke-width="2"/>`).join("")}
          ${[1, 2, 4, 5, 6].map((i) => `<rect x="${395 + i * 25.5 - 7}" y="600" width="14" height="24" fill="#111"/>`).join("")}
          <rect x="395" y="520" width="230" height="60" rx="4" fill="#3a2a1e"/>
          <rect x="420" y="760" width="180" height="16" fill="#3a2a1e"/>
          ${api.flag("pianoSolved") ? `<text x="600" y="560" font-size="34" class="bob">🎶</text>` : ""}`,
        click(api) {
          if (api.flag("pianoSolved")) return api.say("Klaveret spiller skolesangen i dit hoved 🎶");
          api.sequenceLock({
            icon: "🎹", text: "Der er en lille lås på klaverbænken: <i>\"Spil skolesangen, så åbner jeg.\"</i>",
            rowCls: "piano",
            buttons: NOTES.map(([n, f]) => ({ v: n, html: n, tone: f })),
            answer: ["G", "E", "C", "E", "G"],
            onSolve() {
              api.set("pianoSolved");
              api.give("scissors");
              api.modal(`<div class="modal-icon">🎹➜✂️</div><p>Klaverbænken klikker op!<br>Indeni ligger nodehæfter og en <b>saks</b>.</p>`);
              api.say("Du fandt en saks ✂️");
            },
          });
        },
      },
      {
        id: "lostFound", label: "Glemte ting",
        draw: () => `
          ${Art.shadow(770, 780, 90)}
          <rect x="690" y="660" width="160" height="110" rx="6" fill="#c68a4a" stroke="#7a5228" stroke-width="5"/>
          <rect x="705" y="620" width="130" height="34" rx="6" fill="#fff"/><text x="770" y="644" text-anchor="middle" font-size="16" font-weight="bold" fill="#333">GLEMTE TING</text>
          <path d="M710 665 q20 -30 50 -5" fill="#e74c3c"/><path d="M770 662 q30 -20 60 2" stroke="#3498db" stroke-width="14" fill="none"/><circle cx="740" cy="668" r="14" fill="#2ecc71"/>`,
        click(api) {
          if (api.flag("capFound")) return api.modal(`<div class="modal-icon">🧢📝</div><p>Sedlen i Claras kasket:</p><div class="clue-box">Pedel-koden er det år,<br>skolen blev bygget.</div>`);
          api.pickLock({
            icon: "📦", text: "Kassen med glemte ting. Der er en <b>kasket 🧢</b>, et <b>halstørklæde 🧣</b> og <b>vanter 🧤</b>.<br>Et skilt siger:",
            clue: `<div class="clue-box" style="text-align:left">👦 <b>Ali</b> går aldrig med noget på hovedet.<br>👦 <b>Bo</b> fryser altid om fingrene.<br>👧 <b>Clara</b> ejer en af tingene.<br><br><b>Hvem ejer kasketten 🧢?</b></div>`,
            rows: [{ options: ["Ali", "Bo", "Clara"], answer: "Clara" }],
            button: "Find kasketten",
            onSolve() {
              api.set("capFound");
              api.modal(`<div class="modal-icon">🧢📝</div><p>Rigtigt! Det er Claras kasket.<br>Inde i den ligger en seddel:</p><div class="clue-box">Pedel-koden er det år,<br>skolen blev bygget.</div>`);
              api.say("Pedel-koden er det år, skolen blev bygget 🏫");
            },
          });
        },
      },
      {
        id: "office", label: "Pedellens kontor",
        draw: (api) => api.flag("officeOpen")
          ? `<rect x="900" y="320" width="190" height="320" fill="#3a3a44" stroke="#2a2a33" stroke-width="8"/><rect x="900" y="276" width="190" height="34" rx="6" fill="#555"/>
             <text x="995" y="300" text-anchor="middle" font-size="20" font-weight="bold" fill="#fff">PEDEL</text>`
          : `${door(900, 320, 190, 320, "#8a8f9c", "PEDEL")}<rect x="1040" y="430" width="34" height="50" rx="5" fill="#222"/>`,
        click(api) {
          if (api.flag("officeOpen")) return api.say("Pedellens kontor. Der er en nøglekrog og et alarm-panel.");
          api.codeLock({
            icon: "🚪🔢", text: "Pedellens kontor har en kodelås med 4 tal.", length: 4, answer: "1958",
            onSolve() {
              api.set("officeOpen");
              api.modal(`<div class="modal-icon">🚪✅</div><p>Døren går op! Inde på kontoret er der en <b>nøglekrog</b> og et <b>alarm-panel</b>.</p>`);
            },
          });
        },
      },
      {
        id: "keyHook", label: "Nøglekrog",
        visible: (api) => api.flag("officeOpen"),
        draw: (api) => `<rect x="925" y="360" width="60" height="20" rx="4" fill="#8a5a2c"/>
          ${api.has("masterKey") || api.flag("doorOpen") ? "" : `<text x="935" y="410" font-size="30">🔐</text>`}`,
        click(api) {
          if (api.has("masterKey") || api.flag("doorOpen")) return api.say("Krogen er tom.");
          api.give("masterKey");
          api.render();
          api.say("Du tog hovednøglen 🔐");
        },
      },
      {
        id: "alarm", label: "Alarm-panel",
        visible: (api) => api.flag("officeOpen"),
        draw: (api) => `<rect x="1000" y="380" width="70" height="100" rx="6" fill="#ddd" stroke="#555" stroke-width="3"/>
          <circle cx="1035" cy="400" r="9" fill="${api.flag("alarmOff") ? "#2ecc71" : "#e74c3c"}" class="${api.flag("alarmOff") ? "" : "pulse"}"/>
          ${["#e74c3c", "#3498db", "#f1c40f"].map((c, i) => `<path d="M${1015 + i * 20} 420 v${api.flag("alarmOff") && i === 2 ? 20 : 50}" stroke="${c}" stroke-width="6"/>`).join("")}`,
        click(api) {
          if (api.flag("alarmOff")) return api.say("Alarmen er slukket ✅");
          api.modal(`<div class="modal-icon">🚨</div><p>Alarm-panelet har tre ledninger: 🔴 🔵 🟡<br>På panelet står:</p>
            <div class="clue-box">Sluk alarmen: Klip den ledning,<br>der har samme farve som <b>skolens logo</b>.</div><p>${api.has("scissors") ? "Brug saksen på panelet." : "Du skal bruge noget at klippe med..."}</p>`);
        },
        use(item, api) {
          if (item !== "scissors" || api.flag("alarmOff")) return false;
          api.pickLock({
            icon: "✂️🚨", text: "Hvilken ledning vil du klippe?",
            rows: [{ options: ["🔴", "🔵", "🟡"], answer: "🟡" }], button: "Klip!",
            onSolve() {
              api.take("scissors");
              api.set("alarmOff");
              api.modal(`<div class="modal-icon">✂️✅</div><p><b>Klip!</b> Lampen bliver grøn. Alarmen er slukket!</p>`);
            },
          });
          return true;
        },
      },
      {
        id: "mainDoor", label: "Hovedindgang",
        draw: (api) => `
          <rect x="1200" y="250" width="330" height="390" fill="${api.flag("doorOpen") ? "#ffe9a8" : "#2a3a5a"}" stroke="#7a5228" stroke-width="14"/>
          <line x1="1365" y1="250" x2="1365" y2="640" stroke="#7a5228" stroke-width="10"/>
          <rect x="1200" y="250" width="330" height="390" fill="url(#glass)"/>
          <rect x="1335" y="430" width="12" height="60" rx="5" fill="#ddd"/><rect x="1383" y="430" width="12" height="60" rx="5" fill="#ddd"/>`,
        click(api) {
          if (!api.has("masterKey")) return api.modal(`<div class="modal-icon">🚪🔒</div><p>Hovedindgangen er låst. Der skal en <b>hovednøgle</b> til.</p>`);
          if (!api.flag("alarmOff")) { api.sound("alarm"); return api.modal(`<div class="modal-icon">🚨</div><p>Stop! Hvis du åbner nu, hyler <b>tyverialarmen</b>!<br>Sluk den først.</p>`); }
          api.set("doorOpen");
          api.win(`Du låser hoveddøren op og løber ud i skolegården... lige i armene på <b>Pedel Pedersen</b>! 😱<br><br>
            Men han griner: <i>"Der er du jo! Din mor ringede. Hun har ledt efter dig i en time!"</i><br>
            Han giver dig en is fra fryseren 🍦 – fordi du var så god til gemmeleg. 🏆`);
        },
        use(item, api) { if (item !== "masterKey") return false; this.click(api); return true; },
      },
    ],
    goal(api) {
      if (!api.flag("pianoSolved")) return "piano";
      if (!api.flag("capFound")) return "cap";
      if (!api.flag("officeOpen")) return "office";
      if (!api.has("masterKey")) return "key";
      if (!api.flag("alarmOff")) return "alarm";
      return "door";
    },
    hints: {
      piano: ["Opslagstavlen har noderne til skolesangen.", "Spil G, E, C, E, G på klaveret."],
      cap: ["Kassen med glemte ting har en logik-gåde.", "Ali har ikke noget på hovedet, og Bo har vanter.", "Kasketten er Claras."],
      office: ["Pedel-koden er det år, skolen blev bygget.", "Kig på det blå skilt øverst: SIDEN 1958.", "Koden er 1958."],
      key: ["Tag hovednøglen fra krogen på pedellens kontor."],
      alarm: ["Skolens logo er en gul sol.", "Brug saksen ✂️ på alarm-panelet og klip den gule ledning."],
      door: ["Brug hovednøglen 🔐 på hovedindgangen!"],
    },
  });
})();
