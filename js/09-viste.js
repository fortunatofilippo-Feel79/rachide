/* ============================================================
   INTERFACCIA
   ============================================================ */
var V="oggi", app=document.getElementById("app"), rest=null, tick=null;

function toast(m){ var t=document.getElementById("toast"); t.textContent=m; t.classList.add("on");
  clearTimeout(t._x); t._x=setTimeout(()=>t.classList.remove("on"), 2200); }
function sheet(html){ if(typeof SCAN!=="undefined" && SCAN.attivo) scanStop();
  document.getElementById("sheetIn").innerHTML='<div class="handle"></div>'+html;
  document.getElementById("sheet").classList.add("on"); Fig.mount(); }
function closeSheet(){ stopAnim(); if(typeof SCAN!=="undefined" && SCAN.attivo) scanStop(); document.getElementById("sheet").classList.remove("on"); }
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
function mmss(s){ s=Math.max(0,Math.round(s)); return Math.floor(s/60)+":"+String(s%60).padStart(2,"0"); }

/* ---------- top bar ---------- */
function topbar(title, sub){
  var d=S.draft, clock="";
  if(d){ clock='<div class="clock'+(sessEta().late?" warn":"")+'" id="sclock">'+clockTxt()+'</div>'; }
  return '<header class="top"><div class="wrap"><div class="toprow"><div>'+
    '<div class="eyebrow">'+esc(sub)+'</div><h1>'+esc(title)+'</h1></div>'+clock+'</div></div></header>';
}

