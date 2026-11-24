/* ============================================================
   CONSIGLIO DEL GIORNO (proposta 36, approvata il 24/11/2026)
   Ogni mattina, dopo il benessere, Oggi mostra UN consiglio:
   cosa fare oggi, la tecnica per riuscirci, il dato che lo fa
   scattare e la fonte. Regole fisse, niente testo generato:
   - senza il mattino compilato non c'e' consiglio;
   - prima i segnali di stamattina, nell'ordine di CONS_OGGI;
   - poi i KPI in rosso, poi in giallo, nell'ordine della regola 68
     (cibo, recupero, abitudini, allenamento), a rotazione per giorno;
   - tutto in verde: un consiglio per tenere l'area piu' debole.
   Mai sul dolore notturno ne' sul bruciore (regola 19: medico).
   La risposta (Fatto / Non oggi) va nella colonna cons di App_Benessere.
   ============================================================ */

/* ---------- ore della tua giornata ---------- */
function consHm(min){ min=((Math.round(min)%1440)+1440)%1440; return ("0"+Math.floor(min/60)).slice(-2)+":"+("0"+(min%60)).slice(-2); }
function consSera(){ return hm(orari().sera); }                       /* l'ora del modulo della sera: quando vai a dormire, circa */
function consCaffe(){ return consHm(consSera()-6*60); }               /* Drake 2013: niente caffeina 6 ore prima del sonno */
function consCena(){                                                   /* la tua ora tipica di fine cena, o 3 ore prima di dormire */
  var v=S.ben.filter(function(b){ return dataOk(b.date) && giorniDa(b.date)>=0 && giorniDa(b.date)<28; })
    .map(function(b){ var o=(typeof cenaOra==="function")? cenaOra(b) : null; return o? hm(o) : null; }).filter(function(x){ return x!=null; });
  var limite=consSera()-3*60;
  if(v.length>=4){ var m=Math.round(mediana(v)); return {ora:consHm(Math.min(m, limite)), tipica:consHm(m), tardi: m>limite}; }
  return {ora:consHm(limite), tipica:null, tardi:false};
}
function consSeduta(){ var pe=(typeof pianoDelGiorno==="function")? pianoDelGiorno(today()) : null; return (pe && pe.stato==="oggi")? pe : null; }
/* un'ora libera per la camminata svelta: lontana dalla seduta, almeno 2 ore prima di dormire, non gia' passata */
function consOraSvelta(){
  var pe=consSeduta(), so=pe && pe.ora? hm(pe.ora) : null, ora=oraMin(), lim=consSera()-120;
  var c=[18*60+30, 13*60+30, 7*60].filter(function(t){ return t<=lim && t>ora+20 && (so==null || Math.abs(t-so)>=120); });
  return c.length? consHm(c[0]) : null;
}
/* i tuoi alimenti */
function consProteico(){
  var v=cibStorico("col").concat(cibStorico("sm"), cibStorico("sp")).filter(function(x){ return x.p>=15 && !x.a; })
    .sort(function(a,b){ return (b.cnt-a.cnt)||(b.p-a.p); })[0];
  return v? v.n : "yogurt greco o latte proteico";
}
function consSpuntino(){
  var v=cibStorico("sm").concat(cibStorico("sp")).filter(function(x){ var k=kcalDi(x); return k>=200 && k<=450 && !x.a; })
    .sort(function(a,b){ return b.cnt-a.cnt; })[0];
  return v? v.n+" ("+Math.round(kcalDi(v))+" kcal)" : "pane e bresaola, o yogurt greco con frutta secca";
}

