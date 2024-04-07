import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  cleanUrls: true,
  title: "一介白衣ing",
  description: "everything will be fine",
  base: "/vitepress-blog/",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "about", link: "/about" },
    ],
    sidebar: [
      {
        text: "技术日志",
        items: [
          { text: "从0到1实现一个php框架", link: "/build-your-php-framework" },
        ],
      },
      {
        text: "PHP面试题",
        items: [
          { text: "从0到1实现一个php框架", link: "/build-your-php-framework" },
        ],
      },
      {
        text: "Elasticsearch",
        items: [
          { text: "从开始到入门搜索引擎", link: "/build_Elasticsearch" },
        ],
      },
      {
        text: "生活",
        items: [{ text: "关于", link: "/about" }],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/yijiebaiyi/vitepress-blog" },
    ],
  },
});
