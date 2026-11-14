/* ============================================================
   TECNICA — ogni esercizio spiegato sul corpo
   Quattro domande, sempre nello stesso ordine:
   1. come ti metti: ogni parte del corpo, dai piedi alla testa;
   2. come ti muovi: le fasi, quanto durano, quando respiri;
   3. cosa devi sentire: i muscoli che lavorano, disegnati sul corpo;
   4. come ti accorgi che stai sbagliando, e cosa fare subito.
   I testi partono dalla Guida tecnica del coach (G in 01-dati.js),
   che resta in fondo a ogni scheda con le sue note personali, e
   dalla tecnica di riferimento usata per rivedere le figure
   (ExRx e le altre fonti di docs/REVISIONE_ESERCIZI.md). Le scelte
   del coach (busto a 45°, gomiti a 45°, discese lente) restano.
   Formato: corpo [parte, come] · mov [fase, durata, respiro, come]
   · m muscoli principali · m2 muscoli che partecipano · err [che
   cosa noti, che cosa fai] · da: variante di un altro esercizio.
   ============================================================ */
var TEC_MUSC={petto:"petto", spalle_ant:"spalla davanti", spalle_lat:"spalla di lato", spalle_post:"spalla dietro", bicipiti:"bicipiti", tricipiti:"tricipiti",
  avambracci:"avambracci", addome:"addome", obliqui:"fianchi (obliqui)", costole:"costole", dorsali:"gran dorsale, sotto le ascelle", scapole:"fra le scapole",
  lombari:"lombari", glutei:"glutei", quadricipiti:"davanti della coscia", femorali:"dietro della coscia", polpacci:"polpacci", flessori:"davanti dell'anca"};
var HINGE45=[["Piedi","Larghi come le anche, peso su tutta la pianta."],["Ginocchia","Morbide, appena piegate, ferme."],
  ["Bacino","Spinto indietro: è lui che inclina il busto, non la schiena che si piega."],["Schiena","Dritta dal sacro alla nuca, busto a 45°."]];
