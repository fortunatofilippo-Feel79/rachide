/* ============================================================
   GUIDA — come si fa, quando serve
   Scheda tecnica con la figura animata, riscaldamento guidato a
   tempo, timer per le tenute, libreria degli esercizi, suoni.
   ============================================================ */

/* ---------- suoni ----------
   Su iPhone l'audio del web tace col tasto silenzioso, a meno di chiedere la
   sessione "playback" (Safari 17+, WebKit bug 237322). Si chiede solo se lo vuoi. */
function suoniOn(){ return S.suoni!==false; }
function suono(tipo){
  if(!suoniOn()) return;
  suonoPronto();
  var T={serie:[[1200,0.06]], conto:[[880,0.05]], via:[[660,0.08],[990,0.12]], fine:[[880,0.18]],
    tardi:[[660,0.16],[660,0.16]], step:[[740,0.1],[988,0.14]], bersaglio:[[988,0.12],[1318,0.18]],
    salvata:[[523,0.1],[659,0.1],[784,0.1],[1046,0.22]], record:[[660,0.12],[880,0.12],[1100,0.2]]}[tipo]||[[880,0.12]];
  try{
    if(!_AC) return; var t=_AC.currentTime+0.01;
    T.forEach(function(n){
      var o=_AC.createOscillator(), g=_AC.createGain();
      o.type="sine"; o.frequency.value=n[0];
      g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(S.volume==="basso"?0.08:0.24,t+0.015);
      g.gain.exponentialRampToValueAtTime(0.0001,t+n[1]);
      o.connect(g); g.connect(_AC.destination); o.start(t); o.stop(t+n[1]+0.02);
      t+=n[1]+0.05;
    });
  }catch(e){}
}
/* sostituisce il vecchio bip: stesso significato, suoni con un nome */
function bip(n){ suono(n===3?"record":n===2?"tardi":"fine"); }
var _suonoPronto0 = suonoPronto;
suonoPronto = function(){
  try{ if(S.suoniSilenzioso!==false && navigator.audioSession && navigator.audioSession.type!=="playback") navigator.audioSession.type="playback"; }catch(e){}
  _suonoPronto0();
};

/* ---------- la scheda "Come si fa" ---------- */
/* da quale esercizio di casa viene un'alternativa (per dire cosa sostituisce) */
function sostituisce(n){
  var out=[]; Object.keys(ALT).forEach(function(k){ var m=ALT[k]; if(m.bande===n||m.corpo===n) out.push(k); }); return out;
}
function chipsEsercizio(n){
  var m=meta(n), c=[];
  if(m.g && m.g!=="—") c.push(m.g);
  c.push(m.band?"con banda":m.sec?"a tempo":({comp:"multiarticolare",compl:"complementare",iso:"isolamento",core:"core"}[m.t]||""));
  if(m.uni) c.push("un lato alla volta");
  if(m.cap) c.push("tetto "+m.cap+" kg");
  return '<div class="chips">'+c.filter(Boolean).map(function(x){ return '<span>'+esc(x)+'</span>'; }).join("")+'</div>';
}
function guideSheet(n, tip, giorno){
  var g=G[n], h='<div class="eyebrow amb">Come si fa</div><h2 style="margin:3px 0 6px;font-size:19px">'+esc(n)+'</h2>';
  if(EX[n]) h+=chipsEsercizio(n);
  if(figHas(n)) h+=posBlock(n);
  if(tip) h+='<div class="flag info"><b>Oggi</b><div>'+esc(tip)+'</div></div>';
  if(g){
    h+='<div class="gsez"><div class="eyebrow glow">Posizione e movimento</div><div class="sm">'+esc(g.p)+'</div></div>';
    h+='<div class="gsez"><div class="eyebrow" style="color:var(--ok)">Devi sentire</div><div class="sm">'+esc(g.f)+'</div></div>';
    var pd=posDef(n);
    if(pd && pd.no && pd.no.length) h+='<div class="gsez"><div class="eyebrow" style="color:var(--alert)">NON devi sentire fastidio qui</div><div class="chips" style="margin-top:4px">'+
      pd.no.map(function(z){ return '<span class="no">'+esc(zonaNome(z))+'</span>'; }).join("")+'</div>'+
      '<div class="xs mut" style="margin-top:4px">Se lo senti: ferma la serie e tocca ⚠ Dolore, segnando zona e intensità.</div></div>';
    h+='<div class="gsez"><div class="eyebrow" style="color:var(--alert)">Stai sbagliando se</div><div class="sm">'+esc(g.e)+'</div></div>';
    h+='<div class="gsez"><div class="eyebrow amb">Correzione</div><div class="sm">'+esc(g.c)+'</div></div>';
  } else if(!tip && !figHas(n)){ h+='<div class="sm mut">Nessuna scheda tecnica per questo esercizio.</div>'; }
  var al=ALT[n], so=sostituisce(n);
  if(al && (al.bande||al.corpo)){
    h+='<div class="gsez"><div class="eyebrow">Fuori casa</div><div class="altrow">'+
      (al.bande? '<button class="btn sm" data-a="guida" data-n="'+esc(al.bande)+'">Bande · '+esc(al.bande)+'</button>' : '')+
      (al.corpo? '<button class="btn sm" data-a="guida" data-n="'+esc(al.corpo)+'">Corpo libero · '+esc(al.corpo)+'</button>' : '')+'</div></div>';
  }
  if(so.length) h+='<div class="xs mut" style="margin-top:10px">Sostituisce fuori casa: '+esc(so.join(", "))+'.</div>';
  h+='<button class="btn" style="margin-top:16px" data-a="x">Chiudi</button>';
  Fig.vel=1; Fig.pausa=false;
  sheet(h);
  posAggiorna();
}
function erroreTipico(n){
  var box=document.getElementById("errbox"); if(!box) return;
  if(box.style.display==="block"){ box.style.display="none"; stopAnim(); return; }
  box.style.display="block"; box.innerHTML=animBlock(n); startAnim(n);
}

