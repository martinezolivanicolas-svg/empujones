// EMPUJONES — cliente (dibuja el juego y envía tus teclas al servidor)
const socket = io();
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const joinEl = document.getElementById('join');
const nameEl = document.getElementById('name');
const roomEl = document.getElementById('room');
const charsEl = document.getElementById('chars');
const shareEl = document.getElementById('share');

let myId = null;
let state = null;
const shown = new Map();   // posiciones suavizadas por jugador
const feed = [];           // mensajes tipo "X empujó a Y"
const particles = [];
const shocks = [];         // ondas expansivas de la bomba
let shake = 0;

// ---------- Selector de personaje ----------
let myChar = null;
try { myChar = localStorage.getItem('empujones-personaje'); } catch {}
if (!CHAR_BY_ID[myChar]) myChar = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)].id;

const charButtons = [];
for (const c of CHARACTERS) {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'char'; b.setAttribute('role', 'radio');
  b.dataset.id = c.id;
  const cv = document.createElement('canvas');
  const dpr = devicePixelRatio || 1;
  cv.width = 54 * dpr; cv.height = 54 * dpr;
  b.append(cv, document.createTextNode(c.name));
  b.onclick = () => selectChar(c.id);
  charsEl.append(b);
  charButtons.push({ b, cv, id: c.id });
}
function selectChar(id) {
  myChar = id;
  try { localStorage.setItem('empujones-personaje', id); } catch {}
  for (const { b } of charButtons) b.setAttribute('aria-checked', String(b.dataset.id === id));
}
selectChar(myChar);
function drawCharButtons(now) {
  if (joinEl.style.display === 'none') return;
  for (const { cv, id } of charButtons) {
    const c = cv.getContext('2d'), dpr = devicePixelRatio || 1;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, 54, 54);
    const bob = id === myChar ? Math.sin(now / 180) * 2 : 0;
    drawCharacter(c, id, 27, 31 + bob, 16, { t: now });
  }
}

// ---------- Bots ----------
const BOTS_MAX = 7;
const botsOnEl = document.getElementById('botsOn');
const botsStepperEl = document.getElementById('botsStepper');
const botsCountEl = document.getElementById('botsCount');
const botsMinusEl = document.getElementById('botsMinus');
const botsPlusEl = document.getElementById('botsPlus');
let botsCount = 3;
try {
  const saved = JSON.parse(localStorage.getItem('empujones-bots') || 'null');
  if (saved) { botsOnEl.checked = !!saved.on; botsCount = Math.min(BOTS_MAX, Math.max(1, saved.n | 0)) || 3; }
} catch {}
function renderBots() {
  botsStepperEl.hidden = !botsOnEl.checked;
  botsCountEl.textContent = botsCount;
  botsMinusEl.disabled = botsCount <= 1;
  botsPlusEl.disabled = botsCount >= BOTS_MAX;
  try { localStorage.setItem('empujones-bots', JSON.stringify({ on: botsOnEl.checked, n: botsCount })); } catch {}
}
botsOnEl.onchange = renderBots;
botsMinusEl.onclick = () => { botsCount = Math.max(1, botsCount - 1); renderBots(); };
botsPlusEl.onclick = () => { botsCount = Math.min(BOTS_MAX, botsCount + 1); renderBots(); };
renderBots();

// ---------- Unirse ----------
const params = new URLSearchParams(location.search);
roomEl.value = params.get('sala') || '';
try { nameEl.value = localStorage.getItem('empujones-nombre') || ''; } catch {}
nameEl.focus();

function join() {
  const name = nameEl.value.trim() || 'Anónimo';
  try { localStorage.setItem('empujones-nombre', name); } catch {}
  socket.emit('join', { name, roomId: roomEl.value.trim() || 'principal', char: myChar,
    bots: botsOnEl.checked ? botsCount : 0 });
}
document.getElementById('play').onclick = join;
[nameEl, roomEl].forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter') join(); }));

socket.on('joined', ({ id, roomId }) => {
  myId = id;
  joinEl.style.display = 'none';
  const url = `${location.origin}${location.pathname}?sala=${encodeURIComponent(roomId)}`;
  history.replaceState(null, '', url);
  shareEl.textContent = `Sala "${roomId}" · toca para copiar el enlace e invitar`;
  shareEl.style.display = 'block';
  shareEl.onclick = () => {
    navigator.clipboard?.writeText(url).then(() => {
      shareEl.textContent = '¡Enlace copiado! Pásalo por el grupo 📋';
    }).catch(() => {});
  };
});
socket.on('full', () => alert('La sala está llena (máx. 12). Prueba otra sala.'));
socket.on('disconnect', () => { pushFeed('Conexión perdida… recarga la página'); });

