/* ============================================================
   PIANIFICATORE — la settimana, decisa e adattabile
   La domenica sera il coach scrive un piano di massima (operazione
   «settimana»): quali sedute, in quali giorni, dove. Durante la
   settimana puoi adattarlo: l'app guarda cosa hai gia' fatto e i
   giorni che restano, ridistribuisce le sedute che mancano e mostra
   il bilancio delle serie per gruppo, con un suggerimento dove c'e'
   un buco. Le sedute si possono mettere nel calendario (.ics).
   ============================================================ */
var GG_NOME={lun:"Lun",mar:"Mar",mer:"Mer",gio:"Gio",ven:"Ven",sab:"Sab",dom:"Dom"};
/* esercizio di riempimento per gruppo e luogo, quando un gruppo resta sotto il minimo */
var FILL={
  Petto:{casa:"Floor Press manubri", bande:"Push-up piedi rialzati con banda", corpo:"Push-up"},
  Dorso:{casa:"Rematore manubri", bande:"Band row seduto", corpo:"Rematore al telaio della porta"},
  Spalle:{casa:"Alzate laterali", bande:"Alzate laterali con banda", corpo:"Y-T-W a busto inclinato"},
  Bicipiti:{casa:"Curl bicipiti manubri", bande:"Band curl bicipiti", corpo:"Curl isometrico asciugamano"},
  Tricipiti:{casa:"French Press", bande:"Band tricep extension", corpo:"Push-up stretti"},
  Gambe:{casa:"Box Squat", bande:"Hip hinge una gamba", corpo:"Affondi indietro"},
  Core:{casa:"Side plank", bande:"Dead bug", corpo:"Dead bug"}
};
var PRIORITA=["A","B","D","C","E1","E2"];   /* se i giorni non bastano, restano prima i composti */

/* ---------- date della settimana ---------- */
function dateSettimana(w){
  var m=s2d(settimanaDate(w).dal), out=[];
  for(var i=0;i<7;i++){ var d=new Date(m.getTime()); d.setDate(d.getDate()+i); out.push(d2s(d)); }
  return out;
}
function ggDi(data){ return GG[(s2d(data).getDay()+6)%7]; }
function dataDaGG(w, gg){ var i=GG.indexOf(String(gg||"").toLowerCase().slice(0,3)); return i<0? null : dateSettimana(w)[i]; }
function giorniFa(data){ return Math.round((s2d(today())-s2d(data))/86400000); }

/* ---------- piano e disponibilita' ---------- */
function pianoSett(w){ return (S.pianoSett||{})[w]||null; }
function sedutaFatta(w, d){ return S.sess.some(function(s){ return s.w===w && s.day===d && !isRest(s); }); }
function sedutaCoperta(w, d){ return S.sess.some(function(s){ return s.w===w && s.day===d; }); }
/* le sedute del piano con il loro stato: fatta, riposo, oggi, futura, saltata */
function seduteDelPiano(w){
  var p=pianoSett(w); if(!p) return [];
  var oggi=today();
  return (p.sedute||[]).map(function(e){
    var st;
    if(sedutaFatta(w, e.d)) st="fatta";
    else if(sedutaCoperta(w, e.d)) st="riposo";
    else { var df=giorniFa(e.data); st = df>0 ? "saltata" : df===0 ? "oggi" : "futura"; }
    return Object.assign({stato:st}, e);
  });
}
function pianoDelGiorno(data){
  var e=seduteDelPiano(weekOf(data)).filter(function(x){ return x.data===data && (x.stato==="oggi"||x.stato==="futura"||x.stato==="saltata"); })[0];
  return e||null;
}
function saltate(w){ return seduteDelPiano(w).filter(function(e){ return e.stato==="saltata"; }); }
/* disponibilita' di un giorno: casa, fuori, no. Parte da quanto scritto nella chiusura della settimana prima. */
function dispoGiorno(w, data){
  var v=((S.dispo||{})[w]||{})[data]; if(v) return v;
  var ch=(S.chiusure||{})[w-1]||{}, gg=ggDi(data);
  if((ch.occupati||[]).indexOf(gg)>=0) return "no";
  if((ch.fuori||[]).indexOf(gg)>=0) return "fuori";
  var b=benOn(data); if(b && b.sede==="Fuori") return "fuori";
  return "casa";
}

