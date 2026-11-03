/* ============================================================
   GENERATORE — le sedute della settimana, scelte e adattate
   Per ogni giorno che resta dici dove sei (casa; fuori con le bande;
   fuori senza niente; occupato) e quanto tempo hai (30, 60 o 90 minuti).
   L'app prova tutte le combinazioni di sedute e giorni e tiene quella
   che chiude meglio la settimana. Poi adatta gli esercizi:
   1. toglie le serie oltre il massimo settimanale di un gruppo;
   2. se il tempo non basta toglie le serie che valgono meno (prima i
      gruppi gia' pieni; mai sotto 2 per esercizio; il primo esercizio
      della seduta resta);
   3. se un gruppo resta sotto il minimo aggiunge serie o un esercizio,
      solo con l'attrezzo che hai e solo se c'e' tempo.
   Regole: 10-20 serie dure per gruppo a settimana, core 6-12 (TGT);
   al massimo 10 serie per gruppo nella stessa seduta: oltre circa 11
   il guadagno non cresce piu' (Remmert et al., preprint 2025). Conta il
   volume della settimana piu' della frequenza; nei giorni corti si
   tengono i multiarticolari (Iversen 2021).
   Il tempo e' stimato: 40 s di lavoro per serie (il doppio se
   unilaterale), il recupero del tipo di esercizio (REST), 30 s per
   cambiare esercizio, 5 minuti di riscaldamento. Con questi numeri le
   sedute del piano tornano coi minuti scritti dal coach (A 60, B 45).
   ============================================================ */
var POSTI=[["casa","Casa","pesi, bande o niente"],["fuori","Fuori · bande","in trasferta con le bande"],["fuori0","Fuori · niente","in trasferta senza attrezzi"],["no","Occupato","niente allenamento"]];
var POSTO_MOD={casa:["casa","bande","corpo"], fuori:["bande","corpo"], fuori0:["corpo"], no:[]};
var MOD_NOME={casa:"Pesi", bande:"Bande", corpo:"Corpo libero"};
var TEMPI=[30,60,90], TEMPO_STD=60;
var RISC_MIN=5, CAMBIO_S=30, LAVORO_S=40, TOLL=1.05;
var CAP_SEDUTA=10, SERIE_MIN=2, SERIE_MAX=5;

/* ---------- quanto dura ---------- */
function secSerie(x){ var m=meta(x.n), lav=m.sec? (+x.hi||40) : LAVORO_S; if(x.u||m.uni) lav*=2; return lav+(REST[m.t]||75); }
function minutiSeduta(lista){ var s=0; (lista||[]).forEach(function(x){ if(x.s>0) s+=x.s*secSerie(x)+CAMBIO_S; }); return RISC_MIN+s/60; }
function contributi(lista){
  var g={};
  (lista||[]).forEach(function(x){ var gg=meta(x.n).g, n=x.s||0; if(!n) return;
    if(TGT[gg]) g[gg]=(g[gg]||0)+n;
    (IND[x.n]||[]).forEach(function(g2){ if(TGT[g2]) g[g2]=(g[g2]||0)+n*0.5; }); });
  return g;
}

