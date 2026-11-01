import {test,expect} from '@playwright/test';

test('travel moves the camera and remains at the destination',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/');
 await expect(page.locator('canvas')).toBeVisible();
 await page.getByRole('textbox',{name:'Sök stjärnor'}).fill('Proxima');
 await page.locator('.result').click();
 const distance=()=>page.locator('dl div').filter({has:page.locator('dt',{hasText:'Från kameran'})}).locator('dd');
 await expect(distance()).toContainText('ljusår');
 const initial=parseFloat((await distance().innerText()));
 await page.getByRole('button',{name:'Res till stjärnan'}).click();
 await expect.poll(async()=>parseFloat(await distance().innerText()),{timeout:30000}).toBeLessThan(3.1);
 expect(initial).toBeGreaterThan(20);
 // Several telemetry cycles must not reset the camera after arrival.
 await page.waitForTimeout(1500);
 expect(parseFloat(await distance().innerText())).toBeGreaterThan(2.99);
 expect(parseFloat(await distance().innerText())).toBeLessThan(3.01);
 await page.screenshot({path:'work/desktop.png'});
 await page.getByRole('button',{name:'Rymdskepp'}).click();
 await page.getByRole('button',{name:'Till solen'}).click();
 await expect.poll(async()=>parseFloat(await distance().innerText()),{timeout:30000}).toBeLessThan(3.01);
 await page.waitForTimeout(1000);
 const before=await page.locator('footer').innerText();
 const forward=page.getByRole('button',{name:'Fram',exact:true});
 await forward.hover();await page.mouse.down();await page.waitForTimeout(700);await page.mouse.up();
 await expect.poll(()=>page.locator('footer').innerText()).not.toBe(before);
 await page.getByRole('button',{name:'Kartläge'}).click();
 expect(errors).toEqual([]);
});

test('catalog pages, reset, and mobile layout',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await expect(page.locator('.result')).toHaveCount(50);
 for(let i=0;i<3;i++)await page.getByRole('button',{name:'Nästa sida'}).click();
 await expect(page.locator('.result')).toHaveCount(1);
 await page.getByRole('button',{name:'Återställ Gaia-katalog'}).click();
 await expect(page.locator('.result')).toHaveCount(50);
 await expect(page.getByRole('button',{name:'Föregående sida'})).toBeDisabled();
 const overflows=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth);
 expect(overflows).toBe(false);
 await page.screenshot({path:'work/mobile.png',fullPage:true});
});

test('camera ownership, cancellation, non-solar and repeated journeys',async({page})=>{
 await page.goto('/');await expect(page.locator('canvas')).toBeVisible();
 const pose=()=>page.evaluate(async()=>{const path='/src/navigation/diagnostics.ts';const {cameraDiagnostics}=await import(path);return JSON.parse(JSON.stringify(cameraDiagnostics)) as {position:number[];quaternion:number[];owner:string};});
 const separation=(a:number[],b:number[])=>Math.hypot(...a.map((x,i)=>x-b[i]));
 const rotationDistance=(a:number[],b:number[])=>1-Math.abs(a.reduce((sum,x,i)=>sum+x*b[i],0));
 const select=async(name:string)=>{await page.getByRole('textbox',{name:'Sök stjärnor'}).fill(name);await page.locator('.result').click();};
 const travel=()=>page.getByRole('button',{name:'Res till stjärnan'}).click();
 const arrived=async()=>{await expect.poll(async()=>(await pose()).owner,{timeout:30000}).not.toBe('journey');};
 await select('Proxima');await travel();
 await expect.poll(async()=>(await pose()).owner).toBe('journey');
 await page.getByRole('button',{name:'Rymdskepp'}).click();
 expect((await pose()).owner).toBe('journey');
 await page.getByRole('button',{name:'Avbryt resa'}).click();
 await expect.poll(async()=>(await pose()).owner).toBe('ship');
 const stopped=await pose();await page.waitForTimeout(400);const still=await pose();
 expect(separation(stopped.position,still.position)).toBeLessThan(1e-8);
 expect(rotationDistance(stopped.quaternion,still.quaternion)).toBeLessThan(1e-8);
 await page.getByRole('button',{name:'Kartläge'}).click();await page.waitForTimeout(200);
 const map=await pose();expect(separation(still.position,map.position)).toBeLessThan(1e-7);
 expect(rotationDistance(still.quaternion,map.quaternion)).toBeLessThan(1e-7);
 await travel();await expect.poll(async()=>(await pose()).owner).toBe('journey');await arrived();
 // A second non-solar destination must also be approached and faced correctly.
 await select('Barnards');await travel();await expect.poll(async()=>(await pose()).owner).toBe('journey');await arrived();
 const atBarnard=await pose();
 const target=await page.evaluate(async()=>{const path='/src/data/catalog.ts';const {catalog}=await import(path);return catalog.find((s:{name:string})=>s.name==='Barnards stjärna').position as number[];});
 expect(separation(atBarnard.position,target)).toBeCloseTo(3,5);
 // Rotate the local -Z vector by the measured quaternion and compare to the target.
 const [x,y,z,w]=atBarnard.quaternion;
 const forward=[-2*(x*z+w*y),-2*(y*z-w*x),-(1-2*(x*x+y*y))];
 const toward=target.map((v,i)=>(v-atBarnard.position[i])/3);
 expect(forward.reduce((sum,v,i)=>sum+v*toward[i],0)).toBeCloseTo(1,6);
 await travel();await expect.poll(async()=>(await pose()).owner).toBe('journey');await arrived();
 expect(separation((await pose()).position,atBarnard.position)).toBeLessThan(1e-7);
 await select('Solen');await travel();await expect.poll(async()=>(await pose()).owner).toBe('journey');
 await page.keyboard.press('Escape');await expect.poll(async()=>(await pose()).owner).toBe('map');
 const escaped=await pose();await page.waitForTimeout(400);
 expect(separation((await pose()).position,escaped.position)).toBeLessThan(1e-7);
});
