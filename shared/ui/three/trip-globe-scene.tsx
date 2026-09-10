'use client'

import { OrbitControls } from '@react-three/drei'
import { type ThreeEvent, useFrame } from '@react-three/fiber'
import { type FC, useRef } from 'react'
import { type Camera, CatmullRomCurve3, type Group, MathUtils, type Mesh, Quaternion, Vector3 } from 'three'
import { coastlineGeometry, graticuleGeometry, landDotGeometry } from '@/shared/ui/three/globe-geography'
import { GLOBE_ARC_STYLE, type GlobePointerPosition, resolveGlobeArcEmphasis } from '@/shared/ui/three/globe-interaction'
import {
    airportsFacingRotation,
    buildGlobeArc,
    collectGlobeAirports,
    type GlobePoint,
    type GlobeRoute,
    isHiddenBySphere,
    latLngToVector3,
} from '@/shared/ui/three/globe-math'
import { GLOBE_VARIANT_CONFIG, type GlobeVariant } from '@/shared/ui/three/globe-variant'
import { useGlobeTheme } from '@/shared/ui/three/use-globe-theme'

const GLOBE_RADIUS = 1
const GLOBE_TILT_X = 0.12
const MAX_FACING_TILT = 0.62
const OCCLUDER_RADIUS = 0.99
const OCCLUDER_SEGMENTS = 48
const OCCLUDER_RINGS = 32

const COASTLINE_OPACITY = 0.9
const LAND_DOT_OPACITY = 0.55
const GRATICULE_OPACITY = 0.35

const MARKER_ELEVATION = 1.008
const MARKER_SEGMENTS = 20
const MARKER_RING_INNER_SCALE = 1.7
const MARKER_RING_OPACITY = 0.5
const MARKER_FORWARD = new Vector3(0, 0, 1)

const ARC_SAMPLES = 72
const ARC_TUBULAR_SEGMENTS = 56
const ARC_RADIAL_SEGMENTS = 6
const ARC_LIFT_BASE = 0.1
const ARC_LIFT_STEP = 0.055
const ARC_LIFT_CYCLE = 3
const ARC_GLOW_SCALE = 3.4
const MAX_TRAVELLER_ARCS = 6

const ROTATION_SPEED = 0.11
const ROTATION_DAMPING = 2.4
const PARALLAX_DAMPING = 3.2
const ORBIT_ROTATE_SPEED = 0.6
const TRAVELLER_SPEED = 0.16
const TRAVELLER_OFFSET_STEP = 0.37
const FULL_TURN = 1
const CLICK_DRAG_THRESHOLD = 2

const isArcHidden = (point: Vector3, camera: Camera) => isHiddenBySphere(point, camera.position, GLOBE_RADIUS * OCCLUDER_RADIUS)

type GlobeMarkerProps = {
    point: GlobePoint
    radius: number
    ringScale: number
    color: string
}

const GlobeMarker: FC<GlobeMarkerProps> = ({ point, radius, ringScale, color }) => {
    const position = latLngToVector3(point.lat, point.lng, GLOBE_RADIUS * MARKER_ELEVATION)

    return (
        <group position={position} quaternion={new Quaternion().setFromUnitVectors(MARKER_FORWARD, position.clone().normalize())}>
            <mesh>
                <circleGeometry args={[radius, MARKER_SEGMENTS]} />
                <meshBasicMaterial color={color} />
            </mesh>
            <mesh>
                <ringGeometry args={[radius * MARKER_RING_INNER_SCALE, radius * ringScale, MARKER_SEGMENTS]} />
                <meshBasicMaterial color={color} transparent opacity={MARKER_RING_OPACITY} />
            </mesh>
        </group>
    )
}

type GlobeArcProps = {
    route: GlobeRoute
    index: number
    color: string
    opacity: number
    glowOpacity: number
    tubeRadius: number
    travellerRadius: number
    showTraveller: boolean
    animated: boolean
    onHover: ((key: string, pointer: GlobePointerPosition | null) => void) | null
    onSelect: ((key: string) => void) | null
}

const GlobeArc: FC<GlobeArcProps> = ({
    route,
    index,
    color,
    opacity,
    glowOpacity,
    tubeRadius,
    travellerRadius,
    showTraveller,
    animated,
    onHover,
    onSelect,
}) => {
    const travellerRef = useRef<Mesh>(null)
    const progressRef = useRef((index * TRAVELLER_OFFSET_STEP) % FULL_TURN)
    const lift = ARC_LIFT_BASE + (index % ARC_LIFT_CYCLE) * ARC_LIFT_STEP
    const curve = new CatmullRomCurve3(buildGlobeArc(route, GLOBE_RADIUS, ARC_SAMPLES, lift))

    const handleHover = (event: ThreeEvent<PointerEvent>) => {
        if (onHover === null || isArcHidden(event.point, event.camera)) return
        event.stopPropagation()
        onHover(route.key, { offsetX: event.nativeEvent.offsetX, offsetY: event.nativeEvent.offsetY })
    }

    const handleSelect = (event: ThreeEvent<MouseEvent>) => {
        if (onSelect === null || event.delta > CLICK_DRAG_THRESHOLD || isArcHidden(event.point, event.camera)) return
        event.stopPropagation()
        onSelect(route.key)
    }

    const hitTestHandlers =
        onHover === null && onSelect === null
            ? {}
            : {
                  onPointerOver: handleHover,
                  onPointerMove: handleHover,
                  onPointerOut: () => onHover?.(route.key, null),
                  onClick: handleSelect,
              }

    useFrame((_state, delta) => {
        const traveller = travellerRef.current
        if (!traveller) return
        if (animated) progressRef.current = (progressRef.current + delta * TRAVELLER_SPEED) % FULL_TURN
        traveller.position.copy(curve.getPoint(progressRef.current))
    })

    return (
        <group>
            <mesh {...hitTestHandlers}>
                <tubeGeometry args={[curve, ARC_TUBULAR_SEGMENTS, tubeRadius * ARC_GLOW_SCALE, ARC_RADIAL_SEGMENTS, false]} />
                <meshBasicMaterial color={color} transparent opacity={glowOpacity} depthWrite={false} />
            </mesh>
            <mesh>
                <tubeGeometry args={[curve, ARC_TUBULAR_SEGMENTS, tubeRadius, ARC_RADIAL_SEGMENTS, false]} />
                <meshBasicMaterial color={color} transparent opacity={opacity} />
            </mesh>
            {showTraveller && (
                <mesh ref={travellerRef}>
                    <sphereGeometry args={[travellerRadius, MARKER_SEGMENTS, MARKER_SEGMENTS]} />
                    <meshBasicMaterial color={color} />
                </mesh>
            )}
        </group>
    )
}