/* ---------- gli esercizi ---------- */
/* la definizione di un esercizio: dal piano se c'e' (carichi e range noti), altrimenti dalle alternative */
function defPerNome(n){
  var tr=null;
  ["A","B","C","D","E1","E2"].forEach(function(d){ if(tr || !PLAN[d]) return; PLAN[d].ex.forEach(function(x){ if(!tr && x.n===n) tr=x; }); });
  return Object.assign({}, tr || altDef(n), {n:n});
}
var _BASE={};
function sedutaBase(d, l){
  var k=d+"|"+l;
  if(!_BASE[k] || _BASE[k].p!==PLAN) _BASE[k]={p:PLAN, v:eserciziPer(d, l).map(function(x){ return Object.assign({}, x, {s:x.s||3, sPiano:x.s||3}); })};
  return _BASE[k].v.map(function(x){ return Object.assign({}, x); });
}
/* la seduta salvata nel piano: la base piu' le modifiche (aggiunte, serie cambiate, tolti) */
function listaSeduta(e){
  if(!e || !PLAN[e.d]) return [];
  var via=e.via||[], ser=e.ser||{};
  var out=sedutaBase(e.d, e.l).filter(function(x){ return via.indexOf(x.n)<0; });
  out.forEach(function(x){ if(ser[x.n]!=null) x.s=+ser[x.n]; });
  (e.agg||[]).forEach(function(a){
    if(out.some(function(x){ return x.n===a.n; })) return;
    var d=defPerNome(a.n); out.push(Object.assign(d, {s:+a.s||2, sPiano:d.s||3, agg:true, perG:a.g||""}));
  });
  return out;
}
function deltaDa(d, l, lista){
  var base=sedutaBase(d, l), nomi=lista.map(function(x){ return x.n; }), out={agg:[], ser:{}, via:[]};
  base.forEach(function(b){ var x=lista.filter(function(y){ return y.n===b.n; })[0];
    if(!x) out.via.push(b.n); else if(x.s!==b.s) out.ser[b.n]=x.s; });
  lista.forEach(function(x){ if(!base.some(function(b){ return b.n===x.n; })) out.agg.push({n:x.n, s:x.s, g:x.perG||meta(x.n).g}); });
  void nomi;
  return out;
}
/* esercizi per riempire un gruppo, in ordine di preferenza, per attrezzo.
   Solo esercizi gia' nel piano o nelle sue alternative: tecnica e cautele note.
   Niente spinte sopra la testa in aggiunta (spalla sinistra). */
var RIEMPI={
  Petto:{casa:["Floor Press (volume)","Push-up"], bande:["Push-up piedi rialzati con banda","Push-up"], corpo:["Push-up piedi rialzati","Push-up"]},
  Dorso:{casa:["Rematore manubri (volume)","Pullover manubrio"], bande:["Band row seduto","Band row un braccio","Band pull-down"], corpo:["Rematore al telaio della porta"]},
  Spalle:{casa:["Alzate laterali","Face pull"], bande:["Alzate laterali con banda","Band pull-apart"], corpo:["Y-T-W a busto inclinato"]},
  Bicipiti:{casa:["Curl bicipiti manubri","Hammer Curl"], bande:["Band curl bicipiti","Hammer curl con banda"], corpo:["Curl isometrico asciugamano"]},
  Tricipiti:{casa:["French Press","Band tricep extension"], bande:["Band tricep extension"], corpo:["Push-up stretti"]},
  Gambe:{casa:["Box Squat","Hip thrust con banda","Affondi indietro manubri"], bande:["Bulgarian split squat 3s","Hip hinge una gamba","Hip thrust con banda"], corpo:["Affondi indietro","Box squat alla sedia 3s","Hip thrust a una gamba"]},
  Core:{casa:["Side plank","Dead bug"], bande:["Dead bug","Side plank"], corpo:["Dead bug","Side plank"]}
};

/* ---------- valore di una serie per la settimana ---------- */
/* t = totale del gruppo contando questa serie: sotto il minimo vale molto, nel range sempre meno, oltre il massimo quasi niente */
function valoreUnita(t, r){ if(t<=r[0]) return 3; if(t<=r[1]) return 1-0.6*(t-r[0])/(r[1]-r[0]); return 0.05; }
function valoreTogli(x, tot, primo){
  var m=meta(x.n), v=0;
  if(TGT[m.g]) v+=valoreUnita(tot[m.g]||0, TGT[m.g]);
  (IND[x.n]||[]).forEach(function(g2){ if(TGT[g2]) v+=0.5*valoreUnita(tot[g2]||0, TGT[g2]); });
  if(m.t==="comp") v+=0.6; else if(m.t==="compl") v+=0.3;
  if(primo) v+=0.8;
  return v;
}
function aggiungiTot(tot, x, k){
  var m=meta(x.n); if(TGT[m.g]) tot[m.g]=(tot[m.g]||0)+k;
  (IND[x.n]||[]).forEach(function(g2){ if(TGT[g2]) tot[g2]=(tot[g2]||0)+0.5*k; });
}

