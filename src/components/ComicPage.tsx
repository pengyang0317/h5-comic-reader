import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useInView } from 'react-intersection-observer'
import { useImageCache } from '../context/ImageCacheContext'

interface ComicPageProps {
  pageNumber: number
  isVisible: boolean
}

function ComicPage({ pageNumber, isVisible }: ComicPageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const { getImage, preloadImage } = useImageCache()

  const { ref, inView } = useInView({
    threshold: 0.1,
    rootMargin: '100px 0px',
    triggerOnce: false
  })

  const imgRef = useRef<HTMLImageElement>(null)

  const loadImage = useCallback(async () => {
    if (hasError) return

    setIsLoading(true)
    setHasError(false)

    try {
      const cached = getImage(pageNumber)
      if (cached) {
        setImageUrl(cached)
        setIsLoading(false)
        return
      }

      // 设置加载超时，避免长时间等待
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Loading timeout')), 8000)
      })

      try {
        const url = await Promise.race([
          preloadImage(pageNumber),
          timeoutPromise
        ]) as string

        setImageUrl(url)
      } catch (timeoutError) {
        console.warn(`Preload timeout for page ${pageNumber}, falling back to direct URL`)

        // 降级到直接URL，确保兜底
        const fallbackUrl = `https://picsum.photos/seed/${pageNumber}/800/1200`
        setImageUrl(fallbackUrl)

        // 后台继续尝试缓存优化版本
        preloadImage(pageNumber).catch(() => {
          console.warn(`Background preload also failed for page ${pageNumber}`)
        })
      }
    } catch (error) {
      console.error(`Failed to load image for page ${pageNumber}:`, error)
      setHasError(true)
      // 降级到直接URL，让浏览器处理加载
      setImageUrl(`https://picsum.photos/seed/${pageNumber}/800/1200`)
    } finally {
      setIsLoading(false)
    }
  }, [pageNumber, getImage, preloadImage, hasError])

  useEffect(() => {
    if (inView || isVisible) {
      loadImage()
    }
  }, [inView, isVisible, loadImage])

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
    setIsLoading(false)
    setHasError(false)
  }, [])

  const handleImageError = useCallback(() => {
    setHasError(true)
    setIsLoading(false)
    setImageUrl(`https://picsum.photos/seed/${pageNumber}/800/1200`)
  }, [pageNumber])

  const handleRetry = useCallback(() => {
    setHasError(false)
    setImageLoaded(false)
    loadImage()
  }, [loadImage])

  return (
    <div ref={ref} className="page-item" data-page={pageNumber}>
      {isLoading && !imageLoaded && (
        <div className="page-skeleton" />
      )}

      {hasError && (
        <div className="error-message">
          <div>图片加载失败</div>
          <button onClick={handleRetry} style={{ marginTop: '10px', padding: '5px 10px' }}>
            重试
          </button>
        </div>
      )}

      {imageUrl && (
        <img
          ref={imgRef}
          className="page-image"
          src={imageUrl}
          alt={`图片第${pageNumber}页`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  )
}

export default React.memo(ComicPage)


