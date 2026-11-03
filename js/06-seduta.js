/* ---------- 5 · la seduta un esercizio per schermata ---------- */
function warmCard(d){
  var wdone=d.warm.filter(Boolean).length, h="";
  h+='<div class="card"><div class="between"><div class="eyebrow '+(wdone===WARM.length?"":"amb")+'">Riscaldamento · 6 minuti · '+wdone+"/"+WARM.length+'</div>'+
     '<button class="btn sm ghost" data-a="wall">'+(wdone===WARM.length?"Azzera":"Tutti")+'</button></div>';
  if(wdone<WARM.length){
    h+='<div class="xs mut" style="margin:6px 0 2px">È il blocco scoliosi. Se la sessione è corta, taglia un isolamento, non questo.</div>';
    h+='<button class="btn amb" style="margin:10px 0 4px" data-a="wgo">▶ Riscaldamento guidato · 6 minuti a tempo</button>';
  }
  WARM.forEach(function(x,i){
    var dd = x.var ? x.var[d.day] : x.d, fn=warmNome(i, d.day);
    h+='<div class="check '+(d.warm[i]?"on":"")+'"><div class="box" data-a="warm" data-i="'+i+'" style="cursor:pointer" role="checkbox" aria-checked="'+(!!d.warm[i])+'" aria-label="'+esc(x.n)+' fatto">✓</div>'+
       '<div class="t" data-a="warm" data-i="'+i+'" style="flex:1"><div style="font-weight:600;font-size:14.5px">'+esc(x.n)+'</div>'+
       '<div class="xs mut">'+esc(dd)+'</div></div>'+
       (figHas(fn)||G[fn]? '<button class="wmini" data-a="gwarm" data-i="'+i+'" aria-label="Come si fa: '+esc(x.n)+'">'+figMini(fn)+'</button>' : "")+'</div>';
  });
  return h+'</div>';
}
function exFull(d, i){ var p=PLAN[d.day], e=d.ex[i], def=e.def||p.ex[i]; return e.sets.length>=def.s; }
function pannelloChiusura(d, p){
  var h='<div class="card"><div class="eyebrow">Fine seduta</div><h2 style="margin:4px 0 6px">Riepilogo</h2>';
  d.ex.forEach(function(e,i){
    var def=e.def||p.ex[i], ok=e.sets.length>=def.s, m=meta(e.n), manca=[];
    if(e.sets.length && e.rir==null) manca.push("RIR");
    if(e.sets.length && def.u && !m.sec && !e.duro) manca.push("lato");
    h+='<button class="item" data-a="fgo" data-k="'+(i+1)+'"><div class="badge" style="'+(ok?"color:var(--ok);border-color:rgba(127,176,105,.5)":"")+'">'+(ok?"✓":(i+1))+'</div>'+
       '<div class="t"><b>'+esc(e.n)+'</b><span class="xs mut">'+e.sets.length+'/'+def.s+' serie'+(e.rir!=null?' · RIR '+e.rir:'')+
       (e.duro?' · lato duro '+({S:"sx",D:"dx",U:"uguali"}[e.duro]):'')+
       (manca.length?' · <span style="color:var(--amb)">manca '+manca.join(" e ")+'</span>':'')+'</span></div><div class="ch">›</div></button>';
  });
  h+='</div>';
  h+='<button class="btn ghost" style="margin-top:4px" data-a="exadd0">Aggiungi un esercizio solo per oggi</button>';
  h+='<div style="margin:14px 0 0"><button class="btn pri" data-a="close">Chiudi la sessione</button>'+
     '<button class="btn ghost" style="margin-top:8px" data-a="abort">Annulla</button></div>';
  return h;
}

