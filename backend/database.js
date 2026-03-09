import sqlite3 from 'sqlite3'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const databasePath = process.env.SQLITE_PATH
  ? resolve(process.env.SQLITE_PATH)
  : resolve(__dirname, 'cafeteria.db')

const db = new sqlite3.Database(databasePath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err)
  } else {
    console.log('✓ Conectado ao SQLite')
    console.log(`📁 Banco SQLite em: ${databasePath}`)
    initializeDatabase()
  }
})

function initializeDatabase() {
  db.serialize(() => {
    // Criar tabela de itens do cardápio
    db.run(
      `CREATE TABLE IF NOT EXISTS menu_items (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price REAL NOT NULL,
        category TEXT NOT NULL,
        image_path TEXT,
        available INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      (err) => {
        if (err) {
          console.error('Erro ao criar tabela menu_items:', err)
        } else {
          console.log('✓ Tabela menu_items pronta')
          seedDatabase()
        }
      }
    )

    // Criar tabela de pedidos
    db.run(
      `CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        sequence_number INTEGER UNIQUE,
        customer_token TEXT,
        customer_name TEXT NOT NULL,
        customer_phone TEXT,
        total REAL NOT NULL,
        status TEXT DEFAULT 'pendente',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      (err) => {
        if (err) {
          console.error('Erro ao criar tabela orders:', err)
        } else {
          console.log('✓ Tabela orders pronta')
          ensureOrderSequenceInfrastructure()
          ensureCustomerTokenColumn()
        }
      }
    )

    // Criar tabela de itens de pedidos
    db.run(
      `CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT NOT NULL,
        item_id TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id)
      )`,
      (err) => {
        if (err) {
          console.error('Erro ao criar tabela order_items:', err)
        } else {
          console.log('✓ Tabela order_items pronta')
        }
      }
    )
  })
}

