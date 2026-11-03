/* ============================================================
   RACHIDE — script del foglio, versione 3
   Va incollato in Estensioni → Apps Script del foglio Google che
   fa da memoria all'app. Sostituisce lo script v2 per intero.
   Istruzioni passo passo: apps-script/LEGGIMI.md

   Cosa fa:
   - legge e scrive le schede App_* (una riga per record);
   - scrive solo le righe che l'app manda (modo "delta"), oppure
     riscrive tutto (modo "tutto", il pulsante Invia tutto);
   - conserva piano, impostazioni e chiusure in App_Config:
     cambiando telefono, l'app riprende tutto da qui;
   - pubblica i KPI con definizione e fonte in App_KPI;
   - restituisce la proposta della settimana (App_Proposta o un file su Drive).
   ============================================================ */

var VERSIONE = 3;

/* Frase segreta: meglio nelle proprietà dello script (Impostazioni progetto →
   Proprietà dello script → SEGRETO), oppure esegui una volta generaSegreto().
   Se proprio vuoi, scrivila qui tra le virgolette. */
var SEGRETO_QUI = "";

/* Proposta della settimana. Se la review della domenica la scrive in un file su
   Drive, metti qui il nome esatto del file (quello che usava lo script v2).
   Altrimenti la cerco nell'ultima riga della scheda App_Proposta (id, data, testo). */
var PROPOSTA_FILE = "";
var PROPOSTA_SCHEDA = "App_Proposta";

var SCHEDE = {
  log:   {nome:"App_Log",       chiave:["id"]},
  sess:  {nome:"App_Sessioni",  chiave:["id"]},
  mis:   {nome:"App_Misure",    chiave:["date"]},
  ben:   {nome:"App_Benessere", chiave:["date"]},
  sim:   {nome:"App_Simmetria", chiave:["date","ex","q"]},
  mob:   {nome:"App_Mobilita",  chiave:["date"]},
  cfg:   {nome:"App_Config",    chiave:["k"]},
  piano: {nome:"App_Piano",     chiave:["id"], sempreTutto:true},
  stato: {nome:"App_Stato",     chiave:["w"],  sempreTutto:true},
  kpi:   {nome:"App_KPI",       chiave:["k"],  sempreTutto:true}
};
var DA_LEGGERE = ["log","sess","mis","ben","sim","mob","cfg"];

/* ---------- ingresso ---------- */
function doGet(e){
  var p = (e && e.parameter) || {}, cb = p.callback;
  if(!segretoOk_(p.k)) return risposta_({ok:false, err:"segreto non valido"}, cb);
  if(p.azione === "proposta") return risposta_({ok:true, ver:VERSIONE, proposta:proposta_()}, cb);
  return risposta_(leggiTutto_(), cb);
}

function doPost(e){
  var body;
  try{ body = JSON.parse((e && e.postData && e.postData.contents) || "{}"); }
  catch(err){ return risposta_({ok:false, err:"richiesta non leggibile"}); }
  if(!segretoOk_(body.secret)) return risposta_({ok:false, err:"segreto non valido"});
  if(body.azione === "leggi") return risposta_(leggiTutto_());
  if(body.azione === "proposta") return risposta_({ok:true, ver:VERSIONE, proposta:proposta_()});
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try{
    if(body.del) return risposta_({ok:true, ver:VERSIONE, tolte:cancella_(body.del)});
    var modo = body.modo === "delta" ? "delta" : "tutto";   /* senza modo: app vecchia, come la v2 */
    var aggiunte = {};
    Object.keys(SCHEDE).forEach(function(c){
      if(!Array.isArray(body[c])) return;
      var s = SCHEDE[c];
      aggiunte[c] = scrivi_(s.nome, body[c], s.chiave, modo === "tutto" || !!s.sempreTutto);
    });
    return risposta_({ok:true, ver:VERSIONE, added:aggiunte});
  } finally {
    lock.releaseLock();
  }
}

/* ---------- segreto ---------- */
function segreto_(){
  var p = PropertiesService.getScriptProperties().getProperty("SEGRETO");
  return String(p || SEGRETO_QUI || "");
}
function segretoOk_(k){
  var s = segreto_();
  return s.length >= 8 && String(k || "") === s;
}
/* Esegui una volta: crea una frase segreta robusta e la mostra nel registro. */
function generaSegreto(){
  var s = (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, "").slice(0, 32);
  PropertiesService.getScriptProperties().setProperty("SEGRETO", s);
  Logger.log("Frase segreta (copiala nell'app, Coach → Collegamento al foglio → Modifica): " + s);
  return s;
}
/* Stampa il link di prova da incollare nell'app (contiene la frase: non condividerlo). */
function verifica(){
  var u = ScriptApp.getService().getUrl();
  Logger.log("Link di prova: " + u + "?k=" + encodeURIComponent(segreto_()));
  Logger.log(JSON.stringify(leggiTutto_()).slice(0, 400));
}

/* ---------- lettura ---------- */
function leggiTutto_(){
  var out = {ok:true, ver:VERSIONE};
  DA_LEGGERE.forEach(function(c){ out[c] = leggi_(SCHEDE[c].nome); });
  return out;
}
function leggi_(nome){
  var sh = SpreadsheetApp.getActive().getSheetByName(nome);
  if(!sh || sh.getLastRow() < 2 || sh.getLastColumn() < 1) return [];
  var v = sh.getRange(1, 1, sh.getLastRow(), sh.getLastColumn()).getDisplayValues();
  var h = v.shift();
  return v.filter(function(r){ return r.some(function(x){ return x !== ""; }); }).map(function(r){
    var o = {}; h.forEach(function(c, i){ if(c) o[c] = r[i]; }); return o;
  });
}