socket.on('state', s => {
  // Efectos: si alguien desaparece, explosión de partículas
  if (state) {
    for (const p of s.players) {
      const prev = state.players.find(q => q.id === p.id);
      if (prev && prev.alive && !p.alive) burst(prev.x, prev.y, charColor(p.char), 40);
    }
    // Poder recogido: chispas donde estaba
    for (const pu of state.powerups) {
      if (!s.powerups.some(q => q.id === pu.id) && pu.age < 9.8) burst(pu.x, pu.y, '#ffd23f', 18, false);
    }
  }
  for (const f of s.fx) if (f.type === 'shock') { shocks.push({ x: f.x, y: f.y, r: f.r, t0: performance.now() }); shake = 20; }
  for (const e of s.events) pushFeed(e.text);
  state = s;
});

function pushFeed(text) {
  feed.push({ text, t: performance.now() });
  if (feed.length > 5) feed.shift();
}

// ---------- Controles ----------
const keys = { up: false, down: false, left: false, right: false };
const keyMap = { KeyW: 'up', ArrowUp: 'up', KeyS: 'down', ArrowDown: 'down',
  KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right' };
let lastSent = '';
function sendInput() {
  const s = JSON.stringify(keys);
  if (s !== lastSent) { lastSent = s; socket.emit('input', keys); }
}
addEventListener('keydown', e => {
  if (!myId) return;
  if (keyMap[e.code]) { keys[keyMap[e.code]] = true; sendInput(); e.preventDefault(); }
  if (e.code === 'Space' && !e.repeat) { socket.emit('dash'); e.preventDefault(); }
});
addEventListener('keyup', e => {
  if (keyMap[e.code]) { keys[keyMap[e.code]] = false; sendInput(); }
});
addEventListener('blur', () => { for (const k in keys) keys[k] = false; sendInput(); });

// Táctil: un dedo = joystick, segundo dedo (o toque corto) = embestir
let joy = null;
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  for (const t of e.changedTouches) {
    if (!joy) joy = { id: t.identifier, x0: t.clientX, y0: t.clientY, x: t.clientX, y: t.clientY, start: performance.now() };
    else socket.emit('dash');
  }
}, { passive: false });
canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  for (const t of e.changedTouches) if (joy && t.identifier === joy.id) {
    joy.x = t.clientX; joy.y = t.clientY;
    const dx = joy.x - joy.x0, dy = joy.y - joy.y0, dead = 14;
    keys.left = dx < -dead; keys.right = dx > dead; keys.up = dy < -dead; keys.down = dy > dead;
    sendInput();
  }
}, { passive: false });
canvas.addEventListener('touchend', e => {
  for (const t of e.changedTouches) if (joy && t.identifier === joy.id) {
    if (performance.now() - joy.start < 180 && Math.hypot(joy.x - joy.x0, joy.y - joy.y0) < 10) socket.emit('dash');
    joy = null; for (const k in keys) keys[k] = false; sendInput();
  }
});

// ---------- Dibujo ----------
function resize() {
  const dpr = devicePixelRatio || 1;
  canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
addEventListener('resize', resize); resize();

function burst(x, y, color, n, doShake = true) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, s = 80 + Math.random() * 260;
    particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, color });
  }
  if (doShake) shake = 12;
}

