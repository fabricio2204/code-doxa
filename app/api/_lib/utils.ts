import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin'

export function normalizeImagePath(imagePath?: string | null): string | null {
  if (!imagePath) {
    return null
  }

  if (imagePath.startsWith('data:') || imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }

  if (imagePath.startsWith('/')) {
    return imagePath
  }

  return `/uploads/${imagePath}`
}

export function parseAvailable(value: FormDataEntryValue | null): boolean {
  if (value === null || value === undefined) {
    return true
  }

  const normalized = String(value).toLowerCase()
  return normalized === '1' || normalized === 'true'
}

export async function fileToDataUrl(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) {
    return null
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Imagem maior que 5MB')
  }

  const mime = file.type || 'image/jpeg'
  const buffer = Buffer.from(await file.arrayBuffer())
  return `data:${mime};base64,${buffer.toString('base64')}`
}

export function formatOrderCode(sequenceNumber: number | null | undefined) {
  return String(sequenceNumber || 0).padStart(7, '0')
}

export async function fetchOrdersWithItems(customerToken?: string) {
  const supabaseAdmin = getSupabaseAdmin()

  let query = supabaseAdmin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (customerToken) {
    query = query.eq('customer_token', customerToken)
  }

  const { data: ordersRows, error: ordersErr } = await query

  if (ordersErr) {
    throw ordersErr
  }

  const normalizedOrdersRows = (ordersRows || []) as any[]

  if (normalizedOrdersRows.length === 0) {
    return []
  }

  const orderIds = normalizedOrdersRows.map((order: any) => order.id)

  const { data: itemsRows, error: itemsErr } = await supabaseAdmin
    .from('order_items')
    .select('order_id, item_id, quantity, price, menu_items(id, name, description, category, available)')
    .in('order_id', orderIds)
    .order('id', { ascending: true })

  if (itemsErr) {
    throw itemsErr
  }

  const itemsByOrder: Record<string, Array<Record<string, unknown>>> = {}

  ;(itemsRows || []).forEach((item: any) => {
    if (!itemsByOrder[item.order_id]) {
      itemsByOrder[item.order_id] = []
    }

    const menuItem = item.menu_items

    itemsByOrder[item.order_id].push({
      id: item.item_id,
      name: menuItem?.name || 'Item removido',
      description: menuItem?.description || '',
      category: menuItem?.category || 'cafe',
      available:
        menuItem?.available !== null && menuItem?.available !== undefined
          ? Boolean(menuItem.available)
          : true,
      quantity: item.quantity,
      price: item.price,
    })
  })

  return normalizedOrdersRows.map((row: any) => ({
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
}
