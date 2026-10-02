import type { ReactNode } from 'react'

type Props = {
  icon: ReactNode
  title: string
  subtitle?: string
  onClick: () => void
}

/** Now-Ai `admin_dashboard_screen` ListTile */
export function NowAiAdminTile({ icon, title, subtitle, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-indigo-200 hover:bg-slate-50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-slate-900">{title}</div>
        {subtitle ? <div className="text-sm text-slate-500">{subtitle}</div> : null}
      </div>
      <span className="text-slate-400" aria-hidden>›</span>
    </button>
  )
}
