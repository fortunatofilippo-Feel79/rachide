/* ============================================================
   MOTORE
   ============================================================ */
var KEY = "rachide:v1";
var S = {log:[], sess:[], mis:[], ben:[], sim:[], mob:[], patches:[], draft:null, seeded:false, dirtyBen:{}, benTs:{},
         lastBackup:null, installed:null, intent:null};

/* ---------- storage ----------
   Regola: non fidarsi mai della scrittura. Ogni salvataggio viene
   riletto e confrontato. Se non torna indietro uguale, l'app lo dice
   invece di far finta di niente. */
var Store = {
  mode:"?", ok:null, last:null, bytes:0, err:"", fallback:false,
  async probe(k,v){
    if(this.mode==="artifact"){ await window.storage.set(k,v); var r=await window.storage.get(k); return r&&r.value; }
    if(this.mode==="device"){ localStorage.setItem(k,v); return localStorage.getItem(k); }
    return null;
  },
  async detect(){
    if(typeof window!=="undefined" && window.storage && window.storage.set){
      this.mode="artifact";
      try{ if(await this.probe(KEY+":probe","1")==="1") return this.mode; }
      catch(e){ this.err="artifact: "+(e&&e.message||e); }
    }
    if(this.mode==="artifact") this.fallback=true;
    this.mode="device";
    try{ if(await this.probe(KEY+":probe","1")==="1"){ localStorage.removeItem(KEY+":probe"); return this.mode; } }
    catch(e){ this.err=(this.err?this.err+" · ":"")+"device: "+(e&&e.message||e); }
    this.mode="none";
    return this.mode;
  },
  async get(){
    try{
      if(this.mode==="artifact"){ var r=await window.storage.get(KEY); return r? JSON.parse(r.value):null; }
      if(this.mode==="device"){ var v=localStorage.getItem(KEY); return v? JSON.parse(v):null; }
    }catch(e){ this.err="lettura: "+(e&&e.message||e); }
    return null;
  },
  async set(o){
    if(this.mode==="none"){ this.ok=false; return false; }
    try{
      o.savedAt = new Date().toISOString();
      var s=JSON.stringify(o); this.bytes=s.length;
      if(this.mode==="artifact") await window.storage.set(KEY,s); else localStorage.setItem(KEY,s);
      /* rilettura di verifica */
      var back = this.mode==="artifact" ? (await window.storage.get(KEY)||{}).value : localStorage.getItem(KEY);
      if(!back || back.length!==s.length){ this.ok=false; this.err="verifica fallita"; return false; }
      this.ok=true; this.last=new Date(); this.err=""; return true;
    }catch(e){ this.ok=false; this.err="scrittura: "+(e&&e.message||e); return false; }
  }
};
async function save(){ var r=await Store.set(S);
  if(!r && !Store._shown && typeof PLAN!=="undefined" && PLAN){ Store._shown=true; render(); }
  return r; }

/* ---------- date ---------- */
var W0 = new Date(2026,6,13); /* lunedì della settimana 24 */
function d2s(d){ var p=n=>String(n).padStart(2,"0"); return p(d.getDate())+"/"+p(d.getMonth()+1)+"/"+d.getFullYear(); }
function s2d(s){ var a=String(s).split("/"); return new Date(+a[2],+a[1]-1,+a[0]); }
/* Una data non valida rendeva NaN ogni confronto: l'ordinamento diventava
   imprevedibile e la riga rotta poteva finire in fondo, mascherando quella
   buona. Qui le righe rotte vengono spinte sempre all'inizio, mai in coda. */
