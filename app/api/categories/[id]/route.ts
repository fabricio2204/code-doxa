import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin'

export const dynamic = 'force-dynamic'

// GET - Buscar categoria por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAdmin()
    const { id } = params

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Erro ao buscar categoria:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar categoria', details: error.message },
      { status: 500 }
    )
  }
}

// PUT - Atualizar categoria
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAdmin()
    const { id } = params
    const body = await request.json()

    const { name, label, emoji, display_order } = body

    // Verificar se a categoria existe
    const { data: existing } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    // Não permitir atualizar a categoria "todos"
    if (id === 'todos') {
      return NextResponse.json(
        { error: 'Não é possível editar a categoria "Todos"' },
        { status: 403 }
      )
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (name !== undefined) updateData.name = name
    if (label !== undefined) updateData.label = label
    if (emoji !== undefined) updateData.emoji = emoji
    if (display_order !== undefined) updateData.display_order = display_order

    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Erro ao atualizar categoria:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar categoria', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Deletar categoria
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAdmin()
    const { id } = params

    // Não permitir deletar a categoria "todos"
    if (id === 'todos') {
      return NextResponse.json(
        { error: 'Não é possível deletar a categoria "Todos"' },
        { status: 403 }
      )
    }

    // Verificar se existem itens usando esta categoria
    const { data: itemsCount } = await supabase
      .from('menu_items')
      .select('id', { count: 'exact', head: true })
      .eq('category', id)

    if (itemsCount && itemsCount.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível deletar categoria que possui itens associados' },
        { status: 409 }
      )
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao deletar categoria:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar categoria', details: error.message },
      { status: 500 }
    )
  }
}
