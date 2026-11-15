import { useState, type SyntheticEvent } from 'react'
import { isCapacitorNative } from '../lib/platform'

import type { PortfolioWork } from '../content/portfolio'

import { resolveWorkThumbnailSrc } from '../lib/thumbnailResolve'

import { youtubeThumbnailCandidates } from '../lib/youtubeLink'

import { ThumbnailFramedImage } from './ThumbnailFramedImage'



const placeholderConfigs: Record<

  string,

  { bg1: string; bg2: string; accent: string; label: string; sub: string }

> = {

  'work-1': { bg1: '#18181b', bg2: '#27272a', accent: '#f472b6', label: 'U&I', sub: 'STUDIO' },

  'work-2': { bg1: '#18181b', bg2: '#27272a', accent: '#38bdf8', label: 'U&I', sub: 'BRAND ADS' },

  'work-3': { bg1: '#18181b', bg2: '#27272a', accent: '#111111', label: 'U&I', sub: 'EVENT' },

  'work-4': { bg1: '#18181b', bg2: '#27272a', accent: '#f472b6', label: 'NOW', sub: 'MUSIC' },

  'work-5': { bg1: '#18181b', bg2: '#27272a', accent: '#a78bfa', label: 'NOW', sub: 'ANIME' },

  'work-6': { bg1: '#18181b', bg2: '#27272a', accent: '#fbbf24', label: '궁예', sub: 'SEQUENCE' },

  'work-7': { bg1: '#18181b', bg2: '#27272a', accent: '#22d3ee', label: 'DANCE', sub: 'BATTLE' },

  'work-8': { bg1: '#18181b', bg2: '#27272a', accent: '#ef4444', label: 'BERSERK', sub: 'FAN' },

  'work-9': { bg1: '#18181b', bg2: '#27272a', accent: '#a78bfa', label: 'ANIME', sub: 'HEROES' },

  'work-10': { bg1: '#18181b', bg2: '#27272a', accent: '#84cc16', label: '머털도사', sub: 'FAN' },

  'work-11': { bg1: '#18181b', bg2: '#27272a', accent: '#facc15', label: 'NOW', sub: 'MEMES' },

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



export function WorkThumbnail({
  work,
  priority = false,
}: {
  work: PortfolioWork
  priority?: boolean
}) {
  const primary = resolveWorkThumbnailSrc(work)
  const ytCandidates = youtubeThumbnailCandidates(work)
  const candidates = [...new Set([primary, ...ytCandidates].filter((u): u is string => Boolean(u)))]
  const candidatesKey = `${work.id}|${candidates.join('|')}`
  // 후보 목록이 바뀌면 실패 횟수는 자동으로 0부터 다시 계산
  const [failed, setFailed] = useState<{ key: string; count: number }>({ key: candidatesKey, count: 0 })

  const failedCount = failed.key === candidatesKey ? failed.count : 0
  const src = candidates[failedCount] ?? null
  const skip = () =>
    setFailed((prev) => ({
      key: candidatesKey,
      count: (prev.key === candidatesKey ? prev.count : 0) + 1,
    }))

  // YouTube는 없는 썸네일에 120x90 회색 이미지를 주는 경우가 있어 다음 후보로 넘김
  const onLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    if (src && /i\.ytimg\.com|img\.youtube\.com/.test(src) && img.naturalWidth > 0 && img.naturalWidth <= 120) {
      skip()
    }
  }

  if (src) {
    return (
      <ThumbnailFramedImage
        key={src}
        src={src}
        alt={work.thumbnail.alt?.trim() || work.title}
        layout={work.thumbnailLayout}
        className="absolute inset-0"
        priority={priority || isCapacitorNative()}
        onError={skip}
        onLoad={onLoad}
      />
    )
  }

  return (
    <div className="absolute inset-0">
      <PlaceholderSvg id={work.id} title={work.title} />
    </div>
  )
}


