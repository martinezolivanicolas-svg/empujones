// EMPUJONES — personajes. Cada uno se dibuja con código (sin imágenes).
// Para crear uno nuevo: añádelo aquí, dibújale un accesorio en drawCharacter
// y pon su id en la lista CHARACTERS de server.js.
const CHARACTERS = [
  { id: 'bruto',     name: 'Bruto',     color: '#ff5d5d' },
  { id: 'gotita',    name: 'Gotita',    color: '#4dabff' },
  { id: 'pinchos',   name: 'Pinchos',   color: '#5ee07a' },
  { id: 'chulo',     name: 'Chulo',     color: '#ffd23f' },
  { id: 'diablillo', name: 'Diablillo', color: '#c77dff' },
  { id: 'michi',     name: 'Michi',     color: '#ff8c42' },
  { id: 'robi',      name: 'Robi',      color: '#9aa7b8' },
  { id: 'reina',     name: 'Reina',     color: '#ff6fb5' },
];
const CHAR_BY_ID = Object.fromEntries(CHARACTERS.map(c => [c.id, c]));

function charColor(id) { return (CHAR_BY_ID[id] || CHARACTERS[0]).color; }

// Dibuja un personaje centrado en (x, y) con radio r.
// opts: { outline: color, outlineWidth, t: tiempo en ms para animaciones }
function drawCharacter(ctx, id, x, y, r, opts = {}) {
  const c = CHAR_BY_ID[id] || CHARACTERS[0];
  const s = r / 22, t = opts.t || 0;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';

  // --- Detrás del cuerpo ---
  if (id === 'pinchos') {
    ctx.fillStyle = '#2f9e4a';
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + t / 2000;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a - 0.25) * 19, Math.sin(a - 0.25) * 19);
      ctx.lineTo(Math.cos(a) * 31, Math.sin(a) * 31);
      ctx.lineTo(Math.cos(a + 0.25) * 19, Math.sin(a + 0.25) * 19);
      ctx.fill();
    }
  }
  if (id === 'michi') {
    ctx.fillStyle = c.color;
    for (const sx of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(sx * 6, -18); ctx.lineTo(sx * 17, -31); ctx.lineTo(sx * 20, -10); ctx.fill();
    }
    ctx.fillStyle = '#ffd2b0';
    for (const sx of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(sx * 9, -18); ctx.lineTo(sx * 16, -26); ctx.lineTo(sx * 17, -14); ctx.fill();
    }
  }
  if (id === 'diablillo') {
    ctx.fillStyle = '#ff3d6e';
    for (const sx of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(sx * 6, -19); ctx.quadraticCurveTo(sx * 12, -36, sx * 20, -34);
      ctx.quadraticCurveTo(sx * 15, -26, sx * 16, -14); ctx.fill();
    }
  }
  if (id === 'robi') {
    ctx.strokeStyle = '#5b6575'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(0, -32); ctx.stroke();
    ctx.fillStyle = Math.sin(t / 200) > 0 ? '#ff5d5d' : '#ffd23f';
    ctx.beginPath(); ctx.arc(0, -33, 4, 0, Math.PI * 2); ctx.fill();
  }

  // --- Cuerpo ---
  ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.fillStyle = c.color; ctx.fill();
  // brillo
  ctx.beginPath(); ctx.arc(-8, -9, 6, 0, Math.PI * 2); ctx.fillStyle = '#ffffff40'; ctx.fill();
  if (opts.outline) { ctx.lineWidth = (opts.outlineWidth || 3) / s; ctx.strokeStyle = opts.outline; ctx.stroke(); }

  // --- Cara ---
  const dot = (px, py, rr, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(px, py, rr, 0, Math.PI * 2); ctx.fill(); };
  ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2.5;

  if (id === 'bruto') {
    dot(-7, -2, 3.5, '#1a1a1a'); dot(7, -2, 3.5, '#1a1a1a');
    ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.moveTo(-13, -11); ctx.lineTo(-3, -6); ctx.moveTo(13, -11); ctx.lineTo(3, -6); ctx.stroke();
    ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-6, 10); ctx.lineTo(6, 10); ctx.stroke();
  } else if (id === 'gotita') {
    dot(-7, -3, 6.5, '#fff'); dot(7, -3, 6.5, '#fff');
    dot(-6, -2, 4, '#1a1a1a'); dot(8, -2, 4, '#1a1a1a');
    dot(-4.5, -4, 1.5, '#fff'); dot(9.5, -4, 1.5, '#fff');
    ctx.beginPath(); ctx.arc(1, 8, 4, 0.2, Math.PI - 0.2); ctx.stroke();
  } else if (id === 'pinchos') {
    dot(-7, -3, 3.5, '#1a1a1a'); dot(7, -3, 3.5, '#1a1a1a');
    ctx.beginPath(); ctx.moveTo(-8, 8); ctx.lineTo(-4, 11); ctx.lineTo(0, 8); ctx.lineTo(4, 11); ctx.lineTo(8, 8); ctx.stroke();
  } else if (id === 'chulo') {
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.roundRect(-16, -8, 13, 9, 3); ctx.roundRect(3, -8, 13, 9, 3); ctx.fill();
    ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-3, -5); ctx.lineTo(3, -5); ctx.stroke();
    ctx.fillStyle = '#ffffff70'; ctx.fillRect(-14, -7, 4, 2); ctx.fillRect(5, -7, 4, 2);
    ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(2, 6, 7, 0.3, Math.PI - 0.9); ctx.stroke();
  } else if (id === 'diablillo') {
    dot(-7, -3, 3.5, '#1a1a1a'); dot(7, -3, 3.5, '#1a1a1a');
    ctx.beginPath(); ctx.arc(0, 4, 9, 0.25, Math.PI - 0.25); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-5, 11.5); ctx.lineTo(-3, 15); ctx.lineTo(-1, 12); ctx.fill();
  } else if (id === 'michi') {
    dot(-7, -3, 3.5, '#1a1a1a'); dot(7, -3, 3.5, '#1a1a1a');
    dot(0, 4, 2.2, '#ff6f91');
    ctx.lineWidth = 1.6; ctx.beginPath();
    ctx.moveTo(-0, 6); ctx.quadraticCurveTo(-3, 10, -6, 7); ctx.moveTo(0, 6); ctx.quadraticCurveTo(3, 10, 6, 7);
    ctx.moveTo(-9, 4); ctx.lineTo(-20, 2); ctx.moveTo(-9, 7); ctx.lineTo(-20, 8);
    ctx.moveTo(9, 4); ctx.lineTo(20, 2); ctx.moveTo(9, 7); ctx.lineTo(20, 8);
    ctx.stroke();
  } else if (id === 'robi') {
    ctx.fillStyle = '#1f2633'; ctx.beginPath(); ctx.roundRect(-15, -10, 30, 13, 5); ctx.fill();
    dot(-7, -3.5, 3, '#2ee6d6'); dot(7, -3.5, 3, '#2ee6d6');
    ctx.strokeStyle = '#3d4655'; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = -6; i <= 6; i += 4) { ctx.moveTo(i, 9); ctx.lineTo(i, 13); }
    ctx.stroke();
  } else if (id === 'reina') {
    dot(-7, -2, 3.5, '#1a1a1a'); dot(7, -2, 3.5, '#1a1a1a');
    ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-11, -6); ctx.lineTo(-9, -8); ctx.moveTo(11, -6); ctx.lineTo(9, -8); ctx.stroke();
    dot(-12, 5, 3, '#ff9ccf'); dot(12, 5, 3, '#ff9ccf');
    ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, 6, 4, 0.2, Math.PI - 0.2); ctx.stroke();
  }

  // --- Delante del cuerpo ---
  if (id === 'reina') {
    ctx.fillStyle = '#ffd23f'; ctx.strokeStyle = '#b8900c'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-12, -16); ctx.lineTo(-13, -30); ctx.lineTo(-6, -23); ctx.lineTo(0, -33);
    ctx.lineTo(6, -23); ctx.lineTo(13, -30); ctx.lineTo(12, -16); ctx.closePath();
    ctx.fill(); ctx.stroke();
    dot(0, -21, 2.2, '#ff5d5d');
  }
  ctx.restore();
}
