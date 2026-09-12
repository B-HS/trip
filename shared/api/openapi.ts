export const openApiDocument = {
    openapi: '3.1.0',
    info: {
        title: 'Trip Developer API',
        version: '1.0.0',
        description: 'Versioned owner-scoped trip resources. Tokens are shown once and must be sent as an Authorization Bearer header.',
    },
    servers: [{ url: '/api/v1', description: 'Trip API' }],
    security: [{ bearerAuth: [] }],
    paths: {
        '/token': {
            get: {
                operationId: 'introspectToken',
                summary: 'Inspect the current token',
                security: [{ bearerAuth: ['token:inspect'] }],
                responses: { '200': { $ref: '#/components/responses/Success' }, '401': { $ref: '#/components/responses/Error' } },
            },
        },
        '/trips': {
            get: {
                operationId: 'listTrips',
                summary: 'List trips owned by the token subject',
                security: [{ bearerAuth: ['trips:read'] }],
                parameters: [{ $ref: '#/components/parameters/Page' }, { $ref: '#/components/parameters/PageSize' }],
                responses: {
                    '200': { $ref: '#/components/responses/Success' },
                    '401': { $ref: '#/components/responses/Error' },
                    '429': { $ref: '#/components/responses/Error' },
                },
            },
            post: {
                operationId: 'createTrip',
                summary: 'Create a trip from a validated template',
                security: [{ bearerAuth: ['trips:write'] }],
                parameters: [{ $ref: '#/components/parameters/IdempotencyKey' }],
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/TripTemplate' } } } },
                responses: {
                    '200': { $ref: '#/components/responses/Success' },
                    '400': { $ref: '#/components/responses/Error' },
                    '429': { $ref: '#/components/responses/Error' },
                },
            },
        },
        '/trips/{tripId}': {
            parameters: [{ $ref: '#/components/parameters/TripId' }],
            get: {
                operationId: 'getTrip',
                summary: 'Get an owned trip',
                security: [{ bearerAuth: ['trips:read'] }],
                responses: { '200': { $ref: '#/components/responses/Success' }, '404': { $ref: '#/components/responses/Error' } },
            },
            put: {
                operationId: 'replaceTrip',
                summary: 'Replace an owned trip with a validated template',
                security: [{ bearerAuth: ['trips:write'] }],
                parameters: [{ $ref: '#/components/parameters/IdempotencyKey' }],
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/TripTemplate' } } } },
                responses: { '200': { $ref: '#/components/responses/Success' }, '400': { $ref: '#/components/responses/Error' } },
            },
            delete: {
                operationId: 'deleteTrip',
                summary: 'Delete an owned trip',
                security: [{ bearerAuth: ['trips:write'] }],
                parameters: [{ $ref: '#/components/parameters/IdempotencyKey' }],
                responses: { '200': { $ref: '#/components/responses/Success' }, '404': { $ref: '#/components/responses/Error' } },
            },
        },
    },
    components: {
        securitySchemes: {
            bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'trip_pat', description: 'Personal access token; never put it in a URL.' },
        },
        parameters: {
            TripId: { name: 'tripId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
            Page: { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
            PageSize: { name: 'page_size', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
            IdempotencyKey: { name: 'Idempotency-Key', in: 'header', required: true, schema: { type: 'string', maxLength: 255 } },
        },
        schemas: {
            Success: { type: 'object', required: ['success', 'data'], properties: { success: { const: true }, data: {} } },
            Error: {
                type: 'object',
                required: ['success', 'error'],
                properties: {
                    success: { const: false },
                    error: {
                        type: 'object',
                        required: ['code', 'message'],
                        properties: { code: { type: 'string' }, message: { type: 'string' }, details: { type: 'object' } },
                    },
                },
            },
            TripTemplate: {
                type: 'object',
                required: ['title', 'destination', 'startDate', 'endDate'],
                additionalProperties: true,
                properties: {
                    title: { type: 'string', minLength: 1, maxLength: 120 },
                    destination: { type: 'string' },
                    startDate: { type: 'string', format: 'date' },
                    endDate: { type: 'string', format: 'date' },
                    destinations: { type: 'array' },
                    days: { type: 'array' },
                    scheduleKinds: { type: 'array' },
                },
            },
        },
        responses: {
            Success: { description: 'Successful response', content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } } },
            Error: { description: 'Error response', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
    },
} as const
