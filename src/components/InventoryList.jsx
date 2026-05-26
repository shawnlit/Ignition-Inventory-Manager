import { useEffect, useState } from 'react'
import { useInventory } from '../hooks/useInventory'
import ItemRow from './ItemRow'
import { Search, Loader2, AlertCircle, Plus, Save, X } from 'lucide-react'

const FormInput = ({ label, value, onChange, type = "text" }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[8px] opacity-40 uppercase">{label}</label>
    <input 
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="input-field h-9 text-xs"
    />
  </div>
)

const InventoryList = ({ department, role }) => {
  const { 
    items, 
    loading, 
    error, 
    searchTerm, 
    setSearchTerm, 
    fetchItems, 
    updateMetadata,
    adjustQuantity,
    createItem
  } = useInventory(department)

  const [isAddingItem, setIsAddingItem] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const initialFormState = {
    name: '',
    initial_quantity: 0,
    category: '',
    description: '',
    numbered: false,
    status: '',
    location: '',
    green_cupboard: '',
    unit_cost: 0,
    purchase_link: '',
    vendor_name: '',
    vendor_contact: '',
    notes: '',
    bill_link: ''
  }
  const [newItemForm, setNewItemForm] = useState(initialFormState)

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const handleCreateItem = async (e) => {
    e.preventDefault()
    
    // Validation & Sanitization
    const sanitizeText = (val) => {
      if (typeof val === 'string') {
        const trimmed = val.trim()
        return trimmed === '' ? null : trimmed
      }
      return val === '' ? null : val
    }

    const isValidUrl = (url) => {
      if (!url) return true
      try {
        new URL(url)
        return true
      } catch (err) {
        return false
      }
    }

    const nameStr = newItemForm.name?.trim() || ''
    if (!nameStr) {
      alert("Name is required.")
      return
    }

    const initQty = parseInt(newItemForm.initial_quantity)
    if (isNaN(initQty) || initQty < 0) {
      alert("Initial quantity must be a valid number >= 0.")
      return
    }

    const cost = parseFloat(newItemForm.unit_cost)
    if (isNaN(cost) || cost < 0) {
      alert("Unit cost must be a valid number >= 0.")
      return
    }

    const pLink = sanitizeText(newItemForm.purchase_link)
    if (pLink && !isValidUrl(pLink)) {
      alert("Purchase link must be a valid URL.")
      return
    }

    const bLink = sanitizeText(newItemForm.bill_link)
    if (bLink && !isValidUrl(bLink)) {
      alert("Bill link must be a valid URL.")
      return
    }

    setSaving(true)

    const payload = {
      p_department: department,
      p_name: nameStr,
      p_category: sanitizeText(newItemForm.category),
      p_description: sanitizeText(newItemForm.description),
      p_numbered: !!newItemForm.numbered,
      p_initial_quantity: initQty,
      p_status: sanitizeText(newItemForm.status),
      p_location: sanitizeText(newItemForm.location),
      p_green_cupboard: sanitizeText(newItemForm.green_cupboard),
      p_unit_cost: cost,
      p_purchase_link: pLink,
      p_vendor_name: sanitizeText(newItemForm.vendor_name),
      p_vendor_contact: sanitizeText(newItemForm.vendor_contact),
      p_notes: sanitizeText(newItemForm.notes),
      p_bill_link: bLink
    }

    const { success, error } = await createItem(payload)
    if (success) {
      setIsAddingItem(false)
      setNewItemForm(initialFormState)
    } else {
      alert(`Creation failed: ${error}`)
    }
    setSaving(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-black tracking-tighter uppercase">{department}</h2>
          <p className="text-[10px] opacity-40 tracking-widest uppercase">Inventory Catalogue</p>
        </div>
        {role === 'admin' && (
          <button 
            onClick={() => setIsAddingItem(!isAddingItem)}
            className="btn-primary py-2 px-4 text-xs flex items-center gap-2 uppercase tracking-widest"
          >
            {isAddingItem ? <X size={14} /> : <Plus size={14} />} 
            {isAddingItem ? 'CANCEL' : 'ADD ITEM'}
          </button>
        )}
      </div>

      {isAddingItem && (
        <div className="border border-black/10 bg-white p-6 mb-4">
          <h3 className="text-sm font-bold tracking-widest uppercase mb-6 border-b border-black/10 pb-2">CREATE NEW ITEM</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="NAME (REQUIRED)" value={newItemForm.name} onChange={v => setNewItemForm({...newItemForm, name: v})} />
            <FormInput label="INITIAL QUANTITY (REQUIRED)" type="number" value={newItemForm.initial_quantity} onChange={v => setNewItemForm({...newItemForm, initial_quantity: v})} />
            <FormInput label="CATEGORY" value={newItemForm.category} onChange={v => setNewItemForm({...newItemForm, category: v})} />
            <FormInput label="STATUS" value={newItemForm.status} onChange={v => setNewItemForm({...newItemForm, status: v})} />
            <FormInput label="LOCATION" value={newItemForm.location} onChange={v => setNewItemForm({...newItemForm, location: v})} />
            <FormInput label="GREEN CUPBOARD" value={newItemForm.green_cupboard} onChange={v => setNewItemForm({...newItemForm, green_cupboard: v})} />
            <FormInput label="UNIT COST" type="number" value={newItemForm.unit_cost} onChange={v => setNewItemForm({...newItemForm, unit_cost: v})} />
            <FormInput label="VENDOR NAME" value={newItemForm.vendor_name} onChange={v => setNewItemForm({...newItemForm, vendor_name: v})} />
            <FormInput label="VENDOR CONTACT" value={newItemForm.vendor_contact} onChange={v => setNewItemForm({...newItemForm, vendor_contact: v})} />
            <FormInput label="PURCHASE LINK" type="url" value={newItemForm.purchase_link} onChange={v => setNewItemForm({...newItemForm, purchase_link: v})} />
            <FormInput label="BILL LINK" type="url" value={newItemForm.bill_link} onChange={v => setNewItemForm({...newItemForm, bill_link: v})} />
            <div className="md:col-span-2">
              <FormInput label="DESCRIPTION" value={newItemForm.description} onChange={v => setNewItemForm({...newItemForm, description: v})} />
            </div>
            <div className="md:col-span-2">
              <FormInput label="NOTES" value={newItemForm.notes} onChange={v => setNewItemForm({...newItemForm, notes: v})} />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <label className="text-[8px] opacity-40 uppercase">NUMBERED?</label>
              <input type="checkbox" checked={newItemForm.numbered} onChange={e => setNewItemForm({...newItemForm, numbered: e.target.checked})} />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-black/10">
            <button 
              onClick={() => setIsAddingItem(false)} 
              className="btn-secondary py-2 px-6 text-xs flex items-center justify-center gap-2"
            >
              CANCEL
            </button>
            <button 
              onClick={handleCreateItem} 
              disabled={saving} 
              className="btn-primary py-2 px-6 text-xs flex items-center justify-center gap-2"
            >
              <Save size={14} /> {saving ? 'SAVING...' : 'CREATE ITEM'}
            </button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity" size={18} />
        <input 
          type="text"
          placeholder="SEARCH BY NAME, CATEGORY, OR ITEM NO..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field w-full pl-10 h-12 text-sm tracking-widest placeholder:opacity-30"
        />
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin opacity-20" size={32} />
          <span className="text-[10px] tracking-[0.2em] opacity-40 uppercase">Fetching Secure Data...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 flex gap-3 text-red-800">
          <AlertCircle size={20} />
          <p className="text-sm font-medium uppercase tracking-tight">{error}</p>
        </div>
      )}

      {/* Item List */}
      {!loading && !error && (
        <div className="flex flex-col">
          {items.length > 0 ? (
            items.map(item => (
              <ItemRow 
                key={item.id} 
                item={item} 
                role={role} 
                onUpdateMetadata={updateMetadata} 
                onAdjustQuantity={adjustQuantity}
              />
            ))
          ) : (
            <div className="border-2 border-dashed border-black/5 p-20 text-center">
              <span className="text-[10px] tracking-[0.2em] opacity-30 uppercase">No Items Found in this Registry</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default InventoryList
