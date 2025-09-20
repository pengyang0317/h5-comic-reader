import React, { useState, useCallback, useEffect, useRef } from 'react'
import ComicReader from './components/ComicReader'
import PerformanceMonitor from './components/PerformanceMonitor'
import Controls from './components/Controls'
import PageCounter from './components/PageCounter'
import LoadingIndicator from './components/LoadingIndicator'
import JumpDialog from './components/JumpDialog'
import { usePerformanceMonitor } from './hooks/usePerformanceMonitor'
import { ImageCacheProvider } from './context/ImageCacheContext'

const TOTAL_PAGES = 10000

function App() {
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isAutoReading, setIsAutoReading] = useState(false)
  const [showPerformance, setShowPerformance] = useState(false)
  const [showJumpDialog, setShowJumpDialog] = useState(false)
  const autoReadRef = useRef<NodeJS.Timeout>()

  const performanceData = usePerformanceMonitor()

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handleLoadingChange = useCallback((loading: boolean) => {
    setIsLoading(loading)
  }, [])

  const toggleAutoRead = useCallback(() => {
    setIsAutoReading(prev => {
      const newValue = !prev

      // 清除现有的定时器
      if (autoReadRef.current) {
        clearInterval(autoReadRef.current)
        autoReadRef.current = undefined
      }

      if (newValue) {
        // 延迟启动自动阅读，避免立即触发
        autoReadRef.current = setInterval(() => {
          setCurrentPage(page => {
            if (page >= TOTAL_PAGES) {
              setIsAutoReading(false)
              if (autoReadRef.current) {
                clearInterval(autoReadRef.current)
                autoReadRef.current = undefined
              }
              return page
            }
            return page + 1
          })
        }, 3000)
      }

      return newValue
    })
  }, [])

  const togglePerformanceMonitor = useCallback(() => {
    setShowPerformance(prev => !prev)
  }, [])

  const jumpToPage = useCallback((page: number) => {
    if (page >= 1 && page <= TOTAL_PAGES) {
      setCurrentPage(page)
      setShowJumpDialog(false)
    }
  }, [])

  const toggleJumpDialog = useCallback(() => {
    setShowJumpDialog(prev => !prev)
  }, [])

  useEffect(() => {
    return () => {
      if (autoReadRef.current) {
        clearInterval(autoReadRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isAutoReading) {
        setIsAutoReading(false)
        if (autoReadRef.current) {
          clearInterval(autoReadRef.current)
          autoReadRef.current = undefined
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isAutoReading])

  return (
    <ImageCacheProvider>
      <div className="reader-container">
        <ComicReader
          totalPages={TOTAL_PAGES}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onLoadingChange={handleLoadingChange}
        />

        <PageCounter
          currentPage={currentPage}
          totalPages={TOTAL_PAGES}
        />

        {isLoading && <LoadingIndicator />}

        <PerformanceMonitor
          data={performanceData}
          visible={showPerformance}
        />

        <Controls
          onToggleAutoRead={toggleAutoRead}
          onTogglePerformanceMonitor={togglePerformanceMonitor}
          onToggleJumpDialog={toggleJumpDialog}
          isAutoReading={isAutoReading}
        />

        <JumpDialog
          visible={showJumpDialog}
          currentPage={currentPage}
          totalPages={TOTAL_PAGES}
          onJump={jumpToPage}
          onClose={() => setShowJumpDialog(false)}
        />
      </div>
    </ImageCacheProvider>
  )
}

export default App