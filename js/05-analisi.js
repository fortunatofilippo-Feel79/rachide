/* ---------- KPI settimanali ---------- */
/* un riposo programmato è una sessione con mod "Riposo": non conta come
   allenamento fatto, ma abbassa il bersaglio settimanale da 4 a 4-riposi */
function isRest(s){ return s && s.mod==="Riposo"; }
function weeks(){ return [...new Set(S.sess.map(s=>s.w))].sort((a,b)=>a-b); }
function kpi(w){
  var ss=S.sess.filter(s=>s.w===w && !isRest(s)), ls=S.log.filter(r=>r.w===w);
  var rest=S.sess.filter(s=>s.w===w && isRest(s)).length;
  var target=Math.max(1, 4-rest);
  var dur=ss.filter(s=>s.min).map(s=>s.min), en=ss.filter(s=>s.en).map(s=>s.en);
  var ton=ls.reduce((a,r)=>a + r.load*(r.reps.reduce((x,y)=>x+y,0)), 0);
  var tot=ls.filter(r=>!meta(r.ex).sec).length, top=ls.filter(r=>r.top && !meta(r.ex).sec).length;
  /* serie per gruppo: un esercizio unilaterale è UNA serie per il muscolo,
     non due. Le righe sinistra e destra descrivono lo stesso lavoro. */
  var grp={};
  ls.forEach(function(r){ var g=meta(r.ex).g;
    grp[g]=(grp[g]||0) + (r.side ? r.reps.length/2 : r.reps.length); });
  Object.keys(grp).forEach(function(g){ grp[g]=Math.round(grp[g]); });
  /* asimmetria: solo esercizi a ripetizioni loggati per lato, e solo quando
     nella stessa sessione ci sono entrambi i lati. Gli esercizi a tempo
     (side plank 60/40) sono asimmetrici per scelta e falsavano il dato. */
  var sx=0,dx=0, coppie={};
  ls.forEach(function(r){
    if(!r.side || meta(r.ex).sec) return;
    var k=r.date+"|"+r.ex, c=coppie[k]||(coppie[k]={S:null,D:null});
    c[r.side]=(c[r.side]||0)+r.reps.reduce((a,b)=>a+b,0);
  });
  Object.keys(coppie).forEach(function(k){ var c=coppie[k];
    if(c.S!==null && c.D!==null){ sx+=c.S; dx+=c.D; } });
  var asim = (sx+dx)? Math.round(Math.abs(sx-dx)/((sx+dx)/2)*100) : 0;
  /* lato piu' duro (dall'11/10): una risposta per esercizio unilaterale */
  var duro={S:0,D:0,U:0}, vdu={};
  ls.forEach(function(r){ if(!r.side || !r.duro) return; var k=r.date+"|"+r.ex; if(vdu[k]) return; vdu[k]=1;
    if(duro[r.duro]!==undefined) duro[r.duro]++; });
  /* cedimenti sui composti, un conteggio per esercizio e giorno */
  var rirN=0, rir0=0, vce={};
  ls.forEach(function(r){ if(meta(r.ex).t!=="comp") return; var k=r.date+"|"+r.ex; if(vce[k]) return; vce[k]=1;
    if(r.rir===null || r.rir===undefined) return; rirN++; if(r.rir===0) rir0++; });
  var b=S.ben.filter(x=>x.w===w && x.refl!==null);
  var m=S.mis.filter(x=>x.w===w)[0];
  return {w:w, n:ss.length, rest:rest, target:target, ader:Math.round(ss.length/target*100),
    dur:dur.length?Math.round(dur.reduce((a,b)=>a+b,0)/dur.length):null,
    en:en.length?+(en.reduce((a,b)=>a+b,0)/en.length).toFixed(1):null,
    top: tot? Math.round(top/tot*100):null, ton:Math.round(ton), grp:grp, asim:asim, duro:duro, rir0:rir0, rirN:rirN,
    warm: ss.filter(s=>s.warm).length, sig: ss.filter(s=>s.sig).length,
    refl: b.length? +(b.reduce((a,x)=>a+x.refl,0)/b.length).toFixed(1) : null,
    peso: m?m.peso:null, vt: (m&&m.vita&&m.torace)? +(m.vita/m.torace).toFixed(3):null};
}

/* ============================================================
   BENESSERE → DECISIONI
   I dati del wearable non servono a niente se restano un elenco.
   Qui diventano contesto: un calo di ripetizioni su un giorno con
   HRV a terra, poco sonno o alcol è recupero, non carico da tagliare.
   ============================================================ */
function benOn(date){ return S.ben.filter(function(b){ return b.date===date; })[0] || null; }
/* Ogni modifica a una giornata (cibo o benessere) la segna come "da inviare".
   Resta segnata finche' un invio al foglio non va a buon fine: fino ad allora
   una rilettura dal foglio non puo' sovrascriverla con la versione vecchia.
   benTs ricorda quando e' stata toccata l'ultima volta, anche dopo l'invio:
   serve a scartare una rilettura partita PRIMA della modifica. */
function benTouch(date){
  var t=Date.now();
  if(!S.dirtyBen) S.dirtyBen={}; if(!S.benTs) S.benTs={};
  S.dirtyBen[date]=t; S.benTs[date]=t;
}
function benDaInviare(date){ return !!(S.dirtyBen && S.dirtyBen[date]); }
/* mediana HRV di riferimento: gli altri giorni con HRV, esclusa la data in esame,
   così un giorno storto non abbassa la propria soglia */
function hrvBase(exclDate){
  var v=S.ben.filter(function(b){ return b.hrv && b.date!==exclDate && plaus("hrv", b.hrv); }).map(function(b){ return b.hrv; });
  if(v.length<3) return null;
  v.sort(function(a,b){ return a-b; });
  var m=Math.floor(v.length/2);
  return v.length%2 ? v[m] : Math.round((v[m-1]+v[m])/2);
}
/* valori plausibili: un numero fuori scala (FC 31) e' un errore di battitura,
   non un dato. Resta salvato com'e', ma non entra nelle mediane del recupero. */
var PLAUS={rhr:[35,100], hrv:[10,200], sonno:[3,12]};
function plaus(field, v){ var r=PLAUS[field]; return !r || (v>=r[0] && v<=r[1]); }
/* controllo prima di salvare il benessere: chiede conferma, non blocca */
function controlloBen(r){
  var a=[];
  if(r.rhr!=null && !plaus("rhr",r.rhr)) a.push("FC a riposo "+r.rhr+" (di solito tra 35 e 100)");
  if(r.hrv!=null && !plaus("hrv",r.hrv)) a.push("HRV "+r.hrv+" (di solito tra 10 e 200)");
  if(r.sonno!=null && !plaus("sonno",r.sonno)) a.push("Sonno "+r.sonno+" h (di solito tra 3 e 12)");
  if(r.peso!=null){
    var ps=S.ben.filter(function(b){ return b.peso>0 && b.date!==r.date && dataOk(b.date); })
      .sort(function(x,y){ return s2d(y.date)-s2d(x.date); }).slice(0,7).map(function(b){ return b.peso; });
    if(ps.length>=3){ var md=mediana(ps); if(Math.abs(r.peso-md)>2) a.push("Peso "+r.peso+" kg, "+dec(r1(Math.abs(r.peso-md)))+" kg lontano dalle ultime pesate"); }
  }
  return a;
}
/* mediana di riferimento per un campo qualsiasi, esclusa la data in esame */
function medBase(field, exclDate){
  var v=S.ben.filter(function(b){ return b[field] && b.date!==exclDate && plaus(field, b[field]); }).map(function(b){ return b[field]; });
  if(v.length<3) return null;
  v.sort(function(a,b){ return a-b; });
  var m=Math.floor(v.length/2);
  return v.length%2 ? v[m] : Math.round((v[m-1]+v[m])/2);
}
function rhrBase(exclDate){ return medBase("rhr", exclDate); }