/* ---------- export ---------- */
function tsv(){
  var h=["Settimana","Data","Giorno tipo","Esercizio","Gruppo muscolare","Lato","Banda","Carico (kg)",
    "Rep 1","Rep 2","Rep 3","Rep 4","Serie eseguite","Reps totali","Volume (kg)","RIR","Top range","Note"];
  var rows=S.log.map(function(r){
    var t=r.reps.reduce((a,b)=>a+b,0);
    return [r.w, r.date, r.day, r.ex, meta(r.ex).g,
      r.side==="S"?"Sinistra":r.side==="D"?"Destra":"N/A", r.band||"", r.load||"",
      r.reps[0]||"", r.reps[1]||"", r.reps[2]||"", r.reps[3]||"",
      r.reps.length, t, r.load*t, r.rir==null?"":r.rir, r.top?"Sì":"No", r.note||""].join("\t");
  });
  return [h.join("\t")].concat(rows).join("\n");
}
/* tempo medio fra le serie per tipo di esercizio, in una settimana */
function recSettimana(w){
  var tipi={comp:"composti",compl:"complementari",iso:"isolamento",core:"core"}, acc={}, visti={};
  S.log.forEach(function(r){
    if(r.w!==w || r.rec==null) return;
    var k=r.date+"|"+r.ex; if(visti[k]) return; visti[k]=1;
    var t=meta(r.ex).t; (acc[t]||(acc[t]=[])).push(r.rec);
  });
  var out=Object.keys(tipi).filter(t=>acc[t]).map(function(t){
    var a=acc[t]; return tipi[t]+" "+mmss(a.reduce((x,y)=>x+y,0)/a.length)+" (previsto "+mmss(REST[t])+" + la serie)";
  });
  return out.length? out.join(" · ") : "";
}
function briefing(){
  var ws=weeks().slice(-4), L=[];
  L.push("BRIEFING ALLENAMENTO — "+today()+" (settimana "+weekOf(today())+")");
  L.push("");
  L.push("KPI ultime 4 settimane");
  L.push("Sett | Sess | Durata | Energia | %top | Tonn. | Asim | Segn.");
  ws.forEach(function(w){ var k=kpi(w);
    L.push(w+" | "+k.n+"/"+k.target+(k.rest?"(+"+k.rest+"R)":"")+" | "+(k.dur||"-")+" | "+(k.en||"-")+" | "+(k.top!==null?k.top+"%":"-")+" | "+k.ton+" | "+k.asim+"% | "+k.sig);
  });
  var lw=ws[ws.length-1], k=kpi(lw);
  L.push("");
  L.push("Serie per gruppo, settimana "+lw+": "+Object.keys(k.grp).map(g=>g+" "+k.grp[g]).join(" · "));
  L.push("Composti a cedimento, settimana "+lw+": "+k.rir0+" su "+k.rirN+" · lato più duro: "+(duroTxt(k.duro)||"non registrato"));
  var rc=recSettimana(lw);
  if(rc) L.push("Tempo medio fra le serie, settimana "+lw+": "+rc);
  var m=ultimoValido(S.mis);
  if(m) L.push("Misure "+m.date+": peso "+(m.peso||"-")+" · torace "+(m.torace||"-")+" · vita "+(m.vita||"-")+
    ((m.vita&&m.torace)?" · V/T "+(m.vita/m.torace).toFixed(3):""));
  L.push("");
  L.push(frozen()? "Pronti per salire (CARICHI CONGELATI fino a settimana "+S.freeze.until+(S.freeze.note?" — "+S.freeze.note:"")+")" : "Pronti per salire");
  var seen={}, any=false;
  Object.keys(PLAN).forEach(function(d){ PLAN[d].ex.forEach(function(e){
    if(seen[e.n]) return; seen[e.n]=1;
    var r=readiness(e); if(r.ready){ any=true; L.push("- "+e.n+": "+r.why + (frozen()&&!r.cap?" [congelato]":(recoveryOggi()&&!r.cap?" [fermo: recupero basso oggi]":""))); }
  });});
  if(!any) L.push("- nessuno");
  var pgb=progressioni();
  L.push(""); L.push("Progressione scelta dall'app (una alla volta)");
  L.push(pgb.scelta? "- "+pgb.scelta.n+": "+pgb.scelta.why+" — "+pgb.scelta.come : (pgb.recupero? "- nessuna: carichi fermi oggi, recupero basso ("+pgb.recupero.parts.join(" · ")+")" : "- nessuna"));
  if(pgb.coda.length) L.push("- in coda: "+pgb.coda.map(function(x){ return x.n; }).join(", "));
  var hl=[], seenH={};
  Object.keys(PLAN).forEach(function(d){ PLAN[d].ex.forEach(function(e){ if(e.hold && !seenH[e.n]){ seenH[e.n]=1; hl.push("- "+e.n+": "+e.hold); } }); });
  if(hl.length){ L.push(""); L.push("In attesa (decisione presa: non proporre aumenti)"); hl.forEach(function(x){ L.push(x); }); }
  L.push("");
  L.push("Cruscotto KPI (definizioni e fonti nella scheda App_KPI)");
  var kv=kpiValori();
  KPI.forEach(function(d){ var v=kv[d.id]; L.push("- "+d.id+" · "+d.nome+": "+v.txt+" | bersaglio "+d.bersaglio+" | "+({ok:"ok",att:"attenzione",ko:"FUORI",na:"dati insufficienti"}[v.stato])); });
  L.push("");
  L.push("Diagnosi automatica");
  var dg=diagnose();
  if(!dg.length) L.push("- nulla da segnalare");
  dg.forEach(d=>L.push("- ["+d.k+"] "+d.t+": "+d.m));
  var notes=S.log.filter(r=>r.note && ws.indexOf(r.w)>=0).slice(-12);
  if(notes.length){ L.push(""); L.push("Note libere recenti"); notes.forEach(n=>L.push("- "+n.date+" "+n.ex+": "+n.note)); }
  var sl2=weightSlope();
  L.push("");
  L.push("Spinta (modulo peso)");
  if(sl2.ok) L.push("- pendenza "+(sl2.g>0?"+":"")+sl2.g+" g/sett ("+sl2.stato+" il corridoio "+PESO_TGT[0]+"-"+PESO_TGT[1]+
    ") su "+sl2.n+" pesate in "+sl2.days+" giorni"+(sl2.skipped?", "+sl2.skipped+" rientro escluso":"")+
    (sl2.noisy?" — ATTENZIONE: include i rientri da trasferta, dato indicativo":""));
  else L.push("- non calcolabile: "+(sl2.why||"dati insufficienti"));
  var wb2=S.ben.filter(function(x){ return x.passi||x.ipo; }).slice(-1)[0];
  if(wb2) L.push("- ultimo riepilogo settimanale: passi "+(wb2.passi||"-")+"/giorno, ipopnea "+(wb2.ipo==null?"-":wb2.ipo)+"/h ("+wb2.date+")");
  var cw=cibWeek(), ctg=cibTarget();
  L.push("- cibo, target "+ctg.kcal+" kcal"+(ctg.off?" (ricalibrato di "+(ctg.off>0?"+":"")+ctg.off+")":""));
  if(cw) L.push("- cibo, media 7 giorni: "+b1(cw.p)+"P / "+b1(ctg.p/BLK.p)+" \u00b7 "+
    b1(cw.c)+"C / "+b1(ctg.c/BLK.c)+" \u00b7 "+b1(cw.g)+"G / "+b1(ctg.g/BLK.g)+" (su "+cw.n+" giornate registrate)");
  else L.push("- cibo: nessuna giornata registrata nell'ultima settimana");
  var pend=cibDaStimare(14);
  if(pend.length){
    L.push("");
    L.push("Da convertire in blocchi (descritte a parole)");
    pend.forEach(function(x){ L.push("- "+x.date+" \u00b7 "+x.m+": "+x.n); });
  }
  var stk2=streak();
  L.push("- catena: "+stk2.n+" settimane consecutive a bersaglio"+(stk2.curOpen?" (quella in corso e' ancora aperta)":""));
  var ml2=mobLast();
  L.push("");
  L.push("Mobilita'");
  if(ml2){
    MOB.forEach(function(t){
      if(t.bi){ var d=mobAsym(ml2,t.k);
        L.push("- "+t.n+" ("+t.u+"): sx "+(ml2[t.k+"_s"]==null?"-":ml2[t.k+"_s"])+" | dx "+(ml2[t.k+"_d"]==null?"-":ml2[t.k+"_d"])+
               (d===null?"":" | delta "+(d>0?"+":"")+d)); }
      else L.push("- "+t.n+" ("+t.u+"): "+(ml2[t.k]==null?"-":ml2[t.k]));
    });
    L.push("  rilevazione del "+ml2.date+(mobDue()?" — SCADUTA":""));
  } else L.push("- nessuna rilevazione ancora");
  var bn=S.ben.filter(b=>b.refl!==null||b.hrv||b.peso||b.stress!==null).slice(-7);
  if(bn.length){ L.push(""); L.push("Benessere ultimi giorni");
    bn.forEach(function(b){
      var rc=recovery(b.date);
      L.push("- "+b.date+": peso "+(b.peso||"-")+" | HRV "+(b.hrv||"-")+" | FC rip "+(b.rhr||"-")+
        " | read "+(b.read||"-")+" | sonno "+(b.sonno||"-")+" | stress "+(b.stress==null?"-":b.stress)+
        " | testa "+(b.mente==null?"-":b.mente)+" | reflusso "+(b.refl==null?"-":b.refl)+
        " | alcol "+(b.alc?"si":"no")+(rc.hint?"  >> "+rc.hint:""));
    }); }
  return L.join("\n");
}
function copy(txt, msg){
  var done=function(){ toast(msg||"Copiato"); };
  if(navigator.clipboard && window.isSecureContext){ navigator.clipboard.writeText(txt).then(done, fallback); }
  else fallback();
  function fallback(){
    var ta=document.createElement("textarea"); ta.value=txt;
    ta.style.position="fixed"; ta.style.opacity="0"; document.body.appendChild(ta);
    ta.select(); try{ document.execCommand("copy"); done(); }catch(e){ toast("Copia non riuscita"); }
    document.body.removeChild(ta);
  }
}
function download(name, txt, type){
  var b=new Blob([txt],{type:type||"text/plain"}), u=URL.createObjectURL(b);
  var a=document.createElement("a"); a.href=u; a.download=name; document.body.appendChild(a); a.click();
  document.body.removeChild(a); setTimeout(()=>URL.revokeObjectURL(u), 2000);
}

