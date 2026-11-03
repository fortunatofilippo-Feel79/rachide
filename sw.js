/* ============================================================
   SERVICE WORKER — l'app si apre anche senza rete
   Tutti i file dell'app stanno in una cache con la versione nel
   nome. Una versione nuova si installa in silenzio e aspetta: l'app
   mostra «Nuova versione pronta» e si aggiorna quando lo dici tu,
   cosi' una seduta in corso non viene mai interrotta.
   Le chiamate al foglio (script.google.com) non passano di qui.
   Quando cambi un file dell'app, aumenta VERSIONE (e VERSIONE_APP
   in js/01-dati.js: un test controlla che coincidano).
   ============================================================ */
var VERSIONE = "rachide-4.1.0";
var GUSCIO = [
  "./", "index.html", "manifest.webmanifest", "css/app.css",
  "js/01-dati.js", "js/02-motore.js", "js/03-cibo.js", "js/04-extra-coach.js", "js/05-analisi.js",
  "js/06-seduta.js", "js/07-animazioni.js", "js/08-sync.js", "js/09-viste.js", "js/10-azioni.js",
  "js/12-figure.js", "js/13-guida.js", "js/14-kpi.js", "js/15-promemoria.js", "js/16-memoria.js", "js/17-codici.js", "js/18-dolore.js", "js/19-pianificatore.js", "js/99-avvio.js",
  "js/vendor/zxing-0.23.0.min.js",
  "icone/icona-192.png", "icone/icona-512.png", "icone/icona-maskable-512.png", "icone/apple-touch-icon.png", "icone/favicon-64.png"
];

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(VERSIONE).then(function(c){
    return c.addAll(GUSCIO.map(function(u){ return new Request(u, {cache:"reload"}); }));
  }));
});

self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(chiavi){
    return Promise.all(chiavi.filter(function(k){ return k.indexOf("rachide-")===0 && k!==VERSIONE; })
      .map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

self.addEventListener("message", function(e){
  if(e.data === "aggiorna") self.skipWaiting();
});

self.addEventListener("fetch", function(e){
  var req = e.request, url = new URL(req.url);
  if(req.method !== "GET" || url.origin !== self.location.origin) return;
  if(req.mode === "navigate"){
    e.respondWith(caches.match("index.html").then(function(hit){ return hit || fetch(req); }));
    return;
  }
  e.respondWith(caches.match(req, {ignoreSearch:true}).then(function(hit){
    return hit || fetch(req).then(function(r){
      if(r && r.ok){ var copia = r.clone(); caches.open(VERSIONE).then(function(c){ c.put(req, copia); }); }
      return r;
    });
  }));
});
