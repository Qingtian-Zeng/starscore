# 星谱（StarScore）Codex开发计划与指令

## v0.2.1 交付追加（2026-10-07）

- 已核对确认版 HTML SHA-256 `3a0887036391a6f99d7564795d4ef28b61821b2b3928cd243faae6a312d5b4b3` 并保存参数快照。
- 已将确认界面默认值合并到正式 Web/Android，版本升至 0.2.1 / versionCode 3；数据兼容边界不变。
- 已完成本地 build/check、浏览器关键流程、云端 Compose/Android 构建、APK 元数据与签名验证，并发布预发行版。
- 后续仍是设备和人工验收：真机安装、系统分享、人工听感、外部 DAW、真实模型与公网 HTTPS。

## v0.2.0 整合计划与状态（2026-10-07）

- [x] 从远端 `main` 建立独立 worktree，并校验交接包全部 SHA-256。
- [x] 合并银河社区、十二星座、星谱素材、来源返回与音频生命周期更新。
- [x] 正式 Web/App 接入离线规则回应、静态下载和 Android 星系系统分享。
- [x] 保持正式数据库、项目契约、应用 ID；Android 提升到 versionCode 2 / versionName 0.2.0。
- [x] 完成本地 build/check、新增回归、交接 DOM 验证和 390×844 浏览器流程。
- [ ] 推送分支、云端构建新版 APK、发布 v0.2.0 并回填最终证据。
- [ ] 真实模型、模拟器/真机、人工听感、外部 DAW 和公网 HTTPS 仍需外部环境。

以下旧阶段计划保留为历史，不应重新执行阶段 0—1。

版本：v0.1  
日期：2026-10-05（北京时间）  
依赖文件：同目录PRD.md。  
用途：让Codex按明确范围生成工程，每个阶段有真实可验证的交付。  
当前包中只有需求与指令文档；本节目标工程目录与以下代码文件均待实施。

## 1. 实施原则

先读取PRD.md，再读取本文；若当前仓库已有AGENTS.md，也读取其适用要求。用户最新明确指令优先于本文。检查现有文件后增量工作，保留已有改动，不覆盖整个仓库。

默认按阶段依赖顺序推进；用户只指定阶段0—1时，完成这一范围即可。授权范围内完成实现和验证，不在每个普通文件编辑后重复请求许可。只有确实缺失的外部配置影响对应能力时，清楚记录阻塞，继续不依赖该配置的任务。

从一条真实可运行的音乐路径开始。完整制作应逐步完成真实界面、音乐逻辑、持久化与模型；不能把静态效果、按钮动画、伪数据和预置回复当作全部功能已完成。

具体要求：
- 同一份项目数据驱动画布、音频、持久化与导出。
- 核心逻辑与UI、音频适配器分离；不提前增加复杂框架。
- 规则伴奏与规则演示候选始终显示其实际来源。
- 模型返回的字段先通过校验，才能写入候选或项目。
- 每个阶段验证通过后再依次扩展；失败先定位与修复。
- 汇报实际完成文件、运行命令、验证证据和未验证项。
- 阶段完成更新docs/PROGRESS.md；恢复工作时先核对该文件与实际实现。
- 依赖版本以安装和验证结果锁定，不盲用仓库dev版本。
- 无API配置可以完成离线演示；真实AI验收保留为未完成，不伪造结果。
- 首轮不引入三维、云作品库、账户、多人协作或整段音频大模型。

## 2. 最终工程目录

以下是计划生成的目录，以阶段实际创建；不要先制造大量空文件。

