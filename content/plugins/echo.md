---
title: "通知"
sidebar_label: "通知"
description: "提供站内通知列表、未读计数和通知入口。"
---

# 通知

提供站内通知列表、未读计数和通知入口。

## 功能一览

| 能力 | 入口 | 说明 |
| --- | --- | --- |
| 铃铛 + 红点 + 下拉面板 | 顶栏个人工具区（`PersonalToolbarHook`） | `#personal-extra`（kawaii）/ `.plain-personal`（plain）/ `#p-personal`（vector / fallback）都是同一个条目；面板显示最近 15 条，可「全部标为已读」 |
| 通知列表页 | `特殊:通知` / `Special:Notifications`（别名 `Notification` / `Echo`） | 按类型过滤、翻页（每页 50）、单条已读、全部已读 |
| 通知偏好 | `特殊:参数设置 → 通知`（`PreferenceSection`） | 每类开关（`echo.pref.enable.<type>`）+ **邮件通知开关**（`echo.pref.email`，默认关 = opt-in），都存在 `UserSettings` |
| 站点开关 | `特殊:权限配置 → 站点设置 → Echo 通知`（`SiteSettingsSection`）+ 功能总开关 `features.echo` | 讨论页 / 提及 / 回退 / 欢迎 通知可分别禁用；邮件另受 `wikikernel.email.*`（总开关 + 类型 `echo-notification`）控制 |
| API | `GET /api/echo/unread-count`、`GET /api/echo/list`、`POST /api/echo/mark-read`、`POST /api/echo/mark-all-read`、`POST /api/echo/preferences` | 需要登录；未登录 401、被封禁 403 |

### 通知类型

| 类型 | 触发 | 收件人 |
| --- | --- | --- |
| `edit-user-talk` | 有人编辑**你的用户讨论页**（含子页面判定：`用户讨论:你/子页` 也归你） | 讨论页主人（自己编辑自己不通知） |
| `mention` | 正文里 `[[用户:你]]` / `[[User:你]]` / `@你` | 被提及的用户（自己提及自己不通知；同一保存内去重） |
| `revert` | 你的编辑被**回退**（`api.php?action=rollback`） | 被回退的编辑者（连续编辑一并算） |
| `welcome` | 新用户注册（注册 2 天内首次访问时补发一次） | 新用户 |


## 触发方式

- **讨论页 / 提及**：扩展点 `EditGuard`（保存前钩子，网页 / API / AI 提交都走）。core 的插件 AOP 桥
  会跳过 `@Transactional` 服务（`WikiPageService` 正是），因此这里**不能**用 AOP；`EditGuard` 在事务之外调用，
  通知写库不会与编辑事务抢 SQLite 写锁。若保存动作被后续钩子或乐观锁拦截，
  系统通过「同类同页 60 秒去重」机制抑制多余通知生成。
- **回退**：回退**不走** `EditGuard`（core 直接调 `WikiPageService.editPage`），使用 `CoreAopHook`
  切 `ActionApiService.handle`（非事务 Bean，桥接代理可命中）：调用前按参数查「该用户对本页的连续编辑者」，
  调用成功后给这些人发通知。注意：通知写库放在事务**提交之后**（`afterCommit`），
  否则 SQLite 下会与编辑事务的写锁互相等待（挂起）。
- **欢迎**：惰性发放——新用户首次打开铃铛（`/unread-count`）或通知页时补发；只给注册 2 天内的用户，
  老账号不会被补一发。
- **邮件**：由上面三条路径在通知入库后异步触发（见「邮件通知」一节）。


## 邮件通知

通知入库后**异步**发一封纯文本邮件（单线程 daemon 执行器；插件停止时 `onStop` 关闭，不阻塞保存请求、
不占数据库事务）：

| 条件 | 说明 |
| --- | --- |
| 站点邮件可用 | `wikikernel.email.enabled=true` + SMTP 配置完整，且类型 `echo-notification` 没被 `wikikernel.email.types.*` 关掉（`MailService` 语义） |
| 用户开关 | `echo.pref.email=true`（默认关，opt-in，与 MediaWiki「通过电子邮件通知我」一致） |
| 邮箱要求 | 收件人**邮箱已确认**（未确认不发，与 MediaWiki 一致） |
| 节流 | 同一收件人 + 同一通知类型 **30 分钟**内最多一封（水位存 `echo.pref.email.last.<type>`） |

实现走 **`common.service.Mailer` 桥**（core 的 `MailerImpl` 转调 `MailService`，异常收成 `false`）——
插件不直接依赖 core 的邮件类。邮件里的站点链接用当前请求的 scheme+host（反代 / 多域名场景可用站点设置
`echo.email.baseUrl` 覆盖）。

[源码与开发说明](https://github.com/THOnlyWiki/WikiKernel/tree/master/plugin/echo)
