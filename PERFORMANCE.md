# 性能测试指南

## 概述

本项目集成了多种自动化性能测试工具，确保漫画阅读器的高性能表现。

## 测试工具

### 1. Lighthouse CI

**用途**: 自动化网页性能、可访问性、SEO等指标检测

**运行方式**:
```bash
# 本地运行
npm run lighthouse

# 仅性能测试
npm run perf:test
```

**配置**: `lighthouserc.json`
- 性能分数要求: ≥ 80
- 可访问性要求: ≥ 90
- 最佳实践要求: ≥ 80
- SEO要求: ≥ 80

**核心指标要求**:
- First Contentful Paint (FCP): ≤ 3秒
- Largest Contentful Paint (LCP): ≤ 4秒
- Cumulative Layout Shift (CLS): ≤ 0.1
- First Input Delay (FID): ≤ 300ms
- Total Blocking Time (TBT): ≤ 300ms

### 2. Web Vitals 监控

**用途**: 实时监控核心网页指标

**特性**:
- 实时FCP、LCP、CLS、FID、TTFB监控
- 性能评分算法
- 订阅机制支持实时更新

**使用**:
```typescript
import { webVitalsMonitor } from './utils/webVitals';

// 订阅指标更新
const unsubscribe = webVitalsMonitor.subscribe((vitals) => {
  console.log('Web Vitals:', vitals);
});

// 获取当前指标
const vitals = await webVitalsMonitor.getCurrentMetrics();

// 获取性能评分
const score = webVitalsMonitor.getPerformanceScore(vitals);
```

### 3. Playwright 性能测试

**用途**: 端到端性能测试和用户体验验证

**运行方式**:
```bash
# 运行所有测试
npm test

# 运行性能测试
npm run test:performance

# 带界面运行
npm run test:headed
```

**测试覆盖**:
- 页面加载性能
- Core Web Vitals
- 滚动性能
- 内存使用情况
- 图片加载性能
- 自动阅读性能
- 缓存效果验证

**性能标准**:
- 页面加载时间: ≤ 3秒
- 滚动响应时间: ≤ 2秒 (10次滚动)
- 内存增长: ≤ 50MB (长时间使用)
- 平均图片加载: ≤ 1秒
- 自动阅读帧率: ≥ 30fps
- 缓存性能提升: ≥ 20%

## GitHub Actions 自动化

### 工作流程

1. **performance-ci.yml**: 主要性能测试流程
   - 触发条件: push/PR/定时任务 (每日2AM)
   - 包含: Lighthouse CI、Playwright测试、Web Vitals监控
   - 结果: 自动评论PR、上传测试报告

2. **deploy-and-test.yml**: 部署后测试
   - 触发条件: main分支push
   - 包含: 部署到Vercel、生产环境性能测试

### 配置要求

需要在GitHub仓库设置以下Secrets:
- `VERCEL_TOKEN`: Vercel部署令牌
- `ORG_ID`: Vercel组织ID
- `PROJECT_ID`: Vercel项目ID
- `LHCI_GITHUB_APP_TOKEN`: Lighthouse CI GitHub App令牌 (可选)

## 本地开发

### 性能监控

启动开发服务器时，应用会自动启用性能监控：

```bash
npm run dev
```

监控面板显示:
- 实时FPS
- 内存使用
- 缓存大小和命中率
- Web Vitals指标
- 性能评分

### 性能优化检查清单

在提交代码前，请确保:

1. **运行性能测试**:
   ```bash
   npm run build
   npm run perf:test
   npm run test:performance
   ```

2. **检查关键指标**:
   - Lighthouse性能分数 ≥ 80
   - LCP ≤ 2.5秒
   - CLS ≤ 0.1
   - FID ≤ 100ms

3. **验证功能性能**:
   - 滚动流畅度
   - 图片加载速度
   - 自动阅读稳定性
   - 内存使用合理性

## 性能优化策略

### 已实现的优化

1. **虚拟滚动**: react-window处理大列表
2. **图片懒加载**: Intersection Observer
3. **智能预加载**: 滑动窗口策略
4. **WebP转换**: Web Worker后台处理
5. **LRU缓存**: 内存和磁盘缓存结合
6. **代码分割**: Vite自动代码分割
7. **资源压缩**: esbuild压缩

### 持续优化建议

1. **监控关键指标**: 定期查看CI报告
2. **分析瓶颈**: 使用Chrome DevTools
3. **压力测试**: 模拟大量数据场景
4. **用户反馈**: 收集真实用户体验数据

## 故障排除

### 常见问题

1. **Lighthouse分数低**:
   - 检查图片优化
   - 验证缓存策略
   - 分析加载时间

2. **Web Vitals指标差**:
   - CLS: 检查布局稳定性
   - LCP: 优化最大内容元素
   - FID: 减少主线程阻塞

3. **Playwright测试失败**:
   - 确保测试环境稳定
   - 检查超时配置
   - 验证测试数据

### 调试技巧

```bash
# 详细Lighthouse报告
npx lhci autorun --upload.target=temporary-public-storage

# Playwright调试模式
npx playwright test --debug

# 性能分析
npm run dev
# 打开 http://localhost:3000 并开启性能监控面板
```

## 参考资源

- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Playwright](https://playwright.dev/)
- [React Performance](https://react.dev/learn/render-and-commit)