/* ============================================================
   STATO DI OGGI — tutti i segnali insieme, e che cosa propongono
   Decisione del 14/11/2026: l'app non blocca piu' niente da sola.
   Legge recupero, sonno, stress, dolore, carico recente e cibo,
   dice come stai e PROPONE una modifica alla seduta; la modifica
   vale solo se la autorizzi. Anche scendere di carico e' una
   proposta, quando sei salito e l'esecuzione non tiene.
   Fondamento:
   - guidare l'allenamento con l'HRV rende piu' o meno come un piano
     fisso, con meno giornate andate a vuoto (Duking 2021; Manresa-
     Rocamora 2021): per questo e' una proposta e non un blocco;
   - la crescita non dipende dal carico se la serie arriva vicino al
     cedimento (Lopez 2021): scendere di un gradino per rifare bene
     il movimento costa poco in massa, qualcosa in forza massima;
   - la tecnica che conta e' movimento controllato, ampiezza piena,
     2-8 secondi a ripetizione (Androulakis-Korakakis 2024).
   Le soglie sono scelte del progetto, da rivedere col coach.
   ============================================================ */
var STO_TIT=["Via libera","Avanti con giudizio","Giornata da gestire"];
var STO_COL=["var(--ok)","var(--amb)","var(--alert)"];
var STO_DOLORE=4;          /* dolore al mattino da cui una zona conta per la seduta */
var STO_CARICO=1.3;        /* serie dure dei 7 giorni rispetto alla media delle 4 settimane prima */
var STO_KCAL=0.8;          /* ieri sotto questa quota del target: energia bassa */
var STO_SCENDI_SEDUTE=3;   /* una salita e' "recente" per queste sedute */
var TEC_NOMI=["Pulita","Qualche sbavatura","Sporca"];

/* ---------- le decisioni: accettata, rifiutata, non ancora ---------- */
function stoDecisa(id){ var p=(S.proposte||{})[id]; return p? p.r : null; }
function stoDecidi(id, r){
  S.proposte=S.proposte||{};
  if(r==null) delete S.proposte[id]; else S.proposte[id]={r:r, d:today()};
  /* le decisioni vecchie non servono piu' */
  Object.keys(S.proposte).forEach(function(k){ var d=S.proposte[k].d; if(!dataOk(d) || giorniDa(d)>45) delete S.proposte[k]; });
  cfgTocca("proposte");
}
function stoGiorno(n){ var d=new Date(); d.setDate(d.getDate()-n); return d2s(d); }

