import { portfolio, type PortfolioWork } from '../content/portfolio'

import { loadLocalPortfolioWorks, saveLocalPortfolioWorks } from './localPortfolioStore'

/** 앱 업데이트 시 기기 캐시의 깨진/누락 항목만 보충 (증가 시 1회 플래그) */
export const WORKS_BUNDLE_REVISION = 14

const REV_KEY = 'uandimilestudio_works_bundle_rev'

const PATCHED_WORK_IDS = [
  'work-1',
  'work-2',
  'work-3',
  'work-4',
  'work-5',
  'work-6',
  'work-7',
  'work-8',
  'work-9',
  'work-10',
  'work-11',
] as const

function bundledWork(id: string): PortfolioWork | undefined {
  return portfolio.works.find((w) => w.id === id)
}

function isBrokenThumbnailSrc(src: string): boolean {
  return src.startsWith('blob:') || src.includes('data:image')
}

function isLegacyEmbed(id: string, stale: PortfolioWork): boolean {
  if (id === 'work-2') return stale.embed?.id === 'ogRnN_z5wSQ'
  if (id === 'work-3') return stale.embed?.id === 'V1w2L2wLTcc'
  return false
}

export type PatchLocalWorksOptions = {
  /** false면 메모리만 패치 (localStorage·이벤트 없음) */
  persistToDevice?: boolean
}

/**
 * 관리자가 저장한 썸네일·유튜브 주소·크기(레이아웃)는 덮어쓰지 않음.
 * 빠진 작품 추가, blob/data URL 썸네일 복구, 알려진 옛 영상 ID만 교정.
 */
export function patchLocalWorksFromBundle(
  works: PortfolioWork[],
  options?: PatchLocalWorksOptions,
): PortfolioWork[] {
  const persistToDevice = options?.persistToDevice ?? true
  const rev = Number.parseInt(localStorage.getItem(REV_KEY) ?? '0', 10)
  const needsRev = rev < WORKS_BUNDLE_REVISION

  let patched = [...works]
  let anyPatch = false

  for (const id of PATCHED_WORK_IDS) {
    const bundled = bundledWork(id)
    if (!bundled) continue

    const stale = patched.find((w) => w.id === id)
    if (!stale) {
      patched.push(bundled)
      anyPatch = true
      continue
    }

    const src = stale.thumbnail.src ?? ''
    const brokenThumb = isBrokenThumbnailSrc(src)
    const legacyEmbed = isLegacyEmbed(id, stale)
    if (!brokenThumb && !legacyEmbed) continue

    const next: PortfolioWork = {
      ...stale,
      thumbnail: brokenThumb ? bundled.thumbnail : stale.thumbnail,
      ...(legacyEmbed ? { embed: bundled.embed, link: bundled.link ?? stale.link } : {}),
    }
    const idx = patched.findIndex((w) => w.id === id)
    patched[idx] = next
    anyPatch = true
  }

  if (anyPatch || needsRev) {
    localStorage.setItem(REV_KEY, String(WORKS_BUNDLE_REVISION))
    if (persistToDevice) {
      saveLocalPortfolioWorks(patched, { notify: false })
    }
  }

  return patched
}

export function ensureLocalWorksPatched(): void {
  const local = loadLocalPortfolioWorks()
  if (!local?.length) return
  patchLocalWorksFromBundle(local)
}
