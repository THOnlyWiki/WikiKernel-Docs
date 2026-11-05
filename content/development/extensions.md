---
title: "扩展点与服务"
description: "扩展点与服务"
---

# 扩展点与服务

接口定义位于 `common/extension` 和 `common/service`。根据要扩展的功能选择接口，并在插件入口注册。

## 插件扩展点

| 扩展点 | 用途 | core 消费位置 |
| --- | --- | --- |
| `ParserFunction` | `{{#name:参数}}` 解析器函数（参数原文 + `expand()` 按当前 frame 展开 + `trustedHtml()` 登记可信块）；不带 `#` 的 `{{name:参数}}`（如 `{{PAGEBANNER:…}}`）同样按名字派发 | `WikitextRenderer.parserFunction` / `pluginColonFunction`（内置 #if/#ifeq/#switch/#invoke 优先，未注册的名字仍按模板解析） |
| `MagicWord` | `{{NAME}}`（含本地化别名） | `WikitextRenderer.magicWord`（内置魔术字优先） |
| `BehaviorSwitch` | `__NAME__` 行为开关，可写页面属性 | `WikitextRenderer.renderWithMeta` |
| `ParserTag` | `<tag>内容</tag>`；`expandBody()=false` 时内容不参与模板展开（如 `<templatedata>` 的 JSON） | `WikitextRenderer.protectPreBlocks` / `extractPluginTags` |
| `HtmlHeadProvider` | `<head>` 注入（meta / link）与 `<title>` 覆盖；`siteWide()=true` 时注入**所有**页面（脚本片段在 core 站点级配置之后，可直接用 `window.WIKI_CONFIG` / `WIKI_MESSAGES`） | `WikiPageController.applyHeadExtensions`（阅读视图，只取**页面级**实现，带本次渲染属性）+ `PluginHeadAdvice`（所有页面，只取**站点级**实现；两边各管一半、同一片段不会注入两遍） |
| `PageViewHook` | 词条阅读（非 diff / 旧版本）时的事件（用户 / 机器人 / 用户组） | `WikiPageController.firePageView` |
| `PageDisplayHook` | 页面显示：`renderBody()` 认领整页正文（`图表:` / `微件:` 这类非 wikitext 页）、`renderMissingPage()` 认领**不存在的标题**（审核的「待审创建」页）、`beforeTitle()` 标题上方（页面横幅）、`beforeContent()` 正文之前（待审提示条）、`afterContent()` 正文下方（评论区）、`headItems()` 该页额外 head | `PageDisplayHookService`（core 的服务，统一按 `order()` 升序 + 异常容错）+ `WikiPageController`（阅读视图；皮肤布局与 `wiki/view.html` 有对应槽位；缺失页用通用外壳 `templates/wiki/plugin-missing-page.html`） |
| `FileEmbedRenderer` | `[[文件:X]]` 嵌入与文件页预览的渲染（多媒体播放器） | `WikitextRenderer.renderFileEmbedding`、`WikiPageController.renderFilePage` |
| `PreferenceSection` | 参数设置里由插件贡献的标签页（core 渲染标签 + 面板，表单由插件自己提交） | `PreferencesSpecialPage.populate` |
| `SiteSettingsSection` | **站点设置页里由插件贡献的分区**：插件声明标题与字段（键 = 站点设置键，类型 `text` / `textarea` / `checkbox` / `select`），core 渲染成表单并在保存时按声明的键写站点设置（checkbox 未勾选 = false）——core 不认识这些设置属于哪个功能 | `AccessControlSpecialPage`（模型键 `pluginSettings`，模板 `special/access-control.html` 的「插件设置」区）+ `SiteSettingsApiController.save`（表单里的隐藏 `plugin-section` 标记） |
| `plugin.featureKey`（描述文件） | **插件功能开关**：插件在 `META-INF/wiki-plugin.properties` 里写 `plugin.featureKey=features.<插件id>` 与 `plugin.featureDefault=true|false`，core 自动在「站点设置 → 插件设置」渲染一个复选框（键 = 声明的开关，标签 = 插件的本地化名），安装向导的插件 tab 也自动带上它（写 `wikikernel.<开关键>`）；插件自己用 `SiteConfig` 读同一个键——**core 里没有该开关的代码**，插件没加载时开关也不出现 | `PluginFeatureSections`（分区与开关合并，`/api/plugins` 也返回 `featureKey` / `featureDefault`）+ `SetupService.pluginTabs` / `applyPlugin` |
| `SetupStep` | 安装向导里插件的设置入口（一个插件一个 tab；`SetupField` 支持 `text` / `password` / `checkbox` / `select` / `textarea`，`apply()` 经 `SetupContext.putGlobal` 写 `wikikernel.*`） | `SetupService.steps()` / `SetupController`；插件未加载时 tab 不存在 |
| `ActionApiModule` | 插件自己的 `/api.php?action=…` 模块（含页面 / 属性 / 正文查询上下文） | `ActionApiService.pluginAction` |
| `EditGuard` | **保存前钩子**：网页编辑表单与 `api.php?action=edit` 写入正文前按 `order()` 升序调用；`ALLOW` 放行 / `BLOCK(message)` 拒绝（网页回到编辑表单并保留已填内容与摘要，API 返回错误）/ `WARN(message)` 放行但保存后提示一次 / `HANDLED(redirect)` 钩子已自行处理（core 不再保存） | `EditHookService.beforeSave`（`WikiPageController.submitEdit` = `source=web`；`ActionApiService.edit` = `source=api`） |
| `EditFormField` | **编辑页表单字段**：编辑框下方（摘要栏之后、保存按钮之前）插入 HTML（验证码的题目 + 输入框），`notice()` 在保存按钮附近显示提示 | `WikiPageController.applyEditFormExtensions` + `templates/wiki/edit.html` 的 `editFormFields` / `editFormNotices` 槽位 |
| `RegistrationGuard` | **注册前钩子**：创建账号前按 `order()` 升序调用；`BLOCK(message)` = `POST /api/user/register` 返回 400 + 说明 | `RegistrationHookService.beforeRegister`（`ApiController.register`） |
| `RegistrationFormField` | **注册页表单字段**：注册表单里（电子邮件之后、提交按钮之前）插入 HTML（注册问答的题目 + 隐藏下标 + 答案输入框） | `RegisterSpecialPage.populate` + `templates/special/register.html` 的 `registerFormFields` 槽位 |
| `UserProfileHook` | **用户页资料卡槽位**（仿 `SkinTemplateNavigation` / SocialProfile）：`avatarUrl()` 给资料卡头像（null / 空 = 默认头像）、`linksHtml()` 给「贡献 \| …」一行里的额外链接（如「私信」「上传头像」）；`order()` 升序，头像取第一个非空 | `UserProfileHookService` + `web/UserProfileAdvice`（从请求 URI 的 `用户:X` / `User:X` 解析资料卡用户，模型键 `userPageName` / `userAvatarUrl` / `userProfileLinks`；模板 `fragments/user-profile.html`） |
| `PersonalToolbarHook` | **顶栏个人工具区槽位**（仿 `PersonalUrls`）：`itemsHtml()` 给 `<li>…</li>` 级别的额外条目（如「私信（N）」未读计数）；`order()` 升序、null / 空 = 不插入 | `PersonalToolbarHookService` + `web/PersonalToolbarAdvice`（模型键 `pluginPersonalTools`；模板 `fragments/personal-tools.html` 在最后一项之后渲染） |
| `ActionGuard` | **通用动作钩子**（编辑以外的动作）：`beforeAction(ActionContext)` 按 `order()` 升序执行，`BLOCK(message)` 拒绝 / `WARN(message)` 放行并提示 / `HANDLED(message, data)` 钩子已自行处理（core **不执行该动作**，当作成功返回并把 `data` 并入响应，审核的上传 / 删除排队用它）；动作名（move / upload / delete / protect / block）、目标、动作相关数据、来源（web / api）在上下文里，上传动作的 `payload()` 是文件内容（钩子可自行暂存） | `core/service/ActionHookService`，接在 `PageApiController`（移动 / 保护）、`FileApiController`（上传 / 删除）、`BlockApiController`（封禁）、`ActionApiService`（`api.php?action=upload`） |
| `LogType.detailText()` | **日志详情文案**（可选）：core 把存库的 `detail` 原样交给类型自己（如审核的 `edit\|审核意见`），插件可本地化 / 结构化解析（返回 null / 空 = 按 core 通用规则展示原始 detail） | `core/log/LogFormatter.detailText`（先问注册的日志类型，再走 core 的内置规则） |
| `CoreAopHook` | **对 core / common 的 Bean 加切面**：`advisors()` 返回 Spring AOP `Advisor`（`DefaultPointcutAdvisor` 等），core 把它们套到匹配的 core Bean 上；插件自己的 Bean 也生效。插件在 `ApplicationReadyEvent` 之后才加载，core 用「桥接代理 + 活点切面」保证**已经注入到其它 Bean 的引用**同样被切中 | `core/plugin/aop/PluginAopRegistry`（汇总 / 容错 / 卸载撤销）+ `PluginAopBridge`（`SmartInstantiationAwareBeanPostProcessor`，Bean 创建阶段建代理）+ `PluginSpringContextFactory.registerAopBridge`（插件子容器） |

