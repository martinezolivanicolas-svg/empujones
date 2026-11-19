// PATATA CALIENTE — cliente
(() => {
  const $ = id => document.getElementById(id);
  const AVATARS = ['🥔', '🍅', '🧅', '🥕', '🌶️', '🍆', '🥑', '🧄', '🍄', '🌽', '🥦', '🍋', '🍉', '🥥', '🍑', '🫑'];
  const store = {
    get(k, d) { try { const v = localStorage.getItem('patata.' + k); return v === null ? d : v; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('patata.' + k, v); } catch { } },
  };

  const socket = io('/patata', { autoConnect: true });
  let myId = null, S = null, avatar = store.get('avatar', AVATARS[Math.random() * AVATARS.length | 0]);
  let qStart = performance.now(), muted = store.get('muted', '0') === '1';
  const seats = new Map();       // id -> elemento
  const bubbleTimers = new Map();

  // ——— Entrada ———
  $('name').value = store.get('name', '');
  const params = new URLSearchParams(location.search);
  const urlCode = (params.get('sala') || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
  if (urlCode) $('code').value = urlCode;

  function drawAvatars() {
    $('avatars').innerHTML = '';
    for (const a of AVATARS) {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = a; b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', a === avatar); b.setAttribute('aria-label', 'Avatar ' + a);
      b.onclick = () => { avatar = a; store.set('avatar', a); drawAvatars(); };
      $('avatars').appendChild(b);
    }
  }
  drawAvatars();

  function join(code) {
    const name = $('name').value.trim();
    if (!name) { $('err').textContent = 'Ponte un nombre primero.'; $('name').focus(); return; }
    store.set('name', name);
    unlockAudio();
    $('err').textContent = '';
    socket.emit('join', { name, avatar, code });
  }
  $('createBtn').onclick = () => join('');
  $('joinBtn').onclick = () => {
    const c = $('code').value.toUpperCase().replace(/[^A-Z]/g, '');
    if (c.length !== 4) { $('err').textContent = 'El código tiene 4 letras.'; $('code').focus(); return; }
    join(c);
  };
  $('code').addEventListener('keydown', e => { if (e.key === 'Enter') $('joinBtn').click(); });
  $('name').addEventListener('keydown', e => { if (e.key === 'Enter') (urlCode ? $('joinBtn') : $('createBtn')).click(); });
  if (urlCode && $('name').value) $('joinBtn').focus(); else $('name').focus();

  socket.on('joined', ({ id, code }) => {
    myId = id;
    history.replaceState(null, '', '/patata/?sala=' + code);
  });
  socket.on('full', () => { $('err').textContent = 'Esa sala está llena (máximo 12).'; });
  socket.on('disconnect', () => { if (myId) { note('Se ha perdido la conexión. Recarga la página.', 999); } });

  // ——— Sala ———
  $('copyBtn').onclick = async () => {
    const url = location.origin + '/patata/?sala=' + S.code;
    try { await navigator.clipboard.writeText(url); $('copyBtn').textContent = '✅ ¡Copiado!'; }
    catch { prompt('Copia este enlace:', url); }
    setTimeout(() => { $('copyBtn').textContent = '📋 Copiar enlace para tus amigos'; }, 1800);
  };
  $('botMinus').onclick = () => socket.emit('setBots', S.bots - 1);
  $('botPlus').onclick = () => socket.emit('setBots', S.bots + 1);
  $('startBtn').onclick = () => { unlockAudio(); socket.emit('start'); };

  function show(id) {
    for (const s of document.querySelectorAll('.screen')) s.classList.toggle('on', s.id === id);
  }

  function renderLobby() {
    $('lobbyCode').textContent = S.code;
    const ul = $('plist'); ul.innerHTML = '';
    for (const p of S.players) {
      const li = document.createElement('li');
      li.innerHTML = `<span class="av"></span><span></span>`;
      li.firstChild.textContent = p.avatar;
      li.lastChild.textContent = p.name + (p.id === myId ? ' (tú)' : '');
      if (p.id === S.hostId) { const h = document.createElement('span'); h.className = 'host'; h.textContent = '👑'; li.lastChild.prepend(h, ' '); }
      ul.appendChild(li);
    }
    const host = S.hostId === myId;
    $('hostbox').hidden = !host;
    $('waitHost').hidden = host;
    $('botCount').textContent = S.bots;
    $('botMinus').disabled = S.bots <= 0;
    $('botPlus').disabled = S.bots >= 8 || S.players.length >= 12;
    $('startBtn').disabled = S.players.length < 2;
    $('needMore').hidden = S.players.length >= 2;
  }

  // ——— Partida ———
  const me = () => S && S.players.find(p => p.id === myId);
  const byId = id => S && S.players.find(p => p.id === id);

  function layoutSeats() {
    if (!S) return;
    const stage = $('stage');
    const w = stage.clientWidth, h = stage.clientHeight;
    const ids = S.order.filter(id => byId(id));
    const n = ids.length;
    const myIdx = Math.max(0, ids.indexOf(myId));
    const rx = Math.max(60, Math.min(w / 2 - 58, 340)), ry = Math.max(50, h / 2 - 62);
    ids.forEach((id, i) => {
      const el = seats.get(id); if (!el) return;
      const a = Math.PI / 2 + ((i - myIdx) / n) * Math.PI * 2;
      const x = w / 2 + Math.cos(a) * rx, y = h / 2 + 6 + Math.sin(a) * ry;
      el.style.left = x + 'px'; el.style.top = y + 'px';
      el.dataset.x = x; el.dataset.y = y;
    });
    pointArrow();
  }

  let arrowAngle = 0;
  function pointArrow() {
    const el = S && seats.get(S.turnId);
    const stage = $('stage');
    if (!el) { $('arrow').style.opacity = 0; return; }
    $('arrow').style.opacity = 1;
    const dx = el.dataset.x - stage.clientWidth / 2, dy = el.dataset.y - stage.clientHeight / 2;
    let target = Math.atan2(dy, dx) * 180 / Math.PI;
    // gira por el camino corto
    while (target - arrowAngle > 180) target -= 360;
    while (target - arrowAngle < -180) target += 360;
    arrowAngle = target;
    $('arrow').style.transform = `rotate(${arrowAngle}deg)`;
  }

  function renderSeats() {
    const stage = $('stage');
    const ids = new Set(S.order.filter(id => byId(id)));
    for (const [id, el] of seats) if (!ids.has(id)) { el.remove(); seats.delete(id); }
    for (const id of ids) {
      const p = byId(id);
      let el = seats.get(id);
      if (!el) {
        el = document.createElement('div');
        el.className = 'seat';
        el.innerHTML = '<div class="bub"></div><div class="face"></div><div class="nm"></div><div class="hearts"></div><div class="bonus"><i></i></div>';
        stage.appendChild(el); seats.set(id, el);
      }
      el.querySelector('.face').textContent = p.avatar;
      el.querySelector('.nm').textContent = p.id === myId ? 'Tú' : p.name;
      el.querySelector('.hearts').textContent = p.alive ? '❤️'.repeat(p.hearts) : '💀';
      el.querySelector('.hearts').setAttribute('aria-label', p.hearts + ' vidas');
      el.querySelector('.bonus i').style.width = Math.min(100, p.bonus / S.bonusGoal * 100) + '%';
      el.classList.toggle('turn', S.turnId === id && S.phase === 'play');
      el.classList.toggle('dead', !p.alive);
    }
    layoutSeats();
  }

  function renderGame() {
    $('gameCode').textContent = 'Sala ' + S.code;
    $('roundChip').textContent = 'Pregunta ' + S.round;
    $('question').textContent = S.question || '…';
    const used = $('used'); used.innerHTML = '';
    for (const u of S.used.slice().reverse()) {
      const s = document.createElement('span'); s.className = 'r' + u.rare; s.textContent = u.name; used.appendChild(s);
    }
    renderSeats();
    const mine = S.phase === 'play' && S.turnId === myId;
    const p = me();
    const entry = $('entry');
    entry.classList.toggle('mine', mine);
    $('ans').disabled = !mine; $('sendBtn').disabled = !mine;
    if (mine) {
      $('who').textContent = '🔥 ¡Te toca! Escribe y pulsa Enter';
      if (document.activeElement !== $('ans')) $('ans').focus();
    } else {
      if (wasMine) $('ans').value = '';
      const t = byId(S.turnId);
      $('who').textContent = !p || !p.inGame ? '👀 Estás mirando: entras en la siguiente partida'
        : !p.alive ? '💀 Te has quedado sin vidas. A mirar.'
        : S.phase === 'play' && t ? `Le toca a ${t.name}…` : '';
      if (document.activeElement === $('ans')) $('ans').blur();
    }
    wasMine = mine;
    const win = $('winner');
    if (S.phase === 'end') {
      const w = byId(S.winnerId);
      $('winFace').textContent = w ? w.avatar : '💥';
      $('winTitle').textContent = w ? (w.id === myId ? '¡Has ganado!' : `¡Gana ${w.name}!`) : '¡Nadie sobrevive!';
      if (!win.classList.contains('on')) sfx(w && w.id === myId ? 'win' : 'ok');
      win.classList.add('on');
    } else win.classList.remove('on');
  }
  let wasMine = false;

  socket.on('state', st => {
    const prevPhase = S && S.phase;
    S = st;
    if (S.phase === 'lobby') { show('lobby'); renderLobby(); }
    else {
      show('game'); renderGame();
      if (prevPhase === 'lobby' || !prevPhase) { qStart = performance.now(); requestAnimationFrame(layoutSeats); }
    }
  });

  socket.on('question', ({ text }) => {
    qStart = performance.now();
    for (const el of seats.values()) bubble(el, '', '');
    note('Nueva pregunta: ' + text, 2.2);
  });

  function bubble(el, text, cls, ms) {
    const b = el.querySelector('.bub');
    b.textContent = text; b.className = 'bub' + (text ? ' on' : '') + (cls ? ' ' + cls : '');
    clearTimeout(bubbleTimers.get(el));
    if (ms) bubbleTimers.set(el, setTimeout(() => { b.className = 'bub'; }, ms));
  }

  socket.on('typing', ({ id, text }) => {
    const el = seats.get(id); if (el) bubble(el, text, '');
  });

  socket.on('said', d => {
    const el = seats.get(d.id), p = byId(d.id);
    if (d.ok) {
      if (el) bubble(el, d.name, 'ok', 1600);
      if (d.id === myId) $('ans').value = '';
      sfx(d.rare === 3 ? 'rare' : 'ok');
      if (d.gotHeart) { note(`❤️ ¡Vida extra para ${d.id === myId ? 'ti' : p.name}!`, 2.4); sfx('heart'); }
      else if (d.rare === 3) note(`✨ ¡Respuesta rara! +${d.pts}`, 1.6);
    } else {
      if (el) bubble(el, d.text, 'bad', 1200);
      if (d.id === myId) {
        sfx('bad');
        const a = $('ans'); a.classList.remove('shake'); void a.offsetWidth; a.classList.add('shake'); a.select();
        note(d.reason === 'usada' ? `«${d.name}» ya está dicha` : `«${d.text}» no vale aquí`, 1.6);
      }
    }
  });

  socket.on('boom', ({ id, out, hints }) => {
    const p = byId(id);
    sfx('boom');
    const fx = document.createElement('div'); fx.className = 'boomfx'; fx.innerHTML = '<b>¡BOOM!</b>';
    document.body.appendChild(fx); setTimeout(() => fx.remove(), 950);
    if (navigator.vibrate && id === myId) navigator.vibrate([80, 40, 160]);
    const who = id === myId ? 'Te explota a ti' : `Le explota a ${p ? p.name : '…'}`;
    note(`💥 ${who}${out ? ' y queda fuera' : ''}` + (hints.length ? ` · Valía: ${hints.join(', ')}` : ''), 3.2);
  });

  let noteT = null;
  function note(text, secs) {
    const n = $('note'); n.textContent = text; n.classList.add('on');
    clearTimeout(noteT); noteT = setTimeout(() => n.classList.remove('on'), secs * 1000);
  }

  // Escribir
  let lastTyping = 0, typingTimer = null;
  $('ans').addEventListener('input', () => {
    const send = () => { lastTyping = performance.now(); socket.emit('typing', $('ans').value); };
    clearTimeout(typingTimer);
    if (performance.now() - lastTyping > 80) send(); else typingTimer = setTimeout(send, 80);
  });
  $('form').addEventListener('submit', e => {
    e.preventDefault();
    const v = $('ans').value.trim();
    if (v) socket.emit('answer', v);
  });

  addEventListener('resize', layoutSeats);

  // La patata tiembla más cuanto más tiempo lleva la pregunta (pero nadie sabe cuándo explota)
  let lastTick = 0;
  function frame(now) {
    if (S && S.phase === 'play') {
      const t = (now - qStart) / 1000;
      const amp = Math.min(1, t / 26);
      const j = 1 + amp * 6;
      $('spudBody').style.transform = `translate(${(Math.random() - .5) * j}px, ${(Math.random() - .5) * j}px) rotate(${(Math.random() - .5) * j * 2}deg) scale(${1 + amp * 0.12})`;
      $('spudBody').style.filter = `saturate(${1 + amp}) hue-rotate(${-amp * 25}deg)`;
      if (now - lastTick > 520 - amp * 260) { lastTick = now; sfx('tick'); }
    } else {
      $('spudBody').style.transform = ''; $('spudBody').style.filter = '';
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // ——— Sonido ———
  let ac = null;
  function unlockAudio() {
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch { } }
    if (ac && ac.state === 'suspended') ac.resume();
  }
  document.addEventListener('pointerdown', unlockAudio, { once: true });
  $('muteBtn').textContent = muted ? '🔇' : '🔊';
  $('muteBtn').onclick = () => { muted = !muted; store.set('muted', muted ? '1' : '0'); $('muteBtn').textContent = muted ? '🔇' : '🔊'; };

  function tone(freq, dur, type = 'sine', vol = 0.15, when = 0, slide) {
    const t0 = ac.currentTime + when;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t0 + dur);
    g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g).connect(ac.destination); o.start(t0); o.stop(t0 + dur + 0.02);
  }
  function noise(dur, vol) {
    const len = ac.sampleRate * dur, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2);
    const s = ac.createBufferSource(), g = ac.createGain(), f = ac.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 900;
    s.buffer = buf; g.gain.value = vol; s.connect(f).connect(g).connect(ac.destination); s.start();
  }
  function sfx(kind) {
    if (muted || !ac || ac.state !== 'running') return;
    switch (kind) {
      case 'tick': tone(1400, 0.03, 'square', 0.03); break;
      case 'ok': tone(660, 0.09, 'triangle', 0.16); tone(990, 0.12, 'triangle', 0.14, 0.07); break;
      case 'rare': [660, 880, 1320, 1760].forEach((f, i) => tone(f, 0.12, 'triangle', 0.13, i * 0.06)); break;
      case 'heart': [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.16, 'sine', 0.16, i * 0.08)); break;
      case 'bad': tone(180, 0.18, 'sawtooth', 0.09, 0, 120); break;
      case 'boom': noise(0.9, 0.9); tone(120, 0.5, 'sine', 0.5, 0, 40); break;
      case 'win': [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, 0.2, 'triangle', 0.15, i * 0.11)); break;
    }
  }
})();
