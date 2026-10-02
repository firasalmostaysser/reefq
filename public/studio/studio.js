(function(){
'use strict';
var ORIGIN=location.origin;
/* ---------- API ---------- */
function api(path,opts){opts=opts||{};var o={method:opts.method||'GET',headers:{},credentials:'same-origin'};
  if(opts.body!==undefined){if(opts.raw){o.body=opts.body;o.headers['content-type']=opts.type}else{o.body=JSON.stringify(opts.body);o.headers['content-type']='application/json'}}
  return fetch(path,o).catch(function(){var e=new Error("Can't reach the server. Check your connection and try again.");e.status=0;throw e}).then(function(r){return r.json().catch(function(){return{}}).then(function(j){if(r.status===401&&path!=='/api/login'){showLogin()}if(!r.ok){var e=new Error(j.error||plainStatus(r.status));e.status=r.status;throw e}return j})})}
function plainStatus(s){return s===401?'Your session ended. Sign in again.':s===404?'That item was not found. Refresh and try again.':s===413?'That is too large to save.':s===429?'Too many tries. Wait a minute and try again.':s>=500?'The server had a problem. Try again in a moment.':'Something went wrong. Try again.'}
function download(name,text,type){var b=new Blob([text],{type:type||'text/csv;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500)}
var THEME_INFO=ReefqInvite.THEME_LIST;
var DRESS=['#f4efe6','#e9d8c4','#d9b8b0','#c9a45f','#9fb3c8','#a9b89a','#6e1f2c','#1d4f91','#3b2a20','#1b1b1b'];
var EV_TYPES=[['henna','Henna night'],['outia','Outia'],['contract','Marriage contract'],['ceremony','Wedding ceremony'],['dinner','Wedding dinner'],['brunch','Farewell brunch'],['custom','Other (type label)']];
var SAMPLE={id:null,sample:true,theme:'reefq',eventType:'wedding',lang:'fr',
  a:{name:'Yasmine',ar:'ياسمين'},b:{name:'Karim',ar:'كريم'},
  date:'2027-06-12',time:'20:30',venue:'Dar El Marsa',city:'La Marsa, Tunis',maps:'',dress:'Tenue de soirée, tons clairs',note:'',
  events:[{type:'henna',date:'2027-06-10',time:'19:00',place:'Maison familiale, Sousse'},{type:'contract',date:'2027-06-11',time:'17:00',place:'Municipalité de La Marsa'},{type:'dinner',date:'2027-06-12',time:'20:30',place:'Dar El Marsa, La Marsa'}],
  message:{fr:'',ar:'',en:''},rsvpBy:'2027-05-20',maxGuests:2,whatsapp:'',rsvpEndpoint:'',designSource:'theme'};
var BLANK={id:null,theme:'reefq',eventType:'wedding',lang:'fr',a:{name:'',ar:''},b:{name:'',ar:''},date:'',time:'20:00',venue:'',city:'',maps:'',dress:'',note:'',events:[{type:'henna',date:'',time:'',place:''},{type:'dinner',date:'',time:'',place:''}],message:{fr:'',ar:'',en:''},rsvpBy:'',maxGuests:2,whatsapp:'',rsvpEndpoint:'',designSource:'theme'};

var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
function clone(o){return JSON.parse(JSON.stringify(o))}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function getK(o,k){return k.split('.').reduce(function(a,p){return a==null?a:a[p]},o)}
function setK(o,k,v){var p=k.split('.'),x=o;for(var i=0;i<p.length-1;i++){if(x[p[i]]==null||typeof x[p[i]]!=='object')x[p[i]]={};x=x[p[i]]}x[p[p.length-1]]=v}
function slug(s){return String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40)||'couple'}
function toast(m,bad){var t=document.createElement('div');t.className='toast'+(bad?' bad':'');t.setAttribute('role',bad?'alert':'status');t.textContent=m;document.body.appendChild(t);setTimeout(function(){t.remove()},bad?4200:2400)}
function fail(e){toast(e&&e.message||'Something went wrong. Try again.',true)}
function copy(text,btn){
  var done=function(){toast('Copied')};
  try{navigator.clipboard.writeText(text).then(done,function(){sel(btn)})}catch(e){sel(btn)}
}
function sel(btn){var el=btn&&btn.parentElement&&btn.parentElement.querySelector('code,.msgbox')||$('#msgbox');var r=document.createRange();r.selectNodeContents(el);var s=getSelection();s.removeAllRanges();s.addRange(r);toast('Selected. Press Ctrl+C to copy')}

var ME=null,invites=[],rsvps=[],leads=[],opened={};
var draft=clone(SAMPLE),dirty=false,handle=null,pvOpen=false,tab='list',msgLang='fr';

/* ---------- preview ---------- */
var pvTimer=null,pvSize='';
/* Size the phone from the height really available, so the whole screen and its buttons are always in view (no crop, no scroll). */
function fitPv(){
  var col=$('.previewcol'),ph=$('.phone'),box=$('#phonebox'),tools=$('.pv-tools'),cs=getComputedStyle(col);
  if($('#p-design').hidden||cs.display==='none')return false;
  var sheet=document.body.classList.contains('pv-sheet'),gap=parseFloat(cs.rowGap)||10,toolsH=tools.offsetHeight+gap,availH,availW;
  if(sheet){availH=col.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom)-toolsH;availW=col.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight)}
  else{availH=innerHeight-($('#p-design').getBoundingClientRect().top+scrollY+8)-toolsH-12;availW=col.clientWidth}
  /* the invitation lays out at a real phone width (up to 360px); when the height is short the whole phone is scaled down, never cropped */
  var W=Math.floor(Math.min(360,availW)),H=W*2,k=Math.min(1,Math.max(0.3,availH/H)),key=W+'x'+Math.round(k*100);
  ph.style.width=W+'px';ph.style.height=H+'px';ph.style.transform=k<1?'scale('+k+')':'';
  box.style.width=Math.round(W*k)+'px';box.style.height=Math.round(H*k)+'px';
  var changed=key!==pvSize;pvSize=key;return changed;
}
var fitTimer=null;
function refit(){clearTimeout(fitTimer);fitTimer=setTimeout(function(){if(fitPv())preview(true)},120)}
addEventListener('resize',refit);addEventListener('orientationchange',refit);addEventListener('load',refit);
/* the header and the invitation bar change height when the logo loads or the chips wrap; the phone follows */
if(window.ResizeObserver){var pvRo=new ResizeObserver(refit);pvRo.observe($('.top'));pvRo.observe($('.bar'))}
/* an edit made while the invitation is open in the preview redraws it open at the same place, so the change stays in view */
var pvTop=0;function keepOpen(){if(handle&&handle.isOpen()){pvOpen=true;var s=handle.scroller();pvTop=s?s.scrollTop:0}}
function preview(now){clearTimeout(pvTimer);pvTimer=setTimeout(function(){
  fitPv();
  if(handle)handle.destroy();handle=null;
  var sc=$('#screen');sc.innerHTML='';
  if(isCustom()){
    var ready=draft.id&&draft.canvaStatus==='published'&&draft.canvaVer;
    sc.innerHTML=ready?'<iframe title="Live preview" src="/i/'+encodeURIComponent(draft.id)+'?preview=1&v='+encodeURIComponent(draft.canvaVer)+'" style="border:0;width:100%;height:100%;display:block;background:#fff"></iframe>':'<p class="hint" style="padding:40px 24px;text-align:center">The design shows here once the site is marked published.</p>';
    return;
  }
  var el=document.createElement('div');sc.appendChild(el);
  handle=ReefqInvite.render(el,draft,{preview:true,badge:draft.sample?'Example couple':'Preview',startOpen:pvOpen,onRsvp:function(){return new Promise(function(r){setTimeout(function(){r({})},500)})}});
  if(pvOpen&&pvTop){var s2=handle.scroller();if(s2)s2.scrollTop=pvTop}pvTop=0;
},now?0:220)}

/* ---------- form ---------- */
function fillForm(){
  $$('[data-k]').forEach(function(el){var v=getK(draft,el.dataset.k);el.value=v==null?'':v;if(el.tagName==='SELECT'&&el.selectedIndex<0)el.selectedIndex=0});
  renderThemes();renderDress();renderEvents();renderEnv();renderShows();renderCanva();renderWording();renderSource();renderHosts();
}
/* who invites (parents or families) and the closing line; the grammar is done by the engine (hostsLines / hostsMsg) */
function renderHosts(){var h=draft.hosts||{},fam=h.mode==='families',on=h.mode==='parents'||fam;
  $('#k-hmothers').checked=h.mothers!==false;$('#k-hmothers-wrap').hidden=h.mode!=='parents';
  ['#k-hg-fr','#k-hg-ar','#k-hb-fr','#k-hb-ar'].forEach(function(id){$(id).closest('label').hidden=!on});
  $('#k-hg-l').textContent=fam?'Groom\'s family':'Groom\'s father (full name)';$('#k-hb-l').textContent=fam?'Bride\'s family':'Bride\'s father (full name)';
  var c=draft.closing||{},cur=!(c.ar||c.fr||c.en)?'none':(RW.CLOSINGS.filter(function(x){return x.text&&(c.ar?x.text.ar===c.ar:x.text.fr===c.fr)})[0]||{id:'custom'}).id;
  $('#k-close').innerHTML=RW.CLOSINGS.map(function(x){return '<option value="'+x.id+'"'+(x.id===cur?' selected':'')+'>'+esc(x.text?'⁧'+x.text.ar+'⁩ · '+x.text.fr:'None')+'</option>'}).join('')+(cur==='custom'?'<option value="custom" selected>Current custom line</option>':'')}
$('#k-hmothers').onchange=function(){draft.hosts=draft.hosts||{};draft.hosts.mothers=this.checked;touch();keepOpen();preview()};
$('#k-hmode').addEventListener('change',function(){renderHosts()});
$('#k-close').onchange=function(){if(this.value!=='custom')draft.closing=RW.closing(this.value);touch();keepOpen();preview()};
function renderThemes(){
  $('#themes').innerHTML=THEME_INFO.map(function(t){return '<button type="button" class="theme" data-theme-id="'+t.id+'" aria-pressed="'+(draft.theme===t.id)+'"><span class="sw" style="background:'+t.bg+';color:'+t.fg+'">Y &amp; K</span><span class="tn">'+t.name+'<small>'+t.sub+'</small></span></button>'}).join('');
  $$('[data-theme-id]').forEach(function(b){b.onclick=function(){draft.theme=b.dataset.themeId;touch();renderThemes();preview(true)}});
}
function renderDress(){
  var cur=draft.dressColors||[];
  $('#dcols').innerHTML=DRESS.map(function(c){return '<button type="button" class="sw" data-dc="'+c+'" aria-label="'+c+'" aria-pressed="'+(cur.indexOf(c)>=0)+'" style="background:'+c+'"></button>'}).join('');
  $$('[data-dc]').forEach(function(b){b.onclick=function(){var c=b.dataset.dc,a=(draft.dressColors||[]).slice(),i=a.indexOf(c);if(i>=0)a.splice(i,1);else if(a.length<6)a.push(c);draft.dressColors=a;touch();renderDress();pvOpen=true;preview()}});
}
function renderEvents(){
  var box=$('#events');
  box.innerHTML=(draft.events||[]).map(function(e,i){
    return '<div class="ev" data-i="'+i+'"><label class="f"><span>Celebration</span><select id="ev-type-'+i+'" data-e="type">'+EV_TYPES.map(function(t){return '<option value="'+t[0]+'"'+(e.type===t[0]?' selected':'')+'>'+t[1]+'</option>'}).join('')+'</select></label>'+
    (e.type==='custom'?'<label class="f"><span>Label</span><input id="ev-label-'+i+'" data-e="label" value="'+esc(e.label)+'"></label>':'')+
    '<label class="f"><span>Date</span><input type="date" id="ev-date-'+i+'" data-e="date" value="'+esc(e.date)+'"></label>'+
    '<label class="f"><span>Time</span><input type="time" id="ev-time-'+i+'" data-e="time" value="'+esc(e.time)+'"></label>'+
    '<label class="f place"><span>Place</span><input id="ev-place-'+i+'" data-e="place" value="'+esc(e.place)+'"></label>'+
    '<button class="btn sm ghost" type="button" data-rm="'+i+'" aria-label="Remove celebration">Remove</button></div>'}).join('')||'<p class="hint" style="margin:0">No celebrations listed. The main day still shows.</p>';
  $$('.ev',box).forEach(function(row){
    var i=+row.dataset.i;
    $$('[data-e]',row).forEach(function(el){el.oninput=el.onchange=function(){draft.events[i][el.dataset.e]=el.value;touch();if(el.dataset.e==='type')renderEvents();keepOpen();preview()}});
  });
  $$('[data-rm]',box).forEach(function(b){b.onclick=function(){draft.events.splice(+b.dataset.rm,1);touch();renderEvents();preview()}});
}
/* Auto-save: a saved invitation is saved by itself 2 s after the last change (and when leaving the tab or the page).
   A new couple is saved once both names are in. Until then the typed draft is kept in this browser and offered back after a reload. */
var autoT=null,BACKUP='rq-studio-draft';
function touch(){dirty=true;status(draft.id?'Unsaved changes':'Not saved yet','');backupDraft();clearTimeout(autoT);autoT=setTimeout(autoSave,2000)}
function autoSave(){clearTimeout(autoT);if(!dirty||draft.sample||!(draft.a&&draft.a.name&&draft.b&&draft.b.name))return Promise.resolve(!dirty);return doSave(true)}
function backupDraft(){try{if(dirty&&!draft.sample)localStorage.setItem(BACKUP,JSON.stringify({at:Date.now(),draft:draft}));else localStorage.removeItem(BACKUP)}catch(e){}}
/* before opening another couple or a new one: save what can be saved, ask before dropping what cannot */
function leaveDraft(){if(!dirty||draft.sample)return Promise.resolve(true);
  return autoSave().then(function(ok){if(ok&&!dirty)return true;
    return ask({title:'Leave unsaved changes?',body:'<p>'+esc(draft.id?names(draft):'The new invitation')+' has changes that could not be saved'+(draft.id?'':' (add both names to save it)')+'.</p>',ok:'Discard them',danger:true,cancel:'Stay'}).then(function(go){if(go){dirty=false;backupDraft()}return go})})}
addEventListener('beforeunload',function(e){if(dirty&&!draft.sample){autoSave();e.preventDefault();e.returnValue=''}});
document.addEventListener('visibilitychange',function(){if(document.hidden&&dirty)autoSave()});
function status(t,c){var s=$('#status');s.textContent=t;s.className='status'+(c?' '+c:'')}

$$('[data-k]').forEach(function(el){el.addEventListener('input',function(){var v=el.value;if(el.type==='number')v=Math.max(1,parseInt(v,10)||1);setK(draft,el.dataset.k,v);touch();keepOpen();preview()})});
$('#ev-add').onclick=function(){(draft.events=draft.events||[]).push({type:'ceremony',date:draft.date||'',time:'',place:''});touch();renderEvents();preview()};
$('#pv-cover').onclick=function(){pvOpen=false;preview(true)};
$('#pv-open').onclick=function(){pvOpen=true;preview(true)};
var mq=window.matchMedia('(max-width:980px)');
function narrow(){return mq.matches}
function showPv(){if(narrow()){document.body.classList.add('pv-sheet');$('#pv-close').focus()}else{document.body.classList.remove('pv-hidden');try{localStorage.setItem('rq-pv','1')}catch(e){}}preview(true)}
function hidePv(){if(narrow()){document.body.classList.remove('pv-sheet');$('#pv-fab').focus()}else{document.body.classList.add('pv-hidden');try{localStorage.setItem('rq-pv','0')}catch(e){}}}
$('#pv-fab').onclick=showPv;$('#pv-close').onclick=hidePv;
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&document.body.classList.contains('pv-sheet'))hidePv()});
function syncPvLabel(){$('#pv-close').textContent=narrow()?'Back to the form':'Hide preview'}
if(mq.addEventListener)mq.addEventListener('change',function(){document.body.classList.remove('pv-sheet');syncPvLabel();refit()});
syncPvLabel();
try{if(localStorage.getItem('rq-pv')==='0')document.body.classList.add('pv-hidden')}catch(e){}

