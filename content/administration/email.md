---
title: "邮件与邮箱确认"
description: "邮件与邮箱确认"
---

# 邮件与邮箱确认


邮件发送统一走 `wikikernel.email.*` 配置，适配 587 + STARTTLS（默认）/ 465 + SSL / 内网无验证 SMTP；
邮件类型是扩展点（`EmailType`，core Bean 或插件 `PluginContext.register(EmailType.class, …)`），
每种类型可在 `types` 下逐个开关，发送实现见 `mail/MailServiceImpl`。

```yaml
wikikernel:
  email:
    enabled: true                 # 总开关（false = 所有邮件都不发）
    host: smtp.qq.com             # SMTP 服务器
    port: 587                     # 587 STARTTLS / 465 SSL / 25 明文
    username: 你的@qq.com          # 登录用户名（QQ 邮箱就是邮箱地址）
    password: "SMTP授权码"         # QQ 邮箱需用授权码，不是登录密码
    auth: true
    starttls: true                # 465 端口请改用 ssl: true
    ssl: false
    from: ""                      # 发件人（留空 = username）
    from-name: ""                 # 发件人显示名（留空 = 跟随站点名称）
    token-expire-hours: 24        # 确认 / 重置链接有效期
    confirm-cooldown-seconds: 60  # 邮箱确认邮件的发送冷却（秒；0 = 不限制）
    # base-url: https://wiki.example.com   # 邮件链接里的站点地址（留空 = 按请求自动推导）
    types:                        # 每种邮件类型开关（未配置 = 启用）
      confirm-email: true         # 邮箱确认
      password-reset: true        # 重置密码（特殊:重置密码 → POST /password/reset-request）
      user-to-user: true          # 用户间邮件（流程待接线）
```

- **邮箱确认**（仿 MediaWiki 的 Special:Confirmemail）：
  - 参数设置 → 电子邮件选项 → 填写邮箱并保存后出现「发送确认邮件」按钮（`POST /api/user/email/confirm`）；
  - 邮件里的链接 `GET /email/confirm?token=…` 打开后确认地址（令牌存 `wiki_email_token`，只存 SHA-256 摘要，默认 24 小时有效、一次性）；
  - 未登录会先跳登录页（登录后自动回到确认链接）；必须用**收到邮件的账号**打开（其它账号会提示）；
  - 确认成功自动授予 **邮箱确认用户**（自动用户组，权限页可见），并写 `rights` 权限日志；
  - **发送冷却**：`confirm-cooldown-seconds`（默认 60 秒，0 = 不限制）——同一用户两次发送之间的最小间隔，
    冷却期内再点会返回「发送过于频繁，请在 N 秒后重试」；发送失败不占用冷却，成功后才开始计时；
  - 换绑邮箱会清除确认状态、撤销「邮箱确认用户」权限与旧确认令牌；
- 未配置 SMTP / 总开关关闭 / 类型被禁用 / 收件地址为空时，页面都会给出对应本地化提示，不会静默失败。

