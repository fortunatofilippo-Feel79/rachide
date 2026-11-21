const test = require('node:test');
const assert = require('node:assert/strict');
const { carica, giorno } = require('./carica');

function riga(ctx, id, gg, ex, reps, extra) {
  return Object.assign({ id, w: ctx.weekOf(giorno(ctx, gg)), date: giorno(ctx, gg), day: 'T1', ex, side: '', band: '',
    load: 0, reps, rir: 2, top: true, note: '' }, extra || {});
}
function defT1(ctx, nome) { ctx.PLAN = ctx.buildPlan(); return ctx.PLAN.T1.ex.find(e => e.n === nome); }

test('scala a livelli: con il top per 2 sedute si propone il livello 2, con il suo come si fa', () => {
  const ctx = carica();
  ctx.S.log = [riga(ctx, 'a', -8, 'Pike push-up', [10, 10, 10]), riga(ctx, 'b', -3, 'Pike push-up', [10, 10, 10])];
  const def = defT1(ctx, 'Pike push-up');
  const r = ctx.readiness(def);
  assert.equal(r.livello, 2);
  assert.match(r.why, /livello 2: discesa in 3 s/);
  assert.match(ctx.comeSi(def, r), /5 cm dal pavimento/);
});

test('dopo il passaggio conta solo lo storico del livello nuovo', () => {
  const ctx = carica();
  ctx.S.log = [riga(ctx, 'a', -8, 'Pike push-up', [10, 10, 10]), riga(ctx, 'b', -3, 'Pike push-up', [10, 10, 10])];
  ctx.passaLivello('Pike push-up', 2);
  const def = defT1(ctx, 'Pike push-up');
  assert.equal(ctx.readiness(def).ready, false, 'le sedute di prima erano al livello 1');
  assert.match(ctx.livelloTesto('Pike push-up'), /Livello 2 di 3/);
});

test('il livello 3 del Pike aggiunge la banda, non alza i piedi (reflusso)', () => {
  const ctx = carica();
  assert.match(ctx.SCALE['Pike push-up'][2].t, /banda/);
  assert.doesNotMatch(ctx.SCALE['Pike push-up'][2].come, /rialz/);
});

test('all\'ultimo livello la scala dice come continuare', () => {
  const ctx = carica();
  ctx.S.livelli = { 'Hip hinge una gamba': { l: 3, dal: giorno(ctx, -20) } };
  ctx.S.log = [riga(ctx, 'a', -8, 'Hip hinge una gamba', [10, 10, 10], { side: 'S' }), riga(ctx, 'a2', -8, 'Hip hinge una gamba', [10, 10, 10], { side: 'D' }),
               riga(ctx, 'b', -3, 'Hip hinge una gamba', [10, 10, 10], { side: 'S' }), riga(ctx, 'b2', -3, 'Hip hinge una gamba', [10, 10, 10], { side: 'D' })];
  const r = ctx.readiness(defT1(ctx, 'Hip hinge una gamba'));
  assert.equal(r.fine, true);
});