/* versione nuova pronta: un tocco per passarci */
function bannerVersione(){
  if(!SW_NUOVO) return "";
  return '<div class="flag info" style="margin-top:12px"><b>↻</b><div><b>Nuova versione pronta.</b> I dati restano dove sono. '+
    '<button data-a="swagg" style="color:inherit;text-decoration:underline;font-weight:700;padding:0">Aggiorna ora</button></div></div>';
}
/* ---------- OGGI ---------- */
/* scelta del luogo: tre bottoni affiancati */
function segLuogo(sel, day){
  return '<div class="seg" role="radiogroup" aria-label="Dove ti alleni">'+LUOGHI.map(function(l){
    return '<button role="radio" aria-checked="'+(sel===l[0])+'" class="'+(sel===l[0]?"on":"")+'" data-a="luogo" data-v="'+l[0]+'"'+(day?' data-d="'+day+'"':'')+'>'+
      '<b>'+l[1]+'</b><span>'+l[2]+'</span></button>'; }).join("")+'</div>';
}
/* striscia di miniature: cosa ti aspetta nella seduta */
function stripEsercizi(lista){
  return '<div class="figstrip">'+lista.map(function(x){
    return '<button class="fs" data-a="guida" data-n="'+esc(x.n)+'" aria-label="Come si fa: '+esc(x.n)+'">'+figMini(x.n)+
      '<span>'+esc(x.n.replace(" manubri","").replace(" con banda"," (banda)"))+'</span></button>'; }).join("")+'</div>';
}
function viewOggi(){
  if(S.draft) return viewSession();
  var w=weekOf(today()), tutte=S.sess.filter(function(s){ return s.w===w; });
  var fatte=tutte.filter(function(s){ return !isRest(s); });
  var riposi=tutte.filter(isRest);
  var giorni=giorniSettimana(w), pk=picco(w);
  /* un giorno è "coperto" se allenato o segnato come riposo */
  var next=giorni.filter(function(d){ return !tutte.some(function(s){ return s.day===d; }); })[0];
  /* se il piano prevede una seduta per oggi, e' quella */
  var pNext=prossimaDelPiano(w);
  if(pNext && giorni.indexOf(pNext.d)>=0 && !sedutaCoperta(w, pNext.d)) next=pNext.d;
  var completa=!next, stw=statoSettimana(w);
  var h=topbar("Settimana "+w+(pk?" · picco":""), dayName(today())+" "+today());
  h+='<div class="wrap">';
  h+=cardProposta(true);
  h+=bannerVersione();

  if(Store.ok===false) h+=storageAlarm();
  if(!S.log.length && !S.ben.length){
    h+='<div class="card" style="border-color:var(--glow)"><div class="eyebrow glow">Telefono nuovo o prima volta?</div>'+
      '<h2 style="margin:4px 0 6px">Riporta i tuoi dati</h2>'+
      '<div class="sm mut">Collega il foglio e incolla il codice di collegamento del vecchio telefono (Coach → Telefono nuovo): storico, piano, settimane e impostazioni tornano da lì. In alternativa apri il backup .json.</div>'+
      '<div class="grid2" style="margin-top:12px"><button class="btn pri" data-a="scfg">Collega il foglio</button><button class="btn" data-a="imp">Apri un backup</button></div></div>'; }
  var bk=backupState();
  if(bk.due) h+='<div class="flag '+(bk.safe?"disc":"stop")+'" style="margin-top:12px"><b>⤓</b><div>'+
    (bk.tutto ? "Il foglio ha già tutto. Un backup .json ogni tre mesi resta la copia di riserva."
      : bk.safe ? "Lo storico è nel foglio, ma piano e impostazioni vivono solo qui finché non installi lo script v3: un backup li mette al sicuro."
      : (bk.never? "Non hai ancora fatto un backup." : "Ultimo backup "+bk.days+" giorni fa")+
        (bk.since? " · "+bk.since+" sessioni registrate da allora." : "."))+
    ' <button data-a="dlj" style="color:inherit;text-decoration:underline;font-weight:700;padding:0">Scaricalo ora</button></div></div>';

  /* 0 · cosa registrare oggi, e quando */
  if(typeof cardAgenda==="function") h+=cardAgenda();

  /* recupero: oggi o, al mattino, il dato più fresco entro 2 giorni */
  var recB=benOn(today());
  if(!recB){ for(var rb=1;rb<=2 && !recB;rb++){ var dd=new Date(); dd.setDate(dd.getDate()-rb); recB=benOn(d2s(dd)); } }
  var rc=null, recOk = recB && (recB.hrv||recB.read||recB.rhr||recB.sonno);
  if(recOk) rc=recovery(recB.date);

  /* 1 · la prossima seduta, in testa */
  if(completa){
    h+='<div class="card" style="border-color:var(--ok)"><div class="eyebrow" style="color:var(--ok)">Settimana completa</div>'+
       '<h2 style="margin:5px 0 6px">'+(pk?"Due su due":"Quattro su quattro")+'</h2>'+
       '<div class="sm mut">Il recupero fa parte del programma quanto le sessioni. Se vuoi allenarti lo stesso, apri le altre sedute qui sotto.</div></div>';
  } else if(stw.ok && !stw.aperte){
    h+=cardSettimanaFatta(w, stw, next);
  } else {
    if(rc && rc.lvl>=1){
      var oggi=recB.date===today(), bc = rc.lvl>=2 ? "var(--alert)" : "var(--amb)";
      h+='<div class="card" style="border-color:'+bc+'">'+
         '<div class="between"><div class="eyebrow amb">Recupero'+(oggi?" · oggi":" · "+recB.date.slice(0,5))+'</div>'+
         '<div class="xs" style="font-weight:700;color:'+bc+'">'+(rc.lvl>=2?(oggi?"CARICHI FERMI":"RECUPERO BASSO"):"SOTTO LA NORMA")+'</div></div>'+
         '<div class="sm" style="margin-top:8px">HRV '+(recB.hrv||"–")+' · FC '+(recB.rhr||"–")+' · readiness '+(recB.read||"–")+' · sonno '+(recB.sonno||"–")+'h'+
         ((recB.stress!=null)?' · stress '+recB.stress:'')+' · alcol '+(recB.alc?"sì":"no")+'</div>'+
         '<div class="flag '+(rc.lvl>=2?"stop":"disc")+'" style="margin-top:10px">⚠<div><b>'+esc(rc.parts.join(" · "))+'</b><br>'+
         esc(rc.hint||"Se ti alleni, tieni i carichi fermi e non spingere i massimali. Logga i numeri come sono: sono recupero, non un problema di carico.")+'</div></div></div>';
    }
    var vp=voceDelPiano(next), futura=!!(vp && vp.data!==today() && vp.stato==="futura");
    var p=PLAN[next], lu=futura? ((S.luogo && S.luogo.date===today())? S.luogo.v : vp.l) : luogoOggi();
    var lista=(vp && vp.l===lu)? listaSeduta(vp) : listaPerOggi(next, lu), adattata=!!vp, minN=Math.round(minutiSeduta(lista));
    var cambiOggi=[]; if(adattata){ var bOggi=eserciziPer(next, lu);
      lista.forEach(function(x){ var b=bOggi.filter(function(y){ return y.n===x.n; })[0]; if(!b) cambiOggi.push("+ "+x.n); else if(x.s!==b.s) cambiOggi.push(x.n+" "+(x.s>b.s?"+":"−")+Math.abs(x.s-b.s)); });
      bOggi.forEach(function(b){ if(!lista.some(function(x){ return x.n===b.n; })) cambiOggi.push("senza "+b.n); }); }
    h+='<div class="card hero-next">'+
       '<div class="between"><div class="eyebrow glow">'+(futura? 'Prossima · '+GG_NOME[ggDi(vp.data)]+' '+(+vp.data.slice(0,2))+' · giorno '+next : (vp? 'Oggi · giorno '+next : 'Prossima · giorno '+next))+'</div><div class="xs mut">'+lista.length+' esercizi · circa '+minN+'′</div></div>'+
       (futura? '<div class="xs mut" style="margin-top:4px">Oggi il piano non prevede sedute. Se vuoi, puoi anticipare questa a oggi.</div>' : '')+
       '<h2 style="margin:5px 0 10px;font-size:19px">'+esc(p.name)+'</h2>'+
       segLuogo(lu, next)+
       stripEsercizi(lista)+
       (cambiOggi.length? '<div class="xs" style="color:var(--glow);margin-top:8px"><b>Adattata alla settimana'+(vp.t?' · '+vp.t+'′':'')+':</b> '+esc(cambiOggi.join(" · "))+'</div>'
         : (vp? '<div class="xs" style="color:var(--ok);margin-top:8px"><b>Dal piano della settimana'+(vp.t?' · '+vp.t+'′':'')+':</b> nessuna modifica serve, entra nel tempo e i gruppi sono già coperti.</div>' : ''))+
       ((lu==="casa" && p.dischi!=="solo bande")? '<div class="xs" style="color:var(--amb);margin-top:8px">Dischi '+esc(p.dischi)+'</div>':"")+
       (lu!=="casa"? '<div class="xs mut" style="margin-top:8px">'+(lu==="bande"?"Con le bande":"Senza attrezzi")+': stesso schema di movimento, stesse serie. I carichi di casa restano dove sono.</div>':"")+
       ((rc && rc.lvl===0)? '<div class="xs" style="color:var(--ok);margin-top:6px">Recupero ok'+(recB.date===today()?"":" ("+recB.date.slice(0,5)+")")+
          ' · HRV '+(recB.hrv||"–")+' · sonno '+(recB.sonno||"–")+' h</div>' : "")+
       '<button class="btn pri" style="margin-top:12px" data-a="open" data-d="'+next+'" data-l="'+lu+'">'+(futura? 'Anticipala a oggi' : 'Inizia')+'</button>'+
       (p.ess? '' : '<div class="grid2" style="margin-top:8px"><button class="btn sm ghost" style="width:100%" data-a="ridotta" data-d="'+next+'">Poco tempo · 45′</button>'+
       '<button class="btn sm ghost" style="width:100%" data-a="mini" data-d="'+next+'">Giornata storta · 15′</button></div>')+
       '</div>';
    h+=coachBadge(next);
    h+=cardRischio(w, rischioSettimana(w));
  }

  /* 2 · una sola progressione */
  h+=cardProg();

  /* 3 · chiusura della settimana */
  h+=cardChiusura(w, completa);

  /* 4 · la settimana: sette giorni, cosa e' fatto e cosa e' previsto */
  var target=bersaglio(w, riposi.length), sedPiano=seduteDelPiano(w), salt=saltate(w);
  var SW=STATO_SETT[stw.stato];
  h+='<div class="card"><div class="between"><div class="eyebrow">La settimana</div>'+
     '<div class="xs" style="font-weight:700;color:var(--mut)">'+
     fatte.length+' su '+target+(riposi.length?' <span style="color:var(--dim)">· '+riposi.length+' riposo'+(riposi.length>1?'i':'')+'</span>':'')+
     ' <span class="stchip" style="color:'+SW.c+';border-color:'+SW.c+'">'+SW.t+(stw.ok?' ✓':'')+'</span></div></div>';
  h+=cardSettimanaRail(w, sedPiano);
  h+='<div class="xs mut" style="margin-top:6px">Tocca un giorno per segnarlo a casa, fuori con le bande, fuori senza niente o occupato. Il tempo di ogni giorno si sceglie in «Adatta la settimana».</div>';
  if(salt.length) h+='<div class="flag disc" style="margin-top:10px">↻<div><b>'+(salt.length>1?'Sedute del piano non fatte: ':'Seduta del piano non fatta: ')+esc(salt.map(function(e){ return e.d+" ("+ggDi(e.data)+")"; }).join(", "))+'.</b> Nessun problema: adatta la settimana ai giorni che restano.</div></div>';
  var pp=pianoSett(w);
  if(pp){ var pr=sedPiano.filter(function(e){ return e.stato==="oggi"||e.stato==="futura"; });
    if(pr.length) h+='<div class="xs" style="margin-top:8px;color:var(--glow)">Piano'+(pp.da==="coach"?' del coach':'')+': '+esc(pianoTesto(w, pr))+'</div>';
    if(pp.nota) h+='<div class="xs mut" style="margin-top:4px">'+esc(pp.nota)+'</div>'; }
  if(!completa) h+='<div class="grid2" style="margin-top:10px"><button class="btn sm" data-a="piano">Adatta la settimana</button>'+
    '<button class="btn sm ghost" data-a="pics0"'+(pp?'':' disabled')+'>Metti a calendario</button></div>';
  var extra=fatte.filter(function(s){ return giorni.indexOf(s.day)<0; });
  if(extra.length) h+='<div class="xs mut" style="margin-top:8px">Anche: '+
    extra.map(function(s){ return s.day+" il "+s.date.slice(0,5); }).join(" · ")+'</div>';
  h+=pianoDeciso(w);
  var chw=(S.chiusure||{})[w];
  if(chw) h+='<div class="xs" style="margin-top:6px;color:var(--ok)">Settimana chiusa ✓'+(chw.giorni&&chw.giorni.length?' · prossima: '+esc(chw.giorni.join(" · ")):'')+'</div>';
  var stk=streak();
  if(stk.n>0 || !completa){
    var wN=weekOf(today()), cells="";
    for(var si=5;si>=0;si--){ var ww=wN-si, wd=weekDone(ww);
      cells+='<i class="'+(wd.stato==="piena"?"on":wd.stato==="tenuta"?"ten":(ww===wN?"cur":""))+'" title="'+ww+': '+STATO_SETT[wd.stato].t+'"></i>'; }
    h+='<div class="stk">'+cells+'</div>'+
       '<div class="xs mut" style="margin-top:6px">'+
       (stk.n>0? '<b style="color:var(--ok)">'+stk.n+' settiman'+(stk.n>1?'e':'a')+' di fila</b>'+(stk.tenute? ', di cui '+stk.tenute+' tenut'+(stk.tenute>1?'e':'a')+' (barra a righe).' : ' piene.')
               : 'La catena si conta a settimane, non a giorni: un giorno saltato non rompe niente.')+
       (stk.curOpen&&!completa?' Questa è ancora aperta.':'')+
       ' <button class="lnk" data-a="catinfo">Come si conta?</button></div>';
    if(stk.avviso) h+='<div class="flag disc" style="margin-top:8px">⚠<div><b>'+stk.tenuteFila+' settimane tenute di fila.</b> Tenere va bene per qualche settimana, ma il mantenimento a lungo diventa regressione: prova a liberare un giorno o a dare 90′ a una seduta per chiudere tutti i gruppi.</div></div>';
  }
  h+='<details class="altro"'+(pk?' open':'')+'><summary>Altre opzioni della settimana</summary>';
  if(!completa) h+='<button class="btn sm ghost" style="width:100%;margin-top:8px" data-a="restday">Segna un giorno come riposo programmato</button>';
  h+='<button class="btn sm ghost" style="width:100%;margin-top:8px" data-a="picco">'+
     (pk? "Torna alle 4 sedute questa settimana" : "Settimana di picco: 2 sedute essenziali da 30′")+'</button>';
  h+='<div class="xs mut" style="margin-top:6px">'+(pk? 'Due sedute brevi a tutto corpo, carichi invariati: con l\'intensità mantenuta bastano a conservare forza e massa per settimane (Spiering 2021).' : 'Il riposo programmato abbassa il bersaglio di una seduta. La settimana di picco sostituisce le 4 sedute con 2 essenziali. Per i giorni pieni di solito basta «Adatta la settimana».')+'</div></details>';
  h+='</div>';

  /* 5 · cibo */
  h+=cardCibo();

  /* 6 · tutto il resto, chiuso in una riga */
  var altre=["A","B","C","D","E1","E2"].filter(function(d){ return d!==next; });
  h+='<details class="more"><summary>Altre sedute e trasferta</summary>';
  h+='<div class="card">';
  altre.concat(["T1","T2"]).forEach(function(d){
    var p=PLAN[d]; if(!p) return;
    var trasf=p.sede!=="Casa";
    h+='<button class="item" data-a="open" data-d="'+d+'"><div class="badge">'+d+'</div>'+
       '<div class="t"><b>'+esc(trasf? p.name.replace("Trasferta · ","In trasferta · ") : p.name)+'</b><span class="xs mut">'+
       (trasf? 'solo bande · ' : '')+p.ex.length+' esercizi · '+p.min+' min</span></div>'+
       '<div class="ch">›</div></button>';
  });
  h+='</div></details>';

  var reali=S.sess.filter(function(s){ return !isRest(s); });
  var ls=reali[reali.length-1];
  if(ls) h+='<div class="card flat"><div class="between"><div><div class="eyebrow">Ultima sessione</div>'+
    '<div class="sm" style="margin-top:3px">Giorno '+ls.day+' · '+ago(ls.date)+(ls.mod&&ls.mod!=="Pesi"?' · '+esc(ls.mod.toLowerCase()):'')+'</div></div>'+
    '<div class="xs mut" style="text-align:right">'+ls.min+' min<br>energia '+ls.en+'</div></div></div>';
  h+='<div style="height:24px"></div></div>';
  return h;
}

