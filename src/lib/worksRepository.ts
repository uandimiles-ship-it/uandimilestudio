import {
  collection,
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
import { getFirebaseDb, getFirebaseStorage, isFirebaseConfigured } from './firebase'

export const PORTFOLIO_WORKS_COLLECTION = 'portfolio_works'

export type FirestoreWorkDoc = {
  sortOrder: number
  title: string
  subtitle?: string
  year?: string
  tags: string[]
  youtubeVideoId: string
  description?: string
  link?: string
  thumbnailUrl?: string
  thumbnailAlt?: string
}

function docToWork(id: string, data: DocumentData): PortfolioWork {
  const d = data as FirestoreWorkDoc
  const videoId = d.youtubeVideoId ?? ''
  return {
    id,
    title: d.title ?? '',
    subtitle: d.subtitle,
    year: d.year,
    tags: Array.isArray(d.tags) ? d.tags : [],
    thumbnail: {
      src: d.thumbnailUrl ?? '',
      alt: d.thumbnailAlt ?? d.title ?? '',
    },
    embed: videoId ? { type: 'youtube', id: videoId } : undefined,
    description: d.description,
    link: d.link ?? (videoId ? `https://youtu.be/${videoId}` : undefined),
  }
}

function workToDoc(work: PortfolioWork, sortOrder: number): FirestoreWorkDoc {
  return {
    sortOrder,
    title: work.title,
    subtitle: work.subtitle,
    year: work.year,
    tags: work.tags,
    youtubeVideoId: work.embed?.id ?? '',
    description: work.description,
    link: work.link,
    thumbnailUrl: work.thumbnail.src || undefined,
    thumbnailAlt: work.thumbnail.alt || work.title,
  }
}

export async function fetchPortfolioWorks(): Promise<{
  works: PortfolioWork[]
  source: 'firestore' | 'local'
}> {
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
    return { works, source: 'firestore' }
  } catch (err) {
    console.warn('Firestore 작품 로드 실패, 로컬 폴백 사용', err)
    return { works: portfolio.works, source: 'local' }
  }
}

export async function savePortfolioWork(
  work: PortfolioWork,
  sortOrder: number,
): Promise<void> {
  const db = getFirebaseDb()
  await setDoc(doc(db, PORTFOLIO_WORKS_COLLECTION, work.id), workToDoc(work, sortOrder), {
    merge: true,
  })
}

export async function seedPortfolioFromLocal(): Promise<number> {
  const db = getFirebaseDb()
  const batch = writeBatch(db)
  portfolio.works.forEach((work, index) => {
    batch.set(doc(db, PORTFOLIO_WORKS_COLLECTION, work.id), workToDoc(work, index))
  })
  await batch.commit()
  return portfolio.works.length
}

export async function uploadWorkThumbnail(
  workId: string,
  file: File,
): Promise<string> {
  const storage = getFirebaseStorage()
  const path = `portfolio_thumbnails/${workId}/${file.name}`
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file, { contentType: file.type })
  return getDownloadURL(storageRef)
}
