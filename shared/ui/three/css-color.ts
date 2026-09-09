const COLOR_FUNCTION_PATTERN = /^([a-z]+)\(\s*([^)]*)\)$/i
const COMPONENT_SEPARATOR_PATTERN = /[\s,]+/
const HEX_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i
const NAMED_COLOR_PATTERN = /^[a-z]+$/i

const LEGACY_COLOR_FUNCTIONS = ['rgb', 'rgba', 'hsl', 'hsla']
const RGB_COLOR_FUNCTIONS = ['rgb', 'rgba']
const LEGACY_CHANNEL_COUNT = 3
const UNSUPPORTED_KEYWORDS = ['currentcolor', 'transparent', 'inherit', 'initial', 'unset', 'none']
const SRGB_COLOR_SPACES = ['srgb', 'srgb-linear']

const FALLBACK_COLOR = '#808080'

const PERCENT_DIVISOR = 100
const OKLAB_AXIS_PERCENT_SCALE = 0.4
const LAB_AXIS_PERCENT_SCALE = 125
const LAB_LIGHTNESS_PERCENT_SCALE = 100
const UNIT_PERCENT_SCALE = 1
const DEGREE_TO_RADIAN = Math.PI / 180

const LAB_EPSILON = 216 / 24389
const LAB_KAPPA = 24389 / 27
const LAB_OFFSET = 16
const LAB_DIVISOR = 116
const LAB_A_DIVISOR = 500
const LAB_B_DIVISOR = 200
const D50_WHITE_X = 0.3457 / 0.3585
const D50_WHITE_Y = 1
const D50_WHITE_Z = (1 - 0.3457 - 0.3585) / 0.3585

const SRGB_LINEAR_THRESHOLD = 0.0031308
const SRGB_LINEAR_SLOPE = 12.92
const SRGB_GAMMA_SCALE = 1.055
const SRGB_GAMMA_OFFSET = 0.055
const SRGB_GAMMA_EXPONENT = 1 / 2.4
const CHANNEL_MAX = 255
const RGB_CHANNEL_PERCENT_SCALE = 255
const HEX_RADIX = 16
const HEX_CHANNEL_LENGTH = 2

export type CssColorValue = { color: string; alpha: number }

type LinearRgb = { red: number; green: number; blue: number }

type ColorFunction = { name: string; values: string[]; alpha: string | null }

const clampUnit = (value: number) => Math.min(1, Math.max(0, value))

const parseComponent = (raw: string | undefined, percentScale: number) => {
    if (!raw) return 0
    return raw.endsWith('%') ? (Number.parseFloat(raw) / PERCENT_DIVISOR) * percentScale : Number.parseFloat(raw)
}

const encodeGamma = (linear: number) => {
    const clamped = clampUnit(linear)
    return clamped <= SRGB_LINEAR_THRESHOLD ? clamped * SRGB_LINEAR_SLOPE : SRGB_GAMMA_SCALE * clamped ** SRGB_GAMMA_EXPONENT - SRGB_GAMMA_OFFSET
}

const toHexChannel = (channel: number) =>
    Math.round(clampUnit(channel) * CHANNEL_MAX)
        .toString(HEX_RADIX)
        .padStart(HEX_CHANNEL_LENGTH, '0')

const toHex = ({ red, green, blue }: LinearRgb) =>
    `#${toHexChannel(encodeGamma(red))}${toHexChannel(encodeGamma(green))}${toHexChannel(encodeGamma(blue))}`

const oklabToLinearRgb = (lightness: number, axisA: number, axisB: number): LinearRgb => {
    const longRoot = lightness + 0.3963377774 * axisA + 0.2158037573 * axisB
    const mediumRoot = lightness - 0.1055613458 * axisA - 0.0638541728 * axisB
    const shortRoot = lightness - 0.0894841775 * axisA - 1.291485548 * axisB

    const long = longRoot ** 3
    const medium = mediumRoot ** 3
    const short = shortRoot ** 3

    return {
        red: 4.0767416621 * long - 3.3077115913 * medium + 0.2309699292 * short,
        green: -1.2684380046 * long + 2.6097574011 * medium - 0.3413193965 * short,
        blue: -0.0041960863 * long - 0.7034186147 * medium + 1.707614701 * short,
    }
}

