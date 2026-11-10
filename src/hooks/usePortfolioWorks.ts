import { useEffect, useRef, useState } from 'react'
import type { PortfolioWork } from '../content/portfolio'
import { PORTFOLIO_WORKS_UPDATED_EVENT } from '../lib/localPortfolioStore'
import { isCapacitorNative } from '../lib/platform'
import { preloadWebHeroChanges } from '../lib/webHeroWarmup'
import { fetchPortfolioWorks, getSyncPortfolioWorks } from '../lib/worksRepository'

function worksDisplayKey(works: PortfolioWork[]): string {
  return works
    .map(
      (w) =>
        `${w.id}\t${w.title}\t${w.thumbnail.src}\t${w.link ?? ''}\t${w.embed?.id ?? ''}\t${w.thumbnailLayout?.scale ?? 1}\t${w.thumbnailLayout?.translateX ?? 0}\t${w.thumbnailLayout?.translateY ?? 0}`,
    )
    .join('\n')
}

export function usePortfolioWorks() {
  const [works, setWorks] = useState<PortfolioWork[]>(() => getSyncPortfolioWorks())
  const [loading, setLoading] = useState(false)
  const [source, setSource] = useState<'firestore' | 'local'>('local')
  const worksRef = useRef(works)
  worksRef.current = works

  useEffect(() => {
    let cancelled = false
    async function load(showSpinner = false) {
      if (showSpinner) setLoading(true)
      const result = await fetchPortfolioWorks()
      if (cancelled) return
      const prev = worksRef.current
      const next = result.works
      if (worksDisplayKey(prev) !== worksDisplayKey(next)) {
        await preloadWebHeroChanges(prev, next)
      }
      setWorks((p) => (worksDisplayKey(p) === worksDisplayKey(next) ? p : next))
      setSource(result.source)
      setLoading(false)
    }

    // 웹·앱 모두 시작 시 Firestore에서 관리자 저장값을 가져온다
    void load(false)

    function onUpdated() {
      // 관리자 저장은 이 기기 캐시에 먼저 반영됨. 클라우드 재조회로 덮어쓰지 않음
      const instant = getSyncPortfolioWorks()
      setWorks((p) => (worksDisplayKey(p) === worksDisplayKey(instant) ? p : instant))
    }
    window.addEventListener(PORTFOLIO_WORKS_UPDATED_EVENT, onUpdated)

    function onFocus() {
      void load(false)
    }
    function onVisibility() {
      if (document.visibilityState === 'visible') onFocus()
    }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibility)

    let resumeHandle: { remove: () => Promise<void> } | undefined
    if (isCapacitorNative()) {
      void import('@capacitor/app')
        .then(({ App }) => App.addListener('resume', onFocus))
        .then((h) => {
          resumeHandle = h
        })
        .catch(() => {})
    }

    return () => {
      cancelled = true
      window.removeEventListener(PORTFOLIO_WORKS_UPDATED_EVENT, onUpdated)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
      void resumeHandle?.remove()
    }
  }, [])

  return { works, loading, source, setWorks }
}