/* ---------- 1 · i segnali di stamattina, in ordine ---------- */
var CONS_OGGI=[
  {id:"recupero", n:"Recupero", fonti:["piano","gollwitzer"],
   se:function(c){ var r=recovery(today()); return r.lvl>=1 && r.parts.some(function(p){ return /^HRV |^FC riposo|^HybridCharge/.test(p); }) ? r.parts.join(" · ") : null; },
   f:function(c){ return {t:"Giornata da tenere",
     m:"La camminata svelta oggi diventa lenta (20-30′) e in seduta niente record: il corpo sta ancora recuperando.",
     tec:"Scrivilo ora: «se finisco il lavoro, allora 20′ a passo lento»."}; }},
  {id:"sonno", n:"Sonno della notte", fonti:["drake","brooks"],
   se:function(c){ return (c.b.sonno!=null && c.b.sonno<SONNO_BASSO)? "sonno "+sonnoTxt(c.b.sonno) : null; },
   f:function(c){ return {t:"Notte corta: proteggi la prossima",
     m:"Ultimo caffè entro le "+consCaffe()+". Se puoi, un pisolino entro le 15. Stasera a letto 30′ prima del solito.",
     tec:"Pisolino a sveglia: 15′ sdraiato, poi in piedi. Oltre i 30′ peggiora."}; }},
  {id:"alcol", n:"Alcol", fonti:["piano"],
   se:function(c){ return c.b.alc? "alcol ieri sera" : null; },
   f:function(c){ return {t:"Ieri alcol: oggi niente",
     m:"Niente alcol stasera e in seduta non cercare i record: l'alcol abbassa l'HRV della notte dopo.",
     tec:"Decidi adesso cosa bevi stasera al posto dell'alcol."}; }},
  {id:"stress", n:"Stress e mente", fonti:["balban"],
   se:function(c){ var i=c.ieri; if(!i) return null; return (i.stress!=null && i.stress>=STRESS_ALTO)? "stress "+i.stress+" ieri sera" : (i.mente!=null && i.mente<=2)? "mente "+i.mente+" ieri sera" : null; },
   f:function(c){ return {t:"Cinque minuti per scaricare",
     m:"Sospiro ciclico per 5′: due inspirazioni dal naso (la seconda breve, a riempire), poi una espirazione lunga e lenta dalla bocca. Ripeti.",
     tec:"Legalo a un gesto fisso: subito dopo pranzo, prima di tornare al lavoro."}; }},
  {id:"reflusso", n:"Reflusso", fonti:["acg","buffey"],
   se:function(c){ var i=c.ieri; return (i && i.refl!=null && i.refl>=2)? "reflusso "+i.refl+" ieri sera" : null; },
   f:function(c){ var ce=consCena(); return {t:"Cena presto e leggera",
     m:"Cena finita entro le "+ce.ora+", i grassi a pranzo e non a cena, 10′ di camminata dopo cena.",
     tec:"«Se mi alzo da tavola, allora 10′ fuori»."}; }},
  {id:"cibo", n:"Cibo di ieri", fonti:["piano"],
   se:function(c){ var s=c.st.segnali.filter(function(x){ return x.k==="cibo" && x.lvl>=1; })[0]; return s? s.t : null; },
   f:function(c){ return {t:"Recupera il cibo di ieri",
     m:"Una porzione in più di carboidrati a colazione e a pranzo. Non spostare tutto a cena: peggiora il reflusso.",
     tec:"Prepara stasera la colazione di domani."}; }},
  {id:"fuori", n:"Notte fuori casa", fonti:["piano"],
   se:function(c){ return c.b.sede==="Fuori"? "notte fuori"+(c.b.citta? " ("+c.b.citta+")" : "") : null; },
   f:function(c){ return {t:"Fuori casa: proteine e seduta corta",
     m:"Seduta T1 o T2 con le bande o a corpo libero. A ogni pasto fuori ordina un secondo di proteine.",
     tec:"Decidi ora a che ora ti alleni e mettilo in agenda."}; }},
  {id:"dolore", n:"Dolore", fonti:["piano","silbernagel"],
   se:function(c){ var m=dolDi(c.b,"dolmz","dolm"), z=Object.keys(m).filter(function(k){ return m[k]>=3; });
     return z.length? z.map(function(k){ return zonaNome(k).toLowerCase()+" "+m[k]+"/10"; }).join(", ")+" stamattina" : null; },
   f:function(c){ return {t:"Dolore: muoviti senza provocarlo",
     m:"Riscaldamento completo. In seduta, se arriva a 3/10, cambi esercizio (regola 15). Fuori seduta muoviti senza provocarlo.",
     tec:"Segnalo subito col pulsante Dolore: le date servono al fisioterapista."}; }}
];

