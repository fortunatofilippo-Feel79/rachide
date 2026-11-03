# Rachide

Registro personale di allenamento, cibo e salute. È una web app statica (HTML, CSS, JavaScript senza dipendenze): si installa sulla schermata Home del telefono, funziona anche senza rete e usa un foglio Google come memoria. Il coach (Claude, nel progetto *Fisico e Salute*) legge il foglio e propone modifiche al piano che l'app mostra in anteprima.

## Cosa fa

- **Seduta guidata**: un esercizio per schermata con figura animata, carico suggerito, recupero a tempo con suoni, timer per le tenute, RIR e lato più duro.
- **Come si fa**: figura animata, tecnica, errori tipici e alternative fuori casa per ogni esercizio e per il riscaldamento (scheda *Esercizi*, sempre disponibile). Il riscaldamento si può fare guidato, a tempo.
- **Piano flessibile**: Casa, Bande o Corpo libero sulla prossima seduta; versione da 45′ e da 15′; settimana di picco con due sedute essenziali.
- **Progressione automatica**: doppia progressione con RIR, una salita alla volta, tetti per la spalla, carichi fermi quando il recupero è basso, rientro dopo una pausa.
- **Cibo**: pasti da catalogo, ricette, «come ieri» o a parole; target ricalibrato sulla pendenza del peso.
- **Salute**: HRV e FC a riposo con fascia personale, sonno, stress, reflusso, spalla sinistra 0-10, misure, mobilità, simmetria.
- **Cruscotto KPI** con definizione, bersaglio e fonte di ogni indicatore; agenda di cosa registrare oggi; promemoria nel calendario del telefono.

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

## Memoria e telefono nuovo

Il foglio Google è la memoria. Con lo script v3 ci finiscono anche piano personalizzato, impostazioni e chiusure: su un telefono nuovo si apre l'app, si tocca *Collega il foglio* e torna tutto. Installazione dello script: [`apps-script/LEGGIMI.md`](apps-script/LEGGIMI.md).

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
