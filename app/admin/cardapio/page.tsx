'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useMenu } from '@/context/MenuContext'
import { useRouter } from 'next/navigation'
import { MenuItem } from '@/types'
import { cardapioAPI } from '@/lib/api'
import { ArrowLeft, Plus, Edit2, Trash2, Save, X, Search } from 'lucide-react'
import Link from 'next/link'

// Função para normalizar texto removendo acentos
const normalizeText = (text: string): string => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export default function AdminCardapioPage() {
  const { isAuthenticated, hasRole } = useAuth()
  const { menuItems, refreshMenuItems } = useMenu()
  const router = useRouter()
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!isAuthenticated || !hasRole('gerente')) {
      router.push('/login')
    }
  }, [isAuthenticated, hasRole, router])

  if (!isAuthenticated || !hasRole('gerente')) {
    return null
  }

  const handleSave = async (item: MenuItem, imageFile?: File) => {
    try {
      setIsSaving(true)
      if (isAddingNew) {
        await cardapioAPI.createItem(item, imageFile)
        setIsAddingNew(false)
      } else {
        await cardapioAPI.updateItem(item.id, item, imageFile)
        setEditingItem(null)
      }
      await refreshMenuItems()
    } catch (error) {
      console.error('Erro ao salvar item:', error)
      alert('Erro ao salvar item. Verifique se o backend está rodando.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return

    try {
      await cardapioAPI.deleteItem(id)
      await refreshMenuItems()
    } catch (error) {
      console.error('Erro ao deletar item:', error)
      alert('Erro ao deletar item.')
    }
  }

  const toggleAvailability = async (id: string) => {
    const item = menuItems.find((i) => i.id === id)
    if (item) {
      try {
        await cardapioAPI.updateItem(id, { available: !item.available })
        await refreshMenuItems()
      } catch (error) {
        console.error('Erro ao atualizar disponibilidade:', error)
      }
    }
  }

  const filteredItems = menuItems.filter((item) => {
    if (searchTerm === '') return true
    
    const normalizedSearch = normalizeText(searchTerm)
    const normalizedName = normalizeText(item.name)
    const normalizedDescription = normalizeText(item.description)
    
    return normalizedName.includes(normalizedSearch) ||
           normalizedDescription.includes(normalizedSearch)
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar ao Painel
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Gerenciar Cardápio</h1>
          <button
            onClick={() => {
              setIsAddingNew(true)
              setEditingItem({
                id: Date.now().toString(),
                name: '',
                description: '',
                price: 0,
                category: 'cafe',
                available: true,
              })
            }}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Novo Item
          </button>
        </div>

        {/* Edit/Add Form */}
        {editingItem && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-2 border-black">
            <h2 className="text-xl font-bold mb-4">
              {isAddingNew ? 'Adicionar Novo Item' : 'Editar Item'}
            </h2>
            <EditForm
              item={editingItem}
              onSave={handleSave}
              onCancel={() => {
                setEditingItem(null)
                setIsAddingNew(false)
              }}
              isSaving={isSaving}
            />
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
            />
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-lg shadow-sm border overflow-hidden ${
                !item.available ? 'opacity-60' : ''
              }`}
            >
              {/* Image */}
              {item.image && (
                <div className="h-32 w-full bg-gray-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {item.description}
                    </p>
                    <p className="text-xl font-bold">
                      R$ {item.price.toFixed(2)}
                    </p>
                    <span className="inline-block mt-2 px-2 py-1 bg-gray-100 rounded text-xs">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => toggleAvailability(item.id)}
                    className={`flex-1 px-3 py-2 rounded transition-colors text-sm ${
                      item.available
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {item.available ? 'Disponível' : 'Indisponível'}
                  </button>
                  <button
                    onClick={() => setEditingItem(item)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    aria-label="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 hover:bg-red-100 text-red-600 rounded transition-colors"
                    aria-label="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg">
            {searchTerm 
              ? `Nenhum item encontrado para "${searchTerm}".`
              : 'Nenhum item cadastrado.'}
          </div>
        )}
      </div>
    </div>
  )
}

interface EditFormProps {
  item: MenuItem
  onSave: (item: MenuItem, imageFile?: File) => void
  onCancel: () => void
  isSaving: boolean
}

interface Category {
  id: string
  name: string
  label: string
  emoji: string
  display_order: number
}

function EditForm({ item, onSave, onCancel, isSaving }: EditFormProps) {
  const [formData, setFormData] = useState(item)
  const [imagePreview, setImagePreview] = useState<string | null>(
    item.image || null
  )
  const [imageFile, setImageFile] = useState<File | undefined>()
  const [categories, setCategories] = useState<Category[]>([])

  // Buscar categorias da API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        const data = await response.json()
        // Filtrar a categoria "todos" pois ela não deve aparecer no formulário
        setCategories(data.filter((cat: Category) => cat.id !== 'todos'))
      } catch (error) {
        console.error('Erro ao buscar categorias:', error)
      }
    }
    fetchCategories()
  }, [])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImagePreview(null)
    setImageFile(undefined)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData, imageFile)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Nome</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Preço (R$)</label>
          <input
            type="number"
            required
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: parseFloat(e.target.value) })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Descrição</label>
        <textarea
          required
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
        />
      </div>

      {/* Image Upload Section */}
      <div>
        <label className="block text-sm font-medium mb-2">Imagem do Produto</label>
        <div className="space-y-3">
          {/* Image Preview */}
          {imagePreview && (
            <div className="relative w-32 h-32 border-2 border-gray-300 rounded-lg overflow-hidden">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* File Input */}
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-black file:text-white
                hover:file:bg-gray-800
                file:cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG ou GIF (máx. 5MB)
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Categoria</label>
        <select
          value={formData.category}
          onChange={(e) =>
            setFormData({
              ...formData,
              category: e.target.value as MenuItem['category'],
            })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.emoji} {category.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="available"
          checked={formData.available}
          onChange={(e) =>
            setFormData({ ...formData, available: e.target.checked })
          }
          className="w-4 h-4"
        />
        <label htmlFor="available" className="text-sm font-medium">
          Item disponível
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Salvando...' : 'Salvar'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" />
          Cancelar
        </button>
      </div>
    </form>
  )
}
