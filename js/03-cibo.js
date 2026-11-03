/* ============================================================
   MODULO E — CIBO
   La giornata e' fatta di pasti, non di un totale. Ogni pasto e'
   un contenitore di voci; ogni voce e' un alimento del catalogo
   con una quantita', oppure una descrizione a parole in attesa
   che il coach la converta.
   I dati vivono sulla riga benessere del giorno (campo cibJ),
   come passi e ipopnea: nessuna tab nuova sul foglio.
   cibP/cibC/cibG restano come totali derivati, ricalcolati a ogni
   modifica, cosi' il foglio e il briefing leggono numeri semplici.
   ============================================================ */
var BLK     = {p:26, c:58, g:11};
var BLK_TGT = {p:5,  c:6,  g:6};

/* i pasti del Piano_Alimentare, con il loro atteso in grammi */
var MEALS=[
  {k:"col", n:"Colazione",           p:26, c:70,  g:14},
  {k:"sm",  n:"Spuntino mattina",    p:13, c:35,  g:7},
  {k:"pra", n:"Pranzo",              p:39, c:105, g:21},
  {k:"sp",  n:"Spuntino pomeriggio", p:13, c:35,  g:7},
  {k:"cen", n:"Cena",                p:39, c:105, g:21},
  {k:"ex",  n:"Fuori pasto",         p:0,  c:0,   g:0}
];
function meal(k){ return MEALS.filter(function(m){ return m.k===k; })[0] || MEALS[5]; }

/* catalogo: un alimento = una porzione di riferimento in grammi di macro */
var CIBI=[
  {cat:"col", n:"Milk Pro High Protein", d:"bottiglia 330ml",   p:35, c:13, g:1},
  {cat:"col", n:"Milk Pro mezza",        d:"165ml",             p:18, c:6,  g:0},
  {cat:"col", n:"Mukky",                 d:"150ml",             p:10, c:5,  g:0},
  {cat:"col", n:"Biscotti Protein G",    d:"6 biscotti (~65g)", p:9,  c:34, g:13},
  {cat:"col", n:"Mandorle",              d:"7 pezzi (~8g)",     p:2,  c:2,  g:4},
  {cat:"col", n:"Avena",                 d:"70g",               p:9,  c:45, g:5},
  {cat:"col", n:"Yogurt greco 0%",       d:"250g",              p:25, c:10, g:0},
  {cat:"prot", n:"Pollo",            d:"petto 150g cotto",   p:33, c:0,  g:4},
  {cat:"prot", n:"Tacchino",         d:"fesa 150g cotta",    p:34, c:0,  g:3},
  {cat:"prot", n:"Pesce bianco",     d:"180g",               p:36, c:0,  g:2},
  {cat:"prot", n:"Salmone",          d:"150g cotto",         p:33, c:0,  g:13},
  {cat:"prot", n:"Tonno naturale",   d:"scatoletta 80g",     p:18, c:0,  g:1},
  {cat:"prot", n:"Tonno grande",     d:"scatoletta 120g",    p:26, c:0,  g:1},
  {cat:"prot", n:"Bresaola",         d:"80g",                p:26, c:0,  g:2},
  {cat:"prot", n:"Uova",             d:"3 grandi",           p:18, c:1,  g:15},
  {cat:"prot", n:"Albume",           d:"200g",               p:22, c:2,  g:0},
  {cat:"prot", n:"Fiocchi di latte", d:"200g",               p:24, c:6,  g:8},
  {cat:"prot", n:"Legumi cotti",     d:"250g",               p:16, c:40, g:3},
  {cat:"prot", n:"Whey isolate",     d:"1 misurino",         p:26, c:2,  g:1},
  {cat:"carb", n:"Riso",     d:"80g a crudo",  p:6,  c:62, g:1},
  {cat:"carb", n:"Pasta",    d:"80g a crudo",  p:10, c:60, g:1},
  {cat:"carb", n:"Patate",   d:"300g",         p:6,  c:60, g:0},
  {cat:"carb", n:"Pane",     d:"100g",         p:9,  c:52, g:1},
  {cat:"carb", n:"Banana",   d:"1 media",      p:1,  c:25, g:0},
  {cat:"carb", n:"Mela o pera", d:"1 media",   p:0,  c:20, g:0},
  {cat:"gras", n:"Olio EVO",     d:"1 cucchiaio", p:0, c:0, g:12},
  {cat:"gras", n:"Frutta secca", d:"20g",         p:4, c:1, g:11},
  {cat:"gras", n:"Avocado",      d:"50g",         p:1, c:1, g:7},
  {cat:"gras", n:"Parmigiano",   d:"20g",         p:7, c:0, g:7},
  {cat:"pia", n:"Pizza",          d:"margherita intera",    p:26, c:116, g:33},
  {cat:"pia", n:"Lasagne",        d:"porzione ristorante",  p:26, c:58,  g:33},
  {cat:"pia", n:"Hamburger e patatine", d:"",               p:26, c:116, g:44},
  {cat:"pia", n:"Cotoletta",      d:"o altro fritto",       p:26, c:29,  g:33},
  {cat:"pia", n:"Risotto",        d:"porzione",             p:6,  c:58,  g:22},
  {cat:"pia", n:"Dolce",          d:"al ristorante",        p:2,  c:58,  g:22},
  {cat:"pia", n:"Primo in mensa", d:"pasta o riso condito", p:10, c:70,  g:14},
  {cat:"pia", n:"Secondo magro",  d:"griglia, in mensa",    p:32, c:0,   g:8},
  {cat:"pia", n:"Contorno",       d:"verdure con olio",     p:2,  c:8,   g:10}
];
var CIB_CAT=[["col","Colazione"],["prot","Proteine"],["carb","Carbo"],["gras","Grassi"],["pia","Piatti"]];

