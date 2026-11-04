/* ============================================================
   POSIZIONE — dove stanno corpo e arti, in due fotogrammi fermi
   Partenza e arrivo, con numeri sul corpo, angoli, linee guida e
   l'errore tipico disegnato come fantasma rosso sulla posa giusta.
   I dati stanno qui, per esercizio:
     a, b  fotogrammi di partenza e di arrivo (indici di FIG[n].k)
     co    [riferimento, testo]: i numeri sul corpo
     ang   [[A,B,C], nome]: angolo in B, in gradi
     gl    linee guida: {k:"v",at:rif} verticale · {k:"l",a:rif,b:rif} retta · {k:"h",at:rif} orizzontale
     err   {k, f, t}: posa sbagliata = f(posa del fotogramma k); t = cosa succede
     no    zone in cui NON devi sentire fastidio (come in 18-dolore.js)
   ============================================================ */

/* sposta l'anca tenendo ferma la spalla: bacino che cala o sale nei plank */
function fgBacino(p, dy, dx){
  var P=fgPosa(p), hip=[p.hip[0]+(dx||0), p.hip[1]+dy], v=[P.sh[0]-hip[0], P.sh[1]-hip[1]], L=Math.sqrt(v[0]*v[0]+v[1]*v[1]);
  return fgM(p, {hip:hip, t:fgAng(v), tl:L/FL.tr});
}
function ptq(P){ return P; }

