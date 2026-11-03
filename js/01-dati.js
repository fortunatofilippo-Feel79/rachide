/* ============================================================
   RACHIDE — registro allenamento
   I riferimenti clinici stanno nei documenti del progetto, non qui:
   il repository e' pubblico.
   Piano: Piano_Unico_v5 · Guida_Tecnica_v5
   ============================================================ */

/* ---------- catalogo esercizi ---------- */
/* g = gruppo · t = tipo (rec) · cap = tetto · uni = unilaterale · sec = misurato in secondi */
var EX = {
  "Floor Press manubri":        {g:"Petto",   t:"comp", cap:20, step:2},
  "Rematore manubri":           {g:"Dorso",   t:"comp", cap:20, step:2},
  "Shoulder Press manubri":     {g:"Spalle",  t:"comp", cap:20, step:2},
  "Push-up piedi rialzati con banda":{g:"Petto",t:"compl", band:true},
  "French Press":               {g:"Tricipiti",t:"iso",  step:2},
  "Overhead extension 1 braccio":{g:"Tricipiti",t:"iso", cap:14, step:2, uni:true},
  "Plank":                      {g:"Core",    t:"core", sec:true},
  "Box Squat":                  {g:"Gambe",   t:"comp", cap:30, step:2},
  "Bulgarian Split Squat manubri":{g:"Gambe", t:"compl",cap:20, step:2, uni:true},
  "Calf raise monopodalico":    {g:"Gambe",   t:"iso",  uni:true},
  "Band tricep extension":      {g:"Tricipiti",t:"iso", band:true},
  "Side plank":                 {g:"Core",    t:"core", sec:true, uni:true},
  "Rematore manubri (volume)":  {g:"Dorso",   t:"comp", cap:20, step:2},
  "Pullover manubrio":          {g:"Dorso",   t:"compl",step:2},
  "Floor Press (volume)":       {g:"Petto",   t:"compl",cap:20, step:2},
  "Push-up":                    {g:"Petto",   t:"compl"},
  "Curl bicipiti manubri":      {g:"Bicipiti",t:"iso",  cap:8,  step:2},
  "Alzate laterali":            {g:"Spalle",  t:"iso",  step:1},
  "Face pull":                  {g:"Spalle",  t:"iso",  cap:6,  step:2},
  "Hip thrust con banda":       {g:"Gambe",   t:"compl",band:true},
  "Split-stance RDL":           {g:"Gambe",   t:"comp", cap:20, step:2, uni:true},
  "Affondi indietro manubri":   {g:"Gambe",   t:"compl",step:2, uni:true},
  "Hammer Curl":                {g:"Bicipiti",t:"iso",  cap:8,  step:2},
  "Reverse Fly":                {g:"Spalle",  t:"iso",  cap:6,  step:2},
  "Bulgarian split squat 3s":   {g:"Gambe",   t:"compl",uni:true},
  "Pike push-up":               {g:"Spalle",  t:"compl"},
  "Hip hinge una gamba":        {g:"Gambe",   t:"compl",uni:true},
  "Push-up stretti":            {g:"Tricipiti",t:"compl"},
  "Band row seduto":            {g:"Dorso",   t:"comp", band:true},
  "Band row un braccio":        {g:"Dorso",   t:"compl",band:true, uni:true},
  "Band pull-apart":            {g:"Spalle",  t:"iso",  band:true},
  "Band curl bicipiti":         {g:"Bicipiti",t:"iso",  band:true},
  "Hammer curl con banda":      {g:"Bicipiti",t:"iso",  band:true},
  "Dead bug":                   {g:"Core",    t:"core", uni:true},
  /* storici, non più nel piano v5 */
  "Chest Press manubri":{g:"Petto",t:"comp"}, "Incline Press manubri":{g:"Petto",t:"compl"},
  "RDL (Romanian Deadlift)":{g:"Gambe",t:"comp"}, "Bulgarian split squat (BW)":{g:"Gambe",t:"compl",uni:true},
  "Calf raise":{g:"Gambe",t:"iso"}, "Calf raise (BW)":{g:"Gambe",t:"iso"},
  "Band pull-down":{g:"Dorso",t:"compl",band:true}, "Rematore un braccio manubrio":{g:"Dorso",t:"compl",uni:true}, "Reverse Fly leggero":{g:"Spalle",t:"iso"},
  "Reverse Fly manubri":{g:"Spalle",t:"iso"}, "Kick back tricipiti":{g:"Tricipiti",t:"iso"},
  "Face pull con banda":{g:"Spalle",t:"iso"}, "Isometria push-up":{g:"Petto",t:"compl",sec:true},
  "Push-up piedi rialzati o deficit":{g:"Petto",t:"compl"}
};

