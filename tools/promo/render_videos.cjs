const {chromium}=require('playwright');const BASE=process.env.BASE||'http://127.0.0.1:8788';const fs=require('fs');const {execSync}=require('child_process');
const LOGO=null;
const END_FR=(logo)=>`<img src="${logo}" alt=""><h2>L'invitation qu'on ouvre<br>comme une vraie enveloppe</h2><p>Mariage · Fiançailles · Henné<br>FR · العربية · EN</p><div class="pill">Dès 149 DT · Commentez « LIEN »</div>`;
const END_AR=(logo)=>`<img src="${logo}" alt=""><h2>دعوة تُفتح كأنها ظرف حقيقي</h2><p>زفاف · خطوبة · حنّة</p><div class="pill">ابتداءً من 149 د · علّقوا «رابط»</div>`;
const VIDEOS=[
 {name:'reel-1-ouverture-fr',dur:11500,cfg:{lang:'fr',inv:{theme:'reefq'},caption:'<span>POV : vos invités reçoivent votre faire-part</span>',capPos:'top',capIn:200,capOut:1300,tapAt:1500,scroll:[5200,8600,1150],endAt:8900,endAr:false}},
 {name:'reel-2-invite-par-nom-ar',dur:12500,cfg:{lang:'ar',inv:{theme:'zitouna'},guest:{id:'g1',name:'عائلة بن صالح',seats:4},caption:'<span>كل ضيف يوصلو استدعاء باسمو</span>',capPos:'top',capIn:200,capOut:1500,tapAt:1800,scroll:[5500,9400,'rsvp'],endAt:9900,endAr:true}},
 {name:'reel-3-layl-fr',dur:11000,cfg:{lang:'fr',inv:{theme:'layl'},caption:'<span>Thème Layl · pour vos soirées d\'été</span>',capPos:'top',capIn:200,capOut:1300,tapAt:1500,scroll:[5200,8200,700],endAt:8500,endAr:false}}
];
(async()=>{
 const only=process.argv[2];
 const b=await chromium.launch(process.env.CHROMIUM?{executablePath:process.env.CHROMIUM}:{});
 fs.mkdirSync('tools/promo/out',{recursive:true});
 for(const v of VIDEOS){ if(only&&v.name!==only)continue;
  const ctx=await b.newContext({viewport:{width:540,height:960},deviceScaleFactor:2});const p=await ctx.newPage();
  const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.clock.install({time:new Date('2026-10-01T10:00:00')});await p.clock.pauseAt(new Date('2026-10-01T10:00:01'));
  await p.goto(BASE+'/_promo/promo.html');await p.evaluate(async()=>{await document.fonts.load("40px 'Pinyon Script'");await document.fonts.ready});
  const logo=await p.evaluate(()=>ReefqInvite.LOGO);
  const cfg=Object.assign({},v.cfg,{end:v.cfg.endAr?END_AR(logo):END_FR(logo)});
  await p.evaluate(c=>{setupScene(c);document.getElementById('end').className=c.endAr?'ar':''},cfg);
  await p.clock.runFor(300);
  const dir=`/tmp/frames_${v.name}`;fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir);
  const fps=30,n=Math.round(v.dur/1000*fps);
  for(let i=0;i<n;i++){const T=i*1000/fps;
    if(i>0)await p.clock.runFor(1000/fps);
    await p.evaluate(T=>__sync(T),T);
    await p.screenshot({path:`${dir}/f${String(i).padStart(4,'0')}.jpg`,type:'jpeg',quality:90});
  }
  execSync(`ffmpeg -y -loglevel error -framerate ${fps} -i ${dir}/f%04d.jpg -c:v libx264 -pix_fmt yuv420p -crf 18 -preset medium -movflags +faststart tools/promo/out/${v.name}.mp4`);
  console.log(v.name,n,'frames',errs);await ctx.close();
 }
 await b.close();
})();
