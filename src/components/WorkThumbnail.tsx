import type { PortfolioWork } from '../content/portfolio'

const placeholderConfigs: Record<
  string,
  { bg1: string; bg2: string; accent: string; label: string; sub: string }
> = {
  'work-1': { bg1: '#1a0533', bg2: '#0d0d1a', accent: '#a78bfa', label: 'NOW World', sub: '7 BRANDS' },
  'work-2': { bg1: '#1a0533', bg2: '#0d0d1a', accent: '#a78bfa', label: 'NOW Music', sub: '18 TRACKS' },
  'work-3': { bg1: '#1a0533', bg2: '#0d0d1a', accent: '#a78bfa', label: '나우 AI', sub: 'NOW AI' },
  'work-4': { bg1: '#1a0533', bg2: '#0d0d1a', accent: '#a78bfa', label: '나우북스', sub: 'BOOK 1' },
  'work-5': { bg1: '#1a0533', bg2: '#0d0d1a', accent: '#a78bfa', label: '나우북스', sub: 'BOOK 2' },
  'work-6': { bg1: '#1a0533', bg2: '#0d0d1a', accent: '#a78bfa', label: '유앤아이', sub: 'APP' },
  'work-7': { bg1: '#1a0533', bg2: '#0d0d1a', accent: '#a78bfa', label: '배틀아일랜즈', sub: 'GAME' },
  'work-8': { bg1: '#1a0533', bg2: '#0d0d1a', accent: '#a78bfa', label: '스튜디오', sub: 'PORTFOLIO' },
}

function PlaceholderSvg({ id, title }: { id: string; title: string }) {
  const c =
    placeholderConfigs[id] ?? {
      bg1: '#18181b',
      bg2: '#18181b',
      accent: '#ffffff',
      label: title.slice(0, 12),
      sub: 'VIDEO',
    }
  return (
    <svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      <defs>
        <linearGradient id={`g-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.bg1} />
          <stop offset="100%" stopColor={c.bg2} />
        </linearGradient>
      </defs>
      <rect width="480" height="300" fill={`url(#g-${id})`} />
      <rect x="0" y="0" width="480" height="5" fill={c.accent} opacity="0.5" />
      <rect x="0" y="295" width="480" height="5" fill={c.accent} opacity="0.5" />
      <circle cx="240" cy="135" r="44" fill="white" opacity="0.07" />
      <polygon points="228,118 228,152 264,135" fill={c.accent} opacity="0.9" />
      <text
        x="240"
        y="205"
        textAnchor="middle"
        fill="white"
        opacity="0.9"
        fontSize="16"
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        {c.label}
      </text>
      <text
        x="240"
        y="224"
        textAnchor="middle"
        fill={c.accent}
        opacity="0.8"
        fontSize="11"
        fontFamily="sans-serif"
      >
        {c.sub}
      </text>
    </svg>
  )
}

export function WorkThumbnail({ work }: { work: PortfolioWork }) {
  const src = work.thumbnail.src?.trim()
  if (src) {
    return (
      <img
        src={src}
        alt={work.thumbnail.alt || work.title}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    )
  }
  const ytId = work.embed?.id
  if (ytId) {
    return (
      <img
        src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
        alt={work.title}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    )
  }
  return <PlaceholderSvg id={work.id} title={work.title} />
}
