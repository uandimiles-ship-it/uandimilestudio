import { FirebaseAuthentication } from '@capacitor-firebase/authentication'
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth'
import { getFirebaseAuth, isFirebaseConfigured } from './firebase'
import { isCapacitorNative } from './platform'

/** 앱 WebView에서 JS Auth가 끊겼을 때 네이티브 세션 → Firestore/Storage용 JS 세션 복구 */
export async function ensureFirebaseWebSession(): Promise<void> {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase가 설정되지 않았습니다.')
  }
  const auth = getFirebaseAuth()
  if (auth.currentUser) return

  if (!isCapacitorNative()) {
    throw new Error('로그인이 필요합니다. 로고 3초 길게 누른 뒤 Google 로그인해 주세요.')
  }

  const { user: nativeUser } = await FirebaseAuthentication.getCurrentUser()
  if (!nativeUser) {
    throw new Error('로그인이 필요합니다. 로고 3초 길게 누른 뒤 Google 로그인해 주세요.')
  }

  const { token } = await FirebaseAuthentication.getIdToken({ forceRefresh: true })
  if (!token) {
    throw new Error('인증 토큰을 받지 못했습니다. 앱을 다시 시작한 뒤 로그인해 주세요.')
  }

  await signInWithCredential(auth, GoogleAuthProvider.credential(token))
}

export function formatFirebaseWriteError(err: unknown): string {
  const code =
    err && typeof err === 'object' && 'code' in err
      ? String((err as { code?: string }).code)
      : ''
  const msg = err instanceof Error ? err.message : String(err)

  if (code === 'permission-denied' || msg.includes('permission')) {
    return (
      '저장·삭제 권한이 없습니다. uandimiles@gmail.com 으로 로그인했는지 확인하고, ' +
      'Firebase 규칙(firestore/storage)이 배포됐는지 확인해 주세요.'
    )
  }
  if (code === 'unauthenticated') {
    return '로그인이 만료됐습니다. 로고 3초 길게 누른 뒤 관리자로 다시 들어와 주세요.'
  }
  if (code === 'storage/unauthorized') {
    return '썸네일 업로드 권한이 없습니다. 관리자 계정으로 로그인했는지 확인해 주세요.'
  }
  return msg || '알 수 없는 오류'
}
