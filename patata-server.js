// PATATA CALIENTE — servidor.
// Sale una pregunta ("Un país", "Una fruta"...). La patata va pasando: a quien le toca tiene que escribir
// una respuesta válida que no se haya dicho. Nadie sabe cuándo explota. Si te explota, pierdes una vida.
// Las respuestas raras dan más puntos; al llenar la barra ganas una vida extra.
const P = require('./patata-preguntas.js');

const START_HEARTS = 2;
const MAX_HEARTS = 3;
const BONUS_GOAL = 12;           // puntos para ganar una vida
const POINTS = [0, 1, 2, 4];     // por rareza: común 1, poco común 2, rara 4
const FUSE_MIN = 11, FUSE_MAX = 27; // segundos que dura la mecha de cada pregunta (secreto)
const MIN_TURN = 3;              // al recibir la patata siempre tienes al menos esto
const BOOM_PAUSE = 3.2;
const END_PAUSE = 7;
const MAX_PLAYERS = 12;
const MAX_BOTS = 8;
const AVATARS = ['🥔', '🍅', '🧅', '🥕', '🌶️', '🍆', '🥑', '🧄', '🍄', '🌽', '🥦', '🍋', '🍉', '🥥', '🍑', '🫑'];
const BOT_NAMES = ['Paco', 'Lola', 'Chispa', 'Rufus', 'Nena', 'Kiko', 'Mora', 'Pipo', 'Luna', 'Tito', 'Curro', 'Puri'];
const CODE_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

const now = () => Date.now() / 1000;
const rand = (a, b) => a + Math.random() * (b - a);
const clean = (s, n) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, n);