/* ricette = combinazioni di voci del catalogo, smontabili dopo l'inserimento */
var RICETTE=[
  {n:"Colazione Parma",     m:"col", v:[["Milk Pro High Protein",1],["Mandorle",1],["Biscotti Protein G",1]]},
  {n:"Colazione Gallarate", m:"col", v:[["Milk Pro mezza",1],["Mukky",1],["Mandorle",1],["Biscotti Protein G",1]]},
  {n:"Pranzo tipo casa",    m:"pra", v:[["Pesce bianco",1],["Riso",1],["Olio EVO",1]]},
  {n:"Cena tipo casa",      m:"cen", v:[["Tacchino",1],["Patate",1],["Olio EVO",1]]},
  {n:"Mensa Parma",         m:"pra", v:[["Primo in mensa",1],["Secondo magro",1],["Contorno",1]]}
];

/* alimenti e ricette aggiunti dalle patch del coach */
var CIBX=[], CIBR=[];
function cibCat(){ return CIBI.concat(CIBX); }
function cibRic(){ return RICETTE.concat(CIBR); }
function cibFind(n){ return cibCat().filter(function(x){ return x.n===n; })[0]; }

/* ---------- giorno di lavoro ---------- */
var CIB_DAY=0;
function cibDayLabel(n){
  if(!n) return "oggi"; if(n===1) return "ieri";
  var d=new Date(); d.setDate(d.getDate()-n);
  var g=["dom","lun","mar","mer","gio","ven","sab"][d.getDay()];
  return g+" "+("0"+d.getDate()).slice(-2)+"/"+("0"+(d.getMonth()+1)).slice(-2);
}
function cibDayPills(mk,cat){
  var h="";
  for(var n=0;n<=6;n++){
    h+='<button class="pill'+(CIB_DAY===n?" on":"")+'" data-a="cibday" data-v="'+n+'" data-m="'+mk+'" data-c="'+cat+'">'+
       (n===0?"Oggi":n===1?"Ieri":cibDayLabel(n))+'</button>';
  }
  return h;
}
function cibDate(){
  if(!CIB_DAY) return today();
  var d=new Date(); d.setDate(d.getDate()-CIB_DAY); return d2s(d);
}

