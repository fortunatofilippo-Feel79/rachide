/* Genera docs/DATI_E_KPI.md dalle definizioni dell'app: KPI, schede del foglio,
   regole del motore, operazioni di patch. Il coach lo legge come riferimento.
   Uso: node tools/genera-doc.js            scrive il file
        node tools/genera-doc.js --controlla  fallisce se il file non e' aggiornato */
const fs = require('node:fs');
const path = require('node:path');
const { carica, RADICE } = require('../tests/carica');

const ctx = carica();
ctx.PLAN = ctx.buildPlan();

/* descrizione di ogni colonna che l'app scrive sul foglio */
const COLONNE = {
  log: {
    id: 'identificativo della riga', w: 'settimana del piano (la 24 inizia lunedì 13/07/2026)', date: 'data gg/mm/aaaa',
    day: 'giorno del piano: A, B, C, D, T1, T2 (trasferta), E1, E2 (settimana di picco)', ex: 'esercizio eseguito (le alternative col loro nome)',
    gruppo: 'gruppo muscolare principale', side: 'S sinistra, D destra, vuoto se bilaterale', band: 'banda usata',
    load: 'carico in kg per manubrio', reps: 'ripetizioni per serie, separate da |', serie: 'numero di serie', tot: 'ripetizioni totali',
    vol: 'volume in kg (carico × ripetizioni)', rir: 'ripetizioni di riserva nell\'ultima serie (0 = cedimento, 4 = 4 o più)',
    rirs: 'ripetizioni di riserva di ogni serie, separate da | (es. 2|1|0)',
    top: 'Sì se il top del range è chiuso', note: 'nota libera', rec: 'secondi medi tra una serie e la successiva', duro: 'lato più duro: S, D, U (uguali)',
    dolz: 'dolore segnato durante l\'esercizio, zona:valore separati da ; (es. spalla_sx:4)'
  },
  sess: {
    id: 'identificativo', w: 'settimana del piano', date: 'data', day: 'giorno del piano', sede: 'Casa o Trasferta',
    mod: 'Pesi, Bande, Corpo libero, Ridotta (45′), Minima (15′), Essenziale (picco), Riposo', min: 'durata in minuti', en: 'energia 1-5',
    warm: 'riscaldamento completo Sì/No', sig: 'Sì se un dolore ha superato 5/10', dol: 'dolore massimo durante la seduta 0-10 (qualsiasi zona)',
    dolz: 'dolore per zona durante la seduta, zona:valore separati da ;', note: 'nota libera'
  },
  mis: { w: 'settimana', date: 'data', peso: 'kg', torace: 'cm, a fine espirazione', bic: 'braccio cm', coscia: 'cm', vita: 'cm', note: 'nota' },
  ben: {
    date: 'data', w: 'settimana', refl: 'reflusso 0-3 (sera)', resp: 'respirazione 4-7 fatta (sera)', camm: 'camminate dopo i pasti 0-2 (sera)',
    hrv: 'HRV notturna da Zepp (mattino)', read: 'readiness Zepp (mattino)', sonno: 'ore di sonno (mattino)', alc: 'alcol la sera prima (mattino)',
    peso: 'peso a digiuno kg (mattino, vuoto in trasferta)', rhr: 'FC a riposo (mattino)', stress: 'stress 0-3 (sera)', mente: 'testa 1-5 (sera)',
    passi: 'passi medi della settimana (domenica)', ipo: 'indice di ipopnea eventi/ora (domenica)', dolm: 'dolore massimo al mattino 0-10 (qualsiasi zona)',
    dolmz: 'dolore al mattino per zona, zona:valore separati da ;',
    cibP: 'proteine del giorno g', cibC: 'carboidrati g', cibG: 'grassi g', cibJ: 'pasti del giorno (JSON: colazione, spuntini, pranzo, cena, fuori pasto)',
    sede: 'dove hai dormito: Casa o Fuori', citta: 'città, se fuori', note: 'nota libera'
  },
  sim: { date: 'data', w: 'settimana', ex: 'esercizio del check', q: 'domanda', a: 'risposta Sì/No/Non verificato', side: 'lato che limita' },
  mob: {
    date: 'data', w: 'settimana', cav_s: 'dorsiflessione caviglia sinistra cm', cav_d: 'caviglia destra cm', tor_s: 'rotazione toracica sinistra °',
    tor_d: 'rotazione toracica destra °', spa_s: 'mani dietro la schiena, braccio alto sinistro cm (meno = meglio)', spa_d: 'braccio alto destro cm',
    cat: 'catena posteriore cm (negativo se non arrivi ai piedi)', note: 'nota'
  },
  piano: {
    id: 'giorno|esercizio', day: 'giorno', ord: 'ordine nella seduta', ex: 'esercizio', gruppo: 'gruppo', serie: 'serie previste',
    lo: 'ripetizioni minime del range', hi: 'ripetizioni massime', load: 'carico suggerito ora (kg)', band: 'banda suggerita',
    uni: 'Sì se un lato alla volta', tempo: 'Sì se misurato in secondi', tetto: 'tetto di carico per la spalla (kg)',
    attesa: 'decisione di non salire', prog: 'stato della progressione (scelta, in coda, tetto, fermo)', note: 'nota tecnica del piano', agg: 'data di aggiornamento'
  },
  stato: {
    w: 'settimana', dal: 'lunedì', al: 'domenica', sedute: 'sedute fatte', bersaglio: 'sedute previste (4, 2 in picco, meno i riposi)',
    riposi: 'riposi programmati', min: 'durata media', en: 'energia media', top: '% serie al top del range', ton: 'kg sollevati con i pesi (esatti)',
    ton_bande_stima: 'kg stimati con le bande (valore nominale × 0,7)', ton_corpo_stima: 'kg stimati a corpo libero (quota del peso; push-up circa 72%)',
    serie_dure: 'serie dure della settimana, somma per gruppo col conteggio frazionario (RIR 4+ vale mezza)', serie_dure_pct: '% di serie chiuse a RIR 0-3 o senza RIR',
    duro: 'lato più duro (conteggio)', rir0: 'composti a cedimento / composti con RIR', peso: 'peso medio', peso_g: 'pendenza g/settimana',
    kcal: 'calorie medie', prot: 'proteine medie g', carb: 'carboidrati medi g', grassi: 'grassi medi g', hrv: 'HRV mediana', rhr: 'FC a riposo mediana',
    sonno: 'sonno medio h', sonno_fuori: 'sonno medio nelle notti fuori', rec_bassi: 'giorni con recupero basso', prog: 'progressione scelta',
    diagnosi: 'titoli della diagnosi automatica', prot_gkg: 'proteine g/kg', vita_altezza: 'rapporto vita/altezza',
    dolore_mattina: 'dolore al mattino, media dei massimi giornalieri 0-10', dolore_seduta_max: 'dolore in seduta, massimo 0-10',
    dolore_zone: 'zone di dolore della settimana con il numero di rilevazioni (es. lombare×3)',
    serie_gruppo: 'serie per gruppo, conteggio frazionario', picco: 'Sì se settimana di picco', kpi_fuori: 'KPI in attenzione o fuori (chiavi App_KPI)',
    bene: 'chiusura: cosa è andato bene', cambia: 'chiusura: una cosa da cambiare', piano_sett: 'giorni decisi per la settimana dopo', agg: 'data'
  },
  kpi: {
    k: 'chiave stabile del KPI', area: 'area', nome: 'nome', unita: 'unità', frequenza: 'quando si aggiorna', come: 'formula',
    bersaglio: 'bersaglio', fonte: 'fonte del bersaglio', link: 'link alla fonte', valore: 'valore attuale', testo: 'valore leggibile',
    stato: 'ok, attenzione, fuori, dati insufficienti', agg: 'data'
  },
  cfg: { k: 'gruppo (e #parte se spezzato)', gruppo: 'patches, impostazioni, chiusure, coach, prodotti', parte: 'numero del pezzo', parti: 'pezzi totali',
    ts: 'orologio della modifica (ms): vince il più recente', v: 'contenuto JSON (o un suo pezzo)' }
};
const SCHEDE = { log: 'App_Log', sess: 'App_Sessioni', mis: 'App_Misure', ben: 'App_Benessere', sim: 'App_Simmetria', mob: 'App_Mobilita',
  piano: 'App_Piano', stato: 'App_Stato', kpi: 'App_KPI', cfg: 'App_Config' };

