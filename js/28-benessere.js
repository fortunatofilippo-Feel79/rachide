/* ============================================================
   BENESSERE — come stai, in un colpo d'occhio e con le ragioni
   Tre cose:
   1. un indice da 0 a 100 fatto di sei aree (recupero, testa,
      corpo, movimento, nutrizione, digestione e respiro), ognuna
      letta dai KPI che l'app calcola gia': verde vale 100, giallo
      55, rosso 15, senza dato non conta. Pesi uguali: e' una scelta
      del progetto, non una misura clinica.
   2. le letture incrociate: i tuoi dati messi uno accanto all'altro
      (le notti corte e l'HRV, l'alcol e il sonno, lo stress e il
      reflusso...). Compaiono solo con almeno 4 giornate per parte e
      una differenza che si vede; sono associazioni nei tuoi dati,
      non prove di causa.
   3. i suggerimenti: al massimo tre, dalle aree piu' deboli.
   ============================================================ */
var BENE_PUNTI={ok:100, att:55, ko:15};
var BENE_DOM=[
  {k:"recupero",  n:"Recupero",             kpi:["hrv7","fc7","sonno7"]},
  {k:"testa",     n:"Testa",                kpi:["stress7"], extra:"mente"},
  {k:"corpo",     n:"Corpo",                kpi:["dolore","mobilita","asimmetria","vita_altezza"]},
  {k:"movimento", n:"Movimento",            kpi:["aderenza","serie_gruppo","passi","camminate","svelta"]},
  {k:"cibo",      n:"Nutrizione",           kpi:["proteine","kcal","pendenza","giorni_cibo"]},
  {k:"digestione",n:"Digestione e respiro", kpi:["reflusso7","ipopnea"], extra:"resp"}
];
var BENE_MIN_N=4, BENE_GIORNI=60;

/* voci che non sono KPI del cruscotto: testa 1-5 e respirazione della sera */
function beneExtra(k){
  if(k==="mente"){ var m=mediaUltimi("mente",7); if(m==null) return null;
    return {n:"Come ti senti (1-5)", v:r1(m), txt:dec(r1(m))+" di media", stato: m>=3.5? "ok" : m>=2.5? "att" : "ko"}; }
  if(k==="resp"){ var sere=0, fatte=0;
    for(var i=0;i<7;i++){ var b=benOn(stoGiorno(i)); if(seraFatta(b)){ sere++; if(b.resp) fatte++; } }
    if(sere<3) return null;
    return {n:"Respirazione 4-7", v:fatte, txt:fatte+" sere su "+sere, stato: fatte>=sere*0.7? "ok" : fatte>=sere*0.4? "att" : "ko"}; }
  return null;
}
function beneIndice(){
  var val=kpiValori(), D={}; KPI.forEach(function(x){ D[x.id]=x; });
  var aree=BENE_DOM.map(function(d){
    var voci=d.kpi.map(function(id){ var v=val[id]; return {id:id, n:D[id]? D[id].nome : id, txt:v? v.txt : "–", stato:v? v.stato : "na"}; });
    if(d.extra){ var e=beneExtra(d.extra); if(e) voci.push({id:d.extra, n:e.n, txt:e.txt, stato:e.stato}); }
    var con=voci.filter(function(x){ return BENE_PUNTI[x.stato]!=null; });
    var p=con.length? Math.round(media(con.map(function(x){ return BENE_PUNTI[x.stato]; }))) : null;
    return {k:d.k, n:d.n, voci:voci, punti:p, stato: p==null? "na" : p>=80? "ok" : p>=50? "att" : "ko", letti:con.length};
  });
  var con2=aree.filter(function(a){ return a.punti!=null; });
  var idx=con2.length>=3? Math.round(media(con2.map(function(a){ return a.punti; }))) : null;
  return {indice:idx, aree:aree, lette:con2.length,
    titolo: idx==null? "Dati insufficienti" : idx>=80? "Stai bene" : idx>=60? "Abbastanza bene" : "Da sistemare"};
}
/* l'indice della settimana resta scritto: serve all'andamento e al coach */
function beneSegna(idx){
  if(idx==null) return;
  var w=weekOf(today()); S.beneSett=S.beneSett||{};
  if(S.beneSett[w]!==idx){ S.beneSett[w]=idx; Object.keys(S.beneSett).forEach(function(k){ if(+k<w-26) delete S.beneSett[k]; }); }
}