渲染上下文与插件可注入的 core 服务：

- `WikiRenderContext`（`ParserFunctionCall.context()` / `ParserTagCall.context()`）：
  `store()` 渲染内变量（跨模板、页面级）、`setProperty()` 页面属性（渲染结束后持久化到新表 `wiki_page_property`）、
  `deferWikitext()` 解析结束后的延迟占位（Variables 的 `#var_final` 用它）；
- `common.service.PagePropertyStore`（core 实现，插件直接 `@Autowired` 注入）：
  页面属性读写、`addToInt` 计数、`sumInt`、`listByIntDesc`、`registerDurable`（登记「持久属性」，页面重新解析保存时不覆盖，浏览计数用它）；
- `common.service.WikiPageStore`：按标题 / ID 查页面、读最新正文、`visibleByTitle`（按查看权限过滤）、
  `latestRevisionId`（按修订号缓存）、列出内容命名空间页面；
- `common.service.CategoryStore`：分类成员（分类 / 页面 / 文件，带排序键与命名空间编号）、页面所属分类、成员统计（CategoryTree 用）；
- `common.service.FileStore`：按文件名查媒体文件（文件名 / 直链 / 说明页 / 是否图片 / 媒体类型；Flash 播放器、页面横幅等用）；
- `common.service.UserSettings`：用户偏好读写（`gadgets` / `skin` / `language` 等走 `wiki_user` 列，
  其它键落 `wiki_user_preference` 键值表）——Gadgets 的「参数设置 → 小工具」用它；