/* ---------- adattamento di un insieme di sedute ---------- */
/* ss: [{data,d,l,T,lista}] in ordine di data; fatte: serie dure gia' fatte per gruppo */
function adatta(ss, fatte, pieno){
  var tot=Object.assign({}, fatte);
  ss.forEach(function(s){ s.cambi=[]; s.lista.forEach(function(x){ aggiungiTot(tot, x, x.s); }); });
  var primo=function(s,x){ return s.lista[0]===x; };
  /* 1 · oltre il massimo: via le serie in piu', prima gli isolamenti */
  Object.keys(TGT).forEach(function(g){
    var guard=40;
    while((tot[g]||0)-1>=TGT[g][1] && guard--){
      var best=null;
      ss.forEach(function(s){ s.lista.forEach(function(x){ if(meta(x.n).g!==g || x.s<=SERIE_MIN || primo(s,x)) return;
        var k=(meta(x.n).t==="iso"?0:1)*10+x.s*-1; if(!best || k<best.k) best={s:s,x:x,k:k}; }); });
      if(!best) break;
      best.x.s--; aggiungiTot(tot, best.x, -1); best.s.cambi.push({n:best.x.n, tipo:"meno", perche:g+" già sopra "+TGT[g][1]});
    }
  });
  /* 2 · il tempo: via le serie che valgono meno per secondo risparmiato */
  ss.forEach(function(s){
    var guard=80;
    while(minutiSeduta(s.lista)>s.T*TOLL && guard--){
      var best=null;
      s.lista.forEach(function(x, i){
        if(x.s<=0) return;
        var p=(i===0);
        if(x.s>SERIE_MIN){ var r=valoreTogli(x, tot, p)/secSerie(x); if(!best || r<best.r) best={x:x, r:r, tutto:false}; }
        else if(!p && s.lista.filter(function(y){ return y.s>0; }).length>2){
          var r2=valoreTogli(x, tot, p)*x.s/(x.s*secSerie(x)+CAMBIO_S); if(!best || r2<best.r) best={x:x, r:r2, tutto:true}; }
      });
      if(!best) break;
      if(best.tutto){ aggiungiTot(tot, best.x, -best.x.s); best.x.s=0; s.cambi.push({n:best.x.n, tipo:"via", perche:"per stare in "+s.T+"′"}); }
      else { best.x.s--; aggiungiTot(tot, best.x, -1); s.cambi.push({n:best.x.n, tipo:"meno", perche:"per stare in "+s.T+"′"}); }
    }
    s.lista=s.lista.filter(function(x){ return x.s>0; });
  });
  /* 3 · i buchi: serie o esercizi in piu' dove c'e' tempo e l'attrezzo giusto */
  if(pieno!==false){
    var guard=60;
    while(guard--){
      var buchi=Object.keys(TGT).filter(function(g){ return (tot[g]||0)<TGT[g][0]; });
      if(!buchi.length) break;
      var best=null;
      ss.forEach(function(s, si){
        var cs=contributi(s.lista), libero=s.T*TOLL-minutiSeduta(s.lista);
        var vicino=function(g){ return ss.some(function(o, oi){ return oi!==si && Math.abs(s2d(o.data)-s2d(s.data))<=86400000 && (contributi(o.lista)[g]||0)>=4; }); };
        buchi.forEach(function(g){
          if((cs[g]||0)+1>CAP_SEDUTA) return;
          var fatt=vicino(g)? 0.6 : 1;
          /* una serie in piu' su un esercizio del gruppo che c'e' gia' */
          s.lista.forEach(function(x){
            if(meta(x.n).g!==g || x.s>=Math.min(SERIE_MAX, (x.sPiano||3)+2)) return;
            var sec=secSerie(x); if(sec/60>libero) return;
            var gain=0, t2=Object.assign({}, tot); aggiungiTot(t2, x, 1);
            Object.keys(TGT).forEach(function(k){ var d0=Math.max(0, TGT[k][0]-(tot[k]||0)), d1=Math.max(0, TGT[k][0]-(t2[k]||0)); gain+=(d0-d1)*3; if((t2[k]||0)>TGT[k][1]) gain-=1; });
            var r=gain*fatt/sec; if(gain>0 && (!best || r>best.r)) best={s:s, x:x, r:r, g:g};
          });
          /* oppure un esercizio nuovo, due serie */
          var lista=((RIEMPI[g]||{})[s.l])||[];
          for(var j=0;j<lista.length;j++){
            var n=lista[j]; if(s.lista.some(function(x){ return x.n===n; })) continue;
            if(!EX[n]) continue;
            var dnew=Object.assign(defPerNome(n), {s:2, agg:true, perG:g}); dnew.sPiano=defPerNome(n).s||3;
            var sec2=2*secSerie(dnew)+CAMBIO_S; if(sec2/60>libero) continue;
            if((cs[g]||0)+2>CAP_SEDUTA) continue;
            var t3=Object.assign({}, tot), gain2=0; aggiungiTot(t3, dnew, 2);
            Object.keys(TGT).forEach(function(k){ var d0=Math.max(0, TGT[k][0]-(tot[k]||0)), d1=Math.max(0, TGT[k][0]-(t3[k]||0)); gain2+=(d0-d1)*3; if((t3[k]||0)>TGT[k][1]) gain2-=1; });
            var r3=gain2*fatt/sec2*0.92; if(gain2>0 && (!best || r3>best.r)) best={s:s, nuovo:dnew, r:r3, g:g};
            break;
          }
        });
      });
      if(!best) break;
      if(best.nuovo){ best.s.lista.push(best.nuovo); aggiungiTot(tot, best.nuovo, 2); best.s.cambi.push({n:best.nuovo.n, tipo:"nuovo", perche:"per "+best.g}); }
      else { best.x.s++; aggiungiTot(tot, best.x, 1); best.s.cambi.push({n:best.x.n, tipo:"piu", perche:"per "+best.g}); }
    }
    /* 4 · se il tempo e' finito ma un gruppo resta sotto: si scambia una serie di un gruppo
       gia' nel range con una del gruppo che manca, quando conviene davvero */
    var giri=30;
    while(giri--){
      var buchi2=Object.keys(TGT).filter(function(g){ return (tot[g]||0)<TGT[g][0]-0.01; });
      if(!buchi2.length) break;
      var sc=null;
      ss.forEach(function(s){
        var vivi=s.lista.filter(function(x){ return x.s>0; });
        vivi.forEach(function(rx, ri){
          var gx=meta(rx.n).g; if(buchi2.indexOf(gx)>=0) return;
          var tutto=rx.s<=SERIE_MIN; if(tutto && (s.lista.indexOf(rx)===0 || vivi.length<=3)) return;
          var k=tutto? rx.s : 1, loss=valoreTogli(rx, tot, s.lista.indexOf(rx)===0)*k;
          var t0=Object.assign({}, tot); aggiungiTot(t0, rx, -k);
          var prova=s.lista.map(function(x){ return x===rx? Object.assign({}, x, {s:x.s-k}) : x; });
          var cs=contributi(prova), libero=s.T*TOLL-minutiSeduta(prova);
          buchi2.forEach(function(g){
            if((cs[g]||0)+1>CAP_SEDUTA) return;
            var opz=[];
            prova.forEach(function(x){ if(x.s>0 && meta(x.n).g===g && x.s<Math.min(SERIE_MAX,(x.sPiano||3)+2)) opz.push({x:x, k:1, sec:secSerie(x)}); });
            if(!opz.length){ var nn=(((RIEMPI[g]||{})[s.l])||[]).filter(function(n){ return EX[n] && !prova.some(function(x){ return x.n===n && x.s>0; }); })[0];
              if(nn){ var dn=Object.assign(defPerNome(nn), {s:2, agg:true, perG:g}); dn.sPiano=defPerNome(nn).s||3; opz.push({nuovo:dn, k:2, sec:2*secSerie(dn)+CAMBIO_S}); } }
            opz.forEach(function(a){
              if(a.sec/60>libero) return;
              var t1=Object.assign({}, t0), gain=0; aggiungiTot(t1, a.x||a.nuovo, a.k);
              Object.keys(TGT).forEach(function(q){ gain+=(Math.max(0,TGT[q][0]-(t0[q]||0))-Math.max(0,TGT[q][0]-(t1[q]||0)))*3; });
              var net=gain-loss; if(net>0.8 && (!sc || net>sc.net)) sc={s:s, rx:rx, k:k, a:a, net:net, g:g};
            });
          });
        });
      });
      if(!sc) break;
      sc.rx.s-=sc.k; aggiungiTot(tot, sc.rx, -sc.k);
      sc.s.cambi.push({n:sc.rx.n, tipo:sc.rx.s>0?"meno":"via", perche:"per fare spazio a "+sc.g});
      if(sc.a.nuovo){ sc.s.lista.push(sc.a.nuovo); aggiungiTot(tot, sc.a.nuovo, 2); sc.s.cambi.push({n:sc.a.nuovo.n, tipo:"nuovo", perche:"per "+sc.g}); }
      else { sc.a.x.s++; aggiungiTot(tot, sc.a.x, 1); sc.s.cambi.push({n:sc.a.x.n, tipo:"piu", perche:"per "+sc.g}); }
      sc.s.lista=sc.s.lista.filter(function(x){ return x.s>0; });
    }
  }
  return tot;
}