module.exports = function setupPatata(io) {
  const nsp = io.of('/patata');
  const rooms = new Map();

  function newCode() {
    let c;
    do { c = Array.from({ length: 4 }, () => CODE_LETTERS[Math.random() * CODE_LETTERS.length | 0]).join(''); } while (rooms.has(c));
    return c;
  }
  function getRoom(code) {
    if (!rooms.has(code)) {
      rooms.set(code, {
        code, phase: 'lobby', hostId: null, players: new Map(), order: [], turnId: null, q: null,
        used: [], usedIds: new Set(), fuseEnd: 0, pauseUntil: 0, winnerId: null, bots: 0, lastQs: [], round: 0, bot: null,
      });
    }
    return rooms.get(code);
  }
  const list = room => [...room.players.values()];
  const alive = room => room.order.map(id => room.players.get(id)).filter(p => p && p.alive);

  function snapshot(room) {
    return {
      code: room.code, phase: room.phase, hostId: room.hostId, bots: room.bots, round: room.round,
      players: list(room).map(p => ({ id: p.id, name: p.name, avatar: p.avatar, isBot: p.isBot, hearts: p.hearts,
        bonus: p.bonus, alive: p.alive, inGame: p.inGame })),
      order: room.order, turnId: room.turnId, question: room.q ? room.q.text : null, used: room.used,
      winnerId: room.winnerId, bonusGoal: BONUS_GOAL, maxHearts: MAX_HEARTS,
    };
  }
  const send = room => nsp.to(room.code).emit('state', snapshot(room));

  function setBots(room, n) {
    n = Math.max(0, Math.min(MAX_BOTS, n | 0));
    for (const p of list(room)) if (p.isBot) room.players.delete(p.id);
    const used = new Set(list(room).map(p => p.name));
    const names = BOT_NAMES.filter(x => !used.has(x)).sort(() => Math.random() - 0.5);
    for (let i = 0; i < n && room.players.size < MAX_PLAYERS; i++) {
      const id = 'bot' + Math.random().toString(36).slice(2, 8);
      room.players.set(id, newPlayer(id, '🤖 ' + (names[i] || 'Bot' + i), AVATARS[Math.random() * AVATARS.length | 0], true));
    }
    room.bots = list(room).filter(p => p.isBot).length;
  }
  function newPlayer(id, name, avatar, isBot) {
    return { id, name, avatar, isBot, hearts: START_HEARTS, bonus: 0, alive: false, inGame: false };
  }

  function startGame(room) {
    const ps = list(room);
    if (ps.length < 2) return;
    room.order = ps.map(p => p.id).sort(() => Math.random() - 0.5);
    for (const p of ps) { p.hearts = START_HEARTS; p.bonus = 0; p.alive = true; p.inGame = true; }
    room.phase = 'play'; room.winnerId = null; room.round = 0; room.lastQs = [];
    newQuestion(room, room.order[0]);
  }

  function newQuestion(room, turnId) {
    room.q = P.randomQuestion(room.lastQs);
    room.lastQs = [room.q.text, ...room.lastQs].slice(0, 12);
    room.used = []; room.usedIds = new Set(); room.round++;
    room.phase = 'play';
    room.fuseEnd = now() + rand(FUSE_MIN, FUSE_MAX);
    giveTurn(room, turnId);
    nsp.to(room.code).emit('question', { text: room.q.text, round: room.round });
  }

  function nextAlive(room, fromId) {
    const n = room.order.length;
    let i = room.order.indexOf(fromId);
    for (let k = 1; k <= n; k++) {
      const p = room.players.get(room.order[(i + k + n) % n]);
      if (p && p.alive) return p.id;
    }
    return null;
  }

  function giveTurn(room, id) {
    room.turnId = id;
    room.fuseEnd = Math.max(room.fuseEnd, now() + MIN_TURN);
    room.bot = null;
    const p = room.players.get(id);
    if (p && p.isBot) planBot(room, p);
    send(room);
  }

  // ——— Bots ———
  function planBot(room, p) {
    const free = room.q.entries.filter(e => !room.usedIds.has(e.id));
    const hard = room.q.letter ? 1.5 : 1;
    const blank = Math.random() < (free.length < 5 ? 0.5 : 0.09 * hard);
    let entry = null;
    if (!blank && free.length) {
      // Los bots tiran más de respuestas típicas, pero a veces sueltan alguna rara
      entry = free[Math.floor(Math.pow(Math.random(), 2.4) * free.length)];
    }
    const think = rand(1.2, 4.2) * hard;
    room.bot = { id: p.id, entry, typeAt: now() + think, doneAt: now() + think + 0.7, typed: -1 };
  }
  function tickBot(room) {
    const b = room.bot;
    if (!b || room.turnId !== b.id || !b.entry) return;
    const t = now();
    if (t < b.typeAt) return;
    const word = b.entry.name;
    const k = Math.min(word.length, Math.ceil((t - b.typeAt) / (b.doneAt - b.typeAt) * word.length));
    if (k !== b.typed) { b.typed = k; nsp.to(room.code).emit('typing', { id: b.id, text: word.slice(0, k) }); }
    if (t >= b.doneAt) { room.bot = null; answer(room, room.players.get(b.id), word); }
  }

  // ——— Respuestas ———
  function answer(room, p, text) {
    if (!p || room.phase !== 'play' || room.turnId !== p.id) return;
    text = clean(text, 40);
    if (!text) return;
    const e = P.match(room.q, text);
    if (!e) {
      nsp.to(room.code).emit('said', { id: p.id, text, ok: false, reason: 'no' });
      return;
    }
    if (room.usedIds.has(e.id)) {
      nsp.to(room.code).emit('said', { id: p.id, text, ok: false, reason: 'usada', name: e.name });
      return;
    }
    room.usedIds.add(e.id);
    room.used.push({ name: e.name, by: p.id, rare: e.rare });
    let gotHeart = false;
    const pts = POINTS[e.rare];
    if (p.hearts < MAX_HEARTS) {
      p.bonus += pts;
      if (p.bonus >= BONUS_GOAL) { p.bonus -= BONUS_GOAL; p.hearts++; gotHeart = true; }
    } else p.bonus = Math.min(BONUS_GOAL, p.bonus + pts);
    nsp.to(room.code).emit('said', { id: p.id, text, ok: true, name: e.name, rare: e.rare, pts, gotHeart });
    giveTurn(room, nextAlive(room, p.id));
  }

  function boom(room) {
    const p = room.players.get(room.turnId);
    room.bot = null;
    if (p) { p.hearts--; if (p.hearts <= 0) { p.hearts = 0; p.alive = false; } }
    const left = alive(room);
    const sample = room.q.entries.filter(e => !room.usedIds.has(e.id)).slice(0, 40)
      .sort(() => Math.random() - 0.5).slice(0, 3).map(e => e.name);
    nsp.to(room.code).emit('boom', { id: p ? p.id : null, out: p ? !p.alive : false, hints: sample });
    room.phase = 'boom';
    room.pauseUntil = now() + BOOM_PAUSE;
    room.boomId = p ? p.id : null;
    if (left.length <= 1) room.winnerId = left[0] ? left[0].id : null;
    send(room);
  }

  function endGame(room) {
    room.phase = 'end';
    room.pauseUntil = now() + END_PAUSE;
    room.turnId = null;
    send(room);
  }

  function backToLobby(room) {
    room.phase = 'lobby'; room.q = null; room.used = []; room.turnId = null; room.winnerId = null;
    for (const p of list(room)) { p.inGame = false; p.alive = false; p.hearts = START_HEARTS; p.bonus = 0; }
    send(room);
  }

  function removePlayer(room, id) {
    const p = room.players.get(id);
    if (!p) return;
    room.players.delete(id);
    if (room.hostId === id) {
      const h = list(room).find(x => !x.isBot);
      room.hostId = h ? h.id : null;
    }
    if (!list(room).some(x => !x.isBot)) { rooms.delete(room.code); return; }
    if (room.phase === 'play' || room.phase === 'boom') {
      const wasTurn = room.turnId === id;
      const next = wasTurn ? nextAlive(room, id) : null;
      room.order = room.order.filter(x => x !== id);
      const left = alive(room);
      if (left.length <= 1) { room.winnerId = left[0] ? left[0].id : null; endGame(room); return; }
      if (wasTurn && room.phase === 'play') { giveTurn(room, next); return; }
    } else {
      room.order = room.order.filter(x => x !== id);
    }
    send(room);
  }

  setInterval(() => {
    const t = now();
    for (const room of rooms.values()) {
      if (room.phase === 'play') {
        tickBot(room);
        if (t >= room.fuseEnd) boom(room);
      } else if (room.phase === 'boom' && t >= room.pauseUntil) {
        if (room.winnerId !== null || alive(room).length <= 1) endGame(room);
        else {
          const victim = room.players.get(room.boomId);
          newQuestion(room, victim && victim.alive ? victim.id : nextAlive(room, room.boomId));
        }
      } else if (room.phase === 'end' && t >= room.pauseUntil) {
        backToLobby(room);
      }
    }
  }, 100);

  nsp.on('connection', socket => {
    let room = null, me = null;
    let lastAnswer = 0;

    socket.on('join', ({ name, avatar, code }) => {
      if (room) return;
      code = clean(code, 4).toUpperCase().replace(/[^A-Z]/g, '');
      if (code.length !== 4 || !rooms.has(code)) code = code.length === 4 ? code : newCode();
      const r = getRoom(code);
      if (r.players.size >= MAX_PLAYERS) { socket.emit('full'); if (!r.players.size) rooms.delete(code); return; }
      room = r;
      name = clean(name, 14) || 'Anónimo';
      avatar = AVATARS.includes(avatar) ? avatar : AVATARS[0];
      me = newPlayer(socket.id, name, avatar, false);
      room.players.set(me.id, me);
      if (!room.hostId) room.hostId = me.id;
      socket.join(room.code);
      socket.emit('joined', { id: me.id, code: room.code });
      send(room);
    });

    socket.on('setBots', n => {
      if (!room || room.hostId !== me.id || room.phase !== 'lobby') return;
      setBots(room, n); send(room);
    });
    socket.on('start', () => {
      if (!room || room.hostId !== me.id || room.phase !== 'lobby') return;
      startGame(room);
    });
    socket.on('typing', text => {
      if (!room || room.phase !== 'play' || room.turnId !== me.id) return;
      socket.to(room.code).emit('typing', { id: me.id, text: clean(text, 40) });
    });
    socket.on('answer', text => {
      const t = now();
      if (!room || t - lastAnswer < 0.15) return;
      lastAnswer = t;
      answer(room, me, text);
    });
    socket.on('disconnect', () => { if (room && me) removePlayer(room, me.id); });
  });
};
