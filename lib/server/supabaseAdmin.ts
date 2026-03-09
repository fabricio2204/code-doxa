import { createClient } from '@supabase/supabase-js'

let cachedClient: any = null

export function getSupabaseAdmin(): any {
  if (cachedClient) {
    return cachedClient
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios no ambiente')
  }

  cachedClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return cachedClient
}

const seedItems = [
  { id: '1', name: 'Espresso', description: 'Café expresso tradicional, intenso e aromático', price: 5.5, category: 'cafe', available: true },
  { id: '2', name: 'Cappuccino', description: 'Café com leite vaporizado e espuma cremosa', price: 8.5, category: 'cafe', available: true },
  { id: '3', name: 'Café Latte', description: 'Espresso com leite vaporizado e leve espuma', price: 9.0, category: 'cafe', available: true },
  { id: '4', name: 'Mocha', description: 'Cappuccino com chocolate e chantilly', price: 10.5, category: 'cafe', available: true },
  { id: '5', name: 'Café Americano', description: 'Espresso diluído em água quente', price: 6.5, category: 'cafe', available: true },
  { id: '6', name: 'Suco de Laranja', description: 'Suco natural de laranja fresco', price: 8.0, category: 'bebidas', available: true },
  { id: '7', name: 'Smoothie de Frutas Vermelhas', description: 'Mix de morango, framboesa e mirtilo', price: 12.0, category: 'bebidas', available: true },
  { id: '8', name: 'Chá Gelado', description: 'Chá preto gelado com limão', price: 7.0, category: 'bebidas', available: true },
  { id: '9', name: 'Chocolate Quente', description: 'Chocolate cremoso com chantilly', price: 9.5, category: 'bebidas', available: true },
  { id: '10', name: 'Bolo de Chocolate', description: 'Fatia de bolo de chocolate com cobertura', price: 8.5, category: 'doces', available: true },
  { id: '11', name: 'Cheesecake', description: 'Torta de queijo com calda de frutas vermelhas', price: 12.0, category: 'doces', available: true },
  { id: '12', name: 'Brownie', description: 'Brownie de chocolate com nozes', price: 7.5, category: 'doces', available: true },
  { id: '13', name: 'Torta de Limão', description: 'Torta de limão com merengue', price: 10.0, category: 'doces', available: true },
  { id: '14', name: 'Cookie', description: 'Cookie de chocolate com gotas', price: 5.0, category: 'doces', available: true },
  { id: '15', name: 'Croissant', description: 'Croissant francês folhado e amanteigado', price: 7.0, category: 'salgados', available: true },
  { id: '16', name: 'Sanduíche Natural', description: 'Pão integral com peito de peru e salada', price: 12.5, category: 'salgados', available: true },
  { id: '17', name: 'Quiche', description: 'Quiche de queijo e espinafre', price: 10.0, category: 'salgados', available: true },
  { id: '18', name: 'Pão de Queijo', description: 'Tradicional pão de queijo mineiro', price: 4.5, category: 'salgados', available: true },
  { id: '19', name: 'Empada de Frango', description: 'Empada assada com recheio de frango', price: 6.5, category: 'salgados', available: true },
]

let seedPromise: Promise<void> | null = null

export async function ensureSeedData() {
  if (!seedPromise) {
    seedPromise = (async () => {
      const supabaseAdmin = getSupabaseAdmin()

      const { count, error: countError } = await supabaseAdmin
        .from('menu_items')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        throw countError
      }

      if ((count || 0) > 0) {
        return
      }

      const { error: insertError } = await supabaseAdmin
        .from('menu_items')
        .insert(seedItems)

      if (insertError) {
        throw insertError
      }
    })()
  }

  await seedPromise
}
