/* ============================================================
   ALIMENTI — scrivere quello che hai mangiato e trovarlo subito
   Una tabella di alimenti comuni con i valori per 100 g, la
   ricerca per nome su tutto quello che l'app conosce (il tuo
   storico, i prodotti letti col codice, il catalogo del coach,
   questa tabella) e un lettore di frasi: «pollo 200 g, riso 80,
   un cucchiaio d'olio» diventa tre voci con i valori veri, senza
   aspettare il coach. Quello che non riconosce resta una stima
   provvisoria, come prima.
   I valori sono medie indicative, per 100 g di parte edibile,
   arrotondate dalle tabelle di composizione (CREA, Tabelle di
   composizione degli alimenti; USDA FoodData Central): servono a
   non lasciare un buco, non sostituiscono l'etichetta. Per un
   prodotto confezionato vale il codice a barre.
   Colonne: nome, proteine, carboidrati, grassi, porzione tipica in
   grammi, come si chiama la porzione, altri nomi, alcol (g/100 g).
   ============================================================ */
var ALIM_CAT=[["cer","Cereali e pane"],["pro","Carne, pesce, uova"],["lat","Latte e formaggi"],["leg","Legumi e patate"],
  ["ver","Verdura"],["fru","Frutta"],["gra","Grassi e frutta secca"],["dol","Dolci e colazione"],["pia","Piatti pronti"],["bev","Bevande"]];
