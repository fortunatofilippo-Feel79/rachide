/* ============================================================
   MEMORIA SUL FOGLIO (v3)
   Tutto quello che prima viveva solo sul telefono (modifiche al
   piano, impostazioni, chiusure, promemoria del coach) va nella
   scheda App_Config. Cambiando telefono basta collegare il foglio.
   Con lo script v3:
   - si legge con una POST: la frase segreta non sta nell'indirizzo;
   - si inviano solo le righe cambiate (un'impronta per riga ricorda
     cosa e' gia' sul foglio), non l'intero archivio;
   - i KPI con definizione e fonte vanno in App_KPI.
   Con lo script v2 tutto funziona come prima.
   ============================================================ */

/* ---------- gruppi di impostazioni e loro orologio ---------- */
var CFG_GRUPPI={
  patches:   function(){ return S.patches||[]; },
  impostazioni:function(){ return {freeze:S.freeze||null, cibOff:S.cibOff||0, cibOffTs:S.cibOffTs||"", passo1:!!S.passo1,
    picco:S.picco||{}, profilo:S.profilo||{}, orari:S.orari||{}, suoni:S.suoni!==false, suoniSilenzioso:S.suoniSilenzioso!==false,
    volume:S.volume||"normale", target:S.target||{}, propFatta:S.propFatta||"", vistaTutte:!!S.vistaTutte}; },
  chiusure:  function(){ return S.chiusure||{}; },
  coach:     function(){ return S.cdone||{}; },
  prodotti:  function(){ return S.prodotti||{}; },
  settimane: function(){ return {piano:S.pianoSett||{}, dispo:S.dispo||{}}; }
};
var CFG_ALIAS={picco:"impostazioni", profilo:"impostazioni", orari:"impostazioni", suoni:"impostazioni",
  freeze:"impostazioni", cibo:"impostazioni", passo1:"impostazioni", target:"impostazioni", proposta:"impostazioni"};
/* sostituisce lo stub del motore: ogni modifica segna il suo gruppo */
cfgTocca=function(k){ var g=CFG_ALIAS[k]||k; S.cfgTs=S.cfgTs||{}; S.cfgTs[g]=Date.now(); };
function cfgApplica(g, v){
  if(g==="patches" && Array.isArray(v)){ S.patches=v; PLAN=buildPlan(); }
  else if(g==="impostazioni" && v && typeof v==="object"){
    ["freeze","cibOff","cibOffTs","passo1","picco","profilo","orari","suoni","suoniSilenzioso","volume","target","propFatta","vistaTutte"]
      .forEach(function(k){ if(k in v) S[k]=v[k]; });
  }
  else if(g==="chiusure" && v && typeof v==="object") S.chiusure=v;
  else if(g==="coach" && v && typeof v==="object") S.cdone=v;
  else if(g==="settimane" && v && typeof v==="object"){ S.pianoSett=v.piano||{}; S.dispo=v.dispo||{}; }
  else if(g==="prodotti" && v && typeof v==="object") S.prodotti=Object.assign({}, S.prodotti||{}, v);   /* unione: un prodotto letto non si perde */
}
/* righe per App_Config: una per gruppo, spezzata se supera la cella di Sheets (50.000 caratteri) */
var CFG_PEZZO=40000;
function cfgRighe(soloCambiati){
  var out=[], ts=S.cfgTs||{}, inviati=S.cfgInviati||{};
  Object.keys(CFG_GRUPPI).forEach(function(g){
    if(soloCambiati && (ts[g]||0)<=(inviati[g]||0)) return;
    var v=JSON.stringify(CFG_GRUPPI[g]()), n=Math.max(1, Math.ceil(v.length/CFG_PEZZO)), t=ts[g]||Date.now();
    for(var i=0;i<n;i++) out.push({k: n===1? g : g+"#"+(i+1), gruppo:g, parte:i+1, parti:n, ts:t, v:v.slice(i*CFG_PEZZO,(i+1)*CFG_PEZZO)});
  });
  return out;
}
/* dal foglio: vince la versione piu' recente di ogni gruppo. Al primo collegamento
   di un telefono vince sempre il foglio (le impostazioni di fabbrica non sono "nuove"). */
function cfgAdotta(righe){
  if(!Array.isArray(righe) || !righe.length) return 0;
  var per={};
  righe.forEach(function(r){ var g=r.gruppo||String(r.k||"").split("#")[0]; if(!CFG_GRUPPI[g]) return;
    (per[g]=per[g]||[]).push(r); });
  var n=0, primo=!S.cfgLetto;
  S.cfgTs=S.cfgTs||{}; S.cfgInviati=S.cfgInviati||{};
  Object.keys(per).forEach(function(g){
    var parti=per[g].sort(function(a,b){ return (+a.parte||1)-(+b.parte||1); });
    var ts=+parti[0].ts||0, tot=+parti[0].parti||1;
    if(parti.length<tot) return;                                  /* pezzi mancanti: meglio non toccare */
    if(!primo && ts<=(S.cfgTs[g]||0)) return;                     /* il telefono e' piu' recente */
    var v; try{ v=JSON.parse(parti.map(function(p){ return p.v; }).join("")); }catch(e){ return; }
    cfgApplica(g, v); S.cfgTs[g]=ts; S.cfgInviati[g]=ts; n++;
  });
  S.cfgLetto=true;
  return n;
}

