import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminShield } from './components/AdminShield'
import { useOwnerLogoBootstrap } from './components/OwnerBootstrap'
import { WorkThumbnail } from './components/WorkThumbnail'
import { portfolio, type PortfolioWork } from './content/portfolio'
import { resolveWorkYoutubeId } from './lib/youtubeLink'
import { usePortfolioWorks } from './hooks/usePortfolioWorks'

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
  const [activeWorkId, setActiveWorkId] = useState<string | null>(null)

  const activeWork = useMemo(() => {
    if (!activeWorkId) return null
    return works.find((w) => w.id === activeWorkId) ?? null
  }, [activeWorkId, works])

  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  useEffect(() => { if (!activeWork) return; closeButtonRef.current?.focus() }, [activeWork])
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) { if (e.key === 'Escape') setActiveWorkId(null) }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const kakaoLink = portfolio.contact.kakao ?? 'http://pf.kakao.com/_QxnCzX'
  const soomgoLink = portfolio.contact.soomgo?.trim() ?? ''
  const email = portfolio.contact.email

  const navLinks = useMemo(() => {
    const links: { label: string; href: string }[] = []
    if (portfolio.contact.youtube) links.push({ label: 'YouTube', href: portfolio.contact.youtube })
    if (portfolio.contact.facebook) links.push({ label: 'Facebook', href: portfolio.contact.facebook })
    if (email) links.push({ label: 'E-mail', href: `mailto:${email}` })
    return links
  }, [email])

  const quoteReady = soomgoLink.length > 0
  const quoteBtnClass =
    'rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-zinc-950 hover:bg-white/90'
  const kakaoBtnClass =
    'rounded-full bg-yellow-400 px-3 py-1.5 text-sm font-semibold text-zinc-950 hover:bg-yellow-300'

  function QuoteButton({ className = '' }: { className?: string }) {
    if (quoteReady) {
      return (
        <a
          href={soomgoLink}
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
        title="숨고 링크 연결 예정"
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
        <a href={kakaoLink} target="_blank" rel="noreferrer" className={linkClass}>
          유앤아이 스튜디오 문의
        </a>
      </div>
    )
  }

  function WorkCard({ work }: { work: PortfolioWork }) {
    return (
      <button type="button" onClick={() => setActiveWorkId(work.id)}
        className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left backdrop-blur transition-colors hover:border-white/20 hover:bg-white/10">
        <div className="aspect-video w-full overflow-hidden bg-zinc-950">
          <WorkThumbnail work={work}/>
        </div>
        <div className="p-4">
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
              <img
                src="/brand/uandi-studio-logo.png"
                alt="U&I STUDIO"
                width={40}
                height={40}
                draggable={false}
                className="h-10 w-10 select-none rounded-2xl object-cover touch-none"
                {...logoBootstrap}
              />
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
          {loading ? (
            <p className="text-sm text-white/50">작품 불러오는 중…</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              {works.map((w) => <WorkCard key={w.id} work={w} />)}
            </div>
          )}
        </section>

        <footer className="mx-auto max-w-6xl px-5 pb-12">
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
        activeWork.id === 'work-2' ? (
          <div role="dialog" aria-modal="true"
            className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
            onMouseDown={(e) => { if (e.target === e.currentTarget) setActiveWorkId(null) }}>
            <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
                <div>
                  <div className="text-sm text-white/60">{activeWork.subtitle ?? ''}{activeWork.year ? ` · ${activeWork.year}` : ''}</div>
                  <div className="mt-1 text-lg font-semibold">{activeWork.title}</div>
                </div>
                <button ref={closeButtonRef} type="button" onClick={() => setActiveWorkId(null)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10">
                  닫기 (Esc)
                </button>
              </div>
              <div className="grid gap-6 p-5 md:grid-cols-[1.5fr_0.9fr]">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
                  <WorkYoutubeEmbed work={activeWork} />
                </div>
                <div className="space-y-4">
                  {activeWork.description ? (
                    <div>
                      <div className="text-sm font-semibold">설명</div>
                      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-white/70">{activeWork.description}</p>
                    </div>
                  ) : null}
                  <div>
                    <div className="text-sm font-semibold">태그</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {activeWork.tags.map((t) => (
                        <span key={t} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/70 notranslate" translate="no">{t}</span>
                      ))}
                    </div>
                  </div>
                  <WorkDetailLinks work={activeWork} />
                  <a href={kakaoLink} target="_blank" rel="noreferrer"
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-yellow-300">
                    카톡으로 문의하기
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div role="dialog" aria-modal="true"
            className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
            onMouseDown={(e) => { if (e.target === e.currentTarget) setActiveWorkId(null) }}>
            <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
                <div>
                  <div className="text-sm text-white/60">{activeWork.subtitle ?? ''}{activeWork.year ? ` · ${activeWork.year}` : ''}</div>
                  <div className="mt-1 text-lg font-semibold">{activeWork.title}</div>
                </div>
                <button ref={closeButtonRef} type="button" onClick={() => setActiveWorkId(null)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10">
                  닫기 (Esc)
                </button>
              </div>
              <div className="grid gap-6 p-5 md:grid-cols-[1.5fr_0.9fr]">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
                  <WorkYoutubeEmbed work={activeWork} />
                </div>
                <div className="space-y-4">
                  {activeWork.description ? (
                    <div>
                      <div className="text-sm font-semibold">설명</div>
                      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-white/70">{activeWork.description}</p>
                    </div>
                  ) : null}
                  <div>
                    <div className="text-sm font-semibold">태그</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {activeWork.tags.map((t) => (
                        <span key={t} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/70 notranslate" translate="no">{t}</span>
                      ))}
                    </div>
                  </div>
                  <WorkDetailLinks work={activeWork} />
                  <a href={kakaoLink} target="_blank" rel="noreferrer"
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-yellow-300">
                    카톡으로 문의하기
                  </a>
                </div>
              </div>
            </div>
          </div>
        )
      ) : null}

      <AdminShield />
    </div>
  )
}

export default App