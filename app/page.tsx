'use client'

import { useEffect, useState } from 'react'
import { MenuGrid } from '@/components/MenuGrid'
import { Hero } from '@/components/Hero'
import { Cart } from '@/components/Cart'
import { settingsAPI } from '@/lib/api'

export default function Home() {
  const [ordersEnabled, setOrdersEnabled] = useState(true)
  const [loadingOrdersStatus, setLoadingOrdersStatus] = useState(true)

  useEffect(() => {
    const fetchOrdersStatus = async () => {
      try {
        const data = await settingsAPI.getOrdersAvailability()
        setOrdersEnabled(Boolean(data.enabled))
      } catch (error) {
        console.error('Erro ao carregar status dos pedidos:', error)
        setOrdersEnabled(true)
      } finally {
        setLoadingOrdersStatus(false)
      }
    }

    fetchOrdersStatus()
  }, [])

  return (
    <>
      <Hero />
      <div className="container mx-auto px-4 py-12">
        {loadingOrdersStatus ? (
          <div className="text-center py-12 text-gray-500">Carregando cardápio...</div>
        ) : ordersEnabled ? (
          <MenuGrid />
        ) : (
          <div className="max-w-3xl mx-auto bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Pedidos Temporariamente Encerrados</h2>
            <p className="text-gray-800 leading-relaxed whitespace-pre-line">
              {`No momento não estamos recebendo pedido, ao término do culto retornaremos com as atividades normalmente.

Está escrito: “Nem só de pão (café) viverá o homem, mas de toda palavra que procede da boca de Deus”.
Mat 4:4`}
            </p>
          </div>
        )}
      </div>
      {!loadingOrdersStatus && ordersEnabled && <Cart />}
    </>
  )
}
