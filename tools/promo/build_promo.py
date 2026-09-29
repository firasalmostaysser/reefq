import os
# Builds public/_promo/{promo,poster}.html. Run `npm run dev`, then the render scripts capture them.
ROOT=os.path.join(os.path.dirname(__file__),'..','..')
P=lambda *a: os.path.join(ROOT,*a)
FONTS='https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Aref+Ruqaa:wght@400;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Figtree:wght@400;500;600;700&family=Pinyon+Script&display=swap'
ff=""
css="""html,body{margin:0;height:100%;background:#000;overflow:hidden}
#stage{position:relative;width:100vw;height:100vh;overflow:hidden}
#inv{position:absolute;inset:0}#inv>div{height:100%}
.rq-badge,.rq-lang{display:none!important}
.cap{position:absolute;left:24px;right:24px;z-index:80;text-align:center;font:700 23px/1.3 Figtree,sans-serif;color:#fff;pointer-events:none}
.cap span{display:inline;background:rgb(15 45 46 / .88);padding:6px 12px;box-decoration-break:clone;-webkit-box-decoration-break:clone;border-radius:10px}
.cap.top{top:52px}.cap.mid{top:44%}.cap.bottom{bottom:110px}
.cap.ar{font:700 27px/1.5 'Amiri',serif;direction:rtl}
#tap{position:absolute;z-index:90;width:84px;height:84px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 6px rgb(255 255 255 / .25),0 6px 20px rgb(0 0 0 / .3);opacity:0;pointer-events:none}
#end{position:absolute;inset:0;z-index:95;background:#f6f2e9;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center;opacity:0;padding:40px}
#end img{width:250px}
#end h2{font:500 38px/1.15 'Cormorant Garamond',serif;color:#132829;margin:8px 0 0}
#end p{font:600 18px/1.4 Figtree,sans-serif;color:#546664;margin:0}
#end .pill{background:#147d82;color:#fff;border-radius:999px;padding:12px 22px;font:700 19px Figtree,sans-serif;margin-top:14px}
#end.ar h2{font:700 34px/1.5 'Aref Ruqaa',serif}#end.ar p,#end.ar .pill{font-family:'Amiri',serif;font-size:21px}
"""
html=f"""<!doctype html><html><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><link rel=stylesheet href="{FONTS}"><link rel=stylesheet href="/assets/invitation.css"><style>{css}</style></head>
<body><div id=stage><div id=inv></div><div id=cap class=cap></div><div id=tap></div><div id=end></div></div>
<script src="/assets/engine.js"></script><script src="/_promo/promo_scene.js"></script></body></html>"""
os.makedirs(P('public','_promo'),exist_ok=True)
open(P('public','_promo','promo.html'),'w').write(html)
import shutil
for f in ('promo_scene.js','poster_scene.js'):shutil.copy(os.path.join(os.path.dirname(__file__),f),P('public','_promo',f))

# Posters (4:5 posts and stories)
poster=f"""<!doctype html><html><head><meta charset=utf-8><link rel=stylesheet href="{FONTS}"><link rel=stylesheet href="/assets/invitation.css"><style>{open(os.path.join(os.path.dirname(__file__),'poster.css')).read()}</style></head><body><div id=s></div><script src="/assets/engine.js"></script><script src="/_promo/poster_scene.js"></script></body></html>"""
open(P('public','_promo','poster.html'),'w').write(poster)
print('Built public/_promo/promo.html and poster.html')