var POS={
 "Cat-cow":{a:0, b:1, co:[["hn","Mani sotto le spalle"],["kn","Ginocchia sotto le anche"],["back","Si muove la colonna, vertebra dopo vertebra"],["head","La testa segue la colonna"]],
   err:{k:1, f:function(p){ return fgM(p,{sp:0, nk:-75}); }, t:"Si muove solo il collo: la schiena resta ferma"}, no:["collo","lombare"]},
 "Rotazioni toraciche":{a:0, b:1, co:[["hn","Una mano a terra sotto la spalla"],["hf","L'altra mano passa sotto il petto, poi sale al soffitto"],["head","Lo sguardo segue la mano"],["hip","Bacino fermo, seduto sui talloni"]],
   no:["lombare","spalla_sx"]},
 "Bird-dog con pausa 3s":{a:0, b:1, co:[["hn","Braccio disteso, in linea con il busto"],["tf","Gamba opposta distesa: il piede non sale sopra l'anca"],["hip","Bacino fermo e orizzontale"],["head","Sguardo a terra, collo lungo"]],
   gl:[{k:"h", at:"hip"}], err:{k:1, f:function(p){ return fgM(p,{ff:[p.ff[0]-2, p.ff[1]-26], sp:-6}); }, t:"Gamba troppo in alto: la lombare si inarca e il bacino ruota"}, no:["lombare","polso_sx","polso_dx"]},
 "Respirazione costale asimmetrica":{a:0, b:1, co:[["head","Spalle basse, collo lungo"],["hn","Mano sinistra sulle costole di sinistra"],["hf","Mano destra passiva sul gibbo"],["chest","Le costole si allargano di lato, non verso l'alto"]],
   err:{k:1, f:function(p){ return fgM(p,{nk:8, hs:1}); }, t:"Le spalle salgono: è respiro alto. Pensa alle costole, non alla pancia"}, no:["collo"]},
 "Glute bridge":{a:0, b:1, co:[["an","Piedi larghi come le anche, talloni vicini ai glutei"],["hip","Bacino alto: linea retta spalle-ginocchia"],["lomb","Lombare neutra, non inarcata"]],
   ang:[[["sh","hip","kn"],"Anca"]], gl:[{k:"l", a:"sh", b:"kn"}], err:{k:1, f:function(p){ return fgM(p,{sp:-7, hip:[p.hip[0],p.hip[1]-6]}); }, t:"La lombare si inarca: stai spingendo con la schiena, non coi glutei"}, no:["lombare"]},

 "Floor Press manubri":{a:0, b:1, co:[["hn","Manubri sopra il petto, polsi dritti"],["en","Gomiti a 45° dal busto: sfiorano il pavimento"],["back","Schiena e scapole appoggiate a terra"],["an","Ginocchia piegate, piedi a terra"]],
   ang:[[["sh","en","hn"],"Gomito"]], err:{k:0, f:function(p){ return fgM(p,{sp:-8}); }, t:"La schiena fa il ponte: spingi con la lombare invece che col petto"}, no:["spalla_sx","spalla_dx","polso_sx","polso_dx","lombare"]},
 "Rematore manubri":{a:0, b:1, co:[["back","Schiena dritta, busto a 45°"],["en","Gomiti vicino al busto, verso le tasche"],["kn","Ginocchia morbide, peso sui talloni"],["head","Collo in linea con la schiena"]],
   ang:[[["sh","hip","kn"],"Anca"]], gl:[{k:"l", a:"hip", b:"head"}], err:{k:1, f:function(p){ return fgM(p,{sp:11, nk:-30}); }, t:"Schiena arrotondata: è il rischio più serio. Stop, appoggia i pesi"}, no:["lombare","collo"]},
 "Shoulder Press manubri":{a:0, b:1, co:[["back","Schiena appoggiata, lombare senza inarcarsi"],["en","Gomiti sotto i polsi"],["hn","Spingi in alto, braccia quasi dritte"],["an","Piedi a terra, ginocchia a 90°"]],
   err:{k:1, f:function(p){ return fgM(p,{sp:-8, t:p.t+8}); }, t:"La lombare si stacca dallo schienale e si inarca: scendi di peso"}, no:["spalla_sx","spalla_dx","lombare","collo"]},
 "Push-up piedi rialzati con banda":{a:0, b:1, co:[["hn","Mani sotto le spalle"],["hip","Corpo in linea: glutei e addome stretti"],["tn","Piedi sul rialzo basso"],["bk","Banda sulle scapole, mai sul collo"]],
   gl:[{k:"l", a:"an", b:"sh"}], err:{k:1, f:function(p){ return fgBacino(p, 15); }, t:"Il bacino cede: la lombare si carica"}, no:["lombare","spalla_sx","polso_sx","polso_dx"]},
 "French Press":{a:0, b:1, co:[["en","Gomiti avanti e vicini alla testa, fermi"],["hn","Il manubrio scende dietro la nuca"],["back","Schiena appoggiata: non inarcare"]],
   err:{k:1, f:function(p){ return fgM(p,{sp:-8}); }, t:"La schiena si inarca per spingere: scendi di 2 kg"}, no:["gomito_sx","gomito_dx","lombare","spalla_sx"]},
 "Plank":{a:0, b:1, co:[["en","Gomiti sotto le spalle, avambracci a terra"],["hip","Bacino in linea: né su né giù"],["head","Collo neutro, sguardo a terra"],["an","Piedi uniti, punte a terra"]],
   gl:[{k:"l", a:"an", b:"sh"}], err:{k:0, f:function(p){ return fgBacino(p, 14); }, t:"Il bacino cade: la lombare si carica. 30 secondi giusti valgono più di 60 storti"}, no:["lombare","collo"]},

 "Box Squat":{a:0, b:1, co:[["an","Piedi larghi come le anche, talloni a terra"],["kn","Ginocchia sopra le caviglie, non oltre"],["hip","Bacino indietro: sfiora il box"],["back","Busto inclinato, schiena dritta"]],
   ang:[[["hip","kn","an"],"Ginocchio"]], gl:[{k:"v", at:"an"}], err:{k:1, f:function(p){ return fgM(p,{hip:[104,99], t:158, fn:[p.fn[0],FG_ANK-4], ff:[p.ff[0],FG_ANK-4]}); }, t:"Ginocchia avanti e talloni che si alzano: ti lasci cadere sul box"}, no:["ginocchio_sx","ginocchio_dx","lombare"]},
 "Bulgarian Split Squat manubri":{a:0, b:1, co:[["tf","Piede dietro sul rialzo, collo del piede appoggiato"],["kn","Ginocchio davanti sopra la caviglia"],["back","Busto quasi dritto"],["an","Il peso sta sul piede davanti"]],
   ang:[[["hip","kn","an"],"Ginocchio"]], gl:[{k:"v", at:"an"}], err:{k:1, f:function(p){ return fgM(p,{t:p.t-18, hip:[p.hip[0]-4,p.hip[1]]}); }, t:"Busto troppo avanti: stai spingendo col piede dietro"}, no:["ginocchio_sx","ginocchio_dx","anca_sx","anca_dx"]},
 "Calf raise monopodalico":{a:0, b:1, co:[["tn","Sali sulla punta: il tallone è libero"],["kn","Ginocchio disteso, non piegarlo"],["hn","Una mano al muro solo per l'equilibrio"]],
   err:{k:1, f:function(p){ return fgM(p,{kb:{n:1,f:1}, hip:[p.hip[0]+4,p.hip[1]+8]}); }, t:"Pieghi il ginocchio per aiutarti: il polpaccio lavora meno"}, no:["caviglia_sx","caviglia_dx"]},
 "Band tricep extension":{a:0, b:1, co:[["en","Gomiti in alto, vicini alle orecchie e fermi"],["an","Banda sotto il piede ben piantato"],["hn","Distendi le braccia sopra la testa"]],
   err:{k:1, f:function(p){ return fgM(p,{t:p.t+14}); }, t:"Il busto dà slancio: i gomiti devono restare fermi"}, no:["gomito_sx","gomito_dx","spalla_sx"]},
 "Side plank":{a:0, b:1, co:[["en","Gomito sotto la spalla"],["hip","Bacino alto: linea retta"],["an","Piedi sovrapposti"],["hf","Braccio libero in alto"]],
   gl:[{k:"l", a:"an", b:"head"}], err:{k:0, f:function(p){ return fgBacino(p, 15); }, t:"Il bacino cala: l'esercizio smette di funzionare. Meglio 40 s perfetti di 60 s storti"}, no:["lombare","spalla_sx","spalla_dx"]},

 "Pullover manubrio":{a:0, b:1, co:[["en","Gomiti quasi distesi, braccia sopra il petto"],["lomb","Lombare a terra: non si stacca"],["chest","Costole basse mentre porti il peso dietro"]],
   err:{k:1, f:function(p){ return fgM(p,{sp:-9}); }, t:"La lombare si stacca e forma un arco: il lavoro passa dal dorso alla schiena"}, no:["lombare","spalla_sx","spalla_dx"]},
 "Push-up":{a:0, b:1, co:[["hn","Mani poco più larghe delle spalle"],["hip","Corpo in linea, glutei contratti"],["en","Gomiti a 45° dal busto"],["head","Collo neutro: guarda un punto a terra"]],
   gl:[{k:"l", a:"an", b:"sh"}], err:{k:1, f:function(p){ return fgBacino(p, 15); }, t:"Il bacino cede: è un plank che si muove, stringi glutei e addome"}, no:["polso_sx","polso_dx","lombare","spalla_sx"]},
 "Curl bicipiti manubri":{a:0, b:1, co:[["en","Gomito fermo accanto al busto"],["hn","Polso dritto, sali fino alla spalla"],["back","Schiena dritta: niente slancio"],["kn","Ginocchia morbide"]],
   ang:[[["sh","en","hn"],"Gomito"]], err:{k:1, f:function(p){ return fgM(p,{t:p.t+13, hip:[p.hip[0]-3,p.hip[1]]}); }, t:"Slancio: la schiena si inarca per portare il peso"}, no:["lombare","gomito_sx","gomito_dx","polso_sx"]},
 "Alzate laterali":{a:0, b:1, co:[["hn","Mignolo appena più alto del pollice"],["sh","Spalle basse, lontane dalle orecchie"],["en","Gomiti appena piegati e fissi"]],
   err:{k:1, f:function(p){ return fgM(p,{hn:[p.hn[0]+3,p.hn[1]-9], hf:[p.hf[0]-3,p.hf[1]-9]}); }, t:"Superi l'altezza delle spalle e le spalle salgono: lavora il trapezio"}, no:["spalla_sx","spalla_dx","collo"]},
 "Face pull":{a:0, b:1, co:[["en","Gomiti ALTI, all'altezza delle spalle"],["hn","Tira verso il viso e apri a fine corsa"],["back","Schiena dritta, busto a 45°"]],
   err:{k:1, f:function(p){ return fgM(p,{hn:[p.hn[0]+4,p.hn[1]+22], hf:[p.hf[0]+4,p.hf[1]+22]}); }, t:"I gomiti scendono sotto le spalle: è diventato un rematore"}, no:["collo","spalla_sx"]},

 "Hip thrust con banda":{a:0, b:1, co:[["sh","Scapole appoggiate al divano"],["hip","Spingi in alto: linea retta spalle-ginocchia"],["kn","Banda sopra le ginocchia: spingi verso fuori"],["an","Piedi larghi come le anche"]],
   ang:[[["sh","hip","kn"],"Anca"]], gl:[{k:"l", a:"sh", b:"kn"}], err:{k:1, f:function(p){ return fgM(p,{sp:-8, hip:[p.hip[0],p.hip[1]-8]}); }, t:"Ti inarchi invece di salire col bacino: da protettivo diventa a rischio"}, no:["lombare","ginocchio_sx","ginocchio_dx"]},
 "Split-stance RDL":{a:0, b:1, co:[["an","80% del peso sul piede davanti"],["tf","Piede dietro: solo la punta appoggiata"],["back","Schiena neutra, bacino indietro"],["kn","Ginocchio appena piegato e fermo"]],
   gl:[{k:"l", a:"hip", b:"head"}], err:{k:1, f:function(p){ return fgM(p,{sp:11, nk:-25}); }, t:"La schiena si arrotonda: stop immediato. Se pieghi il ginocchio per scendere è uno squat"}, no:["lombare","ginocchio_sx","ginocchio_dx"]},
 "Affondi indietro manubri":{a:0, b:2, co:[["tf","Passo INDIETRO, appoggio sulla punta"],["kn","Ginocchio davanti sopra la caviglia"],["back","Busto dritto, sguardo avanti"],["kf","Il ginocchio dietro sfiora il pavimento"]],
   ang:[[["hip","kn","an"],"Ginocchio davanti"]], gl:[{k:"v", at:"an"}], err:{k:2, f:function(p){ return fgM(p,{t:p.t-22, hip:[p.hip[0]-6,p.hip[1]]}); }, t:"Busto troppo avanti e ginocchio oltre la punta del piede"}, no:["ginocchio_sx","ginocchio_dx","anca_sx","anca_dx"]},
 "Reverse Fly":{a:0, b:1, co:[["hn","Apri fino all'altezza delle spalle"],["sh","Scapole strette, spalle basse"],["back","Busto a 45° (vedi miniatura): schiena dritta"]],
   err:{k:1, f:function(p){ return fgM(p,{hn:[p.hn[0]-2,p.hn[1]-12], hf:[p.hf[0]+2,p.hf[1]-12]}); }, t:"Ti raddrizzi per dare slancio e senti il collo: 6 kg è il tetto"}, no:["spalla_sx","collo"]},

 "Pike push-up":{a:0, b:1, co:[["hip","Bacino alto: V rovesciata"],["head","La testa scende in verticale, tra le mani"],["hn","Mani a terra, poco più larghe delle spalle"],["an","Piedi vicini alle mani"]],
   err:{k:1, f:function(p){ return fgBacino(p, 14, -8); }, t:"Il movimento diventa orizzontale: è un push-up, non una spinta verticale"}, no:["collo","spalla_sx","polso_sx","polso_dx"]},
 "Hip hinge una gamba":{a:0, b:1, co:[["an","Peso sulla gamba d'appoggio"],["back","Busto e gamba formano una linea"],["hip","Bacino indietro, fianchi orizzontali"],["kn","Ginocchio d'appoggio appena piegato"]],
   gl:[{k:"l", a:"tf", b:"head"}], err:{k:1, f:function(p){ return fgM(p,{sp:10, nk:-25}); }, t:"La schiena si arrotonda e il bacino ruota"}, no:["lombare","ginocchio_sx","ginocchio_dx"]},
 "Band row seduto":{a:0, b:1, co:[["tn","Banda attorno alla pianta dei piedi"],["back","Busto eretto: non ti inclinare indietro"],["en","Gomiti indietro, vicini al busto"],["head","Sguardo avanti"]],
   err:{k:1, f:function(p){ return fgM(p,{t:p.t-16}); }, t:"Ti inclini indietro per aiutarti: la schiena fa il lavoro"}, no:["lombare","collo"]},
 "Band row un braccio":{a:0, b:1, co:[["tn","Banda sotto un piede"],["back","Busto fermo: non ruota"],["en","Tira il gomito verso il fianco"]],
   err:{k:1, f:function(p){ return fgM(p,{t:p.t-14}); }, t:"Il busto segue il braccio: ruota invece di restare fermo"}, no:["lombare","spalla_sx"]},
 "Band pull-apart":{a:0, b:1, co:[["hn","Braccia tese, presa poco più larga delle spalle"],["sh","Spalle basse"],["chest","Apri fino a sfiorare il petto"]],
   err:{k:1, f:function(p){ return fgM(p,{hn:[p.hn[0]-14,p.hn[1]+2], hf:[p.hf[0]+14,p.hf[1]+2], eb:{n:1,f:-1}}); }, t:"Gomiti piegati: la banda è troppo dura o la presa troppo stretta"}, no:["spalla_sx","collo"]},
 "Band curl bicipiti":{a:0, b:1, co:[["an","Banda sotto i piedi"],["en","Gomito fermo accanto al busto"],["hn","Ritorno lento: 3 secondi"]],
   err:{k:1, f:function(p){ return fgM(p,{t:p.t+13}); }, t:"Ti pieghi in avanti quando la banda tira"}, no:["lombare","gomito_sx","polso_sx"]},
 "Dead bug":{a:0, b:1, co:[["lomb","Lombare schiacciata a terra"],["hn","Braccio opposto alla gamba che si allunga"],["kn","Anche e ginocchia a 90°"]],
   err:{k:1, f:function(p){ return fgM(p,{sp:-9}); }, t:"La lombare si stacca dal pavimento: l'esercizio ha smesso di funzionare"}, no:["lombare","collo"]},
 "Overhead extension 1 braccio":{a:0, b:1, co:[["en","Gomito fermo e puntato in alto"],["hf","L'altra mano sostiene il gomito"],["back","Seduto senza schienale, schiena dritta"]],
   err:{k:1, f:function(p){ return fgM(p,{sp:-8}); }, t:"La schiena si inarca per spingere"}, no:["spalla_sx","gomito_sx","gomito_dx","lombare"]},

 "Rematore al telaio della porta":{a:0, b:1, co:[["hn","Una mano sul telaio, braccio disteso"],["an","Piedi vicini alla base"],["back","Corpo dritto dalla testa ai talloni"]],
   gl:[{k:"l", a:"an", b:"head"}], err:{k:1, f:function(p){ return fgBacino(p, 10, 6); }, t:"Il bacino cede e il corpo si piega"}, no:["lombare","spalla_sx","gomito_sx"]},
 "Shoulder press con banda":{a:0, b:1, co:[["an","Banda sotto i piedi"],["hn","Spingi in alto espirando"],["back","Addome e glutei contratti: lombare neutra"]],
   err:{k:1, f:function(p){ return fgM(p,{sp:-8, t:p.t+8}); }, t:"La lombare si inarca per spingere"}, no:["spalla_sx","lombare"]},
 "Box squat alla sedia 3s":{a:0, b:1, co:[["hn","Braccia avanti per l'equilibrio"],["hip","Sfiora la sedia, pausa 1 s: non ti siedi"],["kn","Ginocchia sopra le caviglie"],["an","Talloni a terra"]],
   ang:[[["hip","kn","an"],"Ginocchio"]], gl:[{k:"v", at:"an"}], err:{k:1, f:function(p){ return fgM(p,{hip:[104,100], t:160, fn:[p.fn[0],FG_ANK-4], ff:[p.ff[0],FG_ANK-4]}); }, t:"Ginocchia avanti, talloni su: ti lasci cadere sulla sedia"}, no:["ginocchio_sx","ginocchio_dx","lombare"]},
 "Curl isometrico asciugamano":{a:0, b:1, co:[["en","Gomiti a 90° accanto al busto"],["an","Asciugamano sotto il piede"],["back","Schiena dritta: niente slancio"]],
   err:{k:1, f:function(p){ return fgM(p,{t:p.t+12}); }, t:"Ti inarchi per tirare: respira e tieni il busto fermo"}, no:["lombare","gomito_sx"]},
 "Alzate laterali con banda":{a:0, b:1, co:[["an","Banda sotto i piedi"],["hn","Fino all'altezza delle spalle, non oltre"],["sh","Spalle basse"]],
   err:{k:1, f:function(p){ return fgM(p,{hn:[p.hn[0]+3,p.hn[1]-9], hf:[p.hf[0]-3,p.hf[1]-9]}); }, t:"Le spalle salgono verso le orecchie"}, no:["spalla_sx","collo"]},
 "Y-T-W a busto inclinato":{a:0, b:1, co:[["hn","Braccia a Y, poi a T, poi a W"],["sh","Scapole strette, spalle basse"],["back","Busto a 45° (vedi miniatura): schiena dritta"]],
   err:{k:1, f:function(p){ return fgM(p,{hn:[p.hn[0]-2,p.hn[1]-12], hf:[p.hf[0]+2,p.hf[1]-12]}); }, t:"Ti raddrizzi e senti il collo: riduci l'inclinazione"}, no:["collo","spalla_sx"]},
 "Hip thrust a una gamba":{a:0, b:1, co:[["tf","Una gamba distesa: il bacino non ruota"],["hip","Sali con il gluteo della gamba a terra"],["sh","Scapole sul bordo del letto"]],
   gl:[{k:"l", a:"sh", b:"kn"}], err:{k:1, f:function(p){ return fgM(p,{sp:-8, hip:[p.hip[0],p.hip[1]-8]}); }, t:"Ti inarchi e il bacino ruota verso la gamba sollevata"}, no:["lombare","anca_sx","anca_dx"]},
 "Band pull-down":{a:0, b:1, co:[["hn","Banda fissata in alto, braccia tese"],["en","Tira i gomiti verso i fianchi"],["sh","Scapole giù, non verso le orecchie"]],
   err:{k:1, f:function(p){ return fgM(p,{t:p.t-12}); }, t:"Ti pieghi indietro per aiutarti"}, no:["spalla_sx","collo"]}
};
/* varianti: stessa posizione, un dettaglio diverso */
var POS_DA={
 "Floor Press (volume)":"Floor Press manubri", "Rematore manubri (volume)":"Rematore manubri", "Hammer Curl":"Curl bicipiti manubri",
 "Hammer curl con banda":"Band curl bicipiti", "Push-up stretti":"Push-up", "Push-up piedi rialzati":"Push-up piedi rialzati con banda",
 "Bulgarian split squat 3s":"Bulgarian Split Squat manubri", "Affondi indietro":"Affondi indietro manubri"
};
function posDef(n){
  var nome=fgNome(n), base=nome;
  if(!POS[base] && POS_DA[base]) base=POS_DA[base];
  var pos=POS[base]; if(!pos) return null;
  var out=Object.assign({}, pos);
  if(nome==="Push-up stretti") out.co=[["hn","Mani sotto le spalle (poco meno)"],["en","Gomiti lungo i fianchi, non aperti a T"],["hip","Corpo in linea, glutei contratti"],["head","Collo neutro"]];
  if(nome==="Push-up piedi rialzati") out.co=[["hn","Mani sotto le spalle"],["hip","Corpo in linea: glutei e addome stretti"],["tn","Piedi sul bordo del letto o su una sedia bassa"]];
  if(nome==="Hammer Curl"||nome==="Hammer curl con banda") out.co=out.co.map(function(c){ return c[0]==="hn"? ["hn","Presa neutra: i palmi si guardano, il polso non ruota"] : c; });
  if(nome==="Bulgarian split squat 3s") out.co=out.co.map(function(c){ return c[0]==="an"? ["an","Senza manubri: scendi in 3 secondi"] : c; });
  if(nome==="Affondi indietro") out.co=out.co.map(function(c){ return c[0]==="back"? ["back","Busto dritto: mani sui fianchi"] : c; });
  return out;
}
function posHas(n){ return !!posDef(n) && figHas(n); }

