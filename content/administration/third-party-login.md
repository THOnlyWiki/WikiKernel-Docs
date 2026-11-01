---
title: 第三方登录
sidebar_label: 第三方登录
---

# 第三方登录（GitHub / QQ）

core 提供第三方 OAuth 登录 / 注册框架；GitHub / QQ provider 分别是 `external-auth-github`、`external-auth-qq` 插件。用户在登录 / 注册页点击 GitHub 或 QQ 按钮，完成后：

- 已绑定的第三方账号：直接登录；
- 未绑定且站点允许自动注册：创建本地账号并绑定；
- 已登录用户从「特殊:参数设置 → 第三方授权」发起：只绑定到当前账号，不会切换登录用户。

## 管理入口

- **启用 / 配置 provider**：`特殊:权限配置 → 第三方登录`
- **用户绑定 / 解绑**：`特殊:参数设置 → 第三方授权`

## 配置步骤

1. 在 `特殊:权限配置 → 第三方登录` 填写站点根地址（可选）。  
   反向代理、自定义域名或 HTTPS 时必须填写对外地址，例如 `https://wiki.example.com`；留空则按当前请求推导。
2. 创建对应开放平台应用：

   **GitHub**
   - OAuth App → Authorization callback URL 填：
     `https://<你的站点>/auth/github/callback`
   - 复制 Client ID 与 Client Secret 到站点设置，勾选「启用 GitHub 登录」并保存。

   **QQ 互联**
   - 应用的回调地址填：
     `https://<你的站点>/auth/qq/callback`
   - 复制 App ID 与 App Key 到站点设置，勾选「启用 QQ 登录」并保存。

3. 保存后登录页 / 注册页会出现对应按钮。  
   Client ID 与 Secret 都填写完整且启用时按钮才显示。

## 自动注册

「首次第三方登录时自动创建本地账号」默认开启，但仍受以下限制：

- 必须同时开启 `特殊:权限配置 → 站点设置 → 启用注册`；
- 仍然经过 IP 创建封禁、禁用标题名单和插件注册钩子（如注册问答）；
- 如果第三方返回的已验证邮箱已被本地账号使用，不会自动合并，而是要求先登录后在「第三方授权」中绑定。

GitHub 返回已验证邮箱时会同步标记本地邮箱已确认；QQ 通常不返回邮箱。

GitHub 首次自动注册成功后，如果已加载 `social-profile` 插件且「用户交互」功能开启，会尝试把 GitHub
返回的 `avatar_url` 下载到本地头像存储（校验类型 / 大小，失败静默跳过）；SocialProfile 未加载、功能关闭
或头像下载失败都不会影响注册与登录。QQ 默认不导入头像。

## QQ 邮箱验证绑定

QQ 插件除了可选的 OAuth 登录外，还提供不依赖 OAuth App 的邮箱验证绑定：用户在
「特殊:参数设置 → QQ 邮箱绑定」填写数字 QQ 号，插件向 `<QQ号>@qq.com` 发送确认邮件，点击邮件里的
链接后才完成绑定。只接受数字 QQ 号（不接受英文邮箱别名），邮件始终发送到数字 QQ 对应的 `@qq.com`
地址；邮件发送失败或链接过期不会写入绑定。可通过 `wikikernel.email.types.qq-email-bind` 单独关闭
这类邮件。

## 数据与扩展

绑定表：`wiki_external_identity`（`provider + subject` 的 SHA-256 唯一键，一个本地账号可绑定多个 provider）。

新增 provider 只需在插件中实现 `cc.thonly.wikikernel.common.externalauth.ExternalAuthProvider`，在 `onStart` 里调用 `context.register(ExternalAuthProvider.class, provider)`；配置界面、登录按钮和用户授权列表会根据 provider 声明自动渲染。

provider 可通过覆盖 `ExternalAuthProvider.importAvatarOnRegister()` 声明「首次自动注册后导入头像」；
实际落盘由可选的 `ExternalAuthAvatarBridge` 扩展点完成（`social-profile` 已实现，且受
`features.social-profile` 开关控制）。没有头像桥时导入自动跳过。

当前内置的两个 provider 插件：

- `plugin/external-auth-github`：GitHub OAuth App
- `plugin/external-auth-qq`：QQ 互联

它们和其他插件一样由 `wikikernel.plugins.enabled` 控制，可在运行时装卸；未加载时对应配置项和登录按钮不会出现。

