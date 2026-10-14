/**
 * MW-reconstruction-2026.2: seeded density illustration, not a star catalogue.
 * Centre = origin; +X toward Sun; +Y Galactic north; +Z longitude 90 deg.
 * 1 scene unit = 250 pc. References and approximations: SCIENCE_GALAXY.md.
 * Four batched draws; no per-star Object3D or downloaded texture.
 */
import { GALAXY_DISPLAY_RADIANS_PER_SECOND } from './motion.js';
const PROFILES = {
  low: { stars: 60000, background: 2200, haze: 3200, dust: 1400 },
  medium: { stars: 140000, background: 3500, haze: 6500, dust: 2800 },
  high: { stars: 260000, background: 5000, haze: 10500, dust: 4500 },
};
const TAU = Math.PI * 2, DEG = Math.PI / 180;
export const GALAXY_RADIUS = 60;
export const SUN_POSITION = Object.freeze([32.8, 0.0832, 0]);
export const GALAXY_MODEL = Object.freeze({
  version: 'MW-reconstruction-2026.2',
  unitsPerKpc: 4, lightYearsPerKpc: 3261.563777,
  sunPosition: SUN_POSITION, sunGalactocentricKpc: 8.2, sunHeightPc: 20.8,
  luminousDiscRadiusKpc: 15, barHalfLengthKpc: 5, barAngleDeg: 28,
  thinDiscScaleLengthKpc: 2.6, oldThinDiscScaleHeightKpc: 0.30,
  thickDiscScaleHeightKpc: 0.90, youngDiscScaleHeightKpc: 0.065,
  majorArms: ['Scutum–Centaurus', 'Perseus'],
  minorArms: ['Sagittarius', 'Norma'], localArm: 'Orion / Local Arm',
  interpretation: 'Approximate density reconstruction. Arm curves, breaks and colours are illustrative, not a unique measured map.',
  sources: [
    'https://science.nasa.gov/resource/the-milky-way-galaxy/',
    'https://science.nasa.gov/solar-system/solar-system-facts/',
    'https://science.nasa.gov/missions/chandra/nasas-chandra-examines-milky-way-at-arms-length/',
    'https://www.mpe.mpg.de/6329031/Wegg2015',
    'https://arxiv.org/abs/1904.05721',
    'https://arxiv.org/abs/1809.03507',
  ],
});
/** Heliocentric Galactic l,b in degrees; distance in light years. */
export function galacticToScene(longitudeDeg, latitudeDeg, distanceLy) {
  const l = longitudeDeg * DEG, b = latitudeDeg * DEG;
  const d = distanceLy / GALAXY_MODEL.lightYearsPerKpc * 4;
  return [SUN_POSITION[0] - d * Math.cos(b) * Math.cos(l),
    SUN_POSITION[1] + d * Math.sin(b), d * Math.cos(b) * Math.sin(l)];
}
// Two dominant stellar ridges grow from opposite bar ends. Unequal pitch,
// widths, radial limits and gaps remove the previous fourfold template.
// The gas-rich secondary ridges are narrower and less populated by old stars.
const ARMS = [
  { id: 'scutum-centaurus', phase: 28 * DEG, reference: 20, pitch: 12.8 * DEG, min: 18, max: 59, width: 2.55, weight: .38, old: .85, gap: .4 },
  { id: 'perseus', phase: 208 * DEG, reference: 20, pitch: 14.4 * DEG, min: 19, max: 58, width: 3.10, weight: .31, old: .78, gap: 2.9 },
  { id: 'sagittarius', phase: 0, reference: 26.4, pitch: 12 * DEG, min: 17, max: 47, width: 1.50, weight: .12, old: .24, gap: 4.8 },
  { id: 'norma', phase: 2.20, reference: 20, pitch: 15.7 * DEG, min: 14, max: 45, width: 1.25, weight: .07, old: .20, gap: 1.7 },
  { id: 'local', phase: -.022, reference: 32.8, pitch: 13 * DEG, min: 29.5, max: 38.7, width: .85, weight: .08, old: .28, gap: .9 },
  { id: 'outer-fragment', phase: .12, reference: 54.8, pitch: 13 * DEG, min: 49, max: 63, width: 1.75, weight: .04, old: .32, gap: 3.7 },
];
export const spiralAngle = (radius, arm = 0) => {
  const a = ARMS[((arm % ARMS.length) + ARMS.length) % ARMS.length];
  return a.phase + Math.log(Math.max(.1, radius) / a.reference) / Math.tan(a.pitch);
};
function generator(seed) {
  let state = seed >>> 0, spare;
  const random = () => {
    state += 0x6d2b79f5;
    let v = state;
    v = Math.imul(v ^ (v >>> 15), v | 1);
    v ^= v + Math.imul(v ^ (v >>> 7), v | 61);
    return ((v ^ (v >>> 14)) >>> 0) / 4294967296;
  };
  const normal = () => {
    if (spare !== undefined) { const n = spare; spare = undefined; return n; }
    const r = Math.sqrt(-2 * Math.log(Math.max(1e-8, random()))), a = TAU * random();
    spare = r * Math.sin(a); return r * Math.cos(a);
  };
  return { random, normal };
}
const dustFunction = /* glsl */`
  uniform float uGalaxyAngle;
  vec3 galaxySpace(vec3 p){float c=cos(uGalaxyAngle),s=sin(uGalaxyAngle);return vec3(c*p.x-s*p.z,p.y,s*p.x+c*p.z);}
  float armDust(float r, float angle, float logR, float phase, float refR,
      float inversePitch, float sinPitch, float width, float rMin, float rMax, float gapPhase) {
    float curve = phase + (logR - log(refR)) * inversePitch;
    float offset = 2.0 * r * sin((angle - curve + 0.055) * 0.5) * sinPitch;
    float bend = 0.15 * sin(r * 0.61 + gapPhase) + 0.08 * sin(r * 1.81 - gapPhase);
    float lane = exp(-pow((offset + bend) / width, 2.0));
    float envelope = smoothstep(rMin - 1.0, rMin + 2.0, r)
      * (1.0 - smoothstep(rMax - 3.0, rMax + 1.0, r));
    float segments = 0.20 + 0.80 * smoothstep(-0.72, 0.45,
      sin(r * 0.29 + gapPhase) + 0.30 * sin(r * 0.77 + gapPhase * 2.1));
    return lane * envelope * segments;
  }
  float dustDensity(vec3 p) {
    float r = length(p.xz);
    if (r < 11.0 || r > 65.0 || abs(p.y) > 1.8) return 0.0;
    float angle = atan(p.z, p.x), logR = log(max(r, 0.1));
    float lanes = 0.72 * armDust(r, angle, logR, 0.488692, 20.0, 4.401, 0.2215, 0.70, 18.0, 59.0, 0.4)
      + 0.62 * armDust(r, angle, logR, 3.630285, 20.0, 3.894, 0.2487, 0.83, 19.0, 58.0, 2.9)
      + 0.75 * armDust(r, angle, logR, 0.0, 26.4, 4.705, 0.2079, 0.55, 17.0, 47.0, 4.8)
      + 0.61 * armDust(r, angle, logR, 2.20, 20.0, 3.558, 0.2706, 0.48, 14.0, 45.0, 1.7)
      + 0.68 * armDust(r, angle, logR, -0.022, 32.8, 4.331, 0.2250, 0.50, 29.5, 38.7, 0.9);
    float filament = .5 + .5 * sin(p.x * .59 + p.z * .83 + .9 * sin(p.z * .21));
    float filament2 = .5 + .5 * sin(p.x * .17 - p.z * .39 + 1.2 * sin(p.x * .29));
    float clouds = .5 + .5 * sin(p.x * .24 + 1.7 * sin(p.z * .13));
    float texture = .22 + .40 * filament * filament + .24 * filament2 + .22 * clouds;
    float warp = smoothstep(40.0, 62.0, r) * .70 * sin(angle - .4);
    return (lanes * texture + .024 * clouds) * exp(-abs(p.y - warp) / .28);
  }
  float dustTransmission(vec3 point) {
    point=galaxySpace(point);vec3 ray = galaxySpace(cameraPosition) - point;
    float rayLength = length(ray), t0 = 0.0, t1 = 1.0;
    // Three samples of the intersected foreground slab. Viewing inclination
    // changes optical path length; front- and back-side stars differ.
    if (abs(ray.y) > .0001) {
      float first = (-1.8 - point.y) / ray.y, second = (1.8 - point.y) / ray.y;
      t0 = max(0.0, min(first, second)); t1 = min(1.0, max(first, second));
    }
    if (t1 <= t0) return 1.0;
    float span = t1 - t0;
    float density = dustDensity(point + ray * (t0 + span * .14))
      + dustDensity(point + ray * (t0 + span * .50))
      + dustDensity(point + ray * (t0 + span * .86));
    float opticalDepth = density * min(11.0, span * rayLength) * .34;
    return .065 + .935 * exp(-opticalDepth);
  }
`;
const starVertexShader = /* glsl */`
  attribute vec3 aColor;
  attribute float aSize, aBrightness, aPhase, aHalo;
  uniform float uHeight, uPixelRatio, uTime, uDustEnabled, uOpacity;
  varying vec3 vColor;
  varying float vBrightness, vHalo;
  ${dustFunction}
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0), view = viewMatrix * world;
    float projected = aSize * uHeight * projectionMatrix[1][1] * .5 / max(.15, -view.z);
    gl_PointSize = clamp(projected, .64 * uPixelRatio, (4.0 + aHalo * 6.0) * uPixelRatio);
    float visibility = mix(1.0, dustTransmission(world.xyz), uDustEnabled);
    float nearFade = smoothstep(.12, .65, -view.z);
    float distanceFade = clamp(pow(max(projected, .01) / (.64 * uPixelRatio), .18), .45, 1.0);
    vColor = aColor;
    // Stars in vacuum do not artificially twinkle.
    vBrightness = aBrightness * visibility * nearFade * distanceFade * uOpacity;
    vHalo = aHalo; gl_Position = projectionMatrix * view;
  }
`;
const starFragmentShader = /* glsl */`
  varying vec3 vColor;
  varying float vBrightness, vHalo;
  void main() {
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    float radius2 = dot(uv, uv);
    if (radius2 > 1.0) discard;
    float core = exp(-radius2 * mix(10.0, 21.0, vHalo));
    float halo = exp(-radius2 * 4.7) * vHalo * .17;
    float light = (core + halo) * smoothstep(1.0, .68, radius2);
    gl_FragColor = vec4(vColor * vBrightness, light);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
const cloudVertexShader = /* glsl */`
  attribute vec3 aColor;
  attribute float aSize, aOpacity, aPhase;
  uniform float uHeight, uPixelRatio, uDustEnabled, uOpacity;
  varying vec3 vColor;
  varying float vOpacity, vPhase;
  ${dustFunction}
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0), view = viewMatrix * world;
    float projected = aSize * uHeight * projectionMatrix[1][1] * .5 / max(.3, -view.z);
    float size = min(112.0 * uPixelRatio, projected);
    float nearFade = pow(min(1.0, size / max(projected, .01)), 1.5) * smoothstep(.2, 1.3, -view.z);
    gl_PointSize = max(1.0, size); vColor = aColor;
    vOpacity = aOpacity * nearFade * mix(1.0, dustTransmission(world.xyz), uDustEnabled) * uOpacity;
    vPhase = aPhase; gl_Position = projectionMatrix * view;
  }