/* ---------- lettura e scrittura della giornata ---------- */
function cibVuoto(){ return {col:[],sm:[],pra:[],sp:[],cen:[],ex:[]}; }
function cibDay(date){
  var b=benOn(date||cibDate());
  if(!b) return cibVuoto();
  if(b.cibJ){
    try{ return Object.assign(cibVuoto(), JSON.parse(b.cibJ)); }catch(e){}
  }
  var g=cibVuoto();
  if(b.cibL){                                   /* migrazione dalla versione a elenco */
    String(b.cibL).split(";").filter(Boolean).forEach(function(v){
      var a=v.split("|");
      g.ex.push({n:a[0], p:+a[1]||0, c:+a[2]||0, g:+a[3]||0, q:1});
    });
  }
  return g;
}
function cibSomma(items){
  var t={p:0,c:0,g:0};
  (items||[]).forEach(function(v){ var q=v.q||1; t.p+=(v.p||0)*q; t.c+=(v.c||0)*q; t.g+=(v.g||0)*q; });
  return t;
}
function cibTot(g){
  var t={p:0,c:0,g:0};
  MEALS.forEach(function(m){
    var s=cibSomma(g[m.k]); t.p+=s.p; t.c+=s.c; t.g+=s.g;
  });
  return t;
}
async function cibSave(g,date){
  var dt=date||cibDate(), b=benOn(dt);
  if(!b){
    b={date:dt, w:weekOf(dt), refl:null, resp:false, camm:null, hrv:null, read:null,
       sonno:null, alc:false, peso:null, rhr:null, stress:null, mente:null,
       passi:null, ipo:null, note:""};
    S.ben.push(b);
  }
  var t=cibTot(g);
  b.cibJ=JSON.stringify(g); b.cibL="";
  b.cibP=Math.round(t.p); b.cibC=Math.round(t.c); b.cibG=Math.round(t.g);
  benTouch(dt);
  var ok=await save();
  if(SYNC.on()) doPush(false);
  if(!ok) toast("NON salvato: vedi la scheda Coach");
  return ok;
}
function cibOn(date){
  var b=benOn(date||cibDate());
  return {p:(b&&b.cibP)||0, c:(b&&b.cibC)||0, g:(b&&b.cibG)||0};
}
function cibBlk(o){ return {p:o.p/BLK.p, c:o.c/BLK.c, g:o.g/BLK.g}; }
function b1(n){ return (Math.round(n*10)/10).toString().replace(".",","); }
function q1(n){ return n===1 ? "" : " \u00d7"+b1(n); }

/* ---------- target, ricalibrato sui dati raccolti ---------- */
function cibTarget(){
  var off=S.cibOff||0;                       /* scostamento in kcal, deciso da te */
  var carbOff=Math.round(off/4);             /* lo assorbono i carboidrati */
  return {p:130, c:350+carbOff, g:70, kcal:2550+off, off:off};
}
function cibProposta(){
  if(typeof weightSlope!=="function") return null;
  var sl=weightSlope();
  if(!sl || !sl.ok) return null;
  var off=S.cibOff||0;
  if(S.cibOffTs){
    var giorni=(new Date().getTime()-s2d(S.cibOffTs).getTime())/86400000;
    if(giorni<14) return null;               /* una proposta ogni due settimane, non di piu' */
  }
  /* regola del Piano alimentare: si ricalibra solo dopo due letture di fila fuori corridoio */
  var pr=weightSlope(new Date().setHours(23,59,59,999)-7*86400000);
  if(!pr || !pr.ok) return null;
  if(sl.g<150 && pr.g<150) return {dir:1,  kcal:off+150, txt:"Pendenza "+sl.g+" g a settimana (una settimana fa "+pr.g+"): sotto il corridoio 150-250 per due letture di fila."};
  if(sl.g>250 && pr.g>250) return {dir:-1, kcal:off-150, txt:"Pendenza +"+sl.g+" g a settimana (una settimana fa +"+pr.g+"): sopra il corridoio 150-250 per due letture di fila."};
  return null;
}

/* ---------- voci ---------- */
async function cibAdd(mk, nome, qta){
  var g=cibDay(), x=cibFind(nome);
  if(!x) return false;
  var lst=g[mk]||(g[mk]=[]);
  var gia=lst.filter(function(v){ return v.n===nome && !v.w; })[0];
  if(gia) gia.q=(gia.q||1)+(qta||1);
  else lst.push({n:x.n, d:x.d, p:x.p, c:x.c, g:x.g, q:qta||1});
  return cibSave(g);
}
async function cibAddRic(mk, nome){
  var r=cibRic().filter(function(x){ return x.n===nome; })[0];
  if(!r) return false;
  var g=cibDay(), lst=g[mk]||(g[mk]=[]);
  r.v.forEach(function(pair){
    var x=cibFind(pair[0]); if(!x) return;
    var gia=lst.filter(function(v){ return v.n===x.n && !v.w; })[0];
    if(gia) gia.q=(gia.q||1)+pair[1];
    else lst.push({n:x.n, d:x.d, p:x.p, c:x.c, g:x.g, q:pair[1]});
  });
  return cibSave(g);
}
/* Voce descritta a parole. Vale una stima provvisoria finche' il coach non la
   converte: quanto manca a chiudere quel pasto, che e' il caso piu' probabile
   quando descrivi il piatto principale. Resta marcata come provvisoria. */
