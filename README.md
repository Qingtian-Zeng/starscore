# 星谱 StarScore

> 阶段 6：Capacitor Android 工程位于 `apps/web/android`。安装 JDK 21 和 Android SDK 后运行 `npm run android:sync`，再执行 `apps/web/android/gradlew.bat assembleDebug`。App 构建用 `VITE_API_BASE_URL` 指向真机可达的 HTTPS API，模型密钥只保存在服务端。生产部署从 `.env.example` 建立 `.env` 后运行 `docker compose up --build -d`；详见 `docs/APP_BUILD.md`、`docs/DEPLOYMENT.md` 与 `THIRD_PARTY_NOTICES.md`。

画一片星空，听它长成音乐。当前实现开发计划的阶段 0–1：可在星图画布点星、选择与拖动星点，并使用 Tone.js 真实合成播放。

## 运行

```bash
npm install
npm run dev:web
```

阶段 4 候选功能需要同时启动本地 API：

```bash
npm run dev:api
npm run dev:web
```

规则演示无需模型配置。真实模型适配器只从服务端读取 `STARSCORE_MODEL_BASE_URL`、`STARSCORE_MODEL_NAME`、`STARSCORE_MODEL_API_KEY` 和可选的 `STARSCORE_MODEL_TIMEOUT_MS`；密钥不会进入 Web 构建或项目文件。适配器调用兼容 OpenAI Chat Completions 的 `/chat/completions` JSON 接口，并用共享音乐契约再次校验结果。

候选在采用前只存在于页面临时状态，不进入 IndexedDB、JSON 或 MIDI。采用后写入后两小节并记录 `responseMeta.provider`，且采用操作可以撤销。

打开终端给出的本地地址。浏览器要求音频由用户手势启动，因此首次播放或点星试听时需要点击页面控件。

## 验证

```bash
npm run build
npm run check
```

阶段范围与实际验证记录见 `docs/PROGRESS.md`。

页面入口：

- `#/studio` 或 `#/studio/:projectId`：星图画室。
- `#/library`：我的星系。
- `#/play/:projectId`：使用同一份本地作品数据的演奏页。

推荐同时运行 `npm run dev:api` 与 `npm run dev:web`。演奏页和规则候选需要 Web 能访问同源 `/api`；Vite 开发服务器会代理到本机 8787 端口。

## 本地作品与文件交换

- “保存”会把完整项目写入当前浏览器的 IndexedDB；数据只在当前设备和浏览器配置中存在，不是云同步。
- “我的星系”可以打开或复制本地作品。复制品使用新的项目 ID。
- JSON 导出包含可继续编辑的乐谱、三声部、混音开关和星图布局；导入会先完整校验，并始终创建新项目。
- MIDI 导出包含 90 BPM、4/4、旋律、规则低音与鼓三个声部，并复制为两轮八小节。MIDI 不保存星图布局，继续完整编辑请使用 `.starscore.json`。
- 本机 `#/studio/...` 地址只用于打开当前设备的数据，不是公开分享链接。
