import { EXPLORATION_DESTINATIONS } from './exploration-data.js';
import { SOLAR_DESTINATIONS } from './solar-data.js';
import { EXTRAGALACTIC_DESTINATIONS } from './extragalactic-data.js';
import { NEARBY_GALAXIES } from './nearby-galaxies.js';
// Concise original educational text; scientific snapshot checked 2026-10-10.
const tr = (zh, en, ja) => ({ zh, en, ja });
const param = (label, value) => ({label, value});
const source = (title, url) => ({title, url});
const same = text => tr(text,text,text);
const direction = tr('银经 / 银纬（J2000）','Galactic l / b (J2000)','銀経 / 銀緯（J2000）');
export const MODEL = {
  version:'MW-reconstruction-2026.2', checkedOn:'2026-10-10', seed:731927,
  solarRadiusKpc:8.2, solarHeightKpc:0.0208, parsecToLy:3.26156,
  reconstruction:tr('根据观测近似重建；旋臂形态仍存在不确定性。','An observational approximation; spiral-arm geometry remains uncertain.','観測に基づく近似です。渦状腕の形には不確かさがあります。'),
  sources:[source('NASA — Galactic structure','https://science.nasa.gov/resource/the-milky-way-galaxy/'),source('NASA/Chandra — Outer arms, July 2026','https://science.nasa.gov/missions/chandra/nasas-chandra-examines-milky-way-at-arms-length/'),source('NASA — Solar location','https://science.nasa.gov/solar-system/solar-system-facts/')]
};
export const TOUR_DESTINATIONS = [
{
  id:'solar-system',distanceLy:0,galactic:{lDeg:0,bDeg:0},astrometry:{frame:'heliocentric origin',directionDefined:false},
  names:tr('太阳系','Solar System','太陽系'),types:tr('恒星与行星系统','Star and planetary system','恒星・惑星系'),
  short:tr(['我们从地球的邻近空间启程。','太阳处在猎户座本地臂附近。'],['Our journey starts near Earth.','The Sun lies near the Orion Spur.'],['地球の近くから旅を始めます。','太陽はオリオン腕付近にあります。']),
  detail:tr(['太阳系包含太阳与八颗行星，年龄约为 46 亿年。','本地臂位于人马臂和英仙臂之间。地图采用太阳距银心 8.2 千秒差距的近似模型。'],['The Sun and eight planets belong to a system about 4.6 billion years old.','The Orion Spur lies between the Sagittarius and Perseus arms. Our map adopts a solar Galactocentric radius of 8.2 kiloparsecs.'],['太陽と 8 個の惑星からなる系は、約 46 億年前に形成されました。','オリオン腕は、いて座腕とペルセウス腕の間にあります。地図は太陽の銀河中心距離を 8.2 キロパーセクとしています。']),
  parameters:[param(tr('行星数','Planets','惑星数'),same('8')),param(tr('年龄','Age','年齢'),tr('约 46 亿年','About 4.6 billion years','約 46 億年')),param(tr('银心距离（模型）','Galactocentric radius (model)','銀河中心距離（モデル）'),same('8.2 kpc ≈ 26,740 ly'))],
  image:{src:'/assets/solar-system.jpg',kind:tr('艺术示意图','Artist’s illustration','模式イラスト'),caption:tr('太阳系天体的艺术排列。大小和距离不按同一比例，不能视为一张全景照片。','An artistic arrangement of Solar System bodies. Sizes and distances use different scales; this is not a panoramic photograph.','太陽系天体を並べた模式図です。大きさと距離は同じ縮尺ではなく、全景写真ではありません。'),credit:'NASA/JPL-Caltech',sourceUrl:'https://science.nasa.gov/image-detail/solar-system-model/',resourceUrl:'https://science.nasa.gov/wp-content/uploads/2023/06/solar-system-model.jpg'},
  sources:[source('NASA — Solar System Facts','https://science.nasa.gov/solar-system/solar-system-facts/'),source('GRAVITY — R₀','https://arxiv.org/abs/1904.05721')],
  scaleNote:tr('行星放大、轨道间距压缩；轨道不代表当前星历。','Planets are enlarged and orbital spacing compressed; this is not a current ephemeris.','惑星を拡大し軌道間隔を圧縮しています。現在の天体暦ではありません。')
},
{
  id:'alpha-centauri',distanceLy:4.37,galactic:{lDeg:315.74268,bDeg:-0.66335},astrometry:{frame:'ICRS/J2000',ra:'14 39 37.08',dec:'-60 48 56.29',source:'Hubble potw1635a field center; ICRS-to-Galactic rotation'},
  names:tr('半人马座 α 恒星系统','Alpha Centauri system','ケンタウルス座 α 星系'),types:tr('多恒星系统','Multiple-star system','多重星系'),
  short:tr(['南门二 A/B 是太阳的近邻双星。','红矮星比邻星也是本系统的成员，距离太阳约 4.24 光年。'],['Alpha Centauri A/B is a neighboring binary.','Its red-dwarf companion Proxima is about 4.24 light-years from the Sun.'],['ケンタウルス座 α 星 A/B は近隣の連星です。','伴星の赤色矮星プロキシマは、太陽から約 4.24 光年離れています。']),
  detail:tr(['A/B 距太阳约 4.37 光年，互绕周期约为 80 年。A 是 G 型恒星，B 是 K 型恒星。','巡游代表点位于 A/B；更接近太阳的比邻星与 A/B 相隔很远。图片只展示 A/B。'],['A/B lies about 4.37 light-years away and completes a mutual orbit in roughly 80 years. A is a G-type star and B a K-type star.','Our waypoint represents A/B. Proxima is closer to the Sun but widely separated from the pair; it is absent from the sidebar image.'],['A/B は約 4.37 光年先にあり、約 80 年で互いの周囲を公転します。A は G 型、B は K 型星です。','代表地点は A/B です。太陽に近いプロキシマは連星から大きく離れ、側面の画像には写っていません。']),
  parameters:[param(tr('A/B 距离','A/B distance','A/B の距離'),same('≈ 4.37 ly')),param(tr('比邻星距离','Proxima distance','プロキシマの距離'),same('≈ 4.24 ly')),param(direction,same('315.74268° / −0.66335°'))],
  image:{src:'/assets/alpha-centauri.jpg',kind:tr('光学与近红外观测图','Optical / near-infrared observation','可視光・近赤外線観測画像'),caption:tr('哈勃 WFPC2：A 在左，B 在右。滤镜数据合成显示颜色；光条属于成像效应。此图没有比邻星。','Hubble WFPC2: A at left, B at right. Filter data create the displayed colors; spikes are imaging effects. Proxima is outside this view.','ハッブル WFPC2：左が A、右が B。フィルターのデータを色に合成しています。光条は撮像効果で、プロキシマは含まれません。'),credit:'ESA/Hubble & NASA',sourceUrl:'https://esahubble.org/images/potw1635a/',resourceUrl:'https://cdn.esahubble.org/archives/images/screen/potw1635a.jpg'},
  sources:[source('ESA — Alpha Centauri distances','https://www.esa.int/Science_Exploration/Space_Science/A_cool_discovery_about_the_Sun_s_next-door_twin'),source('ESA/Hubble — A/B observation and coordinates','https://esahubble.org/images/potw1635a/')],
  scaleNote:tr('局部显示扩大星体，并压缩比邻星与 A/B 的间隔。','Local rendering enlarges the stars and compresses Proxima’s separation from A/B.','局所表示は恒星を拡大し、A/B とプロキシマの間隔を縮めています。')
},
{
  id:'pleiades',distanceLy:444,galactic:{lDeg:166.4627,bDeg:-23.6148},astrometry:{frame:'ICRS/J2000',ra:'03 46 24.2',dec:'+24 06 50',source:'CDS SIMBAD M45, 2026-10-10'},
  names:tr('昴星团 · M45','Pleiades · M45','プレアデス星団（すばる）· M45'),types:tr('疏散星团与反射星云','Open cluster / reflection nebula','散開星団・反射星雲'),
  short:tr(['蓝白色亮星构成了熟悉的“七姐妹”。','周围蓝色云纱来自尘埃散射星光，是反射星云。'],['The blue-white stars form the familiar Seven Sisters.','Nearby dust scatters starlight into blue reflection nebulosity.'],['青白い星々が「七姉妹」を形作ります。','周囲の塵が星光を散乱し、青い反射星雲を生みます。']),
  detail:tr(['采用 VLBI 距离 136.2 ± 1.2 秒差距，约 444 ± 4 光年。星团各成员的距离并不完全相同。','星团年龄约一亿年，正穿过星际尘埃。尘粒更容易散射蓝光；它与气体本身发光的发射星云具有不同机制。'],['We adopt a VLBI distance of 136.2 ± 1.2 parsecs, about 444 ± 4 light-years. Members occupy different depths.','The cluster is roughly 100 million years old and is crossing interstellar dust. Preferential scattering of blue light explains the reflection nebula, unlike gas emission in M42.'],['VLBI 距離 136.2 ± 1.2 パーセク、約 444 ± 4 光年を採用します。星団の各星には奥行きがあります。','約 1 億歳の星団は星間塵を通過中です。青い光が散乱されやすいため青く見え、M42 のガスの発光とは機構が異なります。']),
  parameters:[param(tr('采用距离','Adopted distance','採用距離'),same('136.2 ± 1.2 pc ≈ 444 ± 4 ly')),param(tr('年龄','Age','年齢'),tr('约 1 亿年','About 100 million years','約 1 億年')),param(direction,same('166.4627° / −23.6148°'))],
  image:{src:'/assets/pleiades.jpg',kind:tr('可见光观测图','Visible-light observation','可視光観測画像'),caption:tr('2021 年于埃及拍摄、由 IAU 发布的昴星团观测照片。尘埃散射蓝色星光，反射云纱围绕亮星，并与更暗的尘埃结构相连；光条属于成像效应。','Observed in Egypt in 2021 and published by the IAU. Dust scatters blue starlight: reflection veils surround the bright stars and connect to darker dust. Spikes are imaging effects.','2021 年にエジプトで撮影され、IAU が公開した観測写真です。塵が青い星光を散乱し、明るい星を包む反射雲と暗い塵がつながります。光条は撮像効果です。'),credit:'Mohamed Usama/IAU OAE',sourceUrl:'https://iauarchive.eso.org/public/images/detail/ann22042ab/',resourceUrl:'https://iauarchive.eso.org/static/archives/images/screen/ann22042ab.jpg'},
  sources:[source('Melis et al. 2014 — VLBI distance','https://arxiv.org/abs/1408.6544'),source('ESO — Pleiades image and reflection dust','https://www.eso.org/public/images/b11/'),source('CDS SIMBAD — M45','https://simbad.cds.unistra.fr/simbad/sim-basic?Ident=M45&submit=SIMBAD+search')],
  scaleNote:tr('地图定位星团中心。局部恒星为程序化近似，非逐星目录。','The map locates the cluster center. Local stars are a procedural approximation, not a stellar catalog.','地図は星団中心を示します。局所の星々は近似表現で、星のカタログではありません。')
},
{
  id:'orion-nebula',distanceLy:1350,galactic:{lDeg:209.0095,bDeg:-19.3818},astrometry:{frame:'ICRS/J2000',ra:'05 35 16.8',dec:'-05 23 15',source:'CDS SIMBAD M42, 2026-10-10'},
  names:tr('猎户座大星云 · M42','Orion Nebula · M42','オリオン大星雲 · M42'),types:tr('发射星云与恒星形成区','Emission nebula / stellar nursery','輝線星雲・星形成領域'),
  short:tr(['恒星正在这片气体与尘埃中诞生。','中心年轻恒星的紫外线电离气体，使它发光。'],['Stars are forming inside this gas and dust.','Ultraviolet light from central young stars ionizes the glowing gas.'],['ガスと塵の中で星が生まれています。','中心の若い星の紫外線が、ガスを電離させて光らせます。']),
  detail:tr(['M42 是猎户座之剑中的电离氢区。梯形星团的恒星辐射和星风塑造了星云。','采用 Menten 等（2007）的 VLBI 距离 414 ± 7 秒差距，约 1350 ± 23 光年。不同测量与成员选取给出不同估计；该区域有真实厚度。'],['M42 is an ionized-hydrogen region in Orion’s sword. Radiation and winds from the Trapezium sculpt its clouds.','The adopted VLBI result is 414 ± 7 parsecs, about 1350 ± 23 light-years (Menten et al. 2007). Methods and selected members yield differing estimates; the region has physical depth.'],['M42 はオリオン座の剣にある電離水素領域です。トラペジウムの星の放射と恒星風が雲を形作ります。','Menten ほか（2007）の VLBI 距離 414 ± 7 パーセク、約 1350 ± 23 光年を採用します。測定方法や対象星で推定値は異なり、領域には厚みがあります。']),
  parameters:[param(tr('采用距离','Adopted distance','採用距離'),same('414 ± 7 pc ≈ 1350 ± 23 ly')),param(tr('区域类型','Region','領域の種類'),same('H II')),param(direction,same('209.0095° / −19.3818°'))],
  image:{src:'/assets/orion-nebula.jpg',kind:tr('多滤镜观测拼接图','Multi-filter observational mosaic','複数フィルターの観測モザイク'),caption:tr('哈勃与地面望远镜数据的拼接。可见光及近红外滤镜映射为颜色，区分发光气体、恒星和暗尘埃。','Mosaic combining Hubble and ground-based observations. Visible and near-infrared filters are mapped to colors that distinguish emitting gas, stars and dark dust.','ハッブルと地上望遠鏡の観測を合成したモザイク。可視光・近赤外線のフィルターを色に対応させ、ガス、星、暗い塵を区別します。'),credit:'NASA, ESA, M. Robberto (Space Telescope Science Institute/ESA) and the Hubble Space Telescope Orion Treasury Project Team',sourceUrl:'https://esahubble.org/images/heic0601a/',resourceUrl:'https://cdn.esahubble.org/archives/images/screen/heic0601a.jpg'},
  sources:[source('Menten et al. 2007 — Orion distance','https://arxiv.org/abs/0709.0485'),source('NASA — Orion Nebula','https://science.nasa.gov/asset/hubble/orion-nebula-3/'),source('CDS SIMBAD — M42','https://simbad.unistra.fr/simbad/sim-id?Ident=M42')],
  scaleNote:tr('云层为体积感的程序化示意，色彩与亮度增强；不是气体三维测量图。','Clouds are procedural volume illustrations with enhanced color and brightness, not a measured gas-volume map.','雲は立体感を示す模式表現で、色と明るさを強調しています。測定された三次元ガス地図ではありません。')
},
{
  id:'crab-nebula',distanceLy:6500,galactic:{lDeg:184.5547,bDeg:-5.7833},astrometry:{frame:'ICRS/J2000',ra:'05 34 31.8',dec:'+22 01 03',source:'CDS SIMBAD M1, 2026-10-10'},
  names:tr('蟹状星云 · M1','Crab Nebula · M1','かに星雲 · M1'),types:tr('超新星遗迹与脉冲星风云','Supernova remnant / pulsar wind nebula','超新星残骸・パルサー風星雲'),
  short:tr(['公元 1054 年被记录的超新星留下了这片遗迹。','中心脉冲星驱动高能粒子，膨胀的气体形成复杂细丝。'],['A supernova recorded in 1054 left this remnant.','Its central pulsar drives energetic particles through expanding filamentary gas.'],['1054 年に記録された超新星が残した天体です。','中心のパルサーが高エネルギー粒子を送り、膨張するガスは複雑な繊維構造を作ります。']),
  detail:tr(['蟹状星云位于金牛座方向，常用近似距离为 6500 光年。它是大质量恒星死亡后的遗迹。','中心是快速自转的中子星。抛出的气体与脉冲星风具有不同的辐射机制；因此局部画面展示外部细丝与内部弥散光两层。'],['Toward Taurus, the Crab is commonly placed at about 6500 light-years. It is the aftermath of a massive star’s death.','A rapidly rotating neutron star occupies its center. Ejected gas and the pulsar wind produce distinct radiation, motivating separate outer filaments and inner diffuse light in our scene.'],['おうし座方向にあるかに星雲は、約 6500 光年先とされています。大質量星の死によって生まれた残骸です。','中心には高速で自転する中性子星があります。放出ガスとパルサー風は異なる放射を生むため、画面は外側の繊維と内側の淡い光を分けて表しています。']),
  parameters:[param(tr('超新星记录年份','Recorded supernova','記録された超新星'),same('1054 CE')),param(tr('采用距离','Adopted distance','採用距離'),same('≈ 6500 ly')),param(direction,same('184.5547° / −5.7833°'))],
  image:{src:'/assets/crab-nebula.jpg',kind:tr('窄带观测合成图','Narrow-band observational composite','狭帯域観測合成画像'),caption:tr('哈勃 WFPC2 的窄带合成。氧和硫等气体谱线映射为显示颜色；它们强调不同气体细丝，不代表裸眼颜色。','Hubble WFPC2 narrow-band composite. Oxygen and sulfur emission lines are mapped to display colors, emphasizing different gas filaments rather than naked-eye appearance.','ハッブル WFPC2 の狭帯域合成。酸素や硫黄の輝線を表示色に対応させ、ガスの繊維を強調しています。肉眼での色ではありません。'),credit:'NASA, ESA and Allison Loll/Jeff Hester (Arizona State University). Acknowledgement: Davide De Martin (ESA/Hubble)',sourceUrl:'https://esahubble.org/images/heic0515a/',resourceUrl:'https://cdn.esahubble.org/archives/images/screen/heic0515a.jpg'},
  sources:[source('NASA — Crab Nebula mosaic','https://science.nasa.gov/missions/hubble/a-giant-hubble-mosaic-of-the-crab-nebula/'),source('ESA/Hubble — Crab observation','https://esahubble.org/images/heic0515a/'),source('CDS SIMBAD — M1','https://simbad.cds.unistra.fr/simbad/sim-basic?Ident=M1&submit=SIMBAD+search')],
  scaleNote:tr('细丝与脉冲星风为程序化重建，亮度和尺度经过展示调整。','Filaments and pulsar wind are procedural reconstructions with display adjustments to brightness and scale.','繊維構造とパルサー風は模式的な再構成で、明るさと縮尺を調整しています。')
},
{
  id:'sagittarius-a',distanceLy:26740,galactic:{lDeg:359.94423568,bDeg:-0.04616002},astrometry:{frame:'ICRS/J2000',ra:'17 45 40.03599',dec:'-29 00 28.1699',source:'CDS SIMBAD Sgr A*, 2026-10-10',displayRegistration:'Exact Galactocentric origin; observed coordinates retained above.'},
  names:tr('银河中心 · Sagittarius A*','Galactic Center · Sagittarius A*','銀河中心 · いて座 A*'),types:tr('超大质量黑洞','Supermassive black hole','超大質量ブラックホール'),
  short:tr(['银河中心藏着约四百万太阳质量的黑洞。','EHT 的射电重建显示亮环与暗影；这一站的动态画面是基于观测的示意。'],['A black hole of roughly four million solar masses lies at the Galactic Center.','EHT radio reconstruction reveals a ring and shadow; our animated scene is an observationally informed illustration.'],['銀河中心には太陽の約 400 万倍の質量を持つブラックホールがあります。','EHT の電波再構成は明るいリングと影を示します。動く画面は観測を参考にした模式表現です。']),
  detail:tr(['黑洞本身不发光，附近热气体的辐射在强引力下弯曲，形成亮环和暗影。','采用 8.2 千秒差距、约 26740 光年的地图模型；EHT 页面给出的近似为 27000 光年。地图将标记配准到银心原点，同时保留观测银经银纬。'],['The black hole itself emits no light. Radiation from nearby hot gas is bent by strong gravity into a bright ring around a shadow.','Our map adopts 8.2 kiloparsecs, about 26740 light-years; EHT’s public description rounds to 27000 light-years. The marker is registered to the Galactic origin while observed sky coordinates remain in the record.'],['ブラックホール自体は光を出しません。近くの高温ガスの放射が強い重力で曲げられ、影の周囲に明るいリングを作ります。','地図は 8.2 キロパーセク、約 26740 光年を採用します。EHT の一般向け値は約 27000 光年です。観測座標を残したまま、標識を銀河中心原点に合わせています。']),
  parameters:[param(tr('质量','Mass','質量'),same('≈ 4 × 10⁶ M☉')),param(tr('地图距离','Map distance','地図上の距離'),same('8.2 kpc ≈ 26,740 ly')),param(direction,same('359.94424° / −0.04616°'))],
  image:{src:'/assets/sagittarius-a.jpg',kind:tr('射电观测重建图','Radio observational reconstruction','電波観測の再構成画像'),caption:tr('2022 年公布的 EHT 图像，来自 2017 年 1.3 毫米射电观测。橙色表示射电亮度，不是可见光颜色；这是多次重建的平均图像。','EHT image released in 2022 from 2017 observations at 1.3 mm. Orange represents radio brightness, not visible-light color. This is an average of reconstructed images.','2017 年の 1.3 mm 電波観測から再構成し、2022 年に公表した EHT 画像です。橙色は電波の明るさを示し、可視光の色ではありません。複数の再構成画像を平均しています。'),credit:'EHT Collaboration',sourceUrl:'https://www.eso.org/public/images/eso2208-eht-mwa/',resourceUrl:'https://cdn.eso.org/images/screen/eso2208-eht-mwa.jpg'},
  sources:[source('ESO/EHT — First image of Sagittarius A*','https://www.eso.org/public/images/eso2208-eht-mwa/'),source('ESO/EHT — First Galactic black-hole image','https://www.eso.org/public/news/eso2208-eht-mw/'),source('GRAVITY 2019 — Galactic Center distance','https://arxiv.org/abs/1904.05721'),source('CDS SIMBAD — Sagittarius A*','https://simbad.cds.unistra.fr/simbad/sim-basic?Ident=Sagittarius+A')],
  scaleNote:tr('吸积流与光弯曲为艺术示意；倾角、尺寸与亮度经展示调整，不代表 Sgr A* 的实测气体结构，也不是 EHT 影片或相对论光线追踪。','Accretion flow and light bending are artistic illustrations. Inclination, size and brightness are display choices, not measured Sgr A* gas geometry, an EHT movie or relativistic ray tracing.','降着流と光の曲がりは芸術的模式図です。傾斜・大きさ・明るさは表示用で、Sgr A*の実測ガス構造、EHT動画、相対論的光線追跡ではありません。')
}
];