/* ---------- disegno ---------- */
function posPose(n, fase){
  var def=fgDef(n), pos=posDef(n), k=def.k, i;
  if(fase==="err"){ i = pos.err.k!=null ? pos.err.k : pos.b; return {p:pos.err.f(k[i].p), g:k[i].p}; }
  i = fase==="b" ? (pos.b!=null? pos.b : k.length-1) : (pos.a||0);
  return {p:k[Math.min(i,k.length-1)].p};
}
/* un riquadro che contiene i due fotogrammi, l'errore, gli attrezzi e i numeri: stesso per partenza, arrivo ed errore */
var _POSVB={};
function posInquadra(n){
  var nome=fgNome(n); if(_POSVB[nome]) return _POSVB[nome];
  var def=fgDef(n), pos=posDef(n), x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  var add=function(q,r){ r=r||0; x0=Math.min(x0,q[0]-r); y0=Math.min(y0,q[1]-r); x1=Math.max(x1,q[0]+r); y1=Math.max(y1,q[1]+r); };
  var fasi=["a","b"].concat(pos.err? ["err"] : []);
  fasi.forEach(function(f){ var pp=posPose(n,f), Ps=[fgPosa(pp.p)].concat(pp.g? [fgPosa(pp.g)] : []);
    Ps.forEach(function(P){ add(P.hc,FL.hd+2); add(P.hip,7); add(P.sh,7);
      ["n","f"].forEach(function(l){ var b=P.braccia[l], g=P.gambe[l]; add(b.e,4); add(b.h, def.db?8:4); add(g.k,6); add(g.a,4); add(g.toe,3); }); }); });
  (def.props||[]).forEach(function(pr){
    if(pr.k==="box"||pr.k==="sedia"){ add([pr.x-(pr.schienale?6:0), pr.y-(pr.schienale?38:0)]); add([pr.x+pr.w, FG_PAV]); }
    else if(pr.k==="muro"||pr.k==="porta"){ add([pr.x, y0<1e8? y0 : 60]); add([pr.x+10, FG_PAV]); }
    else if(pr.k==="tappetino"){ add([pr.x, FG_PAV]); add([pr.x+pr.w, FG_PAV]); } });
  (def.band||[]).forEach(function(b){ (b.p||[]).forEach(function(r){ if(Array.isArray(r)) add(r); }); });
  /* spazio per i numeri */
  var m=15; x0-=m; x1+=m; y0-=m+9; y1=Math.max(y1, FG_PAV)+16;
  if(def.inset) x0-=(x1-x0)*0.36;
  var w=x1-x0, h=y1-y0, R=Math.max(1, Math.min(220/158, w/h));
  if(w/h<R){ var nw=h*R; x0-=(nw-w)/2; w=nw; } else { var nh=w/R; y0-=(nh-h); h=nh; }
  return (_POSVB[nome]={x:fgR(x0), y:fgR(y0), w:fgR(w), h:fgR(h)});
}
function posVB(n){ var b=posInquadra(n); return b.x+" "+b.y+" "+b.w+" "+b.h; }

