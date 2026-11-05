---
title: "Wikitext 与模板"
description: "Wikitext 与模板"
---

# Wikitext 与模板

正文可使用链接、列表、表格、模板和分类。以下说明核心语法；扩展标签见文末的插件链接。

## Wikitext 渲染与模板系统

页面正文按 MediaWiki 风格渲染（`core` 的 `WikitextRenderer`）：

- **模板**：`{{abc模板|a=1|b=2}}`（命名参数）、`{{abc模板|第一个}}`（位置参数）、
  `{{{a|默认值}}}`（参数默认值）；模板就是普通页面，标题用 `模板:` 命名空间（可配置为 `Template:` 等）；
  支持 `<noinclude>` / `<includeonly>` / `<onlyinclude>`，带递归深度与循环保护；
- **解析器函数**：`#if` / `#ifeq` / `#switch`；魔术字 `{{PAGENAME}}` / `{{FULLPAGENAME}}` / `{{SUBPAGENAME}}` /
  `{{BASEPAGENAME}}` / `{{ROOTPAGENAME}}` / `{{NAMESPACE}}` / `{{NAMESPACEE}}` / `{{PAGENAMEE}}` / `{{FULLPAGENAMEE}}` /
  `{{!}}` 与时间类 `{{CURRENTYEAR}}` / `{{CURRENTMONTH}}` / `{{CURRENTMONTH1}}` / `{{CURRENTMONTHNAME}}` /
  `{{CURRENTDAY}}` / `{{CURRENTDAY2}}` / `{{CURRENTDOW}}` / `{{CURRENTTIME}}` / `{{CURRENTHOUR}}` / `{{CURRENTMINUTE}}` /
  `{{CURRENTWEEK}}` / `{{CURRENTTIMESTAMP}}`（`NAMESPACE` 不含冒号，与 MediaWiki 一致）；
  统计类 `{{NUMBEROFPAGES}}` / `{{NUMBEROFARTICLES}}` / `{{NUMBEROFEDITS}}` / `{{NUMBEROFFILES}}` /
  `{{NUMBEROFUSERS}}` / `{{NUMBEROFADMINS}}`（30 秒缓存）；`{{DISPLAYTITLE:标题}}` 改写页面显示标题（从正文剥离）；
- **块级**：`== 标题 ==`、`----`、`*` / `#` 列表、`{| 表格 |}`、`<pre>`、`<nowiki>`、
  `<syntaxhighlight lang="java">` / `<source lang="java">`（**服务端语法高亮**：java / kotlin / js / ts / css / json / xml / python / bash / sql / properties / lua，见下）、
  `<poem>`（Poem 扩展：保留换行、内部支持行内 wikitext）、`<inputbox>`（InputBox 扩展：创建 / 搜索表单，见下）；
- **目录（TOC）**（仿 MediaWiki）：`== X ==` / `=== X ===` / `==== X ====` 生成带锚点的标题；
  **标题 ≥4 个**时自动在第一个标题前插入**竖排编号目录**（1 / 1.1 / 1.1.1…，带 `[隐藏] / [显示]` 折叠）；
  `__TOC__` / `__FORCETOC__` 强制显示、`__NOTOC__` 关闭、`__NOEDITSECTION__` 隐藏段落编辑链接（魔术字会从正文剥离）；
  重复标题锚点自动加 `_2` / `_3`，中文标题可直接作为 `#锚点`；
- **脚注 / 引用**（仿 MediaWiki Cite 扩展）：
  - `<ref>来源</ref>` 在正文显示为上标 `[1]`，`<references/>`（也支持 `<reference/>` 单数写法与
    `<references>…</references>`）处生成脚注列表；列表只在 `<references/>` 的位置出现；
  - `<ref name="x">来源</ref>` 具名，之后 `<ref name="x"/>` 复用同一编号，支持**先使用后定义**，列表带 `↑` 回链；
  - `<ref/>` 无名称复用、名称未定义 / 重复定义（内容不同）/ 空引用都会显示红色本地化的「引用错误」；
  - 脚注内容照常解析行内语法（链接、粗斜体、模板已展开）；`<nowiki>` 与 `<pre>` 里的 `<ref>` 不解析；
  - 标题里的脚注不会污染锚点与目录文本；
- **行内**：`'''粗体'''`、`''斜体''`、`[[页面|文字]]`、`[https://example.com 外链]`；
  **未知页面红链**（仿 MediaWiki）：`[[目标]]` 的目标页面不存在（或已删除 / 已隐藏）时输出
  `<a class="new">`（红色，`a.new { color: #ba0000 }`）；`特殊:` / `Special:` 链接与页内锚点 `[[#章节]]` 不标红；
  正文、模板展开、行内预览、`action=parse`、Lua / 微件输出等所有走渲染器的路径统一生效；
- **子页面相对链接**：`[[/子页]]` 解析为「当前页/子页」；`[[../兄弟]]` 向上一级，
  `[[./子页]]` 与 `[[/子页]]` 等价；支持 `#章节` 锚点。链入页面、待撰页面、最多链接、断链报告、
  页面信息、重定向解析等使用同一套规则，不再把 `/子页` 当成根命名空间下的页面；
