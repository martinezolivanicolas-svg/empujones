// EMPUJONES — servidor del juego
// Cada sala tiene su propia partida. El servidor calcula toda la física
// (así nadie puede hacer trampa) y envía el estado a los jugadores 30 veces por segundo.

const express = require('express');
const http = require('http');
const path = require('path');
const os = require('os');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Ajustes del juego (¡juega con estos números!) ----------
const PORT = process.env.PORT || 3000;
const TICK_RATE = 60;          // pasos de física por segundo
const SEND_RATE = 30;          // envíos de estado por segundo
const ARENA_START = 380;       // radio inicial de la arena
const ARENA_MIN = 110;         // radio mínimo
const SHRINK_TIME = 45;        // segundos hasta llegar al radio mínimo
const R = 22;                  // radio de cada jugador
const ACCEL = 1000;            // aceleración al moverse
const FRICTION = 3.3;          // rozamiento (más alto = frena antes)
const DASH_SPEED = 780;        // velocidad del embiste
const DASH_TIME = 0.18;        // duración del embiste (s)
const DASH_COOLDOWN = 1.2;     // recarga del embiste (s)
const BOUNCE = 1.15;           // rebote en choques (>1 = más caótico)
const COUNTDOWN = 3;
const ROUND_END_TIME = 3.5;
const MAX_PLAYERS = 12;

const COLORS = ['#ff5d5d', '#4dabff', '#5ee07a', '#ffd23f', '#c77dff', '#ff8c42',
  '#2ee6d6', '#ff6fb5', '#a3e635', '#f4f4f4', '#8b9cff', '#ffb4a2'];

// ---------- Salas ----------
const rooms = new Map();

function getRoom(id) {
  if (!rooms.has(id)) {
    rooms.set(id, {
      id, players: new Map(), phase: 'lobby', timer: 0, elapsed: 0,
      arena: ARENA_START, winner: null, events: [],
    });
  }
  return rooms.get(id);
}

function freeColor(room) {
  const used = new Set([...room.players.values()].map(p => p.color));
  return COLORS.find(c => !used.has(c)) || COLORS[Math.floor(Math.random() * COLORS.length)];
}

function placeRandom(p, radius) {
  const a = Math.random() * Math.PI * 2, d = Math.random() * radius * 0.6;
  p.x = Math.cos(a) * d; p.y = Math.sin(a) * d; p.vx = p.vy = 0;
}

function startCountdown(room) {
  room.phase = 'countdown';
  room.timer = COUNTDOWN;
  room.arena = ARENA_START;
  room.elapsed = 0;
  room.winner = null;
  const list = [...room.players.values()];
  list.forEach((p, i) => {
    const a = (i / list.length) * Math.PI * 2;
    p.x = Math.cos(a) * ARENA_START * 0.6;
    p.y = Math.sin(a) * ARENA_START * 0.6;
    p.vx = p.vy = 0; p.alive = true; p.dashT = 0; p.dashCd = 0; p.lastHit = null;
  });
}

function addEvent(room, text) {
  room.events.push({ text, id: Math.random().toString(36).slice(2) });
}

