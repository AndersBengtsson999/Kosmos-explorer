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
