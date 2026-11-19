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
app.use('/vendor/three', express.static(path.join(__dirname, 'node_modules/three/build')));

// Segundo juego: KARTS (en /karts/)
require('./karts-server')(io);
require('./patata-server')(io);

// ---------- Ajustes del juego (¡juega con estos números!) ----------
const PORT = process.env.PORT || 3000;
const TICK_RATE = 60;          // pasos de física por segundo
const SEND_RATE = 30;          // envíos de estado por segundo
const ARENA_START = 380;       // radio inicial de la arena
const ARENA_MIN = 110;         // radio mínimo
const SHRINK_TIME = 45;        // segundos hasta llegar al radio mínimo
const R = 22;                  // radio normal de cada jugador
const ACCEL = 1000;            // aceleración al moverse
const FRICTION = 3.3;          // rozamiento (más alto = frena antes)
const DASH_SPEED = 780;        // velocidad del embiste
const DASH_TIME = 0.18;        // duración del embiste (s)
const DASH_COOLDOWN = 1.2;     // recarga del embiste (s)
const BOUNCE = 1.15;           // rebote en choques (>1 = más caótico)
const COUNTDOWN = 3;
const ROUND_END_TIME = 3.5;
const MAX_PLAYERS = 12;

// Poderes: aparecen en la arena y duran unos segundos
const POWER_MAX_ON_MAP = 3;    // máximo de poderes a la vez en la arena
const POWER_SPAWN_MIN = 2.5;   // segundos mínimos entre apariciones
const POWER_SPAWN_MAX = 5;     // segundos máximos entre apariciones
const POWER_LIFETIME = 10;     // si nadie lo coge, desaparece
const BOMB_RADIUS = 280;
const POWERS = {
  gigante:  { dur: 6, label: 'GIGANTE',  icon: '🍄' }, // enorme y pesado
  turbo:    { dur: 5, label: 'TURBO',    icon: '⚡' }, // más rápido, embiste sin parar
  fantasma: { dur: 6, label: 'FANTASMA', icon: '👻' }, // los demás no te ven
  muro:     { dur: 5, label: 'MURO',     icon: '🧱' }, // nadie te puede mover
  mareo:    { dur: 4, label: 'MAREO',    icon: '😵' }, // los DEMÁS tienen controles invertidos
  hielo:    { dur: 5, label: 'HIELO',    icon: '🧊' }, // los DEMÁS resbalan
  bomba:    { dur: 0, label: 'BOMBA',    icon: '💣' }, // onda expansiva instantánea
};
const POWER_TYPES = Object.keys(POWERS);

const CHARACTERS = ['bruto', 'gotita', 'pinchos', 'chulo', 'diablillo', 'michi', 'robi', 'reina'];

// Bots
const MAX_BOTS_PER_PLAYER = 7;
const BOT_NAMES = ['Paco', 'Lola', 'Chispa', 'Rufus', 'Nena', 'Kiko', 'Mora', 'Pipo', 'Luna', 'Tito', 'Coco', 'Rita'];

// ---------- Salas ----------
const rooms = new Map();

function getRoom(id) {
  if (!rooms.has(id)) {
    rooms.set(id, {
      id, players: new Map(), phase: 'lobby', timer: 0, elapsed: 0, elapsedTotal: 0,
      arena: ARENA_START, winner: null, events: [], fx: [],
      powerups: [], powerTimer: 2, nextPowerId: 1,
    });
  }
  return rooms.get(id);
}

function placeRandom(p, radius) {
  const a = Math.random() * Math.PI * 2, d = Math.random() * radius * 0.6;
  p.x = Math.cos(a) * d; p.y = Math.sin(a) * d; p.vx = p.vy = 0;
}

function resetPlayerRound(p) {
  p.vx = p.vy = 0; p.alive = true; p.dashT = 0; p.dashCd = 0; p.lastHit = null; p.effects = {};
}

function startCountdown(room) {
  room.phase = 'countdown';
  room.timer = COUNTDOWN;
  room.arena = ARENA_START;
  room.elapsed = 0;
  room.winner = null;
  room.powerups = [];
  room.powerTimer = 2;
  const list = [...room.players.values()];
  list.forEach((p, i) => {
    const a = (i / list.length) * Math.PI * 2;
    p.x = Math.cos(a) * ARENA_START * 0.6;
    p.y = Math.sin(a) * ARENA_START * 0.6;
    resetPlayerRound(p);
  });
}