/* ============================================================
   RECUPERO — HRV notturna incrociata con FC a riposo
   Da sola l'HRV è ambigua. Con la FC a riposo non lo è più:
   HRV giù + FC su = carico sistemico vero.
   HRV giù + FC normale = probabile rumore di misura.
   ============================================================ */
var SONNO_BASSO=6.5, STRESS_ALTO=2;
function recovery(date){
  var b=benOn(date); if(!b) return {lvl:0, parts:[], hint:""};
  var parts=[], lvl=0, hb=hrvBase(date), rb=rhrBase(date);
  var bHrv = plaus("hrv", b.hrv) ? b.hrv : null, bRhr = plaus("rhr", b.rhr) ? b.rhr : null;
  var hrvLow  = !!(bHrv && hb && bHrv < hb*0.80);
  var rhrHigh = !!(bRhr && rb && bRhr > rb*1.07);
  var rhrOk   = !!(bRhr && rb && !rhrHigh);
  if(b.alc){ parts.push("alcol la sera prima"); lvl=Math.max(lvl,1); }
  if(hrvLow){ parts.push("HRV "+b.hrv+" (norma ~"+hb+")"); lvl=Math.max(lvl,1); }
  if(rhrHigh){ parts.push("FC riposo "+b.rhr+" (norma ~"+rb+")"); lvl=Math.max(lvl,1); }
  if(b.read!=null && b.read<70){ parts.push("readiness "+b.read); lvl=Math.max(lvl,1); }
  /* soglie come da Lettura dati e Jarvis (decisione del 18/10/2026): sonno sotto 6,5 h, stress da 2 */
  var sonnoCorto = b.sonno!=null && b.sonno<SONNO_BASSO, stressAlto = b.stress!=null && b.stress>=STRESS_ALTO;
  if(sonnoCorto){ parts.push("sonno "+b.sonno+"h"); lvl=Math.max(lvl,1); }
  if(stressAlto){ parts.push("stress "+b.stress); lvl=Math.max(lvl,1); }
  var hint="";
  /* livello 2 = due segnali insieme. La coppia stress+sonno viene prima del «rumore di misura» dell'HRV:
     se c'è anche quella, il livello 2 non deve sparire. Mai un invito a scendere di carico. */
  if(hrvLow && rhrHigh){ lvl=2;
    hint="HRV giù e FC a riposo su insieme: è carico sistemico, non rumore di misura. Tieni i carichi fermi e non cercare i massimali."; }
  else if(stressAlto && sonnoCorto){ lvl=2;
    hint="Stress alto e sonno corto nello stesso giorno: accorcia la seduta, non tagliare il carico. Il volume si recupera, l'abitudine no."; }
  else if(hrvLow && rhrOk){
    hint="HRV giù ma FC a riposo nella norma: probabilmente è rumore di misura. Allenati normale e rileggi domani."; }
  else if(rhrHigh && !hrvLow){
    hint="FC a riposo sopra la norma con HRV tenuta: spesso precede un malanno. Tieni i carichi fermi per una seduta."; }
  return {lvl:lvl, parts:parts, hint:hint};
}
function recoveryNote(date){ return recovery(date).parts.join(" · "); }
/* recupero basso di OGGI (livello 2): conta solo la riga benessere di oggi, mai il dato di ieri.
   Serve a non proporre salite di carico quel giorno; non propone mai di scendere. */
function recoveryOggi(){
  var b=benOn(today()); if(!b) return null;
  var r=recovery(today());
  return r.lvl>=2 ? r : null;
}

/* ============================================================
   MODULO A — PESO E SPINTA
   Poche mattine a settimana per via delle trasferte: niente media
   mobile, che si rompe sui buchi. Regressione sui punti reali con
   finestra che si allarga finché non ha abbastanza dati.
   La prima pesata dopo 2+ notti fuori non entra: è sodio, non massa.
   ============================================================ */
var PESO_TGT=[150,250];   /* g a settimana */
var PESO_MINPT=6, PESO_WMAX=28;
/* Un rientro non e' semplicemente "dopo un buco": e' un buco PIU' un salto
   di peso che il trend non giustifica. Escludere ogni pesata preceduta da
   tre giorni di silenzio buttava via anche i punti buoni, e con tre pesate
   a settimana restava zero. Il confronto e' sempre con l'ultima pesata
   accettata, non con quella precedente che potrebbe essere gia' scartata. */
function weightPoints(){
  var pts=S.ben.filter(function(b){ return b.peso>0 && dataOk(b.date); })
    .map(function(b){ return {date:b.date, t:s2d(b.date).getTime(), kg:b.peso}; })
    .sort(function(a,b){ return a.t-b.t; });
  var ref=null;
  pts.forEach(function(p){
    if(!ref){ p.skip=false; ref=p; return; }
    var gap=Math.round((p.t-ref.t)/86400000);
    var atteso=0.35 + 0.03*gap;              /* ritenzione plausibile, non crescita */
    p.skip = gap>=3 && (p.kg-ref.kg) >= atteso;
    p.gap=gap;
    if(!p.skip) ref=p;
  });
  return pts;
}
function fitLine(sel){
  var n=sel.length, t0=sel[0].t, sx=0,sy=0,sxx=0,sxy=0;
  sel.forEach(function(p){ var x=(p.t-t0)/86400000, y=p.kg; sx+=x; sy+=y; sxx+=x*x; sxy+=x*y; });
  var den=n*sxx-sx*sx;
  if(!den) return null;
  var m=(n*sxy-sx*sy)/den, q=(sy-m*sx)/n;
  return {m:m, q:q, t0:t0};
}
function weightSlope(endTs){
  var all=weightPoints(), now=endTs||new Date().setHours(23,59,59,999);
  if(endTs) all=all.filter(function(p){ return p.t<=endTs; });
  if(!all.length) return {ok:false, n:0, days:0, all:all, why:"nessuna pesata registrata"};
  for(var win=14; win<=PESO_WMAX; win+=7){
    var sel=all.filter(function(p){ return !p.skip && (now-p.t)/86400000 <= win; });
    var last = win>=PESO_WMAX;
    /* ultima spiaggia: se i soli punti puliti non bastano ma con i rientri si
       arriva al minimo, calcola comunque e dichiaralo. Un numero dichiarato
       sporco e' piu' utile di un "dato insufficiente" che non arriva mai. */
    var noisy=false;
    if(last && sel.length<PESO_MINPT){
      var tutti=all.filter(function(p){ return (now-p.t)/86400000 <= win; });
      if(tutti.length>=PESO_MINPT){ sel=tutti; noisy=true; }
    }
    if(sel.length>=PESO_MINPT || last){
      if(sel.length<PESO_MINPT)
        return {ok:false, n:sel.length, days:win, all:all,
                why:sel.length+" pesat"+(sel.length===1?"a":"e")+" valid"+(sel.length===1?"a":"e")+" in "+win+" giorni: ne servono "+PESO_MINPT};
      var f=fitLine(sel);
      if(!f) return {ok:false, n:sel.length, days:win, all:all, why:"pesate tutte lo stesso giorno"};
      var days=Math.round((sel[sel.length-1].t-sel[0].t)/86400000)+1;
      var g=Math.round(f.m*7*1000);
      var st = g<PESO_TGT[0] ? "sotto" : g>PESO_TGT[1] ? "sopra" : "dentro";
      return {ok:true, g:g, n:sel.length, days:days, win:win, sel:sel, all:all, fit:f, stato:st, noisy:noisy,
              skipped: all.filter(function(p){ return p.skip && (now-p.t)/86400000<=win; }).length};
    }
  }
  return {ok:false, n:0, days:0, all:all, why:"dati insufficienti"};
}

