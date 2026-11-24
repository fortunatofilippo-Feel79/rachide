const test = require('node:test');
const assert = require('node:assert/strict');
const { carica, giorno } = require('./carica');

/* regola 76: camminata svelta 30' tre volte a settimana, separata dalle camminate lente dopo i pasti */
const OGGI = new Date(2026, 10, 24, 21, 0, 0).getTime();

test('KPI camminata svelta: fatte negli ultimi 7 giorni, bersaglio 3', () => {
  const ctx = carica({ now: OGGI }); ctx.PLAN = ctx.buildPlan();
  assert.equal(ctx.kpiValori().svelta.stato, 'na', 'senza sere segnate non si giudica');
  [0, 2, 4].forEach(n => { const d = giorno(ctx, -n); ctx.S.ben.push({ date: d, w: ctx.weekOf(d), svelta: true }); });
  [1, 3].forEach(n => { const d = giorno(ctx, -n); ctx.S.ben.push({ date: d, w: ctx.weekOf(d), svelta: false }); });
  ctx.kpiCacheReset && ctx.kpiCacheReset();
  const v = ctx.kpiValori().svelta;
  assert.equal(v.v, 3);
  assert.equal(v.stato, 'ok');
  assert.equal(v.txt, '3 su 7');
  assert.deepEqual(JSON.parse(JSON.stringify(ctx.sveltaSettimana())), { fatte: 3, segnate: 5 });
});

test('la camminata svelta non tocca le camminate dopo i pasti, e la sera conta come compilata', () => {
  const ctx = carica({ now: OGGI }); ctx.PLAN = ctx.buildPlan();
  ctx.S.ben.push({ date: ctx.today(), w: ctx.weekOf(ctx.today()), svelta: true });
  assert.equal(ctx.kpiValori().camminate.stato, 'na');
  assert.ok(ctx.seraFatta({ svelta: false }));
  assert.ok(ctx.BENE_DOM.find(d => d.k === 'movimento').kpi.includes('svelta'));
});

test('va e torna dal foglio: Sì, No, vuoto se non segnata', () => {
  const ctx = carica({ now: OGGI });
  const riga = b => ctx.SYNC.benRow(Object.assign({ date: ctx.today(), w: 48, alc: false, resp: false }, b)).svelta;
  assert.equal(riga({ svelta: true }), 'Sì');
  assert.equal(riga({ svelta: false }), 'No');
  assert.equal(riga({}), '');
});

test('il modulo della sera chiede la camminata svelta e la salva', () => {
  const fs = require('node:fs'), path = require('node:path');
  const src = fs.readFileSync(path.join(__dirname, '..', 'js', '10-azioni.js'), 'utf8');
  assert.match(src, /id="bSv"/);
  assert.match(src, /svelta: c\("#bSv"\)/);
});

test('lettura incrociata: camminata svelta e HRV del mattino dopo', () => {
  const ctx = carica({ now: OGGI });
  for (let n = 20; n >= 1; n--) {
    const d = giorno(ctx, -n), ieriSvelta = (n + 1) % 2 === 0;
    ctx.S.ben.push({ date: d, w: ctx.weekOf(d), svelta: n % 2 === 0, hrv: ieriSvelta ? 50 : 42 });
  }
  const l = ctx.beneLetture().find(x => x.t === 'Camminata svelta e HRV');
  assert.ok(l, 'la lettura compare');
  assert.match(l.m, /l'HRV è in media 50, dopo i giorni senza 42/);
  assert.match(l.m, /regola 76 funziona/);
});

test('il briefing riporta la camminata svelta', () => {
  const ctx = carica({ now: OGGI }); ctx.PLAN = ctx.buildPlan();
  for (let n = 3; n >= 0; n--) { const d = giorno(ctx, -n); ctx.S.ben.push({ date: d, w: ctx.weekOf(d), hrv: 44, refl: 0, svelta: n % 2 === 0 }); }
  assert.match(ctx.briefing(), /Camminata svelta 30' \(regola 76\): 2 negli ultimi 7 giorni, su 4 sere segnate/);
});

test('i pulsanti Sì/No di camminata svelta e dolore di notte si possono scegliere', () => {
  const fs = require('node:fs'), path = require('node:path');
  const src = fs.readFileSync(path.join(__dirname, '..', 'js', '10-azioni.js'), 'utf8');
  const keys = JSON.parse(src.match(/var keys=(\[[^\]]+\]);/)[1]);
  /* ogni data-xx dei moduli a scelta singola deve stare nel gestore dei clic */
  ['nt', 'sv'].forEach(k => assert.ok(keys.includes(k), k));
});
