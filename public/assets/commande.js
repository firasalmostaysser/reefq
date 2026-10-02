(function(){
'use strict';
var $=function(s){return document.querySelector(s)};
var m=location.pathname.match(/\/commande\/(RQ-[A-Z0-9]{5})/),t=new URLSearchParams(location.search).get('t');
var API=m?'/api/public/orders/'+m[1]:'',Q='?t='+encodeURIComponent(t||'');
var STATUS={awaiting_payment:['En attente du virement','warn'],proof_sent:['Virement en vérification','warn'],paid:['Paiement confirmé','good'],rejected:['Virement non trouvé','bad'],cancelled:['Commande annulée','bad']};
var O=null,poll=null,file=null;
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function toast(x){var d=document.createElement('div');d.className='toast';d.textContent=x;document.body.appendChild(d);setTimeout(function(){d.remove()},2200)}
function copy(txt){try{navigator.clipboard.writeText(txt).then(function(){toast('Copié')},function(){toast(txt)})}catch(e){toast(txt)}}
function fail(msg){$('#loading').textContent=msg;$('#loading').hidden=false;$('#view').hidden=true}
if(!m||!t){fail('Lien incomplet. Utilisez le lien reçu après votre commande.');return}

function load(){return fetch(API+Q,{cache:'no-store'}).then(function(r){return r.json().then(function(j){if(!r.ok)throw new Error(j.error||'Erreur');return j})}).then(render).catch(function(e){if(!O)fail(e.message)})}

var seen=false;
function render(o){
  if(!seen&&window.rqTrack){seen=true;window.rqTrack('client_space_viewed',{status:o.status,plan:o.plan})}
  O=o;$('#loading').hidden=true;$('#view').hidden=false;
  $('#h-names').textContent=o.names||'Votre commande';$('#h-code').textContent=o.code;$('#h-plan').textContent='Offre '+o.plan+' · '+o.price+' DT';
  var st=STATUS[o.status]||[o.status,''];$('#h-status').textContent=st[0];$('#h-status').className='pill '+st[1];
  if(o.whatsapp){var wa=$('#wa-help');wa.hidden=false;wa.href='https://wa.me/'+String(o.whatsapp).replace(/[^0-9]/g,'')+'?text='+encodeURIComponent('Bonjour Reefq, ma commande '+o.code+' ('+(o.names||'')+').')}
  /* steps: prepare the invitation, pay, we check, share it with the guests */
  var paid=o.status==='paid',sent=o.status==='proof_sent'||paid,steps=[['Votre invitation',!!o.briefAt],['Virement envoyé',sent],['Paiement vérifié',paid],['Invitation en ligne',paid&&!!o.invitation]];
  var nowI=steps.findIndex(function(s){return !s[1]});
  $('#track').innerHTML=steps.map(function(s,i){return '<li class="'+(s[1]?'done':i===nowI?'now':'')+'">'+s[0]+'</li>'}).join('');
  var needPay=o.status==='awaiting_payment'||o.status==='rejected';
  $('#pay').hidden=!needPay;$('#checking').hidden=o.status!=='proof_sent';$('#paid').hidden=!paid;$('#space').hidden=!paid;
  renderBrief(o);
  if(needPay){
    var full=o.deposit>=o.price;
    $('#p-title').textContent=full?'Réglez votre commande par virement':'Réglez l\'acompte par virement';
    $('#p-amount').textContent=o.deposit+' DT';$('#p-of').textContent=full?(o.referrer?'(-10 % offert par vos proches)':''):'(acompte sur '+o.price+' DT, le reste à la livraison de votre invitation)';$('#p-ref').textContent=o.code;
    var rej=o.history.filter(function(h){return h.status==='rejected'}).pop();$('#p-rejected').hidden=o.status!=='rejected';if(rej)$('#p-rejected').textContent='Nous n\'avons pas trouvé ce virement : '+(rej.note||'')+'. Vérifiez et renvoyez un justificatif.';
    var b=o.bank||{},rows=[['Banque',b.name],['Titulaire',b.holder],['RIB',b.rib],['IBAN',b.iban],['Motif',o.code]].filter(function(r){return r[1]});
    $('#bank').innerHTML=b.rib?rows.map(function(r,i){return '<dt>'+r[0]+'</dt><dd>'+esc(r[1])+'</dd><button class="btn ghost sm" type="button" data-cp="'+i+'">Copier</button>'}).join(''):'<dt>RIB</dt><dd>Nous vous envoyons notre RIB sur WhatsApp.</dd><span></span>';
    document.querySelectorAll('[data-cp]').forEach(function(x){x.onclick=function(){copy(rows[+x.dataset.cp][1])}});
  }
  if(o.status==='proof_sent'){$('#c-proofs').textContent=o.proofs.length+' justificatif(s) envoyé(s), le dernier le '+new Date(o.proofs[o.proofs.length-1].at).toLocaleString('fr-FR',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'})+'.'}
  if(o.status==='paid'){
    $('#paid-txt').textContent='Nous avons bien reçu '+o.paid+' DT. Votre espace client est ouvert : vous y trouverez votre invitation et les réponses de vos invités en direct.';
    var inv=o.invitation;$('#inv-none').hidden=!!inv;$('#inv-box').hidden=!inv;
    $('#inv-none-txt').textContent=o.designPending?'Notre designer dessine votre site sur mesure à partir de vos informations. Le lien et les liens de vos invités apparaîtront ici dès qu\'il est prêt.':o.briefAt?'Votre invitation se prépare. Actualisez cette page dans un instant.':'Remplissez « Préparez votre invitation » ci-dessus : elle sera en ligne dès que vous enregistrez.';
    if(inv){var link=location.origin+inv.url;$('#inv-link').textContent=link;$('#inv-open').href=link;$('#inv-copy').onclick=function(){copy(link)};
      var r=o.rsvps||{total:0,coming:0,declined:0,items:[]};$('#t-total').textContent=r.total;$('#t-coming').textContent=r.coming;$('#t-declined').textContent=r.declined;
      $('#csv').href=API+'/rsvps.csv'+Q;
      $('#rows').innerHTML=r.items.length?r.items.map(function(x){return '<tr><td>'+esc(x.name)+'</td><td>'+(x.attending?'Présent':'Absent')+'</td><td class="num">'+(x.attending?x.guests:0)+'</td><td>'+esc(x.dietary)+'</td><td>'+esc(x.message)+'</td></tr>'}).join(''):'<tr><td colspan="5" class="empty">Pas encore de réponse.</td></tr>';
      var gl=inv.guests||[];$('#glist').hidden=!gl.length;
      var cn=(inv.names||[]).filter(Boolean).join(' & ');
      $('#glinks').innerHTML=gl.map(function(g,i){return '<li><span>'+esc(g.name)+' · '+(g.seats||1)+' pl.</span><span class="gbtns"><button class="btn sm" type="button" data-gl="'+i+'">Copier le lien</button>'+(window.qrcode?'<button class="btn sm ghost" type="button" data-gq="'+i+'" data-k="png" aria-label="QR code PNG pour '+esc(g.name)+'">QR PNG</button><button class="btn sm ghost" type="button" data-gq="'+i+'" data-k="svg" aria-label="QR code SVG pour '+esc(g.name)+'">QR SVG</button>':'')+'</span></li>'}).join('');
      document.querySelectorAll('[data-gl]').forEach(function(x){x.onclick=function(){copy(location.origin+gl[+x.dataset.gl].link)}});
      document.querySelectorAll('[data-gq]').forEach(function(x){x.onclick=function(){var g=gl[+x.dataset.gq];guestQr(location.origin+g.link,cn,g.name,x.dataset.k)}});
    }
  }
  clearInterval(poll);if(o.status==='proof_sent'||o.status==='paid')poll=setInterval(function(){if(!dirty&&gEdit<0)load()},o.status==='paid'?60000:30000);
}

/* ---------- the couple prepares their invitation ---------- */
var RW=window.ReefqWording,THEME_NAMES={reefq:'Reefq',zitouna:'Zitouna',yasmine:'Yasmine',layl:'Layl',sidi:'Sidi Bou Said',kairouan:'Kairouan',oldmoney:'Old Money',sauge:'Sauge',bordeaux:'Bordeaux',sahara:'Sahara'};
var B=null,G=[],dirty=false,briefOpen=null,pvReady=false,pvShown=false;
function opts(list,cur){return list.map(function(x){return '<option value="'+esc(x.id)+'"'+(x.id===cur?' selected':'')+'>'+esc(x.label)+'</option>'}).join('')}
function toneOf(ev,msg){if(!msg||!msg.fr)return 'classic';var t=RW.TONES.filter(function(x){return RW.get(ev,x.id).fr===msg.fr})[0];return t?t.id:'custom'}
/* What the couple typed and did not save yet stays in this browser, and comes back after a reload or a closed tab
   (only if the saved invitation has not changed in between). */
var KEY='rq-brief-'+m[1],restored=false;
function keepDraft(){try{if(dirty)localStorage.setItem(KEY,JSON.stringify({at:Date.now(),d:collect()}));else localStorage.removeItem(KEY)}catch(e){}}
function savedDraft(o){if(restored)return null;restored=true;var k=null;try{k=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}
  if(!k||!k.d)return null;if((k.d.base||null)!==((o.brief&&o.brief.updatedAt)||null)){try{localStorage.removeItem(KEY)}catch(e){}return null}return k}
function renderBrief(o){
  var box=$('#brief');box.hidden=o.status==='cancelled';if(box.hidden||dirty)return;
  var k=savedDraft(o);if(k){o=Object.assign({},o,{brief:Object.assign({},k.d,{updatedAt:o.brief&&o.brief.updatedAt})});briefOpen=true}
  B=o.brief||{};G=(B.guests||[]).map(function(g){return{id:g.id,name:g.name,phone:g.phone,seats:g.seats}});
  var names=String(o.names||'').split(/\s*(?:&|et|\+|و)\s*/i),ev=B.eventType||'wedding';
  $('#b-a').value=(B.a&&B.a.name)||names[0]||'';$('#b-b').value=(B.b&&B.b.name&&B.b.name!=='—'?B.b.name:'')||names[1]||'';
  $('#b-a-ar').value=(B.a&&B.a.ar)||'';$('#b-b-ar').value=(B.b&&B.b.ar)||'';
  $('#b-event').innerHTML=opts(RW.EVENTS.map(function(x){return{id:x.id,label:x.label.fr}}),ev);
  $('#b-date').value=B.date||o.date||'';$('#b-time').value=B.time||'20:00';$('#b-city').value=B.city||o.city||'';$('#b-venue').value=B.venue||'';$('#b-maps').value=B.maps||'';
  $('#b-dress').value=B.dress||'';$('#b-rsvpby').value=B.rsvpBy||'';$('#b-seats').value=B.maxGuests||2;
  $('#b-theme').innerHTML=opts((o.themes||Object.keys(THEME_NAMES)).map(function(t){return{id:t,label:THEME_NAMES[t]||t}}),B.theme||o.theme||'reefq');
  $('#b-lang').value=B.lang||'fr';
  $('#b-open').innerHTML=opts(RW.OPENINGS.map(function(x){return{id:x.id,label:x.label.fr}}),B.opening||'none');
  var tone=toneOf(ev,B.message);
  $('#b-tone').innerHTML=opts(RW.TONES.map(function(x){return{id:x.id,label:x.label.fr}}).concat(tone==='custom'?[{id:'custom',label:'Texte personnalisé'}]:[]),tone);
  var m=B.message&&B.message.fr?B.message:RW.get(ev,tone);$('#b-msg-fr').value=m.fr||'';$('#b-msg-ar').value=m.ar||'';$('#b-msg-en').value=m.en||'';
  $('#b-story').value=(B.story&&(B.story[B.lang||'fr']||B.story.fr))||'';
  $('#b-theme-wrap').hidden=!!o.custom;$('#b-custom-note').hidden=!o.custom;
  $('#b-guests-wrap').hidden=!o.guestLinks;$('#b-pv-btn').hidden=!!o.custom;$('#b-story-wrap').hidden=!o.guestLinks;
  if(briefOpen===null)briefOpen=!o.briefAt;
  setBriefOpen(briefOpen,o);renderGuests();preview();
  if(k){dirty=true;$('#b-status').textContent='Modifications non enregistrées retrouvées';toast('Nous avons retrouvé vos modifications non enregistrées.')}
}
function setBriefOpen(on,o){o=o||O;briefOpen=on;$('#b-form').hidden=!on;$('#b-lead').hidden=!on;$('#b-toggle').hidden=on||!o.briefAt;
  $('#b-title').textContent=o.briefAt?'Les détails de votre invitation':'Préparez votre invitation';
  var d=$('#b-done');d.hidden=!o.briefAt;
  d.textContent=o.briefAt?(o.status==='paid'?'Enregistrée et en ligne. Modifiez-la quand vous voulez : vos invités voient les changements sur le même lien.':'Enregistrée. Elle sera en ligne dès que nous aurons confirmé votre virement.'):'';
  if(!on&&!pvShown)$('#b-pv').hidden=true}
$('#b-toggle').onclick=function(){setBriefOpen(true);$('#b-form').scrollIntoView({behavior:'smooth',block:'start'})};
function collect(){
  var lang=$('#b-lang').value,story={};story[lang]=$('#b-story').value.trim();
  return {theme:$('#b-theme').value,lang:lang,eventType:$('#b-event').value,opening:$('#b-open').value,
    a:{name:$('#b-a').value.trim(),ar:$('#b-a-ar').value.trim()},b:{name:$('#b-b').value.trim(),ar:$('#b-b-ar').value.trim()},
    date:$('#b-date').value,time:$('#b-time').value,city:$('#b-city').value.trim(),venue:$('#b-venue').value.trim(),maps:$('#b-maps').value.trim(),
    dress:$('#b-dress').value.trim(),rsvpBy:$('#b-rsvpby').value,maxGuests:+$('#b-seats').value||2,
    message:{fr:$('#b-msg-fr').value.trim(),ar:$('#b-msg-ar').value.trim(),en:$('#b-msg-en').value.trim()},story:story,guests:G,base:(B&&B.updatedAt)||null};
}
function touchB(e){if(e&&e.target&&/^ge-/.test(e.target.id))return;dirty=true;clearTimeout(kT);kT=setTimeout(keepDraft,400);$('#b-status').textContent='Modifications non enregistrées';preview()}
$('#b-form').addEventListener('input',touchB);
$('#b-form').addEventListener('change',function(e){
  if(e.target.id==='b-tone'||e.target.id==='b-event'){var t=$('#b-tone').value;if(t!=='custom'){var m=RW.get($('#b-event').value,t);$('#b-msg-fr').value=m.fr;$('#b-msg-ar').value=m.ar;$('#b-msg-en').value=m.en}}
  touchB()});
/* preview: the same engine as the guests', in a phone-sized frame, refreshed as they type */
var pvT=null;
function preview(open){if(!pvShown)return;clearTimeout(pvT);pvT=setTimeout(function(){
  var d=collect(),f=$('#b-frame');if(!pvReady||!f.contentWindow)return;
  var inv={id:'apercu',theme:O&&O.custom?'reefq':d.theme,lang:d.lang,eventType:d.eventType,opening:d.opening,a:d.a,b:d.b,date:d.date,time:d.time,city:d.city,venue:d.venue,maps:d.maps,dress:d.dress,rsvpBy:d.rsvpBy,maxGuests:d.maxGuests,message:d.message,story:d.story,events:[],photos:[]};
  var g=G[0]?{id:'g',name:G[0].name,seats:G[0].seats}:null;
  f.contentWindow.postMessage({type:'rq-preview',inv:inv,guest:g,open:!!open},location.origin)},250)}
addEventListener('message',function(e){if(e.origin===location.origin&&e.data&&e.data.type==='rq-preview-ready'){pvReady=true;preview()}});
$('#b-pv-btn').onclick=function(){pvShown=!pvShown;$('#b-pv').hidden=!pvShown;this.textContent=pvShown?'Masquer l\'aperçu':'Voir l\'aperçu';if(pvShown){var f=$('#b-frame');if(!f.getAttribute('src'))f.src='/apercu.html';preview();$('#b-pv').scrollIntoView({behavior:'smooth',block:'center'})}};
/* guest list: one line per invitation, "name, phone, seats" */
function renderGuests(){
  var seats=G.reduce(function(s,g){return s+(+g.seats||1)},0);
  $('#b-gcount').textContent=G.length?G.length+' invitation(s) · '+seats+' place(s) réservée(s)':'Aucun invité pour l\'instant.';
  $('#b-glist').innerHTML=G.map(function(g,i){
    if(i===gEdit)return '<li class="gedit"><input id="ge-name" aria-label="Nom" value="'+esc(g.name)+'"><input id="ge-phone" aria-label="Numéro WhatsApp" inputmode="tel" placeholder="Numéro WhatsApp" value="'+esc(g.phone||'')+'"><input id="ge-seats" aria-label="Places" type="number" min="1" max="50" value="'+(+g.seats||1)+'"><span class="gbtns"><button class="btn sm primary" type="button" id="ge-ok">OK</button><button class="btn sm ghost" type="button" id="ge-cancel">Annuler</button></span></li>';
    return '<li><span><b>'+esc(g.name)+'</b>'+(g.phone?' · '+esc(g.phone):'')+' · '+(+g.seats||1)+' pl.</span><span class="gbtns"><button class="btn sm ghost" type="button" data-edb="'+i+'" aria-label="Modifier '+esc(g.name)+'">Modifier</button><button class="btn sm ghost" type="button" data-rmb="'+i+'" aria-label="Retirer '+esc(g.name)+'">Retirer</button></span></li>'}).join('');
  document.querySelectorAll('[data-rmb]').forEach(function(b){b.onclick=function(){G.splice(+b.dataset.rmb,1);gEdit=-1;renderGuests();touchB()}});
  document.querySelectorAll('[data-edb]').forEach(function(b){b.onclick=function(){gEdit=+b.dataset.edb;renderGuests();$('#ge-name').focus()}});
  if(gEdit>=0&&$('#ge-ok')){
    $('#ge-ok').onclick=guestDone;$('#ge-cancel').onclick=function(){gEdit=-1;renderGuests()};
    $('#b-glist .gedit').onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();guestDone()}else if(e.key==='Escape'){gEdit=-1;renderGuests()}};
  }
}
/* a guest is corrected in place (name, WhatsApp number, seats) and keeps their personal link */
var gEdit=-1,kT=null;
function guestDone(){
  var nm=$('#ge-name').value.trim();if(!nm){$('#ge-name').focus();return false}
  Object.assign(G[gEdit],{name:nm,phone:$('#ge-phone').value.trim(),seats:Math.min(50,Math.max(1,parseInt($('#ge-seats').value,10)||1))});
  gEdit=-1;renderGuests();touchB();return true}
$('#b-add').onclick=function(){
  var lines=$('#b-paste').value.split(/\n+/).map(function(l){return l.trim()}).filter(Boolean);if(!lines.length){$('#b-paste').focus();return}
  lines.forEach(function(l){var p=l.split(/[,;\t]/).map(function(x){return x.trim()}),s=parseInt(p[2],10);if(p[0])G.push({name:p[0],phone:p[1]||'',seats:s>0?s:1})});
  $('#b-paste').value='';renderGuests();touchB();toast(lines.length+' ligne(s) ajoutée(s). Pensez à enregistrer.');
};
$('#b-form').onsubmit=function(e){e.preventDefault();
  var d=collect(),er=$('#b-err'),btn=$('#b-save');er.hidden=true;
  if(!d.a.name||!d.b.name){er.textContent='Indiquez vos deux prénoms.';er.hidden=false;$('#b-a').focus();return}
  if(!d.date){er.textContent='Indiquez la date.';er.hidden=false;$('#b-date').focus();return}
  if(gEdit>=0&&$('#ge-ok')&&!guestDone())return;
  if($('#b-paste').value.trim())$('#b-add').click();
  d=collect();
  btn.disabled=true;btn.textContent='Enregistrement…';
  fetch(API+'/invitation'+Q,{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(d)})
   .then(function(r){return r.json().catch(function(){return{}}).then(function(j){if(!r.ok){var x=new Error(j.error||'Enregistrement impossible. Réessayez dans un instant.');x.status=r.status;throw x}return j})},
     function(){throw new Error('Pas de connexion. Vos modifications restent sur cette page : réessayez dans un instant.')})
   .then(function(o){var first=!O.briefAt;dirty=false;clearTimeout(kT);keepDraft();$('#b-status').textContent='Enregistré';briefOpen=false;render(o);toast('Invitation enregistrée');
     if(window.rqTrack)window.rqTrack('brief_saved',{plan:o.plan,first:first,guests:G.length,paid:o.status==='paid'});
     var next=o.status==='paid'?$('#space'):!$('#pay').hidden?$('#pay'):$('#brief');next.scrollIntoView({behavior:'smooth',block:'start'})})
   .catch(function(x){if(x.status===409)return stale();er.textContent=x.message;er.hidden=false}).then(function(){btn.disabled=false;btn.textContent='Enregistrer mon invitation'});
};
/* the invitation was saved elsewhere after this page loaded (another phone, or our team): the couple chooses, nothing is lost silently */
function stale(){
  var er=$('#b-err');
  return fetch(API+Q,{cache:'no-store'}).then(function(r){return r.json()}).then(function(o){
    er.innerHTML='Votre invitation a été modifiée entre-temps, sur un autre appareil ou par notre équipe.<span class="gbtns stale"><button class="btn sm primary" type="button" id="st-load">Voir la dernière version</button><button class="btn sm ghost" type="button" id="st-keep">Garder mes modifications</button></span>';er.hidden=false;
    $('#st-load').onclick=function(){dirty=false;keepDraft();gEdit=-1;er.hidden=true;render(o);$('#b-status').textContent='Dernière version chargée'};
    $('#st-keep').onclick=function(){B.updatedAt=o.brief&&o.brief.updatedAt;er.hidden=true;$('#b-form').requestSubmit()};
  }).catch(function(){er.textContent='Enregistrement impossible. Actualisez la page et réessayez.';er.hidden=false})}
addEventListener('beforeunload',function(e){if(dirty){e.preventDefault();e.returnValue=''}});

$('#proof-file').onchange=function(){
  file=this.files[0]||null;$('#proof-err').hidden=true;$('#proof-send').disabled=!file;
  $('#drop-txt').textContent=file?file.name:'Choisir une photo ou un PDF';
  var pv=$('#proof-prev');if(file&&/^image\//.test(file.type)){pv.src=URL.createObjectURL(file);pv.hidden=false}else pv.hidden=true;
};
function shrink(f){ // big phone photos are resized before upload
  return new Promise(function(res){if(!/^image\/(jpeg|png|webp)$/.test(f.type)||f.size<1500000)return res(f);
    var im=new Image();im.onload=function(){var s=Math.min(1,2000/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*s;c.height=im.height*s;c.getContext('2d').drawImage(im,0,0,c.width,c.height);c.toBlob(function(b){res(b||f)},'image/jpeg',.85)};im.onerror=function(){res(f)};im.src=URL.createObjectURL(f)})}
$('#proof-form').onsubmit=function(e){
  e.preventDefault();if(!file)return;var btn=$('#proof-send'),er=$('#proof-err');btn.disabled=true;btn.textContent='Envoi…';er.hidden=true;
  shrink(file).then(function(b){return fetch(API+'/proof'+Q,{method:'POST',headers:{'content-type':b.type||file.type},body:b})})
   .then(function(r){return r.json().then(function(j){if(!r.ok)throw new Error(j.error||'Envoi impossible');return j})})
   .then(function(o){file=null;$('#proof-file').value='';$('#proof-prev').hidden=true;$('#drop-txt').textContent='Choisir une photo ou un PDF';render(o);toast('Justificatif envoyé');if(window.rqTrack)window.rqTrack('payment_proof_uploaded',{plan:o.plan,type:(file&&file.type)||''})})
   .catch(function(x){er.textContent=x.message;er.hidden=false}).then(function(){btn.textContent='Envoyer le justificatif';btn.disabled=!file});
};
$('#c-again').onclick=function(){$('#checking').hidden=true;$('#pay').hidden=false;render(Object.assign({},O,{status:'awaiting_payment'}));$('#checking').hidden=false};
$('#copy-page').onclick=function(){copy(location.href)};

/* QR code of a personal link (vendor/qrcode.js): PNG 1024 px with white margin and names under the code, or SVG */
var INK='#0f5c60';
function slug(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40)||'invite'}
function save(name,blob){var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500)}
function guestQr(link,cap,sub,kind){
  var q=qrcode(0,'M');q.addData(link);q.make();var n=q.getModuleCount(),file='qr-'+slug(sub)+'.'+kind;
  if(kind==='svg'){var c=10,m=40,W=n*c+2*m,H=W+110,d='';for(var r=0;r<n;r++)for(var k=0;k<n;k++)if(q.isDark(r,k))d+='M'+(m+k*c)+' '+(m+r*c)+'h'+c+'v'+c+'h-'+c+'z';
    save(file,new Blob(['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" shape-rendering="crispEdges"><rect width="'+W+'" height="'+H+'" fill="#fff"/><path fill="'+INK+'" d="'+d+'"/><text x="'+W/2+'" y="'+(W+22)+'" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-weight="600" font-size="34" fill="'+INK+'">'+esc(cap)+'</text><text x="'+W/2+'" y="'+(W+70)+'" text-anchor="middle" font-family="Figtree, Arial, sans-serif" font-size="22" fill="#555">'+esc(sub)+'</text></svg>'],{type:'image/svg+xml'}));return}
  var fonts=document.fonts?document.fonts.load("600 64px 'Cormorant Garamond'").catch(function(){}):Promise.resolve();
  fonts.then(function(){
    var S=1024,textH=124,cell=Math.floor((S-60-textH)/(n+8)),size=cell*n,x0=Math.round((S-size)/2),y0=Math.round((S-cell*(n+8)-textH)/2)+cell*4;
    var cv=document.createElement('canvas');cv.width=cv.height=S;var g=cv.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,S,S);g.fillStyle=INK;
    for(var r=0;r<n;r++)for(var k=0;k<n;k++)if(q.isDark(r,k))g.fillRect(x0+k*cell,y0+r*cell,cell,cell);
    var fit=function(t,px,fam,w){do{g.font=w+' '+px+'px '+fam;px-=2}while(g.measureText(t).width>S-120&&px>20)};
    g.textAlign='center';var ty=y0+size+cell*4+44;fit(cap,64,"'Cormorant Garamond', Amiri, Georgia, serif",'600');g.fillText(cap,S/2,ty);
    g.fillStyle='#555';fit(sub,40,'Figtree, Amiri, Arial, sans-serif','500');g.fillText(sub,S/2,ty+64);
    cv.toBlob(function(b){save(file,b)},'image/png');
  });
}
load();
})();
