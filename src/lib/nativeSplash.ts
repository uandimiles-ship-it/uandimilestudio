import { isCapacitorNative } from './platform'

const FADE_MS = 420
const CRITICAL_WAIT_MS = 900

export const NATIVE_BRAND_LOGO_SRC = '/brand/uandi-studio-logo.png'

function preloadImages(urls: string[]): Promise<void> {
  const unique = [...new Set(urls.filter(Boolean))]
  if (unique.length === 0) return Promise.resolve()
  return Promise.all(
    unique.map(
      (url) =>
        new Promise<void>((resolve) => {
          const img = new Image()
          img.decoding = 'sync'
          const done = () => resolve()
          img.onload = done
          img.onerror = done
          img.src = url
        }),
    ),
  ).then(() => {})
}

function waitForPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })
}

function waitWithCap(promise: Promise<void>, capMs: number): Promise<void> {
  return Promise.race([
    promise,
    new Promise<void>((resolve) => {
      setTimeout(resolve, capMs)
    }),
  ])
}

let handoffStarted = false

/** 앱 시작 직후 로고만 미리 받기 (React보다 먼저). */
export function preloadNativeBrandLogo(): void {
  if (!isCapacitorNative()) return
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.href = NATIVE_BRAND_LOGO_SRC
  document.head.appendChild(link)
  void preloadImages([NATIVE_BRAND_LOGO_SRC])
}

/** WebView UI는 스플래시가 내려갈 때까지 숨김 (배경색만 보임). */
export function armNativeSplashHandoff(): void {
  if (!isCapacitorNative()) return
  document.documentElement.classList.add('native-splash-armed')
}

type HandoffOptions = {
  /** 스플래시를 내리기 전에 반드시 기다릴 이미지 (상단 로고 등) */
  criticalUrls: string[]
  /** 기다리지 않고 백그라운드만 프리로드 */
  prefetchUrls?: string[]
}

/**
 * 상단 로고 준비 후 스플래시만 페이드 아웃. 본문은 바로 100% 노출 (헤더가 늦게 뜨는 느낌 방지).
 */
export function finishNativeSplashHandoff({ criticalUrls, prefetchUrls = [] }: HandoffOptions): void {
  if (!isCapacitorNative() || handoffStarted) return
  handoffStarted = true

  if (prefetchUrls.length > 0) {
    void preloadImages(prefetchUrls)
  }

  void (async () => {
    await waitWithCap(preloadImages(criticalUrls), CRITICAL_WAIT_MS)
    await waitForPaint()

    document.documentElement.classList.add('app-ui-visible')

    const { SplashScreen } = await import('@capacitor/splash-screen')
    await SplashScreen.hide({ fadeOutDuration: FADE_MS })

    window.setTimeout(() => {
      document.documentElement.classList.remove('native-splash-armed', 'app-ui-visible')
    }, FADE_MS + 80)
  })()
}
