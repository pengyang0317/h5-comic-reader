import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

export interface WebVitalsData {
  cls: number;
  inp: number;
  fcp: number;
  lcp: number;
  ttfb: number;
}

class WebVitalsMonitor {
  private vitalsData: Partial<WebVitalsData> = {};
  private listeners: ((data: Partial<WebVitalsData>) => void)[] = [];

  constructor() {
    this.initWebVitals();
  }

  private initWebVitals() {
    // 监听核心网页指标
    onCLS((metric) => {
      this.vitalsData.cls = metric.value;
      this.notifyListeners();
      console.log('CLS:', metric.value);
    });

    onINP((metric) => {
      this.vitalsData.inp = metric.value;
      this.notifyListeners();
      console.log('INP:', metric.value);
    });

    onFCP((metric) => {
      this.vitalsData.fcp = metric.value;
      this.notifyListeners();
      console.log('FCP:', metric.value);
    });

    onLCP((metric) => {
      this.vitalsData.lcp = metric.value;
      this.notifyListeners();
      console.log('LCP:', metric.value);
    });

    onTTFB((metric) => {
      this.vitalsData.ttfb = metric.value;
      this.notifyListeners();
      console.log('TTFB:', metric.value);
    });
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.vitalsData));
  }

  public subscribe(listener: (data: Partial<WebVitalsData>) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public getVitalsData(): Partial<WebVitalsData> {
    return { ...this.vitalsData };
  }

  // 获取当前指标快照
  public async getCurrentMetrics(): Promise<Partial<WebVitalsData>> {
    const current: Partial<WebVitalsData> = {};

    try {
      await Promise.all([
        new Promise<void>((resolve) => {
          getCLS((metric) => {
            current.cls = metric.value;
            resolve();
          });
        }),
        new Promise<void>((resolve) => {
          onINP((metric) => {
            current.inp = metric.value;
            resolve();
          });
        }),
        new Promise<void>((resolve) => {
          onFCP((metric) => {
            current.fcp = metric.value;
            resolve();
          });
        }),
        new Promise<void>((resolve) => {
          onLCP((metric) => {
            current.lcp = metric.value;
            resolve();
          });
        }),
        new Promise<void>((resolve) => {
          onTTFB((metric) => {
            current.ttfb = metric.value;
            resolve();
          });
        })
      ]);
    } catch (error) {
      console.warn('获取Web Vitals指标失败:', error);
    }

    return current;
  }

  // 性能评分
  public getPerformanceScore(data: Partial<WebVitalsData>): number {
    let score = 100;

    // CLS评分 (好: <0.1, 需改进: 0.1-0.25, 差: >0.25)
    if (data.cls !== undefined) {
      if (data.cls > 0.25) score -= 25;
      else if (data.cls > 0.1) score -= 10;
    }

    // INP评分 (好: <200ms, 需改进: 200-500ms, 差: >500ms)
    if (data.inp !== undefined) {
      if (data.inp > 500) score -= 25;
      else if (data.inp > 200) score -= 10;
    }

    // LCP评分 (好: <2.5s, 需改进: 2.5-4s, 差: >4s)
    if (data.lcp !== undefined) {
      if (data.lcp > 4000) score -= 25;
      else if (data.lcp > 2500) score -= 10;
    }

    // FCP评分 (好: <1.8s, 需改进: 1.8-3s, 差: >3s)
    if (data.fcp !== undefined) {
      if (data.fcp > 3000) score -= 15;
      else if (data.fcp > 1800) score -= 5;
    }

    // TTFB评分 (好: <800ms, 需改进: 800-1800ms, 差: >1800ms)
    if (data.ttfb !== undefined) {
      if (data.ttfb > 1800) score -= 10;
      else if (data.ttfb > 800) score -= 5;
    }

    return Math.max(0, score);
  }
}

export const webVitalsMonitor = new WebVitalsMonitor();