import type { PortfolioWork } from '../content/portfolio'
import { youtubeThumbnailUrl } from './youtubeLink'

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
  if (custom && isPersistableThumbnailSrc(custom)) return custom
  return youtubeThumbnailUrl(work)
}
