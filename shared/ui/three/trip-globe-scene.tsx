'use client'

import { useFrame } from '@react-three/fiber'
import { type FC, useRef } from 'react'
import { CatmullRomCurve3, type Group, MathUtils, type Mesh } from 'three'
import { buildGlobeArc, collectGlobeAirports, type GlobeRoute, latLngToVector3, longitudeFacingRotation } from '@/shared/ui/three/globe-math'
import { GLOBE_VARIANT_CONFIG, type GlobeVariant } from '@/shared/ui/three/globe-variant'
import { useGlobeTheme } from '@/shared/ui/three/use-globe-theme'

const GLOBE_RADIUS = 1
const GLOBE_TILT_X = 0.32
const OCCLUDER_SCALE = 0.96
const OCCLUDER_SEGMENTS = 32
const OCCLUDER_RINGS = 24
const MARKER_SEGMENTS = 12
const MARKER_ELEVATION = 1.012
const ARC_SAMPLES = 72
const ARC_TUBULAR_SEGMENTS = 56
const ARC_RADIAL_SEGMENTS = 6
const ARC_LIFT_BASE = 0.1
const ARC_LIFT_STEP = 0.055
const ARC_LIFT_CYCLE = 3
const ARC_OPACITY = 0.55
const WIREFRAME_OPACITY = 0.32
const ROTATION_SPEED = 0.11
const PARALLAX_DAMPING = 3.2
const TRAVELLER_SPEED = 0.16
const TRAVELLER_OFFSET_STEP = 0.37
const FULL_TURN = 1
const EQUATOR_RING_SCALE = 1.08
const EQUATOR_RING_TUBE = 0.004
const EQUATOR_RING_RADIAL_SEGMENTS = 3
const EQUATOR_RING_TUBULAR_SEGMENTS = 128
const QUARTER_TURN = Math.PI / 2

type GlobeArcProps = {
    route: GlobeRoute
    index: number
    color: string
    tubeRadius: number
    travellerRadius: number
    animated: boolean
}

const GlobeArc: FC<GlobeArcProps> = ({ route, index, color, tubeRadius, travellerRadius, animated }) => {
    const travellerRef = useRef<Mesh>(null)
    const progressRef = useRef((index * TRAVELLER_OFFSET_STEP) % FULL_TURN)
    const lift = ARC_LIFT_BASE + (index % ARC_LIFT_CYCLE) * ARC_LIFT_STEP
    const curve = new CatmullRomCurve3(buildGlobeArc(route, GLOBE_RADIUS, ARC_SAMPLES, lift))

    useFrame((_state, delta) => {
        const traveller = travellerRef.current
        if (!traveller) return
        if (animated) progressRef.current = (progressRef.current + delta * TRAVELLER_SPEED) % FULL_TURN
        traveller.position.copy(curve.getPoint(progressRef.current))
    })

    return (
        <group>
            <mesh>
                <tubeGeometry args={[curve, ARC_TUBULAR_SEGMENTS, tubeRadius, ARC_RADIAL_SEGMENTS, false]} />
                <meshBasicMaterial color={color} transparent opacity={ARC_OPACITY} />
            </mesh>
            <mesh ref={travellerRef}>
                <sphereGeometry args={[travellerRadius, MARKER_SEGMENTS, MARKER_SEGMENTS]} />
                <meshBasicMaterial color={color} />
            </mesh>
        </group>
    )
}

export type TripGlobeSceneProps = {
    routes: GlobeRoute[]
    variant: GlobeVariant
    interactive: boolean
    autoRotate: boolean
    animated: boolean
}

export const TripGlobeScene: FC<TripGlobeSceneProps> = ({ routes, variant, interactive, autoRotate, animated }) => {
    const parallaxRef = useRef<Group>(null)
    const spinRef = useRef<Group>(null)
    const config = GLOBE_VARIANT_CONFIG[variant]
    const airports = collectGlobeAirports(routes)
    const facingRotation = longitudeFacingRotation(routes[0]?.from.lng ?? 0)
    const theme = useGlobeTheme()

    useFrame((state, delta) => {
        const spin = spinRef.current
        if (spin && autoRotate && animated) spin.rotation.y += delta * ROTATION_SPEED

        const parallax = parallaxRef.current
        if (!parallax || !interactive || !animated) return
        parallax.rotation.x = MathUtils.damp(parallax.rotation.x, -state.pointer.y * config.parallaxStrength, PARALLAX_DAMPING, delta)
        parallax.rotation.y = MathUtils.damp(parallax.rotation.y, state.pointer.x * config.parallaxStrength, PARALLAX_DAMPING, delta)
    })

    if (!theme) return null

    return (
        <group rotation={[GLOBE_TILT_X, 0, 0]}>
            <group ref={parallaxRef}>
                <mesh rotation={[QUARTER_TURN, 0, 0]}>
                    <torusGeometry
                        args={[GLOBE_RADIUS * EQUATOR_RING_SCALE, EQUATOR_RING_TUBE, EQUATOR_RING_RADIAL_SEGMENTS, EQUATOR_RING_TUBULAR_SEGMENTS]}
                    />
                    <meshBasicMaterial color={theme.border.color} transparent opacity={theme.border.alpha} />
                </mesh>
                <group rotation={[0, facingRotation, 0]}>
                    <group ref={spinRef}>
                        <mesh>
                            <sphereGeometry args={[GLOBE_RADIUS * OCCLUDER_SCALE, OCCLUDER_SEGMENTS, OCCLUDER_RINGS]} />
                            <meshBasicMaterial colorWrite={false} />
                        </mesh>
                        <mesh>
                            <icosahedronGeometry args={[GLOBE_RADIUS, config.sphereDetail]} />
                            <meshBasicMaterial
                                color={theme.mutedForeground.color}
                                wireframe
                                transparent
                                opacity={WIREFRAME_OPACITY * theme.mutedForeground.alpha}
                            />
                        </mesh>
                        {airports.map((airport) => (
                            <mesh key={airport.code} position={latLngToVector3(airport.lat, airport.lng, GLOBE_RADIUS * MARKER_ELEVATION)}>
                                <sphereGeometry args={[config.markerRadius, MARKER_SEGMENTS, MARKER_SEGMENTS]} />
                                <meshBasicMaterial color={theme.foreground.color} />
                            </mesh>
                        ))}
                        {routes.map((route, index) => (
                            <GlobeArc
                                key={route.key}
                                route={route}
                                index={index}
                                color={theme.foreground.color}
                                tubeRadius={config.arcRadius}
                                travellerRadius={config.travellerRadius}
                                animated={animated}
                            />
                        ))}
                    </group>
                </group>
            </group>
        </group>
    )
}
