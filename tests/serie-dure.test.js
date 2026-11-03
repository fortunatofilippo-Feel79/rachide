const test = require('node:test');
const assert = require('node:assert/strict');
const { carica, giorno } = require('./carica');

const riga = (ctx, ex, over) => Object.assign({ id: ex, w: ctx.weekOf(giorno(ctx, -1)), date: giorno(ctx, -1), day: 'A', ex, side: '', band: '', load: 0, reps: [10, 10, 10], rir: null, top: false, note: '' }, over || {});

test('serie dure: RIR 0-3 vale 1, RIR 4+ vale mezza, senza RIR vale 1', () => {
  const ctx = carica();
  const r = riga(ctx, 'Floor Press manubri', { load: 20, rirs: [1, 2, 4] });
  assert.equal(ctx.serieRiga(r), 2.5);
  assert.equal(ctx.serieRiga(riga(ctx, 'Floor Press manubri', { load: 20 })), 3, 'dati di prima: tutte piene');
  assert.equal(ctx.serieRiga(riga(ctx, 'Plank', { reps: [60, 60], rirs: [4, 4] })), 2, 'le tenute non hanno RIR');
  const u = ctx.serieDure([r, riga(ctx, 'Plank', { reps: [60] })]);
  assert.deepEqual([u.tot, u.dure], [3, 2], 'le tenute fuori dal conteggio');
});

test('un esercizio a un lato vale una serie, non due, anche con i RIR', () => {
  const ctx = carica();
  const s = riga(ctx, 'Split-stance RDL', { side: 'S', load: 12, reps: [8, 8, 8], rirs: [2, 2, 2] });
  const d = riga(ctx, 'Split-stance RDL', { side: 'D', load: 12, reps: [8, 8, 8], rirs: [2, 2, 2] });
  assert.equal(ctx.serieGruppo([s, d]).Gambe, 3);
});

test('serie per gruppo: le serie comode pesano mezzo anche sui muscoli indiretti', () => {
  const ctx = carica();
  const g = ctx.serieGruppo([riga(ctx, 'Floor Press manubri', { load: 20, rirs: [4, 4, 4, 4], reps: [10, 10, 10, 10] })]);
  assert.equal(g.Petto, 2);
  assert.equal(g.Tricipiti, 1);
});

test('la stessa seduta non sembra piu\' leggera con le bande o a corpo libero', () => {
  const ctx = carica();
  ctx.S.ben = [{ date: giorno(ctx, -1), peso: 66 }];
  const pesi = ctx.caricoSettimana([riga(ctx, 'Floor Press manubri', { load: 20 })]);
  const corpo = ctx.caricoSettimana([riga(ctx, 'Push-up')]);
  const bande = ctx.caricoSettimana([riga(ctx, 'Band row seduto', { band: 'rossa' })]);
  assert.equal(pesi.pesi, 600);
  assert.equal(corpo.corpo, Math.round(0.72 * 66 * 30));
  assert.equal(bande.bande, Math.round(22.7 * 0.7 * 30));
  assert.ok(corpo.tot > 0 && bande.tot > 0);
  assert.equal(ctx.caricoSettimana([riga(ctx, 'Plank', { reps: [60] })]).tot, 0, 'le tenute non hanno un carico');
});

test('kpi(): serie dure, carico per tipo e KPI serie_dure', () => {
  const ctx = carica(); ctx.PLAN = ctx.buildPlan();
  const w = ctx.weekOf(giorno(ctx, -1));
  ctx.S.sess = [{ id: 's', w, date: giorno(ctx, -1), day: 'A', mod: 'Pesi', min: 60, en: 4 }];
  ctx.S.log = [riga(ctx, 'Floor Press manubri', { load: 20, rirs: [2, 2, 5] }), riga(ctx, 'Push-up', { id: 'p' })];
  const k = ctx.kpi(w);
  assert.equal(k.ton_pesi, 600);
  assert.ok(k.ton_corpo > 0);
  assert.equal(k.dure.dure, 5);
  assert.equal(k.dure.tot, 6);
  assert.equal(ctx.kpiValori().serie_dure.stato, 'att');
});