/* ---------- proposta: ridistribuisce le sedute che mancano sui giorni che restano ---------- */
function oraProposta(data){
  var o=orari().mattina;
  if(data!==today()) return o;
  var now=new Date(), h=now.getHours()+(now.getMinutes()>30?2:1);
  h=Math.max(h, Math.floor(hm(o)/60));
  return h>=22? "21:00" : String(h).padStart(2,"0")+":00";
}
function propostaPiano(w, dispo){
  var oggi=today(), dates=dateSettimana(w).filter(function(d){
    if(giorniFa(d)>0) return false;
    if(giorniFa(d)===0 && S.sess.some(function(s){ return s.date===d && !isRest(s); })) return false;   /* oggi hai gia' fatto la seduta */
    return (dispo? dispo[d] : dispoGiorno(w,d))!=="no";
  });
  var mancano=giorniSettimana(w).filter(function(d){ return !sedutaCoperta(w,d); });
  var k=mancano.length, out={sedute:[], eccesso:0, dates:dates, mancano:mancano};
  if(!k) return out;
  if(!dates.length){ out.eccesso=k; return out; }
  var tieni=mancano.slice();
  if(dates.length<k){
    tieni=mancano.slice().sort(function(a,b){ return PRIORITA.indexOf(a)-PRIORITA.indexOf(b); }).slice(0, dates.length)
      .sort(function(a,b){ return mancano.indexOf(a)-mancano.indexOf(b); });
    out.eccesso=k-dates.length;
  }
  var n=tieni.length;
  tieni.forEach(function(d,i){
    var idx = n===1 ? 0 : Math.round(i*(dates.length-1)/(n-1)), data=dates[idx], dv=(dispo? dispo[data] : dispoGiorno(w,data));
    out.sedute.push({data:data, d:d, l: dv==="fuori"? "bande" : "casa", ora:oraProposta(data)});
  });
  return out;
}

/* ---------- bilancio: cosa avrai fatto a fine settimana ---------- */
function serieProgrammate(d, l){
  var grp={};
  eserciziPer(d, l).forEach(function(x){
    var g=meta(x.n).g, n=x.s||3;
    grp[g]=(grp[g]||0)+n;
    (IND[x.n]||[]).forEach(function(g2){ grp[g2]=(grp[g2]||0)+n*0.5; });
  });
  return grp;
}
function bilancio(w, sedute){
  var fatte=kpi(w).grp, prev={}, out={}, buchi=[];
  (sedute||[]).forEach(function(e){
    if(sedutaCoperta(w, e.d)) return;
    var g=serieProgrammate(e.d, e.l); Object.keys(g).forEach(function(k){ prev[k]=(prev[k]||0)+g[k]; });
  });
  Object.keys(TGT).forEach(function(g){
    var f=fatte[g]||0, p=prev[g]||0, t=f+p, r=TGT[g], st = t<r[0]? "sotto" : t>r[1]? "sopra" : "ok";
    out[g]={fatte:f, prev:p, tot:t, min:r[0], max:r[1], stato:st};
    if(st==="sotto") buchi.push(g);
  });
  return {gruppi:out, buchi:buchi};
}
/* dove c'e' un buco: un esercizio nel luogo dell'ultima seduta rimasta */
function suggerisci(bil, sedute){
  var resta=(sedute||[]).filter(function(e){ return !sedutaCoperta(bil.w||weekOf(today()), e.d); });
  var ultima=resta[resta.length-1], out=[];
  bil.buchi.forEach(function(g){
    var r=bil.gruppi[g], manca=Math.ceil(r.min-r.tot);
    if(!ultima){ out.push({g:g, n:manca, ex:null, testo:g+": mancano "+manca+" serie e non restano sedute. Se vuoi recuperarle serve un giorno in più."}); return; }
    var ex=(FILL[g]||{})[ultima.l]; if(!ex) return;
    out.push({g:g, n:Math.min(4,manca), ex:ex, d:ultima.d, l:ultima.l, data:ultima.data,
      testo:g+": mancano "+manca+" serie → aggiungi "+Math.min(4,manca)+" serie di "+ex+" nel giorno "+ultima.d+" ("+ggDi(ultima.data)+")."});
  });
  return out;
}
/* allarme sulla forza: i carichi pesanti non si toccano da troppo */
function giorniSenzaPesi(){
  var ult=S.sess.filter(function(s){ return !isRest(s) && s.mod==="Pesi"; }).sort(function(a,b){ return s2d(b.date)-s2d(a.date); })[0];
  return ult? giorniFa(ult.date) : null;
}

