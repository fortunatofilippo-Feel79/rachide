const test = require('node:test');
const assert = require('node:assert/strict');
const { carica } = require('./carica');
const { CRITERI, FONTI } = require('./tecnica-criteri');

/* Ogni figura rispetta i criteri di tecnica presi da fonti esterne (vedi docs/REVISIONE_ESERCIZI.md). */
test('le figure rispettano i criteri di tecnica, uno per uno', () => {
  const ctx = carica();
  const fuori = [];
  for (const c of CRITERI) {
    const def = ctx.FIG[c.n];
    assert.ok(def, 'manca la figura ' + c.n);
    assert.ok(FONTI[c.s], c.n + ': fonte ' + c.s + ' non descritta');
    const v = c.f(ctx.fgPosa(def.k[c.k].p));
    if (!(v >= c.min - 0.5 && v <= c.max + 0.5)) fuori.push(c.n + ' [' + c.k + '] ' + c.c + ': ' + v.toFixed(1) + ' fuori da ' + c.min + '-' + c.max);
  }
  assert.deepEqual(fuori, []);
});

test('ogni esercizio del catalogo delle figure ha almeno un criterio di tecnica, o e\' una variante di uno che lo ha', () => {
  const ctx = carica();
  const con = new Set(CRITERI.map(c => c.n));
  const senza = Object.keys(ctx.FIG).filter(n => !con.has(n) && !con.has(ctx.POS_DA[n]) && !['Respirazione costale asimmetrica', 'Rotazioni toraciche', 'Side plank', 'Band row un braccio', 'Curl isometrico asciugamano'].includes(n));
  assert.deepEqual(senza, []);
});

test('le braccia che pendono e quelle tese si leggono distese, le pieghe leggere restano visibili', () => {
  const ctx = carica();
  const M = require('./tecnica-criteri').M;
  /* in piedi, di lato e di fronte, a braccia lungo i fianchi */
  for (const p of [ctx.pIn({}), ctx.pFronte({}), ctx.pPiegato({})]) {
    const P = ctx.fgPosa(p);
    assert.ok(M.gom(P) > 168, 'braccio che pende piegato a ' + M.gom(P).toFixed(0));
  }
  /* ginocchia morbide nella cerniera d'anca: si vede la piega */
  const Pp = ctx.fgPosa(ctx.pPiegato({}));
  assert.ok(M.gin(Pp) > 145 && M.gin(Pp) < 170, 'ginocchio del busto a 45°: ' + M.gin(Pp).toFixed(0));
});

test('scorci e arti morbidi passano da un fotogramma all\'altro senza scatti', () => {
  const ctx = carica();
  for (const n of ['Push-up', 'Band pull-apart', 'Shoulder Press manubri', 'Split-stance RDL', 'Pullover manubrio']) {
    const def = ctx.FIG[n], tot = ctx.fgDurata(def);
    let prima = null;
    for (let i = 0; i <= 400; i++) {
      const P = ctx.fgPosa(ctx.fgAl(def, tot * i / 400).p), q = [P.braccia.n.e, P.braccia.n.h, P.gambe.n.k];
      if (prima) q.forEach((x, j) => assert.ok(Math.hypot(x[0] - prima[j][0], x[1] - prima[j][1]) < 3, n + ': salto al passo ' + i));
      prima = q;
    }
  }
});