/* ---------- sessione in corso ---------- */
function viewSession(){
  var d=S.draft, p=PLAN[d.day];
  var h=topbar(p.name, "Giorno "+d.day+" · settimana "+weekOf(d.date)+(d.rid?" · ridotta 45′":(d.mini?" · minima":"")));
  h+='<div class="wrap">';
  h+=coachCard(d.day);

  if(S.vistaTutte){
    h+='<button class="btn sm ghost" style="width:100%;margin-top:10px" data-a="vista">Un esercizio alla volta</button>';
    h+=warmCard(d);
    if(p.dischi!=="solo bande") h+='<div class="flag disc"><b>Dischi</b><div>'+esc(p.dischi)+' — cambiali <b>dentro</b> il recupero, non dopo.</div></div>';
    d.ex.forEach(function(e,i){ h+=exCard(e,i,e.def||p.ex[i]); });
    h+='<button class="btn ghost" style="margin-top:4px" data-a="exadd0">Aggiungi un esercizio solo per oggi</button>';
    h+='<div style="margin:18px 0 30px"><button class="btn pri" data-a="close">Chiudi la sessione</button>'+
       '<button class="btn ghost" style="margin-top:8px" data-a="abort">Annulla</button></div>';
    h+='<div style="height:'+(rest?110:0)+'px"></div></div>';
    h+=restBar();
    return h;
  }

  var n=d.ex.length, cur=(d.cur==null?0:d.cur); if(cur>n+1) cur=n+1; d.cur=cur;
  var wok=d.warm.every(Boolean);
  h+='<div class="fstrip">'+
     '<button class="'+(cur===0?"cur":(wok?"done":""))+'" data-a="fgo" data-k="0">Risc.</button>'+
     d.ex.map(function(e,i){ return '<button class="'+(cur===i+1?"cur":(exFull(d,i)?"done":""))+'" data-a="fgo" data-k="'+(i+1)+'">'+(exFull(d,i)?"✓":(i+1))+'</button>'; }).join("")+
     '<button class="'+(cur===n+1?"cur":"")+'" data-a="fgo" data-k="'+(n+1)+'">Fine</button></div>';

  var pieno=false, avanti="";
  if(cur===0){
    h+=warmCard(d);
    if(p.dischi!=="solo bande") h+='<div class="flag disc"><b>Dischi</b><div>'+esc(p.dischi)+' — cambiali <b>dentro</b> il recupero, non dopo.</div></div>';
    pieno=wok; avanti = n? "Inizia: "+d.ex[0].n : "Riepilogo";
  } else if(cur<=n){
    var e=d.ex[cur-1];
    h+=exCard(e, cur-1, e.def||p.ex[cur-1]);
    pieno=exFull(d, cur-1); avanti = cur<n? "Avanti: "+d.ex[cur].n : "Riepilogo";
  } else {
    h+=pannelloChiusura(d, p);
  }
  if(cur<=n) h+='<div class="fnav"><button class="btn ghost" data-a="fgo" data-k="'+(cur-1)+'"'+(cur===0?' disabled':'')+'>‹ Indietro</button>'+
       '<button class="btn '+(pieno?"pri":"")+'" data-a="fgo" data-k="'+(cur+1)+'"><span>'+esc(avanti)+' ›</span></button></div>';
  h+='<button class="btn sm ghost" style="width:100%;margin-top:10px" data-a="vista">Vedi tutta la seduta</button>';
  h+='<div class="xs mut" style="text-align:center;margin-top:6px">Scorri a destra o a sinistra per cambiare esercizio.</div>';
  h+='<div style="height:'+(rest?120:30)+'px"></div></div>';
  h+=restBar();
  return h;
}
/* recupero: conto alla rovescia, poi conta il tempo oltre il previsto */
function restTxt(){ var left=(rest.end-Date.now())/1000; return left>0 ? mmss(left) : "+"+mmss(-left); }
function restBar(){
  if(!rest) return "";
  var late=!!rest.late, col=late?"var(--alert)":"var(--amb)";
  return '<div style="position:fixed;left:0;right:0;bottom:calc(76px + env(safe-area-inset-bottom));z-index:45">'+
    '<div class="wrap"><div class="card" style="margin:0 0 8px;background:var(--surf2);border-color:'+col+'">'+
    '<div class="between"><div><div class="eyebrow" id="rlab" style="color:'+col+'">'+
      (late?"Oltre il previsto · riparti":(rest.over?"Recupero finito · ":"Recupero ")+esc(rest.lbl))+'</div>'+
    '<div class="rclk" id="rclock" style="color:'+col+'">'+restTxt()+'</div></div>'+
    '<div class="row"><button class="btn sm ghost" data-a="rest+">+30s</button>'+
    '<button class="btn sm" data-a="rest0">Stop</button></div></div></div></div></div>';
}
function exCard(e,i,def){
  var m=meta(e.n), sets=e.sets, target=def.s+" × "+(def.lo===def.hi?def.lo:def.lo+"-"+def.hi)+(m.sec?"s":"");
  var full=sets.length>=def.s;
  var h='<div class="card" style="'+(full?"opacity:.62":"")+(e.extra?";border-color:var(--amb)":"")+'">';
  if(e.extra) h+='<div class="between" style="margin-bottom:6px"><div class="eyebrow amb">Solo per oggi</div>'+
    '<button class="btn sm ghost" data-a="exrm" data-i="'+i+'" style="min-height:30px;padding:0 10px">Togli</button></div>';
  h+='<div class="between"><div style="flex:1"><h2>'+esc(e.n)+'</h2>'+
     '<div class="xs mut" style="margin-top:2px">'+esc(m.g)+' · '+target+(def.u?" · per lato":"")+'</div>'+
     (def.da? '<div class="xs" style="margin-top:2px;color:var(--glow)">Al posto di: '+esc(def.da)+'</div>' : '')+'</div>';
  if(G[e.n]||def.tip||figHas(e.n)) h+='<button class="btn sm ghost" data-a="tip" data-i="'+i+'" aria-label="Come si fa">Come si fa</button>';
  h+='</div>';
  if(figHas(e.n) && !full){
    h+= S.vistaTutte ? '<div class="exfig mini" data-a="tip" data-i="'+i+'">'+figMini(e.n)+'</div>'
                     : '<div class="exfig" data-a="tip" data-i="'+i+'">'+figBox(e.n, {cls:"compatta"})+'</div>';
  }

  var lt=lastTwo(e.n);
  if(lt.length) h+='<div class="xs mut" style="margin-top:7px">'+lt.map(r=>r.date.slice(0,5)+" · "+(r.load?r.load+" kg · ":"")+r.reps.join("/")).join("  |  ")+'</div>';

  var r=readiness(def), pg=progressioni(), scelta=!!(pg.scelta && pg.scelta.n===e.n);
  if(r.ready && !full){
    if(r.cap) h+='<div class="flag info" style="margin-top:9px"><b>Tetto</b><div>'+esc(r.why)+'</div></div>';
    else if(scelta) h+='<div class="flag up" style="margin-top:9px"><b>↑</b><div><b>'+esc(pg.scelta.why)+'</b><br>'+esc(pg.scelta.come)+'</div></div>';
    else if(pg.recupero) h+='<div class="xs mut" style="margin-top:8px">Pronto per salire, ma oggi il recupero è basso: carichi fermi.</div>';
    else h+='<div class="xs mut" style="margin-top:8px">Pronto anche questo, ma resta in coda: una progressione alla volta.</div>';
  }
  if(r.cedimento && !full) h+='<div class="flag info" style="margin-top:9px"><b>RIR</b><div>Top raggiunto a cedimento: per contare deve arrivare a RIR 1-2.</div></div>';
  if(r.hold && !full) h+='<div class="flag info" style="margin-top:9px"><b>In attesa</b><div>'+esc(r.hold)+'</div></div>';
  if(e.rientro && !sets.length) h+='<div class="flag info" style="margin-top:9px"><b>↺</b><div><b>Rientro dopo '+e.rientro.gg+' giorni.</b> '+
    (e.rientro.taglio ? 'Oltre tre settimane: oggi un gradino sotto ('+e.load+' kg). La prossima seduta torni al carico di prima.'
                      : 'Stesso carico di prima: la prima serie fa da prova. Se chiudi a RIR 2 o più, resta qui.')+'</div></div>';
  if(def.swap) h+='<div class="flag disc" style="margin-top:9px"><b>⟳</b><div>'+esc(def.swap)+' mentre fai questo.</div></div>';

  /* carico o banda */
  if(def.b){
    h+='<div class="pills" style="margin-top:10px">'+BANDS.map(b=>'<button class="pill '+(e.band===b?"on":"")+'" data-a="band" data-i="'+i+'" data-v="'+b+'">'+b+'</button>').join("")+'</div>';
  } else if(!m.sec && (def.L || e.load)){
    h+='<div class="row" style="margin-top:10px"><div class="eyebrow" style="width:52px">Carico</div>'+
       '<div class="step" style="flex:1"><button data-a="load-" data-i="'+i+'">−</button>'+
       '<div class="val">'+e.load+'<small>kg</small></div>'+
       '<button data-a="load+" data-i="'+i+'">+</button></div></div>';
  }

  /* serie fatte */
  if(sets.length){
    h+='<div class="sets" style="margin-top:10px">'+sets.map(function(s,j){
      var lab = def.u ? s.S+"·"+s.D : s.v;
      var isTopS = def.u ? (s.S>=def.hi && s.D>=def.hi) : s.v>=def.hi;
      return '<button class="chip '+(isTopS?"top":"done")+'" data-a="undo" data-i="'+i+'" data-j="'+j+'" aria-label="Serie '+(j+1)+', tocca per toglierla">'+lab+
        (s.rir!=null? '<small>r'+(s.rir>=4?"4+":s.rir)+'</small>' : (m.sec? '' : '<small class="vuoto">r?</small>'))+'</button>';
    }).join("")+'</div>';
    if(!m.sec){
      var ls1=sets[sets.length-1], isC=m.t==="comp";
      h+='<div class="rirrow"><span class="eyebrow">Serie '+sets.length+' · quante ne avevi ancora?</span><div class="pills" style="padding:0;margin-top:5px">'+
        [0,1,2,3,4].map(function(v2){ return '<button class="pill '+(ls1.rir===v2?"on":"")+'" data-a="rir" data-i="'+i+'" data-j="'+(sets.length-1)+'" data-v="'+v2+'">'+(v2===0?"0 · cedimento":v2===4?"4+":v2)+'</button>'; }).join("")+'</div>'+
        '<div class="xs mut" style="margin-top:3px">'+(isC? 'Composto: chiudi a 1-2. ' : '')+'Da 4 in su la serie era comoda e conta mezza.</div></div>';
    }
    var iv=intervalli(sets);
    if(iv.length) h+='<div class="xs mut" style="margin-top:6px">Tempo fra le serie: '+iv.map(mmss).join(" · ")+
      ' <span style="color:var(--dim)">(previsto '+mmss(REST[m.t]||60)+' + la serie)</span></div>';
  }

  if(!full || e.more){
    if(def.u){
      h+='<div class="plumb"><div class="lbl"><span class="l">Sinistra</span><span class="r">Destra</span></div>';
      h+='<div class="row" style="gap:8px;margin-top:6px">'+
        '<div class="step" style="flex:1"><button data-a="l-" data-i="'+i+'">−</button><div class="val">'+e.cur.S+'</div><button data-a="l+" data-i="'+i+'">+</button></div>'+
        '<div class="step" style="flex:1"><button data-a="r-" data-i="'+i+'">−</button><div class="val">'+e.cur.D+'</div><button data-a="r+" data-i="'+i+'">+</button></div></div>';
      if(def.asym) h+='<div class="xs mut" style="margin-top:6px">Sinistra 60s · destra 40s. Convessità lombare a sinistra.</div>';
      h+='</div>';
    } else {
      h+='<div class="row" style="margin-top:10px"><div class="eyebrow" style="width:52px">'+(m.sec?"Sec":"Rep")+'</div>'+
        '<div class="step" style="flex:1"><button data-a="v-" data-i="'+i+'">−</button><div class="val">'+e.cur.v+'</div>'+
        '<button data-a="v+" data-i="'+i+'">+</button></div></div>';
    }
    if(m.sec) h+=holdBox(i, Object.assign({n:e.n}, def));
    if(e.dol && dolMax(e.dol)>0) h+='<div class="xs" style="margin-top:8px;color:'+dolColore(dolMax(e.dol))+';font-weight:700">Dolore segnato: '+esc(dolTesto(e.dol))+'</div>';
    h+='<div class="setrow"><button class="btn amb" data-a="set" data-i="'+i+'">Serie '+(sets.length+1)+(full?" (extra)":"")+' fatta</button>'+
       '<button class="btn dolbtn" data-a="doles" data-i="'+i+'" aria-label="Segnala dolore">⚠ Dolore</button></div>';
  }
  if(full){
    h+='<button class="btn sm ghost" style="margin-top:8px" data-a="setmore" data-i="'+i+'">'+
       (e.more?"Basta così":"Registra una serie in più")+'</button>';
    var isComp=m.t==="comp";
    if(isComp && e.rir===0) h+='<div class="flag disc" style="margin-top:8px"><b>RIR</b><div>Cedimento su un composto. La prossima volta fermati quando la ripetizione rallenta: il top di oggi non vale per salire.</div></div>';
    if(def.u && !m.sec) h+='<div style="margin-top:12px"><div class="eyebrow">Lato più duro</div><div class="pills" style="margin-top:6px;padding:0">'+
      [["S","Sinistra"],["U","Uguali"],["D","Destra"]].map(function(x){ return '<button class="pill '+(e.duro===x[0]?"on":"")+'" data-a="duro" data-i="'+i+'" data-v="'+x[0]+'">'+x[1]+'</button>'; }).join("")+'</div></div>';
    h+='<input type="text" placeholder="Nota (sensazioni, tecnica, dolore…)" value="'+esc(e.note)+'" data-note="'+i+'" style="margin-top:9px">';
  }
  return h+'</div>';
}