/* ---------- i segnali ---------- */
function stoRighe(da, a){   /* righe del log fra 'da' e 'a' giorni fa (compresi) */
  return S.log.filter(function(r){ if(!dataOk(r.date)) return false; var g=giorniDa(r.date); return g>=da && g<=a; });
}
function segnaliOggi(){
  var out=[], oggi=today(), b=benOn(oggi);
  /* 1 · recupero: HRV e FC a riposo, sonno, stress, alcol */
  if(b && (b.hrv||b.rhr||b.sonno||b.read||b.stress!=null)){
    var rc=recovery(oggi);
    out.push({k:"recupero", n:"Recupero", lvl:rc.lvl, t: rc.lvl? rc.parts.join(" · ") : "nella norma"+(b.hrv? " · HRV "+b.hrv : "")+(b.sonno? " · sonno "+sonnoTxt(b.sonno) : ""), nota:rc.hint});
  } else out.push({k:"recupero", n:"Recupero", lvl:null, t:"compila il benessere del mattino: senza, lo stato è una lettura a metà"});
  /* 2 · sonno delle ultime 3 notti: una notte corta si regge, tre no */
  var s3=benFinestra("sonno", oggi, 3, true);
  if(s3.length>=2){ var ms=media(s3);
    out.push({k:"sonno", n:"Sonno, 3 notti", lvl: ms<6 ? 2 : ms<SONNO_BASSO ? 1 : 0, t:sonnoTxt(ms)+" di media"}); }
  /* 3 · testa: stress e come ti senti */
  var st=benFinestra("stress", oggi, 3, true), me=benFinestra("mente", oggi, 3, true);
  if(st.length || me.length){
    var mst=st.length? media(st) : null, mme=me.length? media(me) : null;
    var lv=(mst!=null && mst>=STRESS_ALTO) || (mme!=null && mme<=2) ? 1 : 0;
    out.push({k:"testa", n:"Stress e testa", lvl:lv, t:(mst!=null? "stress "+dec(r1(mst))+" su 3" : "")+(mst!=null&&mme!=null? " · " : "")+(mme!=null? "testa "+dec(r1(mme))+" su 5" : "")});
  }
  /* 4 · dolore: stamattina, l'ultima seduta se non e' rientrato, le zone che tornano */
  var zone=stoZone(), zk=Object.keys(zone);
  if(zk.length){ var mx=Math.max.apply(null, zk.map(function(z){ return zone[z].v; }));
    out.push({k:"dolore", n:"Dolore", lvl: mx>5 ? 2 : 1, t:zk.map(function(z){ return zonaNome(z).toLowerCase()+" "+zone[z].v+"/10 ("+zone[z].da+")"; }).join(" · ")}); }
  else if(b && ((b.dolmz!=null && b.dolmz!=="") || (b.dolm!=null && b.dolm!==""))) out.push({k:"dolore", n:"Dolore", lvl:0, t:"niente da segnalare"});
  /* 5 · carico: quanto hai lavorato in 7 giorni rispetto al tuo solito */
  var d7=serieDure(stoRighe(0,6)).dure, base=serieDure(stoRighe(7,34)).dure/4;
  if(base>=8){ var rap=d7/base;
    out.push({k:"carico", n:"Carico, 7 giorni", lvl: rap>=STO_CARICO ? 1 : 0, t:dec(r1(d7))+" serie dure · solito "+dec(r1(base))+(rap>=STO_CARICO? " (+"+Math.round((rap-1)*100)+"%)" : "")}); }
  var fila=0; for(var i=1;i<=3;i++){ if(S.sess.some(function(s){ return s.date===stoGiorno(i) && !isRest(s); })) fila++; else break; }
  if(fila>=2) out.push({k:"fila", n:"Giorni di fila", lvl:1, t:"ti sei allenato negli ultimi "+fila+" giorni"});
  /* 6 · energia: quanto hai mangiato ieri */
  var ieri=stoGiorno(1), ci=cibOn(ieri), kc=Math.round(kcalDi(ci)), tg=cibTarget();
  if(kc>0 && !(typeof cibStimato==="function" && cibStimato(ieri))){
    var gi=cibDay(ieri), princ=["col","pra","cen"].filter(function(k){ return (gi[k]||[]).length; }).length;
    if(princ>=2) out.push({k:"cibo", n:"Cibo di ieri", lvl: kc<tg.kcal*STO_KCAL ? 1 : 0, t:kfmt(kc)+" kcal su "+kfmt(tg.kcal)+" · proteine "+Math.round(ci.p)+" g"});
  }
  /* 7 · reflusso della sera prima: conta per plank e posizioni a testa in giu' */
  var bi=benOn(ieri);
  if(bi && bi.refl>=2) out.push({k:"reflusso", n:"Reflusso ieri sera", lvl:1, t:bi.refl+" su 3"});
  return out;
}
/* zone con dolore che conta oggi: {zona:{v, da}} */
function stoZone(){
  var z={}, b=benOn(today()), m=dolDi(b,"dolmz","dolm");
  Object.keys(m).forEach(function(k){ if(m[k]>=STO_DOLORE) z[k]={v:m[k], da:"stamattina"}; });
  /* l'ultima seduta: sopra 5, e il mattino dopo non l'hai ancora segnato rientrato */
  var ss=S.sess.filter(function(s){ return !isRest(s) && dataOk(s.date) && giorniDa(s.date)>=0 && giorniDa(s.date)<=3; }).sort(function(a,c){ return s2d(c.date)-s2d(a.date); })[0];
  if(ss){ var ms=dolDi(ss,"dolz","dol"), dopo=d2s(new Date(s2d(ss.date).getTime()+86400000)), bd=benOn(dopo), md=dolDi(bd,"dolmz","dolm");
    var dopoCompilato=!!(bd && ((bd.dolmz!=null && bd.dolmz!=="") || (bd.dolm!=null && bd.dolm!=="")));
    Object.keys(ms).forEach(function(k){
      if(ms[k]>5 && !(dopoCompilato && (md[k]||0)<3) && !z[k]) z[k]={v:ms[k], da:"seduta del "+ss.date.slice(0,5)}; }); }
  /* le zone che tornano: tre volte in 14 giorni */
  dolZoneFrequenti(14, 3).forEach(function(x){ if(x.n>=3 && !z[x.z]) z[x.z]={v:3, da:x.n+" volte in 14 giorni"}; });
  return z;
}
function statoOggi(){
  var sg=segnaliOggi(), con=sg.filter(function(x){ return x.lvl!=null; });
  var rossi=con.filter(function(x){ return x.lvl>=2; }), gialli=con.filter(function(x){ return x.lvl===1; });
  var lvl = rossi.length || gialli.length>=3 ? 2 : gialli.length ? 1 : 0;
  var perche = lvl===0 ? (con.length? "Nessun segnale fuori posto: la seduta resta quella del piano." : "Mancano i dati di oggi.")
    : rossi.concat(gialli).map(function(x){ return x.n.toLowerCase(); }).join(", ");
  return {lvl:lvl, titolo:STO_TIT[lvl], segnali:sg, perche:perche, letti:con.length};
}