- `common.service.CurrentUser`：当前请求用户与用户组（`Viewer`：id / 名字 / 匿名 / 组集合 / 机器人）——
  Gadgets 的 `rights=` 过滤、评论区与私信判断登录状态都用它；
- `common.service.UserStore`：按 ID / 用户名查用户、批量取用户名与头像、用户组集合（评论作者、私信收件人、
  审核提交人等用）；`UserRef.avatarUrl(defaultUrl)` 直接给头像地址；`defaultAvatarUrl()` 读取 core 的
  共享默认头像设置 `site.default-avatar`（Timeless 的「默认头像」写同一个键，插件之间无需互相依赖）；
- `common.service.WikiText`：用**同一套**渲染器渲染 wikitext 片段（`toHtml` / `toHtmlWithCategories`）——
  评论内容、待审正文预览、AI 提案预览都用它，模板 / 解析器函数 / 白名单全部生效；
- `common.service.LogWriter`：写操作日志（类型 id 用 `common.extension.LogType` 注册，展示文案由 core 本地化）。
- `common.service.PageWriter`：**绕过网页表单**直接保存 / 删除页面（`save(PageWriter.Request)`，可带乐观锁 `expectedRevisionId`、机器人 / 小编辑标记、AI 水印 `aiAssisted`）——审核通过待审更改、AI 代理确认提交用它；表单流程里的东西（验证码、审核排队）不在这一层，调用方自己负责权限与业务校验。
- `common.service.AccessCheck`：按站点访问规则判断动作（`can` / `canRead`）与当前封禁提示（`blockNotice`）——插件在自己的接口 / 页面里做权限判断时用它，不要复制规则逻辑。
- `common.service.FileWriter`：**文件写入桥**（core 的 `FileService` 仍是唯一写入方）——`store(actorUserId, name, description, bytes)` 写入一个文件版本、`delete(actorUserId, fileId, hard)` 删除；审核插件通过待审上传 / 待审删除用它；
- `common.service.WikiDiff`：**行级差异桥**（与差异对比页共用 core 的 `DiffRows` 实现与模板行模型）——`rows(oldContent, newContent)`；审核队列的「当前版本 → 待审内容」用它；
- `common.service.LoginSession`：**登录会话建立桥**（`establish(userId, remember)` / `logout()`）——替代登录方式的插件（指纹登录等）用它建立与 core 密码登录**完全一致**的会话（属性 / 有效期 / 脱敏副本都在 core 实现，插件不抄约定）；
- `common.service.PluginDatabase`：**插件自有表的数据访问桥**（JDBC：`update` / `insert`（回填自增主键）/ `query` / `queryOne` / `transaction`；列名小写、时间 / 布尔 / 数字类型差异由 `DbRow` 抹平）——
  插件用 `WikiPlugin.schemaEntities()` 声明自己的 `@TableName` 实体，core 在 `onStart` 前按 core 的 Auto-DDL 规则建表 / 补列（SQLite / MySQL / H2，只增不减），
  插件专属的实体与数据访问都留在插件里（不再往 `common.data` / `common.service` 塞）；参考实现：`plugin/abuse-filter`（`AbuseFilterStoreJdbc`）。

