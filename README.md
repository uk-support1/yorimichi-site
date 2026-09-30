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
1. 元画像(jpg)を用意し、`tools/prep_images.py` の `photos` に追記して `python tools/prep_images.py <元画像フォルダ>`(Pillow が必要)。webp 2サイズと `content/photos.json` が生成される。
2. ページ内では `{{img:キー}}`(追加クラス: `{{img:キー:crop-h}}`)と書く。
3. 「イメージ写真」の表記と `credits/`(写真クレジット)は自動で出る。実際の写真に替えたら `figcaption` の文言を見直す。

## アニメーション
`src/assets/main.js` / `style.css`。OSの「視差効果を減らす」設定の人には自動で無効(`.anim` が付かない)。写真の流れる帯には停止ボタンあり。
