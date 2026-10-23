import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import PluginCard, {type Plugin} from '@site/src/components/PluginCard';
import pluginsData from '@site/src/data/plugins.json';
import styles from './index.module.css';

const plugins = pluginsData as Plugin[];
const featuredPlugins = ['comments', 'social-profile', 'ai-agent', 'media-viewer', 'external-auth-github', 'moderation']
  .map((id) => plugins.find((plugin) => plugin.id === id))
  .filter((plugin): plugin is Plugin => Boolean(plugin));

const features = [
  {
    icon: 'MW',
    title: 'MediaWiki 的使用习惯',
    body: '页面、修订、命名空间、模板、特殊页、最近更改与参数设置，尽量沿用你熟悉的规则。',
  },
  {
    icon: '↗',
    title: '/api.php 与 mw 兼容',
    body: '机器人可以用 MediaWiki Action API 的 token 流程读写页面，旧工具也能继续访问 /index.php 与 /load.php。',
  },
  {
    icon: '◆',
    title: '插件隔离',
    body: '每个插件独立类加载器，按依赖拓扑启动。缺依赖只跳过该插件，不会拖垮整个站点。',
  },
  {
    icon: '▣',
    title: 'SQLite 起步',
    body: '一个 jar 加一个配置文件即可运行；需要并发和运维能力时再切 MariaDB / MySQL。',
  },
  {
    icon: '⚙',
    title: '可替换皮肤',
    body: '皮肤、前端资源、页面级 CSS / JS 都是扩展点，可以按站点品牌替换。',
  },
  {
    icon: '✦',
    title: 'AI 代理',
    body: 'AI 阅读词条、起草编辑，但只提交提案；用户核对差异后才以本人名义保存。',
  },
];

export default function Home() {
  const {siteConfig} = useDocusaurusContext();

  return (
    <Layout
      title="WikiKernel"
      description="Java 21 + Spring Boot 4 编写的可插拔 MediaWiki 风格 Wiki 引擎。">
      <main>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <div className={styles.badges}>
                <span>Java 21+</span>
                <span>Spring Boot 4</span>
                <span>GPLv3</span>
              </div>
              <h1>
                把 MediaWiki 的
                <br />
                使用习惯，带进 Java 世界
              </h1>
              <p className={styles.lead}>
                {siteConfig.tagline}。页面、模板、特殊页、API 与插件平台，
                一个可执行 jar 就能跑起来。
              </p>
              <div className={styles.actions}>
                <Link className="button button--primary button--lg" to="/docs/getting-started/quickstart">
                  5 分钟快速开始
                </Link>
                <Link className="button button--secondary button--lg" to="/plugins">
                  浏览插件
                </Link>
              </div>
              <div className={styles.stats}>
                <div><strong>30+</strong><span>公开插件</span></div>
                <div><strong>1</strong><span>可执行 jar</span></div>
                <div><strong>2</strong><span>SQLite / MariaDB</span></div>
              </div>
            </div>

            <div className={styles.heroVisual} aria-label="WikiKernel 页面与插件示意">
              <div className={styles.window}>
                <div className={styles.windowBar}>
                  <span />
                  <span />
                  <span />
                  <em>wiki.example.com</em>
                </div>
                <div className={styles.windowBody}>
                  <aside className={styles.sidebar}>
                    <div className={styles.sidebarLogo}>WK</div>
                    <div className={styles.sidebarLine} />
                    <div className={styles.sidebarLine} />
                    <div className={styles.sidebarLineShort} />
                    <div className={styles.sidebarLine} />
                  </aside>
                  <div className={styles.article}>
                    <div className={styles.articleKicker}>WIKI / 首页</div>
                    <div className={styles.articleTitle}>欢迎来到 WikiKernel</div>
                    <div className={styles.articleMeta}>最近更改 · 2 分钟前</div>
                    <div className={styles.articleText} />
                    <div className={styles.articleText} />
                    <div className={styles.articleTextShort} />
                    <div className={styles.pluginRow}>
                      <span>comments</span>
                      <span>math</span>
                      <span>media</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.floatingCard}>
                <span className={styles.floatingDot} />
                <div>
                  <strong>Plugin loaded</strong>
                  <small>comments · social-profile</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.kicker}>WHY WIKIKERNEL</span>
            <h2>核心很小，能力按需拼装</h2>
            <p>不把所有功能塞进一个单体，也不要求你从第一天就上完整基础设施。</p>
          </div>
          <div className={styles.featureGrid}>
            {features.map((feature) => (
              <article className={styles.feature} key={feature.title}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.codeSection}>
          <div className={styles.codeCopy}>
            <span className={styles.kicker}>FROM ZERO</span>
            <h2>三条命令，先跑起来</h2>
            <p>
              默认 SQLite，不需要先搭数据库。安装向导会生成
              <code>LocalSettings.yaml</code>，从第一个词条开始。
            </p>
            <Link className={styles.textLink} to="/docs/getting-started/quickstart">
              查看完整快速开始 →
            </Link>
          </div>
          <div className={styles.codeCard}>
            <div className={styles.codeHead}>
              <span>terminal</span>
              <span className={styles.codeDots}>● ● ●</span>
            </div>
            <pre>
              <code>
                <span className={styles.prompt}>$</span> git clone https://github.com/THOnlyWiki/WikiKernel.git{'\n'}
                <span className={styles.prompt}>$</span> cd WikiKernel && ./gradlew dist{'\n'}
                <span className={styles.prompt}>$</span> cd build/dist && java -jar wikikernel-server.jar{'\n'}
                {'\n'}
                <span className={styles.comment}># 打开 http://localhost:18080/init</span>
              </code>
            </pre>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeadRow}>
            <div>
              <span className={styles.kicker}>PLUGINS</span>
              <h2>从评论到 AI，按需启用</h2>
            </div>
            <Link className={styles.textLink} to="/plugins">
              全部插件 →
            </Link>
          </div>
          <div className={styles.pluginGrid}>
            {featuredPlugins.map((plugin) => (
              <PluginCard key={plugin.id} plugin={plugin} />
            ))}
          </div>
        </section>

        <section className={styles.cta}>
          <div>
            <span className={styles.kicker}>READY?</span>
            <h2>先跑起来，再决定你的 Wiki 长什么样</h2>
            <p>从快速开始、部署和插件目录进入文档。</p>
          </div>
          <div className={styles.ctaActions}>
            <Link className="button button--primary button--lg" to="/docs/intro">
              阅读文档
            </Link>
            <a className="button button--secondary button--lg" href="https://github.com/THOnlyWiki/WikiKernel">
              GitHub
            </a>
          </div>
        </section>
      </main>
    </Layout>
  );
}
