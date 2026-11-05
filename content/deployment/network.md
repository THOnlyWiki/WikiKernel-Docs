---
title: "反向代理与跨域"
description: "反向代理与跨域"
---

# 反向代理与跨域

## 反向代理 / Docker 真实客户端 IP（`wikikernel.http`）

应用直接看到的 `RemoteAddr` 是反向代理容器的地址（例如 Docker 网桥的 `172.x.x.x`）。要让日志、
`特殊:用户核查`、IP 封禁和登录限流使用真实客户端 IP，需要同时满足：

1. `LocalSettings.yaml` 开启信任转发头：

   ```yaml
   wikikernel:
     http:
       trust-proxy-headers: true
   ```

2. 反向代理把客户端地址写入转发头，并**覆盖**客户端自带的同名头。Nginx 示例：

   ```nginx
   proxy_set_header X-Real-IP $remote_addr;
   proxy_set_header X-Forwarded-For $remote_addr;   # 覆盖客户端自带的 XFF
   ```

   应用依次识别 `CF-Connecting-IP`、`CF-Connection-IP`、`True-Client-IP`、`X-Real-IP`、
   `X-Forwarded-For`；`X-Forwarded-For` 取第一个合法地址。Cloudflare 会提供
   `CF-Connecting-IP`（部分兼容代理使用 `CF-Connection-IP`）。

> 只有请求确实经过你控制的反向代理时才开启。应用直接暴露在公网时开启会允许客户端伪造 IP。


## CORS 跨域（`wikikernel.cors`）

默认**关闭**（不添加任何跨域响应头，行为与原来完全一致）；让其它站点的前端用 `fetch` 调本站接口时再打开：

```yaml
wikikernel:
  cors:
    enabled: true
    allowed-origins:                 # 精确来源；"*" = 任意来源
      - https://example.com
    allowed-origin-patterns:         # 通配来源（可只配这一项）
      - https://*.example.com
    allowed-methods: [ GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS ]
    allowed-headers: [ "*" ]         # 预检允许的请求头
    exposed-headers: [ ]             # 允许前端读取的响应头
    allow-credentials: false         # 允许携带 Cookie / Authorization
    max-age: 3600                    # 预检结果缓存秒数
    paths: [ "/api/**" ]             # 生效路径；默认全部
```

- 生效条件：`enabled: true` **且** `allowed-origins` / `allowed-origin-patterns` 至少配一个来源；
  两者都没有时不会注册跨域过滤器（启动日志会说明）；
- `allow-credentials: true` 时不能用 `"*"` 当精确来源：会自动改成“按请求 Origin 回显”的来源模式并记日志；
- 允许跨域不代表授予读写权限，登录状态、请求来源和各接口的校验仍然生效。
- 安全提示：`"*"` 会让任意网站读取接口响应；需要带登录态（Cookie）跨域时用精确来源 +
  `allow-credentials: true`，并按浏览器要求通过 HTTPS（Cookie 需 `SameSite=None; Secure`）。
