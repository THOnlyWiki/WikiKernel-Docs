---
title: "模板参数说明"
sidebar_label: "模板参数说明"
description: "保存和查询模板参数说明，为编辑工具提供模板元数据。"
---

# 模板参数说明

保存和查询模板参数说明，为编辑工具提供模板元数据。

## 功能范围

### 1.1 `<templatedata>` 解析标签

```wikitext
<templatedata>
{
  "description": "向讨论页签名",
  "params": {
    "1": { "label": "用户名", "type": "wiki-user-name", "required": true },
    "2": { "label": "日期", "type": "date", "suggested": true, "aliases": ["时间"] }
  },
  "format": "inline"
}
</templatedata>
```

1. 标签内容是**原始 JSON**、不参与模板展开（`ParserTag#expandBody() == false`，core 会整段保护）。
2. 解析 → 校验（`TemplateDataValidator` 的全部规则）→ 规范化（`TemplateDataNormalizer`）。
3. 校验失败：输出错误框，**不写页面属性**：

   ```html
   <div class="errorbox"><p>属性“params”的类型应为“object”。</p></div>
   ```

   错误消息只用 `TemplateDataStatus` 的 code（`templatedata-invalid-*`）+ 参数，本地化后显示。
4. 校验通过：
   - `WikiRenderContext#setProperty("templatedata", 规范JSON)` —— core 会在页面保存 /
     重新解析时把它持久化到页面属性表（等价于 MediaWiki 的 `page_props`），`action=templatedata` 读的就是它；
   - 返回模板文档表格 HTML（`TemplateDataHtmlFormatter`），CSS 类名沿用
     `mw-templatedata-doc-*` / `mw-templatedata-*`；
   - 子页面 `/文档`、`/doc` **不写**属性（对齐原版 T54448：文档子页面不应作为模板出现在 API 里）。
5. 语言：界面消息内置 `zh` / `en` 两套（`TemplateDataMessages`），按
   `Locale.getDefault().getLanguage()` 选择，主语言是 `zh` 用中文、其余用英文，中文表缺键回落英文。
   文档表格里的描述 / 标签 / 默认值 / 示例值按同一语言解析（接口文本对象）。

### 1.2 `action=templatedata` API

```
/api.php?action=templatedata&titles=模板:问候|模板:不存在&includeMissingTitles=1&lang=zh
```

```json
{
  "pages": {
    "1":    { "title": "模板:问候", "description": "打招呼", "params": { "1": { "type": "unknown", ... } },
              "sets": [], "format": null, "maps": {} },
    "-1":   { "title": "模板:不存在", "missing": true },
    "2":    { "title": "模板:无数据", "notemplatedata": true, "params": { "foo": {}, "1": {} } }
  }
}
```

- 参数：`titles`（`|` 分隔）、`includeMissingTitles`、`doNotIgnoreMissingTitles`（原版废弃别名）、
  `lang`（接口文本取该语言；缺省返回完整的多语言对象）。
- 默认只返回「存在且有 templatedata」的页面；打开 `includeMissingTitles` 后：
  - 页面不存在 → `"missing": true`（键是 `-1`、`-2`… 的缺失序号）；
  - 页面存在但没有 templatedata → `"notemplatedata": true` + 从正文里按**原版正则**
    `{{{+([^\n#={|}]*?)([<|]|}}})` 提取的参数名（先去掉注释 / `<nowiki>` / `<pre>`，
    参数名按 `[-_ ]+ → 空格`、去首尾、ASCII 小写归一化后去重，键保留第一次出现的写法）。
- 页面属性里的 JSON 解析失败 → `ActionApiException("templatedata-corrupt", …)`，
  core 会输出 `{"error":{"code":"templatedata-corrupt","info":"页面#7模板数据包含无效数据：…"}}`。
- `formatversion` 由 core 统一序列化（json / jsonfm / xml / jsonp），插件不做特殊处理。


## 配置（`LocalSettings.yaml`）

```yaml
wikikernel:
  plugins:
    settings:
      template-data:
        content-language: zh         # InterfaceText 的键；默认跟随系统语言（zh / en）
        generate-param-order: false  # true = 规范化时自动补 paramOrder（非原版行为，见 3.1）
```


## 未移植的部分（有意省略）

