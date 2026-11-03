const test = require('node:test');
const assert = require('node:assert/strict');
const { carica, giorno } = require('./carica');

function riga(ctx, id, gg, ex, load, reps, extra) {
  return Object.assign({ id, w: ctx.weekOf(giorno(ctx, gg)), date: giorno(ctx, gg), day: 'B', ex, side: '', band: '',
    load, reps, rir: 2, top: false, note: '' }, extra || {});
}
function defDi(ctx, giornoPiano, nome) {
  ctx.PLAN = ctx.buildPlan();
  return ctx.PLAN[giornoPiano].ex.find(e => e.n === nome);
}

test('dopo una salita di carico il suggerimento resta sul carico nuovo', () => {
  const ctx = carica();
  ctx.S.log = [
    riga(ctx, 'a', -10, 'Box Squat', 28, [10, 10, 10], { top: true }),
    riga(ctx, 'b', -6, 'Box Squat', 28, [10, 10, 10], { top: true }),
    riga(ctx, 'c', -2, 'Box Squat', 30, [8, 8, 8])
  ];
  const def = defDi(ctx, 'B', 'Box Squat');
  assert.equal(ctx.suggestLoad(def), 30);
  assert.equal(ctx.readiness(def).ready, false, 'una sola seduta a 30 kg non basta per salire');
});

test('se la seduta al carico nuovo crolla sotto il range si torna al precedente', () => {
  const ctx = carica();
  ctx.S.log = [
    riga(ctx, 'a', -10, 'French Press', 16, [10, 10, 10], { top: true, day: 'A' }),
    riga(ctx, 'b', -6, 'French Press', 16, [10, 10, 10], { top: true, day: 'A' }),
    riga(ctx, 'c', -2, 'French Press', 18, [6, 5, 5], { day: 'A' })
  ];
  assert.equal(ctx.suggestLoad(defDi(ctx, 'A', 'French Press')), 16);
});

test('il tetto per la spalla vale anche sullo storico precedente al tetto', () => {
  const ctx = carica();
  ctx.S.log = [riga(ctx, 'a', -3, 'Reverse Fly', 8, [15, 15, 15], { day: 'D' })];
  assert.equal(ctx.suggestLoad(defDi(ctx, 'D', 'Reverse Fly')), 6);
});

test('pronto a salire solo con due top consecutivi allo stesso carico', () => {
  const ctx = carica();
  ctx.S.log = [
    riga(ctx, 'a', -10, 'Box Squat', 26, [10, 10, 10], { top: true }),
    riga(ctx, 'b', -6, 'Box Squat', 28, [10, 10, 10], { top: true })
  ];
  const def = defDi(ctx, 'B', 'Box Squat');
  assert.equal(ctx.readiness(def).ready, false, '26 e 28: carichi diversi');
  ctx.S.log.push(riga(ctx, 'c', -2, 'Box Squat', 28, [10, 10, 10], { top: true }));
  const r = ctx.readiness(def);
  assert.equal(r.ready, true);
  assert.equal(r.next, 30);
});

test('rientro: avviso tra 8 e 21 giorni, un gradino sotto oltre 21', () => {
  const ctx = carica();
  ctx.S.log = [riga(ctx, 'a', -5, 'Box Squat', 28, [10, 10, 10])];
  assert.equal(ctx.rientro('Box Squat'), null);
  ctx.S.log = [riga(ctx, 'a', -12, 'Box Squat', 28, [10, 10, 10])];
  assert.deepEqual({ gg: ctx.rientro('Box Squat').gg, taglio: ctx.rientro('Box Squat').taglio }, { gg: 12, taglio: false });
  ctx.S.log = [riga(ctx, 'a', -25, 'Box Squat', 28, [10, 10, 10])];
  assert.equal(ctx.rientro('Box Squat').taglio, true);
});

test('avvio: uno stato senza serie registrate non viene cancellato', () => {
  const ctx = carica();
  const salvato = {
    log: [], sess: [], mis: [],
    ben: [{ date: giorno(ctx, -1), w: 40, hrv: 55, cibJ: '{"pra":[]}' }],
    sync: { url: 'https://script.google.com/macros/s/XYZ/exec', secret: 's' }
  };
  assert.equal(ctx.statoDaSalvato(JSON.parse(JSON.stringify(salvato))), true);
  assert.equal(ctx.S.ben.length, 1);
  assert.equal(ctx.S.sync.url, salvato.sync.url);
  assert.ok(Array.isArray(ctx.S.sim) && Array.isArray(ctx.S.patches));
});

test('avvio: senza nulla di salvato parte vuoto ma coerente', () => {
  const ctx = carica();
  assert.equal(ctx.statoDaSalvato(null), false);
  assert.deepEqual([ctx.S.log.length, ctx.S.ben.length], [0, 0]);
});
