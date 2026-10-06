import { readdir, readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
for(const dir of ['assets','scripts','tests'])for(const file of await readdir(dir))if(/\.(m?js)$/.test(file))execFileSync(process.execPath,['--check',`${dir}/${file}`]);
for(const route of ['','meist/','hinnakiri/','vali-disain/','tehtud-tood/']){
  const html=await readFile(route+'index.html','utf8');
  for(const expected of ['lang="et"','<h1>','name="description"','og:title','id="main"'])if(!html.includes(expected))throw new Error(`${route}: missing ${expected}`);
  if(/https:\/\/.*cdn/.test(html))throw new Error('Unexpected remote runtime');
}
console.log('JavaScripti süntaks ja kõigi viie lehe metaandmed korras.');
