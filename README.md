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
