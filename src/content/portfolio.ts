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
    email: 'uandimiles@gmail.com',
    youtube: 'https://www.youtube.com/@%EA%B9%80%EC%A7%80%EA%B8%88.%EC%9D%B4%EC%88%9C%EA%B0%84',
    facebook: 'https://www.facebook.com/UANDIMILES',
    kakao: 'https://pf.kakao.com/_QxnCzX/chat',
  },
  works: [
    {
      id: 'work-1',
      title: 'NOW World · 7브랜드 종합 소개',
      subtitle: 'Brand Film',
      year: '2026',
      tags: ['NOW World', '브랜드필름', '7브랜드'],
      thumbnail: { src: '', alt: '' },
      embed: { type: 'youtube', id: '6bSicVeKD1Y' },
      link: 'https://youtu.be/6bSicVeKD1Y',
      description: '유앤아이 스튜디오 · NOW World 7브랜드를 한 영상으로 소개합니다.',
    },
    {
      id: 'work-2',
      title: 'NOW Music · 18곡 토탈',
      subtitle: 'Music Reel',
      year: '2026',
      tags: ['NOW Music', 'OST', '18곡'],
      thumbnail: { src: '', alt: '' },
      embed: { type: 'youtube', id: 'ogRnN_z5wSQ' },
      link: 'https://youtu.be/ogRnN_z5wSQ',
      description: 'NOW World 음악·OST 모음 영상.',
    },
    {
      id: 'work-3',
      title: '나우 AI · 숏 소개',
      subtitle: 'Now AI',
      year: '2026',
      tags: ['나우 AI', '앱', '숏폼'],
      thumbnail: { src: '', alt: '' },
      embed: { type: 'youtube', id: 'V1w2L2wLTcc' },
      link: 'https://youtu.be/V1w2L2wLTcc',
      description: 'Google Play 나우 AI 앱 소개 숏.',
    },
    {
      id: 'work-4',
      title: '나우북스 · 작품 1',
      subtitle: 'NOW Books',
      year: '2026',
      tags: ['나우북스', '스토리', '숏폼'],
      thumbnail: { src: '', alt: '' },
      embed: { type: 'youtube', id: 'tjJC9kgnV9g' },
      link: 'https://youtu.be/tjJC9kgnV9g',
      description: 'NOW Books 시리즈 소개 영상.',
    },
    {
      id: 'work-5',
      title: '나우북스 · 작품 2',
      subtitle: 'NOW Books',
      year: '2026',
      tags: ['나우북스', '스토리', '숏폼'],
      thumbnail: { src: '', alt: '' },
      embed: { type: 'youtube', id: 'M2c5BjhzAB0' },
      link: 'https://youtu.be/M2c5BjhzAB0',
      description: 'NOW Books 시리즈 소개 영상.',
    },
    {
      id: 'work-6',
      title: '유앤아이 앱 · 숏 광고',
      subtitle: 'U&I App',
      year: '2026',
      tags: ['유앤아이', '앱', '숏폼'],
      thumbnail: { src: '', alt: '' },
      embed: { type: 'youtube', id: 'bGj8f5uK5Xw' },
      link: 'https://youtube.com/shorts/bGj8f5uK5Xw',
      description: '소개팅·연결 앱 유앤아이 Google Play 소개.',
    },
    {
      id: 'work-7',
      title: '배틀 아일랜즈 280805',
      subtitle: 'Battle Islands',
      year: '2026',
      tags: ['게임', '배틀아일랜즈', 'NOW Games'],
      thumbnail: { src: '', alt: '' },
      embed: { type: 'youtube', id: 'fmQe8A4ojK4' },
      link: 'https://www.youtube.com/watch?v=fmQe8A4ojK4',
      description: '턴제 요새 전투 게임 배틀 아일랜즈 280805. 관리자에서 영상 ID를 바꿀 수 있습니다.',
    },
    {
      id: 'work-8',
      title: '스튜디오 · 브랜드 샘플',
      subtitle: 'U&I Studio',
      year: '2026',
      tags: ['영상제작', '브랜드', '숏폼'],
      thumbnail: { src: '', alt: '' },
      embed: { type: 'youtube', id: 'xVdEEO6BR_I' },
      link: 'https://youtube.com/shorts/xVdEEO6BR_I',
      description: '의뢰·브랜드 영상 제작 샘플.',
    },
  ],
}