const test = require('node:test');
const assert = require('node:assert/strict');
const { carica } = require('./carica');

/* 03/11/2026 e' martedi', settimana 40 (lun 02/11 ... dom 08/11); la 39 va dal 26/10 al 01/11 */
function ctx0() { const c = carica(); c.PLAN = c.buildPlan(); c.S.sess = []; c.S.log = []; c.S.pianoSett = {}; return c; }
const ses = (c, d, data, mod) => ({ id: 's' + d + data, w: c.weekOf(data), date: data, day: d, sede: 'Casa', mod: mod || 'Pesi', min: 60, en: 4 });
/* registra una seduta del piano con tutte le sue serie a RIR 2 */
function fai(c, d, data, l) {
  c.S.sess.push(ses(c, d, data, l === 'corpo' ? 'Corpo libero' : 'Pesi'));
  c.eserciziPer(d, l || 'casa').forEach((e, i) => (e.u ? ['S', 'D'] : ['']).forEach(sd => c.S.log.push({
    id: 'l' + d + data + i + sd, w: c.weekOf(data), date: data, day: d, ex: e.n, side: sd, band: '', load: e.L || 0,
    reps: Array(e.s).fill(e.lo), rir: 2, rirs: Array(e.s).fill(2), top: false, note: '' })));
}
const piano = (c, w, sedute) => { c.S.pianoSett[w] = { da: 'app', sedute: sedute.map(([d, data, l]) => ({ data, d, l: l || 'casa' })) }; };

test('piena: tutte le sedute del bersaglio', () => {
  const c = ctx0();
  [['A', '26/10/2026'], ['B', '27/10/2026'], ['C', '29/10/2026'], ['D', '31/10/2026']].forEach(([d, x]) => fai(c, d, x));
  assert.equal(c.statoSettimana(39).stato, 'piena');
});

test('piena anche con meno sedute, se tutti i gruppi arrivano al minimo', () => {
  const c = ctx0();
  fai(c, 'A', '26/10/2026'); fai(c, 'C', '28/10/2026'); fai(c, 'D', '30/10/2026');
  /* con A, C, D le gambe restano sotto: aggiungo 4 serie di squat alla D */
  c.S.log.push({ id: 'x', w: 39, date: '30/10/2026', day: 'D', ex: 'Box Squat', side: '', load: 28, reps: [8, 8, 8, 8], rirs: [2, 2, 2, 2], rir: 2 });
  c.S.log.push({ id: 'y', w: 39, date: '30/10/2026', day: 'D', ex: 'Side plank', side: '', load: 0, reps: [40, 40, 40, 40, 40, 40], rirs: [], rir: null });
  const s = c.statoSettimana(39);
  assert.deepEqual([...s.sotto], []);
  assert.equal(s.stato, 'piena');
});

test('tenuta: almeno 2 sedute e tutto il piano adattato fatto', () => {
  const c = ctx0();
  piano(c, 39, [['A', '26/10/2026'], ['C', '29/10/2026']]);
  fai(c, 'A', '26/10/2026'); fai(c, 'C', '29/10/2026');
  const s = c.statoSettimana(39);
  assert.equal(s.stato, 'tenuta');
  assert.ok(s.sotto.includes('Gambe'));
  assert.equal(c.weekDone(39).ok, true);
});

test('rotta: una seduta del piano saltata, o meno di 2 sedute, o nessun piano', () => {
  const c = ctx0();
  piano(c, 39, [['A', '26/10/2026'], ['C', '29/10/2026'], ['D', '31/10/2026']]);
  fai(c, 'A', '26/10/2026'); fai(c, 'C', '29/10/2026');
  assert.equal(c.statoSettimana(39).stato, 'rotta', 'la D saltata e la settimana non ricalcolata');
  const c2 = ctx0();
  piano(c2, 39, [['A', '26/10/2026']]); fai(c2, 'A', '26/10/2026');
  assert.equal(c2.statoSettimana(39).stato, 'rotta', 'una seduta sola');
  const c3 = ctx0();
  fai(c3, 'A', '26/10/2026'); fai(c3, 'C', '29/10/2026');
  assert.equal(c3.statoSettimana(39).stato, 'rotta', 'due sedute senza piano non bastano');
});

