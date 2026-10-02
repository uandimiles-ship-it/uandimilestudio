import { useNavigate } from 'react-router-dom'

import { useFirebaseAuth } from '../hooks/useFirebaseAuth'

import { markAdminEntry } from '../lib/adminEntry'

import { isCapacitorNative } from '../lib/platform'

import { AdminShieldIcon } from './AdminShieldIcon'

/** 앱에서만 표시 — 웹은 공개 포트폴리오만, 편집은 앱 관리자 */
export function AdminShield() {
  const navigate = useNavigate()
  const { ready, configured, isAdmin } = useFirebaseAuth()

  if (!isCapacitorNative() || !configured || !ready || !isAdmin) return null

  return (
    <button
      type="button"
      onClick={() => {
        markAdminEntry()
        navigate('/admin')
      }}
      title="관리자"
      className="fixed bottom-6 right-4 z-[9999] grid h-14 w-14 place-items-center rounded-2xl bg-red-600 text-white shadow-lg ring-2 ring-red-400/40"
      aria-label="관리자"
    >
      <AdminShieldIcon className="h-7 w-7" />
    </button>
  )
}