/* ---------- scrittura ---------- */
function foglio_(nome){
  var ss = SpreadsheetApp.getActive();
  return ss.getSheetByName(nome) || ss.insertSheet(nome);
}
function testo_(v){
  if(v === null || v === undefined) return "";
  if(typeof v === "object") return JSON.stringify(v);
  return String(v);
}
/* Upsert per chiave. Le colonne nuove si aggiungono in fondo, quelle che l'app
   non manda restano com'erano. Tutto in formato testo: Sheets non trasforma
   "10|10|10" o "03/11/2026" in altro. Ritorna quante righe sono nuove. */
function scrivi_(nome, righe, chiave, tutto){
  var sh = foglio_(nome);
  var lastR = sh.getLastRow(), lastC = sh.getLastColumn();
  var head = lastC ? sh.getRange(1, 1, 1, lastC).getDisplayValues()[0].filter(function(x){ return x !== ""; }) : [];
  righe.forEach(function(o){ Object.keys(o).forEach(function(k){ if(k.charAt(0) !== "_" && head.indexOf(k) < 0) head.push(k); }); });
  chiave.forEach(function(k){ if(head.indexOf(k) < 0) head.unshift(k); });
  var dati = (!tutto && lastR > 1) ? sh.getRange(2, 1, lastR - 1, Math.max(lastC, 1)).getDisplayValues() : [];
  var vecchie = lastC ? sh.getRange(1, 1, 1, lastC).getDisplayValues()[0] : [];
  /* riallinea le righe esistenti alle colonne di adesso */
  dati = dati.map(function(r){ return head.map(function(c){ var i = vecchie.indexOf(c); return i >= 0 ? r[i] : ""; }); });
  var ki = chiave.map(function(k){ return head.indexOf(k); });
  var chiaveRiga = function(r){ return ki.map(function(i){ return r[i]; }).join("\u0001"); };
  var chiaveOgg = function(o){ return chiave.map(function(k){ return testo_(o[k]); }).join("\u0001"); };
  var dove = {};
  dati.forEach(function(r, i){ dove[chiaveRiga(r)] = i; });
  var nuove = 0;
  righe.forEach(function(o){
    var k = chiaveOgg(o);
    if(k.replace(/\u0001/g, "") === "") return;
    if(k in dove){
      var r = dati[dove[k]];
      head.forEach(function(c, i){ if(Object.prototype.hasOwnProperty.call(o, c)) r[i] = testo_(o[c]); });
    } else {
      dove[k] = dati.length;
      dati.push(head.map(function(c){ return testo_(o[c]); }));
      nuove++;
    }
  });
  sh.clearContents();
  var tutte = [head].concat(dati);
  var rng = sh.getRange(1, 1, tutte.length, head.length);
  rng.setNumberFormat("@");
  rng.setValues(tutte);
  return nuove;
}

/* ---------- cancellazioni: {sess:[id], log:[id], ben:[data], piano:[id]} ---------- */
function cancella_(mappa){
  var n = 0;
  Object.keys(mappa || {}).forEach(function(c){
    var s = SCHEDE[c]; if(!s || !Array.isArray(mappa[c]) || !mappa[c].length) return;
    var sh = SpreadsheetApp.getActive().getSheetByName(s.nome);
    if(!sh || sh.getLastRow() < 2) return;
    var head = sh.getRange(1, 1, 1, sh.getLastColumn()).getDisplayValues()[0];
    var col = head.indexOf(s.chiave[0]); if(col < 0) return;
    var val = sh.getRange(2, col + 1, sh.getLastRow() - 1, 1).getDisplayValues().map(function(r){ return r[0]; });
    var via = mappa[c].map(String);
    for(var i = val.length - 1; i >= 0; i--){
      if(via.indexOf(val[i]) >= 0){ sh.deleteRow(i + 2); n++; }
    }
  });
  return n;
}

/* ---------- proposta della settimana ---------- */
function proposta_(){
  var sh = SpreadsheetApp.getActive().getSheetByName(PROPOSTA_SCHEDA);
  if(sh && sh.getLastRow() > 1){
    var v = sh.getRange(sh.getLastRow(), 1, 1, 3).getDisplayValues()[0];
    if(v[2]) return {id:String(v[0] || ("riga" + sh.getLastRow())), data:String(v[1] || ""), testo:String(v[2])};
  }
  if(!PROPOSTA_FILE) return null;
  var it = DriveApp.getFilesByName(PROPOSTA_FILE), f = null;
  while(it.hasNext()){ var x = it.next(); if(!f || x.getLastUpdated() > f.getLastUpdated()) f = x; }
  if(!f) return null;
  var t = f.getMimeType() === MimeType.GOOGLE_DOCS ? DocumentApp.openById(f.getId()).getBody().getText() : f.getBlob().getDataAsString();
  var j = null; try{ j = JSON.parse(t); }catch(err){}
  if(j && j.testo) return {id:String(j.id || f.getId()), data:String(j.data || ""), testo:String(j.testo)};
  return {id:f.getId() + "@" + f.getLastUpdated().getTime(),
          data:Utilities.formatDate(f.getLastUpdated(), Session.getScriptTimeZone(), "dd/MM/yyyy"), testo:t};
}

/* ---------- uscita: JSON, oppure JSONP se c'e' callback ---------- */
function risposta_(obj, cb){
  var s = JSON.stringify(obj);
  if(cb && /^[\w$.]{1,64}$/.test(cb)){
    return ContentService.createTextOutput(cb + "(" + s + ")").setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(s).setMimeType(ContentService.MimeType.JSON);
}
