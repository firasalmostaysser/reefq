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
  message:{fr:'',ar:'',en:''},rsvpBy:'2027-05-20',maxGuests:2,whatsapp:'',rsvpEndpoint:''};
var BLANK={id:null,theme:'reefq',eventType:'wedding',lang:'fr',a:{name:'',ar:''},b:{name:'',ar:''},date:'',time:'20:00',venue:'',city:'',maps:'',dress:'',note:'',events:[{type:'henna',date:'',time:'',place:''},{type:'dinner',date:'',time:'',place:''}],message:{fr:'',ar:'',en:''},rsvpBy:'',maxGuests:2,whatsapp:'',rsvpEndpoint:''};

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

var ME=null,invites=[],rsvps=[],leads=[];
var draft=clone(SAMPLE),dirty=false,handle=null,pvOpen=false,tab='design',msgLang='fr',delArm=0;

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
function preview(now){clearTimeout(pvTimer);pvTimer=setTimeout(function(){
  fitPv();
  if(handle)handle.destroy();
  var el=document.createElement('div');var sc=$('#screen');sc.innerHTML='';sc.appendChild(el);
  handle=ReefqInvite.render(el,draft,{preview:true,badge:draft.sample?'Example couple':'Preview',startOpen:pvOpen,onRsvp:function(){return new Promise(function(r){setTimeout(function(){r({})},500)})}});
},now?0:220)}

/* ---------- form ---------- */
function fillForm(){
  $$('[data-k]').forEach(function(el){var v=getK(draft,el.dataset.k);el.value=v==null?'':v;if(el.tagName==='SELECT'&&el.selectedIndex<0)el.selectedIndex=0});
  renderThemes();renderDress();renderEvents();renderEnv();renderShows();renderCanva();renderWording();
}
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
    $$('[data-e]',row).forEach(function(el){el.oninput=el.onchange=function(){draft.events[i][el.dataset.e]=el.value;touch();if(el.dataset.e==='type')renderEvents();preview()}});
  });
  $$('[data-rm]',box).forEach(function(b){b.onclick=function(){draft.events.splice(+b.dataset.rm,1);touch();renderEvents();preview()}});
}
function touch(){dirty=true;status(draft.id?'Unsaved changes':'Not saved yet','')}
function status(t,c){var s=$('#status');s.textContent=t;s.className='status'+(c?' '+c:'')}

