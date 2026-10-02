import { useRef } from 'react'
import { useFirebaseAuth } from '../hooks/useFirebaseAuth'
import { markAdminEntry } from '../lib/adminEntry'
import { signInWithGoogle } from '../lib/googleSignIn'
import { isCapacitorNative } from '../lib/platform'

/** 앱: 로고 3초 길게 누르기 → 관리자. 웹: 비활성 */
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
      if (isAdmin) {
        markAdminEntry()
        onOpenAdmin?.()
      } else {
        void signInWithGoogle()
      }
    }, 3000)
  }

  if (!native) {
    return {}
  }

  return { onPointerDown, onPointerUp: clear, onPointerLeave: clear, onPointerCancel: clear }
}
