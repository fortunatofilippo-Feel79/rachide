const test = require('node:test');
const assert = require('node:assert/strict');
const { carica } = require('./carica');

function tuttiGliEsercizi(ctx) {
  ctx.PLAN = ctx.buildPlan();
  const nomi = new Set();
  Object.keys(ctx.PLAN).forEach(d => ctx.PLAN[d].ex.forEach(x => nomi.add(x.n)));
  Object.values(ctx.ALT).forEach(a => { if (a.bande) nomi.add(a.bande); if (a.corpo) nomi.add(a.corpo); });
  return [...nomi];
}

test('ogni esercizio del piano, delle alternative e del riscaldamento ha figura e scheda tecnica', () => {
  const ctx = carica();
  const manca = [];
  for (const n of tuttiGliEsercizi(ctx)) {
    if (!ctx.figHas(n)) manca.push('figura: ' + n);
    if (!ctx.G[n]) manca.push('scheda: ' + n);
    if (!ctx.EX[n]) manca.push('catalogo: ' + n);
  }
  ctx.WARM.forEach((w, i) => {
    ['A', 'B', 'C', 'D', 'T1', 'T2', 'E1', 'E2'].forEach(d => {
      const n = ctx.warmNome(i, d);
      if (!ctx.figHas(n)) manca.push('figura riscaldamento: ' + n);
    });
  });
  assert.deepEqual(manca, []);
});

test('le figure non producono coordinate non valide in nessun momento del ciclo', () => {
  const ctx = carica();
  for (const n of Object.keys(ctx.FIG)) {
    const def = ctx.FIG[n], tot = ctx.fgDurata(def);
    for (let i = 0; i <= 20; i++) {
      const svg = ctx.fgDisegna(def, ctx.fgAl(def, tot * i / 20).p, {});
      assert.ok(!/NaN|undefined|Infinity/.test(svg), n + ' al passo ' + i);
    }
    const vb = ctx.fgInquadra(n);
    assert.ok(vb.w > 100 && vb.h > 60 && isFinite(vb.x) && isFinite(vb.y), n + ': inquadratura ' + JSON.stringify(vb));
  }
});

test('braccia e gambe non cambiano lunghezza durante il movimento', () => {
  const ctx = carica();
  const d = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  for (const n of Object.keys(ctx.FIG)) {
    const def = ctx.FIG[n], tot = ctx.fgDurata(def);
    for (let i = 0; i <= 12; i++) {
      const P = ctx.fgPosa(ctx.fgAl(def, tot * i / 12).p);
      for (const l of ['n', 'f']) {
        const b = P.braccia[l], g = P.gambe[l];
        assert.ok(Math.abs(d(b.s, b.e) - ctx.FL.ua) < 0.05, n + ' omero');
        assert.ok(Math.abs(d(g.h, g.k) - ctx.FL.th) < 0.05, n + ' femore');
        assert.ok(d(g.k, g.a) <= ctx.FL.sh + 0.05, n + ' tibia');
      }
    }
  }
});
