/* ============================================================
   DATI E KPI — cosa misurare, quando, e con quale bersaglio
   Il dizionario KPI sta in 01-dati.js. Qui si calcolano i valori,
   si disegna il cruscotto e l'agenda di cosa registrare oggi.
   ============================================================ */

/* ---------- serie indirette: valgono mezza serie (Pelland 2024) ---------- */
var IND={
  "Floor Press manubri":["Tricipiti","Spalle"], "Floor Press (volume)":["Tricipiti","Spalle"],
  "Push-up":["Tricipiti","Spalle"], "Push-up piedi rialzati":["Tricipiti","Spalle"], "Push-up piedi rialzati con banda":["Tricipiti","Spalle"],
  "Chest Press manubri":["Tricipiti","Spalle"], "Incline Press manubri":["Tricipiti","Spalle"], "Push-up piedi rialzati o deficit":["Tricipiti","Spalle"],
  "Shoulder Press manubri":["Tricipiti"], "Shoulder press con banda":["Tricipiti"], "Pike push-up":["Tricipiti"],
  "Push-up stretti":["Petto"],
  "Rematore manubri":["Bicipiti"], "Rematore manubri (volume)":["Bicipiti"], "Rematore un braccio manubrio":["Bicipiti"],
  "Band row seduto":["Bicipiti"], "Band row un braccio":["Bicipiti"], "Rematore al telaio della porta":["Bicipiti"], "Band pull-down":["Bicipiti"],
  "Face pull":["Dorso"], "Reverse Fly":["Dorso"], "Band pull-apart":["Dorso"], "Y-T-W a busto inclinato":["Dorso"]
};
/* ---------- serie dure ----------
   L'unita' di volume non e' l'attrezzo ma lo sforzo: con carichi leggeri la crescita
   muscolare e' simile a quella coi carichi pesanti SE le serie sono vicine al cedimento
   (Schoenfeld 2017). Una serie chiusa a RIR 0-3 conta 1; chiusa a RIR 4 o piu' (serie
   comoda) conta 0,5. Senza RIR (dati di prima, tenute) conta 1.
   La soglia e' una scelta del progetto, non di una fonte. */
var RIR_DURA=3, PESO_LEGGERA=0.5;
function pesoSerie(r, j){
  var v=(r.rirs && r.rirs[j]!=null && r.rirs[j]!=="") ? +r.rirs[j] : null;
  if(v==null || meta(r.ex).sec) return 1;
  return v>RIR_DURA ? PESO_LEGGERA : 1;
}
function serieRiga(r){ var n=0; (r.reps||[]).forEach(function(x,j){ n+=pesoSerie(r,j); }); return r.side ? n/2 : n; }
/* un esercizio unilaterale e' UNA serie per il muscolo: le righe sx e dx descrivono lo stesso lavoro */
function serieGruppo(righe){
  var grp={};
  righe.forEach(function(r){
    var g=meta(r.ex).g, n=serieRiga(r);
    grp[g]=(grp[g]||0)+n;
    (IND[r.ex]||[]).forEach(function(g2){ grp[g2]=(grp[g2]||0)+n*0.5; });
  });
  Object.keys(grp).forEach(function(g){ grp[g]=Math.round(grp[g]*2)/2; });
  return grp;
}
/* quante serie sono dure sul totale (conteggio grezzo, senza il fattore indiretto) */
function serieDure(righe){
  var tot=0, dure=0;
  righe.forEach(function(r){ if(meta(r.ex).sec) return;
    var f=r.side? 0.5 : 1; (r.reps||[]).forEach(function(x,j){ tot+=f; if(pesoSerie(r,j)===1) dure+=f; }); });
  return {tot:tot, dure:dure, pct: tot? Math.round(dure/tot*100) : null};
}

/* ---------- carico sollevato, per modalita' ----------
   pesi: kg esatti (carico x ripetizioni).
   bande: kg stimati dalla banda (BANDKG, valore nominale) con un fattore perche' la
          tensione reale dipende da quanto la allunghi: stima del progetto.
   corpo libero: kg stimati come quota del tuo peso. Solo per il push-up c'e' una
          misura (Suprak 2011: circa 69-75% del peso); le altre quote sono stime
          del progetto, da affinare. Le tenute e il core non hanno un carico. */