/* ============================================================
   MODULO B — MOBILITÀ
   Quattro test ripetibili, ogni 28 giorni. I due bilaterali sono
   separati sx/dx: su una curva a S la differenza fra i lati dice
   più del valore assoluto.
   ============================================================ */
var MOB=[
  {k:"cav", n:"Dorsiflessione caviglia", u:"cm", bi:true, up:true,
   how:"In piedi davanti al muro, piede perpendicolare. Avvicina il ginocchio al muro tenendo il tallone a terra. Misura la distanza alluce-muro alla massima flessione ancora pulita."},
  {k:"tor", n:"Rotazione toracica", u:"°", bi:true, up:true,
   how:"Sdraiato sul fianco, anche e ginocchia a 90° bloccate, braccia tese davanti. Apri il braccio alto verso il pavimento opposto senza staccare le ginocchia. Stima i gradi raggiunti dal braccio."},
  {k:"spa", n:"Mani dietro la schiena", u:"cm", bi:true, up:false,
   how:"Una mano sopra la spalla, l'altra dal basso. Misura la distanza fra le punte delle dita. Il lato indicato è quello del braccio ALTO. Meno centimetri = meglio."},
  {k:"cat", n:"Catena posteriore", u:"cm", bi:false, up:true,
   how:"Seduto a terra, gambe tese, ginocchia bloccate. Misura quanto arrivano le dita rispetto alla pianta dei piedi: negativo se non ci arrivi, positivo se le superi."}
];
function mobLast(){ return ultimoValido(S.mob); }
function mobDue(){
  var l=mobLast(); if(!l) return true;
  return Math.round((new Date().setHours(0,0,0,0)-s2d(l.date))/86400000) >= 28;
}
function mobAsym(rec, k){
  if(!rec) return null;
  var a=rec[k+"_s"], b=rec[k+"_d"];
  if(a===null||a===undefined||b===null||b===undefined) return null;
  return +(a-b).toFixed(1);
}

/* ============================================================
   MODULO D — ADERENZA
   La catena è settimanale, non giornaliera: una giornata saltata
   non rompe niente, così non scatta l'effetto "tanto ho già rotto".
   ============================================================ */
function weekDone(w){
  var ss=S.sess.filter(function(s){ return s.w===w; });
  var real=ss.filter(function(s){ return !isRest(s); }).length;
  var rp=ss.filter(isRest).length;
  return {real:real, target:Math.max(1,4-rp), ok:real>=Math.max(1,4-rp)};
}
function streak(){
  var wNow=weekOf(today()), c=0, cur=weekDone(wNow).ok;
  for(var w=(cur?wNow:wNow-1); w>=PLAN_W0-12; w--){
    if(weekDone(w).ok) c++; else break;
  }
  return {n:c, curOpen:!cur};
}

/* ============================================================
   CARICHI CONGELATI
   Durante una fase di stabilizzazione (deficit, recupero, rientro
   da infortunio) i suggerimenti di aumento sono rumore. Il freeze
   li spegne fino a una settimana scelta, senza toccare i dati.
   ============================================================ */
function frozen(){ return !!(S.freeze && S.freeze.until && weekOf(today())<=S.freeze.until); }