/* La stima provvisoria parte dal pasto tipo moltiplicato per la porzione che
   scegli (piccola, normale, abbondante): prevedibile, e vicina al vero per il
   piatto principale. Fuori pasto si usa lo spuntino come riferimento. */
var PORZ=[["Piccola",0.5],["Normale",1],["Abbondante",1.4]];
async function cibAddLibero(mk, testo, fatt){
  if(!testo) return false;
  var g=cibDay(), m=meal(mk), f=fatt||1;
  var base = m.p ? m : meal("sm");
  /* il secondo piatto dello stesso pasto non vale un pasto intero:
     la stima provvisoria e' quanto manca a chiudere il pasto, con un minimo del 15% */
  var gia = cibSomma(g[mk]||[]);
  var st={p:Math.round(Math.max(base.p*0.15, base.p-gia.p)*f),
          c:Math.round(Math.max(base.c*0.15, base.c-gia.c)*f),
          g:Math.round(Math.max(base.g*0.15, base.g-gia.g)*f)};
  (g[mk]||(g[mk]=[])).push({n:testo, p:st.p, c:st.c, g:st.g, q:1, w:1});
  return cibSave(g);
}
/* una voce gia' nota (dal tuo storico o dal catalogo), con i suoi valori */
async function cibAddVoce(mk, v){
  var g=cibDay(), lst=g[mk]||(g[mk]=[]);
  var gia=lst.filter(function(x){ return !x.w && x.n===v.n && x.p===v.p && x.c===v.c && x.g===v.g; })[0];
  if(gia) gia.q=(gia.q||1)+1;
  else { var nv={n:v.n, d:v.d||"", p:v.p, c:v.c, g:v.g, q:1}; if(v.bc) nv.bc=v.bc; lst.push(nv); }   /* bc: prodotto letto col codice a barre */
  return cibSave(g);
}
function cibIeri(){ var d=s2d(cibDate()); d.setDate(d.getDate()-1); return d2s(d); }
async function cibRipeti(mk){
  var y=cibDay(cibIeri())[mk]||[]; if(!y.length) return false;
  var g=cibDay(), lst=g[mk]||(g[mk]=[]);
  y.forEach(function(v){ lst.push(JSON.parse(JSON.stringify(v))); });
  return cibSave(g);
}
/* cosa mangi davvero: le voci delle ultime 4 settimane, con i valori gia'
   convertiti. Prima quelle usate in questo pasto, poi le piu' frequenti. */
