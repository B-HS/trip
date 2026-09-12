import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/shared/constant/site'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/trips',
                '/settings',
                '/admin',
                '/login',
                '/signup',
                '/verify-email',
                '/en/trips',
                '/en/settings',
                '/en/admin',
                '/en/login',
                '/en/signup',
                '/en/verify-email',
                '/ja/trips',
                '/ja/settings',
                '/ja/admin',
                '/ja/login',
                '/ja/signup',
                '/ja/verify-email',
                '/api/',
            ],
        },
        sitemap: `${SITE_URL}/sitemap.xml`,
    }
}
