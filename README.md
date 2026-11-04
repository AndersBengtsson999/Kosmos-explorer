# Cosmos Explorer 0.4

Körbar, lokal 3D-stjärnkarta med React, TypeScript, Vite, Three.js / React Three Fiber, Zustand och Vitest. Svenskt responsivt gränssnitt. Kräver Node.js 22.12+ och en modern webbläsare med WebGL.

## Starta

```sh
npm install
npm run dev
```

Öppna adressen som Vite skriver ut. Verifiera med `npm test` och `npm run build`. Bygget hamnar i `dist/` och kan serveras som statiska filer. Inga konton eller API-nycklar behövs. Stjärndata ingår lokalt; typsnitten har systemfallback.

## Användning

- Kartläge: dra för rotation, skrolla/nyp för zoom, högerdra/två fingrar för panorering.
- Klicka på stjärna eller sökresultat för information. Dubbelklicka eller tryck **Res till stjärnan** för mjuk kamerafärd. **Till solen** återgår till origo.
- Sök efter namn eller komplett Gaia-ID. De flesta källorna har katalogbeteckningar, inte vardagsnamn.
- Rymdskepp: WASD framåt/bakåt/sidledes, Q/E ned/upp. Dra med mus eller finger för att titta. Reglera hastighet med reglaget. Pekknappar ger framåt/bakåt/sidledes och höjdled på mobil.
- Flygningen är en förenklad kameraoperation i ljusår per verklig sekund; ingen relativitet, acceleration, gravitation eller kollisionsmodell. Kamerafärder till mål har ingen fysisk restid.
- Informationspanelen visar avstånd från solen och kameran, RA, deklination, parallax med mätosäkerhet, G-magnitud och epok. Kamerakoordinater visas längst ned.

## Verifierad katalog och proveniens

