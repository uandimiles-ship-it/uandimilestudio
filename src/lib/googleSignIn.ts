import {
  GoogleAuthProvider,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth'
import { getFirebaseAuth, isFirebaseConfigured } from './firebase'

function isMobileDevice(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

export async function completeGoogleSignInRedirect() {
  if (!isFirebaseConfigured()) return null
  return getRedirectResult(getFirebaseAuth())
}

export async function signInWithGoogle(): Promise<void> {
  const auth = getFirebaseAuth()
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  if (isMobileDevice()) {
    await signInWithRedirect(auth, provider)
    return
  }
  await signInWithPopup(auth, provider)
}
