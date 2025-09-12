import { useState, useEffect, useRef } from 'react'
import { useScriptOrchestrator } from '../contexts/ScriptOrchestratorContext'
import './ChatWindow.css'

interface ChatMessage {
  notice: string
  timestamp: string
}

const ChatWindow = () => {
  const [displayedMessages, setDisplayedMessages] = useState<ChatMessage[]>([])
  const messagesRef = useRef<HTMLDivElement>(null)
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const { currentRow, onRowComplete, isActive } = useScriptOrchestrator()

  // Handle current row changes from orchestrator
  useEffect(() => {
    if (currentRow && currentRow.notice) {
      displayNotice(currentRow)
    }
  }, [currentRow])

  const displayNotice = (row: any) => {
    const message: ChatMessage = {
      notice: row.notice,
      timestamp: row.created_at
    }
    
    setDisplayedMessages(prev => [...prev, message])
    
    // Wait 5 seconds then notify completion
    messageTimeoutRef.current = setTimeout(() => {
      onRowComplete()
    }, 5000)
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [displayedMessages])

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-title">Notices</div>
        <div className="chat-controls">
          <span className="control minimize"></span>
          <span className="control maximize"></span>
          <span className="control close"></span>
        </div>
      </div>
      <div className="chat-content">
        <div className="chat-messages" ref={messagesRef}>
          {displayedMessages.length === 0 ? (
            <div className="chat-message system">
              Waiting for notices...
            </div>
          ) : (
            displayedMessages.map((msg, index) => (
              <div key={index} className="chat-message user">
                <div className="message-content">
                  {msg.notice}
                </div>
                <div className="message-timestamp">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="chat-input-area">
          <input 
            type="text" 
            placeholder="Type a message..." 
            className="chat-input"
            disabled
          />
          <button className="chat-send-btn" disabled>Send</button>
        </div>
      </div>
    </div>
  )
}

export default ChatWindow