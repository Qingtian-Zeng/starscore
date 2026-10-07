# Web/API 部署

## v0.2.1 部署验证（2026-10-07）

[Actions run 37623320397](https://github.com/Qingtian-Zeng/starscore/actions/runs/37623320397) 已实际构建 Compose，并通过 Web、同源 `/api/health` 与规则回应 smoke。确认版独立 HTML 已作为 [Release 资产](https://github.com/Qingtian-Zeng/starscore/releases/download/v0.2.1-confirmed-ui/StarScore_Interactive_Preview-v0.2.1.html) 发布。当前仍未提供公网 HTTPS 托管地址；Release 下载不等同 Web/API 正式部署。

## v0.2.0 部署说明（2026-10-07）

正式 Web 默认同源 `/api`；Android 只有在真实可达 HTTPS API 存在时设置 `VITE_API_BASE_URL`。CORS 需允许实际来源。模型地址、名称、密钥和超时只放在 API 服务端。

无 API 时，银河、素材、作品编辑、播放、IndexedDB、JSON/MIDI/星系文件下载和离线规则回应仍可用；只有真实模型不可用。独立 HTML 位于 `demos/StarScore_Interactive_Preview.html`，使用独立预览数据库，不等同线上部署或 App 数据。

当前没有已授权公网 HTTPS 托管地址；Compose 与同源 API 已由 [delivery run 37586957868](https://github.com/Qingtian-Zeng/starscore/actions/runs/37586957868) 实际构建并通过 smoke test。独立 HTML 已作为 [Release 资产](https://github.com/Qingtian-Zeng/starscore/releases/download/v0.2.0-galaxy/StarScore_Interactive_Preview.html) 公开下载，但它不是托管站点。

## 自动 smoke 验证

`scripts/verify-deployment.mjs <base-url>` 验证 Web 首页、同源 `/api/health` 和规则回应 A/B。GitHub Actions 的 `containers` job 会执行 Compose、运行该脚本、上传 `compose-ps.txt`/`compose.log`，最后清理容器。

本轮在现有本地 Web/API 进程上实际执行通过：HTTP 200、health ok、`modelConfigured:false`、rules A/B 各 6 音。GitHub Actions run 37586957868 的 Compose job 也已实际构建并通过相同 smoke test。没有可用托管环境，HTTPS 公网地址仍受阻。

## Docker Compose

复制 `.env.example` 为 `.env`，填入服务端模型配置后执行：

```bash
docker compose up --build -d
curl http://localhost:8080/api/health
```

入口为 `http://localhost:8080/`。Nginx 托管 Vite 静态产物，并把同源 `/api/*` 代理到内部 API；生产环境应在负载均衡器或网关终止 HTTPS。健康检查为 `/api/health`，只返回模型是否已配置，不返回密钥。

Web 同源构建不设置 `VITE_API_BASE_URL`。仅当 API 独立域名或构建 Android 包时才设置它，并同时把来源加入 `STARSCORE_CORS_ORIGINS`。发布 App 必须使用 HTTPS API。

当前机器未安装 Docker，因此 Dockerfile、Compose 与 Nginx 配置已交付但未在本机实际启动。Node 生产构建及 API 健康检查另行通过本地进程验证。
