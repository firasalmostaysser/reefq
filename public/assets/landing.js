(function(){
'use strict';
/* Reefq's WhatsApp number comes from the REEFQ_WHATSAPP variable (wrangler.toml), digits only, e.g. 21698123456 */
var REEFQ_WA='';
var $=function(s){return document.querySelector(s)},$$=function(s){return Array.prototype.slice.call(document.querySelectorAll(s))};
['#lg1','#lg3'].forEach(function(s){$(s).src=ReefqInvite.LOGO});['#lg2','#lg4'].forEach(function(s){$(s).src=ReefqInvite.LOGO_DARK});
var DEMO={id:'demo',theme:'reefq',eventType:'wedding',lang:'fr',a:{name:'Yasmine',ar:'ياسمين'},b:{name:'Karim',ar:'كريم'},date:'2027-06-12',time:'20:30',venue:'Dar El Marsa',city:'La Marsa, Tunis',dress:'Tenue de soirée, tons clairs',
  events:[{type:'henna',date:'2027-06-10',time:'19:00',place:'Maison familiale, Sousse'},{type:'contract',date:'2027-06-11',time:'17:00',place:'Municipalité de La Marsa'},{type:'dinner',date:'2027-06-12',time:'20:30',place:'Dar El Marsa, La Marsa'}],
  message:{fr:'',ar:'',en:''},rsvpBy:'2027-05-20',maxGuests:4};
/* Words the page builds in script (French first); the page copy itself comes from landing-i18n.js. */
var UI={
  fr:{title:'Reefq · Invitations digitales',guest:'Famille Ben Salah',badge:'Démo',missing:'Indiquez vos prénoms et votre numéro WhatsApp.',failed:'Commande non envoyée : ',try_:'Essayer',live:'Voir en direct',sur:'Sur mesure',cards:'Cartes',close:'Fermer',themes:'Thèmes',lang:'Langue',
    ph:{'o-names':'Yasmine & Karim','o-city':'Tunis'},demo:{}},
  ar:{title:'رِفق · دعوات أعراس رقمية',guest:'عائلة بن صالح',badge:'دعوة تجريبية',missing:'أدخلوا اسميكما ورقم الواتساب.',failed:'تعذّر إرسال الطلب: ',try_:'جرّبوه',live:'شاهدوه مباشرة',sur:'حسب الطلب',cards:'بطاقات',close:'إغلاق',themes:'التصاميم',lang:'اللغة',
    ph:{'o-names':'ياسمين وكريم','o-city':'تونس'},
    demo:{venue:'دار المرسى',city:'المرسى، تونس',dress:'لباس سهرة بألوان فاتحة',places:['بيت العائلة، سوسة','بلدية المرسى','دار المرسى، المرسى']}},
  en:{title:'Reefq · Digital invitations',guest:'Ben Salah family',badge:'Demo',missing:'Please enter your first names and your WhatsApp number.',failed:'Order not sent: ',try_:'Try it',live:'See it live',sur:'Made to measure',cards:'Cards',close:'Close',themes:'Themes',lang:'Language',
    ph:{'o-names':'Yasmine & Karim','o-city':'Tunis'},
    demo:{city:'La Marsa, Tunis',dress:'Evening wear, light tones',places:['Family home, Sousse','La Marsa town hall','Dar El Marsa, La Marsa']}}
};
var LANGS=['fr','ar','en'],I18N=window.REEFQ_I18N||{};
function ui(k){return (UI[lang]||UI.fr)[k]}
var THEMES=ReefqInvite.THEME_LIST.map(function(t){return [t.id,t.name,t.fg]});
var cur='reefq',lang='fr',h=null,demoCanva=null,MODELS=[],SITES=[];
function demoData(){var d=JSON.parse(JSON.stringify(DEMO)),o=ui('demo');d.theme=cur;d.lang=lang;if(demoCanva)d.canva=demoCanva;
  ['venue','city','dress'].forEach(function(k){if(o[k])d[k]=o[k]});if(o.places)d.events.forEach(function(e,i){e.place=o.places[i]});return d}
/* The invitation lives in a fixed 390x844 frame scaled to the phone's screen, so its layout is the one a real phone shows. */
var VP_W=390,vp=document.createElement('div');vp.className='vp';$('#demo').appendChild(vp);
function fit(){var s=$('#demo').clientWidth/VP_W;if(s>0)vp.style.transform='scale('+s+')'}
if('ResizeObserver' in window)new ResizeObserver(fit).observe($('#demo'));else addEventListener('resize',fit);fit();
function demo(){if(h)h.destroy();var el=document.createElement('div');vp.innerHTML='';vp.appendChild(el);$('#demo').classList.remove('fade');
  h=ReefqInvite.render(el,demoData(),{lang:lang,guest:{id:'x',name:ui('guest'),seats:4},preview:true,badge:ui('badge'),onRsvp:function(){return new Promise(function(r){setTimeout(function(){r({})},500)})}});
  $('#demo-full').href='/i/demo?t='+cur+(lang!=='fr'?'&lang='+lang:'');tour.start()}
/* Self-playing demo: the envelope opens by itself, then the invitation moves section by section like a thumb scrolling:
   a quick eased flick brings each section near the top, it rests long enough to be read, tall sections glide through
   slowly, and after the last one the phone fades to the next theme. It pauses off-screen and stops for good as soon as
   the visitor touches the phone. */
var tour=(function(){
  var run=0,visible=false,stopped=false,userPicked=false,raf=0,timers=[];
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TOP=24,FIRST=1500,END=2500,GLIDE=40;
  function clear(){timers.forEach(clearTimeout);timers=[];cancelAnimationFrame(raf)}
  function later(fn,ms){var id=run;timers.push(setTimeout(function(){if(id===run&&visible&&!stopped)fn()},ms))}
  function scroller(){return h&&h.scroller&&h.scroller()}
  /* The scroller exists behind the closed envelope too; the invitation is open once the envelope layer (.rq3) is gone. */
  function isOpen(){return !!scroller()&&!document.querySelector('#demo .rq3')}
  /* Sections in the scroller's own (unscaled) pixels: the frame is scaled, so screen rects are divided back. */
  function sections(sc){var r=sc.getBoundingClientRect(),k=r.height/sc.clientHeight||1;
    return $$('#demo .rq-sheet').map(function(el){var b=el.getBoundingClientRect();return{top:(b.top-r.top)/k+sc.scrollTop,h:b.height/k,len:el.textContent.replace(/\s+/g,' ').trim().length}})}
  function bottom(sc){return sc.scrollHeight-sc.clientHeight}
  function easeInOut(p){return p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2}
  function linear(p){return p}
  function animate(sc,to,ms,curve,done){
    var id=run,from=sc.scrollTop,t0=0;to=Math.max(0,Math.min(bottom(sc),to));
    if(Math.abs(to-from)<2)return done();
    sc.style.scrollBehavior='auto';
    function step(t){if(id!==run||stopped)return;if(!t0)t0=t;var p=Math.min(1,(t-t0)/ms);sc.scrollTop=from+(to-from)*curve(p);
      if(p<1)raf=requestAnimationFrame(step);else done()}
    raf=requestAnimationFrame(step)}
  /* A flick: 700 ms for a short hop up to 1.1 s for a long one, fast in the middle and settling on arrival. */
  function flick(sc,to,done){animate(sc,to,Math.min(1100,700+Math.abs(to-sc.scrollTop)*.5),easeInOut,done)}
  function glide(sc,to,done){animate(sc,to,Math.abs(to-sc.scrollTop)/GLIDE*1000,linear,done)}
  /* Reading time grows with the text: 1.2 s for a short card (the countdown), about 1.5 s for a few lines, 3 s at most. */
  function readMs(len){return Math.max(1200,Math.min(3000,len*10))}
  /* Arrive at section i, rest, glide through what is below the fold, then move on. `read` false skips the rest (already read). */
  function walk(i,read){
    var sc=scroller();if(!sc)return;var g=sections(sc);
    if(i>=g.length)return flick(sc,bottom(sc),function(){later(next,END)});
    var s=g[i],target=s.top-TOP;
    function through(){var end=s.top+s.h+TOP-sc.clientHeight;
      if(end>sc.scrollTop+4)glide(sc,end,function(){later(function(){walk(i+1,true)},700)});else walk(i+1,true)}
    if(!read||sc.scrollTop>target+4)return through();
    flick(sc,target,function(){later(through,readMs(s.len))})}
  /* The section the invitation is showing now: the last one whose top has reached the resting line. */
  function current(sc){var g=sections(sc),i=0;g.forEach(function(s,j){if(s.top-TOP<=sc.scrollTop+4)i=j});return sc.scrollTop>=bottom(sc)-2?g.length:i}
  /* A picked theme is kept: the tour plays it once and stays at the bottom. Otherwise it fades to the next theme. */
  function next(){if(userPicked)return;$('#demo').classList.add('fade');
    later(function(){var i=THEMES.findIndex(function(t){return t[0]===cur});cur=THEMES[(i+1)%THEMES.length][0];themes();demo()},450)}
  function whenOpen(fn){if(isOpen())return fn();later(function(){whenOpen(fn)},150)}
  /* The opened card rests first; the hero card is read during that pause. */
  function play(){clear();run++;
    if(reduce){if(h)h.open();return}
    later(function(){h&&h.play();whenOpen(function(){later(function(){walk(0,false)},FIRST)})},1500)}
  /* Back in view after an interruption: carry on from where the invitation is, or start over if it is still closed. */
  function resume(){clear();run++;if(!isOpen())return play();later(function(){var sc=scroller();if(sc)walk(current(sc),true)},600)}
  return{
    start:function(){clear();run++;if(!stopped&&visible)play()},
    show:function(v){var was=visible;visible=v;if(!v)return clear();if(!was&&!stopped)reduce?play():resume()},
    stop:function(){stopped=true;clear();run++;$('#demo').classList.remove('fade')},
    pick:function(){userPicked=true},
    replay:function(){stopped=false;userPicked=false;demo()}
  };
})();
function themes(){$('#themes').innerHTML=THEMES.map(function(t){return '<button type="button" data-t="'+t[0]+'" aria-pressed="'+(cur===t[0])+'"><i style="background:'+t[2]+'"></i>'+t[1]+'</button>'}).join('');
  $$('[data-t]').forEach(function(b){b.onclick=function(){cur=b.dataset.t;tour.pick();themes();demo();if(window.rqTrack)window.rqTrack('theme_previewed',{theme:cur})}});
  /* Keep the chosen chip in view inside the scrolling row, without moving the page. */
  var row=$('#themes'),on=row.querySelector('[aria-pressed=true]');
  if(on&&row.scrollWidth>row.clientWidth){var r=row.getBoundingClientRect(),c=on.getBoundingClientRect();if(c.left<r.left||c.right>r.right)row.scrollLeft+=c.left+c.width/2-(r.left+r.width/2)}}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
/* Prices, percentages and add-on amounts are isolated so "149 DT" or "+49 د.ت" never flips inside Arabic text. */
function fmt(s){return esc(s).replace(/\+?\d+(?:[.,]\d+)?(?:\s?(?:%|DT|TND|د\.ت))/g,'<bdi>$&</bdi>')}
/* Language: ?lang=, then the saved choice, then the browser (ar → AR, en → EN, otherwise FR). */
function saved(){try{return localStorage.getItem('rq-lang')}catch(e){return null}}
function save(l){try{localStorage.setItem('rq-lang',l)}catch(e){}}
function pickLang(){
  var q=new URLSearchParams(location.search).get('lang');if(LANGS.indexOf(q)>=0)return q;
  var s=saved();if(LANGS.indexOf(s)>=0)return s;
  var n=String((navigator.languages&&navigator.languages[0])||navigator.language||'').toLowerCase().slice(0,2);
  return n==='ar'?'ar':n==='en'?'en':'fr'}
var FR={};$$('[data-i]').forEach(function(el){FR[el.dataset.i]=el.textContent});
function setLang(l){lang=l;var root=document.documentElement;root.lang=l;root.dir=l==='ar'?'rtl':'ltr';
  var D=l==='fr'?FR:I18N[l]||{};
  $$('[data-i]').forEach(function(el){var k=el.dataset.i;el.innerHTML=fmt(D[k]||FR[k])});
  Object.keys(UI[l].ph).forEach(function(id){$('#'+id).placeholder=UI[l].ph[id]});
  document.title=ui('title');$('#themes').setAttribute('aria-label',ui('themes'));$('#lsw').setAttribute('aria-label',ui('lang'));
  $$('#lsw a').forEach(function(a){if(a.dataset.l===l)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current')});
  if(MODELS.length)renderModels();renderSites();demo()}
$$('#lsw a').forEach(function(a){a.onclick=function(e){e.preventDefault();var l=a.dataset.l;if(l===lang)return;save(l);
  try{var u=new URL(location.href);if(u.searchParams.has('lang')){u.searchParams.set('lang',l);history.replaceState(null,'',u)}}catch(x){}
  setLang(l);if(window.rqTrack)window.rqTrack('language_changed',{lang:l})}});
$$('[data-plan]').forEach(function(a){a.addEventListener('click',function(){$('#o-plan').value=a.dataset.plan})});
/* Where the couple came from (first visit wins, kept 30 days): utm_* on post and ad links, ?ref=RQ-XXXXX from a past client (-10 %) */
var SRC=(function(){var q=new URLSearchParams(location.search),k='rq_src',v=null,now=Date.now();
  try{v=JSON.parse(localStorage.getItem(k)||'null')}catch(x){}
  if(v&&!(v.at>now-30*864e5))v=null;
  var fresh={source:q.get('utm_source')||(q.get('fbclid')?'facebook':''),medium:q.get('utm_medium')||'',campaign:q.get('utm_campaign')||'',content:q.get('utm_content')||''},ref=/^RQ-[A-Z0-9]{5}$/.test(q.get('ref')||'')?q.get('ref'):'';
  if(!v&&(fresh.source||ref))v={src:fresh,ref:ref,at:now};else if(v&&ref)v.ref=ref;
  if(v)try{localStorage.setItem(k,JSON.stringify(v))}catch(x){}
  return v||{src:{},ref:''}})();
if(SRC.ref){var rn=document.createElement('p');rn.className='small ref-note';rn.textContent=lang==='ar'?'🎁 هديّة من أحبابكم: تخفيض 10 % يُطبَّق تلقائيًا.':lang==='en'?'🎁 A gift from your friends: 10 % off, applied automatically.':'🎁 Un cadeau de vos proches : -10 %, appliqué automatiquement.';var sb=$('#of button[type=submit]');sb.parentNode.insertBefore(rn,sb)}
$('#of').onsubmit=function(e){e.preventDefault();
  var names=$('#o-names').value.trim(),phone=$('#o-phone').value.trim(),err=$('#o-err'),btn=$('#of button[type=submit]');
  if(!names||!phone){err.textContent=ui('missing');err.hidden=false;(names?$('#o-phone'):$('#o-names')).focus();return}err.hidden=true;
  btn.disabled=true;
  fetch('/api/public/orders',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({names:names,date:$('#o-date').value,city:$('#o-city').value,guests:$('#o-guests').value,plan:$('#o-plan').value,theme:$('#o-theme').value,model:modelName(),site:siteSlug(),note:$('#o-note').value,phone:phone,lang:lang,src:SRC.src,ref:SRC.ref,website:$('#o-web').value})})
   .then(function(r){return r.json().then(function(j){if(!r.ok)throw new Error(j.error||'Erreur');return j})})
   .then(function(o){if(window.rqTrack)window.rqTrack('order_created',{plan:$('#o-plan').value,theme:$('#o-theme').value,lang:lang,has_model:!!$('#o-model').value,site:siteSlug()||null},true);if(o.url)setTimeout(function(){location.href=o.url},150)})
   .catch(function(x){err.textContent=ui('failed')+x.message;err.hidden=false;btn.disabled=false});
};
function themeId(name){var n=String(name||'').toLowerCase().replace(/[^a-z]/g,'');var m=THEMES.filter(function(t){return t[0]===n||t[1].toLowerCase().replace(/[^a-z]/g,'')===n})[0];return m?m[0]:null}
/* the order form's model list: card designs, then website templates (value site:<slug>) */
function renderModelSelect(){
  $('#o-model-wrap').hidden=!(MODELS.length||SITES.length);
  var sel=$('#o-model').value,opt=function(v,t){return '<option value="'+esc(v)+'">'+esc(t)+'</option>'};
  var cards=MODELS.map(function(m){return opt(m.title,m.title)}).join(''),sites=SITES.map(function(t){return opt('site:'+t.slug,t.name)}).join('');
  $('#o-model').innerHTML='<option value="">—</option>'+(cards&&sites?'<optgroup label="'+esc(ui('cards'))+'">'+cards+'</optgroup><optgroup label="'+esc(ui('sur'))+'">'+sites+'</optgroup>':cards+sites);
  $('#o-model').value=sel;if($('#o-model').selectedIndex<0)$('#o-model').value='';
}
function siteSlug(){var v=$('#o-model').value;return v.indexOf('site:')===0?v.slice(5):''}
function modelName(){var o=$('#o-model').selectedOptions[0];return siteSlug()&&o?o.textContent:$('#o-model').value}
function renderModels(){
  renderModelSelect();
  if(!MODELS.length){$('#models').hidden=true;return}
  $('#models').hidden=false;
  var choose=lang==='fr'?FR.choose:(I18N[lang]||{}).choose||FR.choose;
  $('#models-grid').innerHTML=MODELS.map(function(m,i){return '<article class="model"><div class="art">'+(m.video?'<video src="'+esc(m.video)+'" poster="'+esc(m.image)+'" muted loop playsinline autoplay></video>':'<img loading="lazy" alt="'+esc(m.title)+'" src="'+esc(m.image)+'">')+'</div><div class="meta">'+(m.theme?'<span class="th">'+esc(m.theme)+'</span>':'')+'<h3>'+esc(m.title)+'</h3>'+(m.tags&&m.tags.length?'<span class="tags">'+esc(m.tags.join(' · '))+'</span>':'')+
    '<div class="acts"><button type="button" class="btn ghost" data-try="'+i+'">'+esc(ui('try_'))+'</button><a class="btn primary" href="#order" data-pick="'+i+'">'+esc(choose)+'</a></div></div></article>'}).join('');
  document.querySelectorAll('[data-try]').forEach(function(b){b.onclick=function(){var m=MODELS[+b.dataset.try];demoCanva={id:m.id,title:m.title,image:m.image,video:m.video};var t=themeId(m.theme);if(t){cur=t;themes()}demo();document.querySelector('.lhero').scrollIntoView({behavior:'smooth'})}});
  document.querySelectorAll('[data-pick]').forEach(function(a){a.addEventListener('click',function(){var m=MODELS[+a.dataset.pick];$('#o-model').value=m.title;var t=themeId(m.theme);if(t)$('#o-theme').value=t})});
}
/* website templates: live preview in a phone frame on wide screens, the full page on phones */
function renderSites(){
  renderModelSelect();
  if(!SITES.length){$('#modeles').hidden=true;return}
  $('#modeles').hidden=false;
  var choose=lang==='fr'?FR.choose:(I18N[lang]||{}).choose||FR.choose,lq=lang!=='fr'?'?lang='+lang:'';
  $('#sites-grid').innerHTML=SITES.map(function(t,i){return '<article class="model"><a class="art'+(t.image?'':' paper')+'" href="/modeles/'+esc(t.slug)+lq+'" data-live="'+i+'">'+(t.image?'<img loading="lazy" alt="'+esc(t.name)+'" src="'+esc(t.image)+'">':esc(t.name))+'</a><div class="meta">'+(t.theme?'<span class="th">'+esc(t.theme)+'</span>':'')+'<h3>'+esc(t.name)+'</h3>'+(t.tags&&t.tags.length?'<span class="tags">'+esc(t.tags.join(' · '))+'</span>':'')+
    '<div class="acts"><a class="btn ghost" href="/modeles/'+esc(t.slug)+lq+'" data-live="'+i+'">'+esc(ui('live'))+'</a><a class="btn primary" href="#order" data-pick-site="'+i+'">'+esc(choose)+'</a></div></div></article>'}).join('');
  $$('[data-live]').forEach(function(a){a.addEventListener('click',function(e){if(!wide())return;e.preventDefault();live(SITES[+a.dataset.live])})});
  $$('[data-pick-site]').forEach(function(a){a.addEventListener('click',function(){pickSite(SITES[+a.dataset.pickSite])})});
}
function wide(){return !!(window.matchMedia&&matchMedia('(min-width:760px)').matches&&window.HTMLDialogElement)}
var pvSite=null;
function live(t){var d=$('#site-pv');pvSite=t;$('#site-pv-frame').src='/modeles/'+encodeURIComponent(t.slug)+(lang!=='fr'?'?lang='+lang:'');
  $('#site-pv-pick').textContent=lang==='fr'?FR.choose:(I18N[lang]||{}).choose||FR.choose;$('#site-pv-close').textContent=ui('close');d.showModal();
  if(window.rqTrack)window.rqTrack('template_previewed',{template:t.slug,lang:lang})}
function closeLive(){var d=$('#site-pv');if(d.open)d.close();$('#site-pv-frame').src='about:blank'}
$('#site-pv-close').onclick=closeLive;
$('#site-pv').addEventListener('click',function(e){if(e.target===this)closeLive()});
$('#site-pv-pick').addEventListener('click',function(){if(pvSite)pickSite(pvSite);closeLive()});
function pickSite(t){renderModelSelect();$('#o-model').value='site:'+t.slug}
function loadSites(){fetch('/api/public/site-templates').then(function(r){return r.ok?r.json():{items:[]}}).then(function(c){SITES=c.items||[];renderSites();
  var want=new URLSearchParams(location.search).get('modele'),t=SITES.filter(function(x){return x.slug===want})[0];
  if(t&&!loadSites.done){loadSites.done=true;pickSite(t);var o=$('#order');if(o)o.scrollIntoView()}}).catch(function(){})}
function loadModels(){fetch('/templates.json').then(function(r){return r.ok?r.json():{items:[]}}).then(function(c){MODELS=(c.items||[]).filter(function(m){return m.image});renderModels()}).catch(function(){})}
fetch('/api/config').then(function(r){return r.json()}).then(function(c){REEFQ_WA=String(c.whatsapp||'').replace(/[^0-9]/g,'')}).catch(function(){});
$('#o-theme').innerHTML=THEMES.map(function(t){return '<option value="'+t[0]+'">'+t[1]+'</option>'}).join('');
var dm=$('#demo');
/* Only real visitor input stops the tour (the tour's own seal click is not trusted). Mouse and keys stop it at once; on touch only a tap does,
   so a swipe that scrolls the page over the phone leaves it playing. */
dm.addEventListener('pointerdown',function(e){if(e.isTrusted&&e.pointerType!=='touch')tour.stop()},{passive:true});
['click','wheel','keydown'].forEach(function(ev){dm.addEventListener(ev,function(e){if(e.isTrusted)tour.stop()},{passive:true})});
$('#demo-replay').onclick=function(){tour.replay()};
if('IntersectionObserver' in window)new IntersectionObserver(function(es){tour.show(es[0].isIntersecting)},{threshold:.45}).observe(dm);else tour.show(true);
document.addEventListener('visibilitychange',function(){tour.show(!document.hidden&&dm.getBoundingClientRect().top<innerHeight)});
themes();setLang(pickLang());loadModels();loadSites();setInterval(function(){loadModels();loadSites()},5*60*1000);
})();
