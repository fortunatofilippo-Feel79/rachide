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

## Installazione (10 minuti, una volta, da computer)

1. **Copia di sicurezza.** Nell'app: Coach → Backup .json. Nel foglio: File → Crea una copia.
2. **Apri lo script del foglio.** Nel foglio: Estensioni → Apps Script.
3. **Sostituisci il codice.** Apri [la versione da copiare](https://raw.githubusercontent.com/fortunatofilippo-Feel79/rachide/main/apps-script/Rachide.gs), seleziona tutto (Cmd+A o Ctrl+A) e copia. Nell'editor, a sinistra, deve esserci **un solo file** di codice (di solito `Codice.gs`): cancellane tutto il contenuto, incolla, poi **salva** (icona del dischetto o Cmd+S). Se ci sono altri file `.gs` del vecchio script, eliminali: due funzioni `doGet` si pestano i piedi.
4. **Esegui `installa`.** In alto, nel menu a tendina delle funzioni, scegli `installa` e premi **Esegui**. La prima volta Google chiede l'autorizzazione: *Rivedi autorizzazioni* → scegli il tuo account → se compare «Google non ha verificato questa app»: *Avanzate* → *Vai a … (non sicuro)* → *Consenti*. È il tuo script, sul tuo foglio. In basso si apre il **Log di esecuzione**: leggi cosa dice sulla frase segreta.
   - «la stessa di prima»: nell'app non devi cambiare niente;
   - «FRASE SEGRETA NUOVA: …»: copiala, ti serve al punto 7.
5. **Ridistribuisci con una versione nuova.** **Esegui il deployment** (in alto a destra; in inglese *Deploy*) → **Gestisci deployment** → scegli il deployment attivo → **Modifica** (matita) → Versione: **Nuova versione** → **Esegui il deployment**. Esegui come: *Me*; Chi ha accesso: *Chiunque*. L'indirizzo `/exec` resta lo stesso. (Non usare «Nuovo deployment»: creerebbe un indirizzo diverso da quello che conosce l'app.)
6. **Controllo.** Apri l'indirizzo `/exec` nel browser: deve comparire «Rachide · script del foglio v3.1 · attivo» con la frase *impostata*. Se vedi altro, il deployment non è aggiornato: rifai il punto 5.
7. **Nell'app.** Coach → Collegamento al foglio. Se al punto 4 c'era una frase nuova: Modifica → incollala nel secondo campo → Salva e prova. Poi **Invia tutto**: nel foglio nascono `App_Config` e `App_KPI`, e da qui in poi l'app invia solo le modifiche.

Nella scheda Coach deve comparire: *Script v3: storico, piano e impostazioni sul foglio*.

### Se non funziona

| Cosa vedi | Perché | Cosa fare |
|---|---|---|
| In Coach c'è ancora «Script v2» | Codice salvato ma non ridistribuito | Punto 5: Gestisci deployment → Modifica → *Nuova versione* |
| In Coach: «segreto non valido» | La frase dell'app non è quella dello script | Esegui `installa`, copia la frase dal log, incollala in Coach → Modifica (secondo campo) |
| Aprendo `/exec`: «Funzione script non trovata: doGet» | Codice incompleto o non salvato | Ricopia tutto dal link del punto 3, salva, ridistribuisci |
| Al salvataggio: «Errore di sintassi» | Copia a metà | Ricopia tutto dal link del punto 3 (l'ultima riga del file è una `}`) |
| Aprendo `/exec`: «Autorizzazione richiesta» o pagina di accesso | Deployment non aperto a tutti | Gestisci deployment → Modifica → Chi ha accesso: *Chiunque* |
| L'indirizzo `/exec` è cambiato | È stato creato un deployment nuovo | Nell'app: Coach → Collegamento → Modifica → incolla il nuovo indirizzo |

**Per tornare indietro:** Gestisci deployment → Modifica → Versione: quella precedente → Esegui il deployment. Torni alla v2 senza perdere dati.

## Telefono nuovo, o app a un indirizzo nuovo

1. Sul vecchio telefono: Coach → *Telefono nuovo: copia il codice di collegamento* (contiene indirizzo e frase; tienilo dove tieni le password).
2. Sul nuovo: aggiungi l'app alla schermata Home, aprila da lì, tocca *Collega il foglio* e incolla il codice nel primo campo.
3. Storico, piano, settimane, cibo e impostazioni tornano dal foglio.

Senza il vecchio telefono: l'indirizzo `/exec` è in *Esegui il deployment → Gestisci deployment*, la frase in *Impostazioni progetto → Proprietà dello script → SEGRETO*. Incollali nei due campi.

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
