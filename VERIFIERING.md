# Cosmos Explorer 0.6.1 – planetsystemens värdstjärnor, 2026-11-04

98/98 enhetstester, 12/12 webbläsarscenarier (Chrome/SwiftShader, 3,3 minuter) och TypeScript/Vite-produktionsbygget passerar. TRAPPIST-1 e har följts hela vägen genom ordinarie stjärnsökning, stjärnresa, systemval och planetresa; närbilden är visuellt granskad. Planetbild och banfas är tydligt illustrativa.

Grundorsaken var saknade namn/alias och en oaktiverad systemkoppling, inte ett ljusstyrkefilter: TRAPPIST-1:s Gaia DR3-ID finns redan på rang 480 i båda stora katalogerna. G=15,622554, position och epok behålls. Start-/offlinekatalogen kompletteras med samma källbelagda värd. Sökningen använder samma funktion och resultattyp för stjärn- och planetnamn. Gemensamma kanoniska värd-ID:n länkar TRAPPIST-1 b–h, Proxima b/d och solsystemet.

Nya tester kontrollerar namnavarianter, planetalias, dokumenterade katalogidentifierare, nätfel och egen import, värdgarantin för alla aktiva system, unikhet i 10k/100k, oförändrad Gaia-astrometri/fotometri, samma koordinatomvandling och resemodell samt korrekt planetval. Tidigare tester för Sirius, navigering, paus, mobilgränssnitt, solsystem och prestanda passerar. Startkatalogens förväntade antal uppdaterades från 158 till 159 objekt; offlinebaskatalogen från 10 till 11. De stora katalogernas objektantal är oförändrade.

Källor: SIMBAD-korsidentifierare, befintligt Gaia DR3-uttag och NASA Exoplanet Archives pscomppars (hämtat 2026-11-04). Kontrollsummor och reproducerbar import finns i data/planets och scripts. Offlineregenerering verifierad. Exoplaneternas fas/orientering är illustrativa; Proximas radier är härledda och massor m sin i. Befintlig stjärnkamera, animation, avståndsmatematik och stjärnrendering är oförändrade. Bygget har fortsatt en stor JS-fil (cirka 1,26 MB / 354 kB gzip).

---

# Cosmos Explorer 0.6 – solsystemleverans, 2026-11-03

83 av 83 enhetstester, 9 av 9 Chrome-scenarier och produktionsbygget passerar. Den slutliga webbläsaromgången tog 1,5 minut. Testerna omfattar åtta källbelagda planeter, värdstjärnans identitet, Keplerbanornas period och avståndsgränser, tidskontroll, okända värden, fysisk radie, upprepade resor och orientering. Webbläsaren verifierar resa till Jorden, paus/återupptagning, mobil återgång, bevarad stjärnkamera (tolerans 1e-10), återöppning och avbruten resa till Mars. Samtliga tidigare stjärnscenarier passerar, inklusive Sirius och 100k-katalogen.

Desktop och mobil närbild granskades visuellt. Under utvecklingen rättades en skrollad tillbaka-knapp och ett DOM-fel i etikettportaler; etiketter använder nu vanliga skärmöverlägg med överlappningskontroll. En testkörning kunde inte starta Chrome; den slutliga kompletta omkörningen passerade. Importen återskapades från sparade Horizons-svar.

**Leveransen omfattar solsystemet.** TRAPPIST-1/Proximas lokala vyer återstår. Nio bekräftade exoplanetrader från NASA Exoplanet Archive sparas endast som underlag. Keplerbanor är tvåkroppsapproximationer vid JPL-epoken 2026-11-03 TDB. Planetkartornas orientering och belysning är illustrativa; Jordens karta är topografisk. Saturnus ringar, fysisk rotation och störningar från andra kroppar ingår inte. Planetresans blick är låst; stjärnresans fria blick finns kvar.

Stjärnkartans senaste SwiftShader-kontroll (1280×720, DPR 1, efter GC): 10k median 34,0 ms / P95 39,8 ms / JS-heap 35,8 MB; 100k median 57,6 ms / P95 64,8 ms / JS-heap 95,4 MB. Två draw calls i båda fallen. Detta är bildruteintervall i mjukvarurendering, inte hårdvaru-GPU-tid och inte prestandamätning av planetsystemvyn. Mätningen finns i PERFORMANCE.json under solarSystem06. Bygget varnar fortsatt för en stor JS-fil, cirka 1,24 MB (352 kB gzip).

---

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
