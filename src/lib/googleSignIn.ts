import {
  GoogleAuthProvider,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth'
import { getFirebaseAuth, isFirebaseConfigured } from './firebase'
import { signInWithGoogleNative } from './nativeGoogleAuth'
import { isCapacitorNative } from './platform'

function isMobileDevice(): boolean {
  return isCapacitorNative() || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

export async function completeGoogleSignInRedirect() {
  if (!isFirebaseConfigured()) return null
  return getRedirectResult(getFirebaseAuth())
}

export type GoogleSignInResult =
  | { ok: true }
  | { ok: false; message: string }

export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  if (isCapacitorNative()) {
    const native = await signInWithGoogleNative()
    if (native.ok) return { ok: true }
    return { ok: false, message: native.message }
  }
  try {
    const auth = getFirebaseAuth()
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    if (isMobileDevice()) {
      await signInWithRedirect(auth, provider)
      return { ok: true }
    }
    await signInWithPopup(auth, provider)
    return { ok: true }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Google 로그인에 실패했습니다.'
    return { ok: false, message }
  }
}
