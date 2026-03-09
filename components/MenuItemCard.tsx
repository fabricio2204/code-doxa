'use client'

import { Plus } from 'lucide-react'
import { MenuItem } from '@/types'
import { useCart } from '@/context/CartContext'

interface MenuItemCardProps {
  item: MenuItem
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const { addToCart, cart } = useCart()
  
  // Verificar quantidade do item no carrinho
  const cartItem = cart.find((cartItem) => cartItem.id === item.id)
  const quantity = cartItem?.quantity || 0

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow relative">
      {/* Badge de Quantidade */}
      {quantity > 0 && (
        <div className="absolute top-3 right-3 z-10 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">{quantity}</span>
        </div>
      )}

      {/* Image Section */}
      <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-6xl">{getCategoryEmoji(item.category)}</span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {item.description}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4">
          <span className="text-xl font-bold">
            R$ {item.price.toFixed(2)}
          </span>
          
          <button
            onClick={() => addToCart(item)}
            disabled={!item.available}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              item.available
                ? 'bg-black text-white hover:bg-gray-800'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Plus className="w-4 h-4" />
            {item.available ? 'Adicionar' : 'Indisponível'}
          </button>
        </div>
      </div>
    </div>
  )
}

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    cafe: '☕',
    bebidas: '🥤',
    doces: '🍰',
    salgados: '🥐',
  }
  return emojis[category] || '🍽️'
}
