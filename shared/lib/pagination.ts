const FIRST_PAGE = 1
const MIN_PAGE_COUNT = 1

export const buildPage = (total: number, page: number, pageSize: number) => {
    const pageCount = Math.max(Math.ceil(total / pageSize), MIN_PAGE_COUNT)
    const current = Number.isFinite(page) ? Math.min(Math.max(Math.trunc(page), FIRST_PAGE), pageCount) : FIRST_PAGE
    return { page: current, pageSize, total, pageCount, offset: (current - FIRST_PAGE) * pageSize }
}
