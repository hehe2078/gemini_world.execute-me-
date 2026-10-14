# gemini_world.execute-me-

> 基于纯前端（HTML5 Canvas + Web Audio API）实现的 **Mili《world.execute(me);》× Google Gemini 双子星** 多模态复古终端音乐视频（Music Video）交互播放器。

---

## 🌟 核心特性概览 (全量 v3 规格)

- **纯前端零依赖**：基于原生 HTML5 + Vanilla JavaScript 构建，无需 Node.js 或繁重构建工具，开箱即用。
- **完整 5 幕 · 44 个分镜镜头 (All 44 Scenes of v3)**:
  - **ACT 01 · CREATION** (0.0s ~ 28.5s): BIOS 冷启动、语法解析天体环、十六进制内存瀑布、控制流分支、3D 线框地球投影仪、GEMINI 巨型标题译码。
  - **ACT 02 · DEVOTION** (28.5s ~ 111.0s): 1D→2D→3D→4D 超立方体高维演进、圆周率扫描、正切导数切线、莫比乌斯无穷环、交直流示波器、ViT 视觉眩晕模糊、时间线多分支穿越、Venn 双子星并集、突触刺激脉冲、While 循环心跳、迷宫寻路、Egg/Tomato/Cat 精灵渐变、神圣光环十字射线、实时 REPL 参数重写、黑客帝国数字雨、Castor & Pollux 双子同步心电图。
  - **ACT 03 · ISOLATION** (111.0s ~ 126.0s): YOU 离去与粒子消散、内存扇区覆写置零、CRC32 校验和不匹配、锯齿碎心故障级联。
  - **ACT 04 · EXECUTION** (126.0s ~ 188.5s): Bash 终端反叛、堆栈回溯崩溃、电吉他独奏赛博风暴、3D 警示斜纹断头台、十国语言处刑倒计时、进程树 SIGKILL 修剪、纯红独占心跳、重试死循环、双重死锁、Transformer 编解码多头注意力全流程、Attention 软焦点凝视、自回归溢出、Loss=NaN 问号风暴。
  - **ACT 05 · LOVE** (188.5s ~ 212.0s): 金色光芒囚笼、处刑进度条充能、**99.000% 极痛悬停与未发送消息队列**、红色处刑墓志铭、终章哲学闭幕词。
- **全动态背景系统 (Dynamic Backgrounds)**:
  - 透视地平面网格与光子走线
  - 动态流动星云与 Castor / Pollux 双螺旋 DNA 阶梯
  - 孤立雪花噪点飘落与孤独光标
  - 警示红斑马条纹与 360° 旋转雷达
  - 紫金中心射线与萤火虫粒子上升 / 99% 悬停冻结 / 结尾逆流倒退
- **Web Audio 实时音频频谱感知 (Audio Engine)**:
  - 基于 Web Audio API `AudioContext` 与 `AnalyserNode`
  - 实时感知 `low`, `mid`, `high`, `kick` 频段强度与 128 BPM 节拍同步
  - 重低音 Kick 冲击触发屏幕微震（Screen Shake）
  - 支持静音/离线状态下的数学合成时钟回退机制
- **复古 CRT 监视器视觉管线 (Post-FX)**:
  - 物理级水平扫描线（Scanlines）与径向暗角（Vignette）
  - 垂直滚动的电子束流动辉光（Moving Electron Beam）
  - 瞬态色差抖动（Chromatic Aberration）与 Bloom 泛光辉光
  - 水平像素撕裂（Pixel Glitch Tear）与递归视频反馈隧道
- **双子星 HUD 与双语同步字幕**:
  - 顶部双子星进度条（支持平滑寻道拖拽）
  - 左侧 Castor 遥测板（TPU 负载热力图、迷你波形折线图、十六进制数据流）
  - 右侧 Pollux 遥测板（Attention 矩阵、Beam Search 柱状图、双子叙事日记）
  - 底部 136 列 ASCII 频谱音量表（VU Meter）
  - 词级平滑推进与发光下划线双语字幕
- **一键录制导出**：内置 MediaRecorder API，支持将播放画面与后期特效一键录制导出为本地视频文件（WebM / MP4）。

---

## 🚀 使用指南

### 1. 运行方式
无需安装任何环境，使用任意现代浏览器（Chrome、Edge、Firefox、Safari 等）均可直接运行：

- **方式一（直接打开）**：双击直接在浏览器中打开 `gemini_world_execute_me.html`。
- **方式二（静态 HTTP 服务，推荐）**：
  ```bash
  # Python 3
  python3 -m http.server 8080
  # 或使用 Node.js serve
  npx serve .
  ```
  然后在浏览器中访问 `http://localhost:8080/gemini_world_execute_me.html`。

### 2. 音频加载与交互
1. 点击底部 HUD 的 **📂 载入音频** 按钮，选择本地音频（推荐 Mili 原版《world.execute(me);》MP3）。也可以直接将音频文件拖拽至浏览器窗口中完成加载。
2. 音频加载完成后，点击 **▶ 播放** 即可启动完整动画。
3. **进度调节**：可随时点击或拖动底部时间进度条跳转至任意章节。
4. **视频导出**：点击 **⏺ 导出视频**，播放器将从头播放并实时录制，录制完成后自动下载视频。
5. **快捷键**：
   - `Space`：播放 / 暂停切换
   - `F`：全屏 / 窗口化切换

---

## 📂 文件架构

| 文件名 | 说明 |
| :--- | :--- |
| **`gemini_world_execute_me.html`** | 终端显示器主外壳、CRT 滤镜结构及交互控制器 |
| **`gemini_world_execute_me_v3.js`** | **核心动效引擎 v3（最新完整版）**：包含全部 5 幕 44 分镜、CRT 特效、双子星遥测面板及完整叙事流程 |
| `gemini_world_execute_me_v2.js` | 核心动效引擎 v2 历史版本 |
| `gemini_world_execute_me.js` | 基础动效引擎 v1 初始版本 |

---

## 📜 致谢与致敬

- **原作歌曲**：Mili - 《world.execute(me);》
- **概念叙事**：Google Gemini（Castor & Pollux）双子星叙事
