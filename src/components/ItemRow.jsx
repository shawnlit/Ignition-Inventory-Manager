import { useState } from 'react'
import { ChevronDown, ChevronUp, Save, X, Edit2 } from 'lucide-react'

const ItemRow = ({ item, role, onUpdate, onAdjustQuantity }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [adjustmentAmount, setAdjustmentAmount] = useState(0)
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  const formatValue = (val) => (val === null || val === undefined || val === '') ? '-' : val

  const handleAdjust = async (e) => {
    e.stopPropagation()
    const amount = parseInt(adjustmentAmount) || 0
    if (amount === 0) {
      setIsEditing(false)
      return
    }
    setSaving(true)
    const { success, error } = await onAdjustQuantity(item.id, amount, reason)
    if (success) {
      setIsEditing(false)
      setAdjustmentAmount(0)
      setReason('')
    } else {
      alert(`Adjustment failed: ${error}`)
    }
    setSaving(false)
  }

  return (
    <div className="border border-black/10 transition-all duration-200 bg-white mb-2 overflow-hidden hover:border-black/30">
      {/* Collapsed View */}
      <div 
        className="p-4 flex items-center justify-between cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-6 flex-1">
          <span className="text-[10px] font-mono opacity-40 min-w-[60px]">{formatValue(item.item_no)}</span>
          <span className="font-bold tracking-tight uppercase truncate">{formatValue(item.name)}</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[8px] opacity-40 uppercase tracking-tighter">QTY</span>
            <span className="font-mono font-bold text-lg">{item.current_quantity}</span>
          </div>
          {isExpanded ? <ChevronUp size={16} className="opacity-40" /> : <ChevronDown size={16} className="opacity-40 group-hover:opacity-100" />}
        </div>
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className="p-4 pt-0 border-t border-black/5 bg-zinc-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 py-4">
            <DetailItem label="CATEGORY" value={item.category} />
            <DetailItem label="LOCATION" value={item.location} />
            <DetailItem label="STATUS" value={item.status} />
            <DetailItem label="NUMBERED" value={item.numbered} />
            <DetailItem label="DESCRIPTION" value={item.description} fullWidth />
            <DetailItem label="GREEN CUPBOARD" value={item.green_cupboard} />
          </div>

          {/* Admin Controls */}
          {role === 'admin' && (
            <div className="mt-4 pt-4 border-t border-black/10 flex items-center justify-between">
              {isEditing ? (
                <div className="flex items-center gap-4 w-full" onClick={e => e.stopPropagation()}>
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-2">
                      <label className="text-[8px] opacity-40 uppercase min-w-[80px]">ADJUSTMENT</label>
                      <input 
                        type="number"
                        value={adjustmentAmount}
                        onChange={e => setAdjustmentAmount(e.target.value)}
                        placeholder="+/- 0"
                        className="input-field w-24 h-9 font-mono"
                        autoFocus
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-[8px] opacity-40 uppercase min-w-[80px]">REASON</label>
                      <input 
                        type="text"
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        placeholder="Optional reason..."
                        className="input-field flex-1 h-9 text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-auto">
                    <button 
                      onClick={handleAdjust} 
                      disabled={saving}
                      className="btn-primary py-1 px-3 text-xs flex items-center justify-center gap-1 min-w-[80px]"
                    >
                      <Save size={12} /> {saving ? 'SAVING...' : 'SAVE'}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setIsEditing(false); setAdjustmentAmount(0); setReason(''); }}
                      className="btn-secondary py-1 px-3 text-xs flex items-center justify-center gap-1 min-w-[80px]"
                    >
                      <X size={12} /> CANCEL
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                  className="text-[10px] font-bold tracking-widest flex items-center gap-1 px-2 py-1 border border-black hover:bg-black hover:text-white transition-all uppercase"
                >
                  <Edit2 size={10} /> EDIT ITEM
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const DetailItem = ({ label, value, fullWidth = false }) => (
  <div className={`flex flex-col ${fullWidth ? 'md:col-span-2' : ''}`}>
    <span className="text-[8px] opacity-40 uppercase tracking-widest mb-1">{label}</span>
    <span className="text-xs font-medium uppercase break-words border-l border-black/5 pl-2">
      {(value === null || value === undefined || value === '') ? '-' : value}
    </span>
  </div>
)

export default ItemRow
