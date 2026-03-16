const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: 'cafe' | 'bebidas' | 'doces' | 'salgados'
  image?: string | null
  image_path?: string | null
  available: boolean
}

// Cardápio API
export const cardapioAPI = {
  // Obter todos os itens
  async getAllItems(): Promise<MenuItem[]> {
    const response = await fetch(`${API_URL}/cardapio/items`)
    if (!response.ok) throw new Error('Erro ao buscar itens')
    return response.json()
  },

  // Obter um item específico
  async getItem(id: string): Promise<MenuItem> {
    const response = await fetch(`${API_URL}/cardapio/items/${id}`)
    if (!response.ok) throw new Error('Erro ao buscar item')
    return response.json()
  },

  // Criar novo item (com imagem)
  async createItem(item: Omit<MenuItem, 'image'>, imageFile?: File): Promise<MenuItem> {
    const formData = new FormData()
    formData.append('id', item.id)
    formData.append('name', item.name)
    formData.append('description', item.description)
    formData.append('price', item.price.toString())
    formData.append('category', item.category)
    formData.append('available', item.available ? '1' : '0')
    
    if (imageFile) {
      formData.append('image', imageFile)
    }

    const response = await fetch(`${API_URL}/cardapio/items`, {
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) throw new Error('Erro ao criar item')
    return response.json()
  },

  // Atualizar item (com imagem opcional)
  async updateItem(id: string, item: Partial<MenuItem>, imageFile?: File): Promise<MenuItem> {
    const formData = new FormData()
    
    if (item.name) formData.append('name', item.name)
    if (item.description) formData.append('description', item.description)
    if (item.price !== undefined) formData.append('price', item.price.toString())
    if (item.category) formData.append('category', item.category)
    if (item.available !== undefined) formData.append('available', item.available ? '1' : '0')
    
    if (imageFile) {
      formData.append('image', imageFile)
    }

    const response = await fetch(`${API_URL}/cardapio/items/${id}`, {
      method: 'PUT',
      body: formData,
    })
    
    if (!response.ok) throw new Error('Erro ao atualizar item')
    return response.json()
  },

  // Deletar item
  async deleteItem(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/cardapio/items/${id}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) throw new Error('Erro ao deletar item')
  },
}

// Pedidos API
export const pedidosAPI = {
  async createOrder(order: {
    customer_token: string
    customer_name: string
    customer_phone?: string
    items: Array<{ id: string; quantity: number; price: number }>
    total: number
    notes?: string
  }) {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    })
    
    if (!response.ok) throw new Error('Erro ao criar pedido')
    return response.json()
  },

  async getAllOrders() {
    const response = await fetch(`${API_URL}/orders`)
    if (!response.ok) throw new Error('Erro ao buscar pedidos')
    return response.json()
  },

  async getMyOrders(customerToken: string) {
    const response = await fetch(`${API_URL}/orders/my`, {
      headers: {
        'x-customer-token': customerToken,
      },
    })

    if (!response.ok) throw new Error('Erro ao buscar seus pedidos')
    return response.json()
  },

  async updateOrderStatus(id: string, status: string) {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    
    if (!response.ok) throw new Error('Erro ao atualizar status')
    return response.json()
  },
}

export const settingsAPI = {
  async getOrdersAvailability(): Promise<{ enabled: boolean }> {
    const response = await fetch(`${API_URL}/settings/orders?t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    })
    if (!response.ok) throw new Error('Erro ao buscar configuração de pedidos')
    return response.json()
  },

  async setOrdersAvailability(enabled: boolean): Promise<{ enabled: boolean }> {
    const response = await fetch(`${API_URL}/settings/orders/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    })

    if (!response.ok) throw new Error('Erro ao atualizar configuração de pedidos')
    return response.json()
  },
}
