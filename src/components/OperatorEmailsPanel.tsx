import { useEffect, useState } from 'react'
import { fetchOperatorEmails, saveOperatorEmails } from '../lib/adminOperators'

/** 소유자 관리자 화면에서만 마운트. 공개 홈에서는 쓰지 않음 */
export function OperatorEmailsPanel() {
  const [emails, setEmails] = useState<string[]>([])
  const [draft, setDraft] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    void fetchOperatorEmails()
      .then((list) => setEmails(list))
      .catch(() => {
        setError(true)
        setStatus('운영자 목록을 불러오지 못했습니다.')
      })
  }, [])

  async function persist(next: string[], okMessage: string) {
    setBusy(true)
    setStatus(null)
    setError(false)
    try {
      await saveOperatorEmails(next)
      setEmails(next)
      setStatus(okMessage)
    } catch (e) {
      setError(true)
      setStatus(e instanceof Error ? e.message : '저장에 실패했습니다.')
    } finally {
      setBusy(false)
    }
  }

  function handleAdd() {
    const email = draft.trim().toLowerCase()
    if (!email || !email.includes('@')) {
      setError(true)
      setStatus('올바른 이메일을 입력해 주세요.')
      return
    }
    if (emails.includes(email)) {
      setDraft('')
      return
    }
    setDraft('')
    void persist([...emails, email], '운영자를 추가했습니다.')
  }

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-800">운영자</h2>
      <p className="mt-1 text-xs text-slate-500">
        여기에 추가한 계정만 관리자 화면이 보입니다. 일반 이용자 앱·웹 로딩에는 이 목록을 조회하지 않습니다.
      </p>
      {emails.length === 0 ? (
        <p className="mt-3 text-xs text-slate-400">추가된 운영자가 없습니다.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {emails.map((email) => (
            <li key={email} className="flex items-center justify-between gap-2 text-sm">
              <span className="truncate">{email}</span>
              <button
                type="button"
                disabled={busy}
                onClick={() => void persist(emails.filter((e) => e !== email), '운영자를 삭제했습니다.')}
                className="shrink-0 text-xs text-red-600 disabled:opacity-40"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex gap-2">
        <input
          type="email"
          value={draft}
          disabled={busy}
          placeholder="운영자 이메일"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd()
          }}
          className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
        <button
          type="button"
          disabled={busy}
          onClick={handleAdd}
          className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-40"
        >
          추가
        </button>
      </div>
      {status ? (
        <p className={`mt-2 text-xs ${error ? 'text-red-600' : 'text-emerald-700'}`}>{status}</p>
      ) : null}
    </div>
  )
}
