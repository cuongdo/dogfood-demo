import './App.css'
import PostgreSQLShell from './components/PostgreSQLShell'
import ChatWindow from './components/ChatWindow'
import Login from './components/Login'
import { AuthProvider, useAuth } from './contexts/AuthContext'

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
    <div className="app-container">
      <div className="app-header">
        <h1>Multigres Demo</h1>
        <button onClick={signOut} className="sign-out-btn">
          Sign Out
        </button>
      </div>
      <div className="main-content">
        <PostgreSQLShell />
        <ChatWindow />
      </div>
    </div>
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