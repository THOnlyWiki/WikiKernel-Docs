---
title: "AI 编辑提案"
sidebar_label: "AI 编辑提案"
description: "连接模型服务，阅读页面并生成可供用户核对的编辑提案。"
---

# AI 编辑提案

连接模型服务，阅读页面并生成可供用户核对的编辑提案。

## 使用

1. `特殊:AI代理`（`Special:AiAgent`，别名 `Agent` / `AIAgent`）——需要登录 + 权限（见下）；
2. 选一个 AI 厂商（右上角），用中文描述要求（例：`读取「首页」和「帮助:编辑」，把首页导语改简洁，输出完整正文`）；
3. 代理的**只读工具**：`read`（读正文）、`search`（搜索）、`list`（列举页面，含 `template`/`module` 命名空间）、
   `info`（模板 / 分类 / 链入 / 被嵌入 / 保护 / 是否 AI 编辑过）、`history`（版本历史）；
4. 生成 **提案**：「渲染预览 / 与当前版本差异 / Wikitext」三个页签 + 编辑摘要 + 三个动作：
   **确认提交 / 让 AI 重新生成 / 放弃**；
5. 提交时会**复查你的真实权限**（没有编辑/创建权限的页面提案会被拒绝；`.js` / CSS 页面通常需要界面管理员）、
   **滥用过滤器**与**基准版本**（见下「并发」），通过后**直接保存**（审核队列只用于普通编辑，AI 代理不经过它）。

**界面细节（都是为了让「你自己核对」这件事更顺手）**：

- **AI 回复按 Markdown 渲染**（粗体 / 列表 / `代码` / 表格 / 引用；原始 HTML 会被转义，危险链接被清洗）；
- **「Wikitext」页签可以直接改**：改完点「用当前正文刷新预览」立刻看效果，保存的就是你看到并确认的版本；
- **执行过程**是一个明显的折叠块（▶/▼ + 手型光标 + 步数，如「共 7 步」），点标题即可展开工具调用轨迹；
- **刷新页面不丢**：对话记录、工具轨迹与待确认提案都在服务端会话里（`GET /api/ai-agent/session`），
  重新打开页面会原样还原（会话 TTL 见 `wikikernel.ai.session-ttl-minutes`，默认 120 分钟）；
- **不限制轮数**：一次对话会一直进行到代理给出结论（`wikikernel.ai.max-steps` 默认 **0 = 不限制**；
  只有模型连续 3 次执行完全相同的步骤时才会停下并提示，避免卡死）。

## 配置键

| 键 | 位置 | 默认 |
| --- | --- | --- |
| `features.ai-agent` | `/init`、站点设置、LocalSettings.yaml | **关闭** |
| `ai-agent.allow-normal-users` | 插件站点入口（`特殊:AI代理?keys=1`）、`/init` 写入的 `wikikernel.ai.allow-normal-users` | false |
| `ai.provider.<id>.key` / `.base-url` / `.model` / `.proxy` | 站点设置（由插件写：`SiteConfig.set`，与 core `/init` 同一存储） | 空 |
| `wikikernel.ai.*` | LocalSettings.yaml（厂商表 / 轮数 / 超时 / 会话上限 / 读取上限） | 见插件的 `model/AiProperties` |
| `wikikernel.rate-limit.ai-agent` | LocalSettings.yaml（每用户每小时的对话次数） | 30/小时 |


## 接口

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/ai-agent/state` | 开关 / 权限 / 可用厂商（不含密钥）/ 默认厂商 |
| GET | `/api/ai-agent/session` | 还原会话：对话记录（含 Markdown HTML）、步骤轨迹、待确认提案 |
| POST | `/api/ai-agent/chat` | 对话一轮（`session` / `provider` / `message`） |
| POST | `/api/ai-agent/apply` | 确认提交一个提案（`session` / `proposal` / `comment` / `content` 可带用户改过的正文） |
| POST | `/api/ai-agent/apply-all` | 一键提交会话里全部提案（多条目） |
| POST | `/api/ai-agent/discard` | 放弃提案 |
| POST | `/api/ai-keys` | 保存 / 清除厂商密钥（`scope=user` 任意登录用户；`scope=site` 管理员 / 行政员；`clear=1` 清空） |
| POST | `/api/ai-keys/allow-normal` | 站点是否放开普通用户（管理员 / 行政员） |

错误语义与迁移前一致：未登录 `401`；功能关闭 / 无权限 / 无编辑创建权限 `403`；业务错误 `400`；
对话限流 `429`；版本冲突是 `200 + ok=false + code=conflict`。

[源码与开发说明](https://github.com/THOnlyWiki/WikiKernel/tree/master/plugin/ai-agent)
