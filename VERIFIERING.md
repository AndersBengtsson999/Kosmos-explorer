# Cosmos Explorer – tydligare rymdnavigering, 2026-11-02

## Ändringar

Befintligt projekt och Gaia-data bevarade. Position och orientering har separata modeller under en gemensam navigeringsägare. Resor har standardtid 20 sekunder och val 10/20/40/60, med smootherstep, paus/återupptagning, avbrott och återstående avstånd. Fri blick bevaras under färd och vid ankomst. Riktningshjälp vrider enbart kameran. Utan manuell blick riktas kameran mot stjärnan vid ankomst, på 3 ljusårs avstånd.

Rymdskeppsläget visar sikte, ICRS-blickriktning, faktisk färdriktning och hastighet, närmaste stjärna inom 12° framför kameran, destinationsdiamant/pil och avstånd. Stopp nollställer manuell hastighet. Skala och koordinataxlar kan aktiveras. Katalogpaneler döljs under färd och kan öppnas vid behov.

## Kontroller

Slutresultat: **40 av 40 enhetstester och 4 av 4 Chrome-scenarier passerar**. Webbläsarkörningen tog 41,9 sekunder. TypeScript och produktionsbygge passerar.

- 40 enhetstester för koordinater, verkliga data, katalogimport, flyginmatning, restider, paus, fri orientering, avbrott, riktningshjälp och projektion.
- Fyra Chrome-scenarier för standardtid, paus/fri blick/återupptagning/avbrott och lägesbyte, 10-sekunders ankomst, färdriktning/stopp/riktningshjälp samt mobilkatalog och referenser.
- TypeScript och Vite-produktionsbygge.
- Dator- och mobilskärmbilder granskade. Inga falska bakgrundsstjärnor har lagts till.

Under testning rättades resepanelens placering över dragytan, tappad tangenttryckning vid snabbt lägesbyte och referenskontroller bakom mobilens sidfot. Testservern är isolerad från utvecklingsserverns automatiska omladdningar.

## Begränsningar

Chrome verifieras med SwiftShader; fysisk mobil, Safari och hårdvaruaccelererad GPU är inte testade. En synlig flik som blockeras länge kan visa ett större positionssteg när bildrutorna återkommer. Dold flik pausar resan. Inga gravitations-, relativitets- eller fysiska kollisionsberäkningar ingår. Manuell blick bevaras även vid ankomst; riktningsknappen används om man vill titta mot stjärnan igen. Skalan och ICRS-axlarna ligger vid solen. Vite rapporterar fortsatt ett stort JavaScript-paket (cirka 1,2 MB, 341 kB gzip).

Kör `npm test`, `npm run build` och `npm run test:e2e` för att reproducera kontrollerna. Webbläsartester kräver Google Chrome och använder port 5175.
