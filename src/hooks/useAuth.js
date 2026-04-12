import { useState, useEffect, useRef } from 'react'
import { supabase } from '../libs/supabase'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const initialized = useRef(false)

  // Non-blocking function to sync profile and fetch role
  const syncProfileAndRole = async (user) => {
    if (!user) return
    try {
      // 1. Upsert profile (on conflict do nothing)
      await supabase.from('profiles').upsert({ id: user.id }, { onConflict: 'id' })

      // 2. Fetch role
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setRole(data?.role || 'user')
    } catch (err) {
      console.error('Role fetch error, defaulting to user:', err)
      setRole('user')
    }
  }

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    // Step 1: Initial Load (Fast Path)
    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession()
        if (initialSession) {
          setSession(initialSession)
          setUser(initialSession.user)
          // Step 2: Background Sync (Non-blocking)
          syncProfileAndRole(initialSession.user)
        }
      } catch (err) {
        console.error('Initial session check failed:', err)
      } finally {
        // Immediate exit from loading state once session is checked
        setLoading(false)
      }
    }

    initAuth()

    // Step 3: Listener (Updates/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setSession(session)
        setUser(session.user)

        // Run async separately (NOT inside callback)
        setTimeout(() => {
          syncProfileAndRole(session.user)
        }, 0)
      } else {
        setSession(null)
        setUser(null)
        setRole(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) return { error }

    //update state immediately
    if (data?.user) {
      setUser(data.user)
      setSession(data.session)

      // non-blocking role sync
      syncProfileAndRole(data.user)
    }

    return { error: null }
  }

  const signup = async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error }
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setRole(null)
    return { error }
  }

  return { user, session, role, loading, login, signup, logout }
}
