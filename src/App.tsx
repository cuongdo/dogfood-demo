import './App.css'
import PostgreSQLShell from './components/PostgreSQLShell'
import Login from './components/Login'
import TableGroups from './components/TableGroup'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ScriptOrchestratorProvider } from './contexts/ScriptOrchestratorContext'
import { TableGroupProvider } from './contexts/TableGroupContext'
import logoHorizontal from './assets/logo-horizontal.png'

function AppContent() {
  const { user, loading, signOut } = useAuth()

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
            This is a SIMULATED DEMO for my dogfooding project. It's shows one possible future.
          </div>
          <div className="main-content">
            <PostgreSQLShell />
          </div>
          <TableGroups />
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