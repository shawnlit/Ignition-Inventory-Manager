import { useEffect } from 'react'
import { useInventory } from '../hooks/useInventory'
import ItemRow from './ItemRow'
import { Search, Loader2, AlertCircle } from 'lucide-react'

const InventoryList = ({ department, role }) => {
  const { 
    items, 
    loading, 
    error, 
    searchTerm, 
    setSearchTerm, 
    fetchItems, 
    updateItem 
  } = useInventory(department)

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-black tracking-tighter uppercase">{department}</h2>
        <p className="text-[10px] opacity-40 tracking-widest uppercase">Inventory Catalogue</p>
      </div>

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
                onUpdate={updateItem} 
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
