// Game: Nissernes værksted (Christmas, normal+, 4 rooms)
// Room 1 Værkstedet:   Lise's wish list -> toolbox (🧸🚂🤖) -> crank -> toy machine makes 3 toys (+ wooden reindeer)
//                      wreath bells (4) + snow globe (7) + toys (3) -> door 473
// Room 2 Pakkerummet:  candy scale (4 + 6 = 10) -> candy cane; name tags logic -> gifts roll away -> broom
//                      broom + candy cane = hook -> key behind the shelf -> door
// Room 3 Stalden:      stable book -> reindeer names in stalls -> sleigh bells; hay -> carrot -> calf moves
//                      bells on the door -> play "jingle all the way" (E G C D E)
// Room 4 Garagen:      delivery minigame -> 3 1 2; Pjok in the sack wants a gift -> wooden reindeer -> ignition key
//                      ignition code = 312 + number of reindeer (4) = 3124 -> lift off
(() => {
  const G = Game.define("xmas", {
    title: "Nissernes værksted",
    emoji: "🎄",
    difficulty: 3,
    minutes: 35,
    accent: "#e8b04a",
    theme: "xmas",
    isNew: true,
    ux: { notebook: true, fx: true, itemLabels: true, progress: true },
    fxChars: ["✨", "⭐", "❄️", "✨"],
    winEmoji: "🎅🛷✨",
    tagline: "Drillenissen Pjok har låst julemandens værksted – og det er juleaften! Få slæden af sted i tide.",
    story: `<p>Det er <b>juleaften</b>, og du er den nyeste nisselærling på julemandens værksted. 🎅</p>
            <p>Men i nat har drillenissen <b>Pjok</b> låst alle døre, gemt nøglerne og rodet med det hele! Kom gennem værkstedet, pakkerummet og rensdyrstalden – og få slæden ud af garagen inden midnat. Ellers bliver der ingen gaver i år! 🎁</p>
            <p class="small-text">📓 Nyt: Vigtige spor skrives automatisk i din <b>notesbog</b>. Og så skal du bestå julemandens <b>leveringsprøve</b>!</p>`,
    winTitle: "Glædelig jul!",
    // "Jingle Bells" chorus (public domain), soft bell sound
    music: {
      notes: [659, 659, 659, 0, 659, 659, 659, 0, 659, 784, 523, 587, 659, 0, 0, 0,
              698, 698, 698, 698, 698, 659, 659, 659, 659, 587, 587, 659, 587, 0, 784, 0,
              659, 659, 659, 0, 659, 659, 659, 0, 659, 784, 523, 587, 659, 0, 0, 0,
              698, 698, 698, 698, 698, 659, 659, 659, 784, 784, 698, 587, 523, 0, 0, 0],
      ms: 230, wave: "sine", bass: 131,
    },
  });

  G.item("crank", "⚙️", "håndsving");
  G.item("woodDeer", "🦌", "træ-rensdyr");
  G.item("candy", "🍬", "sukkerstang");
  G.item("broom", "🧹", "kost");
  G.item("hook", "🧹🍬", "kost med krog");
  G.item("stableKey", "🗝️", "staldnøgle");
  G.item("bells", "🔔", "bjældekrans");
  G.item("carrot", "🥕", "gulerod");
  G.item("ignition", "🔑", "tændingsnøgle");
  G.recipe("broom", "candy", "hook", "Du binder sukkerstangen fast på kosteskaftet.<br>Nu har du en <b>lang krog</b>, der kan nå langt ind bag ting!");

  // =========================================================
  // Shared drawing
  // =========================================================
  const DEFS = `<defs>
    <linearGradient id="xNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c1638"/><stop offset="1" stop-color="#2c3f7a"/></linearGradient>
    <radialGradient id="xWarm"><stop offset="0" stop-color="#ffcf7a" stop-opacity=".55"/><stop offset="1" stop-color="#ff9a3a" stop-opacity="0"/></radialGradient>
    <linearGradient id="xRed" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8403a"/><stop offset="1" stop-color="#9c1f22"/></linearGradient>
    <linearGradient id="xGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe9a0"/><stop offset=".5" stop-color="#e3b04a"/><stop offset="1" stop-color="#a97a1e"/></linearGradient>
    <linearGradient id="xGreen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f7d48"/><stop offset="1" stop-color="#1c5230"/></linearGradient>
    <radialGradient id="xGlass" cx=".35" cy=".3"><stop offset="0" stop-color="#ffffff" stop-opacity=".9"/><stop offset=".35" stop-color="#d9f0ff" stop-opacity=".35"/><stop offset="1" stop-color="#9cc8ee" stop-opacity=".25"/></radialGradient>
    <pattern id="xLogs" width="400" height="64" patternUnits="userSpaceOnUse">
      <rect width="400" height="64" fill="#7a4a2a"/><rect y="4" width="400" height="56" rx="28" fill="#8e5a33"/>
      <path d="M0 22 Q100 14 200 22 T400 22 M0 42 Q120 50 240 42 T400 42" stroke="#7a4a2a" stroke-width="2" fill="none" opacity=".6"/>
      <ellipse cx="398" cy="32" rx="10" ry="26" fill="#b07a4a"/><ellipse cx="398" cy="32" rx="5" ry="14" fill="#8e5a33"/>
    </pattern>
    <pattern id="xPlanks" width="260" height="44" patternUnits="userSpaceOnUse">
      <rect width="260" height="44" fill="#a8693a"/><rect width="130" height="22" fill="#9c6034"/><rect x="130" y="22" width="130" height="22" fill="#b0723f"/>
      <path d="M0 22 H260 M0 44 H260 M130 0 V22 M60 22 V44 M190 22 V44" stroke="#7a4a24" stroke-width="2"/>
    </pattern>
    <pattern id="xStripes" width="60" height="60" patternUnits="userSpaceOnUse">
      <rect width="60" height="60" fill="#f6ead6"/><rect width="22" height="60" fill="#c8453e"/><rect x="26" width="4" height="60" fill="#e6b04a"/>
    </pattern>
    <pattern id="xBarn" width="70" height="200" patternUnits="userSpaceOnUse">
      <rect width="70" height="200" fill="#8a4f2c"/><rect x="2" width="66" height="200" fill="#9a5b33"/>
      <circle cx="35" cy="40" r="3" fill="#5a3420"/><circle cx="35" cy="160" r="3" fill="#5a3420"/>
    </pattern>
    <pattern id="xStraw" width="80" height="30" patternUnits="userSpaceOnUse">
      <rect width="80" height="30" fill="#b58a45"/><path d="M5 25 l20 -8 M30 10 l25 6 M50 26 l20 -10 M10 8 l18 4" stroke="#d9b060" stroke-width="3"/>
    </pattern>
    <pattern id="xStone" width="160" height="80" patternUnits="userSpaceOnUse">
      <rect width="160" height="80" fill="#5c5560"/><rect x="3" y="3" width="74" height="34" rx="6" fill="#6a636e"/><rect x="83" y="3" width="74" height="34" rx="6" fill="#655e69"/>
      <rect x="43" y="43" width="74" height="34" rx="6" fill="#6e6772"/><rect x="-37" y="43" width="74" height="34" rx="6" fill="#625b66"/><rect x="123" y="43" width="74" height="34" rx="6" fill="#625b66"/>
    </pattern>
  </defs>`;

  // Points on a quadratic curve
  const qpt = (x1, y1, cx, cy, x2, y2, t) => [(1 - t) ** 2 * x1 + 2 * (1 - t) * t * cx + t * t * x2, (1 - t) ** 2 * y1 + 2 * (1 - t) * t * cy + t * t * y2];
  const BULB = ["#ff5a5a", "#ffd23a", "#5ad66a", "#5ab4ff", "#ff8ad8"];

  function lights(x1, x2, y, sag = 40, n = 12) {
    const cx = (x1 + x2) / 2, cy = y + sag;
    let out = `<path d="M${x1} ${y} Q${cx} ${cy + sag} ${x2} ${y}" stroke="#1c2a1c" stroke-width="3" fill="none"/>`;
    for (let i = 1; i < n; i++) {
      const [x, yy] = qpt(x1, y, cx, cy + sag, x2, y, i / n);
      const c = BULB[i % BULB.length];
      out += `<g class="x-bulb" style="animation-delay:-${(i * 0.37).toFixed(2)}s"><circle cx="${x}" cy="${yy + 12}" r="16" fill="${c}" opacity=".25"/><ellipse cx="${x}" cy="${yy + 12}" rx="6" ry="9" fill="${c}"/></g><rect x="${x - 4}" y="${yy}" width="8" height="6" fill="#333"/>`;
    }
    return out;
  }

  function garland(x1, x2, y) {
    const w = x2 - x1, n = Math.max(2, Math.round(w / 400));
    let path = `M${x1} ${y}`;
    for (let i = 0; i < n; i++) {
      const a = x1 + (w * i) / n, b = x1 + (w * (i + 1)) / n;
      path += ` Q${(a + b) / 2} ${y + 60} ${b} ${y}`;
    }
    let bows = "";
    for (let i = 0; i <= n; i++) {
      const bx = x1 + (w * i) / n;
      bows += `<g transform="translate(${bx} ${y})"><path d="M0 0 l-22 -12 v24 z M0 0 l22 -12 v24 z" fill="#c8302c"/><circle r="6" fill="#e04640"/><path d="M-4 4 l-8 26 M4 4 l8 26" stroke="#c8302c" stroke-width="6"/></g>`;
    }
    return `<path d="${path}" stroke="#1d4d2c" stroke-width="30" fill="none" stroke-linecap="round"/>
      <path d="${path}" stroke="#2f7a45" stroke-width="20" fill="none" stroke-dasharray="6 9" stroke-linecap="round"/>${bows}`;
  }

  function snowyWindow(id, x, y, w, h) {
    let flakes = "";
    for (let i = 0; i < 22; i++) {
      const fx = x + ((i * 53) % w), dur = 4 + (i % 5) * 0.9, del = -(i * 0.7) % dur;
      flakes += `<circle class="x-snow" cx="${fx}" cy="${y + ((i * 37) % 40)}" r="${2 + (i % 3)}" fill="#fff" opacity=".9" style="animation-duration:${dur}s;animation-delay:${del}s"/>`;
    }
    return `<defs><clipPath id="win${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10"/></clipPath></defs>
      <rect x="${x - 16}" y="${y - 16}" width="${w + 32}" height="${h + 32}" rx="14" fill="#5a331c"/>
      <g clip-path="url(#win${id})">
        <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#xNight)"/>
        <circle cx="${x + w * 0.75}" cy="${y + h * 0.25}" r="20" fill="#fff6d8"/><circle cx="${x + w * 0.75}" cy="${y + h * 0.25}" r="50" fill="#fff6d8" opacity=".15"/>
        <path d="M${x} ${y + h * 0.78} Q${x + w * 0.3} ${y + h * 0.6} ${x + w * 0.6} ${y + h * 0.75} T${x + w} ${y + h * 0.7} V${y + h} H${x} Z" fill="#e8f0ff"/>
        <path d="M${x + w * 0.2} ${y + h * 0.72} l20 -40 l20 40 z M${x + w * 0.62} ${y + h * 0.76} l16 -32 l16 32 z" fill="#1f4a32"/>
        ${flakes}
      </g>
      <path d="M${x + w / 2} ${y} V${y + h} M${x} ${y + h / 2} H${x + w}" stroke="#5a331c" stroke-width="12"/>
      <path d="M${x} ${y + 30} q20 -10 30 -30 M${x + w} ${y + 30} q-20 -10 -30 -30" stroke="#fff" stroke-width="6" opacity=".55" fill="none"/>
      <rect x="${x - 26}" y="${y + h + 10}" width="${w + 52}" height="18" rx="6" fill="#6a3e22"/><path d="M${x - 20} ${y + h + 12} q${(w + 40) / 2} -14 ${w + 40} 0" fill="#fff"/>`;
  }

  function candle(x, y, s = 1) {
    return `<g transform="translate(${x} ${y}) scale(${s})">
      <circle cx="0" cy="-12" r="40" fill="url(#xWarm)"/>
      <rect x="-9" y="0" width="18" height="46" rx="3" fill="#f4ecd8"/><path d="M-9 4 q9 6 18 0" stroke="#d9cdb2" stroke-width="2" fill="none"/>
      <ellipse class="x-flame" cx="0" cy="-8" rx="6" ry="11" fill="#ffcc4d"/><ellipse cx="0" cy="-5" rx="3" ry="5" fill="#fff6c0"/>
    </g>`;
  }

  function gift(x, y, w, h, c, rib = "#ffd23a") {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${c}" stroke="rgba(0,0,0,.25)" stroke-width="2"/>
      <rect x="${x + w / 2 - 5}" y="${y}" width="10" height="${h}" fill="${rib}"/><rect x="${x}" y="${y + h / 2 - 5}" width="${w}" height="10" fill="${rib}"/>
      <path d="M${x + w / 2} ${y} q-18 -18 -22 -4 q4 8 22 4 q18 -18 22 -4 q-4 8 -22 4" fill="${rib}" stroke="rgba(0,0,0,.2)" stroke-width="1.5"/>`;
  }

  function tree(x, y, s = 1) {
    const orn = [[-40, -90, "#e04640"], [30, -120, "#ffd23a"], [-15, -170, "#5ab4ff"], [45, -60, "#ff8ad8"], [-55, -40, "#ffd23a"], [10, -210, "#e04640"], [0, -60, "#5ab4ff"]];
    return `<g transform="translate(${x} ${y}) scale(${s})">
      ${Art.shadow(0, 0, 90)}
      <rect x="-14" y="-30" width="28" height="30" fill="#6a3e22"/>
      <path d="M-100 -30 L0 -150 L100 -30 Z M-80 -110 L0 -220 L80 -110 Z M-60 -180 L0 -280 L60 -180 Z" fill="url(#xGreen)"/>
      <path d="M-80 -45 Q0 -20 80 -60 M-60 -125 Q0 -100 60 -140" stroke="#ffd23a" stroke-width="3" fill="none" opacity=".8"/>
      ${orn.map(([ox, oy, c], i) => `<circle cx="${ox}" cy="${oy}" r="9" fill="${c}"/><circle cx="${ox - 3}" cy="${oy - 3}" r="3" fill="#fff" opacity=".7"/>`).join("")}
      <g class="x-glow">${Art.star(0, -290, 22, "#ffe066")}</g>
    </g>`;
  }

  // Pjok, the mischievous elf. Feet at (x, y)
  function pjok(x, y, s = 1, mood = "grin") {
    const mouth = mood === "sad" ? `<path d="M-12 -98 q12 -8 24 0" stroke="#7a2a2a" stroke-width="3" fill="none"/>`
      : mood === "happy" ? `<path d="M-14 -102 q14 16 28 0 z" fill="#7a2a2a"/>`
      : `<path d="M-14 -102 q10 12 28 -2" stroke="#7a2a2a" stroke-width="3" fill="none"/>`;
    const brows = mood === "grin" ? `<path d="M-18 -126 l10 4 M18 -126 l-10 4" stroke="#5a3a1a" stroke-width="3"/>` : "";
    return `<g transform="translate(${x} ${y}) scale(${s})">
      ${Art.shadow(0, 0, 34)}
      <path d="M-16 -40 v34 M16 -40 v34" stroke="#e53935" stroke-width="12"/><path d="M-16 -32 v6 M-16 -18 v6 M16 -32 v6 M16 -18 v6" stroke="#fff" stroke-width="12"/>
      <path d="M-26 -4 q-14 2 -16 -10 M26 -4 q14 2 16 -10" stroke="#3a2a1a" stroke-width="10" stroke-linecap="round" fill="none"/>
      <path d="M-30 -40 L-24 -78 H24 L30 -40 Z" fill="#2e7d32"/><rect x="-30" y="-50" width="60" height="8" fill="#3a2a1a"/><rect x="-6" y="-52" width="12" height="12" rx="2" fill="#ffd23a"/>
      <circle cx="0" cy="-108" r="28" fill="#f6c9a0"/>
      <path d="M-26 -112 l-22 -14 l14 22 z M26 -112 l22 -14 l-14 22 z" fill="#f6c9a0"/>
      <circle cx="-16" cy="-100" r="6" fill="#f59a9a" opacity=".7"/><circle cx="16" cy="-100" r="6" fill="#f59a9a" opacity=".7"/>
      ${mood === "sleep" ? "" : `<circle cx="-10" cy="-114" r="4" fill="#222"/><circle cx="10" cy="-114" r="4" fill="#222"/>`}
      ${brows}${mouth}
      <path d="M-28 -124 Q0 -150 28 -124 Q30 -170 70 -150 Q40 -150 20 -130 Z" fill="#e53935"/>
      <rect x="-30" y="-130" width="60" height="10" rx="5" fill="#fff"/><circle cx="72" cy="-150" r="9" fill="#ffd23a"/>
    </g>`;
  }

  // Reindeer standing, facing right. Feet at (x, y). opts: antlers (size), scarf, sleep, happy, small
  function reindeer(x, y, s = 1, o = {}) {
    const a = o.antlers || 1;
    const head = o.sleep ? [70, -118] : [82, -168];
    const eye = o.sleep ? `<path d="M${head[0] + 2} ${head[1] - 6} q6 4 12 0" stroke="#222" stroke-width="3" fill="none"/>` : `<circle cx="${head[0] + 8}" cy="${head[1] - 6}" r="5" fill="#222"/><circle cx="${head[0] + 9.5}" cy="${head[1] - 7.5}" r="1.8" fill="#fff"/>`;
    const antler = (dir) => `<path d="M${head[0] - 6} ${head[1] - 22} q${-10 * dir} ${-40 * a} ${-30 * dir * a} ${-60 * a} M${head[0] - 6 - 12 * dir * a} ${head[1] - 50 * a} q${-24 * dir * a} ${-6 * a} ${-34 * dir * a} ${-22 * a} M${head[0] - 6 - 4 * dir * a} ${head[1] - 38 * a} q${16 * dir * a} ${-20 * a} ${12 * dir * a} ${-36 * a}" stroke="#d8c09a" stroke-width="${6 + a * 2}" fill="none" stroke-linecap="round"/>`;
    return `<g transform="translate(${x} ${y}) scale(${s})" class="${o.happy ? "x-pop" : ""}">
      ${Art.shadow(0, 0, 80)}
      <g class="x-breathe">
        ${[-50, -25, 30, 55].map((lx) => `<rect x="${lx - 7}" y="-70" width="14" height="70" rx="6" fill="#6a4128"/><rect x="${lx - 8}" y="-8" width="16" height="10" rx="3" fill="#2a1a10"/>`).join("")}
        <ellipse cx="0" cy="-88" rx="78" ry="38" fill="#8a5a36"/>
        <ellipse cx="-10" cy="-74" rx="58" ry="18" fill="#c9a27a"/>
        <path d="M-78 -96 q-16 -10 -10 -24 q10 6 14 18" fill="#f2e6d6"/>
        <path d="M46 -110 Q${head[0] - 20} ${head[1] + 30} ${head[0] - 6} ${head[1] + 6}" stroke="#8a5a36" stroke-width="34" fill="none" stroke-linecap="round"/>
        ${antler(1)}${antler(-0.6)}
        <ellipse cx="${head[0]}" cy="${head[1]}" rx="30" ry="22" fill="#8a5a36"/>
        <ellipse cx="${head[0] + 24}" cy="${head[1] + 8}" rx="16" ry="12" fill="#c9a27a"/><ellipse cx="${head[0] + 36}" cy="${head[1] + 5}" rx="7" ry="6" fill="#2a1a10"/>
        <path d="M${head[0] - 18} ${head[1] - 16} l-16 -10 l6 16 z" fill="#6a4128"/>
        ${eye}
        ${o.scarf ? `<path d="M40 -120 Q60 -96 84 -112 L86 -98 Q60 -82 36 -104 Z" fill="#e53935"/><path d="M70 -100 l8 34 l10 -2 l-6 -34 z" fill="#c62828"/><path d="M74 -76 h12" stroke="#fff" stroke-width="3"/>` : ""}
        ${o.blanket ? `<path d="M-46 -120 h80 v40 h-80 z" fill="#2e6b9e" opacity=".9"/><text x="-6" y="-92" text-anchor="middle" font-size="22">❤️</text>` : ""}
      </g>
      ${o.sleep ? `<text x="${head[0] + 20}" y="${head[1] - 40}" font-size="30" class="x-bob">💤</text>` : ""}
    </g>`;
  }

  // Reindeer calf lying down (or standing when moved)
  function calf(x, y, s = 1, standing = false) {
    if (standing) return reindeer(x, y, s * 0.6, { antlers: 0.25, happy: false });
    return `<g transform="translate(${x} ${y}) scale(${s})">
      ${Art.shadow(0, 0, 70)}
      <ellipse cx="0" cy="-30" rx="62" ry="28" fill="#9a6a42"/><ellipse cx="-6" cy="-20" rx="44" ry="12" fill="#d8b48a"/>
      <circle cx="-30" cy="-40" r="5" fill="#f2e6d6"/><circle cx="-10" cy="-48" r="4" fill="#f2e6d6"/><circle cx="12" cy="-42" r="5" fill="#f2e6d6"/>
      <path d="M40 -40 q20 -30 30 -40" stroke="#9a6a42" stroke-width="24" stroke-linecap="round" fill="none"/>
      <ellipse cx="80" cy="-84" rx="22" ry="17" fill="#9a6a42"/><ellipse cx="98" cy="-78" rx="10" ry="8" fill="#d8b48a"/><circle cx="106" cy="-80" r="4" fill="#2a1a10"/>
      <path d="M74 -96 q-4 -14 -12 -18 M84 -98 q4 -14 12 -16" stroke="#d8c09a" stroke-width="5" stroke-linecap="round" fill="none"/>
      <path d="M78 -88 q6 4 12 0" stroke="#222" stroke-width="3" fill="none"/>
      <text x="100" y="-108" font-size="24" class="x-bob">💭🥕</text>
    </g>`;
  }

  function sleigh(x, y, s = 1, lit = false) {
    return `<g transform="translate(${x} ${y}) scale(${s})">
      ${Art.shadow(300, 10, 330, 30)}
      ${lit ? `<circle cx="300" cy="-120" r="320" fill="url(#xWarm)" class="x-glow"/>` : ""}
      <path d="M-20 0 H560 Q640 0 640 -60 Q640 -96 604 -92" stroke="url(#xGold)" stroke-width="14" fill="none" stroke-linecap="round"/>
      <path d="M60 0 v-50 M200 0 v-50 M380 0 v-50 M500 0 v-50" stroke="url(#xGold)" stroke-width="10"/>
      <path d="M0 -50 H540 Q600 -60 600 -140 Q600 -190 560 -200 Q540 -150 480 -150 H120 Q60 -150 40 -230 Q-20 -240 -20 -170 Q-20 -60 0 -50 Z" fill="url(#xRed)" stroke="#6e1418" stroke-width="5"/>
      <path d="M30 -70 H540 Q580 -80 580 -130" stroke="url(#xGold)" stroke-width="6" fill="none"/>
      <path d="M100 -110 q40 -30 80 0 t80 0 t80 0 t80 0" stroke="url(#xGold)" stroke-width="4" fill="none"/>
      <path d="M40 -150 Q30 -230 -10 -220" stroke="url(#xGold)" stroke-width="6" fill="none"/>
      <rect x="120" y="-200" width="300" height="56" rx="20" fill="#2e6b3f"/>
      ${lit ? `<circle cx="590" cy="-120" r="12" fill="#ffd86b"/><circle cx="590" cy="-120" r="40" fill="#ffd86b" opacity=".3"/>` : ""}
    </g>`;
  }

  // Wreath with 4 golden bells (one partly hidden behind the bow). Center (cx, cy)
  function wreath(cx, cy, r, ringing) {
    let leaves = "";
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2, lx = cx + Math.cos(a) * r, ly = cy + Math.sin(a) * r;
      leaves += `<ellipse cx="${lx}" cy="${ly}" rx="${r * 0.32}" ry="${r * 0.15}" transform="rotate(${(a * 180) / Math.PI + 60} ${lx} ${ly})" fill="${i % 2 ? "#2a6b3c" : "#1f5530"}"/>`;
    }
    const berries = [0.3, 1.2, 2.2, 3.4, 4.1, 5.3].map((a) => `<circle cx="${cx + Math.cos(a) * r * 0.95}" cy="${cy + Math.sin(a) * r * 0.95}" r="${r * 0.09}" fill="#e53935"/>`).join("");
    const bell = (bx, by, sz) => `<g class="${ringing ? "x-ring" : ""}"><path d="M${bx} ${by - sz} q${sz * 0.9} 0 ${sz * 0.9} ${sz * 1.1} l${sz * 0.25} ${sz * 0.3} h${-sz * 2.3} l${sz * 0.25} ${-sz * 0.3} q0 ${-sz * 1.1} ${sz * 0.9} ${-sz * 1.1} z" fill="url(#xGold)" stroke="#8a6214" stroke-width="2"/><circle cx="${bx}" cy="${by + sz * 0.55}" r="${sz * 0.22}" fill="#8a6214"/></g>`;
    return `${leaves}${berries}
      ${bell(cx - r * 0.98, cy + r * 0.2, r * 0.22)}
      ${bell(cx + r * 0.7, cy - r * 0.62, r * 0.18)}
      ${bell(cx - r * 0.5, cy + r * 1.02, r * 0.24)}
      ${bell(cx + r * 0.62, cy + r * 0.95, r * 0.24)}
      <g transform="translate(${cx + r * 0.08} ${cy + r * 0.95})"><path d="M0 0 l-${r * 0.5} -${r * 0.25} v${r * 0.5} z M0 0 l${r * 0.5} -${r * 0.25} v${r * 0.5} z" fill="#c8302c"/><circle r="${r * 0.12}" fill="#e04640"/><path d="M-4 6 l-${r * 0.2} ${r * 0.5} M4 6 l${r * 0.2} ${r * 0.5}" stroke="#c8302c" stroke-width="${r * 0.1}"/></g>`;
  }

  const paperNote = (x, y, w, h, rot, inner) => `<g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fffaf0" stroke="#d8c8a0" stroke-width="2"/>${inner}
    <circle cx="${x + w / 2}" cy="${y + 8}" r="6" fill="#e53935"/></g>`;

  // Pjok peeking from several hiding places. positions: [[x, y, s], ...]
  const peekLayer = (positions) => positions.map(([x, y, s], i) => `<g class="pjok-peek p${i}">${pjok(x, y, s)}<text x="${x + 40 * s}" y="${y - 170 * s}" font-size="${28 * s}" font-weight="bold" fill="#fff" stroke="#3a1a10" stroke-width="1">Hihi!</text></g>`).join("");

  // Pjok peeks now and then (toggled with a class on #scene, so no re-render)
  function startPeeks(api, count) {
    let last = -1;
    api.every(17000, () => {
      if (api.modalOpen()) return;
      const scene = document.getElementById("scene");
      let i = Math.floor(Math.random() * count);
      if (i === last) i = (i + 1) % count;
      last = i;
      scene.classList.remove("peek-0", "peek-1", "peek-2");
      void scene.offsetWidth;
      scene.classList.add("peek-" + i);
      api.sound("click");
      api.later(2700, () => scene.classList.remove("peek-" + i));
    });
  }
  const pjokTeases = ["😈 <b>Pjok:</b> Hihi! Du finder aldrig ud herfra!", "😈 <b>Pjok:</b> Fang mig, hvis du kan, lille nisse!", "😈 <b>Pjok:</b> Ingen gaver i år! Hehe!", "😈 <b>Pjok:</b> Jeg er hurtigere end dig!"];
  const pjokObject = (positions) => ({
    id: "pjokPeek",
    label: "Pjok!",
    draw: () => peekLayer(positions),
    click(api) { api.sound("bell"); api.say(pjokTeases[Math.floor(Math.random() * pjokTeases.length)]); },
  });

  const roomBase = (wall, floor) => `${DEFS}
    <rect width="1600" height="680" fill="${wall}"/>
    <rect y="0" width="1600" height="70" fill="#4a2a16"/>${[120, 520, 920, 1320].map((x) => `<rect x="${x}" y="0" width="40" height="80" fill="#3a2010"/>`).join("")}
    <rect y="660" width="1600" height="240" fill="${floor}"/><rect y="660" width="1600" height="240" fill="url(#floorShade)"/>
    <rect y="652" width="1600" height="14" fill="#4a2a16"/>`;

  // =========================================================
  // ROOM 1: Workshop
  // =========================================================
  const TOYS = [["🚂", 760], ["🧸", 700], ["🦌", 640]];
  G.room({
    id: "workshop",
    title: "Værkstedet",
    intro: "Julemandens værksted! Men alt står stille, og døren er låst... Pjok har været her. 😈 Undersøg alt!",
    particles: { type: "dust", count: 26, color: "#ffe2a8" },
    enter: (api) => startPeeks(api, 3),
    background: () => `${roomBase("url(#xLogs)", "url(#xPlanks)")}
      <ellipse cx="820" cy="800" rx="420" ry="70" fill="#9c2a2a" opacity=".85"/><ellipse cx="820" cy="800" rx="380" ry="56" fill="none" stroke="#e6b04a" stroke-width="5" stroke-dasharray="14 10"/>
      ${snowyWindow("w1", 1210, 150, 250, 230)}
      ${garland(0, 1600, 86)}${lights(0, 1600, 96, 30, 22)}
      <rect x="1180" y="560" width="380" height="26" rx="6" fill="#6e4222"/><rect x="1190" y="584" width="360" height="90" fill="#5a3418"/>
      <rect x="1200" y="598" width="100" height="62" rx="4" fill="#6e4222"/><rect x="1440" y="598" width="100" height="62" rx="4" fill="#6e4222"/>
      ${candle(1250, 352, 0.8)}`,
    objects: [
      {
        id: "door", label: "Dør til pakkerummet",
        draw: () => `
          <path d="M40 660 V300 Q145 200 250 300 V660 Z" fill="#2e6b3f" stroke="#1d4527" stroke-width="10"/>
          <path d="M70 640 V320 Q145 245 220 320 V640" stroke="#265a34" stroke-width="6" fill="none"/>
          <path d="M40 380 h40 M40 560 h40" stroke="#3a2a1a" stroke-width="12" stroke-linecap="round"/>
          ${paperNote(100, 330, 100, 90, -5, `<text x="150" y="365" text-anchor="middle" font-size="15" fill="#c62828" font-family="Comic Sans MS">HIHI!</text><text x="150" y="395" text-anchor="middle" font-size="24">🔔❄️🎁</text>`)}
          <rect x="190" y="470" width="44" height="60" rx="8" fill="#e3b04a" stroke="#8a6214" stroke-width="3"/><circle cx="212" cy="492" r="7" fill="#3a2a1a"/><rect x="209" y="494" width="6" height="18" fill="#3a2a1a"/>`,
        click(api) {
          api.note("pjokRhyme", "Pjoks seddel på døren", `<i>"Ring med kransen, ryst med sneen,<br>lad maskinen lave legetøj – så har du koden!"</i><br>Låsen: 🔔 ❄️ 🎁`);
          api.modal(`<div class="modal-icon">📜😈</div><p>På døren hænger en seddel med grim skrift:</p>
            <div class="clue-box"><i>"Ha! Jeg har låst døren med tre tegn. Hvert tegn er et tal:</i><br><b style="font-size:2rem">🔔 ❄️ 🎁</b><br><i>Ring med kransen, ryst med sneen, lad maskinen lave legetøj –<br>så har du koden! HIHI!"</i><br>— Pjok</div>
            <div class="row"><button class="action" id="tryCode">🔒 Prøv koden</button></div>`, (root) => root.querySelector("#tryCode").addEventListener("click", () => api.codeLock({
            icon: "🔒", text: "Kodelåsen på døren:", clue: `<div class="clue-row"><span>🔔</span><span>❄️</span><span>🎁</span></div>`, length: 3, answer: "473",
            onSolve() {
              if (!api.has("woodDeer")) api.give("woodDeer");
              api.later(500, () => api.goTo("wrapping"));
            },
          })));
        },
      },
      {
        id: "tree", label: "Juletræ",
        draw: (api) => `<g class="${api.just("treeShake") ? "x-shake" : ""}">${tree(400, 650, 1)}</g>
          ${gift(300, 600, 60, 50, "#2e6b9e")}${gift(440, 610, 50, 40, "#e53935", "#fff")}`,
        click(api) { api.set("treeShake"); api.sound("bell"); api.say("🎄 Juletræet glimter. Pakkerne under det er tomme kasser – til pynt."); },
      },
      {
        id: "wreath", label: "Krans med bjælder",
        draw: (api) => `<circle cx="400" cy="215" r="90" fill="transparent"/>${wreath(400, 215, 64, api.just("ring"))}`,
        click(api) {
          api.set("ring");
          api.sound("bell");
          api.modal(`<div class="modal-icon">🔔</div><p><b>Kling-klang!</b> Kransen ringer, når du rører den.</p>
            <svg viewBox="270 110 260 270" width="260" height="260">${DEFS}${wreath(400, 230, 80, false)}</svg>
            <p class="small-text">Hvor mange bjælder hænger der på kransen? Kig godt efter!</p>`);
        },
      },
      {
        id: "wishes", label: "Ønskesedler",
        draw: () => `
          <rect x="560" y="175" width="230" height="200" rx="8" fill="#b58a5a" stroke="#6e4222" stroke-width="8"/>
          <text x="675" y="168" text-anchor="middle" font-size="22" font-weight="bold" fill="#ffe3a3" font-family="Georgia">ØNSKESEDLER</text>
          ${paperNote(578, 193, 80, 100, -6, `<path d="M588 215 h55 M588 230 h45 M588 245 h55 M588 260 h35" stroke="#7a7a9a" stroke-width="3"/><text x="618" y="285" text-anchor="middle" font-size="14">🧸🚂🤖</text>`)}
          ${paperNote(666, 203, 70, 90, 4, `<path d="M676 225 h48 M676 240 h40 M676 255 h48" stroke="#7a7a9a" stroke-width="3"/><text x="701" y="280" text-anchor="middle" font-size="14">🎨</text>`)}
          ${paperNote(610, 297, 120, 66, 2, `<circle cx="640" cy="335" r="12" fill="#ffd23a"/><path d="M660 347 l14 -20 l14 20 z" fill="#2e7d32"/><path d="M690 335 h30" stroke="#7a7a9a" stroke-width="3"/>`)}`,
        click(api) {
          api.note("lise", "Lises ønskeseddel", "1. en bamse 🧸 &nbsp;2. et tog 🚂 &nbsp;3. en robot 🤖");
          api.modal(`<div class="modal-icon">✉️</div><p>Ønskesedler fra børn i hele verden. Én af dem er pinet fast med en stor rød nål:</p>
            <div class="clue-box" style="text-align:left;font-family:'Comic Sans MS',cursive">Kære julemand 🎅<br>Jeg har været sød i år. Jeg ønsker mig:<br><b>1. en bamse 🧸<br>2. et tog 🚂<br>3. en robot 🤖</b><br>Mange hilsner fra <b>Lise</b>, 7 år</div>
            <p class="small-text">De andre sedler ønsker sig malerkasser, fodbolde og meget mere.</p>`);
        },
      },
      {
        id: "machine", label: "Legetøjsmaskinen",
        draw: (api) => {
          const on = api.flag("machineOn");
          return `
            ${Art.shadow(985, 680, 200)}
            <rect x="590" y="600" width="270" height="26" rx="10" fill="#3a3a44"/>
            <rect x="590" y="604" width="270" height="18" rx="9" fill="none" stroke="#6a6a78" stroke-width="4" stroke-dasharray="20 20" class="${on ? "x-belt" : ""}"/>
            <circle cx="600" cy="613" r="14" fill="#555"/><circle cx="850" cy="613" r="14" fill="#555"/>
            <path d="M870 680 V320 Q870 280 910 280 H1060 Q1100 280 1100 320 V680 Z" fill="url(#xRed)" stroke="#6e1418" stroke-width="6"/>
            <path d="M900 280 L880 190 H1090 L1070 280 Z" fill="#b8862b" stroke="#6e4a10" stroke-width="5"/>
            <rect x="870" y="420" width="230" height="16" fill="url(#xGold)"/>
            <g transform="translate(940 360)"><g class="${on ? "x-spin" : ""}">${gearPath(0, 0, 42, 12, "url(#xGold)")}</g></g>
            <g transform="translate(1030 375)"><g class="${on ? "x-spin-rev" : ""}">${gearPath(0, 0, 28, 9, "#d9b45a")}</g></g>
            <circle cx="985" cy="520" r="34" fill="#fff8e6" stroke="#6e4a10" stroke-width="5"/>
            <path d="M985 520 L${on ? 1008 : 965} ${on ? 500 : 505}" stroke="#c62828" stroke-width="5" stroke-linecap="round"/>
            <rect x="870" y="580" width="40" height="70" fill="#2a2a33"/>
            <circle cx="1110" cy="520" r="14" fill="#333" stroke="#e3b04a" stroke-width="4"/>
            ${on ? `<path d="M1110 520 l40 -10" stroke="#9aa" stroke-width="10" stroke-linecap="round"/><circle cx="1152" cy="509" r="10" fill="#e3b04a"/>` : ""}
            ${on ? [0, 1, 2].map((i) => `<circle cx="${990 + i * 14}" cy="${170 - i * 30}" r="${14 + i * 6}" fill="#fff" opacity=".35" class="x-bob" style="animation-delay:-${i * 0.6}s"/>`).join("") : ""}
            <text x="985" y="320" text-anchor="middle" font-size="18" font-weight="bold" fill="#ffe3a3" font-family="Georgia">LEGETØJ</text>`;
        },
        click(api) {
          if (api.flag("machineOn")) return api.say("⚙️ Maskinen summer glad. Den har lavet <b>3</b> stykker legetøj til kurven.");
          api.modal(`<div class="modal-icon">🏭</div><p><b>Legetøjsmaskinen</b> står helt stille.<br>På siden er der et tomt hul, hvor <b>håndsvinget</b> skulle sidde.</p><p class="small-text">Pjok har vist gemt det...</p>`);
        },
        use(item, api) {
          if (item !== "crank" || api.flag("machineOn")) return false;
          api.take("crank");
          api.set("machineOn");
          api.sound("whoosh");
          api.say("⚙️ Du drejer håndsvinget... Maskinen hoster, fløjter og <b>starter</b>! 🎶");
          TOYS.forEach((_, i) => api.later(900 + i * 1300, () => { api.set("toy" + i); api.sound("item"); }));
          api.later(900 + 3 * 1300 + 300, () => {
            api.note("toys", "Legetøjsmaskinen", "Maskinen lavede <b>3</b> stykker legetøj: 🚂 🧸 🦌");
            api.say("🎁 Maskinen spyttede <b>3</b> stykker legetøj ud i kurven!");
          });
          return true;
        },
      },
      {
        id: "basket", label: "Legetøjskurv",
        draw: (api) => `
          ${TOYS.map(([e, x], i) => (api.flag("toy" + i) && !(i === 2 && api.has("woodDeer"))) ? `<text x="${522 + i * 38}" y="${604 - (i % 2) * 12}" font-size="42" class="${api.just("toy" + i) ? "x-roll" : ""}" style="--from:${300 - i * 38}px">${e}</text>` : "").join("")}
          ${Art.shadow(575, 680, 70)}
          <path d="M505 600 h140 l-14 76 h-112 z" fill="#c08a4a" stroke="#7a5228" stroke-width="4"/>
          <path d="M510 620 h130 M514 640 h122 M518 660 h114" stroke="#9a6a32" stroke-width="3"/>`,
        click(api) {
          if (!api.flag("toy0")) return api.say("🧺 En tom legetøjskurv. Maskinen skal vist fylde den.");
          if (api.flag("toy2") && !api.has("woodDeer") && !api.flag("deerTaken")) {
            api.set("deerTaken");
            api.give("woodDeer");
            return api.modal(`<div class="modal-icon">🦌</div><p>I kurven ligger et tog, en bamse og et lille, håndskåret <b>træ-rensdyr</b>.</p><p>Det er så sødt, at du putter det i din sæk. Det kan måske blive nyttigt...</p>`);
          }
          api.say("🧺 Kurven med legetøj fra maskinen.");
        },
      },
      {
        id: "globe", label: "Snekugle",
        draw: (api) => {
          const shaken = api.flag("globeShaken"), anim = api.just("globeShaken");
          let flakes = "";
          for (let i = 0; i < 26; i++) flakes += `<circle cx="${1265 + Math.cos(i * 2.3) * (8 + (i % 5) * 7)}" cy="${495 + Math.sin(i * 1.7) * (8 + (i % 4) * 8)}" r="3" fill="#fff"/>`;
          return `<g class="${anim ? "x-shake" : ""}">
            ${Art.shadow(1265, 560, 50)}
            <path d="M1225 560 h80 l-10 -30 h-60 z" fill="#6e4222" stroke="#4a2a16" stroke-width="3"/>
            <text x="1265" y="552" text-anchor="middle" font-size="18" font-weight="bold" fill="#ffe3a3" opacity="${shaken ? 1 : 0}">❄ 7</text>
            <circle cx="1265" cy="490" r="48" fill="#cfe8ff" opacity=".35"/>
            <path d="M1245 520 v-18 l20 -14 l20 14 v18 z" fill="#c62828"/><path d="M1240 504 l25 -20 l25 20" stroke="#fff" stroke-width="5" fill="none"/>
            <path d="M1225 522 q40 -10 80 0" stroke="#fff" stroke-width="6" fill="none"/>
            ${shaken ? (anim ? `<g class="x-swirl">${flakes}</g>` : "") : `<g opacity=".95">${flakes}<ellipse cx="1265" cy="512" rx="34" ry="12" fill="#fff"/></g>`}
            <circle cx="1265" cy="490" r="48" fill="url(#xGlass)" stroke="#fff" stroke-width="3" opacity=".9"/></g>`;
        },
        click(api) {
          if (api.flag("globeShaken")) return api.modal(`<div class="modal-icon">🔮</div><p>Under snekuglen står der med små guldbogstaver:</p><p class="big-emoji">❄️ = 7</p>`);
          api.set("globeShaken");
          api.sound("whoosh");
          api.say("🔮 Du ryster snekuglen... sneen hvirvler rundt!");
          api.later(1900, () => {
            api.note("globe", "Snekuglen", "Under snekuglen står: ❄️ = 7");
            api.modal(`<div class="modal-icon">🔮✨</div><p>Sneen lægger sig langsomt... Under snekuglen kan du nu læse med små guldbogstaver:</p><p class="big-emoji">❄️ = 7</p>`);
          });
        },
      },
      {
        id: "toolbox", label: "Værktøjskasse",
        draw: (api) => {
          const open = api.flag("toolboxOpen");
          return `${Art.shadow(1440, 560, 80)}
            <rect x="1370" y="500" width="150" height="60" rx="6" fill="#2e6b9e" stroke="#1a4a70" stroke-width="4"/>
            <g class="${api.just("toolboxOpen") ? "x-lid" : ""}" ${open && !api.just("toolboxOpen") ? 'transform="rotate(-35 1370 500)"' : ""}>
              <rect x="1366" y="482" width="158" height="22" rx="5" fill="#3a7fbf" stroke="#1a4a70" stroke-width="4"/>
              <path d="M1420 482 v-16 h50 v16" stroke="#1a4a70" stroke-width="7" fill="none"/>
            </g>
            ${open ? "" : `<rect x="1405" y="514" width="80" height="30" rx="5" fill="#fff8e6"/><text x="1445" y="536" text-anchor="middle" font-size="16">? ? ?</text>`}`;
        },
        click(api) {
          if (api.flag("toolboxOpen")) return api.say("🧰 Værktøjskassen er tom nu.");
          api.cycleLock({
            icon: "🧰", text: "Værktøjskassen har en lås med tre legetøjs-hjul.<br>På låget står:",
            clue: `<div class="clue-box"><i>"Kun den, der kender <b>Lises</b> ønsker i den rigtige rækkefølge,<br>må låne julemandens værktøj."</i></div>`,
            symbols: ["🚂", "🧸", "🤖", "🪀"], answer: ["🧸", "🚂", "🤖"], start: [0, 2, 3], button: "Åbn kassen",
            onSolve() {
              api.set("toolboxOpen");
              api.give("crank");
              api.modal(`<div class="modal-icon">🧰➜⚙️</div><p><b>Klik!</b> Låget springer op.<br>Indeni ligger et <b>håndsving</b> – det passer til en stor maskine!</p>`);
            },
          });
        },
      },
      {
        id: "window", label: "Vindue",
        draw: () => `<rect x="1210" y="150" width="250" height="230" fill="transparent"/>`,
        click: (api) => api.say("❄️ Det sner udenfor. Det er juleaften – julemanden skal af sted ved midnat!"),
      },
      pjokObject([[1120, 300, 0.9], [1520, 470, 0.8], [520, 560, 0.75]]),
    ],
    goal(api) {
      if (!api.flag("toolboxOpen")) return "toolbox";
      if (!api.flag("machineOn")) return "machine";
      if (!api.flag("globeShaken")) return "globe";
      return "door";
    },
    hints: {
      toolbox: ["Værktøjskassen på høvlebænken har en lås med legetøj.", "Læs ønskesedlerne på opslagstavlen – især Lises.", "Lises ønsker i rækkefølge: 🧸 🚂 🤖."],
      machine: ["Legetøjsmaskinen mangler noget for at kunne køre.", "Brug håndsvinget ⚙️ på legetøjsmaskinen."],
      globe: ["Pjoks rim siger: 'ryst med sneen'.", "Klik på snekuglen på høvlebænken."],
      door: ["Døren vil have 🔔 ❄️ 🎁. Hvert tegn er et tal.", "🔔 = bjælderne på kransen (tæl godt efter – én gemmer sig!), ❄️ = tallet under snekuglen, 🎁 = legetøj fra maskinen.", "4 bjælder, ❄️ 7 og 3 stykker legetøj: koden er 473."],
    },
  });

  function gearPath(cx, cy, r, teeth, fill) {
    let d = "";
    for (let i = 0; i < teeth * 2; i++) {
      const a1 = (Math.PI / teeth) * i, a2 = (Math.PI / teeth) * (i + 1), rr = i % 2 ? r : r * 1.2;
      d += `${i ? "L" : "M"}${(cx + rr * Math.cos(a1)).toFixed(1)} ${(cy + rr * Math.sin(a1)).toFixed(1)}L${(cx + rr * Math.cos(a2)).toFixed(1)} ${(cy + rr * Math.sin(a2)).toFixed(1)}`;
    }
    return `<path d="${d}Z" fill="${fill}" stroke="#6e4a10" stroke-width="3"/><circle cx="${cx}" cy="${cy}" r="${r * 0.32}" fill="#6e4a10"/>`;
  }

  // =========================================================
  // ROOM 2: Wrapping room
  // =========================================================
  const BAGS = [[2, "#e53935"], [3, "#43a047"], [4, "#1e88e5"], [6, "#fb8c00"]];
  const CONVEYOR_GIFTS = [["🚂", "#e53935", 760], ["🎨", "#43a047", 900], ["⚽", "#1e88e5", 1040]];

  // Interactive balance. The beam tilts toward the heavier side; pans always hang straight down.
  function scaleSvg(right) {
    const rw = right.reduce((s, i) => s + BAGS[i][0], 0);
    const ang = Math.max(-14, Math.min(14, (rw - 10) * 3));
    const bag = (x, kg, c, big) => {
      const w = big ? 34 : 18, h = big ? 60 : 38;
      return `<path d="M${x - w} 60 q0 ${-h + 4} ${w} ${-h} q${w} 4 ${w} ${h} z" fill="${c}" stroke="rgba(0,0,0,.3)" stroke-width="2"/>
        <text x="${x}" y="${big ? 42 : 50}" text-anchor="middle" font-size="${big ? 17 : 12}" font-weight="bold" fill="#fff">${kg}</text>`;
    };
    const pan = (x, items) => `<g transform="translate(${x} 0)">
      <g style="transform:rotate(${-ang}deg);transition:transform .6s cubic-bezier(.3,1.5,.5,1)">
        <path d="M-50 60 L0 0 L50 60" stroke="#8a6214" stroke-width="3" fill="none"/>${items}
        <path d="M-62 60 h124 q-10 26 -62 26 q-52 0 -62 -26 z" fill="url(#xGold)" stroke="#8a6214" stroke-width="3"/>
      </g></g>`;
    const rightItems = right.map((i, k) => bag(-34 + k * 34, BAGS[i][0] + "kg", BAGS[i][1], false)).join("");
    const balanced = rw === 10;
    return `<svg viewBox="0 0 460 320" width="100%" style="max-width:440px">${DEFS}
      <rect x="218" y="96" width="24" height="190" fill="#6e4222"/><rect x="150" y="280" width="160" height="22" rx="8" fill="#5a3418"/>
      <g transform="translate(230 96)"><g style="transform:rotate(${ang}deg);transition:transform .6s cubic-bezier(.3,1.5,.5,1)">
        <rect x="-160" y="-6" width="320" height="12" rx="6" fill="url(#xGold)" stroke="#8a6214" stroke-width="2"/>
        ${pan(-140, bag(0, "10 kg", "#7b1fa2", true))}
        ${pan(140, rightItems)}
      </g></g>
      <circle cx="230" cy="96" r="12" fill="url(#xGold)" stroke="#8a6214" stroke-width="3"/>
      <path d="M230 70 v-14" stroke="${balanced ? "#2e7d32" : "#c62828"}" stroke-width="5"/>
      <text x="90" y="34" text-anchor="middle" font-size="16" fill="#5a3a10">Venstre: <tspan font-weight="bold">10 kg</tspan></text>
      <text x="370" y="34" text-anchor="middle" font-size="16" fill="${balanced ? "#2e7d32" : "#5a3a10"}">Højre: <tspan font-weight="bold">${rw} kg</tspan></text>
    </svg>`;
  }

  function scalePuzzle(api) {
    if (api.flag("scaleSolved")) return api.say("⚖️ Vægten står helt lige. Godt vejet!");
    let right = [];
    api.modal(`<div class="modal-icon">⚖️🍬</div><p><b>Slikvægten</b>: <i>"Kun nisser, der kan få vægten til at stå helt lige, får en sukkerstang!"</i><br>Læg slikposer på højre side.</p>
      <div id="scaleView"></div>
      <div class="row" id="bagRow">${BAGS.map(([kg, c], i) => `<button class="choice bag-btn" data-i="${i}" style="border-color:${c}"><span style="color:${c}">🛍️</span> ${kg} kg</button>`).join("")}</div>
      <p class="small-text">Klik på en pose for at lægge den på – klik igen for at tage den af.</p>`, (root) => {
      const view = root.querySelector("#scaleView");
      const draw = () => { view.innerHTML = scaleSvg(right); root.querySelectorAll(".bag-btn").forEach((b) => b.classList.toggle("picked", right.includes(+b.dataset.i))); };
      draw();
      root.querySelectorAll(".bag-btn").forEach((b) => b.addEventListener("click", () => {
        const i = +b.dataset.i;
        right = right.includes(i) ? right.filter((x) => x !== i) : [...right, i].sort();
        api.sound("click");
        draw();
        const sum = right.reduce((s, k) => s + BAGS[k][0], 0);
        if (sum === 10) {
          root.querySelectorAll(".bag-btn").forEach((x) => { x.disabled = true; });
          setTimeout(() => {
            api.sound("success");
            api.set("scaleSolved");
            api.later(150, () => api.set("candyDropped"));
            api.modal(`<div class="modal-icon">⚖️✅</div><p><b>Perfekt!</b> Vægten står helt lige.</p><p>Fra slikautomaten ved siden af lyder et <i>pling</i> – en <b>sukkerstang</b> ruller ned i bakken!</p>`);
          }, 900);
        }
      }));
    });
  }

  G.room({
    id: "wrapping",
    title: "Pakkerummet",
    intro: "Pakkerummet! Her pakkes alle gaverne. Døren til stalden er låst, og Pjok har byttet om på navnesedlerne! 😤",
    particles: { type: "sparks", count: 18, color: "#ffe2a8" },
    enter: (api) => startPeeks(api, 3),
    background: () => `${roomBase("url(#xStripes)", "url(#xPlanks)")}
      <rect y="440" width="1600" height="220" fill="#7a4a2a"/><rect y="436" width="1600" height="12" fill="#5a3418"/>
      ${garland(0, 1600, 86)}${lights(0, 1600, 96, 30, 22)}
      ${[0, 1, 2, 3, 4].map((i) => `<rect x="${560 + i * 34}" y="150" width="26" height="150" rx="12" fill="${["#e53935", "#43a047", "#1e88e5", "#ffd23a", "#ab47bc"][i]}" stroke="rgba(0,0,0,.25)" stroke-width="2"/>`).join("")}
      <rect x="550" y="140" width="190" height="12" rx="6" fill="#5a3418"/>
      ${gift(1200, 590, 80, 70, "#e53935")}${gift(1260, 610, 60, 50, "#43a047", "#fff")}`,
    objects: [
      {
        id: "door", label: "Dør til stalden",
        draw: (api) => `
          <path d="M40 660 V320 Q130 220 220 320 V660 Z" fill="#8a5530" stroke="#4a2a16" stroke-width="10"/>
          <path d="M85 650 V290 M130 650 V262 M175 650 V290" stroke="#6e4222" stroke-width="5"/>
          <circle cx="130" cy="340" r="30" fill="#1a2a4a" stroke="#4a2a16" stroke-width="8"/><path d="M130 310 V370 M100 340 H160" stroke="#4a2a16" stroke-width="5"/>
          <path d="M40 420 h60 M40 590 h60" stroke="#2a1a10" stroke-width="12" stroke-linecap="round"/>
          <rect x="70" y="250" width="120" height="34" rx="8" fill="#2e6b3f" stroke="#e3b04a" stroke-width="3"/><text x="130" y="274" text-anchor="middle" font-size="18" fill="#ffe3a3" font-weight="bold">STALDEN 🦌</text>
          ${api.flag("doorOpen") ? "" : `<rect x="170" y="460" width="36" height="44" rx="6" fill="url(#xGold)" stroke="#8a6214" stroke-width="3"/><path d="M178 460 v-14 a10 10 0 0 1 20 0 v14" stroke="#8a6214" stroke-width="5" fill="none"/>`}`,
        click(api) {
          if (api.has("stableKey")) return this.use("stableKey", api);
          api.modal(`<div class="modal-icon">🚪🔒</div><p>Døren til stalden er låst med en stor hængelås.<br>Du skal bruge <b>staldnøglen</b>.</p>`);
        },
        use(item, api) {
          if (item !== "stableKey") return false;
          api.take("stableKey");
          api.set("doorOpen");
          api.sound("success");
          api.later(600, () => api.goTo("stable"));
          return true;
        },
      },
      {
        id: "scale", label: "Slikvægt",
        draw: (api) => {
          const solved = api.flag("scaleSolved");
          const ang = solved ? 0 : -10;
          return `${Art.shadow(380, 680, 170)}
            <rect x="240" y="560" width="280" height="22" rx="6" fill="#6e4222"/><rect x="255" y="580" width="16" height="96" fill="#4a2a16"/><rect x="490" y="580" width="16" height="96" fill="#4a2a16"/>
            <rect x="370" y="350" width="20" height="210" fill="#6e4222"/>
            <g transform="rotate(${ang} 380 350)">
              <rect x="250" y="344" width="260" height="12" rx="6" fill="url(#xGold)"/>
              <path d="M270 350 l-34 80 h68 z M490 350 l-34 80 h68 z" stroke="#8a6214" stroke-width="2" fill="none"/>
              <path d="M228 430 h84 q-8 20 -42 20 q-34 0 -42 -20z M448 430 h84 q-8 20 -42 20 q-34 0 -42 -20z" fill="url(#xGold)" stroke="#8a6214" stroke-width="2"/>
              <path d="M248 430 q0 -44 22 -46 q22 2 22 46 z" fill="#7b1fa2"/>
              ${solved ? `<path d="M458 430 q0 -28 14 -30 q14 2 14 30 z" fill="#1e88e5"/><path d="M490 430 q0 -34 16 -36 q16 2 16 36 z" fill="#fb8c00"/>` : ""}
            </g>
            <circle cx="380" cy="350" r="10" fill="url(#xGold)"/>
            ${solved ? "" : BAGS.map(([kg, c], i) => `<path d="M${280 + i * 60} 560 q0 -30 16 -32 q16 2 16 32 z" fill="${c}"/><text x="${296 + i * 60}" y="552" text-anchor="middle" font-size="12" font-weight="bold" fill="#fff">${kg}</text>`).join("")}`;
        },
        click: scalePuzzle,
      },
      {
        id: "dispenser", label: "Slikautomat",
        draw: (api) => `
          <rect x="590" y="400" width="110" height="160" rx="12" fill="url(#xRed)" stroke="#6e1418" stroke-width="4"/>
          <circle cx="645" cy="380" r="56" fill="#e8f6ff" opacity=".5" stroke="#fff" stroke-width="4"/>
          ${[[620, 370, "#e53935"], [655, 355, "#ffd23a"], [670, 390, "#43a047"], [630, 400, "#fff"]].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="12" fill="${c}"/>`).join("")}
          <rect x="610" y="500" width="70" height="40" rx="6" fill="#3a1010"/>
          ${api.flag("candyDropped") && !api.has("candy") && !api.flag("candyTaken") ? `<g class="${api.just("candyDropped") ? "x-drop" : ""}"><path d="M630 530 v-20 a12 12 0 0 1 24 0" stroke="#fff" stroke-width="9" fill="none"/><path d="M630 530 v-20 a12 12 0 0 1 24 0" stroke="#e53935" stroke-width="9" fill="none" stroke-dasharray="6 6"/></g>` : ""}`,
        click(api) {
          if (api.flag("candyDropped") && !api.flag("candyTaken")) {
            api.set("candyTaken");
            api.give("candy");
            return api.say("🍬 Du tog sukkerstangen. Den er krum i enden – som en lille krog!");
          }
          api.say(api.flag("candyTaken") ? "🍬 Automaten er tom." : "🍬 Slikautomaten: <i>Kun for nisser, der kan få slikvægten til at stå lige!</i>");
        },
      },
      {
        id: "tags", label: "Navnesedler",
        draw: (api) => `
          <rect x="800" y="180" width="260" height="170" rx="10" fill="#fff8e6" stroke="#b8862b" stroke-width="6"/>
          <text x="930" y="212" text-anchor="middle" font-size="20" font-weight="bold" fill="#c62828" font-family="Georgia">NAVNESEDLER</text>
          ${["Emil", "Freja", "Noah"].map((n, i) => `<rect x="${820 + i * 80}" y="232" width="66" height="34" rx="6" fill="#e8d6b0" transform="rotate(${[-8, 6, -3][i]} ${853 + i * 80} 249)"/><text x="${853 + i * 80}" y="255" text-anchor="middle" font-size="16" fill="#3a2a10" transform="rotate(${[-8, 6, -3][i]} ${853 + i * 80} 249)">${n}</text>`).join("")}
          ${api.flag("tagsSolved") ? `<text x="930" y="320" text-anchor="middle" font-size="22" fill="#2e7d32">✓ Sorteret!</text>` : `<text x="930" y="320" text-anchor="middle" font-size="18" fill="#c62828" font-family="Comic Sans MS">Hihi, rodet! 😈</text>`}`,
        click(api) {
          if (api.flag("tagsSolved")) return api.say("✅ Alle gaver har fået de rigtige navnesedler.");
          api.pickLock({
            icon: "🏷️", text: "Pjok har revet navnesedlerne af de tre gaver på båndet! Hvem skal have hvad?",
            clue: `<div class="clue-box" style="text-align:left">📋 <b>Fra ønskesedlerne:</b><br>• <b>Emil</b> ønsker sig noget at <b>male</b> med.<br>• <b>Freja</b> kan ikke fordrage bolde.<br>• Alle tre børn får én gave hver.</div>`,
            rows: [
              { seq: "🚂 Toget til...", options: ["Emil", "Freja", "Noah"], answer: "Freja" },
              { seq: "🎨 Malerkassen til...", options: ["Emil", "Freja", "Noah"], answer: "Emil" },
              { seq: "⚽ Fodbolden til...", options: ["Emil", "Freja", "Noah"], answer: "Noah" },
            ],
            button: "Sæt sedlerne på",
            onSolve() {
              api.set("tagsSolved");
              api.sound("whoosh");
              api.modal(`<div class="modal-icon">🏷️✅</div><p>Du sætter navnesedlerne på. <b>Bip!</b><br>Transportbåndet starter og kører gaverne ud til slæden...</p>`);
              api.later(1800, () => api.say("🧹 Bag gaverne stod der en <b>kost</b> lænet op ad væggen!"));
            },
          });
        },
      },
      {
        id: "conveyor", label: "Transportbånd med gaver",
        draw: (api) => {
          const solved = api.flag("tagsSolved"), anim = api.just("tagsSolved");
          return `
            <rect x="1180" y="430" width="90" height="170" rx="8" fill="#3a2010"/><rect x="1186" y="436" width="78" height="80" fill="#1a0e06"/>
            <rect x="720" y="600" width="480" height="24" rx="10" fill="#3a3a44"/>
            <rect x="720" y="604" width="480" height="16" rx="8" fill="none" stroke="#6a6a78" stroke-width="4" stroke-dasharray="20 20" class="${anim ? "x-belt" : ""}"/>
            ${[740, 960, 1180].map((x) => `<circle cx="${x}" cy="612" r="14" fill="#555"/>`).join("")}
            <rect x="740" y="624" width="14" height="50" fill="#2a2a33"/><rect x="1166" y="624" width="14" height="50" fill="#2a2a33"/>
            ${solved && !anim ? "" : CONVEYOR_GIFTS.map(([e, c, x]) => `<g class="${anim ? "x-gift-out" : ""}">${gift(x - 45, 510, 90, 90, c)}<text x="${x}" y="575" text-anchor="middle" font-size="30">${e}</text></g>`).join("")}`;
        },
        click(api) {
          if (api.flag("tagsSolved")) return api.say("📦 Transportbåndet er tomt. Gaverne er på vej til slæden.");
          api.say("📦 Tre gaver uden navnesedler: 🚂 🎨 ⚽. Se på tavlen med navnesedler.");
        },
      },
      {
        id: "broom", label: "Kost",
        visible: (api) => api.flag("tagsSolved") && !api.has("broom") && !api.has("hook") && !api.flag("keyHooked"),
        draw: (api) => `<g class="${api.just("tagsSolved") ? "" : ""}">
          <line x1="1000" y1="380" x2="1050" y2="600" stroke="#9a6a32" stroke-width="12" stroke-linecap="round"/>
          <path d="M1030 590 l-22 70 h76 l-22 -78 z" fill="#d9b060" stroke="#9a7a30" stroke-width="3"/>
          <path d="M1015 640 h60" stroke="#c62828" stroke-width="6"/></g>`,
        click(api) { api.give("broom"); api.say("🧹 Du tog kosten. Skaftet er langt!"); },
      },
      {
        id: "shelf", label: "Reol",
        draw: (api) => `
          <rect x="1300" y="160" width="250" height="510" fill="#6e4222" stroke="#4a2a16" stroke-width="6"/>
          ${[0, 1, 2, 3].map((r) => `<rect x="1300" y="${280 + r * 120}" width="250" height="14" fill="#4a2a16"/>
            ${gift(1318, 210 + r * 120, 60, 66, ["#e53935", "#43a047", "#1e88e5", "#ffd23a"][r])}${gift(1400, 222 + r * 120, 50, 54, ["#ab47bc", "#e53935", "#fb8c00", "#43a047"][r], "#fff")}${gift(1470, 214 + r * 120, 60, 62, ["#1e88e5", "#ffd23a", "#e53935", "#ab47bc"][r])}`).join("")}
          <rect x="1284" y="160" width="16" height="510" fill="#1a0e06"/>
          ${api.flag("keyHooked") ? "" : `<g class="x-glow"><circle cx="1292" cy="420" r="16" fill="#ffe680" opacity=".5"/></g>${Art.star(1292, 420, 8, "#fff6b0")}`}`,
        click(api) {
          if (api.flag("keyHooked")) return api.say("Reolen er fuld af gaver.");
          api.modal(`<div class="modal-icon">🗝️✨</div><p>Bag reolen, i den smalle sprække mod væggen, <b>glimter</b> noget på et søm...</p><p>Det er <b>staldnøglen</b>! Men sprækken er alt for smal til din arm – og nøglen hænger langt inde.</p><p class="small-text">Du skal bruge noget langt med en krog for enden.</p>`);
        },
        use(item, api) {
          if (api.flag("keyHooked")) return false;
          if (item === "broom") { api.say("🧹 Kosten kan nå derind, men den kan ikke få fat i nøglen. Den mangler en <b>krog</b>!"); return true; }
          if (item === "candy") { api.say("🍬 Sukkerstangen er en god krog... men den er alt for kort!"); return true; }
          if (item !== "hook") return false;
          api.take("hook");
          api.set("keyHooked");
          api.give("stableKey");
          api.modal(`<div class="modal-icon">🧹🍬➜🗝️</div><p>Du stikker kosten med sukkerstangs-krogen ind bag reolen... fisker lidt...<br><b>Klik!</b> Du har fat i <b>staldnøglen</b>!</p>`);
          return true;
        },
      },
      pjokObject([[1250, 520, 0.7], [700, 560, 0.75], [1430, 210, 0.7]]),
    ],
    goal(api) {
      if (!api.flag("scaleSolved")) return "scale";
      if (!api.flag("candyTaken")) return "candy";
      if (!api.flag("tagsSolved")) return "tags";
      if (!api.has("broom") && !api.has("hook") && !api.flag("keyHooked")) return "broom";
      if (!api.has("hook") && !api.flag("keyHooked")) return "combine";
      if (!api.flag("keyHooked")) return "shelf";
      return "door";
    },
    hints: {
      scale: ["Slikvægten skal stå helt lige. Venstre side vejer 10 kg.", "Find to poser, der tilsammen vejer 10 kg.", "Læg 4 kg og 6 kg på højre side."],
      candy: ["Der kom noget ud af slikautomaten!"],
      tags: ["Gaverne på båndet mangler navnesedler.", "Emil vil male, og Freja kan ikke lide bolde. Så må Noah få bolden.", "Tog → Freja, malerkasse → Emil, fodbold → Noah."],
      broom: ["Da gaverne kørte væk, kom der noget til syne bag dem.", "Tag kosten."],
      combine: ["Kosten er lang, og sukkerstangen er krum som en krog.", "Klik på 🧹 og derefter på 🍬 i sækken."],
      shelf: ["Noget glimter bag reolen.", "Brug kosten med krog på reolen."],
      door: ["Brug staldnøglen 🗝️ på døren til stalden."],
    },
  });

  // =========================================================
  // ROOM 3: Reindeer stable
  // =========================================================
  const STALLS = [
    { x: 260, name: "Lyn", o: { antlers: 1.6 } },
    { x: 540, name: "Komet", o: { scarf: true } },
    { x: 820, name: "Amor", o: { antlers: 0.8 } },
    { x: 1100, name: "Danser", o: { sleep: true } },
  ];
  const BELLS = [["C", 262, "c-red"], ["D", 294, "c-yellow"], ["E", 330, "c-blue"], ["F", 349, "c-purple"], ["G", 392, "c-green"]];
  const MELODY = ["E", "G", "C", "D", "E"];
  const bellColor = (n) => ({ C: "#e53935", D: "#fdd835", E: "#1e88e5", F: "#8e24aa", G: "#43a047" })[n];

  G.room({
    id: "stable",
    title: "Rensdyrstalden",
    intro: "Rensdyrstalden! Det dufter af hø. 🦌 Men Pjok har pillet navneskiltene ned, og døren til garagen har en mærkelig bjælde-lås...",
    particles: { type: "dust", count: 34, color: "#ffe2a8" },
    enter: (api) => startPeeks(api, 3),
    background: () => `${DEFS}
      <rect width="1600" height="680" fill="url(#xBarn)"/>
      <rect y="0" width="1600" height="120" fill="#5a3420"/><path d="M0 120 H1600" stroke="#3a2010" stroke-width="16"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M${i * 220} 40 q30 -30 60 0 q30 -30 60 0 q30 -30 60 0" fill="#d9b060" opacity=".85"/>`).join("")}
      ${garland(0, 1600, 132)}
      <rect y="660" width="1600" height="240" fill="url(#xStraw)"/><rect y="660" width="1600" height="240" fill="url(#floorShade)"/>
      ${[120, 400, 680, 960, 1240].map((x) => `<rect x="${x - 10}" y="350" width="20" height="320" fill="#4a2a16"/>`).join("")}
      <rect x="110" y="350" width="1150" height="14" fill="#4a2a16"/>
      ${[260, 540, 820, 1100].map((x) => `<g><circle cx="${x}" cy="210" r="90" fill="url(#xWarm)"/><path d="M${x} 150 v20" stroke="#222" stroke-width="3"/><rect x="${x - 14}" y="170" width="28" height="36" rx="6" fill="#3a3a44"/><rect x="${x - 9}" y="176" width="18" height="24" fill="#ffd86b" class="x-glow"/></g>`).join("")}`,
    objects: [
      {
        id: "sheet", label: "Noder på væggen",
        draw: () => paperNote(20, 210, 80, 110, -4, `<text x="60" y="240" text-anchor="middle" font-size="12" font-weight="bold" fill="#3a2a10">BJÆLDE-</text><text x="60" y="254" text-anchor="middle" font-size="12" font-weight="bold" fill="#3a2a10">KLANG</text>
          ${MELODY.map((n, i) => `<circle cx="${34 + i * 13}" cy="${300 - "CDEFG".indexOf(n) * 7}" r="5" fill="${bellColor(n)}"/>`).join("")}`),
        click(api) {
          api.note("melody", "Noderne \"Bjældeklang\"", `♪ <i>...jingle all the way!</i><br>${MELODY.map((n) => `<b style="color:${bellColor(n)}">${n}</b>`).join(" – ")}`);
          api.modal(`<div class="modal-icon">🎼</div><p>Noder pinet fast på væggen: <b>"Bjældeklang"</b></p>
            <div class="clue-box" style="font-size:2rem;letter-spacing:6px">${MELODY.map((n) => `<span style="color:${bellColor(n)}">🔔<small style="font-size:1.1rem">${n}</small></span>`).join(" ")}</div>
            <p class="small-text"><i>"Spil min sang, så åbner døren til slæden." – Julemanden</i></p>`);
        },
      },
      ...STALLS.map((st, i) => ({
        id: "stall" + i, label: (api) => api.flag("namesSolved") ? `Rensdyret ${st.name}` : "Rensdyr",
        draw: (api) => {
          const solved = api.flag("namesSolved");
          return `${reindeer(st.x - 24, 664, 1.08, { ...st.o, happy: api.just("namesSolved") })}
            <rect x="${st.x - 130}" y="596" width="260" height="74" fill="#7a4428" stroke="#4a2a16" stroke-width="6"/>
            <path d="M${st.x - 130} 633 h260 M${st.x - 130} 596 l260 74" stroke="#5a3420" stroke-width="6"/>
            <rect x="${st.x - 70}" y="296" width="140" height="44" rx="8" fill="${solved ? "#fff6e0" : "#5a3420"}" stroke="#e3b04a" stroke-width="3" class="${api.just("namesSolved") ? "x-pop" : ""}"/>
            <text x="${st.x}" y="326" text-anchor="middle" font-size="22" font-weight="bold" fill="${solved ? "#7a2a10" : "#e3b04a"}" font-family="Georgia">${solved ? st.name : "?"}</text>
            <text x="${st.x}" y="288" text-anchor="middle" font-size="15" fill="#ffe3a3">Bås ${i + 1}</text>`;
        },
        click(api) {
          if (api.flag("namesSolved")) { api.sound("click"); return api.say(`🦌 ${st.name} ${["kigger stolt på dig.", "snuser til din lomme.", "blinker venligt.", "snorker... zzz."][i]}`); }
          namesPuzzle(api);
        },
      })),
      {
        id: "book", label: "Staldbogen",
        draw: () => `
          ${Art.shadow(560, 840, 70)}
          <rect x="500" y="760" width="120" height="80" rx="10" fill="#6e4222"/><ellipse cx="560" cy="760" rx="62" ry="14" fill="#8a5a33"/>
          <path d="M510 752 L560 742 L610 752 L610 760 L560 750 L510 760 Z" fill="#fff8e6" stroke="#b8862b" stroke-width="2"/>
          <path d="M520 750 h30 M570 748 h30" stroke="#999" stroke-width="2"/>`,
        click(api) {
          api.note("staldbog", "Staldbogen", "Lyn har de største gevirer. Komet går altid med halstørklæde. Amor står mellem Komet og Danser. Danser er en syvsover.<br><b>4 rensdyr</b> trækker slæden: Lyn, Komet, Amor og Danser.");
          api.modal(`<div class="modal-icon">📖🦌</div><p class="note-text">STALDBOGEN</p>
            <div class="clue-box" style="text-align:left">🦌 <b>Lyn</b> har de største gevirer i hele stalden.<br>🦌 <b>Komet</b> fryser om halsen og går altid med halstørklæde.<br>🦌 <b>Amor</b> står lige mellem Komet og Danser.<br>🦌 <b>Danser</b> er en syvsover.<br><br><i>Julemandens slæde trækkes af disse <b>4 rensdyr</b>.</i></div>`);
        },
      },
      {
        id: "harness", label: "Bjældekrans på krog",
        draw: (api) => `
          <rect x="1255" y="250" width="30" height="16" rx="4" fill="#3a2010"/>
          ${api.has("bells") || api.flag("bellsHung") ? "" : `<g class="${api.just("namesSolved") ? "x-ring" : ""}"><path d="M1270 266 q-30 60 0 120 q30 -60 0 -120" stroke="#7a2a10" stroke-width="10" fill="none"/>
            ${[290, 320, 350, 375].map((y, i) => `<circle cx="${1270 + (i % 2 ? 14 : -14)}" cy="${y}" r="11" fill="url(#xGold)" stroke="#8a6214" stroke-width="2"/>`).join("")}</g>`}
          ${api.flag("namesSolved") || api.has("bells") || api.flag("bellsHung") ? "" : `<rect x="1256" y="380" width="28" height="32" rx="5" fill="#888" stroke="#555" stroke-width="2"/><path d="M1262 380 v-10 a8 8 0 0 1 16 0 v10" stroke="#555" stroke-width="4" fill="none"/>`}`,
        click(api) {
          if (api.has("bells") || api.flag("bellsHung")) return api.say("Krogen er tom.");
          if (!api.flag("namesSolved")) return api.modal(`<div class="modal-icon">🔔🔒</div><p>En flot <b>bjældekrans</b> hænger på en krog med en lille lås.</p><div class="clue-box"><i>"Kun nisser, der kender rensdyrenes navne, må tage bjælderne."</i></div><p class="small-text">Navneskiltene over båsene er væk...</p>`);
          api.give("bells");
          api.say("🔔 Du tog bjældekransen. Den klinger så smukt!");
        },
      },
      {
        id: "hay", label: "Høstak",
        draw: (api) => `
          ${Art.shadow(230, 840, 130)}
          <g class="${api.just("hayTossed") ? "x-shake" : ""}"><path d="M110 840 Q110 720 230 700 Q350 720 350 840 Z" fill="#d9b060"/>
          ${Array.from({ length: 14 }, (_, i) => `<path d="M${130 + i * 15} ${830 - (i % 3) * 30} l${(i % 2 ? 1 : -1) * 18} -40" stroke="#b58a45" stroke-width="4"/>`).join("")}</g>
          ${api.just("hayTossed") ? Array.from({ length: 10 }, (_, i) => `<path class="x-drop" style="animation-delay:${i * 0.05}s" d="M${150 + i * 18} ${700 - (i % 3) * 20} l14 -10" stroke="#d9b060" stroke-width="5"/>`).join("") : ""}`,
        click(api) {
          if (api.flag("hayTossed")) return api.say("Bare hø. Atjuu! 🤧");
          api.set("hayTossed");
          api.give("carrot");
          api.say("🥕 Du roder i høet... og finder en stor, sprød <b>gulerod</b>!");
        },
      },
      {
        id: "calf", label: (api) => api.flag("calfMoved") ? "Snebold (glad kalv)" : "Rensdyrkalven Snebold",
        draw: (api) => api.flag("calfMoved")
          ? `<g class="${api.just("calfMoved") ? "x-trot" : ""}">${calf(980, 820, 1, true)}</g>`
          : calf(1380, 840, 1),
        click(api) {
          if (api.flag("calfMoved")) return api.say("🦌 Snebold gnasker glad sin gulerod.");
          api.modal(`<div class="modal-icon">🦌💤</div><p>Rensdyrkalven <b>Snebold</b> ligger lige foran døren til garagen og vil ikke flytte sig.</p><p>Den kigger sultent på dig... og drømmer vist om noget orange. 🧡</p>`);
        },
        use(item, api) {
          if (api.flag("calfMoved")) return false;
          if (item !== "carrot") { api.say("🦌 Snebold rynker på snuden. Den vil have noget at <b>spise</b>!"); return true; }
          api.take("carrot");
          api.set("calfMoved");
          api.sound("success");
          api.say("🥕 Snebold hopper op, snupper guleroden og traver glad hen til sin mor. Nu er døren fri!");
          return true;
        },
      },
      {
        id: "garageDoor", label: "Dør til slædegaragen",
        draw: (api) => {
          const open = api.flag("barnOpen");
          return `
            <rect x="1300" y="220" width="280" height="440" fill="${open ? "#ffe9a8" : "#1a0e06"}"/>
            ${open ? `<circle cx="1440" cy="440" r="220" fill="#ffe9a8" opacity=".25"/>` : ""}
            <g style="transition:transform 1s" transform="${open ? "translate(-120 0)" : ""}"><rect x="1300" y="220" width="140" height="440" fill="#8a3a22" stroke="#4a2a16" stroke-width="6"/><path d="M1300 220 l140 440 M1440 220 l-140 440" stroke="#5a2414" stroke-width="10"/></g>
            <g style="transition:transform 1s" transform="${open ? "translate(120 0)" : ""}"><rect x="1440" y="220" width="140" height="440" fill="#8a3a22" stroke="#4a2a16" stroke-width="6"/><path d="M1440 220 l140 440 M1580 220 l-140 440" stroke="#5a2414" stroke-width="10"/></g>
            <rect x="1290" y="190" width="300" height="34" rx="6" fill="#2e6b3f" stroke="#e3b04a" stroke-width="3"/><text x="1440" y="214" text-anchor="middle" font-size="18" font-weight="bold" fill="#ffe3a3">SLÆDEGARAGEN 🛷</text>
            ${open ? "" : `<rect x="1380" y="300" width="120" height="110" rx="10" fill="#3a2010" stroke="#e3b04a" stroke-width="3"/>
              ${[0, 1, 2, 3, 4].map((k) => `<path d="M${1396 + k * 22} 312 v12" stroke="#aaa" stroke-width="3"/>${api.flag("bellsHung") ? `<circle cx="${1396 + k * 22}" cy="${338}" r="9" fill="${bellColor("CDEFG"[k])}" stroke="#fff" stroke-width="2" class="${api.just("bellsHung") ? "x-pop" : ""}"/>` : ""}`).join("")}
              <text x="1440" y="388" text-anchor="middle" font-size="13" fill="#ffe3a3">BJÆLDE-LÅS</text>`}`;
        },
        click(api) {
          if (api.flag("barnOpen")) return api.goTo("garage");
          if (!api.flag("calfMoved")) return api.say("🦌 Snebold ligger lige foran døren. Du kan ikke komme derhen!");
          if (!api.flag("bellsHung")) return api.modal(`<div class="modal-icon">🚪🔔</div><p>Døren har en <b>bjælde-lås</b> med fem tomme kroge.</p><p>Der mangler bjælder...</p>`);
          api.sequenceLock({
            icon: "🔔🚪", text: "Bjælde-låsen. Spil den rigtige melodi:",
            buttons: BELLS.map(([n, f, cls]) => ({ v: n, html: `🔔<small style="display:block;font-size:.9rem;font-weight:bold">${n}</small>`, cls, tone: f * 2 })),
            answer: MELODY,
            onSolve() {
              api.set("barnOpen");
              api.sound("bell");
              api.modal(`<div class="modal-icon">🔔🎶🚪</div><p><b>Kling-klang-kling!</b> Melodien klinger gennem stalden, og de store døre glider op...</p><p>Bag dem står <b>julemandens slæde</b>! 🛷✨</p>`);
            },
          });
        },
        use(item, api) {
          if (item !== "bells" || api.flag("bellsHung")) return false;
          if (!api.flag("calfMoved")) { api.say("🦌 Snebold ligger i vejen."); return true; }
          api.take("bells");
          api.set("bellsHung");
          api.sound("bell");
          api.say("🔔 Du hænger bjælderne på krogene. De har hver sin farve og tone!");
          return true;
        },
      },
      pjokObject([[400, 640, 0.65], [1220, 520, 0.7], [700, 400, 0.6]]),
    ],
    goal(api) {
      if (!api.flag("namesSolved")) return "names";
      if (!api.has("bells") && !api.flag("bellsHung")) return "bells";
      if (!api.flag("calfMoved")) return api.has("carrot") ? "feed" : "hay";
      if (!api.flag("bellsHung")) return "hang";
      return "melody";
    },
    hints: {
      names: ["Navneskiltene over båsene mangler. Læs staldbogen på tønden.", "Lyn har store gevirer, Komet har halstørklæde, Danser sover.", "Bås 1: Lyn, bås 2: Komet, bås 3: Amor, bås 4: Danser."],
      bells: ["Bjældekransen ved døren er låst op nu.", "Tag bjældekransen fra krogen."],
      hay: ["Kalven Snebold er sulten. Hvad spiser rensdyr?", "Kig i høstakken."],
      feed: ["Giv guleroden 🥕 til Snebold."],
      hang: ["Bjælde-låsen på døren mangler bjælder.", "Brug bjældekransen 🔔 på døren."],
      melody: ["Noderne på væggen til venstre viser melodien.", "Spil E – G – C – D – E."],
    },
  });

  function namesPuzzle(api) {
    const read = api.flag("bookRead") || (Game.state.notes || []).some((n) => n.id === "staldbog");
    api.pickLock({
      icon: "🦌🏷️", text: "Pjok har pillet navneskiltene ned! Hvilket rensdyr står i hvilken bås?",
      clue: read
        ? `<div class="clue-box" style="text-align:left;font-size:1.05rem">📖 Lyn har de største gevirer · Komet går med halstørklæde · Amor står mellem Komet og Danser · Danser er en syvsover</div>`
        : `<p class="tip">Tip: Staldbogen på tønden ved noget om rensdyrene.</p>`,
      rows: STALLS.map((st, i) => ({ seq: `Bås ${i + 1}`, options: ["Lyn", "Komet", "Amor", "Danser"], answer: st.name })),
      button: "Hæng skiltene op",
      onSolve() {
        api.set("namesSolved");
        api.note("reindeer", "Slædens rensdyr", "Lyn, Komet, Amor og Danser – <b>4 rensdyr</b> trækker slæden.");
        api.modal(`<div class="modal-icon">🦌🦌🦌🦌</div><p>Du hænger skiltene op. Rensdyrene nikker glade!</p><p>Ved døren lyder et lille <b>klik</b> – låsen på bjældekransen er åben.</p>`);
      },
    });
  }

  // =========================================================
  // ROOM 4: Sleigh garage
  // =========================================================
  G.room({
    id: "garage",
    title: "Slædegaragen",
    intro: "Slædegaragen! Klokken er kvart i tolv. 🕚 Slæden er klar – men den vil ikke starte. Og hvorfor bevæger den sæk sig...?",
    particles: { type: "snow", count: 40, color: "#ffffff" },
    background: (api) => `${DEFS}
      <rect width="1600" height="680" fill="url(#xStone)"/>
      <rect y="0" width="1600" height="80" fill="#3a2010"/>${[0, 400, 800, 1200].map((x) => `<rect x="${x}" y="0" width="30" height="680" fill="#4a2a16" opacity=".8"/>`).join("")}
      ${snowyWindow("g1", 360, 130, 180, 130)}${snowyWindow("g2", 640, 130, 180, 130)}
      ${garland(0, 1150, 96)}${lights(0, 1150, 104, 26, 16)}
      <rect y="660" width="1600" height="240" fill="url(#xPlanks)"/><rect y="660" width="1600" height="240" fill="#2a1a10" opacity=".35"/><rect y="660" width="1600" height="240" fill="url(#floorShade)"/>
      <ellipse cx="640" cy="760" rx="420" ry="60" fill="#ffcf7a" opacity=".12"/>
      ${[290, 590].map((x) => `<line x1="${x}" y1="80" x2="${x}" y2="300" stroke="#222" stroke-width="3"/><path d="M${x - 34} 330 L${x - 14} 300 H${x + 14} L${x + 34} 330 Z" fill="#2e6b3f"/><circle cx="${x}" cy="336" r="10" fill="#fff3c4"/><circle cx="${x}" cy="380" r="170" fill="url(#xWarm)"/>`).join("")}
      <rect x="1140" y="140" width="440" height="530" fill="${api.flag("launched") ? "url(#xNight)" : "#2a1a10"}"/>
      ${api.flag("launched") ? `<path d="M1140 600 Q1300 560 1580 590 V670 H1140 Z" fill="#e8f0ff"/>` : ""}
      <circle cx="930" cy="330" r="46" fill="#fff8e6" stroke="#6e4222" stroke-width="8"/>
      <path d="M930 330 H898" stroke="#222" stroke-width="4" stroke-linecap="round"/><path d="M930 330 L922 306" stroke="#222" stroke-width="6" stroke-linecap="round"/><circle cx="930" cy="330" r="5" fill="#c62828"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => `<circle cx="${930 + 36 * Math.cos((i * Math.PI) / 6)}" cy="${330 + 36 * Math.sin((i * Math.PI) / 6)}" r="2.5" fill="#333"/>`).join("")}`,
    objects: [
      {
        id: "gate", label: "Garageporten",
        draw: (api) => {
          const up = api.flag("launched");
          return `<g style="transition:transform 2.5s ease-in-out" transform="${up ? "translate(0 -470)" : ""}">
            <rect x="1140" y="140" width="440" height="520" fill="#7a4428" stroke="#4a2a16" stroke-width="8"/>
            ${Array.from({ length: 8 }, (_, i) => `<rect x="1150" y="${156 + i * 62}" width="420" height="50" rx="4" fill="#8a4f30"/>`).join("")}
            <path d="M1150 640 q40 -20 80 0 t80 0 t80 0 t80 0 t80 0 t40 0 V660 H1150 Z" fill="#fff" opacity=".9"/>
            <path d="M1140 150 q20 30 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" fill="none" stroke="#e8f6ff" stroke-width="10"/></g>`;
        },
        click: (api) => api.say(api.flag("launched") ? "🌙 Porten er åben! Natten venter." : "🚪 Garageporten åbner automatisk, når slæden starter."),
      },
      {
        id: "simulator", label: "Leveringsprøven",
        draw: (api) => `
          ${Art.shadow(180, 680, 120)}
          <path d="M70 680 V330 Q70 290 110 290 H250 Q290 290 290 330 V680 Z" fill="#2e6b3f" stroke="#1d4527" stroke-width="6"/>
          <rect x="94" y="320" width="172" height="130" rx="10" fill="#0c1638" stroke="#e3b04a" stroke-width="5"/>
          <g class="x-glow"><text x="180" y="360" text-anchor="middle" font-size="40">🛷</text></g>
          <text x="180" y="410" text-anchor="middle" font-size="14" fill="#ffe3a3" font-weight="bold">LEVERINGS-</text><text x="180" y="428" text-anchor="middle" font-size="14" fill="#ffe3a3" font-weight="bold">PRØVEN</text>
          ${api.flag("deliveryDone") ? `<text x="180" y="442" text-anchor="middle" font-size="13" fill="#7dff8a">✓ BESTÅET</text>` : ""}
          <rect x="110" y="480" width="140" height="40" rx="8" fill="#1d4527"/><circle cx="150" cy="500" r="12" fill="#e53935"/><circle cx="210" cy="500" r="12" fill="#ffd23a"/>
          <rect x="90" y="270" width="180" height="26" rx="6" fill="#c62828"/><text x="180" y="289" text-anchor="middle" font-size="15" fill="#fff" font-weight="bold">★ SPIL MIG ★</text>`,
        click(api) {
          if (api.flag("deliveryDone")) return api.modal(`<div class="modal-icon">🛷✅</div><p>Leveringsprøven er bestået!<br>Skærmen viser din kode:</p><p class="big-emoji">3 1 2</p>`);
          Delivery.open(api, {
            digits: [3, 1, 2],
            onWin() {
              api.set("deliveryDone");
              api.note("delivery", "Leveringsprøven", "Bestået! Skærmen viste koden <b>3 1 2</b>");
            },
          });
        },
      },
      {
        id: "sleigh", label: "Julemandens slæde",
        draw: (api) => `${sleigh(330, 660, 1, api.flag("keyIn"))}
          <g transform="translate(870 520)">
            <rect x="0" y="0" width="90" height="56" rx="10" fill="#2a1a10" stroke="url(#xGold)" stroke-width="4"/>
            <circle cx="24" cy="28" r="12" fill="${api.flag("keyIn") ? "#7dff8a" : "#555"}"/>
            ${api.flag("keyIn") ? `<path d="M24 28 l18 -10" stroke="#e3b04a" stroke-width="5"/>` : `<rect x="20" y="24" width="8" height="10" fill="#111"/>`}
            <rect x="46" y="14" width="34" height="28" rx="4" fill="#0c1638"/><text x="63" y="34" text-anchor="middle" font-size="12" fill="#ffd86b">####</text>
          </g>
          ${api.flag("pjokHappy") ? `<g class="x-bob">${pjok(560, 500, 0.7, "happy")}</g>` : ""}
          ${api.flag("launched") ? `<g class="x-trot"><path d="M960 560 L1180 600 M960 560 L1180 660" stroke="#e3b04a" stroke-width="4"/>${[[1240, 610], [1400, 600], [1240, 690], [1400, 680]].map(([x, y]) => reindeer(x, y, 0.55, { antlers: 1.1 })).join("")}</g>` : ""}`,
        click(api) {
          if (!api.flag("keyIn")) return api.modal(`<div class="modal-icon">🛷🔑</div><p>Julemandens flotte slæde! Instrumentbrættet har et <b>nøglehul</b> og en <b>kodelås</b>.</p><p>Tændingsnøglen mangler... hvem har den mon?</p>`);
          api.codeLock({
            icon: "🛷🔢", text: "Tændingskoden. Under tastaturet står:",
            clue: `<div class="clue-box">🎮🎮🎮 + 🦌<br><small>De tre første tal: <b>bestå leveringsprøven</b>.<br>Det sidste tal: <b>hvor mange rensdyr trækker slæden?</b></small></div>`,
            length: 4, answer: "3124",
            onSolve: () => launch(api),
          });
        },
        use(item, api) {
          if (item !== "ignition" || api.flag("keyIn")) return false;
          api.take("ignition");
          api.set("keyIn");
          api.sound("beep");
          api.say("🔑 Du drejer tændingsnøglen... Lygterne tændes! Nu mangler kun <b>tændingskoden</b>.");
          return true;
        },
      },
      {
        id: "sack", label: (api) => api.flag("pjokOut") ? "Gavesæk" : "Gavesæk (den bevæger sig!)",
        draw: (api) => `
          <g class="${api.flag("pjokOut") ? "" : "x-wiggle"}">
            ${Art.shadow(1050, 690, 90)}
            <path d="M970 690 Q960 560 1010 540 Q1050 520 1090 540 Q1140 560 1130 690 Z" fill="#a52a2a" stroke="#6e1418" stroke-width="5"/>
            <path d="M1010 540 Q1050 500 1090 540" stroke="#e3b04a" stroke-width="8" fill="none"/>
            ${api.flag("pjokOut") ? "" : `<text x="1050" y="510" text-anchor="middle" font-size="30" class="x-bob">❓</text>`}
          </g>`,
        click(api) {
          if (api.flag("pjokOut")) return api.say("🎁 En sæk fuld af gaver til børnene.");
          api.set("pjokOut");
          api.sound("scare");
          api.modal(`<div class="modal-icon">🎁➜😈</div><p>Du åbner sækken... og ud springer <b>PJOK</b>!</p>
            <p>😈 <b>"Hihi! Du fandt mig! Og se her – jeg har <u>tændingsnøglen</u>! Uden den kommer slæden ingen vegne!"</b></p>`);
        },
      },
      {
        id: "pjok", label: "Pjok",
        visible: (api) => api.flag("pjokOut") && !api.flag("pjokHappy"),
        draw: (api) => `<g class="${api.just("pjokOut") ? "x-pop" : ""}">${pjok(1180, 740, 1, "grin")}<text x="1215" y="560" font-size="30">🔑</text></g>`,
        click(api) {
          api.modal(`<div class="modal-icon">😈🔑</div><p><b>Pjok</b> holder tændingsnøglen bag ryggen. Pludselig ser han lidt trist ud...</p>
            <p>😢 <b>"Ved du hvad? Alle nisser laver gaver til børnene. Men <u>ingen</u> giver nogensinde en gave til en nisse... Jeg har aldrig fået en julegave. Aldrig!"</b></p>
            <p class="small-text">Måske har du noget, du kan give ham?</p>`);
        },
        use(item, api) {
          if (item !== "woodDeer") { api.say("😈 <b>Pjok:</b> Pfff! Det vil jeg ikke have!"); return true; }
          api.take("woodDeer");
          api.set("pjokHappy");
          api.give("ignition");
          api.modal(`<div class="modal-icon">🦌➜😊</div><p>Du giver Pjok det lille <b>træ-rensdyr</b> fra legetøjsmaskinen.</p>
            <p>🥹 <b>"Til... til MIG? Min første julegave nogensinde!"</b></p><p>Pjok krammer rensdyret og rækker dig <b>tændingsnøglen</b>. <b>"Undskyld for alt rodet. Må jeg komme med på slæden?"</b></p>`);
          return true;
        },
      },
      {
        id: "clock", label: "Ur",
        draw: () => `<circle cx="930" cy="330" r="50" fill="transparent"/>`,
        click: (api) => api.say("🕚 Klokken er kvart i tolv! Slæden skal af sted ved midnat!"),
      },
    ],
    goal(api) {
      if (!api.flag("deliveryDone")) return "delivery";
      if (!api.flag("pjokOut")) return "sack";
      if (!api.flag("pjokHappy")) return "gift";
      if (!api.flag("keyIn")) return "key";
      return "code";
    },
    hints: {
      delivery: ["Spillemaskinen til venstre er julemandens leveringsprøve.", "Slip gaven lidt FØR skorstenen er lige under slæden."],
      sack: ["Gavesækken bevæger sig... Hvad er der i den?"],
      gift: ["Pjok har aldrig fået en julegave. Har du noget i din sæk, du kunne give ham?", "Giv Pjok træ-rensdyret 🦌 fra legetøjsmaskinen."],
      key: ["Brug tændingsnøglen 🔑 på slæden."],
      code: ["Koden er tallene fra leveringsprøven + antal rensdyr. Kig i notesbogen! 📓", "Leveringsprøven gav 3 1 2. Staldbogen siger, at 4 rensdyr trækker slæden.", "Koden er 3124."],
    },
  });

  function launch(api) {
    api.set("launched");
    api.sound("bell");
    api.modal(`<div class="modal-icon">🛷✨</div><p><b>VRRRUM!</b> Slæden vågner, og garageporten glider langsomt op...</p>
      <p>Lyn, Komet, Amor og Danser kommer travende ind og bliver spændt for. Pjok hopper op ved siden af dig. 🦌🦌🦌🦌</p>`, null, true);
    api.later(4200, () => api.win(`Julemanden kommer løbende ind i garagen: <i>"HO HO HO! Hvem har reddet julen?!"</i> 🎅<br><br>
      Med <b>dig</b> og <b>Pjok</b> om bord letter slæden præcis ved midnat og suser ud over de sneklædte hustage. 🛷🌙<br>
      Alle børn får deres gaver – og Pjok får sin allerførste julegave. 🦌❤️<br><br><b>Glædelig jul!</b> ⭐`));
  }
})();
