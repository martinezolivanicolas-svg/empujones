// PEPSTEIN KARTS — cliente 3D (Three.js)
// Tu kart se conduce aquí mismo (sin retraso) y se envía al servidor;
// los demás karts, cajas y poderes llegan del servidor.
import * as THREE from 'three';

const S = window.KartShared;
const socket = io('/karts');
const $ = id => document.getElementById(id);
const CHAR = Object.fromEntries(S.CHARACTERS.map(c => [c.id, c]));
const photoURL = id => `fotos/${id}.jpg`;
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

// ======================= MENÚ =======================
let myChar = store.get('karts-piloto', null);
if (!CHAR[myChar]) myChar = S.CHARACTERS[Math.floor(Math.random() * S.CHARACTERS.length)].id;
const charBtns = S.CHARACTERS.map(c => {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'char'; b.setAttribute('role', 'radio');
  b.innerHTML = `<img src="${photoURL(c.id)}" alt=""><span>${c.name}</span>`;
  b.onclick = () => selectChar(c.id);
  $('chars').append(b);
  return [c.id, b];
});
function selectChar(id) {
  myChar = id; store.set('karts-piloto', id);
  for (const [cid, b] of charBtns) b.setAttribute('aria-checked', String(cid === id));
}
selectChar(myChar);

const BOTS_MAX = 8;
const botsSaved = store.get('karts-bots', { on: true, n: 4 });
let botsCount = Math.min(BOTS_MAX, Math.max(1, botsSaved.n | 0)) || 4;
$('botsOn').checked = !!botsSaved.on;
function renderBots() {
  $('botsStepper').hidden = !$('botsOn').checked;
  $('botsCount').textContent = botsCount;
  $('botsMinus').disabled = botsCount <= 1;
  $('botsPlus').disabled = botsCount >= BOTS_MAX;
  store.set('karts-bots', { on: $('botsOn').checked, n: botsCount });
}
$('botsOn').onchange = renderBots;
$('botsMinus').onclick = () => { botsCount = Math.max(1, botsCount - 1); renderBots(); };
$('botsPlus').onclick = () => { botsCount = Math.min(BOTS_MAX, botsCount + 1); renderBots(); };
renderBots();

$('room').value = new URLSearchParams(location.search).get('sala') || '';
$('name').value = store.get('karts-nombre', '');
function enter() {
  const name = $('name').value.trim() || 'Anónimo';
  store.set('karts-nombre', name);
  socket.emit('join', { name, char: myChar, roomId: $('room').value.trim() || 'principal',
    bots: $('botsOn').checked ? botsCount : 0 });
}
$('enter').onclick = enter;
for (const el of [$('name'), $('room')]) el.addEventListener('keydown', e => { if (e.key === 'Enter') enter(); });

let myId = null, roomId = null;
socket.on('joined', d => {
  myId = d.id; roomId = d.roomId;
  $('menu').hidden = true;
  const url = `${location.origin}${location.pathname}?sala=${encodeURIComponent(roomId)}`;
  history.replaceState(null, '', url);
  $('share').textContent = `Sala "${roomId}" · toca para copiar el enlace e invitar`;
  $('share').onclick = () => navigator.clipboard?.writeText(url).then(() => { $('share').textContent = '¡Enlace copiado! 📋'; }).catch(() => {});
});
socket.on('full', () => alert('La sala está llena. Prueba con otra.'));
socket.on('disconnect', () => pushFeed('Conexión perdida… recarga la página'));

// Tarjetas de circuitos (mini dibujo de la pista)
const trackBtns = S.TRACKS.map(t => {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'trk'; b.setAttribute('role', 'radio');
  const cv = document.createElement('canvas'); cv.width = 240; cv.height = 140;
  drawTrackShape(cv.getContext('2d'), t, 240, 140, { playa: '#ff5d5d', poligono: '#ffd23f', volcan: '#ff8c1a' }[t.id] || '#fff', 10);
  b.append(cv, document.createTextNode(t.name));
  b.onclick = () => socket.emit('setTrack', t.id);
  $('tracks').append(b);
  return [t.id, b];
});
$('startBtn').onclick = () => socket.emit('start');

