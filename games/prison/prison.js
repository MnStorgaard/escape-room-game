// Game 2: Prison escape (normal)
Game.define("prison", {
  title: "Fængslet",
  emoji: "🔒",
  difficulty: 2,
  minutes: 20,
  accent: "#e0a526",
  tagline: "Mester Mus har snydt dig! Slip ud af cellen, forbi vagterne og ud gennem porten.",
  story: `<p>Den frække tyv <b>Mester Mus</b> 🐭 har snydt dig!<br>Nu sidder DU i fængsel, selvom du er uskyldig.</p>
          <p>Kom ud af cellen, snig dig forbi vagterne og find vej ud gennem den store port! 🏰</p>`,
  winTitle: "Du er fri!",
  music: { notes: [220, 262, 330, 262, 247, 294, 349, 294], ms: 600, wave: "sine", bass: 110 },
});
