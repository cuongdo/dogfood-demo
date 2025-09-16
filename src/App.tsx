import './App.css'
import PostgreSQLShell from './components/PostgreSQLShell'
import Login from './components/Login'
import TableGroups from './components/TableGroup'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ScriptOrchestratorProvider } from './contexts/ScriptOrchestratorContext'
import { TableGroupProvider } from './contexts/TableGroupContext'
import logoHorizontal from './assets/logo-horizontal.png'
import { useState, useEffect, useRef } from 'react'

function AppContent() {
  const { user, loading, signOut } = useAuth()
  const [showScrollIndicator, setShowScrollIndicator] = useState(false)
  const tableGroupsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkTableGroupsVisibility = () => {
      if (!tableGroupsRef.current) return

      const rect = tableGroupsRef.current.getBoundingClientRect()
      // Consider it visible only if a significant portion (at least 100px) is visible
      const significantPortionVisible = rect.top < (window.innerHeight - 100) && rect.bottom > 100
      setShowScrollIndicator(!significantPortionVisible)
    }

    const handleScroll = () => {
      checkTableGroupsVisibility()
    }

    // Check on mount and window resize
    checkTableGroupsVisibility()
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', checkTableGroupsVisibility)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', checkTableGroupsVisibility)
    }
  }, [user]) // Re-run when user changes (login/logout)

  const scrollToTableGroups = () => {
    if (tableGroupsRef.current) {
      tableGroupsRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <TableGroupProvider>
      <ScriptOrchestratorProvider>
        <div className="app-container">
          <div className="app-header">
            <div className="header-left">
              <img src={logoHorizontal} alt="Multigres" className="header-logo" />
            </div>
            <button onClick={signOut} className="sign-out-btn">
              Sign Out
            </button>
          </div>
          <div className="demo-notice">
            This is a SIMULATED DEMO for my dogfooding project. It shows one possible future.
          </div>
          <div className="main-content">
            <PostgreSQLShell />
          </div>
          <div ref={tableGroupsRef}>
            <TableGroups />
          </div>
          {showScrollIndicator && (
            <div className="scroll-indicator" onClick={scrollToTableGroups}>
              <div className="scroll-arrows">
                <div className="arrow">↓</div>
                <div className="arrow">↓</div>
                <div className="arrow">↓</div>
              </div>
              <div className="scroll-text">View Table Groups</div>
            </div>
          )}
        </div>
      </ScriptOrchestratorProvider>
    </TableGroupProvider>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App