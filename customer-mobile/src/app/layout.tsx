import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import 'leaflet/dist/leaflet.css'
import { Providers } from './providers'
import { PushNotificationPrompt } from '../components/PushNotificationPrompt'
import { WebVitals } from '../components/WebVitals'
import { ChatbotProvider } from '../components/ChatbotProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5000'),
  title: 'Cửa Hàng Tâm Linh - Nhang Trầm, Phật Phẩm, Đồ Thờ Cúng Chính Hãng',
  description: 'Chuyên cung cấp sản phẩm tâm linh chính hãng: nhang trầm hương, đồ thờ cúng, phật phẩm. Giao hàng toàn quốc, chất lượng đảm bảo, giá tốt nhất thị trường.',
  keywords: 'nhang trầm, đồ thờ cúng, phật phẩm, tâm linh, nhang hương, trầm hương, cúng phật, phong thủy, đồ phong thủy, nhang que',
  authors: [{ name: 'Cửa Hàng Tâm Linh' }],
  creator: 'Cửa Hàng Tâm Linh',
  publisher: 'Cửa Hàng Tâm Linh',
  robots: 'index, follow',
  openGraph: {
    title: 'Cửa Hàng Tâm Linh - Nhang Trầm, Phật Phẩm Chính Hãng',
    description: 'Chuyên cung cấp sản phẩm tâm linh chính hãng: nhang trầm hương, đồ thờ cúng, phật phẩm. Giao hàng toàn quốc.',
    url: 'https://cuahangtamlinh.com',
    siteName: 'Cửa Hàng Tâm Linh',
    locale: 'vi_VN',
    type: 'website',
    images: [
      {
        url: '/images/spiritual-banner-1.jpg',
        width: 1200,
        height: 630,
        alt: 'Cửa hàng tâm linh - Nhang trầm và phật phẩm',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cửa Hàng Tâm Linh - Nhang Trầm, Phật Phẩm',
    description: 'Chuyên cung cấp sản phẩm tâm linh chính hãng: nhang trầm hương, đồ thờ cúng, phật phẩm.',
    images: ['/images/spiritual-banner-1.jpg'],
  },
  category: 'shopping',
  alternates: {
    canonical: 'https://cuahangtamlinh.com',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const apiDomain = process.env.NEXT_PUBLIC_API_URL || '';
  const backendDomain = apiDomain.startsWith('http') 
    ? new URL(apiDomain).hostname 
    : 'ed0058b6-a4d2-420f-a190-db815028cada-00-emsu2szvz22c.pike.replit.dev';
  
  return (
    <html lang="vi">
      <head>
        {/* Resource hints for faster loading */}
        <link rel="dns-prefetch" href={`https://${backendDomain}`} />
        <link rel="preconnect" href={`https://${backendDomain}`} />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        <Providers>
          <ChatbotProvider>
            {children}
          </ChatbotProvider>
          <PushNotificationPrompt />
          <WebVitals />
        </Providers>
      </body>
    </html>
  )
}