/* ---------- diagnosi: adeguatezza di carichi ed esercizi ---------- */
var TGT={Petto:[10,16],Dorso:[10,16],Spalle:[10,16],Bicipiti:[10,16],Tricipiti:[10,16],Gambe:[10,18],Core:[6,12]};
function diagnose(){
  var out=[], ws=weeks(), lastFull = ws.filter(function(w){
    if(w<PLAN_W0) return false;
    var real=S.sess.filter(s=>s.w===w && !isRest(s)).length;
    var rest=S.sess.filter(s=>s.w===w && isRest(s)).length;
    return real+rest>=4; }).pop();
  /* 1. stallo o carico troppo alto */
  var seen={};
  Object.keys(PLAN).forEach(function(d){
    PLAN[d].ex.forEach(function(e){
      if(seen[e.n]||e.sec) return; seen[e.n]=1;
      var h=hist(e.n); if(h.length<3) return;
      var dates=[...new Set(h.map(r=>r.date))].slice(-3);
      if(dates.length<3) return;
      var rows=dates.map(d2=>h.filter(r=>r.date===d2)[0]);
      var sameLoad = rows.every(r=>r.load===rows[0].load) && rows[0].load>0;
      var neverTop = rows.every(r=>!r.top);
      var lastDate = dates[dates.length-1], rec = recoveryNote(lastDate);
      var mt=meta(e.n), alTetto = !!(mt.cap && rows[0].load>=mt.cap);
      if(sameLoad && neverTop) out.push({k:"stallo", t:e.n,
        m: alTetto ? "Tre sessioni a "+rows[0].load+" kg, che è il tetto fissato, senza chiudere il top del range. Non scendere: tieni il carico, recupero di 2 minuti e punta alle ripetizioni."
                   : "Tre sessioni a "+rows[0].load+" kg senza mai chiudere il top del range. Il carico è sopra la capacità attuale: scendi di 2 kg e ricostruisci."
          + (rec? " ⚠ Recupero l'ultima volta: "+rec+". Il calo può venire da lì, non dal carico — verifica su un giorno riposato prima di scendere." : "")});
      var hiRir = rows.filter(r=>r.rir!==null && r.rir>=3).length;
      if(hiRir>=2) out.push({k:"leggero", t:e.n,
        m:"RIR 3 o più su due sessioni: non è allenante. Sali di carico o passa alla variante successiva."});
      var last=rows[rows.length-1];
      if(last.reps.length>=3){
        var drop = last.reps[0]-last.reps[last.reps.length-1];
        if(drop>=3) out.push({k:"crollo", t:e.n,
          m:"Ultima sessione "+last.reps.join("-")+": perdi "+drop+" ripetizioni dalla prima all'ultima serie. Prima allunga il recupero, poi valuta il carico."
            + (rec? " ⚠ Quel giorno: "+rec+". Prima di toccare il carico, rifai la seduta su un giorno con recupero pieno." : "")});
      }
    });
  });
  /* 2. volume per gruppo — solo su una settimana piena del piano corrente */
  if(!lastFull) out.push({k:"attesa", t:"Volume non ancora valutabile",
    m:"Serve una settimana completa (4 sessioni) sul Piano Unico v5. Poi il confronto con i target diventa affidabile."});
  if(lastFull){
    var k=kpi(lastFull);
    Object.keys(TGT).forEach(function(g){
      var v=k.grp[g]||0, t=TGT[g];
      if(v<t[0]) out.push({k:"volume", t:g, m:"Settimana "+lastFull+": "+v+" serie, sotto il minimo di "+t[0]+"."});
      if(v>t[1]) out.push({k:"volume", t:g, m:"Settimana "+lastFull+": "+v+" serie, sopra il massimo di "+t[1]+". Toglile da qui, non aggiungerle altrove."});
    });
    if(k.dur && k.dur>70) out.push({k:"durata", t:"Durata media "+k.dur+" min · settimana "+lastFull,
      m:"Sopra il tuo tetto di 60-70 minuti. Di solito è tempo morto fra le serie: oltre ~90 secondi non aggiunge ipertrofia (Singer 2024). Usa il timer e cambia i dischi dentro il recupero, non dopo."});
    if(k.asim>10) out.push({k:"asim", t:"Asimmetria "+k.asim+"% · settimana "+lastFull, m:"Differenza fra ripetizioni sx e dx. Pareggia sempre sul lato debole."});
  }
  /* 3b. grassi e reflusso: la correlazione che giustifica il tracciamento */
  var gr=[], gl=[];
  S.ben.forEach(function(b){
    if(b.refl==null || !(b.cibG>0)) return;
    (b.cibG/BLK.g >= BLK_TGT.g+1.5 ? gr : gl).push(b.refl);
  });
  if(gr.length>=3 && gl.length>=3){
    var mA=gr.reduce(function(x,y){return x+y;},0)/gr.length;
    var mB=gl.reduce(function(x,y){return x+y;},0)/gl.length;
    if(mA-mB >= 0.6) out.push({k:"comp", t:"Grassi e reflusso \u00b7 reflusso "+mA.toFixed(1)+" contro "+mB.toFixed(1),
      m:"Nelle giornate sopra "+(BLK_TGT.g+1.5)+" blocchi di grassi il reflusso medio \u00e8 pi\u00f9 alto ("+gr.length+" giornate contro "+gl.length+"). Non \u00e8 una prova di causa, ma \u00e8 il primo posto dove guardare."});
  }
  /* 3. segnali articolari */
  var sig=S.sess.filter(s=>s.sig).slice(-3);
  if(sig.length) out.push({k:"segnale", t:"Ultimo segnale articolare: "+sig[sig.length-1].date,
    m:sig[sig.length-1].note||"Registrato nel tracker."});
  /* 4. composizione */
  var m2=S.mis.filter(x=>x.vita&&x.torace).slice(-2);
  if(m2.length===2){
    var a=m2[0].vita/m2[0].torace, b=m2[1].vita/m2[1].torace;
    if(b>a+0.005 && m2[1].peso>=m2[0].peso) out.push({k:"comp", t:"Vita/Torace "+b.toFixed(3),
      m:"Salito da "+a.toFixed(3)+" mentre il peso non scendeva. Se si conferma alla prossima misura, il surplus è troppo aggressivo."});
  }
  /* 5. riscaldamento — sull'ultima settimana con sessioni, non sull'ultima completa,
     e sempre dicendo di quale settimana si parla */
  var wLast = ws.length ? ws[ws.length-1] : null;
  if(wLast){
    var kk=kpi(wLast);
    if(kk.warm<kk.n) out.push({k:"warm", t:"Riscaldamenti "+kk.warm+"/"+kk.n+" · settimana "+wLast,
      m: wLast<31 ? "Le sessioni prima della settimana 31 vengono dal vecchio tracker, dove il riscaldamento non era tracciato: probabilmente l'hai fatto, non risulta soltanto."
                  : "Il riscaldamento contiene il blocco scoliosi. Se scende, lo perdi senza accorgertene."});
  }
  /* 6. spinta: uno stallo su un corpo in deficit non e' un problema di carico */
  var sl=weightSlope();
  if(sl.ok){
    var stalli=out.filter(function(x){ return x.k==="stallo"||x.k==="crollo"; }).length;
    if(sl.stato==="sotto" && !sl.noisy){
      out.unshift({k:"spinta", t:"Spinta "+(sl.g>0?"+":"")+sl.g+" g/sett \u00b7 sotto il corridoio",
        m: (stalli? "Ci sono "+stalli+" segnalazion"+(stalli>1?"i":"e")+" di stallo o crollo qui sotto. Con la pendenza sotto il minimo la causa piu' probabile e' alimentare, non il carico. Regola del Piano alimentare: le calorie si ricalibrano solo se la pendenza resta fuori corridoio per 2 settimane di fila; alla seconda lettura sotto, +200-250 kcal al giorno. Intanto non scendere di peso sui manubri."
                  : "Nessuno stallo aperto per ora, ma sotto "+PESO_TGT[0]+" g/sett la crescita si ferma prima che i numeri lo mostrino. Se e' la seconda settimana di fila, +200-250 kcal al giorno; se e' la prima, aspetta la prossima lettura.")
           + " Calcolata su "+sl.n+" pesate in "+sl.days+" giorni."});
    }
    if(sl.stato==="sopra" && !sl.noisy) out.push({k:"spinta", t:"Spinta +"+sl.g+" g/sett \u00b7 sopra il corridoio",
      m:"Oltre "+PESO_TGT[1]+" g/sett la quota di grasso sale. Controlla vita/torace alla prossima misura: se e' salito anche quello, taglia il surplus."});
  }
  /* 7. mobilita': la differenza fra i lati, non il valore assoluto */
  var ml=mobLast();
  if(ml){
    MOB.filter(function(t){ return t.bi; }).forEach(function(t){
      var d=mobAsym(ml,t.k);
      if(d!==null && Math.abs(d)>=2) out.push({k:"mob", t:t.n+" \u00b7 differenza "+(d>0?"+":"")+dec(d)+" "+t.u,
        m:"Sinistra "+dec(ml[t.k+"_s"])+", destra "+dec(ml[t.k+"_d"])+". Su una curva a S l'asimmetria conta piu' del valore assoluto: portala al fisioterapista invece di cercare di pareggiarla da solo."});
    });
  }
  if(mobDue() && S.mob && S.mob.length) out.push({k:"attesa", t:"Test di mobilita' scaduti",
    m:"Sono passati almeno 28 giorni dall'ultima rilevazione."});
  /* 9. cedimento sui composti (regola dell'11/10) */
  var cN=0, c0=0;
  ws.slice(-2).forEach(function(w){ var k2=kpi(w); cN+=k2.rirN; c0+=k2.rir0; });
  if(c0>0) out.push({k:"rir", t:"Cedimento su "+c0+" composti su "+cN+" · ultime 2 settimane",
    m:"Sui composti si chiude a RIR 1-2: fermati quando la ripetizione rallenta o la schiena vuole cambiare forma. Il top raggiunto a cedimento non fa salire il carico."});
  /* 10. lato piu' duro: lo stesso lato in 3 risposte sulle ultime 5 */
  var dr=[], vd={};
  S.log.slice().sort(function(a,b){ return s2d(a.date)-s2d(b.date); }).forEach(function(r){
    if(!r.side || !r.duro) return; var k=r.date+"|"+r.ex; if(vd[k]) return; vd[k]=1; dr.push(r); });
  dr=dr.slice(-5);
  if(dr.length>=3){
    var nS=dr.filter(function(r){ return r.duro==="S"; }).length, nD=dr.filter(function(r){ return r.duro==="D"; }).length;
    var lato = nS>=3? "sinistro" : nD>=3? "destro" : "";
    if(lato) out.push({k:"asim", t:"Lato "+lato+" più duro in "+Math.max(nS,nD)+" esercizi su "+dr.length,
      m:"Annotalo per il fisioterapista insieme agli altri segnali di asimmetria. Non pareggiare da solo con serie in più sul lato debole."});
  }
  /* 8. stress: il carico che il sensore non vede */
  var bs=S.ben.filter(function(b){ return b.stress!=null; }).slice(-14);
  if(bs.length>=7){
    var alti=bs.filter(function(b){ return b.stress>=2; }).length;
    if(alti >= bs.length*0.5) out.push({k:"stress", t:"Stress \u2265 2 su "+alti+" giorni su "+bs.length,
      m:"Meta' o piu' delle giornate registrate. In questa condizione il recupero fra le sedute e' piu' lento a parita' di carico: e' il momento di tenere i carichi fermi, non di aggiungere volume."});
  }
  return out;
}

