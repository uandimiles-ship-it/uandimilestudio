import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { isAdminEmail } from '../lib/adminEmails'
import { getFirebaseAuth, isFirebaseConfigured } from '../lib/firebase'

/**
 * NOW WORLD 월 5만 원 총괄 한도.
 * NOW AI Firestore `app_config/budget_lock` 문서 하나만 공개 REST 로 읽는다
 * (함수 호출 없이 문서 읽기 1건). 페이지를 열 때 · 탭으로 돌아올 때 · 열려 있는 동안 5분마다 확인.
 * 조회 실패 시에는 사이트를 그대로 연다 (fail-open). 소유자 계정은 잠금 화면 없이 통과.
 */
const LOCK_DOC_URL =
  'https://firestore.googleapis.com/v1/projects/now-ai-5866c/databases/(default)/documents/app_config/budget_lock'
const APP_ID = 'uandi_studio'
const POLL_MS = 5 * 60 * 1000
const MIN_GAP_MS = 60 * 1000
const DEFAULT_MESSAGE =
  '이번 달 서비스 이용량이 한도에 도달해 잠시 중단됐어요. 다음 달 1일에 다시 열려요.'

type FsValue = {
  booleanValue?: boolean
  stringValue?: string
  arrayValue?: { values?: FsValue[] }
}
type FsFields = Record<string, FsValue | undefined>

function strArray(v: FsValue | undefined): string[] {
  return (v?.arrayValue?.values ?? [])
    .map((x) => x?.stringValue ?? '')
    .filter((s) => s.length > 0)
}

function locksThisApp(f: FsFields): boolean {
  if (f.active?.booleanValue !== true) return false
  const explicit = f.userFacing?.booleanValue
  const userFacing =
    typeof explicit === 'boolean'
      ? explicit
      : !(f.testMode?.booleanValue === true || f.source?.stringValue === 'manual')
  if (!userFacing) return false
  const mode = f.mode?.stringValue ?? ''
  const locked = strArray(f.lockedAppIds)
  if (strArray(f.stoppedAppIds).includes(APP_ID)) return true
  if (strArray(f.loginOnlyAppIds).includes(APP_ID)) return true
  if (mode === 'all_off' || mode === 'mixed') {
    return locked.length === 0 || locked.includes(APP_ID)
  }
  return mode === 'login_only' && locked.includes(APP_ID)
}

export function useStudioBudgetPause() {
  const [locked, setLocked] = useState(false)
  const [message, setMessage] = useState('')
  const [owner, setOwner] = useState(false)

  useEffect(() => {
    let cancelled = false
    let lastAt = 0
    const check = (force = false) => {
      const now = Date.now()
      if (!force && now - lastAt < MIN_GAP_MS) return
      lastAt = now
      fetch(LOCK_DOC_URL, { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : null))
        .then((doc: { fields?: FsFields } | null) => {
          if (cancelled) return
          const fields = doc?.fields
          if (!fields) {
            setLocked(false)
            return
          }
          const on = locksThisApp(fields)
          setLocked(on)
          setMessage(on ? fields.message?.stringValue?.trim() || DEFAULT_MESSAGE : '')
        })
        .catch(() => {
          if (!cancelled) setLocked(false)
        })
    }
    check(true)
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') check()
    }, POLL_MS)
    const onVisible = () => {
      if (document.visibilityState === 'visible') check()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  // 잠금 중일 때만 로그인 상태를 확인해 소유자는 통과시킨다.
  useEffect(() => {
    if (!locked || !isFirebaseConfigured()) return
    try {
      return onAuthStateChanged(getFirebaseAuth(), (u) => setOwner(isAdminEmail(u?.email)))
    } catch {
      return
    }
  }, [locked])

  return { paused: locked && !owner, message }
}

export function WorldBudgetPause({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-[9998] grid place-items-center bg-zinc-950/92 px-6 text-center text-white">
      <div className="max-w-md">
        <p className="text-sm tracking-[0.18em] text-white/50">NOW WORLD</p>
        <h1 className="mt-3 text-2xl font-semibold">잠시 쉬어 가요</h1>
        <p className="mt-4 text-sm leading-relaxed text-white/75">{message || DEFAULT_MESSAGE}</p>
      </div>
    </div>
  )
}
