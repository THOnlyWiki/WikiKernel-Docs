---
title: "编辑审核"
sidebar_label: "编辑审核"
description: "将需要审核的编辑、页面创建和文件操作放入待审队列。"
---

# 编辑审核

将需要审核的编辑、页面创建和文件操作放入待审队列。

## 拦截入口（全部走平台钩子）

| 动作 | 钩子 | 说明 |
| --- | --- | --- |
| 编辑 / 创建页面 | `EditGuard` + `EditContext` | 网页编辑表单与 `api.php?action=edit` 都走；把提交写进队列并返回 `HANDLED(redirect=/wiki/标题?moderation=pending)`，core 不再保存 |
| 上传文件 | `ActionGuard`（`action=upload`，载荷 `ActionContext.payload()`） | 文件内容**暂存**到 `{run-path}/pending/`（不是拒绝），返回 `HANDLED` + `pending=true` / `moderated=true`（前端字段与迁移前一致） |
| 删除文件 | `ActionGuard`（`action=delete`） | 删除请求进队列，core 不执行删除 |
| 编辑页提示 | `EditFormField.notice` | 没有豁免权的用户在保存按钮附近看到「保存后更改将进入审核队列」 |
| 页面提示条 | `PageDisplayHook.beforeContent` | 「此页面有 N 条待审更改」+ 查看队列链接、保存后的「已提交，等待审核」提示 |
| 「待审创建」页 | `PageDisplayHook.renderMissingPage` | 页面**还不存在**且有待审创建时，提交人 / 审核员看到待审内容预览，其他人照常 404 |

**AI 代理的提交不经审核**（`EditContext.source() == ai` 直接放行）：迁移前 core 只在网页 / API 路径检查审核，
AI 提案由用户自己核对后保存；队列里历史遗留的 `aiAssisted` 队列项在通过后仍会保留 AI 水印。


## 权限语义

- **审核人**：「核查员」「管理员」——查看队列、通过 / 拒绝；
- **豁免组**（提交直接生效）：「免审查用户」「页面管理员」「小部件管理员」「小部件编辑者」；
- 组名常量定义在 `ModerationSupport`（与 core 的用户组名一致；用户组本身仍由 core 的
  `特殊:用户权限` / 权限配置维护，core 侧 `PermissionService` 的常量未改动）；
- 审核人自己也要审核（与迁移前一致）；匿名用户不排队（登录要求由 core 的访问控制负责）。


## 与 MediaWiki Moderation 的差异

- **待审文件暂存目录变了**：从 core 的 `{run-path}/pending/` 改为插件的
  `data/plugins/moderation/pending/`（core 不再认识「审核暂存」）；升级前遗留在旧目录的
  待审上传内容不会自动搬过来，队列里的历史待审上传需要重新提交一次；
- **没有「待审移动」**：页面移动（`move`）不进队列、也没有 move 审核（迁移前的 core 同样不审核移动）；
- **没有通知**：通过 / 拒绝不会给提交人发通知（MediaWiki 版会在用户讨论页/通知里提示）；
- **没有「合并到已有页面」**：MediaWiki Moderation 允许审核员把待审创建合并进同名页面；
  这里只有「通过 / 拒绝」两种结果；
- **没有「待审编辑也要过过滤器」的二次评估**：待审内容在**提交时**经过 `EditGuard` 链（滥用过滤器等），
  通过时不再重新评估（移动端审核时页面可能已被别人改动，此时以 `PageWriter` 直接写入；
  迁移前的 core 行为相同——审核通过不复查过滤器 / 版本）；
- **队列不显示 ip / user-agent**：迁移前的 core 队列页就没有这两列，这里沿用；
- **豁免组名单不同**：MediaWiki Moderation 的 `automoderated` / `moderator` / `automoderated` 组在此对应
  「免审查用户」；此外本 wiki 的「页面管理员」「小部件管理员」「小部件编辑者」也直接豁免；
- **队列页差异**：状态页签是「全部 / 待审 / 已通过 / 已拒绝」，`?type=`、`?title=` 过滤保留；
  上传预览只有审核员能取（`/api/moderation/pending-file/{id}` 校验权限）；
- **通过后的版本**：以原提交人身份生成（与 MediaWiki 版一致），`special:log` 里记的是审核人的动作
  （类型「审核」）；
- **依赖的 core 差异**：`ActionGuard` 新增了 `HANDLED`（钩子自行处理，core 当作成功返回）；
  插件**未加载**时 core 的行为与迁移前完全一致（编辑 / 上传 / 删除立即生效，没有队列）。

[源码与开发说明](https://github.com/THOnlyWiki/WikiKernel/tree/master/plugin/moderation)