var ALIM={
cer:[
 ["Pasta di semola (cruda)",13,72,1.5,80,"1 porzione","spaghetti penne fusilli maccheroni rigatoni"],
 ["Pasta integrale (cruda)",13,66,2.5,80,"1 porzione",""],
 ["Pasta cotta",5,30,0.6,200,"1 piatto","spaghetti penne scolata"],
 ["Riso bianco (crudo)",6.7,80,0.4,80,"1 porzione","basmati parboiled arborio carnaroli"],
 ["Riso integrale (crudo)",7.5,77,1.9,80,"1 porzione",""],
 ["Riso cotto",2.7,28,0.3,200,"1 piatto","bollito"],
 ["Farro (crudo)",15,67,2.5,80,"1 porzione",""],
 ["Orzo perlato (crudo)",10,70,1.4,80,"1 porzione",""],
 ["Cous cous (crudo)",12.8,72,0.6,80,"1 porzione","couscous cuscus"],
 ["Quinoa (cruda)",14,64,6,70,"1 porzione",""],
 ["Gnocchi di patate",4,33,0.5,200,"1 porzione",""],
 ["Polenta (farina di mais cruda)",8.7,79,2.7,80,"1 porzione",""],
 ["Pane comune",9,55,1.5,50,"1 fetta grande","rosetta michetta panino ciabatta filone"],
 ["Pane integrale",8,48,1.5,50,"1 fetta grande",""],
 ["Pancarrè",8,48,4,25,"1 fetta","pan bauletto pane in cassetta toast"],
 ["Fette biscottate",11,75,6,35,"4 fette",""],
 ["Gallette di riso",8,80,3,18,"2 gallette","galletta mais"],
 ["Crackers",10,70,10,30,"1 pacchetto","cracker"],
 ["Piadina",8,50,11,120,"1 piadina","piada"],
 ["Fiocchi d'avena",13,60,7,40,"1 porzione","avena porridge"],
 ["Corn flakes",7,84,1,30,"1 porzione","cereali colazione"],
 ["Farina 00",10,76,1,100,"100 g","farina di grano"]
],
pro:[
 ["Petto di pollo (crudo)",23,0,1,150,"1 porzione","pollo"],
 ["Petto di pollo alla piastra (cotto)",30,0,3.5,120,"1 porzione","pollo cotto grigliato ai ferri"],
 ["Cosce di pollo senza pelle (crude)",19,0,5,150,"1 porzione","sovracosce pollo"],
 ["Fesa di tacchino (cruda)",24,0,1,150,"1 porzione","tacchino"],
 ["Manzo magro (crudo)",21.5,0,3,150,"1 porzione","bistecca fettina fesa girello tagliata carne rossa"],
 ["Macinato di manzo (crudo)",20,0,10,150,"1 porzione","carne macinata trita ragù"],
 ["Hamburger di manzo (crudo)",18,0,15,120,"1 hamburger","svizzera"],
 ["Vitello (crudo)",21,0,3,150,"1 porzione","fettina scaloppina"],
 ["Lonza di maiale (cruda)",21,0,6,150,"1 porzione","maiale arista braciola"],
 ["Salsiccia di maiale (cruda)",15,0.5,27,100,"1 salsiccia",""],
 ["Prosciutto crudo",26,0,18,50,"3-4 fette","parma san daniele"],
 ["Prosciutto cotto",19.5,1,12,60,"3 fette",""],
 ["Bresaola",32,0,2.6,60,"1 porzione",""],
 ["Tacchino arrosto affettato",22,1,2,60,"3 fette","fesa tacchino affettato"],
 ["Speck",28,0.5,20,50,"3-4 fette",""],
 ["Mortadella",15,0,28,50,"2 fette",""],
 ["Salame",26,1,31,30,"4-5 fette",""],
 ["Würstel",13,2,22,100,"1 confezione piccola","wurstel"],
 ["Merluzzo o nasello (crudo)",18,0,0.7,180,"1 porzione","pesce bianco platessa sogliola"],
 ["Orata (cruda)",20,1,5,180,"1 porzione",""],
 ["Branzino (crudo)",19,0.5,5,180,"1 porzione","spigola"],
 ["Salmone (crudo)",20,0,13,150,"1 trancio",""],
 ["Salmone affumicato",22,0.5,10,50,"mezza confezione",""],
 ["Tonno al naturale (sgocciolato)",25,0,1,60,"1 scatoletta","tonno scatoletta"],
 ["Tonno sott'olio (sgocciolato)",25,0,10,60,"1 scatoletta",""],
 ["Sgombro",19,0,11,100,"1 porzione",""],
 ["Pesce spada (crudo)",17,1,4.2,150,"1 trancio",""],
 ["Gamberi (crudi)",16,1,0.8,150,"1 porzione","gamberetti mazzancolle"],
 ["Calamari, seppie, polpo",14,1,1.5,150,"1 porzione","totani"],
 ["Bastoncini di pesce",12,20,8,100,"4 bastoncini",""],
 ["Uovo intero",12.5,0.5,9,55,"1 uovo","uova"],
 ["Albume",11,0.7,0.2,100,"3 albumi",""],
 ["Tofu",13,1.5,8,125,"1 panetto",""],
 ["Proteine in polvere (whey)",80,6,6,30,"1 misurino","whey proteine polvere"]
],
lat:[
 ["Latte intero",3.3,4.9,3.6,200,"1 bicchiere",""],
 ["Latte parzialmente scremato",3.4,5,1.6,200,"1 bicchiere","latte"],
 ["Latte scremato",3.5,5,0.2,200,"1 bicchiere",""],
 ["Bevanda di soia",3.3,2.5,1.9,200,"1 bicchiere","latte di soia"],
 ["Yogurt bianco intero",3.8,4.3,3.9,125,"1 vasetto",""],
 ["Yogurt bianco magro",4,5,0.3,125,"1 vasetto",""],
 ["Yogurt alla frutta",3.5,13,2.5,125,"1 vasetto",""],
 ["Yogurt greco 0%",10,4,0,170,"1 vasetto",""],
 ["Yogurt greco intero",9,3.5,5,170,"1 vasetto",""],
 ["Skyr",11,4,0.2,150,"1 vasetto",""],
 ["Fiocchi di latte",12,3,4,150,"1 confezione","cottage"],
 ["Ricotta",8.8,3.5,10.9,100,"100 g",""],
 ["Mozzarella",18.7,0.7,19.5,125,"1 mozzarella","fiordilatte"],
 ["Parmigiano o Grana",33,0,28,10,"1 cucchiaio grattugiato","grana padano reggiano formaggio grattugiato"],
 ["Feta",15,1,21,50,"1 porzione",""],
 ["Stracchino o crescenza",18,1,25,60,"1 porzione",""],
 ["Formaggio spalmabile",5.5,4,22,30,"1 porzione","philadelphia"],
 ["Scamorza o provola",25,1,25,50,"1 porzione",""],
 ["Formaggio a fette",28,0,30,30,"1 fetta e mezza","emmental edamer fontina"]
],
leg:[
 ["Patate (crude)",2,18,0.1,250,"2 patate medie","patata"],
 ["Patate dolci",1.6,20,0.1,250,"1 patata","batata"],
 ["Patatine fritte",3.5,38,15,150,"1 porzione","fritte"],
 ["Ceci cotti",7,14,2.5,150,"1 porzione","ceci in scatola"],
 ["Fagioli cotti",6.5,13,0.6,150,"1 porzione","borlotti cannellini in scatola"],
 ["Lenticchie cotte",7,14,0.5,150,"1 porzione","lenticchie in scatola"],
 ["Lenticchie secche",23,51,1,60,"1 porzione",""],
 ["Ceci secchi",21,47,6,60,"1 porzione",""],
 ["Piselli",5.5,9,0.5,150,"1 porzione",""],
 ["Hummus",7,9,17,50,"2 cucchiai",""]
],
ver:[
 ["Insalata",1.5,2,0.3,80,"1 ciotola","lattuga rucola valeriana songino"],
 ["Pomodori",1,3.5,0.2,150,"1 pomodoro grande","pomodoro pomodorini"],
 ["Zucchine",1.3,2,0.2,200,"1 porzione","zucchina"],
 ["Melanzane",1.1,2.6,0.4,200,"1 porzione","melanzana"],
 ["Peperoni",0.9,4.2,0.3,150,"1 peperone","peperone"],
 ["Carote",1.1,7.6,0.2,100,"1 carota grande","carota"],
 ["Spinaci o bietole",3,2.5,0.6,200,"1 porzione","erbette coste"],
 ["Broccoli o cavolfiore",3,3,0.4,200,"1 porzione","cavoli verza"],
 ["Fagiolini",2,3,0.1,200,"1 porzione",""],
 ["Finocchi",1.2,1,0,200,"1 finocchio","finocchio"],
 ["Funghi",3,1.5,0.3,150,"1 porzione","champignon"],
 ["Cipolle",1,5.7,0.1,50,"mezza cipolla","cipolla"],
 ["Zucca",1.1,3.5,0.1,200,"1 porzione",""],
 ["Asparagi",3,3,0.2,150,"1 porzione",""],
 ["Verdure miste cotte",2,5,0.3,200,"1 contorno","contorno verdure grigliate"],
 ["Minestrone (senza condimento)",2,6,0.5,300,"1 piatto","zuppa verdure passato"],
 ["Passata di pomodoro",1.4,4,0.2,100,"100 g","polpa pelati salsa"],
 ["Sugo al pomodoro pronto",1.5,7,3,100,"1 porzione",""],
 ["Olive",1,1,17,30,"8-10 olive",""]
],
fru:[
 ["Mela",0.3,12,0.2,170,"1 media",""],
 ["Pera",0.4,11,0.1,170,"1 media",""],
 ["Banana",1.2,21,0.3,120,"1 media",""],
 ["Arancia",0.7,8,0.2,200,"1 arancia",""],
 ["Clementine o mandarini",0.8,9,0.2,140,"2 clementine","mandarino"],
 ["Kiwi",1.2,9,0.6,80,"1 kiwi",""],
 ["Fragole",0.9,5.3,0.4,150,"1 ciotola",""],
 ["Uva",0.5,15.6,0.1,150,"1 grappolo piccolo",""],
 ["Pesca",0.8,7,0.1,150,"1 pesca","nettarina"],
 ["Albicocche",0.4,6.8,0.1,120,"3 albicocche","albicocca"],
 ["Anguria",0.5,6,0.1,300,"1 fetta","cocomero"],
 ["Melone",0.8,7.4,0.2,200,"1 fetta",""],
 ["Ananas",0.5,10,0,150,"2 fette",""],
 ["Mirtilli",0.8,10,0.3,100,"1 vaschetta piccola","frutti di bosco lamponi more"],
 ["Ciliegie",0.9,11,0.1,150,"1 ciotola",""],
 ["Datteri",2.7,63,0.6,30,"3 datteri",""],
 ["Succo di frutta",0.3,11,0,200,"1 bicchiere",""],
 ["Spremuta d'arancia",0.6,8.5,0.1,200,"1 bicchiere",""]
],
gra:[
 ["Olio extravergine d'oliva",0,0,100,10,"1 cucchiaio","olio evo oliva semi"],
 ["Burro",0.8,1,82,10,"1 noce",""],
 ["Maionese",1.5,2,70,15,"1 cucchiaio",""],
 ["Pesto",5,5,42,30,"1 cucchiaio abbondante",""],
 ["Panna da cucina",2.5,4,21,50,"mezza confezione piccola",""],
 ["Avocado",2,2,15,80,"mezzo avocado",""],
 ["Mandorle",21,7,52,30,"1 manciata",""],
 ["Noci",15,6,65,30,"5-6 noci",""],
 ["Nocciole",14,6,62,30,"1 manciata",""],
 ["Arachidi",26,9,50,30,"1 manciata","noccioline"],
 ["Anacardi",18,27,44,30,"1 manciata",""],
 ["Pistacchi",20,18,45,30,"1 manciata",""],
 ["Burro di arachidi",26,11,49,15,"1 cucchiaio",""]
],
dol:[
 ["Biscotti secchi",7,75,10,30,"5 biscotti",""],
 ["Biscotti frollini",7,68,19,30,"3-4 biscotti","frollini"],
 ["Cornetto",7,46,20,60,"1 cornetto","brioche croissant"],
 ["Torta o crostata",6,55,15,80,"1 fetta","ciambellone dolce"],
 ["Cioccolato fondente",8,35,41,20,"2 quadretti",""],
 ["Cioccolato al latte",7.5,55,31,20,"2 quadretti",""],
 ["Crema spalmabile alle nocciole",6.3,57.5,31,15,"1 cucchiaino abbondante","nutella"],
 ["Marmellata",0.5,60,0,20,"1 cucchiaio","confettura"],
 ["Miele",0.6,80,0,20,"1 cucchiaio",""],
 ["Zucchero",0,100,0,5,"1 cucchiaino",""],
 ["Gelato",4,24,10,100,"2 palline",""],
 ["Ketchup",1.5,24,0.3,15,"1 cucchiaio",""]
],
pia:[
 ["Pizza margherita",10,33,9,300,"1 pizza",""],
 ["Lasagne al forno",7.5,15,8,300,"1 porzione",""],
 ["Tortellini (freschi, crudi)",12.5,42,8.5,125,"1 porzione","ravioli pasta ripiena"],
 ["Cotoletta di pollo impanata",16,15,12,120,"1 cotoletta",""],
 ["Frittata",12,1,14,120,"1 porzione","omelette"],
 ["Sushi misto",5.5,28,1.5,250,"8 pezzi","nigiri maki"]
],
bev:[
 ["Cappuccino",3,4.5,3,150,"1 tazza",""],
 ["Bibita zuccherata",0,10.6,0,330,"1 lattina","coca cola aranciata"],
 ["Birra",0.3,3.5,0,330,"1 bottiglia piccola","",3.7],
 ["Vino",0.1,0.5,0,125,"1 bicchiere","rosso bianco prosecco",9.5],
 ["Aperitivo o cocktail",0,8,0,200,"1 bicchiere","spritz",6],
 ["Superalcolico",0,0,0,40,"1 bicchierino","amaro grappa gin whisky",32]
]
};
var _ALIML=null;
function alimLista(){
  if(_ALIML) return _ALIML;
  _ALIML=[];
  ALIM_CAT.forEach(function(c){ (ALIM[c[0]]||[]).forEach(function(r){
    _ALIML.push({n:r[0], p100:r[1], c100:r[2], g100:r[3], porz:r[4], porzTxt:r[5], alias:r[6]||"", a100:r[7]||0, cat:c[0], src:"alim"}); }); });
  return _ALIML;
}

