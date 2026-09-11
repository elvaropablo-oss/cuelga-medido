import { gridLayout, hookPosition, rowLayout } from './math/hanging.js';

const control = (form, name) => form.elements.namedItem(name);
const read = (form, name) => control(form, name).value;
const fmt = (value, digits = 2) => new Intl.NumberFormat('es-ES', { maximumFractionDigits: digits }).format(value);
const show = (element, html) => { element.innerHTML = html; element.hidden = false; element.focus(); };
const fail = (form, reason) => { const error = form.querySelector('[data-error]'); error.textContent = reason.message; error.hidden = false; error.focus(); };
const prepare = (form) => { const error = form.querySelector('[data-error]'); if (error) error.hidden = true; };
const save = (value) => { try { localStorage.setItem('cm:v1:last-result', JSON.stringify(value)); } catch {} };

document.querySelector('#hook-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  prepare(form);
  try {
    const result = hookPosition(Object.fromEntries(['wallWidth', 'frameWidth', 'frameHeight', 'centerHeight', 'hangerDrop', 'hookSeparation'].map((name) => [name, read(form, name)])));
    const marks = result.hooks.map((position, index) => `<li><strong>${result.hooks.length > 1 ? `Anclaje ${index + 1}` : 'Anclaje'}:</strong> ${fmt(position)} cm desde la izquierda y ${fmt(result.hookHeight)} cm desde el suelo</li>`).join('');
    show(document.querySelector('#hook-result'), `<p class="eyebrow">Punto${result.hooks.length > 1 ? 's' : ''} de apoyo</p><h2>${fmt(result.hookHeight)} cm de altura</h2><ol class="marks">${marks}</ol><div class="measure-strip"><span style="left:${result.centerX / Number(read(form, 'wallWidth')) * 100}%">centro</span></div><p class="note">El marco ocupará de ${fmt(result.bottom)} a ${fmt(result.top)} cm de altura y de ${fmt(result.frameLeft)} a ${fmt(result.frameRight)} cm en horizontal.</p>`);
    save({ type: 'hook', ...result, savedAt: new Date().toISOString() });
  } catch (reason) { fail(form, reason); }
});

document.querySelector('#row-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  prepare(form);
  try {
    const result = rowLayout({ availableWidth: read(form, 'availableWidth'), frameWidth: read(form, 'frameWidth'), count: read(form, 'count'), gap: read(form, 'gap'), mode: read(form, 'mode') });
    show(document.querySelector('#row-result'), `<p class="eyebrow">Fila calculada</p><h2>${fmt(result.gap)} cm entre marcos</h2><p>La composición mide ${fmt(result.totalWidth)} cm y deja ${fmt(result.outerMargin)} cm desde cada borde.</p><ol class="marks">${result.centers.map((position, index) => `<li><strong>Marco ${index + 1}:</strong> centro a ${fmt(position)} cm desde la izquierda</li>`).join('')}</ol><div class="row-preview">${result.centers.map((position) => `<span style="left:${(position - result.width / 2) / result.wall * 100}%;width:${result.width / result.wall * 100}%"></span>`).join('')}</div>`);
    save({ type: 'row', ...result, savedAt: new Date().toISOString() });
  } catch (reason) { fail(form, reason); }
});

document.querySelector('#grid-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  prepare(form);
  try {
    const result = gridLayout(Object.fromEntries(['wallWidth', 'wallHeight', 'frameWidth', 'frameHeight', 'columns', 'rows', 'gapX', 'gapY', 'centerHeight', 'hangerDrop'].map((name) => [name, read(form, name)])));
    show(document.querySelector('#grid-result'), `<p class="eyebrow">Plano calculado</p><h2>${result.columns} × ${result.rows} marcos</h2><p>Conjunto de ${fmt(result.footprint[0])} × ${fmt(result.footprint[1])} cm. Empieza a ${fmt(result.left)} cm desde la izquierda y ${fmt(result.bottom)} cm desde el suelo.</p><details><summary>Ver las ${result.positions.length} marcas</summary><div class="table-wrap"><table><thead><tr><th>Marco</th><th>Centro desde izquierda</th><th>Anclaje desde suelo</th></tr></thead><tbody>${result.positions.map((item) => `<tr><td>${item.number}</td><td>${fmt(item.centerX)} cm</td><td>${fmt(item.hookHeight)} cm</td></tr>`).join('')}</tbody></table></div></details>`);
    const preview = document.querySelector('#wall-preview');
    preview.style.aspectRatio = `${result.wall[0]} / ${result.wall[1]}`;
    preview.innerHTML = `<span class="floor">suelo</span>${result.positions.map((item) => `<i aria-hidden="true" style="left:${(item.centerX - result.frame[0] / 2) / result.wall[0] * 100}%;bottom:${(item.centerY - result.frame[1] / 2) / result.wall[1] * 100}%;width:${result.frame[0] / result.wall[0] * 100}%;height:${result.frame[1] / result.wall[1] * 100}%"><b>${item.number}</b></i>`).join('')}`;
    preview.hidden = false;
    save({ type: 'grid', ...result, savedAt: new Date().toISOString() });
  } catch (reason) { fail(form, reason); }
});
