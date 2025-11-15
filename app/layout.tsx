import type { Metadata } from 'next'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './globals.scss'
import BootstrapClient from './components/BootstrapClient'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: {
    default: 'Fashion Breeze - Premium Fashion Store',
    template: '%s | Fashion Breeze'
  },
  description: 'Discover the latest trends in fashion. Premium quality clothing, accessories, and lifestyle products delivered to your door with fast shipping and easy returns.',
  keywords: ['fashion', 'clothing', 'accessories', 'online shopping', 'premium fashion', 'Sri Lanka'],
  authors: [{ name: 'Fashion Breeze Team' }],
  creator: 'Fashion Breeze',
  publisher: 'Fashion Breeze',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://fashionbreeze.lk'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Fashion Breeze - Premium Fashion Store',
    description: 'Discover the latest trends in fashion with premium quality and fast delivery.',
    url: 'https://fashionbreeze.lk',
    siteName: 'Fashion Breeze',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Fashion Breeze Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fashion Breeze - Premium Fashion Store',
    description: 'Discover the latest trends in fashion with premium quality and fast delivery.',
    images: ['/logo.png'],
  },
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
}



export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="theme-color" content="#667eea" />
      </head>
      <body className="antialiased">
        <div id="root">
          {children}
        </div>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <BootstrapClient />
      </body>
    </html>
  )
}