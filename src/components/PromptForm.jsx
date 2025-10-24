import { useState } from 'react';

export default function PromptForm({ initialPrompt, onSave, onCancel }) {
  const [title, setTitle] = useState(initialPrompt?.title || '');
  const [content, setContent] = useState(initialPrompt?.content || '');
  const [category, setCategory] = useState(initialPrompt?.category || 'General');
  const [tags, setTags] = useState(initialPrompt?.tags?.join(', ') || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Please fill in title and content');
      return;
    }
    onSave({
      title: title.trim(),
      content: content.trim(),
      category: category.trim(),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean)
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2 className="modal-header">
          {initialPrompt?.id ? 'Edit Prompt' : 'Create New Prompt'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Writing Assistant"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <input
              type="text"
              className="form-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Writing, Coding, Analysis"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tags</label>
            <input
              type="text"
              className="form-input"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Comma-separated tags (optional)"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Prompt Content</label>
            <textarea
              className="form-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your prompt here..."
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {initialPrompt?.id ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
