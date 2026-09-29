import { chromium } from 'playwright';
const out=process.env.OUT, B='http://localhost:8888/_promo/themes.html';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const errs=[];
const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});p.on('pageerror',e=>errs.push(e.message));
const themes=['sidi','kairouan','oldmoney','sauge','bordeaux','sahara'];
for(const t of themes){
  await p.goto(`${B}?t=${t}`);await p.waitForSelector('.rq3-seal canvas');await p.waitForTimeout(700);await p.screenshot({path:`${out}/${t}-cover.png`});
  await p.goto(`${B}?t=${t}&open=1&ph=1&lay=${t==='oldmoney'||t==='sauge'?'arch':t==='bordeaux'?'photo':'classic'}`);await p.waitForTimeout(1500);await p.screenshot({path:`${out}/${t}-open.png`});
}
await p.goto(`${B}?t=sauge&open=1&ph=7&lay=arch`);await p.waitForTimeout(1200);
await p.evaluate(()=>{const g=document.querySelector('.rq-galwrap');g&&g.scrollIntoView()});await p.waitForTimeout(400);await p.screenshot({path:`${out}/gallery.png`});
await p.click('[data-gi="1"]');await p.waitForTimeout(400);await p.screenshot({path:`${out}/lightbox.png`});
await p.goto(`${B}?t=kairouan&open=1&ph=0`);await p.waitForTimeout(1200);
await p.evaluate(()=>{document.querySelector('.rq-story').scrollIntoView()});await p.waitForTimeout(300);await p.screenshot({path:`${out}/story.png`});
await p.evaluate(()=>{document.querySelector('.rq-dress').scrollIntoView({block:'center'})});await p.waitForTimeout(300);await p.screenshot({path:`${out}/dress.png`});
await p.goto(`${B}?t=oldmoney&open=1&lang=ar&ph=1&lay=arch`);await p.waitForTimeout(1500);await p.screenshot({path:`${out}/oldmoney-ar.png`});
console.log('errors',errs);await b.close();
