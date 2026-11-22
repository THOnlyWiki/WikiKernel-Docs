---
title: "配置参考"
description: "配置参考"
---

# 配置参考

部署参数写在启动目录的 `LocalSettings.yaml`。完整配置键、默认值和类型由源码中的 `core/src/main/resources/config-catalog.yaml` 维护，发行包提供 `LocalSettings.example.yaml`。

## 按用途查找

| 配置范围 | 说明 |
| --- | --- |
| `server.port`、`wikikernel.database` | [启动、端口与数据库](/docs/deployment/configuration) |
| `wikikernel.time.zone` | 服务器存储时区；个人显示时区在参数设置中修改 |
| `wikikernel.permissions` | [管理员与页面权限](/docs/administration/permissions) |
| `wikikernel.cache.page` | [正文缓存](/docs/administration/cache) |
| `wikikernel.sidebar.page` | [侧边栏与系统页面](/docs/administration/interface) |
| `wikikernel.features` | 功能开关，具体键见对应[插件说明](/plugins) |
| `wikikernel.plugins` | [插件目录和安装](/docs/plugins) |

## 配置来源

命令行参数优先于环境变量，本地配置文件优先于内置默认值。站点名称、功能开关等也可在管理页面保存到数据库；在 YAML 中显式填写的对应设置会在启动时覆盖数据库值。

配置项以示例文件和配置目录为准，请勿根据界面字段名推断 YAML 键名。部署参数需要重启生效，管理页面保存的动态设置按对应功能即时生效。

## 数据库维护

数据访问、结构更新及导入问题见[数据库与结构更新](/docs/development/data)。升级操作和备份范围见[备份与升级](/docs/deployment/maintenance)。
