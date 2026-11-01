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
 await expect.poll(async()=>parseFloat(await distance().innerText()),{timeout:12000}).toBeLessThan(7);
 expect(initial).toBeGreaterThan(20);
 // Several telemetry cycles must not reset the camera after arrival.
 await page.waitForTimeout(1500);
 expect(parseFloat(await distance().innerText())).toBeGreaterThan(6);
 expect(parseFloat(await distance().innerText())).toBeLessThan(6.4);
 await page.screenshot({path:'work/desktop.png'});
 await page.getByRole('button',{name:'Rymdskepp'}).click();
 await page.getByRole('button',{name:'Till solen'}).click();
 await expect.poll(async()=>parseFloat(await distance().innerText()),{timeout:12000}).toBeLessThan(6.4);
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
