import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin'

export const dynamic = 'force-dynamic'

// GET - Listar todas as categorias
export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error: any) {
    console.error('Erro ao buscar categorias:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar categorias', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Criar nova categoria
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const body = await request.json()

    const { id, name, label, emoji, display_order } = body

    if (!id || !name || !label) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: id, name, label' },
        { status: 400 }
      )
    }

    // Verificar se o ID já existe
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('id', id)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Categoria com este ID já existe' },
        { status: 409 }
      )
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({
        id,
        name,
        label,
        emoji: emoji || '🍽️',
        display_order: display_order || 999,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar categoria:', error)
    return NextResponse.json(
      { error: 'Erro ao criar categoria', details: error.message },
      { status: 500 }
    )
  }
}
