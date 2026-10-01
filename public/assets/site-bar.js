/* Reefq bar on custom designs served at /i/<id>?g=<guest id>: greets the guest, records the open, and opens the reply card.
   Any link in the design whose address contains "rsvp" (for example #rsvp) opens the same card. Lives in a shadow root so the
   design's styles and ours never mix. Media in the design is kept silent.
   On website templates (/modeles/<slug>, data-template) the bar names the template and leads to the order form; the RSVP
   button opens a sample reply card. */
(function(){
'use strict';
var me=document.currentScript,iid=me&&me.getAttribute('data-invite'),tpl=me&&me.getAttribute('data-template');
if(!(iid||tpl)||!window.ReefqInvite)return;
var q=new URLSearchParams(location.search),gid=q.get('g')||'',preview=q.get('preview')==='1';

/* silence: no audio element survives, videos play muted */
function hush(n){if(!n||!n.querySelectorAll)return;var list=[].slice.call(n.querySelectorAll('audio,video'));if(n.matches&&n.matches('audio,video'))list.push(n);
  list.forEach(function(m){if(m.tagName==='AUDIO'){try{m.pause()}catch(e){}m.remove()}else{m.muted=true;m.defaultMuted=true;m.setAttribute('muted','')}})}
hush(document.documentElement);
if(window.MutationObserver)new MutationObserver(function(ms){ms.forEach(function(m){[].forEach.call(m.addedNodes,hush)})}).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('play',function(e){var m=e.target;if(m&&m.tagName==='AUDIO'){m.pause();m.remove()}else if(m&&m.tagName==='VIDEO')m.muted=true},true);

var host=document.createElement('div');host.id='reefq-bar';
var root=host.attachShadow?host.attachShadow({mode:'open'}):host;
var CSS=':host{all:initial}'+
 '.bar{position:fixed;left:0;right:0;bottom:0;z-index:2147483646;display:flex;align-items:center;gap:12px;padding:10px 14px calc(10px + env(safe-area-inset-bottom));background:var(--b);color:var(--f);font:500 15px/1.3 Figtree,system-ui,sans-serif;box-shadow:0 -8px 24px -12px rgb(0 0 0/.35)}'+
 '.bar[hidden]{display:none}.bar[dir=rtl]{font-family:Amiri,serif;font-size:17px}'+
 '.hi{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
 '.go{all:unset;cursor:pointer;flex:none;background:var(--f);color:var(--b);padding:11px 16px;border-radius:999px;font:600 13px/1 Figtree,system-ui,sans-serif;letter-spacing:.06em}'+
 '.bar[dir=rtl] .go{font:700 15px/1 Amiri,serif;letter-spacing:0}'+
 '.go:focus-visible,.x:focus-visible{outline:2px solid var(--f);outline-offset:2px}'+
 '.dim{position:fixed;inset:0;z-index:2147483647;background:rgb(0 0 0/.45);display:flex;align-items:flex-end;justify-content:center}'+
 '.dim[hidden]{display:none}'+
 '.panel{position:relative;width:100%;max-width:520px;max-height:92vh;overflow:auto;border-radius:16px 16px 0 0;background:#fff;-webkit-overflow-scrolling:touch}'+
 '.x{all:unset;cursor:pointer;position:absolute;top:10px;inset-inline-end:12px;z-index:2;width:36px;height:36px;display:grid;place-items:center;border-radius:50%;background:rgb(0 0 0/.06);font:20px/1 system-ui;color:#333}';
root.innerHTML='<link rel="stylesheet" href="/assets/invitation.css"><style>'+CSS+'</style>'+
 '<div class="bar" hidden><span class="hi"></span><button class="go" type="button"></button></div>'+
 '<div class="dim" hidden><div class="panel" role="dialog" aria-modal="true"><button class="x" type="button" aria-label="Fermer">✕</button><div class="card"></div></div></div>';
(document.body||document.documentElement).appendChild(host);
var bar=root.querySelector('.bar'),dim=root.querySelector('.dim'),card=root.querySelector('.card'),inv=null,guest=null,handle=null;

function open(){if(!inv)return;dim.hidden=false;
  if(!handle)handle=ReefqInvite.renderRsvp(card,inv,{guest:guest,preview:preview,onRsvp:send});
  var b=root.querySelector('.rq-send,.x');if(b)b.focus()}
function close(){dim.hidden=true}
root.querySelector('.x').onclick=close;
dim.addEventListener('click',function(e){if(e.target===dim)close()});
document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
root.querySelector('.go').onclick=open;
/* the design's own RSVP button */
document.addEventListener('click',function(e){
  var a=e.target&&e.target.closest&&e.target.closest('a[href]');if(!a)return;
  if(/rsvp/i.test(a.getAttribute('href')||'')){e.preventDefault();e.stopPropagation();open()}
},true);
function hash(){if(/^#rsvp$/i.test(location.hash))open()}
addEventListener('hashchange',hash);

function send(r){
  if(preview)return new Promise(function(res){setTimeout(function(){res({})},500)});
  var w=ReefqInvite.waLink(inv,r);
  return fetch('/api/public/invitations/'+encodeURIComponent(iid)+'/rsvp',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(r)})
    .then(function(x){
      if(x.status===422)return x.json().then(function(j){var e=new Error(j.error||'');e.userFacing=true;throw e});
      if(!x.ok)throw 0;
      if(window.rqTrack)window.rqTrack('rsvp_sent',{attending:!!r.attending,seats:r.attending?(+r.guests||1):0,theme:'custom'});return{}})
    .catch(function(e){if(e&&e.userFacing)throw e;if(w)return{whatsapp:w};throw 0});
}

/* bar colours from the invitation's theme: its dark ink as background, else the Reefq teal */
function paint(themeId,L){
  var th=ReefqInvite.THEME_LIST.filter(function(t){return t.id===themeId})[0]||ReefqInvite.THEME_LIST[0];
  var dark=function(c){var v=parseInt(String(c).slice(1),16);return((v>>16&255)*299+(v>>8&255)*587+(v&255)*114)/1000<140};
  bar.style.setProperty('--b',dark(th.fg)?th.fg:'#1f2a2a');bar.style.setProperty('--f',dark(th.fg)?th.bg:'#f6f3ea');
  bar.dir=L==='ar'?'rtl':'ltr';dim.dir=bar.dir;
}

if(tpl){
  var L=q.get('lang');try{L=L||localStorage.getItem('rq-lang')}catch(e){}
  L=L==='ar'||L==='en'?L:'fr';
  var W={fr:['Modèle','Choisir ce modèle','Famille Ben Salah'],ar:['تصميم','اختيار هذا التصميم','عائلة بن صالح'],en:['Design','Choose this design','Ben Salah family']}[L];
  inv={id:'demo',lang:L,theme:'reefq',maxGuests:4,a:{name:'Yasmine'},b:{name:'Karim'}};guest={id:'demo',name:W[2],seats:2};preview=true;
  paint('reefq',L);
  root.querySelector('.hi').textContent=W[0]+' · '+(me.getAttribute('data-name')||'');
  var go=root.querySelector('.go');go.textContent=W[1];
  go.onclick=function(){var u='/?modele='+encodeURIComponent(tpl)+(L!=='fr'?'&lang='+L:'')+'#order';try{window.top.location.href=u}catch(e){location.href=u}};
  bar.hidden=false;hash();
  if(window.rqTrack)window.rqTrack('template_previewed',{template:tpl,lang:L});
  return;
}

fetch('/api/public/invitations/'+encodeURIComponent(iid)+(gid?'?g='+encodeURIComponent(gid):''))
  .then(function(r){if(!r.ok)throw 0;return r.json()})
  .then(function(d){
    inv=d.invitation;guest=d.guest;
    var L=inv.lang==='ar'||inv.lang==='en'?inv.lang:'fr',T=ReefqInvite.T[L],n=ReefqInvite.namesOf(inv,L);
    paint(inv.theme,L);
    root.querySelector('.hi').textContent=guest&&guest.name?T.dear+' '+guest.name:(n[0]&&n[1]?n[0]+(L==='ar'?' و':' & ')+n[1]:'');
    root.querySelector('.go').textContent=T.confirm;
    bar.hidden=false;hash();
    if(!preview){
      fetch('/api/public/invitations/'+encodeURIComponent(iid)+'/open',{method:'POST',keepalive:true,headers:{'content-type':'application/json'},body:JSON.stringify({guestId:gid})}).catch(function(){});
      if(window.rqTrack)window.rqTrack('invitation_opened',{theme:'custom',personal:!!guest,lang:L});
    }
  }).catch(function(){});
})();
