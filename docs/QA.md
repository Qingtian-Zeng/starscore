# StarScore QA 记录

## 交付验证增量（2026-10-06）

- 本地运行证据：`node scripts/verify-deployment.mjs http://127.0.0.1:5173` 返回 Web 200、`modelConfigured:false`、provider `rules`、A/B 各 6 音。
- 当前演奏页截图已在交付会话中实际截取；页面显示“规则演示回应”、三声部开关、原旋律青色与规则回应紫色。该截图是 Web 运行证据，不是 APK 安装截图。
- GitHub Actions 仅完成配置和静态核对；当前无 Git 仓库，未产生云端运行记录或 artifact。
- Compose 仅完成自动化 smoke 配置；本机无 Docker，容器状态仍为受阻。
- 三个真实模型环境变量均缺失，故 model 候选、试听、采用、撤销、保存仍为受阻，现有 rules 结果未冒充 model。

## 阶段 6 App/部署验收（2026-10-06）

- 已通过：`npm run build`；core/API/Web 生产构建完成，主 JS 573.03 kB（gzip 168.07 kB），仅有非阻断分块提示。
- 已通过：`npm run check`；core 11/11、API 3/3、Web 1/1 测试通过，TypeScript 检查无错误。
- 已通过：Capacitor Android 平台创建、3 个插件同步和 Web 资源复制；Gradle 8.14.3、minSdk 24、compile/target SDK 36 已生成。
- 已通过：本地生产 API 实启，`GET /api/health` 返回 `{"ok":true,"modelConfigured":false}`；OPTIONS 返回 204 和 `Access-Control-Allow-Origin: https://localhost`，未知来源不反射。
- 待执行：APK、安装截图、模拟器、真机首次触摸音频/拖动/后台恢复/持久化/系统文件选择与分享/重复播放生命周期。原因是本机没有 JDK 与 Android SDK。
- 待执行：Docker Compose 实启及线上 HTTPS 部署。原因是本机没有 Docker且未提供部署环境。
- 待执行：真实 AI、10 组人工听感、外部 DAW。模型配置与人工/外部环境均缺失；规则演示不作为真实 AI 证据。
- 资源说明：`assets/icon.svg` 与 `assets/splash.svg` 已交付；自动密度资源生成因 sharp/libvips 下载超时失败，当前 Android 工程仍为默认图标资源。

更新时间：2026-10-06（北京时间）

## 阶段 4 环境

- Windows，Node.js 24.19.0，npm 11.17.0。
- Codex 内置 Chromium，Web `http://127.0.0.1:5173/`，API `http://127.0.0.1:8787/`。
- 模型环境变量 `STARSCORE_MODEL_BASE_URL`、`STARSCORE_MODEL_NAME`、`STARSCORE_MODEL_API_KEY` 均未配置。
- 因缺少模型配置，本轮真实模型调用验证未执行；界面明确显示“规则演示”，真实 AI 按钮禁用，不将规则结果标成 AI。

## 自动化结果

- `npm run build`：通过。core、Fastify API、Web 均生成生产构建；Web 主 JS 554.24 kB（gzip 161.47 kB），仅有非阻断的分块大小提示。
- `npm run check`：通过。core 11/11、API 2/2、Web 1/1。
- core：两个候选均通过 4—8 音符、音阶、240 tick 网格、时值、力度、后两小节和 ID 唯一性校验；采用前后原旋律 ID、音高、时间、时值、力度完全一致；旧 `seedRevision` 采用被拒绝。
- API：健康检查不暴露密钥；无模型配置时 rules 返回两个合法候选，model 请求返回可识别的 `MODEL_NOT_CONFIGURED`。

## 浏览器完整流程

