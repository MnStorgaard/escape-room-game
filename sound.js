// Simple sound effects and background music generated in the browser (no audio files needed).
const Sound = (() => {
  let ctx = null;
  let muted = false;
  let musicTimer = null;

  function init() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
  }

  function tone(freq, start, duration, type = "sine", volume = 0.15) {
    if (!ctx || muted) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const t = ctx.currentTime + start;
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
    win: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.15, 0.35, "triangle", 0.18)),
  };

  // Soft, slightly mysterious looping melody
  const melody = [220, 262, 330, 262, 247, 294, 349, 294];
  function startMusic() {
    stopMusic();
    let step = 0;
    musicTimer = setInterval(() => {
      tone(melody[step % melody.length], 0, 0.5, "sine", 0.04);
      if (step % 4 === 0) tone(110, 0, 1.2, "sine", 0.03);
      step++;
    }, 600);
  }
  function stopMusic() {
    if (musicTimer) clearInterval(musicTimer);
    musicTimer = null;
  }

  function toggle() {
    muted = !muted;
    return muted;
  }

  return { init, play: (name) => effects[name] && effects[name](), startMusic, stopMusic, toggle };
})();
