# U&I STUDIO · 영상 포트폴리오

작품 그리드 + 상세 모달 + 연락처가 있는 영상 포트폴리오 (웹 PWA · Capacitor Android).

**공식 웹 주소:** [https://uandimilestudio-828.netlify.app/](https://uandimilestudio-828.netlify.app/)

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저: `http://localhost:5173`

## 내용 수정

- 기본 작품·문구: `src/content/portfolio.ts`
- 썸네일: `public/thumbnails/`, `public/brand/`
- 공식 URL 상수: `src/lib/siteUrl.ts`

## 빌드

```bash
npm run build
npm run preview
```

## Netlify 배포 (프로덕션)

프로젝트: **uandimilestudio-828** (Site ID `f723a582-94ad-422d-8f9a-971b41188a5a`)

```bash
npm run build
npx netlify deploy --prod --dir=dist
```

GitHub 연동 시 같은 프로젝트에 `uandimiles-ship-it/uandimilestudio` · 브랜치 `main` · build `npm run build` · publish `dist`.

Firebase·관리자 설정은 `docs/FIREBASE_하이브리드_설정가이드.md`.

## Android APK

```bash
npm run build
npx cap copy android
cd android
.\gradlew assembleDebug
```

APK: `android/app/build/outputs/apk/debug/app-debug.apk`