/* ---------- riscaldamento guidato ---------- */
var WG=null;
function warmNome(i, day){ var x=WARM[i]; return (x.fig && x.fig[day]) ? x.fig[day] : x.n; }
function warmGuidato(i){
  var d=S.draft; if(!d) return;
  suonoPronto();
  WG={i:i||0, t0:Date.now(), pausa:0, fermo:null};
  warmPasso();
}
function warmPasso(){
  var d=S.draft; if(!d || !WG) return;
  var i=WG.i, x=WARM[i], nome=warmNome(i, d.day), dur=WARM_SEC[i]||60, testo=x.var? x.var[d.day] : x.d;
  var h='<div class="between"><div class="eyebrow amb">Riscaldamento guidato · '+(i+1)+' di '+WARM.length+'</div>'+
    '<div class="xs mut">blocco scoliosi</div></div>'+
    '<h2 style="margin:4px 0 2px;font-size:19px">'+esc(x.n)+'</h2>'+
    '<div class="sm mut" style="margin-bottom:6px">'+esc(testo)+'</div>'+
    figBox(nome, {cls:"grande"})+
    (posDef(nome)? '<ul class="wgcheck">'+posDef(nome).co.map(function(c){ return '<li>'+esc(c[1])+'</li>'; }).join("")+'</ul>' : '')+
    '<div class="wgtimer"><svg viewBox="0 0 44 44" class="ring"><circle cx="22" cy="22" r="19" class="rb"/><circle cx="22" cy="22" r="19" class="rf" id="wgring" stroke-dasharray="119.4" stroke-dashoffset="0"/></svg>'+
    '<div><div class="rclk" id="wgclock">'+mmss(dur)+'</div><div class="xs mut" id="wgnext">'+(i<WARM.length-1? "Poi: "+esc(WARM[i+1].n) : "Ultimo blocco")+'</div></div></div>'+
    '<div class="grid3" style="margin-top:12px"><button class="btn sm ghost" data-a="wgprev"'+(i===0?" disabled":"")+'>‹ Indietro</button>'+
    '<button class="btn sm" data-a="wgpausa" id="wgpb">Pausa</button>'+
    '<button class="btn sm ghost" data-a="wgnext">Avanti ›</button></div>'+
    '<button class="btn ghost" style="margin-top:10px" data-a="wgstop">Chiudi la guida</button>';
  sheet(h);
  Fig.riparti();
  suono("step");
}
function warmTick(){
  if(!WG || !S.draft) return;
  var sh=document.getElementById("sheet"); if(!sh || !sh.classList.contains("on") || !document.getElementById("wgclock")){ WG=null; return; }
  if(WG.fermo) return;
  var dur=(WARM_SEC[WG.i]||60)*1000, el=Date.now()-WG.t0-WG.pausa, left=Math.max(0, dur-el);
  var c=document.getElementById("wgclock"), r=document.getElementById("wgring");
  if(c) c.textContent=mmss(left/1000);
  if(r) r.setAttribute("stroke-dashoffset", (119.4*(1-left/dur)).toFixed(1));
  var s=Math.ceil(left/1000);
  if(s<=3 && s>0 && WG.ultimo!==s){ WG.ultimo=s; suono("conto"); }
  if(left<=0){ warmFatto(WG.i); warmAvanti(); }
}
function warmFatto(i){ var d=S.draft; if(d && d.warm) d.warm[i]=true; save(); }
function warmAvanti(){
  if(!WG) return;
  if(WG.i>=WARM.length-1){ WG=null; closeSheet(); suono("salvata"); toast("Riscaldamento completato"); render(); return; }
  WG={i:WG.i+1, t0:Date.now(), pausa:0, fermo:null}; warmPasso();
}

