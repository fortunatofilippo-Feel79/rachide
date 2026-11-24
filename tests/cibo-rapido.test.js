const test = require('node:test');
const assert = require('node:assert/strict');
const { carica, giorno } = require('./carica');

const voce = (n, p, c, g, extra) => Object.assign({ n, p, c, g, q: 1 }, extra || {});
function metti(ctx, date, pasti) {
  const g = ctx.cibVuoto(); Object.assign(g, pasti);
  const t = ctx.cibTot(g);
  ctx.S.ben.push({ date, w: ctx.weekOf(date), cibJ: JSON.stringify(g), cibP: t.p, cibC: t.c, cibG: t.g });
}

test('il pasto proposto dipende dall\'ora', () => {
  const ora = (h, m) => carica({ now: new Date(2026, 10, 24, h, m || 0, 0).getTime() });
  assert.equal(ora(7).cibPastoOra(), 'col');
  assert.equal(ora(11).cibPastoOra(), 'sm');
  assert.equal(ora(13).cibPastoOra(), 'pra');
  assert.equal(ora(17).cibPastoOra(), 'sp');
  assert.equal(ora(20, 30).cibPastoOra(), 'cen');
});

test('«come l\'ultima volta» prende il giorno piu\' recente in cui il pasto c\'era, non solo ieri', async () => {
  const ctx = carica({ now: new Date(2026, 10, 24, 13, 0, 0).getTime() });
  metti(ctx, giorno(ctx, -3), { pra: [voce('Pollo', 33, 0, 4), voce('Riso', 6, 62, 1)] });
  const u = ctx.cibUltimo('pra');
  assert.equal(u.n, 3);
  await ctx.cibRipeti('pra');
  const oggi = ctx.cibDay(ctx.today()).pra;
  assert.deepEqual(oggi.map(v => v.n), ['Pollo', 'Riso']);
  assert.equal(oggi[0].t, '13:00', 'le voci copiate oggi prendono l\'ora di adesso');
});

test('ricetta tua: si salva dal pasto e si riaggiunge con gli stessi valori', async () => {
  const ctx = carica({ now: new Date(2026, 10, 24, 13, 0, 0).getTime() });
  metti(ctx, ctx.today(), { pra: [voce('Petto di pollo', 46, 0, 5, { gr: 200 }), voce('Riso', 6, 62, 1)] });
  assert.ok(ctx.ricettaSalva('pra', 'Pranzo ufficio'));
  const r = ctx.cibRic().find(x => x.n === 'Pranzo ufficio');
  assert.ok(r && r.mia);
  assert.ok(ctx.CFG_GRUPPI.ricette().length === 1, 'va sul foglio nel gruppo ricette');
  await ctx.cibReset();
  await ctx.cibAddRic('pra', 'Pranzo ufficio');
  const pra = ctx.cibDay(ctx.today()).pra;
  assert.equal(pra.length, 2);
  assert.equal(pra[0].gr, 200);
  ctx.ricettaTogli('Pranzo ufficio');
  assert.ok(!ctx.cibRic().some(x => x.n === 'Pranzo ufficio'));
});

test('l\'ultimo pasto pieno prima della seduta si legge dal diario del cibo (regola 52)', () => {
  const ctx = carica({ now: new Date(2026, 10, 24, 19, 0, 0).getTime() });
  metti(ctx, ctx.today(), {
    col: [voce('Latte', 35, 13, 1, { t: '07:10' })],
    pra: [voce('Pasta', 10, 70, 8, { t: '12:40' }), voce('Pollo', 33, 0, 4, { t: '12:45' })],
    sp: [voce('Yogurt', 25, 10, 0, { t: '16:30' })]
  });
  assert.equal(ctx.cibOraPasto(ctx.today(), '18:00'), '12:45', 'lo spuntino non e\' un pasto pieno');
  assert.equal(ctx.cibOraPasto(ctx.today(), '10:00'), null, 'la colazione piccola non conta');
});

test('proteine del pasto: avviso solo sotto 0,25 g/kg su un pasto principale', () => {
  const ctx = carica({ now: new Date(2026, 10, 24, 13, 0, 0).getTime() });
  ctx.S.ben.push({ date: giorno(ctx, -1), w: ctx.weekOf(giorno(ctx, -1)), peso: 66 });
  assert.match(ctx.cibProtPasto('pra', { p: 10, c: 90, g: 15 }), /circa 26 g/);
  assert.equal(ctx.cibProtPasto('pra', { p: 30, c: 90, g: 15 }), '');
  assert.equal(ctx.cibProtPasto('sm', { p: 5, c: 60, g: 5 }), '', 'gli spuntini no');
});
