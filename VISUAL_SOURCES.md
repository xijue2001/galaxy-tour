# 视觉标准与素材来源 · 3.0

核对日期：2026-10-13。下载官方页面所提供的中尺寸原始 JPEG，保留完整署名；没有大型模型、音频或远程字体。

## 形态标准与展示方法

- 太阳：参考 [NSO 光球](https://nso.edu/for-public/sun-science/photosphere/) 和 [Inouye 粒状斑/黑子观测](https://nso.edu/press-release/new-images-released-by-nsfs-inouye-solar-telescope/)。球面颗粒、暗色本影/半影、临边变暗和克制的光晕为程序化示意，不是当日活动实况。
- 地球：[NASA Blue Marble](https://visibleearth.nasa.gov/images/57730/the-blue-marble)，使用 [2048×1024 球面资源](https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57730/land_ocean_ice_2048.jpg)，NASA/Goddard Space Flight Center / Reto Stöckli。其余行星为程序化的岩石/云带近似，轨道不表示当前星历。
- 半人马座：采用 [Kervella A/B 半径](https://doi.org/10.1051/0004-6361/201629505) 与 [Proxima 系统参数](https://www.aanda.org/articles/aa/pdf/2017/02/aa29930-16.pdf)，半径比约 1.22:0.86:0.15；A 暖白、B 更暖、比邻星红色且小。真实成员间距强烈压缩，表面活动是示意。
- 昴星团：IAU 观测照片保留亮星周围蓝色反射云纱与外层尘埃，程序化前景星补充有限视差。
- 猎户座：Hubble 观测拼接图保留明亮腔体、不对称气体翼和暗湾，移除原先规则尘埃条带。
- 蟹状星云：依据 [NASA 主参考](https://science.nasa.gov/asset/hubble/crab-nebula-3/) 和同一 Hubble 马赛克，保留不规则外围手指、宽窄/断续细丝、暗腔和内部辉光，完全移除规则椭球折线壳。脉冲星指示是局部代表位置。
- 新目标：各自使用对应观测图，保留柱体、悬崖、马头暗轮廓、环壳、双极翼、环状细丝或球状星团密度等形态差异。图片没有被称为真实三维扫描。

观测图以三层浅位移网格展示：原图主层、少量背景气体和颜色选取的前景层，共享大尺度轮廓。柔化边缘并去除暗背景，只有辅助层做小于 1.5% 的缓慢亮度变化。限制观察角度与缩放，避免从背面穿过图层。深度属于艺术性重建，不是距离测量；多波段颜色按原图说明解释。

## 抗锯齿诊断

旧版问题来自完整输出链路：48×32 球面（流畅 32×24）、180 段 LineBasic 轨道、DPR 1/1.25/1.5，以及两个 samples=0 的离屏 HalfFloat RenderTarget。仅给屏幕 renderer 设置 antialias 不会修复已进入离屏纹理的边缘。

本版球面 64×48 / 128×96 / 192×128，轨道是 720 段薄环面网格；画布和两个场景 RenderTarget 统一使用实际整数物理像素。场景 MSAA resolve 后进行混合、轻度辉光和暗角，均衡/精细再执行 SMAA，最后 OutputPass。[Three.js RenderTarget 文档](https://threejs.org/docs/pages/RenderTarget.html)；r180 SMAAPass 源码要求线性颜色中工作、位于 OutputPass 前。SMAA 不替代球面细分或掩盖表面细节。

流畅：DPR 1、2× MSAA、无 SMAA/辉光；均衡：DPR 1.5、4× MSAA + SMAA；精细：DPR 2、4× MSAA + SMAA。根据设备 RGBA16F 实际可用采样数选取，当前电脑实测 4×。QA 参数 aa=off 可关闭两种 AA 做同视角比较。帧率是浏览器帧间隔测量，不是 GPU 耗时。

## 每个目标的图片、类型、署名和来源

### 太阳系 — solar-system

- 文件：assets/solar-system.jpg；419,103 B。
- 图像类别：艺术示意图。太阳系天体的艺术排列。大小和距离不按同一比例，不能视为一张全景照片。
- 完整署名：NASA/JPL-Caltech
- [原始官方页面](https://science.nasa.gov/image-detail/solar-system-model/)；[直接资源](https://science.nasa.gov/wp-content/uploads/2023/06/solar-system-model.jpg)。

### 半人马座 α 恒星系统 — alpha-centauri

- 文件：assets/alpha-centauri.jpg；79,327 B。
- 图像类别：光学与近红外观测图。哈勃 WFPC2：A 在左，B 在右。滤镜数据合成显示颜色；光条属于成像效应。此图没有比邻星。
- 完整署名：ESA/Hubble & NASA
- [原始官方页面](https://esahubble.org/images/potw1635a/)；[直接资源](https://cdn.esahubble.org/archives/images/screen/potw1635a.jpg)。

### 昴星团 · M45 — pleiades

- 文件：assets/pleiades.jpg；384,789 B。
- 图像类别：可见光观测图。2021 年于埃及拍摄、由 IAU 发布的昴星团观测照片。尘埃散射蓝色星光，反射云纱围绕亮星，并与更暗的尘埃结构相连；光条属于成像效应。
- 完整署名：Mohamed Usama/IAU OAE
- [原始官方页面](https://iauarchive.eso.org/public/images/detail/ann22042ab/)；[直接资源](https://iauarchive.eso.org/static/archives/images/screen/ann22042ab.jpg)。

### 猎户座大星云 · M42 — orion-nebula

- 文件：assets/orion-nebula.jpg；218,524 B。
- 图像类别：多滤镜观测拼接图。哈勃与地面望远镜数据的拼接。可见光及近红外滤镜映射为颜色，区分发光气体、恒星和暗尘埃。
- 完整署名：NASA, ESA, M. Robberto (Space Telescope Science Institute/ESA) and the Hubble Space Telescope Orion Treasury Project Team
- [原始官方页面](https://esahubble.org/images/heic0601a/)；[直接资源](https://cdn.esahubble.org/archives/images/screen/heic0601a.jpg)。

### 蟹状星云 · M1 — crab-nebula

- 文件：assets/crab-nebula.jpg；451,157 B。
- 图像类别：窄带观测合成图。哈勃 WFPC2 的窄带合成。氧和硫等气体谱线映射为显示颜色；它们强调不同气体细丝，不代表裸眼颜色。
- 完整署名：NASA, ESA and Allison Loll/Jeff Hester (Arizona State University). Acknowledgement: Davide De Martin (ESA/Hubble)
- [原始官方页面](https://esahubble.org/images/heic0515a/)；[直接资源](https://cdn.esahubble.org/archives/images/screen/heic0515a.jpg)。

### 银河中心 · Sagittarius A* — sagittarius-a

- 文件：assets/sagittarius-a.jpg；62,877 B。
- 图像类别：射电观测重建图。2022 年公布的 EHT 图像，来自 2017 年 1.3 毫米射电观测。橙色表示射电亮度，不是可见光颜色；这是多次重建的平均图像。
- 完整署名：EHT Collaboration
- [原始官方页面](https://www.eso.org/public/images/eso2208-eht-mwa/)；[直接资源](https://cdn.eso.org/images/screen/eso2208-eht-mwa.jpg)。

### 鹰状星云 · M16／创生之柱 — eagle-nebula

- 文件：assets/eagle-nebula.jpg；489,369 B。
- 图像类别：红外观测合成图。韦布 NIRCam 与 MIRI 红外合成；显示色分别强调恒星与尘埃。
- 完整署名：NASA, ESA, CSA, STScI, J. DePasquale (STScI), A. Pagan (STScI), A. M. Koekemoer (STScI)
- [原始官方页面](https://esawebb.org/images/pillarsofcreation_composite/)；[直接资源](https://cdn.esawebb.org/archives/images/screen/pillarsofcreation_composite.jpg)。

### 船底座 NGC 3324／宇宙悬崖 — carina-cliffs

- 文件：assets/carina-cliffs.jpg；291,704 B。
- 图像类别：红外观测合成图。韦布 NIRCam 红外观测；金色云壁与蓝色空洞为波段映射色。
- 完整署名：NASA, ESA, CSA, and STScI
- [原始官方页面](https://esawebb.org/images/weic2205a/)；[直接资源](https://cdn.esawebb.org/archives/images/screen/weic2205a.jpg)。

### 礁湖星云 · M8 — lagoon-nebula

- 文件：assets/lagoon-nebula.jpg；412,569 B。
- 图像类别：红外观测合成图。ESO VISTA 近红外合成；图像强调嵌入恒星与尘埃轮廓，并非裸眼颜色。
- 完整署名：ESO/VVV Acknowledgment: Cambridge Astronomical Survey Unit
- [原始官方页面](https://www.eso.org/public/images/eso1101a/)；[直接资源](https://cdn.eso.org/images/screen/eso1101a.jpg)。

### 三叶星云 · M20 — trifid-nebula

- 文件：assets/trifid-nebula.jpg；354,895 B。
- 图像类别：可见光观测合成图。ESO WFI 可见光合成：红色发射区、蓝色反射区与暗带可同时辨认。
- 完整署名：ESO
- [原始官方页面](https://www.eso.org/public/images/eso0930a/)；[直接资源](https://cdn.eso.org/images/screen/eso0930a.jpg)。

### 马头星云 · Barnard 33 — horsehead-nebula

- 文件：assets/horsehead-nebula.jpg；327,157 B。
- 图像类别：可见光观测合成图。ESO VLT B/V/R 可见光合成；暗马头遮挡了背景星光与气体发光。
- 完整署名：ESO
- [原始官方页面](https://www.eso.org/public/images/eso0202a/)；[直接资源](https://cdn.eso.org/images/screen/eso0202a.jpg)。

### 玫瑰星云／NGC 2244 — rosette-nebula

- 文件：assets/rosette-nebula.jpg；529,869 B。
- 图像类别：可见光观测合成图。ESO/S. Brunier 可见光宽视场照片；发射气体包围中央 NGC 2244。
- 完整署名：ESO/S. Brunier
- [原始官方页面](https://www.eso.org/public/images/b12/)；[直接资源](https://cdn.eso.org/images/screen/b12.jpg)。

### 天鹅／欧米伽星云 · M17 — omega-nebula

- 文件：assets/omega-nebula.jpg；582,928 B。
- 图像类别：可见光观测合成图。ESO VST 多滤镜观测合成；密集恒星场与发射云弧共同呈现。
- 完整署名：ESO/INAF-VST/OmegaCAM. Acknowledgement: OmegaCen/Astro-WISE/Kapteyn Institute
- [原始官方页面](https://www.eso.org/public/images/eso1119a/)；[直接资源](https://cdn.eso.org/images/screen/eso1119a.jpg)。

### 螺旋星云 · NGC 7293 — helix-nebula

- 文件：assets/helix-nebula.jpg；152,243 B。
- 图像类别：可见光观测合成图。ESO WFI 蓝、绿、红滤镜合成；壳层与中央淡弱气体颜色不同。
- 完整署名：ESO
- [原始官方页面](https://www.eso.org/public/images/eso0907a/)；[直接资源](https://cdn.eso.org/images/screen/eso0907a.jpg)。

### 环状星云 · M57 — ring-nebula

- 文件：assets/ring-nebula.jpg；181,669 B。
- 图像类别：可见光观测合成图。哈勃 WFC3 发射线合成；颜色区分不同气体辐射。
- 完整署名：NASA, ESA, and C. Robert O’Dell (Vanderbilt University).
- [原始官方页面](https://esahubble.org/images/heic1310a/)；[直接资源](https://cdn.esahubble.org/archives/images/screen/heic1310a.jpg)。

### 蝴蝶星云 · NGC 6302 — butterfly-nebula

- 文件：assets/butterfly-nebula.jpg；315,102 B。
- 图像类别：可见光观测合成图。哈勃 WFC3 多发射线合成；中央暗腰与两翼具有不同密度和辐射。
- 完整署名：NASA, ESA and the Hubble SM4 ERO Team
- [原始官方页面](https://esahubble.org/images/heic0910h/)；[直接资源](https://cdn.esahubble.org/archives/images/screen/heic0910h.jpg)。

### 猫眼星云 · NGC 6543 — cats-eye-nebula

- 文件：assets/cats-eye-nebula.jpg；185,472 B。
- 图像类别：可见光观测合成图。哈勃观测合成；中心结构与淡弱环壳都来自观测，展示深度另行重建。
- 完整署名：ESA , NASA , HEIC and The Hubble Heritage Team ( STScI / AURA )
- [原始官方页面](https://esahubble.org/images/heic0414a/)；[直接资源](https://cdn.esahubble.org/archives/images/screen/heic0414a.jpg)。

### 面纱星云／天鹅座环 — veil-nebula

- 文件：assets/veil-nebula.jpg；292,274 B。
- 图像类别：可见光观测合成图。哈勃 WFC3 五滤镜合成；蓝色主要突出氧，红色突出氢与氮的辐射。
- 完整署名：ESA/Hubble & NASA, Z. Levay
- [原始官方页面](https://esahubble.org/images/potw2113a/)；[直接资源](https://cdn.esahubble.org/archives/images/screen/potw2113a.jpg)。

### 英仙座双星团 · NGC 869／884 — double-cluster

- 文件：assets/double-cluster.jpg；512,920 B。
- 图像类别：可见光观测合成图。ESO/S. Brunier 可见光照片同时覆盖两座星团。
- 完整署名：ESO/S. Brunier
- [原始官方页面](https://www.eso.org/public/images/b02/)；[直接资源](https://cdn.eso.org/images/screen/b02.jpg)。

### 武仙座球状星团 · M13 — hercules-cluster

- 文件：assets/hercules-cluster.jpg；1,011,888 B。
- 图像类别：可见光观测合成图。哈勃 ACS 蓝、红及近红外滤镜合成；近红外映射为红色。
- 完整署名：ESA/Hubble and NASA
- [原始官方页面](https://esahubble.org/images/potw1011a/)；[直接资源](https://cdn.esahubble.org/archives/images/screen/potw1011a.jpg)。

### 半人马座 ω · NGC 5139 — omega-centauri

- 文件：assets/omega-centauri.jpg；652,467 B。
- 图像类别：可见光观测合成图。ESO VST/OmegaCAM 广域多滤镜观测；点状恒星保持独立细节。
- 完整署名：ESO/INAF-VST/OmegaCAM. Acknowledgement: A. Grado, L. Limatola /INAF-Capodimonte Observatory
- [原始官方页面](https://www.eso.org/public/images/eso1119b/)；[直接资源](https://cdn.eso.org/images/screen/eso1119b.jpg)。

全部天体图片共 7,908,303 B；地球纹理另计。

使用说明：[NASA](https://www.nasa.gov/nasa-brand-center/images-and-media/)、[ESO](https://www.eso.org/public/outreach/copyright/)、[ESA/Hubble](https://esahubble.org/copyright/)、[ESA/Webb](https://esawebb.org/copyright/)、[IAU](https://www.iau.org/copyright/)。署名在侧栏始终保留；摄影作者/第三方素材遵从对应页面条款。此作品未获上述机构背书。

## 4.0 补充

太阳系十个独立对象与四个外部星系的对应观测图、完整署名、资源地址、真实/展示周期见 [MOTION_SOURCES.md](MOTION_SOURCES.md)。地球图片复用，新增 13 张中小尺寸图片；它们按需用于侧栏，四个星系还按需用于星系环境。

## 5.1 黑洞近景与图例

近景为代码生成的艺术性吸积流与光弯曲示意，参考 [NASA Goddard 的黑洞光弯曲解释](https://www.nasa.gov/universe/nasa-visualization-shows-a-black-holes-warped-world/)／[SVS 13326](https://svs.gsfc.nasa.gov/13326)。没有下载或复用NASA模拟影片。盘倾角、尺寸、发光细节为展示选择，并不是实测Sgr A*几何，也不是广义相对论射线追踪。侧栏继续使用原EHT Collaboration射电观测重建图及署名。

遮挡与发光由同一个面片在星场之后作正常透明合成，核心遮挡不透明；所有角向函数周期闭合，避免atan边界接缝。中心UI光点移除；图例开关隐藏光点、文字与引线，目录仍独立可用。
