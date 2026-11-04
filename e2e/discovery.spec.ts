import {test,expect} from '@playwright/test';
test('discovery categories, pagination, selection and near arrival',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/shader|webgl/i.test(m.text()))errors.push(m.text());});
 await page.goto('/');await expect(page.locator('.catalog-status')).toContainText('10000 Gaia');
 await page.getByRole('button',{name:'Upptäck',exact:true}).click();const panel=page.getByRole('region',{name:'Upptäck stjärnor'});
 await expect(panel.locator('article')).toHaveCount(10);await panel.getByRole('button',{name:'Visa fler'}).click();await expect(panel.locator('nav')).toContainText('2 /');
 await panel.getByRole('combobox').selectOption('largest');await expect(panel).toContainText('Tillräckliga verifierade uppgifter saknas');
 await panel.getByRole('combobox').selectOption('planets');await expect(panel.locator('article')).toHaveCount(2);await expect(panel.locator('article').first()).toContainText('Proxima Centauri');await panel.locator('article').filter({hasText:'Proxima Centauri'}).getByRole('button',{name:'Visa',exact:true}).click();await expect(page.locator('.details h2')).toHaveText('Proxima Centauri');
 await page.getByRole('combobox',{name:'Restid'}).selectOption('10');await page.getByRole('button',{name:'Upptäck',exact:true}).click();await panel.getByRole('combobox').selectOption('planets');await panel.locator('article').filter({hasText:'Proxima Centauri'}).getByRole('button',{name:'Res dit',exact:false}).click();
 await expect(page.locator('.arrival-notice')).toBeVisible({timeout:20000});await expect(page.locator('.arrival-notice')).toContainText('Illustrativ');
 await page.screenshot({path:'work/arrival-05.png'});
 await page.getByRole('button',{name:'Rikta mot destination',exact:true}).click();await page.waitForTimeout(1700);
 const pose=await page.evaluate(async()=>{const p='/src/navigation/diagnostics.ts';return (await import(p)).cameraDiagnostics.position;});
 await page.mouse.move(620,360);await page.mouse.down();await page.mouse.move(720,400,{steps:10});await page.mouse.up();await page.waitForTimeout(500);
 const moved=await page.evaluate(async()=>{const p='/src/navigation/diagnostics.ts';return (await import(p)).cameraDiagnostics.position;});expect(Math.hypot(...moved.map((x:number,i:number)=>x-pose[i]))).toBeLessThan(.00001);expect(Math.hypot(...moved.map((x:number,i:number)=>x-pose[i]))).toBeGreaterThan(1e-9);
 await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Upptäck',exact:true}).click();await expect(panel).toBeVisible();await page.screenshot({path:'work/discovery-mobile.png'});const overflow=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,elements:[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>({tag:e.tagName,class:e.className,right:e.getBoundingClientRect().right}))}));expect(overflow.scroll,JSON.stringify(overflow)).toBeLessThanOrEqual(overflow.width);
 expect(errors).toEqual([]);
});
