/** 포트폴리오·방패 관리자 — 소유자 메일은 로컬 상수만 사용 (추가 서버 조회 없음) */
export const OWNER_ADMIN_EMAIL = 'uandimiles@gmail.com'

export const OWNER_ADMIN_EMAILS = [
  'uandimiles@gmail.com',
  '1994miles@naver.com',
] as const

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function isOwnerEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const n = normalizeEmail(email)
  return (OWNER_ADMIN_EMAILS as readonly string[]).includes(n)
}

/** 소유자만. 운영자 여부는 이 함수로 판단하지 않음 (공개 페이지 추가 조회 방지) */
export function isAdminEmail(email: string | null | undefined): boolean {
  return isOwnerEmail(email)
}
