import type { PortfolioWork } from '../content/portfolio'
import { WORKS_BUNDLE_REVISION } from './bundleWorksPatch'
import { isCapacitorNative } from './platform'
import { PUBLIC_SITE_URL } from './siteUrl'
import { youtubeThumbnailUrl } from './youtubeLink'

/**
 * 앱: APK에 없는·깨진 로컬 경로 대신 공식 사이트 CDN에서 로드 (WebView 로컬 ?쿼리 이슈 회피)
 * 웹: 상대 경로 + rev 쿼리로 캐시 무효화
 */
export function normalizeThumbnailSrcForPlatform(src: string): string {
  const trimmed = src.trim()
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
  if (!trimmed.startsWith('/thumbnails/')) return trimmed
  const base = trimmed.split('?')[0]
  const versioned = `${base}?v=${WORKS_BUNDLE_REVISION}`
  if (isCapacitorNative()) {
    return `${PUBLIC_SITE_URL}${versioned}`
  }
  if (trimmed.includes('?')) return trimmed
  return versioned
}

/** localStorage·Firestore에 넣을 수 있는 썸네일 URL */
export function isPersistableThumbnailSrc(src: string | undefined | null): boolean {
  const s = src?.trim() ?? ''
  if (!s) return false
  if (s.startsWith('blob:')) return false
  return (
    s.startsWith('http://') ||
    s.startsWith('https://') ||
    s.startsWith('data:image/') ||
    s.startsWith('/')
  )
}

export function sanitizeWorkThumbnail(work: PortfolioWork): PortfolioWork {
  const src = work.thumbnail.src?.trim() ?? ''
  if (!isPersistableThumbnailSrc(src)) {
    return {
      ...work,
      thumbnail: { src: '', alt: work.thumbnail.alt || work.title },
    }
  }
  return work
}

export function sanitizePortfolioWorks(works: PortfolioWork[]): PortfolioWork[] {
  return works.map(sanitizeWorkThumbnail)
}

/** 홈·카드 표시용 — 깨진 blob 제외, YouTube 폴백 */
export function resolveWorkThumbnailSrc(work: PortfolioWork): string | null {
  const custom = work.thumbnail.src?.trim()
  if (custom && isPersistableThumbnailSrc(custom)) {
    return normalizeThumbnailSrcForPlatform(custom)
  }
  return youtubeThumbnailUrl(work)
}
