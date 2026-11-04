const test = require('node:test');
const assert = require('node:assert/strict');
const { carica } = require('./carica');

const voce = (p, c, g) => ({ n: 'x', p, c, g, q: 1 });
function giornata(ctx, pasti) { const g = ctx.cibVuoto(); Object.keys(pasti).forEach(k => { g[k] = pasti[k]; }); return g; }

test('gli spuntini sono facoltativi: non compaiono tra i pasti da registrare', () => {
  const ctx = carica();
  const g = giornata(ctx, { col: [voce(26, 70, 14)], pra: [voce(39, 105, 21)], cen: [voce(39, 105, 21)] });
  const h = ctx.cibHint({ p: 0.5, c: 0, g: 0 }, g);
  assert.ok(!/spuntino/i.test(h.sub.split('.')[0]), h.sub);
  assert.match(h.sub, /I pasti principali sono registrati/);
  const g2 = giornata(ctx, { col: [voce(26, 70, 14)] });
  assert.match(ctx.cibHint({ p: 3, c: 3, g: 3 }, g2).sub, /Devi ancora registrare pranzo e cena\./);
});

test('un pasto segnato come saltato non viene chiesto', () => {
  const ctx = carica();
  const g = giornata(ctx, { pra: [voce(39, 105, 21)], cen: [voce(39, 105, 21)] });
  g.salta = ['col'];
  assert.ok(ctx.pastoSaltato(g, 'col'));
  assert.ok(!/colazione/.test(ctx.cibHint({ p: 1, c: 1, g: 1 }, g).sub));
});

test('senza spuntini e con la cena ancora da fare: la proteina va a colazione o pranzo, non tutta a cena', () => {
  const ctx = carica();
  const g = giornata(ctx, { col: [voce(26, 70, 14)], pra: [voce(39, 105, 21)] });
  assert.match(ctx.cibHint({ p: 1.5, c: 1, g: 1 }, g).sub, /reflusso/);
  g.sm = [voce(13, 35, 7)];
  assert.ok(!/reflusso/.test(ctx.cibHint({ p: 1.5, c: 1, g: 1 }, g).sub), 'con uno spuntino il consiglio non serve');
});

test('agenda: la sera, con i tre pasti principali registrati, i pasti sono fatti anche senza spuntini', () => {
  const ctx = carica({ now: new Date(2026, 10, 3, 23, 0, 0).getTime() });
  const g = giornata(ctx, { col: [voce(26, 70, 14)], pra: [voce(39, 105, 21)], cen: [voce(39, 105, 21)] });
  ctx.S.ben = [{ date: ctx.today(), w: ctx.weekOf(ctx.today()), cibJ: JSON.stringify(g), cibP: 104, cibC: 280, cibG: 56 }];
  const v = ctx.agendaVoci().find(x => x.k === 'cibo');
  assert.equal(v.fatto, true);
  assert.match(v.d, /3 pasti principali su 3/);
  /* senza cena: manca la cena, non gli spuntini */
  delete g.cen; ctx.S.ben[0].cibJ = JSON.stringify(Object.assign(ctx.cibVuoto(), { col: g.col, pra: g.pra }));
  const v2 = ctx.agendaVoci().find(x => x.k === 'cibo');
  assert.equal(v2.fatto, false);
  assert.match(v2.d, /manca cena$/);
});