/* ---------- timer per le tenute (plank, side plank, isometrie) ---------- */
var hold=null;
function holdStart(i, lato){
  var d=S.draft, e=d && d.ex[i]; if(!e) return;
  var def=e.def||PLAN[d.day].ex[i];
  suonoPronto();
  var target = def.u ? (lato==="D" ? def.lo : def.hi) : def.hi;
  if(def.u && !def.asym) target=def.hi;
  hold={i:i, lato:lato||"v", t0:Date.now()+3000, target:target, fase:"pre", ultimo:4};
  render();
}
function holdStop(salva){
  var d=S.draft; if(!hold || !d){ hold=null; return; }
  var e=d.ex[hold.i], sec=Math.max(0, Math.round((Date.now()-hold.t0)/1000));
  if(salva && hold.fase==="run" && e){
    if(hold.lato==="S"||hold.lato==="D") e.cur[hold.lato]=sec; else e.cur.v=sec;
    toast(sec+" secondi: controlla e tocca «Serie fatta»");
  }
  hold=null; render();
}
function holdTick(){
  if(!hold) return;
  var now=Date.now(), el=document.getElementById("hclock");
  if(hold.fase==="pre"){
    var s=Math.ceil((hold.t0-now)/1000);
    if(s<=0){ hold.fase="run"; suono("via"); }
    else if(s!==hold.ultimo){ hold.ultimo=s; suono("conto"); }
    if(el) el.textContent = s>0 ? String(s) : "Via";
    return;
  }
  var sec=Math.floor((now-hold.t0)/1000);
  if(el) el.textContent=mmss(sec);
  if(sec===hold.target && !hold.ok){ hold.ok=true; suono("bersaglio"); var b=document.getElementById("hbox"); if(b) b.classList.add("ok"); }
}
function holdBox(i, def){
  var m=meta(def.n||""); if(!m.sec && !def.sec) return "";
  if(hold && hold.i===i){
    return '<div class="hold'+(hold.ok?" ok":"")+'" id="hbox"><div><div class="eyebrow">'+(hold.lato==="S"?"Sinistra · ":hold.lato==="D"?"Destra · ":"")+'bersaglio '+hold.target+' s</div>'+
      '<div class="rclk" id="hclock">'+(hold.fase==="pre"?"3":"0:00")+'</div></div>'+
      '<div class="row"><button class="btn sm ghost" data-a="hold0">Annulla</button><button class="btn sm amb" data-a="holdok">Stop</button></div></div>';
  }
  if(def.u) return '<div class="grid2" style="margin-top:8px"><button class="btn sm" data-a="hold" data-i="'+i+'" data-v="S">▶ Timer sinistra</button>'+
    '<button class="btn sm" data-a="hold" data-i="'+i+'" data-v="D">▶ Timer destra</button></div>';
  return '<button class="btn sm" style="width:100%;margin-top:8px" data-a="hold" data-i="'+i+'">▶ Timer con conto alla rovescia</button>';
}

