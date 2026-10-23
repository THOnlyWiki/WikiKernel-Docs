#!/usr/bin/env node
/**
 * Generate the public plugin catalog and one docs page per plugin README.
 *
 * Source of truth: ../plugin/<id>/README.md in the main WikiKernel repository.
 * Generated files are committed so this docs repository can be built standalone.
 *
 * Usage (from the docs repository root):
 *   node scripts/sync-plugins.mjs
 *
 * Optional:
 *   WIKIKERNEL_PLUGIN_DIR=/path/to/WikiKernel/plugin node scripts/sync-plugins.mjs
 */
import {mkdir, readFile, readdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const docsRoot = path.resolve(here, '..');
const pluginRoot = process.env.WIKIKERNEL_PLUGIN_DIR
  ? path.resolve(process.env.WIKIKERNEL_PLUGIN_DIR)
  : path.resolve(docsRoot, '../plugin');

// These are private or separate repositories. They must not be copied into
// the public docs repo.
const EXCLUDED = new Set(['kawaii-timeless', 'thonly-wiki-extensions']);

const categories = {
  content: {label: '内容与标记', order: 10},
  editing: {label: '编辑与治理', order: 20},
  social: {label: '用户与社交', order: 30},
  files: {label: '文件与媒体', order: 40},
  skins: {label: '皮肤', order: 50},
  site: {label: '站点工具', order: 60},
  ai: {label: 'AI', order: 70},
  dev: {label: '开发与演示', order: 80},
  other: {label: '其他', order: 90},
};

const categoryByPlugin = {
  'abuse-filter': 'editing',
  'ai-agent': 'ai',
  'category-tree': 'content',
  comments: 'social',
  'confirm-edit': 'editing',
  'dep-demo': 'dev',
  'dynamic-page-list': 'content',
  'easy-timeline': 'content',
  echo: 'social',
  'external-auth-github': 'social',
  'external-auth-qq': 'social',
  'fingerprint-login': 'social',
  'flash-player': 'files',
  gadgets: 'content',
  graph: 'content',
  'hit-counters': 'content',
  'input-box': 'content',
  math: 'content',
  'media-viewer': 'files',
  moderation: 'editing',
  'multi-upload': 'files',
  'no-title': 'content',
  'oss-extension': 'files',
  'page-banner': 'content',
  'plain-skin': 'skins',
  popups: 'content',
  'registration-quiz': 'editing',
  'rename-user': 'social',
  'reverse-proxy': 'site',
  'social-profile': 'social',
  'template-data': 'content',
  'user-merge': 'social',
  variables: 'content',
  'vue-components': 'content',
  widget: 'content',
  'wiki-seo': 'content',
};

const docsLink = {
  'API.md': '/docs/api/reference',
  'CONFIG.md': '/docs/administration/configuration-reference',
  'FEATURES.md': '/docs/guides/features',
  'MIXIN.md': '/docs/development/mixin',
  'PLUGIN-DEV.md': '/docs/development/plugin-development',
  'SKIN.md': '/docs/development/skins',
  'THIRD-PARTY-LOGIN.md': '/docs/administration/third-party-login',
  'WIKITEXT.md': '/docs/guides/wikitext',
};

const docsContentLink = {
  'api/reference.md': '/docs/api/reference',
  'administration/configuration-reference.md': '/docs/administration/configuration-reference',
  'administration/third-party-login.md': '/docs/administration/third-party-login',
  'guides/features.md': '/docs/guides/features',
  'guides/wikitext.md': '/docs/guides/wikitext',
  'development/mixin.md': '/docs/development/mixin',
  'development/plugin-development.md': '/docs/development/plugin-development',
  'development/skins.md': '/docs/development/skins',
  'deployment/docker.md': '/docs/deployment/docker',
  'deployment/configuration.md': '/docs/deployment/configuration',
};

function oneLine(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function firstDescription(body) {
  const lines = body.split(/\r?\n/);
  const paragraph = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#') || line.startsWith('>') ||
        line.startsWith('|') || line.startsWith('```') ||
        line.startsWith('---') || line.startsWith('<')) {
      if (paragraph.length) break;
      continue;
    }
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (paragraph.length) break;
      continue;
    }
    paragraph.push(line);
    if (line.endsWith('。') || line.endsWith('.')) break;
  }
  return oneLine(paragraph.join(' ')).slice(0, 220);
}

