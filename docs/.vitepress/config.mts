// import { defineConfig } from "vitepress";
import { withMermaid }  from "vitepress-plugin-mermaid";
export default withMermaid({
  mermaid: {

  },
  mermaidPlugin: {
    class: "mermaid my-class",
  },
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
        text: "安全",
        items: [
          { text: "对称加密和非对称加密", link: "/security/symmetric_encryption_and_asymmetric_encryption" },
          { text: "OpenSSL核心功能和应用场景", link: "/security/openssl" },
          { text: "研发安全攻防", link: "/security/attack_and_guard" },
        ],
      },
      {
        text: "PHP",
        items: [
          { text: "如何从0到1实现一个php框架", link: "/php/build-your-php-framework" },
          { text: "php中的打印", link: "/php/print-different" },
        ],
      },
      {
        text: "大前端",
        items: [
          { text: "Vue双向绑定的原理", link: "/web/vue-two-ways-binding" },
          { text: "Micro-app入门指南", link: "/web/micro-app-start" },
        ],
      },
      {
        text: "MySQL",
        items: [
          { text: "MySQL索引类型全解析", link: "/mysql/index" },
          { text: "数据库索引核心概念解析", link: "/mysql/index-concept" },
          { text: "MySQL事务机制解析", link: "/mysql/transaction" },
        ],
      },
      {
        text: "UE",
        items: [
          { text: "UE基础", link: "/ue/ue-start" },
        ],
      },
      {
        text: "关于",
        items: [{ text: "关于", link: "/about" }],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/yijiebaiyi/vitepress-blog" },
    ],
  },
});
