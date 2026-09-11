import { site } from '../../site.config.mjs';

const base = site.basePath;
export const linkButton = (path, label, quiet = false) => `<a class="button${quiet ? ' button--quiet' : ''}" href="${base}${path}">${label}</a>`;
export const breadcrumbs = (items) => `<nav class="breadcrumbs" aria-label="Migas de pan">${items.map((item, index) => index === items.length - 1 ? `<span aria-current="page">${item.label}</span>` : `<a href="${base}${item.path}">${item.label}</a>`).join('<span aria-hidden="true">/</span>')}</nav>`;
export const hero = (kicker, title, intro, actions = '') => `<section class="hero"><p class="eyebrow">${kicker}</p><h1>${title}</h1><p class="lead">${intro}</p>${actions ? `<div class="actions">${actions}</div>` : ''}</section>`;

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
<script type="application/ld+json">${schema}</script><script type="module" src="${base}assets/app.js"></script></head>
<body><a class="skip-link" href="#contenido">Saltar al contenido</a>
<header class="site-header"><a class="brand" href="${base}" aria-label="CuelgaMedido, inicio"><span aria-hidden="true">＋</span> CuelgaMedido</a><nav aria-label="Principal"><a href="${base}herramientas/">Herramientas</a><a href="${base}guias/medir-anclaje/">Guía</a><a href="${base}metodologia/">Metodología</a></nav></header>
<main id="contenido">${page.content}</main>
<footer><p><strong>CuelgaMedido</strong> convierte un diseño en marcas medibles. Verifica pared, fijaciones y nivel antes de perforar.</p><nav aria-label="Información"><a href="${base}metodologia/">Metodología</a><a href="${base}sobre/">Sobre</a><a href="${base}privacidad/">Privacidad</a></nav></footer></body></html>`;
}