const categories=['system','system','cluster','nebula','remnant','blackhole'];
const layouts=[[32.8,.0832,0],[28,.2,-6],[41,-1,6],[38,-2,-8],[49,-1,-5],[0,0,0]];
TOUR_DESTINATIONS.forEach((d,i)=>{d.category=categories[i];d.display={position:layouts[i]};d.aliases=[d.id,...Object.values(d.names),...(i===3?['M42','Orion','猎户座']:i===4?['M1','Crab','蟹状']:i===2?['M45','Pleiades','昴星团']:[])];});
const layerNote={zh:'观测图提供轮廓、尘埃与细丝；分层深度为艺术性重建，镜头只做有限视差。地图位置与间距经过展示调整。',en:'Observations supply contours, dust and filaments. Layer depth is artistic reconstruction with limited camera parallax. Map positions and spacing are display-adjusted.',ja:'観測画像が輪郭・塵・繊維を提供します。層の奥行きは芸術的再構成で、視差は限定的です。地図の位置と間隔は表示用に調整しています。'};
for(const d of TOUR_DESTINATIONS)if(['pleiades','orion-nebula','crab-nebula'].includes(d.id))d.scaleNote=layerNote;
TOUR_DESTINATIONS[0].sources.push({title:'NASA Blue Marble — Earth texture',url:'https://visibleearth.nasa.gov/images/57730/the-blue-marble'},{title:'NSO photosphere — granulation and sunspots',url:'https://nso.edu/for-public/sun-science/photosphere/'});
TOUR_DESTINATIONS[0].detail.zh.push('地球使用 NASA Blue Marble 球面合成素材；太阳颗粒、黑子和其他行星云带为参考观测的程序化示意，不是当前太阳活动或天气实况。');
TOUR_DESTINATIONS[0].detail.en.push('Earth uses NASA Blue Marble spherical imagery. Solar granules, spots and other planetary cloud bands are observation-informed illustrations, not current activity or weather.');
TOUR_DESTINATIONS[0].detail.ja.push('地球には NASA Blue Marble の球面合成画像を使います。太陽の粒状斑・黒点や他の惑星の雲帯は観測を参考にした模式表現で、現在の活動や天候ではありません。');
TOUR_DESTINATIONS[5].sources.push(source('NASA — light bending and accretion flow illustration','https://www.nasa.gov/universe/nasa-visualization-shows-a-black-holes-warped-world/'));
TOUR_DESTINATIONS[1].parameters.push({label:{zh:'示意采用半径 A/B/比邻星',en:'Adopted radii A/B/Proxima',ja:'採用半径 A/B/プロキシマ'},value:{zh:'约 1.22 / 0.86 / 0.15 R☉',en:'About 1.22 / 0.86 / 0.15 R☉',ja:'約 1.22 / 0.86 / 0.15 R☉'}});
TOUR_DESTINATIONS[1].sources.push({title:'Kervella et al. — Alpha Centauri radii',url:'https://doi.org/10.1051/0004-6361/201629505'});
TOUR_DESTINATIONS[1].scaleNote={zh:'成员半径比例约 1.22:0.86:0.15；比邻星与 A/B 的真实远距被强烈压缩，表面活动为类太阳恒星示意。',en:'Relative radii are about 1.22:0.86:0.15. Proxima’s much larger separation from A/B is strongly compressed; surface activity is a solar-type illustration.',ja:'半径比は約 1.22:0.86:0.15。プロキシマと A/B の大きな実距離は強く圧縮し、表面活動は太陽型の模式表現です。'};
TOUR_DESTINATIONS[1].sources.push({title:"Kervella et al. 2017 — Proxima radii and orbit",url:'https://www.aanda.org/articles/aa/pdf/2017/02/aa29930-16.pdf'});
TOUR_DESTINATIONS[1].aliases.push('Proxima','比邻星','南门二','プロキシマ');
TOUR_DESTINATIONS[0].scaleNote=SOLAR_DESTINATIONS[0].scaleNote;
TOUR_DESTINATIONS[5].sources.push(source('NASA — light bending and accretion flow illustration','https://www.nasa.gov/universe/nasa-visualization-shows-a-black-holes-warped-world/'));
TOUR_DESTINATIONS[1].parameters.push({label:tr('A/B 真实 / 展示公转周期','A/B real / display orbit period','A/B の実際 / 表示公転周期'),value:same('≈ 79.9 y / 600 s')});
TOUR_DESTINATIONS[1].scaleNote.zh+=' 自转与 A/B 公转速度经过展示调整；轨道为压缩的圆形示意。';
TOUR_DESTINATIONS[1].scaleNote.en+=' Spin and A/B orbital time are display-adjusted; the orbit is a compressed circular illustration.';
TOUR_DESTINATIONS[1].scaleNote.ja+=' 自転とA/Bの公転時間は表示用に調整し、軌道は圧縮した円形の模式表現です。';
for(const d of [...TOUR_DESTINATIONS,...EXPLORATION_DESTINATIONS])d.scope='milky-way';
export const MAP_DESTINATIONS=[...TOUR_DESTINATIONS,...EXPLORATION_DESTINATIONS,...EXTRAGALACTIC_DESTINATIONS,...NEARBY_GALAXIES];
export const DESTINATIONS=[...MAP_DESTINATIONS,...SOLAR_DESTINATIONS];

