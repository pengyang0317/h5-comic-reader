import { test, expect } from '@playwright/test';

test.describe('简化版性能测试', () => {
  test('基础页面性能测试', async ({ page }) => {
    console.log('开始性能测试...');

    // 设置较长的超时时间
    test.setTimeout(60000);

    const startTime = Date.now();

    try {
      // 导航到页面
      await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 });

      const loadTime = Date.now() - startTime;
      console.log(`页面加载时间: ${loadTime}ms`);

      // 基本断言
      expect(loadTime).toBeLessThan(10000); // 10秒内加载完成

      // 检查页面标题
      const title = await page.title();
      console.log(`页面标题: ${title}`);
      expect(title).toBeTruthy();

      // 检查主要元素是否存在
      const viewport = await page.locator('.viewport').count();
      console.log(`阅读器视窗组件数量: ${viewport}`);
      expect(viewport).toBeGreaterThan(0);

      // 检查控制按钮是否存在
      const controls = await page.locator('.controls').count();
      console.log(`控制组件数量: ${controls}`);
      expect(controls).toBeGreaterThan(0);

      console.log('✅ 基础性能测试通过');

    } catch (error) {
      console.error('❌ 测试失败:', error);
      throw error;
    }
  });

  test('内存使用基础检查', async ({ page }) => {
    test.setTimeout(45000);

    try {
      await page.goto('/', { timeout: 30000 });

      // 获取初始内存使用
      const memory = await page.evaluate(() => {
        if ('memory' in performance) {
          const mem = (performance as any).memory;
          return {
            used: mem.usedJSHeapSize,
            total: mem.totalJSHeapSize,
            limit: mem.jsHeapSizeLimit
          };
        }
        return null;
      });

      if (memory) {
        const usedMB = (memory.used / 1024 / 1024).toFixed(2);
        console.log(`当前内存使用: ${usedMB}MB`);

        // 检查内存使用是否合理（小于100MB）
        expect(memory.used).toBeLessThan(100 * 1024 * 1024);

        console.log('✅ 内存使用检查通过');
      } else {
        console.log('⚠️ 浏览器不支持内存API');
      }

    } catch (error) {
      console.error('❌ 内存测试失败:', error);
      throw error;
    }
  });

  test('页面响应性测试', async ({ page }) => {
    test.setTimeout(45000);

    try {
      await page.goto('/', { timeout: 30000 });

      // 模拟一些用户交互
      await page.mouse.wheel(0, 300);
      await page.waitForTimeout(1000);

      await page.mouse.wheel(0, 300);
      await page.waitForTimeout(1000);

      // 检查页面是否仍然响应
      const isVisible = await page.locator('body').isVisible();
      expect(isVisible).toBe(true);

      console.log('✅ 页面响应性测试通过');

    } catch (error) {
      console.error('❌ 响应性测试失败:', error);
      throw error;
    }
  });
});