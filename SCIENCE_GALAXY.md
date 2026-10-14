# 银河结构：模型版本与近似范围

当前版本：`MW-reconstruction-2026.2`，核对日期：2026-10-10。实现位于 `src/galaxy.js`；固定随机种子由应用传入，默认 `731927`。这是基于观测约束的程序化密度重建，**不是银河系外部的真实照片，也不是逐星测量目录**。我们身处银河系内部，尘埃遮挡、距离测量和示踪天体选择会使不同结构模型产生差异。

## 坐标与物理尺度

- 银河中心在原点；场景 X 正方向从中心指向太阳，Y 正方向是银河北，Z 正方向对应银经 90°。
- 1 kpc = 4 场景单位；1 kpc = 3261.563777 光年。
- 太阳位置 `[32.8, 0.0832, 0]`：银心距 8.2 kpc，盘面以上 20.8 pc。
- 从日心银经、银纬、光年距离调用 `galacticToScene(l, b, distanceLy)`。银河全景中的目的地位置采用这套线性坐标，局部特写的展示尺寸和速度另行设置。
- 发光盘参考半径 15 kpc。稀疏外侧片段延伸至约 15.75 kpc；这不是给银河盘面定义一个硬边界，也未绘制完整暗物质晕。

太阳半径采用 GRAVITY 2019 测得的 8.178 kpc 四舍五入后的 8.2 kpc；太阳高度采用 Bennett & Bovy 2019 的 20.8 pc。太阳附近的本地臂曲线在太阳半径处偏离日心约 180 pc，太阳位于该短臂附近；同一银心径向上，Sagittarius 次臂约 6.6 kpc、Perseus 主臂约 9.8 kpc。本地臂绘制在二者之间。

## 银河形态与展示约定

- **中央棒与隆起**：棒半长 5 kpc，近端与中心—太阳方向成 28°，朝正银经侧倾斜。中心使用竖直较厚的盒状／花生状密度包络，外棒更平坦。数值来自 Wegg、Gerhard、Portail (2015) 的约束范围；花生形状是简化包络，不是该论文密度网格的复制。
- **盘面**：老薄盘采用指数径向尺度约 2.6 kpc、指数高度约 0.30 kpc；厚盘高度约 0.90 kpc；年轻星区域约 0.065 kpc。这里的尺度与绘制比例是合理的可视化参数，未对全银河人群做质量归一化或选择函数拟合。低密度外盘有轻微翘曲。
- **主臂与次臂**：采用 NASA/Spitzer 示意中的 Scutum–Centaurus、Perseus 两条主要恒星密度臂，Sagittarius、Norma 为气体／年轻恒星占优的次级结构，再加入 Orion/Local 短臂与稀疏外侧片段。不是均匀四臂模板。
- **曲线参数**：主臂使用约 12.8°／14.4°的不同对数旋角，次臂约 12°／15.7°；其宽度、断续、局部复杂形状与星形成复合区由固定种子构造。这些角度和局部断口是展示近似，**不能读作各观测臂的精密拟合结果**，也不能用来推断真实天体是否属于某条旋臂。
- **年龄／颜色**：暖色表示较老恒星密度与棒／隆起；冷色突出年轻恒星和星形成区域。人群混合，没有整条旋臂统一染色。渲染颜色经过电影感映射，不是某个波段的可校准光度。
- **尘埃**：不再用四倍周期函数或不透明黑色点片。沿不等宽的旋臂构造断续细丝／团块，对恒星和未分辨光的前景薄层做三点消光积分；视角改变穿过尘埃的路径长度。绘制的尘埃粒子只提供极弱散射光。它仍是近似透射，不是完整辐射转移计算。
- **恒星采样**：6 万／14 万／26 万个实际点（包含遥远参考星场），并非真实银河恒星总数。强光晕点约占银河星点 0.3%。粒径、亮度、光晕与距离衰减分别控制；未添加真空中的随机闪烁。

## 科学资料清单

1. [NASA：The Milky Way Galaxy](https://science.nasa.gov/resource/the-milky-way-galaxy/) — 页面日期 2017-11-08，最后更新 2024-10-28，NASA/JPL-Caltech/R. Hurt (SSC/Caltech)。Spitzer 支持两个主要恒星臂、两个较弱气体／星形成臂及太阳附近 Orion Spur 的形态框架。该图本身是艺术重建。
2. [NASA：Solar System Facts](https://science.nasa.gov/solar-system/solar-system-facts/) — 太阳系位于 Orion Spur、本地位置的公众说明。
3. [NASA / Chandra：Milky Way at Arms’ Length](https://science.nasa.gov/missions/chandra/nasas-chandra-examines-milky-way-at-arms-length/) — 发布 2026-07-01，更新 2026-07-02。利用伽马射线暴的尘埃散射回声测量 Perseus、Outer、Outer Scutum–Centaurus 臂。**约 10% 更远的结果针对一条伽马暴视线上的两段外臂，不代表所有旋臂应统一放大 10%**。本模型保留稀薄外侧片段并说明结构不确定性，没有据此重标定整座银河。
4. [Wegg、Gerhard、Portail 2015：The structure of the Milky Way’s bar outside the bulge（MPE 研究页）](https://www.mpe.mpg.de/6329031/Wegg2015)；[论文](https://arxiv.org/abs/1504.01401) — 长棒半长约 5.0±0.2 kpc，棒角约 28–33°，内侧为更厚的盒状／花生状隆起。
5. [GRAVITY Collaboration 2019：A geometric distance measurement to the Galactic Center black hole with 0.3% uncertainty](https://arxiv.org/abs/1904.05721) — S2 轨道得到 R0 = 8178±13（统计）±22（系统）pc；本作采用 8.2 kpc 的展示舍入值。
6. [Bennett & Bovy 2019：Vertical waves in the solar neighbourhood in Gaia DR2](https://arxiv.org/abs/1809.03507) — 太阳在本地中面的高度 20.8±0.3 pc。

上述资料是形态和尺度依据。六站天体的方向、距离、图片和事实来源由统一目的地数据另行列出。局部太阳系、恒星系统、星云与黑洞特写采用独立坐标尺度；这些展示大小不能直接与银河全景中的标记直径比较。

