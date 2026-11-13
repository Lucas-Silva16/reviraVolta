import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const inline = text => escape(text).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/`(.*?)`/g, '<code>$1</code>');
function render(markdown) {
  let html = '', table = false;
  for (const line of markdown.split('\n')) {
    if (line.startsWith('|')) {
      if (/^\|[\s:|-]+\|$/.test(line)) continue;
      if (!table) { html += '<table>'; table = true; }
      html += '<tr>' + line.split('|').slice(1, -1).map(cell => `<td>${inline(cell.trim())}</td>`).join('') + '</tr>'; continue;
    }
    if (table) { html += '</table>'; table = false; }
    if (line.startsWith('# ')) html += `<h1>${inline(line.slice(2))}</h1>`;
    else if (line.trim()) html += `<p>${inline(line)}</p>`;
  }
  return html + (table ? '</table>' : '');
}
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage();
  for (const name of ['persuasion-canvas', 'results-poster-template']) {
    const body = render(readFileSync(`docs/${name}.md`, 'utf8'));
    let done = false;
    for (const size of [9, 8.5, 8]) {
      await page.setContent(`<html lang="pt-PT"><head><meta charset="utf-8"><style>@page{size:A4;margin:13mm}body{font-family:Arial,sans-serif;font-size:${size}pt;line-height:1.36;color:#183d31}h1{font-size:21pt;letter-spacing:-.5pt;margin:0 0 13pt;border-bottom:2pt solid #6e8854;padding-bottom:10pt}p{margin:7pt 0}table{width:100%;border-collapse:collapse;margin:10pt 0;font-size:${size - .5}pt}td{border:0.5pt solid #ccd7c4;padding:5pt;vertical-align:top}tr:first-child{background:#edf2e5;font-weight:bold}code{font-size:8pt}strong{font-weight:700}</style></head><body>${body}</body></html>`);
      const pdf = await page.pdf({ path: `docs/${name}.pdf`, format: 'A4', printBackground: true, preferCSSPageSize: true });
      const pages = (pdf.toString('latin1').match(/\/Type \/Page\b/g) || []).length;
      if (pages === 1) { console.log(`${name}.pdf: 1 página A4.`); done = true; break; }
    }
    if (!done) throw new Error(`Documento ${name} excedeu uma página.`);
  }
} finally { await browser.close(); }
