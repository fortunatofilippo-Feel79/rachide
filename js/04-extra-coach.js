/* ============================================================
   MODULO F — EXTRA DI OGGI
   Un esercizio aggiunto alla sola sessione in corso. Non entra nel
   piano: finisce nel log come tutti gli altri, ma domani non c'e' piu'.
   Le serie in piu' su un esercizio previsto funzionavano gia': il
   contatore non ha tetto, la scheda si attenua e basta. Qui si
   aggiunge solo il pezzo che mancava.

   Come sta in piedi: ogni voce della bozza puo' portarsi dietro la
   propria definizione in "def". Dove prima si leggeva PLAN[day].ex[i]
   ora si legge e.def || PLAN[day].ex[i], cosi' un esercizio fuori
   piano non sfasa l'allineamento per posizione con il piano.
   ============================================================ */

/* definizione di ripiego per un esercizio non previsto oggi */
function extraDef(nome){
  var m=meta(nome);
  var iso = m.t==="iso";
  var def = {n:nome, s:3, lo: iso?12:8, hi: iso?15:12, tip:""};
  if(m.sec){ def.lo=20; def.hi=40; }          /* tenute a tempo */
  if(m.band) def.b = lastBand(nome,"verde") || "verde";
  if(m.uni)  def.u = true;
  return def;
}

/* gli esercizi degli altri giorni del piano: tecnica e carichi gia' noti */
function extraSuggeriti(){
  var d=S.draft; if(!d) return [];
  var gia={}; d.ex.forEach(function(e){ gia[e.n]=1; });
  var out=[];
  /* prima il resto del giorno stesso (utile nella versione da 45'), poi gli altri giorni */
  [d.day].concat(Object.keys(PLAN).filter(function(k){ return k!==d.day; })).forEach(function(k){
    (PLAN[k].ex||[]).forEach(function(x){
      if(gia[x.n]) return; gia[x.n]=1;
      out.push({n:x.n, da:(k===d.day?"oggi, dal piano":"giorno "+k), def:Object.assign({}, x)});
    });
  });
  return out;
}
/* tutto il resto del catalogo */
function extraCatalogo(){
  var d=S.draft; if(!d) return {};
  var gia={}; d.ex.forEach(function(e){ gia[e.n]=1; });
  extraSuggeriti().forEach(function(x){ gia[x.n]=1; });
  var per={};
  Object.keys(EX).forEach(function(n){
    if(gia[n]) return;
    var g=EX[n].g||"Altro";
    (per[g]||(per[g]=[])).push(n);
  });
  return per;
}

function extraAdd(nome, daPiano){
  var d=S.draft; if(!d) return;
  if(d.ex.some(function(e){ return e.n===nome; })){ toast("C'\u00e8 gi\u00e0 in questa sessione"); return; }
  var def = daPiano ? (extraSuggeriti().filter(function(x){ return x.n===nome; })[0]||{}).def : null;
  if(!def) def = extraDef(nome);
  def = Object.assign({}, def, {n:nome});
  var m=meta(nome);
  d.ex.push({n:nome, def:def, extra:true,
    load: def.b?0:suggestLoad(def), band: def.b?lastBand(nome,def.b):"",
    sets:[], rir:null, note:"",
    cur: def.u ? {S:(m.sec?def.hi:def.lo), D:(m.sec?def.lo:def.lo)} : {v:(m.sec?def.hi:def.lo)}});
  save(); closeSheet(); render();
  toast(nome+" aggiunto solo per oggi");
}
function extraDel(i){
  var d=S.draft; if(!d) return;
  var e=d.ex[i]; if(!e||!e.extra) return;
  if(e.sets.length && !confirm("Togliere "+e.n+"? Le serie registrate vanno perse.")) return;
  d.ex.splice(i,1); save(); render();
}

