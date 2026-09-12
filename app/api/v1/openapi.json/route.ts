import { openApiDocument } from '@/shared/api/openapi'

export const GET = () => Response.json(openApiDocument, { headers: { 'Cache-Control': 'public, max-age=300' } })