/* ---------- scendere di carico: quando ha senso proporlo ----------
   Solo dopo una salita recente (ultime 3 sedute di quell'esercizio) e solo se
   l'esecuzione non tiene: la segni tu a fine esercizio (pulita, sbavature, sporca),
   oppure lo dicono i numeri (sotto il minimo del range, dolore sull'esercizio,
   un lato che cede, cedimento su un composto). Uno stallo senza questi segni
   resta materia della diagnosi, non di questa proposta. */
function scendiCandidato(x){
  var m=meta(x.n); if(x.b || m.sec) return null;
  var h=hist(x.n).filter(function(r){ return r.load>0 && dataOk(r.date); }); if(!h.length) return null;
  var cur=h[h.length-1].load, prev=null, da=h.length;
  for(var i=h.length-1;i>=0;i--){ if(h[i].load!==cur){ prev=h[i].load; break; } da=i; }
  if(prev===null || cur<=prev) return null;
  var righe=h.slice(da), date=[]; righe.forEach(function(r){ if(date.indexOf(r.date)<0) date.push(r.date); });
  if(date.length>STO_SCENDI_SEDUTE) return null;
  var segni=[], punti=0, lo=x.lo||0;
  var tecMax=Math.max.apply(null, righe.map(function(r){ return r.tec==null? -1 : +r.tec; }));
  var tecSb=date.filter(function(d){ return righe.some(function(r){ return r.date===d && r.tec>=1; }); }).length;
  if(tecMax>=2){ segni.push("esecuzione segnata come sporca"); punti+=2; }
  else if(tecSb>=2){ segni.push("sbavature in "+tecSb+" sedute"); punti+=2; }
  else if(tecSb===1){ segni.push("qualche sbavatura nell'ultima esecuzione"); punti+=1; }
  var sotto=date.filter(function(d){ return righe.some(function(r){ return r.date===d && (r.reps||[]).some(function(v){ return v<lo; }); }); }).length;
  if(lo && sotto>=2){ segni.push("sotto le "+lo+" ripetizioni in "+sotto+" sedute"); punti+=2; }
  else if(lo && sotto===1){ segni.push("una seduta sotto le "+lo+" ripetizioni"); punti+=1; }
  var dol=0; righe.forEach(function(r){ var v=dolMax(dolParse(r.dolz||"")); if(v>dol) dol=v; });
  if(dol>=4){ segni.push("dolore "+dol+"/10 durante l'esercizio"); punti+=2; }
  if(m.t==="comp" && righe.some(function(r){ return r.rir===0; })){ segni.push("serie chiuse a cedimento"); punti+=1; }
  if(x.u){ var sb=false; date.forEach(function(d){ var S_=righe.filter(function(r){ return r.date===d && r.side==="S"; })[0], D_=righe.filter(function(r){ return r.date===d && r.side==="D"; })[0];
      if(S_ && D_){ var a=S_.reps.reduce(function(p,q){ return p+q; },0), c=D_.reps.reduce(function(p,q){ return p+q; },0); if(Math.abs(a-c)>=4) sb=true; } });
    if(sb){ segni.push("un lato cede molto prima dell'altro"); punti+=1; } }
  /* salita senza le due sedute al top che la regola chiede */
  var prima=h.slice(0,da).filter(function(r){ return r.load===prev; }), dPrima=[];
  prima.forEach(function(r){ if(dPrima.indexOf(r.date)<0) dPrima.push(r.date); });
  var ult2=dPrima.slice(-2), topPrima=ult2.length===2 && ult2.every(function(d){ return prima.some(function(r){ return r.date===d && r.top; }); });
  if(!topPrima){ segni.push("eri salito senza due sedute chiuse al top"); punti+=1; }
  if(punti<2) return null;
  return {n:x.n, cur:cur, prev:prev, segni:segni, sedute:date.length};
}

