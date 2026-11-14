const test = require('node:test');
const assert = require('node:assert/strict');
const { carica, giorno } = require('./carica');

function riga(ctx, id, gg, ex, load, reps, extra) {
  return Object.assign({ id, w: ctx.weekOf(giorno(ctx, gg)), date: giorno(ctx, gg), day: 'A', ex, side: '', band: '',
    load, reps, rir: 2, rirs: reps.map(() => 2), top: false, note: '', dolz: '', tec: null }, extra || {});
}
function ben(ctx, gg, extra) {
  return Object.assign({ date: giorno(ctx, gg), w: ctx.weekOf(giorno(ctx, gg)), hrv: null, rhr: null, sonno: null, stress: null, mente: null,
    refl: null, camm: null, alc: false, peso: null, dolm: null, dolmz: '' }, extra || {});
}
function listaA(ctx) { ctx.PLAN = ctx.buildPlan(); return ctx.PLAN.A.ex.map(e => Object.assign({}, e)); }

test('senza dati lo stato non inventa niente: nessun segnale letto, nessuna proposta', () => {
  const ctx = carica();
  const st = ctx.statoOggi();
  assert.equal(st.lvl, 0);
  assert.equal(st.letti, 0);
  assert.equal(ctx.proposteOggi(listaA(ctx)).length, 0);
});

test('tre notti corte e stress alto: giornata gialla, l\'app propone di accorciare', () => {
  const ctx = carica();
  ctx.S.ben = [ben(ctx, -2, { sonno: 6.2, stress: 2 }), ben(ctx, -1, { sonno: 6.0, stress: 2 }), ben(ctx, 0, { sonno: 6.3, stress: 2, hrv: 50, rhr: 55 })];
  const st = ctx.statoOggi();
  assert.ok(st.lvl >= 1, st.titolo);
  const lista = listaA(ctx), pr = ctx.proposteOggi(lista);
  const acc = pr.find(p => p.tipo === 'accorcia');
  assert.ok(acc, 'manca la proposta di accorciare: ' + pr.map(p => p.tipo));
  /* niente cambia finché non autorizzi */
  assert.deepEqual(Array.from(ctx.stoApplicaLista(lista), x => x.s), lista.map(x => x.s));
  ctx.stoDecidi(acc.id, 'ok');
  const corta = ctx.stoApplicaLista(lista);
  assert.equal(corta[0].s, lista[0].s, 'il primo esercizio resta intero');
  assert.ok(corta.slice(1).every((x, i) => x.s === Math.max(Math.min(2, lista[i + 1].s), lista[i + 1].s - 1)));
  /* rifiutata: resta il piano */
  ctx.stoDecidi(acc.id, 'no');
  assert.deepEqual(Array.from(ctx.stoApplicaLista(lista), x => x.s), lista.map(x => x.s));
});

test('recupero basso: i carichi si fermano solo se autorizzi la proposta', () => {
  const ctx = carica();
  for (let g = -30; g < 0; g++) ctx.S.ben.push(ben(ctx, g, { hrv: 55 + (g % 3), rhr: 54, sonno: 7.5 }));
  ctx.S.ben.push(ben(ctx, 0, { hrv: 35, rhr: 62, sonno: 7.2 }));
  ctx.PLAN = ctx.buildPlan();
  assert.ok(ctx.recoveryOggi(), 'HRV giù e FC su: livello 2');
  ctx._PGC = null;
  assert.equal(ctx.progressioni().recupero, null, 'senza autorizzazione nessun blocco');
  const pr = ctx.proposteOggi(listaA(ctx)).find(p => p.tipo === 'fermi');
  assert.ok(pr);
  ctx.stoDecidi(pr.id, 'ok'); ctx._PGC = null;
  assert.ok(ctx.progressioni().recupero, 'autorizzata: carichi fermi per oggi');
});

test('scendere di carico: proposto solo dopo una salita recente con esecuzione che non tiene', () => {
  const ctx = carica();
  const def = listaA(ctx).find(e => e.n === 'Rematore manubri');
  ctx.S.log = [
    riga(ctx, 'a', -12, 'Rematore manubri', 16, [10, 10, 10, 10], { top: true }),
    riga(ctx, 'b', -8, 'Rematore manubri', 16, [10, 10, 10, 10], { top: true }),
    riga(ctx, 'c', -4, 'Rematore manubri', 18, [8, 8, 8, 8], { tec: 0 })
  ];
  assert.equal(ctx.scendiCandidato(def), null, 'salita regolare ed esecuzione pulita: nessuna proposta');
  ctx.S.log[2] = riga(ctx, 'c', -4, 'Rematore manubri', 18, [7, 6, 6, 6], { tec: 2 });
  const c = ctx.scendiCandidato(def);
  assert.ok(c, 'esecuzione sporca e sotto il range');
  assert.equal(c.prev, 16);
  const id = 'scendi|Rematore manubri|18';
  assert.equal(ctx.stoCarico(def, 18), 18, 'non autorizzata: resta il carico');
  ctx.stoDecidi(id, 'ok');
  assert.equal(ctx.stoCarico(def, 18), 16, 'autorizzata: si riparte dal gradino sotto');
  /* rifiutata: non si ripropone per due settimane */
  ctx.stoDecidi(id, 'no');
  assert.ok(!ctx.proposteOggi(listaA(ctx)).some(p => p.id === id));
});

test('uno stallo vecchio non è una proposta di scendere: la salita deve essere recente', () => {
  const ctx = carica();
  const def = listaA(ctx).find(e => e.n === 'Rematore manubri');
  ctx.S.log = [riga(ctx, 'a', -40, 'Rematore manubri', 16, [10, 10, 10, 10], { top: true })];
  [-30, -24, -18, -12, -6].forEach((g, i) => ctx.S.log.push(riga(ctx, 'x' + i, g, 'Rematore manubri', 18, [7, 7, 6, 6], { tec: 2 })));
  assert.equal(ctx.scendiCandidato(def), null);
});

test('una zona dolente al mattino: gli esercizi che la caricano si cambiano dove c\'è un\'alternativa', () => {
  const ctx = carica();
  ctx.S.ben = [ben(ctx, 0, { dolm: 5, dolmz: 'lombare:5', sonno: 7.5 })];
  const lista = listaA(ctx);
  const pr = ctx.proposteOggi(lista).find(p => p.tipo === 'zona');
  assert.ok(pr && pr.zona === 'lombare');
  assert.ok(pr.cambi.length + pr.restano.length > 0);
  pr.cambi.forEach(c => { const pd = ctx.posDef(c[1]); assert.ok(!(pd && pd.no && pd.no.includes('lombare')), c[1] + ' carica la lombare'); });
  ctx.stoDecidi(pr.id, 'ok');
  const nuova = ctx.stoApplicaLista(lista);
  assert.equal(nuova.length, lista.length, 'nessun esercizio sparisce');
  pr.cambi.forEach(c => assert.ok(nuova.some(x => x.n === c[1] && x.da === c[0])));
});

test('le decisioni vanno al coach e nella memoria sul foglio', () => {
  const ctx = carica();
  ctx.stoDecidi('accorcia|' + ctx.today(), 'ok');
  assert.match(ctx.stoTestoCoach().join(' '), /accorcia → autorizzata/);
  assert.ok(ctx.CFG_GRUPPI.proposte()['accorcia|' + ctx.today()]);
  ctx.cfgApplica('proposte', { 'x|1': { r: 'no', d: ctx.today() } });
  assert.equal(ctx.stoDecisa('x|1'), 'no');
});
