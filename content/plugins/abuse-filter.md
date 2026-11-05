---
title: "滥用过滤器"
sidebar_label: "滥用过滤器"
description: "按规则拦截编辑、注册和其他操作，并记录命中日志。"
---

# 滥用过滤器

按规则拦截编辑、注册和其他操作，并记录命中日志。

## 拦截入口（全部走平台钩子）

| 动作 | 钩子 | 说明 |
| --- | --- | --- |
| 编辑 / 创建页面 | `EditGuard` | 网页编辑表单与 `api.php?action=edit` 都评估（与迁移前一致）；命中禁止 → 拒绝保存并显示原因，命中警告 → 保存后提示 |
| 移动页面 | `ActionGuard`（`action=move`） | `/api/pages/move` |
| 上传 / 删除文件 | `ActionGuard`（`action=upload` / `delete`） | 文件接口 |
| 封禁 | `ActionGuard`（`action=block`） | 封禁接口 |
| 注册账号 | `RegistrationGuard` | 创建账号前评估（`action=createaccount`） |


## 与 MediaWiki AbuseFilter 的差异

- 条件语法实现了常用子集（变量、字符串 / 数字 / 布尔运算、比较、`in` / `contains` / `matches`（正则）、
  `+ - * / %`、括号、`!` / `&` / `|` / `^`、`if … then … else … end`、以及
  `变量 := 表达式;` 赋值与分号分隔的多条语句等），**没有** 100% 覆盖原版所有函数与关键字；
- 动作实现了 `disallow` / `warn` / `tag` / `block` / `blockautopromote` / `throttle` 里项目实际支持的几种
  （以插件代码为准），没有 `degroup`、`rangeblock` 等；
- 条件求值没有原版的「运行时 / 语法 / 复杂度」三级限制与 `af_conditions_limit`，
  但求值器是自写的单遍扫描、不会回溯爆炸；如需硬性上限请提 issue；
- 没有原版的「过滤器组（group）」「全局过滤器」「导出 / 导入 JSON」与 `Special:AbuseFilter/examine`；
- 管理界面的 CodeMirror 语法高亮沿用 core 内置的 CodeMirror（不走 CDN）。

> **功能开关**：`features.abuse-filter`（默认值见插件描述文件）。开关由本插件在自己的
> `META-INF/wiki-plugin.properties` 里声明（`plugin.featureKey` / `plugin.featureDefault`），
> core 自动在「特殊:权限配置 → 站点设置 → 插件设置」与 `/init` 的插件 tab 里渲染 / 保存；
> 插件用 `common.service.SiteConfig` 读同一个键——core 里没有本功能的开关代码，
> 插件未加载时开关也不出现。

[源码与开发说明](https://github.com/THOnlyWiki/WikiKernel/tree/master/plugin/abuse-filter)
