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
    expect(openApiDocument.components.schemas.ScheduleKind.required).toContain('legendLabel')
    expect(openApiDocument.paths['/trips'].get.security).toEqual([{ bearerAuth: [] }])
    expect(openApiDocument.paths['/trips'].get['x-required-scopes']).toEqual(['trips:read'])
    expect(openApiDocument.paths['/trips/{tripId}'].put.responses['428']).toBeDefined()
    expect(openApiDocument.paths['/trips/{tripId}'].put.responses['500']).toBeDefined()
    expect(openApiDocument.paths['/trips'].get.responses['200'].$ref).toBe('#/components/responses/TripListSuccess')
    expect(openApiDocument.paths['/trips/{tripId}'].get.responses['200'].content['application/json'].schema.$ref).toBe(
        '#/components/schemas/TripDetailSuccess',
    )
    expect(openApiDocument.paths['/token'].get.responses['429']).toBeDefined()
    expect(openApiDocument.paths['/trips/{tripId}'].get.responses['429']).toBeDefined()
    expect(openApiDocument.components.schemas.TripDetail.properties.revision).toBeDefined()
    expect('format' in openApiDocument.components.schemas.TripDetail.properties.ownerId).toBe(false)
    expect('format' in openApiDocument.components.schemas.TripDetail.properties.owner.properties.id).toBe(false)
    expect('format' in openApiDocument.components.schemas.TokenIntrospection.properties.subject.properties.userId).toBe(false)
    expect(openApiDocument.components.schemas.ScheduleItem.properties.kind).toMatchObject({ type: 'string' })
    expect(openApiDocument.components.schemas.BookingAttachment.additionalProperties).toBe(false)
    expect(openApiDocument.components.schemas.InfoBlock.additionalProperties).toBe(false)
    expect(openApiDocument.components.schemas.Booking.properties.attachments).toBeDefined()
})
