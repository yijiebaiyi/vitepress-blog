import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "一介白衣的博客",
  description: "everything will be fine",
  base: "./",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "about", link: "/about" },
    ],

    sidebar: [
      {
        text: "技术",
        items: [
          { text: "从0到1实现一个php框架", link: "/build-your-php-framework" },
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
