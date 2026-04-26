# video-portfolio (영상 포트폴리오)

작품 그리드 + 상세 모달 + 연락처가 있는 영상 포트폴리오 웹사이트입니다.

## 실행

```bash
cd C:\dev\video-portfolio
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속.

## 내용 수정(가장 중요)

`src/content/portfolio.ts`만 수정하면 사이트 내용이 바뀝니다.

- `portfolio.name / headline / bio / contact` 수정
- 작품은 `portfolio.works[]`에 추가/수정
- 썸네일 이미지는 `public/works/`에 넣고 경로를 `/works/파일명.jpg` 형태로 지정
- 유튜브 임베드: `embed: { type: 'youtube', id: 'VIDEO_ID' }`
- 비메오 임베드: `embed: { type: 'vimeo', id: 'VIDEO_ID' }`

## 빌드/배포

```bash
npm run build
npm run preview
```
