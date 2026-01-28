import type { Metadata } from 'next'
import { Inter, Playfair_Display, Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { CartProvider } from '@/context/CartContext'
import { AuthProvider } from '@/context/AuthContext'

import { LanguageProvider } from '@/context/LanguageContext'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })
const cormorant = Cormorant_Garamond({ 
  subsets: ['latin'], 
  variable: '--font-cormorant',
  weight: ['300', '400', '500', '600', '700'],
  style: ['italic', 'normal']
})

export const metadata: Metadata = {
  title: 'Athéna Event Paris - Traiteur de Haute Gastronomie',
  description: "L'art de recevoir à son apogée. Traiteur d'exception à Paris pour vos réceptions privées et événements d'entreprise.",
  icons: {
    icon: '/images/logo_onglet_web.jpeg',
    shortcut: '/images/logo_onglet_web.jpeg',
    apple: '/images/logo_onglet_web.jpeg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} ${cormorant.variable}`}>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <Header />
              <main style={{ minHeight: '80vh' }}>
                {children}
              </main>
              <Footer />
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