/* ---------- 2 · i KPI da migliorare, nell'ordine della regola 68 ---------- */
var CONS_KPI={
  proteine:   {fonti:["morton","aragon"], f:function(c){ var g=Math.round((ultimoPeso()||66)*0.4); return {t:"Proteine a colazione",
    m:"Colazione con circa "+g+" g di proteine (0,4 g/kg), per esempio con "+consProteico()+".", tec:"Mettilo in vista la sera prima."}; }},
  pendenza:   {fonti:["iraki"], f:function(c){ return c.v.v<0 || c.v.v<(pesoCorridoio()[0])? {t:"Peso sotto il corridoio: uno spuntino in più",
    m:"Oggi uno spuntino in più: "+consSpuntino()+".", tec:"Pre-impegno: mettilo nello zaino già stamattina."}
    : {t:"Peso sopra il corridoio: la sera più leggera", m:"Niente bis a cena e mezza porzione di carboidrati la sera.", tec:"Porzione nel piatto, pentola in cucina."}; }},
  kcal:       {fonti:["iraki"], f:function(c){ return c.v.v<0? {t:"Calorie sotto il target: uno spuntino in più",
    m:"Oggi uno spuntino in più: "+consSpuntino()+".", tec:"Pre-impegno: mettilo nello zaino già stamattina."}
    : {t:"Calorie sopra il target: la sera più leggera", m:"Niente bis a cena e mezza porzione di carboidrati la sera.", tec:"Porzione nel piatto, pentola in cucina."}; }},
  giorni_cibo:{fonti:["gollwitzer"], f:function(){ return {t:"Registra ogni pasto",
    m:"Subito dopo ogni pasto, 20 secondi: «come l'ultima volta» o una delle tue ricette.", tec:"«Se mi alzo da tavola, allora registro»."}; }},
  vita_altezza:{fonti:["nice","sandercock"], f:function(){ var o=consOraSvelta(); return {t:"Vita: camminata svelta e niente alcol",
    m:"Oggi 30′ di camminata svelta"+(o? " alle "+o : "")+" e niente alcol stasera.", tec:"Se-allora con l'ora già scritta."}; }},
  hrv7:       {fonti:["plews","sandercock"], f:function(){ var o=consOraSvelta(); return {t:"HRV bassa in settimana: tieni",
    m:"Settimana da tenere, non da spingere: camminata svelta"+(o? " alle "+o : "")+" (regola 76) e a letto alla stessa ora.", tec:"Metti una sveglia anche per andare a letto."}; }},
  fc7:        {fonti:["piano"], f:function(){ return {t:"FC a riposo alta: due giorni tranquilli",
    m:"Niente serie a cedimento per due giorni. Se compaiono sintomi di malanno, fai la seduta da 15′.", tec:"Decidi adesso la versione corta, così non devi pensarci dopo."}; }},
  sonno7:     {fonti:["aasm","drake"], f:function(){ return {t:"Più sonno questa settimana",
    m:"Schermi spenti alle "+orari().sera+" e ultimo caffè entro le "+consCaffe()+".", tec:"Stessa ora per 7 sere di fila."}; }},
  stress7:    {fonti:["balban"], f:function(){ return {t:"Stress in settimana: sospiro ciclico",
    m:"Sospiro ciclico per 5′ ogni giorno: due inspirazioni dal naso, una espirazione lunga dalla bocca.", tec:"Sempre dopo lo stesso gesto, per esempio dopo pranzo."}; }},
  reflusso7:  {fonti:["acg"], f:function(){ var ce=consCena(); return {t:"Reflusso in settimana: anticipa la cena",
    m:"Cena finita entro le "+ce.ora+(ce.tipica && ce.tardi? " (di solito finisci alle "+ce.tipica+")" : "")+"; i grassi nella prima parte della giornata.",
    tec:"In Corpo, la lettura «Ora della cena e reflusso» ti dice se funziona."}; }},
  dolore:     {fonti:["piano","silbernagel"], f:function(){ return {t:"Dolore ricorrente: al fisioterapista con le date",
    m:"Porta al fisioterapista le date del dolore (sono nel foglio). In seduta usa le alternative che l'app propone.", tec:"Prepara l'elenco delle date oggi."}; }},
  passi:      {fonti:["paluch","buffey"], f:function(){ return {t:"Più passi: dopo i pasti",
    m:"10-15′ a piedi dopo pranzo e dopo cena: sono circa 3.000 passi.", tec:"«Se finisco di mangiare, allora esco 10′»."}; }},
  ipopnea:    {fonti:["piano"], f:function(){ return {t:"Ipopnea alta: niente alcol la sera",
    m:"Niente alcol la sera. Se resta sopra 5 per settimane, mostralo al medico: il wearable non fa diagnosi.", tec:"Segna la data in cui ne parli."}; }},
  mobilita:   {fonti:["piano"], f:function(){ return {t:"Mobilità: lavora il lato limitato",
    m:"5′ di mobilità sul lato limitato dopo la seduta.", tec:"Sempre dopo l'ultimo esercizio, prima di sederti."}; }},
  completezza:{fonti:["gollwitzer"], f:function(){ return {t:"Registra il mattino appena sveglio",
    m:"HRV, FC, HybridCharge, sonno e peso appena sveglio: un minuto.", tec:"«Se spengo la sveglia, allora apro Rachide»."}; }},
  camminate:  {fonti:["buffey"], f:function(){ return {t:"Una camminata dopo cena",
    m:"10′ a piedi dopo cena, a passo tranquillo.", tec:"«Se mi alzo da tavola, allora 10′ fuori»."}; }},
  svelta:     {fonti:["piano","sandercock","gollwitzer"], f:function(){ var o=consOraSvelta(); return {t:"Camminata svelta di oggi",
    m:"30′ svelta"+(o? " alle "+o : " in un'ora libera")+", almeno 1 h dopo un pasto pieno, al ritmo in cui parli ma non canti (regola 76).", tec:"Se-allora con l'ora già scritta: «alle "+(o||"…")+" esco a camminare»."}; }},
  mente:      {fonti:["balban"], f:function(){ return {t:"Testa giù: una pausa vera",
    m:"Sospiro ciclico 5′ e una pausa vera a metà giornata, lontano dallo schermo.", tec:"Mettila in agenda come un appuntamento."}; }},
  resp:       {fonti:["gollwitzer"], f:function(){ return {t:"Respirazione 4-7 stasera",
    m:"Respirazione 4-7 appena ti metti a letto.", tec:"Legata a quel gesto, sempre lo stesso."}; }},
  aderenza:   {fonti:["gollwitzer"], f:function(){ var pe=consSeduta(); return {t:"La prossima seduta con l'ora",
    m:(pe? "Oggi seduta "+pe.d+(pe.ora? " alle "+pe.ora : "")+"." : "Fissa adesso giorno e ora della prossima seduta.")+" Se manca tempo, la versione da 15′ vale.", tec:"Se-allora con l'ora della seduta."}; }},
  serie_gruppo:{fonti:["schoenfeld"], f:function(){ return {t:"Gruppi fuori range",
    m:"Prima della prossima seduta apri «Adatta la settimana»: sistema le serie dei gruppi che mancano.", tec:"Un minuto, prima di cambiarti."}; }},
  serie_dure: {fonti:["carichi"], f:function(){ return {t:"Serie più vicine al limite",
    m:"Nelle ultime serie chiediti «ne farei ancora 3?». Se la risposta è sì, la serie era comoda.", tec:"Segna il RIR a ogni serie."}; }},
  top_range:  {fonti:["piano"], f:function(){ return {t:"Segna il RIR di ogni serie",
    m:"Senza RIR l'app non può farti salire: segnalo a ogni serie.", tec:"Subito, prima di appoggiare i pesi."}; }},
  record:     {fonti:["piano"], f:function(){ return {t:"Segna il RIR di ogni serie",
    m:"Senza RIR l'app non può farti salire: segnalo a ogni serie.", tec:"Subito, prima di appoggiare i pesi."}; }},
  cedimenti:  {fonti:["piano"], f:function(){ return {t:"Composti: fermati prima",
    m:"Sui composti chiudi a RIR 1-2, mai a cedimento.", tec:"Conta ad alta voce le ultime due ripetizioni."}; }},
  durata:     {fonti:["singer"], f:function(){ return {t:"Seduta più corta",
    m:"Recuperi a timer e telefono lontano fra le serie.", tec:"Timer dell'app sempre acceso."}; }},
  asimmetria: {fonti:["piano"], f:function(){ return {t:"Parti dal lato debole",
    m:"Negli esercizi a un lato parti dal lato debole; l'altro si ferma allo stesso numero.", tec:"Il lato debole è quello che l'app segna come «più duro»."}; }}
};
var CONS_ORDINE=["proteine","pendenza","kcal","giorni_cibo","vita_altezza",
  "hrv7","fc7","sonno7","stress7","reflusso7","dolore","passi","ipopnea","mobilita",
  "completezza","camminate","svelta","mente","resp",
  "aderenza","serie_gruppo","serie_dure","top_range","record","cedimenti","durata","asimmetria"];