/* ---------- calendario: le sedute della settimana ---------- */
function icsSedute(w, sedute){
  var url=(location.origin+location.pathname).replace(/index\.html$/,""), ev=[], t=Date.now();
  (sedute||[]).forEach(function(e){
    if(sedutaCoperta(w, e.d) || !PLAN[e.d]) return;
    var p=PLAN[e.d], lista=eserciziPer(e.d, e.l), dt=s2d(e.data), ora=e.ora||orari().mattina;
    var luogo={casa:"a casa",bande:"con le bande",corpo:"a corpo libero"}[e.l]||"";
    var titolo="Rachide · "+e.d+" "+p.name+" ("+luogo+")";
    var desc=lista.map(function(x){ return x.s+"×"+(x.lo===x.hi?x.hi:x.lo+"-"+x.hi)+" "+x.n; }).join("\n");
    ev.push(["BEGIN:VEVENT","UID:rachide-sett"+w+"-"+e.d+"@rachide","DTSTAMP:"+icsData(new Date(),"00:00"),"SEQUENCE:"+Math.floor(t/60000),
      "DTSTART:"+icsData(dt, ora),"DURATION:PT"+(p.min||60)+"M","SUMMARY:"+icsTesto(titolo),
      "DESCRIPTION:"+icsTesto("Riscaldamento 6 minuti, poi:\n"+desc+"\n"+url),"URL:"+url,
      "BEGIN:VALARM","ACTION:DISPLAY","DESCRIPTION:"+icsTesto(titolo),"TRIGGER:-PT30M","END:VALARM","END:VEVENT"].join("\r\n"));
  });
  return ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Rachide//Settimana//IT","CALSCALE:GREGORIAN","METHOD:PUBLISH","X-WR-CALNAME:Rachide · sedute"]
    .concat(ev).concat(["END:VCALENDAR"]).join("\r\n")+"\r\n";
}

/* ---------- operazione del coach: {"op":"settimana","w":41,"nota":"…","sedute":[{"g":"lun","d":"A","l":"casa","ora":"07:30"}]} ---------- */
function pianoDaOp(op){
  var w=+op.w; if(!w) return {err:"manca la settimana (w)"};
  var sed=[], err=[];
  (op.sedute||[]).forEach(function(e,i){
    var data=e.data && dataOk(e.data)? e.data : dataDaGG(w, e.g);
    if(!data){ err.push("seduta "+(i+1)+": giorno non valido"); return; }
    if(weekOf(data)!==w){ err.push("seduta "+(i+1)+": la data non cade nella settimana "+w); return; }
    if(!PLAN[e.d]){ err.push("seduta "+(i+1)+": il giorno di piano «"+e.d+"» non esiste"); return; }
    var l=["casa","bande","corpo"].indexOf(e.l)>=0 ? e.l : (PLAN[e.d].sede==="Casa"? "casa":"bande");
    sed.push({data:data, d:e.d, l:l, ora:/^\d{1,2}:\d{2}$/.test(e.ora||"")? e.ora : orari().mattina});
  });
  return {w:w, sedute:sed, nota:op.nota||"", err:err};
}
function pianoApplica(op){
  var p=pianoDaOp(op); if(p.err && !p.sedute) return false;
  S.pianoSett=S.pianoSett||{};
  S.pianoSett[p.w]={ts:Date.now(), da:"coach", nota:p.nota, sedute:p.sedute};
  cfgTocca("settimane");
  return true;
}
function pianoTesto(w, sedute){
  return (sedute||[]).map(function(e){ return ggDi(e.data)+" "+e.data.slice(0,5)+" "+e.d+" "+e.l+(e.ora?" "+e.ora:""); }).join(" · ");
}