var REST = {comp:150, compl:90, iso:75, core:45};
/* scala reale del set BeMaxx: gialla 4,5 · blu 9,1 · verde 13,6 · nera 18,1 · rossa 22,7 kg */
var BANDS = ["gialla","blu","verde","nera","rossa"];

/* ---------- riscaldamento: 6 minuti, blocco scoliosi ---------- */
var WARM = [
  {n:"Cat-cow", d:"8 ripetizioni lente · muovi lo sterno, non la testa"},
  {n:"Rotazioni toraciche", d:"6 per lato · bacino fermo, seduto sui talloni"},
  {n:"Bird-dog con pausa 3s", d:"8 per lato · unico lavoro diretto sugli estensori lombari"},
  {n:"Respirazione costale asimmetrica", d:"5 respiri · mano sn attiva sulle costole, mano dx passiva sul gibbo"},
  {n:"Attivazione del giorno", d:"", var:{A:"15 band pull-apart + 10 cerchi braccia", C:"15 band pull-apart + 10 cerchi braccia",
    B:"10 glute bridge + 10 squat lenti", D:"10 glute bridge + 10 squat lenti",
    T1:"10 glute bridge + 10 squat lenti", T2:"15 band pull-apart + 10 cerchi braccia"}}
];

/* ---------- i 4 giorni + 2 trasferte ---------- */
/* s = serie · lo/hi = range rep · L = carico di partenza · b = banda · u = unilaterale */
var BASEPLAN = {
 A:{name:"Spinta e trazione, forza", sede:"Casa", dischi:"20 › 20 › 14 › 16", min:60, ex:[
   {n:"Floor Press manubri", s:4, lo:8, hi:10, L:20, tip:"Discesa contata 3 secondi. Sei al tetto dei manubri: qui si progredisce col tempo."},
   {n:"Rematore manubri", s:4, lo:8, hi:10, L:20, tip:"Se la schiena si arrotonda anche di poco, appoggia i pesi. Non finire la serie."},
   {n:"Shoulder Press manubri", s:3, lo:8, hi:10, L:14, tip:"Seduto, schiena appoggiata. Fastidio spalla sn → ferma la serie e attiva il flag."},
   {n:"Push-up piedi rialzati con banda", s:3, lo:10, hi:12, b:"gialla", swap:"Porta i manubri a 16 kg mentre fai questo"},
   {n:"French Press", s:3, lo:10, hi:10, L:16, tip:"Gomiti fermi e stretti. Se si aprono, scendi di 2 kg."},
   {n:"Plank", s:3, lo:60, hi:60, sec:true, tip:"Conta i secondi a voce: non puoi contare in apnea."}
 ]},
 B:{name:"Gambe quadricipiti e core", sede:"Casa", dischi:"28 › 16", min:45, ex:[
   {n:"Box Squat", s:3, lo:8, hi:10, L:28, tip:"Sfiora il box, non ci si siede. Talloni a terra."},
   {n:"Bulgarian Split Squat manubri", s:3, lo:10, hi:10, L:16, u:true, swap:"Manubri a 16 kg", tip:"Se un lato scende meno, quello definisce la profondità di entrambi."},
   {n:"Calf raise monopodalico", s:3, lo:12, hi:12, u:true, tip:"A due gambe eri a RIR 3-4: non allenante."},
   {n:"Band tricep extension", s:2, lo:12, hi:12, b:"rossa"},
   {n:"Side plank", s:3, lo:40, hi:60, sec:true, u:true, asym:true, tip:"Sinistra 60s · destra 40s. Non è un errore: la convessità lombare è a sinistra."}
 ]},
 C:{name:"Volume upper", sede:"Casa", dischi:"20 › 16 › 16 › 16 › 8 › 6 › 6", min:70, ex:[
   {n:"Rematore manubri (volume)", s:4, lo:12, hi:12, L:20, tip:"Dalla rep 9 in poi il busto non deve raddrizzarsi. Meglio 10 pulite che 12 sporche."},
   {n:"Pullover manubrio", s:3, lo:12, hi:12, L:16, tip:"Espira mentre porti il peso dietro: impedisce meccanicamente l'inarcamento lombare."},
   {n:"Floor Press (volume)", s:3, lo:12, hi:12, L:16},
   {n:"French Press", s:3, lo:10, hi:10, L:16},
   {n:"Push-up", s:3, lo:12, hi:15, swap:"Manubri a 8 kg"},
   {n:"Curl bicipiti manubri", s:4, lo:10, hi:10, L:8, tip:"8 kg fissi. A 10 kg la terza serie crolla: prima chiudi 4×10 pulite per due sessioni."},
   {n:"Alzate laterali", s:3, lo:15, hi:15, L:6, swap:"Manubri a 6 kg"},
   {n:"Face pull", s:3, lo:15, hi:15, L:6, tip:"Gomiti alti. Non saltarlo quando la sessione è lunga: è il più protettivo per la spalla."}
 ]},
 D:{name:"Catena posteriore e braccia", sede:"Casa", dischi:"14 › 16 › 16 › 8 › 8 › 6", min:60, ex:[
   {n:"Hip thrust con banda", s:3, lo:12, hi:15, b:"rossa", tip:"Va prima del RDL: i glutei spingono a fresco e la lombare non compensa."},
   {n:"Split-stance RDL", s:3, lo:8, hi:8, L:12, u:true, tip:"80% del peso sulla gamba avanti. Schiena che si arrotonda = stop immediato."},
   {n:"Affondi indietro manubri", s:2, lo:12, hi:12, L:16, u:true, swap:"Manubri a 16 kg"},
   {n:"French Press", s:3, lo:10, hi:10, L:16},
   {n:"Curl bicipiti manubri", s:3, lo:10, hi:10, L:8, swap:"Manubri a 8 kg"},
   {n:"Hammer Curl", s:3, lo:10, hi:10, L:8, tip:"Presa neutra rinforza la presa, che è stata il limite sul RDL."},
   {n:"Reverse Fly", s:3, lo:15, hi:15, L:6, tip:"6 kg è tetto assoluto. A 8 kg la spalla sn ha ceduto due volte."}
 ]},
 T1:{name:"Trasferta · spinta e gambe", sede:"Trasferta", dischi:"solo bande", min:40, ex:[
   {n:"Push-up piedi rialzati con banda", s:4, lo:10, hi:12, b:"gialla", tip:"In hotel il rialzo è il bordo del letto o la valigia rigida."},
   {n:"Bulgarian split squat 3s", s:3, lo:12, hi:12, u:true, tip:"Senza manubri lo stimolo viene dalla durata: 3 secondi in discesa."},
   {n:"Pike push-up", s:3, lo:8, hi:10},
   {n:"Hip hinge una gamba", s:3, lo:10, hi:10, u:true, tip:"È l'esercizio in trasferta che più probabilmente rivela l'asimmetria."},
   {n:"Push-up stretti", s:3, lo:10, hi:12},
   {n:"Side plank", s:3, lo:40, hi:60, sec:true, u:true, asym:true}
 ]},
 T2:{name:"Trasferta · trazione e braccia", sede:"Trasferta", dischi:"solo bande", min:40, ex:[
   {n:"Band row seduto", s:4, lo:12, hi:15, b:"rossa"},
   {n:"Band row un braccio", s:3, lo:12, hi:12, b:"nera", u:true, tip:"La misura di asimmetria più pulita che hai in trasferta."},
   {n:"Band pull-apart", s:3, lo:15, hi:15, b:"verde", tip:"Qui è esercizio, non riscaldamento: ritorno rallentato a 3 secondi."},
   {n:"Band curl bicipiti", s:3, lo:12, hi:12, b:"nera"},
   {n:"Hammer curl con banda", s:3, lo:12, hi:12, b:"nera"},
   {n:"Band tricep extension", s:3, lo:12, hi:12, b:"rossa"},
   {n:"Dead bug", s:3, lo:10, hi:10, u:true, tip:"La lombare deve restare schiacciata a terra. È l'unico errore che conta."},
   {n:"Side plank", s:3, lo:40, hi:60, sec:true, u:true, asym:true}
 ]}
};

