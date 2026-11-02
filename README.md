# Cosmos Explorer 0.2

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

`npm test` kör 40 enhetstester. `npm run test:e2e` kör fyra Chrome-scenarier för tidsval, resa, paus, fri blick, återupptagning, avbrott, lägesbyte, ankomst, riktning, stopp och mobilreferenser. Testservern använder port 5175 med filbevakning avstängd; Google Chrome måste vara installerad. `npm run build` gör TypeScript-kontroll och produktionsbygge.