/* ---------- Canva templates ---------- */
var CANVA=[];
function renderCanva(){var sel=$('#k-canva'),cur=draft.canva&&draft.canva.id||'';
  sel.innerHTML='<option value="">None: use the Reefq card</option>'+CANVA.map(function(m){return '<option value="'+esc(m.id)+'">'+esc((m.theme?m.theme+' · ':'')+m.title)+'</option>'}).join('')+(cur&&!CANVA.some(function(m){return m.id===cur})?'<option value="'+esc(cur)+'">'+esc(draft.canva.title||cur)+'</option>':'');
  sel.value=cur;
  $('#canva-note').textContent=CANVA.length?CANVA.length+' templates from Canva. New designs appear within 15 minutes.':'No Canva templates yet. Connect Canva in the Settings tab.';}
$('#k-canva').onchange=function(){var id=this.value,m=CANVA.filter(function(x){return x.id===id})[0];draft.canva=m?{id:m.id,title:m.title,image:m.image,video:m.video||null}:(id&&draft.canva?draft.canva:null);touch();pvOpen=true;preview(true)};
/* ---------- design source: Reefq theme or custom design (Canva site served from our copy) ---------- */
function isCustom(){return draft.designSource==='canva'}
function personalOnly(){return typeof draft.personalOnly==='boolean'?draft.personalOnly:isCustom()}
function renderSource(){
  var c=isCustom();
  $$('[data-src]').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.src===(c?'canva':'theme'))});
  $('#src-canva').hidden=!c;$$('[data-theme-only]').forEach(function(el){el.hidden=c});
  $('#pv-cover').hidden=$('#pv-open').hidden=c;
  $('#k-personal').checked=personalOnly();
  if(!c)return;
  var saved=invites.find(function(x){return x.id===draft.id}),url=(draft.canvaUrl||'').trim(),same=saved&&saved.canvaUrl===url;
  var pub=same&&draft.canvaStatus==='published';
  $('#c-state').textContent=!url?'Waiting for the designer: paste the published address when it is ready.':
    !same?'Address changed. Mark published to save it and copy the site.':
    pub?'Published · copy saved '+new Date(draft.canvaPublishedAt).toLocaleString('fr-TN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})+'. Guests see it at the invitation link.':'Waiting for the designer. Mark published once the site is live.';
  $('#c-state').className='status'+(pub?' ok':'');
  $('#c-pub').textContent=pub?'Refresh copy':'Mark published';$('#c-pub').disabled=!url;
  $('#c-open').hidden=!url;if(url)$('#c-open').href=url;
  var ct=$('#c-tpl');ct.hidden=!draft.siteTemplate;if(draft.siteTemplate)ct.innerHTML='The couple chose the template <a target="_blank" rel="noopener" href="/modeles/'+esc(draft.siteTemplate)+'">'+esc(draft.siteTemplate)+' ↗</a>. The designer duplicates it in Canva and personalises it.';
}
$$('[data-src]').forEach(function(b){b.onclick=function(){draft.designSource=b.dataset.src;touch();renderSource();preview(true)}});
$('#k-curl').addEventListener('input',renderSource);
$('#k-personal').onchange=function(){draft.personalOnly=this.checked;touch()};
$('#c-pub').onclick=function(){
  var b=this;if(b.disabled)return;b.disabled=true;$('#c-state').textContent='Copying the site…';$('#c-state').className='status';
  (dirty||!draft.id?doSave(true):Promise.resolve(true)).then(function(ok){
    if(!ok)return;
    return api('/api/invitations/'+encodeURIComponent(draft.id)+'/site',{method:'POST',body:{}}).then(function(r){
      var inv=r.invitation;['canvaStatus','canvaVer','canvaBase','canvaPublishedAt','updatedAt'].forEach(function(k){draft[k]=inv[k]});
      var i=invites.findIndex(function(x){return x.id===inv.id});if(i>=0)invites[i]=inv;
      if(!dirty)status('Saved','ok');
      toast((r.warnings||[]).length?r.warnings[0]:'Published. Guests now see the design at the invitation link.',!!(r.warnings||[]).length);
      preview(true);
    });
  }).catch(fail).then(function(){b.disabled=false;renderSource()});
};
function loadCanva(){fetch('/templates.json').then(function(r){return r.ok?r.json():{items:[]}}).then(function(c){CANVA=(c.items||[]).filter(function(m){return m.image});renderCanva()}).catch(function(){renderCanva()})}

