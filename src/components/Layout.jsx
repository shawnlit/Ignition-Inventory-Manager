import logo from '../assets/ign_logo_wht.png'
import { useAuth } from '../hooks/useAuth'
import { LogOut, User as UserIcon, ShieldCheck } from 'lucide-react'

const Layout = ({ children, onBack, showBack }) => {
  const { logout, role, user } = useAuth()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-black text-white p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Ignition Logo" className="w-10" />
          <h1 className="text-lg font-bold tracking-widest hidden sm:block">IGNITION</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] tracking-widest opacity-60 uppercase">
              {role === 'admin' ? 'ADMIN ACCESS' : 'USER ACCESS'}
            </span>
            <span className="text-xs font-medium truncate max-w-[150px]">{user?.email}</span>
          </div>
          <button 
            onClick={logout}
            className="hover:opacity-70 transition-opacity"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        {showBack && (
          <button 
            onClick={onBack}
            className="text-xs mb-6 flex items-center gap-1 hover:underline uppercase tracking-tighter"
          >
            ← DEPARTMENTS
          </button>
        )}
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-black/5 mt-auto p-8 text-center">
        <p className="text-[10px] opacity-30 tracking-[0.2em] uppercase">
          © {new Date().getFullYear()} IGNITION ROCKETRY TEAM
        </p>
      </footer>
    </div>
  )
}

export default Layout