/* ---------- la settimana in sette caselle ---------- */
function cardSettimanaRail(w, sedute){
  var date=dateSettimana(w), oggi=today(), h='<div class="rail7">';
  date.forEach(function(data, i){
    var s=S.sess.filter(function(x){ return x.date===data; })[0], pe=sedute.filter(function(e){ return e.data===data; })[0], dv=dispoGiorno(w, data);
    var cl="r7"+(data===oggi?" oggi":""), top, bot="";
    if(s && isRest(s)){ cl+=" riposo"; top="R"; bot="riposo"; }
    else if(s){ cl+=" fatta"; top=s.day; bot=(s.mod==="Pesi"?"✓":(s.mod==="Corpo libero"?"✓ corpo":(s.mod==="Bande"?"✓ bande":"✓"))); }
    else if(pe){ cl+=" prev"+(pe.stato==="saltata"?" salt":""); top=pe.d; bot={casa:"casa",bande:"bande",corpo:"corpo"}[pe.l]; }
    else if(dv==="no"){ cl+=" no"; top="–"; bot="no"; }
    else if(dv==="fuori"){ cl+=" fuori"; top="·"; bot="fuori"; }
    else { top="·"; bot=""; }
    h+='<button class="'+cl+'" data-a="pdispo1" data-date="'+data+'" aria-label="'+GG_NOME[GG[i]]+' '+data.slice(0,5)+'"><span class="g">'+GG_NOME[GG[i]]+'</span><span class="n">'+(+data.slice(0,2))+'</span><b>'+esc(top)+'</b><span class="b">'+esc(bot)+'</span></button>';
  });
  return h+'</div>';
}

