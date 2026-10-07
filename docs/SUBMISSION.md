# StarScore 参赛提交资料

## 一句话介绍

星谱把点星、旋律回应和人与人的音乐相遇放进同一片可演奏银河：听见一团星云，带走一段灵感，再把自己的作品分享出去。

## 核心创新

1. 星点位置、星尾和光晕对应真实音高/时间、时值和力度，同一项目驱动画面、音频、保存和导出。
2. 银河社区从原创预设生成 7 位居民的 14 段作品，灵感副本保持来源并可继续编辑。
3. 规则/模型回应共享严格音乐契约；无网络仍可完成 A/B、试听、采用和撤销。
4. JSON、三轨 MIDI 与星系文件形成 Web/Android/好友之间的可恢复交换闭环。

## 技术栈与入口

React 19、TypeScript、Vite、Tone.js、@tonejs/midi、IndexedDB、Fastify、Capacitor 8、Android SDK 36、Docker/Nginx、GitHub Actions。

- 默认银河：`#/community`
- 十二星座：`#/discover/zodiac`
- 星谱素材：`#/discover/materials`
- 画室/作品库/演奏页：`#/studio`、`#/library`、`#/play/:id`
- 离线演示：`demos/StarScore_Interactive_Preview.html`
- 公开仓库：https://github.com/Qingtian-Zeng/starscore

演示顺序：银河试听 → 灵感副本 → 编辑/伴奏 → 规则或模型回应 → 保存 → 发布/导出星系。

## 当前边界

社区是示例居民 + 本机作品 + 导入好友文件，不包含账号、实时发现或跨设备同步。真实 AI 需要服务端配置；未配置时只显示 `rules`。当前 APK 是 debug 测试签名；真机、人工听感、外部 DAW 和公网 HTTPS 部署均单独记录。

最终 Release、APK、SHA-256、Actions run 和静态网页下载链接在 v0.2.0 发布后回填。
