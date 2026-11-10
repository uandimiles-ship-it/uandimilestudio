import { useNavigate } from 'react-router-dom'

import { useFirebaseAuth } from '../hooks/useFirebaseAuth'

import { markAdminEntry } from '../lib/adminEntry'

import { AdminShieldIcon } from './AdminShieldIcon'

/** 웹·앱 공통 — uandimiles@gmail.com 로그인 시에만 표시 */
export function AdminShield() {
  const navigate = useNavigate()
  const { ready, configured, isAdmin } = useFirebaseAuth()

  if (!configured || !ready || !isAdmin) return null

  return (
    <button
      type="button"
      onClick={() => {
        markAdminEntry()
        navigate('/admin')
      }}
      title="관리자"
      className="fixed right-4 z-[9999] grid h-14 w-14 place-items-center rounded-2xl bg-red-600 text-white shadow-lg ring-2 ring-red-400/40 bottom-[calc(max(1.25rem,env(safe-area-inset-bottom,0px))+0.5rem)]"
      aria-label="관리자"
    >
      <AdminShieldIcon className="h-7 w-7" />
    </button>
  )
}
