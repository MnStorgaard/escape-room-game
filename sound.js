// Sound effects and background music generated in the browser (no audio files needed).
const Sound = (() => {
  let ctx = null;
  let muted = false;
  let musicTimer = null;

  function init() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
  }

  function tone(freq, start, duration, type = "sine", volume = 0.15, slideTo) {
    if (!ctx || muted) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    const t = ctx.currentTime + start;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + duration);
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + duration);
  }

  const effects = {
    click: () => tone(660, 0, 0.08, "triangle", 0.08),
    wrong: () => { tone(180, 0, 0.25, "square", 0.08); tone(140, 0.15, 0.3, "square", 0.08); },
    success: () => [523, 659, 784].forEach((f, i) => tone(f, i * 0.1, 0.25, "triangle", 0.15)),
    item: () => [784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.3, "sine", 0.15)),
    door: () => { tone(120, 0, 0.5, "sawtooth", 0.05); tone(90, 0.2, 0.5, "sawtooth", 0.05); },
    bark: () => { tone(320, 0, 0.12, "square", 0.1); tone(260, 0.18, 0.15, "square", 0.1); },
    radio: () => [392, 440, 523, 440, 392, 523, 587].forEach((f, i) => tone(f, i * 0.14, 0.2, "square", 0.06)),
    alarm: () => { tone(880, 0, 0.15, "square", 0.08); tone(660, 0.18, 0.15, "square", 0.08); },
    roar: () => { tone(90, 0, 0.9, "sawtooth", 0.12, 50); tone(140, 0, 0.7, "square", 0.05, 70); },
    beep: () => [1200, 900, 1500].forEach((f, i) => tone(f, i * 0.09, 0.08, "square", 0.05)),
    bell: () => [880, 660, 880, 660].forEach((f, i) => tone(f, i * 0.25, 0.4, "sine", 0.12)),
    whoosh: () => tone(200, 0, 0.6, "sawtooth", 0.04, 1200),
    ghost: () => { tone(400, 0, 1.4, "sine", 0.1, 250); tone(406, 0, 1.4, "sine", 0.08, 255); },
    creak: () => tone(60, 0, 0.9, "sawtooth", 0.07, 110),
    scare: () => { tone(110, 0, 0.5, "sawtooth", 0.15); tone(116, 0, 0.5, "sawtooth", 0.15); tone(1800, 0, 0.3, "square", 0.04, 900); },
    win: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.15, 0.35, "triangle", 0.18)),
  };

  // music: { notes, ms, wave, bass } — each game has its own loop
  const DEFAULT_MUSIC = { notes: [220, 262, 330, 262, 247, 294, 349, 294], ms: 600, wave: "sine", bass: 110 };
  function startMusic(music = DEFAULT_MUSIC) {
    stopMusic();
    let step = 0;
    musicTimer = setInterval(() => {
      const n = music.notes[step % music.notes.length];
      if (n) tone(n, 0, (music.ms / 1000) * 0.9, music.wave, 0.04);
      if (music.bass && step % 4 === 0) tone(music.bass, 0, (music.ms / 1000) * 2, "sine", 0.03);
      step++;
    }, music.ms);
  }
  function stopMusic() {
    if (musicTimer) clearInterval(musicTimer);
    musicTimer = null;
  }

  function toggle() {
    muted = !muted;
    return muted;
  }

  return { init, play: (name) => effects[name] && effects[name](), note: (f) => tone(f, 0, 0.45, "triangle", 0.15), startMusic, stopMusic, toggle };
})();
