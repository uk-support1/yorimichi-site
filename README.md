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
- 写真・イラスト・OGP画像は未使用(架空の施設写真を避けるため)。開設後に追加
