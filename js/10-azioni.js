
/* ---------- azioni ---------- */
document.addEventListener("click", function(ev){
  var el=ev.target.closest("[data-a]"); if(!el) return;
  var a=el.dataset.a, i=+el.dataset.i, j=+el.dataset.j, v=el.dataset.v, d=S.draft;
  var e = d ? d.ex[i] : null;
  var def = d ? ((e && e.def) ? e.def : PLAN[d.day].ex[i]) : null;
  window._sy = window.scrollY;

  if(a==="nav"){ V=v; window._sy=0; render(); return; }
  if(a==="open"){ startSession(el.dataset.d); return; }
  if(a==="warm"){ d.warm[i]=!d.warm[i]; render(); return; }
  if(a==="wall"){ var all=d.warm.every(Boolean); d.warm=d.warm.map(()=>!all); render(); return; }
  if(a==="tip"){ guideSheet(def.n, def.tip); return; }
  if(a==="gwarm"){ guideSheet(warmNome(i, d? d.day : "A"), WARM[i].var? WARM[i].var[d? d.day : "A"] : ""); return; }
  if(a==="guida"){ guideSheet(el.dataset.n, ""); return; }
  if(a==="errtip"){ erroreTipico(el.dataset.n); return; }
  if(a==="figvel"){ Fig.vel=+v||1; Fig.pausa=false; Fig.riparti(); return; }
  if(a==="figpausa"){ Fig.pausa=!Fig.pausa; el.textContent=Fig.pausa?"Riprendi":"Pausa"; return; }
  if(a==="luogo"){ S.luogo={v:v, date:today()}; save(); render(); return; }
  if(a==="picco"){ var wk=weekOf(today()); S.picco=S.picco||{}; if(S.picco[wk]) delete S.picco[wk]; else S.picco[wk]=true; cfgTocca("picco"); save(); render();
    toast(S.picco[wk]? "Settimana di picco: bersaglio 2 sedute essenziali" : "Bersaglio di nuovo a 4 sedute"); return; }
  if(a==="libf"){ LIB_F=v; render(); return; }
  if(a==="kpi"){ kpiSheet(v); return; }
  if(a==="sgen"){ var k=document.getElementById("syK"); if(k){ k.value=segretoCasuale(); copy(k.value, "Frase copiata: incollala nello script"); } return; }
  if(a==="ics"){ download("rachide-promemoria.ics", icsPromemoria(), "text/calendar"); toast("Apri il file: il Calendario ti chiede dove aggiungerlo"); return; }
  if(a==="suoni"){ S.suoni=!suoniOn(); cfgTocca("suoni"); save(); render(); if(S.suoni) setTimeout(function(){ suono("serie"); }, 50); return; }
  if(a==="silenz"){ S.suoniSilenzioso=(S.suoniSilenzioso===false); cfgTocca("suoni"); save(); render(); return; }
  if(a==="vol"){ S.volume=v; cfgTocca("suoni"); save(); render(); suono("fine"); return; }
  if(a==="suonoprova"){ provaSuoni(); return; }
  if(a==="ag"){ agendaApri(v, el.dataset.m); return; }
  if(a==="saveprof"){ saveProfilo(); return; }
  if(a==="profilo"){ formProfilo(); return; }
  if(a==="wgo"){ warmGuidato(0); return; }
  if(a==="wgnext"){ warmFatto(WG? WG.i : 0); warmAvanti(); return; }
  if(a==="wgprev"){ if(WG && WG.i>0){ WG={i:WG.i-1, t0:Date.now(), pausa:0, fermo:null}; warmPasso(); } return; }
  if(a==="wgpausa"){ if(!WG) return; if(WG.fermo){ WG.pausa+=Date.now()-WG.fermo; WG.fermo=null; el.textContent="Pausa"; Fig.pausa=false; } else { WG.fermo=Date.now(); el.textContent="Riprendi"; Fig.pausa=true; } return; }
  if(a==="wgstop"){ WG=null; Fig.pausa=false; closeSheet(); render(); return; }
  if(a==="hold"){ holdStart(i, v); return; }
  if(a==="holdok"){ holdStop(true); return; }
  if(a==="hold0"){ holdStop(false); return; }
  if(a==="full"){ var f=document.getElementById("gfull"); if(f) f.style.display = f.style.display==="none"?"block":"none"; return; }
  if(a==="x"){ CIB_DAY=0; WG=null; Fig.pausa=false; closeSheet(); render(); return; }
  if(a==="band"){ e.band=v; save(); render(); return; }
  if(a==="load+"||a==="load-"){
    var m=meta(e.n), st=stepOf(e.n), nv=e.load+(a==="load+"?st:-st);
    if(m.cap && nv>m.cap){ toast("Tetto "+m.cap+" kg. Progredisci con il tempo."); return; }
    e.load=Math.max(0,nv); save(); render(); return;
  }
  if(a==="v+"||a==="v-"){ e.cur.v=Math.max(0,e.cur.v+(a==="v+"?(meta(e.n).sec?5:1):(meta(e.n).sec?-5:-1))); render(); return; }
  if(a==="l+"||a==="l-"){ e.cur.S=Math.max(0,e.cur.S+(a==="l+"?(meta(e.n).sec?5:1):(meta(e.n).sec?-5:-1))); render(); return; }
  if(a==="r+"||a==="r-"){ e.cur.D=Math.max(0,e.cur.D+(a==="r+"?(meta(e.n).sec?5:1):(meta(e.n).sec?-5:-1))); render(); return; }
  if(a==="set"){
    suonoPronto(); suono("serie"); if(hold && hold.i===i) hold=null;
    var rec0=recordLive(e, def);
    e.sets.push(def.u ? {S:e.cur.S, D:e.cur.D, t:Date.now()} : {v:e.cur.v, t:Date.now()});
    startRest(meta(e.n).t, e.n); save(); render();
    if(rec0) festeggia(rec0);
    return;
  }
  if(a==="undo"){ e.sets.splice(j,1); save(); render(); return; }
  if(a==="rir"){ e.rir=+v; save(); render(); if(+v===0 && meta(e.n).t==="comp") toast("Cedimento su un composto: la regola è RIR 1-2"); return; }
  if(a==="duro"){ e.duro=v; save(); render(); return; }
  if(a==="fgo"){ var nk=+el.dataset.k; if(nk<0) nk=0; d.cur=nk; window._sy=0; save(); render(); return; }
  if(a==="vista"){ S.vistaTutte=!S.vistaTutte; window._sy=0; save(); render(); return; }
  if(a==="rest+"){ rest.end+=30000; if(rest.end>Date.now()) rest.over=false; if(rest.end-Date.now()>-30000) rest.late=false; render(); return; }
  if(a==="rest0"){ stopRest(); render(); return; }
  if(a==="abort"){ if(confirm("Annullare la sessione? I dati non vengono salvati.")){ S.draft=null; stopRest(); save(); render(); } return; }
  if(a==="setmore"){ e.more=!e.more; save(); render(); return; }
  if(a==="cnok"){ coachFatto(el.dataset.id); return; }
  if(a==="cnadd"){ extraAdd(el.dataset.n, true); return; }
  if(a==="exadd0"){ formExtra(); return; }
  if(a==="exadd"){ extraAdd(el.dataset.n, el.dataset.p==="1"); return; }
  if(a==="exrm"){ extraDel(i); return; }
  if(a==="close"){ closeSession(); return; }
  if(a==="savesess"){ commitSession(); return; }
  if(a==="restday"){ restForm(); return; }
  if(a==="saverest"){ saveRest(); return; }
  if(a==="freeze"){ var n=+el.dataset.w||3; S.freeze={until:weekOf(today())+n-1, note:"Fase di stabilizzazione"}; cfgTocca("freeze"); save(); render(); toast("Carichi congelati fino alla settimana "+S.freeze.until); return; }
  if(a==="unfreeze"){ S.freeze=null; cfgTocca("freeze"); save(); render(); toast("Congelamento rimosso"); return; }
  if(a==="mis"){ formMis(); return; }
  if(a==="savemis"){ saveMis(); return; }
  if(a==="ben"){ formBen(el.dataset.d||null, false, el.dataset.m||undefined); return; }
  if(a==="benpaste"){ benPaste(); return; }
  if(a==="chiusw"){ formChiusura(); return; }
  if(a==="savechiusw"){ saveChiusura(); return; }
  if(a==="pasto"){ formPasto(el.dataset.m, el.dataset.c); return; }
  if(a==="cibday"){ CIB_DAY=+el.dataset.v||0; render(); formPasto(el.dataset.m, el.dataset.c); return; }
  if(a==="cibadd"){ cibAdd(el.dataset.m, el.dataset.n).then(function(){ render(); formPasto(el.dataset.m, el.dataset.c); }); return; }
  if(a==="cibric"){ cibAddRic(el.dataset.m, el.dataset.n).then(function(){ render(); formPasto(el.dataset.m); }); return; }
  if(a==="cibq"){ cibQ(el.dataset.m, +el.dataset.i, +el.dataset.d).then(function(){ render(); formPasto(el.dataset.m); }); return; }
  if(a==="cibdel"){ cibDel(el.dataset.m, +el.dataset.i).then(function(){ render(); formPasto(el.dataset.m); }); return; }
  if(a==="ciblib"){ formLibero(el.dataset.m); return; }
  if(a==="ciblibok"){
    var tx=document.getElementById("cibTxt"), pz=document.querySelector("#cibPz .pill.on");
    var txt=tx? tx.value.trim() : "";
    if(!txt){ toast("Scrivi cosa hai mangiato"); return; }
    cibAddLibero(el.dataset.m, txt, pz? +pz.dataset.q : 1).then(function(){ render(); formPasto(el.dataset.m); });
    return;
  }
  if(a==="cibrec"){
    var src=el.dataset.s==="s" ? _CIBS : _CIBR, vv=src[+el.dataset.i];
    if(vv) cibAddVoce(el.dataset.m, vv).then(function(){ render(); formPasto(el.dataset.m); });
    return;
  }
  if(a==="cibrip"){ cibRipeti(el.dataset.m).then(function(){ render(); formPasto(el.dataset.m); }); return; }
  if(a==="cibcal"){
    S.cibOff=+el.dataset.v||0; S.cibOffTs=today(); cfgTocca("cibo");
    save().then(function(){ render(); toast("Target aggiornato: "+cibTarget().kcal+" kcal"); });
    return;
  }
  if(a==="cibz"){ if(confirm("Azzerare questa giornata?")) cibReset().then(render); return; }
  if(a==="benadd"){ var y=new Date(); y.setDate(y.getDate()-1); formBen(d2s(y), true); return; }
  if(a==="saveben"){ saveBen(el.dataset.d||null); return; }
  if(a==="bendel"){ delBen(el.dataset.d); return; }
  if(a==="esess"){ editSess(el.dataset.id); return; }
  if(a==="esesssave"){ saveSessEdit(el.dataset.id); return; }
  if(a==="esessdel"){ delSess(el.dataset.id); return; }
  if(a==="aggiorna"){ aggiornaApp(); return; }
  if(a==="swagg"){ swApplica(); return; }
  if(a==="purga"){ purgaSheet(); return; }
  if(a==="purgago"){ purgaVai(); return; }
  if(a==="sett"){ formSett(); return; }
  if(a==="savesett"){ saveSett(); return; }
  if(a==="mob"){ formMob(); return; }
  if(a==="savemob"){ saveMob(); return; }
  if(a==="mobhow"){ mobHow(el.dataset.k); return; }
  if(a==="mobback"){ formMob(); return; }
  if(a==="mini"){ miniSheet(el.dataset.d); return; }
  if(a==="minigo"){ startSession(el.dataset.d, true); closeSheet(); return; }
  if(a==="sim"){ formSim(); return; }
  if(a==="savesim"){ saveSim(); return; }
  if(a==="brief"){ copy(briefing(),"Briefing copiato. Incollalo in chat."); return; }
  if(a==="tsv"){ copy(tsv(),"Righe copiate. Incolla in Log_Esercizi."); return; }
  if(a==="dlj"){
    download("rachide-"+today().replace(/\//g,"-")+".json", JSON.stringify(S), "application/json");
    S.lastBackup=today(); save(); closeSheet(); render();
    toast("Backup scaricato. Spostalo su Drive."); return; }
  if(a==="dlt"){ download("log-"+today().replace(/\//g,"-")+".tsv", tsv(), "text/tab-separated-values"); return; }
  if(a==="imp"){ importer(); return; }
  if(a==="stest"){ storageTest(); return; }
  if(a==="scfg"){ syncForm(); return; }
  if(a==="ssave"){ syncSave(); return; }
  if(a==="sdiag"){ syncDiag(); return; }
  if(a==="spull"){ doPull(true); return; }
  if(a==="spush"){ doPush(true); return; }
  if(a==="pprev"){ patchPreview(); return; }
  if(a==="pincolla"){ patchIncolla(); return; }
  if(a==="propvedi"){ var pa=propAttiva(); if(pa) patchPreview(pa.testo, pa.id); return; }
  if(a==="propno"){ if(S.prop) S.propFatta=S.prop.id; cfgTocca("proposta"); save(); render(); toast("Proposta scartata: scrivi al Coach cosa non va"); return; }
  if(a==="propcheck"){ propCheck(true); return; }
  if(a==="passo1"){ S.passo1=!S.passo1; cfgTocca("passo1"); save(); PLAN=buildPlan(); render(); toast(S.passo1?"Gradino 1 kg per manubrio":"Gradino 2 kg"); if(SYNC.on()) doPush(false); return; }
  if(a==="ridotta"){ startSession(el.dataset.d, false, true); return; }
  if(a==="papply"){ patchApply(); return; }
  if(a==="prev"){ if(confirm("Annullare l'ultima modifica al piano?")){ S.patches.pop(); cfgTocca("patches"); PLAN=buildPlan(); save(); render(); toast("Modifica annullata"); } return; }
});
/* selezione singola dentro i pannelli: un solo gestore per tutti i form */
document.addEventListener("click", function(ev){
  var gg=ev.target.closest("[data-gg]");
  if(gg && gg.classList.contains("pill")){ gg.classList.toggle("on"); return; }
  var sdp=ev.target.closest("[data-sd]");
  if(sdp){ var cw=document.getElementById("bCittaW"); if(cw) cw.style.display = sdp.dataset.sd==="Fuori" ? "block" : "none"; }
  var keys=["en","sig","r","c","p","x","q","s","st","me","sd","mo","dl","do"];
  for(var i=0;i<keys.length;i++){
    var b=ev.target.closest("[data-"+keys[i]+"]");
    if(b && b.classList.contains("pill")){
      [].forEach.call(b.parentNode.children, p=>p.classList.remove("on"));
      b.classList.add("on"); return;
    }
  }
});
document.addEventListener("input", function(ev){
  var t=ev.target;
  if(t.id==="cibTxt"){ cibSuggerisci(t.value, t.dataset.m); return; }
  if(t.id==="libq"){ libFiltra(t.value); return; }
  if(t.dataset && t.dataset.o){ salvaOrario(t.dataset.o, t.value); return; }
  if(t.dataset.note!==undefined && S.draft){ S.draft.ex[+t.dataset.note].note=t.value; save(); }
});

/* ---------- sessione ---------- */
function restForm(){
  var w=weekOf(today()), tutte=S.sess.filter(function(s){ return s.w===w; });
  var liberi=giorniSettimana(w).filter(function(d){ return !tutte.some(function(s){ return s.day===d; }); });
  if(!liberi.length){ toast("La settimana è già coperta."); return; }
  sheet('<div class="eyebrow amb">Riposo programmato</div><h2 style="margin:4px 0 8px">Un giorno deciso a tavolino</h2>'+
    '<div class="sm mut">Non è una sessione saltata: è recupero previsto. Non conta come mancata e abbassa il bersaglio della settimana. Così l\'aderenza resta onesta.</div>'+
    '<label class="fld"><span class="eyebrow">Quale giorno copri</span><div class="pills" id="rDay">'+
      liberi.map(function(d,i){ return '<button class="pill'+(i===0?" on":"")+'" data-q="'+d+'">'+d+'</button>'; }).join("")+'</div></label>'+
    '<label class="fld"><span class="eyebrow">Motivo (per te, fra un mese)</span><textarea id="rNote" placeholder="Es. trasferta Brescia, HRV bassa, scelta a monte"></textarea></label>'+
    '<button class="btn amb" style="margin-top:14px" data-a="saverest">Segna riposo</button>'+
    '<button class="btn ghost" style="margin-top:8px" data-a="x">Annulla</button>');
}
async function saveRest(){
  var w=weekOf(today());
  var dsel=document.querySelector("#rDay .pill.on");
  var day=dsel?dsel.dataset.q:null;
  if(!day){ toast("Scegli il giorno."); return; }
  S.sess.push({id:uid("s"), w:w, date:today(), day:day, sede:"—", mod:"Riposo",
    min:0, en:0, warm:false, sig:false,
    note:document.getElementById("rNote").value||"Riposo programmato"});
  var okS=await save(); closeSheet(); window._sy=0; render();
  if(SYNC.on()){
    var sent=await doPush(false);
    toast(sent? "Riposo registrato sul foglio" : "Riposo salvato: usa Coach → Invia tutto");
  } else toast(okS?"Riposo registrato":"Riposo NON salvato");
}

/* ============================================================
   MODIFICA DEI GIORNI PASSATI
   Correggere o cancellare una sessione / un giorno di benessere.
   Perché una modifica sopravviva alla sincronizzazione serve lo
   script del foglio v2 (sa modificare e cancellare, non solo aggiungere).
   ============================================================ */
function verWarn(){
  if(!SYNC.on()) return "";
  if((SYNC.ver||1)>=2) return "";
  return '<div class="flag stop" style="margin-top:10px">⚠<div><b>Script del foglio non aggiornato.</b> Questa modifica resta solo nell\'app e sparisce alla prossima sincronizzazione. Aggiorna lo script (te l\'ho dato) perché diventi definitiva.</div></div>';
}
function isoDay(s){ /* "gg/mm/aaaa" → "aaaa-mm-gg" per input date */
  var m=String(s||"").match(/^(\d{2})\/(\d{2})\/(\d{4})$/); return m? m[3]+"-"+m[2]+"-"+m[1] : "";
}
function fromIso(s){ /* "aaaa-mm-gg" → "gg/mm/aaaa" */
  var m=String(s||"").match(/^(\d{4})-(\d{2})-(\d{2})$/); return m? m[3]+"/"+m[2]+"/"+m[1] : s;
}
function editSess(id){
  var s=S.sess.filter(function(x){ return x.id===id; })[0]; if(!s){ toast("Sessione non trovata"); return; }
  var rest=isRest(s);
  sheet('<div class="eyebrow amb">Modifica sessione</div><h2 style="margin:4px 0 10px">Giorno '+s.day+' · '+s.date+'</h2>'+
    '<label class="fld"><span class="eyebrow">Data</span><input type="date" id="eDate" value="'+isoDay(s.date)+'"></label>'+
    (rest? '<div class="sm mut" style="margin-top:10px">Questo è un riposo programmato. Puoi cambiarne la data, la nota, o cancellarlo.</div>'
         : '<div class="grid2" style="margin-top:10px">'+
           '<label class="fld"><span class="eyebrow">Durata (min)</span><input type="number" id="eMin" value="'+(s.min||"")+'"></label>'+
           '<label class="fld"><span class="eyebrow">Energia 1-5</span><input type="number" id="eEn" value="'+(s.en||"")+'"></label></div>'+
           '<label class="fld"><span class="eyebrow">Segnale articolare</span><div class="pills" id="eSig">'+
             '<button class="pill '+(s.sig?"":"on")+'" data-sig="0">No</button><button class="pill '+(s.sig?"on":"")+'" data-sig="1">Sì</button></div></label>')+
    '<label class="fld"><span class="eyebrow">Note</span><textarea id="eNote">'+esc(s.note||"")+'</textarea></label>'+
    verWarn()+
    '<button class="btn pri" style="margin-top:14px" data-a="esesssave" data-id="'+id+'">Salva le modifiche</button>'+
    '<button class="btn ghost" style="margin-top:8px;color:var(--alert)" data-a="esessdel" data-id="'+id+'">Cancella la sessione</button>'+
    '<button class="btn ghost" style="margin-top:8px" data-a="x">Chiudi</button>'+
    (rest?"":'<div class="xs mut" style="margin-top:10px">Le ripetizioni e i carichi dei singoli esercizi non si modificano da qui: dimmelo se ti serve e lo aggiungo.</div>'));
}
async function saveSessEdit(id){
  var s=S.sess.filter(function(x){ return x.id===id; })[0]; if(!s) return;
  var nd=fromIso(document.getElementById("eDate").value); if(!/^\d{2}\/\d{2}\/\d{4}$/.test(nd)){ toast("Data non valida"); return; }
  var oldDate=s.date;
  s.date=nd; s.w=weekOf(nd);
  if(!isRest(s)){
    var mn=document.getElementById("eMin").value, en=document.getElementById("eEn").value;
    var sg=document.querySelector("#eSig .pill.on");
    s.min=mn===""?0:+mn; s.en=en===""?0:+en; s.sig= sg? sg.dataset.sig==="1":false;
  }
  s.note=document.getElementById("eNote").value;
  /* se ho spostato la data, riallineo anche le righe di log di quella sessione */
  if(nd!==oldDate){
    S.log.forEach(function(r){ if(r.date===oldDate && r.day===s.day){ r.date=nd; r.w=weekOf(nd); } });
  }
  var okS=await save(); closeSheet(); render();
  if(SYNC.on()) doPush(false);
  toast(okS?"Sessione aggiornata":"NON salvato: vedi Coach");
}
async function delSess(id){
  var s=S.sess.filter(function(x){ return x.id===id; })[0]; if(!s) return;
  if(!confirm("Cancellare la sessione del "+s.date+" (giorno "+s.day+")? Anche le righe di esercizio di quel giorno verranno rimosse.")) return;
  var logIds=S.log.filter(function(r){ return r.date===s.date && r.day===s.day; }).map(function(r){ return r.id; });
  S.sess=S.sess.filter(function(x){ return x.id!==id; });
  S.log =S.log.filter(function(r){ return !(r.date===s.date && r.day===s.day); });
  await save(); closeSheet(); render();
  if(SYNC.on()){
    try{ await SYNC.pushDelete({sess:[id], log:logIds}); toast("Sessione cancellata dal foglio"); }
    catch(e){ toast("Cancellata qui. Sul foglio serve lo script aggiornato."); }
  } else toast("Sessione cancellata");
}
async function delBen(date){
  if(!confirm("Cancellare il benessere del "+date+"?")) return;
  S.ben=S.ben.filter(function(x){ return x.date!==date; });
  if(S.dirtyBen) delete S.dirtyBen[date];
  await save(); closeSheet(); render();
  if(SYNC.on()){
    try{ await SYNC.pushDelete({ben:[date]}); toast("Giorno cancellato dal foglio"); }
    catch(e){ toast("Cancellato qui. Sul foglio serve lo script aggiornato."); }
  } else toast("Giorno cancellato");
}
/* La sessione minima non e' un ripiego: e' il modo di non rompere
   la catena quando la giornata e' storta. Due esercizi, riscaldamento
   compreso. Conta come sessione fatta, perche' quello che protegge
   non e' il volume di oggi ma l'identita' di chi si allena. */
function miniSheet(day){
  var p=PLAN[day], keep=eserciziPer(day, luogoOggi()).slice(0,2).map(function(x){ return x.n; });
  sheet('<div class="eyebrow amb">Sessione minima</div><h2 style="margin:4px 0 8px">Giorno '+day+' \u00b7 due esercizi</h2>'+
    '<div class="sm">Riscaldamento completo, poi solo <b>'+esc(keep.join(" e "))+'</b>. Quindici minuti.</div>'+
    '<div class="sm mut" style="margin-top:8px">Conta come sessione fatta e non spezza la catena. '+
    'Gli altri esercizi restano nel piano: non li stai saltando, li stai rimandando.</div>'+
    '<div class="xs mut" style="margin-top:8px">Se poi ti accorgi di stare bene, continua pure oltre i due: puoi loggare tutto.</div>'+
    '<button class="btn amb" style="margin-top:14px" data-a="minigo" data-d="'+day+'">Inizia la minima</button>'+
    '<button class="btn ghost" style="margin-top:8px" data-a="x">Annulla</button>');
}
/* versione ridotta (45'): i primi 4 esercizi del giorno, cioe' i composti.
   Gli altri restano nel piano e si possono aggiungere da «Aggiungi un esercizio».
   Il luogo (casa, bande, corpo libero) sostituisce gli esercizi con le alternative:
   ogni voce porta con se' la sua prescrizione (def), cosi' nulla si sfasa col piano. */
function startSession(day, mini, rid, luogo){
  var p=PLAN[day];
  luogo = (p.sede!=="Casa") ? "bande" : (luogo || luogoOggi());
  var lista = eserciziPer(day, luogo, rid);
  S.draft={day:day, date:today(), t0:Date.now(), mini:!!mini, rid:!!rid, luogo:luogo, warm:WARM.map(()=>false),
    ex:lista.map(function(x){
      var m=meta(x.n), load=x.b?0:suggestLoad(x);
      var rt=(!x.b && !m.sec && load>0)? rientro(x.n) : null;
      if(rt && rt.taglio) load=Math.max(0, load-stepOf(x.n));
      return {n:x.n, def:Object.assign({}, x), load: load, band: x.b?lastBand(x.n,x.b):"", rientro:rt,
        sets:[], rir:null, note:"", duro:null,
        cur: x.u ? (m.sec ? {S:x.hi, D:x.lo} : {S:Math.min(lastSideRep(x.n,"S",x.lo),x.hi), D:Math.min(lastSideRep(x.n,"D",x.lo),x.hi)}) : {v:(m.sec?x.hi:x.lo)}};
    }), cur:0};
  V="oggi"; window._sy=0; save(); render();
}
/* secondi fra una serie salvata e la successiva: recupero + durata della serie.
   Le pause oltre 10 minuti non sono recuperi e restano fuori. */
function intervalli(sets){
  var out=[];
  for(var k=1;k<(sets||[]).length;k++){
    var a=sets[k-1].t, b=sets[k].t;
    if(a && b){ var s=(b-a)/1000; if(s>10 && s<600) out.push(s); }
  }
  return out;
}
function recMedio(sets){ var iv=intervalli(sets); return iv.length? Math.round(iv.reduce((x,y)=>x+y,0)/iv.length) : null; }
function startRest(t, n){ var sec=REST[t]||60; rest={end:Date.now()+sec*1000, sec:sec, lbl:mmss(sec)+" · "+n, over:false}; }
function stopRest(){ rest=null; }
function closeSession(){
  var d=S.draft, min=Math.max(1,Math.round((Date.now()-d.t0)/60000));
  var logged=d.ex.filter(e=>e.sets.length).length;
  sheet('<div class="eyebrow">Chiudi la sessione</div><h2 style="margin:4px 0 12px">Giorno '+d.day+' · '+logged+'/'+d.ex.length+' esercizi</h2>'+
    '<label class="fld"><span class="eyebrow">Data</span><input type="date" id="fDate" value="'+isoDay(d.date)+'"></label>'+
    '<label class="fld"><span class="eyebrow">Durata (min)</span><input type="number" id="fMin" value="'+min+'"></label>'+
    '<label class="fld"><span class="eyebrow">Energia</span><div class="pills" id="fEn">'+
      [1,2,3,4,5].map(v=>'<button class="pill" data-en="'+v+'">'+v+'</button>').join("")+'</div></label>'+
    '<label class="fld"><span class="eyebrow">Spalla sinistra durante la seduta · il massimo, 0-10</span>'+pillScala("fDol","do",10,null)+'</label>'+
    '<div class="xs mut" style="margin-top:4px">Fino a 5 va bene se domattina è rientrato (pain-monitoring model). Sopra 5 ferma le salite.</div>'+
    '<label class="fld"><span class="eyebrow">Altro segnale articolare</span><div class="pills" id="fSig">'+
      '<button class="pill on" data-sig="0">No</button><button class="pill" data-sig="1">Sì</button></div></label>'+
    '<label class="fld"><span class="eyebrow">Note</span><textarea id="fNote" placeholder="Cosa è successo oggi"></textarea></label>'+
    '<button class="btn pri" style="margin-top:14px" data-a="savesess">Salva</button>'+
    '<button class="btn ghost" style="margin-top:8px" data-a="x">Torna indietro</button>');
}
async function commitSession(){
  var d=S.draft, p=PLAN[d.day];
  var de=document.getElementById("fDate"); if(de){ var nd=fromIso(de.value); if(/^\d{2}\/\d{2}\/\d{4}$/.test(nd)) d.date=nd; }
  var w=weekOf(d.date);
  var en=document.querySelector("#fEn .pill.on"), sg=document.querySelector("#fSig .pill.on"), dl=document.querySelector("#fDol .pill.on");
  var dol=dl? +dl.dataset.do : null;
  d.ex.forEach(function(e,i){
    var def=e.def||p.ex[i]; if(!e.sets.length) return;
    if(def.u){
      ["S","D"].forEach(function(sd){
        var reps=e.sets.map(s=>s[sd]);
        S.log.push({id:uid("l"), w:w, date:d.date, day:d.day, ex:e.n, side:sd, band:e.band, load:e.load,
          reps:reps, rir:e.rir, top:isTop(reps, def.hi, def.s), note:e.note, rec:recMedio(e.sets), duro:e.duro||""});
      });
    } else {
      var reps=e.sets.map(s=>s.v);
      S.log.push({id:uid("l"), w:w, date:d.date, day:d.day, ex:e.n, side:"", band:e.band, load:e.load,
        reps:reps, rir:e.rir, top:isTop(reps, def.hi, def.s), note:e.note, rec:recMedio(e.sets)});
    }
  });
  var lu=d.luogo||"casa";
  S.sess.push({id:uid("s"), w:w, date:d.date, day:d.day, sede:(lu==="casa"? p.sede : "Trasferta"),
    mod:(d.mini?"Minima":(d.rid?"Ridotta":(p.ess?"Essenziale":(lu==="corpo"?"Corpo libero":((lu==="bande"||p.sede!=="Casa")?"Bande":"Pesi"))))),
    min:+document.getElementById("fMin").value||0, en:en?+en.dataset.en:0,
    warm:d.warm.every(Boolean), sig: (sg? sg.dataset.sig==="1":false) || (dol!=null && dol>5), dol:dol,
    note:document.getElementById("fNote").value});
  S.draft=null; stopRest(); hold=null; WG=null; var okS=await save(); closeSheet(); V="prog"; window._sy=0; render(); suono("salvata");
  if(dol!=null && dol>5) setTimeout(function(){ toast("Spalla a "+dol+"/10: annotato. Domattina segna com'è: se non è rientrata, niente salite"); }, 2600);
  if(SYNC.on()){
    var sent=await doPush(false);
    toast(sent? "Sessione salvata sul foglio" : "Foglio non raggiunto: usa Coach → Invia tutto");
    if(!sent) setTimeout(fallbackSheet, 700);
  } else {
    toast(okS?"Sessione salvata":"Sessione NON salvata");
    if(!okS) setTimeout(fallbackSheet, 700);
  }
  var bk=backupState();
  if(bk.due) setTimeout(function(){
    sheet('<div class="eyebrow amb">Prima di chiudere</div><h2 style="margin:4px 0 10px">Fai il backup</h2>'+
      '<div class="sm">'+(bk.never? "Non ne hai ancora fatto uno. " : "L'ultimo è di "+bk.days+" giorni fa. ")+
      'Da allora hai registrato <b>'+bk.since+' sessioni</b>: è quello che perderesti se il telefono cancellasse i dati del sito.</div>'+
      '<button class="btn pri" style="margin-top:14px" data-a="dlj">Scarica il backup</button>'+
      '<button class="btn ghost" style="margin-top:8px" data-a="x">Più tardi</button>');
  }, 900);
}

/* ---------- form misure / benessere / simmetria ---------- */
function formMis(){
  sheet('<div class="eyebrow">Misure</div><h2 style="margin:4px 0 10px">'+today()+'</h2>'+
    ["peso|Peso (kg)","torace|Torace (cm)","bic|Bicipite (cm)","coscia|Coscia (cm)","vita|Vita (cm)"].map(function(f){
      var a=f.split("|"); return '<label class="fld"><span class="eyebrow">'+a[1]+'</span><input type="number" step="0.1" id="m_'+a[0]+'"></label>';
    }).join("")+
    '<label class="fld"><span class="eyebrow">Note</span><input type="text" id="m_note"></label>'+
    '<button class="btn pri" style="margin-top:14px" data-a="savemis">Salva</button>'+
    '<button class="btn ghost" style="margin-top:8px" data-a="x">Annulla</button>');
}
async function saveMis(){
  var g=id=>{ var v=document.getElementById(id).value; return v===""?null:+v; };
  S.mis.push({w:weekOf(today()), date:today(), peso:g("m_peso"), torace:g("m_torace"),
    bic:g("m_bic"), coscia:g("m_coscia"), vita:g("m_vita"), note:document.getElementById("m_note").value});
  var okS=await save(); if(SYNC.on()) doPush(false); closeSheet(); render(); toast(okS?"Misure salvate":"NON salvate: il dispositivo rifiuta la scrittura");
}
/* Benessere in due momenti, ognuno con i suoi campi:
   mattina (al risveglio, da Zepp): HRV, FC, readiness, sonno, peso, dove hai dormito, alcol, spalla
   sera (prima di dormire): reflusso, camminate, respirazione, stress, testa, note.
   Senza momento (correzione di un giorno passato) si vedono tutti. Ogni modulo
   salva solo i campi che mostra: gli altri restano come sono. */
function pillScala(id, key, max, sel, da){
  var h='<div class="pills scala" id="'+id+'">';
  for(var v=(da||0); v<=max; v++) h+='<button class="pill '+(sel===v?"on":"")+'" data-'+key+'="'+v+'">'+v+'</button>';
  return h+'</div>';
}
function formBen(date, isAdd, momento){
  var dt=date||today(), editDate = isAdd || dt!==today();
  var b = isAdd ? {} : (S.ben.filter(x=>x.date===dt)[0]||{});
  var ie = benIeri(dt) || {};
  var hi=function(v){ return (v===null||v===undefined||v==="")? "" : '<span class="hint">ieri '+esc(v)+'</span>'; };
  var ph=function(v){ return (v===null||v===undefined||v==="")? "" : ' placeholder="ieri '+esc(v)+'"'; };
  var sede = b.sede || ie.sede || "Casa";
  var mat = momento!=="sera", ser = momento!=="mattina";
  var titolo = isAdd ? "Aggiungi un giorno" : (dt!==today()? "Modifica · "+dt : (momento==="mattina"?"Mattino · ":momento==="sera"?"Sera · ":"")+dt);
  var h='<div class="eyebrow">Benessere'+(momento? ' · '+(mat?"al risveglio, 1 minuto":"prima di dormire, 30 secondi") : '')+'</div><h2 style="margin:4px 0 10px">'+titolo+'</h2>'+
    (isAdd?'<div class="sm mut" style="margin-bottom:8px">Un giorno saltato: scegli la data e compila. È un dato nuovo, si aggiunge al foglio senza problemi.</div>':"")+
    (editDate?'<label class="fld"><span class="eyebrow">Data</span><input type="date" id="bDate" value="'+isoDay(dt)+'"></label>':'<input type="hidden" id="bDate" value="'+isoDay(dt)+'">');
  if(mat){
    h+='<div class="between" style="margin-top:6px"><div class="eyebrow glow">Da Zepp</div>'+
      '<button class="btn sm ghost" data-a="benpaste">Incolla da Salute</button></div>'+
    '<div class="grid3">'+
      '<label class="fld"><span class="eyebrow">HRV notte</span><input type="number" inputmode="numeric" id="bHrv" value="'+(b.hrv||"")+'"'+ph(ie.hrv)+'></label>'+
      '<label class="fld"><span class="eyebrow">FC riposo</span><input type="number" inputmode="numeric" id="bRhr" value="'+(b.rhr||"")+'"'+ph(ie.rhr)+'></label>'+
      '<label class="fld"><span class="eyebrow">Readiness</span><input type="number" inputmode="numeric" id="bRead" value="'+(b.read||"")+'"'+ph(ie.read)+'></label></div>'+
    '<div class="grid2">'+
      '<label class="fld"><span class="eyebrow">Sonno h</span><input type="number" step="0.1" inputmode="decimal" id="bSonno" value="'+(b.sonno||"")+'"'+ph(ie.sonno)+'></label>'+
      '<label class="fld"><span class="eyebrow glow">Peso mattino kg</span><input type="number" step="0.1" inputmode="decimal" id="bPeso" value="'+(b.peso||"")+'"'+ph(ie.peso)+'></label></div>'+
    '<div class="xs mut" style="margin-top:6px">In grigio il valore di ieri: i numeri non si precompilano, così non copi per sbaglio quelli vecchi. In trasferta il peso lascialo vuoto.</div>'+
    '<label class="fld"><span class="eyebrow">Dove hai dormito</span><div class="pills" id="bSede">'+
      '<button class="pill '+(sede!=="Fuori"?"on":"")+'" data-sd="Casa">Casa</button><button class="pill '+(sede==="Fuori"?"on":"")+'" data-sd="Fuori">Fuori casa</button></div></label>'+
    '<div id="bCittaW" style="display:'+(sede==="Fuori"?"block":"none")+'"><input type="text" id="bCitta" placeholder="Dove (es. Parma)" value="'+esc(b.citta||(sede==="Fuori"?(ie.citta||""):""))+'"></div>'+
    '<label class="fld"><span class="eyebrow">Alcol ieri sera</span><div class="pills" id="bAlc">'+
      '<button class="pill '+(b.alc?"":"on")+'" data-x="0">No</button><button class="pill '+(b.alc?"on":"")+'" data-x="1">Sì</button></div></label>'+
    '<label class="fld"><span class="eyebrow">Spalla sinistra stamattina · 0 niente · 10 massimo'+hi(ie.dolm)+'</span>'+pillScala("bDol","dl",10,b.dolm)+'</label>';
  }
  if(ser){
    h+='<label class="fld"><span class="eyebrow">Reflusso · 0 nessuno · 3 marcato'+hi(ie.refl)+'</span><div class="pills" id="bRefl">'+
      [0,1,2,3].map(v=>'<button class="pill '+(b.refl===v?"on":"")+'" data-r="'+v+'">'+v+'</button>').join("")+'</div></label>'+
    '<label class="fld"><span class="eyebrow">Camminate dopo i pasti · bersaglio 2'+hi(ie.camm)+'</span><div class="pills" id="bCam">'+
      [0,1,2].map(v=>'<button class="pill '+(b.camm===v?"on":"")+'" data-c="'+v+'">'+v+'</button>').join("")+'</div></label>'+
    '<label class="fld"><span class="eyebrow">Respirazione 4-7</span><div class="pills" id="bResp">'+
      '<button class="pill '+(b.resp?"":"on")+'" data-p="0">No</button><button class="pill '+(b.resp?"on":"")+'" data-p="1">Sì</button></div></label>'+
    '<label class="fld"><span class="eyebrow">Stress · 0 nessuno · 3 marcato'+hi(ie.stress)+'</span><div class="pills" id="bStr">'+
      [0,1,2,3].map(v=>'<button class="pill '+(b.stress===v?"on":"")+'" data-st="'+v+'">'+v+'</button>').join("")+'</div></label>'+
    '<label class="fld"><span class="eyebrow">Testa · 1 vuoto · 5 lucido'+hi(ie.mente)+'</span><div class="pills" id="bMen">'+
      [1,2,3,4,5].map(v=>'<button class="pill '+(b.mente===v?"on":"")+'" data-me="'+v+'">'+v+'</button>').join("")+'</div></label>'+
    '<label class="fld"><span class="eyebrow">Note</span><input type="text" id="bNote" value="'+esc(b.note||"")+'"></label>';
  }
  h+=((!isAdd && dt!==today())?verWarn():"")+
    '<button class="btn pri" style="margin-top:14px" data-a="saveben"'+((!isAdd && dt!==today())?' data-d="'+esc(dt)+'"':'')+'>Salva</button>'+
    ((!isAdd && dt!==today())?'<button class="btn ghost" style="margin-top:8px" data-a="bendel" data-d="'+esc(dt)+'">Cancella questo giorno</button>':"")+
    '<button class="btn ghost" style="margin-top:8px" data-a="x">Annulla</button>';
  sheet(h);
}
async function saveBen(origDate){
  var c=function(sel){ return !!document.querySelector(sel); };
  var pick=function(sel,at,prev){ if(!c(sel)) return prev; var e=document.querySelector(sel+" .pill.on"); return e?+e.dataset[at]:null; };
  var g=function(id,prev){ var el=document.getElementById(id); if(!el) return prev; var v=el.value; return v===""?null:+String(v).replace(",","."); };
  var de=document.getElementById("bDate"), dt=de? fromIso(de.value) : today();
  if(!/^\d{2}\/\d{2}\/\d{4}$/.test(dt)){ toast("Data non valida"); return; }
  var prev=S.ben.filter(function(x){ return x.date===dt; })[0] || (origDate? S.ben.filter(function(x){ return x.date===origDate; })[0] : null) || {};
  var sedeEl=document.querySelector("#bSede .pill.on"), cit=document.getElementById("bCitta"), nt=document.getElementById("bNote");
  var rec=Object.assign({}, prev, {date:dt, w:weekOf(dt),
    refl:pick("#bRefl","r",prev.refl==null?null:prev.refl), camm:pick("#bCam","c",prev.camm==null?null:prev.camm),
    resp: c("#bResp")? pick("#bResp","p")===1 : !!prev.resp, alc: c("#bAlc")? pick("#bAlc","x")===1 : !!prev.alc,
    hrv:g("bHrv",prev.hrv==null?null:prev.hrv), rhr:g("bRhr",prev.rhr==null?null:prev.rhr), read:g("bRead",prev.read==null?null:prev.read),
    sonno:g("bSonno",prev.sonno==null?null:prev.sonno), peso:g("bPeso",prev.peso==null?null:prev.peso),
    stress:pick("#bStr","st",prev.stress==null?null:prev.stress), mente:pick("#bMen","me",prev.mente==null?null:prev.mente),
    dolm:pick("#bDol","dl",prev.dolm==null?null:prev.dolm),
    passi:(prev.passi===undefined?null:prev.passi), ipo:(prev.ipo===undefined?null:prev.ipo),
    sede: c("#bSede")? (sedeEl? sedeEl.dataset.sd : (prev.sede||"")) : (prev.sede||""),
    citta: c("#bSede")? ((sedeEl && sedeEl.dataset.sd==="Fuori" && cit)? cit.value.trim() : "") : (prev.citta||""),
    note: nt? nt.value : (prev.note||"")});
  var avv=controlloBen(rec);
  if(avv.length && !confirm("Valori insoliti:\n- "+avv.join("\n- ")+"\n\nSalvo lo stesso?")) return;
  var delDate = (origDate && origDate!==dt) ? origDate : null; /* data cambiata: la vecchia riga va rimossa */
  S.ben = S.ben.filter(x=>x.date!==dt && x.date!==(delDate||dt)); S.ben.push(rec);
  benTouch(dt); if(delDate && S.dirtyBen) delete S.dirtyBen[delDate];
  var okS=await save(); closeSheet(); render();
  if(SYNC.on()){ doPush(false); if(delDate){ try{ await SYNC.pushDelete({ben:[delDate]}); }catch(e){} } }
  toast(okS?"Benessere salvato":"NON salvato: vedi la scheda Coach");
}
var SIMQ=[["Floor Press","I due manubri arrivano in alto insieme?"],["Box Squat","Il peso è uguale sui due piedi? (5 squat a occhi chiusi)"],
  ["Split-stance RDL","I due lati scendono alla stessa profondità?"],["Bird-dog","I due lati sono ugualmente stabili?"]];
/* riepilogo settimanale: due numeri, una volta a settimana.
   Vivono sulla riga benessere del giorno in cui li scrivi, così non
   serve una tabella nuova sul foglio. */
function purgaSheet(){
  var n=conteggiaRotte();
  sheet('<div class="eyebrow amb">Conferma</div><h2 style="margin:4px 0 8px">Rimuovere '+n+' righe?</h2>'+
    '<div class="sm">Hanno la data mancante o illeggibile: l\'app non pu\u00f2 collocarle in nessuna settimana, '+
    'quindi non sono gi\u00e0 visibili da nessuna parte.</div>'+
    '<div class="sm mut" style="margin-top:8px">L\'operazione tocca solo la copia sul telefono. '+
    'Il foglio cambia solo quando premi Invia tutto.</div>'+
    '<div class="flag disc" style="margin-top:10px">\u26a0<div>Se non hai ancora scaricato il backup, annulla e fallo prima.</div></div>'+
    '<button class="btn amb" style="margin-top:14px" data-a="purgago">S\u00ec, rimuovile</button>'+
    '<button class="btn ghost" style="margin-top:8px" data-a="x">Annulla</button>');
}
async function purgaVai(){
  var tolte=0;
  ["log","sess","mis","ben","sim","mob"].forEach(function(k){
    if(!Array.isArray(S[k])) return;
    var prima=S[k].length;
    S[k]=S[k].filter(function(r){ return dataOk(r.date); });
    tolte += prima - S[k].length;
  });
  var okS=await save();
  closeSheet(); render();
  toast(okS? tolte+" righe rimosse" : "NON salvato: vedi la scheda Coach");
}
function formSett(){
  var dt=today(), b=S.ben.filter(function(x){ return x.date===dt; })[0]||{};
  sheet('<div class="eyebrow">Riepilogo settimanale</div><h2 style="margin:4px 0 4px">Settimana '+weekOf(dt)+'</h2>'+
    '<div class="sm mut" style="margin-bottom:6px">Due numeri letti da Zepp, una volta a settimana. La domenica è il momento naturale.</div>'+
    '<label class="fld"><span class="eyebrow">Passi · media giornaliera</span><input type="number" inputmode="numeric" id="wPassi" value="'+(b.passi||"")+'"></label>'+
    '<div class="xs mut">Serve al modulo peso: se la pendenza si appiattisce e i passi sono saliti, la causa è il movimento, non il cibo.</div>'+
    '<label class="fld"><span class="eyebrow">Indice ipopnea · eventi/ora</span><input type="number" step="0.1" inputmode="decimal" id="wIpo" value="'+(b.ipo||"")+'"></label>'+
    '<div class="xs mut">Non guida l\'allenamento. Serve ad avere un andamento da mostrare al medico se resta sopra 5.</div>'+
    '<button class="btn pri" style="margin-top:14px" data-a="savesett">Salva</button>'+
    '<button class="btn ghost" style="margin-top:8px" data-a="x">Annulla</button>');
}
async function saveSett(){
  var g=function(id){ var v=document.getElementById(id).value; return v===""?null:+v; };
  var dt=today(), b=S.ben.filter(function(x){ return x.date===dt; })[0];
  if(!b){ b={date:dt, w:weekOf(dt), refl:null, camm:null, resp:false, alc:false, hrv:null, rhr:null,
             read:null, sonno:null, peso:null, stress:null, mente:null, note:""}; S.ben.push(b); }
  b.passi=g("wPassi"); b.ipo=g("wIpo");
  benTouch(dt);
  var okS=await save(); if(SYNC.on()) doPush(false);
  closeSheet(); render(); toast(okS?"Riepilogo salvato":"NON salvato: vedi la scheda Coach");
}

/* --- modulo B: test di mobilità, ogni 28 giorni --- */
function formMob(){
  var l=mobLast();
  var h='<div class="eyebrow">Mobilità</div><h2 style="margin:4px 0 4px">'+today()+'</h2>'+
    '<div class="sm mut" style="margin-bottom:4px">Stessa ora, stesse scarpe (o senza), dopo il riscaldamento. Tocca il nome per la procedura.</div>';
  MOB.forEach(function(t){
    h+='<div class="card" style="margin:10px 0;padding:12px">'+
       '<button class="between" style="width:100%;text-align:left" data-a="mobhow" data-k="'+t.k+'">'+
       '<div class="sm" style="font-weight:600">'+esc(t.n)+' <span class="mut xs">'+t.u+'</span></div>'+
       '<div class="ch" style="color:var(--dim);font-size:17px">?</div></button>';
    if(t.bi) h+='<div class="grid2" style="margin-top:8px">'+
       '<label class="fld" style="margin:0"><span class="eyebrow" style="color:var(--amb)">Sinistra</span><input type="number" step="0.5" inputmode="decimal" id="mb_'+t.k+'_s" value="'+((l&&l[t.k+"_s"])||"")+'"></label>'+
       '<label class="fld" style="margin:0"><span class="eyebrow glow">Destra</span><input type="number" step="0.5" inputmode="decimal" id="mb_'+t.k+'_d" value="'+((l&&l[t.k+"_d"])||"")+'"></label></div>';
    else h+='<label class="fld" style="margin:8px 0 0"><span class="eyebrow">Valore</span><input type="number" step="0.5" inputmode="decimal" id="mb_'+t.k+'" value="'+((l&&l[t.k])||"")+'"></label>';
    h+='</div>';
  });
  h+='<label class="fld"><span class="eyebrow">Note</span><input type="text" id="mbNote"></label>'+
     (l?'<div class="xs mut" style="margin-top:8px">I campi mostrano i valori dell\'ultima rilevazione ('+esc(l.date)+'): sovrascrivili.</div>':"")+
     '<button class="btn pri" style="margin-top:14px" data-a="savemob">Salva</button>'+
     '<button class="btn ghost" style="margin-top:8px" data-a="x">Annulla</button>';
  sheet(h);
}
async function saveMob(){
  var g=function(id){ var e=document.getElementById(id); if(!e) return null; var v=e.value; return v===""?null:+v; };
  var rec={date:today(), w:weekOf(today()), note:document.getElementById("mbNote").value};
  var any=false;
  MOB.forEach(function(t){
    if(t.bi){ rec[t.k+"_s"]=g("mb_"+t.k+"_s"); rec[t.k+"_d"]=g("mb_"+t.k+"_d");
              if(rec[t.k+"_s"]!==null||rec[t.k+"_d"]!==null) any=true; }
    else { rec[t.k]=g("mb_"+t.k); if(rec[t.k]!==null) any=true; }
  });
  if(!any){ toast("Nessun valore inserito"); return; }
  if(!Array.isArray(S.mob)) S.mob=[];
  S.mob = S.mob.filter(function(x){ return x.date!==rec.date; });
  S.mob.push(rec);
  S.mob.sort(function(a,b){ return s2d(a.date)-s2d(b.date); });
  var okS=await save(); if(SYNC.on()) doPush(false);
  closeSheet(); render(); toast(okS?"Mobilità salvata":"NON salvata: vedi la scheda Coach");
}
function mobHow(k){
  var t=MOB.filter(function(x){ return x.k===k; })[0]; if(!t) return;
  sheet('<div class="eyebrow">Come si misura</div><h2 style="margin:4px 0 10px">'+esc(t.n)+'</h2>'+
    '<div class="sm">'+esc(t.how)+'</div>'+
    '<div class="xs mut" style="margin-top:10px">'+(t.up?"Più alto è meglio.":"Più basso è meglio.")+
    (t.bi?" Il confronto fra i due lati conta più del valore assoluto.":"")+'</div>'+
    '<button class="btn ghost" style="margin-top:14px" data-a="mobback">Torna ai test</button>');
}

function formSim(){
  sheet('<div class="eyebrow">Check simmetria · settimana '+weekOf(today())+'</div>'+
    SIMQ.map(function(q,i){
      return '<div style="margin-top:14px"><div style="font-weight:650">'+q[0]+'</div><div class="sm mut">'+q[1]+'</div>'+
        '<div class="pills" id="q'+i+'" style="margin-top:6px">'+["Sì","No","Non verificato"].map(o=>'<button class="pill" data-q="'+o+'">'+o+'</button>').join("")+'</div>'+
        '<div class="pills" id="s'+i+'"><button class="pill" data-s="Sinistro">Limita sx</button><button class="pill" data-s="Destro">Limita dx</button><button class="pill" data-s="Uguale">Uguale</button></div></div>';
    }).join("")+
    '<button class="btn pri" style="margin-top:16px" data-a="savesim">Salva</button>'+
    '<button class="btn ghost" style="margin-top:8px" data-a="x">Annulla</button>');
}
async function saveSim(){
  SIMQ.forEach(function(q,i){
    var a=document.querySelector("#q"+i+" .pill.on"), s=document.querySelector("#s"+i+" .pill.on");
    S.sim.push({date:today(), w:weekOf(today()), ex:q[0], q:q[1], a:a?a.dataset.q:"", side:s?s.dataset.s:""});
  });
  var okS=await save(); closeSheet(); render(); toast(okS?"Check salvato":"NON salvato: vedi la scheda Coach");
}
async function storageTest(){
  var n=S.log.length, canary="rachide:test:"+Date.now();
  var lines=[], pass=true;
  var m=await Store.detect(); lines.push("Supporto rilevato: "+(m==="artifact"?"storage di Claude":m==="device"?"memoria del browser":"NESSUNO"));
  if(m==="none"){ pass=false; lines.push("Nessun meccanismo di salvataggio disponibile."); }
  else{
    try{ var v=await Store.probe(canary,"prova-"+n);
      lines.push(v==="prova-"+n ? "Scrittura e rilettura di prova: riuscite" : "Rilettura di prova: FALLITA");
      if(v!=="prova-"+n) pass=false;
    }catch(e){ pass=false; lines.push("Errore in scrittura: "+(e&&e.message||e)); }
  }
  var okS=await save();
  lines.push(okS ? "Salvataggio reale dei tuoi dati: riuscito ("+Math.round(Store.bytes/1024)+" KB)" : "Salvataggio reale: FALLITO");
  if(!okS) pass=false;
  sheet('<div class="eyebrow '+(pass?"glow":"amb")+'">Verifica salvataggio</div>'+
    '<h2 style="margin:4px 0 10px">'+(pass?"Funziona":"Non funziona")+'</h2>'+
    lines.map(l=>'<div class="flag '+(/FALLIT|NESSUN|Errore/.test(l)?"stop":"info")+'">•<div>'+esc(l)+'</div></div>').join("")+
    (pass?'<div class="sm mut" style="margin-top:10px">Chiudi e riapri l\'app: il contenuto deve restare '+S.sess.length+' sessioni e '+S.log.length+' righe di log.</div>'
        :'<div class="sm" style="margin-top:10px">Finché è così, l\'unico archivio affidabile è il backup .json. Scaricalo prima di chiudere.</div>')+
    '<button class="btn pri" style="margin-top:14px" data-a="dlj">Scarica il backup</button>'+
    '<button class="btn ghost" style="margin-top:8px" data-a="x">Chiudi</button>');
  render();
}
async function syncDiag(){
  sheet('<div class="eyebrow amb">Diagnostica collegamento</div><div class="sm mut" style="margin-top:8px">Sto provando…</div>');
  var res=await SYNC.diagnose();
  var framed=res[0] && res[0].bad;
  var netKo=res.filter(r=>/bloccat/.test(r.v)).length>=1;
  var segretoKo=res.filter(r=>/segreto non valido/.test(r.v)).length>=1;
  var tuttoOk=res.filter(r=>r.bad).length===0;
  var verdetto = segretoKo
    ? "Il foglio risponde, quindi rete e distribuzione funzionano. Rifiuta solo la frase segreta: quella nell'app non coincide con quella nella distribuzione attiva. Se l'hai cambiata nel codice, ricordati di ridistribuire con una VERSIONE NUOVA, altrimenti online resta il segreto vecchio."
    : (framed && netKo)
    ? "Questo contenitore impedisce all'app di contattare Google. Non è un problema del tuo foglio: è l'ambiente. Serve pubblicare l'app su un indirizzo proprio."
    : netKo ? "La rete verso Google non passa. Controlla che la distribuzione sia attiva e l'accesso impostato su Chiunque."
    : tuttoOk ? "Il collegamento funziona."
    : "Qualcosa non torna: guarda le righe rosse qui sopra.";
  sheet('<div class="eyebrow amb">Diagnostica collegamento</div>'+
    res.map(r=>'<div class="flag '+(r.bad?"stop":"info")+'"><b>'+esc(r.t)+'</b><div>'+esc(r.v)+'</div></div>').join("")+
    '<div class="flag disc" style="margin-top:10px"><b>Verdetto</b><div>'+esc(verdetto)+'</div></div>'+
    '<div class="sm mut" style="margin-top:10px">Controprova decisiva: apri lo stesso indirizzo in Safari. Se lì vedi i dati in JSON, il foglio è a posto e il problema è solo dove gira l\'app.</div>'+
    '<button class="btn ghost" style="margin-top:12px" data-a="x">Chiudi</button>');
}
function syncForm(){
  var c=S.sync||{};
  sheet('<div class="eyebrow glow">Collegamento al foglio</div><h2 style="margin:4px 0 10px">Due valori</h2>'+
    '<div class="sm mut">Li ottieni installando lo script nel foglio: Estensioni → Apps Script, incolli il codice, Distribuisci come app web.</div>'+
    '<div class="flag info" style="margin-top:8px">•<div>Puoi incollare qui sotto direttamente il link di prova completo di <b>?k=</b> stampato da <i>verifica</i>: l\'app separa da sola indirizzo e segreto, così non c\'è niente da ricopiare a mano.</div></div>'+
    '<label class="fld"><span class="eyebrow">URL della distribuzione (finisce con /exec)</span>'+
    '<input type="text" id="syU" value="'+esc(c.url||"")+'" placeholder="https://script.google.com/macros/s/…/exec"></label>'+
    '<label class="fld"><span class="eyebrow">Frase segreta (la stessa dello script)</span>'+
    '<input type="text" id="syK" value="'+esc(c.secret||"")+'" autocomplete="off" autocapitalize="off" spellcheck="false"></label>'+
    '<button class="btn sm ghost" style="width:100%;margin-top:8px" data-a="sgen">Genera una frase segreta robusta (32 caratteri)</button>'+
    '<div class="xs mut" style="margin-top:6px">Con lo script v3 la frase non viaggia nell\'indirizzo. Generane una nuova, mettila nelle proprietà dello script (SEGRETO) e ridistribuisci.</div>'+
    '<button class="btn pri" style="margin-top:14px" data-a="ssave">Salva e prova</button>'+
    '<button class="btn ghost" style="margin-top:8px" data-a="x">Annulla</button>');
}
async function syncSave(){
  var u=document.getElementById("syU").value.trim(), k=document.getElementById("syK").value.trim();
  /* se hanno incollato il link completo, estraggo il segreto e pulisco l'URL */
  var m=u.match(/[?&]k=([^&#\s]*)/);
  if(m){ k=decodeURIComponent(m[1]); u=u.split("?")[0]; }
  u=u.replace(/\s+/g,""); k=k.trim();
  if(!/^https:\/\/script\.google\.com\/.*\/exec$/.test(u)){ toast("L'URL deve iniziare con https://script.google.com e finire con /exec"); return; }
  S.sync={url:u, secret:k}; await save(); closeSheet(); render();
  doPull(true);
}
/* Letture e scritture sul foglio passano in fila, una alla volta. Prima due
   invii potevano incrociarsi (il vecchio arrivare dopo il nuovo) e una lettura
   partita all'apertura poteva tornare dopo che avevi gia' aggiunto un pasto. */
var SQ={p:Promise.resolve(), attesa:null};
function inFila(fn){ var r=SQ.p.then(fn, fn); SQ.p=r.catch(function(){}); return r; }
function doPull(loud){
  if(!SYNC.on()) return Promise.resolve();
  return inFila(function(){ return _pullNow(loud); });
}
function doPush(loud){
  if(!SYNC.on()) return Promise.resolve(false);
  if(loud) return inFila(function(){ return _pushNow(true); });
  /* piu' richieste ravvicinate diventano un solo invio: parte con lo stato piu' recente */
  if(SQ.attesa) return SQ.attesa;
  SQ.attesa = inFila(function(){ SQ.attesa=null; return _pushNow(false); });
  return SQ.attesa;
}
async function _pullNow(loud){
  if(!SYNC.on()) return;
  SYNC.busy=true; SYNC.err=""; if(loud) toast("Leggo dal foglio…");
  try{
    var t0=Date.now();
    var d=await SYNC.pull();
    var vuoto = !(d.log&&d.log.length) && !(d.sess&&d.sess.length);
    if(vuoto && S.log.length){
      SYNC.state="vuoto"; SYNC.busy=false;
      if(loud) sheet('<div class="eyebrow amb">Il foglio è vuoto</div>'+
        '<div class="sm" style="margin-top:8px">Nel foglio non c\'è ancora niente, ma in memoria hai '+S.log.length+' righe. Le mando su prima di rendere il foglio la fonte dei dati?</div>'+
        '<button class="btn pri" style="margin-top:14px" data-a="spush">Invia tutto al foglio</button>'+
        '<button class="btn ghost" style="margin-top:8px" data-a="x">Non ora</button>');
      return;
    }
    SYNC.adopt(d, t0); PLAN=buildPlan(); await save(); render();
    if(SYNC.repaired>0 && loud) toast(SYNC.repaired+" righe nel foglio sono da riscrivere: vedi Coach");
    if(SYNC.pending>0 || Object.keys(S.dirtyBen||{}).length){ var np=SYNC.pending; await _pushNow(false); if(loud && np) toast("Allineato: "+np+" righe locali mandate al foglio"); }
    else if(loud) toast("Letto dal foglio: "+S.log.length+" righe, "+S.sess.length+" sessioni");
  }catch(e){ SYNC.state="errore"; SYNC.err=String(e.message||e); render();
    if(loud){ toast("Lettura fallita"); setTimeout(syncDiag, 500); } }
  SYNC.busy=false;
}
async function _pushNow(loud){
  if(!SYNC.on()) return false;
  SYNC.busy=true; SYNC.err=""; if(loud) toast("Scrivo sul foglio…");
  var snap=Object.assign({}, S.dirtyBen||{});
  try{
    /* script v3: solo le righe cambiate (o tutto, se lo chiedi), piu' impostazioni e KPI */
    var v3=(S.syncVer||1)>=3, pl=v3? payloadV3(!!loud) : SYNC.payloadAll();
    var invio=Object.assign({}, pl); delete invio._impronte;
    var r=await SYNC.push(invio);
    if(v3) dopoInvioV3(pl);
    /* confermato dal foglio: tolgo il segno solo alle giornate non cambiate nel frattempo */
    Object.keys(snap).forEach(function(k){ if(S.dirtyBen && S.dirtyBen[k]===snap[k]) delete S.dirtyBen[k]; });
    /* piano: gli esercizi tolti dal piano spariscono anche da App_Piano */
    if(!v3) try{
      var ids=pianoRows().map(function(x){ return x.id; });
      var via=(S.pianoIds||[]).filter(function(x){ return ids.indexOf(x)<0; });
      if(via.length) await SYNC.pushDelete({piano:via});
      S.pianoIds=ids;
    }catch(e){}
    await save();
    SYNC.state="ok"; SYNC.last=new Date(); SYNC.busy=false; render();
    var n=r.added? Object.keys(r.added).reduce((a,k)=>a+(r.added[k]||0),0) : 0;
    if(loud){ closeSheet(); toast(n? "Aggiunte "+n+" righe nuove al foglio" : "Il foglio era già aggiornato"); }
    return true;
  }catch(e){
    SYNC.state="errore"; SYNC.err=String(e.message||e); SYNC.busy=false; render();
    if(loud) toast("Scrittura fallita: "+SYNC.err);
    return false;
  }
}
var _pend=null, _pendId=null;
/* ---------- proposta della settimana, dal foglio ---------- */
function hashOps(ops){
  /* senza le chiavi interne (_ts, _k) che buildPlan aggiunge alle operazioni */
  var s=JSON.stringify(ops||[], function(k,v){ return k.charAt(0)==="_" ? undefined : v; }), h=0;
  for(var i=0;i<s.length;i++){ h=((h<<5)-h+s.charCodeAt(i))|0; }
  return String(h);
}
/* la proposta resta in vista finche' non la applichi o la scarti; se l'hai gia'
   incollata a mano (stesse operazioni), non ricompare */
function propAttiva(){
  var p=S.prop; if(!p || !p.id || p.id===S.propFatta) return null;
  try{ var ops=JSON.parse(p.testo).ops, h=hashOps(ops);
    if((S.patches||[]).some(function(pt){ return hashOps(pt.ops)===h; })) return null;
  }catch(e){ return null; }
  return p;
}
async function propCheck(force){
  if(!SYNC.on()) return;
  var now=Date.now();
  if(!force && S.propTs && now-S.propTs < 3*3600000) return;
  S.propTs=now;
  var p=await SYNC.proposta();
  if(p===undefined){ S.propScript=false; await save(); if(force){ render(); toast("Il foglio non passa ancora le proposte"); } return; }
  S.propScript=true;
  S.prop = (p && p.id && p.testo) ? {id:String(p.id), data:String(p.data||""), testo:String(p.testo)} : null;
  await save(); render();
  if(force) toast(propAttiva() ? "C'è una proposta nuova" : "Nessuna proposta nuova");
}
/* un tocco: legge gli appunti, li mette nel riquadro e apre l'anteprima */
async function patchIncolla(){
  var txt="";
  try{ txt=await navigator.clipboard.readText(); }
  catch(e){ toast("Non riesco a leggere gli appunti: incolla a mano nel riquadro"); return; }
  txt=String(txt||"").trim();
  var a=txt.indexOf("{"), b=txt.lastIndexOf("}");
  if(a<0 || b<a){ toast("Negli appunti non c'è un codice del coach"); return; }
  var t=document.getElementById("patchT"); if(t) t.value=txt.slice(a, b+1);
  patchPreview();
}
/* Controllo della patch sul piano in vigore, voce per voce: una modifica che non
   trova il suo esercizio non fa nulla, e senza avviso passerebbe inosservata.
   Simula in sequenza solo aggiunte e tolte, che cambiano cosa trovano le voci dopo. */
function patchControllo(pt){
  var P=clone(PLAN);
  return (pt.ops||[]).map(function(o){
    var strut=["set","del","add","dischi"].indexOf(o.op)>=0, day=o.d ? P[o.d] : null, msg=null;
    if(strut || (o.op==="nota" && o.d)){
      if(!day) msg="il giorno «"+o.d+"» non esiste";
      else if((o.op==="set"||o.op==="del") && !day.ex.some(function(e){ return e.n===o.n; })) msg="«"+o.n+"» non c'è nel giorno "+o.d;
      else if(o.op==="add" && (!o.ex || day.ex.some(function(e){ return e.n===o.ex.n; }))) msg=o.ex ? "«"+o.ex.n+"» c'è già nel giorno "+o.d : "esercizio mancante";
    }
    if(!msg && day){
      if(o.op==="del") day.ex=day.ex.filter(function(e){ return e.n!==o.n; });
      if(o.op==="add") day.ex.push(o.ex);
    }
    return msg;
  });
}
function patchPreview(raw, pid){
  if(typeof raw!=="string"){ var ta=document.getElementById("patchT"); raw=ta ? ta.value.trim() : ""; }
  if(!raw){ toast("Incolla prima il codice"); return; }
  try{
    var p=JSON.parse(raw);
    if(!p.ops || !p.ops.length) throw 0;
    var bad=p.ops.filter(o=>["cibo","ricetta","stima","nota","kcal","target"].indexOf(o.op)<0 && !PLAN[o.d]);
    if(bad.length) throw 0;
    _pend=p; _pendId=pid||null;
    var ctl=patchControllo(p), nko=ctl.filter(Boolean).length;
    sheet('<div class="eyebrow amb">Aggiornamento del piano</div><h2 style="margin:3px 0 10px">'+esc(p.nota||"Modifica")+'</h2>'+
      (nko ? '<div class="flag stop"><div><b>'+nko+(nko===1?' voce non trova':' voci non trovano')+' il suo esercizio</b>: non cambiano nulla. Il resto si applica. Scrivilo al Coach.</div></div>' : '')+
      previewPatch(p).map((l,i)=> ctl[i]
        ? '<div class="flag stop">✕<div>'+esc(l)+' · '+esc(ctl[i])+'</div></div>'
        : '<div class="flag info">•<div>'+esc(l)+'</div></div>').join("")+
      '<div class="xs mut" style="margin-top:10px">Puoi annullarla in qualsiasi momento dallo storico. I dati già registrati non vengono toccati.</div>'+
      '<button class="btn pri" style="margin-top:14px" data-a="papply">Applica</button>'+
      '<button class="btn ghost" style="margin-top:8px" data-a="x">Annulla</button>');
  }catch(e){ toast("Codice non valido. Copialo per intero, dalla graffa aperta a quella chiusa."); }
}
function patchApply(){
  if(!_pend) return;
  S.patches = S.patches||[];
  S.patches.push({ts:today(), nota:_pend.nota||"", ops:_pend.ops});
  cfgTocca("patches");
  (_pend.ops||[]).forEach(function(o){
    if(o.op==="kcal"){ S.cibOff=+o.off||0; S.cibOffTs=today(); cfgTocca("cibo"); }
    /* il coach puo' spostare il corridoio del peso: {"op":"target","peso":[150,250]} */
    if(o.op==="target" && Array.isArray(o.peso) && o.peso.length===2){ S.target=Object.assign({}, S.target||{}, {peso:[+o.peso[0], +o.peso[1]]}); cfgTocca("target"); }
  });
  if(_pendId){ S.propFatta=_pendId; cfgTocca("proposta"); }
  PLAN=buildPlan(); _pend=null; _pendId=null; save(); closeSheet(); render();
  /* le voci di cibo convertite dalla patch vanno subito sul foglio */
  if(SYNC.on()) doPush(false);
  toast("Piano aggiornato");
}
function importer(){
  sheet('<div class="eyebrow">Ripristina backup</div>'+
    '<div class="sm mut" style="margin:8px 0 12px">Sostituisce tutto quello che c\'è ora: log, sessioni, misure, benessere e modifiche al piano.</div>'+
    '<label class="fld"><span class="eyebrow">Scegli il file .json</span>'+
    '<input type="file" accept=".json,application/json" id="impF" style="padding:10px"></label>'+
    '<div class="eyebrow" style="margin:14px 0 5px">oppure incolla il contenuto</div>'+
    '<textarea id="impT" style="min-height:110px" placeholder=\'{"log":[…]}\'></textarea>'+
    '<button class="btn pri" style="margin-top:12px" onclick="doImport()">Ripristina</button>'+
    '<button class="btn ghost" style="margin-top:8px" data-a="x">Annulla</button>');
  importer2();
}
function importer2(){
  var f=document.getElementById("impF");
  if(f) f.addEventListener("change", function(){
    var file=this.files[0]; if(!file) return;
    var r=new FileReader();
    r.onload=function(){ document.getElementById("impT").value=r.result; toast("File letto: premi Ripristina"); };
    r.readAsText(file);
  });
}
function doImport(){
  try{
    var o=JSON.parse(document.getElementById("impT").value);
    if(!o.log||!o.sess) throw 0;
    S=Object.assign({log:[],sess:[],mis:[],ben:[],sim:[],mob:[],patches:[],draft:null,seeded:true,intent:null}, o);
    if(!Array.isArray(S.mob)) S.mob=[];
    S.lastBackup=today(); S.installed=S.installed||today();
    PLAN=buildPlan(); save(); closeSheet(); render(); toast("Backup ripristinato");
  }catch(e){ toast("File non valido: controlla di aver incollato tutto il .json"); }
}

