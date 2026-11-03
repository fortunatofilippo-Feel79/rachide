const test = require('node:test');
const assert = require('node:assert/strict');
const { carica, giorno } = require('./carica');

test('formato zona:valore, massimo e testo leggibile', () => {
  const ctx = carica();
  const m = ctx.dolParse('lombare:2;spalla_sx:6');
  assert.equal(m.lombare, 2);
  assert.equal(ctx.dolMax(m), 6);
  assert.equal(ctx.dolStr({ lombare: 2, spalla_sx: 6, collo: 0 }), 'spalla_sx:6;lombare:2');
  assert.equal(ctx.dolTesto(m), 'Spalla sx 6 · Lombare 2');
});

test('il vecchio dato della spalla diventa la zona spalla sinistra', () => {
  const ctx = carica();
  ctx.S.ben = [{ date: giorno(ctx, -1), dolm: 3 }, { date: giorno(ctx, -2), dolm: 0 }];
  ctx.S.sess = [{ id: 's', date: giorno(ctx, -1), dol: 4 }];
  assert.equal(ctx.dolMigra(), 2);
  assert.equal(ctx.S.ben[0].dolmz, 'spalla_sx:3');
  assert.equal(ctx.S.ben[1].dolmz, undefined);
  assert.equal(ctx.S.sess[0].dolz, 'spalla_sx:4');
  assert.equal(ctx.dolMigra(), 0, 'una volta sola');
});

test('diagnosi: sopra 5 in seduta, non rientrato al mattino, zona ricorrente', () => {
  const ctx = carica();
  ctx.S.sess = [
    { id: 'a', day: 'B', date: giorno(ctx, -6), dol: 7, dolz: 'ginocchio_dx:7' },
    { id: 'b', day: 'D', date: giorno(ctx, -3), dol: 4, dolz: 'lombare:4' }
  ];
  ctx.S.ben = [
    { date: giorno(ctx, -2), dolm: 4, dolmz: 'lombare:4' },
    { date: giorno(ctx, -1), dolm: 3, dolmz: 'lombare:3' }
  ];
  const t = ctx.dolDiagnosi().map(x => x.t);
  assert.ok(t.some(x => /Dolore ginocchio dx 7\/10/.test(x)), 'sopra 5');
  assert.ok(t.some(x => /Lombare non rientrata/.test(x)), 'non rientrato');
  assert.ok(t.some(x => /ricorrente: lombare · 3 volte/.test(x)), 'ricorrente');
});

test('KPI dolore: media dei massimi al mattino, rosso se una seduta supera 5', () => {
  const ctx = carica(); ctx.PLAN = ctx.buildPlan();
  ctx.S.ben = [{ date: giorno(ctx, 0), dolmz: 'collo:2' }, { date: giorno(ctx, -1), dolmz: '' , dolm: 0 }];
  let v = ctx.kpiValori().dolore;
  assert.equal(v.v, 1);
  assert.equal(v.stato, 'ok');
  ctx.S.sess = [{ id: 'x', date: giorno(ctx, -2), dol: 6, dolz: 'polso_dx:6' }];
  v = ctx.kpiValori().dolore;
  assert.equal(v.stato, 'ko');
  assert.match(v.txt, /seduta max 6/);
});

test('il dolore della seduta parte dal massimo per zona degli esercizi', () => {
  const ctx = carica();
  const m = ctx.dolDaSeduta({ ex: [{ dol: { spalla_sx: 3 } }, { dol: { spalla_sx: 5, lombare: 2 } }, {}] });
  assert.equal(m.spalla_sx, 5);
  assert.equal(m.lombare, 2);
});