/* ============================================================
   AGGIORNAMENTI DEL PIANO
   Il piano vivo = piano base + patch applicate in ordine.
   Una patch arriva dalla chat, si incolla, si vede l'anteprima,
   si applica. Nessun esercizio entra senza che tu lo confermi.
   ============================================================ */
var PLAN = null;
function clone(o){ return JSON.parse(JSON.stringify(o)); }
function buildPlan(){
  var P = clone(BASEPLAN);
  CIBX=[]; CIBR=[]; COACH=[];
  COACH=[];
  (S.patches||[]).forEach(function(pt,pi){ (pt.ops||[]).forEach(function(op,oi){
    op._ts = pt.ts || String(pi); op._k = pi+"."+oi; applyOp(P, op);
  }); });
  return P;
}
function applyOp(P, op){
  /* operazioni sul cibo: catalogo, ricette, conversione delle voci descritte */
  if(op.op==="cibo"){ CIBX.push({cat:op.cat||"pia", n:op.n, d:op.d||"", p:+op.p||0, c:+op.c||0, g:+op.g||0}); return; }
  if(op.op==="ricetta"){ CIBR.push({n:op.n, m:op.m||"pra", v:op.v||[]}); return; }
  if(op.op==="nota"){ coachNote(op, op._ts, op._k); return; }
  if(op.op==="stima"){ cibRisolvi(op.n, +op.p||0, +op.c||0, +op.g||0); return; }
  /* calorie: si applica una volta sola, quando approvi la patch (patchApply), non a ogni ricostruzione */
  if(op.op==="kcal") return;
  if(op.op==="target") return;   /* corridoio del peso: si applica una volta, in patchApply */
  var day = P[op.d]; if(!day) return;
  if(op.meta && op.ex && op.ex.n) EX[op.ex.n] = Object.assign({g:"—",t:"compl"}, op.meta);
  if(op.op==="del"){ day.ex = day.ex.filter(e=>e.n!==op.n); return; }
  if(op.op==="add"){
    if(day.ex.some(e=>e.n===op.ex.n)) return;
    var at = op.after ? day.ex.findIndex(e=>e.n===op.after)+1 : day.ex.length;
    day.ex.splice(at, 0, op.ex); return;
  }
  if(op.op==="set"){
    var e = day.ex.filter(x=>x.n===op.n)[0]; if(!e) return;
    ["s","lo","hi","L","b","tip","swap","u","sec","asym","hold"].forEach(function(k){
      if(op[k]!==undefined) e[k]=op[k];
    });
    return;
  }
  if(op.op==="dischi"){ day.dischi = op.v; return; }
}
/* anteprima leggibile prima di applicare */
function previewPatch(pt){
  return (pt.ops||[]).map(function(o){
    if(o.op==="cibo") return "Nuovo alimento: "+o.n+" ("+(o.p||0)+"P "+(o.c||0)+"C "+(o.g||0)+"G)";
    if(o.op==="ricetta") return "Nuova ricetta: "+o.n;
    if(o.op==="nota") return "Promemoria"+(o.d?" per il giorno "+o.d:"")+": "+o.t;
    if(o.op==="stima") return "Converti \u00ab"+o.n+"\u00bb \u2192 "+(o.p||0)+"P "+(o.c||0)+"C "+(o.g||0)+"G";
    if(o.op==="target") return "Corridoio del peso: "+(o.peso? o.peso[0]+"-"+o.peso[1]+" g a settimana" : "invariato");
    if(o.op==="kcal") return "Calorie: target "+(2550+(+o.off||0))+" kcal al giorno ("+((+o.off||0)>0?"+":"")+(+o.off||0)+" sulla base, tutto sui carboidrati)";
    if(o.op==="del") return "Togli "+o.n+" dal giorno "+o.d;
    if(o.op==="add") return "Aggiungi "+o.ex.n+" al giorno "+o.d+(o.after?" dopo "+o.after:"");
    if(o.op==="dischi") return "Sequenza dischi giorno "+o.d+" → "+o.v;
    var ch=[];
    if(o.s!==undefined) ch.push(o.s+" serie");
    if(o.lo!==undefined||o.hi!==undefined) ch.push("range "+(o.lo!==undefined?o.lo:"?")+"-"+(o.hi!==undefined?o.hi:"?"));
    if(o.L!==undefined) ch.push(o.L+" kg");
    if(o.b!==undefined) ch.push("banda "+o.b);
    if(o.tip!==undefined) ch.push("nota tecnica");
    if(o.swap!==undefined) ch.push("promemoria dischi");
    if(o.hold!==undefined) ch.push(o.hold ? "in attesa" : "attesa tolta");
    return o.n+" (giorno "+o.d+"): "+(ch.length?ch.join(", "):"nessun cambio");
  });
}