/* ---------- le proposte per la seduta di oggi ---------- */
function stoAlternativa(x, zona){
  var al=ALT[x.n]; if(!al) return null;
  var ok=["bande","corpo"].map(function(k){ return al[k]; }).filter(function(a){
    if(!a || a===x.n) return false; var pd=posDef(a); return !(pd && pd.no && pd.no.indexOf(zona)>=0); });
  return ok[0]||null;
}
function proposteOggi(lista){
  var out=[], oggi=today(), st=statoOggi(), sg={};
  st.segnali.forEach(function(x){ sg[x.k]=x; });
  lista=lista||[];
  /* 1 · carichi fermi oggi: due segnali di recupero insieme */
  var rb=recoveryOggi();
  if(rb) out.push({id:"fermi|"+oggi, tipo:"fermi", t:"Oggi tieni i carichi dell'ultima volta",
    perche:(rb.hint||rb.parts.join(" · ")), effetto:"Le salite di carico restano in coda fino alla prossima seduta. Le ripetizioni le fai come vengono."});
  /* 2 · accorcia: giornata rossa, oppure due segnali fra sonno, testa, carico, cibo, giorni di fila */
  var deb=["sonno","testa","carico","cibo","fila"].filter(function(k){ return sg[k] && sg[k].lvl>=1; });
  if(lista.length>1 && (st.lvl>=2 || deb.length>=2)){
    var corta=stoAccorcia(lista), tolte=0; lista.forEach(function(x,i){ tolte+=(x.s||0)-(corta[i].s||0); });
    if(tolte>0) out.push({id:"accorcia|"+oggi, tipo:"accorcia", t:"Accorcia la seduta: "+tolte+" serie in meno",
      perche:"Segnali: "+(deb.length? deb.map(function(k){ return sg[k].n.toLowerCase()+" ("+sg[k].t+")"; }).join("; ") : st.perche)+".",
      effetto:"Il primo esercizio resta intero, gli altri perdono una serie (mai sotto 2): circa "+Math.round(minutiSeduta(lista)-minutiSeduta(corta))+" minuti in meno. I carichi non cambiano."});
  }
  /* 3 · una zona che fa male: cambia gli esercizi che la caricano, dove c'e' un'alternativa */
  var zone=stoZone();
  Object.keys(zone).forEach(function(z){
    var toccati=lista.filter(function(x){ var pd=posDef(x.n); return pd && pd.no && pd.no.indexOf(z)>=0; });
    if(!toccati.length) return;
    var cambi=[], restano=[];
    toccati.forEach(function(x){ var a=stoAlternativa(x, z); if(a) cambi.push([x.n, a]); else restano.push(x.n); });
    out.push({id:"zona|"+z+"|"+oggi, tipo:"zona", zona:z, cambi:cambi, restano:restano,
      t:zonaNome(z)+" "+zone[z].v+"/10: "+(cambi.length? "cambia "+cambi.length+" esercizi"+(cambi.length===1?"o":"") : "attenzione su "+restano.length+" esercizi"+(restano.length===1?"o":"")),
      perche:"Segnalata "+zone[z].da+". Questi esercizi la caricano: "+toccati.map(function(x){ return x.n; }).join(", ")+".",
      effetto:(cambi.length? "Per oggi: "+cambi.map(function(c){ return c[0]+" → "+c[1]; }).join("; ")+". " : "")+
        (restano.length? "Restano come sono, con un avviso sulla scheda: "+restano.join(", ")+". " : "")+"Regola: fino a 5/10 si continua, sopra ci si ferma."});
  });
  /* 4 · scendi di un gradino: salita recente ed esecuzione che non tiene */
  lista.forEach(function(x){
    var c=scendiCandidato(x); if(!c) return;
    var id="scendi|"+c.n+"|"+c.cur, dc=(S.proposte||{})[id];
    if(dc && dc.r==="no" && giorniDa(dc.d)<14) return;   /* hai detto no: non la ripropongo per due settimane */
    out.push({id:id, tipo:"scendi", ex:c.n, cur:c.cur, prev:c.prev,
      t:c.n+": torna a "+c.prev+" kg",
      perche:"Sei a "+c.cur+" kg da "+c.sedute+" sedut"+(c.sedute===1?"a":"e")+" e: "+c.segni.join("; ")+".",
      effetto:"Due sedute a "+c.prev+" kg con l'esecuzione pulita fino al top del range, poi risali. Per la crescita cambia poco se le serie restano vicine al limite; quello che perdi è un po' di forza massima, per poco."});
  });
  return out;
}
/* una serie in meno su tutto tranne il primo esercizio, mai sotto 2 */
function stoAccorcia(lista){
  return lista.map(function(x,i){ return i===0 ? Object.assign({}, x) : Object.assign({}, x, {s:Math.max(Math.min(2, x.s||2), (x.s||2)-1)}); });
}
/* la seduta con le proposte che hai autorizzato */
function stoApplicaLista(lista){
  if(!lista || !lista.length) return lista||[];
  var out=lista.map(function(x){ return Object.assign({}, x); }), oggi=today();
  var zone=stoZone();
  Object.keys(zone).forEach(function(z){
    if(stoDecisa("zona|"+z+"|"+oggi)!=="ok") return;
    out=out.map(function(x){
      var pd=posDef(x.n); if(!(pd && pd.no && pd.no.indexOf(z)>=0)) return x;
      var a=stoAlternativa(x, z); if(!a || out.some(function(y){ return y.n===a; })) return Object.assign(x, {zona:z});
      return Object.assign(altDef(a), {n:a, s:x.s, da:x.n, zona:z, perZona:true});
    });
  });
  if(stoDecisa("accorcia|"+oggi)==="ok") out=stoAccorcia(out).map(function(x,i){ if(x.s<lista[i].s) x.corta=true; return x; });
  return out;
}
/* il carico con cui partire: quello suggerito, o il gradino sotto se hai accettato di scendere */
function stoCarico(x, load){
  if(!load || x.b) return load;
  var id="scendi|"+x.n+"|"+load;
  if(stoDecisa(id)!=="ok") return load;
  var c=scendiCandidato(x);
  return (c && c.cur===load) ? c.prev : load;
}
/* avvisi sulla scheda dell'esercizio, in seduta */
function propNotaEsercizio(e, def){
  var h="";
  if(def.perZona) h+='<div class="flag info" style="margin-top:9px"><b>⟲</b><div>Oggi al posto di '+esc(def.da)+': la zona '+esc(zonaNome(def.zona).toLowerCase())+' era segnalata.</div></div>';
  else if(def.zona) h+='<div class="flag disc" style="margin-top:9px"><b>⚠</b><div>Carica la zona '+esc(zonaNome(def.zona).toLowerCase())+', segnalata oggi. Fino a 5/10 continua; se sale, ferma la serie e tocca ⚠ Dolore.</div></div>';
  if(def.scesoDa) h+='<div class="flag info" style="margin-top:9px"><b>↓</b><div><b>'+e.load+' kg invece di '+def.scesoDa+'.</b> Due sedute pulite fino al top del range, poi risali.</div></div>';
  if(def.corta) h+='<div class="xs mut" style="margin-top:8px">Seduta accorciata: una serie in meno, carico invariato.</div>';
  return h;
}

