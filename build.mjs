// 依存ゼロの静的サイトビルダー。使い方: node build.mjs
import { readFileSync, writeFileSync, mkdirSync, readdirSync, cpSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, 'docs');
const site = JSON.parse(readFileSync(join(root, 'content/site.json'), 'utf8'));
const news = JSON.parse(readFileSync(join(root, 'content/news.json'), 'utf8'));
const faq = JSON.parse(readFileSync(join(root, 'content/faq.json'), 'utf8'));
const photos = JSON.parse(readFileSync(join(root, 'content/photos.json'), 'utf8'));
const layout = readFileSync(join(root, 'src/layout.html'), 'utf8');

const base = site.basePath.endsWith('/') ? site.basePath : site.basePath + '/';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pending = '<span class="pending">準備中</span>';
const get = (path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), site);
const jsonLd = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;
const abs = (slug) => (site.siteUrl ? site.siteUrl.replace(/\/$/, '') + base + slug : null);

// SNS共有用の画像(絶対URLが必要なので siteUrl 設定時のみ)
const ogImage = site.siteUrl
  ? `<meta property="og:image" content="${abs('assets/og.png')}">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">`
  : '';

const nav = [
  ['about', '考え方'],
  ['support', '5つの道しるべ'],
  ['programs', '試せること'],
  ['fit', 'ペースの整え方'],
  ['system', '制度と利用の流れ'],
  ['professionals', '関係者の方へ'],
  ['info', '事業所情報'],
];

function renderNews() {
  return news
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((n) => {
      const [y, m, d] = n.date.split('-').map(Number);
      return `<article class="news-item"><time datetime="${n.date}">${y}年${m}月${d}日</time><h2>${esc(n.title)}</h2><p>${esc(n.body)}</p></article>`;
    })
    .join('\n');
}
function renderNewsLatest() {
  return renderNews().split('\n').slice(0, 1).join('\n').replace(/<h2>/, '<h3>').replace(/<\/h2>/, '</h3>');
}
function renderFacts() {
  const rows = site.facts
    .map((f) => `<tr><th scope="row">${esc(f.label)}</th><td>${f.value ? esc(f.value) : pending}${f.note ? `<small>${esc(f.note)}</small>` : ''}</td></tr>`)
    .join('\n');
  return `<table class="facts"><caption class="sr-only">事業所情報の一覧</caption><tbody>${rows}</tbody></table>`;
}
function renderFaq() {
  return faq
    .map(
      (g) =>
        `<section class="faq-group"><h2>${esc(g.group)}</h2>${g.items
          .map((i) => `<details><summary>${esc(i.q)}</summary><p>${esc(i.a)}</p></details>`)
          .join('')}</section>`
    )
    .join('\n');
}
function renderContact() {
  const c = site.contact;
  if (!c.tel && !c.email && !c.formUrl) {
    return `<div class="notice"><p><strong>現在、開設準備中のため、お問い合わせ窓口はまだありません。</strong></p><p>連絡先や見学の受付方法が決まりましたら、このページと「お知らせ」でお伝えします。</p></div>`;
  }
  const li = [];
  if (c.tel) li.push(`<li>電話:<a href="tel:${esc(c.tel.replace(/[^0-9+]/g, ''))}">${esc(c.tel)}</a>${c.hours ? `(受付:${esc(c.hours)})` : ''}</li>`);
  if (c.email) li.push(`<li>メール:<a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>`);
  if (c.formUrl) li.push(`<li><a href="${esc(c.formUrl)}">お問い合わせフォーム</a></li>`);
  return `<ul class="contact-list">${li.join('')}</ul>`;
}

