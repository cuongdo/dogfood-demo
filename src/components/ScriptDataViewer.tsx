import { useState, useEffect } from 'react'
import { fetchAllScriptRows, ScriptRow } from '../lib/scriptData'
import './ScriptDataViewer.css'

const ScriptDataViewer = () => {
  const [scriptRows, setScriptRows] = useState<ScriptRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadScriptData()
  }, [])

  const loadScriptData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchAllScriptRows()
      setScriptRows(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="script-data-viewer">
        <div className="loading">Loading script data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="script-data-viewer">
        <div className="error">
          <p>Error: {error}</p>
          <button onClick={loadScriptData} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="script-data-viewer">
      <div className="header">
        <h3>Script Table Data ({scriptRows.length} rows)</h3>
        <button onClick={loadScriptData} className="refresh-btn">
          Refresh
        </button>
      </div>
      
      {scriptRows.length === 0 ? (
        <div className="no-data">No data found in script table</div>
      ) : (
        <div className="table-container">
          <table className="script-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Created At</th>
                <th>Type</th>
                <th>Author</th>
                <th>Query</th>
                <th>Response</th>
              </tr>
            </thead>
            <tbody>
              {scriptRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td className="created-at">{formatDateTime(row.created_at)}</td>
                  <td className={`type ${row.type}`}>
                    <span className="type-badge">{row.type}</span>
                  </td>
                  <td className="author">{row.author || '-'}</td>
                  <td className="query">
                    {row.query ? (
                      <pre className="code">{row.query}</pre>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="response">
                    {row.response ? (
                      <pre className="response-text">{row.response}</pre>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ScriptDataViewer