function cibStorico(mk){
  var now=new Date().setHours(23,59,59,999), map={}, cur=cibDate();
  S.ben.forEach(function(b){
    if(!b.cibJ || b.date===cur || !dataOk(b.date)) return;
    var t=s2d(b.date).getTime(), dd=(now-t)/86400000; if(dd<0||dd>28) return;
    var g; try{ g=JSON.parse(b.cibJ); }catch(e){ return; }
    MEALS.forEach(function(m){ (g[m.k]||[]).forEach(function(v){
      if(v.w || !v.n) return;
      var k=v.n+"|"+v.p+"|"+v.c+"|"+v.g;
      var o=map[k]||(map[k]={n:v.n, d:v.d||"", p:+v.p||0, c:+v.c||0, g:+v.g||0, cnt:0, same:0, last:0});
      o.cnt++; if(m.k===mk) o.same++; if(t>o.last) o.last=t;
    }); });
  });
  return Object.keys(map).map(function(k){ return map[k]; })
    .sort(function(a,b){ return (b.same-a.same)||(b.cnt-a.cnt)||(b.last-a.last); });
}
function cibVoceBtn(v, mk, i, src){
  return '<button class="item" data-a="cibrec" data-m="'+mk+'" data-i="'+i+'" data-s="'+src+'">'+
    '<div class="t"><b>'+esc(v.n)+'</b><span class="xs mut">'+esc(v.d||"")+'</span></div>'+
    '<div class="xs" style="font-weight:700;color:var(--glow);white-space:nowrap">'+
    b1(v.p/BLK.p)+'P \u00b7 '+b1(v.c/BLK.c)+'C \u00b7 '+b1(v.g/BLK.g)+'G</div></button>';
}
/* scrivi a parole: mentre scrivi, se il piatto l'hai gia' mangiato te lo propongo con i valori veri */
function formLibero(mk){
  var m=meal(mk);
  var h='<div class="eyebrow">'+esc(cibDate())+'</div><h2 style="margin:3px 0 10px;font-size:18px">'+esc(m.n)+'</h2>'+
    '<label class="fld"><span class="eyebrow">Cosa hai mangiato</span>'+
    '<textarea id="cibTxt" data-m="'+mk+'" rows="2" placeholder="Esempio: pasta al pomodoro e mozzarella"></textarea></label>'+
    '<div id="cibSug"></div>'+
    '<div class="eyebrow" style="margin:12px 0 6px">Porzione</div><div class="pills" id="cibPz">'+
    PORZ.map(function(p,i){ return '<button class="pill'+(i===1?" on":"")+'" data-q="'+p[1]+'">'+p[0]+'</button>'; }).join("")+'</div>'+
    '<div class="xs mut" style="margin-top:6px">Vale come stima finch\u00e9 non la converto con i valori veri.</div>'+
    '<button class="btn pri" style="margin-top:14px" data-a="ciblibok" data-m="'+mk+'">Aggiungi</button>'+
    '<button class="btn ghost" style="margin-top:8px" data-a="pasto" data-m="'+mk+'">Indietro</button>';
  sheet(h);
  setTimeout(function(){ var t=document.getElementById("cibTxt"); if(t) t.focus(); }, 60);
}
var _CIBR=[], _CIBS=[];
function cibSuggerisci(testo, mk){
  var box=document.getElementById("cibSug"); if(!box) return;
  var parole=String(testo||"").toLowerCase().split(/\s+/).filter(function(p){ return p.length>=3; });
  if(!parole.length){ box.innerHTML=""; _CIBS=[]; return; }
  var pool=cibStorico(mk).concat(cibCat().map(function(x){ return {n:x.n, d:x.d, p:x.p, c:x.c, g:x.g}; }));
  var visti={};
  _CIBS=pool.filter(function(v){
    var nome=(v.n+" "+(v.d||"")).toLowerCase();
    if(visti[v.n]) return false;
    var ok=parole.every(function(p){ return nome.indexOf(p)>=0; });
    if(ok) visti[v.n]=1; return ok;
  }).slice(0,4);
  box.innerHTML = _CIBS.length ? '<div class="xs mut" style="margin:8px 0 4px">Gi\u00e0 registrato, con i valori veri: tocca per aggiungerlo</div>'+
    '<div class="card" style="padding:2px 12px">'+_CIBS.map(function(v,i){ return cibVoceBtn(v, mk, i, "s"); }).join("")+'</div>' : "";
}
async function cibDel(mk, i){ var g=cibDay(); (g[mk]||[]).splice(i,1); return cibSave(g); }
async function cibQ(mk, i, d){
  var g=cibDay(), v=(g[mk]||[])[i]; if(!v) return false;
  v.q=Math.round(((v.q||1)+d)*2)/2;
  if(v.q<=0) g[mk].splice(i,1);
  return cibSave(g);
}
async function cibReset(){
  var b=benOn(cibDate()); if(!b) return true;
  b.cibJ=""; b.cibL=""; b.cibP=0; b.cibC=0; b.cibG=0;
  benTouch(b.date);
  var ok=await save(); if(SYNC.on()) doPush(false);
  return ok;
}
/* voci ancora da convertire, per il briefing */
function cibDaStimare(giorni){
  var out=[], lim=giorni||14, now=new Date().setHours(23,59,59,999);
  S.ben.forEach(function(b){
    if(!b.cibJ) return;
    var dd=(now-s2d(b.date).getTime())/86400000;
    if(dd<0||dd>lim) return;
    var g=cibDay(b.date);
    MEALS.forEach(function(m){
      (g[m.k]||[]).forEach(function(v){ if(v.w) out.push({date:b.date, m:m.n, n:v.n}); });
    });
  });
  return out;
}
/* il coach converte una voce libera: stessa descrizione, stessi valori */
function cibRisolvi(nome, p, c, gg){
  var n=0, key=String(nome).toLowerCase().trim();
  S.ben.forEach(function(b){
    if(!b.cibJ) return;
    var g=cibDay(b.date), tocc=false;
    MEALS.forEach(function(m){
      (g[m.k]||[]).forEach(function(v){
        if(v.w && String(v.n).toLowerCase().trim()===key){
          v.p=p; v.c=c; v.g=gg; delete v.w; tocc=true; n++;
        }
      });
    });
    if(tocc){
      var t=cibTot(g);
      b.cibJ=JSON.stringify(g);
      b.cibP=Math.round(t.p); b.cibC=Math.round(t.c); b.cibG=Math.round(t.g);
      benTouch(b.date);
    }
  });
  return n;
}

