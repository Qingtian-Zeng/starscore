# 星谱 StarScore｜最终参赛提交资料

## 唯一推荐入口

- 在线 Demo：https://qingtian-zeng.github.io/starscore/
- 最终参赛 Release：https://github.com/Qingtian-Zeng/starscore/releases/tag/v0.2.2-hackathon-submission
- Android APK：https://github.com/Qingtian-Zeng/starscore/releases/download/v0.2.2-hackathon-submission/StarScore-v0.2.1-confirmed-ui-debug.apk
- 演示视频：https://github.com/Qingtian-Zeng/starscore/releases/download/v0.2.2-hackathon-submission/StarScore-Hackathon-Demo-v8-Calm-Voice-Music-2m20s.mp4
- 作品封面：https://github.com/Qingtian-Zeng/starscore/releases/download/v0.2.2-hackathon-submission/StarScore-Hackathon-Cover-1080x1920.png
- 独立 HTML：https://github.com/Qingtian-Zeng/starscore/releases/download/v0.2.2-hackathon-submission/StarScore_Interactive_Preview-v0.2.1.html
- 公开仓库：https://github.com/Qingtian-Zeng/starscore
- 构建记录：https://github.com/Qingtian-Zeng/starscore/actions/runs/37623320397

旧版 Release 已隐藏为 Draft，Tag 仅用于历史追溯，不作为评审入口。

## 作品名称与赛道

- 作品名称：星谱 StarScore
- 参赛赛道：赛道二「创新音乐产品」

## 作品介绍及创作思路（277 字）

星谱 StarScore 是一款面向零乐理用户的可视化音乐创作产品。我们发现，传统编曲软件以时间轴、钢琴卷帘和大量参数为核心，新手往往有旋律灵感，却难以把它转化为完整作品。星谱把音符变成银河中的星点：横向位置对应时间，纵向位置对应音高，星尾表达时值，光晕表达力度；用户通过点星和拖动即可写下旋律，并获得实时声音反馈。系统还能在统一音乐约束下生成两种后半段回应，支持比较试听、采用、撤销与重做。作品可保存为个人星系，在 Web、Android 与自适应界面中继续创作，并导出 JSON 和三声部 MIDI，让“看见音乐、听见星空”成为完整可交换的创作体验。

## 交付资产与校验

| 资产 | 大小 | SHA-256 |
|---|---:|---|
| Android APK | 5,461,350 字节 | `9d8e939353a79eb6bff939e5102780704431d0c87c2efdce74cee8cdb15ec67b` |
| 演示视频（140 秒） | 16,557,838 字节 | `ba81a2547691323d5ed32f372e5042383352fd255928f778b0f67d650142aa16` |
| 1080×1920 PNG 封面 | 4,133,590 字节 | `cd944be8544cf7998feaef21fdd0372a5abdd6134c80f8e81280616c74fd878a` |
| 独立 HTML | 812,523 字节 | `f22673b942db6fda8917004cd6b8b972bbd8288997755f34d3083cb52311233a` |

## 验收边界

- Web、规则回应、保存、JSON/MIDI、Android 云端构建及公开下载已验证。
- APK 使用 debug 测试签名，包名 `com.starscore.app`，versionName `0.2.1`，versionCode `3`。
- 未配置服务端模型时明确使用规则演示；真实模型调用不作虚假声明。
- 真机安装、外部 DAW 和人工音乐听感仍需对应设备或人工环境复核。