- **内嵌 HTML**：经白名单过滤（含 `<br>`、`<hr>`、`<iframe>`）；事件属性与 `javascript:` 被拒绝，未知标签按纯文本转义；
- 渲染完成后依次执行插件的 `PageRenderHook` 扩展点。

```yaml
wikikernel:
  wikitext:
    template-prefixes: [ "模板:", "Template:" ]
    max-template-depth: 20
```

支持范围以本文及对应插件说明为准；复杂模板移植后需要检查渲染结果。

## Lua 模块（{{#invoke:}}，Scribunto MVP 子集）

仿 MediaWiki Scribunto 的核心用法：**模块是「模块:」命名空间页面的 Lua 代码**，在任意页面用
`{{#invoke:模块名|函数名|参数…}}` 调用；返回的文本会**继续按 Wikitext 解析**（模板、魔术字、内链都生效）。

模块写法（和 Scribunto 一致）：

```lua
local p = {}

function p.问候(frame)
    return "你好，" .. frame.args[1] .. "！"
end

return p
```

- **入口**：`{{#invoke:问候|问候|世界}}`（模块名可用「模块:」/「Module:」前缀，也可省略）；
  参数里的 `{{{模板参数}}}` 会先按模板参数展开，之后才交给模块；
- **参数**：位置参数**保留首尾空白**、命名参数去首尾空白（与 Scribunto 相同）；
  `frame.args`（位置 1..n + 命名键）、`frame:getParent()`（调用方模板的参数，直接调用时为 nil）、
  `frame:getTitle()`；
- **mw 库**：
  - `mw.text`：`plain`（去 HTML 标签并解码实体）、`trim`、`upper`、`lower`、`len`、`sub`、`format`（同 `string.format`；已修正 LuaJ 忽略 `%.2f` 精度与浮点宽度的问题）；
  - `mw.title`：`new(name)` / `getCurrentTitle()`，返回含 `fullText` / `text` / `nsText` / `namespace` / `fragment` 的对象；
  - `mw.uri`：`encode`（空格 → `%20`）/ `decode`（只解 `%XX`，不把 `+` 当空格）；
  - `mw.html`：Scribunto 的 HTML 构建器（`create / addClass / attr / css / cssText / node / wikitext /
    newline / tag / done / allDone`，`tostring(builder)` 输出 HTML；空元素输出 `<br />` 形式）；
  - `mw.loadData`：读取**数据模块**（只允许字符串 / 数字 / 布尔 / 子表，禁止函数与循环引用），
    按模块修订号缓存；
  - `mw.site`：`siteName` / `currentVersion` / `server` / `scriptPath` / `articlePath`、
    `stats`（pages / articles / edits / files / images / users / admins，30 秒缓存）、
    `namespaces`（id → `{ id, name, canonicalName }`）；
  - `mw.message`：`new(key, ...)`（按本站消息键取值，参数用 `{0}` 占位）/ `newRawMessage(text, ...)`
    （原始消息，`$1` 占位）；消息对象有 `params / text / plain / exists / isBlank`；
  - `mw.getCurrentFrame`、`mw.log`（占位，不产生噪声）；
- **Lua 5.1 兼容层**：`unpack` / `table.getn` / `table.maxn`（Scribunto 用 5.1；不提供
  `setfenv` / `getfenv` / `loadstring`，与沙盒策略一致）；
- **沙盒与安全**：没有 `os` / `io` / `package` / `require` / `dofile` / `loadfile` / `load*` /
  `print` / `debug` / `luajava`；单次调用有**指令数上限**，死循环（哪怕包在 `pcall` 里）
  也会以「运行超时」错误终止，不会卡住页面；
- **缓存与模块依赖追踪**：编译结果按模块修订号缓存（上限 64 个模块），编辑模块后下次渲染立即生效；
  `mw.loadData` 加载的数据模块会记入**依赖**（含链式：数据模块再 loadData 的数据也会被追踪），
  任一依赖的修订号变化 → 自动重新加载，不会读到过期数据；
- **编辑**：模块页按**代码页**处理（CodeMirror Lua 高亮 + 只读预览、无可视化编辑面板），保存即生效；
- **错误**：找不到模块 / 没有该函数 / 返回值不是字符串或数字 / 数据模块不合法 / 运行出错 →
  显示本地化红字错误，页面其余内容照常渲染；语法错误在渲染时会给出模块名与行号
  （例如 `模块:演示Lua:4: '<name>' expected`）；
- **注意**：Lua 标识符只支持 ASCII（与标准 Lua / Scribunto 一致），函数名不要用中文，例如
  `function p.add(frame)`；**中文键名**要写成字符串形式：`data['数值']`（不能写 `data.数值`）。