/* ---------- il punteggio di una settimana: piu' basso e' meglio ---------- */
function punteggio(ss, tot, o){
  var p=0, nota={};
  Object.keys(TGT).forEach(function(g){ var t=tot[g]||0, r=TGT[g];
    if(t<r[0]) p+=(r[0]-t)*3; if(t>r[1]) p+=(t-r[1]); });
  ss.forEach(function(s){ var m=minutiSeduta(s.lista); if(m>s.T*TOLL) p+=(m-s.T*TOLL)*2;
    s.lista.forEach(function(x){ if(s.l==="casa" && meta(x.n).t==="comp") p-=0.02*x.s; }); });
  /* giorni attaccati: meglio distanziare, soprattutto se lavorano gli stessi gruppi */
  var giorni=ss.map(function(s){ return {t:s2d(s.data).getTime(), c:contributi(s.lista)}; });
  (o.ieri||[]).forEach(function(x){ giorni.push(x); });
  giorni.sort(function(a,b){ return a.t-b.t; });
  for(var i=1;i<giorni.length;i++){
    if(Math.round((giorni[i].t-giorni[i-1].t)/86400000)!==1) continue;
    p+=0.4;
    Object.keys(TGT).forEach(function(g){ var a=giorni[i].c[g]||0, b=giorni[i-1].c[g]||0; p+=Math.min(a,b)*(g==="Gambe"?0.12:0.05); });
    if(i>=2 && Math.round((giorni[i-1].t-giorni[i-2].t)/86400000)===1) p+=0.6;
  }
  /* restare vicini al piano che c'e' gia' */
  (o.pref||[]).forEach(function(e){ var s=ss.filter(function(x){ return x.d===e.d; })[0]; if(s && s.data!==e.data) p+=1.5; if(!s) p+=1; });
  /* a parita', l'ordine naturale A B C D */
  var ord=ss.map(function(s){ return giorniSettimana(o.w).indexOf(s.d); });
  for(var a=0;a<ord.length;a++) for(var b=a+1;b<ord.length;b++) if(ord[a]>ord[b]) p+=0.03;
  void nota;
  return p;
}

