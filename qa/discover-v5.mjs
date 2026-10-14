import fs from 'node:fs/promises';
const pages=['https://www.esa.int/ESA_Multimedia/Images/2018/07/Planck_s_view_of_the_cosmic_microwave_background2',...['heic1901a','heic0710a','heic0506a'].map(n=>'https://esahubble.org/images/'+n+'/')];
const result=await Promise.all(pages.map(async page=>{const html=await(await fetch(page,{signal:AbortSignal.timeout(45000)})).text();const urls=[...new Set([...html.matchAll(/https?:[^\s"'<>]+\.(?:jpg|png|jpeg)(?:\?[^\s"'<>]*)?/gi)].map(m=>m[0].replaceAll('&amp;','&')))];return {page,urls:urls.filter(u=>!u.includes('logo')).slice(0,32)};}));
await fs.writeFile('qa/v5-discovery.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));