/* ---------- PROGRESSI ---------- */
/* formattazione italiana indipendente dal dispositivo */
function kfmt(n){ return String(Math.round(n||0)).replace(/\B(?=(\d{3})+(?!\d))/g,"."); }
function dec(n){ return (n===null||n===undefined)?"–":String(n).replace(".",","); }
function stat(l,v,u,c){
  return '<div class="stat"><div class="eyebrow">'+l+'</div><div class="v"'+(c?' style="color:'+c+'"':'')+'>'+
    v+(u?'<small> '+u+'</small>':'')+'</div></div>';
}
function viewProg(){
  var ws=weeks().slice(-8), ks=ws.map(kpi), last=ks[ks.length-1];
  var prev=null; for(var i=ks.length-2;i>=0;i--){ if(ks[i].sdure){ prev=ks[i]; break; } }
  var d = (prev&&prev.sdure) ? Math.round((last.sdure-prev.sdure)/prev.sdure*100) : null;
  var h=topbar("Progressi","Storico dalla settimana 24");
  h+='<div class="wrap">';
  /* stato vuoto: senza nemmeno una sessione non c'e' niente da riassumere,
     e ogni riga sotto darebbe errore. Prima si importa, poi si guarda. */
  if(!ks.length || !last){
    h+='<div class="card" style="border-color:var(--glow)"><div class="eyebrow glow">Ancora niente da mostrare</div>'+
       '<h2 style="margin:5px 0 6px">Nessuna sessione registrata</h2>'+
       '<div class="sm mut">I progressi compaiono da soli dopo il primo allenamento chiuso. '+
       'Se invece questa copia dovrebbe gia\' avere lo storico, ripristina il backup.</div>'+
       '<button class="btn pri" style="margin-top:12px" data-a="imp">Ripristina il backup</button></div>';
    var sl0=weightSlope();
    if(sl0.ok){
      h+='<div class="card"><div class="between"><div class="eyebrow">Spinta \u00b7 peso</div>'+
         '<div class="xs" style="font-weight:700;color:'+(sl0.stato==="dentro"?"var(--ok)":"var(--amb)")+'">'+
         (sl0.g>0?"+":"")+kfmt(sl0.g)+' g/sett</div></div>'+
         '<div style="margin-top:8px">'+pesoChart(sl0)+'</div>'+
         '<div class="xs mut">'+sl0.n+' pesate su '+sl0.days+' giorni</div></div>';
    }
    h+='<div style="height:24px"></div></div>';
    return h;
  }

  /* --- intestazione: la settimana in quattro celle leggibili a colpo d'occhio --- */
  var stk=streak(), slp=weightSlope();
  var cell=function(k,v,u,sub,col){
    return '<div class="cel"><div class="k">'+k+'</div>'+
      '<div class="v"'+(col?' style="color:'+col+'"':'')+'>'+v+(u?'<small>'+u+'</small>':'')+'</div>'+
      (sub?'<div class="s">'+sub+'</div>':'')+'</div>';
  };
  var dg=diagnose();
  h+=progTabs(dg);
  if(PROG_TAB==="sett"){
  h+='<div class="between" style="margin:14px 0 0"><div class="eyebrow glow">Settimana '+last.w+'</div>'+
     '<div class="xs mut">'+(stk.n>0? stk.n+' settimane di fila'+(stk.tenute? ' · '+stk.tenute+' tenute' : '') : 'catena da riavviare')+'</div></div>';
  var stl=statoSettimana(last.w);
  h+='<div class="hero">'+
     cell("Sessioni", last.n+"/"+last.target, last.rest?" +"+last.rest+"R":"", "settimana "+STATO_SETT[stl.stato].t,
          stl.stato==="piena"?"var(--ok)":stl.stato==="tenuta"?"var(--glow)":"var(--amb)")+
     cell("Serie dure", dec(last.sdure), "",
          (d!==null? (d>=0?"\u25b2 +":"\u25bc ")+d+"% vs "+prev.w : "pesi, bande e corpo libero"),
          d!==null? (d>=0?"var(--ok)":"var(--amb)") : null)+
     cell("Top del range", (last.top!==null?last.top:"\u2013"), last.top!==null?"%":"",
          "bersaglio 70%", (last.top!==null&&last.top>=70)?"var(--ok)":null)+
     cell("Spinta", slp.ok?((slp.g>0?"+":"")+kfmt(slp.g)):"\u2013", slp.ok?" g/s":"",
          slp.ok? slp.n+" pesate \u00b7 "+slp.days+"gg" : "dati insufficienti",
          slp.ok?(slp.stato==="dentro"?"var(--ok)":"var(--amb)"):null)+
     '</div>';
  h+='<div class="card" style="padding:12px"><div class="grid3">'+
     '<div><div class="eyebrow">Durata media</div><div class="sm" style="font-weight:700;margin-top:3px;color:'+
       (last.dur>75?"var(--alert)":"inherit")+'">'+(last.dur||"\u2013")+' min</div></div>'+
     '<div><div class="eyebrow">Energia</div><div class="sm" style="font-weight:700;margin-top:3px;color:'+
       ((last.en&&last.en<4)?"var(--amb)":"inherit")+'">'+dec(last.en)+' / 5</div></div>'+
     '<div><div class="eyebrow">Lato più duro</div><div class="sm" style="font-weight:700;margin-top:3px;color:'+
       ((last.duro&&(last.duro.S||last.duro.D))?"var(--amb)":"inherit")+'">'+(duroTxt(last.duro)||"–")+'</div></div>'+
     '</div></div>';

  /* serie dure per gruppo: corpo, barre e dove stai andando; carico per tipo; costanza */
  h+=cardGruppi();
  h+=cardCarico(ks);
  h+=cardCostanza();
  /* sessioni recenti — tocca per correggere data, durata, energia, note o cancellare */
  var recent=S.sess.slice().sort(function(a,b){ return s2d(b.date)-s2d(a.date); }).slice(0,8);
  if(recent.length){
    h+='<div class="between" style="margin:20px 0 6px"><div class="eyebrow">Sessioni recenti</div><div class="xs mut">tocca per correggere</div></div><div class="card">';
    recent.forEach(function(s){
      var rp=isRest(s);
      h+='<button class="item" data-a="esess" data-id="'+esc(s.id)+'"><div class="badge"'+(rp?' style="color:var(--amb);border-color:rgba(224,164,88,.5)"':'')+'>'+s.day+'</div>'+
         '<div class="t"><b>'+s.date+(rp?' · riposo':'')+'</b><span class="xs mut">'+(rp?esc(s.note||"riposo programmato"):(s.min||"–")+' min · energia '+(s.en||"–")+(s.sig?' · segnale':''))+'</span></div>'+
         '<div class="ch">›</div></button>';
    });
    h+='</div>';
  }

  }
  else if(PROG_TAB==="forza"){
  h+=cardForza();
  /* carichi chiave con variazione */
  h+='<div class="card"><div class="eyebrow">Carichi chiave</div><table style="margin-top:8px">'+
     '<tr><th>Esercizio</th><th class="n">Oggi</th><th class="n">Inizio</th><th class="n">Δ</th></tr>';
  [["Floor Press manubri","Floor Press"],["Rematore manubri","Rematore"],["Box Squat","Box Squat"],
   ["Shoulder Press manubri","Shoulder Press"],["Bulgarian Split Squat manubri","Bulgarian"],
   ["Split-stance RDL","Split RDL"]].forEach(function(p){
    var hh=hist(p[0]).filter(function(r){return r.load>0;}); if(!hh.length) return;
    var a=hh[0].load, b=hh[hh.length-1].load, dd=b-a;
    h+='<tr><td>'+esc(p[1])+'</td><td class="n">'+b+' kg</td><td class="n mut">'+a+'</td>'+
       '<td class="n" style="color:'+(dd>0?"var(--ok)":dd<0?"var(--amb)":"var(--dim)")+'">'+(dd>0?"+"+dd:dd||"=")+'</td></tr>';
  });
  h+='</table></div>';

  h+=cardRecord();
  /* andamento settimanale */
  h+='<div class="card"><div class="eyebrow">Andamento</div><table style="margin-top:8px"><tr>'+
     '<th>Sett.</th><th class="n">Sess</th><th class="n">Min</th><th class="n">Energia</th><th class="n">Top</th><th class="n">Lato</th></tr>'+
     ks.slice().reverse().map(function(k){
       var sk=statoSettimana(k.w).stato;
       return '<tr><td style="font-weight:700">'+k.w+'</td>'+
       '<td class="n" style="color:'+STATO_SETT[sk].c+'" title="'+STATO_SETT[sk].t+'">'+k.n+'/'+k.previste+'</td>'+
       '<td class="n" style="color:'+(k.dur>75?"var(--alert)":"inherit")+'">'+(k.dur||"–")+'</td>'+
       '<td class="n" style="color:'+((k.en&&k.en<4)?"var(--amb)":"inherit")+'">'+dec(k.en)+'</td>'+
       '<td class="n">'+(k.top!==null?k.top+"%":"–")+'</td>'+
       '<td class="n" style="color:'+((k.duro&&(k.duro.S||k.duro.D))?"var(--amb)":"inherit")+'">'+duroBreve(k.duro)+'</td></tr>'; }).join("")+
     '</table></div>';

  }
  else if(PROG_TAB==="salute"){
  h+=cardRecuperoGrafico();
  h+=cardDolore();
  h+='<button class="card" data-a="nav" data-v="corpo" style="display:block;width:100%;text-align:left"><div class="eyebrow">Peso, misure, mobilità</div><div class="sm mut" style="margin-top:4px">Sono nella scheda Corpo, con la spinta del peso e il corridoio.</div></button>';
  }
  else if(PROG_TAB==="diag"){
  h+=cardDiagnosi(dg);
  }
  else {
  h+=cardCruscotto();
  }
  h+='<div style="height:24px"></div></div>';
  return h;
}
/* ---------- CORPO ---------- */
function viewCorpo(){
  var h=topbar("Corpo","Misure · benessere · simmetria");
  h+='<div class="wrap">';
  var lastM=ultimoValido(S.mis), gap=lastM?Math.round((new Date().setHours(0,0,0,0)-s2d(lastM.date))/86400000):99;
  h+='<div class="card"><div class="between"><div class="eyebrow">Misure · ogni 14 giorni</div>'+
     '<button class="btn sm '+(gap>=14?"amb":"ghost")+'" data-a="mis">'+(gap>=14?"Da fare":"Aggiungi")+'</button></div>';
  if(lastM){
    h+='<div class="grid3" style="margin-top:10px">'+
      mini("Peso",(lastM.peso||"–")+" kg")+
      mini("Vita/altezza", (lastM.vita&&S.profilo&&S.profilo.altezza)? '<span style="color:'+((lastM.vita/S.profilo.altezza)<0.5?"var(--ok)":"var(--amb)")+'">'+dec((lastM.vita/S.profilo.altezza).toFixed(3))+'</span>' : '<button data-a="profilo" style="color:var(--glow);font-size:13px;padding:0">altezza?</button>')+
      mini("Vita/Torace", lastM.vita&&lastM.torace?(lastM.vita/lastM.torace).toFixed(3):"–")+'</div>';
    h+='<div class="xs mut" style="margin-top:6px">Ultima '+ago(lastM.date)+'. Vita/altezza sotto 0,5 = nessun rischio aggiunto (NICE).</div>';
    h+='<div class="xs mut" style="margin-top:8px">Al mattino a digiuno, dopo il bagno, stesso metro. Torace a fine espirazione normale.</div>';
  }
  h+='</div>';

  /* --- modulo A: la spinta --- */
  var sl=weightSlope();
  h+='<div class="card"><div class="between"><div class="eyebrow">Spinta \u00b7 peso</div>'+
     '<div class="xs mut">target '+PESO_TGT[0]+'\u2013'+PESO_TGT[1]+' g/sett</div></div>';
  if(sl.ok){
    var scol = sl.stato==="dentro"?"var(--ok)":"var(--amb)";
    var sTxt = sl.stato==="dentro"?"nel corridoio" : sl.stato==="sotto"?"sotto il minimo":"sopra il massimo";
    h+='<div class="between" style="margin-top:8px;align-items:flex-end">'+
       '<div class="num" style="font-size:27px;color:'+scol+'">'+(sl.g>0?"+":"")+kfmt(sl.g)+
       '<small style="font-size:12px;font-weight:600;color:var(--mut)"> g/sett</small></div>'+
       '<div class="xs" style="font-weight:700;color:'+scol+';text-align:right">'+sTxt+'</div></div>';
    h+='<div style="margin-top:8px">'+pesoChart(sl)+'</div>';
    h+='<div class="xs mut" style="margin-top:2px">'+sl.n+' pesate su '+sl.days+' giorni'+
       (sl.skipped?' \u00b7 '+sl.skipped+' rientro'+(sl.skipped>1?'i':'')+' escluso':'')+'</div>';
    if(sl.noisy) h+='<div class="flag info" style="margin-top:8px">\u24d8<div>Le pesate pulite non bastavano: qui dentro ci sono anche i rientri da trasferta. La pendenza e\' indicativa, non usarla da sola per cambiare le calorie.</div></div>';
    if(sl.stato==="sotto") h+='<div class="flag disc" style="margin-top:9px">\u26a0<div>Sotto il corridoio. Se hai stalli aperti, la causa e\' probabilmente qui: guarda il cibo prima dei carichi.</div></div>';
    if(sl.stato==="sopra") h+='<div class="flag disc" style="margin-top:9px">\u26a0<div>Sopra il corridoio. Controlla vita/torace alla prossima misura: il surplus puo\' essere troppo aggressivo.</div></div>';
  } else {
    h+='<div class="sm mut" style="margin-top:8px">Pendenza non ancora calcolabile: '+esc(sl.why||"dati insufficienti")+'.</div>'+
       '<div class="xs mut" style="margin-top:5px">Servono '+PESO_MINPT+' pesate valide. Pesati quando sei a casa e salta i giorni di trasferta senza recuperi.</div>';
  }
  h+='</div>';

  var td=today(), b=S.ben.filter(x=>x.date===td)[0];
  h+='<div class="card"><div class="eyebrow">Benessere di oggi</div>'+
     '<div class="grid2" style="margin-top:8px"><button class="btn sm '+(mattinaFatta(b)?"ghost":"amb")+'" data-a="ben" data-m="mattina">'+(mattinaFatta(b)?"✓ ":"")+'Mattino · 1′</button>'+
     '<button class="btn sm '+(seraFatta(b)?"ghost":"")+'" data-a="ben" data-m="sera">'+(seraFatta(b)?"✓ ":"")+'Sera · 30″</button></div>';
  if(b) h+='<div class="sm" style="margin-top:9px">Reflusso '+(b.refl==null?"–":b.refl)+' · camminate '+(b.camm==null?"–":b.camm)+
    ' · HRV '+(b.hrv||"–")+' · readiness '+(b.read||"–")+' · sonno '+(b.sonno||"–")+'h · alcol '+(b.alc?"sì":"no")+'</div>';
  else h+='<div class="xs mut" style="margin-top:8px">Al risveglio i numeri di Zepp, la sera reflusso e stress. Due momenti brevi invece di uno lungo.</div>';
  if(b && b.sede==="Fuori") h+='<div class="xs" style="margin-top:4px;color:var(--amb)">Notte fuori casa'+(b.citta?' · '+esc(b.citta):'')+'</div>';
  var cf=casaFuori();
  h+= cf.ok ? '<div class="xs" style="margin-top:8px">Ultimi 60 giorni · sonno casa <b>'+dec(r1(cf.sc))+' h</b> contro fuori <b>'+dec(r1(cf.sf))+' h</b>'+
              ((cf.hc&&cf.hf)?' · HRV '+Math.round(cf.hc)+' contro '+Math.round(cf.hf):'')+'</div>'
            : '<div class="xs mut" style="margin-top:8px">Casa contro fuori casa: servono 3 notti per parte (ora '+cf.nc+' e '+cf.nf+').</div>';
  h+='<button class="btn sm ghost" style="width:100%;margin-top:10px" data-a="benadd">＋ Aggiungi un giorno saltato</button>';
  h+='</div>';

  /* giorni registrati — tocca per correggere un giorno passato (es. un valore finito sulla data sbagliata) */
  var recentB=S.ben.slice().sort(function(a,b){ return s2d(b.date)-s2d(a.date); }).slice(0,7);
  if(recentB.length){
    h+='<div class="between" style="margin:14px 0 6px"><div class="eyebrow">Giorni registrati</div><div class="xs mut">tocca per correggere</div></div><div class="card">';
    recentB.forEach(function(x){
      var rn=recoveryNote(x.date);
      h+='<button class="item" data-a="ben" data-d="'+esc(x.date)+'"><div class="badge"'+(rn?' style="color:var(--amb);border-color:rgba(224,164,88,.5)"':'')+'>'+x.date.slice(0,5)+'</div>'+
         '<div class="t"><b>HRV '+(x.hrv||"–")+' · read '+(x.read||"–")+'</b><span class="xs mut">sonno '+(x.sonno||"–")+'h · reflusso '+(x.refl==null?"–":x.refl)+' · alcol '+(x.alc?"sì":"no")+'</span></div>'+
         '<div class="ch">›</div></button>';
    });
    h+='</div>';
  }

  /* --- riepilogo settimanale --- */
  var wb=S.ben.filter(function(x){ return x.w===weekOf(today()) && (x.passi||x.ipo); })[0];
  h+='<div class="card"><div class="between"><div class="eyebrow">Riepilogo settimanale</div>'+
     '<button class="btn sm '+(wb?"ghost":"amb")+'" data-a="sett">'+(wb?"Modifica":"Compila")+'</button></div>';
  if(wb) h+='<div class="sm" style="margin-top:9px">Passi '+(wb.passi?kfmt(wb.passi):"\u2013")+'/giorno \u00b7 ipopnea '+
     (wb.ipo==null?"\u2013":dec(wb.ipo))+'/h'+
     ((wb.ipo!==null&&wb.ipo!==undefined&&wb.ipo>5)?' <span style="color:var(--amb);font-weight:700">sopra 5</span>':'')+'</div>';
  else h+='<div class="xs mut" style="margin-top:8px">Due numeri da Zepp, la domenica. Passi medi e indice di ipopnea.</div>';
  h+='</div>';

  /* --- modulo B: mobilita' --- */
  var ml=mobLast(), mdue=mobDue();
  h+='<div class="card"><div class="between"><div class="eyebrow '+(mdue?"amb":"")+'">Mobilit\u00e0 \u00b7 ogni 28 giorni</div>'+
     '<button class="btn sm '+(mdue?"amb":"ghost")+'" data-a="mob">'+(mdue?"Da fare":"Rimisura")+'</button></div>';
  if(ml){
    h+='<table style="margin-top:10px"><tr><th>Test</th><th class="n">Sx</th><th class="n">Dx</th><th class="n">\u0394</th></tr>';
    MOB.forEach(function(t){
      if(t.bi){
        var a=ml[t.k+"_s"], b2=ml[t.k+"_d"], d=mobAsym(ml,t.k);
        h+='<tr><td>'+esc(t.n)+'</td><td class="n">'+(a==null?"\u2013":dec(a))+'</td>'+
           '<td class="n">'+(b2==null?"\u2013":dec(b2))+'</td>'+
           '<td class="n" style="color:'+((d!==null&&Math.abs(d)>=2)?"var(--amb)":"var(--dim)")+'">'+
           (d===null?"\u2013":(d>0?"+":"")+dec(d))+'</td></tr>';
      } else {
        h+='<tr><td>'+esc(t.n)+'</td><td class="n" colspan="3">'+
           (ml[t.k]==null?"\u2013":dec(ml[t.k])+" "+t.u)+'</td></tr>';
      }
    });
    h+='</table><div class="xs mut" style="margin-top:8px">Rilevazione del '+esc(ml.date)+'. '+
       'Un \u0394 oltre 2 unit\u00e0 e\' la cosa da portare al fisioterapista, piu\' del valore assoluto.</div>';
  } else {
    h+='<div class="xs mut" style="margin-top:8px">Quattro test, due valori per lato. '+
       'Accendi questa misura fra qualche settimana, quando peso e stress saranno diventati automatici: due abitudini nuove per volta, non tre.</div>';
  }
  h+='</div>';

  var w=weekOf(today()), due=simDue(), prossima=w<31? 31 : w+((4-((w-31)%4))%4 || (due?0:4));
  h+='<div class="card"><div class="between"><div class="eyebrow '+(due?"amb":"")+'">Check simmetria · ogni 4 settimane'+(due?"":" · prossima: settimana "+prossima)+'</div>'+
     (due?'<button class="btn sm amb" data-a="sim">Compila</button>':"")+'</div>';
  h+='<div class="xs mut" style="margin-top:8px">Quattro domande ogni quattro settimane (dalla 31). Floor Press nel giorno A, Box Squat nel B, RDL nel D, bird-dog nel riscaldamento.</div>';
  var uSim=ultimoValido(S.sim);
  if(uSim) h+='<div class="sm" style="margin-top:9px">Ultimo: '+esc(uSim.date)+'</div>';
  h+='</div>';

  h+='<div style="height:24px"></div></div>';
  return h;
}
function fallbackSheet(){
  sheet('<div class="eyebrow amb">La sessione non è al sicuro</div>'+
    '<div class="sm" style="margin-top:8px">Non è finita né sul foglio né nella memoria del dispositivo. '+
    'Copiala adesso e incollala nel tracker: sono trenta secondi e non la perdi.</div>'+
    '<button class="btn pri" style="margin-top:14px" data-a="tsv">Copia le righe per Sheets</button>'+
    '<button class="btn" style="margin-top:8px" data-a="dlj">Scarica il backup</button>'+
    '<button class="btn ghost" style="margin-top:8px" data-a="x">Chiudi</button>');
}
function storageAlarm(){
  return '<div class="flag stop" style="margin-top:12px"><b>⚠</b><div>'+
    '<b>I dati non si stanno salvando.</b> Quello che inserisci resta solo finché non chiudi. '+
    'Scarica subito il backup e apri la scheda Coach per capire perché.'+
    ' <button data-a="dlj" style="color:inherit;text-decoration:underline;font-weight:700;padding:0">Scarica ora</button></div></div>';
}
function mini(l,v){ return '<div><div class="eyebrow">'+l+'</div><div class="num" style="font-size:17px;margin-top:2px">'+v+'</div></div>'; }

