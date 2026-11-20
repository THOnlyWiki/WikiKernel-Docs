---
title: "插件开发"
description: "插件开发"
---

# 插件开发

插件源码位于 `plugin/<id>/`。插件依赖 common 中的接口，不依赖 core 实现；运行时由内核加载独立 JAR。

## 依赖方向

```
            common（共享层：SPI / 扩展点 / 模型）
           ↑               ↑
        core            plugin/*
   （只依赖 common）   （只依赖 common）
```

三条铁律：

1. `common` 不依赖任何项目模块（只带 MyBatis-Plus 注解等编译期依赖），跨插件协作的接口（扩展点）和共享模型都定义在 `common`；
2. `core` 只依赖 `common`，**不依赖具体插件**，插件在运行时由 `PluginManager` 装配；
3. 插件之间不互相依赖，需要协作就通过 `common` 里的扩展点 + `PluginContext.register(...)`。

根目录的 `checkPluginDependencies` 任务会在任何模块执行 `check` / `build` 时自动校验上述规则，
一旦有人写出 `core -> plugin`、`plugin -> core`、`plugin -> plugin` 的依赖，构建直接失败。

## 插件里使用 Spring

插件用 `compileOnly` 引用 Spring Boot，**运行时由 core 提供，插件 jar 不打包 Spring**：

```groovy
dependencies {
    implementation project(':common')
    compileOnly platform("org.springframework.boot:spring-boot-dependencies:${springBootVersion}")
    compileOnly 'org.springframework.boot:spring-boot-starter-webmvc'
}
```

core 会为每个插件创建一个**子 Spring 容器**（父容器是 core 主容器），因此插件的注解全部生效：

| 能力 | 说明 |
| --- | --- |
| `@Component` / `@Service` / `@Repository` | 扫描入口类所在包（含子包）自动注册 |
| `@Configuration` / `@Bean` | 正常处理，可用于插件自己的装配 |
| `@Autowired` / `@Inject` / `@Resource` | 支持构造器/字段/方法注入；**可以注入 core 的 Bean**（如 `DataSource`） |
| `@Value("${...}")` | 可读取 `application.yaml` / 命令行参数等主应用配置 |
| `@ConfigurationProperties` | 正常绑定（core 注册了 Boot 的绑定处理器） |
| `@Controller` / `@RestController` | 由 core 动态注册到主 MVC，可直接对外提供接口，插件停止时自动注销 |

当前仓库未内置示例插件；需要时按文末「新增一个插件」自行添加，上面这些能力在插件实现里直接可用。

约定与边界：

- 插件代码放在**入口类所在包及其子包**下，才会被扫描；入口类本身也会被注册为 Bean；
- 子容器可以访问父容器（core），反过来不行，所以 core 不会 `@Autowired` 插件的 Bean，协作请走扩展点；
- 子容器不跑 Boot 自动配置，`@Scheduled` / `@Async` / 事务等需要插件在自己的 `@Configuration` 上显式 `@EnableScheduling` / `@EnableAsync` / `@EnableTransactionManagement`；
- 不要用 `implementation` 引 Spring，避免插件 jar 打包 Spring 与 core 冲突。

## 新增一个插件

1. 在 `plugin/` 下新建 `plugin/your-plugin/`，最小结构：
   `build.gradle` + `src/main/java/...` + `META-INF/wiki-plugin.properties` + `META-INF/services/...WikiPlugin`；
2. `build.gradle` 用 `plugins { id 'java'; id 'application' }`，依赖只加 `implementation project(':common')`；
   需要 Spring 时按上文用 `compileOnly` 引；
3. 编写 `META-INF/wiki-plugin.properties`（插件 id、入口类）与 `META-INF/services/...WikiPlugin`；
4. 实现 `WikiPlugin`，在 `onStart` 里注册扩展点实现（扩展点接口定义在 `common`）；
5. 需要 Spring 能力时，直接加 `@Service` / `@RestController` 等注解即可；
6. `plugin/` 下任何带 `build.gradle` 的目录都会被 `settings.gradle` 自动纳入构建，无需改根配置；
7. 插件也可以提供**皮肤**：`plugin/plain-skin` 是完整示例（`Skin` SPI + layout + CSS，见「皮肤系统」一节）。

插件 jar 打包要求：

- 不要打包 `common` 和 Spring（用 `implementation project(':common')` + `compileOnly` 时 Gradle 不会打进去）；
- 如果插件引入第三方库，建议用 Shadow / 独立依赖目录等方式处理，避免和 core 的依赖冲突；
- 描述文件按 UTF-8 读取，可直接写中文。

### 插件的包结构（约定，必须遵守）