**子扩展数据层现状**（这一批已全部迁完：实体 / 桥接口 / 数据访问都在插件里，表名 / 列名 / 键名与旧数据完全兼容，core 在插件 `onStart` 前自动建表 / 补列）：

| 插件 | 表（旧数据沿用） | 插件内实现 |
| --- | --- | --- |
| `abuse-filter` | `wiki_abuse_filter` / `_revision` / `wiki_abuse_log` | `AbuseFilterStoreJdbc` |
| `comments` | `wiki_comment` | `CommentStoreJdbc` |
| `moderation` | `wiki_pending_change` + `{run-path}/pending/` 暂存 | `ModerationStoreJdbc` / `PendingFileStoreImpl` |
| `social-profile` | `wiki_user_board` / `_gift` / `_award` / `_stats` / `_relation` / `wiki_message` + 头像文件 | 6 个 `*StoreJdbc` + `AvatarStoreJdbc`（`/avatars/**` 也由插件服务） |
| `fingerprint-login` | `wiki_fingerprint` | `FingerprintStoreJdbc`（登录会话走平台桥 `LoginSession`） |
| `rename-user` | core 的 `wiki_user` / `wiki_log` 等（改名 / 日志） | `UserAdminStoreJdbc` |
| `user-merge` | core 的用户 / 编辑 / 文件表（合并） | `UserMergeStoreJdbc` |
| `ai-agent` | `wiki_user_ai_key` | `AiConfigService`（+ `PluginDatabase`；站点键走 `SiteConfig` 读写，`wikikernel.ai.*` 由插件自己的 `AiProperties` 绑定） |