```text
starscore/
  docs/
    PRD.md
    CODEX_PLAN.md
    PROGRESS.md
    QA.md
    DEPLOYMENT.md
    APP_BUILD.md
  apps/
    web/
      index.html
      package.json
      vite.config.ts
      capacitor.config.ts
      src/
        main.tsx
        app/
          App.tsx
          router.tsx
        pages/
          StudioPage.tsx
          LibraryPage.tsx
          PlayerPage.tsx
        features/
          studio/
            StarCanvas.tsx
            NoteInspector.tsx
            studioReducer.ts
            geometry.ts
          audio/
            AudioEngine.ts
            instruments.ts
            schedule.ts
          ai/
            AiPanel.tsx
            apiClient.ts
            candidateState.ts
          projects/
            projectRepository.ts
            ProjectCard.tsx
          export/
            exportProject.ts
            exportMidi.ts
        components/
          TransportBar.tsx
          TrackControls.tsx
          StatusNotice.tsx
        styles/
          tokens.css
          global.css
        fixtures/
          night-voyage.ts
      android/
    api/
      package.json
      .env.example
      src/
        server.ts
        config.ts
        routes/
          responses.ts
        providers/
          types.ts
          ruleProvider.ts
          remoteProvider.ts
  packages/
    core/
      package.json
      src/
        project.ts
        constants.ts
        validation.ts
        music.ts
        commands.ts
        fixtures.ts
      tests/
        music.test.ts
        project.test.ts
        candidates.test.ts
  tests/
    e2e/
      studio.spec.ts
      projects.spec.ts
      candidates.spec.ts
  deploy/
    Dockerfile.web
    Dockerfile.api
    compose.yml
    Caddyfile
  README.md
  THIRD_PARTY_NOTICES.md
  package.json
  package-lock.json
  tsconfig.base.json
```

这是轻量npm工作区：apps/web、apps/api、packages/core。只有两份输入文档已生成；PROGRESS、QA、部署、App构建文件由对应阶段产生。

模块责任：
- core：纯TypeScript乐谱与事件校验、路径命令、时间转换，不导入React、Canvas或Tone.js。
- web：交互、渲染、音频、IndexedDB、导出。Tone.js只存在于浏览器音频层。
- api：配置、provider调用、输入/输出校验。复用core，不能导入web的音频模块。
- studioReducer：创作状态与操作历史；播放状态、临时候选、持久项目的生命周期分清。
- AudioEngine：统一初始化、播放、停止、试听、候选试听、释放资源；不要在组件中散落多个时钟。
- geometry：坐标、命中、吸附、Canvas缩放；音乐时间不依赖画布像素。

## 3. 先建立统一运行命令

这是待Codex实现的命令契约，当前文档包没有这些可执行脚本。

| 命令 | 阶段与作用 |
|---|---|
| npm install | 阶段0首次安装并生成根锁文件 |
| npm ci | 锁文件存在后按锁定版本安装 |
| npm run dev:web | 阶段0起运行Web |
| npm run dev:api | 阶段4起运行API |
| npm run dev | 阶段0先启动Web；阶段4加入API联合运行 |
| npm run build | 构建当时已创建的工作区 |
| npm run check | 类型检查、必要lint与核心测试 |
| npm run test:e2e | 阶段5起关键浏览器流程 |
| npm run mobile:sync | 阶段6起同步原生项目 |

选用当前环境可用的Node.js LTS，检查Vite、Vitest和其他依赖的engines及互相兼容性；将实际版本记录在README，不用一条“安装最新”替代验证。最终所有已实现脚本必须能执行，尚未实现脚本不要伪造为成功。

本地端口约定：Web 5173，API 8787；可通过配置改变。Web请求相对路径/api，开发环境用Vite代理，发布环境用同源代理。

## 4. 阶段0：工程与领域骨架

**可见结果：** 页面显示星谱名称、深蓝画布区域与可识别的播放控件；基础工程可启动。

生成：
- 根npm工作区、TypeScript配置、README、依赖声明和锁文件。
- apps/web React＋TypeScript＋Vite工程。
- packages/core的项目类型、音乐常量、最小校验、示例数据。
- styles/tokens.css与global.css。
- docs/PROGRESS.md，初始状态只标记本阶段实际完成部分。

先固定：
PPQ 480；4/4；90 BPM；用户区0—3840；回应区3840—7680；旋律集合60/62/64/67/69/72/74/76。具体约束以PRD为准。

“夜航”用户旋律可用：
```text
pitch:        60, 64, 67, 69, 67, 64
durationTick:480,480,480,480,960,960
startTick:   0, 480,960,1440,1920,2880
```
该段正好3840 tick，是确定性音乐示例，不是模型生成证据。

验收：
- npm run dev:web可启动，npm run build与npm run check通过。
- core可在无window/document的Node环境导入。
- 示例时值正确，项目数据可以序列化。
- 不在此阶段依赖模型密钥或外部音色下载。

## 5. 阶段1：点星与真实发声

