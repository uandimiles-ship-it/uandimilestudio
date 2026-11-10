import { useRef } from 'react'
import { useFirebaseAuth } from '../hooks/useFirebaseAuth'
import { markAdminEntry } from '../lib/adminEntry'
import { verifyAdminAccess } from '../lib/adminOperators'
import { getFirebaseAuth } from '../lib/firebase'
import { signInWithGoogle } from '../lib/googleSignIn'
import { isCapacitorNative } from '../lib/platform'

/** 앱: 로고 3초 길게 누르기 → 관리자. 웹: 비활성. 공개 로드 시 운영자 문서는 읽지 않음 */
export function useOwnerLogoBootstrap(onOpenAdmin?: () => void) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { configured, isAdmin } = useFirebaseAuth()
  const native = isCapacitorNative()

  function clear() {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
  }

  function onPointerDown() {
    if (!native || !configured) return
    clear()
    timer.current = setTimeout(() => {
      void (async () => {
        if (isAdmin) {
          markAdminEntry()
          onOpenAdmin?.()
          return
        }
        const existing = getFirebaseAuth().currentUser?.email
        if (existing && (await verifyAdminAccess(existing))) {
          markAdminEntry()
          onOpenAdmin?.()
          return
        }
        const r = await signInWithGoogle()
        if (!r.ok) return
        const email = getFirebaseAuth().currentUser?.email
        if (email && (await verifyAdminAccess(email))) {
          markAdminEntry()
          onOpenAdmin?.()
        }
      })()
    }, 3000)
  }

  if (!native) {
    return {}
  }

  return { onPointerDown, onPointerUp: clear, onPointerLeave: clear, onPointerCancel: clear }
}
