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
          id, item_no, name, current_quantity, category, 
          description, numbered, status, location, green_cupboard,
          unit_cost, purchase_link, vendor_name, vendor_contact, notes, bill_link
        `)
        .eq('department', department)
        .eq('deleted', false)
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

  const updateMetadata = async (itemId, sanitizedForm) => {
    try {
      const { error } = await supabase.rpc('update_item_metadata', {
        p_item_id: itemId,
        p_name: sanitizedForm.name,
        p_category: sanitizedForm.category,
        p_description: sanitizedForm.description,
        p_numbered: sanitizedForm.numbered,
        p_status: sanitizedForm.status,
        p_location: sanitizedForm.location,
        p_green_cupboard: sanitizedForm.green_cupboard,
        p_unit_cost: sanitizedForm.unit_cost,
        p_purchase_link: sanitizedForm.purchase_link,
        p_vendor_name: sanitizedForm.vendor_name,
        p_vendor_contact: sanitizedForm.vendor_contact,
        p_notes: sanitizedForm.notes,
        p_bill_link: sanitizedForm.bill_link
      })

      if (error) throw error
      
      // Update local state directly
      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, ...sanitizedForm } : item
      ))
      return { success: true }
    } catch (err) {
      console.error('Update metadata error:', err)
      return { success: false, error: err.message }
    }
  }

  const adjustQuantity = async (itemId, changeAmount, reason = '') => {
    try {
      const { error } = await supabase.rpc('adjust_inventory', {
        p_item_id: itemId,
        p_change: changeAmount,
        p_reason: reason
      })

      if (error) throw error

      // Update local state by adjusting current_quantity
      setItems(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, current_quantity: (item.current_quantity || 0) + changeAmount } 
          : item
      ))
      return { success: true }
    } catch (err) {
      console.error('Adjustment error:', err)
      return { success: false, error: err.message }
    }
  }

  const createItem = async (payload) => {
    try {
      const { data, error } = await supabase.rpc('create_item', payload)
      if (error) throw error
      
      if (data) {
        setItems(prev => [...prev, data])
      }
      return { success: true, data }
    } catch (err) {
      console.error('Create item error:', err)
      return { success: false, error: err.message }
    }
  }

  const archiveItem = async (itemId) => {
    try {
      const { error } = await supabase.rpc('archive_item', { p_item_id: itemId })
      if (error) throw error
      
      // Update local state by removing the item
      setItems(prev => prev.filter(item => item.id !== itemId))
      return { success: true }
    } catch (err) {
      console.error('Archive item error:', err)
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
    updateMetadata,
    adjustQuantity,
    createItem,
    archiveItem
  }
}
