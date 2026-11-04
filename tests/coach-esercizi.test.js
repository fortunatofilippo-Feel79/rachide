const test = require('node:test');
const assert = require('node:assert/strict');
const { carica } = require('./carica');

const conPatch = (ops) => { const c = carica(); c.S.patches = [{ ts: '04/11/2026', nota: 'prova', ops }]; c.PLAN = c.buildPlan(); return c; };

test('ogni esercizio del catalogo ha una figura e una scheda tecnica (sue o dell\'esercizio di cui e\' variante)', () => {
  const c = carica(); c.PLAN = c.buildPlan();
  const manca = [];
  for (const n of Object.keys(c.EX)) {
    if (!c.figHas(n)) manca.push('figura: ' + n);
    if (!c.G[n] && !c.G[c.fgNome(n)]) manca.push('scheda: ' + n);
    if (!c.posHas(n)) manca.push('posizione: ' + n);
  }
  assert.deepEqual(manca, []);
});

test('il coach aggiunge una variante: usa la figura indicata, ha la sua scheda, e annullando la patch sparisce', () => {
  const op = { op: 'esercizio', n: 'Push-up con pausa in basso', come: 'Push-up', g: 'Petto', t: 'compl',
    p: 'Come il push-up, ma fermo 2 secondi a 3 cm dal pavimento.', f: 'Petto e tricipiti', e: 'Il bacino cede nella pausa', c: 'Stringi i glutei prima di scendere' };
  const add = { op: 'add', d: 'C', after: 'Push-up', ex: { n: 'Push-up con pausa in basso', s: 2, lo: 6, hi: 8 } };
  const c = conPatch([op, add]);
  const n = op.n;
  assert.ok(c.figHas(n), 'ha una figura');
  assert.equal(c.fgNome(n), 'Push-up', 'la figura e\' quella del push-up');
  assert.ok(c.posHas(n), 'ha la scheda Posizione');
  assert.equal(c.G[n].p, op.p);
  assert.equal(c.meta(n).g, 'Petto');
  assert.ok(c.PLAN.C.ex.some(e => e.n === n), 'e\' nel giorno C');
  assert.deepEqual({ ...c.figuraDi(n) }, { tipo: 'simile', da: 'Push-up' });
  assert.ok(c.figureDaFare().some(x => x.n === n && x.da === 'Push-up'), 'nel briefing: figura presa in prestito');
  const c0 = carica(); c0.PLAN = c0.buildPlan();   /* l'anteprima si vede prima di applicare */
  assert.match(c0.previewPatch({ ops: [op, add] }).join('\n'), /Esercizio nuovo: Push-up con pausa in basso \(Petto\) · figura di riferimento: Push-up · con scheda tecnica/);
  /* annullata la patch, il catalogo torna com'era */
  c.S.patches = []; c.PLAN = c.buildPlan();
  assert.ok(!c.EX[n] && !c.G[n] && !c.FIG_ALIAS[n] && !c.figHas(n));
});

test('senza "come" l\'esercizio nuovo ha la scheda ma non la figura, e il briefing lo segnala', () => {
  const c = conPatch([{ op: 'esercizio', n: 'Superman', g: 'Lombari', t: 'core', p: 'Prono, braccia avanti: alza braccia e gambe di pochi centimetri.' },
    { op: 'add', d: 'D', ex: { n: 'Superman', s: 2, lo: 20, hi: 30, sec: true } }]);
  assert.ok(!c.figHas('Superman'));
  assert.equal(c.G.Superman.p.slice(0, 5), 'Prono');
  assert.ok(c.figureDaFare().some(x => x.n === 'Superman' && !x.da));
  assert.match(c.briefing(), /Esercizi senza figura propria[\s\S]*- Superman: nessuna figura/);
});

test('una scheda del coach su un esercizio che esiste gia\' si toglie annullando la patch', () => {
  const c = carica(); c.PLAN = c.buildPlan();
  const prima = c.G['Kick back tricipiti'].p;
  c.S.patches = [{ ts: 'x', ops: [{ op: 'esercizio', n: 'Kick back tricipiti', p: 'Testo del coach' }] }]; c.PLAN = c.buildPlan();
  assert.equal(c.G['Kick back tricipiti'].p, 'Testo del coach');
  assert.ok(c.G['Kick back tricipiti'].f.length > 0, 'i campi non scritti restano quelli di prima');
  c.S.patches = []; c.PLAN = c.buildPlan();
  assert.equal(c.G['Kick back tricipiti'].p, prima);
  assert.ok(c.FIG['Kick back tricipiti'], 'la figura propria non si tocca');
});

test('controllo della patch: "come" deve indicare un esercizio con la figura; il vecchio "meta" nell\'add si annulla', () => {
  const c = carica(); c.PLAN = c.buildPlan();
  const ctl = c.patchControllo({ ops: [{ op: 'esercizio', n: 'X', come: 'Esercizio che non esiste' }, { op: 'esercizio', n: 'Y', come: 'Plank' }] });
  assert.match(ctl[0], /non ha una figura/);
  assert.equal(ctl[1], null);
  c.S.patches = [{ ts: 'x', ops: [{ op: 'add', d: 'A', ex: { n: 'Nuovo', s: 2, lo: 8, hi: 10 }, meta: { g: 'Spalle', t: 'iso' } }] }]; c.PLAN = c.buildPlan();
  assert.equal(c.meta('Nuovo').g, 'Spalle');
  c.S.patches = []; c.PLAN = c.buildPlan();
  assert.ok(!c.EX.Nuovo);
});