| 原版功能 | 说明 |
| --- | --- |
| 编辑页 TemplateData GUI（`ext.templateDataGenerator.*`、OOUI、`lib/jquery.uls`、ResourceLoader 模块 `ext.templateData` / `ext.templateData.images` / `ext.templateDataGenerator.editTemplatePage*`） | WikiKernel 没有 ResourceLoader / OOUI，也没有对应的编辑页挂载点，`templatedata` 只能手写 JSON。文档表格因此**没有** `编辑模板数据` 链接（原版 `Hooks::onEditPage__showEditForm_initial` + `OutputPageBeforeHTML` 的 `replaceEditLink`） |
| `MultiContentSave` 保存拦截 | 原版保存时若 templatedata 非法会**拒绝保存**并在编辑框旁提示；WikiKernel 没有保存钩子，只在页面渲染时显示错误框（用户仍可保存非法 JSON，页面属性不写） |
| EventLogging（`eventlogging_TemplateDataEditor` / `eventlogging_TemplateDataApi`、`TemplateDataGeneratorUsed` 参数） | 无对应基础设施 |
| `ParserFetchTemplateData` hook | 供 Parsoid / VisualEditor 批量取数据用，WikiKernel 没有该 hook |
| `TemplateDataCompressedBlob`（MySQL gzip 存储）、`templatedata-invalid-length` 长度上限 | 页面属性存明文 JSON，不做压缩；`newFromDatabase` 等同 `parse` |
| `ApiTemplateData` 的 `pageids=` / generator / `redirects` / `normalized` / `batchcomplete` / `limits` | 扩展点只提供 `titles`（`|` 分隔）；重定向页按重定向页本身处理，不跟随 |
| `apiwarn-templatedata-deprecation-format`、`formatversion=1` 的布尔值兼容 hack | core 统一序列化，`formatversion=1` 也输出 JSON 布尔（不会变成空串） |
| 200+ 语言的消息（`i18n/*.json`） | 只内置 zh / en 两套 |
| `maintenance/validateTemplateData.php`、PHPUnit / QUnit / parserTests 套件 | 用 JUnit 5 重写（见第 5 节） |

### 4.1 与任务描述中「规范化」细节的出入（以 REL1_43 源码为准）

- 「参数键 trim」：原版校验器只用 `trim()` 判断参数名是否为空，**不**改写入库的键；
- 「aliases 合并到主参数」：原版不做合并，aliases 一直是主参数上的数组（规范 3.2.6 要求别名不得单独
  出现在 `params` 里，作者应当这么写）；
- 「paramOrder 生成」：原版规范化不生成（见 3.1 节说明），本移植提供默认关闭的开关。

### 4.2 其它已知差异（细节）

- 错误框用 `<div class="errorbox">`（WikiKernel 约定），原版是
  `<div class="mw-message-box-error mw-message-box">`；
- 标签内容是**不展开**的原始 JSON（WikiKernel `ParserTag#expandBody() == false` 的约定，见 common 扩展点注释）：
  JSON 里的 `{{{参数}}}` / `{{模板}}` 不会被替换（原版面对标签内容同样是原始文本，要展开得显式调用
  `Parser::recursiveTagParse`，TemplateData 不这么做），因此 JSON 不会因为参数展开而语法错误；
- 原版文档表格没有单独的「paramOrder 提示」，参数顺序就是 `<tbody>` 里的行顺序；本移植保持一致：
  有 `paramOrder` 时按它排列，没有时按 `params` 的出现顺序；
- 文档表格里**没有** OOUI 图标（`template-format-inline` / `block` / `settings`），格式提示只保留
  `<span class="mw-templatedata-format">`；样式用一小段内联 `<style>`（每个页面渲染只输出一次）代替
  原版的 `ext.templateData` 样式模块，参数多于 1 个时保留 `sortable` 类名但没有 `jquery.tablesorter`；
- API 的 `pages` 顺序按请求里 `titles` 的先后（原版按 `page_props.pp_page` 升序）；
- `notemplatedata` 页面的 `params` 在 PHP 里可能因为「空数组 / 纯数字键」被编码成 JSON 数组，
  本移植始终输出 JSON 对象；
- 原版对非法 `lang` 报 `apierror-invalidlang`，本移植不校验（按给定语言做回退，最差退到 `en` / `null`）；
- `type` 里的 `string/wiki-template-name` 在原版（REL1_43 的 `DEPRECATED_PARAMETER_TYPES`）里**不含**
  该项，因此仍属非法值，本移植保持一致；
- 少数原版会直接抛 PHP `TypeError` 的极端输入（`inherits` / `paramOrder` 元素写成对象等），
  本移植返回 `templatedata-invalid-type` 而不是 500；
- 存库 JSON 保留非 ASCII 原文字符（PHP 的 `json_encode` 会写成 `\uXXXX`），语义完全相同；
- 原版按站点语言（`$wgLanguageCode`）写接口文本的键；本移植取 `content-language` 配置，
  默认跟随 JVM 系统语言（见 `TemplateDataMessages#defaultContentLanguage()`）。

[源码与开发说明](https://github.com/THOnlyWiki/WikiKernel/tree/master/plugin/template-data)