**可见结果：** 用户点出四颗星，点击播放能听见它们依次发声；拖高一颗星能听出音高改变。

覆盖：FR-01、FR-02、FR-03、FR-06基础、FR-14基础。

生成：
- StudioPage、StarCanvas、geometry、最小studioReducer。
- AudioEngine、instruments、schedule。
- TransportBar和选中状态的最小界面。

实施：
1. 默认显示示例，提供空白新建。
2. 点空白创建音符，点已有节点只选择；允许0—8颗，默认一拍。
3. 规范化水平位置；纵向吸附到允许音高。
4. 所有事件读取core项目数据，按音频时钟安排。
5. 用合成器真实播放，不使用音效文件模拟“音乐完成”。
6. 用户手势初始化音频，启动失败反馈与重试。
7. 星体闪烁按音乐事件时间触发，播放头沿连接路径。
8. 编辑时停止完整播放，单音试听节流；再次播放从起点开始。
9. 离开页面、切项目、网页进入后台和组件卸载时停止并清理调度及声音；回到前台由用户重新播放。

验收：
- 点四颗星后真实顺序发声；上下拖动音高改变。
- 水平拖动不改变乐谱时间、音高或顺序。
- 第9颗星不会添加；空项目不会启动无效播放。
- 播放/停止/重播10次无重复调度。
- 当前脚本构建与检查通过，记录实际浏览器试听结果。
- 提交本阶段截图或预览说明，同时列明没有测试的设备。
- 若工具只能验证页面而无法听音，不能把“试听通过”写成已完成。

## 6. 阶段2：编辑与同步伴奏

**可见结果：** 星尾、光晕、连线操作真实改变音乐；轨道让原旋律形成简短合奏。

覆盖：FR-04、FR-05、FR-07、FR-08；补齐FR-06/FR-14。

生成：
- NoteInspector、core命令与边界校验。
- TrackControls、规则低音与鼓环。
- 撤销/重做历史与操作合并。

实施：
1. 音长选项0.5/1/2拍；用户区总计最多8拍；剩余时间留白。
2. 力度调节同时改变声音与视觉，保持允许范围。
3. 连线模式执行“将B放到A之后”的单链重排，重算用户起始时间。
4. 删除节点后自动重建路径。
5. 一次完整拖动为一次历史操作，历史最多50步。
6. 低音与鼓使用规则事件，来源明确。鼓环八个位置跟随同一时钟。
7. 声部开关使用增益控制；不得独立启动不同节拍器。
8. 限制增益、同时发声数量与效果尾音，试听不堆积节点。

验收：
- 音长超预算时项目保持原样并提示，不能悄悄截掉其他音符。
- 自连接、重复节点或分叉不会破坏路径。
- 撤销/重做恢复可听见的音符、顺序与参数。
- 鼓环可增删并修改敲击类型；四小节重复时同步。
- 连续20轮循环观察调度和节点生命周期，并实际试听节拍。
- 核心测试覆盖预算、边界、重排完整性和删除后时间，不为发光颜色写测试。

## 7. 阶段3：作品保存与文件交换

**可见结果：** 用户给星图命名，刷新后仍可打开；导入同一项目文件恢复作品，MIDI能继续用于创作。

覆盖：FR-10、FR-11、FR-12。

生成：
- LibraryPage、projectRepository、ProjectCard。
- exportProject、exportMidi、序列化与导入验证。
- #/studio与#/library导航。

实施：
1. 项目完整写入IndexedDB，保存成功后再显示“已保存”。
2. 新建、命名、复制、重开；复制使用新ID。
3. JSON包含schemaVersion、音乐与布局等PRD字段。
4. 导入先验证，生成新ID，不能覆盖当前项目。
5. 拒绝未知高版本、无效数值、过大文件、过多事件和音乐越界。
6. 存储失败保留内存稿，仍允许JSON导出。
7. MIDI导出默认两轮八小节；换算导出库实际PPQ；保留三声部与速度。
8. 无未接受候选进入持久乐谱或MIDI。
9. 增补README的导入、导出与本地数据说明。

验收：
- 保存后刷新、重开，音符与布局一致。
- 同一JSON可导入新ID并播放，完整还原允许字段。
- 无效导入不破坏正在编辑的稿。
- MIDI重新解析后验证音高、时值、力度、BPM和总时长。
- 两轮导出不把项目本身改为八小节。
- 本机路由不显示成公开分享链接。

