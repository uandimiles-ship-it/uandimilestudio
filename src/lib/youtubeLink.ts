import type { PortfolioWork } from '../content/portfolio'

/** Now-Ai RecommendedVideo.youtubeUrl 과 동일 — 붙여넣은 URL에서 ID 추출 */
export function parseYoutubeVideoId(input: string): string | null {
  const raw = input.trim()
  if (!raw) return null
  if (/^[\w-]{11}$/.test(raw)) return raw
  try {
    const url = new URL(raw.startsWith('http') ? raw : `https://${raw}`)
    const host = url.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') {
      const id = url.pathname.replace(/^\//, '').split('/')[0]
      return id && id.length >= 6 ? id : null
    }
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const v = url.searchParams.get('v')
      if (v) return v
      const shorts = url.pathname.match(/\/shorts\/([\w-]+)/)
      if (shorts?.[1]) return shorts[1]
      const embed = url.pathname.match(/\/embed\/([\w-]+)/)
      if (embed?.[1]) return embed[1]
    }
  } catch {
    return null
  }
  return null
}

export function resolveWorkYoutubeId(work: PortfolioWork): string | null {
  const fromLink = work.link ? parseYoutubeVideoId(work.link) : null
  if (fromLink) return fromLink
  const id = work.embed?.id?.trim()
  return id || null
}

export function applyVideoLink(work: PortfolioWork, link: string): PortfolioWork {
  const trimmed = link.trim()
  const videoId = parseYoutubeVideoId(trimmed)
  return {
    ...work,
    link: trimmed,
    embed: videoId ? { type: 'youtube', id: videoId } : undefined,
  }
}

/** YouTube 자동 썸네일 후보 — 16:9 고화질(maxres) 우선, 없으면 hqdefault */
export function youtubeThumbnailCandidatesForId(id: string | null | undefined): string[] {
  const v = id?.trim()
  if (!v) return []
  return [
    `https://i.ytimg.com/vi/${v}/maxresdefault.jpg`,
    `https://i.ytimg.com/vi/${v}/hqdefault.jpg`,
  ]
}

export function youtubeThumbnailCandidates(work: PortfolioWork): string[] {
  return youtubeThumbnailCandidatesForId(resolveWorkYoutubeId(work))
}

export function youtubeThumbnailUrl(work: PortfolioWork): string | null {
  return youtubeThumbnailCandidates(work)[0] ?? null
}

/** img.youtube.com / i.ytimg.com 자동 썸네일 주소인지 (관리자가 올린 이미지와 구분) */
export function isYoutubeAutoThumbnailSrc(src: string | null | undefined): boolean {
  return /^https?:\/\/(img\.youtube\.com|i\.ytimg\.com)\/vi\//.test(src?.trim() ?? '')
}
