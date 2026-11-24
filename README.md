# Rachide

Registro personale di allenamento, cibo e salute. È una web app statica (HTML, CSS, JavaScript senza dipendenze): si installa sulla schermata Home del telefono, funziona anche senza rete e usa un foglio Google come memoria. Il coach (Claude, nel progetto *Fisico e Salute*) legge il foglio e propone modifiche al piano che l'app mostra in anteprima.

## Cosa fa

- **Stato di oggi**: recupero, sonno, stress, dolore, carico recente e cibo letti insieme, con un giudizio in tre livelli e il perché. Da lì nascono le **proposte** sulla seduta (tenere i carichi, accorciare, cambiare gli esercizi che caricano una zona dolente, scendere di un gradino quando sei salito e l'esecuzione non tiene): niente cambia finché non le autorizzi. Anche i tetti per la spalla sono proposte.
- **Seduta guidata**: un esercizio per schermata con il promemoria della tecnica (posizione, tempo, cosa sentire, a cosa fare attenzione), carico suggerito, recupero a tempo con suoni, timer per le tenute, RIR a ogni serie e lato più duro. Lo schermo resta acceso durante la seduta e mentre guardi come si fa un esercizio (si spegne in Coach).
- **Come si fa**: per ogni esercizio e per il riscaldamento una scheda in quattro parti: come ti metti (ogni parte del corpo, dai piedi alla testa), come ti muovi (fasi, durata, respiro), cosa devi sentire (i muscoli disegnati sul corpo e le zone dove NON deve dare fastidio), come ti accorgi che stai sbagliando e cosa fare subito. In fondo le note del coach, la figura con partenza, arrivo, errore tipico e animazione, e le alternative fuori casa (scheda *Esercizi*, sempre disponibile). Il riscaldamento si può fare guidato, a tempo.
- **Piano flessibile**: Casa, Bande o Corpo libero sulla prossima seduta; versione da 45′ e da 15′; settimana di picco con due sedute essenziali.
- **Piano della settimana**: il coach lo scrive la domenica sera sui giorni e i tempi che gli dai nella chiusura. In settimana, in *Adatta la settimana*, per ogni giorno scegli dove sei (casa; fuori con le bande; fuori senza niente; occupato) e quanto tempo hai (30, 60, 90 minuti): l'app sceglie quali sedute fare e quando, con quale attrezzo, e adatta gli esercizi (toglie le serie che valgono meno se il tempo non basta, aggiunge serie o esercizi ai gruppi che restano indietro). La seduta guidata usa la versione adattata; le sedute vanno nel calendario.
- **Catena delle settimane**: una settimana è *piena* se fai tutte le sedute o chiudi tutti i gruppi muscolari, *tenuta* se fai almeno 2 sedute e tutto il piano adattato ai tuoi giorni; entrambe allungano la catena. Se la settimana rischia di rompersi l'app propone 30 minuti a corpo libero; dopo 3 settimane tenute di fila avvisa.
- **Serie dure**: l'unità di volume è lo sforzo (RIR 0-3 vale 1, RIR 4+ vale mezza), uguale per pesi, bande e corpo libero; il carico sollevato è diviso per tipo, con le stime segnate.
- **Progressione automatica**: doppia progressione con RIR, una salita alla volta, tetti per la spalla, carichi fermi quando il recupero è basso, rientro dopo una pausa.
- **Cibo**: dalla scheda Cibo un pulsante apre il pasto dell'ora; scrivi il pasto in una riga («pollo 200 g, riso 80, un cucchiaio d'olio») o tocca i tuoi soliti, e l'app riconosce gli alimenti e mostra cosa ha capito. Poi «come l'ultima volta», le tue ricette (un pasto salvato con un tocco), codice a barre (Open Food Facts, o valori dall'etichetta), tabella a grammi, porzioni del coach. Le voci hanno l'ora: a fine seduta l'ultimo pasto pieno si compila da solo. Si legge in calorie e grammi oppure in blocchi.
- **Fabbisogno**: stima dalla formula (Mifflin-St Jeor per l'attività) e, quando le giornate registrate bastano, dai tuoi dati (calorie mangiate meno l'energia finita nel peso). Se il target è lontano, l'app propone di spostarlo e tu autorizzi.
- **Benessere**: un indice da 0 a 100 su sei aree (recupero, testa, corpo, movimento, nutrizione, digestione e respiro), al massimo tre cose da fare nella settimana e le letture incrociate dei tuoi dati (per esempio notti corte e HRV, stress e reflusso).
- **Salute**: HRV e FC a riposo con fascia personale, HybridCharge di Zepp (letto insieme a HRV, FC e sonno, non come segnale in più), sonno, stress, reflusso, dolore 0-10 in qualsiasi zona (mattino, seduta, singolo esercizio), misure, mobilità, simmetria. I numeri del mattino si scrivono a mano da Zepp.
- **Cruscotto KPI** con definizione, bersaglio, fonte e andamento a 12 settimane di ogni indicatore; serie per gruppo sul corpo; forza stimata; HRV, costanza e dolore nel tempo; agenda di cosa registrare oggi; promemoria nel calendario del telefono.

Tutte le definizioni (KPI, schede del foglio, regole del motore, operazioni di patch) sono in [`docs/DATI_E_KPI.md`](docs/DATI_E_KPI.md), generato dal codice.

## Struttura

```
index.html              guscio della pagina
css/app.css             stili (temi colore, contrasto WCAG AA)
js/01-dati.js           catalogo esercizi, piano, alternative, guida tecnica, KPI e fonti
js/02-motore.js         memoria locale, date, progressione, rientro, piano flessibile
js/03-cibo.js           cibo
js/04-extra-coach.js    esercizi extra, promemoria del coach
js/05-analisi.js        KPI settimanali, recupero, peso, diagnosi, record, chiusura
js/06-seduta.js         riscaldamento, export, briefing, patch del piano
js/07-animazioni.js     confronti corretto/sbagliato
js/08-sync.js           collegamento al foglio (v2)
js/09-viste.js          schermate
js/10-azioni.js         tocchi, moduli, sedute
js/12-figure.js         figure animate degli esercizi
js/13-guida.js          scheda Come si fa, riscaldamento guidato, timer, suoni, libreria
js/14-kpi.js            cruscotto KPI, agenda, profilo
js/15-promemoria.js     promemoria nel calendario (.ics)
js/16-memoria.js        memoria sul foglio v3
js/17-codici.js         codice a barre e Open Food Facts
js/18-dolore.js         dolore per zona, mappa del corpo
js/19-pianificatore.js  piano della settimana, adattamento, bilancio, calendario
js/20-posizione.js      scheda Posizione: partenza, arrivo, numeri, angoli, errore
js/21-grafici.js        grafici SVG e serie storiche dei KPI
js/22-progressi.js      serie per gruppo sul corpo, forza stimata, recupero
js/23-generatore.js     sceglie e adatta le sedute della settimana a giorni, tempi e attrezzi
js/24-tecnica.js        scheda tecnica sul corpo: posizione, movimento, sensazioni, errori
js/25-stato.js          stato di oggi e proposte da autorizzare
js/26-alimenti.js       tabella degli alimenti, ricerca e lettura del pasto scritto a parole
js/27-fabbisogno.js     fabbisogno dalla formula e dai dati, proposte sul target, profilo
js/28-benessere.js      indice di benessere, letture incrociate, suggerimenti
js/vendor/              ZXing 0.23.0 (lettura dei codici a barre, Apache 2.0)
js/99-avvio.js          avvio, service worker
sw.js                   funzionamento offline
apps-script/            script del foglio Google (v3) e istruzioni
tests/                  test automatici (node --test, senza dipendenze)
tools/genera-doc.js     genera docs/DATI_E_KPI.md
```

## Sviluppo

Serve solo Node 20 o successivo.

```bash
npm test
```

```bash
npm run controlla
```

Il primo esegue i test (motore, piano flessibile, figure, KPI, promemoria, script del foglio contro un finto Google Sheets, integrazione app-foglio con due telefoni). Il secondo controlla anche che la documentazione per il coach sia allineata al codice. Gli stessi controlli girano su GitHub a ogni push.

Quando cambi un file dell'app, aumenta la versione in due punti uguali: `VERSIONE_APP` in `js/01-dati.js` e `VERSIONE` in `sw.js` (un test verifica che coincidano). I telefoni scaricano la versione nuova da soli e mostrano «Nuova versione pronta».

## Come aggiornare

1. **Unisci il ramo nel `main`** su GitHub (pull request → *Merge*). GitHub Pages ripubblica in un paio di minuti; i test girano da soli (tab *Actions*).
2. **Sul telefono**, la prima volta dopo la 4.0 (poi arriva da solo): apri l'app e vai su Coach → *Aggiorna app*. Dalla 4.0 in poi l'aggiornamento arriva da solo: compare «Nuova versione pronta» in Oggi, tocchi *Aggiorna ora*. I dati restano dove sono.
3. **Script del foglio v3**, una volta sola: [`apps-script/LEGGIMI.md`](apps-script/LEGGIMI.md). Poi Coach → *Invia tutto*.
4. **Una volta sola nell'app**: profilo (Corpo → Fabbisogno → *Profilo*: altezza, anno di nascita, sesso, giornata tipo), promemoria nel calendario (Coach → Promemoria), prova dei suoni.
5. **Al coach**: carica [`docs/DATI_E_KPI.md`](docs/DATI_E_KPI.md) nelle conoscenze del progetto (sostituisci la versione precedente quando cambia).

Per pubblicare una modifica: cambia il codice, aumenta `VERSIONE_APP` in `js/01-dati.js` e `VERSIONE` in `sw.js`, esegui `npm run controlla`, unisci nel `main`.

## Memoria e telefono nuovo

L'app ha una memoria sua: il tuo foglio Google, con lo script v3 ([`apps-script/LEGGIMI.md`](apps-script/LEGGIMI.md)). Ci finisce tutto: storico delle serie (con il RIR di ogni serie), sedute, benessere, pasti e prodotti letti col codice a barre, misure, mobilità, simmetria, modifiche al piano, piano della settimana con luoghi, tempi e sedute adattate, chiusure, impostazioni. Il telefono tiene una copia locale per funzionare anche senza rete e invia le modifiche appena può.

**Telefono nuovo, con il vecchio in mano**
1. Sul vecchio: Coach → Collegamento al foglio → *Telefono nuovo: copia il codice di collegamento*. Mettilo dove tieni le password.
2. Sul nuovo: apri l'indirizzo dell'app in Safari (o Chrome) e aggiungila alla schermata Home.
3. Apri l'app **dalla Home**, tocca *Collega il foglio*, incolla il codice nel primo campo, *Salva e prova*. Su iPhone l'app sulla Home ha una memoria separata da Safari: il codice va incollato lì.

**Telefono perso**: indirizzo e frase sono nello script. Apri il foglio da un computer → Estensioni → Apps Script: l'indirizzo è in *Esegui il deployment → Gestisci deployment* (URL che finisce con `/exec`), la frase in *Impostazioni progetto → Proprietà dello script → SEGRETO*. Sul telefono nuovo incollali nei due campi di *Collega il foglio*.

Il backup `.json` (Coach → Backup) resta la copia di riserva.

## Pubblicazione e privacy

Il codice contiene la guida tecnica personalizzata (scoliosi, spalla, reflusso). I dati invece non sono mai nel repository: stanno nel telefono e nel foglio.

**Oggi**: GitHub Pages da questo repository, che per essere pubblicato gratis deve essere pubblico.

**Per renderlo privato senza pagare**: GitHub Pages da un repository privato richiede un piano a pagamento; Cloudflare Pages invece pubblica gratis anche da repository privati.

1. Crea un account gratuito su Cloudflare. Vai in *Workers e Pages → Crea → Pages → Connetti a Git* e autorizza GitHub solo su questo repository.
2. Scegli il ramo `main`, framework *Nessuno*, comando di build vuoto, cartella di output `/`. Pubblica: ottieni un indirizzo `https://<nome>.pages.dev`.
3. Apri il nuovo indirizzo sul telefono, aggiungilo alla Home, tocca *Collega il foglio*: con lo script v3 torna tutto.
4. Solo dopo aver verificato che funziona: su GitHub, *Settings → General → Change visibility → Private*, e disattiva GitHub Pages.

Ogni push su `main` ripubblica l'app su Cloudflare da solo.