/* ---------- promemoria backup ----------
   Scade per tempo (30 giorni) o per lavoro accumulato (8 sessioni).
   Quello che conta non è il calendario: è quanto perderesti. */
function backupState(){
  var ref = S.lastBackup || S.installed || today();
  var days = Math.round((s2d(today())-s2d(ref))/86400000);
  var since = S.sess.filter(x=>s2d(x.date) > s2d(ref)).length;
  /* con il foglio collegato lo storico è già al sicuro: il .json serve
     solo per il piano e il check simmetria, che nel foglio non vanno */
  var safe = (typeof SYNC!=="undefined" && SYNC.on() && SYNC.state==="ok");
  var tutto = safe && (S.syncVer||1)>=3;   /* v3: anche piano e impostazioni sono sul foglio */
  return {ref:ref, days:days, since:since, never:!S.lastBackup, safe:safe, tutto:tutto,
          due: tutto ? days>=90 : safe ? days>=60 : (days>=30 || since>=8),
          soon: tutto ? days>=75 : safe ? days>=45 : (days>=21 || since>=6)};
}

/* identificativo di riga: due esercizi uguali nella stessa sessione restano distinti */
var _uid=0;
function uid(p){ _uid++; return p+"-"+Date.now().toString(36)+"-"+_uid; }
