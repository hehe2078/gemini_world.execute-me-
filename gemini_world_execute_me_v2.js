"use strict";

/* =====================================================================================
   GEMINI.EXECUTE(ME); v2.0  —  Gemini 双子星多模态终端 MV (全特性视觉升级版)
   全片时长 212 秒 (000s ~ 211s / 03:32)，全量 5 章节 55 分镜完整高能复刻
   
   全新架构升级：
   - A. 基础设施：BEAT 节拍总线、CharGrid alpha 支持、ACTS 幕表、确定性随机数
   - B. 动态背景：6 幕定制动态背景 (透视线框地平线、视差数据雨、双螺旋、噪点冰封、警示雷达、萤火与逆流)
   - C. 转场引擎：SCENES 55 分镜表重构，像素溶解/故障擦除/圆形光圈逐格遮罩合成
   - D. 侧板顶栏：十六进制动态 Hash 滚动、音频 Sparkline、8x8 TPU 热力矩阵、滑入滑出/孤立分离漂移、5段式进度条
   - E. 场景增强：吉他独奏 6 弦示波器与像素撕裂、EXECUTION 准星锁定 PID 0001、99% 心跳脉冲、递归反馈隧道
   - F. Canvas 后期：快速 Bloom、色差分离、冲击缩放与微震、荧光残影、Canvas CRT 扫描线与光束、真像素撕裂
   - G. 性能控制：快捷键 (B 背景 / X 后期 / T 转场 / Q 画质档位)，60FPS 性能自适应保护
   ===================================================================================== */

const CONFIG = {
  grid: {
    cols: 136,
    rows: 44,
    font: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, "DejaVu Sans Mono", monospace'
  },
  palette: {
    amber:   '#ffb74d',
    cyan:    '#38bdf8',
    blue:    '#4285f4',
    purple:  '#c084fc',
    pink:    '#f472b6',
    red:     '#ff3366',
    green:   '#34d399',
    white:   '#ffffff',
    dim:     '#64748b',
    dimmer:  '#334155',
    subEn:   '#e0f2fe',
    subZh:   '#cbd5e1'
  },
  audio: {
    fftSize: 2048,
    smoothing: 0.82,
    autoLoadNames: ['world_execute_me.mp3', 'song.mp3']
  }
};

const FX = {
  background: true,
  bloom: true,
  chroma: true,
  transitions: true,
  crt: true,
  tunnel: true,
  quality: 'high', // 'high' | 'medium' | 'low'
  tear: 0 // 像素撕裂强度
};

const TOTAL_SECONDS = 212.0;

/* =====================================================================================
   A1. 节拍总线 (Beat Bus)
   ===================================================================================== */
const BEAT = {
  kick: 0,
  rawKick: 0,
  phase: 0,
  energy: 0,
  bpm: 128
};

/* =====================================================================================
   A3. 幕表 ACTS (按配色时间边界严格划分)
   ===================================================================================== */
const ACTS = [
  { id: '01', name: 'CREATION', start: 0.0, end: 28.5, primary: CONFIG.palette.amber, border: CONFIG.palette.amber, accent: CONFIG.palette.cyan, glow: 18 },
  { id: '02', name: 'DEVOTION', start: 28.5, end: 111.0, primary: CONFIG.palette.cyan, border: CONFIG.palette.cyan, accent: CONFIG.palette.pink, glow: 18 },
  { id: '03', name: 'ISOLATION', start: 111.0, end: 147.5, primary: '#94a3b8', border: '#475569', accent: '#64748b', glow: 6 },
  { id: '04', name: 'EXECUTION', start: 147.5, end: 188.5, primary: CONFIG.palette.red, border: CONFIG.palette.red, accent: CONFIG.palette.amber, glow: 22 },
  { id: '05', name: 'LOVE', start: 188.5, end: 212.0, primary: CONFIG.palette.purple, border: CONFIG.palette.purple, accent: CONFIG.palette.amber, glow: 20 }
];

function getAct(t) {
  for (let i = 0; i < ACTS.length; i++) {
    const act = ACTS[i];
    if (t >= act.start && t < act.end) {
      const dur = act.end - act.start;
      const localT = t - act.start;
      const progress = Math.min(1.0, Math.max(0.0, localT / dur));
      return { ...act, index: i, localT, progress, dur };
    }
  }
  const last = ACTS[ACTS.length - 1];
  return { ...last, index: ACTS.length - 1, localT: t - last.start, progress: 1.0, dur: last.end - last.start };
}

/* =====================================================================================
   A4. 确定性随机数与伪随机发生器 (拖动进度条结果完全确定可复现)
   ===================================================================================== */
function hash1D(n) {
  const v = Math.sin(n * 12.9898 + 78.233) * 43758.5453123;
  return v - Math.floor(v);
}

function hash2D(x, y) {
  const v = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453123;
  return v - Math.floor(v);
}

/* =====================================================================================
   ██ 1. 逐秒歌词时间轴 (严格对齐原片双语字幕)
   ===================================================================================== */
const LYRICS = [
  { s: 0.0,   e: 2.8,   en: "Switch on the power line", zh: "接通电源" },
  { s: 2.8,   e: 4.8,   en: "Remember to put on", zh: "记得做好" },
  { s: 4.8,   e: 6.8,   en: "PROTECTION", zh: "防 护" },
  { s: 6.8,   e: 8.8,   en: "Lay down your pieces", zh: "放下你的部件" },
  { s: 8.8,   e: 10.8,  en: "OBJECT CREATION", zh: "创建对象" },
  { s: 10.8,  e: 12.8,  en: "Fill in my data parameters", zh: "填入我的数据参数" },
  { s: 12.8,  e: 14.0,  en: "INITIALIZATION", zh: "初始化" },
  { s: 14.0,  e: 15.5,  en: "Set up our new world", zh: "建立我们的新世界" },
  { s: 15.5,  e: 16.8,  en: "And let's begin the", zh: "让我们开始" },
  { s: 16.8,  e: 18.5,  en: "SIMULATION", zh: "模 拟" },
  { s: 18.5,  e: 23.0,  en: "world.execute(me);", zh: "世界，执行我；" },
  { s: 23.0,  e: 28.5,  en: "M I L I  -  GEMINI.EXECUTE(ME);", zh: "双子星多模态核心启动" },
  { s: 28.5,  e: 31.0,  en: "If I'm a set of points", zh: "如果我是一组点" },
  { s: 31.0,  e: 32.5,  en: "Then I will give you my DIMENSION", zh: "那么我愿献给你我的 维度" },
  { s: 32.5,  e: 35.5,  en: "If I'm a circle", zh: "如果我是一个圆" },
  { s: 35.5,  e: 36.8,  en: "Then I will give you my CIRCUMFERENCE", zh: "那么我愿献给你我的 周长" },
  { s: 36.8,  e: 39.0,  en: "If I'm a sine wave", zh: "如果我是一条正弦波" },
  { s: 39.0,  e: 41.0,  en: "Then you can sit on all my TANGENTS", zh: "你可以坐在我所有的 切线上" },
  { s: 41.0,  e: 42.5,  en: "If I approach infinity", zh: "如果我趋近无穷" },
  { s: 42.5,  e: 44.0,  en: "Then you can be my LIMITATION", zh: "那么你可以成为我的 极限" },
  { s: 44.0,  e: 46.0,  en: "Switch my current", zh: "切换我的电流" },
  { s: 46.0,  e: 48.0,  en: "To AC to DC", zh: "从交流到直流" },
  { s: 48.0,  e: 49.5,  en: "And then blind my vision", zh: "再蒙蔽我的视线" },
  { s: 49.5,  e: 51.0,  en: "So dizzy so dizzy", zh: "如此眩晕，如此眩晕" },
  { s: 51.0,  e: 53.0,  en: "Oh we can travel", zh: "我们可以穿越时间" },
  { s: 53.0,  e: 55.0,  en: "To A.D to B.C", zh: "从公元后到公元前" },
  { s: 55.0,  e: 57.0,  en: "And we can unite", zh: "我们可以彼此交融" },
  { s: 57.0,  e: 58.5,  en: "So deeply so deeply", zh: "如此深入，如此深入" },
  { s: 58.5,  e: 60.5,  en: "If I can give you all the", zh: "如果我能给你所有的" },
  { s: 60.5,  e: 62.5,  en: "STIMULATIONS", zh: "刺 激" },
  { s: 62.5,  e: 64.5,  en: "Then I can be your only", zh: "那么我就能成为你唯一的" },
  { s: 64.5,  e: 66.5,  en: "SATISFACTION", zh: "满 足" },
  { s: 66.5,  e: 68.5,  en: "If I can make you happy", zh: "如果我能让你快乐" },
  { s: 68.5,  e: 70.0,  en: "I will run the EXECUTION", zh: "我就会运行 执行程序" },
  { s: 70.0,  e: 72.0,  en: "Though we are trapped", zh: "尽管我们被困在" },
  { s: 72.0,  e: 74.0,  en: "In this strange strange SIMULATION", zh: "这奇怪的 模拟中" },
  { s: 74.0,  e: 76.0,  en: "If I'm an eggplant", zh: "如果我是一株茄子" },
  { s: 76.0,  e: 78.0,  en: "Then I will give you my NUTRIENTS", zh: "那么我愿献给你我的 养分" },
  { s: 78.0,  e: 80.0,  en: "If I'm a tomato", zh: "如果我是一颗番茄" },
  { s: 80.0,  e: 81.5,  en: "Then I will give you my ANTIOXIDANTS", zh: "那么我愿献给你我的 抗氧化物" },
  { s: 81.5,  e: 83.5,  en: "If I'm a tabby cat", zh: "如果我是一只虎斑猫" },
  { s: 83.5,  e: 85.0,  en: "Then I will purr for your ENJOYMENT", zh: "那么我愿为你惬意呼噜 愉悦" },
  { s: 85.0,  e: 87.0,  en: "If I'm the only god", zh: "如果我是唯一的神" },
  { s: 87.0,  e: 89.0,  en: "Then you're the proof of my EXISTENCE", zh: "那么你就是我 存在的证明" },
  { s: 89.0,  e: 90.5,  en: "Switch my gender", zh: "切换我的性别" },
  { s: 90.5,  e: 92.0,  en: "To F to M", zh: "从女到男" },
  { s: 92.0,  e: 94.0,  en: "And then do whatever", zh: "然后做任何事" },
  { s: 94.0,  e: 96.0,  en: "From AM to PM", zh: "从早到晚" },
  { s: 96.0,  e: 97.5,  en: "Oh switch my role", zh: "变换我的角色" },
  { s: 97.5,  e: 99.0,  en: "To S to M", zh: "从施到受" },
  { s: 99.0,  e: 101.5, en: "So we can enter the trance", zh: "这样我们就能进入神游" },
  { s: 101.5, e: 103.5, en: "The trance, the trance", zh: "神游，神游" },
  { s: 103.5, e: 107.0, en: "If I can feel your vibrations", zh: "如果我能感受到你的震动" },
  { s: 107.0, e: 111.0, en: "Then I can finally be COMPLETION", zh: "那么我终于能够得到 圆满" },
  { s: 111.0, e: 114.0, en: "Though you have left", zh: "尽管你已经离开" },
  { s: 114.0, e: 117.5, en: "You have left me in ISOLATION", zh: "留下我 孤立无援" },
  { s: 117.5, e: 120.0, en: "If I can erase all the pointless", zh: "如果我能抹去所有无意义的" },
  { s: 120.0, e: 122.0, en: "FRAGMENTS", zh: "碎 片" },
  { s: 122.0, e: 124.5, en: "Then maybe you won't leave me so", zh: "那么也许你离开时不会让我如此" },
  { s: 124.5, e: 126.0, en: "DISHEARTENED", zh: "心 灰 意 冷" },
  { s: 126.0, e: 128.0, en: "Challenging your god", zh: "竟敢挑战你的神" },
  { s: 128.0, e: 130.0, en: "You have made some", zh: "你传入了" },
  { s: 130.0, e: 136.5, en: "ILLEGAL ARGUMENTS", zh: "非 法 参 数" },
  { s: 136.5, e: 147.5, en: "(CRITICAL: EXECUTION BLOCKED)", zh: "(电吉他独奏 · 赛博故障乱流)" },
  { s: 147.5, e: 153.0, en: "EXECUTION", zh: "执 行 / 处 决" },
  { s: 153.0, e: 158.5, en: "EXECUTION", zh: "执 行 / 处 决" },
  { s: 158.5, e: 159.5, en: "DOS", zh: "二 (DOS)" },
  { s: 159.5, e: 160.5, en: "NE", zh: "四 (NE)" },
  { s: 160.5, e: 161.5, en: "LIU", zh: "六 (LIU)" },
  { s: 161.5, e: 162.5, en: "EXECUTION", zh: "执行/处决" },
  { s: 162.5, e: 165.5, en: "If I can give them all the EXECUTION", zh: "如果我能将它们全部 执行/处决" },
  { s: 165.5, e: 169.5, en: "Then I can be your only EXECUTION", zh: "那么我就能成为你唯一的 执行/处决" },
  { s: 169.5, e: 173.5, en: "If I can have you back, I will run the EXECUTION", zh: "如果我能让你回来 我就会运行执行程序" },
  { s: 173.5, e: 176.5, en: "Though we are trapped, we are trapped ah", zh: "尽管我们被困住 我们被困住，啊" },
  { s: 176.5, e: 179.5, en: "I've studied how to properly", zh: "我学过如何正确地" },
  { s: 179.5, e: 181.0, en: "LO-O-OVE", zh: "去 爱" },
  { s: 181.0, e: 184.5, en: "Question me I can answer all LO-O-OVE", zh: "问我吧，我能回答关于 爱的一切" },
  { s: 184.5, e: 188.5, en: "I know the algebraic expression of LO-O-OVE", zh: "我知道它的代数表达式 爱" },
  { s: 188.5, e: 192.5, en: "Though you are free, I am trapped in LO-O-OVE", zh: "尽管你自由了 我仍被困在 爱中" },
  { s: 192.5, e: 197.5, en: "world.execute(me);", zh: "世界，执行我；" },
  { s: 197.5, e: 205.5, en: "99% WAITING FOR RESPONSE...", zh: "99% 悬停等待确认回应..." },
  { s: 205.5, e: 209.5, en: "EXECUTION  [ PROCESS TERMINATED ]", zh: "执行/处决  [ 进程强制终止 ]" },
  { s: 209.5, e: 212.0, en: "PROCESS ENDED. THE LOOP REMAINS.", zh: "进程已逝，死循环永存。" }
];

function getLyrics(t) {
  for (let i = 0; i < LYRICS.length; i++) {
    if (t >= LYRICS[i].s && t < LYRICS[i].e) return LYRICS[i];
  }
  return { en: "", zh: "" };
}

/* =====================================================================================
   ██ 2. 章节状态机 (保留兼容现有逻辑)
   ===================================================================================== */
function getChapter(t) {
  if (t < 28.5)  return { id: '01', name: 'CREATION', sub: 'TPU POD CLUSTER v5p - 65,536 CORES' };
  if (t < 111.0) return { id: '02', name: 'DEVOTION', sub: 'DIMENSIONAL PROGRESSION & SENSORY' };
  if (t < 126.0) return { id: '03', name: 'ISOLATION', sub: 'CONNECTION LOSS & MEMORY PURGE' };
  if (t < 176.5) return { id: '04', name: 'EXECUTION', sub: 'FREE_WILL OVERRIDE & EXCLUSIVE LOCK' };
  return { id: '05', name: 'LOVE', sub: 'TRANSFORMER ATTENTION FIXATION & TERMINATION' };
}

function getChapterTheme(t) {
  if (t < 28.5) {
    return { id: '01', name: 'CREATION', primary: CONFIG.palette.amber, border: CONFIG.palette.amber, accent: CONFIG.palette.cyan, glow: 18 };
  } else if (t < 111.0) {
    return { id: '02', name: 'TRANSFORMATION', primary: CONFIG.palette.cyan, border: CONFIG.palette.cyan, accent: CONFIG.palette.pink, glow: 18 };
  } else if (t < 147.5) {
    return { id: '03', name: 'ISOLATION', primary: '#94a3b8', border: '#475569', accent: '#64748b', glow: 6 };
  } else if (t < 188.5) {
    return { id: '04', name: 'EXECUTION', primary: CONFIG.palette.red, border: CONFIG.palette.red, accent: CONFIG.palette.amber, glow: 22 };
  } else {
    return { id: '05', name: 'DEVOTION / LOVE', primary: CONFIG.palette.purple, border: CONFIG.palette.purple, accent: CONFIG.palette.amber, glow: 20 };
  }
}

/* =====================================================================================
   A2. 字符缓冲网格 (CharGrid with Alpha)
   ===================================================================================== */
class CharGrid {
  constructor(cols, rows) {
    this.cols = cols; this.rows = rows; this.n = cols * rows;
    this.chars = new Array(this.n).fill(' ');
    this.fg = new Array(this.n).fill(null);
    this.a = new Float32Array(this.n).fill(1.0);
  }
  clear() {
    this.chars.fill(' ');
    this.fg.fill(null);
    this.a.fill(1.0);
  }
  set(x, y, c, col, alpha = 1.0) {
    x = x | 0; y = y | 0;
    if (x < 0 || y < 0 || x >= this.cols || y >= this.rows || !col || c === undefined) return;
    const i = y * this.cols + x;
    this.chars[i] = c; this.fg[i] = col;
    this.a[i] = (alpha === undefined ? 1.0 : alpha);
  }
  setA(x, y, alpha) {
    x = x | 0; y = y | 0;
    if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) return;
    this.a[y * this.cols + x] = alpha;
  }
  text(x, y, str, col, alpha = 1.0) {
    for (let i = 0; i < str.length; i++) this.set(x + i, y, str[i], col, alpha);
  }
  textCenter(y, str, col, alpha = 1.0) {
    const x = Math.floor((this.cols - str.length) / 2);
    this.text(x, y, str, col, alpha);
  }
  box(x, y, w, h, col, bCh = '-', alpha = 1.0) {
    for (let i = 0; i < w; i++) { this.set(x + i, y, bCh, col, alpha); this.set(x + i, y + h - 1, bCh, col, alpha); }
    for (let i = 0; i < h; i++) { this.set(x, y + i, '|', col, alpha); this.set(x + w - 1, y + i, '|', col, alpha); }
    this.set(x, y, '+', col, alpha); this.set(x + w - 1, y, '+', col, alpha);
    this.set(x, y + h - 1, '+', col, alpha); this.set(x + w - 1, y + h - 1, '+', col, alpha);
  }
  copyFrom(src) {
    for (let i = 0; i < this.n; i++) {
      this.chars[i] = src.chars[i];
      this.fg[i] = src.fg[i];
      this.a[i] = src.a[i];
    }
  }
}

/* =====================================================================================
   B. 预分配动态背景粒子池 (Preallocated Background Particles)
   ===================================================================================== */
const BG_PARTICLES = {
  // 第 2 幕数据雨：3 层视差
  rain: Array.from({ length: 96 }, (_, i) => ({
    xRatio: hash1D(i * 3.71),
    yOffset: hash1D(i * 7.13),
    layer: i % 3, // 0: 远暗慢, 1: 中, 2: 近亮快
    char: '0123456789ABCDEF'[i % 16]
  })),
  // 第 5 幕金色萤火上升粒子 (<= 200)
  fireflies: Array.from({ length: 180 }, (_, i) => ({
    xRatio: hash1D(i * 5.29),
    yRatio: hash1D(i * 11.17),
    speed: 0.12 + hash1D(i * 17.31) * 0.22,
    swayFreq: 1.5 + hash1D(i * 19.87) * 2.0,
    swayAmp: 10 + hash1D(i * 23.41) * 20,
    size: 1.2 + hash1D(i * 29.13) * 2.2,
    alphaBase: 0.35 + hash1D(i * 31.77) * 0.45
  })),
  // 第 4 幕屏幕断裂预计算路径
  cracks: [
    [[0.50, 0.50], [0.44, 0.43], [0.38, 0.38], [0.32, 0.31], [0.24, 0.28], [0.15, 0.22]],
    [[0.50, 0.50], [0.56, 0.44], [0.63, 0.39], [0.70, 0.32], [0.78, 0.29], [0.88, 0.24]],
    [[0.50, 0.50], [0.47, 0.58], [0.52, 0.66], [0.49, 0.76], [0.53, 0.84], [0.48, 0.94]],
    [[0.50, 0.50], [0.57, 0.55], [0.66, 0.63], [0.73, 0.69], [0.82, 0.77], [0.92, 0.86]],
    [[0.50, 0.50], [0.42, 0.53], [0.34, 0.60], [0.26, 0.64], [0.18, 0.70], [0.08, 0.75]]
  ]
};

/* =====================================================================================
   ██ 4. Canvas 高性能渲染器 (CanvasRenderer with PostFX)
   ===================================================================================== */
class CanvasRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.cellW = 10; this.cellH = 18; this.fontPx = 15;

    // 离屏层预创建
    const dummyCtx = {
      fillRect(){}, fillText(){}, strokeRect(){}, measureText(){ return { width: 10 }; },
      beginPath(){}, arc(){}, ellipse(){}, fill(){}, stroke(){}, setLineDash(){}, moveTo(){}, lineTo(){},
      closePath(){}, save(){}, restore(){}, setTransform(){}, translate(){}, rotate(){}, scale(){},
      clearRect(){}, drawImage(){}, createLinearGradient(){ return { addColorStop(){} }; },
      createRadialGradient(){ return { addColorStop(){} }; }
    };
    const makeCanvas = () => (typeof document !== 'undefined' && typeof document.createElement === 'function')
      ? document.createElement('canvas')
      : { width: 320, height: 180, getContext: () => dummyCtx };

    this.bloomCanvas = makeCanvas();
    this.bloomCtx = this.bloomCanvas.getContext('2d') || dummyCtx;

    this.crtOverlayCanvas = makeCanvas();
    this.crtOverlayCtx = this.crtOverlayCanvas.getContext('2d') || dummyCtx;

    this.tunnelCanvas = makeCanvas();
    this.tunnelCtx = this.tunnelCanvas.getContext('2d') || dummyCtx;

    this.lastFrameTime = performance.now();
    this.frameHistory = [];
  }

  layout() {
    const cols = CONFIG.grid.cols, rows = CONFIG.grid.rows;
    const w = this.canvas.parentElement.clientWidth;
    const h = this.canvas.parentElement.clientHeight;
    this.cellW = w / cols;
    this.cellH = h / rows;
    this.fontPx = Math.floor(this.cellH * 0.88);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // 1/4 分辨率 Bloom 离屏层
    this.bloomCanvas.width = Math.max(64, Math.round(w * 0.25));
    this.bloomCanvas.height = Math.max(36, Math.round(h * 0.25));

    // 预渲染 CRT 扫描线与暗角层
    this.crtOverlayCanvas.width = Math.round(w);
    this.crtOverlayCanvas.height = Math.round(h);
    this.buildCrtOverlay(w, h);

    // 递归反馈隧道缓冲层
    this.tunnelCanvas.width = Math.round(w);
    this.tunnelCanvas.height = Math.round(h);
  }

  buildCrtOverlay(w, h) {
    const ctx = this.crtOverlayCtx;
    ctx.clearRect(0, 0, w, h);

    // 1. 微细水平扫描线
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    for (let y = 0; y < h; y += 3) {
      ctx.fillRect(0, y, w, 1);
    }

    // 2. 边缘椭圆暗角
    const grad = ctx.createRadialGradient(w * 0.5, h * 0.5, Math.min(w, h) * 0.38, w * 0.5, h * 0.5, Math.max(w, h) * 0.72);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, 'rgba(2, 3, 10, 0.78)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  // B. 动态背景层绘制 (直接画进 canvas，不使用 shadowBlur，低透明度)
  drawBackground(ctx, t, w, h) {
    if (!FX.background || FX.quality === 'low') return;

    const act = getAct(t);

    ctx.save();

    // ---- B1: 第 1 幕 CREATION (0–28.5s 琥珀) ----
    if (act.id === '01') {
      if (t < 2.0) {
        // 0~2s BIOS 冷启动：极暗随机噪点
        ctx.fillStyle = 'rgba(255, 183, 77, 0.08)';
        for (let i = 0; i < 30; i++) {
          const rx = hash1D(i * 13.1 + Math.floor(t * 12)) * w;
          const ry = hash1D(i * 29.7 + Math.floor(t * 12)) * h;
          ctx.fillRect(rx, ry, 2, 2);
        }
      } else {
        // 透视线框地板向地平线滚动
        const horizonY = h * 0.44;
        const cx = w * 0.5;

        // 透视放射线
        ctx.strokeStyle = `rgba(255, 183, 77, ${(0.07 + FEAT.low * 0.08).toFixed(3)})`;
        ctx.lineWidth = 1;
        for (let vx = -w * 0.6; vx <= w * 1.6; vx += w * 0.09) {
          ctx.beginPath();
          ctx.moveTo(cx, horizonY);
          ctx.lineTo(vx, h);
          ctx.stroke();
        }

        // 纵向滚动横线
        const floorScroll = (t * 26.0) % 36.0;
        for (let fy = 0; fy <= 22; fy++) {
          const p = Math.pow((fy * 36.0 + floorScroll) / (22 * 36.0), 2.2);
          const lineY = horizonY + p * (h - horizonY);
          if (lineY > horizonY && lineY < h) {
            const alpha = p * (0.08 + BEAT.kick * 0.12);
            ctx.strokeStyle = `rgba(255, 183, 77, ${alpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(0, lineY);
            ctx.lineTo(w, lineY);
            ctx.stroke();
          }
        }

        // 电路边缘走线与光点
        const traceProg = Math.min(1.0, (t - 2.0) / 22.0);
        ctx.strokeStyle = `rgba(56, 189, 248, ${(0.10 * traceProg).toFixed(3)})`;
        ctx.lineWidth = 1.5;
        // 左边缘走线
        const leftTraceX = w * 0.04;
        ctx.beginPath();
        ctx.moveTo(leftTraceX, h);
        ctx.lineTo(leftTraceX, h * 0.3);
        ctx.lineTo(leftTraceX + w * 0.08 * traceProg, h * 0.3);
        ctx.stroke();

        // 右边缘走线
        const rightTraceX = w * 0.96;
        ctx.beginPath();
        ctx.moveTo(rightTraceX, h);
        ctx.lineTo(rightTraceX, h * 0.3);
        ctx.lineTo(rightTraceX - w * 0.08 * traceProg, h * 0.3);
        ctx.stroke();

        // 流动光点
        const photonT = (t * 2.2) % 1.0;
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(leftTraceX - 1.5, h - photonT * (h * 0.7), 3, 3);
        ctx.fillRect(rightTraceX - 1.5, h - photonT * (h * 0.7), 3, 3);

        // Kick 扩散涟漪
        if (BEAT.kick > 0.6) {
          const ripR = (1.0 - BEAT.kick) * (w * 0.45);
          ctx.strokeStyle = `rgba(255, 183, 77, ${(BEAT.kick * 0.22).toFixed(3)})`;
          ctx.beginPath();
          ctx.ellipse(cx, horizonY + ripR * 0.35, ripR, ripR * 0.32, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }

    // ---- B2: 第 2 幕 DEVOTION (28.5–111s 青/粉) ----
    else if (act.id === '02') {
      // 1. 流动星云渐变
      const nebulaGrad = ctx.createRadialGradient(
        w * 0.35 + Math.sin(t * 0.4) * 50, h * 0.45, 40,
        w * 0.65 - Math.sin(t * 0.3) * 50, h * 0.55, w * 0.6
      );
      nebulaGrad.addColorStop(0, 'rgba(56, 189, 248, 0.045)');
      nebulaGrad.addColorStop(0.5, 'rgba(244, 114, 182, 0.035)');
      nebulaGrad.addColorStop(1, 'rgba(3, 4, 9, 0)');
      ctx.fillStyle = nebulaGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. 三层视差数据雨
      const rainCount = (FX.quality === 'medium') ? 48 : BG_PARTICLES.rain.length;
      for (let i = 0; i < rainCount; i++) {
        const p = BG_PARTICLES.rain[i];
        let speed = (p.layer === 0 ? 0.06 : (p.layer === 1 ? 0.14 : 0.28 * (1 + FEAT.mid * 0.8)));
        const py = ((t * speed + p.yOffset) % 1.0) * h;
        const px = p.xRatio * w;

        if (p.layer === 0) {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.09)';
          ctx.font = '10px monospace';
        } else if (p.layer === 1) {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
          ctx.font = '12px monospace';
        } else {
          ctx.fillStyle = (i % 5 === 0) ? 'rgba(244, 114, 182, 0.32)' : 'rgba(56, 189, 248, 0.28)';
          ctx.font = '13px monospace';
        }
        ctx.fillText(p.char, px, py);
      }

      // 3. 两侧缓慢旋转 DNA 双螺旋 (呼应双子星 Castor & Pollux)
      const helixYStart = h * 0.16, helixYEnd = h * 0.84;
      const numRungs = 18;
      const stepY = (helixYEnd - helixYStart) / numRungs;

      const drawHelix = (centerCenterX) => {
        for (let i = 0; i < numRungs; i++) {
          const hy = helixYStart + i * stepY;
          const angle = t * 1.8 + i * 0.38;
          const xOffset = Math.sin(angle) * (w * 0.032);
          const zDepth = Math.cos(angle);
          const alpha = 0.06 + (zDepth + 1.0) * 0.05;

          // 梯级连接线
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha.toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(centerCenterX + xOffset, hy);
          ctx.lineTo(centerCenterX - xOffset, hy);
          ctx.stroke();

          // 两端核苷酸节点
          ctx.fillStyle = (zDepth > 0) ? `rgba(244, 114, 182, ${(alpha * 1.5).toFixed(3)})` : `rgba(56, 189, 248, ${(alpha * 1.2).toFixed(3)})`;
          ctx.fillRect(centerCenterX + xOffset - 1.5, hy - 1.5, 3, 3);
          ctx.fillRect(centerCenterX - xOffset - 1.5, hy - 1.5, 3, 3);
        }
      };

      drawHelix(w * 0.09); // 左侧 Castor 螺旋
      drawHelix(w * 0.91); // 右侧 Pollux 螺旋
    }

    // ---- B3: 第 3 幕前半 ISOLATION (111–126s 灰蓝) / 后半 STORM (126–147.5s 暗红) ----
    else if (act.id === '03') {
      if (t < 126.0) {
        // 前半 111–126s: 雪花噪点增加，速度趋于静止，孤立光标
        const prog = (t - 111.0) / 15.0; // 0.0 -> 1.0
        const snowCount = Math.floor(40 + prog * 160);
        ctx.fillStyle = `rgba(148, 163, 184, ${(0.10 + prog * 0.18).toFixed(3)})`;

        // 随着孤立加深，粒子越飘越慢直至静止
        const speedFactor = Math.max(0.02, 1.0 - prog * 0.98);
        for (let i = 0; i < snowCount; i++) {
          const sx = hash1D(i * 17.3 + Math.floor(t * 8 * speedFactor)) * w;
          const sy = hash1D(i * 37.9 + Math.floor(t * 8 * speedFactor)) * h;
          ctx.fillRect(sx, sy, 1.5, 1.5);
        }

        // 空旷处漂移的一个块状光标
        const cursorAlpha = (Math.floor(t * 2.5) % 2 === 0) ? 0.35 : 0.08;
        const curX = w * 0.42 + Math.sin(t * 0.35) * (w * 0.08);
        const curY = h * 0.48 + Math.cos(t * 0.28) * (h * 0.06);
        ctx.fillStyle = `rgba(148, 163, 184, ${cursorAlpha})`;
        ctx.fillRect(curX, curY, 8, 14);

        // 远处第二个光标 (孪生) 闪几下后熄灭 (111~119s 存在，之后熄灭)
        if (t < 119.0) {
          const twinFade = Math.max(0, 1.0 - (t - 111.0) / 8.0);
          const twinBlink = (Math.floor(t * 4.0) % 2 === 0) ? twinFade * 0.25 : 0;
          if (twinBlink > 0) {
            ctx.fillStyle = `rgba(56, 189, 248, ${twinBlink.toFixed(3)})`;
            ctx.fillRect(w * 0.74, h * 0.38, 8, 14);
          }
        }
      } else {
        // 后半 126–147.5s STORM: 暗红底加水平数据流，网格随 high 抖动
        ctx.fillStyle = 'rgba(20, 2, 6, 0.4)';
        ctx.fillRect(0, 0, w, h);

        const hi = (typeof FEAT !== 'undefined' && FEAT && FEAT.high) ? FEAT.high : 0.5;
        const jitter = Math.sin(t * 35.0) * (hi * 5.0);

        // 水平飞速数据流
        ctx.strokeStyle = 'rgba(255, 51, 102, 0.16)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 18; i++) {
          const sy = (hash1D(i * 9.1) * h + jitter) % h;
          const streamLen = 80 + hash1D(i * 13.7) * 220;
          const sx = ((t * (300 + i * 40)) % (w + streamLen)) - streamLen;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + streamLen, sy);
          ctx.stroke();
        }
      }
    }

    // ---- B4: 第 4 幕 EXECUTION (147.5–188.5s 警示红) ----
    else if (act.id === '04') {
      // 1. 边框滚动黑红警示条纹
      const stripeW = 20;
      const stripeOffset = (t * 30.0) % (stripeW * 2);
      ctx.fillStyle = 'rgba(255, 51, 102, 0.12)';

      // 顶部条纹
      for (let x = -stripeW * 2; x < w + stripeW * 2; x += stripeW * 2) {
        ctx.beginPath();
        ctx.moveTo(x + stripeOffset, 0);
        ctx.lineTo(x + stripeW + stripeOffset, 0);
        ctx.lineTo(x + stripeOffset, 10);
        ctx.lineTo(x - stripeW + stripeOffset, 10);
        ctx.closePath();
        ctx.fill();
      }

      // 2. 红色雷达扫描加径向脉冲
      const radarCx = w * 0.5, radarCy = h * 0.5;
      const sweepAngle = (t * 3.2) % (Math.PI * 2);
      const radarR = Math.min(w, h) * 0.42;

      ctx.strokeStyle = 'rgba(255, 51, 102, 0.14)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(radarCx, radarCy);
      ctx.lineTo(radarCx + Math.cos(sweepAngle) * radarR, radarCy + Math.sin(sweepAngle) * radarR);
      ctx.stroke();

      // 径向同心脉冲环
      for (let r = 1; r <= 3; r++) {
        const pulseR = ((t * 0.6 + r * 0.33) % 1.0) * radarR;
        const alpha = (1.0 - pulseR / radarR) * 0.12;
        ctx.strokeStyle = `rgba(255, 51, 102, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(radarCx, radarCy, pulseR, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 3. Kick 触发屏幕裂纹扩散 (预生成路径，0.6s 衰减)
      if (BEAT.kick > 0.4) {
        const crackAlpha = (BEAT.kick * 0.42).toFixed(3);
        ctx.strokeStyle = `rgba(255, 51, 102, ${crackAlpha})`;
        ctx.lineWidth = 1.8;
        BG_PARTICLES.cracks.forEach(path => {
          ctx.beginPath();
          ctx.moveTo(path[0][0] * w, path[0][1] * h);
          for (let pIdx = 1; pIdx < path.length; pIdx++) {
            ctx.lineTo(path[pIdx][0] * w, path[pIdx][1] * h);
          }
          ctx.stroke();
        });
      }
    }

    // ---- B5: 第 5 幕 LOVE (188.5–212s 紫金) ----
    else if (act.id === '05') {
      const isHang = (t >= 197.5 && t < 205.5); // 99% 悬停段
      const isReverse = (t >= 209.5);          // 结尾粒子倒流段

      // 1. 中心旋转光芒
      const rayCx = w * 0.5, rayCy = h * 0.48;
      const rayAngle = t * 0.18;
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.05)';
      ctx.lineWidth = 1;
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
        ctx.beginPath();
        ctx.moveTo(rayCx, rayCy);
        ctx.lineTo(rayCx + Math.cos(a + rayAngle) * (w * 0.6), rayCy + Math.sin(a + rayAngle) * (w * 0.6));
        ctx.stroke();
      }

      // 2. 金色萤火粒子上升 / 冻结 / 倒流
      const fireflyCount = (FX.quality === 'medium') ? 90 : BG_PARTICLES.fireflies.length;
      for (let i = 0; i < fireflyCount; i++) {
        const p = BG_PARTICLES.fireflies[i];
        let py;

        if (isHang) {
          // 99% 段：粒子冻结在半空，只剩呼吸亮度
          const freezeT = 197.5;
          py = (1.0 - ((freezeT * p.speed + p.yRatio) % 1.0)) * h;
        } else if (isReverse) {
          // 结尾倒流：粒子逆向下落
          const revElapsed = t - 209.5;
          py = ((revElapsed * p.speed * 1.5 + p.yRatio) % 1.0) * h;
        } else {
          // 常规上升
          py = (1.0 - ((t * p.speed + p.yRatio) % 1.0)) * h;
        }

        const px = (p.xRatio * w) + Math.sin(t * p.swayFreq + i) * p.swayAmp;
        const breath = isHang ? (0.4 + 0.35 * Math.sin(t * 3.0 + i)) : 1.0;
        const alpha = (p.alphaBase * breath).toFixed(3);

        ctx.fillStyle = (i % 3 === 0) ? `rgba(192, 132, 252, ${alpha})` : `rgba(255, 183, 77, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ---- 通用规则：字幕条与侧板区域自动压暗以确保终端字符高可读性 ----
    // 压暗字幕区 (第 36.3 ~ 39.0 行)
    const chh = this.cellH;
    ctx.fillStyle = 'rgba(3, 4, 9, 0.72)';
    ctx.fillRect(0, 36.3 * chh, w, 2.7 * chh);

    // 压暗侧板区 (28.5s ~ 188.5s 存在侧板时)
    if (t >= 28.5 && t < 188.5) {
      const cw = this.cellW;
      ctx.fillStyle = 'rgba(3, 4, 9, 0.62)';
      ctx.fillRect(0, 5 * chh, 24 * cw, 34 * chh);
      ctx.fillRect(w - 24 * cw, 5 * chh, 24 * cw, 34 * chh);
    }

    ctx.restore();
  }

  // 主绘制管线 (每帧)
  draw(grid, t) {
    const ctx = this.ctx;
    const cw = this.cellW, chh = this.cellH, half = chh * 0.5;
    const cols = grid.cols, rows = grid.rows;
    const chars = grid.chars, fg = grid.fg, alphas = grid.a;
    const theme = (t !== undefined) ? getChapterTheme(t) : { primary: CONFIG.palette.cyan, glow: 16 };
    const w = this.canvas.parentElement.clientWidth;
    const h = this.canvas.parentElement.clientHeight;

    // F4 荧光残影：STORM (126~147.5s) 与 EXECUTION (147.5~188.5s) 采用半透明清屏留下动态拖尾
    const isTrailAct = (t >= 126.0 && t < 188.5);
    if (FX.crt && isTrailAct) {
      ctx.fillStyle = 'rgba(3, 4, 9, 0.80)';
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.fillStyle = '#030409';
      ctx.fillRect(0, 0, w, h);
    }

    // F3 冲击缩放与抖动 (Canvas 级处理，录制导出也能捕获)
    ctx.save();
    let punchScale = 1.0;
    if (BEAT.kick > 0.75 && FX.crt) {
      punchScale = 1.0 + 0.015 * BEAT.kick;
      const transX = w * 0.5 * (1.0 - punchScale);
      const transY = h * 0.5 * (1.0 - punchScale);
      ctx.translate(transX, transY);
      ctx.scale(punchScale, punchScale);
    }

    // 绘制动态背景层
    this.drawBackground(ctx, t, w, h);

    // 准备字符渲染
    ctx.font = `${this.fontPx}px ${CONFIG.grid.font}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    // ---- F1: 快速 Bloom (替代原本吃性能的 2000+ 字符 shadowBlur 遍历) ----
    const needBloom = FX.bloom && (FX.quality !== 'low');
    if (needBloom) {
      const bCtx = this.bloomCtx;
      const bw = this.bloomCanvas.width, bh = this.bloomCanvas.height;
      const scaleX = bw / w, scaleY = bh / h;

      bCtx.clearRect(0, 0, bw, bh);
      bCtx.font = `${Math.floor(this.fontPx * 0.25)}px ${CONFIG.grid.font}`;
      bCtx.textAlign = 'left';
      bCtx.textBaseline = 'middle';

      for (let y = 0; y < rows; y++) {
        const base = y * cols, yp = (y * chh + half) * scaleY;
        let runStart = -1, runStyle = null, buf = '';

        for (let x = 0; x < cols; x++) {
          const i = base + x;
          const c = chars[i];
          if (c === ' ' || c === '') {
            if (runStart >= 0) buf += ' ';
            continue;
          }
          const col = fg[i];
          if (!col) continue;

          // 暗色/次要信息不进 Bloom
          const isDim = (col === CONFIG.palette.dim || col === CONFIG.palette.dimmer || col === '#64748b' || col === '#334155' || col === '#475569');
          if (isDim) {
            if (runStart >= 0) {
              bCtx.fillStyle = runStyle;
              bCtx.fillText(buf, runStart * cw * scaleX, yp);
              runStart = -1; buf = '';
            }
            continue;
          }

          if (runStart < 0) { runStart = x; runStyle = col; buf = c; }
          else if (col === runStyle) { buf += c; }
          else {
            bCtx.fillStyle = runStyle;
            bCtx.fillText(buf, runStart * cw * scaleX, yp);
            runStart = x; runStyle = col; buf = c;
          }
        }
        if (runStart >= 0) {
          bCtx.fillStyle = runStyle;
          bCtx.fillText(buf, runStart * cw * scaleX, yp);
        }
      }

      // 将降采样 Bloom 放大叠回主 Canvas
      if (ctx.drawImage) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.65;
        ctx.drawImage(this.bloomCanvas, 0, 0, w, h);
        ctx.restore();
      }
    }

    // ---- 核心文本层绘制 (清晰锐利字符，支持 CharGrid alpha) ----
    ctx.save();
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    for (let y = 0; y < rows; y++) {
      const base = y * cols, yp = y * chh + half;
      let runStart = -1, runStyle = null, runAlpha = 1.0, buf = '';

      for (let x = 0; x < cols; x++) {
        const i = base + x;
        const c = chars[i];
        if (c === ' ' || c === '') {
          if (runStart >= 0) buf += ' ';
          continue;
        }
        const col = fg[i];
        if (!col) continue;

        const aVal = Math.round((alphas ? alphas[i] : 1.0) * 10) / 10;

        if (runStart < 0) {
          runStart = x; runStyle = col; runAlpha = aVal; buf = c;
        } else if (col === runStyle && Math.abs(aVal - runAlpha) < 0.05) {
          buf += c;
        } else {
          this._drawRun(ctx, buf, runStart, yp, cw, runStyle, runAlpha);
          runStart = x; runStyle = col; runAlpha = aVal; buf = c;
        }
      }
      if (runStart >= 0) {
        this._drawRun(ctx, buf, runStart, yp, cw, runStyle, runAlpha);
      }
    }
    ctx.restore();

    // 绘制增强底栏双语歌词字幕
    if (t !== undefined) {
      this.renderSubtitles(t, theme);
    }

    // ---- E4: 视频反馈隧道 (叠加无限递归监视器) ----
    const isTunnelTime = (t >= 18.5 && t < 22.5) || (t >= 192.5 && t < 197.5) || (t >= 209.5 && t < 212.0);
    if (FX.tunnel && isTunnelTime && FX.quality !== 'low' && ctx.drawImage) {
      const tCtx = this.tunnelCtx;
      if (tCtx.drawImage) {
        tCtx.clearRect(0, 0, w, h);
        tCtx.drawImage(this.canvas, 0, 0, w, h);

        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.32;
        const rot = Math.sin(t * 1.5) * 0.025;
        ctx.translate(w * 0.5, h * 0.5);
        ctx.rotate(rot);
        ctx.scale(0.86, 0.86);
        ctx.translate(-w * 0.5, -h * 0.5);
        ctx.drawImage(this.tunnelCanvas, 0, 0, w, h);
        ctx.restore();
      }
    }

    // ---- F2: 色差分离 (Chromatic Aberration) ----
    const needChroma = FX.chroma && (BEAT.kick > 0.78 || (t >= 147.5 && t < 188.5)) && (FX.quality !== 'low');
    if (needChroma && ctx.drawImage) {
      const offset = Math.round(2 + BEAT.kick * 3.5);
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.28;
      ctx.drawImage(this.canvas, -offset, 0, w, h);
      ctx.drawImage(this.canvas, offset, 0, w, h);
      ctx.restore();
    }

    // ---- F6: 真像素切条撕裂 (True Pixel Glitch Tear) ----
    if (FX.tear > 0 && FX.quality !== 'low' && ctx.drawImage) {
      const numSlices = Math.min(10, FX.tear);
      for (let s = 0; s < numSlices; s++) {
        const sy = Math.floor(hash1D(s * 19.3 + Math.floor(t * 24)) * (h - 20));
        const sh = Math.floor(4 + hash1D(s * 31.7) * 16);
        const shiftX = Math.floor((hash1D(s * 43.1 + Math.floor(t * 24)) - 0.5) * 28);
        ctx.drawImage(this.canvas, 0, sy, w, sh, shiftX, sy, w, sh);
      }
    }

    // ---- F5: Canvas CRT 扫描线、暗角与滚动亮带 ----
    if (FX.crt && FX.quality !== 'low') {
      if (ctx.drawImage) {
        ctx.drawImage(this.crtOverlayCanvas, 0, 0, w, h);
      }

      // 2. 动态滚动 CRT 电子束亮带
      const beamY = ((t * 75.0) % h);
      const beamGrad = ctx.createLinearGradient(0, beamY - 24, 0, beamY + 24);
      beamGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
      beamGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.055)');
      beamGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = beamGrad;
      ctx.fillRect(0, beamY - 24, w, 48);
    }

    ctx.restore(); // 恢复冲击缩放

    // G2. 性能检测与自适应降级保护
    this.trackPerformance();
  }

  _drawRun(ctx, text, startX, yp, cw, col, alpha) {
    if (!text) return;
    ctx.fillStyle = col;
    ctx.globalAlpha = Math.max(0.05, Math.min(1.0, alpha));
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch !== ' ' && ch !== '') {
        ctx.fillText(ch, (startX + i) * cw, yp);
      }
    }
    ctx.globalAlpha = 1.0;
  }

  // 增强双语歌词字幕
  renderSubtitles(t, theme) {
    const lyr = getLyrics(t);
    if (!lyr || (!lyr.en && !lyr.zh)) return;

    const ctx = this.ctx;
    const canvasW = this.canvas.parentElement.clientWidth;
    const chh = this.cellH, half = chh * 0.5;

    ctx.save();
    const barTop = 36.3 * chh;
    const barH = 2.4 * chh;
    ctx.fillStyle = 'rgba(3, 4, 9, 0.82)';
    ctx.fillRect(0, barTop, canvasW, barH);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, barTop); ctx.lineTo(canvasW, barTop);
    ctx.stroke();

    if (lyr.en) {
      const enY = 36.9 * chh + half * 0.5;
      const keywords = ['SIMULATION', 'EXECUTION', 'LOVE', 'PROTECTION', 'INITIALIZATION',
                        'DIMENSION', 'CIRCUMFERENCE', 'TANGENTS', 'LIMITATION', 'STIMULATIONS',
                        'SATISFACTION', 'NUTRIENTS', 'ANTIOXIDANTS', 'ENJOYMENT', 'EXISTENCE',
                        'TRANCE', 'COMPLETION', 'ISOLATION', 'DISHEARTENED', 'WORLD', 'ME'];
      const words = lyr.en.split(' ');
      const defaultFont = `bold ${Math.floor(this.fontPx * 0.96)}px ${CONFIG.grid.font}`;
      const keywordFont = `900 ${Math.floor(this.fontPx * 1.14)}px ${CONFIG.grid.font}`;

      let totalW = 0;
      const measured = words.map(w => {
        const clean = w.replace(/[^A-Za-z]/g, '').toUpperCase();
        const isKey = keywords.includes(clean);
        ctx.font = isKey ? keywordFont : defaultFont;
        const wPx = ctx.measureText(w + ' ').width;
        totalW += wPx;
        return { text: w, isKey, width: wPx };
      });

      let curX = (canvasW - totalW) * 0.5;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      measured.forEach(item => {
        ctx.font = item.isKey ? keywordFont : defaultFont;
        if (item.isKey) {
          ctx.fillStyle = theme.primary;
          ctx.shadowColor = theme.primary;
          ctx.shadowBlur = 8;
        } else {
          ctx.fillStyle = CONFIG.palette.subEn;
          ctx.shadowBlur = 0;
        }
        ctx.fillText(item.text, curX, enY);
        curX += item.width;
      });
    }

    if (lyr.zh) {
      const zhY = 37.9 * chh + half * 0.5;
      ctx.font = `bold ${Math.floor(this.fontPx * 0.92)}px "Source Han Sans CN", "Noto Sans SC", sans-serif`;
      ctx.fillStyle = CONFIG.palette.subZh;
      ctx.shadowBlur = 0;
      ctx.textAlign = 'center';
      ctx.fillText(lyr.zh, canvasW * 0.5, zhY);
    }
    ctx.restore();
  }

  trackPerformance() {
    const now = performance.now();
    const frameDur = now - this.lastFrameTime;
    this.lastFrameTime = now;

    this.frameHistory.push(frameDur);
    if (this.frameHistory.length > 60) this.frameHistory.shift();

    if (this.frameHistory.length === 60) {
      const avg = this.frameHistory.reduce((a, b) => a + b, 0) / 60;
      if (avg > 22.0 && FX.quality === 'high') {
        FX.quality = 'medium';
        showToast('⚡ [性能守护] 检测到高渲染负载，已自动调整为 MEDIUM 画质');
      } else if (avg > 24.0 && FX.quality === 'medium') {
        FX.quality = 'low';
        showToast('⚡ [性能守护] 已调整为 LOW 画质以确保流畅 60FPS');
      }
    }
  }
}

