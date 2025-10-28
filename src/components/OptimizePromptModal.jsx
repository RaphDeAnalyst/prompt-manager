import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

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
    maxWidth: '672px',
    width: '100%',
    margin: '0 16px',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
    borderBottom: '1px solid #E5E7EB',
    position: 'sticky',
    top: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 10,
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
  content: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  infoBox: {
    display: 'flex',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#EBF5FF',
    border: '1px solid #DBEAFE',
    borderRadius: '8px',
  },
  infoIcon: {
    flexShrink: 0,
    marginTop: '2px',
    color: '#2563EB',
  },
  infoText: {
    fontSize: '14px',
    color: '#1E40AF',
    margin: 0,
  },
  promptLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
    display: 'block',
  },
  promptBox: {
    padding: '16px',
    backgroundColor: '#F3F4F6',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#374151',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    maxHeight: '192px',
    overflowY: 'auto',
    fontFamily: 'monospace',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    gap: '12px',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #D1D5DB',
    borderTop: '3px solid #2563EB',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },
  loadingText: {
    fontSize: '14px',
    color: '#6B7280',
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
  optimizeBtn: {
    flex: 1,
    padding: '12px 16px',
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
  },
};

export default function OptimizePromptModal({
  isOpen,
  onClose,
  promptContent,
  onOptimize,
  isLoading,
}) {
  const handleOptimize = () => {
    onOptimize();
  };

  if (!isOpen) return null;

  return (
    <div style={modalStyles.overlay}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={modalStyles.modal}>
        {/* Header */}
        <div style={modalStyles.header}>
          <h2 style={modalStyles.title}>Optimize Prompt with AI</h2>
          <button
            onClick={onClose}
            style={modalStyles.closeBtn}
            onMouseEnter={(e) => (e.target.style.color = '#6B7280')}
            onMouseLeave={(e) => (e.target.style.color = '#9CA3AF')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={modalStyles.content}>
          {/* Info */}
          <div style={modalStyles.infoBox}>
            <AlertCircle size={20} style={modalStyles.infoIcon} />
            <p style={modalStyles.infoText}>
              AI will analyze your prompt and suggest improvements for clarity, specificity, and effectiveness.
            </p>
          </div>

          {/* Current Prompt */}
          <div>
            <label style={modalStyles.promptLabel}>
              Current Prompt
            </label>
            <div style={modalStyles.promptBox}>
              {promptContent}
            </div>
          </div>

          {/* Loading/Results */}
          {isLoading && (
            <div style={modalStyles.loadingContainer}>
              <div style={modalStyles.spinner}></div>
              <span style={modalStyles.loadingText}>Optimizing your prompt...</span>
            </div>
          )}

          {/* Buttons */}
          {!isLoading && (
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
                type="button"
                onClick={handleOptimize}
                style={modalStyles.optimizeBtn}
                onMouseEnter={(e) => (e.target.style.backgroundColor = '#1D4ED8')}
                onMouseLeave={(e) => (e.target.style.backgroundColor = '#2563EB')}
              >
                Optimize
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
