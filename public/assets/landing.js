(function(){
'use strict';
/* Reefq's WhatsApp number comes from the REEFQ_WHATSAPP variable (wrangler.toml), digits only, e.g. 21698123456 */
var REEFQ_WA='';
var $=function(s){return document.querySelector(s)},$$=function(s){return Array.prototype.slice.call(document.querySelectorAll(s))};
['#lg1','#lg3'].forEach(function(s){$(s).src=ReefqInvite.LOGO});['#lg2','#lg4'].forEach(function(s){$(s).src=ReefqInvite.LOGO_DARK});
var DEMO={id:'demo',theme:'reefq',eventType:'wedding',lang:'fr',a:{name:'Yasmine',ar:'ياسمين'},b:{name:'Karim',ar:'كريم'},date:'2027-06-12',time:'20:30',venue:'Dar El Marsa',city:'La Marsa, Tunis',dress:'Tenue de soirée, tons clairs',
  events:[{type:'henna',date:'2027-06-10',time:'19:00',place:'Maison familiale, Sousse'},{type:'contract',date:'2027-06-11',time:'17:00',place:'Municipalité de La Marsa'},{type:'dinner',date:'2027-06-12',time:'20:30',place:'Dar El Marsa, La Marsa'}],
  message:{fr:'',ar:'',en:''},rsvpBy:'2027-05-20',maxGuests:4};
var THEMES=ReefqInvite.THEME_LIST.map(function(t){return [t.id,t.name,t.fg]});
var cur='reefq',lang='fr',h=null,demoCanva=null,MODELS=[];
function demo(){if(h)h.destroy();var el=document.createElement('div');$('#demo').innerHTML='';$('#demo').appendChild(el);var d=JSON.parse(JSON.stringify(DEMO));d.theme=cur;if(demoCanva)d.canva=demoCanva;
  h=ReefqInvite.render(el,d,{lang:lang,guest:{id:'x',name:lang==='ar'?'عائلة بن صالح':'Famille Ben Salah',seats:4},preview:true,badge:lang==='ar'?'دعوة تجريبية':'Démo',onRsvp:function(){return new Promise(function(r){setTimeout(function(){r({})},500)})}});
  $('#demo-full').href='/i/demo?t='+cur+(lang!=='fr'?'&lang='+lang:'');tour.start()}
/* Self-playing demo: the envelope opens by itself, then the invitation scrolls slowly from top to bottom and starts again
   with the next theme. It pauses off-screen and stops for good as soon as the visitor touches the phone. */
var tour=(function(){
  var run=0,visible=false,stopped=false,userPicked=false,raf=0,timers=[];
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function clear(){timers.forEach(clearTimeout);timers=[];cancelAnimationFrame(raf)}
  function later(fn,ms){var id=run;timers.push(setTimeout(function(){if(id===run&&visible&&!stopped)fn()},ms))}
  function scrollDown(done){
    var sc=h&&h.scroller&&h.scroller();if(!sc)return done();
    sc.style.scrollBehavior='auto';var id=run,last=0,speed=Math.max(38,sc.clientHeight/11);
    function step(t){if(id!==run||stopped)return;if(!visible){last=0;raf=requestAnimationFrame(step);return}
      if(last){sc.scrollTop+=Math.min(60,(t-last))*speed/1000}last=t;
      if(sc.scrollTop+sc.clientHeight>=sc.scrollHeight-2)return done();raf=requestAnimationFrame(step)}
    raf=requestAnimationFrame(step)}
  function next(){if(userPicked)return demo();var i=THEMES.findIndex(function(t){return t[0]===cur});cur=THEMES[(i+1)%THEMES.length][0];themes();demo()}
  function play(){clear();run++;
    if(reduce){if(h)h.open();return}
    later(function(){h&&h.play();later(function(){scrollDown(function(){later(next,2600)})},3600)},1500)}
  return{
    start:function(){if(stopped){clear();return}if(visible)play();else{clear();run++}},
    show:function(v){var was=visible;visible=v;if(v&&!was&&!stopped){var sc=h&&h.scroller&&h.scroller();if(!sc||sc.scrollTop===0)play()}},
    stop:function(){stopped=true;clear();document.getElementById('demo').classList.remove('rq-auto')},
    pick:function(){userPicked=true;stopped=false},
    replay:function(){stopped=false;demo()}
  };
})();
function themes(){$('#themes').innerHTML=THEMES.map(function(t){return '<button type="button" data-t="'+t[0]+'" aria-pressed="'+(cur===t[0])+'"><i style="background:'+t[2]+'"></i>'+t[1]+'</button>'}).join('');
  $$('[data-t]').forEach(function(b){b.onclick=function(){cur=b.dataset.t;tour.pick();themes();demo();if(window.rqTrack)window.rqTrack('theme_previewed',{theme:cur})}})}
var AR={nav_how:'كيف نعمل',nav_offers:'العروض',nav_faq:'أسئلة',cta_short:'اطلب الآن',eyebrow:'دعوات زفاف رقمية · تونس',h1:'دعوة تُفتح كأنها ظرف حقيقي.',lead:'ورق قطني، ختم من الشمع بالحروف الأولى من اسميكما، وبطانة مذهّبة. كل ضيف يصله استدعاؤه باسمه على واتساب، وتتابعون الردود مباشرة.',cta:'احجزوا موعدكم',cta2:'شاهدوا العروض · ابتداءً من 149 د',p1:'Français · العربية · English',p2:'جاهزة في 48 ساعة',p3:'الردود مباشرة',demo_replay:'إعادة العرض',demo_full:'عرض بملء الشاشة',
 how_t:'كيف نعمل',s1t:'ترسلون لنا التفاصيل',s1d:'الأسماء، التواريخ، الأماكن والتصميم. خمس دقائق على واتساب.',s2t:'نصمّم دعوتكم',s2d:'الظرف، الختم، الألوان والنصوص بثلاث لغات. تراجعونها ونعدّلها.',s3t:'يصل كل ضيف دعوته باسمه',s3d:'رابط خاص لكل عائلة على واتساب، مع عدد المقاعد المحجوزة.',s4t:'تتابعون الردود',s4d:'من سيحضر، كم شخصاً، والملاحظات الغذائية. ملف جاهز للمموّن.',
 f1t:'ظرف حقيقي',f1d:'ورق بملمس، حافة مذهّبة، بطانة زليج أو ياسمين، وختم شمع لامع بحروفكما.',f2t:'دعوة خاصة لكل ضيف',f2d:'«عائلة بن صالح» يظهر على الظرف مع المقاعد المحجوزة لهم.',f3t:'ثلاث لغات',f3d:'يقرأ ضيوفكم بالعربية أو الفرنسية أو الإنجليزية. نكتب النصوص لكم.',f4t:'البرنامج كاملاً',f4d:'الحنّة، العقد، السهرة: المواعيد، الأماكن على الخريطة، اللباس والعدّ التنازلي.',f5t:'الردود مباشرة',f5d:'لوحة متابعة بكل الردود وعدد الأشخاص وملف CSV.',f6t:'بطاقات مطبوعة مع رمز QR',f6d:'للأجداد: نفس البطاقة ورقياً مع رمز QR يفتح الدعوة الرقمية.',
 off_t:'عروضنا',off_s:'دفعة واحدة. بدون اشتراك. عدد ضيوف غير محدود.',e1:'تصميم واحد وألوان الظرف والختم',e2:'FR · AR · EN',e3:'البرنامج والخرائط والعدّ التنازلي',e4:'لوحة الردود',e5:'رابط واحد للمشاركة',e6:'جاهزة في 48 ساعة',best:'الأكثر طلباً',g1:'كل ما في الأساسي',g2:'رابط خاص لكل ضيف باسمه',g3:'إرسال واتساب بنقرة',g4:'حكايتكما بثلاث لغات',g5:'ختم بحروف مخصّصة',g6:'قائمة الضيوف وملف للمموّن',g7:'جولتان من التعديلات',from:'ابتداءً من',r1:'كل ما في سيغنتشر',r2:'تصميم خاص ورسم لقاعتكم',r3:'بطاقات مطبوعة مع QR (حسب الطلب)',r4:'نرسل الدعوات ونتابع الردود عنكم',choose:'اختيار',addons:'إضافات: مناسبة ثانية (حنّة، خطوبة، عقد) +49 د · خدمة سريعة 24 ساعة +30 د',
 faq_t:'أسئلة متكرّرة',q1:'هل يحتاج الضيوف لتحميل تطبيق؟',a1:'لا. رابط يُفتح على أي هاتف من واتساب أو ماسنجر أو الرسائل.',q2:'هل يمكن التعديل بعد الإرسال؟',a2:'نعم. تغيير الساعة أو المكان يظهر على نفس الرابط دون إعادة الإرسال.',q3:'كيف أعرف من سيحضر؟',a3:'تصلكم لوحة بكل الردود وعدد الأشخاص والملاحظات، وملف للمموّن.',q4:'وماذا عن الضيوف الذين يفضّلون الورق؟',a4:'عرض بريستيج يضيف بطاقات مطبوعة مع رمز QR يفتح الدعوة الرقمية.',q5:'كيف أدفع؟',a5:'تسبقة 50% بتحويل بنكي عند الطلب، ترسلون صورة الوصل ونؤكّد الدفع، والباقي عند تسليم الدعوة.',
 ord_t:'احجزوا دعوتكم',ord_s:'املؤوا هذه الأسطر، ثم تصلون إلى فضائكم لدفع التسبقة بتحويل بنكي.',o_names:'اسماكما',o_date:'تاريخ الزفاف',o_city:'المدينة',o_guests:'عدد الضيوف تقريباً',o_plan:'العرض',o_theme:'التصميم',o_note:'كلمة عن مشروعكم (اختياري)',o_phone:'رقم الواتساب',o_send:'احجزوا موعدكم',foot:'دعوات زفاف رقمية، صُنعت في تونس.'};
var FR={};$$('[data-i]').forEach(function(el){FR[el.dataset.i]=el.textContent});
function setLang(l){lang=l;document.documentElement.lang=l;document.documentElement.dir=l==='ar'?'rtl':'ltr';
  $$('[data-i]').forEach(function(el){var k=el.dataset.i;el.textContent=l==='ar'&&AR[k]?AR[k]:FR[k]});
  $('#lang').textContent=l==='ar'?'Français':'عربي';demo()}
$('#lang').onclick=function(){setLang(lang==='ar'?'fr':'ar')};
$$('[data-plan]').forEach(function(a){a.addEventListener('click',function(){$('#o-plan').value=a.dataset.plan})});
$('#of').onsubmit=function(e){e.preventDefault();
  var names=$('#o-names').value.trim(),phone=$('#o-phone').value.trim(),err=$('#o-err'),btn=$('#of button[type=submit]');
  if(!names||!phone){err.textContent=lang==='ar'?'أدخلوا اسميكما ورقم الواتساب.':'Indiquez vos prénoms et votre numéro WhatsApp.';err.hidden=false;(names?$('#o-phone'):$('#o-names')).focus();return}err.hidden=true;
  btn.disabled=true;
  fetch('/api/public/orders',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({names:names,date:$('#o-date').value,city:$('#o-city').value,guests:$('#o-guests').value,plan:$('#o-plan').value,theme:$('#o-theme').value,model:$('#o-model').value,note:$('#o-note').value,phone:phone,lang:lang,website:$('#o-web').value})})
   .then(function(r){return r.json().then(function(j){if(!r.ok)throw new Error(j.error||'Erreur');return j})})
   .then(function(o){if(window.rqTrack)window.rqTrack('order_created',{plan:$('#o-plan').value,theme:$('#o-theme').value,lang:lang,has_model:!!$('#o-model').value},true);if(o.url)setTimeout(function(){location.href=o.url},150)})
   .catch(function(x){err.textContent=(lang==='ar'?'تعذّر إرسال الطلب: ':'Commande non envoyée : ')+x.message;err.hidden=false;btn.disabled=false});
};
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function themeId(name){var n=String(name||'').toLowerCase().replace(/[^a-z]/g,'');var m=THEMES.filter(function(t){return t[0]===n||t[1].toLowerCase().replace(/[^a-z]/g,'')===n})[0];return m?m[0]:null}
function renderModels(){
  if(!MODELS.length){$('#models').hidden=true;$('#o-model-wrap').hidden=true;return}
  $('#models').hidden=false;$('#o-model-wrap').hidden=false;
  $('#o-model').innerHTML='<option value="">—</option>'+MODELS.map(function(m){return '<option>'+esc(m.title)+'</option>'}).join('');
  $('#models-grid').innerHTML=MODELS.map(function(m,i){return '<article class="model"><div class="art">'+(m.video?'<video src="'+esc(m.video)+'" poster="'+esc(m.image)+'" muted loop playsinline autoplay></video>':'<img loading="lazy" alt="'+esc(m.title)+'" src="'+esc(m.image)+'">')+'</div><div class="meta">'+(m.theme?'<span class="th">'+esc(m.theme)+'</span>':'')+'<h3>'+esc(m.title)+'</h3>'+(m.tags&&m.tags.length?'<span class="tags">'+esc(m.tags.join(' · '))+'</span>':'')+
    '<div class="acts"><button type="button" class="btn ghost" data-try="'+i+'">'+(lang==='ar'?'جرّبوه':'Essayer')+'</button><a class="btn primary" href="#order" data-pick="'+i+'">'+(lang==='ar'?'اختيار':'Choisir')+'</a></div></div></article>'}).join('');
  document.querySelectorAll('[data-try]').forEach(function(b){b.onclick=function(){var m=MODELS[+b.dataset.try];demoCanva={id:m.id,title:m.title,image:m.image,video:m.video};var t=themeId(m.theme);if(t){cur=t;themes()}demo();document.querySelector('.lhero').scrollIntoView({behavior:'smooth'})}});
  document.querySelectorAll('[data-pick]').forEach(function(a){a.addEventListener('click',function(){var m=MODELS[+a.dataset.pick];$('#o-model').value=m.title;var t=themeId(m.theme);if(t)$('#o-theme').value=t})});
}
function loadModels(){fetch('/templates.json').then(function(r){return r.ok?r.json():{items:[]}}).then(function(c){MODELS=(c.items||[]).filter(function(m){return m.image});renderModels()}).catch(function(){})}
fetch('/api/config').then(function(r){return r.json()}).then(function(c){REEFQ_WA=String(c.whatsapp||'').replace(/[^0-9]/g,'')}).catch(function(){});
$('#o-theme').innerHTML=THEMES.map(function(t){return '<option value="'+t[0]+'">'+t[1]+'</option>'}).join('');
var dm=$('#demo');dm.classList.add('rq-auto');
['pointerdown','wheel','keydown'].forEach(function(ev){dm.addEventListener(ev,function(){tour.stop()},{passive:true})});
$('#demo-replay').onclick=function(){tour.replay()};
if('IntersectionObserver' in window)new IntersectionObserver(function(es){tour.show(es[0].isIntersecting)},{threshold:.45}).observe(dm);else tour.show(true);
document.addEventListener('visibilitychange',function(){tour.show(!document.hidden&&dm.getBoundingClientRect().top<innerHeight)});
themes();demo();loadModels();setInterval(loadModels,5*60*1000);
})();
