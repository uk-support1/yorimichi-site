# 写真の最適化(webp化・2サイズ)と content/photos.json の生成。
# 使い方: python tools/prep_images.py <元画像フォルダ>   (元画像は Unsplash から取得した jpg)
import sys, json
from pathlib import Path
from PIL import Image

src = Path(sys.argv[1])
out = Path(__file__).resolve().parent.parent / 'src/assets/img'
P = lambda id, name, url: dict(id=id, credit=name, url=f'https://unsplash.com/photos/{id}')
photos = {
 'hero':  ('7QSnX_F3ziY','llxvisuals','丘の上へ続く細い道を、ひとりの人が歩いている風景'),
 'path':  ('Rgr_UPw7lIA','Paws and Prints','緑の丘の向こうに海が見える、遠くへ続く小道'),
 'notes': ('ZDDF6LMvh2s','Priscilla Du Preez','木の机でノートに手書きしている手元'),
 'desk':  ('tdnYk4qOGhc','ergonofis','大きな窓と植物のある、明るく落ち着いた机まわり'),
 'sprout':('x8ZStukS2PM','Noah Buscher','両手のひらに乗せた土と、小さな若葉'),
 'hands': ('9gUVNzHKBG4','Jennifer Delmarre','土から芽を出した小さな苗を、両手で包んでいる様子'),
 'work':  ('e9OVhamF4PI','Alexander Polous','ノートパソコンで作業する手元と、机の上のカメラ'),
 'team':  ('yd_RKGH_RH4','Vitaly Gariev','ひとつの画面を囲んで、和やかに話し合う人たち'),
 'talk':  ('UikYLDQj9_I','Vitaly Gariev','パソコンを見ながら、それぞれの考えを伝え合う人たち'),
 'trail': ('wnGKjQ49pOE','Jakub Klucký','緑の茂みの間を抜けていく細い小道'),
}
meta = {}
for key,(id,credit,alt) in photos.items():
    im = Image.open(src/f'{id}.jpg').convert('RGB')
    big = 1000 if key=='hero' else 1400
    sizes = [big, big//2]
    for w in sizes:
        r = im.resize((w, round(im.height*w/im.width)), Image.LANCZOS)
        r.save(out/f'{key}-{w}.webp', 'WEBP', quality=76, method=6)
    h = round(im.height*big/im.width)
    meta[key] = dict(w=big, h=h, small=big//2, alt=alt, credit=credit, url=f'https://unsplash.com/photos/{id}')
Path(out.parent.parent.parent/'content/photos.json').write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding='utf8')
print(json.dumps({k:(v['w'],v['h']) for k,v in meta.items()}))
