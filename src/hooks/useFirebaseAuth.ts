import { onAuthStateChanged, type User } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { isAdminEmail } from '../lib/adminEmails'
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
    let unsub = () => {}
    void completeGoogleSignInRedirect().finally(() => {
      unsub = onAuthStateChanged(auth, (u) => {
        setUser(u)
        setReady(true)
      })
    })
    return () => unsub()
  }, [configured])

  const isAdmin = isAdminEmail(user?.email)

  return { user, ready, configured, isAdmin }
}
