import React from 'react'

interface PerformanceData {
  fps: number
  memory: number
  cacheSize: number
  loadTime: number
  scrollFps: number
  cacheHitRate: number
  averageLoadTime: number
}

interface PerformanceMonitorProps {
  data: PerformanceData
  visible: boolean
}

function PerformanceMonitor({ data, visible }: PerformanceMonitorProps) {
  if (!visible) return null

  return (
    <div className={`performance-monitor ${visible ? 'visible' : ''}`}>
      <div>FPS: {data.fps}</div>
      <div>滚动FPS: {data.scrollFps}</div>
      <div>内存: {data.memory}MB</div>
      <div>缓存: {data.cacheSize}</div>
      <div>命中率: {data.cacheHitRate}%</div>
      <div>平均加载: {data.averageLoadTime}ms</div>
    </div>
  )
}

export default React.memo(PerformanceMonitor)