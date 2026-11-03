# Cosmos Explorer 0.5 – verifiering 2026-11-03

## Resultat

78 av 78 enhetstester och 8 av 8 Chrome-scenarier passerar. TypeScript och Vite-produktionsbygget passerar. Desktop-närbild och mobilens Upptäck-panel har granskats visuellt. Kamera, paus, återupptagning, fri blick, avbrott, lägesbyten och lokal rotation ingår i kontrollen.

## Senaste korrigering: Sirius och baskatalogen

Sirius A saknades i Gaia-urvalet; endast Proxima/Barnard hade vanliga namn och alias indexerades inte. Ofiltrerad Gaia-fråga och SIMBAD-korsidentifierare skiljer A från B. Sirius B (Gaia DR3 2947050466531873024) har RUWE 2,4190555 och passerar inte importgränsen 1,4. Sökningen omfattade redan alla inlästa objekt; problemet var datatäckning och namn/alias.

Nio SIMBAD-källbelagda stjärnor plus solen bildar en permanent baskatalog. Sju tillkommer i 10k/100k; Proxima/Barnard kompletteras utan dubbletter. Sirius A ligger 8,60094 ljusår bort enligt parallax 379,21 ± 1,58 mas. HIP/HD/Gaia-identiteter används för dubblettkontroll, aldrig närhet. Alpha Centauri A/B och Sirius A/B hålls separata. Grekiska Bayerbokstäver, alf/bet, skiftläge, accenter och separatorer normaliseras. Kända stjärnor finns även vid nätfel och egen import.

Nya tester täcker nio Sirius-sökvarianter, avstånd/epok, hela 10k/100k-indexet, dubbletter, komponenter, motstridiga alias, Gaia-prioritet, resa till Sirius och nätfel. Alla tidigare navigeringsscenarier passerar. Kamera och rendering är oförändrade. Baskatalogen har återskapats från sparad CSV utan nätåtkomst. Närbild av Sirius har granskats.

Källunderlag: data/known-stars-simbad.csv, known-stars-metadata.json och sirius-catalog-audit.json. Se README för referenser och reproduktionskommandon. SIMBAD-positioner är ICRS/J2000.0, bevarade Gaia-positioner J2016.0; ingen egenrörelsepropagering görs. Övriga kända namn utanför baskatalogen återstår att korsmatcha. Okända G-magnituder/radier fylls inte med antagna mätvärden.

## Funktioner och data

Upptäck har sex kategorier och tio poster per sida. Skenbar magnitud sorteras stigande, temperatur och källbelagd radie fallande; närhet använder verkligt 3D-avstånd. Saknade värden filtreras bort. Solen undantas från upptäcktslistorna.

100 000 unika verkliga Gaia DR3-källor finns kvar oförändrade, med ICRS/J2016.0 och reproducerbart importskript. 10 000 laddas normalt. Temperatur är Gaia GSP-Phot-modellvärden. Planetvärdar är ett begränsat NASA-verifierat Proxima b/d-urval. Radier saknas i det medföljande Gaia-uttaget: Största visar därför saknat underlag. JSON-import av radie kräver källa. IAU 2015 B3 ger nominell solradie; se README för källänkar.

Närbilder använder källbelagd radie när den finns, annars tydligt märkt illustrativ 1 solradie. Vinkelstorlek beräknas med 2 asin(R/d). Mjuk punkt–sfärövergång, svag korona och schematisk temperaturfärg är visuella approximationer. Ankomst fyller 44 procent av det smalare synfältet och håller kameran utanför ytan. Logaritmisk avståndsprofil kombineras med femtegradig acceleration/inbromsning i befintlig resemodell. Närbilder använder kamerarelativa koordinater och ett lokalt rumsindex; högst åtta sfärer samtidigt.

## Prestanda

Chrome/SwiftShader, 1280 × 720, DPR 1, statisk standardvy, cirka fem sekunder per katalog. Detta mäter bildruteintervall, inte isolerad GPU-renderingstid. Siffror från olika körningar varierar med datorbelastningen.

