import './App.css'
import PostgreSQLShell from './components/PostgreSQLShell'
import Login from './components/Login'
import TableGroups from './components/TableGroup'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ScriptOrchestratorProvider } from './contexts/ScriptOrchestratorContext'
import { TableGroupProvider } from './contexts/TableGroupContext'

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
            <h1>Multigres Demo</h1>
            <button onClick={signOut} className="sign-out-btn">
              Sign Out
            </button>
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