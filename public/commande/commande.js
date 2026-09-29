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
  var step=o.status==='paid'?(o.invitation?4:3):o.status==='proof_sent'?2:1;
  $('#track').innerHTML=['Commande reçue','Virement envoyé','Paiement vérifié','Invitation livrée'].map(function(s,i){return '<li class="'+(i+1<step||(i+1===step&&o.status==='paid'&&step===4)?'done':i+1===step?'now':'')+'">'+s+'</li>'}).join('');
  var needPay=o.status==='awaiting_payment'||o.status==='rejected';
  $('#pay').hidden=!needPay;$('#checking').hidden=o.status!=='proof_sent';$('#paid').hidden=o.status!=='paid';$('#space').hidden=o.status!=='paid';
  if(needPay){
    $('#p-amount').textContent=o.deposit+' DT';$('#p-of').textContent='(acompte sur '+o.price+' DT, le reste à la livraison de votre invitation)';$('#p-ref').textContent=o.code;
    var rej=o.history.filter(function(h){return h.status==='rejected'}).pop();$('#p-rejected').hidden=o.status!=='rejected';if(rej)$('#p-rejected').textContent='Nous n\'avons pas trouvé ce virement : '+(rej.note||'')+'. Vérifiez et renvoyez un justificatif.';
    var b=o.bank||{},rows=[['Banque',b.name],['Titulaire',b.holder],['RIB',b.rib],['IBAN',b.iban],['Motif',o.code]].filter(function(r){return r[1]});
    $('#bank').innerHTML=b.rib?rows.map(function(r,i){return '<dt>'+r[0]+'</dt><dd>'+esc(r[1])+'</dd><button class="btn ghost sm" type="button" data-cp="'+i+'">Copier</button>'}).join(''):'<dt>RIB</dt><dd>Nous vous envoyons notre RIB sur WhatsApp.</dd><span></span>';
    document.querySelectorAll('[data-cp]').forEach(function(x){x.onclick=function(){copy(rows[+x.dataset.cp][1])}});
  }
  if(o.status==='proof_sent'){$('#c-proofs').textContent=o.proofs.length+' justificatif(s) envoyé(s), le dernier le '+new Date(o.proofs[o.proofs.length-1].at).toLocaleString('fr-FR',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'})+'.'}
  if(o.status==='paid'){
    $('#paid-txt').textContent='Nous avons bien reçu '+o.paid+' DT. Votre espace client est ouvert : vous y trouverez votre invitation et les réponses de vos invités en direct.';
    var inv=o.invitation;$('#inv-none').hidden=!!inv;$('#inv-box').hidden=!inv;
    if(inv){var link=location.origin+inv.url;$('#inv-link').textContent=link;$('#inv-open').href=link;$('#inv-copy').onclick=function(){copy(link)};
      var r=o.rsvps||{total:0,coming:0,declined:0,items:[]};$('#t-total').textContent=r.total;$('#t-coming').textContent=r.coming;$('#t-declined').textContent=r.declined;
      $('#csv').href=API+'/rsvps.csv'+Q;
      $('#rows').innerHTML=r.items.length?r.items.map(function(x){return '<tr><td>'+esc(x.name)+'</td><td>'+(x.attending?'Présent':'Absent')+'</td><td class="num">'+(x.attending?x.guests:0)+'</td><td>'+esc(x.dietary)+'</td><td>'+esc(x.message)+'</td></tr>'}).join(''):'<tr><td colspan="5" class="empty">Pas encore de réponse.</td></tr>';
      var gl=inv.guests||[];$('#glist').hidden=!gl.length;
      $('#glinks').innerHTML=gl.map(function(g,i){return '<li><span>'+esc(g.name)+' · '+(g.seats||1)+' pl.</span><button class="btn sm" type="button" data-gl="'+i+'">Copier le lien</button></li>'}).join('');
      document.querySelectorAll('[data-gl]').forEach(function(x){x.onclick=function(){copy(location.origin+gl[+x.dataset.gl].link)}});
    }
  }
  clearInterval(poll);if(o.status==='proof_sent'||o.status==='paid')poll=setInterval(load,o.status==='paid'?60000:30000);
}

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
load();
})();
