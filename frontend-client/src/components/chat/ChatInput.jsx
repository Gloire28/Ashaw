import { useRef, useState } from 'react';

const ChatInput = ({ onSubmit, disabled }) => {
  const [content, setContent] = useState('');
  const fileInputRef = useRef(null);

  const handleSend = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit({ content: content.trim() });
    setContent('');
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onSubmit({ file });
    }
    e.target.value = '';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSend(e);
    }
  };

  return (
    <form className="chat-input" onSubmit={handleSend}>
      <button
        type="button"
        className="chat-input__attach"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        aria-label="Joindre une photo ou une vidéo"
      >
        📎
      </button>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,video/*"
        hidden
        onChange={handleFile}
      />
      <textarea
        rows={1}
        placeholder="Écris ton message…"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <button type="submit" className="btn btn--primary btn--sm" disabled={disabled || !content.trim()}>
        Envoyer
      </button>
    </form>
  );
};

export default ChatInput;
