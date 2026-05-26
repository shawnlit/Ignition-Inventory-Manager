import { useState } from 'react'
import { ChevronDown, ChevronUp, Save, X, Edit2 } from 'lucide-react'

const ItemRow = ({ item, role, onUpdateMetadata, onAdjustQuantity }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isAdjustingQty, setIsAdjustingQty] = useState(false)
  const [isEditingMetadata, setIsEditingMetadata] = useState(false)
  
  const [adjustmentAmount, setAdjustmentAmount] = useState(0)
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  const [metadataForm, setMetadataForm] = useState({
    name: item.name || '',
    category: item.category || '',
    description: item.description || '',
    numbered: !!item.numbered,
    status: item.status || '',
    location: item.location || '',
    green_cupboard: item.green_cupboard || '',
    unit_cost: item.unit_cost || 0,
    purchase_link: item.purchase_link || '',
    vendor_name: item.vendor_name || '',
    vendor_contact: item.vendor_contact || '',
    notes: item.notes || '',
    bill_link: item.bill_link || ''
  })

  const formatValue = (val) => (val === null || val === undefined || val === '') ? '-' : val

  const handleAdjust = async (e) => {
    e.stopPropagation()
    const amount = parseInt(adjustmentAmount) || 0
    if (amount === 0) {
      setIsAdjustingQty(false)
      return
    }
    setSaving(true)
    const { success, error } = await onAdjustQuantity(item.id, amount, reason)
    if (success) {
      setIsAdjustingQty(false)
      setAdjustmentAmount(0)
      setReason('')
    } else {
      alert(`Adjustment failed: ${error}`)
    }
    setSaving(false)
  }

  const handleSaveMetadata = async (e) => {
    e.stopPropagation()
    setSaving(true)

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

    const cost = parseFloat(metadataForm.unit_cost)
    if (isNaN(cost) || cost < 0) {
      alert("Unit cost must be a valid number >= 0.")
      setSaving(false)
      return
    }

    const pLink = sanitizeText(metadataForm.purchase_link)
    if (pLink && !isValidUrl(pLink)) {
      alert("Purchase link must be a valid URL.")
      setSaving(false)
      return
    }

    const bLink = sanitizeText(metadataForm.bill_link)
    if (bLink && !isValidUrl(bLink)) {
      alert("Bill link must be a valid URL.")
      setSaving(false)
      return
    }

    const sanitizedPayload = {
      name: sanitizeText(metadataForm.name),
      category: sanitizeText(metadataForm.category),
      description: sanitizeText(metadataForm.description),
      numbered: !!metadataForm.numbered,
      status: sanitizeText(metadataForm.status),
      location: sanitizeText(metadataForm.location),
      green_cupboard: sanitizeText(metadataForm.green_cupboard),
      unit_cost: cost,
      purchase_link: pLink,
      vendor_name: sanitizeText(metadataForm.vendor_name),
      vendor_contact: sanitizeText(metadataForm.vendor_contact),
      notes: sanitizeText(metadataForm.notes),
      bill_link: bLink
    }

    const { success, error } = await onUpdateMetadata(item.id, sanitizedPayload)
    if (success) {
      setIsEditingMetadata(false)
    } else {
      alert(`Update failed: ${error}`)
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
            <DetailItem label="NUMBERED" value={item.numbered ? 'YES' : 'NO'} />
            <DetailItem label="GREEN CUPBOARD" value={item.green_cupboard} />
            <DetailItem label="UNIT COST" value={item.unit_cost ? `$${item.unit_cost}` : null} />
            <DetailItem label="VENDOR NAME" value={item.vendor_name} />
            <DetailItem label="VENDOR CONTACT" value={item.vendor_contact} />
            <DetailItem label="PURCHASE LINK" value={item.purchase_link} />
            <DetailItem label="BILL LINK" value={item.bill_link} />
            <DetailItem label="DESCRIPTION" value={item.description} fullWidth />
            <DetailItem label="NOTES" value={item.notes} fullWidth />
          </div>

          {/* Admin Controls */}
          {role === 'admin' && (
            <div className="mt-4 pt-4 border-t border-black/10 flex flex-col gap-4">
              
              {/* Adjust Quantity Block */}
              {isAdjustingQty ? (
                <div className="flex items-center gap-4 w-full p-3 bg-black/5" onClick={e => e.stopPropagation()}>
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
                      onClick={(e) => { e.stopPropagation(); setIsAdjustingQty(false); setAdjustmentAmount(0); setReason(''); }}
                      className="btn-secondary py-1 px-3 text-xs flex items-center justify-center gap-1 min-w-[80px]"
                    >
                      <X size={12} /> CANCEL
                    </button>
                  </div>
                </div>
              ) : isEditingMetadata ? (
                /* Edit Metadata Block */
                <div className="flex flex-col gap-4 w-full p-4 bg-black/5" onClick={e => e.stopPropagation()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="NAME" value={metadataForm.name} onChange={v => setMetadataForm({...metadataForm, name: v})} />
                    <FormInput label="CATEGORY" value={metadataForm.category} onChange={v => setMetadataForm({...metadataForm, category: v})} />
                    <FormInput label="STATUS" value={metadataForm.status} onChange={v => setMetadataForm({...metadataForm, status: v})} />
                    <FormInput label="LOCATION" value={metadataForm.location} onChange={v => setMetadataForm({...metadataForm, location: v})} />
                    <FormInput label="GREEN CUPBOARD" value={metadataForm.green_cupboard} onChange={v => setMetadataForm({...metadataForm, green_cupboard: v})} />
                    <FormInput label="UNIT COST" type="number" value={metadataForm.unit_cost} onChange={v => setMetadataForm({...metadataForm, unit_cost: v})} />
                    <FormInput label="VENDOR NAME" value={metadataForm.vendor_name} onChange={v => setMetadataForm({...metadataForm, vendor_name: v})} />
                    <FormInput label="VENDOR CONTACT" value={metadataForm.vendor_contact} onChange={v => setMetadataForm({...metadataForm, vendor_contact: v})} />
                    <FormInput label="PURCHASE LINK" type="url" value={metadataForm.purchase_link} onChange={v => setMetadataForm({...metadataForm, purchase_link: v})} />
                    <FormInput label="BILL LINK" type="url" value={metadataForm.bill_link} onChange={v => setMetadataForm({...metadataForm, bill_link: v})} />
                    <div className="md:col-span-2">
                      <FormInput label="DESCRIPTION" value={metadataForm.description} onChange={v => setMetadataForm({...metadataForm, description: v})} />
                    </div>
                    <div className="md:col-span-2">
                      <FormInput label="NOTES" value={metadataForm.notes} onChange={v => setMetadataForm({...metadataForm, notes: v})} />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-[8px] opacity-40 uppercase">NUMBERED?</label>
                      <input type="checkbox" checked={metadataForm.numbered} onChange={e => setMetadataForm({...metadataForm, numbered: e.target.checked})} />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4 border-t border-black/10">
                    <button onClick={(e) => { e.stopPropagation(); setIsEditingMetadata(false); }} className="btn-secondary py-1 px-3 text-xs flex items-center justify-center gap-1 min-w-[80px]">
                      <X size={12} /> CANCEL
                    </button>
                    <button onClick={handleSaveMetadata} disabled={saving} className="btn-primary py-1 px-3 text-xs flex items-center justify-center gap-1 min-w-[80px]">
                      <Save size={12} /> {saving ? 'SAVING...' : 'SAVE'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setIsAdjustingQty(true); }}
                      className="text-[10px] font-bold tracking-widest flex items-center gap-1 px-2 py-1 border border-black hover:bg-black hover:text-white transition-all uppercase"
                    >
                      <Edit2 size={10} /> ADJUST QUANTITY
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setIsEditingMetadata(true); }}
                      className="text-[10px] font-bold tracking-widest flex items-center gap-1 px-2 py-1 border border-black hover:bg-black hover:text-white transition-all uppercase"
                    >
                      <Edit2 size={10} /> EDIT METADATA
                    </button>
                  </div>
                </div>
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

export default ItemRow