var BAND_K=0.7;
var QUOTA_PESO={"Push-up":0.72, "Push-up stretti":0.72, "Push-up piedi rialzati":0.8, "Push-up piedi rialzati con banda":0.8,
  "Pike push-up":0.7, "Rematore al telaio della porta":0.45, "Box squat alla sedia 3s":0.85, "Bulgarian split squat 3s":0.85,
  "Affondi indietro":0.85, "Hip hinge una gamba":0.8, "Hip thrust a una gamba":0.6, "Calf raise monopodalico":1, "Calf raise":1, "Calf raise (BW)":1};
function caricoRiga(r){
  var reps=(r.reps||[]).reduce(function(a,b){ return a+b; },0), m=meta(r.ex);
  if(m.sec || m.t==="core" || !reps) return {tipo:"", kg:0};
  if(r.band) return {tipo:"bande", kg:(BANDKG[r.band]||0)*BAND_K*reps, stima:true};
  if(r.load>0) return {tipo:"pesi", kg:r.load*reps};
  var q=QUOTA_PESO[r.ex], pe=ultimoPeso()||66;
  if(q) return {tipo:"corpo", kg:q*pe*reps*(r.side?0.5:1), stima:true};
  return {tipo:"", kg:0};
}
function caricoSettimana(righe){
  var o={pesi:0, bande:0, corpo:0};
  righe.forEach(function(r){ var c=caricoRiga(r); if(c.tipo) o[c.tipo]+=c.kg; });
  return {pesi:Math.round(o.pesi), bande:Math.round(o.bande), corpo:Math.round(o.corpo), tot:Math.round(o.pesi+o.bande+o.corpo)};
}

/* ---------- serie storiche del benessere ---------- */
function benFinestra(campo, fino, giorni, incluso){
  var t1=s2d(fino).getTime()+(incluso?86400000:0), t0=s2d(fino).getTime()-giorni*86400000+(incluso?86400000:0);
  return S.ben.filter(function(b){
    if(b[campo]==null || b[campo]==="" || !dataOk(b.date)) return false;
    if(PLAUS[campo] && !plaus(campo, b[campo])) return false;
    var t=s2d(b.date).getTime(); return t>=t0 && t<t1;
  }).map(function(b){ return +b[campo]; });
}
/* HRV: fascia normale dei 60 giorni precedenti sul logaritmo, media mobile a 7 giorni (Plews) */
function hrvStato(date){
  date=date||today();
  var base=benFinestra("hrv", date, 60, false).map(Math.log);
  if(base.length<14) return null;
  var mu=media(base), sd=Math.sqrt(media(base.map(function(x){ return (x-mu)*(x-mu); })));
  sd=Math.max(sd, 0.05);
  var ult=benFinestra("hrv", date, 7, true).map(Math.log);
  var m7=ult.length>=3 ? media(ult) : null;
  var b=benOn(date), oggi=(b && b.hrv && plaus("hrv", b.hrv)) ? Math.log(b.hrv) : null;
  return {mu:mu, sd:sd, norma:Math.round(Math.exp(mu)), basso:Math.round(Math.exp(mu-0.5*sd)), alto:Math.round(Math.exp(mu+0.5*sd)),
    m7:m7, m7v: m7==null? null : Math.round(Math.exp(m7)), n7:ult.length,
    oggiBasso: oggi!=null && oggi < mu-sd,
    trend: m7==null ? null : (m7 < mu-0.5*sd ? "sotto" : (m7 > mu+0.5*sd ? "sopra" : "dentro"))};
}
/* FC a riposo: mediana degli ultimi 60 giorni (prima: di tutto lo storico, che cambia con la forma) */
function rhrNorma(exclDate){
  var d=exclDate||today(), v=benFinestra("rhr", d, 60, false);
  if(v.length>=3) return Math.round(mediana(v));
  return medBase("rhr", exclDate);
}

