# Cosmos Explorer 0.2 – verifiering 2026-11-01

## Resultat

- 26 Vitest-tester: koordinater, dataintegritet, import, flyginmatning, sidindelning, sökning och återställning.
- TypeScript-kontroll och Vite-produktionsbygge lyckas.
- Två Playwright-tester i installerad Google Chrome: kamerafärd och fortsatt stabil position, rymdskeppsresa, pekknappar, alla katalogsidor, återställning och mobil bredd.
- Chrome renderade WebGL med SwiftShader. Skärmbilder av dator- och mobilvyn granskade.
- npm-installationen rapporterade 0 kända sårbarheter.

## Kamerafix

Tidigare skapades kamerans startkonfiguration på nytt när UI uppdaterades med telemetri. Nu används en stabil konfiguration och en memoiserad 3D-vy. Webbläsartestet mäter ett initialt avstånd över 20 ljusår till Proxima, väntar på ankomst under 7 ljusår och kontrollerar att kameran förblir på cirka 6,17 ljusårs avstånd genom flera telemetriuppdateringar. Resor stannar med offset (3,2,5) ljusår från målet för att hålla stjärnmarkören synlig.

## Avgränsningar

Codex inbyggda webbläsarverktyg blockeras fortfarande av miljöns symboliska Documents-länk. Testerna kördes därför med Playwright i lokal Chrome. Fysisk mobil, Safari, hårdvaruaccelererad GPU och samtliga pekgester är inte verifierade. En 390 × 844 mobilvy testades utan horisontellt överflöde.

Vite varnar fortsatt för en JavaScript-fil på cirka 1,2 MB (338 kB gzip). Katalogen består av 150 verkliga Gaia DR3-källor plus solen som approximativt origo. Stjärnpositioner är statiska vid J2016.0; relativitet och gravitation ingår inte. Fullständig dataproveniens finns i README.

## Reproducera

```sh
npm install
npm test
npm run build
npm run test:e2e
```

Webbläsartesterna kräver installerad Google Chrome och använder port 5174. `npm run dev` startar appen för vanlig användning.