/* ---------- i tre segnali che fermano la serie ---------- */
var STOPS = [
  "Schiena che si arrotonda su hinge o rematore → appoggia i pesi.",
  "Dolore articolare puntuale (spalla sn su Reverse Fly, Shoulder Press, Alzate) → ferma la serie.",
  "Bruciore o risalita acida → fermati, alzati, respira. Poi verifica: quante ore dall'ultimo pasto?"
];

/* ---------- storico settimane 24-30 (dal tracker v4) ---------- */
/* w|data|giorno|esercizio|lato|banda|carico|reps|rir|top|nota */
var SEED_LOG = ``;

/* w|data|giorno|sede|modalità|durata|energia|riscaldamento|segnale|nota */
var SEED_SESS = ``;

/* w|data|peso|torace|bicipite|coscia|vita|nota */
var SEED_MIS = ``;

/* data|w|reflusso|resp47|camminate|hrv|readiness|sonno|alcol|nota */
var SEED_BEN = ``;
/* ============================================================
   GUIDA TECNICA IN APP — da Guida_Tecnica_v5
   p = setup ed esecuzione (si legge una volta)
   f = devi sentire · e = stai sbagliando se · c = correzione
   (f/e/c sono quello che serve tra una serie e l'altra)
   ============================================================ */
