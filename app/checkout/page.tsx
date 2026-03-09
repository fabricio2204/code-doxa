'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'
import { pedidosAPI } from '@/lib/api'
import { getOrCreateCustomerToken } from '@/lib/customerToken'

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart()
  const router = useRouter()
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [createdOrderId, setCreatedOrderId] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const createdOrder = await pedidosAPI.createOrder({
        customer_token: getOrCreateCustomerToken(),
        customer_name: customerName,
        customer_phone: customerPhone || undefined,
        items: cart.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        total: cartTotal,
        notes: notes || undefined,
      })

      const orderId = createdOrder?.id || ''
      const orderDisplayCode = createdOrder?.order_code || orderId
      setCreatedOrderId(orderDisplayCode)

      if (typeof window !== 'undefined' && orderId) {
        const savedIdsRaw = localStorage.getItem('user_order_ids')
        const savedIds: string[] = savedIdsRaw ? JSON.parse(savedIdsRaw) : []
        if (!savedIds.includes(orderId)) {
          savedIds.unshift(orderId)
        }
        localStorage.setItem('user_order_ids', JSON.stringify(savedIds.slice(0, 30)))
      }

      setOrderSuccess(true)
      clearCart()

      setTimeout(() => {
        router.push('/pedidos')
      }, 2500)
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error)
      alert('Não foi possível enviar seu pedido. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (cart.length === 0 && !orderSuccess) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Carrinho Vazio</h1>
        <p className="text-gray-600 mb-8">
          Adicione itens ao carrinho antes de finalizar o pedido.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar ao Cardápio
        </Link>
      </div>
    )
  }

  if (orderSuccess) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Pedido Confirmado!</h1>
          {createdOrderId && (
            <p className="text-lg font-semibold mb-2">ID do pedido: {createdOrderId}</p>
          )}
          <p className="text-gray-600">
            Seu pedido foi recebido e está sendo preparado.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Voltar ao Cardápio
      </Link>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Finalizar Pedido</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Form */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Seus Dados</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-2"
                >
                  Nome *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Seu nome"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium mb-2"
                >
                  Telefone
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium mb-2"
                >
                  Observações
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
                  placeholder="Alguma observação sobre seu pedido?"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processando...' : 'Confirmar Pedido'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Resumo do Pedido</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        Quantidade: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">
                      R$ {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-300 pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span>R$ {cartTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