function formExtra(){
  var sug=extraSuggeriti(), cat=extraCatalogo();
  var h='<div class="eyebrow amb">Solo per oggi</div>'+
    '<h2 style="margin:3px 0 2px;font-size:18px">Aggiungi un esercizio</h2>'+
    '<div class="sm mut" style="margin-bottom:12px">Vale per questa sessione. Il piano non cambia: domani non lo trovi.</div>';

  if(sug.length){
    h+='<div class="eyebrow" style="margin-bottom:6px">Dagli altri giorni</div>'+
       '<div class="xs mut" style="margin-bottom:6px">Tecnica e carichi gi\u00e0 tuoi: parte dall\'ultimo che hai fatto.</div>'+
       '<div class="card" style="padding:2px 12px;margin-bottom:14px">';
    sug.forEach(function(x){
      var m=meta(x.n), ll=lastLoad(x.n,0);
      h+='<button class="item" data-a="exadd" data-n="'+esc(x.n)+'" data-p="1">'+
         '<div class="t"><b>'+esc(x.n)+'</b><span class="xs mut">'+esc(m.g||"")+' \u00b7 '+esc(x.da)+
         (ll?' \u00b7 ultimo '+ll+' kg':'')+'</span></div>'+
         '<div style="font-weight:700;color:var(--glow)">+</div></button>';
    });
    h+='</div>';
  }

  var gruppi=Object.keys(cat).sort();
  if(gruppi.length){
    h+='<div class="eyebrow" style="margin-bottom:6px">Resto del catalogo</div><div class="card" style="padding:2px 12px">';
    gruppi.forEach(function(g){
      h+='<div class="eyebrow" style="padding:9px 0 3px;color:var(--mut)">'+esc(g)+'</div>';
      cat[g].forEach(function(n){
        var ll=lastLoad(n,0), m=meta(n);
        h+='<button class="item" data-a="exadd" data-n="'+esc(n)+'">'+
           '<div class="t"><b>'+esc(n)+'</b><span class="xs mut">'+
           (m.band?"con banda":(m.sec?"a tempo":(m.t==="iso"?"isolamento":"multiarticolare")))+
           (ll?' \u00b7 ultimo '+ll+' kg':'')+'</span></div>'+
           '<div style="font-weight:700;color:var(--glow)">+</div></button>';
      });
    });
    h+='</div>';
  } else if(!sug.length){
    h+='<div class="card flat" style="text-align:center;padding:18px"><div class="sm mut">Hai gi\u00e0 in sessione tutto il catalogo.</div></div>';
  }

  h+='<button class="btn ghost" style="margin-top:14px" data-a="x">Chiudi</button>';
  sheet(h);
}

/* ============================================================
   MODULO G — CONSIGLI DEL COACH
   Quello che il coach dice in chat si perde. Le patch invece cambiano
   il piano per sempre, che e' un'altra cosa. Qui sta la via di mezzo:
   un promemoria legato a un giorno del piano, che ricompare a ogni
   sessione finche' non lo segni come fatto.

   Arriva come operazione di patch, quindi e' verificabile e annullabile
   come tutto il resto:
     {"op":"nota","d":"A","t":"Aggiungi 2 serie di Box Squat","n":"Box Squat"}
   "d" omesso = vale per tutti i giorni. "n" = esercizio da aggiungere
   con un tocco, se non e' gia' in programma quel giorno.
   ============================================================ */
var COACH=[];

function coachNote(op, ts, k){
  COACH.push({
    id: (ts||"") + "#" + k,
    d: op.d || "",
    t: op.t || "",
    n: op.n || "",
    ts: ts || ""
  });
}
function coachPer(day){
  var fatti=S.cdone||{};
  return COACH.filter(function(x){
    return (!x.d || x.d===day) && !fatti[x.id];
  });
}
async function coachFatto(id){
  S.cdone = S.cdone || {};
  S.cdone[id] = true;
  await save();
  render();
}
async function coachRiapri(){
  S.cdone = {};
  await save();
  render();
}

/* il riquadro in cima alla sessione */
function coachCard(day){
  var note=coachPer(day);
  if(!note.length) return "";
  var d=S.draft;
  var h='<div class="card cnote"><div class="eyebrow amb">Dal coach \u00b7 '+note.length+
        (note.length>1?' promemoria':' promemoria')+'</div>';
  note.forEach(function(x){
    var gia = d && d.ex.some(function(e){ return e.n===x.n; });
    var noto = x.n && EX[x.n];
    h+='<div class="cn"><div class="ct">'+esc(x.t)+
       (x.ts?'<span class="xs mut"> \u00b7 '+esc(x.ts)+'</span>':'')+'</div><div class="cb">';
    if(x.n && noto && !gia) h+='<button class="btn sm" data-a="cnadd" data-n="'+esc(x.n)+'">Aggiungi '+esc(x.n)+'</button>';
    h+='<button class="btn sm ghost" data-a="cnok" data-id="'+esc(x.id)+'">Fatto</button>';
    h+='</div></div>';
  });
  h+='</div>';
  return h;
}
/* l'avviso nella schermata Oggi, prima di iniziare */
function coachBadge(day){
  var n=coachPer(day).length;
  if(!n) return "";
  return '<div class="flag info" style="margin-top:8px"><b>'+n+'</b><div>'+
    (n===1?'Un promemoria del coach':'Promemoria del coach: '+n)+' per il giorno '+day+
    '. Li vedi appena apri la sessione.</div></div>';
}