/* Il residuo va detto con i numeri. La versione a parole aveva tre soli
   gradini e restava ferma su "due + due + due" per mezza giornata: sembrava
   che aggiungere un pasto non cambiasse niente. */
function cibHint(r, g){
  g = g || cibVuoto();
  var resto=[], oltre=[];
  if(r.p>=0.3) resto.push(b1(r.p)+"P"); else if(r.p<=-0.5) oltre.push("P +"+b1(-r.p));
  if(r.c>=0.3) resto.push(b1(r.c)+"C"); else if(r.c<=-0.5) oltre.push("C +"+b1(-r.c));
  if(r.g>=0.3) resto.push(b1(r.g)+"G"); else if(r.g<=-0.5) oltre.push("G +"+b1(-r.g));

  var main = resto.length ? "Restano "+resto.join(" \u00b7 ") : "Giornata chiusa.";
  var vuoti = MEALS.filter(function(m){ return m.k!=="ex" && m.p && !(g[m.k]||[]).length; });
  var sub = "";
  if(resto.length && vuoti.length){
    var nomi = vuoti.map(function(m){ return m.n.toLowerCase(); });
    sub = "Devi ancora registrare " + (nomi.length>1
      ? nomi.slice(0,-1).join(", ")+" e "+nomi[nomi.length-1]
      : nomi[0]) + ".";
  } else if(resto.length){
    sub = "Tutti i pasti sono registrati: quello che manca va aggiunto a un pasto o come fuori pasto.";
  }
  if(oltre.length){
    sub = (sub?sub+" ":"") + "Sopra il target: " + oltre.join(", ") +
      (r.g<=-1.5 ? ". Grassi alti, occhio al reflusso stanotte." : ".");
  }
  return {main:main, sub:sub};
}
function cibWeek(){
  var n=0, s={p:0,c:0,g:0}, now=new Date().setHours(23,59,59,999);
  S.ben.forEach(function(b){
    if(!(b.cibP||b.cibC||b.cibG)) return;
    var d=(now-s2d(b.date).getTime())/86400000;
    if(d<0||d>7) return;
    n++; s.p+=b.cibP||0; s.c+=b.cibC||0; s.g+=b.cibG||0;
  });
  if(!n) return null;
  return {n:n, p:s.p/n/BLK.p, c:s.c/n/BLK.c, g:s.g/n/BLK.g};
}

/* ============================================================
   INTERFACCIA
   ============================================================ */
function cibBarra(lab, val, tgt){
  var pct=Math.max(0,Math.min(100, val/tgt*100));
  var over=val>tgt*1.15;
  var col= over ? "var(--amb)" : val>=tgt*0.9 ? "var(--ok)" : "var(--glow)";
  return '<div class="mrow"><span class="mlab">'+lab+'</span>'+
    '<span class="mbar"><i style="width:'+pct+'%;background:'+col+'"></i></span>'+
    '<span class="mval"'+(over?' style="color:var(--amb)"':'')+'>'+b1(val)+'</span>'+
    '<span class="mtgt">/'+b1(tgt)+'</span></div>';
}

