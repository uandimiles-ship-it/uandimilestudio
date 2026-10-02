import { useRef } from 'react'
import { useFirebaseAuth } from '../hooks/useFirebaseAuth'
import { markAdminEntry } from '../lib/adminEntry'
import { signInWithGoogle } from '../lib/googleSignIn'

/** U&I 로고 3초 길게 누르기 — 로그인 또는 관리자 화면 */
export function useOwnerLogoBootstrap(onOpenAdmin?: () => void) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { configured, isAdmin } = useFirebaseAuth()

  function clear() {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
  }

  function onPointerDown() {
    if (!configured) return
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

  return { onPointerDown, onPointerUp: clear, onPointerLeave: clear, onPointerCancel: clear }
}
