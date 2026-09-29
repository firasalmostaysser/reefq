/* Deterministic scene driver for Reefq promo renders (frames are captured by Playwright). */
(function(){
var S={t:0,cfg:null,h:null,clicked:false};
var $=function(s){return document.querySelector(s)};
var BASE={id:'promo',theme:'reefq',eventType:'wedding',lang:'fr',a:{name:'Yasmine',ar:'ياسمين'},b:{name:'Karim',ar:'كريم'},date:'2027-06-12',time:'20:30',venue:'Dar El Marsa',city:'La Marsa, Tunis',dress:'Tenue de soirée, tons clairs',
  events:[{type:'henna',date:'2027-06-10',time:'19:00',place:'Maison familiale, Sousse'},{type:'contract',date:'2027-06-11',time:'17:00',place:'Municipalité de La Marsa'},{type:'dinner',date:'2027-06-12',time:'20:30',place:'Dar El Marsa, La Marsa'}],
  message:{fr:'',ar:'',en:''},rsvpBy:'2027-05-20',maxGuests:4};
window.setupScene=function(cfg){
  S.cfg=cfg;S.t=0;S.clicked=false;
  var inv=JSON.parse(JSON.stringify(BASE));Object.assign(inv,cfg.inv||{});
  var el=$('#inv');el.innerHTML='';var r=document.createElement('div');el.appendChild(r);
  S.h=ReefqInvite.render(r,inv,{lang:cfg.lang||inv.lang,guest:cfg.guest||null,onRsvp:function(){return{}}});
  if(cfg.open)S.h.open();
  $('#cap').innerHTML=cfg.caption||'';$('#cap').className='cap '+(cfg.capPos||'top')+(cfg.lang==='ar'?' ar':'');
  $('#end').innerHTML=cfg.end||'';$('#end').style.opacity=0;
  $('#tap').style.opacity=0;
  document.documentElement.lang=cfg.lang||'fr';
};
function ease(x){return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2}
function cl(x){return x<0?0:x>1?1:x}
window.__sync=function(T){
  var c=S.cfg;S.t=T;
  document.getAnimations().forEach(function(a){if(a.__t0===undefined){a.__t0=T;a.pause()}try{a.currentTime=Math.max(0,T-a.__t0)}catch(e){}});
  // caption
  var cap=$('#cap');var ci=c.capIn||200,co=c.capOut||1e9;cap.style.opacity=String(cl((T-ci)/400)*(1-cl((T-co)/400)));cap.style.transform='translateY('+((1-cl((T-ci)/500))*14)+'px)';
  // tap hint + click
  if(c.tapAt!=null){var tp=$('#tap'),seal=document.querySelector('.rq3-seal');
    if(seal){var r=seal.getBoundingClientRect();tp.style.left=(r.left+r.width/2)+'px';tp.style.top=(r.top+r.height/2)+'px'}
    var k=(T-(c.tapAt-500))/700;tp.style.opacity=String(k>0&&k<1.3?Math.min(1,k*3)*(1-cl((k-.8)*2)):0);tp.style.transform='translate(-50%,-50%) scale('+(1.3-.4*cl(k))+')';
    if(!S.clicked&&T>=c.tapAt&&seal){S.clicked=true;seal.click()}}
  // scroll inside
  if(c.scroll){var sc=document.querySelector('.rq-scroll');if(sc){sc.style.scrollBehavior='auto';var p=ease(cl((T-c.scroll[0])/(c.scroll[1]-c.scroll[0])));var tgt=c.scroll[2]==='rsvp'?(function(){var e=document.getElementById('rq-rsvp');return e?e.offsetTop-40:0})():c.scroll[2];sc.scrollTop=p*tgt}}
  // end card
  if(c.endAt!=null){$('#end').style.opacity=String(cl((T-c.endAt)/600))}
  return T;
};
})();