/* ---------- l'adattamento in settimana ---------- */
var PS=null;
function pianoApri(){
  var w=weekOf(today()), esist=seduteDelPiano(w), dispo={};
  dateSettimana(w).forEach(function(d){ dispo[d]=dispoGiorno(w,d); });
  PS={w:w, dispo:dispo, sedute:[], eccesso:0};
  var prop=propostaPiano(w, dispo);
  var restano=esist.filter(function(e){ return e.stato==="oggi"||e.stato==="futura"; });
  /* se c'e' gia' un piano e non e' saltato niente, si parte da quello; altrimenti dalla proposta */
  var conflitto=restano.some(function(e){ return dispo[e.data]==="no"; });
  if(restano.length && !saltate(w).length && !conflitto){
    PS.sedute=restano.map(function(e){ return {data:e.data,d:e.d,l:(dispo[e.data]==="fuori" && e.l==="casa")? "bande" : e.l,ora:e.ora}; });
    PS.eccesso=Math.max(0, prop.mancano.length-PS.sedute.length); }
  else { PS.sedute=prop.sedute; PS.eccesso=prop.eccesso; }
  pianoSheet();
}
function pianoRicalcola(){
  var p=propostaPiano(PS.w, PS.dispo); PS.sedute=p.sedute; PS.eccesso=p.eccesso; pianoSheet();
}
function pianoSheet(){
  var w=PS.w, date=dateSettimana(w), disp=date.filter(function(d){ return giorniFa(d)<=0; });
  var fatteN=S.sess.filter(function(s){ return s.w===w && !isRest(s); }).length, tg=bersaglio(w, S.sess.filter(function(s){ return s.w===w && isRest(s); }).length);
  var h='<div class="eyebrow amb">Adatta la settimana '+w+'</div><h2 style="margin:4px 0 4px;font-size:19px">Cosa resta da fare</h2>'+
    '<div class="sm mut">Hai fatto '+fatteN+(fatteN===1?' seduta':' sedute')+' su '+tg+'. Segna come sono i giorni che restano: l\'app rimette le sedute che mancano al posto giusto.</div>';
  h+='<div class="eyebrow" style="margin:14px 0 6px">I giorni che restano · tocca per cambiare</div><div class="rail7 edit">';
  disp.forEach(function(data){
    var dv=PS.dispo[data], i=date.indexOf(data), lab={casa:"libero",fuori:"fuori casa",no:"occupato"}[dv];
    h+='<button class="r7 d-'+dv+(data===today()?" oggi":"")+'" data-a="pdispo" data-date="'+data+'"><span class="g">'+GG_NOME[GG[i]]+'</span><span class="n">'+(+data.slice(0,2))+'</span><span class="b">'+lab+'</span></button>';
  });
  h+='</div>';
  if(PS.eccesso>0) h+='<div class="flag disc" style="margin-top:10px">⚠<div><b>Mancano '+PS.eccesso+' giorni per tutte le sedute.</b> Restano i composti. Puoi passare alla settimana di picco (2 sedute essenziali) oppure liberare un giorno.</div></div>';
  h+='<div class="eyebrow" style="margin:14px 0 6px">Sedute da fare</div>';
  if(!PS.sedute.length) h+='<div class="card flat" style="text-align:center;padding:14px"><div class="sm mut">Niente da pianificare.</div></div>';
  PS.sedute.forEach(function(e,i){
    var p=PLAN[e.d];
    h+='<div class="psr"><div class="between"><div><div class="sm" style="font-weight:700">'+e.d+' · '+esc(p.name)+'</div><div class="xs mut">'+p.ex.length+' esercizi · '+p.min+' min</div></div>'+
      '<select class="psd" data-ps="'+i+'" aria-label="Giorno">'+disp.filter(function(d){ return PS.dispo[d]!=="no" || d===e.data; }).map(function(d){ return '<option value="'+d+'"'+(d===e.data?" selected":"")+'>'+GG_NOME[ggDi(d)]+' '+d.slice(0,5)+'</option>'; }).join("")+'</select></div>'+
      '<div class="seg" style="margin-top:8px">'+LUOGHI.map(function(l){ return '<button class="'+(e.l===l[0]?"on":"")+'" data-a="psl" data-i="'+i+'" data-v="'+l[0]+'"><b>'+l[1]+'</b></button>'; }).join("")+'</div></div>';
  });
  var bil=bilancio(w, PS.sedute); bil.w=w;
  h+='<div class="eyebrow" style="margin:16px 0 6px">Bilancio a fine settimana · serie per gruppo</div><div class="card" style="padding:10px 12px">'+
    Object.keys(bil.gruppi).map(function(g){ var r=bil.gruppi[g], max=Math.max(r.max*1.15, r.tot, 1), col=r.stato==="ok"?"var(--ok)":r.stato==="sotto"?"var(--alert)":"var(--amb)";
      return '<div class="gr"><div class="nm">'+g+'</div><div class="tr"><div class="zn" style="left:'+r1(r.min/max*100)+'%;width:'+r1((r.max-r.min)/max*100)+'%"></div>'+
        '<div class="fl" style="width:'+r1(Math.min(100,r.fatte/max*100))+'%;background:'+col+'"></div>'+
        '<div class="fl pv" style="left:'+r1(Math.min(100,r.fatte/max*100))+'%;width:'+r1(Math.min(100-r.fatte/max*100, r.prev/max*100))+'%;background:'+col+'"></div></div>'+
        '<div class="vl" style="color:'+col+'">'+dec(r.tot)+' <span>/'+r.min+'–'+r.max+'</span></div></div>'; }).join("")+
    '<div class="xs mut" style="margin-top:8px">Pieno = già fatto · chiaro = previsto. Fascia verde = 10-20 serie (core 6-12), serie dure, indirette a metà.</div></div>';
  var sug=suggerisci(bil, PS.sedute);
  sug.forEach(function(x){ h+='<div class="flag info" style="margin-top:8px"><b>+</b><div>'+esc(x.testo)+'</div></div>'; });
  var gs=giorniSenzaPesi();
  if(gs!=null && gs>=10 && PS.sedute.length && PS.sedute.every(function(e){ return e.l!=="casa"; }))
    h+='<div class="flag disc" style="margin-top:8px">⚠<div>Sono '+gs+' giorni senza carichi pesanti e nessuna seduta con i pesi in programma. Per la forza massima servono: se puoi, tieni almeno una seduta a casa.</div></div>';
  h+='<button class="btn" style="margin-top:12px" data-a="pricalcola">Ricalcola da capo</button>'+
    '<button class="btn pri" style="margin-top:8px" data-a="psave">Salva il piano</button>'+
    '<button class="btn" style="margin-top:8px" data-a="pics">Salva e metti a calendario</button>'+
    '<button class="btn ghost" style="margin-top:8px" data-a="x">Chiudi</button>';
  sheet(h);
}
function pianoSalva(){
  if(!PS) return;
  S.dispo=S.dispo||{}; S.dispo[PS.w]=Object.assign({}, PS.dispo);
  var gia=seduteDelPiano(PS.w).filter(function(e){ return e.stato==="fatta"||e.stato==="riposo"; }).map(function(e){ return {data:e.data,d:e.d,l:e.l,ora:e.ora}; });
  S.pianoSett=S.pianoSett||{};
  S.pianoSett[PS.w]={ts:Date.now(), da:"app", nota:"", sedute:gia.concat(PS.sedute)};
  cfgTocca("settimane");
  var ok=save(); if(SYNC.on()) doPush(false);
  return ok;
}