const EFFECT_ICONS = { gigante: '🍄', turbo: '⚡', fantasma: '👻', muro: '🧱', mareado: '😵', resbalando: '🧊' };
const EFFECT_NAMES = { gigante: 'GIGANTE', turbo: 'TURBO', fantasma: 'FANTASMA', muro: 'MURO', mareado: 'MAREADO', resbalando: 'RESBALANDO' };
const EFFECT_DUR = { gigante: 6, turbo: 5, fantasma: 6, muro: 5, mareado: 4, resbalando: 5 };

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  const W = innerWidth, H = innerHeight;
  ctx.fillStyle = '#14121f'; ctx.fillRect(0, 0, W, H);
  drawCharButtons(now);

  if (state) {
    const scale = Math.min(W, H) / (state.arenaStart * 2 + 90);
    shake *= 0.88;
    ctx.save();
    ctx.translate(W / 2 + (Math.random() - .5) * shake, H / 2 + (Math.random() - .5) * shake);
    ctx.scale(scale, scale);

    // Arena: zona original (fantasma) + zona actual
    ctx.beginPath(); ctx.arc(0, 0, state.arenaStart, 0, Math.PI * 2);
    ctx.fillStyle = '#1b1830'; ctx.fill();
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, state.arena);
    g.addColorStop(0, '#3b3266'); g.addColorStop(1, '#2a2348');
    ctx.beginPath(); ctx.arc(0, 0, state.arena, 0, Math.PI * 2);
    ctx.fillStyle = g; ctx.fill();
    const danger = state.phase === 'playing' && state.arena < state.arenaStart;
    ctx.lineWidth = 8;
    ctx.strokeStyle = danger ? `rgba(255,93,93,${0.6 + 0.4 * Math.sin(now / 120)})` : '#ffd23f';
    ctx.stroke();
    ctx.strokeStyle = '#ffffff10'; ctx.lineWidth = 2;
    for (let r = 60; r < state.arena; r += 60) { ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke(); }

    // Poderes en el suelo
    for (const pu of state.powerups) {
      const def = state.powers[pu.type];
      const bob = Math.sin(now / 250 + pu.id) * 4;
      const blink = pu.age > 8 && Math.sin(now / 60) > 0; // parpadea antes de desaparecer
      if (blink) continue;
      const glow = ctx.createRadialGradient(pu.x, pu.y + bob, 4, pu.x, pu.y + bob, 30);
      glow.addColorStop(0, '#ffffffaa'); glow.addColorStop(1, '#ffffff00');
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(pu.x, pu.y + bob, 30, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(pu.x, pu.y + bob, 19, 0, Math.PI * 2);
      ctx.fillStyle = '#1b1830cc'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = `hsl(${(now / 5 + pu.id * 60) % 360} 90% 65%)`; ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = '24px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(def.icon, pu.x, pu.y + bob + 1);
      ctx.textBaseline = 'alphabetic';
    }

    // Ondas expansivas
    for (let i = shocks.length - 1; i >= 0; i--) {
      const s = shocks[i], k = (now - s.t0) / 450;
      if (k >= 1) { shocks.splice(i, 1); continue; }
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r * k, 0, Math.PI * 2);
      ctx.lineWidth = 14 * (1 - k); ctx.strokeStyle = `rgba(255,140,66,${1 - k})`; ctx.stroke();
      ctx.fillStyle = `rgba(255,210,63,${0.15 * (1 - k)})`; ctx.fill();
    }

    // Partículas
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.94; p.vy *= 0.94; p.life -= dt * 1.4;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.globalAlpha = p.life; ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, 5 * p.life + 1, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Jugadores
    for (const p of state.players) {
      let s = shown.get(p.id);
      if (!s || !p.alive) { s = { x: p.x, y: p.y, r: p.r }; shown.set(p.id, s); }
      const k = Math.min(1, dt * 22);
      s.x += (p.x - s.x) * k; s.y += (p.y - s.y) * k; s.r += (p.r - s.r) * Math.min(1, dt * 10);
      if (!p.alive) continue;
      const me = p.id === myId, R = s.r, fx = p.fx || {};
      const color = charColor(p.char);
      const hidden = fx.fantasma && !me;
      ctx.globalAlpha = fx.fantasma ? (me ? 0.4 : 0.04) : 1;

      ctx.beginPath(); ctx.ellipse(s.x, s.y + R * 0.75, R * 0.9, R * 0.35, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#0005'; ctx.fill();

      // Auras de efectos
      if (p.dashing) { ctx.beginPath(); ctx.arc(s.x, s.y, R + 9, 0, Math.PI * 2); ctx.fillStyle = color + '55'; ctx.fill(); }
      if (fx.turbo) { ctx.beginPath(); ctx.arc(s.x, s.y, R + 6 + Math.sin(now / 50) * 2, 0, Math.PI * 2); ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 3; ctx.stroke(); }
      if (fx.muro) { ctx.beginPath(); ctx.arc(s.x, s.y, R + 6, 0, Math.PI * 2); ctx.strokeStyle = '#b0b8c4'; ctx.lineWidth = 7; ctx.stroke(); }
      if (fx.resbalando) { ctx.beginPath(); ctx.arc(s.x, s.y, R + 5, 0, Math.PI * 2); ctx.fillStyle = '#9be7ff55'; ctx.fill(); }

      drawCharacter(ctx, p.char, s.x, s.y, R, { outline: me ? '#fff' : '#0006', outlineWidth: me ? 5 : 3, t: now });

      if (fx.mareado) { // estrellitas girando
        for (let i = 0; i < 3; i++) {
          const a = now / 200 + i * 2.1;
          ctx.font = '14px sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
          ctx.fillText('⭐', s.x + Math.cos(a) * (R + 4), s.y - R - 4 + Math.sin(a) * 6);
        }
      }
      // Recarga del embiste (solo el tuyo)
      if (me && p.cd > 0) {
        ctx.beginPath(); ctx.arc(s.x, s.y, R + 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - p.cd / (p.cdMax || 1.2)));
        ctx.strokeStyle = '#ffffffaa'; ctx.lineWidth = 3; ctx.stroke();
      }
      if (!hidden) {
        const icons = Object.keys(fx).map(k => EFFECT_ICONS[k]).filter(Boolean).join('');
        const label = (icons ? icons + ' ' : '') + p.name;
        ctx.font = '800 16px Nunito, sans-serif'; ctx.textAlign = 'center';
        ctx.lineWidth = 4; ctx.strokeStyle = '#000a'; ctx.strokeText(label, s.x, s.y - R - 12);
        ctx.fillStyle = '#fff'; ctx.fillText(label, s.x, s.y - R - 12);
      }
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    drawHud(W, H, now);
  }

  // Joystick táctil
  if (joy) {
    ctx.beginPath(); ctx.arc(joy.x0, joy.y0, 50, 0, Math.PI * 2); ctx.strokeStyle = '#fff4'; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.arc(joy.x, joy.y, 22, 0, Math.PI * 2); ctx.fillStyle = '#fff4'; ctx.fill();
  }
  requestAnimationFrame(frame);
}

