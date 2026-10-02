/** 포트폴리오·방패 관리자 — 이 메일만 허용 */
export const OWNER_ADMIN_EMAIL = 'uandimiles@gmail.com'

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return email.trim().toLowerCase() === OWNER_ADMIN_EMAIL
}
