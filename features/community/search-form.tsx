import { useTranslations } from 'next-intl'
import type { Route } from 'next'
import { SEARCH_QUERY_MAX_LENGTH, SEARCH_QUERY_PARAM } from '@/shared/constant/community'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

export type SearchFormProps<T extends string> = {
    action: Route<T>
    defaultQuery: string
    placeholder?: string
}

export const SearchForm = <T extends string>({ action, defaultQuery, placeholder }: SearchFormProps<T>) => {
    const t = useTranslations('community.search')

    return (
        <form className='flex gap-px bg-background' method='get' action={action}>
            <Input
                className='h-10 min-w-0 flex-1 rounded-none'
                name={SEARCH_QUERY_PARAM}
                type='search'
                defaultValue={defaultQuery}
                placeholder={placeholder ?? t('placeholder')}
                maxLength={SEARCH_QUERY_MAX_LENGTH}
                aria-label={t('label')}
            />
            <Button variant='cell' size='cell' type='submit'>
                {t('submit')}
            </Button>
        </form>
    )
}