/* numeri sul corpo: dal punto, verso l'esterno, senza sovrapporsi */
function posNumeri(P, co, vb){
  var r=vb.w*0.027, c0=[(P.hip[0]+P.sh[0])/2, (P.hip[1]+P.sh[1])/2], pts=[], mk=[];
  co.forEach(function(c,i){
    var q=fgPunto(P, c[0]), v=[q[0]-c0[0], q[1]-c0[1]], L=Math.sqrt(v[0]*v[0]+v[1]*v[1]);
    if(L<3){ v=[0,-1]; L=1; }
    var d=r*2.9; pts.push({q:q, m:[q[0]+v[0]/L*d, q[1]+v[1]/L*d]});
  });
  for(var it=0; it<14; it++) for(var i=0;i<pts.length;i++) for(var j=i+1;j<pts.length;j++){
    var dx=pts[j].m[0]-pts[i].m[0], dy=pts[j].m[1]-pts[i].m[1], dd=Math.sqrt(dx*dx+dy*dy)||0.01, min=r*2.5;
    if(dd<min){ var f=(min-dd)/2/dd; pts[i].m[0]-=dx*f; pts[i].m[1]-=dy*f; pts[j].m[0]+=dx*f; pts[j].m[1]+=dy*f; } }
  var o='';
  pts.forEach(function(t,i){
    o+='<line x1="'+fgR(t.q[0])+'" y1="'+fgR(t.q[1])+'" x2="'+fgR(t.m[0])+'" y2="'+fgR(t.m[1])+'" class="fg-co"/>'+
       '<circle cx="'+fgR(t.q[0])+'" cy="'+fgR(t.q[1])+'" r="'+fgR(r*0.32)+'" class="fg-cop"/>'+
       '<circle cx="'+fgR(t.m[0])+'" cy="'+fgR(t.m[1])+'" r="'+fgR(r)+'" class="fg-con"/>'+
       '<text x="'+fgR(t.m[0])+'" y="'+fgR(t.m[1]+r*0.38)+'" text-anchor="middle" font-size="'+fgR(r*1.15)+'" class="fg-cot">'+(i+1)+'</text>';
  });
  return o;
}
/* angolo in B tra B->A e B->C: arco e gradi */
function posAngoli(P, ang, vb){
  var o='', R=vb.w*0.05, fs=vb.w*0.034;
  (ang||[]).forEach(function(a){
    var A=fgPunto(P,a[0][0]), B=fgPunto(P,a[0][1]), C=fgPunto(P,a[0][2]);
    var ua=[A[0]-B[0],A[1]-B[1]], uc=[C[0]-B[0],C[1]-B[1]], la=Math.hypot(ua[0],ua[1])||1, lc=Math.hypot(uc[0],uc[1])||1;
    ua=[ua[0]/la,ua[1]/la]; uc=[uc[0]/lc,uc[1]/lc];
    var dot=Math.max(-1,Math.min(1,ua[0]*uc[0]+ua[1]*uc[1])), deg=Math.round(Math.acos(dot)*180/Math.PI);
    var cross=ua[0]*uc[1]-ua[1]*uc[0], sweep=cross>0?1:0;
    var p1=[B[0]+ua[0]*R,B[1]+ua[1]*R], p2=[B[0]+uc[0]*R,B[1]+uc[1]*R];
    var bis=[ua[0]+uc[0], ua[1]+uc[1]], lb=Math.hypot(bis[0],bis[1]); bis= lb<0.05? [-ua[1],ua[0]] : [bis[0]/lb,bis[1]/lb];
    var tp=[B[0]+bis[0]*(R+fs*1.35), B[1]+bis[1]*(R+fs*1.35)+fs*0.35];
    o+='<path d="M'+fgPt(p1)+' A'+fgR(R)+' '+fgR(R)+' 0 0 '+sweep+' '+fgPt(p2)+'" class="fg-arc"/>'+
       '<text x="'+fgR(tp[0])+'" y="'+fgR(tp[1])+'" text-anchor="middle" font-size="'+fgR(fs)+'" class="fg-arct">'+deg+'°</text>';
  });
  return o;
}
function posLinee(P, gl, vb){
  var o='';
  (gl||[]).forEach(function(g){
    if(g.k==="v"){ var q=fgPunto(P,g.at); o+='<line x1="'+fgR(q[0])+'" y1="'+fgR(q[1]-70)+'" x2="'+fgR(q[0])+'" y2="'+FG_PAV+'" class="fg-gl"/>'; }
    else if(g.k==="h"){ var h=fgPunto(P,g.at); o+='<line x1="'+fgR(h[0]-40)+'" y1="'+fgR(h[1])+'" x2="'+fgR(h[0]+40)+'" y2="'+fgR(h[1])+'" class="fg-gl"/>'; }
    else { var a=fgPunto(P,g.a), b=fgPunto(P,g.b), d=[b[0]-a[0],b[1]-a[1]], L=Math.hypot(d[0],d[1])||1, u=[d[0]/L,d[1]/L];
      o+='<line x1="'+fgR(a[0]-u[0]*10)+'" y1="'+fgR(a[1]-u[1]*10)+'" x2="'+fgR(b[0]+u[0]*10)+'" y2="'+fgR(b[1]+u[1]*10)+'" class="fg-gl"/>'; }
  });
  return o;
}
/* fase: "a" partenza · "b" arrivo · "err" errore tipico */
function posSVG(n, fase){
  var def=fgDef(n), pos=posDef(n); if(!def||!pos) return "";
  var pp=posPose(n, fase), vbo=posInquadra(n), vb=vbo.x+" "+vbo.y+" "+vbo.w+" "+vbo.h, err=(fase==="err");
  var corpo=fgDisegna(def, pp.p, {vb:vbo, ghost:pp.g,
    post:function(P){ return (err? "" : posLinee(P, pos.gl, vbo)+posAngoli(P, pos.ang, vbo)+posNumeri(P, pos.co, vbo)); }});
  return '<svg viewBox="'+vb+'" class="fg fgpos'+(err?" err":"")+'" role="img" aria-label="'+esc(n)+(err?", errore tipico":", posizione")+'">'+FG_DEFS+corpo+'</svg>';
}

