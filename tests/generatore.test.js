const test = require('node:test');
const assert = require('node:assert/strict');
const { carica } = require('./carica');

/* 03/11/2026 e' martedi', settimana 40: lun 02/11 ... dom 08/11 */
const W = 40;
function ctxSett() { const c = carica(); c.PLAN = c.buildPlan(); return c; }
function fattaA(c) {
  c.S.sess = [{ id: 's', w: W, date: '02/11/2026', day: 'A', sede: 'Casa', mod: 'Pesi', min: 60, en: 4 }];
  c.S.log = [];
  c.PLAN.A.ex.forEach((e, i) => (e.u ? ['S', 'D'] : ['']).forEach(sd => c.S.log.push({
    id: 'l' + i + sd, w: W, date: '02/11/2026', day: 'A', ex: e.n, side: sd, band: e.b || '', load: e.L || 0,
    reps: Array(e.s).fill(e.lo), rir: 2, rirs: Array(e.s).fill(2), top: false, note: '' })));
}
const settimana = (c, posti) => { const o = {}; c.dateSettimana(W).forEach((d, i) => { o[d] = posti[i]; }); return o; };
const deficit = b => Object.values(b.gruppi).reduce((s, r) => s + Math.max(0, r.min - r.tot), 0);

test('il tempo stimato torna con i minuti del coach', () => {
  const c = ctxSett();
  const m = d => c.minutiSeduta(c.sedutaBase(d, 'casa'));
  for (const d of ['A', 'B', 'C', 'D', 'E1', 'E2']) {
    assert.ok(Math.abs(m(d) - c.PLAN[d].min) <= 6, d + ': ' + m(d).toFixed(1) + ' contro ' + c.PLAN[d].min);
  }
});

test('ogni seduta sta nel tempo del suo giorno e usa solo l\'attrezzo che hai', () => {
  const c = ctxSett(); fattaA(c);
  const casi = [
    { posti: ['casa', 'casa', 'no', 'no', 'no', 'fuori', 'fuori0'], tempo: {} },
    { posti: ['casa', 'fuori0', 'no', 'fuori0', 'no', 'fuori0', 'no'], tempo: { '03/11/2026': 30, '05/11/2026': 30, '07/11/2026': 30 } },
    { posti: ['casa', 'fuori', 'fuori', 'fuori', 'fuori', 'fuori', 'fuori'], tempo: {} },
    { posti: ['casa', 'no', 'no', 'no', 'casa', 'no', 'no'], tempo: { '06/11/2026': 90 } }
  ];
  for (const k of casi) {
    const g = c.generaSettimana(W, { dispo: settimana(c, k.posti), tempo: k.tempo });
    assert.ok(g.sedute.length > 0);
    for (const s of g.sedute) {
      const lista = c.listaSeduta(s), posto = settimana(c, k.posti)[s.data];
      assert.notEqual(posto, 'no', 'mai in un giorno occupato');
      assert.ok(c.POSTO_MOD[posto].includes(s.l), s.data + ': ' + s.l + ' non disponibile ' + posto);
      assert.ok(c.minutiSeduta(lista) <= s.t * c.TOLL + 0.01, s.d + ' ' + s.data + ': ' + c.minutiSeduta(lista).toFixed(1) + ' su ' + s.t);
      if (s.l !== 'casa') lista.forEach(x => assert.ok(!(x.L > 0), s.d + ' ' + s.l + ': ' + x.n + ' vuole i manubri'));
      if (s.l === 'corpo') lista.forEach(x => assert.ok(!x.b, s.d + ' corpo libero: ' + x.n + ' vuole la banda'));
      const cs = c.contributi(lista);
      Object.keys(cs).forEach(gg => assert.ok(cs[gg] <= Math.max(c.CAP_SEDUTA, c.contributi(c.sedutaBase(s.d, s.l))[gg] || 0) + 0.01, s.d + ' ' + gg + ' troppe serie nella stessa seduta'));
    }
  }
});

