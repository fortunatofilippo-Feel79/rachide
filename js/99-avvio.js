/* ---------- clock ---------- */
setInterval(function(){
  var c=document.getElementById("sclock");
  if(c && S.draft){ c.textContent=clockTxt(); c.classList.toggle("warn", sessEta().late); }
  if(rest){
    var left=(rest.end-Date.now())/1000, r=document.getElementById("rclock");
    if(left>0 && left<=3.2 && Math.ceil(left)!==rest.cc){ rest.cc=Math.ceil(left); suono("conto"); }
    if(left<=0 && !rest.over){ rest.over=true; bip(1); if(navigator.vibrate) navigator.vibrate(200); toast("Recupero finito: si riparte");
      if(V==="oggi"&&S.draft) render(); }
    else if(left<=-30 && !rest.late){ rest.late=true; bip(2); if(navigator.vibrate) navigator.vibrate([150,80,150]);
      if(V==="oggi"&&S.draft) render(); }
    else if(left<-600){ stopRest(); if(V==="oggi"&&S.draft) render(); }
    else if(r){ r.textContent=restTxt(); }
    else if(V==="oggi"&&S.draft) render();
  }
}, 1000);

/* ---------- invio di sicurezza ----------
   Su iPhone l'app viene sospesa appena passi a un'altra app: un invio partito
   un attimo prima puo' non arrivare. Quando l'app va in background mando subito
   le giornate non ancora confermate (solo quelle, e' un invio piccolo); quando
   torni, o torna la rete, riprovo con l'invio normale. */
function flushBen(){
  try{
    if(!SYNC.on()) return;
    var ks=Object.keys(S.dirtyBen||{}); if(!ks.length) return;
    var c=SYNC.cfg(), rows=S.ben.filter(function(b){ return ks.indexOf(b.date)>=0; }).map(function(b){ return SYNC.benRow(b); });
    if(!rows.length) return;
    fetch(c.url,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},
      body:JSON.stringify({secret:c.secret||"", ben:rows}), keepalive:true}).catch(function(){});
  }catch(e){}
}
document.addEventListener("visibilitychange", function(){
  if(document.visibilityState==="hidden") flushBen();
  else if(SYNC.on()){
    if(Object.keys(S.dirtyBen||{}).length) doPush(false);
    propCheck(false).catch(function(){});
  }
});
window.addEventListener("online", function(){ if(SYNC.on() && Object.keys(S.dirtyBen||{}).length) doPush(false); });

/* ---------- seduta: scorri per cambiare esercizio ---------- */
(function(){
  var x0=null, y0=null;
  document.addEventListener("touchstart", function(ev){
    x0=null;
    if(!S.draft || S.vistaTutte || V!=="oggi") return;
    var sh=document.getElementById("sheet"); if(sh && sh.classList.contains("on")) return;
    if(ev.target.closest(".step,.pills,input,textarea,.fstrip,button")) return;
    var t=ev.touches[0]; x0=t.clientX; y0=t.clientY;
  }, {passive:true});
  document.addEventListener("touchend", function(ev){
    if(x0===null || !S.draft) return;
    var t=ev.changedTouches[0], dx=t.clientX-x0, dy=t.clientY-y0; x0=null;
    if(Math.abs(dx)>70 && Math.abs(dx)>Math.abs(dy)*1.6){
      var n=S.draft.ex.length, c=(S.draft.cur||0)+(dx<0?1:-1);
      if(c<0 || c>n+1) return;
      S.draft.cur=c; window._sy=0; save(); render();
    }
  }, {passive:true});
})();

/* ---------- boot ---------- */
async function avvia(){
  await Store.detect();
  var c_era = statoDaSalvato(await Store.get());
  if(!c_era){ S.installed=today(); await save(); }
  if(!S.installed) S.installed=today();
  /* la banda "azzurra" non esiste nel set: e' la blu */
  S.log.forEach(function(r){ if(r.band==="azzurra") r.band="blu"; });
  if(S.draft && S.draft.ex) S.draft.ex.forEach(function(e){ if(e.band==="azzurra") e.band="blu"; });
  PLAN = buildPlan();
  render();
  if(SYNC.on()) doPull(false).then(function(){ return propCheck(false); }).catch(function(){});
}
if(!window.__TEST__) avvia();

