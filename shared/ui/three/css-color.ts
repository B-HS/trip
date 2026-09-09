const OKLCH_PATTERN = /^oklch\(\s*(-?[\d.]+%?)\s+(-?[\d.]+%?)\s+(-?[\d.]+)(?:deg)?\s*(?:\/\s*(-?[\d.]+%?)\s*)?\)$/i

const PERCENT_DIVISOR = 100
const CHROMA_PERCENT_SCALE = 0.4
const DEGREE_TO_RADIAN = Math.PI / 180
const SRGB_LINEAR_THRESHOLD = 0.0031308
const SRGB_LINEAR_SLOPE = 12.92
const SRGB_GAMMA_SCALE = 1.055
const SRGB_GAMMA_OFFSET = 0.055
const SRGB_GAMMA_EXPONENT = 1 / 2.4
const CHANNEL_MAX = 255
const HEX_RADIX = 16
const HEX_CHANNEL_LENGTH = 2

export type CssColorValue = { color: string; alpha: number }

const parseComponent = (raw: string, percentScale: number) =>
    raw.endsWith('%') ? (Number.parseFloat(raw) / PERCENT_DIVISOR) * percentScale : Number.parseFloat(raw)

const clampUnit = (value: number) => Math.min(1, Math.max(0, value))

const encodeGamma = (linear: number) => {
    const clamped = clampUnit(linear)
    return clamped <= SRGB_LINEAR_THRESHOLD ? clamped * SRGB_LINEAR_SLOPE : SRGB_GAMMA_SCALE * clamped ** SRGB_GAMMA_EXPONENT - SRGB_GAMMA_OFFSET
}

const toHexChannel = (channel: number) =>
    Math.round(clampUnit(channel) * CHANNEL_MAX)
        .toString(HEX_RADIX)
        .padStart(HEX_CHANNEL_LENGTH, '0')

const oklchToHex = (lightness: number, chroma: number, hue: number) => {
    const hueRadian = hue * DEGREE_TO_RADIAN
    const labA = chroma * Math.cos(hueRadian)
    const labB = chroma * Math.sin(hueRadian)

    const longRoot = lightness + 0.3963377774 * labA + 0.2158037573 * labB
    const mediumRoot = lightness - 0.1055613458 * labA - 0.0638541728 * labB
    const shortRoot = lightness - 0.0894841775 * labA - 1.291485548 * labB

    const long = longRoot ** 3
    const medium = mediumRoot ** 3
    const short = shortRoot ** 3

    const red = 4.0767416621 * long - 3.3077115913 * medium + 0.2309699292 * short
    const green = -1.2684380046 * long + 2.6097574011 * medium - 0.3413193965 * short
    const blue = -0.0041960863 * long - 0.7034186147 * medium + 1.707614701 * short

    return `#${toHexChannel(encodeGamma(red))}${toHexChannel(encodeGamma(green))}${toHexChannel(encodeGamma(blue))}`
}

/**
 * Converts a CSS custom property value into a three.js-parsable color plus its alpha.
 * three.js cannot parse `oklch()`, so those values are converted to sRGB hex; anything
 * else is passed through untouched for `THREE.Color` to resolve.
 */
export const resolveCssColor = (value: string): CssColorValue => {
    const trimmed = value.trim()
    const match = OKLCH_PATTERN.exec(trimmed)
    if (!match) return { color: trimmed, alpha: 1 }

    const [, lightness, chroma, hue, alpha] = match
    return {
        color: oklchToHex(parseComponent(lightness, 1), parseComponent(chroma, CHROMA_PERCENT_SCALE), Number.parseFloat(hue)),
        alpha: alpha ? clampUnit(parseComponent(alpha, 1)) : 1,
    }
}
