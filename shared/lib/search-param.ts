export const replaceSearchParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(window.location.search)
    if (value === null) params.delete(key)
    else params.set(key, value)
    const query = params.toString()
    const nextUrl = query.length === 0 ? window.location.pathname : `${window.location.pathname}?${query}`
    if (nextUrl === `${window.location.pathname}${window.location.search}`) return
    window.history.replaceState(null, '', nextUrl)
}
