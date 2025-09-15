import { useState, useRef, useEffect } from 'react'
import { useScriptOrchestrator } from '../contexts/ScriptOrchestratorContext'
import './PostgreSQLShell.css'

interface HistoryItem {
  type: 'command' | 'result' | 'info' | 'notice'
  content: string
}

const PostgreSQLShell = () => {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<HistoryItem[]>([
    { type: 'info', content: 'psql (17.6)' },
    { type: 'info', content: 'Type "help" for help.' },
    { type: 'info', content: '' }
  ])
  const MAX_HISTORY_LINES = 50 // Maximum number of history items to keep
  const [isSimulating, setIsSimulating] = useState(false)
  const [queryExecuted, setQueryExecuted] = useState(false)
  const [noticeDisplayed, setNoticeDisplayed] = useState(false)
  const shellRef = useRef<HTMLDivElement>(null)
  const shellContentRef = useRef<HTMLDivElement>(null)
  const simulationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const { currentRow, onRowComplete, isActive, isPaused, togglePause, skipToNext } = useScriptOrchestrator()

  useEffect(() => {
    if (shellContentRef.current) {
      // Smooth scroll to bottom when new content is added
      shellContentRef.current.scrollTo({
        top: shellContentRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [history])

  // Handle current row changes from orchestrator
  useEffect(() => {
    if (currentRow) {
      console.log('Current row:', currentRow)
      console.log('Has query and response:', !!(currentRow.query && currentRow.response))
      console.log('Has notice:', !!currentRow.notice)
      
      if (currentRow.query && currentRow.response) {
        simulateQuery(currentRow)
      } else if (currentRow.notice) {
        displayNotice(currentRow)
      }
    }
  }, [currentRow])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      clearTimeouts()
    }
  }, [])

  const clearTimeouts = () => {
    if (simulationTimeoutRef.current) {
      clearTimeout(simulationTimeoutRef.current)
      simulationTimeoutRef.current = null
    }
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current)
      typingIntervalRef.current = null
    }
  }

  const handleSkipToNext = () => {
    clearTimeouts()

    if (currentRow && isSimulating) {
      // If we haven't executed the query yet, complete the current display
      if (currentRow.query && currentRow.response && !queryExecuted) {
        // Complete typing and show the full result immediately
        setInput('')
        executeSimulatedQuery(currentRow)
        setQueryExecuted(true)

        // Start the completion delay timer so demo continues normally
        const completeAfterDelay = () => {
          if (isPaused) {
            // If paused, check again in 100ms
            simulationTimeoutRef.current = setTimeout(completeAfterDelay, 100)
            return
          }
          setIsSimulating(false)
          setQueryExecuted(false)
          setNoticeDisplayed(false)
          onRowComplete()
        }
        simulationTimeoutRef.current = setTimeout(completeAfterDelay, 5000)
        return
      } else if (currentRow.notice && !noticeDisplayed) {
        // If it's just a notice and hasn't been displayed yet
        const noticeItem = {
          type: 'notice' as const,
          content: `NOTICE: ${currentRow.notice}`
        }
        addToHistory([noticeItem])
        setNoticeDisplayed(true)

        // Start the completion delay timer so demo continues normally
        const completeAfterNotice = () => {
          if (isPaused) {
            // If paused, check again in 100ms
            simulationTimeoutRef.current = setTimeout(completeAfterNotice, 100)
            return
          }
          setIsSimulating(false)
          setNoticeDisplayed(false)
          onRowComplete()
        }
        simulationTimeoutRef.current = setTimeout(completeAfterNotice, 2000)
        return
      }

      // If query and notice are already displayed, then skip to next
      setIsSimulating(false)
      setQueryExecuted(false)
      setNoticeDisplayed(false)
      skipToNext()
    } else {
      // If not simulating, skip to next
      skipToNext()
    }
  }

  const simulateQuery = (row: any) => {
    if (isSimulating) return // Prevent multiple simultaneous simulations

    setIsSimulating(true)
    setQueryExecuted(false)
    setNoticeDisplayed(false)
    clearTimeouts()

    // Simulate typing the query
    simulateTyping(row.query, () => {
      // After typing is complete, execute the query
      const executeAfterTyping = () => {
        if (isPaused) {
          // If paused, check again in 100ms
          simulationTimeoutRef.current = setTimeout(executeAfterTyping, 100)
          return
        }

        executeSimulatedQuery(row)
        setQueryExecuted(true)

        // Wait 5 seconds then notify completion
        const completeAfterDelay = () => {
          if (isPaused) {
            // If paused, check again in 100ms
            simulationTimeoutRef.current = setTimeout(completeAfterDelay, 100)
            return
          }
          setIsSimulating(false)
          setQueryExecuted(false)
          setNoticeDisplayed(false)
          onRowComplete()
        }
        simulationTimeoutRef.current = setTimeout(completeAfterDelay, 5000)
      }
      simulationTimeoutRef.current = setTimeout(executeAfterTyping, 500)
    })
  }

  const displayNotice = (row: any) => {
    console.log('Displaying notice:', row.notice)
    const noticeItem = {
      type: 'notice' as const,
      content: `NOTICE: ${row.notice}`
    }

    console.log('Notice item:', noticeItem)
    addToHistory([noticeItem])
    setNoticeDisplayed(true)

    // Wait 2 seconds then notify completion
    const completeAfterNotice = () => {
      if (isPaused) {
        // If paused, check again in 100ms
        simulationTimeoutRef.current = setTimeout(completeAfterNotice, 100)
        return
      }
      setNoticeDisplayed(false)
      onRowComplete()
    }
    simulationTimeoutRef.current = setTimeout(completeAfterNotice, 2000)
  }

  const simulateTyping = (text: string, onComplete: () => void) => {
    let currentIndex = 0
    typingIntervalRef.current = setInterval(() => {
      // Check if paused, if so skip this interval
      if (isPaused) {
        return
      }

      if (currentIndex <= text.length) {
        setInput(text.substring(0, currentIndex))
        currentIndex++

        // Scroll to bottom after each character during typing simulation
        if (shellContentRef.current) {
          shellContentRef.current.scrollTo({
            top: shellContentRef.current.scrollHeight,
            behavior: 'smooth'
          })
        }
      } else {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current)
          typingIntervalRef.current = null
        }
        onComplete()
      }
    }, 17) // Typing speed (50ms / 3 ≈ 17ms)
  }

  const addToHistory = (items: HistoryItem[]) => {
    console.log('Adding to history:', items)
    setHistory(prevHistory => {
      const newHistory = [...prevHistory, ...items]
      console.log('New history:', newHistory)
      // Keep only the last MAX_HISTORY_LINES items
      return newHistory.slice(-MAX_HISTORY_LINES)
    })
  }

  const executeSimulatedQuery = (row: any) => {
    const newItems = [
      {
        type: 'command' as const,
        content: `postgres=# ${row.query}`
      },
      {
        type: 'result' as const,
        content: row.response || 'No response available'
      }
    ]

    // Add notice immediately after the result if it exists
    if (row.notice) {
      newItems.push({
        type: 'notice' as const,
        content: `NOTICE: ${row.notice}`
      })
      setNoticeDisplayed(true)
    }

    addToHistory(newItems)
    setInput('')
  }



  return (
    <div className="postgresql-shell" ref={shellRef}>
      <div className="shell-header">
        <div className="shell-title">Multigres PostgreSQL Shell</div>
        {isActive && (
          <div className="shell-controls">
            <button onClick={togglePause} className="pause-btn">
              {isPaused ? '▶' : '⏸'}
            </button>
            <button onClick={handleSkipToNext} className="next-btn">
              ⏭
            </button>
          </div>
        )}
      </div>
      <div className="shell-content" ref={shellContentRef}>
        {history.map((item, index) => (
          <div key={index} className={`shell-line ${item.type}`}>
            {item.content.split('\n').map((line, lineIndex) => (
              <div key={lineIndex}>{line || '\u00A0'}</div>
            ))}
          </div>
        ))}
        <div className="shell-input-form">
          <span className="prompt">postgres=# </span>
          <div className="shell-input-display">
            {input}
            {isSimulating && <span className="cursor">|</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostgreSQLShell