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
    dolz: 'dolore segnato durante l\'esercizio, zona:valore separati da ; (es. spalla_sx:4)',
    tec: 'esecuzione a fine esercizio, come la giudica chi si allena: 0 pulita, 1 qualche sbavatura, 2 sporca; vuoto se non segnata'
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
    hrv: 'HRV notturna da Zepp (mattino)', read: 'readiness Zepp (mattino)', sonno: 'sonno della notte in ore.minuti: 6.40 = 6 h 40 (mattino)', alc: 'alcol la sera prima (mattino)',
    peso: 'peso a digiuno kg (mattino, vuoto in trasferta)', rhr: 'FC a riposo (mattino)', stress: 'stress 0-3 (sera)', mente: 'testa 1-5 (sera)',
    passi: 'passi medi della settimana (domenica)', ipo: 'indice di ipopnea eventi/ora (domenica)', dolm: 'dolore massimo al mattino 0-10 (qualsiasi zona)',
    dolmz: 'dolore al mattino per zona, zona:valore separati da ;',
    cibP: 'proteine del giorno g', cibC: 'carboidrati g', cibG: 'grassi g', cibA: 'alcol del giorno g (7 kcal al grammo, contate nelle calorie)', cibJ: 'pasti del giorno (JSON: colazione, spuntini, pranzo, cena, fuori pasto; salta = pasti segnati come saltati). Gli spuntini sono facoltativi: conta il totale del giorno',
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
    uni: 'Sì se un lato alla volta', tempo: 'Sì se misurato in secondi', tetto: 'vuoto dalla 4.8: nessun tetto di carico',
    attesa: 'decisione di non salire', prog: 'stato della progressione (scelta, in coda, dischi, attrezzo, fermo)', note: 'nota tecnica del piano', agg: 'data di aggiornamento'
  },
  stato: {
    w: 'settimana', dal: 'lunedì', al: 'domenica', sedute: 'sedute fatte', bersaglio: 'sedute del bersaglio (4, 2 in picco, meno i riposi)', previste: 'sedute previste dal piano della settimana (il bersaglio se non c\'è un piano)', settimana: 'stato della settimana: piena, tenuta, rotta o aperta (vedi Catena delle settimane)',
    riposi: 'riposi programmati', min: 'durata media', en: 'energia media', top: '% serie al top del range', ton: 'kg sollevati con i pesi (esatti)',
    ton_bande_stima: 'kg stimati con le bande (valore nominale × 0,7)', ton_corpo_stima: 'kg stimati a corpo libero (quota del peso; push-up circa 72%)',
    serie_dure: 'serie dure della settimana, somma per gruppo col conteggio frazionario (RIR 4+ vale mezza)', serie_dure_pct: '% di serie chiuse a RIR 0-3 o senza RIR',
    duro: 'lato più duro (conteggio)', rir0: 'composti a cedimento / composti con RIR', peso: 'peso medio', peso_g: 'pendenza g/settimana',
    kcal: 'calorie medie', prot: 'proteine medie g', carb: 'carboidrati medi g', grassi: 'grassi medi g', hrv: 'HRV mediana', rhr: 'FC a riposo mediana',
    sonno: 'sonno medio in ore.minuti', sonno_fuori: 'sonno medio nelle notti fuori, in ore.minuti', rec_bassi: 'giorni con recupero basso', prog: 'progressione scelta',
    diagnosi: 'titoli della diagnosi automatica', prot_gkg: 'proteine g/kg', vita_altezza: 'rapporto vita/altezza',
    dolore_mattina: 'dolore al mattino, media dei massimi giornalieri 0-10', dolore_seduta_max: 'dolore in seduta, massimo 0-10',
    dolore_zone: 'zone di dolore della settimana con il numero di rilevazioni (es. lombare×3)',
    piano_prog: 'piano della settimana: giorno, seduta, luogo e stato (fatta, oggi, futura, saltata)', fuori: 'giorni fuori casa della settimana successiva, con o senza bande (dalla chiusura)', occupati: 'giorni senza tempo della settimana successiva (dalla chiusura)',
    serie_gruppo: 'serie per gruppo, conteggio frazionario', picco: 'Sì se settimana di picco', kpi_fuori: 'KPI in attenzione o fuori (chiavi App_KPI)',
    cibo_stimato: 'giornate della settimana con voci di cibo ancora stimate (fuori dalla media delle calorie)',
    stato_oggi: 'stato di oggi (via libera, avanti con giudizio, giornata da gestire) con i segnali, e le proposte dell\'app degli ultimi 14 giorni con la decisione presa',
    benessere: 'indice di benessere 0-100 della settimana (media di sei aree lette dai KPI)',
    fabbisogno: 'dispendio stimato in kcal (dai dati o dalla formula) e target attuale',
    bene: 'chiusura: cosa è andato bene', cambia: 'chiusura: una cosa da cambiare', piano_sett: 'giorni decisi per la settimana dopo', agg: 'data'
  },
  kpi: {
    k: 'chiave stabile del KPI', area: 'area', nome: 'nome', unita: 'unità', frequenza: 'quando si aggiorna', come: 'formula',
    bersaglio: 'bersaglio', fonte: 'fonte del bersaglio', link: 'link alla fonte', valore: 'valore attuale', testo: 'valore leggibile',
    stato: 'ok, attenzione, fuori, dati insufficienti', agg: 'data'
  },
  cfg: { k: 'gruppo (e #parte se spezzato)', gruppo: 'patches, impostazioni, chiusure, coach, prodotti, settimane (piano e disponibilità)', parte: 'numero del pezzo', parti: 'pezzi totali',
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
   ['Dopo ogni pasto', 'Il pasto: scritto in una riga («pollo 200 g, riso 80, un cucchiaio d\'olio»: l\'app riconosce gli alimenti e mostra cosa ha capito), codice a barre, tabella degli alimenti a grammi, porzioni del coach, ricetta o «come ieri». Quello che non riconosce resta una stima che il coach converte', '20 secondi'],
   ['Durante la seduta', 'Serie (ripetizioni o secondi), carico o banda, RIR di ogni serie, lato più duro, com\'era l\'esecuzione (pulita, qualche sbavatura, sporca), note', 'in seduta'],
   ['Fine seduta', 'Durata, energia 1-5, dolore per zona (il massimo, già compilato dagli esercizi), note', '30 secondi'],
   ['Prima di dormire', 'Reflusso 0-3, camminate dopo i pasti 0-2, respirazione 4-7, stress 0-3, testa 1-5', '30 secondi'],
   ['Domenica', 'Chiusura della settimana (tre domande; per ogni giorno della settimana dopo: casa, fuori con le bande, fuori senza niente o occupato, e 30, 60 o 90 minuti), passi medi e ipopnea da Zepp', '2 minuti'],
   ['Domenica sera', 'Il coach legge il briefing (con la proposta dell\'app per la settimana dopo) e scrive il piano di massima (operazione `settimana`); l\'app lo mostra in Oggi, adatta gli esercizi al tempo di ogni giorno e lo porta nel calendario', 'coach'],
   ['Durante la settimana', 'Adatta la settimana: cambi luogo o tempo di un giorno e l\'app risceglie le sedute che mancano e ne adatta gli esercizi per chiudere tutti i gruppi. Se la settimana rischia di rompersi (meno di 2 sedute) propone 30 minuti a corpo libero', '1 minuto'],
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
    ['Trasferta', 'T1 copre A o B, T2 copre C o D: una seduta fuori casa vale per la seduta di casa dello stesso tipo che manca ancora (prima A e C), e la settimana si ricalibra sulle sedute che restano. Una trasferta gia\' prevista dal piano vale per se\'.'],
    ['Doppia progressione', 'Si sale di carico dopo due sedute consecutive al top del range allo stesso carico; sui composti il top vale solo a RIR 1-2. Una progressione alla volta (prima i composti). Gradino 2 kg per manubrio, 1 kg con i dischi da 0,5 kg.'],
    ['Carico suggerito', 'L\'ultimo usato. Dopo una salita si resta sul carico nuovo anche se le ripetizioni calano; si torna al precedente solo se una serie crolla sotto il 75% del minimo del range. Nessun tetto di carico (decisione del 21/11/2026): quando la salita supera i dischi di casa (impostazione «Dischi di casa», di fabbrica 20 kg per manubrio; Box Squat somma dei due manubri) la progressione scrive «servono dischi» e propone come salire intanto. Oltre la banda rossa si sommano due bande. Sugli esercizi della spalla un consiglio basato sul dolore in seduta.'],
    ['Rientro dopo una pausa', 'Dopo 8-21 giorni senza l\'esercizio: stesso carico, la prima serie fa da prova. Oltre 21 giorni: un gradino sotto per una seduta ([McMaster 2013](' + ctx.FONTI.mcmaster.u + ')).'],
    ['Recupero', 'Livello 2: HRV sotto la fascia normale insieme a FC a riposo sopra la norma (+7%), oppure stress ≥ 2 con sonno < 6,5 h. HRV: fascia dei 60 giorni precedenti sul logaritmo. Al livello 2 l\'app propone di tenere i carichi fermi per oggi: vale solo se autorizzata.'],
    ['Stato di oggi', 'In Oggi l\'app legge insieme recupero, sonno delle ultime 3 notti (giallo sotto ' + ctx.SONNO_BASSO + ' h, rosso sotto 6), stress e testa su 3 giorni, dolore (una zona da ' + ctx.STO_DOLORE + '/10 al mattino, sopra 5 nell\'ultima seduta se non rientrata, o 3 volte in 14 giorni), carico (serie dure dei 7 giorni oltre il ' + Math.round(ctx.STO_CARICO * 100) + '% della media delle 4 settimane prima), giorni di fila, cibo di ieri (sotto l\'' + Math.round(ctx.STO_KCAL * 100) + '% del target) e reflusso della sera prima. Un rosso o tre gialli: giornata da gestire; un giallo: avanti con giudizio. Guidare l\'allenamento con l\'HRV rende più o meno come un piano fisso ([Düking 2021](https://pubmed.ncbi.nlm.nih.gov/34489178/); [Manresa-Rocamora 2021](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8507742/)): per questo sono proposte, non blocchi. Le soglie sono scelte del progetto.'],
    ['Proposte da autorizzare', 'L\'app non cambia niente da sola (decisione del 14/11/2026). Dallo stato di oggi nascono proposte sulla seduta, ognuna con il perché e l\'effetto: **fermi** (tieni i carichi dell\'ultima volta), **accorcia** (una serie in meno su tutto tranne il primo esercizio, mai sotto 2), **zona** (per una zona dolente, sostituisce gli esercizi che la caricano con l\'alternativa che non la carica; gli altri restano con un avviso), **scendi** (torna al carico precedente). Autorizzata o rifiutata, la decisione resta nel gruppo `proposte` di App_Config e nella colonna `stato_oggi` di App_Stato; si può cambiare idea finché la seduta non è aperta.'],
    ['Scendere di carico', 'Proposto solo dopo una salita recente (ultime ' + ctx.STO_SCENDI_SEDUTE + ' sedute dell\'esercizio) e solo se l\'esecuzione non tiene: esecuzione segnata sporca (2 punti) o con sbavature in due sedute (2), sotto il minimo del range in due sedute (2) o in una (1), dolore da 4/10 sull\'esercizio (2), cedimento su un composto (1), un lato che cede molto prima (1), salita fatta senza due sedute al top (1). Da 2 punti l\'app propone due sedute al carico precedente con esecuzione pulita fino al top, poi si risale. Fondamento: a parità di sforzo la crescita non dipende dal carico ([Lopez 2021](https://pubmed.ncbi.nlm.nih.gov/33433148/)), mentre la forza massima sì; la tecnica che conta è movimento controllato e ampiezza piena ([Androulakis-Korakakis 2024](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10801605/)). Un rifiuto la silenzia per 14 giorni.'],
    ['Serie dure', 'L\'unità di volume è lo sforzo, non l\'attrezzo: una serie chiusa a RIR 0-3 conta 1, a RIR 4 o più conta 0,5, senza RIR conta 1. Vale per pesi, bande e corpo libero ([Schoenfeld 2017](' + ctx.FONTI.carichi.u + '): crescita simile con carichi leggeri se le serie sono vicine al cedimento). La soglia è una scelta del progetto.'],
    ['Carico sollevato', 'Pesi: kg esatti. Bande: valore nominale della banda × 0,7 × ripetizioni (stima). Corpo libero: quota del peso × ripetizioni (stima; solo il push-up ha una misura, circa 69-75% del peso, [Suprak 2011](' + ctx.FONTI.suprak.u + ')). Le tenute e il core non hanno un carico. Per confrontare le settimane si usano le serie dure.'],
    ['Piano flessibile', 'Casa (pesi, bande e corpo libero), Bande, Corpo libero: fuori casa niente pesi; ogni esercizio ha un sostituto con lo stesso schema di movimento, e senza bande anche le sedute T1 e T2 passano al corpo libero; le serie restano quelle del piano e si sommano se due esercizi hanno lo stesso sostituto. Le alternative si registrano col loro nome.'],
    ['Piano della settimana', 'Il coach scrive la domenica un piano di massima (giorno, seduta, luogo, ora, minuti). L\'app lo segue in Oggi e lo porta nel calendario (.ics, allarme 30 minuti prima). Per ogni giorno l\'utente indica dove è (`casa` = pesi, bande o niente; `fuori` = con le bande; `fuori0` = senza attrezzi; `no` = occupato) e quanto tempo ha (30, 60 o 90 minuti, riscaldamento compreso). Avvisa se passano 10 giorni senza pesi e non ne è previsto nessuno.'],
    ['Catena delle settimane', 'Conta quello che ottieni, non quante volte ti alleni: a parità di volume la frequenza cambia poco ([Iversen 2021](' + ctx.FONTI.iversen.u + ')). **Piena**: tutte le sedute del bersaglio (4, 2 in picco, meno i riposi) oppure tutti e 7 i gruppi al minimo di serie dure, con qualsiasi numero di sedute. **Tenuta**: almeno ' + ctx.SEDUTE_MIN + ' sedute e tutte quelle del piano adattato ai giorni disponibili (nessuna saltata, nessuna da fare), ma qualche gruppo sotto: con l\'intensità mantenuta poche sedute conservano forza e massa per qualche settimana ([Spiering 2021](' + ctx.FONTI.spiering.u + ')). **Rotta**: settimana finita con meno di ' + ctx.SEDUTE_MIN + ' sedute, senza un piano, o con una seduta del piano saltata e la settimana non ricalcolata. **Aperta**: la settimana in corso finché non è piena o tenuta. Piene e tenute fanno la catena; dopo ' + ctx.TENUTE_MAX + ' tenute di fila l\'app avvisa (soglia del progetto: il mantenimento a lungo diventa regressione). Se la settimana rischia di rompersi l\'app propone 30 minuti a corpo libero: la seduta che recupera di più, adattata a 30′, che entra nel piano. L\'aderenza confronta le sedute fatte con quelle del piano (massimo 100%).'],
    ['Generatore delle sedute', 'In *Adatta la settimana* (e per la proposta della domenica) l\'app prova tutte le combinazioni di sedute che mancano e giorni liberi e tiene quella con il punteggio migliore: 3 punti per ogni serie che manca al minimo di un gruppo, 1 per ogni serie oltre il massimo, penalità per sedute in giorni attaccati (di più se lavorano gli stessi gruppi, soprattutto le gambe) e per ogni seduta spostata rispetto al piano che c\'è già. Poi adatta gli esercizi: (1) toglie le serie oltre il massimo settimanale; (2) se la seduta non sta nel tempo toglie le serie che valgono meno per minuto risparmiato (prima i gruppi già pieni; mai sotto 2 serie; il primo esercizio resta: nei giorni corti contano i multiarticolari, [Iversen 2021](' + ctx.FONTI.iversen.u + ')); (3) se un gruppo resta sotto il minimo aggiunge una serie a un suo esercizio (al massimo +2 sul piano, 5 in tutto) o un esercizio nuovo da 2 serie, scelto fra quelli del piano o delle alternative per quell\'attrezzo; (4) se il tempo è finito scambia una serie di un gruppo già nel range con una del gruppo che manca. Al massimo 10 serie per gruppo nella stessa seduta: oltre circa 11 il guadagno non cresce ([Remmert et al. 2025, preprint](' + ctx.FONTI.remmert.u + ')). Tempo stimato: 40 s di lavoro per serie (doppio se unilaterale), recupero del tipo di esercizio (' + Object.keys(ctx.REST).map(k => k + ' ' + ctx.REST[k] + ' s').join(', ') + '), 30 s di cambio, 5 minuti di riscaldamento; tolleranza 5%. Le modifiche si salvano nel piano (`agg`, `ser`, `via`) e la seduta guidata le usa; se in un giorno cambi attrezzo la seduta si riadatta. La progressione di un esercizio con meno serie del solito si giudica sulle serie del piano.'],
    ['Settimana di picco', 'Bersaglio 2 sedute essenziali (E1, E2) a carichi invariati, 2 serie per esercizio: mantenimento ([Spiering 2021](' + ctx.FONTI.spiering.u + ')).'],
    ['Dolore', 'In qualsiasi zona (17, sinistra e destra separate). Regola 15 del Libro (21/11/2026): da ' + ctx.DOL_CAMBIA + '/10 in seduta, o se sale fra le serie, si cambia esercizio su quella zona e si annota; sopra 5 si ferma la serie; se il mattino dopo non è sceso, o se la stessa zona torna 3 volte in 14 giorni, la diagnosi lo segnala e propone il fisioterapista. Più prudente del pain-monitoring model ([Silbernagel 2007](' + ctx.FONTI.silbernagel.u + ')), che accetta fino a 5 ma nasce per la riabilitazione dei tendini. Zone: ' + ctx.ZONE.map(z => '`' + z[0] + '`').join(', ') + '.'],
    ['Codice a barre', 'Valori per 100 g da [Open Food Facts](https://world.openfoodfacts.org) (licenza ODbL) o dall\'etichetta; il prodotto resta sul telefono e nel foglio (gruppo `prodotti` di App_Config). Le voci del pasto lette col codice hanno il campo `bc`.'],
    ['Cibo a parole', 'Una riga di testo viene divisa in voci; per ognuna l\'app cerca fra lo storico dell\'utente, i prodotti letti col codice, le porzioni del coach e una tabella di ' + ctx.alimLista().length + ' alimenti comuni con i valori per 100 g (medie indicative dalle tabelle di composizione CREA e USDA FoodData Central). Con una quantità scritta (grammi, pezzi, cucchiai) usa la tabella a grammi; senza quantità vale una porzione. Le voci pesate hanno il campo `gr`. Quello che non riconosce resta una stima provvisoria (`w`:1) che il coach converte con `stima`: le giornate con una stima restano fuori dalla media delle calorie, dal KPI e dal fabbisogno. L\'alcol si conta a parte (campo `a`, 7 kcal al grammo). L\'utente sceglie se leggere in calorie e grammi (predefinito) o in blocchi.'],
    ['Fabbisogno', 'Due stime affiancate. **Formula**: Mifflin-St Jeor per un fattore di attività (1,4 seduto, 1,55 misto, 1,75 fisico; +0,025 per seduta a settimana; ±0,05 per i passi); sul singolo può sbagliare oltre il 10% ([Frankenfield 2005](https://pure.psu.edu/en/publications/comparison-of-predictive-equations-for-resting-metabolic-rate-in-/)). **Dati**: calorie medie delle giornate registrate per intero negli ultimi ' + ctx.FAB_FINESTRA + ' giorni (i tre pasti principali fatti o saltati, nessuna stima) meno la pendenza del peso × 7,7 kcal al grammo; servono ' + ctx.FAB_MIN_GIORNI + ' giornate e una pendenza valida ([Hall 2011](https://pubmed.ncbi.nlm.nih.gov/21872751/) per il contenuto energetico dei tessuti). Target proposto = dispendio dai dati + surplus per il centro del corridoio di crescita; la proposta nasce se dista almeno ' + ctx.FAB_SOGLIA + ' kcal dal target, sposta al massimo ' + ctx.FAB_MAX + ' kcal per volta, non più di una volta ogni 14 giorni, e vale solo se autorizzata. Proteine: proposta di salire se sotto ' + String(ctx.FAB_PROT_KG).replace('.', ',') + ' g/kg. Grassi fermi a ' + ctx.FAB_GRASSI + ' g (scelta del piano per il reflusso); i carboidrati assorbono. Il coach resta libero di fissare il target con `kcal`.'],
    ['Benessere', 'Indice 0-100 in Corpo: media di sei aree (' + ctx.BENE_DOM.map(d => d.n.toLowerCase() + ': ' + d.kpi.join(', ') + (d.extra ? ', ' + d.extra : '')).join('; ') + '). Ogni KPI vale 100 se ok, 55 se in attenzione, 15 se fuori; senza dato non conta; servono almeno tre aree. Pesi uguali: scelta del progetto, non una misura clinica. Sotto l\'indice: al massimo tre suggerimenti dalle aree più deboli e le letture incrociate dei dati degli ultimi ' + ctx.BENE_GIORNI + ' giorni (sonno e HRV, alcol, stress, reflusso, cibo ed energia in seduta), mostrate solo con almeno ' + ctx.BENE_MIN_N + ' giornate per parte: sono associazioni, non prove di causa.'],
    ['Scheda tecnica', 'Ogni esercizio ha una scheda in quattro parti: come ti metti (parte del corpo per parte del corpo), come ti muovi (fasi, durata, respiro), cosa devi sentire (muscoli sul corpo e zone dove non deve dare fastidio), come ti accorgi che sbagli e cosa fare. In seduta compare il promemoria breve; la figura è in fondo alla scheda. Le note del coach (`p`, `f`, `e`, `c` di `esercizio`) restano in ogni scheda.'],
    ['Peso e calorie', 'Pendenza su regressione delle pesate (esclusi i rientri da trasferta). Finché non ci sono abbastanza giornate di cibo complete per il fabbisogno dai dati: ricalibrazione di ±150 kcal solo dopo due letture consecutive fuori corridoio, al massimo ogni 14 giorni, e sempre con conferma.']
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
   ['add', '{"op":"add","d":"B","after":"Box Squat","ex":{"n":"Glute bridge","s":2,"lo":12,"hi":15}}', 'aggiunge un esercizio a un giorno. Se l\'esercizio è nuovo, prima definiscilo con `esercizio`'],
   ['esercizio', '{"op":"esercizio","n":"Push-up con pausa in basso","come":"Push-up","g":"Petto","t":"compl","p":"Come il push-up, fermo 2 secondi a 3 cm da terra","f":"Petto e tricipiti","e":"Il bacino cede nella pausa","c":"Stringi i glutei prima di scendere"}', 'definisce un esercizio nuovo o una variante: `come` = esercizio che ha già la figura giusta da mostrare (stesso movimento); `g` gruppo (' + [...new Set(Object.values(ctx.EX).map(e => e.g))].filter(g => g && g !== '—').join(', ') + '); `t` tipo (comp, compl, iso, core; facoltativi `uni`, `band`, `sec`); `p` posizione e movimento, `f` devi sentire, `e` stai sbagliando se, `c` correzione (quelli che mancano si prendono da `come`). Se nessuna figura va bene, ometti `come`: l\'app mostra il testo e l\'esercizio compare nel briefing tra quelli senza figura propria. Con lo stesso nome di un esercizio esistente ne aggiorna la scheda; la figura propria resta'],
   ['del', '{"op":"del","d":"C","n":"Pullover manubrio"}', 'toglie un esercizio da un giorno'],
   ['dischi', '{"op":"dischi","d":"A","v":"20 › 20 › 14"}', 'sequenza dei dischi da preparare'],
   ['nota', '{"op":"nota","d":"A","t":"Aggiungi 2 serie di Box Squat","n":"Box Squat"}', 'promemoria che ricompare a ogni seduta finché non è fatto'],
   ['cibo', '{"op":"cibo","cat":"pia","n":"Poke salmone","d":"ciotola","p":32,"c":70,"g":18}', 'nuovo alimento nel catalogo'],
   ['ricetta', '{"op":"ricetta","n":"Pranzo ufficio","m":"pra","v":[["Pollo",1],["Riso",1]]}', 'nuova ricetta'],
   ['stima', '{"op":"stima","n":"pizza con gli amici","p":20,"c":60,"g":12}', 'converte una voce scritta a parole nei grammi veri'],
   ['kcal', '{"op":"kcal","off":150}', 'sposta il target calorico (tutto sui carboidrati)'],
   ['target', '{"op":"target","peso":[150,250]}', 'sposta il corridoio della pendenza del peso (g/settimana)'],
   ['settimana', '{"op":"settimana","w":41,"nota":"Martedì in trasferta","giorni":{"lun":"casa 60","mar":"fuori 30","mer":"no","gio":"fuori0 60"},"sedute":[{"g":"lun","d":"A","l":"casa","ora":"07:30","t":60},{"g":"mar","d":"B","l":"bande","ora":"18:30","t":30}]}', 'piano di massima della settimana w: g = lun..dom (oppure data gg/mm/aaaa), d = giorno del piano (A B C D, E1 E2 in picco), l = casa (pesi), bande o corpo, ora e t (30, 60, 90 minuti) facoltativi. giorni (facoltativo): luogo e minuti di ogni giorno (casa, fuori = con le bande, fuori0 = senza niente, no). Le sedute restano dove le mette il coach; l\'app ne adatta gli esercizi al tempo e al bilancio dei gruppi']]
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
