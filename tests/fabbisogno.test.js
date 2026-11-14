const test = require('node:test');
const assert = require('node:assert/strict');
const { carica, giorno } = require('./carica');

/* giornate complete: tre pasti principali, calorie costanti; pesate con una pendenza nota */
function riempi(ctx, giorni, kcal, gSett) {
  const voce = k => ({ n: 'pasto', p: 40 * k, c: 100 * k, g: 20 * k, q: 1 });
  const k = kcal / (3 * (40 * 4 + 100 * 4 + 20 * 9));
  for (let n = giorni; n >= 1; n--) {
    const g = ctx.cibVuoto(); g.col = [voce(k)]; g.pra = [voce(k)]; g.cen = [voce(k)];
    const t = ctx.cibTot(g), date = giorno(ctx, -n);
    ctx.S.ben.push({ date, w: ctx.weekOf(date), cibJ: JSON.stringify(g), cibP: Math.round(t.p), cibC: Math.round(t.c), cibG: Math.round(t.g),
      peso: Math.round((75 + (giorni - n) * gSett / 7000) * 100) / 100 });
  }
}

test('formula: Mifflin-St Jeor per il fattore di attività, e dice cosa manca', () => {
  const ctx = carica();
  assert.equal(ctx.fabFormula().ok, false);
  assert.ok(ctx.fabFormula().manca.length >= 4);
  ctx.S.profilo = { altezza: 176, anno: 1979, sesso: 'M', lavoro: 'sed' };
  ctx.S.ben = [{ date: giorno(ctx, -1), w: 40, peso: 76 }];
  const f = ctx.fabFormula();
  assert.equal(f.ok, true);
  assert.equal(f.bmr, Math.round(10 * 76 + 6.25 * 176 - 5 * (2026 - 1979) + 5));
  assert.equal(f.pal, 1.4, 'seduto, nessuna seduta registrata');
  assert.equal(f.tdee, Math.round(f.bmr * 1.4 / 10) * 10);
  ctx.S.profilo.sesso = 'F';
  assert.equal(ctx.fabFormula().bmr, f.bmr - 166);
});

test('dai dati: calorie mangiate meno l\'energia finita nel peso', () => {
  const ctx = carica();
  riempi(ctx, 24, 2600, 200);
  const r = ctx.fabReale();
  assert.equal(r.ok, true, r.why);
  assert.ok(Math.abs(r.mangiato - 2600) <= 15, 'mangiato ' + r.mangiato);
  assert.ok(Math.abs(r.pendenza - 200) <= 25, 'pendenza ' + r.pendenza);
  assert.ok(Math.abs(r.tdee - (2600 - 220)) <= 40, 'dispendio ' + r.tdee);
});

test('poche giornate complete o giornate stimate: niente stima dai dati', async () => {
  const ctx = carica();
  riempi(ctx, 6, 2600, 200);
  assert.equal(ctx.fabReale().ok, false);
  assert.match(ctx.fabReale().why, /ne servono 10/);
  /* una giornata con una voce stimata non conta */
  const c2 = carica();
  riempi(c2, 12, 2600, 200);
  const n0 = c2.fabGiorni().length;
  const b = c2.S.ben[c2.S.ben.length - 1], g = JSON.parse(b.cibJ); g.cen.push({ n: 'boh', p: 5, c: 5, g: 5, q: 1, w: 1 }); b.cibJ = JSON.stringify(g);
  assert.equal(c2.fabGiorni().length, n0 - 1);
});

test('il target si sposta solo con una proposta autorizzata, a passi limitati', () => {
  const ctx = carica();
  riempi(ctx, 24, 2150, 60);   /* mangia poco e cresce poco: il dispendio è più basso del previsto */
  const q = ctx.fabQuadro();
  assert.equal(q.fonte, 'dati');
  const p = q.proposte.find(x => x.tipo === 'kcal');
  assert.ok(p, 'manca la proposta');
  assert.ok(Math.abs(p.v - ctx.cibTarget().kcal) <= 300, 'passo massimo 300');
  assert.equal(p.v % 50, 0);
  assert.equal(ctx.cibTarget().kcal, 2550, 'niente cambia da solo');
  ctx.fabApplica(p.id);
  assert.equal(ctx.cibTarget().kcal, p.v);
  assert.equal(ctx.cibTarget().c, Math.round((p.v - 4 * 130 - 9 * 70) / 4), 'la differenza va sui carboidrati');
  assert.ok(!ctx.fabQuadro().proposte.some(x => x.tipo === 'kcal'), 'non più di una volta ogni due settimane');
  /* con i dati buoni la vecchia ricalibrazione sulla sola pendenza lascia il posto */
  assert.equal(ctx.cibProposta(), null);
});

test('proteine: proposta di salire sotto 1,6 g per kg', () => {
  const ctx = carica();
  ctx.S.ben = [{ date: giorno(ctx, -1), w: 40, peso: 88 }];
  const p = ctx.fabQuadro().proposte.find(x => x.tipo === 'prot');
  assert.ok(p);
  assert.equal(p.v, 145);
  ctx.fabApplica(p.id);
  assert.equal(ctx.cibTarget().p, 145);
  assert.equal(ctx.cibTarget().kcal, 2550);
  /* a 76 kg i 130 g del piano bastano */
  const c2 = carica();
  c2.S.ben = [{ date: giorno(c2, -1), w: 40, peso: 76 }];
  assert.ok(!c2.fabQuadro().proposte.some(x => x.tipo === 'prot'));
});