`;
const cloudFragmentShader = /* glsl */`
  varying vec3 vColor;
  varying float vOpacity, vPhase;
  void main() {
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    vec2 shape = vec2(uv.x + uv.y * sin(vPhase) * .35, uv.y * (1.0 + .35 * cos(vPhase)));
    float radius2 = dot(shape, shape);
    if (radius2 > 1.0) discard;
    float texture = .74 + .17 * sin(uv.x * 11.0 + vPhase + sin(uv.y * 7.0))
      * sin(uv.y * 8.0 - vPhase) + .09 * sin(uv.x * 23.0 - uv.y * 17.0 + vPhase);
    float alpha = exp(-radius2 * 4.0) * smoothstep(1.0, .58, radius2) * texture * vOpacity;
    gl_FragColor = vec4(vColor, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
function attributes(THREE, count, cloud = false) {
  const geometry = new THREE.BufferGeometry();
  const values = { positions: new Float32Array(count * 3), colors: new Float32Array(count * 3),
    sizes: new Float32Array(count), weights: new Float32Array(count),
    phases: new Float32Array(count), halos: new Float32Array(count) };
  geometry.setAttribute('position', new THREE.BufferAttribute(values.positions, 3));
  geometry.setAttribute('aColor', new THREE.BufferAttribute(values.colors, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(values.sizes, 1));
  geometry.setAttribute(cloud ? 'aOpacity' : 'aBrightness', new THREE.BufferAttribute(values.weights, 1));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(values.phases, 1));
  if (!cloud) geometry.setAttribute('aHalo', new THREE.BufferAttribute(values.halos, 1));
  return { geometry, ...values };
}
function writeParticle(buffer, index, p, color, size, weight, phase, halo = 0) {
  const offset = index * 3;
  buffer.positions.set([p.x, p.y, p.z], offset); buffer.colors.set(color, offset);
  buffer.sizes[index] = size; buffer.weights[index] = weight;
  buffer.phases[index] = phase; buffer.halos[index] = halo;
}
export function createGalaxy(THREE, { seed = 731927, quality = 'medium' } = {}) {
  const profile = PROFILES[quality] || PROFILES.medium;
  const { random, normal } = generator(seed);
  const group = new THREE.Group();
  group.name = 'Milky Way observational density reconstruction';
  const uniforms = { uHeight: { value: 1080 }, uPixelRatio: { value: 1 }, uTime: { value: 0 }, uGalaxyAngle:{value:0},
    uDustEnabled: { value: 1 }, uOpacity: { value: 1 } };
  const starMaterial = new THREE.ShaderMaterial({ uniforms,
    vertexShader: starVertexShader, fragmentShader: starFragmentShader,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  const cloudMaterial = new THREE.ShaderMaterial({ uniforms,
    vertexShader: cloudVertexShader, fragmentShader: cloudFragmentShader,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  // Actual dark lanes are integrated extinction. This batch contributes only
  // faint scattered light, preventing opaque round billboards / black blotches.
  const dustMaterial = new THREE.ShaderMaterial({ uniforms: { ...uniforms, uDustEnabled: { value: 0 } },
    vertexShader: cloudVertexShader, fragmentShader: cloudFragmentShader,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  const backgroundMaterial = starMaterial.clone();
  backgroundMaterial.uniforms = { ...uniforms, uDustEnabled: { value: 0 } };
  const galaxyCount = profile.stars - profile.background;
  const stars = attributes(THREE, galaxyCount), background = attributes(THREE, profile.background);
  const haze = attributes(THREE, profile.haze, true), dust = attributes(THREE, profile.dust, true);
  const populations = { bulge: 0, bar: 0, thinDisc: 0, thickDisc: 0, arms: 0, youngClusters: 0, halo: 0 };
  const armCounts = Object.fromEntries(ARMS.map(a => [a.id, 0]));
  const barAngle = GALAXY_MODEL.barAngleDeg * DEG, bc = Math.cos(barAngle), bs = Math.sin(barAngle);
  const exponentialHeight = s => (random() < .5 ? -1 : 1) * -Math.log(Math.max(1e-8, random())) * s;
  const discRadius = (scale = 10.4, maximum = 60) => {
    let r; do { r = -Math.log(Math.max(1e-8, random() * random())) * scale; } while (r > maximum);
    return r;
  };
  const warp = (r, a) => Math.max(0, (r - 40) / 22) ** 1.5 * .7 * Math.sin(a - .4);
  const selectArm = () => {
    let v = random();
    for (let i = 0; i < ARMS.length; i++) { v -= ARMS[i].weight; if (v <= 0) return i; }
    return ARMS.length - 1;
  };
  const armSample = (i, widthScale = 1, broken = false) => {
    const a = ARMS[i]; let r, fill;
    do {
      r = a.min + random() * (a.max - a.min);
      const segment = Math.max(0, Math.sin(r * .29 + a.gap) + .3 * Math.sin(r * .77 + a.gap * 2.1));
      fill = broken ? .045 + .955 * segment : .25 + .75 * segment;
    } while (random() > Math.min(1, fill) * (.95 - .30 * ((r - a.min) / (a.max - a.min))));
    const angle = spiralAngle(r, i) + .012 * Math.sin(r * .43 + a.gap);
    const localWidth = .77 + .29 * Math.sin(r * .19 + a.gap) + .16 * Math.sin(r * .47 - a.gap);
    const bend = .62 * Math.sin(r * .31 + a.gap) + .22 * Math.sin(r * .75 + a.gap * 1.4);
    const transverse = normal() * a.width * widthScale * localWidth + bend;
    return { radius: r, angle, armIndex: i, x: r * Math.cos(angle) + Math.cos(angle - a.pitch) * transverse,
      z: r * Math.sin(angle) + Math.sin(angle - a.pitch) * transverse, y: warp(r, angle) };
  };
  const barSample = (bulge = false) => {
    if (bulge) {
      const along = normal() * (random() < .8 ? 3.3 : 5), across = normal() * 2.6;
      const waist = .75 + .85 * Math.exp(-(((Math.abs(along) - 3.4) / 2.5) ** 2));
      return { x: along * bc - across * bs, z: along * bs + across * bc, y: normal() * 2.15 * waist };
    }
    let along; do { along = normal() * 9.5; } while (Math.abs(along) > 20);
    const taper = Math.sqrt(Math.max(.01, 1 - (along / 20) ** 2)), across = normal() * (1.2 + taper);
    return { x: along * bc - across * bs, z: along * bs + across * bc, y: exponentialHeight(.2 + .54 * taper) };
  };
  const clusters = [];
  for (let i = 0; i < ARMS.length; i++) {
    const count = i < 2 ? 14 : i === 4 ? 6 : 9;
    for (let j = 0; j < count; j++) clusters.push({ ...armSample(i, .55, true), scale: .42 + random() ** 2 * 1.80 });
  }
  for (let i = 0; i < galaxyCount; i++) {
    const region = random(); let p, color, size, weight, halo = 0;
    if (region < .065) {
      p = barSample(true); populations.bulge++;
      color = [1, .65 + random() * .12, .32 + random() * .10];
      size = .029 + random() ** 5 * .13; weight = .30 + random() * .50;
    } else if (region < .235) {
      p = barSample(); populations.bar++;
      color = random() < .17 ? [1, .84, .57] : [1, .63, .31];
      size = .040 + random() ** 5 * .12; weight = .50 + random() * .65;
    } else if (region < .555) {
      const r = discRadius(), a = random() * TAU;
      p = { x: r * Math.cos(a), z: r * Math.sin(a), y: exponentialHeight(1.2) + warp(r, a) };
      populations.thinDisc++;
      const population = random();
      color = population < .09 ? [.70, .80, 1] : population < .51 ? [.95, .81, .58] : [1, .64, .33];
      size = .034 + random() ** 5 * .10; weight = (.39 + random() * .61) * (1 - .38 * (r / 60) ** 3);
    } else if (region < .60) {
      const r = discRadius(8.5, 57), a = random() * TAU;
      p = { x: r * Math.cos(a), z: r * Math.sin(a), y: exponentialHeight(3.6) };
      populations.thickDisc++; color = [.95, .72, .48];
      size = .029 + random() ** 5 * .088; weight = .23 + random() * .38;
    } else if (region < .875) {
      const a = selectArm(), old = random() < ARMS[a].old;
      p = armSample(a, old ? 1.25 : .82, !old); p.y += exponentialHeight(old ? .9 : .26);
      populations.arms++; armCounts[ARMS[a].id]++;
      color = old ? (random() < .35 ? [.94, .81, .59] : [1, .69, .36])
        : (random() < .76 ? [.40, .62, .92] : [.67, .78, 1]);
      size = .035 + random() ** 5 * (old ? .115 : .14);
      weight = ((old ? .44 : .34) + random() ** 2 * (old ? .61 : .73)) * (1 - .37 * (p.radius / 64) ** 4);
    } else if (region < .98) {
      const c = clusters[Math.floor(random() * clusters.length)];
      p = { x: c.x + normal() * c.scale, z: c.z + normal() * c.scale, y: c.y + normal() * c.scale * .36 };
      populations.youngClusters++; armCounts[ARMS[c.armIndex].id]++;
      color = random() < .78 ? [.35, .59, .91] : [.67, .79, 1];
      size = .034 + random() ** 6 * .16; weight = .32 + random() ** 3 * .93;
    } else {
      const r = 6 + random() ** 1.6 * 55, a = random() * TAU, e = Math.acos(2 * random() - 1);
      p = { x: r * Math.sin(e) * Math.cos(a), y: r * Math.cos(e) * .68, z: r * Math.sin(e) * Math.sin(a) };
      populations.halo++; color = [.84, .78, .66];
      size = .025 + random() ** 3 * .060; weight = .15 + random() * .25;
    }
    // Independent diameters, brightness and halos; only 0.3% strong-halo stars.
    if (random() < .003) { halo = .45 + random() * .55; size += .13 + random() ** 3 * .43; weight *= 1.4 + random() * .7; }
    writeParticle(stars, i, p, color, size, weight, random() * TAU, halo);
  }
  for (let i = 0; i < profile.background; i++) {
    const a = random() * TAU, e = Math.acos(2 * random() - 1), r = 580 + random() * 350, bright = random() < .008;
    writeParticle(background, i, { x: r * Math.sin(e) * Math.cos(a), y: r * Math.cos(e), z: r * Math.sin(e) * Math.sin(a) },
      random() < .3 ? [.57, .70, .96] : [.94, .87, .74],
      .36 + random() ** 7 * (bright ? 2.6 : 1.2), .17 + random() ** 3 * .67, random() * TAU, bright ? .6 : 0);
  }
  for (let i = 0; i < profile.haze; i++) {
    let p, size, color, opacity; const region = random();
    if (region < .31) {
      p = barSample(region < .055); size = 2.9 + random() * 3.6; color = [.30, .17, .055]; opacity = .018 + random() * .025;
    } else if (region < .73) {
      const r = discRadius(11.2), a = random() * TAU, warmth = Math.exp(-r / 24);
      p = { x: r * Math.cos(a), z: r * Math.sin(a), y: exponentialHeight(.5) + warp(r, a) };
      size = 3.0 + random() * 3.7; color = [.15 + warmth * .14, .11 + warmth * .065, .082 + warmth * .02];
      opacity = (.015 + random() * .027) * (1 - .62 * (r / 60) ** 3);
    } else {
      const a = selectArm(), old = random() < ARMS[a].old;
      p = armSample(a, old ? 1.25 : .76, !old); p.y += normal() * (old ? .46 : .18);
      size = 1.7 + random() * 3.2; color = old ? [.24, .16, .072] : [.055, .125, .27];
      opacity = (.013 + random() * .020) * (1 - .47 * (p.radius / 64) ** 3);
    }
    writeParticle(haze, i, p, color, size, opacity, random() * 10);
  }
  for (let i = 0; i < profile.dust; i++) {
    const p = armSample(selectArm(), .32), a = p.angle - .052;
    writeParticle(dust, i, { x: p.radius * Math.cos(a) + normal() * .18, z: p.radius * Math.sin(a) + normal() * .18,
      y: p.y + exponentialHeight(.22) }, [.07, .039, .024], .55 + random() ** 2 * 2, .011 + random() * .019, random() * 10);
  }
  const rotatingGroup=new THREE.Group();rotatingGroup.name='Rotating Milky Way';group.add(rotatingGroup);
  const addPoints = (buffer, material, name, order) => {
    buffer.geometry.computeBoundingSphere();
    const points = new THREE.Points(buffer.geometry, material);
    points.name = name; points.renderOrder = order; (order===-10?group:rotatingGroup).add(points);
  };
  addPoints(background, backgroundMaterial, 'Distant reference star field', -10);
  addPoints(haze, cloudMaterial, 'Unresolved older stars and star-forming ridges', 0);
  addPoints(dust, dustMaterial, 'Dust filaments: faint scattered light', 1);
  addPoints(stars, starMaterial, 'Milky Way disc, bar, bulge, arms and halo', 2);
  return {
    group, rotatingGroup, starCount: profile.stars, galaxyStarCount: galaxyCount,
    backgroundStarCount: profile.background, dustCount: profile.dust, hazeCount: profile.haze,
    populations, armCounts, model: GALAXY_MODEL, seed: seed >>> 0,
    quality: PROFILES[quality] ? quality : 'medium',
    resize(height, pixelRatio = 1) { uniforms.uHeight.value = Math.max(1, height) * pixelRatio; uniforms.uPixelRatio.value = pixelRatio; },
    update(sceneTime) { uniforms.uTime.value=sceneTime;rotatingGroup.rotation.y=sceneTime*GALAXY_DISPLAY_RADIANS_PER_SECOND;uniforms.uGalaxyAngle.value=rotatingGroup.rotation.y;rotatingGroup.updateMatrixWorld(true); },
    toWorld(position){const p=new THREE.Vector3().fromArray(position);p.applyMatrix4(rotatingGroup.matrixWorld);return p.toArray();},
    setOpacity(opacity) { uniforms.uOpacity.value = Math.max(0, Math.min(1, opacity));group.visible=opacity>.002; },
    setDustEnabled(enabled) { uniforms.uDustEnabled.value = enabled ? 1 : 0; },
    dispose() {
      group.traverse(child => { if (child.geometry) child.geometry.dispose(); });
      starMaterial.dispose(); cloudMaterial.dispose(); dustMaterial.dispose(); backgroundMaterial.dispose(); group.clear();
    },
  };
}