/* ---------- calorie e unita' ---------- */
function kcalDi(v){ return 4*(v.p||0)+4*(v.c||0)+9*(v.g||0)+7*(v.a||0); }
/* calorie di una giornata gia' salvata: i totali della riga benessere, alcol compreso */
function kcalGiorno(b){ return b? 4*(b.cibP||0)+4*(b.cibC||0)+9*(b.cibG||0)+7*(b.cibA||0) : 0; }
function cibUnita(){ return S.cibUnita==="blocchi" ? "blocchi" : "kcal"; }
/* i valori di una voce, nell'unita' scelta: calorie e grammi, oppure blocchi */
function macTxt(v, q){
  q=q||1; var p=(v.p||0)*q, c=(v.c||0)*q, g=(v.g||0)*q, a=(v.a||0)*q;
  if(cibUnita()==="blocchi") return b1(p/BLK.p)+'P · '+b1(c/BLK.c)+'C · '+b1(g/BLK.g)+'G';
  return Math.round(kcalDi({p:p,c:c,g:g,a:a}))+' kcal · '+Math.round(p)+'P '+Math.round(c)+'C '+Math.round(g)+'G';
}
/* una voce del pasto da un alimento per 100 g e dai grammi */
function voceDaCento(x, grammi){
  var k=grammi/100, r=function(n){ return Math.round(n*k*10)/10; };
  var v={n:x.n, d:Math.round(grammi)+" g", p:r(x.p100), c:r(x.c100), g:r(x.g100), q:1, gr:Math.round(grammi)};
  if(x.a100) v.a=r(x.a100);
  if(x.code) v.bc=x.code;
  return v;
}
/* la giornata ha voci ancora stimate? (non entra nei KPI delle calorie ne' nel fabbisogno) */
function cibStimato(date){ var b=benOn(date); return !!(b && b.cibJ && b.cibJ.indexOf('"w":1')>=0); }

