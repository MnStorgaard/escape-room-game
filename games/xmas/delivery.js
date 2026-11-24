// Minigame: "Leveringsprøven" – drop presents into chimneys from the flying sleigh.
// Each hit reveals one digit of the code. Kind to kids: digits you have won are kept,
// the sleigh slows down after a failed round, and an aim helper appears after a few misses.
const Delivery = (() => {
  let Delivery; // the public object (defined at the bottom)
  const W = 960, H = 540, GROUND = 478, SLEIGH_X = 230, GRAVITY = 760, GIFTS = 10, NEEDED = 3;
  const DROP_Y = 150, DROP_VY = 40, CHIM_TOP = 300; // all chimney tops share one height, so the timing is always the same
  const WALLS = ["#b8453c", "#3f6fa0", "#d39a3a", "#4c8a52", "#8a5aa8"];
  const GIFT_COLORS = ["#e53935", "#43a047", "#1e88e5", "#fdd835", "#ab47bc"];

  function open(api, { digits, onWin }) {
    const flags = Game.state.flags;
    flags.dHits = flags.dHits || 0;
    flags.dFails = flags.dFails || 0;
    flags.dMisses = flags.dMisses || 0;

    let ctx, raf = 0, last = 0, t = 0, running = false;
    let houses = [], gifts = [], fx = [], floaters = [], snow = [], stars = [];
    let giftsLeft = GIFTS, speed = 150, hillX = 0;

    // Opened at the end of open() (see below), after all state above exists

    function mount(root) {
      const canvas = root.querySelector("#mgCanvas");
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx = canvas.getContext("2d");
      ctx.scale(dpr, dpr);
      canvas.addEventListener("pointerdown", (e) => { e.preventDefault(); drop(); });
      window.addEventListener("keydown", onKey);
      for (let i = 0; i < 70; i++) stars.push({ x: Math.random() * W, y: Math.random() * 260, r: Math.random() * 1.6 + 0.4, p: Math.random() * 6 });
      for (let i = 0; i < 60; i++) snow.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 2.2 + 0.8, s: 20 + Math.random() * 40 });
      reset();
      overlay("start");
      raf = requestAnimationFrame(loop);
    }

    function onKey(e) { if (e.code === "Space") { e.preventDefault(); drop(); } }
    function stop() { cancelAnimationFrame(raf); window.removeEventListener("keydown", onKey); }

    function reset() {
      houses = []; gifts = []; fx = []; floaters = [];
      giftsLeft = GIFTS;
      speed = Math.max(95, 150 * Math.pow(0.85, flags.dFails));
      let x = 420;
      while (x < W + 400) x = addHouse(x);
    }

    function addHouse(x) {
      const w = 150 + Math.random() * 80;
      const base = 372 + Math.random() * 22;
      const peak = base - 40 - Math.random() * 16; // always lower than the chimney tops
      const chimRel = 0.25 + Math.random() * 0.5;
      houses.push({ x, w, base, peak, chimRel, chimW: 46, chimH: 46, hit: false, wall: WALLS[houses.length % WALLS.length], seed: Math.random() * 10 });
      return x + w + 70 + Math.random() * 110;
    }

    const roofY = (h, px) => h.peak + (Math.abs(px - (h.x + h.w / 2)) / (h.w / 2 + 12)) * (h.base - h.peak);
    const chimX = (h) => h.x + h.w * h.chimRel;
    const chimTop = () => CHIM_TOP;
    const fallTime = () => (-DROP_VY + Math.sqrt(DROP_VY * DROP_VY + 2 * GRAVITY * (CHIM_TOP - DROP_Y))) / GRAVITY;

    function drop() {
      if (!running || giftsLeft <= 0 || gifts.filter((g) => g.alive).length >= 2) return;
      giftsLeft--;
      gifts.push({ x: SLEIGH_X + 10, y: DROP_Y, vy: DROP_VY, alive: true, c: GIFT_COLORS[giftsLeft % GIFT_COLORS.length], rot: 0 });
      Sound.play("whoosh");
    }

    function overlay(kind) {
      const el = document.getElementById("mgOverlay");
      if (!el) return;
      running = false;
      const code = digits.map((d, i) => (i < flags.dHits ? d : "_")).join(" ");
      const html = {
        start: `<div class="mg-title">🛷 Leveringsprøven</div>
          <p>Julemanden har en regel: Ingen må flyve slæden uden at bestå <b>leveringsprøven</b>!</p>
          <p>Slip gaverne ned i <b>${NEEDED} skorstene</b>. Hver gang du rammer, får du et tal til tændingskoden.</p>
          <p class="mg-tip">💡 Gaven falder lidt tid – slip den, <b>før</b> skorstenen er lige under slæden.</p>
          ${flags.dHits ? `<p>Du har allerede: <b>${code}</b></p>` : ""}
          <button class="action mg-btn" id="mgGo">▶ Start!</button>`,
        fail: `<div class="mg-title">Øv! 🎁</div><p>Slæden løb tør for gaver.</p>
          <p>Du beholder dine tal: <b class="mg-code">${code}</b></p><p>Slæden flyver lidt langsommere nu.</p>
          <button class="action mg-btn" id="mgGo">🔁 Prøv igen</button>`,
        win: `<div class="mg-title">Bestået! 🎉</div><p>Alle gaverne landede, hvor de skulle. Julemanden ville være stolt!</p>
          <p>Skærmen viser din kode:</p><p class="mg-code big">${digits.join(" ")}</p>
          <button class="action mg-btn" id="mgGo">Videre ✨</button>`,
      }[kind];
      el.innerHTML = html;
      el.classList.add("show");
      el.querySelector("#mgGo").addEventListener("click", () => {
        if (kind === "win") { api.close(); onWin(); return; }
        if (kind === "fail") reset();
        el.classList.remove("show");
        running = true;
        Sound.play("click");
      });
    }

    // ---------- Update ----------
    function update(dt) {
      t += dt;
      hillX = (hillX - speed * 0.25 * dt) % 600;
      snow.forEach((s) => { s.y += s.s * dt; s.x -= speed * 0.3 * dt; if (s.y > H) { s.y = -5; s.x = Math.random() * W; } if (s.x < 0) s.x += W; });
      if (!running) return;
      houses.forEach((h) => { h.x -= speed * dt; });
      houses = houses.filter((h) => h.x + h.w > -80);
      const lastH = houses[houses.length - 1];
      if (lastH.x + lastH.w < W + 300) addHouse(lastH.x + lastH.w + 70 + Math.random() * 110);

      gifts.forEach((g) => {
        if (!g.alive) return;
        const prevY = g.y;
        g.vy += GRAVITY * dt;
        g.y += g.vy * dt;
        g.rot += dt * 3;
        const h = houses.find((hh) => g.x >= hh.x - 12 && g.x <= hh.x + hh.w + 12);
        if (h) {
          const cx = chimX(h), top = chimTop(h);
          if (!h.hit && prevY < top && g.y >= top && Math.abs(g.x - cx) <= h.chimW / 2 + 8) return hit(g, h);
          if (g.y + 10 >= roofY(h, g.x) && !(Math.abs(g.x - cx) <= h.chimW / 2 && g.y < roofY(h, cx))) return miss(g);
        } else if (g.y + 10 >= GROUND) return miss(g);
      });
      gifts = gifts.filter((g) => g.alive);
      fx.forEach((p) => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 200 * dt; p.life -= dt; });
      fx = fx.filter((p) => p.life > 0);
      floaters.forEach((f) => { f.y -= 50 * dt; f.life -= dt; });
      floaters = floaters.filter((f) => f.life > 0);

      if (flags.dHits >= NEEDED && !floaters.length) return overlay("win");
      if (giftsLeft <= 0 && !gifts.length && flags.dHits < NEEDED) { flags.dFails++; overlay("fail"); }
    }

    function hit(g, h) {
      g.alive = false;
      h.hit = true;
      const d = digits[flags.dHits];
      flags.dHits++;
      Sound.play("bell");
      for (let i = 0; i < 26; i++) fx.push({ x: chimX(h), y: chimTop(h), vx: (Math.random() - 0.5) * 260, vy: -Math.random() * 260 - 60, life: 0.9, c: ["#ffd86b", "#fff", "#ff8a8a"][i % 3] });
      floaters.push({ x: chimX(h), y: chimTop(h) - 20, text: `${d}`, life: 1.4, big: true });
    }

    function miss(g) {
      g.alive = false;
      flags.dMisses++;
      Sound.play("click");
      for (let i = 0; i < 12; i++) fx.push({ x: g.x, y: g.y, vx: (Math.random() - 0.5) * 160, vy: -Math.random() * 120, life: 0.6, c: "#fff" });
      floaters.push({ x: g.x, y: g.y - 20, text: "Puf!", life: 0.8 });
    }

    // ---------- Draw ----------
    function draw() {
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#0b1433"); sky.addColorStop(0.7, "#2c3a74"); sky.addColorStop(1, "#4a5a9a");
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
      stars.forEach((s) => { ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 2 + s.p); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill(); });
      ctx.globalAlpha = 1;
      const mg = ctx.createRadialGradient(820, 90, 10, 820, 90, 110);
      mg.addColorStop(0, "rgba(255,248,220,.6)"); mg.addColorStop(1, "rgba(255,248,220,0)");
      ctx.fillStyle = mg; ctx.fillRect(700, 0, 260, 220);
      circle(820, 90, 38, "#fff6d8");

      // Hills (parallax)
      ctx.fillStyle = "#c9d6f0";
      for (let k = -1; k < 3; k++) { const ox = hillX + k * 600; ctx.beginPath(); ctx.moveTo(ox, GROUND); ctx.quadraticCurveTo(ox + 150, 330, ox + 300, GROUND - 40); ctx.quadraticCurveTo(ox + 450, 360, ox + 600, GROUND); ctx.fill(); }

      // Aim helper (after a failed round or many misses)
      if (running && (flags.dFails > 0 || flags.dMisses >= 4)) {
        const ax = SLEIGH_X + 10 + speed * fallTime();
        ctx.setLineDash([6, 8]); ctx.strokeStyle = "rgba(255,230,140,.55)"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(ax, 200); ctx.lineTo(ax, GROUND); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = "rgba(255,230,140,.9)"; ctx.font = "bold 14px Trebuchet MS"; ctx.textAlign = "center";
        ctx.fillText("slip, når skorstenen er her", ax, 194);
      }

      houses.forEach(drawHouse);
      ctx.fillStyle = "#f2f6ff"; ctx.fillRect(0, GROUND, W, H - GROUND);
      ctx.fillStyle = "#dfe8fa"; for (let i = 0; i < W; i += 60) { ctx.beginPath(); ctx.ellipse(i + ((t * -speed) % 60), GROUND + 6, 40, 8, 0, 0, 7); ctx.fill(); }

      gifts.forEach(drawGift);
      drawSleigh();
      fx.forEach((p) => { ctx.globalAlpha = Math.max(0, p.life); circle(p.x, p.y, 3, p.c); });
      ctx.globalAlpha = 1;
      floaters.forEach((f) => {
        ctx.globalAlpha = Math.min(1, f.life * 1.5);
        ctx.textAlign = "center";
        ctx.font = f.big ? "bold 56px Georgia" : "bold 22px Trebuchet MS";
        ctx.lineWidth = 6; ctx.strokeStyle = "#3a1a08"; ctx.strokeText(f.text, f.x, f.y);
        ctx.fillStyle = f.big ? "#ffd86b" : "#fff"; ctx.fillText(f.text, f.x, f.y);
      });
      ctx.globalAlpha = 1;
      snow.forEach((s) => circle(s.x, s.y, s.r, "rgba(255,255,255,.85)"));
      drawHud();
    }

    function drawHouse(h) {
      const { x, w, base, peak } = h;
      ctx.fillStyle = h.wall; ctx.fillRect(x, base, w, GROUND - base);
      ctx.fillStyle = "rgba(0,0,0,.12)"; ctx.fillRect(x + w * 0.7, base, w * 0.3, GROUND - base);
      // Windows and door
      const wy = base + 26;
      [[x + 20, wy], [x + w - 56, wy]].forEach(([wx, yy]) => {
        const gl = ctx.createRadialGradient(wx + 18, yy + 18, 4, wx + 18, yy + 18, 40);
        gl.addColorStop(0, "rgba(255,210,120,.6)"); gl.addColorStop(1, "rgba(255,210,120,0)");
        ctx.fillStyle = gl; ctx.fillRect(wx - 22, yy - 22, 80, 80);
        rect(wx, yy, 36, 36, "#ffd47a"); ctx.strokeStyle = "#5a3418"; ctx.lineWidth = 4; ctx.strokeRect(wx, yy, 36, 36);
        ctx.beginPath(); ctx.moveTo(wx + 18, yy); ctx.lineTo(wx + 18, yy + 36); ctx.moveTo(wx, yy + 18); ctx.lineTo(wx + 36, yy + 18); ctx.stroke();
      });
      rect(x + w / 2 - 16, GROUND - 52, 32, 52, "#5a3418");
      // Roof with snow
      ctx.fillStyle = "#4a2a2a"; ctx.beginPath(); ctx.moveTo(x - 12, base); ctx.lineTo(x + w / 2, peak); ctx.lineTo(x + w + 12, base); ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 9; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(x - 10, base - 2); ctx.lineTo(x + w / 2, peak + 2); ctx.lineTo(x + w + 10, base - 2); ctx.stroke();
      // Chimney
      const cx = chimX(h), top = chimTop(h), ry = roofY(h, cx);
      if (h.hit) { const g = ctx.createRadialGradient(cx, top, 5, cx, top, 70); g.addColorStop(0, "rgba(255,220,120,.8)"); g.addColorStop(1, "rgba(255,220,120,0)"); ctx.fillStyle = g; ctx.fillRect(cx - 70, top - 70, 140, 140); }
      rect(cx - h.chimW / 2, top, h.chimW, ry - top + 12, "#9a3a2a");
      ctx.fillStyle = "rgba(0,0,0,.2)"; for (let r = 0; r < 3; r++) ctx.fillRect(cx - h.chimW / 2, top + 12 + r * 14, h.chimW, 3);
      rect(cx - h.chimW / 2 - 5, top - 8, h.chimW + 10, 12, "#7a2a1a");
      rect(cx - h.chimW / 2 - 4, top - 14, h.chimW + 8, 8, "#fff");
      // Smoke (or sparkles once hit)
      for (let i = 0; i < 3; i++) {
        const k = (t * 0.6 + i / 3 + h.seed) % 1;
        ctx.globalAlpha = (1 - k) * 0.5;
        circle(cx + Math.sin((k + h.seed) * 6) * 8, top - 20 - k * 70, 8 + k * 12, h.hit ? "#ffe9a0" : "#dfe4ee");
      }
      ctx.globalAlpha = 1;
    }

    function drawGift(g) {
      ctx.save(); ctx.translate(g.x, g.y); ctx.rotate(Math.sin(g.rot) * 0.3);
      rect(-11, -11, 22, 22, g.c);
      rect(-3, -11, 6, 22, "#ffd86b"); rect(-11, -3, 22, 6, "#ffd86b");
      ctx.restore();
    }

    function drawSleigh() {
      const y = 112 + Math.sin(t * 2.2) * 6;
      // Sparkle trail
      for (let i = 0; i < 10; i++) { ctx.globalAlpha = 0.5 - i * 0.045; circle(SLEIGH_X - 70 - i * 18, y + 28 + Math.sin(t * 4 + i) * 4, 3 - i * 0.2, "#ffe9a0"); }
      ctx.globalAlpha = 1;
      // Reindeer
      [[SLEIGH_X + 140, 0], [SLEIGH_X + 215, -6]].forEach(([rx, dy]) => {
        const ry = y + dy + Math.sin(t * 6 + rx) * 3;
        ctx.strokeStyle = "#e8b04a"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(SLEIGH_X + 60, y + 10); ctx.lineTo(rx - 20, ry + 4); ctx.stroke();
        ctx.fillStyle = "#8a5a36";
        ctx.beginPath(); ctx.ellipse(rx, ry, 26, 12, 0, 0, 7); ctx.fill();
        ctx.fillRect(rx - 18, ry + 6, 5, 18 + Math.sin(t * 10 + rx) * 4); ctx.fillRect(rx + 14, ry + 6, 5, 18 - Math.sin(t * 10 + rx) * 4);
        ctx.beginPath(); ctx.ellipse(rx + 30, ry - 14, 11, 8, -0.4, 0, 7); ctx.fill();
        ctx.strokeStyle = "#d8c09a"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(rx + 26, ry - 20); ctx.lineTo(rx + 20, ry - 36); ctx.moveTo(rx + 23, ry - 28); ctx.lineTo(rx + 14, ry - 32); ctx.stroke();
        circle(rx + 40, ry - 14, 3, "#2a1a10");
      });
      // Sleigh body
      ctx.fillStyle = "#c62828";
      ctx.beginPath(); ctx.moveTo(SLEIGH_X - 60, y - 10); ctx.quadraticCurveTo(SLEIGH_X - 70, y + 30, SLEIGH_X - 40, y + 30); ctx.lineTo(SLEIGH_X + 50, y + 30);
      ctx.quadraticCurveTo(SLEIGH_X + 75, y + 20, SLEIGH_X + 70, y - 2); ctx.lineTo(SLEIGH_X + 40, y + 4); ctx.lineTo(SLEIGH_X - 40, y + 4); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#e8b04a"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(SLEIGH_X - 55, y + 42); ctx.lineTo(SLEIGH_X + 60, y + 42); ctx.quadraticCurveTo(SLEIGH_X + 85, y + 40, SLEIGH_X + 80, y + 26); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(SLEIGH_X - 30, y + 30); ctx.lineTo(SLEIGH_X - 30, y + 42); ctx.moveTo(SLEIGH_X + 40, y + 30); ctx.lineTo(SLEIGH_X + 40, y + 42); ctx.stroke();
      // Gift sack and the elf (you)
      ctx.fillStyle = "#8a1d1d"; ctx.beginPath(); ctx.ellipse(SLEIGH_X - 30, y - 6, 26, 22, 0, 0, 7); ctx.fill();
      for (let i = 0; i < giftsLeft && i < 4; i++) rect(SLEIGH_X - 46 + i * 9, y - 30 - (i % 2) * 6, 12, 12, GIFT_COLORS[i]);
      circle(SLEIGH_X + 20, y - 18, 12, "#f6c9a0");
      ctx.fillStyle = "#2e7d32"; ctx.beginPath(); ctx.moveTo(SLEIGH_X + 8, y - 22); ctx.quadraticCurveTo(SLEIGH_X + 20, y - 50, SLEIGH_X + 40, y - 40); ctx.lineTo(SLEIGH_X + 32, y - 24); ctx.fill();
      rect(SLEIGH_X + 8, y - 6, 24, 14, "#2e7d32");
    }

    function drawHud() {
      ctx.textAlign = "left"; ctx.font = "bold 20px Trebuchet MS";
      rrect(14, 12, 190, 40, "rgba(10,15,40,.6)");
      ctx.fillStyle = "#fff"; ctx.fillText(`🎁 × ${giftsLeft}`, 28, 39);
      const code = digits.map((d, i) => (i < flags.dHits ? d : "?"));
      rrect(W / 2 - 120, 12, 240, 44, "rgba(10,15,40,.6)");
      ctx.textAlign = "center"; ctx.fillStyle = "#ffe3a3"; ctx.font = "bold 14px Trebuchet MS"; ctx.fillText("TÆNDINGSKODE", W / 2 - 50, 39);
      code.forEach((c, i) => { rrect(W / 2 + 8 + i * 36, 18, 30, 32, c === "?" ? "rgba(255,255,255,.15)" : "#ffd86b"); ctx.fillStyle = c === "?" ? "#ccc" : "#3a1a08"; ctx.font = "bold 22px Georgia"; ctx.fillText(c, W / 2 + 23 + i * 36, 42); });
      rrect(W - 174, 12, 160, 40, "rgba(10,15,40,.6)");
      ctx.textAlign = "right"; ctx.fillStyle = "#fff"; ctx.font = "bold 20px Trebuchet MS"; ctx.fillText(`Ramt: ${flags.dHits}/${NEEDED}`, W - 28, 39);
    }

    // ---------- Helpers ----------
    function circle(x, y, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, Math.max(0.1, r), 0, 7); ctx.fill(); }
    function rect(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }
    function rrect(x, y, w, h, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, 10) : ctx.rect(x, y, w, h); ctx.fill(); }

    function loop(now) {
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      update(dt);
      draw();
      raf = requestAnimationFrame(loop);
    }

    // Read-only hook used by automated tests
    Delivery._test = { houses: () => houses, chimX, speed: () => speed, fall: fallTime, drop, sleighX: SLEIGH_X };

    api.modal(`
      <div class="mg-wrap">
        <canvas id="mgCanvas"></canvas>
        <div id="mgOverlay" class="mg-overlay"></div>
      </div>
      <p class="small-text mg-help">Klik på billedet eller tryk på <b>mellemrum</b> for at slippe en gave.</p>`,
      mount, false, { cls: "wide", onClose: () => stop() });
  }

  Delivery = { open };
  return Delivery;
})();
