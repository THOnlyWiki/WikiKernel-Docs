---
title: "数据库与结构更新"
description: "数据库与结构更新"
---

# 数据库与结构更新

- ORM 使用 **MyBatis-Plus 3.5.17**（官方 Boot 4 starter `mybatis-plus-spring-boot4-starter`）；
- 实体类（`@TableName` 模型）放在 **`common/src/main/java/cc/thonly/wikikernel/common/data/`**，
  core 与插件都能引用；Mapper 放在 core 的 `cc.thonly.wikikernel.db.mapper` 下（`@MapperScan`）；
- 表结构由**实体驱动自动维护**（类似 JPA `ddl-auto=update`）：启动时表不存在则建表，缺字段则 `ALTER TABLE ... ADD COLUMN`；
- **只增不减**：不会删列、不会改类型、不会动已有索引；正式环境建议关闭并改用 Flyway/Liquibase 脚本迁移。

```java
/** 页面身份：一行 = 一个页面（正文在 WikiRevision） */
@Data
@TableName("wiki_page")
public class WikiPage {
    @TableId(type = IdType.AUTO)
    @DbColumn
    private Long id;                 // 页面 ID（自增，历史的“页面身份”）

    @DbColumn(nullable = false)
    private String title;

    @DbColumn
    private Long latestRevisionId;   // 指向当前版本

    @DbColumn(nullable = false)
    private LocalDateTime updateAt;  // createAt / hided / deleted 略
}

/** 历史版本：一行 = 一次编辑（正文在这里，仿 MediaWiki 的 revision 表） */
@Data
@TableName("wiki_revision")
public class WikiRevision {
    @TableId(type = IdType.AUTO)
    @DbColumn
    private Long id;                 // 版本 ID，每次编辑自增

    @DbColumn(nullable = false)
    private Long pageId;             // 所属页面

    @DbColumn(type = DbType.LONGTEXT)
    private String content;

    @DbColumn
    private Long userId;

    @DbColumn(length = 500)
    private String comment;          // 编辑摘要

    @DbColumn(nullable = false)
    private LocalDateTime createAt;
}
```

页面与历史版本（MediaWiki 式 page/revision 两表）：

- `wiki_page` 存页面身份，`id` 自增即页面 ID；`wiki_revision` 存每次编辑的正文/编辑者/摘要/时间；
- 路由：`/wiki/标题` 阅读（`#REDIRECT` 页自动跳转，`?redirect=no` 可看重定向页本身）、
  `?action=edit` 编辑（未登录先跳登录页，页面不存在则创建）、
  `?action=history` 历史（页面还不存在时同样 404，自定义 404 页里可点「创建本页面」）、`?oldid=N` 查看指定旧版本；
- 根路径 `/` **按界面语言重定向到主页面**：消息键 `mainPage`（中文「首页」/ 英文「Main Page」）；
  该语言的首页还没创建时回退到默认「首页」，避免 `/` 直接 404（`WikiPageController#mainPageTitle`）；
- 历史页每行支持 **查看 / 编辑**：`?action=edit&oldid=N` 以旧版本内容打开编辑器，
  保存后生成新版本（想回退到旧版就直接编辑旧版再保存，历史不丢）；
- **差异对比页**（仿 MediaWiki 的 DifferenceEngine）：
  - 参数：`?diff=prev&oldid=N`（N 与上一版本）、`?diff=next&oldid=N`（N 与下一版本）、
    `?diff=N&oldid=M`（M → N）、`?diff=cur&oldid=N`（N 与当前版本）、`?diff=N`（旧侧取 N 的上一版本）；
  - 两栏 diff（− 黄色删除行 / + 蓝色新增行，替换行内的改动段**加粗**，仿 `.diffchange`）、
    版本头（修订号链接 / 用户 / 时间 / 摘要）与「上一差异 / 下一差异」导航；第一版提示「（这是最早的版本）」、
    无变化显示「没有差异。」；内容过大时自动退化为「公共前缀后缀 + 全删全增」，保证能打开；
  - 入口：历史页每行的「差异（prev）/ 当前（cur）」、最近更改与用户贡献的「差异」、旧版本阅读页的
    「与当前版本的差异」；