function trackBounds(t) {
  let a = Infinity, b = -Infinity, c = Infinity, d = -Infinity;
  for (const p of t.pts) { a = Math.min(a, p.x); b = Math.max(b, p.x); c = Math.min(c, p.z); d = Math.max(d, p.z); }
  return { minX: a, maxX: b, minZ: c, maxZ: d };
}
function mapper(t, w, h, pad) {
  const bb = trackBounds(t), s = Math.min((w - pad * 2) / (bb.maxX - bb.minX), (h - pad * 2) / (bb.maxZ - bb.minZ));
  const ox = (w - (bb.maxX - bb.minX) * s) / 2, oz = (h - (bb.maxZ - bb.minZ) * s) / 2;
  return (x, z) => [ox + (x - bb.minX) * s, oz + (z - bb.minZ) * s];
}
function drawTrackShape(c, t, w, h, color, lw) {
  const m = mapper(t, w, h, lw);
  c.clearRect(0, 0, w, h);
  c.lineJoin = 'round'; c.lineWidth = lw; c.strokeStyle = color;
  c.beginPath();
  t.pts.forEach((p, i) => { const [x, y] = m(p.x, p.z); i ? c.lineTo(x, y) : c.moveTo(x, y); });
  c.closePath(); c.stroke();
  return m;
}

// ======================= ESCENA 3D =======================
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
$('game').append(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, 1, 0.5, 1500);
scene.add(new THREE.HemisphereLight(0xffffff, 0x555544, 1.6));
const sun = new THREE.DirectionalLight(0xffffff, 1.4); sun.position.set(80, 140, 40); scene.add(sun);
function resize() {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();

function canvasTex(w, h, draw, repeat) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  draw(cv.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  t.anisotropy = 4;
  return t;
}
function rng(seed) { // números aleatorios repetibles por circuito
  let a = seed >>> 0;
  return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

let world = null, curTrack = null, boxMeshes = [];
function buildWorld(track) {
  if (curTrack === track) return;
  if (world) { scene.remove(world); world.traverse(o => { o.geometry?.dispose(); }); }
  world = new THREE.Group(); scene.add(world);
  curTrack = track;
  const th = track.theme, half = track.width / 2;
  scene.background = new THREE.Color(th.sky);
  scene.fog = new THREE.Fog(th.fog, 120, 520);

  // Suelo
  const groundTex = canvasTex(128, 128, (c, w, h) => {
    c.fillStyle = th.ground; c.fillRect(0, 0, w, h);
    const r = rng(7);
    for (let i = 0; i < 500; i++) { c.fillStyle = r() > 0.5 ? th.ground2 : th.ground; c.fillRect(r() * w, r() * h, 3, 3); }
  }, [300, 300]);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), new THREE.MeshLambertMaterial({ map: groundTex }));
  ground.rotation.x = -Math.PI / 2; world.add(ground);

  // Carretera (cinta siguiendo la pista)
  const roadTex = canvasTex(128, 256, (c, w, h) => {
    c.fillStyle = th.road; c.fillRect(0, 0, w, h);
    const r = rng(3);
    for (let i = 0; i < 700; i++) { const g = 70 + r() * 40 | 0; c.fillStyle = `rgba(${g},${g},${g},0.25)`; c.fillRect(r() * w, r() * h, 2, 2); }
    c.fillStyle = '#ffffffcc'; c.fillRect(w / 2 - 2, 0, 4, h * 0.5);
  });
  roadTex.wrapT = THREE.RepeatWrapping;
  const ribbon = (inner, outer, y, colorFn) => {
    const pos = [], uv = [], col = [], idx = [];
    let dist = 0;
    for (let i = 0; i <= track.N; i++) {
      const p = track.pts[i % track.N];
      if (i > 0) { const q = track.pts[i - 1]; dist += Math.hypot(p.x - q.x, p.z - q.z); }
      pos.push(p.x + p.nx * inner, y, p.z + p.nz * inner, p.x + p.nx * outer, y, p.z + p.nz * outer);
      uv.push(0, dist / 10, 1, dist / 10);
      if (colorFn) { const cc = new THREE.Color(colorFn(i)); col.push(cc.r, cc.g, cc.b, cc.r, cc.g, cc.b); }
      if (i < track.N) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    if (colorFn) g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx); g.computeVertexNormals();
    return g;
  };
  const road = new THREE.Mesh(ribbon(-half, half, 0.03), new THREE.MeshLambertMaterial({ map: roadTex, side: THREE.DoubleSide }));
  world.add(road);
  const kerbMat = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
  const kc = i => (Math.floor(i / 3) % 2 ? th.kerb1 : th.kerb2);
  world.add(new THREE.Mesh(ribbon(half, half + 1.4, 0.05, kc), kerbMat));
  world.add(new THREE.Mesh(ribbon(-half - 1.4, -half, 0.05, kc), kerbMat));

  // Línea de meta
  const p0 = track.pts[0];
  const checker = canvasTex(160, 32, (c, w, h) => {
    for (let x = 0; x < 10; x++) for (let y = 0; y < 2; y++) { c.fillStyle = (x + y) % 2 ? '#111' : '#fff'; c.fillRect(x * 16, y * 16, 16, 16); }
  });
  const line = new THREE.Mesh(new THREE.PlaneGeometry(track.width, 3), new THREE.MeshLambertMaterial({ map: checker }));
  line.geometry.rotateX(-Math.PI / 2);
  line.rotation.y = Math.atan2(-p0.nz, p0.nx);
  line.position.set(p0.x, 0.07, p0.z); world.add(line);
  // Arco de salida
  const postMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
  for (const s of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.8, 9, 0.8), postMat);
    post.position.set(p0.x + p0.nx * s * (half + 2), 4.5, p0.z + p0.nz * s * (half + 2)); world.add(post);
  }
  const banner = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.4, track.width + 5), new THREE.MeshLambertMaterial({
    map: canvasTex(512, 64, (c, w, h) => {
      c.fillStyle = '#e3262f'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#fff'; c.font = 'bold 44px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('PEPSTEIN KARTS · ' + track.name.toUpperCase(), w / 2, h / 2 + 2);
    }) }));
  banner.position.set(p0.x, 9, p0.z);
  banner.rotation.y = -Math.atan2(p0.tz, p0.tx); world.add(banner);

  // Decoración alrededor del circuito
  const r = rng([...track.id].reduce((a, ch) => a * 31 + ch.charCodeAt(0), 7));
  const bb = trackBounds(track);
  const deco = makeDecor(th);
  let placed = 0;
  for (let i = 0; i < 900 && placed < 170; i++) {
    const x = bb.minX - 90 + r() * (bb.maxX - bb.minX + 180), z = bb.minZ - 90 + r() * (bb.maxZ - bb.minZ + 180);
    const loc = S.locate(track, x, z);
    if (Math.abs(loc.lat) < half + 12) continue;
    const o = deco(r); o.position.set(x, 0, z); o.rotation.y = r() * Math.PI * 2; world.add(o); placed++;
  }
  if (th.lava) { // volcán gigante de fondo
    const v = new THREE.Mesh(new THREE.ConeGeometry(90, 120, 14), new THREE.MeshLambertMaterial({ color: 0x2b1d1d }));
    v.position.set((bb.minX + bb.maxX) / 2, 60, bb.minZ - 220); world.add(v);
    const lava = new THREE.Mesh(new THREE.ConeGeometry(22, 20, 14), new THREE.MeshBasicMaterial({ color: 0xff5500 }));
    lava.position.set(v.position.x, 112, v.position.z); world.add(lava);
  }
  if (th.water) { // mar
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(2000, 900), new THREE.MeshLambertMaterial({ color: 0x2a9fd8 }));
    sea.rotation.x = -Math.PI / 2; sea.position.set(0, 0.01, bb.maxZ + 560); world.add(sea);
  }

  // Cajas de poderes
  const boxTex = canvasTex(64, 64, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#ff5d5d'); g.addColorStop(0.5, '#ffd23f'); g.addColorStop(1, '#4dabff');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = '#fff'; c.font = 'bold 48px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', w / 2, h / 2 + 3);
  });
  const boxMat = new THREE.MeshLambertMaterial({ map: boxTex, transparent: true, opacity: 0.85 });
  const boxGeo = new THREE.BoxGeometry(1.8, 1.8, 1.8);
  boxMeshes = track.boxes.map(b => { const m = new THREE.Mesh(boxGeo, boxMat); m.position.set(b.x, 1.5, b.z); world.add(m); return m; });

  // Minimapa
  minimapMap = null;
}

