# 环境变量配置

当前目录为 `main` 进程的环境变量配置文件，主要用于配置应用的运行时参数。

## 开发工具配置

这些环境变量控制项目开发阶段的调试工具行为。

| 环境变量 | 说明 | 可选值 |
|---------|------|-------|
| `VITE_MAIN_AUTO_OPEN_DEV_TOOLS` | 控制是否在启动时自动打开开发者工具 | `true`/`false` |
| `VITE_MAIN_DEV_TOOLS_POSITION` | 开发者工具的停靠位置 | `right`, `bottom`, `left`, `top`, `undocked` |

## 飞书（Lark）API 配置

项目使用飞书 API 进行某些功能的集成，需要配置以下环境变量：

| 环境变量 | 说明       |
|---------|----------|
| `VITE_MAIN_LARK_USER_ACCESS_TOKEN` | 飞书用户访问令牌 |
| `VITE_MAIN_LARK_APP_ID` | 飞书应用 ID  |
| `VITE_MAIN_LARK_APP_SECRET` | 飞书应用密钥   |

### 如何获取飞书 API 凭证

1. 前往[飞书开发者平台](https://open.feishu.cn/)创建一个应用
2. 从应用设置中获取 App ID 和 App Secret
3. 根据飞书文档获取用户访问令牌

> **注意**: 请勿在公共仓库中提交真实的飞书 API 凭证。建议使用环境变量或配置文件进行本地开发，并在 `.gitignore` 中排除这些文件。
