import {test,expect,type Page} from '@playwright/test';
const pose=(page:Page)=>page.evaluate(async()=>{const path='/src/navigation/diagnostics.ts';const {cameraDiagnostics}=await import(path);return JSON.parse(JSON.stringify(cameraDiagnostics)) as {position:number[];quaternion:number[];owner:string};});
const gap=(a:number[],b:number[])=>Math.hypot(...a.map((x,i)=>x-b[i]));
const rotation=(a:number[],b:number[])=>1-Math.abs(a.reduce((sum,x,i)=>sum+x*b[i],0));
async function select(page:Page,name:string){await page.getByRole('textbox',{name:'Sök stjärnor'}).fill(name);await page.locator('.result').click();}

test('20 second default, pause, free look, resume and cancellation',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/');await expect(page.locator('canvas')).toBeVisible();
 await expect(page.getByRole('combobox',{name:'Restid'})).toHaveValue('20');
 await select(page,'Proxima');await page.getByRole('button',{name:'Res till stjärnan'}).click();
 await expect(page.getByRole('region',{name:'Pågående resa'})).toBeVisible();
 await page.waitForTimeout(2200);await page.getByRole('button',{name:'Pausa',exact:true}).click();
 await expect(page.getByRole('button',{name:'Återuppta'})).toBeVisible();await page.waitForTimeout(200);
 const paused=await pose(page);const pausedPercent=await page.getByLabel('Genomförd resa').innerText();expect(parseInt(pausedPercent)).toBeGreaterThan(0);await expect(page.locator('.journey-summary')).toContainText('Pausad');await page.getByRole('button',{name:'Rymdskepp',exact:false}).click();await page.getByRole('button',{name:'Kartläge',exact:false}).click();await page.waitForTimeout(500);expect(gap((await pose(page)).position,paused.position)).toBeLessThan(1e-7);await expect(page.getByLabel('Genomförd resa')).toHaveText(pausedPercent);
 await page.mouse.move(180,350);await page.mouse.down();await page.mouse.move(330,390,{steps:8});await page.mouse.up();
 const looked=await pose(page);expect(rotation(looked.quaternion,paused.quaternion)).toBeGreaterThan(.001);
 await page.getByRole('button',{name:'Återuppta'}).click();await page.waitForTimeout(700);
 const resumed=await pose(page);expect(gap(resumed.position,paused.position)).toBeGreaterThan(.01);expect(rotation(resumed.quaternion,looked.quaternion)).toBeLessThan(1e-7);
 await page.screenshot({path:'work/travel.png'});
 await page.getByRole('button',{name:'Avbryt resa'}).click();await page.waitForTimeout(200);
 const cancelled=await pose(page);await page.waitForTimeout(400);expect(gap((await pose(page)).position,cancelled.position)).toBeLessThan(1e-7);
 expect(errors).toEqual([]);
});

test('10 second arrival fits the stellar radius and preserves aiming',async({page})=>{
 await page.goto('/');await select(page,'Barnards');await page.getByRole('combobox',{name:'Restid'}).selectOption('10');
 const started=Date.now();await page.getByRole('button',{name:'Res till stjärnan'}).click();
 await expect(page.getByRole('region',{name:'Pågående resa'})).toBeVisible();
 await expect(page.locator('.arrival-notice')).toBeVisible({timeout:25000});expect(Date.now()-started).toBeGreaterThan(9000);
 const target=await page.evaluate(async()=>{const path='/src/data/catalog.ts';const {catalog}=await import(path);return catalog.find((s:{name:string})=>s.name==='Barnards stjärna').position as number[];});
 const arrived=await pose(page);const expected=await page.evaluate(async()=>{const path="/src/math/stellar.ts";const {arrivalDistance,SOLAR_RADIUS_LY}=await import(path);return arrivalDistance(SOLAR_RADIUS_LY,55,1280/720);});expect(Math.abs(gap(arrived.position,target)/expected-1)).toBeLessThan(.00001);
 const [x,y,z,w]=arrived.quaternion;const forward=[-2*(x*z+w*y),-2*(y*z-w*x),-(1-2*(x*x+y*y))];
 expect(forward.reduce((sum,v,i)=>sum+v*(target[i]-arrived.position[i])/gap(arrived.position,target),0)).toBeCloseTo(1,5);
 await select(page,'Proxima');await page.mouse.click(640,360);await expect(page.locator('.details h2')).toHaveText('Barnards stjärna');
 await page.screenshot({path:'work/arrival.png'});
});

test('ship HUD, side movement, stop and destination aiming',async({page})=>{
 await page.goto('/');await select(page,'Proxima');await page.getByRole('button',{name:'Rymdskepp',exact:false}).click();
 await expect(page.getByLabel('Sikte')).toBeVisible();await expect(page.locator('.heading-readout')).toContainText('BLICK');
 await expect(page.locator('.heading-readout')).toContainText('FÄRD');
 await expect.poll(async()=>(await pose(page)).owner).toBe('ship');const before=await pose(page);await page.keyboard.down('KeyD');await page.waitForTimeout(600);await page.keyboard.up('KeyD');
 expect(gap((await pose(page)).position,before.position)).toBeGreaterThan(.05);
 await page.getByRole('button',{name:'Stanna helt'}).click();await page.waitForTimeout(200);const stopped=await pose(page);
 await page.keyboard.down('KeyW');await page.waitForTimeout(400);await page.keyboard.up('KeyW');expect(gap((await pose(page)).position,stopped.position)).toBeLessThan(1e-7);
 await page.getByRole('button',{name:'Rikta mot destination',exact:true}).click();await page.waitForTimeout(1800);
 expect(gap((await pose(page)).position,stopped.position)).toBeLessThan(1e-7);
 await expect(page.locator('.destination-marker')).toHaveClass(/in-view/);
 await page.mouse.move(180,300);await page.mouse.down();await page.mouse.move(1100,300,{steps:15});await page.mouse.up();
 await expect(page.locator('.destination-marker')).toHaveClass(/off-screen/);await expect(page.locator('.destination-marker')).toContainText('bakom dig');
 await page.getByRole('button',{name:'Rikta mot destination',exact:true}).click();await expect(page.locator('.destination-marker')).toHaveClass(/in-view/);
 await page.screenshot({path:'work/ship.png'});
});

test('mobile catalog, references and immersive controls',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await expect(page.locator('.result')).toHaveCount(50);await page.getByRole('button',{name:'Nästa sida'}).click();await expect(page.locator('.result')).toHaveCount(50);
 await page.getByRole('button',{name:'Återställ Gaia-katalog'}).click();
 // Reset starts a journey home; cancel before changing catalog view.
 await expect(page.getByRole('button',{name:'Avbryt resa'})).toBeVisible();await page.getByRole('button',{name:'Avbryt resa'}).click();
 await page.getByRole('button',{name:'Rymdskepp',exact:false}).click();
 await page.locator('.reference-controls summary').click();await page.getByRole('checkbox',{name:'ICRS-axlar'}).check();
 await page.getByRole('checkbox',{name:'Avståndsskala',exact:false}).check();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 await page.screenshot({path:'work/mobile-navigation.png',fullPage:true});
});
