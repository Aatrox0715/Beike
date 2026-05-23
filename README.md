<img width="2489" height="1191" alt="69674fa231110f9ab39ee9fb4d02281d" src="https://github.com/user-attachments/assets/56df2326-da25-4f88-a6b9-19ef0225966b" /># AI 电商竞品分析工具

基于 DeepSeek API 的轻量电商竞品对比分析系统，输入产品与竞品信息，生成专业电商运营分析日报。

## 功能

- 输入我方产品名称与描述
- 支持添加 1-3 个竞品信息（可选）
- 一键生成 7 模块分析报告：
  1. 商品定位与价格带诊断
  2. 目标用户画像与转化动机
  3. 核心卖点与转化话术
  4. 竞品替代关系与攻防策略
  5. 流量获取路径与关键词策略
  6. 7 天可执行运营动作
  7. 运营决策总结
- DeepSeek AI 驱动，输出电商运营内部报告风格

## 技术栈

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- DeepSeek API (OpenAI 兼容格式)

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 配置 API Key
cp .env.example .env.local
# 编辑 .env.local，填入你的 DeepSeek API Key

# 3. 启动开发服务器
npm run dev
```

浏览器打开 `http://localhost:3000`。

## 环境变量

| 变量 | 说明 |
|---|---|
| `DEEPSEEK_API_KEY` | DeepSeek API Key（必填） |

## 项目结构

```
src/
├── app/
│   ├── api/analyze/route.ts   # API 路由（服务端代理 DeepSeek）
│   ├── globals.css             # Tailwind 全局样式
│   ├── layout.tsx              # 根布局
│   └── page.tsx                # 唯一页面（全部功能）
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
└── tsconfig.json
```

## 部署

```bash
npm run build
npm start
<img width="2489" height="1191" alt="8877196cb6aab7d2175f09253c385e46" src="https://github.com/user-attachments/assets/a68e1af7-79ec-434d-a2fe-88864dad8faf" />
<img width="2489" height="1191" alt="20fb10157356d6b73ffc4ae8262a6c00" src="https://github.com/user-attachments/assets/fd010871-653b-4563-9701-05e4edf60046" />
<img width="2489" height="1191" alt="69674fa231110f9ab39ee9fb4d02281d" src="https://github.com/user-attachments/assets/99e94457-def9-4d3c-927c-641a392caac1" />
<img width="2489" height="1191" alt="d94bcda9f83d6c237728e24cd848a397" src="https://github.com/user-attachments/assets/6221b42f-1714-42f0-9b75-bb75e379e30f" />
<img width="2489" height="1191" alt="dcc289109bd8612baeded4a33f694289" src="https://github.com/user-attachments/assets/8b6f36a5-9bf7-4f17-8d1c-51c4be841252" />

```

## License

MIT
