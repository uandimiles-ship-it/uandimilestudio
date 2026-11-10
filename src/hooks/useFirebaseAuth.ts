import { onAuthStateChanged, type User } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { isEditorEmail } from '../lib/adminEmails'
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

  const isEditor = isEditorEmail(user?.email)
  const isOwner = isEditor
  const isAdmin = isEditor

  return { user, ready, configured, isAdmin, isOwner, isEditor }
}
