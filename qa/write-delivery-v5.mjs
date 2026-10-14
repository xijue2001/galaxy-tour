import fs from 'node:fs/promises';
const perf=JSON.parse(await fs.readFile('qa/performance-v5.json','utf8'));
const tour=JSON.parse(await fs.readFile('qa/full-tour-v5.json','utf8'));
const motion=JSON.parse(await fs.readFile('qa/motion-v5.json','utf8'));
const measuredTour=1000*tour.benchmark.frames/tour.benchmark.milliseconds;
await fs.writeFile('README.md',`# 银河巡游 · 观测与想象

版本 **5.0.0**。中文／English／日本語，39 条独立资料：29 个地图目的地、太阳与八大行星及月球的10个局部实体。自动巡游仍为原六站。

## 启动

在项目目录运行 \`npm start\`，打开 [预览](http://127.0.0.1:4173/)。Node.js 20+；新环境先 \`npm ci\`。无构建步骤，服务仅监听本机。唯一依赖 Three.js **0.180.0**，附加模块同版本。修改后刷新，Ctrl+C 停止。

## 本轮观看方式

- [直接进入自由探索](http://127.0.0.1:4173/?time=160)：左上醒目的「返回银河全景」可从太阳系、局部天体或任何宇宙尺度返回银河，清除选中并关闭侧栏。
- 拖动旋转、滚轮／双指或 ＋／− 缩放。持续缩小按顺序进入：银河系 → 本星系群与近邻 → 室女座超星系团 → 拉尼亚凯亚 → 宇宙网 → 宇宙微波背景。也可直接使用尺度导航。
- 背景细小恒星与有轮廓的远方星系光点保持固定天空方向。银河转动更明显；行星公转为上一版的3倍、自转2倍，月球公转和同步自转一起2倍，暂停恢复不重置相位。
- 标记4.6秒呼吸与柔和扩散光环，悬停／焦点与选中更加清楚；动画不改变28px按钮或命中范围，减少动态模式使用静态高亮。
- 新增 M33、M81、M51、M87，连同 LMC、SMC、M31、Centaurus A 共八个外部星系。独立标记、三语内容、图片和定位；目录可按名称、别名、编号、类型筛选。
- 「太阳系总览」进入十个独立实体。点击实体或标签查看图片和介绍；定位后跟随当前位置，可停止跟随或回总览。大气、土星环、月球继承正确父节点。
- 原160秒巡游：太阳系 → Alpha Centauri → M45 → M42 → M1 → Sagittarius A* → 银河全景。每站约10秒介绍，暂停、跳过、重播、全屏、隐藏界面保留。巡游结束后动态继续。

三语切换保留相机、进度、暂停和选中。桌面侧栏、窄屏抽屉；图片按需加载并提供失败／重试。Space暂停，R重播，H隐藏／恢复，I性能面板，F全屏，Esc关闭面板。

## 科学边界与性能

银河结构仍使用观测重建模型 \`MW-reconstruction-2026.2\`，固定种子731927。真实距离与展示布局分开，轨道为压缩近圆示意，初始相位不是当前星历。背景匿名星系与宇宙网是艺术概念图，不冒充观测目录。

本星系群在室女座**超星系团**外围，不属于室女座**星系团**。拉尼亚凯亚主图采用NRAO发布的2014密度／速度场重建，边界依赖流场模型。最后的Planck2018微波背景是过去天空的二维投影，不是宇宙外壳。图像颜色含义与完整署名：[COSMIC_SOURCES.md](COSMIC_SOURCES.md)。真实／展示运动周期及既有图片：[MOTION_SOURCES.md](MOTION_SOURCES.md)。

流畅／均衡／精细档保留批量星点、HalfFloat离屏MSAA、SMAA与OutputPass。切换清空性能样本，120帧后重测；帧率是浏览器绘制回调节奏，绘制调用包含后处理，均不是GPU耗时。实测与边界见 [PROJECT_STATUS.md](PROJECT_STATUS.md)。

<!-- V5_SIZE_START -->
体积统计见 \`qa/project-size-v5.json\`。
<!-- V5_SIZE_END -->

[新版连续截图与尺度视图](http://127.0.0.1:4173/motion.html) · [旧版视觉对比](http://127.0.0.1:4173/comparison.html) · [39条目录](CATALOG.md) · [科学资料](SCIENCE_SOURCES.md)

## 继续开发

\`src/cosmic-scales.js\` 管理尺度、淡化和概念几何；\`src/deep-sky.js\` 管理批量天空背景；\`src/nearby-galaxies.js\` 管理新增三语资料。\`src/motion.js\` 管理时钟与速度，\`src/solar-scene.js\` 管理层级和拾取；\`src/app.js\` 管理相机、探索、侧栏、后处理与采样。

\`npm run check\` 验证翻译、坐标、缓冲、随机复现、六站镜头、搜索、独立命中、时钟、父节点、月球同步、连续尺度权重与稳定背景。\`node qa/measure-size.mjs\` 更新逻辑文件字节统计；新增资源可用 \`node qa/download-v5-assets.mjs\` 复现。
`);
await fs.writeFile('PROJECT_STATUS.md',`# PROJECT_STATUS

更新：2026-10-14；版本 **5.0.0**。已实现、运行并完成真实浏览器检查。

- 预览：http://127.0.0.1:4173/；启动 \`npm start\`。仅依赖 Three.js 0.180.0。
- 39条三语资料／29个独立地图目标／10个太阳系实体。新增 M33、M81、M51、M87；原六站160秒未变。
- 更快的物理运动和900–1000ms定位／返回；地球相位用于太阳系巡游构图，重播不重置运动。月球同步、暂停位置完全冻结、恢复连续。
- 背景6000／10000／14000个程序恒星点与140／260／260个匿名星系光点。4.6秒标记光点／光环呼吸，28px命中区稳定；窄屏默认编号简称，选中完整名称。
- 六级连续缩放、快捷导航、醒目返回银河按钮。NRAO2014拉尼亚凯亚重建图与ESA Planck2018微波图按需加载；密度、温度颜色与模型边界均说明。

## 实测与验证

Chromium / WebGL2 / ANGLE D3D11，NVIDIA RTX4060Ti，1280×720；下列各档清空旧采样后记录至少120帧。

| 场景 | 画质 | FPS | 平均／P95 ms | 绘制调用 |
| --- | --- | ---: | --- | ---: |
${perf.map(p=>`| ${p.scene==='galaxy'?'银河全景':'宇宙网'} | ${p.quality} | ${p.fps.toFixed(2)} | ${p.frameMean.toFixed(2)} / ${p.p95.toFixed(2)} | ${p.drawCalls} |`).join('\n')}

完整巡游独立记录：${tour.benchmark.frames}帧／${(tour.benchmark.milliseconds/1000).toFixed(4)}秒有效样本，平均${measuredTour.toFixed(2)}FPS；无暂停、无跳转，完成且uninterrupted为true，全部六站和拉远阶段都有帧记录。之后场景时钟继续至${tour.sceneTime.toFixed(2)}秒。两组浏览器回调节奏不同，分别保留；不据此推断GPU瓶颈。

- 持续点击缩小经过六级至CMB，跨级权重连续；从CMB和太阳系返回银河正常，选中／跟随清除。
- 新增四个星系共12组三语侧栏逐条点击，图片、参数、名称对应正确。
- 390×844的三语导航无横向溢出；缩放层级在窗口变化后保持，八个外部标记可见。
- 月球同一面朝地球，跟随相机连续；暂停前后时间和位置完全相等。
- 正常浏览器控制台及应用错误为零。新增GLSL实际编译通过；所有画质正常。
- \`npm run check\` 通过：模型／内容与有限缓冲验证、1325目录／命中断言、379时钟／月球／父节点断言、1251连续尺度／背景断言。

原始记录：\`qa/full-tour-v5.json\`、\`performance-v5.json\`、\`scales-v5.json\`、\`continuous-zoom-v5.json\`、\`new-galaxies-v5.json\`、\`mobile-v5.json\`、\`motion-v5.json\`、\`checks-v5.txt\`。地球连续截图相位：${motion.sequence.map(d=>d.sceneTime.toFixed(2)).join(' / ')}秒。

<!-- V5_SIZE_START -->
统计见 \`qa/project-size-v5.json\`。
<!-- V5_SIZE_END -->

[截图页](http://127.0.0.1:4173/motion.html) · [目录](CATALOG.md) · [新增科学及素材来源](COSMIC_SOURCES.md) · [完整运动／素材署名](MOTION_SOURCES.md)。

后续：可接入真实星系流场目录与精确轨道、GPU计时。当前大尺度程序几何是概念图，研究图为二维截面，CMB为全天投影；显示尺度不能测距，背景光点不是实测天空目录。
`);
const cards=(files)=>files.map(([file,label])=>`<figure><a href="/screenshots/v5/${file}"><img src="/screenshots/v5/${file}" loading="lazy" alt="${label}"></a><figcaption>${label}</figcaption></figure>`).join('');
const earth=motion.sequence.map((d,i)=>['earth-'+(i+1)+'.jpg',`Earth / 地球 / 地球 · ${d.sceneTime.toFixed(2)}s · lunar facing ${d.bodyMotion.moonFacingDot.toFixed(6)}`]);
const scales=[['galaxy.jpg','银河系 / Milky Way / 銀河系'],['scale-1.jpg','本星系群与近邻 / Local Group & neighbours / 局所銀河群と近隣'],['scale-2.jpg','室女座超星系团 / Virgo Supercluster / おとめ座超銀河団'],['scale-3.jpg','拉尼亚凯亚 · NRAO 2014 / Laniakea / ラニアケア'],['scale-4.jpg','宇宙网 · 概念示意 / Cosmic web / 宇宙の大規模構造'],['scale-5.jpg','Planck 2018 · 宇宙微波背景 / CMB / 宇宙マイクロ波背景'],['mobile-galaxies.jpg','390×844 · 八个外部星系 / Eight external galaxies / 8つの外部銀河']];
await fs.writeFile('motion.html',`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>银河巡游5.0 · 实际画面 / Browser captures / 実際の画面</title><style>body{margin:0;background:#07101b;color:#d9e4f1;font:14px/1.8 system-ui,sans-serif}main{max-width:1300px;margin:35px auto;padding:0 24px}h1,h2{font-weight:400}a{color:#c7d9ee}nav{display:flex;gap:24px;flex-wrap:wrap}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px}figure{margin:0;background:#101c2b;border-radius:6px;overflow:hidden}img{display:block;width:100%;height:auto}figcaption{padding:12px 16px;font-size:12px;color:#adc0d6}p{color:#9dadc1}</style><main><nav><a href="/?time=160">观看作品 / Preview / 作品を見る</a><a href="/PROJECT_STATUS.md">实测 / Measurements / 測定</a><a href="/COSMIC_SOURCES.md">来源 / Sources / 出典</a><a href="/comparison.html">旧版对比 / Previous comparison / 旧版比較</a></nav><h1>银河巡游 5.0 · 实际浏览器画面</h1><p>连续地球截图，相机跟随当前位置，时间与尺寸经过展示调整。<br>Sequential Earth captures with a tracking camera; time and scale are display-adjusted.<br>地球の現在位置を追尾する連続画像。時間と尺度は表示用に調整しています。</p><div class="grid">${cards(earth)}</div><h2>六级宇宙尺度 / Six cosmic scales / 六段階の宇宙尺度</h2><p>程序化结构是概念示意，NRAO图是2014科学流场重建；Planck图是全天温度投影，不是宇宙外壳。<br>Procedural structures are conceptual, NRAO shows a 2014 scientific flow reconstruction, and Planck shows all-sky temperature anisotropies, not a cosmic shell.</p><div class="grid">${cards(scales)}</div></main></html>`);
console.log('Updated v5 README, status and screenshot gallery.');
