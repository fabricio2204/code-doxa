'use client'

import { MenuGrid } from '@/components/MenuGrid'
import { Hero } from '@/components/Hero'
import { Cart } from '@/components/Cart'

export default function Home() {
  return (
    <>
      <Hero />
      <div className="container mx-auto px-4 py-12">
        <MenuGrid />
      </div>
      <Cart />
    </>
  )
}
