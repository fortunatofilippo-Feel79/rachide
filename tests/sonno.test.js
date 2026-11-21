const test = require('node:test');
const assert = require('node:assert/strict');
const { carica } = require('./carica');

test('il sonno si scrive in ore.minuti: 6,4 vuol dire 6 h 40', () => {
  const ctx = carica();
  const ore = v => Math.round(ctx.sonnoOre(v) * 60);
  assert.equal(ore('6,4'), 400, '6,4 = 6 h 40');
  assert.equal(ore(6.4), 400, 'dal foglio come numero');
  assert.equal(ore('6.40'), 400);
  assert.equal(ore('6.47'), 407, '6.47 = 6 h 47');
  assert.equal(ore('6.05'), 365, '6.05 = 6 h 05');
  assert.equal(ore('6:40'), 400);
  assert.equal(ore('7'), 420);
  assert.equal(ctx.sonnoOre(''), null);
  assert.equal(ctx.sonnoOre(null), null);
  assert.equal(ctx.sonnoHM(6 + 40 / 60), '6.40');
  assert.equal(ctx.sonnoTxt(6 + 5 / 60), '6 h 05');
});

test('6 h 40 non e\' sonno corto: la soglia di 6 h 30 si confronta in ore vere', () => {
  const ctx = carica();
  const h = ctx.sonnoOre('6,4');
  assert.ok(h > ctx.SONNO_BASSO, '6 h 40 e\' sopra 6 h 30');
  assert.ok(ctx.sonnoOre('6.2') < ctx.SONNO_BASSO, '6 h 20 e\' sotto');
});

test('lo storico in ore.minuti si converte una volta sola e torna sul foglio uguale', () => {
  const ctx = carica();
  ctx.S.ben = [{ date: '01/11/2026', sonno: 6.4 }, { date: '02/11/2026', sonno: 7.15 }, { date: '03/11/2026', sonno: null }];
  delete ctx.S.sonnoV;
  assert.equal(ctx.migraSonno(), true);
  assert.equal(Math.round(ctx.S.ben[0].sonno * 60), 400);
  assert.equal(Math.round(ctx.S.ben[1].sonno * 60), 435);
  assert.equal(ctx.S.ben[2].sonno, null);
  assert.equal(ctx.migraSonno(), false, 'la seconda volta non tocca niente');
  assert.equal(Math.round(ctx.S.ben[0].sonno * 60), 400);
  assert.equal(ctx.SYNC.benRow(ctx.S.ben[0]).sonno, '6.40', 'sul foglio resta in ore.minuti');
});
