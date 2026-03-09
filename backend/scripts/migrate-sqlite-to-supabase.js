import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import sqlite3 from 'sqlite3'
import { supabase } from '../supabase.js'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const sqlitePathArg = process.argv[2]
const defaultSqlitePath = path.resolve(__dirname, '..', 'cafeteria.db')
const sqlitePath = sqlitePathArg
  ? path.resolve(process.cwd(), sqlitePathArg)
  : defaultSqlitePath

function openSqliteDatabase(filePath) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(filePath, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        reject(err)
        return
      }
      resolve(db)
    })
  })
}

function sqliteAll(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err)
        return
      }
      resolve(rows || [])
    })
  })
}

function sqliteClose(db) {
  return new Promise((resolve) => {
    db.close(() => resolve())
  })
}

async function upsertInChunks(table, rows, chunkSize = 500) {
  if (!rows.length) {
    return
  }

  for (let index = 0; index < rows.length; index += chunkSize) {
    const chunk = rows.slice(index, index + chunkSize)
    const { error } = await supabase.from(table).upsert(chunk)

    if (error) {
      throw error
    }
  }
}

async function deleteOrderItemsInChunks(orderIds, chunkSize = 200) {
  if (!orderIds.length) {
    return
  }

  for (let index = 0; index < orderIds.length; index += chunkSize) {
    const chunk = orderIds.slice(index, index + chunkSize)

    const { error } = await supabase
      .from('order_items')
      .delete()
      .in('order_id', chunk)

    if (error) {
      throw error
    }
  }
}

async function insertOrderItemsInChunks(rows, chunkSize = 500) {
  if (!rows.length) {
    return
  }

  for (let index = 0; index < rows.length; index += chunkSize) {
    const chunk = rows.slice(index, index + chunkSize)
    const { error } = await supabase.from('order_items').insert(chunk)

    if (error) {
      throw error
    }
  }
}

async function migrate() {
  console.log(`\n[SQLite -> Supabase] Origem: ${sqlitePath}`)

  const sqliteDb = await openSqliteDatabase(sqlitePath)

  try {
    const menuRows = await sqliteAll(sqliteDb, 'SELECT * FROM menu_items')
    const orderRows = await sqliteAll(sqliteDb, 'SELECT * FROM orders')
    const orderItemRows = await sqliteAll(sqliteDb, 'SELECT * FROM order_items')

    const menuPayload = menuRows.map((item) => ({
      id: String(item.id),
      name: item.name,
      description: item.description,
      price: Number(item.price),
      category: item.category,
      image_path: item.image_path || null,
      available: item.available === null || item.available === undefined ? true : Boolean(item.available),
      created_at: item.created_at || null,
      updated_at: item.updated_at || null,
    }))

    const orderPayload = orderRows.map((order) => ({
      id: String(order.id),
      sequence_number: order.sequence_number ? Number(order.sequence_number) : null,
      customer_token: order.customer_token || null,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone || null,
      total: Number(order.total),
      status: order.status || 'pendente',
      notes: order.notes || null,
      created_at: order.created_at || null,
      updated_at: order.updated_at || null,
    }))

    const validMenuIds = new Set(menuPayload.map((item) => item.id))

    const orderItemsPayload = orderItemRows
      .filter((item) => validMenuIds.has(String(item.item_id)))
      .map((item) => ({
        order_id: String(item.order_id),
        item_id: String(item.item_id),
        quantity: Number(item.quantity),
        price: Number(item.price),
      }))

    console.log(`[1/4] Upsert menu_items (${menuPayload.length})`)
    await upsertInChunks('menu_items', menuPayload)

    console.log(`[2/4] Upsert orders (${orderPayload.length})`)
    await upsertInChunks('orders', orderPayload)

    const orderIds = [...new Set(orderPayload.map((order) => order.id))]

    console.log(`[3/4] Rebuild order_items (${orderItemsPayload.length})`)
    await deleteOrderItemsInChunks(orderIds)
    await insertOrderItemsInChunks(orderItemsPayload)

    console.log('[4/4] Sync sequence_number')
    const { error: syncError } = await supabase.rpc('sync_orders_sequence')

    if (syncError) {
      console.warn('Aviso: não foi possível sincronizar a sequência automaticamente:', syncError.message)
      console.warn('Execute no SQL Editor: SELECT public.sync_orders_sequence();')
    }

    console.log('\n✅ Migração concluída com sucesso!')
    console.log(`- menu_items: ${menuPayload.length}`)
    console.log(`- orders: ${orderPayload.length}`)
    console.log(`- order_items: ${orderItemsPayload.length}`)
  } finally {
    await sqliteClose(sqliteDb)
  }
}

migrate().catch((error) => {
  console.error('\n❌ Falha na migração:', error)
  process.exit(1)
})
