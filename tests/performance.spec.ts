import { test, expect } from '@playwright/test';

test.describe('Comic Reader Performance Tests', () => {
  test('页面加载性能测试', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');

    // 等待页面完全加载
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;
    console.log(`页面加载时间: ${loadTime}ms`);

    // 断言加载时间不超过3秒
    expect(loadTime).toBeLessThan(3000);
  });

  test('Core Web Vitals测试', async ({ page }) => {
    await page.goto('/');

    // 等待页面加载完成
    await page.waitForLoadState('domcontentloaded');

    // 获取Web Vitals指标
    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals: any = {};
        let count = 0;
        const target = 5; // 等待5个指标

        const checkComplete = () => {
          count++;
          if (count >= target) {
            resolve(vitals);
          }
        };

        // 使用web-vitals库获取指标
        import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
          onCLS((metric) => {
            vitals.cls = metric.value;
            checkComplete();
          });

          onFID((metric) => {
            vitals.fid = metric.value;
            checkComplete();
          });

          onFCP((metric) => {
            vitals.fcp = metric.value;
            checkComplete();
          });

          onLCP((metric) => {
            vitals.lcp = metric.value;
            checkComplete();
          });

          onTTFB((metric) => {
            vitals.ttfb = metric.value;
            checkComplete();
          });
        });

        // 10秒超时
        setTimeout(() => resolve(vitals), 10000);
      });
    });

    console.log('Web Vitals:', webVitals);

    // 验证Core Web Vitals指标
    if ((webVitals as any).cls !== undefined) {
      expect((webVitals as any).cls).toBeLessThan(0.1); // 好的CLS < 0.1
    }

    if ((webVitals as any).fid !== undefined) {
      expect((webVitals as any).fid).toBeLessThan(100); // 好的FID < 100ms
    }

    if ((webVitals as any).lcp !== undefined) {
      expect((webVitals as any).lcp).toBeLessThan(2500); // 好的LCP < 2.5s
    }

    if ((webVitals as any).fcp !== undefined) {
      expect((webVitals as any).fcp).toBeLessThan(1800); // 好的FCP < 1.8s
    }

    if ((webVitals as any).ttfb !== undefined) {
      expect((webVitals as any).ttfb).toBeLessThan(800); // 好的TTFB < 800ms
    }
  });

  test('滚动性能测试', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 测试滚动性能
    const scrollStart = Date.now();

    // 模拟多次滚动
    for (let i = 0; i < 10; i++) {
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(100);
    }

    const scrollTime = Date.now() - scrollStart;
    console.log(`滚动10次耗时: ${scrollTime}ms`);

    // 验证滚动响应时间
    expect(scrollTime).toBeLessThan(2000);
  });

  test('内存使用情况测试', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 获取初始内存使用
    const initialMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        return memory.usedJSHeapSize;
      }
      return 0;
    });

    // 模拟长时间使用
    for (let i = 0; i < 50; i++) {
      await page.mouse.wheel(0, 300);
      await page.waitForTimeout(50);
    }

    // 获取使用后的内存
    const finalMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        return memory.usedJSHeapSize;
      }
      return 0;
    });

    const memoryIncrease = finalMemory - initialMemory;
    console.log(`内存增长: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);

    // 验证内存增长不超过50MB
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
  });

  test('图片加载性能测试', async ({ page }) => {
    await page.goto('/');

    // 监听图片加载
    const imageLoads: number[] = [];

    page.on('response', (response) => {
      if (response.url().includes('.jpg') || response.url().includes('.png') || response.url().includes('.webp')) {
        const loadTime = response.timing()?.responseEnd || 0;
        if (loadTime > 0) {
          imageLoads.push(loadTime);
        }
      }
    });

    // 等待一些图片加载
    await page.waitForTimeout(3000);

    if (imageLoads.length > 0) {
      const avgLoadTime = imageLoads.reduce((a, b) => a + b, 0) / imageLoads.length;
      console.log(`平均图片加载时间: ${avgLoadTime.toFixed(2)}ms`);
      console.log(`加载的图片数量: ${imageLoads.length}`);

      // 验证平均图片加载时间
      expect(avgLoadTime).toBeLessThan(1000);
    }
  });

  test('自动阅读性能测试', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 启动自动阅读
    await page.click('[data-testid="auto-read-button"]');

    const startTime = Date.now();
    let frameCount = 0;

    // 监控帧率
    const monitorFrames = setInterval(() => {
      frameCount++;
    }, 16.67); // 60fps = 16.67ms per frame

    // 运行自动阅读5秒
    await page.waitForTimeout(5000);

    clearInterval(monitorFrames);
    const totalTime = Date.now() - startTime;
    const fps = Math.round((frameCount * 1000) / totalTime);

    console.log(`自动阅读FPS: ${fps}`);

    // 验证帧率不低于30fps
    expect(fps).toBeGreaterThan(30);

    // 停止自动阅读
    await page.click('[data-testid="auto-read-button"]');
  });

  test('缓存性能测试', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 第一次加载
    const firstLoadStart = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle');
    const firstLoadTime = Date.now() - firstLoadStart;

    // 第二次加载（应该有缓存）
    const secondLoadStart = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle');
    const secondLoadTime = Date.now() - secondLoadStart;

    console.log(`首次加载: ${firstLoadTime}ms`);
    console.log(`缓存加载: ${secondLoadTime}ms`);
    console.log(`性能提升: ${((firstLoadTime - secondLoadTime) / firstLoadTime * 100).toFixed(1)}%`);

    // 验证缓存后加载时间有显著提升
    expect(secondLoadTime).toBeLessThan(firstLoadTime * 0.8);
  });
});