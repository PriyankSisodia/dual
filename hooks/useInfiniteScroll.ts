import { useEffect, useRef, useState } from 'react'

interface UseInfiniteScrollOptions {
  hasMore: boolean
  loading: boolean
  onLoadMore: () => void
  threshold?: number
}

export function useInfiniteScroll({
  hasMore,
  loading,
  onLoadMore,
  threshold = 200,
}: UseInfiniteScrollOptions) {
  const [isFetching, setIsFetching] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (loading || !hasMore) return

    const options = {
      root: null,
      rootMargin: `${threshold}px`,
      threshold: 0.1,
    }

    observerRef.current = new IntersectionObserver((entries) => {
      const [entry] = entries
      if (entry.isIntersecting && hasMore && !loading) {
        setIsFetching(true)
        onLoadMore()
      }
    }, options)

    const currentRef = loadMoreRef.current
    if (currentRef) {
      observerRef.current.observe(currentRef)
    }

    return () => {
      if (observerRef.current && currentRef) {
        observerRef.current.unobserve(currentRef)
      }
    }
  }, [hasMore, loading, onLoadMore, threshold])

  useEffect(() => {
    if (!loading && isFetching) {
      setIsFetching(false)
    }
  }, [loading, isFetching])

  return { loadMoreRef, isFetching }
}

