# Script del foglio, versione 3

Con questo script il foglio Google diventa la memoria completa di Rachide: storico, modifiche al piano, impostazioni, chiusure della settimana, KPI. Cambiando telefono (o indirizzo dell'app) basta collegare il foglio e torna tutto.

Cosa cambia rispetto alla v2:

| | v2 | v3 |
|---|---|---|
| Storico (serie, sedute, misure, benessere) | sul foglio | sul foglio |
| Modifiche al piano, impostazioni, chiusure | solo sul telefono | sul foglio (`App_Config`) |
| Cosa parte a ogni salvataggio | tutto l'archivio | solo le righe cambiate |
| Frase segreta | nell'indirizzo (`?k=`) | nel corpo della richiesta |
| KPI con definizione e fonte | no | scheda `App_KPI` |

L'app funziona con entrambe: finché non installi la v3 resta tutto come oggi.

## Installazione (10 minuti, una volta)

1. **Copia di sicurezza.** Nell'app: Coach → Backup .json. Nel foglio: File → Crea una copia.
2. **Annota la proposta della domenica.** Apri lo script attuale (Estensioni → Apps Script) e cerca come legge la proposta: se usa un file su Drive, copia il nome esatto del file.
3. **Sostituisci il codice.** Cancella il contenuto di `Codice.gs` e incolla tutto [`Rachide.gs`](Rachide.gs). Se al punto 2 hai trovato un nome di file, scrivilo in `PROPOSTA_FILE` tra le virgolette. In alternativa la proposta si può scrivere nell'ultima riga della scheda `App_Proposta` (colonne `id`, `data`, `testo`).
4. **Frase segreta nuova.** In alto scegli la funzione `generaSegreto` e premi Esegui. Autorizza lo script quando te lo chiede. In Esecuzioni → Registro trovi la frase: copiala.
5. **Ridistribuisci con una versione nuova.** Distribuisci → Gestisci distribuzioni → matita sulla distribuzione esistente → Versione: *Nuova versione* → Distribuisci. L'indirizzo `/exec` resta lo stesso. Accesso: *Chiunque*.
6. **Nell'app.** Coach → Collegamento al foglio → Modifica → incolla la frase nuova → Salva e prova.
7. **Prima scrittura.** Coach → Invia tutto. Le schede `App_*` vengono riscritte nel formato v3 e nasce `App_Config`. Da qui in poi l'app invia solo le modifiche.

Nella scheda Coach deve comparire: *Script v3: storico, piano e impostazioni sul foglio*.

**Se qualcosa non va:** Gestisci distribuzioni → scegli la versione precedente → Distribuisci. Torni alla v2 senza perdere dati.

## Telefono nuovo, o app a un indirizzo nuovo

1. Apri l'app e tocca *Collega il foglio*.
2. Incolla l'indirizzo `/exec` e la frase segreta.
3. Storico, piano personalizzato e impostazioni tornano dal foglio.

La memoria del browser è legata all'indirizzo: anche spostando l'app (per esempio da GitHub Pages a Cloudflare Pages, vedi il README) si ricollega il foglio e si riparte da lì.

## Schede del foglio

| Scheda | Una riga per | Chiave |
|---|---|---|
| `App_Log` | serie di un esercizio (per lato, se unilaterale) | `id` |
| `App_Sessioni` | seduta o riposo programmato | `id` |
| `App_Misure` | misurazione (ogni 14 giorni) | `date` |
| `App_Benessere` | giorno (mattino, sera, cibo) | `date` |
| `App_Simmetria` | risposta al check simmetria | `date` + `ex` + `q` |
| `App_Mobilita` | rilevazione dei test di mobilità | `date` |
| `App_Config` | gruppo di impostazioni (`patches`, `impostazioni`, `chiusure`, `coach`) | `k` |
| `App_Piano` | esercizio del piano in vigore | `id` |
| `App_Stato` | settimana (KPI, diagnosi, chiusura) | `w` |
| `App_KPI` | indicatore, con definizione, bersaglio e fonte | `k` |

Il significato di ogni colonna e di ogni KPI è in [`docs/DATI_E_KPI.md`](../docs/DATI_E_KPI.md).
