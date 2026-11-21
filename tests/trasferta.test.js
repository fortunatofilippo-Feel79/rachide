const test = require('node:test');
const assert = require('node:assert/strict');
const { carica } = require('./carica');

/* 03/11/2026 e' martedi', settimana 40: lun 02/11 ... dom 08/11 */
function ctxSett() { const ctx = carica(); ctx.PLAN = ctx.buildPlan(); return ctx; }
const sess = (ctx, d, data, mod) => ({ id: 's' + d + data, w: ctx.weekOf(data), date: data, day: d,
  sede: d[0] === 'T' ? 'Trasferta' : 'Casa', mod: mod || (d[0] === 'T' ? 'Bande' : 'Pesi'), min: 40, en: 4 });

test('T2 copre la C, una seconda T2 la D; T1 copre la A, poi la B', () => {
  const ctx = ctxSett();
  ctx.S.sess = [sess(ctx, 'T2', '02/11/2026'), sess(ctx, 'T2', '03/11/2026'), sess(ctx, 'T1', '04/11/2026')];
  assert.equal(ctx.sedutaFatta(40, 'C'), true);
  assert.equal(ctx.sedutaFatta(40, 'D'), true);
  assert.equal(ctx.sedutaFatta(40, 'A'), true);
  assert.equal(ctx.sedutaFatta(40, 'B'), false, 'la B manca ancora');
  const p = ctx.generaSettimana(40);
  assert.deepEqual([...p.mancano], ['B'], 'la settimana si ricalibra sulla sola B');
});

test('se la C e\' gia\' fatta, la T2 copre la D', () => {
  const ctx = ctxSett();
  ctx.S.sess = [sess(ctx, 'C', '02/11/2026'), sess(ctx, 'T2', '03/11/2026')];
  assert.equal(ctx.sedutaCoperta(40, 'D'), true);
  assert.equal(ctx.sedutaCoperta(40, 'A'), false, 'la T2 non copre la parte di spinta e gambe');
});

test('una trasferta prevista dal piano vale per se\', quelle in piu\' coprono le sedute di casa', () => {
  const ctx = ctxSett();
  ctx.S.pianoSett = { 40: { sedute: [{ data: '02/11/2026', d: 'T2', l: 'bande' }, { data: '05/11/2026', d: 'C', l: 'casa' }] } };
  ctx.S.sess = [sess(ctx, 'T2', '02/11/2026')];
  assert.equal(ctx.sedutaCoperta(40, 'C'), false, 'la T2 del piano non mangia la C');
  ctx.S.sess.push(sess(ctx, 'T2', '03/11/2026'));
  assert.equal(ctx.sedutaCoperta(40, 'C'), true, 'la seconda T2 copre la C');
});

test('un riposo segnato sulla C fa coprire alla T2 la D', () => {
  const ctx = ctxSett();
  ctx.S.sess = [sess(ctx, 'C', '02/11/2026', 'Riposo'), sess(ctx, 'T2', '03/11/2026')];
  assert.equal(ctx.sedutaCoperta(40, 'D'), true);
});
