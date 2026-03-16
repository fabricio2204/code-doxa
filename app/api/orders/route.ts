import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin'
import { fetchOrdersWithItems, formatOrderCode } from '@/app/api/_lib/utils'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const orders = await fetchOrdersWithItems()
    return NextResponse.json(orders)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao buscar pedidos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabaseAdmin = getSupabaseAdmin()

    const { data: settingsRow, error: settingsError } = await supabaseAdmin
      .from('app_settings')
      .select('orders_enabled')
      .eq('id', 1)
      .maybeSingle()

    if (settingsError && settingsError.code !== '42P01') {
      return NextResponse.json({ error: settingsError.message }, { status: 500 })
    }

    if (settingsRow && settingsRow.orders_enabled === false) {
      return NextResponse.json(
        { error: 'No momento não estamos recebendo pedidos.' },
        { status: 403 }
      )
    }

    const { customer_name, customer_phone, items, total, notes, customer_token } = body || {}
    const orderId = `ORD-${Date.now()}`

    if (!customer_token) {
      return NextResponse.json({ error: 'customer_token é obrigatório' }, { status: 400 })
    }

    const { data: orderRow, error: orderErr } = await supabaseAdmin
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
      return NextResponse.json({ error: orderErr.message }, { status: 500 })
    }

    const orderItemsPayload = (items || []).map((item: any) => ({
      order_id: orderId,
      item_id: item.id,
      quantity: item.quantity,
      price: item.price,
    }))

    if (orderItemsPayload.length > 0) {
      const { error: itemsErr } = await supabaseAdmin.from('order_items').insert(orderItemsPayload)

      if (itemsErr) {
        await supabaseAdmin.from('orders').delete().eq('id', orderId)
        return NextResponse.json({ error: itemsErr.message }, { status: 500 })
      }
    }

    return NextResponse.json(
      {
        id: orderId,
        sequence_number: orderRow.sequence_number,
        order_code: formatOrderCode(orderRow.sequence_number),
        status: orderRow.status || 'pendente',
        message: 'Pedido criado com sucesso',
      },
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao criar pedido' }, { status: 500 })
  }
}
