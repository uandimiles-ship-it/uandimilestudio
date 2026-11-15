export type PortfolioLink = {
  label: string
  href: string
}

import type { ThumbnailLayout } from '../lib/thumbnailLayout'
import { PUBLIC_SITE_URL } from '../lib/siteUrl'

export type PortfolioWork = {
  id: string
  title: string
  /** Now-Ai RecommendedVideo.creator */
  creator?: string
  subtitle?: string
  year?: string
  tags: string[]
  thumbnail: { src: string; alt: string }
  thumbnailLayout?: ThumbnailLayout
  /** Now-Ai accentColorValue (ARGB int) */
  accentColor?: number
  embed?: { type: 'youtube' | 'vimeo'; id: string }
  description?: string
  link?: string
}

export type PortfolioProfile = {
  name: string
  headline: string
  bio: string
  /** 메인 히어로 상단 뱃지 */
  heroTag?: string
  /** 유앤아이 스튜디오 소개 카드 */
  intro?: {
    mainWork: string
    scope: string
    delivery: string
  }
  contact: {
    email?: string
    youtube?: string
    facebook?: string
    threads?: string
    website?: string
    kakao?: string
    /** 숨고 프로필·견적 요청 URL */
    soomgo?: string
    /** 크몽 서비스·전문가 페이지 URL (승인 후 입력 → 견적보기) */
    kmong?: string
  }
  works: PortfolioWork[]
}

