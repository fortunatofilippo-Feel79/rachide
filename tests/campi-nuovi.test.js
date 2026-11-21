const test = require('node:test');
const assert = require('node:assert/strict');
const { carica, giorno } = require('./carica');

test('ora d\'inizio e ultimo pasto: le ore fra i due (regola 52)', () => {
  const ctx = carica();
  assert.equal(ctx.oraTesto('9.05'), '09:05');
  assert.equal(ctx.oraTesto('17:30'), '17:30');
  assert.equal(ctx.oraTesto(0.75), '18:00', 'il foglio puo\' restituire l\'ora come frazione di giorno');
  assert.equal(ctx.orePasto({ ora: '17:30', pasto: '13:00' }), 4.5);
  assert.equal(ctx.orePasto({ ora: '17:30', pasto: '' }), null);
});

test('dolore di notte: progressioni ferme e segnale rosso nello stato di oggi (regola 19)', () => {
  const ctx = carica(); ctx.PLAN = ctx.buildPlan();
  ctx.S.ben = [{ date: giorno(ctx, 0), dolnotte: true }];
  ctx._PGC = null;
  assert.equal(ctx.dolNotteRecente(), true);
  const pg = ctx.progressioni();
  assert.equal(pg.notte, true);
  assert.equal(pg.scelta, null);
  assert.ok(ctx.segnaliOggi().some(s => s.k === 'notte' && s.lvl === 2));
});

test('i campi nuovi vanno e tornano dal foglio', () => {
  const ctx = carica(); ctx.PLAN = ctx.buildPlan();
  ctx.S.sess = [{ id: 's1', w: 40, date: giorno(ctx, 0), day: 'A', sede: 'Casa', mod: 'Pesi', min: 60, en: 4, ora: '17:30', pasto: '13:00' }];
  ctx.S.ben = [{ date: giorno(ctx, 0), dolnotte: true }];
  const p = ctx.SYNC.payloadAll();
  assert.equal(p.sess[0].ora, '17:30');
  assert.equal(p.sess[0].pasto, '13:00');
  assert.equal(ctx.SYNC.benRow(ctx.S.ben[0]).dolnotte, 'Sì');
});
