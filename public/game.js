// EMPUJONES — cliente (dibuja el juego y envía tus teclas al servidor)
const socket = io();
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const joinEl = document.getElementById('join');
const nameEl = document.getElementById('name');
const roomEl = document.getElementById('room');
const shareEl = document.getElementById('share');

let myId = null;
let state = null;
const shown = new Map();   // posiciones suavizadas por jugador
const feed = [];           // mensajes tipo "X empujó a Y"
const particles = [];
let shake = 0;

// ---------- Unirse ----------
const params = new URLSearchParams(location.search);
roomEl.value = params.get('sala') || '';
try { nameEl.value = localStorage.getItem('empujones-nombre') || ''; } catch {}
nameEl.focus();

function join() {
  const name = nameEl.value.trim() || 'Anónimo';
  try { localStorage.setItem('empujones-nombre', name); } catch {}
  socket.emit('join', { name, roomId: roomEl.value.trim() || 'principal' });
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
      if (prev && prev.alive && !p.alive) burst(prev.x, prev.y, p.color, 40);
    }
  }
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

function burst(x, y, color, n) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, s = 80 + Math.random() * 260;
    particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, color });
  }
  shake = 12;
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  const W = innerWidth, H = innerHeight;
  ctx.fillStyle = '#14121f'; ctx.fillRect(0, 0, W, H);

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
    // Rayas decorativas
    ctx.strokeStyle = '#ffffff10'; ctx.lineWidth = 2;
    for (let r = 60; r < state.arena; r += 60) { ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke(); }

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
    const R = state.radius;
    for (const p of state.players) {
      let s = shown.get(p.id);
      if (!s || !p.alive) { s = { x: p.x, y: p.y }; shown.set(p.id, s); }
      const k = Math.min(1, dt * 22);
      s.x += (p.x - s.x) * k; s.y += (p.y - s.y) * k;
      if (!p.alive) continue;
      const me = p.id === myId;

      ctx.beginPath(); ctx.ellipse(s.x, s.y + R * 0.75, R * 0.9, R * 0.35, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#0005'; ctx.fill();

      if (p.dashing) { ctx.beginPath(); ctx.arc(s.x, s.y, R + 9, 0, Math.PI * 2); ctx.fillStyle = p.color + '55'; ctx.fill(); }
      ctx.beginPath(); ctx.arc(s.x, s.y, R, 0, Math.PI * 2);
      ctx.fillStyle = p.color; ctx.fill();
      ctx.lineWidth = me ? 5 : 3; ctx.strokeStyle = me ? '#fff' : '#0006'; ctx.stroke();
      // Ojitos
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath(); ctx.arc(s.x - 7, s.y - 4, 3.5, 0, Math.PI * 2); ctx.arc(s.x + 7, s.y - 4, 3.5, 0, Math.PI * 2); ctx.fill();
      // Recarga del embiste (solo el tuyo)
      if (me && p.cd > 0) {
        ctx.beginPath(); ctx.arc(s.x, s.y, R + 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - p.cd / state.dashCooldown));
        ctx.strokeStyle = '#ffffffaa'; ctx.lineWidth = 3; ctx.stroke();
      }
      ctx.font = '800 16px Nunito, sans-serif'; ctx.textAlign = 'center';
      ctx.lineWidth = 4; ctx.strokeStyle = '#000a'; ctx.strokeText(p.name, s.x, s.y - R - 10);
      ctx.fillStyle = '#fff'; ctx.fillText(p.name, s.x, s.y - R - 10);
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
  ctx.fillStyle = '#0007'; roundRect(bx, 14, bw, 30 + list.length * 22, 12); ctx.fill();
  ctx.fillStyle = '#a49cc4'; ctx.fillText('PUNTOS', bx + 12, 34);
  list.forEach((p, i) => {
    const y = 56 + i * 22;
    ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(bx + 18, y - 5, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = p.alive ? '#fff' : '#fff6';
    ctx.fillText((p.id === myId ? '▶ ' : '') + p.name, bx + 30, y);
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

  // Mensaje central
  let big = null, small = null;
  if (state.phase === 'lobby') {
    big = 'Esperando amigos…';
    small = 'Practica mientras tanto · comparte el enlace de abajo';
  } else if (state.phase === 'countdown') {
    big = String(Math.ceil(state.timer));
    small = 'Prepárate';
  } else if (state.phase === 'roundEnd') {
    big = state.winner ? `¡${state.winner} gana!` : '¡Empate!';
    small = 'Siguiente ronda en un momento…';
  } else if (state.phase === 'playing') {
    const me = state.players.find(p => p.id === myId);
    if (me && !me.alive) small = 'Te caíste 💀 · mira y espera la próxima ronda';
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