- **编辑草稿保护**（`static/js/edit-draft.js`，本地 localStorage，不上传服务器）：
  - 键 `tempedit-cache-<页面标题>`，值为 JSON `{v, t, base, text}`（`text` 原样存，无需 base64）；
  - 输入停顿 5 秒自动保存，提示条显示「草稿已自动保存到本地（保存于 …）」；
    关闭 / 刷新 / 切后台前也会落盘，并在仍有未保存修改时触发浏览器自带的离开确认
    （必须确认才会关闭，文案由浏览器决定）；保存成功自动清除草稿；
  - 提示条（含「放弃草稿」按钮）**只在确实存在草稿时显示**：放弃草稿或把内容改回页面当前版本后立即隐藏；
  - 下次打开同一页面自动恢复草稿并提示保存时间；
  - **冲突检测**（A 编辑一半离开、B 已提交的场景）：草稿记录当时的修订号；再次打开时若修订号已变化
    （或内容哈希不匹配），会明确提示「该页面在您离开后被修改过（版本 N → M），直接保存会覆盖对方的修改」，
    并提供「查看最新版本」链接与「放弃草稿」按钮；
    提示条上的「放弃草稿」可一键恢复到页面当前内容；
- **段落编辑**（仿 MediaWiki 的 section 编辑）：
  - 可编辑的人会在每个标题旁看到 `[编辑]`（`SectionEditLinks` + `WikiSections`；没编辑权限时不显示，旧版本视图也没有）；
  - `?action=edit&section=N` 的编辑框里**只有该段**（标题行 + 正文，含子标题），摘要自动填 `/* 标题 */ `；
  - 保存时只把该段替换进**最新版本**：别人在其他段落的修改原样保留；该段在你编辑期间被改过
    （服务端比对 `baserevid` 的该段文本）则进入**编辑冲突提示**页（你的文本保留、附差异对照），
    手动合并后再次保存即可（基准已更新为最新，不会循环冲突）；
  - 保存后跳回该段锚点（`#标题`）；页面结构已变、段落不存在时进入冲突提示页；
  - 段落编辑的草稿单独存档：`tempedit-cache-<页面标题>@s<段落号>`（不会覆盖整页草稿）；
- **整页编辑冲突提示**（仿 MediaWiki 的编辑冲突页，服务端检测，非自动合并）：
  - 提交时基准修订 `baserevid` 已被他人推进 → 不写入、不自动合并，返回**编辑冲突提示**页；
  - 提示页展示：修改者 / 时间 / 对方编辑摘要、**你的提交 ↔ 服务器最新版本**的行级差异（`diffchange` 高亮）、
    「查看当前版本」「查看对方这次修改的差异」「放弃我的修改，编辑最新版本」链接；
  - 你的文本完整保留在编辑框中；手动合并后保存会用编辑框内容生成新版本（保存基准自动更新为最新），
    保存瞬间再次被改写（并发）时仍会回到提示页；
  - Action API 不受影响：`edit` 的过期 `baserevid` 返回 `editconflict` 错误；
- **编辑辅助工具栏**（仿 MediaWiki WikiEditor 默认皮肤，`edit-toolbar.js`，仅 Wikitext 编辑页 / 段落编辑显示）：
  - 插入：粗体（Ctrl+B）、斜体（Ctrl+I）、内部 / 外部链接、参考文献 `<ref></ref>`、签名 `--~~~~`、
    标题（2–5 级下拉，带标题行的菜单）、无序 / 有序列表（对选中行再点一次取消）、缩进、忽略 wiki 格式、
    水平线、**大号 `<big>` / 小号 `<small>` / 上标 `<sup>` / 下标 `<sub>`**；
  - **插入表格**：点表格按钮打开**对话框**（行数 / 列数 / 表头（无 / 首行 / 首列 / 首行和首列）/
    表格标题（可选）/ 是否套用 `wikitable`），确认后按 MediaWiki 风格生成 `{| class="wikitable" … |}` 源码；
  - **语法高亮开关**（工具栏右侧「语法高亮」按钮）：开 = 编辑框换成 CodeMirror（**wikitext 模式**，
    自带一份轻量高亮：标题 / 粗斜体 / 内链外链 / 模板 / 表格 / 注释 / nowiki 等），关 = 回到普通编辑框；
    开关状态记在浏览器 `localStorage`（`wikitext-highlight`），插入 / 快捷键等工具栏操作在两种模式下都可用
    （CodeMirror 激活时工具栏走 `window.wikiCodeEditor` 桥接改写内容）；
  - **特殊字符**面板：破折号、数学符号、箭头、中文标点等，点一下插入一个，可连续插入；
  - **快速上传图片**：文件按钮打开弹窗 → 「选择文件」是普通按钮样式（`::file-selector-button`）→
    选中后**立即显示缩略图预览 + 文件名** → 上传到 `/api/files/upload` → 自动在光标处插入
    `[[文件:名称|thumb]]`（光标停在 `]]` 前，方便补说明）；未登录 / 无上传权限时显示服务端提示；
    **装了 `multi-upload` 插件后**：弹窗可一次选择多张批量插入，并且**可以直接把文件拖进编辑器**
    （拖入时出现虚框 + 「松开即可上传并插入到正文」提示，上传完成自动插入链接）；
  - 所有插入都会触发 `input` 事件，草稿保护（`edit-draft.js`）随之自动保存；
  - 工具栏的样式（32px 扁平按钮、菜单、对话框、文件选择按钮、预览）都写在 **core 的 `base.css`**，
    所有皮肤一致；皮肤只做自己的点缀（颜色 / 圆角变量）；
  - 代码页（`.js` / `.css` / 微件页）不显示工具栏，继续用 CodeMirror 编辑器；
