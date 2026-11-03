import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
const browser = (...args) => execFileSync('agent-browser', args, { encoding: 'utf8', timeout: 30000 });
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const checks = [];
for (const width of [375, 768, 1024, 1440]) {
  browser('set', 'viewport', String(width), '1000');
  browser('open', 'http://127.0.0.1:8766/task2/');
  const layout = JSON.parse(browser('eval', '({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,guests:$(".house .guest").length,images:$(".avatar").toArray().every(i=>i.complete&&i.naturalWidth>0)})'));
  browser('eval', '$("#arman").trigger("click")'); await pause(450);
  const dialog = JSON.parse(browser('eval', '(()=>{const r=$(".detail-card")[0].getBoundingClientRect();return {fits:r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight,count:$(".detail-card").length}})()'));
  checks.push({ width, pass: layout.width >= layout.scrollWidth && layout.guests === 21 && layout.images && dialog.fits && dialog.count === 1, layout, dialog });
}
writeFileSync('report/layout-checks.json', JSON.stringify(checks, null, 2));
console.log(JSON.stringify(checks));
