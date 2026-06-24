/* ============ RACHA · Formularios (sheets de captura) ============ */
const Forms = (() => {
  const esc = UI.esc;

  // ---- helpers de campo ----
  const field = (label, inner, hint) =>
    `<label class="field"><span class="f-lbl">${label}</span>${inner}${hint ? `<span class="f-hint">${hint}</span>` : ''}</label>`;
  const input = (id, val, ph, type) =>
    `<input class="input" id="${id}" value="${esc(val == null ? '' : val)}" placeholder="${ph || ''}" ${type ? `type="${type}"` : ''} autocomplete="off" />`;
  const numField = (id, val, ph) =>
    `<input class="input" id="${id}" value="${val == null || val === '' ? '' : val}" placeholder="${ph || '0'}" type="text" inputmode="decimal" autocomplete="off" />`;
  const dateField = (id, val) =>
    `<input class="input" id="${id}" value="${val || UI.todayISO()}" type="date" />`;
  const area = (id, val, ph) =>
    `<textarea class="input area" id="${id}" placeholder="${ph || ''}" rows="3">${esc(val || '')}</textarea>`;

  function pick(group, opts, current) {
    return `<div class="pick" data-g="${group}">` + opts.map(o =>
      `<button class="chip ${o.v === current ? 'on' : ''}" data-pick data-v="${o.v}">${o.label}</button>`).join('') + `</div>`;
  }
  function select(id, opts, current) {
    return `<select class="input" id="${id}">` + opts.map(o =>
      `<option value="${o.v}" ${o.v === current ? 'selected' : ''}>${esc(o.label)}</option>`).join('') + `</select>`;
  }
  const head = (t, sub) => `<div class="sheet-head"><div class="h2">${t}</div>${sub ? `<div class="muted small">${sub}</div>` : ''}</div>`;
  const actions = (act, id, label) =>
    `<div class="btn-row mt8"><button class="btn btn-ghost" data-act="closeSheet">Cancelar</button>
     <button class="btn btn-primary" data-act="${act}" ${id ? `data-id="${id}"` : ''}>${label}</button></div>`;
  const delRow = (act, id) => id ? `<button class="dellink" data-act="${act}" data-id="${id}">${UI.icon('trash', '', 15)} Eliminar</button>` : '';

  const accOptions = () => {
    const a = App.db.accounts.map(x => ({ v: x.id, label: `${x.alias} · ${Data.firmOf(x.firm).label}` }));
    return a.length ? a : [{ v: '', label: 'Sin cuentas todavía' }];
  };

  // ---- TRADE ----
  function trade(t) {
    t = t || {};
    const inst = Data.INSTRUMENTS.map(i => ({ v: i, label: i }));
    const setups = Data.SETUPS.map(s => ({ v: s.id, label: s.label }));
    const emo = Data.EMOTIONS.map(e => ({ v: e.id, label: e.label }));
    return head(t.id ? 'Editar trade' : 'Nuevo trade', 'Anota cómo salió tu operación') + `
      <div class="form">
        <div class="grid2">
          ${field('Fecha', dateField('t-date', t.date))}
          ${field('Hora', input('t-time', t.time, '07:48', 'time'))}
        </div>
        ${field('Cuenta', select('t-account', accOptions(), t.accountId))}
        ${field('Instrumento', pick('inst', inst, t.instrument || 'MNQ'))}
        ${field('Dirección', pick('side', [{ v: 'long', label: 'Long' }, { v: 'short', label: 'Short' }], t.side || 'long'))}
        ${field('Resultado', pick('result', [{ v: 'win', label: 'Win' }, { v: 'loss', label: 'Loss' }, { v: 'be', label: 'BE' }], t.result || 'win'))}
        <div class="grid2">
          ${field('Contratos', numField('t-contracts', t.contracts, '4'))}
          ${field('Resultado $ (±)', numField('t-pnl', t.pnl, '+420 / -260'), 'Negativo si perdiste')}
        </div>
        <div class="grid2">
          ${field('Entrada', numField('t-entry', t.entry, '30500.25'))}
          ${field('Salida', numField('t-exit', t.exit, '30516.50'))}
        </div>
        ${field('Setup', pick('setup', setups, t.setup || 'orb'))}
        ${field('¿Cómo operé?', pick('emotion', emo, t.emotion || 'disciplina'))}
        ${field('Notas', area('t-notes', t.notes, '¿Qué viste? ¿Seguiste el plan?'))}
      </div>` + actions('saveTrade', t.id, t.id ? 'Guardar' : 'Agregar trade') + delRow('delTrade', t.id);
  }

  // ---- CUENTA ----
  function account(a) {
    a = a || {};
    const firms = Data.FIRMS.map(f => ({ v: f.id, label: f.label }));
    const phases = Data.PHASES.map(p => ({ v: p.id, label: p.label }));
    const status = Data.ACC_STATUS.map(s => ({ v: s.id, label: s.label }));
    return head(a.id ? 'Editar cuenta' : 'Nueva cuenta de fondeo') + `
      <div class="form">
        ${field('Firma', pick('firm', firms, a.firm || 'tradeify'))}
        ${field('Nombre / alias', input('a-alias', a.alias, 'Tradeify 50K'))}
        ${field('Tamaño de la cuenta ($)', numField('a-size', a.size, '50000'))}
        ${field('Fase', pick('phase', phases, a.phase || 'eval'))}
        ${field('Estado', pick('status', status, a.status || 'activa'))}
      </div>` + actions('saveAccount', a.id, a.id ? 'Guardar' : 'Agregar cuenta');
  }

  // ---- PAYOUT ----
  function payout(p) {
    p = p || {};
    const firms = Data.FIRMS.map(f => ({ v: f.id, label: f.label }));
    return head(p.id ? 'Editar payout' : 'Registrar payout', '¡Otro cobro a la cuenta!') + `
      <div class="form">
        ${field('Fecha', dateField('p-date', p.date))}
        ${field('Firma', pick('pfirm', firms, p.firm || 'tradeify'))}
        ${field('Cuenta (opcional)', select('p-account', [{ v: '', label: '— Sin asignar —' }].concat(accOptions().filter(o => o.v)), p.accountId || ''))}
        ${field('Monto cobrado ($)', numField('p-amount', p.amount, '1000'), 'Lo que llegó a tu bolsillo')}
      </div>` + actions('savePayout', p.id, p.id ? 'Guardar' : 'Registrar cobro') + delRow('delPayout', p.id);
  }

  // ---- META ----
  function goal(g) {
    g = g || {};
    const icons = [
      { v: 'home', label: 'Depa' }, { v: 'car', label: 'Coche' }, { v: 'wallet', label: 'Gastos' },
      { v: 'target', label: 'Meta' }, { v: 'trophy', label: 'Logro' },
    ];
    return head(g.id ? 'Editar meta' : 'Nueva meta', 'Tu para qué del trading') + `
      <div class="form">
        ${field('¿Qué quieres lograr?', input('g-name', g.name, 'Enganche del depa'))}
        ${field('Ícono', pick('gicon', icons, g.icon || 'target'))}
        ${field('Tipo', pick('gmonthly', [{ v: 'no', label: 'Meta única' }, { v: 'si', label: 'Gasto mensual' }], g.monthly ? 'si' : 'no'))}
        <div class="grid2">
          ${field('Monto objetivo ($)', numField('g-target', g.target, '15000'))}
          ${field('Ya tengo ($)', numField('g-saved', g.saved, '0'))}
        </div>
      </div>` + actions('saveGoal', g.id, g.id ? 'Guardar' : 'Agregar meta') + delRow('delGoal', g.id);
  }

  // ---- NOTA DE BITÁCORA ----
  function note(n) {
    n = n || {};
    const tags = [
      { v: 'nota', label: 'Nota' }, { v: 'win', label: 'Win' },
      { v: 'leccion', label: 'Lección' }, { v: 'error', label: 'Error' },
    ];
    return head(n.id ? 'Editar nota' : 'Nueva nota') + `
      <div class="form">
        ${field('Fecha', dateField('n-date', n.date))}
        ${field('Etiqueta', pick('ntag', tags, n.tag || 'nota'))}
        ${field('¿Qué pasó hoy?', area('n-text', n.text, 'Disciplina, emociones, qué mejorar...'))}
      </div>` + actions('saveNote', n.id, n.id ? 'Guardar' : 'Guardar nota') + delRow('delNote', n.id);
  }

  // ---- GASTO (Cartera) ----
  function expense(e) {
    e = e || {};
    const icons = [
      { v: 'home', label: 'Casa' }, { v: 'wallet', label: 'Comida' }, { v: 'car', label: 'Coche' },
      { v: 'star', label: 'Suscripción' }, { v: 'flame', label: 'Gusto' }, { v: 'shield', label: 'Seguro' }, { v: 'coin', label: 'Otro' },
    ];
    return head(e.id ? 'Editar gasto' : 'Nuevo gasto', 'Tu gasto fijo del mes') + `
      <div class="form">
        ${field('¿Qué gasto es?', input('x-name', e.name, 'Renta'))}
        ${field('Monto al mes ($)', numField('x-amount', e.amount, '400'))}
        ${field('Ícono', pick('xicon', icons, e.icon || 'wallet'))}
      </div>` + actions('saveExpense', e.id, e.id ? 'Guardar' : 'Agregar gasto') + delRow('delExpense', e.id);
  }

  return { trade, account, payout, goal, note, expense, pick, field, input, numField, head };
})();
