import fs from 'node:fs/promises';
const qa=JSON.parse(await fs.readFile('qa/visual-fixes-v5-1.json','utf8'));
let readme=await fs.readFile('README.md','utf8');readme=readme.replace('版本 **5.0.0**','版本 **5.1.0**');
if(!readme.includes('## 5.1 视觉修复'))readme=readme.replace('## 本轮观看方式',`## 5.1 视觉修复

- 左上「隐藏图例／显示图例」单独控制光点、名称与引线，并记住上次选择。隐藏时目录与太阳系实体点击仍可用，不影响播放、相机和语言状态。
- 黑洞近景改为倾斜吸积流、上方光弯曲亮弧与暗影，消除中央漏星、非周期角度造成的接缝及中心UI光点。流动与亮度细节是艺术示意，侧栏保留EHT真实射电重建及完整署名。
- [修改前后截图](http://127.0.0.1:4173/motion.html)。没有新增素材或依赖。参考：[NASA黑洞光弯曲说明](https://www.nasa.gov/universe/nasa-visualization-shows-a-black-holes-warped-world/)。不是相对论射线追踪，也不宣称这是Sgr A*的实测盘倾角。

## 本轮观看方式`);
await fs.writeFile('README.md',readme);
let status=await fs.readFile('PROJECT_STATUS.md','utf8');status=status.replace('版本 **5.0.0**','版本 **5.1.0**');
if(!status.includes('## 5.1 本轮验收'))status=status.replace('## 实测与验证',`## 5.1 本轮验收

- 图例隐藏／恢复、三语按钮、刷新记忆通过；隐藏后可从目录打开银心介绍，恢复后23个当前视野内标记重新可点。
- 黑洞自动巡游停留段和自由探索均检查；中央暗影、正常透明合成、亮弧接缝与无中心图例通过真实画面验证。
- 390×844中英日无横向溢出；三档黑洞近景均无控制台／应用错误。1280×720、暂停动态时的浏览器回调FPS：${qa.blackholeQualities.map(q=>q.quality+' '+q.fps.toFixed(2)).join(' / ')}，绘制调用${qa.blackholeQualities.map(q=>q.drawCalls).join(' / ')}。不代表GPU耗时或完整巡游性能。
- 原始记录：\`qa/visual-fixes-v5-1.json\`、\`mobile-fixes-v5-1.json\`；检查通过记录 \`qa/checks-v5-1.txt\`；新增截图 \`screenshots/v5/markers-before/after.jpg\`、\`blackhole-before/after/clean.jpg\`。
- 本轮没有新增图片或依赖。下面的六级尺度与完整巡游性能是5.0保留记录。

## 5.0 实测与验证`);
await fs.writeFile('PROJECT_STATUS.md',status);
let sources=await fs.readFile('VISUAL_SOURCES.md','utf8');if(!sources.includes('## 5.1 黑洞近景'))sources+=`\n## 5.1 黑洞近景与图例\n\n近景为代码生成的艺术性吸积流与光弯曲示意，参考 [NASA Goddard 的黑洞光弯曲解释](https://www.nasa.gov/universe/nasa-visualization-shows-a-black-holes-warped-world/)／[SVS 13326](https://svs.gsfc.nasa.gov/13326)。没有下载或复用NASA模拟影片。盘倾角、尺寸、发光细节为展示选择，并不是实测Sgr A*几何，也不是广义相对论射线追踪。侧栏继续使用原EHT Collaboration射电观测重建图及署名。\n\n遮挡与发光由同一个面片在星场之后作正常透明合成，核心遮挡不透明；所有角向函数周期闭合，避免atan边界接缝。中心UI光点移除；图例开关隐藏光点、文字与引线，目录仍独立可用。\n`;
await fs.writeFile('VISUAL_SOURCES.md',sources);
let gallery=await fs.readFile('motion.html','utf8');if(!gallery.includes('V5_1_FIXES')){const cards=[['markers-before.jpg','图例 · 修改前 / Markers before'],['markers-after.jpg','图例 · 隐藏后 / Markers hidden'],['blackhole-before.jpg','黑洞 · 修改前 / Black hole before'],['blackhole-after.jpg','黑洞 · 修改后 / Black hole after']].map(([file,name])=>`<figure><a href="/screenshots/v5/${file}"><img src="/screenshots/v5/${file}" alt="${name}"></a><figcaption>${name}</figcaption></figure>`).join('');gallery=gallery.replace('<h1>银河巡游 5.0 · 实际浏览器画面</h1>',`<h1>银河巡游 5.1 · 实际浏览器画面</h1><!-- V5_1_FIXES --><h2>本轮同视角对比 / Before &amp; after / 今回の比較</h2><div class="grid" style="grid-template-columns:repeat(2,minmax(0,1fr))">${cards}</div><p>黑洞实时画面是艺术性吸积流与光弯曲示意；侧栏为真实EHT射电观测重建。<br>The live black-hole view is an artistic accretion and light-bending illustration; the sidebar shows the actual EHT radio reconstruction.<br>実時間のブラックホール画面は降着流と光の曲がりの芸術的模式表現で、サイドバーはEHT電波観測の再構成画像です。</p><h2>5.0 保留记录 / Previous captures / 以前の記録</h2>`);}
await fs.writeFile('motion.html',gallery);
console.log('Updated 5.1 documentation and comparisons.');
