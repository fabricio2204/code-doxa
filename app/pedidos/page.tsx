'use client'

import { useCallback, useEffect, useState } from 'react'
import { Order } from '@/types'
import { Package, Clock, CheckCircle } from 'lucide-react'
import { pedidosAPI } from '@/lib/api'
import { getOrCreateCustomerToken } from '@/lib/customerToken'
import { getSupabaseBrowserClient } from '@/lib/client/supabaseBrowser'

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const loadUserOrders = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true)
      }

      const customerToken = getOrCreateCustomerToken()

      const userOrdersResponse = await pedidosAPI.getMyOrders(customerToken)
      const userOrders = userOrdersResponse
        .map((order: any) => ({
          id: order.id,
          displayCode:
            order.order_code ||
            (order.sequence_number
              ? String(order.sequence_number).padStart(7, '0')
              : order.id),
          customerName: order.customer_name,
          customerPhone: order.customer_phone,
          items: (order.items || []).map((item: any) => ({
            id: String(item.id),
            name: item.name || 'Item',
            description: item.description || '',
            price: Number(item.price),
            category: (item.category || 'cafe') as
              | 'cafe'
              | 'bebidas'
              | 'doces'
              | 'salgados',
            available:
              item.available !== undefined ? Boolean(item.available) : true,
            quantity: Number(item.quantity),
          })),
          total: parseFloat(order.total),
          status: order.status as Order['status'],
          createdAt: new Date(order.created_at),
          notes: order.notes,
        }))

      userOrders.sort(
        (a: Order, b: Order) => b.createdAt.getTime() - a.createdAt.getTime()
      )

      setOrders(userOrders)
    } catch (error) {
      console.error('Erro ao carregar pedidos do usuário:', error)
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    const customerToken = getOrCreateCustomerToken()

    loadUserOrders(true)

    const supabase = getSupabaseBrowserClient()

    if (supabase) {
      const channel = supabase
        .channel(`orders-user-${customerToken}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `customer_token=eq.${customerToken}`,
          },
          () => {
            loadUserOrders(false)
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }

    const interval = setInterval(() => {
      loadUserOrders(false)
    }, 5000)

    return () => clearInterval(interval)
  }, [loadUserOrders])

  const getStatusColor = (status: Order['status']) => {
    const colors = {
      pendente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      preparando: 'bg-blue-100 text-blue-800 border-blue-300',
      pronto: 'bg-green-100 text-green-800 border-green-300',
      entregue: 'bg-gray-100 text-gray-800 border-gray-300',
      cancelado: 'bg-red-100 text-red-800 border-red-300',
    }
    return colors[status]
  }

  const getStatusIcon = (status: Order['status']) => {
    if (status === 'entregue') return <CheckCircle className="w-5 h-5" />
    if (status === 'preparando' || status === 'pronto')
      return <Package className="w-5 h-5" />
    return <Clock className="w-5 h-5" />
  }

  const getStatusText = (status: Order['status']) => {
    const texts = {
      pendente: 'Aguardando confirmação',
      preparando: 'Em preparo',
      pronto: 'Pronto para retirada',
      entregue: 'Entregue',
      cancelado: 'Cancelado',
    }
    return texts[status]
  }

  const formatTime = (date: Date) => {
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Meus Pedidos</h1>

      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando pedidos...</p>
        </div>
      )}

      {!loading && orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600">Você ainda não fez nenhum pedido</p>
        </div>
      ) : (
        <div className="space-y-6 max-w-3xl">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    Pedido #{order.displayCode || order.id}
                  </h2>
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusIcon(order.status)}
                    {getStatusText(order.status)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Total</p>
                  <p className="text-2xl font-bold">
                    R$ {order.total.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mb-4 pb-4 border-b border-gray-200">
                <h3 className="font-semibold mb-3">Itens:</h3>
                <ul className="space-y-2">
                  {order.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between items-start"
                    >
                      <div className="flex-1">
                        <p className="font-medium">
                          {item.quantity}x {item.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.description}
                        </p>
                      </div>
                      <p className="font-semibold ml-4">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-sm text-gray-600">
                <p>Realizado em: {formatTime(order.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
