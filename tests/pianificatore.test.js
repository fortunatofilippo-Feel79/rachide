const test = require('node:test');
const assert = require('node:assert/strict');
const { carica, giorno } = require('./carica');

/* 03/11/2026 e' martedi', settimana 40: lun 02/11 ... dom 08/11 */
function ctxSett(opt) { const ctx = carica(opt); ctx.PLAN = ctx.buildPlan(); return ctx; }
const sess = (ctx, d, data, mod) => ({ id: 's' + d + data, w: ctx.weekOf(data), date: data, day: d, sede: 'Casa', mod: mod || 'Pesi', min: 60, en: 4 });

test('le date della settimana vanno da lunedi\' a domenica', () => {
  const ctx = ctxSett();
  const d = ctx.dateSettimana(40);
  assert.deepEqual([d[0], d[6]], ['02/11/2026', '08/11/2026']);
  assert.equal(ctx.ggDi('04/11/2026'), 'mer');
  assert.equal(ctx.dataDaGG(40, 'gio'), '05/11/2026');
});

test('proposta: le sedute che mancano si distribuiscono sui giorni che restano', () => {
  const ctx = ctxSett();
  ctx.S.sess = [sess(ctx, 'A', '02/11/2026')];                     // lunedi' fatta
  const p = ctx.generaSettimana(40);
  assert.deepEqual([...p.mancano], ['B', 'C', 'D']);
  assert.equal(p.sedute.length, 3);
  assert.equal(p.fuori.length, 0);
  const giorni = p.sedute.map(s => s.data);
  assert.ok(new Set(giorni).size === 3, 'un giorno per seduta');
  assert.ok(giorni.every(d => ctx.giorniFa(d) <= 0), 'solo oggi o dopo');
});

test('proposta: se hai gia\' fatto la seduta oggi, oggi non conta', () => {
  const ctx = ctxSett();
  ctx.S.sess = [sess(ctx, 'A', ctx.today())];
  const p = ctx.generaSettimana(40);
  assert.ok(!p.dates.includes(ctx.today()));
});

test('proposta: i giorni occupati si saltano, fuori casa = bande, fuori senza niente = corpo libero', () => {
  const ctx = ctxSett();
  const dispo = {}; ctx.dateSettimana(40).forEach(d => { dispo[d] = 'no'; });
  dispo['04/11/2026'] = 'fuori'; dispo['06/11/2026'] = 'fuori0'; dispo['08/11/2026'] = 'casa';
  const p = ctx.generaSettimana(40, { dispo });
  assert.ok(!p.sedute.some(s => dispo[s.data] === 'no'));
  assert.equal(p.sedute.find(s => s.data === '04/11/2026').l, 'bande');
  assert.equal(p.sedute.find(s => s.data === '06/11/2026').l, 'corpo');
});

test('proposta: se i giorni non bastano si segnalano le sedute che non entrano', () => {
  const ctx = ctxSett();
  const dispo = {}; ctx.dateSettimana(40).forEach(d => { dispo[d] = 'no'; });
  dispo['06/11/2026'] = 'casa'; dispo['08/11/2026'] = 'casa';
  const p = ctx.generaSettimana(40, { dispo });
  assert.equal(p.sedute.length, 2);
  assert.equal(p.fuori.length, 2);
});

test('bilancio: somma il fatto e il previsto e segnala i buchi', () => {
  const ctx = ctxSett();
  ctx.S.log = [];
  const sedute = [{ data: '05/11/2026', d: 'C', l: 'corpo', ora: '07:30' }];
  const b = ctx.bilancio(40, sedute);
  assert.ok(b.buchi.includes('Gambe'), 'con una sola seduta di corpo libero le gambe restano sotto');
});

test('un piano completo di 4 sedute a casa riempie tutti i gruppi', () => {
  const ctx = ctxSett();
  ctx.S.log = [];
  const sedute = ['A', 'B', 'C', 'D'].map((d, i) => ({ data: ctx.dateSettimana(40)[i * 2 > 6 ? 6 : i * 2], d, l: 'casa', ora: '07:30' }));
  const b = ctx.bilancio(40, sedute);
  assert.deepEqual([...b.buchi], []);
});

