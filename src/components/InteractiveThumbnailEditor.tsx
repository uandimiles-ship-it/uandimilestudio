import { useCallback, useEffect, useRef, useState } from 'react'
import { ThumbnailFramedImage } from './ThumbnailFramedImage'
import {
  defaultThumbnailLayout,
  isDefaultThumbnailLayout,
  normalizeThumbnailLayout,
  scaleThumbnailAroundCenter,
  THUMB_MAX_SCALE,
  THUMB_MIN_SCALE,
  type ThumbnailLayout,
} from '../lib/thumbnailLayout'

type Props = {
  customSrc: string
  youtubePreviewSrc?: string
  hasUploadedImage?: boolean
  layout: ThumbnailLayout | undefined
  onLayoutChange: (layout: ThumbnailLayout) => void
  onPickFile: (file: File) => void
  onClearImage: () => void
  busy?: boolean
}

/** now_baduk InteractiveImageLayoutEditor — 드래그·핀치·슬라이더 (가로/세로 분리 없음) */
export function InteractiveThumbnailEditor({
  customSrc,
  youtubePreviewSrc,
  hasUploadedImage,
  layout,
  onLayoutChange,
  onPickFile,
  onClearImage,
  busy,
}: Props) {
  const external = normalizeThumbnailLayout(layout ?? defaultThumbnailLayout())
  const [editLayout, setEditLayout] = useState(external)
  const editLayoutRef = useRef(external)
  const dragging = useRef(false)
  const boxRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ x: number; y: number; layout: ThumbnailLayout } | null>(null)
  const pinchRef = useRef<{ dist: number; layout: ThumbnailLayout } | null>(null)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (dragging.current) return
    setEditLayout(external)
  }, [customSrc, external.scale, external.translateX, external.translateY])

  const commit = useCallback(
    (next: ThumbnailLayout) => {
      const n = normalizeThumbnailLayout(next)
      editLayoutRef.current = n
      setEditLayout(n)
      onLayoutChange(n)
    },
    [onLayoutChange],
  )

  function setLocalLayout(next: ThumbnailLayout) {
    const n = normalizeThumbnailLayout(next)
    editLayoutRef.current = n
    setEditLayout(n)
  }

  const boxSize = useCallback(() => {
    const r = boxRef.current?.getBoundingClientRect()
    return { w: r?.width ?? 1, h: r?.height ?? 1 }
  }, [])

  function onSliderScale(value: number) {
    const { w, h } = boxSize()
    commit(scaleThumbnailAroundCenter(editLayout, value, w, h))
  }

  function onPointerDown(e: React.PointerEvent) {
    if (!customSrc || busy) return
    dragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 1) {
      dragRef.current = { x: e.clientX, y: e.clientY, layout: editLayout }
    } else if (pointers.current.size === 2) {
      dragRef.current = null
      const pts = [...pointers.current.values()]
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
      pinchRef.current = { dist, layout: editLayout }
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!customSrc || busy) return
    if (pointers.current.has(e.pointerId)) {
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    }
    const { w, h } = boxSize()

    if (pointers.current.size >= 2 && pinchRef.current) {
      const pts = [...pointers.current.values()]
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
      const ratio = dist / pinchRef.current.dist
      const base = pinchRef.current.layout
      const nextScale = clamp(base.scale * ratio, THUMB_MIN_SCALE, THUMB_MAX_SCALE)
      setLocalLayout(scaleThumbnailAroundCenter(base, nextScale, w, h))
      return
    }

    const drag = dragRef.current
    if (!drag) return
    const dx = e.clientX - drag.x
    const dy = e.clientY - drag.y
    setLocalLayout({
      ...drag.layout,
      translateX: drag.layout.translateX + dx / w,
      translateY: drag.layout.translateY + dy / h,
    })
  }

  function endGesture(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId)
    if (pointers.current.size < 2) pinchRef.current = null
    if (pointers.current.size === 0) {
      dragRef.current = null
      dragging.current = false
      commit(editLayoutRef.current)
    }
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* noop */
    }
  }

  function onWheel(e: React.WheelEvent) {
    if (!customSrc || busy) return
    e.preventDefault()
    const delta = -e.deltaY * 0.002
    const next = clamp(editLayout.scale * (1 + delta), THUMB_MIN_SCALE, THUMB_MAX_SCALE)
    onSliderScale(next)
  }

  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const prevent = (ev: WheelEvent) => {
      if (customSrc) ev.preventDefault()
    }
    el.addEventListener('wheel', prevent, { passive: false })
    return () => el.removeEventListener('wheel', prevent)
  }, [customSrc])

  const canEdit = Boolean(customSrc)
  const L = editLayout

  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-zinc-900/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium text-white/80">썸네일 (16:10)</span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/90 hover:bg-white/10 disabled:opacity-50"
          >
            이미지 선택
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/*"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onPickFile(f)
              e.target.value = ''
            }}
          />
          {hasUploadedImage ? (
            <button
              type="button"
              disabled={busy}
              onClick={onClearImage}
              className="rounded-full border border-red-500/40 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10 disabled:opacity-40"
            >
              업로드 이미지 삭제
            </button>
          ) : null}
          <button
            type="button"
            disabled={busy || !canEdit}
            onClick={() => commit(defaultThumbnailLayout())}
            className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/60 hover:bg-white/5 disabled:opacity-40"
          >
            초기화
          </button>
        </div>
      </div>

      <div
        ref={boxRef}
        className={`relative aspect-video w-full overflow-hidden rounded-xl border border-amber-500/30 bg-black touch-none ${canEdit ? 'cursor-grab active:cursor-grabbing' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endGesture}
        onPointerCancel={endGesture}
        onWheel={onWheel}
      >
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(251,191,36,.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(251,191,36,.25) 1px, transparent 1px)',
            backgroundSize: '20% 20%',
          }}
        />
        {customSrc ? (
          <ThumbnailFramedImage
            src={customSrc}
            layout={L}
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <div className="grid h-full place-items-center px-4 text-center text-xs text-white/45">
            이미지를 선택한 뒤, 손가락으로 드래그·핀치(또는 마우스 휠)로 맞춥니다.
          </div>
        )}
      </div>

      {!canEdit && youtubePreviewSrc ? (
        <div className="rounded-xl border border-white/10 bg-black/30 p-3">
          <p className="mb-2 text-[11px] text-white/50">유튜브 기본 썸네일 (참고)</p>
          <div className="aspect-video overflow-hidden rounded-lg bg-zinc-950">
            <img src={youtubePreviewSrc} alt="" className="h-full w-full object-contain" />
          </div>
        </div>
      ) : null}

      {canEdit ? (
        <>
          <p className="text-center text-base font-extrabold text-amber-400/90">
            {(L.scale * 100).toFixed(0)}%
          </p>
          <input
            type="range"
            min={THUMB_MIN_SCALE}
            max={THUMB_MAX_SCALE}
            step={0.02}
            value={L.scale}
            disabled={busy}
            className="w-full accent-amber-500"
            onChange={(e) => onSliderScale(Number(e.target.value))}
          />
          <p className="text-right text-[11px] text-white/50">
            드래그 이동 · 핀치/휠·슬라이더 확대
          </p>
        </>
      ) : null}

      {canEdit && !isDefaultThumbnailLayout(L) ? (
        <p className="text-[11px] text-amber-200/80">맞춘 뒤 반드시 아래 「저장」을 눌러 주세요.</p>
      ) : null}
    </div>
  )
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}
