/* ============ NorthPoint · ONE BULLET — session guardian (candado de disciplina) ============
   "One bullet, one shot. Bank the win and give nothing back."
   1 bala/sesión · stop 1% · tras pérdida cierra en frío · cero revancha.
   Voz JARVIS (es-MX). Estado por día en sessionStorage. Al sellar → alimenta el Journal (db.trades + db.journal).
   NO da señales de compra/venta: rastrea la disciplina y narra contexto. ============ */
window.Views = window.Views || {};

window.GuardianCtrl = (() => {
  const KEY = () => 'np_ob_' + (UI.todayISO ? UI.todayISO() : new Date().toISOString().slice(0, 10));
  const RULES = [
    'One bullet. One planned A+ trade this session.',
    'If it loses — close and come back cold. Nothing to recover.',
    'Max risk today is the 1% — the daily stop.',
    'Zero revenge. Discipline is the edge.',
  ];
  const PLEDGE = 'I commit to this structure above any impulse. One bullet a session. If I win, I stop. If I lose, I close and come back cold. My discipline is my financial freedom.';
  const ST = {
    BRIEFING: { idx: 'State 00 · the briefing', word: 'Ready.', sub: 'Set your one plan, sign, and load the chamber.' },
    LOADED: { idx: 'State 01 · the chamber', word: 'Loaded.', sub: 'Chamber armed. Wait for your A+. Do not force it.' },
    FIRED: { idx: 'State 02 · in the air', word: 'In the air.', sub: 'The bullet is out. Execute the plan. Do not touch the stop.' },
    WON: { idx: 'State 03 · the edition', word: 'You won.', sub: 'One bullet, one shot. Bank it and give nothing back.' },
    LOCKED: { idx: 'State 04 · empty', word: 'Locked.', sub: 'No bullets left. Close the platform. Come back cold tomorrow.' },
  };
  const VOICE = {
    load: 'Cámara cargada, señor. Una sola bala. Cero revancha. Espera tu setup A+.',
    fire: 'Bala en el aire, señor. Sin red. Respeta tu plan y no toques el stop.',
    win: 'Excelente ejecución, señor. Trade de {min} minutos, cerrado en verde. Una bala, un tiro. Banca la ganancia y no regreses nada. Terminaste por hoy.',
    lock: 'Señor. Perdiste tu única bala. Te recomiendo cerrar la plataforma de inmediato. Regresa mañana, en frío. Hoy no es tu día.',
    revWon: 'Alto, señor. Ya ganaste tu bala. No regreses la ganancia. Terminaste por hoy.',
    revLock: 'Alto, señor. Esto es revancha. No te quedan balas. Cierra la plataforma.',
    logged: 'Resultado registrado, señor: {dir} {usd} dólares, {pct} por ciento de la cuenta. Está en tu bitácora.',
    briefing: 'Bienvenido a tu sesión, señor. Una bala hoy. Escribe tu único plan, firma, y carga la cámara cuando estés listo.',
  };

  function empty() {
    const acc = (typeof App !== 'undefined' && App.db && App.db.accounts && App.db.accounts[0]) ? App.db.accounts[0].size : 10000;
    return {
      date: UI.todayISO ? UI.todayISO() : new Date().toISOString().slice(0, 10),
      state: 'BRIEFING', account: acc, stopPct: 1, plan: '', pledged: false,
      setup: 'orb', emotion: 'disciplina', side: 'long', firedAt: null, durMin: 0,
      pnl: null, revenges: 0, note: '', log: [], sealed: false, muted: false,
    };
  }
  function load() {
    try { const s = sessionStorage.getItem(KEY()); if (s) return JSON.parse(s); } catch (e) {}
    return empty();
  }
  let S = load();
  function persist() { try { sessionStorage.setItem(KEY(), JSON.stringify(S)); } catch (e) {} }
  function rerender() { persist(); if (typeof App !== 'undefined') App.render(); }

  // ---- voz JARVIS (es-MX) ----
  let _voices = [];
  if (window.speechSynthesis) {
    const grab = () => { _voices = window.speechSynthesis.getVoices(); };
    window.speechSynthesis.onvoiceschanged = grab; grab();
  }
  function say(text, delay) {
    if (!window.speechSynthesis || !text) return;
    setTimeout(() => {
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'es-MX'; u.rate = 0.87; u.pitch = 0.76;
        const v = _voices.find(v => v.lang === 'es-MX') || _voices.find(v => v.lang && v.lang.startsWith('es'));
        if (v) u.voice = v;
        window.speechSynthesis.speak(u);
      } catch (e) {}
    }, delay || 0);
  }
  // ---- sirena (WebAudio) ----
  let _ac = null;
  function beep(freq, dur) {
    try {
      _ac = _ac || new (window.AudioContext || window.webkitAudioContext)();
      const o = _ac.createOscillator(), g = _ac.createGain();
      o.type = 'sawtooth'; o.frequency.value = freq || 440;
      g.gain.value = 0.0001; o.connect(g); g.connect(_ac.destination);
      const t = _ac.currentTime; o.start(t);
      g.gain.exponentialRampToValueAtTime(0.18, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.5));
      o.stop(t + (dur || 0.5));
    } catch (e) {}
  }
  function sirena() { beep(660, 0.35); setTimeout(() => beep(440, 0.5), 380); }

  // ---- helpers ----
  const dailyStop = () => Math.round((S.account || 10000) * (S.stopPct || 1) / 100);
  const bulletUsd = () => dailyStop();
  function pushLog(m) {
    const now = new Date();
    const t = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    S.log.unshift({ t, m }); S.log = S.log.slice(0, 6);
  }
  const pick = g => { const el = document.querySelector('.pick[data-g="' + g + '"] .chip.on'); return el ? el.dataset.v : null; };
  function capture() {
    const plan = document.getElementById('gb-plan'); if (plan) S.plan = plan.value.trim();
    const note = document.getElementById('gb-note'); if (note) S.note = note.value.trim();
    const su = pick('gsetup'); if (su) S.setup = su;
    const em = pick('gemotion'); if (em) S.emotion = em;
    const sd = pick('gside'); if (sd) S.side = sd;
  }

  // ---- alarm loop (only while LOCKED and not muted) ----
  let _alarm = null, _clock = null, _override = { down: 0, timer: null };
  function startAlarm() {
    stopAlarm();
    if (S.state !== 'LOCKED' || S.muted) return;
    const fire = () => { if (S.state === 'LOCKED' && !S.muted) { sirena(); say(VOICE.lock); } };
    _alarm = setInterval(fire, 13000);
  }
  function stopAlarm() { if (_alarm) { clearInterval(_alarm); _alarm = null; } }
  function startClock() {
    if (_clock) clearInterval(_clock);
    const tick = () => { const el = document.getElementById('gb-clock'); if (el) { const d = new Date(); el.textContent = [d.getHours(), d.getMinutes(), d.getSeconds()].map(n => String(n).padStart(2, '0')).join(':'); } };
    tick(); _clock = setInterval(tick, 1000);
  }
  function bindOverride() {
    const b = document.getElementById('gb-override'); if (!b) return;
    const start = () => { _override.down = Date.now(); b.classList.add('holding'); _override.timer = setTimeout(() => { b.classList.remove('holding'); reset(); }, 4000); };
    const end = () => { if (_override.timer) { clearTimeout(_override.timer); _override.timer = null; } b.classList.remove('holding'); if (Date.now() - _override.down < 4000) UI.toast('Hold 4s to override the lock'); };
    b.addEventListener('pointerdown', start); b.addEventListener('pointerup', end); b.addEventListener('pointerleave', end);
  }

  // ---- transitions ----
  function arm() {
    capture();
    if (!S.plan) return UI.toast('Write the one setup you are waiting for');
    if (!S.pledged) return UI.toast('Sign the pledge to load the chamber');
    S.account = (App.db.accounts && App.db.accounts[0]) ? App.db.accounts[0].size : S.account;
    S.state = 'LOADED'; pushLog('Chamber loaded · 1 bullet'); say(VOICE.load); beep(520, 0.25); rerender();
  }
  function fire() {
    if (S.state !== 'LOADED') return revenge();
    S.state = 'FIRED'; S.firedAt = Date.now(); pushLog('Bullet fired · trade open'); say(VOICE.fire); beep(700, 0.2); rerender();
  }
  function win() {
    if (S.state !== 'FIRED') return revenge();
    S.durMin = S.firedAt ? Math.max(1, Math.round((Date.now() - S.firedAt) / 60000)) : 1;
    S.state = 'WON'; pushLog('Won · ' + S.durMin + 'm · green session'); say(VOICE.win.replace('{min}', S.durMin)); beep(880, 0.5); rerender();
  }
  function lose() {
    if (S.state !== 'FIRED') return revenge();
    S.durMin = S.firedAt ? Math.max(1, Math.round((Date.now() - S.firedAt) / 60000)) : 1;
    S.state = 'LOCKED'; S.muted = false; pushLog('Lost · ' + S.durMin + 'm · locked for the day');
    sirena(); say(VOICE.lock, 300); rerender(); startAlarm();
  }
  function revenge() {
    S.revenges++; sirena(); pushLog('Revenge attempt · blocked');
    say(S.state === 'WON' ? VOICE.revWon : VOICE.revLock); rerender();
  }
  function setPnl(v) {
    const n = parseFloat(String(v == null ? '' : v).replace(/[,\s$]/g, ''));
    S.pnl = isNaN(n) ? null : n; persist();
    if (S.pnl != null) {
      const ds = dailyStop(); const pct = ds ? Math.abs(S.pnl / S.account * 100).toFixed(1) : '0';
      say(VOICE.logged.replace('{dir}', S.pnl >= 0 ? 'más' : 'menos').replace('{usd}', Math.abs(Math.round(S.pnl))).replace('{pct}', pct));
    }
  }
  function mute() { S.muted = true; stopAlarm(); persist(); UI.toast('Muted · still locked'); }
  function seal() {
    capture();
    if (S.sealed) return UI.toast('Already sealed');
    if (S.pnl == null) return UI.toast('Enter your result first');
    const db = App.db;
    const hhmm = ms => { const d = new Date(ms || Date.now()); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
    const result = S.pnl > 0 ? 'win' : (S.pnl < 0 ? 'loss' : 'be');
    db.trades.push({
      id: Store.uid(), date: S.date, time: hhmm(S.firedAt),
      accountId: (db.accounts && db.accounts[0]) ? db.accounts[0].id : '',
      instrument: 'MNQ', side: S.side || 'long', result, pnl: Math.round(S.pnl),
      contracts: 0, entry: 0, exit: 0, setup: S.setup || 'orb', emotion: S.emotion || 'disciplina',
      notes: S.note || '', duration: S.firedAt ? Math.max(60, Math.round((Date.now() - S.firedAt) / 1000)) : 0,
      source: 'onebullet', revenges: S.revenges, outcome: S.state,
    });
    const pct = Math.abs(S.pnl / S.account * 100).toFixed(1);
    const dir = S.pnl >= 0 ? '+$' : '−$';
    db.journal = db.journal || [];
    db.journal.push({
      id: Store.uid(), date: S.date, tag: S.state === 'WON' ? 'win' : 'leccion',
      text: 'ONE BULLET · ' + (S.state === 'WON' ? 'Won my single bullet' : 'Lost the bullet — closed cold')
        + '. ' + dir + Math.abs(Math.round(S.pnl)) + ' (' + pct + '% of account) · ' + S.durMin + 'm · '
        + Data.setupOf(S.setup).label + '. Revenge blocked: ' + S.revenges + '.' + (S.note ? ' Note: ' + S.note : ''),
    });
    S.sealed = true; stopAlarm(); App.save(); persist(); UI.toast('Session sealed · logged to Trades, Calendar, Coach'); App.render();
  }
  function reset() { stopAlarm(); try { sessionStorage.removeItem(KEY()); } catch (e) {} S = empty(); persist(); App.render(); }
  function pledge() { capture(); S.pledged = !S.pledged; rerender(); }
  function voice() { const s = S.state; say(s === 'BRIEFING' ? VOICE.briefing : (s === 'LOADED' ? VOICE.load : s === 'FIRED' ? VOICE.fire : s === 'WON' ? VOICE.win.replace('{min}', S.durMin) : VOICE.lock)); }

  function hydrate() {
    S = load();
    startClock();
    if (S.state === 'LOCKED' && !S.muted) startAlarm(); else stopAlarm();
    bindOverride();
  }

  return {
    hydrate, arm, fire, win, lose, revenge, mute, seal, reset, pledge, voice, setPnl,
    get S() { return S; }, dailyStop, bulletUsd, RULES, PLEDGE, ST,
  };
})();

