import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminShield } from './components/AdminShield'
import { useStudioBudgetPause, WorldBudgetPause } from './components/WorldBudgetGate'
import { useOwnerLogoBootstrap } from './components/OwnerBootstrap'
import { WorkThumbnail } from './components/WorkThumbnail'
import { portfolio, type PortfolioWork } from './content/portfolio'
import { finishNativeSplashHandoff, NATIVE_BRAND_LOGO_SRC } from './lib/nativeSplash'
import { isCapacitorNative } from './lib/platform'
import { resolveWorkThumbnailSrc } from './lib/thumbnailResolve'
import { resolveWorkYoutubeId } from './lib/youtubeLink'
import { useNativeBackButton } from './hooks/useNativeBackButton'
import { usePortfolioWorks } from './hooks/usePortfolioWorks'
const NOW_AI_URL = 'https://play.google.com/store/apps/details?id=com.uandimiles.nowai'

function WorkYoutubeEmbed({ work }: { work: PortfolioWork }) {
  const id = resolveWorkYoutubeId(work)
  if (!id) {
    return (
      <div className="aspect-video grid place-items-center px-4 text-center text-sm text-white/60">
        영상 링크가 없거나 YouTube 주소를 인식하지 못했습니다.
      </div>
    )
  }
  return (
    <div className="aspect-video">
      <iframe
        className="h-full w-full"
        src={`https://www.youtube.com/embed/${id}`}
        title={work.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}

function App() {
  const navigate = useNavigate()
  const logoBootstrap = useOwnerLogoBootstrap(() => navigate('/admin'))
  const { works, loading } = usePortfolioWorks()
  const budgetPause = useStudioBudgetPause()
  const [activeWorkId, setActiveWorkId] = useState<string | null>(null)

  const activeWork = useMemo(() => {
    if (!activeWorkId) return null
    return works.find((w) => w.id === activeWorkId) ?? null
  }, [activeWorkId, works])

  const splashHandoffDone = useRef(false)

  useLayoutEffect(() => {
    if (!isCapacitorNative() || splashHandoffDone.current) return
    splashHandoffDone.current = true
    const thumbPrefetch = works
      .slice(0, 2)
      .map((w) => resolveWorkThumbnailSrc(w))
      .filter((u): u is string => Boolean(u))
    finishNativeSplashHandoff({
      criticalUrls: [NATIVE_BRAND_LOGO_SRC],
      prefetchUrls: thumbPrefetch,
    })
  }, [works])

  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const workDetailVideoRef = useRef<HTMLDivElement | null>(null)
  const [workDetailMetaMaxH, setWorkDetailMetaMaxH] = useState<number | undefined>()

  useLayoutEffect(() => {
    if (!activeWork || isCapacitorNative()) {
      setWorkDetailMetaMaxH(undefined)
      return
    }
    const el = workDetailVideoRef.current
    if (!el) return
    const sync = () => {
      if (window.matchMedia('(min-width: 768px)').matches) {
        const h = Math.round(el.getBoundingClientRect().height)
        setWorkDetailMetaMaxH(h > 0 ? h : undefined)
      } else {
        setWorkDetailMetaMaxH(undefined)
      }
    }
    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    window.addEventListener('resize', sync)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', sync)
    }
  }, [activeWork?.id])

  useEffect(() => { if (!activeWork) return; closeButtonRef.current?.focus() }, [activeWork])
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) { if (e.key === 'Escape') setActiveWorkId(null) }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const closeActiveWork = useCallback(() => setActiveWorkId(null), [])
  useNativeBackButton(closeActiveWork, Boolean(activeWork))

  const kakaoLink = portfolio.contact.kakao ?? 'http://pf.kakao.com/_QxnCzX'
  const soomgoLink = portfolio.contact.soomgo?.trim() ?? ''
  const kmongLink = portfolio.contact.kmong?.trim() ?? ''
  const email = portfolio.contact.email

  const navLinks = useMemo(() => {
    const links: { label: string; href: string }[] = []
    if (portfolio.contact.youtube) links.push({ label: 'YouTube', href: portfolio.contact.youtube })
    if (portfolio.contact.facebook) links.push({ label: 'Facebook', href: portfolio.contact.facebook })
    if (email) links.push({ label: 'E-mail', href: `mailto:${email}` })
    return links
  }, [email])

  const quoteHref = kmongLink || soomgoLink
  const quoteReady = quoteHref.length > 0
  const studioInquiryHref = soomgoLink || kakaoLink
  const quoteBtnClass =
    'rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-zinc-950 hover:bg-white/90'
  const kakaoBtnClass =
    'rounded-full bg-yellow-400 px-3 py-1.5 text-sm font-semibold text-zinc-950 hover:bg-yellow-300'

  function QuoteButton({ className = '' }: { className?: string }) {
    if (quoteReady) {
      return (
        <a
          href={quoteHref}
          target="_blank"
          rel="noreferrer"
          className={`${quoteBtnClass} ${className}`}
        >
          견적보기
        </a>
      )
    }
    return (
      <span
        className={`${quoteBtnClass} cursor-default opacity-80 ${className}`}
        title="견적 링크 연결 예정"
      >
        견적보기
      </span>
    )
  }

  function KakaoButton({ className = '' }: { className?: string }) {
    return (
      <a href={kakaoLink} target="_blank" rel="noreferrer" className={`${kakaoBtnClass} ${className}`}>
        카톡 문의하기
      </a>
    )
  }

  function WorkDetailLinks({ work }: { work: PortfolioWork }) {
    const videoLink = work.link?.trim()
    const linkClass =
      'rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 hover:border-white/20 hover:bg-white/10'
    return (
      <div className="flex flex-wrap gap-2">
        {videoLink ? (
          <a href={videoLink} target="_blank" rel="noreferrer" className={linkClass}>
            YouTube에서 보기
          </a>
        ) : null}
        <a href={studioInquiryHref} target="_blank" rel="noreferrer" className={linkClass}>
          유앤아이 스튜디오 문의
        </a>
      </div>
    )
  }

  useEffect(() => {
    for (const id of ['work-1', 'work-2'] as const) {
      const w = portfolio.works.find((item) => item.id === id)
      if (!w) continue
      const href = resolveWorkThumbnailSrc(w)
      if (!href) continue
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = href
      document.head.appendChild(link)
    }
  }, [])

  function WorkCard({ work, priorityThumb }: { work: PortfolioWork; priorityThumb?: boolean }) {
    return (
      <button
        type="button"
        onClick={() => setActiveWorkId(work.id)}
        className="portfolio-work-card group flex h-full w-full min-w-0 flex-col rounded-2xl p-2 text-left outline-none ring-1 ring-inset ring-white/10 transition-[background-color,box-shadow,transform] duration-200 hover:bg-white/[0.12] hover:ring-white/26 hover:shadow-lg hover:shadow-black/25 active:scale-[0.995] active:bg-white/[0.13] active:ring-white/30 focus-visible:bg-white/[0.12] focus-visible:ring-2 focus-visible:ring-white/32 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
      >
        <div
          className="portfolio-work-card-thumb relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-zinc-950 ring-1 ring-inset ring-white/10 transition-[box-shadow,background-color] duration-200 group-hover:ring-white/38 group-hover:bg-zinc-800 group-active:ring-white/40 group-active:bg-zinc-800"
        >
          <WorkThumbnail work={work} priority={priorityThumb} />
          <div
            className="pointer-events-none absolute inset-0 z-10 bg-white/0 transition-colors duration-200 group-hover:bg-white/[0.09] group-active:bg-white/[0.11]"
            aria-hidden
          />
        </div>
        <div className="px-1 pb-1 pt-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm text-white/60">{work.subtitle ?? ''}</div>
              <div className="mt-1 line-clamp-2 text-base font-semibold text-white">{work.title}</div>
            </div>
            {work.year ? <div className="text-sm text-white/50">{work.year}</div> : null}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {work.tags.slice(0, 4).map((t) => (
              <span key={t} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/70">{t}</span>
            ))}
          </div>
        </div>
      </button>
    )
  }

  return (
    <div className="min-h-dvh bg-zinc-950 text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-20%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-fuchsia-500/15 blur-3xl"/>
        <div className="absolute right-[-10%] top-[10%] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-3xl"/>
      </div>

      <header className="relative">
        <div className="mx-auto max-w-6xl px-5 py-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 rounded-2xl bg-zinc-900 ring-1 ring-inset ring-white/10">
                <img
                  src={NATIVE_BRAND_LOGO_SRC}
                  alt="U&I STUDIO"
                  width={40}
                  height={40}
                  draggable={false}
                  loading="eager"
                  decoding="sync"
                  fetchPriority="high"
                  className="h-10 w-10 select-none rounded-2xl object-cover touch-none"
                  {...logoBootstrap}
                />
              </span>
              <div>
                <div className="text-sm text-white/60">Video Portfolio</div>
                <div className="text-base font-semibold">{portfolio.name}</div>
              </div>
            </div>
            <nav className="hidden items-center gap-2 sm:flex">
              {navLinks.map((l) => (
                <a key={l.label} href={l.href} target="_blank" rel="noreferrer"
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 hover:border-white/20 hover:bg-white/10">{l.label}</a>
              ))}
              <QuoteButton />
              <KakaoButton />
            </nav>
          </div>
        </div>
      </header>

      <main className="relative">
        <section className="mx-auto max-w-6xl px-5 pb-10 pt-4">
          <div className="flex flex-col gap-8">
            <div>
              <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                <span className="leading-snug">{portfolio.heroTag}</span>
              </div>
              <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
                · AI 영상 · 기획 · 촬영 ·<br />
                · 편집 · 모션 그래픽 ·
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 whitespace-pre-line">
                {portfolio.bio}
              </p>
              <div className="mt-6 space-y-2 sm:hidden">
                <div className="flex flex-wrap gap-2">
                  {navLinks.map((l) => (
                    <a key={l.label} href={l.href} target="_blank" rel="noreferrer"
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80">{l.label}</a>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <QuoteButton />
                  <KakaoButton />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <div className="text-sm font-semibold">유앤아이 스튜디오 소개</div>
              <dl className="mt-4 grid gap-3 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-white/60">주요 작업</dt>
                  <dd className="text-right text-white/80">
                    {portfolio.intro?.mainWork ?? 'AI · 광고 · 홍보 · 이벤트 · 영상 최적화'}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-white/60">제공 범위</dt>
                  <dd className="text-right text-white/80">
                    {portfolio.intro?.scope ?? '기획 / 촬영 / 편집 / 모션 그래픽'}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-white/60">납품</dt>
                  <dd className="text-right text-white/80">
                    {portfolio.intro?.delivery ?? '롱폼 · 숏폼 · 플랫폼별 최적화 납품'}
                  </dd>
                </div>
              </dl>
              <div className="mt-5 flex flex-wrap gap-2">
                <QuoteButton />
                <KakaoButton />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-14">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">작품</h2>
              <p className="mt-1 text-sm text-white/60">카드를 클릭하면 상세하게 볼 수 있습니다.</p>
            </div>
            <span className="text-sm text-white/60">{works.length}개</span>
          </div>
          <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2 sm:gap-4">
            {works.map((w, index) => (
              <WorkCard key={w.id} work={w} priorityThumb={index < 2} />
            ))}
          </div>
          {loading ? <p className="mt-3 text-sm text-white/40">최신 작품 정보 동기화 중…</p> : null}
        </section>

        <footer className="mx-auto max-w-6xl px-5 pb-24">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm text-white/60">CONTACT US</div>
                <div className="mt-1 text-base font-semibold">{portfolio.name}</div>
                {email ? <div className="mt-1 text-sm text-white/70">{email}</div> : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {navLinks.map((l) => (
                  <a key={l.label} href={l.href} target="_blank" rel="noreferrer"
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 hover:border-white/20 hover:bg-white/10">{l.label}</a>
                ))}
                <QuoteButton />
                <KakaoButton />
              </div>
            </div>
          </div>
          <div className="mt-6 text-center text-xs text-white/40">
            © 2026 U&I Studio. All rights reserved. by 이순간
          </div>
        </footer>
      </main>

      {activeWork ? (
        <div
          role="dialog"
          aria-modal="true"
          className="work-detail-overlay fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setActiveWorkId(null)
          }}
        >
          <div className="mx-auto flex min-h-full w-full max-w-4xl items-center justify-center py-8 sm:py-12">
            <div className="work-detail-panel w-full overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
                <div>
                  <div className="text-sm text-white/60">
                    {activeWork.subtitle ?? ''}
                    {activeWork.year ? ` · ${activeWork.year}` : ''}
                  </div>
                  <div className="mt-1 text-lg font-semibold">{activeWork.title}</div>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => setActiveWorkId(null)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                >
                  닫기 (Esc)
                </button>
              </div>
              <div className="work-detail-body grid gap-5 p-5 md:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] md:items-start md:gap-4">
                <div
                  ref={workDetailVideoRef}
                  className="work-detail-video w-full shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900"
                >
                  <WorkYoutubeEmbed work={activeWork} />
                </div>
                <div
                  className="work-detail-meta flex min-h-0 min-w-0 flex-col"
                  style={
                    workDetailMetaMaxH && !isCapacitorNative()
                      ? { maxHeight: workDetailMetaMaxH }
                      : undefined
                  }
                >
                  <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-0.5 md:space-y-2 md:text-[13px] md:leading-snug">
                    {activeWork.description ? (
                      <div>
                        <div className="text-sm font-semibold md:text-xs">설명</div>
                        <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-white/70 md:mt-0.5 md:text-[13px] md:leading-snug">
                          {activeWork.description}
                        </p>
                      </div>
                    ) : null}
                    <div>
                      <div className="text-sm font-semibold md:text-xs">태그</div>
                      <div className="mt-1.5 flex flex-wrap gap-1.5 md:mt-1">
                        {activeWork.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/70 notranslate md:px-2 md:py-0.5 md:text-[11px]"
                            translate="no"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 shrink-0 space-y-2 border-t border-white/10 pt-2.5 md:mt-1.5 md:space-y-1.5 md:pt-2">
                    <WorkDetailLinks work={activeWork} />
                    <a
                      href={kakaoLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-full items-center justify-center rounded-xl bg-yellow-400 px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-yellow-300 md:rounded-lg md:py-1.5 md:text-xs"
                    >
                      카톡으로 문의하기
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <a
        href={NOW_AI_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="NOW AI · NOW WORLD"
        className="now-ai-fab flex items-center gap-2.5 rounded-2xl border border-white/15 bg-zinc-900/90 py-2 pl-2 pr-4 shadow-lg shadow-black/40 backdrop-blur transition hover:border-violet-300/40 hover:bg-zinc-800/90"
      >
        <img src="/brand/now-ai-icon.png" alt="" width={34} height={34} className="h-[34px] w-[34px] rounded-[10px]" draggable={false} />
        <span className="flex flex-col leading-tight">
          <span className="text-[10px] tracking-[0.18em] text-white/55">NOW WORLD</span>
          <span className="bg-gradient-to-r from-violet-300 to-sky-300 bg-clip-text text-sm font-bold text-transparent">NOW AI</span>
        </span>
      </a>

      {budgetPause.paused ? <WorldBudgetPause message={budgetPause.message} /> : null}

      <AdminShield />
    </div>
  )
}

export default App