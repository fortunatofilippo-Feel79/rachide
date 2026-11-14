const test = require('node:test');
const assert = require('node:assert/strict');
const { carica } = require('./carica');

function tuttiGliEsercizi(ctx) {
  ctx.PLAN = ctx.buildPlan();
  const n = new Set(Object.keys(ctx.EX).concat(Object.keys(ctx.G)));
  Object.keys(ctx.PLAN).forEach(d => ctx.PLAN[d].ex.forEach(e => n.add(e.n)));
  Object.keys(ctx.ALT).forEach(k => { n.add(k); ['bande', 'corpo'].forEach(m => { if (ctx.ALT[k][m]) n.add(ctx.ALT[k][m]); }); });
  ctx.WARM.forEach(w => n.add(w.n));
  return [...n].filter(x => ctx.G[x] || ctx.EX[x]);
}

test('ogni esercizio del piano, delle alternative e del riscaldamento ha la scheda sul corpo', () => {
  const ctx = carica();
  const senza = tuttiGliEsercizi(ctx).filter(n => ctx.G[n] && !ctx.tecHas(n));
  assert.equal(senza.join(' | '), '');
});

test('ogni scheda è completa: posizione, movimento, muscoli conosciuti, errori con la correzione', () => {
  const ctx = carica();
  const musc = Object.keys(ctx.TEC_MUSC);
  Object.keys(ctx.TEC).forEach(n => {
    const t = ctx.tecDef(n);
    assert.ok(t, n);
    assert.ok(t.corpo.length >= 3, n + ': posizione');
    t.corpo.forEach(r => assert.ok(r[0] && r[1] && r[1].length > 3, n + ': riga ' + r[0]));
    assert.ok(t.mov.length >= 1, n + ': movimento');
    t.mov.forEach(r => assert.equal(r.length, 4, n + ': fase ' + r[0]));
    assert.ok(t.m.length >= 1, n + ': muscoli');
    t.m.concat(t.m2 || []).forEach(k => assert.ok(musc.includes(k), n + ': muscolo ' + k));
    assert.ok(t.err.length >= 2, n + ': errori');
    t.err.forEach(r => assert.ok(r[0] && r[1], n + ': errore senza correzione'));
    assert.ok(ctx.G[n] || (t.da && ctx.G[t.da]), n + ': manca la scheda del coach');
  });
});

test('una variante eredita dalla base e cambia solo quello che dice', () => {
  const ctx = carica();
  const base = ctx.tecDef('Push-up'), v = ctx.tecDef('Push-up stretti');
  assert.equal(v.da, 'Push-up');
  assert.match(v.corpo.find(r => r[0] === 'Gomiti')[1], /costato/);
  assert.equal(v.corpo.find(r => r[0] === 'Testa')[1], base.corpo.find(r => r[0] === 'Testa')[1]);
  assert.equal(v.corpo.filter(r => r[0] === 'Gomiti').length, 1);
  assert.deepEqual(Array.from(v.m), ['tricipiti']);
  assert.ok(v.err.length > base.err.length);
  /* i nomi storici arrivano alla scheda dell'esercizio di cui usano la figura */
  assert.ok(ctx.tecHas('Chest Press manubri'));
});

test('la scheda e il promemoria in seduta si disegnano, con i quattro titoli', () => {
  const ctx = carica();
  const h = ctx.tecScheda('Rematore manubri');
  ['1 · Come ti metti', '2 · Come ti muovi', '3 · Cosa devi sentire', '4 · Stai sbagliando se', 'Le note del coach'].forEach(t => assert.ok(h.includes(t), t));
  assert.ok(h.includes('Lombare'), 'le zone dove non deve dare fastidio');
  assert.ok(!/undefined|NaN/.test(h));
  const b = ctx.tecBreve('Rematore manubri', 1);
  assert.match(b, /Schiena dritta, busto a 45°/);
  assert.match(b, /gran dorsale/);
  assert.ok(!/undefined|NaN/.test(ctx.tecMappa(['petto'], ['tricipiti'])));
});