/* ---------- la scheda in Oggi ---------- */
function stoProposta(p){
  var d=stoDecisa(p.id);
  var h='<div class="prop" style="margin-top:10px'+(d==="ok"? ";border-color:var(--ok)" : d==="no"? ";opacity:.7" : "")+'">'+
    '<div class="sm" style="font-weight:700">'+esc(p.t)+'</div>'+
    '<div class="xs mut" style="margin-top:4px"><b>Perché.</b> '+esc(p.perche)+'</div>'+
    '<div class="xs mut" style="margin-top:3px"><b>Cosa cambia.</b> '+esc(p.effetto)+'</div>';
  if(!d) h+='<div class="grid2" style="margin-top:9px"><button class="btn sm pri" data-a="stook" data-id="'+esc(p.id)+'">Autorizzo</button>'+
    '<button class="btn sm ghost" data-a="stono" data-id="'+esc(p.id)+'">No, resto sul piano</button></div>';
  else h+='<div class="between" style="margin-top:8px"><div class="xs" style="font-weight:700;color:'+(d==="ok"?"var(--ok)":"var(--mut)")+'">'+(d==="ok"? "Autorizzata ✓" : "Rifiutata: resta il piano")+'</div>'+
    '<button class="lnk" data-a="stox" data-id="'+esc(p.id)+'">Cambia idea</button></div>';
  return h+'</div>';
}
function cardStato(lista, conSeduta){
  var st=statoOggi(), pr=conSeduta? proposteOggi(lista) : [];
  var h='<div class="card" style="border-color:'+STO_COL[st.lvl]+'"><div class="between"><div class="eyebrow" style="color:'+STO_COL[st.lvl]+'">Stato di oggi</div>'+
    '<button class="lnk" data-a="stoinfo">Come lo calcolo?</button></div>'+
    '<h2 style="margin:5px 0 8px;font-size:18px">'+STO_TIT[st.lvl]+'</h2>';
  st.segnali.forEach(function(x){
    var c = x.lvl==null ? "var(--faint)" : STO_COL[x.lvl];
    h+='<div class="strow"><i style="background:'+c+'"></i><span class="sn">'+esc(x.n)+'</span><span class="sv">'+esc(x.t)+'</span></div>';
  });
  var rcn=st.segnali.filter(function(x){ return x.k==="recupero" && x.nota; })[0];
  if(rcn && !pr.some(function(p){ return p.tipo==="fermi"; })) h+='<div class="xs mut" style="margin-top:8px">'+esc(rcn.nota)+'</div>';
  if(!st.segnali.some(function(x){ return x.k==="recupero" && x.lvl!=null; })) h+='<button class="btn sm" style="width:100%;margin-top:10px" data-a="ben" data-m="mattina">Compila il mattino</button>';
  if(conSeduta){
    if(pr.length){
      h+='<div class="eyebrow" style="margin-top:12px">'+(pr.length>1? pr.length+" proposte" : "Una proposta")+' per la seduta · decidi tu</div>';
      pr.forEach(function(p){ h+=stoProposta(p); });
    } else if(st.letti) h+='<div class="xs" style="margin-top:8px;color:var(--ok)">Nessuna modifica da proporre: la seduta resta quella del piano.</div>';
  } else {
    var sug=(typeof beneSuggerimentiOggi==="function")? beneSuggerimentiOggi(st) : [];
    sug.forEach(function(s){ h+='<div class="xs" style="margin-top:8px"><b>'+esc(s.t)+'</b> <span class="mut">'+esc(s.m)+'</span></div>'; });
  }
  return h+'</div>';
}
function stoInfo(){
  sheet('<div class="eyebrow glow">Stato di oggi</div><h2 style="margin:4px 0 8px">Come lo calcolo</h2>'+
    '<div class="sm">Metto insieme i dati che registri e li leggo uno accanto all\'altro. Ogni riga ha un colore: verde è nella norma, giallo è da tenere d\'occhio, rosso pesa da solo.</div>'+
    '<div class="gsez"><div class="eyebrow">I segnali</div><div class="sm">'+
    '<b>Recupero</b>: HRV sotto la tua fascia e FC a riposo sopra la norma insieme, oppure stress alto con sonno corto. '+
    '<b>Sonno</b>: media delle ultime 3 notti sotto '+dec(SONNO_BASSO)+' ore (rosso sotto 6). '+
    '<b>Stress e testa</b>: stress da '+STRESS_ALTO+' in su o testa a 2 o meno, su 3 giorni. '+
    '<b>Dolore</b>: una zona da '+STO_DOLORE+'/10 stamattina, sopra 5 nell\'ultima seduta se non è rientrata, o tre volte in 14 giorni. '+
    '<b>Carico</b>: serie dure degli ultimi 7 giorni oltre il '+Math.round(STO_CARICO*100)+'% della tua media. '+
    '<b>Cibo</b>: ieri sotto l\''+Math.round(STO_KCAL*100)+'% delle calorie previste. '+
    '<b>Reflusso</b>: 2 o 3 ieri sera.</div></div>'+
    '<div class="gsez"><div class="eyebrow">Il giudizio</div><div class="sm">Un rosso, o tre gialli insieme, fanno una giornata da gestire. Un giallo solo: avanti con giudizio.</div></div>'+
    '<div class="gsez"><div class="eyebrow">Le proposte</div><div class="sm">Niente cambia da solo: ogni modifica alla seduta è una proposta che autorizzi o rifiuti, e puoi cambiare idea finché non inizi. Le tue decisioni vanno nel briefing del coach.</div></div>'+
    '<div class="gsez"><div class="eyebrow">Perché proposte e non blocchi</div><div class="sm">Regolare l\'allenamento sull\'HRV rende più o meno come un piano fisso, con meno giornate a vuoto (<a href="https://pubmed.ncbi.nlm.nih.gov/34489178/" target="_blank" rel="noopener" style="color:var(--glow)">Düking 2021</a>; <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8507742/" target="_blank" rel="noopener" style="color:var(--glow)">Manresa-Rocamora 2021</a>): il segnale aiuta, ma non basta a decidere al posto tuo. '+
    'Scendere di un gradino quando l\'esecuzione non tiene costa poco: la crescita non dipende dal carico se la serie arriva vicino al limite (<a href="https://pubmed.ncbi.nlm.nih.gov/33433148/" target="_blank" rel="noopener" style="color:var(--glow)">Lopez 2021</a>). Le soglie sono scelte del progetto: il coach le può cambiare.</div></div>'+
    '<button class="btn" style="margin-top:14px" data-a="x">Chiudi</button>');
}
/* per il coach: stato e decisioni, in una riga */
function stoTestoCoach(){
  var st=statoOggi(), L=[];
  L.push("Stato di oggi: "+st.titolo.toLowerCase()+" · "+st.segnali.map(function(x){ return x.n+": "+x.t+(x.lvl>=1? " ["+(x.lvl>=2?"rosso":"giallo")+"]" : ""); }).join(" · "));
  var dec_=Object.keys(S.proposte||{}).filter(function(k){ return giorniDa(S.proposte[k].d)<=14; }).sort(function(a,b){ return s2d(S.proposte[b].d)-s2d(S.proposte[a].d); });
  if(dec_.length) L.push("Proposte dell'app, ultimi 14 giorni: "+dec_.map(function(k){ var p=S.proposte[k], a=k.split("|");
    return p.d.slice(0,5)+" "+a[0]+(a[0]==="scendi"? " "+a[1]+" da "+a[2]+" kg" : a[0]==="zona"? " "+a[1] : a[0]==="kcal"? " target a "+a[1] : a[0]==="prot"? " proteine a "+a[1]+" g" : "")+" → "+(p.r==="ok"?"autorizzata":"rifiutata"); }).join("; "));
  return L;
}

