import {test,expect} from '@playwright/test';
test('Sirius aliases, stable supplement across catalogs, and close arrival',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await expect(page.locator('.catalog-status')).toContainText('10000 Gaia');
 for(const query of ['Sirius','HIP 32349','Alpha Canis Majoris','α CMa','HD48915']){await page.getByRole('textbox',{name:'Sök stjärnor'}).fill(query);await expect(page.locator('.result')).toHaveCount(1);await expect(page.locator('.result')).toContainText('Sirius A');}
 await page.locator('.result').click();await expect(page.locator('.details h2')).toHaveText('Sirius A');await expect(page.locator('.details dl').first()).toContainText('8.60 ljusår');
 await page.locator('.reference-controls summary').click();await page.getByRole('combobox',{name:'Katalogstorlek'}).selectOption('100000');await expect(page.locator('.catalog-status')).toContainText('100000 Gaia');await expect(page.locator('.result')).toHaveCount(1);await expect(page.locator('.details h2')).toHaveText('Sirius A');
 await page.getByRole('combobox',{name:'Restid'}).selectOption('10');await page.getByRole('button',{name:'Res till stjärnan'}).click();await expect(page.locator('.arrival-notice')).toContainText('Framme vid Sirius A',{timeout:20000});
 const distance=await page.evaluate(async()=>{const p='/src/state.ts',m='/src/math/coordinates.ts';const {useStore}=await import(p),{distance}=await import(m);const s=useStore.getState();return distance(s.position,s.stars.find((star:{id:string})=>star.id==='HIP 32349').position);});expect(distance).toBeGreaterThan(7e-8);expect(distance).toBeLessThan(1e-6);await page.screenshot({path:'work/sirius-arrival.png'});expect(errors).toEqual([]);
});

test('known stars remain searchable when the Gaia download fails',async({page})=>{
 await page.context().route('**/catalog/gaia-10000.bin',route=>route.fulfill({status:503,body:'Unavailable'}));await page.goto('/');await expect(page.locator('.catalog-status')).toContainText('kunde inte laddas');await page.getByRole('textbox',{name:'Sök stjärnor'}).fill('Sirius');await expect(page.locator('.result')).toHaveCount(1);await expect(page.locator('.result')).toContainText('Sirius A');
});
