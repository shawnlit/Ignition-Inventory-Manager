import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import Auth from './components/Auth'
import Layout from './components/Layout'
import DepartmentGrid from './components/DepartmentGrid'
import InventoryList from './components/InventoryList'
import { Loader2 } from 'lucide-react'

function App() {
  const { user, role, loading } = useAuth()
  const [selectedDept, setSelectedDept] = useState(null)

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white gap-4">
        <Loader2 className="animate-spin opacity-20" size={48} />
        <span className="text-xs tracking-[0.3em] font-light uppercase">Initializing Ignition Core</span>
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  return (
    <Layout
      showBack={!!selectedDept}
      onBack={() => setSelectedDept(null)}
    >
      {!selectedDept ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-10">
            <h2 className="text-3xl font-black tracking-tighter uppercase mb-2">Select Sector</h2>
            <p className="text-xs tracking-[0.2em] opacity-40 uppercase">Accessing the departmental data vaults</p>
          </div>
          <DepartmentGrid onSelect={(dept) => setSelectedDept(dept)} />
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
          <InventoryList department={selectedDept} role={role} />
        </div>
      )}
    </Layout>
  )
}

export default App
