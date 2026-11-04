/* ============================================================
   PIANIFICATORE — la settimana, decisa e adattabile
   La domenica sera il coach scrive un piano di massima (operazione
   «settimana»): quali sedute, in quali giorni, dove. Durante la
   settimana puoi adattarlo: l'app guarda cosa hai gia' fatto e i
   giorni che restano e il generatore (23-generatore.js) risceglie e
   adatta le sedute che mancano, con il bilancio delle serie per gruppo.
   Le sedute si possono mettere nel calendario (.ics).
   ============================================================ */
var GG_NOME={lun:"Lun",mar:"Mar",mer:"Mer",gio:"Gio",ven:"Ven",sab:"Sab",dom:"Dom"};
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
/* la seduta da mostrare in Oggi: quella del piano per oggi, altrimenti la prossima in calendario.
   Senza piano (o con il piano finito) resta la prima seduta che manca, in ordine A B C D. */
function prossimaDelPiano(w){
  return seduteDelPiano(w).filter(function(e){ return e.stato==="oggi"||e.stato==="futura"; })
    .sort(function(a,b){ return s2d(a.data)-s2d(b.data); })[0] || null;
}
function saltate(w){ return seduteDelPiano(w).filter(function(e){ return e.stato==="saltata"; }); }
/* disponibilita' di un giorno: casa, fuori (con le bande), fuori0 (senza niente), no.
   Parte da quanto scritto nella chiusura della settimana prima. */
function dispoGiorno(w, data){
  var v=((S.dispo||{})[w]||{})[data]; if(v) return v;
  var ch=(S.chiusure||{})[w-1]||{}, gg=ggDi(data);
  if((ch.occupati||[]).indexOf(gg)>=0) return "no";
  if((ch.fuori||[]).indexOf(gg)>=0) return "fuori";
  var b=benOn(data); if(b && b.sede==="Fuori") return "fuori";
  return "casa";
}

/* ---------- ora proposta per una seduta ---------- */
function oraProposta(data){
  var o=orari().mattina;
  if(data!==today()) return o;
  var now=new Date(), h=now.getHours()+(now.getMinutes()>30?2:1);
  h=Math.max(h, Math.floor(hm(o)/60));
  return h>=22? "21:00" : String(h).padStart(2,"0")+":00";
}
/* ---------- bilancio: cosa avrai fatto a fine settimana ---------- */
function bilancio(w, sedute){
  var fatte=kpi(w).grp, prev={}, out={}, buchi=[];
  (sedute||[]).forEach(function(e){
    if(sedutaCoperta(w, e.d)) return;
    var g=contributi(listaSeduta(e)); Object.keys(g).forEach(function(k){ prev[k]=(prev[k]||0)+g[k]; });
  });
  Object.keys(TGT).forEach(function(g){
    var f=fatte[g]||0, p=prev[g]||0, t=f+p, r=TGT[g], st = t<r[0]? "sotto" : t>r[1]? "sopra" : "ok";
    out[g]={fatte:f, prev:p, tot:t, min:r[0], max:r[1], stato:st};
    if(st==="sotto") buchi.push(g);
  });
  return {gruppi:out, buchi:buchi};
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
    var p=PLAN[e.d], lista=listaSeduta(e), dt=s2d(e.data), ora=e.ora||orari().mattina, min=Math.round(minutiSeduta(lista));
    var luogo={casa:"a casa",bande:"con le bande",corpo:"a corpo libero"}[e.l]||"";
    var titolo="Rachide · "+e.d+" "+p.name+" ("+luogo+")";
    var desc=lista.map(function(x){ return x.s+"×"+(x.lo===x.hi?x.hi:x.lo+"-"+x.hi)+" "+x.n; }).join("\n");
    ev.push(["BEGIN:VEVENT","UID:rachide-sett"+w+"-"+e.d+"@rachide","DTSTAMP:"+icsData(new Date(),"00:00"),"SEQUENCE:"+Math.floor(t/60000),
      "DTSTART:"+icsData(dt, ora),"DURATION:PT"+(min||p.min||60)+"M","SUMMARY:"+icsTesto(titolo),
      "DESCRIPTION:"+icsTesto("Circa "+min+" minuti. Riscaldamento 5 minuti, poi:\n"+desc+"\n"+url),"URL:"+url,
      "BEGIN:VALARM","ACTION:DISPLAY","DESCRIPTION:"+icsTesto(titolo),"TRIGGER:-PT30M","END:VALARM","END:VEVENT"].join("\r\n"));
  });
  return ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Rachide//Settimana//IT","CALSCALE:GREGORIAN","METHOD:PUBLISH","X-WR-CALNAME:Rachide · sedute"]
    .concat(ev).concat(["END:VCALENDAR"]).join("\r\n")+"\r\n";
}

