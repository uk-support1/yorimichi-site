# 写真の最適化(webp化・2サイズ)と content/photos.json の生成。
# 使い方: python tools/prep_images.py     (元画像: design/photos-src/<UnsplashのID>.jpg)
import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent
src = root/'design/photos-src'
out = root/'src/assets/img'
photos = {
 'smile': ('s3hlZ-gdfdQ','Vitaly Gariev','カラフルな壁の前で、笑顔でノートパソコンに向かう人'),
 'group': ('Of_m3hMsoAA','Jud Mackrill','パソコンを囲んで、笑顔で話し合う人たち'),
 'pair':  ('VfDX9EXTwEA','Surface','タブレットを見ながら、笑顔で話す2人'),
 'design':('Wlg-hDGCQ08','Vooglam Eyewear','机の上でスケッチを描き、ノートパソコンで作業する手元'),
 'desk':  ('UHfJI_lZoPo','Vitaly Gariev','明るい机で、笑顔でノートパソコンを使う人'),
 'board': ('wODKtuRipCA','Walls.io','ホワイトボードに付箋を貼りながら、話し合う2人'),
 'sticky':('Jv0HtxvVduI','Vitaly Gariev','ガラスボードの付箋を見ながら、アイデアを話し合う人たち'),
 'path':  ('7QSnX_F3ziY','llxvisuals','丘の上へ続く細い道を、ひとりの人が歩いている風景'),
 'hands': ('9gUVNzHKBG4','Jennifer Delmarre','土から芽を出した小さな苗を、両手で包んでいる様子'),
}
meta = {}
for key,(id,credit,alt) in photos.items():
    im = Image.open(src/f'{id}.jpg').convert('RGB')
    big = 1000 if im.height > im.width else 1400
    for w in (big, big//2):
        r = im.resize((w, round(im.height*w/im.width)), Image.LANCZOS)
        r.save(out/f'{key}-{w}.webp', 'WEBP', quality=78, method=6)
    meta[key] = dict(w=big, h=round(im.height*big/im.width), small=big//2, alt=alt, credit=credit, url=f'https://unsplash.com/photos/{id}')
(root/'content/photos.json').write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding='utf8')
print({k:(v['w'],v['h']) for k,v in meta.items()})