/* ---------- ricerca: parole senza accenti e senza desinenza ---------- */
var ALIM_STOP={di:1,del:1,dello:1,della:1,dei:1,delle:1,al:1,allo:1,alla:1,ai:1,alle:1,con:1,in:1,e:1,ed:1,il:1,lo:1,la:1,le:1,gli:1,i:1,un:1,una:1,uno:1,
  da:1,per:1,d:1,l:1,po:1,circa:1,poco:1,pochi:1,qualche:1,mio:1,mia:1};
function alimNorma(s){ return String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/['’]/g," ").replace(/[^a-z0-9%]+/g," ").trim(); }
function alimRadice(w){ return w.length>3 ? w.replace(/[aeio]$/,"").replace(/h$/,"") : w; }
function alimParole(s){ return alimNorma(s).split(" ").filter(function(w){ return w && !ALIM_STOP[w]; }).map(alimRadice); }
/* tutto quello che l'app conosce, in una lista sola */
function alimFonti(mk){
  var out=[], visti={};
  var add=function(o){ var k=alimNorma(o.n)+"|"+(o.d||""); if(visti[k]) return; visti[k]=1; o._w=alimParole(o.n+" "+(o.alias||"")); out.push(o); };
  cibStorico(mk||"ex").forEach(function(v){ if(v.gr) return; add({n:v.n, d:v.d, p:v.p, c:v.c, g:v.g, a:v.a||0, src:"tuo", peso:3+Math.min(3, v.cnt||0)+(v.same?2:0)}); });
  (typeof prodottiRecenti==="function"? prodottiRecenti() : []).filter(prodottoCompleto).forEach(function(x){
    add({n:x.n, d:x.marca||"", p100:x.p100, c100:x.c100, g100:x.g100, porz:x.serv||100, porzTxt:x.serv? "1 porzione" : "100 g", code:x.code, src:"codice", peso:4}); });
  cibCat().forEach(function(x){ add({n:x.n, d:x.d, p:x.p, c:x.c, g:x.g, src:"coach", peso:2}); });
  alimLista().forEach(function(x){ add(Object.assign({peso:1}, x)); });
  return out;
}
/* le parole cercate devono essere l'inizio di una parola del nome (o degli altri nomi) */
function alimCerca(q, mk, max){
  var par=alimParole(q); if(!par.length) return [];
  var ris=[];
  alimFonti(mk).forEach(function(o){
    var nome=alimParole(o.n), tot=0, ok=par.every(function(p){
      var best=0; o._w.forEach(function(w,i){ if(w.indexOf(p)===0 || (p.length>=4 && p.indexOf(w)===0 && w.length>=4)){ var s=(w===p? 3 : 2)+(i<nome.length? 2 : 0)+(i===0? 2 : 0); if(s>best) best=s; } });
      tot+=best; return best>0; });
    /* «riso», «pasta», «pollo» senza altro: vale il crudo, come si pesa di solito */
    var cotto=/\bcott|piastra/.test(alimNorma(o.n)) && !/cott|piastr/.test(alimNorma(q));
    if(ok) ris.push({o:o, s:tot*10+o.peso-Math.min(9, nome.length)-(cotto? 3 : 0)});
  });
  ris.sort(function(a,b){ return b.s-a.s; });
  return ris.slice(0, max||8).map(function(r){ return r.o; });
}

/* ---------- lettore di frasi ----------
   «200 g di pollo, riso 80, 2 uova, un cucchiaio d'olio, mezza mozzarella» */
var ALIM_NUM={un:1,uno:1,una:1,due:2,tre:3,quattro:4,cinque:5,sei:6,mezzo:0.5,mezza:0.5,"1/2":0.5};
var ALIM_UNITA={cucchiaio:10, cucchiai:10, cucchiaino:5, cucchiaini:5, bicchiere:200, bicchieri:200, tazza:250, tazze:250, tazzina:60,
  fetta:null, fette:null, pezzo:null, pezzi:null, porzione:null, porzioni:null, piatto:null, piatti:null, vasetto:null, vasetti:null,
  scatoletta:null, scatolette:null, manciata:null, pugno:null, confezione:null, panino:null, lattina:null, bottiglia:null};
function alimLeggi(testo, mk){
  var prima=alimLeggi1(testo, mk), out=[];
  prima.forEach(function(r){
    if((!r.voce || r.parziale) && /\s+e\s+/i.test(r.testo)){ var due=alimLeggi1(r.testo.replace(/\s+e\s+/gi, ", "), mk);
      if(due.every(function(x){ return x.voce && !x.parziale; })){ out=out.concat(due); return; } }
    out.push(r);
  });
  return out;
}
function alimLeggi1(testo, mk){
  var pezzi=String(testo||"").replace(/\n/g,",").split(/\s*[,;+]\s*|\s+e\s+(?=\d|un[oa]?\s|due\s|tre\s|mezz[oa]\s)/i).map(function(s){ return s.trim(); }).filter(Boolean);
  return pezzi.map(function(seg){
    var s=" "+seg.toLowerCase().replace(/['’]/g," ").replace(/,(\d)/g,".$1")+" ", grammi=null, conta=null, unita=null, m;
    /* quantita' con unita' di peso o volume */
    if((m=s.match(/(\d+(?:\.\d+)?)\s*(kg|chili|chilo|g|gr|grammi|grammo|ml|cl|l|litro|litri|etto|etti)\b/))){
      var v=+m[1], u=m[2];
      grammi = /^kg|chil|^l$|litr/.test(u) ? v*1000 : u==="cl" ? v*10 : /ett/.test(u) ? v*100 : v;
      s=s.replace(m[0]," ");
    } else if((m=s.match(/\s(\d+(?:\.\d+)?|un|uno|una|due|tre|quattro|cinque|sei|mezzo|mezza|1\/2)\s/))){
      conta = ALIM_NUM[m[1]]!=null ? ALIM_NUM[m[1]] : +m[1];
      s=s.replace(m[0]," ");
    }
    Object.keys(ALIM_UNITA).forEach(function(k){ var re=new RegExp("\\s"+k+"\\s"); if(!unita && re.test(s)){ unita=k; s=s.replace(re," "); } });
    var nome=s.trim().replace(/\s+/g," "), trovati=alimCerca(nome, mk, 5), voce=null, nota="", parziale="";
    /* «spaghetti al pomodoro»: se tutto insieme non c'e', tengo le prime parole che riconosco e lo dico */
    if(!trovati.length){ var pw=nome.split(" ");
      for(var k=pw.length-1;k>=1 && !trovati.length;k--){ trovati=alimCerca(pw.slice(0,k).join(" "), mk, 5); if(trovati.length) parziale=pw.slice(0,k).filter(function(w,i,ar){ return !(i===ar.length-1 && ALIM_STOP[w]); }).join(" "); } }
    /* con una quantita' scritta servono i valori per 100 g: le porzioni del coach («3 uova», «petto 150 g») non si riscalano */
    var quant=(grammi!=null || conta!=null), o=(quant? trovati.filter(function(x){ return x.p100!=null; })[0] : null) || trovati[0] || null;
    if(o){
      if(o.p100!=null){
        var gr = grammi!=null ? grammi
               : unita && ALIM_UNITA[unita] ? (conta||1)*ALIM_UNITA[unita]
               : conta!=null && conta>12 && !unita ? conta                    /* «riso 80»: un numero grande senza unita' sono grammi */
               : (conta||1)*(o.porz||100);
        voce=voceDaCento(o, gr);
        nota = grammi!=null || (conta!=null && conta>12 && !unita) ? "" : (conta && conta!==1 ? b1(conta)+" × " : "")+(unita && ALIM_UNITA[unita]? unita : (o.porzTxt||"porzione"));
      } else {
        /* voce a porzione (catalogo del coach o il tuo storico): i grammi non si possono riscalare */
        voce={n:o.n, d:o.d||"", p:o.p, c:o.c, g:o.g, q:(conta!=null && conta<=12)? conta : 1};
        if(o.a) voce.a=o.a;
        nota = grammi!=null ? "porzione intera: i grammi di questa voce non li conosco" : "";
      }
    }
    if(parziale && voce) nota=(nota? nota+" · " : "")+"ho riconosciuto solo «"+parziale+"»";
    return {testo:seg, nome:nome, voce:voce, nota:nota, altri:trovati, fonte:o? o.src : "", parziale:!!parziale};
  });
}

/* ---------- schermate ---------- */
var ALIMF={mk:"col", righe:[], scelte:{}, q:null};
var ALIM_SRC={tuo:"già mangiato", codice:"dal codice a barre", coach:"catalogo del coach", alim:"tabella alimenti"};
function alimRigaHtml(r, i){
  if(!r.voce) return '<div class="vrow attesa"><div class="vtxt"><b>'+esc(r.testo)+'</b><span class="xs" style="color:var(--amb)">non lo riconosco: resta come stima, il coach lo converte</span></div></div>';
  var v=r.voce;
  return '<button class="item" data-a="alimalt" data-i="'+i+'"><div class="t"><b>'+esc(v.n)+(v.q && v.q!==1? q1(v.q) : '')+'</b>'+
    '<span class="xs mut">'+esc([v.d, r.nota, ALIM_SRC[r.fonte]].filter(Boolean).join(" · "))+'</span></div>'+
    '<div class="xs" style="font-weight:700;color:var(--glow);white-space:nowrap;text-align:right">'+macTxt(v, v.q||1)+'</div></button>';
}
function alimAggiornaLista(){
  var t=document.getElementById("alimTxt"), box=document.getElementById("alimRis"); if(!t || !box) return;
  ALIMF.righe=alimLeggi(t.value, ALIMF.mk);
  ALIMF.righe.forEach(function(r,i){ var sc=ALIMF.scelte[r.nome]; if(sc!=null && r.altri[sc]){ var o=r.altri[sc];
    r.voce = o.p100!=null ? voceDaCento(o, r.voce && r.voce.gr ? r.voce.gr : (o.porz||100)) : {n:o.n, d:o.d||"", p:o.p, c:o.c, g:o.g, q:(r.voce&&r.voce.q&&!r.voce.gr)? r.voce.q : 1};
    if(o.a) r.voce.a=o.a; r.fonte=o.src; r.nota=""; } });
  if(!ALIMF.righe.length){ box.innerHTML='<div class="xs mut" style="margin-top:8px">Esempio: «pollo 200 g, riso 80, un cucchiaio d\'olio, una mela». Senza quantità vale una porzione.</div>'; return; }
  var tot={p:0,c:0,g:0,a:0}; ALIMF.righe.forEach(function(r){ if(r.voce){ var q=r.voce.q||1; tot.p+=r.voce.p*q; tot.c+=r.voce.c*q; tot.g+=r.voce.g*q; tot.a+=(r.voce.a||0)*q; } });
  var ok=ALIMF.righe.filter(function(r){ return r.voce; }).length;
  box.innerHTML='<div class="card" style="padding:2px 12px;margin-top:10px">'+ALIMF.righe.map(alimRigaHtml).join("")+'</div>'+
    (ok? '<div class="between" style="margin-top:8px"><div class="xs mut">Tocca una riga per scegliere un altro alimento.</div><div class="sm" style="font-weight:700">'+macTxt(tot)+'</div></div>' : '');
}
/* il pasto a parole: scrivi, vedi cosa ho capito, aggiungi tutto con un tocco */
function formScrivi(mk, testo){
  ALIMF={mk:mk, righe:[], scelte:{}, q:null};
  var m=meal(mk);
  sheet('<div class="eyebrow">'+esc(cibDate())+'</div><h2 style="margin:3px 0 10px;font-size:18px">'+esc(m.n)+' · scrivi cosa hai mangiato</h2>'+
    '<textarea id="alimTxt" rows="3" placeholder="pollo 200 g, riso 80, un cucchiaio d\'olio">'+esc(testo||"")+'</textarea>'+
    '<div id="alimRis"></div>'+
    '<div class="eyebrow" style="margin:12px 0 6px">Se non lo riconosco, la porzione era</div><div class="pills" id="cibPz">'+
    PORZ.map(function(p,i){ return '<button class="pill'+(i===1?" on":"")+'" data-q="'+p[1]+'">'+p[0]+'</button>'; }).join("")+'</div>'+
    '<button class="btn pri" style="margin-top:14px" data-a="alimok">Aggiungi</button>'+
    '<button class="btn ghost" style="margin-top:8px" data-a="pasto" data-m="'+mk+'">Indietro</button>');
  alimAggiornaLista();
  setTimeout(function(){ var t=document.getElementById("alimTxt"); if(t) t.focus(); }, 60);
}
async function alimConferma(){
  var t=document.getElementById("alimTxt"); if(!t || !t.value.trim()){ toast("Scrivi cosa hai mangiato"); return; }
  alimAggiornaLista();
  var pz=document.querySelector("#cibPz .pill.on"), f=pz? +pz.dataset.q : 1, mk=ALIMF.mk, n=0, st=0;
  for(var i=0;i<ALIMF.righe.length;i++){ var r=ALIMF.righe[i];
    if(r.voce){ await cibAddVoce(mk, r.voce); n++; } else { await cibAddLibero(mk, r.testo, f); st++; } }
  render(); formPasto(mk);
  toast(n+" voc"+(n===1?"e":"i")+" aggiunt"+(n===1?"a":"e")+(st? " · "+st+" da convertire" : ""));
}
/* un altro alimento per la stessa riga */
function alimAlternative(i){
  var r=ALIMF.righe[i], t=document.getElementById("alimTxt"); if(!r || !r.altri.length) return;
  var testo=t? t.value : "";
  sheet('<div class="eyebrow glow">«'+esc(r.testo)+'»</div><h2 style="margin:4px 0 10px;font-size:18px">Quale intendevi?</h2>'+
    '<div class="card" style="padding:2px 12px">'+r.altri.map(function(o,k){
      return '<button class="item" data-a="alimsc" data-k="'+k+'" data-n="'+esc(r.nome)+'"><div class="t"><b>'+esc(o.n)+'</b><span class="xs mut">'+esc([o.d, ALIM_SRC[o.src]].filter(Boolean).join(" · "))+'</span></div>'+
        '<div class="xs" style="font-weight:700;color:var(--glow);white-space:nowrap">'+(o.p100!=null? macTxt({p:o.p100,c:o.c100,g:o.g100,a:o.a100||0})+' <span class="mut">/100 g</span>' : macTxt(o))+'</div></button>'; }).join("")+'</div>'+
    '<button class="btn ghost" style="margin-top:12px" data-a="alimback">Indietro</button>');
  ALIMF.testo=testo;
}
/* quanto ne hai mangiato: un alimento della tabella, in grammi */
function formQuanto(nome, grammi){
  var x=alimLista().filter(function(y){ return y.n===nome; })[0]; if(!x) return;
  var g=grammi||x.porz||100; ALIMF.q={n:nome, g:g};
  var v=voceDaCento(x, g), opz=[[x.porz, x.porzTxt+" ("+x.porz+" g)"]];
  [50,100,150,200,250].forEach(function(n){ if(Math.abs(n-x.porz)>4) opz.push([n, n+" g"]); });
  sheet('<div class="eyebrow glow">'+esc(meal(ALIMF.mk).n)+'</div><h2 style="margin:4px 0 2px;font-size:18px">'+esc(x.n)+'</h2>'+
    '<div class="xs mut">per 100 g: '+macTxt({p:x.p100,c:x.c100,g:x.g100,a:x.a100||0})+' · valori medi</div>'+
    '<div class="eyebrow" style="margin:14px 0 6px">Quanto ne hai mangiato</div>'+
    '<div class="pills" style="flex-wrap:wrap">'+opz.map(function(o){ return '<button class="pill'+(Math.abs(o[0]-g)<0.5?" on":"")+'" data-a="alimg" data-v="'+o[0]+'">'+esc(o[1])+'</button>'; }).join("")+'</div>'+
    '<label class="fld"><span class="eyebrow">Oppure i grammi esatti</span><input type="number" inputmode="decimal" id="alimgr" value="'+Math.round(g)+'"></label>'+
    '<div class="card" style="margin:12px 0 0;padding:10px 12px"><div class="between"><div class="sm" style="font-weight:700">'+Math.round(g)+' g</div>'+
      '<div class="sm" style="font-weight:700;color:var(--glow)">'+macTxt(v)+'</div></div></div>'+
    '<button class="btn pri" style="margin-top:12px" data-a="alimadd">Aggiungi a '+esc(meal(ALIMF.mk).n.toLowerCase())+'</button>'+
    '<button class="btn ghost" style="margin-top:8px" data-a="pasto" data-m="'+ALIMF.mk+'" data-c="alim">Indietro</button>');
}
/* la tabella da sfogliare, dentro il pasto */
function alimSfoglia(mk, cat){
  cat=cat||"pro";
  var h='<div class="ctabs">'+ALIM_CAT.map(function(c){ return '<button class="pill'+(c[0]===cat?" on":"")+'" data-a="alimcat" data-m="'+mk+'" data-c="'+c[0]+'">'+c[1]+'</button>'; }).join("")+'</div>'+
    '<div class="card" style="padding:2px 12px">';
  (ALIM[cat]||[]).forEach(function(r){
    h+='<button class="item" data-a="alimq" data-m="'+mk+'" data-n="'+esc(r[0])+'"><div class="t"><b>'+esc(r[0])+'</b><span class="xs mut">'+esc(r[5]+" · "+r[4]+" g")+'</span></div>'+
       '<div class="xs" style="font-weight:700;color:var(--glow);white-space:nowrap">'+macTxt({p:r[1]*r[4]/100, c:r[2]*r[4]/100, g:r[3]*r[4]/100, a:(r[7]||0)*r[4]/100})+'</div></button>';
  });
  return h+'</div>';
}

document.addEventListener("click", function(ev){
  var el=ev.target.closest("[data-a]"); if(!el) return;
  var a=el.dataset.a;
  if(a==="alimscrivi"){ formScrivi(el.dataset.m, ""); return; }
  if(a==="alimok"){ alimConferma(); return; }
  if(a==="alimalt"){ alimAlternative(+el.dataset.i); return; }
  if(a==="alimsc"){ var t0=ALIMF.testo||"", mk0=ALIMF.mk, sc=Object.assign({}, ALIMF.scelte); sc[el.dataset.n]=+el.dataset.k;
    formScrivi(mk0, t0); ALIMF.scelte=sc; alimAggiornaLista(); return; }
  if(a==="alimback"){ var t1=ALIMF.testo||"", sc1=ALIMF.scelte; formScrivi(ALIMF.mk, t1); ALIMF.scelte=sc1; alimAggiornaLista(); return; }
  if(a==="alimq"){ ALIMF.mk=el.dataset.m; formQuanto(el.dataset.n); return; }
  if(a==="alimg"){ formQuanto(ALIMF.q.n, +el.dataset.v); return; }
  if(a==="alimadd"){
    var inp=document.getElementById("alimgr"), g=inp? numero(inp.value) : (ALIMF.q && ALIMF.q.g);
    if(!g || g<=0 || g>3000){ toast("Scrivi i grammi"); return; }
    var x=alimLista().filter(function(y){ return y.n===ALIMF.q.n; })[0], mk=ALIMF.mk;
    cibAddVoce(mk, voceDaCento(x, g)).then(function(){ render(); formPasto(mk, "alim"); toast(Math.round(g)+" g aggiunti"); });
    return;
  }
  if(a==="alimcat"){ ALIM_SFO=el.dataset.c; formPasto(el.dataset.m, "alim"); return; }
  if(a==="cibunita"){ window._sy=window.scrollY; S.cibUnita = cibUnita()==="kcal" ? "blocchi" : "kcal"; cfgTocca("impostazioni"); save(); render(); return; }
});
var ALIM_SFO="pro";
document.addEventListener("input", function(ev){
  var t=ev.target; if(!t) return;
  if(t.id==="alimTxt"){ alimAggiornaLista(); return; }
  if(t.id==="alimgr" && ALIMF.q){ var g=numero(t.value); if(g>0) ALIMF.q.g=g; }
});