1. 打开本地“夜航 · 导入”，API 健康检查显示模型未配置。
2. 点击“生成回应”，出现候选 A、B，各 6 颗紫色回应星，来源显示“规则演示”。
3. 点击候选 A“试听”，播放控制切换为“停止”；试听使用原旋律和临时候选组成的四小节临时项目。
4. 停止并采用 A，状态显示“已采用候选 A，可撤销”，画布显示 6 颗紫色回应星。
5. 撤销后紫色回应星 6→0，重做后 0→6，证明采用是单个历史操作。
6. 保存并刷新，页面显示“已从本机作品库打开”，6 颗回应星仍在。
7. 实际点击页面 JSON 和 MIDI 下载控件，浏览器分别生成 `C:\Users\Administrator\Downloads\夜航 · 导入.starscore.json` 与 `C:\Users\Administrator\Downloads\夜航 · 导入.mid`。
8. 从下载路径重新读取：JSON 完整校验通过，lead 12 个音符，其中回应 6 个，来源 `rules`；MIDI 重新解析为 PPQ 480、90.00009 BPM、4/4、三轨，轨道音符数 24/8/40。

## 失败与过期保护

- 请求携带 `requestId`、`projectId`、`seedRevision`，响应在服务端和客户端分别校验。
- 请求期间编辑不被锁定；响应到达时若项目或 `seedRevision` 已变化，结果进入 stale，不进入作品。
- 切换项目会中止当前请求；超时、网络错误、非法模型 JSON 均只更新错误状态，不改项目。
- model 失败会展示错误和“切换规则演示”动作，不静默伪装成模型成功。

## 尚未完成

- 真实模型调用：缺少服务端模型地址、名称与密钥，因此未调用、未记录供应商响应，也未完成 10 组模型听感比较。
- 人工听感与外部 DAW 试听未执行；浏览器只确认音频调度和播放状态，MIDI 只完成程序化重新解析。
- 手机真机、Safari、Firefox 未测试。

## 阶段 5 Web 最终验收（2026-10-06）

### 三页面与响应式

- `#/studio/:projectId`、`#/library`、`#/play/:projectId` 实际导航通过。
- 1440×900 截图：画室、作品库、演奏页无横向溢出；桌面画室保持大画布与右侧编辑/候选区。
- 390×844 截图：三个页面无横向溢出。画室画布与粘性底栏边界分别为 709.6px / 711.6px；演奏页播放控制底部为 807px，未超过 844px 视口。
- 作品库缩略图来自真实音高和 `layout.notes.xNorm`；rules/model 回应显示紫色，不使用静态截图。
- 键盘音符列表可选择；减少动态开关实际设置 `html[data-motion=reduced]`。

### 创作闭环

- 新建星图后在不同画布位置点出 6 颗星。
- 最后一颗音长修改为 0.5 拍，力度通过真实 range 控件修改为 55%。
- 播放/停止成功；低音声部关闭再开启。
- 规则 provider 返回候选 A/B；候选试听进入播放状态，采用后画布显示 6 颗回应星。
- 采用撤销后回应星 6→0，重做后 0→6。
- 保存导航到 `#/studio/project-69qj4bfe`；刷新保留 6 颗回应星；从作品库重新打开一致。
- JSON 下载后通过页面导入得到新 ID `project-muwgimp6-c5zs0p`，未覆盖原项目。
- 下载文件程序化回读：JSON 合法，lead 12、response 6、provider rules；MIDI PPQ 480、90.00009 BPM、4/4、三轨，音符数 24/8/40。

### 生命周期与错误恢复

- 演奏页连续 10 轮播放/停止后回到“播放作品”，控制台 0 error。
- 播放中切换到作品库，页面正常卸载且控制台 0 error；音频引擎卸载调用 `dispose()` 清除 Transport、计时器和节点。
- 演奏页未知项目显示“我的星系”“返回画室”；画室未知项目保留内存示例并提供作品库/JSON 恢复入口。
- 空白稿、生成失败、保存失败、无效导入继续沿用原有非破坏提示。

### 未完成事实

- 三个模型环境变量仍未配置，真实 AI 调用待验收。
- 10 组合法输入已写入 `docs/AI_LISTENING_CASES.md`，尚未实际提交模型或人工试听。
- 人工听感、外部 DAW、手机真机、Safari、Firefox 均未执行。
