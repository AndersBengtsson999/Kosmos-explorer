# Cosmos Explorer 0.4 – verifiering 2026-11-02

## Resultat

45 av 45 enhetstester och 5 av 5 Chrome-scenarier passerar. Den slutliga webbläsarkörningen tog 59,0 sekunder. TypeScript och Vite-produktionsbygge passerar. Skärmbilder för dator och mobil har granskats.

## Verkliga katalogdata

100 000 unika ESA Gaia DR3-källor importerades direkt från ESA TAP. 10 000 laddas normalt; 100 000 väljs i inställningar. Solen läggs till som origo. Original-CSV, frågan, hämtningstid, SHA-256 och reproducerbart importskript ingår. ICRS, J2016.0. Urvalet sträcker sig från 4,25 till 239,76 ljusår. 28 894 källor har modelltemperatur.

Källor: ESA Gaia DR3 för astrometri/fotometri/temperatur; NASA Science för ett begränsat Proxima b/d-exempel; Astropy Galactocentric-referensen för riktningen mot galaxcentrum. Se README för direkta länkar. NASA:s TAP gav HTTP 525; någon komplett exoplanetimport kunde därför inte verifieras.

## Prestanda

Chrome med SwiftShader, 1280 × 720, DPR 1. Statisk standardvy, cirka fem sekunders mätning per katalog. Bildruteintervall är inte GPU-renderingstidsstämplar. JS-heap mäts efter begärd garbage collection.

| Källor | Median bildruta | P95 | JS-heap | GPU-punktattribut | Ritningsanrop | Närsökning |
|---:|---:|---:|---:|---:|---:|---:|
| 10000 | 67.5 ms | 86.2 ms | 45.7 MB | 0.28 MB | 2 | 8.3 ms |
| 100000 | 120.3 ms | 159.3 ms | 134.5 MB | 2.80 MB | 2 | 91.1 ms |

Fullständiga mätvärden, antal sampel och miljö finns i PERFORMANCE.json. JS-heap är inte total processminne; GPU-attributmåttet exkluderar drivrutin, framebuffer och övrig GPU-allokering. 100k fungerar men är inte flytande i denna mjukvarurendering. Hårdvaruaccelererad GPU, Safari och fysisk mobil återstår att mäta.

## Täckning

Enhetstester: båda verkliga binärkatalogerna, unika och exakta 64-bitars-ID:n, kvalitetssnitt, koordinater, normaliserad namn/ID-sökning, närsökning från godtycklig position, korrupta data, JSON-import och befintlig reslogik.

Chrome: defaultrestid, paus, fri blick, återupptagning, avbrott, lägesbyte, 10-sekunders ankomst, klickval i GPU-punktmolnet, manuell rörelse, stopp, riktningshjälp, mobilreferenser, 10k/100k-byte, shaderfel och bevarad 100k-katalog efter simulerat HTTP 503. Kamerans förflyttnings- och orienteringsmodeller har inte ändrats.

## Kvarvarande begränsningar

Luminositet och detaljerad spektralklass saknas i det hämtade urvalet och visas som Okänt. Planeter är inte systematiskt korsmatchade; endast Proxima-exemplet är källbelagt. Okänt betyder inte att inga planeter finns. Punktstorleken är avståndsanpassad men ingen spatial strömning/octree-LOD ingår. Val i ett överlappande punktmoln sker inom 8 pixlar; sökning ger tillgång till varje post. GPU-positioner avrundas till float32; original och navigering behåller float64. Ingen ny fysisk simulering ingår. Vite varnar fortsatt för cirka 1,2 MB JavaScript (342 kB gzip).

## Reproducera

```sh
python3 scripts/import-gaia.py
npm install
npm test
npm run build
npm run test:e2e
```

Google Chrome krävs för webbläsartester. Importskriptet kräver Python 3 och curl.
