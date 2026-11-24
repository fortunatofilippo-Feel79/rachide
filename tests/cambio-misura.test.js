const test = require('node:test');
const assert = require('node:assert/strict');
const { carica, giorno } = require('./carica');

/* orologio al 24/11/2026: cambio della misura il 07/11 */
const OGGI = new Date(2026, 10, 24, 9, 0, 0).getTime();

function riempi(ctx, prima, dopo) {
  for (let n = 60; n >= 0; n--) {
    const date = giorno(ctx, -n);
    const nuovo = ctx.s2d(date).getTime() >= ctx.s2d(ctx.CAMBIO_MISURA).getTime();
    ctx.S.ben.push({ date, w: ctx.weekOf(date), hrv: nuovo ? dopo.hrv : prima.hrv, rhr: nuovo ? dopo.rhr : prima.rhr, alc: false });
  }
}

test('la fascia HRV usa solo le notti dopo il cambio della misura', () => {
  const ctx = carica({ now: OGGI });
  riempi(ctx, { hrv: 55, rhr: 58 }, { hrv: 41, rhr: 62 });
  const hs = ctx.hrvStato(ctx.today());
  assert.ok(hs, 'servono 14 notti dopo il cambio');
  assert.equal(hs.norma, 41);
  assert.equal(ctx.rhrNorma(ctx.today()), 62);
  /* con la norma del nuovo firmware un 41 non e' un giorno rosso */
  assert.equal(ctx.recovery(ctx.today()).lvl, 0);
});

test('una data prima del cambio si legge con le notti di prima', () => {
  const ctx = carica({ now: OGGI });
  riempi(ctx, { hrv: 55, rhr: 58 }, { hrv: 41, rhr: 62 });
  assert.equal(ctx.rhrNorma('01/11/2026'), 58);
  assert.equal(ctx.hrvBase('01/11/2026'), 55);
});

test('riferimento fisso: provvisorio sotto le 28 notti, assente sotto le 14', () => {
  const ctx = carica({ now: OGGI });
  riempi(ctx, { hrv: 55, rhr: 58 }, { hrv: 41, rhr: 62 });
  const r = ctx.hrvRiferimento();
  assert.equal(r.v, 41);
  assert.equal(r.provv, true);
  assert.equal(r.n, 18);
  const c2 = carica({ now: OGGI });
  for (let n = 5; n >= 0; n--) { const date = giorno(c2, -n); c2.S.ben.push({ date, w: c2.weekOf(date), hrv: 40 }); }
  assert.equal(c2.hrvRiferimento(), null);
  assert.equal(c2.hrvCaloLento(), null);
});

test('riferimento bloccato alle prime 28 notti; avviso quando la media dei 14 giorni scende oltre il 15%', () => {
  const ora = new Date(2026, 11, 31, 9, 0, 0).getTime();
  const ctx = carica({ now: ora });
  for (let n = 54; n >= 0; n--) {
    const date = giorno(ctx, -n), t = ctx.s2d(date).getTime();
    const primi = t < ctx.s2d('05/12/2026').getTime();
    ctx.S.ben.push({ date, w: ctx.weekOf(date), hrv: primi ? 50 : (n < 14 ? 40 : 46), rhr: 60, alc: false });
  }
  const r = ctx.hrvRiferimento();
  assert.equal(r.v, 50);
  assert.equal(r.provv, false);
  const c = ctx.hrvCaloLento();
  assert.equal(c.m14, 40);
  assert.equal(c.scarto, -20);
  assert.equal(c.calo, true);
  assert.match(ctx.hrvCaloTesto(c), /calo lento.*40.*50/);
  /* solo un avviso: non e' fra i segnali che fanno il giorno rosso */
  assert.ok(!ctx.segnaliOggi().some(x => /calo/i.test(x.n)));
});

test('nessun avviso se la media resta entro il 15%', () => {
  const ora = new Date(2026, 11, 31, 9, 0, 0).getTime();
  const ctx = carica({ now: ora });
  for (let n = 54; n >= 0; n--) { const date = giorno(ctx, -n); ctx.S.ben.push({ date, w: ctx.weekOf(date), hrv: n < 14 ? 45 : 50, alc: false }); }
  assert.equal(ctx.hrvCaloLento().calo, false);
});