var TEC={
"Cat-cow":{
 corpo:[["Mani","Sotto le spalle, dita aperte."],["Ginocchia","Sotto le anche, larghe quanto il bacino."],["Braccia","Distese, senza bloccare i gomiti, per tutto il movimento."],["Testa","Segue la colonna, non la guida."]],
 mov:[["Inarca","3 s","inspira","Lo sterno va avanti e il coccige verso l'alto: la pancia scende."],["Arrotonda","3 s","espira","Spingi il pavimento con le mani, ombelico verso la colonna, mento al petto."]],
 m:["scapole"], m2:["lombari","addome"],
 err:[["Si muovono solo collo e lombare, la zona fra le scapole resta ferma","Dimezza l'ampiezza e pensa a muovere lo sterno, non la testa."],["I gomiti si piegano","Tienili distesi: il movimento è della colonna."],["Vai di fretta","Tre secondi per fase, contati."]]},
"Rotazioni toraciche":{
 corpo:[["Bacino","Seduto sui talloni e fermo: è il blocco che isola il torace."],["Mano d'appoggio","Sotto la spalla, braccio disteso."],["Braccio che ruota","Passa sotto il petto, poi sale verso il soffitto."],["Testa","Lo sguardo segue la mano."]],
 mov:[["Sotto","2 s","espira","Infila il braccio sotto il petto, la spalla va verso terra."],["Apri","2-3 s","inspira","Ruota il petto verso il soffitto, fermati un attimo in alto."]],
 m:["scapole"], m2:["obliqui","costole"],
 err:[["Il bacino ruota insieme al busto","Siediti di più sui talloni."],["Tira in basso nella schiena","Riduci l'ampiezza: la rotazione deve stare fra le scapole."],["Un lato ruota meno","Non è un errore, è la tua curva: su quel lato 2 ripetizioni in più, restando più a lungo, senza forzare."]]},
"Bird-dog con pausa 3s":{
 corpo:[["Mani e ginocchia","Mani sotto le spalle, ginocchia sotto le anche."],["Schiena","Neutra, piatta come un tavolo: immagina un bicchiere sul sacro."],["Braccio","Si allunga avanti fino all'altezza della spalla."],["Gamba opposta","Si allunga dietro, tallone che spinge: il piede non sale sopra l'anca."],["Bacino","Orizzontale: i due fianchi alla stessa altezza."],["Testa","Sguardo a terra, collo lungo."]],
 mov:[["Allunga","2 s","espira","Braccio e gamba opposta insieme, lenti."],["Tieni","3 s","respira","Fermo, bacino orizzontale."],["Torna","2 s","inspira","Appoggia con controllo, poi cambia lato."]],
 m:["obliqui","addome"], m2:["glutei","spalle_post"],
 err:[["Il fianco ruota verso la gamba sollevata","Alza meno: bastano 20 cm da terra, piede puntato al pavimento."],["Il piede sale sopra l'anca e la lombare si inarca","Allunga indietro, non in alto."],["Un lato è molto più instabile","Probabilmente è il dislivello del bacino: su quel lato estendi solo la gamba."]]},
"Respirazione costale asimmetrica":{
 corpo:[["Seduta","Senza schienale, bacino dritto, piedi a terra."],["Mano sinistra","Sulle costole laterali di sinistra."],["Mano destra","Appoggiata passiva sulla zona del gibbo."],["Spalle","Basse e ferme."]],
 mov:[["Inspira","4 s","dal naso","Spingi le costole di sinistra contro la mano, di lato."],["Espira","6-7 s","lento","Lascia sgonfiare: a destra senti rientrare verso il centro."]],
 m:["costole"], m2:[],
 err:[["Le spalle si alzano","Stai respirando in alto: mano libera sulla spalla e un terzo d'aria in meno."],["Si gonfia la pancia e le costole restano ferme","Pensa alla direzione, di lato contro la mano, non alla quantità d'aria."]]},
"Glute bridge":{
 corpo:[["Piedi","Larghi come le anche, talloni vicini ai glutei, pianta intera a terra."],["Ginocchia","In linea con i piedi: non cadono dentro."],["Bacino","Prima di salire portalo in dentro: ombelico verso il mento."],["Schiena","Sale tutta insieme. In alto spalle, anche e ginocchia sono in linea."],["Braccia","Lungo i fianchi, palmi a terra."],["Testa","A terra, mento appena verso il petto."]],
 mov:[["Sali","1-2 s","espira","Spingi coi talloni e stringi i glutei."],["In alto","1 s","","Linea retta, non oltre."],["Scendi","2 s","inspira","Con controllo fino a sfiorare terra."]],
 m:["glutei"], m2:["femorali","addome"],
 err:[["Senti la lombare, o la schiena si inarca in alto","Fermati alla linea retta e contrai i glutei prima di salire."],["I femorali crampano","Avvicina i piedi al bacino."],["Le ginocchia cadono in dentro","Spingile in fuori, in linea con i piedi."]]},
"Band pull-apart":{
 corpo:[["Piedi","Larghi come le anche, ginocchia morbide."],["Busto","Dritto, costole basse, addome attivo."],["Braccia","Tese davanti al petto, all'altezza delle spalle."],["Mani","Presa poco più larga delle spalle, polsi dritti."],["Spalle","Basse, lontane dalle orecchie."]],
 mov:[["Apri","1-2 s","espira","Allontana le mani a braccia distese finché la banda sfiora il petto: le scapole si stringono."],["Tieni","1 s","",""],["Torna","2-3 s","inspira","Frena la banda: il ritorno lento è metà dell'esercizio."]],
 m:["scapole","spalle_post"], m2:[],
 err:[["La senti nelle spalle davanti","Banda troppo dura o presa stretta: allarga la presa o scendi di banda."],["Pieghi i gomiti","Tienili distesi; se non riesci, banda più leggera."],["Le spalle salgono verso le orecchie","Abbassale prima di aprire."],["Le costole si aprono e la schiena si inarca","Espira mentre apri, addome attivo."]]},

"Floor Press manubri":{
 corpo:[["Piedi e gambe","Ginocchia piegate, piedi a terra larghi come le anche."],["Bacino e lombare","Appoggiati: resta solo la curva naturale, una mano ci passa appena."],["Scapole","A terra, leggermente avvicinate e abbassate. Restano lì per tutta la serie."],["Gomiti","A 45° dal busto, non aperti a croce."],["Polsi","Dritti, sopra i gomiti: gli avambracci restano verticali."],["Testa","A terra, sguardo al soffitto."]],
 mov:[["Discesa","3 s","inspira","Scendi finché la parte alta del braccio sfiora il pavimento, senza appoggiare il peso."],["In basso","un attimo","","Sfiora, non rimbalzare."],["Spinta","1-2 s","espira","I manubri salgono sopra il petto e si avvicinano. Gomiti non bloccati."]],
 m:["petto","tricipiti"], m2:["spalle_ant"],
 err:[["I gomiti sbattono a terra","Conta i 3 secondi a voce."],["La schiena fa il ponte","Espira mentre spingi e tieni le costole basse: se non basta, il carico è troppo."],["Un braccio arriva in alto prima dell'altro","Fermati in alto, riallinea, poi scendi."],["Senti la spalla davanti più del petto","Avvicina i gomiti al busto e tieni le scapole appoggiate."]]},
"Floor Press (volume)":{da:"Floor Press manubri", nota:"Carico più leggero e senza i 3 secondi: discesa in 2. L'obiettivo è il volume, con il movimento pulito fino alla dodicesima.",
 err:[["Alla terza serie i gomiti sbattono a terra","Fermati a 10 ripetizioni invece di arrivare a 12 sporche."]]},
"Incline Press manubri":{
 corpo:[["Panca","Inclinata a 30-45°."],["Piedi","A terra, sotto le ginocchia."],["Bacino e schiena","Appoggiati: la lombare non si stacca."],["Scapole","Avvicinate e abbassate contro lo schienale."],["Gomiti","A 45-60° dal busto, sotto i manubri."],["Polsi","Dritti, sopra i gomiti."]],
 mov:[["Discesa","2-3 s","inspira","Manubri ai lati della parte alta del petto, fino a un leggero allungamento e non oltre."],["Spinta","1-2 s","espira","In alto sopra le spalle: i manubri si avvicinano."]],
 m:["petto","spalle_ant"], m2:["tricipiti"],
 err:[["La lombare si stacca dalla panca","Piedi ben piantati e costole basse; se continua, meno carico."],["I gomiti si aprono a 90° dal busto","Chiudili a 45-60°."],["In basso le spalle si arrotolano avanti","Scendi meno e tieni le scapole indietro."],["Fastidio alla spalla sinistra","Ferma la serie e tocca ⚠ Dolore."]]},
"Push-up":{
 corpo:[["Mani","Poco più larghe delle spalle, dita aperte, sotto la linea delle spalle."],["Gomiti","A 45° dal busto: visto dall'alto il corpo è una freccia, non una T."],["Spalle","Lontane dalle orecchie."],["Busto e bacino","Una tavola: addome e glutei stretti."],["Gambe","Tese, piedi uniti o larghi come le anche."],["Testa","Collo lungo, sguardo a terra poco avanti alle mani."]],
 mov:[["Discesa","2 s","inspira","Scendi in blocco finché il petto è a un pugno da terra; gli avambracci restano verticali."],["Spinta","1 s","espira","Spingi via il pavimento, il corpo resta in linea."]],
 m:["petto","tricipiti"], m2:["spalle_ant","addome"],
 err:[["Il bacino cede o si alza","Stringi glutei e addome: è un plank che si muove."],["La testa scende prima del petto","Guarda a terra e porta giù lo sterno."],["Un gomito si apre più dell'altro","Rallenta e controlla che le mani siano alla stessa distanza dalle spalle."],["Non arrivi a 12 pulite","Mani su un rialzo: meglio ripetizioni complete facilitate che parziali a terra."]]},
"Push-up stretti":{da:"Push-up", corpo:[["Mani","Alla larghezza delle spalle o poco meno."],["Gomiti","Lungo i fianchi, sfiorano il costato: non aperti a T."]], m:["tricipiti"], m2:["petto","spalle_ant"],
 err:[["I gomiti si aprono","Pensa «gomiti verso i piedi»."],["I polsi fanno male","Appoggia le mani su due manubri per tenerli dritti."]]},
"Push-up piedi rialzati":{da:"Push-up", corpo:[["Piedi","Sul bordo del letto o su una sedia bassa."]], m:["petto","spalle_ant"], m2:["tricipiti","addome"],
 err:[["Senti le spalle più del petto","Il rialzo è troppo alto: abbassalo."]]},
"Push-up piedi rialzati con banda":{da:"Push-up", corpo:[["Piedi","Su un rialzo basso."],["Banda","Dietro la parte alta della schiena, sulle scapole, mai sul collo o sulle vertebre; le estremità sotto le mani."]], m:["petto","spalle_ant"], m2:["tricipiti","addome"],
 err:[["La banda scivola verso il collo","Fermati e rimettila sulla parte muscolosa della schiena."],["Senti la spalla più del petto","Il rialzo dei piedi è troppo alto."]]},

"Rematore manubri":{
 corpo:HINGE45.concat([["Scapole","In partenza si lasciano allungare, a fine tirata si stringono."],["Gomiti","Sfiorano il costato e vanno verso le tasche posteriori."],["Polsi","Dritti: i manubri pendono sotto le spalle."],["Testa","In linea con la schiena, sguardo a terra un metro avanti."]]),
 mov:[["Tirata","1-2 s","espira","Porta i gomiti indietro finché i manubri sono ai fianchi."],["In alto","1 s","","Stringi le scapole."],["Discesa","2 s","inspira","Distendi le braccia senza perdere la schiena."]],
 m:["dorsali","scapole"], m2:["bicipiti","spalle_post"],
 err:[["La schiena si arrotonda","Stop subito: appoggia i pesi, non finire la serie. Riparti con meno carico."],["Il busto si raddrizza a ogni ripetizione","È slancio: il carico è troppo alto. Blocca il busto a 45°."],["Senti solo i bicipiti","Pensa ai gomiti, non alle mani: «gomiti verso le tasche posteriori»."],["Un lato arriva più in alto","Ferma il lato forte all'altezza del debole, per tutte le ripetizioni."]]},
"Rematore manubri (volume)":{da:"Rematore manubri", nota:"La schiena resta dritta per tutte e 12 le ripetizioni, non solo le prime otto.",
 err:[["Dalla nona ripetizione il busto comincia a raddrizzarsi","La serie utile è finita: fermati a 10 pulite."]]},
"Band row seduto":{
 corpo:[["Seduta","A terra, sugli ischi, bacino dritto."],["Gambe","Distese con le ginocchia appena piegate; la banda attorno alla pianta dei piedi."],["Busto","Eretto e fermo."],["Spalle","Basse."],["Gomiti","Vicini al busto, vanno indietro."],["Polsi","Dritti, in linea con gli avambracci."]],
 mov:[["Tirata","1-2 s","espira","Mani verso i fianchi, le scapole si stringono."],["Tieni","1 s","",""],["Ritorno","2-3 s","inspira","Braccia distese senza arrotondare la schiena."]],
 m:["dorsali","scapole"], m2:["bicipiti"],
 err:[["Il busto va indietro per aiutare","Siediti con la schiena contro un muro: se ti stacchi stai barando."],["La schiena si arrotonda nel ritorno","Fermati prima: le braccia si distendono, la schiena no."],["Senti solo i bicipiti","Pensa «gomiti indietro», non «mani verso di me»."]]},
"Band row un braccio":{
 corpo:[["Posizione","Seduto o in affondo, banda sotto un piede."],["Busto","Appena inclinato avanti, schiena dritta, fermo."],["Bacino e spalle","Rivolti avanti: non seguono il braccio."],["Mano libera","Su un appoggio stabile."],["Gomito","Vicino al fianco."],["Spalla","Bassa."]],
 mov:[["Tirata","1-2 s","espira","Gomito verso il fianco, la scapola va verso la colonna."],["Ritorno","2-3 s","inspira","Lento, fino a braccio disteso."]],
 m:["dorsali"], m2:["scapole","obliqui","bicipiti"],
 err:[["Il busto ruota seguendo il braccio","Mano libera su un appoggio e fianchi fermi."],["La spalla si alza","Abbassala prima di tirare."],["Un lato fa 12 ripetizioni molto più facilmente","Parti dal lato debole e ferma l'altro allo stesso numero."]]},
"Rematore al telaio della porta":{
 corpo:[["Porta","Aperta e ferma."],["Piedi","Uniti, vicini alla base del telaio: più sono vicini, più è duro."],["Corpo","Dritto come una tavola, inclinato indietro: glutei e addome stretti."],["Mano","Afferra il telaio all'altezza del petto; in partenza il braccio è teso."],["Spalle","Rivolte al telaio, non ruotano."],["Gomito","Sfiora il fianco."]],
 mov:[["Tirata","1-2 s","espira","Petto verso il telaio: «gomito verso la tasca»."],["Ritorno","3 s","inspira","Lento, fino a braccio teso."]],
 m:["dorsali","scapole"], m2:["bicipiti","obliqui"],
 err:[["Il bacino cede e il corpo si piega","Stringi i glutei: il corpo resta una tavola."],["Il busto ruota seguendo il braccio","Spalle rivolte al telaio."],["Tiri solo col bicipite","Pensa al gomito che va indietro."]]},
"Pullover manubrio":{
 corpo:[["Schiena","A terra: la lombare resta appoggiata per tutta la serie."],["Gambe","Ginocchia piegate, piedi a terra."],["Costole","Basse."],["Mani","Un manubrio con entrambe, palmi contro il disco superiore."],["Gomiti","Quasi distesi e fissi: l'angolo non cambia mai."],["Testa","A terra."]],
 mov:[["Indietro","3 s","espira","Arco ampio dietro la testa, solo fin dove la lombare resta a terra."],["Ritorno","2 s","inspira","Riporta il manubrio sopra il petto tirando da sotto le ascelle."]],
 m:["dorsali"], m2:["petto","tricipiti","addome"],
 err:[["La lombare si stacca da terra","Espira mentre vai dietro e fermati prima, anche a metà corsa."],["Pieghi molto i gomiti","Diventa un esercizio per i tricipiti: fissa l'angolo."],["Senti solo le spalle","Meno ampiezza e meno carico."]]},
"Band pull-down":{
 corpo:[["Banda","Fissata in alto, sopra la porta chiusa."],["Posizione","In ginocchio o in piedi, busto dritto appena inclinato avanti."],["Braccia","Tese verso l'ancoraggio."],["Spalle","Prima si abbassano, poi tirano i gomiti."],["Gomiti","Scendono verso i fianchi."],["Addome","Attivo: le costole non si aprono."]],
 mov:[["Tirata","1-2 s","espira","«Gomiti nelle tasche posteriori»."],["Tieni","1 s","",""],["Ritorno","2 s","inspira","Lento, fino a braccia tese."]],
 m:["dorsali"], m2:["scapole","bicipiti"],
 err:[["Ti pieghi indietro per aiutarti","Busto fermo."],["Le spalle salgono verso le orecchie","Abbassale prima di tirare."]]},

"Shoulder Press manubri":{
 corpo:[["Seduta","Schiena e bacino contro lo schienale."],["Piedi","A terra, ginocchia a 90°."],["Lombare","Resta appoggiata: addome attivo prima di spingere."],["Gomiti","Sotto i polsi, appena avanti alle spalle: non aperti a croce."],["Polsi","Dritti, sopra i gomiti."],["Manubri","In partenza ai lati della testa, all'altezza delle spalle."]],
 mov:[["Spinta","1-2 s","espira","In alto fino a braccia quasi distese, manubri sopra le spalle."],["Discesa","2-3 s","inspira","Fino all'altezza del mento."]],
 m:["spalle_ant","spalle_lat"], m2:["tricipiti","addome"],
 err:[["La lombare si stacca dallo schienale","Espira mentre spingi e contrai l'addome prima di partire; se continua, scendi di carico."],["I manubri vanno dietro la testa","Tienili appena davanti alla linea delle orecchie."],["I gomiti cadono in fuori","Polsi sopra i gomiti, avambracci verticali."],["Fastidio alla spalla sinistra","Ferma la serie e tocca ⚠ Dolore: è la stessa spalla del Reverse Fly."]]},
"Shoulder press con banda":{
 corpo:[["Piedi","Sulla banda, larghi come le anche."],["Ginocchia","Morbide."],["Bacino","Glutei stretti: la lombare non si inarca."],["Costole","Basse."],["Gomiti","Sotto i polsi."],["Mani","In partenza all'altezza delle spalle."]],
 mov:[["Spinta","1-2 s","espira","In alto fino a braccia quasi distese."],["Discesa","2-3 s","inspira","Controllata fino al mento."]],
 m:["spalle_ant","spalle_lat"], m2:["tricipiti","addome"],
 err:[["La lombare si inarca per spingere","Contrai addome e glutei prima di partire."],["Fastidio alla spalla sinistra","Ferma la serie e tocca ⚠ Dolore."]]},
"Pike push-up":{
 corpo:[["Mani","Larghe come le spalle, dita avanti."],["Piedi","Avvicinati alle mani finché il bacino è alto: una V rovesciata."],["Gambe","Distese."],["Bacino","Alto, il più possibile sopra le mani."],["Gomiti","Scendendo restano sopra le mani e puntano indietro, a 45°."],["Testa","Fra le braccia; scende poco avanti alle mani."]],
 mov:[["Discesa","2-3 s","inspira","La testa va verso il pavimento: la traiettoria è verticale."],["Spinta","1-2 s","espira","Spingi via il pavimento e torna alla V."]],
 m:["spalle_ant","tricipiti"], m2:["spalle_lat"],
 err:[["Diventa un push-up orizzontale","Bacino troppo basso: avvicina i piedi alle mani."],["La testa va avanti invece che in basso","Guarda i piedi mentre scendi."],["Senti il collo","Spingi le spalle lontano dalle orecchie."],["È troppo duro","Allontana i piedi dalle mani."]]},
"Alzate laterali":{
 corpo:[["Piedi","Larghi come le anche."],["Ginocchia","Morbide."],["Busto","Dritto, appena inclinato avanti; addome attivo."],["Spalle","Basse."],["Gomiti","Appena piegati e fissi."],["Mani","Mignolo appena più alto del pollice, polso in linea."]],
 mov:[["Salita","1-2 s","espira","Di lato fino all'altezza delle spalle, non oltre: guida il gomito."],["Discesa","2-3 s","inspira","Frenata fino ai fianchi."]],
 m:["spalle_lat"], m2:[],
 err:[["Le spalle salgono verso le orecchie","Sta lavorando il trapezio: il carico è troppo, torna a 4 kg."],["Ti aiuti con lo slancio delle gambe","Ginocchia ferme; se non riesci, meno carico."],["Superi l'altezza delle spalle","Fermati quando il gomito è in linea con la spalla."],["Il braccio sinistro sale meno","Ferma tutti e due all'altezza del sinistro."]]},
"Alzate laterali con banda":{da:"Alzate laterali", corpo:[["Piedi","Sulla banda leggera: più sono larghi, più tira."]], nota:"Discesa in 2 secondi. Regola la tensione con la larghezza dei piedi.",
 err:[["Le spalle salgono verso le orecchie","Banda più leggera, o piedi meno larghi."]]},
"Face pull":{
 corpo:HINGE45.concat([["Braccia","In partenza pendono sotto le spalle."],["Gomiti","Salgono ALTI e larghi, all'altezza delle spalle."],["Mani","Arrivano all'altezza del viso; a fine corsa ruotano in fuori."],["Collo","Lungo, in linea con la schiena."]]),
 mov:[["Tirata","1-2 s","espira","Pensa «gomiti verso le pareti laterali», non «mani verso il viso»."],["Tieni","1-2 s","","Gomiti alti, braccia aperte."],["Discesa","2 s","inspira",""]],
 m:["spalle_post","scapole"], m2:[],
 err:[["I gomiti scendono sotto la linea delle spalle","Diventa un rematore: alza i gomiti e, se serve, cala il carico."],["Senti tirare nel collo","Carico troppo alto: scendi."],["Il busto si raddrizza","Blocca il bacino indietro."]]},
"Reverse Fly":{
 corpo:HINGE45.concat([["Braccia","Pendono sotto le spalle, palmi che si guardano."],["Gomiti","Appena piegati e fissi."],["Collo","Lungo, sguardo a terra."]]),
 mov:[["Apri","1-2 s","espira","Di lato fino all'altezza delle spalle, stringendo le scapole."],["Discesa","2-3 s","inspira","Frenata."]],
 m:["spalle_post","scapole"], m2:[],
 err:[["Ti raddrizzi per usare lo slancio","Busto fermo a 45°; se non riesci, meno carico."],["Senti il trapezio alto o il collo","Spalle basse e carico più leggero."],["Il braccio sinistro arriva meno in alto o molla a fine serie","FERMA la serie, non finirla, e tocca ⚠ Dolore."]]},
"Y-T-W a busto inclinato":{
 corpo:HINGE45.concat([["Mani","Pollici in alto."],["Y","Braccia in alto e avanti, larghe a 45° dalla testa."],["T","Braccia aperte di lato, all'altezza delle spalle."],["W","Gomiti piegati che vanno indietro verso i fianchi, mani in fuori."]]),
 mov:[["Y, T, W","1 s ciascuna","respira","Una ripetizione sono le tre lettere, lente, con un secondo fermo su ognuna."]],
 m:["spalle_post","scapole"], m2:[],
 err:[["La schiena si arrotonda o il busto si raddrizza","Riduci l'inclinazione."],["Senti il collo","Spalle lontane dalle orecchie, sguardo a terra."],["Il braccio sinistro arriva meno in alto","Ferma tutti e due alla sua altezza."]]},

"French Press":{
 corpo:[["Seduta","Schiena appoggiata, piedi a terra."],["Lombare","Non si inarca: costole basse."],["Mani","Un manubrio con entrambe le mani sopra la testa."],["Gomiti","Puntati in alto e in avanti, vicini alla testa, fermi."],["Polsi","Dritti, in linea con gli avambracci."]],
 mov:[["Discesa","2-3 s","inspira","Si piegano solo i gomiti: il manubrio scende dietro la nuca."],["Salita","1-2 s","espira","Distendi senza bloccare."]],
 m:["tricipiti"], m2:[],
 err:[["I gomiti si aprono di lato scendendo","Il carico è troppo per il controllo che hai: 2 kg in meno. Immagina due binari stretti ai lati della testa."],["La schiena si inarca","Addome attivo prima di partire."],["Non senti i tricipiti","Quasi sempre sono i gomiti che si aprono: stringili."]]},
"Overhead extension 1 braccio":{
 corpo:[["Seduta","Sul bordo della sedia, senza appoggiare la schiena."],["Addome","Attivo, costole basse."],["Braccio che lavora","Quasi verticale, gomito puntato in alto e vicino alla testa."],["Mano libera","Sostiene il gomito che lavora."],["Polso","Dritto, in linea con l'avambraccio."]],
 mov:[["Discesa","3 s","inspira","Il manubrio scende dietro la testa, il gomito non si muove."],["Salita","1-2 s","espira","Distendi senza bloccare."]],
 m:["tricipiti"], m2:[], nota:"Una serie per lato, alternando: il recupero è l'altro braccio. Parti dal lato debole.",
 err:[["Il gomito si apre o scende in avanti","Tienilo fermo con la mano libera."],["La schiena si inarca per spingere","Addome attivo e 2 kg in meno."],["Senti la spalla più del tricipite","Avvicina il gomito alla testa; se resta fastidio alla spalla sinistra, ferma e tocca ⚠ Dolore."],["Il manubrio scende a scatti","Carico troppo alto."]]},
"Band tricep extension":{
 corpo:[["Piede","Ben piantato sulla banda: controllalo sempre prima di partire."],["Corpo","In piedi, ginocchia morbide, glutei stretti."],["Mani","Dietro la testa, tengono l'altra estremità."],["Gomiti","Puntati in alto e stretti."],["Busto","Fermo."]],
 mov:[["Distendi","1-2 s","espira","Si muovono solo gli avambracci."],["Ritorno","2-3 s","inspira","Frena la banda."]],
 m:["tricipiti"], m2:[],
 err:[["I gomiti si aprono","Immagina due binari; se la banda è troppo dura per tenerli fermi, scendi di una."],["Il busto dà slancio","Glutei stretti, costole basse."],["Il piede scivola sulla banda","Fermati e rimettilo: non continuare."]]},
"Kick back tricipiti":{
 corpo:[["Busto","Quasi orizzontale, schiena piatta."],["Mano libera","Appoggiata a una sedia."],["Ginocchia","Morbide."],["Omero","Parallelo al pavimento, attaccato al busto: resta lì."],["Avambraccio","In partenza pende verticale."]],
 mov:[["Distendi","1-2 s","espira","Porta la mano indietro fino a braccio dritto."],["Tieni","1 s","","Fermo a braccio disteso."],["Torna","2 s","inspira","Fino all'avambraccio verticale."]],
 m:["tricipiti"], m2:[],
 err:[["Il gomito scende e il braccio dondola","Lavora la spalla: fissa il gomito e scendi di peso."],["La schiena si arrotonda","Bacino indietro, petto avanti."],["Il manubrio sale con lo slancio","Questo esercizio si fa leggero e lento."]]},
"Curl bicipiti manubri":{
 corpo:[["Piedi","Larghi come le anche (oppure seduto)."],["Busto","Dritto, glutei e addome attivi."],["Spalle","Basse e indietro."],["Gomiti","Attaccati ai fianchi, fermi."],["Polsi","Dritti, palmi in avanti."]],
 mov:[["Salita","1-2 s","espira","Fino alle spalle, senza far avanzare i gomiti."],["Discesa","2 s","inspira","Fino a braccio quasi disteso: la discesa lenta è metà dello stimolo."]],
 m:["bicipiti"], m2:["avambracci"],
 err:[["La schiena si inarca per dare slancio","Schiena contro un muro: se ti stacchi, stai usando slancio."],["I gomiti scivolano avanti","Tienili sul costato."],["La discesa è una caduta","Conta due secondi."]]},
"Hammer Curl":{da:"Curl bicipiti manubri", corpo:[["Polsi","Presa neutra: i palmi si guardano e il polso non ruota mai."]], m:["bicipiti","avambracci"], m2:[],
 err:[["Il polso ruota in salita","Stai facendo un curl normale: palmi sempre uno verso l'altro."]]},
"Band curl bicipiti":{
 corpo:[["Piedi","Sulla banda: più sono larghi, più tira."],["Busto","Dritto, non si piega avanti."],["Gomiti","Vicini al busto, fermi."],["Polsi","Dritti, in linea con gli avambracci."]],
 mov:[["Salita","1-2 s","espira","La tensione cresce verso la fine."],["Ritorno","3 s","inspira","È la parte che conta."]],
 m:["bicipiti"], m2:["avambracci"],
 err:[["Ti pieghi in avanti quando la banda tira","Addome attivo; se non basta, piedi più stretti."],["I gomiti si spostano","Tienili sul costato."],["Il ritorno è uno scatto","Tre secondi contati."]]},
"Hammer curl con banda":{da:"Band curl bicipiti", corpo:[["Polsi","Presa neutra: i palmi si guardano."]], m:["bicipiti","avambracci"], m2:[],
 err:[["Il polso ruota","Palmi sempre uno verso l'altro."]]},
"Curl isometrico asciugamano":{
 corpo:[["Piedi","Sul centro dell'asciugamano, a terra per intero."],["Mani","Un capo per mano."],["Gomiti","A 90°, accanto al busto."],["Schiena","Dritta, meglio contro un muro."]],
 mov:[["Tira e tieni","il tempo indicato","respira","Tira verso l'alto con tutta la forza, senza muoverti."]],
 m:["bicipiti","avambracci"], m2:[],
 err:[["Ti inarchi o sali sulle punte per tirare","Schiena contro il muro."],["Trattieni il respiro","Conta a voce: se non riesci a parlare, molla un po' la tensione."]]},

"Box Squat":{
 corpo:[["Piedi","Poco più larghi delle anche, punte appena in fuori, talloni a terra."],["Ginocchia","Seguono la direzione delle punte: non cadono dentro."],["Bacino","Va indietro per primo, come per sederti."],["Schiena","Dritta; il busto si inclina avanti quanto serve."],["Manubri","Lungo i fianchi, spalle basse."],["Testa","Sguardo avanti."]],
 mov:[["Discesa","2-3 s","inspira","Fianchi indietro fino a SFIORARE il box."],["In basso","un attimo","","Tocca e riparti: non sederti."],["Salita","1-2 s","espira","Spingi il pavimento coi talloni."]],
 m:["quadricipiti","glutei"], m2:["femorali"],
 err:[["Ti lasci cadere sul box","Frena gli ultimi centimetri."],["Le ginocchia cadono in dentro","Spingile in fuori, verso le punte."],["I talloni si sollevano","Porta il peso indietro."],["Il peso è più su un piede","Cinque squat senza carico a occhi chiusi: senti dove pesi e riparti da lì."]]},
"Box squat alla sedia 3s":{da:"Box Squat", corpo:[["Braccia","Avanti, per l'equilibrio: niente manubri."]], nota:"Discesa in 3 secondi e 1 secondo di pausa senza sederti.",
 err:[["Quindici ripetizioni sono facili","Allunga la discesa a 4 secondi o aggiungi 2 secondi di pausa in basso."]]},
"Bulgarian Split Squat manubri":{
 corpo:[["Piede dietro","Sul rialzo, collo del piede appoggiato e rilassato."],["Piede davanti","Avanti quanto basta perché in basso il ginocchio resti sopra la caviglia; pianta intera a terra."],["Ginocchio davanti","In linea con la punta: non cade dentro."],["Bacino","Rivolto avanti, orizzontale."],["Busto","Quasi dritto."],["Manubri","Lungo i fianchi."]],
 mov:[["Discesa","2-3 s","inspira","Scendi in verticale fino al ginocchio a 90°."],["Salita","1-2 s","espira","Spingi col piede davanti."]],
 m:["quadricipiti","glutei"], m2:["flessori"],
 err:[["Spingi col piede dietro","Avanza di 10 cm il piede davanti."],["Il busto si inclina molto avanti","Guarda avanti e scendi in verticale."],["Il ginocchio va dentro","Spingilo verso la punta."],["Un lato scende meno","È quel lato a decidere la profondità di entrambi."]]},
"Bulgarian split squat 3s":{da:"Bulgarian Split Squat manubri", corpo:[["Braccia","Senza manubri: mani sui fianchi."]], nota:"Senza carico lo stimolo viene dal tempo: 3 secondi di discesa.",
 err:[["Dodici ripetizioni senza fatica","Passa a 4 secondi di discesa o aggiungi 2 secondi di pausa in basso."]]},
"Calf raise monopodalico":{
 corpo:[["Piede","Avampiede su un rialzo, tallone libero di scendere."],["Ginocchio","Disteso e fermo."],["Mano","Al muro, solo per l'equilibrio."],["Bacino","Dritto sopra il piede."]],
 mov:[["Salita","1-2 s","espira","Sulla punta, il più in alto possibile."],["In alto","1 s","",""],["Discesa","2-3 s","inspira","Fino a sentire l'allungamento."]],
 m:["polpacci"], m2:[],
 err:[["Rimbalzi in basso","Fermati un attimo prima di risalire."],["Ti aggrappi al muro","Due dita, non la mano."],["Il ginocchio si piega per aiutare","Meno ripetizioni, ma a gamba tesa."]]},
"Hip thrust con banda":{
 corpo:[["Schiena","Il bordo del divano sotto le scapole."],["Piedi","Larghi come le anche; in alto le tibie sono verticali."],["Ginocchia","Spingono in fuori contro la banda, che sta appena sopra."],["Bacino","Portato in dentro prima di salire."],["Costole","Basse."],["Testa","Mento verso il petto, sguardo avanti."]],
 mov:[["Salita","1-2 s","espira","Stringi i glutei prima di partire, poi spingi coi talloni."],["In alto","1 s","","Linea retta spalle-ginocchia: è il massimo, non un punto da superare."],["Discesa","2 s","inspira",""]],
 m:["glutei"], m2:["femorali"],
 err:[["La lombare si inarca invece del bacino che sale","Mento al petto e glutei contratti prima di spingere."],["Senti femorali o lombare più dei glutei","Avvicina i piedi e fermati alla linea retta."],["Le ginocchia cadono in dentro","Spingile contro la banda."]]},
"Hip thrust a una gamba":{
 corpo:[["Schiena","Scapole sul bordo del letto o del divano."],["Piede a terra","Sotto il ginocchio."],["Gamba libera","Distesa."],["Bacino","Orizzontale: mani sulle creste iliache per controllarlo."],["Testa","Mento verso il petto."]],
 mov:[["Salita","1-2 s","espira","Spingi col tallone fino alla linea spalle-ginocchio."],["In alto","1 s","",""],["Discesa","2 s","inspira",""]],
 m:["glutei"], m2:["femorali"],
 err:[["Il bacino ruota verso la gamba sollevata","Le mani sulle creste devono restare alla stessa altezza."],["La lombare si inarca","Fermati alla linea retta."],["Un lato è molto più debole","Parti da quello e ferma l'altro allo stesso numero."]]},
"Split-stance RDL":{
 corpo:[["Piede davanti","Porta l'80% del peso, pianta intera a terra."],["Piede dietro","Trenta centimetri indietro, solo la punta appoggiata."],["Ginocchio davanti","Appena piegato e fermo: non si piega di più per scendere."],["Bacino","Va INDIETRO, e resta rivolto avanti."],["Schiena","Neutra dal sacro alla nuca."],["Manubri","Scorrono vicino alla gamba, braccia distese."],["Testa","In linea con la schiena."]],
 mov:[["Discesa","2-3 s","inspira","Bacino indietro finché senti tirare dietro la coscia, con la schiena piatta."],["Salita","1-2 s","espira","Spingi il bacino avanti stringendo il gluteo."]],
 m:["femorali","glutei"], m2:["lombari","avambracci"],
 err:[["La schiena si arrotonda","STOP immediato. Riparti con meno carico e meno profondità."],["Pieghi il ginocchio per scendere di più","È uno squat: il ginocchio resta fermo, scende il busto."],["Spingi col piede dietro","Alleggeriscilo: solo la punta."],["Un lato scende molto più dell'altro","Il lato che scende meno decide la profondità di entrambi."]]},
"RDL (Romanian Deadlift)":{
 corpo:[["Piedi","Larghi come le anche."],["Ginocchia","Appena piegate e ferme."],["Bacino","Va indietro."],["Schiena","Neutra dal sacro alla nuca."],["Manubri","Scorrono vicino alle gambe."],["Testa","In linea con la schiena."]],
 mov:[["Discesa","2-3 s","inspira","Fin dove la schiena resta piatta: per molti appena sotto il ginocchio."],["Salita","1-2 s","espira","Bacino avanti, glutei stretti."]],
 m:["femorali","glutei"], m2:["lombari","avambracci"],
 err:[["La schiena si arrotonda","STOP: meno profondità o meno carico."],["Pieghi le ginocchia per scendere","Diventa uno squat: ginocchia ferme."],["I manubri si allontanano dalle gambe","Tienili a contatto."]]},
"Hip hinge una gamba":{
 corpo:[["Gamba d'appoggio","Ginocchio morbido, piede ben piantato."],["Gamba libera","Si allunga dietro, in linea con il busto."],["Bacino","Orizzontale: immagina due fari sulle creste iliache puntati a terra."],["Schiena","Neutra."],["Braccia","Pendono sotto le spalle o stanno sui fianchi."]],
 mov:[["Discesa","2-3 s","inspira","Bacino indietro, busto e gamba libera scendono e salgono insieme."],["Salita","1-2 s","espira","Stringi il gluteo della gamba d'appoggio."]],
 m:["femorali","glutei"], m2:["obliqui","lombari"],
 err:[["Il bacino ruota aprendosi verso l'esterno","I due fari restano puntati a terra."],["La schiena si arrotonda","Scendi meno."],["Pieghi troppo il ginocchio d'appoggio","Tienilo morbido e fermo."]]},
"Affondi indietro manubri":{
 corpo:[["Partenza","In piedi, piedi larghi come le anche."],["Passo","INDIETRO, lungo: così il ginocchio davanti resta sopra la caviglia."],["Ginocchio davanti","In linea con la punta, non la supera."],["Ginocchio dietro","Scende verso terra fino a sfiorarla."],["Busto","Dritto."],["Manubri","Lungo i fianchi."]],
 mov:[["Discesa","2 s","inspira","Tutte e due le ginocchia a 90°."],["Salita","1-2 s","espira","Spingi con la gamba davanti per tornare in piedi."]],
 m:["quadricipiti","glutei"], m2:["femorali"],
 err:[["Il busto si inclina troppo avanti","Sguardo su un punto fisso all'altezza degli occhi."],["Il ginocchio davanti supera la punta","Passo più lungo."],["Perdi l'equilibrio di lato","Allarga un poco la traiettoria del passo; se succede sempre dallo stesso lato, annotalo."]]},
"Affondi indietro":{da:"Affondi indietro manubri", corpo:[["Mani","Sui fianchi: niente manubri."]], nota:"Discesa in 2 secondi.", err:[]},

"Plank":{
 corpo:[["Avambracci","Paralleli, gomiti sotto le spalle."],["Spalle","Spingi via il pavimento: le scapole restano larghe."],["Addome","Ombelico in dentro, costole verso il bacino."],["Bacino","Glutei stretti, appena in dentro."],["Gambe","Tese, piedi larghi come le anche."],["Testa","Collo lungo, sguardo a terra."]],
 mov:[["Tieni","il tempo indicato","respira","Conta i secondi a voce: in apnea non si conta."]],
 m:["addome"], m2:["obliqui","glutei","spalle_ant"],
 err:[["Il bacino cade e senti la lombare","Stringi i glutei; se non basta, fermati: 30 secondi dritti valgono più di 60 storti."],["Il bacino sale a triangolo","Abbassalo fino alla linea spalle-talloni."],["Trattieni il respiro","Conta a voce: con il reflusso vale doppio."],["Un fianco è più basso dell'altro","Riallinea guardandoti i fianchi, poi riparti."]]},
"Side plank":{
 corpo:[["Avambraccio","Sotto la spalla, gomito a 90°."],["Piedi","Uno sull'altro, o sfalsati se serve equilibrio."],["Bacino","Alto: testa, bacino e piedi in linea."],["Busto","Di taglio: il petto guarda avanti, non a terra."],["Spalla d'appoggio","Lontana dall'orecchio."]],
 mov:[["Tieni","il tempo indicato","respira","Sul sinistro pensa a spingere il fianco verso il soffitto."]],
 m:["obliqui"], m2:["lombari","glutei"],
 err:[["Il bacino scende piano piano","Fermati, recupera 20 secondi e riparti: conta il tempo totale."],["Il busto ruota verso terra","Petto avanti."],["La spalla d'appoggio si schiaccia verso l'orecchio","Spingi via il pavimento con l'avambraccio."]]},
"Dead bug":{
 corpo:[["Schiena","Supino, con la lombare schiacciata a terra: è la posizione da non perdere."],["Braccia","Verso il soffitto."],["Gambe","Anche e ginocchia a 90°."],["Testa","A terra."]],
 mov:[["Estendi","2-3 s","espira","Braccio e gamba opposta scendono senza toccare terra."],["Torna","2 s","inspira","Poi l'altro lato."]],
 m:["addome"], m2:["obliqui","flessori"],
 err:[["La lombare si stacca dal pavimento","È l'unico errore che conta: una mano sotto la schiena per sentirlo, e muovi la gamba di soli 20 cm."],["Vai veloce","Lento: il lavoro è nel non muovere la schiena."]]}
};

