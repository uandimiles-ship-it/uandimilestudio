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

/** 포트폴리오 카드 — 기본 레이아웃은 단순 contain (ResizeObserver 없음) */
export function ThumbnailFramedImage({
  src,
  alt = '',
  layout,
  className = '',
  onError,
}: Props) {
  const L = normalizeThumbnailLayout(layout ?? defaultThumbnailLayout())
  const useSimpleContain = isDefaultThumbnailLayout(layout)
  const boxRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    if (useSimpleContain) return
    const el = boxRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) {
        setSize({ w: width, h: height })
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [useSimpleContain])

  const rootClass = `relative h-full w-full overflow-hidden bg-zinc-950 ${className}`

  if (useSimpleContain) {
    return (
      <div className={rootClass}>
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="h-full w-full object-contain"
          loading="lazy"
          onError={onError}
        />
      </div>
    )
  }

  const sized = size.w > 0 && size.h > 0

  return (
    <div ref={boxRef} className={rootClass}>
      <div className="absolute inset-0">
        {sized ? (
          <div style={thumbnailInnerStyle(L, size.w, size.h)}>
            <img
              src={src}
              alt={alt}
              draggable={false}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={onError}
            />
          </div>
        ) : (
          <img
            src={src}
            alt={alt}
            draggable={false}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={onError}
          />
        )}
      </div>
    </div>
  )
}