对应的 core / common 侧实现（`*StoreImpl`、Mapper、`common.data` 实体、`common.service` 桥接口）已经**全部删除**；插件里的每个 JDBC store 都有 H2 真实 SQL 测试（建表语句、列名映射、过滤 / 计数 / 事务路径），core 侧只保留「插件未加载时」的边界测试与仍属平台的桥（本列表外的 `common.service.*`）。
- `common.service.RecentChangesStore`：**最近编辑 / 编辑者概况的只读桥**（`recentEdits(limit)`：版本号 / 页面 / 作者 / 时间 / 摘要 / 正文与上一版正文；`editorStats(userId)`：编辑数 / 注册时间）——滥用过滤器的「测试过滤器」、活动流类扩展用；
- `common.service.UserWriter`：插件创建 / 更新系统账号（不存在才建 + 授予用户组）——滥用过滤器的系统账号「滥用过滤器」用它。
- `common.service.EditSubmitter`：**像一次编辑那样提交**（先跑平台保存前钩子 `EditGuard`，再按乐观锁保存）——`blocked` 拒绝 / `handled` 钩子接管（如审核进队列）/ `warn` 保存并回传提示；AI 代理确认提交这类「没有表单的写入路径」用它，不需要自己拼 `EditContext`。
- `common.service.SiteConfig`：站点设置读写桥（`get` / `getBoolean` / `getInt` / `set`）——**写入与 core 的 `/init`、站点设置页同一个存储**，插件写自己的键（空串 = 清空）；ai-agent 用它维护 `ai.provider.<id>.*` 与 `ai-agent.allow-normal-users`。
- `common.service.KvStore`：**给插件用的 Key-Value 存储**（表 `wiki_kv`，抽象结构 `(id, name, type, value)`，`type` = `string` / `number` / `json`）——
  `get` / `getString` / `getNumber` / `json` / `putString` / `putNumber` / `putJson` / `delete` / `exists` / `list(前缀, limit)` / `increment`；
  适合插件自己的小配置与小状态，**不要**当业务表用（物理列名是 `kv_value`：`value` 在 H2 是保留字）；
- `common.service.PageCache`：页面正文缓存（`enabled` / `html` / `put` / `invalidate` / `invalidateAll` / `invalidateTranscluding`）——插件改内容后可主动失效；
- `common.service.PageQueryStore`：**页面列举 + 版本历史桥**——`namespaces()`（命名空间稳定 id）、`detail(title)`（页面 ID / 最新版本 / 保护状态 / 创建与更新时间）、`list(prefix, namespace, limit)`（按前缀与命名空间列页面，命名空间语义与 `特殊:全部页面` 一致）、`latestRevision(pageId)` / `history(pageId, limit)`（版本元信息：作者 / 摘要 / 大小 / 小编辑 / 机器人 / AI 水印 / 是否删除）——AI 代理的 `read` / `list` / `info` / `history` 工具用它。
- `common.service.PageLinkStore`：**链接索引桥**——`templatesUsedBy(title)` / `pagesLinkingTo(title, limit)` / `pagesTranscluding(title, limit)`（core 的链接索引，只回传标题）——AI 代理的 `info` 工具用它。
- `common.service.SearchStore`：**搜索桥**——`search(keyword, limit)` 走 core 的搜索引擎（内置提供方 + 插件 `SearchProvider`），权限过滤由调用方用 `AccessCheck` 自己做——AI 代理的 `search` 工具用它。
- `common.service.RateLimit`：**限流桥**——`check(category, key)` / `hit(category, key)` / `success(category, key)`，与 core 的登录 / 安装向导 / 密码重置共用同一套「滑动窗口 + 锁定」实现，规则仍是 `wikikernel.rate-limit.<分类>`——AI 代理的对话限流（`ai-agent`，默认 30 次/小时）用它。

页面属性在页面保存 / 删除时由 `PagePropertyEventListener` 重新解析并覆盖保存（对应 MediaWiki 保存 ParserOutput 的
`page_props`）；`HtmlHeadProvider` 读到的是**本次渲染**的属性，模板里的 SEO 改动立即生效。
皮肤侧新增：`hideTitle`（隐藏 `h1#firstHeading`）与 `fragments/head.html` 的 `headItems` / `htmlTitle` 槽位。

## 插件平台能力（core 提供，插件可直接用）

- **插件消息（i18n）**：注册 `common.extension.MessageBundle`（语言 → 键 → 文案），core 的 `messageSource`
  会先查 `messages*.properties` 再查插件消息（语言回退 `zh-CN → zh → en`），因此模板 `#{键}`、
  控制器与插件里的 `MessageSource` 都能用；
