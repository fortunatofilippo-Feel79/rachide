/* Carica i file dell'app in un contesto isolato, con un browser finto minimo.
   Nessuna dipendenza: si usa con `node --test`. L'orologio e' fermo a `now`,
   cosi' le date relative (oggi, ieri, settimana) sono ripetibili. */
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const RADICE = path.join(__dirname, '..');

function elementoFinto() {
  const el = {
    innerHTML: '', textContent: '', value: '', style: {}, dataset: {}, children: [],
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    setAttribute() {}, getAttribute() { return null; }, appendChild(c) { return c; }, removeChild() {},
    addEventListener() {}, removeEventListener() {}, scrollTo() {}, scrollY: 0, querySelector() { return null; }, querySelectorAll() { return []; },
    closest() { return null; }, focus() {}, click() {}, getContext() { return null; }
  };
  return el;
}

function fileApp() {
  return fs.readdirSync(path.join(RADICE, 'js')).filter(f => /^\d\d-.*\.js$/.test(f)).sort();
}

function carica(opt) {
  opt = opt || {};
  const ora = opt.now || new Date(2026, 10, 3, 10, 0, 0).getTime();
  const DataVera = Date;
  class DataFinta extends DataVera {
    constructor(...a) { if (a.length === 0) super(ora); else super(...a); }
    static now() { return ora; }
  }
  const memoria = {};
  const elementi = {};
  const ctx = {
    console, Math, JSON, Promise, Object, Array, String, Number, Boolean, RegExp, Error, Set, Map, Symbol, Intl,
    parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent, escape, unescape,
    Date: DataFinta,
    setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
    requestAnimationFrame: () => 0, cancelAnimationFrame() {},
    performance: { now: () => 0 },
    localStorage: {
      getItem: k => (k in memoria ? memoria[k] : null),
      setItem: (k, v) => { memoria[k] = String(v); },
      removeItem: k => { delete memoria[k]; }
    },
    sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    document: {
      getElementById: id => (elementi[id] = elementi[id] || elementoFinto()),
      querySelector: () => null, querySelectorAll: () => [],
      createElement: () => elementoFinto(), createElementNS: () => elementoFinto(),
      addEventListener() {}, body: elementoFinto(), visibilityState: 'visible'
    },
    navigator: { clipboard: null },
    location: { origin: 'http://localhost', pathname: '/', href: 'http://localhost/' },
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    addEventListener() {}, removeEventListener() {}, scrollTo() {}, scrollY: 0,
    fetch: () => Promise.reject(new Error('rete non disponibile nei test')),
    crypto: require('node:crypto').webcrypto,
    TextEncoder, TextDecoder, Blob: class {}, URL,
    __TEST__: true
  };
  ctx.window = ctx; ctx.self = ctx; ctx.globalThis = ctx;
  vm.createContext(ctx);
  const files = opt.files || fileApp();
  for (const f of files) {
    vm.runInContext(fs.readFileSync(path.join(RADICE, 'js', f), 'utf8'), ctx, { filename: 'js/' + f });
  }
  ctx.__memoria = memoria;
  return ctx;
}

/* data "gg/mm/aaaa" a n giorni da oggi (negativo = passato), per il contesto dato */
function giorno(ctx, n) {
  const d = new ctx.Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + n);
  return ctx.d2s(d);
}

module.exports = { carica, giorno, RADICE, fileApp };
