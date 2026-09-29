(function(){
var BASE={id:'p',theme:'reefq',eventType:'wedding',lang:'fr',a:{name:'Yasmine',ar:'ياسمين'},b:{name:'Karim',ar:'كريم'},date:'2027-06-12',time:'20:30',venue:'Dar El Marsa',city:'La Marsa, Tunis',dress:'Tenue de soirée, tons clairs',events:[{type:'henna',date:'2027-06-10',time:'19:00',place:'Maison familiale, Sousse'},{type:'dinner',date:'2027-06-12',time:'20:30',place:'Dar El Marsa'}],message:{fr:'',ar:'',en:''},rsvpBy:'2027-05-20',maxGuests:4};
function inv(el,o){var d=JSON.parse(JSON.stringify(BASE));Object.assign(d,o.inv||{});var r=document.createElement('div');r.style.height='100%';el.appendChild(r);return ReefqInvite.render(r,d,{lang:o.lang||'fr',guest:o.guest||null})}
var L=function(){return ReefqInvite.LOGO};
window.poster=function(kind){
  var s=document.getElementById('s');s.className='p '+kind;var H='';
  if(kind==='hero'||kind==='hero-ar'||kind==='story'){var ar=kind==='hero-ar';
    H='<img class="lg" src="'+L()+'"><div class="hl'+(ar?' ar':'')+'">'+(ar?'<p class="k">دعوات زفاف رقمية · تونس</p><h1>دعوة تُفتح<br>كأنها ظرف حقيقي</h1>':'<p class="k">Faire-part digital · Tunisie</p><h1>L\'invitation qu\'on ouvre comme une vraie enveloppe</h1>')+'</div><div class="ph"><div class="scr" id="i"></div></div>'+
      (kind==='story'?'<div class="cta">Commentez « LIEN »<small>dès 149 DT · reefq.com</small></div>':'<div class="price'+(ar?' ar':'')+'">'+(ar?'ابتداءً من 149 د':'Dès 149 DT')+'</div>');
    s.innerHTML=H;inv(document.getElementById('i'),{lang:ar?'ar':'fr',inv:{theme:ar?'zitouna':'reefq'}});}
  if(kind==='guest'){H='<img class="lg" src="'+L()+'"><div class="hl"><p class="k">Offre Signature</p><h1>Chaque invité reçoit l\'invitation à son nom</h1><p class="sub">Un lien personnel par famille, envoyé sur WhatsApp, avec les places réservées.</p></div><div class="ph"><div class="scr" id="i"></div></div>';
    s.innerHTML=H;inv(document.getElementById('i'),{lang:'fr',inv:{theme:'yasmine'},guest:{id:'g',name:'Famille Ben Salah',seats:4}});}
  if(kind==='seals'){var cols=[['#147d82','Teal'],['#8e1f2f','Bordeaux'],['#b8913f','Or'],['#5b6b33','Olive'],['#27549a','Bleu'],['#1b1b1b','Noir']];
    H='<img class="lg" src="'+L()+'"><div class="hl"><p class="k">Détail qui change tout</p><h1>Votre sceau. Vos initiales.</h1><p class="sub">Cire brillante, monogramme doré, 8 couleurs.</p></div><div class="grid">'+cols.map(function(c,i){return '<figure><div class="sl" data-c="'+c[0]+'" data-i="'+i+'"></div><figcaption>'+c[1]+'</figcaption></figure>'}).join('')+'</div>';
    s.innerHTML=H;var ini=['Y & K','S & A','M & R','L & N','I & F','A & H'];document.querySelectorAll('.sl').forEach(function(d){var cv=ReefqInvite.sealCanvas(ini[+d.dataset.i],d.dataset.c,700+ +d.dataset.i*13,360);d.appendChild(cv)});}
  if(kind==='offers'){H='<img class="lg" src="'+L()+'"><div class="hl"><p class="k">Paiement unique · invités illimités</p><h1>Nos offres</h1></div><div class="plans">'+
    [['Essentiel','149','Enveloppe & sceau à vos couleurs · FR/AR/EN · RSVP en direct'],['Signature','249','+ un lien personnel par invité · envoi WhatsApp · musique & photos'],['Prestige','349','+ thème sur mesure · cartes imprimées avec QR · envoi géré par Reefq']].map(function(p,i){return '<div class="pl'+(i===1?' best':'')+'">'+(i===1?'<span>Le plus choisi</span>':'')+'<h3>'+p[0]+'</h3><p class="pr">'+(i===2?'<small>dès </small>':'')+'<b>'+p[1]+'</b> DT</p><p>'+p[2]+'</p></div>'}).join('')+'</div><p class="foot">Réservez sur WhatsApp · reefq.com</p>';s.innerHTML=H;}
  if(kind==='opened'){H='<div class="full" id="i"></div><div class="cap2"><span>3 secondes pour ouvrir. Une émotion qui reste.</span></div>';s.innerHTML=H;window.__h=inv(document.getElementById('i'),{lang:'fr',inv:{theme:'reefq'}});}
};
window.__sync=function(T){document.getAnimations().forEach(function(a){if(a.__t0===undefined){a.__t0=T;a.pause()}try{a.currentTime=Math.max(0,T-a.__t0)}catch(e){}})};
})();