/* ---------- per il coach: piano, disponibilita', bilancio, formato ---------- */
function briefingPiano(){
  var w=weekOf(today()), L=[], sed=seduteDelPiano(w), ch=(S.chiusure||{})[w]||{};
  L.push("PIANO DELLA SETTIMANA "+w);
  if(sed.length) L.push("- piano"+(pianoSett(w).da==="coach"?" del coach":" dell'app")+": "+sed.map(function(e){ return ggDi(e.data)+" "+e.data.slice(0,5)+" "+e.d+" "+e.l+" ["+e.stato+"]"; }).join(" · "));
  else L.push("- nessun piano salvato per questa settimana");
  var mancano=giorniSettimana(w).filter(function(d){ return !sedutaCoperta(w,d); });
  L.push("- sedute ancora da fare: "+(mancano.join(", ")||"nessuna")+" · giorni che restano: "+dateSettimana(w).filter(function(d){ return giorniFa(d)<=0 && dispoGiorno(w,d)!=="no"; }).map(function(d){ return ggDi(d)+(dispoGiorno(w,d)==="fuori"?"(fuori)":""); }).join(" "));
  var prop=propostaPiano(w), bil=bilancio(w, sed.filter(function(e){ return e.stato==="oggi"||e.stato==="futura"; }).length? sed : prop.sedute); bil.w=w;
  L.push("- bilancio serie dure a fine settimana: "+Object.keys(bil.gruppi).map(function(g){ var r=bil.gruppi[g]; return g+" "+dec(r.tot)+(r.stato==="sotto"?" (sotto)":r.stato==="sopra"?" (sopra)":""); }).join(" · "));
  var sug=suggerisci(bil, sed.length? sed : prop.sedute); sug.forEach(function(x){ L.push("- buco: "+x.testo); });
  var gs=giorniSenzaPesi(); if(gs!=null) L.push("- giorni dall'ultima seduta con i pesi: "+gs);
  L.push("DISPONIBILITA' SETTIMANA "+(w+1)+" (dalla chiusura): fuori casa "+((ch.fuori||[]).join(" ")||"nessun giorno")+" · senza tempo "+((ch.occupati||[]).join(" ")||"nessun giorno")+" · giorni scelti per le sedute "+((ch.giorni||[]).join(" ")||"non scelti")+(ch.mom?" · "+ch.mom:""));
  L.push("Formato del piano (da incollare in Coach): {\"nota\":\"…\",\"ops\":[{\"op\":\"settimana\",\"w\":"+(w+1)+",\"nota\":\"…\",\"sedute\":[{\"g\":\"lun\",\"d\":\"A\",\"l\":\"casa\",\"ora\":\"07:30\"}]}]} · g: lun..dom · d: A B C D (E1 E2 in settimana di picco) · l: casa, bande, corpo");
  return L.join("\n");
}
function pianoRigheStato(w){
  var ch=(S.chiusure||{})[w+1]||{}, sed=seduteDelPiano(w);
  return {piano_prog: sed.map(function(e){ return ggDi(e.data)+" "+e.d+" "+e.l+" "+e.stato; }).join(" · "),
    fuori:(ch.fuori||[]).join(" "), occupati:(ch.occupati||[]).join(" ")};
}