- **站点设置读取**：`common.service.SiteConfig`（`get` / `getBoolean` / `getInt`）——插件可读
  `features.*`（功能开关）、`site.name` 等 core 设置，保证迁移前后的开关语义一致；
- **编辑 / 注册钩子（表单字段 + 保存前校验）**：`EditFormField` / `EditGuard`（编辑页与
  `api.php?action=edit`）与 `RegistrationFormField` / `RegistrationGuard`（注册页与
  `POST /api/user/register`）——插件既能在表单里加字段，也能在写入前放行 / 拒绝 / 警告 / 自行处理；
  钩子按 `order()` 升序执行、**抛异常只记警告并跳过**（页面不 500），来源用 `EditContext.source()` /
  `RegistrationContext.source()` 区分（`web` / `api`），会话状态放 `SessionAttributes`（不依赖 Servlet API）；
  没有任何插件注册时编辑页与注册页与迁移前完全一致；
- **用户界面槽位钩子（本批新增）**：`UserProfileHook`（用户页资料卡的头像与「贡献 | …」额外链接）与
  `PersonalToolbarHook`（顶栏个人工具区的额外条目）——core 用 `web/UserProfileAdvice` /
  `web/PersonalToolbarAdvice` 收集（从请求 URI 的 `用户:X` / `User:X` 解析资料卡用户），
  结果放模型键 `userAvatarUrl` / `userProfileLinks` / `pluginPersonalTools`，
  模板槽位在 `fragments/user-profile.html` / `fragments/personal-tools.html`；
  同样按 `order()` 升序、**抛异常只记警告并跳过**，API 请求不询问这两类钩子，
  没有任何插件时资料卡用默认头像且个人工具区与迁移前完全一致；
- **动作「自行处理」与上传载荷（本批新增）**：`ActionGuard.Outcome.HANDLED(message, data)` 表示
  「钩子已经处理完这个动作」（如审核把上传写进队列而不是落盘）——core 不执行该动作、把结果当作成功返回，
  `data` 并入网页响应的 `data` / API 的动作对象（审核上传回 `pending=true` / `moderated=true`）；
  同时 `ActionContext.payload()` 在上传动作里给出文件内容（钩子可自行暂存），
  移动 / 删除 / 封禁没有载荷；`api.php?action=upload` 现在也走同一条钩子链（此前只有网页上传走）；
- **插件静态资源端点**：把文件放在插件 jar 的 `static/plugins/<插件id>/…`，浏览器访问
  `/plugins/<插件id>/…` 即可（一天公共缓存、ETag、防目录穿越；仅服务已加载插件）；
- **提交 / 查询 / 限流桥（本批新增）**：`common.service.EditSubmitter`（**像一次编辑那样提交**：先跑
  `EditGuard`，再按乐观锁保存——AI 代理的「确认提交」用它，`source=ai`，钩子登记的变更标签随版本写入）、
  `PageQueryStore`（页面列举 + 版本历史）、`PageLinkStore`（模板 / 链入 / 被嵌入）、`SearchStore`（搜索）、
  `RateLimit`（按分类限流，规则仍在 `wikikernel.rate-limit.*`）——AI 代理插件是第一个用户，
  core 侧接线由 `PluginDataBridgeTest` 覆盖；
- **插件管理自己的站点级表单**：AI 代理的站点密钥与「允许普通用户使用」原来在
  `特殊:权限配置 → 站点设置`（和 `/init` 的配置项），迁移后由插件自己的管理员入口
  （`特殊:AI代理?keys=1`）渲染，写的是同一批设置键（`ai.provider.<id>.*` /
  `ai-agent.allow-normal-users`）——插件写站点设置走 `common.service.SiteConfig.set`（与 core 的
  `/init`、站点设置页同一个存储），不要依赖 core 的 `SiteSettingsService`；
