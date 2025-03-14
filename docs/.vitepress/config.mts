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
      // { text: "主页", link: "/homepage" },
      // { text: "关于", link: "/about" },
    ],
    sidebar: [ 
      {
        text: "安全",
        collapsible: true, 
        collapsed: true,
        items: [
          { text: "对称加密和非对称加密", link: "/security/encryption" },
          { text: "OpenSSL介绍", link: "/security/openssl" },
          { text: "研发安全攻防", link: "/security/attack_and_guard" },
        ],
      },
      {
        text: "算法",
        collapsible: true,
        collapsed: true,
        items: [
          {
            text: "排序算法",
            collapsible: true, 
            collapsed: true,
            items: [
              { text: "快速排序", link: "/algorithm/sort/quick-sort" },
            ]
          },
          {
            text: "力扣",
            collapsible: true, 
            collapsed: true,
            items: [
              { text: "两数之和", link: "/algorithm/leetcode/two-sum" },
            ]
          }
        ],
      },
      {
        text: "PHP",
        collapsible: true, 
        collapsed: true,
        items: [
          { text: "从0到1实现一个php框架", link: "/php/build-framework" },
          // { text: "php中的打印", link: "/php/print-different" },
        ],
      },
      {
        text: "Golang",
        collapsible: true, 
        collapsed: true,
        items: [
          { text: "Golang通道", link: "/golang/channel" },
        ],
      },
      {
        text: "Nodejs",
        collapsible: true, 
        collapsed: true,
        items: [
          { text: "Nodejs事件循环", link: "/nodejs/eventloop" },
        ],
      },
      {
        text: "大前端",
        collapsible: true, 
        collapsed: true,
        items: [
          { text: "Vue双向绑定的原理", link: "/web/vue-binding" },
          { text: "Micro-app入门指南", link: "/web/micro-app-start" },
        ],
      },
      {
        text: "MySQL",
        collapsible: true,    // ✅ 启用折叠功能
        collapsed: true,       // ✅ 初始折叠状态
        items: [
          { text: "MySQL安装与配置", link: "/mysql/config" },
          { text: "MySQL索引", link: "/mysql/index" },
          { text: "MySQL索引核心概念", link: "/mysql/index-concept" },
          { text: "MySQL事务机制", link: "/mysql/transaction" },
          { text: "MySQL视图", link: "/mysql/view" },
          { text: "MySQL用户与权限", link: "/mysql/privileges" },
          { text: "MySQL架构", link: "/mysql/structure" },
          { text: "MySQL主从同步", link: "/mysql/master-slave" },
          { text: "MySQL慢日志定位", link: "/mysql/slow-query-log" },
          { text: "MySQL Binlog日志与数据恢复", link: "/mysql/binlog" },
          { text: "MySQL性能监控", link: "/mysql/monitor" }, 
          { text: "MySQL flush与redo log", link: "/mysql/flush" }, 
        ],
      },
      {
        text: "Redis",
        collapsible: true, 
        collapsed: true,
        items: [
          { text: "Redis基本数据类型", link: "/redis/type" },
        ],
      },
      {
        text: "RabbitMQ",
        collapsible: true, 
        collapsed: true,
        items: [
          { text: "RabbitMQ基础", link: "/rabbitmq/start" },
        ],
      },
      {
        text: "UE",
        collapsible: true, 
        collapsed: true,
        items: [
          { text: "UE术语概览", link: "/ue/start" },
          { text: "UE基础之蓝图", link: "/ue/blueprint" },
          { text: "UE静态网格体设置碰撞", link: "/ue/collision" },
          { text: "UE静态网格体合并", link: "/ue/staticMeshMerge" },
          { text: "UE蓝图案例--开关门", link: "/ue/openDoor" },
        ],
      },
      {
        text: "AI",
        collapsible: true, 
        collapsed: true,
        items: [
          { text: "好用的AI工具汇总", link: "/ai/tools" },
        ],
      },
      {
        text: "关于",
        link: "/about"
      },
    ],
// "https://lf-web-assets.juejin.cn/obj/juejin-web/xitu_juejin_web/6c61ae65d1c41ae8221a670fa32d05aa.svg"
    socialLinks: [
      { icon: "github", link: "https://github.com/yijiebaiyi" },
      {
        icon: {
          svg: `<svg width="36" height="28" viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M17.5875 6.77268L21.8232 3.40505L17.5875 0.00748237L17.5837 0L13.3555 3.39757L17.5837 6.76894L17.5875 6.77268ZM17.5863 17.3955H17.59L28.5161 8.77432L25.5526 6.39453L17.59 12.6808H17.5863L17.5825 12.6845L9.61993 6.40201L6.66016 8.78181L17.5825 17.3992L17.5863 17.3955ZM17.5828 23.2891L17.5865 23.2854L32.2133 11.7456L35.1768 14.1254L28.5238 19.3752L17.5865 28L0.284376 14.3574L0 14.1291L2.95977 11.7531L17.5828 23.2891Z" fill="#1E80FF"/></svg>`
        },
        link: "https://juejin.cn/user/4416058258381213"
      },
    ],
    search: {
      provider: "local", // 启用本地搜索
      options: {
        // 搜索选项（可选）
        fuzzy: true,      // 模糊匹配
        prefix: true,     // 前缀匹配
        boost: { title: 2 }, // 标题权重更高
        locales: {
          zh: {
            translations: {
              button: { buttonText: "搜索文档" },
              modal: { noResultsText: "无结果" }
            }
          },
          en: { /* 英文配置 */ }
        }
      }
    }
  },
});
