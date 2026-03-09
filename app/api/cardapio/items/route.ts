import { NextResponse } from 'next/server'
import { ensureSeedData, getSupabaseAdmin } from '@/lib/server/supabaseAdmin'
import { fileToDataUrl, normalizeImagePath, parseAvailable } from '@/app/api/_lib/utils'

export const runtime = 'nodejs'

export async function GET() {
  try {
    await ensureSeedData()
    const supabaseAdmin = getSupabaseAdmin()

    const { data, error } = await supabaseAdmin
      .from('menu_items')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const items = ((data || []) as any[]).map((item: any) => ({
      ...item,
      available: Boolean(item.available),
      image: normalizeImagePath(item.image_path),
    }))

    return NextResponse.json(items)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao buscar itens' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const supabaseAdmin = getSupabaseAdmin()

    const id = String(formData.get('id') || '')
    const name = String(formData.get('name') || '')
    const description = String(formData.get('description') || '')
    const priceRaw = formData.get('price')
    const category = String(formData.get('category') || '')
    const available = parseAvailable(formData.get('available'))

    if (!id || !name || !description || !priceRaw || !category) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
    }

    const price = Number(priceRaw)
    const imageFile = formData.get('image') as File | null
    const imagePath = await fileToDataUrl(imageFile)

    const { error } = await supabaseAdmin.from('menu_items').insert({
      id,
      name,
      description,
      price,
      category,
      image_path: imagePath,
      available,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        id,
        name,
        description,
        price,
        category,
        image: normalizeImagePath(imagePath),
        available,
      },
      { status: 201 }
    )
  } catch (error: any) {
    const status = String(error?.message || '').includes('5MB') ? 400 : 500
    return NextResponse.json({ error: error.message || 'Erro ao criar item' }, { status })
  }
}