document.addEventListener("click", function(ev){
  var el=ev.target.closest("[data-a]"); if(!el) return;
  var a=el.dataset.a;
  if(a==="stook"||a==="stono"||a==="stox"){
    window._sy=window.scrollY;
    var id=el.dataset.id, sulTarget=/^(kcal|prot)\|/.test(id), fatto="";
    stoDecidi(id, a==="stook"? "ok" : a==="stono"? "no" : null);
    /* le proposte sul target del cibo si applicano subito; quelle sulla seduta quando la apri */
    if(a==="stook" && sulTarget && typeof fabApplica==="function") fatto=fabApplica(id);
    save(); render(); if(SYNC.on()) doPush(false);
    toast(a==="stook"? (fatto || "Autorizzata: vale dalla prossima seduta che apri") : a==="stono"? (sulTarget? "Rifiutata: il target resta com'è" : "Rifiutata: resta il piano") : "Proposta riaperta");
    return;
  }
  if(a==="stoinfo"){ stoInfo(); return; }
  if(a==="tec"){
    var d=S.draft, e=d && d.ex[+el.dataset.i]; if(!e) return;
    window._sy=window.scrollY;
    e.tec = (e.tec===+el.dataset.v) ? null : +el.dataset.v; save(); render(); return;
  }
});
