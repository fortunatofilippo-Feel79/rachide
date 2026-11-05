# Revisione delle posizioni degli esercizi

Versione 4.6.0, 04/11/2026, aggiornata alla 4.6.1. Ogni figura è stata rivista una per una: misurati gli angoli di ogni posa, confrontati con criteri di tecnica presi da fonti esterne e ridisegnati dove non tornavano.

## Come è fatta la revisione

1. **Misura.** Per ogni esercizio si misurano i fotogrammi della scheda *Posizione* (partenza e arrivo): angoli di ginocchio, anca, gomito, inclinazione del busto, verticalità di tibia e avambraccio e posizione di mani e gomiti rispetto alle spalle.
2. **Criterio esterno.** Per ogni posa si prende il criterio da una fonte. La prima scelta è [ExRx.net](https://exrx.net), la libreria di esercizi più usata come riferimento tecnico. Quando ExRx non dà un numero (angolo del gomito nel push-up, ginocchio in alto nell'hip thrust, face pull, band pull-apart) si usa una guida di allenatori, indicata nella tabella. Dove la fonte è la scheda del coach nell'app, la scelta è sua e qui non si discute.
3. **Correzione.** La posa si ridisegna finché il valore misurato sta nell'intervallo.
4. **Test.** I criteri sono in `tests/tecnica-criteri.js` e il test `tests/tecnica.test.js` li controlla a ogni modifica, così una figura non può tornare fuori misura senza che il test fallisca.

**Risultato.** Ci sono **116 criteri su 40 esercizi** (le varianti seguono l'esercizio base). Nella versione 4.5.1 **58 criteri erano fuori misura in 30 esercizi**, e 3 esercizi del catalogo non avevano proprio la figura. Adesso **sono tutti dentro**.

## Aggiornamento 4.6.1

- **Pike push-up rifatto.** Nella 4.6.0, scendendo il gomito si piegava *in avanti*, verso la testa. Ora:
  - in alto: bacino alto e spalle sopra le mani;
  - scendendo: i gomiti restano sopra le mani, le spalle scendono quasi in verticale e la testa arriva vicino al pavimento davanti alle mani ([Liftosaur](https://www.liftosaur.com/exercises/bodyweight-pike-pushup), [Caliverse](https://www.caliverse.app/exercises/pike-push-up-17));
  - le gambe restano distese per tutto il movimento.
- **Figure nuove per tre esercizi storici** che si possono ancora aggiungere a una seduta: *Kick back tricipiti* ([ExRx](https://exrx.net/WeightExercises/Triceps/DBKickback)), *Incline Press manubri*, con la panca inclinata ([ExRx](https://exrx.net/WeightExercises/PectoralClavicular/DBInclineBenchPress)), e *RDL (Romanian Deadlift)* ([ExRx](https://exrx.net/WeightExercises/OlympicLifts/RomanianDeadlift)). Ognuno ha figura, scheda Posizione e scheda tecnica.
- **Varianti con il nome storico.** Esercizi come *Face pull con banda* e *Calf raise* mostrano la figura e la scheda dell'esercizio base, con l'indicazione da quale vengono.
- **Esercizi nuovi dal coach.** Il coach può definire un esercizio nuovo o una variante con l'operazione esercizio, descritta in DATI_E_KPI.md:
  - deve dare nome, gruppo e scheda tecnica, e indicare l'esercizio con la figura giusta da mostrare (come);
  - l'app usa quella figura con la sua scheda Posizione, e annullando la patch tutto torna com'era;
  - se nessuna figura va bene, l'app mostra il testo e il briefing elenca l'esercizio tra quelli senza figura propria;
  - in quel caso la figura dedicata si disegna con lo stesso metodo di questo documento: criteri da una fonte, misura e test.

## Che cosa è cambiato, in breve

- **Braccia che pendono.** Prima erano piegate a circa 140° (rematore, RDL, affondi, bulgarian, hip hinge): sembrava che il peso fosse tenuto a braccia piegate. Ora sono distese.
- **Ginocchia morbide nelle cerniere d'anca.** Rematore, split-stance RDL, hip hinge a una gamba e band row avevano le gambe bloccate a 180° o troppo piegate. Ora sono leggermente flesse (150°-165°), come chiede ExRx ("knees slightly bent").
- **Push-up e floor press.** In basso l'avambraccio ora è verticale e il gomito sta sopra la mano, vicino a 90°. Prima la mano finiva sotto il viso con il gomito chiuso a 45°-50°. I gomiti a 45° dal busto si vedono con lo scorcio dell'omero, cioè la parte del braccio che va verso chi guarda e appare più corta.
- **Shoulder press (manubri e banda).** Ora è vista di fronte, il piano in cui si muovono le braccia. Si leggono manubri ai lati della testa, gomiti sotto i polsi e spinta fino a braccia quasi distese. La versione con manubri resta seduta, con lo schienale.
- **Alzate laterali, reverse fly, Y-T-W.** Il gomito resta piegato di circa 15° e non cambia durante il movimento. In alto arriva all'altezza della spalla e sta più alto del polso, come chiede ExRx. Prima i gomiti erano piegati a 127° e restavano sotto le spalle.
- **Face pull.** Ora è vista di fronte con la miniatura del busto a 45°. A fine corsa i gomiti sono alti, all'altezza delle spalle, e le mani salgono verso la testa (rotazione esterna). Prima si vedeva un manubrio portato al viso con il gomito chiuso.
- **Band pull-apart.** In partenza le braccia sono tese avanti, con una miniatura di lato che le mostra. All'arrivo sono distese a T all'altezza delle spalle. Prima erano incrociate davanti al petto e piegate.
- **French press ed estensioni sopra la testa.** In basso il gomito si piega fino a circa 45°, non a 26°, cioè con il manubrio schiacciato sulla nuca.
- **Box squat.** Il box ora è all'altezza giusta: in basso la coscia è quasi orizzontale (ginocchio a 93°), la tibia quasi verticale e il busto inclinato di 42°. Prima il ginocchio arrivava solo a 120°.
- **Glute bridge e hip thrust.** In alto spalle, anca e ginocchio sono in linea, con le tibie verticali e il ginocchio a circa 90°. Prima nel bridge l'anca restava a 161° e nell'hip thrust il ginocchio era a 114°.
- **Pike push-up.** In alto è una V rovesciata con le braccia distese in linea con il busto (prima i gomiti erano piegati a 112°). In basso le spalle scendono quasi in verticale e il gomito arriva a circa 98°.
- **Bird-dog, dead bug, pullover.** Gamba e braccio che si allungano ora sono distesi davvero. Nel pullover i gomiti sono "quasi distesi e fissi" (circa 158°) per tutto il movimento.
- **Scheda Posizione.** Gli errori tipici (il fantasma rosso) sono stati riscritti per le figure viste di fronte. L'angolo del gomito nello shoulder press ora si misura dalla spalla del braccio, non dal centro del petto.

## Scelte che restano del coach

- **Busto a 45° nel rematore, nel reverse fly, nel face pull e nella Y-T-W.** ExRx indica il busto *vicino all'orizzontale* per rematore e alzate posteriori ([Dumbbell Bent-over Row](https://exrx.net/WeightExercises/BackGeneral/DBBentOverRow), [Dumbbell Rear Lateral Raise](https://exrx.net/WeightExercises/DeltoidPosterior/DBRearLateralRaise)), e per il reverse fly dice che 45° non basta per isolare il deltoide posteriore. La scheda del coach chiede 45°, che è una scelta di protezione per la lombare. Le figure seguono il coach. Se lo vuoi cambiare, va deciso con lui.

## Limiti del disegno

La figura è in 2D. Un arto che va verso chi guarda si vede più corto: per questo gomiti a 45° del push-up, braccia tese avanti del pull-apart e cosce del seduto visto di fronte usano lo scorcio. In questi casi l'angolo misurato sul disegno è un po' più chiuso di quello vero. Per questo il criterio controlla anche quello che l'occhio legge: avambraccio verticale, gomito a terra, gomito all'altezza della spalla.

## Esercizio per esercizio

✗ = fuori dal criterio prima della revisione, ✓ = dentro dopo. I valori sono in gradi per gli angoli e in unità del disegno per le distanze (la testa misura 15 unità).

### Push-up — corretto

| Fase | Criterio | Intervallo | Prima | Dopo | Fonte |
|---|---|---|---|---|---|
| partenza | in alto braccia distese | 165–180 | 174 | 180 ✓ | [1] |
| partenza | in alto mani sotto le spalle (distanza orizzontale) | 0–6 | 2 | 4 ✓ | [1] |
| arrivo | in basso gomito vicino a 90° (visto di lato) | 65–95 | 46 ✗ | 74 ✓ | [2] |
| arrivo | in basso avambraccio verticale | 0–15 | 55 ✗ | 8 ✓ | [2] |
| arrivo | corpo in linea spalla-anca-caviglia | 172–180 | 180 | 180 ✓ | [1] |

### Push-up stretti — già conforme

| Fase | Criterio | Intervallo | Prima | Dopo | Fonte |
|---|---|---|---|---|---|
| arrivo | gomiti stretti: il gomito va indietro, dietro la spalla | 10–30 | 19 | 19 ✓ | [3] |

### Push-up piedi rialzati con banda — corretto

| Fase | Criterio | Intervallo | Prima | Dopo | Fonte |
|---|---|---|---|---|---|
| arrivo | in basso gomito vicino a 90° (visto di lato) | 65–95 | 53 ✗ | 70 ✓ | [2] |
| arrivo | in basso avambraccio verticale | 0–15 | 51 ✗ | 12 ✓ | [2] |

### Floor Press manubri — corretto

| Fase | Criterio | Intervallo | Prima | Dopo | Fonte |
|---|---|---|---|---|---|
| arrivo | in basso il gomito tocca terra | 129–136 | 129 | 131 ✓ | [4] |
| arrivo | in basso avambraccio verticale, manubrio sopra il gomito | 0–12 | 33 ✗ | 0 ✓ | [4] |
| arrivo | in basso gomito vicino a 90° (visto di lato) | 60–95 | 51 ✗ | 72 ✓ | [4] |

### Rematore manubri — corretto

| Fase | Criterio | Intervallo | Prima | Dopo | Fonte |
|---|---|---|---|---|---|
| partenza | ginocchia morbide | 145–170 | 180 ✗ | 157 ✓ | [5] |
| partenza | braccia che pendono distese | 165–180 | 143 ✗ | 177 ✓ | [6] |
| partenza | busto a 45° dalla verticale (scelta del coach) | 40–60 | 52 | 52 ✓ | [3] |
| arrivo | a fine tirata avambraccio verticale | 0–15 | 10 | 1 ✓ | [6] |
| arrivo | a fine tirata gomito tra 80° e 110° | 80–110 | 107 | 100 ✓ | [6] |

### Band row seduto — corretto

| Fase | Criterio | Intervallo | Prima | Dopo | Fonte |
|---|---|---|---|---|---|
| partenza | ginocchia leggermente piegate | 145–170 | 180 ✗ | 160 ✓ | [7] |
| partenza | partenza a braccia distese | 168–180 | 137 ✗ | 179 ✓ | [7] |
| arrivo | mani alla vita, gomito tra 70° e 95° | 70–95 | 61 ✗ | 82 ✓ | [7] |
| arrivo | busto eretto | 0–10 | 2 | 2 ✓ | [7] |

### Rematore al telaio della porta — corretto

| Fase | Criterio | Intervallo | Prima | Dopo | Fonte |
|---|---|---|---|---|---|
| partenza | partenza a braccio disteso | 168–180 | 175 | 175 ✓ | [3] |
| arrivo | a fine tirata gomito tra 65° e 90° | 65–90 | 61 ✗ | 76 ✓ | [3] |
| arrivo | corpo dritto | 175–180 | 180 | 180 ✓ | [3] |

### Band pull-down — corretto

| Fase | Criterio | Intervallo | Prima | Dopo | Fonte |
|---|---|---|---|---|---|
| partenza | braccia tese verso l'ancoraggio | 165–180 | 171 | 180 ✓ | [3] |
| arrivo | gomito sotto la spalla, piegato tra 50° e 80° | 50–80 | 45 ✗ | 62 ✓ | [3] |

### Shoulder Press manubri — corretto

| Fase | Criterio | Intervallo | Prima | Dopo | Fonte |
|---|---|---|---|---|---|
| partenza | in basso gomiti sotto i polsi (avambraccio verticale) | 0–10 | 30 ✗ | 0 ✓ | [8] |
| partenza | in basso gomito tra 70° e 95° | 70–95 | 22 ✗ | 78 ✓ | [8] |
| partenza | in basso manubri ai lati della testa, sopra le spalle | 8–22 | 4 ✗ | 15 ✓ | [8] |
| arrivo | in alto braccia quasi distese | 165–180 | 173 | 172 ✓ | [8] |

### Shoulder press con banda — corretto

| Fase | Criterio | Intervallo | Prima | Dopo | Fonte |
|---|---|---|---|---|---|
| partenza | in basso gomiti sotto i polsi (avambraccio verticale) | 0–10 | 30 ✗ | 0 ✓ | [8] |
| arrivo | in alto braccia quasi distese | 165–180 | 173 | 172 ✓ | [8] |

### Alzate laterali — corretto

| Fase | Criterio | Intervallo | Prima | Dopo | Fonte |
|---|---|---|---|---|---|
| partenza | gomiti appena piegati (10°-30°) | 150–170 | 144 ✗ | 164 ✓ | [9] |
| arrivo | gomiti appena piegati (10°-30°) | 150–170 | 127 ✗ | 162 ✓ | [9] |
| arrivo | gomito all'altezza della spalla | 0–3 | 10 ✗ | 0 ✓ | [9] |
| arrivo | gomito non sotto il polso | 0–10 | -7 ✗ | 6 ✓ | [9] |

### Alzate laterali con banda — corretto

| Fase | Criterio | Intervallo | Prima | Dopo | Fonte |
|---|---|---|---|---|---|
| arrivo | gomito all'altezza della spalla | 0–3 | 10 ✗ | 0 ✓ | [9] |
| arrivo | gomiti appena piegati (10°-30°) | 150–170 | 127 ✗ | 162 ✓ | [9] |

### Reverse Fly — corretto

| Fase | Criterio | Intervallo | Prima | Dopo | Fonte |
|---|---|---|---|---|---|
| arrivo | gomiti piegati di 10°-30°, fissi | 150–170 | 127 ✗ | 162 ✓ | [10] |
| arrivo | gomito all'altezza della spalla | 0–3 | 9 ✗ | 0 ✓ | [10] |
| partenza | manubri che pendono, gomiti appena piegati | 150–170 | 144 ✗ | 164 ✓ | [10] |

### Face pull — corretto

| Fase | Criterio | Intervallo | Prima | Dopo | Fonte |
|---|---|---|---|---|---|
| arrivo | gomiti alti, all'altezza delle spalle | 0–4 | 19 ✗ | 1 ✓ | [11] |
| arrivo | gomito piegato tra 80° e 110°, mani sopra i gomiti | 80–110 | 27 ✗ | 96 ✓ | [12] |
| arrivo | mani piu' in alto dei gomiti (rotazione esterna) | 10–20 | -16 ✗ | 18 ✓ | [11] |

### Band pull-apart — corretto

| Fase | Criterio | Intervallo | Prima | Dopo | Fonte |
|---|---|---|---|---|---|
| arrivo | braccia distese | 170–180 | 121 ✗ | 178 ✓ | [13] |
| arrivo | mani all'altezza delle spalle | 0–4 | 3 | 1 ✓ | [13] |
| partenza | partenza: mani davanti al petto, alla larghezza delle spalle | 0–6 | 6 | 4 ✓ | [13] |

### Y-T-W a busto inclinato — corretto

| Fase | Criterio | Intervallo | Prima | Dopo | Fonte |
|---|---|---|---|---|---|
| Y | Y: braccia distese sopra le spalle | 170–180 | 141 ✗ | 176 ✓ | [10] |
| T | T: braccia distese all'altezza delle spalle | 0–3 | 9 ✗ | 0 ✓ | [10] |
| W | W: gomiti piegati tra 80° e 110° | 80–110 | 50 ✗ | 95 ✓ | [3] |

### French Press — corretto

| Fase | Criterio | Intervallo | Prima | Dopo | Fonte |
|---|---|---|---|---|---|
| arrivo | in basso il gomito si piega fino a 35°-60° | 35–60 | 26 ✗ | 45 ✓ | [14] |
| arrivo | omero verticale, gomiti in alto | 0–15 | 8 | 8 ✓ | [14] |
| partenza | in alto braccia distese | 170–180 | 176 | 176 ✓ | [14] |

### Band tricep extension — corretto

| Fase | Criterio | Intervallo | Prima | Dopo | Fonte |
|---|---|---|---|---|---|
| partenza | in basso il gomito si piega fino a 35°-60° | 35–60 | 26 ✗ | 45 ✓ | [14] |

### Overhead extension 1 braccio — corretto

| Fase | Criterio | Intervallo | Prima | Dopo | Fonte |
|---|---|---|---|---|---|
| arrivo | in basso il gomito si piega fino a 35°-60° | 35–60 | 26 ✗ | 45 ✓ | [15] |

### Curl bicipiti manubri — già conforme

| Fase | Criterio | Intervallo | Prima | Dopo | Fonte |
|---|---|---|---|---|---|
| arrivo | gomito fermo accanto al busto | 0–4 | 1 | 1 ✓ | [3] |

### Band curl bicipiti — già conforme

| Fase | Criterio | Intervallo | Prima | Dopo | Fonte |
|---|---|---|---|---|---|
| arrivo | gomito fermo accanto al busto | 0–4 | 1 | 1 ✓ | [3] |

### Box Squat — corretto

| Fase | Criterio | Intervallo | Prima | Dopo | Fonte |
|---|---|---|---|---|---|
| arrivo | in basso coscia vicina all'orizzontale (ginocchio 80°-105°) | 80–105 | 120 ✗ | 93 ✓ | [16] |
| arrivo | tibia quasi verticale | 0–12 | 4 | 7 ✓ | [17] |
| arrivo | busto inclinato in avanti 30°-50° | 30–50 | 38 | 42 ✓ | [17] |
| partenza | in piedi gambe distese | 170–180 | 180 | 180 ✓ | [16] |

### Box squat alla sedia 3s — corretto

| Fase | Criterio | Intervallo | Prima | Dopo | Fonte |
|---|---|---|---|---|---|
| arrivo | ginocchio 90°-110° sul bordo della sedia | 90–110 | 111 ✗ | 101 ✓ | [16] |
| partenza | braccia distese avanti | 165–180 | 112 ✗ | 177 ✓ | [3] |

### Bulgarian Split Squat manubri — corretto

| Fase | Criterio | Intervallo | Prima | Dopo | Fonte |
|---|---|---|---|---|---|
| arrivo | ginocchio davanti a 80°-100° | 80–100 | 90 | 90 ✓ | [18] |
| arrivo | busto quasi dritto | 0–15 | 8 | 8 ✓ | [18] |
| arrivo | manubri lungo i fianchi, braccia distese | 165–180 | 143 ✗ | 178 ✓ | [18] |

### Affondi indietro manubri — già conforme

| Fase | Criterio | Intervallo | Prima | Dopo | Fonte |
|---|---|---|---|---|---|
| in basso | ginocchio davanti a 80°-100° | 80–100 | 86 | 86 ✓ | [18] |
| in basso | tibia davanti quasi verticale | 0–12 | 7 | 7 ✓ | [18] |
| in basso | busto dritto | 0–15 | 4 | 4 ✓ | [18] |

### Split-stance RDL — corretto

| Fase | Criterio | Intervallo | Prima | Dopo | Fonte |
|---|---|---|---|---|---|
| partenza | ginocchio davanti appena piegato | 150–170 | 180 ✗ | 164 ✓ | [19] |
| arrivo | ginocchio davanti appena piegato e fermo | 145–170 | 180 ✗ | 156 ✓ | [19] |
| arrivo | cerniera d'anca: busto 45°-80° in avanti | 45–80 | 76 | 72 ✓ | [19] |
| arrivo | braccia distese, manubri vicino alla gamba | 165–180 | 134 ✗ | 177 ✓ | [19] |

### Hip hinge una gamba — corretto

| Fase | Criterio | Intervallo | Prima | Dopo | Fonte |
|---|---|---|---|---|---|
| arrivo | ginocchio d'appoggio appena piegato | 145–170 | 139 ✗ | 159 ✓ | [20] |
| arrivo | gamba libera distesa | 170–180 | 156 ✗ | 178 ✓ | [20] |
| arrivo | busto e gamba libera in linea | 160–180 | 169 | 172 ✓ | [20] |

### Glute bridge — corretto

| Fase | Criterio | Intervallo | Prima | Dopo | Fonte |
|---|---|---|---|---|---|
| arrivo | in alto anca distesa: spalle-anca-ginocchio in linea | 170–180 | 161 ✗ | 180 ✓ | [21] |
| arrivo | in alto ginocchio vicino a 90° | 80–100 | 86 | 90 ✓ | [21] |

### Hip thrust con banda — corretto

| Fase | Criterio | Intervallo | Prima | Dopo | Fonte |
|---|---|---|---|---|---|
| arrivo | in alto anca distesa: spalle-anca-ginocchio in linea | 170–180 | 172 | 180 ✓ | [22] |
| arrivo | in alto ginocchio a 80°-100° | 80–100 | 114 ✗ | 93 ✓ | [23] |
| arrivo | in alto tibia verticale | 0–12 | 9 | 6 ✓ | [23] |

### Hip thrust a una gamba — corretto

| Fase | Criterio | Intervallo | Prima | Dopo | Fonte |
|---|---|---|---|---|---|
| arrivo | in alto ginocchio a 80°-100° | 80–100 | 114 ✗ | 93 ✓ | [23] |
| arrivo | gamba libera distesa | 170–180 | 142 ✗ | 180 ✓ | [3] |

### Calf raise monopodalico — già conforme

| Fase | Criterio | Intervallo | Prima | Dopo | Fonte |
|---|---|---|---|---|---|
| arrivo | ginocchio d'appoggio disteso | 170–180 | 176 | 176 ✓ | [3] |

### Pike push-up — corretto

| Fase | Criterio | Intervallo | Prima | Dopo | Fonte |
|---|---|---|---|---|---|
| partenza | in alto braccia distese in linea col busto | 165–180 | 112 ✗ | 175 ✓ | [24] |
| partenza | V rovesciata: anca chiusa, gambe distese | 45–95 | 92 | 64 ✓ | [24] |
| partenza | in alto spalle sopra le mani | 0–6 | 6 | 4 ✓ | [25] |
| arrivo | in basso gomiti sopra le mani, non indietro | 0–8 | 17 ✗ | 5 ✓ | [26] |
| arrivo | in basso avambraccio quasi verticale | 0–20 | 76 ✗ | 17 ✓ | [26] |
| arrivo | in basso la testa arriva vicino al pavimento | 0–6 | 6 | 2 ✓ | [25] |
| arrivo | bacino ancora alto: sopra le mani, non sceso | 75–95 | 88 | 87 ✓ | [25] |

### Kick back tricipiti — figura nuova (4.6.1)

| Fase | Criterio | Intervallo | Prima | Dopo | Fonte |
|---|---|---|---|---|---|
| partenza | omero parallelo al pavimento | 0–12 | — | 3 ✓ | [27] |
| partenza | partenza con il gomito piegato a circa 90° | 80–100 | — | 87 ✓ | [27] |
| arrivo | braccio disteso | 170–180 | — | 180 ✓ | [27] |
| arrivo | il gomito non scende: omero ancora parallelo | 0–12 | — | 3 ✓ | [28] |
| partenza | busto quasi orizzontale | 65–95 | — | 80 ✓ | [27] |

### Incline Press manubri — figura nuova (4.6.1)

| Fase | Criterio | Intervallo | Prima | Dopo | Fonte |
|---|---|---|---|---|---|
| partenza | in basso avambraccio verticale, manubrio sopra il gomito | 0–12 | — | 0 ✓ | [29] |
| partenza | in basso manubri ai lati della parte alta del petto | 4–16 | — | 9 ✓ | [29] |
| arrivo | in alto braccia distese sopra le spalle | 165–180 | — | 177 ✓ | [29] |
| arrivo | in alto mani sopra le spalle (spinta verticale) | 0–6 | — | 1 ✓ | [29] |
| partenza | panca inclinata: busto 40°-60° dalla verticale | 40–60 | — | 50 ✓ | [29] |

### RDL (Romanian Deadlift) — figura nuova (4.6.1)

| Fase | Criterio | Intervallo | Prima | Dopo | Fonte |
|---|---|---|---|---|---|
| partenza | in piedi ginocchia appena piegate | 150–170 | — | 162 ✓ | [19] |
| arrivo | ginocchia appena piegate e ferme | 145–170 | — | 155 ✓ | [19] |
| arrivo | cerniera d'anca: busto 45°-80° in avanti | 45–80 | — | 72 ✓ | [19] |
| arrivo | braccia distese, manubri vicino alle gambe | 165–180 | — | 177 ✓ | [19] |

### Plank — già conforme

| Fase | Criterio | Intervallo | Prima | Dopo | Fonte |
|---|---|---|---|---|---|
| partenza | gomiti sotto le spalle | 0–4 | 1 | 1 ✓ | [3] |
| partenza | corpo in linea | 172–180 | 180 | 180 ✓ | [3] |

### Bird-dog con pausa 3s — corretto

| Fase | Criterio | Intervallo | Prima | Dopo | Fonte |
|---|---|---|---|---|---|
| arrivo | gamba distesa | 170–180 | 141 ✗ | 176 ✓ | [3] |
| arrivo | braccio disteso in linea col busto | 170–180 | 166 ✗ | 180 ✓ | [3] |
| arrivo | il piede non sale sopra l'anca | -3–6 | -4 ✗ | -1 ✓ | [3] |

### Cat-cow — già conforme

| Fase | Criterio | Intervallo | Prima | Dopo | Fonte |
|---|---|---|---|---|---|
| partenza | mani sotto le spalle | 0–4 | 1 | 1 ✓ | [3] |
| partenza | ginocchia sotto le anche | 0–4 | 0 | 0 ✓ | [3] |

### Dead bug — corretto

| Fase | Criterio | Intervallo | Prima | Dopo | Fonte |
|---|---|---|---|---|---|
| partenza | anche e ginocchia a 90° | 80–100 | 90 | 90 ✓ | [3] |
| arrivo | gamba che si allunga distesa | 160–180 | 165 | 165 ✓ | [3] |
| arrivo | braccio che si allunga disteso | 170–180 | 141 ✗ | 179 ✓ | [3] |

### Pullover manubrio — corretto

| Fase | Criterio | Intervallo | Prima | Dopo | Fonte |
|---|---|---|---|---|---|
| arrivo | gomiti quasi distesi e fissi | 150–168 | 137 ✗ | 158 ✓ | [3] |
| partenza | gomiti quasi distesi e fissi | 150–168 | 169 ✗ | 158 ✓ | [3] |

## Fonti

1. [ExRx: Push-up](https://exrx.net/WeightExercises/PectoralSternal/BWPushup)
2. [Tom's Guide: errori comuni nel push-up (gomito a 90°, gomiti a 45° dal busto)](https://www.tomsguide.com/wellness/fitness/im-a-personal-trainer-these-are-the-3-most-common-push-up-mistakes-i-see-and-how-to-fix-them)
3. Scheda tecnica del coach nell'app (js/01-dati.js)
4. [ExRx: Barbell Floor Press (si scende finche' i tricipiti appoggiano a terra)](https://exrx.net/WeightExercises/PectoralSternal/BBFloorPress)
5. [ExRx: Barbell Bent-over Row (ginocchia leggermente piegate, schiena dritta)](https://exrx.net/WeightExercises/BackGeneral/BBBentOverRow)
6. [ExRx: Dumbbell Bent-over Row (tira fino al costato, poi braccio disteso)](https://exrx.net/WeightExercises/BackGeneral/DBBentOverRow)
7. [ExRx: Cable Straight Back Seated Row](https://exrx.net/WeightExercises/BackGeneral/CBStraightBackSeatedRow)
8. [ExRx: Dumbbell Shoulder Press](https://exrx.net/WeightExercises/DeltoidAnterior/DBShoulderPress)
9. [ExRx: Dumbbell Lateral Raise](https://exrx.net/WeightExercises/DeltoidLateral/DBLateralRaise)
10. [ExRx: Dumbbell Rear Lateral Raise](https://exrx.net/WeightExercises/DeltoidPosterior/DBRearLateralRaise)
11. [StrengthLog: Face Pull](https://www.strengthlog.com/face-pull/)
12. [Major Fitness: come fare il face pull (gomito tra 45° e 90°, gomiti alti)](https://www.majorfitness.com/blogs/training-tips/how-to-do-the-face-pull)
13. [StrengthLog: Band Pull-Apart](https://www.strengthlog.com/?p=2637)
14. [ExRx: Dumbbell Triceps Extension](https://exrx.net/WeightExercises/Triceps/DBTriExt)
15. [ExRx: Dumbbell One Arm Triceps Extension](https://exrx.net/WeightExercises/Triceps/DBOneArmTriExt)
16. [ExRx: Squat](https://exrx.net/WeightExercises/Quadriceps/BWSquat)
17. [ExRx: Barbell Box Squat](https://exrx.net/WeightExercises/GluteusMaximus/BBBoxSquat)
18. [ExRx: Dumbbell Split Squat](https://exrx.net/WeightExercises/GluteusMaximus/DBSplitSquat)
19. [ExRx: Romanian Deadlift](https://exrx.net/WeightExercises/OlympicLifts/RomanianDeadlift)
20. [ExRx: Dumbbell Single Leg Stiff-leg Deadlift](https://exrx.net/WeightExercises/GluteusMaximus/DBSingleLegStiffLegDeadlift)
21. [ExRx: Single Leg Hip Bridge](https://exrx.net/WeightExercises/GluteusMaximus/BWLyingHipExtension)
22. [ExRx: Barbell Hip Thrust](https://exrx.net/WeightExercises/GluteusMaximus/BBHipThrust)
23. [The Barbell Physio: varianti di hip thrust (tibie verticali e ginocchia a 90° in alto)](https://thebarbellphysio.com/the-best-hip-thrust-variations-for-stronger-glutes/)
24. [ExRx: Pike Push-up](https://exrx.net/WeightExercises/PectoralClavicular/BWPikePushup)
25. [Liftosaur: Bodyweight Pike Push Up (bacino alto sopra le mani, la testa scende fino a sfiorare il pavimento)](https://www.liftosaur.com/exercises/bodyweight-pike-pushup)
26. [Caliverse: Pike Push Up (gomiti sopra le mani, non indietro)](https://www.caliverse.app/exercises/pike-push-up-17)
27. [ExRx: Dumbbell Kickback](https://exrx.net/WeightExercises/Triceps/DBKickback)
28. [ExRx: errori comuni (nel kickback il gomito che scende riduce il movimento utile)](https://exrx.net/Kinesiology/Errors)
29. [ExRx: Dumbbell Incline Bench Press](https://exrx.net/WeightExercises/PectoralClavicular/DBInclineBenchPress)
