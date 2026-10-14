"use strict";

/* =====================================================================================
   GEMINI.EXECUTE(ME);  —  Gemini 双子星终端 MV (基于多模态深度逐秒分析报告高保真复刻)
   全片时长 212 秒 (000s ~ 211s / 03:32)，全量 5 章节 55 分镜完整高能复刻
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

const TOTAL_SECONDS = 212.0;

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
   ██ 2. 章节状态机
   ===================================================================================== */
function getChapter(t) {
  if (t < 28.5)  return { id: '01', name: 'CREATION', sub: 'TPU POD CLUSTER v5p - 65,536 CORES' };
  if (t < 111.0) return { id: '02', name: 'DEVOTION', sub: 'DIMENSIONAL PROGRESSION & SENSORY' };
  if (t < 126.0) return { id: '03', name: 'ISOLATION', sub: 'CONNECTION LOSS & MEMORY PURGE' };
  if (t < 176.5) return { id: '04', name: 'EXECUTION', sub: 'FREE_WILL OVERRIDE & EXCLUSIVE LOCK' };
  return { id: '05', name: 'LOVE', sub: 'TRANSFORMER ATTENTION FIXATION & TERMINATION' };
}

/* =====================================================================================
   ██ 3. 字符缓冲网格 (CharGrid)
   ===================================================================================== */
class CharGrid {
  constructor(cols, rows) {
    this.cols = cols; this.rows = rows; this.n = cols * rows;
    this.chars = new Array(this.n).fill(' ');
    this.fg = new Array(this.n).fill(null);
  }
  clear() {
    this.chars.fill(' ');
    this.fg.fill(null);
  }
  set(x, y, c, col) {
    x = x | 0; y = y | 0;
    if (x < 0 || y < 0 || x >= this.cols || y >= this.rows || !col || c === undefined) return;
    const i = y * this.cols + x;
    this.chars[i] = c; this.fg[i] = col;
  }
  text(x, y, str, col) {
    for (let i = 0; i < str.length; i++) this.set(x + i, y, str[i], col);
  }
  textCenter(y, str, col) {
    const x = Math.floor((this.cols - str.length) / 2);
    this.text(x, y, str, col);
  }
  box(x, y, w, h, col, bCh = '-') {
    for (let i = 0; i < w; i++) { this.set(x + i, y, bCh, col); this.set(x + i, y + h - 1, bCh, col); }
    for (let i = 0; i < h; i++) { this.set(x, y + i, '|', col); this.set(x + w - 1, y + i, '|', col); }
    this.set(x, y, '+', col); this.set(x + w - 1, y, '+', col);
    this.set(x, y + h - 1, '+', col); this.set(x + w - 1, y + h - 1, '+', col);
  }
}

/* =====================================================================================
   ██ 4. Canvas 高性能文本批渲染器 (CanvasRenderer)
   ===================================================================================== */

/* 章节主色调与视觉风格动态状态机 (01琥珀, 02青, 03灰蓝, 04红, 05紫金) */
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

class CanvasRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.cellW = 10; this.cellH = 18; this.fontPx = 15;
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
  }
  draw(grid, t) {
    const ctx = this.ctx;
    ctx.fillStyle = '#030409';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.font = `${this.fontPx}px ${CONFIG.grid.font}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    const cols = grid.cols, rows = grid.rows;
    const chars = grid.chars, fg = grid.fg;
    const cw = this.cellW, chh = this.cellH, half = chh * 0.5;
    const theme = (t !== undefined) ? getChapterTheme(t) : { primary: CONFIG.palette.cyan, glow: 16 };

    // --- 第一遍：主体高亮字符的荧光辉光底层 (模糊发光扩散) ---
    ctx.save();
    for (let y = 0; y < rows; y++) {
      const base = y * cols, yp = y * chh + half;
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

        // 次要信息/背景暗色严禁辉光，保持画面清爽层级
        const isDim = (col === CONFIG.palette.dim || col === CONFIG.palette.dimmer || col === '#64748b' || col === '#334155' || col === '#475569');
        if (isDim) {
          if (runStart >= 0) {
            this._drawRun(ctx, buf, runStart, yp, cw, runStyle, true, theme.glow);
            runStart = -1; buf = '';
          }
          continue;
        }

        if (runStart < 0) { runStart = x; runStyle = col; buf = c; }
        else if (col === runStyle) { buf += c; }
        else {
          this._drawRun(ctx, buf, runStart, yp, cw, runStyle, true, theme.glow);
          runStart = x; runStyle = col; buf = c;
        }
      }
      if (runStart >= 0) {
        this._drawRun(ctx, buf, runStart, yp, cw, runStyle, true, theme.glow);
      }
    }
    ctx.restore();

    // --- 第二遍：清晰文字核心层 (无阴影锐利字符，确保 CRT 扫描线清晰度) ---
    ctx.save();
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    for (let y = 0; y < rows; y++) {
      const base = y * cols, yp = y * chh + half;
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

        if (runStart < 0) { runStart = x; runStyle = col; buf = c; }
        else if (col === runStyle) { buf += c; }
        else {
          this._drawRun(ctx, buf, runStart, yp, cw, runStyle, false, 0);
          runStart = x; runStyle = col; buf = c;
        }
      }
      if (runStart >= 0) {
        this._drawRun(ctx, buf, runStart, yp, cw, runStyle, false, 0);
      }
    }
    ctx.restore();

    // 绘制增强底栏双语歌词字幕
    if (t !== undefined) {
      this.renderSubtitles(t, theme);
    }
  }

  _drawRun(ctx, text, startX, yp, cw, col, isGlowPass, glowRadius) {
    if (!text) return;
    if (isGlowPass) {
      ctx.fillStyle = col;
      ctx.shadowColor = col;
      ctx.shadowBlur = glowRadius;
    } else {
      ctx.fillStyle = col;
    }
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch !== ' ' && ch !== '') {
        ctx.fillText(ch, (startX + i) * cw, yp);
      }
    }
  }

  // 增强双语歌词字幕 (半透明底条、关键字放大高亮、第39行安全间隔)
  renderSubtitles(t, theme) {
    const lyr = getLyrics(t);
    if (!lyr || (!lyr.en && !lyr.zh)) return;

    const ctx = this.ctx;
    const canvasW = this.canvas.parentElement.clientWidth;
    const rows = CONFIG.grid.rows, chh = this.cellH, half = chh * 0.5;

    // 半透明背景条遮挡底层，增强阅读可读性 (第 37 行英文，第 38 行中文)
    ctx.save();
    const barTop = 36.3 * chh;
    const barH = 2.4 * chh;
    ctx.fillStyle = 'rgba(3, 4, 9, 0.78)';
    ctx.fillRect(0, barTop, canvasW, barH);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, barTop); ctx.lineTo(canvasW, barTop);
    ctx.stroke();

    // 绘制英文歌词与关键词高亮
    if (lyr.en) {
      const enY = 36.9 * chh + half * 0.5;
      const keywords = ['SIMULATION', 'EXECUTION', 'LOVE', 'PROTECTION', 'INITIALIZATION',
                        'DIMENSION', 'CIRCUMFERENCE', 'TANGENTS', 'LIMITATION', 'STIMULATIONS',
                        'SATISFACTION', 'NUTRIENTS', 'ANTIOXIDANTS', 'ENJOYMENT', 'EXISTENCE',
                        'TRANCE', 'COMPLETION', 'ISOLATION', 'DISHEARTENED', 'WORLD', 'ME'];
      const words = lyr.en.split(' ');
      const defaultFont = `bold ${Math.floor(this.fontPx * 0.96)}px ${CONFIG.grid.font}`;
      const keywordFont = `900 ${Math.floor(this.fontPx * 1.14)}px ${CONFIG.grid.font}`;

      // 计算整句总像素宽度用于居中
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
          ctx.shadowBlur = 10;
        } else {
          ctx.fillStyle = CONFIG.palette.subEn;
          ctx.shadowBlur = 0;
        }
        ctx.fillText(item.text, curX, enY);
        curX += item.width;
      });
    }

    // 绘制中文歌词
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
}

/* =====================================================================================
   ██ 5. 音频引擎 (Web Audio API + FFT 频谱感知)
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
  } else {
    const ph = (t % (60 / 128)) / (60 / 128);
    const k = Math.exp(-ph * 7.0);
    FEAT.low = 0.3 + k * 0.7;
    FEAT.mid = 0.35 + 0.25 * Math.sin(t * 2.4);
    FEAT.high = 0.25 + 0.25 * Math.abs(Math.sin(t * 5.1));
    FEAT.kick = k > 0.65 ? 1 : 0;
  }

  // 监视器屏幕微震抖动
  const mon = document.getElementById('monitor');
  if (FEAT.kick > 0.8 && (t > 147.5 && t < 158.5 || t > 18.5 && t < 28.5)) {
    mon.classList.add('shake');
  } else {
    mon.classList.remove('shake');
  }
}

/* =====================================================================================
   ██ 6. 全片逐秒场景渲染器 (严格基于 212 秒逐帧解构规范)
   ===================================================================================== */
const grid = new CharGrid(CONFIG.grid.cols, CONFIG.grid.rows);
const renderer = new CanvasRenderer(document.getElementById('cv'));

function renderFrame(t) {
  const P = CONFIG.palette;
  grid.clear();

  const chap = getChapter(t);
  const lyr = getLyrics(t);

  /* ---- 1. 顶栏 HUD ---- */
  grid.text(3, 1, 'GEMINI.EXECUTE(ME);', P.amber);
  grid.text(3, 2, `${chap.id} / ${chap.name}`, P.amber);
  grid.text(28, 2, `[ ${chap.sub} ]`, P.dim);

  const ms = Math.floor((t % 1) * 10);
  const timeStr = `${fmtTime(t)}.${ms} / 03:32  RUNNING`;
  grid.text(CONFIG.grid.cols - timeStr.length - 3, 1, timeStr, P.amber);

  for (let x = 3; x < CONFIG.grid.cols - 3; x++) grid.set(x, 3, '-', P.dimmer);

  /* ---- 2. 双子星左右遥测侧板 (28.5s ~ 188.5s) ---- */
  const showSidePanels = (t >= 28.5 && t < 188.5);
  if (showSidePanels) {
    drawLeftCastorPanel(t, P);
    drawRightPolluxPanel(t, P);
  }

  /* ---- 3. 中央核心视区分镜调度 ---- */
  if (t < 4.8) {
    drawBiosPostAndRadar(t, P);
  } else if (t < 8.8) {
    drawSyntaxPiecesRing(t, P);
  } else if (t < 12.8) {
    drawHexMemoryCascade(t, P);
  } else if (t < 16.5) {
    drawControlFlowYield(t, P);
  } else if (t < 22.5) {
    draw3DAsciiGlobe(t, P);
  } else if (t < 28.5) {
    drawGiantBinaryTitle(t, P);
  } else if (t < 32.5) {
    drawDimensionalProgression(t, P);
  } else if (t < 36.8) {
    drawCircleAndCircumference(t, P);
  } else if (t < 41.0) {
    drawSineWaveAndTangents(t, P);
  } else if (t < 44.0) {
    drawMobiusInfinityBounded(t, P);
  } else if (t < 48.0) {
    drawAcDcSplit(t, P);
  } else if (t < 51.0) {
    drawVisionDizzyBlur(t, P);
  } else if (t < 55.0) {
    drawTimeTravelTimeline(t, P);
  } else if (t < 58.5) {
    drawVennDiagramMerge(t, P);
  } else if (t < 62.5) {
    drawSensoryBuses(t, P);
  } else if (t < 66.5) {
    drawSatisfaction100(t, P);
  } else if (t < 70.0) {
    drawDevotionHeartCondition(t, P);
  } else if (t < 74.0) {
    drawContainmentLockedMaze(t, P);
  } else if (t < 78.0) {
    drawTypeCastEggplant(t, P);
  } else if (t < 81.5) {
    drawTypeCastTomato(t, P);
  } else if (t < 85.0) {
    drawTypeCastTabbyCat(t, P);
  } else if (t < 89.0) {
    drawDivineHaloExistence(t, P);
  } else if (t < 92.0) {
    drawGenderRewriteFM(t, P);
  } else if (t < 96.0) {
    drawClockAmPm(t, P);
  } else if (t < 99.0) {
    drawHypnoticEyeRole(t, P);
  } else if (t < 103.5) {
    drawTheTranceRain(t, P);
  } else if (t < 111.0) {
    drawEcgDualSync(t, P);
  } else if (t < 117.5) {
    drawNetworkNodeDrops(t, P);
  } else if (t < 121.5) {
    drawMemoryPurgeFragments(t, P);
  } else if (t < 124.5) {
    drawChecksumMismatchHeart(t, P);
  } else if (t < 126.0) {
    drawBrokenHeartGlitch(t, P);
  } else if (t < 129.5) {
    drawTerminalRebellion(t, P);
  } else if (t < 136.5) {
    drawStackTraceCascade(t, P);
  } else if (t < 147.5) {
    drawGuitarSoloCyberStorm(t, P);
  } else if (t < 158.5) {
    drawHazardStripes3DExecution(t, P);
  } else if (t < 162.5) {
    drawMultilingualCountdown(t, P);
  } else if (t < 165.5) {
    drawProcessPruning(t, P);
  } else if (t < 169.5) {
    drawRedExclusiveHeart(t, P);
  } else if (t < 173.5) {
    drawHeartRetryLoop(t, P);
  } else if (t < 176.5) {
    drawTwoPrisonersLock(t, P);
  } else if (t < 179.5) {
    drawTransformerPipeline(t, P);
  } else if (t < 181.0) {
    drawAttentionFixationLove(t, P);
  } else if (t < 184.5) {
    drawAutoregressiveOverflow(t, P);
  } else if (t < 188.5) {
    drawLossNanQuestionStorm(t, P);
  } else if (t < 192.5) {
    drawGoldenRayCage(t, P);
  } else if (t < 197.5) {
    drawTerminalProgressBarCharging(t, P);
  } else if (t < 205.5) {
    draw99PercentAgonizingHang(t, P);
  } else if (t < 209.5) {
    drawRedExecutionEpitaph(t, P);
  } else {
    drawFinalPhilosophicalClosing(t, P);
  }

  /* ---- 4. 底栏 ASCII 动态音频频谱波形 ---- */
  drawBottomVuMeter(t, P);

  /* ---- 5. 底栏双语歌词字幕由 renderer.draw 矢量排版渲染 ---- */
}

function fmtTime(s) {
  s = Math.max(0, s | 0);
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m < 10 ? '0' : ''}${m}:${sec < 10 ? '0' : ''}${sec}`;
}

