const test = require('node:test');
const assert = require('node:assert/strict');
const { carica, giorno } = require('./carica');

test('senza dati l\'indice non esce: servono almeno tre aree', () => {
  const ctx = carica();
  const ix = ctx.beneIndice();
  assert.equal(ix.indice, null);
  assert.equal(ix.aree.length, 6);
  assert.equal(ctx.beneLetture().length, 0);
});

test('ogni area dell\'indice usa KPI che esistono', () => {
  const ctx = carica();
  const ids = ctx.KPI.map(k => k.id);
  ctx.BENE_DOM.forEach(d => d.kpi.forEach(id => assert.ok(ids.includes(id), d.n + ': ' + id)));
  ctx.BENE_DOM.forEach(d => d.kpi.forEach(id => assert.equal(typeof ctx.BENE_CONS[id], 'function', 'manca il suggerimento per ' + id)));
});

test('con i dati: indice fra 0 e 100, al massimo tre suggerimenti, una per area', () => {
  const ctx = carica();
  for (let n = 40; n >= 0; n--) {
    const date = giorno(ctx, -n);
    ctx.S.ben.push({ date, w: ctx.weekOf(date), hrv: 55, rhr: 54, sonno: 5.8, stress: 2, mente: 2, refl: 2, camm: 0, resp: false, alc: false });
  }
  const ix = ctx.beneIndice();
  assert.ok(ix.indice >= 0 && ix.indice <= 100, String(ix.indice));
  assert.ok(ix.lette >= 3);
  const rec = ix.aree.find(a => a.k === 'recupero'), testa = ix.aree.find(a => a.k === 'testa');
  assert.ok(testa.punti < 60, 'stress alto e testa bassa: ' + testa.punti);
  assert.ok(rec.voci.find(v => v.id === 'sonno7').stato !== 'ok');
  const sg = ctx.beneSuggerimenti(ix);
  assert.ok(sg.length >= 1 && sg.length <= 3);
  assert.equal(new Set(sg.map(s => s.area)).size, sg.length);
});

test('letture incrociate: escono solo con abbastanza giornate per parte e una differenza che si vede', () => {
  const ctx = carica();
  /* notti corte con HRV bassa, notti lunghe con HRV alta */
  for (let n = 20; n >= 1; n--) {
    const date = giorno(ctx, -n), corta = n % 2 === 0;
    ctx.S.ben.push({ date, w: ctx.weekOf(date), hrv: corta ? 42 : 58, rhr: 54, sonno: corta ? 5.9 : 7.6, alc: false });
  }
  const l = ctx.beneLetture().find(x => x.t === 'Notti corte e HRV');
  assert.ok(l, 'manca la lettura');
  assert.match(l.m, /42.*58/);
  assert.match(l.n, /10 giornate contro 10/);
  /* con tre sole notti corte non si dice niente */
  const c2 = carica();
  for (let n = 20; n >= 1; n--) { const date = giorno(c2, -n), corta = n <= 3;
    c2.S.ben.push({ date, w: c2.weekOf(date), hrv: corta ? 42 : 58, sonno: corta ? 5.9 : 7.6, alc: false }); }
  assert.ok(!c2.beneLetture().some(x => x.t === 'Notti corte e HRV'));
});

test('l\'indice della settimana resta scritto e va al coach', () => {
  const ctx = carica();
  ctx.beneSegna(72);
  assert.equal(ctx.S.beneSett[ctx.weekOf(ctx.today())], 72);
  assert.equal(ctx.CFG_GRUPPI.impostazioni().beneSett[ctx.weekOf(ctx.today())], 72);
});