const newResources={"mercury":"https://images-assets.nasa.gov/image/PIA16853/PIA16853~thumb.jpg","venus":"https://images-assets.nasa.gov/image/PIA00159/PIA00159~thumb.jpg","mars":"https://images-assets.nasa.gov/image/PIA00407/PIA00407~thumb.jpg","moon":"https://images-assets.nasa.gov/image/PIA14011/PIA14011~thumb.jpg","uranus":"https://images-assets.nasa.gov/image/PIA01360/PIA01360~thumb.jpg","andromeda":"https://images-assets.nasa.gov/image/PIA15416/PIA15416~thumb.jpg","large-magellanic-cloud":"https://storage.noirlab.edu/media/archives/images/screen/noao-2123.jpg","small-magellanic-cloud":"https://cdn.eso.org/images/screen/eso1714a.jpg","centaurus-a":"https://cdn.eso.org/images/screen/eso1221a.jpg","jupiter":"https://cdn.esahubble.org/archives/images/screen/heic2017a.jpg","saturn":"https://cdn.esahubble.org/archives/images/screen/heic1917a.jpg","neptune":"https://cdn.esawebb.org/archives/images/screen/weic2214a.jpg","sun":"https://svs.gsfc.nasa.gov/vis/a000000/a003900/a003987/SDOAIA4500A_Jewelbox_stand.HD1080i.00100.jpg"};
for(const d of [...SOLAR_DESTINATIONS,...EXTRAGALACTIC_DESTINATIONS]){d.image.resourceUrl=d.id==='earth'?'https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57730/land_ocean_ice_2048.jpg':newResources[d.id];if(d.scope==='extragalactic'){const icrs={'large-magellanic-cloud':['05 23 34','-69 45 22'],'small-magellanic-cloud':['00 52 45','-72 49 43'],andromeda:['00 42 44.3','+41 16 09'],'centaurus-a':['13 25 27.6','-43 01 09']};Object.assign(d.astrometry,{ra:icrs[d.id][0],dec:icrs[d.id][1],source:'Representative central directions; SIMBAD ICRS J2000',sourceUrl:'https://simbad.cds.unistra.fr/simbad/sim-id?Ident='+encodeURIComponent(d.id==='andromeda'?'M31':d.id==='centaurus-a'?'NGC 5128':d.id==='large-magellanic-cloud'?'LMC':'SMC')});d.sources.push({title:'SIMBAD — representative center',url:d.astrometry.sourceUrl});if(d.id==='large-magellanic-cloud')d.sources.push({title:'ESO — eclipsing-binary distance to the LMC',url:'https://www.eso.org/public/news/eso1311/'});d.parameters.push({label:tr('近似银经 / 银纬','Approximate Galactic l / b','概略の銀経 / 銀緯'),value:same(d.galactic.lDeg+'° / '+d.galactic.bDeg+'°')});}}

export const DESTINATION_BY_ID = Object.fromEntries(DESTINATIONS.map(d=>[d.id,d]));
