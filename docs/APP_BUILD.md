# StarScore Android 测试版构建

## v0.2.1 已确认界面构建（2026-10-07）

- [Actions run 37623320397](https://github.com/Qingtian-Zeng/starscore/actions/runs/37623320397) 使用 Ubuntu 24.04、JDK 21、Android SDK 36 成功。
- 最终 APK：[StarScore-v0.2.1-confirmed-ui-debug.apk](https://github.com/Qingtian-Zeng/starscore/releases/download/v0.2.2-hackathon-submission/StarScore-v0.2.1-confirmed-ui-debug.apk)，5,461,350 字节，SHA-256 `9d8e939353a79eb6bff939e5102780704431d0c87c2efdce74cee8cdb15ec67b`。
- `aapt`：`com.starscore.app`、versionCode 3、versionName 0.2.1、minSdk 24、targetSdk 36。
- `apksigner`：APK Signature Scheme v2 验证通过，Android Debug RSA 2048 单签名者。不是生产 release keystore。

## v0.2.0 当前构建基线（2026-10-07）

- 应用 ID `com.starscore.app`；versionName `0.2.0`；versionCode `2`；minSdk 24；compile/target SDK 36。
- Android APK 由 Ubuntu 24.04 + JDK 21 的 Actions 生成；本地已完成 Web 构建与检查。
- 本次仍是 CI 默认 debug 签名测试包；没有稳定 release keystore，因此不能保证跨 CI 运行覆盖安装。升级前应导出 JSON/星系文件备份本机作品。
- 正式数据库仍为 IndexedDB `starscore`，未切换到 HTML 预览数据库。
- 历史 [Actions run 37586957868](https://github.com/Qingtian-Zeng/starscore/actions/runs/37586957868) 通过；对应旧 Release 已隐藏为 Draft，Tag 保留用于追溯。
- 旧版 APK 为 5,461,302 字节，SHA-256 `46a33c374ca72bbb784cbb2141f8fc32a6ebb926b439ed936383ee8ce1053967`；请勿用于参赛评审。
- `aapt` 确认包名/版本/minSdk/targetSdk；`apksigner` 确认 v2 签名有效、1 个 Android Debug RSA 2048 签名者。匿名下载复算哈希一致。

## GitHub Actions 云端构建

工作流 `.github/workflows/delivery-build.yml` 通过 GitHub Actions 的 `workflow_dispatch` 手动触发。可选输入 `app_api_url` 必须是 APK 真机可访问的 HTTPS API；留空时规则/模型接口在 APK 中没有远程服务可用。

运行成功后下载：`starscore-debug-apk`、`starscore-build-evidence` 和 `starscore-compose-evidence`。前两者分别包含 `app-debug.apk` 与 check/Web/assets/Gradle 日志、SHA-256。工作流会在 Ubuntu 24.04 上用 `@capacitor/assets` 从 `apps/web/assets/icon.svg`、`splash.svg` 生成 Android 密度资源。

GitHub Actions [run 37586957868](https://github.com/Qingtian-Zeng/starscore/actions/runs/37586957868) 已实际通过，生成并上传 `starscore-debug-apk` 与完整证据。本地交付文件为 `releases/v0.2.0-galaxy/StarScore-v0.2.0-galaxy-debug.apk`（该目录不提交 Git）；真机安装与生命周期仍待设备验收。

## 已接入

- Capacitor 8 Android 工程位于 `apps/web/android`，应用 ID 为 `com.starscore.app`，应用名为“星谱 StarScore”。生成工程使用 Gradle 8.14.3、minSdk 24、compile/target SDK 36。
- Web 产物、IndexedDB、Tone 播放引擎和三页面路由原样复用。
- App 退到后台时停止播放；返回前台后必须由用户再次点击播放。
- Android 上 JSON/MIDI 导出写入应用缓存并调用系统分享面板；JSON 导入使用系统文件选择器承载的 HTML file input。
- CSS 使用 Android WebView 安全区变量，演奏页缩短桌面空白并强化画布与播放控件。

## 环境基线与缺失项（2026-10-06）

- Node.js `24.19.0`，npm `11.17.0`：可用。
- JDK / `java` / `javac`：未安装。
- Android SDK / `sdkmanager` / `adb`：未安装，`ANDROID_HOME` 与 `ANDROID_SDK_ROOT` 未设置。
- Docker / Docker Compose：未安装。

Capacitor 8 要求 Node 22+；Android 本机构建还需 Android Studio 当前稳定版、JDK 21 与 Android SDK。安装后设置 `JAVA_HOME`、`ANDROID_HOME`，再执行：

```powershell
npm install
npm run android:sync
cd apps/web/android
.\gradlew.bat assembleDebug
```

云端 APK 路径：`apps/web/android/app/build/outputs/apk/debug/app-debug.apk`。当前机器仍缺少 JDK/SDK，未进行模拟器、安装截图或真机验收。

## App API

Web 生产部署默认使用同源 `/api`。App 构建必须在同步前配置设备可达的 HTTPS 地址：

```powershell
$env:VITE_API_BASE_URL='https://api.starscore.example'
npm run android:sync
```

不能使用真机的 `localhost` 指向开发电脑。模型地址、模型名和密钥只配置在 API 服务端，绝不能写入 `VITE_*`。

## 原生待验收清单

首次触摸音频、点星/拖动、播放/停止、后台暂停、关闭重开恢复、文件选择、系统分享、重复播放与路由切换，均需在模拟器及真机分别执行。源码与 Web 回归通过不等同于这些原生验收已通过。
