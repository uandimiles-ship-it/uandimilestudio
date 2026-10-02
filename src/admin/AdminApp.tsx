import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import type { PortfolioWork } from '../content/portfolio'
import { ThumbnailCropEditor } from '../components/ThumbnailCropEditor'
import { NowAiAdminTile } from '../components/nowAi/NowAiAdminTile'
import { NowAiVideoCard } from '../components/nowAi/NowAiVideoCard'
import { useFirebaseAuth } from '../hooks/useFirebaseAuth'
import { consumeAdminEntry } from '../lib/adminEntry'
import { getFirebaseAuth } from '../lib/firebase'
import { ensureFirebaseWebSession } from '../lib/firebaseSession'
import { signInWithGoogle } from '../lib/googleSignIn'
import { defaultThumbnailLayout } from '../lib/thumbnailLayout'
import { blobToDataUrl, compressImageForThumbnail } from '../lib/imageCompress'
import { isFirebaseConfigured } from '../lib/firebase'
import { isPersistableThumbnailSrc, sanitizeWorkThumbnail } from '../lib/thumbnailResolve'
import { applyVideoLink, youtubeThumbnailUrl } from '../lib/youtubeLink'
import {
  fetchPortfolioWorks,
  removePortfolioWorkFromCloud,
  savePortfolioWorksOnDevice,
  seedPortfolioFromLocal,
  syncPortfolioWorksToCloud,
  uploadWorkThumbnail,
} from '../lib/worksRepository'

type AdminView = 'dashboard' | 'works'

const NOW_AI_ACCENT = 0x5b5cff

function emptyDraft(): PortfolioWork {
  return {
    id: `work-${Date.now()}`,
    title: '',
    creator: '',
    subtitle: '',
    year: new Date().getFullYear().toString(),
    tags: [],
    thumbnail: { src: '', alt: '' },
    thumbnailLayout: defaultThumbnailLayout(),
    accentColor: NOW_AI_ACCENT,
    description: '',
    link: '',
  }
}

function customThumbSrc(work: PortfolioWork): string {
  return work.thumbnail.src?.trim() ?? ''
}

function thumbEditSrc(work: PortfolioWork): string {
  return customThumbSrc(work) || youtubeThumbnailUrl(work) || ''
}

function hasUploadedThumbnail(work: PortfolioWork): boolean {
  const src = customThumbSrc(work)
  if (!src) return false
  const yt = youtubeThumbnailUrl(work)
  return !yt || src !== yt
}

function applyWorks(next: PortfolioWork[]) {
  const clean = next.map(sanitizeWorkThumbnail)
  savePortfolioWorksOnDevice(clean)
  return clean
}