- **编辑预览**（仿 MediaWiki「显示预览」，`edit-preview.js`，仅 Wikitext 编辑页 / 段落编辑）：
  点「显示预览」→ `POST /api/pages/preview` 服务端渲染编辑框当前内容（**不落盘**），
  预览区出现在编辑框上方，顶部提示「请记住，这只是预览。您的更改还没有保存！」；
  正文按阅读视图渲染（目录折叠、脚注、分类栏、模板 / 微件等都在）；未登录 401、无编辑 / 创建权限 403；
  代码页与「查看源代码」页没有预览按钮；
- **可视化编辑器**（`visual-editor.js` + `/api/pages/visual/*`，仿 MediaWiki 的入口与 URL 参数）：
  - 可编辑的 Wikitext 页面在页签栏显示两个入口：**「编辑」**（可视化，`?veaction=edit`）与
    **「编辑源代码」**（`?action=edit`）；不可编辑时仍显示「查看源代码」；
  - `?veaction=edit` 页面加载即打开可视化编辑；`?veaction=editsource` 与不可用场景
    （代码页 / 无编辑权限等）会像 MediaWiki 一样**回退到源代码编辑**；
    切换模式时地址栏同步（可视化 = `veaction=edit`，源代码 = `action=edit`）；
  - **只从编辑框里的 Wikitext 出发**渲染（不是已保存页面的渲染结果）；服务端先分词再渲染，
    **目录 / 分类栏等「后生成」内容会被剥掉，绝不会进入编辑器或回写**；
  - **模板**：
    - **独占段落的模板直接渲染成预览**（块内就是它的渲染结果，顶部一条「模板：名字」小标签）；
    - 点击任意模板打开**模板对话框**：**参数**页签是参数表单——参数由服务端**扫描模板页源码里的
      三花括号参数**自动发现（数字名是位置参数），对话框里可增删参数、看实时预览
      （`POST /api/pages/visual/template`）；参数值里的 `|` 会转义成 `{{!}}`，留空参数不写入；
    - **源代码**页签可直接改整个 `{{…}}` 调用；「应用更改」把新调用写回编辑器（块内预览同步刷新），
      最终仍由序列化统一回写，未点「应用更改到源代码」前不会动源码；
    - 行内模板（文字中间）显示为「模板：名字」小方块，预览与参数在对话框里看；模板页不存在时对话框给出提示；
  - 引用 / 文件 / 分类 / 复杂表格 / `<pre>` / `<nowiki>` 等显示为不可编辑的**源码块**，
    点击弹窗编辑源码（不再用简陋的输入框），这些内容在可视化编辑中不会被改写或丢失；
  - 支持可视编辑：段落、标题、粗体 / 斜体、内链 / 外链、无序 / 有序 / 缩进列表、水平线、`<br>`、简单表格；
  - 工具栏：粗体 / 斜体 / 内链 / 二三级标题 / 列表 / 水平线与「应用更改到源代码」「返回源代码编辑」；
    粘贴只接受纯文本（不会把渲染结果或外部 HTML 带进内容）；
  - 「应用更改」`POST /api/pages/visual/serialize` 安全序列化回 Wikitext：遇到不支持的结构**整体拒绝**
    （绝不写回半成品），仍可用源代码编辑；应用后请检查源代码再保存（不会自动保存）；
  - 行尾会统一为 `\n`（与渲染一致），未编辑的内容不会产生额外改写；
- 标题里的 `/` 表示子页面（如 `首页/样式.css`），路由支持多段路径（`{*rest}`），
  URL 由 `WikiUrls` 逐段编码，不会产生会被 Tomcat 拒绝的 `%2F`；
- 旧版「正文存在 `wiki_page.content`」的库启动时会自动迁移（`LegacyWikiPageMigration`）：
  为每个页面生成初始版本，并移除旧的 `pageIdentifier` / `content` / `user_id` 列（幂等，可重复启动）。

