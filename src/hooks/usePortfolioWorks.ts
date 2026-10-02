import { useEffect, useState } from 'react'
import type { PortfolioWork } from '../content/portfolio'
import { fetchPortfolioWorks } from '../lib/worksRepository'

export function usePortfolioWorks() {
  const [works, setWorks] = useState<PortfolioWork[]>([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<'firestore' | 'local'>('local')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const result = await fetchPortfolioWorks()
      if (cancelled) return
      setWorks(result.works)
      setSource(result.source)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return { works, loading, source, setWorks }
}