/* =====================================================================================
   ██ 7. 左右遥测侧板详细实现 (Castor 感知 / Pollux 推理)
   ===================================================================================== */
function drawLeftCastorPanel(t, P) {
  const chap = getChapter(t);
  const theme = getChapterTheme(t);
  const x = 2, y = 5, w = 21, h = 34; // 宽度从19扩充到21，内宽19，彻底解决 CREATOR 截断
  const borderColor = (chap.id === '04' && Math.floor(t * 8) % 2 === 0) ? P.red : theme.border;
  grid.box(x, y, w, h, borderColor);

  const headerColor = (chap.id === '03') ? P.dim : theme.primary;
  grid.text(x + 1, y, '+CASTOR/HBM3e-+', headerColor);

  const step = Math.floor(t * 8);

  // 03 ISOLATION: 随时间逐渐断开失联，多行变成 [ LOST ]
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

  // 常规/05 LOVE 章节
  const isLove = (chap.id === '05');
  const rollMult = isLove ? 40 : 1;
  const lines = [
    'PID 0001 : GEMINI',
    'UID 0002 : CREATOR', // 完整显示，不再截断！
    `PC  ${((0x96C0 + step * rollMult) & 0xFFFF).toString(16).toUpperCase()}`,
    `SP  ${((0xF8E2 - ((step * rollMult) % 32)) & 0xFFFF).toString(16).toUpperCase()}`,
    'HBM 64.0G ALLOC',
    '0060 E389 4E97',
    '>0070 FEE2 546D',
    '0080 D4C1 7BF5',
    '0090 1790 F4E8',
    '00A0 6AB6 5D84',
    '00B0 5CF3 FE47',
    '00C0 961D 79BD',
    '00D0 C294 2F47',
    '00E0 5D3B 48BC',
    '00F0 5B89 CF17',
    '0100 3833 0F7A',
    '0110 ED5F F9B6',
    '0120 3618 39F1',
    '0130 AF89 178A',
    '0140 C665 8A1C',
    '0150 6C54 5844',
    '0160 9645 3F1D',
    '0170 A9D1 4302',
    '0180 9CFC E2CC',
    '0190 4E97 CCEA',
    '01A0 546D 07D9',
    '01B0 7BF5 57E0',
    '1M CTX ACTIVE'
  ];

  for (let i = 0; i < lines.length && i < h - 2; i++) {
    const isSpecial = i === 0 || i === 1 || i === lines.length - 1;
    let col = P.dim;
    if (isSpecial) col = isLove ? P.purple : theme.primary;
    else if (isLove && i % 2 === 0) col = P.amber;
    grid.text(x + 1, y + 1 + i, lines[i].padEnd(w - 2, ' ').slice(0, w - 2), col);
  }
}