// {{img:キー}} / {{img:キー:追加クラス}} / {{img:キー:追加クラス:eager}}
function renderImg(key, cls = '', eager = '') {
  const p = photos[key];
  if (!p) throw new Error('未定義の写真: ' + key);
  const a = `${base}assets/img/${key}`;
  const load = eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"';
  return `<figure class="photo ${cls}"><img src="${a}-${p.w}.webp" srcset="${a}-${p.small}.webp ${p.small}w, ${a}-${p.w}.webp ${p.w}w" sizes="(max-width: 52rem) 100vw, 50vw" width="${p.w}" height="${p.h}" alt="${esc(p.alt)}" ${load}><figcaption>イメージ写真</figcaption></figure>`;
}
// {{pic:キー}} / {{pic:キー:eager}} : figureなしの<img>だけ(カード内などで使う)
function renderPic(key, eager = '', sizes = '(max-width: 56rem) 100vw, 50vw') {
  const p = photos[key];
  if (!p) throw new Error('未定義の写真: ' + key);
  const a = `${base}assets/img/${key}`;
  const load = eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"';
  return `<img src="${a}-${p.w}.webp" srcset="${a}-${p.small}.webp ${p.small}w, ${a}-${p.w}.webp ${p.w}w" sizes="${sizes}" width="${p.w}" height="${p.h}" alt="${esc(p.alt)}" ${load}>`;
}
function renderCredits() {
  return `<ul class="src">${Object.values(photos).map((p) => `<li>${esc(p.alt)}:<a href="${p.url}">${esc(p.credit)}</a>(Unsplash)</li>`).join('')}</ul>`;
}

const blocks = { credits: renderCredits, news: renderNews, 'news-latest': renderNewsLatest, facts: renderFacts, faq: renderFaq, contact: renderContact };

function parsePage(src) {
  src = src.replace(/\r\n/g, '\n'); // Windows の改行(CRLF)でも動くように
  const m = src.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error('front matter がありません');
  const meta = {};
  m[1].split('\n').forEach((l) => {
    const i = l.indexOf(':');
    meta[l.slice(0, i).trim()] = l.slice(i + 1).trim();
  });
  return { meta, body: m[2] };
}

