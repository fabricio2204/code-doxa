import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/Header'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Cafeteria Menu - Cardápio Digital',
  description: 'Sistema de cardápio e pedidos para cafeteria',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          <Header />
          <main className="min-h-screen bg-white">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
