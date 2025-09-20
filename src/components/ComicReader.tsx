import React, { useEffect, useRef, useCallback, useState } from 'react'
import { FixedSizeList as List } from 'react-window'
import ComicPage from './ComicPage'
import { useImageCache } from '../context/ImageCacheContext'

interface ComicReaderProps {
  totalPages: number
  currentPage: number
  onPageChange: (page: number) => void
  onLoadingChange: (loading: boolean) => void
}

function ComicReader({ totalPages, currentPage, onPageChange, onLoadingChange }: ComicReaderProps) {
  const listRef = useRef<List>(null)
  const [itemHeight, setItemHeight] = useState(window.innerHeight)
  const [isScrolling, setIsScrolling] = useState(false)
  const lastPageChangeRef = useRef(currentPage)
  const { preloadImage } = useImageCache()

  const scrollToPage = useCallback((page: number) => {
    if (listRef.current) {
      listRef.current.scrollToItem(page - 1, 'start')
    }
  }, [])

  useEffect(() => {
    if (currentPage !== lastPageChangeRef.current) {
      lastPageChangeRef.current = currentPage
      scrollToPage(currentPage)
    }
  }, [currentPage, scrollToPage])

  useEffect(() => {
    const handleResize = () => {
      setItemHeight(window.innerHeight)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const smartPreload = async () => {
      const highPriorityRange = 3  // 高优先级范围
      const lowPriorityRange = 10   // 低优先级范围

      // 1. 当前页面 - 最高优先级
      const currentPromise = preloadImage(currentPage)

      // 2. 前后各3页 - 高优先级预加载
      const highPriorityPromises = []
      for (let i = Math.max(1, currentPage - highPriorityRange);
           i <= Math.min(totalPages, currentPage + highPriorityRange); i++) {
        if (i !== currentPage) {
          highPriorityPromises.push(preloadImage(i))
        }
      }

      try {
        // 等待当前页面和高优先级页面加载完成
        await Promise.allSettled([currentPromise, ...highPriorityPromises])

        // 3. 前后各10页 - 低优先级后台加载
        const lowPriorityPromises = []
        for (let i = Math.max(1, currentPage - lowPriorityRange);
             i <= Math.min(totalPages, currentPage + lowPriorityRange); i++) {
          if (Math.abs(i - currentPage) > highPriorityRange) {
            lowPriorityPromises.push(
              new Promise(resolve => {
                // 延迟加载，避免阻塞高优先级内容
                setTimeout(() => {
                  preloadImage(i).then(resolve).catch(resolve)
                }, Math.abs(i - currentPage) * 100)
              })
            )
          }
        }

        // 后台加载，不等待完成
        Promise.allSettled(lowPriorityPromises)

      } catch (error) {
        console.warn('Some images failed to preload:', error)
      }
    }

    const timeoutId = setTimeout(smartPreload, 50)
    return () => clearTimeout(timeoutId)
  }, [currentPage, totalPages, preloadImage])

  const handleItemsRendered = useCallback(({ visibleStartIndex, visibleStopIndex }: {
    visibleStartIndex: number
    visibleStopIndex: number
  }) => {
    const newCurrentPage = visibleStartIndex + 1
    if (newCurrentPage !== currentPage &&
        newCurrentPage > 0 &&
        newCurrentPage <= totalPages &&
        newCurrentPage !== lastPageChangeRef.current) {
      lastPageChangeRef.current = newCurrentPage
      onPageChange(newCurrentPage)
    }

    onLoadingChange(isScrolling)
  }, [currentPage, totalPages, onPageChange, onLoadingChange, isScrolling])

  const renderItem = useCallback(({ index, style }: { index: number, style: React.CSSProperties }) => {
    return (
      <div style={style}>
        <ComicPage
          pageNumber={index + 1}
          isVisible={Math.abs(index + 1 - currentPage) <= 1}
        />
      </div>
    )
  }, [currentPage])

  return (
    <div className="viewport">
      <List
        ref={listRef}
        height={window.innerHeight}
        width="100%"
        itemCount={totalPages}
        itemSize={itemHeight}
        onItemsRendered={handleItemsRendered}
        overscanCount={1}
        useIsScrolling
      >
        {renderItem}
      </List>
    </div>
  )
}

export default React.memo(ComicReader)