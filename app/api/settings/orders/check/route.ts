import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SETTINGS_ROW_ID = 1

export async function POST() {
  try {
    const supabaseAdmin = getSupabaseAdmin()

    const { data, error } = await supabaseAdmin
      .from('app_settings')
      .select('orders_enabled')
      .eq('id', SETTINGS_ROW_ID)
      .maybeSingle()

    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json({ enabled: true })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ enabled: true })
    }

    return NextResponse.json({ enabled: Boolean(data.orders_enabled) })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar configuração de pedidos' },
      { status: 500 }
    )
  }
}