/* ---------- operazione del coach ----------
   {"op":"settimana","w":41,"nota":"…","giorni":{"lun":"casa 60","mar":"fuori 30","mer":"no"},
    "sedute":[{"g":"lun","d":"A","l":"casa","ora":"07:30","t":60}]}
   giorni (facoltativo): dove sei e quanti minuti hai. Le sedute restano quelle del coach;
   l'app ne adatta gli esercizi al tempo e al bilancio dei gruppi. */
function giorniDaOp(w, g){
  var dispo={}, tempo={}, err=[];
  Object.keys(g||{}).forEach(function(k){
    var data=dataOk(k)? k : dataDaGG(w, k); if(!data){ err.push("giorno «"+k+"» non valido"); return; }
    var p=String(g[k]).toLowerCase().trim().split(/\s+/), po=p[0], t=+p[1];
    if(po==="fuori" && /niente|0/.test(p.slice(1).join(" ")) && !t) po="fuori0";
    if(!POSTO_MOD[po]){ err.push(k+": luogo «"+p[0]+"» non valido (casa, fuori, fuori0, no)"); return; }
    dispo[data]=po; if(TEMPI.indexOf(t)>=0) tempo[data]=t; else if(t) tempo[data]=t<=40? 30 : t<=75? 60 : 90;
  });
  return {dispo:dispo, tempo:tempo, err:err};
}
function pianoDaOp(op){
  var w=+op.w; if(!w) return {err:"manca la settimana (w)"};
  var sed=[], err=[];
  (op.sedute||[]).forEach(function(e,i){
    var data=e.data && dataOk(e.data)? e.data : dataDaGG(w, e.g);
    if(!data){ err.push("seduta "+(i+1)+": giorno non valido"); return; }
    if(weekOf(data)!==w){ err.push("seduta "+(i+1)+": la data non cade nella settimana "+w); return; }
    if(!PLAN[e.d]){ err.push("seduta "+(i+1)+": il giorno di piano «"+e.d+"» non esiste"); return; }
    var l=["casa","bande","corpo"].indexOf(e.l)>=0 ? e.l : (PLAN[e.d].sede==="Casa"? "casa":"bande");
    var t=+e.t; t = t? (t<=40? 30 : t<=75? 60 : 90) : 0;
    var x={data:data, d:e.d, l:l, ora:/^\d{1,2}:\d{2}$/.test(e.ora||"")? e.ora : orari().mattina}; if(t) x.t=t;
    sed.push(x);
  });
  var gd=giorniDaOp(w, op.giorni);
  return {w:w, sedute:sed, nota:op.nota||"", err:err.concat(gd.err), dispo:gd.dispo, tempo:gd.tempo};
}
function pianoApplica(op){
  var p=pianoDaOp(op); if(p.err && !p.sedute) return false;
  S.dispo=S.dispo||{}; S.tempo=S.tempo||{};
  if(Object.keys(p.dispo).length) S.dispo[p.w]=Object.assign({}, S.dispo[p.w]||{}, p.dispo);
  p.sedute.forEach(function(e){ if(e.t){ p.tempo[e.data]=e.t; } });
  if(Object.keys(p.tempo).length) S.tempo[p.w]=Object.assign({}, S.tempo[p.w]||{}, p.tempo);
  S.pianoSett=S.pianoSett||{};
  S.pianoSett[p.w]={ts:Date.now(), da:"coach", nota:p.nota, sedute:adattaFisse(p.w, p.sedute)};
  cfgTocca("settimane");
  return true;
}
/* le sedute decise (dal coach o da te) restano dove sono; gli esercizi si adattano a tempo e bilancio */
function adattaFisse(w, sedute){
  var resta=(sedute||[]).filter(function(e){ return !sedutaCoperta(w, e.d) && giorniFa(e.data)<=0; });
  if(!resta.length) return sedute;
  var g=generaSettimana(w, {fisse:resta});
  return (sedute||[]).map(function(e){
    var x=g.sedute.filter(function(s){ return s.d===e.d && s.data===e.data; })[0];
    return x? Object.assign({}, e, {t:x.t, agg:x.agg, ser:x.ser, via:x.via}) : e;
  });
}
function pianoTesto(w, sedute){
  return (sedute||[]).map(function(e){ return ggDi(e.data)+" "+e.data.slice(0,5)+" "+e.d+" "+(MOD_NOME[e.l]||e.l).toLowerCase()+(e.t?" "+e.t+"′":"")+(e.ora?" "+e.ora:""); }).join(" · ");
}

