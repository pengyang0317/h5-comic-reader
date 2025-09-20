# 部署指南

本项目支持多种免费静态托管服务，无需服务器即可让别人访问。

## 🚀 快速部署 (推荐Vercel)

### 方法一：自动部署 (最简单)

1. **上传到GitHub/Gitee**
   ```bash
   git init
   git add .
   git commit -m "Add H5 comic reader"
   git remote add origin https://github.com/yourusername/h5-comic-reader.git
   git push -u origin main
   ```

2. **连接Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 用GitHub账号登录
   - 点击 "New Project"
   - 选择你的仓库
   - 框架选择 "Vite"
   - 点击 "Deploy"

3. **完成！**
   - 几分钟后获得访问链接，如：`https://h5-comic-reader.vercel.app`

### 方法二：命令行部署

1. **安装Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **构建并部署**
   ```bash
   npm run build
   npm run deploy:vercel
   ```

## 🌟 其他部署选项

### GitHub Pages
```bash
# 安装依赖
npm install --save-dev gh-pages

# 修改package.json添加homepage字段
"homepage": "https://yourusername.github.io/h5-comic-reader"

# 部署
npm run build
npx gh-pages -d dist
```

### Netlify
1. **拖拽部署**
   - 运行 `npm run build`
   - 将 `dist` 文件夹拖拽到 [netlify.com/drop](https://app.netlify.com/drop)

2. **命令行部署**
   ```bash
   npm install -g netlify-cli
   npm run deploy:netlify
   ```

### Gitee Pages (国内推荐)
1. 上传代码到Gitee
2. 在项目设置中开启 Pages 服务
3. 选择 `dist` 目录作为静态文件源
4. 访问 `https://yourusername.gitee.io/h5-comic-reader`

## 📋 部署前检查

### 1. 构建测试
```bash
npm run build
npm run preview
```

### 2. 检查文件
确保 `dist` 目录包含：
- `index.html`
- `assets/` 目录
- 各种静态资源

### 3. 浏览器测试
在本地预览确保功能正常

## 🛠️ 自定义配置

### 环境变量
在项目根目录创建 `.env.production`：
```env
VITE_API_BASE_URL=https://your-api.com
VITE_APP_TITLE=图片阅读器
```

### 自定义域名
大部分平台都支持绑定自定义域名：
- Vercel: 项目设置 → Domains
- Netlify: Site settings → Domain management
- GitHub Pages: 仓库设置 → Pages

## 🔧 常见问题

### 1. 路径问题
如果资源加载失败，检查 `vite.config.ts` 中的 `base` 配置

### 2. HTTPS问题
所有托管平台都自动提供HTTPS，确保API调用也使用HTTPS

### 3. 缓存问题
如果更新后页面没变化，尝试强制刷新 `Ctrl+Shift+R`

## 📊 平台对比

| 平台 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| Vercel | 部署简单，全球CDN | 国内访问较慢 | 国际项目 |
| Netlify | 功能丰富，表单处理 | 构建时间限制 | 复杂应用 |
| GitHub Pages | 免费，稳定 | 仅支持静态 | 开源项目 |
| Gitee Pages | 国内访问快 | 需要实名认证 | 国内用户 |

## 🎯 推荐策略

1. **开发测试**: 本地 `npm run dev`
2. **预览验证**: `npm run preview`
3. **正式部署**: Vercel (国外) + Gitee Pages (国内)
4. **域名绑定**: 使用自定义域名提升品牌形象

选择适合你的平台，几分钟内就能让全世界的人访问你的图片阅读器！