function cardCibo(){
  var g=cibDay(), tot=cibTot(g), b=cibBlk(tot), tg=cibTarget();
  var tb={p:tg.p/BLK.p, c:tg.c/BLK.c, g:tg.g/BLK.g};
  var r={p:tb.p-b.p, c:tb.c-b.c, g:tb.g-b.g};
  var vuoto=!(tot.p||tot.c||tot.g);

  var h='<div class="card"><div class="between">'+
    '<div class="eyebrow">Cibo \u00b7 '+cibDayLabel(CIB_DAY)+'</div>'+
    '<div class="xs mut">'+tg.kcal+' kcal'+(tg.off?' <span style="color:var(--amb)">'+(tg.off>0?"+":"")+tg.off+'</span>':'')+'</div></div>';

  if(SYNC.on() && benDaInviare(cibDate()))
    h+='<div class="xs" style="margin-top:4px;color:var(--amb)">Salvato sul telefono, non ancora sul foglio: lo invio appena c\'\u00e8 rete.</div>';
  h+='<div class="macro">'+cibBarra("P",b.p,tb.p)+cibBarra("C",b.c,tb.c)+cibBarra("G",b.g,tb.g)+'</div>';

  /* la striscia dei pasti: la giornata letta come sequenza */
  h+='<div class="rail">';
  MEALS.forEach(function(m){
    var it=g[m.k]||[], t=cibSomma(it), pieno=!!it.length;
    var att=m.p+m.c+m.g, fat=t.p+t.c+t.g;
    var stato = !pieno ? "" : (att && fat>att*1.25 ? " over" : " done");
    var attesa = it.some(function(v){ return v.w; });
    h+='<button class="meal'+stato+'" data-a="pasto" data-m="'+m.k+'">'+
       '<span class="mdot"></span>'+
       '<span class="mname">'+m.n+(attesa?' <b class="pend">?</b>':'')+'</span>'+
       '<span class="mmac">'+(pieno? b1(t.p/BLK.p)+'P \u00b7 '+b1(t.c/BLK.c)+'C \u00b7 '+b1(t.g/BLK.g)+'G' : (m.k==="ex"?'\u2013':'da fare'))+'</span>'+
       '</button>';
  });
  h+='</div>';

  var hint=cibHint(r,g);
  h+='<div class="sm" style="margin-top:12px;font-weight:700;color:'+
     ((r.p<=0.4&&r.c<=0.4&&r.g<=0.4)?"var(--ok)":"var(--bone)")+'">'+esc(hint.main)+'</div>';
  if(hint.sub) h+='<div class="xs mut" style="margin-top:3px">'+esc(hint.sub)+'</div>';

  var w=cibWeek();
  if(w) h+='<div class="xs mut" style="margin-top:6px">Media 7 giorni: '+b1(w.p)+'P \u00b7 '+b1(w.c)+'C \u00b7 '+b1(w.g)+'G su '+
    w.n+' giornat'+(w.n>1?"e":"a")+(w.n<4?'. Troppo poche per fidarsi.':'. Il target \u00e8 settimanale.')+'</div>';

  var pr=cibProposta();
  if(pr) h+='<div class="prop"><div class="sm" style="font-weight:600">'+esc(pr.txt)+'</div>'+
    '<div class="xs mut" style="margin:4px 0 9px">Proposta: '+(pr.dir>0?"+":"")+'150 kcal, assorbite dai carboidrati.</div>'+
    '<div class="grid2"><button class="btn sm" data-a="cibcal" data-v="'+pr.kcal+'">Adegua</button>'+
    '<button class="btn sm ghost" data-a="cibcal" data-v="'+(S.cibOff||0)+'">Lascia com\'\u00e8</button></div></div>';

  if(!vuoto) h+='<button class="btn sm ghost" style="width:100%;margin-top:9px" data-a="cibz">Azzera '+cibDayLabel(CIB_DAY)+'</button>';
  h+='</div>';
  return h;
}

