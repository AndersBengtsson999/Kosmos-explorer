# Cosmos Explorer 0.2 – kamerastyrning, 2026-11-01

## Diagnos och baslinje

De två befintliga Chrome-testerna passerade före omarbetningen. Den tidigare telemetriåterställningen reproducerades inte i den redan rättade versionen. Fixen med stabil kamerakonfiguration och memoiserad 3D-vy behålls.

Kodgranskningen visade kvarvarande svagheter: OrbitControls och resan hade varsin uppdatering av kameran, den exponentiella animationen saknade mjuk acceleration, och en separat lägeseffekt avbröt resor. Kamera och target använde däremot redan samma koordinatsystem.

## Lösning

Navigation samordnar en aktiv ägare: resa, rymdskepp eller OrbitControls. Resan beräknas i renderingsvärldens ljusår, stannar 3 ljusår från målet och riktar kameran mot det. Smootherstep ger noll hastighet och acceleration vid start och slut; quaternion-slerp ger mjuk orientering. Orbit-inerti töms vid överlämning och aktuell kamerariktning bevaras, inklusive efter avbrott. Lägesbyte låter resan fortsätta. Knapp, Escape och manuell navigation kan avbryta.

## Tester

Slutresultat: **36 av 36 enhetstester och 3 av 3 Chrome-scenarier passerar**. Den isolerade webbläsarkörningen tog 47,9 sekunder. TypeScript-kontroll och produktionsbygge passerar. Skärmbilden vid ankomst visar Proxima centrerad och ett avstånd på 3,00 ljusår.

36 enhetstester i två filer omfattar koordinater, katalogintegritet, flygning, slutposition, orientering, polriktningar, sammanfallande kamera/mål, avbrott, byte av destination mitt i resan, upprepade resor och resor mellan andra stjärnor än solen.

Tre Playwright-scenarier omfattar:

1. Faktisk kameraförflyttning, stabil ankomst efter telemetriuppdateringar, rymdskeppsresa och flygknappar.
2. Katalogsidor, återställning och mobil bredd.
3. Lägesbyte under resa, avbrytknapp, frusen position och orientering efter avbrott, lägesbyte utan hopp, resa Proxima–Barnards stjärna, exakt slutavstånd och blickriktning, upprepad destination samt Escape.

TypeScript-kontroll och Vite-produktionsbygge lyckas. Gaia-katalog och original-CSV är oförändrade.

## Praktiska begränsningar

Chrome använder SwiftShader (mjukvarurendering), vilket kan ge låg bildfrekvens. Första körningen av den utökade resan nådde 74 % innan den gamla tidsgränsen på 12 sekunder löpte ut. Väntetiden ändrades till 30 sekunder. Resans animationssteg är begränsat till 0,05 sekunder för att undvika stora hopp; dold flik pausar resan och låg bildfrekvens förlänger restiden.

Fysisk mobil, Safari och hårdvaruaccelererad GPU är inte testade. Ingen fysisk kollisionsmodell eller ruttplanering runt andra stjärnmarkörer ingår; målstjärnans ankomstradie respekteras. Manuell flygning är fri. Vite varnar för cirka 1,2 MB JavaScript (339 kB gzip).

## Reproducera

```sh
npm install
npm test
npm run build
npm run test:e2e
```

Webbläsartesterna kräver Google Chrome och använder port 5175 med filbevakning avstängd.

En separat körning stördes av Vites automatiska omladdningar, bekräftade i serverloggen och genom återställd sökning i felrapporten. Slutkörningen använder därför en isolerad testserver utan filbevakning; den vanliga förhandsvisningen behåller hot reload.