/* ---------- valori dei KPI ---------- */
function ultimoPeso(){
  var p=S.ben.filter(function(b){ return b.peso>0 && dataOk(b.date); }).sort(function(a,b){ return s2d(b.date)-s2d(a.date); })[0];
  if(p) return p.peso;
  var m=ultimoValido(S.mis); return m && m.peso ? m.peso : null;
}
function pesoCorridoio(){ return (S.target && S.target.peso) || PESO_TGT; }
function mediaUltimi(campo, giorni){ var v=benFinestra(campo, today(), giorni||7, true); return v.length? media(v) : null; }
function statoSoglia(def, v){
  if(v==null || isNaN(v)) return "na";
  if(def.verso==="su") return v>=def.ok ? "ok" : v>=def.att ? "att" : "ko";
  if(def.verso==="giu") return v<=def.ok ? "ok" : v<=def.att ? "att" : "ko";
  if(def.verso==="scarto") return Math.abs(v)<=def.ok ? "ok" : Math.abs(v)<=def.att ? "att" : "ko";
  if(def.verso==="scarto+") return v<=def.ok ? "ok" : v<=def.att ? "att" : "ko";
  return "na";
}
function kpiValori(){
  /* i KPI settimanali si leggono sull'ultima settimana conclusa: quella in corso
     sembrerebbe sempre in ritardo. Se la settimana in corso e' gia' a bersaglio, vale lei. */
  var w=weekOf(today()), ws=weeks(), wq = weekDone(w).ok ? w : w-1;
  if(ws.indexOf(wq)<0) wq = ws.filter(function(x){ return x<=w; }).pop() || w;
  var sw="sett. "+wq+" · ";
  var k=kpi(wq), out={}, D={}; KPI.forEach(function(x){ D[x.id]=x; });
  var put=function(id, v, txt, stato){ out[id]={v:v, txt:txt, stato: stato || statoSoglia(D[id], v)}; };
  put("aderenza", (ws.length && k.target)? Math.round(k.n/k.target*100) : null, sw+k.n+" su "+k.target);
  var nel=0, fuori=[]; Object.keys(TGT).forEach(function(g){ var v=k.grp[g]||0, t=TGT[g]; if(v>=t[0] && v<=t[1]) nel++; else fuori.push(g+" "+dec(v)); });
  put("serie_gruppo", (ws.length? nel : null), sw+nel+" su "+Object.keys(TGT).length+(fuori.length? " · fuori: "+fuori.join(", ") : ""));
  put("serie_dure", k.dure.pct, k.dure.pct==null? "–" : sw+k.dure.pct+"% ("+dec(k.dure.dure)+" su "+dec(k.dure.tot)+")");
  put("top_range", k.top, k.top==null? "–" : sw+k.top+"%");
  var cN=0, c0=0; ws.slice(-2).forEach(function(x){ var kk=kpi(x); cN+=kk.rirN; c0+=kk.rir0; });
  put("cedimenti", cN? c0 : null, cN? c0+" su "+cN : "nessun RIR registrato");
  var lim=Date.now()-28*86400000, rec=prBoard().filter(function(x){ return s2d(x.date).getTime()>=lim; }).length;
  put("record", ws.length? rec : null, String(rec));
  put("durata", k.dur, k.dur? sw+k.dur+" min" : "–");
  put("asimmetria", ws.length? k.asim : null, sw+k.asim+"%");
  var sl=weightSlope(), cor=pesoCorridoio(), pe=ultimoPeso();
  var lett = pe ? Math.round(pe*2.5)+"-"+Math.round(pe*5)+" g per il tuo peso" : "";
  put("pendenza", sl.ok? sl.g : null, sl.ok? (sl.g>0?"+":"")+sl.g+" g/sett · corridoio "+cor[0]+"-"+cor[1]+(lett?" · letteratura "+lett:"") : (sl.why||"dati insufficienti"),
      !sl.ok? "na" : (sl.g>=cor[0] && sl.g<=cor[1]) ? "ok" : "att");
  var cw=cibWeek(), tg=cibTarget();
  var prot = (cw && pe) ? r1(cw.p*BLK.p/pe) : null;
  put("proteine", prot, prot==null? "–" : dec(prot)+" g/kg ("+Math.round(cw.p*BLK.p)+" g)");
  var kc = cw ? Math.round((4*cw.p*BLK.p + 4*cw.c*BLK.c + 9*cw.g*BLK.g)) : null;
  var sc = (kc && cw.n>=4) ? Math.round((kc/tg.kcal-1)*100) : null;
  put("kcal", sc, kc? kc+" kcal su "+tg.kcal+(cw.n<4? " · solo "+cw.n+" giornate" : " ("+(sc>0?"+":"")+sc+"%)") : "–");
  var gc=S.ben.filter(function(b){ return (b.cibP||b.cibC||b.cibG) && dataOk(b.date) && giorniDa(b.date)>=0 && giorniDa(b.date)<7; }).length;
  put("giorni_cibo", gc, gc+" su 7");
  var m=ultimoValido(S.mis), alt=S.profilo && +S.profilo.altezza;
  var whtr=(m && m.vita && alt) ? Math.round(m.vita/alt*1000)/1000 : null;
  put("vita_altezza", whtr, whtr==null? (alt? "manca la vita" : "inserisci l'altezza") : String(whtr).replace(".",","));
  var hs=hrvStato(today());
  put("hrv7", hs&&hs.m7v, hs? (hs.m7v==null? "servono 3 notti in 7 giorni" : hs.m7v+" · fascia "+hs.basso+"-"+hs.alto) : "servono 14 notti in 60 giorni",
      !hs||hs.trend==null ? "na" : hs.trend==="sotto" ? "att" : "ok");
  var f7=mediaUltimi("rhr",7), fn=rhrNorma(today()), fsc=(f7&&fn)? Math.round((f7/fn-1)*100) : null;
  put("fc7", fsc, f7? Math.round(f7)+" bpm · norma "+fn : "–");
  var s7=mediaUltimi("sonno",7); put("sonno7", s7==null?null:r1(s7), s7==null? "–" : dec(r1(s7))+" h");
  var st7=mediaUltimi("stress",7); put("stress7", st7==null?null:r1(st7), st7==null? "–" : dec(r1(st7)));
  var rf7=mediaUltimi("refl",7); put("reflusso7", rf7==null?null:r1(rf7), rf7==null? "–" : dec(r1(rf7)));
  var dg=dolGiorni(7).filter(function(g){ return g.compilato; }), dm=dg.length? media(dg.map(function(g){ return g.max; })) : null;
  var ds=S.sess.filter(function(s){ return dataOk(s.date) && giorniDa(s.date)<14; }).map(function(s){ return dolMax(dolDi(s,"dolz","dol")); }).filter(function(v){ return v>0; });
  var dsMax=ds.length? Math.max.apply(null, ds) : null, zf=dolZoneFrequenti(14, 1)[0];
  put("dolore", dm==null? dsMax : r1(dm), (dm==null?"mattina –":"mattina "+dec(r1(dm)))+(dsMax==null?"":" · seduta max "+dsMax)+(zf? " · più spesso: "+zonaNome(zf.z).toLowerCase() : ""),
      (dsMax!=null && dsMax>5) ? "ko" : statoSoglia(D.dolore, dm==null? null : dm));
  var pw=S.ben.filter(function(b){ return b.passi; }).slice(-1)[0];
  put("passi", pw? pw.passi : null, pw? kfmt(pw.passi) : "–");
  var ip=S.ben.filter(function(b){ return b.ipo!=null && b.ipo!==""; }).slice(-1)[0];
  put("ipopnea", ip? +ip.ipo : null, ip? dec(ip.ipo)+"/h" : "–");
  var ml=mobLast(), dmax=null;
  if(ml) MOB.filter(function(t){ return t.bi; }).forEach(function(t){ var d=mobAsym(ml,t.k); if(d!==null) dmax=Math.max(dmax||0, Math.abs(d)); });
  put("mobilita", dmax, dmax==null? "–" : dec(dmax));
  var mat=0; for(var i=0;i<7;i++){ var dd=new Date(); dd.setDate(dd.getDate()-i); if(mattinaFatta(benOn(d2s(dd)))) mat++; }
  put("completezza", mat, mat+" su 7");
  var cm=mediaUltimi("camm",7); put("camminate", cm==null?null:r1(cm), cm==null? "–" : dec(r1(cm)));
  return out;
}
function giorniDa(s){ return Math.round((new Date().setHours(0,0,0,0)-s2d(s).getTime())/86400000); }