$$('[data-k]').forEach(function(el){el.addEventListener('input',function(){var v=el.value;if(el.type==='number')v=Math.max(1,parseInt(v,10)||1);setK(draft,el.dataset.k,v);touch();preview()})});
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
function names(i){return ((i.a&&i.a.name)||'?')+' & '+((i.b&&i.b.name)||'?')}
function renderChips(){
  var col={};THEME_INFO.forEach(function(t){col[t.id]=t.fg});
  var html='';
  if(!draft.id)html+='<button class="chip" type="button" aria-pressed="true"><span class="dot" style="background:'+col[draft.theme]+'"></span>'+esc(draft.sample?'Example: '+names(draft):(names(draft)==='? & ?'?'New couple':names(draft)))+'</button>';
  html+=invites.map(function(i){return '<button class="chip" type="button" data-inv="'+esc(i.id)+'" aria-pressed="'+(draft.id===i.id)+'"><span class="dot" style="background:'+(col[i.theme]||'#999')+'"></span>'+esc(names(i))+'</button>'}).join('');
  $('#chips').innerHTML=html||'<span class="status">No saved invitations yet</span>';
  $$('[data-inv]').forEach(function(b){b.onclick=function(){var f=invites.find(function(x){return x.id===b.dataset.inv});if(f)load(f)}});
  $('#btn-del').hidden=!draft.id;$('#btn-dup').hidden=!draft.id;
}
function load(inv){wOcc=null;draft=clone(inv);delete draft.sample;delete draft.photos;delete draft.musicUrl;delete draft.music;dirty=false;rsvps=[];status('Saved','ok');fillForm();renderChips();preview(true);loadRsvps();refreshSide()}
$('#btn-new').onclick=function(){wOcc=null;draft=clone(BLANK);dirty=true;pvOpen=false;fillForm();renderChips();preview(true);status('Not saved yet','');$('#k-a-name').focus();refreshSide()};
function doSave(quiet){
  if(!(draft.a&&draft.a.name&&draft.b&&draft.b.name)){status('Add both names first','bad');return Promise.resolve(false)}
  var body=clone(draft);delete body.sample;
  var btn=$('#btn-save');if(btn.disabled)return Promise.resolve(false);btn.disabled=true;btn.textContent='Saving…';status('Saving…','');
  var req=draft.id?api('/api/invitations/'+encodeURIComponent(draft.id),{method:'PUT',body:body}):api('/api/invitations',{method:'POST',body:body});
  return req.then(function(saved){var editedSince=JSON.stringify(draft)!==JSON.stringify(body);if(!editedSince){draft=saved;dirty=false;status('Saved','ok')}else{draft.id=saved.id;status('Unsaved changes','')}
    var i=invites.findIndex(function(x){return x.id===saved.id});if(i>=0)invites[i]=saved;else invites.unshift(saved);renderChips();refreshSide();return true})
   .catch(function(e){status(e.status===413?'This invitation is too large to save. Shorten the texts and try again.':e.message||'Could not save. Try again.','bad');return false}).then(function(v){btn.disabled=false;btn.textContent='Save invitation';return v});
}
$('#btn-save').onclick=function(){doSave()};
$('#btn-dup').onclick=function(){var c=clone(draft);c.id=null;c.guests=[];c.a.name=c.a.name;draft=c;dirty=true;fillForm();renderChips();preview(true);status('Copy, not saved yet. Change the names and save.','');refreshSide()};
$('#btn-del').onclick=function(){
  if(!draft.id)return;
  if(Date.now()-delArm>4000){delArm=Date.now();$('#btn-del').textContent='Confirm delete';setTimeout(function(){$('#btn-del').textContent='Delete'},4000);return}
  var id=draft.id;api('/api/invitations/'+encodeURIComponent(id),{method:'DELETE'}).then(function(){toast('Invitation deleted');invites=invites.filter(function(x){return x.id!==id});draft=clone(SAMPLE);fillForm();renderChips();preview(true);refreshSide()}).catch(fail);
  $('#btn-del').textContent='Delete';delArm=0;
};

