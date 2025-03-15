const lifecycle = process.env.npm_lifecycle_event;
import viteCompression from "vite-plugin-compression";
import IconsResolver from "unplugin-icons/resolver";
import Components from "unplugin-vue-components/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  hooks: {
    "build:manifest": (manifest) => {
      // 找到应用程序入口的CSS列表
      const css = manifest["node_modules/nuxt/dist/app/entry.js"]?.css;
      if (css) {
        // 从数组的末尾开始，向前遍历
        for (let i = css.length - 1; i >= 0; i--) {
          // 如果以'entry'开头，从列表中删除它
          if (css[i].startsWith("entry")) css.splice(i, 1);
        }
      }
    },
  },
  nitro: {
    devProxy: {
      "/proxy": { target: "http://127.0.0.1:3000/api/v1", changeOrigin: true },
    },
  },
  devtools: { enabled: true },
  dir: {
    static: "/public",
  },
  modules: ["@element-plus/nuxt"],
  typescript: {
    shim: false,
    strict: false,
  },
  srcDir: "src",
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              // 让每个插件都打包成独立的文件
              return id
                .toString()
                .split("node_modules/")[1]
                .split("/")[0]
                .toString();
            }
          },
        },
      },
    },
    plugins: [
      viteCompression({
        verbose: true,
        threshold: 10240,
      }),
      Components({
        dts: true,
        resolvers: [IconsResolver({})],
      }),
    ],
    esbuild: {
      drop:
        process.env.NODE_ENV !== "development" ? ["console", "debugger"] : [],
    },
  },
  components: {
    dirs: ["~/composables", "~/components"],
    global: true,
  },
  routeRules: {},
  app: {
    head: {
      htmlAttrs: {
        lang: "zh-CN",
      },
      titleTemplate: `%s | 智语轩 - 分享Web技术与开发心得`,
      meta: [
        // 基本元数据
        { name: "baidu-site-verification", content: "codeva-slR3BYfrFS" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "author", content: "小析" },
        { name: "robots", content: "index, follow" },
        {
          hid: "description",
          name: "description",
          content:
            "智语轩是一个专注于Web前端技术、Nuxt3开发经验分享的个人博客，提供Vue、JavaScript、CSS等前端技术教程和实用开发技巧，帮助开发者提升技术能力。",
        },
        {
          hid: "keywords",
          name: "keywords",
          content:
            "智语轩,小析,前端开发,Nuxt3,Vue3,JavaScript教程,Web技术博客,前端学习资源,个人博客网站",
        },
        // Open Graph 标签 (用于社交媒体分享)
        { hid: "og:type", property: "og:type", content: "website" },
        { hid: "og:site_name", property: "og:site_name", content: "智语轩" },
        {
          hid: "og:title",
          property: "og:title",
          content: "智语轩 - 分享Web技术与开发心得",
        },
        {
          hid: "og:description",
          property: "og:description",
          content:
            "智语轩是一个专注于Web前端技术、Nuxt3开发经验分享的个人博客，提供Vue、JavaScript、CSS等前端技术教程和实用开发技巧。",
        },
        {
          hid: "og:image",
          property: "og:image",
          content: "/static/og-image.jpg",
        },
        {
          hid: "og:url",
          property: "og:url",
          content: "https://yourdomain.com",
        },
        // Twitter Card 标签
        {
          hid: "twitter:card",
          name: "twitter:card",
          content: "summary_large_image",
        },
        {
          hid: "twitter:title",
          name: "twitter:title",
          content: "智语轩 - 分享Web技术与开发心得",
        },
        {
          hid: "twitter:description",
          name: "twitter:description",
          content:
            "智语轩是一个专注于Web前端技术、Nuxt3开发经验分享的个人博客，提供Vue、JavaScript、CSS等前端技术教程和实用开发技巧。",
        },
        {
          hid: "twitter:image",
          name: "twitter:image",
          content: "/static/og-image.jpg",
        },
      ],
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        { rel: "canonical", href: "https://yourdomain.com" },
        { rel: "alternate", hreflang: "zh-CN", href: "https://yourdomain.com" },
        // 添加网站字体以提升用户体验
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap",
        },
      ],
      // 添加结构化数据
      script: [
        {
          hid: "schema-webpage",
          type: "application/ld+json",
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "智语轩",
            url: "https://yourdomain.com",
            description:
              "智语轩是一个专注于Web前端技术、Nuxt3开发经验分享的个人博客",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://yourdomain.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          }),
        },
      ],
    },
  },
  experimental: {
    writeEarlyHints: false,
    asyncContext: true,
  },
  build: {
    analyze: true,
    transpile: lifecycle === "build" ? ["element-plus"] : [],
  },
  runtimeConfig: {
    public: {
      requestBaseUrl: process.env.API_HOST + process.env.API_PREFIX,
      socket_url: process.env.WS_HOST,
    },
  },
});
