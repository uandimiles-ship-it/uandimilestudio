const KEY = 'studio_admin_entry'

export function markAdminEntry() {
  sessionStorage.setItem(KEY, '1')
}

export function consumeAdminEntry(): boolean {
  const ok = sessionStorage.getItem(KEY) === '1'
  if (ok) sessionStorage.removeItem(KEY)
  return ok
}
