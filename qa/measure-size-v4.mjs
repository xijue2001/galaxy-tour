import fs from 'node:fs/promises';
import path from 'node:path';
async function files(dir='.'){
 const result=[];for(const e of await fs.readdir(dir,{withFileTypes:true})){
  if(['.git','.codex','.agents'].includes(e.name))continue;
  const p=path.join(dir,e.name);if(e.isDirectory())result.push(...await files(p));else if(e.isFile())result.push({path:p.replaceAll('\\','/'),bytes:(await fs.stat(p)).size});
 }return result;
}
const old=JSON.parse(await fs.readFile('qa/project-size-v3.json','utf8'));
const output='qa/project-size-v4.json';let previous=0,record;
for(let pass=0;pass<5;pass++){
 const all=(await files()).filter(f=>f.path!==output),sum=fn=>all.filter(fn).reduce((n,f)=>n+f.bytes,0);
 record={checkedOn:'2026-10-13',version:'4.0.0',projectBytes:sum(()=>true),dependencyBytes:sum(f=>f.path.startsWith('node_modules/')),imageBytes:sum(f=>f.path.startsWith('assets/')),imageCount:all.filter(f=>f.path.startsWith('assets/')).length,screenshotBytes:sum(f=>f.path.startsWith('screenshots/')),qaBytes:sum(f=>f.path.startsWith('qa/')),excludingDependenciesBytes:sum(f=>!f.path.startsWith('node_modules/')),runtimeSourceDocsAndImagesBytes:sum(f=>!['node_modules/','screenshots/','qa/'].some(p=>f.path.startsWith(p))),netNewImageBytes:sum(f=>f.path.startsWith('assets/'))-old.imageBytes,newImageCount:13,projectGrowthSinceV3Bytes:sum(()=>true)-old.projectBytes,assetFiles:all.filter(f=>f.path.startsWith('assets/')).map(f=>({name:f.path,bytes:f.bytes}))};
 const base={project:record.projectBytes,qa:record.qaBytes,without:record.excludingDependenciesBytes,growth:record.projectGrowthSinceV3Bytes};let recordBytes=0,serialized;
 for(let i=0;i<10;i++){record.projectBytes=base.project+recordBytes;record.qaBytes=base.qa+recordBytes;record.excludingDependenciesBytes=base.without+recordBytes;record.projectGrowthSinceV3Bytes=base.growth+recordBytes;serialized=JSON.stringify(record,null,2)+'\n';const next=Buffer.byteLength(serialized);if(next===recordBytes)break;recordBytes=next;}
 await fs.writeFile(output,serialized);
 const mib=n=>(n/1048576).toFixed(2),message=`新增图片 **${record.netNewImageBytes.toLocaleString('en-US')} B（${mib(record.netNewImageBytes)} MiB）**，13 张；全部 35 张图片 ${mib(record.imageBytes)} MiB。运行源码、文档和素材 ${mib(record.runtimeSourceDocsAndImagesBytes)} MiB；整个项目 **${mib(record.projectBytes)} MiB**，其中依赖 ${mib(record.dependencyBytes)} MiB，含历史截图和 QA；不含依赖 ${mib(record.excludingDependenciesBytes)} MiB。精确字节数见 \`qa/project-size-v4.json\`。`;
 for(const p of ['README.md','PROJECT_STATUS.md']){const doc=await fs.readFile(p,'utf8');await fs.writeFile(p,doc.replace(/<!-- V4_SIZE_START -->[\s\S]*?<!-- V4_SIZE_END -->/,`<!-- V4_SIZE_START -->\n${message}\n<!-- V4_SIZE_END -->`));}
 if(previous===record.projectBytes)break;previous=record.projectBytes;
}
console.log(JSON.stringify({...record,assetFiles:undefined},null,2));
