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
  const inputRef = useRef<HTMLInputElement>(null)
  const shellRef = useRef<HTMLDivElement>(null)
  const shellContentRef = useRef<HTMLDivElement>(null)
  const simulationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const { currentRow, onRowComplete, isActive } = useScriptOrchestrator()

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

  const simulateQuery = (row: any) => {
    if (isSimulating) return // Prevent multiple simultaneous simulations
    
    setIsSimulating(true)
    clearTimeouts()
    
    // Simulate typing the query
    simulateTyping(row.query, () => {
      // After typing is complete, execute the query
      simulationTimeoutRef.current = setTimeout(() => {
        executeSimulatedQuery(row)
        
        // Wait 2 seconds then notify completion
        simulationTimeoutRef.current = setTimeout(() => {
          setIsSimulating(false)
          onRowComplete()
        }, 2000)
      }, 500)
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
    
    // Wait 2 seconds then notify completion
    simulationTimeoutRef.current = setTimeout(() => {
      onRowComplete()
    }, 2000)
  }

  const simulateTyping = (text: string, onComplete: () => void) => {
    let currentIndex = 0
    typingIntervalRef.current = setInterval(() => {
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
    }
    
    addToHistory(newItems)
    setInput('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isSimulating) return

    const trimmedInput = input.trim().toLowerCase()
    const commandItem = { type: 'command' as const, content: `postgres=# ${input}` }
    let responseItem: HistoryItem
    
    if (trimmedInput === 'help') {
      responseItem = { 
        type: 'result', 
        content: `You are using psql, the command-line interface to PostgreSQL.
Type:  \\copyright for distribution terms
       \\h for help with SQL commands
       \\? for help with psql commands
       \\g or terminate with semicolon to execute query
       \\q to quit` 
      }
    } else if (trimmedInput === '\\q') {
      responseItem = { type: 'info', content: 'Connection closed.' }
    } else if (trimmedInput === '\\l' || trimmedInput === '\\list') {
      responseItem = { 
        type: 'result', 
        content: `                                  List of databases
   Name    |  Owner   | Encoding |   Collate   |    Ctype    |   Access privileges   
-----------+----------+----------+-------------+-------------+-----------------------
 postgres  | postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8 | 
 template0 | postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8 | =c/postgres          +
           |          |          |             |             | postgres=CTc/postgres
 template1 | postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8 | =c/postgres          +
           |          |          |             |             | postgres=CTc/postgres
(3 rows)` 
      }
    } else if (trimmedInput === '\\dt') {
      responseItem = { 
        type: 'result', 
        content: `         List of relations
 Schema | Name  | Type  |  Owner   
--------+-------+-------+----------
 public | users | table | postgres
 public | script | table | postgres
(2 rows)` 
      }
    } else if (trimmedInput.startsWith('select') || trimmedInput.includes('select')) {
      responseItem = { 
        type: 'result', 
        content: ` id |   name   |       email        
----+----------+--------------------
  1 | John Doe | john@example.com
  2 | Jane Doe | jane@example.com
(2 rows)` 
      }
    } else if (trimmedInput === '\\?') {
      responseItem = { 
        type: 'result', 
        content: `General
  \\copyright             show PostgreSQL usage and distribution terms
  \\g [FILE] or ;         execute query (and send results to file or |pipe)
  \\h [NAME]              help on syntax of SQL commands, * for all commands
  \\q                     quit psql

Informational
  \\l[+]   [PATTERN]      list databases
  \\dt[S+] [PATTERN]      list tables` 
      }
    } else {
      responseItem = { type: 'result', content: `ERROR:  syntax error at or near "${input}"` }
    }

    addToHistory([commandItem, responseItem])
    setInput('')
  }

  const handleShellClick = () => {
    inputRef.current?.focus()
  }

  return (
    <div className="postgresql-shell" ref={shellRef} onClick={handleShellClick}>
      <div className="shell-header">
        <div className="shell-title">Multigres PostgreSQL Shell</div>
        <div className="shell-controls">
          <span className="control minimize"></span>
          <span className="control maximize"></span>
          <span className="control close"></span>
        </div>
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
          {isSimulating ? (
            <div className="shell-input-display">
              {input}
              <span className="cursor">|</span>
            </div>
          ) : (
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSubmit(e as any)
                }
              }}
              className="shell-input"
              autoFocus
              disabled={isSimulating}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default PostgreSQLShell