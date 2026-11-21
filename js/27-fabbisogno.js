/* ============================================================
   FABBISOGNO — quanto consumi, e quanto mangiare per crescere
   Due letture, una accanto all'altra:
   1. la formula: metabolismo a riposo di Mifflin-St Jeor per un
      fattore di attivita'. E' l'equazione che sbaglia meno fra le
      piu' usate, ma sul singolo l'errore puo' superare il 10%
      (Frankenfield 2005): serve a partire, non a decidere.
   2. i tuoi dati: calorie medie delle giornate registrate per
      intero, meno l'energia che e' finita nel peso che hai messo
      (o tolto). E' il bilancio energetico letto al contrario, come
      fanno le app a dispendio adattivo. Vale solo con abbastanza
      giornate complete e una pendenza del peso affidabile.
   Il target resta quello del piano alimentare del coach: l'app
   propone di spostarlo e tu autorizzi.
   Scelte del progetto: 7,7 kcal per grammo di peso (e' la regola
   corrente; nel modello di Hall 2011 il grasso vale 9,4 e la massa
   magra 1,8, quindi in crescita muscolare il dispendio vero e' un
   po' piu' alto di quello calcolato: per questo si mostra un
   margine); proteine almeno 1,6 g per kg (Morton 2018).
   ============================================================ */
var FAB_KCAL_G=7.7, FAB_FINESTRA=28, FAB_MIN_GIORNI=10, FAB_PASSO=50, FAB_SOGLIA=100, FAB_MAX=150;   /* regola 10: al massimo 150 kcal per volta, una modifica ogni 14 giorni (anche quella del Coach: cibOffTs) */
var FAB_PROT_KG=1.6, FAB_KCAL_PIANO=2550, FAB_PROT_PIANO=130, FAB_GRASSI=70;
var FAB_LAVORO=[["sed","Seduto","scrivania, auto",1.4],["misto","In piedi a tratti","ti muovi durante il giorno",1.55],["attivo","Fisico","in piedi o in movimento quasi sempre",1.75]];

/* target del piano: calorie spostate dalla proposta autorizzata, proteine sul peso se le hai alzate; i carboidrati assorbono */
cibTarget=function(){
  var off=S.cibOff||0, p=S.cibProt||FAB_PROT_PIANO, kcal=FAB_KCAL_PIANO+off;
  return {p:p, c:Math.round((kcal-4*p-9*FAB_GRASSI)/4), g:FAB_GRASSI, kcal:kcal, off:off};
};

