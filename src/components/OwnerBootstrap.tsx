import { useRef } from 'react'
import { useFirebaseAuth } from '../hooks/useFirebaseAuth'
import { signInWithGoogle } from '../lib/googleSignIn'

/** U&I 로고 3초 길게 누르기 → Google 연결 (공개 로그인 화면 없음) */
export function useOwnerLogoBootstrap() {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { configured, isAdmin } = useFirebaseAuth()

  function clear() {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
  }

  function onPointerDown() {
    if (!configured || isAdmin) return
    clear()
    timer.current = setTimeout(() => {
      void signInWithGoogle()
    }, 3000)
  }

  return { onPointerDown, onPointerUp: clear, onPointerLeave: clear, onPointerCancel: clear }
}
