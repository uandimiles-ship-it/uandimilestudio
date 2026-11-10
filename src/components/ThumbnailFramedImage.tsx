import { useEffect, useLayoutEffect, useRef, useState } from 'react'
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
  priority?: boolean
  onError?: () => void
  onLoad?: () => void
}

/** 포트폴리오 카드 — 기본 레이아웃은 단순 contain (ResizeObserver 없음) */
export function ThumbnailFramedImage({
  src,
  alt = '',
  layout,
  className = '',
  priority = false,
  onError,
  onLoad,
}: Props) {
  const L = normalizeThumbnailLayout(layout ?? defaultThumbnailLayout())
  const useSimpleContain = isDefaultThumbnailLayout(layout)
  const boxRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  const measure = () => {
    const el = boxRef.current
    if (!el) return
    const { width, height } = el.getBoundingClientRect()
    if (width > 0 && height > 0) {
      setSize({ w: width, h: height })
    }
  }

  useLayoutEffect(() => {
    if (useSimpleContain) return
    measure()
  }, [useSimpleContain, src, L.scale, L.translateX, L.translateY])

  useEffect(() => {
    if (useSimpleContain) return
    const el = boxRef.current
    if (!el) return
    const ro = new ResizeObserver(() => measure())
    ro.observe(el)
    return () => ro.disconnect()
  }, [useSimpleContain])

  const rootClass = `absolute inset-0 overflow-hidden bg-zinc-950 ${className}`
  const imgLoading = priority ? 'eager' : 'lazy'
  const imgFetch = priority ? ({ fetchPriority: 'high' } as const) : {}

  if (useSimpleContain) {
    return (
      <div className={rootClass}>
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="h-full w-full object-contain"
          loading={imgLoading}
          decoding={priority ? 'sync' : 'async'}
          onError={onError}
          onLoad={onLoad}
          {...imgFetch}
        />
      </div>
    )
  }

  const sized = size.w > 0 && size.h > 0

  return (
    <div ref={boxRef} className={rootClass}>
      {sized ? (
        <div className="absolute inset-0 overflow-hidden">
          <div style={thumbnailInnerStyle(L, size.w, size.h)}>
            <img
              src={src}
              alt={alt}
              draggable={false}
              className="h-full w-full object-cover"
              loading={imgLoading}
              decoding={priority ? 'sync' : 'async'}
              onError={onError}
              onLoad={onLoad}
              {...imgFetch}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
