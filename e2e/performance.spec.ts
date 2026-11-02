import {test,expect} from '@playwright/test';
import {writeFileSync} from 'node:fs';
test('real 10k and 100k catalogs: frame time, memory, nearest search and load failure',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 const shaderErrors:string[]=[];page.on('console',msg=>{if(msg.type()==='error'&&/shader|webgl/i.test(msg.text()))shaderErrors.push(msg.text());});
 await page.goto('/');await expect(page.locator('.catalog-status')).toContainText('10000 Gaia',{timeout:20000});
 const reports=[];
 const cdp=await page.context().newCDPSession(page);
 for(const count of [10000,100000]){
  if(count===100000){await page.locator('.reference-controls summary').click();await page.getByRole('combobox',{name:'Katalogstorlek'}).selectOption('100000');await expect(page.locator('.catalog-status')).toContainText('100000 Gaia',{timeout:30000});}
  await cdp.send('HeapProfiler.collectGarbage');
  await page.evaluate(async()=>{const path='/src/rendering/StarCloud.tsx';const {renderMetrics}=await import(path);renderMetrics.frames.length=0;});
  await page.waitForTimeout(5000);
  reports.push(await page.evaluate(async()=>{
   const path='/src/rendering/StarCloud.tsx',statePath='/src/state.ts',searchPath='/src/data/search.ts';
   const {renderMetrics}=await import(path),{useStore}=await import(statePath),{searchStars}=await import(searchPath);
   const state=useStore.getState(),frames=[...renderMetrics.frames].sort((a:number,b:number)=>a-b);
   const start=performance.now();const nearest=searchStars(state.stars,'','nearby',state.position);const searchMs=performance.now()-start;
   const memory=(performance as unknown as {memory?:{usedJSHeapSize:number}}).memory;
   return {count:state.stars.length-1,samples:frames.length,medianFrameMs:frames[Math.floor(frames.length*.5)],p95FrameMs:frames[Math.floor(frames.length*.95)],drawCalls:renderMetrics.drawCalls,geometries:renderMetrics.geometries,jsHeapBytes:memory?.usedJSHeapSize??null,pointAttributeBytes:state.stars.length*28,nearestSearchMs:searchMs,nearest:nearest[0].id};
  }));
  expect(reports.at(-1)!.count).toBe(count);expect(reports.at(-1)!.drawCalls).toBeLessThan(20);expect(reports.at(-1)!.samples).toBeGreaterThan(5);
 }
 await page.screenshot({path:'work/100k.png'});
 // A failed replacement must preserve the complete working catalog.
 await page.route('**/catalog/gaia-10000.bin',route=>route.fulfill({status:503,body:'Unavailable'}));
 // Worker requests do not pass page routes; block at browser context level.
 await page.context().route('**/catalog/gaia-10000.bin',route=>route.fulfill({status:503,body:'Unavailable'}));
 await page.getByRole('button',{name:'Ladda om katalog'}).click();await expect(page.locator('.catalog-status')).toContainText('kunde inte laddas',{timeout:20000});
 await expect(page.locator('footer')).toContainText('100000 STJÄRNOR');
 expect(errors).toEqual([]);expect(shaderErrors).toEqual([]);
 writeFileSync('work/performance.json',JSON.stringify({environment:'Headless Chrome, SwiftShader, 1280x720, DPR 1, static initial view; frame intervals, not GPU timestamps; JS heap after GC; CPU nearest search',reports},null,2));
});
