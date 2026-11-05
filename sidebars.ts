import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';
import plugins from './src/data/plugins.json';
import categories from './src/data/plugin-categories.json';
const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    {type: 'category', label: '安装与部署', collapsed: false, items: ['getting-started/quickstart', 'deployment/configuration', 'deployment/docker', 'deployment/network', 'deployment/maintenance']},
    {type: 'category', label: '使用手册', items: ['guides/features', 'guides/pages', 'guides/wikitext', 'guides/accounts', 'guides/files']},
    {type: 'category', label: '站点管理', items: ['administration/permissions', 'administration/interface', 'administration/cache', 'administration/accounts', 'administration/content-rules', 'administration/email', 'administration/interwiki', 'administration/third-party-login', 'administration/configuration-reference']},
    {type: 'category', label: '插件', items: ['plugins/index', ...categories.map(category => ({type: 'category' as const, label: category.label, items: plugins.filter(plugin => plugin.category === category.id).map(plugin => `plugins/${plugin.id}`)}))]},
    {type: 'category', label: 'API', items: ['api/overview', 'api/reference']},
    {type: 'category', label: '开发', items: ['development/plugin-development', 'development/extensions', 'development/skins', 'development/data', 'development/i18n', 'development/mixin']},
  ],
};
export default sidebars;
