import { expect, test } from 'bun:test'
import { openApiDocument } from '@/shared/api/openapi'

test('developer API OpenAPI document describes the implemented versioned routes', () => {
    expect(openApiDocument.openapi).toBe('3.1.0')
    expect(Object.keys(openApiDocument.paths)).toEqual(['/token', '/trips', '/trips/{tripId}'])
    expect(openApiDocument.paths['/trips'].get.operationId).toBe('listTrips')
    expect(openApiDocument.paths['/trips/{tripId}'].put.operationId).toBe('replaceTrip')
    expect(openApiDocument.components.securitySchemes.bearerAuth.scheme).toBe('bearer')
})
