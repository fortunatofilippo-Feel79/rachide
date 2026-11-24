const test = require('node:test');
const assert = require('node:assert/strict');
const { carica, giorno } = require('./carica');

const OGGI = new Date(2026, 10, 24, 13, 0, 0).getTime();

test('A · in Corpo il benessere di oggi si legge, non si compila: niente pulsanti mattino e sera', () => {
  const ctx = carica({ now: OGGI }); ctx.PLAN = ctx.buildPlan();
  const h = ctx.viewCorpo();
  assert.ok(!/data-a="ben" data-m="mattina"/.test(h));
  assert.ok(!/data-a="ben" data-m="sera"/.test(h));
  assert.match(h, /Si compila da Oggi/);
  assert.match(h, /Aggiungi un giorno saltato/, 'la correzione dei giorni passati resta');
});

test('B · la chiusura della domenica scrive passi e ipopnea; una seconda volta corregge la stessa riga', () => {
  const ctx = carica({ now: new Date(2026, 10, 22, 19, 0, 0).getTime() });
  const w = ctx.weekOf(ctx.today());
  ctx.salvaSettZepp(8200, 3.1);
  assert.equal(ctx.settZepp(w).passi, 8200);
  const prima = ctx.settZepp(w).date;
  ctx.salvaSettZepp(9000, 2.5, prima);
  assert.equal(ctx.S.ben.filter(b => b.w === w && b.passi).length, 1);
  assert.equal(ctx.settZepp(w).ipo, 2.5);
  const h = (() => { let out = ''; ctx.sheet = x => { out = x; }; ctx.formChiusura(); return out; })();
  assert.match(h, /id="wPassi" value="9000"/);
});

test('C · in Oggi una riga sola per la settimana, che porta a Corpo', () => {
  const ctx = carica({ now: OGGI }); ctx.PLAN = ctx.buildPlan();
  assert.equal(ctx.rigaBenessereSett(), '', 'senza dati non compare');
  for (let n = 14; n >= 0; n--) {
    const d = giorno(ctx, -n);
    ctx.S.ben.push({ date: d, w: ctx.weekOf(d), hrv: 45, rhr: 58, sonno: 7.5, stress: 0, mente: 4, refl: 0, camm: 2, resp: true, alc: false });
  }
  ctx.kpiCacheReset && ctx.kpiCacheReset();
  const r = ctx.rigaBenessereSett();
  assert.match(r, /data-a="nav" data-v="corpo"/);
  assert.match(r, /\/100/);
});

test('D · HybridCharge nel tempo: media 7 giorni contro la tua norma, solo lettura', () => {
  const ctx = carica({ now: OGGI });
  for (let n = 40; n >= 0; n--) {
    const d = giorno(ctx, -n);
    ctx.S.ben.push({ date: d, w: ctx.weekOf(d), hc: n <= 6 ? 60 : 76 });
  }
  const x = ctx.hcStato(ctx.today());
  assert.equal(x.norma, 76);
  assert.equal(x.m7, 60);
  assert.equal(x.trend, 'sotto');
  assert.match(ctx.hcTesto(x), /tua norma 76 \(-16\)/);
  /* non tocca il recupero di oggi */
  assert.equal(ctx.recovery(ctx.today()).lvl, 0);
  assert.equal(ctx.hcStato(giorno(ctx, -35)), null, 'con meno di 14 mattine non c\'e\' norma');
});

test('E · ora della cena e reflusso della notte dopo, sulla tua ora tipica', () => {
  const ctx = carica({ now: OGGI });
  for (let n = 21; n >= 1; n--) {
    const d = giorno(ctx, -n), tardi = n % 2 === 0;
    const g = ctx.cibVuoto(); g.cen = [{ n: 'Pasta', p: 15, c: 80, g: 15, q: 1, t: tardi ? '21:40' : '19:20' }];
    /* il reflusso del giorno dopo dipende dalla cena di oggi */
    const ieriTardi = (n + 1) % 2 === 0;
    ctx.S.ben.push({ date: d, w: ctx.weekOf(d), cibJ: JSON.stringify(g), cibP: 15, cibC: 80, cibG: 15, refl: ieriTardi ? 2 : 0 });
  }
  assert.equal(ctx.cenaOra(ctx.S.ben[0]), '19:20');
  assert.equal(ctx.cenaOra(ctx.S.ben[1]), '21:40');
  const l = ctx.beneLetture().find(x => x.t === 'Ora della cena e reflusso');
  assert.ok(l, 'la lettura compare');
  assert.match(l.m, /2 su 3, dopo quelle più presto 0 su 3/);
  assert.match(l.m, /ACG 2022/);
});

test('F · spuntino proteico: fra i tuoi, nello spuntino giusto, mai dopo cena', () => {
  const ctx = carica({ now: OGGI });
  assert.equal(ctx.cibSpuntinoProteico('pra').k, 'sp');
  assert.equal(ctx.cibSpuntinoProteico('pra').v.n, 'Yogurt greco 0%', 'senza storico: dal catalogo');
  assert.equal(ctx.cibSpuntinoProteico('cen'), null);
  /* con uno spuntino proteico abituale propone quello */
  for (let n = 1; n <= 3; n++) {
    const d = giorno(ctx, -n), g = ctx.cibVuoto();
    g.sp = [{ n: 'Skyr', p: 22, c: 8, g: 0, q: 1 }];
    ctx.S.ben.push({ date: d, w: ctx.weekOf(d), cibJ: JSON.stringify(g), cibP: 22, cibC: 8, cibG: 0 });
  }
  assert.equal(ctx.cibSpuntinoProteico('pra').v.n, 'Skyr');
  assert.equal(ctx.cibSpuntinoProteico('col').k, 'sm');
});
