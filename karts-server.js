// KARTS — servidor de carreras.
// Cada jugador conduce su kart en su navegador y envía su posición;
// el servidor lleva la carrera: salas, bots, cajas, poderes, golpes, vueltas y puntos.
const S = require('./public/karts/shared.js');

const TICK = 30;                  // pasos por segundo del servidor
const SEND_EVERY = 1.5;           // ~20 envíos por segundo
const MAX_PLAYERS = 10;
const MAX_BOTS = 8;
const COUNTDOWN = 3.5;
const RESULTS_TIME = 10;
const AFTER_FIRST_FINISH = 25;    // segundos que esperamos al resto tras el primero en llegar
const AFTER_HUMANS_DONE = 8;      // si ya llegasteis todas las personas, esperamos poco a los bots
const BOX_RESPAWN = 3;
const POINTS = [10, 8, 6, 5, 4, 3, 2, 1];
const BOT_NAMES = ['Paco', 'Lola', 'Chispa', 'Rufus', 'Nena', 'Kiko', 'Mora', 'Pipo', 'Luna', 'Tito'];
const CHAR_IDS = S.CHARACTERS.map(c => c.id);

module.exports = function setupKarts(io) {
  const nsp = io.of('/karts');
  const rooms = new Map();

  function getRoom(id) {
    if (!rooms.has(id)) {
      rooms.set(id, {
        id, phase: 'lobby', trackId: S.TRACKS[0].id, hostId: null, players: new Map(),
        boxes: [], hazards: [], nextHazard: 1, timer: 0, raceTime: 0, firstFinish: null,
        events: [], fx: [], results: null, sendAcc: 0,
      });
    }
    return rooms.get(id);
  }
  const track = room => S.TRACK_BY_ID[room.trackId];
  const humans = room => [...room.players.values()].filter(p => !p.isBot);
  const racers = room => [...room.players.values()].filter(p => p.inRace);
  const ev = (room, text) => room.events.push(text);
  const charName = id => (S.CHARACTERS.find(c => c.id === id) || {}).name || id;

  function ranking(room) {
    return racers(room).sort((a, b) => {
      if (a.k.finished !== b.k.finished) return a.k.finished ? -1 : 1;
      if (a.k.finished) return a.finishTime - b.finishTime;
      return b.k.prog - a.k.prog;
    });
  }

  function makeEntry(id, name, char, isBot, owner) {
    return { id, name, char, isBot, owner, k: null, inRace: false, item: null, score: 0,
      finishTime: null, shieldUntil: 0, socket: null,
      ai: isBot ? { lane: 0, laneT: 0, useAt: 0, skill: 0.88 + Math.random() * 0.08 } : null };
  }

  function addBots(room, owner, n) {
    const used = new Set([...room.players.values()].map(p => p.name));
    let added = 0;
    for (let i = 0; i < n && room.players.size < MAX_PLAYERS; i++) {
      const free = BOT_NAMES.filter(b => !used.has(`Bot ${b}`));
      const name = `Bot ${free.length ? free[Math.floor(Math.random() * free.length)] : i + 1}`;
      used.add(name);
      const char = CHAR_IDS[Math.floor(Math.random() * CHAR_IDS.length)];
      const e = makeEntry(`bot-${Math.random().toString(36).slice(2, 9)}`, name, char, true, owner);
      room.players.set(e.id, e); added++;
    }
    if (added) ev(room, `🤖 ${added} bot${added > 1 ? 's' : ''} a la parrilla`);
  }

  // ---------- Fases de la carrera ----------
  function startRace(room) {
    const t = track(room);
    room.phase = 'countdown'; room.timer = COUNTDOWN; room.raceTime = 0;
    room.firstFinish = null; room.humansDoneAt = null; room.results = null; room.hazards = [];
    room.boxes = t.boxes.map(b => ({ ...b, activeAt: 0 }));
    const list = [...room.players.values()].sort(() => Math.random() - 0.5);
    const slots = {};
    list.forEach((p, i) => {
      p.inRace = true; p.item = null; p.finishTime = null; p.shieldUntil = 0;
      p.k = S.newKart(t, i);
      slots[p.id] = i;
      if (p.isBot) Object.assign(p.ai, { lane: (Math.random() - 0.5) * 0.4, laneT: 2 + Math.random() * 3, useAt: 0 });
    });
    nsp.to(room.id).emit('raceStart', { trackId: room.trackId, slots });
    ev(room, `🏁 Carrera en ${t.name}`);
  }

  function endRace(room) {
    const order = ranking(room);
    room.results = order.map((p, i) => {
      const pts = POINTS[i] || 0;
      p.score += pts;
      return { id: p.id, name: p.name, char: p.char, pos: i + 1, time: p.finishTime, pts, total: p.score };
    });
    room.phase = 'results'; room.timer = RESULTS_TIME;
    for (const p of room.players.values()) p.inRace = false;
    room.hazards = [];
    if (order[0]) ev(room, `🏆 ¡${order[0].name} gana la carrera!`);
  }

  // ---------- Poderes ----------
  function giveItem(room, p) {
    const order = ranking(room);
    p.item = S.rollItem(order.indexOf(p), order.length);
    if (p.isBot) p.ai.useAt = room.raceTime + 1 + Math.random() * 3.5;
    else p.socket.emit('item', { item: p.item });
  }

  function sendEffect(p, type, t) {
    if (p.isBot) {
      if (type === 'boost') p.k.boostT = Math.max(p.k.boostT, t);
      if (type === 'slow') p.k.slowT = t;
      if (type === 'shield') p.k.shieldT = t;
      if (type === 'spin') { p.k.spinT = t; p.k.driftDir = 0; }
    } else p.socket.emit('effect', { type, t });
  }

  function hitKart(room, victim, by, type) {
    if (victim.shieldUntil > room.raceTime) { ev(room, `🛡️ ${victim.name} está aforado y se libra`); return; }
    sendEffect(victim, 'spin', type === 'aceite' ? 1.2 : 1.6);
    const icon = S.ITEMS[type] ? S.ITEMS[type].icon : '💥';
    if (by && by !== victim) ev(room, `${by.name} ${icon} ${victim.name}`);
    else ev(room, `${victim.name} pisó ${icon}`);
  }

  function useItem(room, p) {
    if (!p.item || !p.inRace || p.k.finished) return;
    const type = p.item; p.item = null;
    const k = p.k, cos = Math.cos(k.h), sin = Math.sin(k.h);
    if (type === 'sobre') sendEffect(p, 'boost', 1.6);
    else if (type === 'aforado') { p.shieldUntil = room.raceTime + 6; sendEffect(p, 'shield', 6); ev(room, `🛡️ ${p.name} se ha aforado`); }
    else if (type === 'recorte') {
      const ahead = racers(room).filter(q => q.k.prog > k.prog && !q.k.finished);
      for (const q of ahead) if (q.shieldUntil <= room.raceTime) sendEffect(q, 'slow', 3);
      ev(room, `📉 ${p.name} aplica un recorte a ${ahead.length} rival${ahead.length === 1 ? '' : 'es'}`);
      room.fx.push({ type: 'recorte', by: p.id });
    } else if (type === 'aceite') {
      room.hazards.push({ id: room.nextHazard++, type, owner: p.id, x: k.x - cos * 3.5, z: k.z - sin * 3.5, h: k.h, ttl: 30, age: 0 });
    } else if (type === 'bomba') {
      const sp = Math.max(k.speed + 22, 40);
      room.hazards.push({ id: room.nextHazard++, type, owner: p.id, x: k.x + cos * 3, z: k.z + sin * 3, h: k.h,
        vx: cos * sp, vz: sin * sp, ttl: 1.6, age: 0 });
    } else if (type === 'misil') {
      const order = ranking(room), i = order.indexOf(p);
      const target = order[i - 1] || order[i + 1];
      room.hazards.push({ id: room.nextHazard++, type, owner: p.id, x: k.x + cos * 3, z: k.z + sin * 3, h: k.h,
        target: target && target.id, ttl: 7, age: 0 });
      if (target) ev(room, `🎯 ${p.name} lanza un misil a ${target.name}`);
    }
  }

  function explode(room, hz) {
    room.fx.push({ type: 'boom', x: hz.x, z: hz.z });
    const by = room.players.get(hz.owner);
    for (const q of racers(room)) if (Math.hypot(q.k.x - hz.x, q.k.z - hz.z) < 9) hitKart(room, q, by, 'bomba');
  }

  function updateHazards(room, dt) {
    const list = racers(room);
    room.hazards = room.hazards.filter(hz => {
      hz.age += dt; hz.ttl -= dt;
      const by = room.players.get(hz.owner);
      if (hz.type === 'bomba') {
        hz.x += hz.vx * dt; hz.z += hz.vz * dt;
        const touch = list.find(q => (q.id !== hz.owner || hz.age > 0.4) && Math.hypot(q.k.x - hz.x, q.k.z - hz.z) < 2.5);
        if (touch || hz.ttl <= 0) { explode(room, hz); return false; }
        return true;
      }
      if (hz.type === 'misil') {
        const tg = room.players.get(hz.target);
        if (tg && tg.inRace) {
          const want = Math.atan2(tg.k.z - hz.z, tg.k.x - hz.x);
          let d = want - hz.h; d = Math.atan2(Math.sin(d), Math.cos(d));
          hz.h += Math.max(-4 * dt, Math.min(4 * dt, d));
          if (Math.hypot(tg.k.x - hz.x, tg.k.z - hz.z) < 2.6) {
            room.fx.push({ type: 'boom', x: hz.x, z: hz.z }); hitKart(room, tg, by, 'misil'); return false;
          }
        }
        const sp = 52;
        hz.x += Math.cos(hz.h) * sp * dt; hz.z += Math.sin(hz.h) * sp * dt;
        if (hz.ttl <= 0) { room.fx.push({ type: 'boom', x: hz.x, z: hz.z }); return false; }
        return true;
      }
      if (hz.type === 'aceite') {
        if (hz.ttl <= 0) return false;
        const victim = list.find(q => (q.id !== hz.owner || hz.age > 1) && Math.hypot(q.k.x - hz.x, q.k.z - hz.z) < 2.4);
        if (victim) { hitKart(room, victim, by, 'aceite'); return false; }
        return true;
      }
      return false;
    });
  }

  // ---------- Bots ----------
  function botInput(room, p, dt) {
    const t = track(room), k = p.k, ai = p.ai;
    ai.laneT -= dt;
    if (ai.laneT <= 0) { ai.lane = (Math.random() - 0.5) * 0.5; ai.laneT = 2 + Math.random() * 4; }
    const ahead = Math.round(6 + Math.max(0, k.speed) * 0.3);
    const tp = t.pts[(k.idx + ahead) % t.N];
    const tx = tp.x + tp.nx * ai.lane * t.width, tz = tp.z + tp.nz * ai.lane * t.width;
    let d = Math.atan2(tz - k.z, tx - k.x) - k.h; d = Math.atan2(Math.sin(d), Math.cos(d));
    if (p.item && room.raceTime > ai.useAt) useItem(room, p);
    return { throttle: Math.abs(d) > 0.65 && k.speed > 18 ? 0.2 : 1, steer: Math.max(-1, Math.min(1, d * 2.4)), drift: false };
  }

  function botMaxFactor(room, p) {
    // Un poco de "goma elástica" para que las carreras estén reñidas
    const best = Math.max(-1, ...racers(room).filter(q => !q.isBot).map(q => q.k.prog));
    let f = p.ai.skill;
    if (p.k.prog > best + 0.15) f -= 0.07;
    if (p.k.prog < best - 0.2) f += 0.06;
    return f;
  }

  // ---------- Bucle ----------
  function updateRoom(room, dt) {
    if (room.phase === 'countdown') {
      room.timer -= dt;
      if (room.timer <= 0) { room.phase = 'race'; room.raceTime = 0; ev(room, '¡YA! 🚦'); }
    } else if (room.phase === 'race') {
      room.raceTime += dt;
      const t = track(room);
      for (const p of racers(room)) {
        if (!p.isBot) continue;
        const wasFinished = p.k.finished;
        S.stepKart(p.k, p.k.finished ? { throttle: 0.4, steer: 0 } : botInput(room, p, dt), dt, t,
          { canDrive: true, maxFactor: botMaxFactor(room, p) });
        if (!wasFinished && p.k.finished) onFinish(room, p);
      }
      // Choques entre karts controlados por el servidor (bots)
      const all = racers(room);
      for (const a of all) {
        if (!a.isBot) continue;
        for (const b of all) {
          if (a === b) continue;
          const dx = a.k.x - b.k.x, dz = a.k.z - b.k.z, d = Math.hypot(dx, dz);
          if (d > 0 && d < 3.2) { a.k.x += dx / d * (3.2 - d) * 0.5; a.k.z += dz / d * (3.2 - d) * 0.5; }
        }
      }
      // Cajas de poderes
      for (const box of room.boxes) {
        if (box.activeAt > room.raceTime) continue;
        for (const p of all) {
          if (!p.isBot || p.item || p.k.finished) continue;
          if (Math.hypot(p.k.x - box.x, p.k.z - box.z) < 2.8) { box.activeAt = room.raceTime + BOX_RESPAWN; giveItem(room, p); break; }
        }
      }
      updateHazards(room, dt);
      const hs = all.filter(p => !p.isBot);
      const allHumansDone = hs.length > 0 && hs.every(p => p.k.finished);
      if (allHumansDone && room.humansDoneAt == null) room.humansDoneAt = room.raceTime;
      if (all.every(p => p.k.finished) ||
          (room.humansDoneAt != null && room.raceTime - room.humansDoneAt > AFTER_HUMANS_DONE) ||
          (room.firstFinish != null && room.raceTime - room.firstFinish > AFTER_FIRST_FINISH) ||
          room.raceTime > 420 || all.length === 0) endRace(room);
    } else if (room.phase === 'results') {
      room.timer -= dt;
      if (room.timer <= 0) { room.phase = 'lobby'; room.results = null; }
    }
  }

  function onFinish(room, p) {
    p.finishTime = room.raceTime;
    if (room.firstFinish == null) room.firstFinish = room.raceTime;
    const pos = racers(room).filter(q => q.k.finished).length;
    ev(room, `🏁 ${p.name} llega ${pos}º`);
  }

  function snapshot(room) {
    const order = room.phase === 'race' || room.phase === 'countdown' ? ranking(room) : [];
    return {
      phase: room.phase, trackId: room.trackId, hostId: room.hostId, timer: Math.max(0, room.timer),
      raceTime: room.raceTime, laps: S.LAPS, results: room.results,
      events: room.events.splice(0), fx: room.fx.splice(0),
      boxes: room.boxes.map(b => (b.activeAt <= room.raceTime ? 1 : 0)),
      hazards: room.hazards.map(h => ({ id: h.id, type: h.type, x: +h.x.toFixed(2), z: +h.z.toFixed(2), h: +h.h.toFixed(2) })),
      players: [...room.players.values()].map(p => ({
        id: p.id, name: p.name, char: p.char, bot: p.isBot, score: p.score, inRace: p.inRace,
        rank: order.indexOf(p) + 1,
        ...(p.k && p.inRace ? {
          x: +p.k.x.toFixed(2), z: +p.k.z.toFixed(2), h: +p.k.h.toFixed(3), speed: +p.k.speed.toFixed(1),
          lap: p.k.lap, prog: +p.k.prog.toFixed(4), finished: p.k.finished, finishTime: p.finishTime,
          drift: p.k.driftDir || 0, boost: p.k.boostT > 0, spin: p.k.spinT > 0,
          shield: p.shieldUntil > room.raceTime, slow: p.k.slowT > 0,
        } : {}),
      })),
    };
  }

  setInterval(() => {
    const dt = 1 / TICK;
    for (const room of rooms.values()) {
      updateRoom(room, dt);
      room.sendAcc += 1;
      if (room.sendAcc >= SEND_EVERY) { room.sendAcc -= SEND_EVERY; nsp.to(room.id).emit('state', snapshot(room)); }
    }
  }, 1000 / TICK);

  // ---------- Conexiones ----------
  nsp.on('connection', socket => {
    let room = null, me = null;

    socket.on('join', ({ name, char, roomId, bots }) => {
      if (room) return;
      roomId = String(roomId || 'principal').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 20) || 'principal';
      name = String(name || 'Anónimo').trim().slice(0, 14) || 'Anónimo';
      if (!CHAR_IDS.includes(char)) char = CHAR_IDS[Math.floor(Math.random() * CHAR_IDS.length)];
      bots = Math.max(0, Math.min(MAX_BOTS, Math.floor(Number(bots) || 0)));
      const r = getRoom(roomId);
      if (r.players.size >= MAX_PLAYERS) return socket.emit('full');
      room = r;
      me = makeEntry(socket.id, name, char, false, null);
      me.socket = socket;
      room.players.set(me.id, me);
      if (!room.hostId) room.hostId = me.id;
      socket.join(room.id);
      socket.emit('joined', { id: me.id, roomId: room.id });
      ev(room, `${name} (${charName(char)}) entra en boxes 👋`);
      if (bots) addBots(room, me.id, bots);
    });

    socket.on('setTrack', id => {
      if (room && room.phase === 'lobby' && room.hostId === socket.id && S.TRACK_BY_ID[id]) room.trackId = id;
    });

    socket.on('start', () => {
      if (room && room.phase === 'lobby' && room.hostId === socket.id) startRace(room);
    });

    socket.on('kstate', s => {
      if (!room || !me || !me.inRace || !me.k || !s) return;
      const k = me.k, wasFinished = k.finished;
      for (const f of ['x', 'z', 'h', 'speed', 'prog']) if (Number.isFinite(s[f])) k[f] = s[f];
      for (const f of ['idx', 'lap', 'cp']) if (Number.isInteger(s[f])) k[f] = s[f];
      k.driftDir = s.drift | 0; k.boostT = s.boost ? 0.1 : 0; k.spinT = s.spin ? 0.1 : 0; k.slowT = s.slow ? 0.1 : 0;
      k.finished = !!s.finished && k.lap > S.LAPS;
      if (!wasFinished && k.finished && room.phase === 'race') onFinish(room, me);
    });

    socket.on('pickBox', id => {
      if (!room || !me || !me.inRace || room.phase !== 'race' || me.item) return;
      const box = room.boxes[id];
      if (!box || box.activeAt > room.raceTime) return;
      if (Math.hypot(me.k.x - box.x, me.k.z - box.z) > 6) return;
      box.activeAt = room.raceTime + BOX_RESPAWN;
      giveItem(room, me);
    });

    socket.on('useItem', () => { if (room && me && room.phase === 'race') useItem(room, me); });

    socket.on('disconnect', () => {
      if (!room) return;
      room.players.delete(socket.id);
      ev(room, `${me.name} se fue`);
      for (const [id, q] of room.players) if (q.isBot && q.owner === socket.id) room.players.delete(id);
      const hs = humans(room);
      if (!hs.length) { rooms.delete(room.id); return; }
      if (room.hostId === socket.id) { room.hostId = hs[0].id; ev(room, `👑 ${hs[0].name} es el nuevo anfitrión`); }
    });
  });
};