/* ============================================================
   MODULO V3 — 11/10/2026
   Undici modifiche decise l'11/10:
   1 RIR a parole e regola sui composti · 2 lati sx/dx e lato piu' duro
   3 piano e stato nel foglio · 4 una progressione alla volta
   5 seduta un esercizio per schermata · 6 orologio e recupero che avvisa
   7 Oggi piu' corto · 8 benessere piu' veloce, casa/fuori casa
   9 record e bacheca · 10 mappa dei muscoli · 11 chiusura della settimana
   ============================================================ */

/* ---------- utilita' ---------- */
function media(a){ return a.length? a.reduce(function(x,y){ return x+y; },0)/a.length : null; }
function mediana(a){ if(!a.length) return null; var b=a.slice().sort(function(x,y){ return x-y; }), m=Math.floor(b.length/2);
  return b.length%2? b[m] : (b[m-1]+b[m])/2; }
function vuotoSe(v){ return (v===null||v===undefined||(typeof v==="number"&&isNaN(v)))? "" : v; }
function settimanaDate(w){
  var m=new Date(W0.getTime()); m.setDate(m.getDate()+(w-24)*7);
  var s=new Date(m.getTime()); s.setDate(s.getDate()+6);
  return {dal:d2s(m), al:d2s(s), fine:new Date(s.getFullYear(),s.getMonth(),s.getDate(),23,59,59,999).getTime()};
}

/* ---------- 2 · lati ---------- */
function duroTxt(d){
  if(!d) return ""; var t=(d.S||0)+(d.D||0)+(d.U||0); if(!t) return "";
  var p=[]; if(d.S) p.push("sx "+d.S); if(d.D) p.push("dx "+d.D); if(d.U) p.push("= "+d.U);
  return p.join(" · ");
}
function duroBreve(d){
  if(!d) return "–"; var S=d.S||0, D=d.D||0, U=d.U||0;
  if(!(S+D+U)) return "–"; return S>D? "sx "+S : D>S? "dx "+D : "=";
}
/* ogni lato riparte dal suo ultimo valore: se sono uguali e' perche' lo erano davvero */
function lastSideRep(n, side, fb){
  var h=hist(n, side); if(!h.length) return fb;
  var r=h[h.length-1].reps; return (r && r[0])? r[0] : fb;
}

/* ---------- 4 · una progressione alla volta ---------- */
var BANDKG={gialla:4.5, blu:9.1, verde:13.6, nera:18.1, rossa:22.7};
var VARIANTI={
  "Plank":{next:"Plank braccia avanzate", come:"Gomiti 10-15 cm più avanti delle spalle, glutei stretti, bacino fermo. Riparti da 3×20 s."},
  "Plank braccia avanzate":{next:"Plank con braccio avanti alternato", come:"Dal plank sui gomiti allunghi un braccio avanti per 2 s e cambi lato; il bacino non deve ruotare. Riparti da 3×6 per lato."},
  "Push-up":{next:"Push-up piedi rialzati", come:"Piedi su un rialzo di 30-40 cm, corpo in linea, espira mentre spingi. Riparti da 3×8."},
  "Push-up stretti":{next:"Push-up stretti piedi rialzati", come:"Mani sotto le spalle, gomiti lungo i fianchi, piedi su un rialzo basso. Riparti da 3×8."},
  "Pike push-up":{next:"Pike push-up piedi rialzati", come:"Piedi sul bordo del letto, anche sopra le spalle, la testa scende fra le mani. Riparti da 3×6."},
  "Bulgarian split squat 3s":{next:"Bulgarian split squat 3s con pausa", come:"Discesa in 3 s più 2 s fermo in basso; il lato che scende meno decide la profondità. Riparti da 3×8 per lato."},
  "Hip hinge una gamba":{next:"Hip hinge una gamba con banda", come:"Banda gialla sotto il piede d'appoggio, maniglie in mano: tira di più quando risali. Riparti da 3×8 per lato."},
  "Dead bug":{next:"Dead bug con pausa 3 s", come:"Braccio e gamba opposti si allungano e restano fermi 3 s a 5 cm da terra; la lombare resta schiacciata. Riparti da 3×6 per lato."}
};
function comeSi(e, r){
  var lato = e.u? " per lato" : "";
  if(e.b && r.next) return "Banda "+r.next+" ("+String(BANDKG[r.next]).replace(".",",")+" kg) al posto della "+lastBand(e.n,e.b)+
    ": stessa esecuzione. Riparti da "+e.lo+" ripetizioni"+lato+" e risali.";
  if(r.next && e.lo===e.hi) return "Stessa tecnica con "+r.next+" kg. L'obiettivo resta "+e.s+"×"+e.hi+lato+
    ": se all'inizio ne fai meno va bene, resti a "+r.next+" kg finché non le chiudi per due sedute"+(meta(e.n).t==="comp"?" a RIR 1-2":"")+".";
  if(r.next) return "Stessa tecnica con "+r.next+" kg. Riparti da "+e.lo+" ripetizioni"+lato+" e risali fino a "+e.hi+
    ": quando chiudi il top per due sedute"+(meta(e.n).t==="comp"?" a RIR 1-2":"")+", si sale ancora.";
  var v=VARIANTI[e.n]; if(v) return v.come;
  return "Variante successiva da definire col coach.";
}
var _PGC=null;
function progressioni(){
  if(_PGC) return _PGC;
  var cand=[], visti={}, now=new Date().setHours(23,59,59,999);
  ["A","B","C","D","T1","T2"].forEach(function(d){ (PLAN && PLAN[d] ? PLAN[d].ex : []).forEach(function(e){
    if(visti[e.n]) return; visti[e.n]=1;
    if(e.asym) return;                                   /* side plank 60/40: e' una prescrizione, non una scala */
    var r=readiness(e); if(!r.ready || r.cap) return;
    var h=histAll(e.n); if(!h.length) return;
    if((now - s2d(h[h.length-1].date).getTime())/86400000 > 21) return;   /* fermo da 3 settimane: non conta */
    var t=meta(e.n).t, ord={comp:0, compl:1, iso:2, core:3}[t]; if(ord===undefined) ord=2;
    var why=r.why, v=VARIANTI[e.n];
    if(!r.next && !e.b){ if(v) why="→ "+v.next; else ord+=10; }
    cand.push({n:e.n, day:d, why:why, next:r.next, ord:ord, ultima:h[h.length-1].date, come:comeSi(e, r)});
  }); });
  cand.sort(function(a,b){ return a.ord-b.ord || s2d(a.ultima)-s2d(b.ultima) || (a.n<b.n?-1:1); });
  var fz=frozen(), rbasso=recoveryOggi(), ferma=fz||!!rbasso;
  _PGC={scelta: ferma? null : (cand[0]||null), coda: ferma? cand : cand.slice(1), frozen:fz, recupero:rbasso};
  return _PGC;
}
function cardProg(){
  var pg=progressioni(), h="";
  if(pg.frozen){
    h+='<div class="card" style="border-color:var(--amb);border-style:dashed;background:rgba(224,164,88,.06)">'+
       '<div class="between"><div class="eyebrow amb">Carichi congelati · fino alla settimana '+S.freeze.until+'</div>'+
       '<button class="btn sm ghost" data-a="unfreeze">Sblocca</button></div>'+
       (S.freeze.note?'<div class="xs mut" style="margin-top:6px">'+esc(S.freeze.note)+'</div>':"")+
       (pg.coda.length?'<div class="xs mut" style="margin-top:8px">In coda: '+esc(pg.coda.map(function(u){ return u.n; }).join(", "))+'.</div>'
                      :'<div class="xs mut" style="margin-top:8px">Nessuna progressione in coda.</div>')+'</div>';
    return h;
  }
  if(pg.recupero){
    h+='<div class="card" style="border-color:var(--amb)">'+
       '<div class="eyebrow amb">Carichi fermi · oggi</div>'+
       '<div class="sm" style="margin-top:6px"><b>Recupero basso: '+esc(pg.recupero.parts.join(" · "))+'.</b> Oggi non salire di carico: la progressione riparte quando il recupero torna nella norma.</div>'+
       (pg.coda.length?'<div class="xs mut" style="margin-top:8px">Pronte, in attesa: '+esc(pg.coda.map(function(u){ return u.n; }).join(", "))+'.</div>':'')+'</div>';
    return h;
  }
  if(!pg.scelta) return "";
  var s=pg.scelta;
  h+='<div class="card prog"><div class="between"><div class="eyebrow" style="color:var(--ok)">Prossima progressione</div>'+
     '<div class="xs mut">giorno '+esc(s.day)+'</div></div>'+
     '<h2 style="margin:6px 0 2px;font-size:16px">'+esc(s.n)+'</h2>'+
     '<div class="sm" style="color:var(--ok);font-weight:700">'+esc(s.why)+'</div>'+
     '<div class="sm mut" style="margin-top:6px">'+esc(s.come)+'</div>'+
     (pg.coda.length?'<div class="xs mut" style="margin-top:8px">Una alla volta. In coda: '+esc(pg.coda.map(function(x){ return x.n; }).join(", "))+'.</div>':'')+
     '</div>';
  return h;
}