(() => {
  const V = window.Views;
  const G = () => window.GuardianCtrl;

  V.guardian = function () {
    const S = G().S, st = G().ST[S.state], ds = G().dailyStop();
    const chamber = chamberSVG(S.state);
    const rulesCard = `<div class="card ob-rules">
      <div class="ch-t mb8">${UI.icon('shield', '', 16)} The four rules</div>
      <div class="setlist">${G().RULES.map(r => `<div class="setrow2 ob-rule">${UI.icon('checkc', '', 16)} <span>${r}</span></div>`).join('')}</div>
    </div>`;

    // BRIEFING controls
    const briefing = S.state === 'BRIEFING' ? `<div class="card">
      <div class="ch-t mb8">${UI.icon('target', '', 16)} Today's one plan</div>
      <textarea class="input" id="gb-plan" rows="2" placeholder="The only A+ setup I'm waiting for today…">${UI.esc(S.plan)}</textarea>
      <label class="ob-pledge ${S.pledged ? 'on' : ''}"><input type="checkbox" ${S.pledged ? 'checked' : ''} data-act="guardianPledge"> <span>${UI.esc(G().PLEDGE)}</span></label>
      <button class="btn btn-primary full mt8" data-act="guardianArm">${UI.icon('lock', '', 16)} Load the chamber (1 bullet)</button>
    </div>` : '';

    // action row by state
    let actions = '';
    if (S.state === 'LOADED') actions = `<button class="btn btn-primary lg" data-act="guardianFire">${UI.icon('bolt', '', 18)} I took my bullet</button>`;
    else if (S.state === 'FIRED') actions = `<div class="btn-row"><button class="btn btn-up" data-act="guardianWin">${UI.icon('check', '', 16)} Won</button><button class="btn btn-danger" data-act="guardianLose">${UI.icon('x', '', 16)} Lost</button></div>`;
    else if (S.state === 'WON') actions = `<button class="btn btn-ghost" data-act="guardianFire">${UI.icon('bolt', '', 15)} Take another? (blocked)</button>`;
    else if (S.state === 'LOCKED') actions = `<div class="btn-row"><button class="btn btn-ghost" data-act="guardianMute">${UI.icon('x', '', 15)} Mute</button><button class="btn btn-danger" id="gb-override">${UI.icon('lock', '', 15)} Hold 4s to override</button></div>`;

    const stopUsed = (S.pnl != null && S.pnl < 0) ? Math.min(100, Math.abs(S.pnl) / ds * 100) : 0;
    const danger = (S.pnl != null && S.pnl <= -ds);
    const kpis = `<div class="ob-kpis ${danger ? 'danger' : ''}">
      <div class="kpi"><span>Bullet · the 1%</span><b>$${ds.toLocaleString('en-US')}</b></div>
      <div class="kpi"><span>Result</span><b>${S.pnl == null ? '—' : UI.pnl(Math.round(S.pnl))}</b></div>
      <div class="kpi"><span>Stop used</span>${UI.bar(stopUsed, 100, danger ? 'var(--down)' : 'var(--brand)')}</div>
    </div>`;

    const revBanner = (S.revenges > 0 && (S.state === 'WON' || S.state === 'LOCKED')) ? `<div class="ob-revenge">${UI.icon('x', '', 16)} Revenge attempt blocked — you have no bullets left. Close the platform. <b>(${S.revenges} today)</b></div>` : '';

    // recap (WON / LOCKED)
    const setups = Data.SETUPS.map(s => ({ v: s.id, label: s.label }));
    const emo = Data.EMOTIONS.map(e => ({ v: e.id, label: e.label }));
    const sides = [{ v: 'long', label: 'Long' }, { v: 'short', label: 'Short' }];
    const recap = (S.state === 'WON' || S.state === 'LOCKED') ? `<div class="card ob-recap">
      <div class="ch-t mb8">${UI.icon('candles', '', 16)} Seal the session</div>
      <div class="grid2">
        ${Forms.field('Result ($)', `<input class="input" id="gb-pnl" inputmode="decimal" value="${S.pnl == null ? '' : S.pnl}" data-change="guardianSetPnl" placeholder="e.g. 320 or -180" />`)}
        ${Forms.field('Side', Forms.pick('gside', sides, S.side || 'long'))}
      </div>
      ${Forms.field('Setup', Forms.pick('gsetup', setups, S.setup || 'orb'))}
      ${Forms.field('How did I trade?', Forms.pick('gemotion', emo, S.emotion || 'disciplina'))}
      ${Forms.field('Notes', `<textarea class="input" id="gb-note" rows="2" placeholder="What happened, what I felt…">${UI.esc(S.note)}</textarea>`)}
      <button class="btn ${S.sealed ? 'btn-ghost' : 'btn-primary'} full" data-act="guardianSeal">${S.sealed ? UI.icon('checkc', '', 16) + ' Sealed · in your journal' : UI.icon('lock', '', 16) + ' Seal session → journal'}</button>
      <div class="ob-impact muted small mt8">${UI.icon('sync', '', 13)} Logs to Trades · Calendar · Coach automatically.</div>
      <div class="btn-row mt8">
        <button class="btn btn-ghost" data-act="guardianToStudio">${UI.icon('candles', '', 15)} Record this in Studio →</button>
        ${S.sealed ? `<button class="btn btn-ghost" data-act="guardianReset">${UI.icon('play', '', 15)} New session</button>` : ''}
      </div>
    </div>` : '';

    const log = S.log.length ? `<div class="card ob-log"><div class="ch-t mb8">${UI.icon('clock', '', 15)} Session log</div>
      ${S.log.map(l => `<div class="ob-logrow"><span class="ob-logt">${l.t}</span><span>${UI.esc(l.m)}</span></div>`).join('')}</div>` : '';

    return `<div class="page ob ob-${S.state}">
      <div class="ob-head">
        <div class="ob-title">${UI.icon('shield', '', 18)} ONE BULLET <span class="ob-live">● Live</span></div>
        <div class="ob-right"><span class="ob-clock" id="gb-clock">00:00:00</span>
          <button class="icobtn" data-act="guardianVoice" title="JARVIS">${UI.icon('cockpit', '', 16)}</button></div>
      </div>
      <div class="card ob-instrument">
        <div class="ob-idx muted small">${st.idx}</div>
        <div class="gb-chamber">${chamber}</div>
        <div class="gb-state">${st.word.replace(/\.$/, '')}<em>.</em></div>
        <div class="ob-sub muted">${st.sub}</div>
        <div class="ob-actions">${actions}</div>
      </div>
      ${kpis}
      ${revBanner}
      ${briefing}
      ${recap}
      ${rulesCard}
      ${log}
    </div>`;
  };

  function chamberSVG(state) {
    const locked = state === 'LOCKED', won = state === 'WON', fired = state === 'FIRED';
    const ring = locked ? 'var(--down)' : won ? 'var(--up)' : 'var(--brand2)';
    const centerGlyph = state === 'LOADED' ? 'I' : fired ? '·' : won ? '1/1' : locked ? '0' : '—';
    return `<svg viewBox="0 0 100 100" class="gb-svg">
      <circle cx="50" cy="50" r="44" fill="none" stroke="${ring}" stroke-width="1.4" opacity=".5"/>
      <circle cx="50" cy="50" r="34" fill="none" stroke="${ring}" stroke-width="1" opacity=".3" stroke-dasharray="2 4"/>
      ${[0, 45, 90, 135, 180, 225, 270, 315].map(a => { const r1 = 44, r2 = 40, rad = a * Math.PI / 180; return `<line x1="${50 + r1 * Math.sin(rad)}" y1="${50 - r1 * Math.cos(rad)}" x2="${50 + r2 * Math.sin(rad)}" y2="${50 - r2 * Math.cos(rad)}" stroke="${ring}" stroke-width="1" opacity=".5"/>`; }).join('')}
      ${(state === 'LOADED' || state === 'FIRED') ? `<circle cx="50" cy="${fired ? 14 : 10}" r="4.5" fill="var(--gold)" opacity="${fired ? .4 : 1}"><animate attributeName="opacity" values="1;.5;1" dur="1.6s" repeatCount="indefinite"/></circle>` : ''}
      ${fired ? `<circle cx="50" cy="50" r="26" fill="none" stroke="var(--brand2)" stroke-width="2" stroke-dasharray="20 140" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="1.4s" repeatCount="indefinite"/></circle>` : ''}
      <text x="50" y="${won ? 56 : 58}" text-anchor="middle" font-family="Sora,sans-serif" font-weight="800" font-size="${won ? 20 : 30}" fill="${ring}">${centerGlyph}</text>
      ${locked ? `<line x1="18" y1="18" x2="82" y2="82" stroke="var(--down)" stroke-width="3" stroke-linecap="round"/>` : ''}
    </svg>`;
  }
})();
