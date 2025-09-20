import { useState, useEffect, useRef } from 'react'
import { webVitalsMonitor, WebVitalsData } from '../utils/webVitals'

interface PerformanceData {
  fps: number
  memory: number
  cacheSize: number
  loadTime: number
  scrollFps: number
  cacheHitRate: number
  averageLoadTime: number
  webVitals: Partial<WebVitalsData>
  performanceScore: number
}

export function usePerformanceMonitor() {
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    fps: 60,
    memory: 0,
    cacheSize: 0,
    loadTime: 0,
    scrollFps: 60,
    cacheHitRate: 0,
    averageLoadTime: 0,
    webVitals: {},
    performanceScore: 100
  })

  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(performance.now())
  const scrollFrameCountRef = useRef(0)
  const lastScrollTimeRef = useRef(performance.now())
  const isScrollingRef = useRef(false)

  useEffect(() => {
    let animationId: number

    const measureFPS = () => {
      frameCountRef.current++
      const now = performance.now()

      if (now - lastTimeRef.current >= 1000) {
        const fps = Math.round(frameCountRef.current * 1000 / (now - lastTimeRef.current))

        const webVitals = webVitalsMonitor.getVitalsData()
        const performanceScore = webVitalsMonitor.getPerformanceScore(webVitals)

        setPerformanceData(prev => ({
          ...prev,
          fps,
          memory: getMemoryUsage(),
          loadTime: getPageLoadTime(),
          webVitals,
          performanceScore
        }))

        frameCountRef.current = 0
        lastTimeRef.current = now
      }

      animationId = requestAnimationFrame(measureFPS)
    }

    animationId = requestAnimationFrame(measureFPS)

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [])

  useEffect(() => {
    const measureScrollFPS = () => {
      if (isScrollingRef.current) {
        scrollFrameCountRef.current++
        const now = performance.now()

        if (now - lastScrollTimeRef.current >= 1000) {
          const scrollFps = Math.round(scrollFrameCountRef.current * 1000 / (now - lastScrollTimeRef.current))

          setPerformanceData(prev => ({
            ...prev,
            scrollFps
          }))

          scrollFrameCountRef.current = 0
          lastScrollTimeRef.current = now
        }
      }

      requestAnimationFrame(measureScrollFPS)
    }

    const handleScrollStart = () => {
      isScrollingRef.current = true
      scrollFrameCountRef.current = 0
      lastScrollTimeRef.current = performance.now()
    }

    const handleScrollEnd = () => {
      isScrollingRef.current = false
    }

    let scrollTimeout: NodeJS.Timeout

    const handleScroll = () => {
      if (!isScrollingRef.current) {
        handleScrollStart()
      }

      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(handleScrollEnd, 150)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    requestAnimationFrame(measureScrollFPS)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [])

  // Web Vitals监听
  useEffect(() => {
    const unsubscribe = webVitalsMonitor.subscribe((vitals) => {
      const performanceScore = webVitalsMonitor.getPerformanceScore(vitals)
      setPerformanceData(prev => ({
        ...prev,
        webVitals: vitals,
        performanceScore
      }))
    })

    return unsubscribe
  }, [])

  const updateCacheSize = (size: number) => {
    setPerformanceData(prev => ({
      ...prev,
      cacheSize: size
    }))
  }

  const getCurrentWebVitals = async () => {
    const vitals = await webVitalsMonitor.getCurrentMetrics()
    const performanceScore = webVitalsMonitor.getPerformanceScore(vitals)

    setPerformanceData(prev => ({
      ...prev,
      webVitals: vitals,
      performanceScore
    }))

    return { vitals, performanceScore }
  }

  return {
    ...performanceData,
    updateCacheSize,
    getCurrentWebVitals
  }
}

function getMemoryUsage(): number {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    return Math.round(memory.usedJSHeapSize / 1024 / 1024)
  }
  return 0
}

function getPageLoadTime(): number {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  if (navigation) {
    return Math.round(navigation.loadEventEnd - navigation.fetchStart)
  }
  return 0
}