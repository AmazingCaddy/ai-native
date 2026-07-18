// @ts-check

const hiddenSidebarDocIds = new Set([
  'learning/README',
  'review/README',
  'discussions/guide',
  'discussions/thread-template',
]);

/**
 * @param {import('@docusaurus/plugin-content-docs/lib/sidebars/types').NormalizedSidebar} items
 * @returns {import('@docusaurus/plugin-content-docs/lib/sidebars/types').NormalizedSidebar}
 */
function filterSidebarItems(items) {
  return items.flatMap((item) => {
    if (item.type === 'doc' && hiddenSidebarDocIds.has(item.id)) {
      return [];
    }

    if (item.type === 'category') {
      return [{ ...item, items: filterSidebarItems(item.items) }];
    }

    return [item];
  });
}

const config = {
  title: 'AI Native',
  tagline: '面向软件工程师的 AI 应用学习与实践路径',

  url: 'https://amazingcaddy.github.io',
  baseUrl: '/ai-native/',
  organizationName: 'AmazingCaddy',
  projectName: 'ai-native',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  i18n: {
    defaultLocale: 'zh-CN',
    locales: ['zh-CN'],
  },

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/AmazingCaddy/ai-native/edit/main/',
          async sidebarItemsGenerator({ defaultSidebarItemsGenerator, ...args }) {
            const items = await defaultSidebarItemsGenerator(args);
            return filterSidebarItems(items);
          },
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      metadata: [
        {
          name: 'description',
          content: '14 天 AI Native 学习路径：模型、RAG、工具、Agent、自动化、评测与生产工程。',
        },
      ],
      navbar: {
        title: 'AI Native',
        items: [
          { to: '/roadmap', label: '14 天路线', position: 'left' },
          { to: '/project/project-brief', label: '主线项目', position: 'left' },
          { to: '/reference/resources', label: '资料索引', position: 'left' },
          {
            href: 'https://github.com/AmazingCaddy/ai-native',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: '课程',
            items: [
              { label: '学习路径', to: '/' },
              { label: '14 天路线', to: '/roadmap' },
              { label: 'Day 1', to: '/course/day-01-landscape' },
            ],
          },
          {
            title: '实践',
            items: [
              { label: '主线项目', to: '/project/project-brief' },
              { label: '技术地图', to: '/templates/technology-map' },
              { label: '评测集模板', to: '/templates/eval-set' },
            ],
          },
          {
            title: '资源',
            items: [
              { label: '资料索引', to: '/reference/resources' },
              { label: 'GitHub', href: 'https://github.com/AmazingCaddy/ai-native' },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} AI Native. Built with Docusaurus.`,
      },
      prism: {
        additionalLanguages: ['java', 'go', 'sql', 'bash', 'json', 'typescript', 'python', 'csharp'],
      },
      colorMode: {
        defaultMode: 'light',
        respectPrefersColorScheme: true,
      },
    }),
};

module.exports = config;