/* Ricarica la pagina saltando la copia in memoria del telefono. Salva prima; i dati stanno nel browser e non si toccano. */
async function aggiornaApp(){
  if(SW_REG){
    toast("Cerco una versione nuova\u2026");
    try{ await SW_REG.update(); }catch(e){ toast("Nessuna rete: riprova quando sei online."); return; }
    setTimeout(function(){ if(SW_REG.waiting) swApplica(); else toast("Hai già l'ultima versione ("+VERSIONE_APP+")"); }, 1500);
    return;
  }
  toast("Aggiorno\u2026");
  try{ await save(); }catch(e){}
  try{
    var base=location.origin+location.pathname;
    await fetch(base,{cache:"reload"});
  }catch(e){ toast("Nessuna rete: riprova quando sei online."); return; }
  location.reload();
}

/* ---------- COACH ---------- */
function cardProposta(compatta){
  var p=propAttiva(); if(!p) return "";
  return '<div class="card" style="border-color:var(--amb)"><div class="eyebrow amb">Proposta del Coach'+(p.data?' \u00b7 '+esc(p.data):'')+'</div>'+
    '<div class="sm" style="margin-top:6px">Pronta dalla review della domenica: guarda cosa cambia e decidi tu.</div>'+
    '<button class="btn pri" style="margin-top:10px" data-a="propvedi">Vedi cosa cambia</button>'+
    (compatta ? '' : '<button class="btn ghost" style="margin-top:8px" data-a="propno">Non applicare</button>')+'</div>';
}
function viewCoach(){
  var h=topbar("Coach","Il ponte verso la chat \u00b7 v"+VERSIONE_APP);
  h+='<div class="wrap">';
  h+=bannerVersione();
  h+=cardProposta(false);
  h+='<div class="card"><div class="eyebrow glow">Come funziona</div>'+
     '<div class="sm" style="margin-top:7px">L\'app decide quello che si decide con una regola: carichi, tetti, doppia progressione, KPI. '+
     'Quello che richiede un giudizio — cambiare esercizio, ridistribuire il volume, leggere un segnale — lo porti in chat con il briefing qui sotto.</div></div>';
  var sy=SYNC.on();
  h+='<div class="card" style="border-color:'+(sy?(SYNC.state==="ok"?"var(--ok)":"var(--amb)"):"var(--glow)")+'">'+
     '<div class="between"><div class="eyebrow '+(sy?"":"glow")+'">Collegamento al foglio</div>'+
     '<div class="xs" style="font-weight:700;color:'+(sy?(SYNC.state==="ok"?"var(--ok)":"var(--amb)"):"var(--glow)")+'">'+
       (sy?(SYNC.state==="ok"?"ATTIVO":"DA VERIFICARE"):"NON CONFIGURATO")+'</div></div>';
  var rotte=conteggiaRotte();
  if(rotte>0){
    h+='<div class="card" style="border-color:var(--alert)"><div class="eyebrow amb">Righe da sistemare</div>'+
       '<div class="sm" style="margin-top:8px"><b>'+rotte+' record salvati nell\'app hanno una data non valida.</b> '+
       'Non compaiono negli elenchi e non entrano nei calcoli, ma verrebbero rispediti al foglio al prossimo invio.</div>'+
       '<div class="xs mut" style="margin-top:6px">Sono i resti del disallineamento delle colonne. Scarica il backup prima, poi rimuovili.</div>'+
       '<button class="btn amb" style="margin-top:11px" data-a="purga">Rimuovi le '+rotte+' righe rotte</button>'+
       '</div>';
  }
  if(sy && SYNC.scartate>0){
    h+='<div class="flag stop" style="margin-top:8px"><b>!</b><div><b>'+SYNC.scartate+
       ' righe del foglio hanno una data illeggibile</b>: l\'app le ha ignorate e ha tenuto quelle buone.'+
       (Object.keys(SYNC.scartatePer).length?
         '<br>Schede: '+Object.keys(SYNC.scartatePer).map(function(k){ return k+" ("+SYNC.scartatePer[k]+")"; }).join(", ")+'.':'')+
       (SYNC.esempioData?'<br>Valore trovato al posto della data: <b>'+esc(SYNC.esempioData)+'</b>':'')+
       (conteggiaRotte()===0?
         '<br><br><b>Cosa fare:</b> premi <b>Invia tutto</b>. Le schede App_ vengono riscritte con i record dell\'app '+
         '(vedi i numeri qui sotto) e le righe rotte spariscono dal foglio. Scarica prima il backup.'
        : '<br><br>Prima rimuovi le righe rotte dall\'app con il pulsante qui sopra, poi premi Invia tutto.')+
       '</div></div>';
  }
  if(sy && SYNC.repaired>0){
    h+='<div class="flag stop" style="margin-top:8px"><b>!</b><div><b>'+SYNC.repaired+' righe nel foglio sono in formato vecchio</b> e le ripetizioni non sono leggibili. '+
       'Cancella la scheda App_Log dal foglio, poi premi Invia tutto: verrà riscritta nel formato corretto.</div></div>';
  }
  if(sy){
    h+='<div class="grid3" style="margin-top:10px">'+
       [["Serie",S.log.length],["Sessioni",S.sess.length],["Misure",S.mis.length],
        ["Benessere",S.ben.length],["Simmetria",(S.sim||[]).length],["Mobilit\u00e0",(S.mob||[]).length]]
       .map(function(x){ return '<div><div class="eyebrow">'+x[0]+'</div>'+
         '<div class="sm" style="font-weight:700;margin-top:2px">'+x[1]+'</div></div>'; }).join("")+
       '</div>'+
       '<div class="xs mut" style="margin-top:6px">Record presenti nell\'app. Confrontali col foglio prima di premere Invia tutto: l\'invio riscrive le schede App_ con questi.</div>';
    h+='<div class="sm mut" style="margin-top:7px">Lo storico vive nel foglio. L\'app lo legge all\'avvio e ci scrive a fine sessione.</div>'+
       (SYNC.last?'<div class="xs mut" style="margin-top:4px">Ultima sincronizzazione: '+SYNC.last.toLocaleTimeString("it")+'</div>':"")+
       '<div class="xs" style="margin-top:6px;color:'+((SYNC.ver||1)>=2?"var(--ok)":"var(--amb)")+'">'+
       ((SYNC.ver||1)>=3? "Script v3: storico, piano e impostazioni sul foglio. Partono solo le modifiche."
        : (SYNC.ver||1)>=2? "Script v2: lo storico è sul foglio, piano e impostazioni solo qui. Lo script v3 (cartella apps-script del progetto) dà all\'app la memoria completa."
        : "Script v1: puoi solo aggiungere. Installa lo script v3 (cartella apps-script del progetto).")+'</div>'+
       ((SYNC.ver||1)>=3 && SYNC.state==="ok"? (function(){ var q=inAttesaV3(); return '<div class="xs mut" style="margin-top:4px">In attesa di invio: '+q.righe+' righe'+(q.cfg?' e '+q.cfg+' gruppi di impostazioni':'')+'.</div>'; })() : '')+
       (SYNC.err?'<div class="flag stop" style="margin-top:8px">•<div>'+esc(SYNC.err)+'</div></div>':"")+
       '<div class="grid2" style="margin-top:10px"><button class="btn sm" data-a="spull">Rileggi dal foglio</button>'+
       '<button class="btn sm" data-a="spush">Invia tutto</button></div>'+
       '<div class="grid2" style="margin-top:8px"><button class="btn sm ghost" data-a="scfg">Modifica</button>'+
       '<button class="btn sm ghost" data-a="sdiag">Diagnostica</button></div>'+
       '<button class="btn sm" style="width:100%;margin-top:8px" data-a="snuovo">Telefono nuovo: copia il codice di collegamento</button>';
  } else {
    h+='<div class="sm" style="margin-top:7px">Senza collegamento i dati dipendono dalla memoria del browser, che qui dentro non è affidabile. Con il collegamento la memoria diventa il foglio.</div>'+
       '<button class="btn pri" style="margin-top:10px" data-a="scfg">Collega il foglio</button>';
  }
  h+='</div>';
  h+='<button class="btn pri" data-a="brief">Copia il briefing per il coach</button>';
  h+='<div class="xs mut" style="margin:8px 0 16px">Facoltativo: Claude legge da solo il foglio, anche le schede App_Piano e App_Stato. Il briefing serve se vuoi incollare un riassunto in chat.</div>';
  h+='<div class="eyebrow" style="margin:4px 0 6px">Aggiornamenti del piano</div>';
  h+='<div class="card"><div class="sm">La proposta della domenica compare da sola in cima a questa pagina e in Oggi. Se non arriva, copia il codice dalla scheda Settimana del documento e tocca qui: vedi l\'anteprima e decidi tu se applicarlo.</div>'+
     (S.propScript===false ? '<div class="xs mut" style="margin-top:6px">Lo script del foglio non passa ancora le proposte: per ora vale il copia e incolla.</div>' : '')+
     '<button class="btn pri" style="margin-top:10px" data-a="pincolla">Incolla e vedi cosa cambia</button>'+
     '<textarea id="patchT" style="margin-top:10px" placeholder=\'oppure incolla qui a mano: {"nota":"…","ops":[…]}\'></textarea>'+
     '<button class="btn amb" style="margin-top:10px" data-a="pprev">Vedi cosa cambia</button>'+
     (SYNC.on() ? '<button class="btn ghost" style="margin-top:8px" data-a="propcheck">Controlla se c\'è una proposta</button>' : '')+'</div>';
  var ps=S.patches||[];
  if(ps.length){
    h+='<div class="card"><div class="between"><div class="eyebrow">Storico modifiche · '+ps.length+'</div>'+
       '<button class="btn sm ghost" data-a="prev">Annulla ultima</button></div>';
    ps.slice().reverse().forEach(function(p){
      h+='<div style="margin-top:11px;padding-top:11px;border-top:1px solid var(--line)">'+
         '<div class="sm" style="font-weight:600">'+esc(p.nota||"senza nota")+'</div>'+
         '<div class="xs mut">'+esc(p.ts)+' · '+(p.ops||[]).length+' modifiche</div></div>';
    });
    h+='</div>';
  }


  /* quando registrare: promemoria nel calendario, suoni */
  h+=cardPromemoria();

  /* congelamento carichi */
  var fz=frozen();
  h+='<div class="eyebrow" style="margin:18px 0 6px">Carichi</div>'+
     '<div class="card" style="border-color:'+(fz?"var(--amb)":"var(--line)")+'">'+
     '<div class="between"><div><div class="eyebrow '+(fz?"amb":"")+'">Congelamento</div>'+
     '<div class="sm" style="margin-top:4px">'+(fz? "Attivo fino alla settimana <b>"+S.freeze.until+"</b>. I suggerimenti di aumento sono sospesi." : "Spento. L\'app propone gli aumenti appena maturano.")+'</div>'+
     (fz&&S.freeze.note?'<div class="xs mut" style="margin-top:4px">'+esc(S.freeze.note)+'</div>':"")+'</div></div>';
  if(fz){
    h+='<button class="btn sm ghost" style="width:100%;margin-top:12px" data-a="unfreeze">Sblocca ora</button>';
  } else {
    h+='<div class="sm mut" style="margin-top:10px">Blocca gli aumenti per una fase di stabilizzazione (deficit, rientro, recupero). I dati continuano a essere registrati; solo i suggerimenti tacciono.</div>'+
       '<div class="grid3" style="margin-top:10px">'+
       '<button class="btn sm" data-a="freeze" data-w="2">+2 sett.</button>'+
       '<button class="btn sm" data-a="freeze" data-w="3">+3 sett.</button>'+
       '<button class="btn sm" data-a="freeze" data-w="4">+4 sett.</button></div>';
  }
  h+='</div>';
  h+='<div class="card"><div class="between"><div><div class="eyebrow">Gradino di carico</div>'+
     '<div class="sm" style="margin-top:4px">'+(S.passo1? "<b>1 kg</b> per manubrio: hai i dischi da 0,5 kg." : "<b>2 kg</b> per manubrio.")+'</div></div></div>'+
     '<div class="xs mut" style="margin-top:6px">Con i dischi da 0,5 kg il salto passa da +14% a +7% su 14 kg. Curl, Hammer, Reverse Fly, Face pull e Overhead extension restano come sono: il loro tetto è per la spalla.</div>'+
     '<button class="btn sm '+(S.passo1?"ghost":"")+'" style="width:100%;margin-top:10px" data-a="passo1">'+(S.passo1?"Torna a 2 kg":"Ho i dischi da 0,5 kg: passa a 1 kg")+'</button></div>';

  h+='<div class="eyebrow" style="margin:18px 0 6px">Dati</div>';
  var bk=backupState();
  h+='<div class="card" style="border-color:'+(bk.due?"var(--alert)":bk.soon?"var(--amb)":"var(--line)")+'">'+
     '<div class="between"><div><div class="eyebrow '+(bk.due?"":"glow")+'">Ultimo backup</div>'+
     '<div class="num" style="font-size:19px;margin-top:2px">'+(bk.never?"mai":bk.days+" giorni fa")+'</div>'+
     '<div class="xs mut" style="margin-top:2px">'+bk.since+' sessioni da allora · promemoria a 30 giorni o 8 sessioni</div></div>'+
     '<div style="font-size:26px;color:'+(bk.due?"var(--alert)":bk.soon?"var(--amb)":"var(--ok)")+'">'+(bk.due?"!":"✓")+'</div></div></div>';
  h+='<div class="grid2"><button class="btn" data-a="tsv">Copia per Sheets</button><button class="btn '+(bk.due?"amb":"")+'" data-a="dlj">Backup .json</button></div>';
  h+='<div class="xs mut" style="margin-top:8px">Il formato per Sheets usa la tabulazione: si incolla in colonne separate in Log_Esercizi. Il backup .json è l\'unica copia che sopravvive a tutto: fallo una volta al mese.</div>';
  h+='<div class="grid2" style="margin-top:10px"><button class="btn ghost" data-a="imp">Ripristina backup</button><button class="btn ghost" data-a="dlt">Scarica .tsv</button></div>';

  var st = Store.ok===false ? ["var(--alert)","non funziona"] : Store.ok===true ? ["var(--ok)","verificato"] : ["var(--mut)","non ancora testato"];
  h+='<div class="card" style="margin-top:18px;border-color:'+(Store.ok===false?"var(--alert)":"var(--line)")+'">'+
     '<div class="between"><div class="eyebrow">Salvataggio</div><div class="xs" style="color:'+st[0]+';font-weight:700">'+st[1].toUpperCase()+'</div></div>'+
     '<table style="margin-top:8px"><tr><td>Dove</td><td class="n">'+
       (Store.mode==="artifact"?"dentro Claude":Store.mode==="device"?"memoria del browser":"NESSUNO")+'</td></tr>'+
     '<tr><td>Ultima scrittura</td><td class="n">'+(Store.last?Store.last.toLocaleTimeString("it"):"—")+'</td></tr>'+
     '<tr><td>Dimensione</td><td class="n">'+(Store.bytes?Math.round(Store.bytes/1024)+" KB":"—")+'</td></tr>'+
     '<tr><td>Contenuto</td><td class="n">'+S.sess.length+' sess · '+S.log.length+' log · '+S.mis.length+' mis</td></tr>'+
     (S.savedAt?'<tr><td>Dati scritti il</td><td class="n">'+esc(new Date(S.savedAt).toLocaleString("it"))+'</td></tr>':"")+
     (Store.err?'<tr><td>Errore</td><td class="n" style="color:var(--alert)">'+esc(Store.err)+'</td></tr>':"")+
     '</table>'+
     (Store.fallback?'<div class="flag disc" style="margin-top:10px"><b>!</b><div>Lo storage di Claude non ha risposto: sto usando la memoria del browser, che qui dentro può non sopravvivere alla chiusura. Scarica il backup a fine sessione.</div></div>':"")+
     '<button class="btn sm ghost" style="width:100%;margin-top:10px" data-a="stest">Verifica ora scrittura e rilettura</button></div>';
  h+='<div class="card"><div class="between"><div class="eyebrow">Versione dell\'app</div><div class="xs" style="font-weight:700">v'+VERSIONE_APP+'</div></div>'+
     '<div class="sm mut" style="margin-top:7px">L\'app funziona anche senza rete. Quando pubblichi una modifica, la versione nuova si scarica da sola e compare l\'avviso in Oggi; qui puoi cercarla subito. I dati restano dove sono.</div>'+
     '<button class="btn sm ghost" style="width:100%;margin-top:10px" data-a="aggiorna">Aggiorna app</button></div>';
  h+='<div style="height:30px"></div></div>';
  return h;
}

