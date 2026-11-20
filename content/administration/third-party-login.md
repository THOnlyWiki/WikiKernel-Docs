---
title: 第三方登录
sidebar_label: 第三方登录
---

# 第三方登录

安装对应插件后，用户可以在登录或注册页选择 GitHub、QQ、Google 或 Discord。授权完成后的行为取决于账号是否已经绑定以及发起授权的入口。

- 已绑定的第三方账号：直接登录；
- 未绑定且站点允许自动注册：创建本地账号并绑定；
- 已登录用户从「特殊:参数设置 → 第三方授权」发起：只绑定到当前账号，不会切换登录用户。

## 管理入口

- **启用 / 配置 provider**：`特殊:权限配置 → 第三方登录`
- **用户绑定 / 解绑**：`特殊:参数设置 → 第三方授权`

## 配置步骤

1. 在 `特殊:权限配置 → 第三方登录` 填写站点根地址（可选）。  
   反向代理、自定义域名或 HTTPS 时必须填写对外地址，例如 `https://wiki.example.com`；留空则按当前请求推导。
2. 在对应平台创建应用，并登记完整的 HTTPS 回调地址。以下示例使用 `https://wiki.example.com`。

   | 平台 | 插件 | 应用类型与回调地址 |
   | --- | --- | --- |
   | GitHub | `external-auth-github` | OAuth App，`https://wiki.example.com/auth/github/callback` |
   | QQ 互联 | `external-auth-qq` | 网站应用，`https://wiki.example.com/auth/qq/callback` |
   | Google | `external-auth-google` | OAuth 客户端类型选 Web application，`https://wiki.example.com/auth/google/callback` |
   | Discord | `external-auth-discord` | Developer Portal 应用的 OAuth2 Redirects，`https://wiki.example.com/auth/discord/callback` |

3. 将应用的 Client ID 和 Client Secret 填入站点设置，开启对应登录选项并保存。QQ 使用 App ID 和 App Key。配置完整后，对应按钮会出现在登录页、注册页和第三方授权页。

Google 需要配置 Google Auth Platform 的品牌与受众。授权应用处于测试状态时，在受众设置中添加测试用户。Discord 使用普通 OAuth2 应用授权，只请求 `identify email`。Google 请求 `openid profile email`。[Google Web Server OAuth 指南](https://developers.google.com/identity/protocols/oauth2/web-server) · [Discord OAuth2 指南](https://docs.discord.com/developers/topics/oauth2)

## 自动注册

「首次第三方登录时自动创建本地账号」默认开启，但仍受以下限制：

- 必须同时开启 `特殊:权限配置 → 站点设置 → 启用注册`；
- 仍然经过 IP 创建封禁、禁用标题名单和插件注册钩子（如注册问答）；
- 如果第三方返回的已验证邮箱已被本地账号使用，不会自动合并，而是要求先登录后在「第三方授权」中绑定。

GitHub 和 Discord 返回已验证邮箱时，可在首次建号时同步确认邮箱。Google 仅使用已验证的 Gmail 地址或带 Google Workspace 托管域声明的地址。其他地址可以在站内通过邮件验证。QQ 通常不返回邮箱。

注册问答启用时，OAuth 回调也会经过同一注册钩子。若新用户在第三方登录后被注册问答拦下，可以先完成站内注册，再到「第三方授权」绑定账号。

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

部署使用插件白名单时，把对应插件 ID 加进 `wikikernel.plugins.enabled`。Google 与 Discord 在服务端完成授权码交换与本人资料查询，绑定表保存平台账号 ID 和资料快照。访问令牌仅用于本次查询。站内解绑会解除该身份与 Wiki 账号的关联。若还要撤销平台对应用的授权，在 Google 或 Discord 的账号设置中移除应用。

扩展实现、PKCE 与测试方式见[开发第三方登录插件](/docs/development/plugin-development#开发第三方登录插件)。