function makeDecor(th) {
  const M = c => new THREE.MeshLambertMaterial({ color: c });
  if (th.decor === 'palm') {
    const trunk = new THREE.CylinderGeometry(0.35, 0.6, 7, 6), leaf = new THREE.ConeGeometry(3.4, 2.2, 7);
    const brella = new THREE.ConeGeometry(3, 1.2, 10), pole = new THREE.CylinderGeometry(0.1, 0.1, 3.5, 5);
    const mT = M(0x8b5a2b), mL = M(0x2fa84f), mB1 = M(0xff5d5d), mB2 = M(0x4dabff), mP = M(0xeeeeee);
    return r => {
      const g = new THREE.Group();
      if (r() < 0.7) {
        const t = new THREE.Mesh(trunk, mT); t.position.y = 3.5; t.rotation.z = (r() - 0.5) * 0.3; g.add(t);
        const l = new THREE.Mesh(leaf, mL); l.position.set(t.rotation.z * -3.5, 7.4, 0); l.rotation.x = Math.PI; g.add(l);
      } else {
        const p = new THREE.Mesh(pole, mP); p.position.y = 1.75; g.add(p);
        const b = new THREE.Mesh(brella, r() < 0.5 ? mB1 : mB2); b.position.y = 3.6; g.add(b);
      }
      return g;
    };
  }
  if (th.decor === 'building') {
    const box = new THREE.BoxGeometry(1, 1, 1), cone = new THREE.ConeGeometry(0.6, 1.4, 8);
    const mats = [0x9aa3ad, 0x7d8690, 0xb5a48a, 0x8a6f5a].map(M), mCone = M(0xff7a1a);
    return r => {
      const g = new THREE.Group();
      if (r() < 0.65) {
        const w = 10 + r() * 18, h = 6 + r() * 22, d = 10 + r() * 18;
        const b = new THREE.Mesh(box, mats[r() * mats.length | 0]); b.scale.set(w, h, d); b.position.y = h / 2; g.add(b);
      } else {
        const c = new THREE.Mesh(cone, mCone); c.position.y = 0.7; g.add(c);
        c.scale.setScalar(1.5);
      }
      return g;
    };
  }
  const rock = new THREE.DodecahedronGeometry(1, 0), mR = M(0x4a3434), mG = new THREE.MeshBasicMaterial({ color: 0xff6a00 });
  return r => {
    const g = new THREE.Group();
    const m = new THREE.Mesh(rock, r() < 0.2 ? mG : mR); const s = 1.5 + r() * 5;
    m.scale.set(s, s * (0.6 + r() * 0.6), s); m.position.y = s * 0.3; g.add(m);
    return g;
  };
}

