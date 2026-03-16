import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

const SETTINGS_ROW_ID = 1
const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin()

    const { data, error } = await supabaseAdmin
      .from('app_settings')
      .select('orders_enabled')
      .eq('id', SETTINGS_ROW_ID)
      .maybeSingle()

    if (error) {
      // If table is not created yet, keep system available by default.
      if (error.code === '42P01') {
        return NextResponse.json({ enabled: true }, { headers: NO_CACHE_HEADERS })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('app_settings')
        .insert({
          id: SETTINGS_ROW_ID,
          orders_enabled: true,
        })
        .select('orders_enabled')
        .single()

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }

      return NextResponse.json(
        { enabled: Boolean(inserted?.orders_enabled) },
        { headers: NO_CACHE_HEADERS }
      )
    }

    return NextResponse.json({ enabled: Boolean(data.orders_enabled) }, { headers: NO_CACHE_HEADERS })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao buscar configuração de pedidos' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
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
    return NextResponse.json({ error: error.message || 'Erro ao atualizar configuração de pedidos' }, { status: 500 })
  }
}
