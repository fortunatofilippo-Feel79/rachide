# Revisione dell'app · versione 4.11.0 (24/11/2026)

Che cosa è cambiato, perché, e cosa resta da decidere. Le fonti sono in fondo a ogni punto.

## 1. Cambiato in questa versione

### HybridCharge al posto della readiness
- **Il fatto.** Dal 07/11/2026 (Helio Ring, firmware 2.9.0.1) Zepp non dà più la readiness. Con l'app Zepp 10.4 (maggio 2026) readiness e BioCharge sono stati sostituiti da **HybridCharge**: un punteggio 0-100 con fasce 0-59 scarso, 60-79 discreto, 80-100 buono. Il valore del mattino («Wake») si calcola da qualità del sonno, HRV e FC a riposo, più la fatica mentale del giorno prima. Il peso di ogni ingresso non è pubblicato.
- **La scelta.** HybridCharge riusa i dati che l'app registra già. Contarlo come segnale in più vorrebbe dire contare due volte la stessa notte. Quindi:
  - con HRV e FC a riposo presenti, HybridCharge **non alza il livello del recupero**. Accanto a un altro segnale compare come «conferma». Se invece tutto il resto è nella norma, compare come nota: «allenati normale; se si ripete per tre mattine guarda sonno e stress»;
  - se manca l'HRV o la FC del mattino, HybridCharge sotto 60 **sostituisce il dato mancante** (giallo);
  - la readiness storica resta nella colonna `read` del foglio e non si confronta con HybridCharge. La nuova colonna è `hc` e lo script del foglio la crea da solo.
- **Dove si vede.** Nel modulo del mattino (HRV, FC a riposo, HybridCharge, con le fasce scritte sotto), nello stato di oggi, in Corpo, nei giorni registrati e nel briefing per il coach.
- Fonti: [Notebookcheck, HybridCharge su altri dieci orologi Amazfit](https://www.notebookcheck.net/Ten-more-Amazfit-smartwatches-getting-new-HybridCharge-feature.1316113.0.html) · [Android Authority, aggiornamento Helio Ring](https://androidauthority.com/amazfit-helio-ring-hybridcharge-update-3730719) · [the5krunner, HybridCharge contro Body Battery e Whoop](https://the5krunner.com/2026/05/25/amazfit-hybridcharge-garmin-whoop/) · [Gadgets & Wearables, HybridCharge](https://gadgetsandwearables.com/2026/05/25/hybridcharge/).

### Niente più Salute di iPhone
- Tolto il pulsante «Incolla da Salute» e il codice che leggeva gli appunti. I numeri del mattino si scrivono a mano da Zepp. Il modulo li chiede nell'ordine HRV, FC a riposo, HybridCharge, sonno, peso.
- Tolto anche il vecchio modulo «scrivi a parole» che nessun pulsante apriva più.

### Cibo: meno tocchi, più integrazione
| Prima | Adesso |
| --- | --- |
| Oggi → tocca il pasto giusto → Scrivi → testo → Aggiungi | Oggi → **«＋ Aggiungi a pranzo»** (il pasto si sceglie dall'ora) → testo → Aggiungi |
| Per cambiare pasto si tornava indietro | Nel modulo «scrivi» i pasti si cambiano con un tocco e il testo resta |
| Le voci abituali andavano cercate | **I tuoi soliti** in quel pasto compaiono come pulsanti: un tocco li aggiunge al testo |
| «Come ieri» solo se ieri c'era quel pasto | **«Come l'ultima volta»**: il giorno più recente con quel pasto, fino a 14 giorni prima |
| Le ricette potevano arrivare solo dal coach | **Ricette tue**: «Salva questo pasto come ricetta», con i suoi valori. Vanno sul foglio (gruppo `ricette`) |
| Porzioni del coach sempre aperte in fondo | Chiuse in un riquadro: restano, ma non occupano lo schermo |
| L'ora dell'ultimo pasto a fine seduta si scriveva a mano | Le voci hanno l'ora: **l'ultimo pasto pieno prima della seduta si compila da solo** (regola 52, reflusso) |
| Nessuna lettura del singolo pasto | Su colazione, pranzo e cena, se le proteine restano sotto 0,25 g/kg, l'app suggerisce di arrivare a circa 0,4 g/kg ([Schoenfeld e Aragon 2018](https://pubmed.ncbi.nlm.nih.gov/29497353/)) |

### Piccole razionalizzazioni
- Misure: il peso si precompila con quello del mattino, senza scriverlo due volte.
- Scheda Cibo: le etichette dei macronutrienti non vanno più a capo.

## 2. Da decidere (non applicato)

Lettura della struttura: oggi l'app ha **5 schede**, **24 KPI**, un indice di benessere su 6 aree, uno stato di oggi con 9 segnali, una diagnosi e un briefing. È molto, e alcune cose si ripetono. Queste proposte toccano abitudini, quindi aspettano una tua decisione.

| # | Proposta | Perché | Costo per te |
| --- | --- | --- | --- |
| A | **Un solo posto per compilare.** Benessere del mattino e della sera solo dall'agenda di Oggi; in Corpo resta il riepilogo da leggere (e la correzione dei giorni passati) | Oggi gli stessi moduli si aprono da Oggi e da Corpo | nessuno |
| B | **Domenica in un modulo solo.** Passi medi e ipopnea dentro la chiusura della settimana | Oggi sono due voci separate in agenda, la stessa sera | nessuno |
| C | **Tre livelli di lettura, non tre sintesi.** Stato di oggi = decisione sulla seduta; indice di benessere = come va la settimana (una riga in Oggi, il dettaglio in Corpo); KPI e diagnosi = per il coach, in Progressi | Stato, indice e diagnosi oggi si leggono in tre schede diverse con parole diverse | da provare |
| D | **HybridCharge nel tempo.** Una media a 7 giorni contro il tuo riferimento personale, come per l'HRV, solo come lettura (non nello stato di oggi) | Le fasce di Zepp sono uguali per tutti; il tuo 65 può essere normale | serve 1 mese di dati |
| E | **Pasti e reflusso.** Lettura incrociata fra ora della cena e reflusso della notte, ora che le voci hanno l'ora | La regola 52 parla del pasto prima della seduta; per il reflusso conta anche la cena | nessuno, servono 3-4 settimane di dati |
| F | **Spuntini e proteine.** Se un pasto principale resta basso di proteine, proporre lo spuntino proteico giusto fra quelli che usi già | Arrivare a 4 pasti da 0,4 g/kg è la strada indicata da Schoenfeld e Aragon | nessuno |

## 3. Cosa mi serve sapere da te
1. Nell'app Zepp vedi ancora **HRV notturna e FC a riposo** separate, o solo HybridCharge? Se spariscono, il recupero va riscritto attorno a HybridCharge.
2. Quale valore di HybridCharge leggi la mattina: quello al **risveglio** (Wake) o quello del momento? L'app dà per scontato il primo.
3. Proposte A-F: quali vuoi, quali no.