var G = {
"Cat-cow":{p:"A quattro zampe, mani sotto le spalle. Inspira inarcando (sterno avanti), espira arrotondando (mento al petto). 3 secondi per fase.",
 f:"Un'onda che parte dal bacino e arriva al collo, segmento dopo segmento. La zona dorsale alta deve partecipare.",
 e:"Il movimento è tutto nel collo e nella lombare, con la zona fra le scapole ferma.",
 c:"Riduci l'ampiezza del 50% e pensa a muovere lo sterno, non la testa."},
"Rotazioni toraciche":{p:"A quattro zampe, glutei sui talloni per bloccare il bacino. Un braccio passa sotto il corpo, poi si apre verso il soffitto seguendo la mano con lo sguardo.",
 f:"Rotazione libera fra le scapole. Nessun tiro in zona lombare.",
 e:"Il bacino ruota col busto, o senti tirare in basso nella schiena. Con la tua scoliosi è probabile che un lato ruoti meno: non è un errore, è un'informazione.",
 c:"Siediti sui talloni. Sul lato più rigido fai 2 ripetizioni in più, restando più a lungo in posizione invece di forzare l'ampiezza."},
"Bird-dog con pausa 3s":{p:"A quattro zampe, schiena neutra. Estendi braccio e gamba opposta fino a quasi orizzontali, fermati 3 secondi, torna con controllo.",
 f:"Obliqui e muscoli profondi che lavorano per IMPEDIRE la rotazione del bacino. Gluteo della gamba estesa attivo. Nessuna compressione lombare.",
 e:"Il fianco ruota verso il lato della gamba sollevata. Il piede sale sopra il livello dell'anca. Se un lato è nettamente più instabile, è quasi certamente il dislivello pelvico.",
 c:"Bastano 20 cm da terra. Punta il piede verso il pavimento. Se il fianco ruota ancora, estendi solo la gamba."},
"Respirazione costale asimmetrica":{p:"Seduto senza schienale. Mano SINISTRA sulle costole laterali sinistre, mano DESTRA appoggiata passiva sulla zona del gibbo. Inspira 4s spingendo le costole sinistre contro la mano, espira 6-7s.",
 f:"L'espansione laterale sinistra sotto la mano. A destra, in espirazione, uno sgonfiamento verso il centro.",
 e:"Le spalle si alzano in inspirazione. La pancia si gonfia e le costole restano ferme.",
 c:"Mano libera sulla spalla: se si alza, sei in respiro apicale. Riduci il volume d'aria del 30% e pensa alla direzione, non alla quantità."},

"Floor Press manubri":{p:"A terra, ginocchia piegate, gomiti a 45° dal busto (non 90°). Spingi in alto senza bloccare i gomiti. Scendi contando 3 secondi fino a sfiorare il pavimento.",
 f:"Petto e tricipiti nella spinta. Nella discesa lenta un allungamento controllato nel petto. Scapole appoggiate e leggermente ravvicinate.",
 e:"I gomiti sbattono a terra invece di sfiorarla. La schiena forma un ponte marcato. Un braccio arriva in alto prima dell'altro. Senti la spalla davanti più del petto.",
 c:"Gomiti che sbattono: conta i 3 secondi a voce. Un braccio che anticipa: fermati in alto e riallinea prima di scendere. Spalla: avvicina i gomiti al busto."},
"Floor Press (volume)":{p:"Stessa tecnica del Floor Press, carico più leggero, SENZA il tempo di 3 secondi. Qui l'obiettivo è volume.",
 f:"Petto e tricipiti. Il movimento deve restare pulito fino alla dodicesima.",
 e:"Alla terza serie i gomiti sbattono a terra.",
 c:"Riduci a 10 ripetizioni invece di arrivare a 12 sporche."},
"Rematore manubri":{p:"Piedi larghezza anche, busto a 45°, schiena dritta. Tira i manubri ai fianchi, gomiti vicini al busto, scapole strette a fine movimento.",
 f:"Contrazione nel dorso e fra le scapole. I bicipiti lavorano ma non devono dominare.",
 e:"La schiena si arrotonda — il rischio più serio del tuo programma. Il busto si raddrizza per dare slancio. Senti solo i bicipiti. Un lato arriva più in alto.",
 c:"Schiena che si arrotonda: abbassa il carico subito, non finire la serie. Pensa 'gomiti verso le tasche posteriori'. Se un lato è più corto, fermalo lì per tutte le ripetizioni: si pareggia sul lato debole."},
"Rematore manubri (volume)":{p:"Stessa tecnica del rematore. La differenza è mantenere la schiena dritta per tutte e 12 le ripetizioni, non solo le prime otto.",
 f:"Dorso e interscapolari, con la schiena che non si muove mai.",
 e:"Dalla ripetizione 9 in poi il busto inizia a raddrizzarsi: hai finito la serie utile.",
 c:"Fermati a 10 pulite invece di arrivare a 12 sporche."},
"Shoulder Press manubri":{p:"Seduto con schiena appoggiata. Manubri all'altezza delle spalle, gomiti sotto i polsi. Spingi in alto, scendi fino al mento.",
 f:"Deltoidi nella spinta, addome attivo, schiena che resta appoggiata.",
 e:"La lombare si stacca dallo schienale inarcandosi. I manubri vanno dietro la testa. Compare fastidio nella spalla sinistra.",
 c:"Espira durante la spinta, contrai l'addome prima di partire. Lombare che si inarca: torna a 12 kg. Fastidio spalla sinistra: ferma la serie e attiva il flag — è la stessa spalla del Reverse Fly."},
"Push-up piedi rialzati con banda":{p:"Piedi su un rialzo basso. Banda dietro la parte alta della schiena, all'altezza delle scapole, mai sulle vertebre o sul collo, estremità sotto le mani.",
 f:"Petto, soprattutto la parte alta. Carico crescente verso la fine della spinta.",
 e:"Il bacino cede o si alza a punta. Senti la spalla più del petto. La banda scivola verso il collo. I gomiti si aprono in modo diverso.",
 c:"Bacino: stringi glutei e addome, è un plank in movimento. Spalla: il rialzo dei piedi è troppo alto. Banda che scivola: riposizionala sulla parte muscolosa."},
"French Press":{p:"Seduto, schiena appoggiata. Un manubrio con entrambe le mani sopra la testa, gomiti puntati avanti e vicini alla testa. Piega i gomiti dietro la nuca. I gomiti non si muovono.",
 f:"Il tricipite, in particolare il capo lungo, che si allunga in basso e si contrae in alto.",
 e:"I gomiti si aprono lateralmente scendendo — è l'errore che ti ha fatto scrivere 'non sento lavorare bene i tricipiti' il 26/07. La schiena si inarca.",
 c:"Se i gomiti si aprono il carico è troppo alto per il controllo che hai: scendi di 2 kg. Immagina di far passare la testa fra due binari stretti."},
"Plank":{p:"Avambracci sotto le spalle, gomiti a 90°, corpo in linea da testa a talloni.",
 f:"Addome e glutei attivi. Respiro libero. Nessuna pressione allo stomaco.",
 e:"Il bacino cade (senti la lombare) o si alza a triangolo. Trattieni il respiro. Un fianco è più basso dell'altro.",
 c:"Se la lombare si carica, 30 secondi con la linea perfetta valgono più di 60 storti. Conta i secondi a voce: non puoi contare in apnea. Vale doppio per il reflusso."},

"Box Squat":{p:"Davanti a una sedia all'altezza del ginocchio. Scendi spingendo i fianchi indietro fino a SFIORARE il box. Risali spingendo con i talloni.",
 f:"Quadricipiti e glutei nella risalita. Il box dà un riferimento costante di profondità: serve a confrontare i due lati.",
 e:"Ti lasci cadere sul box. Le ginocchia collassano dentro. I talloni si sollevano. Il peso è più su un piede che sull'altro — con 1,3 cm di dislivello è il pattern atteso.",
 c:"Test: appoggia il peso e fai 5 squat a occhi chiusi. A occhi aperti compensi visivamente senza accorgertene. Questo è l'esercizio da filmare da dietro ogni 4 settimane."},
"Bulgarian Split Squat manubri":{p:"Piede posteriore su un rialzo, collo del piede in appoggio. Piede anteriore avanti quanto basta perché il ginocchio resti sopra la caviglia. Scendi a 90°, risali spingendo col piede anteriore.",
 f:"Quadricipite e gluteo della gamba ANTERIORE. Allungamento davanti all'anca posteriore.",
 e:"Spingi col piede posteriore. Il busto si inclina molto avanti. Il ginocchio va dentro. Un lato richiede più equilibrio o scende meno profondo.",
 c:"Se spingi col posteriore, avanza di 10 cm il piede anteriore. Se un lato scende meno, usa QUEL lato per definire la profondità di entrambi."},
"Bulgarian split squat 3s":{p:"Stessa tecnica della versione con manubri. Senza carico lo stimolo viene dal tempo: 3 secondi di discesa controllata.",
 f:"Quadricipite e gluteo della gamba anteriore, con bruciore che arriva dalla durata più che dal carico.",
 e:"Fai 12 ripetizioni con 3 secondi di discesa senza fatica: sei sotto stimolo.",
 c:"Passa a 4 secondi o aggiungi una pausa di 2 secondi in basso."},
"Calf raise monopodalico":{p:"Su una gamba, avampiede su un rialzo col tallone libero di scendere. Una mano al muro solo per l'equilibrio. Sali sulla punta, pausa 1 secondo, scendi lentamente.",
 f:"Contrazione intensa del polpaccio in alto, allungamento chiaro in basso.",
 e:"Rimbalzi in basso invece di controllare. Ti aggrappi al muro. Il ginocchio si piega per aiutare.",
 c:"Se non arrivi a 12, scendi a 8 ma con pausa piena. Annota se un polpaccio regge sistematicamente meno."},
"Band tricep extension":{p:"In piedi, un'estremità della banda sotto un piede ben piantato, l'altra con entrambe le mani dietro la testa. Gomiti piegati e puntati in alto.",
 f:"Il tricipite isolato, capo lungo.",
 e:"I gomiti si aprono. Il busto dà slancio. Il piede scivola sulla banda: verifica sempre prima di partire.",
 c:"Gomiti stretti, immagina due binari. Se la rossa è troppo dura per tenerli fermi, torna alla nera."},
"Side plank":{p:"Su un fianco, avambraccio esattamente sotto la spalla, gomito a 90°. Solleva il bacino fino alla linea retta e mantieni.",
 f:"Obliqui e quadrato dei lombi del lato A TERRA. Sul sinistro, la sensazione di spingere il fianco verso il soffitto.",
 e:"Il bacino scende progressivamente. Il busto ruota invece di restare di taglio. La spalla d'appoggio si schiaccia verso l'orecchio.",
 c:"Meglio 40s perfetti che 60s col bacino che cala. Sul sinistro, quando la tenuta cede, fermati e recupera 20 secondi: conta il tempo totale. Sinistra più lunga perché la convessità lombare è a sinistra."},

"Pullover manubrio":{p:"A terra, ginocchia piegate. UN manubrio con entrambe le mani, palmi contro il disco superiore, braccia quasi distese sopra il petto. Porta il manubrio dietro la testa in un arco ampio.",
 f:"Allungamento chiaro nel gran dorsale, sotto le ascelle, quando il peso è dietro. Le costole restano basse.",
 e:"La lombare si stacca da terra formando un arco — per te è l'errore più rilevante. Pieghi molto i gomiti. Senti solo le spalle.",
 c:"Espira MENTRE porti il peso dietro: abbassa le costole e impedisce meccanicamente l'inarcamento. Se non basta, fermati dove riesci a tenere la schiena a terra, anche a metà range."},
"Push-up":{p:"Mani poco più larghe delle spalle, corpo in linea da testa a talloni, glutei contratti. Gomiti a 45° dal busto.",
 f:"Petto e tricipiti. Il corpo che si muove come un blocco unico.",
 e:"Il bacino cede o si alza. La testa scende prima del petto. Un gomito si apre più dell'altro.",
 c:"Se non arrivi a 12 pulite, mani su un rialzo: meglio ripetizioni complete facilitate che parziali a terra."},
"Push-up stretti":{p:"Come il push-up ma mani alla larghezza delle spalle o poco meno. Gomiti vicini al busto, non aperti a T.",
 f:"Tricipiti in modo dominante, petto in secondo piano.",
 e:"I gomiti si aprono. I polsi fanno male.",
 c:"Se i polsi danno fastidio, appoggia le mani su due manubri per tenerli neutri."},
"Curl bicipiti manubri":{p:"Seduto o in piedi, gomiti vicini al busto e fermi. Piega portando i manubri alle spalle, scendi controllato in 2 secondi.",
 f:"Bicipite isolato. Nessun coinvolgimento della schiena.",
 e:"La schiena si inarca per dare slancio — da evitare in particolare col tuo quadro lombare. I gomiti scivolano avanti. La discesa è una caduta libera.",
 c:"Appoggia la schiena a un muro: se ti stacchi stai usando slancio. La discesa lenta è metà dello stimolo."},
"Hammer Curl":{p:"Come il curl ma presa NEUTRA: i palmi si guardano. La presa resta neutra per tutto il movimento.",
 f:"La parte esterna del braccio e l'avambraccio. È una sensazione diversa dal curl classico: se è identica, stai ruotando il polso.",
 e:"Il polso ruota in salita. Usi slancio. La discesa è troppo veloce.",
 c:"Ha un bonus per te: rinforza la presa, che è stata il fattore limitante sul RDL. Se scendi in 3 secondi, quel beneficio raddoppia."},
"Alzate laterali":{p:"In piedi, gomiti leggermente piegati e FISSI. Solleva lateralmente fino all'altezza delle spalle, non oltre. Mignolo leggermente più alto del pollice.",
 f:"Il deltoide laterale, il cappuccio della spalla.",
 e:"Le spalle salgono verso le orecchie (lavora il trapezio). Usi slancio con le gambe. Superi l'altezza delle spalle. Il braccio sinistro sale meno o con più fatica.",
 c:"Se le spalle salgono, torna a 4 kg. È l'esercizio dove l'ego costa di più e rende di meno."},
"Face pull":{p:"Busto a 45°, schiena dritta, un manubrio per mano che pende. Tira verso l'ALTEZZA DEL VISO tenendo i gomiti ALTI, aprendo le braccia a fine corsa.",
 f:"Parte posteriore della spalla e zona fra le scapole. Una sensazione larga, non concentrata in un punto.",
 e:"I gomiti scendono sotto la linea delle spalle: diventa un rematore. Senti tirare nel collo.",
 c:"Se senti il collo, abbassa il carico. Pensa 'gomiti verso le pareti laterali', non 'mani verso il viso'. Non saltarlo quando la sessione è lunga: è il più protettivo per la spalla."},

"Hip thrust con banda":{p:"Schiena appoggiata a un divano basso sotto le scapole, piedi larghezza anche, banda appena sopra le ginocchia. Spingi il bacino in alto fino alla linea retta spalle-ginocchia, pausa 1 secondo.",
 f:"Contrazione forte dei glutei in alto. Un lavoro laterale negli abduttori per via della banda.",
 e:"La lombare si inarca invece che il bacino salire. Senti i femorali o la lombare più dei glutei. Le ginocchia collassano dentro.",
 c:"Contrai i glutei PRIMA di iniziare la spinta, mento verso il petto. La linea retta è il massimo, non un punto da superare. Va prima del RDL: i glutei spingono a fresco e la lombare non compensa."},
"Overhead extension 1 braccio":{p:"Seduto sul bordo di una sedia SENZA appoggiare la schiena (il gibbo non tocca lo schienale), addome attivo. Un manubrio in una mano sopra la testa, braccio quasi verticale; l'altra mano sostiene il gomito che lavora. Scendi dietro la testa in 3 secondi tenendo il gomito fermo e puntato in alto, risali espirando. Una serie per lato: alterni sx e dx, il recupero è l'altro braccio. Parti dal lato più debole e pareggia l'altro su quel numero.",
 f:"Il tricipite, soprattutto il capo lungo (parte posteriore del braccio vicino all'ascella), che si allunga in basso e si contrae in alto. Nessuna tensione in collo o lombare.",
 e:"Il gomito si apre o scende in avanti. La schiena si inarca per spingere. Senti la spalla più del tricipite. Il manubrio scende a scatti.",
 c:"Gomito stretto e fermo, mano libera a sostenerlo. Se la schiena si inarca, contrai l'addome prima di partire e scendi di 2 kg. Fastidio alla spalla sinistra: ferma la serie e attiva il flag, come per lo Shoulder Press."},
"Split-stance RDL":{p:"Un piede avanti che porta l'80% del carico, l'altro arretrato 30 cm con SOLO la punta appoggiata. Spingi il bacino INDIETRO, non scendere in basso. I manubri scorrono vicino alla gamba.",
 f:"Allungamento netto nel femorale della gamba ANTERIORE. Lombare neutra e ferma. Glutei che si contraggono nella risalita.",
 e:"La schiena si arrotonda: STOP immediato. Pieghi il ginocchio anteriore per scendere più in basso: è uno squat, non un hinge. Spingi col piede posteriore. Un lato scende molto più dell'altro.",
 c:"Senza video: (1) nel riscaldamento 6 hinge a vuoto con un manico di scopa lungo la schiena, tre contatti (nuca, dorso, sacro): se ne perdi uno hai arrotondato. (2) Test del muro: a 20 cm dal muro, tocca con i glutei senza piegare le ginocchia. Quella è la sensazione. Se un lato scende meno, quel lato definisce la profondità di entrambi. Se non tieni la schiena dritta, 10 kg."},
"Affondi indietro manubri":{p:"Passo INDIETRO (non avanti: riduce lo stress sul ginocchio anteriore), scendi piegando entrambe le ginocchia a 90°, spingi con la gamba ANTERIORE per tornare.",
 f:"Quadricipite e gluteo della gamba anteriore.",
 e:"Il busto si inclina troppo avanti. Il ginocchio anteriore supera la punta del piede. Perdi l'equilibrio lateralmente — se succede sempre dallo stesso lato è informazione, non caso.",
 c:"Allarga leggermente la traiettoria del passo indietro. Guarda un punto fisso davanti a te all'altezza degli occhi."},
"Reverse Fly":{p:"Busto a 45°, schiena dritta, manubri che pendono, gomiti leggermente piegati e fissi. Apri le braccia lateralmente fino all'altezza delle spalle stringendo le scapole.",
 f:"Parte posteriore della spalla e zona interscapolare.",
 e:"Ti raddrizzi per usare slancio. Senti il trapezio alto o il collo. Il braccio sinistro arriva meno in alto o molla a fine serie — è il segnale specifico da monitorare.",
 c:"Se la spalla sinistra dà segnali: FERMA la serie, non finirla, e attiva il flag. Non è un dato da annotare a fine settimana. 6 kg è tetto assoluto: a 8 ha ceduto due volte."},

"Pike push-up":{p:"Da posizione di push-up, cammina coi piedi verso le mani fino a una V rovesciata. Testa fra le braccia, bacino alto. Abbassa la testa verso il pavimento: la traiettoria è verticale.",
 f:"Deltoidi anteriori e tricipiti. È l'equivalente a corpo libero dello Shoulder Press.",
 e:"Il movimento diventa orizzontale come un push-up (bacino troppo basso). La testa va avanti invece che in basso. Senti il collo.",
 c:"Avvicina i piedi alle mani per alzare il bacino. Se è troppo duro, appoggia i piedi più lontano."},
"Hip hinge una gamba":{p:"In piedi su una gamba, l'altra sollevata dietro. Spingi il bacino indietro inclinando il busto avanti: busto e gamba formano una linea. Risali contraendo il gluteo.",
 f:"Femorale e gluteo della gamba d'appoggio. Il core che lavora per non farti ruotare.",
 e:"Il bacino ruota aprendosi verso l'esterno. La schiena si arrotonda. Pieghi troppo il ginocchio d'appoggio.",
 c:"Immagina due fari sulle creste iliache: devono puntare al pavimento per tutto il movimento. È l'esercizio in trasferta che più probabilmente rivela la tua asimmetria."},
"Band row seduto":{p:"Seduto a terra, gambe distese, banda attorno alla pianta dei piedi. Busto eretto. Tira le mani verso i fianchi, gomiti vicini al busto, scapole strette.",
 f:"Dorso e zona fra le scapole.",
 e:"Il busto si inclina indietro per aiutare. La schiena si arrotonda nel ritorno. Senti solo i bicipiti.",
 c:"Siediti contro un muro con la schiena appoggiata: se ti stacchi stai barando. Pensa 'gomiti indietro', non 'mani verso di me'."},
"Band row un braccio":{p:"Seduto o in affondo, banda sotto un piede, una mano sull'estremità, busto leggermente inclinato. Tira verso il fianco senza ruotare il busto.",
 f:"Il dorso del lato che lavora. Il core che impedisce la rotazione.",
 e:"Il busto ruota seguendo il braccio. La spalla si alza. Un lato completa 12 ripetizioni con evidente più facilità dell'altro.",
 c:"Mano libera su una superficie stabile per bloccare il busto. Pareggia sempre sul lato debole. È la misura di asimmetria più pulita che hai in trasferta."},
"Band pull-apart":{p:"Banda con due mani davanti al petto, braccia tese, presa poco più larga delle spalle. Allontana le mani fino quasi a toccare il petto con le braccia distese. In T2 rallenta il ritorno a 3 secondi.",
 f:"Contrazione fra le scapole.",
 e:"La senti nelle spalle davanti, o pieghi i gomiti: la banda è troppo dura o la presa troppo stretta.",
 c:"Allarga la presa o scendi di banda. Il ritorno lento è metà dell'esercizio."},
"Band curl bicipiti":{p:"In piedi, banda sotto entrambi i piedi, gomiti vicini al busto. Il ritorno è la parte importante: 3 secondi.",
 f:"Bicipite, con tensione crescente verso la fine della salita — l'opposto del manubrio, dove è massima a metà.",
 e:"Ti pieghi in avanti quando la banda tira. I gomiti si spostano. Il ritorno è uno scatto.",
 c:"Allarga i piedi sulla banda per aumentare la tensione, restringi per ridurla. Regola così invece di cambiare banda."},
"Hammer curl con banda":{p:"Presa neutra, banda sotto i piedi, gomiti fermi. Ritorno in 3 secondi.",
 f:"Parte esterna del braccio e avambraccio.",
 e:"Il polso ruota. Il ritorno è veloce.",
 c:"Come per il band curl: regola la tensione con la larghezza dei piedi."},
"Dead bug":{p:"Supino, braccia verso il soffitto, ginocchia e anche a 90°. La LOMBARE SCHIACCIATA A TERRA è la posizione di partenza. Abbassa braccio e gamba opposta senza toccare il pavimento. Espira mentre estendi.",
 f:"L'addome profondo che lavora per tenere la schiena a terra. È anti-estensione: il lavoro è nel non muoversi.",
 e:"La lombare si stacca dal pavimento. È l'unico errore che conta: nel momento in cui si stacca, l'esercizio ha smesso di funzionare.",
 c:"Metti una mano sotto la lombare: se senti che si alleggerisce hai perso la posizione. Muovi la gamba di soli 20 cm se serve."}
};
