import { FirebaseAuthentication } from '@capacitor-firebase/authentication'
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth'
import { getFirebaseAuth, isFirebaseConfigured } from './firebase'
import { isCapacitorNative } from './platform'

export type NativeGoogleSignInResult =
  | { ok: true }
  | { ok: false; message: string }

/** Android 앱 WebView 대신 네이티브 Google 로그인 → Firebase 세션 */
export async function signInWithGoogleNative(): Promise<NativeGoogleSignInResult> {
  if (!isCapacitorNative() || !isFirebaseConfigured()) {
    return { ok: false, message: '앱 또는 Firebase 설정을 확인할 수 없습니다.' }
  }
  try {
    const result = await FirebaseAuthentication.signInWithGoogle()
    const idToken = result.credential?.idToken
    if (!idToken) {
      console.error('[Google] 네이티브 로그인: idToken 없음', result)
      return {
        ok: false,
        message:
          'Google 로그인 토큰을 받지 못했습니다. Firebase에서 Google 로그인·OAuth 클라이언트·google-services.json을 확인해 주세요.',
      }
    }
    const auth = getFirebaseAuth()
    await signInWithCredential(auth, GoogleAuthProvider.credential(idToken))
    return { ok: true }
  } catch (err) {
    console.error('[Google] 네이티브 로그인 실패', err)
    const message =
      err instanceof Error ? err.message : 'Google 로그인에 실패했습니다.'
    return { ok: false, message }
  }
}