## 8. 阶段4：候选流程与真实AI

**可见结果：** 紫色回应星座有两种候选，用户能比较、接受或取消；真实调用与规则演示可辨认。

覆盖：FR-09，并验证FR-08的候选接受撤销。

生成：
- apps/api、config、responses路由。
- provider接口、ruleProvider、remoteProvider。
- web的AiPanel、apiClient、candidateState。
- 共享请求/响应校验、API错误与限流处理。
- apps/api/.env.example，更新根开发脚本。

建议环境字段：
```dotenv
PORT=8787
AI_MODE=rules
AI_BASE_URL=
AI_MODEL=
AI_API_KEY=
AI_TIMEOUT_MS=30000
```
这些是配置字段约定；AI_MODE允许rules或model，真实协议由选用provider适配器负责。密钥只放服务端实际.env中，不提交、不打印，不用VITE_前缀暴露。

实施：
1. 按PRD定义/api/health与POST /api/ai/responses。
2. rules模式生成确定性合法候选，始终显示“规则演示回应”。
3. remoteProvider依据所选服务官方文档实现；不要凭空假定所有API支持相同JSON Schema参数。
4. 服务端把来源设为model或rules，模型不能自报身份。
5. 校验两个候选的音符数、集合、量化、区间和单声部关系；前端再次校验。
6. 候选四小节试听用同一AudioEngine，暂停原项目。
7. 接受只写回应区并记入历史；取消不改原稿。
8. requestId/projectId/seedRevision不匹配的晚到结果作废；切项目中止旧请求。
9. 新请求不抹掉已接受回应，接受才替换。
10. 改原旋律后旧回应保留并提示待更新，未接受候选失效。
11. 模型失败保留当前稿，提供重试或明确的规则模式切换。
12. 真实模型可用时完成至少一次服务端调用；记录配置来源及结果，不记录密钥。

合法结构示例（仅供接口与校验实现；不是模型调用记录）：
```json
{
  "requestId": "req-id",
  "projectId": "project-id",
  "seedRevision": 3,
  "provider": "rules",
  "candidates": [
    {
      "id": "candidate-a",
      "label": "规则回应 A",
      "notes": [
        {"id": "a1", "pitch": 60, "startTick": 3840, "durationTick": 960, "velocity": 0.65, "origin": "rules", "editedByUser": false},
        {"id": "a2", "pitch": 64, "startTick": 4800, "durationTick": 960, "velocity": 0.65, "origin": "rules", "editedByUser": false},
        {"id": "a3", "pitch": 67, "startTick": 5760, "durationTick": 960, "velocity": 0.65, "origin": "rules", "editedByUser": false},
        {"id": "a4", "pitch": 64, "startTick": 6720, "durationTick": 960, "velocity": 0.65, "origin": "rules", "editedByUser": false}
      ]
    },
    {
      "id": "candidate-b",
      "label": "规则回应 B",
      "notes": [
        {"id": "b1", "pitch": 67, "startTick": 3840, "durationTick": 960, "velocity": 0.65, "origin": "rules", "editedByUser": false},
        {"id": "b2", "pitch": 69, "startTick": 4800, "durationTick": 960, "velocity": 0.65, "origin": "rules", "editedByUser": false},
        {"id": "b3", "pitch": 72, "startTick": 5760, "durationTick": 960, "velocity": 0.65, "origin": "rules", "editedByUser": false},
        {"id": "b4", "pitch": 67, "startTick": 6720, "durationTick": 960, "velocity": 0.65, "origin": "rules", "editedByUser": false}
      ]
    }
  ]
}
```
真实模型通过remoteProvider返回后来源设为model。示例只能用于契约验证，不能作为模型接入完成证据。

验收：
- 两个候选各自合法，预览不修改乐谱，接受可撤销。
- 原始两小节在请求、预览、接受后保持音乐字段和ID。
- 人为延迟请求后修改原稿，晚到候选不能被采用。
- 错误或恶意模型字段被拒绝；不会写成用户轨道事件。
- 没有配置时rules流程可运行，页面来源正确。
- 有配置时记录实际模型调用、两个候选与试听；10组输入听感评估记录在QA。
- 如缺失配置，实现适配器和规则流程并明确“真实AI验收待配置”；继续阶段5，不能宣称A的真实AI目标已完成。

