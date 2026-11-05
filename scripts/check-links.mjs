import {readFile, readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {unified} from 'unified';
import remarkParse from 'remark-parse';
import GithubSlugger from 'github-slugger';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../content');
const files = (await readdir(root, {recursive: true})).filter(file => file.endsWith('.md'));
const pages = new Map();
function walk(node, visitor) { visitor(node); node.children?.forEach(child => walk(child, visitor)); }
function text(node) { return node.value ?? node.children?.map(text).join('') ?? ''; }
for (const file of files) {
  const source = (await readFile(path.join(root, file), 'utf8')).replace(/^---\r?\n[\s\S]*?\r?\n---/, '');
  const tree = unified().use(remarkParse).parse(source);
  const slugger = new GithubSlugger();
  const anchors = new Set();
  const links = [];
  walk(tree, node => {
    if (node.type === 'heading') anchors.add(slugger.slug(text(node)));
    if (node.type === 'link' || node.type === 'definition') links.push(node.url);
  });
  const route = '/docs/' + file.replaceAll('\\', '/').replace(/\.md$/, '').replace(/\/index$/, '');
  pages.set(route, {file, anchors, links});
}
let count = 0;
const errors = [];
for (const [route, page] of pages) {
  for (const url of page.links) {
    if (/^(?:https?:|mailto:|data:)/.test(url)) continue;
    let [target, anchor] = url.split('#');
    if (target === '/plugins' || (!target.startsWith('/docs') && target.startsWith('/'))) continue;
    if (!target) target = route;
    else if (!target.startsWith('/')) target = path.posix.normalize(path.posix.dirname(route) + '/' + target).replace(/\.md$/, '').replace(/\/index$/, '');
    count++;
    const destination = pages.get(target);
    if (!destination) errors.push(`${page.file}: missing page ${url}`);
    else if (anchor && !destination.anchors.has(decodeURIComponent(anchor))) errors.push(`${page.file}: missing anchor ${url}`);
  }
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else console.log(`Checked ${count} internal links across ${pages.size} pages.`);
