'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { Order } from '@/types'
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, Printer } from 'lucide-react'
import Link from 'next/link'
import { pedidosAPI } from '@/lib/api'

export default function AdminPedidosPage() {
  const { isAuthenticated, hasRole } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const loadOrders = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      const data = await pedidosAPI.getAllOrders()
      const mappedOrders: Order[] = data.map((order: any) => ({
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
          category: (item.category || 'cafe') as 'cafe' | 'bebidas' | 'doces' | 'salgados',
          available: item.available !== undefined ? Boolean(item.available) : true,
          quantity: Number(item.quantity),
        })),
        total: parseFloat(order.total),
        status: order.status as Order['status'],
        createdAt: new Date(order.created_at),
        notes: order.notes,
      }))
      setOrders(mappedOrders)
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated || !hasRole('atendente')) {
      router.push('/login')
      return
    }

    loadOrders(true)

    const interval = setInterval(() => {
      loadOrders(false)
    }, 3000)

    return () => clearInterval(interval)
  }, [isAuthenticated, hasRole, router, loadOrders])

  if (!isAuthenticated || !hasRole('atendente')) {
    return null
  }

  const updateOrderStatus = async (
    orderId: string,
    newStatus: Order['status']
  ) => {
    try {
      await pedidosAPI.updateOrderStatus(orderId, newStatus)
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      )
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      alert('Erro ao atualizar status do pedido')
    }
  }

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
    const icons = {
      pendente: Clock,
      preparando: Package,
      pronto: CheckCircle,
      entregue: CheckCircle,
      cancelado: XCircle,
    }
    const Icon = icons[status]
    return <Icon className="w-5 h-5" />
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000)
    if (diff < 1) return 'Agora'
    if (diff === 1) return '1 minuto atrás'
    if (diff < 60) return `${diff} minutos atrás`
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const handlePrintOrder = (order: Order) => {
    const printWindow = window.open('', '_blank', 'width=420,height=700')

    if (!printWindow) {
      alert('Não foi possível abrir a janela de impressão. Verifique o bloqueador de pop-up.')
      return
    }

    const itemsHtml = order.items
      .map(
        (item) => `
          <div class="item-row">
            <span>${item.quantity}x ${item.name}</span>
            <span>R$ ${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        `
      )
      .join('')

    const createdAt = order.createdAt.toLocaleString('pt-BR')

    const displayCode = order.displayCode || order.id

    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <title>Comanda ${displayCode}</title>
          <style>
            @page { margin: 0; size: 80mm auto; }
            body {
              margin: 0;
              padding: 8px;
              font-family: 'Courier New', monospace;
              width: 72mm;
              color: #000;
              font-size: 12px;
            }
            .center { text-align: center; }
            .title { font-size: 16px; font-weight: bold; margin-bottom: 4px; }
            .line { border-top: 1px dashed #000; margin: 8px 0; }
            .meta { margin-bottom: 2px; }
            .item-row {
              display: flex;
              justify-content: space-between;
              gap: 8px;
              margin-bottom: 4px;
            }
            .total {
              display: flex;
              justify-content: space-between;
              font-weight: bold;
              margin-top: 6px;
            }
            .notes { margin-top: 6px; white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <div class="center title">COMANDA COZINHA</div>
          <div class="center" style="font-size: 18px; font-weight: bold; letter-spacing: 0.1em; margin: 8px 0;">Cafeteria DOXA</div>
          <div class="line"></div>
          <div class="meta"><strong>Pedido:</strong> ${displayCode}</div>
          <div class="meta"><strong>Cliente:</strong> ${order.customerName}</div>
          <div class="meta"><strong>Horário:</strong> ${createdAt}</div>
          <div class="line"></div>
          <div><strong>ITENS</strong></div>
          ${itemsHtml || '<div>Nenhum item no pedido</div>'}
          <div class="line"></div>
          <div class="total">
            <span>TOTAL</span>
            <span>R$ ${order.total.toFixed(2)}</span>
          </div>
          ${order.notes ? `<div class="notes"><strong>Obs:</strong> ${order.notes}</div>` : ''}
          <div class="line"></div>
          <div class="center">*** FIM DA COMANDA ***</div>
        </body>
      </html>
    `

    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()

    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 300)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar ao Painel
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Gerenciar Pedidos</h1>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando pedidos...</p>
          </div>
        ) : (
          <>
            {/* Orders List */}
            <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">
                      Pedido #{order.displayCode || order.id}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-2 ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-gray-600 space-y-1">
                    <p>Cliente: {order.customerName}</p>
                    {order.customerPhone && (
                      <p>Telefone: {order.customerPhone}</p>
                    )}
                    <p className="text-sm">
                      Horário: {formatTime(order.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    R$ {order.total.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <h4 className="font-semibold mb-2">Itens:</h4>
                <ul className="space-y-2">
                  {order.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between text-sm"
                    >
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-medium">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
                {order.notes && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded text-sm">
                    <strong>Observação:</strong> {order.notes}
                  </div>
                )}
              </div>

              {/* Status Actions */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handlePrintOrder(order)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir Comanda
                </button>
                {order.status === 'pendente' && (
                  <>
                    <button
                      onClick={() =>
                        updateOrderStatus(order.id, 'preparando')
                      }
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Iniciar Preparo
                    </button>
                    <button
                      onClick={() =>
                        updateOrderStatus(order.id, 'cancelado')
                      }
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Cancelar
                    </button>
                  </>
                )}
                {order.status === 'preparando' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'pronto')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Marcar como Pronto
                  </button>
                )}
                {order.status === 'pronto' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'entregue')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Marcar como Entregue
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {orders.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>Nenhum pedido no momento</p>
            <p className="text-sm mt-2">Os novos pedidos aparecerão aqui automaticamente</p>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  )
}