/* ---------- impronte delle righe: cosa c'e' gia' sul foglio ---------- */
var SYNC_CHIAVE={
  log:function(r){ return String(r.id||""); }, sess:function(r){ return String(r.id||""); },
  mis:function(r){ return String(r.date||""); }, ben:function(r){ return String(r.date||""); },
  sim:function(r){ return String(r.date||"")+"|"+String(r.ex||"")+"|"+String(r.q||""); }, mob:function(r){ return String(r.date||""); }
};
function impronta(o){
  var s=Object.keys(o).sort().map(function(k){ var v=o[k]; return k+"="+((v===null||v===undefined)?"":String(v)); }).join("\u0001"), h=0;
  for(var i=0;i<s.length;i++){ h=((h<<5)-h+s.charCodeAt(i))|0; }
  return String(h);
}
/* dopo una lettura: le righe che il foglio ha gia' (e il telefono non ha cambiato) sono "inviate" */
function improntaDopoLettura(remoti){
  var pay=SYNC.payloadAll(), sporchi=S.dirtyBen||{};
  S.syncHash=S.syncHash||{};
  Object.keys(SYNC_CHIAVE).forEach(function(c){
    var sul=remoti[c]; if(!sul) return;
    var m=S.syncHash[c]={};
    (pay[c]||[]).forEach(function(r){ var k=SYNC_CHIAVE[c](r); if(sul[k] && !(c==="ben" && sporchi[k])) m[k]=impronta(r); });
  });
}
function chiaviRemote(d){
  var out={};
  Object.keys(SYNC_CHIAVE).forEach(function(c){ if(!Array.isArray(d[c])) return; var m=out[c]={}; d[c].forEach(function(r){ m[SYNC_CHIAVE[c](r)]=1; }); });
  return out;
}
/* il carico per lo script v3: solo cio' che e' cambiato, piu' piano, stato e KPI (piccoli) */
function payloadV3(tutto){
  var pay=SYNC.payloadAll(), out={modo: tutto? "tutto":"delta"}, hs=S.syncHash||{}, nuovi={};
  Object.keys(SYNC_CHIAVE).forEach(function(c){
    var m=hs[c]||{}, righe=pay[c]||[];
    out[c]= tutto ? righe : righe.filter(function(r){ var h=impronta(r), k=SYNC_CHIAVE[c](r); if(m[k]!==h){ (nuovi[c]=nuovi[c]||{})[k]=h; return true; } return false; });
    if(tutto) righe.forEach(function(r){ (nuovi[c]=nuovi[c]||{})[SYNC_CHIAVE[c](r)]=impronta(r); });
  });
  out.piano=pay.piano; out.stato=pay.stato; out.kpi=kpiRows();
  out.cfg=cfgRighe(!tutto);
  out._impronte=nuovi;
  return out;
}
function dopoInvioV3(p){
  S.syncHash=S.syncHash||{};
  var nu=p._impronte||{};
  Object.keys(nu).forEach(function(c){
    if(p.modo==="tutto") S.syncHash[c]={};
    var m=S.syncHash[c]=S.syncHash[c]||{}; Object.keys(nu[c]).forEach(function(k){ m[k]=nu[c][k]; });
  });
  S.cfgInviati=S.cfgInviati||{};
  (p.cfg||[]).forEach(function(r){ S.cfgInviati[r.gruppo]=Math.max(S.cfgInviati[r.gruppo]||0, +r.ts||0); });
}
/* quanti dati partirebbero ora: per la scheda Coach */
function inAttesaV3(){
  var p=payloadV3(false), n=0;
  Object.keys(SYNC_CHIAVE).forEach(function(c){ n+=(p[c]||[]).length; });
  return {righe:n, cfg:p.cfg.length, kb:Math.round(JSON.stringify(p).length/1024)};
}

/* ---------- lettura e scrittura con lo script v3 ---------- */
SYNC.post=async function(body){
  var c=this.cfg(); body.secret=c.secret||"";
  var r=await fetch(c.url,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"}, body:JSON.stringify(body), redirect:"follow"});
  var d=JSON.parse(await r.text());
  if(!d.ok) throw new Error(d.err||"richiesta rifiutata");
  return d;
};
(function(){
  var pullV2=SYNC.pull, propV2=SYNC.proposta, adoptV2=SYNC.adopt;
  SYNC.pull=async function(){
    if((S.syncVer||1)>=3){
      try{ var d=await this.post({azione:"leggi"}); if(d && d.ok && +d.ver>=3) return d; }catch(e){ /* si scende alla lettura classica */ }
    }
    return pullV2.call(this);
  };
  SYNC.proposta=async function(){
    if((S.syncVer||1)>=3){
      try{ var d=await this.post({azione:"proposta"}); if(d && d.ok && ("proposta" in d)) return d.proposta || null; }catch(e){}
    }
    return propV2.call(this);
  };
  SYNC.adopt=function(d, t0){
    adoptV2.call(this, d, t0);
    S.syncVer = +d.ver || 1; this.ver=S.syncVer;
    if(S.syncVer>=3){
      if(d.cfg) cfgAdotta(d.cfg);
      improntaDopoLettura(chiaviRemote(d));
    }
  };
})();

/* frase segreta robusta: 32 caratteri casuali */
function segretoCasuale(){
  var a=new Uint8Array(24), s="";
  (window.crypto||crypto).getRandomValues(a);
  var alf="ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  for(var i=0;i<a.length;i++) s+=alf[a[i]%alf.length];
  return s;
}
