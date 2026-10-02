import { useEffect, useRef, useState } from 'react'
import {
  defaultThumbnailLayout,
  isDefaultThumbnailLayout,
  normalizeThumbnailLayout,
  thumbnailInnerStyle,
  type ThumbnailLayout,
} from '../lib/thumbnailLayout'

type Props = {
  src: string
  alt?: string
  layout?: ThumbnailLayout | null
  className?: string
  onError?: () => void
}

/** 포트폴리오 카드 — 관리자 편집과 동일 행렬 */
export function ThumbnailFramedImage({
  src,
  alt = '',
  layout,
  className = '',
  onError,
}: Props) {
  const L = normalizeThumbnailLayout(layout ?? defaultThumbnailLayout())
  const useContain = isDefaultThumbnailLayout(layout)
  const imgFit = useContain ? 'object-contain' : 'object-cover'
  const boxRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ w: width, h: height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const sized = size.w > 0 && size.h > 0

  return (
    <div
      ref={boxRef}
      className={`relative overflow-hidden bg-zinc-950 ${className}`}
    >
      {sized ? (
        <div style={thumbnailInnerStyle(L, size.w, size.h)}>
          <img
            src={src}
            alt={alt}
            draggable={false}
            className={`h-full w-full ${imgFit}`}
            loading="lazy"
            onError={onError}
          />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          draggable={false}
          className={`h-full w-full ${imgFit}`}
          loading="lazy"
          onError={onError}
        />
      )}
    </div>
  )
}