/* tutto in verde: un gesto per tenere l'area piu' debole dell'indice */
var CONS_TIENI={
  recupero:"a letto alla stessa ora anche nel fine settimana", testa:"sospiro ciclico 5′ dopo pranzo",
  corpo:"5′ di mobilità dopo la seduta", movimento:"camminata svelta da 30′ (regola 76)",
  cibo:"proteine a ogni pasto principale", digestione:"cena finita 3 ore prima di dormire"
};

/* ---------- la scelta ---------- */
function consValori(){
  var val=kpiValori(), out={};
  CONS_ORDINE.forEach(function(id){
    if(id==="mente" || id==="resp"){ var e=beneExtra(id); if(e) out[id]={v:e.v, txt:e.txt, stato:e.stato}; }
    else if(val[id]) out[id]=val[id];
  });
  return out;
}
function consiglioOggi(){
  var oggi=today(), b=benOn(oggi);
  if(!mattinaFatta(b)) return null;
  var ieri=benOn(stoGiorno(1)), c={b:b, ieri:ieri, st:statoOggi()};
  /* 1 · segnali di stamattina */
  for(var i=0;i<CONS_OGGI.length;i++){
    var x=CONS_OGGI[i], d=x.se(c);
    if(d) return Object.assign({id:x.id, n:x.n, dato:d, fonti:x.fonti, tipo:"oggi"}, x.f(c));
  }
  /* 2 · KPI in rosso, poi in giallo, a rotazione per giorno */
  var val=consValori(), giorno=Math.floor(s2d(oggi).getTime()/86400000);
  var scegli=function(st){ return CONS_ORDINE.filter(function(id){ return val[id] && val[id].stato===st && CONS_KPI[id]; }); };
  var lista=scegli("ko"); if(!lista.length) lista=scegli("att");
  if(lista.length){
    var id=lista[giorno%lista.length], def=CONS_KPI[id], kd=KPI.filter(function(k){ return k.id===id; })[0];
    var nome=kd? kd.nome : (id==="mente"? "Mente" : "Respirazione 4-7");
    return Object.assign({id:id, n:nome, dato:nome+": "+val[id].txt+(val[id].stato==="ko"? " (fuori)" : " (attenzione)"), fonti:def.fonti, tipo:"kpi", altri:lista.length-1}, def.f({v:val[id]}));
  }
  /* 3 · tutto in verde */
  var ix=beneIndice(), deb=ix.aree.filter(function(a){ return a.punti!=null; }).sort(function(a,b){ return a.punti-b.punti; })[0];
  if(!deb) return null;
  return {id:"tieni_"+deb.k, n:deb.n, tipo:"tieni", dato:"tutti i KPI in verde; l'area meno forte è "+deb.n.toLowerCase()+" ("+deb.punti+"/100)", fonti:["piano"],
    t:"Tutto in verde: tieni", m:"Per tenere "+deb.n.toLowerCase()+": "+CONS_TIENI[deb.k]+".", tec:"Stesso momento della giornata, ogni giorno."};
}

