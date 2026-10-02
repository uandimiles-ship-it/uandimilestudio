import { useEffect, useMemo, useState } from 'react'
import { signOut } from 'firebase/auth'
import type { PortfolioWork } from '../content/portfolio'
import { useFirebaseAuth } from '../hooks/useFirebaseAuth'
import { AdminShieldIcon } from '../components/AdminShieldIcon'
import { consumeAdminEntry } from '../lib/adminEntry'
import { getFirebaseAuth } from '../lib/firebase'
import { signInWithGoogle } from '../lib/googleSignIn'
import {
  fetchPortfolioWorks,
  savePortfolioWork,
  seedPortfolioFromLocal,
  uploadWorkThumbnail,
} from '../lib/worksRepository'

type AdminView = 'dashboard' | 'works'

function emptyDraft(): PortfolioWork {
  return {
    id: `work-${Date.now()}`,
    title: '',
    subtitle: '',
    year: new Date().getFullYear().toString(),
    tags: [],
    thumbnail: { src: '', alt: '' },
    embed: { type: 'youtube', id: '' },
    description: '',
    link: '',
  }
}

export default function AdminApp() {
  const { user, ready, configured, isAdmin } = useFirebaseAuth()
  const [authTried, setAuthTried] = useState(false)
  const [view, setView] = useState<AdminView>('dashboard')
  const [works, setWorks] = useState<PortfolioWork[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<PortfolioWork | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!configured || !ready) return
    if (user) return
    if (!consumeAdminEntry()) {
      window.location.replace('/')
      return
    }
    if (!authTried) {
      setAuthTried(true)
      void signInWithGoogle()
    }
  }, [configured, ready, user, authTried])

  useEffect(() => {
    if (!configured || !isAdmin) return
    void (async () => {
      const { works: loaded } = await fetchPortfolioWorks()
      setWorks(loaded)
      setSelectedId((prev) => prev ?? loaded[0]?.id ?? null)
    })()
  }, [configured, isAdmin])

  const selected = useMemo(
    () => works.find((w) => w.id === selectedId) ?? null,
    [works, selectedId],
  )

  useEffect(() => {
    if (selected) setDraft({ ...selected, tags: [...selected.tags] })
  }, [selected])

  async function handleSave() {
    if (!draft) return
    setBusy(true)
    setStatus(null)
    try {
      const sortOrder = works.findIndex((w) => w.id === draft.id)
      const order = sortOrder >= 0 ? sortOrder : works.length
      await savePortfolioWork(draft, order)
      const next = [...works]
      const idx = next.findIndex((w) => w.id === draft.id)
      if (idx >= 0) next[idx] = draft
      else next.push(draft)
      setWorks(next)
      setSelectedId(draft.id)
      setStatus('저장했습니다.')
    } catch (e) {
      setStatus(e instanceof Error ? e.message : '저장 실패')
    } finally {
      setBusy(false)
    }
  }

  async function handleSeed() {
    setBusy(true)
    setStatus(null)
    try {
      const count = await seedPortfolioFromLocal()
      const { works: loaded } = await fetchPortfolioWorks()
      setWorks(loaded)
      setStatus(`기본 ${count}개 작품을 올렸습니다.`)
      if (loaded[0]) setSelectedId(loaded[0].id)
    } catch (e) {
      setStatus(e instanceof Error ? e.message : '시드 실패')
    } finally {
      setBusy(false)
    }
  }

  async function handleThumbnail(file: File) {
    if (!draft) return
    setBusy(true)
    setStatus(null)
    try {
      const url = await uploadWorkThumbnail(draft.id, file)
      setDraft({ ...draft, thumbnail: { src: url, alt: draft.title } })
      setStatus('썸네일 업로드됨. 저장을 눌러 주세요.')
    } catch (e) {
      setStatus(e instanceof Error ? e.message : '업로드 실패')
    } finally {
      setBusy(false)
    }
  }

  if (!configured) {
    window.location.replace('/')
    return null
  }

  if (!ready || (!user && authTried)) {
    return (
      <div className="grid min-h-dvh place-items-center bg-zinc-950 text-white/60">
        잠시만요…
      </div>
    )
  }

  if (!user) {
    return (
      <div className="grid min-h-dvh place-items-center bg-zinc-950 text-white/60">
        연결 중…
      </div>
    )
  }

  if (!isAdmin) {
    void signOut(getFirebaseAuth())
    window.location.replace('/')
    return null
  }

  if (view === 'dashboard') {
    return (
      <div className="min-h-dvh bg-zinc-950 text-white">
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h1 className="text-lg font-semibold">관리자 대시보드</h1>
          <span className="rounded bg-red-600 px-2 py-0.5 text-[11px] font-extrabold tracking-wide">
            ADMIN
          </span>
        </header>
        <div className="p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-white/40">콘텐츠 관리</p>
          <button
            type="button"
            onClick={() => setView('works')}
            className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left hover:bg-white/10"
          >
            <AdminShieldIcon className="h-8 w-8 text-red-400" />
            <div>
              <div className="font-semibold">추천 영상 관리</div>
              <div className="text-xs text-white/50">제목·설명·유튜브 ID·썸네일 (API 없음)</div>
            </div>
          </button>
          <a href="/" className="mt-8 inline-block text-sm text-white/50 underline">← 포트폴리오</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-zinc-950 text-white">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-5 py-4">
        <button type="button" onClick={() => setView('dashboard')} className="text-sm text-white/60">
          ← 대시보드
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void handleSeed()}
          className="rounded-full border border-white/10 px-3 py-1 text-xs disabled:opacity-40"
        >
          기본값 시드
        </button>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 p-5 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-2">
          {works.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => setSelectedId(w.id)}
              className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${
                w.id === selectedId ? 'border-yellow-400/50 bg-white/10' : 'border-white/10 bg-white/5'
              }`}
            >
              <div className="line-clamp-2 font-medium">{w.title || w.id}</div>
              <div className="text-xs text-white/50">{w.embed?.id || '영상 ID 없음'}</div>
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              const n = emptyDraft()
              setWorks((prev) => [...prev, n])
              setSelectedId(n.id)
              setDraft(n)
            }}
            className="w-full rounded-xl border border-dashed border-white/20 py-2 text-sm text-white/60"
          >
            + 새 작품
          </button>
        </aside>

        {draft ? (
          <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
            <label className="block text-sm">
              <span className="text-white/60">제목</span>
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </label>
            <label className="block text-sm">
              <span className="text-white/60">YouTube 영상 ID</span>
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 font-mono text-xs"
                placeholder="6bSicVeKD1Y"
                value={draft.embed?.id ?? ''}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    embed: { type: 'youtube', id: e.target.value.trim() },
                    link: e.target.value.trim()
                      ? `https://youtu.be/${e.target.value.trim()}`
                      : draft.link,
                  })
                }
              />
            </label>
            <label className="block text-sm">
              <span className="text-white/60">설명</span>
              <textarea
                rows={4}
                className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2"
                value={draft.description ?? ''}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </label>
            <label className="block text-sm">
              <span className="text-white/60">태그 (쉼표)</span>
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2"
                value={draft.tags.join(', ')}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                  })
                }
              />
            </label>
            <label className="block text-sm">
              <span className="text-white/60">썸네일</span>
              <input
                type="file"
                accept="image/*"
                className="mt-1 block text-sm"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) void handleThumbnail(f)
                }}
              />
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleSave()}
              className="rounded-2xl bg-yellow-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 disabled:opacity-40"
            >
              저장
            </button>
            {status ? <p className="text-sm text-white/70">{status}</p> : null}
          </section>
        ) : (
          <p className="text-sm text-white/50">작품을 선택하세요.</p>
        )}
      </div>
    </div>
  )
}
