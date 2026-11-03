const test = require('node:test');
const assert = require('node:assert/strict');
const { carica } = require('./carica');

function ctxPiano() { const ctx = carica(); ctx.PLAN = ctx.buildPlan(); return ctx; }

test('a casa la seduta e\' quella del piano', () => {
  const ctx = ctxPiano();
  assert.deepEqual(ctx.eserciziPer('A', 'casa').map(e => e.n), ctx.PLAN.A.ex.map(e => e.n));
});

test('a corpo libero non resta nessun attrezzo e le serie si conservano', () => {
  const ctx = ctxPiano();
  for (const d of ['A', 'B', 'C', 'D', 'E1', 'E2']) {
    const lista = ctx.eserciziPer(d, 'corpo');
    assert.ok(lista.length >= 3, d + ': almeno 3 esercizi');
    for (const e of lista) {
      const m = ctx.meta(e.n);
      assert.ok(!m.band && !e.b, d + ': ' + e.n + ' usa una banda');
      assert.ok(!(e.L > 0) || ctx.ALT[e.n] === undefined, d + ': ' + e.n + ' ha un carico');
      assert.ok(e.s >= 1 && e.s <= 5, d + ': serie fuori scala per ' + e.n);
    }
  }
  /* C: Floor Press (volume) e Push-up diventano entrambi Push-up: le serie si sommano */
  const pu = ctx.eserciziPer('C', 'corpo').find(e => e.n === 'Push-up');
  assert.equal(pu.s, 5);
});

test('con le bande ogni sostituto ha una prescrizione completa', () => {
  const ctx = ctxPiano();
  for (const d of ['A', 'B', 'C', 'D']) {
    for (const e of ctx.eserciziPer(d, 'bande')) {
      assert.ok(e.lo > 0 && e.hi >= e.lo, d + ': range non valido per ' + e.n);
      if (ctx.meta(e.n).band) assert.ok(e.b, d + ': ' + e.n + ' senza banda di partenza');
    }
  }
});

test('ridotta 45 minuti: i primi quattro, anche fuori casa', () => {
  const ctx = ctxPiano();
  assert.equal(ctx.eserciziPer('C', 'casa', true).length, 4);
  assert.ok(ctx.eserciziPer('C', 'bande', true).length <= 4);
});

test('settimana di picco: bersaglio 2, caselle E1 ed E2', () => {
  const ctx = ctxPiano();
  const w = ctx.weekOf(ctx.today());
  assert.equal(ctx.bersaglio(w, 0), 4);
  ctx.S.picco = { [w]: true };
  assert.deepEqual([...ctx.giorniSettimana(w)], ['E1', 'E2']);
  assert.equal(ctx.bersaglio(w, 0), 2);
  assert.equal(ctx.bersaglio(w, 1), 1);
  assert.equal(ctx.kpi(w).target, 2);
});

test('il luogo di oggi segue la notte fuori casa, ma la scelta manuale vince', () => {
  const ctx = ctxPiano();
  assert.equal(ctx.luogoOggi(), 'casa');
  ctx.S.ben = [{ date: ctx.today(), sede: 'Fuori' }];
  assert.equal(ctx.luogoOggi(), 'bande');
  ctx.S.luogo = { v: 'corpo', date: ctx.today() };
  assert.equal(ctx.luogoOggi(), 'corpo');
});