export const portfolio: PortfolioProfile = {
  name: 'U&I Studio',
  headline: '영상기획 · 촬영 · 편집 · 모션 그래픽',
  heroTag: '기획 · 촬영 · 편집 · 모션 그래픽',
  bio:
    '사진 한장으로 기획부터 촬영, 편집, 모션 그래픽까지 원스톱으로 진행합니다.\n브랜드 고객 메시지를 "짧고 강하게" 전달하는 영상 콘텐츠를 만듭니다.',
  intro: {
    mainWork: 'AI · 광고 · 홍보 · 이벤트 · 영상 최적화',
    scope: '기획 / 촬영 / 편집 / 모션 그래픽',
    delivery: '롱폼 · 숏폼 · 플랫폼별 최적화 납품',
  },
  contact: {
    email: 'uandimiles@gmail.com',
    youtube:
      'https://www.youtube.com/@%EA%B9%80%EC%A7%80%EA%B8%88.%EC%9D%B4%EC%88%9C%EA%B0%84/videos',
    facebook: 'https://www.facebook.com/UANDIMILES',
    threads: 'https://www.threads.com/@uandimiles',
    website: `${PUBLIC_SITE_URL}/`,
    kakao: 'https://pf.kakao.com/_QxnCzX/chat',
    soomgo: 'https://soomgo.com/profile/users/19272777',
    // 승인 후 내 서비스 공유 링크로 교체 (예: https://kmong.com/gig/...)
    kmong: '',
  },
  works: [
    {
      id: 'work-1',
      title: '(NOW World) 유앤아이 스튜디오 브랜드 필름',
      creator: '유앤아이 스튜디오',
      subtitle: 'NOW World · Total Brand Film',
      year: '2026',
      tags: ['NOW World', '브랜드필름', '유앤아이 스튜디오', '나우월드 브랜드'],
      thumbnail: {
        src: '',
        alt: 'U&I STUDIO — NOW World 브랜드 필름',
      },
      embed: { type: 'youtube', id: '-vM46z8LFWk' },
      link: 'https://youtu.be/-vM46z8LFWk',
      description:
        'NOW World 통합 브랜드 소개 영상입니다. 웹·앱·게임·NOW Books·NOW Music 등 NOW World 나우월드 브랜드를 한 편의 브랜드 필름으로 담았습니다.\n\n영상 제작 · 유앤아이 스튜디오 (U&I STUDIO)',
    },
    {
      id: 'work-2',
      title: '유앤아이 스튜디오 · AI 영상 · 브랜드 광고 · 홍보 대행',
      creator: '유앤아이 스튜디오',
      subtitle: 'AI Video · Brand Ads · YouTube',
      year: '2026',
      tags: ['AI영상제작', '브랜드광고', '홍보대행', '유앤아이 스튜디오'],
      thumbnail: {
        src: '',
        alt: 'U&I STUDIO — AI 영상 · 브랜드 광고 · 홍보 대행 서비스 소개',
      },
      embed: { type: 'youtube', id: 'sf7KVexLvGk' },
      link: 'https://youtu.be/sf7KVexLvGk',
      description:
        'AI 영상 · 브랜드 · 광고 · 홍보 대행 서비스 소개 영상입니다. 사진 한 장을 영화처럼 — 카페·음식점, 앱·IT, 이벤트, 지역 상점 등 브랜드별 광고·홍보 영상을 기획부터 촬영, 편집, 모션 그래픽까지 대행합니다.\n\n영상 제작 · 유앤아이 스튜디오 (U&I STUDIO)',
    },
    {
      id: 'work-3',
      title: '유앤아이 스튜디오 · 이벤트 영상',
      creator: '유앤아이 스튜디오',
      subtitle: 'Event Film · YouTube',
      year: '2026',
      tags: ['이벤트', '돌잔치', '프로포즈', '결혼·기념일'],
      thumbnail: {
        src: '',
        alt: 'U&I STUDIO — 이벤트 영상',
      },
      embed: { type: 'youtube', id: 'yurt7tamNg4' },
      link: 'https://youtu.be/yurt7tamNg4',
      description:
        '가족·연인을 위한 이벤트 영상 모음입니다. 돌잔치·프로포즈·결혼·기념일·칠순잔치·어버이날 등 특별한 날을 영상으로 남깁니다.\n\n영상 제작 · 유앤아이 스튜디오 (U&I STUDIO)',
    },
    {
      id: 'work-4',
      title: 'NOW MUSIC · 18곡 통합본',
      creator: '유앤아이 스튜디오',
      subtitle: 'NOW MUSIC · YouTube',
      year: '2026',
      tags: ['NOW MUSIC', '나우뮤직', '18곡', 'NOW World'],
      thumbnail: {
        src: '',
        alt: 'NOW MUSIC 18곡 통합본',
      },
      embed: { type: 'youtube', id: 'ogRnN_z5wSQ' },
      link: 'https://youtu.be/ogRnN_z5wSQ?si=lZCuM7EH5SX4l371',
      description:
        'NOW MUSIC 18곡 통합본입니다. U&I 러브송·NOW Books OST·시간여행 테마 곡을 한 편에 담았습니다.\n\n영상 제작 · 유앤아이 스튜디오 (U&I STUDIO)',
    },
    {
      id: 'work-13',
      title: '하나님과의 약속 OST · Love (뮤직비디오)',
      creator: '유앤아이 스튜디오',
      subtitle: 'Music Video · Original Song',
      year: '2026',
      tags: ['하나님과의약속', 'OST', '뮤직비디오', '오리지널송'],
      thumbnail: {
        src: '/thumbnails/work-13-love-mv.jpg',
        alt: '하나님과의 약속 OST · Love (뮤직비디오)',
      },
      embed: { type: 'youtube', id: 'JU0LHZfcHXA' },
      link: 'https://youtu.be/JU0LHZfcHXA',
      description:
        '하나님과의 약속 OST 「LOVE (러브)」 감성 뮤직비디오입니다. 이순간이 부른 오리지널 곡(Original Song)을 영상으로 담았습니다.\n\n영상 제작 · 유앤아이 스튜디오 (U&I STUDIO)',
    },
    {
      id: 'work-14',
      title: 'NEON (니온) · 팬메이드',
      creator: '유앤아이 스튜디오',
      subtitle: 'Fan Made · Music Video',
      year: '2026',
      tags: ['NEON', '니온', '팬메이드', 'AIJING'],
      thumbnail: {
        src: '/thumbnails/work-14-neon-fanmade.jpg',
        alt: 'NEON (니온) · 팬메이드',
      },
      embed: { type: 'youtube', id: 'KvMeunfp3bk' },
      link: 'https://youtu.be/KvMeunfp3bk',
      description:
        'A2O LITE의 「NEON (니온)」을 AIJING(아이찡)이 AI 댄스로 표현한 팬메이드 영상입니다.\n\n영상 제작 · 유앤아이 스튜디오 (U&I STUDIO)',
    },
    {
      id: 'work-5',
      title: '나우 애니 · 지브리 감성 러브스토리',
      creator: '유앤아이 스튜디오',
      subtitle: 'NOW ANIME · YouTube',
      year: '2025',
      tags: ['나우 애니', 'NOW World', '지브리 감성', '러브스토리'],
      thumbnail: {
        src: '',
        alt: '나우 애니 지브리 감성 러브스토리 모음',
      },
      embed: { type: 'youtube', id: 'pz3KGGx_OJU' },
      link: 'https://youtu.be/pz3KGGx_OJU',
      description:
        '지브리 감성의 나우 애니 러브스토리 모음입니다. 견우와 직녀·할머니와 소녀·수원 화성 등 유앤아이 세계관 스토리를 담았습니다.\n\n영상 제작 · 유앤아이 스튜디오 (U&I STUDIO)',
    },
    {
      id: 'work-6',
      title: '태조 궁예 · 영화 오프닝 시퀀스',
      creator: '유앤아이 스튜디오',
      subtitle: 'Gungye Sequence · YouTube',
      year: '2026',
      tags: ['궁예', '시퀀스', '역사영화', 'NOW World'],
      thumbnail: {
        src: '',
        alt: '태조 궁예 영화 오프닝 시퀀스',
      },
      embed: { type: 'youtube', id: '47qRi4Cqlfg' },
      link: 'https://youtu.be/47qRi4Cqlfg',
      description:
        '태조 궁예 영화 오프닝 시퀀스 — 마라의 나라(Original)입니다. AI 시네마틱으로 역사·드라마 무드를 담았습니다.\n\n영상 제작 · 유앤아이 스튜디오 (U&I STUDIO)',
    },
    {
      id: 'work-7',
      title: '나우월드 · 세계배틀 댄스',
      creator: '유앤아이 스튜디오',
      subtitle: 'Dance Battle · YouTube',
      year: '2026',
      tags: ['댄스', '배틀', 'NOW World', '숏폼'],
      thumbnail: {
        src: '/thumbnails/work-7-battle-16x9.jpg',
        alt: '나우월드 세계배틀 댄스 경연',
      },
      embed: { type: 'youtube', id: 'PTwoikL4mKA' },
      link: 'https://youtube.com/shorts/PTwoikL4mKA',
      description:
        '나우월드 세계배틀 대전 댄스 경연 하이라이트입니다. 에너지·퍼포먼스 중심의 NOW World 콘텐츠입니다.\n\n영상 제작 · 유앤아이 스튜디오 (U&I STUDIO)',
    },
    {
      id: 'work-8',
      title: '베르세르크 · 팬메이드 실사화',
      creator: '유앤아이 스튜디오',
      subtitle: 'BERSERK Fan Film · YouTube',
      year: '2026',
      tags: ['베르세르크', '팬메이드', '실사화', 'NOW World'],
      thumbnail: {
        src: '',
        alt: '베르세르크 팬메이드 실사화',
      },
      embed: { type: 'youtube', id: 'JJ2Alyigye0' },
      link: 'https://youtu.be/JJ2Alyigye0',
      description:
        '만화·애니 기반 베르세르크(BERSERK) 비공식 팬메이드 실사화 도전 영상입니다.\n\n영상 제작 · 유앤아이 스튜디오 (U&I STUDIO)',
    },
    {
      id: 'work-9',
      title: '애니 주인공 · 촬영 현장 숏폼',
      creator: '유앤아이 스튜디오',
      subtitle: 'Anime Heroes · Shorts',
      year: '2026',
      tags: ['애니', '주인공', '숏폼', '팬메이드'],
      thumbnail: {
        src: '/thumbnails/work-9-anime-heroes-16x9.jpg',
        alt: '팬메이드 애니 주인공 촬영현장',
      },
      embed: { type: 'youtube', id: 'Q3EurcPRJXU' },
      link: 'https://youtube.com/shorts/Q3EurcPRJXU',
      description:
        '이누야샤·원피스·슬램덩크·베르세르크 등 애니 주인공 촬영 현장 컨셉의 팬메이드 숏폼입니다.\n\n영상 제작 · 유앤아이 스튜디오 (U&I STUDIO)',
    },
    {
      id: 'work-10',
      title: '머털도사 · 팬메이드 모음',
      creator: '유앤아이 스튜디오',
      subtitle: 'Fan Made · YouTube',
      year: '2026',
      tags: ['머털도사', '팬메이드', 'NOW World', '숏폼'],
      thumbnail: {
        src: '',
        alt: '머털도사 팬메이드 모음',
      },
      embed: { type: 'youtube', id: '0TGUvU3-1xQ' },
      link: 'https://youtu.be/0TGUvU3-1xQ',
      description:
        'NOW World 비공식 팬메이드 — 머털도사 모음집입니다.\n\n영상 제작 · 유앤아이 스튜디오 (U&I STUDIO)',
    },
    {
      id: 'work-12',
      title: '머털도사 · 실사화 (팬메이드)',
      creator: '유앤아이 스튜디오',
      subtitle: 'Live-Action Fan Made · Shorts',
      year: '2026',
      tags: ['머털도사', '실사화', '팬메이드', 'AI영상'],
      thumbnail: {
        src: '/thumbnails/work-12-mutul-live-action.jpg',
        alt: '머털도사 · 실사화 (팬메이드)',
      },
      embed: { type: 'youtube', id: 'tDFYasjY1wU' },
      link: 'https://youtube.com/shorts/tDFYasjY1wU',
      description:
        '추억의 만화 머털도사를 실사 영화처럼 재해석한 팬메이드 작품입니다. AI 영상으로 머털도사의 세계를 실제 배우와 장면처럼 담아 보았습니다.\n\n영상 제작 · 유앤아이 스튜디오 (U&I STUDIO)',
    },
    {
      id: 'work-11',
      title: 'NOW & 유앤아이 · 짤 모음집',
      creator: '유앤아이 스튜디오',
      subtitle: 'NOW CONTENT · YouTube',
      year: '2025',
      tags: ['짤모음', 'NOW World', '바이럴', '숏폼'],
      thumbnail: {
        src: '',
        alt: 'NOW 유앤아이 짤 모음집',
      },
      embed: { type: 'youtube', id: 'KCcVqZX6pTE' },
      link: 'https://youtu.be/KCcVqZX6pTE',
      description:
        'NOW & 유앤아이 놀이터 짤 모음입니다. 생쥐대학·용의나라·엘리스·스케이트보드·뽀송이 강아지 등 바이럴·유머 숏을 모았습니다.\n\n영상 제작 · 유앤아이 스튜디오 (U&I STUDIO)',
    },
  ],
}