function addEvent(room, text) {
  room.events.push({ text, id: Math.random().toString(36).slice(2) });
}

// ---------- Poderes ----------
function updatePowerups(room, dt) {
  room.powerTimer -= dt;
  if (room.powerTimer <= 0) {
    room.powerTimer = POWER_SPAWN_MIN + Math.random() * (POWER_SPAWN_MAX - POWER_SPAWN_MIN);
    if (room.powerups.length < POWER_MAX_ON_MAP) {
      const a = Math.random() * Math.PI * 2, d = Math.sqrt(Math.random()) * room.arena * 0.75;
      room.powerups.push({
        id: room.nextPowerId++, type: POWER_TYPES[Math.floor(Math.random() * POWER_TYPES.length)],
        x: Math.cos(a) * d, y: Math.sin(a) * d, age: 0,
      });
    }
  }
  // Caducan o se caen si la arena se encoge
  room.powerups = room.powerups.filter(pu => {
    pu.age += dt;
    return pu.age < POWER_LIFETIME && Math.hypot(pu.x, pu.y) < room.arena - 10;
  });
}

function applyPower(room, p, type) {
  const def = POWERS[type];
  const others = [...room.players.values()].filter(q => q.alive && q !== p);
  if (type === 'bomba') {
    for (const q of others) {
      const dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy) || 1;
      if (d > BOMB_RADIUS) continue;
      const imp = 500 + 700 * (1 - d / BOMB_RADIUS);
      q.vx += dx / d * imp; q.vy += dy / d * imp;
      q.lastHit = { by: p.id, at: room.elapsedTotal };
    }
    room.fx.push({ type: 'shock', x: Math.round(p.x), y: Math.round(p.y), r: BOMB_RADIUS });
  } else if (type === 'mareo') {
    for (const q of others) q.effects.mareado = def.dur;
  } else if (type === 'hielo') {
    for (const q of others) q.effects.resbalando = def.dur;
  } else {
    p.effects[type] = def.dur;
  }
  addEvent(room, `${p.name} cogió ${def.icon} ${def.label}`);
}

// ---------- Jugadores y bots ----------
function makePlayer(room, id, name, char) {
  const inRound = room.phase === 'playing' || room.phase === 'countdown';
  const p = {
    id, name, char, x: 0, y: 0, vx: 0, vy: 0, r: R,
    input: {}, wantDash: false, alive: !inRound, deadAt: 0, effects: {},
    score: 0, pushes: 0, dashT: 0, dashCd: 0, dashCdMax: DASH_COOLDOWN, lastHit: null,
  };
  if (!inRound) placeRandom(p, room.arena);
  room.players.set(id, p);
  return p;
}

function addBots(room, ownerId, n) {
  const used = new Set([...room.players.values()].map(p => p.name));
  let added = 0;
  for (let i = 0; i < n && room.players.size < MAX_PLAYERS; i++) {
    const free = BOT_NAMES.filter(b => !used.has(`Bot ${b}`));
    const name = `Bot ${free.length ? free[Math.floor(Math.random() * free.length)] : added + 1}`;
    used.add(name);
    const char = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
    const bot = makePlayer(room, `bot-${Math.random().toString(36).slice(2, 9)}`, name, char);
    bot.isBot = true; bot.owner = ownerId;
    bot.ai = { think: Math.random() * 0.3, wander: null, aggression: 0.35 + Math.random() * 0.4 };
    added++;
  }
  if (added) addEvent(room, `🤖 ${added} bot${added > 1 ? 's' : ''} se ${added > 1 ? 'unieron' : 'unió'}`);
}