function ensureOrderSequenceInfrastructure() {
  db.run(
    `CREATE TABLE IF NOT EXISTS order_sequence_counter (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    (counterErr) => {
      if (counterErr) {
        console.error('Erro ao criar tabela order_sequence_counter:', counterErr)
        return
      }

      ensureOrderSequenceColumn()
    }
  )
}

function ensureOrderSequenceColumn() {
  db.all('PRAGMA table_info(orders)', (err, columns) => {
    if (err) {
      console.error('Erro ao verificar colunas de orders:', err)
      return
    }

    const hasSequenceColumn = columns.some(
      (column) => column.name === 'sequence_number'
    )

    const continueWithBackfill = () => {
      db.run(
        'CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_sequence_number ON orders(sequence_number)',
        (indexErr) => {
          if (indexErr) {
            console.error('Erro ao criar índice de sequence_number:', indexErr)
            return
          }

          db.get(
            'SELECT COALESCE(MAX(sequence_number), 0) as maxSeq FROM orders',
            (maxErr, maxRow) => {
              if (maxErr) {
                console.error('Erro ao buscar maior sequence_number:', maxErr)
                return
              }

              const maxSeq = maxRow?.maxSeq || 0

              if (maxSeq > 0) {
                db.run(
                  'INSERT OR IGNORE INTO order_sequence_counter (id) VALUES (?)',
                  [maxSeq],
                  (counterSyncErr) => {
                    if (counterSyncErr) {
                      console.error('Erro ao sincronizar contador de sequência:', counterSyncErr)
                      return
                    }

                    backfillMissingOrderSequenceNumbers()
                  }
                )
                return
              }

              backfillMissingOrderSequenceNumbers()
            }
          )
        }
      )
    }

    if (hasSequenceColumn) {
      continueWithBackfill()
      return
    }

    db.run('ALTER TABLE orders ADD COLUMN sequence_number INTEGER', (alterErr) => {
      if (alterErr) {
        console.error('Erro ao adicionar coluna sequence_number:', alterErr)
        return
      }
      continueWithBackfill()
    })
  })
}

function backfillMissingOrderSequenceNumbers() {
  db.all(
    'SELECT id FROM orders WHERE sequence_number IS NULL ORDER BY created_at ASC',
    (rowsErr, rows) => {
      if (rowsErr) {
        console.error('Erro ao buscar pedidos sem sequence_number:', rowsErr)
        return
      }

      if (!rows || rows.length === 0) {
        return
      }

      const assignNext = (index) => {
        if (index >= rows.length) {
          return
        }

        const orderId = rows[index].id

        db.run(
          'INSERT INTO order_sequence_counter DEFAULT VALUES',
          function (counterErr) {
            if (counterErr) {
              console.error('Erro ao gerar sequence_number no backfill:', counterErr)
              return
            }

            const nextSequence = this.lastID

            db.run(
              'UPDATE orders SET sequence_number = ? WHERE id = ?',
              [nextSequence, orderId],
              (updateErr) => {
                if (updateErr) {
                  console.error('Erro ao atualizar sequence_number no backfill:', updateErr)
                  return
                }

                assignNext(index + 1)
              }
            )
          }
        )
      }

      assignNext(0)
    }
  )
}

function ensureCustomerTokenColumn() {
  db.all('PRAGMA table_info(orders)', (err, columns) => {
    if (err) {
      console.error('Erro ao verificar customer_token em orders:', err)
      return
    }

    const hasCustomerTokenColumn = columns.some(
      (column) => column.name === 'customer_token'
    )

    const ensureIndex = () => {
      db.run(
        'CREATE INDEX IF NOT EXISTS idx_orders_customer_token ON orders(customer_token)',
        (indexErr) => {
          if (indexErr) {
            console.error('Erro ao criar índice de customer_token:', indexErr)
          }
        }
      )
    }

    if (hasCustomerTokenColumn) {
      ensureIndex()
      return
    }

    db.run('ALTER TABLE orders ADD COLUMN customer_token TEXT', (alterErr) => {
      if (alterErr) {
        console.error('Erro ao adicionar coluna customer_token:', alterErr)
        return
      }
      ensureIndex()
    })
  })
}

function seedDatabase() {
  // Verificar se já tem dados
  db.get(
    'SELECT COUNT(*) as count FROM menu_items',
    (err, row) => {
      if (err) {
        console.error('Erro ao verificar dados:', err)
        return
      }

      if (row.count === 0) {
        console.log('Inserindo dados iniciais...')

        const items = [
          // Cafés
          {
            id: '1',
            name: 'Espresso',
            description: 'Café expresso tradicional, intenso e aromático',
            price: 5.5,
            category: 'cafe',
            available: 1,
          },
          {
            id: '2',
            name: 'Cappuccino',
            description: 'Café com leite vaporizado e espuma cremosa',
            price: 8.5,
            category: 'cafe',
            available: 1,
          },
          {
            id: '3',
            name: 'Café Latte',
            description: 'Espresso com leite vaporizado e leve espuma',
            price: 9.0,
            category: 'cafe',
            available: 1,
          },
          {
            id: '4',
            name: 'Mocha',
            description: 'Cappuccino com chocolate e chantilly',
            price: 10.5,
            category: 'cafe',
            available: 1,
          },
          {
            id: '5',
            name: 'Café Americano',
            description: 'Espresso diluído em água quente',
            price: 6.5,
            category: 'cafe',
            available: 1,
          },
          // Bebidas
          {
            id: '6',
            name: 'Suco de Laranja',
            description: 'Suco natural de laranja fresco',
            price: 8.0,
            category: 'bebidas',
            available: 1,
          },
          {
            id: '7',
            name: 'Smoothie de Frutas Vermelhas',
            description: 'Mix de morango, framboesa e mirtilo',
            price: 12.0,
            category: 'bebidas',
            available: 1,
          },
          {
            id: '8',
            name: 'Chá Gelado',
            description: 'Chá preto gelado com limão',
            price: 7.0,
            category: 'bebidas',
            available: 1,
          },
          {
            id: '9',
            name: 'Chocolate Quente',
            description: 'Chocolate cremoso com chantilly',
            price: 9.5,
            category: 'bebidas',
            available: 1,
          },
          // Doces
          {
            id: '10',
            name: 'Bolo de Chocolate',
            description: 'Fatia de bolo de chocolate com cobertura',
            price: 8.5,
            category: 'doces',
            available: 1,
          },
          {
            id: '11',
            name: 'Cheesecake',
            description: 'Torta de queijo com calda de frutas vermelhas',
            price: 12.0,
            category: 'doces',
            available: 1,
          },
          {
            id: '12',
            name: 'Brownie',
            description: 'Brownie de chocolate com nozes',
            price: 7.5,
            category: 'doces',
            available: 1,
          },
          {
            id: '13',
            name: 'Torta de Limão',
            description: 'Torta de limão com merengue',
            price: 10.0,
            category: 'doces',
            available: 1,
          },
          {
            id: '14',
            name: 'Cookie',
            description: 'Cookie de chocolate com gotas',
            price: 5.0,
            category: 'doces',
            available: 1,
          },
          // Salgados
          {
            id: '15',
            name: 'Croissant',
            description: 'Croissant francês folhado e amanteigado',
            price: 7.0,
            category: 'salgados',
            available: 1,
          },
          {
            id: '16',
            name: 'Sanduíche Natural',
            description: 'Pão integral com peito de peru e salada',
            price: 12.5,
            category: 'salgados',
            available: 1,
          },
          {
            id: '17',
            name: 'Quiche',
            description: 'Quiche de queijo e espinafre',
            price: 10.0,
            category: 'salgados',
            available: 1,
          },
          {
            id: '18',
            name: 'Pão de Queijo',
            description: 'Tradicional pão de queijo mineiro',
            price: 4.5,
            category: 'salgados',
            available: 1,
          },
          {
            id: '19',
            name: 'Empada de Frango',
            description: 'Empada assada com recheio de frango',
            price: 6.5,
            category: 'salgados',
            available: 1,
          },
        ]

        items.forEach((item) => {
          db.run(
            `INSERT INTO menu_items (id, name, description, price, category, available)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              item.id,
              item.name,
              item.description,
              item.price,
              item.category,
              item.available,
            ],
            (err) => {
              if (err) console.error('Erro ao inserir item:', err)
            }
          )
        })

        console.log('✓ Dados iniciais inseridos')
      }
    }
  )
}

export default db
