# Revisione dell'app · versioni 4.11.0 e 4.12.0 (24/11/2026)

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

## 2. Razionalizzazione · applicata in 4.12.0 (decisione del 24/11/2026)

Punto di partenza: **5 schede**, **24 KPI**, un indice di benessere su 6 aree, uno stato di oggi con 9 segnali, una diagnosi e un briefing. Molte cose si ripetevano.

| # | Cosa | Come funziona adesso |
| --- | --- | --- |
| A | **Un solo posto per compilare** | Mattino e sera si compilano solo dall'agenda di Oggi («Da registrare oggi»). In Corpo il riquadro «Benessere di oggi» dice cosa manca e rimanda a Oggi. Si possono ancora correggere i giorni passati e aggiungere un giorno saltato |
| B | **Domenica in un modulo solo** | La chiusura della settimana ha un quarto punto: passi medi e ipopnea da Zepp. In agenda c'è una voce sola. In Corpo il riquadro «Passi e ipopnea» si legge, e «Modifica» riapre la chiusura |
| C | **Tre livelli di lettura** | **Stato di oggi** (Oggi): decide la seduta. **Benessere della settimana**: una riga in Oggi (punteggio, confronto con la settimana scorsa, area da guardare), il dettaglio in Corpo. **KPI e diagnosi** (Progressi): il dettaglio per il coach, ora scritto in testa alle due schede |
| D | **HybridCharge nel tempo** | Media dei 7 giorni contro la tua norma, cioè la mediana dei 60 giorni precedenti. Servono almeno 14 mattine; da 10 punti sotto si legge «sotto il tuo solito». Compare in Corpo, nel grafico di Progressi → Salute (con la linea della norma) e nel briefing. È solo una lettura: non entra nello stato di oggi |
| E | **Ora della cena e reflusso** | Nei «tuoi dati letti insieme» (Corpo). L'ora di fine cena si confronta con il reflusso segnato la sera dopo, che conta anche la notte. Lo spartiacque è la tua ora di cena tipica e servono 4 cene per parte. Riferimento: la [linea guida ACG 2022](https://pubmed.ncbi.nlm.nih.gov/34807007/) suggerisce di non mangiare nelle 2-3 ore prima di coricarsi (raccomandazione condizionale, evidenza bassa) |
| F | **Spuntino proteico** | Se colazione o pranzo restano sotto 0,25 g/kg di proteine, l'app propone con un tocco lo spuntino proteico che usi di più. Se non ne hai uno abituale, lo prende dal catalogo (yogurt greco, latte proteico). Dopo colazione va nello spuntino della mattina, dopo pranzo in quello del pomeriggio. Dopo cena niente spuntino, per il reflusso |

## 3. Cosa mi serve ancora sapere da te
1. Nell'app Zepp vedi ancora **HRV notturna e FC a riposo** separate, o solo HybridCharge? Se spariscono, il recupero va riscritto attorno a HybridCharge.
2. Quale valore di HybridCharge leggi la mattina: quello al **risveglio** (Wake) o quello del momento? L'app dà per scontato il primo.
