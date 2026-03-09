'use client'

import { AuthProvider } from '@/context/AuthContext'
import { MenuProvider } from '@/context/MenuContext'
import { CartProvider } from '@/context/CartContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <MenuProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </MenuProvider>
    </AuthProvider>
  )
}
