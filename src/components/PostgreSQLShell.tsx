import { useState, useRef, useEffect } from 'react'
import './PostgreSQLShell.css'

interface HistoryItem {
  type: 'command' | 'result' | 'info'
  content: string
}

const PostgreSQLShell = () => {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<HistoryItem[]>([
    { type: 'info', content: 'psql (15.3)' },
    { type: 'info', content: 'Type "help" for help.' },
    { type: 'info', content: '' }
  ])
  const inputRef = useRef<HTMLInputElement>(null)
  const shellRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (shellRef.current) {
      shellRef.current.scrollTop = shellRef.current.scrollHeight
    }
  }, [history])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const newHistory = [...history]
    newHistory.push({ type: 'command', content: `postgres=# ${input}` })

    const trimmedInput = input.trim().toLowerCase()
    
    if (trimmedInput === 'help') {
      newHistory.push({ 
        type: 'result', 
        content: `You are using psql, the command-line interface to PostgreSQL.
Type:  \\copyright for distribution terms
       \\h for help with SQL commands
       \\? for help with psql commands
       \\g or terminate with semicolon to execute query
       \\q to quit` 
      })
    } else if (trimmedInput === '\\q') {
      newHistory.push({ type: 'info', content: 'Connection closed.' })
    } else if (trimmedInput === '\\l' || trimmedInput === '\\list') {
      newHistory.push({ 
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
      })
    } else if (trimmedInput === '\\dt') {
      newHistory.push({ 
        type: 'result', 
        content: `         List of relations
 Schema | Name  | Type  |  Owner   
--------+-------+-------+----------
 public | users | table | postgres
(1 row)` 
      })
    } else if (trimmedInput.startsWith('select') || trimmedInput.includes('select')) {
      newHistory.push({ 
        type: 'result', 
        content: ` id |   name   |       email        
----+----------+--------------------
  1 | John Doe | john@example.com
  2 | Jane Doe | jane@example.com
(2 rows)` 
      })
    } else if (trimmedInput === '\\?') {
      newHistory.push({ 
        type: 'result', 
        content: `General
  \\copyright             show PostgreSQL usage and distribution terms
  \\g [FILE] or ;         execute query (and send results to file or |pipe)
  \\h [NAME]              help on syntax of SQL commands, * for all commands
  \\q                     quit psql

Informational
  \\l[+]   [PATTERN]      list databases
  \\dt[S+] [PATTERN]      list tables` 
      })
    } else {
      newHistory.push({ type: 'result', content: `ERROR:  syntax error at or near "${input}"` })
    }

    setHistory(newHistory)
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
      <div className="shell-content">
        {history.map((item, index) => (
          <div key={index} className={`shell-line ${item.type}`}>
            {item.content.split('\n').map((line, lineIndex) => (
              <div key={lineIndex}>{line || '\u00A0'}</div>
            ))}
          </div>
        ))}
        <form onSubmit={handleSubmit} className="shell-input-form">
          <span className="prompt">postgres=# </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="shell-input"
            autoFocus
          />
        </form>
      </div>
    </div>
  )
}

export default PostgreSQLShell