/* ---------- la settimana: giorni, tempi, sedute ---------- */
function tempoGiorno(w, data){
  var v=((S.tempo||{})[w]||{})[data]; if(v) return +v;
  var e=((pianoSett(w)||{}).sedute||[]).filter(function(x){ return x.data===data && x.t; })[0];
  return e? +e.t : TEMPO_STD;
}
function modDefault(posto){ return (POSTO_MOD[posto]||["casa"])[0]; }
function modOk(posto, l){ return (POSTO_MOD[posto]||[]).indexOf(l)>=0; }
function combinazioni(arr, k){
  var out=[]; (function rec(i, acc){ if(acc.length===k){ out.push(acc.slice()); return; } for(var j=i;j<arr.length;j++){ acc.push(arr[j]); rec(j+1, acc); acc.pop(); } })(0, []);
  return out;
}
function permutazioni(arr){
  if(arr.length<=1) return [arr.slice()];
  var out=[]; arr.forEach(function(x,i){ permutazioni(arr.slice(0,i).concat(arr.slice(i+1))).forEach(function(p){ out.push([x].concat(p)); }); });
  return out;
}
/* o: {dispo:{data:posto}, tempo:{data:min}, fissa:{d:data}, forza:{data:l}, fisse:[{data,d,l}], pref:[{data,d}]} */
function generaSettimana(w, o){
  o=o||{};
  var dispo=o.dispo||{}, tempo=o.tempo||{}, fissa=o.fissa||{}, forza=o.forza||{};
  var posto=function(d){ return dispo[d] || dispoGiorno(w, d); };
  var tmin=function(d){ return +tempo[d] || tempoGiorno(w, d); };
  var ls=S.log.filter(function(r){ return r.w===w; }), fatte=serieGruppo(ls);
  var mancano=giorniSettimana(w).filter(function(d){ return !sedutaCoperta(w, d); });
  var dates=dateSettimana(w).filter(function(d){
    if(giorniFa(d)>0) return false;
    if(giorniFa(d)===0 && S.sess.some(function(s){ return s.date===d && !isRest(s); })) return false;
    return posto(d)!=="no";
  });
  /* i giorni allenati appena prima, per non attaccare due sedute uguali */
  var ieri=[];
  S.sess.filter(function(s){ return !isRest(s) && giorniFa(s.date)>0 && giorniFa(s.date)<=2; }).forEach(function(s){
    ieri.push({t:s2d(s.date).getTime(), c:serieGruppo(S.log.filter(function(r){ return r.date===s.date; }))}); });
  var out={w:w, sedute:[], fatte:fatte, mancano:mancano, dates:dates, fuori:[], tot:Object.assign({}, fatte), punti:0};
  if(!mancano.length) return out;
  var crea=function(ass){
    return ass.map(function(a){
      var ps=posto(a.data), l=a.l || (forza[a.data] && modOk(ps, forza[a.data]) ? forza[a.data] : modDefault(ps));
      if(ps==="no") l=a.l||"casa";
      return {data:a.data, d:a.d, l:l, T:tmin(a.data), lista:sedutaBase(a.d, l)};
    }).sort(function(x,y){ return s2d(x.data)-s2d(y.data); });
  };
  var candidati=[];
  if(o.fisse){ candidati.push(o.fisse.filter(function(e){ return PLAN[e.d] && mancano.indexOf(e.d)>=0; }).map(function(e){ return {data:e.data, d:e.d, l:e.l}; })); }
  else if(dates.length){
    var n=Math.min(mancano.length, dates.length), fis=Object.keys(fissa).filter(function(d){ return mancano.indexOf(d)>=0 && dates.indexOf(fissa[d])>=0; });
    var gruppi=n<mancano.length ? combinazioni(mancano, n).filter(function(c){ return fis.every(function(d){ return c.indexOf(d)>=0; }); }) : [mancano];
    combinazioni(dates, n).forEach(function(dd){
      gruppi.forEach(function(gr){
        permutazioni(gr).forEach(function(pm){
          for(var i=0;i<pm.length;i++){ if(fissa[pm[i]] && fis.indexOf(pm[i])>=0 && fissa[pm[i]]!==dd[i]) return; }
          candidati.push(pm.map(function(d,i){ return {data:dd[i], d:d}; }));
        });
      });
    });
  }
  if(!candidati.length){ out.fuori=mancano.slice(); return out; }
  var opz={w:w, ieri:ieri, pref:o.pref||[]};
  /* primo giro veloce (solo tempo), poi il giro completo sui migliori */
  var veloci=candidati.map(function(c){ var ss=crea(c), t=adatta(ss, fatte, false); return {c:c, p:punteggio(ss, t, opz)}; })
    .sort(function(a,b){ return a.p-b.p; }).slice(0, 14);
  var best=null;
  veloci.forEach(function(v){ var ss=crea(v.c), t=adatta(ss, fatte, true), p=punteggio(ss, t, opz); if(!best || p<best.p-1e-9) best={ss:ss, t:t, p:p}; });
  var usati=best.ss.map(function(s){ return s.d; });
  out.fuori=mancano.filter(function(d){ return usati.indexOf(d)<0; });
  out.tot=best.t; out.punti=best.p;
  out.sedute=best.ss.map(function(s){
    var pe=(o.pref||[]).filter(function(e){ return e.d===s.d && e.data===s.data && e.ora; })[0];
    var dl=deltaDa(s.d, s.l, s.lista);
    return {data:s.data, d:s.d, l:s.l, t:s.T, ora:pe? pe.ora : oraProposta(s.data), agg:dl.agg, ser:dl.ser, via:dl.via,
      min:Math.round(minutiSeduta(s.lista)), cambi:s.cambi};
  });
  return out;
}
/* bilancio dal risultato: stessa forma di bilancio() */
function bilancioDa(g){
  var o={}, buchi=[];
  Object.keys(TGT).forEach(function(k){ var f=g.fatte[k]||0, t=g.tot[k]||0, r=TGT[k], st=t<r[0]-0.01? "sotto" : t>r[1]+0.01? "sopra" : "ok";
    o[k]={fatte:f, prev:Math.max(0,t-f), tot:t, min:r[0], max:r[1], stato:st}; if(st==="sotto") buchi.push(k); });
  return {gruppi:o, buchi:buchi, w:g.w};
}
/* una riga leggibile delle modifiche di una seduta */
function cambiTesto(e){
  var p=[];
  (e.agg||[]).forEach(function(a){ p.push("+ "+a.s+"× "+a.n+(a.g?" ("+a.g+")":"")); });
  var base=sedutaBase(e.d, e.l);
  Object.keys(e.ser||{}).forEach(function(n){ var b=base.filter(function(x){ return x.n===n; })[0]; if(!b) return;
    var d=e.ser[n]-b.s; p.push((d>0?"+":"−")+Math.abs(d)+" serie "+n); });
  (e.via||[]).forEach(function(n){ p.push("senza "+n); });
  return p;
}