const labToLinearRgb = (lightness: number, axisA: number, axisB: number): LinearRgb => {
    const fy = (lightness + LAB_OFFSET) / LAB_DIVISOR
    const fx = fy + axisA / LAB_A_DIVISOR
    const fz = fy - axisB / LAB_B_DIVISOR

    const xr = fx ** 3 > LAB_EPSILON ? fx ** 3 : (LAB_DIVISOR * fx - LAB_OFFSET) / LAB_KAPPA
    const yr = lightness > LAB_KAPPA * LAB_EPSILON ? fy ** 3 : lightness / LAB_KAPPA
    const zr = fz ** 3 > LAB_EPSILON ? fz ** 3 : (LAB_DIVISOR * fz - LAB_OFFSET) / LAB_KAPPA

    const x = xr * D50_WHITE_X
    const y = yr * D50_WHITE_Y
    const z = zr * D50_WHITE_Z

    return {
        red: 3.1341359569958707 * x - 1.6173863321612538 * y - 0.4906619460083532 * z,
        green: -0.9787855054455187 * x + 1.9161606776822492 * y + 0.03344287339036562 * z,
        blue: 0.07195539255794733 * x - 0.2289768599237723 * y + 1.4053851325931776 * z,
    }
}

const parseColorFunction = (value: string): ColorFunction | null => {
    const match = COLOR_FUNCTION_PATTERN.exec(value)
    if (!match) return null
    const [main, slashAlpha] = match[2].split('/')
    const name = match[1].toLowerCase()
    const components = main.trim().split(COMPONENT_SEPARATOR_PATTERN).filter(Boolean)
    const hasLegacyAlpha = LEGACY_COLOR_FUNCTIONS.includes(name) && components.length > LEGACY_CHANNEL_COUNT
    return {
        name,
        values: hasLegacyAlpha ? components.slice(0, LEGACY_CHANNEL_COUNT) : components,
        alpha: slashAlpha?.trim() ?? (hasLegacyAlpha ? components[LEGACY_CHANNEL_COUNT] : null),
    }
}

const convertColorFunction = ({ name, values }: ColorFunction) => {
    if (name === 'oklch') {
        const chroma = parseComponent(values[1], OKLAB_AXIS_PERCENT_SCALE)
        const hueRadian = Number.parseFloat(values[2] ?? '0') * DEGREE_TO_RADIAN
        return toHex(oklabToLinearRgb(parseComponent(values[0], UNIT_PERCENT_SCALE), chroma * Math.cos(hueRadian), chroma * Math.sin(hueRadian)))
    }
    if (name === 'oklab') {
        return toHex(
            oklabToLinearRgb(
                parseComponent(values[0], UNIT_PERCENT_SCALE),
                parseComponent(values[1], OKLAB_AXIS_PERCENT_SCALE),
                parseComponent(values[2], OKLAB_AXIS_PERCENT_SCALE),
            ),
        )
    }
    if (name === 'lab') {
        return toHex(
            labToLinearRgb(
                parseComponent(values[0], LAB_LIGHTNESS_PERCENT_SCALE),
                parseComponent(values[1], LAB_AXIS_PERCENT_SCALE),
                parseComponent(values[2], LAB_AXIS_PERCENT_SCALE),
            ),
        )
    }
    if (RGB_COLOR_FUNCTIONS.includes(name)) {
        const channels = values.map((channel) => clampUnit(parseComponent(channel, RGB_CHANNEL_PERCENT_SCALE) / RGB_CHANNEL_PERCENT_SCALE))
        return `#${channels.map(toHexChannel).join('')}`
    }
    if (name === 'color' && SRGB_COLOR_SPACES.includes(values[0] ?? '')) {
        const channels = values.slice(1).map((channel) => clampUnit(parseComponent(channel, UNIT_PERCENT_SCALE)))
        return values[0] === 'srgb-linear'
            ? toHex({ red: channels[0], green: channels[1], blue: channels[2] })
            : `#${channels.map(toHexChannel).join('')}`
    }
    return null
}

const isThreeParsable = (value: string) =>
    HEX_PATTERN.test(value) || (NAMED_COLOR_PATTERN.test(value) && !UNSUPPORTED_KEYWORDS.includes(value.toLowerCase()))

/**
 * Converts a CSS custom property value into a three.js-parsable color plus its alpha.
 * Browsers serialize `oklch()` tokens as `lab()`, `oklab()`, `oklch()` or `color(srgb ...)`,
 * none of which three can parse, so those are converted to sRGB hex. Values three understands
 * are passed through untouched and anything else falls back to a neutral grey.
 */
export const resolveCssColor = (value: string): CssColorValue => {
    const trimmed = value.trim()
    const parsed = parseColorFunction(trimmed)
    if (!parsed) return { color: isThreeParsable(trimmed) ? trimmed : FALLBACK_COLOR, alpha: 1 }

    const alpha = parsed.alpha ? clampUnit(parseComponent(parsed.alpha, UNIT_PERCENT_SCALE)) : 1
    const converted = convertColorFunction(parsed)
    if (converted) return { color: converted, alpha }
    return LEGACY_COLOR_FUNCTIONS.includes(parsed.name) ? { color: trimmed, alpha } : { color: FALLBACK_COLOR, alpha }
}