// ---------- Karts ----------
const photoTex = {};
function getPhotoTex(id) {
  if (photoTex[id]) return photoTex[id];
  const cv = document.createElement('canvas'); cv.width = cv.height = 256;
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const img = new Image();
  img.onload = () => { // pegatina cutre: borde blanco y un poco torcida
    const c = cv.getContext('2d');
    c.translate(128, 128); c.rotate(-0.06);
    c.fillStyle = '#fff'; c.fillRect(-118, -118, 236, 236);
    c.drawImage(img, -106, -106, 212, 212);
    tex.needsUpdate = true;
  };
  img.src = photoURL(id);
  return (photoTex[id] = tex);
}
function labelSprite(text) {
  const tex = canvasTex(256, 64, (c, w, h) => {
    c.font = 'bold 34px "Chakra Petch", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.lineWidth = 7; c.strokeStyle = '#000'; c.strokeText(text, w / 2, h / 2); c.fillStyle = '#fff'; c.fillText(text, w / 2, h / 2);
  });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  s.scale.set(5, 1.25, 1); s.renderOrder = 10;
  return s;
}
const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.45, 12).rotateX(Math.PI / 2);
const wheelMat = new THREE.MeshLambertMaterial({ color: 0x151515 });
const sparkTex = canvasTex(32, 32, (c) => { const g = c.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, '#fff'); g.addColorStop(1, '#fff0'); c.fillStyle = g; c.fillRect(0, 0, 32, 32); });
function makeKart(charId, name, showLabel) {
  const color = new THREE.Color(CHAR[charId]?.color || '#888');
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const mBody = new THREE.MeshLambertMaterial({ color }), mDark = new THREE.MeshLambertMaterial({ color: color.clone().multiplyScalar(0.55) });
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.7, 2), mBody); chassis.position.y = 0.65; body.add(chassis);
  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 1.7), mDark); nose.position.set(1.9, 0.55, 0); body.add(nose);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1, 1.3), mDark); seat.position.set(-0.9, 1.3, 0); body.add(seat);
  const spoiler = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 2.3), mDark); spoiler.position.set(-1.7, 1.5, 0); body.add(spoiler);
  for (const [x, z] of [[1.1, 1.1], [1.1, -1.1], [-1.1, 1.15], [-1.1, -1.15]]) {
    const w = new THREE.Mesh(wheelGeo, wheelMat); w.position.set(x, 0.5, z); body.add(w);
  }
  // La "cabeza": una foto pegada en un cartón, versión cutre
  const face = new THREE.Sprite(new THREE.SpriteMaterial({ map: getPhotoTex(charId) }));
  face.scale.set(2.5, 2.5, 1); face.position.set(-0.3, 2.65, 0); body.add(face);
  const shield = new THREE.Mesh(new THREE.SphereGeometry(2.7, 16, 12), new THREE.MeshBasicMaterial({ color: 0x66ddff, transparent: true, opacity: 0.3, depthWrite: false }));
  shield.renderOrder = 5;
  shield.position.y = 1.4; shield.visible = false; g.add(shield);
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.8, 8).rotateZ(Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xff8c1a }));
  flame.position.set(-2.4, 0.7, 0); flame.visible = false; body.add(flame);
  const sparks = [0.9, -0.9].map(z => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: sparkTex, color: 0x66ccff, transparent: true, depthWrite: false }));
    s.position.set(-1.4, 0.3, z); s.scale.setScalar(1.2); s.visible = false; body.add(s); return s;
  });
  if (showLabel) { const l = labelSprite(name); l.position.y = 4.6; g.add(l); }
  scene.add(g);
  return { g, body, shield, flame, sparks, spin: 0, x: 0, z: 0, h: 0, init: false };
}
function updateKartVisual(v, d, dt, now) {
  v.g.position.set(v.x, 0, v.z);
  if (d.spin) v.spin += dt * 14; else v.spin *= Math.max(0, 1 - dt * 10);
  const slide = d.drift ? -d.drift * 0.4 : 0;
  v.body.rotation.y += ((slide + v.spin) - v.body.rotation.y) * Math.min(1, dt * 10);
  v.g.rotation.y = -v.h;
  v.shield.visible = !!d.shield;
  v.flame.visible = !!d.boost; if (d.boost) v.flame.scale.setScalar(0.8 + Math.random() * 0.5);
  const sc = d.sparkColor;
  for (const s of v.sparks) {
    s.visible = !!d.drift && Math.random() > 0.2;
    if (sc) s.material.color.set(sc);
    s.scale.setScalar(0.8 + Math.random() * 0.8);
  }
  v.body.position.y = d.slow ? -0.25 : Math.sin(now / 90 + v.x) * 0.03;
  v.body.scale.setScalar(d.slow ? 0.8 : 1);
}

