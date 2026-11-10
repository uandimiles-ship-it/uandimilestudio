import { useRef } from 'react'
import { useFirebaseAuth } from '../hooks/useFirebaseAuth'
import { markAdminEntry } from '../lib/adminEntry'
import { isEditorEmail } from '../lib/adminEmails'
import { getFirebaseAuth } from '../lib/firebase'
import { signInWithGoogle } from '../lib/googleSignIn'
import { isCapacitorNative } from '../lib/platform'

/** 웹·앱: 로고 3초 길게 누르기 → Google 로그인 후, 편집 계정만 관리자 화면 */
export function useOwnerLogoBootstrap(onOpenAdmin?: () => void) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { configured, isAdmin } = useFirebaseAuth()

  function clear() {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
  }

  function openAdmin() {
    markAdminEntry()
    onOpenAdmin?.()
  }

  function onPointerDown() {
    if (!configured) return
    clear()
    timer.current = setTimeout(() => {
      void (async () => {
        if (isAdmin) {
          openAdmin()
          return
        }
        const existing = getFirebaseAuth().currentUser?.email
        if (isEditorEmail(existing)) {
          openAdmin()
          return
        }
        const r = await signInWithGoogle()
        if (!r.ok) return
        // 모바일 웹 리다이렉트는 페이지가 다시 열리며, 편집 계정이면 방패가 나타남
        if (isCapacitorNative() || isEditorEmail(getFirebaseAuth().currentUser?.email)) {
          if (isEditorEmail(getFirebaseAuth().currentUser?.email)) openAdmin()
        }
      })()
    }, 3000)
  }

  return { onPointerDown, onPointerUp: clear, onPointerLeave: clear, onPointerCancel: clear }
}
