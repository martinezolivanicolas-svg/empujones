// HNDJOB KARTS — código compartido por el servidor (bots) y el navegador (tu kart):
// circuitos, física de conducción, vueltas y poderes.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KartShared = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  const LAPS = 3;

  // ---------- Personajes ----------
  const CHARACTERS = [
    { id: 'sanchez',   name: 'Pedro Sánchez', color: '#e3262f' },
    { id: 'abascal',   name: 'Abascal',       color: '#5ac035' },
    { id: 'abalos',    name: 'Ábalos',        color: '#ff8c42' },
    { id: 'koldo',     name: 'Koldo',         color: '#8b5a2b' },
    { id: 'trump',     name: 'Trump',         color: '#f2b705' },
    { id: 'netanyahu', name: 'Netanyahu',     color: '#2f6fdf' },
    { id: 'diddy',     name: 'P. Diddy',      color: '#b13bff' },
    { id: 'epstein',   name: 'Epstein',       color: '#4a4a55' },
    { id: 'kirk',      name: 'Charlie Kirk',  color: '#c9d1d9' },
  ];

  // ---------- Poderes ----------
  const ITEMS = {
    sobre:   { icon: '💰', name: 'Sobre',     desc: 'Turbo de dinero negro' },
    aceite:  { icon: '🛢️', name: 'Aceite',    desc: 'Deja una mancha detrás' },
    bomba:   { icon: '💣', name: 'Bomba',     desc: 'Lánzala hacia delante' },
    misil:   { icon: '🎯', name: 'Misil',     desc: 'Persigue al de delante' },
    aforado: { icon: '🛡️', name: 'Aforado',   desc: 'Inmune a todo 6 s' },
    recorte: { icon: '📉', name: 'Recorte',   desc: 'Frena a todos los de delante' },
  };
  // Probabilidades según tu posición: los últimos reciben mejores poderes
  const ITEM_TABLES = {
    front: { aceite: 40, bomba: 30, aforado: 20, sobre: 10 },
    mid:   { sobre: 25, aceite: 15, bomba: 20, misil: 20, aforado: 10, recorte: 10 },
    back:  { sobre: 30, misil: 30, recorte: 20, bomba: 10, aforado: 10 },
  };
  function rollItem(rank, total, rnd = Math.random) {
    const f = total <= 1 ? 0.5 : rank / (total - 1);
    const table = f < 0.25 ? ITEM_TABLES.front : f > 0.66 ? ITEM_TABLES.back : ITEM_TABLES.mid;
    const sum = Object.values(table).reduce((a, b) => a + b, 0);
    let r = rnd() * sum;
    for (const [k, w] of Object.entries(table)) { r -= w; if (r <= 0) return k; }
    return 'sobre';
  }

  // ---------- Circuitos (puntos de control de una curva cerrada) ----------
  const TRACK_DEFS = [
    {
      id: 'playa', name: 'Playa Chiringuito', width: 16,
      theme: { ground: '#e8d39a', ground2: '#d9c07e', road: '#55555f', sky: '#8fd3ff', fog: '#cfefff',
        kerb1: '#ffffff', kerb2: '#ff4f4f', decor: 'palm', water: true },
      points: [[0, 0], [130, 0], [215, -35], [250, -120], [210, -205], [120, -215], [70, -160],
        [0, -175], [-90, -225], [-185, -180], [-215, -95], [-165, -25], [-85, 5]],
      boxes: [0.18, 0.47, 0.76],
    },
    {
      id: 'poligono', name: 'Polígono Industrial', width: 15,
      theme: { ground: '#7c8a6e', ground2: '#6d7a60', road: '#3c3c44', sky: '#b9c4cf', fog: '#c7ccd3',
        kerb1: '#ffd23f', kerb2: '#222222', decor: 'building' },
      points: [[0, 0], [160, 0], [195, -25], [195, -95], [150, -120], [90, -110], [60, -140],
        [70, -200], [30, -235], [-120, -235], [-165, -200], [-160, -130], [-110, -100],
        [-150, -60], [-150, -15], [-100, 5]],
      boxes: [0.15, 0.42, 0.72],
    },
    {
      id: 'volcan', name: 'Volcán Fiscal', width: 17,
      theme: { ground: '#3b2a2a', ground2: '#4a3030', road: '#2a2a30', sky: '#ff9966', fog: '#ff7744',
        kerb1: '#ffaa00', kerb2: '#330000', decor: 'rock', lava: true },
      points: [[0, 0], [110, 10], [190, -20], [230, -90], [190, -150], [110, -140], [60, -180],
        [90, -250], [20, -300], [-90, -280], [-140, -210], [-110, -150], [-190, -110],
        [-200, -40], [-110, -10]],
      boxes: [0.2, 0.5, 0.8],
    },
  ];

  // Convierte los puntos de control en una línea suave muestreada cada ~2.5 unidades
  function buildTrack(def) {
    const P = def.points, n = P.length, dense = [];
    const cr = (p0, p1, p2, p3, t) => {
      const t2 = t * t, t3 = t2 * t;
      return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
    };
    for (let i = 0; i < n; i++) {
      const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n];
      for (let s = 0; s < 40; s++) {
        const t = s / 40;
        dense.push([cr(p0[0], p1[0], p2[0], p3[0], t), cr(p0[1], p1[1], p2[1], p3[1], t)]);
      }
    }
    // Remuestreo uniforme
    const lens = [0];
    for (let i = 1; i <= dense.length; i++) {
      const a = dense[i - 1], b = dense[i % dense.length];
      lens.push(lens[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1]));
    }
    const total = lens[lens.length - 1], STEP = 2.5, N = Math.round(total / STEP);
    const pts = [];
    let j = 0;
    for (let k = 0; k < N; k++) {
      const target = (k / N) * total;
      while (lens[j + 1] < target) j++;
      const a = dense[j], b = dense[(j + 1) % dense.length];
      const t = (target - lens[j]) / ((lens[j + 1] - lens[j]) || 1);
      pts.push({ x: a[0] + (b[0] - a[0]) * t, z: a[1] + (b[1] - a[1]) * t });
    }
    for (let k = 0; k < N; k++) {
      const a = pts[(k - 1 + N) % N], b = pts[(k + 1) % N];
      const tx = b.x - a.x, tz = b.z - a.z, l = Math.hypot(tx, tz) || 1;
      pts[k].tx = tx / l; pts[k].tz = tz / l;
      pts[k].nx = -pts[k].tz; pts[k].nz = pts[k].tx; // normal hacia la derecha
    }
    const boxes = [];
    def.boxes.forEach((f, row) => {
      const p = pts[Math.floor(f * N)];
      [-0.3, -0.1, 0.1, 0.3].forEach((o, c) => boxes.push({
        id: row * 4 + c, x: p.x + p.nx * o * def.width, z: p.z + p.nz * o * def.width,
      }));
    });
    return { ...def, pts, N, length: total, boxes };
  }

  const TRACKS = TRACK_DEFS.map(buildTrack);
  const TRACK_BY_ID = Object.fromEntries(TRACKS.map(t => [t.id, t]));

  // Punto más cercano de la pista (busca cerca del último índice para ir rápido)
  function locate(track, x, z, hint) {
    const { pts, N } = track;
    let best = -1, bestD = Infinity;
    const scan = (i) => {
      const p = pts[i], d = (p.x - x) ** 2 + (p.z - z) ** 2;
      if (d < bestD) { bestD = d; best = i; }
    };
    if (hint == null) for (let i = 0; i < N; i++) scan(i);
    else for (let o = -25; o <= 25; o++) scan(((hint + o) % N + N) % N);
    const p = pts[best];
    const lat = (x - p.x) * p.nx + (z - p.z) * p.nz;
    return { idx: best, lat };
  }

  // Posiciones de salida: parrilla detrás de la línea de meta
  function gridSlot(track, slot) {
    const { pts, N } = track;
    const row = Math.floor(slot / 2), side = slot % 2 ? 1 : -1;
    const idx = (N - 3 - row * 3 + N) % N;
    const p = pts[idx];
    return { x: p.x + p.nx * side * track.width * 0.22, z: p.z + p.nz * side * track.width * 0.22,
      h: Math.atan2(p.tz, p.tx), idx };
  }

  // ---------- Física del kart ----------
  const PHYS = {
    maxSpeed: 34, accel: 26, brake: 45, reverseMax: 10, coastDrag: 9,
    offroadMax: 0.5, turnRate: 2.3, driftTurn: 1.7, driftExtra: 1.1,
    miniTurbo1: 0.6, miniTurbo2: 1.3, wall: 7,
  };

  function newKart(track, slot) {
    const g = gridSlot(track, slot);
    return { x: g.x, z: g.z, h: g.h, speed: 0, idx: g.idx, lap: 0, cp: 0, prog: -0.02,
      driftDir: 0, driftT: 0, boostT: 0, spinT: 0, slowT: 0, shieldT: 0, offroad: false, finished: false };
  }

  // input: { throttle: -1..1, steer: -1..1 (derecha +), drift: bool }
  function stepKart(k, input, dt, track, opts = {}) {
    const maxF = opts.maxFactor || 1;
    k.boostT = Math.max(0, k.boostT - dt);
    k.spinT = Math.max(0, k.spinT - dt);
    k.slowT = Math.max(0, k.slowT - dt);
    k.shieldT = Math.max(0, k.shieldT - dt);

    let throttle = input.throttle || 0, steer = Math.max(-1, Math.min(1, input.steer || 0));
    if (k.spinT > 0 || !opts.canDrive) { throttle = 0; steer = 0; k.driftDir = 0; k.driftT = 0; }

    let maxSpeed = PHYS.maxSpeed * maxF;
    if (k.offroad && k.boostT <= 0) maxSpeed *= PHYS.offroadMax;
    if (k.slowT > 0) maxSpeed *= 0.55;
    if (k.boostT > 0) maxSpeed *= 1.45;

    // Acelerar / frenar
    if (k.boostT > 0) k.speed += PHYS.accel * 2.5 * dt;
    else if (throttle > 0) k.speed += PHYS.accel * throttle * dt;
    else if (throttle < 0) k.speed -= (k.speed > 0 ? PHYS.brake : PHYS.accel * 0.6) * -throttle * dt;
    else k.speed -= Math.sign(k.speed) * Math.min(Math.abs(k.speed), PHYS.coastDrag * dt);
    if (k.speed > maxSpeed) k.speed = Math.max(maxSpeed, k.speed - 40 * dt);
    if (k.speed < -PHYS.reverseMax) k.speed = -PHYS.reverseMax;
    if (k.spinT > 0) k.speed *= Math.max(0, 1 - 2.5 * dt);

    // Derrape: mantén el botón mientras giras para cargar un mini-turbo
    if (input.drift && k.driftDir === 0 && Math.abs(steer) > 0.3 && k.speed > 15) {
      k.driftDir = Math.sign(steer); k.driftT = 0;
    }
    if (k.driftDir !== 0 && (!input.drift || k.speed < 10)) {
      if (k.driftT > PHYS.miniTurbo2) k.boostT = Math.max(k.boostT, 1.1);
      else if (k.driftT > PHYS.miniTurbo1) k.boostT = Math.max(k.boostT, 0.55);
      k.driftDir = 0; k.driftT = 0;
    }
    const speedK = Math.min(1, Math.abs(k.speed) / 10);
    let turn;
    if (k.driftDir !== 0) {
      k.driftT += dt;
      turn = k.driftDir * (PHYS.driftTurn + steer * k.driftDir * PHYS.driftExtra);
    } else {
      turn = steer * PHYS.turnRate * (k.speed >= 0 ? 1 : -1);
    }
    if (k.spinT > 0) turn = 0;
    k.h += turn * speedK * dt;

    // Mover
    k.x += Math.cos(k.h) * k.speed * dt;
    k.z += Math.sin(k.h) * k.speed * dt;

    // Pista: fuera del asfalto se va lento, y hay un muro invisible
    const loc = locate(track, k.x, k.z, k.idx);
    k.idx = loc.idx;
    const half = track.width / 2;
    k.offroad = Math.abs(loc.lat) > half + 0.5;
    if (Math.abs(loc.lat) > half + PHYS.wall) {
      const p = track.pts[loc.idx], lim = Math.sign(loc.lat) * (half + PHYS.wall);
      k.x = p.x + p.nx * lim; k.z = p.z + p.nz * lim;
      k.speed *= 0.5;
    }
    updateLap(k, track);
    return k;
  }

  // Vueltas: hay que pasar por los 4 cuartos del circuito en orden
  function updateLap(k, track) {
    const q = Math.floor(k.idx / track.N * 4);
    if (q === k.cp) {
      k.cp = (k.cp + 1) % 4;
      if (q === 0) { k.lap++; if (k.lap > LAPS) k.finished = true; }
    }
    k.prog = (k.lap - 1) + k.idx / track.N;
    if (k.cp === 1 && q === 3) k.prog -= 1; // marcha atrás sobre la meta
    if (k.lap === 0) k.prog = -1 + k.idx / track.N;
  }

  return { LAPS, CHARACTERS, ITEMS, rollItem, TRACKS, TRACK_BY_ID, locate, gridSlot, PHYS, newKart, stepKart };
});
