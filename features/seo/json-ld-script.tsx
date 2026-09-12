import type { FC } from 'react'
import { serializeJsonLd, type JsonLdValue } from '@/shared/lib/json-ld'

export type JsonLdScriptProps = { data: JsonLdValue | JsonLdValue[] }

export const JsonLdScript: FC<JsonLdScriptProps> = ({ data }) => (
    <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />
)
