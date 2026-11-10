import type { PortfolioWork } from '../content/portfolio'
import { portfolio } from '../content/portfolio'
import { NATIVE_BRAND_LOGO_SRC } from './nativeSplash'
import { isCapacitorNative } from './platform'
import { normalizeThumbnailSrcForPlatform, resolveWorkThumbnailSrc } from './thumbnailResolve'

const HERO_WORK_IDS = ['work-1', 'work-2'] as const

export function webHeroImageUrls(): string[] {
  const thumbUrls = HERO_WORK_IDS.map((id) => {
    const w = portfolio.works.find((item) => item.id === id)
    return w ? resolveWorkThumbnailSrc(w) : null
  }).filter((u): u is string => Boolean(u))
  return [NATIVE_BRAND_LOGO_SRC, ...thumbUrls]
}

function preloadUrls(urls: string[]): Promise<void> {
  const unique = [...new Set(urls.filter(Boolean))]
  if (unique.length === 0) return Promise.resolve()
  return Promise.all(
    unique.map(
      (url) =>
        new Promise<void>((resolve) => {
          const img = new Image()
          img.decoding = 'async'
          const done = () => resolve()
          img.onload = done
          img.onerror = done
          img.src = url
        }),
    ),
  ).then(() => {})
}

/** 브라우저가 React보다 먼저 상단 이미지를 받기 시작 */
export function startWebHeroWarmup(): void {
  if (isCapacitorNative()) return
  for (const url of webHeroImageUrls()) {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = url
    document.head.appendChild(link)
  }
  void preloadUrls(webHeroImageUrls())
}

export function heroThumbnailUrls(works: PortfolioWork[]): string[] {
  return works
    .filter((w) => (HERO_WORK_IDS as readonly string[]).includes(w.id))
    .map((w) => resolveWorkThumbnailSrc(w))
    .filter((u): u is string => Boolean(u))
}

/** Firestore 등으로 URL이 바뀔 때 새 썸네일을 먼저 받은 뒤 state 반영 */
export async function preloadWebHeroChanges(
  prev: PortfolioWork[],
  next: PortfolioWork[],
): Promise<void> {
  if (isCapacitorNative()) return
  const prevSet = new Set(heroThumbnailUrls(prev))
  const toFetch = heroThumbnailUrls(next).filter((u) => !prevSet.has(u))
  if (toFetch.length === 0) return
  await preloadUrls(toFetch)
}

/** 관리자가 저장한 크롭·크기 레이아웃을 웹·앱 모두 그대로 표시 */
export function applyWebHeroCardDisplayPolicy(works: PortfolioWork[]): PortfolioWork[] {
  return works
}

export function webHeroPreloadHref(workId: 'work-1' | 'work-2'): string {
  const w = portfolio.works.find((item) => item.id === workId)
  const src = w?.thumbnail.src?.trim() ?? ''
  if (!src) return ''
  return normalizeThumbnailSrcForPlatform(src)
}
