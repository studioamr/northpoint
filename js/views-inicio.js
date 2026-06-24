/* ============ RACHA · Inicio (estilo Home de TradeSyncer, look igloo) ============ */
window.Views = window.Views || {};
(() => {
  const V = window.Views;
  const H = () => Data.HOME;
  const sec = (label, body, right) => `<section class="home-sec"><div class="sec-top"><div class="sec-label">${label}</div>${right || ''}</div>${body}</section>`;

  // -------- PARA TI --------
  function forYou() {
    const cs = Q.courseStats();
    const cards = [
      { ic: 'academy', t: cs.done ? 'Continúa tu curso' : 'Empieza tu curso', s: `${cs.pct}% completado · ${cs.done}/${cs.total} lecciones`, act: 'continueCourse', btn: 'Abrir' },
      { ic: 'candles', t: 'Conecta tu journal', s: 'Registra tus trades y mide tu progreso real', act: 'go', route: 'dashboard', btn: 'Ver journal' },
      { ic: 'wapp', t: 'Únete a la comunidad', s: 'Sesgo diario y acompañamiento en Discord', act: 'openDiscord', btn: 'Unirme' },
    ];
    return `<div class="foryou">${cards.map(c => `<div class="fy-card glass">
      <div class="fy-ic">${UI.icon(c.ic, '', 20)}</div>
      <div class="fy-main"><div class="fy-t">${c.t}</div><div class="fy-s muted">${c.s}</div></div>
      <button class="btn btn-ice sm" data-act="${c.act}" ${c.route ? `data-route="${c.route}"` : ''}>${c.btn}</button>
    </div>`).join('')}</div>`;
  }

  // -------- PRECIOS --------
  function prices() {
    return `<div class="hscroll inst-row">${H().instruments.map(x => {
      const up = x.chg > 0, dn = x.chg < 0;
      return `<div class="inst glass">
        <div class="inst-top"><span class="inst-sym">${x.sym}</span><span class="inst-name muted">${x.name}</span></div>
        <div class="inst-price">${x.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        <div class="inst-chg ${up ? 'up' : dn ? 'down' : 'flat'}">${UI.icon(up ? 'arrUp' : dn ? 'arrDn' : 'list', '', 13)} ${x.chg > 0 ? '+' : ''}${x.chg.toFixed(2)} (${x.pct > 0 ? '+' : ''}${x.pct.toFixed(2)}%)</div>
      </div>`;
    }).join('')}</div>`;
  }

  // -------- AHORA MISMO + FIRMAS --------
  function nowAndFirms() {
    const orders = `<div class="card glass orders">
      <div class="ord-top"><span class="sec-label">Órdenes de la comunidad</span><span class="live">● EN VIVO</span></div>
      <div class="ord-num">${H().orders.toLocaleString('en-US')}</div>
      <div class="muted small">${UI.icon('candles', '', 13)} Procesadas por traders como tú</div>
    </div>`;
    const firms = `<div class="hscroll firm-row">${H().firms.map(f => `<div class="firm glass">
      <div class="firm-top"><span class="firm-logo">${UI.initials(f.name)}</span><div><div class="firm-name">${f.name}</div><div class="firm-rate">${UI.icon('star', 'gold', 12)} ${f.rating}/5</div></div></div>
      <div class="firm-stats"><div><span class="muted">Max Funding</span><b class="up">${f.maxFunding}</b></div><div><span class="muted">Profit Split</span><b>${f.split}</b></div></div>
      <div class="firm-cost"><span class="muted">Costo más bajo</span><b>${f.cost}</b></div>
      <div class="firm-tags">${f.tags.map(t => `<span class="ftag">${t}</span>`).join('')}</div>
      <button class="btn btn-ghost sm full" data-act="openDiscord">Visitar firma ${UI.icon('arrUp', '', 13)}</button>
    </div>`).join('')}</div>`;
    return `<div class="now-grid">${orders}${firms}</div>`;
  }

  // -------- PNL DE LA COMUNIDAD --------
  function communityPnl() {
    return `<div class="hscroll cpnl-row">${H().community.map(c => `<div class="cpnl">
      <div class="cpnl-head"><span class="cpnl-brand">${UI.logo(18)} NORTHPOINT</span><span class="cpnl-date">Jun 23</span></div>
      <div class="cpnl-cols">
        <div class="cpnl-stats">
          <div class="cpnl-box"><span>Cuentas</span><b>${c.accounts}</b></div>
          <div class="cpnl-box"><span>Balance total</span><b>$${c.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</b></div>
          <div class="cpnl-box profit"><span>Ganancia</span><b>+$${c.profit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</b></div>
        </div>
        <div class="cpnl-items"><span class="cpnl-il">Cuentas copiadas</span>${c.items.map(it => `<div class="cpnl-it"><span>${it[0]}</span><b>+$${it[1].toLocaleString('en-US', { minimumFractionDigits: 2 })}</b></div>`).join('')}</div>
      </div>
      <div class="cpnl-user"><span class="cpnl-av">${UI.initials(c.user)}</span>${c.user}</div>
    </div>`).join('')}</div>`;
  }

  // -------- CALENDARIO ECONÓMICO --------
  function econ() {
    const dotc = { red: 'var(--down)', yellow: 'var(--gold)', green: 'var(--up)' };
    const head = `<div class="econ-bar">
      <div class="seg"><button class="seg-b on">Todos</button><button class="seg-b">Hoy</button><button class="seg-b">Importantes</button></div>
      <div class="econ-meta muted small">🇺🇸 USA · GMT-06:00</div>
    </div>`;
    const grid = `<div class="econ-grid">${H().econ.map(d => `<div class="econ-col ${d.today ? 'today' : ''}">
      <div class="econ-dh"><span>${d.day}</span><b>${d.date}</b></div>
      <div class="econ-evs">${d.events.length ? d.events.map(e => `<div class="econ-ev"><span class="econ-dot" style="background:${dotc[e[2]]}"></span><div class="econ-et"><div class="econ-en">${e[0]}</div><div class="muted">${e[1]} · USA</div></div></div>`).join('') : `<div class="econ-empty muted small">—</div>`}</div>
    </div>`).join('')}</div>`;
    return `<div class="card glass">${head}<div class="econ-week"><b>Jun 21 – Jun 27, 2026</b></div>${grid}</div>`;
  }

  V.inicio = function () {
    const name = App.db.meta.name || 'Trader';
    return `<div class="page home">
      <div class="home-hero"><h1>Hola, ${UI.esc(name)}</h1><p class="muted">Tu plataforma de trading: aprende, opera y mide tu camino al payout.</p></div>
      ${sec('PARA TI', forYou())}
      ${sec('PRECIOS DE INSTRUMENTOS', prices())}
      ${sec('FIRMAS DE FONDEO RECOMENDADAS', nowAndFirms())}
      ${sec('PNL DE LA COMUNIDAD', communityPnl())}
      ${sec('CALENDARIO ECONÓMICO', econ())}
      <div class="spacer"></div>
    </div>`;
  };
})();
