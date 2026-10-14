# 宇宙尺度与新增星系 · 5.0

核对日期：2026-10-14。巡游保持太阳系、半人马座 α、M45、M42、M1、Sagittarius A* 六站。新内容用于自由探索。

## 尺度路线与科学边界

1. 银河系：棒、盘、旋臂的既有观测重建，约十万光年量级。
2. 本星系群与近邻：银河系、M31、M33属于本星系群；LMC/SMC为近邻矮星系。M81、M51、Centaurus A、M87更远，布局有强烈尺度压缩，不能误读为都属于本星系群。
3. 室女座／局部超星系团：约一亿光年量级的扁平群集。**本星系群位于超星系团外围，不是室女座星系团成员**。程序生成的节点分布为概念示意，不是星系目录；[NASA GSFC 原始说明](https://imagine.gsfc.nasa.gov/features/cosmic/local_supercluster_info.html)。
4. 拉尼亚凯亚：采用 **Tully et al. (2014)** 的速度场流域定义，约160 Mpc／5.2亿光年。主图是论文相关的密度／速度场科学重建截面：白线为运动流、橙线为流域界限、红蓝为密度。边界依赖模型，不能当作刚性的引力束缚外壳，也不宣称它是最终唯一边界。[论文](https://arxiv.org/abs/1409.0880)、[NRAO 研究发布](https://public.nrao.edu/news/supercluster-gbt/)。加载失败时保留程序化概念图与文字，可重试。
5. 宇宙网：十亿光年量级的节点、纤维、空洞结构概念图。程序点和曲线没有逐个观测坐标；并非完整宇宙地图。[ESA：CMB 与物质分布](https://www.esa.int/Science_Exploration/Space_Science/Planck/The_cosmic_microwave_background_and_the_distribution_of_matter_in_the_Universe)。
6. 宇宙微波背景：**ESA Planck Legacy 2018** 全天温度起伏图。来自宇宙约38万岁时的光，红蓝为微小温差的映射色，不是可见光外观。最后一级改变为二维天空投影，**不是空间中最外层星系、宇宙边缘或包含前几级结构的实体壳**。[ESA 原始图与解释](https://www.esa.int/ESA_Multimedia/Images/2018/07/Planck_s_view_of_the_cosmic_microwave_background2)。

缩放阈值 550／1900／6000／18000／56000 是展示坐标，不是光年。跨级采用对数距离与连续交叉淡化，可逆缩放。窄屏按纵横比补偿距离，保持当前尺度。导航提供快捷跳转与返回银河；新图片进入相应层级后才加载。研究图与微波图是平面观测／科学图，不能旋转得到真实三维空间。

## 六张新增小尺寸素材

| 对象 | 对应图片 | 类型与署名 | 原始页面 |
| --- | --- | --- | --- |
| M33 | `triangulum.jpg` · heic1901a | 哈勃中心与内臂拼接，非完整星系全貌。NASA, ESA, and M. Durbin, J. Dalcanton, and B. F. Williams (University of Washington) | [ESA/Hubble](https://esahubble.org/images/heic1901a/) |
| M81 | `bodes-galaxy.jpg` · heic0710a | 可见光／近红外合成。NASA, ESA and the Hubble Heritage Team (STScI/AURA); Acknowledgment: A. Zezas and J. Huchra (Harvard-Smithsonian Center for Astrophysics) | [ESA/Hubble](https://esahubble.org/images/heic0710a/) |
| M51 | `whirlpool.jpg` · heic0506a | 哈勃光学合成，含伴星系 NGC5195。NASA, ESA, S. Beckwith (STScI) and the Hubble Heritage Team (STScI/AURA) | [ESA/Hubble](https://esahubble.org/images/heic0506a/) |
| M87 | `messier-87.jpg` · heic2411b | 恒星晕和喷流，不是 EHT 黑洞阴影。NASA, ESA, A. Lessing (Stanford University), E. Baltz (Stanford University), M. Shara (AMNH), J. DePasquale (STScI) | [ESA/Hubble](https://esahubble.org/images/heic2411b/) |
| 拉尼亚凯亚 | `laniakea-flow.jpg` · 1024×575 | 科学密度／速度场重建。SDvision interactive visualization software by DP at CEA/Saclay, France. 研究 R. Brent Tully et al. (2014) | [NRAO](https://public.nrao.edu/news/supercluster-gbt/) |
| 微波背景 | `planck-cmb-2018.jpg` · 1500×1000 | Planck 2018 温度起伏全天图。ESA/Planck Collaboration。界面裁切显示椭圆地图，另行保留明确署名与原始链接 | [ESA](https://www.esa.int/ESA_Multimedia/Images/2018/07/Planck_s_view_of_the_cosmic_microwave_background2) |

资源地址、实际字节数与下载脚本：`qa/v5-image-sources.json`、`qa/download-v5-assets.mjs`。不新增运行依赖。

距离采用 NASA Hubble Messier Catalog 对应条目：M33约300万、M81约1160万、M51约3100万、M87约5400万光年。实际参数与压缩位置分别保存在 `src/nearby-galaxies.js`。

## 运动与背景

银河展示角速度由0.0022增加到0.008 rad/s，约13.1分钟一圈。行星公转周期缩为原来的1/3，自转周期缩为1/2；月球公转、自转一起缩为1/2，保持同步。Alpha A/B展示公转为600秒。科学参数未变，完整真实／展示周期见 [MOTION_SOURCES.md](MOTION_SOURCES.md)。太阳系巡游镜头随地球的当前轨道相位调整，重播时无需重置物理相位。

背景新增固定方向的6000／10000／14000个恒星光点，以及140／260／260个有轮廓的匿名远方星系光点。它们是艺术背景，不冒充实测天空目录；单批绘制，平移跟随相机而方向保持固定，不随银河主体转动。局部相机远裁面仍为1000，天空投影独立处理，保留原来的近景深度精度。

标记4.6秒错相位呼吸，动画只作用于光点和光晕；28像素按钮及命中区域不缩放。太阳系暖黄，银河内部淡蓝，外部星系淡紫；悬停／焦点与选中更亮，其他适度淡化。减少动态偏好使用静态反馈。窄屏外部图使用 M 编号、LMC/SMC 等通用简称，选择时显示完整三语名称。
