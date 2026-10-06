# Web/API 部署

## 自动 smoke 验证

`scripts/verify-deployment.mjs <base-url>` 验证 Web 首页、同源 `/api/health` 和规则回应 A/B。GitHub Actions 的 `containers` job 会执行 Compose、运行该脚本、上传 `compose-ps.txt`/`compose.log`，最后清理容器。

本轮在现有本地 Web/API 进程上实际执行通过：HTTP 200、health ok、`modelConfigured:false`、rules A/B 各 6 音。本机没有 Docker，因此这不是容器证据；Compose 实际构建仍需工作流或另一台 Docker 主机执行。没有可用托管环境，HTTPS 公网地址仍受阻。

## Docker Compose

复制 `.env.example` 为 `.env`，填入服务端模型配置后执行：

```bash
docker compose up --build -d
curl http://localhost:8080/api/health
```

入口为 `http://localhost:8080/`。Nginx 托管 Vite 静态产物，并把同源 `/api/*` 代理到内部 API；生产环境应在负载均衡器或网关终止 HTTPS。健康检查为 `/api/health`，只返回模型是否已配置，不返回密钥。

Web 同源构建不设置 `VITE_API_BASE_URL`。仅当 API 独立域名或构建 Android 包时才设置它，并同时把来源加入 `STARSCORE_CORS_ORIGINS`。发布 App 必须使用 HTTPS API。

当前机器未安装 Docker，因此 Dockerfile、Compose 与 Nginx 配置已交付但未在本机实际启动。Node 生产构建及 API 健康检查另行通过本地进程验证。
