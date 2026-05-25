import './globals.css'
import { Geist, Geist_Mono } from 'next/font/google'
import ClientLayout from '../components/ClientLayout'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata = {
  title: 'Eternal MMO : Genesis - Ultimate Private Server Experience',
  description: 'Join Eternal MMO : Genesis, a high-quality private FlyFF server with balanced PvP, custom dungeons, modern systems, and an active community. Play now and relive the magic of Madrigal!',
  keywords: [
    'Private FlyFF Server',
    'Eternal MMO : Genesis',
    'Free MMORPG',
    'Play FlyFF Online',
    'Fly For Fun Server',
    'Register Eternal MMO : Genesis',
    'Best FlyFF Server 2025',
    'Private FlyFF v15 Server',
    'Eternal MMO : Genesis Features',
    'FlyFF PvP Server'
  ],
  openGraph: {
    title: 'Eternal MMO : Genesis - Fly For Fun Reimagined',
    description: 'Discover Eternal MMO : Genesis with premium events, PvP battles, classic v15 mechanics, and a dynamic community.',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://play-eternal.com',
    siteName: 'Eternal MMO : Genesis',
    images: [
      {
        url: '/og_flyff.jpg',
        width: 1200,
        height: 630,
        alt: 'Official Eternal MMO : Genesis banner',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eternal MMO : Genesis - The Ultimate Experience!',
    description: 'Get ready to fly in Eternal MMO : Genesis. Play with friends, earn rewards, and conquer Madrigal.',
    images: ['/og_flyff.jpg'],
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://play-eternal.com'),
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950 text-white`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
