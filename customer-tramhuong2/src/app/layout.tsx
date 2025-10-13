import type { Metadata } from 'next'
import { Playfair_Display, Nunito_Sans } from 'next/font/google'
import './globals.css'
import 'leaflet/dist/leaflet.css'
import { Providers } from './providers'
import { PushNotificationPrompt } from '../components/PushNotificationPrompt'
import { WebVitals } from '../components/WebVitals'
import { ChatbotProvider } from '../components/ChatbotProvider'
import { StructuredData } from '../components/StructuredData'

const playfairDisplay = Playfair_Display({ 
  subsets: ['latin', 'vietnamese'],
  variable: '--font-playfair',
  display: 'swap'
})

const nunitoSans = Nunito_Sans({ 
  subsets: ['latin', 'vietnamese'],
  variable: '--font-nunito',
  display: 'swap'
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5000'),
  title: 'Trầm Hương Hoàng Ngân - Tinh Hoa Trầm Hương Cao Cấp',
  description: 'Trầm Hương Hoàng Ngân - Sản phẩm trầm hương tự nhiên cao cấp từ đất Bồi. Tinh hoa tâm linh, chất lượng quý hiếm, giao hàng toàn quốc.',
  keywords: 'trầm hương, trầm hương cao cấp, trầm hương tự nhiên, Hoàng Ngân, nhang trầm, tâm linh, trầm hương Bồi, trầm hương quý hiếm',
  authors: [{ name: 'Trầm Hương Hoàng Ngân' }],
  creator: 'Trầm Hương Hoàng Ngân',
  publisher: 'Trầm Hương Hoàng Ngân',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Trầm Hương Hoàng Ngân',
    description: 'Tinh Hoa Trầm Hương Cao Cấp - Sản phẩm trầm hương tự nhiên từ đất Bồi',
    url: 'https://tramhuonghoangngan.com',
    siteName: 'Trầm Hương Hoàng Ngân',
    locale: 'vi_VN',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Trầm Hương Hoàng Ngân - Tinh hoa trầm hương cao cấp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trầm Hương Hoàng Ngân',
    description: 'Tinh Hoa Trầm Hương Cao Cấp - Sản phẩm từ đất Bồi',
    images: ['/twitter-image.jpg'],
  },
  category: 'shopping',
  alternates: {
    canonical: 'https://tramhuonghoangngan.com',
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
        <StructuredData />
      </head>
      <body className={`${nunitoSans.variable} ${playfairDisplay.variable}`}>
        <Providers>
          <ChatbotProvider>
            <div className="page-wrapper">
              {children}
            </div>
          </ChatbotProvider>
          <PushNotificationPrompt />
          <WebVitals />
        </Providers>
      </body>
    </html>
  )
}