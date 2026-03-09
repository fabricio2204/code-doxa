'use client'

import Link from 'next/link'
import { ShoppingCart, User, Menu } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { useState } from 'react'
import DoxaLogo from './DoxaLogo'

export function Header() {
  const { cartCount, toggleCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-lg">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="transition-transform duration-300 group-hover:scale-110">
              <DoxaLogo size="small" showText={false} color="black" />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className="text-gray-700 hover:text-black px-4 py-2 rounded-lg transition-all duration-300 relative group font-medium text-sm"
            >
              Cardápio
              <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-black to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full"></span>
            </Link>
            <Link
              href="/pedidos"
              className="text-gray-700 hover:text-black px-4 py-2 rounded-lg transition-all duration-300 relative group font-medium text-sm"
            >
              Meus Pedidos
              <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-black to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full"></span>
            </Link>
            {isAuthenticated && (
              <Link
                href="/admin"
                className="text-gray-700 hover:text-black px-4 py-2 rounded-lg transition-all duration-300 relative group font-medium text-sm"
              >
                Administração
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-black to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full"></span>
              </Link>
            )}
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-2">
            {/* Cart Button */}
            <button
              onClick={toggleCart}
              className="relative p-2 text-gray-700 hover:text-black rounded-lg transition-all duration-300 hover:bg-gray-100 group"
              aria-label="Carrinho"
            >
              <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Button */}
            <Link
              href={isAuthenticated ? '/admin' : '/login'}
              className="p-2 text-gray-700 hover:text-black rounded-lg transition-all duration-300 hover:bg-gray-100 group"
              aria-label="Usuário"
            >
              <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-black rounded-lg transition-all duration-300 hover:bg-gray-100 group"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-gray-200 bg-white rounded-lg">
            <div className="flex flex-col space-y-2">
              <Link
                href="/"
                className="text-gray-700 hover:text-black hover:bg-gray-100 px-4 py-2 rounded-lg transition-all duration-300 font-medium text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                Cardápio
              </Link>
              <Link
                href="/pedidos"
                className="text-gray-700 hover:text-black hover:bg-gray-100 px-4 py-2 rounded-lg transition-all duration-300 font-medium text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                Meus Pedidos
              </Link>
              {isAuthenticated && (
                <Link
                  href="/admin"
                  className="text-gray-700 hover:text-black hover:bg-gray-100 px-4 py-2 rounded-lg transition-all duration-300 font-medium text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Administração
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