/* ---------- letture incrociate ---------- */
function beneGruppi(righe, cond, val){
  var A=[], B=[];
  righe.forEach(function(x){ var c=cond(x), v=val(x); if(c==null || v==null || isNaN(v)) return; (c? A : B).push(+v); });
  return {a:A.length? media(A) : null, b:B.length? media(B) : null, na:A.length, nb:B.length};
}
/* ora di fine cena (hh:mm): l'ultima voce di cena con l'ora */
function cenaOra(b){
  if(!b || !b.cibJ) return null;
  var g; try{ g=JSON.parse(b.cibJ); }catch(e){ return null; }
  var t=(g.cen||[]).map(function(v){ return v.t; }).filter(Boolean).sort();
  return t.length? t[t.length-1] : null;
}
function beneLetture(){
  var gg=S.ben.filter(function(b){ return dataOk(b.date) && giorniDa(b.date)>=0 && giorniDa(b.date)<BENE_GIORNI; });
  var per={}; gg.forEach(function(b){ per[b.date]=b; });
  var prima=function(b){ return per[d2s(new Date(s2d(b.date).getTime()-86400000))]||null; };
  var seduta=function(date){ return S.sess.filter(function(s){ return s.date===date && !isRest(s); })[0]||null; };
  var hrv=function(b){ return plaus("hrv", b.hrv)? b.hrv : null; }, son=function(b){ return plaus("sonno", b.sonno)? b.sonno : null; };
  var out=[], tg=cibTarget();
  var metti=function(g, soglia, rel, f){
    if(g.na<BENE_MIN_N || g.nb<BENE_MIN_N) return;
    var d=g.a-g.b, forza=rel? Math.abs(d)/Math.max(Math.abs(g.b), 0.0001) : Math.abs(d)/soglia;
    if(rel? forza<soglia : Math.abs(d)<soglia) return;
    var o=f(g, d); o.forza=rel? forza/soglia : forza; o.n=g.na+" giornate contro "+g.nb; out.push(o);
  };
  /* notti corte e HRV del mattino */
  metti(beneGruppi(gg, function(b){ var s=son(b); return s==null? null : s<SONNO_BASSO? true : s>=7? false : null; }, hrv), 0.07, true, function(g,d){
    return {t:"Notti corte e HRV", m:"Dopo le notti sotto "+sonnoTxt(SONNO_BASSO)+" la tua HRV è in media "+Math.round(g.a)+", dopo quelle da 7 ore in su "+Math.round(g.b)+"."+(d<0? " Il sonno è la prima leva del tuo recupero." : " Nei tuoi dati il sonno corto non abbassa l'HRV.")}; });
  /* alcol la sera e HRV, alcol e sonno */
  metti(beneGruppi(gg, function(b){ return !!b.alc; }, hrv), 0.07, true, function(g,d){
    return {t:"Alcol e HRV", m:"Dopo una sera con alcol l'HRV è in media "+Math.round(g.a)+", senza "+Math.round(g.b)+"."+(d<0? " Se il giorno dopo c'è una seduta pesante, conta." : "")}; });
  metti(beneGruppi(gg, function(b){ return !!b.alc; }, son), 0.4, false, function(g,d){
    return {t:"Alcol e sonno", m:"Con alcol la sera dormi in media "+sonnoTxt(g.a)+", senza "+sonnoTxt(g.b)+"."}; });
  /* stress della sera prima e sonno */
  metti(beneGruppi(gg, function(b){ var p=prima(b); return (!p || p.stress==null)? null : p.stress>=STRESS_ALTO; }, son), 0.4, false, function(g,d){
    return {t:"Stress e sonno", m:"Dopo una giornata con stress da "+STRESS_ALTO+" in su dormi "+sonnoTxt(g.a)+", altrimenti "+sonnoTxt(g.b)+"."+(d<0? " La respirazione 4-7 la sera è lo strumento che hai già nel piano." : "")}; });
  /* stress e reflusso nello stesso giorno */
  metti(beneGruppi(gg, function(b){ return b.stress==null? null : b.stress>=STRESS_ALTO; }, function(b){ return b.refl; }), 0.5, false, function(g,d){
    return {t:"Stress e reflusso", m:"Nei giorni di stress alto il reflusso è in media "+dec(r1(g.a))+" su 3, negli altri "+dec(r1(g.b))+"."}; });
  /* camminate dopo i pasti e reflusso */
  metti(beneGruppi(gg, function(b){ return b.camm==null? null : b.camm>=1; }, function(b){ return b.refl; }), 0.4, false, function(g,d){
    return {t:"Camminate e reflusso", m:"Nei giorni con almeno una camminata dopo i pasti il reflusso è "+dec(r1(g.a))+" su 3, senza "+dec(r1(g.b))+"."+(d<0? " Tienile: nei tuoi dati funzionano." : "")}; });
  /* grassi del giorno e reflusso */
  metti(beneGruppi(gg, function(b){ return b.cibG>0? b.cibG>=tg.g*1.25 : null; }, function(b){ return b.refl; }), 0.5, false, function(g,d){
    return {t:"Grassi e reflusso", m:"Nelle giornate oltre "+Math.round(tg.g*1.25)+" g di grassi il reflusso è "+dec(r1(g.a))+" su 3, nelle altre "+dec(r1(g.b))+"."}; });
  /* ora della cena e reflusso della notte dopo. Il reflusso si segna la sera e conta il giorno
     e la notte prima: la cena di oggi si legge nel reflusso di domani. Lo spartiacque e' la tua
     ora di cena tipica (mediana), cosi' i due gruppi esistono sempre. Linea guida ACG 2022:
     niente pasti 2-3 ore prima di coricarsi (raccomandazione debole). */
  var dopo=function(b){ return per[d2s(new Date(s2d(b.date).getTime()+86400000))]||null; };
  var oreCena=gg.map(function(b){ var o=cenaOra(b); return o==null? null : hm(o); }).filter(function(x){ return x!=null; });
  if(oreCena.length>=2*BENE_MIN_N){
    var medC=Math.round(mediana(oreCena)), medTxt=("0"+Math.floor(medC/60)).slice(-2)+":"+("0"+Math.round(medC%60)).slice(-2);
    /* le cene alla stessa ora della mediana vanno nel gruppo che rende le due parti piu' simili */
    var tardi=oreCena.filter(function(t){ return t>medC; }).length, presto=oreCena.filter(function(t){ return t<medC; }).length;
    var pariTardi = tardi<presto;
    metti(beneGruppi(gg, function(b){ var o=cenaOra(b); if(o==null) return null; var t=hm(o); return pariTardi? t>=medC : t>medC; },
      function(b){ var n=dopo(b); return n && n.refl!=null? n.refl : null; }), 0.4, false, function(g,d){
      return {t:"Ora della cena e reflusso", m:"Dopo le cene finite "+(pariTardi? "dalle " : "oltre le ")+medTxt+" (la tua ora tipica) il reflusso della notte dopo è "+dec(r1(g.a))+" su 3, dopo quelle più presto "+dec(r1(g.b))+" su 3."+
        (d>0? " Anticipare la cena è la leva più semplice: la linea guida ACG 2022 suggerisce 2-3 ore prima di coricarsi." : "")}; });
  }
  /* camminata svelta e HRV del mattino dopo (regola 76) */
  metti(beneGruppi(gg, function(b){ var p=prima(b); return (!p || p.svelta==null)? null : !!p.svelta; }, hrv), 0.07, true, function(g,d){
    return {t:"Camminata svelta e HRV", m:"Il mattino dopo una camminata svelta l'HRV è in media "+Math.round(g.a)+", dopo i giorni senza "+Math.round(g.b)+"."+(d>0? " Nei tuoi dati la regola 76 funziona: tienila." : " Per ora non si vede un effetto: l'allenamento aerobico agisce in settimane, non in un giorno.")}; });
  /* sonno e energia in seduta */
  metti(beneGruppi(gg, function(b){ var s=son(b); return s==null? null : s<SONNO_BASSO; }, function(b){ var s=seduta(b.date); return s && s.en? s.en : null; }), 0.5, false, function(g,d){
    return {t:"Sonno ed energia in seduta", m:"Nelle sedute dopo una notte corta segni energia "+dec(r1(g.a))+" su 5, nelle altre "+dec(r1(g.b))+"."+(d<0? " In quei giorni l'app ti propone di accorciare: conviene accettare." : "")}; });
  /* cibo del giorno prima e energia in seduta */
  metti(beneGruppi(gg, function(b){ var p=prima(b); if(!p || !(p.cibP||p.cibC||p.cibG) || cibStimato(p.date)) return null; return kcalGiorno(p)<tg.kcal*0.85; }, function(b){ var s=seduta(b.date); return s && s.en? s.en : null; }), 0.5, false, function(g,d){
    return {t:"Cibo ed energia in seduta", m:"Il giorno dopo aver mangiato sotto l'85% del target l'energia in seduta è "+dec(r1(g.a))+" su 5, altrimenti "+dec(r1(g.b))+"."}; });
  /* seduta e sonno della notte dopo */
  metti(beneGruppi(gg, function(b){ var p=prima(b); return p? !!seduta(p.date) : null; }, son), 0.4, false, function(g,d){
    return {t:"Allenamento e sonno", m:"La notte dopo una seduta dormi "+sonnoTxt(g.a)+", le altre "+sonnoTxt(g.b)+"."}; });
  /* come ti senti e sonno */
  metti(beneGruppi(gg, function(b){ var s=son(b); return s==null? null : s<SONNO_BASSO; }, function(b){ return b.mente; }), 0.5, false, function(g,d){
    return {t:"Sonno e testa", m:"Dopo una notte corta segni la testa a "+dec(r1(g.a))+" su 5, altrimenti "+dec(r1(g.b))+"."}; });
  return out.sort(function(a,b){ return b.forza-a.forza; });
}