function drawHud(W, H, now) {
  // Marcador
  const list = [...state.players].sort((a, b) => b.score - a.score);
  ctx.textAlign = 'left'; ctx.font = '800 15px Nunito, sans-serif';
  const bw = 190, bx = W - bw - 14;
  ctx.fillStyle = '#0007'; roundRect(bx, 14, bw, 30 + list.length * 24, 12); ctx.fill();
  ctx.fillStyle = '#a49cc4'; ctx.fillText('PUNTOS', bx + 12, 34);
  list.forEach((p, i) => {
    const y = 58 + i * 24;
    drawCharacter(ctx, p.char, bx + 20, y - 5, 9, { t: now });
    ctx.fillStyle = p.alive ? '#fff' : '#fff6';
    ctx.font = '800 15px Nunito, sans-serif';
    ctx.fillText((p.id === myId ? '▶ ' : '') + p.name, bx + 36, y);
    ctx.textAlign = 'right'; ctx.fillText(`${p.score} 🏆`, bx + bw - 12, y); ctx.textAlign = 'left';
  });

  // Mensajes de la partida
  ctx.font = '800 15px Nunito, sans-serif';
  feed.forEach((f, i) => {
    const age = (now - f.t) / 1000;
    if (age > 6) return;
    ctx.globalAlpha = Math.min(1, 6 - age);
    ctx.fillStyle = '#fff'; ctx.fillText(f.text, 16, 30 + i * 22);
  });
  ctx.globalAlpha = 1;

  // Tus poderes activos (abajo a la izquierda)
  const me = state.players.find(p => p.id === myId);
  if (me && me.alive) {
    const active = Object.entries(me.fx || {}).filter(([k]) => EFFECT_ICONS[k]);
    active.forEach(([k, left], i) => {
      const y = H - 60 - i * 34;
      ctx.fillStyle = '#0008'; roundRect(14, y - 20, 170, 28, 10); ctx.fill();
      ctx.font = '800 14px Nunito, sans-serif'; ctx.fillStyle = '#fff'; ctx.textAlign = 'left';
      ctx.fillText(`${EFFECT_ICONS[k]} ${EFFECT_NAMES[k]}`, 24, y - 1);
      const w = 60 * Math.max(0, left / EFFECT_DUR[k]);
      ctx.fillStyle = '#ffffff30'; roundRect(114, y - 10, 60, 8, 4); ctx.fill();
      ctx.fillStyle = '#ffd23f'; roundRect(114, y - 10, Math.max(4, w), 8, 4); ctx.fill();
    });
  }

  // Mensaje central
  let big = null, small = null;
  if (state.phase === 'lobby') {
    big = 'Esperando amigos…';
    small = 'Practica y prueba los poderes · comparte el enlace de abajo';
  } else if (state.phase === 'countdown') {
    big = String(Math.ceil(state.timer));
    small = 'Prepárate';
  } else if (state.phase === 'roundEnd') {
    big = state.winner ? `¡${state.winner} gana!` : '¡Empate!';
    small = 'Siguiente ronda en un momento…';
  } else if (state.phase === 'playing') {
    if (me && !me.alive) small = 'Te caíste 💀 · mira y espera la próxima ronda';
    else if (me && me.fx && me.fx.mareado) small = '😵 ¡Controles al revés!';
  }
  ctx.textAlign = 'center';
  if (big) {
    ctx.font = `${Math.min(72, W / 9)}px 'Lilita One', sans-serif`;
    ctx.lineWidth = 8; ctx.strokeStyle = '#000b'; ctx.strokeText(big, W / 2, H * 0.2);
    ctx.fillStyle = '#ffd23f'; ctx.fillText(big, W / 2, H * 0.2);
  }
  if (small) {
    ctx.font = '800 17px Nunito, sans-serif';
    ctx.lineWidth = 5; ctx.strokeStyle = '#000b'; ctx.strokeText(small, W / 2, H * 0.2 + 34);
    ctx.fillStyle = '#fff'; ctx.fillText(small, W / 2, H * 0.2 + 34);
  }
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

requestAnimationFrame(frame);
