import { useState, useEffect, useCallback, useMemo } from 'react'

interface VirtualizationOptions {
  totalItems: number
  itemHeight: number
  containerHeight: number
  bufferSize?: number
  overscan?: number
}

interface VirtualizationResult {
  visibleStartIndex: number
  visibleEndIndex: number
  totalHeight: number
  offsetY: number
  visibleItems: number[]
}

export function useVirtualization({
  totalItems,
  itemHeight,
  containerHeight,
  bufferSize = 3,
  overscan = 2
}: VirtualizationOptions): VirtualizationResult {
  const [scrollTop, setScrollTop] = useState(0)

  const result = useMemo(() => {
    const visibleItemCount = Math.ceil(containerHeight / itemHeight)

    const visibleStartIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const visibleEndIndex = Math.min(
      totalItems - 1,
      visibleStartIndex + visibleItemCount + overscan * 2
    )

    const bufferedStartIndex = Math.max(0, visibleStartIndex - bufferSize)
    const bufferedEndIndex = Math.min(totalItems - 1, visibleEndIndex + bufferSize)

    const visibleItems = []
    for (let i = bufferedStartIndex; i <= bufferedEndIndex; i++) {
      visibleItems.push(i)
    }

    return {
      visibleStartIndex: bufferedStartIndex,
      visibleEndIndex: bufferedEndIndex,
      totalHeight: totalItems * itemHeight,
      offsetY: bufferedStartIndex * itemHeight,
      visibleItems
    }
  }, [scrollTop, totalItems, itemHeight, containerHeight, bufferSize, overscan])

  const handleScroll = useCallback((newScrollTop: number) => {
    setScrollTop(newScrollTop)
  }, [])

  return {
    ...result,
    handleScroll
  }
}

export function useIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
) {
  const [observer, setObserver] = useState<IntersectionObserver | null>(null)

  useEffect(() => {
    const obs = new IntersectionObserver(callback, {
      rootMargin: '50px 0px',
      threshold: 0.1,
      ...options
    })

    setObserver(obs)

    return () => {
      obs.disconnect()
    }
  }, [callback, options])

  const observe = useCallback((element: Element) => {
    if (observer) {
      observer.observe(element)
    }
  }, [observer])

  const unobserve = useCallback((element: Element) => {
    if (observer) {
      observer.unobserve(element)
    }
  }, [observer])

  const disconnect = useCallback(() => {
    if (observer) {
      observer.disconnect()
    }
  }, [observer])

  return { observe, unobserve, disconnect }
}