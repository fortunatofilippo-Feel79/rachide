/* Integrazione: l'app (due telefoni) e lo script del foglio parlano davvero tra loro. */
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const { carica, giorno } = require('./carica');

function foglioFinto(segreto) {
  const fogli = {};
  function F() { this.d = []; }
  F.prototype.getLastRow = function () { return this.d.length; };
  F.prototype.getLastColumn = function () { return this.d.reduce((m, r) => Math.max(m, r.length), 0); };
  F.prototype.clearContents = function () { this.d = []; };
  F.prototype.deleteRow = function (r) { this.d.splice(r - 1, 1); };
  F.prototype.getRange = function (r, c, nr, nc) { const f = this; return {
    getDisplayValues() { const o = []; for (let i = 0; i < nr; i++) { const row = []; for (let j = 0; j < nc; j++) { const v = (f.d[r - 1 + i] || [])[c - 1 + j]; row.push(v == null ? '' : String(v)); } o.push(row); } return o; },
    setValues(v) { v.forEach((row, i) => { f.d[r - 1 + i] = row.slice(); }); }, setNumberFormat() {} }; };
  const ss = { getSheetByName: n => fogli[n] || null, insertSheet: n => (fogli[n] = new F()) };
  const g = { SpreadsheetApp: { getActive: () => ss },
    PropertiesService: { getScriptProperties: () => ({ getProperty: () => segreto }) },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    ContentService: { MimeType: {}, createTextOutput: s => ({ s, setMimeType() { return this; } }) },
    JSON, Object, Array, String };
  vm.createContext(g);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'apps-script', 'Rachide.gs'), 'utf8'), g);
  g.__fogli = fogli; g.__post = 0; g.__ultimo = null;
  return g;
}
/* collega il fetch dell'app allo script finto */
function telefono(script) {
  const ctx = carica();
  ctx.fetch = async (url, opt) => {
    let out;
    if (opt && opt.method === 'POST') { script.__post++; script.__ultimo = JSON.parse(opt.body); out = script.doPost({ postData: { contents: opt.body } }); }
    else { const q = Object.fromEntries(new URL(url).searchParams); out = script.doGet({ parameter: q }); }
    return { text: async () => out.s };
  };
  ctx.S.sync = { url: 'https://script.google.com/macros/s/PROVA/exec', secret: 'segreto-di-prova-123' };
  ctx.PLAN = ctx.buildPlan();
  return ctx;
}

test('telefono nuovo: dal foglio tornano storico, modifiche al piano e impostazioni', async () => {
  const foglio = foglioFinto('segreto-di-prova-123');
  const A = telefono(foglio);
  await A._pullNow(false);                                   // scopre lo script v3
  assert.equal(A.S.syncVer, 3);
  A.S.log = [{ id: 'l1', w: 40, date: giorno(A, -2), day: 'B', ex: 'Box Squat', side: '', band: '', load: 30, reps: [8, 8, 8], rir: 2, top: false, note: '' }];
  A.S.sess = [{ id: 's1', w: 40, date: giorno(A, -2), day: 'B', sede: 'Casa', mod: 'Pesi', min: 50, en: 4, warm: true, sig: false, dol: 3, note: '' }];
  A.S.ben = [{ date: giorno(A, -1), w: 40, hrv: 55, sonno: 7.2, dolm: 1 }];
  A.S.patches = [{ ts: '01/11/2026', nota: 'Plank piu lungo', ops: [{ op: 'set', d: 'A', n: 'Plank', lo: 45, hi: 75 }] }];
  A.S.profilo = { altezza: 170 }; A.S.freeze = { until: 42, note: 'deficit' }; A.S.chiusure = { 39: { bene: 'ok' } };
  ['patches', 'profilo', 'freeze', 'chiusure'].forEach(k => A.cfgTocca(k));
  assert.equal(await A._pushNow(true), true);

  const B = telefono(foglio);                                 // telefono nuovo, vuoto
  B.S.syncVer = 3;
  await B._pullNow(false);
  assert.equal(B.S.log.length, 1);
  assert.equal(B.S.sess[0].dol, 3);
  assert.equal(B.S.ben[0].dolm, 1);
  assert.equal(B.S.patches.length, 1);
  assert.equal(B.PLAN.A.ex.find(e => e.n === 'Plank').hi, 75, 'la modifica al piano e\' ricostruita');
  assert.equal(B.S.profilo.altezza, 170);
  assert.equal(B.S.freeze.until, 42);
  assert.equal(B.S.chiusure[39].bene, 'ok');
  assert.ok(foglio.__fogli.App_KPI.d.length > 20, 'KPI pubblicati');
});

test('dopo la lettura parte solo cio\' che cambia', async () => {
  const foglio = foglioFinto('segreto-di-prova-123');
  const A = telefono(foglio);
  await A._pullNow(false);
  for (let i = 0; i < 30; i++) A.S.ben.push({ date: giorno(A, -i), w: 40, hrv: 50 + i % 5 });
  await A._pushNow(true);
  const B = telefono(foglio); B.S.syncVer = 3;
  await B._pullNow(false);
  assert.equal(B.payloadV3(false).ben.length, 0, 'appena letto: niente da inviare');
  const oggi = B.S.ben.find(b => b.date === B.today()); oggi.refl = 2; B.benTouch(oggi.date);
  const p = B.payloadV3(false);
  assert.equal(p.ben.length, 1);
  assert.equal(p.log.length, 0);
  await B._pushNow(false);
  assert.equal(foglio.__ultimo.modo, 'delta');
  assert.equal(foglio.__ultimo.ben.length, 1);
  assert.equal(B.payloadV3(false).ben.length, 0, 'dopo l\'invio: di nuovo niente');
});

test('impostazioni piu recenti sul telefono non vengono sovrascritte dal foglio', async () => {
  const foglio = foglioFinto('segreto-di-prova-123');
  const A = telefono(foglio); await A._pullNow(false);
  A.S.profilo = { altezza: 170 }; A.cfgTocca('profilo'); await A._pushNow(false);
  const B = telefono(foglio); B.S.syncVer = 3; await B._pullNow(false);
  assert.equal(B.S.profilo.altezza, 170);
  B.S.profilo = { altezza: 171 }; B.cfgTocca('profilo');
  await B._pullNow(false);                                    // rilettura prima dell'invio
  assert.equal(B.S.profilo.altezza, 171);
});

test('con lo script v2 (senza versione 3) l\'app invia tutto come prima', async () => {
  const foglio = foglioFinto('segreto-di-prova-123');
  const A = telefono(foglio);
  A.S.syncVer = 2;
  A.S.ben = [{ date: giorno(A, -1), w: 40, hrv: 55 }];
  await A._pushNow(false);
  assert.equal(foglio.__ultimo.modo, undefined);
  assert.equal(foglio.__ultimo.cfg, undefined);
  assert.ok(Array.isArray(foglio.__ultimo.log));
});