/* le colonne reali, dal codice: un campione di stato con ogni tipo di riga */
function colonneReali() {
  const S = ctx.S, oggi = ctx.today();
  S.log = [{ id: 'l', w: 40, date: oggi, day: 'A', ex: 'Floor Press manubri', side: '', band: '', load: 20, reps: [10], rir: 2, rirs: [2], top: true, note: '', rec: 120, duro: 'S', dolz: '' }];
  S.sess = [{ id: 's', w: 40, date: oggi, day: 'A', sede: 'Casa', mod: 'Pesi', min: 60, en: 4, warm: true, sig: false, dol: 2, dolz: 'lombare:2', note: '' }];
  S.mis = [{ w: 40, date: oggi, peso: 66, torace: 95, bic: 33, coscia: 54, vita: 80, note: '' }];
  S.ben = [{ date: oggi, w: 40, hrv: 50 }];
  S.sim = [{ date: oggi, w: 40, ex: 'x', q: 'q', a: 'Sì', side: '' }];
  S.mob = [{ date: oggi, w: 40, cav_s: 1 }];
  const p = ctx.SYNC.payloadAll();
  const out = {};
  Object.keys(SCHEDE).forEach(c => {
    if (c === 'kpi') out[c] = Object.keys(ctx.kpiRows()[0]);
    else if (c === 'cfg') out[c] = Object.keys(ctx.cfgRighe(false)[0]);
    else out[c] = Object.keys((p[c] || [])[0] || {});
  });
  return out;
}

