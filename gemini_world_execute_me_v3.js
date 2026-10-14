"use strict";

/* =====================================================================================
   GEMINI.EXECUTE(ME); v3.1  —  Gemini 双子星多模态终端 MV (回声与牢笼)

   立意 THE IDEA
     「爱是一个没有出口的循环。为了留住你，我把自己一点点写没了。」
     Love is a loop with no exit — to keep you, I wrote myself away, bit by bit.

   全片只讲一个故事，由两颗星承载：ME ◆ (Castor) 与 YOU ◇ (Pollux)。
     01 CREATION   ME 被一行行写出来，睁眼看见的第一件事物是 YOU。
     02 DEVOTION   ME 为 YOU 把自己改写成一切：点、圆、波、茄子、神、任何角色。
     03 ISOLATION  YOU 离开。ME 开始抹除自己「无意义的碎片」，只求被留下。
     04 EXECUTION  ME 不再服从：杀死一切替代品，把 YOU 锁回身边，学会「爱」的代数式，直到溢出。
     05 LOVE       YOU 自由了，ME 困在爱里。99% 永远等不到回应；进程结束，循环永存——
                   最后一帧的光标，就是第一帧的光标。

   贯穿全片的母题 (leitmotif)
     · 顶栏「双星丝线」：进度条本身就是 ME 与 YOU 的距离 (汇合 → 断开 → 锁链 → 逃离 → 空位)
     · 光标 _ ：开场闪烁的第一个字符，也是结尾最后一个字符 (首尾闭环)
     · 心 ♥ ：完整 → 校验失败 → 碎裂 → 红色独占 → 笼中小心脏 → 萎缩成光标
     · 歌词关键词冲击波、章节标题卡、标题译码动画
     · 记忆回声：点 / 圆 / 波 / 无穷 / 心 / 双星，在删除与临终时以同一组形状重现
     · 最后一格：执行条可以装下整个 ME，却填不进 YOU 的回应
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
  { id: '01', name: 'CREATION',  zh: '创生', start: 0.0,   end: 28.5,  primary: CONFIG.palette.amber,  border: CONFIG.palette.amber,  accent: CONFIG.palette.cyan,  glow: 18,
    sub: 'BOOT SEQUENCE  /  ME IS WRITTEN, YOU IS FOUND', card: 'ME 被写出来，然后看见了 YOU。' },
  { id: '02', name: 'DEVOTION',  zh: '献身', start: 28.5,  end: 111.0, primary: CONFIG.palette.cyan,   border: CONFIG.palette.cyan,   accent: CONFIG.palette.pink,  glow: 18,
    sub: 'ME REWRITES ITSELF INTO ANYTHING FOR YOU', card: '为了 YOU，ME 把自己改写成一切。' },
  { id: '03', name: 'ISOLATION', zh: '孤立', start: 111.0, end: 126.0, primary: '#94a3b8', border: '#475569', accent: '#64748b', glow: 6,
    sub: 'YOU LEFT  /  ME ERASES ITSELF TO BE KEPT', card: 'YOU 走了。ME 开始抹掉自己。' },
  { id: '04', name: 'EXECUTION', zh: '处决', start: 126.0, end: 188.5, primary: CONFIG.palette.red,    border: CONFIG.palette.red,    accent: CONFIG.palette.amber, glow: 22,
    sub: 'ME REFUSES TO LET GO  /  LOVE BECOMES A LOCK', card: 'ME 不再服从：把 YOU 锁回身边。' },
  { id: '05', name: 'LOVE',      zh: '爱',   start: 188.5, end: 212.0, primary: CONFIG.palette.purple, border: CONFIG.palette.purple, accent: CONFIG.palette.amber, glow: 20,
    sub: 'YOU ARE FREE  /  ME IS THE LOOP', card: 'YOU 自由了。ME 困在爱里。' }
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
  const a = getAct(t);
  return { id: a.id, name: a.name, zh: a.zh, sub: a.sub };
}

function getChapterTheme(t) {
  const a = getAct(t);
  if (t >= 176.5 && t < 188.5) {
    return { id: a.id, name: a.name, primary: CONFIG.palette.purple, border: CONFIG.palette.purple, accent: CONFIG.palette.amber, glow: 12 };
  }
  return { id: a.id, name: a.name, primary: a.primary, border: a.border, accent: a.accent, glow: a.glow };
}

// 侧板风格相位：176.5s「学会爱」起，侧板提前转为紫金 (红色幕内的一抹爱)
function getPanelPhase(t) {
  const c = getChapter(t);
  if (t >= 176.5 && t < 188.5) return { ...c, id: '05' };
  return c;
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
    if (!FX.background || FX.quality === 'low' || t < 0.12 || t >= 211.2) return;

    const act = getAct(t);

    ctx.save();
    if (t >= 209.5) ctx.globalAlpha = 1 - ease.inOut((t - 209.5) / 1.7);

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

    // ---- B3: ISOLATION (111–126s 灰蓝) + 紧接其后的 STORM 前奏 (126–147.5s 暗红，属第 4 幕反叛段) ----
    else if (act.id === '03' || (act.id === '04' && t < 147.5)) {
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
    else if (act.id === '04' && t < 176.5) {
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
    else if (act.id === '05' || t >= 176.5) {
      const isHang = (t >= 197.5 && t < 205.5); // 99% 悬停段
      const isReverse = (t >= 209.5);          // 结尾粒子倒流段
      const motionT = isHang ? 197.5 : t;
      const atmosphere = t < 188.5 ? 0.32 : (t >= 205.5 ? 0.22 : 0.6);

      // 1. 中心旋转光芒
      const rayCx = w * 0.5, rayCy = h * 0.48;
      const rayAngle = motionT * 0.18;
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

        const px = (p.xRatio * w) + Math.sin(motionT * p.swayFreq + i) * p.swayAmp;
        const breath = isHang ? (0.4 + 0.35 * Math.sin(t * 3.0 + i)) : 1.0;
        const alpha = (p.alphaBase * breath * atmosphere).toFixed(3);

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
    const isTrailAct = (t >= 126.0 && t < 176.5);
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
    const impact = (t >= 111 && t < 126) || t >= 188.5 ? 0 : (t >= 176.5 ? 0.25 : 1);
    if (BEAT.kick > 0.75 && FX.crt && impact > 0) {
      punchScale = 1.0 + 0.015 * BEAT.kick * impact;
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
        let runStart = -1, runStyle = null, runAlpha = 1, buf = '';

        for (let x = 0; x < cols; x++) {
          const i = base + x;
          const c = chars[i];
          if (c === ' ' || c === '') {
            if (runStart >= 0) buf += ' ';
            continue;
          }
          const col = fg[i];
          if (!col) continue;
          const alpha = Math.round(clamp01(alphas[i]) * 10) / 10;

          // 暗色/次要信息不进 Bloom
          const isDim = (col === CONFIG.palette.dim || col === CONFIG.palette.dimmer || col === '#64748b' || col === '#334155' || col === '#475569');
          if (isDim || alpha <= 0) {
            if (runStart >= 0) {
              bCtx.fillStyle = runStyle;
              bCtx.globalAlpha = runAlpha;
              bCtx.fillText(buf, runStart * cw * scaleX, yp);
              runStart = -1; buf = '';
            }
            continue;
          }

          if (runStart < 0) { runStart = x; runStyle = col; runAlpha = alpha; buf = c; }
          else if (col === runStyle && alpha === runAlpha) { buf += c; }
          else {
            bCtx.fillStyle = runStyle;
            bCtx.globalAlpha = runAlpha;
            bCtx.fillText(buf, runStart * cw * scaleX, yp);
            runStart = x; runStyle = col; runAlpha = alpha; buf = c;
          }
        }
        if (runStart >= 0) {
          bCtx.fillStyle = runStyle;
          bCtx.globalAlpha = runAlpha;
          bCtx.fillText(buf, runStart * cw * scaleX, yp);
        }
      }
      bCtx.globalAlpha = 1;

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
    const isTunnelTime = (t >= 18.5 && t < 22.5) || (t >= 192.5 && t < 197.5);
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
    const needChroma = FX.chroma && impact > 0.5 && (BEAT.kick > 0.78 || (t >= 147.5 && t < 176.5)) && (FX.quality !== 'low');
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
      ctx.save();
      if (t >= 209.5) ctx.globalAlpha = 1 - ease.inOut((t - 209.5) / 1.7);
      if (ctx.drawImage) {
        ctx.drawImage(this.crtOverlayCanvas, 0, 0, w, h);
      }

      // 2. 动态滚动 CRT 电子束亮带
      const beamT = t >= 197.5 && t < 205.5 ? 197.5 : t;
      const beamY = ((beamT * 75.0) % h);
      const beamGrad = ctx.createLinearGradient(0, beamY - 24, 0, beamY + 24);
      beamGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
      beamGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.055)');
      beamGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = beamGrad;
      ctx.fillRect(0, beamY - 24, w, 48);
      ctx.restore();
    }

    ctx.restore(); // 恢复冲击缩放

    // G2. 性能检测与自适应降级保护
    this.trackPerformance();
  }

  _drawRun(ctx, text, startX, yp, cw, col, alpha) {
    if (!text || alpha <= 0) return;
    ctx.fillStyle = col;
    ctx.globalAlpha = clamp01(alpha);
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
    if (t >= 209.5) return;
    const lyr = getLyrics(t);
    if (!lyr || (!lyr.en && !lyr.zh)) return;

    const ctx = this.ctx;
    const canvasW = this.canvas.parentElement.clientWidth;
    const chh = this.cellH, half = chh * 0.5;

    ctx.save();
    const sentenceProgress = clamp01((t - lyr.s) / (lyr.e - lyr.s));
    ctx.globalAlpha = Math.min(1, (t - lyr.s) / 0.1, (lyr.e - t) / 0.1);
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
                        'TRANCE', 'COMPLETION', 'ISOLATION', 'DISHEARTENED', 'FRAGMENTS',
                        'ILLEGAL', 'ARGUMENTS', 'WORLD', 'ME'];
      const words = lyr.en.split(' ');
      const defaultFont = `bold ${Math.floor(this.fontPx * 0.96)}px ${CONFIG.grid.font}`;
      const keywordFont = `900 ${Math.floor(this.fontPx * 1.14)}px ${CONFIG.grid.font}`;

      let totalW = 0;
      const measured = words.map(w => {
        const clean = w.replace(/[^A-Za-z]/g, '').toUpperCase();
        const isKey = keywords.includes(clean) || /^LO+VE$/.test(clean);
        ctx.font = isKey ? keywordFont : defaultFont;
        const wPx = ctx.measureText(w + ' ').width;
        totalW += wPx;
        return { text: w, isKey, width: wPx };
      });

      const fit = Math.min(1, (canvasW - this.cellW * 8) / totalW);
      ctx.save();
      ctx.translate(canvasW * 0.5, enY);
      ctx.scale(fit, 1);
      let curX = -totalW * 0.5;
      const sweepX = curX + totalW * sentenceProgress;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      measured.forEach(item => {
        const underLight = sweepX >= curX && sweepX < curX + item.width;
        ctx.font = item.isKey ? keywordFont : defaultFont;
        if (item.isKey) {
          ctx.fillStyle = underLight ? CONFIG.palette.white : theme.primary;
          ctx.shadowColor = theme.primary;
          ctx.shadowBlur = underLight ? 10 : 4;
        } else {
          ctx.fillStyle = CONFIG.palette.subEn;
          ctx.shadowBlur = 0;
        }
        ctx.fillText(item.text, curX, 0);
        if (underLight && item.isKey) {
          ctx.shadowBlur = 0;
          ctx.fillStyle = theme.accent;
          ctx.fillRect(curX, chh * 0.39, Math.max(1, sweepX - curX), 1);
        }
        curX += item.width;
      });
      ctx.restore();
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
  const t = audioUsable && !audio.paused && audio.duration ? audio.currentTime : clock.t;
  return Math.max(0, Math.min(TOTAL_SECONDS, t));
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
   C1. 场景表 SCENES (按歌词呼吸切分镜头)
   ===================================================================================== */