/* ---------- risposta: Fatto / Non oggi ---------- */
function consRisposta(b){
  var v=b && b.cons ? String(b.cons).split(":") : null;
  return v && v.length===2 ? {id:v[0], fatto:v[1]==="1"} : null;
}
async function consSegna(id, fatto){
  var dt=today(), b=benOn(dt); if(!b) return;
  b.cons=id+":"+(fatto?1:0); benTouch(dt);
  var ok=await save(); if(SYNC.on()) doPush(false);
  render(); toast(!ok? "NON salvato: vedi la scheda Coach" : fatto? "Segnato come fatto" : "Va bene, domani un altro");
}
/* per il briefing: il consiglio di oggi e le risposte dei 7 giorni */
function consTestoCoach(){
  var c=consiglioOggi(), fatti=0, risposte=0;
  for(var i=0;i<7;i++){ var r=consRisposta(benOn(stoGiorno(i))); if(r){ risposte++; if(r.fatto) fatti++; } }
  return "- Consiglio del giorno: "+(c? c.t+" ("+c.dato+")" : "nessuno (mattino non compilato)")+
    " | ultimi 7 giorni: "+(risposte? fatti+" fatti su "+risposte+" risposte" : "nessuna risposta");
}

/* ---------- la scheda in Oggi ---------- */
function consFonti(k){
  return (k||[]).map(function(f){ var x=FONTI[f]; if(!x) return ""; var t=x.t.split(" · ")[0];
    return x.u? '<a href="'+esc(x.u)+'" target="_blank" rel="noopener" style="color:var(--glow)">'+esc(t)+'</a>' : esc(t); }).filter(Boolean).join(" · ");
}
function cardConsiglio(){
  var c=consiglioOggi(); if(!c) return "";
  var r=consRisposta(benOn(today())), detto = r && r.id===c.id;
  var h='<div class="card" style="border-color:var(--glow)"><div class="between"><div class="eyebrow glow">Consiglio di oggi</div>'+
    (detto? '<div class="xs" style="font-weight:700;color:'+(r.fatto?"var(--ok)":"var(--mut)")+'">'+(r.fatto? "fatto ✓" : "non oggi")+'</div>' : '')+'</div>'+
    '<h2 style="margin:5px 0 6px;font-size:17px">'+esc(c.t)+'</h2>'+
    '<div class="sm">'+esc(c.m)+'</div>'+
    '<div class="sm" style="margin-top:8px"><b>Come:</b> '+esc(c.tec)+'</div>'+
    '<div class="xs mut" style="margin-top:8px">Perché: '+esc(c.dato)+(c.altri? ' · altri '+c.altri+' da migliorare, a turno nei prossimi giorni' : '')+'</div>'+
    '<div class="xs mut" style="margin-top:3px">Fonte: '+consFonti(c.fonti)+'</div>';
  if(!detto) h+='<div class="grid2" style="margin-top:10px"><button class="btn sm" data-a="consok" data-id="'+esc(c.id)+'">Fatto</button>'+
    '<button class="btn sm ghost" data-a="consno" data-id="'+esc(c.id)+'">Non oggi</button></div>';
  return h+'</div>';
}
document.addEventListener("click", function(ev){
  var el=ev.target.closest("[data-a]"); if(!el) return;
  if(el.dataset.a==="consok"){ consSegna(el.dataset.id, true); return; }
  if(el.dataset.a==="consno"){ consSegna(el.dataset.id, false); return; }
});