/* ---------- la seduta di oggi: quella adattata, se c'e' nel piano ---------- */
function voceDelPiano(day){
  var w=weekOf(today()), sed=seduteDelPiano(w).filter(function(e){ return e.d===day && (e.stato==="oggi"||e.stato==="futura"||e.stato==="saltata"); });
  return sed.filter(function(e){ return e.data===today(); })[0] || sed[0] || null;
}
function listaPerOggi(day, luogo){
  var e=voceDelPiano(day);
  if(!e || (!e.agg && !e.ser && !e.via)) return eserciziPer(day, luogo);
  if(e.l===luogo) return listaSeduta(e);
  /* luogo cambiato oggi: si riadatta questa seduta al nuovo attrezzo, stesso tempo */
  var w=weekOf(today()), fis=seduteDelPiano(w).filter(function(x){ return x.stato==="oggi"||x.stato==="futura"; })
    .map(function(x){ return {data:x.d===day? today() : x.data, d:x.d, l:x.d===day? luogo : x.l}; });
  if(!fis.some(function(x){ return x.d===day; })) fis.push({data:today(), d:day, l:luogo});
  var tm={}; tm[today()]=e.t||TEMPO_STD;
  var g=generaSettimana(w, {fisse:fis, tempo:tm}), s=g.sedute.filter(function(x){ return x.d===day; })[0];
  return s? listaSeduta(s) : eserciziPer(day, luogo);
}
