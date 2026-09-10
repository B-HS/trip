import type { NextConfig } from 'next'

const SECURITY_HEADERS = [
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'X-DNS-Prefetch-Control', value: 'on' },
    { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const DEV_LOOPBACK_ORIGINS = ['localhost', '127.0.0.1', '[::1]']

const uploadBaseUrl = process.env.R2_PUBLIC_BASE_URL

const nextConfig: NextConfig = {
    reactCompiler: true,
    agentRules: false,
    typedRoutes: true,
    allowedDevOrigins: DEV_LOOPBACK_ORIGINS,
    serverExternalPackages: ['mysql2'],
    images: { remotePatterns: uploadBaseUrl ? [new URL(`${uploadBaseUrl.replace(/\/+$/, '')}/**`)] : [] },
    headers: async () => [{ source: '/:path*', headers: SECURITY_HEADERS }],
}

export default nextConfig
