import type { Metadata } from 'next'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './globals.scss'
import BootstrapClient from './components/BootstrapClient'

export const metadata: Metadata = {
  title: 'Fashion Breeze - Premium Fashion Store',
  description: 'Discover the latest trends in fashion. Premium quality clothing delivered to your door.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <BootstrapClient />
      </body>
    </html>
  )
}