/* ---------- il cruscotto ---------- */
var STATO_COL={ok:"var(--ok)", att:"var(--amb)", ko:"var(--alert)", na:"var(--faint)"};
function cardCruscotto(){
  var val=kpiValori(), aree=[], h='<div class="card"><div class="between"><div class="eyebrow glow">Cruscotto</div>';
  var cont={ok:0,att:0,ko:0}; KPI.forEach(function(d){ var s=val[d.id].stato; if(cont[s]!=null) cont[s]++; });
  h+='<div class="xs" style="font-weight:700"><span style="color:var(--ok)">'+cont.ok+' ok</span> · <span style="color:var(--amb)">'+cont.att+'</span> · <span style="color:var(--alert)">'+cont.ko+'</span></div></div>';
  KPI.forEach(function(d){ if(aree.indexOf(d.area)<0) aree.push(d.area); });
  aree.forEach(function(a){
    h+='<div class="kar">'+esc(a)+'</div>';
    KPI.filter(function(d){ return d.area===a; }).forEach(function(d){
      var v=val[d.id];
      h+='<button class="krow" data-a="kpi" data-v="'+d.id+'"><i style="background:'+STATO_COL[v.stato]+'"></i>'+
         '<span class="kn">'+esc(d.nome)+'</span>'+kpiSpark(d.id)+'<span class="kv">'+esc(kpiBreve(d,v))+'</span></button>';
    });
  });
  h+='<div class="xs mut" style="margin-top:8px">Tocca una riga per la definizione, il bersaglio e la fonte. Grigio = dato non ancora sufficiente.</div></div>';
  return h;
}
/* il valore in poche cifre, per la riga del cruscotto */
function kpiBreve(d,v){
  if(v.v==null) return "–";
  var u=d.unita||"", x=v.v;
  if(d.id==="serie_gruppo") return x+"/7";
  if(d.id==="pendenza") return (x>0?"+":"")+kfmt(x)+" g/sett";
  if(d.id==="kcal") return (x>0?"+":"")+x+"%";
  if(d.id==="fc7") return String(v.txt).split(" · ")[0];
  if(d.id==="passi") return kfmt(x);
  if(d.id==="vita_altezza") return dec(x);
  if(u==="%") return x+"%";
  if(u.charAt(0)==="/") return dec(x)+u;
  return dec(x)+(u? " "+u : "");
}
function kpiSheet(id){
  var d=KPI.filter(function(x){ return x.id===id; })[0]; if(!d) return;
  var v=kpiValori()[id], fonti=(d.fonti||[d.fonte]).map(function(f){ return FONTI[f]; }).filter(Boolean);
  sheet('<div class="eyebrow">'+esc(d.area)+' · '+esc(d.freq)+'</div><h2 style="margin:4px 0 10px">'+esc(d.nome)+'</h2>'+
    '<div class="stat"><div class="v" style="color:'+STATO_COL[v.stato]+'">'+esc(v.txt)+'</div></div>'+
    '<div class="gsez"><div class="eyebrow glow">Andamento</div>'+kpiGrafico(id)+'</div>'+
    '<div class="gsez"><div class="eyebrow glow">Come si calcola</div><div class="sm">'+esc(d.come)+'</div></div>'+
    '<div class="gsez"><div class="eyebrow" style="color:var(--ok)">Bersaglio</div><div class="sm">'+esc(d.bersaglio)+'</div></div>'+
    '<div class="gsez"><div class="eyebrow amb">Fonte</div>'+fonti.map(function(f){
      return '<div class="sm">'+(f.u? '<a href="'+esc(f.u)+'" target="_blank" rel="noopener" style="color:var(--glow)">'+esc(f.t)+'</a>' : esc(f.t))+'</div>'; }).join("")+'</div>'+
    '<div class="xs mut" style="margin-top:12px">Chiave per il foglio e per il coach: <b>'+esc(d.id)+'</b> (scheda App_KPI).</div>'+
    '<button class="btn" style="margin-top:16px" data-a="x">Chiudi</button>');
}
/* righe per il foglio: definizione e valore attuale, una per KPI */
function kpiRows(){
  var val=kpiValori(), oggi=today();
  return KPI.map(function(d){ var v=val[d.id], f=FONTI[d.fonte]||{};
    return {k:d.id, area:d.area, nome:d.nome, unita:d.unita, frequenza:d.freq, come:d.come, bersaglio:d.bersaglio,
      fonte:f.t||"", link:f.u||"", valore:(v.v==null?"":v.v), testo:v.txt, stato:{ok:"ok",att:"attenzione",ko:"fuori",na:"dati insufficienti"}[v.stato], agg:oggi}; });
}

