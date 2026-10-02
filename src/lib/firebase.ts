import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

/** 웹·앱 공통 (Firebase 웹 API 키는 공개값) */
const fallback = {
  apiKey: 'AIzaSyDHLj36DDMvtdufEOKotS-vFOTluGAuR5E',
  authDomain: 'uandimilestudio.firebaseapp.com',
  projectId: 'uandimilestudio',
  storageBucket: 'uandimilestudio.firebasestorage.app',
  messagingSenderId: '117271698480',
  appId: '1:117271698480:web:50214431a188b4fc19a1f5',
}

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || fallback.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || fallback.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || fallback.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || fallback.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || fallback.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || fallback.appId,
}

export function isFirebaseConfigured(): boolean {
  return Boolean(
    config.apiKey &&
      config.authDomain &&
      config.projectId &&
      config.appId,
  )
}

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let storage: FirebaseStorage | null = null

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase env가 설정되지 않았습니다.')
  }
  if (!app) app = initializeApp(config)
  return app
}

export function getFirebaseAuth(): Auth {
  if (!auth) auth = getAuth(getFirebaseApp())
  return auth
}

export function getFirebaseDb(): Firestore {
  if (!db) db = getFirestore(getFirebaseApp())
  return db
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) storage = getStorage(getFirebaseApp())
  return storage
}