/* ---------- la settimana in sette caselle ---------- */
function cardSettimanaRail(w, sedute){
  var date=dateSettimana(w), oggi=today(), h='<div class="rail7">';
  date.forEach(function(data, i){
    var s=S.sess.filter(function(x){ return x.date===data; })[0], pe=sedute.filter(function(e){ return e.data===data; })[0], dv=dispoGiorno(w, data);
    var cl="r7"+(data===oggi?" oggi":""), top, bot="";
    if(s && isRest(s)){ cl+=" riposo"; top="R"; bot="riposo"; }
    else if(s){ cl+=" fatta"; top=s.day; bot=(s.mod==="Pesi"?"✓":(s.mod==="Corpo libero"?"✓ corpo":(s.mod==="Bande"?"✓ bande":"✓"))); }
    else if(pe){ cl+=" prev"+(pe.stato==="saltata"?" salt":""); top=pe.d; bot={casa:"pesi",bande:"bande",corpo:"corpo"}[pe.l]+(pe.t?" "+pe.t+"′":""); }
    else if(dv==="no"){ cl+=" no"; top="–"; bot="no"; }
    else if(dv==="fuori"){ cl+=" fuori"; top="·"; bot="fuori bande"; }
    else if(dv==="fuori0"){ cl+=" fuori"; top="·"; bot="fuori niente"; }
    else { top="·"; bot=""; }
    h+='<button class="'+cl+'" data-a="pdispo1" data-date="'+data+'" aria-label="'+GG_NOME[GG[i]]+' '+data.slice(0,5)+'"><span class="g">'+GG_NOME[GG[i]]+'</span><span class="n">'+(+data.slice(0,2))+'</span><b>'+esc(top)+'</b><span class="b">'+esc(bot)+'</span></button>';
  });
  return h+'</div>';
}