/* ---------- agenda: cosa registrare oggi, e quando ---------- */
function oraMin(){ var d=new Date(); return d.getHours()*60+d.getMinutes(); }
function hm(s){ var a=String(s||"0:0").split(":"); return (+a[0]||0)*60+(+a[1]||0); }
function orari(){ return Object.assign({mattina:"07:30", sera:"21:30", domenica:"18:00"}, S.orari||{}); }
function mattinaFatta(b){ return !!(b && (b.hrv||b.rhr||b.sonno||b.read||b.peso)); }
function seraFatta(b){ return !!(b && (b.refl!=null || b.stress!=null || b.mente!=null || b.camm!=null)); }
function simDue(){ var w=weekOf(today()); return w>=31 && (w-31)%4===0 && !(S.sim||[]).some(function(x){ return x.w===w; }); }
function agendaVoci(){
  var oggi=today(), b=benOn(oggi), now=oraMin(), o=orari(), dom=new Date().getDay()===0, w=weekOf(oggi), v=[];
  var pe=pianoDelGiorno(oggi);
  if(pe && pe.stato==="oggi") v.push({k:"seduta", t:"Seduta "+pe.d+" · "+PLAN[pe.d].name, q:(pe.ora||"")+" · "+({casa:"a casa",bande:"con le bande",corpo:"a corpo libero"}[pe.l]||""), d:PLAN[pe.d].ex.length+" esercizi, "+PLAN[pe.d].min+" minuti",
    fatto:false, dovuto: now>=hm(pe.ora||"07:30")-60, a:"seduta", m:pe.d});
  v.push({k:"mattina", t:"Benessere del mattino", q:"al risveglio · 1 minuto", d:"Peso, HRV, FC a riposo, sonno, dolori",
    fatto:mattinaFatta(b), dovuto: now>=hm(o.mattina)-90, a:"benm"});
  var g=cibDay(oggi), attesi=[["col",600],["sm",720],["pra",900],["sp",1080],["cen",1320]].filter(function(x){ return now>=x[1]; }).map(function(x){ return x[0]; });
  var regi=MEALS.filter(function(m){ return m.k!=="ex" && (g[m.k]||[]).length; }).length;
  var manca=attesi.filter(function(k){ return !(g[k]||[]).length; });
  v.push({k:"cibo", t:"Pasti", q:"dopo ogni pasto · 20 secondi", d: regi+" su 5"+(manca.length? " · manca "+manca.map(function(k){ return meal(k).n.toLowerCase(); }).join(", ") : ""),
    fatto: !manca.length && regi>0, dovuto: attesi.length>0, a:"cibo", m: manca[0]||"col"});
  v.push({k:"sera", t:"Benessere della sera", q:"prima di dormire · 30 secondi", d:"Reflusso, camminate, stress, testa",
    fatto:seraFatta(b), dovuto: now>=hm(o.sera)-90, a:"bens"});
  if(dom){
    v.push({k:"chiusura", t:"Chiusura della settimana", q:"domenica · 1 minuto", d:"Tre domande e i giorni delle sedute",
      fatto:!!(S.chiusure||{})[w], dovuto: now>=hm(o.domenica)-120, a:"chiusw"});
    var wb=S.ben.filter(function(x){ return x.w===w && (x.passi||x.ipo); })[0];
    v.push({k:"sett", t:"Riepilogo settimanale", q:"domenica · 2 numeri da Zepp", d:"Passi medi e indice di ipopnea",
      fatto:!!wb, dovuto: now>=hm(o.domenica)-120, a:"sett"});
  }
  var lm=ultimoValido(S.mis), gm=lm? giorniDa(lm.date) : 99;
  if(gm>=14) v.push({k:"misure", t:"Misure", q:"al mattino, a digiuno · 3 minuti", d:"Peso, vita, torace, braccio, coscia"+(lm?" · ultime "+gm+" giorni fa":""), fatto:false, dovuto:true, a:"mis"});
  if(S.mob && S.mob.length && mobDue()) v.push({k:"mob", t:"Test di mobilità", q:"dopo il riscaldamento · 5 minuti", d:"Quattro test, due lati", fatto:false, dovuto:true, a:"mob"});
  if(simDue()) v.push({k:"sim", t:"Check simmetria", q:"durante la seduta · 1 minuto", d:"Quattro domande sui due lati", fatto:false, dovuto:true, a:"sim"});
  if(!(S.profilo && S.profilo.altezza)) v.push({k:"altezza", t:"La tua altezza", q:"una volta sola", d:"Serve per il rapporto vita/altezza", fatto:false, dovuto:true, a:"profilo"});
  return v;
}
function agendaConta(){ return agendaVoci().filter(function(x){ return x.dovuto && !x.fatto; }).length; }
function cardAgenda(){
  var v=agendaVoci(), da=v.filter(function(x){ return x.dovuto && !x.fatto; }).length;
  var h='<div class="card agenda"><div class="between"><div class="eyebrow '+(da?"amb":"")+'">Da registrare oggi</div>'+
    '<div class="xs" style="font-weight:700;color:'+(da?"var(--amb)":"var(--ok)")+'">'+(da? da+" da fare" : "tutto fatto ✓")+'</div></div>';
  v.forEach(function(x){
    var st = x.fatto ? "fatto" : x.dovuto ? "ora" : "dopo";
    h+='<button class="ag '+st+'" data-a="ag" data-v="'+x.a+'"'+(x.m?' data-m="'+x.m+'"':'')+'>'+
       '<span class="agi">'+(x.fatto?"✓":x.dovuto?"●":"○")+'</span>'+
       '<span class="agt"><b>'+esc(x.t)+'</b><span>'+esc(x.q)+(x.fatto?"":" · "+esc(x.d))+'</span></span>'+
       '<span class="agq">'+(x.fatto?"fatto":x.dovuto?"Compila":"più tardi")+'</span></button>';
  });
  return h+'</div>';
}
function agendaApri(a, m){
  if(a==="benm") return formBen(today(), false, "mattina");
  if(a==="bens") return formBen(today(), false, "sera");
  if(a==="cibo") return formPasto(m||"col");
  if(a==="chiusw") return formChiusura();
  if(a==="sett") return formSett();
  if(a==="mis") return formMis();
  if(a==="mob") return formMob();
  if(a==="sim") return formSim();
  if(a==="profilo") return formProfilo();
  if(a==="seduta"){ V="oggi"; startSession(m, false, false, luogoOggi()); return; }
}
/* badge sull'icona dell'app (dove il sistema lo permette) */
function aggiornaBadge(){
  try{
    if(!navigator.setAppBadge) return;
    var n=agendaConta();
    if(n) navigator.setAppBadge(n).catch(function(){}); else if(navigator.clearAppBadge) navigator.clearAppBadge().catch(function(){});
  }catch(e){}
}