| Källor | Median bildruta | P95 | JS-heap | GPU-punktattribut | Närsökning | Upprepad |
|---:|---:|---:|---:|---:|---:|---:|
| 10 000 + 7 | 31.7 ms | 42.5 ms | 45.6 MB | 0.32 MB | 3.3 ms | 0.1 ms |
| 100 000 + 7 | 57.3 ms | 65.6 ms | 90.4 MB | 3.20 MB | 47.1 ms | 0.6 ms |

Två ritningsanrop i standardvyn. JS-heap mäts efter begärd garbage collection och är inte total processminne; attributmåttet inkluderar inte drivrutin eller framebuffer. Närbilder kräver ytterligare geometri/anrop när de visas. Hårdvaru-GPU, Safari och fysisk mobil är inte verifierade. Rådata och tidigare körningar finns i PERFORMANCE.json.

## Täckning och begränsningar

Enhetstester: verkliga 10k/100k-binärkataloger, ID-precision, koordinater, sökning, upptäcktskategorier, saknade data, importerad radie, vinkeldiameter, övertoningskurva, ankomst vid olika bildformat, närindex, ytskydd, siktning på små avstånd och upprepade resor mellan olika stjärnor.

Chrome: Upptäck/paginering/tom radiekategori/planetfilter, Visa/Res dit, 10-sekunders närankomst, siktning, lokal rotation, mobil utan horisontell överströmning, 20-sekunders standard, paus/fri blick/återupptagning/avbrott, lägesbyte, manuell rörelse/stopp, stjärnval, 10k/100k-byte och bevarad katalog vid HTTP 503. Inga rapporterade shaderfel i de kontrollerade scenarierna.

Yta och korona är illustrationer, inte observationer. Exoplanet- och radietäckningen är ofullständig. Ingen relativistisk fysik, kontinuerlig kollisionssimulering eller hinderundvikande färdväg ingår. Ytskyddet gäller visade kamerapositioner; hög hastighet kan passera en stjärna mellan bildrutor. Manuellt ändrad blick bevaras även vid ankomst. Ankomstens synfältsanpassning beräknas vid start, inte på nytt vid fönsterändring under resan. Vite varnar fortfarande för ett JavaScript-paket på cirka 1,22 MB (345 kB gzip).

## Reproducera

```sh
npm install
npm test
npm run build
npm run test:e2e
```

Google Chrome krävs för webbläsartester. Katalogen kan återimporteras med `python3 scripts/import-gaia.py` (Python 3 och curl).


## Resepanel och avståndsformat – 2026-11-03

Slutkörning: 78 enhetstester, åtta webbläsarscenarier och produktionsbygget passerar. En tidigare webbläsarkörning fick tidsavbrott; hela sviten kördes om och passerade. Desktop- och mobilbilder av Sirius ankomst har granskats.

Gemensam svensk avståndsformatering: ljusår från 1 ljusår, AU från 0,1 AU, annars kilometer. Enhet väljs före avrundning. Positivt avstånd under en kilometer visas som < 1 km, exakt noll som 0 km. Ingen exponentnotation används. Gränsfall, mycket små/stora värden och svenska decimal-/tusentalsseparatorer ingår i testerna.

Resepanelen visar destination, status, procent av aktiv restid, återstående avstånd till ankomstpunkt och aktuellt centrumavstånd. Procenten fryser under paus; 100 procent visas först vid ankomst. En kort hjälptext skiljer stoppunkten utanför ytan från centrum. Kontroller ligger på egen rad. Desktop-kortet ersätter tillfälligt informationspanelen till höger; mobilkortet ligger nederst. Kamerakod och ankomstformel är oförändrade.

Sirius A saknar verifierad radie i den lokala katalogen: illustrativ 1 solradie märks tydligt. Tester vid olika bildformat verifierar att ankomstpunkten ligger utanför denna radie och anpassas efter synfältet. Desktop-testet visar cirka 3 318 885 km till centrum vid ankomst och 0 km kvar till stoppunkten. Detta är avståndet för den illustrativa modellen, inte en uppmätt Sirius-radie. Stjärnans verkliga position ändras inte. Befintlig begränsning kvarstår: synfältsanpassningen beräknas vid resans start.
