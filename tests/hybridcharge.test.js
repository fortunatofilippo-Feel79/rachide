const test = require('node:test');
const assert = require('node:assert/strict');
const { carica, giorno } = require('./carica');

/* orologio al 24/11/2026: dal 07/11 Zepp da' HybridCharge al posto della readiness */
const OGGI = new Date(2026, 10, 24, 9, 0, 0).getTime();

function storico(ctx) {
  for (let n = 30; n >= 1; n--) {
    const date = giorno(ctx, -n);
    ctx.S.ben.push({ date, w: ctx.weekOf(date), hrv: 42, rhr: 60, sonno: 7.5, alc: false, hc: 75 });
  }
}

test('HybridCharge basso con HRV, FC e sonno nella norma non accende il recupero: e\' una conferma, non un segnale in piu\'', () => {
  const ctx = carica({ now: OGGI });
  storico(ctx);
  ctx.S.ben.push({ date: ctx.today(), w: ctx.weekOf(ctx.today()), hrv: 42, rhr: 60, sonno: 7.5, alc: false, hc: 48 });
  const r = ctx.recovery(ctx.today());
  assert.equal(r.lvl, 0);
  assert.equal(r.hc, 48);
  assert.match(r.hint, /HybridCharge 48/);
  assert.ok(!r.parts.length, 'nessun segnale nella lista');
});

test('HybridCharge basso senza la FC a riposo supplisce al dato mancante', () => {
  const ctx = carica({ now: OGGI });
  storico(ctx);
  ctx.S.ben.push({ date: ctx.today(), w: ctx.weekOf(ctx.today()), hrv: 42, sonno: 7.5, alc: false, hc: 50 });
  const r = ctx.recovery(ctx.today());
  assert.equal(r.lvl, 1);
  assert.match(r.parts.join(' '), /HybridCharge 50 \(manca la FC a riposo\)/);
});

test('con un segnale vero HybridCharge basso compare come conferma senza alzare il livello', () => {
  const ctx = carica({ now: OGGI });
  storico(ctx);
  ctx.S.ben.push({ date: ctx.today(), w: ctx.weekOf(ctx.today()), hrv: 42, rhr: 60, sonno: 5.5, alc: false, hc: 45 });
  const r = ctx.recovery(ctx.today());
  assert.equal(r.lvl, 1);
  assert.match(r.parts.join(' · '), /HybridCharge 45 \(conferma\)/);
});

test('la readiness non entra piu\' nel recupero', () => {
  const ctx = carica({ now: OGGI });
  storico(ctx);
  ctx.S.ben.push({ date: ctx.today(), w: ctx.weekOf(ctx.today()), hrv: 42, rhr: 60, sonno: 7.5, alc: false, read: 30 });
  assert.equal(ctx.recovery(ctx.today()).lvl, 0);
});

test('HybridCharge va e torna dal foglio nella colonna hc, e il mattino conta come compilato', () => {
  const ctx = carica({ now: OGGI });
  const riga = ctx.SYNC.benRow({ date: ctx.today(), w: 47, hc: 66, alc: false, resp: false });
  assert.equal(riga.hc, 66);
  assert.ok('read' in riga, 'la readiness storica resta nella sua colonna');
  assert.ok(ctx.mattinaFatta({ hc: 0 }), 'anche uno 0 e\' un dato');
  assert.ok(!ctx.mattinaFatta({}));
});

test('fuori scala: HybridCharge sopra 100 chiede conferma', () => {
  const ctx = carica({ now: OGGI });
  assert.match(ctx.controlloBen({ date: ctx.today(), hc: 140 }).join(' '), /HybridCharge 140/);
  assert.equal(ctx.controlloBen({ date: ctx.today(), hc: 70 }).length, 0);
});

test('il modulo del mattino non ha piu\' «Incolla da Salute» ne\' la readiness', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const src = fs.readFileSync(path.join(__dirname, '..', 'js', '10-azioni.js'), 'utf8');
  assert.ok(!/Incolla da Salute|benpaste/.test(src));
  assert.ok(!/id="bRead"/.test(src));
  assert.match(src, /id="bHc"/);
});
