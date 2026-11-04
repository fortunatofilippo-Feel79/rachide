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

test('piedi: nessun salto tra un fotogramma e il successivo, e in piedi a gambe parallele i piedi sono allineati', () => {
  const ctx = carica();
  for (const n of Object.keys(ctx.FIG)) {
    const def = ctx.FIG[n], tot = ctx.fgDurata(def);
    let prima = null;
    for (let i = 0; i <= 240; i++) {
      const P = ctx.fgPosa(ctx.fgAl(def, tot * i / 240).p);
      const a = P.gambe.f.a;
      if (prima) assert.ok(Math.hypot(a[0] - prima[0], a[1] - prima[1]) < 3, n + ': il piede lontano salta al fotogramma ' + i);
      prima = a;
    }
  }
  /* in piedi, piedi paralleli: il piede lontano e' dietro quello vicino, non mezzo passo indietro */
  const P = ctx.fgPosa(ctx.pIn({}));
  assert.ok(Math.abs(P.gambe.n.a[0] - P.gambe.f.a[0]) < 2);
  /* nell'affondo il piede dietro resta dietro */
  const aff = ctx.FIG['Affondi indietro manubri'], Pa = ctx.fgPosa(aff.k[1].p);
  assert.ok(Pa.gambe.n.a[0] - Pa.gambe.f.a[0] > 20);
});

test('in piedi le gambe distese si leggono dritte', () => {
  const ctx = carica();
  const P = ctx.fgPosa(ctx.pFronte({}));
  for (const l of ['n', 'f']) {
    const g = P.gambe[l], dist = (a, b, c) => Math.abs((c[0] - a[0]) * (b[1] - a[1]) - (c[1] - a[1]) * (b[0] - a[0])) / Math.hypot(b[0] - a[0], b[1] - a[1]);
    assert.ok(dist(g.h, g.a, g.k) < 1.2, 'ginocchio fuori linea di ' + dist(g.h, g.a, g.k).toFixed(2));
  }
});

test('vista di fronte simmetrica: gambe dietro la maglia, braccia davanti, stessi colori ai due lati', () => {
  const ctx = carica();
  const P = ctx.fgPosa(ctx.pFronte({})), s = ctx.fgCorpo(P, ctx.pFronte({}), { db: 'nf' });
  const maglia = s.indexOf('class="fg-shirt"');
  const ultimaGamba = s.lastIndexOf('fg-pants');
  const primoBraccio = s.indexOf('fg-sleeve');
  assert.ok(ultimaGamba < maglia, 'le due gambe prima della maglia');
  assert.ok(primoBraccio > maglia, 'le braccia dopo la maglia');
  assert.ok(!/fg-far/.test(s), 'nessun lato "lontano" piu\' scuro di fronte');
});

test('calf raise: la gamba libera si piega come un ginocchio vero (ginocchio avanti, piede dietro)', () => {
  const ctx = carica();
  for (const k of ctx.FIG['Calf raise monopodalico'].k) {
    const g = ctx.fgPosa(k.p).gambe.f;
    assert.ok(g.k[0] > g.a[0], 'il ginocchio sta davanti al piede');
  }
});

test('rotazioni toraciche: il braccio che lavora passa sotto il busto e poi sale', () => {
  const ctx = carica();
  const d = ctx.FIG['Rotazioni toraciche'], a = ctx.fgPosa(d.k[0].p), b = ctx.fgPosa(d.k[1].p);
  assert.ok(a.braccia.f.h[1] > a.hip[1], 'all\'inizio la mano e\' sotto il busto');
  assert.ok(b.braccia.f.h[1] < b.hc[1], 'alla fine la mano e\' sopra la testa');
  assert.equal(d.chiaro, 'bf', 'il braccio che lavora ha il colore pieno');
});