// Cerebro de los bots: decide hacia dónde ir unas 5 veces por segundo
function updateBot(room, p, dt) {
  const ai = p.ai;
  ai.think -= dt;
  if (ai.think > 0) return;
  ai.think = 0.12 + Math.random() * 0.2; // pequeño "tiempo de reacción"
  if (!p.alive || room.phase === 'countdown') { p.input = {}; return; }
  if (room.phase === 'roundEnd') { // celebrar en el centro, sin suicidarse
    const d = Math.hypot(p.x, p.y);
    p.input = d > 40 ? { left: p.x > 20, right: p.x < -20, up: p.y > 20, down: p.y < -20 } : {};
    return;
  }

  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const fromCenter = Math.hypot(p.x, p.y);
  // Los fantasmas son invisibles también para los bots
  const enemies = [...room.players.values()].filter(q => q !== p && q.alive && !q.effects.fantasma);
  const enemy = enemies.sort((a, b) => dist(p, a) - dist(p, b))[0];
  const pu = room.powerups.slice().sort((a, b) => dist(p, a) - dist(p, b))[0];

  let tx = 0, ty = 0, dashAt = null;
  if (fromCenter > room.arena - 70) {
    tx = 0; ty = 0;                                   // ¡peligro! volver al centro
  } else if (pu && dist(p, pu) < 230) {
    tx = pu.x; ty = pu.y;                             // ir a por el poder
  } else if (enemy) {
    // Colocarse "detrás" del enemigo (lado del centro) para empujarlo hacia fuera
    const ed = Math.hypot(enemy.x, enemy.y) || 1;
    tx = enemy.x - enemy.x / ed * 30; ty = enemy.y - enemy.y / ed * 30;
    if (dist(p, enemy) < 130 && p.dashCd <= 0 && Math.random() < ai.aggression) dashAt = enemy;
  } else {
    if (!ai.wander || dist(p, ai.wander) < 30) {
      const a = Math.random() * Math.PI * 2, d = Math.random() * room.arena * 0.5;
      ai.wander = { x: Math.cos(a) * d, y: Math.sin(a) * d };
    }
    tx = ai.wander.x; ty = ai.wander.y;
  }

  if (dashAt) {
    const dx = dashAt.x - p.x, dy = dashAt.y - p.y, d = Math.hypot(dx, dy) || 1;
    // No embestir si eso nos tira fuera de la arena
    const endX = p.x + dx / d * 140, endY = p.y + dy / d * 140;
    if (Math.hypot(endX, endY) < room.arena - 25) { tx = dashAt.x; ty = dashAt.y; p.wantDash = true; }
  }

  const dx = tx - p.x, dy = ty - p.y, dead = 10;
  p.input = { left: dx < -dead, right: dx > dead, up: dy < -dead, down: dy > dead };
}

// ---------- Física ----------
function massOf(p) {
  return (p.effects.muro ? 40 : 1) * (p.effects.gigante ? 2.5 : 1) * (p.dashT > 0 ? 3 : 1);
}

