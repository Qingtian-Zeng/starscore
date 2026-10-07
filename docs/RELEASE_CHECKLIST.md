# StarScore 交付检查表

## v0.2.1 发布结果（2026-10-07）

| 项目 | 状态 | 证据 |
|---|---|---|
| 确认 HTML 与参数 | 已验证 | 源 SHA、参数 JSON、CI 守卫 |
| Web/测试/回归 | 已验证 | run 37623320397 |
| Compose | 已验证 | Web、health、规则 A/B smoke 通过 |
| APK 构建和签名 | 已验证 | 0.2.1 / code 3；v2 验签通过 |
| Release 与匿名下载 | 已验证 | HTTP 200；5,461,350 字节；SHA-256 一致 |
| 数据兼容 | 已验证 | App ID、IndexedDB 名称、项目 schema 未改 |
| 真机/人工/真实模型/公网 | 待验证 | 缺少对应设备、配置或托管环境 |

## v0.2.0 发布检查（2026-10-07）

| 项目 | 状态 |
|---|---|
| 交接包 SHA-256 | 已验证，57 + 40 项零失败 |
| 源码合并及数据兼容 | 已验证 |
| build/check/新增回归 | 已验证 |
| 390×844 浏览器关键流程 | 已验证 |
| Android versionCode 2 / versionName 0.2.0 | 已验证源码 |
| GitHub Actions 新版 APK | 已验证；run 37586957868 |
| APK 下载、SHA-256、元数据 | 已验证；匿名下载与云端哈希一致 |
| debug 签名 | 已通过 apksigner v2 验签；不是稳定 release 签名 |
| 模拟器/真机安装与系统分享 | 未验证 |
| 真实模型、人工听感、外部 DAW | 未验证 |
| 公网 HTTPS Web | 未部署；独立 HTML 可下载 |

状态定义：`已验证` 有本轮实际执行证据；`待验证` 配置已就绪但尚未运行；`受阻` 缺少必要环境、凭据或人工设备。

| 项目 | 状态 | 证据或原因 |
|---|---|---|
| core/API/Web build 与 check | 已验证 | 本地 `npm run build`、`npm run check` 通过；core 11、API 3、Web 1 个测试通过 |
| 本地 API 健康/CORS | 已验证 | `/api/health` 返回 ok；Capacitor origin OPTIONS 204 |
| GitHub Actions 配置 | 已验证 | `.github/workflows/delivery-build.yml` 已静态核对，包含 Ubuntu 24.04、JDK 21、SDK 36、检查、Web、资源、Capacitor 与 APK 步骤 |
| GitHub Actions 实际运行 | 已验证 | [run 37586957868](https://github.com/Qingtian-Zeng/starscore/actions/runs/37586957868) 成功，APK、校验、元数据、签名与构建证据已上传 |
| 品牌 Android 密度资源 | 已验证 | 云端通过 `@capacitor/assets` 从 SVG 生成各密度资源并成功打包 |
| APK 构建 | 已验证 | `assembleDebug`、`aapt dump badging`、`apksigner verify` 成功；匿名下载 5,461,302 字节且 SHA-256 为 `46a33c…3967`；安装截图仍待模拟器/真机验证 |
| Compose 配置与 smoke 脚本 | 已验证 | 工作流与 `scripts/verify-deployment.mjs` 已配置；脚本覆盖 Web、同源 health、规则 A/B |
| Compose 实际运行 | 已验证 | run 37586957868 的 Compose job 已通过 Web、health 与规则回应 smoke test |
| HTTPS 公网部署 | 受阻 | 未提供托管环境、域名或 TLS 配置 |
| 真实模型接口 | 受阻 | 缺少 `STARSCORE_MODEL_BASE_URL`、`STARSCORE_MODEL_NAME`、`STARSCORE_MODEL_API_KEY` |
| 规则候选流程 | 已验证 | 阶段 4–5 已验证 A/B、试听、采用、撤销、保存；来源为 rules |
| 模拟器/真机生命周期 | 受阻 | 无 Android 运行环境和设备 |
| 10 组人工听感 | 受阻 | 需要人工试听；用例已在 `AI_LISTENING_CASES.md` |
| 外部 DAW MIDI | 受阻 | 未提供或安装 DAW；程序化重新解析已通过但不能替代 DAW |
| 比赛演示脚本 | 已验证 | `DEMO_SCRIPT.md` 已准备，明确规则/模型来源口径 |
| 演示示例作品 | 待验证 | `samples/night-sail.starscore.json` 与 MIDI 可用，但尚未进行本轮人工试听签字 |

## 发布前必须补齐

1. 将项目推送至 GitHub，在 Actions 手动运行 `StarScore delivery build`；下载三个 artifact 并记录 run URL、SHA-256 与结果。
2. 在真实 HTTPS API 地址下重新构建 APK，安装后逐项执行原生测试并保存截图。
3. 若使用真实 AI，在仓库外的服务端密钥存储中配置三项变量，记录模型名称、调用时间和候选验证结果，禁止把密钥写入 APK、日志或提交。
4. 用 10 组旋律完成人工评分，并在至少一个外部 DAW 中打开 MIDI。