test('la settimana in corso resta aperta finche\' il piano non e\' fatto', () => {
  const c = ctx0();
  piano(c, 40, [['A', '02/11/2026'], ['C', '05/11/2026']]);
  fai(c, 'A', '02/11/2026');
  assert.equal(c.statoSettimana(40).stato, 'aperta');
  fai(c, 'C', '03/11/2026');   /* fatta oggi invece che giovedi': conta lo stesso */
  assert.equal(c.statoSettimana(40).stato, 'tenuta');
});

test('catena: le tenute contano, e dopo 3 di fila arriva l\'avviso', () => {
  const c = ctx0();
  const lun = w => c.settimanaDate(w).dal;
  const giorno = (w, k) => { const d = c.s2d(lun(w)); d.setDate(d.getDate() + k); return c.d2s(d); };
  /* 35 e 36 piene, 37 38 39 tenute */
  [35, 36].forEach(w => ['A', 'B', 'C', 'D'].forEach((d, i) => fai(c, d, giorno(w, i * 2 > 6 ? 6 : i * 2))));
  [37, 38, 39].forEach(w => { piano(c, w, [['A', giorno(w, 0)], ['C', giorno(w, 3)]]); fai(c, 'A', giorno(w, 0)); fai(c, 'C', giorno(w, 3)); });
  const k = c.streak();
  assert.equal(k.n, 5);
  assert.equal(k.tenute, 3);
  assert.equal(k.tenuteFila, 3);
  assert.equal(k.avviso, true);
  assert.equal(k.curOpen, true);
});

test('aderenza: sedute fatte su quelle del piano, non sempre su 4', () => {
  const c = ctx0();
  piano(c, 39, [['A', '26/10/2026'], ['C', '29/10/2026'], ['D', '31/10/2026']]);
  fai(c, 'A', '26/10/2026'); fai(c, 'C', '29/10/2026'); fai(c, 'D', '31/10/2026');
  const k = c.kpi(39);
  assert.equal(k.previste, 3);
  assert.equal(k.ader, 100);
  const c2 = ctx0(); fai(c2, 'A', '26/10/2026');
  assert.equal(c2.kpi(39).previste, 4);
  assert.equal(c2.kpi(39).ader, 25);
});

test('rischio: se mancano sedute per arrivare a 2, mezz\'ora a corpo libero oggi', () => {
  const c = ctx0();
  c.S.dispo = { 40: {} }; c.dateSettimana(40).forEach(d => { c.S.dispo[40][d] = 'no'; });
  const r = c.rischioSettimana(40);
  assert.equal(r.serve, 2, 'nessuna seduta e nessun giorno libero');
  const sd = c.seduta30();
  assert.ok(sd, 'oggi si puo\' fare');
  assert.equal(sd.l, 'corpo');
  const lista = c.listaSeduta(sd);
  assert.ok(c.minutiSeduta(lista) <= 30 * c.TOLL);
  lista.forEach(x => assert.ok(!x.b && !(x.L > 0), x.n));
  /* con due giorni liberi davanti non c'e' rischio */
  c.S.dispo[40]['05/11/2026'] = 'casa'; c.S.dispo[40]['07/11/2026'] = 'fuori';
  assert.equal(c.rischioSettimana(40).serve, 0);
});

test('nel pianificatore, l\'aggiunta di 30 minuti a corpo libero tiene la settimana', () => {
  const c = ctx0();
  c.S.dispo = { 40: {} }; c.dateSettimana(40).forEach(d => { c.S.dispo[40][d] = 'no'; });
  c.S.dispo[40]['05/11/2026'] = 'casa';
  c.sheet = () => {}; c.toast = () => {};
  c.pianoApri();
  assert.equal(c.PS.sedute.length, 1);
  assert.equal(c.statoPrevisto(40, c.PS.sedute, c.bilancioDa(c.PS.g)), 'rotta');
  c.piano30();
  assert.equal(c.PS.sedute.length, 2);
  const nuova = c.PS.sedute.find(e => e.data !== '05/11/2026');
  assert.equal(nuova.l, 'corpo');
  assert.equal(nuova.t, 30);
  assert.equal(c.statoPrevisto(40, c.PS.sedute, c.bilancioDa(c.PS.g)), 'tenuta');
});
