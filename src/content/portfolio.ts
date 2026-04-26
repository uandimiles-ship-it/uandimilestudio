export type PortfolioLink = {
  label: string
  href: string
}

export type PortfolioWork = {
  id: string
  title: string
  subtitle?: string
  year?: string
  tags: string[]
  thumbnail: { src: string; alt: string }
  embed?: { type: 'youtube' | 'vimeo'; id: string }
  description?: string
  link?: string
}

export type PortfolioProfile = {
  name: string
  headline: string
  bio: string
  contact: {
    email?: string
    youtube?: string
    facebook?: string
    kakao?: string
  }
  works: PortfolioWork[]
}

export const portfolio: PortfolioProfile = {
  name: 'U&I Studio',
  headline: '영상기획 · 촬영 · 편집 · 모션 그래픽',
  bio: '브랜드 고객 메시지를 "짧고 강하게" 전달하는 영상 콘텐츠를 만듭니다.\n기획부터 촬영, 편집, 모션 그래픽까지 원스톱으로 진행합니다.',
  contact: {
    email: 'citytravelmiles@gmail.com',
    youtube: 'https://www.youtube.com/@이순간.김지금',
    facebook: 'https://www.facebook.com/UANDIMILES',
    kakao: 'https://pf.kakao.com/_QxnCzX/chat',
  },
  works: [
    {
      id: 'work-1',
      title: '브랜드 필름 – 런칭 캠페인',
      subtitle: 'Brand Film',
      year: '2026',
      tags: ['브랜드필름', '캠페인', '편집'],
      thumbnail: { src: '', alt: '' },
      embed: { type: 'youtube', id: 'xVdEEO6BR_I' },
      link: 'https://youtube.com/shorts/xVdEEO6BR_I?feature=share',
      description: '런칭 캠페인용 브랜드 필름.',
    },
    {
      id: 'work-2',
      title: '제품 소개 – 숏폼 광고',
      subtitle: 'Short-form Ad',
      year: '2025',
      tags: ['숏폼', '광고', '모션'],
      thumbnail: { src: '', alt: '' },
      embed: { type: 'youtube', id: 'NoMqG4FkfnM' },
      link: 'https://youtube.com/shorts/NoMqG4FkfnM?feature=share',
      description: '핵심 메시지를 15초 안에 전달하는 숏폼 광고.',
    },
    {
      id: 'work-3',
      title: '공익 – 홍보 영상',
      subtitle: 'Public Service Promo',
      year: '2024',
      tags: ['공익', '홍보', '컬러그레이딩'],
      thumbnail: { src: '', alt: '' },
      embed: { type: 'youtube', id: 'Fhm7Hv7Lwdc' },
      link: 'https://youtube.com/shorts/Fhm7Hv7Lwdc?feature=share',
      description: '공익 홍보 영상.',
    },
    {
      id: 'work-4',
      title: '개인 프로필 영상',
      subtitle: 'Profile Video',
      year: '2025',
      tags: ['프로필', '숏폼', '영상제작'],
      thumbnail: { src: '', alt: '' },
      embed: { type: 'youtube', id: 'kFCax-MBcz8' },
      link: 'https://youtube.com/shorts/kFCax-MBcz8?feature=share',
      description: '개인 프로필 영상 및 감성 이벤트 영상제작',
    },
    {
      id: 'work-5',
      title: '동화제작',
      subtitle: 'Story Film',
      year: '2025',
      tags: ['동화', '스토리텔링', '모션 그래픽'],
      thumbnail: { src: '', alt: '' },
      embed: { type: 'youtube', id: 'lytDhIwdSI8' },
      link: 'https://youtube.com/shorts/lytDhIwdSI8?feature=share',
      description: '감성적인 스토리텔링으로 풀어낸 동화 영상.',
    },
  ],
}