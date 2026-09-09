import { BookOpen, CalendarRange, ListChecks, type LucideIcon, Printer, RefreshCw, Users } from 'lucide-react'

export type MarketingAction = { label: string; href: string }

export type IntroFeature = { id: string; icon: LucideIcon; title: string; description: string }

export type IntroStep = { id: string; title: string; description: string }

export type IntroShowcaseItem = { id: string; time: string; title: string; note: string; isCompleted: boolean }

export const INTRO_METADATA = {
    title: '여행 노트를 한 화면에',
    description: '날짜별 일정과 이동 시간, 예매 체크리스트, 여행 정보를 한 곳에 모아 동행과 함께 정리합니다.',
} as const

export const INTRO_HERO = {
    eyebrow: '여행 일정 노트',
    title: '흩어진 여행 계획을 한 화면에 모읍니다',
    description:
        '항공편과 숙소, 날짜별 일정, 구간 이동 시간, 예매 목록을 한 곳에 정리하고 동행과 함께 편집하세요. 여행 당일에는 화면을 열어 체크만 하면 됩니다.',
    primaryAction: { label: '시작하기', href: '/signup' },
    secondaryAction: { label: '로그인', href: '/login' },
    globeRoutes: [
        { from: 'ICN', to: 'KIX' },
        { from: 'KIX', to: 'ICN' },
    ],
    globeNote: '예시로 표시한 경로입니다.',
} as const satisfies {
    eyebrow: string
    title: string
    description: string
    primaryAction: MarketingAction
    secondaryAction: MarketingAction
    globeRoutes: readonly { from: string; to: string }[]
    globeNote: string
}

export const INTRO_FEATURES_SECTION = {
    eyebrow: '기능',
    title: '여행 준비에 필요한 것만 담았습니다',
    description: '기록을 위한 도구가 아니라, 여행 당일에 실제로 열어보게 되는 화면을 목표로 만들었습니다.',
} as const

export const INTRO_FEATURES = [
    {
        id: 'itinerary',
        icon: CalendarRange,
        title: '날짜별 일정과 이동시간 계산',
        description: '하루치 일정을 시간순으로 쌓고 구간별 이동 시간을 더해, 다음 일정까지 여유가 되는지 바로 확인합니다.',
    },
    {
        id: 'booking',
        icon: ListChecks,
        title: '예매 체크리스트와 우선순위',
        description: '티켓과 입장권을 우선순위로 정리하고 예매 링크와 진행 상태를 한 카드에서 관리합니다.',
    },
    {
        id: 'info',
        icon: BookOpen,
        title: '여행 정보 아코디언',
        description: '교통 패스, 환전, 준비물처럼 자주 다시 보는 정보를 접었다 펼치는 섹션으로 보관합니다.',
    },
    {
        id: 'share',
        icon: Users,
        title: '공동편집자 초대와 공개 링크',
        description: '이메일로 동행을 초대해 함께 편집하고, 읽기 전용 공개 링크로 일정을 공유합니다.',
    },
    {
        id: 'sync',
        icon: RefreshCw,
        title: '사용자별 완료 체크·메모 동기화',
        description: '체크와 메모는 계정에 저장되어 휴대폰과 노트북 어디에서 열어도 같은 상태로 이어집니다.',
    },
    {
        id: 'print',
        icon: Printer,
        title: '전체 일정 인쇄',
        description: '전체 일정을 인쇄용 레이아웃으로 정리해 종이 한 장으로 들고 다닐 수 있습니다.',
    },
] as const satisfies readonly IntroFeature[]

export const INTRO_STEPS_SECTION = {
    eyebrow: '사용 방법',
    title: '세 단계면 준비가 끝납니다',
    description: '처음 한 번만 채워 두면, 여행이 끝날 때까지 같은 화면을 계속 씁니다.',
} as const

export const INTRO_STEPS = [
    {
        id: 'create',
        title: '트립 만들기',
        description: '여행 이름과 기간, 목적지를 입력하면 빈 일정표가 만들어집니다. 오사카 예시로 한 번에 채워 볼 수도 있습니다.',
    },
    {
        id: 'fill',
        title: '날짜별 일정 채우기',
        description: '항공편과 숙소를 등록하고 날짜마다 일정, 이동 경로, 예매 항목을 더합니다. 순서는 끌어서 바꿉니다.',
    },
    {
        id: 'check',
        title: '여행 중 체크',
        description: '현장에서는 끝난 일정을 체크하고 메모를 남깁니다. 같은 트립을 보는 동행에게도 그대로 이어집니다.',
    },
] as const satisfies readonly IntroStep[]

export const INTRO_SHOWCASE = {
    eyebrow: '여행 중 화면',
    title: '체크할수록 남은 일정이 또렷해집니다',
    description: '완료한 일정은 흐려지고 진행률이 함께 채워집니다. 아래는 실제 화면을 단순하게 옮긴 예시입니다.',
    dayLabel: '3일차',
    dayTitle: '교토 당일치기',
    progressLabel: '오늘 일정 진행률',
    completedSuffix: '완료',
    items: [
        { id: 'depart', time: '08:20', title: '난바역 출발', note: '한큐 교토선 특급 승차', isCompleted: true },
        { id: 'arrive', time: '09:15', title: '가와라마치 도착', note: '코인로커에 큰 짐 보관', isCompleted: true },
        { id: 'temple', time: '10:00', title: '기요미즈데라', note: '니넨자카 방향으로 내려오기', isCompleted: true },
        { id: 'lunch', time: '13:30', title: '니시키 시장 점심', note: '도보 15분 이동, 여유 10분', isCompleted: true },
        { id: 'return', time: '17:40', title: '교토역 복귀', note: '돌아가는 열차 시간 확인', isCompleted: false },
    ],
} as const satisfies {
    eyebrow: string
    title: string
    description: string
    dayLabel: string
    dayTitle: string
    progressLabel: string
    completedSuffix: string
    items: readonly IntroShowcaseItem[]
}

export const INTRO_CTA = {
    title: '오늘 저녁 일정부터 정리해 보세요',
    description: '이메일과 비밀번호만 있으면 바로 첫 트립을 만들 수 있습니다.',
    primaryAction: { label: '시작하기', href: '/signup' },
    secondaryAction: { label: '로그인', href: '/login' },
    note: '별도 인증 절차 없이 가입한 뒤 곧바로 사용할 수 있습니다.',
} as const

export const NOT_FOUND_COPY = {
    eyebrow: '404',
    title: '요청하신 페이지를 찾을 수 없습니다',
    description: '주소가 바뀌었거나 이미 삭제된 페이지일 수 있습니다. 아래에서 이동할 곳을 선택해 주세요.',
    primaryAction: { label: '홈으로 가기', href: '/' },
    secondaryAction: { label: '내 여행 목록', href: '/trips' },
    globeRoutes: [{ from: 'ICN', to: 'KIX' }],
} as const
