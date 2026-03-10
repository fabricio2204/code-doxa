'use client'

import { useEffect, useRef, useState } from 'react'
import { pedidosAPI } from '@/lib/api'

interface OrderNotification {
  id: string
  message: string
}

export function useOrderNotifications(enabled: boolean = true) {
  const [notification, setNotification] = useState<OrderNotification | null>(null)
  const lastOrderIdRef = useRef<string | null>(null)
  const isInitialLoad = useRef(true)

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(988, audioContext.currentTime + 0.1)
      gainNode.gain.setValueAtTime(0.001, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.18, audioContext.currentTime + 0.02)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.35)

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.35)
    } catch (error) {
      console.error('Erro ao tocar som de notificação:', error)
    }
  }

  useEffect(() => {
    if (!enabled) return

    const checkNewOrders = async () => {
      try {
        const orders = await pedidosAPI.getAllOrders()
        const latestOrderId = orders.length > 0 ? orders[0].id : null

        // No primeiro carregamento, apenas armazena o último pedido conhecido
        if (isInitialLoad.current) {
          lastOrderIdRef.current = latestOrderId
          isInitialLoad.current = false
          return
        }

        // Se o pedido mais recente mudou, chegou pedido novo
        if (latestOrderId && latestOrderId !== lastOrderIdRef.current) {
          playNotificationSound()
          setNotification({
            id: Date.now().toString(),
            message: 'Novo pedido recebido!',
          })
        }

        lastOrderIdRef.current = latestOrderId
      } catch (error) {
        console.error('Erro ao verificar novos pedidos:', error)
      }
    }

    // Verificar a cada 3 segundos
    const interval = setInterval(checkNewOrders, 3000)

    // Primeira verificação
    checkNewOrders()

    return () => clearInterval(interval)
  }, [enabled])

  const clearNotification = () => {
    setNotification(null)
  }

  const triggerTestNotification = () => {
    playNotificationSound()
    setNotification({
      id: Date.now().toString(),
      message: 'Teste de alerta: novo pedido recebido!',
    })
  }

  return { notification, clearNotification, triggerTestNotification }
}