/* ---------- nav ---------- */
function nav(){
  /* Icone disegnate a mano invece di glifi Unicode: peso del tratto uniforme,
     stessa dimensione ottica, e soprattutto rendono uguali su ogni telefono.
     I glifi precedenti (una coppia di semicerchi, un lampo) dipendevano dal
     font di sistema e su alcuni Android uscivano come rettangoli vuoti. */
  var ICO={
    /* piastra da carico: il disco con il foro al centro */
    oggi:'<circle cx="12" cy="12" r="8.2"/><circle cx="12" cy="12" r="2.4"/>',
    /* una figura in movimento: come si fanno gli esercizi */
    es:'<circle cx="12.5" cy="4.6" r="2.1"/><path d="M12 7.6l-1.2 6.4M11.3 9.4l-4.3 2.4M11.3 9.4l4.6 1.6M10.8 14l-3.1 5.8M10.8 14l4.3 2.2 .4 4"/>',
    /* andamento nel tempo */
    prog:'<path d="M3.5 19.5V4.5"/><path d="M3.5 19.5h17"/><path d="M6.5 16l4-4.5 3.2 2.6L20 7.5"/>',
    /* il rachide: linea a S con le vertebre. E' il soggetto dell'app */
    corpo:'<path d="M12 3.5c-2.6 2.2-2.6 4.6 0 7s2.6 4.8 0 10"/><path d="M9.6 5.6h4.8M9.2 9h5.6M9.6 12.4h4.8M10 15.8h4.4M10.6 19.2h3.2"/>',
    /* scambio con il coach */
    coach:'<path d="M20 13.2c0 2.2-1.9 4-4.3 4H9.3L4 20.5l1.3-3.7C4.5 16 4 14.7 4 13.2 4 11 5.9 9.2 8.3 9.2h7.4c2.4 0 4.3 1.8 4.3 4z"/><path d="M8.4 4.2h7.2"/>'
  };
  var items=[["oggi","Oggi"],["es","Esercizi"],["prog","Progressi"],["corpo","Corpo"],["coach","Coach"]];
  var daFare = (typeof agendaConta==="function") ? agendaConta() : 0;
  document.getElementById("nav").innerHTML = items.map(function(i){
    var badge = ((i[0]==="coach" && backupState().due) || (i[0]==="oggi" && daFare>0 && V!=="oggi")) ? '<span class="badge"></span>' : "";
    return '<button data-a="nav" data-v="'+i[0]+'" class="'+(V===i[0]?"on":"")+'"'+
      ' aria-label="'+i[1]+'" aria-current="'+(V===i[0]?"page":"false")+'">'+
      '<svg viewBox="0 0 24 24" aria-hidden="true">'+ICO[i[0]]+'</svg>'+badge+
      '<span class="lb">'+i[1]+'</span></button>';
  }).join("");
}

