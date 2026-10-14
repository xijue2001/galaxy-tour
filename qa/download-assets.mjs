import fs from 'node:fs/promises';
let list=[
 ['pleiades','https://iauarchive.eso.org/public/images/detail/ann22042ab/'],
 ['eagle-nebula','https://esawebb.org/images/pillarsofcreation_composite/'],
 ['carina-cliffs','https://esawebb.org/images/weic2205a/'],
 ['lagoon-nebula','https://www.eso.org/public/images/eso1101a/'],
 ['trifid-nebula','https://www.eso.org/public/images/eso0930a/'],
 ['horsehead-nebula','https://www.eso.org/public/images/eso0202a/'],
 ['rosette-nebula','https://www.eso.org/public/images/b12/'],
 ['omega-nebula','https://www.eso.org/public/images/eso1119a/'],
 ['helix-nebula','https://www.eso.org/public/images/eso0907a/'],
 ['ring-nebula','https://esahubble.org/images/heic1310a/'],
 ['butterfly-nebula','https://esahubble.org/images/heic0910h/'],
 ['cats-eye-nebula','https://esahubble.org/images/heic0414a/'],
 ['veil-nebula','https://esahubble.org/images/potw2113a/'],
 ['double-cluster','https://www.eso.org/public/images/b02/'],
 ['hercules-cluster','https://esahubble.org/images/potw1011a/'],
 ['omega-centauri','https://www.eso.org/public/images/eso1119b/']
];
if(process.argv[2])list=list.filter(r=>r[0]===process.argv[2]);
const strip=s=>s.replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
const results=[];let cursor=0;
async function worker(){while(cursor<list.length){const[id,page]=list[cursor++];try{
 const response=await fetch(page);if(!response.ok)throw Error(`page ${response.status}`);const html=await response.text();
 const paths=[...html.matchAll(/href=["']([^"']+(?:\/screen\/)[^"']+\.(?:jpg|jpeg))["']/g)].map(m=>m[1]);if(!paths.length)throw Error('No official screensize resource');
 const resource=new URL(paths[0],page).href;const image=await fetch(resource);if(!image.ok||!image.headers.get('content-type')?.startsWith('image/'))throw Error(`image ${image.status}`);
 const bytes=Buffer.from(await image.arrayBuffer());await fs.writeFile(`assets/${id}.jpg`,bytes);
 const tail=html.slice(html.indexOf('Credit:'));const credit=strip(tail.split(/<\/p>|<\/div>/)[0]).replace(/^Credit:\s*/,'');
 const title=strip(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]||'');
 const result={id,page,resource,bytes:bytes.length,title,credit};results.push(result);console.log(JSON.stringify({id,title,bytes:bytes.length,credit}));
}catch(e){results.push({id,page,error:String(e)});console.log(JSON.stringify({id,error:String(e)}));}}}
await Promise.all([worker(),worker(),worker()]);const previous=process.argv[2]?JSON.parse(await fs.readFile('qa/new-asset-sources.json','utf8')).filter(r=>r.id!==process.argv[2]):[];await fs.writeFile('qa/new-asset-sources.json',JSON.stringify([...previous,...results],null,2));if(results.some(r=>r.error))process.exitCode=1;