/* ---------- lettura ---------- */
function tecDef(n){
  var nome=(typeof fgNome==="function" && !TEC[n])? fgNome(n) : n, t=TEC[nome]||TEC[n];
  if(!t) return null;
  if(!t.da) return Object.assign({nome:nome}, t);
  var b=TEC[t.da]; if(!b) return null;
  /* variante: le righe con lo stesso nome sostituiscono quelle della base, le altre si aggiungono in testa */
  var corpo=(t.corpo||[]).slice(); b.corpo.forEach(function(r){ if(!corpo.some(function(x){ return x[0]===r[0]; })) corpo.push(r); });
  return {nome:nome, da:t.da, nota:t.nota||"", corpo:corpo, mov:t.mov||b.mov, m:t.m||b.m, m2:t.m2||b.m2, err:(t.err||[]).concat(b.err)};
}
function tecHas(n){ return !!tecDef(n); }
function tecMuscoli(lista){ return (lista||[]).map(function(k){ return TEC_MUSC[k]||k; }); }

/* il corpo con i muscoli che devi sentire: pieno = lavora di piu', tenue = partecipa */
function tecMappa(m, m2){
  var A="rgba(232,120,90,.95)", B="rgba(232,120,90,.38)", N="var(--surf2)";
  var col=function(k){ return (m||[]).indexOf(k)>=0? A : (m2||[]).indexOf(k)>=0? B : N; };
  var R=function(x,y,w,h,rx,k){ return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+rx+'" fill="'+col(k)+'" stroke="var(--bg)" stroke-width="1.5"/>'; };
  var E=function(x,y,rx,ry,k){ return '<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="'+col(k)+'" stroke="var(--bg)" stroke-width="1.5"/>'; };
  var P=function(d,k){ return '<path d="'+d+'" fill="'+col(k)+'" stroke="var(--bg)" stroke-width="1.5"/>'; };
  var base=function(cx){ return '<circle cx="'+cx+'" cy="20" r="12" fill="'+N+'"/><rect x="'+(cx-5)+'" y="30" width="10" height="9" rx="3" fill="'+N+'"/>'+
    '<rect x="'+(cx-30)+'" y="38" width="60" height="84" rx="16" fill="'+N+'"/><rect x="'+(cx-26)+'" y="112" width="52" height="20" rx="9" fill="'+N+'"/>'; };
  var f=78, b=222, s='<svg class="mm tecmap" viewBox="0 0 300 228" role="img" aria-label="Dove devi sentire il lavoro">';
  /* davanti */
  s+=base(f);
  s+=R(f-26,44,24,24,9,"petto")+R(f+2,44,24,24,9,"petto");
  s+=E(f-33,47,9,9,"spalle_ant")+E(f+33,47,9,9,"spalle_ant")+E(f-42,50,4.5,9,"spalle_lat")+E(f+42,50,4.5,9,"spalle_lat");
  s+=R(f-46,60,13,33,6,"bicipiti")+R(f+33,60,13,33,6,"bicipiti")+R(f-47,95,11,38,5,"avambracci")+R(f+36,95,11,38,5,"avambracci");
  s+=R(f-27,70,11,17,5,"costole")+R(f+16,70,11,17,5,"costole")+R(f-27,89,11,22,5,"obliqui")+R(f+16,89,11,22,5,"obliqui");
  s+=R(f-13,71,26,40,7,"addome");
  s+=E(f-13,120,10,7,"flessori")+E(f+13,120,10,7,"flessori");
  s+=R(f-24,131,21,50,9,"quadricipiti")+R(f+3,131,21,50,9,"quadricipiti");
  s+='<rect x="'+(f-22)+'" y="184" width="16" height="30" rx="7" fill="'+N+'"/><rect x="'+(f+6)+'" y="184" width="16" height="30" rx="7" fill="'+N+'"/>';
  /* dietro */
  s+=base(b);
  s+=R(b-15,46,30,28,8,"scapole");
  s+=P("M"+(b-28)+",62 L"+(b-17)+",60 L"+(b-9)+",100 L"+(b-23)+",104 Z","dorsali")+P("M"+(b+28)+",62 L"+(b+17)+",60 L"+(b+9)+",100 L"+(b+23)+",104 Z","dorsali");
  s+=E(b-33,47,9,9,"spalle_post")+E(b+33,47,9,9,"spalle_post")+E(b-42,50,4.5,9,"spalle_lat")+E(b+42,50,4.5,9,"spalle_lat");
  s+=R(b-46,60,13,33,6,"tricipiti")+R(b+33,60,13,33,6,"tricipiti")+R(b-47,95,11,38,5,"avambracci")+R(b+36,95,11,38,5,"avambracci");
  s+=R(b-9,80,18,30,6,"lombari");
  s+=E(b-12,123,13,11,"glutei")+E(b+12,123,13,11,"glutei");
  s+=R(b-24,136,21,45,9,"femorali")+R(b+3,136,21,45,9,"femorali");
  s+=R(b-22,184,16,30,7,"polpacci")+R(b+6,184,16,30,7,"polpacci");
  s+='<text class="lb" x="'+f+'" y="226" text-anchor="middle">DAVANTI</text><text class="lb" x="'+b+'" y="226" text-anchor="middle">DIETRO</text>';
  return s+'</svg>';
}