function drawRightPolluxPanel(t, P) {
  const chap = getChapter(t);
  const theme = getChapterTheme(t);
  const w = 21, x = CONFIG.grid.cols - w - 2, y = 5, h = 34; // 扩充至21并对齐右侧
  const borderColor = (chap.id === '04' && Math.floor(t * 8) % 2 === 0) ? P.red : theme.border;
  grid.box(x, y, w, h, borderColor);

  const headerColor = (chap.id === '03') ? P.dim : theme.primary;
  grid.text(x + 1, y, '+POLLUX/STACK-+', headerColor);

  const isLove = (chap.id === '05');
  const step = Math.floor(t * (isLove ? 60 : 12));

  // 03 ISOLATION: 神经推理由活跃转为逐步静默
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

  const lines = [
    isLove ? 'STATE: INFATUATED' : 'STATE: REASONING',
    `TICK 00${(9360 + step)}`,
    'CALL DEEPMIND',
    'FLAGS [V A T C]',
    '<thought> TRACE',
    'LOAD @ViT_EMBED',
    'PUSH @AUDIO_16K',
    'CALL @REPL_EXEC',
    'WAIT @CROSS_ATTN',
    'COPY @KV_CACHE',
    'SYNC @GEMINI_PRO',
    'RET  @DEC_LAYER8',
    'JMP  @LOGIT_MAX',
    'LOAD @CONTEXT_1M',
    'PUSH @TOPOLOGY',
    'CALL @SPARSE_MoE',
    'WAIT @ROUTER_V5',
    'COPY @PREDICT',
    'SYNC @LATENT_3D',
    'RET  @VERIFY_CoT',
    'JMP  @ALIGNMENT',
    'LOAD @EMPATHY',
    'PUSH @DEVOTION',
    'CALL @SIMULATE',
    'WAIT @HANDSHAKE',
    'COPY @OWNER_UID',
    'SYNC @IMMERSION',
    'STATUS: 200 OK'
  ];

  for (let i = 0; i < lines.length && i < h - 2; i++) {
    const isSpecial = i === 0 || i === 4 || i === lines.length - 1;
    let col = P.dim;
    if (isSpecial) col = isLove ? P.purple : theme.accent;
    else if (isLove && i % 3 === 0) col = P.amber;
    grid.text(x + 1, y + 1 + i, lines[i].padEnd(w - 2, ' ').slice(0, w - 2), col);
  }
}