function stepPhysics(room, dt, canMove) {
  const alive = [...room.players.values()].filter(p => p.alive);

  for (const p of alive) {
    const fx = p.effects;
    for (const k in fx) { fx[k] -= dt; if (fx[k] <= 0) delete fx[k]; }
    p.r = R * (fx.gigante ? 1.6 : 1);

    p.dashCd = Math.max(0, p.dashCd - dt);
    p.dashT = Math.max(0, p.dashT - dt);
    let ix = (p.input.right ? 1 : 0) - (p.input.left ? 1 : 0);
    let iy = (p.input.down ? 1 : 0) - (p.input.up ? 1 : 0);
    if (fx.mareado) { ix = -ix; iy = -iy; }
    const len = Math.hypot(ix, iy);
    if (len > 0) { ix /= len; iy /= len; }

    if (canMove) {
      if (p.wantDash && p.dashCd <= 0) {
        let dx = ix, dy = iy;
        if (len === 0) { // sin dirección: embiste hacia donde ibas
          const s = Math.hypot(p.vx, p.vy);
          if (s > 1) { dx = p.vx / s; dy = p.vy / s; } else { dx = 1; dy = 0; }
        }
        const speed = DASH_SPEED * (fx.turbo ? 1.2 : 1);
        p.vx = dx * speed; p.vy = dy * speed;
        p.dashT = DASH_TIME;
        p.dashCdMax = fx.turbo ? 0.35 : DASH_COOLDOWN;
        p.dashCd = p.dashCdMax;
      }
      const acc = ACCEL * (fx.turbo ? 1.7 : 1);
      p.vx += ix * acc * dt; p.vy += iy * acc * dt;
    }
    p.wantDash = false;

    const f = Math.max(0, 1 - FRICTION * (fx.resbalando ? 0.2 : 1) * dt);
    p.vx *= f; p.vy *= f;
    p.x += p.vx * dt; p.y += p.vy * dt;

    // Coger poderes
    if (canMove) {
      for (let i = room.powerups.length - 1; i >= 0; i--) {
        const pu = room.powerups[i];
        if (Math.hypot(pu.x - p.x, pu.y - p.y) < p.r + 16) {
          room.powerups.splice(i, 1);
          applyPower(room, p, pu.type);
        }
      }
    }
  }

  // Choques entre jugadores
  for (let i = 0; i < alive.length; i++) {
    for (let j = i + 1; j < alive.length; j++) {
      const a = alive[i], b = alive[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const d = Math.hypot(dx, dy), minD = a.r + b.r;
      if (d === 0 || d >= minD) continue;
      const nx = dx / d, ny = dy / d;
      const ma = massOf(a), mb = massOf(b);
      const overlap = minD - d, share = mb / (ma + mb);
      a.x -= nx * overlap * share; a.y -= ny * overlap * share;
      b.x += nx * overlap * (1 - share); b.y += ny * overlap * (1 - share);

      const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
      if (rv >= 0) continue;
      const jImp = -(1 + BOUNCE) * rv / (1 / ma + 1 / mb);
      a.vx -= jImp * nx / ma; a.vy -= jImp * ny / ma;
      b.vx += jImp * nx / mb; b.vy += jImp * ny / mb;

      const now = room.elapsedTotal;
      a.lastHit = { by: b.id, at: now };
      b.lastHit = { by: a.id, at: now };
    }
  }

  // ¿Alguien se cayó?
  for (const p of alive) {
    if (Math.hypot(p.x, p.y) > room.arena) {
      p.alive = false;
      p.deadAt = room.elapsedTotal;
      p.effects = {};
      const hit = p.lastHit && room.elapsedTotal - p.lastHit.at < 3 && room.players.get(p.lastHit.by);
      if (hit) { hit.pushes = (hit.pushes || 0) + 1; addEvent(room, `${hit.name} empujó a ${p.name} 💥`); }
      else addEvent(room, `${p.name} se cayó solito 🫠`);
    }
  }
}

// ---------- Bucle principal ----------
function updateRoom(room, dt) {
  room.elapsedTotal += dt;
  const count = room.players.size;
  for (const p of room.players.values()) if (p.isBot) updateBot(room, p, dt);

  if (room.phase === 'lobby') {
    // Modo práctica: si estás solo, puedes moverte, probar poderes y reapareces al caer
    updatePowerups(room, dt);
    stepPhysics(room, dt, true);
    for (const p of room.players.values()) {
      if (!p.alive && room.elapsedTotal - p.deadAt > 1) { resetPlayerRound(p); placeRandom(p, ARENA_START); }
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
    updatePowerups(room, dt);
    stepPhysics(room, dt, true);
    const alive = [...room.players.values()].filter(p => p.alive);
    if (alive.length <= 1) {
      room.phase = 'roundEnd';
      room.timer = ROUND_END_TIME;
      room.powerups = [];
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
        for (const p of room.players.values()) { resetPlayerRound(p); placeRandom(p, ARENA_START); }
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
    events: room.events.splice(0),
    fx: room.fx.splice(0),
    powerups: room.powerups.map(pu => ({ id: pu.id, type: pu.type, x: Math.round(pu.x), y: Math.round(pu.y), age: pu.age })),
    powers: POWERS,
    players: [...room.players.values()].map(p => ({
      id: p.id, name: p.name, char: p.char, alive: p.alive, bot: !!p.isBot,
      x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10, r: p.r,
      score: p.score, pushes: p.pushes || 0,
      dashing: p.dashT > 0, cd: Math.round(p.dashCd * 100) / 100, cdMax: p.dashCdMax,
      fx: Object.fromEntries(Object.entries(p.effects).map(([k, v]) => [k, Math.round(v * 10) / 10])),
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

  socket.on('join', ({ name, roomId, char, bots }) => {
    if (room) return;
    roomId = String(roomId || 'principal').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 20) || 'principal';
    name = String(name || 'Anónimo').trim().slice(0, 14) || 'Anónimo';
    if (!CHARACTERS.includes(char)) char = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
    bots = Math.max(0, Math.min(MAX_BOTS_PER_PLAYER, Math.floor(Number(bots) || 0)));
    const r = getRoom(roomId);
    if (r.players.size >= MAX_PLAYERS) return socket.emit('full');
    room = r;
    makePlayer(room, socket.id, name, char);
    socket.join(room.id);
    socket.emit('joined', { id: socket.id, roomId: room.id });
    addEvent(room, `${name} entró a la sala 👋`);
    if (bots) addBots(room, socket.id, bots);
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
    // Sus bots se van con él
    for (const [id, q] of room.players) if (q.isBot && q.owner === socket.id) room.players.delete(id);
    if (![...room.players.values()].some(q => !q.isBot)) rooms.delete(room.id);
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