export default function AdminApp() {
  const navigate = useNavigate()
  const { user, ready, configured, isAdmin } = useFirebaseAuth()
  const [authTried, setAuthTried] = useState(false)
  const [view, setView] = useState<AdminView>('dashboard')
  const [works, setWorks] = useState<PortfolioWork[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<PortfolioWork | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [statusError, setStatusError] = useState(false)
  const [busy, setBusy] = useState(false)
  const [deleteArmed, setDeleteArmed] = useState(false)

  useEffect(() => {
    if (!configured || !ready) return
    if (user) return
    if (!consumeAdminEntry()) {
      navigate('/', { replace: true })
      return
    }
    if (!authTried) {
      setAuthTried(true)
      void signInWithGoogle().then((r) => {
        if (!r.ok) console.warn('[Admin] Google 로그인:', r.message)
      })
    }
  }, [configured, ready, user, authTried, navigate])

  useEffect(() => {
    if (!configured || !isAdmin) return
    void (async () => {
      const { works: loaded } = await fetchPortfolioWorks()
      setWorks(loaded)
      const initialId = loaded[0]?.id ?? null
      setSelectedId(initialId)
      const w = loaded.find((item) => item.id === initialId)
      if (w) {
        setDraft({
          ...w,
          tags: [...w.tags],
          thumbnailLayout: w.thumbnailLayout ?? defaultThumbnailLayout(),
        })
      }
    })()
  }, [configured, isAdmin])

  useEffect(() => {
    setDeleteArmed(false)
    if (!selectedId) {
      setDraft(null)
      return
    }
    const w = works.find((item) => item.id === selectedId)
    if (!w) return
    setDraft({
      ...w,
      tags: [...w.tags],
      thumbnailLayout: w.thumbnailLayout ?? defaultThumbnailLayout(),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  async function cloudSync(next: PortfolioWork[], okMessage: string) {
    try {
      await ensureFirebaseWebSession()
      await syncPortfolioWorksToCloud(next)
      setStatusError(false)
      setStatus(`${okMessage} (클라우드 동기화 완료)`)
    } catch (e) {
      setStatusError(true)
      const msg = e instanceof Error ? e.message : '클라우드 동기화 실패'
      setStatus(`${okMessage} — 이 기기에만 반영됨. ${msg}`)
    }
  }

  async function handleSave() {
    if (!draft) return
    setBusy(true)
    setStatus(null)
    setStatusError(false)
    if (draft.thumbnail.src?.startsWith('blob:')) {
      setStatusError(true)
      setStatus('사진 처리 중입니다. 「썸네일 준비 완료」가 뜬 뒤 저장해 주세요.')
      return
    }
    const toSave = sanitizeWorkThumbnail(
      applyVideoLink(
        {
          ...draft,
          creator: draft.creator?.trim() || draft.subtitle?.trim() || '',
          subtitle: draft.subtitle?.trim() || draft.creator?.trim() || '',
        },
        draft.link ?? '',
      ),
    )
    if (
      draft.thumbnail.src?.trim() &&
      !isPersistableThumbnailSrc(toSave.thumbnail.src)
    ) {
      setStatusError(true)
      setStatus('썸네일 주소가 올바르지 않습니다. 이미지를 다시 선택해 주세요.')
      return
    }
    const next = [...works]
    const idx = next.findIndex((w) => w.id === toSave.id)
    if (idx >= 0) next[idx] = toSave
    else next.push(toSave)
    setWorks(applyWorks(next))
    setDraft(toSave)
    setSelectedId(toSave.id)
    setStatus('저장했습니다. (클라우드 동기화 중…)')
    setBusy(false)
    void cloudSync(next, '저장했습니다.')
  }

  async function handleSeed() {
    setBusy(true)
    setStatus(null)
    try {
      await ensureFirebaseWebSession()
      const count = await seedPortfolioFromLocal()
      const { works: loaded } = await fetchPortfolioWorks()
      setWorks(loaded)
      setStatus(`기본 ${count}개를 클라우드에 올렸습니다.`)
      if (loaded[0]) setSelectedId(loaded[0].id)
    } catch (e) {
      setStatusError(true)
      setStatus(e instanceof Error ? e.message : '시드 실패')
    } finally {
      setBusy(false)
    }
  }

  function workWithThumbnailSrc(work: PortfolioWork, src: string): PortfolioWork {
    const withThumb = {
      ...work,
      thumbnail: { src, alt: work.title || '썸네일' },
      thumbnailLayout: defaultThumbnailLayout(),
    }
    return applyVideoLink(withThumb, withThumb.link ?? '')
  }

  function commitWorkList(next: PortfolioWork[], focus: PortfolioWork, persist = true) {
    if (persist) {
      setWorks(applyWorks(next))
    } else {
      setWorks(next)
    }
    setDraft(focus)
    return next
  }

  async function handleThumbnail(file: File) {
    if (!draft) return
    setStatusError(false)

    const instantUrl = URL.createObjectURL(file)
    const instantWork = workWithThumbnailSrc(draft, instantUrl)
    commitWorkList(
      works.map((w) => (w.id === draft.id ? instantWork : w)).concat(
        works.some((w) => w.id === draft.id) ? [] : [instantWork],
      ),
      instantWork,
      false,
    )
    setStatus('미리보기 적용됨 — 최적화·Firebase 동기화 중…')

    const workId = draft.id

    void (async () => {
      try {
        const compressed = await compressImageForThumbnail(file)
        const previewUrl = await blobToDataUrl(compressed)
        URL.revokeObjectURL(instantUrl)

        let finalUrl = previewUrl
        let uploadFailed = false
        try {
          const jpeg = new File([compressed], `thumb-${Date.now()}.jpg`, { type: 'image/jpeg' })
          finalUrl = await uploadWorkThumbnail(workId, jpeg)
        } catch (e) {
          uploadFailed = true
          setStatusError(true)
          const msg = e instanceof Error ? e.message : 'Storage 업로드 실패'
          setStatus(`이 기기에 저장됨 — Firebase: ${msg}`)
        }

        setWorks((prev) => {
          const base = prev.find((w) => w.id === workId) ?? instantWork
          const focus = workWithThumbnailSrc(base, finalUrl)
          const next = prev.map((w) => (w.id === workId ? focus : w))
          savePortfolioWorksOnDevice(next)
          queueMicrotask(() => setDraft(focus))
          if (!uploadFailed) queueMicrotask(() => void cloudSync(next, '썸네일 저장'))
          return next
        })

        if (!uploadFailed) {
          setStatusError(false)
          setStatus('썸네일 준비 완료. 드래그로 맞춘 뒤 「저장」을 눌러 주세요.')
        }
      } catch (e) {
        setStatusError(true)
        setStatus(e instanceof Error ? e.message : '이미지를 처리할 수 없습니다.')
      }
    })()
  }

  async function moveWork(index: number, delta: -1 | 1) {
    const target = index + delta
    if (target < 0 || target >= works.length) return
    const next = [...works]
    const [item] = next.splice(index, 1)
    next.splice(target, 0, item)
    setWorks(applyWorks(next))
    setStatus('순서 저장됨. (클라우드 동기화 중…)')
    void cloudSync(next, '순서 저장')
  }

  async function handleDeleteWork(work: PortfolioWork) {
    setBusy(true)
    setStatus(null)
    setStatusError(false)
    const next = works.filter((w) => w.id !== work.id)
    setWorks(applyWorks(next))
    if (selectedId === work.id) {
      setSelectedId(next[0]?.id ?? null)
    }
    setDeleteArmed(false)
    setStatus('삭제했습니다.')
    try {
      await ensureFirebaseWebSession()
      await removePortfolioWorkFromCloud(work.id)
      setStatus('삭제했습니다. (클라우드 동기화 완료)')
    } catch (e) {
      setStatusError(true)
      setStatus(
        `이 기기에서 삭제됨 — 클라우드: ${e instanceof Error ? e.message : '동기화 실패'}`,
      )
    }
    setBusy(false)
  }

  if (!configured) {
    navigate('/', { replace: true })
    return null
  }

  if (!ready || (!user && authTried)) {
    return (
      <div className="grid min-h-dvh place-items-center bg-slate-50 text-slate-500">잠시만요…</div>
    )
  }

  if (!user) {
    return (
      <div className="grid min-h-dvh place-items-center bg-slate-50 text-slate-500">연결 중…</div>
    )
  }

  if (!isAdmin) {
    void signOut(getFirebaseAuth())
    navigate('/', { replace: true })
    return null
  }

  if (view === 'dashboard') {
    return (
      <div className="min-h-dvh bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white px-5 py-4">
          <h1 className="text-lg font-semibold">관리자 대시보드</h1>
        </header>
        <div className="mx-auto max-w-lg p-5">
          <div className="mt-3">
            <NowAiAdminTile
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                  <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                </svg>
              }
              title="추천 영상 관리"
              onClick={() => setView('works')}
            />
          </div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-8 text-sm text-slate-500 underline"
          >
            ← 포트폴리오
          </button>
        </div>
      </div>
    )
  }

  const inputClass =
    'mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm'

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-5 py-4">
        <button type="button" onClick={() => setView('dashboard')} className="text-sm text-slate-500">
          ← 대시보드
        </button>
        <div className="flex flex-wrap items-center gap-2">
          {user?.email ? <span className="text-[11px] text-slate-400">{user.email}</span> : null}
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleSeed()}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs disabled:opacity-40"
          >
            클라우드 시드
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 p-5 lg:grid-cols-[300px_1fr]">
        <aside className="space-y-2">
          <p className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            AI 추천 영상 · 노출 순서
          </p>
          {works.map((w, index) => (
            <div
              key={w.id}
              className={`flex gap-1 rounded-2xl border p-1 ${
                w.id === selectedId ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-white'
              }`}
            >
              <button
                type="button"
                onClick={() => setSelectedId(w.id)}
                className="min-w-0 flex-1 rounded-xl px-2 py-2 text-left text-sm"
              >
                <div className="line-clamp-2 font-semibold">{w.title || w.id}</div>
                <div className="truncate text-xs text-slate-500">{w.link || 'YouTube 링크 없음'}</div>
              </button>
              <div className="flex flex-col justify-center gap-0.5">
                <button
                  type="button"
                  disabled={busy || index === 0}
                  onClick={() => void moveWork(index, -1)}
                  className="rounded px-1.5 text-xs text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                  aria-label="위로"
                >
                  ▲
                </button>
                <button
                  type="button"
                  disabled={busy || index === works.length - 1}
                  onClick={() => void moveWork(index, 1)}
                  className="rounded px-1.5 text-xs text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                  aria-label="아래로"
                >
                  ▼
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              const n = emptyDraft()
              const next = applyWorks([...works, n])
              setWorks(next)
              setSelectedId(n.id)
              setDraft(n)
            }}
            className="w-full rounded-2xl border border-dashed border-slate-300 bg-white py-2 text-sm text-slate-600"
          >
            + 영상 추가
          </button>
        </aside>

        {draft ? (
          <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">홈 미리보기</p>
              <div className="mt-2 max-w-sm">
                <NowAiVideoCard work={draft} />
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <ThumbnailCropEditor
                key={`${draft.id}-${draft.thumbnail.src?.slice(0, 32) ?? ''}`}
                customSrc={thumbEditSrc(draft)}
                youtubePreviewSrc={youtubeThumbnailUrl(draft) ?? undefined}
                hasUploadedImage={hasUploadedThumbnail(draft)}
                layout={draft.thumbnailLayout}
                busy={busy}
                onLayoutChange={(layout) =>
                  setDraft((d) => (d ? { ...d, thumbnailLayout: layout } : d))
                }
                onPickFile={(f) => void handleThumbnail(f)}
                onClearImage={() =>
                  setDraft((d) =>
                    d
                      ? {
                          ...d,
                          thumbnail: { src: '', alt: d.title },
                          thumbnailLayout: defaultThumbnailLayout(),
                        }
                      : d,
                  )
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm sm:col-span-2">
                <span className="text-slate-600">제목</span>
                <input
                  className={inputClass}
                  value={draft.title}
                  onChange={(e) => setDraft((d) => (d ? { ...d, title: e.target.value } : d))}
                />
              </label>
              <label className="block text-sm">
                <span className="text-slate-600">크리에이터 (나우 AI)</span>
                <input
                  className={inputClass}
                  placeholder="채널명 · 제작자"
                  value={draft.creator ?? draft.subtitle ?? ''}
                  onChange={(e) =>
                    setDraft((d) =>
                      d ? { ...d, creator: e.target.value, subtitle: e.target.value } : d,
                    )
                  }
                />
              </label>
              <label className="block text-sm">
                <span className="text-slate-600">연도</span>
                <input
                  className={inputClass}
                  value={draft.year ?? ''}
                  onChange={(e) => setDraft((d) => (d ? { ...d, year: e.target.value } : d))}
                />
              </label>
            </div>

            <label className="block text-sm">
              <span className="text-slate-600">YouTube URL (전체 링크)</span>
              <input
                className={inputClass}
                placeholder="https://www.youtube.com/watch?v=..."
                value={draft.link ?? ''}
                onChange={(e) =>
                  setDraft((d) => (d ? applyVideoLink(d, e.target.value) : d))
                }
              />
              <p className="mt-1 text-[11px] text-slate-500">
                나우 AI `RecommendedVideo.youtubeUrl` — 붙여넣기만 하면 썸네일 자동 (mqdefault)
              </p>
            </label>

            <label className="block text-sm">
              <span className="text-slate-600">설명</span>
              <textarea
                rows={4}
                className={inputClass}
                value={draft.description ?? ''}
                onChange={(e) => setDraft((d) => (d ? { ...d, description: e.target.value } : d))}
              />
            </label>

            <label className="block text-sm">
              <span className="text-slate-600">태그 (프롬프트 허브 스타일, 쉼표)</span>
              <input
                className={inputClass}
                value={draft.tags.join(', ')}
                onChange={(e) =>
                  setDraft((d) =>
                    d
                      ? {
                          ...d,
                          tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                        }
                      : d,
                  )
                }
              />
            </label>

            <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleSave()}
                className="rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
              >
                저장
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  if (!deleteArmed) {
                    setDeleteArmed(true)
                    setStatus(null)
                    return
                  }
                  void handleDeleteWork(draft)
                }}
                className={`rounded-2xl border px-5 py-2.5 text-sm disabled:opacity-40 ${
                  deleteArmed
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-red-200 text-red-600'
                }`}
              >
                {deleteArmed ? '정말 삭제 (한 번 더)' : '이 영상 삭제'}
              </button>
              {deleteArmed ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setDeleteArmed(false)}
                  className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-600"
                >
                  취소
                </button>
              ) : null}
            </div>
            {status ? (
              <p className={`text-sm ${statusError ? 'text-red-600' : 'text-emerald-700'}`}>
                {status}
              </p>
            ) : (
              <p className="text-[11px] text-slate-400">
                저장은 항상 이 기기에 먼저 반영됩니다. 포트폴리오 홈으로 돌아가면 바로 보입니다.
              </p>
            )}
            <p className="text-[10px] text-slate-400">
              Firebase:{' '}
              {isFirebaseConfigured()
                ? `uandimilestudio · 로그인 ${user?.email ?? '—'}`
                : '설정 없음'}
            </p>
          </section>
        ) : (
          <p className="text-sm text-slate-500">왼쪽에서 영상을 선택하거나 「+ 영상 추가」를 누르세요.</p>
        )}
      </div>
    </div>
  )
}
