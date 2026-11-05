# 系统配置页与页面身份保护

## 系统配置页

WikiKernel 的系统配置入口使用 `WikiKernel:`。已有 Sidebar、Common.css / Common.js、皮肤专用 CSS / JS、Footer-Left / Footer-Right、404 和标题 / 邮箱黑白名单。

本次补齐：

| 页面 | 功能 |
| --- | --- |
| `WikiKernel:Sitenotice` | 标题上方的站点公告 |
| `WikiKernel:Anonnotice` | 匿名用户公告，未定义 / 空白 / `-` 时回退 Sitenotice |
| `WikiKernel:Tagline` | 标题下方的站点副标题 |
| `WikiKernel:Editnotice` | 编辑页通用提示 |
| `WikiKernel:Editnotice-0` | 主命名空间编辑提示 |
| `WikiKernel:Editnotice-10` | 模板命名空间编辑提示；其他编号同 API / 导出命名空间编号 |

支持 wikitext、模板和链接，经过既有渲染与权限检查。语言覆盖可写 `/en`、`/zh-cn` 等后缀。
配置页留空或仅写 `-` 可关闭；未创建 WikiKernel 配置时，新功能兼容相应 `MediaWiki:` 同名页。
不自动建立这些页面，以免覆盖已有导入配置。`MediaWiki:` 配置页默认也只有管理员可写。

没有合并命名空间或迁移页面：WikiKernel 仍为 4 / 5，MediaWiki 为 8 / 9；修复 API 和 XML 导出中漏报 8 / 9 的问题。

参考：[MediaWiki Sitenotice 规则](https://www.mediawiki.org/wiki/Manual:Interface/Sitenotice)。

## 按身份保护页面

在“特殊:保护页面”加载词条后，可以独立设置“允许查看的身份”和“允许编辑的身份”。

- 选择管理员：仅管理员可执行该项操作。
- 可选择站点已有的自定义用户组，多选时属于任一组即可。
- “所有人”表示该项权限公开，编辑操作仍受登录 / 封禁等原有检查约束。
- “继承站点 / 命名空间规则”删除该页面的精确规则，回退上级规则。
- “不允许任何身份”对应显式拒绝；拥有保护权限的人仍可进入保护设置恢复。

阅读规则作用于页面、接口及嵌入内容，不是只隐藏界面按钮。两项规则一起提交，事务成功后才刷新共享权限缓存。
旧 `/api/pages/protect` 的 `protected=true|false` 请求仍兼容；新表单提交 `readGroups` 和 `editGroups` 的重复参数。

插件生成、尚无正文记录的页面（例如“线下活动速查表”）也可按标题保存上述两项规则，不会创建空白词条或修订；以后创建同名词条仍沿用规则。旧布尔保护接口仍要求已存在的词条。

## 页面 CSS / JS

`线下活动速查表/Common.css` 和 `线下活动速查表/Common.js` 可分别为该页面加载自定义样式和脚本，父页面不需要存在正文记录。其他 `.css` / `.js` 子页面同样支持；标题中的下划线与空格等价。

CSS 在皮肤、插件的默认样式之后注入；JS 使用 `?action=raw&ctype=text/javascript` 外部脚本地址并延迟执行。页面脚本的编辑沿用既有接口管理员权限。

页面操作标签使用 ID：隐藏编辑和历史入口应写 `#ca-edit, #ca-history { display: none; }`，而不是 `.ca-edit`、`.ca-history`。隐藏按钮不替代保护权限。
