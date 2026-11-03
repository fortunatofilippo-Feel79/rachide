const test = require('node:test');
const assert = require('node:assert/strict');
const { carica, giorno } = require('./carica');

test('ogni KPI ha una storia e un grafico senza valori non validi', () => {
  const ctx = carica(); ctx.PLAN = ctx.buildPlan();
  const w = ctx.weekOf(ctx.today());
  ctx.S.sess = []; ctx.S.log = []; ctx.S.ben = [];
  for (let i = 0; i < 70; i++) ctx.S.ben.push({ date: giorno(ctx, -i), w: ctx.weekOf(giorno(ctx, -i)), hrv: 50 + (i % 6), rhr: 52 + (i % 3), sonno: 6.5 + (i % 4) / 2, peso: 66 + (i % 5) / 10, refl: i % 3, stress: i % 4, camm: i % 3, cibP: 120, cibC: 330, cibG: 60 });
  for (const d of ctx.KPI) {
    const s = ctx.kpiStoria(d.id);
    assert.ok(['line', 'bar', 'peso', 'dolore', 'vuoto'].includes(s.tipo), d.id + ': tipo ' + s.tipo);
    const g = ctx.kpiGrafico(d.id);
    assert.ok(g.length > 10, d.id);
    assert.ok(!/NaN|undefined|Infinity/.test(g), d.id + ' ha valori non validi');
    assert.ok(!/NaN|undefined|Infinity/.test(ctx.kpiSpark(d.id)), d.id + ' miniatura');
  }
});

test('grafico a linea: con meno di due punti dice cosa serve, con buchi non si spezza', () => {
  const ctx = carica();
  assert.match(ctx.gLine([{ x: 0, y: 1 }]), /Servono/);
  const s = ctx.gLine([{ x: 0, y: 1, l: 'a' }, { x: 1, y: null }, { x: 2, y: 3 }, { x: 3, y: 2, l: 'b' }], { band: [1.5, 2.5], ref: [{ y: 2, t: 'x' }] });
  assert.match(s, /<svg/);
  assert.equal((s.match(/<polyline/g) || []).length, 1, 'il segmento con un solo punto non fa una linea');
});

test('barre impilate e calendario a colori', () => {
  const ctx = carica();
  const b = ctx.gBars([{ l: '1', v: 3, parts: [{ v: 1, c: 'red' }, { v: 2, c: 'blue' }] }, { l: '2', v: 0 }], { line: 2 });
  assert.equal((b.match(/<rect/g) || []).length >= 2, true);
  assert.match(ctx.gBars([], {}), /Servono/);
  const h = ctx.gHeat([{ cells: [{ c: 'red', t: 'x' }, null, null, null, null, null, null], l: '40', cur: true }]);
  assert.match(h, /max-width/);
});

test('forza stimata: formula di Epley sulla serie migliore del giorno', () => {
  const ctx = carica();
  ctx.S.log = [
    { id: 'a', date: giorno(ctx, -9), ex: 'Box Squat', load: 28, reps: [10, 10, 8] },
    { id: 'b', date: giorno(ctx, -2), ex: 'Box Squat', load: 30, reps: [8, 8, 8] },
    { id: 'c', date: giorno(ctx, -2), ex: 'Box Squat', load: 20, reps: [30] }
  ];
  const s = ctx.e1rmStoria('Box Squat');
  assert.equal(s.length, 2);
  assert.equal(Math.round(s[0].y * 100) / 100, Math.round(28 * (1 + 10 / 30) * 100) / 100);
  assert.equal(Math.round(s[1].y * 100) / 100, 38);
});

test('stato dei gruppi: a settimana chiusa conta il fatto, in corso conta dove stai andando', () => {
  const ctx = carica();
  assert.equal(ctx.statoGruppo('Petto', 8, null, false), 'sotto');
  assert.equal(ctx.statoGruppo('Petto', 12, null, false), 'ok');
  assert.equal(ctx.statoGruppo('Petto', 22, null, false), 'sopra');
  assert.equal(ctx.statoGruppo('Petto', 4, 12, true), 'rotta', 'poche serie ma il piano le copre');
  assert.equal(ctx.statoGruppo('Petto', 4, 7, true), 'buco');
  assert.equal(ctx.statoGruppo('Petto', 11, 12, true), 'ok');
});

test('serie per gruppo con dirette e indirette separate', () => {
  const ctx = carica();
  const sp = ctx.serieGruppoSplit([{ ex: 'Floor Press manubri', side: '', reps: [10, 10, 10, 10], rirs: [2, 2, 2, 2] }]);
  assert.deepEqual([sp.Petto.dir, sp.Petto.ind, sp.Tricipiti.ind], [4, 0, 2]);
});

test('il valore breve del cruscotto', () => {
  const ctx = carica();
  const d = id => ctx.KPI.find(k => k.id === id);
  assert.equal(ctx.kpiBreve(d('aderenza'), { v: 100 }), '100%');
  assert.equal(ctx.kpiBreve(d('serie_gruppo'), { v: 5 }), '5/7');
  assert.equal(ctx.kpiBreve(d('pendenza'), { v: 69 }), '+69 g/sett');
  assert.equal(ctx.kpiBreve(d('proteine'), { v: 1.8 }), '1,8 g/kg');
  assert.equal(ctx.kpiBreve(d('aderenza'), { v: null }), '–');
});