/* ---------- dialog (confirmations, quick preview) ---------- */
/* ask({title,body,ok,danger,typeToConfirm}) → Promise<boolean>. body is trusted HTML built here. */
function ask(o){return new Promise(function(res){
  var d=$('#dlg'),ok=$('#dlg-ok'),inp=$('#dlg-type');
  $('#dlg-title').textContent=o.title;$('#dlg-body').innerHTML=o.body||'';
  ok.textContent=o.ok||'OK';ok.className='btn '+(o.danger?'danger':'primary');
  $('#dlg-typewrap').hidden=!o.typeToConfirm;inp.value='';$('#dlg-typelabel').textContent=o.typeToConfirm?'Type “'+o.typeToConfirm+'” to confirm':'';
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
$$('[data-tab]').forEach(function(b){b.onclick=function(){tab=b.dataset.tab;$$('[data-tab]').forEach(function(x){x.setAttribute('aria-selected',x===b)});$('#p-design').hidden=tab!=='design';$('#p-guests').hidden=tab!=='guests';$('#p-deliver').hidden=tab!=='deliver';$('#p-orders').hidden=tab!=='orders';$('#p-settings').hidden=tab!=='settings';$('#pv-fab').hidden=tab!=='design';document.body.classList.remove('pv-sheet');refreshSide();if(tab==='design')refit()}});

function refreshSide(){if(tab==='guests'){renderGuests();renderGuestList()}if(tab==='deliver')renderDeliver();if(tab==='orders')loadLeads();if(tab==='settings')renderSettings()}

/* ---------- guests ---------- */
function mine(){return rsvps.filter(function(r){return draft.id&&r.inviteId===draft.id}).sort(function(a,b){return(b.at||0)-(a.at||0)})}
function loadRsvps(){if(!draft.id){rsvps=[];return Promise.resolve()}var id=draft.id;return api('/api/invitations/'+encodeURIComponent(id)+'/rsvps').then(function(r){if(draft.id===id){rsvps=r.items;if(tab==='guests'){renderGuests();renderGuestList()}}}).catch(function(){})}
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
function gid(){return Math.random().toString(36).slice(2,8)}
function personalLink(g){return draft.id?ORIGIN+'/i/'+draft.id+'?g='+g.id:''}
function personalMsg(g,l){
  var n=ReefqInvite.namesOf(draft,l),d=ReefqInvite.fmtDate(draft.date,l),link=personalLink(g)||'[lien]',s=+g.seats||1;
  if(l==='ar')return 'السلام عليكم '+g.name+'،\nيسعدنا دعوتكم لحضور حفل زفاف '+n[0]+' و'+n[1]+' يوم '+d+'.\n'+(s>1?'حجزنا لكم '+s+' مقاعد.\n':'')+'افتحوا دعوتكم وأكّدوا حضوركم من هنا:\n'+link;
  if(l==='en')return 'Hello '+g.name+',\nWe would love you to celebrate the wedding of '+n[0]+' & '+n[1]+' on '+d+'.\n'+(s>1?'We have reserved '+s+' seats for you.\n':'')+'Open your invitation and reply here:\n'+link;
  return 'Bonjour '+g.name+',\nNous avons la joie de vous inviter au mariage de '+n[0]+' & '+n[1]+', le '+d+'.\n'+(s>1?s+' places vous sont réservées.\n':'')+'Ouvrez votre invitation et confirmez votre présence ici :\n'+link;
}
function waHref(g,l){var num=String(g.phone||'').replace(/[^0-9]/g,'');if(num.length===8)num='216'+num;return 'https://wa.me/'+num+'?text='+encodeURIComponent(personalMsg(g,l))}
function renderGuestList(){
  var gl=draft.guests||[],rows=$('#g-rows'),lang=$('#g-lang').value;
  var byG={};mine().forEach(function(r){if(r.guestId&&!byG[r.guestId])byG[r.guestId]=r});
  var seats=gl.reduce(function(a,g){return a+(+g.seats||1)},0),sent=gl.filter(function(g){return g.sent}).length,rep=gl.filter(function(g){return byG[g.id]}).length;
  $('#g-sum').textContent=gl.length?gl.length+' invitations · '+seats+' seats · '+sent+' sent · '+rep+' replied':'';
  if(!gl.length){rows.innerHTML='<tr><td colspan="6" class="empty">No guests yet. Paste your list above.</td></tr>';return}
  rows.innerHTML=gl.map(function(g,i){var r=byG[g.id],st=r?(r.attending?'<span class="pill yes">Coming · '+(+r.guests||1)+'</span>':'<span class="pill no">Not coming</span>'):g.sent?'<span class="pill sent">Sent</span>':'<span class="pill wait">Not sent</span>';
    var ok=!!personalLink(g),ph=String(g.phone||'').replace(/[^0-9]/g,'');
    return '<tr><td>'+esc(g.name)+'</td><td>'+esc(g.phone||'')+'</td><td class="num">'+(+g.seats||1)+'</td><td>'+st+'</td><td><span class="gst">'+
      (ok&&ph?'<a class="btn sm primary" target="_blank" rel="noopener" data-send="'+i+'" href="'+esc(waHref(g,lang))+'">WhatsApp</a>':'')+(ok?'<button class="btn sm" type="button" data-copyg="'+i+'">Copy link</button>':'<span class="status">Save first</span>')+'</span></td><td><button class="btn sm ghost" type="button" data-rmg="'+i+'" aria-label="Remove guest">✕</button></td></tr>'}).join('');
  $$('[data-send]').forEach(function(a){a.addEventListener('click',function(){var g=draft.guests[+a.dataset.send];if(!g.sent){g.sent=Date.now();touch();doSave(true)}})});
  $$('[data-copyg]').forEach(function(b){b.onclick=function(){var g=draft.guests[+b.dataset.copyg];copy(personalMsg(g,$('#g-lang').value),b)}});
  $$('[data-rmg]').forEach(function(b){b.onclick=function(){draft.guests.splice(+b.dataset.rmg,1);touch();renderGuestList();if(draft.id)doSave(true)}});
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
  var csv='\ufeffName,WhatsApp,Seats,Status,People coming,Personal link\n'+gl.map(function(g){var r=byG[g.id];return[g.name,g.phone,g.seats||1,r?(r.attending?'Coming':'Not coming'):g.sent?'Sent':'Not sent',r&&r.attending?(+r.guests||1):'',personalLink(g)].map(q).join(',')}).join('\n');
  download('guests-'+slug(names(draft))+'.csv',csv);
};

/* ---------- deliver ---------- */
function guestLink(){return draft.id?ORIGIN+'/i/'+draft.id:''}
function shareMsg(l){
  var n=ReefqInvite.namesOf(draft,l),d=ReefqInvite.fmtDate(draft.date,l),link=guestLink()||'[lien de l\'invitation]';
  if(l==='ar')return 'السلام عليكم،\nيسعدنا دعوتكم لحضور حفل زفاف '+n[0]+' و'+n[1]+' يوم '+d+'.\nافتحوا الدعوة وأكّدوا حضوركم من هنا:\n'+link;
  if(l==='en')return 'Hello,\nWe would love you to celebrate the wedding of '+n[0]+' & '+n[1]+' on '+d+'.\nOpen your invitation and reply here:\n'+link;
  return 'Bonjour,\nNous avons la joie de vous inviter au mariage de '+n[0]+' & '+n[1]+', le '+d+'.\nOuvrez votre invitation et confirmez votre présence ici :\n'+link;
}
var qrLib=null;
function renderDeliver(){
  $('#msg-langs').innerHTML=[['fr','Français'],['ar','العربية'],['en','English']].map(function(x){return '<button class="chip" type="button" data-ml="'+x[0]+'" aria-pressed="'+(msgLang===x[0])+'">'+x[1]+'</button>'}).join('');
  $$('[data-ml]').forEach(function(b){b.onclick=function(){msgLang=b.dataset.ml;renderDeliver()}});
  var mb=$('#msgbox');mb.textContent=shareMsg(msgLang);mb.dir=msgLang==='ar'?'rtl':'ltr';
  var gl=guestLink();
  $('#glink').textContent=gl||'Save the invitation to get its link';$('#glink-open').hidden=!gl;if(gl)$('#glink-open').href=gl;
  $('#glink-hint').textContent='Anyone can open this link on their phone. For a personal link per family, use the guest list.';
  var q=$('#qr');q.innerHTML='';
  if(window.QRCode&&(gl||draft.id)){new QRCode(q,{text:gl||('reefq:'+draft.id),width:148,height:148,colorDark:'#0f5c60',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.M})}
  else q.textContent=draft.id?'QR unavailable':'Save first';
}
$('#btn-copymsg').onclick=function(){copy($('#msgbox').textContent,this)};
$('#btn-copylink').onclick=function(){var g=guestLink();if(g)copy(g,this);else toast('No link yet')};
/* ---------- orders & RIB payments ---------- */
var orders=[],oFilter='verify',oSel=null,proofUrl=null,oState='loading',oBusy=false,oSeq=0;
var OST={awaiting_payment:['Awaiting transfer','info'],proof_sent:['Proof to verify','warn'],paid:['Paid · client','good'],rejected:['Proof rejected','bad'],cancelled:['Cancelled','bad']};
var OFILTERS=[['verify','To verify'],['awaiting','Awaiting'],['paid','Paid'],['all','All']];
function loadLeads(){var seq=++oSeq;if(!orders.length){oState='loading';renderOrders()}
  return api('/api/orders').then(function(r){if(seq!==oSeq)return;orders=r.items;oState='ok';renderOrders();if(oSel){var o=orders.find(function(x){return x.code===oSel});if(o)openOrder(o.code,true)}}).catch(function(e){if(seq!==oSeq)return;if(!orders.length){oState='error';renderOrders()}else if(tab==='orders')fail(e)})}
function oMatch(o){return oFilter==='all'||(oFilter==='verify'&&o.status==='proof_sent')||(oFilter==='awaiting'&&(o.status==='awaiting_payment'||o.status==='rejected'))||(oFilter==='paid'&&o.status==='paid')}
function receiptAt(o){for(var i=(o.history||[]).length-1;i>=0;i--)if(o.history[i].status==='proof_sent')return o.history[i].at;return o.createdAt||0}
function oSort(a,b){return oFilter==='verify'?receiptAt(b)-receiptAt(a):(b.createdAt||0)-(a.createdAt||0)}
function dshort(t){return new Date(t).toLocaleDateString('fr-TN',{day:'numeric',month:'short'})}
function tshort(t){return new Date(t).toLocaleString('fr-TN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',hour12:false})}
function renderOrders(){
  var n=orders.filter(function(o){return o.status==='proof_sent'}).length,bd=$('#o-badge');bd.hidden=!n;bd.textContent=n;bd.setAttribute('aria-label',n+' receipts to verify');
  var vb=$('#o-verify');vb.className='verify'+(oState==='ok'?(n?' todo':' done'):'');
  vb.innerHTML=oState==='loading'?'<span class="status">Loading orders…</span>':oState==='error'?'':n?'<b>'+n+'</b><span>'+(n===1?'receipt to verify':'receipts to verify')+'</span>'+(oFilter!=='verify'?'<button class="btn sm" type="button" id="o-showverify">Show '+(n===1?'it':'them')+'</button>':'<small>Newest first. Check the bank account, then confirm.</small>'):'<span>No receipts waiting. You are up to date.</span>';
  var sv=$('#o-showverify');if(sv)sv.onclick=function(){oFilter='verify';renderOrders()};
  $('#o-filters').innerHTML=OFILTERS.map(function(f){var c=orders.filter(function(o){var k=oFilter;oFilter=f[0];var r=oMatch(o);oFilter=k;return r}).length;return '<button class="chip" type="button" data-of="'+f[0]+'" aria-pressed="'+(oFilter===f[0])+'">'+f[1]+' · '+c+'</button>'}).join('');
  $$('[data-of]').forEach(function(b){b.onclick=function(){oFilter=b.dataset.of;renderOrders()}});
  var list=orders.filter(oMatch).sort(oSort);
  $('#o-rows').innerHTML=oState==='loading'?'<tr><td colspan="7" class="empty">Loading orders…</td></tr>':oState==='error'?'<tr><td colspan="7" class="empty">Could not load the orders. Check your connection. <button class="btn sm" type="button" id="o-retry">Try again</button></td></tr>':list.length?list.map(function(o){var st=OST[o.status]||[o.status,''];return '<tr class="'+(oSel===o.code?'sel':'')+'"><td>'+dshort(o.createdAt)+(o.status==='proof_sent'?'<br><span class="status">Receipt '+esc(tshort(receiptAt(o)))+'</span>':'')+'</td><td><b>'+esc(o.code)+'</b></td><td>'+esc(o.names)+'<br><span class="status">'+esc([o.date,o.city].filter(Boolean).join(' · '))+'</span></td><td>'+esc(o.plan)+'</td><td class="num">'+o.deposit+' DT</td><td><span class="pill '+st[1]+'">'+st[0]+'</span></td><td><button class="btn sm" type="button" data-od="'+esc(o.code)+'">Review</button></td></tr>'}).join(''):'<tr><td colspan="7" class="empty">'+(oFilter==='verify'?'No receipts to verify right now.':oFilter==='all'?'No orders yet. Orders from the website appear here.':'Nothing in this list.')+'</td></tr>';
  var rt=$('#o-retry');if(rt)rt.onclick=loadLeads;
  $$('[data-od]').forEach(function(b){b.onclick=function(){openOrder(b.dataset.od)}});
}
function clientLink(o){return ORIGIN+'/commande/'+o.code+'?t='+o.token}
function openOrder(code,keep){
  var o=orders.find(function(x){return x.code===code});if(!o)return;oSel=code;renderOrders();
  var d=$('#o-detail');d.hidden=false;if(!keep)d.scrollIntoView({behavior:'smooth',block:'start'});
  var st=OST[o.status]||[o.status,''];$('#od-title').textContent=o.code+' · '+o.names;$('#od-status').textContent=st[0];$('#od-status').className='pill '+st[1];
  var wa=String(o.phone||'').replace(/[^0-9]/g,'');if(wa.length===8)wa='216'+wa;
  var info=[['WhatsApp',o.phone],['Date',o.date],['City',o.city],['Guests',o.guests],['Offer',o.plan+' · '+o.price+' DT'],['Deposit',o.deposit+' DT'],['Received',o.paid?o.paid+' DT':'—'],['Theme',o.theme],['Canva model',o.model],['Message',o.note],['Language',o.lang]].filter(function(r){return r[1]});
  $('#od-info').innerHTML=info.map(function(r){return '<dt>'+r[0]+'</dt><dd>'+esc(r[1])+'</dd>'}).join('')+'<dt>History</dt><dd>'+o.history.map(function(h){return esc(new Date(h.at).toLocaleString('fr-TN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})+' · '+(OST[h.status]||[h.status])[0]+(h.note?' · '+h.note:''))}).join('<br>')+'</dd>';
  $('#od-note').value=o.adminNote||'';$('#od-amount').value=o.paid||o.deposit;$('#od-reason').value='';
  var closed=o.status==='paid'||o.status==='cancelled';$('#od-confirm').hidden=o.status==='paid'||o.status==='cancelled';$('#od-reject').hidden=closed;$('#od-cancel').hidden=o.status==='cancelled';$('#od-reopen').hidden=!closed;
  $('#od-invite').textContent=o.inviteId?'Open the invitation in Design':'Create invitation from this order';
  var msg='Bonjour '+(o.names||'')+',\n'+(o.status==='paid'?'Votre paiement est confirmé, merci ! Votre espace client Reefq :\n':'Voici votre espace client Reefq pour la commande '+o.code+' (acompte '+o.deposit+' DT par virement) :\n')+clientLink(o);
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
$('#od-note-save').onclick=function(){var b=this;if(b.disabled)return;b.disabled=true;api('/api/orders/'+oSel,{method:'PATCH',body:{adminNote:$('#od-note').value}}).then(function(o){var i=orders.findIndex(function(x){return x.code===o.code});orders[i]=o;toast('Note saved')}).catch(fail).then(function(){b.disabled=false})};
$('#od-copy').onclick=function(){var o=orders.find(function(x){return x.code===oSel});if(o)copy(clientLink(o),this)};
$('#od-invite').onclick=function(){var o=orders.find(function(x){return x.code===oSel});if(!o)return;
  var go=function(inv){var i=invites.findIndex(function(x){return x.id===inv.id});if(i<0)invites.unshift(inv);load(inv);$('#tab-design').click();toast('Invitation opened in Design')};
  if(o.inviteId){api('/api/invitations/'+o.inviteId).then(go).catch(fail);return}
  api('/api/orders/'+o.code+'/invitation',{method:'POST'}).then(function(r){var i=orders.findIndex(function(x){return x.code===r.order.code});orders[i]=r.order;go(r.invitation)}).catch(fail)};
$('#o-refresh').onclick=function(){var b=this;b.disabled=true;b.textContent='Refreshing…';loadLeads().then(function(){b.disabled=false;b.textContent='Refresh'})};
/* ---------- settings ---------- */
function renderSettings(){var cs=ME&&ME.canvaStatus;$('#s-canva').textContent=ME&&ME.canva?(cs&&cs.connected?'Connected to Canva'+(cs.lastRun?' · last sync '+new Date(cs.lastRun).toLocaleString('fr-TN')+(cs.count!=null?' · '+cs.count+' templates':''):'')+(cs.lastError?' · last error: '+cs.lastError:''):'Canva is configured. Press Connect Canva once.'):'Add CANVA_CLIENT_ID, CANVA_CLIENT_SECRET and CANVA_FOLDER_ID in Netlify environment variables to enable Canva.';$('#s-bank').textContent=ME&&ME.bankReady?'Bank details are set. Clients see them on their payment page.':'Add BANK_NAME, BANK_HOLDER, BANK_RIB and BANK_IBAN in Netlify environment variables so clients see your RIB.';var ig=[
    ['Team alerts on Telegram',ME&&ME.alerts&&ME.alerts.telegram,'New orders and payment receipts arrive on your phone.',['TELEGRAM_BOT_TOKEN','TELEGRAM_CHAT_ID']],
    ['Team alerts by email',ME&&ME.alerts&&ME.alerts.email,'The same alerts arrive by email (Resend).',['RESEND_API_KEY','ALERT_EMAIL']],
    ['PostHog analytics',ME&&ME.posthog,'Visits, orders, invitations opened and replies are counted.',['POSTHOG_KEY']],
    ['Canva templates',ME&&ME.canva,'Designer templates appear on the website and in Design.',['CANVA_CLIENT_ID','CANVA_CLIENT_SECRET','CANVA_FOLDER_ID']]];
  var on=ig.filter(function(x){return x[1]}).length;
  $('#s-integ-sum').textContent=ME?on+' of '+ig.length+' are on.':'';
  $('#s-integ').innerHTML=ig.map(function(x){return '<li><span class="pill '+(x[1]?'ok':'off')+'">'+(x[1]?'On':'Off')+'</span><b>'+x[0]+'</b><small>'+x[2]+(x[1]?'':' To turn it on, set '+x[3].map(function(v){return '<code>'+v+'</code>'}).join(' and ')+' in Netlify → Environment variables.')+'</small></li>'}).join('');
  $('#s-canva-actions').hidden=!(ME&&ME.canva)}
$('#s-sync').onclick=function(){var b=this;b.disabled=true;$('#s-sync-status').textContent='Syncing…';api('/api/canva/sync',{method:'POST'}).then(function(r){$('#s-sync-status').textContent=r.note;setTimeout(loadCanva,60000)}).catch(function(e){$('#s-sync-status').textContent=e.message||'Could not sync. Try again.'}).then(function(){b.disabled=false})};
$('#s-logout').onclick=function(){api('/api/logout',{method:'POST'}).then(function(){location.reload()})};

/* ---------- login ---------- */
function showLogin(){$('#login').hidden=false;$('#studio').hidden=true;setTimeout(function(){$('#l-pass').focus()},50)}
$('#l-form').onsubmit=function(e){e.preventDefault();var err=$('#l-err');err.hidden=true;var lb=$('#l-form button[type=submit]');if(lb.disabled)return;lb.disabled=true;lb.textContent='Signing in…';api('/api/login',{method:'POST',body:{password:$('#l-pass').value}}).then(function(){$('#l-pass').value='';$('#login').hidden=true;$('#studio').hidden=false;start()}).catch(function(x){err.textContent=x.message;err.hidden=false;$('#l-pass').select()}).then(function(){lb.disabled=false;lb.textContent='Sign in'})};

/* ---------- boot ---------- */
$$('#brand-logo,#l-logo').forEach(function(i){i.src=ReefqInvite.LOGO});$('#brand-logo-d').src=ReefqInvite.LOGO_DARK;
fillForm();renderChips();preview(true);status('Example couple. Press "+ New couple" or edit and save.','');
function start(){
  api('/api/me').then(function(me){ME=me;renderSettings();
    loadLeads();return api('/api/invitations')}).then(function(r){invites=r.items;renderChips()}).catch(function(){});
  loadCanva();
}
start();
setInterval(function(){if(document.visibilityState==='visible'&&tab==='guests')loadRsvps()},20000);
setInterval(loadCanva,5*60*1000);
setInterval(function(){if(document.visibilityState==='visible'&&ME)loadLeads()},60000);
})();
