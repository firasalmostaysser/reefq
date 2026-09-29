const {chromium}=require('playwright');const BASE=process.env.BASE||'http://127.0.0.1:8788';
const P=[['post-1-hero-fr',540,675,'hero'],['post-2-sceaux',540,675,'seals'],['post-3-invite-a-son-nom',540,675,'guest'],['post-4-offres',540,675,'offers'],['post-5-hero-ar',540,675,'hero-ar'],['story-1-commentez-lien',540,960,'story'],['story-2-ouverture',540,960,'opened']];
(async()=>{const b=await chromium.launch(process.env.CHROMIUM?{executablePath:process.env.CHROMIUM}:{});
for(const [n,w,h,k] of P){const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.clock.install({time:new Date('2026-10-01T10:00:00')});await p.clock.pauseAt(new Date('2026-10-01T10:00:01'));
 await p.goto(BASE+'/_promo/poster.html');await p.evaluate(async()=>{await document.fonts.load("40px 'Pinyon Script'");await document.fonts.load("30px 'Cormorant Garamond'");await document.fonts.ready});await p.evaluate(k=>poster(k),k);await p.clock.runFor(100);await p.clock.runFor(200);
 if(k==='opened'){await p.evaluate(()=>document.querySelector('.rq3-seal').click());for(let t=0;t<=2300;t+=50){await p.clock.runFor(50);await p.evaluate(T=>__sync(T),t)}}
 else{await p.evaluate(()=>{document.getAnimations().forEach(a=>{a.pause();try{a.currentTime=1200}catch(e){}})})}
 await p.screenshot({path:`tools/promo/out/${n}.png`});console.log(n,errs);await ctx.close()}
await b.close()})();