/* ---------- profilo: i pochi dati fissi ---------- */
function formProfilo(){
  var p=S.profilo||{}, pe=ultimoPeso();
  sheet('<div class="eyebrow">Profilo</div><h2 style="margin:4px 0 10px">Dati fissi</h2>'+
    '<label class="fld"><span class="eyebrow">Altezza (cm)</span><input type="number" inputmode="numeric" id="pAlt" value="'+(p.altezza||"")+'" placeholder="es. 170"></label>'+
    '<div class="xs mut" style="margin-top:6px">Serve al rapporto vita/altezza (NICE: sotto 0,5). Il peso arriva dalle pesate del mattino'+(pe?': ultimo '+dec(pe)+' kg':'')+'.</div>'+
    '<button class="btn pri" style="margin-top:14px" data-a="saveprof">Salva</button>'+
    '<button class="btn ghost" style="margin-top:8px" data-a="x">Annulla</button>');
}
async function saveProfilo(){
  var a=num(document.getElementById("pAlt").value);
  if(a!=null && (a<120 || a>220)){ toast("Altezza in centimetri, tra 120 e 220"); return; }
  S.profilo=Object.assign({}, S.profilo||{}, {altezza:a}); cfgTocca("profilo");
  var ok=await save(); closeSheet(); render(); if(SYNC.on()) doPush(false);
  toast(ok? "Profilo salvato" : "NON salvato: vedi la scheda Coach");
}