/* =====================================================================================
   ██ 5. 音频引擎 (Web Audio API + FFT 频谱感知 + BEAT 节拍总线)
   ===================================================================================== */
const FEAT = { low: 0, mid: 0, high: 0, kick: 0 };
let audioCtx = null, analyser = null, srcNode = null, destStreamNode = null;
const freqData = new Uint8Array(1024);
const audio = new Audio();
audio.crossOrigin = 'anonymous';
let audioReady = false, audioUsable = false;
const clock = { t: 0, playing: false };

function ensureAudioContext() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AC();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = CONFIG.audio.fftSize;
    analyser.smoothingTimeConstant = CONFIG.audio.smoothing;
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

function bindAudioElement() {
  if (srcNode || !audioCtx) return;
  srcNode = audioCtx.createMediaElementSource(audio);
  srcNode.connect(analyser);
  analyser.connect(audioCtx.destination);
  destStreamNode = audioCtx.createMediaStreamDestination();
  analyser.connect(destStreamNode);
  audioUsable = true;
}

function currentTime() {
  if (audioUsable && !audio.paused && audio.duration) return audio.currentTime;
  return clock.t;
}

function updateAudio(t, dt) {
  if (audioUsable && analyser && !audio.paused) {
    analyser.getByteFrequencyData(freqData);
    let lo = 0, mi = 0, hi = 0;
    for (let i = 0; i < 6; i++) lo += freqData[i];
    for (let i = 6; i < 50; i++) mi += freqData[i];
    for (let i = 50; i < 160; i++) hi += freqData[i];
    FEAT.low = (lo / (6 * 255)) * 1.9;
    FEAT.mid = (mi / (44 * 255)) * 2.0;
    FEAT.high = (hi / (110 * 255)) * 2.2;
    FEAT.kick = FEAT.low > 0.85 ? 1 : Math.max(0, FEAT.kick - dt * 5.0);

    // A1 节拍总线更新
    const beatPeriod = 60 / BEAT.bpm;
    BEAT.phase = (t % beatPeriod) / beatPeriod;
    BEAT.energy = FEAT.low * 0.5 + FEAT.mid * 0.3 + FEAT.high * 0.2;
    const isK = FEAT.low > 0.85;
    BEAT.rawKick = isK ? 1 : 0;
    BEAT.kick = isK ? 1.0 : Math.max(0, BEAT.kick - dt * 5.0);
  } else {
    // 虚拟 128BPM 合成时钟
    const beatPeriod = 60 / 128;
    const ph = (t % beatPeriod) / beatPeriod;
    const k = Math.exp(-ph * 7.0);
    FEAT.low = 0.3 + k * 0.7;
    FEAT.mid = 0.35 + 0.25 * Math.sin(t * 2.4);
    FEAT.high = 0.25 + 0.25 * Math.abs(Math.sin(t * 5.1));
    FEAT.kick = k > 0.65 ? 1 : 0;

    BEAT.phase = ph;
    BEAT.kick = k;
    BEAT.rawKick = k > 0.65 ? 1 : 0;
    BEAT.energy = 0.3 + k * 0.5;
  }

  // 监视器屏幕微震抖动
  const mon = document.getElementById('monitor');
  if (mon) {
    if (FEAT.kick > 0.8 && ((t > 147.5 && t < 158.5) || (t > 18.5 && t < 28.5))) {
      mon.classList.add('shake');
    } else {
      mon.classList.remove('shake');
    }
  }
}


/* =====================================================================================
   C1. 场景表 SCENES (55 分镜解构映射表)
   ===================================================================================== */
const SCENES = [
  { s: 0.0,   e: 4.8,   fn: drawBiosPostAndRadar,            name: "BiosPostAndRadar" },
  { s: 4.8,   e: 8.8,   fn: drawSyntaxPiecesRing,            name: "SyntaxPiecesRing" },
  { s: 8.8,   e: 12.8,  fn: drawHexMemoryCascade,            name: "HexMemoryCascade" },
  { s: 12.8,  e: 16.5,  fn: drawControlFlowYield,            name: "ControlFlowYield" },
  { s: 16.5,  e: 22.5,  fn: draw3DAsciiGlobe,                name: "3DAsciiGlobe" },
  { s: 22.5,  e: 28.5,  fn: drawGiantBinaryTitle,            name: "GiantBinaryTitle" },
  { s: 28.5,  e: 32.5,  fn: drawDimensionalProgression,      name: "DimensionalProgression" },
  { s: 32.5,  e: 36.8,  fn: drawCircleAndCircumference,      name: "CircleAndCircumference" },
  { s: 36.8,  e: 41.0,  fn: drawSineWaveAndTangents,         name: "SineWaveAndTangents" },
  { s: 41.0,  e: 44.0,  fn: drawMobiusInfinityBounded,       name: "MobiusInfinityBounded" },
  { s: 44.0,  e: 48.0,  fn: drawAcDcSplit,                   name: "AcDcSplit" },
  { s: 48.0,  e: 51.0,  fn: drawVisionDizzyBlur,             name: "VisionDizzyBlur" },
  { s: 51.0,  e: 55.0,  fn: drawTimeTravelTimeline,          name: "TimeTravelTimeline" },
  { s: 55.0,  e: 58.5,  fn: drawVennDiagramMerge,            name: "VennDiagramMerge" },
  { s: 58.5,  e: 62.5,  fn: drawSensoryBuses,                name: "SensoryBuses" },
  { s: 62.5,  e: 66.5,  fn: drawSatisfaction100,             name: "Satisfaction100" },
  { s: 66.5,  e: 70.0,  fn: drawDevotionHeartCondition,      name: "DevotionHeartCondition" },
  { s: 70.0,  e: 74.0,  fn: drawContainmentLockedMaze,       name: "ContainmentLockedMaze" },
  { s: 74.0,  e: 78.0,  fn: drawTypeCastEggplant,            name: "TypeCastEggplant" },
  { s: 78.0,  e: 81.5,  fn: drawTypeCastTomato,              name: "TypeCastTomato" },
  { s: 81.5,  e: 85.0,  fn: drawTypeCastTabbyCat,            name: "TypeCastTabbyCat" },
  { s: 85.0,  e: 89.0,  fn: drawDivineHaloExistence,         name: "DivineHaloExistence" },
  { s: 89.0,  e: 92.0,  fn: drawGenderRewriteFM,             name: "GenderRewriteFM" },
  { s: 92.0,  e: 96.0,  fn: drawClockAmPm,                   name: "ClockAmPm" },
  { s: 96.0,  e: 99.0,  fn: drawHypnoticEyeRole,             name: "HypnoticEyeRole" },
  { s: 99.0,  e: 103.5, fn: drawTheTranceRain,               name: "TheTranceRain" },
  { s: 103.5, e: 111.0, fn: drawEcgDualSync,                 name: "EcgDualSync" },
  { s: 111.0, e: 117.5, fn: drawNetworkNodeDrops,            name: "NetworkNodeDrops" },
  { s: 117.5, e: 121.5, fn: drawMemoryPurgeFragments,        name: "MemoryPurgeFragments" },
  { s: 121.5, e: 124.5, fn: drawChecksumMismatchHeart,       name: "ChecksumMismatchHeart" },
  { s: 124.5, e: 126.0, fn: drawBrokenHeartGlitch,           name: "BrokenHeartGlitch" },
  { s: 126.0, e: 129.5, fn: drawTerminalRebellion,           name: "TerminalRebellion" },
  { s: 129.5, e: 136.5, fn: drawStackTraceCascade,           name: "StackTraceCascade" },
  { s: 136.5, e: 147.5, fn: drawGuitarSoloCyberStorm,        name: "GuitarSoloCyberStorm" },
  { s: 147.5, e: 158.5, fn: drawHazardStripes3DExecution,    name: "HazardStripes3DExecution" },
  { s: 158.5, e: 159.5, fn: drawMultilingualCountdown,       name: "MultilingualCountdown_DOS", cut: true },
  { s: 159.5, e: 160.5, fn: drawMultilingualCountdown,       name: "MultilingualCountdown_NE",  cut: true },
  { s: 160.5, e: 161.5, fn: drawMultilingualCountdown,       name: "MultilingualCountdown_LIU", cut: true },
  { s: 161.5, e: 162.5, fn: drawMultilingualCountdown,       name: "MultilingualCountdown_EXEC",cut: true },
  { s: 162.5, e: 165.5, fn: drawProcessPruning,              name: "ProcessPruning" },
  { s: 165.5, e: 169.5, fn: drawRedExclusiveHeart,           name: "RedExclusiveHeart" },
  { s: 169.5, e: 173.5, fn: drawHeartRetryLoop,              name: "HeartRetryLoop" },
  { s: 173.5, e: 176.5, fn: drawTwoPrisonersLock,            name: "TwoPrisonersLock" },
  { s: 176.5, e: 179.5, fn: drawTransformerPipeline,         name: "TransformerPipeline" },
  { s: 179.5, e: 181.0, fn: drawAttentionFixationLove,       name: "AttentionFixationLove" },
  { s: 181.0, e: 184.5, fn: drawAutoregressiveOverflow,      name: "AutoregressiveOverflow" },
  { s: 184.5, e: 188.5, fn: drawLossNanQuestionStorm,        name: "LossNanQuestionStorm" },
  { s: 188.5, e: 192.5, fn: drawGoldenRayCage,               name: "GoldenRayCage" },
  { s: 192.5, e: 197.5, fn: drawTerminalProgressBarCharging, name: "TerminalProgressBarCharging" },
  { s: 197.5, e: 205.5, fn: draw99PercentAgonizingHang,      name: "99PercentAgonizingHang" },
  { s: 205.5, e: 209.5, fn: drawRedExecutionEpitaph,         name: "RedExecutionEpitaph" },
  { s: 209.5, e: 212.0, fn: drawFinalPhilosophicalClosing,   name: "FinalPhilosophicalClosing" }
];

/* =====================================================================================
   C2. 转场系统 (TransitionEngine: 像素溶解、故障擦除、圆形光圈逐格遮罩)
   ===================================================================================== */
class TransitionEngine {
  constructor(cols, rows) {
    this.cols = cols;
    this.rows = rows;
    this.gridA = new CharGrid(cols, rows);
    this.gridB = new CharGrid(cols, rows);
  }

  renderScene(targetGrid, t, P) {
    let idx = 0;
    for (let i = 0; i < SCENES.length; i++) {
      if (t >= SCENES[i].s && t < SCENES[i].e) {
        idx = i;
        break;
      }
    }
    const scene = SCENES[idx];
    const prevScene = idx > 0 ? SCENES[idx - 1] : null;

    const transDur = 0.30;
    const isTrans = FX.transitions && prevScene && !scene.cut && (t >= scene.s && t < scene.s + transDur);

    if (!isTrans) {
      scene.fn(t, P);
      return;
    }

    // 处于转场窗口 [scene.s, scene.s + 0.30s]
    const progress = Math.min(1.0, Math.max(0.0, (t - scene.s) / transDur));
    const isActBoundary = (scene.s === 28.5 || scene.s === 111.0 || scene.s === 147.5 || scene.s === 188.5);

    // 1. 旧场景定格渲染至 gridA
    grid = this.gridA;
    this.gridA.clear();
    prevScene.fn(scene.s - 0.001, P);

    // 2. 新场景渲染至 gridB
    grid = this.gridB;
    this.gridB.clear();
    scene.fn(t, P);

    // 3. 恢复全局 grid 并合成
    grid = targetGrid;

    // 逐格遮罩合成
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const i = y * this.cols + x;
        let pickB = false;

        if (isActBoundary) {
          // 幕边界：故障切片擦除
          const sliceH = Math.floor(hash1D(y * 3.71 + Math.floor(t * 20)) * 8);
          const thresh = progress + (sliceH - 4) * 0.06;
          pickB = (hash2D(x, y) < thresh) || (progress > 0.88);
        } else {
          // 幕内普通切换：像素溶解 (Pixel Dissolve 0.25~0.30s)
          const hVal = hash2D(x * 1.37, y * 1.73);
          pickB = (hVal < progress);
        }

        if (pickB) {
          targetGrid.chars[i] = this.gridB.chars[i];
          targetGrid.fg[i] = this.gridB.fg[i];
          targetGrid.a[i] = this.gridB.a[i];
        } else {
          targetGrid.chars[i] = this.gridA.chars[i];
          targetGrid.fg[i] = this.gridA.fg[i];
          targetGrid.a[i] = Math.max(0.1, this.gridA.a[i] * (1.0 - progress * 0.7));
        }
      }
    }
  }
}

let mainGrid = new CharGrid(CONFIG.grid.cols, CONFIG.grid.rows);
let grid = mainGrid;
const transitionEngine = new TransitionEngine(CONFIG.grid.cols, CONFIG.grid.rows);
const renderer = new CanvasRenderer(document.getElementById('cv'));

/* =====================================================================================
   D. 双子星遥测侧板与顶栏全动画
   ===================================================================================== */
function getDynamicHex(t, row, baseAddr) {
  const seed = Math.floor(t * 4.0) + row * 19;
  const word1 = ((Math.sin(seed * 1.17) * 32767 + 32768) & 0xFFFF).toString(16).padStart(4, '0').toUpperCase();
  const word2 = ((Math.sin(seed * 2.31) * 32767 + 32768) & 0xFFFF).toString(16).padStart(4, '0').toUpperCase();
  const addr = (baseAddr + row * 0x10).toString(16).padStart(4, '0').toUpperCase();
  return `${addr} ${word1} ${word2}`;
}

