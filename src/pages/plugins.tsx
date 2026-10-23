import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import PluginCatalog from '@site/src/components/PluginCatalog';
import styles from './plugins.module.css';

export default function PluginsPage() {
  return (
    <Layout
      title="插件目录"
      description="WikiKernel 的公开插件目录：内容标记、编辑治理、用户社交、文件媒体、皮肤与 AI。">
      <main className={styles.page}>
        <div className={styles.hero}>
          <div className={styles.eyebrow}>PLUGIN ECOSYSTEM</div>
          <h1>按需拼装你的 Wiki</h1>
          <p>
            core 只提供扩展点。评论、第三方登录、皮肤、AI 代理、文件预览，
            都可以单独安装、单独升级、单独移除。
          </p>
          <div className={styles.actions}>
            <Link className="button button--primary button--lg" to="/docs/plugins">
              插件系统文档
            </Link>
            <Link className="button button--secondary button--lg" to="/docs/development/plugin-development">
              写一个插件
            </Link>
          </div>
        </div>

        <section className={styles.catalogSection}>
          <PluginCatalog />
        </section>

        <section className={styles.note}>
          <h2>没有找到想要的插件？</h2>
          <p>
            插件页面来自主仓库中的 README。私有皮肤与未公开插件不会出现在这里。
            你可以在 <a href="https://github.com/THOnlyWiki/WikiKernel/issues">GitHub Issues</a>
            提出需求，或直接按 <Link to="/docs/development/plugin-development">插件开发指南</Link> 写一个。
          </p>
        </section>
      </main>
    </Layout>
  );
}