// ---------- Poderes en pista ----------
const hazardMeshes = new Map();
const hzGeo = {
  aceite: new THREE.CircleGeometry(2, 16).rotateX(-Math.PI / 2),
  bomba: new THREE.SphereGeometry(0.9, 14, 10),
  misil: new THREE.ConeGeometry(0.45, 2, 10).rotateZ(-Math.PI / 2),
};
const hzMat = {
  aceite: new THREE.MeshLambertMaterial({ color: 0x111111 }),
  bomba: new THREE.MeshLambertMaterial({ color: 0x1a1a1a }),
  misil: new THREE.MeshLambertMaterial({ color: 0xe3262f }),
};
function syncHazards(list) {
  const seen = new Set();
  for (const h of list) {
    seen.add(h.id);
    let m = hazardMeshes.get(h.id);
    if (!m) { m = new THREE.Mesh(hzGeo[h.type], hzMat[h.type]); scene.add(m); hazardMeshes.set(h.id, m); m.userData.t = h.type; m.position.set(h.x, 0, h.z); }
    m.userData.tx = h.x; m.userData.tz = h.z; m.rotation.y = -h.h;
  }
  for (const [id, m] of hazardMeshes) if (!seen.has(id)) { scene.remove(m); hazardMeshes.delete(id); }
}
const booms = [];
function boom(x, z) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), new THREE.MeshBasicMaterial({ color: 0xff8c1a, transparent: true, opacity: 0.8 }));
  m.position.set(x, 1, z); scene.add(m); booms.push({ m, t: 0 });
}

// ======================= JUEGO =======================
let state = null, stateAt = 0;
let me = null, myVis = null, canDrive = false;
let myItem = null, rolling = 0, rollIcon = '';
const pendingBoxes = new Map();
const others = new Map();
const feedEl = $('feed');
function pushFeed(text) {
  const d = document.createElement('div'); d.textContent = text; feedEl.append(d);
  while (feedEl.children.length > 5) feedEl.firstChild.remove();
  setTimeout(() => { d.style.opacity = 0; setTimeout(() => d.remove(), 600); }, 5000);
}

socket.on('raceStart', ({ trackId, slots }) => {
  const t = S.TRACK_BY_ID[trackId];
  buildWorld(t);
  me = slots[myId] != null ? S.newKart(t, slots[myId]) : null;
  if (me && !myVis) myVis = makeKart(myChar, '', false);
  myItem = null; rolling = 0; pendingBoxes.clear();
});
socket.on('item', ({ item }) => { myItem = item; rolling = 1.2; });
socket.on('effect', ({ type, t }) => {
  if (!me) return;
  if (type === 'boost') me.boostT = Math.max(me.boostT, t);
  if (type === 'slow') { me.slowT = t; pushFeed('📉 ¡Te han aplicado un recorte!'); }
  if (type === 'shield') me.shieldT = t;
  if (type === 'spin') { me.spinT = t; me.driftDir = 0; me.driftT = 0; }
});

