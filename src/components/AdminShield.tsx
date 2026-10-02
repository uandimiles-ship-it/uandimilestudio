import { useFirebaseAuth } from '../hooks/useFirebaseAuth'
import { markAdminEntry } from '../lib/adminEntry'
import { AdminShieldIcon } from './AdminShieldIcon'

/** 나우바둑·나우AI처럼 — 방문자에게는 아무것도 안 보이고, 관리자만 방패 FAB */
export function AdminShield() {
  const { ready, configured, isAdmin } = useFirebaseAuth()

  if (!configured || !ready || !isAdmin) return null

  return (
    <a
      href="/admin"
      onClick={() => markAdminEntry()}
      title="관리자"
      className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-2xl bg-red-600 text-white shadow-lg ring-2 ring-red-400/40"
      aria-label="관리자"
    >
      <AdminShieldIcon className="h-7 w-7" />
    </a>
  )
}
