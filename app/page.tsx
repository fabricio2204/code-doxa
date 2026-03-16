'use client'

import { useEffect, useRef, useState } from 'react'
import { MenuGrid } from '@/components/MenuGrid'
import { Hero } from '@/components/Hero'
import { Cart } from '@/components/Cart'
import { settingsAPI } from '@/lib/api'
import { useMenu } from '@/context/MenuContext'
import { useRouter } from 'next/navigation'
import { Coffee, Clock3, BookOpen } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const { refreshMenuItems } = useMenu()
  const [ordersEnabled, setOrdersEnabled] = useState(true)
  const [loadingOrdersStatus, setLoadingOrdersStatus] = useState(true)
  const previousOrdersEnabled = useRef<boolean | null>(null)

  useEffect(() => {
    const fetchOrdersStatus = async () => {
      try {
        const data = await settingsAPI.getOrdersAvailability()
        const nextEnabled = Boolean(data.enabled)
        setOrdersEnabled(nextEnabled)
      } catch (error) {
        console.error('Erro ao carregar status dos pedidos:', error)
      } finally {
        setLoadingOrdersStatus(false)
      }
    }

    fetchOrdersStatus()

    const intervalId = setInterval(() => {
      void fetchOrdersStatus()
    }, 5000)

    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    if (loadingOrdersStatus) return

    if (previousOrdersEnabled.current === null) {
      previousOrdersEnabled.current = ordersEnabled
      return
    }

    if (previousOrdersEnabled.current !== ordersEnabled) {
      void refreshMenuItems()
      router.refresh()
    }

    previousOrdersEnabled.current = ordersEnabled
  }, [ordersEnabled, loadingOrdersStatus, refreshMenuItems, router])

  return (
    <>
      <Hero />
      <div className="container mx-auto px-4 py-12">
        {loadingOrdersStatus ? (
          <div className="text-center py-12 text-gray-500">Carregando cardápio...</div>
        ) : ordersEnabled ? (
          <MenuGrid />
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl border border-amber-200 bg-gradient-to-b from-amber-50 to-white shadow-sm overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300" />

              <div className="p-6 md:p-10 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold tracking-wide mb-4">
                  <Clock3 className="w-4 h-4" />
                  AVISO DE FUNCIONAMENTO
                </div>

                <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900">
                  Pedidos Temporariamente Encerrados
                </h2>

                <p className="text-gray-700 text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
                  No momento não estamos recebendo pedido, ao término do culto retornaremos com as atividades normalmente.
                </p>

                <div className="max-w-2xl mx-auto mt-8 rounded-xl bg-white border border-amber-100 p-5 md:p-6 shadow-sm">
                  <div className="flex items-center justify-center gap-2 text-amber-700 mb-3">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-xs font-semibold tracking-wide">MENSAGEM BÍBLICA</span>
                  </div>
                  <p className="text-gray-800 leading-relaxed text-lg md:text-xl font-medium">
                    “Nem só de pão (café) viverá o homem, mas de toda palavra que procede da boca de Deus”.
                  </p>
                  <p className="mt-3 text-amber-800 font-semibold">Mat 4:4</p>
                </div>

                <div className="mt-8 inline-flex items-center gap-2 text-sm text-gray-600">
                  <Coffee className="w-4 h-4" />
                  Retornaremos com os pedidos em breve
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {!loadingOrdersStatus && ordersEnabled && <Cart />}
    </>
  )
}
