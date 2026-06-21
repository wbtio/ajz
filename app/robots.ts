import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/admin-login', '/api/', '/auth/'],
      },
    ],
    sitemap: 'https://jaz.iq/sitemap.xml',
  }
}
