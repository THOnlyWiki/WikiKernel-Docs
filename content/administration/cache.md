---
title: "页面缓存"
description: "页面缓存"
---

# 页面缓存

页面正文缓存支持 Redis 和内置内存后端。在 `LocalSettings.yaml` 中配置：

```yaml
wikikernel:
  cache:
    page:
      enabled: true
      backend: memory
      memory-size-mb: 128
```

`memory-size-mb` 可选 `64`、`128`、`256`，默认 `128`。这是缓存容量设置，还需为 JVM、插件和请求处理留出内存。

## 选择后端

| backend | 行为 |
| --- | --- |
| `memory` | 手动使用内置内存缓存 |
| `auto` | 可使用 Redis；不可用时回退到内置缓存 |
| `redis` | 优先 Redis；不可用时回退到内置缓存 |

Redis 连接参数按发行包的 `LocalSettings.example.yaml` 或配置目录填写。使用内置缓存无需安装 Redis。

## 更新和排查

缓存按页面版本校验，编辑保存后使用新版本内容。内存缓存随进程退出清空，不属于需要备份的业务数据。

遇到内容未更新时，先核对是否查看了固定旧版本、页面是否重定向，以及插件是否自行缓存。不要通过删除数据库解决缓存问题。
