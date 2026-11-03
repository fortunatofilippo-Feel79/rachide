/* ============================================================
   PROMEMORIA — quando registrare, anche ad app chiusa
   Le notifiche web su iPhone, ad app chiusa, richiedono un server
   push. Il calendario del telefono invece suona sempre: l'app genera
   un file .ics con eventi ricorrenti e allarme, una volta sola.
   Orari in ora locale "fluttuante": seguono il fuso del telefono.
   ============================================================ */
function icsData(d, hhmm){
  var p=function(n){ return String(n).padStart(2,"0"); }, a=String(hhmm||"07:30").split(":");
  return d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+"T"+p(+a[0]||0)+p(+a[1]||0)+"00";
}
function icsTesto(s){ return String(s).replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\n/g,"\\n"); }
/* il prossimo giorno (da domani) che soddisfa la condizione */
function prossimoGiorno(cond){
  var d=new Date(); d.setHours(12,0,0,0);
  for(var i=0;i<60;i++){ d.setDate(d.getDate()+1); if(cond(d)) return new Date(d.getTime()); }
  return d;
}
function icsPromemoria(){
  var o=orari(), url=(location.origin+location.pathname).replace(/index\.html$/,""), ev=[];
  var domani=prossimoGiorno(function(){ return true; });
  var domenica=prossimoGiorno(function(d){ return d.getDay()===0; });
  /* il lunedi' della prossima settimana del check simmetria (31, 35, 39...) */
  var lunSim=prossimoGiorno(function(d){ var w=weekOf(d2s(d)); return d.getDay()===1 && w>=31 && (w-31)%4===0; });
  var add=function(id, titolo, inizio, ora, rrule, testo){
    ev.push(["BEGIN:VEVENT","UID:rachide-"+id+"@rachide","DTSTAMP:"+icsData(new Date(), "00:00"),
      "DTSTART:"+icsData(inizio, ora),"DURATION:PT5M","RRULE:"+rrule,
      "SUMMARY:"+icsTesto(titolo),"DESCRIPTION:"+icsTesto(testo+"\n"+url),"URL:"+url,
      "BEGIN:VALARM","ACTION:DISPLAY","DESCRIPTION:"+icsTesto(titolo),"TRIGGER:PT0M","END:VALARM","END:VEVENT"].join("\r\n"));
  };
  add("mattino", "Rachide · mattino (1 minuto)", domani, o.mattina, "FREQ=DAILY",
      "Da Zepp: HRV, FC a riposo, sonno. Peso dopo il bagno, a digiuno. Spalla sinistra 0-10.");
  add("sera", "Rachide · sera (30 secondi)", domani, o.sera, "FREQ=DAILY",
      "Reflusso, camminate dopo i pasti, stress, testa. Controlla che i pasti siano tutti registrati.");
  add("domenica", "Rachide · chiusura della settimana", domenica, o.domenica, "FREQ=WEEKLY;BYDAY=SU",
      "Tre domande, i giorni delle 4 sedute. Da Zepp: passi medi e indice di ipopnea.");
  add("misure", "Rachide · misure (3 minuti)", domenica, o.mattina, "FREQ=WEEKLY;INTERVAL=2;BYDAY=SU",
      "Al mattino a digiuno, dopo il bagno, stesso metro: peso, vita, torace, braccio, coscia.");
  add("simmetria", "Rachide · check simmetria e mobilità", lunSim, o.mattina, "FREQ=WEEKLY;INTERVAL=4;BYDAY=MO",
      "Questa settimana: check simmetria durante le sedute. Ogni 28 giorni anche i test di mobilità.");
  return ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Rachide//Promemoria//IT","CALSCALE:GREGORIAN","METHOD:PUBLISH",
    "X-WR-CALNAME:Rachide"].concat(ev).concat(["END:VCALENDAR"]).join("\r\n")+"\r\n";
}
function cardPromemoria(){
  var o=orari(), son=suoniOn();
  var h='<div class="eyebrow" style="margin:18px 0 6px">Promemoria e suoni</div><div class="card">'+
    '<div class="sm">Quando registrare: il mattino al risveglio, la sera prima di dormire, la domenica la chiusura.</div>'+
    '<div class="grid3" style="margin-top:10px">'+
      [["mattina","Mattino"],["sera","Sera"],["domenica","Domenica"]].map(function(x){
        return '<label class="fld" style="margin:0"><span class="eyebrow">'+x[1]+'</span><input type="time" data-o="'+x[0]+'" value="'+esc(o[x[0]])+'"></label>'; }).join("")+'</div>'+
    '<button class="btn pri" style="margin-top:12px" data-a="ics">Aggiungi i promemoria al calendario</button>'+
    '<div class="xs mut" style="margin-top:6px">Scarica un file .ics: il telefono lo apre nel Calendario e ti avvisa a quegli orari anche ad app chiusa. '+
    'Cambi gli orari? Rimuovi il calendario «Rachide» e riaggiungilo. Dall\'icona sulla Home il file a volte non si apre: in quel caso apri l\'app in Safari e ripeti.</div>'+
    '<hr class="hair">'+
    '<div class="between"><div><div class="sm" style="font-weight:600">Suoni</div><div class="xs mut">Serie salvata, recupero, conto alla rovescia, timer, record</div></div>'+
      '<button class="btn sm '+(son?"":"ghost")+'" data-a="suoni" aria-pressed="'+son+'">'+(son?"Attivi":"Spenti")+'</button></div>'+
    (son? '<div class="between" style="margin-top:10px"><div><div class="sm" style="font-weight:600">Anche col silenzioso</div><div class="xs mut">iPhone con iOS 17 o successivo</div></div>'+
      '<button class="btn sm '+(S.suoniSilenzioso!==false?"":"ghost")+'" data-a="silenz">'+(S.suoniSilenzioso!==false?"Sì":"No")+'</button></div>'+
      '<div class="between" style="margin-top:10px"><div class="sm" style="font-weight:600">Volume</div>'+
      '<div class="row"><button class="btn sm '+(S.volume==="basso"?"":"ghost")+'" data-a="vol" data-v="basso">Basso</button><button class="btn sm '+(S.volume!=="basso"?"":"ghost")+'" data-a="vol" data-v="normale">Normale</button></div></div>'+
      '<button class="btn sm ghost" style="width:100%;margin-top:10px" data-a="suonoprova">Prova i suoni</button>' : '')+
    '</div>';
  return h;
}
function salvaOrario(k, v){
  if(!/^\d{2}:\d{2}$/.test(v)) return;
  S.orari=Object.assign({}, S.orari||{}); S.orari[k]=v; cfgTocca("orari"); save();
}
function provaSuoni(){
  suonoPronto();
  ["serie","conto","fine","bersaglio","salvata"].forEach(function(t,i){ setTimeout(function(){ suono(t); }, i*700); });
}
