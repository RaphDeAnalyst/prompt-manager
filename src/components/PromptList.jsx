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
    <div style={{
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '24px',
        fontSize: '18px',
        fontWeight: '700',
        color: '#111827',
      }}>
        <FileText size={20} color="#1877F2" />
        Prompts
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search prompts..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '13px',
          boxSizing: 'border-box',
        }}
      />

      {/* Prompts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {filteredPrompts.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#9CA3AF', padding: '20px 0', fontSize: '13px' }}>
            No prompts found
          </div>
        ) : (
          filteredPrompts.map(prompt => (
            <div
              key={prompt.id}
              onClick={() => onSelectPrompt(prompt)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                backgroundColor: selectedId === prompt.id ? '#EBF5FF' : '#FFFFFF',
                borderLeft: '3px solid ' + (selectedId === prompt.id ? '#1877F2' : 'transparent'),
                border: selectedId === prompt.id ? '1px solid #1877F2' : '1px solid #E5E7EB',
                boxShadow: selectedId === prompt.id ? '0 1px 2px rgba(24, 119, 242, 0.1)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (selectedId !== prompt.id) {
                  e.currentTarget.style.backgroundColor = '#F9FAFB';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedId !== prompt.id) {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                }
              }}
            >
              <div style={{
                fontSize: '14px',
                fontWeight: '500',
                color: selectedId === prompt.id ? '#1877F2' : '#111827',
                marginBottom: '4px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {prompt.title || 'Untitled'}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#9CA3AF',
              }}>
                {formatDate(prompt.created_at)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