socket.on('state', s => {
  const prev = state;
  state = s; stateAt = performance.now();
  if (!curTrack || curTrack.id !== s.trackId) buildWorld(S.TRACK_BY_ID[s.trackId]);
  for (const e of s.events) pushFeed(e);
  for (const f of s.fx) if (f.type === 'boom') boom(f.x, f.z);
  syncHazards(s.hazards);
  // Karts de los demás
  const seen = new Set();
  for (const p of s.players) {
    if (p.id === myId || !p.inRace || p.x == null) continue;
    seen.add(p.id);
    let o = others.get(p.id);
    if (!o) { o = makeKart(p.char, p.name, false); others.set(p.id, o); } // sin nombre encima: no tapa la vista
    o.data = p;
    if (!o.init) { o.x = p.x; o.z = p.z; o.h = p.h; o.init = true; }
  }
  for (const [id, o] of others) if (!seen.has(id)) { scene.remove(o.g); others.delete(id); }
  if (myVis) myVis.g.visible = !!me && s.phase !== 'lobby' && s.phase !== 'results';
  if (s.phase === 'lobby' || s.phase === 'results') { me = null; myItem = null; rolling = 0; }
  updateOverlays(prev);
});

// ---------- Controles ----------
const keys = {};
const isTouch = matchMedia('(pointer: coarse)').matches;
if (isTouch) document.body.classList.add('touch');
addEventListener('keydown', e => {
  if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
  keys[e.code] = true;
  if ((e.code === 'KeyE' || e.code === 'Enter') && !e.repeat) useItem();
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
});
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
const touch = {};
for (const [id, k] of [['tLeft', 'left'], ['tRight', 'right'], ['tBrake', 'brake'], ['tDrift', 'drift']]) {
  const el = $(id);
  el.addEventListener('touchstart', e => { e.preventDefault(); touch[k] = true; el.classList.add('on'); }, { passive: false });
  el.addEventListener('touchend', e => { e.preventDefault(); touch[k] = false; el.classList.remove('on'); }, { passive: false });
}
$('tItem').addEventListener('touchstart', e => { e.preventDefault(); useItem(); }, { passive: false });
function readInput() {
  const up = keys.KeyW || keys.ArrowUp, down = keys.KeyS || keys.ArrowDown || touch.brake;
  const left = keys.KeyA || keys.ArrowLeft || touch.left, right = keys.KeyD || keys.ArrowRight || touch.right;
  let throttle = up ? 1 : 0;
  if (isTouch && !down) throttle = 1; // en el móvil acelera solo
  if (down) throttle = -1;
  return { throttle, steer: (right ? 1 : 0) - (left ? 1 : 0), drift: !!(keys.Space || keys.ShiftLeft || keys.ShiftRight || touch.drift) };
}
function useItem() {
  if (!me || !myItem || rolling > 0 || !canDrive) return;
  myItem = null; socket.emit('useItem');
}