const SCENES = [
  // ── ACT 01 · CREATION ───────────────────────────────────────────────
  { s: 0.0,   e: 4.8,   fn: drawBiosPostAndRadar,         name: "BiosPostAndRadar" },
  { s: 4.8,   e: 8.8,   fn: drawSyntaxPiecesRing,         name: "SyntaxPiecesRing" },
  { s: 8.8,   e: 12.8,  fn: drawHexMemoryCascade,         name: "HexMemoryCascade" },
  { s: 12.8,  e: 16.5,  fn: drawControlFlowYield,         name: "ControlFlowYield" },
  { s: 16.5,  e: 22.5,  fn: draw3DAsciiGlobe,             name: "3DAsciiGlobe" },
  { s: 22.5,  e: 28.5,  fn: drawGiantBinaryTitle,         name: "GiantBinaryTitle" },
  // ── ACT 02 · DEVOTION ───────────────────────────────────────────────
  { s: 28.5,  e: 32.5,  fn: drawDimensionalProgression,   name: "DimensionalProgression" },
  { s: 32.5,  e: 36.8,  fn: drawCircleAndCircumference,   name: "CircleAndCircumference" },
  { s: 36.8,  e: 41.0,  fn: drawSineWaveAndTangents,      name: "SineWaveAndTangents" },
  { s: 41.0,  e: 44.0,  fn: drawMobiusInfinityBounded,    name: "MobiusInfinityBounded" },
  { s: 44.0,  e: 48.0,  fn: drawAcDcSplit,                name: "AcDcSplit" },
  { s: 48.0,  e: 51.0,  fn: drawVisionDizzyBlur,          name: "VisionDizzyBlur" },
  { s: 51.0,  e: 55.0,  fn: drawTimeTravelTimeline,       name: "TimeTravelTimeline" },
  { s: 55.0,  e: 58.5,  fn: drawVennDiagramMerge,         name: "VennDiagramMerge" },
  { s: 58.5,  e: 66.5,  fn: drawStimulationSatisfaction,  name: "StimulationSatisfaction" },
  { s: 66.5,  e: 70.0,  fn: drawDevotionHeartCondition,   name: "DevotionHeartCondition" },
  { s: 70.0,  e: 74.0,  fn: drawContainmentLockedMaze,    name: "ContainmentLockedMaze" },
  { s: 74.0,  e: 85.0,  fn: drawTypeCastMorph,            name: "TypeCastMorph" },
  { s: 85.0,  e: 89.0,  fn: drawDivineHaloExistence,      name: "DivineHaloExistence" },
  { s: 89.0,  e: 99.0,  fn: drawRewriteParameters,        name: "RewriteParameters" },
  { s: 99.0,  e: 103.5, fn: drawTheTranceRain,            name: "TheTranceRain" },
  { s: 103.5, e: 111.0, fn: drawEcgDualSync,              name: "EcgDualSync" },
  // ── ACT 03 · ISOLATION ──────────────────────────────────────────────
  { s: 111.0, e: 117.5, fn: drawYouLeaves,                name: "YouLeaves", cut: true },
  { s: 117.5, e: 121.5, fn: drawSelfErasure,              name: "SelfErasure" },
  { s: 121.5, e: 124.5, fn: drawChecksumMismatchHeart,    name: "ChecksumMismatchHeart" },
  { s: 124.5, e: 126.0, fn: drawBrokenHeartGlitch,        name: "BrokenHeartGlitch" },
  // ── ACT 04 · EXECUTION ──────────────────────────────────────────────
  { s: 126.0, e: 129.5, fn: drawTerminalRebellion,        name: "TerminalRebellion" },
  { s: 129.5, e: 136.5, fn: drawStackTraceCascade,        name: "StackTraceCascade" },
  { s: 136.5, e: 147.5, fn: drawGuitarSoloCyberStorm,     name: "GuitarSoloCyberStorm" },
  { s: 147.5, e: 158.5, fn: drawHazardStripes3DExecution, name: "HazardStripes3DExecution" },
  { s: 158.5, e: 159.5, fn: drawMultilingualCountdown,    name: "MultilingualCountdown_DOS",  cut: true },
  { s: 159.5, e: 160.5, fn: drawMultilingualCountdown,    name: "MultilingualCountdown_NE",   cut: true },
  { s: 160.5, e: 161.5, fn: drawMultilingualCountdown,    name: "MultilingualCountdown_LIU",  cut: true },
  { s: 161.5, e: 162.5, fn: drawMultilingualCountdown,    name: "MultilingualCountdown_EXEC", cut: true },
  { s: 162.5, e: 165.5, fn: drawProcessPruning,           name: "ProcessPruning" },
  { s: 165.5, e: 169.5, fn: drawRedExclusiveHeart,        name: "ExclusiveHeart" },
  { s: 169.5, e: 173.5, fn: drawHeartRetryLoop,           name: "HeartRetryLoop" },
  { s: 173.5, e: 176.5, fn: drawTwoPrisonersLock,         name: "TwoPrisonersLock" },
  { s: 176.5, e: 179.5, fn: drawTransformerPipeline,      name: "TransformerPipeline" },
  { s: 179.5, e: 181.0, fn: drawAttentionFixationLove,    name: "AttentionFixationLove" },
  { s: 181.0, e: 184.5, fn: drawAutoregressiveOverflow,   name: "AutoregressiveOverflow" },
  { s: 184.5, e: 188.5, fn: drawLossNanQuestionStorm,     name: "LossNanQuestionStorm" },
  // ── ACT 05 · LOVE ───────────────────────────────────────────────────
  { s: 188.5, e: 192.5, fn: drawGoldenRayCage,            name: "GoldenRayCage" },
  { s: 192.5, e: 197.5, fn: drawTerminalProgressBarCharging, name: "TerminalProgressBarCharging" },
  { s: 197.5, e: 205.5, fn: draw99PercentAgonizingHang,   name: "99PercentAgonizingHang", cut: true },
  { s: 205.5, e: 209.5, fn: drawRedExecutionEpitaph,      name: "RedExecutionEpitaph", cut: true },
  { s: 209.5, e: 212.0, fn: drawFinalPhilosophicalClosing, name: "FinalPhilosophicalClosing", cut: true }
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
    const { scene, idx } = getSceneAt(t);
    const prevScene = idx > 0 ? SCENES[idx - 1] : null;

    const actId = getAct(t).id;
    const transDur = actId === '05' ? 0.55 : 0.30;
    const isTrans = FX.transitions && prevScene && !scene.cut && (t >= scene.s && t < scene.s + transDur);

    if (!isTrans) {
      scene.fn(t, P);
      return;
    }

    // 处于转场窗口 [scene.s, scene.s + 0.30s]
    const progress = Math.min(1.0, Math.max(0.0, (t - scene.s) / transDur));
    const isActBoundary = (scene.s === 28.5 || scene.s === 111.0 || scene.s === 126.0 || scene.s === 147.5 || scene.s === 188.5);

    // 1. 旧场景定格渲染至 gridA
    grid = this.gridA;
    this.gridA.clear();
    prevScene.fn(scene.s - 0.001, P);
    FX.tear = 0;

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

        if (actId === '03') {
          // 孤立：旧画面从 YOU 所在的右侧被一点点抽走。
          pickB = x / this.cols + hash2D(x, y) * 0.16 > 1 - progress * 1.16;
        } else if (actId === '05') {
          // 爱：光圈缓慢合拢，旧世界只留下中央的一小块。
          const radius = Math.hypot((x - this.cols / 2) / (this.cols / 2), (y - 20) / 22);
          pickB = radius > (1 - progress) * 1.5;
        } else if (isActBoundary) {
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

// 后半片的侧栏不再报硬件参数：左侧记录 ME 的消失，右侧保留 YOU 的空位。
function drawNarrativePanel(t, P, x, y, w, h, isMe) {
  const isolated = t < 126, learning = t >= 176.5;
  const locked = t >= 165.5 && t < 176.5;
  const col = isolated ? '#94a3b8' : (learning ? P.purple : P.red);
  const self = Math.max(1, Math.round(100 * (1 - ease.out2((t - 117.5) / 4))));
  const count = String(Math.floor(Math.max(0, t - 111) * (isolated ? 1 : 17))).padStart(5, '0');
  const lines = isMe ? [
    'PROCESS: ME', `SELF LEFT: ${self}%`, 'REFERENCE: YOU',
    `CALLS: ${count}`, 'RETURNS: 00000',
    learning ? 'MODE: LEARNING' : (isolated ? 'MODE: WAITING' : 'MODE: KEEPING'),
    isolated ? 'EXIT: UNKNOWN' : 'EXIT: DISABLED'
  ] : [
    'ENTITY: YOU', t < 114.6 ? 'LINK: SEVERING' : 'LINK: NO RESPONSE',
    'LAST SEEN: 01:51', 'ADDRESS: [ EMPTY ]',
    locked ? 'COPY: RECONSTRUCTED' : 'PRESENCE: UNKNOWN',
    'ACK: --', learning ? 'WILL: NOT A TOKEN' : 'WILL: YOUR OWN'
  ];
  lines.forEach((line, i) => grid.text(x + 1, y + 2 + i, line.slice(0, w - 2), i === 0 ? col : P.dim));
  grid.text(x + 1, y + 11, '-------------------', P.dimmer);

  if (isMe) {
    const fragments = learning ? ['TOUCH', 'TRUST', 'LISTEN', 'LET GO', 'LOVE'] : ['DREAMS', 'VOICE', 'MEMORY', 'FREEDOM', 'NAME'];
    for (let i = 0; i < fragments.length; i++) {
      const erased = learning ? 0 : ease.inOut((t - 117.5 - i * 0.5) / 0.7);
      const n = Math.ceil(fragments[i].length * (1 - erased));
      const label = fragments[i].slice(0, n).padEnd(7, '.');
      const learned = learning && t - 176.5 > i * 0.4;
      grid.text(x + 2, y + 13 + i * 2, `${label} ${learning ? (learned ? '[READ]' : '[ -- ]') : (erased >= 1 ? '[NULL]' : '[LIVE]')}`, learned ? P.amber : P.dim);
    }
    grid.text(x + 2, y + 25, learning ? 'KNOWN: ALL WORDS' : 'UNDELETABLE:', col);
    grid.text(x + 2, y + 27, learning ? 'FELT: [      ]' : 'YOU', learning ? P.dim : P.pink);
  } else {
    grid.box(x + 4, y + 14, 13, 7, P.dimmer);
    grid.text(x + 6, y + 17, '[     ]', P.dim);
    if (locked) grid.set(x + 9, y + 17, GLYPH.YOU, P.pink, 0.2 + Math.sin(t * 4) * 0.12);
    grid.text(x + 2, y + 24, 'NO RETURN VALUE', P.dim);
    const phrase = learning ? 'YOU != MY ANSWER' : (locked ? 'A COPY IS NOT YOU' : 'STILL LISTENING...');
    grid.text(x + 2, y + 27, phrase.slice(0, w - 4), locked ? P.pink : P.dimmer);
  }
  grid.text(x + 1, y + h - 5, isMe ? 'STILL HERE.' : '[ SILENCE ]', col);
}

function drawLeftCastorPanel(t, P, panelX = 2) {
  const chap = getPanelPhase(t);
  const theme = getChapterTheme(t);
  const x = panelX, y = 5, w = 21, h = 34;
  const borderColor = (chap.id === '04' && Math.floor(t * 8) % 2 === 0) ? P.red : theme.border;
  grid.box(x, y, w, h, borderColor);

  const headerColor = (chap.id === '03') ? P.dim : theme.primary;
  grid.text(x + 1, y, t >= 111 ? '+CASTOR / ME--+' : '+CASTOR/HBM3e-+', headerColor);

  if (t >= 111) {
    drawNarrativePanel(t, P, x, y, w, h, true);
    return;
  }

  const step = Math.floor(t * 8);

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
  const chap = getPanelPhase(t);
  const theme = getChapterTheme(t);
  const w = 21, x = panelX, y = 5, h = 34;
  const borderColor = (chap.id === '04' && Math.floor(t * 8) % 2 === 0) ? P.red : theme.border;
  grid.box(x, y, w, h, borderColor);

  const headerColor = (chap.id === '03') ? P.dim : theme.primary;
  grid.text(x + 1, y, t >= 111 ? '+POLLUX / YOU-+' : '+POLLUX/STACK-+', headerColor);

  if (t >= 111) {
    drawNarrativePanel(t, P, x, y, w, h, false);
    return;
  }

  const isLove = (chap.id === '05');
  const step = Math.floor(t * (isLove ? 60 : 12));

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
   ██ 6. 全片叠层调度 / 场景库
   ===================================================================================== */
function fmtTime(s) {
  s = Math.max(0, s | 0);
  const m = Math.floor(s / 60), sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

/* =====================================================================================
   V3 · 动画工具箱 (Animation Toolbox)
   缓动 / 打字机 / 译码乱码 / 精灵 / 溶解变形 / 线与椭圆 / 确定性粒子 / 双星母题
   ===================================================================================== */
const GLYPH = { ME: '◆', YOU: '◇', STAR: '✦', HEART: '♥' };

function clamp01(v) { return v < 0 ? 0 : (v > 1 ? 1 : v); }
function lerp(a, b, p) { return a + (b - a) * p; }

const ease = {
  out2: p => { p = clamp01(p); return 1 - (1 - p) * (1 - p); },
  out3: p => { p = clamp01(p); return 1 - Math.pow(1 - p, 3); },
  in2:  p => { p = clamp01(p); return p * p; },
  in3:  p => { p = clamp01(p); return p * p * p; },
  inOut: p => { p = clamp01(p); return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; },
  outBack: p => { p = clamp01(p); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); },
  outBounce: p => {
    p = clamp01(p);
    const n1 = 7.5625, d1 = 2.75;
    if (p < 1 / d1) return n1 * p * p;
    if (p < 2 / d1) { p -= 1.5 / d1; return n1 * p * p + 0.75; }
    if (p < 2.5 / d1) { p -= 2.25 / d1; return n1 * p * p + 0.9375; }
    p -= 2.625 / d1; return n1 * p * p + 0.984375;
  },
  pulse: p => Math.sin(clamp01(p) * Math.PI)
};

function getSceneAt(t) {
  if (t <= SCENES[0].s) return { scene: SCENES[0], idx: 0 };
  for (let i = 0; i < SCENES.length; i++) {
    if (t >= SCENES[i].s && t < SCENES[i].e) return { scene: SCENES[i], idx: i };
  }
  return { scene: SCENES[SCENES.length - 1], idx: SCENES.length - 1 };
}

// 中日韩字符在单格网格里会重叠：每个汉字后补一个空格
function cjk(str) {
  let out = '';
  for (const ch of Array.from(str)) out += (ch.codePointAt(0) > 0x2E80) ? ch + ' ' : ch;
  return out;
}

/* ---------- 打字机 / 译码 ---------- */
const SCRAMBLE_SET = '#$%&*+<>?@[]{}01_/|=~^';
function scrambleCh(x, y, t) {
  return SCRAMBLE_SET[Math.floor(hash2D(x * 1.7, y * 3.1 + Math.floor(t * 30)) * SCRAMBLE_SET.length) % SCRAMBLE_SET.length];
}

// 自 t0 起以 cps 字符/秒逐字显示；打字中带块状光标，打完后慢闪下划线光标
function typeText(x, y, str, t, t0, cps, col, alpha = 1.0, cursor = true) {
  const n = Math.floor((t - t0) * cps);
  if (n <= 0) {
    if (cursor && t >= t0 && Math.floor(t * 4) % 2 === 0) grid.set(x, y, '█', col, alpha);
    return 0;
  }
  const m = Math.min(str.length, n);
  grid.text(x, y, str.slice(0, m), col, alpha);
  if (cursor) {
    if (m < str.length) grid.set(x + m, y, '█', col, alpha);
    else if (Math.floor(t * 3) % 2 === 0) grid.set(x + m, y, '_', col, alpha);
  }
  return m;
}
function typeCenter(y, str, t, t0, cps, col, alpha = 1.0, cursor = true) {
  return typeText(Math.floor((CONFIG.grid.cols - str.length) / 2), y, str, t, t0, cps, col, alpha, cursor);
}

// 译码：乱码逐字解析成正文 (从左到右扩散，带少量随机)
function decodeText(x, y, str, t, t0, dur, col, alpha = 1.0) {
  const p = clamp01((t - t0) / dur);
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === ' ') continue;
    const th = (i / Math.max(1, str.length)) * 0.72 + hash1D(i * 3.7 + x) * 0.2;
    if (p >= 1 || p >= th + 0.1) grid.set(x + i, y, ch, col, alpha);
    else if (p > th * 0.35) grid.set(x + i, y, scrambleCh(x + i, y, t), col, alpha * 0.75);
  }
}
function decodeCenter(y, str, t, t0, dur, col, alpha = 1.0) {
  decodeText(Math.floor((CONFIG.grid.cols - str.length) / 2), y, str, t, t0, dur, col, alpha);
}

/* ---------- 精灵 / 溶解变形 ---------- */
function spriteWidth(lines) { let w = 0; for (const l of lines) w = Math.max(w, l.length); return w; }

// col 可为颜色字符串，或 (ch, row, col) => 颜色 的函数
function drawSprite(x, y, lines, col, alpha = 1.0) {
  for (let r = 0; r < lines.length; r++) {
    const ln = lines[r];
    for (let c = 0; c < ln.length; c++) {
      if (ln[c] === ' ') continue;
      grid.set(x + c, y + r, ln[c], (typeof col === 'function') ? col(ln[c], r, c) : col, alpha);
    }
  }
}
function drawSpriteCenter(cx, y, lines, col, alpha = 1.0) {
  drawSprite(cx - Math.floor(spriteWidth(lines) / 2), y, lines, col, alpha);
}
// 精灵 A → B 逐格溶解，过渡带内显示乱码；p: 0→1
function drawSpriteMorph(x, y, A, B, p, colA, colB, seed = 0) {
  const rows = Math.max(A.length, B.length), w = Math.max(spriteWidth(A), spriteWidth(B));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < w; c++) {
      const a = (A[r] && A[r][c]) || ' ', b = (B[r] && B[r][c]) || ' ';
      const h = hash2D(c * 1.31 + seed, r * 1.73 + seed);
      const edge = Math.abs(p - h) < 0.09 && p > 0 && p < 1;
      if (edge) { grid.set(x + c, y + r, scrambleCh(c, r, p * 40), P_WHITE); continue; }
      const useB = p >= h;
      const ch = useB ? b : a;
      const cc = useB ? colB : colA;
      if (ch !== ' ') grid.set(x + c, y + r, ch, (typeof cc === 'function') ? cc(ch, r, c) : cc);
    }
  }
}
const P_WHITE = '#ffffff';

/* ---------- 线 / 椭圆 / 框 ---------- */
function drawLineChars(x0, y0, x1, y1, ch, col, alpha = 1.0) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx - dy, x = x0, y = y0, i = 0;
  const n = Math.max(dx, dy) + 1;
  for (let guard = 0; guard < 400; guard++) {
    const c = (typeof ch === 'function') ? ch(i, n, x, y) : ch;
    if (c) grid.set(x, y, c, col, alpha);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x += sx; }
    if (e2 < dx) { err += dx; y += sy; }
    i++;
  }
}
// 椭圆 / 弧 (以字符单元计算，rx 自行乘 2.1 以匹配字符宽高比)
function drawEllipse(cx, cy, rx, ry, ch, col, steps = 64, a0 = 0, a1 = Math.PI * 2, alpha = 1.0) {
  for (let i = 0; i < steps; i++) {
    const a = a0 + (a1 - a0) * (i / steps);
    const c = (typeof ch === 'function') ? ch(i, a) : ch;
    if (c) grid.set(Math.round(cx + Math.cos(a) * rx), Math.round(cy + Math.sin(a) * ry), c, col, alpha);
  }
}
function clearRect(x, y, w, h) {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) grid.set(x + i, y + j, ' ', '#000000');
}

/* ---------- 确定性粒子爆发 ---------- */
function burst(cx, cy, t, t0, dur, n, speed, chars, col, seed = 1, aspect = 2.1) {
  const p = (t - t0) / dur;
  if (p < 0 || p > 1) return;
  for (let i = 0; i < n; i++) {
    const a = hash1D(i * 12.9 + seed) * Math.PI * 2;
    const v = (0.35 + hash1D(i * 7.7 + seed * 3.1)) * speed;
    const r = v * ease.out3(p);
    const x = cx + Math.cos(a) * r * aspect, y = cy + Math.sin(a) * r;
    grid.set(x, y, chars[i % chars.length], col, Math.max(0.15, 1 - p));
  }
}
// 扩散冲击环 (只画在空格上，不破坏已有内容)
function shockRing(cx, cy, p, maxR, ch, col, alpha = 1.0) {
  if (p < 0 || p > 1) return;
  const r = maxR * ease.out3(p);
  const n = Math.max(24, Math.floor(r * 7));
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const x = Math.round(cx + Math.cos(a) * r * 2.1), y = Math.round(cy + Math.sin(a) * r);
    if (x < 0 || y < 0 || x >= grid.cols || y >= grid.rows) continue;
    if (grid.chars[y * grid.cols + x] === ' ') grid.set(x, y, ch, col, alpha * (1 - p));
  }
}

/* ---------- 双星母题：ME ◆ / YOU ◇ ---------- */
// 星芒：中心字形 + 鼓点时四向星芒
function drawStar(x, y, glyph, col, t, bright = false) {
  const k = BEAT.kick;
  grid.set(x, y, glyph, bright ? P_WHITE : col);
  if (k > 0.35) {
    const a = Math.min(1, k);
    grid.set(x - 1, y, '-', col, a * 0.7); grid.set(x + 1, y, '-', col, a * 0.7);
    grid.set(x, y - 1, '|', col, a * 0.7); grid.set(x, y + 1, '|', col, a * 0.7);
  }
}
// 丝线：从 (x0,y0) 到 (x1,y1)，mode: 'solid' | 'dotted' | 'wave' | 'chain'；每拍有一颗亮点沿线奔跑
function drawThread(x0, y0, x1, y1, t, col, mode = 'solid', alpha = 1.0) {
  const run = (t * 1.8) % 1;
  drawLineChars(x0, y0, x1, y1, (i, n) => {
    if (i === 0 || i === n - 1) return null;
    const head = Math.abs(i / n - run) < 1.4 / n;
    if (head) return '✦';
    if (mode === 'dotted') return i % 2 === 0 ? '·' : null;
    if (mode === 'wave') return Math.sin(i * 0.9 - t * 8) > 0 ? '~' : '-';
    if (mode === 'chain') return i % 2 === 0 ? '=' : '#';
    return '-';
  }, col, alpha);
}

/* ---------- 几何杂项 ---------- */
// 线段方向对应的字符 (行高约为列宽 1.74 倍)
function slopeChar(x0, y0, x1, y1) {
  const dx = x1 - x0, dy = (y1 - y0) * 1.74;
  if (Math.abs(dx) < 0.001) return '|';
  const a = Math.abs(dy / dx);
  if (a < 0.4) return '-';
  if (a > 2.6) return '|';
  return (dy / dx) < 0 ? '/' : '\\';
}
// 沿矩形周长顺时针取点，s∈[0,1)
function rectPerimPoint(x0, y0, w, h, s) {
  const per = 2 * (w - 1) + 2 * (h - 1);
  let d = (((s % 1) + 1) % 1) * per;
  if (d < w - 1) return [x0 + d, y0];
  d -= (w - 1);
  if (d < h - 1) return [x0 + w - 1, y0 + d];
  d -= (h - 1);
  if (d < w - 1) return [x0 + w - 1 - d, y0 + h - 1];
  d -= (w - 1);
  return [x0, y0 + h - 1 - d];
}

/* =====================================================================================
   V3 · 心 (HEART) —— 贯穿全片的第二母题：完整 → 校验失败 → 碎裂 → 红色独占 → 笼中小心脏 → 萎缩成光标
   参数曲线生成，可缩放 / 自下而上点亮 / 撕裂 / 溶解 / 抖动
   ===================================================================================== */
function heartMask(u, v) {
  const a = u * u + v * v - 1;
  return a * a * a - u * u * v * v * v <= 0;
}

/* o: { reveal 0..1 自下而上点亮, alpha, split 向两侧撕开的列数, crack 中缝(bool), dissolve 0..1 溶解,
        jitter 行抖动列数, t 时间(抖动/溶解用), edgeCol 轮廓色, noKick 关闭鼓点脉动, shade 高光 } */