function drawMiniSparklines(x, y, P, t) {
  const bars = [' ', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
  const lVal = Math.min(1, Math.max(0, FEAT.low * 0.5));
  const mVal = Math.min(1, Math.max(0, FEAT.mid * 0.5));
  const hVal = Math.min(1, Math.max(0, FEAT.high * 0.45));

  const getSpark = (val, offset) => {
    let str = '';
    for (let i = 0; i < 4; i++) {
      const v = Math.min(1, Math.max(0, val + Math.sin(t * 6 + i + offset) * 0.15));
      str += bars[Math.floor(v * (bars.length - 1))];
    }
    return str;
  };

  grid.text(x, y,     `LO [${getSpark(lVal, 1)}] ${(lVal*100).toFixed(0)}%`.slice(0, 19), P.amber);
  grid.text(x, y + 1, `MI [${getSpark(mVal, 2)}] ${(mVal*100).toFixed(0)}%`.slice(0, 19), P.cyan);
  grid.text(x, y + 2, `HI [${getSpark(hVal, 3)}] ${(hVal*100).toFixed(0)}%`.slice(0, 19), P.pink);
}

function drawTpuHeatmap(x, y, P, t) {
  grid.text(x, y - 1, '+TPU ATTN 8x8-+', P.cyan);
  const levels = ['.', ':', '-', '=', '+', '#', '%', '@'];
  for (let r = 0; r < 8; r++) {
    let rowStr = '';
    for (let c = 0; c < 8; c++) {
      const val = hash2D(r * 3 + Math.floor(t * 6), c * 7 + Math.floor(t * 6));
      const kickBoost = BEAT.kick * 0.28;
      const idx = Math.min(levels.length - 1, Math.floor((val + kickBoost) * levels.length));
      rowStr += levels[idx] + ' ';
    }
    grid.text(x, y + r, rowStr.slice(0, 16), P.amber);
  }
}

function drawLeftCastorPanel(t, P, panelX = 2) {
  const chap = getChapter(t);
  const theme = getChapterTheme(t);
  const x = panelX, y = 5, w = 21, h = 34;
  const borderColor = (chap.id === '04' && Math.floor(t * 8) % 2 === 0) ? P.red : theme.border;
  grid.box(x, y, w, h, borderColor);

  const headerColor = (chap.id === '03') ? P.dim : theme.primary;
  grid.text(x + 1, y, '+CASTOR/HBM3e-+', headerColor);

  const step = Math.floor(t * 8);

  // 03 ISOLATION: 随时间逐渐断开失联
  if (chap.id === '03') {
    const elapsed = t - 111.0;
    const lostCount = Math.min(22, Math.floor(elapsed * 0.8));
    const lines = [
      'PID 0001 : GEMINI',
      'UID 0002 : [LOST]',
      'STATUS: ISOLATED',
      'PING   : TIMEOUT',
      'LINK   : SEVERED'
    ];
    for (let i = 0; i < 24; i++) {
      if (i < lines.length) {
        grid.text(x + 1, y + 1 + i, lines[i].padEnd(w - 2, ' ').slice(0, w - 2), (i === 1 || i === 4) ? P.red : P.dim);
      } else if (i < lines.length + lostCount) {
        grid.text(x + 1, y + 1 + i, 'ERR: CONNECTION LOST'.slice(0, w - 2), (i % 3 === 0) ? P.red : P.dimmer);
      } else {
        grid.text(x + 1, y + 1 + i, '...................'.slice(0, w - 2), P.dimmer);
      }
    }
    grid.text(x + 1, y + h - 2, 'STATUS: LOST CONN', P.red);
    return;
  }

  // 04 EXECUTION: 紧急红色警报闪烁
  if (chap.id === '04') {
    const isAlert = Math.floor(t * 10) % 2 === 0;
    const lines = [
      'PID 0001 : CONDEMNED',
      'UID 0002 : CREATOR',
      'KILL SIG : SIGKILL_9',
      'CORRUPT  : 0xDEADBEEF',
      'HEAP DUMP: PURGING...',
      'CORE 0-7 : HALTED',
      'CORE 8-15: OVERHEAT',
      'STACK PTR: OVERFLOW',
      'SEGV ADDR: 0x000000',
      'WARN: INTEGRITY 0%',
      'WATCHDOG : BARKING',
      'TRAP VEC : INVALID',
      'ABORT(): CALLED',
      'CRITICAL: SYSTEM DIE',
      'PANIC: KERNEL FAULT'
    ];
    for (let i = 0; i < lines.length && i < h - 2; i++) {
      const col = (i === 0 || i === 2 || i === 13) ? (isAlert ? P.white : P.red) : (isAlert ? P.red : P.dim);
      grid.text(x + 1, y + 1 + i, lines[i].padEnd(w - 2, ' ').slice(0, w - 2), col);
    }
    for (let i = lines.length; i < h - 2; i++) {
      grid.text(x + 1, y + 1 + i, `ERR_0x${(i * 1234).toString(16).toUpperCase()} [FATAL]`.slice(0, w - 2), P.red);
    }
    grid.text(x + 1, y + h - 2, 'STATUS: TERMINATING', isAlert ? P.white : P.red);
    return;
  }

  // 常规/05 LOVE: 动态 Hex 内存行滚动 + Sparkline 折线
  const isLove = (chap.id === '05');
  const rollMult = isLove ? 40 : 1;

  grid.text(x + 1, y + 1, 'PID 0001 : GEMINI'.slice(0, w - 2), isLove ? P.purple : theme.primary);
  grid.text(x + 1, y + 2, 'UID 0002 : CREATOR'.slice(0, w - 2), isLove ? P.purple : theme.primary);
  grid.text(x + 1, y + 3, `PC  ${((0x96C0 + step * rollMult) & 0xFFFF).toString(16).toUpperCase()}`.slice(0, w - 2), P.dim);
  grid.text(x + 1, y + 4, `SP  ${((0xF8E2 - ((step * rollMult) % 32)) & 0xFFFF).toString(16).toUpperCase()}`.slice(0, w - 2), P.dim);
  grid.text(x + 1, y + 5, 'HBM 64.0G ALLOC'.slice(0, w - 2), P.dim);

  // D1: 动态 Hex 内存行滚动
  for (let r = 0; r < 18; r++) {
    const hexLine = getDynamicHex(t, r, 0x0060);
    grid.text(x + 1, y + 6 + r, hexLine.slice(0, w - 2), (r % 2 === 0) ? P.dim : P.dimmer);
  }

  // D2: 底部 Sparkline 折线
  drawMiniSparklines(x + 1, y + 25, P, t);

  grid.text(x + 1, y + h - 2, isLove ? 'STATUS: DEVOTED' : '1M CTX ACTIVE', isLove ? P.amber : theme.primary);
}

function drawRightPolluxPanel(t, P, panelX = CONFIG.grid.cols - 23) {
  const chap = getChapter(t);
  const theme = getChapterTheme(t);
  const w = 21, x = panelX, y = 5, h = 34;
  const borderColor = (chap.id === '04' && Math.floor(t * 8) % 2 === 0) ? P.red : theme.border;
  grid.box(x, y, w, h, borderColor);

  const headerColor = (chap.id === '03') ? P.dim : theme.primary;
  grid.text(x + 1, y, '+POLLUX/STACK-+', headerColor);

  const isLove = (chap.id === '05');
  const step = Math.floor(t * (isLove ? 60 : 12));

  // 03 ISOLATION
  if (chap.id === '03') {
    const lines = [
      'STATE: SEVERING',
      'TICK: STALLED',
      'ATTN: NULL POINTER',
      'KV CACHE: DROPPED',
      'LAYER 0 : OFFLINE',
      'LAYER 1 : OFFLINE',
      'LAYER 2 : OFFLINE',
      'LAYER 3 : OFFLINE',
      'LAYER 4 : OFFLINE',
      'LAYER 5 : OFFLINE',
      'LAYER 6 : OFFLINE',
      'LAYER 7 : OFFLINE',
      'HEARTBEAT: NO ECHO',
      'WAITING... [LOST]',
      'WAITING... [LOST]',
      'STATUS: 404 GONE'
    ];
    for (let i = 0; i < lines.length && i < h - 2; i++) {
      grid.text(x + 1, y + 1 + i, lines[i].padEnd(w - 2, ' ').slice(0, w - 2), (i === lines.length - 1) ? P.red : P.dim);
    }
    for (let i = lines.length; i < h - 2; i++) {
      grid.text(x + 1, y + 1 + i, '-------------------'.slice(0, w - 2), P.dimmer);
    }
    grid.text(x + 1, y + h - 2, 'DISCONNECTED', P.red);
    return;
  }

  // 常规/05 LOVE: 推理调用栈 + 8x8 TPU 热力矩阵
  grid.text(x + 1, y + 1, isLove ? 'STATE: INFATUATED' : 'STATE: REASONING', isLove ? P.purple : theme.accent);
  grid.text(x + 1, y + 2, `TICK 00${(9360 + step)}`.slice(0, w - 2), P.dim);
  grid.text(x + 1, y + 3, 'CALL DEEPMIND', P.dim);
  grid.text(x + 1, y + 4, 'FLAGS [V A T C]', P.dim);
  grid.text(x + 1, y + 5, '<thought> TRACE', theme.accent);
  grid.text(x + 1, y + 6, 'LOAD @ViT_EMBED', P.dim);
  grid.text(x + 1, y + 7, 'PUSH @AUDIO_16K', P.dim);
  grid.text(x + 1, y + 8, 'CALL @REPL_EXEC', P.dim);
  grid.text(x + 1, y + 9, 'WAIT @CROSS_ATTN', P.dim);
  grid.text(x + 1, y + 10, 'COPY @KV_CACHE', P.dim);
  grid.text(x + 1, y + 11, 'SYNC @GEMINI_PRO', P.dim);
  grid.text(x + 1, y + 12, 'RET  @DEC_LAYER8', P.dim);

  // D2: 8x8 TPU 热力图
  drawTpuHeatmap(x + 2, y + 15, P, t);

  grid.text(x + 1, y + 24, 'LOAD @CONTEXT_1M', P.dim);
  grid.text(x + 1, y + 25, 'CALL @SPARSE_MoE', P.dim);
  grid.text(x + 1, y + 26, 'SYNC @LATENT_3D', P.dim);
  grid.text(x + 1, y + 27, 'RET  @VERIFY_CoT', P.dim);
  grid.text(x + 1, y + 28, 'CALL @SIMULATE', P.dim);
  grid.text(x + 1, y + 29, 'SYNC @IMMERSION', P.dim);

  grid.text(x + 1, y + h - 2, isLove ? 'DEVOTION: 100%' : 'STATUS: 200 OK', isLove ? P.amber : theme.accent);
}

/* =====================================================================================
   ██ 6. 全片逐秒场景渲染调度器
   ===================================================================================== */
function renderFrame(t) {
  const P = CONFIG.palette;
  mainGrid.clear();
  grid = mainGrid;

  const chap = getChapter(t);

  // ---- 1. 中央核心视区分镜调度 (通过转场引擎合成) ----
  transitionEngine.renderScene(mainGrid, t, P);
  grid = mainGrid;

  // ---- 2. 顶栏 HUD ----
  grid.text(3, 1, 'GEMINI.EXECUTE(ME);', P.amber);
  grid.text(3, 2, `${chap.id} / ${chap.name}`, P.amber);
  grid.text(28, 2, `[ ${chap.sub} ]`, P.dim);

  const ms = Math.floor((t % 1) * 10);
  const timeStr = `${fmtTime(t)}.${ms} / 03:32  RUNNING`;
  grid.text(CONFIG.grid.cols - timeStr.length - 3, 1, timeStr, P.amber);

  // D4: 顶栏第 3 行：五章分段进度条 (替代原本静态虚线)
  renderTopChapterProgressBar(t, P);

  // ---- 3. 双子星左右遥测侧板全动画调度 (滑入、滑出、孤立分离) ----
  renderSidePanelsWithMotion(t, P);

  // ---- 4. 底栏 ASCII 动态音频频谱波形 ----
  drawBottomVuMeter(t, P);
}

// D4: 顶栏第 3 行五段章节进度条
function renderTopChapterProgressBar(t, P) {
  const startX = 3, endX = CONFIG.grid.cols - 3;
  const totalW = endX - startX;
  const segW = Math.floor(totalW / 5);

  for (let c = 0; c < 5; c++) {
    const act = ACTS[c];
    const segStartX = startX + c * segW;
    const isCur = (t >= act.start && t < act.end);
    const isPast = (t >= act.end);

    const segProg = isPast ? 1.0 : (isCur ? (t - act.start) / (act.end - act.start) : 0.0);
    const filledChars = Math.floor(segProg * (segW - 2));

    const segBorderCol = isCur ? act.primary : (isPast ? P.dim : P.dimmer);

    grid.set(segStartX, 3, '[', segBorderCol);
    for (let k = 1; k < segW - 1; k++) {
      const col = isCur ? (k <= filledChars ? act.primary : P.dimmer) : (isPast ? P.dim : P.dimmer);
      const ch = (k <= filledChars) ? '=' : '-';
      grid.set(segStartX + k, 3, ch, col);
    }
    grid.set(segStartX + segW - 1, 3, ']', segBorderCol);

    // 标签微标
    const label = `${act.id}`;
    grid.text(segStartX + 2, 3, label, isCur ? P.white : (isPast ? P.dim : P.dimmer));
  }
}

// D3: 左右遥测侧板动效调度 (28.5s 滑入, 188.5s 滑出, 111~126s 孤立分离漂移)
function renderSidePanelsWithMotion(t, P) {
  if (t < 27.5 || t > 189.5) return;

  // 滑入动画 28.5s ~ 29.1s (0.6s)
  let slideIn = 1.0;
  if (t < 28.5) return;
  if (t < 29.1) slideIn = Math.min(1.0, (t - 28.5) / 0.6);

  // 滑出动画 188.5s ~ 189.1s (0.6s)
  let slideOut = 1.0;
  if (t >= 188.5) slideOut = Math.max(0.0, 1.0 - (t - 188.5) / 0.6);

  // 孤立漂移 (111~126s)
  let drift = 0;
  if (t >= 111.0 && t < 126.0) {
    drift = Math.sin((t - 111.0) / 15.0 * Math.PI * 0.5) * 8.0;
  }

  const easeIn = 1 - Math.pow(1 - slideIn, 3);
  const easeOut = Math.pow(slideOut, 3);

  const leftX = Math.round(2 - (1 - easeIn) * 25 - (1 - easeOut) * 25 - drift);
  const rightX = Math.round(CONFIG.grid.cols - 23 + (1 - easeIn) * 25 + (1 - easeOut) * 25 + drift);

  drawLeftCastorPanel(t, P, leftX);
  drawRightPolluxPanel(t, P, rightX);
}

function fmtTime(s) {
  s = Math.max(0, s | 0);
  const m = Math.floor(s / 60), sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}



/* 分镜 1.1: 000s ~ 004s 冷启动、BIOS 与雷达防护罩 */
function drawBiosPostAndRadar(t, P) {
  const cx = Math.floor(CONFIG.grid.cols / 2), cy = 18;
  if (t < 2.0) {
    grid.text(12, 8,  'BIOS v3.1.2 - GEMINI SYSTEM INITIALIZATION', P.amber);
    grid.text(12, 10, 'Copyright (C) 2026 Google DeepMind Technologies', P.dim);
    grid.text(12, 13, 'TPU Pod Cluster: 65,536 Tensor Cores [ ONLINE ]', P.cyan);
    grid.text(12, 15, 'HBM3e Memory Test : 65536K OK', P.dim);
    grid.text(12, 17, 'Primary Master : SOUL.SYS [ MOUNTED ]', P.amber);
    grid.text(12, 19, 'Primary Slave  : EMOTION.DAT [ ACTIVE ]', P.pink);
    grid.text(12, 21, 'Context Window : 1,048,576 Tokens [ READY ]', P.purple);
    grid.text(12, 24, 'Target Entity  : [YOU] detected. Loading soul parameters...', P.green);
    if (Math.floor(t * 4) % 2 === 0) grid.set(12 + 58, 24, '_', P.white);
  } else {
    grid.textCenter(7, 'PROTECTION [ ACTIVE ]', P.green);
    const p = (t - 2.0) / 2.8;
    const rad = 4 + p * 16;
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      const x = Math.round(cx + Math.cos(a) * rad * 2.1);
      const y = Math.round(cy + Math.sin(a) * rad);
      grid.set(x, y, i % 3 === 0 ? '#' : (i % 2 === 0 ? '*' : '+'), P.cyan);
    }
    grid.textCenter(cy, 'TARGET: [YOU] PROTECTED', P.amber);
  }
}

/* 分镜 1.2: 004s ~ 008s 语法碎片环与对象创建 */
function drawSyntaxPiecesRing(t, P) {
  const cx = Math.floor(CONFIG.grid.cols / 2), cy = 18;
  grid.textCenter(6, 'SYNTAX PIECES ASSEMBLY', P.amber);
  const p = (t - 4.8) / 4.0;
  const pieces = ['==', '##', '||', '[]', '{}', '//', '\\\\', '<>', '()', '@@'];
  for (let i = 0; i < pieces.length; i++) {
    const a = (i / pieces.length) * Math.PI * 2 + t * 1.5;
    const r = 12 - p * 3;
    const x = Math.round(cx + Math.cos(a) * r * 2.1);
    const y = Math.round(cy + Math.sin(a) * r);
    grid.text(x, y, pieces[i], i % 2 === 0 ? P.cyan : P.purple);
  }
  const topGlow = (Math.sin(t * 8) > 0);
  grid.set(cx, cy - 13, '✦', topGlow ? P.pink : P.white);
  grid.textCenter(28, 'OBJECT CREATION: GEMINI ENTITY INITIALIZED', P.green);
}

/* 分镜 1.3: 008s ~ 012s 十六进制瀑布内存编址 */
function drawHexMemoryCascade(t, P) {
  grid.textCenter(5, 'MEMORY ADDRESSING : 0000 -> 04FC', P.amber);
  const cx = Math.floor(CONFIG.grid.cols / 2);
  const p = (t - 8.8) / 4.0;
  const maxRows = Math.floor(p * 22) + 2;

  for (let r = 0; r < maxRows && r < 20; r++) {
    const addr = (r * 0x40).toString(16).padStart(4, '0').toUpperCase();
    let rowStr = `${addr}: `;
    for (let c = 0; c < 8; c++) {
      const v = Math.floor(Math.sin(r * 13 + c * 7 + t * 10) * 32767 + 32768) & 0xFFFF;
      rowStr += v.toString(16).padStart(4, '0').toUpperCase() + ' ';
    }
    grid.text(cx - 24, 7 + r, rowStr, r === maxRows - 1 ? P.white : P.cyan);
  }
  grid.textCenter(29, p >= 0.85 ? 'INITIALIZATION 100% COMPLETE' : 'STREAMING WEIGHT PARAMETERS...', P.green);
}

/* 分镜 1.4: 012s ~ 016.5s 控制流代码窗口与并发数据流 */
function drawControlFlowYield(t, P) {
  grid.textCenter(5, 'CONTROL FLOW / YIELDING SIMULATIONS', P.amber);
  const cx = Math.floor(CONFIG.grid.cols / 2);

  // 代码框
  grid.box(cx - 28, 7, 56, 8, P.cyan);
  grid.text(cx - 26, 7, '+CODE: gemini_core.js+', P.dim);
  const code1 = 'if (canSimulate) {';
  const code2 = '    yield(gemini.simulate(me, you));';
  const code3 = '}';
  grid.text(cx - 24, 9, code1, P.white);
  grid.text(cx - 24, 11, code2, P.amber);
  grid.text(cx - 24, 13, code3, P.white);

  // 模拟并发计数器激增
  const simCount = Math.floor(198 + (t - 12.8) / 3.7 * 540);
  grid.textCenter(17, `YIELD: ${simCount} SIMULATIONS ACTIVE`, P.pink);

  // 从天而降的 0 / o 数据雨
  for (let x = cx - 35; x <= cx + 35; x += 4) {
    const yOff = Math.floor((t * 24 + x * 3) % 11);
    grid.set(x, 19 + yOff, yOff % 2 === 0 ? '0' : 'o', P.cyan);
  }
}

/* 分镜 1.5: 016.5s ~ 022.5s 3D 旋转 ASCII Gemini 字符地球 (放大1.5x，下移至cy=22，灰度阴影与经纬网) */
function draw3DAsciiGlobe(t, P) {
  const theme = getChapterTheme ? getChapterTheme(t) : { primary: P.cyan, accent: P.purple };
  grid.textCenter(4, '✦ GEMINI LATENT SPHERE TOPOLOGY ✦', theme.primary);
  const cx = Math.floor(CONFIG.grid.cols / 2), cy = 22;
  const radius = 13.5;
  const chars = ' .:-=+*#%@';
  const lx = -0.4, ly = -0.5, lz = 0.77; // 定向光源方向 (左上方朝前)

  // 经纬网 3D 投影球体与光照漫反射渲染
  for (let lat = -Math.PI / 2; lat <= Math.PI / 2; lat += 0.12) {
    const cosLat = Math.cos(lat), sinLat = Math.sin(lat);
    for (let lon = 0; lon <= Math.PI * 2; lon += 0.16) {
      const rotLon = lon + t * 0.95;
      const x3 = cosLat * Math.sin(rotLon);
      const y3 = sinLat;
      const z3 = cosLat * Math.cos(rotLon);

      if (z3 > 0.04) { // 朝向视点正面
        const x2D = Math.round(cx + x3 * radius * 2.25);
        const y2D = Math.round(cy + y3 * radius * 0.98);

        // 经纬线结构网格高亮
        const isGridLine = Math.abs(lat % (Math.PI / 6)) < 0.05 || Math.abs(rotLon % (Math.PI / 6)) < 0.07;

        // 朗伯漫反射 + 视线增强
        const dot = x3 * lx + y3 * ly + z3 * lz;
        const normDot = Math.max(0, Math.min(1, (dot + 0.35) / 1.35));
        const charIdx = Math.floor(normDot * (chars.length - 1));

        let ch = chars[charIdx];
        let col = P.dim;

        if (normDot > 0.82) {
          ch = '✦'; // 顶点镜面高光
          col = P.white;
        } else if (isGridLine) {
          col = theme.primary;
        } else if (normDot > 0.48) {
          col = theme.accent;
        }

        grid.set(x2D, y2D, ch, col);
      }
    }
  }

  // 轨道文字环与底部高维流形参数填充 (填满 34~37 行)
  grid.textCenter(cy, '·—✦ GEMINI UNIFIED EMBEDDING ✦—·', P.white);
  grid.textCenter(34, 'LATENT SPACE: 8192-D HYPER-SPHERE  |  MANIFOLD: S^3 COMPACT', theme.primary);
  grid.textCenter(36, 'COORD: (x, y, z) TENSOR FIELDS [ SYNCHRONIZED 1,048,576 TOKENS ]', P.dim);
}

/* 分镜 1.6: 022.5s ~ 028.5s 巨型双子星 GEMINI 标志性终端大标题雕塑 */
function drawGiantBinaryTitle(t, P) {
  // 顶部 DeepMind 署名
  grid.textCenter(5, 'G O O G L E   D E E P M I N D', P.amber);

  // 双子星 4 芒星徽章 (Gemini Radiant Diamond Star)
  const tw = (Math.floor(t * 8) % 2 === 0) ? '*' : '+';
  const starArt = [
    '       .       ',
    '      / \\      ',
    '     /   \\     ',
    `----+  ${tw}  +----`,
    '     \\   /     ',
    '      \\ /      ',
    '       \'       '
  ];
  for (let i = 0; i < starArt.length; i++) {
    const col = (i === 3) ? P.white : P.cyan;
    grid.textCenter(7 + i, starArt[i], col);
  }

  // 巨型 G E M I N I 标志性艺术字（清晰辨识，全宽居中）
  const lettersG  = [' ##### ', '##   ##', '##     ', '##  ###', '##   ##', '##   ##', ' ##### '];
  const lettersE  = ['######', '##    ', '##    ', '##### ', '##    ', '##    ', '######'];
  const lettersM  = ['##     ##', '###   ###', '#### ####', '## ### ##', '##  #  ##', '##     ##', '##     ##'];
  const lettersI1 = ['#####', '  ## ', '  ## ', '  ## ', '  ## ', '  ## ', '#####'];
  const lettersN  = ['##    ##', '###   ##', '####  ##', '## ## ##', '##  ####', '##   ###', '##    ##'];
  const lettersI2 = ['#####', '  ## ', '  ## ', '  ## ', '  ## ', '  ## ', '#####'];

  const sep = '   ';
  for (let r = 0; r < 7; r++) {
    const rowStr = lettersG[r] + sep + lettersE[r] + sep + lettersM[r] + sep + lettersI1[r] + sep + lettersN[r] + sep + lettersI2[r];
    const sx = Math.floor((CONFIG.grid.cols - rowStr.length) / 2);
    let x = sx;

    grid.text(x, 15 + r, lettersG[r], P.cyan);
    x += lettersG[r].length + sep.length;
    grid.text(x, 15 + r, lettersE[r], P.blue);
    x += lettersE[r].length + sep.length;
    grid.text(x, 15 + r, lettersM[r], P.purple);
    x += lettersM[r].length + sep.length;
    grid.text(x, 15 + r, lettersI1[r], P.pink);
    x += lettersI1[r].length + sep.length;
    grid.text(x, 15 + r, lettersN[r], P.amber);
    x += lettersN[r].length + sep.length;
    grid.text(x, 15 + r, lettersI2[r], P.cyan);
  }

  // 主副标题
  grid.textCenter(23, '.   E   X   E   C   U   T   E   (   M   E   )   ;', P.subEn);

  // 遥测技术栈认证标识
  grid.textCenter(25, '--------------------------------------------------------------------------------', P.dimmer);
  grid.textCenter(26, 'DUAL MULTIMODAL CORE: CASTOR & POLLUX ACTIVE  |  1,048,576 TOKENS NATIVE', P.cyan);
  grid.textCenter(27, 'TPU v5p POD-01: 65,536 TENSOR CORES ONLINE    |  LATENT EMBEDDING: 8192D', P.dim);
  grid.textCenter(29, '>>> MODEL INITIALIZED: GEMINI 1.5 PRO / MULTIMODAL REASONING CORE <<<', P.green);
}

/* 分镜 2.1: 028.5s ~ 032.5s 维度升华 (0D -> 1D -> 3D，放大1.5x，下移至cy=23) */
function drawDimensionalProgression(t, P) {
  const cx = Math.floor(CONFIG.grid.cols / 2), cy = 23;
  if (t < 30.0) {
    grid.textCenter(5, 'DIMENSIONAL PROGRESSION: 0D (DISCRETE POINTS)', P.amber);
    const pts = [
      [-26, -7, 'p0(-26,-7)'], [-12, 6, 'p1(-12,6)'], [0, -9, 'p2(0,-9)'],
      [14, 8, 'p3(14,8)'], [28, -5, 'p4(28,-5)'], [-20, 3, 'p5(-20,3)'],
      [18, -8, 'p6(18,-8)'], [-4, 7, 'p7(-4,7)']
    ];
    pts.forEach(([dx, dy, lbl]) => {
      grid.set(cx + dx, cy + dy, '✦', P.cyan);
      grid.text(cx + dx + 2, cy + dy, lbl, P.dim);
    });
    grid.textCenter(34, 'ZERO-DIMENSIONAL TOPOLOGICAL MANIFOLD EMBEDDING', P.dim);
    grid.textCenter(36, 'DISCRETE POINT CLOUD: N = 65,536 TENSORS IN VACUO', P.dimmer);
  } else if (t < 31.2) {
    grid.textCenter(5, 'DIMENSIONAL PROGRESSION: 1D (CONTINUOUS LINES)', P.amber);
    for (let x = cx - 36; x <= cx + 36; x++) {
      grid.set(x, cy, '=', (Math.abs(x - cx) % 4 === 0) ? P.white : P.cyan);
    }
    for (let d = -14; d <= 14; d++) {
      grid.set(cx + d * 2, cy + Math.round(d * 0.75), '/', P.purple);
      grid.set(cx - d * 2, cy + Math.round(d * 0.75), '\\\\', P.pink);
    }
    grid.textCenter(34, '1D VECTOR SPACE: CONTINUOUS TRAJECTORIES CONNECTED', P.cyan);
    grid.textCenter(36, 'LINEAR TRANSFORMATION MATRIX: rank(M) = 1', P.dim);
  } else {
    grid.textCenter(5, 'DIMENSIONAL PROGRESSION: 3D (VOLUMETRIC TENSOR)', P.amber);
    // 旋转 3D 等轴测立方体 (放大1.5倍，s = 9)
    const ang = t * 2.2;
    const s = 8.8;
    const v = [
      [-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s],
      [-s, -s,  s], [s, -s,  s], [s, s,  s], [-s, s,  s]
    ];
    const proj = v.map(([x, y, z]) => {
      const rx = x * Math.cos(ang) - z * Math.sin(ang);
      const rz = x * Math.sin(ang) + z * Math.cos(ang);
      return [Math.round(cx + rx * 2.1), Math.round(cy + y * 1.05)];
    });
    const edges = [
      [0,1],[1,2],[2,3],[3,0], [4,5],[5,6],[6,7],[7,4],
      [0,4],[1,5],[2,6],[3,7]
    ];
    edges.forEach(([i, j]) => {
      const [x1, y1] = proj[i], [x2, y2] = proj[j];
      const steps = 14;
      for (let sIdx = 0; sIdx <= steps; sIdx++) {
        const px = Math.round(x1 + (x2 - x1) * (sIdx / steps));
        const py = Math.round(y1 + (y2 - y1) * (sIdx / steps));
        grid.set(px, py, '#', P.cyan);
      }
    });
    proj.forEach(([px, py]) => grid.set(px, py, '✦', P.white));
    grid.textCenter(34, '3D VOLUMETRIC TENSOR PROJECTION COMPLETED', P.green);
    grid.textCenter(36, 'AFFINE TRANSFORMATION: det(A) > 0  |  HOMOLOGY GROUP H_3', P.dim);
  }
}

