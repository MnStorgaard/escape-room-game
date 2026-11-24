// Drawn graphics (SVG). All scenes use a 1600 x 900 canvas.
const Art = (() => {
  const defs = `
  <defs>
    <pattern id="bricks" width="160" height="70" patternUnits="userSpaceOnUse">
      <rect width="160" height="70" fill="#6d6880"/>
      <rect x="3" y="3" width="74" height="29" rx="4" fill="#77728a"/>
      <rect x="83" y="3" width="74" height="29" rx="4" fill="#716c84"/>
      <rect x="-37" y="38" width="74" height="29" rx="4" fill="#736e86"/>
      <rect x="43" y="38" width="74" height="29" rx="4" fill="#7a758d"/>
      <rect x="123" y="38" width="74" height="29" rx="4" fill="#736e86"/>
    </pattern>
    <pattern id="stoneFloor" width="200" height="80" patternUnits="userSpaceOnUse">
      <rect width="200" height="80" fill="#4b4150"/>
      <rect x="4" y="4" width="92" height="34" rx="6" fill="#544a5a"/>
      <rect x="104" y="4" width="92" height="34" rx="6" fill="#51475a"/>
      <rect x="54" y="44" width="92" height="32" rx="6" fill="#564c5c"/>
      <rect x="-46" y="44" width="92" height="32" rx="6" fill="#504656"/>
      <rect x="154" y="44" width="92" height="32" rx="6" fill="#504656"/>
    </pattern>
    <pattern id="tiles" width="100" height="100" patternUnits="userSpaceOnUse">
      <rect width="100" height="100" fill="#8a8f9c"/>
      <rect width="50" height="50" fill="#7c8190"/><rect x="50" y="50" width="50" height="50" fill="#7c8190"/>
    </pattern>
    <pattern id="castleStone" width="180" height="90" patternUnits="userSpaceOnUse">
      <rect width="180" height="90" fill="#4a4e63"/>
      <rect x="4" y="4" width="82" height="38" rx="10" fill="#575c73"/>
      <rect x="94" y="4" width="82" height="38" rx="10" fill="#525770"/>
      <rect x="49" y="49" width="82" height="38" rx="10" fill="#5a5f76"/>
      <rect x="-41" y="49" width="82" height="38" rx="10" fill="#555a71"/>
      <rect x="139" y="49" width="82" height="38" rx="10" fill="#555a71"/>
    </pattern>
    <pattern id="grass" width="60" height="30" patternUnits="userSpaceOnUse">
      <rect width="60" height="30" fill="#2f5a3a"/>
      <path d="M8 30 L12 18 L16 30 M38 30 L42 16 L46 30" stroke="#3d7049" stroke-width="3" fill="none"/>
    </pattern>
    <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#a8713f"/><stop offset="1" stop-color="#7a4d27"/>
    </linearGradient>
    <linearGradient id="darkWood" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#6e4526"/><stop offset="1" stop-color="#4a2e18"/>
    </linearGradient>
    <linearGradient id="metal" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#5d6470"/><stop offset=".5" stop-color="#a9b1bd"/><stop offset="1" stop-color="#5d6470"/>
    </linearGradient>
    <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0d1235"/><stop offset="1" stop-color="#2c3270"/>
    </linearGradient>
    <linearGradient id="floorShade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset=".35" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="lampGlow">
      <stop offset="0" stop-color="#ffe9a8" stop-opacity=".55"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="moonGlow">
      <stop offset="0" stop-color="#fff6d0" stop-opacity=".5"/><stop offset="1" stop-color="#fff6d0" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vignette" cx=".5" cy=".5" r=".75">
      <stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/>
    </radialGradient>
  </defs>`;

  const star = (x, y, r, fill = "#ffd54a") => {
    let d = "";
    for (let i = 0; i < 10; i++) {
      const a = (Math.PI / 5) * i - Math.PI / 2;
      const rr = i % 2 ? r * 0.45 : r;
      d += `${i ? "L" : "M"}${(x + rr * Math.cos(a)).toFixed(1)} ${(y + rr * Math.sin(a)).toFixed(1)}`;
    }
    return `<path d="${d}Z" fill="${fill}" stroke="#b8860b" stroke-width="2"/>`;
  };

  // Soft drop shadow under objects
  const shadow = (x, y, rx, ry = rx * 0.18) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#000" opacity=".3"/>`;

  // A scratched mouse doodle (wall clue)
  const mouseDoodle = (x, y) => `
    <g transform="translate(${x} ${y})" fill="none" stroke="#e8e2f0" stroke-width="3" stroke-linecap="round" opacity=".8">
      <ellipse cx="0" cy="0" rx="18" ry="11"/><circle cx="-12" cy="-12" r="7"/><circle cx="-2" cy="-14" r="7"/>
      <path d="M18 2 Q32 6 30 -8"/><circle cx="-14" cy="-2" r="1.5" fill="#e8e2f0"/>
    </g>`;

  // Guard. Feet at (x, y). facing: 1 = right, -1 = left. mood: awake | sleep | eat | dance
  function guard(x, y, s = 1, { facing = 1, mood = "awake" } = {}) {
    const eyes = mood === "sleep"
      ? `<path d="M6 -240 q6 5 12 0 M24 -240 q6 5 12 0" stroke="#222" stroke-width="3" fill="none"/>`
      : `<circle cx="12" cy="-242" r="5" fill="#222"/><circle cx="30" cy="-242" r="5" fill="#222"/>
         <circle cx="13.5" cy="-243.5" r="1.6" fill="#fff"/><circle cx="31.5" cy="-243.5" r="1.6" fill="#fff"/>`;
    const sandwich = mood === "eat"
      ? `<g transform="translate(38 -205)"><rect x="-4" y="-10" width="38" height="8" rx="3" fill="#e7b96a"/>
         <rect x="-4" y="-3" width="38" height="5" fill="#7cc35a"/><rect x="-4" y="1" width="38" height="5" fill="#e0605a"/>
         <rect x="-4" y="5" width="38" height="8" rx="3" fill="#e7b96a"/></g>` : "";
    const armFront = mood === "eat"
      ? `<path d="M20 -175 Q50 -180 45 -205" stroke="#2c4a96" stroke-width="22" stroke-linecap="round" fill="none"/>`
      : mood === "dance"
      ? `<path d="M20 -175 Q55 -205 50 -245" stroke="#2c4a96" stroke-width="22" stroke-linecap="round" fill="none"/>`
      : `<path d="M22 -175 Q35 -140 30 -110" stroke="#2c4a96" stroke-width="22" stroke-linecap="round" fill="none"/>`;
    return `
    <g transform="translate(${x} ${y}) scale(${s * facing} ${s})">
      ${shadow(0, 0, 55)}
      <rect x="-30" y="-95" width="24" height="92" rx="8" fill="#1b2a55"/>
      <rect x="6" y="-95" width="24" height="92" rx="8" fill="#1b2a55"/>
      <ellipse cx="-14" cy="-4" rx="22" ry="10" fill="#111"/><ellipse cx="22" cy="-4" rx="22" ry="10" fill="#111"/>
      <path d="M-22 -175 Q-38 -140 -32 -110" stroke="#2c4a96" stroke-width="22" stroke-linecap="round" fill="none"/>
      <rect x="-45" y="-205" width="90" height="118" rx="26" fill="#3457ad"/>
      <rect x="-45" y="-110" width="90" height="14" fill="#1c1c1c"/><rect x="-8" y="-112" width="16" height="18" rx="3" fill="#e8c14a"/>
      <circle cx="-22" cy="-170" r="9" fill="#e8c14a"/>
      ${armFront}
      <circle cx="0" cy="-238" r="40" fill="#f2c9a0"/>
      <circle cx="44" cy="-232" r="9" fill="#e6a986"/>
      ${eyes}
      <path d="M14 -220 q12 10 26 0 q-4 8 -13 8 q-9 0 -13 -8z" fill="#5a3a22"/>
      <path d="M-44 -265 Q0 -305 44 -265 Z" fill="#1f3570"/>
      <rect x="-44" y="-272" width="88" height="14" rx="5" fill="#1f3570"/>
      <ellipse cx="36" cy="-260" rx="30" ry="7" fill="#15254f"/>
      <circle cx="0" cy="-280" r="8" fill="#e8c14a"/>
      ${sandwich}
    </g>`;
  }

  // Dog lying down. Feet/belly at (x, y). mood: angry | happy | sleep
  function dog(x, y, s = 1, mood = "angry") {
    const eye = mood === "sleep"
      ? `<path d="M48 -78 q7 5 14 0" stroke="#222" stroke-width="3" fill="none"/>`
      : `<circle cx="55" cy="-80" r="6" fill="#222"/><circle cx="57" cy="-82" r="2" fill="#fff"/>`;
    const brow = mood === "angry" ? `<path d="M44 -94 L66 -88" stroke="#3b2414" stroke-width="5" stroke-linecap="round"/>` : "";
    const mouth = mood === "angry"
      ? `<path d="M70 -52 q14 6 24 -2" stroke="#3b2414" stroke-width="3" fill="#fff"/><path d="M74 -50 l3 6 l3 -6 M84 -51 l3 6 l3 -6" stroke="#fff" fill="#fff"/>`
      : `<path d="M74 -54 q10 8 20 0" stroke="#3b2414" stroke-width="3" fill="none"/><path d="M82 -50 q4 12 8 0" fill="#e57373"/>`;
    return `
    <g transform="translate(${x} ${y}) scale(${s})">
      ${shadow(0, 0, 110, 16)}
      <path d="M-95 -40 Q-140 -80 -120 -100" stroke="#a0673a" stroke-width="14" stroke-linecap="round" fill="none"/>
      <ellipse cx="-20" cy="-40" rx="90" ry="42" fill="#b9783f"/>
      <ellipse cx="-30" cy="-30" rx="60" ry="22" fill="#d39a5e"/>
      <ellipse cx="-70" cy="-8" rx="28" ry="12" fill="#a0673a"/><ellipse cx="40" cy="-8" rx="28" ry="12" fill="#a0673a"/>
      <circle cx="58" cy="-75" r="40" fill="#c8864a"/>
      <ellipse cx="82" cy="-58" rx="24" ry="17" fill="#e0b07a"/>
      <circle cx="98" cy="-64" r="8" fill="#2b1a10"/>
      <path d="M28 -105 Q8 -90 20 -50 Q34 -70 40 -100 Z" fill="#7a4a26"/>
      ${eye}${brow}${mouth}
      <rect x="22" y="-48" width="50" height="10" rx="5" fill="#d33"/><circle cx="48" cy="-36" r="7" fill="#e8c14a"/>
    </g>`;
  }

  // Mester Mus (the thief). Feet at (x, y)
  function mouse(x, y, s = 1) {
    return `
    <g transform="translate(${x} ${y}) scale(${s})">
      ${shadow(0, 0, 40)}
      <path d="M30 -30 Q80 -20 70 -70" stroke="#c98d8d" stroke-width="6" fill="none" stroke-linecap="round"/>
      <rect x="-30" y="-110" width="60" height="100" rx="28" fill="#222"/>
      <path d="M-30 -90 H30 M-30 -70 H30 M-30 -50 H30 M-28 -30 H28" stroke="#eee" stroke-width="8"/>
      <circle cx="-34" cy="-178" r="26" fill="#9a9aa6"/><circle cx="34" cy="-178" r="26" fill="#9a9aa6"/>
      <circle cx="-34" cy="-178" r="15" fill="#f3b5c0"/><circle cx="34" cy="-178" r="15" fill="#f3b5c0"/>
      <ellipse cx="0" cy="-140" rx="38" ry="36" fill="#a6a6b2"/>
      <rect x="-36" y="-158" width="72" height="18" rx="9" fill="#111"/>
      <circle cx="-14" cy="-149" r="6" fill="#fff"/><circle cx="14" cy="-149" r="6" fill="#fff"/>
      <circle cx="-13" cy="-149" r="3" fill="#111"/><circle cx="15" cy="-149" r="3" fill="#111"/>
      <circle cx="0" cy="-124" r="7" fill="#f28da0"/>
      <path d="M-8 -114 q8 6 16 0" stroke="#333" stroke-width="2.5" fill="none"/>
      <path d="M-10 -124 H-38 M-10 -120 L-36 -112 M10 -124 H38 M10 -120 L36 -112" stroke="#555" stroke-width="2"/>
    </g>`;
  }

  // Ceiling lamp with glow
  const lamp = (x, len = 70) => `
    <circle cx="${x}" cy="${len + 30}" r="380" fill="url(#lampGlow)" pointer-events="none"/>
    <line x1="${x}" y1="0" x2="${x}" y2="${len}" stroke="#222" stroke-width="4"/>
    <path d="M${x - 40} ${len + 20} L${x - 18} ${len} H${x + 18} L${x + 40} ${len + 20} Z" fill="#3b3b47"/>
    <circle cx="${x}" cy="${len + 26}" r="12" fill="#fff3c4"/>`;

  return { defs, star, shadow, mouseDoodle, guard, dog, mouse, lamp };
})();
