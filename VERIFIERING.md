# Cosmos Explorer 0.5 – verifiering 2026-11-03

## Resultat

59 av 59 enhetstester och 6 av 6 Chrome-scenarier passerar. TypeScript och Vite-produktionsbygget passerar. Desktop-närbild och mobilens Upptäck-panel har granskats visuellt. Kamera, paus, återupptagning, fri blick, avbrott, lägesbyten och lokal rotation ingår i kontrollen.

## Funktioner och data

Upptäck har sex kategorier och tio poster per sida. Skenbar magnitud sorteras stigande, temperatur och källbelagd radie fallande; närhet använder verkligt 3D-avstånd. Saknade värden filtreras bort. Solen undantas från upptäcktslistorna.

100 000 unika verkliga Gaia DR3-källor finns kvar oförändrade, med ICRS/J2016.0 och reproducerbart importskript. 10 000 laddas normalt. Temperatur är Gaia GSP-Phot-modellvärden. Planetvärdar är ett begränsat NASA-verifierat Proxima b/d-urval. Radier saknas i det medföljande Gaia-uttaget: Största visar därför saknat underlag. JSON-import av radie kräver källa. IAU 2015 B3 ger nominell solradie; se README för källänkar.

Närbilder använder källbelagd radie när den finns, annars tydligt märkt illustrativ 1 solradie. Vinkelstorlek beräknas med 2 asin(R/d). Mjuk punkt–sfärövergång, svag korona och schematisk temperaturfärg är visuella approximationer. Ankomst fyller 44 procent av det smalare synfältet och håller kameran utanför ytan. Logaritmisk avståndsprofil kombineras med femtegradig acceleration/inbromsning i befintlig resemodell. Närbilder använder kamerarelativa koordinater och ett lokalt rumsindex; högst åtta sfärer samtidigt.

## Prestanda

Chrome/SwiftShader, 1280 × 720, DPR 1, statisk standardvy, cirka fem sekunder per katalog. Detta mäter bildruteintervall, inte isolerad GPU-renderingstid. Siffror från olika körningar varierar med datorbelastningen.

| Källor | Median bildruta | P95 | JS-heap | GPU-punktattribut | Närsökning | Upprepad |
|---:|---:|---:|---:|---:|---:|---:|
| 10 000 | 29,8 ms | 34,7 ms | 45,0 MB | 0,32 MB | 2,8 ms | 0,1 ms |
| 100 000 | 55,7 ms | 59,3 ms | 90,9 MB | 3,20 MB | 44,4 ms | 0,7 ms |

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