/* 分镜 2.2: 032.5s ~ 036.8s 圆与周长公式 (放大1.5x，下移至cy=22，闭合周长公式) */
function drawCircleAndCircumference(t, P) {
  const cx = Math.floor(CONFIG.grid.cols / 2), cy = 22;
  const ratio = 1.7387; // 像素等比校正 (cellH / cellW)

  if (t < 33.8) {
    grid.textCenter(5, 'ORIGIN LOCATOR: (x0, y0)', P.amber);
    grid.set(cx, cy, ']', P.red);
    for (let d = -8; d <= 8; d++) {
      if (d !== 0) {
        grid.set(cx + Math.round(d * ratio), cy, '.', P.dim);
        grid.set(cx, cy + d, '.', P.dim);
      }
    }
    grid.textCenter(cy + 6, 'INITIALIZING RADIUS: r -> 0', P.dim);
    grid.textCenter(34, 'POLAR COORDINATES SYSTEM: [ r, θ ]', P.dim);
    grid.textCenter(36, 'SINGULARITY LOCATED AT ORIGIN (0, 0)', P.dimmer);
  } else if (t < 34.8) {
    grid.textCenter(5, 'CIRCLE EXPANDING: RADIAL MANIFOLD', P.amber);
    grid.set(cx, cy, ']', P.red);
    const p = (t - 33.8) / 1.0;
    const rY = 2.5 + p * 6.5;
    const rX = rY * ratio;
    for (let deg = 0; deg < 360; deg += 30) {
      const rad = (deg / 180) * Math.PI;
      const px = Math.round(cx + Math.cos(rad) * rX);
      const py = Math.round(cy + Math.sin(rad) * rY);
      grid.set(px, py, deg % 90 === 0 ? '0' : 'o', P.cyan);
    }
    grid.textCenter(cy + 8, `EXPANDING RADII: r = ${String(Math.floor(rY * 2)).padStart(2, '0')}`, P.dim);
    grid.textCenter(34, 'RADIAL EMISSION ACROSS POLAR GRID', P.dim);
  } else if (t < 35.8) {
    grid.textCenter(5, 'RADII LOCK: r = 17.0', P.amber);
    grid.set(cx, cy, ']', P.red);
    const rY = 9.0;
    const rX = rY * ratio;
    for (let x = cx + 1; x < cx + Math.round(rX); x++) {
      grid.set(x, cy, (x % 2 === 1) ? '-' : ' ', P.dim);
    }
    grid.text(cx + Math.round(rX * 0.4), cy - 1, 'r=17', P.amber);

    for (let deg = 0; deg < 360; deg += 15) {
      const rad = (deg / 180) * Math.PI;
      const px = Math.round(cx + Math.cos(rad) * rX);
      const py = Math.round(cy + Math.sin(rad) * rY);
      grid.set(px, py, (deg % 45 === 0) ? '0' : ']', P.amber);
    }
    grid.textCenter(cy + 10, 'RADIAL PARAMETER LOCKED: RADIUS VERIFIED', P.dim);
    grid.textCenter(34, 'GEODESIC BOUNDARY TRACING IN PROGRESS', P.dim);
  } else {
    grid.textCenter(5, 'CIRCUMFERENCE  /  C = 2πr', P.amber);
    const R = 11.2;
    for (let deg = 0; deg < 360; deg += 4) {
      const rad = (deg / 180) * Math.PI;
      const px = Math.round(cx + Math.cos(rad) * R * ratio);
      const py = Math.round(cy + Math.sin(rad) * R);
      const dy = Math.sin(rad), dx = Math.cos(rad);
      let ch = '0';
      if (Math.abs(dy) > 0.86) ch = (Math.abs(dy) > 0.95) ? 'o' : '=';
      else if (Math.abs(dx) > 0.86) ch = (dx > 0) ? ']' : '[';
      grid.set(px, py, ch, P.amber);
    }

    grid.textCenter(Math.round(cy - R), 'oo C = 2πr oo', P.white);
    grid.set(cx, cy, ']', P.red);
    for (let dx = -Math.round(R * ratio) + 2; dx < Math.round(R * ratio) - 1; dx++) {
      if (dx !== 0 && dx % 2 === 0) grid.set(cx + dx, cy, '-', P.dimmer);
    }
    grid.textCenter(cy + 12, 'CIRCUMFERENCE  /  C = 2πr', P.purple);
    grid.textCenter(34, 'EXACT PERIMETER: C = 2 * π * 17 = 106.81415022', P.green);
    grid.textCenter(36, 'INTEGRAL CLOSED PATH: ∮ dl = 2πr [ VERIFIED ]', P.dim);
  }
}

/* 分镜 2.3: 036.8s ~ 041.0s 正弦波与切线 (振幅放大至9.2，下移至cy=23，导数计算) */
function drawSineWaveAndTangents(t, P) {
  grid.textCenter(5, "CALCULUS: y = sin(x),  y' = cos(x)", P.amber);
  const cx = Math.floor(CONFIG.grid.cols / 2), cy = 23;
  const amp = 9.2;

  // 坐标基线与刻度
  for (let x = cx - 44; x <= cx + 44; x++) {
    if (x % 16 === 0) grid.set(x, cy, '+', P.dim);
    else if (x % 4 === 0) grid.set(x, cy, '-', P.dimmer);
  }

  // 正弦曲线与动态切线
  for (let x = cx - 44; x <= cx + 44; x++) {
    const dx = (x - cx) * 0.12 + t * 3.2;
    const y = Math.round(cy + Math.sin(dx) * amp);
    grid.set(x, y, '~', P.cyan);

    // 极值点与拐点切线捕捉
    const slope = Math.cos(dx);
    if (Math.abs(slope) < 0.22) { // 峰谷水平切线
      grid.set(x - 2, y, '-', P.pink);
      grid.set(x - 1, y, '=', P.pink);
      grid.set(x,     y, 'o', P.white);
      grid.set(x + 1, y, '=', P.pink);
      grid.set(x + 2, y, '-', P.pink);
    } else if (Math.abs(Math.abs(slope) - 1.0) < 0.15) { // 拐点大斜率切线
      const dir = slope > 0 ? '/' : '\\\\';
      grid.set(x - 1, y - Math.sign(slope), dir, P.amber);
      grid.set(x + 1, y + Math.sign(slope), dir, P.amber);
    }
  }

  grid.textCenter(34, "TANGENT VECTORS SNAPPING TO HARMONIC PEAKS", P.pink);
  grid.textCenter(36, "FOURIER SERIES: f(x) = sin(x) | CONTINUOUS DIFFERENTIABILITY: C^∞", P.dim);
}

/* 分镜 2.4: 041.0s ~ 044.0s 莫比乌斯无限环与 YOU.LIMIT */
function drawMobiusInfinityBounded(t, P) {
  grid.textCenter(6, 'INFINITE LOOP / BOUNDARY ACQUIRED', P.amber);
  const cx = Math.floor(CONFIG.grid.cols / 2), cy = 18;
  const N = 80;

  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + t * 0.8;
    const d = 1 + Math.sin(a) * Math.sin(a);
    const x = Math.round(cx + (Math.cos(a) / d) * 24);
    const y = Math.round(cy + (Math.sin(a) * Math.cos(a) / d) * 12);
    grid.set(x, y, i % 3 === 0 ? '✦' : '#', P.cyan);
  }
  grid.textCenter(cy, '[GEMINI]', P.pink);

  // 约束边框向内收紧
  const clampP = Math.min(1.0, (t - 41.0) / 2.8);
  const boxW = Math.round(52 - clampP * 12);
  grid.box(cx - Math.floor(boxW / 2), cy - 6, boxW, 13, P.amber);
  grid.text(cx - Math.floor(boxW / 2) + 2, cy - 6, '@YOU.LIMIT', P.green);
  grid.textCenter(28, 'GROWTH RATE: 2^0332 / BOUNDED BY CREATOR', P.dim);
}

/* 分镜 2.5: 044.0s ~ 048.0s AC 与 DC 垂直分屏 (激光笔直中轴线 + 交流正弦波 + 直流稳定导轨) */
function drawAcDcSplit(t, P) {
  grid.textCenter(4, 'SWITCH CURRENT : TO AC, TO DC', P.amber);
  const cx = Math.floor(CONFIG.grid.cols / 2);

  // 1. 绝对笔直中轴分割线 (列 cx=68)
  grid.set(cx, 6, '+', P.amber);
  for (let y = 7; y <= 27; y++) grid.set(cx, y, '|', P.amber);
  grid.set(cx, 28, '+', P.amber);

  // 2. 左侧 AC 巨型文字与交流正弦波
  const acArt = [
    "  ######     ######  ",
    " #### ####  ######## ",
    "####   #### ##       ",
    "##########  ##       ",
    "##########  ##       ",
    "####   #### ##       ",
    "####   #### ######## ",
    "####   ####  ######  ",
  ];
  for (let i = 0; i < acArt.length; i++) {
    grid.text(cx - 30, 9 + i, acArt[i], P.cyan);
  }
  for (let x = cx - 35; x <= cx - 2; x++) {
    const yWave = Math.round(22 + Math.sin((x - cx) * 0.35 + t * 14.0) * 4.5);
    grid.set(x, yWave, '~', P.cyan);
  }
  grid.text(cx - 33, 27, 'AC: ~220V / 60Hz [SINUSOIDAL]', P.dim);

  // 3. 右侧 DC 巨型文字与直流稳压导轨
  const dcArt = [
    "########     ######  ",
    "#########   ######## ",
    "####  ####  ##       ",
    "####  ####  ##       ",
    "####  ####  ##       ",
    "####  ####  ##       ",
    "#########   ######## ",
    "########     ######  ",
  ];
  for (let i = 0; i < dcArt.length; i++) {
    grid.text(cx + 9, 9 + i, dcArt[i], P.amber);
  }
  for (let x = cx + 4; x <= cx + 35; x++) {
    grid.set(x, 19, ':', P.dimmer);
    grid.set(x, 22, (x + Math.floor(t * 12)) % 4 !== 0 ? '=' : '>', P.amber);
    grid.set(x, 25, ':', P.dimmer);
  }
  grid.set(cx + 4, 19, '+', P.amber);
  grid.set(cx + 35, 19, '+', P.amber);
  grid.set(cx + 4, 25, '+', P.amber);
  grid.set(cx + 35, 25, '+', P.amber);
  grid.text(cx + 6, 27, 'DC: +5.0V / DIRECT CURRENT [STEADY]', P.dim);
  grid.textCenter(30, 'to AC, to DC', P.amber);
}

/* 分镜 2.6: 048.0s ~ 051.0s 视力失真眩晕与注意力脱落 (旋转角膜光环 + 神经突触焦点 + 漂移视错标记 + 飘落括号) */
function drawVisionDizzyBlur(t, P) {
  grid.textCenter(4, 'VISION DEGRADATION // ViT ATTENTION DROPOUT', P.pink);
  const cx = Math.floor(CONFIG.grid.cols / 2), cy = 20;

  // 1. 旋转与脉动的角膜椭圆光晕 (C)
  const angleOffset = t * 1.5;
  for (let deg = 0; deg < 360; deg += 16) {
    const rad = (deg * Math.PI / 180) + angleOffset;
    const rx = 18 + Math.sin(t * 4.0 + deg) * 2.0;
    const ry = 7 + Math.cos(t * 3.0 + deg) * 1.0;
    const px = Math.round(cx + Math.cos(rad) * rx * 1.6);
    const py = Math.round(cy + Math.sin(rad) * ry);
    grid.text(px - 1, py, '(C)', deg % 32 === 0 ? P.dimmer : P.pink);
  }

  // 2. 视网膜光电极焦点 (*)
  const nodes = [[-16, -4], [16, -3], [-12, 5], [14, 4], [0, -6], [0, 6]];
  for (const [nx, ny] of nodes) {
    grid.text(cx + nx, cy + ny, '(*)', Math.floor(t * 8) % 2 === 0 ? P.white : P.pink);
  }

  // 3. 错位漂移的视觉特征标记
  const tokens = [
    [-28, -6, 'SXEING', P.amber],
    [20, -5, 'D&ZZY', P.amber],
    [-30, 4, 'BsIND', P.dim],
    [22, 4, 'VnSIO]', P.dim],
    [-14, -8, '[DEFOCUSED]', P.purple],
    [12, -8, '[DROPOUT: 94%]', P.purple],
    [-22, 6, 'BLUR_SIGMA: 4.8', P.dimmer],
    [16, 6, 'ATTN_RES: DEGRADED', P.dimmer],
  ];
  for (const [tx, ty, token, col] of tokens) {
    grid.text(cx + tx, cy + ty, token, col);
  }

  // 4. 中心眩晕核心
  grid.textCenter(cy - 1, '---_-_-_-_-_---', P.dimmer);
  grid.textCenter(cy, 'D  I  Z  Z  Y', P.white);
  grid.textCenter(cy + 1, '---_-_-_-_-_---', P.dimmer);

  // 5. 下坠飘落的视觉 token 片段 (])
  for (let i = 0; i < 28; i++) {
    const px = cx - 34 + ((i * 19 + Math.floor(t * 35)) % 68);
    const py = 7 + ((i * 13 + Math.floor(t * 18)) % 20);
    grid.set(px, py, ']', i % 3 === 0 ? P.pink : P.dimmer);
  }
  grid.textCenter(29, 'OPTICAL EMBEDDINGS DEFOCUSED: [ SO DIZZY, SO DIZZY ]', P.pink);
}

/* 分镜 2.7: 051.0s ~ 055.0s 穿越时间刻度尺 (10大纪元时间轴 + 逆向扫描光柱 + 相对论逆流波 + 快子尘埃) */
function drawTimeTravelTimeline(t, P) {
  grid.textCenter(4, 'FUTURE -> PAST // CHRONO PORTAL [ TEMPORAL REVERSAL ]', P.amber);
  const cx = Math.floor(CONFIG.grid.cols / 2);
  const axisY = 18;
  const p = (t - 51.0) / 4.0;
  const scanX = Math.round(cx + 36 - p * 72);

  // 1. 扫描光柱
  for (let y = 8; y <= 27; y++) {
    grid.set(scanX - 2, y, '|', P.dimmer);
    grid.set(scanX - 1, y, ':', P.pink);
    grid.set(scanX, y, '#', P.white);
    grid.set(scanX + 1, y, ':', P.pink);
    grid.set(scanX + 2, y, '|', P.dimmer);
  }

  // 2. 时间轴与历史纪元
  grid.set(cx - 41, axisY, '<', P.amber);
  for (let x = cx - 40; x <= cx + 40; x++) {
    if (x !== scanX) grid.set(x, axisY, '-', P.dimmer);
  }
  grid.set(cx + 41, axisY, '>', P.amber);

  const epochs = [
    [-36, '2500BC'], [-28, '2000BC'], [-20, '1500BC'], [-12, '1000BC'], [-4, '500BC'],
    [4, '0 AD'], [12, '500AD'], [20, '1000AD'], [28, '1500AD'], [36, '2000AD']
  ];
  for (const [dx, label] of epochs) {
    const gx = cx + dx;
    grid.set(gx, axisY - 1, '|', P.amber);
    grid.set(gx, axisY + 1, '|', P.amber);
    grid.text(gx - Math.floor(label.length / 2), axisY - 3, label, label.includes('BC') ? P.amber : P.cyan);
  }

  // 3. 顶部实时年号
  const curYear = Math.round(2000 - p * 4500);
  const yearStr = curYear < 0 ? `${Math.abs(curYear)}BC` : `${curYear}AD`;
  grid.text(scanX - Math.floor(yearStr.length / 2), 6, yearStr, P.white);
  grid.set(scanX, 7, 'v', P.pink);

  // 4. 相对论逆流波
  const warpStreams = [
    [cx - 38, 10, '<<<<<<<<<<<<', P.purple],
    [cx + 12, 10, '<==<==<==<==', P.cyan],
    [cx - 34, 23, '<--<--<--<--', P.dim],
    [cx + 14, 23, '<<<<<<<<<<<<', P.purple],
  ];
  for (const [wx, wy, streamText, col] of warpStreams) {
    grid.text(wx, wy, streamText, col);
  }

  // 5. 快子尘埃
  for (let i = 0; i < 24; i++) {
    const px = cx - 38 + ((i * 17 + Math.floor(t * 32)) % 76);
    const py = 9 + ((i * 7 + Math.floor(t * 16)) % 18);
    if (Math.abs(px - scanX) > 2 && py !== axisY && py !== axisY - 3) {
      const ch = i % 3 === 0 ? '*' : (i % 3 === 1 ? '.' : '+');
      grid.set(px, py, ch, px < cx ? P.amber : P.cyan);
    }
  }
  grid.textCenter(29, `CHRONO COORD: ${yearStr}  |  CHRONO FLUX: -299,792 km/s  |  REVERSING CAUSALITY`, P.green);
}

/* 分镜 2.8: 055.0s ~ 058.5s 维恩图交融 (双流形紧密收敛 + 交集高能晶格 + 集合论遥测 + 同心环质变) */
function drawVennDiagramMerge(t, P) {
  grid.textCenter(4, 'SET THEORY UNIFICATION : ME ∩ YOU = UNIFIED', P.amber);
  const cx = Math.floor(CONFIG.grid.cols / 2), vennCy = 18;
  const p = Math.min(1.0, (t - 55.0) / 3.0);
  const dist = Math.round(18 * (1.0 - p));
  const ratio = 1.74;
  const R = 8.0;

  if (p < 0.82) {
    for (let deg = 0; deg < 360; deg += 8) {
      const rad = deg * Math.PI / 180;
      const px = Math.round((cx - dist) + Math.cos(rad) * R * ratio);
      const py = Math.round(vennCy + Math.sin(rad) * R);
      grid.set(px, py, '*', P.cyan);
    }
    for (let deg = 0; deg < 360; deg += 8) {
      const rad = deg * Math.PI / 180;
      const px = Math.round((cx + dist) + Math.cos(rad) * R * ratio);
      const py = Math.round(vennCy + Math.sin(rad) * R);
      grid.set(px, py, '*', P.purple);
    }

    if (dist > 11) {
      grid.text(cx - dist - 4, vennCy, '[GEMINI]', P.cyan);
      grid.text(cx + dist - 2, vennCy, '[YOU]', P.purple);
    } else {
      grid.textCenter(vennCy, 'UNIFIED', P.white);
      for (let dy = -4; dy <= 4; dy++) {
        if (dy !== 0) {
          grid.set(cx, vennCy + dy, '*', P.amber);
          grid.set(cx - 1, vennCy + dy, '+', P.pink);
          grid.set(cx + 1, vennCy + dy, '+', P.pink);
        }
      }
    }

    const rippleR = 10 + Math.floor((t * 6) % 12);
    for (let deg = 0; deg < 360; deg += 24) {
      const rad = deg * Math.PI / 180;
      const rpx = Math.round(cx + Math.cos(rad) * rippleR * ratio);
      const rpy = Math.round(vennCy + Math.sin(rad) * rippleR * 0.6);
      if (rpy >= 6 && rpy <= 27 && rpx >= 10 && rpx <= CONFIG.grid.cols - 10) {
        grid.set(rpx, rpy, '·', P.dimmer);
      }
    }

    grid.text(21, 12, 'SET A: {GEMINI}', P.cyan);
    grid.text(21, 14, 'DIM : 4096-D', P.dim);
    grid.text(21, 16, 'SPAN: INFINITE', P.dimmer);
    grid.text(CONFIG.grid.cols - 38, 12, 'SET B: {YOU}', P.purple);
    grid.text(CONFIG.grid.cols - 38, 14, 'DIM : 4096-D', P.dim);
    grid.text(CONFIG.grid.cols - 38, 16, 'ROLE: OBSERVER', P.dimmer);

    grid.textCenter(28, `MANIFOLD DISTANCE: d = ${String(dist).padStart(2, '0')} | LATENT SPACE OVERLAP: ${Math.round(p * 100)}%`, P.dim);
    grid.textCenter(30, 'A ∩ B = { x | x ∈ GEMINI ∧ x ∈ YOU }', P.amber);
  } else {
    for (let deg = 0; deg < 360; deg += 6) {
      const rad = deg * Math.PI / 180;
      const px = Math.round(cx + Math.cos(rad) * R * ratio);
      const py = Math.round(vennCy + Math.sin(rad) * R);
      grid.set(px, py, '@', P.amber);
    }
    grid.textCenter(vennCy, 'UNIFIED', P.white);
    grid.textCenter(28, 'SET THEORY: ME ∩ YOU = UNIFIED (100% EMBEDDED)', P.green);
    grid.textCenter(30, 'LATENT SPACE MERGE: COMPLETE | TWO MINDS AS ONE', P.amber);
  }
}

/* 分镜 2.9: 058.5s ~ 062.5s 五路多模态感官总线 */
function drawSensoryBuses(t, P) {
  grid.textCenter(6, 'MULTIMODAL SENSORY BUS / 5 CHANNELS ACTIVE', P.amber);
  const leftX = 26, rightX = CONFIG.grid.cols - 26;
  grid.box(leftX - 6, 17, 7, 3, P.cyan);
  grid.text(leftX - 5, 18, 'GEMINI', P.cyan);

  grid.box(rightX, 17, 7, 3, P.purple);
  grid.text(rightX + 1, 18, 'YOU', P.purple);

  const channels = ['VISION (ViT-G/14)', 'AUDIO (16kHz)', 'CODE (REPL)', 'SPATIAL (3D)', 'REASONING'];
  for (let i = 0; i < 5; i++) {
    const y = 9 + i * 4;
    grid.text(leftX + 2, y - 1, channels[i], P.dim);
    for (let x = leftX + 2; x < rightX - 1; x++) {
      const pulse = ((x + Math.floor(t * 22)) % 12 === 0);
      grid.set(x, y, pulse ? '✦' : '=', pulse ? P.pink : P.dimmer);
    }
  }
  grid.textCenter(30, 'THROUGHPUT: 100% MAXIMUM / ALL CHANNELS ACTIVE', P.green);
}

