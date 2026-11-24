const test = require('node:test');
const assert = require('node:assert/strict');
const { carica, giorno } = require('./carica');

/* proposta 36: un consiglio al giorno, dai segnali di stamattina e dai KPI da migliorare */
const MATTINA = new Date(2026, 10, 24, 8, 0, 0).getTime();

function storia(ctx, giorni, extra) {
  for (let n = giorni; n >= 1; n--) {
    const d = giorno(ctx, -n);
    ctx.S.ben.push(Object.assign({ date: d, w: ctx.weekOf(d), hrv: 44, rhr: 58, sonno: 7.5, stress: 0, mente: 4, refl: 0, camm: 2, resp: true, svelta: n % 2 === 0, alc: false }, extra ? extra(n) : {}));
  }
}
function oggi(ctx, b) { ctx.S.ben.push(Object.assign({ date: ctx.today(), w: ctx.weekOf(ctx.today()), hrv: 44, rhr: 58, sonno: 7.5, alc: false }, b || {})); }
function nuovo() { const ctx = carica({ now: MATTINA }); ctx.PLAN = ctx.buildPlan(); return ctx; }

test('senza il mattino compilato non c\'e\' consiglio', () => {
  const ctx = nuovo();
  storia(ctx, 20);
  assert.equal(ctx.consiglioOggi(), null);
  assert.equal(ctx.cardConsiglio(), '');
});

test('ogni KPI del cruscotto ha il suo consiglio, e ogni consiglio ha fonti note', () => {
  const ctx = nuovo();
  for (const k of ctx.KPI) assert.ok(ctx.CONS_KPI[k.id], 'manca il consiglio per ' + k.id);
  for (const k of ctx.CONS_ORDINE) assert.ok(ctx.CONS_KPI[k], k);
  for (const x of Object.values(ctx.CONS_KPI).concat(ctx.CONS_OGGI)) for (const f of x.fonti) assert.ok(ctx.FONTI[f], 'fonte ' + f);
});

test('notte corta: ultimo caffe\' 6 ore prima dell\'ora della sera, pisolino breve', () => {
  const ctx = nuovo();
  storia(ctx, 20);
  oggi(ctx, { sonno: 5.5 });
  const c = ctx.consiglioOggi();
  assert.equal(c.id, 'sonno');
  assert.match(c.m, /Ultimo caffè entro le 15:30/, 'sera 21:30 di fabbrica');
  assert.match(c.tec, /15′/);
  ctx.S.orari = { sera: '23:00' };
  assert.match(ctx.consiglioOggi().m, /entro le 17:00/);
});

test('i segnali di stamattina vengono prima dei KPI, nell\'ordine del catalogo', () => {
  const ctx = nuovo();
  storia(ctx, 20, n => n === 1 ? { stress: 2 } : {});
  oggi(ctx, { alc: true });
  assert.equal(ctx.consiglioOggi().id, 'alcol', 'alcol prima di stress');
  ctx.S.ben[ctx.S.ben.length - 1].alc = false;
  const c = ctx.consiglioOggi();
  assert.equal(c.id, 'stress');
  assert.match(c.m, /Sospiro ciclico/);
  assert.match(c.dato, /stress 2 ieri sera/);
});

test('reflusso: la cena si anticipa sulla tua ora tipica', () => {
  const ctx = nuovo();
  storia(ctx, 20, n => {
    const g = ctx.cibVuoto(); g.cen = [{ n: 'Pasta', p: 15, c: 80, g: 15, q: 1, t: '20:00' }];
    return { cibJ: JSON.stringify(g), cibP: 15, cibC: 80, cibG: 15, refl: n === 1 ? 2 : 0 };
  });
  oggi(ctx);
  const c = ctx.consiglioOggi();
  assert.equal(c.id, 'reflusso');
  assert.match(c.m, /Cena finita entro le 18:30/, 'la tipica e\' 20:00 ma 3 ore prima delle 21:30 sono le 18:30');
});

test('senza segnali: KPI in rosso, a rotazione da un giorno all\'altro', () => {
  const ctx = nuovo();
  storia(ctx, 20, () => ({ svelta: false, camm: 0 }));
  oggi(ctx);
  const c = ctx.consiglioOggi();
  assert.equal(c.tipo, 'kpi');
  const rossi = ctx.CONS_ORDINE.filter(id => { const v = ctx.consValori()[id]; return v && v.stato === 'ko'; });
  assert.ok(rossi.includes('svelta') && rossi.includes('camminate'));
  assert.ok(rossi.includes(c.id));
  assert.equal(c.altri, rossi.length - 1);
  /* il giorno dopo cambia */
  const dopo = carica({ now: MATTINA + 86400000 }); dopo.PLAN = dopo.buildPlan();
  storia(dopo, 21, () => ({ svelta: false, camm: 0 })); oggi(dopo);
  assert.notEqual(dopo.consiglioOggi().id, c.id);
});

test('camminata svelta: l\'ora proposta evita la seduta di oggi e la sera', () => {
  const ctx = nuovo();
  assert.equal(ctx.consOraSvelta(), '18:30');
  const tardi = carica({ now: new Date(2026, 10, 24, 19, 0, 0).getTime() }); tardi.PLAN = tardi.buildPlan();
  assert.equal(tardi.consOraSvelta(), null, 'dopo le 18:30 non propone un\'ora gia\' passata');
});

test('Fatto / Non oggi va nella colonna cons e nel briefing', async () => {
  const ctx = nuovo();
  storia(ctx, 20);
  oggi(ctx, { sonno: 5.5 });
  await ctx.consSegna('sonno', true);
  assert.equal(ctx.benOn(ctx.today()).cons, 'sonno:1');
  assert.equal(ctx.SYNC.benRow(ctx.benOn(ctx.today())).cons, 'sonno:1');
  assert.match(ctx.cardConsiglio(), /fatto ✓/);
  assert.match(ctx.consTestoCoach(), /1 fatti su 1 risposte/);
});

test('tutto in verde: un gesto per tenere l\'area piu\' debole', () => {
  const ctx = nuovo();
  ctx.consValori = () => ({});
  storia(ctx, 20); oggi(ctx);
  const c = ctx.consiglioOggi();
  assert.equal(c.tipo, 'tieni');
  assert.match(c.t, /Tutto in verde/);
});

test('mai un consiglio sul dolore notturno', () => {
  const ctx = nuovo();
  storia(ctx, 20); oggi(ctx, { dolnotte: true });
  const c = ctx.consiglioOggi();
  assert.ok(!c || !/notte|notturno/i.test(c.t + c.m));
});
