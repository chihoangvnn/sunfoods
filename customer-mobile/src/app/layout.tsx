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
  title: 'SunFoods.vn - Thực Phẩm Sạch Organic, Tinh Hoa Thiên Nhiên',
  description: 'Chuyên cung cấp thực phẩm sạch organic chất lượng: rau củ quả tươi, thực phẩm khô, protein thực vật. Từ trạng thái xanh - Giao hàng tận nơi, đảm bảo độ tươi 100%.',
  keywords: 'thực phẩm sạch, organic, rau củ organic, thực phẩm hữu cơ, rau sạch, trái cây sạch, thực phẩm khô, protein thực vật, đồ ăn sạch, healthy food, VietGAP',
  authors: [{ name: 'SunFoods.vn' }],
  creator: 'SunFoods.vn',
  publisher: 'SunFoods.vn',
  robots: 'index, follow',
  openGraph: {
    title: 'SunFoods.vn - Thực Phẩm Sạch Organic, Tinh Hoa Thiên Nhiên',
    description: 'Thực phẩm sạch organic chất lượng từ trạng thái xanh. Rau củ quả tươi, thực phẩm khô, protein thực vật. Giao hàng tận nơi.',
    url: 'https://sunfoods.vn',
    siteName: 'SunFoods.vn',
    locale: 'vi_VN',
    type: 'website',
    images: [
      {
        url: '/images/organic-farm-banner.jpg',
        width: 1200,
        height: 630,
        alt: 'SunFoods - Thực phẩm sạch organic từ thiên nhiên',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SunFoods.vn - Thực Phẩm Sạch Organic',
    description: 'Thực phẩm sạch organic chất lượng từ trạng thái xanh. Rau củ quả tươi, thực phẩm khô, protein thực vật.',
    images: ['/images/organic-farm-banner.jpg'],
  },
  category: 'shopping',
  alternates: {
    canonical: 'https://sunfoods.vn',
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