function rewriteLinks(body, id) {
  let result = body;
  for (const [file, target] of Object.entries(docsLink)) {
    const escaped = file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(
      new RegExp(`\\.\\./\\.\\./docs/${escaped}(#[^)\\s]*)?`, 'g'),
      (_match, hash = '') => `${target}${hash}`,
    );
    result = result.replace(
      new RegExp(`\\./docs/${escaped}(#[^)\\s]*)?`, 'g'),
      (_match, hash = '') => `${target}${hash}`,
    );
    result = result.replace(
      new RegExp(`\\.\\./docs/${escaped}(#[^)\\s]*)?`, 'g'),
      (_match, hash = '') => `${target}${hash}`,
    );
  }

  for (const [file, target] of Object.entries(docsContentLink)) {
    const escaped = file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(
      new RegExp(`\\.\\./\\.\\./docs/content/${escaped}(#[^)\\s]*)?`, 'g'),
      (_match, hash = '') => `${target}${hash}`,
    );
  }
  result = result.replace(
    /\.\.\/\.\.\/plugin\/([a-z0-9-]+)\/README\.md/g,
    'https://github.com/THOnlyWiki/WikiKernel/tree/master/plugin/$1',
  );
  result = result.replace(
    /\.\.\/\.\.\/README\.md/g,
    'https://github.com/THOnlyWiki/WikiKernel',
  );
  result = result.replace(
    /\.\.\/README\.md/g,
    `https://github.com/THOnlyWiki/WikiKernel/tree/master/plugin/${id}`,
  );
  return result;
}

function yamlString(value) {
  return JSON.stringify(value);
}

const plugins = [];
const pluginDocsDir = path.join(docsRoot, 'content/plugins');
await mkdir(pluginDocsDir, {recursive: true});

const entries = await readdir(pluginRoot, {withFileTypes: true});
for (const entry of entries) {
  if (!entry.isDirectory() || EXCLUDED.has(entry.name)) continue;
  const readme = path.join(pluginRoot, entry.name, 'README.md');
  let body;
  try {
    body = await readFile(readme, 'utf8');
  } catch {
    continue;
  }
  body = body.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const h1 = body.match(/^#\s+(.+?)\s*$/m);
  const title = h1 ? h1[1].trim() : entry.name;
  const name = title.replace(/[（(].*$/, '').trim() || entry.name;
  const description = firstDescription(body);
  const category = categoryByPlugin[entry.name] ?? 'other';
  const categoryMeta = categories[category] ?? categories.other;
  const content = rewriteLinks(body.replace(/^#\s+.+?\s*$\n?/m, ''), entry.name).trim();
  const source = `https://github.com/THOnlyWiki/WikiKernel/tree/master/plugin/${entry.name}`;
  const docs = `/docs/plugins/${entry.name}`;
  const distribution = entry.name === 'dep-demo' ? false : true;
  const status = entry.name === 'dep-demo' ? 'demo' : 'stable';

  const frontmatter = [
    '---',
    `title: ${yamlString(title)}`,
    `sidebar_label: ${yamlString(name)}`,
    `sidebar_position: ${categoryMeta.order + plugins.filter((p) => p.category === category).length}`,
    `description: ${yamlString(description)}`,
    '---',
    '',
    '<!-- 此页由 scripts/sync-plugins.mjs 从 plugin/README.md 生成，请修改主仓库 README。 -->',
    '',
  ].join('\n');

  await writeFile(path.join(pluginDocsDir, `${entry.name}.md`), frontmatter + content + '\n', 'utf8');

  plugins.push({
    id: entry.name,
    name,
    title,
    description,
    category,
    categoryLabel: categoryMeta.label,
    status,
    distribution,
    docs,
    source,
  });
}

plugins.sort((a, b) =>
  (categories[a.category]?.order ?? 999) - (categories[b.category]?.order ?? 999) ||
  a.name.localeCompare(b.name, 'zh-CN'),
);

await writeFile(
  path.join(docsRoot, 'src/data/plugins.json'),
  `${JSON.stringify(plugins, null, 2)}\n`,
  'utf8',
);

const categoryList = Object.entries(categories)
  .filter(([id]) => plugins.some((plugin) => plugin.category === id))
  .map(([id, meta]) => ({id, label: meta.label, count: plugins.filter((p) => p.category === id).length}));

await writeFile(
  path.join(docsRoot, 'src/data/plugin-categories.json'),
  `${JSON.stringify(categoryList, null, 2)}\n`,
  'utf8',
);

console.log(`Generated ${plugins.length} plugin pages and src/data/plugins.json`);
