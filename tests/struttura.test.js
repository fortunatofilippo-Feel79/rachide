const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { carica, RADICE, fileApp } = require('./carica');

const html = fs.readFileSync(path.join(RADICE, 'index.html'), 'utf8');
const sw = fs.readFileSync(path.join(RADICE, 'sw.js'), 'utf8');

test('index.html carica tutti i file JS, in ordine, con 99-avvio per ultimo', () => {
  const inclusi = [...html.matchAll(/<script src="js\/([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(inclusi, fileApp());
  assert.equal(inclusi[inclusi.length - 1], '99-avvio.js');
});

test('la cache offline contiene ogni file dell\'app', () => {
  const guscio = JSON.parse(sw.match(/var GUSCIO = (\[[^]*?\]);/)[1].replace(/\s+/g, ' '));
  for (const f of fileApp()) assert.ok(guscio.includes('js/' + f), 'manca js/' + f);
  for (const f of ['index.html', 'css/app.css', 'manifest.webmanifest']) assert.ok(guscio.includes(f), f);
  for (const f of guscio.filter(x => x !== './')) assert.ok(fs.existsSync(path.join(RADICE, f)), 'non esiste: ' + f);
});

test('versione dell\'app e del service worker coincidono', () => {
  const ctx = carica();
  assert.equal(sw.match(/var VERSIONE = "rachide-([\d.]+)"/)[1], ctx.VERSIONE_APP);
});

test('il manifest e\' valido e le icone esistono', () => {
  const m = JSON.parse(fs.readFileSync(path.join(RADICE, 'manifest.webmanifest'), 'utf8'));
  assert.equal(m.display, 'standalone');
  assert.equal(m.start_url, './');
  for (const i of m.icons) assert.ok(fs.existsSync(path.join(RADICE, i.src)), i.src);
});
