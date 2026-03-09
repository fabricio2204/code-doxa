import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin'
import { fileToDataUrl, normalizeImagePath, parseAvailable } from '@/app/api/_lib/utils'

export const runtime = 'nodejs'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const supabaseAdmin = getSupabaseAdmin()

    const { data: row, error } = await supabaseAdmin
      .from('menu_items')
      .select('*')
      .eq('id', params.id)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!row) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
    }

    const currentRow = row as any

    return NextResponse.json({
      ...currentRow,
      available: Boolean(currentRow.available),
      image: normalizeImagePath(currentRow.image_path),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao buscar item' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const formData = await request.formData()
    const supabaseAdmin = getSupabaseAdmin()

    const { data: currentItem, error: fetchError } = await supabaseAdmin
      .from('menu_items')
      .select('*')
      .eq('id', params.id)
      .maybeSingle()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!currentItem) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
    }

    const existingItem = currentItem as any

    const name = String(formData.get('name') || existingItem.name)
    const description = String(formData.get('description') || existingItem.description)
    const priceRaw = formData.get('price')
    const category = String(formData.get('category') || existingItem.category)

    let available = existingItem.available
    const availableRaw = formData.get('available')
    if (availableRaw !== null && availableRaw !== undefined) {
      available = parseAvailable(availableRaw)
    }

    const imageFile = formData.get('image') as File | null
    const uploadedDataUrl = await fileToDataUrl(imageFile)
    const imagePath = uploadedDataUrl || existingItem.image_path

    const nextItem = {
      name,
      description,
      price: priceRaw !== null && priceRaw !== undefined ? Number(priceRaw) : existingItem.price,
      category,
      image_path: imagePath,
      available,
      updated_at: new Date().toISOString(),
    }

    const { error: updateError } = await supabaseAdmin
      .from('menu_items')
      .update(nextItem)
      .eq('id', params.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      id: params.id,
      name: nextItem.name,
      description: nextItem.description,
      price: nextItem.price,
      category: nextItem.category,
      image: normalizeImagePath(nextItem.image_path),
      available: Boolean(nextItem.available),
    })
  } catch (error: any) {
    const status = String(error?.message || '').includes('5MB') ? 400 : 500
    return NextResponse.json({ error: error.message || 'Erro ao atualizar item' }, { status })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const supabaseAdmin = getSupabaseAdmin()

    const { data, error } = await supabaseAdmin
      .from('menu_items')
      .delete()
      .eq('id', params.id)
      .select('id')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Item deletado com sucesso' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao deletar item' }, { status: 500 })
  }
}
