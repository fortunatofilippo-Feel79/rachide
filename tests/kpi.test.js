const test = require('node:test');
const assert = require('node:assert/strict');
const { carica, giorno } = require('./carica');

test('serie frazionarie: la panca conta mezza serie per tricipiti e spalle', () => {
  const ctx = carica();
  const g = ctx.serieGruppo([
    { ex: 'Floor Press manubri', side: '', reps: [10, 10, 10, 10] },
    { ex: 'French Press', side: '', reps: [10, 10, 10] },
    { ex: 'Split-stance RDL', side: 'S', reps: [8, 8, 8] },
    { ex: 'Split-stance RDL', side: 'D', reps: [8, 8, 8] }
  ]);
  assert.equal(g.Petto, 4);
  assert.equal(g.Tricipiti, 5);   // 3 dirette + 4 x 0,5
  assert.equal(g.Spalle, 2);
  assert.equal(g.Gambe, 3);       // unilaterale: 3 serie, non 6
});

test('il piano attuale sta nel range 10-20 per ogni gruppo con il conteggio frazionario', () => {
  const ctx = carica(); ctx.PLAN = ctx.buildPlan();
  const righe = [];
  ['A', 'B', 'C', 'D'].forEach(d => ctx.PLAN[d].ex.forEach(e => {
    const reps = Array(e.s).fill(e.hi);
    if (e.u) { righe.push({ ex: e.n, side: 'S', reps }); righe.push({ ex: e.n, side: 'D', reps }); }
    else righe.push({ ex: e.n, side: '', reps });
  }));
  const g = ctx.serieGruppo(righe);
  for (const k of Object.keys(ctx.TGT)) {
    assert.ok(g[k] >= ctx.TGT[k][0] && g[k] <= ctx.TGT[k][1], k + ' = ' + g[k]);
  }
});

test('HRV: fascia normale dai 60 giorni precedenti e notte sotto la fascia', () => {
  const ctx = carica();
  ctx.S.ben = [];
  for (let i = 60; i >= 1; i--) ctx.S.ben.push({ date: giorno(ctx, -i), hrv: 50 + (i % 5) });
  ctx.S.ben.push({ date: giorno(ctx, 0), hrv: 38 });
  const h = ctx.hrvStato(ctx.today());
  assert.ok(h && h.norma >= 50 && h.norma <= 54);
  assert.equal(h.oggiBasso, true);
  const r = ctx.recovery(ctx.today());
  assert.ok(r.parts.some(p => /^HRV/.test(p)));
});

test('agenda: la sera non e\' ancora dovuta alle 10, il mattino si', () => {
  const ctx = carica({ now: new Date(2026, 10, 3, 10, 0, 0).getTime() });
  const v = ctx.agendaVoci();
  assert.equal(v.find(x => x.k === 'mattina').dovuto, true);
  assert.equal(v.find(x => x.k === 'sera').dovuto, false);
  ctx.S.ben = [{ date: ctx.today(), hrv: 55, sonno: 7 }];
  assert.equal(ctx.agendaVoci().find(x => x.k === 'mattina').fatto, true);
});

test('agenda della domenica: chiusura e riepilogo settimanale', () => {
  const ctx = carica({ now: new Date(2026, 10, 8, 19, 0, 0).getTime() });
  const k = ctx.agendaVoci().map(x => x.k);
  assert.ok(k.includes('chiusura') && k.includes('sett'));
});

test('ogni KPI ha definizione, bersaglio, fonte nota e un valore calcolabile', () => {
  const ctx = carica(); ctx.PLAN = ctx.buildPlan();
  const v = ctx.kpiValori();
  for (const d of ctx.KPI) {
    assert.ok(d.id && d.nome && d.come && d.bersaglio, d.id);
    assert.ok(ctx.FONTI[d.fonte], d.id + ': fonte ' + d.fonte);
    assert.ok(v[d.id] && ['ok', 'att', 'ko', 'na'].includes(v[d.id].stato), d.id);
  }
  assert.equal(ctx.kpiRows().length, ctx.KPI.length);
});

test('i KPI settimanali si leggono sulla settimana conclusa, non su quella in corso', () => {
  const ctx = carica(); ctx.PLAN = ctx.buildPlan();
  const w = ctx.weekOf(ctx.today());
  ctx.S.sess = ['A', 'B', 'C', 'D'].map((d, i) => ({ id: 's' + i, w: w - 1, date: giorno(ctx, -6 + i), day: d, mod: 'Pesi', min: 60, en: 4 }))
    .concat([{ id: 'x', w, date: ctx.today(), day: 'A', mod: 'Pesi', min: 60, en: 4 }]);
  const v = ctx.kpiValori();
  assert.equal(v.aderenza.v, 100);
  assert.match(v.aderenza.txt, new RegExp('sett. ' + (w - 1)));
});