test('operazione settimana del coach: giorni, luoghi, errori', () => {
  const ctx = ctxSett();
  const p = ctx.pianoDaOp({ op: 'settimana', w: 41, nota: 'Trasferta martedi', sedute: [
    { g: 'lun', d: 'A', l: 'casa', ora: '07:30' }, { g: 'mer', d: 'B', l: 'bande' }, { g: 'xyz', d: 'C' }, { g: 'ven', d: 'Z' }] });
  assert.equal(p.sedute.length, 2);
  assert.equal(p.sedute[0].data, '09/11/2026');
  assert.equal(p.sedute[1].l, 'bande');
  assert.equal(p.err.length, 2);
  ctx.pianoApplica({ op: 'settimana', w: 41, sedute: [{ g: 'lun', d: 'A', l: 'casa' }] });
  assert.equal(ctx.S.pianoSett[41].da, 'coach');
  assert.ok(ctx.S.cfgTs.settimane > 0);
});

test('stato delle sedute del piano: fatta, oggi, futura, saltata', () => {
  const ctx = ctxSett();
  ctx.S.pianoSett = { 40: { da: 'coach', sedute: [
    { data: '02/11/2026', d: 'A', l: 'casa' }, { data: '03/11/2026', d: 'B', l: 'casa' },
    { data: '05/11/2026', d: 'C', l: 'bande' }, { data: '02/11/2026', d: 'D', l: 'casa' }] } };
  ctx.S.sess = [sess(ctx, 'A', '02/11/2026')];
  const st = Object.fromEntries(ctx.seduteDelPiano(40).map(e => [e.d, e.stato]));
  assert.deepEqual(st, { A: 'fatta', B: 'oggi', C: 'futura', D: 'saltata' });
  assert.equal(ctx.saltate(40).length, 1);
  assert.equal(ctx.pianoDelGiorno('03/11/2026').d, 'B');
  assert.equal(ctx.luogoOggi(), 'casa');
});

test('calendario delle sedute: un evento per seduta da fare, con allarme', () => {
  const ctx = ctxSett();
  ctx.S.sess = [sess(ctx, 'A', '02/11/2026')];
  const sedute = [{ data: '02/11/2026', d: 'A', l: 'casa' }, { data: '05/11/2026', d: 'B', l: 'bande', ora: '18:30' }];
  const ics = ctx.icsSedute(40, sedute);
  assert.equal((ics.match(/BEGIN:VEVENT/g) || []).length, 1, 'la seduta gia\' fatta non va a calendario');
  assert.match(ics, /DTSTART:20261105T183000/);
  assert.match(ics, /TRIGGER:-PT30M/);
  assert.match(ics, /con le bande/);
  assert.ok(!/[^\r]\n/.test(ics));
});

test('la settimana di picco cambia le sedute da pianificare', () => {
  const ctx = ctxSett();
  ctx.S.picco = { 40: true };
  const p = ctx.generaSettimana(40);
  assert.deepEqual([...p.mancano], ['E1', 'E2']);
});

test('il briefing per il coach contiene piano, disponibilita\' e formato', () => {
  const ctx = ctxSett();
  ctx.S.chiusure = { 40: { fuori: ['mar', 'mer'], occupati: ['sab'], giorni: ['lun', 'gio'] } };
  const t = ctx.briefingPiano();
  assert.match(t, /PIANO DELLA SETTIMANA 40/);
  assert.match(t, /fuori casa mar mer/);
  assert.match(t, /"op":"settimana"/);
});

test('Oggi segue il piano: senza seduta oggi propone la prossima in calendario, non la prima in ordine A B C D', () => {
  const ctx = ctxSett();
  ctx.S.sess = [sess(ctx, 'A', '02/11/2026')];
  ctx.S.pianoSett = { 40: { da: 'app', sedute: [
    { data: '02/11/2026', d: 'A', l: 'casa' }, { data: '05/11/2026', d: 'D', l: 'casa', t: 30, agg: [], ser: { 'Hammer Curl': 2 }, via: ['Reverse Fly'] },
    { data: '06/11/2026', d: 'B', l: 'bande' }, { data: '08/11/2026', d: 'C', l: 'casa' }] } };
  const p = ctx.prossimaDelPiano(40);
  assert.equal(p.d, 'D', 'la prossima e\' la D di giovedi\'');
  /* anticipata a oggi con lo stesso attrezzo, la seduta e' quella adattata del piano */
  const lista = ctx.listaPerOggi('D', 'casa');
  assert.ok(!lista.some(x => x.n === 'Reverse Fly'));
  assert.equal(lista.find(x => x.n === 'Hammer Curl').s, 2);
});