// ---------- Bucle principal ----------
let last = performance.now(), acc = 0, sendT = 0, lobbyAngle = 0;
const camPos = new THREE.Vector3(), camLook = new THREE.Vector3();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  canDrive = !!state && state.phase === 'race';

  if (me && curTrack) {
    acc += dt;
    const inp = readInput();
    while (acc >= 1 / 60) {
      S.stepKart(me, inp, 1 / 60, curTrack, { canDrive });
      // Choques contra los demás karts
      for (const o of others.values()) {
        const dx = me.x - o.x, dz = me.z - o.z, d = Math.hypot(dx, dz);
        if (d > 0 && d < 3.2) { me.x += dx / d * (3.2 - d); me.z += dz / d * (3.2 - d); me.speed *= 0.97; }
      }
      acc -= 1 / 60;
    }
    // Cajas
    if (state && canDrive && !myItem) {
      curTrack.boxes.forEach((b, i) => {
        if (!state.boxes[i] || pendingBoxes.has(i)) return;
        if (Math.hypot(me.x - b.x, me.z - b.z) < 2.8) { pendingBoxes.set(i, now); socket.emit('pickBox', i); }
      });
    }
    for (const [i, t] of pendingBoxes) if (now - t > 1500) pendingBoxes.delete(i);
    sendT += dt;
    if (sendT > 0.05) {
      sendT = 0;
      socket.emit('kstate', { x: me.x, z: me.z, h: me.h, speed: me.speed, idx: me.idx, lap: me.lap, cp: me.cp, prog: me.prog,
        finished: me.finished, drift: me.driftDir, boost: me.boostT > 0, spin: me.spinT > 0, slow: me.slowT > 0 });
    }
    myVis.x = me.x; myVis.z = me.z; myVis.h = me.h;
    const sparkColor = me.driftT > S.PHYS.miniTurbo2 ? '#ff8c1a' : me.driftT > S.PHYS.miniTurbo1 ? '#66ccff' : '#ffffff';
    updateKartVisual(myVis, { drift: me.driftDir, boost: me.boostT > 0, spin: me.spinT > 0, shield: me.shieldT > 0, slow: me.slowT > 0, sparkColor }, dt, now);
  }

  // Los demás: suavizado hacia la última posición recibida
  for (const o of others.values()) {
    const d = o.data, k = Math.min(1, dt * 12);
    o.x += (d.x - o.x) * k; o.z += (d.z - o.z) * k;
    let dh = d.h - o.h; dh = Math.atan2(Math.sin(dh), Math.cos(dh)); o.h += dh * k;
    updateKartVisual(o, d, dt, now);
  }

  // Cajas y poderes
  if (state && boxMeshes.length) boxMeshes.forEach((m, i) => {
    m.visible = !!state.boxes[i] && !pendingBoxes.has(i);
    m.rotation.y = now / 600 + i; m.rotation.x = now / 900; m.position.y = 1.5 + Math.sin(now / 300 + i) * 0.25;
  });
  for (const m of hazardMeshes.values()) {
    const k = Math.min(1, dt * 15);
    m.position.x += (m.userData.tx - m.position.x) * k; m.position.z += (m.userData.tz - m.position.z) * k;
    m.position.y = m.userData.t === 'aceite' ? 0.08 : 1;
  }
  for (let i = booms.length - 1; i >= 0; i--) {
    const b = booms[i]; b.t += dt;
    b.m.scale.setScalar(1 + b.t * 18); b.m.material.opacity = Math.max(0, 0.8 - b.t * 1.6);
    if (b.t > 0.5) { scene.remove(b.m); booms.splice(i, 1); }
  }

  updateCamera(dt);
  updateHud(dt, now);
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

function updateCamera(dt) {
  let target = null;
  if (me && myVis) target = { x: me.x, z: me.z, h: me.h, boost: me.boostT > 0 };
  else if (state && (state.phase === 'race' || state.phase === 'countdown')) {
    const lead = [...others.values()].sort((a, b) => (a.data.rank || 99) - (b.data.rank || 99))[0];
    if (lead) target = { x: lead.x, z: lead.z, h: lead.h };
  }
  if (target) {
    const fx = Math.cos(target.h), fz = Math.sin(target.h);
    const back = target.boost ? 10.5 : 9;
    const want = new THREE.Vector3(target.x - fx * back, 4.6, target.z - fz * back);
    const look = new THREE.Vector3(target.x + fx * 5, 1.6, target.z + fz * 5);
    const k = Math.min(1, dt * 7);
    camPos.lerp(want, k); camLook.lerp(look, Math.min(1, dt * 10));
    camera.fov += ((target.boost ? 82 : 70) - camera.fov) * Math.min(1, dt * 4); camera.updateProjectionMatrix();
  } else if (curTrack) { // en boxes: vuelo lento sobre el circuito
    lobbyAngle += dt * 0.08;
    const bb = trackBounds(curTrack), cx = (bb.minX + bb.maxX) / 2, cz = (bb.minZ + bb.maxZ) / 2;
    camPos.set(cx + Math.cos(lobbyAngle) * 260, 150, cz + Math.sin(lobbyAngle) * 260); camLook.set(cx, 0, cz);
  }
  camera.position.copy(camPos); camera.lookAt(camLook);
}

