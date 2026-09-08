import { useRef, useState } from 'react';

const ChatInput = ({ onSubmit, disabled }) => {
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleSend = (e) => {
    e.preventDefault();
    if (!content.trim() && !selectedFile) return;

    onSubmit({ content: content.trim(), file: selectedFile });
    setContent('');
    setSelectedFile(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSend(e);
    }
  };

  return (
    <form className="chat-input-form" onSubmit={handleSend}>
      {selectedFile && (
        <div className="chat-input__file-preview">
          <span>📎 {selectedFile.name}</span>
          <button
            type="button"
            className="chat-input__remove-file"
            onClick={() => setSelectedFile(null)}
          >
            ✕
          </button>
        </div>
      )}

      <div className="chat-input__bar">
        <button
          type="button"
          className="chat-input__attach"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          title="Joindre une photo ou une vidéo"
        >
          📎
        </button>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*,video/*"
          hidden
          onChange={handleFileChange}
        />
        <textarea
          rows={1}
          placeholder="Écris ton message…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <button
          type="submit"
          className="btn btn--accent btn--sm"
          disabled={disabled || (!content.trim() && !selectedFile)}
        >
          Envoyer
        </button>
      </div>
    </form>
  );
};

export default ChatInput;