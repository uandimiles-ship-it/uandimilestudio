import { portfolio, type PortfolioWork } from '../content/portfolio'

import { loadLocalPortfolioWorks, saveLocalPortfolioWorks } from './localPortfolioStore'



/** 앱 업데이트 시 기기 localStorage 작품 메타를 기본값으로 맞춤 (증가 시 1회 패치) */

export const WORKS_BUNDLE_REVISION = 8

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



function needsWorkPatch(

  id: string,

  stale: PortfolioWork | undefined,

  bundled: PortfolioWork,

  needsRev: boolean,

): boolean {

  if (needsRev) return true

  if (!stale) return true

  if ((stale.thumbnail.src ?? '') !== bundled.thumbnail.src) return true

  if (stale.embed?.id !== bundled.embed?.id) return true

  if (stale.link !== bundled.link) return true

  if (stale.title !== bundled.title) return true

  if (stale.year !== bundled.year) return true

  if ((stale.thumbnail.src?.startsWith('blob:') ?? false) || (stale.thumbnail.src?.includes('data:image') ?? false)) {

    return true

  }



  if (id === 'work-1') {

    const hasOldTag = stale.tags.some((t) => t.includes('7브랜'))

    return (

      hasOldTag ||

      (stale.description?.includes('youtu.be') ?? false) ||

      (stale.description?.includes('제작 ·') ?? false) ||

      (stale.thumbnail.src?.endsWith('.svg') ?? false)

    )

  }



  if (id === 'work-2') {
    return (
      stale.embed?.id === 'ogRnN_z5wSQ' ||
      stale.title.includes('NOW Music') ||
      !(stale.thumbnail.src ?? '').includes('work-2-uandi-studio')
    )
  }



  if (id === 'work-3') {

    return (

      stale.embed?.id === 'V1w2L2wLTcc' ||

      stale.title.includes('나우 AI') ||

      !(stale.thumbnail.src ?? '').includes('work-3-uandi-studio')

    )

  }



  return false

}



export function patchLocalWorksFromBundle(works: PortfolioWork[]): PortfolioWork[] {

  const rev = Number.parseInt(localStorage.getItem(REV_KEY) ?? '0', 10)

  const needsRev = rev < WORKS_BUNDLE_REVISION



  let patched = [...works]

  let anyPatch = false



  for (const id of PATCHED_WORK_IDS) {

    const bundled = bundledWork(id)

    if (!bundled) continue



    const stale = patched.find((w) => w.id === id)

    if (!needsWorkPatch(id, stale, bundled, needsRev)) continue



    const next: PortfolioWork = {
      ...bundled,
      description: stale?.description?.trim() ? stale.description : bundled.description,
      tags: stale?.tags?.length ? stale.tags : bundled.tags,
      title: stale?.title?.trim() ? stale.title : bundled.title,
      creator: stale?.creator?.trim() ? stale.creator : bundled.creator,
      subtitle: stale?.subtitle?.trim() ? stale.subtitle : bundled.subtitle,
      year: stale?.year ?? bundled.year,
      thumbnailLayout: stale?.thumbnailLayout ?? bundled.thumbnailLayout,
    }

    const idx = patched.findIndex((w) => w.id === id)

    if (idx >= 0) patched[idx] = next

    else patched.push(next)

    anyPatch = true

  }



  if (anyPatch || needsRev) {

    localStorage.setItem(REV_KEY, String(WORKS_BUNDLE_REVISION))

    saveLocalPortfolioWorks(patched)

  }



  return patched

}



export function ensureLocalWorksPatched(): void {

  const local = loadLocalPortfolioWorks()

  if (!local?.length) return

  patchLocalWorksFromBundle(local)

}


