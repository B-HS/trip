export const RICH_EDITOR_LABEL = {
    heading2: '제목 2',
    heading3: '제목 3',
    bold: '굵게',
    italic: '기울임',
    strike: '취소선',
    bulletList: '목록',
    orderedList: '번호 목록',
    blockquote: '인용',
    codeBlock: '코드 블록',
    link: '링크',
    image: '이미지',
    youtube: 'YouTube',
    undo: '되돌리기',
    redo: '다시하기',
} as const

export const RICH_EDITOR_FILE_INPUT_LABEL = '본문 이미지 파일 선택'

export const RICH_EDITOR_UPLOADING_HINT = '이미지를 올리는 중입니다.'

export const RICH_EDITOR_DIALOG_CANCEL = '취소'

export const RICH_EDITOR_DIALOG_CONFIRM = '확인'

export const RICH_EDITOR_LINK_DIALOG = {
    title: '링크',
    description: '선택한 글자에 연결할 주소를 넣습니다. 비워 두고 확인하면 링크를 해제합니다.',
    label: '링크 주소',
    placeholder: 'https://',
    invalid: '링크는 http 또는 https 주소여야 합니다.',
} as const

export const RICH_EDITOR_YOUTUBE_DIALOG = {
    title: 'YouTube',
    description: 'YouTube 영상 주소를 넣으면 본문에 영상을 삽입합니다.',
    label: '영상 주소',
    placeholder: 'https://www.youtube.com/watch?v=',
    invalid: 'YouTube 영상 주소가 아닙니다.',
} as const