- **插件里的 `@RestController` 依赖必须是 Bean**：插件子容器会扫描插件包的 `@Component` / `@Service` / `@RestController`
  （`PluginSpringContextFactory.scanPluginPackage`），所以被接口 / 特殊页构造器依赖的支撑对象**不能只在 `onStart` 里 `new`**
  ——要么标 `@Component`（构造器注入 core 提供的桥），要么在入口类里 `@Autowired` 后再注册为扩展点；
  否则插件在真实实例上会以 `NoSuchBeanDefinitionException` 启动失败（单元测试发现不了）；
- **运行时装载回归**：`core` 的 `PluginRuntimeLoadTest` 用根目录 `plugins/` 里的真实 jar 启动一次应用，
  断言每个 jar 都成功启动（数量一致 + 关键插件在列）。先跑 `.\gradlew.bat installPlugins`；
  `plugins/` 为空时该测试自动跳过，不影响普通 `gradlew build`；
- **坏插件容错**：插件 jar 描述文件缺失 / 入口类不存在时只记警告并跳过，不再拖垮应用启动；
- **插件可注入的 core Bean**：除 common 桥接服务（`WikiPageStore` / `PagePropertyStore` / `CategoryStore` /
  `SiteConfig`）外，Spring 类型（如 `MessageSource`、`DataSource`）也可直接 `@Autowired`；
- **插件依赖插件 / 插件依赖 core（版本约束）**：描述文件的 `plugin.requires`（运行期依赖别的插件）、
  `plugin.requiresCore`（core 版本约束）、`plugin.clientRequires`（前端资源依赖）——
  加载顺序按依赖拓扑排序，缺失 / 环 / 版本不匹配只跳过并记日志，**不会让应用启动失败**，
  细节见上文「插件依赖声明」；core 侧回归由 `PluginDependencyResolutionTest` 覆盖
  （现场生成带各种依赖关系的插件 jar）；
- **插件对 core / common 做 AOP**：注册 `CoreAopHook`（`common/extension`）即可对 core 的 Bean
  与插件自己的 Bean 加切面（`PluginAopRegistry` + `PluginAopBridge`），
  切面对**已经注入到其它 Bean 的引用**生效、插件卸载后立即失效；开关 `wikikernel.plugins.aop-bridge`
  （默认 `auto` = 装了插件才启用）；core 侧回归由 `PluginAopTest` 覆盖
  （代理、注入引用、撤销、坏 Advisor 容错、基础设施不代理），
  真实 jar 端到端由 `DepDemoPluginTest` 覆盖（读插件里的切面计数器）；
- **客户端注入顺序**：`PluginManager.clientLoadOrder()`（`plugin.clientRequires` 的拓扑顺序，
  被依赖者的 `<head>` 片段在前）与 `clientDependencyWarnings()`（缺失客户端依赖时的 HTML 注释警告）；
  `PluginHeadAdvice` / `WikiPageController` 的 head 收集都已改成走这两个入口；
- **示例 / 演示插件**：`plugin/dep-demo`（**不是** MediaWiki 扩展移植）用来演示上面三项能力：
  `plugin.requiresCore=>=0.0.1` + `plugin.clientRequires=comments` + `CoreAopHook`（统计 core 调用 + 插件自己的 Bean），
  同时是 core 侧端到端测试的输入。它会被 `.\gradlew.bat build` / `:plugin:dep-demo:build` 构建，
  但 **`installPlugins` 不会把 `*-demo-*.jar` 复制进 `plugins/`**，因此不影响真实部署；
  想在真实实例上试玩时手动 `copy plugin\dep-demo\build\libs\*.jar plugins\` 再重启即可；
- **插件可以用 core 运行时已有的第三方库**（compileOnly 声明、运行时由 core 的类加载器提供）：
  AI 代理插件就用了 Jackson 3（`tools.jackson.core:jackson-databind`，解析厂商响应）与
  CommonMark（`org.commonmark:*`，渲染 AI 回复的 Markdown）——插件 jar 不打包它们。

## 时间显示

插件可注入 `common.service.TimeDisplay`，调用 `format(LocalDateTime, pattern)`。输入为按服务器时区保存的时间，输出按当前请求用户的时区换算；不要为了显示时间修改数据库记录。
