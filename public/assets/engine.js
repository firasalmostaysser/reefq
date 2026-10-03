(function(){
'use strict';
var T={
 en:{k_engagement:'are getting engaged',k_henna:'invite you to their henna night',k_contract:'are tying the knot',dear:'Dear',seatsFor:'Seats reserved for you',married:'are getting married',tap:'Touch the seal to open',msg:'Together with their families, they joyfully invite you to celebrate their wedding',count:'Until we say yes',story:'Our story',just:'Just married',d:'Days',h:'Hours',m:'Minutes',s:'Seconds',program:'The celebrations',dress:'Dress code',rsvp:'Kindly reply',by:'Please reply by',name:'Your full name',att:'Will you join us?',yes:'Joyfully accepts',no:'Regretfully declines',guests:'Number of guests',diet:'Dietary needs',note:'A note for the couple',send:'Send my reply',thanks:'Thank you. Your reply has reached the couple.',wa:'Send it on WhatsApp',preview:'Preview only. Replies are not recorded.',map:'Open in Maps',err:'Your reply could not be sent. Please try again.',need:'Please enter your name and choose an answer.',personal:'To reply, open the personal link you received.',confirm:'Reply',at:'at',
  ev:{henna:'Henna Night',contract:'Marriage Contract',ceremony:'Wedding Ceremony',dinner:'Wedding Dinner',outia:'Outia',brunch:'Farewell Brunch'}},
 fr:{k_engagement:'se fiancent',k_henna:'vous convient à leur soirée du henné',k_contract:'scellent leur union',dear:'Cher·e',seatsFor:'Places réservées pour vous',married:'se disent oui',tap:'Touchez le sceau pour ouvrir',msg:'Entourés de leurs familles, ils ont la joie de vous convier à leur mariage',count:'Avant le grand jour',story:'Notre histoire',just:'Jeunes mariés',d:'Jours',h:'Heures',m:'Minutes',s:'Secondes',program:'Le programme',dress:'Tenue',rsvp:'Merci de confirmer',by:'Réponse souhaitée avant le',name:'Nom et prénom',att:'Serez-vous des nôtres ?',yes:'Avec joie, je serai là',no:'À regret, je ne pourrai pas venir',guests:'Nombre de personnes',diet:'Régime alimentaire',note:'Un mot pour les mariés',send:'Envoyer ma réponse',thanks:'Merci ! Votre réponse est bien parvenue aux mariés.',wa:'Envoyer sur WhatsApp',preview:'Aperçu : les réponses ne sont pas enregistrées.',map:'Ouvrir dans Maps',err:"Votre réponse n'a pas pu être envoyée. Réessayez.",need:'Indiquez votre nom et choisissez une réponse.',personal:'Pour répondre, ouvrez le lien personnel que vous avez reçu.',confirm:'Confirmer ma présence',at:'à',
  ev:{henna:'Soirée du henné',contract:'Contrat de mariage',ceremony:'Cérémonie',dinner:'Dîner de fête',outia:'Outia',brunch:"Brunch d'au revoir"}},
 ar:{k_engagement:'يحتفلان بخطوبتهما',k_henna:'يدعوانكم إلى ليلة الحنّة',k_contract:'يحتفلان بعقد قرانهما',dear:'إلى',seatsFor:'عدد المقاعد المحجوزة لكم',married:'يحتفلان بزفافهما',tap:'المسوا الختم لفتح الدعوة',msg:'بقلوبٍ يغمرها الفرح، تتشرّف عائلتاهما بدعوتكم لمشاركتهما فرحة زفافهما',count:'على موعدٍ مع الفرح',story:'حكايتنا',just:'تمّ الزفاف',d:'أيام',h:'ساعات',m:'دقائق',s:'ثوانٍ',program:'برنامج الأفراح',dress:'اللباس',rsvp:'نرجو تأكيد حضوركم',by:'يُرجى الرد قبل',name:'الاسم واللقب',att:'هل ستشاركوننا الفرحة؟',yes:'بكل سرور، سأحضر',no:'أعتذر عن الحضور',guests:'عدد الأشخاص',diet:'ملاحظات غذائية',note:'كلمة للعروسين',send:'إرسال الرد',thanks:'شكراً لكم، وصل ردّكم إلى العروسين.',wa:'أرسل عبر واتساب',preview:'معاينة فقط: لا يتم حفظ الردود.',map:'افتح الخريطة',err:'تعذّر إرسال الرد، حاولوا مجدداً.',need:'أدخلوا الاسم واختاروا الإجابة.',personal:'للرد، افتحوا الرابط الشخصي الذي وصلكم.',confirm:'تأكيد الحضور',at:'على الساعة',
  ev:{henna:'ليلة الحنّة',contract:'عقد القران',ceremony:'حفل الزفاف',dinner:'عشاء الزفاف',outia:'الوطية',brunch:'فطور الوداع'}}
};
/* Opening lines at the top of the invitation. Several can be chosen; they always show in this order (inv.openings = ids;
   older invitations hold one id in inv.opening). Verses are quoted exactly with their reference; the meaning shows under the
   Arabic when the invitation is read in French or English. The forms list the same ids and order (wording-templates.js). */
var OPENING_LIST=[
  {id:'bismillah',ar:'بسم الله الرحمن الرحيم'},
  {id:'khaliq',ar:'باسم خالق الحبّ',fr:'Au nom du Créateur de l\'amour',en:'In the name of the Creator of love'},
  {id:'verse',verse:true,ar:'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً',
    fr:'Et parmi Ses signes, Il vous a créé des épouses issues de vous-mêmes, afin que vous trouviez auprès d\'elles la sérénité, et Il a mis entre vous affection et miséricorde.',
    en:'And among His signs is that He created for you spouses from among yourselves, that you may find tranquillity in them, and He placed between you affection and mercy.',
    ref:{ar:'الروم: ٢١',fr:'Sourate Ar-Rûm, 21',en:'Surah Ar-Rum, 21'}},
  {id:'dhariyat',verse:true,ar:'وَمِن كُلِّ شَيْءٍ خَلَقْنَا زَوْجَيْنِ لَعَلَّكُمْ تَذَكَّرُونَ',
    fr:'Et de toute chose Nous avons créé deux époux, afin que vous vous souveniez.',en:'And of all things We created pairs, that perhaps you will remember.',
    ref:{ar:'الذاريات: ٤٩',fr:'Sourate Adh-Dhâriyât, 49',en:'Surah Adh-Dhariyat, 49'}},
  {id:'naba',verse:true,ar:'وَخَلَقْنَاكُمْ أَزْوَاجًا',fr:'Et Nous vous avons créés en couples.',en:'And We created you in pairs.',
    ref:{ar:'النبأ: ٨',fr:'Sourate An-Naba\', 8',en:'Surah An-Naba, 8'}},
  {id:'yasin',verse:true,ar:'سُبْحَانَ الَّذِي خَلَقَ الْأَزْوَاجَ كُلَّهَا',fr:'Gloire à Celui qui a créé tous les couples.',en:'Exalted is He who created all pairs.',
    ref:{ar:'يس: ٣٦',fr:'Sourate Yâ-Sîn, 36',en:'Surah Ya-Sin, 36'}},
  {id:'furqan',verse:true,ar:'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
    fr:'Seigneur, fais que nos épouses et nos descendants soient la joie de nos yeux, et fais de nous un modèle pour les pieux.',
    en:'Our Lord, grant us from our spouses and offspring comfort to our eyes, and make us a leader for the righteous.',
    ref:{ar:'الفرقان: ٧٤',fr:'Sourate Al-Furqân, 74',en:'Surah Al-Furqan, 74'}},
  {id:'hamd',ar:'الحمد لله الذي بنعمته تتمّ الصالحات',fr:'Louange à Allah, par la grâce de qui s\'accomplissent les bonnes choses',en:'Praise be to Allah, by whose grace good things are fulfilled'},
  {id:'baraka',ar:'على بركة الله',fr:'Avec la bénédiction d\'Allah',en:'With the blessing of Allah'}
];
var OPENINGS={};OPENING_LIST.forEach(function(o){OPENINGS[o.id]=o});
function openingsOf(inv){var a=Array.isArray(inv.openings)?inv.openings:inv.opening&&inv.opening!=='none'?[inv.opening]:[];
  return OPENING_LIST.filter(function(o){return a.indexOf(o.id)>=0})}
function openingHtml(inv,L){var list=openingsOf(inv);if(!list.length)return'';
  return '<div class="rq-openings">'+list.map(function(o){
    if(o.verse)return '<figure class="rq-opening rq-verse"><blockquote><p class="rq-ayah" lang="ar" dir="rtl">﴿ '+esc(o.ar)+' ﴾</p>'+(L!=='ar'?'<p class="rq-ayah-tr">'+esc(o[L]||o.fr)+'</p>':'')+'</blockquote>'+
      '<figcaption class="rq-ayah-ref"'+(L==='ar'?' lang="ar"':'')+'>'+esc(o.ref[L]||o.ref.fr)+'</figcaption></figure>';
    return '<div class="rq-opening"><p class="rq-basmala" lang="ar" dir="rtl">'+esc(o.ar)+'</p>'+(L!=='ar'&&o[L]?'<p class="rq-ayah-tr">'+esc(o[L])+'</p>':'')+'</div>'}).join('')+'</div>'}
var RQA={pocket:'/assets/env/pocket.webp',flap:'/assets/env/flap.webp',flapshadow:'/assets/env/flapshadow.webp',interior:'/assets/env/interior.webp',card:'/assets/env/card.webp',linen:'/assets/env/linen.webp'};
var LOGO='/assets/logo-light.webp';
var LOGO_DARK='/assets/logo-dark.webp';
var THEMES={reefq:{sprig:'gold'},zitouna:{sprig:'olive'},yasmine:{sprig:'jasmine'},layl:{sprig:'gold'},sidi:{sprig:'jasmine'},kairouan:{sprig:'gold'},oldmoney:{sprig:'gold'},sauge:{sprig:'olive'},bordeaux:{sprig:'jasmine'},sahara:{sprig:'gold'}};
/* One list for the studio, the landing page and the server: id, name, one-line mood, swatch colours */
var THEME_LIST=[
  {id:'reefq',name:'Reefq',sub:'Signature teal, ivory, gold line',bg:'#f6f3ea',fg:'#147d82'},
  {id:'zitouna',name:'Zitouna',sub:'Olive, ivory, antique gold, lace',bg:'#f5f1e6',fg:'#66753a'},
  {id:'yasmine',name:'Yasmine',sub:'Jasmine, soft blue, arch',bg:'#eef2f7',fg:'#1f4f96'},
  {id:'layl',name:'Layl',sub:'Midnight, gold foil, stars',bg:'#0f1a2d',fg:'#e2c47d'},
  {id:'sidi',name:'Sidi Bou Said',sub:'Whitewash, cobalt doors, bougainvillea',bg:'#f7f8f6',fg:'#1d4f91'},
  {id:'kairouan',name:'Kairouan',sub:'Kilim red, ochre, copper',bg:'#f3e9dc',fg:'#9c3b22'},
  {id:'oldmoney',name:'Old Money',sub:'Espresso, cream, serif italics',bg:'#efe7da',fg:'#3b2a20'},
  {id:'sauge',name:'Sauge',sub:'Sage green, linen, olive leaves',bg:'#f1f2ea',fg:'#667a55'},
  {id:'bordeaux',name:'Bordeaux',sub:'Burgundy, blush, rose gold',bg:'#f6ece8',fg:'#6e1f2c'},
  {id:'sahara',name:'Sahara',sub:'Sand, terracotta, Tozeur brick',bg:'#efe3cf',fg:'#9c4a2a'}
];
var uidN=0;
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function hash(s){var h=2166136261;s=String(s);for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function f1(n){return Math.round(n*10)/10}
function quad(P0,P1,P2,t){var u=1-t;return[u*u*P0[0]+2*u*t*P1[0]+t*t*P2[0],u*u*P0[1]+2*u*t*P1[1]+t*t*P2[1]]}
function quadTan(P0,P1,P2,t){return Math.atan2(2*(1-t)*(P1[1]-P0[1])+2*t*(P2[1]-P1[1]),2*(1-t)*(P1[0]-P0[0])+2*t*(P2[0]-P1[0]))*180/Math.PI}
function leaf(x,y,ang,L,w,fill,extra){
  var d='M0 0C'+f1(w)+' '+f1(-L*.28)+' '+f1(w*.9)+' '+f1(-L*.74)+' 0 '+f1(-L)+'C'+f1(-w*.9)+' '+f1(-L*.74)+' '+f1(-w)+' '+f1(-L*.28)+' 0 0Z';
  return '<g transform="translate('+f1(x)+' '+f1(y)+') rotate('+f1(ang+90)+')"><path d="'+d+'" '+fill+'/>'+(extra||'')+'</g>';
}
/* Botanical sprigs, generated per couple so no two invitations share the exact same branch */
function sprig(kind,seed){
  var r=rng(seed),id='g'+(++uidN)+'_'+seed%9999,out='',defs='';
  var P0=[70,298],P1=[34+r()*26,165],P2=[64+r()*18,10];
  var gold=kind==='gold';
  if(kind==='jasmine'){
    defs='<defs><linearGradient id="'+id+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--leaf1)"/><stop offset="1" style="stop-color:var(--leaf2)"/></linearGradient></defs>';
    out+='<path d="M'+P0+' Q'+P1+' '+P2+'" fill="none" style="stroke:var(--stem)" stroke-width="1.8" stroke-linecap="round"/>';
    var tips=[[P2[0],P2[1]]];
    for(var k=0;k<4;k++){
      var t=.25+k*.17+r()*.05,p=quad(P0,P1,P2,t),side=k%2?1:-1,len=40+r()*26,a=quadTan(P0,P1,P2,t)+side*(40+r()*15),rad=a*Math.PI/180;
      var e=[p[0]+Math.cos(rad)*len,p[1]+Math.sin(rad)*len],c=[p[0]+Math.cos(rad)*len*.5+side*6,p[1]+Math.sin(rad)*len*.5-6];
      out+='<path d="M'+f1(p[0])+' '+f1(p[1])+' Q'+f1(c[0])+' '+f1(c[1])+' '+f1(e[0])+' '+f1(e[1])+'" fill="none" style="stroke:var(--stem)" stroke-width="1.1"/>';
      tips.push(e);
      for(var j=0;j<2;j++){var lt=.35+j*.3,lp=[p[0]+(e[0]-p[0])*lt,p[1]+(e[1]-p[1])*lt];out+=leaf(lp[0],lp[1],a+(j?38:-38),15+r()*6,4.2,'fill="url(#'+id+')"')}
    }
    for(var q=0;q<7;q++){var tq=.12+q*.12,pq=quad(P0,P1,P2,tq),aq=quadTan(P0,P1,P2,tq);out+=leaf(pq[0],pq[1],aq+(q%2?44:-44),20-q*1.2+r()*4,5.5,'fill="url(#'+id+')"')}
    tips.forEach(function(tp,i){
      var n=i===0?2:1+Math.round(r()*1.4);
      for(var m=0;m<n;m++){
        var fx=tp[0]+(m?(r()-.5)*22:0),fy=tp[1]+(m?(r()-.5)*18:0),s=9+r()*4,rot=r()*72,pet='';
        for(var z=0;z<5;z++)pet+='<ellipse cx="0" cy="'+f1(-s*.55)+'" rx="'+f1(s*.3)+'" ry="'+f1(s*.56)+'" transform="rotate('+f1(z*72+rot)+')" style="fill:var(--petal);stroke:var(--petal-edge)" stroke-width=".5"/>';
        out+='<g transform="translate('+f1(fx)+' '+f1(fy)+')">'+pet+'<circle r="'+f1(s*.15)+'" style="fill:var(--pistil)"/></g>';
      }
      out+='<ellipse cx="'+f1(tp[0]+8)+'" cy="'+f1(tp[1]-9)+'" rx="2.4" ry="5.5" transform="rotate(30 '+f1(tp[0]+8)+' '+f1(tp[1]-9)+')" style="fill:var(--bud)"/>';
    });
  } else {
    var fill=gold?'fill="none" style="stroke:var(--stem)" stroke-width=".9"':'fill="url(#'+id+')"';
    if(!gold)defs='<defs><linearGradient id="'+id+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--leaf1)"/><stop offset="1" style="stop-color:var(--leaf2)"/></linearGradient></defs>';
    out+='<path d="M'+P0+' Q'+P1+' '+P2+'" fill="none" style="stroke:var(--stem)" stroke-width="'+(gold?1.2:2.2)+'" stroke-linecap="round"/>';
    var i2=0;
    for(var t2=.07;t2<.97;t2+=.068){
      var p2=quad(P0,P1,P2,t2),a2=quadTan(P0,P1,P2,t2),sd=i2%2?1:-1,L=30-t2*13+r()*7;
      var rib='<path d="M0 -2L0 '+f1(-L*.9)+'" fill="none" stroke="'+(gold?'none':'#fff')+'" stroke-opacity=".28" stroke-width=".6"/>';
      out+=leaf(p2[0],p2[1],a2+sd*(26+r()*20),L,L*.2,fill,gold?'':rib);
      if(!gold&&r()>.72){var oa=(a2-sd*60)*Math.PI/180;out+='<ellipse cx="'+f1(p2[0]+Math.cos(oa)*9)+'" cy="'+f1(p2[1]+Math.sin(oa)*9)+'" rx="4.2" ry="5.6" style="fill:var(--fruit)"/><circle cx="'+f1(p2[0]+Math.cos(oa)*9-1.4)+'" cy="'+f1(p2[1]+Math.sin(oa)*9-2)+'" r="1.2" fill="#fff" fill-opacity=".35"/>'}
      if(gold&&r()>.6)out+='<circle cx="'+f1(p2[0]+sd*10)+'" cy="'+f1(p2[1]-6)+'" r="1.3" style="fill:var(--stem)"/>';
      i2++;
    }
  }
  return '<svg viewBox="0 0 140 300" aria-hidden="true">'+defs+out+'</svg>';
}
function smoothClosed(pts){
  var n=pts.length,d='M'+f1(pts[0][0])+' '+f1(pts[0][1]);
  for(var i=0;i<n;i++){var p0=pts[(i-1+n)%n],p1=pts[i],p2=pts[(i+1)%n],p3=pts[(i+2)%n];
    d+='C'+f1(p1[0]+(p2[0]-p0[0])/6)+' '+f1(p1[1]+(p2[1]-p0[1])/6)+' '+f1(p2[0]-(p3[0]-p1[0])/6)+' '+f1(p2[1]-(p3[1]-p1[1])/6)+' '+f1(p2[0])+' '+f1(p2[1])}
  return d+'Z';
}
/* ---- Envelope v3: pre-rendered paper layers (multiply-tinted), canvas-lit wax seal, compositor-only opening ---- */
var ENV_DEFAULTS={
  reefq:{paper:'#f4efe6',seal:'#147d82',liner:'zellige',linerBg:'#147d82',table:'#ece5d8'},
  zitouna:{paper:'#f3eee3',seal:'#5b6b33',liner:'olive',linerBg:'#56662f',table:'#ebe4d6'},
  yasmine:{paper:'#fbfaf7',seal:'#27549a',liner:'jasmine',linerBg:'#1f4f96',table:'#e6eaee'},
  layl:{paper:'#1e2c48',seal:'#b8913f',liner:'zellige',linerBg:'#0f1a2d',table:'#141c2c'},
  sidi:{paper:'#fbfbf8',seal:'#b8913f',liner:'tiles',linerBg:'#1d4f91',linerInk:'#f4f1e8',table:'#dfe7ee'},
  kairouan:{paper:'#f1e6d6',seal:'#8f2f1c',liner:'kilim',linerBg:'#8f2f1c',linerInk:'#e8c37e',table:'#e6d6c1'},
  oldmoney:{paper:'#efe6d6',seal:'#4a2f22',liner:'lattice',linerBg:'#3b2a20',linerInk:'#c9a86a',table:'#d9ccb8'},
  sauge:{paper:'#f3f3ea',seal:'#6f8260',liner:'olive',linerBg:'#7d8f6a',linerInk:'#f4efe2',table:'#e4e6da'},
  bordeaux:{paper:'#f7ece8',seal:'#6e1f2c',liner:'jasmine',linerBg:'#6e1f2c',linerInk:'#e9c3b8',table:'#eadbd6'},
  sahara:{paper:'#f0e3cd',seal:'#9c4a2a',liner:'tozeur',linerBg:'#b0603a',linerInk:'#f3dcb8',table:'#e3d1b3'}
};
var PAPERS=[['#f4efe6','Ivoire'],['#efe6d6','Crème'],['#f0e3cd','Sable doré'],['#fbfaf7','Blanc coton'],['#ead6cf','Rose poudré'],['#dfe5d6','Sauge'],['#d9e4ea','Bleu brume'],['#e8dcc6','Sable'],['#147d82','Teal Reefq'],['#1e2c48','Nuit'],['#6e1f2c','Bordeaux'],['#2b2b2b','Noir']];
var SEALS=[['#147d82','Teal'],['#1d4f91','Cobalt'],['#8f2f1c','Brique'],['#4a2f22','Espresso'],['#6f8260','Sauge'],['#b8913f','Or'],['#8e1f2f','Bordeaux'],['#5b6b33','Olive'],['#27549a','Bleu'],['#d9b8b0','Rose'],['#efe8da','Nacre'],['#1b1b1b','Noir']];
var LINERS=[['zellige','Zellige'],['tiles','Faïence'],['kilim','Kilim'],['tozeur','Brique Tozeur'],['jasmine','Jasmin'],['olive','Olivier'],['lattice','Treillis'],['plain','Uni']];
function hex2rgb(h){h=String(h||'#888').replace('#','');if(h.length===3)h=h.split('').map(function(c){return c+c}).join('');var n=parseInt(h,16);return[(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]}
function lum(h){var c=hex2rgb(h);return .2126*c[0]+.7152*c[1]+.0722*c[2]}
function linerTile(kind,bg,gold){
  var s='',sz=64,st='stroke="'+gold+'" stroke-width="1" fill="none" stroke-linecap="round"';
  if(kind==='zellige'){sz=72;var c=36,r=22,p=[];for(var i=0;i<16;i++){var a=i*Math.PI/8-Math.PI/2,rr=i%2?r*.62:r;p.push((c+Math.cos(a)*rr).toFixed(1)+','+(c+Math.sin(a)*rr).toFixed(1))}
    s='<polygon points="'+p.join(' ')+'" '+st+'/><rect x="'+(c-10)+'" y="'+(c-10)+'" width="20" height="20" transform="rotate(45 '+c+' '+c+')" '+st+'/><path d="M0 0L14 14M72 0L58 14M0 72L14 58M72 72L58 58M36 0V10M36 72V62M0 36H10M72 36H62" '+st+'/><circle cx="'+c+'" cy="'+c+'" r="2" fill="'+gold+'"/>'}
  else if(kind==='jasmine'){var fl=function(x,y,r){var o='';for(var k=0;k<5;k++){var a=k*72*Math.PI/180;o+='<ellipse cx="'+(x+Math.sin(a)*r).toFixed(1)+'" cy="'+(y-Math.cos(a)*r).toFixed(1)+'" rx="'+(r*.5).toFixed(1)+'" ry="'+(r*.95).toFixed(1)+'" transform="rotate('+(k*72)+' '+(x+Math.sin(a)*r).toFixed(1)+' '+(y-Math.cos(a)*r).toFixed(1)+')" '+st+'/>'}return o+'<circle cx="'+x+'" cy="'+y+'" r="1.6" fill="'+gold+'"/>'};
    s=fl(16,16,5)+fl(48,48,5)+'<path d="M26 22q6 6 14 4M58 54q2 8 -4 12M6 48q6-6 12-2" '+st+'/>'}
  else if(kind==='olive'){s='<path d="M8 56Q30 34 56 10" '+st+'/>';for(var j=0;j<5;j++){var t=.15+j*.17,x=8+48*t,y=56-46*t;s+='<ellipse cx="'+(x-5)+'" cy="'+(y-3)+'" rx="2.4" ry="7" transform="rotate(-70 '+(x-5)+' '+(y-3)+')" '+st+'/><ellipse cx="'+(x+3)+'" cy="'+(y+5)+'" rx="2.4" ry="7" transform="rotate(10 '+(x+3)+' '+(y+5)+')" '+st+'/>'}}
  else if(kind==='tiles'){sz=64;s='<circle cx="32" cy="32" r="13" '+st+'/><path d="M32 19Q38 26 32 32Q26 26 32 19ZM45 32Q38 38 32 32Q38 26 45 32ZM32 45Q26 38 32 32Q38 38 32 45ZM19 32Q26 26 32 32Q26 38 19 32Z" fill="'+gold+'" fill-opacity=".55"/><path d="M0 12A12 12 0 0 0 12 0M52 0A12 12 0 0 0 64 12M64 52A12 12 0 0 0 52 64M12 64A12 12 0 0 0 0 52" '+st+'/><rect x=".5" y=".5" width="63" height="63" '+st+' stroke-opacity=".45"/><circle cx="32" cy="32" r="2.2" fill="'+gold+'"/>'}
  else if(kind==='kilim'){sz=48;s='<path d="M24 4L40 24L24 44L8 24Z" '+st+'/><path d="M24 14L32 24L24 34L16 24Z" fill="'+gold+'" fill-opacity=".5"/><path d="M0 0L6 6M48 0L42 6M0 48L6 42M48 48L42 42M24 4V0M24 44V48M8 24H2M40 24H46" '+st+'/><path d="M2 20V28M46 20V28" '+st+'/>'}
  else if(kind==='tozeur'){sz=40;s='<path d="M0 10H40M0 30H40M10 0V10M30 10V30M10 30V40" '+st+'/><path d="M20 16L24 20L20 24L16 20Z" fill="'+gold+'" fill-opacity=".6"/><path d="M0 16L4 20L0 24M40 16L36 20L40 24" '+st+'/>'}
  else if(kind==='lattice'){s='<path d="M0 32L32 0L64 32L32 64Z" '+st+'/><circle cx="32" cy="32" r="3" '+st+'/><circle cx="0" cy="0" r="2" fill="'+gold+'"/>'}
  var svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+sz+'" height="'+sz+'"><rect width="100%" height="100%" fill="'+bg+'"/>'+s+'</svg>';
  return 'url("data:image/svg+xml,'+encodeURIComponent(svg)+'")';
}
/* wax seal rendered once per couple: height field -> normals -> lit wax with gold-leaf initials */
function blurBox(a,w,h,r){if(r<1)return a;var t=new Float32Array(a.length),o=new Float32Array(a.length),x,y,i,s,k=1/(2*r+1);
  for(var pass=0;pass<3;pass++){var src=pass?o:a;
    for(y=0;y<h;y++){s=0;for(i=-r;i<=r;i++)s+=src[y*w+Math.min(w-1,Math.max(0,i))];for(x=0;x<w;x++){t[y*w+x]=s*k;s+=src[y*w+Math.min(w-1,x+r+1)]-src[y*w+Math.max(0,x-r)]}}
    for(x=0;x<w;x++){s=0;for(i=-r;i<=r;i++)s+=t[Math.min(h-1,Math.max(0,i))*w+x];for(y=0;y<h;y++){o[y*w+x]=s*k;s+=t[Math.min(h-1,y+r+1)*w+x]-t[Math.max(0,y-r)*w+x]}}}
  return o}
function maskOf(w,h,draw){var c=document.createElement('canvas');c.width=w;c.height=h;var g=c.getContext('2d');g.fillStyle='#fff';g.strokeStyle='#fff';draw(g);var d=g.getImageData(0,0,w,h).data,m=new Float32Array(w*h);for(var i=0;i<w*h;i++)m[i]=d[i*4+3]/255;return m}
function sealCanvas(ini,color,seed,px){
  var S=px||340,M=Math.round(S*.14),W=S+2*M,cx=W/2,cy=W/2,R=S*.44,r=rng(seed+3);
  var ph=[r()*6,r()*6,r()*6],b0=r()*6.28,b1=b0+2+r()*1.4,pts=[];
  for(var i=0;i<72;i++){var a=i/72*Math.PI*2,da=Math.atan2(Math.sin(a-b0),Math.cos(a-b0)),db=Math.atan2(Math.sin(a-b1),Math.cos(a-b1));
    var rad=R*(1+.035*Math.sin(3*a+ph[0])+.022*Math.sin(5*a+ph[1])+.012*Math.sin(11*a+ph[2])+.09*Math.exp(-da*da/.025)+.055*Math.exp(-db*db/.018));pts.push([cx+Math.cos(a)*rad,cy+Math.sin(a)*rad])}
  var poolPath=function(g){g.beginPath();for(var k=0;k<pts.length;k++){var p0=pts[k],p1=pts[(k+1)%pts.length],mx=(p0[0]+p1[0])/2,my=(p0[1]+p1[1])/2;if(!k)g.moveTo(mx,my);else g.quadraticCurveTo(p0[0],p0[1],mx,my)}g.quadraticCurveTo(pts[0][0],pts[0][1],(pts[0][0]+pts[1][0])/2,(pts[0][1]+pts[1][1])/2);g.closePath()};
  var pool=maskOf(W,W,function(g){poolPath(g);g.fill()});
  var ring=maskOf(W,W,function(g){g.lineWidth=R*.1;g.beginPath();g.arc(cx,cy,R*.69,0,7);g.stroke()});
  var disk=maskOf(W,W,function(g){g.beginPath();g.arc(cx,cy,R*.64,0,7);g.fill()});
  var fine=maskOf(W,W,function(g){g.lineWidth=R*.018;g.beginPath();g.arc(cx,cy,R*.57,0,7);g.stroke();for(var k=0;k<36;k++){var a=k/36*6.283;g.beginPath();g.arc(cx+Math.cos(a)*R*.53,cy+Math.sin(a)*R*.53,R*.009,0,7);g.fill()}});
  var txt=maskOf(W,W,function(g){g.textAlign='center';g.textBaseline='middle';var fs=R*(ini.length>3?.46:.62);g.font=fs+"px 'Pinyon Script','Great Vibes',cursive";g.fillText(ini,cx,cy+fs*.06)});
  var nz=new Float32Array(W*W);for(var q=0;q<W*W;q++)nz[q]=r()-.5;nz=blurBox(nz,W,W,Math.round(R*.05));var nz2=new Float32Array(W*W);for(q=0;q<W*W;q++)nz2[q]=r()-.5;nz2=blurBox(nz2,W,W,2);
  var bp=blurBox(pool,W,W,Math.round(R*.045)),br=blurBox(ring,W,W,Math.round(R*.035)),bd=blurBox(disk,W,W,Math.round(R*.02)),bt=blurBox(txt,W,W,1),bf=blurBox(fine,W,W,1);
  var h=new Float32Array(W*W);
  for(i=0;i<W*W;i++){var x=i%W,y=(i/W)|0,dd=((x-cx)*(x-cx)+(y-cy)*(y-cy))/(R*R);
    h[i]=bp[i]*(.5+.42*Math.max(0,1-dd)+nz[i]*1.0*(1-disk[i]*.85))+.34*br[i]-.3*bd[i]+.16*bt[i]*disk[i]+.04*bf[i]+nz2[i]*.05*bp[i]}
  var ao=blurBox(h,W,W,Math.round(R*.06));
  var c=document.createElement('canvas');c.width=W;c.height=W;var g=c.getContext('2d');
  // cast shadow on the paper
  g.save();g.translate(R*.03,R*.09);g.filter='blur('+(R*.07).toFixed(1)+'px)';g.fillStyle='rgba(28,18,6,.42)';poolPath(g);g.fill();g.restore();
  if(!('filter' in g)||g.filter==='none'){}
  var img=g.getImageData(0,0,W,W),d=img.data,base=hex2rgb(color),gold=[.86,.69,.36],k=1/(R*.1);
  var L=[-.46,-.62,.64],Ln=Math.hypot(L[0],L[1],L[2]);L=[L[0]/Ln,L[1]/Ln,L[2]/Ln];var Hh=[L[0],L[1],L[2]+1],Hn=Math.hypot(Hh[0],Hh[1],Hh[2]);Hh=[Hh[0]/Hn,Hh[1]/Hn,Hh[2]/Hn];
  var light=lum(color)>.7;
  for(i=0;i<W*W;i++){var a=pool[i];if(a<=0.001)continue;x=i%W;y=(i/W)|0;
    var gx=(h[i+(x<W-1?1:0)]-h[i-(x>0?1:0)])/k,gy=(h[i+(y<W-1?W:0)]-h[i-(y>0?W:0)])/k;
    var nl=Math.hypot(gx,gy,1),nx=-gx/nl,ny=-gy/nl,nz=1/nl;
    var lam=Math.max(0,nx*L[0]+ny*L[1]+nz*L[2]),ndh=Math.max(0,nx*Hh[0]+ny*Hh[1]+nz*Hh[2]),sp=Math.pow(ndh,90)*1.2+Math.pow(ndh,24)*.35+Math.exp(-((nx+.32)*(nx+.32)+(ny+.42)*(ny+.42))/.018)*.85,rim=Math.pow(Math.max(0,-nx*.6-ny*.5),3)*.35;
    var occ=Math.max(0,Math.min(1,1-(ao[i]-h[i])*3.2)),isG=bt[i]*disk[i],col,rr,gg,bb;
    var shade=(.22+1.0*lam)*occ;
    rr=base[0]*shade+rim*base[0]+sp*(light?.45:.75);gg=base[1]*shade+rim*base[1]+sp*(light?.45:.75);bb=base[2]*shade+rim*base[2]+sp*(light?.45:.72);
    var sub=Math.max(0,1-h[i]*1.6)*.12;rr+=base[0]*sub;gg+=base[1]*sub;bb+=base[2]*sub;
    if(isG>.05){var gs=.35+.95*lam,gsp=Math.pow(Math.max(0,nx*Hh[0]+ny*Hh[1]+nz*Hh[2]),22)*1.1,t=Math.min(1,isG*1.4);
      rr=rr*(1-t)+t*(gold[0]*gs+gsp);gg=gg*(1-t)+t*(gold[1]*gs+gsp*.92);bb=bb*(1-t)+t*(gold[2]*gs+gsp*.7)}
    var o=i*4,sa=d[o+3]/255,A=Math.min(1,a);
    d[o]=Math.min(255,rr*255)*A+d[o]*(1-A);d[o+1]=Math.min(255,gg*255)*A+d[o+1]*(1-A);d[o+2]=Math.min(255,bb*255)*A+d[o+2]*(1-A);d[o+3]=255*(A+sa*(1-A))}
  g.putImageData(img,0,0);
  return c;
}
function flapGild(){ // gold edge inset along the flap cut, in the flap's 720x936 box
  return '<svg class="rq3-gild" viewBox="0 0 720 936" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="gd'+(++uidN)+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e6b0"/><stop offset=".4" stop-color="#c9a24f"/><stop offset=".6" stop-color="#8a6526"/><stop offset="1" stop-color="#e8cf8b"/></linearGradient></defs>'+
   '<path d="M22 8 L336 402 Q360 426 384 402 L698 8" fill="none" stroke="url(#gd'+uidN+')" stroke-width="2.6"/><path d="M34 8 L340 390 Q360 410 380 390 L686 8" fill="none" stroke="url(#gd'+uidN+')" stroke-width="1" opacity=".8"/></svg>';
}
function envOpts(inv,th){var d=ENV_DEFAULTS[th]||ENV_DEFAULTS.reefq,e=inv.env||{};return{paper:e.paper||d.paper,seal:e.seal||d.seal,liner:e.liner||d.liner,linerBg:e.linerBg||d.linerBg,linerInk:e.linerInk||d.linerInk||'#d4b26a',table:e.table||d.table}}
/* ---- Envelope v4: each theme has its own construction, closure and opening (Reefq keeps the v3 photographed layers).
   Paper = tint + grain canvas under SVG shape masks; only transform and opacity animate. Kept hooks: .rq3, .rq3-seal canvas. ---- */
var GRAIN=null;
function grainUrl(){if(GRAIN)return GRAIN;
  try{var S=256,N=128,c=document.createElement('canvas');c.width=c.height=S;var g=c.getContext('2d'),r=rng(11),base=[],i,x,y;
    for(i=0;i<N*N;i++)base.push(240+r()*12);
    var s=document.createElement('canvas');s.width=s.height=N+2;var sg=s.getContext('2d'),im=sg.createImageData(N+2,N+2);
    for(y=0;y<N+2;y++)for(x=0;x<N+2;x++){var v=base[((y+N-1)%N)*N+(x+N-1)%N],o=(y*(N+2)+x)*4;im.data[o]=im.data[o+1]=im.data[o+2]=v;im.data[o+3]=255}
    sg.putImageData(im,0,0);g.imageSmoothingEnabled=true;g.drawImage(s,-S/N,-S/N,S+2*S/N,S+2*S/N);
    var f=g.getImageData(0,0,S,S),d=f.data;for(i=0;i<S*S;i++){var n=(r()-.5)*12;d[i*4]+=n;d[i*4+1]+=n;d[i*4+2]+=n}g.putImageData(f,0,0);
    g.lineCap='round';for(var k=0;k<380;k++){x=r()*S;y=r()*S;var a=r()*6.283,l=3+r()*9,dark=r()<.55;g.strokeStyle=dark?'rgba(60,45,20,.045)':'rgba(255,255,255,.16)';g.lineWidth=.4+r()*.7;
      for(var ox=-S;ox<=S;ox+=S)for(var oy=-S;oy<=S;oy+=S){g.beginPath();g.moveTo(x+ox,y+oy);g.quadraticCurveTo(x+ox+Math.cos(a+.7)*l*.5,y+oy+Math.sin(a+.7)*l*.5,x+ox+Math.cos(a)*l,y+oy+Math.sin(a)*l);g.stroke()}}
    GRAIN='url('+c.toDataURL()+')'}catch(e){GRAIN='none'}
  return GRAIN}
function svgU(vb,body){return 'url("data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+vb+'" preserveAspectRatio="none">'+body+'</svg>')+'")'}
function mk(vb,d,clip,tf){var p='<path fill-rule="evenodd" d="'+d+'"'+(tf?' transform="'+tf+'"':'');return svgU(vb,clip?'<clipPath id="c"><path d="'+clip+'"/></clipPath>'+p+' clip-path="url(#c)"/>':p+'/>')}
/* a paper piece: masked tinted grain; inner content is clipped to the shape */
function pc(cls,vb,d,inner,st,clip,tf){return '<div class="rq4-p '+cls+'" style="--m:'+esc(mk(vb,d,clip,tf))+';'+(st||'')+'">'+(inner||'')+'</div>'}
function deco(vb,body,cls,st){return '<svg class="rq4-deco'+(cls?' '+cls:'')+'" viewBox="'+vb+'" preserveAspectRatio="none" aria-hidden="true"'+(st?' style="'+st+'"':'')+'>'+body+'</svg>'}
function cast(vb,d,st,clip){return '<div class="rq4-cast" style="'+(st||'')+'"><div style="--m:'+esc(mk(vb,d,clip))+'"></div></div>'}
/* a hinged piece with a front and a back; o.open = end transform, o.org = hinge, o.d = delay, o.zt = when it drops behind the card */
function flap4(cls,vb,d,o){o=o||{};var ax=o.y?'y':'x';
  return '<div class="rq4-flap'+(o.noz?'':' rq4-z')+' '+cls+'" style="--open:'+o.open+';transform-origin:'+o.org+';--d:'+(o.d||0)+'s;--dur:'+(o.dur||1.2)+'s;--zt:'+(o.zt||1)+'s;z-index:'+(o.z||6)+';'+(o.st||'')+'">'+
    '<div class="rq4-face">'+pc(o.front||'rq4-fr',vb,d,'<i class="rq4-sh"></i>'+(o.deco||''),o.fst,o.clip)+(o.over||'')+'</div>'+
    '<div class="rq4-face rq4-bk'+ax+'"><div class="rq4-flip'+ax+'">'+pc(o.back||'rq4-ln',vb,d,o.backDeco||'',o.bst,o.clip)+'</div></div>'+(o.child||'')+'</div>'}
function seal4(c,x,y,w,cls){return '<button type="button" class="rq3-seal'+(cls?' '+cls:'')+'" style="left:'+x+'%;top:'+y+'%;width:'+w+'%" aria-label="'+esc(c.tap)+'"></button>'}
function card4(c,pos,cls,inner){return '<div class="rq4-card'+(cls?' '+cls:'')+'" style="'+pos+'"><div class="rq4-cardp"></div>'+(inner==null?c.cardIn:inner)+'</div>'}
function gradG(id,a,b,cc){return '<linearGradient id="'+id+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+a+'"/><stop offset=".45" stop-color="'+b+'"/><stop offset=".62" stop-color="'+cc+'"/><stop offset="1" stop-color="'+a+'"/></linearGradient>'}
function goldDef(id){return gradG(id,'#f3e2a8','#c49a48','#86621f')}
function jit(r,a){return (r()-.5)*2*a}
/* scallops along a quadratic curve, bulging away from the point (cx,cy) */
function lobes(P0,P1,P2,n,depth,cx,cy){var s='';for(var i=0;i<n;i++){var a=quad(P0,P1,P2,i/n),b=quad(P0,P1,P2,(i+1)/n),m=quad(P0,P1,P2,(i+.5)/n),dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L;
  if((m[0]-cx)*nx+(m[1]-cy)*ny<0){nx=-nx;ny=-ny}s+='Q'+f1(m[0]+nx*depth*2)+' '+f1(m[1]+ny*depth*2)+' '+f1(b[0])+' '+f1(b[1])}return s}
/* torn deckle edge from A to B (points every ~step units) */
function deckle(r,A,B,amp,step){var L=Math.hypot(B[0]-A[0],B[1]-A[1]),n=Math.max(2,Math.round(L/(step||9))),s='',nx=-(B[1]-A[1])/L,ny=(B[0]-A[0])/L;
  for(var i=1;i<=n;i++){var t=i/n,k=i===n?0:jit(r,amp)+Math.sin(t*19+A[0])*amp*.4;s+='L'+f1(A[0]+(B[0]-A[0])*t+nx*k)+' '+f1(A[1]+(B[1]-A[1])*t+ny*k)}return s}
/* twisted cord (jute, leather): drop shadow + body + twist dashes + highlight */
function cord(d,col,w,dash){return '<path d="'+d+'" fill="none" stroke="rgba(30,18,4,.28)" stroke-width="'+(w+4)+'" transform="translate(3 7)" stroke-linecap="round"/>'+
  '<path d="'+d+'" fill="none" stroke="'+col+'" stroke-width="'+w+'" stroke-linecap="round"/>'+
  (dash?'<path d="'+d+'" fill="none" stroke="rgba(50,30,8,.42)" stroke-width="'+w+'" stroke-dasharray="'+dash+'"/>':'')+
  '<path d="'+d+'" fill="none" stroke="rgba(255,248,230,.38)" stroke-width="'+(w*.22)+'" transform="translate(-'+(w*.18)+' -'+(w*.18)+')"/>'}
function star8(x,y,R,r){var p=[];for(var i=0;i<16;i++){var a=i*Math.PI/8-Math.PI/2,q=i%2?r:R;p.push(f1(x+Math.cos(a)*q)+','+f1(y+Math.sin(a)*q))}return '<polygon points="'+p.join(' ')+'"/>'}
function star4(x,y,R){var r=R*.28;return '<path d="M'+x+' '+(y-R)+'Q'+(x+r)+' '+(y-r)+' '+(x+R)+' '+y+'Q'+(x+r)+' '+(y+r)+' '+x+' '+(y+R)+'Q'+(x-r)+' '+(y+r)+' '+(x-R)+' '+y+'Q'+(x-r)+' '+(y-r)+' '+x+' '+(y-R)+'Z"/>'}
function bits(cls,n,seed,fn){var r=rng(seed),o='';for(var i=0;i<n;i++)o+='<i class="'+cls+'" style="'+fn(r,i)+'"></i>';return o}
/* soft side-flap shading on an envelope pocket: two triangles meeting under the flap, bottom flap seam */
function pocketFolds(W,H,mx,my,id){return '<defs><linearGradient id="'+id+'" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".07"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient></defs>'+
  '<path d="M0 0L'+mx+' '+my+'L0 '+H+'Z" fill="url(#'+id+')"/><path d="M'+W+' 0L'+mx+' '+my+'L'+W+' '+H+'Z" fill="url(#'+id+')" transform="matrix(-1 0 0 1 '+W+' 0)"/>'+
  '<path d="M0 '+H+'L'+mx+' '+my+'L'+W+' '+H+'" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2.5"/><path d="M0 '+H+'L'+mx+' '+(my+4)+'L'+W+' '+H+'" fill="none" stroke="#000" stroke-opacity=".07" stroke-width="3"/>'}
function sprigBox(kind,seed,st,vars){return '<div class="rq4-sprig" style="'+st+';'+(vars||'')+'">'+sprig(kind,seed)+'</div>'}
var LEAFV='--leaf1:#9aa86d;--leaf2:#56653a;--stem:#6b6744;--fruit:#39402a';
var JASV='--leaf1:#86a46c;--leaf2:#3d5c34;--stem:#58714b;--petal:#fffdf8;--petal-edge:#d9d0bf;--pistil:#e6c25a;--bud:#f3e1dc';

var ENV_KINDS={
/* Zitouna: baronial round flap, jute twine crossed under the seal, olive sprig tucked under the twine */
zitouna:function(c){var W=1000,H=1250,vb='0 0 1000 1250',id='z'+(++uidN),
  fl='M0 0H1000V50C1000 400 700 730 500 730C300 730 0 400 0 50Z';
  return {ar:.8,ms:3300,crack:false,html:
    pc('rq4-ln rq4-back',vb,'M0 0H1000V1250H0Z')+
    card4(c,'left:6%;top:4%;width:88%;height:80%')+
    pc('rq4-fr rq4-pocket',vb,'M0 70Q500 760 1000 70V1250H0Z',deco(vb,pocketFolds(W,H,500,700,id+'f')))+
    cast(vb,fl,'z-index:4')+
    flap4('',vb,fl,{open:'rotateX(180deg)',org:'50% 0',d:.75,zt:1.4,deco:deco(vb,'<defs>'+goldDef(id)+'</defs><path d="M38 24V58C38 380 312 690 500 690C688 690 962 380 962 58V24" fill="none" stroke="url(#'+id+')" stroke-width="3"/><path d="M52 24V60C52 370 318 676 500 676C682 676 948 370 948 60V24" fill="none" stroke="url(#'+id+')" stroke-width="1.2" opacity=".8"/>')})+
    '<div class="rq4-tie rq4-tie-h">'+deco(vb,cord('M-20 712C300 704 700 722 1020 708','#b79c68',15,'4 6'))+sprigBox('olive',c.seed+5,'left:4%;top:41%;width:15%;height:32%;transform:rotate(-74deg)',LEAFV)+'</div>'+
    '<div class="rq4-tie rq4-tie-v">'+deco(vb,cord('M506 -20C496 300 512 900 500 1270','#b79c68',15,'4 6')+cord('M500 712C430 760 420 840 452 900','#b79c68',11,'4 6')+cord('M500 712C560 770 590 830 566 886','#b79c68',11,'4 6'))+seal4(c,50,57,30)+'</div>'}},

/* Yasmine: Moorish lobed-arch flap over an arch-cut pocket; jasmine sprig at the seal sheds petals as it opens */
yasmine:function(c){var W=1000,H=1351,vb='0 0 1000 1351',id='y'+(++uidN),
  fl='M0 0H1000V400'+lobes([1000,400],[820,800],[500,880],5,15,500,300)+lobes([500,880],[180,800],[0,400],5,15,500,300)+'Z',
  line='M968 380'+lobes([968,380],[800,760],[500,836],5,12,500,300)+lobes([500,836],[200,760],[32,380],5,12,500,300);
  return {ar:.74,ms:3000,crack:true,html:
    pc('rq4-ln rq4-back',vb,'M0 0H1000V1351H0Z')+
    card4(c,'left:7%;top:4%;width:86%;height:78%')+
    pc('rq4-fr rq4-pocket',vb,'M0 360Q240 820 500 850Q760 820 1000 360V1351H0Z',deco(vb,pocketFolds(W,H,500,860,id+'f')+'<path d="M60 1290H940" stroke="var(--linerbg)" stroke-opacity=".35" stroke-width="2"/><path d="M80 1274H920" stroke="var(--linerbg)" stroke-opacity=".18" stroke-width="1"/>'))+
    cast(vb,fl,'z-index:4')+
    flap4('',vb,fl,{open:'rotateX(180deg)',org:'50% 0',d:.55,zt:1.15,deco:deco(vb,'<path d="'+line+'" fill="none" stroke="var(--linerbg)" stroke-width="3" opacity=".75"/><path d="M500 120l16 16-16 16-16-16z" fill="var(--linerbg)" opacity=".5"/>'),
      over:sprigBox('jasmine',c.seed+9,'left:23%;top:43%;width:17%;height:27%;transform:rotate(-58deg)',JASV)+seal4(c,50,64.6,32)})+
    '<div class="rq4-fx">'+bits('rq4-petal',9,c.seed,function(r,i){return 'left:'+f1(30+r()*30)+'%;top:'+f1(52+r()*12)+'%;--pd:'+f1(.05+i*.09)+'s;--px:'+f1(jit(r,22))+'cqw;--pr:'+f1(jit(r,260))+'deg'})+'</div>'}},

/* Layl: midnight gatefold, two doors with gold-foil stars and a crescent, gold seal on the overlapping tab */
layl:function(c){var W=1000,H=1389,vb='0 0 1000 1389',id='l'+(++uidN),r=rng(c.seed+21),stL='',stR='';
  for(var i=0;i<16;i++){var x=60+r()*380,y=70+r()*1250,R=6+r()*12;if(Math.abs(y-694)<170&&x>330)continue;stL+=r()<.3?star8(x,y,R,R*.45):star4(x,y,R)}
  for(i=0;i<16;i++){x=560+r()*380;y=70+r()*1250;R=6+r()*12;stR+=r()<.3?star8(x,y,R,R*.45):star4(x,y,R)}
  var dl='M0 0H520V520C600 560 600 828 520 868V1389H0Z',dr='M480 0H1000V1389H480Z',gd='<defs>'+goldDef(id)+'</defs>',
    frame=function(x0,x1){return '<rect x="'+(x0+34)+'" y="34" width="'+(x1-x0-68)+'" height="'+(H-68)+'" fill="none" stroke="url(#'+id+')" stroke-width="3"/><rect x="'+(x0+48)+'" y="48" width="'+(x1-x0-96)+'" height="'+(H-96)+'" fill="none" stroke="url(#'+id+')" stroke-width="1.2" opacity=".7"/>'};
  return {ar:.72,ms:3100,crack:true,html:
    pc('rq4-ln rq4-back',vb,'M0 0H1000V1389H0Z')+
    '<div class="rq4-glow"></div>'+card4(c,'left:8%;top:6%;width:84%;height:88%')+
    flap4('rq4-door',vb,dr,{y:1,open:'rotateY(150deg)',org:'100% 50%',d:.75,dur:1.5,zt:1.5,z:5,deco:deco(vb,gd+frame(480,1000)+'<g fill="url(#'+id+')">'+stR+'</g>')+'<i class="rq4-sheen"></i>'})+
    flap4('rq4-door',vb,dl,{y:1,open:'rotateY(-150deg)',org:'0 50%',d:.55,dur:1.5,zt:1.3,z:6,deco:deco(vb,gd+frame(0,520)+'<path d="M520 520C600 560 600 828 520 868" fill="none" stroke="url(#'+id+')" stroke-width="3"/><g fill="url(#'+id+')">'+stL+'<path d="M180 250a80 80 0 1 0 70 118a64 64 0 1 1-70-118z"/></g>')+'<i class="rq4-sheen"></i>',over:seal4(c,52,50,30,'rq4-glowseal')})+
    '<div class="rq4-fx">'+bits('rq4-spark',12,c.seed,function(r,i){return 'left:'+f1(8+r()*84)+'%;top:'+f1(5+r()*80)+'%;--pd:'+f1(1.6+r()*1.1)+'s;--ps:'+f1(.5+r()*.9)})+'</div>'}},

/* Sidi Bou Said: whitewashed arch with a studded cobalt double door; bougainvillea over the frame; doors swing open onto light */
sidi:function(c){var W=1000,H=1613,vb='0 0 1000 1613',id='s'+(++uidN),r=rng(c.seed+31),studs='',bg='';
  var stud=function(x,y,s){return '<circle cx="'+f1(x)+'" cy="'+f1(y)+'" r="'+((s||7.5)*1.45)+'" fill="url(#'+id+'st)"/>'};
  var leaf=function(x0,isL){var o='',x1=isL?500:870,xa=isL?130:500,cx=500,i,a;
    for(var y=560;y<=1470;y+=46){o+=stud(xa+34,y)+stud(x1-34,y)}
    for(var x=xa+34;x<=x1-34;x+=46)o+=stud(x,1490);
    for(i=0;i<=12;i++){a=Math.PI+i/12*Math.PI*(isL?.5:.5)+(isL?0:Math.PI*.5);o+=stud(cx+Math.cos(a)*334,520+Math.sin(a)*334)}
    var mx=(xa+x1)/2;for(i=0;i<16;i++){a=i/16*6.283;o+=stud(mx+Math.cos(a)*110,980+Math.sin(a)*110,6.5)}
    for(i=0;i<8;i++){a=i/8*6.283;o+=stud(mx+Math.cos(a)*52,980+Math.sin(a)*52,6)}o+=stud(mx,980,9);
    for(y=640;y<=820;y+=45)o+=stud(mx,y,6);for(y=1140;y<=1400;y+=45)o+=stud(mx,y,6);
    return o};
  for(var k=0;k<34;k++){var bx=640+r()*380,by=-20+r()*380;if(k<10){bx=-20+r()*200;by=-10+r()*200}
    var s=20+r()*16,rot=r()*360;bg+='<g transform="translate('+f1(bx)+' '+f1(by)+') rotate('+f1(rot)+')">'+(r()<.35?'<ellipse rx="'+f1(s*.5)+'" ry="'+f1(s*1.05)+'" fill="#4f7a3c" transform="translate('+f1(s)+' 0) rotate(60)"/>':'')+
      [0,120,240].map(function(a){return '<path d="M0 0C'+f1(-s*.6)+' '+f1(-s*.4)+' '+f1(-s*.5)+' '+f1(-s*1.2)+' 0 '+f1(-s*1.3)+'C'+f1(s*.5)+' '+f1(-s*1.2)+' '+f1(s*.6)+' '+f1(-s*.4)+' 0 0Z" fill="'+(r()<.5?'#d23a86':'#c22a75')+'" transform="rotate('+a+')"/><path d="M0 -2V'+f1(-s)+'" stroke="#9d1d5c" stroke-width="1.2" opacity=".6" transform="rotate('+a+')"/>'}).join('')+'<circle r="3.2" fill="#f7efc4"/></g>'}
  var dl='M130 1530V520A370 370 0 0 1 500 150V1530Z',dr='M500 150A370 370 0 0 1 870 520V1530H500Z',
    defs='<defs><radialGradient id="'+id+'st" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#8a8f99"/><stop offset=".35" stop-color="#2a2d33"/><stop offset="1" stop-color="#0b0c0f"/></radialGradient></defs>',
    bevel=function(isL){var xa=isL?130:500,x1=isL?500:870;return '<path d="M'+(xa+70)+' 1460V'+(isL?'560':'560')+'" stroke="#fff" stroke-opacity=".12" stroke-width="3"/><rect x="'+(xa+62)+'" y="1130" width="'+(x1-xa-124)+'" height="300" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="4"/><rect x="'+(xa+66)+'" y="1134" width="'+(x1-xa-124)+'" height="300" fill="none" stroke="#fff" stroke-opacity=".1" stroke-width="2"/>'+
      '<path d="M'+(isL?498:502)+' 160V1528" stroke="#000" stroke-opacity=".35" stroke-width="5"/>'};
  return {ar:.62,ms:3000,crack:true,html:
    '<div class="rq4-glow rq4-glow-sidi"></div>'+card4(c,'left:17%;top:27%;width:66%;height:62%')+
    pc('rq4-fr rq4-frame',vb,'M0 0H1000V1613H0ZM130 1530V520A370 370 0 0 1 870 520V1530Z',deco(vb,
      '<path d="M96 1530V520A404 404 0 0 1 904 520V1530" fill="none" stroke="var(--linerbg)" stroke-width="16"/><path d="M118 1530V520A382 382 0 0 1 882 520V1530" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="10"/>'+
      '<rect x="60" y="1530" width="880" height="83" fill="#000" fill-opacity=".07"/><path d="M60 1532H940" stroke="#fff" stroke-width="4" stroke-opacity=".8"/><path d="M60 1560H940" stroke="#000" stroke-opacity=".08" stroke-width="2"/>'+
      '<g opacity=".06" fill="#000"><ellipse cx="200" cy="300" rx="120" ry="60"/><ellipse cx="880" cy="900" rx="90" ry="140"/></g>'+bg))+
    flap4('rq4-door',vb,dr,{y:1,open:'rotateY(-78deg)',org:'87% 50%',d:.55,dur:1.6,zt:1.25,z:5,front:'rq4-fr rq4-cobalt',back:'rq4-fr rq4-cobalt rq4-dim',deco:deco(vb,defs+leaf(500,false)+bevel(false))})+
    flap4('rq4-door',vb,dl,{y:1,open:'rotateY(78deg)',org:'13% 50%',d:.45,dur:1.6,zt:1.15,z:6,front:'rq4-fr rq4-cobalt',back:'rq4-fr rq4-cobalt rq4-dim',deco:deco(vb,defs+leaf(130,true)+bevel(true)),over:seal4(c,50,60.8,25)})+
    '<div class="rq4-fx">'+bits('rq4-bract',6,c.seed,function(r,i){return 'left:'+f1(66+r()*28)+'%;top:'+f1(3+r()*18)+'%;--pd:'+f1(.6+i*.18)+'s;--px:'+f1(jit(r,10))+'cqw;--pr:'+f1(jit(r,300))+'deg'})+'</div>'}},

/* Kairouan: square pinwheel envelope, four kilim-bordered flaps meeting under the seal, unfolded one by one */
kairouan:function(c){var vb='0 0 1000 1000',id='k'+(++uidN),ink=c.eo.linerBg,ink2=c.eo.linerInk;
  var top='M0 0H1000L545 470Q500 515 455 470Z',zig='',zig2='';
  for(var i=0;i<=20;i++){var t=i/20,ax=30+t*440,ay=30+t*440;zig+=(i?'L':'M')+f1(ax+(i%2?40:14))+' '+f1(ay-(i%2?14:40));}
  for(i=0;i<=20;i++){t=i/20;ax=970-t*440;ay=30+t*440;zig2+=(i?'L':'M')+f1(ax-(i%2?40:14))+' '+f1(ay-(i%2?14:40));}
  var band='<g clip-path="url(#'+id+'c)"><path d="M60 0L560 500M940 0L440 500" stroke="'+ink+'" stroke-width="10" fill="none" transform="translate(0 -12)"/><path d="M0 -40L520 480M1000 -40L480 480" stroke="'+ink+'" stroke-width="3" fill="none" transform="translate(0 -84)"/>'+
    '<path d="'+zig+'" fill="none" stroke="'+ink2+'" stroke-width="6" stroke-linejoin="miter" transform="translate(0 -10)"/><path d="'+zig2+'" fill="none" stroke="'+ink2+'" stroke-width="6" transform="translate(0 -10)"/>'+
    [200,330,640,770].map(function(x){return '<path d="M'+x+' 70l22 22-22 22-22-22z" fill="'+ink+'" opacity=".85"/>'}).join('')+'</g>';
  var flp=function(k,name,d,open,org,z,zt,extra){var tf='rotate('+(k*90)+' 500 500)',dd=top.replace(/[\d.]+ [\d.]+/g,function(p){var q=p.split(' ').map(Number),a=k*Math.PI/2,x=q[0]-500,y=q[1]-500;return f1(500+x*Math.cos(a)-y*Math.sin(a))+' '+f1(500+x*Math.sin(a)+y*Math.cos(a))});
    return cast(vb,dd,'z-index:'+(z-1)+';--cd:'+d+'s')+flap4(name,vb,dd,{y:k%2,open:open,org:org,d:d,dur:.95,zt:zt,z:z,deco:deco(vb,'<defs><clipPath id="'+id+'c"><path d="'+top+'"/></clipPath></defs><g transform="'+tf+'">'+band+'</g>'),over:extra||''})};
  /* the top path uses H1000; expand it so it can be rotated point by point */
  top='M0 0L1000 0L545 470Q500 515 455 470Z';
  return {ar:1,ew:'70cqw',ms:3300,crack:true,html:
    pc('rq4-ln rq4-back',vb,'M0 0H1000V1000H0Z')+
    card4(c,'left:7%;top:7%;width:86%;height:86%')+
    flp(3,'',1.35,'rotateY(-178deg)','0 50%',3,1.85)+
    flp(2,'',1.05,'rotateX(-178deg)','50% 100%',5,1.55)+
    flp(1,'',.75,'rotateY(178deg)','100% 50%',7,1.25)+
    flp(0,'',.45,'rotateX(178deg)','50% 0',9,.95,seal4(c,50,49,30))}},

/* Old Money: landscape wallet envelope, deep straight flap with a deckled edge, blind-embossed monogram, tissue over the card */
oldmoney:function(c){var W=1000,H=735,vb='0 0 1000 735',id='o'+(++uidN),r=rng(c.seed+41);
  var fl='M0 0H1000V300Q1000 342 958 342'+deckle(r,[958,342],[42,342],3.2,7)+'Q0 342 0 300Z';
  return {ar:1.36,ms:3400,crack:false,html:
    pc('rq4-ln rq4-back',vb,'M0 0H1000V735H0Z')+
    card4(c,'left:5%;top:5%;width:90%;height:88%','',c.cardIn+'<div class="rq4-tissue"></div>')+
    pc('rq4-fr rq4-pocket',vb,'M0 26L500 190L1000 26V735H0Z',deco(vb,pocketFolds(W,H,500,420,id+'f')+
      '<text x="900" y="680" text-anchor="end" font-family="Cormorant Garamond,Georgia,serif" font-style="italic" font-size="44" fill="#fff" fill-opacity=".7" transform="translate(-1.5 -1.5)">'+esc(c.mono)+'</text><text x="900" y="680" text-anchor="end" font-family="Cormorant Garamond,Georgia,serif" font-style="italic" font-size="44" fill="#000" fill-opacity=".14">'+esc(c.mono)+'</text>'))+
    cast(vb,fl,'z-index:4')+
    flap4('',vb,fl,{open:'rotateX(180deg)',org:'50% 0',d:.45,zt:1.05,deco:deco(vb,'<path d="M40 300H960" stroke="#000" stroke-opacity=".05" stroke-width="2"/><path d="M0 4H1000" stroke="#fff" stroke-opacity=".5" stroke-width="5"/>'),over:seal4(c,50,46.5,21)})}},

/* Sauge: two vellum panels over the card, a sage satin ribbon round the bundle with the seal and an olive sprig */
sauge:function(c){var vb='0 0 1000 1389',id='g'+(++uidN);
  var vl='M0 0H560V1389H0Z',vr='M440 0H1000V1389H440Z';
  return {ar:.72,ms:3100,crack:false,html:
    card4(c,'inset:0','rq4-card-base')+
    flap4('rq4-vel',vb,vr,{y:1,noz:1,open:'rotateY(160deg)',org:'100% 50%',d:.95,dur:1.3,z:5,front:'rq4-vellum',back:'rq4-vellum',deco:deco(vb,'<path d="M446 0V1389" stroke="#fff" stroke-opacity=".9" stroke-width="3"/><path d="M990 0V1389" stroke="#000" stroke-opacity=".06" stroke-width="10"/>')})+
    flap4('rq4-vel',vb,vl,{y:1,noz:1,open:'rotateY(-160deg)',org:'0 50%',d:.8,dur:1.3,z:6,front:'rq4-vellum',back:'rq4-vellum',deco:deco(vb,'<path d="M554 0V1389" stroke="#fff" stroke-opacity=".9" stroke-width="3"/><path d="M548 0V1389" stroke="#000" stroke-opacity=".08" stroke-width="4"/><path d="M10 0V1389" stroke="#000" stroke-opacity=".06" stroke-width="10"/>')})+
    '<div class="rq4-tie rq4-ribbon">'+deco(vb,'<defs><linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".25"/><stop offset=".22" stop-color="#fff" stop-opacity=".38"/><stop offset=".4" stop-color="#fff" stop-opacity=".05"/><stop offset=".7" stop-color="#000" stop-opacity=".08"/><stop offset=".86" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient></defs>'+
      '<rect x="-10" y="660" width="1020" height="88" fill="#000" fill-opacity=".18" transform="translate(4 10)"/><rect x="-10" y="650" width="1020" height="88" fill="var(--linerbg)"/><rect x="-10" y="650" width="1020" height="88" fill="url(#'+id+')"/>')+
      sprigBox('olive',c.seed+3,'left:6%;top:30%;width:14%;height:30%;transform:rotate(-78deg)',LEAFV)+seal4(c,50,49.9,30)+'</div>'}},

/* Bordeaux: scalloped flap with a rose-gold edge that curls back like real paper (two hinged segments) */
bordeaux:function(c){var W=1000,H=1316,vb='0 0 1000 1316',id='b'+(++uidN),cut=330;
  var fl='M0 0H1000V40'+lobes([1000,40],[750,380],[500,720],7,13,500,200)+lobes([500,720],[250,380],[0,40],7,13,500,200)+'Z',
    edge='M972 46'+lobes([972,46],[738,368],[500,688],7,11,500,200)+lobes([500,688],[262,368],[28,46],7,11,500,200),
    cA='M-10 -10H1010V'+(cut+2)+'H-10Z',cB='M-10 '+cut+'H1010V1316H-10Z',
    gd='<defs>'+gradG(id,'#f6d2c2','#c98b74','#8d5444')+'</defs>',dec=deco(vb,gd+'<path d="'+fl.replace(/^M0 0H1000V40/,'M1000 40')+'" fill="none" stroke="url(#'+id+')" stroke-width="7"/><path d="'+edge+'" fill="none" stroke="url(#'+id+')" stroke-width="2" opacity=".85"/>'),
    segB='<div class="rq4-segB" style="transform-origin:50% '+f1(cut/H*100)+'%"><div class="rq4-face">'+pc('rq4-fr',vb,fl,'<i class="rq4-sh"></i>'+dec,'',cB)+seal4(c,50,54.4,30)+'</div><div class="rq4-face rq4-bkx"><div class="rq4-flipx">'+pc('rq4-ln',vb,fl,'','',cB)+'</div></div></div>';
  return {ar:.76,ms:3000,crack:true,html:
    pc('rq4-ln rq4-back',vb,'M0 0H1000V1316H0Z')+
    card4(c,'left:7%;top:4%;width:86%;height:80%')+
    pc('rq4-fr rq4-pocket',vb,'M0 20L500 600L1000 20V1316H0Z',deco(vb,pocketFolds(W,H,500,780,id+'f')))+
    cast(vb,fl,'z-index:4')+
    flap4('rq4-segA',vb,fl,{open:'rotateX(180deg)',org:'50% 0',d:.5,dur:1.5,zt:1.25,clip:cA,deco:dec,child:segB})}},

/* Sahara: handmade deckled letter folded in three, tied with a leather cord; it unfolds into the invitation itself */
sahara:function(c){var vb='0 0 1000 625',r=rng(c.seed+51),id='h'+(++uidN);
  var side=function(y0,y1,topD,botD){var d='M0 '+y0+(topD?deckle(r,[0,y0],[1000,y0],5,8):'L1000 '+y0)+deckle(r,[1000,y0],[1000,y1],5,8)+(botD?deckle(r,[1000,y1],[0,y1],5,8):'L0 '+y1)+deckle(r,[0,y1],[0,y0],5,8)+'Z';return d};
  var dm=side(0,625,0,0),dt=side(0,625,1,0),db=side(0,625,0,1),flipT='matrix(1 0 0 -1 0 625)';
  var brick='<g opacity=".55" stroke="var(--linerbg)" fill="none" stroke-width="3"><path d="M0 250H1000M0 375H1000"/>'+[0,1,2,3,4,5,6,7,8,9].map(function(i){var x=i*100+50;return '<path d="M'+x+' 270l22 22-22 22-22-22zM'+(x+50)+' 318V375M'+(x)+' 250V270"/>'}).join('')+'</g>';
  var out=deco(vb,brick+'<text x="500" y="160" text-anchor="middle" font-family="Pinyon Script,cursive" font-size="64" fill="var(--linerbg)" opacity=".75">'+esc(c.mono)+'</text>');
  var inner=function(html){return '<div class="rq4-lt">'+html+'</div>'};
  var face=function(cls,d,content,tf){return pc('rq4-fr rq4-sheet',vb,d,content,'',null,tf)};
  return {ar:1.6,ew:'74cqw',ms:3600,crack:true,html:
    '<div class="rq4-letter">'+
     '<div class="rq4-panel rq4-mid">'+face('',dm,'<i class="rq4-sh"></i>'+inner('<span class="rq-names rq-foil">'+c.namesHtml+'</span>'))+'</div>'+
     '<div class="rq4-panel rq4-bot rq4-fold" style="--d:1.75s">'+
      '<div class="rq4-face">'+face('',db,'<i class="rq4-sh"></i>'+inner('<span class="rq-caps">'+esc(c.dateLong)+'</span>'+(c.venue?'<span class="rq4-venue">'+esc(c.venue)+'</span>':'')))+'</div>'+
      '<div class="rq4-face rq4-out">'+face('',db,deco(vb,brick),flipT)+'</div></div>'+
     '<div class="rq4-panel rq4-tp rq4-fold" style="--d:.9s">'+
      '<div class="rq4-face">'+face('',dt,'<i class="rq4-sh"></i>'+inner('<span class="rq-caps">'+esc(c.kick)+'</span>'))+'</div>'+
      '<div class="rq4-face rq4-out">'+face('',dt,out,flipT)+'</div></div>'+
    '</div>'+
    '<div class="rq4-tie rq4-cordv">'+deco(vb,cord('M455 -30C462 200 448 420 458 660','#6b4426',11,'5 4')+cord('M545 -30C538 200 552 420 542 660','#6b4426',11,'5 4'))+seal4(c,50,50,26)+'</div>'+
    '<div class="rq4-fx">'+bits('rq4-sand',14,c.seed,function(r,i){return 'left:'+f1(10+r()*80)+'%;top:'+f1(10+r()*80)+'%;--pd:'+f1(.2+r()*1.8)+'s;--px:'+f1(10+r()*25)+'cqw;--py:'+f1(jit(r,8))+'cqh'})+'</div>'}}
};
function crackSeal(sb){var cv=sb.querySelector('canvas');if(!cv)return;
  var half=function(s){var k=document.createElement('canvas');k.width=cv.width;k.height=cv.height;k.getContext('2d').drawImage(cv,0,0);k.className='rq4-half rq4-half-'+s;return k};
  sb.appendChild(half('l'));sb.appendChild(half('r'));cv.style.visibility='hidden'}

function pad(n){return String(n).padStart(2,'0')}
function loc(l){return l==='ar'?'ar-TN':l==='fr'?'fr-TN':'en-GB'}
function fmtDate(d,l,opt){if(!d)return'';var dt=new Date(d+'T12:00:00');if(isNaN(dt))return d;try{return new Intl.DateTimeFormat(loc(l),opt||{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(dt)}catch(e){return d}}
/* `a` is the bride, `b` the groom. As on Tunisian cards, the groom's name comes first unless the couple chose otherwise. */
function couple(inv){var a=inv.a||{},b=inv.b||{};return inv.nameOrder==='bride'?[a,b]:[b,a]}
function namesOf(inv,l){var x=couple(inv);if(l==='ar'&&x[0].ar&&x[1].ar)return[x[0].ar,x[1].ar];return[x[0].name||'',x[1].name||'']}
function initials(inv){var x=couple(inv),a=(x[0].name||'?').trim()[0]||'?',b=(x[1].name||'?').trim()[0]||'?';return a.toUpperCase()+'&'+b.toUpperCase()}
/* the two names joined: in Arabic the "و" is attached to the second name (سامي ونور), elsewhere a spaced ampersand */
function pairHtml(n,L,wrap){var w=wrap?function(s){return '<span class="n">'+esc(s)+'</span>'}:esc;
  return L==='ar'?w(n[0])+' <span class="amp">و</span>'+w(n[1]):w(n[0])+' <span class="amp">&amp;</span> '+w(n[1])}
function pairText(n,L){return L==='ar'?n[0]+' و'+n[1]:n[0]+' & '+n[1]}

/* Who invites, as on Tunisian cards: the parents ("السيد … وحرمه") or the families, above the couple's names.
   hosts = {mode:'parents'|'families', g:{fr,ar} (groom's side), b:{fr,ar} (bride's side), mothers:true}.
   Arabic puts the verb first, so it agrees with the first host: يتشرّف السيد… / تتشرّف عائلة…; the line under the hosts
   continues the sentence and names the child with the right possessive (نجله، نجلهما، كريمتهما، ابنيهما). */
var HOST_EV={wedding:{ar:'حفل زفاف',fr:'au mariage',en:'the wedding'},engagement:{ar:'حفل خطوبة',fr:'aux fiançailles',en:'the engagement'},henna:{ar:'سهرة حنّة',fr:'à la soirée du henné',en:'the henna night'},contract:{ar:'حفل عقد قران',fr:'au contrat de mariage',en:'the marriage contract'}};
function hostsOf(inv){var h=inv.hosts||{};if(h.mode!=='parents'&&h.mode!=='families')return null;
  var fam=h.mode==='families',s=[];
  [['g',h.g],['b',h.b]].forEach(function(x){var v=x[1]||{},fr=String(v.fr||'').trim(),ar=String(v.ar||'').trim();
    /* a title typed by the couple is not repeated: "عائلة بن صالح" → "بن صالح" */
    ar=ar.replace(fam?/^عائلة\s+/:/^(السيد|سي)\s+/,'');fr=fr.replace(fam?/^(la\s+)?famille\s+/i:/^(monsieur|m\.|mr\.?)\s+(et\s+madame\s+)?/i,'');
    if(fr||ar)s.push({side:x[0],fr:fr||ar,ar:ar||fr})});
  return s.length?{fam:fam,mothers:h.mothers!==false,s:s}:null}
function hostsLines(inv,L){var h=hostsOf(inv);if(!h)return null;var s=h.s,m=h.mothers;
  if(L==='ar')return{lead:h.fam?'تتشرّف':'يتشرّف',lines:h.fam&&s.length>1?['عائلتا '+s[0].ar+' و'+s[1].ar]:s.map(function(x,i){return (i?'و':'')+(h.fam?'عائلة ':'السيد ')+x.ar+(!h.fam&&m?' وحرمه':'')})};
  if(L==='en')return{lead:'',lines:h.fam?[s.length>1?'The '+s[0].fr+' and '+s[1].fr+' families':'The '+s[0].fr+' family']:s.map(function(x,i){return (i?'and ':'')+(m?'Mr and Mrs ':'Mr ')+x.fr})};
  return{lead:'',lines:h.fam?(s.length>1?['Les familles '+s[0].fr,'et '+s[1].fr]:['La famille '+s[0].fr]):s.map(function(x,i){return (i?'et ':'')+(m?'Monsieur et Madame ':'Monsieur ')+x.fr})}}
function hostsMsg(inv,L){var h=hostsOf(inv);if(!h)return'';var ev=HOST_EV[inv.eventType]||HOST_EV.wedding,two=h.s.length>1,son=h.s[0].side==='g';
  if(L==='ar'){var child=two?'ابنيهما':h.fam?(son?'ابنها':'ابنتها'):h.mothers?(son?'نجلهما':'كريمتهما'):(son?'نجله':'كريمته');return 'بدعوتكم لحضور '+ev.ar+' '+child}
  var many=two||(!h.fam&&h.mothers);
  if(L==='en')return (many||h.fam?'request':'requests')+' the pleasure of your company at '+ev.en+' of '+(two?'their children':(many||h.fam?'their ':'his ')+(son?'son':'daughter'));
  return (many?'ont':'a')+' l\'honneur de vous convier '+ev.fr+' de '+(two?'leurs enfants':(many?'leur ':son?'son ':'sa ')+(son?'fils':'fille'))}
function hostsHtml(inv,L){var h=hostsLines(inv,L);if(!h)return'';
  return '<div class="rq-hosts">'+(h.lead?'<p class="rq-hosts-lead">'+esc(h.lead)+'</p>':'')+h.lines.map(function(x){return '<p>'+esc(x)+'</p>'}).join('')+'</div>'}
function waLink(inv,r){
  /* the couple's number in international form: a Tunisian 8-digit number gets 216, 00… becomes … */
  var num=String(inv.whatsapp||'').replace(/[^0-9]/g,'');if(num.indexOf('00')===0)num=num.slice(2);if(num.length===8)num='216'+num;if(!num)return'';
  var n=namesOf(inv,'fr');
  var txt='RSVP · '+n[0]+' & '+n[1]+'\n'+r.name+' : '+(r.attending?'Présent(e) ✓':'Absent(e)')+(r.attending?' · '+r.guests+' pers.':'')+(r.dietary?'\nRégime : '+r.dietary:'')+(r.message?'\n« '+r.message+' »':'');
  return 'https://wa.me/'+num+'?text='+encodeURIComponent(txt);
}
function mapsHref(q,link){if(link&&/^https?:\/\//.test(link))return link;return q?'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q):''}

/* The reply card, shared by the invitation and the bar on custom designs. c={t,inv,guest,st,opts,maxSeats}.
   A personal link answers with the name on the guest list (shown, not typed); with personalOnly, the shared link cannot reply. */
function rsvpHtml(c){
  var t=c.t,inv=c.inv,guest=c.guest,st=c.st,L=st.lang;
  var h='<div class="rq-sheet" id="rq-rsvp"><h2 class="rq-h2 rq-foil">'+esc(t('rsvp'))+'</h2>'+(inv.rsvpBy?'<p class="rq-caps rq-muted" style="margin:-6px 0 20px">'+esc(t('by'))+' '+esc(fmtDate(inv.rsvpBy,L,{day:'numeric',month:'long'}))+'</p>':'');
  if(st.sent){
    h+='<div class="rq-thanks"><p class="rq-msg" style="margin:0">'+esc(t('thanks'))+'</p>'+(st.sent.whatsapp?'<a class="rq-send" target="_blank" rel="noopener" href="'+esc(st.sent.whatsapp)+'">'+esc(t('wa'))+'</a>':'')+'</div>';
  } else if(inv.personalOnly&&!guest&&!c.opts.preview){
    h+='<p class="rq-msg rq-personal" style="margin:0">'+esc(t('personal'))+'</p>';
  } else {
    var mx=c.maxSeats();
    h+='<form class="rq-form" novalidate><div>'+(guest&&guest.name?'<span class="l">'+esc(t('name'))+'</span><p class="rq-who" id="rq-who">'+esc(guest.name)+'</p>':'<label class="l" for="rq-name">'+esc(t('name'))+'</label><input type="text" id="rq-name" autocomplete="name">')+'</div>'+
     '<div><span class="l">'+esc(t('att'))+'</span><div class="rq-att"><label><input type="radio" name="rq-att" id="rq-att-yes" value="yes"> '+esc(t('yes'))+'</label><label><input type="radio" name="rq-att" id="rq-att-no" value="no"> '+esc(t('no'))+'</label></div></div>'+
     (mx>1?'<div class="rq-gwrap"><span class="l">'+esc(t('guests'))+'</span><div class="rq-step"><button type="button" data-g="-1" aria-label="−">−</button><output id="rq-guests">'+st.guests+'</output><button type="button" data-g="1" aria-label="+">+</button></div></div>':'')+
     '<div><label class="l" for="rq-diet">'+esc(t('diet'))+'</label><input type="text" id="rq-diet"></div>'+
     '<div><label class="l" for="rq-msg">'+esc(t('note'))+'</label><textarea id="rq-msg"></textarea></div>'+
     '<p class="rq-err" hidden></p><button class="rq-send" type="submit">'+esc(t('send'))+'</button>'+(c.opts.preview?'<p class="rq-note">'+esc(t('preview'))+'</p>':'')+'</form>';
  }
  return h+'</div>';
}
function wireRsvp(root,c,draw){
  var st=c.st,guest=c.guest,t=c.t;
  root.querySelectorAll('[data-g]').forEach(function(b){b.onclick=function(){var mx=c.maxSeats();st.guests=Math.min(mx,Math.max(1,st.guests+ +b.dataset.g));root.querySelector('#rq-guests').textContent=st.guests}});
  var yes=root.querySelector('#rq-att-yes'),no=root.querySelector('#rq-att-no'),gw=root.querySelector('.rq-gwrap');
  if(yes&&gw){var upd=function(){gw.hidden=!!(no&&no.checked)};yes.onchange=upd;no.onchange=upd}
  var form=root.querySelector('.rq-form');
  if(form)form.onsubmit=function(e){
    e.preventDefault();
    var err=form.querySelector('.rq-err'),btn=form.querySelector('.rq-send'),nm=form.querySelector('#rq-name');
    var r={guestId:guest&&guest.id||'',name:guest&&guest.name?guest.name:(nm?nm.value.trim():''),attending:yes.checked,guests:yes.checked?st.guests:0,dietary:form.querySelector('#rq-diet').value.trim(),message:form.querySelector('#rq-msg').value.trim(),lang:st.lang};
    if(!r.name||!(yes.checked||no.checked)){err.textContent=t('need');err.hidden=false;return}
    err.hidden=true;btn.disabled=true;
    Promise.resolve(c.opts.onRsvp?c.opts.onRsvp(r):{}).then(function(res){st.sent=res||{};draw();var el=root.querySelector('#rq-rsvp');if(el)el.scrollIntoView({block:'center'})}).catch(function(x){btn.disabled=false;err.textContent=(x&&x.message&&x.userFacing)?x.message:t('err');err.hidden=false});
  };
}
/* The reply card on its own (custom designs): same look and rules as inside an invitation. */
function renderRsvp(root,inv,opts){
  opts=opts||{};
  var st={lang:opts.lang||inv.lang||'fr',sent:null,guests:1},guest=opts.guest||null,th=THEMES[inv.theme]?inv.theme:'reefq';
  function t(k){return (T[st.lang]||T.fr)[k]}
  var maxSeats=function(){return Math.max(1,guest&&guest.seats?+guest.seats:(+inv.maxGuests||1))};if(guest&&guest.seats)st.guests=maxSeats();
  var c={t:t,inv:inv,guest:guest,st:st,opts:opts,maxSeats:maxSeats};
  function draw(){var L=T[st.lang]?st.lang:'fr';st.lang=L;root.className='rq-inv rq-solo';root.setAttribute('data-t',th);root.setAttribute('lang',L);root.setAttribute('dir',L==='ar'?'rtl':'ltr');root.innerHTML=rsvpHtml(c);wireRsvp(root,c,draw)}
  draw();
  return{destroy:function(){root.innerHTML=''},t:t};
}
function render(root,inv,opts){
  opts=opts||{};
  var st={lang:opts.lang||inv.lang||'fr',open:!!opts.startOpen,timer:null,sent:null,guests:1};
  var seed=hash((inv.a&&inv.a.name)+'|'+(inv.b&&inv.b.name)+'|'+(inv.id||''));
  var th=THEMES[inv.theme]?inv.theme:'zitouna';
  root.className='rq-inv';root.setAttribute('data-t',th);for(var ak in RQA)root.style.setProperty('--a-'+ak,'url('+RQA[ak]+')');
  function t(k){var D=T[st.lang]||T.fr;if(k==='married'&&inv.eventType&&inv.eventType!=='wedding'&&D['k_'+inv.eventType])return D['k_'+inv.eventType];return D[k]}
  var guest=opts.guest||null,show=inv.show||{};function on(k){return show[k]!==false}
  var maxSeats=function(){return Math.max(1,guest&&guest.seats?+guest.seats:(+inv.maxGuests||1))};if(guest&&guest.seats)st.guests=maxSeats();
  var R={t:t,inv:inv,guest:guest,st:st,opts:opts,maxSeats:maxSeats};
  function draw(){
    clearInterval(st.timer);
    var L=T[st.lang]?st.lang:'fr';st.lang=L;
    root.setAttribute('lang',L);root.setAttribute('dir',L==='ar'?'rtl':'ltr');
    var n=namesOf(inv,L),msg=(inv.message&&inv.message[L])||hostsMsg(inv,L)||t('msg'),closing=inv.closing&&inv.closing[L]||'';
    var langBar='<div class="rq-lang" role="group" aria-label="Language">'+['fr','ar','en'].map(function(x){return '<button type="button" data-lang="'+x+'" aria-pressed="'+(x===L)+'">'+(x==='ar'?'عربي':x.toUpperCase())+'</button>'}).join('')+'</div>';
    var badge=opts.preview?'<div class="rq-badge">'+(opts.badge||'Preview')+'</div>':'';
    var nameH='<h1 class="rq-names rq-foil">'+pairHtml(n,L,true)+'</h1>';
    var html=badge+langBar+'<div class="rq-scroll">';
    if(!st.open){
      var eo=envOpts(inv,th),cv=inv.canva||null,K=ENV_KINDS[th];
      var cardIn=(cv&&cv.image?'<img class="rq3-cardart" alt="" src="'+esc(cv.image)+'" onerror="this.remove()">':'')+'<div class="rq3-cardtxt"'+(cv&&cv.image?' hidden':'')+'><span class="rq-caps">'+esc(t('married'))+'</span><span class="rq-names rq-foil">'+pairHtml(n,L)+'</span><span class="rq-caps">'+esc(fmtDate(inv.date,L,{day:'numeric',month:'long',year:'numeric'}))+'</span></div>';
      var E=K?K({tap:t('tap'),seed:seed,eo:eo,cardIn:cardIn,mono:(inv.env&&inv.env.mono)||initials(inv).replace('&',' & '),namesHtml:pairHtml(n,L),kick:t('married'),
        dateLong:fmtDate(inv.date,L,{day:'numeric',month:'long',year:'numeric'}),venue:[inv.venue,inv.city].filter(Boolean).join(', ')}):null;
      st.env=E||{ms:2500,crack:true};
      html+='<section class="rq-cover rq3'+(E?' rq4 rq4-'+th:'')+'" style="--paper:'+esc(eo.paper)+';--table:'+esc(eo.table)+';--liner:'+esc(linerTile(eo.liner,eo.linerBg,eo.linerInk))+';--linerbg:'+esc(eo.linerBg)+(E?';--grain:'+esc(grainUrl())+';--ar:'+E.ar+(E.ew?';--ew:'+E.ew:''):'')+'">'+
       '<div class="rq3-table"></div>'+
       '<div class="rq3-top">'+(guest&&guest.name?'<p class="rq3-dear">'+esc(t('dear'))+' '+esc(guest.name)+'</p>':'')+'<p class="rq-caps rq3-kick">'+esc(t('married'))+'</p><h1 class="rq-names rq-foil">'+pairHtml(n,L)+'</h1><p class="rq-date-s">'+esc(dots(inv.date))+'</p></div>'+
       (E?'<div class="rq3-env">'+E.html+'</div>':
       '<div class="rq3-env"><div class="rq3-shadow"></div><div class="rq3-int"></div>'+
        '<div class="rq3-card"><div class="rq3-cardtex"></div>'+cardIn+'</div>'+
        '<div class="rq3-pocket rq3-tint" style="--m:var(--a-pocket)"></div><div class="rq3-fshadow"></div>'+
        '<div class="rq3-flap"><div class="rq3-face rq3-front"><div class="rq3-tint" style="--m:var(--a-flap)"></div>'+flapGild()+'<button type="button" class="rq3-seal" aria-label="'+esc(t('tap'))+'"></button></div>'+
        '<div class="rq3-face rq3-back"><div class="rq3-backin"></div></div></div>'+
       '</div>')+'<p class="rq-caps rq3-hint">'+esc(t('tap'))+'</p></section>';
    } else {
      html+='<section class="rq-inside">';
      var cz=inv.canva;if(cz&&(cz.video||cz.image))html+='<figure class="rq-canva">'+(cz.video?'<video src="'+esc(cz.video)+'" poster="'+esc(cz.image||'')+'" autoplay muted loop playsinline></video>':'<img alt="" src="'+esc(cz.image)+'" onerror="this.parentNode.remove()">')+'</figure>';
      html+='<div class="rq-sheet hero"><div class="rq-corner">'+sprig(THEMES[th].sprig,seed+77)+'</div>'+openingHtml(inv,L)+(guest&&guest.name?'<p class="rq-guest">'+esc(t('dear'))+' '+esc(guest.name)+'</p>':'')+hostsHtml(inv,L)+'<p class="rq-msg">'+esc(msg)+'</p>'+nameH+'<div class="rq-rule"></div>'+
        '<p class="rq-when">'+esc(fmtDate(inv.date,L))+'</p><p class="rq-caps rq-muted" style="margin:6px 0 0">'+esc(t('at'))+' '+esc(inv.time||'')+'</p>'+
        '<p class="rq-where">'+esc(inv.venue||'')+(inv.city?'<br><span class="rq-muted">'+esc(inv.city)+'</span>':'')+'</p>'+
        (inv.venue||inv.maps?'<a class="rq-link" target="_blank" rel="noopener" href="'+esc(mapsHref([inv.venue,inv.city].filter(Boolean).join(', '),inv.maps))+'">'+esc(t('map'))+'</a>':'')+
        (guest&&guest.seats?'<div class="rq-seats"><span class="rq-caps">'+esc(t('seatsFor'))+'</span><b>'+maxSeats()+'</b></div>':'')+(closing?'<p class="rq-closing">'+esc(closing)+'</p>':'')+'</div>';
      if(on('countdown'))html+='<div class="rq-sheet"><h2 class="rq-h2 rq-foil">'+esc(t('count'))+'</h2><div class="rq-count" aria-live="off"><div><b data-c="d">00</b><span>'+esc(t('d'))+'</span></div><div><b data-c="h">00</b><span>'+esc(t('h'))+'</span></div><div><b data-c="m">00</b><span>'+esc(t('m'))+'</span></div><div><b data-c="s">00</b><span>'+esc(t('s'))+'</span></div></div></div>';
      var story=inv.story&&(inv.story[L]||inv.story.fr||inv.story.en||inv.story.ar)||'';
      if(on('story')&&story)html+='<div class="rq-sheet rq-story"><h2 class="rq-h2 rq-foil">'+esc(t('story'))+'</h2>'+String(story).split(/\n+/).filter(function(x){return x.trim()}).map(function(x){return '<p>'+esc(x)+'</p>'}).join('')+'</div>';
      var evs=(inv.events||[]).filter(function(e){return e&&(e.type||e.label)});
      var dcols=(inv.dressColors||[]).filter(function(c){return /^#[0-9a-f]{3,8}$/i.test(c)}).slice(0,6);
      if(on('program')&&(evs.length||inv.dress||dcols.length)){
        html+='<div class="rq-sheet"><h2 class="rq-h2 rq-foil">'+esc(t('program'))+'</h2><ul class="rq-events">'+evs.map(function(e){
          var lbl=e.type==='custom'?(e.label||''):(t('ev')[e.type]||e.label||'');
          var mq=[e.place].filter(Boolean).join(', ');
          return '<li><span class="rq-ev-t">'+esc(lbl)+'</span><span class="rq-ev-d">'+esc(fmtDate(e.date,L,{weekday:'long',day:'numeric',month:'long'}))+(e.time?' · '+esc(e.time):'')+'</span>'+(e.place?'<span class="rq-muted">'+esc(e.place)+'</span>':'')+(mq||e.maps?'<a class="rq-link" target="_blank" rel="noopener" href="'+esc(mapsHref(mq,e.maps))+'">'+esc(t('map'))+'</a>':'')+'</li>'}).join('')+'</ul>'+
          (inv.dress||dcols.length?'<div class="rq-dress"><div class="rq-caps">'+esc(t('dress'))+'</div>'+(inv.dress?'<div>'+esc(inv.dress)+'</div>':'')+(dcols.length?'<div class="rq-swatches">'+dcols.map(function(c){return '<i style="background:'+esc(c)+'"></i>'}).join('')+'</div>':'')+'</div>':'')+
          (inv.note?'<p class="rq-muted" style="margin:14px 0 0;font-style:italic">'+esc(inv.note)+'</p>':'')+'</div>';
      }
      if(on('rsvp'))html+=rsvpHtml(R);
      html+='<div class="rq-foot"><span>'+(L==='ar'?'صُنعت بحبّ مع':L==='fr'?'Créée avec amour par':'Made with love by')+'</span>'+(opts.preview||!inv.id?'':'<a class="rq-foot-link" target="_top" href="/?utm_source=invitation&amp;utm_medium=footer" aria-label="Reefq">')+'<img alt="Reefq رِفق" src="'+(th==='layl'?LOGO_DARK:LOGO)+'">'+(opts.preview||!inv.id?'':'</a>')+'</div></section>';
    }
    html+='</div>';
    root.innerHTML=html;
    wire();
  }
  function dots(d){if(!d)return'';var p=d.split('-');return p.length===3?p[2]+' · '+p[1]+' · '+p[0]:d}
  function tick(){
    var target=new Date((inv.date||'2030-01-01')+'T'+(inv.time||'18:00')+':00'),diff=Math.max(0,target-Date.now());
    var v={d:Math.floor(diff/864e5),h:Math.floor(diff/36e5)%24,m:Math.floor(diff/6e4)%60,s:Math.floor(diff/1e3)%60};
    root.querySelectorAll('[data-c]').forEach(function(b){b.textContent=b.dataset.c==='d'?String(v.d):pad(v[b.dataset.c])});
  }
  function wire(){
    root.querySelectorAll('[data-lang]').forEach(function(b){b.onclick=function(){st.lang=b.dataset.lang;draw()}});
    var sc=root.querySelector('.rq3');
    if(sc){
      var eo2=envOpts(inv,th),sb=sc.querySelector('.rq3-seal'),busy=false;
      var paint=function(){var cv=sealCanvas((inv.env&&inv.env.mono)||initials(inv).replace('&',' & '),eo2.seal,seed,360);sb.innerHTML='';sb.appendChild(cv)};
      paint();if(document.fonts&&document.fonts.load)document.fonts.load("40px 'Pinyon Script'").then(function(){if(sb.isConnected)paint()}).catch(function(){});
      var go=function(){
        if(busy)return;busy=true;
        var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
        sc.classList.add('opening');if(window.rqTrack)window.rqTrack('invitation_opened',{theme:th,layout:inv.layout||'classic',preview:!!opts.preview,personal:!!guest,lang:st.lang});
        if(st.env.crack)crackSeal(sb);var ms=st.env.ms||2500;
        setTimeout(function(){var cov=sc;cov.classList.add('done');st.open=true;draw();var s=root.querySelector('.rq-scroll');if(s)s.scrollTop=0;cov.classList.add('handoff');root.appendChild(cov);requestAnimationFrame(function(){requestAnimationFrame(function(){cov.classList.add('fadeout')})});setTimeout(function(){if(cov.parentNode)cov.parentNode.removeChild(cov)},900)},reduce?200:ms);
      };
      sb.onclick=function(e){e.stopPropagation();go()};sc.querySelector('.rq3-env').onclick=go;
    }
    if(root.querySelector('[data-c]')){tick();st.timer=setInterval(tick,1000)}
    wireRsvp(root,R,draw);
  }
  draw();
  return{destroy:function(){clearInterval(st.timer);root.innerHTML=''},setLang:function(l){st.lang=l;draw()},open:function(){st.open=true;draw()},isOpen:function(){return st.open},play:function(){var s=root.querySelector('.rq3-seal');if(s)s.click();else{st.open=true;draw()}},scroller:function(){return root.querySelector('.rq-scroll')}};
}
window.ReefqInvite={pairText:pairText,hostsMsg:hostsMsg,hostsLines:hostsLines,THEME_LIST:THEME_LIST,OPENINGS:OPENINGS,sealCanvas:sealCanvas,linerTile:linerTile,PAPERS:PAPERS,SEALS:SEALS,LINERS:LINERS,ENV_DEFAULTS:ENV_DEFAULTS,LOGO:LOGO,LOGO_DARK:LOGO_DARK,render:render,renderRsvp:renderRsvp,waLink:waLink,T:T,fmtDate:fmtDate,sprig:sprig,initials:initials,namesOf:namesOf};
})();
