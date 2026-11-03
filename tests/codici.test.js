const test = require('node:test');
const assert = require('node:assert/strict');
const { carica } = require('./carica');

test('codici a barre: cifra di controllo EAN-13, EAN-8 e UPC-A', () => {
  const ctx = carica();
  assert.equal(ctx.eanValido('8076809513753'), true);    // EAN-13 reale (pasta)
  assert.equal(ctx.eanValido('8076809513754'), false);
  assert.equal(ctx.eanValido('96385074'), true);          // EAN-8 di esempio
  assert.equal(ctx.eanNorm('036000291452'), '0036000291452');
  assert.equal(ctx.eanValido(ctx.eanNorm('036000291452')), true);
  assert.equal(ctx.eanValido('12345'), false);
});

test('Open Food Facts: valori per 100 g, kcal da kJ se mancano, porzione', () => {
  const ctx = carica();
  const x = ctx.offProdotto('8000000000001', {
    product_name: 'Yogurt greco', brands: 'Marca A, Marca B', quantity: '500 g', serving_quantity: '170',
    nutriments: { proteins_100g: '10,2', carbohydrates_100g: 3.5, fat_100g: 0, 'energy-kj_100g': 230 }
  });
  assert.equal(x.n, 'Yogurt greco');
  assert.equal(x.marca, 'Marca A');
  assert.equal(x.p100, 10.2);
  assert.equal(x.kcal100, 55);
  assert.equal(x.serv, 170);
  assert.equal(ctx.prodottoCompleto(x), true);
  assert.equal(ctx.prodottoCompleto(ctx.offProdotto('1', { product_name: 'x', nutriments: {} })), false);
});

test('grammi mangiati -> voce del pasto con le macro giuste', () => {
  const ctx = carica();
  const v = ctx.voceDaProdotto({ code: '1', n: 'Avena', marca: 'X', p100: 13, c100: 60, g100: 7 }, 70);
  assert.deepEqual([v.p, v.c, v.g, v.d, v.n, v.bc], [9.1, 42, 4.9, '70 g', 'Avena · X', '1']);
});

test('i prodotti letti vanno nella memoria del foglio e non si perdono tra telefoni', () => {
  const ctx = carica();
  ctx.S.prodotti = { a: { code: 'a', n: 'A' } };
  ctx.cfgTocca('prodotti');
  assert.ok(ctx.cfgRighe(true).some(r => r.gruppo === 'prodotti'));
  ctx.cfgApplica('prodotti', { b: { code: 'b', n: 'B' } });
  assert.deepEqual(Object.keys(ctx.S.prodotti).sort(), ['a', 'b']);
});