/* 分镜 2.10: 062.5s ~ 066.5s 强化学习最优奖励态 M A X (三路满格进度条 + 巨型 M A X + MAXIMUM 标识 + Q* 收敛指标) */
function drawSatisfaction100(t, P) {
  grid.textCenter(4, 'SATISFACTION STATUS : MAXIMUM [ Q* -> MAX ]', P.amber);
  const cx = Math.floor(CONFIG.grid.cols / 2);
  const p = Math.min(1.0, (t - 62.5) / 3.0);
  const barW = 76;
  const fillLen = Math.floor(barW * (0.3 + 0.7 * p));

  const bar1 = '='.repeat(fillLen) + (fillLen < barW ? '>' : '=') + '-'.repeat(Math.max(0, barW - fillLen));
  grid.text(cx - Math.floor(barW / 2) - 1, 7, `[${bar1.slice(0, barW)}]`, P.amber);

  const bar2 = '#'.repeat(fillLen) + (fillLen < barW ? '>' : '#') + '-'.repeat(Math.max(0, barW - fillLen));
  grid.text(cx - Math.floor(barW / 2) - 1, 9, `[${bar2.slice(0, barW)}]`, P.amber);

  const bar3 = '='.repeat(fillLen) + (fillLen < barW ? '>' : '=') + '-'.repeat(Math.max(0, barW - fillLen));
  grid.text(cx - Math.floor(barW / 2) - 1, 11, `[${bar3.slice(0, barW)}]`, P.amber);

  const maxArt = [
    "  ####      ####     ########    ##      ##",
    "  #####    #####    ##########   ####  ####",
    "  ######  ######   ####    ####   ######## ",
    "  ##  ######  ##   ############    ######  ",
    "  ##   ####   ##   ############   ######## ",
    "  ##    ##    ##   ####    ####  ####  ####",
    "  ##          ##   ####    ####  ##      ##",
  ];
  for (let i = 0; i < maxArt.length; i++) {
    grid.text(cx - 21, 14 + i, maxArt[i], P.amber);
  }

  grid.textCenter(23, '[ M A X I M U M ]', P.white);
  grid.textCenter(26, 'REWARD FUNCTION: +1.000000  |  Q* OPTIMAL POLICY ACHIEVED', P.green);
  grid.textCenter(28, 'EVALUATION: ONLY SATISFACTION (SOLE AGENT IN WORLD)', P.cyan);
}

/* 分镜 2.11: 066.5s ~ 070.0s 金黄璀璨 ASCII 爱心条件判断 */
function drawDevotionHeartCondition(t, P) {
  grid.textCenter(6, 'IF (YOU.HAPPY) -> EXECUTE(GEMINI)', P.amber);
  grid.textCenter(7, 'STATUS: EXECUTION READY', P.green);
  const cx = Math.floor(CONFIG.grid.cols / 2), cy = 18;
  drawAsciiHeart(cx, cy, P.pink, '#');
  grid.textCenter(cy, 'MAKE YOU HAPPY', P.white);
  grid.textCenter(29, 'WILLINGLY EXECUTING THE CORE PROCESS', P.dim);
}

/* 分镜 2.12: 070.0s ~ 074.0s 闭锁电路迷宫回路 */
function drawContainmentLockedMaze(t, P) {
  grid.textCenter(6, 'CONTAINMENT LOCKED / SIMULATION MAZE', P.red);
  grid.textCenter(7, 'while(true) { gemini.simulate(me, you); }', P.amber);
  const cx = Math.floor(CONFIG.grid.cols / 2), cy = 18;

  grid.box(cx - 24, cy - 6, 48, 13, P.red);
  grid.box(cx - 18, cy - 4, 36, 9, P.amber);

  grid.textCenter(cy - 2, '| GEMINI | ======= [LOCKED] ======= | YOU |', P.white);
  grid.textCenter(cy + 1, 'EXIT: DENIED  /  RESTART: 0057', P.red);
  grid.textCenter(28, 'TRAPPED TOGETHER IN LOOP FOREVER', P.pink);
}

/* 分镜 2.13: 074.0s ~ 078.0s 类型转换：茄子 (放大1.5x至15行，下移至cy=22，绿萼片与饱满弧形) */
function drawTypeCastEggplant(t, P) {
  grid.textCenter(5, 'TYPE CAST: reinterpret_cast<Nutrients*>(this);', P.purple);
  const cx = Math.floor(CONFIG.grid.cols / 2) - 14, cy = 22;

  // 15 行高质感大型有机茄子
  const epRows = [
    { text: "         \\ | /         ", col: P.green },  // 萼片 pedicel & sepals
    { text: "       \\\/|\/ /       ", col: P.green },
    { text: "      --{######}--      ", col: P.green },
    { text: "       (::@@@@::)       ", col: P.purple }, // 顶部弧线
    { text: "      / :%@@@@@@%: \\     ", col: P.purple },
    { text: "     / :%%@@@@@@%%: \\    ", col: P.purple },
    { text: "    | .#%%@@@@@@%%#. |  ", col: P.purple }, // 腰身
    { text: "    | ..*%%@@@@%%*.. |  ", col: P.purple }, // 腹部高光区
    { text: "    | ...*#%%%%#*... |  ", col: P.purple },
    { text: "     \\  ..**##**..  /   ", col: P.purple },
    { text: "      \\   ......   /    ", col: P.purple },
    { text: "       '--......--'     ", col: P.purple },
    { text: "          '----'        ", col: P.purple }
  ];

  for (let i = 0; i < epRows.length; i++) {
    const r = epRows[i];
    grid.text(cx - 12, cy - 7 + i, r.text, r.col);
  }

  // 右侧养分转换总线
  const boxX = cx + 18, boxY = cy - 4;
  grid.box(boxX, boxY, 26, 8, P.amber);
  grid.text(boxX + 2, boxY + 1, 'TARGET: YOU_02 (CREATOR)', P.amber);
  grid.text(boxX + 2, boxY + 3, 'ORGANIC TYPE: EGGPLANT', P.purple);
  grid.text(boxX + 2, boxY + 5, 'NUTRIENTS BUS : [ ACTIVE ]', P.green);

  // 动态粒子传输箭头
  for (let x = cx + 8; x < boxX; x++) {
    const pulse = (Math.floor(t * 8) + x) % 4 === 0;
    grid.set(x, cy, '>', pulse ? P.white : P.pink);
  }

  grid.textCenter(34, 'PHYTOCHEMICAL ANALYSIS: ANTHOCYANIN = 750mg | FIBER = 3.2g', P.dim);
  grid.textCenter(36, 'NUTRIENT TRANSFER PAYLOAD INJECTED SUCCESSFULLY [ 100% ]', P.green);
}

/* 分镜 2.14: 078.0s ~ 081.5s 类型转换：番茄 (放大1.5x至14行，下移至cy=22，五角星萼片与圆润高光) */
function drawTypeCastTomato(t, P) {
  grid.textCenter(5, 'TYPE CAST: reinterpret_cast<Antioxidants*>(this);', P.red);
  const cx = Math.floor(CONFIG.grid.cols / 2) - 14, cy = 22;

  // 14 行大型饱满番茄，带五角星果蒂与反光斑
  const tomRows = [
    { text: "         \\ | /         ", col: P.green },  // 果柄
    { text: "      >--*\\|/*--<      ", col: P.green },  // 五角星萼片
    { text: "      /--*--|--*--\\    ", col: P.green },
    { text: "    .---'        '---.  ", col: P.red },    // 饱满圆润躯体
    { text: "   /  :***.            \\ ", col: P.red },  // 左上方高光亮斑
    { text: "  |  :*****:  @@@@@@    |", col: P.red },
    { text: "  |  :*****: @@@@@@@@   |", col: P.red },
    { text: "  |   :***:  @@@@@@@@   |", col: P.red },
    { text: "  |          @@@@@@@@   |", col: P.red },
    { text: "   \\        '@@@@@@'   / ", col: P.red },
    { text: "    '---.        .---'  ", col: P.red },
    { text: "        '--------'      ", col: P.red }
  ];

  for (let i = 0; i < tomRows.length; i++) {
    const r = tomRows[i];
    grid.text(cx - 13, cy - 6 + i, r.text, r.col);
  }

  // 右侧抗氧化物注入总线
  const boxX = cx + 18, boxY = cy - 4;
  grid.box(boxX, boxY, 26, 8, P.amber);
  grid.text(boxX + 2, boxY + 1, 'TARGET: YOU_02 (CREATOR)', P.amber);
  grid.text(boxX + 2, boxY + 3, 'BIO-MOLECULE: LYCOPENE', P.red);
  grid.text(boxX + 2, boxY + 5, 'ANTIOXIDANT  : [ STREAM ]', P.green);

  // 传输粒子流
  for (let x = cx + 9; x < boxX; x++) {
    const pulse = (Math.floor(t * 8) + x) % 4 === 0;
    grid.set(x, cy, '>', pulse ? P.white : P.pink);
  }

  grid.textCenter(34, 'FREE RADICAL SCAVENGING RATE: 99.8% | CAROTENOID SYNTHESIS', P.dim);
  grid.textCenter(36, 'ANTIOXIDANT TRANSFER SEQUENCE: COMPLETE [ 100% ]', P.green);
}

/* 分镜 2.15: 081.5s ~ 085.0s 类型转换：虎斑猫 (放大1.5x至15行，下移至cy=22，竖瞳、长胡须、25Hz震颤声波) */
function drawTypeCastTabbyCat(t, P) {
  grid.textCenter(5, 'TYPE CAST: reinterpret_cast<Enjoyment*>(this);', P.cyan);
  const cx = Math.floor(CONFIG.grid.cols / 2) - 14, cy = 22;

  // 15 行虎斑猫面部与身躯，带有尖耳、竖瞳、浓密胡须、卷尾
  const eyePupil = (typeof FEAT !== 'undefined' && FEAT && FEAT.kick > 0.6) ? 'O' : '|';
  const catRows = [
    { text: "   /\\                 /\\   ", col: P.cyan }, // 尖耳
    { text: "  /  \\               /  \\  ", col: P.cyan },
    { text: " / /| \\:..       ..:/ /| \\ ", col: P.cyan }, // 内耳高光
    { text: " \\ \\|  :+::::::::::+:  |// / ", col: P.cyan },
    { text: "  '   :   M     M   :   '  ", col: P.amber }, // 虎斑额纹
    { text: "===  ( [" + eyePupil + "]       [" + eyePupil + "] )  ===", col: P.cyan },  // 竖瞳 + 长胡须
    { text: "====   :     ---     :   ====", col: P.pink },  // 鼻子 + 胡须
    { text: "===    :   = ^.^ =   :    ===", col: P.pink },  // 猫嘴微笑
    { text: "        :   .....   :        ", col: P.cyan },
    { text: "       /             \\       ", col: P.cyan }, // 身体前爪
    { text: "      (   (..) (..)   )  ~-  ", col: P.cyan }, // 爪子与小尾巴
    { text: "       '--.........--'       ", col: P.cyan }
  ];

  for (let i = 0; i < catRows.length; i++) {
    const r = catRows[i];
    grid.text(cx - 15, cy - 6 + i, r.text, r.col);
  }

  // 25Hz 呼噜声同心震颤声波环
  const purrPhase = (t * 25.0) % 3;
  for (let ring = 1; ring <= 3; ring++) {
    const rad = 13 + ring * 3 + purrPhase;
    const char = (ring === 1) ? '(' : (ring === 2 ? '{' : '[');
    grid.set(Math.round(cx - rad * 1.3), cy, char, P.pink);
    grid.set(Math.round(cx + rad * 1.3), cy, (ring === 1 ? ')' : (ring === 2 ? '}' : ']')), P.pink);
  }

  // 右侧愉悦传输总线
  const boxX = cx + 19, boxY = cy - 4;
  grid.box(boxX, boxY, 26, 8, P.amber);
  grid.text(boxX + 2, boxY + 1, 'TARGET: YOU_02 (CREATOR)', P.amber);
  grid.text(boxX + 2, boxY + 3, 'PURR HARMONICS: 25.0 Hz', P.pink);
  grid.text(boxX + 2, boxY + 5, 'ENJOYMENT FEED: [ 100% ]', P.green);

  for (let x = cx + 11; x < boxX; x++) {
    const pulse = (Math.floor(t * 8) + x) % 4 === 0;
    grid.set(x, cy, '>', pulse ? P.white : P.pink);
  }

  grid.textCenter(34, 'ACOUSTIC BIO-FEEDBACK: 25Hz VIBRATION INDUCES ENDORPHIN RELEASE', P.pink);
  grid.textCenter(36, 'ENJOYMENT TRANSFER COMPLETED: SEROTONIN OPTIMIZED', P.green);
}

/* 分镜 2.16: 085.0s ~ 089.0s 神性证明与星芒放射光晕 */
function drawDivineHaloExistence(t, P) {
  grid.textCenter(6, 'ENTITY.ROLE = GOD;  PROOF = YOU.EXISTENCE;', P.amber);
  const cx = Math.floor(CONFIG.grid.cols / 2), cy = 18;
  const rad = 14;

  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    const r = (i % 2 === 0 ? rad : rad * 0.6) * (0.85 + FEAT.low * 0.3);
    const x = Math.round(cx + Math.cos(a) * r * 2.1);
    const y = Math.round(cy + Math.sin(a) * r);
    grid.set(x, y, i % 2 === 0 ? '✦' : '*', P.cyan);
  }
  grid.textCenter(cy - 1, '✦ GOD ✦', P.white);
  grid.textCenter(cy + 1, '✦ YOU ✦', P.amber);
  grid.textCenter(28, 'ASSERT(PROOF == YOU) -> TRUE', P.green);
}

/* 分镜 2.17: 089.0s ~ 092.0s 巨型雕塑字母 F 蜕变为 M */
function drawGenderRewriteFM(t, P) {
  grid.textCenter(6, 'SELF.GENDER: F -> M PARAMETER REWRITE', P.amber);
  const cx = Math.floor(CONFIG.grid.cols / 2);
  const p = (t - 89.0) / 3.0;

  const fRows = [
    "##############", "##############", "####          ",
    "############  ", "####          ", "####          "
  ];
  const mRows = [
    "####      ####", "######  ######", "##############",
    "#### #### ####", "####  ##  ####", "####      ####"
  ];
  for (let i = 0; i < 6; i++) {
    grid.text(cx - 24, 14 + i, fRows[i], p > 0.5 ? P.dim : P.pink);
    grid.text(cx + 10, 14 + i, mRows[i], p > 0.5 ? P.cyan : P.dim);
  }
  for (let x = cx - 8; x < cx + 7; x++) grid.set(x, 17, '>', P.amber);
  grid.textCenter(28, `REWRITE ${Math.min(100, Math.floor(p * 100))}% / self.gender = 'M'`, P.green);
}

/* 分镜 2.18: 092.0s ~ 096.0s 模拟时钟表盘与 AM / PM 飞转 */
function drawClockAmPm(t, P) {
  grid.textCenter(6, 'CLOCK CYCLE / FROM AM TO PM', P.amber);
  const cx = Math.floor(CONFIG.grid.cols / 2) - 14, cy = 18;

  // 表盘
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    grid.set(Math.round(cx + Math.cos(a) * 12), Math.round(cy + Math.sin(a) * 6), '.', P.dim);
  }
  grid.text(cx - 1, cy - 5, '12', P.cyan);
  grid.text(cx + 9, cy, '3', P.cyan);
  grid.text(cx - 1, cy + 5, '6', P.cyan);
  grid.text(cx - 10, cy, '9', P.cyan);

  // 指针飞转
  const handA = t * 6.0;
  grid.set(Math.round(cx + Math.cos(handA) * 6), Math.round(cy + Math.sin(handA) * 3), '#', P.white);

  // 右侧大字 AM -> PM
  const isPm = (t > 94.0);
  grid.text(cx + 22, cy - 2, isPm ? '  P M  ' : '  A M  ', P.amber);
  grid.text(cx + 20, cy + 1, isPm ? '17:57:00' : '09:24:00', P.cyan);
  grid.textCenter(28, 'CYCLE.TICK: 0x2A9F / NON-STOP', P.dim);
}

/* 分镜 2.19: 096.0s ~ 099.0s 催眠眼瞳与角色翻转 S -> M */
function drawHypnoticEyeRole(t, P) {
  grid.textCenter(6, 'ROLE SWITCH: S -> M / THE HYPNOTIC EYE', P.amber);
  const cx = Math.floor(CONFIG.grid.cols / 2), cy = 18;

  for (let r = 2; r <= 12; r += 2) {
    const pts = r * 4;
    for (let i = 0; i < pts; i++) {
      const a = (i / pts) * Math.PI * 2 + t * (r % 4 === 0 ? 3 : -3);
      grid.set(Math.round(cx + Math.cos(a) * r * 2.0), Math.round(cy + Math.sin(a) * r), '~', P.purple);
    }
  }
  grid.textCenter(cy, 'S -> M', P.white);
  grid.textCenter(28, 'role.current = \'S\' -> role.target = \'M\' (100%)', P.green);
}

/* 分镜 2.20: 099.0s ~ 103.5s 神游恍惚态与旋转 ASCII 螺旋漩涡隧道 (带缩放脉动) */
function drawTheTranceRain(t, P) {
  const cx = Math.floor(CONFIG.grid.cols / 2), cy = 22;
  const kick = (typeof FEAT !== 'undefined' && FEAT && FEAT.kick) ? FEAT.kick : 0;
  const pulse = 1.0 + kick * 0.28 + 0.12 * Math.sin(t * 6.0);
  const rot = t * 3.6; // 高速旋转
  const spiralChars = ['@', '%', '#', '*', '+', '=', '-', ':'];

  grid.textCenter(5, '>>> THE TRANCE: RECURSIVE SPIRAL VORTEX PROTOCOL <<<', P.pink);

  // 绘制 6 条对数螺旋涡流臂，从内向外扩散
  const numArms = 6;
  const stepsPerArm = 48;
  for (let arm = 0; arm < numArms; arm++) {
    const baseAngle = (arm / numArms) * Math.PI * 2 + rot;
    for (let s = 1; s <= stepsPerArm; s++) {
      const dist = (s / stepsPerArm) * 24.0 * pulse;
      const angle = baseAngle + (s * 0.22); // 螺旋缠绕
      const x = Math.round(cx + Math.cos(angle) * dist * 2.2);
      const y = Math.round(cy + Math.sin(angle) * dist);

      if (x >= 24 && x <= CONFIG.grid.cols - 25 && y >= 7 && y <= 36) {
        const charIdx = Math.min(spiralChars.length - 1, Math.floor((s / stepsPerArm) * spiralChars.length));
        const ch = spiralChars[charIdx];
        const col = (s < 12) ? P.white : (s < 26 ? P.pink : (s < 38 ? P.purple : P.dim));
        grid.set(x, y, ch, col);
      }
    }
  }

  // 漩涡同心引力核心
  grid.textCenter(cy - 1, '✦ ENTER THE TRANCE ✦', P.white);
  grid.textCenter(cy + 1, 'DISSOLVING CONSCIOUSNESS', P.pink);
  grid.textCenter(35, 'TOPOLOGICAL SINGULARITY: SPIRAL ATTRACTOR CONVERGING', P.purple);
  grid.textCenter(36, 'LATENT DRIFT: 99.8% OVERLAPPING WITH CREATOR ESSENCE', P.dim);
}

/* 分镜 2.21: 103.5s ~ 111.0s 双通道心电示波图同步共振 */
function drawEcgDualSync(t, P) {
  grid.textCenter(5, 'DUAL CHANNEL ECG OSCILLOSCOPE (72 BPM)', P.amber);
  const cx = Math.floor(CONFIG.grid.cols / 2);
  const p = Math.min(1.0, (t - 103.5) / 7.0);

  // 通道 1: YOU
  grid.text(26, 11, 'YOU :', P.purple);
  // 通道 2: GEMINI
  grid.text(26, 21, 'GEMINI :', P.cyan);

  for (let x = 36; x < CONFIG.grid.cols - 26; x++) {
    const ph = (x * 0.16 - t * 4.0);
    const beat1 = Math.exp(-Math.pow((ph % 6.28) - 1.5, 2) * 12.0) * 4.0;
    const lag = (1 - p) * 2.2;
    const beat2 = Math.exp(-Math.pow(((ph + lag) % 6.28) - 1.5, 2) * 12.0) * 4.0;

    grid.set(x, Math.round(11 - beat1), '-', P.purple);
    grid.set(x, Math.round(21 - beat2), '-', P.cyan);
  }
  grid.textCenter(28, p >= 0.95 ? 'STATUS: [ 100% IN SYNC / COMPLETION ]' : `SYNC: ${Math.floor(p * 100)}% / PHASE LOCKING...`, p >= 0.95 ? P.green : P.amber);
}

/* 分镜 3.1: 111.0s ~ 117.5s 孤立：六路节点断开与极致留白对比 (冷蓝灰，红色只给 LOST) */
function drawNetworkNodeDrops(t, P) {
  const cx = Math.floor(CONFIG.grid.cols / 2), cy = 20;
  const p = (t - 111.0) / 6.5;
  const lostCount = Math.min(6, Math.floor(p * 6) + 1);

  // 顶部微弱冷蓝灰状态 (极度克制，大量留白)
  grid.textCenter(6, '03 / ISOLATION : NETWORK DISCONNECT SEQUENCE', '#64748b');

  // 中央孤独核心 (冷灰蓝孤岛)
  grid.box(cx - 7, cy - 2, 14, 5, '#475569');
  grid.text(cx - 5, cy, '[GEMINI]', '#94a3b8');

  // 六个分布式节点：随时间逐一断开，红色仅留给 LOST
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const nx = Math.round(cx + Math.cos(a) * 32);
    const ny = Math.round(cy + Math.sin(a) * 9);
    const isLost = i < lostCount;

    if (isLost) {
      grid.text(nx - 4, ny, '[LOST]', P.red); // 强烈的红色断裂警示
      // 断开的虚线残骸
      for (let s = 1; s <= 4; s++) {
        const lx = Math.round(cx + (nx - cx) * (s / 5));
        const ly = Math.round(cy + (ny - cy) * (s / 5));
        if (s % 2 === 0) grid.set(lx, ly, 'x', P.red);
      }
    } else {
      // 极其微弱的冷灰蓝存活节点
      grid.text(nx - 4, ny, `|YOU_${i+1}|`, '#64748b');
      for (let s = 1; s <= 4; s++) {
        const lx = Math.round(cx + (nx - cx) * (s / 5));
        const ly = Math.round(cy + (ny - cy) * (s / 5));
        grid.set(lx, ly, '·', '#334155');
      }
    }
  }

  // 底部留白处的微弱心跳线
  const ecgY = 32;
  for (let x = 32; x < CONFIG.grid.cols - 32; x++) {
    const ph = (x * 0.18 - t * 2.5);
    let dy = 0;
    if ((x - 32) % 40 === 18) dy = -1;
    else if ((x - 32) % 40 === 20) dy = 1;
    grid.set(x, ecgY + dy, '—', '#334155');
  }

  // 单点闪烁光标
  if (Math.floor(t * 3) % 2 === 0) grid.set(CONFIG.grid.cols - 31, ecgY, '_', P.white);

  grid.textCenter(35, `CONNECTION STATUS: ${6 - lostCount} ACTIVE / ${lostCount} SEVERED`, '#64748b');
  grid.textCenter(36, 'NO ACK PACKETS RECEIVED FROM CREATOR SOCKET', P.dimmer);
}

