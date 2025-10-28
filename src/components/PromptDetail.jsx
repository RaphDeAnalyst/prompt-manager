import { useState } from 'react';
import { Copy, CheckCircle, Edit2, Trash2, Zap, Wand2 } from 'lucide-react';
import { useToast } from '../hooks/useToast';

export default function PromptDetail({
  prompt,
  onEdit,
  onDelete,
  onCopy,
  onRun,
  onOptimize,
  isRunning,
  isOptimizing,
  canRunPrompt,
}) {
  const [copied, setCopied] = useState(false);
  const { showSuccess } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content).then(() => {
      showSuccess('Prompt copied to clipboard!');
      setCopied(true);
      onCopy();
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      showSuccess('Copy to clipboard is not supported in your browser');
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div>
      {/* Title */}
      <h1 style={{
        fontSize: '28px',
        fontWeight: '800',
        color: '#111827',
        margin: '0 0 12px 0',
        lineHeight: '1.2',
      }}>
        {prompt.title}
      </h1>

      {/* Meta Info */}
      <div style={{
        fontSize: '13px',
        color: '#6B7280',
        marginBottom: '32px',
        paddingBottom: '24px',
        borderBottom: '1px solid #E5E7EB',
      }}>
        Created: {formatDate(prompt.created_at)}
        {prompt.category && ` • Category: ${prompt.category}`}
      </div>

      {/* Content Section */}
      <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{
          fontSize: '12px',
          fontWeight: '600',
          color: '#6B7280',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '12px',
        }}>
          Content
        </div>
        <div style={{
          backgroundColor: '#F9FAFB',
          padding: '16px',
          borderRadius: '8px',
          fontFamily: '"Monaco", "Menlo", monospace',
          fontSize: '13px',
          lineHeight: '1.6',
          color: '#111827',
          border: '1px solid #E5E7EB',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          maxHeight: '300px',
          overflowY: 'auto',
        }}>
          {prompt.content}
        </div>
      </div>

      {/* Tags Section */}
      {prompt.tags && (
        <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#6B7280',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '12px',
          }}>
            Tags
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(typeof prompt.tags === 'string' ? prompt.tags.split(',').map(t => t.trim()) : prompt.tags).map((tag, i) => (
              <span
                key={i}
                style={{
                  background: '#EBF5FF',
                  color: '#1877F2',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  border: '1px solid #DBEAFE',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', paddingTop: '24px', borderTop: '1px solid #E5E7EB' }}>
        <button style={{
          padding: '10px 16px',
          background: '#1877F2',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
          onClick={handleCopy}
        >
          <Copy size={16} />
          Copy
        </button>

        {onRun && (
          <button style={{
            padding: '10px 16px',
            background: canRunPrompt ? '#1877F2' : '#D1D5DB',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: canRunPrompt && !isRunning ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
            onClick={onRun}
            disabled={!canRunPrompt || isRunning}
          >
            <Zap size={16} />
            {isRunning ? 'Running...' : 'Run'}
          </button>
        )}

        {onOptimize && (
          <button style={{
            padding: '10px 16px',
            background: '#F5F5F5',
            color: '#1877F2',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: canRunPrompt && !isOptimizing ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
            onClick={onOptimize}
            disabled={!canRunPrompt || isOptimizing}
          >
            <Wand2 size={16} />
            Optimize
          </button>
        )}

        <button style={{
          padding: '10px 16px',
          background: '#F5F5F5',
          color: '#374151',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s ease',
        }}
          onClick={onEdit}
          onMouseEnter={(e) => {
            e.target.style.background = '#ECECEC';
            e.target.style.borderColor = '#D1D5DB';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#F5F5F5';
            e.target.style.borderColor = '#E5E7EB';
          }}
        >
          <Edit2 size={16} />
          Edit
        </button>

        <button style={{
          padding: '10px 16px',
          background: '#FEF2F2',
          color: '#DC2626',
          border: '1px solid #FEE2E2',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s ease',
        }}
          onClick={onDelete}
          onMouseEnter={(e) => {
            e.target.style.background = '#FECACA';
            e.target.style.borderColor = '#FECACA';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#FEF2F2';
            e.target.style.borderColor = '#FEE2E2';
          }}
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>
    </div>
  );
}
