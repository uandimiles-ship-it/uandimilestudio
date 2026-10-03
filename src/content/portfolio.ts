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
    /** 숨고 프로필·견적 페이지 URL (등록 후 입력) */
    soomgo?: string
  }
  works: PortfolioWork[]
}

export const portfolio: PortfolioProfile = {
  name: 'U&I Studio',
  headline: '영상기획 · 촬영 · 편집 · 모션 그래픽',
  heroTag: '기획 · 촬영 · 편집 · 모션 그래픽',
  bio:
    '사진 한장으로 기획부터 촬영, 편집, 모션 그래픽까지 원스톱으로 진행합니다.\n브랜드 고객 메시지를 "짧고 강하게" 전달하는 영상\n콘텐츠를 만듭니다.',
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
  },
  works: [
    {
      id: 'work-1',
      title: '(NOW World) 유앤아이 스튜디오 브랜드 필름',
      creator: '유앤아이 스튜디오',
      subtitle: 'NOW World · Total Brand Film',
      year: '2026',
      tags: ['NOW World', '브랜드필름', '유앤아이 스튜디오', '8브랜드'],
      thumbnail: {
        src: '/thumbnails/work-1-uandi-studio.png',
        alt: 'U&I STUDIO — NOW World 브랜드 필름',
      },
      embed: { type: 'youtube', id: '6bSicVeKD1Y' },
      link: 'https://youtu.be/6bSicVeKD1Y?si=D0_WZPOrYRJ6DfDF',
      description:
        'NOW World 통합 브랜드 소개 영상입니다. 웹·앱·게임·NOW Books·NOW Music 등 NOW World 8브랜드를 한 편의 브랜드 필름으로 담았습니다.\n\n영상 제작 · 유앤아이 스튜디오 (U&I STUDIO)',
    },
    {
      id: 'work-2',
      title: '유앤아이 스튜디오 · 브랜드별 광고 영상',
      creator: '유앤아이 스튜디오',
      subtitle: 'Brand Ads · YouTube',
      year: '2026',
      tags: ['브랜드광고', '유앤아이 스튜디오', '숏폼', '가상브랜드'],
      thumbnail: {
        src: '/thumbnails/work-2-uandi-studio.png',
        alt: 'U&I STUDIO — 브랜드별 광고 영상',
      },
      embed: { type: 'youtube', id: 'aUAqQjkaIgA' },
      link: 'https://youtu.be/aUAqQjkaIgA?si=EVR2zz5Ks4fzJ7AX',
      description:
        '유튜브 가상 브랜드 광고 모음 영상입니다. 유앤아이 신발·향수·화장품·숯불갈비·인테리어·유앤아이 버섯·유앤아이 커피·다이어트·의류·청소기 등 브랜드별 숏 광고를 한 편에 담았습니다.\n\n영상 제작 · 유앤아이 스튜디오 (U&I STUDIO)',
    },
    {
      id: 'work-3',
      title: '유앤아이 스튜디오 · 이벤트 영상',
      creator: '유앤아이 스튜디오',
      subtitle: 'Event Film · YouTube',
      year: '2026',
      tags: ['이벤트', '돌잔치', '프로포즈', '결혼·기념일'],
      thumbnail: {
        src: '/thumbnails/work-3-uandi-studio.png',
        alt: 'U&I STUDIO — 이벤트 영상',
      },
      embed: { type: 'youtube', id: '2MySKc88UxU' },
      link: 'https://youtu.be/2MySKc88UxU?si=6qGdG_RYJjBwZfAX',
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
        src: '/thumbnails/work-4-youtube.jpg',
        alt: 'NOW MUSIC 18곡 통합본',
      },
      embed: { type: 'youtube', id: 'ogRnN_z5wSQ' },
      link: 'https://youtu.be/ogRnN_z5wSQ?si=lZCuM7EH5SX4l371',
      description:
        'NOW MUSIC 18곡 통합본입니다. U&I 러브송·NOW Books OST·시간여행 테마 곡을 한 편에 담았습니다.\n\n영상 제작 · 유앤아이 스튜디오 (U&I STUDIO)',
    },
    {
      id: 'work-5',
      title: '나우 애니 · 지브리 감성 러브스토리',
      creator: '유앤아이 스튜디오',
      subtitle: 'NOW ANIME · YouTube',
      year: '2025',
      tags: ['나우 애니', 'NOW World', '지브리 감성', '러브스토리'],
      thumbnail: {
        src: '/thumbnails/work-5-youtube.jpg',
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
        src: '/thumbnails/work-6-youtube.jpg',
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
        src: '/thumbnails/work-7-youtube.jpg',
        alt: '나우월드 세계배틀 댄스 경연',
      },
      embed: { type: 'youtube', id: 'sofXgOkQd0c' },
      link: 'https://youtube.com/shorts/sofXgOkQd0c',
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
        src: '/thumbnails/work-8-youtube.jpg',
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
        src: '/thumbnails/work-9-fan-anime-collage.jpg?v=13',
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
        src: '/thumbnails/work-10-youtube.jpg',
        alt: '머털도사 팬메이드 모음',
      },
      embed: { type: 'youtube', id: 'O0D6jXsjoKQ' },
      link: 'https://youtu.be/O0D6jXsjoKQ',
      description:
        'NOW World 비공식 팬메이드 — 머털도사 모음집입니다.\n\n영상 제작 · 유앤아이 스튜디오 (U&I STUDIO)',
    },
    {
      id: 'work-11',
      title: 'NOW & 유앤아이 · 짤 모음집',
      creator: '유앤아이 스튜디오',
      subtitle: 'NOW CONTENT · YouTube',
      year: '2025',
      tags: ['짤모음', 'NOW World', '바이럴', '숏폼'],
      thumbnail: {
        src: '/thumbnails/work-11-youtube.jpg',
        alt: 'NOW 유앤아이 짤 모음집',
      },
      embed: { type: 'youtube', id: 'KCcVqZX6pTE' },
      link: 'https://youtu.be/KCcVqZX6pTE',
      description:
        'NOW & 유앤아이 놀이터 짤 모음입니다. 생쥐대학·용의나라·엘리스·스케이트보드·뽀송이 강아지 등 바이럴·유머 숏을 모았습니다.\n\n영상 제작 · 유앤아이 스튜디오 (U&I STUDIO)',
    },
  ],
}