- **示例词条（可直接打开对照）**：**`Lua扩展演示页`** —— `模块:演示/水果卡`（mw.html 构建表格 +
  mw.loadData 读数据 + mw.site 取站点信息 + mw.message 参数替换 + Lua 5.1 的 unpack / table.getn）
  + `模板:Lua扩展卡片`（模板包装）+ `模块:演示/站内消息`；
  编辑 `模块:演示/水果数据` 后刷新该页可以看到依赖追踪即时生效。
- **测试**：`LuaModuleTest` / `LuaExtensionTest`（mw.html / loadData 依赖 / mw.site / mw.message /
  5.1 shim / 复杂组合页面）；解析器类功能的测试都按「复杂组合页面」规格写。

## 条目重定向（#REDIRECT）

- **语法**（仿 MediaWiki）：页面正文以 `#REDIRECT [[目标]]` 或 `#重定向 [[目标]]` 开头即视为重定向页；
  大小写不敏感、冒号可省略，支持 `[[目标|显示文字]]`；相对目标 `[[/子页]]` / `[[../兄弟]]` 按当前页面解析
  （`WikiRedirect` 解析）；
- **跳转**：访问重定向页会 302 到目标（URL 带 `?redirectfrom=来源`，目标页标题下显示「重定向自 X」，
  点击可带 `?redirect=no` 查看重定向页本身，便于编辑）；
- **链与循环**：服务端解析多级重定向（最多 5 跳，一次跳到底）；检测到循环或链过长时按普通页面渲染，不会死循环；
  目标不存在时照常跳到目标（落地为自定义 404 页）；
- **移动页面**：勾选「留下重定向」后旧标题自动生成 `#REDIRECT`（见上一节），因此移动后旧链接依然可用。

## 分类（分类:X）与模板反查

### 分类

- **语法**（仿 MediaWiki）：正文任意位置写 `[[分类:X]]` 或 `[[分类:X|排序键]]`（`Category:X` 别名等价）；
  分类链接**不再内联显示**，页面底部显示分类栏（`分类 甲 乙 …`，说明页不存在时为红链）；
  分类栏位于**内容容器最底部**（内容框纵向 flex + 撑开块：短页面贴底、长页面与正文保持 1em 间距）；
  文件页的分类栏在「文件历史」之后，与 MediaWiki 一致；
  `[[:分类:X]]`（前导冒号）只是普通链接，不归类；
- **分类页** `分类:X`（`Category:X` 会 302 到规范名）：
  - 顶部是可选**分类说明**（`分类:X` 页面本身的正文，可直接编辑；不存在时提示创建）；
  - 「子分类」列出归入本分类的分类页；「页面」列出成员，按 **排序键 → 标题** 排序并显示排序键；
- **模板里的分类也生效**：页面保存时按“模板展开后的渲染结果”重建索引
  （表 `wiki_page_category`，类 MediaWiki 的 categorylinks）；模板页修改后会自动重建使用它的页面；
  服务启动时全量重建一次（旧数据、模板改动都能对齐）；
- `特殊:分类列表` / `Special:Categories`：全部分类与成员数。

### 模板反查（哪些页面用了什么模板 / 模板被谁用）

- **正查**：`特殊:页面信息?page=某页`（或页面上的 `?action=info`）显示「使用的模板（N）：模板:A、模板:B…」与「所属分类」；
- **反查**：`特殊:链入页面?page=模板:X`（模板页工具的「链入页面」）把链入与嵌入合并成一个列表，
  使用模板的页面带「**（嵌入）**」标记——`{{X}}`、`{{模板:X}}`、`{{Template:X}}` 都能匹配；
- **模板使用索引**（表 `wiki_page_template`，类 MediaWiki 的 templatelinks）：
  - **实时维护**：页面保存 / 删除时通过 `WikiPageChangedEvent` → `PageTemplateEventListener` 同步重建该页的索引行；
  - **启动回填**：服务启动时全量重建一次（`@Order(5)`，上限 2000 页，覆盖旧数据 / 索引表刚创建的情况）；
  - **查询时仍做实时扫描**：`PageTemplateService.pagesUsing` 先用索引找候选页面，
    再核对每个候选页面的**最新可见版本正文**——索引里的过期行不会出现在结果里；
  - 模板调用是**源码级直接使用**（不做模板展开，模板套模板不会把外层页算进来）；
  - `PageLinkService.pagesTranscluding` 已改为走该索引（`特殊:链入页面`、模板改动后重建依赖分类都用它）；
- 实现：`WikiLinkScanner` 解析 `{{...}}`（跳过 `{{{参数}}}`、`#解析器函数` 与魔术字）并规范化标题；
  反查键 `templateIndexKeys` 会把查询标题展开成 `模板:X / X / Template:X` 等候选，覆盖各种写法。

## 扩展语法

[数学公式](/docs/plugins/math)、[时间轴](/docs/plugins/easy-timeline)、[图形](/docs/plugins/graph)、[微件](/docs/plugins/widget)和 [Gadgets](/docs/plugins/gadgets)各有独立说明。引用、评论等功能是否可用，取决于对应插件是否安装和启用。
