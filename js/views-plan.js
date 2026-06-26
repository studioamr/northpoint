/* ============ RACHA · Vistas: Plan, Disciplina, Bitácora y Ajustes ============ */
window.Views = window.Views || {};
(() => {
  const V = window.Views;

  V.plan = function () {
    const plan = App.db.plan || Data.PLAN;
    const today = UI.todayISO(), done = App.db.checks[today] || [];
    const items = plan.checklist || Data.PLAN.checklist;
    const okCount = items.filter(i => done.includes(i.id)).length;

    const checklist = `<div class="card">
      <div class="card-head"><div class="ch-t">${UI.icon('check', '', 18)} Checklist de hoy</div><span class="muted small">${okCount}/${items.length}</span></div>
      ${items.map(i => { const on = done.includes(i.id); return `<button class="checkitem ${on ? 'on' : ''}" data-act="toggleCheck" data-id="${i.id}"><span class="ci-box">${on ? UI.icon('check', '', 14) : ''}</span><span class="ci-lbl">${UI.esc(i.label)}</span></button>`; }).join('')}
      ${okCount === items.length ? `<div class="ci-done">¡Sesión bajo control! Disciplina = libertad.</div>` : ''}
    </div>`;

    const routine = `<div class="card"><div class="card-head"><div class="ch-t">${UI.icon('clock', '', 18)} Mi rutina (hora NY)</div></div>
      <div class="routine">${(plan.routine || []).map(r => `<div class="rt"><div class="rt-t">${r.t}</div><div class="rt-line"><span class="rt-dot"></span></div><div class="rt-main"><div class="rt-lbl">${UI.esc(r.label)}</div><div class="muted small">${UI.esc(r.note || '')}</div></div></div>`).join('')}</div></div>`;

    const fases = `<div class="card"><div class="card-head"><div class="ch-t">${UI.icon('target', '', 18)} Embudo: Eval → Buffer → Payout</div></div>
      <div class="ftable"><div class="fhead"><span>Fase</span><span>Target</span><span>Máx pérdida</span><span>Tamaño</span></div>
      ${(plan.phases || Data.PLAN.phases).map(p => { const ph = Data.phaseOf(p.id); return `<div class="frow"><span class="phase" style="color:${ph.color}">${ph.short}</span><span class="up">${UI.usd(p.target)}</span><span class="down">${UI.usd(p.maxLoss)}</span><span>${UI.esc(p.size)}</span></div>`; }).join('')}</div></div>`;

    const reglas = `<div class="card"><div class="card-head"><div class="ch-t">${UI.icon('bolt', '', 18)} Mis reglas</div></div><ul class="rules">${(plan.rules || []).map(r => `<li>${UI.esc(r)}</li>`).join('')}</ul></div>`;

    const pledge = `<div class="card pledge"><div class="pl-seal">${UI.logo(34)}</div><div class="pl-title">Mi compromiso</div><p class="pl-text">"${UI.esc(plan.pledge)}"</p><div class="pl-sign">— ${UI.esc(App.db.meta.name || 'Trader')}</div></div>`;

    const notes = Q.db().journal.slice().sort((a, b) => (a.date < b.date ? 1 : -1));
    const tagColor = { win: 'var(--up)', leccion: 'var(--gold)', error: 'var(--down)', nota: 'var(--muted)' };
    const bitacora = `<div class="card"><div class="card-head"><div class="ch-t">${UI.icon('book', '', 18)} Bitácora</div><button class="link" data-act="addNote">+ Nota</button></div>
      ${notes.length ? notes.map(n => `<div class="note-wrap"><button class="noterow" data-act="editNote" data-id="${n.id}"><span class="nt-tag" style="background:${tagColor[n.tag] || 'var(--muted)'}22;color:${tagColor[n.tag] || 'var(--muted)'}">${n.tag || 'nota'}</span><div class="nt-main"><div class="muted small">${UI.date(n.date)}</div><div class="nt-text">${UI.esc(n.text)}</div></div></button>${n.media && n.media.length ? `<div class="note-media">${n.media.map(mm => `<button class="media-item sm" data-act="viewMedia" data-id="${mm.id}" data-type="${mm.type}">${mm.type === 'video' ? `<video data-media="${mm.id}" muted playsinline></video><span class="media-play">${UI.icon('play', '', 14)}</span>` : `<img data-media="${mm.id}" alt="" />`}</button>`).join('')}</div>` : ''}</div>`).join('') : UI.empty('book', 'Bitácora vacía', 'Anota tus lecciones.')}</div>`;

    return `<div class="page"><div class="grid2-wide">${checklist}${routine}</div><div class="grid2-wide">${fases}${reglas}</div>${pledge}${bitacora}</div>`;
  };

  V.settings = function () {
    const d = App.db;
    return `<div class="sheet-head"><div class="h2">Ajustes</div></div>
      <div class="form">${Forms.field('Tu nombre', Forms.input('set-name', d.meta.name, 'André'))}<button class="btn btn-ghost full" data-act="saveName">Guardar nombre</button></div>
      <div class="setlist">
        <button class="setrow2" data-act="connectTradovate">${UI.icon('plug', '', 18)} <span>Conectar Tradovate (sync en vivo)${d.sync?.session ? ' · conectado' : ''}</span></button>
        <button class="setrow2" data-act="exportCSV">${UI.icon('download', '', 18)} <span>Exportar trades a Excel (.csv)</span></button>
        <button class="setrow2" data-act="exportData">${UI.icon('share', '', 18)} <span>Respaldar mis datos (.json)</span></button>
        <button class="setrow2" data-act="seeLanding">${UI.icon('gift', '', 18)} <span>Ver página del curso</span></button>
        <button class="setrow2" data-act="resetDemo">${UI.icon('play', '', 18)} <span>Cargar datos de ejemplo</span></button>
        <button class="setrow2" data-act="passwordSettings">${UI.icon('lock', '', 18)} <span>Contraseña de acceso${d.meta.pass ? ' · activada' : ''}</span></button>
        <button class="setrow2" data-act="logout">${UI.icon('user', '', 18)} <span>Cerrar sesión</span></button>
        <button class="setrow2 danger" data-act="wipeAll">${UI.icon('trash', '', 18)} <span>Borrar todo y empezar de cero</span></button>
      </div>
      <div class="muted small center mt12">NorthPoint · tus datos viven en este dispositivo.</div>`;
  };
})();
