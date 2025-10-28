import React, { useState } from 'react';
import { X } from 'lucide-react';

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    backdropFilter: 'blur(2px)',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    maxWidth: '448px',
    width: '100%',
    margin: '0 16px',
    animation: 'slideUp 0.3s ease-out',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
    borderBottom: '1px solid #E5E7EB',
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#111827',
    margin: 0,
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#9CA3AF',
    cursor: 'pointer',
    padding: 0,
  },
  form: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'none',
    boxSizing: 'border-box',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    paddingTop: '16px',
    marginTop: '8px',
  },
  cancelBtn: {
    flex: 1,
    padding: '12px 16px',
    border: '1px solid #D1D5DB',
    backgroundColor: '#FFFFFF',
    color: '#374151',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
  },
  submitBtn: {
    flex: 1,
    padding: '12px 16px',
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  submitBtnDisabled: {
    backgroundColor: '#9CA3AF',
    cursor: 'not-allowed',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid #FFFFFF',
    borderTop: '2px solid transparent',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },
};

export default function GeneratePromptModal({
  isOpen,
  onClose,
  onGenerate,
  isLoading,
}) {
  const [task, setTask] = useState('');
  const [context, setContext] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (task.trim()) {
      onGenerate(task, context);
      setTask('');
      setContext('');
    }
  };

  if (!isOpen) return null;

  return (
    <div style={modalStyles.overlay}>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={modalStyles.modal}>
        {/* Header */}
        <div style={modalStyles.header}>
          <h2 style={modalStyles.title}>Generate Prompt with AI</h2>
          <button
            onClick={onClose}
            style={modalStyles.closeBtn}
            onMouseEnter={(e) => (e.target.style.color = '#6B7280')}
            onMouseLeave={(e) => (e.target.style.color = '#9CA3AF')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={modalStyles.form}>
          {/* Task Input */}
          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label}>
              What do you want to achieve? *
            </label>
            <textarea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="e.g., Write a prompt for analyzing customer feedback sentiment"
              style={modalStyles.textarea}
              rows="3"
              required
            />
          </div>

          {/* Context Input */}
          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label}>
              Optional context
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g., For a customer support team, should be professional and empathetic"
              style={modalStyles.textarea}
              rows="2"
            />
          </div>

          {/* Buttons */}
          <div style={modalStyles.buttonGroup}>
            <button
              type="button"
              onClick={onClose}
              style={modalStyles.cancelBtn}
              onMouseEnter={(e) => (e.target.style.backgroundColor = '#F3F4F6')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = '#FFFFFF')}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !task.trim()}
              style={{
                ...modalStyles.submitBtn,
                ...(isLoading || !task.trim() ? modalStyles.submitBtnDisabled : {}),
              }}
              onMouseEnter={(e) => {
                if (!isLoading && task.trim()) {
                  e.target.style.backgroundColor = '#1D4ED8';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading && task.trim()) {
                  e.target.style.backgroundColor = '#2563EB';
                }
              }}
            >
              {isLoading && <div style={modalStyles.spinner}></div>}
              {isLoading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