/* ---------- envelope options ---------- */
function envDef(){return (ReefqInvite.ENV_DEFAULTS[draft.theme]||ReefqInvite.ENV_DEFAULTS.reefq)}
function envGet(k){return (draft.env&&draft.env[k])||envDef()[k]}
function envSet(k,v){draft.env=draft.env||{};draft.env[k]=v;touch();renderEnv();pvOpen=false;preview()}
function renderEnv(){
  var sw=function(id,list,key){$(id).innerHTML=list.map(function(p){return '<button type="button" class="sw" data-ek="'+key+'" data-ev="'+p[0]+'" title="'+esc(p[1])+'" aria-label="'+esc(p[1])+'" aria-pressed="'+(envGet(key).toLowerCase()===p[0].toLowerCase())+'" style="background:'+p[0]+'"></button>'}).join('')};
  sw('#sw-paper',ReefqInvite.PAPERS,'paper');sw('#sw-seal',ReefqInvite.SEALS,'seal');
  $('#sw-liner').innerHTML=ReefqInvite.LINERS.map(function(l){return '<button type="button" class="sw pat" data-ek="liner" data-ev="'+l[0]+'" aria-pressed="'+(envGet('liner')===l[0])+'"><i style="background-color:'+envGet('linerBg')+';background-image:'+(l[0]==='plain'?'none':ReefqInvite.linerTile(l[0],envGet('linerBg'),'#d4b26a').replace(/"/g,"'"))+'"></i>'+esc(l[1])+'</button>'}).join('');
  $$('[data-ek]').forEach(function(b){b.onclick=function(){envSet(b.dataset.ek,b.dataset.ev)}});
  $('#env-linerbg').value=envGet('linerBg');$('#env-table').value=envGet('table');$('#env-mono').value=(draft.env&&draft.env.mono)||'';
}
$('#env-linerbg').oninput=function(){draft.env=draft.env||{};draft.env.linerBg=this.value;touch();pvOpen=false;preview()};
$('#env-linerbg').onchange=function(){renderEnv()};
$('#env-table').oninput=function(){draft.env=draft.env||{};draft.env.table=this.value;touch();pvOpen=false;preview()};
$('#env-mono').oninput=function(){draft.env=draft.env||{};draft.env.mono=this.value.trim();touch();pvOpen=false;preview()};
function renderShows(){$$('[data-show]').forEach(function(c){c.checked=!(draft.show&&draft.show[c.dataset.show]===false)})}
$$('[data-show]').forEach(function(c){c.onchange=function(){draft.show=draft.show||{};draft.show[c.dataset.show]=c.checked;touch();pvOpen=true;preview(true)}});

/* ---------- chips / save ---------- */
function names(i){var n=ReefqInvite.namesOf(i,'fr');return (n[0]||'?')+' & '+(n[1]||'?')}
function renderChips(){
  var col={};THEME_INFO.forEach(function(t){col[t.id]=t.fg});
  var html='';
  if(!draft.id)html+='<button class="chip" type="button" aria-pressed="true"><span class="dot" style="background:'+col[draft.theme]+'"></span>'+esc(draft.sample?'Example: '+names(draft):(names(draft)==='? & ?'?'New couple':names(draft)))+'</button>';
  html+=invites.filter(function(i){return!i.archived||i.id===draft.id}).map(function(i){return '<button class="chip" type="button" data-inv="'+esc(i.id)+'" aria-pressed="'+(draft.id===i.id)+'"><span class="dot" style="background:'+(col[i.theme]||'#999')+'"></span>'+esc(names(i))+'</button>'}).join('');
  $('#chips').innerHTML=html||'<span class="status">No saved invitations yet</span>';
  $$('[data-inv]').forEach(function(b){b.onclick=function(){var f=invites.find(function(x){return x.id===b.dataset.inv});if(f&&f.id!==draft.id)leaveDraft().then(function(go){if(go)load(f)})}});
  $('#btn-del').hidden=!draft.id;$('#btn-dup').hidden=!draft.id;
}
function load(inv,keepView){wOcc=null;gEditS=-1;if(!keepView)opened={};draft=clone(inv);delete draft.sample;delete draft.photos;delete draft.musicUrl;delete draft.music;dirty=false;if(!keepView)rsvps=[];status('Saved','ok');fillForm();renderChips();if(!keepView){preview(true);loadRsvps()}else{keepOpen();preview(true)}refreshSide();if(!keepView)fetchLatest()}
/* The couple can edit their invitation from their client space at any time: the studio always works on the latest saved version.
   It is fetched when an invitation is opened and when the studio tab comes back into view; unsaved studio edits are never replaced. */
function fetchLatest(){var id=draft.id;if(!id||draft.sample)return Promise.resolve(null);return api('/api/invitations/'+encodeURIComponent(id)).then(function(inv){replaceInv(inv);
  if(draft.id===id&&!dirty&&inv.updatedAt!==draft.updatedAt){load(inv,true);toast('Updated with the latest changes')}return inv}).catch(function(){return null})}
document.addEventListener('visibilitychange',function(){if(!document.hidden)fetchLatest()});
/* a save refused because someone saved after this copy was opened */
function onStale(){staleBusy=true;return api('/api/invitations/'+encodeURIComponent(draft.id)).then(function(inv){replaceInv(inv);
  return ask({title:'This invitation changed meanwhile',body:'<p>'+esc(names(inv))+' was saved elsewhere after you opened it (often the couple, from their client space). Your changes here are not saved yet.</p><p><b>Load latest</b> shows their version; then make your change again. <b>Keep mine</b> saves your version over theirs.</p>',ok:'Load latest',cancel:'Keep mine'}).then(function(fresh){
    staleBusy=false;if(fresh){load(inv,true);backupDraft();toast('Latest version loaded');return false}draft.updatedAt=inv.updatedAt;return doSave()})}).catch(function(e){staleBusy=false;fail(e);return false})}
$('#btn-new').onclick=function(){leaveDraft().then(function(go){if(go)newCouple()})};
function newCouple(){wOcc=null;draft=clone(BLANK);dirty=true;pvOpen=false;fillForm();renderChips();preview(true);status('Not saved yet','');$('#k-a-name').focus();refreshSide()};
var staleBusy=false;
function doSave(quiet){
  clearTimeout(autoT);if(staleBusy)return Promise.resolve(false);
  if(!(draft.a&&draft.a.name&&draft.b&&draft.b.name)){status('Add both names first','bad');return Promise.resolve(false)}
  var body=clone(draft);delete body.sample;
  var btn=$('#btn-save');if(btn.disabled)return Promise.resolve(false);btn.disabled=true;btn.textContent='Saving…';status('Saving…','');
  var req=draft.id?api('/api/invitations/'+encodeURIComponent(draft.id),{method:'PUT',body:body}):api('/api/invitations',{method:'POST',body:body});
  return req.then(function(saved){var editedSince=JSON.stringify(draft)!==JSON.stringify(body);if(!editedSince){draft=saved;dirty=false;status('Saved','ok')}else{draft.id=saved.id;draft.updatedAt=saved.updatedAt;status('Unsaved changes','')}
    var i=invites.findIndex(function(x){return x.id===saved.id});if(i>=0)invites[i]=saved;else invites.unshift(saved);renderChips();refreshSide();return true})
   .catch(function(e){if(e.status===409){btn.disabled=false;status('Changed elsewhere since you opened it','bad');return onStale()}status(e.status===413?'This invitation is too large to save. Shorten the texts and try again.':e.message||'Could not save. Try again.','bad');return false}).then(function(v){btn.disabled=false;btn.textContent='Save invitation';backupDraft();
     /* changes typed during the save, or a failed save (offline), are tried again */
     if(dirty&&draft.id){clearTimeout(autoT);autoT=setTimeout(autoSave,v===false?10000:2000)}return v});
}
$('#btn-save').onclick=function(){doSave()};
$('#btn-dup').onclick=function(){var c=clone(draft);c.id=null;c.guests=[];delete c.archived;delete c.archivedAt;delete c.orderCode;['canvaUrl','canvaDesignId','canvaStatus','canvaVer','canvaBase','canvaPublishedAt','siteTemplate'].forEach(function(k){delete c[k]});draft=c;dirty=true;fillForm();renderChips();preview(true);status('Copy, not saved yet. Change the names and save.','');refreshSide()};
$('#btn-del').onclick=function(){if(draft.id)confirmDelete(draft)};

/* ---------- dialog (confirmations, quick preview) ---------- */
/* ask({title,body,ok,danger,typeToConfirm}) → Promise<boolean>. body is trusted HTML built here. */
function ask(o){return new Promise(function(res){
  var d=$('#dlg'),ok=$('#dlg-ok'),inp=$('#dlg-type');
  $('#dlg-title').textContent=o.title;$('#dlg-body').innerHTML=o.body||'';
  ok.textContent=o.ok||'OK';ok.className='btn '+(o.danger?'danger':'primary');
  $('#dlg-cancel').textContent=o.cancel||'Cancel';$('#dlg-typewrap').hidden=!o.typeToConfirm;inp.value='';$('#dlg-typelabel').textContent=o.typeToConfirm?'Type “'+o.typeToConfirm+'” to confirm':'';
  var norm=function(s){return String(s).trim().replace(/\s+/g,' ').toLowerCase()};
  var check=function(){ok.disabled=!!o.typeToConfirm&&norm(inp.value)!==norm(o.typeToConfirm)};inp.oninput=check;check();
  var done=function(v){d.onclose=null;if(d.open)d.close();res(v)};
  ok.onclick=function(){if(!ok.disabled)done(true)};$('#dlg-cancel').onclick=function(){done(false)};d.onclose=function(){res(false)};
  d.showModal();(o.typeToConfirm?inp:$('#dlg-cancel')).focus();
})}

/* ---------- wording from ready-made texts ---------- */
var RW=window.ReefqWording,wOcc=null;
function wEvent(){return wOcc||(RW.TEXTS[draft.eventType]?draft.eventType:'wedding')}
function renderWording(){
  var opt=function(list,cur){return list.map(function(x){return '<option value="'+x.id+'"'+(x.id===cur?' selected':'')+'>'+esc(x.label.fr)+'</option>'}).join('')};
  $('#w-occ').innerHTML=opt(RW.EVENTS,wEvent());
  if(!$('#w-tone').options.length)$('#w-tone').innerHTML=opt(RW.TONES,'classic');
  $('#w-open').innerHTML=opt(RW.OPENINGS,draft.opening||'none');
  renderSugg();
}
function renderSugg(){var t=RW.get(wEvent(),$('#w-tone').value),op=RW.OPENINGS.filter(function(x){return x.id===(draft.opening||'none')})[0];
  $('#w-sugg').innerHTML=(op&&op.text?'<p class="w-open" dir="rtl" lang="ar">'+esc(op.text.ar)+'</p>':'')+'<p>'+esc(t.fr)+'</p><p dir="rtl" lang="ar">'+esc(t.ar)+'</p><p>'+esc(t.en)+'</p>'}
$('#w-occ').onchange=function(){wOcc=this.value;renderSugg()};
$('#w-tone').onchange=renderSugg;
$('#w-open').onchange=function(){draft.opening=this.value;touch();renderSugg();pvOpen=true;preview()};
$('#k-type').addEventListener('change',function(){if(!wOcc)renderWording()});
$('#w-use').onclick=function(){
  var t=RW.get(wEvent(),$('#w-tone').value),m=draft.message||{};
  var typed=['fr','ar','en'].some(function(l){return m[l]&&m[l].trim()&&m[l].trim()!==t[l]});
  (typed?ask({title:'Replace the current wording?',body:'<p>The French, Arabic and English texts already have wording. It will be replaced by the ready-made text.</p>',ok:'Replace'}):Promise.resolve(true)).then(function(go){
    if(!go)return;
    draft.message={fr:t.fr,ar:t.ar,en:t.en};$('#k-msg-fr').value=t.fr;$('#k-msg-ar').value=t.ar;$('#k-msg-en').value=t.en;touch();pvOpen=true;preview(true);toast('Wording added. Edit it freely.');
  });
};

/* ---------- tabs ---------- */
var PANELS=['list','design','guests','deliver','orders','settings'];
function showTab(t){if(t!==tab)scrollTo(0,0);if(t==='orders'&&tab!=='orders')seenPrev=seenAt();if(tab==='design'&&t!=='design'&&dirty)autoSave();tab=t;try{history.replaceState(null,'','#'+t)}catch(e){}$$('[data-tab]').forEach(function(x){x.setAttribute('aria-selected',x.dataset.tab===t)});PANELS.forEach(function(k){$('#p-'+k).hidden=k!==t});$('#bar').hidden=t==='list';$('#pv-fab').hidden=t!=='design';document.body.classList.remove('pv-sheet');refreshSide();if(t==='design')refit()}
$$('[data-tab]').forEach(function(b){b.onclick=function(){showTab(b.dataset.tab)}});

function refreshSide(){if(tab==='list'){renderList();if(lState==='ok')api('/api/invitations').then(function(r){invites=r.items;renderChips();renderList();loadCounts()}).catch(function(){})}if(tab==='guests'){renderGuests();renderGuestList();loadOpens()}if(tab==='deliver')renderDeliver();if(tab==='orders')loadLeads();if(tab==='settings'){renderSettings();loadSiteTpls()}}

/* ---------- invitations list ---------- */
var lFilter='active',lState='loading',rCount={},cBusy=0;
function themeOf(id){return THEME_INFO.filter(function(t){return t.id===id})[0]||THEME_INFO[0]}
/* Live: the couple or guests may already have the link (linked to a paid order, a guest link sent, or a reply received). */
function invStatus(i){if(i.archived)return['Archived','arch'];var c=rCount[i.id];if(i.orderCode||(c&&c.n)||(i.guests||[]).some(function(g){return g.sent}))return['Live','good'];return['Draft','wait']}
function fold(s){return String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase()}
function fmtD(d){var t=new Date(d+'T12:00');return isNaN(t)?d:t.toLocaleDateString('fr-TN',{day:'numeric',month:'short',year:'numeric'})}
function rcText(c){return c?c.n+(c.n===1?' reply':' replies')+(c.n?' · '+c.coming+' coming':''):'Counting replies…'}
/* reply counts, refreshed each time the list is shown, four invitations at a time; each card is patched in place so focus is never lost */
function loadCounts(){
  if(cBusy)return;
  var q=invites.map(function(i){return i.id});
  var run=function(){var id=q.shift();if(!id){cBusy--;return}
    api('/api/invitations/'+encodeURIComponent(id)+'/rsvps').then(function(r){var yes=r.items.filter(function(x){return x.attending});rCount[id]={n:r.items.length,coming:yes.reduce(function(s,x){return s+(+x.guests||1)},0)};patchCard(id)}).catch(function(){}).then(run)};
  for(var k=0;k<4;k++){cBusy++;run()}
}
function patchCard(id){var el=$('[data-card="'+id+'"]'),i=invites.find(function(x){return x.id===id});if(!el||!i)return;
  $('[data-rc]',el).textContent=rcText(rCount[id]);var st=invStatus(i),p=$('[data-st]',el);p.textContent=st[0];p.className='pill '+st[1]}
function cardHtml(i){
  var t=themeOf(i.theme),st=invStatus(i),n=names(i),id=esc(i.id);
  return '<article class="icard'+(draft.id===i.id?' cur':'')+'" data-card="'+id+'">'+
    '<div class="ic-sw" style="background:'+t.bg+';color:'+t.fg+'" aria-hidden="true"><span>'+esc(ReefqInvite.namesOf(i,'fr')[0]||'?')+' <i>&amp;</i> '+esc(ReefqInvite.namesOf(i,'fr')[1]||'?')+'</span></div>'+
    '<div class="ic-body"><div class="ic-top"><h3>'+esc(n)+'</h3><span class="pill '+st[1]+'" data-st>'+st[0]+'</span></div>'+
    '<p class="ic-meta">'+(i.date?esc(fmtD(i.date)):'No date yet')+(i.city?' · '+esc(i.city):'')+'</p>'+
    '<p class="ic-meta"><span class="ic-dot" style="background:'+t.fg+'"></span>'+esc(t.name)+' · <span data-rc>'+rcText(rCount[i.id])+'</span></p>'+
    '<div class="ic-act"><button class="btn sm primary" type="button" data-la="edit">Edit</button><button class="btn sm" type="button" data-la="preview">Preview</button><a class="btn sm" href="/i/'+id+'" target="_blank" rel="noopener" aria-label="Open the live page of '+esc(n)+' in a new tab">Open ↗</a></div>'+
    '<div class="ic-act ic-more"><button class="btn sm ghost" type="button" data-la="dup">Duplicate</button><button class="btn sm ghost" type="button" data-la="arch">'+(i.archived?'Unarchive':'Archive')+'</button><button class="btn sm ghost ic-del" type="button" data-la="del">Delete</button></div>'+
    '</div></article>';
}
function renderList(){
  var qRaw=$('#l-q').value.trim(),q=fold(qRaw),sort=$('#l-sort').value;
  var act=invites.filter(function(i){return!i.archived}),arc=invites.filter(function(i){return i.archived});
  $('#l-filters').innerHTML=[['active','Active',act.length],['archived','Archived',arc.length]].map(function(f){return '<button class="chip" type="button" data-lf="'+f[0]+'" aria-pressed="'+(lFilter===f[0])+'">'+f[1]+' · '+f[2]+'</button>'}).join('');
  $$('[data-lf]').forEach(function(b){b.onclick=function(){lFilter=b.dataset.lf;renderList()}});
  var box=$('#l-cards');
  if(lState!=='ok'){box.innerHTML=lState==='loading'?'<p class="empty">Loading invitations…</p>':'<p class="empty">Could not load the invitations. <button class="btn sm" type="button" id="l-retry">Try again</button></p>';var rt=$('#l-retry');if(rt)rt.onclick=loadInvites;return}
  var list=(lFilter==='archived'?arc:act).filter(function(i){return !q||fold([i.a&&i.a.name,i.b&&i.b.name,i.a&&i.a.ar,i.b&&i.b.ar,i.city,i.orderCode].join(' ')).indexOf(q)>=0});
  var dk=function(i){return i.date||''};
  list.sort(sort==='edited'?function(a,b){return(b.updatedAt||0)-(a.updatedAt||0)}:function(a,b){if(!dk(a)!==!dk(b))return dk(a)?-1:1;return sort==='soon'?dk(a).localeCompare(dk(b)):dk(b).localeCompare(dk(a))});
  if(!list.length){box.innerHTML='<p class="empty">'+(q?'No invitation matches “'+esc(qRaw)+'”.':lFilter==='archived'?'No archived invitations. Archive one to hide it here while its link keeps working.':'No invitations yet. Press “+ New couple” to start one.')+'</p>';return}
  box.innerHTML=list.map(cardHtml).join('');
  $$('[data-la]',box).forEach(function(b){b.onclick=function(){var id=b.closest('[data-card]').dataset.card,i=invites.find(function(x){return x.id===id});if(i)listAction(b.dataset.la,i,b)}});
}
function replaceInv(inv){var k=invites.findIndex(function(x){return x.id===inv.id});if(k>=0)invites[k]=inv;else invites.unshift(inv)}
function listAction(a,i,btn){
  if(a==='edit'){(draft.id===i.id?Promise.resolve(true):leaveDraft()).then(function(go){if(go){if(draft.id!==i.id)load(i);showTab('design')}});return}
  if(a==='preview'){quickView(i);return}
  if(a==='del'){confirmDelete(i);return}
  btn.disabled=true;
  if(a==='dup')api('/api/invitations/'+encodeURIComponent(i.id)+'/duplicate',{method:'POST'}).then(function(c){invites.unshift(c);rCount[c.id]={n:0,coming:0};lFilter='active';$('#l-sort').value='edited';renderList();renderChips();toast('Copy created. The guest list is not copied.');var el=$('[data-card="'+c.id+'"]');if(el){el.classList.add('flash');el.scrollIntoView({block:'nearest'})}}).catch(fail).then(function(){btn.disabled=false});
  if(a==='arch'){var on=!i.archived;api('/api/invitations/'+encodeURIComponent(i.id)+'/archive',{method:'POST',body:{archived:on}}).then(function(inv){replaceInv(inv);if(draft.id===inv.id){if(on){draft.archived=true;draft.archivedAt=inv.archivedAt}else{delete draft.archived;delete draft.archivedAt}}renderList();renderChips();toast(on?'Archived. Its link and replies keep working.':'Back in the active list.')}).catch(function(e){btn.disabled=false;fail(e)})}
}
function confirmDelete(inv){
  var n=names(inv),c=rCount[inv.id];
  return ask({title:'Delete this invitation?',danger:true,ok:'Delete for good',typeToConfirm:n,
    body:'<p>This deletes <b>'+esc(n)+'</b> and <b>'+(c&&c.n?'its '+c.n+(c.n===1?' guest reply':' guest replies'):'any guest replies')+'</b>. Guests who open the link will no longer find it'+(inv.orderCode?', and it disappears from the client space of order '+esc(inv.orderCode):'')+'. This cannot be undone.</p><p class="hint">To hide it and keep the link working, archive it instead.</p>'}).then(function(ok){
    if(!ok)return;
    return api('/api/invitations/'+encodeURIComponent(inv.id),{method:'DELETE'}).then(function(){
      toast('Invitation and replies deleted');invites=invites.filter(function(x){return x.id!==inv.id});delete rCount[inv.id];
      if(draft.id===inv.id){draft=clone(SAMPLE);dirty=false;rsvps=[];fillForm();preview(true);status('Example couple. Press "+ New couple" or edit and save.','')}
      renderChips();renderList();refreshSide()}).catch(fail)});
}
/* quick in-studio preview, the same phone as in Design */
var qvHandle=null;
function quickView(i){var d=$('#qv');$('#qv-title').textContent=names(i);$('#qv-open').href='/i/'+encodeURIComponent(i.id);d.showModal();
  var W=Math.floor(Math.min(360,innerWidth-48)),H=W*2,k=Math.min(1,Math.max(.3,(innerHeight-130)/H)),ph=$('#qv-box .phone'),box=$('#qv-box');
  ph.style.width=W+'px';ph.style.height=H+'px';ph.style.transform=k<1?'scale('+k+')':'';box.style.width=Math.round(W*k)+'px';box.style.height=Math.round(H*k)+'px';
  if(qvHandle)qvHandle.destroy();var el=document.createElement('div'),sc=$('#qv-screen');sc.innerHTML='';sc.appendChild(el);
  qvHandle=ReefqInvite.render(el,clone(i),{preview:true,badge:'Preview',onRsvp:function(){return Promise.resolve({})}});
  $('#qv-close').focus();
}
$('#qv-close').onclick=function(){$('#qv').close()};
$('#qv').addEventListener('click',function(e){if(e.target===this)this.close()});
$('#qv').addEventListener('close',function(){if(qvHandle){qvHandle.destroy();qvHandle=null}$('#qv-screen').innerHTML=''});
$('#l-q').oninput=renderList;$('#l-sort').onchange=renderList;
$('#l-new').onclick=function(){leaveDraft().then(function(go){if(go){newCouple();showTab('design');$('#k-a-name').focus()}})};
function loadInvites(){lState='loading';renderList();return api('/api/invitations').then(function(r){invites=r.items;lState='ok';renderChips();renderList();loadCounts()}).catch(function(e){if(e.status!==401){lState='error';renderList()}})}


/* ---------- guests ---------- */
function mine(){return rsvps.filter(function(r){return draft.id&&r.inviteId===draft.id}).sort(function(a,b){return(b.at||0)-(a.at||0)})}
/* opens per guest id ('anon' for the shared link), for the guest list */
function loadOpens(){if(!draft.id){opened={};return}var id=draft.id;api('/api/invitations/'+encodeURIComponent(id)+'/opens').then(function(r){if(draft.id!==id)return;opened={};r.items.forEach(function(o){opened[o.guestId||'anon']=o});if(tab==='guests')renderGuestList()}).catch(function(){})}
function loadRsvps(){loadOpens();if(!draft.id){rsvps=[];return Promise.resolve()}var id=draft.id;return api('/api/invitations/'+encodeURIComponent(id)+'/rsvps').then(function(r){if(draft.id===id){rsvps=r.items;if(tab==='guests'){renderGuests();renderGuestList()}}}).catch(function(){})}
function renderGuests(){
  var list=mine(),yes=list.filter(function(r){return r.attending}),no=list.filter(function(r){return!r.attending});
  var ppl=yes.reduce(function(s,r){return s+(+r.guests||1)},0),diet=list.filter(function(r){return r.dietary}).length;
  $('#tiles').innerHTML=[['Replies',list.length],['People coming',ppl],['Declined',no.length],['Dietary notes',diet]].map(function(t){return '<div class="tile"><b>'+t[1]+'</b><span>'+t[0]+'</span></div>'}).join('');
  var rows=$('#rows');
  if(!draft.id){rows.innerHTML='<tr><td colspan="6" class="empty">Save this invitation to start collecting replies.</td></tr>';return}
  rows.innerHTML=list.length?list.map(function(r){return '<tr><td>'+esc(r.name)+(r.source==='manual'?' <span class="status">(added by hand)</span>':'')+'</td><td><span class="pill '+(r.attending?'yes':'no')+'">'+(r.attending?'Coming':'Not coming')+'</span></td><td class="num">'+(r.attending?(+r.guests||1):0)+'</td><td>'+esc(r.dietary)+'</td><td>'+esc(r.message)+'</td><td>'+(r.at?new Date(r.at).toLocaleDateString('fr-TN',{day:'numeric',month:'short'}):'')+'</td></tr>'}).join(''):'<tr><td colspan="6" class="empty">No replies yet. They appear here as guests answer.</td></tr>';
}
$('#m-add').onclick=function(){
  if(!draft.id){toast('Save the invitation first, then add replies.',true);return}
  var name=$('#m-name').value.trim();if(!name){$('#m-name').focus();return}
  var att=$('#m-att').value==='yes';
  api('/api/invitations/'+encodeURIComponent(draft.id)+'/rsvps',{method:'POST',body:{name:name,attending:att,guests:att?Math.max(1,+$('#m-guests').value||1):0,message:$('#m-note').value.trim()}}).then(function(){$('#m-name').value='';$('#m-note').value='';toast('Reply added');loadRsvps()}).catch(fail);
};
$('#btn-csv').onclick=function(){
  var list=mine();if(!list.length){toast('No replies to download yet');return}
  var q=function(v){v=String(v==null?'':v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
  var csv='﻿Name,Answer,People,Dietary,Message,Received\n'+list.map(function(r){return[r.name,r.attending?'Coming':'Not coming',r.attending?(+r.guests||1):0,r.dietary,r.message,r.at?new Date(r.at).toISOString().slice(0,16).replace('T',' '):''].map(q).join(',')}).join('\n');
  download('rsvps-'+slug(names(draft))+'.csv',csv);
};


/* ---------- guest list & personal invitations ---------- */
/* personal link ids: 10 random characters from the browser's secure generator, so links cannot be guessed */
function gid(){var A='abcdefghijkmnopqrstuvwxyz23456789',b=crypto.getRandomValues(new Uint8Array(10)),s='';for(var i=0;i<b.length;i++)s+=A[b[i]%A.length];return s}
function personalLink(g){return draft.id?ORIGIN+'/i/'+draft.id+'?g='+g.id:''}
/* Arabic counted noun: 2 → مقعدين, 3–10 → مقاعد, 11+ → مقعدًا */
function arSeats(s){return s===2?'مقعدين':s<=10?s+' مقاعد':s+' مقعدًا'}
var EV_AR={wedding:'حفل زفاف',engagement:'حفل خطوبة',henna:'سهرة حنّة',contract:'حفل عقد قران'},EV_FR={wedding:'au mariage',engagement:'aux fiançailles',henna:'à la soirée du henné',contract:'au contrat de mariage'},EV_EN={wedding:'the wedding',engagement:'the engagement',henna:'the henna night',contract:'the marriage contract'};
function personalMsg(g,l){
  var n=ReefqInvite.namesOf(draft,l),d=ReefqInvite.fmtDate(draft.date,l),link=personalLink(g)||'[lien]',s=+g.seats||1,ev=draft.eventType||'wedding';
  if(l==='ar')return 'السلام عليكم '+g.name+'،\nيسعدنا دعوتكم لحضور '+(EV_AR[ev]||EV_AR.wedding)+' '+n[0]+' و'+n[1]+' يوم '+d+'.\n'+(s>1?'حجزنا لكم '+arSeats(s)+'.\n':'')+'افتحوا دعوتكم وأكّدوا حضوركم من هنا:\n'+link;
  if(l==='en')return 'Hello '+g.name+',\nWe would love you to celebrate '+(EV_EN[ev]||EV_EN.wedding)+' of '+n[0]+' & '+n[1]+' on '+d+'.\n'+(s>1?'We have reserved '+s+' seats for you.\n':'')+'Open your invitation and reply here:\n'+link;
  return 'Bonjour '+g.name+',\nNous avons la joie de vous inviter '+(EV_FR[ev]||EV_FR.wedding)+' de '+n[0]+' & '+n[1]+', le '+d+'.\n'+(s>1?s+' places vous sont réservées.\n':'')+'Ouvrez votre invitation et confirmez votre présence ici :\n'+link;
}
function waHref(g,l){var num=String(g.phone||'').replace(/[^0-9]/g,'');if(num.length===8)num='216'+num;return 'https://wa.me/'+num+'?text='+encodeURIComponent(personalMsg(g,l))}
var gEditS=-1;
function renderGuestList(){
  var gl=draft.guests||[],rows=$('#g-rows'),lang=$('#g-lang').value;
  var byG={};mine().forEach(function(r){if(r.guestId&&!byG[r.guestId])byG[r.guestId]=r});
  var seats=gl.reduce(function(a,g){return a+(+g.seats||1)},0),sent=gl.filter(function(g){return g.sent}).length,rep=gl.filter(function(g){return byG[g.id]}).length,op=gl.filter(function(g){return opened[g.id]}).length;
  $('#g-sum').textContent=gl.length?gl.length+' invitations · '+seats+' seats · '+sent+' sent · '+op+' opened · '+rep+' replied':'';
  if(!gl.length){rows.innerHTML='<tr><td colspan="6" class="empty">No guests yet. Paste your list above.</td></tr>';return}
  rows.innerHTML=gl.map(function(g,i){var r=byG[g.id],st=r?(r.attending?'<span class="pill yes">Coming · '+(+r.guests||1)+'</span>':'<span class="pill no">Not coming</span>'):opened[g.id]?'<span class="pill sent" title="Opened '+opened[g.id].count+'×">Opened · '+new Date(opened[g.id].last).toLocaleDateString('fr-TN',{day:'numeric',month:'short'})+'</span>':g.sent?'<span class="pill sent">Sent</span>':'<span class="pill wait">Not sent</span>';
    var ok=!!personalLink(g),ph=String(g.phone||'').replace(/[^0-9]/g,'');
    if(i===gEditS)return '<tr class="gedit"><td><input id="sge-name" aria-label="Guest name" value="'+esc(g.name)+'"></td><td><input id="sge-phone" aria-label="WhatsApp number" inputmode="tel" value="'+esc(g.phone||'')+'"></td><td class="num"><input id="sge-seats" aria-label="Seats" type="number" min="1" max="50" value="'+(+g.seats||1)+'" style="width:64px"></td><td colspan="3"><span class="gst"><button class="btn sm primary" type="button" id="sge-ok">Save guest</button><button class="btn sm ghost" type="button" id="sge-cancel">Cancel</button></span></td></tr>';
    return '<tr><td>'+esc(g.name)+'</td><td>'+esc(g.phone||'')+'</td><td class="num">'+(+g.seats||1)+'</td><td>'+st+'</td><td><span class="gst">'+
      (ok&&ph?'<a class="btn sm primary" target="_blank" rel="noopener" data-send="'+i+'" href="'+esc(waHref(g,lang))+'">WhatsApp</a>':'')+(ok?'<button class="btn sm" type="button" data-copyg="'+i+'">Copy link</button>':'<span class="status">Save first</span>')+'</span></td><td><span class="gst"><button class="btn sm ghost" type="button" data-edg="'+i+'" aria-label="Edit '+esc(g.name)+'">Edit</button><button class="btn sm ghost" type="button" data-rmg="'+i+'" aria-label="Remove guest">✕</button></span></td></tr>'}).join('');
  /* a guest is corrected in place and keeps their personal link */
  $$('[data-edg]').forEach(function(b){b.onclick=function(){gEditS=+b.dataset.edg;renderGuestList();$('#sge-name').focus()}});
  if(gEditS>=0&&$('#sge-ok')){
    var done=function(){var nm=$('#sge-name').value.trim();if(!nm){$('#sge-name').focus();return}var g=draft.guests[gEditS];
      g.name=nm;g.phone=$('#sge-phone').value.trim();g.seats=Math.min(50,Math.max(1,parseInt($('#sge-seats').value,10)||1));gEditS=-1;touch();renderGuestList();if(draft.id)doSave(true)};
    $('#sge-ok').onclick=done;$('#sge-cancel').onclick=function(){gEditS=-1;renderGuestList()};
    $('#g-rows .gedit').onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();done()}else if(e.key==='Escape'){gEditS=-1;renderGuestList()}};
  }
  $$('[data-send]').forEach(function(a){a.addEventListener('click',function(){var g=draft.guests[+a.dataset.send];if(!g.sent){g.sent=Date.now();touch();doSave(true)}})});
  $$('[data-copyg]').forEach(function(b){b.onclick=function(){var g=draft.guests[+b.dataset.copyg];copy(personalMsg(g,$('#g-lang').value),b)}});
  $$('[data-rmg]').forEach(function(b){b.onclick=function(){draft.guests.splice(+b.dataset.rmg,1);gEditS=-1;touch();renderGuestList();if(draft.id)doSave(true)}});
}
$('#g-lang').onchange=renderGuestList;
$('#g-add').onclick=function(){
  var lines=$('#g-paste').value.split(/\n+/).map(function(l){return l.trim()}).filter(Boolean);if(!lines.length){$('#g-paste').focus();return}
  draft.guests=draft.guests||[];
  lines.forEach(function(l){var p=l.split(/[,;\t]/).map(function(x){return x.trim()});var seats=parseInt(p[2],10);draft.guests.push({id:gid(),name:p[0],phone:p[1]||'',seats:seats>0?seats:1})});
  $('#g-paste').value='';touch();renderGuestList();
  if(draft.id)doSave(true);else toast('Guests added. Save the invitation to get their links.');
};
$('#g-csv').onclick=function(){
  var gl=draft.guests||[];if(!gl.length){toast('No guests yet');return}
  var byG={};mine().forEach(function(r){if(r.guestId&&!byG[r.guestId])byG[r.guestId]=r});
  var q=function(v){v=String(v==null?'':v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
  var csv='\ufeffName,WhatsApp,Seats,Status,People coming,Personal link\n'+gl.map(function(g){var r=byG[g.id];return[g.name,g.phone,g.seats||1,r?(r.attending?'Coming':'Not coming'):opened[g.id]?'Opened':g.sent?'Sent':'Not sent',r&&r.attending?(+r.guests||1):'',personalLink(g)].map(q).join(',')}).join('\n');
  download('guests-'+slug(names(draft))+'.csv',csv);
};

/* ---------- deliver ---------- */
function guestLink(){return draft.id?ORIGIN+'/i/'+draft.id:''}
function shareMsg(l){
  var n=ReefqInvite.namesOf(draft,l),d=ReefqInvite.fmtDate(draft.date,l),link=guestLink()||'[lien de l\'invitation]',ev=draft.eventType||'wedding';
  if(l==='ar')return 'السلام عليكم،\nيسعدنا دعوتكم لحضور '+(EV_AR[ev]||EV_AR.wedding)+' '+n[0]+' و'+n[1]+' يوم '+d+'.\nافتحوا الدعوة وأكّدوا حضوركم من هنا:\n'+link;
  if(l==='en')return 'Hello,\nWe would love you to celebrate '+(EV_EN[ev]||EV_EN.wedding)+' of '+n[0]+' & '+n[1]+' on '+d+'.\nOpen your invitation and reply here:\n'+link;
  return 'Bonjour,\nNous avons la joie de vous inviter '+(EV_FR[ev]||EV_FR.wedding)+' de '+n[0]+' & '+n[1]+', le '+d+'.\nOuvrez votre invitation et confirmez votre présence ici :\n'+link;
}
function renderDeliver(){
  $('#msg-langs').innerHTML=[['fr','Français'],['ar','العربية'],['en','English']].map(function(x){return '<button class="chip" type="button" data-ml="'+x[0]+'" aria-pressed="'+(msgLang===x[0])+'">'+x[1]+'</button>'}).join('');
  $$('[data-ml]').forEach(function(b){b.onclick=function(){msgLang=b.dataset.ml;renderDeliver()}});
  var mb=$('#msgbox');mb.textContent=shareMsg(msgLang);mb.dir=msgLang==='ar'?'rtl':'ltr';
  var gl=guestLink();
  $('#glink').textContent=gl||'Save the invitation to get its link';$('#glink-open').hidden=!gl;if(gl)$('#glink-open').href=gl;
  $('#glink-hint').textContent='Anyone can open this link on their phone. For a personal link per family, use the guest list.';
  var q=$('#qr');q.innerHTML=gl?qrSvg(gl,qrInk(draft)):'<p class="hint">Save the invitation to get its QR code.</p>';q.classList.toggle('none',!gl);$('#qr-png').disabled=$('#qr-svg').disabled=!gl;
  renderGuestQr();
}
$('#btn-copymsg').onclick=function(){copy($('#msgbox').textContent,this)};
$('#btn-copylink').onclick=function(){var g=guestLink();if(g)copy(g,this);else toast('No link yet')};
/* ---------- QR codes (vendor/qrcode.js) ---------- */
function qrOf(text){var q=qrcode(0,'M');q.addData(text);q.make();return q}
function lum(hex){var n=parseInt(String(hex).slice(1),16),c=[n>>16&255,n>>8&255,n&255].map(function(v){v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*c[0]+.7152*c[1]+.0722*c[2]}
/* codes stay dark on white so every phone scans them: the theme ink when it is dark enough, else the theme background (dark themes), else near-black */
function qrInk(inv){var t=themeOf(inv.theme),ok=function(c){return /^#[0-9a-f]{6}$/i.test(c)&&1.05/(lum(c)+.05)>=4.5};return ok(t.fg)?t.fg:ok(t.bg)?t.bg:'#1b1b1b'}
function qrPath(q,cell,x0,y0){var n=q.getModuleCount(),d='';for(var r=0;r<n;r++)for(var c=0;c<n;c++)if(q.isDark(r,c))d+='M'+(x0+c*cell)+' '+(y0+r*cell)+'h'+cell+'v'+cell+'h-'+cell+'z';return d}
/* SVG with a 4-module white margin; with cap, the couple names (and sub, the guest name) sit under the code */
function qrSvg(text,ink,cap,sub){
  var q=qrOf(text),n=q.getModuleCount(),cell=10,m=4*cell,W=n*cell+2*m,capH=cap?(sub?110:70):0,H=W+capH;
  var txt=cap?'<text x="'+W/2+'" y="'+(W+22)+'" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-weight="600" font-size="34" fill="'+ink+'">'+esc(cap)+'</text>'+(sub?'<text x="'+W/2+'" y="'+(W+70)+'" text-anchor="middle" font-family="Figtree, Arial, sans-serif" font-size="22" fill="#555">'+esc(sub)+'</text>':''):'';
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" shape-rendering="crispEdges"><rect width="'+W+'" height="'+H+'" fill="#fff"/><path fill="'+ink+'" d="'+qrPath(q,cell,m,m)+'"/>'+txt+'</svg>';
}
/* 1024 px square PNG: white margin, the code, the couple names under it (and the guest name) */
function qrPng(text,ink,cap,sub,file){
  var fonts=document.fonts?Promise.all([document.fonts.load("600 64px 'Cormorant Garamond'"),document.fonts.load("40px Figtree")]).catch(function(){}):Promise.resolve();
  return fonts.then(function(){
    var S=1024,textH=sub?124:64,q=qrOf(text),n=q.getModuleCount(),cell=Math.floor((S-60-textH)/(n+8)),size=cell*n,x0=Math.round((S-size)/2),y0=Math.round((S-cell*(n+8)-textH)/2)+cell*4;
    var cv=document.createElement('canvas');cv.width=cv.height=S;var g=cv.getContext('2d');
    g.fillStyle='#fff';g.fillRect(0,0,S,S);g.fillStyle=ink;
    for(var r=0;r<n;r++)for(var c=0;c<n;c++)if(q.isDark(r,c))g.fillRect(x0+c*cell,y0+r*cell,cell,cell);
    var fit=function(t,px,fam,w){do{g.font=w+' '+px+'px '+fam;px-=2}while(g.measureText(t).width>S-120&&px>20)};
    g.textAlign='center';g.textBaseline='alphabetic';var ty=y0+size+cell*4+44;
    fit(cap,64,"'Cormorant Garamond', Amiri, Georgia, serif",'600');g.fillText(cap,S/2,ty);
    if(sub){g.fillStyle='#555';fit(sub,40,"Figtree, Amiri, Arial, sans-serif",'500');g.fillText(sub,S/2,ty+64)}
    return new Promise(function(res){cv.toBlob(function(b){download(file,b,'image/png');res()},'image/png')});
  });
}
function qrFile(base,ext){return 'qr-'+slug(base)+'.'+ext}
function inviteQr(kind){var link=guestLink();if(!link){toast('Save the invitation first');return}
  var ink=qrInk(draft),n=names(draft);
  if(kind==='svg')download(qrFile(n,'svg'),qrSvg(link,ink,n),'image/svg+xml');else qrPng(link,ink,n,'',qrFile(n,'png'))}
function guestQr(i,kind){var g=(draft.guests||[])[i],link=g&&personalLink(g);if(!link)return;
  var ink=qrInk(draft),n=names(draft);
  if(kind==='svg')download(qrFile(g.name,'svg'),qrSvg(link,ink,n,g.name),'image/svg+xml');else qrPng(link,ink,n,g.name,qrFile(g.name,'png'))}
$('#qr-png').onclick=function(){inviteQr('png')};$('#qr-svg').onclick=function(){inviteQr('svg')};
function renderGuestQr(){
  var gl=draft.guests||[],box=$('#gq-list'),ink=qrInk(draft);
  $('#gq-print').disabled=!draft.id||!gl.length;
  $('#gq-hint').textContent=!draft.id?'Save the invitation to get the guest codes.':gl.length?'One code per family, opening their personal invitation. Cards print 8 per A4 page.':'Add guests in Guests & RSVPs to get one code per family.';
  box.innerHTML=draft.id?gl.map(function(g,i){return '<li><span class="gq-code">'+qrSvg(personalLink(g),ink)+'</span><span class="gq-name">'+esc(g.name)+'<small>'+(+g.seats||1)+(+g.seats>1?' seats':' seat')+'</small></span><span class="gq-btns"><button class="btn sm" type="button" data-gq="'+i+'" data-k="png" aria-label="Download PNG for '+esc(g.name)+'">PNG</button><button class="btn sm" type="button" data-gq="'+i+'" data-k="svg" aria-label="Download SVG for '+esc(g.name)+'">SVG</button></span></li>'}).join(''):'';
  $$('[data-gq]',box).forEach(function(b){b.onclick=function(){guestQr(+b.dataset.gq,b.dataset.k)}});
}
/* printable A4 sheet, 8 cards per page (2 × 4, 105 × 74 mm), in the invitation's colours */
var SCAN={fr:'Scannez pour ouvrir votre invitation',ar:'امسحوا الرمز لفتح دعوتكم',en:'Scan to open your invitation'};
$('#gq-print').onclick=function(){
  var gl=draft.guests||[];if(!draft.id||!gl.length)return;
  var w=window.open('','_blank');if(!w){toast('Allow pop-ups for this site to open the print page.',true);return}
  var t=themeOf(draft.theme),ink=qrInk(draft),n=names(draft),l=draft.lang||'fr',pages=[];
  for(var p=0;p<gl.length;p+=8)pages.push('<section class="page">'+gl.slice(p,p+8).map(function(g){return '<div class="c"><div class="in"><p class="g">'+esc(g.name)+'</p><div class="q">'+qrSvg(personalLink(g),ink)+'</div><p class="n">'+esc(n)+'</p><p class="s"'+(l==='ar'?' dir="rtl"':'')+'>'+esc(SCAN[l]||SCAN.fr)+'</p></div></div>'}).join('')+'</section>');
  w.document.write('<!doctype html><html lang="'+l+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>QR cards · '+esc(n)+'</title>'+
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Amiri&family=Cormorant+Garamond:wght@600&family=Figtree:wght@500;600&family=Pinyon+Script&display=swap">'+
    '<style>@page{size:A4;margin:0}*{box-sizing:border-box}html,body{margin:0}body{background:#e9ecec;font-family:Figtree,Arial,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}'+
    '.bar{position:sticky;top:0;display:flex;gap:12px;align-items:center;flex-wrap:wrap;padding:12px 16px;background:#fff;border-bottom:1px solid #d2dedd;font-size:14px;color:#13292a;z-index:2}.bar b{flex:1;min-width:200px}.bar small{display:block;font-weight:400;color:#546a69}'+
    '.bar button{font:600 14px Figtree,Arial,sans-serif;padding:10px 18px;border-radius:8px;border:0;background:#147d82;color:#fff;cursor:pointer}'+
    '.sheet{zoom:var(--z,1);padding:16px 0}.page{width:210mm;height:297mm;margin:0 auto 16px;background:#fff;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:repeat(4,1fr);box-shadow:0 4px 18px rgb(0 0 0 / .12);overflow:hidden}'+
    '.c{padding:3mm;border:.2mm dashed #c9c9c9;margin:-.1mm}.in{height:100%;background:'+t.bg+';color:'+t.fg+';border-radius:2mm;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.6mm;padding:3mm;text-align:center;outline:.3mm solid color-mix(in srgb,'+t.fg+' 35%,transparent);outline-offset:-1.6mm}'+
    '.g{margin:0;font:600 12pt/1.15 "Cormorant Garamond",Amiri,Georgia,serif;max-width:90%;overflow-wrap:anywhere}.q{background:#fff;padding:1.5mm;border-radius:1.5mm;width:36mm;height:36mm}.q svg{display:block;width:100%;height:100%}'+
    '.n{margin:0;font:17pt/1.1 "Pinyon Script",cursive}.s{margin:0;font:500 7pt/1.2 Figtree,Arial,sans-serif;letter-spacing:.04em;opacity:.8}.s[dir=rtl]{font:9pt Amiri,serif;letter-spacing:0}'+
    '@media print{body{background:#fff}.bar{display:none}.sheet{zoom:1;padding:0}.page{margin:0;box-shadow:none;break-after:page}.page:last-child{break-after:auto}}</style></head><body>'+
    '<div class="bar"><b>'+gl.length+' QR cards · '+pages.length+(pages.length>1?' A4 pages':' A4 page')+'<small>Print at 100% scale with margins set to None, then cut along the dotted lines.</small></b><button type="button" id="p">Print</button></div>'+
    '<div class="sheet">'+pages.join('')+'</div></body></html>');
  w.document.close();
  var fit=function(){w.document.documentElement.style.setProperty('--z',Math.min(1,(w.innerWidth-16)/794).toFixed(3))};fit();w.addEventListener('resize',fit);
  w.document.getElementById('p').onclick=function(){w.print()};
};
/* ---------- orders & RIB payments ---------- */
var orders=[],oFilter='verify',oSel=null,proofUrl=null,oState='loading',oBusy=false,oSeq=0;
var OST={awaiting_payment:['Awaiting transfer','info'],proof_sent:['Proof to verify','warn'],paid:['Paid · client','good'],rejected:['Proof rejected','bad'],cancelled:['Cancelled','bad'],brief:['Invitation prepared by the couple','info']};
var OFILTERS=[['verify','To verify'],['awaiting','Awaiting'],['paid','Paid'],['all','All']];
function loadLeads(){var seq=++oSeq;if(!orders.length){oState='loading';renderOrders()}
  var first=oState!=='ok';
  return api('/api/orders').then(function(r){if(seq!==oSeq)return;if(oState==='ok')announce(orders,r.items);orders=r.items;
    /* the studio opens where the work is: on Orders when receipts are waiting (unless a section was asked for in the address) */
    if(first&&tab==='list'&&!location.hash&&orders.some(function(o){return o.status==='proof_sent'}))showTab('orders');oState='ok';renderOrders();if(oSel){var o=orders.find(function(x){return x.code===oSel});if(o)openOrder(o.code,true)}}).catch(function(e){if(seq!==oSeq)return;if(!orders.length){oState='error';renderOrders()}else if(tab==='orders')fail(e)})}
/* what changed since the last refresh, said once while the studio is open (Telegram tells the phone) */
function announce(prev,next){var by={};prev.forEach(function(o){by[o.code]=o});var out=[];
  next.forEach(function(o){var p=by[o.code];
    if(!p)out.push('New order '+o.code+' · '+o.names+' ('+o.plan+')');
    else if(o.status==='proof_sent'&&p.status!=='proof_sent')out.push('Receipt to verify · '+o.names);
    else if(o.briefAt&&!p.briefAt)out.push(o.names+' prepared their invitation');});
  if(out.length)toast(out.length>2?out.length+' updates in Orders: '+out[0]+'…':out.join(' · '))}
/* "new" = arrived since the Orders tab was last opened (kept in this browser) */
var SEEN='rq-orders-seen',seenPrev=0;
function seenAt(){try{return +localStorage.getItem(SEEN)||0}catch(e){return 0}}
function markSeen(){try{localStorage.setItem(SEEN,String(Date.now()))}catch(e){}}
function isNew(o,since){return (o.createdAt||0)>since&&o.status!=='cancelled'}
function oMatch(o){return oFilter==='all'||(oFilter==='verify'&&o.status==='proof_sent')||(oFilter==='awaiting'&&(o.status==='awaiting_payment'||o.status==='rejected'))||(oFilter==='paid'&&o.status==='paid')}
function receiptAt(o){for(var i=(o.history||[]).length-1;i>=0;i--)if(o.history[i].status==='proof_sent')return o.history[i].at;return o.createdAt||0}
function oSort(a,b){return oFilter==='verify'?receiptAt(b)-receiptAt(a):(b.createdAt||0)-(a.createdAt||0)}
function dshort(t){return new Date(t).toLocaleDateString('fr-TN',{day:'numeric',month:'short'})}
function tshort(t){return new Date(t).toLocaleString('fr-TN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',hour12:false})}
function renderOrders(){
  var onTab=tab==='orders'&&!document.hidden;if(onTab&&oState==='ok')markSeen();
  var n=orders.filter(function(o){return o.status==='proof_sent'}).length,since=seenAt(),nw=orders.filter(function(o){return o.status!=='proof_sent'&&isNew(o,since)}).length,bd=$('#o-badge');
  bd.hidden=!(n+nw);bd.textContent=n+nw;bd.setAttribute('aria-label',[n?n+' receipts to verify':'',nw?nw+' new orders':''].filter(Boolean).join(', '));
  document.title=(n+nw?'('+(n+nw)+') ':'')+'Reefq Studio';
  var vb=$('#o-verify');vb.className='verify'+(oState==='ok'?(n?' todo':' done'):'');
  vb.innerHTML=oState==='loading'?'<span class="status">Loading orders…</span>':oState==='error'?'':n?'<b>'+n+'</b><span>'+(n===1?'receipt to verify':'receipts to verify')+'</span>'+(oFilter!=='verify'?'<button class="btn sm" type="button" id="o-showverify">Show '+(n===1?'it':'them')+'</button>':'<small>Newest first. Check the bank account, then confirm.</small>'):'<span>No receipts waiting. You are up to date.</span>';
  var sv=$('#o-showverify');if(sv)sv.onclick=function(){oFilter='verify';renderOrders()};
  $('#o-filters').innerHTML=OFILTERS.map(function(f){var c=orders.filter(function(o){var k=oFilter;oFilter=f[0];var r=oMatch(o);oFilter=k;return r}).length;return '<button class="chip" type="button" data-of="'+f[0]+'" aria-pressed="'+(oFilter===f[0])+'">'+f[1]+' · '+c+'</button>'}).join('');
  $$('[data-of]').forEach(function(b){b.onclick=function(){oFilter=b.dataset.of;renderOrders()}});
  var list=orders.filter(oMatch).sort(oSort);
  $('#o-rows').innerHTML=oState==='loading'?'<tr><td colspan="7" class="empty">Loading orders…</td></tr>':oState==='error'?'<tr><td colspan="7" class="empty">Could not load the orders. Check your connection. <button class="btn sm" type="button" id="o-retry">Try again</button></td></tr>':list.length?list.map(function(o){var st=OST[o.status]||[o.status,''];return '<tr class="'+(oSel===o.code?'sel':'')+'"><td>'+dshort(o.createdAt)+(o.status==='proof_sent'?'<br><span class="status">Receipt '+esc(tshort(receiptAt(o)))+'</span>':'')+'</td><td><b>'+esc(o.code)+'</b>'+(isNew(o,seenPrev)?' <span class="pill info">New</span>':'')+'</td><td>'+esc(o.names)+'<br><span class="status">'+esc([o.date,o.city].filter(Boolean).join(' · '))+'</span></td><td>'+esc(o.plan)+'</td><td class="num">'+o.deposit+' DT</td><td><span class="pill '+st[1]+'">'+st[0]+'</span></td><td><button class="btn sm" type="button" data-od="'+esc(o.code)+'">Review</button></td></tr>'}).join(''):'<tr><td colspan="7" class="empty">'+(oFilter==='verify'?'No receipts to verify right now.':oFilter==='all'?'No orders yet. Orders from the website appear here.':'Nothing in this list.')+'</td></tr>';
  var rt=$('#o-retry');if(rt)rt.onclick=loadLeads;
  $$('[data-od]').forEach(function(b){b.onclick=function(){openOrder(b.dataset.od)}});
}
function clientLink(o){return ORIGIN+'/commande/'+o.code+'?t='+o.token}
function openOrder(code,keep){
  if(noteT&&pendingNote&&code!==oSel)pendingNote(); /* a note still being typed is saved to its own order first */
  var o=orders.find(function(x){return x.code===code});if(!o)return;oSel=code;renderOrders();
  var d=$('#o-detail');d.hidden=false;if(!keep)d.scrollIntoView({behavior:'smooth',block:'start'});
  var st=OST[o.status]||[o.status,''];$('#od-title').textContent=o.code+' · '+o.names;$('#od-status').textContent=st[0];$('#od-status').className='pill '+st[1];
  var wa=String(o.phone||'').replace(/[^0-9]/g,'');if(wa.length===8)wa='216'+wa;
  var info=[['WhatsApp',o.phone],['Date',o.date],['City',o.city],['Guests',o.guests],['Offer',o.plan+' · '+o.price+' DT'],[o.deposit<o.price?'Deposit':'To pay',o.deposit+' DT'],['Invitation',o.briefAt?'Prepared by the couple '+tshort(o.briefAt):'Not prepared yet'],['Source',o.source?Object.values(o.source).join(' / '):''],['Referred by',o.referrer?o.referrer+' (-10 %)':''],['Received',o.paid?o.paid+' DT':'—'],['Theme',o.theme],[o.site?'Website template':'Canva model',o.site?(o.model||o.site)+' · /modeles/'+o.site:o.model],['Message',o.note],['Language',o.lang]].filter(function(r){return r[1]});
  $('#od-info').innerHTML=info.map(function(r){return '<dt>'+r[0]+'</dt><dd>'+esc(r[1])+'</dd>'}).join('')+'<dt>History</dt><dd>'+o.history.map(function(h){return esc(new Date(h.at).toLocaleString('fr-TN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})+' · '+(OST[h.status]||[h.status])[0]+(h.note?' · '+h.note:''))}).join('<br>')+'</dd>';
  /* the list refreshes every minute: what is being typed in this order stays */
  if(!keep||odTyped!==code){$('#od-note').value=o.adminNote||'';$('#od-amount').value=o.paid||o.deposit;$('#od-reason').value='';odTyped=null}
  var closed=o.status==='paid'||o.status==='cancelled';$('#od-confirm').hidden=o.status==='paid'||o.status==='cancelled';$('#od-reject').hidden=closed;$('#od-cancel').hidden=o.status==='cancelled';$('#od-reopen').hidden=!closed;
  $('#od-invite').textContent=o.inviteId?'Open the invitation in Design':'Create invitation from this order';
  var msg='Bonjour '+(o.names||'')+',\n'+(o.status==='paid'?'Votre paiement est confirmé, merci ! Votre espace client Reefq :\n':'Voici votre espace client Reefq pour la commande '+o.code+'. Vous pouvez y préparer votre invitation et voir l\'aperçu, puis régler '+o.deposit+' DT par virement :\n')+clientLink(o);
  var w=$('#od-wa');w.hidden=!wa;w.href='https://wa.me/'+wa+'?text='+encodeURIComponent(msg);
  $('#od-proofs').innerHTML=o.proofs.length>1?o.proofs.map(function(p,i){return '<button class="chip" type="button" data-pi="'+i+'" aria-pressed="'+(i===o.proofs.length-1)+'">Proof '+(i+1)+'</button>'}).join(''):'';
  $$('[data-pi]').forEach(function(b){b.onclick=function(){$$('[data-pi]').forEach(function(x){x.setAttribute('aria-pressed',x===b)});showProof(o,+b.dataset.pi)}});
  if(!keep)showProof(o,o.proofs.length-1);
}
function showProof(o,i){var box=$('#od-proof');if(i<0){box.innerHTML='<p class="hint">No proof uploaded yet.</p>';return}
  box.innerHTML='<p class="hint">Loading the receipt…</p>';
  fetch('/api/orders/'+o.code+'/proof?i='+i,{credentials:'same-origin'}).then(function(r){if(!r.ok)throw 0;return r.blob()}).then(function(b){if(proofUrl)URL.revokeObjectURL(proofUrl);proofUrl=URL.createObjectURL(b);
    box.innerHTML=/pdf/.test(b.type)?'<a class="btn" target="_blank" rel="noopener" href="'+proofUrl+'">Open PDF receipt</a>':'<a href="'+proofUrl+'" target="_blank" rel="noopener"><img alt="Transfer receipt" src="'+proofUrl+'"></a>'}).catch(function(){box.innerHTML='<p class="hint">Could not load the receipt. Press Refresh and try again.</p>'})}
var OBTN=['#od-confirm','#od-reject','#od-cancel','#od-reopen'],OLABEL={};
function oLock(on,action){OBTN.forEach(function(id){var b=$(id);if(!(id in OLABEL))OLABEL[id]=b.textContent;b.disabled=on;b.setAttribute('aria-busy',on&&id==='#od-'+action?'true':'false')});
  if(on&&action==='confirm')$('#od-confirm').textContent='Confirming…';else $('#od-confirm').textContent=OLABEL['#od-confirm']}
function oAction(action,extra){if(!oSel||oBusy)return;var code=oSel,cur=orders.find(function(x){return x.code===code});
  if(action==='confirm'&&cur&&cur.status==='paid'){toast('This payment is already confirmed.');return}
  oBusy=true;oSeq++;oLock(true,action);var b=Object.assign({action:action},extra||{});
  return api('/api/orders/'+code+'/status',{method:'POST',body:b}).then(function(o){var i=orders.findIndex(function(x){return x.code===o.code});orders[i]=o;oSeq++;if(oSel===o.code)openOrder(o.code,true);renderOrders();toast(action==='confirm'?'Payment confirmed. Client space is open.':action==='reject'?'Marked as not valid. The client can send a new receipt.':action==='cancel'?'Order cancelled.':'Order reopened.')}).catch(fail).then(function(){oBusy=false;oLock(false)})}
$('#od-confirm').onclick=function(){var v=+$('#od-amount').value;if(!(v>0)){toast('Enter the amount you received.',true);$('#od-amount').focus();return}oAction('confirm',{amountReceived:v})};
$('#od-reject').onclick=function(){oAction('reject',{note:$('#od-reason').value.trim()})};
$('#od-cancel').onclick=function(){oAction('cancel',{note:$('#od-reason').value.trim()})};
$('#od-reopen').onclick=function(){oAction('reopen')};
$('#od-close').onclick=function(){oSel=null;$('#o-detail').hidden=true;renderOrders()};
var odTyped=null,noteT=null;
['#od-note','#od-amount','#od-reason'].forEach(function(id){$(id).addEventListener('input',function(){odTyped=oSel})});
/* the internal note saves itself 1.5 s after typing stops */
function saveNote(quiet,code,v){clearTimeout(noteT);noteT=null;var b=$('#od-note-save');code=code||oSel;if(v==null)v=$('#od-note').value;if(!code)return;b.disabled=true;b.textContent='Saving…';
  api('/api/orders/'+code,{method:'PATCH',body:{adminNote:v}}).then(function(o){var i=orders.findIndex(function(x){return x.code===o.code});orders[i]=o;b.textContent='Note saved ✓';if(!quiet)toast('Note saved')}).catch(function(e){b.textContent='Save note';fail(e)}).then(function(){b.disabled=false})}
$('#od-note').addEventListener('input',function(){$('#od-note-save').textContent='Save note';clearTimeout(noteT);var c=oSel,v=this.value;noteT=setTimeout(function(){saveNote(true,c,v)},1500);pendingNote=function(){saveNote(true,c,v)}});
var pendingNote=null;
$('#od-note-save').onclick=function(){if(!this.disabled)saveNote()};
$('#od-copy').onclick=function(){var o=orders.find(function(x){return x.code===oSel});if(o)copy(clientLink(o),this)};
$('#od-invite').onclick=function(){var o=orders.find(function(x){return x.code===oSel});if(!o)return;
  var go=function(inv){if(draft.id===inv.id){$('#tab-design').click();return}leaveDraft().then(function(ok){if(!ok)return;var i=invites.findIndex(function(x){return x.id===inv.id});if(i<0)invites.unshift(inv);load(inv);$('#tab-design').click();toast('Invitation opened in Design')})};
  if(o.inviteId){api('/api/invitations/'+o.inviteId).then(go).catch(fail);return}
  api('/api/orders/'+o.code+'/invitation',{method:'POST'}).then(function(r){var i=orders.findIndex(function(x){return x.code===r.order.code});orders[i]=r.order;go(r.invitation)}).catch(fail)};
$('#od-delete').onclick=function(){var o=orders.find(function(x){return x.code===oSel});if(!o)return;
  ask({title:'Delete order '+o.code+'?',body:'<p>For test orders and spam. The order and its receipts are deleted for good'+(o.inviteId?'; its invitation stays in Invitations':'')+'.</p>'+(o.status==='paid'?'<p><b>This order is paid.</b></p>':''),ok:'Delete',danger:true,typeToConfirm:o.status==='paid'?o.code:''}).then(function(go){if(!go)return;
    api('/api/orders/'+o.code,{method:'DELETE'}).then(function(){orders=orders.filter(function(x){return x.code!==o.code});oSel=null;$('#o-detail').hidden=true;renderOrders();toast('Order deleted')}).catch(fail)})};
$('#o-refresh').onclick=function(){var b=this;b.disabled=true;b.textContent='Refreshing…';loadLeads().then(function(){b.disabled=false;b.textContent='Refresh'})};
/* ---------- settings ---------- */
function renderSettings(){var cs=ME&&ME.canvaStatus;$('#s-canva').textContent=ME&&ME.canva?(cs&&cs.connected?'Connected to Canva'+(cs.lastRun?' · last sync '+new Date(cs.lastRun).toLocaleString('fr-TN')+(cs.count!=null?' · '+cs.count+' templates':'')+(cs.failed&&cs.failed.length?' · '+cs.failed.length+' could not be read: '+cs.failed.map(function(f){return f.title}).join(', '):'')+(cs.sites?' · '+cs.sites.count+' website templates'+(cs.sites.failed&&cs.sites.failed.length?' ('+cs.sites.failed.length+' could not be read)':''):''):'')+(cs.lastError?' · last error: '+cs.lastError:''):'Canva is configured. Press Connect Canva once.'):'Add CANVA_CLIENT_ID, CANVA_CLIENT_SECRET and CANVA_FOLDER_ID in Netlify environment variables to enable Canva.';$('#s-bank').textContent=ME&&ME.bankReady?'Bank details are set. Clients see them on their payment page.':'Add BANK_NAME, BANK_HOLDER, BANK_RIB and BANK_IBAN in Netlify environment variables so clients see your RIB.';var ig=[
    ['Team alerts on Telegram',ME&&ME.alerts&&ME.alerts.telegram,'New orders and payment receipts arrive on your phone.',['TELEGRAM_BOT_TOKEN','TELEGRAM_CHAT_ID']],
    ['Team alerts by email',ME&&ME.alerts&&ME.alerts.email,'The same alerts arrive by email (Resend).',['RESEND_API_KEY','ALERT_EMAIL']],
    ['PostHog analytics',ME&&ME.posthog,'Visits, orders, invitations opened and replies are counted.',['POSTHOG_KEY']],
    ['Canva templates',ME&&ME.canva,'Designer templates appear on the website and in Design.',['CANVA_CLIENT_ID','CANVA_CLIENT_SECRET','CANVA_FOLDER_ID']]];
  var on=ig.filter(function(x){return x[1]}).length;
  $('#s-integ-sum').textContent=ME?on+' of '+ig.length+' are on.':'';
  $('#s-integ').innerHTML=ig.map(function(x){return '<li><span class="pill '+(x[1]?'ok':'off')+'">'+(x[1]?'On':'Off')+'</span><b>'+x[0]+'</b><small>'+x[2]+(x[1]?'':' To turn it on, set '+x[3].map(function(v){return '<code>'+v+'</code>'}).join(' and ')+' in Netlify → Environment variables.')+'</small></li>'}).join('');
  $('#s-canva-actions').hidden=!(ME&&ME.canva)}
/* ---------- data: backup and the morning summary (Settings) ---------- */
$('#s-backup').onclick=function(){location.href='/api/export'};
$('#s-digest').onclick=function(){var b=this;if(b.disabled)return;b.disabled=true;$('#s-digest-out').hidden=true;
  api('/api/digest?dry=1',{method:'POST'}).then(function(d){var o=$('#s-digest-out');o.textContent=d.text;o.hidden=false;
    var on=d.alerts&&(d.alerts.telegram||d.alerts.email);$('#s-digest-send').hidden=!on;$('#s-digest-hint').textContent=on?'':'Turn on Telegram or email alerts (Integrations below) to receive this every morning at 08:00.'}).catch(fail).then(function(){b.disabled=false})};
$('#s-digest-send').onclick=function(){var b=this;if(b.disabled)return;b.disabled=true;api('/api/digest',{method:'POST'}).then(function(){toast('Summary sent')}).catch(fail).then(function(){b.disabled=false})};
/* ---------- website templates (Settings) ---------- */
var STPL=[];
function loadSiteTpls(){return api('/api/site-templates').then(function(r){STPL=r.items;renderSiteTpls()}).catch(function(){})}
function renderSiteTpls(){
  var box=$('#st-list');
  if(!STPL.length){box.innerHTML='<p class="hint" style="margin:0">No website templates yet. Set CANVA_TEMPLATES_FOLDER_ID and sync, or add one below.</p>';return}
  box.innerHTML=STPL.map(function(t,i){var pub=t.status==='published';
    var pic=t.cover||t.image;
    return '<div class="st-row" data-st="'+i+'">'+(pic?'<img alt="" src="'+esc(pic)+'">':'<span class="st-ph"></span>')+'<div><h3>'+esc(t.name)+' <span class="pill '+(pub&&!t.hidden&&!t.draft?'good':'wait')+'">'+(t.draft?'Draft in Canva':t.hidden?'Hidden':pub?'On the website':'Waiting for the address')+'</span></h3>'+
      '<p class="status" style="margin:2px 0 0">/modeles/'+esc(t.slug)+(t.tags&&t.tags.length?' · '+esc(t.tags.join(', ')):'')+(t.source==='manual'?' · added by hand':'')+'</p>'+
      '<div class="st-url"><input aria-label="Published site address" data-st-url value="'+esc(t.siteUrl||'')+'" placeholder="https://….my.canva.site/…"><button class="btn sm primary" type="button" data-st-pub>'+(pub?'Refresh copy':'Mark published')+'</button>'+
      (pub?'<a class="btn sm" target="_blank" rel="noopener" href="/modeles/'+esc(t.slug)+'">Preview ↗</a>':'')+(t.editUrl?'<a class="btn sm" target="_blank" rel="noopener noreferrer" href="'+esc(t.editUrl)+'">Edit in Canva ↗</a>':'')+
      '<label class="btn sm" style="cursor:pointer">'+(t.cover?'Change picture':'Upload picture')+'<input type="file" accept="image/jpeg,image/png,image/webp" data-st-pic hidden></label>'+
      '<button class="btn sm ghost" type="button" data-st-hide>'+(t.hidden?'Show on website':'Hide')+'</button>'+(t.source==='manual'?'<button class="btn sm ghost" type="button" data-st-del>Delete</button>':'')+'</div></div></div>'}).join('');
  $$('[data-st]',box).forEach(function(row){
    var t=STPL[+row.dataset.st],url=$('[data-st-url]',row);
    $('[data-st-pub]',row).onclick=function(){var b=this;b.disabled=true;
      var u=url.value.trim(),save=u!==(t.siteUrl||'')?api('/api/site-templates/'+encodeURIComponent(t.id),{method:'PATCH',body:{siteUrl:u}}):Promise.resolve(t);
      save.then(function(){return api('/api/site-templates/'+encodeURIComponent(t.id)+'/publish',{method:'POST',body:{}})})
        .then(function(r){toast((r.warnings||[]).length?r.warnings[0]:'Published. The template is on the website.',!!(r.warnings||[]).length);return loadSiteTpls()}).catch(fail).then(function(){b.disabled=false})};
    $('[data-st-pic]',row).onchange=function(){var f=this.files[0];if(!f)return;if(f.size>3e6){toast('Picture too large (3 MB maximum).',true);return}
      api('/api/upload',{method:'POST',raw:true,body:f,type:f.type}).then(function(u){return api('/api/site-templates/'+encodeURIComponent(t.id),{method:'PATCH',body:{cover:u.url}})}).then(function(){toast('Picture saved');return loadSiteTpls()}).catch(fail)};
    $('[data-st-hide]',row).onclick=function(){api('/api/site-templates/'+encodeURIComponent(t.id),{method:'PATCH',body:{hidden:!t.hidden}}).then(loadSiteTpls).catch(fail)};
    var del=$('[data-st-del]',row);if(del)del.onclick=function(){ask({title:'Delete this template?',body:'<p>'+esc(t.name)+' leaves the website. Couples who already chose it keep their order.</p>',ok:'Delete',danger:true}).then(function(go){if(go)api('/api/site-templates/'+encodeURIComponent(t.id),{method:'DELETE'}).then(loadSiteTpls).catch(fail)})};
  });
}
$('#st-add-btn').onclick=function(){var n=$('#st-name').value.trim(),u=$('#st-url').value.trim();if(!n){$('#st-name').focus();return}
  api('/api/site-templates',{method:'POST',body:{name:n,siteUrl:u}}).then(function(){$('#st-name').value='';$('#st-url').value='';toast(u?'Template added. Press Mark published.':'Template added. Paste its address when it is published.');return loadSiteTpls()}).catch(fail)};
$('#s-sync').onclick=function(){var b=this;b.disabled=true;$('#s-sync-status').textContent='Syncing…';api('/api/canva/sync',{method:'POST'}).then(function(r){$('#s-sync-status').textContent=r.note;setTimeout(loadCanva,60000)}).catch(function(e){$('#s-sync-status').textContent=e.message||'Could not sync. Try again.'}).then(function(){b.disabled=false})};
$('#s-logout').onclick=function(){api('/api/logout',{method:'POST'}).then(function(){location.reload()})};

/* ---------- login ---------- */
function showLogin(){$('#login').hidden=false;$('#studio').hidden=true;setTimeout(function(){$('#l-pass').focus()},50)}
$('#l-form').onsubmit=function(e){e.preventDefault();var err=$('#l-err');err.hidden=true;var lb=$('#l-form button[type=submit]');if(lb.disabled)return;lb.disabled=true;lb.textContent='Signing in…';api('/api/login',{method:'POST',body:{password:$('#l-pass').value}}).then(function(){$('#l-pass').value='';$('#login').hidden=true;$('#studio').hidden=false;start()}).catch(function(x){err.textContent=x.message;err.hidden=false;$('#l-pass').select()}).then(function(){lb.disabled=false;lb.textContent='Sign in'})};

/* ---------- boot ---------- */
$$('#brand-logo,#l-logo').forEach(function(i){i.src=ReefqInvite.LOGO});$('#brand-logo-d').src=ReefqInvite.LOGO_DARK;
$('#pv-fab').hidden=true;renderList();fillForm();renderChips();preview(true);status('Example couple. Press "+ New couple" or edit and save.','');
/* changes typed before the page was closed or reloaded and not saved: offered back once */
function restoreDraft(){var b=null;try{b=JSON.parse(localStorage.getItem(BACKUP)||'null')}catch(e){}
  if(!b||!b.draft||!draft.sample)return;
  ask({title:'Restore unsaved changes?',body:'<p>Changes to <b>'+esc(names(b.draft)==='? & ?'?'a new invitation':names(b.draft))+'</b> typed on '+esc(tshort(b.at))+' were not saved.</p>',ok:'Restore',cancel:'Discard'}).then(function(go){
    if(!go){try{localStorage.removeItem(BACKUP)}catch(e){}return}
    load(b.draft.id&&invites.find(function(x){return x.id===b.draft.id})||b.draft,true);draft=clone(b.draft);fillForm();renderChips();preview(true);showTab('design');touch()})}
function start(){
  var h=location.hash.slice(1);if(h==='orders'||h==='settings')showTab(h);
  api('/api/me').then(function(me){ME=me;renderSettings();
    loadLeads();return loadInvites().then(restoreDraft)}).catch(function(){});
  loadCanva();
}
start();
setInterval(function(){if(document.visibilityState==='visible'&&tab==='guests')loadRsvps()},20000);
setInterval(loadCanva,5*60*1000);
setInterval(function(){if(document.visibilityState==='visible'&&ME)loadLeads()},60000);
document.addEventListener('visibilitychange',function(){if(!document.hidden&&ME){if(tab==='orders')seenPrev=seenAt();loadLeads()}});
})();
