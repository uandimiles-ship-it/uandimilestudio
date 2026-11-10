import { onAuthStateChanged, type User } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { isOwnerEmail } from '../lib/adminEmails'
import { isCachedOperatorEmail } from '../lib/adminOperators'
import { getFirebaseAuth, isFirebaseConfigured } from '../lib/firebase'
import { completeGoogleSignInRedirect } from '../lib/googleSignIn'

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)
  const configured = isFirebaseConfigured()

  useEffect(() => {
    if (!configured) {
      setReady(true)
      return
    }
    const auth = getFirebaseAuth()
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setReady(true)
    })
    void completeGoogleSignInRedirect()
    return unsub
  }, [configured])

  const isOwner = isOwnerEmail(user?.email)
  // 공개 페이지에서는 서버에서 운영자를 조회하지 않음. 캐시된 운영자만 방패를 보여 줌.
  const isAdmin = isOwner || isCachedOperatorEmail(user?.email)

  return { user, ready, configured, isAdmin, isOwner }
}