插件的**入口类必须留在根包**（`META-INF/wiki-plugin.properties` 的 `plugin.mainClass` 与 `META-INF/services/...WikiPlugin` 指向它）；
其余类按职责分包，**main 类 ≥ 6 个就必须分包**（≤ 5 个可以平铺）：

```
cc.thonly.wikikernel.plugin.<id>            入口 XxxPlugin + 只服务入口的 Support / Settings / Messages
cc.thonly.wikikernel.plugin.<id>.hook       所有 common.extension.* 实现（ParserTag / PageDisplayHook / EditGuard /
                                            ActionGuard / RegistrationGuard / HtmlHeadProvider / MessageBundle /
                                            LogType / PreferenceSection / BehaviorSwitch …）
cc.thonly.wikikernel.plugin.<id>.web        @RestController 与 SpecialPage
cc.thonly.wikikernel.plugin.<id>.service    业务逻辑（Service / 渲染器 / 会话编排 / 厂商适配器 / Store 包装 …）
cc.thonly.wikikernel.plugin.<id>.model      record / DTO / 枚举 / 常量表 / 异常（没有就不建）
```

- 包名 `<id>` 用插件目录的小写形式（`wiki-seo` → `wikiseo`、`abuse-filter` → `abusefilter`）；
- 插件子容器扫描的是**入口类所在包及其子包**（`PluginSpringContextFactory.scanPluginPackage`），
  所以 `@Component` / `@Service` / `@RestController` 放子包照样生效；
- 测试类放到与被测类对应的子包，测试替身（Fakes）放测试侧根包或对应子包。

### 本地化（i18n，必须遵守）

**每个模块只负责自己的文案**——多模块 wiki 不允许把各插件文案集中到 core 的 `messages.properties`：

| 模块 | 文案位置 |
| --- | --- |
| core | `core/src/main/resources/messages.properties`（默认＝中文）、`messages_en.properties`（英文） |
| 插件 `plugin/<id>` | `plugin/<id>/src/main/resources/i18n/messages.properties`（中文）、`i18n/messages_en.properties`（英文） |

