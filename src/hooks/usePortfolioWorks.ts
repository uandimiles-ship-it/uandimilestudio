import { useEffect, useState } from 'react'
import type { PortfolioWork } from '../content/portfolio'
import { PORTFOLIO_WORKS_UPDATED_EVENT } from '../lib/localPortfolioStore'
import { isCapacitorNative } from '../lib/platform'
import { fetchPortfolioWorks } from '../lib/worksRepository'

export function usePortfolioWorks() {
  const [works, setWorks] = useState<PortfolioWork[]>([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<'firestore' | 'local'>('local')

  useEffect(() => {
    let cancelled = false
    async function load(showSpinner = true) {
      if (showSpinner) setLoading(true)
      const result = await fetchPortfolioWorks()
      if (cancelled) return
      setWorks(result.works)
      setSource(result.source)
      setLoading(false)
    }
    void load(true)
    function onUpdated() {
      void load(false)
    }
    window.addEventListener(PORTFOLIO_WORKS_UPDATED_EVENT, onUpdated)
    function onFocus() {
      if (!isCapacitorNative()) void load(false)
    }
    window.addEventListener('focus', onFocus)
    return () => {
      cancelled = true
      window.removeEventListener(PORTFOLIO_WORKS_UPDATED_EVENT, onUpdated)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  return { works, loading, source, setWorks }
}
