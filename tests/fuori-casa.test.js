const test = require('node:test');
const assert = require('node:assert/strict');
const { carica } = require('./carica');

function ctxP() { const ctx = carica(); ctx.PLAN = ctx.buildPlan(); return ctx; }
const conPesi = (ctx, x) => !!(ctx.meta(x.n).step) || (x.L > 0);
const conBanda = (ctx, x) => !!(ctx.meta(x.n).band || x.b);

test('fuori casa con le bande: nessun esercizio con i pesi, in nessun giorno', () => {
  const ctx = ctxP();
  ['A', 'B', 'C', 'D', 'T1', 'T2'].forEach(d => {
    const pesi = ctx.eserciziPer(d, 'bande').filter(x => conPesi(ctx, x)).map(x => x.n);
    assert.equal(pesi.join(', '), '', d + ' con le bande ha ancora pesi: ' + pesi.join(', '));
  });
});

test('fuori casa senza niente: ne\' pesi ne\' bande, anche nelle sedute di trasferta', () => {
  const ctx = ctxP();
  ['A', 'B', 'C', 'D', 'T1', 'T2'].forEach(d => {
    const lista = ctx.eserciziPer(d, 'corpo');
    const vietati = lista.filter(x => conPesi(ctx, x) || conBanda(ctx, x)).map(x => x.n);
    assert.equal(vietati.join(', '), '', d + ' a corpo libero ha ancora: ' + vietati.join(', '));
    assert.ok(lista.length >= 3, d + ' a corpo libero resta una seduta vera');
  });
});

test('in casa c\'e\' tutto: la seduta resta quella del piano', () => {
  const ctx = ctxP();
  assert.equal(ctx.eserciziPer('A', 'casa').map(x => x.n).join('|'), ctx.PLAN.A.ex.map(x => x.n).join('|'));
  assert.equal(ctx.eserciziPer('T2', 'bande').map(x => x.n).join('|'), ctx.PLAN.T2.ex.map(x => x.n).join('|'));
});

test('le tirate dall\'alto con l\'ancoraggio non escono fuori casa (regola 22)', () => {
  const ctx = ctxP();
  ['A', 'B', 'C', 'D', 'T1', 'T2'].forEach(d => ['bande', 'corpo'].forEach(l => {
    assert.ok(!ctx.eserciziPer(d, l).some(x => x.n === 'Band pull-down'), d + ' ' + l);
  }));
});
