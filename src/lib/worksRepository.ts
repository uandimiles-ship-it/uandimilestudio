import {

  collection,

  deleteDoc,

  doc,

  getDocs,

  orderBy,

  query,

  setDoc,

  writeBatch,

  type DocumentData,

} from 'firebase/firestore'

import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'

import { portfolio, type PortfolioWork } from '../content/portfolio'

import {

  defaultThumbnailLayout,

  normalizeThumbnailLayout,

  type ThumbnailLayout,

} from './thumbnailLayout'

import { getFirebaseDb, getFirebaseStorage, isFirebaseConfigured } from './firebase'
import { ensureFirebaseWebSession, formatFirebaseWriteError } from './firebaseSession'
import { patchLocalWorksFromBundle } from './bundleWorksPatch'
import { loadLocalPortfolioWorks, saveLocalPortfolioWorks } from './localPortfolioStore'
import { sanitizeWorkThumbnail } from './thumbnailResolve'
import { isCapacitorNative } from './platform'
import { parseYoutubeVideoId, resolveWorkYoutubeId } from './youtubeLink'

async function beforeAdminWrite(): Promise<void> {
  await ensureFirebaseWebSession()
}

/** Firestore에 없는 작품만 번들로 채움 — 클라우드에 있는 설명·제목은 유지 */
function mergeCloudWithBundledDefaults(cloud: PortfolioWork[]): PortfolioWork[] {
  const byId = new Map(cloud.map((w) => [w.id, w]))
  return portfolio.works.map((b) => byId.get(b.id) ?? b)
}

function wrapWriteError(err: unknown): Error {
  return new Error(formatFirebaseWriteError(err))
}

/** Firestore는 undefined 필드를 거부함 */
function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const out = { ...obj }
  for (const key of Object.keys(out)) {
    if (out[key] === undefined) delete out[key]
  }
  return out
}



export const PORTFOLIO_WORKS_COLLECTION = 'portfolio_works'



export type FirestoreWorkDoc = {

  sortOrder: number

  title: string

  subtitle?: string

  creator?: string

  year?: string

  tags: string[]

  accentColor?: number

  youtubeVideoId: string

  description?: string

  link?: string

  thumbnailUrl?: string

  thumbnailAlt?: string

  thumbnailScale?: number

  thumbnailTranslateX?: number

  thumbnailTranslateY?: number

  /** @deprecated 이전 focal — 읽기만 */
  thumbnailFocalX?: number

  thumbnailFocalY?: number

}



function layoutFromDoc(d: FirestoreWorkDoc): ThumbnailLayout | undefined {
  if (
    d.thumbnailScale == null &&
    d.thumbnailTranslateX == null &&
    d.thumbnailTranslateY == null
  ) {
    return undefined
  }
  return normalizeThumbnailLayout({
    scale: d.thumbnailScale,
    translateX: d.thumbnailTranslateX,
    translateY: d.thumbnailTranslateY,
  })
}



function layoutToDoc(layout?: ThumbnailLayout): Pick<
  FirestoreWorkDoc,
  'thumbnailScale' | 'thumbnailTranslateX' | 'thumbnailTranslateY'
> {
  const L = normalizeThumbnailLayout(layout ?? defaultThumbnailLayout())
  const isDefault = L.scale === 1 && L.translateX === 0 && L.translateY === 0
  if (isDefault) {
    return {}
  }
  return {
    thumbnailScale: L.scale,
    thumbnailTranslateX: L.translateX,
    thumbnailTranslateY: L.translateY,
  }
}



function docToWork(id: string, data: DocumentData): PortfolioWork {

  const d = data as FirestoreWorkDoc

  const storedLink = (d.link ?? '').trim()
  const legacyId = (d.youtubeVideoId ?? '').trim()
  const link =
    storedLink || (legacyId ? `https://youtu.be/${legacyId}` : '')
  const videoId = parseYoutubeVideoId(link) || legacyId

  return {

    id,

    title: d.title ?? '',

    subtitle: d.subtitle,

    creator: d.creator ?? d.subtitle,

    year: d.year,

    accentColor: d.accentColor,

    tags: Array.isArray(d.tags) ? d.tags : [],

    thumbnail: {

      src: d.thumbnailUrl ?? '',

      alt: d.thumbnailAlt ?? d.title ?? '',

    },

    thumbnailLayout: layoutFromDoc(d),

    embed: videoId ? { type: 'youtube', id: videoId } : undefined,

    description: d.description,

    link: link || undefined,

  }

}



function workToDoc(work: PortfolioWork, sortOrder: number): FirestoreWorkDoc {
  const safe = sanitizeWorkThumbnail(work)
  const link = safe.link?.trim() ?? ''
  const videoId = resolveWorkYoutubeId(safe) ?? ''

  return stripUndefined({
    sortOrder,
    title: safe.title,
    subtitle: safe.subtitle,
    creator: safe.creator ?? safe.subtitle,
    year: safe.year,
    tags: safe.tags,
    accentColor: safe.accentColor,
    youtubeVideoId: videoId,
    description: safe.description,
    link: link || undefined,
    thumbnailUrl:
      safe.thumbnail.src.startsWith('http://') || safe.thumbnail.src.startsWith('https://')
        ? safe.thumbnail.src
        : undefined,
    thumbnailAlt: safe.thumbnail.alt || safe.title,
    ...layoutToDoc(safe.thumbnailLayout),
  }) as FirestoreWorkDoc
}



