---
title: "微件"
sidebar_label: "微件"
description: "在受权限限制的微件页面保存 HTML 模板，并从正文调用。"
---

# 微件

在受权限限制的微件页面保存 HTML 模板，并从正文调用。

## 创建和调用

在“微件:”命名空间创建 HTML 模板，在词条正文中调用：

```text
{{#widget:示例|id=abc|width=420}}
```

微件由 `features.widgets` 控制。微件输出可包含 HTML，编辑权限应只授予可信用户；普通词条编辑权不应自动获得微件编辑权。

## 用法示例

```text
{{#widget:示例|id=abc|width=420}}
{{#widget:微件:示例|items=一|items=二}}   ← 重复键成列表
{{#widget:示例|a.b.c=嵌套}}               ← 点号路径 <!--{$a.b.c}-->
{{#widget:示例|flag}}                     ← 无值 = true；flag=false = 布尔假
```

```yaml
wikikernel:
  plugins:
    settings:
      widget:
        prefixes: 微件:,Widget:
```

## 与 MediaWiki 原版的差异

- Smarty 只实现了常用子集：没有 `{include}` / `{literal}` / 自定义函数 / 过滤器链里的函数调用；
- 微件内容不缓存到解析器输出（按内容 key 缓存编译结果，最多 256 条），编辑后下次渲染立即生效；
- MediaWiki 的 `Widgets` 用 `Smarty` 的完整实现并支持 `{{#widget}}` 以外的 `#widget` 调用形式，这里一致；
- 安全模型相同：微件输出可以包含任意 HTML/JS，所以微件页的编辑权等同于全站脚本权。

> **功能开关**：`features.widgets`（默认值见插件描述文件）。开关由本插件在自己的
> `META-INF/wiki-plugin.properties` 里声明（`plugin.featureKey` / `plugin.featureDefault`），
> core 自动在「特殊:权限配置 → 站点设置 → 插件设置」与 `/init` 的插件 tab 里渲染 / 保存；
> 插件用 `common.service.SiteConfig` 读同一个键——core 里没有本功能的开关代码，
> 插件未加载时开关也不出现。

[源码与开发说明](https://github.com/THOnlyWiki/WikiKernel/tree/master/plugin/widget)
