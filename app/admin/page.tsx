'use client'

import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { settingsAPI } from '@/lib/api'
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Coffee, 
  Users, 
  LogOut,
  Settings,
  Tags,
  Power
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function AdminPage() {
  const { user, isAuthenticated, logout, hasRole } = useAuth()
  const router = useRouter()
  const [ordersEnabled, setOrdersEnabled] = useState<boolean | null>(null)
  const [isUpdatingOrdersStatus, setIsUpdatingOrdersStatus] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    const savedStatus = localStorage.getItem('orders_enabled')
    if (savedStatus !== null) {
      setOrdersEnabled(savedStatus === 'true')
    }

    const fetchOrdersStatus = async () => {
      if (!isAuthenticated) return

      try {
        const data = await settingsAPI.getOrdersAvailability()
        const enabled = Boolean(data.enabled)
        setOrdersEnabled(enabled)
        localStorage.setItem('orders_enabled', String(enabled))
      } catch (error) {
        console.error('Erro ao carregar status dos pedidos:', error)
      }
    }

    fetchOrdersStatus()
  }, [isAuthenticated])

  if (!isAuthenticated || !user) {
    return null
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleToggleOrders = async () => {
    if (isUpdatingOrdersStatus || ordersEnabled === null) return

    try {
      setIsUpdatingOrdersStatus(true)
      const nextValue = !ordersEnabled
      const data = await settingsAPI.setOrdersAvailability(nextValue)
      const enabled = Boolean(data.enabled)
      setOrdersEnabled(enabled)
      localStorage.setItem('orders_enabled', String(enabled))
    } catch (error) {
      console.error('Erro ao atualizar status dos pedidos:', error)
      alert('Não foi possível atualizar o status dos pedidos.')
    } finally {
      setIsUpdatingOrdersStatus(false)
    }
  }

  const adminCards = [
    {
      title: 'Pedidos',
      description: 'Gerenciar pedidos em andamento',
      icon: ShoppingBag,
      href: '/admin/pedidos',
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
      iconColor: 'text-blue-600',
      requiredRole: 'atendente' as const,
    },
    {
      title: 'Cardápio',
      description: 'Editar itens do cardápio',
      icon: Coffee,
      href: '/admin/cardapio',
      color: 'bg-green-50 hover:bg-green-100 border-green-200',
      iconColor: 'text-green-600',
      requiredRole: 'gerente' as const,
    },
    {
      title: 'Categorias',
      description: 'Gerenciar categorias de produtos',
      icon: Tags,
      href: '/admin/categorias',
      color: 'bg-amber-50 hover:bg-amber-100 border-amber-200',
      iconColor: 'text-amber-600',
      requiredRole: 'gerente' as const,
    },
    {
      title: 'Usuários',
      description: 'Gerenciar usuários do sistema',
      icon: Users,
      href: '/admin/usuarios',
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
      iconColor: 'text-purple-600',
      requiredRole: 'admin' as const,
    },
    {
      title: 'Configurações',
      description: 'Ajustes gerais do sistema',
      icon: Settings,
      href: '/admin/configuracoes',
      color: 'bg-gray-50 hover:bg-gray-100 border-gray-200',
      iconColor: 'text-gray-600',
      requiredRole: 'gerente' as const,
    },
  ]

  const getRoleName = (role: string) => {
    const roles: Record<string, string> = {
      admin: 'Administrador',
      gerente: 'Gerente',
      atendente: 'Atendente',
    }
    return roles[role] || role
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Painel Administrativo
              </h1>
              <div className="flex items-center gap-4 text-gray-600">
                <span>Bem-vindo, {user.name}</span>
                <span className="px-3 py-1 bg-black text-white text-sm rounded-full">
                  {getRoleName(user.role)}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </div>
        </div>

        {hasRole('gerente') && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Controle de Pedidos</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Status atual: {ordersEnabled === null ? 'Carregando...' : ordersEnabled ? 'Recebendo pedidos' : 'Pedidos desabilitados'}
                </p>
              </div>

              <button
                onClick={handleToggleOrders}
                disabled={isUpdatingOrdersStatus || ordersEnabled === null}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                  ordersEnabled
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <Power className="w-4 h-4" />
                {isUpdatingOrdersStatus
                  ? 'Atualizando...'
                  : ordersEnabled === null
                    ? 'Carregando...'
                  : ordersEnabled
                    ? 'Desabilitar Pedidos'
                    : 'Habilitar Pedidos'}
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminCards.map((card) => {
            const hasAccess = hasRole(card.requiredRole)
            const Icon = card.icon

            return (
              <Link
                key={card.title}
                href={hasAccess ? card.href : '#'}
                className={`block border rounded-lg p-6 transition-all ${
                  hasAccess
                    ? card.color
                    : 'bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                    hasAccess ? 'bg-white' : 'bg-gray-200'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${hasAccess ? card.iconColor : 'text-gray-400'}`} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{card.title}</h3>
                <p className="text-sm text-gray-600">{card.description}</p>
                {!hasAccess && (
                  <p className="text-xs text-red-600 mt-2">
                    Acesso restrito
                  </p>
                )}
              </Link>
            )
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pedidos Hoje</p>
                <p className="text-3xl font-bold">24</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Itens no Cardápio</p>
                <p className="text-3xl font-bold">19</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Coffee className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Receita Hoje</p>
                <p className="text-3xl font-bold">R$ 1.2k</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
