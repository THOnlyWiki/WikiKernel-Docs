---
title: 插件系统
sidebar_label: 插件总览
sidebar_position: 0
description: 了解 WikiKernel 的插件模型、安装方式与插件目录。
---

# 插件系统

WikiKernel 的 core 只提供 SPI 和扩展点，具体功能由插件实现。插件可以：

- 注册特殊页面、Controller、模板与静态资源
- 提供 Wikitext 标签、解析器函数、行为开关
- 接管编辑前检查、注册检查、页面展示、HTML head
- 声明自己的数据库实体与站点设置分区
- 依赖其他插件，或对 core / 其他插件做 AOP
- 提供皮肤、前端组件或服务端脚本能力

## 浏览插件

完整的分类、搜索与卡片视图在：

**[打开插件目录 →](/plugins)**

目录按用途分类，可搜索插件名称和关键词。文档站维护使用说明，插件源码目录保留实现与开发记录。

## 安装与移除

发行包中的插件位于启动目录：

```text
plugins/
  comments-0.0.1-SNAPSHOT.jar
  social-profile-0.0.1-SNAPSHOT.jar
  ...
```

安装：

1. 把插件 jar 放入 `plugins/`
2. 重启 WikiKernel
3. 如果需要开关或密钥，在 `特殊:权限配置` 或插件自己的页面中配置

移除：

1. 停止应用
2. 把对应 jar 移出 `plugins/`
3. 重启

插件数据通常在 `data/plugins/<插件id>/` 或插件自己的数据表中。移除 jar 不会自动删除数据，便于以后重新启用。

## 依赖与启动顺序

插件可以在 `META-INF/wiki-plugin.properties` 中声明：

```properties
plugin.requires=comments,social-profile
plugin.requiresCore=>=0.0.1
plugin.clientRequires=comments
```

core 会按运行期依赖做拓扑排序。缺依赖、版本不满足或循环依赖只会导致该插件跳过启动并记录日志，不会让整个应用起不来。

## 插件开发

从 [插件开发](/docs/development/plugin-development) 开始，内容包括：

- 插件目录结构与最小工程
- 插件里的 Spring Bean / Controller / 特殊页
- 扩展点清单
- 数据表与 `PluginDatabase`
- 插件 Mixin
- 测试与发布

## 文档维护

同步脚本更新插件目录数据；已有页面的正文不会被插件 README 覆盖。新插件首次导入后应检查说明、配置示例和兼容范围。
