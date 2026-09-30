(function(){
'use strict';
var T={
 en:{k_engagement:'are getting engaged',k_henna:'invite you to their henna night',k_contract:'are tying the knot',dear:'Dear',seatsFor:'Seats reserved for you',married:'are getting married',tap:'Touch the seal to open',msg:'Together with their families, they joyfully invite you to celebrate their wedding',count:'Until we say yes',story:'Our story',gallery:'Our moments',close:'Close',just:'Just married',d:'Days',h:'Hours',m:'Minutes',s:'Seconds',program:'The celebrations',dress:'Dress code',rsvp:'Kindly reply',by:'Please reply by',name:'Your full name',att:'Will you join us?',yes:'Joyfully accepts',no:'Regretfully declines',guests:'Number of guests',diet:'Dietary needs',note:'A note for the couple',send:'Send my reply',thanks:'Thank you. Your reply has reached the couple.',wa:'Send it on WhatsApp',preview:'Preview only. Replies are not recorded.',map:'Open in Maps',music:'Our song',err:'Your reply could not be sent. Please try again.',need:'Please enter your name and choose an answer.',at:'at',
  ev:{henna:'Henna Night',contract:'Marriage Contract',ceremony:'Wedding Ceremony',dinner:'Wedding Dinner',outia:'Outia',brunch:'Farewell Brunch'}},
 fr:{k_engagement:'se fiancent',k_henna:'vous convient à leur soirée du henné',k_contract:'scellent leur union',dear:'Cher·e',seatsFor:'Places réservées pour vous',married:'se disent oui',tap:'Touchez le sceau pour ouvrir',msg:'Entourés de leurs familles, ils ont la joie de vous convier à leur mariage',count:'Avant le grand jour',story:'Notre histoire',gallery:'Nos moments',close:'Fermer',just:'Jeunes mariés',d:'Jours',h:'Heures',m:'Minutes',s:'Secondes',program:'Le programme',dress:'Tenue',rsvp:'Merci de confirmer',by:'Réponse souhaitée avant le',name:'Nom et prénom',att:'Serez-vous des nôtres ?',yes:'Avec joie, je serai là',no:'À regret, je ne pourrai pas venir',guests:'Nombre de personnes',diet:'Régime alimentaire',note:'Un mot pour les mariés',send:'Envoyer ma réponse',thanks:'Merci ! Votre réponse est bien parvenue aux mariés.',wa:'Envoyer sur WhatsApp',preview:'Aperçu : les réponses ne sont pas enregistrées.',map:'Ouvrir dans Maps',music:'Notre chanson',err:"Votre réponse n'a pas pu être envoyée. Réessayez.",need:'Indiquez votre nom et choisissez une réponse.',at:'à',
  ev:{henna:'Soirée du henné',contract:'Contrat de mariage',ceremony:'Cérémonie',dinner:'Dîner de fête',outia:'Outia',brunch:"Brunch d'au revoir"}},
 ar:{k_engagement:'يحتفلان بخطوبتهما',k_henna:'يدعوانكم إلى ليلة الحنّة',k_contract:'يحتفلان بعقد قرانهما',dear:'عزيزنا',seatsFor:'عدد المقاعد المحجوزة لكم',married:'يحتفلان بزفافهما',tap:'المسوا الختم لفتح الدعوة',msg:'بقلوبٍ يغمرها الفرح، تتشرّف عائلتاهما بدعوتكم لمشاركتهما فرحة زفافهما',count:'على موعدٍ مع الفرح',story:'حكايتنا',gallery:'لحظاتنا',close:'إغلاق',just:'تمّ الزفاف',d:'أيام',h:'ساعات',m:'دقائق',s:'ثوانٍ',program:'برنامج الأفراح',dress:'اللباس',rsvp:'نرجو تأكيد حضوركم',by:'يُرجى الرد قبل',name:'الاسم واللقب',att:'هل ستشاركوننا الفرحة؟',yes:'بكل سرور، سأحضر',no:'أعتذر عن الحضور',guests:'عدد الأشخاص',diet:'ملاحظات غذائية',note:'كلمة للعروسين',send:'إرسال الرد',thanks:'شكراً لكم، وصل ردّكم إلى العروسين.',wa:'أرسل عبر واتساب',preview:'معاينة فقط: لا يتم حفظ الردود.',map:'افتح الخريطة',music:'أغنيتنا',err:'تعذّر إرسال الرد، حاولوا مجدداً.',need:'أدخلوا الاسم واختاروا الإجابة.',at:'على الساعة',
  ev:{henna:'ليلة الحنّة',contract:'عقد القران',ceremony:'حفل الزفاف',dinner:'عشاء الزفاف',outia:'الوطية',brunch:'فطور الوداع'}}
};
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
function vinyl(){
  var g='';for(var i=0;i<6;i++)g+='<circle cx="50" cy="50" r="'+(44-i*4.5)+'" fill="none" stroke="#fff" stroke-opacity=".07"/>';
  return '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="49" fill="#141414"/>'+g+'<path d="M20 30A36 36 0 0 1 44 15" stroke="#fff" stroke-opacity=".22" stroke-width="3" fill="none"/><circle cx="50" cy="50" r="17" style="fill:var(--foil-solid)"/><circle cx="50" cy="50" r="3" fill="#141414"/></svg>';
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
  sidi:{paper:'#fbfbf8',seal:'#1d4f91',liner:'tiles',linerBg:'#1d4f91',linerInk:'#f4f1e8',table:'#dfe7ee'},
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

function pad(n){return String(n).padStart(2,'0')}
function loc(l){return l==='ar'?'ar-TN':l==='fr'?'fr-TN':'en-GB'}
function fmtDate(d,l,opt){if(!d)return'';var dt=new Date(d+'T12:00:00');if(isNaN(dt))return d;try{return new Intl.DateTimeFormat(loc(l),opt||{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(dt)}catch(e){return d}}
function namesOf(inv,l){var a=inv.a||{},b=inv.b||{};if(l==='ar'&&a.ar&&b.ar)return[a.ar,b.ar];return[a.name||'',b.name||'']}
function initials(inv){var a=(inv.a&&inv.a.name||'?').trim()[0]||'?',b=(inv.b&&inv.b.name||'?').trim()[0]||'?';return a.toUpperCase()+'&'+b.toUpperCase()}
function waLink(inv,r){
  var num=String(inv.whatsapp||'').replace(/[^0-9]/g,'');if(!num)return'';
  var n=namesOf(inv,'fr');
  var txt='RSVP · '+n[0]+' & '+n[1]+'\n'+r.name+' : '+(r.attending?'Présent(e) ✓':'Absent(e)')+(r.attending?' · '+r.guests+' pers.':'')+(r.dietary?'\nRégime : '+r.dietary:'')+(r.message?'\n« '+r.message+' »':'');
  return 'https://wa.me/'+num+'?text='+encodeURIComponent(txt);
}
function mapsHref(q,link){if(link&&/^https?:\/\//.test(link))return link;return q?'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q):''}

function render(root,inv,opts){
  opts=opts||{};
  var st={lang:opts.lang||inv.lang||'fr',open:!!opts.startOpen,timer:null,audio:null,sent:null,guests:1};
  var seed=hash((inv.a&&inv.a.name)+'|'+(inv.b&&inv.b.name)+'|'+(inv.id||''));
  var th=THEMES[inv.theme]?inv.theme:'zitouna';
  root.className='rq-inv';root.setAttribute('data-t',th);for(var ak in RQA)root.style.setProperty('--a-'+ak,'url('+RQA[ak]+')');
  function t(k){var D=T[st.lang]||T.fr;if(k==='married'&&inv.eventType&&inv.eventType!=='wedding'&&D['k_'+inv.eventType])return D['k_'+inv.eventType];return D[k]}
  var guest=opts.guest||null,show=inv.show||{};function on(k){return show[k]!==false}
  var maxSeats=function(){return Math.max(1,guest&&guest.seats?+guest.seats:(+inv.maxGuests||1))};if(guest&&guest.seats)st.guests=maxSeats();
  function draw(){
    clearInterval(st.timer);
    var L=T[st.lang]?st.lang:'fr';st.lang=L;
    root.setAttribute('lang',L);root.setAttribute('dir',L==='ar'?'rtl':'ltr');
    var n=namesOf(inv,L),msg=(inv.message&&inv.message[L])||t('msg');
    var langBar='<div class="rq-lang" role="group" aria-label="Language">'+['fr','ar','en'].map(function(x){return '<button type="button" data-lang="'+x+'" aria-pressed="'+(x===L)+'">'+(x==='ar'?'عربي':x.toUpperCase())+'</button>'}).join('')+'</div>';
    var badge=opts.preview?'<div class="rq-badge">'+(opts.badge||'Preview')+'</div>':'';
    var amp=L==='ar'?'و':'&amp;';var nameH='<h1 class="rq-names rq-foil">'+esc(n[0])+' <span class="amp">'+amp+'</span> '+esc(n[1])+'</h1>';
    var html=badge+langBar+'<div class="rq-scroll">';
    if(!st.open){
      var eo=envOpts(inv,th),cv=inv.canva||null;
      html+='<section class="rq-cover rq3" style="--paper:'+esc(eo.paper)+';--table:'+esc(eo.table)+';--liner:'+esc(linerTile(eo.liner,eo.linerBg,eo.linerInk))+';--linerbg:'+esc(eo.linerBg)+'">'+
       '<div class="rq3-table"></div>'+
       '<div class="rq3-top">'+(guest&&guest.name?'<p class="rq3-dear">'+esc(t('dear'))+' '+esc(guest.name)+'</p>':'')+'<p class="rq-caps rq3-kick">'+esc(t('married'))+'</p><h1 class="rq-names rq-foil">'+esc(n[0])+' <span class="amp">'+amp+'</span> '+esc(n[1])+'</h1><p class="rq-date-s">'+esc(dots(inv.date))+'</p></div>'+
       '<div class="rq3-env"><div class="rq3-shadow"></div><div class="rq3-int"></div>'+
        '<div class="rq3-card"><div class="rq3-cardtex"></div>'+(cv&&cv.image?'<img class="rq3-cardart" alt="" src="'+esc(cv.image)+'" onerror="this.remove()">':'')+'<div class="rq3-cardtxt"'+(cv&&cv.image?' hidden':'')+'><span class="rq-caps">'+esc(t('married'))+'</span><span class="rq-names rq-foil">'+esc(n[0])+' '+amp+' '+esc(n[1])+'</span><span class="rq-caps">'+esc(fmtDate(inv.date,L,{day:'numeric',month:'long',year:'numeric'}))+'</span></div></div>'+
        '<div class="rq3-pocket rq3-tint" style="--m:var(--a-pocket)"></div><div class="rq3-fshadow"></div>'+
        '<div class="rq3-flap"><div class="rq3-face rq3-front"><div class="rq3-tint" style="--m:var(--a-flap)"></div>'+flapGild()+'<button type="button" class="rq3-seal" aria-label="'+esc(t('tap'))+'"></button></div>'+
        '<div class="rq3-face rq3-back"><div class="rq3-backin"></div></div></div>'+
       '</div><p class="rq-caps rq3-hint">'+esc(t('tap'))+'</p></section>';
    } else {
      html+='<section class="rq-inside">';
      var cz=inv.canva;if(cz&&(cz.video||cz.image))html+='<figure class="rq-canva">'+(cz.video?'<video src="'+esc(cz.video)+'" poster="'+esc(cz.image||'')+'" autoplay muted loop playsinline></video>':'<img alt="" src="'+esc(cz.image)+'" onerror="this.parentNode.remove()">')+'</figure>';
      var allPh=(inv.photos||[]).filter(Boolean),lay=inv.layout==='arch'||inv.layout==='photo'?inv.layout:'classic';if(!allPh.length)lay='classic';
      var cover=lay==='classic'?'':allPh[0],restPh=lay==='classic'?allPh:allPh.slice(1);
      if(lay==='photo')html+='<figure class="rq-fullph"><img alt="" src="'+esc(cover)+'"><figcaption><span class="rq-caps">'+esc(t('married'))+'</span><span class="rq-names">'+esc(n[0])+' <span class="amp">'+amp+'</span> '+esc(n[1])+'</span><span class="rq-caps">'+esc(dots(inv.date))+'</span></figcaption></figure>';
      html+='<div class="rq-sheet hero lay-'+lay+'">'+(lay==='arch'?'<figure class="rq-archph"><img alt="" src="'+esc(cover)+'"></figure>':'<div class="rq-corner">'+sprig(THEMES[th].sprig,seed+77)+'</div>')+'<p class="rq-msg">'+esc(msg)+'</p>'+(lay==='photo'?'':nameH)+'<div class="rq-rule"></div>'+
        '<p class="rq-when">'+esc(fmtDate(inv.date,L))+'</p><p class="rq-caps rq-muted" style="margin:6px 0 0">'+esc(t('at'))+' '+esc(inv.time||'')+'</p>'+
        '<p class="rq-where">'+esc(inv.venue||'')+(inv.city?'<br><span class="rq-muted">'+esc(inv.city)+'</span>':'')+'</p>'+
        (inv.venue||inv.maps?'<a class="rq-link" target="_blank" rel="noopener" href="'+esc(mapsHref([inv.venue,inv.city].filter(Boolean).join(', '),inv.maps))+'">'+esc(t('map'))+'</a>':'')+'</div>';
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
      var ph=restPh.slice(0,12);
      if(on('photos')&&ph.length){if(ph.length<=3)html+='<div class="rq-photos">'+ph.map(function(p){return '<figure class="rq-pol" style="margin-block:0"><img alt="" src="'+esc(p)+'"></figure>'}).join('')+'</div>';
        else html+='<div class="rq-sheet rq-galwrap"><h2 class="rq-h2 rq-foil">'+esc(t('gallery'))+'</h2><div class="rq-gal">'+ph.map(function(p,i){return '<button type="button" class="rq-gi" data-gi="'+i+'"><img alt="" loading="lazy" src="'+esc(p)+'"></button>'}).join('')+'</div></div>'}
      if(on('rsvp')){html+='<div class="rq-sheet" id="rq-rsvp"><h2 class="rq-h2 rq-foil">'+esc(t('rsvp'))+'</h2>'+(inv.rsvpBy?'<p class="rq-caps rq-muted" style="margin:-6px 0 20px">'+esc(t('by'))+' '+esc(fmtDate(inv.rsvpBy,L,{day:'numeric',month:'long'}))+'</p>':'');
      if(st.sent){
        html+='<div class="rq-thanks"><p class="rq-msg" style="margin:0">'+esc(t('thanks'))+'</p>'+(st.sent.whatsapp?'<a class="rq-send" target="_blank" rel="noopener" href="'+esc(st.sent.whatsapp)+'">'+esc(t('wa'))+'</a>':'')+'</div>';
      } else {
        var mx=maxSeats();
        html+='<form class="rq-form" novalidate><div><label class="l" for="rq-name">'+esc(t('name'))+'</label><input type="text" id="rq-name" autocomplete="name" value="'+esc(guest&&guest.name||'')+'"></div>'+
         '<div><span class="l" style="display:block;font:600 12px/1.4 Figtree,system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin-bottom:5px">'+esc(t('att'))+'</span><div class="rq-att"><label><input type="radio" name="rq-att" id="rq-att-yes" value="yes"> '+esc(t('yes'))+'</label><label><input type="radio" name="rq-att" id="rq-att-no" value="no"> '+esc(t('no'))+'</label></div></div>'+
         (mx>1?'<div class="rq-gwrap"><span class="l" style="display:block;font:600 12px/1.4 Figtree,system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin-bottom:5px">'+esc(t('guests'))+'</span><div class="rq-step"><button type="button" data-g="-1" aria-label="−">−</button><output id="rq-guests">'+st.guests+'</output><button type="button" data-g="1" aria-label="+">+</button></div></div>':'')+
         '<div><label class="l" for="rq-diet">'+esc(t('diet'))+'</label><input type="text" id="rq-diet"></div>'+
         '<div><label class="l" for="rq-msg">'+esc(t('note'))+'</label><textarea id="rq-msg"></textarea></div>'+
         '<p class="rq-err" hidden></p><button class="rq-send" type="submit">'+esc(t('send'))+'</button>'+(opts.preview?'<p class="rq-note">'+esc(t('preview'))+'</p>':'')+'</form>';
      }
      html+='</div>';}
      html+='<div class="rq-foot"><span>'+(L==='ar'?'صُنعت بحبّ مع':L==='fr'?'Créée avec amour par':'Made with love by')+'</span><img alt="Reefq رِفق" src="'+LOGO+'"></div></section>';
    }
    html+='</div>';
    if(inv.musicUrl){
      var direct=/\.(mp3|m4a|ogg|wav|aac)(\?|$)/i.test(inv.musicUrl);
      html+=direct?'<button type="button" class="rq-vinyl'+(st.audio&&!st.audio.paused?' playing':'')+'" aria-label="'+esc(t('music'))+'">'+vinyl()+'<span>'+esc(t('music'))+'</span></button>'
        :'<a class="rq-vinyl" target="_blank" rel="noopener" href="'+esc(inv.musicUrl)+'" aria-label="'+esc(t('music'))+'">'+vinyl()+'<span>'+esc(t('music'))+'</span></a>';
    }
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
        setTimeout(function(){var cov=sc,fl=sc.querySelector('.rq3-flap');if(fl){fl.style.animation='none';fl.style.zIndex='0';fl.style.transition='none'}var cd=sc.querySelector('.rq3-card');if(cd){cd.style.transition='none';cd.style.transform='translateY(-54%)'}st.open=true;draw();var s=root.querySelector('.rq-scroll');if(s)s.scrollTop=0;cov.classList.add('handoff');root.appendChild(cov);requestAnimationFrame(function(){requestAnimationFrame(function(){cov.classList.add('fadeout')})});setTimeout(function(){if(cov.parentNode)cov.parentNode.removeChild(cov)},900)},reduce?200:2500);
      };
      sb.onclick=function(e){e.stopPropagation();go()};sc.querySelector('.rq3-env').onclick=go;
    }
    if(root.querySelector('[data-c]')){tick();st.timer=setInterval(tick,1000)}
    root.querySelectorAll('[data-gi]').forEach(function(b){b.onclick=function(){var src=b.querySelector('img').src,lb=document.createElement('div');lb.className='rq-lb';lb.setAttribute('role','dialog');lb.innerHTML='<img alt="" src="'+esc(src)+'"><button type="button" aria-label="'+esc(t('close'))+'">✕</button>';lb.onclick=function(){lb.remove()};root.appendChild(lb)}});
    var vb=root.querySelector('button.rq-vinyl');
    if(vb)vb.onclick=function(){
      if(!st.audio){st.audio=new Audio(inv.musicUrl);st.audio.loop=true}
      if(st.audio.paused){st.audio.play().then(function(){vb.classList.add('playing')}).catch(function(){})}else{st.audio.pause();vb.classList.remove('playing')}
    };
    root.querySelectorAll('[data-g]').forEach(function(b){b.onclick=function(){var mx=maxSeats();st.guests=Math.min(mx,Math.max(1,st.guests+ +b.dataset.g));root.querySelector('#rq-guests').textContent=st.guests}});
    var yes=root.querySelector('#rq-att-yes'),no=root.querySelector('#rq-att-no'),gw=root.querySelector('.rq-gwrap');
    if(yes&&gw){var upd=function(){gw.hidden=!!(no&&no.checked)};yes.onchange=upd;no.onchange=upd}
    var form=root.querySelector('.rq-form');
    if(form)form.onsubmit=function(e){
      e.preventDefault();
      var err=form.querySelector('.rq-err'),btn=form.querySelector('.rq-send');
      var r={guestId:guest&&guest.id||'',name:form.querySelector('#rq-name').value.trim(),attending:yes.checked,guests:yes.checked?st.guests:0,dietary:form.querySelector('#rq-diet').value.trim(),message:form.querySelector('#rq-msg').value.trim(),lang:st.lang};
      if(!r.name||!(yes.checked||no.checked)){err.textContent=t('need');err.hidden=false;return}
      err.hidden=true;btn.disabled=true;
      Promise.resolve(opts.onRsvp?opts.onRsvp(r):{}).then(function(res){st.sent=res||{};draw();var el=root.querySelector('#rq-rsvp');if(el)el.scrollIntoView({block:'center'})}).catch(function(x){btn.disabled=false;err.textContent=(x&&x.message&&x.userFacing)?x.message:t('err');err.hidden=false});
    };
  }
  draw();
  return{destroy:function(){clearInterval(st.timer);if(st.audio)st.audio.pause();root.innerHTML=''},setLang:function(l){st.lang=l;draw()},open:function(){st.open=true;draw()},play:function(){var s=root.querySelector('.rq3-seal');if(s)s.click();else{st.open=true;draw()}},scroller:function(){return root.querySelector('.rq-scroll')}};
}
window.ReefqInvite={THEME_LIST:THEME_LIST,sealCanvas:sealCanvas,linerTile:linerTile,PAPERS:PAPERS,SEALS:SEALS,LINERS:LINERS,ENV_DEFAULTS:ENV_DEFAULTS,LOGO:LOGO,LOGO_DARK:LOGO_DARK,render:render,waLink:waLink,T:T,fmtDate:fmtDate,sprig:sprig,initials:initials,namesOf:namesOf};
})();
