import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { supabase } from '../supabase.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const router = express.Router()

// Configurar multer para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads'))
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now()
    const ext = path.extname(file.originalname)
    cb(null, `image-${timestamp}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Tipo de arquivo não permitido'))
    }
  },
})

// GET: Obter todos os itens
router.get('/items', async (req, res) => {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  const items = (data || []).map((item) => ({
    ...item,
    available: Boolean(item.available),
    image: item.image_path ? `/uploads/${item.image_path}` : null,
  }))

  res.json(items)
})

// GET: Obter um item específico
router.get('/items/:id', async (req, res) => {
  const { data: row, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('id', req.params.id)
    .maybeSingle()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  if (!row) {
    return res.status(404).json({ error: 'Item não encontrado' })
  }

  res.json({
    ...row,
    available: Boolean(row.available),
    image: row.image_path ? `/uploads/${row.image_path}` : null,
  })
})

// POST: Criar novo item
router.post('/items', upload.single('image'), async (req, res) => {
  const { id, name, description, price, category, available } = req.body
  const imagePath = req.file ? req.file.filename : null

  if (!id || !name || !description || !price || !category) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando' })
  }

  const isAvailable =
    available === undefined || available === null
      ? true
      : available === '1' || available === 'true' || available === true

  const { error } = await supabase.from('menu_items').insert({
    id,
    name,
    description,
    price: Number(price),
    category,
    image_path: imagePath,
    available: isAvailable,
  })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(201).json({
    id,
    name,
    description,
    price: Number(price),
    category,
    image: imagePath ? `/uploads/${imagePath}` : null,
    available: Boolean(isAvailable),
  })
})

// PUT: Atualizar item (incluindo imagem)
router.put('/items/:id', upload.single('image'), async (req, res) => {
  const { name, description, price, category, available } = req.body
  const itemId = req.params.id

  const { data: currentItem, error: fetchError } = await supabase
    .from('menu_items')
    .select('*')
    .eq('id', itemId)
    .maybeSingle()

  if (fetchError) {
    return res.status(500).json({ error: fetchError.message })
  }

  if (!currentItem) {
    return res.status(404).json({ error: 'Item não encontrado' })
  }

  const imagePath = req.file ? req.file.filename : currentItem.image_path

  let availableValue = currentItem.available
  if (available !== undefined && available !== null) {
    availableValue = available === '1' || available === 'true' || available === true
  }

  const nextItem = {
    name: name || currentItem.name,
    description: description || currentItem.description,
    price: price ? Number(price) : currentItem.price,
    category: category || currentItem.category,
    image_path: imagePath,
    available: availableValue,
    updated_at: new Date().toISOString(),
  }

  const { error: updateError } = await supabase
    .from('menu_items')
    .update(nextItem)
    .eq('id', itemId)

  if (updateError) {
    return res.status(500).json({ error: updateError.message })
  }

  res.json({
    id: itemId,
    name: nextItem.name,
    description: nextItem.description,
    price: nextItem.price,
    category: nextItem.category,
    image: imagePath ? `/uploads/${imagePath}` : null,
    available: Boolean(nextItem.available),
  })
})

// DELETE: Excluir item
router.delete('/items/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', req.params.id)
    .select('id')

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  if (!data || data.length === 0) {
    return res.status(404).json({ error: 'Item não encontrado' })
  }

  res.json({ message: 'Item deletado com sucesso' })
})

export default router
