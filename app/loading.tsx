'use client'

import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex items-center gap-3 text-gray-700">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="text-sm font-medium">Carregando...</span>
      </div>
    </div>
  )
}