/* ---------- la scheda completa ---------- */
function tecScheda(n){
  var t=tecDef(n); if(!t) return "";
  var g=G[n] || G[t.nome] || (t.da? G[t.da] : null), pd=(typeof posDef==="function")? posDef(n) : null, h="";
  if(t.da) h+='<div class="xs mut" style="margin-top:6px">Variante di «'+esc(t.da)+'»'+(t.nota? ': '+esc(t.nota) : '.')+'</div>';
  else if(t.nota) h+='<div class="flag info" style="margin-top:8px"><b>i</b><div>'+esc(t.nota)+'</div></div>';
  h+='<div class="gsez"><div class="eyebrow glow">1 · Come ti metti</div><div class="tectab">'+
    t.corpo.map(function(r){ return '<div class="tecr"><b>'+esc(r[0])+'</b><span>'+esc(r[1])+'</span></div>'; }).join("")+'</div></div>';
  h+='<div class="gsez"><div class="eyebrow glow">2 · Come ti muovi</div>'+
    t.mov.map(function(r,i){ return '<div class="tecf"><i>'+(i+1)+'</i><div><b>'+esc(r[0])+'</b>'+
      (r[1]? '<span class="tect">'+esc(r[1])+'</span>' : '')+(r[2]? '<span class="tect resp">'+esc(r[2])+'</span>' : '')+
      (r[3]? '<div class="sm" style="margin-top:2px">'+esc(r[3])+'</div>' : '')+'</div></div>'; }).join("")+'</div>';
  h+='<div class="gsez"><div class="eyebrow" style="color:var(--ok)">3 · Cosa devi sentire</div>'+tecMappa(t.m, t.m2)+
    '<div class="sm" style="margin-top:4px"><span class="tecdot" style="background:rgba(232,120,90,.95)"></span><b>Lavora di più:</b> '+esc(tecMuscoli(t.m).join(", "))+
    ((t.m2||[]).length? '<br><span class="tecdot" style="background:rgba(232,120,90,.38)"></span><b>Partecipa:</b> '+esc(tecMuscoli(t.m2).join(", ")) : '')+'</div>'+
    (g && g.f? '<div class="sm" style="margin-top:6px">'+esc(g.f)+'</div>' : '');
  if(pd && pd.no && pd.no.length) h+='<div class="sm" style="margin-top:8px"><b style="color:var(--alert)">Qui non devi sentire fastidio:</b></div><div class="chips" style="margin-top:4px">'+
    pd.no.map(function(z){ return '<span class="no">'+esc(zonaNome(z))+'</span>'; }).join("")+'</div>'+
    '<div class="xs mut" style="margin-top:4px">Se lo senti: ferma la serie e tocca ⚠ Dolore, con zona e intensità.</div>';
  h+='</div>';
  h+='<div class="gsez"><div class="eyebrow" style="color:var(--alert)">4 · Stai sbagliando se</div>'+
    t.err.map(function(r){ return '<div class="tece"><div class="sm"><b>'+esc(r[0])+'.</b></div><div class="sm tecfix"><b>Fai così:</b> '+esc(r[1])+'</div></div>'; }).join("")+'</div>';
  if(g) h+='<details class="altro" style="margin-top:14px"><summary>Le note del coach su questo esercizio</summary>'+
    '<div class="sm" style="margin-top:8px">'+esc(g.p)+'</div>'+
    '<div class="sm" style="margin-top:6px"><b>Errori.</b> '+esc(g.e)+'</div><div class="sm" style="margin-top:6px"><b>Correzione.</b> '+esc(g.c)+'</div></details>';
  return h;
}
/* il promemoria sulla scheda dell'esercizio, in seduta: le tre cose da tenere a mente */
function tecBreve(n, i){
  var t=tecDef(n); if(!t) return "";
  var pd=(typeof posDef==="function")? posDef(n) : null;
  var punti=(pd && pd.co && pd.co.length)? pd.co.map(function(c){ return c[1]; }) : t.corpo.slice(0,4).map(function(r){ return r[0]+": "+r[1]; });
  var tempo=t.mov.filter(function(r){ return r[1]; }).map(function(r){ return r[0].toLowerCase()+" "+r[1]+(r[2]? ", "+r[2] : ""); }).join(" · ");
  return '<button class="tecbr" data-a="tip" data-i="'+i+'" aria-label="Come si fa">'+
    '<div class="eyebrow glow">Posizione</div><ul>'+punti.slice(0,4).map(function(p){ return '<li>'+esc(p)+'</li>'; }).join("")+'</ul>'+
    (tempo? '<div class="tecl"><b>Tempo</b><span>'+esc(tempo)+'</span></div>' : '')+
    '<div class="tecl"><b style="color:var(--ok)">Senti</b><span>'+esc(tecMuscoli(t.m).join(", "))+'</span></div>'+
    (t.err.length? '<div class="tecl"><b style="color:var(--alert)">Occhio</b><span>'+esc(t.err[0][0].charAt(0).toLowerCase()+t.err[0][0].slice(1))+': '+esc(t.err[0][1].charAt(0).toLowerCase()+t.err[0][1].slice(1))+'</span></div>' : '')+
    '<div class="xs" style="margin-top:6px;color:var(--glow);font-weight:700">Scheda completa ›</div></button>';
}
