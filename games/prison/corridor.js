// Room 2: The corridor
// Chain: sneak past patrolling guard (timing) -> locker animal logic -> batteries
//        radio from shelf + batteries -> working radio -> distract desk guard
//        logbook math (mouse + mouse = 8, cheese = mouse - 1) -> door code 43
(() => {
  const G = Game.use("prison");
  G.item("radio", "📻", "radio (uden batterier)");
  G.item("batteries", "🔋", "batterier");
  G.item("radioOn", "📻🎵", "radio der virker");
  G.recipe("radio", "batteries", "radioOn", "Du sætter batterierne i radioen.<br>🎵 Der kommer musik ud! 🎵");

  let lookingLeft = true; // true = patrol guard looks toward you (left)
  let phaseTicks = 0;

  const notPast = (api) => {
    api.sound("alarm");
    api.say("🚨 Vagten kan se dig derovre! Gem dig først bag kasserne, når han kigger væk.");
  };
  const past = (api) => api.flag("sneaked");
  const distracted = (api) => api.flag("distracted");

  // ---------- Puzzle: locker with animal order ----------
  function lockerPuzzle(api) {
    if (api.flag("lockerOpen")) return api.say("Skabet er tomt nu.");
    const animals = ["🐶", "🐱", "🐭", "🐰"];
    const slots = [0, 1, 2, 3];
    api.modal(`
      <div class="modal-icon">🗄️</div>
      <p>Skabet har en dyre-lås. Der hænger en seddel:</p>
      <div class="clue-box">🐭 står <b>først</b>.<br>🐰 står <b>sidst</b>.<br>🐱 står lige ved siden af 🐰.</div>
      <p class="small-text">Klik på dyrene for at skifte dem.</p>
      <div class="row" id="slots">${slots.map((s, i) => `<button class="choice" data-i="${i}">${animals[s]}</button>`).join("")}</div>
      <div class="row"><button class="action" id="tryLocker">Åbn skabet</button></div>`,
      (root) => {
        root.querySelectorAll("#slots .choice").forEach((b) => b.addEventListener("click", () => {
          const i = +b.dataset.i;
          slots[i] = (slots[i] + 1) % animals.length;
          b.textContent = animals[slots[i]];
          api.sound("click");
        }));
        root.querySelector("#tryLocker").addEventListener("click", () => {
          if (slots.map((s) => animals[s]).join("") === "🐭🐶🐱🐰") {
            api.set("lockerOpen");
            api.give("batteries");
            api.modal(`<div class="modal-icon">🗄️➜🔋</div><p><b>Klak!</b> Skabet går op.<br>Indeni: en vagtjakke, en hjelm... og <b>batterier</b>!</p>`);
            api.say("Du fandt batterier 🔋");
          } else api.shake();
        });
      });
  }

  G.room({
    id: "corridor",
    title: "Gangen",
    particles: { type: "dust", count: 20 },
    intro: "Du er ude af cellen! 🤫 Men en vagt går frem og tilbage. Snig dig forbi, når han kigger væk.",

    enter(api) {
      lookingLeft = true;
      phaseTicks = 0;
      const scene = document.getElementById("scene");
      scene.classList.add("look-left");
      api.every(300, () => {
        if (distracted(api)) return scene.classList.remove("look-left");
        phaseTicks++;
        const limit = lookingLeft ? 8 : 6 + Math.floor(Math.random() * 3); // ~2.4s looking at you, ~1.8-2.4s away
        if (phaseTicks >= limit) {
          lookingLeft = !lookingLeft;
          phaseTicks = 0;
          scene.classList.toggle("look-left", lookingLeft);
        }
      });
    },

    background: () => `
      <rect width="1600" height="420" fill="#9aa3b5"/>
      <rect y="400" width="1600" height="260" fill="url(#tiles)" opacity=".9"/>
      <rect y="395" width="1600" height="14" fill="#5c6478"/>
      <rect y="640" width="1600" height="260" fill="url(#stoneFloor)"/>
      <rect y="640" width="1600" height="260" fill="url(#floorShade)"/>
      <rect y="630" width="1600" height="18" fill="#3a3445"/>
      <rect y="0" width="1600" height="30" fill="#6c7487"/>
      ${Art.lamp(300, 40)}${Art.lamp(800, 40)}${Art.lamp(1300, 40)}`,

    objects: [
      {
        id: "cellDoor",
        label: "Celledøren",
        draw: () => `
          <rect x="40" y="170" width="190" height="475" fill="#1c1b24" stroke="#3d3f4a" stroke-width="14"/>
          <g transform="skewY(-8) translate(0 20)">${[0, 1, 2, 3].map((i) => `<rect x="${55 + i * 26}" y="190" width="10" height="440" rx="4" fill="url(#metal)"/>`).join("")}</g>`,
        click: (api) => api.say("Du vil ikke tilbage i cellen! 🙅"),
      },
      {
        id: "shelf",
        label: "Hylde",
        draw: (api) => `
          <rect x="250" y="330" width="210" height="16" rx="3" fill="url(#wood)"/>
          <path d="M270 346 l0 30 l20 -30 M440 346 l0 30 l-20 -30" stroke="#5a3a1e" stroke-width="6" fill="none"/>
          <rect x="400" y="270" width="18" height="60" fill="#c0392b"/><rect x="420" y="280" width="16" height="50" fill="#2e86c1"/><rect x="438" y="262" width="16" height="68" fill="#27ae60"/>
          ${api.has("radio") || api.has("radioOn") || api.flag("distracted") ? "" : `
            <line x1="365" y1="270" x2="395" y2="215" stroke="#333" stroke-width="4"/>
            <rect x="265" y="262" width="125" height="68" rx="12" fill="#c0392b" stroke="#7b241c" stroke-width="4"/>
            <circle cx="300" cy="296" r="22" fill="#2b2b2b"/>
            ${[-10, 0, 10].map((d) => `<line x1="${290 + d}" y1="280" x2="${290 + d}" y2="312" stroke="#555" stroke-width="3"/>`).join("")}
            <rect x="335" y="278" width="42" height="18" rx="4" fill="#f5e6a8"/><circle cx="345" cy="312" r="7" fill="#eee"/><circle cx="368" cy="312" r="7" fill="#eee"/>`}`,
        click(api) {
          if (api.has("radio") || api.has("radioOn") || api.flag("distracted")) return api.say("Bare nogle gamle bøger på hylden.");
          api.give("radio");
          api.render();
          api.modal(`<div class="modal-icon">📻</div><p>Du tager en gammel <b>radio</b> fra hylden.</p><p>Du trykker på knappen... ingenting. Den mangler <b>batterier</b>.</p>`);
          api.say("Du fandt en radio 📻 Den mangler batterier.");
        },
      },
      {
        id: "crates",
        label: "Kasser",
        draw: () => `
          ${Art.shadow(680, 760, 150)}
          <g stroke="#5a3a1e" stroke-width="5">
            <rect x="560" y="600" width="150" height="150" fill="url(#wood)"/><path d="M560 600 L710 750 M710 600 L560 750" fill="none"/>
            <rect x="700" y="640" width="110" height="110" fill="url(#wood)"/><path d="M700 640 L810 750 M810 640 L700 750" fill="none"/>
            <rect x="590" y="510" width="100" height="90" fill="url(#wood)"/><path d="M590 510 L690 600 M690 510 L590 600" fill="none"/>
          </g>`,
        click(api) {
          if (past(api)) return api.say("Du er allerede forbi vagten 🤫");
          if (lookingLeft) {
            api.sound("alarm");
            api.say("🚨 <b>Vagten: Hvem der?!</b> Du når lige at dukke dig. Vent til han kigger den anden vej!");
            return;
          }
          api.sound("success");
          api.set("sneaked");
          api.say("🤫 Du sneg dig forbi vagten! Nu kan du gå på opdagelse i resten af gangen.");
        },
      },
      {
        id: "patrolGuard",
        label: "Vagt",
        draw: (api) => distracted(api)
          ? `<g class="bob">${Art.guard(560, 800, 0.95, { facing: 1, mood: "dance" })}</g>`
          : `<g class="pg pg-left">
               <polygon points="925,525 520,640 520,860" fill="#fff3a0" opacity=".32"/>
               ${Art.guard(960, 780, 0.95, { facing: -1 })}
             </g>
             <g class="pg pg-right">
               <polygon points="995,525 1400,640 1400,860" fill="#fff3a0" opacity=".32"/>
               ${Art.guard(960, 780, 0.95, { facing: 1 })}
             </g>`,
        click: (api) => api.say(distracted(api) ? "Vagten danser til musikken 🕺" : "Shh! 🤫 Han må ikke opdage dig. Se hvilken vej han kigger."),
        use(item, api) {
          if (item === "radioOn") { api.say("Brug hellere radioen på vagten ved skrivebordet."); return true; }
          return false;
        },
      },
      {
        id: "poster",
        label: "Efterlyst-plakat",
        draw: () => `
          <g transform="rotate(2 905 235)">
            <rect x="830" y="120" width="150" height="220" fill="#f3e6c4" stroke="#c9b48a" stroke-width="4"/>
            <text x="905" y="155" text-anchor="middle" font-size="22" font-weight="bold" fill="#a32" font-family="Trebuchet MS">EFTERLYST</text>
            ${Art.mouse(905, 320, 0.75)}
          </g>`,
        click: (api) => api.modal(`<div class="modal-icon">🐭📜</div><p class="note-text">EFTERLYST</p><p><b>Mester Mus</b><br>Stjæler alt, især ost 🧀<br>Elsker at gemme koder i regnestykker!</p>`),
      },
      {
        id: "locker",
        label: "Skab",
        draw: (api) => `
          ${Art.shadow(1100, 765, 80)}
          <rect x="1040" y="270" width="125" height="490" rx="6" fill="#5f7f97" stroke="#3f5566" stroke-width="5"/>
          ${[0, 1, 2, 3].map((i) => `<rect x="1065" y="${300 + i * 16}" width="75" height="6" rx="3" fill="#3f5566"/>`).join("")}
          <rect x="1135" y="480" width="12" height="60" rx="5" fill="#cfd6dd"/>
          <rect x="1065" y="520" width="56" height="36" rx="6" fill="${api.flag("lockerOpen") ? "#3a7d44" : "#2b2b2b"}"/>
          <text x="1093" y="546" text-anchor="middle" font-size="20">🐾</text>
          <rect x="1060" y="400" width="50" height="40" fill="#fffbe9" transform="rotate(-6 1085 420)"/>`,
        click: (api) => past(api) ? lockerPuzzle(api) : notPast(api),
      },
      {
        id: "deskGuard",
        label: "Vagt ved skrivebord",
        visible: (api) => !distracted(api),
        draw: () => Art.guard(1320, 720, 0.9, { facing: -1, mood: "eat" }),
        click(api) {
          if (!past(api)) return notPast(api);
          api.modal(`<div class="modal-icon">💂🥪</div><p>Vagten ved skrivebordet spiser sin sandwich og holder øje med logbogen.</p><p>Du skal have ham lokket væk...</p>`);
        },
        use(item, api) {
          if (!past(api)) { notPast(api); return true; }
          if (item === "radio") { api.say("📻 Radioen er død. Den mangler batterier."); return true; }
          if (item !== "radioOn") return false;
          api.take("radioOn");
          api.sound("radio");
          api.set("distracted");
          api.modal(`<div class="modal-icon">📻🎵 ➜ 🕺🕺</div><p>Du skruer helt op for radioen og stiller den bag kasserne.</p><p>Vagterne hører musikken og <b>danser</b> derhen! 🎶<br>Skrivebordet er frit!</p>`);
          api.say("Vagterne danser 🕺 Skynd dig hen til skrivebordet!");
          return true;
        },
      },
      {
        id: "dancingRadio",
        label: "Radio",
        visible: distracted,
        draw: () => `
          <rect x="460" y="760" width="110" height="60" rx="10" fill="#c0392b" stroke="#7b241c" stroke-width="4"/>
          <circle cx="490" cy="790" r="18" fill="#2b2b2b"/>
          <g class="bob"><text x="470" y="740" font-size="40">🎵</text><text x="530" y="720" font-size="32">🎶</text></g>`,
        click: (api) => api.say("🎵 La la la... Vagterne danser!"),
      },
      {
        id: "desk",
        label: "Skrivebord",
        draw: () => `
          ${Art.shadow(1305, 765, 140)}
          <rect x="1185" y="600" width="240" height="22" rx="4" fill="url(#wood)"/>
          <rect x="1195" y="620" width="220" height="140" fill="url(#darkWood)"/>
          <rect x="1210" y="640" width="90" height="40" rx="4" fill="#5a3a20"/><circle cx="1255" cy="660" r="5" fill="#e8c14a"/>
          <path d="M1390 600 l0 -50 l-25 -20" stroke="#333" stroke-width="5" fill="none"/><path d="M1345 520 l40 0 l-12 22 l-16 0z" fill="#2e7d32"/>`,
        click: (api) => past(api) ? api.say("Et skrivebord. Logbogen ligger ovenpå.") : notPast(api),
      },
      {
        id: "logbook",
        label: "Logbog",
        draw: () => `
          <path d="M1230 598 L1270 588 L1310 598 L1310 604 L1230 604 Z" fill="#f4efe0" stroke="#8a7a5a" stroke-width="2"/>
          <line x1="1270" y1="588" x2="1270" y2="604" stroke="#8a7a5a" stroke-width="2"/>
          <rect x="1226" y="602" width="88" height="6" fill="#7b2d26"/>`,
        click(api) {
          if (!past(api)) return notPast(api);
          if (!distracted(api)) return api.say("Vagten holder øje med logbogen 👀 Du skal lokke ham væk først.");
          api.modal(`
            <div class="modal-icon">📖</div><p class="note-text">VAGT-LOGBOG</p>
            <div class="clue-box">Dagens kode til døren:<br><br>
              🐭 + 🐭 = 8<br>🧀 = 🐭 − 1<br><br>Koden er: <b>🐭 🧀</b></div>`);
          api.set("logbookRead");
        },
      },
      {
        id: "exitDoor",
        label: "Udgang",
        draw: () => `
          <rect x="1440" y="230" width="150" height="415" rx="6" fill="#4b5563" stroke="#2f3640" stroke-width="10"/>
          ${[0, 1, 2, 3].map((i) => `<circle cx="1460" cy="${260 + i * 110}" r="5" fill="#9aa"/><circle cx="1570" cy="${260 + i * 110}" r="5" fill="#9aa"/>`).join("")}
          <rect x="1455" y="180" width="120" height="40" rx="6" fill="#1e8449"/>
          <text x="1515" y="208" text-anchor="middle" font-size="22" font-weight="bold" fill="#fff" font-family="Trebuchet MS">UDGANG</text>
          <rect x="1540" y="400" width="40" height="60" rx="5" fill="#222"/>
          ${[0, 1, 2].map((r) => [0, 1].map((c) => `<rect x="${1546 + c * 16}" y="${408 + r * 16}" width="12" height="12" rx="2" fill="#7dff8a" opacity=".7"/>`).join("")).join("")}`,
        click(api) {
          if (!past(api)) return notPast(api);
          api.codeLock({
            icon: "🚪🔢",
            text: "Døren til gården har en kodelås med 2 tal.",
            length: 2,
            answer: "43",
            onSolve() {
              api.close();
              api.goTo("yard");
            },
          });
        },
      },
    ],

    goal(api) {
      if (!api.flag("sneaked")) return "sneak";
      if (!api.flag("lockerOpen")) return "locker";
      if (!api.flag("distracted") && !api.has("radio") && !api.has("radioOn")) return "radio";
      if (!api.flag("distracted") && !api.has("radioOn")) return "combine";
      if (!api.flag("distracted")) return "distract";
      if (!api.flag("logbookRead")) return "logbook";
      return "door";
    },
    hints: {
      sneak: ["Se på vagtens lyskegle. Når lyset er på dig, kan han se dig.", "Klik på kasserne, lige når vagten kigger mod højre."],
      locker: ["Det blå skab har en dyre-lås.", "🐭 først og 🐰 sidst. Hvor skal 🐱 så stå?", "Rækkefølgen er 🐭 🐶 🐱 🐰."],
      radio: ["Der står noget på hylden til venstre.", "Tag radioen fra hylden."],
      combine: ["Radioen mangler noget for at virke.", "Klik på 📻 og derefter på 🔋 i rygsækken."],
      distract: ["Vagten ved skrivebordet elsker musik.", "Brug radioen der virker 📻🎵 på vagten ved skrivebordet."],
      logbook: ["Nu er skrivebordet frit. Læs logbogen."],
      door: ["🐭 + 🐭 = 8, så er 🐭 = 4.", "🧀 = 🐭 − 1 = 3.", "Koden er 4 og 3: 43."],
    },
  });
})();
