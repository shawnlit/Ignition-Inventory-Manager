import { useState, useCallback, useMemo } from 'react'
import { supabase } from '../libs/supabase'

export const useInventory = (department) => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchItems = useCallback(async () => {
    if (!department) return
    
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        .from('items')
        .select(`
          id, item_no, name, quantity, category, 
          description, numbered, status, location, green_cupboard
        `)
        .eq('department', department)
        .limit(100)

      if (error) throw error
      setItems(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [department])

  const updateItem = async (itemId, updates) => {
    try {
      const { error } = await supabase
        .from('items')
        .update(updates)
        .eq('id', itemId)

      if (error) throw error
      
      // Update local state
      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      ))
      return { success: true }
    } catch (err) {
      console.error('Update error:', err)
      return { success: false, error: err.message }
    }
  }

  // Client-side filtering
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items
    
    const term = searchTerm.toLowerCase()
    return items.filter(item => 
      item.name?.toLowerCase().includes(term) ||
      item.item_no?.toLowerCase().includes(term) ||
      item.category?.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term)
    )
  }, [items, searchTerm])

  return { 
    items: filteredItems, 
    loading, 
    error, 
    searchTerm, 
    setSearchTerm, 
    fetchItems, 
    updateItem 
  }
}
