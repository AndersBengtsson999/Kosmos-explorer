# Cosmos Explorer 0.1

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
- Rymdskepp: WASD framåt/bakåt/sidledes, Q/E ned/upp. Dra med mus eller finger för att titta. Reglera hastighet med reglaget. Pekknappar ger framåt/bakåt/sidledes på mobil.
- Flygningen är en förenklad kameraoperation i ljusår per verklig sekund; ingen relativitet, acceleration, gravitation eller kollisionsmodell. Kamerafärder till mål har ingen fysisk restid.
- Informationspanelen visar avstånd från solen och kameran, RA, deklination, parallax med mätosäkerhet, G-magnitud och epok. Kamerakoordinater visas längst ned.

## Verifierad katalog och proveniens

150 källor från **ESA Gaia DR3**, hämtade 2026-11-01 via [ARI Heidelberg TAP](https://gaia.ari.uni-heidelberg.de/tap.html). ESA:s primära TAP svarade HTTP 503, varefter universitetets Gaia-spegel användes. Ursprungligt, oförändrat svar: `data/gaia-dr3.csv`. Lokal appkatalog: `src/data/stars.json`. Konverteringen kan reproduceras med `python3 scripts/convert-catalog.py` (endast standardbibliotek).

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

Import ersätter katalogen för den aktuella sessionen och bevarar solen. Ladda om sidan för att återställa standardkatalogen. Max 5 MB och 5000 stjärnor. Fel rapporteras utan att befintlig katalog ändras. Exempel med verkliga data:

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

## Begränsningar i 0.1

Ingen relativitet, stjärnutveckling, planetsystem, egenrörelse eller beständig lagring. Katalogen är ett urval. Mätosäkerheter visas men visualiseras inte som volymer. Hastighetsreglaget anger manuell flyghastighet; destinationsfärder använder separat kamerainterpolering. Vid mycket stora importer används en mesh per stjärna och prestandan kan minska. WebGL-fel ger ett meddelande medan katalogpanelen förblir tillgänglig. Mobil styrs med pekdrag och riktningsknappar; tangentbord ger även höjdled.
