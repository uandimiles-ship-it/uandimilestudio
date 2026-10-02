import type { CSSProperties } from 'react'

/** now_baduk CharacterImageLayout — 드래그·핀치·슬라이더 확대 */
export type ThumbnailLayout = {
  scale: number
  translateX: number
  translateY: number
}

export const THUMB_MIN_SCALE = 1
export const THUMB_MAX_SCALE = 5

export function defaultThumbnailLayout(): ThumbnailLayout {
  return { scale: 1, translateX: 0, translateY: 0 }
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

export function normalizeThumbnailLayout(
  raw?: Partial<ThumbnailLayout> | null,
): ThumbnailLayout {
  return {
    scale: clamp(raw?.scale ?? 1, THUMB_MIN_SCALE, THUMB_MAX_SCALE),
    translateX: clamp(raw?.translateX ?? 0, -2, 2),
    translateY: clamp(raw?.translateY ?? 0, -2, 2),
  }
}

export function isDefaultThumbnailLayout(layout?: ThumbnailLayout | null): boolean {
  const L = normalizeThumbnailLayout(layout)
  return L.scale === 1 && L.translateX === 0 && L.translateY === 0
}

/** now_baduk CharacterImageLayout.matrixForBox — focal 0.5 고정 */
export function thumbnailInnerStyle(
  layout: ThumbnailLayout,
  boxWidth: number,
  boxHeight: number,
): CSSProperties {
  const L = normalizeThumbnailLayout(layout)
  const w = boxWidth
  const h = boxHeight
  let transform: string
  if (L.translateX === 0 && L.translateY === 0) {
    const cx = w / 2
    const cy = h / 2
    const offsetX = 0
    const offsetY = 0
    transform = `translate(${cx + offsetX}px, ${cy + offsetY}px) scale(${L.scale}) translate(${-cx}px, ${-cy}px)`
  } else {
    const tx = L.translateX * w
    const ty = L.translateY * h
    transform = `translate(${tx}px, ${ty}px) scale(${L.scale})`
  }
  return {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    transform,
    transformOrigin: '0 0',
    willChange: 'transform',
  }
}

/** 슬라이더·핀치 — 박스 중심 기준 확대 (InteractiveViewer 슬라이더와 동일) */
export function scaleThumbnailAroundCenter(
  layout: ThumbnailLayout,
  nextScale: number,
  boxWidth: number,
  boxHeight: number,
): ThumbnailLayout {
  const L = normalizeThumbnailLayout(layout)
  const w = boxWidth
  const h = boxHeight
  const factor = nextScale / L.scale
  const cx = w / 2
  const cy = h / 2
  const tx = L.translateX * w
  const ty = L.translateY * h
  const newTx = cx - factor * (cx - tx)
  const newTy = cy - factor * (cy - ty)
  return normalizeThumbnailLayout({
    scale: nextScale,
    translateX: newTx / w,
    translateY: newTy / h,
  })
}
