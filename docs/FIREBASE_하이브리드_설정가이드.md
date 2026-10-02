# U&I Studio 포트폴리오 · Firebase 하이브리드 설정

구글 플레이 배포 없이 **웹(Netlify) + 관리자(/admin)** 만으로 작품(제목·설명·YouTube ID·썸네일)을 수정하는 구조입니다.  
나우 AI 앱은 같은 Firestore 컬렉션을 읽도록 나중에 연결할 수 있습니다.

## 동작 방식

| 상태 | 공개 사이트 | 관리 |
|------|-------------|------|
| Firebase 미설정 | `src/content/portfolio.ts` 폴백 | `/admin`에서 설정 안내 |
| Firebase 설정 + Firestore 비어 있음 | 폴백과 동일 | 로그인 후 **로컬 기본값 시드** |
| Firestore에 `portfolio_works` 있음 | Firestore 데이터 | `/admin`에서 편집 |

컬렉션: **`portfolio_works`** (문서 ID = `work-1` 등)  
필드: `sortOrder`, `title`, `subtitle`, `year`, `tags`, `youtubeVideoId`, `description`, `link`, `thumbnailUrl`, `thumbnailAlt`

---

## 1. Firebase 프로젝트 만들기 (본인 Google 로그인 필요)

1. [Firebase Console](https://console.firebase.google.com) → **프로젝트 추가**
2. 프로젝트 ID 예: `uandimilestudio` (`.firebaserc`와 맞추기)
3. **빌드 → Firestore Database** → 프로덕션 모드로 생성 (리전: `asia-northeast3` 권장)
4. **빌드 → Storage** → 기본 버킷 생성
5. **빌드 → Authentication** → **Google** 로그인 사용 설정
6. **프로젝트 설정 → 일반 → 내 앱** → **웹 `</>`** 추가 → `firebaseConfig` 값 복사

## 2. 환경 변수 (Netlify + 로컬)

`.env.example`을 복사해 `.env` 작성:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
(관리자 메일은 코드·규칙에 `uandimiles@gmail.com` 고정 — env 불필요)
```

Netlify (**uandimilestudio-828**): **Site settings → Environment variables**에 동일 키 등록 후 재배포.

**Authentication → Settings → Authorized domains**에 다음을 추가:

- `uandimilestudio-828.netlify.app`
- `localhost` (로컬 개발)

## 3. 보안 규칙 배포

로컬에 [Firebase CLI](https://firebase.google.com/docs/cli) 설치 후:

```powershell
cd "uandimilestudio 폴더"
firebase login
firebase use uandimilestudio
firebase deploy --only firestore:rules,storage
```

관리자는 **`uandimiles@gmail.com`만** (`src/lib/adminEmails.ts`, `firebase/*.rules`). 방패는 이 계정으로 로그인했을 때만 포트폴리오에 보입니다.

## 4. 첫 데이터 올리기

1. [https://uandimilestudio-828.netlify.app/](https://uandimilestudio-828.netlify.app/) → 로고 **3초 길게 누르기** → Google 로그인 (`uandimiles@gmail.com`) → 관리자 방패 → `/admin`
2. **로컬 기본값 시드** 클릭 → 번들 작품이 Firestore에 생성됨
3. 각 작품에서 YouTube ID·설명·썸네일 수정 후 **Firestore에 저장**

## 5. 나우 AI 앱 연동 (추후)

- Flutter `Now-Ai`에서 동일 프로젝트의 `portfolio_works`를 `sortOrder`로 읽기
- 방패(관리자) 화면에서 웹 `/admin` WebView 또는 네이티브 편집 → 같은 컬렉션 쓰기
- 플레이 스토어 프로덕션 배포는 필수 아님 (내부 테스트·APK로 가능)

---

**MCP 참고:** Cursor에 Firebase 전용 MCP가 없으면, 위 콘솔·CLI 단계는 본인 계정으로 진행해야 합니다. 코드는 이미 하이브리드(폴백 + Firestore)로 준비되어 있습니다.
