const test = require('node:test');
const assert = require('node:assert/strict');
const { carica, giorno } = require('./carica');

test('la tabella degli alimenti è plausibile: somme entro 100 g e calorie nei limiti', () => {
  const ctx = carica();
  const l = ctx.alimLista();
  assert.ok(l.length >= 140, 'alimenti: ' + l.length);
  const nomi = new Set();
  l.forEach(x => {
    assert.ok(!nomi.has(x.n), 'doppio: ' + x.n); nomi.add(x.n);
    assert.ok(x.p100 >= 0 && x.c100 >= 0 && x.g100 >= 0, x.n);
    assert.ok(x.p100 + x.c100 + x.g100 + (x.a100 || 0) <= 100.5, x.n + ': oltre 100 g');
    const kcal = ctx.kcalDi({ p: x.p100, c: x.c100, g: x.g100, a: x.a100 || 0 });
    assert.ok(kcal >= 5 && kcal <= 905, x.n + ': ' + kcal + ' kcal per 100 g');
    assert.ok(x.porz > 0 && x.porz <= 400 && x.porzTxt, x.n + ': porzione');
  });
});

test('una riga scritta diventa voci con i grammi giusti', () => {
  const ctx = carica();
  const r = ctx.alimLeggi("pollo 200 g, riso 80, un cucchiaio d'olio, 2 uova, mezza mozzarella", 'pra');
  assert.deepEqual(Array.from(r, x => x.voce && x.voce.n), ['Petto di pollo (crudo)', 'Riso bianco (crudo)', "Olio extravergine d'oliva", 'Uovo intero', 'Mozzarella']);
  assert.deepEqual(Array.from(r, x => x.voce.gr), [200, 80, 10, 110, 63]);
  assert.equal(r[0].voce.p, 46);
  assert.equal(Math.round(ctx.kcalDi(r[1].voce)), 280);
});

test('con una quantità scritta non si usa la porzione multipla del coach', () => {
  const ctx = carica();
  /* nel catalogo del coach «Uova» vale 3 uova: «2 uova» non devono diventare 6 */
  const r = ctx.alimLeggi('2 uova', 'col')[0];
  assert.equal(r.voce.gr, 110);
  /* senza quantità vale la porzione abituale */
  const m = ctx.alimLeggi('mandorle', 'col')[0];
  assert.equal(m.fonte, 'coach');
});

test('quello che non riconosce resta una stima, e la giornata esce dalla media', async () => {
  const ctx = carica();
  const r = ctx.alimLeggi('tiramisù della nonna', 'cen');
  assert.equal(r[0].voce, null);
  await ctx.cibAddLibero('cen', 'tiramisù della nonna', 1);
  assert.equal(ctx.cibStimato(ctx.today()), true);
  const w = ctx.cibWeek();
  assert.equal(w.n, 0);
  assert.equal(w.stime, 1);
  assert.equal(ctx.kpiValori().kcal.stato, 'na');
});

test('piatti con la «e» e nomi con il condimento', () => {
  const ctx = carica();
  assert.deepEqual(Array.from(ctx.alimLeggi('pasta e fagioli', 'pra'), x => !!x.voce), [true, true]);
  const s = ctx.alimLeggi('spaghetti al pomodoro 100 g', 'pra')[0];
  assert.equal(s.voce.n, 'Pasta di semola (cruda)');
  assert.match(s.nota, /ho riconosciuto solo «spaghetti»/);
});

test('l\'alcol entra nelle calorie del giorno e sul foglio', async () => {
  const ctx = carica();
  const b = ctx.alimLeggi('1 birra', 'cen')[0];
  assert.ok(b.voce.a > 10);
  await ctx.cibAddVoce('cen', b.voce);
  const riga = ctx.benOn(ctx.today());
  assert.equal(riga.cibA, Math.round(b.voce.a));
  assert.equal(ctx.kcalGiorno(riga), 4 * riga.cibP + 4 * riga.cibC + 9 * riga.cibG + 7 * riga.cibA);
  assert.equal(ctx.SYNC.benRow(riga).cibA, riga.cibA);
});

test('calorie o blocchi: cambia solo come si legge', () => {
  const ctx = carica();
  const v = { p: 26, c: 58, g: 11 };
  assert.match(ctx.macTxt(v), /^435 kcal · 26P 58C 11G$/);
  ctx.S.cibUnita = 'blocchi';
  assert.match(ctx.macTxt(v), /^1P · 1C · 1G$/);
});

test('una voce pesata si somma, si moltiplica e torna nello storico', async () => {
  const ctx = carica({ now: new Date(2026, 10, 3, 13, 0, 0).getTime() });
  const x = ctx.alimLista().find(a => a.n === 'Petto di pollo (crudo)');
  await ctx.cibAddVoce('pra', ctx.voceDaCento(x, 200));
  await ctx.cibAddVoce('pra', ctx.voceDaCento(x, 200));
  const g = ctx.cibDay();
  assert.equal(g.pra.length, 1);
  assert.equal(g.pra[0].q, 2);
  assert.equal(Math.round(ctx.cibTot(g).p), 92);
  assert.equal(giorno(ctx, 0), ctx.today());
});
