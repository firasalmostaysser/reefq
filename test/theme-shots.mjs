// Theme screenshots on phone viewports: every theme closed + open (+ full length), per language,
// with contact sheets and automatic checks (page errors, horizontal overflow, text contrast).
// Needs `npm run dev` running.  BASE=http://localhost:8888 OUT=test/out-themes node test/theme-shots.mjs
// Filters: THEMES=sidi,kairouan  LANGS=fr,ar,en  VPS=390x844  FULL=0 (skip full-length shots)
// PERF=1 measures the envelope opening at 4x CPU throttling instead of taking screenshots.
import { chromium } from 'playwright';
import { mkdirSync, readFileSync } from 'node:fs';
const out=process.env.OUT||'test/out-themes', B=(process.env.BASE||'http://localhost:8888')+'/theme-preview.html';
const ALL=['reefq','zitouna','yasmine','layl','sidi','kairouan','oldmoney','sauge','bordeaux','sahara'];
const list=(v,d)=>v?v.split(',').filter(Boolean):d;
const themes=list(process.env.THEMES,ALL), langs=list(process.env.LANGS,['fr','ar']);
const vps=list(process.env.VPS,['360x740','390x844','430x932']).map(s=>{const[w,h]=s.split('x').map(Number);return{w,h}});
mkdirSync(out,{recursive:true});
const b=await chromium.launch(process.env.CHROMIUM?{executablePath:process.env.CHROMIUM}:{});
const errs=[],issues=[];
const ready=p=>p.evaluate(()=>document.fonts.ready.then(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))));

if(process.env.PERF==='1'){
  // Frame timing of the opening (tap on seal -> invitation shown) on a mid-range phone profile
  const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2.625,isMobile:true,hasTouch:true});
  for(const t of themes){
    const p=await ctx.newPage();p.on('pageerror',e=>errs.push(t+': '+e.message));
    await p.goto(`${B}?t=${t}&lang=fr`);await p.waitForSelector('.rq3-seal canvas');await ready(p);await p.waitForTimeout(600);
    const cdp=await ctx.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
    await p.evaluate(()=>{window.__f=[];window.__s=performance.now();const loop=n=>{window.__f.push(n);if(n-window.__s<4200)requestAnimationFrame(loop)};requestAnimationFrame(loop)});
    await p.tap('.rq3-seal');await p.waitForTimeout(4600);
    const [f,s]=await p.evaluate(()=>[window.__f,window.__s]);await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});
    const d=f.slice(1).map((x,i)=>x-f[i]),dur=f[f.length-1]-f[0];
    const pct=q=>[...d].sort((a,b)=>a-b)[Math.floor(d.length*q)];
    const long=d.map((x,i)=>[x,f[i]-s]).filter(([x])=>x>50).map(([x,at])=>`${x.toFixed(0)}ms@${(at/1000).toFixed(2)}s`).join(' ');
    console.log(`${t.padEnd(9)} ${(d.length/dur*1000).toFixed(1)} fps avg | p95 frame ${pct(.95).toFixed(1)} ms | worst ${Math.max(...d).toFixed(1)} ms | long frames: ${long||'none'}`);
    await p.close();
  }
  console.log('errors',errs);await b.close();process.exit(errs.length?1:0);
}