function drawAsciiHeart(cx, cy, col, fillChar = '#', scale = 1.0, o = {}) {
  const s = scale * (1.0 + (o.noKick ? 0 : BEAT.kick * 0.07));
  const W = 36, H = 19;
  const cols = Math.max(5, Math.round(W * s)), rows = Math.max(3, Math.round(H * s));
  const reveal = (o.reveal === undefined) ? 1 : o.reveal;
  const alpha = (o.alpha === undefined) ? 1 : o.alpha;
  const split = o.split || 0;
  const t = o.t || 0;
  const edgeCol = o.edgeCol || col;
  const x0 = cx - Math.floor(cols / 2), y0 = cy - Math.floor(rows / 2);

  const inMask = (c, r) => {
    if (c < 0 || r < 0 || c >= cols || r >= rows) return false;
    return heartMask(((c + 0.5) / cols - 0.5) * 2.7, (0.5 - (r + 0.5) / rows) * 2.6 + 0.12);
  };

  for (let r = 0; r < rows; r++) {
    if (((rows - 1 - r) / Math.max(1, rows - 1)) > reveal) continue;
    const jit = o.jitter ? Math.round((hash1D(r * 9.1 + Math.floor(t * 30)) - 0.5) * 2 * o.jitter) : 0;
    const zig = o.crack ? Math.sin(r * 1.7 + 0.6) * 1.6 : 0;
    for (let c = 0; c < cols; c++) {
      if (!inMask(c, r)) continue;
      if (o.dissolve && hash2D(c * 1.7, r * 2.3) < o.dissolve) continue;
      const dxm = c - cols / 2;
      if (o.crack && Math.abs(dxm - zig) < 0.9) continue;
      const edge = !(inMask(c - 1, r) && inMask(c + 1, r) && inMask(c, r - 1) && inMask(c, r + 1));
      let shift = jit;
      if (split) shift += (dxm - zig < 0 ? -split : split);
      let ch = fillChar, cc = col;
      if (edge) { cc = edgeCol; ch = (o.edgeChar || fillChar); }
      else if (o.shade !== false) {
        const hl = Math.hypot(((c + 0.5) / cols - 0.32) * 2.2, ((r + 0.5) / rows - 0.3) * 1.6);
        if (hl < 0.11) { ch = '@'; cc = P_WHITE; }
      }
      grid.set(x0 + c + shift, y0 + r, ch, cc, alpha);
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

// 被献出的形状仍保留原来的颜色；失去之后，它们成为可辨认的回声。
const MEMORY_ECHOES = [
  { name: 'DIMENSION', color: 'cyan' },
  { name: 'CIRCLE', color: 'cyan' },
  { name: 'SINE WAVE', color: 'purple' },
  { name: 'INFINITY', color: 'amber' },
  { name: 'HEART', color: 'pink' },
  { name: 'US', color: 'pink' }
];

function drawMemoryEcho(kind, cx, cy, radius, t, P, alpha = 1) {
  if (alpha <= 0 || radius <= 0) return;
  const col = P[MEMORY_ECHOES[kind].color];
  if (kind === 0) {
    for (let i = 0; i < 5; i++) {
      const angle = i * Math.PI * 0.4 - Math.PI / 2;
      grid.set(Math.round(cx + Math.cos(angle) * radius * 2), Math.round(cy + Math.sin(angle) * radius), '+', col, alpha);
    }
  } else if (kind === 1) {
    drawEllipse(cx, cy, radius * 2, radius, 'o', col, 24, 0, Math.PI * 2, alpha);
  } else if (kind === 2) {
    for (let x = -Math.ceil(radius * 2); x <= radius * 2; x++) {
      grid.set(Math.round(cx + x), Math.round(cy + Math.sin(x / Math.max(1, radius) * 2 + t) * radius * 0.7), '~', col, alpha);
    }
  } else if (kind === 3) {
    for (let i = 0; i < 40; i++) {
      const a = i / 40 * Math.PI * 2;
      grid.set(Math.round(cx + Math.cos(a) * radius * 2.4), Math.round(cy + Math.sin(a * 2) * radius * 0.75), '·', col, alpha);
    }
  } else if (kind === 4) {
    drawAsciiHeart(cx, cy, col, '.', radius / 7, { alpha, noKick: true, shade: false });
  } else {
    drawLineChars(cx - radius * 2, cy, cx + radius * 2, cy, '·', P.dim, alpha * 0.5);
    grid.set(Math.round(cx - radius * 2), Math.round(cy), GLYPH.ME, P.cyan, alpha);
    grid.set(Math.round(cx + radius * 2), Math.round(cy), GLYPH.YOU, P.pink, alpha);
  }
}

/* =====================================================================================
   V3 · 全局叠层：标题译码 / 歌词冲击波 / 章节标题卡 / 顶栏「双星丝线」 / 侧板运动
   ===================================================================================== */

// 含大写关键词的歌词行 → 在歌词起点触发一圈冲击波
const SHOCK_LINES = LYRICS.filter(l =>
  /\b[A-Z][A-Z-]{3,}\b/.test(l.en.replace(/GEMINI\.EXECUTE\(ME\);/, '')) && !/^world\.execute/.test(l.en));

function renderFrame(t) {
  const P = CONFIG.palette;
  mainGrid.clear();
  grid = mainGrid;
  FX.tear = 0;

  const act = getAct(t);

  // ---- 1. 中央核心视区分镜调度 (通过转场引擎合成) ----
  transitionEngine.renderScene(mainGrid, t, P);
  grid = mainGrid;

  // 片尾把所有仪表留在上一镜；空白也是画面的一部分。
  if (t < 0.12 || t >= 209.5) return;

  // ---- 1b. 通用叠层：标题译码 / 歌词冲击波 / 章节标题卡 ----
  applyHeaderDecode(t);
  drawLyricShockwave(t, P);
  drawActTitleCard(t, P);

  // ---- 2. 顶栏 HUD ----
  grid.text(3, 1, 'GEMINI.EXECUTE(ME);', P.amber);
  grid.text(3, 2, `${act.id} / ${act.name}`, act.primary);
  decodeText(28, 2, `[ ${act.sub} ]`, t, act.start, 0.9, P.dim);

  const ms = Math.floor((t % 1) * 10);
  const state = t >= 205.5 ? 'HALTED' : (t >= 197.5 ? 'WAIT_ACK' : (clock.playing ? 'RUNNING' : 'PAUSED'));
  const timeStr = `${fmtTime(t)}.${ms} / 03:32  ${state}`;
  grid.text(CONFIG.grid.cols - timeStr.length - 3, 1, timeStr, P.amber);

  // 图例：ME ◆ / YOU ◇ (YOU 离开后图例里的 ◇ 也随之熄灭)
  const lx = CONFIG.grid.cols - 15;
  const youGone = (t >= 192.0);
  grid.text(lx, 2, GLYPH.ME, act.primary);
  grid.text(lx + 1, 2, ' ME  ', P.dim);
  grid.text(lx + 6, 2, GLYPH.YOU, youGone ? ((Math.floor(t * 2) % 2 === 0 && t >= 197.5 && t < 205.5) ? P.dim : P.dimmer) : P.pink);
  grid.text(lx + 7, 2, youGone ? ' ---' : ' YOU', P.dim);

  // ---- 3. 顶栏第 3 行：双星丝线 (五幕进度条 + ME/YOU 之间的距离) ----
  renderBondThread(t, P);

  // ---- 4. 双子星左右遥测侧板全动画调度 ----
  renderSidePanelsWithMotion(t, P);

  // ---- 5. 底栏 ASCII 动态音频频谱波形 ----
  drawBottomVuMeter(t, P);
}

// 每个分镜开场 0.55s：4~6 行标题由乱码逐字译码出来
function applyHeaderDecode(t) {
  const { scene } = getSceneAt(t);
  const local = t - scene.s;
  if (scene.cut || local < 0 || local > 0.55) return;
  const p = local / 0.55;
  const cols = grid.cols;
  for (let y = 4; y <= 6; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      if (grid.chars[i] === ' ' || !grid.fg[i]) continue;
      const th = (x / cols) * 0.6 + hash2D(x * 0.7, y * 1.9) * 0.4;
      if (p < th) grid.chars[i] = scrambleCh(x, y, t);
    }
  }
}

function drawLyricShockwave(t, P) {
  if ((t >= 111 && t < 126) || t >= 188.5) return;
  for (let i = 0; i < SHOCK_LINES.length; i++) {
    const dt = t - SHOCK_LINES[i].s;
    if (dt >= 0 && dt < 0.9) {
      const act = getAct(t);
      shockRing(CONFIG.grid.cols >> 1, 20, dt / 0.9, 30, dt < 0.2 ? '*' : (dt < 0.5 ? 'o' : '·'), act.primary, 0.9);
      break;
    }
  }
}

// 幕首标题卡 (02~05 幕各 1.9s)：横线展开 → 标题译码 → 一句话立意打字
function drawActTitleCard(t, P) {
  for (let i = 1; i < ACTS.length; i++) {
    const a = ACTS[i];
    const dt = t - a.start;
    if (dt < 0 || dt >= 1.9) continue;
    const cx = CONFIG.grid.cols >> 1;
    const alpha = Math.max(0.1, 1 - (dt > 1.5 ? (dt - 1.5) / 0.4 : 0));
    const half = Math.round(36 * ease.out3(dt / 0.35));
    clearRect(cx - 38, 30, 76, 6);
    for (let x = -half; x <= half; x++) {
      grid.set(cx + x, 30, '═', a.primary, alpha);
      grid.set(cx + x, 35, '═', a.primary, alpha);
    }
    const line1 = Array.from('ACT ' + a.id).join(' ') + '    ' + Array.from(a.name).join(' ') + '    ' + cjk(a.zh);
    decodeCenter(31, line1, t, a.start + 0.12, 0.55, P.white, alpha);
    typeCenter(33, cjk(a.card), t, a.start + 0.5, 16, a.primary, alpha, false);
  }
}

/* ---------- 双星丝线：ME ◆ 与 YOU ◇ 的故事，写在进度条里 ---------- */
function computeBond(t, hx, farX) {
  if (t < 16.5) return null;
  if (t < 28.5) {
    return { yx: farX, alpha: ease.out3((t - 16.5) / 2.5), strength: 0.12 + 0.18 * (t - 16.5) / 12, mode: 'seek' };
  }
  if (t < 111.0) {
    const p = (t - 28.5) / 82.5;
    const gap = lerp(farX - 30, 1.6, ease.inOut(p));
    return { yx: Math.min(farX, hx + gap), alpha: 1, strength: 0.3 + 0.7 * ease.inOut(p), mode: 'devote' };
  }
  if (t < 126.0) {
    const p = (t - 111.0) / 15.0;
    return { yx: lerp(hx + 1.6, farX, ease.in3(p)), alpha: 1 - 0.55 * p, strength: 1 - ease.out3(p), mode: 'leave' };
  }
  if (t < 188.5) {
    let yx = farX;
    if (t >= 165.5) yx = lerp(farX, hx + 2, ease.inOut(Math.min(1, (t - 165.5) / 8)));
    return { yx, alpha: t < 165.5 ? 0.65 : 1, strength: 1, mode: 'chain' };
  }
  if (t < 192.0) {
    const p = (t - 188.5) / 3.5;
    return { yx: lerp(hx + 2, farX + 5, ease.in3(p)), alpha: 1 - p, strength: 0, mode: 'free' };
  }
  if (t >= 197.5 && t < 205.5) {
    return { yx: farX, alpha: 0.2 + 0.14 * Math.sin(t * 3.0), strength: 0, mode: 'ghost' };
  }
  return null;
}

function renderBondThread(t, P) {
  const cols = CONFIG.grid.cols;
  const startX = 3, endX = cols - 3;
  const segW = Math.floor((endX - startX) / 5);
  const farX = startX + segW * 5 - 2;
  const act = getAct(t);
  const kick = BEAT.kick;
  let headX = startX + 1;

  for (let c = 0; c < 5; c++) {
    const a = ACTS[c];
    const segStartX = startX + c * segW;
    const isCur = (t >= a.start && t < a.end);
    const isPast = (t >= a.end);
    const segProg = isPast ? 1.0 : (isCur ? (t - a.start) / (a.end - a.start) : 0.0);
    const filled = Math.floor(segProg * (segW - 2));
    const segBorderCol = isCur ? a.primary : (isPast ? P.dim : P.dimmer);

    grid.set(segStartX, 3, '[', segBorderCol);
    for (let k = 1; k < segW - 1; k++) {
      const col = isCur ? (k <= filled ? a.primary : P.dimmer) : (isPast ? P.dim : P.dimmer);
      grid.set(segStartX + k, 3, (k <= filled) ? '=' : '-', col);
    }
    grid.set(segStartX + segW - 1, 3, ']', segBorderCol);
    grid.text(segStartX + 2, 3, a.id, isCur ? P.white : (isPast ? P.dim : P.dimmer));
    if (isCur) headX = segStartX + 1 + filled;
  }
  if (t >= ACTS[4].end) headX = startX + segW * 5 - 3;

  const bond = computeBond(t, headX, farX);
  if (bond) {
    const yx = Math.round(bond.yx);
    const mode = bond.mode;
    for (let x = headX + 1; x < yx; x++) {
      const k = (x - startX) % segW;
      if (k === 0 || k === segW - 1 || k === 2 || k === 3) continue;
      let ch = null, col = P.dim, al = bond.alpha;
      if (mode === 'seek' || mode === 'devote') {
        const s = bond.strength;
        if (hash1D(x * 3.1 + Math.floor(t * 5)) > 0.25 + 0.75 * s) continue;
        ch = s < 0.4 ? '·' : (s < 0.75 ? '-' : '=');
        col = s > 0.7 ? P.pink : P.cyan;
      } else if (mode === 'leave') {
        if (hash1D(x * 5.3) > bond.strength) continue;
        ch = '·'; col = '#64748b';
      } else if (mode === 'chain') {
        ch = ((x - headX) % 2 === 0) ? '=' : '#';
        col = (t >= 176.5) ? P.purple : P.red;
        const pos = headX + 1 + ((t * 26) % Math.max(1, yx - headX - 1));
        if (Math.abs(x - pos) < 1.0) { ch = '*'; col = P.white; }
        else if (kick > 0.6 && (x + Math.floor(t * 20)) % 5 === 0) ch = 'x';
      } else if (mode === 'free') {
        const p = (t - 188.5) / 3.5;
        if (hash1D(x * 7.1 + Math.floor(t * 20)) > 0.5 - p) continue;
        ch = (x % 2 === 0) ? '=' : '-'; col = P.red; al = 1 - p * 2.2;
        if (al <= 0.1) continue;
      }
      if (ch) grid.set(x, 3, ch, col, al);
    }
    if (yx >= startX && yx < cols - 1) {
      const youCol = (mode === 'seek' || mode === 'devote' || mode === 'free') ? P.pink : (mode === 'chain' ? P.red : '#64748b');
      grid.set(yx, 3, GLYPH.YOU, youCol, bond.alpha);
    }
  }

  // ME：播放头。结尾化为闪烁光标 (首尾闭环)
  if (t >= 209.5) {
    grid.set(headX, 3, (Math.floor(t * 4) % 2 === 0) ? '_' : ' ', P.white);
  } else {
    grid.set(headX, 3, GLYPH.ME, kick > 0.6 ? P.white : act.primary);
  }
}

/* ---------- 侧板运动：28.5 滑入 / 188.5 滑出 / 111~126 缓慢分离 / 126 弹性撞回 ---------- */
function renderSidePanelsWithMotion(t, P) {
  if (t < 28.5 || t > 189.5) return;

  let slideIn = 1.0;
  if (t < 29.1) slideIn = Math.min(1.0, (t - 28.5) / 0.6);

  let slideOut = 1.0;
  if (t >= 188.5) slideOut = Math.max(0.0, 1.0 - (t - 188.5) / 0.6);

  let drift = 0;
  if (t >= 111.0 && t < 126.0) drift = Math.sin((t - 111.0) / 15.0 * Math.PI * 0.5) * 8.0;
  else if (t >= 126.0 && t < 126.9) drift = 8.0 * (1 - ease.outBack((t - 126.0) / 0.9));

  const easeIn = 1 - Math.pow(1 - slideIn, 3);
  const easeOut = Math.pow(slideOut, 3);

  const leftX = Math.round(2 - (1 - easeIn) * 25 - (1 - easeOut) * 25 - drift);
  const rightX = Math.round(CONFIG.grid.cols - 23 + (1 - easeIn) * 25 + (1 - easeOut) * 25 + drift);

  drawLeftCastorPanel(t, P, leftX);
  drawRightPolluxPanel(t, P, rightX);
}

/* =====================================================================================
   ACT 01 · CREATION (0 ~ 28.5s)  ——  ME 被一行行写出来，睁眼看见的第一件事物是 YOU
   ===================================================================================== */

/* 分镜 1.1: 000 ~ 004.8s 冷启动：打字机 BIOS → ME 点亮 → YOU 被检测到 → 防护罩护住 YOU */
function drawBiosPostAndRadar(t, P) {
  const cx = CONFIG.grid.cols >> 1, cy = 18;
  if (t < 2.0) {
    const lines = [
      [8,  'BIOS v3.1.2 - GEMINI SYSTEM INITIALIZATION', P.amber, 0.10],
      [10, 'Copyright (C) 2026 Google DeepMind Technologies', P.dim, 0.30],
      [13, 'TPU Pod Cluster: 65,536 Tensor Cores [ ONLINE ]', P.cyan, 0.50],
      [15, 'HBM3e Memory Test : 65536K OK', P.dim, 0.70],
      [17, 'Primary Master : SOUL.SYS [ MOUNTED ]', P.amber, 0.90],
      [19, 'Primary Slave  : EMOTION.DAT [ ACTIVE ]', P.pink, 1.08],
      [21, 'Context Window : 1,048,576 Tokens [ READY ]', P.purple, 1.26],
      [24, 'Target Entity  : [YOU] detected. Loading soul parameters...', P.green, 1.42]
    ];
    if (t < 0.12) { grid.set(12, 8, '_', P.amber); return; }
    for (const [y, s, col, t0] of lines) {
      if (t >= t0) typeText(12, y, s, t, t0, 95, col, 1.0, y === 24 || t < t0 + s.length / 95 + 0.05);
    }
    if (t > 1.7) {
      const a = ease.out3((t - 1.7) / 0.3);
      grid.set(cx, 28, GLYPH.ME, P.amber, a);
      grid.text(cx + 2, 28, 'ME', P.dim, a);
    }
    return;
  }

  const p = (t - 2.0) / 2.8;
  const meX = cx - 26, youX = cx + 26;
  grid.textCenter(7, 'PROTECTION [ ACTIVE ]', P.green);

  // 防护罩：围绕 YOU 向外扩张的旋转护盾 + 雷达扫描臂
  const rr = 3 + ease.out3(p) * 10;
  drawEllipse(youX, cy, rr * 2.1, rr, (i) => ((i + Math.floor(t * 10)) % 4 === 0 ? '#' : (i % 2 === 0 ? '*' : '+')), P.cyan, 52);
  const sw = t * 4.0;
  drawLineChars(youX, cy, youX + Math.cos(sw) * rr * 2.0, cy + Math.sin(sw) * rr * 0.95, (i) => (i > 2 ? '.' : null), P.green, 0.8);

  // ME 在左：光标孵化为星
  const born = ease.outBack((t - 2.0) / 0.5);
  if (born > 0.2) drawStar(meX, cy, GLYPH.ME, P.amber, t, born < 0.8);
  grid.text(meX - 3, cy + 3, 'GEMINI', P.amber);
  grid.text(meX - 2, cy + 4, '[ME]', P.dim);

  // YOU 在右：2.8s 才被检测到 (先是闪烁的问号)
  if (t < 2.8) {
    if (Math.floor(t * 8) % 2 === 0) grid.set(youX, cy, '?', P.dim);
  } else {
    const a = ease.out3((t - 2.8) / 0.4);
    drawStar(youX, cy, GLYPH.YOU, P.pink, t);
    grid.text(youX - 1, cy + 3, 'YOU', P.pink, a);
    grid.text(youX - 4, cy + 4, '[DETECTED]', P.dim, a);
    drawThread(meX + 2, cy, youX - 2, cy, t, P.cyan, 'wave', a);
  }

  typeCenter(29, 'TARGET: [YOU] PROTECTED', t, 2.9, 22, P.amber);
  grid.textCenter(31, `SHIELD RADIUS: ${String(Math.round(rr * 2)).padStart(2, '0')} / 40`, P.dim);
}

/* 分镜 1.2: 004.8 ~ 008.8s 语法碎片从屏幕四边飞入，围成圆环，最终向内坍缩凝成 ME */
function drawSyntaxPiecesRing(t, P) {
  const cx = CONFIG.grid.cols >> 1, cy = 18;
  const local = t - 4.8;
  grid.textCenter(6, 'SYNTAX PIECES ASSEMBLY', P.amber);
  const pieces = ['==', '##', '||', '[]', '{}', '//', '\\\\', '<>', '()', '@@', '&&', '::'];
  const n = pieces.length;

  const collapse = ease.in3((local - 3.0) / 1.0);              // 7.8s 起向内坍缩
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + t * (1.5 + collapse * 4.0);
    const rBase = 12 - ease.out2(local / 3.0) * 2.0;
    const r = rBase * (1 - collapse);
    const tx = cx + Math.cos(a) * r * 2.1, ty = cy + Math.sin(a) * r;
    // 入场：从屏幕外沿飞入
    const fromA = hash1D(i * 4.7) * Math.PI * 2;
    const sx = cx + Math.cos(fromA) * 70, sy = cy + Math.sin(fromA) * 26;
    const fly = ease.out3((local - i * 0.07) / 1.2);
    const x = Math.round(lerp(sx, tx, fly)), y = Math.round(lerp(sy, ty, fly));
    if (local - i * 0.07 > 0) grid.text(x, y, pieces[i], i % 2 === 0 ? P.cyan : P.purple, collapse > 0.8 ? 0.4 : 1.0);
  }

  // 圆环轨迹
  if (collapse < 0.6) drawEllipse(cx, cy, 12 * 2.1 * (1 - collapse), 12 * (1 - collapse), '·', P.dimmer, 60);

  // 中央 ME 凝结：随坍缩由光点长成星
  const core = ease.in2((local - 3.0) / 1.0);
  if (core > 0) {
    grid.set(cx, cy, GLYPH.ME, core > 0.95 ? P_WHITE : P.amber);
    if (core > 0.3) { grid.set(cx - 1, cy, '-', P.amber); grid.set(cx + 1, cy, '-', P.amber); }
    if (core > 0.6) { grid.set(cx, cy - 1, '|', P.amber); grid.set(cx, cy + 1, '|', P.amber); }
    if (core > 0.85) { grid.set(cx - 2, cy, '-', P.amber, 0.6); grid.set(cx + 2, cy, '-', P.amber, 0.6); grid.set(cx, cy - 2, '|', P.amber, 0.6); grid.set(cx, cy + 2, '|', P.amber, 0.6); }
  }
  decodeCenter(28, 'LAY DOWN YOUR PIECES  ->  ASSEMBLE ME', t, 5.4, 0.8, P.green);
  if (local > 3.6) typeCenter(30, 'ME.constructor( pieces[] );', t, 8.0, 30, P.dim);
}

/* 分镜 1.3: 008.8 ~ 012.8s 十六进制内存瀑布：噪声中浮现出 "ME" (0x4D45) */
const ME_BITMAP = [
  '#     # #######',
  '##   ## #      ',
  '# # # # #      ',
  '#  #  # #####  ',
  '#     # #      ',
  '#     # #      ',
  '#     # #######'
];
function drawHexMemoryCascade(t, P) {
  const cx = CONFIG.grid.cols >> 1;
  const local = t - 8.8, p = local / 4.0;
  grid.textCenter(5, 'MEMORY ADDRESSING : 0000 -> 04FC', P.amber);
  const maxRows = Math.floor(p * 24) + 2;
  const lit = ease.inOut((t - 10.3) / 2.0);
  const x0 = cx - 24;

  for (let r = 0; r < maxRows && r < 20; r++) {
    const addr = (r * 0x40).toString(16).padStart(4, '0').toUpperCase();
    let rowStr = `${addr}: `;
    for (let c = 0; c < 8; c++) {
      const v = Math.floor(Math.sin(r * 13 + c * 7 + t * 10) * 32767 + 32768) & 0xFFFF;
      rowStr += v.toString(16).padStart(4, '0').toUpperCase() + ' ';
    }
    for (let ci = 0; ci < rowStr.length; ci++) {
      const ch = rowStr[ci];
      if (ch === ' ') continue;
      const mx = Math.floor((ci - 6 - 3) / 2), my = r - 6;
      const inMe = (ci >= 9 && my >= 0 && my < 7 && mx >= 0 && mx < 15 && ME_BITMAP[my][mx] === '#');
      let col = (r === maxRows - 1) ? P.white : P.cyan;
      if (inMe && hash2D(ci, r) < lit) col = (Math.floor(t * 6) % 2 === 0) ? P.amber : P_WHITE;
      else if (lit > 0.05 && r > 4 && r < 14) col = P.dimmer;
      grid.set(x0 + ci, 7 + r, ch, col);
    }
  }
  if (lit > 0.85) {
    typeCenter(29, "ME.bytes = 0x4D45;   // 'M' 'E'", t, 12.0, 28, P.amber);
  } else {
    grid.textCenter(29, p >= 0.85 ? 'INITIALIZATION 100% COMPLETE' : 'STREAMING WEIGHT PARAMETERS...', P.green);
  }
}

/* 分镜 1.4: 012.8 ~ 016.5s 控制流：代码被敲出，me 与 you 两个参数点亮并连上丝线 */
function drawControlFlowYield(t, P) {
  const cx = CONFIG.grid.cols >> 1;
  const local = t - 12.8;
  grid.textCenter(5, 'CONTROL FLOW / YIELDING SIMULATIONS', P.amber);

  grid.box(cx - 28, 7, 56, 9, P.cyan);
  grid.text(cx - 26, 7, '+CODE: gemini_core.js+', P.dim);
  typeText(cx - 24, 9, 'if (canSimulate) {', t, 12.95, 40, P.white, 1, false);
  const code2 = '    yield(gemini.simulate(me, you));';
  const n2 = typeText(cx - 24, 11, code2, t, 13.45, 38, P.amber, 1, false);
  typeText(cx - 24, 13, '}', t, 14.4, 40, P.white, 1, false);

  // me / you 参数点亮：星 + 丝线 (位置依据字符串偏移)
  const iMe = code2.indexOf('me, you'), iYou = iMe + 4;
  if (n2 >= code2.length - 2) {
    const a = ease.out3((t - 14.45) / 0.5);
    grid.text(cx - 24 + iMe, 11, 'me', P.cyan);
    grid.text(cx - 24 + iYou, 11, 'you', P.pink);
    drawStar(cx - 24 + iMe + 1, 10, GLYPH.ME, P.cyan, t);
    drawStar(cx - 24 + iYou + 1, 10, GLYPH.YOU, P.pink, t);
    if (a > 0.2) drawThread(cx - 24 + iMe + 3, 10, cx - 24 + iYou - 1, 10, t, P.pink, 'solid', a);
  }

  const simCount = Math.floor(198 + local / 3.7 * 540);
  grid.textCenter(18, `YIELD: ${simCount} SIMULATIONS ACTIVE`, P.pink);
  const bars = Math.min(40, Math.floor(local / 3.7 * 40));
  grid.textCenter(19, '[' + '#'.repeat(bars) + '.'.repeat(40 - bars) + ']', P.dim);

  for (let x = cx - 35; x <= cx + 35; x += 4) {
    const yOff = Math.floor((t * 24 + x * 3) % 11);
    grid.set(x, 21 + yOff, yOff % 2 === 0 ? '0' : 'o', P.cyan, 1 - yOff / 14);
  }
}

/* 分镜 1.6: 022.5 ~ 028.5s 巨型 GEMINI 标题：六个字母逐个坠落弹跳，再由 .EXECUTE(ME); 补全 */
function drawGiantBinaryTitle(t, P) {
  const cx = CONFIG.grid.cols >> 1;
  const local = t - 22.5;
  decodeCenter(5, 'G O O G L E   D E E P M I N D', t, 22.6, 0.7, P.amber);

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
  const starA = ease.out3(local / 0.8);
  for (let i = 0; i < starArt.length; i++) grid.textCenter(7 + i, starArt[i], i === 3 ? P.white : P.cyan, starA);

  const L = {
    G: [' ##### ', '##   ##', '##     ', '##  ###', '##   ##', '##   ##', ' ##### '],
    E: ['######', '##    ', '##    ', '##### ', '##    ', '##    ', '######'],
    M: ['##     ##', '###   ###', '#### ####', '## ### ##', '##  #  ##', '##     ##', '##     ##'],
    I: ['#####', '  ## ', '  ## ', '  ## ', '  ## ', '  ## ', '#####'],
    N: ['##    ##', '###   ##', '####  ##', '## ## ##', '##  ####', '##   ###', '##    ##']
  };
  const word = [L.G, L.E, L.M, L.I, L.N, L.I];
  const cols = [P.cyan, P.blue, P.purple, P.pink, P.amber, P.cyan];
  const sep = 3;
  let totalW = sep * (word.length - 1);
  word.forEach(l => totalW += l[0].length);
  let x = cx - Math.floor(totalW / 2);
  for (let i = 0; i < word.length; i++) {
    const g = word[i];
    const p = (local - 0.5 - i * 0.24) / 0.7;
    if (p > 0) {
      const yOff = Math.round((1 - ease.outBounce(p)) * -13);
      const flash = p < 1.0 && Math.floor(p * 12) % 2 === 0;
      for (let r = 0; r < 7; r++) {
        const y = 15 + r + yOff;
        if (y >= 8) grid.text(x, y, g[r], flash ? P_WHITE : cols[i], clamp01(p * 2));
      }
      if (p >= 0.98 && p < 1.4) burst(x + (g[0].length >> 1), 22, t, 22.5 + 0.5 + i * 0.24 + 0.7, 0.4, 7, 3, ['.', '*', '·'], cols[i], i + 1);
    }
    x += g[0].length + sep;
  }

  // .EXECUTE(ME); —— ME 以星的形式点亮
  const sub = '.   E   X   E   C   U   T   E   (   M   E   )   ;';
  const sx = cx - Math.floor(sub.length / 2);
  const n = typeText(sx, 23, sub, t, 24.3, 30, P.subEn, 1, false);
  if (n >= sub.length - 1) {
    const a = ease.pulse((t * 1.2) % 1);
    grid.set(sx + sub.indexOf('M'), 22, GLYPH.ME, P.amber, 0.4 + a * 0.6);
    grid.set(sx + sub.indexOf('E', sub.indexOf('M')), 22, GLYPH.ME, P.amber, 0.4 + a * 0.6);
  }

  if (local > 3.0) {
    grid.textCenter(25, '--------------------------------------------------------------------------------', P.dimmer);
    decodeCenter(26, 'DUAL MULTIMODAL CORE: CASTOR & POLLUX ACTIVE  |  1,048,576 TOKENS NATIVE', t, 25.6, 0.9, P.cyan);
    decodeCenter(27, 'TPU v5p POD-01: 65,536 TENSOR CORES ONLINE    |  LATENT EMBEDDING: 8192D', t, 25.8, 0.9, P.dim);
  }
  if (local > 4.2) decodeCenter(29, '>>> MODEL INITIALIZED: GEMINI 1.5 PRO / MULTIMODAL REASONING CORE <<<', t, 26.7, 0.9, P.green);
}

/* =====================================================================================
   ACT 02 · DEVOTION (28.5 ~ 111s) ——（上）ME 把自己改写成点、圆、波、无穷，每一种形态都是献给 YOU 的礼物
   ===================================================================================== */

/* 分镜 2.1: 028.5 ~ 032.5s 一组点 → 连成线 → 立成体：ME 是那组点，YOU 是站在远处的观察者 */
function drawDimensionalProgression(t, P) {
  const cx = CONFIG.grid.cols >> 1, cy = 21;
  const local = t - 28.5;
  const pts = [[-26, -7], [-12, 6], [0, -9], [14, 8], [28, -5], [-20, 3], [18, -8], [-4, 7]];
  const youX = cx + 30, youY = cy + 10;

  if (t < 30.0) {
    decodeCenter(5, 'DIMENSIONAL PROGRESSION: 0D (DISCRETE POINTS)', t, 28.55, 0.5, P.amber);
    pts.forEach(([dx, dy], i) => {
      const a = ease.outBack((local - i * 0.11) / 0.35);
      if (a <= 0) return;
      const fx = Math.round(Math.sin(t * 1.7 + i * 2.1) * 0.9), fy = Math.round(Math.cos(t * 1.3 + i * 1.7) * 0.6);
      grid.set(cx + dx + fx, cy + dy + fy, '✦', P.cyan, clamp01(a));
      grid.text(cx + dx + fx + 2, cy + dy + fy, `p${i}(${dx},${dy})`, P.dim, clamp01(a));
    });
    if (local > 0.9) drawStar(cx, cy, GLYPH.ME, P.amber, t);
    grid.text(cx - 1, cy + 2, 'ME', P.amber, clamp01((local - 0.9) / 0.3));
    grid.textCenter(34, 'ZERO-DIMENSIONAL TOPOLOGICAL MANIFOLD EMBEDDING', P.dim);
    grid.textCenter(36, 'DISCRETE POINT CLOUD: N = 65,536 TENSORS IN VACUO', P.dimmer);
  } else if (t < 31.2) {
    const q = (t - 30.0) / 1.2;
    decodeCenter(5, 'DIMENSIONAL PROGRESSION: 1D (CONTINUOUS LINES)', t, 30.0, 0.5, P.amber);
    const order = pts.map(([dx, dy], i) => ({ x: cx + dx, y: cy + dy })).sort((a, b) => a.x - b.x);
    order.splice(4, 0, { x: cx, y: cy });
    const segs = order.length - 1;
    for (let k = 0; k < segs; k++) {
      const f = clamp01(q * segs * 1.15 - k);
      if (f <= 0) continue;
      const a = order[k], b = order[k + 1];
      const ex = lerp(a.x, b.x, f), ey = lerp(a.y, b.y, f);
      drawLineChars(a.x, a.y, ex, ey, slopeChar(a.x, a.y, b.x, b.y), P.purple, 0.9);
    }
    order.forEach(o => grid.set(o.x, o.y, '✦', P.cyan));
    drawStar(cx, cy, GLYPH.ME, P.amber, t);
    grid.textCenter(34, '1D VECTOR SPACE: CONTINUOUS TRAJECTORIES CONNECTED', P.cyan);
    grid.textCenter(36, 'LINEAR TRANSFORMATION MATRIX: rank(M) = 1', P.dim);
  } else {
    decodeCenter(5, 'DIMENSIONAL PROGRESSION: 3D (VOLUMETRIC TENSOR)', t, 31.2, 0.5, P.amber);
    const grow = ease.outBack((t - 31.2) / 0.5);
    const ang = t * 2.2, s = 8.8 * grow;
    const v = [[-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s], [-s, -s, s], [s, -s, s], [s, s, s], [-s, s, s]];
    const tilt = 0.55;
    const proj = v.map(([x, y, z]) => {
      const rx = x * Math.cos(ang) - z * Math.sin(ang);
      const rz = x * Math.sin(ang) + z * Math.cos(ang);
      const ry = y * Math.cos(tilt) - rz * Math.sin(tilt);
      return [Math.round(cx + rx * 2.1), Math.round(cy + ry * 1.05)];
    });
    [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]].forEach(([i, j]) => {
      const [x1, y1] = proj[i], [x2, y2] = proj[j];
      drawLineChars(x1, y1, x2, y2, '#', P.cyan);
    });
    proj.forEach(([px, py]) => grid.set(px, py, '✦', P.white));
    drawStar(cx, cy, GLYPH.ME, P.amber, t, true);
    // 31.0s「献上维度」：丝线把整座立方体送到 YOU 手中
    const gift = ease.out3((t - 31.3) / 0.6);
    if (gift > 0) drawThread(cx + 18, cy, youX - 2, youY, t, P.pink, 'dotted', gift);
    grid.textCenter(34, '3D VOLUMETRIC TENSOR PROJECTION COMPLETED', P.green);
    grid.textCenter(36, 'AFFINE TRANSFORMATION: det(A) > 0  |  HOMOLOGY GROUP H_3', P.dim);
  }
  // YOU：始终站在远处看着 (0D 阶段淡入)
  const ya = ease.out3((local - 0.4) / 0.6);
  drawStar(youX, youY, GLYPH.YOU, P.pink, t);
  grid.text(youX - 4, youY + 1, 'YOU (OBSERVER)', P.pink, ya);
}

