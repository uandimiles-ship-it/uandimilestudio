/** 편집·관리자 UI는 Firestore 쓰기 규칙과 같이 이 계정만 허용 */
export const OWNER_ADMIN_EMAIL = 'uandimiles@gmail.com'

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/** 썸네일·유튜브·크기 등 관리자 편집이 허용되는 계정 */
export function isEditorEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return normalizeEmail(email) === OWNER_ADMIN_EMAIL
}

/** 하위 호환 — 편집 권한과 동일. 1994miles·운영자는 편집 UI를 보지 않음 */
export function isOwnerEmail(email: string | null | undefined): boolean {
  return isEditorEmail(email)
}

export function isAdminEmail(email: string | null | undefined): boolean {
  return isEditorEmail(email)
}
