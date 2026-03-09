import { NextResponse } from 'next/server'
import { fetchOrdersWithItems } from '@/app/api/_lib/utils'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const customerToken = request.headers.get('x-customer-token')

  if (!customerToken) {
    return NextResponse.json({ error: 'customer token é obrigatório' }, { status: 400 })
  }

  try {
    const orders = await fetchOrdersWithItems(customerToken)
    return NextResponse.json(orders)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao buscar pedidos' }, { status: 500 })
  }
}