export async function fetchPortfolioWorks(): Promise<{

  works: PortfolioWork[]

  source: 'firestore' | 'local'

}> {

  const deviceWorks = isCapacitorNative() ? loadLocalPortfolioWorks() : null
  if (deviceWorks && deviceWorks.length > 0) {
    const patched = patchLocalWorksFromBundle(deviceWorks)
    return { works: patched, source: 'local' }
  }

  if (!isFirebaseConfigured()) {
    return { works: portfolio.works, source: 'local' }
  }

  try {
    const db = getFirebaseDb()
    const snap = await getDocs(
      query(collection(db, PORTFOLIO_WORKS_COLLECTION), orderBy('sortOrder', 'asc')),
    )
    if (snap.empty) {
      return { works: portfolio.works, source: 'local' }
    }
    const works = snap.docs.map((d) => docToWork(d.id, d.data()))
    const merged = mergeCloudWithBundledDefaults(works)
    return { works: patchLocalWorksFromBundle(merged), source: 'firestore' }
  } catch (err) {
    console.warn('Firestore 작품 로드 실패, 로컬 폴백 사용', err)
    return { works: portfolio.works, source: 'local' }
  }

}

/** 관리자 — 항상 이 기기에 먼저 저장 (나우 AI 앱 로컬 편집과 동일) */
export function savePortfolioWorksOnDevice(works: PortfolioWork[]): void {
  saveLocalPortfolioWorks(works)
}

/** Firestore 전체 동기화 (실패해도 기기 저장은 유지) */
export async function syncPortfolioWorksToCloud(works: PortfolioWork[]): Promise<void> {
  if (!isFirebaseConfigured()) return
  try {
    await beforeAdminWrite()
    const db = getFirebaseDb()
    const batch = writeBatch(db)
    works.forEach((work, index) => {
      batch.set(doc(db, PORTFOLIO_WORKS_COLLECTION, work.id), workToDoc(work, index), {
        merge: true,
      })
    })
    await batch.commit()
  } catch (err) {
    throw wrapWriteError(err)
  }
}

export async function removePortfolioWorkFromCloud(workId: string): Promise<void> {
  if (!isFirebaseConfigured()) return
  try {
    await beforeAdminWrite()
    const db = getFirebaseDb()
    await deleteDoc(doc(db, PORTFOLIO_WORKS_COLLECTION, workId))
  } catch (err) {
    throw wrapWriteError(err)
  }
}



export async function savePortfolioWork(

  work: PortfolioWork,

  sortOrder: number,

): Promise<void> {

  try {
    await beforeAdminWrite()
    const db = getFirebaseDb()
    await setDoc(doc(db, PORTFOLIO_WORKS_COLLECTION, work.id), workToDoc(work, sortOrder), {
      merge: true,
    })
  } catch (err) {
    throw wrapWriteError(err)
  }

}



export async function persistPortfolioWorksOrder(works: PortfolioWork[]): Promise<void> {

  try {
    await beforeAdminWrite()
    const db = getFirebaseDb()
    const batch = writeBatch(db)
    works.forEach((work, index) => {
      batch.set(doc(db, PORTFOLIO_WORKS_COLLECTION, work.id), workToDoc(work, index), {
        merge: true,
      })
    })
    await batch.commit()
  } catch (err) {
    throw wrapWriteError(err)
  }

}



export async function deletePortfolioWork(workId: string): Promise<void> {

  try {
    await beforeAdminWrite()
    const db = getFirebaseDb()
    await deleteDoc(doc(db, PORTFOLIO_WORKS_COLLECTION, workId))
  } catch (err) {
    throw wrapWriteError(err)
  }

}



export async function seedPortfolioFromLocal(): Promise<number> {

  try {
    await beforeAdminWrite()
    const db = getFirebaseDb()
    const batch = writeBatch(db)
    portfolio.works.forEach((work, index) => {
      batch.set(doc(db, PORTFOLIO_WORKS_COLLECTION, work.id), workToDoc(work, index))
    })
    await batch.commit()
    return portfolio.works.length
  } catch (err) {
    throw wrapWriteError(err)
  }

}



export async function uploadWorkThumbnail(

  workId: string,

  file: File,

): Promise<string> {

  const storage = getFirebaseStorage()

  const path = `portfolio_thumbnails/${workId}/${file.name}`

  try {
    await beforeAdminWrite()
    const storageRef = ref(storage, path)
    const uploadTask = uploadBytes(storageRef, file, {
      contentType: file.type || 'image/jpeg',
    })
    await Promise.race([
      uploadTask,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Storage 업로드 시간 초과 (25초)')), 25_000),
      ),
    ])
    return getDownloadURL(storageRef)
  } catch (err) {
    throw wrapWriteError(err)
  }

}