// Automatic checks run inside the page: horizontal overflow and WCAG contrast of plain text
const audit=()=>{
  const res=[],sc=document.querySelector('.rq-scroll');
  if(document.documentElement.scrollWidth>innerWidth+1||(sc&&sc.scrollWidth>sc.clientWidth+1))res.push('horizontal overflow');
  const rgb=s=>{const m=s.match(/[\d.]+/g)||[0,0,0,0];return[+m[0],+m[1],+m[2],m[3]==null?1:+m[3]]};
  const L=c=>{const f=v=>(v/=255)<=.03928?v/12.92:((v+.055)/1.055)**2.4;return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2])};
  const bgOf=el=>{for(let e=el;e;e=e.parentElement){const c=rgb(getComputedStyle(e).backgroundColor);if(c[3]>.5)return c}return[255,255,255,1]};
  for(const el of document.querySelectorAll('.rq-inv *')){
    if(el.closest('.rq3-card,.rq3-seal,.rq3-cardtxt'))continue;
    const own=[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim());if(!own)continue;
    const cs=getComputedStyle(el);if(cs.visibility==='hidden'||+cs.opacity<.5||!el.getClientRects().length)continue;
    const fg=rgb(cs.color);if(fg[3]<.5)continue; // foil text (transparent fill) is checked by eye
    const bg=bgOf(el),a=L(fg),c=L(bg),ratio=(Math.max(a,c)+.05)/(Math.min(a,c)+.05);
    const px=parseFloat(cs.fontSize),large=px>=24||(px>=18.66&&+cs.fontWeight>=700);
    if(ratio<(large?3:4.5))res.push(`contrast ${ratio.toFixed(2)} ${px}px "${el.textContent.trim().slice(0,28)}"`);
  }
  return[...new Set(res)];
};

const shots=[];
for(const {w,h} of vps){
  const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  const p=await ctx.newPage();p.on('pageerror',e=>errs.push(`${w}: ${e.message}`));
  for(const lang of langs)for(const t of themes){
    const tag=`${t}-${lang}-${w}`;
    await p.goto(`${B}?t=${t}&lang=${lang}&guest=1`);await p.waitForSelector('.rq3-seal canvas');await ready(p);await p.waitForTimeout(500);
    await p.screenshot({path:`${out}/${tag}-closed.png`});
    (await p.evaluate(audit)).forEach(x=>issues.push(`${tag} closed: ${x}`));
    await p.goto(`${B}?t=${t}&lang=${lang}&open=1&guest=1`);await ready(p);await p.waitForTimeout(1600);
    await p.screenshot({path:`${out}/${tag}-open.png`});
    (await p.evaluate(audit)).forEach(x=>issues.push(`${tag} open: ${x}`));
    if(process.env.FULL!=='0'){
      await p.addStyleTag({content:'#r,.rq-inv,.rq-scroll{height:auto!important;overflow-y:visible!important;overflow-x:clip!important}'});
      await p.screenshot({path:`${out}/${tag}-full.png`,fullPage:true});
    }
    shots.push({tag,t,lang,w});
  }
  await ctx.close();
}

// Contact sheets: one per viewport + language, themes side by side, closed above open
const sheet=await (await b.newContext({viewport:{width:1800,height:900}})).newPage();
const src=f=>'data:image/png;base64,'+readFileSync(f).toString('base64');
for(const {w} of vps)for(const lang of langs){
  const row=shots.filter(s=>s.w===w&&s.lang===lang);
  const cell=s=>`<figure><img src="${src(`${out}/${s.tag}-closed.png`)}"><img src="${src(`${out}/${s.tag}-open.png`)}"><figcaption>${s.t}</figcaption></figure>`;
  await sheet.setContent(`<style>body{margin:0;background:#222;display:grid;grid-template-columns:repeat(5,1fr);gap:10px;padding:10px;font:14px system-ui;color:#ddd}figure{margin:0;display:grid;grid-template-columns:1fr 1fr;gap:4px}figcaption{grid-column:1/3;text-align:center}img{width:100%}</style>${row.map(cell).join('')}`);
  await sheet.waitForLoadState('load');await sheet.screenshot({path:`${out}/_sheet-${lang}-${w}.png`,fullPage:true});
}
console.log(`${shots.length*(process.env.FULL==='0'?2:3)} screenshots in ${out}`);
console.log('issues',issues.length?'\n  '+issues.join('\n  '):'none');
console.log('errors',errs);await b.close();process.exit(errs.length?1:0);
