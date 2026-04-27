import { useEffect, useMemo, useRef, useState } from 'react'
import { portfolio, type PortfolioWork } from './content/portfolio'

function Thumbnail({ id }: { id: string }) {
  const configs: Record<string, { bg1: string; bg2: string; accent: string; label: string; sub: string }> = {
    'work-1': { bg1: '#1a0533', bg2: '#0d0d1a', accent: '#a78bfa', label: '브랜드 필름', sub: 'BRAND FILM' },
    'work-2': { bg1: '#1a0533', bg2: '#0d0d1a', accent: '#a78bfa', label: '서비스 및 제품소개 - 숏츠 광고', sub: 'SHORT-FORM AD' },
    'work-3': { bg1: '#1a0533', bg2: '#0d0d1a', accent: '#a78bfa', label: '공익 홍보영상', sub: 'PUBLIC SERVICE' },
    'work-4': { bg1: '#1a0533', bg2: '#0d0d1a', accent: '#a78bfa', label: '개인 프로필', sub: 'PROFILE VIDEO' },
    'work-5': { bg1: '#1a0533', bg2: '#0d0d1a', accent: '#a78bfa', label: '동화제작', sub: 'STORY FILM' },
  }
  const c = configs[id] ?? { bg1: '#18181b', bg2: '#18181b', accent: '#ffffff', label: '', sub: '' }
  return (
    <svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      <defs>
        <linearGradient id={`g-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.bg1}/>
          <stop offset="100%" stopColor={c.bg2}/>
        </linearGradient>
      </defs>
      <rect width="480" height="300" fill={`url(#g-${id})`}/>
      <rect x="0" y="0" width="480" height="5" fill={c.accent} opacity="0.5"/>
      <rect x="0" y="295" width="480" height="5" fill={c.accent} opacity="0.5"/>
      {[0,40,80,120,160,200,240,280,320,360,400,440].map((x,i) => (
        <rect key={i} x={x+4} y="8" width="28" height="14" rx="2" fill={c.accent} opacity="0.3"/>
      ))}
      <circle cx="240" cy="135" r="44" fill="white" opacity="0.07"/>
      <circle cx="240" cy="135" r="34" fill="white" opacity="0.05"/>
      <polygon points="228,118 228,152 264,135" fill={c.accent} opacity="0.9"/>
      <text x="240" y="205" textAnchor="middle" fill="white" opacity="0.9" fontSize="16" fontWeight="bold" fontFamily="sans-serif">{c.label}</text>
      <text x="240" y="224" textAnchor="middle" fill={c.accent} opacity="0.8" fontSize="11" fontFamily="sans-serif">{c.sub}</text>
    </svg>
  )
}

function App() {
  const [activeWorkId, setActiveWorkId] = useState<string | null>(null)
  const [slideIndex, setSlideIndex] = useState(0)

  const activeWork = useMemo(() => {
    if (!activeWorkId) return null
    return portfolio.works.find((w) => w.id === activeWorkId) ?? null
  }, [activeWorkId])

  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  useEffect(() => { if (!activeWork) return; closeButtonRef.current?.focus() }, [activeWork])
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) { if (e.key === 'Escape') setActiveWorkId(null) }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const kakaoLink = portfolio.contact.kakao ?? 'http://pf.kakao.com/_QxnCzX'
  const email = portfolio.contact.email

  const navLinks = useMemo(() => {
    const links: { label: string; href: string }[] = []
    if (portfolio.contact.youtube) links.push({ label: 'YouTube', href: portfolio.contact.youtube })
    if (portfolio.contact.facebook) links.push({ label: 'Facebook', href: portfolio.contact.facebook })
    if (email) links.push({ label: 'E-mail', href: `mailto:${email}` })
    return links
  }, [email])

  const maxIndex = Math.max(0, portfolio.works.length - 3)

  function WorkCard({ work }: { work: PortfolioWork }) {
    return (
      <button type="button" onClick={() => setActiveWorkId(work.id)}
        className="group relative w-full flex-shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left backdrop-blur transition hover:border-white/20 hover:bg-white/10 sm:w-1/2 lg:w-[calc(33.333%-10px)]">
        <div className="aspect-[16/10] w-full overflow-hidden bg-zinc-950 transition duration-300 group-hover:scale-[1.02]">
          <Thumbnail id={work.id}/>
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
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-red-600 text-sm font-semibold">U&I</div>
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
              <a href={kakaoLink} target="_blank" rel="noreferrer"
                className="rounded-full bg-yellow-400 px-3 py-1.5 text-sm font-semibold text-zinc-950 hover:bg-yellow-300">
                카톡 문의하기
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="relative">
        <section className="mx-auto max-w-6xl px-5 pb-10 pt-4">
          <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                <span>기획 · 촬영 · 편집 · 모션 그래픽</span>
              </div>
              <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
                · 영상기획 · 촬영 ·<br/>· 편집 · 모션 그래픽 ·
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 whitespace-pre-line">
                {portfolio.bio}
              </p>
              <div className="mt-6 flex flex-wrap gap-2 sm:hidden">
                {navLinks.map((l) => (
                  <a key={l.label} href={l.href} target="_blank" rel="noreferrer"
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80">{l.label}</a>
                ))}
                <a href={kakaoLink} target="_blank" rel="noreferrer"
                  className="rounded-full bg-yellow-400 px-3 py-1.5 text-sm font-semibold text-zinc-950">카톡 문의하기</a>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <div className="text-sm font-semibold">유앤아이 소개</div>
              <dl className="mt-4 grid gap-3 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-white/60">주요 작업</dt>
                  <dd className="text-right text-white/80">영상 · 숏폼 · 프로필 제작</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-white/60">제공 범위</dt>
                  <dd className="text-right text-white/80">기획 / 촬영 / 편집 / 모션 그래픽</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-white/60">납품</dt>
                  <dd className="text-right text-white/80">롱폼 / 숏폼, 플랫폼 최적화</dd>
                </div>
              </dl>
              <a href={kakaoLink} target="_blank" rel="noreferrer"
                className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-yellow-300">
                카톡 문의하기
              </a>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-14">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">작품</h2>
              <p className="mt-1 text-sm text-white/60 whitespace-nowrap">카드를 클릭하면 상세하게 볼 수 있어요.</p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-white/60">{portfolio.works.length}개</span>
              <button onClick={() => setSlideIndex(Math.max(0, slideIndex - 1))}
                disabled={slideIndex === 0}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10 disabled:opacity-30">←</button>
              <button onClick={() => setSlideIndex(Math.min(maxIndex, slideIndex + 1))}
                disabled={slideIndex === maxIndex}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10 disabled:opacity-30">→</button>
            </div>
          </div>
          <div className="overflow-hidden">
              <div
                className="grid grid-cols-1 gap-3 sm:flex sm:gap-4 sm:transition-transform sm:duration-300"
                style={window.innerWidth < 640 ? undefined : {
                  transform: `translateX(calc(-${slideIndex} * (100% + 12px)))`,
                  width: 'fit-content',
                }}
              >
              {portfolio.works.map((w) => <WorkCard key={w.id} work={w}/>)}
            </div>
          </div>
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
                <a href={kakaoLink} target="_blank" rel="noreferrer"
                  className="rounded-full bg-yellow-400 px-3 py-1.5 text-sm font-semibold text-zinc-950 hover:bg-yellow-300">
                  카톡 문의하기
                </a>
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
                  <div className="mt-1 text-lg font-semibold">서비스 및 제품소개</div>
                </div>
                <button ref={closeButtonRef} type="button" onClick={() => setActiveWorkId(null)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10">
                  닫기 (Esc)
                </button>
              </div>
              <div className="grid gap-6 p-5 md:grid-cols-[1.5fr_0.9fr]">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
                  {activeWork.embed ? (
                    <div className="aspect-video">
                      <iframe className="h-full w-full"
                        src={activeWork.embed.type === 'youtube' ? `https://www.youtube.com/embed/${activeWork.embed.id}` : `https://player.vimeo.com/video/${activeWork.embed.id}`}
                        title={activeWork.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen/>
                    </div>
                  ) : (
                    <div className="aspect-video grid place-items-center text-sm text-white/60">영상이 없어요.</div>
                  )}
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
                  {activeWork.embed ? (
                    <div className="aspect-video">
                      <iframe className="h-full w-full"
                        src={activeWork.embed.type === 'youtube' ? `https://www.youtube.com/embed/${activeWork.embed.id}` : `https://player.vimeo.com/video/${activeWork.embed.id}`}
                        title={activeWork.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen/>
                    </div>
                  ) : (
                    <div className="aspect-video grid place-items-center text-sm text-white/60">영상이 없어요.</div>
                  )}
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
    </div>
  )
}

export default App