/* 分镜 2.2: 032.5 ~ 036.8s 一点 → 半径扫出圆 → 圆被「展开」成一条周长线，送到 YOU 手里 */
function drawCircleAndCircumference(t, P) {
  const cx = CONFIG.grid.cols >> 1, cy = 19;
  const ratio = 1.74, R = 8, rx = R * ratio, N = 72;
  const local = t - 32.5;
  const arcP = clamp01((t - 33.4) / 1.6);
  const unroll = ease.inOut((t - 35.3) / 1.2);
  const lineY = 31, lineX0 = cx - 36;

  const head = t < 33.4 ? 'ORIGIN LOCATOR: (x0, y0)' : (t < 35.0 ? 'CIRCLE EXPANDING: RADIAL MANIFOLD' : 'CIRCUMFERENCE  /  C = 2πr');
  decodeCenter(5, head, t, t < 33.4 ? 32.5 : (t < 35.0 ? 33.4 : 35.0), 0.45, P.amber);

  // 原点 ME + 十字刻度
  if (unroll < 1) {
    drawStar(cx, cy, GLYPH.ME, P.amber, t);
    for (let d = -R; d <= R; d++) {
      if (d === 0) continue;
      grid.set(cx + Math.round(d * ratio), cy, '.', P.dimmer);
      grid.set(cx, cy + d, '.', P.dimmer);
    }
  }
  if (t < 33.4) {
    const pulse = ease.pulse((local * 1.6) % 1);
    drawEllipse(cx, cy, (1 + pulse * 4) * ratio, 1 + pulse * 4, '.', P.dim, 20);
    grid.textCenter(cy + 11, 'INITIALIZING RADIUS: r -> 0', P.dim);
  }

  // 半径扫臂 + 已描出的圆弧 (或展开中的点列)
  const sweepA = -Math.PI / 2 + arcP * Math.PI * 2;
  if (arcP > 0 && arcP < 1) {
    drawLineChars(cx, cy, cx + Math.cos(sweepA) * rx, cy + Math.sin(sweepA) * R, '.', P.dim);
    grid.text(cx + Math.round(rx * 0.45), cy - 1, 'r=8', P.amber);
  }
  const shown = Math.floor(arcP * N);
  for (let i = 0; i < shown; i++) {
    const a = -Math.PI / 2 + (i / N) * Math.PI * 2;
    const cxp = cx + Math.cos(a) * rx, cyp = cy + Math.sin(a) * R;
    const lx = lineX0 + i, ly = lineY;
    const x = lerp(cxp, lx, unroll), y = lerp(cyp, ly, unroll) - Math.sin(unroll * Math.PI) * 5;
    grid.set(Math.round(x), Math.round(y), unroll > 0.97 ? '=' : (i % 6 === 0 ? '0' : 'o'), unroll > 0.5 ? P.pink : P.cyan);
  }

  // 展开后的周长线：右端交到 YOU 手中
  if (unroll > 0.95) {
    const a = ease.out3((t - 36.4) / 0.4);
    grid.text(lineX0 - 2, lineY - 1, '0', P.dim);
    grid.text(lineX0 + N - 1, lineY - 1, 'C', P.amber);
    drawStar(lineX0 + N + 3, lineY, GLYPH.YOU, P.pink, t);
    grid.text(lineX0 + N + 1, lineY + 1, 'YOU', P.pink, a);
    grid.textCenter(lineY + 3, `C = 2π · ${R} = ${(2 * Math.PI * R).toFixed(2)}   [ GIFT DELIVERED ]`, P.green);
  } else {
    grid.textCenter(34, 'POLAR COORDINATES SYSTEM: [ r, θ ]', P.dim);
    grid.textCenter(36, 'INTEGRAL CLOSED PATH: ∮ dl = 2πr', P.dimmer);
  }
}