export type TripGlobeSceneProps = {
    routes: GlobeRoute[]
    variant: GlobeVariant
    interactive: boolean
    dragRotate: boolean
    autoRotate: boolean
    animated: boolean
    selectedKey: string | null
    hoveredKey: string | null
    onRouteHover: ((key: string, pointer: GlobePointerPosition | null) => void) | null
    onRouteSelect: ((key: string) => void) | null
}

export const TripGlobeScene: FC<TripGlobeSceneProps> = ({
    routes,
    variant,
    interactive,
    dragRotate,
    autoRotate,
    animated,
    selectedKey,
    hoveredKey,
    onRouteHover,
    onRouteSelect,
}) => {
    const parallaxRef = useRef<Group>(null)
    const spinRef = useRef<Group>(null)
    const spinSpeedRef = useRef(0)
    const config = GLOBE_VARIANT_CONFIG[variant]
    const points = collectGlobeAirports(routes)
    const facing = airportsFacingRotation(points)
    const travellerCount = routes.length > MAX_TRAVELLER_ARCS ? 1 : routes.length
    const theme = useGlobeTheme()

    useFrame((state, delta) => {
        const spin = spinRef.current
        if (spin) {
            spinSpeedRef.current = MathUtils.damp(spinSpeedRef.current, autoRotate && animated ? ROTATION_SPEED : 0, ROTATION_DAMPING, delta)
            spin.rotation.y += delta * spinSpeedRef.current
        }

        const parallax = parallaxRef.current
        if (!parallax || !interactive || dragRotate || !animated) return
        parallax.rotation.x = MathUtils.damp(parallax.rotation.x, -state.pointer.y * config.parallaxStrength, PARALLAX_DAMPING, delta)
        parallax.rotation.y = MathUtils.damp(parallax.rotation.y, state.pointer.x * config.parallaxStrength, PARALLAX_DAMPING, delta)
    })

    if (!theme) return null

    return (
        <>
            {dragRotate && <OrbitControls enableZoom={false} enablePan={false} enableDamping rotateSpeed={ORBIT_ROTATE_SPEED} />}
            <group rotation={[GLOBE_TILT_X, 0, 0]}>
                <group ref={parallaxRef}>
                    <group rotation={[MathUtils.clamp(facing.x, -MAX_FACING_TILT, MAX_FACING_TILT), facing.y, 0]}>
                        <group ref={spinRef}>
                            <mesh>
                                <sphereGeometry args={[GLOBE_RADIUS * OCCLUDER_RADIUS, OCCLUDER_SEGMENTS, OCCLUDER_RINGS]} />
                                <meshBasicMaterial colorWrite={false} />
                            </mesh>
                            {config.showGraticule && (
                                <lineSegments geometry={graticuleGeometry()}>
                                    <lineBasicMaterial color={theme.border.color} transparent opacity={GRATICULE_OPACITY * theme.border.alpha} />
                                </lineSegments>
                            )}
                            <points geometry={landDotGeometry(config.landDotStride)}>
                                <pointsMaterial
                                    color={theme.mutedForeground.color}
                                    size={config.landDotSize}
                                    sizeAttenuation
                                    transparent
                                    opacity={LAND_DOT_OPACITY * theme.mutedForeground.alpha}
                                />
                            </points>
                            <lineSegments geometry={coastlineGeometry()}>
                                <lineBasicMaterial
                                    color={theme.mutedForeground.color}
                                    transparent
                                    opacity={COASTLINE_OPACITY * theme.mutedForeground.alpha}
                                />
                            </lineSegments>
                            {points.map((point) => (
                                <GlobeMarker
                                    key={point.key}
                                    point={point}
                                    radius={config.markerRadius}
                                    ringScale={config.markerRingScale}
                                    color={theme.foreground.color}
                                />
                            ))}
                            {routes.map((route, index) => {
                                const style = GLOBE_ARC_STYLE[resolveGlobeArcEmphasis(route.key, hoveredKey, selectedKey)]
                                return (
                                    <GlobeArc
                                        key={route.key}
                                        route={route}
                                        index={index}
                                        color={theme[style.colorToken].color}
                                        opacity={style.opacity}
                                        glowOpacity={style.glowOpacity}
                                        tubeRadius={config.arcRadius * style.radiusScale}
                                        travellerRadius={config.travellerRadius}
                                        showTraveller={index < travellerCount}
                                        animated={animated}
                                        onHover={onRouteHover}
                                        onSelect={onRouteSelect}
                                    />
                                )
                            })}
                        </group>
                    </group>
                </group>
            </group>
        </>
    )
}
