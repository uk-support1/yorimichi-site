# ロゴ一式の生成。使い方: python tools/prep_logo.py
#  元画像: design/logo-sheet.webp(ロゴ一覧シート)、design/favicon-icon.webp(ファビコン用アイコン)
from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parent.parent
sheet = Image.open(root/'design/logo-sheet.webp').convert('RGB')
icon_src = Image.open(root/'design/favicon-icon.webp').convert('RGB')
img = root/'src/assets/img'; assets = root/'src/assets'

def key_white(im):
    """白背景を透過に(色は変えず、白に近い画素だけ透明へ)"""
    im = im.convert('RGBA'); px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r,g,b,_ = px[x,y]
            a = max(0, min(255, round(((255-min(r,g,b))-4)/24*255)))
            px[x,y] = (r,g,b,a)
    return im

def trim(im, pad=6):
    l,t,r,b = im.getchannel('A').point(lambda v: 255 if v>20 else 0).getbbox()
    return im.crop((max(0,l-pad),max(0,t-pad),min(im.width,r+pad),min(im.height,b+pad)))

# 横組み / 縦組み
h = trim(key_white(sheet.crop((70,95,1400,610))))
h.thumbnail((900,900), Image.LANCZOS); h.save(img/'logo-h.webp','WEBP',quality=92,method=6)
v = trim(key_white(sheet.crop((80,650,420,1000))))
v.thumbnail((500,500), Image.LANCZOS); v.save(img/'logo-v.webp','WEBP',quality=92,method=6)

# ファビコン用アイコン: 外側の白だけを透明にして、角丸の外形で切り出す
ic = icon_src.convert('RGBA')
mk = ic.copy()
ImageDraw.floodfill(mk, (0,0), (255,0,255,255), thresh=6)
mask = Image.new('L', ic.size, 255)
mp, ip = mask.load(), mk.load()
for y in range(ic.height):
    for x in range(ic.width):
        if ip[x,y][:3] == (255,0,255): mp[x,y] = 0
ic.putalpha(mask)
bb = mask.getbbox(); ic = ic.crop(bb)
side = max(ic.size); sq = Image.new('RGBA',(side,side),(0,0,0,0)); sq.paste(ic,((side-ic.width)//2,(side-ic.height)//2))
for s,n in [(512,'icon-512.png'),(192,'icon-192.png'),(180,'apple-touch-icon.png'),(32,'favicon-32.png')]:
    sq.resize((s,s), Image.LANCZOS).save(assets/n)
sq.resize((256,256), Image.LANCZOS).save(assets/'favicon.ico', sizes=[(16,16),(32,32),(48,48)])

# OGP画像(1200x630、白地に横組みロゴ)
og = Image.new('RGB',(1200,630),(255,255,255))
lg = h.copy(); lg.thumbnail((1000,420), Image.LANCZOS)
og.paste(lg, ((1200-lg.width)//2,(630-lg.height)//2), lg)
og.save(assets/'og.png', optimize=True)
print('logo-h',h.size,'logo-v',v.size,'icon bbox',bb)
