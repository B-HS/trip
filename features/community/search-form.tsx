import type { Route } from 'next'
import { SEARCH_INPUT_LABEL, SEARCH_PLACEHOLDER, SEARCH_SUBMIT_LABEL } from '@/features/community/community.constant'
import { SEARCH_QUERY_MAX_LENGTH, SEARCH_QUERY_PARAM } from '@/shared/constant/community'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

export type SearchFormProps<T extends string> = {
    action: Route<T>
    defaultQuery: string
    placeholder?: string
}

export const SearchForm = <T extends string>({ action, defaultQuery, placeholder = SEARCH_PLACEHOLDER }: SearchFormProps<T>) => (
    <form className='flex gap-px bg-background' method='get' action={action}>
        <Input
            className='h-10 min-w-0 flex-1 rounded-none'
            name={SEARCH_QUERY_PARAM}
            type='search'
            defaultValue={defaultQuery}
            placeholder={placeholder}
            maxLength={SEARCH_QUERY_MAX_LENGTH}
            aria-label={SEARCH_INPUT_LABEL}
        />
        <Button variant='cell' size='cell' type='submit'>
            {SEARCH_SUBMIT_LABEL}
        </Button>
    </form>
)