test('con tutti i giorni liberi la settimana chiude tutti i gruppi e distanzia le sedute', () => {
  const c = ctxSett(); fattaA(c);
  const g = c.generaSettimana(W, { dispo: settimana(c, ['casa', 'casa', 'casa', 'casa', 'casa', 'casa', 'casa']) });
  assert.equal(g.sedute.length, 3);
  assert.deepEqual([...c.bilancioDa(g).buchi], []);
  const t = g.sedute.map(s => c.s2d(s.data).getTime()).sort();
  for (let i = 1; i < t.length; i++) assert.ok(t[i] - t[i - 1] >= 2 * 86400000, 'giorno di riposo fra le sedute');
});

test('un solo giorno libero: sceglie la seduta e gli esercizi che lasciano meno buchi', () => {
  const c = ctxSett(); fattaA(c);
  const dispo = settimana(c, ['casa', 'no', 'no', 'no', 'casa', 'no', 'no']);
  const g = c.generaSettimana(W, { dispo });
  assert.equal(g.sedute.length, 1);
  assert.equal(g.fuori.length, 2);
  /* la vecchia regola teneva la B: qui il bilancio deve essere migliore */
  const vecchia = c.bilancio(W, [{ data: '06/11/2026', d: 'B', l: 'casa' }]);
  assert.ok(deficit(c.bilancioDa(g)) < deficit(vecchia), deficit(c.bilancioDa(g)) + ' contro ' + deficit(vecchia));
  /* con 90 minuti chiude tutto */
  const g90 = c.generaSettimana(W, { dispo, tempo: { '06/11/2026': 90 } });
  assert.deepEqual([...c.bilancioDa(g90).buchi], []);
  assert.ok(g90.sedute[0].agg.length > 0, 'aggiunge esercizi per i gruppi delle sedute che non entrano');
});

test('nei giorni corti restano i multiarticolari: il primo esercizio non si toglie', () => {
  const c = ctxSett(); fattaA(c);
  const tempo = { '03/11/2026': 30, '05/11/2026': 30, '07/11/2026': 30 };
  const g = c.generaSettimana(W, { dispo: settimana(c, ['casa', 'casa', 'no', 'casa', 'no', 'casa', 'no']), tempo });
  for (const s of g.sedute) {
    const lista = c.listaSeduta(s), primo = c.sedutaBase(s.d, s.l)[0].n;
    assert.ok(lista.some(x => x.n === primo), s.d + ': manca ' + primo);
    lista.forEach(x => assert.ok(x.s >= c.SERIE_MIN, x.n + ' con meno di 2 serie'));
  }
});

test('le modifiche salvate ricostruiscono la stessa seduta', () => {
  const c = ctxSett(); fattaA(c);
  const g = c.generaSettimana(W, { dispo: settimana(c, ['casa', 'no', 'no', 'no', 'casa', 'no', 'no']), tempo: { '06/11/2026': 90 } });
  const s = g.sedute[0];
  const salvata = JSON.parse(JSON.stringify({ data: s.data, d: s.d, l: s.l, t: s.t, agg: s.agg, ser: s.ser, via: s.via }));
  const lista = c.listaSeduta(salvata);
  assert.equal(Math.round(c.minutiSeduta(lista)), s.min);
  assert.ok(c.cambiTesto(salvata).length > 0);
  /* un esercizio aggiunto si porta dietro le serie del piano per la progressione */
  lista.filter(x => x.agg).forEach(x => assert.ok(x.sPiano >= 2, x.n));
});

test('sedute fissate e luogo scelto a mano vengono rispettati', () => {
  const c = ctxSett(); fattaA(c);
  const dispo = settimana(c, ['casa', 'casa', 'casa', 'casa', 'casa', 'casa', 'casa']);
  const g = c.generaSettimana(W, { dispo, fissa: { C: '04/11/2026' }, forza: { '04/11/2026': 'bande' } });
  const sc = g.sedute.find(s => s.d === 'C');
  assert.equal(sc.data, '04/11/2026');
  assert.equal(sc.l, 'bande');
  /* il piano che c'e' gia' resta, se funziona */
  const pref = [{ data: '05/11/2026', d: 'B' }, { data: '07/11/2026', d: 'C' }, { data: '08/11/2026', d: 'D' }];
  const g2 = c.generaSettimana(W, { dispo, pref });
  assert.deepEqual([...g2.sedute.map(s => s.d + s.data.slice(0, 2))], ['B05', 'C07', 'D08']);
});

