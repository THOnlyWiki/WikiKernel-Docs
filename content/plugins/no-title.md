---
title: "隐藏页面标题"
sidebar_label: "隐藏页面标题"
description: "使用页面行为开关隐藏正文上方的标题。"
---

# 隐藏页面标题

使用页面行为开关隐藏正文上方的标题。

## 功能

| 部分 | 说明 |
| --- | --- |
| 行为开关 | `NoTitleSwitch` 注册 `__NOTITLE__` / `__无标题__` 两个别名（`common.extension.BehaviorSwitch`） |
| 页面属性 | 命中开关时写页面属性 `notitle`，由皮肤布局隐藏 `h1` 大标题（不改变页面正文） |

`__NOTITLE__` / `__无标题__` 是**页面语法**，不是界面文案，因此只在 Java 里定义、不放进 `messages*.properties`。


## 兼容性

- 描述文件 `META-INF/wiki-plugin.properties` 里**没有**声明 `plugin.featureKey`，所以本插件**没有站点级功能开关**：
  加载即生效（不需要 `features.*` 键，站点设置里也不会有它的复选框）；
- 卸载 / 未加载插件时 `__NOTITLE__` 不被识别，页面按普通文本处理（与迁移前未启用该功能时一致）。


## 与 MediaWiki 的差异

- MediaWiki 版用 CSS 隐藏 `h1.firstHeading`；WikiKernel 里行为开关写页面属性 `notitle`，由皮肤布局隐藏标题（效果一致）。

[源码与开发说明](https://github.com/THOnlyWiki/WikiKernel/tree/master/plugin/no-title)