/* ---------- libreria: tutti gli esercizi, quando ti serve ---------- */
var LIB_F="tutti", LIB_Q="";
function libIndice(){
  var idx={}, add=function(n, tag){ if(!n) return; (idx[n]=idx[n]||{n:n, tag:{}}).tag[tag]=1; };
  ["Cat-cow","Rotazioni toraciche","Bird-dog con pausa 3s","Respirazione costale asimmetrica","Glute bridge","Band pull-apart"].forEach(function(n){ add(n,"risc"); });
  Object.keys(PLAN||{}).forEach(function(d){
    PLAN[d].ex.forEach(function(x){
      add(x.n, /^T/.test(d)?"trasf":/^E/.test(d)?"picco":d);
      var al=ALT[x.n]; if(al){ add(al.bande,"bande"); add(al.corpo,"corpo"); }
      if(/^T/.test(d)) add(x.n, "bande");
      else if(!/^T/.test(d) && (x.L>0 || (EX[x.n] && EX[x.n].cap))) add(x.n, "pesi");
    });
  });
  return Object.keys(idx).map(function(k){ return idx[k]; });
}
function viewEsercizi(){
  var h=topbar("Esercizi","Come si fanno, quando ti serve");
  h+='<div class="wrap">';
  h+='<input type="search" id="libq" placeholder="Cerca un esercizio" value="'+esc(LIB_Q)+'" style="margin-top:12px" aria-label="Cerca un esercizio">';
  var F1=[["tutti","Tutti"],["risc","Riscaldamento"],["pesi","Pesi"],["bande","Bande"],["corpo","Corpo libero"]];
  var F2=[["A","A"],["B","B"],["C","C"],["D","D"],["picco","Picco"],["trasf","Trasferta"]];
  var pill=function(f){ return '<button class="pill'+(LIB_F===f[0]?" on":"")+'" data-a="libf" data-v="'+f[0]+'">'+f[1]+'</button>'; };
  h+='<div class="libf"><div class="pills">'+F1.map(pill).join("")+'</div><div class="pills"><span class="xs mut">Seduta</span>'+F2.map(pill).join("")+'</div></div>';
  var lista=libIndice().filter(function(x){ return LIB_F==="tutti" || x.tag[LIB_F]; });
  h+='<div class="libgrid" id="libgrid">'+lista.map(function(x){
    var m=meta(x.n);
    return '<button class="libc" data-a="guida" data-n="'+esc(x.n)+'" data-s="'+esc((x.n+" "+(m.g||"")).toLowerCase())+'">'+figMini(x.n)+
      '<b>'+esc(x.n)+'</b><span>'+esc(x.tag.risc?"riscaldamento":(m.g&&m.g!=="—"?m.g:""))+'</span></button>';
  }).join("")+'</div>';
  h+='<div class="xs mut" style="margin:12px 0 4px">Tocca un esercizio: partenza e arrivo con i punti da controllare, l\'errore tipico, l\'animazione, cosa devi sentire. Puoi cercare anche per gruppo (es. «petto»).</div>';
  h+='<div class="eyebrow" style="margin:16px 0 6px">I tre segnali che fermano la serie</div><div class="card">';
  STOPS.forEach(function(s){ h+='<div class="flag stop">•<div>'+esc(s)+'</div></div>'; });
  h+='</div><div style="height:24px"></div>';
  h+='</div>';
  return h;
}
function libFiltra(q){
  LIB_Q=q; q=String(q||"").toLowerCase().trim();
  [].forEach.call(document.querySelectorAll("#libgrid .libc"), function(b){ b.style.display = (!q || b.dataset.s.indexOf(q)>=0) ? "" : "none"; });
}

/* orologio fine per guida e timer: 4 volte al secondo, solo quando servono */
setInterval(function(){ if(WG) warmTick(); if(hold) holdTick(); }, 250);

/* ---------- schermo acceso mentre guardi un esercizio o ti alleni ----------
   Screen Wake Lock API: Safari su iPhone da iOS 16.4, nelle app aggiunte alla Home da iOS 18.4;
   Chrome e Android da tempo. Lo schermo resta acceso con la scheda Come si fa aperta, durante la
   seduta, il riscaldamento guidato e i timer; torna normale appena chiudi. Si spegne in Coach. */
var WAKE={lock:null, chiede:false, ok:!!(typeof navigator!=="undefined" && navigator.wakeLock && navigator.wakeLock.request), err:""};
function wakeServe(){
  if(S.schermoAcceso===false) return false;
  if(S.draft && V==="oggi") return true;
  if((typeof WG!=="undefined" && WG) || (typeof hold!=="undefined" && hold)) return true;
  return !!document.querySelector("#sheet.on #posblock, #sheet.on .figbox");
}
function wakeAggiorna(){
  if(!WAKE.ok) return;
  var serve=wakeServe() && document.visibilityState==="visible";
  if(serve && !WAKE.lock && !WAKE.chiede){
    WAKE.chiede=true;
    navigator.wakeLock.request("screen").then(function(l){
      WAKE.lock=l; WAKE.err="";
      l.addEventListener("release", function(){ WAKE.lock=null; });
    }).catch(function(e){ WAKE.err=(e && e.message)||"rifiutato"; }).then(function(){ WAKE.chiede=false; });
  } else if(!serve && WAKE.lock){
    var l=WAKE.lock; WAKE.lock=null; l.release().catch(function(){});
  }
}
/* dopo ogni tocco (il permesso di tenere acceso lo schermo si chiede durante un gesto),
   al ritorno nell'app e ogni secondo e mezzo per accorgersi di quando chiudi */
document.addEventListener("click", function(){ wakeAggiorna(); });
document.addEventListener("visibilitychange", wakeAggiorna);
setInterval(wakeAggiorna, 1500);
