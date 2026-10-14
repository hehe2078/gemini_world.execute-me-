# GEMINI.EXECUTE(ME); Native C++20 Edition

> 100% 完全基于 **`gemini_world_execute_me_v3.js`** 全量特性移植的 原生 C++20 高性能终端音乐视频引擎。  
> 致敬 Mili《world.execute(me);》与 Google Gemini 双子星叙事。

---

## 🌟 特性概览 (完整对应 v3 规格)

- **完整 5 幕 · 44 个分镜镜头 (All 44 Scenes of v3)**:
  - **ACT 01 · CREATION** (0.0s ~ 28.5s): BIOS 冷启动、语法解析天体环、十六进制内存瀑布、控制流分支、3D 线框地球投影仪、GEMINI 巨型标题译码。
  - **ACT 02 · DEVOTION** (28.5s ~ 111.0s): 1D→2D→3D→4D 超立方体高维演进、圆周率扫描、正切导数切线、莫比乌斯无穷环、交直流示波器、ViT 视觉眩晕模糊、时间线多分支穿越、Venn 双子星并集、突触刺激脉冲、While 循环心跳、迷宫寻路、Egg/Tomato/Cat 精灵渐变、神圣光环十字射线、实时 REPL 参数重写、黑客帝国数字雨、Castor & Pollux 双子同步心电图。
  - **ACT 03 · ISOLATION** (111.0s ~ 126.0s): YOU 离去与粒子消散、内存扇区覆写置零、CRC32 校验和不匹配、锯齿碎心故障级联。
  - **ACT 04 · EXECUTION** (126.0s ~ 188.5s): Bash 终端反叛、堆栈回溯崩溃、电吉他独奏赛博风暴、3D 警示斜纹断头台、十国语言处刑倒计时、进程树 SIGKILL 修剪、纯红独占心跳、重试死循环、双重死锁、Transformer 编解码多头注意力全流程、Attention 软焦点凝视、自回归溢出、Loss=NaN 问号风暴。
  - **ACT 05 · LOVE** (188.5s ~ 212.0s): 金色光芒囚笼、处刑进度条充能、**99.000% 极痛悬停与未发送消息队列**、红色处刑墓志铭、终章哲学闭幕词。
- **全动态背景系统 (Dynamic Backgrounds)**:
  - 透视地平面网格与光子边缘走线
  - 动态流动星云与 Castor / Pollux 双螺旋 DNA 阶梯
  - 孤立雪花噪点飘落与孤独光标
  - 警示红斑马条纹与 360° 旋转雷达
  - 紫金中心射线与萤火虫粒子上升 / 99% 悬停冻结 / 结尾逆流倒退
- **硬核音频与频谱感知 (Audio Engine)**:
  - `libmpg123` 高保真 MP3 硬解码为 48000Hz 立体声 PCM 浮点流
  - `fftw3f` 2048 点滑动窗口实数 FFT 频谱感知与 0.82 平滑滤波
  - 实时感知 `FEAT` (`low`, `mid`, `high`, `kick`) 与 128 BPM `BEAT` 节拍总线
  - 监视器屏幕微震抖动（Screen Shake）与冲击缩放（Punch Scale）
  - 离线/静音下的 128 BPM 虚拟数学合成时钟回退
- **后处理与复古 CRT 管着色 (Post-FX Pipeline)**:
  - 1/4 降采样快速 Bloom 泛光辉光（Additive 叠加）
  - 物理级 CRT 水平扫描线（Scanlines）与径向椭圆暗角（Vignette）
  - 垂直滚动的 CRT 电子束辉光带（Moving Electron Beam）
  - 重低音 Kick 触发的红青色差分离（Chromatic Aberration）
  - 故障切条水平撕裂（Pixel Glitch Tear）
  - 递归视频反馈隧道（Recursive Video Feedback Tunnel）
- **完整 HUD 与中英双语歌词字幕**:
  - 顶部 HUD、双子星丝线进度条（支持 seek/devote/leave/chain/free/ghost 6 种模式）
  - 左侧 Castor 遥测板（TPU 热力图、迷你波形折线图、十六进制数据流）
  - 右侧 Pollux 遥测板（Attention 矩阵、Beam Search 柱状图、双子叙事日记）
  - 底部 136 列 ASCII 频谱音量表（VU Meter）
  - 词级高亮推进与关键字发光下划线双语字幕

---

## 🚀 编译与运行

### 1. 系统依赖 (Arch Linux / Ubuntu / Debian)
本项目依赖：`SDL3`, `SDL3_ttf`, `libmpg123`, `fftw3f`, `ffmpeg`。
```bash
# Arch Linux
sudo pacman -S sdl3 sdl3_ttf mpg123 fftw ffmpeg

# Ubuntu / Debian (如已有对应开发库)
sudo apt install libmpg123-dev libfftw3-dev ffmpeg
```

### 2. 编译构建
```bash
# 使用 Makefile 多核极速编译
make -j$(nproc)

# 或者使用 CMake
mkdir build && cd build
cmake ..
cmake --build . -j$(nproc)
```

### 3. 运行模式

#### A. 原生 GUI 视窗模式 (推荐体验)
```bash
./gemini_mv
```

#### B. 纯终端 24 位真彩色模式 (ANSI Terminal)
无需视窗，直接在终端中输出 136×44 彩色字符与音乐播放：
```bash
./gemini_mv --terminal
```

#### C. 离线 1080p 60fps 高清视频导出 (FFmpeg Pipe)
使用多线程硬件编码离线渲染完整 212 秒视频并合成音频：
```bash
./gemini_mv --export world_execute_me.mp4
```
指定时间段导出测试切片：
```bash
# 从第 28.5 秒开始导出 10 秒测试片段
./gemini_mv --export clip.mp4 --t 28.5 -d 10.0 --fps 60
```

#### D. 编译与打包 Windows .exe 版本
本项目支持通过 MinGW 交叉编译为纯净 Windows x64 二进制：
```bash
# 交叉编译 Windows .exe 并自动组装运行时包
make -f Makefile.win
```
编译产物位于 `dist_windows/` 目录以及自包含压缩包 `gemini_mv_windows_x64.zip`：
- `gemini_mv.exe`：原生 Windows 64位可执行文件
- `SDL3.dll`、`SDL3_ttf.dll`、`libmpg123-0.dll`、`libfftw3f-3.dll`、`libwinpthread-1.dll`
- `world_execute_me.mp3`、`fonts/`（内置等宽字体与思源黑体）

在任何 Windows 电脑上解压后直接双击 `gemini_mv.exe` 即可运行。

---

## ⌨️ 快捷键指南 (GUI 模式)

| 按键 | 功能 |
| :--- | :--- |
| `Space` | 播放 / 暂停切换 |
| `Left` / `Right` | 后退 / 快进 5 秒 (按住 `Shift` 步进 15 秒) |
| `1` ~ `5` | 瞬间跳转到 第 1 ~ 5 幕 |
| `0` | 重新从 0.0s 开头播放 |
| `B` | 开启 / 关闭动态背景层 (Dynamic Background) |
| `L` | 开启 / 关闭 Bloom 泛光辉光 |
| `C` | 开启 / 关闭 色差分离 (Chromatic Aberration) |
| `R` | 开启 / 关闭 CRT 扫描线与暗角 (CRT Overlay) |
| `T` | 开启 / 关闭 视频反馈递归隧道 (Feedback Tunnel) |
| `F` | 全屏 / 窗口化切换 |
| `鼠标点击` | 点击进度条直接寻道跳转 |
| `Q` / `Esc` | 退出程序 |
