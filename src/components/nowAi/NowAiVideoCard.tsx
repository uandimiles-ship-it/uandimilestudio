import type { PortfolioWork } from '../../content/portfolio'
import { WorkThumbnail } from '../WorkThumbnail'
import { youtubeThumbnailUrl } from '../../lib/youtubeLink'

const DEFAULT_ACCENT = 0x5b5cff

function accentHex(work: PortfolioWork): string {
  const v = work.accentColor ?? DEFAULT_ACCENT
  const hex = (v >>> 0).toString(16).padStart(6, '0')
  return `#${hex.slice(-6)}`
}

type Props = {
  work: PortfolioWork
  compact?: boolean
}

/** Now-Ai home_screen `_VideoCard` — 홈 추천 영상 카드 미리보기 */
export function NowAiVideoCard({ work, compact }: Props) {
  const accent = accentHex(work)
  const creator = work.creator?.trim() || work.subtitle?.trim() || 'U&I STUDIO'
  const hasThumb = Boolean(work.thumbnail.src?.trim() || youtubeThumbnailUrl(work))

  return (
    <div
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm"
      style={{ maxWidth: compact ? 360 : undefined }}
    >
      <div className="relative aspect-[16/9] max-h-[100px] overflow-hidden bg-slate-100">
        {hasThumb ? (
          <WorkThumbnail work={work} />
        ) : (
          <div
            className="flex h-full min-h-[100px] items-center justify-center"
            style={{ backgroundColor: `${accent}26` }}
          >
            <svg viewBox="0 0 24 24" className="h-12 w-12" fill={accent} aria-hidden>
              <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
            </svg>
          </div>
        )}
        <span
          className="absolute left-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-bold text-white"
          style={{ backgroundColor: accent }}
        >
          YouTube
        </span>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-slate-900">{work.title || '제목 없음'}</h3>
        <p className="mt-1 text-xs font-medium text-slate-500">{creator}</p>
        {work.description ? (
          <p className="mt-2 line-clamp-2 text-xs text-slate-600">{work.description}</p>
        ) : null}
      </div>
    </div>
  )
}
