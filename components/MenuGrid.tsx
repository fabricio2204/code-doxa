'use client'

import { useState, useEffect } from 'react'
import { MenuItem } from '@/types'
import { MenuItemCard } from './MenuItemCard'
import { useMenu } from '@/context/MenuContext'
import { useCart } from '@/context/CartContext'
import { Search, ShoppingBag } from 'lucide-react'

interface Category {
  id: string
  name: string
  label: string
  emoji: string
  display_order: number
}

// Função para normalizar texto removendo acentos
const normalizeText = (text: string): string => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export function MenuGrid() {
  const { menuItems } = useMenu()
  const { cartCount, isCartOpen, toggleCart } = useCart()
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('todos')
  const [searchTerm, setSearchTerm] = useState('')

  // Buscar categorias da API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        const data = await response.json()
        setCategories(data)
      } catch (error) {
        console.error('Erro ao buscar categorias:', error)
      }
    }
    fetchCategories()
  }, [])

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'todos' || item.category === selectedCategory
    
    if (searchTerm === '') {
      return matchesCategory
    }
    
    const normalizedSearch = normalizeText(searchTerm)
    const normalizedName = normalizeText(item.name)
    const normalizedDescription = normalizeText(item.description)
    
    const matchesSearch = normalizedName.includes(normalizedSearch) ||
                          normalizedDescription.includes(normalizedSearch)
    
    return matchesCategory && matchesSearch
  })

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8 text-center">Nosso Cardápio</h2>

      {/* Search Bar */}
      <div className="max-w-md mx-auto mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nome ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-6 py-2 rounded-full transition-all flex items-center gap-2 ${
              selectedCategory === category.id
                ? 'bg-black text-white'
                : 'bg-white text-black border border-gray-300 hover:border-black'
            }`}
          >
            <span>{category.emoji}</span>
            <span>{category.label}</span>
          </button>
        ))}
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {searchTerm 
            ? `Nenhum item encontrado para "${searchTerm}".`
            : 'Nenhum item encontrado nesta categoria.'}
        </div>
      )}

      {cartCount > 0 && !isCartOpen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <button
            onClick={toggleCart}
            className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full shadow-lg hover:bg-gray-800 transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            Finalizar Pedido ({cartCount})
          </button>
        </div>
      )}
    </div>
  )
}
