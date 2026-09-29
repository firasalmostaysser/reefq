/* Guest-facing invitation: /i/<id>?g=<guest id> */
(function(){
'use strict';
var app=document.getElementById('app');
var m=location.pathname.match(/^\/i\/([a-z0-9-]{3,80})/),q=new URLSearchParams(location.search);
function msg(t){app.innerHTML='<p class="msg"></p>';app.firstChild.textContent=t}
if(!m){msg('Lien d\'invitation incomplet.');return}
var DEMO={id:'demo',theme:'reefq',eventType:'wedding',lang:'fr',a:{name:'Yasmine',ar:'ياسمين'},b:{name:'Karim',ar:'كريم'},date:'2027-06-12',time:'20:30',venue:'Dar El Marsa',city:'La Marsa, Tunis',dress:'Tenue de soirée, tons clairs',
  events:[{type:'henna',date:'2027-06-10',time:'19:00',place:'Maison familiale, Sousse'},{type:'contract',date:'2027-06-11',time:'17:00',place:'Municipalité de La Marsa'},{type:'dinner',date:'2027-06-12',time:'20:30',place:'Dar El Marsa, La Marsa'}],
  message:{fr:'',ar:'',en:''},rsvpBy:'2027-05-20',maxGuests:4};
function show(inv,guest,demo){
  app.innerHTML='';var el=document.createElement('div');el.style.height='100%';app.appendChild(el);
  var n=ReefqInvite.namesOf(inv,inv.lang||'fr');if(n[0]&&n[1])document.title=n[0]+' & '+n[1];
  ReefqInvite.render(el,inv,{guest:guest,preview:demo,badge:demo?'Démo':'',onRsvp:function(r){
    if(demo)return new Promise(function(res){setTimeout(function(){res({})},500)});
    var w=ReefqInvite.waLink(inv,r);
    return fetch('/api/public/invitations/'+encodeURIComponent(inv.id)+'/rsvp',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(r)})
      .then(function(x){if(!x.ok)throw 0;return{}})
      .catch(function(){if(w)return{whatsapp:w};throw 0});
  }});
}
if(m[1]==='demo'){show(DEMO,q.get('to')?{id:'demo',name:q.get('to'),seats:+q.get('n')||2}:null,true);return}
fetch('/api/public/invitations/'+m[1]+(q.get('g')?'?g='+encodeURIComponent(q.get('g')):''))
  .then(function(r){if(r.status===404||r.status===410)throw 404;if(!r.ok)throw 1;return r.json()})
  .then(function(d){show(d.invitation,d.guest,false)})
  .catch(function(e){msg(e===404?'Cette invitation est introuvable. Demandez un nouveau lien aux mariés.':'L\'invitation n\'a pas pu se charger. Actualisez la page.')});
})();