// ---------- Física ----------
function stepPhysics(room, dt, canMove) {
  const alive = [...room.players.values()].filter(p => p.alive);

  for (const p of alive) {
    p.dashCd = Math.max(0, p.dashCd - dt);
    p.dashT = Math.max(0, p.dashT - dt);
    let ix = (p.input.right ? 1 : 0) - (p.input.left ? 1 : 0);
    let iy = (p.input.down ? 1 : 0) - (p.input.up ? 1 : 0);
    const len = Math.hypot(ix, iy);
    if (len > 0) { ix /= len; iy /= len; }

    if (canMove) {
      if (p.wantDash && p.dashCd <= 0) {
        let dx = ix, dy = iy;
        if (len === 0) { // sin dirección: embiste hacia donde ibas
          const s = Math.hypot(p.vx, p.vy);
          if (s > 1) { dx = p.vx / s; dy = p.vy / s; } else { dx = 1; dy = 0; }
        }
        p.vx = dx * DASH_SPEED; p.vy = dy * DASH_SPEED;
        p.dashT = DASH_TIME; p.dashCd = DASH_COOLDOWN;
      }
      p.vx += ix * ACCEL * dt; p.vy += iy * ACCEL * dt;
    }
    p.wantDash = false;

    const f = Math.max(0, 1 - FRICTION * dt);
    p.vx *= f; p.vy *= f;
    p.x += p.vx * dt; p.y += p.vy * dt;
  }

  // Choques entre jugadores
  for (let i = 0; i < alive.length; i++) {
    for (let j = i + 1; j < alive.length; j++) {
      const a = alive[i], b = alive[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const d = Math.hypot(dx, dy);
      if (d === 0 || d >= R * 2) continue;
      const nx = dx / d, ny = dy / d;
      const overlap = R * 2 - d;
      a.x -= nx * overlap / 2; a.y -= ny * overlap / 2;
      b.x += nx * overlap / 2; b.y += ny * overlap / 2;

      const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
      if (rv >= 0) continue;
      const ma = a.dashT > 0 ? 3 : 1, mb = b.dashT > 0 ? 3 : 1;
      const jImp = -(1 + BOUNCE) * rv / (1 / ma + 1 / mb);
      a.vx -= jImp * nx / ma; a.vy -= jImp * ny / ma;
      b.vx += jImp * nx / mb; b.vy += jImp * ny / mb;

      const now = room.elapsedTotal;
      a.lastHit = { by: b.id, at: now };
      b.lastHit = { by: a.id, at: now };
      if (a.dashT > 0 || b.dashT > 0) room.bumps = (room.bumps || 0) + 1;
    }
  }

  // ¿Alguien se cayó?
  for (const p of alive) {
    if (Math.hypot(p.x, p.y) > room.arena) {
      p.alive = false;
      p.deadAt = room.elapsedTotal;
      const hit = p.lastHit && room.elapsedTotal - p.lastHit.at < 3 && room.players.get(p.lastHit.by);
      if (hit) { hit.pushes = (hit.pushes || 0) + 1; addEvent(room, `${hit.name} empujó a ${p.name} 💥`); }
      else addEvent(room, `${p.name} se cayó solito 🫠`);
    }
  }
}

// ---------- Bucle principal ----------
function updateRoom(room, dt) {
  room.elapsedTotal = (room.elapsedTotal || 0) + dt;
  const count = room.players.size;

  if (room.phase === 'lobby') {
    // Modo práctica: si estás solo, puedes moverte y reapareces al caer
    stepPhysics(room, dt, true);
    for (const p of room.players.values()) {
      if (!p.alive && room.elapsedTotal - p.deadAt > 1) { p.alive = true; placeRandom(p, ARENA_START); }
    }
    if (count >= 2) startCountdown(room);
  } else if (room.phase === 'countdown') {
    room.timer -= dt;
    stepPhysics(room, dt, false);
    if (count < 2) room.phase = 'lobby';
    else if (room.timer <= 0) { room.phase = 'playing'; addEvent(room, '¡A empujar! 🔥'); }
  } else if (room.phase === 'playing') {
    room.elapsed += dt;
    room.arena = Math.max(ARENA_MIN, ARENA_START - (ARENA_START - ARENA_MIN) * (room.elapsed / SHRINK_TIME));
    stepPhysics(room, dt, true);
    const alive = [...room.players.values()].filter(p => p.alive);
    if (alive.length <= 1) {
      room.phase = 'roundEnd';
      room.timer = ROUND_END_TIME;
      if (alive.length === 1) {
        alive[0].score++;
        room.winner = alive[0].name;
        addEvent(room, `🏆 ${alive[0].name} gana la ronda`);
      } else room.winner = null; // empate
    }
  } else if (room.phase === 'roundEnd') {
    room.timer -= dt;
    stepPhysics(room, dt, true);
    if (room.timer <= 0) {
      if (count >= 2) startCountdown(room);
      else {
        room.phase = 'lobby'; room.arena = ARENA_START;
        for (const p of room.players.values()) { p.alive = true; placeRandom(p, ARENA_START); }
      }
    }
  }
}

function snapshot(room) {
  return {
    phase: room.phase,
    timer: Math.max(0, room.timer),
    arena: Math.round(room.arena),
    arenaStart: ARENA_START,
    winner: room.winner,
    radius: R,
    dashCooldown: DASH_COOLDOWN,
    events: room.events.splice(0),
    players: [...room.players.values()].map(p => ({
      id: p.id, name: p.name, color: p.color, alive: p.alive,
      x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10,
      score: p.score, pushes: p.pushes || 0,
      dashing: p.dashT > 0, cd: Math.round(p.dashCd * 100) / 100,
    })),
  };
}

let sendAcc = 0;
setInterval(() => {
  const dt = 1 / TICK_RATE;
  sendAcc += dt;
  const send = sendAcc >= 1 / SEND_RATE;
  if (send) sendAcc = 0;
  for (const room of rooms.values()) {
    updateRoom(room, dt);
    if (send) io.to(room.id).emit('state', snapshot(room));
  }
}, 1000 / TICK_RATE);

// ---------- Conexiones ----------
io.on('connection', socket => {
  let room = null;

  socket.on('join', ({ name, roomId }) => {
    if (room) return;
    roomId = String(roomId || 'principal').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 20) || 'principal';
    name = String(name || 'Anónimo').trim().slice(0, 14) || 'Anónimo';
    const r = getRoom(roomId);
    if (r.players.size >= MAX_PLAYERS) return socket.emit('full');
    room = r;
    const inRound = room.phase === 'playing' || room.phase === 'countdown';
    const p = {
      id: socket.id, name, color: freeColor(room), x: 0, y: 0, vx: 0, vy: 0,
      input: {}, wantDash: false, alive: !inRound, deadAt: 0,
      score: 0, pushes: 0, dashT: 0, dashCd: 0, lastHit: null,
    };
    if (!inRound) placeRandom(p, room.arena);
    room.players.set(socket.id, p);
    socket.join(room.id);
    socket.emit('joined', { id: socket.id, roomId: room.id });
    addEvent(room, `${name} entró a la sala 👋`);
  });

  socket.on('input', input => {
    const p = room && room.players.get(socket.id);
    if (p && input) p.input = { up: !!input.up, down: !!input.down, left: !!input.left, right: !!input.right };
  });

  socket.on('dash', () => {
    const p = room && room.players.get(socket.id);
    if (p) p.wantDash = true;
  });

  socket.on('disconnect', () => {
    if (!room) return;
    const p = room.players.get(socket.id);
    room.players.delete(socket.id);
    if (p) addEvent(room, `${p.name} salió`);
    if (room.players.size === 0) rooms.delete(room.id);
  });
});

server.listen(PORT, () => {
  console.log(`\n🎮 EMPUJONES funcionando`);
  console.log(`   En este ordenador:  http://localhost:${PORT}`);
  for (const ifaces of Object.values(os.networkInterfaces())) {
    for (const i of ifaces || []) {
      if (i.family === 'IPv4' && !i.internal) console.log(`   En la misma red:    http://${i.address}:${PORT}`);
    }
  }
  console.log('');
});