Java 类型默认推断：`String` → `VARCHAR(255)`（length > 4000 时 `TEXT`）、`Long` → `BIGINT`、
`LocalDateTime` → MySQL `DATETIME(3)` / H2 `TIMESTAMP` / SQLite `TEXT`、`LocalDate` → `DATE` / `TEXT`、
`Boolean` → `TINYINT(1)` / `BOOLEAN`、`BigDecimal` → `DECIMAL(19,4)`、`byte[]` → `BLOB`；
不满足时用 `@DbColumn(type = DbType.XXX, length / precision / scale / nullable / defaultValue / unique)` 覆盖；
`type` 是枚举 `DbType`（`AUTO`/`VARCHAR`/`TEXT`/`LONGTEXT`/`INT`/`BIGINT`/`BOOLEAN`/`DECIMAL`/`DATE`/`DATETIME`/`TIME`/`BLOB`…），
`DECIMAL` 可用 `precision` / `scale`（默认 `19,4`）。需要新类型时在 `DbType` 加枚举值、Auto-DDL 补一行映射。

主键三种写法（Auto-DDL 都支持）：

| 写法 | id 类型 | 说明 |
| --- | --- | --- |
| `@TableId(type = IdType.ASSIGN_ID)` | `Long` | 雪花 ID，应用生成、跨库通用 |
| `@TableId(type = IdType.ASSIGN_UUID)` | `String` | 32 位 UUID，应用生成 |
| `@TableId(type = IdType.AUTO)` | `Long` / `Integer` | 数据库自增：MySQL `AUTO_INCREMENT`、H2 `IDENTITY`、SQLite `INTEGER PRIMARY KEY AUTOINCREMENT` |

注意：`IdType.AUTO` 必须是数值类型；Auto-DDL 只在新表时生成自增语法，已有表不会修改
（若旧表主键不是自增列，启动时会打警告，需删库重建或手动 ALTER）；跨库导入数据时注意主键冲突。

长文本约定：

- 普通长文：`@DbColumn(type = DbType.TEXT)`；
- **正文这类不限长的：`@DbColumn(type = DbType.LONGTEXT)`**，Auto-DDL 按方言翻译为
  MySQL `LONGTEXT` / H2 `CLOB` / SQLite `TEXT`；注意 MySQL 的 `TEXT` 只有 64KB，长词条必须用 `LONGTEXT`；
- `Instant` / `java.util.Date` 在 SQLite JDBC 驱动下不可用（读写会抛异常），请改用 `LocalDateTime` 或 `Long`。

### 从 SQLite 转换工具直接导入 MariaDB

转换工具通常会把 SQLite 的 `TEXT` 日期列原样映射成 MySQL / MariaDB 的 `LONGTEXT`
（SQLSwitch 默认就是这样；`--infer-dates` 也不会处理带 `T` 和纳秒的 ISO 字符串）。
直接把这份 DDL 导入 MariaDB 后，时间列不是 `DATETIME`，MariaDB JDBC 在
`getObject(..., LocalDateTime.class)` 时会报
`value '2026-…T…' (BLOB) cannot be decoded as ZoneDateTime`。

WikiKernel 的 MyBatis 层已注册兼容读取器（`LenientLocalDateTimeTypeHandler`），能读取
`TEXT / LONGTEXT / BLOB` 里的 ISO 时间，并兼容空格分隔、最多 9 位小数和带时区的时间，
所以这类库可以启动；但仍是文本列，时间比较 / 排序和索引不如原生 `DATETIME(3)`。

正式迁移建议（与多数据库测试环境的结论一致）：**先建空 MariaDB，让 WikiKernel 的 Auto-DDL
按实体创建 schema，再单独导入数据**；不要直接把 SQLite 的建表语句改成 MariaDB 后整库恢复。
如果已经导入了旧 DDL，可在确认备份后把时间列规范化为 `DATETIME(3)`；主要时间列是
`create_at` / `created_at` / `update_at` / `updated_at` / `expires_at` / `deleted_at` /
`read_at` / `time` 等，转换前先把值里的 `T` 换成空格。

JSON 时间格式：core 已全局配置 `LocalDateTime` 的输出/解析格式为 `yyyy-MM-dd HH:mm:ss`
（见 `core` 的 `JacksonTimeConfig`，基于 Boot 4 + Jackson 3 的 `JsonMapperBuilderCustomizer`）；
只影响接口 JSON，不影响数据库存储。单个字段想用别的格式，可在实体字段上加 `@JsonFormat` 覆盖
（实体在 `common`，需要在 common 引入 Jackson 注解依赖）。

开关：`wikikernel.database.auto-ddl: false`（`LocalSettings.yaml`）可关闭自动 DDL。

边界说明：

- 已有表**不会**补唯一索引、改类型、删列（与 JPA `update` 一样保守）；
- 插件里的 Mapper 暂不支持（`@MapperScan` 只扫描 core 包）；插件访问数据库建议注入 core 的 `DataSource` / `JdbcClient`。
