import { App } from '@capacitor/app'
import { useEffect } from 'react'

import { isCapacitorNative } from '../lib/platform'

/** 홈: 뒤로가기 → 앱 종료. 상세 모달 열림: 뒤로가기 → 모달 닫기 */
export function useNativeBackButton(onCloseOverlay: () => void, overlayOpen: boolean) {
  useEffect(() => {
    if (!isCapacitorNative()) return
    let removed = false
    const sub = App.addListener('backButton', () => {
      if (overlayOpen) {
        onCloseOverlay()
        return
      }
      void App.exitApp()
    })
    return () => {
      if (removed) return
      removed = true
      void sub.then((h) => h.remove())
    }
  }, [overlayOpen, onCloseOverlay])
}
