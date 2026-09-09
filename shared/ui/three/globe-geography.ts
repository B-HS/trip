import { geoContains } from 'd3-geo'
import type { Feature, GeoJsonProperties, Geometry, Position } from 'geojson'
import { feature, mesh } from 'topojson-client'
import { BufferAttribute, BufferGeometry } from 'three'
import topology from 'world-atlas/land-110m.json'
import { latLngToVector3 } from '@/shared/ui/three/globe-math'

const DEGREE_TO_RADIAN = Math.PI / 180
const FULL_CIRCLE_DEGREES = 360
const HALF_CIRCLE_DEGREES = 180
const QUARTER_CIRCLE_DEGREES = 90
const VECTOR_COMPONENTS = 3

const COASTLINE_RADIUS = 1.003
const LAND_DOT_RADIUS = 1.001
const GRATICULE_RADIUS = 1.002

const LAND_GRID_STEP_DEGREES = 3
const LAND_GRID_MAX_LATITUDE = 84
const LAND_GRID_CELL_CENTER = 0.5

const GRATICULE_STEP_DEGREES = 30
const GRATICULE_SAMPLE_DEGREES = 5
const GRATICULE_MAX_LATITUDE = 60

type LandPolygon = { minLng: number; minLat: number; maxLng: number; maxLat: number; shape: Geometry }

type LandGridPoint = { lat: number; lng: number; row: number; column: number }

const toPolygonRings = (geometry: Geometry): Position[][][] => {
    if (geometry.type === 'Polygon') return [geometry.coordinates]
    if (geometry.type === 'MultiPolygon') return geometry.coordinates
    return []
}

const toLandPolygon = (rings: Position[][]): LandPolygon => {
    const outer = rings[0] ?? []
    const longitudes = outer.map(([lng]) => lng)
    const latitudes = outer.map(([, lat]) => lat)
    return {
        minLng: Math.min(...longitudes),
        minLat: Math.min(...latitudes),
        maxLng: Math.max(...longitudes),
        maxLat: Math.max(...latitudes),
        shape: { type: 'Polygon', coordinates: rings },
    }
}

let landPolygonCache: LandPolygon[] | null = null

const landPolygons = () => {
    if (!landPolygonCache) {
        const collection = feature(topology, topology.objects.land)
        const features: Feature<Geometry, GeoJsonProperties>[] = collection.features
        landPolygonCache = features.flatMap((item) => toPolygonRings(item.geometry).map(toLandPolygon))
    }
    return landPolygonCache
}

/**
 * Tests whether a geographic coordinate falls on land in the Natural Earth 110m land mesh.
 * A bounding-box pre-filter keeps the spherical containment test off most ocean samples.
 */
export const isLandCoordinate = (lng: number, lat: number) =>
    landPolygons().some(
        (polygon) =>
            lng >= polygon.minLng &&
            lng <= polygon.maxLng &&
            lat >= polygon.minLat &&
            lat <= polygon.maxLat &&
            geoContains(polygon.shape, [lng, lat]),
    )

let landGridCache: LandGridPoint[] | null = null

/**
 * Builds an equal-area-ish lat/lng sample grid and keeps only the samples that sit on land.
 */
export const landGridPoints = () => {
    if (landGridCache) return landGridCache
    const points: LandGridPoint[] = []
    let row = 0
    for (let lat = -LAND_GRID_MAX_LATITUDE; lat <= LAND_GRID_MAX_LATITUDE; lat += LAND_GRID_STEP_DEGREES) {
        const columns = Math.max(1, Math.round((FULL_CIRCLE_DEGREES / LAND_GRID_STEP_DEGREES) * Math.cos(lat * DEGREE_TO_RADIAN)))
        const columnWidth = FULL_CIRCLE_DEGREES / columns
        for (let column = 0; column < columns; column += 1) {
            const lng = -HALF_CIRCLE_DEGREES + columnWidth * (column + LAND_GRID_CELL_CENTER)
            if (isLandCoordinate(lng, lat)) points.push({ lat, lng, row, column })
        }
        row += 1
    }
    landGridCache = points
    return points
}

const toPositionArray = (points: readonly { lat: number; lng: number }[], radius: number) => {
    const positions = new Float32Array(points.length * VECTOR_COMPONENTS)
    points.forEach((point, index) => latLngToVector3(point.lat, point.lng, radius).toArray(positions, index * VECTOR_COMPONENTS))
    return positions
}

export const landDotPositions = (stride: number) =>
    toPositionArray(
        landGridPoints().filter((point) => point.row % stride === 0 && point.column % stride === 0),
        LAND_DOT_RADIUS,
    )

const toSegmentPositions = (lines: readonly Position[][], radius: number) => {
    const segments = lines.reduce((total, line) => total + Math.max(0, line.length - 1), 0)
    const positions = new Float32Array(segments * VECTOR_COMPONENTS * 2)
    let offset = 0
    lines.forEach((line) =>
        line.forEach(([lng, lat], index) => {
            if (index === 0) return
            const [previousLng, previousLat] = line[index - 1]
            latLngToVector3(previousLat, previousLng, radius).toArray(positions, offset)
            latLngToVector3(lat, lng, radius).toArray(positions, offset + VECTOR_COMPONENTS)
            offset += VECTOR_COMPONENTS * 2
        }),
    )
    return positions
}

export const coastlinePositions = () => toSegmentPositions(mesh(topology, topology.objects.land).coordinates, COASTLINE_RADIUS)

const graticuleLines = () => {
    const meridians = Array.from({ length: FULL_CIRCLE_DEGREES / GRATICULE_STEP_DEGREES }, (_, index) => {
        const lng = -HALF_CIRCLE_DEGREES + index * GRATICULE_STEP_DEGREES
        return Array.from({ length: HALF_CIRCLE_DEGREES / GRATICULE_SAMPLE_DEGREES + 1 }, (_, step): Position => [
            lng,
            -QUARTER_CIRCLE_DEGREES + step * GRATICULE_SAMPLE_DEGREES,
        ])
    })
    const parallels = Array.from({ length: (GRATICULE_MAX_LATITUDE * 2) / GRATICULE_STEP_DEGREES + 1 }, (_, index) => {
        const lat = -GRATICULE_MAX_LATITUDE + index * GRATICULE_STEP_DEGREES
        return Array.from({ length: FULL_CIRCLE_DEGREES / GRATICULE_SAMPLE_DEGREES + 1 }, (_, step): Position => [
            -HALF_CIRCLE_DEGREES + step * GRATICULE_SAMPLE_DEGREES,
            lat,
        ])
    })
    return [...meridians, ...parallels]
}

export const graticulePositions = () => toSegmentPositions(graticuleLines(), GRATICULE_RADIUS)

const toGeometry = (positions: Float32Array) => {
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new BufferAttribute(positions, VECTOR_COMPONENTS))
    return geometry
}

let coastlineGeometryCache: BufferGeometry | null = null
let graticuleGeometryCache: BufferGeometry | null = null
const landDotGeometryCache = new Map<number, BufferGeometry>()

export const coastlineGeometry = () => {
    if (!coastlineGeometryCache) coastlineGeometryCache = toGeometry(coastlinePositions())
    return coastlineGeometryCache
}

export const graticuleGeometry = () => {
    if (!graticuleGeometryCache) graticuleGeometryCache = toGeometry(graticulePositions())
    return graticuleGeometryCache
}

export const landDotGeometry = (stride: number) => {
    const cached = landDotGeometryCache.get(stride)
    if (cached) return cached
    const geometry = toGeometry(landDotPositions(stride))
    landDotGeometryCache.set(stride, geometry)
    return geometry
}
