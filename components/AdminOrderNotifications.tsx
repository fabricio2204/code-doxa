'use client'

import { useAuth } from '@/context/AuthContext'
import { useOrderNotifications } from '@/hooks/useOrderNotifications'
import { Toast } from '@/components/Toast'

export function AdminOrderNotifications() {
  const { isAuthenticated, user } = useAuth()
  const isAdmin = isAuthenticated && user?.role === 'admin'

  const { notification, clearNotification } = useOrderNotifications(isAdmin)

  if (!isAdmin || !notification) {
    return null
  }

  return <Toast message={notification.message} onClose={clearNotification} />
}