/* ---------- suggerimenti ---------- */
var BENE_CONS={
  sonno7:    function(v){ return "Sonno a "+v.txt+" di media. Per sette sere porta avanti di 30 minuti l'ora in cui spegni gli schermi: è la leva che pesa di più sul recupero."; },
  hrv7:      function(){ return "HRV sotto la tua fascia sulla settimana: è una settimana da tenere, non da spingere. Guarda prima sonno e alcol, poi il carico."; },
  fc7:       function(){ return "FC a riposo sopra la tua norma: spesso precede un malanno o segue giorni carichi. Due giorni tranquilli e rileggi."; },
  stress7:   function(){ return "Stress alto in settimana: cinque minuti di respirazione 4-7 la sera e dieci minuti di camminata dopo pranzo, tutti i giorni."; },
  mente:     function(){ return "Ti segni giù di tono da più giorni. Alleggerisci la settimana (bastano due sedute per tenere) e, se dura oltre due settimane, parlane con il medico."; },
  dolore:    function(v){ return "Dolore: "+v.txt+". Portalo al fisioterapista con le date, che sono già nel foglio; in seduta l'app ti propone le alternative."; },
  mobilita:  function(){ return "La differenza fra i lati nei test di mobilità è sopra soglia: è materia per il fisioterapista, non da pareggiare da solo."; },
  asimmetria:function(){ return "Asimmetria fra sinistra e destra sopra il 10%: parti sempre dal lato debole e ferma l'altro allo stesso numero."; },
  vita_altezza:function(){ return "Rapporto vita/altezza sopra 0,5: tieni il surplus nella parte bassa del corridoio e ricontrolla alla prossima misura."; },
  aderenza:  function(){ return "Sedute sotto il piano: in Adatta la settimana segna i giorni veri e il tempo che hai. Meglio tre sedute da 30 minuti che una saltata."; },
  serie_gruppo:function(v){ return "Volume fuori dal range su qualche gruppo ("+v.txt.split("fuori: ")[1]+"): lo sistema l'adattamento della settimana, guardalo prima della prossima seduta."; },
  passi:     function(){ return "Passi sotto 8.000: una camminata di 15 minuti dopo pranzo e una dopo cena valgono circa 3.000 passi e aiutano anche il reflusso."; },
  svelta:    function(v){ return "Camminata svelta a "+v.txt+": la regola 76 ne chiede 3 a settimana. Mettila in calendario come una seduta, per esempio dopo il lavoro, almeno un'ora dopo il pranzo."; },
  camminate: function(){ return "Camminate dopo i pasti sotto il bersaglio: dieci minuti dopo cena sono quelli che contano di più per reflusso e glicemia."; },
  proteine:  function(v){ return "Proteine a "+v.txt+": aggiungi 25-30 g a colazione o uno spuntino proteico al pomeriggio, non tutto a cena."; },
  kcal:      function(v){ return "Calorie "+v.txt+": se sei sotto, la crescita si ferma prima che lo dicano i carichi; se sei sopra, guarda la vita alla prossima misura."; },
  pendenza:  function(v){ return "Peso fuori dal corridoio ("+v.txt.split(" · ")[0]+"): guarda la scheda Fabbisogno, la proposta sul target parte da lì."; },
  giorni_cibo:function(){ return "Poche giornate di cibo registrate: scrivi il pasto in una riga («pollo 200 g, riso 80») subito dopo mangiato, bastano venti secondi."; },
  reflusso7: function(){ return "Reflusso sopra il bersaglio: cena più leggera e almeno 2-3 ore prima di coricarti (linea guida ACG 2022, evidenza limitata); i grassi tienili nella prima parte della giornata."; },
  ipopnea:   function(){ return "Indice di ipopnea sopra 5 sul wearable: non è una diagnosi, ma è un andamento da mostrare al medico."; },
  resp:      function(){ return "Respirazione 4-7 fatta poche sere: legala a un gesto fisso, per esempio appena ti metti a letto."; }
};
function beneSuggerimenti(ix){
  ix=ix||beneIndice();
  var voci=[]; ix.aree.forEach(function(a){ a.voci.forEach(function(v){ if((v.stato==="ko"||v.stato==="att") && BENE_CONS[v.id]) voci.push({id:v.id, area:a.n, stato:v.stato, punti:a.punti, v:v}); }); });
  voci.sort(function(a,b){ return (a.stato==="ko"?0:1)-(b.stato==="ko"?0:1) || a.punti-b.punti; });
  /* una per area, al massimo tre: tre cose si fanno, dieci no */
  var viste={}, out=[];
  voci.forEach(function(x){ if(out.length>=3 || viste[x.area]) return; viste[x.area]=1; out.push({area:x.area, stato:x.stato, m:BENE_CONS[x.id](x.v)}); });
  return out;
}
/* nei giorni senza seduta: che cosa fa bene oggi */
function beneSuggerimentiOggi(st){
  var out=[];
  if(st && st.lvl>=1) out.push({t:"Oggi recupera.", m:"Venti minuti di camminata a passo tranquillo, il blocco scoliosi del riscaldamento (respirazione costale, cat-cow) e a letto presto."});
  else out.push({t:"Giorno senza seduta.", m:"Una camminata dopo i pasti e cinque minuti di blocco scoliosi (respirazione costale, cat-cow) tengono viva l'abitudine senza togliere recupero."});
  return out;
}

