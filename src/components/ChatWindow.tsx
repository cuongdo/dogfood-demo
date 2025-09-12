import './ChatWindow.css'

const ChatWindow = () => {
  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-title">Chat</div>
        <div className="chat-controls">
          <span className="control minimize"></span>
          <span className="control maximize"></span>
          <span className="control close"></span>
        </div>
      </div>
      <div className="chat-content">
        <div className="chat-messages">
          <div className="chat-message system">
            Welcome to the chat room!
          </div>
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