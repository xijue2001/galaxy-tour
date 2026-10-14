# 科学与素材记录

资料核对日期：2026-10-13。内容版本 `MW-reconstruction-2026.2`，随机种子 `731927`。本作品是根据公开观测资料制作的教育可视化；程序化结构、镜头、颜色和局部体积由项目创作，未经过 NASA、ESA、ESO 或 EHT 审核。观测图与程序化示意的类别明确标注，观测分层深度属于艺术性重建。

## 银河结构模型

- [NASA / Spitzer 银河结构示意](https://science.nasa.gov/resource/the-milky-way-galaxy/)：中央棒、盾牌—半人马臂与英仙臂的主要恒星结构，以及人马臂、矩尺臂的较弱恒星结构。该图本身是艺术示意，不能视为实拍或唯一几何解。
- [NASA 太阳系位置说明](https://science.nasa.gov/solar-system/solar-system-facts/)：太阳邻近猎户座本地臂，位于人马臂和英仙臂之间。
- [NASA / Chandra，2026-07-01 外旋臂研究](https://science.nasa.gov/missions/chandra/nasas-chandra-examines-milky-way-at-arms-length/)：X 射线尘埃光回声测量对外臂距离提供新约束；某条视线上的两条外臂比原先估计远约 10%。项目因此展示不连续的外围结构，未把这一个方向的结论扩展成全银河精确的径向放大。
- 棒长度、盘厚度、尘埃算法及旋臂参数的具体实现说明见 [SCIENCE_GALAXY.md](SCIENCE_GALAXY.md)。主臂的名称与恒星/气体差异有资料依据，程序化曲线的节距、缺口、宽度与密度不是唯一的观测解。
- 太阳—银心基准取 `8.2 kpc`，接近 [GRAVITY 2019 的几何测距](https://arxiv.org/abs/1904.05721)；该研究报告 `8178 ± 13(stat.) ± 22(sys.) pc`，本模型没有宣称 8.2 kpc 是无误差精确值。

## 六站数据与位置

全景世界以银心为原点：`+X` 指向太阳，`+Y` 指向银北极，`+Z` 指向银经 90°。1 场景单位 = 250 pc。太阳为 `(8.2, 0.0208, 0) kpc`。使用日心银经 `l`、银纬 `b` 和距离 `d` 后，日心位移为 `(-d cos b cos l, d sin b, d cos b sin l)`，再加太阳位置。太阳是日心原点，无天球方向。

| 顺序 / 稳定 ID | 类型 | 采用日心距离 | J2000 银经 / 银纬 | 距离与位置来源 |
| --- | --- | --- | --- | --- |
| 1 `solar-system` | 恒星与行星系统 | 0 ly | 不适用 | [NASA 太阳系](https://science.nasa.gov/solar-system/solar-system-facts/) |
| 2 `alpha-centauri` | 多恒星系统 | A/B 约 4.37 ly；比邻星约 4.24 ly | 315.74268° / −0.66335° | [ESA 距离说明](https://www.esa.int/Science_Exploration/Space_Science/A_cool_discovery_about_the_Sun_s_next-door_twin)；[Hubble 代表视场坐标](https://esahubble.org/images/potw1635a/) |
| 3 `pleiades` | 疏散星团 / 反射星云 | 444 ly；136.2 ± 1.2 pc ≈ 444 ± 4 ly | 166.4627° / −23.6148° | [Melis 等 2014 VLBI 测量](https://arxiv.org/abs/1408.6544)；[CDS SIMBAD M45](https://simbad.cds.unistra.fr/simbad/sim-basic?Ident=M45&submit=SIMBAD+search) |
| 4 `orion-nebula` | 发射星云 / H II 区 | 1350 ly；414 ± 7 pc ≈ 1350 ± 23 ly | 209.0095° / −19.3818° | [Menten 等 2007 VLBI 测量](https://arxiv.org/abs/0709.0485)；[CDS SIMBAD M42](https://simbad.unistra.fr/simbad/sim-id?Ident=M42) |
| 5 `crab-nebula` | 超新星遗迹 / 脉冲星风云 | 约 6500 ly | 184.5547° / −5.7833° | [NASA 蟹状星云](https://science.nasa.gov/missions/hubble/a-giant-hubble-mosaic-of-the-crab-nebula/)；[CDS SIMBAD M1](https://simbad.cds.unistra.fr/simbad/sim-basic?Ident=M1&submit=SIMBAD+search) |
| 6 `sagittarius-a` | 超大质量黑洞 | 模型 26740 ly；约 8.2 kpc | 359.94423568° / −0.04616002° | [GRAVITY 2019](https://arxiv.org/abs/1904.05721)；[CDS SIMBAD Sgr A*](https://simbad.cds.unistra.fr/simbad/sim-basic?Ident=Sagittarius+A)；[ESO / EHT 约 27000 ly](https://www.eso.org/public/news/eso2208-eht-mw/) |

Alpha Centauri 使用 Hubble 图片页面的 J2000 视场中心 `14h39m37.08s, −60°48′56.29″`，用标准 ICRS → Galactic 旋转矩阵换算。它是 A/B 代表点，不是比邻星坐标。其他天体使用 CDS 代表位置；星团与星云有实际深度，其距离不是每一颗星都相同的精确值。M42 的文献与不同成员样本给出不同距离，本作品明确记录所采用的 2007 年 VLBI 值。

Sagittarius A* 标记配准为模型银心 `(0,0,0)`，不直接使用上述观测方向与简化太阳高度推算出的约十余 pc 偏差位置。这是原点的展示配准，不是把观测 `l,b` 改成零；原始方向保存在统一数据记录中。

## 真实数据与展示布局

真实日心距离、类型、ICRS/J2000 代表方向与事实来源保存在统一数据记录。原六站镜头桥接仍使用真实坐标。自由探索标记改用单独的 display.position；为逐个点击，地图位置与间距经过展示调整，尽量保留所属区域与方向。每个目标有自己的标记、28 px 命中区域、名称、选中状态和引线，没有聚合天体。屏幕碰撞只调整标记显示位置，不修改科学记录。

太阳系/恒星系统/黑洞采用各自局部尺度；尺寸放大、间距压缩。M45、M42、M1 及新增目标的观测图提供实际二维细节，三层浅位移提供艺术性视差，不能用于读取三维气体距离。镜头与时长不表达实际航行速度。黑洞亮环参考 EHT 射电重建，是解释性示意，没有广义相对论射线追踪。

## 全目录的科学坐标与显示位置

| ID | 距太阳系 ly | 银经 / 银纬 ° | 显示坐标 x,y,z |
| --- | ---: | --- | --- |
| solar-system | 0 | 0.00000 / 0.00000 | 32.8, 0.0832, 0 |
| alpha-centauri | 4.37 | 315.74268 / -0.66335 | 28, 0.2, -6 |
| pleiades | 444 | 166.46270 / -23.61480 | 41, -1, 6 |
| orion-nebula | 1350 | 209.00950 / -19.38180 | 38, -2, -8 |
| crab-nebula | 6500 | 184.55470 / -5.78330 | 49, -1, -5 |
| sagittarius-a | 26740 | 359.94424 / -0.04616 | 0, 0, 0 |
| eagle-nebula | 6500 | 16.93385 / 0.75365 | 21, 0.3, 21 |
| carina-cliffs | 7600 | 286.16293 / -0.20054 | 30, -0.6, -22 |
| lagoon-nebula | 5000 | 5.93908 / -1.19926 | 21, -0.5, 3 |
| trifid-nebula | 5500 | 7.08624 / -0.28691 | 17, 0.5, 8 |
| horsehead-nebula | 1300 | 206.95600 / -16.77524 | 46, -1, -15 |
| rosette-nebula | 4700 | 206.30957 / -2.07389 | 54, -1, -18 |
| omega-nebula | 5500 | 15.13832 / -0.77531 | 18, -0.4, 14 |
| helix-nebula | 700 | 36.16135 / -57.11847 | 31, -5, 16 |
| ring-nebula | 2500 | 63.17005 / 13.97765 | 27, 5, 24 |
| butterfly-nebula | 3800 | 349.50742 / 1.05750 | 12, 0.9, -12 |
| cats-eye-nebula | 3000 | 96.46775 / 29.95473 | 37, 9, 20 |
| veil-nebula | 2100 | 73.50422 / -7.48810 | 25, 0.3, 11 |
| double-cluster | 7500 | 134.76985 / -3.72224 | 42, 0.5, 25 |
| hercules-cluster | 25000 | 59.00795 / 40.91303 | 20, 23, 23 |
| omega-centauri | 17000 | 309.10198 / 14.96827 | 21, 6, -24 |

新增目标主要以官方图片视场中心作为代表方向，由 ICRS 旋转到银河坐标；Rosette 和 Double Cluster 采用代表性中心，详见各记录 astrometry.precision。星云范围与星团深度不能由单一标记概括。距离按当前选用资料近似；NGC 2244 采用约 4700 ly（现代成员测距约 1440 pc），ESO 页面文字与旧元数据并不完全一致。

## 事实来源

### 太阳系

- [NASA — Solar System Facts](https://science.nasa.gov/solar-system/solar-system-facts/)
- [GRAVITY — R₀](https://arxiv.org/abs/1904.05721)
- [NASA Blue Marble — Earth texture](https://visibleearth.nasa.gov/images/57730/the-blue-marble)
- [NSO photosphere — granulation and sunspots](https://nso.edu/for-public/sun-science/photosphere/)

### 半人马座 α 恒星系统

- [ESA — Alpha Centauri distances](https://www.esa.int/Science_Exploration/Space_Science/A_cool_discovery_about_the_Sun_s_next-door_twin)
- [ESA/Hubble — A/B observation and coordinates](https://esahubble.org/images/potw1635a/)
- [Kervella et al. — Alpha Centauri radii](https://doi.org/10.1051/0004-6361/201629505)
- [Kervella et al. 2017 — Proxima radii and orbit](https://www.aanda.org/articles/aa/pdf/2017/02/aa29930-16.pdf)

### 昴星团 · M45

- [Melis et al. 2014 — VLBI distance](https://arxiv.org/abs/1408.6544)
- [ESO — Pleiades image and reflection dust](https://www.eso.org/public/images/b11/)
- [CDS SIMBAD — M45](https://simbad.cds.unistra.fr/simbad/sim-basic?Ident=M45&submit=SIMBAD+search)

### 猎户座大星云 · M42

- [Menten et al. 2007 — Orion distance](https://arxiv.org/abs/0709.0485)
- [NASA — Orion Nebula](https://science.nasa.gov/asset/hubble/orion-nebula-3/)
- [CDS SIMBAD — M42](https://simbad.unistra.fr/simbad/sim-id?Ident=M42)

### 蟹状星云 · M1

- [NASA — Crab Nebula mosaic](https://science.nasa.gov/missions/hubble/a-giant-hubble-mosaic-of-the-crab-nebula/)
- [ESA/Hubble — Crab observation](https://esahubble.org/images/heic0515a/)
- [CDS SIMBAD — M1](https://simbad.cds.unistra.fr/simbad/sim-basic?Ident=M1&submit=SIMBAD+search)

### 银河中心 · Sagittarius A*

- [ESO/EHT — First image of Sagittarius A*](https://www.eso.org/public/images/eso2208-eht-mwa/)
- [ESO/EHT — First Galactic black-hole image](https://www.eso.org/public/news/eso2208-eht-mw/)
- [GRAVITY 2019 — Galactic Center distance](https://arxiv.org/abs/1904.05721)
- [CDS SIMBAD — Sagittarius A*](https://simbad.cds.unistra.fr/simbad/sim-basic?Ident=Sagittarius+A)

### 鹰状星云 · M16／创生之柱

- [Pillars of Creation (NIRCam and MIRI Composite Image)](https://esawebb.org/images/pillarsofcreation_composite/)
- [NASA M16 — relation to the Pillars](https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-16/)

### 船底座 NGC 3324／宇宙悬崖

- [NIRCam Image of the “Cosmic Cliffs” in Carina](https://esawebb.org/images/weic2205a/)

### 礁湖星云 · M8

- [VISTA's infrared view of the Lagoon Nebula (Messier 8)](https://www.eso.org/public/images/eso1101a/)

### 三叶星云 · M20

- [The Trifid Nebula](https://www.eso.org/public/images/eso0930a/)

### 马头星云 · Barnard 33

- [The Horsehead Nebula*](https://www.eso.org/public/images/eso0202a/)

### 玫瑰星云／NGC 2244

- [The Rosette Nebula: a cosmic rose](https://www.eso.org/public/images/b12/)
- [Mužić et al. 2022 — NGC 2244/2237 distances](https://arxiv.org/abs/2209.13302)

### 天鹅／欧米伽星云 · M17

- [VST image of the star-forming region Messier 17](https://www.eso.org/public/images/eso1119a/)

### 螺旋星云 · NGC 7293

- [The Helix Nebula*](https://www.eso.org/public/images/eso0907a/)

### 环状星云 · M57

- [Hubble image of the Ring Nebula (Messier 57)](https://esahubble.org/images/heic1310a/)

### 蝴蝶星云 · NGC 6302

- [Butterfly emerges from stellar demise in planetary nebula NGC 6302](https://esahubble.org/images/heic0910h/)

### 猫眼星云 · NGC 6543

- [Dying star creates fantasy-like sculpture of gas and dust](https://esahubble.org/images/heic0414a/)
- [NASA Caldwell 6 — distance](https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-caldwell-catalog/caldwell-6/)

### 面纱星云／天鹅座环

- [Return to the Veil Nebula](https://esahubble.org/images/potw2113a/)

### 英仙座双星团 · NGC 869／884

- [The double cluster in Perseus](https://www.eso.org/public/images/b02/)
- [NASA Caldwell 14 — distance](https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-caldwell-catalog/caldwell-14/)

### 武仙座球状星团 · M13

- [The crowded heart of the Hercules globular cluster](https://esahubble.org/images/potw1011a/)

### 半人马座 ω · NGC 5139

- [VST image of the giant globular cluster Omega Centauri*](https://www.eso.org/public/images/eso1119b/)

图片类型、颜色含义、完整署名与资源地址见 [VISUAL_SOURCES.md](VISUAL_SOURCES.md)；目录见 [CATALOG.md](CATALOG.md)。银河曲线与密度参数仍见 [SCIENCE_GALAXY.md](SCIENCE_GALAXY.md)。