/* ---------- l'adattamento in settimana ---------- */
var PS=null;
function pianoApri(){
  var w=weekOf(today()), esist=seduteDelPiano(w), dispo={}, tempo={}, forza={};
  dateSettimana(w).forEach(function(d){ dispo[d]=dispoGiorno(w,d); tempo[d]=tempoGiorno(w,d); });
  var restano=esist.filter(function(e){ return e.stato==="oggi"||e.stato==="futura"; });
  restano.forEach(function(e){ if(modOk(dispo[e.data], e.l) && e.l!==modDefault(dispo[e.data])) forza[e.data]=e.l; });
  PS={w:w, dispo:dispo, tempo:tempo, forza:forza, fissa:{}, pref:restano.map(function(e){ return {data:e.data, d:e.d, ora:e.ora}; })};
  pianoCalcola(); pianoSheet();
}
function pianoCalcola(){
  PS.g=generaSettimana(PS.w, {dispo:PS.dispo, tempo:PS.tempo, forza:PS.forza, fissa:PS.fissa, pref:PS.pref});
  PS.sedute=PS.g.sedute; PS.eccesso=PS.g.fuori.length;
}
function pianoRicalcola(){ PS.fissa={}; PS.forza={}; PS.pref=[]; pianoCalcola(); pianoSheet(); }
/* toccare una seduta la tiene ferma dov'e': cambia solo quello che hai toccato */
function pianoFissaTutto(){ PS.fissa={}; (PS.sedute||[]).forEach(function(e){ PS.fissa[e.d]=e.data; }); }
function pianoSheet(){
  var w=PS.w, date=dateSettimana(w), disp=date.filter(function(d){ return giorniFa(d)<=0; });
  var fatteN=S.sess.filter(function(s){ return s.w===w && !isRest(s); }).length, tg=bersaglio(w, S.sess.filter(function(s){ return s.w===w && isRest(s); }).length);
  var h='<div class="eyebrow amb">Adatta la settimana '+w+'</div><h2 style="margin:4px 0 4px;font-size:19px">Cosa resta da fare</h2>'+
    '<div class="sm mut">Hai fatto '+fatteN+(fatteN===1?' seduta':' sedute')+' su '+tg+'. Per ogni giorno che resta scegli dove sei e quanto tempo hai: l\'app sceglie le sedute e le adatta per chiudere tutti i gruppi.</div>';
  h+='<div class="eyebrow" style="margin:14px 0 4px">I giorni che restano</div><div class="pgiorni">';
  disp.forEach(function(data){
    var dv=PS.dispo[data], i=date.indexOf(data), oggiF=(data===today()), fatta=oggiF && S.sess.some(function(s){ return s.date===data && !isRest(s); });
    h+='<div class="pgg'+(dv==="no"?" off":"")+'"><div class="pgn"><b>'+GG_NOME[GG[i]]+' '+(+data.slice(0,2))+'</b>'+(oggiF?'<span>'+(fatta?'fatto':'oggi')+'</span>':'')+'</div>'+
      '<div class="pseg">'+POSTI.map(function(p){ return '<button class="'+(dv===p[0]?"on":"")+'" data-a="pposto" data-date="'+data+'" data-v="'+p[0]+'" aria-label="'+esc(p[2])+'">'+esc(p[1].replace("Fuori · ","Fuori "))+'</button>'; }).join("")+'</div>'+
      (dv==="no"? '' : '<div class="pseg t">'+TEMPI.map(function(t){ return '<button class="'+(PS.tempo[data]===t?"on":"")+'" data-a="ptempo" data-date="'+data+'" data-v="'+t+'">'+t+'′</button>'; }).join("")+'</div>')+
      '</div>';
  });
  h+='</div><div class="xs mut" style="margin-top:4px">Casa: pesi, bande o niente. Fuori: con le bande o senza niente. Il tempo comprende 5 minuti di riscaldamento.</div>';
  if(PS.eccesso>0) h+='<div class="flag disc" style="margin-top:10px">⚠<div><b>I giorni non bastano per '+(PS.eccesso===1?'la seduta ':'le sedute ')+PS.g.fuori.join(", ")+'.</b> I gruppi che lavoravano lì sono stati spostati, dove c\'era tempo, nelle sedute che restano. Puoi anche passare alla settimana di picco o liberare un giorno.</div></div>';
  h+='<div class="eyebrow" style="margin:16px 0 6px">Sedute proposte</div>';
  if(!PS.sedute.length) h+='<div class="card flat" style="text-align:center;padding:14px"><div class="sm mut">'+(PS.g.mancano.length? 'Nessun giorno libero: segna almeno un giorno.' : 'Niente da pianificare: la settimana è completa.')+'</div></div>';
  PS.sedute.forEach(function(e,i){
    var p=PLAN[e.d], lista=listaSeduta(e), min=Math.round(minutiSeduta(lista)), po=PS.dispo[e.data], mods=POSTO_MOD[po]||["casa"];
    var cs=contributi(lista), prim=Object.keys(cs).sort(function(a,b){ return cs[b]-cs[a]; }).slice(0,3);
    var nuovi={}, piu={}, meno={}; (e.cambi||[]).forEach(function(c){ if(c.tipo==="nuovo") nuovi[c.n]=c.perche; else if(c.tipo==="piu") piu[c.n]=c.perche; else if(c.tipo==="meno") meno[c.n]=c.perche; });
    var base=sedutaBase(e.d, e.l);
    h+='<div class="psr"><div class="between"><div><div class="sm" style="font-weight:800">'+GG_NOME[ggDi(e.data)]+' '+(+e.data.slice(0,2))+' · '+e.d+' · '+esc(p.name)+'</div>'+
      '<div class="xs" style="margin-top:2px;color:'+(min>e.t*TOLL?"var(--amb)":"var(--mut)")+'">'+esc(MOD_NOME[e.l])+' · circa '+min+'′ su '+e.t+'′ · lavora '+prim.map(function(g){ return g+' '+dec(cs[g]); }).join(', ')+'</div></div>'+
      '<select class="psd" data-ps="'+i+'" aria-label="Sposta in un altro giorno">'+disp.filter(function(d){ return PS.dispo[d]!=="no" || d===e.data; }).map(function(d){ return '<option value="'+d+'"'+(d===e.data?" selected":"")+'>'+GG_NOME[ggDi(d)]+' '+d.slice(0,5)+'</option>'; }).join("")+'</select></div>';
    if(mods.length>1) h+='<div class="seg" style="margin-top:8px">'+mods.map(function(l){ return '<button class="'+(e.l===l?"on":"")+'" data-a="psl" data-i="'+i+'" data-v="'+l+'"><b>'+MOD_NOME[l]+'</b></button>'; }).join("")+'</div>';
    h+='<ul class="pex">';
    lista.forEach(function(x){
      var b=base.filter(function(y){ return y.n===x.n; })[0], tag="";
      if(!b) tag='<em class="add">nuovo · '+esc((nuovi[x.n]||"per "+(x.perG||meta(x.n).g)).replace(/^per /,""))+'</em>';
      else if(x.s>b.s) tag='<em class="add">+'+(x.s-b.s)+' · '+esc((piu[x.n]||"").replace(/^per /,""))+'</em>';
      else if(x.s<b.s) tag='<em class="cut">−'+(b.s-x.s)+'</em>';
      h+='<li><b>'+x.s+'×</b><span>'+esc(x.n)+'</span>'+tag+'</li>';
    });
    base.filter(function(b){ return !lista.some(function(x){ return x.n===b.n; }); }).forEach(function(b){ h+='<li class="via"><b>–</b><span>'+esc(b.n)+'</span><em class="cut">tolto</em></li>'; });
    h+='</ul>';
    var tolti=(e.cambi||[]).filter(function(c){ return c.tipo==="via"||c.tipo==="meno"; }), motivi={};
    tolti.forEach(function(c){ motivi[c.perche]=1; });
    if(tolti.length) h+='<div class="xs mut" style="margin-top:4px">Serie tolte: '+esc(Object.keys(motivi).join("; "))+'.</div>';
    if(!(e.cambi||[]).length) h+='<div class="xs" style="margin-top:4px;color:var(--ok)">Nessuna modifica: entra nei '+e.t+'′ e il bilancio della settimana è già a posto.</div>';
    h+='</div>';
  });
  var bil=bilancioDa(PS.g);
  h+='<div class="eyebrow" style="margin:16px 0 6px">Bilancio a fine settimana · serie dure per gruppo</div><div class="card" style="padding:10px 12px">'+
    Object.keys(bil.gruppi).map(function(g){ var r=bil.gruppi[g], max=Math.max(r.max*1.15, r.tot, 1), col=r.stato==="ok"?"var(--ok)":r.stato==="sotto"?"var(--alert)":"var(--amb)";
      return '<div class="gr"><div class="nm">'+g+'</div><div class="tr"><div class="zn" style="left:'+r1(r.min/max*100)+'%;width:'+r1((r.max-r.min)/max*100)+'%"></div>'+
        '<div class="fl" style="width:'+r1(Math.min(100,r.fatte/max*100))+'%;background:'+col+'"></div>'+
        '<div class="fl pv" style="left:'+r1(Math.min(100,r.fatte/max*100))+'%;width:'+r1(Math.min(100-r.fatte/max*100, r.prev/max*100))+'%;background:'+col+'"></div></div>'+
        '<div class="vl" style="color:'+col+'">'+dec(Math.round(r.tot*2)/2)+' <span>/'+r.min+'–'+r.max+'</span></div></div>'; }).join("")+
    '<div class="xs mut" style="margin-top:8px">Pieno = già fatto · chiaro = previsto. Fascia verde = 10-20 serie (core 6-12), serie dure, indirette a metà.</div></div>';
  var sp=statoPrevisto(w, PS.sedute, bil), SP=STATO_SETT[sp];
  h+='<div class="stprev" style="border-color:'+SP.c+'"><span>Se fai queste sedute la settimana è</span><b style="color:'+SP.c+'">'+SP.t+'</b></div>';
  if(sp==="rotta"){
    var c30=giorniRestano(w).filter(function(d){ return PS.dispo[d]==="no"; });
    h+='<div class="flag disc" style="margin-top:8px">⚠<div><b>Servono almeno 2 sedute per tenere la settimana.</b> '+(c30.length? 'Mezz\'ora a corpo libero in un giorno che hai segnato occupato basta.<button class="btn sm" style="margin-top:8px;width:100%" data-a="p30">Aggiungi 30′ a corpo libero</button>' : 'Non restano giorni: la catena riparte la prossima settimana.')+'</div></div>';
  } else if(bil.buchi.length && PS.sedute.length) h+='<div class="flag info" style="margin-top:8px"><b>!</b><div>'+esc(bil.buchi.join(", "))+' '+(bil.buchi.length>1?'restano':'resta')+' sotto il minimo: la settimana è tenuta, non piena. Più tempo in un giorno (60′ o 90′) o un giorno in più li chiude.</div></div>';
  var gs=giorniSenzaPesi();
  if(gs!=null && gs>=10 && PS.sedute.length && PS.sedute.every(function(e){ return e.l!=="casa"; }))
    h+='<div class="flag disc" style="margin-top:8px">⚠<div>Sono '+gs+' giorni senza carichi pesanti e nessuna seduta con i pesi in programma. Per la forza massima servono: se puoi, tieni almeno una seduta a casa con i pesi.</div></div>';
  h+='<div class="xs mut" style="margin-top:10px">Come sceglie: prova tutte le combinazioni di sedute e giorni e tiene quella che lascia meno gruppi sotto il minimo, distanzia le sedute che lavorano gli stessi muscoli e sta nei tempi. Al massimo 10 serie per gruppo nella stessa seduta.</div>';
  h+='<button class="btn" style="margin-top:12px" data-a="pricalcola">Ricalcola da capo</button>'+
    '<button class="btn pri" style="margin-top:8px" data-a="psave">Salva il piano</button>'+
    '<button class="btn" style="margin-top:8px" data-a="pics">Salva e metti a calendario</button>'+
    '<button class="btn ghost" style="margin-top:8px" data-a="x">Chiudi</button>';
  sheet(h);
}
function pianoSalva(){
  if(!PS) return;
  S.dispo=S.dispo||{}; S.dispo[PS.w]=Object.assign({}, PS.dispo);
  S.tempo=S.tempo||{}; S.tempo[PS.w]=Object.assign({}, PS.tempo);
  var gia=seduteDelPiano(PS.w).filter(function(e){ return e.stato==="fatta"||e.stato==="riposo"; }).map(function(e){ return {data:e.data,d:e.d,l:e.l,ora:e.ora}; });
  S.pianoSett=S.pianoSett||{};
  S.pianoSett[PS.w]={ts:Date.now(), da:"app", nota:"", sedute:gia.concat(PS.sedute.map(function(e){ return {data:e.data, d:e.d, l:e.l, ora:e.ora, t:e.t, agg:e.agg, ser:e.ser, via:e.via}; }))};
  cfgTocca("settimane");
  var ok=save(); if(SYNC.on()) doPush(false);
  return ok;
}