// ---------- HUD ----------
let minimapMap = null;
const mm = $('minimap').getContext('2d');
const ITEM_ICONS = Object.values(S.ITEMS).map(i => i.icon);
function fmtTime(t) { if (t == null) return '–'; const m = Math.floor(t / 60), s = t - m * 60; return `${m}:${s.toFixed(1).padStart(4, '0')}`; }
function updateHud(dt, now) {
  if (!state) return;
  const racing = state.phase === 'race' || state.phase === 'countdown';
  $('hud').hidden = !racing;
  if (!racing) return;
  const mine = state.players.find(p => p.id === myId);
  const nRace = state.players.filter(p => p.inRace).length;
  if (me && mine) {
    const lap = Math.min(Math.max(me.lap, 1), state.laps);
    $('pos').innerHTML = `${mine.rank || '–'}<sup>º</sup><small>/${nRace} · Vuelta ${lap}/${state.laps}</small>`;
  } else $('pos').innerHTML = '<small>Mirando la carrera 👀</small>';
  const rt = state.phase === 'race' ? state.raceTime + (now - stateAt) / 1000 : 0;
  $('timer').textContent = state.phase === 'race' ? fmtTime(me && me.finished && mine ? mine.finishTime ?? rt : rt) : '';

  // Poder
  if (rolling > 0) {
    rolling -= dt;
    if (Math.floor(rolling * 12) !== Math.floor((rolling + dt) * 12)) rollIcon = ITEM_ICONS[Math.random() * ITEM_ICONS.length | 0];
    $('itemIcon').textContent = rollIcon; $('itemName').textContent = '…';
    $('itembox').classList.add('rolling');
  } else {
    $('itembox').classList.remove('rolling');
    $('itemIcon').textContent = myItem ? S.ITEMS[myItem].icon : '';
    $('itemName').textContent = myItem ? `${S.ITEMS[myItem].name} (${isTouch ? '🎁' : 'E'})` : '';
  }

  // Mensaje central
  let c = '';
  if (state.phase === 'countdown') c = state.timer > 3 ? `<small>${curTrack ? curTrack.name : ''}</small>` : String(Math.ceil(state.timer));
  else if (state.raceTime < 1.2) c = '¡YA!';
  else if (me && me.finished) c = `¡Llegas ${mine ? mine.rank : ''}º!<small>Esperando al resto…</small>`;
  else if (me && me.spinT > 0) c = '<small>💫 ¡Te han dado!</small>';
  else if (me && curTrack) {
    const p = curTrack.pts[me.idx];
    if (me.speed > 5 && Math.cos(me.h) * p.tx + Math.sin(me.h) * p.tz < -0.4) c = '<small>⚠️ ¡Dirección contraria!</small>';
    else if (me.lap === state.laps && me.cp === 1 && me.idx < curTrack.N * 0.06) c = '<small>🔔 ¡Última vuelta!</small>';
  }
  if ($('center').innerHTML !== c) $('center').innerHTML = c;

  // Minimapa
  if (curTrack) {
    if (!minimapMap) minimapMap = drawTrackShape(mm, curTrack, 340, 340, '#ffffffaa', 14);
    else { mm.clearRect(0, 0, 340, 340); drawTrackShape(mm, curTrack, 340, 340, '#ffffffaa', 14); }
    for (const p of state.players) {
      if (!p.inRace || p.x == null) continue;
      const o = p.id === myId && me ? me : others.get(p.id);
      if (!o) continue;
      const [x, y] = minimapMap(o.x, o.z);
      mm.beginPath(); mm.arc(x, y, p.id === myId ? 12 : 9, 0, Math.PI * 2);
      mm.fillStyle = CHAR[p.char]?.color || '#fff'; mm.fill();
      mm.lineWidth = p.id === myId ? 5 : 3; mm.strokeStyle = p.id === myId ? '#fff' : '#000'; mm.stroke();
    }
  }
}

function updateOverlays(prev) {
  if (!myId) return;
  const s = state;
  $('lobby').hidden = s.phase !== 'lobby';
  $('results').hidden = s.phase !== 'results';
  if (s.phase === 'lobby') {
    const host = s.hostId === myId;
    $('lobbyPlayers').innerHTML = s.players.map(p =>
      `<div class="pl"><img src="${photoURL(p.char)}" alt=""><span>${s.hostId === p.id ? '👑 ' : ''}${esc(p.name)}${p.id === myId ? ' (tú)' : ''}</span><small>${p.score} pts</small></div>`).join('');
    for (const [id, b] of trackBtns) { b.setAttribute('aria-checked', String(id === s.trackId)); b.disabled = !host; }
    $('startBtn').hidden = !host;
    $('waitHost').hidden = host;
  }
  if (s.phase === 'results' && s.results) {
    const mineR = s.results.find(r => r.id === myId);
    $('resTitle').textContent = s.results[0] ? `🏆 ¡${s.results[0].name} gana!` : 'Resultados';
    $('resBody').innerHTML = s.results.map(r =>
      `<tr class="${r.id === myId ? 'me' : ''}"><td>${r.pos}º</td><td><img src="${photoURL(r.char)}" alt="">${esc(r.name)}</td>` +
      `<td class="num">${r.time != null ? fmtTime(r.time) : 'DNF'}</td><td class="num">+${r.pts}</td><td class="num">${r.total}</td></tr>`).join('');
    $('resNext').textContent = `${mineR ? `Has quedado ${mineR.pos}º. ` : ''}Volviendo a boxes en ${Math.ceil(s.timer)} s…`;
  }
}
function esc(t) { return String(t).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])); }

// Para depurar desde la consola del navegador
window.kartsDebug = () => ({ me, state, myItem, rolling, track: curTrack, keys, useItem });

buildWorld(S.TRACKS[0]);
requestAnimationFrame(frame);