/* ---------- 3 · piano e stato nel foglio ---------- */
function pianoRows(){
  var out=[], pg=progressioni(), oggi=today();
  ["A","B","C","D","T1","T2"].forEach(function(d){ if(!PLAN || !PLAN[d]) return; PLAN[d].ex.forEach(function(e,i){
    var m=meta(e.n), r=readiness(e);
    var prog = (pg.scelta && pg.scelta.n===e.n) ? "SCELTA: "+pg.scelta.why :
               r.ready ? (r.cap? "tetto: "+r.why : (pg.recupero? "fermo oggi (recupero basso): " : "in coda: ")+r.why) : (r.cedimento? "top raggiunto a cedimento" : "");
    out.push({id:d+"|"+e.n, day:d, ord:i+1, ex:e.n, gruppo:m.g, serie:e.s, lo:e.lo, hi:e.hi,
      load:(e.b||m.sec)? "" : suggestLoad(e), band: e.b? lastBand(e.n, e.b) : "",
      uni:e.u?"Sì":"", tempo:m.sec?"Sì":"", tetto:m.cap||"", attesa:e.hold||"", prog:prog,
      note:e.tip||"", agg:oggi});
  }); });
  return out;
}
function statoRows(){
  var wNow=weekOf(today()), ws=weeks().filter(function(w){ return w>=PLAN_W0; });
  if(ws.indexOf(wNow)<0) ws.push(wNow);
  ws=ws.slice(-12);
  var pg=progressioni(), oggiFine=new Date().setHours(23,59,59,999), dg=null;
  return ws.map(function(w){
    var k=kpi(w), sd=settimanaDate(w), bb=S.ben.filter(function(b){ return b.w===w && dataOk(b.date); });
    var sl=weightSlope(Math.min(sd.fine, oggiFine));
    var pes=bb.filter(function(b){ return b.peso>0; }).map(function(b){ return b.peso; });
    var cib=bb.filter(function(b){ return (b.cibP||0)+(b.cibC||0)+(b.cibG||0)>0; });
    var ch=(S.chiusure||{})[w]||{}, cur=(w===wNow);
    if(cur && !dg) dg=diagnose();
    var son=bb.filter(function(b){ return b.sonno; }).map(function(b){ return b.sonno; });
    var sonF=bb.filter(function(b){ return b.sonno && b.sede==="Fuori"; }).map(function(b){ return b.sonno; });
    return {w:w, dal:sd.dal, al:sd.al, sedute:k.n, bersaglio:k.target, riposi:k.rest,
      min:vuotoSe(k.dur), en:vuotoSe(k.en), top:vuotoSe(k.top), ton:k.ton, duro:duroTxt(k.duro),
      rir0: k.rirN? k.rir0+"/"+k.rirN : "",
      peso: pes.length? r1(media(pes)) : "", peso_g: sl.ok? sl.g : "",
      kcal: cib.length? Math.round(media(cib.map(function(b){ return 4*(b.cibP||0)+4*(b.cibC||0)+9*(b.cibG||0); }))) : "",
      prot: cib.length? Math.round(media(cib.map(function(b){ return b.cibP||0; }))) : "",
      carb: cib.length? Math.round(media(cib.map(function(b){ return b.cibC||0; }))) : "",
      grassi: cib.length? Math.round(media(cib.map(function(b){ return b.cibG||0; }))) : "",
      hrv: vuotoSe(mediana(bb.filter(function(b){ return b.hrv; }).map(function(b){ return b.hrv; }))),
      rhr: vuotoSe(mediana(bb.filter(function(b){ return b.rhr; }).map(function(b){ return b.rhr; }))),
      sonno: son.length? r1(media(son)) : "", sonno_fuori: sonF.length? r1(media(sonF)) : "",
      rec_bassi: bb.filter(function(b){ return recovery(b.date).lvl>=1; }).length,
      prog: (cur && pg.scelta)? pg.scelta.n+": "+pg.scelta.why : (cur && pg.recupero)? "carichi fermi oggi: recupero basso" : "",
      diagnosi: cur? dg.map(function(x){ return x.t; }).join(" | ").slice(0,900) : "",
      bene:ch.bene||"", cambia:ch.cambia||"",
      piano_sett: (ch.giorni&&ch.giorni.length)? ch.giorni.join(" ")+(ch.mom?" · "+ch.mom:"") : "",
      agg:today()};
  });
}

/* ---------- 6 · orologio della seduta e recupero che avvisa ---------- */
function sessEta(){
  var d=S.draft; if(!d) return {late:false};
  var p=PLAN[d.day], sec=0;
  if(d.warm && !d.warm.every(Boolean)) sec += 360*(1 - d.warm.filter(Boolean).length/d.warm.length);
  d.ex.forEach(function(e,i){
    var def=e.def||p.ex[i]; if(!def) return;
    var m=meta(e.n), left=Math.max(0, (def.s||0)-e.sets.length);
    var dur = m.sec ? (def.hi||40)*(def.u?2:1) : (def.u?70:40);
    sec += left*((REST[m.t]||60)+dur);
  });
  if(rest){ var lr=(rest.end-Date.now())/1000; if(lr>0) sec+=lr; }
  var end=Date.now()+sec*1000, tot=(end-d.t0)/60000;
  return {end:end, tot:tot, late: tot > (d.rid ? RIDOTTA_MIN : (p.min||60))+10};
}
function clockTxt(){
  var d=S.draft; if(!d) return "";
  var el=Math.floor((Date.now()-d.t0)/60000), e=sessEta(), f=new Date(e.end);
  return el+"′ · fine "+String(f.getHours()).padStart(2,"0")+":"+String(f.getMinutes()).padStart(2,"0");
}
var _AC=null;
function suonoPronto(){
  try{
    if(!_AC){ var C=window.AudioContext||window.webkitAudioContext; if(!C) return; _AC=new C(); }
    if(_AC.state==="suspended") _AC.resume();
  }catch(e){}
}
function bip(n){
  try{
    if(!_AC) return; var t=_AC.currentTime, k=n||1;
    for(var i=0;i<k;i++){
      var o=_AC.createOscillator(), g=_AC.createGain(), t0=t+i*0.22;
      o.type="sine"; o.frequency.value = k===3? [660,880,1100][i] : (k===2? 660 : 880);
      g.gain.setValueAtTime(0.0001,t0); g.gain.exponentialRampToValueAtTime(0.22,t0+0.02);
      g.gain.exponentialRampToValueAtTime(0.0001,t0+0.18);
      o.connect(g); g.connect(_AC.destination); o.start(t0); o.stop(t0+0.2);
    }
  }catch(e){}
}