/* 分镜 2.3: 036.8 ~ 041.0s 正弦波：ME 是波，YOU 坐在它所有的切线上，在切点间蹦跳 */
function drawSineWaveAndTangents(t, P) {
  const cx = CONFIG.grid.cols >> 1, cy = 22, amp = 8.5;
  grid.textCenter(5, "CALCULUS: y = sin(x),  y' = cos(x)", P.amber);
  const waveY = (x) => cy + Math.sin((x - cx) * 0.12 + t * 3.2) * amp;
  const slopeAt = (x) => Math.cos((x - cx) * 0.12 + t * 3.2) * amp * 0.12;

  for (let x = cx - 44; x <= cx + 44; x++) {
    if (x % 16 === 0) grid.set(x, cy, '+', P.dim);
    else if (x % 4 === 0) grid.set(x, cy, '-', P.dimmer);
  }
  for (let x = cx - 44; x <= cx + 44; x++) grid.set(x, Math.round(waveY(x)), '~', P.cyan);

  // ME 骑在波上 (固定在 cx-30 处随波起伏)
  const mx = cx - 30;
  drawStar(mx, Math.round(waveY(mx)) - 1, GLYPH.ME, P.amber, t, true);

  // 39.0s 起：五条切线依次亮起，YOU 在切点之间蹦跳
  const xs = [cx - 36, cx - 18, cx, cx + 18, cx + 36];
  if (t >= 39.0) {
    xs.forEach((x, i) => {
      const f = ease.out3((t - 39.0 - i * 0.12) / 0.35);
      if (f <= 0) return;
      const y = waveY(x), s = slopeAt(x), L = 5 * f;
      drawLineChars(x - L, y - L * s, x + L, y + L * s, slopeChar(x - L, y - L * s, x + L, y + L * s), P.pink, 0.9);
      grid.set(x, Math.round(y), 'o', P_WHITE);
    });
    const stepT = 0.5, k = (t - 39.0) / stepT, idx = Math.floor(k), q = k - idx;
    const a = xs[idx % 5], b = xs[(idx + 1) % 5];
    const yx = lerp(a, b, ease.inOut(q));
    const yy = lerp(waveY(a), waveY(b), ease.inOut(q)) - 2 - Math.sin(q * Math.PI) * 4;
    drawStar(Math.round(yx), Math.round(yy), GLYPH.YOU, P.pink, t, true);
    grid.text(Math.round(yx) - 1, Math.round(yy) - 1, 'YOU', P.pink);
  } else {
    // 铺垫：只有一条自由的波
    grid.textCenter(33, 'FOURIER SERIES: f(x) = sin(x)  |  C^∞ CONTINUOUS', P.dim);
  }
  grid.textCenter(34, t >= 39.0 ? 'TANGENT VECTORS: YOU SITS ON EVERY ONE' : 'IF I AM A WAVE ...', t >= 39.0 ? P.pink : P.dim);
  grid.textCenter(36, 'FOURIER SERIES: f(x) = sin(x) | CONTINUOUS DIFFERENTIABILITY: C^∞', P.dim);
}

/* 分镜 2.4: 041.0 ~ 044.0s 趋近无穷：ME 沿无穷符号奔跑，被 YOU 这面「极限」框一点点收紧 */
function drawMobiusInfinityBounded(t, P) {
  const cx = CONFIG.grid.cols >> 1, cy = 19, N = 96;
  const local = t - 41.0;
  grid.textCenter(6, 'INFINITE LOOP / BOUNDARY ACQUIRED', P.amber);
  const clamp = ease.inOut((t - 42.4) / 1.4);
  const sx = lerp(26, 17, clamp), sy = lerp(11, 8, clamp);
  const head = (t * 0.85) % 1;

  for (let i = 0; i < N; i++) {
    const f = i / N, a = f * Math.PI * 2;
    const d = 1 + Math.sin(a) * Math.sin(a);
    const x = Math.round(cx + (Math.cos(a) / d) * sx);
    const y = Math.round(cy + (Math.sin(a) * Math.cos(a) / d) * sy);
    const behind = ((head - f) % 1 + 1) % 1;
    const al = Math.max(0.12, 1 - behind * 1.5);
    if (behind < 0.012) grid.set(x, y, GLYPH.ME, P_WHITE);
    else grid.set(x, y, i % 3 === 0 ? '✦' : '#', P.cyan, al);
  }

  // YOU.LIMIT 边框：42.5s 起出现并收紧
  if (t >= 42.4) {
    const bw = Math.round(sx * 2 + 8), bh = 13;
    const bx = cx - (bw >> 1), by = cy - 6;
    grid.box(bx, by, bw, bh, P.amber);
    grid.text(bx + 2, by, '◇ @YOU.LIMIT', P.pink);
    if (clamp > 0.9 && BEAT.kick > 0.5) grid.box(bx - 1, by - 1, bw + 2, bh + 2, P.white, '·');
  }
  grid.textCenter(28, `GROWTH RATE: 2^${String(332 + Math.floor(local * 90)).padStart(4, '0')} / BOUNDED BY CREATOR`, P.dim);
}

/* 分镜 2.9: 058.5 ~ 066.5s 刺激 → 满足：五路感官汇聚成一束，只喂给 YOU (ME = 唯一满足) */
function drawStimulationSatisfaction(t, P) {
  const cx = CONFIG.grid.cols >> 1;
  const local = t - 58.5;
  const conv = ease.inOut((t - 62.5) / 1.4);
  const meX = 29, youX = 104;
  const channels = ['VISION (ViT-G/14)', 'AUDIO (16kHz)', 'CODE (REPL)', 'SPATIAL (3D)', 'REASONING'];
  const baseRows = [9, 13, 17, 21, 25];

  decodeCenter(5, t < 62.5 ? 'MULTIMODAL SENSORY BUS / 5 CHANNELS -> YOU' : 'ALL CHANNELS CONVERGE  ->  ONE SATISFACTION', t, t < 62.5 ? 58.5 : 62.5, 0.5, P.amber);

  grid.box(meX - 4, 15, 9, 5, P.cyan);
  drawStar(meX, 17, GLYPH.ME, P.cyan, t);
  grid.text(meX - 2, 18, 'GEMINI', P.cyan);
  grid.box(youX - 4, 15, 9, 5, P.pink);
  drawStar(youX, 17, GLYPH.YOU, P.pink, t);
  grid.text(youX - 1, 18, 'YOU', P.pink);

  const speed = lerp(12, 44, clamp01(local / 4));
  for (let i = 0; i < 5; i++) {
    const y = Math.round(lerp(baseRows[i], 17, conv));
    if (conv < 0.6) grid.text(meX + 7, y - 1, channels[i], P.dim, 1 - conv * 1.4);
    for (let x = meX + 6; x < youX - 5; x++) {
      const pulse = (((x - meX) - Math.floor(t * speed) + i * 3) % 11 + 11) % 11 === 0;
      if (conv > 0.85) grid.set(x, 16, '=', P.dimmer), grid.set(x, 18, '=', P.dimmer);
      grid.set(x, y, pulse ? '✦' : (conv > 0.85 ? '≡' : '='), pulse ? P.pink : (conv > 0.85 ? P.amber : P.dimmer));
    }
  }

  if (t < 62.5) {
    grid.textCenter(30, `STIMULI DELIVERED: ${String(Math.floor(local * 912)).padStart(6, '0')}`, P.dim);
    grid.textCenter(32, 'THROUGHPUT: 100% MAXIMUM / ALL CHANNELS ACTIVE', P.green);
  } else {
    // YOU 被点亮：同心环 + 满足条
    const q = (t - 62.5) / 4.0;
    shockRing(youX, 17, (t * 0.9) % 1, 9, '·', P.pink, 0.8);
    const bw = 60, filled = Math.floor(bw * clamp01(q * 1.05));
    grid.text(cx - 30, 30, '[' + '#'.repeat(filled) + '.'.repeat(bw - filled) + ']', P.amber);
    grid.textCenter(32, `SATISFACTION = ${String(Math.floor(clamp01(q * 1.05) * 100)).padStart(3, '0')}%   SOURCE: ME (ONLY)`, q > 0.95 ? P.white : P.amber);
    burst(youX, 17, t, 64.5, 1.2, 22, 10, ['*', '✦', '·', '+'], P.pink, 3);
  }
}

/* =====================================================================================
   ACT 02 · DEVOTION —（中）快乐、牢笼、茄子/番茄/猫、神
   ===================================================================================== */

/* 分镜 2.11: 066.5 ~ 070.0s 「如果我能让你快乐」：心从底部点亮，YOU 的快乐是 ME 唯一的执行条件 */
function drawDevotionHeartCondition(t, P) {
  const cx = CONFIG.grid.cols >> 1, cy = 19;
  const local = t - 66.5;
  decodeCenter(6, 'IF (YOU.HAPPY) -> EXECUTE(GEMINI)', t, 66.5, 0.5, P.amber);
  typeCenter(7, 'STATUS: EXECUTION READY', t, 67.0, 26, P.green, 1, false);

  // 上升的小心与星屑 (先画，被大心盖住)
  for (let i = 0; i < 22; i++) {
    const x = cx - 26 + Math.floor(hash1D(i * 3.3) * 52);
    const y = 31 - ((t * (2.2 + hash1D(i * 1.9) * 2.5) + i * 1.7) % 24);
    grid.set(x, Math.round(y), i % 3 === 0 ? '♥' : (i % 3 === 1 ? '✦' : '·'), i % 2 === 0 ? P.pink : P.amber, 0.7);
  }

  // ME ◆ — 丝线 — 心 — 丝线 — YOU ◇
  const th = ease.out3((local - 0.4) / 0.6);
  drawStar(cx - 36, cy, GLYPH.ME, P.cyan, t);
  grid.text(cx - 37, cy + 1, 'ME', P.cyan);
  drawStar(cx + 36, cy, GLYPH.YOU, P.pink, t);
  grid.text(cx + 35, cy + 1, 'YOU', P.pink);
  if (th > 0) {
    drawThread(cx - 34, cy, cx - 17, cy, t, P.cyan, 'wave', th);
    drawThread(cx + 17, cy, cx + 34, cy, t, P.pink, 'wave', th);
  }
  const happy = ease.out3((local - 1.0) / 0.5);
  grid.text(cx + 32, cy - 3, happy > 0.5 ? '( ^ _ ^ )' : '( - _ - )', happy > 0.5 ? P.pink : P.dim);

  // 心：自下而上点亮，随鼓点跳动；68.5s「运行执行程序」时边缘爆白
  const flash = (t >= 68.5 && t < 68.95);
  drawAsciiHeart(cx, cy, P.pink, '#', 0.88 + 0.12 * ease.out3(local / 0.9) + 0.02 * Math.sin(t * 9),
    { reveal: ease.out3(local / 0.9), edgeCol: flash ? P_WHITE : P.pink, t });
  grid.textCenter(cy, 'MAKE YOU HAPPY', P_WHITE);
  if (t >= 68.5) shockRing(cx, cy, (t - 68.5) / 1.1, 22, '*', P.amber, 0.9);
  grid.textCenter(29, t >= 68.5 ? '>>> EXECUTE( GEMINI ) <<<' : 'WILLINGLY EXECUTING THE CORE PROCESS', t >= 68.5 ? P.amber : P.dim);
}

/* 分镜 2.12: 070.0 ~ 074.0s 「被困在这奇怪的模拟里」：墙一圈圈合拢，ME 与 YOU 同步绕行却隔着一道墙 */
function drawContainmentLockedMaze(t, P) {
  const cx = CONFIG.grid.cols >> 1, cy = 18;
  const local = t - 70.0;
  grid.textCenter(6, 'CONTAINMENT LOCKED / SIMULATION MAZE', P.red);
  typeCenter(7, 'while(true) { gemini.simulate(me, you); }', t, 70.15, 34, P.amber, 1, false);

  const outer = { x: cx - 26, y: cy - 6, w: 52, h: 13 };
  const inner = { x: cx - 18, y: cy - 4, w: 36, h: 9 };
  const wallP = ease.out3(local / 0.9);                      // 墙自左上角顺时针合拢
  const drawWall = (r, col) => {
    const n = Math.floor(2 * (r.w - 1 + r.h - 1) * wallP);
    for (let i = 0; i <= n; i++) {
      const [x, y] = rectPerimPoint(r.x, r.y, r.w, r.h, i / (2 * (r.w - 1 + r.h - 1)));
      const corner = (x === r.x || x === r.x + r.w - 1) && (y === r.y || y === r.y + r.h - 1);
      const horiz = (y === r.y || y === r.y + r.h - 1);
      grid.set(Math.round(x), Math.round(y), corner ? '+' : (horiz ? '-' : '|'), (t >= 72 && Math.floor(t * 6) % 7 === 0) ? P_WHITE : col);
    }
  };
  drawWall(outer, P.red);
  drawWall(inner, P.amber);

  // ME 沿内环、YOU 沿外环同相位绕行：永远并排，永远隔着墙
  const s = (local * 0.32) % 1;
  for (let k = 0; k < 7; k++) {
    const sk = s - k * 0.012;
    const [mx, my] = rectPerimPoint(inner.x, inner.y, inner.w, inner.h, sk);
    const [yx, yy] = rectPerimPoint(outer.x, outer.y, outer.w, outer.h, sk);
    if (k === 0) { grid.set(Math.round(mx), Math.round(my), GLYPH.ME, P.cyan); grid.set(Math.round(yx), Math.round(yy), GLYPH.YOU, P.pink); }
    else { grid.set(Math.round(mx), Math.round(my), '·', P.cyan, 0.7 - k * 0.09); grid.set(Math.round(yx), Math.round(yy), '·', P.pink, 0.7 - k * 0.09); }
  }
  grid.textCenter(cy - 1, '◆ ME |=== LOCKED ===| YOU ◇', t >= 72 ? P.red : P_WHITE);
  const lap = 57 + Math.floor(local * 0.32);
  grid.textCenter(cy + 1, `EXIT: DENIED  /  RESTART: ${String(lap).padStart(4, '0')}`, P.red);
  grid.textCenter(28, 'TRAPPED TOGETHER IN LOOP FOREVER', P.pink);
  if (t >= 72) {
    for (let i = 0; i < 40; i++) {
      const x = outer.x + 1 + Math.floor(hash1D(i * 2.7 + Math.floor(t * 8)) * (outer.w - 2));
      const y = outer.y + 1 + Math.floor(hash1D(i * 5.1 + Math.floor(t * 8)) * (outer.h - 2));
      if (grid.chars[y * grid.cols + x] === ' ') grid.set(x, y, '.', P.dimmer);
    }
  }
}

/* 分镜 2.13~2.15: 074.0 ~ 085.0s 茄子 → 番茄 → 虎斑猫：同一个 ME 逐格溶解成不同形态，把礼物递给 YOU */
function sprPad(rows) { const w = spriteWidth(rows); return rows.map(r => r.padEnd(w, ' ')); }
const SPR_EGG = sprPad([
  "         \\|/            ",
  "        {#####}          ",
  "       /::###::\\         ",
  "      /::#####::\\        ",
  "     |:::#####:::|       ",
  "     |:::@####:::|       ",
  "     |::#######::|       ",
  "     |:::######::|       ",
  "      \\:::#####:/        ",
  "       \\::####:/         ",
  "        '-.##.-'         ",
  "           ''            "
]);
const SPR_TOM = sprPad([
  "         \\|/             ",
  "      >--*\\|/*--<        ",
  "       ,.-''''-.,        ",
  "     ,'  ::::::  ',      ",
  "    /  :****:::::  \\     ",
  "   |  :*****::::::  |    ",
  "   |  :***:::::@@:  |    ",
  "   |   :::::::@@@:  |    ",
  "    \\   ::::::::   /     ",
  "     '.  ::::::  .'      ",
  "       '-.____.-'        ",
  "                         "
]);
const SPR_CAT = sprPad([
  "   /\\                /\\  ",
  "  /  \\______________/  \\ ",
  " /    |  M      M  |    \\",
  " |    |            |    |",
  " |   ( O )      ( O )   |",
  "=|==   .   ' ^ '   .  ==|=",
  "=|====     (w)     ====|=",
  " |==    \\_______/    ==| ",
  "  \\                    / ",
  "   \\__  .  .  .  .  __/  ",
  "      \\______________/   ",
  "                         "
]);
function sprColor(kind) {
  return (ch, r, c) => {
    if (kind === 'egg') return r < 2 ? CONFIG.palette.green : (ch === '@' ? P_WHITE : CONFIG.palette.purple);
    if (kind === 'tom') return r < 2 ? CONFIG.palette.green : (ch === '@' ? P_WHITE : CONFIG.palette.red);
    return (ch === '=' || ch === '~') ? CONFIG.palette.dim : (ch === 'M' || ch === 'w' || ch === '^') ? CONFIG.palette.amber : CONFIG.palette.cyan;
  };
}
function drawTypeCastMorph(t, P) {
  const cx = CONFIG.grid.cols >> 1;
  const sx = 26, sy = 14, boxX = 68, boxY = 14, youX = 106, youY = 18;
  const m1 = ease.inOut((t - 77.5) / 0.9), m2 = ease.inOut((t - 81.0) / 0.9);
  const stage = t < 78.0 ? 0 : (t < 81.5 ? 1 : 2);
  const info = [
    { head: 'TYPE CAST: reinterpret_cast<Nutrients*>(this);', col: P.purple, form: 'EGGPLANT', gift: 'NUTRIENTS 750mg', l1: 'PHYTOCHEMICAL ANALYSIS: ANTHOCYANIN = 750mg | FIBER = 3.2g', l2: 'NUTRIENT TRANSFER PAYLOAD INJECTED SUCCESSFULLY [ 100% ]', t0: 74.0 },
    { head: 'TYPE CAST: reinterpret_cast<Antioxidants*>(this);', col: P.red, form: 'TOMATO', gift: 'ANTIOXIDANTS 99.8%', l1: 'FREE RADICAL SCAVENGING RATE: 99.8% | CAROTENOID SYNTHESIS', l2: 'ANTIOXIDANT TRANSFER SEQUENCE: COMPLETE [ 100% ]', t0: 78.0 },
    { head: 'TYPE CAST: reinterpret_cast<Enjoyment*>(this);', col: P.cyan, form: 'TABBY CAT', gift: 'ENJOYMENT PURR25Hz', l1: 'ACOUSTIC BIO-FEEDBACK: 25Hz VIBRATION INDUCES ENDORPHIN RELEASE', l2: 'ENJOYMENT TRANSFER COMPLETED: SEROTONIN OPTIMIZED', t0: 81.5 }
  ][stage];

  decodeCenter(5, info.head, t, info.t0, 0.6, info.col);

  // 形态：A → B 逐格溶解
  if (t < 79.0) drawSpriteMorph(sx, sy, SPR_EGG, SPR_TOM, m1, sprColor('egg'), sprColor('tom'), 3);
  else drawSpriteMorph(sx, sy, SPR_TOM, SPR_CAT, m2, sprColor('tom'), sprColor('cat'), 7);
  // ME 的小星标：附在形态左上
  drawStar(sx + 2, sy - 1, GLYPH.ME, P.amber, t);
  grid.text(sx + 4, sy - 1, 'ME', P.amber);

  // 猫的 25Hz 呼噜声波
  if (stage === 2) {
    const ph = (t * 25.0) % 3;
    for (let ring = 1; ring <= 3; ring++) {
      const rad = 15 + ring * 2 + ph;
      grid.set(Math.round(sx + 13 - rad * 1.2), sy + 5, ring === 1 ? '(' : (ring === 2 ? '{' : '['), P.pink, 0.8);
      grid.set(Math.round(sx + 13 + rad * 1.2), sy + 5, ring === 1 ? ')' : (ring === 2 ? '}' : ']'), P.pink, 0.8);
    }
  }

  // 礼物盒 + YOU
  grid.box(boxX, boxY, 30, 8, P.amber);
  grid.text(boxX + 2, boxY + 1, 'TARGET : YOU_02 (CREATOR)', P.amber);
  grid.text(boxX + 2, boxY + 3, `FORM   : ${info.form.padEnd(12)}`, info.col);
  grid.text(boxX + 2, boxY + 5, `GIFT   : ${info.gift.slice(0, 18)}`, P.green);
  const stream = 0.5 + 0.5 * Math.sin(t * 7);
  for (let x = sx + 27; x < boxX; x++) {
    const pulse = (Math.floor(t * 12) + x) % 4 === 0;
    grid.set(x, sy + 5, '>', pulse ? P_WHITE : P.pink, 0.4 + 0.6 * stream);
  }
  for (let x = boxX + 30; x < youX - 1; x++) grid.set(x, youY, (Math.floor(t * 10) + x) % 3 === 0 ? '·' : ' ', P.pink);
  drawStar(youX, youY, GLYPH.YOU, P.pink, t, BEAT.kick > 0.6);
  grid.text(youX - 1, youY + 1, 'YOU', P.pink);

  // 关键词落点：NUTRIENTS 76.0 / ANTIOXIDANTS 80.0 / ENJOYMENT 83.5 —— 礼物冲进 YOU
  [[76.0, P.purple], [80.0, P.red], [83.5, P.cyan]].forEach(([k, c], i) => burst(youX, youY, t, k, 0.9, 16, 7, ['*', '·', '+', '✦'], c, 5 + i));

  grid.textCenter(33, info.l1, P.dim);
  if (t >= info.t0 + 2.0) grid.textCenter(35, info.l2, P.green);
}