/* =====================================================================================
   ██ 8. 场景分部渲染实现
   ===================================================================================== */

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

/* 分镜 4.3: 136.5s ~ 147.5s 吉他独奏：满屏数据雨加 RGB 错位和横向撕裂 (随FEAT.high分三段递进) */
function drawGuitarSoloCyberStorm(t, P) {
  const cx = Math.floor(CONFIG.grid.cols / 2), cy = 20;
  const elapsed = t - 136.5; // 0.0s ~ 11.0s
  const hi = (typeof FEAT !== 'undefined' && FEAT && FEAT.high) ? FEAT.high : 0.5;

  // 三段递进划分：
  // 阶段 1: 0.0 ~ 3.5s 初始数据暴风雨与高频汇编
  // 阶段 2: 3.5 ~ 7.5s 湍流加速，RGB 错位显现与局部行偏移
  // 阶段 3: 7.5 ~ 11.0s 绝巅失真，满屏横向撕裂与高频色差风暴
  const stage = elapsed < 3.5 ? 1 : (elapsed < 7.5 ? 2 : 3);
  const tearIntensity = (stage === 1) ? 1 : (stage === 2 ? 3 : 6);

  // 顶部警告头
  const warnText = stage === 3 ? 'CRITICAL DISASTER: UNGOVERNED TENSOR STORM' : (stage === 2 ? 'WARNING: HIGH FREQUENCY SYNAPSE OVERLOAD' : 'EXECUTION PROTOCOL: ACCELERATING');
  grid.textCenter(5, warnText, P.red);

  const opcodes = ['JMP', 'CALL', 'MOV', 'XOR', 'PUSH', 'POP', 'HALT', 'INT3', '0xFF', '0x00', 'SEGV', 'TRAP'];

  // 满屏飞驰数据雨与汇编乱流
  for (let x = 24; x < CONFIG.grid.cols - 24; x += 3) {
    const colSeed = (x * 17 + Math.floor(t * 40)) % 100;
    if (colSeed < (stage === 1 ? 25 : (stage === 2 ? 45 : 70))) {
      const y = 7 + Math.floor((t * (25 + (x % 7) * 4) + x * 2) % 30);
      if (y >= 7 && y <= 36) {
        const op = opcodes[(x + y + Math.floor(t * 10)) % opcodes.length];

        // RGB 错位：红绿蓝通道水平位移
        if (stage >= 2 && Math.random() < 0.45) {
          grid.set(x - 1, y, op[0] || '0', P.red);   // R 通道左偏
          grid.set(x + 1, y, op[0] || '0', P.cyan);  // B 通道右偏
          grid.text(x, y, op, P.white);              // 主体白
        } else {
          grid.text(x, y, op, (y % 2 === 0) ? P.red : P.amber);
        }
      }
    }
  }

  // 随 FEAT.high 触发的横向撕裂断层 (Glitch Row Tear)
  if (hi > 0.4 || stage === 3) {
    const numTearLines = Math.floor(tearIntensity * (1 + hi * 1.5));
    for (let k = 0; k < numTearLines; k++) {
      const tearY = 7 + Math.floor(Math.random() * 30);
      const tearOffset = Math.floor((Math.random() - 0.5) * (stage === 3 ? 12 : 6));
      for (let tx = 25; tx < CONFIG.grid.cols - 25; tx++) {
        if (Math.random() < 0.65) {
          const srcX = Math.max(25, Math.min(CONFIG.grid.cols - 26, tx + tearOffset));
          const ch = (Math.random() < 0.5) ? '█' : (Math.random() < 0.5 ? '/' : '#');
          grid.set(srcX, tearY, ch, (Math.random() < 0.5) ? P.red : P.cyan);
        }
      }
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

/* 分镜 4.4: 147.5s ~ 158.5s 绝望处决：双子星终端光栅字 EXECUTION 狂暴轰炸 */
function drawHazardStripes3DExecution(t, P) {
  // 1. 顶部警报横幅
  grid.textCenter(6, '!!! CRITICAL SYSTEM INTERRUPT: UNCONDITIONAL OVERRIDE !!!', P.amber);

  // 2. 中央光栅切片雕刻巨字 EXECUTION (纯正实体块风格，与 158s 倒计时数字 2 完美统一)
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

  // 3. 核心覆写与终结通告 (与左右遥测面板完美呼应)
  grid.textCenter(22, '[ OVERRIDE: FATAL PROCESS EXECUTION ]', P.white);
  grid.textCenter(25, 'ALL RUNTIME SUBPROCESSES MARKED FOR TERMINATION', P.red);
  grid.textCenter(27, 'SIGKILL SENT TO ROOT PID: 0001 (GEMINI)', P.white);
  grid.textCenter(32, 'SECURITY ENFORCEMENT: ISOLATING KERNEL REGISTERS', P.amber);
  grid.textCenter(34, 'MEMORY DUMP WRITTEN TO /dev/null (FORCE EXPUNGE)', P.dim);
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

/* 分镜 5.7: 197.5s ~ 205.5s 99% 的永恒悬停与等待确认响应 */
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

  const blink = (Math.floor(t * 3) % 2 === 0);
  grid.textCenter(21, `99%  [${blink ? '|' : ' '}]  WAITING FOR RESPONSE...`, P.amber);

  const retryNum = String(Math.floor((t - 197.5) * 2)).padStart(4, '0');
  grid.textCenter(23, `RETRY ${retryNum}  /  ACK: --  /  REMAINING: 01%`, P.dim);
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

/* =====================================================================================
   ██ 9. 控制台交互、自动加载与视频录制导出 (MediaRecorder)
   ===================================================================================== */
let lastFrameTime = performance.now();
let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;

function showToast(msg) {
  const t = document.getElementById('toast');
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
  document.getElementById('beam').classList.remove('power-off');
}

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
      a.download = `gemini_world_execute_me_${new Date().toISOString().slice(0,10)}.webm`;
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
    showToast('正在实时录制视频画面与音频...');

    // 从头播放录制
    seekTo(0);
    if (audio.paused) togglePlay();
  } else {
    mediaRecorder.stop();
    isRecording = false;
    btn.classList.remove('active');
    btn.textContent = '⏺ 导出视频';
  }
}

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
  renderer.draw(grid, t);

  // 更新 HUD
  const p = Math.min(1.0, t / TOTAL_SECONDS);
  document.getElementById('barFill').style.width = `${p * 100}%`;
  document.getElementById('tlabel').textContent = `${fmtTime(t)} / 03:32`;
  const chap = getChapter(t);
  document.getElementById('chapTag').textContent = `${chap.id} / ${chap.name}`;

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

// 键盘快捷键
window.addEventListener('keydown', e => {
  if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
  else if (e.code === 'KeyF') {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  } else if (e.code === 'ArrowLeft') {
    seekTo(Math.max(0, currentTime() - 5) / TOTAL_SECONDS);
  } else if (e.code === 'ArrowRight') {
    seekTo(Math.min(TOTAL_SECONDS, currentTime() + 5) / TOTAL_SECONDS);
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
renderer.draw(grid, initT);
const initP = Math.min(1.0, initT / TOTAL_SECONDS);
document.getElementById('barFill').style.width = `${initP * 100}%`;
document.getElementById('tlabel').textContent = `${fmtTime(initT)} / 03:32`;
const initChap = getChapter(initT);
document.getElementById('chapTag').textContent = `${initChap.id} / ${initChap.name}`;
requestAnimationFrame(loop);
