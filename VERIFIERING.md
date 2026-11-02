# Cosmos Explorer 0.4 – verifiering 2026-11-02

## Resultat

46 av 46 enhetstester och 5 av 5 Chrome-scenarier passerar. Den slutliga webbläsarkörningen tog 45,0 sekunder. TypeScript och Vite-produktionsbygge passerar. Webbläsarscenarier för dator och mobil passerar.

## Verkliga katalogdata

100 000 unika ESA Gaia DR3-källor importerades direkt från ESA TAP. 10 000 laddas normalt; 100 000 väljs i inställningar. Solen läggs till som origo. Original-CSV, frågan, hämtningstid, SHA-256 och reproducerbart importskript ingår. ICRS, J2016.0. Urvalet sträcker sig från 4,25 till 239,76 ljusår. 28 894 källor har modelltemperatur.

Källor: ESA Gaia DR3 för astrometri/fotometri/temperatur; NASA Science för ett begränsat Proxima b/d-exempel; Astropy Galactocentric-referensen för riktningen mot galaxcentrum. Se README för direkta länkar. NASA:s TAP gav HTTP 525; någon komplett exoplanetimport kunde därför inte verifieras.

## Prestanda

Chrome med SwiftShader, 1280 × 720, DPR 1. Statisk standardvy, cirka fem sekunders mätning per katalog. Bildruteintervall är inte GPU-renderingstidsstämplar. JS-heap mäts efter begärd garbage collection.

| Källor | Median bildruta | P95 | JS-heap | GPU-punktattribut | Ritningsanrop | Närsökning |
|---:|---:|---:|---:|---:|---:|---:|
| 10000 | 31.2 ms | 40.0 ms | 40.4 MB | 0.28 MB | 2 | 2.8 ms |
| 100000 | 55.4 ms | 64.4 ms | 78.1 MB | 2.80 MB | 2 | 46.8 ms |

Upprepad närsökning från samma position: 0,1 ms (10k), 0,8 ms (100k). Tidigare separata körning gav median 67,5/120,3 ms. Detta är inte ett isolerat A/B-test; belastningen på datorn kan variera.

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

## Fortsatt prestandaarbete

Dold navigerings-HUD är avmonterad i kartläge och gör inga koniska stjärnsökningar. Destinationslinjen återanvänder buffert och målreferens i stället för att söka hela katalogen och skapa vektorer varje bildruta. Sökning cachar sortering per oföränderlig katalog och senaste närposition, använder kvadrerade avstånd och återanvänder svensk namnjämförare. Nytt test kontrollerar positionsbyte, katalogbyte, resultatmutation och filtrerad avståndsordning. Kamerakoden och samtliga astronomiska positioner är oförändrade.