## 9. 阶段5：最终画面与Web验收

**可见结果：** 用户获得完整的三个页面与统一夜间星图风格，手机/桌面均能完成创作闭环。

覆盖：FR-13及所有P0交叉验收。

生成：
- PlayerPage、完整router与responsive布局。
- 状态提示、触控面板、键盘音符列表、减少运动设置。
- tests/e2e的少量关键流程、docs/QA.md。

视觉要求：
- 手机参考390×844；画布是主要内容，底部控制可触达且不被安全区遮挡。
- 桌面参考1440×900；中间大画布、右侧参数/候选，导航保持简洁。
- 原稿青色实心、候选紫色虚线、播放头暖色；背景星点低对比。
- 星尾与力度表现真实参数；不用静态图片覆盖实际星图。
- 避免将作品界面做成大量卡片的通用后台。
- 缩略图依据作品真实布局；演奏页收起编辑控件。

验证：
1. 新建→点星→编辑→播放→伴奏→规则候选→接受→撤销→保存→刷新→重开。
2. JSON导出/导入；MIDI重新解析。
3. 真实模型配置可用时走同一条候选流程；另记录实际听感。
4. 空项目、存储失败、模型错误、无效导入与未知项目入口可恢复。
5. 手机模拟布局和桌面浏览器；真机单独记录。
6. 页面切换与20轮循环无明显遗留调度或资源增长。
7. npm run build、npm run check、关键e2e通过。

自动化测试不能证明主观听感。用fixtures测试UI时记录为测试替身，不是模型调用证据；浏览器截图也不等于音频已实测。

至此交付A的Web能力；如模型验证尚缺，分别标记“Web流程完成”和“真实AI验收待完成”。

## 10. 阶段6：App测试版与部署准备

**可见结果：** 同一星图在可安装的App中运行；Web与API具备可部署构建与运行说明。

生成：
- apps/web/capacitor.config.ts、对应原生项目。
- docs/APP_BUILD.md：真实环境、构建步骤、文件交换与音频生命周期验证。
- deploy/下容器、compose与同源HTTPS代理配置。
- docs/DEPLOYMENT.md：环境变量、构建、运行、健康检查与实际发布结果。
- 更新README与THIRD_PARTY_NOTICES。

App：
1. 将Web构建产物接入Capacitor，优先Android。
2. 在原生环境验证触摸、音频首次启动、后台暂停、返回重播、本地保存。
3. 文件导入/导出按平台适配器处理，不能认为浏览器下载按钮自动等同于原生分享。
4. 有Android SDK/JDK等实际环境时构建并提供测试APK与安装验证。
5. 环境缺失时完成配置和构建说明，并列明尚未执行的构建/真机测试；不伪造APK。
6. 其他平台发布构建在具备相应环境与用户需求时继续处理。

Web与API：
1. Web静态构建、API单独构建，服务端保存模型配置。
2. 使用同源/api路由，保留MVP本地作品设计，不临时引入云数据库。
3. 容器能启动，健康检查可用，规则模式不需GPU或模型密钥。
4. 远程模型模式通过配置启用，有限流、超时与明确错误。
5. 发布前完成可审阅构建和配置；按用户授权的实际托管与发布范围执行，不以待配置阻塞本地成果。
6. 仅生成部署文件时写“具备部署配置”，实际上线后才记录公开URL及在线验证。

B验收需要真实构建产物和相应平台验证；C验收需要真实部署或发布结果。文档、配置文件与模拟器截图各自只证明它们实际覆盖的部分。

## 11. 核心数据与接口实施提醒

这些要求直接对应PRD，应在core与集成层形成可验证的不变量：
- 所有时间用整数tick；tick转秒由BPM和PPQ计算。
- 用户序列连续排布，总音长≤3840，尾部留白。
- 回应绝对时间位于3840—7680；开始网格对齐且不重叠。
- 顺序来自乐谱路径，不能按屏幕横坐标排序。
- pitch是垂直位置的事实来源；窗口尺寸不改音乐。
- 未接受候选不能持久化或导出。
- candidate接受只替换回应区，原稿保持。
- seedRevision只随用户音乐字段更改而增长，构图调整不增长。
- IndexedDB与JSON中不写入Tone节点、密钥或网络状态。
- MIDI tick按实际目标PPQ转换，两轮导出不修改项目。