- 插件消息包只要一行（core 的 `ResourceMessageBundle` 会从**插件自己的** jar 里读上面两个文件）：
  ```java
  public class XxxMessages extends ResourceMessageBundle {
  }
  ```
  并在入口 `onStart` 里 `context.register(MessageBundle.class, new XxxMessages())`；
  properties 用 UTF-8（**无 BOM**），`:` / `=` / `\` 要转义（`\:` / `\=` / `\\`），`{0}` 这类占位符照旧；
  一个插件有多个消息包时用 `super("i18n/<名字>")` 区分基名，默认基名是 `i18n/messages`；
- **缺翻译时显示翻译键本身，绝不回落中文**（`PluginMessageSource`：core 与插件都查不到就返回 `files.multiListLabel` 这样的键名，
  一眼能看出漏翻）。因此这些写法**禁止**：
  - 模板：`th:text="#{key} ?: '中文'"`（应直接 `th:text="#{key}"`）；
  - Java：`message("key", "中文兜底")`（应 `message("key")`；只有「不是中文」的数据型默认值才可保留）；
- **插件名与描述也要本地化**（`特殊:版本` 的插件列表用它）：
  ```properties
  plugin.<id>.name=多文件批量上传（MsUpload）
  plugin.<id>.description=上传页多选列表 + 编辑器上传对话框批量插入
  ```
  解析顺序：当前语言的消息键 → 描述文件里的 `plugin.description`（英文技术描述）→ 插件 id；
- **版本与名称放本插件的 `gradle.properties`**，不再手改描述文件：
  ```properties
  pluginName=MsUpload
  pluginVersion=1.0.0
  pluginDescription=Multi-file batch upload for the upload page and the editor upload dialog
  ```
  配合 `build.gradle` 里的展开（`processResources { filesMatching('META-INF/wiki-plugin.properties') { expand(...) } }`），
  描述文件写成 `plugin.name=${pluginName}` / `plugin.version=${pluginVersion}` / `plugin.description=${pluginDescription}` 即可；
- 语言切换：`?uselang=zh|en`（与 MediaWiki 同名参数，会话内记住），用户长期偏好在 `特殊:参数设置` 里设；
- 改完自检：中文与英文两个文件的**键集合必须完全一致**（插件与 core 都是），且模板 / Java 里不再出现中文兜底。

### 代码风格（同样的要求也适用于 core）

- **不要写内联全限定类名**，一律 `import` 后用简名：
  `context.register(HtmlHeadProvider.class, new XxxHeadProvider())` 而不是
  `context.register(cc.thonly.wikikernel.common.extension.HtmlHeadProvider.class, …)`；
  泛型方法引用同理（`Wrappers.<WikiLog>lambdaQuery()`，不是 `Wrappers.<cc.thonly.wikikernel.common.data.WikiLog>lambdaQuery()`）；
  例外：javadoc 的 `{@link}` / `{@code}`、字符串字面量里的类名（反射用）；
- 不要用通配 `import xxx.*;`；
- 被 `@RestController` / `SpecialPage` 构造器依赖的支撑对象**必须是 Spring Bean**（加 `@Component`），
  不能只在 `onStart` 里 `new`（否则插件在真实实例上会以 `NoSuchBeanDefinitionException` 启动失败，
  单元测试发现不了——`core` 的 `PluginRuntimeLoadTest` 专门拦这类问题）。

## 插件加载原理（core 侧）

`PluginManager` 在 `ApplicationReadyEvent`（应用完全就绪）后：

1. 扫描 `wikikernel.plugins.dir` 下的 `*.jar`，每个 jar 创建独立的 `PluginClassLoader`
   （父优先，`common` 类型统一由 core 提供，保证扩展点类型一致）；
2. 读取 jar 内 `META-INF/wiki-plugin.properties` 得到插件元信息（含下表的依赖声明）；
   没有描述文件时回退到 `META-INF/services` + ServiceLoader；
3. 按 `enabled` 白名单过滤、去掉重复 id，再按 **`plugin.requires` 拓扑排序**（被依赖的先启动），
   逐个检查 core 版本约束与循环依赖，然后为每个插件创建子 Spring 容器：
   继承主应用配置源、注册 `PluginContext`、扫描插件包、注册入口 Bean（细节见下）；
4. 把插件 Controller 动态注册到 core 的 `RequestMappingHandlerMapping`；
5. 调用 `WikiPlugin.onStart`。
6. 应用关闭时调用 `onStop`、注销路由、关闭子容器与插件类加载器。

插件运行时数据统一放在 `data/plugins/<插件id>/`（已加入 `.gitignore`）。

### 插件依赖声明（`META-INF/wiki-plugin.properties`）

| 键 | 语义 | 缺失 / 不满足时的行为 |
| --- | --- | --- |
| `plugin.requires` | **运行期依赖**的其它插件 id（逗号分隔，可空）。被依赖的插件必须先启动 | 缺失（未安装 / 被 `enabled` 白名单禁用）/ 对方启动失败 / 对方处于循环依赖 → **本插件跳过启动**，只记一条 WARN（列出缺哪个依赖、为什么），应用照常启动 |
| `plugin.requiresCore` | **core 版本约束**：`>=`、`>`、`<=`、`<`、`=` 或裸版本号（裸版本号 = 至少该版本；空 = 不限制）。比较**只看数字段**，因此 `>=0.0.1` 在 `0.0.1-SNAPSHOT` 上成立 | 不满足 → 跳过启动 + WARN（日志里给出要求值与当前 `WikiKernelInfo.VERSION`） |
| `plugin.clientRequires` | **客户端（前端资源）依赖**的其它插件 id（逗号分隔，可空）：本插件的 `<head>` 片段需要那些插件的前端资源先加载 | 对方没加载 → **插件照常启动**，页面 `<head>` 里留一条 HTML 注释警告 + WARN 日志（前端能力降级，后端不受影响） |
| `plugin.aop`（可选） | 本插件要用 `CoreAopHook` 对 core 的 Bean 加切面（`true` / 空）。**声明后 core 才会在默认配置下启用插件 AOP 桥**（`wikikernel.plugins.aop-bridge=auto`）；不声明则一个代理都不建（默认安全） | 未声明 → 桥不启用，`CoreAopHook` 注册了也不会生效（WARN 提示按需开启） |
| `plugin.mixins`（可选） | 本插件的 Mixin / MixinExtras 配置资源（逗号分隔，如 `mixins.my-plugin.json`）。启动期 Java Agent 会在 core 类加载前注册；不写时自动发现 `*.mixins.json` / `mixins*.json`。详见 [插件 Mixin](/docs/development/mixin) | 未加载 Agent → 插件照常启动但 Mixin 不生效（WARN）；运行期新增 → 跳过启动，重启后生效 |

```properties
plugin.id=your-plugin
plugin.name=${pluginName}
plugin.version=${pluginVersion}
plugin.description=${pluginDescription}
plugin.mainClass=cc.thonly.wikikernel.plugin.yourplugin.YourPlugin
plugin.requires=comments,social-profile      # 运行期依赖（可空）
plugin.requiresCore=>=0.0.1                    # core 版本约束（可空）
plugin.clientRequires=comments                 # 前端资源依赖（可空）
plugin.aop=true                                # 可选：声明要用 CoreAopHook 对 core Bean 加切面
plugin.mixins=mixins.your-plugin.json          # 可选：插件 Mixin 配置（启动期生效）
```

行为汇总（都是「只跳过 / 只告警」，**不会让应用启动失败**）：

| 情况 | 结果 | 日志 |
| --- | --- | --- |
| 依赖都在，顺序正确 | 按拓扑顺序启动（被依赖者先） | `已启动插件 X vN（依赖: …；core >=…；客户端依赖: …）（来源: …）` |
| `plugin.requires` 里的插件没装 / 被禁用 | 本插件跳过 | WARN（含缺失 id 与原因） |
| 依赖的插件自己也跳过了（链式缺失） | 本插件跳过 | WARN（含「依赖的插件未启动 + 原因」） |
| `plugin.requires` 形成环（含自依赖） | **环上所有插件跳过** | ERROR（打印一条环路，如 `a → b → a`） |
| 依赖了环上的插件（自身不在环上） | 本插件跳过 | WARN |
| `plugin.requiresCore` 不满足 | 本插件跳过 | WARN（要求 X，当前 Y） |
| `plugin.clientRequires` 里的插件没加载 | 插件照常启动 | 页面 HTML 注释 + WARN |

插件作者可以用 `PluginManager` 的公开方法自查这些顺序（core 内部与测试用它）：

- `clientLoadOrder()`：客户端注入顺序（已加载插件 id，被依赖者在前；环只打乱顺序并记 WARN，不会让插件消失）；
- `clientDependencyWarnings()`：缺失的客户端依赖对应的 HTML 注释片段（core 已经自动塞进 `<head>`）；
- `headProviders(siteWideOnly)`：按客户端依赖顺序排好的 `HtmlHeadProvider` 列表（同一插件内仍按 `order()` 升序）。

### 插件对 core / common 做 AOP（`CoreAopHook`）

插件在 `onStart` 里注册 `CoreAopHook`（接口在 `common/extension`），就能对 **core 自己的 Bean**
（以及插件自己插件容器里的 Bean）加切面：

```java
public interface CoreAopHook extends Extension {
    /** 插件提供的 Spring AOP Advisor（PointcutAdvisor / DefaultPointcutAdvisor 等）。 */
    List<Advisor> advisors();
}
```

```java
// 插件侧：统计 core 的站点设置读取次数（core 的类名只能用字符串，插件不依赖 core）
NameMatchMethodPointcut pointcut = new NameMatchMethodPointcut();
pointcut.addMethodName("get");
pointcut.setClassFilter(type -> isSiteSettingsService(type));   // 按类名判断
context.register(CoreAopHook.class, () -> List.of(
        new DefaultPointcutAdvisor(pointcut, invocation -> { counter.incrementAndGet(); return invocation.proceed(); })));