/* ---------- la catena: piano fatto, rischio, mezz'ora a corpo libero ---------- */
var STATO_SETT={piena:{t:"piena", c:"var(--ok)"}, tenuta:{t:"tenuta", c:"var(--glow)"}, rotta:{t:"rotta", c:"var(--alert)"}, aperta:{t:"in corso", c:"var(--mut)"}};
/* la seduta migliore da 30 minuti a corpo libero, oggi: sceglie quella che recupera di piu' */
function seduta30(){
  var w=weekOf(today()), d=today(), dispo={}, tempo={}, forza={};
  dateSettimana(w).forEach(function(x){ dispo[x]=(x===d)? "casa" : "no"; });
  tempo[d]=30; forza[d]="corpo";
  var g=generaSettimana(w, {dispo:dispo, tempo:tempo, forza:forza});
  return g.sedute[0] || null;
}
function avvia30(){
  var w=weekOf(today()), sd=seduta30();
  if(!sd){ toast("Oggi hai già fatto una seduta: scegli un altro giorno in «Adatta la settimana»"); return; }
  if(!statoSettimana(w).ok){
    /* serve per tenere la settimana: entra nel piano (le saltate escono, la stessa seduta in un altro giorno si sposta a oggi) */
    var p=pianoSett(w), keep=seduteDelPiano(w).filter(function(e){ return e.stato!=="saltata" && !(e.d===sd.d && e.stato==="futura"); })
      .map(function(e){ return {data:e.data, d:e.d, l:e.l, ora:e.ora, t:e.t, agg:e.agg, ser:e.ser, via:e.via}; });
    S.pianoSett=S.pianoSett||{};
    S.pianoSett[w]={ts:Date.now(), da:"app", nota:(p&&p.nota)||"", sedute:keep.concat([{data:sd.data, d:sd.d, l:"corpo", ora:sd.ora, t:30, agg:sd.agg, ser:sd.ser, via:sd.via}])};
    S.tempo=S.tempo||{}; S.tempo[w]=S.tempo[w]||{}; S.tempo[w][sd.data]=30;
    cfgTocca("settimane");
  }
  startSession(sd.d, false, false, "corpo", listaSeduta(sd));
}
function giorniRestano(w){
  return dateSettimana(w).filter(function(d){ return giorniFa(d)<0 || (giorniFa(d)===0 && !S.sess.some(function(x){ return x.date===d && !isRest(x); })); });
}
/* in Oggi, al posto della prossima seduta quando il piano della settimana e' fatto */
function cardSettimanaFatta(w, s, next){
  var ten=(s.stato==="tenuta"), col=STATO_SETT[s.stato].c;
  var h='<div class="card" style="border-color:'+col+'"><div class="eyebrow" style="color:'+col+'">Settimana '+(ten?'tenuta':'piena')+' ✓</div>'+
    '<h2 style="margin:5px 0 6px">'+(ten? 'Hai fatto il piano della settimana' : 'Tutti i gruppi al minimo')+'</h2>'+
    '<div class="sm mut">'+(ten? s.real+' sedute, quelle che i tuoi giorni permettevano: la catena continua.'+(s.sotto.length? ' Restano sotto il minimo di serie: '+esc(s.sotto.join(", "))+'.' : '')
      : 'Con '+s.real+(s.real===1?' seduta':' sedute')+' hai già il minimo di serie dure in tutti e 7 i gruppi. Il recupero fa parte del programma.')+'</div>';
  var sd=ten? seduta30() : null;
  if(sd){
    var cs=contributi(listaSeduta(sd)), rec=s.sotto.filter(function(g){ return (cs[g]||0)>0; });
    h+='<button class="btn" style="margin-top:12px" data-a="corpo30">Se trovi mezz\'ora · 30′ a corpo libero</button>'+
      '<div class="xs mut" style="margin-top:6px">Seduta '+sd.d+' adattata'+(rec.length? ', recupera '+esc(rec.join(", ")) : '')+'. Facoltativa: la settimana è già tenuta.</div>';
  } else if(next) h+='<button class="btn sm ghost" style="width:100%;margin-top:12px" data-a="open" data-d="'+next+'">Se vuoi allenarti lo stesso: giorno '+next+'</button>';
  return h+'</div>';
}
/* in Oggi, quando la settimana rischia di rompersi */
function cardRischio(w, rs){
  if(!rs || !rs.serve) return "";
  var rest=giorniRestano(w), oggiOk=rest.indexOf(today())>=0 && !pianoDelGiorno(today()), sd=oggiOk? seduta30() : null;
  var h='<div class="flag disc" style="margin-top:12px">⚠<div><b>Per tenere la settimana '+(rs.serve>1? 'mancano '+rs.serve+' sedute' : 'manca 1 seduta')+'.</b> ';
  if(rest.length<rs.serve) return h+'Non restano abbastanza giorni: questa settimana la catena si ferma e riparte lunedì. Capita.</div></div>';
  h+='Ne servono almeno 2 a settimana: anche mezz\'ora a corpo libero basta.';
  if(sd) h+='<button class="btn sm" style="margin-top:8px;width:100%" data-a="corpo30">30′ a corpo libero oggi · seduta '+sd.d+'</button>';
  h+='<button class="btn sm ghost" style="margin-top:6px;width:100%" data-a="piano">'+(sd? 'Oppure scegli un altro giorno' : 'Scegli il giorno in «Adatta la settimana»')+'</button></div></div>';
  return h;
}
/* nel pianificatore: un giorno occupato diventa 30' a corpo libero, il piu' lontano dalle altre sedute */
function piano30(){
  var w=PS.w, cand=giorniRestano(w).filter(function(d){ return PS.dispo[d]==="no"; });
  if(!cand.length) return;
  var usati=PS.sedute.map(function(e){ return s2d(e.data).getTime(); }).concat(S.sess.filter(function(x){ return x.w===w && !isRest(x); }).map(function(x){ return s2d(x.date).getTime(); }));
  var dist=function(d){ var t=s2d(d).getTime(); return usati.length? Math.min.apply(null, usati.map(function(u){ return Math.abs(u-t); })) : 0; };
  cand.sort(function(a,b){ return dist(b)-dist(a); });
  var d=cand[0]; PS.dispo[d]="casa"; PS.tempo[d]=30; PS.forza[d]="corpo";
  pianoCalcola(); pianoSheet(); toast(GG_NOME[ggDi(d)]+" "+d.slice(0,5)+": 30′ a corpo libero");
}
function statoPrevisto(w, sedute, bil){
  var ss=S.sess.filter(function(s){ return s.w===w; }), real=ss.filter(function(s){ return !isRest(s); }).length;
  var tg=bersaglio(w, ss.filter(isRest).length), tot=real+(sedute||[]).length;
  return (tot>=tg || (tot>=1 && !bil.buchi.length))? "piena" : tot>=SEDUTE_MIN? "tenuta" : "rotta";
}