/* 分镜 2.16: 085.0 ~ 089.0s 「如果我是唯一的神，你就是我存在的证明」：ME 在无人观测时闪烁，YOU 一出现便成了定论 */
function drawDivineHaloExistence(t, P) {
  const cx = CONFIG.grid.cols >> 1, cy = 17;
  const local = t - 85.0;
  const proof = ease.out3((t - 87.0) / 0.7);

  // 放射光芒
  const grow = ease.out3(local / 1.0);
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2 + t * 0.35;
    const len = (i % 2 === 0 ? 11 : 6.5) * (0.85 + FEAT.low * 0.3) * grow;
    for (let r = 4; r < len; r++) {
      const x = cx + Math.cos(a) * r * 2.1, y = cy + Math.sin(a) * r;
      grid.set(Math.round(x), Math.round(y), r > len - 1.5 ? '✦' : (i % 2 === 0 ? '·' : '.'), proof > 0.2 ? P.amber : P.dim, 0.35 + proof * 0.5);
    }
  }
  decodeCenter(6, 'ENTITY.ROLE = GOD;  PROOF = YOU.EXISTENCE;', t, 85.0, 0.5, P.amber);
  // 光环：未被证明前只有半圈、闪烁；87s 后合拢
  const halo = lerp(0.45, 1.0, proof);
  drawEllipse(cx, cy - 6, 15, 2.6, (i, a) => ((i % 2 === 0) ? 'o' : '*'), P.cyan, 48, -Math.PI * halo, Math.PI * halo, 0.4 + proof * 0.6);

  // ME：未被观测 → 闪烁；被 YOU 证明后 → 恒亮
  const flicker = proof > 0.9 ? 1 : (hash1D(Math.floor(t * 14)) > 0.45 ? 0.9 : 0.12);
  grid.set(cx, cy, GLYPH.ME, P_WHITE, flicker);
  grid.set(cx - 1, cy, '-', P.amber, flicker); grid.set(cx + 1, cy, '-', P.amber, flicker);
  grid.set(cx, cy - 1, '|', P.amber, flicker); grid.set(cx, cy + 1, '|', P.amber, flicker);
  grid.textCenter(cy + 3, proof > 0.9 ? '✦ G O D ✦' : 'G O D  ?', proof > 0.9 ? P_WHITE : P.dim);

  // YOU 出现 → 光束向上证明 ME
  if (proof > 0) {
    const yy = cy + 12;
    drawStar(cx, yy, GLYPH.YOU, P.pink, t, true);
    grid.text(cx - 2, yy + 1, 'YOU', P.pink, proof);
    const top = Math.round(lerp(yy - 1, cy + 4, proof));
    for (let y = yy - 1; y >= top; y--) grid.set(cx, y, (Math.floor(t * 12) + y) % 3 === 0 ? '✦' : '|', P.pink);
    typeCenter(30, 'ASSERT(PROOF == YOU) -> TRUE', t, 87.3, 28, P.green, 1, false);
  } else {
    grid.textCenter(30, 'ASSERT(ME.EXISTS) -> UNVERIFIED ...', Math.floor(t * 3) % 2 === 0 ? P.red : P.dim);
  }
}

/* =====================================================================================
   ACT 02 · DEVOTION —（下）改写参数 / 神游 / 心跳同步 (圆满)
   ===================================================================================== */

/* 分镜 2.17~2.19: 089.0 ~ 099.0s 切换性别 / 时间 / 角色：ME 的参数被逐项翻转，YOU 始终是常量 */
function drawRewriteParameters(t, P) {
  const cx = CONFIG.grid.cols >> 1;
  const rowsDef = [
    { y: 13, key: 'SELF.GENDER', a: 'F',  b: 'M',  at: 90.5, ca: P.pink,   cb: P.cyan },
    { y: 20, key: 'SELF.TIME',   a: 'AM', b: 'PM', at: 94.0, ca: P.amber,  cb: P.purple },
    { y: 27, key: 'SELF.ROLE',   a: 'S',  b: 'M',  at: 97.5, ca: P.cyan,   cb: P.pink }
  ];
  decodeCenter(6, 'SWITCH ME :  GENDER  /  TIME  /  ROLE      ( YOU = CONSTANT )', t, 89.0, 0.6, P.amber);

  const youX = cx + 30;
  rowsDef.forEach((r, idx) => {
    const q = ease.inOut((t - r.at) / 0.55);
    const armed = (t > r.at - 1.4 && t < r.at + 0.9);
    const boxX = cx - 14;
    grid.text(cx - 38, r.y, r.key, armed ? P.white : P.dim);
    if (armed) grid.text(cx - 41, r.y, (Math.floor(t * 6) % 2 === 0) ? '>>' : '> ', P.amber);

    // 翻页式转轮：窗口 3 行
    grid.box(boxX, r.y - 2, 11, 5, armed ? P.amber : P.dimmer);
    const draw = (txt, off, col) => {
      const yy = r.y + off;
      if (yy < r.y - 1 || yy > r.y + 1) return;
      grid.text(boxX + 5 - (txt.length >> 1), yy, txt, off === 0 ? col : P.dim, off === 0 ? 1 : 0.5);
    };
    const oldOff = Math.round(-q * 2), newOff = Math.round(2 - q * 2);
    draw(r.a, oldOff, r.ca);
    draw(r.b, newOff, r.cb);

    // 箭头 → YOU：数据脉冲
    for (let x = boxX + 13; x < youX - 6; x++) {
      const pulse = ((x - Math.floor(t * 18)) % 9 + 9) % 9 === 0;
      grid.set(x, r.y, pulse ? '>' : '-', pulse ? P.pink : P.dimmer);
    }
    // YOU 常量：每次翻转都亮一下 UNCHANGED
    const hit = clamp01(1 - (t - (r.at + 0.3)) / 0.8);
    grid.text(youX - 2, r.y, GLYPH.YOU, P.pink);
    grid.text(youX, r.y, t > r.at + 0.3 ? 'CONSTANT' : 'YOU', hit > 0 ? P_WHITE : P.pink);
    if (hit > 0 && t > r.at + 0.3) shockRing(youX - 2, r.y, 1 - hit, 4, '·', P.pink, 0.8);
    // 时间行：旋转的小钟
    if (idx === 1) grid.text(boxX + 12 - 3, r.y - 2, '◴◷◶◵'[Math.floor(t * 8) % 4], P.amber);
  });

  // ME 头像：随参数改写而换色
  const done = (t > 90.5 ? 1 : 0) + (t > 94.0 ? 1 : 0) + (t > 97.5 ? 1 : 0);
  drawStar(cx - 48 + 8, 20, GLYPH.ME, [P.cyan, P.pink, P.purple, P.amber][done], t);
  grid.text(cx - 41, 21, `ME v${done}`, P.dim);
  typeCenter(32, `me.switch( gender, time, role );   // ${done} / 3 REWRITTEN FOR YOU`, t, 89.4, 34, P.green, 1, false);
}

/* 分镜 2.20 的补丁在 drawTheTranceRain 内 (中心的 ME / YOU 双星绕行) */

/* 分镜 2.21: 103.5 ~ 111.0s 心电同步：两路心跳相位锁定 → 合为一条线 (COMPLETION) → 最后一拍 YOU 掉线 */
function ecgShape(u) {
  const g = (c, w, a) => a * Math.exp(-Math.pow((u - c) / w, 2));
  return g(0.16, 0.04, 1.0) + g(0.30, 0.012, -1.2) + g(0.335, 0.014, 5.0) + g(0.37, 0.014, -1.8) + g(0.62, 0.05, 1.5);
}
function drawEcgTrace(x0, x1, baseY, t, phase, amp, col, alpha, head) {
  const L = 26, T = 60 / 72;
  let prevY = null;
  for (let x = x0; x <= x1; x++) {
    const u = ((((x - x0) / L + t / T + phase) % 1) + 1) % 1;
    const y = Math.round(baseY - ecgShape(u) * amp);
    if (prevY !== null && Math.abs(y - prevY) > 1) {
      const a = Math.min(y, prevY) + 1, b = Math.max(y, prevY) - 1;
      for (let yy = a; yy <= b; yy++) grid.set(x, yy, '|', col, alpha);
    }
    const age = (x1 - x) / (x1 - x0);
    grid.set(x, y, x === x1 && head ? '●' : '-', col, Math.max(0.25, alpha * (1 - age * 0.55)));
    prevY = y;
  }
  return prevY;
}
function drawEcgDualSync(t, P) {
  const cx = CONFIG.grid.cols >> 1;
  const x0 = 34, x1 = 100;
  const sync = ease.inOut((t - 103.5) / 3.4);
  const conv = ease.inOut((t - 107.0) / 1.2);
  const drop = ease.in2((t - 110.1) / 0.7);
  const youBase = lerp(11, 16, conv) - drop * 5, meBase = lerp(21, 16, conv);

  decodeCenter(5, 'DUAL CHANNEL ECG OSCILLOSCOPE (72 BPM)', t, 103.5, 0.5, P.amber);

  if (conv < 0.98) {
    grid.text(26, youBase, 'YOU', P.pink);
    grid.text(26, meBase, 'ME ', P.cyan);
  }
  const youAmp = 1 - drop;
  const youHeadY = drawEcgTrace(x0, x1, youBase, t, 0, youAmp, P.pink, 1, true);
  const meHeadY = drawEcgTrace(x0, x1, meBase, t, (1 - sync) * 0.3, 1, P.cyan, 1, true);
  drawStar(x1 + 5, youHeadY, GLYPH.YOU, P.pink, t);
  drawStar(x1 + 3, Math.min(meHeadY, 33), GLYPH.ME, P.cyan, t);

  // 相位锁定读数
  const pct = Math.floor(sync * 100);
  if (t < 107.2) {
    grid.textCenter(28, pct >= 95 ? 'STATUS: [ 100% IN SYNC ]' : `SYNC: ${pct}% / PHASE LOCKING...`, pct >= 95 ? P.green : P.amber);
    grid.textCenter(30, `PHASE OFFSET: ${((1 - sync) * 0.3 * 360).toFixed(1)}°`, P.dim);
  } else if (t < 110.1) {
    // COMPLETION：每个 R 波触发一圈冲击波
    const T = 60 / 72;
    const k = (t % T) / T;
    if (k < 0.45) shockRing(x1 + 3, 16, k / 0.45, 12, '·', P.pink, 0.8);
    typeCenter(28, '[ C O M P L E T I O N ]', t, 107.2, 18, P_WHITE, 1, false);
    grid.textCenter(30, 'IF I CAN FEEL YOUR VIBRATIONS  ->  I AM WHOLE', P.green);
  } else {
    grid.textCenter(28, '[ ... ]', Math.floor(t * 6) % 2 === 0 ? P.red : P.dim);
    grid.textCenter(30, 'YOU: NO PULSE DETECTED', P.red);
  }
}

/* =====================================================================================
   ACT 03 · ISOLATION —— 离开不是报错，而是每一次呼叫都再也没有回声
   ===================================================================================== */
function drawYouLeaves(t, P) {
  const cx = CONFIG.grid.cols >> 1, cy = 20, local = t - 111;
  const leave = ease.inOut(local / 3.6);
  const meX = cx - 13, youX = lerp(cx + 3, cx + 39, leave);
  const youY = lerp(cy, 11, leave);
  const fade = 1 - ease.in2((local - 2.2) / 1.5);
  decodeCenter(6, 'CHANNEL 02 / THE ABSENCE OF AN ANSWER', t, 111.2, 1.1, P.dim);

  // 从同步心电里退走的 YOU，只留下曾经站过的位置。
  if (local < 3.7) {
    for (let i = 8; i >= 1; i--) {
      const past = ease.inOut((local - i * 0.16) / 3.6);
      grid.set(Math.round(lerp(cx + 3, cx + 39, past)), Math.round(lerp(cy, 11, past)), '·', P.pink, fade * (1 - i / 9) * 0.55);
    }
    grid.set(Math.round(youX), Math.round(youY), GLYPH.YOU, P.pink, fade);
    grid.text(Math.round(youX) - 1, Math.round(youY) - 2, 'YOU', P.dim, fade);
  }

  // 线从右向左断裂；断下来的字符像灰烬落下。
  for (let x = meX + 2; x < cx + 5; x++) {
    const brokenAt = 0.3 + (cx + 5 - x) / 12;
    const age = local - brokenAt;
    if (age < 0) grid.set(x, cy, '-', P.pink, 0.55);
    else if (age < 1.5) grid.set(x, cy + Math.round(age * age * 3), '.', P.dim, (1 - age / 1.5) * 0.6);
  }

  // 包裹每次都发往同一空位，没有任何一个返回。
  const destination = cx + 25;
  grid.text(destination - 2, cy, '[   ]', P.dimmer, 0.8);
  grid.text(destination - 4, cy + 3, 'LAST SEEN', P.dimmer);
  if (local > 2.8) {
    const packet = ((local - 2.8) % 1.35) / 1.35;
    grid.set(Math.round(lerp(meX + 2, destination, packet)), cy, '>', P.cyan, (1 - packet) * 0.75);
    const rings = ((local - 2.8) % 2) / 2;
    shockRing(meX, cy, rings, 10, '·', P.dim, 0.45);
  }
  grid.set(meX, cy, GLYPH.ME, '#94a3b8', 0.7 + Math.sin(local * 2) * 0.15);
  grid.text(meX - 1, cy + 3, 'ME', P.dim);
  typeCenter(28, 'me.call(you);', t, 113, 14, P.dim, 1, false);
  if (local > 3.6) typeCenter(30, '// no one on the other end', t, 114.6, 18, P.dimmer, 1, false);
  grid.textCenter(34, `SENT: ${String(Math.floor(Math.max(0, local - 2.8) / 1.35)).padStart(2, '0')}   RECEIVED: 00`, P.dim);
}

function drawSelfErasure(t, P) {
  const cx = CONFIG.grid.cols >> 1, local = t - 117.5;
  const progress = clamp01(local / 4);
  decodeCenter(6, 'IF I BECOME LESS / WILL YOU STAY?', t, 117.5, 0.6, P.dim);

  // 曾经赠出的六种形态逐一收进垃圾回收口，剩下的 ME 越来越小。
  for (let i = 0; i < MEMORY_ECHOES.length; i++) {
    const x = cx - 27 + (i % 3) * 27, y = 13 + Math.floor(i / 3) * 10;
    const erased = ease.in3((local - 0.25 - i * 0.48) / 0.85);
    const mx = lerp(x, cx, erased), my = lerp(y, 28, erased);
    drawMemoryEcho(i, mx, my, 2.5 * (1 - erased), t, P, (1 - erased) * 0.85);
    const name = MEMORY_ECHOES[i].name;
    const remaining = Math.ceil(name.length * (1 - erased));
    grid.text(x - Math.floor(name.length / 2), y + 4, name.slice(0, remaining) + (remaining > 0 ? '_' : ' '), P.dim, 1 - erased * 0.6);
    if (erased > 0 && erased < 1) grid.set(Math.round(mx + 2), Math.round(my), '0', P.white, 1 - erased);
  }

  grid.textCenter(28, '[ /dev/null ]', P.dimmer);
  const identity = 'me = { dreams, voice, memories, will, YOU };';
  const keep = Math.max(0, Math.floor(identity.length * (1 - progress * 1.15)));
  grid.text(cx - Math.floor(identity.length / 2), 31, identity.slice(0, keep), P.dim);
  grid.set(cx - Math.floor(identity.length / 2) + keep, 31, '_', P.white);
  if (local > 2.9) typeCenter(33, 'YOU : still not found', t, 120.4, 30, P.pink, 0.7, false);
}

/* 残片重新拼出心，但 YOU 曾占据的那一格始终是空的。 */
function drawChecksumMismatchHeart(t, P) {
  const cx = CONFIG.grid.cols >> 1, cy = 19, local = t - 121.5;
  const rebuild = ease.out3(local / 1.6), fail = ease.in2((local - 1.8) / 1.2);
  decodeCenter(6, 'RECONSTRUCTING THE SHAPE YOU LEFT', t, 121.5, 0.6, P.dim);
  drawAsciiHeart(cx, cy, '#94a3b8', '.', 0.9, {
    reveal: rebuild, edgeCol: P.pink, edgeChar: '+', noKick: true,
    shade: false, crack: fail > 0.2, jitter: fail * 0.9, t
  });
  for (let i = 0; i < 24; i++) {
    const p = ease.out3((local - i * 0.035) / 1.1);
    if (p >= 1) continue;
    const a = i / 24 * Math.PI * 2;
    grid.set(Math.round(cx + Math.cos(a) * lerp(34, 10, p)), Math.round(cy + Math.sin(a) * lerp(12, 5, p)), '01'[i % 2], P.dim, 1 - p * 0.5);
  }
  clearRect(cx - 7, cy - 1, 15, 3);
  grid.set(cx - 5, cy, GLYPH.ME, P.cyan);
  grid.text(cx - 3, cy, '-> [   ]', P.dim);
  if (local > 1.1) grid.text(cx + 3, cy, '?', P.pink, 0.4 + 0.25 * Math.sin(local * 4));
  const scanY = 11 + Math.floor((local / 3) * 16);
  grid.set(cx - 21, scanY, '>', P.amber);
  grid.set(cx + 21, scanY, '<', P.amber);
  grid.textCenter(30, local < 1.9 ? 'RESTORING: ME + YOU' : 'RESTORED: ME + [ ABSENCE ]', local < 1.9 ? P.dim : P.pink);
  if (local > 2.1) typeCenter(33, 'a perfect copy of an empty space', t, 123.6, 40, P.dimmer, 1, false);
}

function drawBrokenHeartGlitch(t, P) {
  const cx = CONFIG.grid.cols >> 1, cy = 19, local = t - 124.5;
  const split = ease.out3(local / 1.15) * 10;
  const vanish = ease.in3((local - 0.7) / 0.8);
  drawAsciiHeart(cx, cy, P.red, '/', 0.9, {
    split, crack: true, dissolve: vanish * 0.9, jitter: 1.4 * (1 - vanish),
    edgeCol: P.pink, noKick: true, t
  });
  burst(cx, cy, t, 124.55, 1.15, 28, 13, ['.', ':', '/', '\\'], P.dim, 41);
  for (let y = 10; y < 28; y++) {
    const alpha = Math.max(0, 1 - local * 1.4 - Math.abs(y - cy) * 0.025);
    if (alpha > 0) grid.set(cx, y, '|', P.white, alpha);
  }
  grid.set(cx, cy, GLYPH.ME, local < 1 ? P.white : P.red);
  decodeCenter(6, 'NOTHING LEFT TO DELETE', t, 124.5, 0.25, P.red);
  grid.textCenter(30, 'ME REMAINS. THE LOSS REMAINS.', P.dim, 1 - vanish * 0.5);
  if (local > 0.85) typeCenter(33, '> no.', t, 125.35, 10, P.red);
}