function fill(str) {
  return str
    .replace(/\{\{icon:([\w-]+)\}\}/g, (_, n) => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#i-${n}"/></svg>`)
    .replace(/\{\{pic:(\w+)(?::(eager))?\}\}/g, (_, k, e) => renderPic(k, e))
    .replace(/\{\{img:(\w+)(?::([\w -]*))?(?::(eager))?\}\}/g, (_, k, c, e) => renderImg(k, c, e))
    .replace(/<!--@(\S+?)-->/g, (_, k) => (blocks[k] ? blocks[k]() : `<!-- unknown block ${k} -->`))
    .replace(/\{\{\?([\w.]+)\}\}/g, (_, p) => { const v = get(p); return v ? esc(v) : pending; })
    .replace(/\{\{base\}\}/g, base)
    .replace(/\{\{([\w.]+)\}\}/g, (_, p) => { const v = get(p); return v == null ? '' : esc(v); });
}

mkdirSync(dist, { recursive: true });
for (const e of readdirSync(dist)) rmSync(join(dist, e), { recursive: true, force: true });
cpSync(join(root, 'src/assets'), join(dist, 'assets'), { recursive: true });

const pages = readdirSync(join(root, 'src/pages')).filter((f) => f.endsWith('.html'));
const built = [];
for (const f of pages) {
  const { meta, body } = parsePage(readFileSync(join(root, 'src/pages', f), 'utf8'));
  const slug = meta.slug === 'index' ? '' : meta.slug + '/';
  const isHome = slug === '';
  const title = isHome ? `${site.fullName}|${site.tagline}` : `${meta.title}|${site.fullName}`;
  const canonical = abs(slug);
  const ld = [];
  ld.push({
    '@context': 'https://schema.org', '@type': 'Organization', name: site.fullName, alternateName: site.name,
    description: site.description, ...(site.siteUrl ? { url: site.siteUrl, logo: abs('assets/icon-512.png') } : {}),
  });
  if (!isHome && canonical) {
    ld.push({
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: site.name, item: abs('') },
        { '@type': 'ListItem', position: 2, name: meta.title, item: canonical },
      ],
    });
  }
  if (meta.slug === 'faq') {
    ld.push({
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faq.flatMap((g) => g.items).map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })),
    });
  }
  const navHtml = nav
    .map(([s, label]) => `<li><a href="${base}${s}/"${meta.slug === s ? ' aria-current="page"' : ''}>${label}</a></li>`)
    .join('');
  const crumb = isHome ? '' : `<nav class="crumb" aria-label="パンくずリスト"><ol><li><a href="${base}">ホーム</a></li><li aria-current="page">${esc(meta.title)}</li></ol></nav>`;
  // <!--@head--> : front matter の en / color / heading / lead からサブページ共通のヘッダーを作る
  const spark = (c) => `<span class="spark ${c}"><svg viewBox="0 0 24 24"><use href="#i-spark"/></svg></span>`;
  const headHtml = `<div class="page-head ph-${meta.color || 'blue'}" data-en="${meta.en || ''}"><div class="floaters" aria-hidden="true"><span class="fl-c fl-1"></span><span class="fl-c fl-2"></span>${spark('sp-2')}${spark('sp-3')}</div><div class="wrap"><span class="eyebrow ${{ blue: '', green: 'g', sun: 's', coral: 'c' }[meta.color || 'blue']}">${meta.en || ''}</span><h1 class="split-text">${meta.heading || meta.title}</h1>${meta.lead ? `<p class="lead">${meta.lead}</p>` : ''}</div></div>`;
  const bodyHtml = fill(body.replace('<!--@head-->', headHtml));
  const html = fill(layout)
    .replaceAll('@@TITLE@@', esc(title))
    .replaceAll('@@DESC@@', esc(meta.description || site.description))
    .replace('@@OGIMAGE@@', ogImage)
    .replace('@@CANONICAL@@', canonical ?`<link rel="canonical" href="${canonical}">\n<meta property="og:url" content="${canonical}">` : '')
    .replace('@@LD@@', ld.map(jsonLd).join('\n'))
    .replace('@@NAV@@', navHtml)
    .replace('@@CRUMB@@', crumb)
    .replace('@@BODYCLASS@@', isHome ? 'home' : 'sub')
    .replace('@@ROBOTS@@', meta.noindex ? '<meta name="robots" content="noindex">' : '')
    .replace('@@MAIN@@', () => bodyHtml);
  const outDir = join(dist, slug);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'index.html'), html);
  if (!meta.noindex) built.push(slug);
}

// 404
const nf = fill(layout)
  .replaceAll('@@TITLE@@', `ページが見つかりません|${esc(site.fullName)}`)
  .replaceAll('@@DESC@@', 'ページが見つかりません')
  .replace('@@OGIMAGE@@', ogImage).replace('@@CANONICAL@@', '').replace('@@LD@@', '').replace('@@NAV@@', nav.map(([s, l]) => `<li><a href="${base}${s}/">${l}</a></li>`).join(''))
  .replace('@@CRUMB@@', '').replace('@@BODYCLASS@@', 'sub').replace('@@ROBOTS@@', '<meta name="robots" content="noindex">')
  .replace('@@MAIN@@', () => `<div class="page-head ph-blue" data-en="404"><div class="wrap"><span class="eyebrow">NOT FOUND</span><h1>ページが見つかりませんでした</h1></div></div><section class="sec bg-white"><div class="wrap prose"><p>お探しのページは、移動したか、まだ準備中かもしれません。</p><p><a class="btn" href="${base}">ホームにもどる</a></p></div></section>`);
writeFileSync(join(dist, '404.html'), nf);

writeFileSync(join(dist, '.nojekyll'), '');
writeFileSync(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n${site.siteUrl ? `Sitemap: ${site.siteUrl.replace(/\/$/, '')}${base}sitemap.xml\n` : ''}`);
if (site.siteUrl) {
  const today = new Date().toISOString().slice(0, 10);
  writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${built.map((s) => `<url><loc>${abs(s)}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
}
console.log(`built ${built.length} pages -> docs/`);
