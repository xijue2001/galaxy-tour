# 运动参数与新增素材 · 5.0

核对日期：2026-10-14。真实参数和展示速度分开保存于 `src/motion.js` 与内容数据。

## 时间与运动模型

- 独立场景时钟只累计前台、未暂停的帧；单步上限 80 ms。页面恢复、暂停恢复建立新时间戳，不补播后台时间。巡游时间仍单独控制 160 秒的相机路线。重播、切换对象和画质不重置物理相位。
- 银河本体的展示角速度 0.008 rad/s（约 13.1 分钟一圈）。这是视觉演示，不是银河的真实差动旋转：太阳轨道真实约 2.3 亿年。背景星场和自由相机固定；内部锚点使用旋转组的实时矩阵；八个外部星系属于独立稳定坐标组。
- 行星的公转使用近圆、同向、近共面的示意轨道；压缩距离不对应统一 AU 比例，初始相位不对应当前日期。自转轴保留主要倾角差异，金星与天王星的逆行通过超过 90° 的轴倾表达。不同天体的展示周期分别调整，不是统一时间倍率。
- 月球父层位于地球平移节点下，独立于地球每日自转。轨道节点转动同时携带月面朝向，因此同一面始终朝地球（没有模拟天平动）。月球轨道面倾斜约 5.1°；月球自身轴倾未精确重建。
- 半人马座 A/B 使用固定质心附近的压缩圆轨道，真实周期约 79.9 年、展示 600 s；真实椭圆轨道未求解。比邻星的分离距离强烈压缩，其位置保持固定，表面缓慢自转。参见 [Kervella et al.](https://www.aanda.org/articles/aa/pdf/2017/02/aa29930-16.pdf)。
- 星云保持观测图轮廓；仅辅助深度层作小于 1.5% 的缓慢亮度变化，不套用整体自转。
- 标记反馈是独立 CSS 动效：4.6 秒周期、错开相位；只作用于点光和光晕，不缩放按钮。系统减少动态偏好使用静态高亮。暂停动态冻结天体运动，标记反馈仍可用于交互。

## 真实周期与展示周期

[NASA 太阳事实](https://science.nasa.gov/sun/facts/)、[NASA 月球事实](https://science.nasa.gov/moon/facts/)、[NASA Planetary Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/)及各行星 facts 页面。太阳为差动旋转，本场景简化为均匀旋转；表中使用近似恒星日与恒星年，不用太阳日。

| 对象 | 真实自转 h | 真实公转 d | 科学轨道距离 | 展示自转 s | 展示公转 s | 展示半径 / 轨道半径 |
| --- | ---: | ---: | --- | ---: | ---: | --- |
| sun | 600–864（25–36 d） | — | 原点 | 180 | — | 1.15 / 0 |
| mercury | 1407.6 | 88 | 0.387 AU | 270 | 100 | 0.075 / 2.2 |
| venus | 5832.5 | 224.7 | 0.723 AU | 390 | 160 | 0.19 / 3.8 |
| earth | 23.934 | 365.2 | 1 AU | 90 | 240 | 0.34 / 5.8 |
| moon | 655.7 | 27.3 | 385000 km（地心） | 30 | 30 | 0.093 / 0.91 |
| mars | 24.623 | 687 | 1.524 AU | 97.5 | 360 | 0.14 / 7.6 |
| jupiter | 9.925 | 4331 | 5.203 AU | 45 | 600 | 0.67 / 10.6 |
| saturn | 10.7 | 10747 | 9.537 AU | 60 | 800 | 0.54 / 14 |
| uranus | 17.24 | 30589 | 19.19 AU | 75 | 1066.6666666666667 | 0.3 / 18 |
| neptune | 16.11 | 59800 | 30.07 AU | 80 | 1333.3333333333333 | 0.29 / 22 |

地球大气属于 earth-axis；土星环属于 saturn-axis；月球属于地球平移节点。点击仅对十个表面网格进行射线检测，辉光、大气与环不参与争抢命中；另有 28 px 标签和 18 px 小天体宽松命中。

## 外部星系与科学方向

LMC ≈ 163,000 ly、SMC ≈ 200,000 ly、M31 ≈ 2,500,000 ly、Centaurus A ≈ 12,000,000 ly。距离均为所采用资料的近似值；特别是矮星系本身有深度，不存在所有恒星相同的一个距离。
[NASA 麦哲伦云](https://science.nasa.gov/missions/hubble/hubble-detects-protective-shield-defending-a-pair-of-dwarf-galaxies/)、[NASA M31 / GALEX](https://science.nasa.gov/photojournal/andromeda/)、[NASA Centaurus A](https://science.nasa.gov/image-article/apod-2023-may-3-centaurus-a-a-peculiar-island-of-stars/)。
- Large Magellanic Cloud：近似银经/银纬 280.47° / -32.89°，展示位置 [5, -85, -155]；[SIMBAD 代表中心方向](https://simbad.cds.unistra.fr/simbad/sim-id?Ident=LMC)。
- Small Magellanic Cloud：近似银经/银纬 302.8° / -44.3°，展示位置 [-70, -160, -210]；[SIMBAD 代表中心方向](https://simbad.cds.unistra.fr/simbad/sim-id?Ident=SMC)。
- Andromeda Galaxy · M31：近似银经/银纬 121.17° / -21.57°，展示位置 [210, -125, 290]；[SIMBAD 代表中心方向](https://simbad.cds.unistra.fr/simbad/sim-id?Ident=M31)。
- Centaurus A · NGC 5128：近似银经/银纬 309.52° / 19.42°，展示位置 [-310, 170, -310]；[SIMBAD 代表中心方向](https://simbad.cds.unistra.fr/simbad/sim-id?Ident=NGC%205128)。
- Triangulum Galaxy · M33：近似银经/银纬 133.61° / -31.33°，展示位置 [340, -80, 200]；[SIMBAD 代表中心方向](https://simbad.cds.unistra.fr/simbad/sim-id?Ident=M33)。
- Bode’s Galaxy · M81：近似银经/银纬 142.09° / 40.9°，展示位置 [260, 190, -160]；[SIMBAD 代表中心方向](https://simbad.cds.unistra.fr/simbad/sim-id?Ident=M81)。
- Whirlpool Galaxy · M51：近似银经/银纬 104.85° / 68.56°，展示位置 [-110, 270, 330]；[SIMBAD 代表中心方向](https://simbad.cds.unistra.fr/simbad/sim-id?Ident=M51)。
- Virgo A · M87：近似银经/银纬 283.78° / 74.49°，展示位置 [-340, 280, 170]；[SIMBAD 代表中心方向](https://simbad.cds.unistra.fr/simbad/sim-id?Ident=M87)。

星系环境布局强烈压缩，保留大致方向与上下半球，不表示星系真实相对大小或时间演化。观测图面向观察者，只提供浅层艺术视差。半人马座 A 是独立外部星系，与 Alpha Centauri 完全不同。

## 新增观测图片与完整署名

### 大麦哲伦云 · large-magellanic-cloud

- 文件：/assets/large-magellanic-cloud.jpg，342,018 bytes
- 类别：光学观测合成。大麦哲伦云宽视场可见光观测，呈现棒状恒星结构与恒星形成区域。
- 署名：NOIRLab/AURA/NSF
- [原始页面](https://noirlab.edu/public/images/noao-2123/) · [页面/API 提供的资源](https://storage.noirlab.edu/media/archives/images/screen/noao-2123.jpg)

### 小麦哲伦云 · small-magellanic-cloud

- 文件：/assets/small-magellanic-cloud.jpg，536,770 bytes
- 类别：波段映射合成。VISTA 红外波段合成；颜色经映射，较老恒星更加清晰。杜鹃座 47 是前景星团。
- 署名：ESO/VISTA VMC
- [原始页面](https://www.eso.org/public/images/eso1714a/) · [页面/API 提供的资源](https://cdn.eso.org/images/screen/eso1714a.jpg)

### 仙女座星系 M31 · andromeda

- 文件：/assets/andromeda.jpg，54,448 bytes
- 类别：波段映射合成。GALEX 远紫外与近紫外合成；蓝色突出年轻恒星，较暖色调代表不同紫外辐射比例。
- 署名：NASA/JPL-Caltech
- [原始页面](https://images.nasa.gov/details/PIA15416) · [页面/API 提供的资源](https://images-assets.nasa.gov/image/PIA15416/PIA15416~thumb.jpg)

### 半人马座 A · NGC 5128 · centaurus-a

- 文件：/assets/centaurus-a.jpg，343,027 bytes
- 类别：光学观测合成。ESO 可见光合成，突出恒星晕和横贯中心的尘埃带；不是射电喷流图像。
- 署名：ESO
- [原始页面](https://www.eso.org/public/images/eso1221a/) · [页面/API 提供的资源](https://cdn.eso.org/images/screen/eso1221a.jpg)

### 三角座星系 M33 · triangulum

- 文件：/assets/triangulum.jpg，341,728 bytes
- 类别：哈勃波段合成观测。哈勃拼接图覆盖中心及内旋臂，能分辨大量恒星；它不是整个星系的完整轮廓。
- 署名：NASA, ESA, and M. Durbin, J. Dalcanton, and B. F. Williams (University of Washington)
- [原始页面](https://esahubble.org/images/heic1901a/) · [页面/API 提供的资源](https://cdn.esahubble.org/archives/images/screen/heic1901a.jpg)

### 波德星系 M81 · bodes-galaxy

- 文件：/assets/bodes-galaxy.jpg，133,966 bytes
- 类别：哈勃波段合成观测。哈勃可见光和近红外合成显示较老的中央恒星、年轻星群及尘埃带。
- 署名：NASA, ESA and the Hubble Heritage Team (STScI/AURA); Acknowledgment: A. Zezas and J. Huchra (Harvard-Smithsonian Center for Astrophysics)
- [原始页面](https://esahubble.org/images/heic0710a/) · [页面/API 提供的资源](https://cdn.esahubble.org/archives/images/screen/heic0710a.jpg)

### 涡状星系 M51 · whirlpool

- 文件：/assets/whirlpool.jpg，221,167 bytes
- 类别：哈勃波段合成观测。哈勃图中蓝色为年轻星群，粉红色为发光气体区域，黄色中心主要由较老恒星构成。
- 署名：NASA, ESA, S. Beckwith (STScI) and the Hubble Heritage Team (STScI/AURA)
- [原始页面](https://esahubble.org/images/heic0506a/) · [页面/API 提供的资源](https://cdn.esahubble.org/archives/images/screen/heic0506a.jpg)

### 室女座 A · M87 · messier-87

- 文件：/assets/messier-87.jpg，222,160 bytes
- 类别：哈勃波段合成观测。这张哈勃图展示弥散恒星晕与蓝色喷流；它不是 EHT 的黑洞阴影图。
- 署名：NASA, ESA, A. Lessing (Stanford University), E. Baltz (Stanford University), M. Shara (American Museum of Natural History), and J. DePasquale (STScI)
- [原始页面](https://esahubble.org/images/heic2411b/) · [页面/API 提供的资源](https://cdn.esahubble.org/archives/images/screen/heic2411b.jpg)

### 太阳 · sun

- 文件：/assets/sun.jpg，103,944 bytes
- 类别：观测图像。SDO 的 450 nm 可见光光球观测帧；暗区是黑子。黄色是展示色调。
- 署名：NASA/Goddard Space Flight Center Scientific Visualization Studio, the SDO Science Team, and the Virtual Solar Observatory
- [原始页面](https://svs.gsfc.nasa.gov/3987/) · [页面/API 提供的资源](https://svs.gsfc.nasa.gov/vis/a000000/a003900/a003987/SDOAIA4500A_Jewelbox_stand.HD1080i.00100.jpg)

### 水星 · mercury

- 文件：/assets/mercury.jpg，28,534 bytes
- 类别：波段映射 / 处理合成。MESSENGER 增强色彩合成；颜色突出岩石成分差异，并非肉眼所见。
- 署名：NASA/Johns Hopkins University Applied Physics Laboratory/Carnegie Institution of Washington
- [原始页面](https://images.nasa.gov/details/PIA16853) · [页面/API 提供的资源](https://images-assets.nasa.gov/image/PIA16853/PIA16853~thumb.jpg)

### 金星 · venus

- 文件：/assets/venus.jpg，99,035 bytes
- 类别：波段映射 / 处理合成。Magellan 雷达数据制作的半球图，经过色彩编码；它显示地表而非可见光云顶。
- 署名：NASA/JPL/USGS
- [原始页面](https://images.nasa.gov/details/PIA00159) · [页面/API 提供的资源](https://images-assets.nasa.gov/image/PIA00159/PIA00159~thumb.jpg)

### 地球 · earth

- 文件：/assets/earth-blue-marble.jpg，266,599 bytes（复用旧素材）
- 类别：观测图像。NASA Blue Marble 多次卫星观测合成，使用球面素材呈现大陆与海洋。
- 署名：NASA/Goddard Space Flight Center/Reto Stöckli
- [原始页面](https://visibleearth.nasa.gov/images/57730/the-blue-marble) · [页面/API 提供的资源](https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57730/land_ocean_ice_2048.jpg)

### 月球 · moon

- 文件：/assets/moon.jpg，81,890 bytes
- 类别：观测图像。LRO 广角相机拍摄的月球正面马赛克；暗色月海与明亮撞击高地清楚可见。
- 署名：NASA/GSFC/Arizona State University
- [原始页面](https://images.nasa.gov/details/PIA14011) · [页面/API 提供的资源](https://images-assets.nasa.gov/image/PIA14011/PIA14011~thumb.jpg)

### 火星 · mars

- 文件：/assets/mars.jpg，51,420 bytes
- 类别：观测图像。Viking 观测制作的全球彩色图；颜色经过处理以展示地表差异。
- 署名：NASA/JPL/USGS
- [原始页面](https://images.nasa.gov/details/PIA00407) · [页面/API 提供的资源](https://images-assets.nasa.gov/image/PIA00407/PIA00407~thumb.jpg)

### 木星 · jupiter

- 文件：/assets/jupiter.jpg，138,013 bytes
- 类别：观测图像。Hubble 2020 年木星与木卫二观测，表现云带及大红斑；可见光颜色合成。
- 署名：NASA, ESA, A. Simon (Goddard Space Flight Center), M. H. Wong (University of California, Berkeley), and the OPAL team
- [原始页面](https://esahubble.org/images/heic2017a/) · [页面/API 提供的资源](https://cdn.esahubble.org/archives/images/screen/heic2017a.jpg)

### 土星 · saturn

- 文件：/assets/saturn.jpg，69,048 bytes
- 类别：观测图像。Hubble 的土星可见光肖像，展示环面、卡西尼缝与云带。
- 署名：NASA, ESA, A. Simon (Goddard Space Flight Center), M. H. Wong (University of California, Berkeley)
- [原始页面](https://esahubble.org/images/heic1917a/) · [页面/API 提供的资源](https://cdn.esahubble.org/archives/images/screen/heic1917a.jpg)

### 天王星 · uranus

- 文件：/assets/uranus.jpg，8,416 bytes
- 类别：观测图像。Voyager 2 从靠近自转极方向拍摄的天王星观测。
- 署名：NASA/JPL
- [原始页面](https://images.nasa.gov/details/PIA01360) · [页面/API 提供的资源](https://images-assets.nasa.gov/image/PIA01360/PIA01360~thumb.jpg)

### 海王星 · neptune

- 文件：/assets/neptune.jpg，233,841 bytes
- 类别：波段映射 / 处理合成。Webb NIRCam 红外多波段合成，突出明亮云和环；颜色不是肉眼颜色，环未在三维场景中绘制。
- 署名：NASA, ESA, CSA, STScI
- [原始页面](https://esawebb.org/images/weic2214a/) · [页面/API 提供的资源](https://cdn.esawebb.org/archives/images/screen/weic2214a.jpg)

