'use client'

import { Coffee } from 'lucide-react'
import DoxaLogo from './DoxaLogo'

export function Hero() {
  return (
    <section className="bg-black text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center mb-8">
          <DoxaLogo size="medium" showText={false} color="white" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Bem-vindo
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
          Descubra nossos cafés artesanais, bebidas refrescantes e delícias que vão alegrar seu dia
        </p>
      </div>
    </section>
  )
}