test('la seduta di oggi segue il piano adattato e si riadatta se cambi attrezzo', () => {
  const c = ctxSett(); fattaA(c);
  const g = c.generaSettimana(W, { dispo: settimana(c, ['casa', 'casa', 'no', 'no', 'no', 'no', 'no']), tempo: { '03/11/2026': 90 } });
  assert.equal(g.sedute[0].data, '03/11/2026');
  c.S.pianoSett = { [W]: { da: 'app', sedute: g.sedute.map(s => ({ data: s.data, d: s.d, l: s.l, t: s.t, agg: s.agg, ser: s.ser, via: s.via })) } };
  const d = g.sedute[0].d;
  const casa = c.listaPerOggi(d, 'casa');
  assert.deepEqual(casa.map(x => x.n + x.s), c.listaSeduta(c.S.pianoSett[W].sedute[0]).map(x => x.n + x.s));
  const corpo = c.listaPerOggi(d, 'corpo');
  corpo.forEach(x => assert.ok(!x.b && !(x.L > 0), 'corpo libero: ' + x.n));
  assert.ok(c.minutiSeduta(corpo) <= 90 * c.TOLL);
});

test('chiusura della domenica: giorni e tempi per la settimana dopo arrivano al coach con una proposta', () => {
  const c = ctxSett(); fattaA(c);
  c.S.dispo = { 41: {} }; c.S.tempo = { 41: {} };
  c.dateSettimana(41).forEach((d, i) => { c.S.dispo[41][d] = ['casa', 'fuori', 'no', 'casa', 'fuori0', 'no', 'casa'][i]; c.S.tempo[41][d] = [60, 30, 60, 90, 30, 60, 60][i]; });
  const t = c.briefingPiano();
  assert.match(t, /DISPONIBILITA' SETTIMANA 41/);
  assert.match(t, /mar fuori-bande 30′/);
  assert.match(t, /proposta dell'app per la settimana 41/);
  assert.match(t, /"giorni":\{"lun":"casa 60"/);
});

test('operazione del coach con giorni e tempi: le sedute restano sue, gli esercizi si adattano', () => {
  const c = ctxSett(); fattaA(c);
  const op = { op: 'settimana', w: 41, giorni: { lun: 'casa 60', mar: 'fuori 30', mer: 'no', gio: 'fuori niente', ven: 'casa 90' },
    sedute: [{ g: 'lun', d: 'A', l: 'casa' }, { g: 'mar', d: 'B', l: 'bande', t: 30 }, { g: 'ven', d: 'C', l: 'casa' }, { g: 'sab', d: 'D', l: 'casa' }] };
  const p = c.pianoDaOp(op);
  assert.equal(p.err.length, 0);
  assert.equal(p.dispo['11/11/2026'], 'no');
  assert.equal(p.dispo['12/11/2026'], 'fuori0');
  assert.equal(p.tempo['13/11/2026'], 90);
  c.pianoApplica(op);
  const sed = c.S.pianoSett[41].sedute;
  assert.deepEqual([...sed.map(e => e.d + e.data.slice(0, 2))], ['A09', 'B10', 'C13', 'D14']);
  const b = sed.find(e => e.d === 'B');
  assert.equal(b.t, 30);
  assert.ok(c.minutiSeduta(c.listaSeduta(b)) <= 30 * c.TOLL, 'la B in 30 minuti');
  assert.equal(c.tempoGiorno(41, '13/11/2026'), 90);
});

test('il top di un esercizio con meno serie del solito non vale come promozione', () => {
  const c = ctxSett();
  /* 2 serie al top su un esercizio da 4: con le serie del piano non e' top */
  assert.equal(c.isTop([10, 10], 10, 4), false);
  assert.equal(c.isTop([10, 10], 10, 2), true);
});
