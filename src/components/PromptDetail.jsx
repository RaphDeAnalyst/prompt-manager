import { useState } from 'react';
import { Copy, CheckCircle, Edit2, Trash2 } from 'lucide-react';

export default function PromptDetail({ prompt, onEdit, onDelete, onCopy }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    onCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="prompt-view">
      <section className="section">
        <h1 className="prompt-title">{prompt.title}</h1>
        <div className="prompt-meta">
          <span>Created: {formatDate(prompt.createdAt)}</span>
          {prompt.category && <span> • Category: {prompt.category}</span>}
        </div>
      </section>

      <section className="section">
        <div className="section-title">Content</div>
        <div className="prompt-content">{prompt.content}</div>
      </section>

      {prompt.tags && (typeof prompt.tags === 'string' ? prompt.tags.trim() : prompt.tags).length > 0 && (
        <section className="section">
          <div className="section-title">Tags</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(typeof prompt.tags === 'string' ? prompt.tags.split(',').map(t => t.trim()) : prompt.tags).map((tag, i) => (
              <span
                key={i}
                style={{
                  background: 'var(--bg-dark)',
                  color: 'var(--success)',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="prompt-actions">
          <button className="btn btn-primary" onClick={handleCopy}>
            {copied ? (
              <>
                <CheckCircle size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                Copy to Clipboard
              </>
            )}
          </button>
          <button className="btn btn-secondary" onClick={onEdit}>
            <Edit2 size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
            Edit
          </button>
          <button className="btn btn-danger" onClick={onDelete}>
            <Trash2 size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
            Delete
          </button>
        </div>
      </section>
    </div>
  );
}