function render(){
  _PGC=null; if(typeof kpiCacheReset==="function") kpiCacheReset();
  if(!PLAN) PLAN=buildPlan();
  app.innerHTML = V==="oggi"?viewOggi() : V==="es"?viewEsercizi() : V==="prog"?viewProg() : V==="corpo"?viewCorpo() : viewCoach();
  nav();
  Fig.mount();
  aggiornaBadge();
  window.scrollTo(0, window._sy||0);
}

/* barre impilate: pesi (kg esatti) · bande e corpo libero (stime, con la tilde) */
function cardCarico(ks){
  var maxT=Math.max.apply(null,ks.map(function(k){ return k.ton||0; }))||1, l=ks[ks.length-1];
  var h='<div class="card"><div class="between"><div class="eyebrow">Carico sollevato \u00b7 ultime '+ks.length+' settimane</div>'+
    '<div class="xs" style="font-weight:700">'+kfmt(l.ton)+' kg'+((l.ton_bande||l.ton_corpo)?' <span class="mut">~</span>':'')+'</div></div>';
  h+='<div class="bars stack" style="margin-top:14px">'+ks.map(function(k,i){
    var t=k.ton||0, hp=t? (k.ton_pesi/maxT*100) : 0, hb=t? (k.ton_bande/maxT*100) : 0, hc=t? (k.ton_corpo/maxT*100) : 0;
    return '<div class="sb'+(i===ks.length-1?" cur":"")+'" title="'+kfmt(t)+' kg">'+
      '<i class="c" style="height:'+hc.toFixed(1)+'%"></i><i class="b" style="height:'+hb.toFixed(1)+'%"></i><i class="p" style="height:'+hp.toFixed(1)+'%"></i></div>'; }).join("")+'</div>';
  h+='<div class="barlab">'+ks.map(function(k,i){ return '<span class="'+(i===ks.length-1?"cur":"")+'">'+k.w+'</span>'; }).join("")+'</div>';
  h+='<div class="mmleg" style="margin-top:8px"><span><i style="background:var(--glow)"></i>pesi</span><span><i style="background:var(--amb)"></i>bande ~</span><span><i style="background:var(--ok)"></i>corpo libero ~</span></div>'+
     '<div class="xs mut" style="margin-top:8px">Questa settimana: pesi '+kfmt(l.ton_pesi)+' kg'+(l.ton_bande? ' · bande ~'+kfmt(l.ton_bande)+' kg':'')+(l.ton_corpo? ' · corpo libero ~'+kfmt(l.ton_corpo)+' kg':'')+
     '. Con ~ le stime: le bande dal loro valore nominale, il corpo libero come quota del tuo peso (push-up circa 70%). Per confrontare le settimane guarda le <b>serie dure</b>, che non dipendono dall\'attrezzo.</div></div>';
  return h;
}