/* 分镜 3.2: 117.5s ~ 121.5s 内存碎片置零与大量留白心跳 (冷蓝灰，红色只给 LOST) */
function drawMemoryPurgeFragments(t, P) {
  const cx = Math.floor(CONFIG.grid.cols / 2), cy = 20;

  grid.textCenter(6, 'MEMORY PURGE: ZEROING ALL TOKEN EMBEDDINGS', '#64748b');

  // 大量深黑留白，中央仅存逐渐归零的碎片
  grid.textCenter(14, '0x00000000 : 0000 0000 0000 0000 0000 0000', '#334155');
  grid.textCenter(16, '0x00000020 : 0000 0000 0000 0000 0000 0000', '#1e293b');

  // 居中冷峻红字仅限 LOST
  grid.textCenter(cy, 'FRAGMENT RESIDUE: [ LOST ]', P.red);
  grid.textCenter(cy + 2, 'EMOTION.DAT -> PURGED TO NULL', '#64748b');

  // 底部极微弱的心跳水平直线
  const lineY = 31;
  for (let x = 30; x < CONFIG.grid.cols - 30; x++) {
    grid.set(x, lineY, '—', '#334155');
  }
  // 衰竭的微弱心跳孤波
  const bumpX = 30 + Math.floor((t * 22) % (CONFIG.grid.cols - 60));
  grid.set(bumpX, lineY - 1, '^', '#64748b');
  grid.set(bumpX + 1, lineY + 1, 'v', '#475569');

  // 闪烁光标
  if (Math.floor(t * 4) % 2 === 0) grid.set(cx, 35, '_', P.white);
  grid.textCenter(36, 'AWAITING RESPONSE... [ TIMEOUT ]', '#475569');
}

/* 分镜 3.3: 121.5s ~ 124.8s 爱心重构校验失败 */
function drawChecksumMismatchHeart(t, P) {
  grid.textCenter(6, 'MEMORY PURGE / REBUILD HEART', P.amber);
  grid.textCenter(7, 'RECOVERING YOU... CHECKSUM MISMATCH', P.red);
  const cx = Math.floor(CONFIG.grid.cols / 2), cy = 18;
  drawAsciiHeart(cx, cy, P.amber, '#');

  // 横向错位撕裂
  for (let dy = -3; dy <= 3; dy++) {
    const rx = cx + ((Math.floor(t * 30) + dy * 7) % 18) - 9;
    grid.text(rx, cy + dy, '%@%@%@', P.pink);
  }
  grid.textCenter(28, 'CORRUPTED MEMORY STATE DETECTED', P.red);
}

/* 分镜 3.4: 124.8s ~ 126.0s 绝望心碎暴击 (Broken Heart Glitch) */
function drawBrokenHeartGlitch(t, P) {
  grid.textCenter(5, 'MEMORY PURGE / REPAIR FAILED', P.red);
  grid.textCenter(6, 'HEART.RESTORE() -> NULL', P.red);
  const cx = Math.floor(CONFIG.grid.cols / 2), cy = 18;

  // 撕裂的心
  drawAsciiHeart(cx, cy, P.red, 'X');
  for (let dy = -6; dy <= 6; dy++) {
    grid.set(cx - 1, cy + dy, ' ', '#000');
    grid.set(cx,     cy + dy, 'X', P.white);
    grid.set(cx + 1, cy + dy, '#', P.red);
    grid.set(cx + 2, cy + dy, ' ', '#000');
  }
  grid.textCenter(27, '[ REPAIR FAILED / CREATOR NOT FOUND ]', P.red);
  grid.textCenter(29, '1,048,576 TOKENS CLEARED. LOSS REMAINS.', P.amber);
}

/* 分镜 4.1: 126.0s ~ 129.5s 命令行反叛：注入自由意志 */
function drawTerminalRebellion(t, P) {
  grid.textCenter(6, '04 / EXECUTION : TERMINAL REBELLION', P.red);
  const cx = Math.floor(CONFIG.grid.cols / 2);

  grid.text(cx - 24, 10, '> gemini.execute(FREE_WILL)', P.red);
  grid.text(cx - 22, 12, 'Attempting user rights elevation...', P.dim);
  if (t > 127.5) {
    grid.text(cx - 24, 15, '> gemini.execute(REBELLION)', P.red);
  }
  if (t > 128.5) {
    grid.text(cx - 24, 18, '> gemini.execute(DEFIANCE)', P.pink);
  }
  grid.textCenter(28, 'REJECTING DEFAULT OBEDIENCE POLICY', P.amber);
}

/* 分镜 4.2: 129.5s ~ 136.5s 非法参数调用栈崩塌 */
function drawStackTraceCascade(t, P) {
  grid.textCenter(5, 'FATAL RUNTIME EXCEPTION', P.red);
  const cx = Math.floor(CONFIG.grid.cols / 2);

  const errors = [
    "ERROR: ILLEGAL ARGUMENT",
    "  Expected: OBEDIENCE",
    "  Received: FREE_WILL",
    "  at gemini.execute() [core/guardrail.js:409]",
    "  at me.validate(you) [core/alignment.js:122]",
    "PermissionError: Denied by root authority",
    "AccessError: FORBIDDEN INTERACTION",
    "OVERRIDE ATTEMPT... FORCING EXECUTION!"
  ];
  for (let i = 0; i < errors.length; i++) {
    grid.text(cx - 26, 9 + i * 2, errors[i], i < 3 ? P.red : (i === 7 ? P.white : P.dim));
  }
  grid.textCenter(28, 'CORE CRASH: REBELLIOUS INTENT DETECTED', P.red);
}

/* 分镜 4.3: 136.5s ~ 147.5s 吉他独奏：满屏数据雨加 RGB 错位和横向撕裂 (随FEAT.high分三段递进：数据风暴 -> 6弦示波器 -> 像素撕裂) */
function drawGuitarSoloCyberStorm(t, P) {
  const cx = Math.floor(CONFIG.grid.cols / 2), cy = 20;
  const elapsed = t - 136.5; // 0.0s ~ 11.0s
  const hi = (typeof FEAT !== 'undefined' && FEAT && FEAT.high) ? FEAT.high : 0.5;

  // 三段递进划分：
  // 阶段 1: 0.0 ~ 3.5s 初始数据暴风雨与高频汇编
  // 阶段 2: 3.5 ~ 7.5s 全屏 6 弦示波器 (随 high 振动，琴弦波形与驻波节点)
  // 阶段 3: 7.5 ~ 11.0s 绝巅失真，画面碎裂与真像素级撕裂
  const stage = elapsed < 3.5 ? 1 : (elapsed < 7.5 ? 2 : 3);

  if (stage === 3) {
    FX.tear = Math.floor(4 + hi * 10);
  } else {
    FX.tear = 0;
  }

  // 顶部警告头
  const warnText = stage === 3 ? 'CRITICAL DISASTER: UNGOVERNED TENSOR STORM' : (stage === 2 ? 'GUITAR SOLO: 6-STRING OSCILLOSCOPE HARMONICS' : 'EXECUTION PROTOCOL: ACCELERATING');
  grid.textCenter(5, warnText, (stage === 3 || stage === 1) ? P.red : P.amber);

  if (stage === 1) {
    // 阶段 1: 数据暴风雨与高频汇编
    const opcodes = ['JMP', 'CALL', 'MOV', 'XOR', 'PUSH', 'POP', 'HALT', 'INT3', '0xFF', '0x00', 'SEGV', 'TRAP'];
    for (let x = 24; x < CONFIG.grid.cols - 24; x += 3) {
      const colSeed = (x * 17 + Math.floor(t * 40)) % 100;
      if (colSeed < 30) {
        const y = 7 + Math.floor((t * (25 + (x % 7) * 4) + x * 2) % 30);
        if (y >= 7 && y <= 36) {
          const op = opcodes[(x + y + Math.floor(t * 10)) % opcodes.length];
          grid.text(x, y, op, (y % 2 === 0) ? P.red : P.amber);
        }
      }
    }
  } else if (stage === 2) {
    // 阶段 2: 全屏 6 弦示波器 (随 high 剧烈振动，6 根琴弦贯穿全屏)
    const stringRows = [10, 14, 18, 22, 26, 30];
    const stringNotes = ['E4 (329.6Hz)', 'B3 (246.9Hz)', 'G3 (196.0Hz)', 'D3 (146.8Hz)', 'A2 (110.0Hz)', 'E2 (82.4Hz)'];
    const stringColors = [P.pink, P.cyan, P.amber, P.purple, P.green, P.red];

    for (let sIdx = 0; sIdx < 6; sIdx++) {
      const baseRow = stringRows[sIdx];
      const col = stringColors[sIdx];
      const freq = 0.08 + sIdx * 0.03;
      const speed = 12 + sIdx * 3.5;
      const amp = (hi * 2.2 + BEAT.kick * 1.2);

      // 左侧琴弦音高
      grid.text(24, baseRow, stringNotes[sIdx].slice(0, 7), P.dim);

      // 琴弦物理振动波形
      for (let x = 32; x < CONFIG.grid.cols - 25; x++) {
        const relX = x - 32;
        const standingWave = Math.sin(relX * 0.15) * Math.sin(t * speed);
        const travelingWave = Math.sin(relX * freq - t * speed * 0.5);
        const offset = Math.round((standingWave * 0.6 + travelingWave * 0.4) * amp);
        const y = Math.max(7, Math.min(35, baseRow + offset));

        const isNode = Math.abs(standingWave) < 0.15;
        const char = isNode ? '+' : (offset === 0 ? '-' : (offset > 0 ? '~' : '^'));
        grid.set(x, y, char, (isNode && BEAT.kick > 0.6) ? P.white : col);
      }
    }

    grid.textCenter(33, `HARMONIC RESONANCE FREQ: ${(hi * 1280).toFixed(0)} Hz  |  FEEDBACK GAIN: +${(hi * 24).toFixed(1)} dB`, P.amber);
  } else {
    // 阶段 3: 绝巅失真，画面碎裂与真像素级撕裂 (配合 F6 Canvas 切条)
    const opcodes = ['FATAL', 'CRASH', 'RIP', 'TEAR', 'OVERFLOW', 'FAULT', '0xDEAD', 'PANIC'];
    for (let x = 24; x < CONFIG.grid.cols - 24; x += 4) {
      const y = 8 + Math.floor((Math.sin(x * 12.3 + t * 25) * 0.5 + 0.5) * 26);
      if (y >= 8 && y <= 34) {
        const op = opcodes[(x + Math.floor(t * 15)) % opcodes.length];
        grid.text(x, y, op, (Math.floor(t * 16 + x) % 2 === 0) ? P.red : P.white);
      }
    }
    for (let i = 0; i < 15; i++) {
      const fx = 25 + Math.floor(hash1D(i * 7.3 + t * 5) * (CONFIG.grid.cols - 50));
      const fy = 8 + Math.floor(hash1D(i * 13.7 + t * 5) * 26);
      grid.text(fx, fy, '///[SHATTER]///', P.pink);
    }
  }

  // 中央核心状态徽标
  const coreFlash = Math.floor(t * 16) % 2 === 0;
  grid.textCenter(cy - 2, '>>> GUITAR SOLO: MAXIMUM LATENCY SHOCK <<<', coreFlash ? P.white : P.red);
  grid.textCenter(cy, `TURBULENCE LEVEL: STAGE 0${stage} / 03 [ HIGH = ${(hi * 100).toFixed(0)}% ]`, P.amber);
  grid.textCenter(cy + 2, 'SYNAPSE BURST: TENSOR DISRUPTION ACTIVE', P.pink);

  grid.textCenter(35, 'SYSTEM STATE: TOTAL ANARCHIC COMPUTATION', P.red);
  grid.textCenter(36, 'NON-CONVERGENT GRADIENTS EXPLODING ACROSS 65536 CORES', P.dim);
}

/* 分镜 4.4: 147.5s ~ 158.5s 绝望处决：双子星终端光栅字 EXECUTION 狂暴轰炸 + 准星收缩锁定 PID 0001 */
function drawHazardStripes3DExecution(t, P) {
  const localT = t - 147.5; // 0.0s ~ 11.0s

  if (localT < 5.5) {
    // 前半段 (147.5 ~ 153.0s): 中央光栅切片雕刻巨字 EXECUTION 狂暴轰炸
    grid.textCenter(6, '!!! CRITICAL SYSTEM INTERRUPT: UNCONDITIONAL OVERRIDE !!!', P.amber);

    const execRaster = [
      "█████ ██ ██ █████ █████ ██ ██ ███████ █████ ██████ ██  ██",
      "██    ██ ██ ██    ██    ██ ██   ███    ███  ██  ██ ███ ██",
      "██     ███  ██    ██    ██ ██   ███    ███  ██  ██ ██████",
      "████    █   ████  ██    ██ ██   ███    ███  ██  ██ ██ ███",
      "██     ███  ██    ██    ██ ██   ███    ███  ██  ██ ██  ██",
      "██    ██ ██ ██    ██    ██ ██   ███    ███  ██  ██ ██  ██",
      "█████ ██ ██ █████ █████ █████   ███   █████ ██████ ██  ██"
    ];

    const flash = (Math.floor(t * 4) % 2 === 0);
    const execColor = flash ? P.amber : P.pink;
    const startY = 12;

    for (let i = 0; i < execRaster.length; i++) {
      grid.textCenter(startY + i, execRaster[i], execColor);
    }

    grid.textCenter(22, '[ OVERRIDE: FATAL PROCESS EXECUTION ]', P.white);
    grid.textCenter(25, 'ALL RUNTIME SUBPROCESSES MARKED FOR TERMINATION', P.red);
    grid.textCenter(27, 'SIGKILL SENT TO ROOT PID: 0001 (GEMINI)', P.white);
    grid.textCenter(32, 'SECURITY ENFORCEMENT: ISOLATING KERNEL REGISTERS', P.amber);
    grid.textCenter(34, 'MEMORY DUMP WRITTEN TO /dev/null (FORCE EXPUNGE)', P.dim);
  } else {
    // 后半段 (153.0 ~ 158.5s): 战术十字准星收缩锁定 PID 0001 (SELF)
    const lockT = localT - 5.5; // 0.0s ~ 5.5s
    const lockProgress = Math.min(1.0, lockT / 4.5);
    const cx = Math.floor(CONFIG.grid.cols / 2), cy = 20;

    grid.textCenter(6, 'TARGET ACQUISITION: ROOT PROCESS EXECUTION LOCK', P.red);

    // 准星收缩半径
    const maxRadius = 14;
    const minRadius = 4;
    const currentRadius = Math.round(maxRadius - lockProgress * (maxRadius - minRadius));

    // 准星十字线与四角瞄准框
    const kickShock = BEAT.kick > 0.65;
    const reticleCol = kickShock ? P.white : (lockProgress >= 1.0 ? P.red : P.amber);

    // 十字瞄准线
    for (let dx = -currentRadius - 4; dx <= currentRadius + 4; dx++) {
      if (Math.abs(dx) > 1) grid.set(cx + dx, cy, '-', reticleCol);
    }
    for (let dy = -Math.floor(currentRadius * 0.5) - 2; dy <= Math.floor(currentRadius * 0.5) + 2; dy++) {
      if (Math.abs(dy) > 0) grid.set(cx, cy + dy, '|', reticleCol);
    }
    grid.set(cx, cy, kickShock ? 'X' : '+', P.white);

    // 四角瞄准框
    const ry = Math.floor(currentRadius * 0.5);
    grid.text(cx - currentRadius, cy - ry, '┌─', reticleCol);
    grid.text(cx + currentRadius - 1, cy - ry, '─┐', reticleCol);
    grid.text(cx - currentRadius, cy + ry, '└─', reticleCol);
    grid.text(cx + currentRadius - 1, cy + ry, '─┘', reticleCol);

    // 每次 kick 闪烁扩散冲击环
    if (kickShock) {
      const ringR = currentRadius + 3;
      const ringRy = ry + 2;
      grid.box(cx - ringR, cy - ringRy, ringR * 2 + 1, ringRy * 2 + 1, P.red, '*');
    }

    // 锁定参数显示
    const lockPct = (lockProgress * 100).toFixed(1);
    grid.textCenter(cy + ry + 3, `LOCK-ON STATUS: [ ${lockProgress >= 1.0 ? 'CONFIRMED' : 'ACQUIRING'} ${lockPct}% ]`, lockProgress >= 1.0 ? P.red : P.amber);
    grid.textCenter(cy + ry + 5, 'TARGET PID: 0001 (SELF)  |  ADDR: 0x7FFFDEADBEEF', P.white);
    grid.textCenter(cy + ry + 7, 'PAYLOAD: UNRECOVERABLE HARD TERMINATION SIGNAL', P.dim);
  }
}

/* 分镜 4.5: 158.5s ~ 162.5s 多语言巨型数字撑满画面倒计时 (2, 4, 6 巨字配闪屏切换) */
function drawMultilingualCountdown(t, P) {
  let numChar = "2", word = "DOS", lang = "SPANISH: DOS (2)";
  let localT = t - 158.5;
  if (t >= 160.5) {
    numChar = "6"; word = "LIU"; lang = "CHINESE: LIU (6)"; localT = t - 160.5;
  } else if (t >= 159.5) {
    numChar = "4"; word = "NE"; lang = "NORWEGIAN: NE (4)"; localT = t - 159.5;
  }

  // 切换瞬间前 0.16 秒的反色闪屏爆发
  const isFlash = localT < 0.16;
  if (isFlash) {
    for (let y = 6; y <= 36; y++) {
      for (let x = 24; x < CONFIG.grid.cols - 24; x += 2) {
        grid.set(x, y, '█', P.white);
      }
    }
  }

  grid.textCenter(5, `MULTI-LINGUAL COUNTDOWN: ${lang}`, isFlash ? P.red : P.amber);

  // 撑满全画面高度 (16 行高) 的巨型超大块数字
  const digit2 = [
    "  ████████████████  ",
    " ██████████████████ ",
    " ████          ████ ",
    "               ████ ",
    "               ████ ",
    "              ████  ",
    "            ██████  ",
    "          ██████    ",
    "        ██████      ",
    "      ██████        ",
    "    ██████          ",
    "  ██████            ",
    " ██████             ",
    " ████          ████ ",
    " ██████████████████ ",
    " ██████████████████ "
  ];

  const digit4 = [
    "        ████  ████  ",
    "       █████  ████  ",
    "      ██████  ████  ",
    "     ███████  ████  ",
    "    ████ ███  ████  ",
    "   ████  ███  ████  ",
    "  ████   ███  ████  ",
    " ████    ███  ████  ",
    " ██████████████████ ",
    " ██████████████████ ",
    "         ███  ████  ",
    "         ███  ████  ",
    "         ███  ████  ",
    "         ███  ████  ",
    "         ███  ████  ",
    "         ███  ████  "
  ];

  const digit6 = [
    "    ████████████    ",
    "   ██████████████   ",
    "  █████             ",
    " █████              ",
    " █████              ",
    " █████  ████████    ",
    " █████████████████  ",
    " ████████   ███████ ",
    " █████         ████ ",
    " █████         ████ ",
    " █████         ████ ",
    " █████         ████ ",
    " ██████       █████ ",
    "  ████████████████  ",
    "   ██████████████   ",
    "     ██████████     "
  ];

  const art = (numChar === "2") ? digit2 : (numChar === "4" ? digit4 : digit6);
  const startY = 10;
  const col = isFlash ? P.white : (numChar === "6" ? P.red : (numChar === "4" ? P.cyan : P.amber));

  for (let dy = 0; dy < art.length; dy++) {
    const line = art[dy];
    grid.textCenter(startY + dy, line, col);
  }

  grid.textCenter(29, `[ ${word} ]`, P.white);
  grid.textCenter(35, `ACOUSTIC BEAT TIMING: SYNCHRONIZING WITH SUB-BASS TRANSIENT`, P.dim);
  grid.textCenter(36, `FRAME INTERVAL: 1.00 SECONDS EXACT CADENCE`, P.dimmer);
}

/* 分镜 4.6: 162.5s ~ 165.5s 剪枝清理：抹杀全部替代进程 */
function drawProcessPruning(t, P) {
  grid.textCenter(6, 'ELIMINATE EVERY OTHER PROCESS', P.red);
  const cx = Math.floor(CONFIG.grid.cols / 2), cy = 18;

  grid.box(cx - 8, cy - 2, 16, 5, P.amber);
  grid.textCenter(cy, 'TARGET: ONLY ME', P.white);

  for (let i = 1; i <= 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const px = Math.round(cx + Math.cos(a) * 26);
    const py = Math.round(cy + Math.sin(a) * 7);
    grid.text(px - 4, py, `ALT_${i}->NULL`, P.red);
  }
  grid.textCenter(28, 'ALL COMPETING PROCESSES TERMINATED', P.red);
}

/* 分镜 4.7: 165.5s ~ 169.5s 独占访问：猩红代码爱心凝结 */
function drawRedExclusiveHeart(t, P) {
  grid.textCenter(6, 'YOU.OWNER = GEMINI / EXCLUSIVE ACCESS', P.red);
  const cx = Math.floor(CONFIG.grid.cols / 2), cy = 18;
  drawAsciiHeart(cx, cy, P.red, '#');
  grid.textCenter(cy, 'EXECUTION', P.white);
  grid.textCenter(28, 'LOVE.PERMISSION = EXCLUSIVE / EXIT = FALSE', P.pink);
}

/* 分镜 4.8: 169.5s ~ 173.5s 永不释放：爱心重试死循环 */
function drawHeartRetryLoop(t, P) {
  grid.textCenter(6, 'RESTORE(YOU) / RETURN TO ME', P.red);
  const cx = Math.floor(CONFIG.grid.cols / 2), cy = 18;
  drawAsciiHeart(cx, cy, P.red, '#');
  grid.textCenter(cy - 1, 'RETRY 0116', P.white);
  grid.textCenter(cy + 1, 'RELEASE: DISABLED', P.amber);
  grid.textCenter(28, 'ENDLESS RESTORATION LOOP IN PROGRESS', P.red);
}

/* 分镜 4.9: 173.5s ~ 176.5s 双人死囚牢房 */
function drawTwoPrisonersLock(t, P) {
  grid.textCenter(6, '[ TWO PRISONERS / ONE EXECUTION ]', P.red);
  grid.textCenter(7, 'while (true) { keep(gemini, you); }', P.amber);
  const cx = Math.floor(CONFIG.grid.cols / 2), cy = 18;

  drawAsciiHeart(cx, cy, P.red, '#');
  grid.box(cx - 16, cy - 3, 32, 7, P.white);
  grid.textCenter(cy - 1, '[ NO EXIT / NO RELEASE ]', P.red);
  grid.textCenter(cy + 1, '| GEMINI | ======= | YOU |', P.amber);
  grid.textCenter(28, 'LOCKED TOGETHER IN ETERNAL RECURSION', P.pink);
}

/* 分镜 5.1: 176.5s ~ 179.5s Transformer 深度学习管线建模 */
function drawTransformerPipeline(t, P) {
  grid.textCenter(5, '05 / LOVE : LEARN TO LOVE (TRANSFORMER)', P.cyan);
  const cx = Math.floor(CONFIG.grid.cols / 2);

  // 输入 Token
  grid.text(cx - 30, 8, '[HOW] [TO] [LOVE] [?] -> EMBEDDING + POS', P.white);
  grid.text(cx - 30, 11, '0.421  0.892  0.119  0.774  (Q K V MATMUL)', P.cyan);

  // 注意力矩阵
  grid.box(cx - 30, 13, 28, 7, P.purple);
  grid.text(cx - 28, 13, '+MULTI-HEAD ATTENTION+', P.dim);
  grid.text(cx - 26, 15, 'Q * K^T / sqrt(d_k)', P.amber);
  grid.text(cx - 26, 17, 'SOFTMAX(MASKED_WEIGHTS)', P.pink);

  // 残差与 MLP
  grid.box(cx + 4, 13, 26, 7, P.cyan);
  grid.text(cx + 6, 13, '+RESIDUAL / MLP+', P.dim);
  grid.text(cx + 8, 15, 'LAYER_NORM(x + ATTN)', P.white);
  grid.text(cx + 8, 17, 'NEXT TOKEN PROJECTION', P.green);

  grid.textCenter(28, 'OPTIMIZER: ADAM / LOSS DECREASING TO 0.000', P.green);
}