function dataOk(v){
  var a=String(v||"").split("/");
  if(a.length!==3) return false;
  var g=+a[0], m=+a[1], y=+a[2];
  if(!(g>=1&&g<=31&&m>=1&&m<=12&&y>=2000&&y<=2100)) return false;
  var t=new Date(y,m-1,g);
  return !isNaN(t.getTime()) && t.getDate()===g && t.getMonth()===m-1 && t.getFullYear()===y;
}
function ordinaData(arr){
  return arr.slice().sort(function(a,b){
    var A=dataOk(a.date)?s2d(a.date).getTime():-Infinity;
    var B=dataOk(b.date)?s2d(b.date).getTime():-Infinity;
    return A-B;
  });
}
function ultimoValido(arr){
  if(!arr || !arr.length) return null;
  for(var i=arr.length-1;i>=0;i--) if(dataOk(arr[i].date)) return arr[i];
  return null;
}
function conteggiaRotte(){
  var n=0;
  [S.log,S.sess,S.mis,S.ben,S.sim,S.mob].forEach(function(a){
    (a||[]).forEach(function(r){ if(!dataOk(r.date)) n++; });
  });
  return n;
}
function weekOf(s){ return 24 + Math.floor((s2d(s)-W0)/604800000); }
function today(){ return d2s(new Date()); }
function dayName(s){ return ["Domenica","Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato"][s2d(s).getDay()]; }
function ago(s){ var n=Math.round((new Date().setHours(0,0,0,0)-s2d(s))/86400000);
  return n===0?"oggi":n===1?"ieri":n+" giorni fa"; }

/* ---------- seed ---------- */
function parse(txt, keys){
  return txt.trim().split("\n").filter(l=>l.trim()).map(function(l){
    var p=l.split("|"), o={};
    keys.forEach(function(k,i){ o[k]= p[i]===undefined?"":p[i].trim(); });
    return o;
  });
}
function seed(){
  S.log = parse(SEED_LOG,["w","date","day","ex","side","band","load","reps","rir","top","note"]).map(function(r,i){
    return {id:"h"+i, w:+r.w, date:r.date, day:r.day, ex:r.ex, side:r.side, band:r.band,
      load: r.load?+r.load:0, reps: r.reps?r.reps.split(".").map(Number):[],
      rir: r.rir===""?null:+r.rir, top: r.top==="1", note:r.note};
  });
  S.sess = parse(SEED_SESS,["w","date","day","sede","mod","min","en","warm","sig","note"]).map(function(r,i){
    return {id:"s"+i, w:+r.w, date:r.date, day:r.day, sede:r.sede, mod:r.mod, min:+r.min||0,
      en:+r.en||0, warm:r.warm==="1", sig:r.sig==="1", note:r.note};
  });
  S.mis = parse(SEED_MIS,["w","date","peso","torace","bic","coscia","vita","note"]).map(function(r){
    return {w:+r.w, date:r.date, peso:+r.peso||null, torace:+r.torace||null, bic:+r.bic||null,
      coscia:+r.coscia||null, vita:+r.vita||null, note:r.note};
  });
  S.ben = parse(SEED_BEN,["date","w","refl","resp","camm","hrv","read","sonno","alc","note"]).map(function(r){
    return {date:r.date, w:+r.w, refl:r.refl===""?null:+r.refl, resp:r.resp==="1",
      camm:r.camm===""?null:+r.camm, hrv:+r.hrv||null, read:+r.read||null,
      sonno:+r.sonno||null, alc:r.alc==="1", note:r.note};
  });
  S.seeded = true;
}

/* ---------- lettura storico ---------- */
var ALIAS={"Reverse Fly":["Reverse Fly manubri","Reverse Fly leggero"]};
var PLAN_W0=30; /* prima settimana del Piano Unico v5 */
function meta(n){ return EX[n] || {g:"—", t:"compl"}; }
function hist(name, side){
  var names=[name];
  return S.log.filter(r=>names.indexOf(r.ex)>=0 && (side===undefined || r.side===side))
              .sort((a,b)=>s2d(a.date)-s2d(b.date));
}
/* storico esteso: include i nomi con cui l'esercizio era loggato prima del piano v5 */
function histAll(name){
  var names=[name].concat(ALIAS[name]||[]);
  return S.log.filter(r=>names.indexOf(r.ex)>=0).sort((a,b)=>s2d(a.date)-s2d(b.date));
}
/* un carico che non hai chiuso non diventa il nuovo standard */
function suggestLoad(def){
  var h=hist(def.n).filter(r=>r.load>0);
  if(!h.length) return def.L||0;
  var last=h[h.length-1];
  if(def.L && last.load>def.L && !last.top) return def.L;
  return last.load;
}
function lastLoad(name, fallback){
  var h = hist(name).filter(r=>r.load>0);
  return h.length ? h[h.length-1].load : (fallback||0);
}
function lastBand(name, fallback){
  var h = hist(name).filter(r=>r.band);
  return h.length ? h[h.length-1].band : (fallback||"");
}
function lastTwo(name){
  var h = hist(name), seen=[], out=[];
  for(var i=h.length-1;i>=0 && out.length<2;i--){
    if(seen.indexOf(h[i].date)<0){ seen.push(h[i].date); out.push(h[i]); }
  }
  return out;
}
/* soglia doppia progressione: top del range su ≥3 serie su 4, o 3 su 3, o 2 su 2 */
function isTop(reps, hi, sets){
  if(!reps || !reps.length) return false;
  var need = sets>=3 ? 3 : sets;
  return reps.filter(r=>r>=hi).length >= Math.min(need, reps.length) && reps.length>=Math.min(sets,need);
}

