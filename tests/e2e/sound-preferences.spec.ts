import {test,expect} from '@playwright/test';
for(const viewport of [{width:1280,height:800},{width:390,height:844}])test(`sound choice survives visits at ${viewport.width}px`,async({page})=>{
 await page.setViewportSize(viewport);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await page.getByRole('button',{name:'Start adventure with sound',exact:true}).click();
 await expect(page.getByRole('button',{name:'Sound on',exact:true})).toBeVisible();await expect(page.locator('.dialogue')).toBeVisible();
 await page.reload();await expect(page.getByRole('button',{name:'Start adventure with sound',exact:true})).toHaveCount(0);await expect(page.getByRole('button',{name:'Sound on next input',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Continue',exact:true}).click();await expect(page.getByRole('button',{name:'Sound on',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Sound on',exact:true}).click();await page.reload();
 await page.getByRole('button',{name:'Continue',exact:true}).click();await expect(page.getByRole('button',{name:'Sound off',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Sound off',exact:true}).click();await page.reload();
 await page.getByRole('button',{name:'Sound on next input',exact:true}).click();await expect(page.getByRole('button',{name:'Sound off',exact:true})).toBeVisible();
 expect(errors).toEqual([]);
});
test('remembered sound starts on keyboard interaction even when storage writes fail',async({page})=>{
 await page.goto('/');await page.evaluate(()=>localStorage.setItem('borrowed-tomorrow:sound','on'));await page.reload();
 await page.evaluate(()=>{Storage.prototype.setItem=()=>{throw new Error('blocked');};});
 await page.getByRole('button',{name:'Begin Chapter One',exact:true}).focus();await page.keyboard.press('Enter');
 await expect(page.getByRole('button',{name:'Sound on',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Sound on',exact:true}).click();await expect(page.getByRole('button',{name:'Sound off',exact:true})).toBeVisible();
});
