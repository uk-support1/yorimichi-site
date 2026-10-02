# よりみち ホームページ(開設準備中版)

依存ゼロの静的サイトです。`node build.mjs` で `docs/` が生成されます。公開・push はしていません。

## 更新のしかた
| したいこと | 編集するファイル |
|---|---|
| 住所・開所日・定員・利用時間・職員体制などを載せる | `content/site.json` の `facts`(`value` を文字列にする。`null` は「準備中」表示) |
| 電話・メール・フォームを載せる | `content/site.json` の `contact` |
| お知らせ・ブログ風の更新を追加 | `content/news.json` に追記 |
| よくある質問を追加 | `content/faq.json`(FAQ構造化データも自動更新) |
| 公開URLを設定(canonical・sitemap.xml が生成される) | `content/site.json` の `siteUrl` と `basePath` |
| 本文の修正 | `src/pages/*.html` |
| 見た目 | `src/assets/style.css` |

編集後に `node build.mjs` を実行してください。

## 公開前に確認すること
- 正式な事業所名・運営法人名(「ミチアワセ」は過去検討時の名称のため、未掲載)
- プライバシーポリシー(暫定版)の内容確認
- 制度情報は 2026年9月30日時点。公開時に `system` ページと `lastChecked` を再確認
- 写真はすべて Unsplash のイメージ写真(実際の事業所・利用者・職員ではない)。開設後に実際の写真へ差し替える
- OGP画像は未作成

## 写真の差し替え・追加
1. 元画像(jpg)を `design/photos-src/<ID>.jpg` に置き、`tools/prep_images.py` の `photos` に追記して `python tools/prep_images.py`(Pillow が必要)。webp 2サイズと `content/photos.json` が生成される。
2. ページ内では `{{pic:キー}}`(画像のみ)、または `{{img:キー:追加クラス}}`(figure付き)と書く。
3. 「イメージ写真」の表記と `credits/`(写真クレジット)は自動で出る。実際の写真に替えたら `figcaption` の文言を見直す。

## デザインシステム
`src/assets/style.css` の冒頭 `:root` に、色(ロゴ由来の Blue / Green / Coral / Sun / Purple と、文字用の濃い色 `-d`、背景用の淡い色 `-l`)、角丸、影、フォント、余白を集約している。
- セクションの背景は `bg-white / bg-cream / bg-sky / bg-mint / bg-sun / bg-coral` を切り替えるだけで、波形の境目も自動でつく。
- サブページは front matter(`en` `color` `heading` `lead`)と `<!--@head-->` で共通ヘッダーが出る。
- アイコンは `{{icon:名前}}`(定義は `src/layout.html` の SVG スプライト)。
- フォントは Google Fonts(Zen Maru Gothic / Noto Sans JP / Outfit)。プライバシーポリシーにも記載済み。

## アニメーション
`src/assets/main.js` / `style.css`。フェードアップ、見出しの一文字表示、写真のゆっくりズーム、パララックス、流れる文字、浮遊する図形や光など。
- ヘッダーの「動き」ボタンで、いつでも止められる(設定は端末に保存)。
- OSの「視差効果を減らす」設定の人には、自動で無効(ボタンも非表示)。

## ロゴ・ファビコン
元画像は `design/`(`logo-sheet.webp`=ロゴ一覧、`favicon-icon.webp`=ファビコン用)。差し替えるときは、画像を置き換えて `python tools/prep_logo.py`(Pillow が必要)を実行し、`node build.mjs`。横組み・縦組みロゴ、ファビコン各種、SNS共有画像(`og.png`)が再生成される。

## ローカルで見る
`preview.bat` をダブルクリック(ビルド→サーバー起動→ブラウザが開く)。または `node build.mjs && node preview.mjs` を実行し、http://localhost:8080/yorimichi-site/ を開く。`docs/index.html` を直接開くと、公開URL用のパスのため正しく表示されない。