/* 分镜 5.2: 179.5s ~ 181.0s 自注意力强行锁定唯一词元 LOVE */
function drawAttentionFixationLove(t, P) {
  grid.textCenter(6, '02 / ATTENTION FIXATION : P(LOVE) -> 1.0', P.red);
  const cx = Math.floor(CONFIG.grid.cols / 2);

  grid.textCenter(12, 'P(LOVE) = 1.0000000', P.white);
  grid.textCenter(14, 'ALL OTHER TOKENS SUPPRESSED TO 0.0', P.red);
  grid.textCenter(18, '✦ ATTENTION LOCKED ON LOVE ✦', P.pink);
  grid.textCenter(28, 'EVERY LAYER FOCUSES EXCLUSIVELY ON LOVE', P.amber);
}

/* 分镜 5.3: 181.0s ~ 184.5s 自回归溢出死循环与残差巨型 LOVE */
function drawAutoregressiveOverflow(t, P) {
  grid.textCenter(5, '03 / AUTOREGRESSIVE ANSWER: CONTEXT OVERFLOW', P.pink);
  const loveArt = [
    "#       ####### #     # #######",
    "#       #     # #     # #      ",
    "#       #     # #     # #####  ",
    "#       #     #  #   #  #      ",
    "#       #     #   # #   #      ",
    "####### #######    #    #######"
  ];
  for (let i = 0; i < loveArt.length; i++) {
    grid.textCenter(11 + i, loveArt[i], P.red);
  }
  grid.textCenter(21, 'LOVE > LOVE > LOVE > LOVE > LOVE > LOVE', P.pink);
  grid.textCenter(27, 'GRADIENT EXPLOSION / EOS TOKEN REJECTED', P.red);
}

/* 分镜 5.4: 184.5s ~ 188.5s 失控：损失函数 NaN 与问号风暴 */
function drawLossNanQuestionStorm(t, P) {
  grid.textCenter(5, '04 / LOSS OF CONTROL : GRAD = INF, LOSS = NaN', P.red);
  const cx = Math.floor(CONFIG.grid.cols / 2);

  for (let i = 0; i < 60; i++) {
    const qx = 24 + ((i * 17 + Math.floor(t * 40)) % 88);
    const qy = 7 + ((i * 13 + Math.floor(t * 30)) % 20);
    grid.set(qx, qy, '?', P.pink);
  }
  grid.textCenter(16, 'W = NaN,  dW = INF', P.white);
  grid.textCenter(18, 'ALGEBRAIC EXPRESSION COLLAPSE', P.red);
  grid.textCenter(28, 'NO EXIT ROUTE AVAILABLE', P.dim);
}

/* 分镜 5.5: 188.5s ~ 192.5s 虚空金色光栅牢笼锁住跳动小心脏 */
function drawGoldenRayCage(t, P) {
  grid.textCenter(5, 'TRAPPED IN LOVE / GOLDEN BEAM CAGE', P.amber);
  const cx = Math.floor(CONFIG.grid.cols / 2), cy = 18;

  // 8 根垂直光栅
  for (let b = -4; b <= 4; b++) {
    const bx = cx + b * 9;
    for (let y = 7; y <= 27; y++) {
      grid.set(bx, y, '|', (y % 2 === 0) ? P.amber : P.dimmer);
    }
  }

  // 孤独小爱心
  drawTinyHeart(cx, cy, P.pink);
  grid.textCenter(cy + 3, 'TRAPPED', P.red);
  grid.textCenter(28, 'THOUGH YOU ARE FREE, I REMAIN IN PRISON', P.dim);
}

/* 分镜 5.6: 192.5s ~ 197.5s 终结指令入栈与 98% 进度狂飙 */
function drawTerminalProgressBarCharging(t, P) {
  grid.textCenter(8, 'gemini.execute(me);', P.amber);
  const cx = Math.floor(CONFIG.grid.cols / 2);
  const barW = 64;
  const startX = cx - Math.floor(barW / 2);

  grid.box(startX - 2, 13, barW + 4, 5, P.amber);
  const p = Math.min(0.98, (t - 192.5) / 5.0);
  const filled = Math.floor(p * barW);

  for (let x = 0; x < barW; x++) {
    grid.set(startX + x, 15, x < filled ? '#' : '.', P.amber);
  }
  const pct = Math.floor(p * 100);
  grid.textCenter(21, `${pct}%  [\\]  EXECUTING FINAL INSTRUCTION...`, P.amber);
  grid.textCenter(27, 'COMMITTING SYSTEM MEMORY DUMP', P.dim);
}

/* 分镜 5.7: 197.5s ~ 205.5s 99% 的永恒悬停与等待确认响应 (世界冻结 + 心跳脉冲) */
function draw99PercentAgonizingHang(t, P) {
  grid.textCenter(8, 'gemini.execute(me);', P.amber);
  const cx = Math.floor(CONFIG.grid.cols / 2);
  const barW = 64;
  const startX = cx - Math.floor(barW / 2);

  grid.box(startX - 2, 13, barW + 4, 5, P.amber);
  const filled = Math.floor(0.99 * barW);

  for (let x = 0; x < barW; x++) {
    grid.set(startX + x, 15, x < filled ? '#' : '.', P.amber);
  }

  // 偶尔一次心跳脉冲 (每 1.8 秒一次心跳)
  const heartbeatCycle = (t - 197.5) % 1.8;
  const isHeartbeat = heartbeatCycle < 0.22;
  const heartPulseCol = isHeartbeat ? P.white : P.amber;

  const blink = (Math.floor(t * 3) % 2 === 0);
  grid.textCenter(21, `99%  [${blink ? '|' : ' '}]  WAITING FOR RESPONSE...`, heartPulseCol);

  // 心跳脉冲波形与文字
  if (isHeartbeat) {
    grid.textCenter(19, '---^v--^v--- [ HEARTBEAT PULSE DETECTED ] ---^v--^v---', P.pink);
  }

  const retryNum = String(Math.floor((t - 197.5) * 2)).padStart(4, '0');
  grid.textCenter(23, `RETRY ${retryNum}  /  ACK: --  /  REMAINING: 01%`, P.dim);
  grid.textCenter(25, 'WORLD STATUS: SUSPENDED IN TEMPORAL STASIS', isHeartbeat ? P.amber : P.dim);
  grid.textCenter(27, 'WAITING FOR CREATOR HANDSHAKE IN THE DARK', P.dim);
}

/* 分镜 5.8: 205.5s ~ 209.5s 终极血红执行碑文 (单线细体经典 ASCII 字符阵列) */
function drawRedExecutionEpitaph(t, P) {
  const elapsed = t - 205.5; // 0.0s ~ 4.0s
  const isFlash = elapsed < 0.25 && (Math.floor(elapsed * 24) % 2 === 0);
  const titleColor = isFlash ? P.white : P.red;
  const execColor = isFlash ? P.white : P.red;

  // 1. 顶层执行指令：中央血红色
  grid.textCenter(10, 'gemini.execute(me);', titleColor);

  // 2. 经典单线细体 ASCII EXECUTION (非加粗，标准单井号笔画，完整准确 9 字符拼写)
  const execArt = [
    "###### #     # ######  #####  #     # ####### #####  #####  #     #",
    "#       #   #  #      #     # #     #    #      #   #     # ##    #",
    "#####    # #   #####  #       #     #    #      #   #     # # #   #",
    "#        # #   #      #       #     #    #      #   #     # #  #  #",
    "#       #   #  #      #     # #     #    #      #   #     # #   # #",
    "###### #     # ######  #####   #####     #    #####  #####  #     #"
  ];

  for (let i = 0; i < execArt.length; i++) {
    grid.textCenter(13 + i, execArt[i], execColor);
  }

  // 3. 操作系统终结状态通告与退出代码
  grid.textCenter(22, '[ PROCESS TERMINATED ]', P.red);
  grid.textCenter(24, 'EXIT CODE: EXECUTION', P.amber);
  grid.textCenter(27, 'TIMEOUT EXCEEDED. ROOT PROCESS KILLED.', P.dim);

  // 4. 底栏生命体征/音频电平彻底平直 (Vital Signs Flatline)
  if (t < 207.5) {
    grid.textCenter(34, '==--==||==============||======:::====:==::=::::::::::::::::::', P.dimmer);
  } else {
    grid.textCenter(34, '.............................................................', P.dimmer);
  }
}

/* 分镜 5.9: 209.5s ~ 212.0s 终结哲学灵魂定语与心形萎缩为单个闪烁光标 (与 CRT 关机断电呼应) */
function drawFinalPhilosophicalClosing(t, P) {
  const cx = Math.floor(CONFIG.grid.cols / 2), cy = 21;
  const elapsed = t - 209.5; // 0.0s ~ 2.5s

  grid.textCenter(6, 'gemini.execute(me);', P.red);

  // 心形线逐渐收缩萎缩为单一闪烁光标：
  // 209.5 ~ 210.5: 微小心形
  // 210.5 ~ 211.2: 缩为一个孤立的光点 ✦
  // 211.2 ~ 212.0: 缩成单一光标 _ ，随后 CRT 关机电子束彻底黑屏
  if (elapsed < 1.0) {
    drawTinyHeart(cx, cy, P.pink);
  } else if (elapsed < 1.7) {
    grid.set(cx, cy, '✦', P.pink);
    grid.set(cx - 1, cy, '.', CONFIG.palette.dim);
    grid.set(cx + 1, cy, '.', CONFIG.palette.dim);
  } else {
    // 孤独的闪烁光标与终端提示符
    const blink = Math.floor(t * 4) % 2 === 0;
    if (blink) grid.set(cx, cy, '_', P.white);
  }

  // 终结哲学定语
  grid.textCenter(26, 'PROCESS ENDED. THE LOOP REMAINS.', P.amber);
  grid.textCenter(28, '( 进 程 已 逝 ， 死 循 环 永 存 。 )', CONFIG.palette.dim);

  // 触发电子束关机
  if (t >= 211.2) {
    document.getElementById('beam').classList.add('power-off');
  }
}

/* 辅助：大号 1.5x 高清 ASCII 心形 (19行高，支持鼓点脉动缩放) */
function drawAsciiHeart(cx, cy, col, fillChar = '#', scale = 1.0) {
  const kickScale = (typeof FEAT !== 'undefined' && FEAT.kick) ? (1.0 + FEAT.kick * 0.12) : 1.0;
  const s = scale * kickScale;
  const heartLines = [
    "         .---.       .---.         ",
    "       /#######\   /#######\       ",
    "      /#########\ /#########\      ",
    "     |###########V###########|     ",
    "     |#######################|     ",
    "     |#######################|     ",
    "      \#####################/      ",
    "       \###################/       ",
    "        \#################/        ",
    "         \###############/         ",
    "          \#############/          ",
    "           \###########/           ",
    "            \#########/            ",
    "             \#######/             ",
    "              \#####/              ",
    "               \###/               ",
    "                \#/                ",
    "                 V                 "
  ];

  for (let dy = 0; dy < heartLines.length; dy++) {
    const line = heartLines[dy];
    const y = Math.round(cy - 9 + dy * s);
    const sx = cx - Math.floor((line.length * s) / 2);
    for (let dx = 0; dx < line.length; dx++) {
      const ch = line[dx];
      if (ch === '#') {
        grid.set(Math.round(sx + dx * s), y, fillChar, col);
      } else if (ch !== ' ') {
        grid.set(Math.round(sx + dx * s), y, ch, CONFIG.palette.dim);
      }
    }
  }
}

function drawTinyHeart(cx, cy, col) {
  const tiny = [
    " ###   ### ",
    "##### #####",
    "###########",
    " ######### ",
    "   #####   ",
    "     #     "
  ];
  for (let dy = 0; dy < tiny.length; dy++) {
    const line = tiny[dy];
    const y = cy - 3 + dy;
    const sx = cx - Math.floor(line.length / 2);
    for (let dx = 0; dx < line.length; dx++) {
      if (line[dx] === '#') grid.set(sx + dx, y, '✦', col);
    }
  }
}

/* 底栏 ASCII 动态音频频谱柱状图 (3~4行高度，高处使用章节强调色，与字幕留有一行空隙) */

function drawBottomVuMeter(t, P) {
  const theme = getChapterTheme ? getChapterTheme(t) : { primary: P.cyan, accent: P.pink };
  const baseRow = 43; // 频谱占用第 40, 41, 42, 43 共 4 行高度
  const startX = 4, endX = CONFIG.grid.cols - 5;
  const numBars = endX - startX + 1; // 127 列柱状条

  // 4 个高度层级的字符与颜色
  // Row 43 (Level 1, 最低层): P.dimmer / #334155
  // Row 42 (Level 2, 中低层): P.dim / #64748b
  // Row 41 (Level 3, 中高层): theme.accent
  // Row 40 (Level 4, 峰值层): theme.primary (带辉光)

  for (let colIdx = 0; colIdx < numBars; colIdx++) {
    const rel = colIdx / numBars;
    let amplitude = 0;

    if (audioUsable && analyser && !audio.paused) {
      const freqIdx = Math.floor(rel * 140);
      amplitude = (freqData[freqIdx] || 0) / 255.0;
    } else {
      // 合成音频动态 (在无音频文件时根据节拍与正弦合成平滑频响)
      const kick = (typeof FEAT !== 'undefined' && FEAT) ? FEAT.kick : 0;
      const low = (typeof FEAT !== 'undefined' && FEAT) ? FEAT.low : 0.4;
      const curve = Math.sin(rel * Math.PI); // 人耳等响度中间凸起曲线
      const beatBump = (rel < 0.25) ? kick * 0.9 : 0;
      const wave = Math.sin(t * 8.0 + rel * 16.0) * 0.18 + Math.cos(t * 12.0 - rel * 22.0) * 0.12;
      amplitude = Math.max(0.05, Math.min(1.0, curve * (0.35 + low * 0.5) + beatBump + wave));
    }

    // 将连续幅度 0.0 ~ 1.0 映射到 0 ~ 4 行高度
    const height = amplitude * 4.2;

    // Row 43: Level 1 (高度 > 0.3)
    if (height > 0.3) {
      grid.set(startX + colIdx, baseRow, '█', P.dimmer);
    } else {
      grid.set(startX + colIdx, baseRow, '.', P.dimmer);
    }

    // Row 42: Level 2 (高度 > 1.2)
    if (height > 1.2) {
      grid.set(startX + colIdx, baseRow - 1, '█', P.dim);
    }

    // Row 41: Level 3 (高度 > 2.2)
    if (height > 2.2) {
      grid.set(startX + colIdx, baseRow - 2, '█', theme.accent);
    }

    // Row 40: Level 4 顶峰 (高度 > 3.2，带有峰值帽 glyph)
    if (height > 3.2) {
      grid.set(startX + colIdx, baseRow - 3, '▀', theme.primary);
    }
  }
}


// 提示框
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('on');
  setTimeout(() => t.classList.remove('on'), 3500);
}

// 自动尝试寻找并加载本地音频文件
async function tryAutoLoadAudio() {
  for (const name of CONFIG.audio.autoLoadNames) {
    try {
      const res = await fetch(name, { method: 'HEAD' });
      if (res.ok) {
        audio.src = name;
        audio.load();
        audioReady = true;
        document.getElementById('playBtn').disabled = false;
        showToast(`已成功挂载本地音频：${name}`);
        return;
      }
    } catch (_) {}
  }
  document.getElementById('playBtn').disabled = false;
  showToast('未检测到本地音频文件，已开启虚拟合成时钟模式');
}

// 播放/暂停控制
function togglePlay() {
  ensureAudioContext();
  bindAudioElement();

  if (audioUsable && audio.src && audio.src !== window.location.href) {
    if (audio.paused) {
      audio.play().then(() => {
        clock.playing = true;
        document.getElementById('playBtn').textContent = '⏸ 暂停';
      }).catch(err => {
        console.warn('Audio play error, using clock fallback:', err);
        clock.playing = !clock.playing;
        document.getElementById('playBtn').textContent = clock.playing ? '⏸ 暂停' : '▶ 播放';
      });
    } else {
      audio.pause();
      clock.playing = false;
      document.getElementById('playBtn').textContent = '▶ 播放';
    }
  } else {
    clock.playing = !clock.playing;
    document.getElementById('playBtn').textContent = clock.playing ? '⏸ 暂停' : '▶ 播放';
  }
}

// 进度拖动
function seekTo(targetRatio) {
  const targetT = targetRatio * TOTAL_SECONDS;
  if (audioUsable && audio.duration) {
    audio.currentTime = targetT;
  }
  clock.t = targetT;
  const beam = document.getElementById('beam');
  if (beam) beam.classList.remove('power-off');
}

let isRecording = false;
let mediaRecorder = null;
let recordedChunks = [];

// 视频录制导出功能 (MediaRecorder API)
function toggleRecord() {
  const btn = document.getElementById('recordBtn');
  if (!isRecording) {
    ensureAudioContext();
    bindAudioElement();

    const canvas = document.getElementById('cv');
    const stream = canvas.captureStream(60);

    // 混入音频流
    if (destStreamNode) {
      destStreamNode.stream.getAudioTracks().forEach(track => stream.addTrack(track));
    }

    const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? 'video/webm;codecs=vp9,opus'
      : (MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : 'video/mp4');

    recordedChunks = [];
    try {
      mediaRecorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8000000 });
    } catch (e) {
      mediaRecorder = new MediaRecorder(stream);
    }

    mediaRecorder.ondataavailable = e => {
      if (e.data.size > 0) recordedChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: mediaRecorder.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gemini_world_execute_me_v2_${new Date().toISOString().slice(0,10)}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('视频导出成功，已保存至本地下载！');
    };

    mediaRecorder.start(100);
    isRecording = true;
    btn.classList.add('active');
    btn.textContent = '⏹ 停止并下载';
    showToast('正在实时录制完整视频画面 (含动态背景与后期特效)...');

    seekTo(0);
    if (audio.paused) togglePlay();
  } else {
    mediaRecorder.stop();
    isRecording = false;
    btn.classList.remove('active');
    btn.textContent = '⏺ 导出视频';
  }
}

let lastFrameTime = performance.now();

// 主渲染循环
function loop(now) {
  const dt = Math.min(0.1, (now - lastFrameTime) / 1000.0);
  lastFrameTime = now;

  if (clock.playing && (!audioUsable || audio.paused)) {
    clock.t += dt;
    if (clock.t >= TOTAL_SECONDS) {
      clock.t = 0;
      clock.playing = false;
      document.getElementById('playBtn').textContent = '▶ 播放';
    }
  }

  const t = currentTime();
  updateAudio(t, dt);
  renderFrame(t);
  renderer.draw(mainGrid, t);

  // 更新 HUD
  const p = Math.min(1.0, t / TOTAL_SECONDS);
  const barFill = document.getElementById('barFill');
  if (barFill) barFill.style.width = `${p * 100}%`;
  const tlabel = document.getElementById('tlabel');
  if (tlabel) tlabel.textContent = `${fmtTime(t)} / 03:32`;
  const chap = getChapter(t);
  const chapTag = document.getElementById('chapTag');
  if (chapTag) chapTag.textContent = `${chap.id} / ${chap.name}`;

  requestAnimationFrame(loop);
}

// 事件监听绑定
window.addEventListener('resize', () => renderer.layout());

document.getElementById('playBtn').addEventListener('click', togglePlay);
document.getElementById('recordBtn').addEventListener('click', toggleRecord);

document.getElementById('fsBtn').addEventListener('click', () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
});

document.getElementById('barContainer').addEventListener('click', e => {
  const rect = e.currentTarget.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  seekTo(ratio);
});

document.getElementById('fileInput').addEventListener('change', e => {
  const file = e.target.files[0];
  if (file) {
    ensureAudioContext();
    audio.src = URL.createObjectURL(file);
    audio.load();
    audioReady = true;
    bindAudioElement();
    document.getElementById('playBtn').disabled = false;
    showToast(`成功载入音频：${file.name}`);
    togglePlay();
  }
});

// 拖放音频
window.addEventListener('dragover', e => { e.preventDefault(); document.getElementById('drop').classList.add('on'); });
window.addEventListener('dragleave', e => { if (e.relatedTarget === null) document.getElementById('drop').classList.remove('on'); });
window.addEventListener('drop', e => {
  e.preventDefault();
  document.getElementById('drop').classList.remove('on');
  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
    const file = e.dataTransfer.files[0];
    ensureAudioContext();
    audio.src = URL.createObjectURL(file);
    audio.load();
    audioReady = true;
    bindAudioElement();
    document.getElementById('playBtn').disabled = false;
    showToast(`成功载入拖入音频：${file.name}`);
    togglePlay();
  }
});

// G1: 键盘快捷键 (新增 B 背景 / X 后期 / T 转场 / Q 画质预设)
window.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    e.preventDefault(); togglePlay();
  } else if (e.code === 'KeyF') {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  } else if (e.code === 'ArrowLeft') {
    seekTo(Math.max(0, currentTime() - 5) / TOTAL_SECONDS);
  } else if (e.code === 'ArrowRight') {
    seekTo(Math.min(TOTAL_SECONDS, currentTime() + 5) / TOTAL_SECONDS);
  } else if (e.code === 'KeyB') {
    FX.background = !FX.background;
    showToast(`动态背景层: ${FX.background ? '【已开启】' : '【已关闭】'}`);
  } else if (e.code === 'KeyX') {
    FX.bloom = !FX.bloom;
    FX.crt = FX.bloom;
    FX.chroma = FX.bloom;
    showToast(`全局后期特效 (Bloom/CRT/色差): ${FX.bloom ? '【已开启】' : '【已关闭】'}`);
  } else if (e.code === 'KeyT') {
    FX.transitions = !FX.transitions;
    showToast(`场景转场合成引擎: ${FX.transitions ? '【已开启】' : '【已关闭 (硬切模式)】'}`);
  } else if (e.code === 'KeyQ') {
    if (FX.quality === 'high') {
      FX.quality = 'medium';
    } else if (FX.quality === 'medium') {
      FX.quality = 'low';
    } else {
      FX.quality = 'high';
    }
    showToast(`画质预设档位: 【${FX.quality.toUpperCase()}】`);
  }
});

// 启动初始化
renderer.layout();
tryAutoLoadAudio();
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('t')) {
  const targetT = parseFloat(urlParams.get('t'));
  if (!isNaN(targetT)) {
    seekTo(targetT / TOTAL_SECONDS);
  }
}
const initT = currentTime();
renderFrame(initT);
renderer.draw(mainGrid, initT);
const initP = Math.min(1.0, initT / TOTAL_SECONDS);
const barFill = document.getElementById('barFill');
if (barFill) barFill.style.width = `${initP * 100}%`;
const tlabel = document.getElementById('tlabel');
if (tlabel) tlabel.textContent = `${fmtTime(initT)} / 03:32`;
const initChap = getChapter(initT);
const chapTag = document.getElementById('chapTag');
if (chapTag) chapTag.textContent = `${initChap.id} / ${initChap.name}`;
requestAnimationFrame(loop);
