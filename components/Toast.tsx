'use client'

import { useEffect } from 'react'
import { X, Bell } from 'lucide-react'

interface ToastProps {
  message: string
  onClose: () => void
  duration?: number
}

export function Toast({ message, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="bg-black text-white rounded-lg shadow-2xl p-4 pr-12 max-w-md border-2 border-gray-700">
        <div className="flex items-start gap-3">
          <div className="bg-white rounded-full p-2">
            <Bell className="w-5 h-5 text-black animate-bounce" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">Novo Pedido!</h3>
            <p className="text-gray-200">{message}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 hover:bg-gray-800 rounded transition-colors"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
