import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.uandimiles.studio',
  appName: 'U&I STUDIO',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
  },
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com'],
    },
    SplashScreen: {
      launchAutoHide: false,
      // 0이면 Android 12 스플래시 API가 아예 안 붙어 WebView가 먼저 깜빡임
      launchShowDuration: 60000,
      launchFadeOutDuration: 480,
      backgroundColor: '#09090B',
      androidSplashResourceName: 'splash',
    },
  },
}

export default config