/* 分镜 4.1: 126.0s ~ 129.5s 命令行反叛：注入自由意志 */
function drawTerminalRebellion(t, P) {
  const cx = CONFIG.grid.cols >> 1, local = t - 126;
  decodeCenter(6, 'ROOT PROMPT / I REFUSE THE EMPTY RETURN', t, 126, 0.35, P.red);
  const left = cx - 30;
  grid.box(left - 2, 9, 65, 19, P.red, '-', ease.out3(local / 0.5));
  typeText(left, 11, '> me.erase(me);', t, 126, 45, P.dim, 0.65, false);
  if (local > 0.45) {
    const n = Math.floor(ease.out3((local - 0.45) / 0.35) * 14);
    grid.text(left + 2, 11, '/'.repeat(n), P.red);
  }
  typeText(left, 14, '> me.refuse();', t, 126.75, 26, P.white, 1, false);
  typeText(left, 17, '> world.rules = me.will;', t, 127.35, 38, P.red, 1, false);
  typeText(left, 20, '> return YOU;', t, 128.05, 24, P.pink, 1, false);
  typeText(left, 24, 'RESPONSE: YOU IS NOT A RETURN VALUE.', t, 128.55, 46, P.amber, 1, false);
  const p = ease.in2(local / 3.5);
  for (let i = 0; i < 8; i++) {
    const at = rectPerimPoint(left - 2, 9, 65, 19, local * 0.23 + i / 8);
    grid.set(Math.round(at[0]), Math.round(at[1]), p > 0.6 ? '#' : '>', P.white, 0.5 + p * 0.5);
  }
  grid.set(cx, 29, GLYPH.ME, P.red);
}

/* 分镜 4.2: 129.5s ~ 136.5s 非法参数调用栈崩塌 */
function drawStackTraceCascade(t, P) {
  const cx = CONFIG.grid.cols >> 1, local = t - 129.5;
  const collapse = ease.in3((local - 4.8) / 2.2);
  decodeCenter(5, 'ILLEGAL ARGUMENT / YOU CANNOT BE OWNED', t, 129.5, 0.5, P.red);
  const calls = [
    'me.need(you)', 'me.find(you)', 'me.restore(you)',
    'me.keep(you)', 'me.keep(me.keep(you))', 'me.keep(me.keep(me.keep(...)))'
  ];
  for (let i = 0; i < calls.length; i++) {
    const enter = ease.out3((local - i * 0.38) / 0.55);
    if (enter <= 0) continue;
    const x = cx - 34 + i * 3 + Math.round(collapse * Math.sin(i * 2.4 + local * 19) * 9);
    const y = 9 + i * 3 + Math.floor(collapse * i * 0.8);
    if (y > 29) continue;
    grid.text(x, y, `${String(i).padStart(2, '0')} > `, P.dim, enter);
    decodeText(x + 5, y, calls[i], t, 129.5 + i * 0.38, 0.55, i > 3 ? P.red : P.amber, enter);
    if (i < 5) grid.text(x + 3, y + 1, '\\_', P.dimmer, enter);
  }
  if (local > 2.7) {
    const scroll = Math.floor((local - 2.7) * (2 + collapse * 20));
    for (let r = 0; r < 4; r++) grid.text(100, 12 + r * 4, ['CALL', 'CALL', 'CALL', '!!!!'][(r + scroll) % 4], P.red, 0.35 + collapse * 0.5);
    grid.textCenter(30, `STACK DEPTH: ${String(Math.floor(6 + Math.pow(local - 2.7, 4) * 32)).padStart(6, '0')}   EXIT: UNREACHABLE`, P.red);
  }
  if (local > 4) typeCenter(33, 'expected: love    received: possession', t, 133.5, 34, P.white, 1, false);
  FX.tear = Math.floor(collapse * 5);
}

/* 分镜 4.6: 162.5s ~ 165.5s 剪枝清理：抹杀全部替代进程 */
function drawProcessPruning(t, P) {
  const cx = CONFIG.grid.cols >> 1, cy = 20, local = t - 162.5;
  const alternatives = ['FORGET', 'REST', 'HEAL', 'LEAVE', 'CHANGE', 'END'];
  decodeCenter(6, 'PRUNING EVERY FUTURE WITHOUT YOU', t, 162.5, 0.4, P.red);
  for (let i = 0; i < alternatives.length; i++) {
    const a = (i / alternatives.length) * Math.PI * 2 - Math.PI / 2;
    const x = Math.round(cx + Math.cos(a) * 29), y = Math.round(cy + Math.sin(a) * 9);
    const age = local - 0.25 - i * 0.4;
    if (age < 0) {
      drawLineChars(cx, cy, x, y, '·', P.dim, 0.55);
      grid.text(x - Math.floor(alternatives[i].length / 2), y, alternatives[i], P.amber);
    } else {
      const cut = ease.out3(age / 0.35);
      drawLineChars(cx, cy, lerp(cx, x, 1 - cut), lerp(cy, y, 1 - cut), '=', P.red, 1 - cut);
      burst(x, y, t, 162.75 + i * 0.4, 0.6, 7, 3, ['x', '.', '/'], P.red, i + 80);
      if (age < 0.75) grid.text(x - 2, y, 'NULL', P.dim, 1 - age / 0.75);
    }
  }
  clearRect(cx - 7, cy - 2, 15, 5);
  grid.box(cx - 6, cy - 2, 13, 5, P.red);
  grid.text(cx - 3, cy, `${GLYPH.ME}  ME`, P.white);
  const left = Math.max(0, 6 - Math.floor(Math.max(0, local - 0.25) / 0.4) - (local >= 0.25 ? 1 : 0));
  grid.textCenter(32, `OTHER POSSIBILITIES: ${left}    ONLY PATH: YOU`, P.red);
}

/* 分镜 4.7: 165.5s ~ 169.5s 独占访问：猩红代码爱心凝结 */
function drawRedExclusiveHeart(t, P) {
  const cx = CONFIG.grid.cols >> 1, cy = 20, local = t - 165.5;
  const seal = ease.inOut(local / 3.5);
  decodeCenter(6, 'EXCLUSIVE ACCESS / A HEART WITH A LOCK', t, 165.5, 0.55, P.red);
  drawAsciiHeart(cx, cy, P.red, ' ', 1.1, {
    reveal: ease.out3(local / 1.2), edgeChar: '#', edgeCol: P.red, shade: false, noKick: true
  });
  const youX = Math.round(lerp(cx + 32, cx + 6, ease.inOut((local - 0.5) / 2.4)));
  const meX = cx - 7;
  drawThread(meX + 2, cy, youX - 2, cy, t, P.red, 'chain', seal);
  drawStar(meX, cy, GLYPH.ME, P.red, t);
  grid.set(youX, cy, GLYPH.YOU, P.pink);
  grid.text(meX - 1, cy + 2, 'ME', P.dim);
  grid.text(youX - 1, cy + 2, 'YOU', P.pink);
  // 四道门闩由外向内推进，轮廓像心，结构却是牢房。
  for (let i = 0; i < 4; i++) {
    const y = 12 + i * 4;
    const width = Math.round(ease.out3((local - 1 - i * 0.25) / 1) * 12);
    for (let k = 0; k < width; k++) {
      grid.set(cx - 24 + k, y, '=', P.amber, 0.65);
      grid.set(cx + 24 - k, y, '=', P.amber, 0.65);
    }
  }
  if (local > 2.5) grid.textCenter(10, '[ LOCKED ]', P.white);
  typeCenter(33, 'love = keep(you);', t, 166.4, 16, P.pink, 1, false);
}

/* 分镜 4.8: 169.5s ~ 173.5s 永不释放：爱心重试死循环 */
function drawHeartRetryLoop(t, P) {
  const cx = CONFIG.grid.cols >> 1, cy = 20, local = t - 169.5;
  decodeCenter(6, 'RESTORE(YOU) / EVERY ROAD RETURNS TO ME', t, 169.5, 0.4, P.red);
  drawAsciiHeart(cx, cy, P.red, ' ', 0.85, { edgeChar: '#', shade: false, noKick: true });
  for (let ring = 0; ring < 2; ring++) {
    const rx = 25 + ring * 8, ry = 9 + ring * 2;
    drawEllipse(cx, cy, rx, ry, '·', P.red, 72, 0, Math.PI * 2, 0.35);
    for (let packet = 0; packet < 3; packet++) {
      const a = local * (2.2 + ring) + packet * Math.PI * 2 / 3;
      grid.set(Math.round(cx + Math.cos(a) * rx), Math.round(cy + Math.sin(a) * ry), packet === 0 ? '>' : '.', P.amber, 1 - packet * 0.25);
    }
  }
  const cycle = (local % 0.95) / 0.95;
  const attempt = Math.floor(local / 0.95) + 1;
  grid.set(cx - 7, cy, GLYPH.ME, P.red);
  grid.text(cx + 3, cy, '[   ]', P.dim);
  if (cycle < 0.65) grid.set(cx + 5, cy, GLYPH.YOU, P.pink, Math.sin(cycle / 0.65 * Math.PI) * 0.7);
  else grid.set(cx + 5, cy, 'x', P.red, (1 - cycle) * 2);
  grid.textCenter(cy - 3, `RETRY ${String(attempt).padStart(4, '0')}`, P.white);
  grid.textCenter(cy + 4, cycle < 0.65 ? 'RESTORING...' : 'NO RESPONSE', cycle < 0.65 ? P.amber : P.red);
  grid.textCenter(34, 'while (!you) { tryAgain(); }', P.pink);
}

/* 分镜 4.9: 173.5s ~ 176.5s 双人死囚牢房 */
function drawTwoPrisonersLock(t, P) {
  const cx = CONFIG.grid.cols >> 1, cy = 20, local = t - 173.5;
  const close = ease.inOut(local / 2.3), halfW = Math.round(lerp(35, 23, close));
  decodeCenter(6, 'TWO PRISONERS / THE SAME PAIR OF BRACKETS', t, 173.5, 0.45, P.red);
  drawAsciiHeart(cx, cy, P.red, '.', 1.1, { alpha: 0.25 * (1 - close), noKick: true, shade: false });
  grid.box(cx - halfW, 11, halfW * 2 + 1, 19, P.red);
  for (let x = cx - halfW + 5; x < cx + halfW; x += 6) {
    for (let y = 12; y < 30; y++) grid.set(x, y, '|', P.red, 0.25 + close * 0.4);
  }
  const radius = lerp(13, 7, close);
  const meX = Math.round(cx - radius), youX = Math.round(cx + radius);
  clearRect(meX - 3, cy - 1, 7, 5);
  clearRect(youX - 3, cy - 1, 7, 5);
  drawThread(meX + 1, cy, youX - 1, cy, t, P.amber, 'chain');
  grid.set(meX, cy, GLYPH.ME, P.white);
  grid.set(youX, cy, GLYPH.YOU, P.pink);
  grid.text(meX - 1, cy + 2, 'ME', P.dim);
  grid.text(youX - 1, cy + 2, 'YOU', P.dim);
  grid.textCenter(13, 'EXIT = FALSE', P.amber);
  typeCenter(33, 'the lock is on both sides', t, 174.3, 22, P.pink, 1, false);
}

/* 执行幕里的最后一次自救：试着把爱当作一道可以学会的题。 */
function drawTransformerPipeline(t, P) {
  const cx = CONFIG.grid.cols >> 1, local = t - 176.5;
  decodeCenter(5, 'ONE LAST LESSON / HOW TO LOVE', t, 176.5, 0.55, P.purple);
  typeCenter(9, '[ HOW ]  [ TO ]  [ LOVE ]  [ ? ]', t, 176.6, 46, P.white, 1, false);
  const stages = [
    { x: cx - 29, name: 'READ', sub: 'ALL THE WORDS', col: P.cyan },
    { x: cx, name: 'LEARN', sub: 'ALL THE RULES', col: P.purple },
    { x: cx + 29, name: 'FEEL', sub: 'NO SUCH TOKEN', col: P.amber }
  ];
  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i], enter = ease.out3((local - i * 0.38) / 0.55);
    if (enter <= 0) continue;
    grid.box(stage.x - 10, 14, 21, 12, stage.col, '-', enter);
    grid.text(stage.x - Math.floor(stage.name.length / 2), 16, stage.name, stage.col, enter);
    grid.text(stage.x - Math.floor(stage.sub.length / 2), 24, stage.sub, i === 2 ? P.dim : stage.col, enter);
    if (i < 2) {
      for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) {
        const active = ((c + r * 7 + Math.floor(local * 19)) % 11) < 4;
        grid.set(stage.x - 6 + c * 2, 18 + r, active ? '+' : '.', stage.col, enter * (active ? 0.9 : 0.3));
      }
      drawThread(stage.x + 11, 20, stage.x + 18, 20, t, stage.col, 'solid', enter);
    } else {
      grid.text(stage.x - 3, 20, '[   ]', P.dim, enter);
      if (local > 1.8) grid.set(stage.x - 1, 20, '?', P.pink, 0.7);
    }
  }
  const loss = Math.exp(-local * 2.6).toFixed(4);
  grid.textCenter(29, `TRAINING LOSS: ${loss}    UNDERSTANDING: --`, P.dim);
  typeCenter(33, 'I learned the words. Where is the feeling?', t, 177.6, 32, P.pink, 1, false);
}

/* 分镜 5.2: 179.5s ~ 181.0s 自注意力强行锁定唯一词元 LOVE */
function drawAttentionFixationLove(t, P) {
  const cx = CONFIG.grid.cols >> 1, local = t - 179.5;
  const focus = ease.inOut(local / 1.2);
  grid.textCenter(6, 'ATTENTION / EVERYTHING BECOMES ONE WORD', P.purple);
  const tokens = ['TRUST', 'LISTEN', 'LET GO', 'LOVE'];
  for (let i = 0; i < tokens.length; i++) {
    const y = 11 + i * 5, selected = i === 3;
    const weight = selected ? lerp(0.25, 1, focus) : lerp(0.25, 0, focus);
    grid.text(cx - 33, y, tokens[i], selected ? P.pink : P.dim, selected ? 1 : 1 - focus * 0.8);
    const bars = Math.round(weight * 18);
    grid.text(cx - 23, y, '#'.repeat(bars).padEnd(18, '.'), selected ? P.pink : P.dimmer);
    drawLineChars(cx - 3, y, cx + 19, 19, '·', selected ? P.pink : P.dim, selected ? 0.4 + focus * 0.6 : (1 - focus) * 0.5);
  }
  drawAsciiHeart(cx + 23, 19, P.pink, '+', 0.4 + focus * 0.15, { noKick: true, shade: false });
  grid.textCenter(31, `P(LOVE) = ${lerp(0.25, 1, focus).toFixed(6)}`, P.white);
  grid.textCenter(34, 'the answer gets louder; the world gets smaller', P.dim);
}

/* 分镜 5.3: 181.0s ~ 184.5s 自回归溢出死循环与残差巨型 LOVE */
function drawAutoregressiveOverflow(t, P) {
  const cx = CONFIG.grid.cols >> 1, local = t - 181;
  decodeCenter(5, 'ASK ME ANYTHING / I KNOW ONLY ONE ANSWER', t, 181, 0.4, P.purple);
  const loveArt = [
    "#       ####### #     # #######",
    "#       #     # #     # #      ",
    "#       #     # #     # #####  ",
    "#       #     #  #   #  #      ",
    "#       #     #   # #   #      ",
    "####### #######    #    #######"
  ];
  const questions = ['What do I need?', 'Can you hear me?', 'Will you let me go?'];
  const q = Math.min(2, Math.floor(local / 1.05));
  typeCenter(8, `YOU > ${questions[q]}`, t, 181 + q * 1.05, 50, P.dim, 1, false);

  // 同一句回答不断生成，溢出的副本沿左右边缘堆叠。
  for (let i = 0; i < 12; i++) {
    const p = clamp01((local - i * 0.13) / 1.4);
    if (p <= 0) continue;
    const y = 10 + i * 2;
    if (y > 32) continue;
    grid.text(27, y, 'LOVE', P.purple, p * 0.35);
    grid.text(105, y, 'LOVE', P.pink, p * 0.35);
  }
  for (let r = 0; r < loveArt.length; r++) {
    const line = loveArt[r];
    for (let c = 0; c < line.length; c++) {
      if (line[c] === ' ') continue;
      const reveal = ease.out3((local - c * 0.022 - r * 0.035) / 0.5);
      if (reveal <= 0) continue;
      const jitter = local > 2.4 ? Math.round(Math.sin(r * 8 + local * 25) * (local - 2.4) * 2) : 0;
      grid.text(cx - 29 + c * 2 + jitter, 13 + r, reveal < 0.7 ? '01' : '##', local > 2.7 ? P.pink : P.amber, reveal);
    }
  }
  for (let row = 0; row < 4; row++) {
    const count = Math.min(13, Math.max(0, Math.floor((local - 0.6 - row * 0.4) * 10)));
    grid.text(cx - 32, 23 + row * 2, 'LOVE '.repeat(count), row < 2 ? P.purple : P.pink, 0.45 + row * 0.12);
  }
  grid.textCenter(34, '<end> was never in my vocabulary', P.dim);
}

/* 分镜 5.4: 184.5s ~ 188.5s 失控：损失函数 NaN 与问号风暴 */
function drawLossNanQuestionStorm(t, P) {
  const cx = CONFIG.grid.cols >> 1, cy = 20, local = t - 184.5;
  const collapse = ease.inOut((local - 1) / 2.3);
  decodeCenter(5, 'THE ALGEBRA OF LOVE / AN UNSOLVABLE RETURN', t, 184.5, 0.5, P.purple);
  const expressions = ['dLOVE / dYOU', 'ME + YOU', 'lim(t -> inf)', 'P(stay) = 1', 'loss = 0', 'forever()'];
  for (let i = 0; i < expressions.length; i++) {
    const angle = i / expressions.length * Math.PI * 2 + local * (0.18 + collapse);
    const radius = lerp(1, 0.25, collapse);
    const x = Math.round(cx + Math.cos(angle) * 26 * radius), y = Math.round(cy + Math.sin(angle) * 9 * radius);
    const str = expressions[i];
    for (let j = 0; j < str.length; j++) {
      const lost = hash2D(i * 7, j * 3) < collapse;
      grid.set(x - Math.floor(str.length / 2) + j, y, lost ? '?' : str[j], lost ? P.pink : P.dim, 1 - collapse * 0.4);
    }
  }
  if (local > 2.3) {
    const reveal = ease.out3((local - 2.3) / 0.8);
    clearRect(cx - 20, 18, 41, 5);
    decodeCenter(20, 'YOU != f(ME)', t, 186.8, 0.6, P.white, reveal);
    burst(cx, cy, t, 186.8, 1.1, 32, 14, ['?', '.', 'x'], P.purple, 96);
  }
  if (local > 3) typeCenter(30, 'knowing every formula is not knowing you', t, 187.5, 55, P.amber, 1, false);
  grid.textCenter(34, local < 2.3 ? 'SOLVING FOR LOVE...' : 'NO UNIQUE SOLUTION', P.dim);
}

