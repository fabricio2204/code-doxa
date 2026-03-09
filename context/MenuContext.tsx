'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { MenuItem } from '@/types'
import { cardapioAPI } from '@/lib/api'

interface MenuContextType {
  menuItems: MenuItem[]
  updateMenuItem: (item: MenuItem) => void
  addMenuItem: (item: MenuItem) => void
  removeMenuItem: (id: string) => void
  getMenuItem: (id: string) => MenuItem | undefined
  isLoading: boolean
  refreshMenuItems: () => Promise<void>
}

const MenuContext = createContext<MenuContextType | undefined>(undefined)

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refreshMenuItems = async () => {
    try {
      setIsLoading(true)
      const items = await cardapioAPI.getAllItems()
      setMenuItems(items)
    } catch (error) {
      console.error('Erro ao carregar cardápio:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshMenuItems()
  }, [])

  const updateMenuItem = (item: MenuItem) => {
    setMenuItems((prev) =>
      prev.map((i) => (i.id === item.id ? item : i))
    )
  }

  const addMenuItem = (item: MenuItem) => {
    setMenuItems((prev) => [...prev, item])
  }

  const removeMenuItem = (id: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id))
  }

  const getMenuItem = (id: string) => {
    return menuItems.find((item) => item.id === id)
  }

  return (
    <MenuContext.Provider
      value={{
        menuItems,
        updateMenuItem,
        addMenuItem,
        removeMenuItem,
        getMenuItem,
        isLoading,
        refreshMenuItems,
      }}
    >
      {children}
    </MenuContext.Provider>
  )
}

export function useMenu() {
  const context = useContext(MenuContext)
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider')
  }
  return context
}