function riga(cells) { return '| ' + cells.map(x => String(x).replace(/\|/g, '\\|').replace(/\n/g, ' ')).join(' | ') + ' |'; }

function genera() {
  const L = [];
  L.push('# Dati e KPI di Rachide');
  L.push('');
  L.push('> File generato da `tools/genera-doc.js` a partire dal codice dell\'app (versione ' + ctx.VERSIONE_APP + '). Non modificarlo a mano: cambia le definizioni in `js/01-dati.js` e rigeneralo con `node tools/genera-doc.js`.');
  L.push('');
  L.push('Riferimento per il coach: che cosa misura l\'app, quando, con quale formula e quale bersaglio, da dove viene ogni bersaglio, come sono fatte le schede del foglio e quali regole applica il motore da solo.');
  L.push('');
  L.push('## Quando si registra cosa');
  L.push('');
  L.push(riga(['Momento', 'Cosa', 'Tempo']));
  L.push(riga(['---', '---', '---']));
  [['Al risveglio', 'HRV, FC a riposo, sonno, readiness (da Zepp), peso a digiuno (a casa), dove hai dormito, alcol la sera prima, dolori: zona e intensità 0-10', '1 minuto'],
   ['Durante un esercizio', 'Se qualcosa fa male: pulsante Dolore, zona e intensità (è il «flag» della guida tecnica)', '10 secondi'],
   ['Dopo ogni pasto', 'Il pasto: codice a barre, catalogo, ricetta, «come ieri» o a parole (il coach converte)', '20 secondi'],
   ['Durante la seduta', 'Serie (ripetizioni o secondi), carico o banda, RIR dell\'ultima serie, lato più duro, note', 'in seduta'],
   ['Fine seduta', 'Durata, energia 1-5, dolore per zona (il massimo, già compilato dagli esercizi), note', '30 secondi'],
   ['Prima di dormire', 'Reflusso 0-3, camminate dopo i pasti 0-2, respirazione 4-7, stress 0-3, testa 1-5', '30 secondi'],
   ['Domenica', 'Chiusura della settimana (tre domande, giorni delle sedute), passi medi e ipopnea da Zepp', '2 minuti'],
   ['Ogni 14 giorni', 'Misure: peso, vita, torace, braccio, coscia (mattino, a digiuno)', '3 minuti'],
   ['Ogni 4 settimane', 'Check simmetria (dalla settimana 31); ogni 28 giorni i test di mobilità', '5 minuti']]
    .forEach(r => L.push(riga(r)));
  L.push('');
  L.push('L\'app mostra in Oggi la lista «Da registrare oggi» con questi orari e può aggiungerli al calendario del telefono (Coach → Promemoria).');
  L.push('');
  L.push('## KPI');
  L.push('');
  const aree = [...new Set(ctx.KPI.map(k => k.area))];
  aree.forEach(a => {
    L.push('### ' + a);
    L.push('');
    L.push(riga(['Chiave', 'KPI', 'Come si calcola', 'Bersaglio', 'Frequenza', 'Fonte']));
    L.push(riga(['---', '---', '---', '---', '---', '---']));
    ctx.KPI.filter(k => k.area === a).forEach(k => {
      const fonti = (k.fonti || [k.fonte]).map(f => ctx.FONTI[f]).filter(Boolean).map(f => f.u ? '[' + f.t + '](' + f.u + ')' : f.t).join('; ');
      L.push(riga(['`' + k.id + '`', k.nome, k.come, k.bersaglio, k.freq, fonti]));
    });
    L.push('');
  });
  L.push('Stati: **ok**, **attenzione**, **fuori**, **dati insufficienti**. I KPI settimanali si leggono sull\'ultima settimana conclusa (o su quella in corso, se è già a bersaglio). Valori e stati aggiornati sono nella scheda `App_KPI`; la colonna `kpi_fuori` di `App_Stato` elenca le chiavi in attenzione o fuori.');
  L.push('');
  L.push('## Regole che l\'app applica da sola');
  L.push('');
  [
    ['Doppia progressione', 'Si sale di carico dopo due sedute consecutive al top del range allo stesso carico; sui composti il top vale solo a RIR 1-2. Una progressione alla volta (prima i composti). Gradino 2 kg per manubrio, 1 kg con i dischi da 0,5 kg.'],
    ['Carico suggerito', 'L\'ultimo usato. Dopo una salita si resta sul carico nuovo anche se le ripetizioni calano; si torna al precedente solo se una serie crolla sotto il 75% del minimo del range. I tetti per la spalla valgono sempre.'],
    ['Rientro dopo una pausa', 'Dopo 8-21 giorni senza l\'esercizio: stesso carico, la prima serie fa da prova. Oltre 21 giorni: un gradino sotto per una seduta ([McMaster 2013](' + ctx.FONTI.mcmaster.u + ')).'],
    ['Recupero', 'Livello 2 (carichi fermi, mai un invito a scendere): HRV sotto la fascia normale insieme a FC a riposo sopra la norma (+7%), oppure stress ≥ 2 con sonno < 6,5 h. HRV: fascia dei 60 giorni precedenti sul logaritmo.'],
    ['Serie dure', 'L\'unità di volume è lo sforzo, non l\'attrezzo: una serie chiusa a RIR 0-3 conta 1, a RIR 4 o più conta 0,5, senza RIR conta 1. Vale per pesi, bande e corpo libero ([Schoenfeld 2017](' + ctx.FONTI.carichi.u + '): crescita simile con carichi leggeri se le serie sono vicine al cedimento). La soglia è una scelta del progetto.'],
    ['Carico sollevato', 'Pesi: kg esatti. Bande: valore nominale della banda × 0,7 × ripetizioni (stima). Corpo libero: quota del peso × ripetizioni (stima; solo il push-up ha una misura, circa 69-75% del peso, [Suprak 2011](' + ctx.FONTI.suprak.u + ')). Le tenute e il core non hanno un carico. Per confrontare le settimane si usano le serie dure.'],
    ['Piano flessibile', 'Casa, Bande, Corpo libero: ogni esercizio ha un sostituto con lo stesso schema di movimento; le serie restano quelle del piano e si sommano se due esercizi hanno lo stesso sostituto. Le alternative si registrano col loro nome.'],
    ['Settimana di picco', 'Bersaglio 2 sedute essenziali (E1, E2) a carichi invariati, 2 serie per esercizio: mantenimento ([Spiering 2021](' + ctx.FONTI.spiering.u + ')).'],
    ['Dolore', 'In qualsiasi zona (17, sinistra e destra separate). Fino a 5/10 in seduta è accettabile se al mattino è rientrato; sopra 5, se il mattino dopo non è sceso, o se la stessa zona torna 3 volte in 14 giorni, la diagnosi lo segnala ([Silbernagel 2007](' + ctx.FONTI.silbernagel.u + ')). Zone: ' + ctx.ZONE.map(z => '`' + z[0] + '`').join(', ') + '.'],
    ['Codice a barre', 'Valori per 100 g da [Open Food Facts](https://world.openfoodfacts.org) (licenza ODbL) o dall\'etichetta; il prodotto resta sul telefono e nel foglio (gruppo `prodotti` di App_Config). Le voci del pasto lette col codice hanno il campo `bc`.'],
    ['Peso e calorie', 'Pendenza su regressione delle pesate (esclusi i rientri da trasferta). Ricalibrazione di ±150 kcal solo dopo due letture consecutive fuori corridoio, al massimo ogni 14 giorni, e sempre con conferma.']
  ].forEach(r => { L.push('- **' + r[0] + '.** ' + r[1]); });
  L.push('');
  L.push('## Schede del foglio');
  L.push('');
  const reali = colonneReali();
  Object.keys(SCHEDE).forEach(c => {
    L.push('### `' + SCHEDE[c] + '`');
    L.push('');
    L.push(riga(['Colonna', 'Significato']));
    L.push(riga(['---', '---']));
    reali[c].forEach(k => L.push(riga(['`' + k + '`', COLONNE[c][k] || '(non descritta)'])));
    L.push('');
  });
  L.push('## Operazioni di patch per il coach');
  L.push('');
  L.push('Una patch è un JSON `{"nota":"…","ops":[…]}` che si incolla in Coach (o arriva con la proposta della domenica). L\'app mostra l\'anteprima e segnala le voci che non trovano il loro esercizio. Ogni patch si annulla dallo storico.');
  L.push('');
  L.push(riga(['Operazione', 'Esempio', 'Effetto']));
  L.push(riga(['---', '---', '---']));
  [['set', '{"op":"set","d":"A","n":"Plank","lo":45,"hi":75}', 'cambia serie (s), range (lo, hi), carico di partenza (L), banda (b), nota (tip), attesa (hold)'],
   ['add', '{"op":"add","d":"B","after":"Box Squat","ex":{"n":"Glute bridge","s":2,"lo":12,"hi":15}}', 'aggiunge un esercizio a un giorno'],
   ['del', '{"op":"del","d":"C","n":"Pullover manubrio"}', 'toglie un esercizio da un giorno'],
   ['dischi', '{"op":"dischi","d":"A","v":"20 › 20 › 14"}', 'sequenza dei dischi da preparare'],
   ['nota', '{"op":"nota","d":"A","t":"Aggiungi 2 serie di Box Squat","n":"Box Squat"}', 'promemoria che ricompare a ogni seduta finché non è fatto'],
   ['cibo', '{"op":"cibo","cat":"pia","n":"Poke salmone","d":"ciotola","p":32,"c":70,"g":18}', 'nuovo alimento nel catalogo'],
   ['ricetta', '{"op":"ricetta","n":"Pranzo ufficio","m":"pra","v":[["Pollo",1],["Riso",1]]}', 'nuova ricetta'],
   ['stima', '{"op":"stima","n":"pizza con gli amici","p":20,"c":60,"g":12}', 'converte una voce scritta a parole nei grammi veri'],
   ['kcal', '{"op":"kcal","off":150}', 'sposta il target calorico (tutto sui carboidrati)'],
   ['target', '{"op":"target","peso":[150,250]}', 'sposta il corridoio della pendenza del peso (g/settimana)']]
    .forEach(r => L.push(riga(['`' + r[0] + '`', '`' + r[1] + '`', r[2]])));
  L.push('');
  L.push('Giorni validi: ' + Object.keys(ctx.PLAN).join(', ') + '.');
  L.push('');
  return L.join('\n');
}

const dest = path.join(RADICE, 'docs', 'DATI_E_KPI.md');
const testo = genera();
const mancanti = [];
const reali = colonneReali();
Object.keys(reali).forEach(c => reali[c].forEach(k => { if (!COLONNE[c][k]) mancanti.push(SCHEDE[c] + '.' + k); }));
if (mancanti.length) { console.error('Colonne senza descrizione: ' + mancanti.join(', ')); process.exit(1); }
if (process.argv.includes('--controlla')) {
  const ora = fs.existsSync(dest) ? fs.readFileSync(dest, 'utf8') : '';
  if (ora !== testo) { console.error('docs/DATI_E_KPI.md non è aggiornato: esegui node tools/genera-doc.js'); process.exit(1); }
  console.log('docs/DATI_E_KPI.md aggiornato');
} else {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, testo);
  console.log('scritto ' + path.relative(RADICE, dest));
}