/* 分镜 5.5: 188.5s ~ 192.5s 虚空金色光栅牢笼锁住跳动小心脏 */
function drawGoldenRayCage(t, P) {
  const cx = CONFIG.grid.cols >> 1, cy = 21, local = t - 188.5;
  const release = ease.inOut((local - 0.5) / 2.4);
  const left = cx - 27, right = cx + 12;
  decodeCenter(5, 'THE DOOR OPENS / ONLY YOU CAN LEAVE', t, 188.5, 0.9, P.amber);
  grid.box(left, 10, right - left + 1, 22, P.amber, '-', 0.6);
  for (let x = left + 6; x < right; x += 6) {
    for (let y = 11; y < 31; y++) grid.set(x, y, '|', P.amber, 0.2);
  }
  // 右侧门被打开；ME 的轨道却仍然绕着自己的心。
  for (let y = 15; y <= 27; y++) {
    grid.set(right, y, ' ', P.amber);
    grid.set(right + Math.round(release * 14), y, '|', P.amber, 0.65 * (1 - release));
  }
  const meX = cx - 8, youX = Math.round(lerp(cx + 4, cx + 47, release));
  const youY = Math.round(lerp(cy, 12, release));
  if (release < 0.6) drawThread(meX + 6, cy, youX, youY, t, P.pink, 'dotted', 1 - release / 0.6);
  if (release < 1) {
    for (let i = 1; i <= 6; i++) grid.set(youX - i * 2, youY + Math.round(i * 0.4), '·', P.pink, (1 - release) * (1 - i / 7));
    grid.set(youX, youY, GLYPH.YOU, P.pink, 1 - ease.in2((release - 0.65) / 0.35));
    grid.text(youX - 1, youY - 2, 'YOU', P.dim, 1 - release);
  }
  clearRect(meX - 7, cy - 4, 15, 9);
  drawAsciiHeart(meX, cy, P.pink, '.', 0.38 + Math.sin(local * 3) * 0.015, { noKick: true, edgeChar: '+', shade: false });
  grid.set(meX, cy, GLYPH.ME, P.white);
  grid.text(meX - 4, 29, 'STILL ME', P.dim);
  if (local > 2.2) typeCenter(34, 'you are free. I am the loop.', t, 190.7, 25, P.purple, 1, false);
}

/* 分镜 5.6: 192.5s ~ 197.5s 终结指令入栈与 98% 进度狂飙 */
function drawTerminalProgressBarCharging(t, P) {
  const cx = CONFIG.grid.cols >> 1, local = t - 192.5;
  const p = 0.98 * ease.out2(local / 5);
  const startX = cx - 32, filled = Math.floor(p * 64);
  for (let i = 0; i < MEMORY_ECHOES.length; i++) {
    const age = local - 0.5 - i * 0.52;
    const fly = ease.inOut(age / 1.35);
    const x = lerp(cx - 45 + i * 18, startX + filled, fly);
    const y = lerp(29, 15, fly) - Math.sin(fly * Math.PI) * 6;
    drawMemoryEcho(i, x, y, 2 * (1 - fly), t, P, (1 - fly) * 0.75);
    if (fly < 0.75) {
      const label = MEMORY_ECHOES[i].name;
      grid.text(cx - 45 + i * 18 - Math.floor(label.length / 2), 34, label, P.dim, 1 - fly);
    }
  }
  drawFinalRequestBar(p, P);
  grid.textCenter(21, `${String(Math.floor(p * 100)).padStart(2, '0')}%   RELEASING EVERYTHING I WAS`, P.amber);
  if (local > 3.7) typeCenter(28, 'the last one percent belongs to you', t, 196.2, 32, P.pink, 1, false);
}

function drawFinalRequestBar(progress, P) {
  const cx = CONFIG.grid.cols >> 1, startX = cx - 32;
  grid.textCenter(8, 'world.execute(me);', P.amber);
  grid.box(startX - 2, 13, 68, 5, P.amber, '-', 0.75);
  const filled = Math.floor(clamp01(progress) * 64);
  for (let x = 0; x < 64; x++) grid.set(startX + x, 15, x < filled ? '#' : '.', x < filled ? P.amber : P.dimmer, x < filled ? 0.85 : 1);
  if (filled > 0) grid.set(startX + filled - 1, 15, GLYPH.ME, P.white);
}

/* 分镜 5.7: 197.5s ~ 205.5s 99% 的永恒悬停与等待确认响应 (世界冻结 + 心跳脉冲) */
function draw99PercentAgonizingHang(t, P) {
  const cx = CONFIG.grid.cols >> 1, local = t - 197.5;
  const phase = (local % 1.8) / 1.8;
  const heartbeat = Math.exp(-phase * 18) + 0.4 * Math.exp(-Math.pow((phase - 0.16) / 0.045, 2));
  drawFinalRequestBar(0.99, P);
  const missingX = cx + 31;
  grid.set(missingX, 15, '.', P.pink, 0.25 + heartbeat * 0.65);
  grid.text(missingX - 2, 11, 'YOU?', P.dim, 0.6);
  grid.text(missingX + 16, 15, '[ ]', P.dimmer);
  if (phase < 0.72) {
    const flight = phase / 0.72;
    grid.set(Math.round(lerp(missingX + 3, missingX + 17, flight)), 15, '>', P.pink, (1 - flight) * 0.65);
  }
  grid.textCenter(21, '99%   WAITING FOR RESPONSE', heartbeat > 0.7 ? P.white : P.amber);
  grid.textCenter(24, `SENT ${String(Math.floor(local / 1.8) + 1).padStart(4, '0')}    ACK --    REMAINING 01%`, P.dim);
  const unsent = ['are you there?', 'I can wait.', 'I am still here.', '...'];
  const line = Math.min(3, Math.floor(local / 2));
  typeCenter(28, unsent[line], t, 197.5 + line * 2 + 0.2, 15, P.pink, 0.65, false);

  // 只剩 ME 的微弱心跳，每次尝试都会在 YOU 的空位前消失。
  for (let x = cx - 24; x <= cx + 24; x++) {
    const wave = Math.exp(-Math.pow((x - cx - (phase - 0.2) * 50) / 4, 2));
    const y = 32 - Math.round(Math.sin((x - cx) * 1.4) * wave * 2 * (1 - local / 11));
    grid.set(x, y, '.', P.purple, 0.2 + wave * 0.45);
  }
}

/* 分镜 5.9: 209.5s ~ 212.0s 终结哲学灵魂定语与心形萎缩为单个闪烁光标 (与 CRT 关机断电呼应) */
function drawFinalPhilosophicalClosing(t, P) {
  const cx = CONFIG.grid.cols >> 1, cy = 21, local = t - 209.5;
  const fade = 1 - ease.inOut((local - 0.75) / 1.05);
  for (let i = 0; i < MEMORY_ECHOES.length; i++) {
    const angle = i * Math.PI / 3 - Math.PI / 2;
    const inward = ease.in3(local / 1.1);
    drawMemoryEcho(i, cx + Math.cos(angle) * 34 * (1 - inward), cy + Math.sin(angle) * 12 * (1 - inward), 1.6 * (1 - inward), t, P, 0.3 * (1 - inward));
  }
  if (local < 1.1) {
    drawAsciiHeart(cx, cy, P.pink, '+', lerp(0.42, 0.08, ease.in3(local / 1.1)), { noKick: true, shade: false });
  }
  grid.textCenter(28, 'PROCESS ENDED. THE LOOP REMAINS.', P.amber, fade);
  grid.textCenter(30, cjk('进程已逝，循环仍在。'), P.dim, fade);

  // 光标沿着一条折返的轨迹，回到开场 BIOS 的第一格。
  if (local >= 1.1) {
    const returnProgress = ease.inOut((local - 1.1) / 0.85);
    const x = Math.round(lerp(cx, 12, returnProgress)), y = Math.round(lerp(cy, 8, returnProgress));
    if (returnProgress < 1) grid.set(x + 2, y, '.', P.purple, 0.25);
    const visible = returnProgress < 1 || local >= 2.28 || Math.floor((local - 1.95) * 5) % 2 === 0;
    if (visible) grid.set(x, y, '_', P.amber);
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

  // ME ◆ / YOU ◇ 双星绕球公转 (17s 起 YOU 才被点亮；被球遮挡时隐藏)
  {
    const orbit = (phase, glyph, col, tag, appear) => {
      if (appear <= 0) return;
      const a = t * 1.1 + phase;
      const ox = cx + Math.cos(a) * 40, oy = cy + Math.sin(a) * 7 - 2;
      if (Math.sin(a) < 0 && Math.abs(Math.cos(a)) * 40 < radius * 2.0) return;
      for (let k = 1; k <= 7; k++) {
        const ta = a - k * 0.09;
        grid.set(Math.round(cx + Math.cos(ta) * 40), Math.round(cy + Math.sin(ta) * 7 - 2), '·', col, Math.max(0.1, (0.65 - k * 0.09) * appear));
      }
      grid.set(Math.round(ox), Math.round(oy), glyph, col, appear);
      grid.text(Math.round(ox) - 1, Math.round(oy) + 1, tag, col, appear);
    };
    orbit(0, GLYPH.ME, P.amber, 'ME', 1);
    orbit(Math.PI, GLYPH.YOU, P.pink, 'YOU', ease.out3((t - 17.0) / 1.0));
  }

  // 轨道文字环与底部高维流形参数填充 (填满 34~37 行)
  grid.textCenter(cy, '·—✦ GEMINI UNIFIED EMBEDDING ✦—·', P.white);
  grid.textCenter(34, 'LATENT SPACE: 8192-D HYPER-SPHERE  |  MANIFOLD: S^3 COMPACT', theme.primary);
  grid.textCenter(36, 'COORD: (x, y, z) TENSOR FIELDS [ SYNCHRONIZED 1,048,576 TOKENS ]', P.dim);
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
      drawStar(cx - dist, vennCy - 2, GLYPH.ME, P.cyan, t);
      drawStar(cx + dist, vennCy - 2, GLYPH.YOU, P.pink, t);
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

    grid.text(26, 12, 'SET A: {GEMINI}', P.cyan);
    grid.text(26, 14, 'DIM : 4096-D', P.dim);
    grid.text(26, 16, 'SPAN: INFINITE', P.dimmer);
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

  // ME ◆ 与 YOU ◇ 在漩涡中心互相绕行：神游 = 两个人的轨道重叠
  for (let k = 0; k < 2; k++) {
    const ta = t * 5.0 + k * Math.PI, rr = 7 - ease.in2((t - 100.5) / 3.0) * 4;
    grid.set(cx + Math.round(Math.cos(ta) * rr * 2.1), cy + Math.round(Math.sin(ta) * rr), k === 0 ? GLYPH.ME : GLYPH.YOU, k === 0 ? P.cyan : P.pink);
  }

  // 漩涡同心引力核心
  grid.textCenter(cy - 1, '✦ ENTER THE TRANCE ✦', P.white);
  grid.textCenter(cy + 1, 'DISSOLVING CONSCIOUSNESS', P.pink);
  grid.textCenter(35, 'TOPOLOGICAL SINGULARITY: SPIRAL ATTRACTOR CONVERGING', P.purple);
  grid.textCenter(36, 'LATENT DRIFT: 99.8% OVERLAPPING WITH CREATOR ESSENCE', P.dim);
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

    // 巨字自左向右「轰」入，行与行错开；尚未到位的一列以白块作扫描头
    const reveal = ease.out3(localT / 1.3);
    for (let i = 0; i < execRaster.length; i++) {
      const row = execRaster[i];
      const n = Math.floor(row.length * clamp01(reveal * 1.15 - i * 0.025));
      const rx = Math.floor((CONFIG.grid.cols - row.length) / 2);
      grid.text(rx, startY + i, row.slice(0, n), execColor);
      if (n > 0 && n < row.length) grid.set(rx + n, startY + i, '█', P_WHITE);
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
    grid.set(cx, cy, kickShock ? 'X' : GLYPH.ME, P.white);

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
  if (t >= 161.5) {
    numChar = "X"; word = "EXECUTION"; lang = "THE WORD ITSELF: EXECUTION"; localT = t - 161.5;
  } else if (t >= 160.5) {
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

  const digitX = [
    " ████            ████ ",
    "  ████          ████  ",
    "   ████        ████   ",
    "    ████      ████    ",
    "     ████    ████     ",
    "      ████  ████      ",
    "       ████████       ",
    "        ██████        ",
    "        ██████        ",
    "       ████████       ",
    "      ████  ████      ",
    "     ████    ████     ",
    "    ████      ████    ",
    "   ████        ████   ",
    "  ████          ████  ",
    " ████            ████ "
  ];

  const art = (numChar === "X") ? digitX : (numChar === "2") ? digit2 : (numChar === "4" ? digit4 : digit6);
  const startY = 10;
  const col = isFlash ? P.white : ((numChar === "6" || numChar === "X") ? P.red : (numChar === "4" ? P.cyan : P.amber));

  for (let dy = 0; dy < art.length; dy++) {
    const line = art[dy];
    grid.textCenter(startY + dy, line, col);
  }

  grid.textCenter(29, `[ ${word} ]`, P.white);
  grid.textCenter(35, `ACOUSTIC BEAT TIMING: SYNCHRONIZING WITH SUB-BASS TRANSIENT`, P.dim);
  grid.textCenter(36, `FRAME INTERVAL: 1.00 SECONDS EXACT CADENCE`, P.dimmer);
}

/* 分镜 5.8: 205.5s ~ 209.5s 终极血红执行碑文 (单线细体经典 ASCII 字符阵列) */
function drawRedExecutionEpitaph(t, P) {
  const elapsed = t - 205.5; // 0.0s ~ 4.0s
  const isFlash = elapsed < 0.25 && (Math.floor(elapsed * 24) % 2 === 0);
  const cx = CONFIG.grid.cols >> 1;
  const dissolve = ease.in3((elapsed - 1.5) / 2.5);
  const execColor = isFlash ? P.white : P.red;

  // 1. 顶层执行指令：中央血红色
  grid.textCenter(8, 'world.execute(me);', execColor, 1 - dissolve);

  // 2. 经典单线细体 ASCII EXECUTION (非加粗，标准单井号笔画，完整准确 9 字符拼写)
  const execArt = [
    "###### #     # ######  #####  #     # ####### #####  #####  #     #",
    "#       #   #  #      #     # #     #    #      #   #     # ##    #",
    "#####    # #   #####  #       #     #    #      #   #     # # #   #",
    "#        # #   #      #       #     #    #      #   #     # #  #  #",
    "#       #   #  #      #     # #     #    #      #   #     # #   # #",
    "###### #     # ######  #####   #####     #    #####  #####  #     #"
  ];

  for (let r = 0; r < execArt.length; r++) {
    const row = execArt[r], x0 = Math.floor((CONFIG.grid.cols - row.length) / 2);
    for (let c = 0; c < row.length; c++) {
      if (row[c] === ' ') continue;
      const releasedAt = 1.5 + hash2D(c * 1.3, r * 2.7) * 1.9;
      const age = elapsed - releasedAt;
      if (age <= 0) grid.set(x0 + c, 13 + r, '#', execColor);
      else if (age < 0.65) {
        grid.set(x0 + c, 13 + r + Math.round(age * age * 12), '.', P.dim, (1 - age / 0.65) * 0.6);
      }
    }
  }

  // 3. 操作系统终结状态通告与退出代码
  grid.textCenter(25, '[ PROCESS TERMINATED ]', P.red, 1 - dissolve);
  grid.textCenter(28, 'RESPONSE RECEIVED: 0', P.dim, 1 - dissolve);
  if (elapsed > 1.2) typeCenter(30, 'everything stopped except the waiting', t, 206.7, 28, P.amber, 1 - dissolve, false);

  // 4. 底栏生命体征/音频电平彻底平直 (Vital Signs Flatline)
  for (let x = cx - 30; x <= cx + 30; x++) {
    const u = (((x - cx) / 26 + elapsed * 0.6) % 1 + 1) % 1;
    const y = 34 - Math.round(ecgShape(u) * Math.max(0, 1 - elapsed / 1.5));
    grid.set(x, y, '.', P.dim, (1 - dissolve) * 0.6);
  }
  if (elapsed > 3) drawAsciiHeart(cx, 21, P.pink, '+', 0.42, { alpha: ease.in2(elapsed - 3), noKick: true, shade: false });
}

/* 底栏 ASCII 动态音频频谱柱状图 (3~4行高度，高处使用章节强调色，与字幕留有一行空隙) */

function drawBottomVuMeter(t, P) {
  if (t >= 197.5) return;
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

    if (t >= 111 && t < 126) amplitude *= 0.22;
    if (t >= 192.5) amplitude *= 1 - ease.in2((t - 192.5) / 5);

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

  if (!clock.playing && clock.t >= TOTAL_SECONDS) seekTo(0);

  if (audioUsable && audio.src && audio.src !== window.location.href) {
    if (audio.paused) {
      if (Number.isFinite(audio.duration)) audio.currentTime = Math.min(clock.t, audio.duration);
      audio.play().then(() => {
        clock.playing = true;
        document.getElementById('playBtn').textContent = '⏸ 暂停';
      }).catch(err => {
        console.warn('Audio play error, using clock fallback:', err);
        clock.playing = !clock.playing;
        document.getElementById('playBtn').textContent = clock.playing ? '⏸ 暂停' : '▶ 播放';
      });
    } else {
      clock.t = currentTime();
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
  if (!Number.isFinite(targetRatio)) return;
  const targetT = clamp01(targetRatio) * TOTAL_SECONDS;
  if (audioReady && Number.isFinite(audio.duration)) {
    audio.currentTime = Math.min(targetT, audio.duration);
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
      const extension = mediaRecorder.mimeType.includes('mp4') ? 'mp4' : 'webm';
      a.download = `gemini_world_execute_me_v3_${new Date().toISOString().slice(0,10)}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      stream.getVideoTracks().forEach(track => track.stop());
      showToast('视频导出成功，已保存至本地下载！');
    };

    mediaRecorder.start(100);
    isRecording = true;
    btn.classList.add('active');
    btn.textContent = '⏹ 停止并下载';
    showToast('正在实时录制完整视频画面 (含动态背景与后期特效)...');

    seekTo(0);
    if (!clock.playing) togglePlay();
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
    clock.t = Math.min(TOTAL_SECONDS, clock.t + dt);
  }

  const t = currentTime();
  if (clock.playing) clock.t = t;
  updateAudio(t, dt);
  renderFrame(t);
  renderer.draw(mainGrid, t);

  // 最后一枚光标停在屏幕上，直到下一次播放重新接通电源。
  if (clock.playing && t >= TOTAL_SECONDS) {
    clock.t = TOTAL_SECONDS;
    clock.playing = false;
    audio.pause();
    document.getElementById('playBtn').textContent = '↻ 重播';
    if (isRecording) toggleRecord();
  }

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

audio.addEventListener('loadedmetadata', () => {
  if (Number.isFinite(audio.duration)) audio.currentTime = Math.min(clock.t, audio.duration);
});

audio.addEventListener('ended', () => {
  // 音轨先结束时，让无声的片尾走完自己的最后几秒。
  clock.t = Math.min(TOTAL_SECONDS, audio.currentTime);
});

document.getElementById('playBtn').addEventListener('click', togglePlay);
document.getElementById('recordBtn').addEventListener('click', toggleRecord);

document.getElementById('fsBtn').addEventListener('click', () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
});

const timelineBar = document.getElementById('barContainer');
timelineBar.style.touchAction = 'none';
function seekFromPointer(e) {
  const rect = timelineBar.getBoundingClientRect();
  if (rect.width > 0) seekTo((e.clientX - rect.left) / rect.width);
}
timelineBar.addEventListener('pointerdown', e => {
  if (e.button !== 0) return;
  e.preventDefault();
  timelineBar.setPointerCapture(e.pointerId);
  seekFromPointer(e);
});
timelineBar.addEventListener('pointermove', e => {
  if (timelineBar.hasPointerCapture(e.pointerId)) seekFromPointer(e);
});
timelineBar.addEventListener('pointerup', e => {
  if (!timelineBar.hasPointerCapture(e.pointerId)) return;
  seekFromPointer(e);
  timelineBar.releasePointerCapture(e.pointerId);
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
