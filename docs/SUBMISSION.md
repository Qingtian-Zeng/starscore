# 星谱 StarScore｜最终参赛提交资料

## 唯一推荐入口

- 在线 Demo：https://qingtian-zeng.github.io/starscore/
- 最终参赛 Release：https://github.com/Qingtian-Zeng/starscore/releases/tag/v0.2.2-hackathon-submission
- 完整参赛包：https://github.com/Qingtian-Zeng/starscore/releases/download/v0.2.2-hackathon-submission/StarScore-Submission-Package.zip
- Android APK：https://github.com/Qingtian-Zeng/starscore/releases/download/v0.2.2-hackathon-submission/StarScore-Android.apk
- 演示视频：https://github.com/Qingtian-Zeng/starscore/releases/download/v0.2.2-hackathon-submission/StarScore-Demo.mp4
- 作品封面：https://github.com/Qingtian-Zeng/starscore/releases/download/v0.2.2-hackathon-submission/StarScore-Cover.png
- 独立 HTML：https://github.com/Qingtian-Zeng/starscore/releases/download/v0.2.2-hackathon-submission/StarScore-Interactive-Demo.html
- SHA-256：https://github.com/Qingtian-Zeng/starscore/releases/download/v0.2.2-hackathon-submission/StarScore-SHA256.txt
- 报名表填写稿：https://github.com/Qingtian-Zeng/starscore/releases/download/v0.2.2-hackathon-submission/StarScore-Submission-Form.md
- 公开仓库：https://github.com/Qingtian-Zeng/starscore
- 构建记录：https://github.com/Qingtian-Zeng/starscore/actions/runs/37623320397

旧版 Release 已隐藏为 Draft，Tag 仅用于历史追溯，不作为评审入口。

## 作品名称与赛道

- 作品名称：星谱 StarScore
- 参赛赛道：赛道二「创新音乐产品」

## 作品介绍及创作思路（294 字）

星谱 StarScore 是一款面向零乐理用户的可视化音乐创作产品。针对传统编曲软件参数复杂、灵感难以快速落地的问题，星谱把音符变成银河中的星点：位置对应时间与音高，星尾表达时值，光晕表达力度；用户通过点星、拖动即可创作旋律，并获得实时声音反馈。系统能够生成两种后半段音乐回应，支持比较试听、采用、撤销、保存及 MIDI 导出。“银河社区”让每首作品成为一片可探索、可试听的星系，用户可以发现他人作品、获取灵感副本并继续创作。未来还将加入 AI 填词、歌词优化、人声演唱与智能编曲，使用户从一段星光旋律出发，完成具有个人表达的独创歌曲，实现从“看见音乐、听见星空”到“分享属于自己的歌”。

## 交付资产与校验

| 资产 | 大小 | SHA-256 |
|---|---:|---|
| Android APK | 5,461,350 字节 | `9d8e939353a79eb6bff939e5102780704431d0c87c2efdce74cee8cdb15ec67b` |
| 演示视频（146 秒） | 19,563,714 字节 | `f53867b04725213c34d2c4bdcf76afba0011dffd53007bb891ba74508bf7522a` |
| 1080×1920 PNG 封面 | 4,133,590 字节 | `cd944be8544cf7998feaef21fdd0372a5abdd6134c80f8e81280616c74fd878a` |
| 独立 HTML | 812,523 字节 | `f22673b942db6fda8917004cd6b8b972bbd8288997755f34d3083cb52311233a` |

## 验收边界

- Web、规则回应、保存、JSON/MIDI、Android 云端构建及公开下载已验证。
- APK 使用 debug 测试签名，包名 `com.starscore.app`，versionName `0.2.1`，versionCode `3`。
- 未配置服务端模型时明确使用规则演示；真实模型调用不作虚假声明。
- 真机安装、外部 DAW 和人工音乐听感仍需对应设备或人工环境复核。
