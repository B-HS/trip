import { mock } from 'bun:test'
import { createElement, type ReactNode } from 'react'
import { GlobalRegistrator } from '@happy-dom/global-registrator'
import messages from '../messages/ko.json'

const TEST_URL = 'http://localhost:3000/'

type MessageValues = Record<string, string | number | Date>

const catalog = messages as unknown as Record<string, unknown>

const lookup = (path: string) => {
    const value = path
        .split('.')
        .reduce<unknown>((acc, segment) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[segment] : undefined), catalog)
    return typeof value === 'string' ? value : path
}

const interpolate = (text: string, values?: MessageValues) =>
    values === undefined ? text : text.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`))

const makeT = (namespace: string) => (key: string, values?: MessageValues) =>
    interpolate(lookup(namespace.length > 0 ? `${namespace}.${key}` : key), values)

mock.module('server-only', () => ({}))

mock.module('next-intl', () => ({
    useTranslations: (namespace = '') => makeT(namespace),
    useLocale: () => 'ko',
    hasLocale: (locales: readonly string[], locale: unknown) => locales.includes(String(locale)),
    NextIntlClientProvider: ({ children }: { children?: ReactNode }) => children,
}))

mock.module('next-intl/server', () => ({
    getTranslations: async (options?: string | { locale?: string; namespace?: string }) =>
        makeT(typeof options === 'string' ? options : (options?.namespace ?? '')),
    setRequestLocale: () => {},
    getLocale: async () => 'ko',
    getMessages: async () => messages,
    getFormatter: async () => ({
        number: (value: number) => String(value),
        dateTime: (value: Date) => value.toISOString(),
    }),
}))

mock.module('@/i18n/navigation', () => ({
    Link: ({ href, children, ...rest }: { href: string; children?: ReactNode }) => createElement('a', { href, ...rest }, children),
    useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {}, back: () => {}, forward: () => {}, refresh: () => {} }),
    usePathname: () => new URL(TEST_URL).pathname,
    redirect: () => {
        throw new Error('NEXT_REDIRECT')
    },
    permanentRedirect: () => {
        throw new Error('NEXT_REDIRECT')
    },
    getPathname: ({ href }: { href: string }) => href,
}))

GlobalRegistrator.register({ url: TEST_URL, settings: { navigation: { disableChildFrameNavigation: true } } })
