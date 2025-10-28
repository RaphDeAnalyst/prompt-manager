import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useToast } from '../hooks/useToast';

export default function EditPromptModal({ isOpen, prompt, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (prompt) {
      setTitle(prompt.title || '');
      setContent(prompt.content || '');
      setCategory(prompt.category || '');
      setTags(prompt.tags ? (typeof prompt.tags === 'string' ? prompt.tags : prompt.tags.join(', ')) : '');
    }
  }, [prompt, isOpen]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      showError('Title and content are required');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/prompts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: prompt.id,
          title: title.trim(),
          content: content.trim(),
          category: category.trim(),
          tags: tags
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t),
        }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('Prompt updated successfully!');
        onSave(data.prompt);
        onClose();
      } else {
        showError(`Error: ${data.error || 'Failed to update prompt'}`);
      }
    } catch (error) {
      showError(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '32px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <h2
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#111827',
              margin: 0,
            }}
          >
            Edit Prompt
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#6B7280',
              padding: '8px',
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Title */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '8px',
              }}
            >
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter prompt title"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Content */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '8px',
              }}
            >
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter prompt content"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                minHeight: '150px',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Category */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '8px',
              }}
            >
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Content, Development, Marketing"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Tags */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '8px',
              }}
            >
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., seo, writing, marketing"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Buttons */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              marginTop: '24px',
            }}
          >
            <button
              onClick={onClose}
              disabled={isLoading}
              style={{
                padding: '10px 24px',
                background: '#F5F5F5',
                color: '#374151',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) e.target.style.background = '#ECECEC';
              }}
              onMouseLeave={(e) => {
                if (!isLoading) e.target.style.background = '#F5F5F5';
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              style={{
                padding: '10px 24px',
                background: '#1877F2',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) e.target.style.background = '#166FE5';
              }}
              onMouseLeave={(e) => {
                if (!isLoading) e.target.style.background = '#1877F2';
              }}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
