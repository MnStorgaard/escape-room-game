// Room 3: The yard
// Chain: shed shadow puzzle (2 rounds) -> rope + pickaxe
//        pickaxe on flower bed -> bone -> calm the dog
//        bucket + rope -> lower into well -> crank handle
//        crank on gate machine -> gear size puzzle -> gate opens -> twist ending
(() => {
  const G = Game;
  G.item("rope", "🪢", "reb");
  G.item("pickaxe", "⛏️", "hakke");
  G.item("bone", "🦴", "kødben");
  G.item("bucket", "🪣", "spand");
  G.item("bucketRope", "🪣🪢", "spand med reb");
  G.item("crank", "🔧", "håndsving");
  G.recipe("bucket", "rope", "bucketRope", "Du binder rebet fast i spanden.<br>Nu kan du sænke den ned i noget dybt!");

  function gear(cx, cy, r, teeth, fill) {
    let d = "";
    for (let i = 0; i < teeth * 2; i++) {
      const a1 = (Math.PI / teeth) * i;
      const a2 = (Math.PI / teeth) * (i + 1);
      const rr = i % 2 ? r : r + r * 0.18;
      d += `${i ? "L" : "M"}${(cx + rr * Math.cos(a1)).toFixed(1)} ${(cy + rr * Math.sin(a1)).toFixed(1)}L${(cx + rr * Math.cos(a2)).toFixed(1)} ${(cy + rr * Math.sin(a2)).toFixed(1)}`;
    }
    return `<path d="${d}Z" fill="${fill}" stroke="#333" stroke-width="3"/><circle cx="${cx}" cy="${cy}" r="${r * 0.3}" fill="#333"/>`;
  }

  const dogBlocks = (api) => {
    api.sound("bark");
    api.say("🐕 <b>VOV VOV!</b> Vagthunden lader dig ikke komme hen til porten!");
  };

  // ---------- Puzzle: shadow lock on the shed (2 rounds) ----------
  const SHADOW_ROUNDS = [
    { answer: "🦉", options: ["🐧", "🦉", "🐓", "🦅"] },
    { answer: "🐿️", options: ["🐇", "🐈", "🐿️", "🦔"] },
  ];
  function shedPuzzle(api) {
    if (api.flag("shedOpen")) return api.say("Skuret er tomt nu.");
    let round = 0;
    const show = () => {
      const r = SHADOW_ROUNDS[round];
      api.modal(`
        <div class="modal-icon">🛖</div>
        <p>Skurets lås viser en <b>skygge</b> (${round + 1} af ${SHADOW_ROUNDS.length}).<br>Hvilket dyr passer til skyggen?</p>
        <div class="shadow-box"><span class="shadow">${r.answer}</span></div>
        <div class="row">${r.options.map((o) => `<button class="choice" data-o="${o}">${o}</button>`).join("")}</div>`,
        (root) => root.querySelectorAll(".choice").forEach((b) => b.addEventListener("click", () => {
          if (b.dataset.o !== r.answer) return api.shake();
          api.sound("success");
          round++;
          if (round < SHADOW_ROUNDS.length) return show();
          api.set("shedOpen");
          api.give("rope");
          api.give("pickaxe");
          api.modal(`<div class="modal-icon">🛖➜🪢⛏️</div><p><b>Knirk!</b> Skurdøren går op.<br>Indeni finder du et <b>reb</b> og en <b>hakke</b>.</p>`);
          api.say("Du fandt et reb 🪢 og en hakke ⛏️");
        })));
    };
    show();
  }

  // ---------- Puzzle: pick the right gear ----------
  function gearPuzzle(api) {
    const sizes = [{ r: 26, t: 8 }, { r: 42, t: 12 }, { r: 62, t: 16 }];
    const mech = `<svg viewBox="0 0 400 180" width="100%" style="max-width:380px">
        ${gear(80, 90, 62, 16, "#c9a227")}
        <circle cx="198" cy="90" r="42" fill="none" stroke="#7a5a14" stroke-width="4" stroke-dasharray="10 8"/>
        <text x="198" y="100" text-anchor="middle" font-size="30">❓</text>
        ${gear(300, 90, 26, 8, "#b0b8c4")}
      </svg>`;
    api.modal(`
      <div class="modal-icon">⚙️</div>
      <p>Du sætter håndsvinget i maskinen... men den sidder fast!<br>Et <b>tandhjul</b> mangler i midten.</p>
      ${mech}
      <p>Hvilket tandhjul passer ind i hullet?</p>
      <div class="row">${sizes.map((s, i) => `<button class="choice gear-btn" data-i="${i}"><svg viewBox="-75 -75 150 150" width="70" height="70">${gear(0, 0, s.r, s.t, "#d8c27a")}</svg></button>`).join("")}</div>`,
      (root) => root.querySelectorAll(".gear-btn").forEach((b) => b.addEventListener("click", () => {
        if (b.dataset.i !== "1") return api.shake();
        api.set("gateOpen");
        api.sound("door");
        finale(api);
      })));
  }

  function finale(api) {
    api.modal(`
      <div class="modal-icon">⚙️➜🏰</div>
      <p>Tandhjulet passer! Du drejer håndsvinget...<br><b>KNIRK... KNIRK...</b> Den store port går op!</p>
      <p>Men hvem står udenfor med en kæmpe sæk?</p>
      <div class="row"><button class="action" id="seeWho">Se hvem det er! 👀</button></div>`,
      (root) => root.querySelector("#seeWho").addEventListener("click", () => api.win(
        `Det er <b>MESTER MUS</b> 🐭 med en sæk fuld af stjålet ost 🧀!<br>
         Han var på vej IND for at stjæle fængslets ost.<br><br>
         Vagterne kommer dansende ud til musikken 🕺📻 og fanger ham på stedet.<br>
         Nu ved alle, at du er uskyldig. Godt klaret, detektiv! 🕵️⭐`)));
  }

  G.room({
    id: "yard",
    title: "Gården",
    intro: "Du er ude i fængselsgården 🌙 Den store port er den sidste vej ud... men den er lukket.",

    background: () => `
      <rect width="1600" height="900" fill="url(#nightSky)"/>
      ${[[120, 60], [340, 120], [560, 40], [760, 100], [980, 50], [1180, 130], [1420, 70], [1530, 160], [640, 170], [260, 200]]
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#fff" opacity=".8"/>`).join("")}
      <circle cx="1350" cy="110" r="120" fill="url(#moonGlow)"/><circle cx="1350" cy="110" r="45" fill="#fff3c4"/>
      <g class="sweep"><polygon points="120,170 -200,600 260,640" fill="#fff9c4" opacity=".12"/></g>
      <rect x="80" y="130" width="80" height="260" fill="#3d4155"/><rect x="60" y="110" width="120" height="40" fill="#4a4e63"/>
      <circle cx="120" cy="165" r="14" fill="#fff9c4"/>
      <rect y="300" width="1600" height="350" fill="url(#castleStone)"/>
      ${Array.from({ length: 17 }, (_, i) => `<rect x="${i * 100}" y="270" width="60" height="40" fill="#4a4e63"/>`).join("")}
      <rect y="620" width="1600" height="280" fill="url(#grass)"/>
      <path d="M1100 900 Q1200 700 1300 640 L1420 640 Q1420 760 1500 900 Z" fill="#7a6a55" opacity=".8"/>`,

    objects: [
      {
        id: "shed",
        draw: (api) => `
          ${Art.shadow(210, 690, 170)}
          <rect x="60" y="400" width="300" height="290" fill="url(#wood)" stroke="#5a3a1e" stroke-width="5"/>
          ${[0, 1, 2, 3, 4, 5].map((i) => `<line x1="${60 + i * 50}" y1="400" x2="${60 + i * 50}" y2="690" stroke="#7a4d27" stroke-width="3"/>`).join("")}
          <path d="M30 410 L210 300 L390 410 Z" fill="#7b2d26" stroke="#4a1a16" stroke-width="5"/>
          <rect x="150" y="490" width="120" height="200" fill="${api.flag("shedOpen") ? "#1a120c" : "url(#darkWood)"}" stroke="#3a2412" stroke-width="5"/>
          ${api.flag("shedOpen") ? "" : `<rect x="180" y="550" width="60" height="60" rx="8" fill="#e8dcc0" stroke="#7a5a14" stroke-width="3"/>
            <text x="210" y="592" text-anchor="middle" font-size="34" style="filter:brightness(0)">🦉</text>`}`,
        click: shedPuzzle,
      },
      {
        id: "flowerbed",
        draw: (api) => `
          <ellipse cx="520" cy="760" rx="140" ry="40" fill="#5a3d26"/>
          ${[[420, 735, "#e74c3c"], [470, 725, "#f1c40f"], [560, 728, "#9b59b6"], [610, 740, "#e67e22"], [455, 770, "#ec407a"], [600, 772, "#f1c40f"]]
            .map(([x, y, c]) => `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + 25}" stroke="#2e7d32" stroke-width="4"/><circle cx="${x}" cy="${y}" r="12" fill="${c}"/><circle cx="${x}" cy="${y}" r="4" fill="#fff59d"/>`).join("")}
          ${api.flag("boneFound") ? `<ellipse cx="520" cy="765" rx="34" ry="12" fill="#2e1e12"/>` : `<ellipse cx="520" cy="760" rx="40" ry="18" fill="#6b4a30"/><path d="M508 748 l14 -12 l6 6 l-12 12z" fill="#f5f0e1"/>`}`,
        click(api) {
          if (api.flag("boneFound")) return api.say("Et hul i blomsterbedet.");
          api.modal(`<div class="modal-icon">🌷🌻</div><p>Et blomsterbed. Midt i er jorden gravet op...<br>Der stikker noget <b>hvidt</b> op!</p><p>Jorden er alt for hård til dine fingre.</p>`);
        },
        use(item, api) {
          if (item !== "pickaxe" || api.flag("boneFound")) return false;
          api.take("pickaxe");
          api.set("boneFound");
          api.give("bone");
          api.modal(`<div class="modal-icon">⛏️➜🦴</div><p>Du hakker i jorden... og finder et stort <b>kødben</b>!<br>Nogen har gemt det her.</p>`);
          api.say("Du fandt et kødben 🦴 Hvem mon har gemt det?");
          return true;
        },
      },
      {
        id: "well",
        draw: (api) => `
          ${Art.shadow(800, 765, 120)}
          <rect x="705" y="470" width="14" height="150" fill="url(#darkWood)"/><rect x="881" y="470" width="14" height="150" fill="url(#darkWood)"/>
          <path d="M680 480 L800 410 L920 480 Z" fill="#7b2d26" stroke="#4a1a16" stroke-width="4"/>
          <rect x="712" y="510" width="176" height="10" fill="#5a3a1e"/>
          <line x1="800" y1="515" x2="800" y2="${api.flag("crankFound") ? 640 : 600}" stroke="#c9a86a" stroke-width="3"/>
          <rect x="690" y="610" width="220" height="150" rx="10" fill="url(#castleStone)" stroke="#2f3244" stroke-width="5"/>
          <ellipse cx="800" cy="612" rx="110" ry="22" fill="#1a1d2b" stroke="#2f3244" stroke-width="6"/>`,
        click(api) {
          if (api.flag("crankFound")) return api.say("Brønden er tom. Kun vand dernede.");
          api.modal(`<div class="modal-icon">🕳️💧</div><p>En dyb brønd.<br>Nede i vandet flyder noget af metal... det ligner et <b>håndsving</b> 🔧!</p><p>Du kan ikke nå det. Du skal sænke noget ned.</p>`);
        },
        use(item, api) {
          if (api.flag("crankFound")) return false;
          if (item === "bucket") { api.say("🪣 Spanden kan ikke hænge i luften. Den skal have et reb!"); return true; }
          if (item === "rope") { api.say("🪢 Rebet alene kan ikke samle håndsvinget op."); return true; }
          if (item !== "bucketRope") return false;
          api.take("bucketRope");
          api.set("crankFound");
          api.give("crank");
          api.modal(`<div class="modal-icon">🪣🪢➜🔧</div><p>Du sænker spanden ned i brønden...<br><b>PLASK!</b> Du fisker et <b>håndsving</b> op!</p>`);
          api.say("Du fandt et håndsving 🔧 Hvad mon det passer til?");
          return true;
        },
      },
      {
        id: "bucket",
        visible: (api) => !api.has("bucket") && !api.has("bucketRope") && !api.flag("crankFound"),
        draw: () => `
          ${Art.shadow(645, 700, 40)}
          <path d="M610 640 L680 640 L670 700 L620 700 Z" fill="#7f8c9a" stroke="#4a5563" stroke-width="4"/>
          <path d="M613 642 Q645 600 677 642" stroke="#4a5563" stroke-width="4" fill="none"/>`,
        click(api) {
          api.give("bucket");
          api.render();
          api.say("Du tog en spand 🪣");
        },
      },
      {
        id: "gate",
        draw: (api) => api.flag("gateOpen")
          ? `<rect x="1140" y="250" width="340" height="400" fill="#141826"/>`
          : `<path d="M1140 650 V330 Q1310 210 1480 330 V650 Z" fill="url(#darkWood)" stroke="#2a1a0e" stroke-width="10"/>
             ${[0, 1, 2, 3, 4, 5].map((i) => `<line x1="${1170 + i * 52}" y1="300" x2="${1170 + i * 52}" y2="650" stroke="#3a2412" stroke-width="4"/>`).join("")}
             <rect x="1140" y="400" width="340" height="22" fill="#2b2b33"/><rect x="1140" y="560" width="340" height="22" fill="#2b2b33"/>
             ${[1170, 1260, 1360, 1450].map((x) => `<circle cx="${x}" cy="411" r="6" fill="#888"/><circle cx="${x}" cy="571" r="6" fill="#888"/>`).join("")}`,
        click(api) {
          if (!api.flag("dogCalm")) return dogBlocks(api);
          api.modal(`<div class="modal-icon">🏰</div><p>Den store port er alt for tung til at skubbe.</p><p>Ved siden af porten står en <b>maskine</b>, der kan åbne den.</p>`);
        },
      },
      {
        id: "machine",
        draw: (api) => `
          <rect x="1495" y="430" width="95" height="150" rx="8" fill="#4b5563" stroke="#2f3640" stroke-width="5"/>
          <g transform="translate(1542 480) scale(.5)">${gear(0, 0, 50, 12, "#c9a227")}</g>
          <circle cx="1542" cy="545" r="12" fill="#222"/>
          ${api.flag("gateOpen") ? `<rect x="1540" y="540" width="40" height="10" rx="4" fill="#9aa4b0"/>` : ""}`,
        click(api) {
          if (!api.flag("dogCalm")) return dogBlocks(api);
          if (api.flag("crankInserted")) return gearPuzzle(api);
          api.modal(`<div class="modal-icon">⚙️</div><p>Maskinen, der åbner porten.<br>Der er et hul, hvor der mangler et <b>håndsving</b>.</p>`);
        },
        use(item, api) {
          if (!api.flag("dogCalm")) { dogBlocks(api); return true; }
          if (item !== "crank") return false;
          api.take("crank");
          api.set("crankInserted");
          gearPuzzle(api);
          return true;
        },
      },
      {
        id: "dog",
        draw: (api) => `
          <path d="M1010 760 L1010 640 L1090 580 L1170 640 L1170 760 Z" fill="#8e5b34" stroke="#4a2e18" stroke-width="5"/>
          <path d="M1060 760 V690 Q1090 660 1120 690 V760 Z" fill="#2a1a0e"/>
          ${Art.dog(1060, 820, 0.85, api.flag("dogCalm") ? "sleep" : "angry")}
          ${api.flag("dogCalm") ? `<path d="M1105 790 l30 -8 l4 8 l-30 8z" fill="#f5f0e1"/><text x="1120" y="720" font-size="28" class="bob">💤</text>` : ""}`,
        click(api) {
          if (api.flag("dogCalm")) return api.say("Vagthunden sover glad med sit kødben 🐕💤");
          api.sound("bark");
          api.modal(`<div class="modal-icon">🐕💢</div><p><b>GRRR... VOV VOV!</b><br>Vagthunden passer på porten.</p><p>Den ser sulten ud...</p>`);
        },
        use(item, api) {
          if (api.flag("dogCalm")) return false;
          if (item !== "bone") { api.sound("bark"); api.say("🐕 Hunden er ikke interesseret i det. Den vil have noget at gnave i!"); return true; }
          api.take("bone");
          api.set("dogCalm");
          api.sound("success");
          api.modal(`<div class="modal-icon">🦴➜🐕💤</div><p>Hunden logrer med halen og snupper kødbenet.<br>Den gnaver lidt... og falder i søvn! 💤</p>`);
          api.say("Hunden sover 🐕💤 Nu kan du komme hen til porten.");
          return true;
        },
      },
    ],

    goal(api) {
      if (!api.flag("shedOpen")) return "shed";
      if (!api.flag("boneFound")) return "dig";
      if (!api.flag("dogCalm")) return "dog";
      if (!api.flag("crankFound") && !api.has("bucket") && !api.has("bucketRope")) return "bucket";
      if (!api.flag("crankFound") && !api.has("bucketRope")) return "combine";
      if (!api.flag("crankFound")) return "well";
      return "gate";
    },
    hints: {
      shed: ["Skuret har en skygge-lås.", "Se på skyggens form: ører, næb, hale?", "Første skygge er en ugle 🦉, anden er et egern 🐿️."],
      dig: ["Der stikker noget hvidt op af blomsterbedet.", "Brug hakken ⛏️ på blomsterbedet."],
      dog: ["Hunden ser sulten ud.", "Giv hunden kødbenet 🦴."],
      bucket: ["Der står en spand ved brønden.", "Klik på spanden for at tage den."],
      combine: ["Spanden skal kunne sænkes ned i brønden.", "Klik på 🪣 og derefter på 🪢 i rygsækken."],
      well: ["Der flyder noget i brønden.", "Brug spanden med reb på brønden."],
      gate: ["Maskinen ved porten mangler et håndsving.", "Brug håndsvinget 🔧 på maskinen til højre for porten.", "Vælg det tandhjul, der er lige så stort som den stiplede cirkel."],
    },
  });
})();