function formPasto(mk, cat){
  var m=meal(mk), g=cibDay(), it=g[mk]||[], t=cibSomma(it);
  cat=cat||(mk==="col"?"col":(mk==="pra"||mk==="cen")?"pia":"prot");

  var h='<div class="between"><div><div class="eyebrow">'+esc(cibDate())+'</div>'+
    '<h2 style="margin:3px 0 0;font-size:18px">'+esc(m.n)+'</h2></div>'+
    '<div style="text-align:right"><div class="num" style="font-size:16px">'+b1(t.p/BLK.p)+'P \u00b7 '+b1(t.c/BLK.c)+'C \u00b7 '+b1(t.g/BLK.g)+'G</div>'+
    (m.p? '<div class="xs mut">atteso '+b1(m.p/BLK.p)+' \u00b7 '+b1(m.c/BLK.c)+' \u00b7 '+b1(m.g/BLK.g)+'</div>':'')+
    '</div></div>';

  h+='<div class="daysw">'+cibDayPills(mk,cat)+'</div>';

  if(it.length){
    h+='<div class="card" style="padding:2px 12px;margin:10px 0">';
    it.forEach(function(v,i){
      var q=v.q||1;
      h+='<div class="vrow'+(v.w?" attesa":"")+'">'+
         '<div class="vtxt"><b>'+esc(v.n)+q1(q)+'</b>'+
         (v.w? '<span class="xs" style="color:var(--amb)">stima provvisoria, in attesa</span>'
             : '<span class="xs mut">'+esc(v.d||"")+(v.d?' \u00b7 ':'')+b1(v.p*q/BLK.p)+'P '+b1(v.c*q/BLK.c)+'C '+b1(v.g*q/BLK.g)+'G</span>')+
         '</div>'+
         '<div class="vq"><button data-a="cibq" data-m="'+mk+'" data-i="'+i+'" data-d="-0.5">\u2212</button>'+
         '<button data-a="cibq" data-m="'+mk+'" data-i="'+i+'" data-d="0.5">+</button>'+
         '<button class="vx" data-a="cibdel" data-m="'+mk+'" data-i="'+i+'">\u2715</button></div></div>';
    });
    h+='</div>';
  } else {
    h+='<div class="card flat" style="margin:10px 0;text-align:center;padding:16px"><div class="sm mut">Niente registrato per questo pasto.</div></div>';
    var ieri=cibDay(cibIeri())[mk]||[];
    if(ieri.length) h+='<button class="btn" style="margin-bottom:8px" data-a="cibrip" data-m="'+mk+'">Come ieri: '+
      esc(ieri.map(function(v){ return v.n; }).join(", ").slice(0,60))+'</button>';
  }

  h+='<div class="grid2"><button class="btn" data-a="scan" data-m="'+mk+'">'+
     '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M3 7V4h3M18 4h3v3M21 17v3h-3M6 20H3v-3M7 8v8M10 8v8M13 8v8M16 8v8"/></svg>Codice a barre</button>'+
     '<button class="btn" data-a="ciblib" data-m="'+mk+'">Scrivi a parole</button></div>'+
     '<div class="xs mut" style="margin:6px 0 14px">Se l\'hai gi\u00e0 mangiato, te lo propongo con i valori veri mentre scrivi.</div>';

  h+=prodottiCard(mk);
  _CIBR=cibStorico(mk).filter(function(v){ return v.same>0 || v.cnt>=2; }).slice(0,6);
  if(_CIBR.length){
    h+='<div class="eyebrow" style="margin-bottom:6px">Usati di recente</div><div class="card" style="padding:2px 12px;margin-bottom:14px">'+
       _CIBR.map(function(v,i){ return cibVoceBtn(v, mk, i, "r"); }).join("")+'</div>';
  }

  var ric=cibRic().filter(function(r){ return r.m===mk; });
  if(ric.length){
    h+='<div class="eyebrow" style="margin-bottom:6px">Ricette</div><div class="card" style="padding:2px 12px;margin-bottom:14px">';
    ric.forEach(function(r){
      h+='<button class="item" data-a="cibric" data-m="'+mk+'" data-n="'+esc(r.n)+'">'+
         '<div class="t"><b>'+esc(r.n)+'</b><span class="xs mut">'+esc(r.v.map(function(x){return x[0];}).join(", "))+'</span></div>'+
         '<div style="font-weight:700;color:var(--glow)">+</div></button>';
    });
    h+='</div>';
  }

  h+='<div class="eyebrow" style="margin-bottom:6px">Alimenti</div><div class="ctabs">';
  CIB_CAT.forEach(function(c){
    h+='<button class="pill'+(c[0]===cat?" on":"")+'" data-a="pasto" data-m="'+mk+'" data-c="'+c[0]+'">'+c[1]+'</button>';
  });
  h+='</div><div class="card" style="padding:2px 12px">';
  cibCat().filter(function(x){ return x.cat===cat; }).forEach(function(x){
    h+='<button class="item" data-a="cibadd" data-m="'+mk+'" data-n="'+esc(x.n)+'">'+
       '<div class="t"><b>'+esc(x.n)+'</b><span class="xs mut">'+esc(x.d||"")+'</span></div>'+
       '<div class="xs" style="font-weight:700;color:var(--glow);white-space:nowrap">'+
       b1(x.p/BLK.p)+'P \u00b7 '+b1(x.c/BLK.c)+'C \u00b7 '+b1(x.g/BLK.g)+'G</div></button>';
  });
  h+='</div><button class="btn ghost" style="margin-top:14px" data-a="x">Chiudi</button>';
  sheet(h);
}

