/* Prova lo script del foglio (apps-script/Rachide.gs) contro un finto Google Sheets. */
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

function finto(segreto) {
  const fogli = {};
  function Foglio(nome) { this.nome = nome; this.d = []; this.formati = 0; }
  Foglio.prototype.getLastRow = function () { return this.d.length; };
  Foglio.prototype.getLastColumn = function () { return this.d.reduce((m, r) => Math.max(m, r.length), 0); };
  Foglio.prototype.clearContents = function () { this.d = []; };
  Foglio.prototype.deleteRow = function (r) { this.d.splice(r - 1, 1); };
  Foglio.prototype.getRange = function (r, c, nr, nc) {
    const f = this;
    return {
      getDisplayValues() { const o = []; for (let i = 0; i < nr; i++) { const row = []; for (let j = 0; j < nc; j++) { const v = (f.d[r - 1 + i] || [])[c - 1 + j]; row.push(v === undefined ? '' : String(v)); } o.push(row); } return o; },
      setValues(v) { v.forEach((row, i) => { f.d[r - 1 + i] = f.d[r - 1 + i] || []; row.forEach((x, j) => { f.d[r - 1 + i][c - 1 + j] = x; }); }); },
      setNumberFormat() { f.formati++; }
    };
  };
  const ss = { getSheetByName: n => fogli[n] || null, insertSheet: n => (fogli[n] = new Foglio(n)) };
  const props = {}; if (segreto !== undefined) props.SEGRETO = segreto;
  const ctx = {
    SpreadsheetApp: { getActive: () => ss },
    PropertiesService: { getScriptProperties: () => ({ getProperty: k => props[k] || null, setProperty: (k, v) => { props[k] = v; }, getProperties: () => Object.assign({}, props) }) },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    ContentService: { MimeType: { JSON: 'json', JAVASCRIPT: 'js', TEXT: 'text' }, createTextOutput: s => ({ s, setMimeType(m) { this.m = m; return this; } }) },
    Utilities: { getUuid: () => 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', formatDate: () => '01/11/2026' },
    Logger: { log() {} }, Session: { getScriptTimeZone: () => 'Europe/Rome' },
    DriveApp: { getFilesByName: () => ({ hasNext: () => false }) }, MimeType: { GOOGLE_DOCS: 'doc' }, DocumentApp: {},
    ScriptApp: { getService: () => ({ getUrl: () => 'https://script.google.com/macros/s/X/exec' }) },
    JSON, Object, Array, String
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'apps-script', 'Rachide.gs'), 'utf8'), ctx);
  ctx.__fogli = fogli; ctx.__props = props;
  return ctx;
}
const post = (ctx, body) => JSON.parse(ctx.doPost({ postData: { contents: JSON.stringify(body) } }).s);
const get = (ctx, p) => ctx.doGet({ parameter: p });

test('senza la frase segreta giusta non si legge e non si scrive', () => {
  const ctx = finto('segreto-di-prova-123');
  assert.equal(post(ctx, { secret: 'no', azione: 'leggi' }).err, 'segreto non valido');
  assert.equal(JSON.parse(get(ctx, { k: 'no' }).s).ok, false);
  assert.equal(post(ctx, { secret: 'no', log: [{ id: 'a' }] }).ok, false);
  assert.equal(ctx.__fogli.App_Log, undefined);
});

test('una frase troppo corta non apre il foglio', () => {
  const ctx = finto('corta');
  assert.equal(post(ctx, { secret: 'corta', azione: 'leggi' }).ok, false);
});

test('modo delta: aggiorna per chiave, aggiunge le nuove, non tocca le altre', () => {
  const ctx = finto('segreto-di-prova-123');
  const s = 'segreto-di-prova-123';
  post(ctx, { secret: s, modo: 'tutto', ben: [{ date: '01/11/2026', hrv: 50, note: 'a' }, { date: '02/11/2026', hrv: 52 }] });
  const r = post(ctx, { secret: s, modo: 'delta', ben: [{ date: '02/11/2026', hrv: 60 }, { date: '03/11/2026', hrv: 55, dolm: 2 }] });
  assert.equal(r.added.ben, 1);
  const letto = post(ctx, { secret: s, azione: 'leggi' }).ben;
  assert.deepEqual(letto.map(x => [x.date, x.hrv, x.note || '', x.dolm || '']),
    [['01/11/2026', '50', 'a', ''], ['02/11/2026', '60', '', ''], ['03/11/2026', '55', '', '2']]);
});

test('modo tutto riscrive la scheda; piano, stato e KPI si riscrivono sempre', () => {
  const ctx = finto('segreto-di-prova-123'), s = 'segreto-di-prova-123';
  post(ctx, { secret: s, modo: 'delta', piano: [{ id: 'A|x' }, { id: 'A|y' }], log: [{ id: 'l1', reps: '10|10|10' }] });
  post(ctx, { secret: s, modo: 'delta', piano: [{ id: 'A|y' }], log: [{ id: 'l2', reps: '8|8' }] });
  assert.equal(ctx.__fogli.App_Piano.d.length, 2);          // intestazione + 1 riga: A|x tolto
  assert.equal(ctx.__fogli.App_Log.d.length, 3);            // l1 resta, l2 aggiunta
  post(ctx, { secret: s, modo: 'tutto', log: [{ id: 'l3', reps: '9' }] });
  assert.equal(ctx.__fogli.App_Log.d.length, 2);
  assert.ok(ctx.__fogli.App_Log.formati > 0, 'formato testo impostato');
});

