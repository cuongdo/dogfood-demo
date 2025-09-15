import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { fetchAllScriptRows, ScriptRow } from '../lib/scriptData'
import { useTableGroup } from './TableGroupContext'

interface ScriptOrchestratorContextType {
  currentRow: ScriptRow | null
  currentRowIndex: number
  totalRows: number
  isActive: boolean
  onRowComplete: () => void
}

const ScriptOrchestratorContext = createContext<ScriptOrchestratorContextType | undefined>(undefined)

export function useScriptOrchestrator() {
  const context = useContext(ScriptOrchestratorContext)
  if (context === undefined) {
    throw new Error('useScriptOrchestrator must be used within a ScriptOrchestratorProvider')
  }
  return context
}

interface ScriptOrchestratorProviderProps {
  children: ReactNode
}

export function ScriptOrchestratorProvider({ children }: ScriptOrchestratorProviderProps) {
  const [allRows, setAllRows] = useState<ScriptRow[]>([])
  const [currentRowIndex, setCurrentRowIndex] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const { processAddedItems } = useTableGroup()

  // Load all script rows on mount
  useEffect(() => {
    const loadScriptData = async () => {
      try {
        const data = await fetchAllScriptRows()
        console.log('Loaded script data:', data)
        setAllRows(data)
        if (data.length > 0) {
          setIsActive(true)
        }
      } catch (error) {
        console.error('Failed to load script data:', error)
      }
    }
    
    loadScriptData()
  }, [])

  const onRowComplete = () => {
    // Process added items from the current row
    const currentRow = allRows[currentRowIndex]
    if (currentRow?.added) {
      processAddedItems(currentRow.added)
    }

    const nextIndex = currentRowIndex + 1
    if (nextIndex < allRows.length) {
      setCurrentRowIndex(nextIndex)
    } else {
      setIsActive(false)
    }
  }

  const currentRow = isActive && currentRowIndex < allRows.length ? allRows[currentRowIndex] : null

  const value = {
    currentRow,
    currentRowIndex,
    totalRows: allRows.length,
    isActive,
    onRowComplete,
  }

  return (
    <ScriptOrchestratorContext.Provider value={value}>
      {children}
    </ScriptOrchestratorContext.Provider>
  )
}