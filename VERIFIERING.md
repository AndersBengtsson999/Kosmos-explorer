# Cosmos Explorer 0.1 – leverans och verifiering

Implementerad i den befintliga, tidigare tomma projektmappen. Arkivet innehåller källkod, låsta npm-beroenden, README, 150 Gaia-mätposter i original-CSV och JSON, konverteringsskript, tester samt det färdiga produktionsbygget i dist/.

## Verifierat 2026-11-01

- `npm install`: genomfört. Vitest uppdaterat till 5.0.5 för att rätta rapporterade sårbarheter.
- `npm test`: 20 tester passerar i en testfil.
- `npm run build`: TypeScript-kontroll och Vite-produktionsbygge lyckas.
- `npm audit`: 0 rapporterade sårbarheter efter uppdatering.
- Lokal utvecklingsserver: HTTP-anrop lyckas.
- Datakatalog: 150 unika Gaia DR3-källor plus solen. Originaldata hämtade från ARI Heidelberg efter HTTP 503 från ESA:s primära tjänst. Epok J2016.0, parallaxsignal/brus >20, RUWE <1.4.

## Inte verifierat

Automatiserad webbläsarinspektion blockerades när verktygets sandlåda inte kunde starta på grund av en symbolisk länk i Documents-sökvägen. Visuellt utseende, faktisk WebGL-rendering, mus-/peknavigering och mobilbeteende är därför inte verifierade i webbläsare. Enhetstesterna ersätter inte dessa kontroller.

Vite varnar för en JavaScript-fil på cirka 1,2 MB (337 kB gzip), främst 3D-biblioteken. Bygget lyckas men första laddningen kan förbättras med uppdelning av paketet.

## Kör lokalt

Packa upp arkivet, öppna projektmappen i terminalen och kör:

```sh
npm install
npm run dev
```

Öppna adressen Vite visar. Node.js 22.12+ rekommenderas. Produktionsfilerna i dist/ måste serveras via HTTP, inte öppnas med file://.

## Funktionell omfattning

3D-karta, sökning efter namn/ID, val av stjärnor, informationspanel, mjuka kamerafärder, återgång till solen, orbit-navigation, första person med tangentbord/pekdrag, hastighetsreglage, positionstelemetri och validerad JSON-import. Responsiv mörk svensk UI. Separation av data, matematik, rendering, navigation, simulering och UI.

Positioner är statiska vid referensepoken. Solens läge är en approximation av barycentrum. Avstånd beräknas från invers parallax utan nollpunktskorrektion. Stjärnstorlekar och färger är schematiska. Ingen relativitet eller gravitation. Importerade katalogers proveniens måste verifieras av användaren; importer sparas bara under sessionen. Fullständig dokumentation och källhänvisningar finns i README.
