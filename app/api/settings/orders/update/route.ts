import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SETTINGS_ROW_ID = 1

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const enabled = Boolean(body?.enabled)
    const supabaseAdmin = getSupabaseAdmin()

    const { data, error } = await supabaseAdmin
      .from('app_settings')
      .upsert(
        {
          id: SETTINGS_ROW_ID,
          orders_enabled: enabled,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      .select('orders_enabled')
      .single()

    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json(
          { error: 'Tabela app_settings não encontrada. Execute o SQL de configuração.' },
          { status: 500 }
        )
      }

      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ enabled: Boolean(data.orders_enabled) })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar configuração de pedidos' },
      { status: 500 }
    )
  }
}