测试应围绕反例和完整流程：
- 音长越界、半拍量化错误、NaN/Infinity、无效音高、重复ID。
- 路径重排后每星恰好一次，删除后没有悬空关系。
- 未接受/过期/格式无效候选不进入作品。
- 接受后原稿字段一致，撤销回到旧回应。
- 序列化/导入恢复，坏输入不破坏工作稿。
- 导出再解析与音频生命周期。

不要为低影响装饰或为了覆盖率重复实现同一公式。自动化脚本通过后，除非新修改、失败或未解决疑点，不机械扩大测试范围。

## 12. 阶段交付格式

每次交付用简短文字回答：
1. 这次完成的用户行为和对应阶段。
2. 新增/修改的主要文件。
3. 如何启动与验证，实际结果是什么。
4. 截图、预览入口、构建产物或日志摘要。
5. 哪些事实尚未验证，例如真实模型、手机真机或原生构建。

PROGRESS记录阶段状态及下一步；QA记录测试环境和结果。不要只写“已完成”或用空复选框文件当作验证结果。

## 13. 首次交给Codex的指令

将这两份MD放在工程根目录的docs/中。打开starscore目录，把以下指令发给Codex：

```text
请实现“星谱 StarScore”星图作曲产品。

先读取 docs/PRD.md 与 docs/CODEX_PLAN.md，并检查当前仓库及适用的 AGENTS.md。
本次执行阶段0和阶段1，完成后提供可运行版本与验收结果。

目标：
1. 建立 npm 工作区、React + TypeScript + Vite Web 与纯 TypeScript 音乐核心。
2. 页面按手机App的夜间星图画室设计，并兼容桌面。
3. 用户能创建0—8颗音符星、点按试听、上下拖动改变音高；横向拖动只调整构图。
4. 用 Tone.js 真实播放，画面跟随音频时钟，支持停止和重播。
5. 固定C五声音阶、90 BPM、4/4和四小节，遵守PRD中的tick边界。
6. 完成示例“夜航”、空白新建、星点上限与音频启动错误处理。
7. 实际运行构建和核心检查，验证真实交互；记录尚未测试的环境。
8. 更新 docs/PROGRESS.md，说明阶段1之后应继续的任务。

沿用仓库已有内容，先形成一条真实可用的音乐路径。
本次按阶段0—1范围交付；候选AI、保存、导出与App打包按后续阶段实现。
不要用预制音频、静态效果图或随机动画替代音符创作。
```

## 14. 后续逐步指令

阶段1完成后，用户可以逐条发送：

```text
继续阶段2。先核对 PROGRESS 与实际代码，再加入音长、力度、重连、撤销重做和同步规则伴奏。完成对应验收并记录结果。
```

```text
继续阶段3。实现本地作品、JSON交换和两轮MIDI导出，验证刷新重开、坏输入保护与导出再解析。
```

```text
继续阶段4。按契约实现候选流程与provider适配，保留真实来源。配置可用时验证真实模型；缺少配置时交付规则演示并明确未完成的模型验证，不伪造结果。
```

```text
继续阶段5。完成手机与桌面布局、我的星系和演奏页，运行完整关键流程，输出QA与当前预览。
```

```text
继续阶段6。复用Web核心准备App测试构建与部署，按当前可用环境执行验证，提供实际产物及未执行部分的具体原因。
```

如果用户明确授权连续完成，可以一次指定阶段0—6；仍按顺序实现、验证和报告，无需反复确认普通实施细节。

## 15. 官方资料

实施时按实际安装版本查阅：
- [Vite项目与环境](https://vite.dev/guide/)
- [Tone.js音符、时钟与启动](https://github.com/Tonejs/Tone.js)
- [Tone.js音画同步](https://github.com/Tonejs/Tone.js/wiki/Performance)
- [Tonejs/Midi](https://github.com/Tonejs/Midi)
- [Vitest](https://vitest.dev/guide/)
- [Capacitor](https://capacitorjs.com/docs/getting-started)

既有开源项目提供基础能力，具体星图产品按本文自行实现。
