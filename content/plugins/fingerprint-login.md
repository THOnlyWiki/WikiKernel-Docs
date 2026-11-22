---
title: "浏览器指纹登录"
sidebar_label: "浏览器指纹登录"
description: "为已绑定的浏览器提供指纹识别登录。"
---

# 浏览器指纹登录

为已绑定的浏览器提供指纹识别登录。

## 安全说明

**指纹登录属于便捷凭证**，以物理设备与当前浏览器运行环境作为身份证明：

- **共享设备安全模型**：在公用或共享浏览器的运行环境下，具有当前系统会话访问权限的用户可直接触发登录；应结合操作系统的屏幕锁定机制使用；
- **环境特征计算**：系统基于 UA、屏幕规格、时区、Canvas 与 WebGL 渲染特征生成设备特征摘要；
- **环境变更适配**：更新显卡驱动、升级浏览器主版本或修改显示缩放/时区会导致特征摘要变更，此时需重新完成设备绑定；
- **认证策略建议**：适用于受信任的个人设备认证；对安全级别要求较高的场景，建议启用密码及双因素认证。

### 安全防护机制

| 防护 | 说明 |
| --- | --- |
| 限流 | core 的滑动窗口限流：按「客户端 IP + 指纹摘要」（`wikikernel.rate-limit.fingerprint-login`，默认 5 次失败 / 5 分钟 → 锁 5 分钟）与只按「客户端 IP」（`wikikernel.rate-limit.fingerprint-login-ip`，默认 10 次 / 5 分钟 → 锁 5 分钟，防止换指纹绕过）两级计数；命中成功即清除 |
| 中性错误 | 登录失败一律给同一句提示（`fingerprint.error.badCredentials`），不透露「某个指纹属于哪个用户」，也不区分「没登记」与「登记了但用户已删除」 |
| 隐私 | 管理员**不能**查看别人的指纹列表（没有按用户查询的入口）；指纹摘要从不回显（列表只给名称 / 时间 / UA 摘要） |
| 归属固定 | 指纹摘要全局唯一：已登记在别的账号下的摘要会被拒绝（避免抢注 / 覆盖别人的指纹） |
| 只能删自己的 | 增删都只作用于会话里的 `userId`，接口不接受 `userId` 参数 |
| 可选仅 HTTPS | 插件配置 `fingerprint-login.https-only = true` 时，非安全上下文（http + 非 localhost）直接拒绝；浏览器端在非安全上下文本来就拿不到 `crypto.subtle`，会隐藏按钮并提示 |
| 可随时撤销 | 用户可自助删除指纹（删除后那台浏览器立即失去登录能力）；表里没有长期令牌，不需要「退出所有设备」这类操作 |
| 上限 | 每用户最多 10 个指纹，避免无限堆积 |


## 指纹采集与 hash 方案

**只在浏览器端计算**（服务端不重算、也不保存原始特征），`crypto.subtle.digest('SHA-256')`：

```
v=1
ua=<navigator.userAgent>
lang=<navigator.language>
langs=<navigator.languages 逗号连接>
platform=<navigator.platform>
cores=<navigator.hardwareConcurrency>
memory=<navigator.deviceMemory>
screen=<screen.width>x<screen.height>
colorDepth=<screen.colorDepth>
avail=<screen.availWidth>x<screen.availHeight>
tz=<Intl.DateTimeFormat().resolvedOptions().timeZone>
canvas=<canvas 绘制（渐变 + 文本 + 曲线 + 圆）后的 toDataURL()>
webgl=<WEBGL_debug_renderer_info 的 UNMASKED_VENDOR_WEBGL / UNMASKED_RENDERER_WEBGL（取不到就 '-'）>
```

- 拼成一个规范字符串（顺序固定、每项一行、缺失用 `-` 占位）→ `SHA-256` → 64 位小写十六进制；
- **顺序 / 命名改变等于所有已登记指纹失配**：要改就当作一次「让用户重新登记」；
- 服务端只做格式校验（`[0-9a-f]{16,128}`）与查表，**不做二次哈希**（摘要本身就是不可逆摘要，直接存
  `wiki_fingerprint.fingerprint_hash`）；
- `crypto.subtle` 在非安全上下文不可用（http + 非 localhost）→ 脚本隐藏登录 / 添加按钮并给出提示，
  服务端在开了「仅 HTTPS 允许」时也会独立拒绝（前端隐藏不是安全边界）。


## 登录桥（会话内容与密码登录一致）

core 的密码登录成功分支是：

```java
UserSession.login(request, wikiUser.toTransferCopy(), "1".equals(remember));
```

插件的 `service/LoginSessionImpl`（`LoginSession` 的实现）用 `RequestContextHolder` 拿到当前请求，
经 core 的只读用户桥 `UserAdminStore.byId`（core 唯一的「按 id 取完整 WikiUser」桥）查出 `WikiUser`，
然后照搬同一套会话状态（插件只依赖 `common`，不能直接调 core 的 `UserSession`）：

```java
session.setAttribute("wikiUser", user.toTransferCopy());
session.setMaxInactiveInterval(remember ? 30 * 24 * 60 * 60 : 30 * 60);
```

因此会话属性名（core 的 `UserSession.ATTRIBUTE = "wikiUser"`）、属性内容（密码已脱敏成等长星号的
`WikiUser`）、有效期规则（记住我 30 天 / 否则 30 分钟）都与密码登录完全一致；
core 的 `CurrentUser`、模板、权限判断读到的就是同一个用户。
「记住我」的**持久登录 Cookie / `wiki_login_token`** 属于 core 密码登录流程额外签发的东西，
本桥不做（`UserSession.login` 本身也不涉及）。这条一致性由插件的 `LoginSessionImplTest` 断言
（同一个属性名、同一个脱敏口令、同一个 30 天 / 30 分钟间隔、logout 使会话失效）。


## 与其它实现方式的差异

- 不用 Cookie / localStorage 存任何「指纹令牌」：指纹摘要本身就是凭据，浏览器不需要保存状态；
- 不做设备指纹的「模糊匹配」（相似度打分）：只做精确摘要匹配，宁可让用户重新登记；
- 不记录登录 IP / UA 历史（`wiki_fingerprint` 只有 UA 摘要与两个时间戳）。

> **功能开关**：`features.fingerprint-login`（默认值见插件描述文件）。开关由本插件在自己的
> `META-INF/wiki-plugin.properties` 里声明（`plugin.featureKey` / `plugin.featureDefault`），
> core 自动在「特殊:权限配置 → 站点设置 → 插件设置」与 `/init` 的插件 tab 里渲染 / 保存；
> 插件用 `common.service.SiteConfig` 读同一个键——core 里没有本功能的开关代码，
> 插件未加载时开关也不出现。

[源码与开发说明](https://github.com/THOnlyWiki/WikiKernel/tree/master/plugin/fingerprint-login)