function fabEta(){ var a=S.profilo && +S.profilo.anno; return a? new Date().getFullYear()-a : null; }
function fabSeduteSett(){ var n=S.sess.filter(function(s){ return !isRest(s) && dataOk(s.date) && giorniDa(s.date)>=0 && giorniDa(s.date)<28; }).length; return n/4; }
function fabPassi(){ var b=S.ben.filter(function(x){ return x.passi && dataOk(x.date) && giorniDa(x.date)<35; }).slice(-1)[0]; return b? +b.passi : null; }
/* 1 · la formula */
function fabFormula(){
  var pr=S.profilo||{}, peso=ultimoPeso(), alt=+pr.altezza, eta=fabEta(), manca=[];
  if(!peso) manca.push("una pesata"); if(!alt) manca.push("l'altezza"); if(!eta) manca.push("l'anno di nascita"); if(!pr.sesso) manca.push("il sesso"); if(!pr.lavoro) manca.push("il tipo di giornata");
  if(manca.length) return {ok:false, manca:manca};
  var bmr=10*peso+6.25*alt-5*eta+(pr.sesso==="F"? -161 : 5);
  var lav=FAB_LAVORO.filter(function(x){ return x[0]===pr.lavoro; })[0]||FAB_LAVORO[0];
  var sed=Math.min(5, fabSeduteSett()), passi=fabPassi();
  var pal=lav[3]+0.025*sed+(passi==null? 0 : passi<5000? -0.05 : passi>=10000? 0.05 : 0);
  return {ok:true, bmr:Math.round(bmr), pal:Math.round(pal*100)/100, tdee:Math.round(bmr*pal/10)*10, peso:peso, eta:eta, sedute:r1(sed), passi:passi, lavoro:lav[1]};
}
/* giornate registrate per intero: i tre pasti principali fatti o segnati come saltati, nessuna stima provvisoria */
function fabGiorni(){
  return S.ben.filter(function(b){
    if(!b.cibJ || !dataOk(b.date)) return false;
    var g=giorniDa(b.date); if(g<1 || g>FAB_FINESTRA) return false;
    if(cibStimato(b.date)) return false;
    var d=cibDay(b.date);
    if(!["col","pra","cen"].every(function(k){ return (d[k]||[]).length || pastoSaltato(d, k); })) return false;
    return kcalGiorno(b)>=1200;
  }).map(function(b){ return {date:b.date, kcal:kcalGiorno(b), p:b.cibP||0}; });
}
/* 2 · i tuoi dati */
function fabReale(){
  var gg=fabGiorni(), sl=weightSlope();
  if(gg.length<FAB_MIN_GIORNI) return {ok:false, n:gg.length, why:gg.length+" giornat"+(gg.length===1?"a":"e")+" registrat"+(gg.length===1?"a":"e")+" per intero negli ultimi "+FAB_FINESTRA+" giorni: ne servono "+FAB_MIN_GIORNI};
  if(!sl.ok) return {ok:false, n:gg.length, why:"pendenza del peso non ancora affidabile ("+(sl.why||"poche pesate")+")"};
  var k=gg.map(function(x){ return x.kcal; }), m=media(k), var_=media(k.map(function(x){ return (x-m)*(x-m); })), se=Math.sqrt(var_/k.length);
  var daPeso=sl.g/7*FAB_KCAL_G;
  return {ok:true, n:gg.length, mangiato:Math.round(m), pendenza:sl.g, daPeso:Math.round(daPeso), tdee:Math.round((m-daPeso)/10)*10,
    margine:Math.round((2*se+80)/10)*10, sporca:!!sl.noisy, prot:Math.round(media(gg.map(function(x){ return x.p; })))};
}
/* quanto sopra il dispendio per stare nel corridoio di crescita */
function fabSurplus(){ var c=pesoCorridoio(); return Math.round((c[0]+c[1])/2/7*FAB_KCAL_G/10)*10; }
function fabQuadro(){
  var f=fabFormula(), r=fabReale(), tg=cibTarget(), peso=ultimoPeso(), sur=fabSurplus();
  var disp = r.ok? r.tdee : f.ok? f.tdee : null;
  var q={formula:f, reale:r, target:tg, peso:peso, surplus:sur, dispendio:disp, fonte: r.ok? "dati" : f.ok? "formula" : null, proposte:[]};
  /* calorie: solo dai tuoi dati, e non piu' di una volta ogni due settimane */
  var fresca = S.cibOffTs && dataOk(S.cibOffTs) && giorniDa(S.cibOffTs)<14;
  if(r.ok && !fresca){
    var nuovo=Math.round((r.tdee+sur)/FAB_PASSO)*FAB_PASSO, diff=nuovo-tg.kcal;
    if(Math.abs(diff)>FAB_MAX){ diff=diff>0? FAB_MAX : -FAB_MAX; nuovo=tg.kcal+diff; }
    if(Math.abs(diff)>=FAB_SOGLIA){ var id="kcal|"+nuovo;
      if(!(stoDecisa(id)==="no" && giorniDa(S.proposte[id].d)<14)) q.proposte.push({id:id, tipo:"kcal", v:nuovo,
        t:"Porta il target a "+kfmt(nuovo)+" kcal ("+(diff>0?"+":"")+diff+")",
        perche:"Negli ultimi "+FAB_FINESTRA+" giorni hai mangiato in media "+kfmt(r.mangiato)+" kcal e il peso si è mosso di "+(r.pendenza>0?"+":"")+r.pendenza+" g a settimana: consumi circa "+kfmt(r.tdee)+" kcal (± "+r.margine+"). Per crescere di "+pesoCorridoio().join("-")+" g a settimana servono circa "+sur+" kcal in più.",
        effetto:"Il target passa da "+kfmt(tg.kcal)+" a "+kfmt(nuovo)+" kcal. La differenza va sui carboidrati; proteine e grassi restano. Rispetto a quello che mangi oggi ("+kfmt(r.mangiato)+" kcal) sono "+(nuovo-r.mangiato>=0?"+":"")+kfmt(nuovo-r.mangiato)+" kcal al giorno"+
          (r.mangiato<tg.kcal*0.92 && nuovo>r.mangiato? ": il punto non è il numero sul piano, è arrivarci." : ".")}); }
  }
  /* proteine: almeno 1,6 g per kg del peso di adesso */
  if(peso){ var minP=Math.ceil(FAB_PROT_KG*peso/5)*5;
    if(tg.p<minP){ var idp="prot|"+minP;
      if(!(stoDecisa(idp)==="no" && giorniDa(S.proposte[idp].d)<28)) q.proposte.push({id:idp, tipo:"prot", v:minP,
        t:"Porta le proteine a "+minP+" g al giorno",
        perche:"Pesi "+dec(peso)+" kg: "+tg.p+" g sono "+dec(r1(tg.p/peso))+" g per kg, sotto gli 1,6 che la letteratura indica come soglia utile per la massa (Morton 2018).",
        effetto:"Proteine da "+tg.p+" a "+minP+" g; le calorie non cambiano, i carboidrati scendono di "+(minP-tg.p)+" g."}); }
  }
  return q;
}
/* la riga dentro la scheda Cibo */
function fabRiga(){
  var q=fabQuadro(); if(q.dispendio==null) return '<div class="xs mut" style="margin-top:6px">Fabbisogno: completa il profilo per una stima. <button class="lnk" data-a="profilo">Apri il profilo</button></div>';
  var h='<div class="xs mut" style="margin-top:6px">Fabbisogno stimato '+(q.fonte==="dati"? "dai tuoi dati" : "dalla formula")+': <b style="color:var(--bone)">'+kfmt(q.dispendio)+' kcal</b>'+
    (q.fonte==="dati"? " (± "+q.reale.margine+")" : "")+' · target '+(q.target.kcal-q.dispendio>=0?"+":"")+(q.target.kcal-q.dispendio)+' sopra. <button class="lnk" data-a="fabinfo">Dettagli</button></div>';
  q.proposte.forEach(function(p){ h+=stoProposta(p); });
  return h;
}
/* la scheda in Corpo */
function cardFabbisogno(){
  var q=fabQuadro(), f=q.formula, r=q.reale, tg=q.target;
  var h='<div class="card"><div class="between"><div class="eyebrow glow">Fabbisogno e target</div><button class="btn sm ghost" data-a="profilo">Profilo</button></div>';
  h+='<div class="grid3" style="margin-top:10px">'+
    mini("Dalla formula", f.ok? kfmt(f.tdee)+' <small>kcal</small>' : "–")+
    mini("Dai tuoi dati", r.ok? kfmt(r.tdee)+' <small>kcal</small>' : "–")+
    mini("Target", kfmt(tg.kcal)+' <small>kcal</small>')+'</div>';
  if(f.ok) h+='<div class="xs mut" style="margin-top:8px"><b>Formula.</b> A riposo '+kfmt(f.bmr)+' kcal ('+dec(f.peso)+' kg, '+f.eta+' anni) × attività '+dec(f.pal)+' ('+f.lavoro.toLowerCase()+', '+dec(f.sedute)+' sedute a settimana'+(f.passi? ', '+kfmt(f.passi)+' passi' : '')+').</div>';
  else h+='<div class="xs" style="margin-top:8px;color:var(--amb)">Per la formula manca: '+esc(f.manca.join(", "))+'. <button class="lnk" data-a="profilo">Completa il profilo</button></div>';
  if(r.ok) h+='<div class="xs mut" style="margin-top:6px"><b>Dati.</b> '+r.n+' giornate complete: '+kfmt(r.mangiato)+' kcal mangiate in media, peso '+(r.pendenza>0?"+":"")+r.pendenza+' g a settimana ('+(r.daPeso>0?"+":"")+r.daPeso+' kcal al giorno finite nel peso). Margine ± '+r.margine+(r.sporca? ', pendenza calcolata anche su pesate di rientro' : '')+'.</div>';
  else h+='<div class="xs mut" style="margin-top:6px"><b>Dati.</b> Non ancora: '+esc(r.why)+'. Contano solo le giornate con colazione, pranzo e cena registrati (o segnati come saltati) e senza voci stimate.</div>';
  h+='<div class="xs mut" style="margin-top:6px"><b>Target.</b> '+tg.p+' g proteine'+(q.peso? ' ('+dec(r1(tg.p/q.peso))+' g/kg)' : '')+' · '+tg.c+' g carboidrati · '+tg.g+' g grassi. Per crescere di '+pesoCorridoio().join("-")+' g a settimana servono circa '+q.surplus+' kcal sopra il dispendio.</div>';
  if(f.ok && r.ok && Math.abs(f.tdee-r.tdee)>250) h+='<div class="flag info" style="margin-top:8px"><b>≠</b><div>Formula e dati distano '+kfmt(Math.abs(f.tdee-r.tdee))+' kcal. Vale il dato misurato su di te, se le giornate sono registrate per intero; altrimenti la differenza è cibo non segnato.</div></div>';
  q.proposte.forEach(function(p){ h+=stoProposta(p); });
  if(!q.proposte.length && q.dispendio!=null) h+='<div class="xs" style="margin-top:8px;color:var(--ok)">Nessuna modifica da proporre al target.</div>';
  h+='<button class="lnk xs" style="margin-top:8px" data-a="fabinfo">Come lo calcolo e con quali fonti</button></div>';
  return h;
}
function fabInfo(){
  sheet('<div class="eyebrow glow">Fabbisogno</div><h2 style="margin:4px 0 8px">Come lo calcolo</h2>'+
    '<div class="gsez"><div class="eyebrow">1 · La formula, per partire</div><div class="sm">Metabolismo a riposo di Mifflin-St Jeor (10 × peso + 6,25 × altezza − 5 × età, + 5 per gli uomini, − 161 per le donne), moltiplicato per un fattore di attività: 1,4 se lavori seduto, 1,55 se ti muovi, 1,75 se il lavoro è fisico; + 0,025 per ogni seduta a settimana; ± 0,05 per i passi. '+
    'È l\'equazione che sbaglia meno tra le più usate, ma sul singolo l\'errore può superare il 10% (<a href="https://pure.psu.edu/en/publications/comparison-of-predictive-equations-for-resting-metabolic-rate-in-/" target="_blank" rel="noopener" style="color:var(--glow)">Frankenfield 2005</a>). I fattori di attività sono una scelta del progetto.</div></div>'+
    '<div class="gsez"><div class="eyebrow">2 · I tuoi dati, quando bastano</div><div class="sm">Calorie medie delle giornate registrate per intero negli ultimi '+FAB_FINESTRA+' giorni, meno l\'energia finita nel peso: pendenza del peso × 7,7 kcal al grammo. Servono almeno '+FAB_MIN_GIORNI+' giornate complete e una pendenza affidabile. '+
    'È lo stesso principio delle app a dispendio adattivo (<a href="https://macrofactor.com/algorithm-accuracy/" target="_blank" rel="noopener" style="color:var(--glow)">MacroFactor</a>). Il margine tiene conto di quanto variano le tue giornate e del fatto che un grammo di muscolo contiene meno energia di un grammo di grasso (<a href="https://pubmed.ncbi.nlm.nih.gov/21872751/" target="_blank" rel="noopener" style="color:var(--glow)">Hall 2011</a>).</div></div>'+
    '<div class="gsez"><div class="eyebrow">3 · Il target</div><div class="sm">Dispendio più il surplus che serve a stare nel corridoio di crescita del piano. Se il target attuale dista più di '+FAB_SOGLIA+' kcal ti propongo di spostarlo, al massimo di '+FAB_MAX+' per volta e non più di una volta ogni due settimane. Le proteine non scendono sotto 1,6 g per kg. I grassi restano a '+FAB_GRASSI+' g: è la scelta del piano per il reflusso.</div></div>'+
    '<div class="gsez"><div class="eyebrow">Cosa lo rende affidabile</div><div class="sm">Registrare tutti e tre i pasti principali, pesare dove puoi invece di stimare, pesarti al mattino almeno 3 volte a settimana. Una giornata con una voce ancora «stimata» non entra nel calcolo.</div></div>'+
    '<button class="btn" style="margin-top:14px" data-a="x">Chiudi</button>');
}
/* autorizzare una proposta sul target la applica subito */
function fabApplica(id){
  var a=id.split("|"), v=+a[1];
  if(a[0]==="kcal"){ S.cibOff=v-FAB_KCAL_PIANO; S.cibOffTs=today(); cfgTocca("cibo"); return "Target a "+kfmt(v)+" kcal"; }
  if(a[0]==="prot"){ S.cibProt=v; cfgTocca("cibo"); return "Proteine a "+v+" g"; }
  return "";
}
/* il profilo: i pochi dati fissi che servono a formula e KPI */
formProfilo=function(){
  var p=S.profilo||{}, pe=ultimoPeso();
  var pills=function(id, opz, sel){ return '<div class="pills" id="'+id+'" style="flex-wrap:wrap">'+opz.map(function(o){ return '<button class="pill'+(sel===o[0]?" on":"")+'" data-pv="'+o[0]+'">'+o[1]+(o[2]? ' <span class="mut" style="font-weight:400">· '+o[2]+'</span>' : '')+'</button>'; }).join("")+'</div>'; };
  sheet('<div class="eyebrow">Profilo</div><h2 style="margin:4px 0 10px">Dati fissi</h2>'+
    '<div class="grid2"><label class="fld" style="margin:0"><span class="eyebrow">Altezza (cm)</span><input type="number" inputmode="numeric" id="pAlt" value="'+(p.altezza||"")+'" placeholder="es. 170"></label>'+
    '<label class="fld" style="margin:0"><span class="eyebrow">Anno di nascita</span><input type="number" inputmode="numeric" id="pAnno" value="'+(p.anno||"")+'" placeholder="es. 1979"></label></div>'+
    '<div class="eyebrow" style="margin:12px 0 6px">Sesso (per la formula del metabolismo)</div>'+pills("pSesso", [["M","Uomo"],["F","Donna"]], p.sesso)+
    '<div class="eyebrow" style="margin:12px 0 6px">La tua giornata tipo, allenamento escluso</div>'+pills("pLav", FAB_LAVORO, p.lavoro)+
    '<div class="xs mut" style="margin-top:8px">L\'altezza serve al rapporto vita/altezza; il resto alla stima del fabbisogno. Il peso arriva dalle pesate del mattino'+(pe?': ultimo '+dec(pe)+' kg':'')+'.</div>'+
    '<button class="btn pri" style="margin-top:14px" data-a="saveprof">Salva</button>'+
    '<button class="btn ghost" style="margin-top:8px" data-a="x">Annulla</button>');
};
saveProfilo=async function(){
  var a=num(document.getElementById("pAlt").value), an=num(document.getElementById("pAnno").value);
  if(a!=null && (a<120 || a>220)){ toast("Altezza in centimetri, tra 120 e 220"); return; }
  var ora=new Date().getFullYear();
  if(an!=null && (an<ora-100 || an>ora-14)){ toast("Anno di nascita a quattro cifre"); return; }
  var s=document.querySelector("#pSesso .pill.on"), l=document.querySelector("#pLav .pill.on");
  S.profilo=Object.assign({}, S.profilo||{}, {altezza:a, anno:an, sesso:s? s.dataset.pv : (S.profilo||{}).sesso||"", lavoro:l? l.dataset.pv : (S.profilo||{}).lavoro||""}); cfgTocca("profilo");
  var ok=await save(); closeSheet(); render(); if(SYNC.on()) doPush(false);
  toast(ok? "Profilo salvato" : "NON salvato: vedi la scheda Coach");
};
document.addEventListener("click", function(ev){
  var pv=ev.target.closest("[data-pv]");
  if(pv){ [].forEach.call(pv.parentNode.querySelectorAll(".pill"), function(b){ b.classList.toggle("on", b===pv); }); return; }
  var el=ev.target.closest("[data-a]"); if(!el) return;
  if(el.dataset.a==="fabinfo"){ fabInfo(); return; }
});