/* ---------- la scheda: partenza, arrivo, animazione, errore ---------- */
var POSV={n:null, fase:"a"};
function posBlock(n){
  POSV={n:n, fase:"a"};
  var pd=posDef(n), mus=figMuscoli(n), h='<div class="posblock" id="posblock">';
  if(pd){
    h+='<div class="seg3" role="tablist" aria-label="Fase del movimento">'+
      [["a","Partenza"],["b","Arrivo"],["anim","Animato"]].map(function(x){ return '<button role="tab" data-a="posf" data-v="'+x[0]+'" class="'+(x[0]==="a"?"on":"")+'">'+x[1]+'</button>'; }).join("")+'</div>';
  }
  h+='<div id="posfig" class="posfig"></div>';
  if(pd && pd.err) h+='<div class="seg2" style="margin-top:8px"><button data-a="posf" data-v="ok" class="on" id="pos-ok">✓ Giusto</button><button data-a="posf" data-v="err" id="pos-err">✕ Errore tipico</button></div>';
  h+='<div id="posinfo"></div>';
  if(mus.length) h+='<div class="mulegenda"><i></i>Lavorano: '+esc(mus.join(" · "))+'</div>';
  return h+'</div>';
}
function posAggiorna(){
  var f=document.getElementById("posfig"); if(!f || !POSV.n) return;
  var n=POSV.n, pd=posDef(n), fase=POSV.fase, info="";
  var seg=document.querySelectorAll("#posblock .seg3 button"); [].forEach.call(seg, function(b){ b.classList.toggle("on", b.dataset.v===(fase==="err"? POSV.ultima||"a" : fase)); });
  var ok=document.getElementById("pos-ok"), er=document.getElementById("pos-err");
  if(ok&&er){ ok.classList.toggle("on", fase!=="err"); er.classList.toggle("on", fase==="err"); }
  if(!pd || fase==="anim"){
    f.innerHTML=figBox(n, {cls:"grande"}); Fig.mount();
    info='<div class="figctl"><button class="btn sm ghost" data-a="figvel" data-v="0.5">Lento</button><button class="btn sm ghost" data-a="figvel" data-v="1">Normale</button><button class="btn sm ghost" data-a="figpausa">Pausa</button></div>'+
      '<div class="xs mut" style="margin-top:4px">↗ La freccia mostra il verso del movimento.</div>';
  } else {
    Fig.stop();
    f.innerHTML='<div class="figbox statica">'+posSVG(n, fase)+'</div>';
    if(fase==="err") info='<div class="errbox"><b>✕ Errore tipico</b><div>'+esc(pd.err.t)+'</div><div class="xs">In verde la posizione giusta, in rosso quella sbagliata.</div></div>';
    else info='<ol class="poslist">'+pd.co.map(function(c,i){ return '<li><i>'+(i+1)+'</i><span>'+esc(c[1])+'</span></li>'; }).join("")+'</ol>'+
      (pd.ang&&pd.ang.length? '<div class="xs mut" style="margin-top:2px">Gli archi con i gradi mostrano gli angoli da tenere'+(pd.gl&&pd.gl.length?'; la linea tratteggiata è il riferimento.':'.')+'</div>' : (pd.gl&&pd.gl.length? '<div class="xs mut" style="margin-top:2px">La linea tratteggiata è il riferimento.</div>':''));
  }
  var i=document.getElementById("posinfo"); if(i) i.innerHTML=info;
}
function posScegli(v){
  if(v==="err"){ POSV.ultima=(POSV.fase==="anim"||POSV.fase==="err")? (POSV.ultima||"b") : POSV.fase; POSV.fase="err"; }
  else if(v==="ok"){ POSV.fase=POSV.ultima||"a"; }
  else POSV.fase=v;
  posAggiorna();
}
