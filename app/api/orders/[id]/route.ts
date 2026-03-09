import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin'
import { formatOrderCode } from '@/app/api/_lib/utils'

export const runtime = 'nodejs'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { status } = await request.json()
    const supabaseAdmin = getSupabaseAdmin()
    const orderId = params.id

    const { data: row, error } = await supabaseAdmin
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select('id, sequence_number')
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!row) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      id: orderId,
      sequence_number: row.sequence_number,
      order_code: formatOrderCode(row.sequence_number),
      status,
      message: 'Status atualizado',
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao atualizar status' }, { status: 500 })
  }
}