/* ---------- 9 · record ---------- */
function caricoChiave(r){ return r.band ? BANDS.indexOf(r.band)+1 : (r.load||0); }
function caricoTxt(load, band){ return band ? "banda "+band : (load? load+" kg" : "corpo libero"); }
/* la bacheca si ricava dallo storico: niente da salvare, niente da sincronizzare */
function prBoard(){
  var per={}, out=[];
  var righe=S.log.filter(function(r){ return !meta(r.ex).sec && r.reps && r.reps.length && dataOk(r.date); })
    .slice().sort(function(a,b){ return s2d(a.date)-s2d(b.date); });
  var giorni={};
  righe.forEach(function(r){
    var k=r.date+"|"+r.ex, g=giorni[k]||(giorni[k]={date:r.date, ex:r.ex, L:caricoChiave(r), band:r.band, load:r.load, best:null});
    var mx=Math.max.apply(null, r.reps);
    g.best = (g.best===null)? mx : Math.min(g.best, mx);   /* unilaterale: vale il lato piu' debole */
  });
  Object.keys(giorni).map(function(k){ return giorni[k]; })
    .sort(function(a,b){ return s2d(a.date)-s2d(b.date); })
    .forEach(function(g){
      var p=per[g.ex];
      if(!p){ p=per[g.ex]={maxL:g.L, rep:{}}; p.rep[g.L]=g.best; return; }   /* la prima volta e' la base */
      if(g.L>p.maxL && g.best>0){ out.push({date:g.date, ex:g.ex, tipo:"carico", txt:caricoTxt(g.load,g.band)+" × "+g.best}); p.maxL=g.L; }
      else if(p.rep[g.L]!==undefined && g.best>p.rep[g.L]){ out.push({date:g.date, ex:g.ex, tipo:"rip", txt:caricoTxt(g.load,g.band)+" × "+g.best}); }
      if(p.rep[g.L]===undefined || g.best>p.rep[g.L]) p.rep[g.L]=g.best;
    });
  return out.sort(function(a,b){ return s2d(b.date)-s2d(a.date); });
}
function recordLive(e, def){
  if(e.prDone || meta(e.n).sec) return null;
  var val = def.u? Math.min(e.cur.S, e.cur.D) : e.cur.v; if(!val) return null;
  var L = def.b? BANDS.indexOf(e.band)+1 : (e.load||0);
  var h=histAll(e.n).filter(function(r){ return r.reps && r.reps.length; }); if(!h.length) return null;
  var maxL=Math.max.apply(null, h.map(caricoChiave));
  var best=0; h.forEach(function(r){ if(caricoChiave(r)===L) best=Math.max(best, Math.max.apply(null, r.reps)); });
  e.sets.forEach(function(s){ best=Math.max(best, def.u? Math.min(s.S,s.D) : s.v); });
  var txt=e.n+" · "+caricoTxt(e.load, def.b? e.band : "")+" × "+val;
  if(L>maxL && val>=(def.lo||1)){ e.prDone=true; return {tipo:"carico", txt:txt}; }
  if(best>0 && val>best){ e.prDone=true; return {tipo:"rip", txt:txt}; }
  return null;
}
function festeggia(rec){
  try{
    var o=document.createElement("div"); o.className="prb";
    var dots=""; for(var i=0;i<14;i++) dots+='<i style="--a:'+Math.round(i*360/14)+'deg"></i>';
    o.innerHTML='<div class="prc">'+dots+'<div class="prt"><div class="eyebrow" style="color:var(--amb)">Nuovo record'+
      (rec.tipo==="carico"?" di carico":"")+'</div><div class="prv">'+esc(rec.txt)+'</div></div></div>';
    document.body.appendChild(o); bip(3);
    var via=function(){ if(o.parentNode) o.parentNode.removeChild(o); };
    setTimeout(function(){ o.classList.add("via"); }, 2300);
    setTimeout(via, 2800);
    o.addEventListener("click", via);
  }catch(e){}
}
function cardRecord(){
  var pr=prBoard(); if(!pr.length) return "";
  var lim=Date.now()-30*86400000, mese=pr.filter(function(x){ return s2d(x.date).getTime()>=lim; }).length;
  var h='<div class="card"><div class="between"><div class="eyebrow amb">Bacheca dei record</div>'+
        '<div class="xs" style="font-weight:700;color:var(--amb)">'+mese+' negli ultimi 30 giorni</div></div>';
  pr.slice(0,8).forEach(function(x){
    h+='<div class="vrow"><div class="badge" style="color:var(--amb);border-color:rgba(224,164,88,.5)">'+(x.tipo==="carico"?"↑":"★")+'</div>'+
       '<div class="vtxt"><b>'+esc(x.ex)+'</b><span class="xs mut">'+esc(x.txt)+' · '+x.date.slice(0,5)+'</span></div></div>';
  });
  h+='<div class="xs mut" style="margin-top:8px">★ più ripetizioni allo stesso carico · ↑ carico mai usato prima. '+pr.length+' record in tutto.</div></div>';
  return h;
}

/* ---------- 10 · mappa dei muscoli ---------- */
function mappaMuscoli(grp, inCorso){
  var col=function(g){
    var v=grp[g]||0, t=TGT[g]; if(!t) return "var(--surf2)";
    if(!v) return inCorso? "var(--surf2)" : "rgba(212,93,93,.42)";
    return v<t[0]? "rgba(212,93,93,.78)" : v>t[1]? "rgba(224,164,88,.88)" : "rgba(127,176,105,.88)";
  };
  var P=function(d,c){ return '<path d="'+d+'" fill="'+c+'" stroke="var(--bg)" stroke-width="1.5"/>'; };
  var R=function(x,y,w,h,rx,c){ return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+rx+'" fill="'+c+'" stroke="var(--bg)" stroke-width="1.5"/>'; };
  var E=function(x,y,rx,ry,c){ return '<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="'+c+'" stroke="var(--bg)" stroke-width="1.5"/>'; };
  var N="var(--surf2)";
  var base=function(cx){
    return '<circle cx="'+cx+'" cy="20" r="12" fill="'+N+'"/>'+R(cx-5,30,10,9,3,N)+
      R(cx-30,38,60,84,16,N)+R(cx-26,112,52,20,9,N)+
      R(cx-47,94,11,40,5,N)+R(cx+36,94,11,40,5,N);
  };
  var fx=78, bx=222, s='<svg class="mm" viewBox="0 0 300 228" role="img" aria-label="Serie della settimana per gruppo muscolare">';
  /* fronte */
  s+=base(fx);
  s+=R(fx-26,44,24,25,9,col("Petto"))+R(fx+2,44,24,25,9,col("Petto"));
  s+=E(fx-34,47,10,9,col("Spalle"))+E(fx+34,47,10,9,col("Spalle"));
  s+=R(fx-46,57,13,36,6,col("Bicipiti"))+R(fx+33,57,13,36,6,col("Bicipiti"));
  s+=R(fx-15,72,30,38,7,col("Core"));
  s+=R(fx-24,130,21,50,9,col("Gambe"))+R(fx+3,130,21,50,9,col("Gambe"));
  s+=R(fx-22,183,16,30,7,N)+R(fx+6,183,16,30,7,N);
  /* retro */
  s+=base(bx);
  s+=P("M"+(bx-28)+",44 Q"+bx+",36 "+(bx+28)+",44 L"+(bx+23)+",104 Q"+bx+",113 "+(bx-23)+",104 Z", col("Dorso"));
  s+=E(bx-34,47,10,9,col("Spalle"))+E(bx+34,47,10,9,col("Spalle"));
  s+=R(bx-46,57,13,36,6,col("Tricipiti"))+R(bx+33,57,13,36,6,col("Tricipiti"));
  s+=E(bx-12,124,13,11,col("Gambe"))+E(bx+12,124,13,11,col("Gambe"));
  s+=R(bx-24,136,21,44,9,col("Gambe"))+R(bx+3,136,21,44,9,col("Gambe"));
  s+=R(bx-22,183,16,30,7,col("Gambe"))+R(bx+6,183,16,30,7,col("Gambe"));
  s+='<text class="lb" x="'+fx+'" y="226" text-anchor="middle">FRONTE</text><text class="lb" x="'+bx+'" y="226" text-anchor="middle">RETRO</text>';
  return s+'</svg>';
}

