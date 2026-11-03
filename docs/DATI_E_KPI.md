# Dati e KPI di Rachide

> File generato da `tools/genera-doc.js` a partire dal codice dell'app (versione 4.3.0). Non modificarlo a mano: cambia le definizioni in `js/01-dati.js` e rigeneralo con `node tools/genera-doc.js`.

Riferimento per il coach: che cosa misura l'app, quando, con quale formula e quale bersaglio, da dove viene ogni bersaglio, come sono fatte le schede del foglio e quali regole applica il motore da solo.

## Quando si registra cosa

| Momento | Cosa | Tempo |
| --- | --- | --- |
| Al risveglio | HRV, FC a riposo, sonno, readiness (da Zepp), peso a digiuno (a casa), dove hai dormito, alcol la sera prima, dolori: zona e intensità 0-10 | 1 minuto |
| Durante un esercizio | Se qualcosa fa male: pulsante Dolore, zona e intensità (è il «flag» della guida tecnica) | 10 secondi |
| Dopo ogni pasto | Il pasto: codice a barre, catalogo, ricetta, «come ieri» o a parole (il coach converte) | 20 secondi |
| Durante la seduta | Serie (ripetizioni o secondi), carico o banda, RIR dell'ultima serie, lato più duro, note | in seduta |
| Fine seduta | Durata, energia 1-5, dolore per zona (il massimo, già compilato dagli esercizi), note | 30 secondi |
| Prima di dormire | Reflusso 0-3, camminate dopo i pasti 0-2, respirazione 4-7, stress 0-3, testa 1-5 | 30 secondi |
| Domenica | Chiusura della settimana (tre domande; per ogni giorno della settimana dopo: casa, fuori con le bande, fuori senza niente o occupato, e 30, 60 o 90 minuti), passi medi e ipopnea da Zepp | 2 minuti |
| Domenica sera | Il coach legge il briefing (con la proposta dell'app per la settimana dopo) e scrive il piano di massima (operazione `settimana`); l'app lo mostra in Oggi, adatta gli esercizi al tempo di ogni giorno e lo porta nel calendario | coach |
| Durante la settimana | Adatta la settimana: cambi luogo o tempo di un giorno e l'app risceglie le sedute che mancano e ne adatta gli esercizi per chiudere tutti i gruppi. Se la settimana rischia di rompersi (meno di 2 sedute) propone 30 minuti a corpo libero | 1 minuto |
| Ogni 14 giorni | Misure: peso, vita, torace, braccio, coscia (mattino, a digiuno) | 3 minuti |
| Ogni 4 settimane | Check simmetria (dalla settimana 31); ogni 28 giorni i test di mobilità | 5 minuti |

L'app mostra in Oggi la lista «Da registrare oggi» con questi orari e può aggiungerli al calendario del telefono (Coach → Promemoria).

## KPI

### Allenamento

| Chiave | KPI | Come si calcola | Bersaglio | Frequenza | Fonte |
| --- | --- | --- | --- | --- | --- |
| `aderenza` | Aderenza | Sedute fatte / sedute previste: quelle del piano della settimana adattato ai tuoi giorni, se c'è; altrimenti il bersaglio (4, oppure 2 in settimana di picco, meno i riposi programmati). Massimo 100% | 100% | settimanale | Regola del piano (Piano Unico v5, decisioni del coach) |
| `serie_gruppo` | Serie per gruppo nel range | Serie settimanali per gruppo: dirette = 1, indirette = 0,5 (es. la panca per i tricipiti). Range 10-20, core 6-12 | 7 gruppi su 7 nel range | settimanale | [Schoenfeld, Ogborn, Krieger 2017 · J Sports Sci](https://core.ac.uk/download/200371264.pdf); [Baz-Valle et al. 2022 · J Hum Kinet 81:199](https://pmc.ncbi.nlm.nih.gov/articles/PMC8884877/); [Pelland et al. 2024 · meta-regressioni volume e frequenza](https://bibbase.org/network/publication/joshuapelland-jacobremmert-zacrobinson-sethhinson-michaelzourdos-theresistancetrainingdoseresponsemetaregressionsexploringtheeectsofweeklyvolumeandfrequencyonmusclehypertrophyandstrengthgain-2024) |
| `serie_dure` | Serie dure sul totale | Serie chiuse a RIR 0-3 (o senza RIR) / serie totali. Una serie chiusa a RIR 4 o più è comoda e conta mezza. Vale per pesi, bande e corpo libero: con carichi leggeri la crescita è simile solo se le serie sono vicine al cedimento | ≥ 85% | settimanale | [Schoenfeld et al. 2017 · carichi leggeri e pesanti, J Strength Cond Res](https://pubmed.ncbi.nlm.nih.gov/28834797/) |
| `top_range` | Serie al top del range | Righe di esercizio chiuse al massimo del range di ripetizioni / righe totali (esclusi gli esercizi a tempo) | ≥ 70% | settimanale | Regola del piano (Piano Unico v5, decisioni del coach) |
| `cedimenti` | Composti a cedimento | Esercizi multiarticolari chiusi a RIR 0. Sui composti si chiude a RIR 1-2 | 0 | ultime 2 settimane | Regola del piano (Piano Unico v5, decisioni del coach) |
| `record` | Record nelle ultime 4 settimane | Nuovi record di carico o di ripetizioni allo stesso carico | ≥ 2 | mobile 28 giorni | Regola del piano (Piano Unico v5, decisioni del coach) |
| `durata` | Durata media della seduta | Minuti medi per seduta. Oltre i 90 secondi di recupero non si guadagna ipertrofia: il tempo morto si taglia | ≤ 70 min | settimanale | [Singer et al. 2024 · Front Sports Act Living](https://www.frontiersin.org/journals/sports-and-active-living/articles/10.3389/fspor.2024.1429789/text) |
| `asimmetria` | Asimmetria sinistra/destra | \|ripetizioni sx − dx\| / media, solo esercizi a un lato con entrambi i lati nella stessa seduta | ≤ 10% | settimanale | Regola del piano (Piano Unico v5, decisioni del coach) |

### Corpo e cibo

| Chiave | KPI | Come si calcola | Bersaglio | Frequenza | Fonte |
| --- | --- | --- | --- | --- | --- |
| `pendenza` | Pendenza del peso | Retta sulle pesate del mattino, esclusi i rientri da trasferta. Riferimento in letteratura: 0,25-0,5% del peso a settimana per chi si allena da poco | corridoio del piano | mobile 14-28 giorni | [Iraki et al. 2019 · Sports 7:154](https://pmc.ncbi.nlm.nih.gov/articles/PMC6680710/) |
| `proteine` | Proteine per kg | Proteine medie giornaliere registrate / ultimo peso | ≥ 1,6 g/kg | media 7 giorni | [Morton et al. 2018 · Br J Sports Med 52:376](https://bjsm.bmj.com/content/52/6/376) |
| `kcal` | Calorie rispetto al target | Calorie medie (4·P + 4·C + 9·G) / target del piano alimentare. Vale con almeno 4 giornate registrate | entro ±10% | media 7 giorni | Regola del piano (Piano Unico v5, decisioni del coach) |
| `giorni_cibo` | Giornate di cibo registrate | Giorni con almeno un pasto registrato | ≥ 5 su 7 | ultimi 7 giorni | Regola del piano (Piano Unico v5, decisioni del coach) |
| `vita_altezza` | Rapporto vita/altezza | Circonferenza vita / altezza | < 0,5 | ogni 14 giorni | [NICE · rapporto vita/altezza sotto 0,5](https://www.nice.org.uk/news/articles/keep-the-size-of-your-waist-to-less-than-half-of-your-height-nice--recommends) |

### Recupero e salute

| Chiave | KPI | Come si calcola | Bersaglio | Frequenza | Fonte |
| --- | --- | --- | --- | --- | --- |
| `hrv7` | HRV, media 7 giorni | Media a 7 giorni del logaritmo dell'HRV notturna, confrontata con la tua fascia normale degli ultimi 60 giorni (media ± mezza deviazione standard) | dentro o sopra la fascia | giornaliero | [Plews · HRV, media mobile a 7 giorni (tesi AUT)](https://openrepository.aut.ac.nz/handle/10292/7122) |
| `fc7` | FC a riposo, media 7 giorni | Media a 7 giorni rispetto alla mediana degli ultimi 60 giorni | entro +5% della norma | giornaliero | Regola del piano (Piano Unico v5, decisioni del coach) |
| `sonno7` | Sonno, media 7 giorni | Ore di sonno medie. Sotto 6,5 il giorno conta come recupero basso (decisione del 18/10) | ≥ 7 h | giornaliero | [AASM e SRS 2015 · almeno 7 ore negli adulti](https://www.aasm.org/resources/pdf/adultsleepdurationconsensus.pdf) |
| `stress7` | Stress, media 7 giorni | Stress percepito 0-3. Da 2 il giorno conta come stress alto | < 1,5 | giornaliero | Regola del piano (Piano Unico v5, decisioni del coach) |
| `reflusso7` | Reflusso, media 7 giorni | Reflusso 0-3 registrato la sera. Si incrocia con i grassi del giorno | ≤ 0,5 | giornaliero | Regola del piano (Piano Unico v5, decisioni del coach) |
| `dolore` | Dolore (qualsiasi zona) | Dolore 0-10 per zona: il massimo al mattino (media dei 7 giorni) e il massimo durante le sedute (14 giorni). Fino a 5 in seduta è accettabile se al mattino dopo è rientrato e non sale di settimana in settimana | mattina ≤ 2, seduta ≤ 5 | giornaliero e per seduta | [Silbernagel et al. 2007 · pain-monitoring model](https://search.pedro.org.au/search-results/record-detail/18389) |
| `passi` | Passi al giorno | Media giornaliera della settimana letta da Zepp | 8.000-10.000 | settimanale (domenica) | [Paluch et al. 2022 · Lancet Public Health 7:e219](https://doi.org/10.1016/S2468-2667(21)00302-9) |
| `ipopnea` | Indice di ipopnea | Eventi per ora stimati dal wearable: non è una diagnosi, è un andamento da mostrare al medico | < 5 | settimanale (domenica) | Regola del piano (Piano Unico v5, decisioni del coach) |
| `mobilita` | Differenza fra i lati, mobilità | Massima differenza sinistra − destra nei test bilaterali | < 2 | ogni 28 giorni | Regola del piano (Piano Unico v5, decisioni del coach) |

### Abitudini

| Chiave | KPI | Come si calcola | Bersaglio | Frequenza | Fonte |
| --- | --- | --- | --- | --- | --- |
| `completezza` | Mattine registrate | Giorni con il benessere del mattino compilato (peso, HRV, FC o sonno) | ≥ 5 su 7 | ultimi 7 giorni | Regola del piano (Piano Unico v5, decisioni del coach) |
| `camminate` | Camminate dopo i pasti | Camminate brevi dopo pranzo e cena (0-2). Abbassano la glicemia dopo il pasto | ≥ 1,5 | media 7 giorni | [Buffey et al. 2022 · Sports Med 52:1765](https://link.springer.com/content/pdf/10.1007/s40279-022-01649-4.pdf) |

Stati: **ok**, **attenzione**, **fuori**, **dati insufficienti**. I KPI settimanali si leggono sull'ultima settimana conclusa (o su quella in corso, se è già a bersaglio). Valori e stati aggiornati sono nella scheda `App_KPI`; la colonna `kpi_fuori` di `App_Stato` elenca le chiavi in attenzione o fuori.

## Regole che l'app applica da sola

- **Doppia progressione.** Si sale di carico dopo due sedute consecutive al top del range allo stesso carico; sui composti il top vale solo a RIR 1-2. Una progressione alla volta (prima i composti). Gradino 2 kg per manubrio, 1 kg con i dischi da 0,5 kg.
- **Carico suggerito.** L'ultimo usato. Dopo una salita si resta sul carico nuovo anche se le ripetizioni calano; si torna al precedente solo se una serie crolla sotto il 75% del minimo del range. I tetti per la spalla valgono sempre.
- **Rientro dopo una pausa.** Dopo 8-21 giorni senza l'esercizio: stesso carico, la prima serie fa da prova. Oltre 21 giorni: un gradino sotto per una seduta ([McMaster 2013](https://pubmed.ncbi.nlm.nih.gov/23529287/)).
- **Recupero.** Livello 2 (carichi fermi, mai un invito a scendere): HRV sotto la fascia normale insieme a FC a riposo sopra la norma (+7%), oppure stress ≥ 2 con sonno < 6,5 h. HRV: fascia dei 60 giorni precedenti sul logaritmo.
- **Serie dure.** L'unità di volume è lo sforzo, non l'attrezzo: una serie chiusa a RIR 0-3 conta 1, a RIR 4 o più conta 0,5, senza RIR conta 1. Vale per pesi, bande e corpo libero ([Schoenfeld 2017](https://pubmed.ncbi.nlm.nih.gov/28834797/): crescita simile con carichi leggeri se le serie sono vicine al cedimento). La soglia è una scelta del progetto.
- **Carico sollevato.** Pesi: kg esatti. Bande: valore nominale della banda × 0,7 × ripetizioni (stima). Corpo libero: quota del peso × ripetizioni (stima; solo il push-up ha una misura, circa 69-75% del peso, [Suprak 2011](https://pubmed.ncbi.nlm.nih.gov/20179649)). Le tenute e il core non hanno un carico. Per confrontare le settimane si usano le serie dure.
- **Piano flessibile.** Casa, Bande, Corpo libero: ogni esercizio ha un sostituto con lo stesso schema di movimento; le serie restano quelle del piano e si sommano se due esercizi hanno lo stesso sostituto. Le alternative si registrano col loro nome.
- **Piano della settimana.** Il coach scrive la domenica un piano di massima (giorno, seduta, luogo, ora, minuti). L'app lo segue in Oggi e lo porta nel calendario (.ics, allarme 30 minuti prima). Per ogni giorno l'utente indica dove è (`casa` = pesi, bande o niente; `fuori` = con le bande; `fuori0` = senza attrezzi; `no` = occupato) e quanto tempo ha (30, 60 o 90 minuti, riscaldamento compreso). Avvisa se passano 10 giorni senza pesi e non ne è previsto nessuno.
- **Catena delle settimane.** Conta quello che ottieni, non quante volte ti alleni: a parità di volume la frequenza cambia poco ([Iversen 2021](https://pubmed.ncbi.nlm.nih.gov/34125411/)). **Piena**: tutte le sedute del bersaglio (4, 2 in picco, meno i riposi) oppure tutti e 7 i gruppi al minimo di serie dure, con qualsiasi numero di sedute. **Tenuta**: almeno 2 sedute e tutte quelle del piano adattato ai giorni disponibili (nessuna saltata, nessuna da fare), ma qualche gruppo sotto: con l'intensità mantenuta poche sedute conservano forza e massa per qualche settimana ([Spiering 2021](https://pubmed.ncbi.nlm.nih.gov/33629972/)). **Rotta**: settimana finita con meno di 2 sedute, senza un piano, o con una seduta del piano saltata e la settimana non ricalcolata. **Aperta**: la settimana in corso finché non è piena o tenuta. Piene e tenute fanno la catena; dopo 3 tenute di fila l'app avvisa (soglia del progetto: il mantenimento a lungo diventa regressione). Se la settimana rischia di rompersi l'app propone 30 minuti a corpo libero: la seduta che recupera di più, adattata a 30′, che entra nel piano. L'aderenza confronta le sedute fatte con quelle del piano (massimo 100%).
- **Generatore delle sedute.** In *Adatta la settimana* (e per la proposta della domenica) l'app prova tutte le combinazioni di sedute che mancano e giorni liberi e tiene quella con il punteggio migliore: 3 punti per ogni serie che manca al minimo di un gruppo, 1 per ogni serie oltre il massimo, penalità per sedute in giorni attaccati (di più se lavorano gli stessi gruppi, soprattutto le gambe) e per ogni seduta spostata rispetto al piano che c'è già. Poi adatta gli esercizi: (1) toglie le serie oltre il massimo settimanale; (2) se la seduta non sta nel tempo toglie le serie che valgono meno per minuto risparmiato (prima i gruppi già pieni; mai sotto 2 serie; il primo esercizio resta: nei giorni corti contano i multiarticolari, [Iversen 2021](https://pubmed.ncbi.nlm.nih.gov/34125411/)); (3) se un gruppo resta sotto il minimo aggiunge una serie a un suo esercizio (al massimo +2 sul piano, 5 in tutto) o un esercizio nuovo da 2 serie, scelto fra quelli del piano o delle alternative per quell'attrezzo; (4) se il tempo è finito scambia una serie di un gruppo già nel range con una del gruppo che manca. Al massimo 10 serie per gruppo nella stessa seduta: oltre circa 11 il guadagno non cresce ([Remmert et al. 2025, preprint](https://sportrxiv.org/index.php/server/preprint/view/537)). Tempo stimato: 40 s di lavoro per serie (doppio se unilaterale), recupero del tipo di esercizio (comp 150 s, compl 90 s, iso 75 s, core 45 s), 30 s di cambio, 5 minuti di riscaldamento; tolleranza 5%. Le modifiche si salvano nel piano (`agg`, `ser`, `via`) e la seduta guidata le usa; se in un giorno cambi attrezzo la seduta si riadatta. La progressione di un esercizio con meno serie del solito si giudica sulle serie del piano.
- **Settimana di picco.** Bersaglio 2 sedute essenziali (E1, E2) a carichi invariati, 2 serie per esercizio: mantenimento ([Spiering 2021](https://pubmed.ncbi.nlm.nih.gov/33629972/)).
- **Dolore.** In qualsiasi zona (17, sinistra e destra separate). Fino a 5/10 in seduta è accettabile se al mattino è rientrato; sopra 5, se il mattino dopo non è sceso, o se la stessa zona torna 3 volte in 14 giorni, la diagnosi lo segnala ([Silbernagel 2007](https://search.pedro.org.au/search-results/record-detail/18389)). Zone: `collo`, `dorsale`, `costole`, `lombare`, `spalla_sx`, `spalla_dx`, `gomito_sx`, `gomito_dx`, `polso_sx`, `polso_dx`, `anca_sx`, `anca_dx`, `ginocchio_sx`, `ginocchio_dx`, `caviglia_sx`, `caviglia_dx`, `altro`.
- **Codice a barre.** Valori per 100 g da [Open Food Facts](https://world.openfoodfacts.org) (licenza ODbL) o dall'etichetta; il prodotto resta sul telefono e nel foglio (gruppo `prodotti` di App_Config). Le voci del pasto lette col codice hanno il campo `bc`.
- **Peso e calorie.** Pendenza su regressione delle pesate (esclusi i rientri da trasferta). Ricalibrazione di ±150 kcal solo dopo due letture consecutive fuori corridoio, al massimo ogni 14 giorni, e sempre con conferma.

## Schede del foglio

### `App_Log`

| Colonna | Significato |
| --- | --- |
| `id` | identificativo della riga |
| `w` | settimana del piano (la 24 inizia lunedì 13/07/2026) |
| `date` | data gg/mm/aaaa |
| `day` | giorno del piano: A, B, C, D, T1, T2 (trasferta), E1, E2 (settimana di picco) |
| `ex` | esercizio eseguito (le alternative col loro nome) |
| `gruppo` | gruppo muscolare principale |
| `side` | S sinistra, D destra, vuoto se bilaterale |
| `band` | banda usata |
| `load` | carico in kg per manubrio |
| `reps` | ripetizioni per serie, separate da \| |
| `serie` | numero di serie |
| `tot` | ripetizioni totali |
| `vol` | volume in kg (carico × ripetizioni) |
| `rir` | ripetizioni di riserva nell'ultima serie (0 = cedimento, 4 = 4 o più) |
| `rirs` | ripetizioni di riserva di ogni serie, separate da \| (es. 2\|1\|0) |
| `top` | Sì se il top del range è chiuso |
| `note` | nota libera |
| `rec` | secondi medi tra una serie e la successiva |
| `duro` | lato più duro: S, D, U (uguali) |
| `dolz` | dolore segnato durante l'esercizio, zona:valore separati da ; (es. spalla_sx:4) |

### `App_Sessioni`

| Colonna | Significato |
| --- | --- |
| `id` | identificativo |
| `w` | settimana del piano |
| `date` | data |
| `day` | giorno del piano |
| `sede` | Casa o Trasferta |
| `mod` | Pesi, Bande, Corpo libero, Ridotta (45′), Minima (15′), Essenziale (picco), Riposo |
| `min` | durata in minuti |
| `en` | energia 1-5 |
| `warm` | riscaldamento completo Sì/No |
| `sig` | Sì se un dolore ha superato 5/10 |
| `dol` | dolore massimo durante la seduta 0-10 (qualsiasi zona) |
| `dolz` | dolore per zona durante la seduta, zona:valore separati da ; |
| `note` | nota libera |

### `App_Misure`

| Colonna | Significato |
| --- | --- |
| `w` | settimana |
| `date` | data |
| `peso` | kg |
| `torace` | cm, a fine espirazione |
| `bic` | braccio cm |
| `coscia` | cm |
| `vita` | cm |
| `note` | nota |

### `App_Benessere`

| Colonna | Significato |
| --- | --- |
| `date` | data |
| `w` | settimana |
| `refl` | reflusso 0-3 (sera) |
| `resp` | respirazione 4-7 fatta (sera) |
| `camm` | camminate dopo i pasti 0-2 (sera) |
| `hrv` | HRV notturna da Zepp (mattino) |
| `read` | readiness Zepp (mattino) |
| `sonno` | ore di sonno (mattino) |
| `alc` | alcol la sera prima (mattino) |
| `peso` | peso a digiuno kg (mattino, vuoto in trasferta) |
| `rhr` | FC a riposo (mattino) |
| `stress` | stress 0-3 (sera) |
| `mente` | testa 1-5 (sera) |
| `passi` | passi medi della settimana (domenica) |
| `ipo` | indice di ipopnea eventi/ora (domenica) |
| `dolm` | dolore massimo al mattino 0-10 (qualsiasi zona) |
| `dolmz` | dolore al mattino per zona, zona:valore separati da ; |
| `cibP` | proteine del giorno g |
| `cibC` | carboidrati g |
| `cibG` | grassi g |
| `cibJ` | pasti del giorno (JSON: colazione, spuntini, pranzo, cena, fuori pasto) |
| `sede` | dove hai dormito: Casa o Fuori |
| `citta` | città, se fuori |
| `note` | nota libera |

### `App_Simmetria`

| Colonna | Significato |
| --- | --- |
| `date` | data |
| `w` | settimana |
| `ex` | esercizio del check |
| `q` | domanda |
| `a` | risposta Sì/No/Non verificato |
| `side` | lato che limita |

### `App_Mobilita`

| Colonna | Significato |
| --- | --- |
| `date` | data |
| `w` | settimana |
| `cav_s` | dorsiflessione caviglia sinistra cm |
| `cav_d` | caviglia destra cm |
| `tor_s` | rotazione toracica sinistra ° |
| `tor_d` | rotazione toracica destra ° |
| `spa_s` | mani dietro la schiena, braccio alto sinistro cm (meno = meglio) |
| `spa_d` | braccio alto destro cm |
| `cat` | catena posteriore cm (negativo se non arrivi ai piedi) |
| `note` | nota |

### `App_Piano`

| Colonna | Significato |
| --- | --- |
| `id` | giorno\|esercizio |
| `day` | giorno |
| `ord` | ordine nella seduta |
| `ex` | esercizio |
| `gruppo` | gruppo |
| `serie` | serie previste |
| `lo` | ripetizioni minime del range |
| `hi` | ripetizioni massime |
| `load` | carico suggerito ora (kg) |
| `band` | banda suggerita |
| `uni` | Sì se un lato alla volta |
| `tempo` | Sì se misurato in secondi |
| `tetto` | tetto di carico per la spalla (kg) |
| `attesa` | decisione di non salire |
| `prog` | stato della progressione (scelta, in coda, tetto, fermo) |
| `note` | nota tecnica del piano |
| `agg` | data di aggiornamento |

### `App_Stato`

| Colonna | Significato |
| --- | --- |
| `w` | settimana |
| `dal` | lunedì |
| `al` | domenica |
| `sedute` | sedute fatte |
| `bersaglio` | sedute del bersaglio (4, 2 in picco, meno i riposi) |
| `previste` | sedute previste dal piano della settimana (il bersaglio se non c'è un piano) |
| `settimana` | stato della settimana: piena, tenuta, rotta o aperta (vedi Catena delle settimane) |
| `riposi` | riposi programmati |
| `min` | durata media |
| `en` | energia media |
| `top` | % serie al top del range |
| `ton` | kg sollevati con i pesi (esatti) |
| `ton_bande_stima` | kg stimati con le bande (valore nominale × 0,7) |
| `ton_corpo_stima` | kg stimati a corpo libero (quota del peso; push-up circa 72%) |
| `serie_dure` | serie dure della settimana, somma per gruppo col conteggio frazionario (RIR 4+ vale mezza) |
| `serie_dure_pct` | % di serie chiuse a RIR 0-3 o senza RIR |
| `duro` | lato più duro (conteggio) |
| `rir0` | composti a cedimento / composti con RIR |
| `peso` | peso medio |
| `peso_g` | pendenza g/settimana |
| `kcal` | calorie medie |
| `prot` | proteine medie g |
| `carb` | carboidrati medi g |
| `grassi` | grassi medi g |
| `hrv` | HRV mediana |
| `rhr` | FC a riposo mediana |
| `sonno` | sonno medio h |
| `sonno_fuori` | sonno medio nelle notti fuori |
| `rec_bassi` | giorni con recupero basso |
| `prog` | progressione scelta |
| `diagnosi` | titoli della diagnosi automatica |
| `prot_gkg` | proteine g/kg |
| `vita_altezza` | rapporto vita/altezza |
| `dolore_mattina` | dolore al mattino, media dei massimi giornalieri 0-10 |
| `dolore_seduta_max` | dolore in seduta, massimo 0-10 |
| `dolore_zone` | zone di dolore della settimana con il numero di rilevazioni (es. lombare×3) |
| `serie_gruppo` | serie per gruppo, conteggio frazionario |
| `picco` | Sì se settimana di picco |
| `piano_prog` | piano della settimana: giorno, seduta, luogo e stato (fatta, oggi, futura, saltata) |
| `fuori` | giorni fuori casa della settimana successiva, con o senza bande (dalla chiusura) |
| `occupati` | giorni senza tempo della settimana successiva (dalla chiusura) |
| `kpi_fuori` | KPI in attenzione o fuori (chiavi App_KPI) |
| `bene` | chiusura: cosa è andato bene |
| `cambia` | chiusura: una cosa da cambiare |
| `piano_sett` | giorni decisi per la settimana dopo |
| `agg` | data |

### `App_KPI`

| Colonna | Significato |
| --- | --- |
| `k` | chiave stabile del KPI |
| `area` | area |
| `nome` | nome |
| `unita` | unità |
| `frequenza` | quando si aggiorna |
| `come` | formula |
| `bersaglio` | bersaglio |
| `fonte` | fonte del bersaglio |
| `link` | link alla fonte |
| `valore` | valore attuale |
| `testo` | valore leggibile |
| `stato` | ok, attenzione, fuori, dati insufficienti |
| `agg` | data |

### `App_Config`

| Colonna | Significato |
| --- | --- |
| `k` | gruppo (e #parte se spezzato) |
| `gruppo` | patches, impostazioni, chiusure, coach, prodotti, settimane (piano e disponibilità) |
| `parte` | numero del pezzo |
| `parti` | pezzi totali |
| `ts` | orologio della modifica (ms): vince il più recente |
| `v` | contenuto JSON (o un suo pezzo) |

## Operazioni di patch per il coach

Una patch è un JSON `{"nota":"…","ops":[…]}` che si incolla in Coach (o arriva con la proposta della domenica). L'app mostra l'anteprima e segnala le voci che non trovano il loro esercizio. Ogni patch si annulla dallo storico.

| Operazione | Esempio | Effetto |
| --- | --- | --- |
| `set` | `{"op":"set","d":"A","n":"Plank","lo":45,"hi":75}` | cambia serie (s), range (lo, hi), carico di partenza (L), banda (b), nota (tip), attesa (hold) |
| `add` | `{"op":"add","d":"B","after":"Box Squat","ex":{"n":"Glute bridge","s":2,"lo":12,"hi":15}}` | aggiunge un esercizio a un giorno |
| `del` | `{"op":"del","d":"C","n":"Pullover manubrio"}` | toglie un esercizio da un giorno |
| `dischi` | `{"op":"dischi","d":"A","v":"20 › 20 › 14"}` | sequenza dei dischi da preparare |
| `nota` | `{"op":"nota","d":"A","t":"Aggiungi 2 serie di Box Squat","n":"Box Squat"}` | promemoria che ricompare a ogni seduta finché non è fatto |
| `cibo` | `{"op":"cibo","cat":"pia","n":"Poke salmone","d":"ciotola","p":32,"c":70,"g":18}` | nuovo alimento nel catalogo |
| `ricetta` | `{"op":"ricetta","n":"Pranzo ufficio","m":"pra","v":[["Pollo",1],["Riso",1]]}` | nuova ricetta |
| `stima` | `{"op":"stima","n":"pizza con gli amici","p":20,"c":60,"g":12}` | converte una voce scritta a parole nei grammi veri |
| `kcal` | `{"op":"kcal","off":150}` | sposta il target calorico (tutto sui carboidrati) |
| `target` | `{"op":"target","peso":[150,250]}` | sposta il corridoio della pendenza del peso (g/settimana) |
| `settimana` | `{"op":"settimana","w":41,"nota":"Martedì in trasferta","giorni":{"lun":"casa 60","mar":"fuori 30","mer":"no","gio":"fuori0 60"},"sedute":[{"g":"lun","d":"A","l":"casa","ora":"07:30","t":60},{"g":"mar","d":"B","l":"bande","ora":"18:30","t":30}]}` | piano di massima della settimana w: g = lun..dom (oppure data gg/mm/aaaa), d = giorno del piano (A B C D, E1 E2 in picco), l = casa (pesi), bande o corpo, ora e t (30, 60, 90 minuti) facoltativi. giorni (facoltativo): luogo e minuti di ogni giorno (casa, fuori = con le bande, fuori0 = senza niente, no). Le sedute restano dove le mette il coach; l'app ne adatta gli esercizi al tempo e al bilancio dei gruppi |

Giorni validi: A, B, C, D, T1, T2, E1, E2.
