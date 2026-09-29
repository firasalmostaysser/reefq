/* Reefq analytics: PostHog, loaded only when POSTHOG_KEY is set on the server.
   Cookieless (memory persistence) so no consent banner is needed. Never send names, phones or messages:
   only event names, theme, plan, language, order code and yes/no values. */
(function(){
'use strict';
var queue=[];
window.rqTrack=function(ev,props,now){if(window.posthog&&window.posthog.__loaded)window.posthog.capture(ev,props||{},now?{send_instantly:true,transport:'sendBeacon'}:undefined);else queue.push([ev,props||{}])};
fetch('/api/config',{cache:'no-store'}).then(function(r){return r.ok?r.json():{}}).then(function(c){
  var ph=c&&c.posthog;if(!ph||!ph.key)return;
  /* official PostHog loader snippet */
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset identify setPersonProperties group getFeatureFlag isFeatureEnabled onFeatureFlags captureException".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
  window.posthog.init(ph.key,{api_host:ph.host||'https://us.i.posthog.com',persistence:'memory',person_profiles:'identified_only',
    capture_pageview:true,autocapture:true,capture_exceptions:true,disable_session_recording:true,
    /* client-space tokens (?t=) and guest ids (?g=) are private links: never send them */
    before_send:function(e){if(!e)return e;['properties','$set','$set_once'].forEach(function(b){var o=e[b];if(o)for(var k in o){if(typeof o[k]==='string')o[k]=o[k].replace(/([?&])(t|g)=[^&#]*/g,'$1$2=hidden')}});return e},
    loaded:function(p){p.register({site_area:location.pathname.split('/')[1]||'landing'});queue.forEach(function(q){p.capture(q[0],q[1])});queue=[]}});
}).catch(function(){});
})();
