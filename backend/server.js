import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { supabase, ensureSeedData } from './supabase.js'
import cardapioRoutes from './routes/cardapio.js'

dotenv.config()

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3333
const allowedOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const corsConfig = {
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true)
      return
    }

    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }

    callback(new Error('Origem não permitida pelo CORS'))
  },
}

const formatOrderCode = (sequenceNumber) =>
  String(sequenceNumber || 0).padStart(7, '0')

const fetchOrdersWithItems = async ({ customerToken, res }) => {
  let ordersQuery = supabase.from('orders').select('*').order('created_at', { ascending: false })

  if (customerToken) {
    ordersQuery = ordersQuery.eq('customer_token', customerToken)
  }

  const { data: ordersRows, error: ordersErr } = await ordersQuery

  if (ordersErr) {
    return res.status(500).json({ error: ordersErr.message })
  }

  if (!ordersRows || ordersRows.length === 0) {
    return res.json([])
  }

  const orderIds = ordersRows.map((order) => order.id)

  const { data: itemsRows, error: itemsErr } = await supabase
    .from('order_items')
    .select('order_id, item_id, quantity, price, menu_items(id, name, description, category, available)')
    .in('order_id', orderIds)
    .order('id', { ascending: true })

  if (itemsErr) {
    return res.status(500).json({ error: itemsErr.message })
  }

  const itemsByOrder = {}

  ;(itemsRows || []).forEach((item) => {
    if (!itemsByOrder[item.order_id]) {
      itemsByOrder[item.order_id] = []
    }

    const menuItem = item.menu_items

    itemsByOrder[item.order_id].push({
      id: item.item_id,
      name: menuItem?.name || 'Item removido',
      description: menuItem?.description || '',
      category: menuItem?.category || 'cafe',
      available: menuItem?.available !== null && menuItem?.available !== undefined ? Boolean(menuItem.available) : true,
      quantity: item.quantity,
      price: item.price,
    })
  })

  const orders = ordersRows.map((row) => ({
    id: row.id,
    sequence_number: row.sequence_number,
    order_code: formatOrderCode(row.sequence_number),
    customer_token: row.customer_token,
    customer_name: row.customer_name,
    customer_phone: row.customer_phone,
    total: row.total,
    status: row.status,
    notes: row.notes,
    created_at: row.created_at,
    items: itemsByOrder[row.id] || [],
  }))

  res.json(orders)
}

// Middlewares
app.use(cors(corsConfig))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Servir arquivos estáticos (imagens)
app.use('/uploads', express.static('public/uploads'))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor rodando' })
})

// Rotas
app.use('/api/cardapio', cardapioRoutes)

// GET: Buscar todos os pedidos
app.get('/api/orders', async (req, res) => {
  await fetchOrdersWithItems({ customerToken: null, res })
})

// GET: Buscar apenas pedidos do usuário (token do navegador)
app.get('/api/orders/my', async (req, res) => {
  const customerToken = req.headers['x-customer-token']

  if (!customerToken) {
    return res.status(400).json({ error: 'customer token é obrigatório' })
  }

  await fetchOrdersWithItems({ customerToken, res })
})

// Rota para pedidos (placeholder para futura implementação)
app.post('/api/orders', async (req, res) => {
  const { customer_name, customer_phone, items, total, notes, customer_token } = req.body
  const orderId = `ORD-${Date.now()}`

  if (!customer_token) {
    return res.status(400).json({ error: 'customer_token é obrigatório' })
  }

  const { data: orderRow, error: orderErr } = await supabase
    .from('orders')
    .insert({
      id: orderId,
      customer_token,
      customer_name,
      customer_phone,
      total,
      notes,
    })
    .select('id, sequence_number, status')
    .single()

  if (orderErr) {
    return res.status(500).json({ error: orderErr.message })
  }

  const orderItemsPayload = (items || []).map((item) => ({
    order_id: orderId,
    item_id: item.id,
    quantity: item.quantity,
    price: item.price,
  }))

  if (orderItemsPayload.length > 0) {
    const { error: itemsErr } = await supabase.from('order_items').insert(orderItemsPayload)

    if (itemsErr) {
      await supabase.from('orders').delete().eq('id', orderId)
      return res.status(500).json({ error: itemsErr.message })
    }
  }

  res.status(201).json({
    id: orderId,
    sequence_number: orderRow.sequence_number,
    order_code: formatOrderCode(orderRow.sequence_number),
    status: orderRow.status || 'pendente',
    message: 'Pedido criado com sucesso',
  })
})

// PUT: Atualizar status do pedido
app.put('/api/orders/:id', async (req, res) => {
  const { status } = req.body
  const orderId = req.params.id

  const { data: row, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select('id, sequence_number')
    .maybeSingle()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  if (!row) {
    return res.status(404).json({ error: 'Pedido não encontrado' })
  }

  res.json({
    id: orderId,
    sequence_number: row.sequence_number,
    order_code: formatOrderCode(row.sequence_number),
    status,
    message: 'Status atualizado',
  })
})

// Erro 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' })
})

// Iniciar servidor
async function startServer() {
  try {
    await ensureSeedData()

    app.listen(PORT, () => {
      console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`)
      console.log(`📝 API Cardápio: http://localhost:${PORT}/api/cardapio`)
      if (allowedOrigins.length > 0) {
        console.log(`🌐 CORS permitido para: ${allowedOrigins.join(', ')}`)
      }
      console.log('☁️ Banco de dados: Supabase\n')
    })
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error)
    process.exit(1)
  }
}

startServer()
