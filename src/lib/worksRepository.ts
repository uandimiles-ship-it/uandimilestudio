import {
  collection,
  deleteDoc,
  deleteField,
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
} from './thumbnailLayout'
import { getFirebaseDb, getFirebaseStorage, isFirebaseConfigured } from './firebase'
import { ensureFirebaseWebSession, formatFirebaseWriteError } from './firebaseSession'
import { patchLocalWorksFromBundle } from './bundleWorksPatch'
import { loadLocalPortfolioWorks, saveLocalPortfolioWorks } from './localPortfolioStore'
import { sanitizeWorkThumbnail } from './thumbnailResolve'
import { applyWebHeroCardDisplayPolicy } from './webHeroWarmup'
import { parseYoutubeVideoId, resolveWorkYoutubeId } from './youtubeLink'

async function beforeAdminWrite(): Promise<void> {
  await ensureFirebaseWebSession()
}

function finalizeWorksForClient(works: PortfolioWork[]): PortfolioWork[] {
  return applyWebHeroCardDisplayPolicy(works)
}

/** 클라우드에 없는 작품만 번들로 보충. 썸네일·유튜브·크기는 클라우드 값을 유지하고, 관리자가 추가한 작품도 버리지 않음 */
function mergeCloudWithBundledDefaults(cloud: PortfolioWork[]): PortfolioWork[] {
  const cloudIds = new Set(cloud.map((w) => w.id))
  const missing = portfolio.works.filter((b) => !cloudIds.has(b.id))
  return [...cloud, ...missing]
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

function layoutFromDoc(d: FirestoreWorkDoc) {
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

function isPersistableCloudThumbnail(src: string): boolean {
  return (
    src.startsWith('http://') ||
    src.startsWith('https://') ||
    src.startsWith('/thumbnails/')
  )
}

function workToDoc(
  work: PortfolioWork,
  sortOrder: number,
  options?: { mergeDeletes?: boolean },
): DocumentData {
  const safe = sanitizeWorkThumbnail(work)
  const link = safe.link?.trim() ?? ''
  const videoId = resolveWorkYoutubeId(safe) ?? ''
  const src = safe.thumbnail.src?.trim() ?? ''
  const L = normalizeThumbnailLayout(safe.thumbnailLayout ?? defaultThumbnailLayout())
  const isDefault = L.scale === 1 && L.translateX === 0 && L.translateY === 0
  const mergeDeletes = options?.mergeDeletes === true

  const data: Record<string, unknown> = stripUndefined({
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
    thumbnailAlt: safe.thumbnail.alt || safe.title,
  })

  if (isPersistableCloudThumbnail(src)) {
    data.thumbnailUrl = src
  } else if (mergeDeletes) {
    data.thumbnailUrl = deleteField()
  }

  if (isDefault) {
    if (mergeDeletes) {
      data.thumbnailScale = deleteField()
      data.thumbnailTranslateX = deleteField()
      data.thumbnailTranslateY = deleteField()
    }
  } else {
    data.thumbnailScale = L.scale
    data.thumbnailTranslateX = L.translateX
    data.thumbnailTranslateY = L.translateY
  }

  return data
}

function docToWork(id: string, data: DocumentData): PortfolioWork {
  const d = data as FirestoreWorkDoc
  const storedLink = (d.link ?? '').trim()
  const legacyId = (d.youtubeVideoId ?? '').trim()
  const link = storedLink || (legacyId ? `https://youtu.be/${legacyId}` : '')
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

/** 첫 페인트용 — Firestore 대기 없이 번들·기기 캐시로 카드 깜빡임 방지 */
export function getSyncPortfolioWorks(): PortfolioWork[] {
  const deviceWorks = loadLocalPortfolioWorks()
  if (deviceWorks && deviceWorks.length > 0) {
    return finalizeWorksForClient(
      patchLocalWorksFromBundle(deviceWorks, { persistToDevice: false }),
    )
  }
  return finalizeWorksForClient(portfolio.works)
}

export async function fetchPortfolioWorks(): Promise<{
  works: PortfolioWork[]
  source: 'firestore' | 'local'
}> {
  const localWorks = loadLocalPortfolioWorks()

  if (!isFirebaseConfigured()) {
    const works = finalizeWorksForClient(
      localWorks?.length
        ? patchLocalWorksFromBundle(localWorks, { persistToDevice: false })
        : portfolio.works,
    )
    return { works, source: 'local' }
  }

  try {
    const db = getFirebaseDb()
    const snap = await getDocs(
      query(collection(db, PORTFOLIO_WORKS_COLLECTION), orderBy('sortOrder', 'asc')),
    )
    if (snap.empty) {
      const works = finalizeWorksForClient(
        localWorks?.length
          ? patchLocalWorksFromBundle(localWorks, { persistToDevice: false })
          : portfolio.works,
      )
      return { works, source: 'local' }
    }
    const cloudWorks = snap.docs.map((d) => docToWork(d.id, d.data()))
    const merged = mergeCloudWithBundledDefaults(cloudWorks)
    const works = finalizeWorksForClient(merged)
    saveLocalPortfolioWorks(works, { notify: false })
    return { works, source: 'firestore' }
  } catch (err) {
    console.warn('Firestore 작품 로드 실패, 로컬 폴백 사용', err)
    const works = finalizeWorksForClient(
      localWorks?.length
        ? patchLocalWorksFromBundle(localWorks, { persistToDevice: false })
        : portfolio.works,
    )
    return { works, source: 'local' }
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
      batch.set(doc(db, PORTFOLIO_WORKS_COLLECTION, work.id), workToDoc(work, index, { mergeDeletes: true }), {
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
    await setDoc(doc(db, PORTFOLIO_WORKS_COLLECTION, work.id), workToDoc(work, sortOrder, { mergeDeletes: true }), {
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
      batch.set(doc(db, PORTFOLIO_WORKS_COLLECTION, work.id), workToDoc(work, index, { mergeDeletes: true }), {
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
