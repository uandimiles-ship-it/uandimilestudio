import type { PortfolioWork } from '../content/portfolio'
import { sanitizePortfolioWorks } from './thumbnailResolve'

const STORAGE_KEY = 'uandimilestudio_portfolio_works_v1'
export const PORTFOLIO_WORKS_UPDATED_EVENT = 'portfolio-works-updated'

export function loadLocalPortfolioWorks(): PortfolioWork[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PortfolioWork[]
    return Array.isArray(parsed) ? sanitizePortfolioWorks(parsed) : null
  } catch {
    return null
  }
}

export function saveLocalPortfolioWorks(works: PortfolioWork[]): void {
  const clean = sanitizePortfolioWorks(works)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clean))
  window.dispatchEvent(new CustomEvent(PORTFOLIO_WORKS_UPDATED_EVENT))
}

export function deleteLocalPortfolioWork(workId: string): void {
  const current = loadLocalPortfolioWorks()
  if (!current) return
  saveLocalPortfolioWorks(current.filter((w) => w.id !== workId))
}
