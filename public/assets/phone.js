/* Phone field with a country picker. The person picks the country (Tunisia by default) and types only their number;
   the value used everywhere is international: +21698765432. Shared by the order form, the client space and the studio.
   ReefqPhone.attach(input) · ReefqPhone.value(input) → "+216…" or "" · ReefqPhone.valid(input) · ReefqPhone.normalize(text) */
(function(){
'use strict';
/* [iso, dial code, name]: Tunisia first, then neighbours, Gulf, Europe and the rest of the diaspora */
var C=[['TN','216','Tunisie'],['DZ','213','Algérie'],['LY','218','Libye'],['MA','212','Maroc'],['MR','222','Mauritanie'],['EG','20','Égypte'],
  ['FR','33','France'],['IT','39','Italie'],['DE','49','Allemagne'],['BE','32','Belgique'],['CH','41','Suisse'],['NL','31','Pays-Bas'],['ES','34','Espagne'],
  ['PT','351','Portugal'],['GB','44','Royaume-Uni'],['IE','353','Irlande'],['LU','352','Luxembourg'],['MC','377','Monaco'],['MT','356','Malte'],['AT','43','Autriche'],
  ['SE','46','Suède'],['NO','47','Norvège'],['DK','45','Danemark'],['FI','358','Finlande'],['PL','48','Pologne'],['GR','30','Grèce'],['TR','90','Turquie'],['RU','7','Russie'],
  ['SA','966','Arabie saoudite'],['AE','971','Émirats arabes unis'],['QA','974','Qatar'],['KW','965','Koweït'],['BH','973','Bahreïn'],['OM','968','Oman'],
  ['JO','962','Jordanie'],['LB','961','Liban'],['PS','970','Palestine'],['SY','963','Syrie'],['IQ','964','Irak'],['YE','967','Yémen'],['SD','249','Soudan'],
  ['SN','221','Sénégal'],['CI','225','Côte d\'Ivoire'],['ML','223','Mali'],['NE','227','Niger'],['TD','235','Tchad'],['CM','237','Cameroun'],
  ['US','1','États-Unis / Canada'],['BR','55','Brésil'],['AU','61','Australie'],['MY','60','Malaisie'],['ID','62','Indonésie'],['PK','92','Pakistan'],['IN','91','Inde'],
  ['CN','86','Chine'],['JP','81','Japon']];
var BY_LEN=C.slice().sort(function(a,b){return b[1].length-a[1].length});
function flag(iso){return iso.replace(/./g,function(c){return String.fromCodePoint(127397+c.charCodeAt(0))})}
function digits(s){return String(s==null?'':s).replace(/[^0-9]/g,'')}
/* any typed form → +<code><number>: "98 765 432" → +21698765432, "0033 6 12…" → +33612…, "+216 98…" kept */
function normalize(raw){var s=String(raw==null?'':raw).trim(),d=digits(s);if(!d)return'';
  if(/^\+/.test(s))return '+'+d;if(/^00/.test(d))return '+'+d.slice(2);if(d.length===8)return '+216'+d;return d.length>8?'+'+d:''}
/* split an international number back into [iso, local digits] to fill the picker */
function split(full){var d=digits(normalize(full));if(!d)return['TN',''];for(var i=0;i<BY_LEN.length;i++)if(d.indexOf(BY_LEN[i][1])===0)return[BY_LEN[i][0],d.slice(BY_LEN[i][1].length)];return['TN',d]}
function code(iso){for(var i=0;i<C.length;i++)if(C[i][0]===iso)return C[i][1];return'216'}
function attach(input){
  if(!input||input.dataset.phone==='ready')return input;input.dataset.phone='ready';
  var sel=document.createElement('select');sel.className='ph-cc';sel.setAttribute('aria-label','Indicatif du pays');
  sel.innerHTML=C.map(function(c){return '<option value="'+c[0]+'">'+flag(c[0])+' +'+c[1]+' · '+c[2]+'</option>'}).join('');
  var wrap=document.createElement('span');wrap.className='ph';input.parentNode.insertBefore(wrap,input);wrap.appendChild(sel);wrap.appendChild(input);
  var p=split(input.value);sel.value=p[0];input.value=p[1];
  input.setAttribute('inputmode','tel');input.setAttribute('dir','ltr');input.setAttribute('autocomplete','tel-national');
  var hint=function(){input.placeholder=sel.value==='TN'?'98 765 432':'Numéro'};hint();
  sel.addEventListener('change',function(){hint();input.dispatchEvent(new Event('input',{bubbles:true}))});
  /* a number pasted with its code (+33…, 0033…) moves the picker to that country */
  input.addEventListener('blur',function(){var v=input.value.trim();if(/^(\+|00)/.test(v)){var q=split(v);sel.value=q[0];input.value=q[1];hint()}});
  return input}
function local(input){var sel=input.parentNode&&input.parentNode.querySelector('.ph-cc'),d=digits(input.value);
  if(sel&&sel.value!=='TN'&&d.charAt(0)==='0')d=d.replace(/^0+/,'');/* "06 12 …" in France = +33 6 12 … */
  return{iso:sel?sel.value:'TN',d:d}}
function value(input){var v=input.value.trim();if(/^(\+|00)/.test(v))return normalize(v);var l=local(input);return l.d?'+'+code(l.iso)+l.d:''}
/* only countries of the list are accepted, also when a number is pasted with its code */
function known(n){for(var i=0;i<BY_LEN.length;i++)if(n.indexOf(BY_LEN[i][1])===0)return true;return false}
function valid(input){var v=input.value.trim();if(/^(\+|00)/.test(v)){var n=digits(normalize(v));return n.length>=9&&n.length<=15&&known(n)}
  var l=local(input);return l.iso==='TN'?l.d.length===8:l.d.length>=6&&l.d.length<=13}
/* for display: +216 55 999 000 (Tunisia), +33 612345678 (others) */
function format(full){var n=normalize(full);if(!n)return String(full||'');var p=split(n),c=code(p[0]);
  return '+'+c+' '+(p[0]==='TN'&&p[1].length===8?p[1].replace(/^(\d{2})(\d{3})(\d{3})$/,'$1 $2 $3'):p[1])}
window.ReefqPhone={format:format,attach:attach,value:value,valid:valid,normalize:normalize,split:split,COUNTRIES:C};
})();
