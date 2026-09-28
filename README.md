# z08 studio

z08 studio 的英文官网，展示 Ztab、Zdraft 和 This Week in Obsidian。

品牌主张是 **One thing. Done well.**：一件工具专注一个独立任务，来源于真实使用场景，并持续打磨。首页介绍项目和 Z 系列命名的由来；`/about/` 用 Bear Wang 的第一人称介绍创作初衷。

使用 Astro 构建纯静态 HTML，配合原生 CSS；首页无需客户端 JavaScript，字体和图片均自行托管，不需要数据库、账户或外部 CMS。

## 本地开发

需要 Node.js 24（见 `.node-version`）和 pnpm 11.20.0。

```sh
pnpm install --frozen-lockfile
pnpm dev
```

默认地址：<http://localhost:4321>。

```sh
pnpm check    # Astro 和 TypeScript 检查
pnpm build    # 生成 dist/
pnpm preview  # 预览构建产物
```

## 日常维护

| 文件 | 内容 |
| --- | --- |
| `src/data/studio.ts` | 网站信息、项目名称、描述、链接、图标、展示顺序 |
| `src/pages/index.astro` | 首页介绍和工作室文案 |
| `src/pages/about.astro` | 作者介绍、工具理念和命名由来 |
| `src/components/SiteHeader.astro`、`SiteFooter.astro` | 页面共用的导航和页脚 |
| `src/components/ProjectCard.astro` | 所有项目共用的卡片 |
| `src/styles/global.css` | 颜色、字体、布局和移动端样式 |
| `public/images/` | SVG 标志 |
| `src/assets/` | 需要在构建时压缩的位图 |
| `astro.config.mjs` | 正式域名 |

新增项目时，在 `src/data/studio.ts` 的 `projects` 数组添加一项即可。数组顺序决定首页顺序，网格自动更新。链接必须使用 `https://`，每个项目只写一段核心介绍，无需另加副标语。

```ts
{
  id: 'project-slug',
  name: 'Project name',
  category: 'Web app',
  description: 'What the project does and who it helps.',
  href: 'https://example.com',
  linkLabel: 'Explore the project',
  image: '/images/project.svg',
  background: '#eef1f6',
  imageWidth: 130,
},
```

PNG/JPEG 放入 `src/assets/`，通过 `import` 传给 `image` 字段；Astro 会生成 1×/2× WebP，避免直接发送高分辨率原图。SVG 可以直接放入 `public/images/`。

## Cloudflare Pages 部署

项目已准备好部署，创建仓库或构建成功不代表域名已经上线。

1. 在 Cloudflare 的 Workers & Pages 中创建 Pages 项目，连接 GitHub 仓库 `z08-studio/z08studio-home`。
2. 生产分支选 `main`；先合并首页 PR，再建立生产部署。
3. Framework preset 选 **Astro**，构建命令为 `pnpm build`，输出目录为 `dist`，根目录留空。
4. 构建环境变量设为 `NODE_VERSION=24`、`PNPM_VERSION=11.20.0`。
5. 先检查生成的 `pages.dev` 地址，再在该 Pages 项目的 **Custom domains** 添加 `z08studio.com`，按 Cloudflare 提示验证 DNS 和 HTTPS。
6. 如需 `www.z08studio.com`，也在 Custom domains 中添加，并设置到根域名的重定向。

无需服务器适配器、运行时密钥或 Cloudflare API token。连接 GitHub 后，后续合并到 `main` 的变更由 Cloudflare 自动构建部署；PR 可使用 Cloudflare 的预览部署。

`public/_headers` 会随静态产物发布并设置基础安全响应头和哈希资源缓存。`404.astro` 提供缺失页面；robots、sitemap 和 canonical 使用正式域名。增加页面时同步维护 `src/pages/sitemap.xml.ts`；如更换域名，同时更新 `astro.config.mjs` 和 `public/robots.txt`。

参考：[Cloudflare Astro 部署文档](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/)、[自定义域名文档](https://developers.cloudflare.com/pages/configuration/custom-domains/)。

## 品牌素材

- z08：现有 Final D 品牌包，沿用黑、白与 `#143EAB`。
- Ztab：项目中的 `store-listing/source/icon.svg`。
- Zdraft：项目中的 `Design/zdraft-icon.svg`。
- This Week in Obsidian：2026-09-28 从 [Substack 主页](https://thisweekinobsidian.substack.com/) 获取的最新紫色几何标志，与用户提供的参考一致；[原图](https://substack-post-media.s3.amazonaws.com/public/images/33967bc8-7d58-4748-9429-5743686ca954_1254x1254.png)。
- Inter：由 `@fontsource-variable/inter` 自行托管，使用 [SIL Open Font License](https://github.com/rsms/inter/blob/master/LICENSE.txt)。

当前产品链接来自对应项目的官方资料。不展示容易过时的用户数、价格或版本号。