```

core 侧接线：

- `core/plugin/aop/PluginAopRegistry`（`@Component`）：把所有插件 `CoreAopHook.advisors()` 汇总成不可变快照，
  Advisor 顺序 = 插件加载顺序 → 插件内声明顺序；插件卸载（`PluginManager.stop()`）后快照自动变空；
- `core/plugin/aop/PluginAopBridge`（`@Component`，`SmartInstantiationAwareBeanPostProcessor`）：
  在 **Bean 创建阶段**给可能被切中的 core Bean 套一层 `ProxyFactory` 桥接代理
  （`PluginAdviceBridge`：一个「活点切面」，调用时现取插件 Advisor），
  因此插件在应用就绪后才加载，**切面对已经注入到其它 Bean 的引用同样生效**（core 全部用构造器注入）；
- 插件子容器里也会挂一份同样的桥（`PluginSpringContextFactory.registerAopBridge`），
  所以插件对自己的 Bean 加切面也生效；
- 代理范围（**默认安全：宁可少代理，也不能让应用起不来**）：
  - 开关 `wikikernel.plugins.aop-bridge`：`auto`（默认）= **只有插件在描述文件里声明 `plugin.aop=true` 时才启用**
    （一个插件都不声明 → 一个代理都不建，零开销、零行为变化）；`true` = 强制开（所有插件的 `CoreAopHook` 都生效）；
    `false` = 关。
  - 只处理 `cc.thonly.wikikernel.*` 自己的单例 Bean，**且必须能被安全代理**：跳过框架 Bean
    （Spring / Thymeleaf / MyBatis / JDBC）、**Servlet 容器相关 Bean**（`Filter` / `GenericFilterBean` /
    `FilterRegistrationBean` / `Servlet` / `ServletRegistrationBean` / `ServletContextInitializer` /
    `HandlerInterceptor` / `WebMvcConfigurer`）、数据源与事务管理器、各种 `*Aware` 基础设施、
    `ApplicationListener`、`BeanPostProcessor` / `BeanFactoryPostProcessor` / `FactoryBean` / `Advisor` /
    `Pointcut`、`@Configuration` 与 `@ConfigurationProperties`、`@Bean` 工厂方法产出的 Bean、
    已经是 AOP / JDK 代理的 Bean（`@Transactional`、MyBatis Mapper）、`final` / 非 public 类；
  - **类（或其父类）里有非 private、非 static 的 `final` 方法的 Bean 一律不代理**：CGLIB 覆盖不了 final 方法，
    它会直接在**代理实例**上执行，而代理实例的字段是空的（踩过的坑：Servlet `GenericFilterBean.init()` 是 final，
    读到 `this.logger == null` → NPE → Tomcat 起不来；`@SpringBootTest` + MockMvc 不经 Tomcat，发现不了这类问题）；
  - 代理创建失败（类型不支持、CGLIB 报错等）只记 **WARN 并跳过该 Bean**，绝不影响启动；
- 没有命中任何切面的方法**只多一次判断**，直接调用原对象（行为与没有插件时一致）。
  为什么不是「创建时逐个方法判断是否命中」：`ProxyFactory` / CGLIB 在**代理创建时**就为每个方法固定了回调
  （`CglibAopProxy.ProxyCallbackFilter` 会按当时的通知链把方法编译成「直接调用目标」），而插件是在 core Bean
  创建完成之后才加载的 —— 创建时链为空的方法，之后注册的 Advisor 永远不会生效；平台因此**收窄 Bean 范围**、
  把方法匹配放到每次调用时做（`PluginAdviceBridge` 用 `Pointcut.TRUE` 保证调用一定进入桥接切面）；
- 容错：`advisors()` 抛异常只记 WARN 并跳过该插件；单个 Advisor 的 pointcut 抛异常只记 WARN 并跳过该 Advisor
  （不影响同一插件里其它 Advisor，也不会让请求 500）；插件卸载后代理壳变成直通，**无需重启或重新注入**；
- 限制：core 不带 `aspectjweaver`，pointcut 请用 Spring 原生实现
  （`NameMatchMethodPointcut` / `JdkRegexpMethodPointcut` / `AnnotationMatchingPointcut`），
  `@Aspect` / `execution(...)` 不可用；`@Controller` 的 handler 实例由 MVC 在启动时缓存，
  切面作用于控制器 Bean 的**方法调用**（其它 Bean 注入的引用没问题），如需拦截请求链路建议切服务层。

最小示例见插件 [`plugin/dep-demo`](/docs/plugins/dep-demo)（`installPlugins` 不会把它复制进 `plugins/`）。

## 扩展点与示例

扩展接口及平台服务见[扩展点与服务](/docs/development/extensions)。已提供的功能及配置见[插件目录](/plugins)，不需要在新插件中复制它们。

### 开发第三方登录插件

在插件中实现 `common.externalauth.ExternalAuthProvider`，并在 `WikiPlugin#onStart` 注册该扩展点。core 负责登录、注册、绑定和解绑，也会根据 provider 的 ID 和设置键生成配置表单与按钮。提供方回调使用 `/auth/{providerId}/callback`。

- 有授权码和用户资料接口的平台可以继承 `OAuth2ProfileProvider`。用固定的授权、令牌、资料端点，声明平台要求的最小 scope，再实现令牌和身份响应的解析。Google 与 Discord 是完整示例。
- 使用 `ExternalAuthUser.subject` 返回平台稳定的账号 ID。Google 使用 `sub`，Discord 使用用户 `id`。昵称和邮箱可变，应用只把它们用于显示或新账号资料。
- 继承该基类的插件使用 S256 PKCE。core 为当前会话生成并保存 verifier，provider 只在授权请求中收到 challenge，随后在令牌交换时收到 verifier 和最初的回调地址。现有 provider 可以继续实现两个参数的授权和交换方法。
- 只在提供方确认且平台能证明归属时返回已验证邮箱。遇到授权失败、缺失账号 ID 或格式不符的响应时终止登录。日志只应保留排查所需的状态，Client Secret、授权码和访问令牌留在服务端。

可以用固定 JSON 样本测试身份识别，用 core 的测试验证回调状态、PKCE 和绑定到当前会话。部署步骤见[第三方登录配置](/docs/administration/third-party-login)。
