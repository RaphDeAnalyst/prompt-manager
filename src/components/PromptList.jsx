import { FileText } from 'lucide-react';

export default function PromptList({ prompts, selectedId, onSelectPrompt, onNewPrompt, searchTerm, onSearchChange }) {
  const filteredPrompts = prompts.filter(prompt =>
    prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prompt.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <FileText size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
        Prompts
      </div>
      <button className="new-prompt-btn" onClick={onNewPrompt}>
        + New Prompt
      </button>
      <input
        type="text"
        placeholder="Search prompts..."
        className="search-box"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <ul className="prompts-list">
        {filteredPrompts.length === 0 ? (
          <li style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px 0' }}>
            No prompts found
          </li>
        ) : (
          filteredPrompts.map(prompt => (
            <li
              key={prompt.id}
              className={`prompt-item ${selectedId === prompt.id ? 'active' : ''}`}
              onClick={() => onSelectPrompt(prompt.id)}
            >
              <div className="prompt-item-title">{prompt.title || 'Untitled'}</div>
              <div className="prompt-item-time">{formatDate(prompt.createdAt)}</div>
            </li>
          ))
        )}
      </ul>
    </aside>
  );
}
