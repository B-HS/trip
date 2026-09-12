import { expect, test } from 'bun:test'
import { openApiDocument } from '@/shared/api/openapi'

test('developer API OpenAPI document describes the implemented versioned routes', () => {
    expect(openApiDocument.openapi).toBe('3.1.0')
    expect(Object.keys(openApiDocument.paths)).toEqual(['/token', '/trips', '/trips/{tripId}'])
    expect(openApiDocument.paths['/trips'].get.operationId).toBe('listTrips')
    expect(openApiDocument.paths['/trips/{tripId}'].put.operationId).toBe('replaceTrip')
    expect(openApiDocument.components.securitySchemes.bearerAuth.scheme).toBe('bearer')
    expect(openApiDocument.paths['/trips'].post.responses['201']).toBeDefined()
    expect(openApiDocument.paths['/trips'].post.requestBody.content['application/json'].schema.oneOf).toHaveLength(2)
    expect(openApiDocument.paths['/trips/{tripId}'].delete.parameters).toHaveLength(3)
    expect(openApiDocument.components.parameters.PageSize.schema.maximum).toBe(100)
    expect(openApiDocument.components.schemas.TripTemplate.properties.destinations.minItems).toBe(1)
})
