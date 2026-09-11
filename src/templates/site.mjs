import { site } from '../../site.config.mjs';

const base = site.basePath;
export const linkButton = (path, label, quiet = false) => `<a class="button${quiet ? ' button--quiet' : ''}" href="${base}${path}">${label}</a>`;
export const breadcrumbs = (items) => `<nav class="breadcrumbs" aria-label="Migas de pan">${items.map((item, index) => index === items.length - 1 ? `<span aria-current="page">${item.label}</span>` : `<a href="${base}${item.path}">${item.label}</a>`).join('<span aria-hidden="true">/</span>')}</nav>`;
export const hero = (kicker, title, intro, actions = '') => `<section class="hero"><p class="eyebrow">${kicker}</p><h1>${title}</h1><p class="lead">${intro}</p>${actions ? `<div class="actions">${actions}</div>` : ''}</section>`;

function navLink(pagePath, path, label) {
  const active = pagePath === path || (path === 'guias/medir-anclaje' && pagePath.startsWith('guias/'));
  return `<a href="${base}${path}/"${active ? ' aria-current="page"' : ''}>${label}</a>`;
}

export function renderPage(page) {
  const canonical = `${site.origin}${base}${page.path ? `${page.path}/` : ''}`;
  const schema = JSON.stringify(page.schema || {
    '@context': 'https://schema.org', '@type': page.tool ? 'WebApplication' : 'WebPage', name: page.h1,
    url: canonical, description: page.description, inLanguage: 'es-ES',
    ...(page.tool ? { applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' } } : {})
  }).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${page.title}</title><meta name="description" content="${page.description}">${page.noindex ? '<meta name="robots" content="noindex,follow">' : ''}
<link rel="canonical" href="${canonical}"><link rel="icon" href="${base}assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="${base}assets/site.css">
<script type="application/ld+json">${schema}</script><script type="module" src="${base}assets/app.js"></script><script type="module" src="${base}assets/visuals.js"></script><script type="module" src="${base}assets/quality-fixes.js"></script></head>
<body class="page-${page.path ? page.path.replaceAll('/', '-') : 'home'}"><a class="skip-link" href="#contenido">Saltar al contenido</a>
<header class="site-header"><a class="brand" href="${base}" aria-label="CuelgaMedido, inicio"><svg class="brand-mark" viewBox="0 0 42 42" aria-hidden="true"><rect x="5" y="8" width="32" height="27" fill="#fff" stroke="currentColor" stroke-width="3"/><path d="m12 27 7-8 5 5 6-7" fill="none" stroke="#3448d8" stroke-width="2"/><circle cx="21" cy="5" r="3" fill="#ef493d"/></svg><span>CuelgaMedido</span></a><nav aria-label="Principal">${navLink(page.path, 'herramientas', 'Herramientas')}${navLink(page.path, 'guias/medir-anclaje', 'Guía')}${navLink(page.path, 'metodologia', 'Metodología')}</nav></header>
<main id="contenido">${page.content}</main>
<footer><p><strong>CuelgaMedido</strong> convierte un diseño en marcas medibles. Verifica pared, fijaciones y nivel antes de perforar.</p><nav aria-label="Información"><a href="${base}metodologia/">Metodología</a><a href="${base}sobre/">Sobre</a><a href="${base}privacidad/">Privacidad</a></nav></footer></body></html>`;
}
