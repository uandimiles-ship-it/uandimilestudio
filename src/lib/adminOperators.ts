import { doc, getDoc, setDoc } from 'firebase/firestore'
import { isOwnerEmail } from './adminEmails'
import { getFirebaseDb } from './firebase'
import { ensureFirebaseWebSession } from './firebaseSession'

const CACHE_KEY = 'uandimilestudio_operator_emails_v1'

/** 기존 공개 읽기·소유자 쓰기 규칙이 있는 문서. 규칙을 바꾸지 않음 */
export const OPERATORS_COLLECTION = 'portfolio_profile'
export const OPERATORS_DOC_ID = 'operators'

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function loadCachedOperatorEmails(): string[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed)
      ? parsed.map((e) => normalizeEmail(String(e))).filter(Boolean)
      : []
  } catch {
    return []
  }
}

export function isCachedOperatorEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return loadCachedOperatorEmails().includes(normalizeEmail(email))
}

function saveCachedOperatorEmails(emails: string[]) {
  const unique = [...new Set(emails.map(normalizeEmail).filter(Boolean))]
  localStorage.setItem(CACHE_KEY, JSON.stringify(unique))
}

export function rememberOperatorEmail(email: string) {
  const n = normalizeEmail(email)
  if (!n) return
  saveCachedOperatorEmails([...loadCachedOperatorEmails(), n])
}

export function forgetOperatorEmail(email: string) {
  const n = normalizeEmail(email)
  saveCachedOperatorEmails(loadCachedOperatorEmails().filter((e) => e !== n))
}

/** 공개 홈 로드에서 서버를 치지 않음. 소유자 또는 이 기기에 확인된 운영자만 true */
export function isClientAdminEmail(email: string | null | undefined): boolean {
  return isOwnerEmail(email) || isCachedOperatorEmail(email)
}

/**
 * 관리자 진입 시에만 호출.
 * 소유자는 서버 조회 없이 통과. 그 외만 operators 문서 1건을 읽는다.
 */
export async function verifyAdminAccess(email: string | null | undefined): Promise<boolean> {
  if (!email) return false
  if (isOwnerEmail(email)) return true
  const emails = await fetchOperatorEmails()
  const ok = emails.includes(normalizeEmail(email))
  if (ok) rememberOperatorEmail(email)
  else forgetOperatorEmail(email)
  return ok
}

export async function fetchOperatorEmails(): Promise<string[]> {
  const db = getFirebaseDb()
  const snap = await getDoc(doc(db, OPERATORS_COLLECTION, OPERATORS_DOC_ID))
  if (!snap.exists()) return []
  const raw = snap.data()?.emails
  const list = Array.isArray(raw)
    ? raw.map((e) => normalizeEmail(String(e))).filter(Boolean)
    : []
  saveCachedOperatorEmails(list)
  return list
}

export async function saveOperatorEmails(emails: string[]): Promise<void> {
  await ensureFirebaseWebSession()
  const clean = [...new Set(emails.map(normalizeEmail).filter(Boolean))]
  const db = getFirebaseDb()
  await setDoc(doc(db, OPERATORS_COLLECTION, OPERATORS_DOC_ID), { emails: clean }, { merge: true })
  saveCachedOperatorEmails(clean)
}