/* tre livelli di lettura: lo stato di oggi decide la seduta; questa riga dice come va
   la settimana (il dettaglio e' in Corpo); KPI e diagnosi sono il dettaglio per il coach */
function rigaBenessereSett(){
  var ix=beneIndice(); beneSegna(ix.indice);
  if(ix.indice==null) return "";
  var col = ix.indice>=80? "var(--ok)" : ix.indice>=60? "var(--amb)" : "var(--alert)";
  var deb=ix.aree.filter(function(a){ return a.punti!=null && a.stato!=="ok"; }).sort(function(a,b){ return a.punti-b.punti; })[0];
  var prec=(S.beneSett||{})[weekOf(today())-1];
  return '<button class="card flat" data-a="nav" data-v="corpo" style="display:block;width:100%;text-align:left;padding:12px 14px">'+
    '<div class="between"><div class="eyebrow">La settimana · benessere</div><div class="ch" style="color:var(--dim)">›</div></div>'+
    '<div class="sm" style="margin-top:4px"><b style="color:'+col+'">'+ix.indice+'/100</b> · '+esc(ix.titolo.toLowerCase())+
    (prec!=null? ' <span class="xs mut">('+(ix.indice-prec>=0?"+":"")+(ix.indice-prec)+' sulla scorsa)</span>' : '')+
    (deb? ' · da guardare: <b>'+esc(deb.n.toLowerCase())+'</b>' : ' · nessuna area fuori posto')+'</div></button>';
}