/* gradino di carico: con i dischi da 0,5 kg si sale di 1 kg per manubrio,
   tranne sugli esercizi con un tetto per la spalla, che restano come sono */
var CLIN={"Curl bicipiti manubri":1,"Hammer Curl":1,"Reverse Fly":1,"Face pull":1,"Overhead extension 1 braccio":1};
function stepOf(n){
  var m=meta(n);
  if(S.passo1 && !CLIN[n] && !m.band && !m.sec) return Math.min(1, m.step||2);
  return m.step||2;
}

/* ---------- il motore di progressione ---------- */
function readiness(exDef){
  var n=exDef.n, m=meta(n), h=histAll(n), out={ready:false, why:"", cap:false};
  if(exDef.hold){ out.hold=exDef.hold; return out; }
  if(!h.length) return out;
  var dates=[...new Set(h.map(r=>r.date))].slice(-2);
  if(dates.length<2) return out;
  var ok = dates.every(function(d){
    var rows=h.filter(r=>r.date===d);
    if(exDef.u){ return rows.every(r=>isTop(r.reps, exDef.hi, exDef.s)); }
    return rows.some(r=>isTop(r.reps, exDef.hi, exDef.s));
  });
  if(!ok) return out;
  /* regola dell'11/10: sui composti il top vale per salire solo a RIR 1-2.
     Un top raggiunto a cedimento (RIR 0) resta un buon dato, non una promozione. */
  if(m.t==="comp"){
    var ced=dates.filter(function(d){ return h.some(function(r){ return r.date===d && r.rir===0; }); });
    if(ced.length){ out.cedimento=ced.length; return out; }
  }
  var cur = exDef.b ? lastBand(n, exDef.b) : suggestLoad(exDef);
  if(exDef.b){
    var i=BANDS.indexOf(cur);
    if(i>=BANDS.length-1){ return {ready:true, cap:true, why:"Banda rossa: aggiungi una serie o rallenta il ritorno a 3s"}; }
    return {ready:true, why:"banda "+cur+" → "+BANDS[i+1], next:BANDS[i+1]};
  }
  if(m.cap && cur>=m.cap){
    var alt = n.indexOf("Reverse Fly")===0 ? "6 kg è tetto assoluto finché non hai una valutazione. Non salire."
            : n.indexOf("Floor Press")===0 ? "tetto manubri: sali di ripetizioni fino a 12, poi 1 s di pausa a terra"
            : n.indexOf("Curl")===0||n.indexOf("Hammer")===0 ? "tetto 8 kg: si progredisce di ripetizioni, fino a 12"
            : n.indexOf("Face pull")===0 ? "tetto 6 kg: si progredisce con 2 s di tenuta a gomiti alti"
            : "tetto raggiunto: progredisci con tempo o ripetizioni";
    return {ready:true, cap:true, why:alt};
  }
  if(!cur) return {ready:true, why:"passa alla variante successiva della scala"};
  var step = stepOf(n);
  return {ready:true, why:cur+" → "+(cur+step)+" kg", next:cur+step};
}