/* ---------- 8 · benessere ---------- */
function benIeri(dt){
  var t=s2d(dt).getTime();
  return S.ben.filter(function(b){ return dataOk(b.date) && s2d(b.date).getTime()<t; })
    .sort(function(a,b){ return s2d(b.date)-s2d(a.date); })[0] || null;
}
function casaFuori(){
  var lim=Date.now()-60*86400000, c=[], f=[], hc=[], hf=[];
  S.ben.forEach(function(b){
    if(!b.sede || !dataOk(b.date) || s2d(b.date).getTime()<lim) return;
    if(b.sede==="Fuori"){ if(b.sonno) f.push(b.sonno); if(b.hrv) hf.push(b.hrv); }
    else { if(b.sonno) c.push(b.sonno); if(b.hrv) hc.push(b.hrv); }
  });
  if(c.length<3 || f.length<3) return {ok:false, nc:c.length, nf:f.length};
  return {ok:true, sc:media(c), sf:media(f), hc:mediana(hc), hf:mediana(hf), nc:c.length, nf:f.length};
}
async function benPaste(){
  var txt="";
  try{ txt=await navigator.clipboard.readText(); }
  catch(e){ toast("Non riesco a leggere gli appunti: tocca Consenti quando l'iPhone lo chiede"); return; }
  var f=function(re){ var m=String(txt).match(re); return m? m[1].replace(",",".") : null; };
  var vals={sonno:f(/sonno[^\d]{0,14}(\d+(?:[.,]\d+)?)/i), hrv:f(/hrv[^\d]{0,14}(\d+)/i),
            rhr:f(/(?:fc|riposo|rhr)[^\d]{0,14}(\d+)/i), peso:f(/peso[^\d]{0,14}(\d+(?:[.,]\d+)?)/i)};
  if(vals.sonno){ var sn=parseFloat(vals.sonno); if(sn>24) sn=sn/60; vals.sonno=(Math.round(sn*10)/10).toString(); }
  var n=0;
  [["sonno","bSonno"],["hrv","bHrv"],["rhr","bRhr"],["peso","bPeso"]].forEach(function(p){
    if(vals[p[0]]){ var el=document.getElementById(p[1]); if(el){ el.value=vals[p[0]]; n++; } }
  });
  toast(n? n+" valori incollati: controllali e salva" : "Negli appunti non trovo valori di Salute");
}

/* ---------- 11 · chiusura della settimana ---------- */
var GG=["lun","mar","mer","gio","ven","sab","dom"];
function cardChiusura(w, completa){
  var ch=(S.chiusure||{})[w], dom=new Date().getDay()===0;
  if(ch || !(completa || dom)) return "";
  return '<button class="card" data-a="chiusw" style="display:block;width:100%;text-align:left;border-color:var(--amb);background:rgba(224,164,88,.06)">'+
    '<div class="eyebrow amb">Chiusura della settimana '+w+'</div>'+
    '<h2 style="margin:5px 0 4px;font-size:16px">Tre domande, un minuto</h2>'+
    '<div class="xs mut">Cosa ha funzionato, una cosa da cambiare, quando fai le 4 sedute. Jarvis la legge nella review.</div></button>';
}
function formChiusura(){
  var w=weekOf(today()), ch=(S.chiusure||{})[w]||{};
  sheet('<div class="eyebrow amb">Chiusura della settimana '+w+'</div><h2 style="margin:4px 0 10px">Tre domande, un minuto</h2>'+
    '<label class="fld"><span class="eyebrow">1 · Cosa è andato bene?</span><textarea id="cwBene" placeholder="Anche una cosa piccola">'+esc(ch.bene||"")+'</textarea></label>'+
    '<label class="fld"><span class="eyebrow">2 · Una cosa da cambiare</span><textarea id="cwCambia" placeholder="Una sola, concreta">'+esc(ch.cambia||"")+'</textarea></label>'+
    '<label class="fld"><span class="eyebrow">3 · Quando fai le 4 sedute la prossima settimana?</span>'+
      '<div class="pills" id="cwGg" style="flex-wrap:wrap">'+GG.map(function(g){
        return '<button class="pill'+((ch.giorni||[]).indexOf(g)>=0?" on":"")+'" data-gg="'+g+'">'+g+'</button>'; }).join("")+'</div></label>'+
    '<div class="pills" id="cwMo">'+["mattina","primo pomeriggio"].map(function(m){
        return '<button class="pill'+(ch.mom===m?" on":"")+'" data-mo="'+m+'">'+m+'</button>'; }).join("")+'</div>'+
    '<div class="flag info" style="margin-top:10px"><b>Se-allora</b><div>Pensa ogni giorno così: «se è lunedì mattina, allora alleno». '+
      'Un piano legato a un momento preciso regge meglio di un\'intenzione generica.</div></div>'+
    '<button class="btn pri" style="margin-top:14px" data-a="savechiusw">Salva</button>'+
    '<button class="btn ghost" style="margin-top:8px" data-a="x">Annulla</button>');
}
async function saveChiusura(){
  var w=weekOf(today());
  var gg=[].map.call(document.querySelectorAll("#cwGg .pill.on"), function(b){ return b.dataset.gg; });
  var mo=document.querySelector("#cwMo .pill.on");
  S.chiusure=S.chiusure||{};
  S.chiusure[w]={bene:document.getElementById("cwBene").value.trim(), cambia:document.getElementById("cwCambia").value.trim(),
    giorni:gg, mom:mo?mo.dataset.mo:"", ts:today()};
  var ok=await save(); closeSheet(); render();
  if(SYNC.on()) doPush(false);
  toast(!ok? "NON salvata: vedi la scheda Coach" :
        (gg.length && gg.length<4)? "Salvata. Hai scelto "+gg.length+" giorni: il bersaglio è 4" : "Settimana chiusa: Jarvis la trova nella review");
}
function pianoDeciso(w){
  var ch=(S.chiusure||{})[w-1]; if(!ch || !ch.giorni || !ch.giorni.length) return "";
  return '<div class="xs" style="margin-top:8px;color:var(--glow)">Deciso domenica: '+esc(ch.giorni.join(" · "))+(ch.mom?" · "+esc(ch.mom):"")+'</div>';
}