/* ---------- per il coach: piano, disponibilita', bilancio, formato ---------- */
function giornoTesto(w, d){ var po=dispoGiorno(w,d); return ggDi(d)+" "+({casa:"casa",fuori:"fuori-bande",fuori0:"fuori-niente",no:"no"}[po]||po)+(po==="no"?"":" "+tempoGiorno(w,d)+"′"); }
function sedutaTestoCoach(e){ var c=cambiTesto(e); return ggDi(e.data)+" "+e.data.slice(0,5)+" "+e.d+" "+(MOD_NOME[e.l]||e.l).toLowerCase()+(e.t?" "+e.t+"′":"")+(e.stato?" ["+e.stato+"]":"")+(c.length?" ("+c.join("; ")+")":""); }
function briefingPiano(){
  var w=weekOf(today()), L=[], sed=seduteDelPiano(w), ch=(S.chiusure||{})[w]||{};
  L.push("PIANO DELLA SETTIMANA "+w);
  if(sed.length) L.push("- piano"+(pianoSett(w).da==="coach"?" del coach":" dell'app")+": "+sed.map(sedutaTestoCoach).join(" · "));
  else L.push("- nessun piano salvato per questa settimana");
  var mancano=giorniSettimana(w).filter(function(d){ return !sedutaCoperta(w,d); });
  L.push("- sedute ancora da fare: "+(mancano.join(", ")||"nessuna")+" · giorni che restano: "+dateSettimana(w).filter(function(d){ return giorniFa(d)<=0; }).map(function(d){ return giornoTesto(w,d); }).join(" · "));
  var restano=sed.filter(function(e){ return e.stato==="oggi"||e.stato==="futura"; });
  var g=restano.length? generaSettimana(w, {fisse:restano}) : generaSettimana(w), bil=bilancioDa(g);
  if(!restano.length && g.sedute.length) L.push("- proposta dell'app per i giorni che restano: "+g.sedute.map(sedutaTestoCoach).join(" · "));
  L.push("- bilancio serie dure a fine settimana: "+Object.keys(bil.gruppi).map(function(k){ var r=bil.gruppi[k]; return k+" "+dec(Math.round(r.tot*2)/2)+(r.stato==="sotto"?" (sotto)":r.stato==="sopra"?" (sopra)":""); }).join(" · "));
  var gs=giorniSenzaPesi(); if(gs!=null) L.push("- giorni dall'ultima seduta con i pesi: "+gs);
  var w1=w+1, dsp=(S.dispo||{})[w1];
  if(dsp && Object.keys(dsp).length){
    L.push("DISPONIBILITA' SETTIMANA "+w1+" (dalla chiusura): "+dateSettimana(w1).map(function(d){ return giornoTesto(w1,d); }).join(" · ")+(ch.mom?" · momento: "+ch.mom:""));
    var g1=generaSettimana(w1);
    if(g1.sedute.length){ L.push("- proposta dell'app per la settimana "+w1+": "+g1.sedute.map(sedutaTestoCoach).join(" · ")+(g1.fuori.length?" · non entrano: "+g1.fuori.join(", "):""));
      var b1=bilancioDa(g1); if(b1.buchi.length) L.push("- con questa disponibilità restano sotto: "+b1.buchi.join(", ")); }
  } else L.push("DISPONIBILITA' SETTIMANA "+w1+" (dalla chiusura): fuori casa "+((ch.fuori||[]).join(" ")||"nessun giorno")+" · senza tempo "+((ch.occupati||[]).join(" ")||"nessun giorno")+" · giorni scelti per le sedute "+((ch.giorni||[]).join(" ")||"non scelti")+(ch.mom?" · "+ch.mom:""));
  L.push("Formato del piano (da incollare in Coach): {\"nota\":\"…\",\"ops\":[{\"op\":\"settimana\",\"w\":"+w1+",\"nota\":\"…\",\"giorni\":{\"lun\":\"casa 60\",\"mar\":\"fuori 30\",\"mer\":\"no\"},\"sedute\":[{\"g\":\"lun\",\"d\":\"A\",\"l\":\"casa\",\"ora\":\"07:30\",\"t\":60}]}]} · g: lun..dom · d: A B C D (E1 E2 in settimana di picco) · l: casa (pesi), bande, corpo · t: 30, 60 o 90 minuti · giorni: casa, fuori (con le bande), fuori0 (senza niente), no. L'app adatta gli esercizi di ogni seduta al tempo e al bilancio dei gruppi; la proposta dell'app qui sopra si può confermare così com'è.");
  return L.join("\n");
}
function pianoRigheStato(w){
  var ch=(S.chiusure||{})[w+1]||{}, sed=seduteDelPiano(w);
  return {piano_prog: sed.map(function(e){ return ggDi(e.data)+" "+e.d+" "+e.l+(e.t?" "+e.t+"′":"")+" "+e.stato; }).join(" · "),
    fuori:(ch.fuori||[]).join(" "), occupati:(ch.occupati||[]).join(" ")};
}