test('chiavi composte (simmetria) e cancellazioni', () => {
  const ctx = finto('segreto-di-prova-123'), s = 'segreto-di-prova-123';
  post(ctx, { secret: s, modo: 'delta', sim: [{ date: 'd', ex: 'A', q: '1', a: 'Sì' }, { date: 'd', ex: 'B', q: '1', a: 'No' }],
    sess: [{ id: 's1' }, { id: 's2' }] });
  post(ctx, { secret: s, modo: 'delta', sim: [{ date: 'd', ex: 'A', q: '1', a: 'No' }] });
  assert.equal(ctx.__fogli.App_Simmetria.d.length, 3);
  assert.equal(post(ctx, { secret: s, del: { sess: ['s1'] } }).tolte, 1);
  assert.deepEqual(post(ctx, { secret: s, azione: 'leggi' }).sess.map(x => x.id), ['s2']);
});

test('lettura via GET con JSONP e via POST restituiscono la stessa memoria, cfg compresa', () => {
  const ctx = finto('segreto-di-prova-123'), s = 'segreto-di-prova-123';
  post(ctx, { secret: s, modo: 'delta', cfg: [{ k: 'patches', gruppo: 'patches', parte: 1, parti: 1, ts: 5, v: '[]' }] });
  const g = get(ctx, { k: s, callback: 'rch_1' });
  assert.equal(g.m, 'js');
  assert.match(g.s, /^rch_1\(/);
  const p = post(ctx, { secret: s, azione: 'leggi' });
  assert.equal(p.ver, 3);
  assert.equal(p.cfg[0].k, 'patches');
  assert.equal(JSON.parse(get(ctx, { k: s, callback: 'x)alert(1' }).s).ok, true, 'callback non valida: niente JSONP');
});

test('proposta dalla scheda App_Proposta', () => {
  const ctx = finto('segreto-di-prova-123'), s = 'segreto-di-prova-123';
  assert.equal(post(ctx, { secret: s, azione: 'proposta' }).proposta, null);
  const sh = ctx.SpreadsheetApp.getActive().insertSheet('App_Proposta');
  sh.d = [['id', 'data', 'testo'], ['p1', '02/11/2026', '{"ops":[]}']];
  assert.equal(post(ctx, { secret: s, azione: 'proposta' }).proposta.id, 'p1');
});

test('generaSegreto salva una frase di 32 caratteri nelle proprieta', () => {
  const ctx = finto('');
  const k = ctx.generaSegreto();
  assert.equal(k.length, 32);
  assert.equal(ctx.__props.SEGRETO, k);
});

test('aperto dal browser senza niente: pagina di stato, senza dati e senza la frase', () => {
  const ctx = finto('segreto-di-prova-123');
  const r = get(ctx, {});
  assert.equal(r.m, 'text');
  assert.match(r.s, /script del foglio v3\.1/);
  assert.match(r.s, /Frase segreta: impostata \(20 caratteri\)/);
  assert.ok(!r.s.includes('segreto-di-prova-123'), 'la frase non si vede');
  assert.match(r.s, /App_Config: non ancora creata/);
  /* con un parametro qualsiasi resta la risposta dell'app */
  assert.equal(JSON.parse(get(ctx, { k: 'no' }).s).ok, false);
  const vuoto = finto(undefined);
  assert.match(get(vuoto, {}).s, /NON impostata/);
});

test('installa: tiene la frase che c\'e\' gia\', anche quella dello script vecchio, e crea le schede nuove', () => {
  const a = finto('frase-gia-presente-1');
  const t = a.installa();
  assert.equal(a.__props.SEGRETO, 'frase-gia-presente-1');
  assert.match(t, /la stessa di prima/);
  assert.ok(a.__fogli.App_Config && a.__fogli.App_KPI, 'schede nuove create');
  /* script v2 con la frase in un'altra proprieta' */
  const b = finto(undefined); b.__props.SECRET = 'frase-della-v2-xyz';
  b.installa();
  assert.equal(b.__props.SEGRETO, 'frase-della-v2-xyz');
  assert.equal(JSON.parse(get(b, { k: 'frase-della-v2-xyz' }).s).ok, true, 'l\'app continua a funzionare con la stessa frase');
  /* nessuna frase: ne crea una nuova e la scrive */
  const c = finto(undefined);
  const tc = c.installa();
  assert.equal(c.__props.SEGRETO.length, 32);
  assert.match(tc, /FRASE SEGRETA NUOVA: [a-z0-9]{32}/);
});
