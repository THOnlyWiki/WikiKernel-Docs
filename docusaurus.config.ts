import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const siteUrl = (process.env.DOCUSAURUS_URL ?? 'https://docs.wikikernel.org').replace(/\/+$/, '');
const baseUrl = process.env.DOCUSAURUS_BASE_URL ?? '/';

const config: Config = {
  title: 'WikiKernel',
  tagline: '安装、使用和维护 WikiKernel',
  favicon: 'img/logo.svg',

  url: siteUrl,
  baseUrl,
  trailingSlash: false,

  future: {
    experimental_router: 'hash',
  },

  organizationName: 'THOnlyWiki',
  projectName: 'WikiKernel-Docs',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  markdown: {
    format: 'md',
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          path: 'content',
          routeBasePath: 'docs',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/THOnlyWiki/WikiKernel-Docs/tree/main/content/',
          showLastUpdateAuthor: false,
          showLastUpdateTime: false,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social-card.svg',
    metadata: [
      {
        name: 'keywords',
        content: 'WikiKernel, Wiki, MediaWiki, Java, Spring Boot, 插件, 文档',
      },
    ],
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'WikiKernel',
      logo: {
        alt: 'WikiKernel',
        src: 'img/logo.svg',
      },
      hideOnScroll: false,
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: '文档',
        },
        {
          to: '/plugins',
          position: 'left',
          label: '插件',
        },
        {
          to: '/docs/api/overview',
          position: 'left',
          label: 'API',
        },
        {
          href: 'https://github.com/THOnlyWiki/WikiKernel',
          label: 'GitHub',
          position: 'right',
        },
        {
          href: 'https://github.com/THOnlyWiki/WikiKernel/releases',
          label: '下载',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '文档',
          items: [
            {label: '快速开始', to: '/docs/getting-started/quickstart'},
            {label: '部署', to: '/docs/deployment/docker'},
            {label: '配置参考', to: '/docs/administration/configuration-reference'},
            {label: '插件目录', to: '/plugins'},
          ],
        },
        {
          title: '开发',
          items: [
            {label: '插件开发', to: '/docs/development/plugin-development'},
            {label: '皮肤', to: '/docs/development/skins'},
            {label: 'API', to: '/docs/api/overview'},
            {label: 'Wikitext', to: '/docs/guides/wikitext'},
          ],
        },
        {
          title: '项目',
          items: [
            {label: 'GitHub', href: 'https://github.com/THOnlyWiki/WikiKernel'},
            {label: 'Releases', href: 'https://github.com/THOnlyWiki/WikiKernel/releases'},
            {label: 'Issues', href: 'https://github.com/THOnlyWiki/WikiKernel/issues'},
            {label: 'GPLv3', href: 'https://github.com/THOnlyWiki/WikiKernel/blob/master/LICENSE'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} THOnlyWiki. WikiKernel is released under GPLv3.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['java', 'bash', 'powershell', 'yaml', 'json', 'sql'],
    },
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 4,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
