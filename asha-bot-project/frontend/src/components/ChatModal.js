import React, { useEffect, useState } from 'react';

const ChatModal = ({ isOpen, onClose, messages, userInput, setUserInput, onSendMessage }) => {
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      try {
        // Attempt to redirect to the public URL
        window.location.href = 'https://3a3dd7aefbf200b8c2.gradio.live';
      } catch (err) {
        setError('Failed to redirect to the chatbot. Please try again or use this link: https://4d3cd347e199a7d6d4.gradio.live');
      }
    }
  }, [isOpen]);

  if (error) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '300px',
        padding: '10px',
        background: 'white',
        border: '1px solid #ccc',
        borderRadius: '10px',
        boxShadow: '0 0 10px rgba(0,0,0,0.2)',
      }}>
        <div style={{ color: 'red' }}>{error}</div>
        <button onClick={onClose} style={{ marginTop: '10px', background: '#34495e', color: 'white', border: 'none', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer' }}>
          Close
        </button>
      </div>
    );
  }

  return null;
};

export default ChatModal;