/* ---------- la scheda ---------- */
function cardBenessere(){
  var ix=beneIndice(); beneSegna(ix.indice);
  var col = ix.indice==null? "var(--faint)" : ix.indice>=80? "var(--ok)" : ix.indice>=60? "var(--amb)" : "var(--alert)";
  var w=weekOf(today()), prec=(S.beneSett||{})[w-1];
  var h='<div class="card" style="border-color:'+col+'"><div class="between"><div class="eyebrow" style="color:'+col+'">Benessere della settimana</div>'+
    '<button class="lnk xs" data-a="beneinfo">Come lo calcolo?</button></div>'+
    '<div class="between" style="margin-top:6px;align-items:flex-end"><div><span class="num" style="font-size:32px;color:'+col+'">'+(ix.indice==null? "–" : ix.indice)+'</span><small class="mut" style="font-weight:600"> su 100</small></div>'+
    '<div style="text-align:right"><div class="sm" style="font-weight:700">'+ix.titolo+'</div>'+
    (prec!=null && ix.indice!=null? '<div class="xs mut">settimana scorsa '+prec+' ('+(ix.indice-prec>=0?"+":"")+(ix.indice-prec)+')</div>' : '')+'</div></div>';
  ix.aree.forEach(function(a){
    var c=STATO_COL[a.stato];
    h+='<button class="bnrow" data-a="benearea" data-v="'+a.k+'"><span class="bnn">'+esc(a.n)+'</span>'+
       '<span class="bnbar"><i style="width:'+(a.punti==null? 0 : a.punti)+'%;background:'+c+'"></i></span>'+
       '<span class="bnv" style="color:'+c+'">'+(a.punti==null? "–" : a.punti)+'</span></button>';
  });
  if(ix.indice==null) h+='<div class="xs mut" style="margin-top:8px">Servono dati in almeno tre aree: il benessere del mattino e della sera sono i primi da compilare.</div>';
  var sg=beneSuggerimenti(ix);
  if(sg.length){
    h+='<div class="eyebrow" style="margin-top:14px">Cosa fare questa settimana</div>';
    sg.forEach(function(s,i){ h+='<div class="flag '+(s.stato==="ko"?"stop":"disc")+'" style="margin-top:8px"><b>'+(i+1)+'</b><div><b>'+esc(s.area)+'.</b> '+esc(s.m)+'</div></div>'; });
  } else if(ix.indice!=null) h+='<div class="xs" style="margin-top:10px;color:var(--ok)">Nessuna area fuori posto: continua così.</div>';
  var lt=beneLetture().slice(0,4);
  h+='<div class="eyebrow" style="margin-top:14px">I tuoi dati letti insieme</div>';
  if(lt.length){ lt.forEach(function(l){ h+='<div class="gsez" style="margin-top:8px"><div class="sm"><b>'+esc(l.t)+'.</b> '+esc(l.m)+' <span class="xs mut">('+esc(l.n)+')</span></div></div>'; });
    h+='<div class="xs mut" style="margin-top:8px">Sono associazioni nei tuoi ultimi '+BENE_GIORNI+' giorni, non prove di causa: servono a sapere dove guardare.</div>'; }
  else h+='<div class="xs mut" style="margin-top:6px">Ancora niente da incrociare: servono almeno '+BENE_MIN_N+' giornate per parte (per esempio 4 notti corte e 4 lunghe) negli ultimi '+BENE_GIORNI+' giorni.</div>';
  return h+'</div>';
}
function beneArea(k){
  var ix=beneIndice(), a=ix.aree.filter(function(x){ return x.k===k; })[0]; if(!a) return;
  sheet('<div class="eyebrow glow">Benessere</div><h2 style="margin:4px 0 10px">'+esc(a.n)+(a.punti==null? "" : " · "+a.punti+" su 100")+'</h2>'+
    '<div class="card" style="padding:2px 12px">'+a.voci.map(function(v){
      var kp=KPI.some(function(x){ return x.id===v.id; });
      return '<'+(kp? 'button data-a="kpi" data-v="'+v.id+'"' : 'div')+' class="krow"><i style="background:'+STATO_COL[v.stato]+'"></i><span class="kn">'+esc(v.n)+'</span><span class="kv">'+esc(v.txt)+'</span></'+(kp?'button':'div')+'>'; }).join("")+'</div>'+
    '<div class="xs mut" style="margin-top:8px">Verde vale 100, giallo 55, rosso 15; il grigio non conta. Tocca una riga per la definizione, il bersaglio e la fonte.</div>'+
    '<button class="btn" style="margin-top:14px" data-a="x">Chiudi</button>');
}
function beneInfo(){
  sheet('<div class="eyebrow glow">Benessere</div><h2 style="margin:4px 0 8px">Come lo calcolo</h2>'+
    '<div class="sm">È la media di sei aree. Ogni area è la media dei suoi indicatori: verde vale 100, giallo 55, rosso 15. Un indicatore senza dati non conta, e servono almeno tre aree con dati.</div>'+
    BENE_DOM.map(function(d){ return '<div class="gsez"><div class="eyebrow">'+esc(d.n)+'</div><div class="sm">'+d.kpi.map(function(id){ var x=KPI.filter(function(y){ return y.id===id; })[0]; return x? esc(x.nome)+' ('+esc(x.bersaglio)+')' : id; }).join(" · ")+
      (d.extra==="mente"? " · come ti senti, 1-5 (da 3,5 in su)" : d.extra==="resp"? " · respirazione 4-7 (7 sere su 10)" : "")+'</div></div>'; }).join("")+
    '<div class="gsez"><div class="eyebrow">Cosa non è</div><div class="sm">Non è una misura clinica: i pesi uguali e i tre gradini sono una scelta del progetto. Serve a vedere in un numero se la settimana va nella direzione giusta e quale area guardare per prima. Bersagli e fonti di ogni indicatore sono nel cruscotto.</div></div>'+
    '<button class="btn" style="margin-top:14px" data-a="x">Chiudi</button>');
}
document.addEventListener("click", function(ev){
  var el=ev.target.closest("[data-a]"); if(!el) return;
  if(el.dataset.a==="benearea"){ beneArea(el.dataset.v); return; }
  if(el.dataset.a==="beneinfo"){ beneInfo(); return; }
});
