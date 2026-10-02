import { useState } from 'react'

import type { PortfolioWork } from '../content/portfolio'

import { resolveWorkThumbnailSrc } from '../lib/thumbnailResolve'

import { youtubeThumbnailUrl } from '../lib/youtubeLink'

import { ThumbnailFramedImage } from './ThumbnailFramedImage'



const placeholderConfigs: Record<

  string,

  { bg1: string; bg2: string; accent: string; label: string; sub: string }

> = {

  'work-1': { bg1: '#ffffff', bg2: '#f4f4f5', accent: '#111111', label: 'U&I', sub: 'STUDIO' },

  'work-2': { bg1: '#ffffff', bg2: '#f4f4f5', accent: '#111111', label: 'U&I', sub: 'BRAND ADS' },

  'work-3': { bg1: '#ffffff', bg2: '#f4f4f5', accent: '#111111', label: 'U&I', sub: 'EVENT' },

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



export function WorkThumbnail({ work }: { work: PortfolioWork }) {

  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  const primary = resolveWorkThumbnailSrc(work)

  const ytFallback = youtubeThumbnailUrl(work)



  let src = primary

  if (src && failedSrc === src) {

    src = ytFallback && failedSrc !== ytFallback ? ytFallback : null

  }

  if (src && failedSrc === src) src = null



  if (src) {

    return (

      <ThumbnailFramedImage

        src={src}

        alt={work.thumbnail.alt || work.title}

        layout={work.thumbnailLayout}

        className="h-full w-full"

        onError={() => setFailedSrc(src)}

      />

    )

  }

  return <PlaceholderSvg id={work.id} title={work.title} />

}


