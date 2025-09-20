import React, { createContext, useContext, useRef, useCallback } from 'react'

interface CacheItem {
  url: string
  timestamp: number
  blob?: Blob
}

interface ImageCacheContextType {
  getImage: (seed: number) => string | null
  setImage: (seed: number, url: string, blob?: Blob) => void
  preloadImage: (seed: number) => Promise<string>
  clearCache: () => void
  getCacheSize: () => number
}

const ImageCacheContext = createContext<ImageCacheContextType | null>(null)

const MAX_CACHE_SIZE = 50  // 滑动窗口大小
const CACHE_WINDOW_SIZE = 20  // 活跃窗口大小
const CACHE_EXPIRE_TIME = 15 * 60 * 1000 // 15 minutes

export function ImageCacheProvider({ children }: { children: React.ReactNode }) {
  const cacheRef = useRef<Map<number, CacheItem>>(new Map())
  const workerRef = useRef<Worker | null>(null)

  const initWorker = useCallback(() => {
    if (!workerRef.current && typeof Worker !== 'undefined') {
      const workerCode = `
        self.onmessage = function(e) {
          const { imageUrl, seed } = e.data;

          fetch(imageUrl, {
            cache: 'force-cache',
            mode: 'cors'
          })
            .then(response => {
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }
              return response.blob();
            })
            .then(blob => {
              if (typeof OffscreenCanvas !== 'undefined') {
                const canvas = new OffscreenCanvas(800, 1200);
                const ctx = canvas.getContext('2d');

                createImageBitmap(blob).then(imageBitmap => {
                  ctx.drawImage(imageBitmap, 0, 0, 800, 1200);

                  canvas.convertToBlob({ type: 'image/webp', quality: 0.85 })
                    .then(webpBlob => {
                      self.postMessage({
                        seed,
                        blob: webpBlob,
                        url: URL.createObjectURL(webpBlob),
                        success: true
                      });
                    })
                    .catch(() => {
                      // Fallback to original blob
                      self.postMessage({
                        seed,
                        blob: blob,
                        url: URL.createObjectURL(blob),
                        success: true
                      });
                    });
                }).catch(() => {
                  // Fallback to original blob
                  self.postMessage({
                    seed,
                    blob: blob,
                    url: URL.createObjectURL(blob),
                    success: true
                  });
                });
              } else {
                // No OffscreenCanvas support, use original blob
                self.postMessage({
                  seed,
                  blob: blob,
                  url: URL.createObjectURL(blob),
                  success: true
                });
              }
            })
            .catch(error => {
              self.postMessage({
                seed,
                error: error.message,
                success: false
              });
            });
        };
      `

      const blob = new Blob([workerCode], { type: 'application/javascript' })
      workerRef.current = new Worker(URL.createObjectURL(blob))

      workerRef.current.onmessage = (e) => {
        const { seed, blob, url, error, success } = e.data
        if (success) {
          setImage(seed, url, blob)
        } else {
          console.error(`Worker error for seed ${seed}:`, error)
        }
      }
    }
  }, [])

  const cleanExpiredCache = useCallback(() => {
    const now = Date.now()
    const cache = cacheRef.current

    for (const [key, item] of cache.entries()) {
      if (now - item.timestamp > CACHE_EXPIRE_TIME) {
        if (item.url.startsWith('blob:')) {
          URL.revokeObjectURL(item.url)
        }
        cache.delete(key)
      }
    }
  }, [])

  const manageCacheSize = useCallback((currentPage?: number) => {
    const cache = cacheRef.current
    if (cache.size <= MAX_CACHE_SIZE) return

    const entries = Array.from(cache.entries())

    if (currentPage) {
      // 滑动窗口策略
      const windowStart = currentPage - CACHE_WINDOW_SIZE / 2
      const windowEnd = currentPage + CACHE_WINDOW_SIZE / 2

      entries.sort((a, b) => {
        const pageA = a[0]
        const pageB = b[0]

        // 1. 窗口内的页面优先保留
        const inWindowA = pageA >= windowStart && pageA <= windowEnd
        const inWindowB = pageB >= windowStart && pageB <= windowEnd

        if (inWindowA && !inWindowB) return 1
        if (!inWindowA && inWindowB) return -1

        // 2. 如果都在窗口内或都在窗口外，按距离排序
        const distanceA = Math.abs(pageA - currentPage)
        const distanceB = Math.abs(pageB - currentPage)

        if (distanceA !== distanceB) {
          return distanceB - distanceA // 距离远的优先删除
        }

        // 3. 距离相同时，按时间排序（LRU）
        return a[1].timestamp - b[1].timestamp
      })
    } else {
      // 按时间排序（LRU）
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
    }

    const toDelete = entries.slice(0, cache.size - MAX_CACHE_SIZE)
    toDelete.forEach(([key, item]) => {
      if (item.url.startsWith('blob:')) {
        URL.revokeObjectURL(item.url)
      }
      cache.delete(key)
    })

    console.log(`Cache cleanup: removed ${toDelete.length} items, ${cache.size} remaining`)
  }, [])

  const getImage = useCallback((seed: number): string | null => {
    cleanExpiredCache()
    const item = cacheRef.current.get(seed)
    return item ? item.url : null
  }, [cleanExpiredCache])

  const setImage = useCallback((seed: number, url: string, blob?: Blob, currentPage?: number) => {
    cacheRef.current.set(seed, {
      url,
      timestamp: Date.now(),
      blob
    })
    manageCacheSize(currentPage)
  }, [manageCacheSize])

  const preloadImage = useCallback(async (seed: number): Promise<string> => {
    const cached = getImage(seed)
    if (cached) {
      return cached
    }

    return new Promise((resolve, reject) => {
      const imageUrl = `https://picsum.photos/seed/${seed}/800/1200`

      if (!workerRef.current) {
        initWorker()
      }

      if (workerRef.current) {
        const timeoutId = setTimeout(() => {
          reject(new Error('Image loading timeout'))
        }, 10000)

        const handleMessage = (e: MessageEvent) => {
          const { seed: responseSeed, url, success } = e.data
          if (responseSeed === seed) {
            clearTimeout(timeoutId)
            workerRef.current?.removeEventListener('message', handleMessage)
            if (success) {
              resolve(url)
            } else {
              reject(new Error('Failed to load image'))
            }
          }
        }

        workerRef.current.addEventListener('message', handleMessage)
        workerRef.current.postMessage({ imageUrl, seed })
      } else {
        // Fallback for browsers without Worker support
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          setImage(seed, imageUrl)
          resolve(imageUrl)
        }
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = imageUrl
      }
    })
  }, [getImage, initWorker, setImage])

  const clearCache = useCallback(() => {
    const cache = cacheRef.current
    for (const item of cache.values()) {
      if (item.url.startsWith('blob:')) {
        URL.revokeObjectURL(item.url)
      }
    }
    cache.clear()
  }, [])

  const getCacheSize = useCallback(() => {
    return cacheRef.current.size
  }, [])

  return (
    <ImageCacheContext.Provider value={{
      getImage,
      setImage,
      preloadImage,
      clearCache,
      getCacheSize
    }}>
      {children}
    </ImageCacheContext.Provider>
  )
}

export function useImageCache() {
  const context = useContext(ImageCacheContext)
  if (!context) {
    throw new Error('useImageCache must be used within ImageCacheProvider')
  }
  return context
}