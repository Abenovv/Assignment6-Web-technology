// Run inside the retained agent-browser workflow after starting the local server.
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const browser = (...args) => execFileSync('agent-browser', args, { encoding: 'utf8', timeout: 30000 });
const evaluate = source => browser('eval', source);
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const screenshot = (name, selector = '.board') => browser('screenshot', selector, resolve('report/screenshots/' + name + '.png'));
browser('set', 'viewport', '1440', '1000');
if (!process.argv.includes('--motion-only')) {
browser('open', 'http://127.0.0.1:8766/task1/');
evaluate('$("#reset").trigger("click")');
screenshot('overview', 'body');
const records = [];
for (let index = 0; index < 20; index++) {
  evaluate('runCase(' + index + ')');
  await wait(450);
  records.push(JSON.parse(evaluate('({number:' + (index + 1) + ',title:partyCases[' + index + '].title,chain:$("#chain").text(),result:$("#result-names").text()})')));
  screenshot('case-' + String(index + 1).padStart(2, '0'));
}
writeFileSync('report/cases.json', JSON.stringify(records, null, 2));
}
browser('open', 'http://127.0.0.1:8766/task2/');
evaluate('runCase(2)'); await wait(400); screenshot('spotlight');
evaluate('$("#clear").trigger("click")'); await wait(400); screenshot('clear');
evaluate('$("#arman").trigger("click")'); await wait(450); browser('screenshot', resolve('report/screenshots/guest-card.png'));
evaluate('$(".move-button[data-target=balcony]").trigger("click")'); await wait(650); screenshot('moved');
evaluate('runCase(0)'); await wait(400); screenshot('hall-after-move');
evaluate('$("#reset").trigger("click"); $("#living-room .sort-button").trigger("click")'); await wait(500); screenshot('sorted');
evaluate('$("#living-room .sort-button").trigger("click")'); await wait(500); screenshot('picture-order');
evaluate('for(let i=0;i<5;i++) $("#living-room .sort-button").trigger("click")'); await wait(500); screenshot('fast-sort');
console.log('Saved 20 case screenshots and 9 report screenshots.');
