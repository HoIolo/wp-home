# 智语轩 - 个人博客网站

智语轩是一个基于 Nuxt 3 开发的个人博客网站，专注于分享 Web 前端技术和开发心得。本项目提供了文章发布、评论交流、用户管理等功能，采用现代化的 UI 设计和交互体验。

## 项目特点

- 🚀 基于 Nuxt 3 框架，采用 Vue 3 和 TypeScript 开发
- 🎨 使用 Element Plus 组件库，提供美观的 UI 界面
- 📝 支持 Markdown 编辑器，方便内容创作
- 💬 实时评论系统，基于 Socket.io 实现
- 🔍 文章搜索和标签分类功能
- 👤 用户注册、登录和个人中心
- 🎵 音乐播放功能
- 💻 响应式设计，适配各种设备
- 🔒 完善的权限控制和安全措施

## 技术栈

- **前端框架**：Nuxt 3、Vue 3
- **UI 组件**：Element Plus、Undraw UI
- **编程语言**：TypeScript、JavaScript
- **样式处理**：Less、CSS
- **状态管理**：Nuxt Composables
- **网络请求**：Fetch API
- **实时通信**：Socket.io
- **动画效果**：Animate.css、Lottie
- **代码高亮**：highlight.js
- **其他工具**：MD Editor、Typed.js

## 安装

确保安装所有依赖：

```bash
# 使用yarn
yarn install

# 使用npm
npm install

# 使用pnpm
pnpm install --shamefully-hoist
```

## 环境配置

1. 复制`.env.example`文件并重命名为`.env.development`（开发环境）或`.env.production`（生产环境）
2. 根据需要修改环境变量：

```
# API服务器
API_HOST=http://127.0.0.1:3000
API_PREFIX=/api/v1
WS_HOST=ws://127.0.0.1:3000

# VITE环境变量
VITE_API_HOST=http://127.0.0.1:3000

NITRO_PORT=5000
```

## 开发服务器

启动开发服务器（默认端口 5000）：

```bash
npm run dev
```

## 生产部署

构建生产版本：

```bash
npm run build
```

本地预览生产构建：

```bash
npm run preview
```

启动生产服务：

```bash
npm run start
```

## 项目结构

```
├── src/                  # 源代码目录
│   ├── api/              # API接口
│   ├── assets/           # 静态资源
│   ├── components/       # 组件
│   ├── composables/      # 组合式函数
│   ├── layouts/          # 布局组件
│   ├── pages/            # 页面
│   ├── plugins/          # 插件
│   ├── public/           # 公共文件
│   ├── types/            # TypeScript类型定义
│   ├── utils/            # 工具函数
│   └── app.vue           # 应用入口
├── nuxt.config.ts        # Nuxt配置
├── package.json          # 项目依赖
├── tsconfig.json         # TypeScript配置
└── .env.example          # 环境变量示例
```

## 主要功能

- **文章系统**：发布、编辑、查看文章
- **评论系统**：发表评论、回复评论
- **用户系统**：注册、登录、个人信息管理
- **标签系统**：文章分类和标签管理
- **搜索功能**：全站内容搜索
- **AI 聊天**：基于 AI 的聊天功能
- **音乐播放**：在线音乐播放器
- **网站设置**：自定义网站配置

## 贡献指南

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个 Pull Request

## 许可证

[MIT](LICENSE)

## 联系方式

如有任何问题或建议，请通过以下方式联系我：

- 博客：[智语轩](https://www.hoiolo.cn)
- GitHub：[Your GitHub](https://github.com/HoIolo)