Den äldre startkatalogen innehåller 150 källor från **ESA Gaia DR3**, hämtade 2026-11-01 via [ARI Heidelberg TAP](https://gaia.ari.uni-heidelberg.de/tap.html). ESA:s primära TAP svarade HTTP 503, varefter universitetets Gaia-spegel användes. Ursprungligt, oförändrat svar: `data/gaia-dr3.csv`. Lokal appkatalog: `src/data/stars.json`. Konverteringen kan reproduceras med `python3 scripts/convert-catalog.py` (endast standardbibliotek).

Exakt ADQL-fråga, anropad mot `https://gaia.ari.uni-heidelberg.de/tap/sync` med REQUEST=doQuery, LANG=ADQL, FORMAT=csv:

```sql
SELECT TOP 150 designation,ra,dec,parallax,parallax_error,
       phot_g_mean_mag,bp_rp,ref_epoch
FROM gaiadr3.gaia_source
WHERE parallax > 40 AND parallax_over_error > 20 AND ruwe < 1.4
ORDER BY parallax DESC
```

Det är ett kvalitetsfiltrerat urval, inte en komplett lista över närmaste stjärnor. Ljusstarka objekt och multipla system kan saknas. Inga positioner eller fotometriska värden har hittats på. Namnkopplingar: [Proxima Centauri i SIMBAD](https://simbad.cds.unistra.fr/simbad/sim-id?Ident=Proxima+Cen), Gaia DR3 5853498713190525696, och [Barnards stjärna i SIMBAD](https://simbad.u-strasbg.fr/simbad/sim-basic?Ident=Barnard%27s+Star), Gaia DR3 4472832130942575872.

### Koordinater och visuell skala

ICRS, katalogens referensepok **J2016.0**. Se [Gaia DR3 metadata](https://gaia.aip.de/metadata/gaiadr3/). Positionerna är statiska; egenrörelse och radiell hastighet har inte propag­erats till dagens datum. Solen ligger vid (0,0,0) som approximation av solsystemets barycentrum på ljusårsskalan.

Avstånd r = 1000 / parallax_mas × 3.261563777 ljusår. Ingen parallaxnollpunktskorrektion eller Bayesiansk avståndsskattning görs. Kvalitetsgränsen parallax_over_error > 20 begränsar den relativa formella osäkerheten till <5 %, men eliminerar inte systematik.

ICRS kartesiskt: X = r cos(dec) cos(ra), Y = r cos(dec) sin(ra), Z = r sin(dec). Three.js visar (X,Z,−Y), ett högerhänt system med nord uppåt. En renderingsenhet är ett ljusår; rutnätets steg är fem ljusår. Markörernas radier är symboliska och förstärkta för synlighet. Färgklasser från BP−RP ger endast en ungefärlig visuell färg, inte kalibrerad spektral återgivning; okänd färg visas gråvit. Solens markör är schematiskt varmvit. Inga fiktiva bakgrundsstjärnor läggs till.

### Attribution

This work has made use of data from the European Space Agency (ESA) mission Gaia (https://www.cosmos.esa.int/gaia), processed by the Gaia Data Processing and Analysis Consortium (DPAC, https://www.cosmos.esa.int/web/gaia/dpac/consortium). Funding for the DPAC has been provided by national institutions, in particular the institutions participating in the Gaia Multilateral Agreement.

## JSON-import

Import ersätter katalogen för den aktuella sessionen och bevarar solen. Ladda om sidan för att återställa standardkatalogen. Max 80 MB och 100 000 stjärnor. Fel rapporteras utan att befintlig katalog ändras. Exempel med verkliga data:

```json
[
  {
    "id": "Gaia DR3 5853498713190525696",
    "name": "Proxima Centauri",
    "ra": 217.39232147200883,
    "dec": -62.67607511676666,
    "parallax": 768.0665391873573,
    "parallaxError": 0.049872905,
    "mag": 8.984749,
    "bpRp": 3.8045802,
    "epoch": 2016,
    "source": "Gaia DR3"
  }
]
```

RA/dec i grader, parallax och parallaxError i mas. `mag`, `bpRp` och `parallaxError` får vara null. ID måste vara unikt; `sun` är reserverat. RA: [0,360), dec: [−90,90], parallax ≥0.1 mas, epok 1800–2200. Position beräknas alltid av appen. Importens mätvärden och källpåståenden kan inte verifieras automatiskt; användaren ansvarar för proveniens. Använd ICRS-data och dokumentera epoken i varje rad.

## Arkitektur

- `src/data`: mätdata, typer och strikt importvalidering.
- `src/math`: koordinatomvandling, ljusår och färgklasser.
- `src/rendering`: R3F-scen, objektval, etiketter och WebGL-fallback.
- `src/navigation`: kamera, orbit-kontroller och mjuka målfärder.
- `src/simulation`: normaliserad flygrörelse med begränsning av tidssteg.
- `src/state.ts`: Zustand-tillstånd, katalog, destination och telemetri.
- `src/ui`: responsiva paneler, sökning, import och kontroller.
- `src/core.test.ts`: koordinater, dataintegritet, ogiltiga importer, flygning och tillståndsövergångar.

## Begränsningar

Ingen relativitet, stjärnutveckling, planetsystem, egenrörelse eller beständig lagring. Katalogen är ett urval. Mätosäkerheter visas men visualiseras inte som volymer. Hastighetsreglaget anger vald manuell hastighet. Faktisk hastighet visas separat; destinationsfärder använder vald restid. Vid mycket stora importer används en mesh per stjärna och prestandan kan minska. WebGL-fel ger ett meddelande medan katalogpanelen förblir tillgänglig. Mobil styrs med pekdrag och sex riktningsknappar.

## Rymdnavigering

- Resor tar **20 sekunder** som standard. Välj 10, 20, 40 eller 60 sekunder i stjärnans informationspanel. Inställningen gäller nästa resa.
- Under färd visas namn, återstående väg till ankomstpunkten, aktuellt avstånd till stjärnan och en diskret förloppsindikator. Ankomst sker 3 ljusår från stjärnan och bekräftas med ett meddelande.
- **Pausa / Återuppta** behåller position, resväg och tidsförlopp. **Avbryt resa** eller Escape lämnar kameran på aktuell plats.
- Dra för att titta omkring under färd, även medan resan är pausad. Blicken återställs inte automatiskt. **Rikta mot destination** vrider mjukt tillbaka utan att ändra position eller resväg.
- Utan manuell blick är kameran riktad mot stjärnan vid ankomst. Om användaren har tittat bort bevaras det valet även vid ankomst; rikta-knappen finns kvar.
- I rymdskeppsläge visar **BLICK** kamerans riktning och **FÄRD** den verkliga rörelseriktningen och hastigheten. Sidorörelse ger alltså en annan färdriktning än blick. Stillastående visas uttryckligen. RA/Dec avser ICRS, omräknat från renderingsaxlarna.
- Siktet visar skärmens mitt. Texten framför dig anger den närmaste katalogstjärnan inom 12° från siktet; tomt synfält rapporteras utan att någon stjärna hittas på.
- Destinationen markeras med en diamant när den syns och en pil när den ligger utanför synfältet. Bakom kameran anges särskilt. Under automatisk resa avser indikatorn resans mål även om en annan katalogpost väljs.
- **Stanna helt** eller mellanslag nollställer manuell hastighet och rensar inmatning. Under automatisk resa pausar stoppkommandot resan. Reglaget kan ställas på noll. WASD och Q/E anger kamerarelativ manuell rörelse; släppta tangenter ger stillastående, utan tröghet.
- Sidopaneler döljs under resa och i rymdskeppsläge. **Välj stjärna** öppnar dem igen. **Avståndsskala** visar ett rutnät med 5 ljusår per ruta kring solen; **ICRS-axlar** visar X mot RA 0°, Y mot RA 90° och Z mot nord. Referenserna är förankrade i solsystemets origo och kan hamna utanför vyn vid fjärran positioner.

### Gemensam navigeringsmodell

`Navigation` samordnar ömsesidigt exklusiva ägare för förflyttning: `CameraJourney`, manuell rörelse eller OrbitControls. `CameraJourney` hanterar endast position och aktiv restid. `CameraAim` hanterar mjuk orientering; manuell blick avbryter endast orienteringshjälpen. OrbitControls uppdateras inte under resa eller aktiv riktningshjälp. Lägesbyte under resa ändrar inte resan eller blickriktningen.

Resvägen använder samma världssystem (X,Z,−Y) i ljusår som katalogens positioner. En femtegradskurva, smootherstep, ger mjuk acceleration och inbromsning med noll hastighet och acceleration vid ändpunkterna. Blicken använder separat quaternion-slerp. Resans slutpunkt ligger på inflygningssidan av stjärnan. Sammanfallande positioner och polriktningar hanteras särskilt. Inga extra stjärnor skapas.

Tiden mäts i aktiva sekunder och är oberoende av bildfrekvens. Dold flik pausar automatiskt en resa; användaren återupptar den. En mycket lång renderingsblockering i synlig flik kan ge ett större positionssteg när renderingen fortsätter. Det finns ingen fysisk kollisionsmodell eller ruttplanering runt andra stjärnmarkörer. Manuell blick har företräde framför automatisk riktning vid ankomst. Flygningen är inte relativistisk.

### Verifiera

`npm test` kör 45 enhetstester. `npm run test:e2e` kör fem Chrome-scenarier för tidsval, resa, paus, fri blick, återupptagning, avbrott, lägesbyte, ankomst, riktning, stopp och mobilreferenser. Testservern använder port 5175 med filbevakning avstängd; Google Chrome måste vara installerad. `npm run build` gör TypeScript-kontroll och produktionsbygge.

## Levande universum – 0.4

**100 000 verkliga Gaia DR3-källor** är inkluderade plus solen som origo. En snabb lokal startkatalog med 150 källor visas omedelbart; **10 000** laddas därefter i en Web Worker. Under *Visning och katalog* kan man välja **100 000**. Standardladdningen hämtar inte 100k-filen. Misslyckad laddning visar ett felmeddelande och bevarar fungerande data. Egen JSON-import avbryter eventuell bakgrundsladdning så att den inte kan skriva över användarens katalog.

### Reproducerbara data

Kör `python3 scripts/import-gaia.py` (Python-standardbibliotek och curl med certifikatkontroll). Skriptet provar ESA:s TAP först och ARI Heidelberg som reserv. Den levererade katalogen hämtades **2026-11-02 direkt från ESA** med:

```sql
SELECT TOP 100000 source_id,ra,dec,parallax,parallax_error,
       phot_g_mean_mag,bp_rp,teff_gspphot
FROM gaiadr3.gaia_source
WHERE parallax > 5 AND parallax_over_error > 20 AND ruwe < 1.4
ORDER BY parallax DESC, source_id ASC
```

- Originalsvaret finns i `data/gaia-dr3-100k.csv` (11 032 477 byte).
- `public/catalog/metadata.json` innehåller exakt fråga, endpoint, tid, schema, enheter och SHA-256 för originalsvaret.
- `public/catalog/gaia-10000.bin`: 640 000 byte. `gaia-100000.bin`: 6 400 000 byte.
- Varje post är 64 byte, little-endian: uint64 Gaia-ID och sju float64-värden i ordningen RA, Dec, parallax, parallaxfel, G-magnitud, BP−RP, temperatur. NaN betyder saknat värde. ID konverteras via BigInt, aldrig via JavaScript Number.
- ICRS, referensepok **J2016.0**, statiska positioner. Parallaxavstånd utan nollpunktskorrektion. Urvalet sträcker sig cirka **4,25–239,76 ljusår** och är kvalitetsfiltrerat, inte komplett.
- Alla 100 000 poster har astrometri i detta urval; **28 894** har GSP-Phot-temperatur. Temperatur är modellskattad från BP/RP-spektra: [Gaia-datamodellen](https://gaia.aip.de/metadata/gaiadr3/gaia_source/).

### Rendering och val

Ett GPU-punktmoln använder en BufferGeometry och en ShaderMaterial för hela katalogen. Position, färg och magnitud upptar 28 byte per källa i GPU-attribut. Punktstorleken anpassas efter avstånd och G-magnitud och begränsas till 1–6 CSS-pixlar, så att stjärnor inte blir stora klot vid inzoomning. Färg kommer från samma schematiska BP−RP-klasser som tidigare. Magnituden påverkar visuellt komprimerad ljusstyrka; detta är inte en fotometriskt kalibrerad simulator.

CPU-beräkningar och lagring använder float64. GPU-positioner använder float32, vilket ger små avrundningar i den lokala kartan; koordinaterna i katalogen ändras inte. Punktmolnet har ingen extra syntetisk bakgrund. Detaljnivån består av avståndsanpassad punktstorlek, inte ett flernivåsystem med strömmande rymdvolymer.

Stjärnval görs på klick genom projektion till skärmpixlar, med 8-pixelstolerans. Inget kostsamt raycast körs för varje musrörelse. Vid överlapp väljs punkten närmast klicket; sökningen gör varje katalogpost åtkomlig. Endast vald stjärna etiketteras i kartan för att undvika etikettmoln; navigeringsindikatorn visas i rymdskeppsläge. Kamerans resemodell är oförändrad.

### Information och upptäckter

Panelen visar ID, avstånd från användaren och solen, G-magnitud och temperatur. Fler uppgifter finns i en fällbar sektion. Observerad astrometri/fotometri skiljs från invers-parallaxavstånd och modelltemperatur. Spektralklass, luminositet och exoplaneter visas som **Okänt** där källuppgifter saknas; spektraltyp eller bolometrisk ljusstyrka räknas inte fram från otillräckliga data.

`src/data/enrichment.json` innehåller ett manuellt verifierat, begränsat exempel: Proxima Centauri b och d med länkar till [NASA b](https://science.nasa.gov/exoplanet-catalog/proxima-centauri-b/) och [NASA d](https://science.nasa.gov/exoplanet-catalog/proxima-centauri-d/). NASA anger bred M-typ för värdstjärnan. Verifierat 2026-11-02. Detta är inte en fullständig planetkorsmatchning. NASA:s TAP gav HTTP 525 under arbetet; därför hävdas ingen automatiskt importerad exoplanetkatalog.

Sökningen normaliserar accenttecken, blanksteg och skiljetecken och accepterar även enbart det numeriska Gaia-ID:t. *Utforska i närheten* sorterar från kamerans position när knappen trycks. Listan är en ögonblicksbild; tryck igen efter fortsatt förflyttning för att uppdatera.

Översikten kan döljas och visar sol, kamera, valt mål och riktning mot galaxcentrum. Den projicerar samma världskoordinater som huvudvyn på X/Z-planet (ICRS X/−Y); nordhöjden visas separat. Skalan anpassas till sol, kamera och destination. Galaxcentrum visas som en riktning, inte som en påhittad stjärna eller mätpunkt: ICRS RA 266,4051°, Dec −28,936175°, enligt [Astropys Galactocentric-referens](https://docs.astropy.org/en/stable/api/astropy.coordinates.Galactocentric.html).

### Prestanda och avgränsning

Se `PERFORMANCE.json` och `VERIFIERING.md` för uppmätta resultat. Testerna använder verkliga 10k/100k-poster i Chrome med SwiftShader, inte duplicerade teststjärnor. Mätt tid är bildruteintervall på CPU-sidan, inte GPU-tidsstämplar. JS-heap och storleken på punktattribut rapporteras separat; de utgör inte total browser-/GPU-/systemminnesanvändning. 100k stöds funktionellt men har låg bildfrekvens i mjukvarurenderingen. Hårdvaruaccelererad GPU och fysiska mobiler återstår att mäta. Global luminositet, detaljerade spektralklasser och fullständig exoplanetmatchning återstår. Vite varnar fortfarande för ett stort JavaScript-paket.

### Fortsatt optimering

Kartläget gör inte längre dolda HUD-sökningar i hela katalogen. Destinationslinjen återanvänder sin grafikbuffert och sökning återanvänder katalogens sortering. Närpositionens cache ersätts när utgångspunkten ändras. Kataloger behandlas som oföränderliga; import skapar en ny array. Resor och kamerastyrning är oförändrade. Aktuella mätvärden och tidigare separata körning finns i `PERFORMANCE.json`; 46 enhetstester och fem webbläsarscenarier passerar.


## Version 0.5 – Upptäck och närankomster

**Upptäck** visar högst tio poster per sida: närmast solen, skenbart ljusstarkast i Gaia G-bandet, bekräftade planetvärdar, dokumenterad radie, effektiv temperatur och närmast vald kameraposition. Närsökningen är en ögonblicksbild som uppdateras med knappen. `Visa` markerar stjärnan; `Res dit` använder samma resefunktion och valda restid som övriga appen. Urvalet gäller den inlästa katalogen, inte hela himlen. Solen undantas från upptäcktslistorna.

Gaia DR3-positioner, magnituder och GSP-Phot-temperaturer återanvänds oförändrade. Planetkategorin är ett begränsat NASA-belagt urval, Proxima b/d, inte en komplett inventering. Medföljande Gaia-uttag innehåller **inga stjärnradier**, och Största-kategorin visar därför tydligt att uppgifter saknas. JSON-import accepterar valfria `radiusSolar` och `radiusSource`; positiv ändlig radie och källa krävs tillsammans. Importerade uppgifter är användarens källbelagda data, inte automatiskt vetenskapligt verifierade av appen.

### Storlek, färg och ankomst

En solradie är den nominella IAU-konstanten 6,957 × 10⁸ m enligt [IAU 2015 resolution B3](https://www.iau.org/common/Uploaded%20files/IAUGA2015-Resolution-B3-recommended-nominal-conversion.pdf), dividerad med 9,4607304725808 × 10¹⁵ m per julianskt ljusår. För solen används den nominella solradien. När en stjärnas radie saknas används **illustrativ 1 solradie**; detta märks i informationspanelen och ankomstmeddelandet och lagras inte som ett astronomiskt mätvärde.

Vinkeldiameter = 2 asin(radien / centrumavståndet). Ankomstavståndet väljs så att stjärnans vinkeldiameter upptar 44 procent av det smalare synfältet, beräknat vid resans start. Kameran stannar utanför ytan. En mjuk övertoning mellan punkt och sfär sker över 0,0004–0,0024 radianer. Punkternas minsta bildskärmsstorlek är fortfarande symbolisk. Sfär, ytstruktur, randmörkning och svag korona är illustrationer, inte observerade ytdata. Färgen är schematisk från temperatur, annars BP−RP; den är inte ett kalibrerat spektrum.

Resan använder samma CameraJourney/CameraAim och en femtegradig mjuk start/stopp-profil. För nära ankomster interpoleras logaritmen av avståndet, så att stjärnan växer under en märkbar del av resan i stället för endast sista bildrutan. Tiden är fortfarande 10/20/40/60 sekunder. Paus, återupptagning, avbrott och fri blick bevaras. Manuellt ändrad blick återställs inte vid ankomst; använd Rikta mot destination. Färden är en visuell övergång, inte en fysikalisk eller relativistisk flygsimulering.

Närbilder beräknas relativt kameran i float64 innan GPU-rendering i radieenheter. Detta undviker bortfall av en liten sfär genom subtraktion av stora float32-koordinater. Ett cachelagrat rumsindex med en ljusår stora celler hittar närliggande objekt. Högst åtta närbilder skapas samtidigt; övriga stjärnor förblir GPU-punkter. Ett lokalt ytskydd håller varje visad kameraposition utanför stjärnans radie med fem procents marginal. Skyddet är ingen kontinuerlig kollisions- eller hinderundvikande banplanerare; mycket snabb manuell förflyttning kan passera förbi en stjärna mellan bildrutor. Fysiskt överlappande stjärnor i egen importerad data stöds inte som en kollisionssimulering.

### Begränsningar och tester

Radieunderlaget och planetvärdarna är ofullständiga och framgår i gränssnittet. Varken temperaturer eller radier hittas på. Åtta samtidiga sfärer är en medveten detaljgräns; ingen fullskalig yt-/planet-/systemmodell ingår. Äldre uppgifter om tre ljusårs ankomst ovan beskriver tidigare versioner och har ersatts av den radieanpassade modellen.

Testerna omfattar sortering, filtrering, saknade värden, importvalidering, vinkelstorlek, övertoningskurva, radie/synfält, precisionssäker siktning, närindex och ytskydd samt resor, paus och avbrott. Webbläsartester inkluderar Upptäck, närankomst, lokal rotation, mobil och verkliga 10k/100k-kataloger. Se VERIFIERING.md för senaste körningen och mätvärden.


## Katalogfix: Sirius och kända stjärnor (2026-11-03)

### Grundorsak

Sirius A fanns inte i någon av appens Gaia-kataloger. Den närmaste posten i 100k-uttaget ligger 739,26 bågsekunder bort och är ett annat objekt. Importen tar de 100 000 största parallaxerna med `parallax > 5`, `parallax_over_error > 20` och `ruwe < 1.4`; det är inte en komplett himmelskatalog. Mycket ljusstarka stjärnor är ofullständigt representerade i Gaia, se [Gaia-observationer av ljusstarka stjärnor](https://arxiv.org/abs/1605.08347).

En ofiltrerad Gaia DR3-fråga inom en bågminut från Sirius hittar **Sirius B**, `2947050466531873024`, med RUWE 2,4190555, som appens kvalitetsfilter därför utesluter. Den posten är inte Sirius A. SIMBAD kopplar A till HIP 32349 och HD 48915, utan Gaia DR3-korsidentifierare. Ingen annan Gaia-post antas vara Sirius A enbart på grund av närhet. Fråga och råsvar finns i `data/sirius-catalog-audit.json`. Ytterligare problem var att endast Proxima/Barnard hade vanliga namn, att alias inte indexerades och att katalogbyten helt ersatte tidigare data. Sökningen omfattade redan alla inlästa objekt; sidindelningen var inte orsaken.

### Baskatalog och proveniens

Solen plus nio källbelagda objekt finns alltid: Sirius A, Proxima, Alpha Centauri A och B, Barnards stjärna, Vega, Arcturus, Betelgeuse och Rigel. SIMBADs officiella Harvard-spegel levererar positionsvärden, parallax/osäkerhet, bibliografiska referenser och korsidentifierare. För Sirius används RA 101,28715533333335°, Dec −16,71611586111111°, parallax 379,21 ± 1,58 mas: cirka **8,60094 ljusår** genom invers parallax. Detta är SIMBADs citerade Hipparcos-reduktion (2007A&A...474..653V), inte en ny Gaia-mätning.

SIMBAD-positionerna är ICRS vid **J2000.0**, enligt [SIMBADs dokumentation](https://simbad.cds.unistra.fr/Pages/guide/ch15.htx). När det redan finns en verifierad Gaia DR3-post behålls dess astrometri och J2016.0, medan namn/alias kompletteras. Varje objekt visar sin egen epok. Ingen egenrörelsepropagering, omloppsmodell eller gemensam observationstid påstås; blandade statiska epoker innebär att små relativa separationer inte ska användas för vetenskaplig analys av dubbelstjärnor. Osäkerheten är särskilt betydelsefull för avlägsna Betelgeuse/Rigel.

`data/known-stars-simbad.csv` är det sparade råsvaret. `data/known-stars-metadata.json` innehåller exakt fråga, hämtningstid, källa och SHA-256. `src/data/known-stars.json` är den genererade lokala baskatalogen. Reproducera från det sparade svaret med `python3 scripts/import-known-stars.py`; använd `--fetch` för en ny hämtning. G-magnitud, temperatur, färg och radie fylls inte med påhittade värden där kompletteringen saknar dem. Sirius ingår därför inte i G-magnitudrankningen utan källbelagt G-värde.

### Identifierare och sökning

Sökning omfattar namn, alias, Bayerbeteckningar, HIP, HD och Gaia. Gemener/versaler, accenter, mellanrum, skiljetecken, grekiska bokstäver och vanliga `alf`/`bet`-förkortningar normaliseras. Alternativa skrivningar byggs från samma källbelagda Bayeridentitet. Matchning sker inom varje alias, inte över godtyckliga aliasgränser.

Dubbletter slås ihop endast genom verifierade katalogidentifierare, aldrig genom fuzzy namn eller närhet. Sirius A och B och Alpha Centauri A/B förblir olika objekt. Motstridiga komponentidentifierare i JSON-import avvisas. Sirius B läggs inte till som ett nytt kvalitetsgodkänt Gaia-objekt; den nuvarande kvalitetsgränsen bevaras. För 10k/100k tillkommer sju saknade objekt; Proxima och Barnard kompletteras utan dubbletter. Totalt visas 10 007 / 100 007 stjärnor plus solen.

Namntäckningen är fortfarande begränsad till den verifierade baskatalogen; övriga Gaia-objekt kan sökas via sina Gaia-ID:n. Mer fullständig korsmatchning av hela katalogen återstår. Kamerakod och 3D-rendering har inte ändrats för denna korrigering.


## Tydligare resepanel (2026-11-03)

Alla huvudsakliga avståndsvisningar använder nu `formatDistance` med svensk talformatering och normal notation. Enheten väljs på det oavrundade avståndet:

- Från och med **1 ljusår**: ljusår, två decimaler.
- Under 1 ljusår men från och med **0,1 AU**: AU, två decimaler.
- Under **0,1 AU**: hela kilometer med svensk tusentalsgruppering.
- Positiva avstånd mindre än 1 km: **< 1 km**. Exakt noll: **0 km**. Ogiltiga avstånd: streck.

Omvandlingarna använder 1 AU = 149 597 870,7 km (IAU:s exakta astronomiska enhet) och 1 julianskt ljusår = 9 460 730 472 580,8 km. Gränserna är ett presentationsval, inte ändrade astronomiska data. Avrundning kan ge samma siffra strax på olika sidor om en gräns; själva enheten bestäms före avrundning. Ingen exponentnotation används av formatfunktionen.

Panelen visar destination, Pågår/Pausad/Ankommer, procent av **aktiv restid**, avstånd till den planerade ankomstpunkten och aktuellt avstånd till centrum. Procenten avser tiden eftersom förflyttningen inte har konstant hastighet. Ankommer visas från 90 procent av tiden, om resan inte är pausad. Pågående resa avrundas nedåt och visar högst 99 procent; 100 procent reserveras för ankomst. Paus fryser resemodellens klocka som tidigare.

Vid ankomst ligger stoppunkten utanför ytan. `arrivalDistance` och kamerastyrningen är oförändrade: dokumenterad/nominell radie när sådan finns, annars tydligt märkt illustrativ solradie, samt anpassning till det smalare synfältet. Sirius A har ingen verifierad radie i den lokala kompletteringen och använder därför **illustrativ 1 solradie**, aldrig presenterad som mätvärde. Tester kontrollerar att avståndet överstiger denna radie även i porträttformat. Vid ankomst visas 0 km kvar och det faktiska centrumavståndet; centrumavståndet fortsätter uppdateras om användaren utforskar omgivningen.

Knapparna ligger på en egen rad. I rymdskeppsläge döljs manöverpanelen medan ankomstkortet visas för att undvika överlappning; stäng kortet för att visa den igen. Tangentbordsstyrningen påverkas inte. Vetenskapligt detaljerade axelkoordinater är fortfarande separata från de automatiskt anpassade avstånden.

På desktop ersätter ankomstkortet tillfälligt informationspanelen till höger, så att stjärnan förblir fri i mitten. Stäng kortet eller välj en annan stjärna för att återgå till informationspanelen. På mobil ligger kortet vid skärmens nederkant.

## 0.6 – solsystemets första planetsystemvy

Välj Solen och **Utforska planetsystem** (tillgänglig även utan att först resa till solen). Åtta planeter kan väljas, undersökas och besökas med 10/20/40/60 sekunders resa. Återgång behåller stjärnkartans position och orientering. Lokal vy använder AU och en separat kamera; stjärnkamerans enda befintliga ägare är inaktiv under utforskningen. Övergången tonas in; det är ett skalbyte, inte en sammanhängande fysisk zoom.

Planeternas sanna radier är standard. Pedagogisk visning förstorar små planeter till minst 0,025 AU utan att ändra banor eller data. Ankomst och kollisionsskydd använder den visade radien och kamerans smalaste synfält. Tiden pausas vid planetresa och startas manuellt igen. Under resan kan man pausa eller avbryta; efteråt går det att rotera, panorera och zooma. Stjärnresornas fria blick är oförändrad, men planetresor har för närvarande låst blick under själva färden.

### Planetkällor och reproduktion

- `python3 scripts/import-planets.py` bygger lokala data från de åtta sparade JPL Horizons-svaren i `data/planets`. `--fetch` hämtar samma epok sekventiellt igen. Importen kontrollerar API-version 1.2 och referensplan, läser volymmedelradie, massa och den första raden med banelement, och sparar SHA-256 för varje råsvar.
- [JPL Horizons](https://ssd.jpl.nasa.gov/horizons/): heliocentriska oskulerande element vid **2026-11-03 00:00 TDB**, JD 2461347,5; ekliptika J2000.0, AU/dygn/grader. Rendering `(X,Z,-Y)` är lokal ekliptika, skild från stjärnkartans ICRS. Ingen implicit omvandling av stjärnpositioner sker vid skalbytet.
- Keplers ekvation löses iterativt. Fasta element propageras i en tvåkroppsmodell, utan planetstörningar eller månar. Detta är en pedagogisk approximation nära elementepoken, inte en navigeringsefemerid. Omloppstiden som visas är det oskulerande Horizons-värdet.
- [NASA/JPL:s planetkartor](https://space.jpl.nasa.gov/tmaps/) är historiska kartor/mosaiker/representativa molnkartor. Jordens karta är topografisk, inte ett fotografi. Exakta URL:er finns i `data/planets/textures.json`. `python3 scripts/import-planet-textures.py` hämtar kartorna igen från projektroten. Ingen verklig rotationsfas, axellutning eller ljussättning hävdas: sfärerna har jämn belysning och illustrativ texturorientering. Saturnus ringar är ännu inte modellerade.

### Avgränsning i denna leverans

Solsystemet är implementerat. Generella `Planet`/`PlanetSystem`-modeller separerar data, banmatematik, tid, kamera och gränssnitt. **TRAPPIST-1 och Proxima har ännu ingen lokal planetsystemvy.** NASA Exoplanet Archives bekräftade `pscomppars`-rader har hämtats och sparats i `data/planets/exoplanets.json`; den fungerande frågan finns i `requests.json`. De används inte i renderingen förrän värdstjärnornas korsreferenser, okända banfaser/orienteringar och varje mätnings härkomst hanteras fullt ut. Saknade värden visas som ”Okänt”; generell reservradie är illustrativ och ska märkas innan fler system aktiveras. Den befintliga Proxima-informationen i stjärnkatalogen är bevarad.

## 0.6.1 – gemensam katalog för stjärnor och planetsystem

**Grundorsak:** TRAPPIST-1 fanns redan som Gaia DR3 2635476908753563008, rad/rang 480 i den sparade Gaia-listan och därmed i både 10k och 100k. G-magnituden är 15,622554. Inget magnitudfilter hade uteslutit stjärnan; importen filtrerar på parallax, parallaxprecision och RUWE. Startkatalogens 150 Gaia-rader saknade den. Varken namnet/aliasen eller ett aktivt planetsystem var registrerade i 0.6, där endast solsystemet var aktiverat. Sökningen omfattade redan hela den sammanslagna katalogen.

**Nu:** `planet-hosts.json` kompletterar samma baskatalog som de kända stjärnorna. SIMBAD-korsidentifierare kopplar TRAPPIST-1, K2-112, 2MASS, TIC och Gaia-ID till samma objekt. Positionen hämtas från det redan sparade Gaia DR3-uttaget: ICRS J2016.0, RA 346,62652162764437°, Dec −5,043528319429532°, parallax 80,21231612635748 mas (cirka 40,66 ljusår). Det ordinarie `position()` räknar om till samma `(X,Z,−Y)` i ljusår som alla stjärnresor använder. Gaia-rader behåller positioner, magnituder, ID och epok. Saknade värdar kompletteras även efter egen JSON-import eller nätfel. Dubbletter matchas via exakta normaliserade, dokumenterade identiteter; inga närhetsmatchningar används. Motstridiga komponentidentifierare avvisas.

Det gemensamma systemregistret i `planets/model.ts` länkar `hostId` till värdstjärnans kanoniska ID. Den befintliga sökningens index omfattar dessutom planeternas namn/alias. **TRAPPIST-1 e** ger ett stjärnresultat märkt **→ värdstjärna**. Välj det, res med **Res till stjärnan**, och öppna **Utforska planetsystem**: planet e är förvald. Proxima Centauri b och NASA-namnet Proxima Cen b leder på samma sätt till Proxima. Inga separata sökresultatobjekt eller alternativa kamerakoordinater införs. Valda svaga stjärnor markeras med den befintliga diamantetiketten; faktisk magnitud och stjärnrendering ändras inte.

**Aktiva system:** Solsystemet (8), TRAPPIST-1 b–h (7), Proxima Centauri b och d (2). NASA Exoplanet Archives `pscomppars` hämtades 2026-11-04; de nio exoplanetraderna har ingen kontroversflagga. Detta är ett begränsat verifierat urval, inte samtliga kända planetvärdar. Kompakt planetsystemvy använder samma renderer och reseklasser; startavståndet anpassas till systemets utsträckning. Pedagogisk minimistorlek begränsas av planetbanans storlek så att förstorade planeter inte täcker ett helt kompakt system.

**Astronomiska begränsningar:** Exoplaneternas storaxlar, perioder och excentriciteter hämtas från katalogen. Fas, banplanets orientering och periastrons riktning är illustrativa; ingen verklig fasepok anges. Detta märks i vyn och koden (`illustrativeOrbit`, null-epok), medan katalogens siktlinjelutning sparas separat. Bilderna är illustrationer, inte fotografier. Proximaplaneternas radier är NASA:s härledda uppskattningar, och massorna är minimimassor m sin i; båda märks uttryckligen. Solsystemets tidigare JPL-banor och texturer är bevarade. Stjärnkartans radieantaganden, kamerastyrning och resanimationer är oförändrade.

### Reproduktion och filer

- `python3 scripts/fetch-planet-hosts.py`: hämta SIMBAD-korsidentifierare och fullständiga NASA-rader. Nätfel avbryter innan tidigare källfiler skrivs över. Den alternativa officiella NASA-adressen används eftersom den första gav HTTP 525 vid hämtningen.
- `python3 scripts/import-exoplanet-systems.py`: verifiera källornas SHA-256 och bygg värdstjärnor/system offline från sparade källor och Gaia-uttaget.
- Rådata, frågor, hämtningstid, litteraturreferenser, enhetskonventioner och checksummor finns i `data/planets/hosts-metadata.json`, `hosts-simbad.csv`, `exoplanets-full.json` och `system-import.json`.
- `src/data/catalog.ts` och `search.ts`: gemensam komplettering, identiteter och namnindex. `src/data/discovery.ts` och UI-panelerna läser samma systemregister.
- `src/planets/model.ts`, `state.ts`, `extrasolar.json` och `PlanetView.tsx`: generisk värd/systemkoppling, giltigt planetval och kompakta systemvyer.
- `src/data/planet-hosts.test.ts` och `e2e/hosts.spec.ts`: katalog-, sök- och resregressioner. Befintliga katalogtester uppdateras för en extra värd i start-/offlinekatalogen; 10k/100k får ingen extra TRAPPIST-dubblett.

## 0.7 – fri flygning och en gemensam stjärnyta

Öppna ett planetsystem och välj **Flyg fritt**. **Närma dig stjärnan** gör först en vanlig mjuk resa till systemets stjärna om du vill börja på nära håll. Den befintliga planetresan, stjärnsökningen och återgången till stjärnkartan finns kvar.

- **W/S:** framåt/bakåt. **A/D:** sidled. **Space/C:** upp/ned. **Shift:** fem gånger högre begärd fart eller motoracceleration. **Dra med musen:** ändra blick. **B:** håll för bromsning; HUD-knappen växlar bromsen på/av. **Esc:** återgå till kartkontrollerna på samma plats och med samma blick.
- **Utforskning:** hjälpt hastighetsstyrning, snabb mjuk respons, fullständig automatisk inbromsning när knapparna släpps. Maxfarten väljs i AU/s och kan överstiga ljusets hastighet; detta är uttryckligen ett utforskningshjälpmedel. Närfarten begränsas till hälften av avståndet till närmaste yta per sekund (med ett litet numeriskt golv). Shift får inte kringgå närhetsbegränsningen.
- **Simulering:** SI-enheter, motoracceleration och hastighetsvektor, utan gravitation, luftmotstånd eller relativitet. Efter släppt gas fortsätter farkosten med konstant världshastighet även när blicken ändras. Bromsen ger motriktad motoracceleration (8× vald acceleration) och vänder aldrig hastigheten genom noll. Modellbyte och utträde ur flygläget stoppar farkosten. Beräkningssteget begränsas till 0,1 s; extremt låg bildfrekvens ger därför långsammare simulerad tid, inte stora hopp.
- HUD visar faktisk fart i m/s eller km/s, flygmodell samt närmaste kropps namn och avstånd **till ytan**. Orbiternas snabbspolade tid pausas under flygning. Tangentbordsfokus i formulär respekteras; klicka/dra i rymden för att återta styrningen. Flygläget är i denna version främst avsett för tangentbord och mus; separat mobilstyrspak ingår inte.

### Gemensam fysisk radie och rendering

`math/stellar.ts` är gemensam källa för radie, vinkelstorlek, ankomst, skydd och färg i alla vyer. `stellar-properties.json` innehåller Solens nominella 695 700 km, Sirius A:s 1,713 ± 0,009 solradier ([Davis et al., DOI 10.1071/AS10010](https://doi.org/10.1071/AS10010)), TRAPPIST-1:s 0,1192 och Proximas 0,141 solradier från de sparade NASA-källorna. Sirius temperatur är 9845 K; NASA-värdarnas temperaturer kommer från samma källuttag. Färgtonerna är diskreta visuella approximationer till temperaturen, inte spektral fotometri. Tidigare separata lokala radier är ersatta av samma uppslag som stjärnkartan använder. Ankomstpositionerna för dessa tidigare illustrativa stjärnor ändras därför till deras källbelagda storlek, medan reseprofilen och styrningen behålls.

För en importerad stjärna med `spectralClass`, exempelvis `A0V` eller `M5V`, kan en saknad radie uppskattas från [Pecaut & Mamajeks dvärgsekvens, version 2022.04.16](https://www.pas.rochester.edu/~emamajek/EEM_dwarf_UBVIJHK_colors_Teff.txt). Det är ett klassmedelvärde, tydligt märkt **Uppskattning**, aldrig en mätning av objektet. Bara exakta dvärgklasser i tabellen används; inga jättar eller okända stjärnor tvingas in i en huvudseriemodell. När även tillräcklig klassificering saknas används den tidigare illustrativa reservradien 1 solradie med tydlig märkning. `python3 scripts/import-stellar-properties.py` återskapar tabellerna offline; källor/checksumma finns i `data/stellar-properties-sources.json`.

Vinkelstorleken är **2 asin(R/d)** med samma enhet för R och d. Befintliga `NearStar` återanvänds i planetsystemet i stället för en separat gul sfär. `sphereBlend` gör en mjuk smoothstep-övergång mellan 0,0004 och 0,0024 radianers vinkeldiameter. Punkten tonas ned med `1 − blend` samtidigt som sfären tonas upp med `blend`. Sfären har alltid fysisk radie; ingen ankomststyrd förstoring sker. Punkten är en symbolisk representation av en olöst stjärna. Koronan är en svag transparent effekt utanför ytan, med en separat geometri; den räknas inte in i stjärnradien. Limbmörkning och svag ytstruktur är konstnärliga, inte fotografiska.

Stjärnans position minus kamerans position beräknas i dubbelprecision före GPU-uppladdning. Samma shader arbetar i kamerarelativa radieenheter och omvandlar djupet tillbaka till scenens enhet. Den interstellära scenen använder ljusår; planetsystemet använder lokala AU och aldrig värdstjärnans stora globala koordinater. Planeterna använder sina tidigare lokala banor. Den dolda stjärnkartans bildloop pausas när planetsystemet visas och dess kameraställning behålls.

### Kameraägarskap och närgräns

`PlanetNavigation` är fortsatt ensam uppdaterare av den lokala kameran: automatisk resa **eller** fri flygning **eller** OrbitControls. Mus- och tangentbordshändelser samlar input; bildloopen utför förflyttning och orientering. Tröghetsvektorn är oberoende av blickriktningen. Händelser rensas vid utträde, fokusförlust och avmontering; bakgrundsflikar flyttar inte kameran.

Fri flygning kontrollerar hela förflyttningssegmentet mot kropparnas skyddssfärer, så att hög fart inte kan passera genom en stjärna mellan bildrutor. Lokal närgräns är **1,02 × fysisk radie** (för pedagogiskt förstorade planeter: visad radie). Kameran stoppas utanför ytan och kan fortfarande se stjärnan fylla synfältet. Det är ett navigeringsskydd, ingen gravitationskraft eller kollisionsfysik. Interstellär navigation behåller sitt tidigare skydd och använder samma uppdaterade radieinformation.

Ändrade huvudkomponenter: `planets/flight.ts`, `flightInput.ts`, `PlanetNavigation.tsx`, `FlightHUD.tsx`, `PlanetView.tsx`, `state.ts`, `math/stellar.ts`, `rendering/NearStar.tsx`, `Universe.tsx` samt radie-/temperaturinformation i `StarDetails`, `JourneyPanel` och upptäcktslistan. Nya tester finns i `flight.test.ts`, `stellar-consistency.test.ts` och `e2e/freeflight.spec.ts`.
