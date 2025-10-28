import { useRef } from 'react';
import { Download, Upload, LogOut, Plus, Wand2 } from 'lucide-react';
import { useToast } from '../hooks/useToast';

export default function SettingsBar({ onExport, onImport, onLogout, onNewPrompt, onGeneratePrompt, onRefresh, canGenerate }) {
  const fileInputRef = useRef(null);
  const { showSuccess, showError } = useToast();

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await onImport(file);
        showSuccess('Prompts imported successfully!');
      } catch (error) {
        showError('Failed to import prompts. Please check the file format.');
      }
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExport = () => {
    try {
      onExport();
      showSuccess('Prompts exported successfully!');
    } catch (error) {
      showError('Failed to export prompts.');
    }
  };

  const handleRefresh = () => {
    onRefresh();
    showSuccess('Data refreshed successfully!');
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingLeft: '24px',
      paddingRight: '24px',
      height: '60px',
    }}>
      {/* Left side - Logo / Brand */}
      <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>
        Prompt Manager
      </h2>

      {/* Right side - Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {onNewPrompt && (
          <button
            style={{
              padding: '8px 16px',
              background: '#1877F2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onClick={onNewPrompt}
            title="Create a new prompt manually"
          >
            <Plus size={16} />
            New
          </button>
        )}
        {onGeneratePrompt && (
          <button
            style={{
              padding: '8px 16px',
              background: '#1877F2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: canGenerate ? 1 : 0.5,
              pointerEvents: canGenerate ? 'auto' : 'none',
            }}
            onClick={onGeneratePrompt}
            disabled={!canGenerate}
            title={canGenerate ? "Generate a prompt using AI" : "You've reached your monthly limit"}
          >
            <Wand2 size={16} />
            Generate
          </button>
        )}
        {onRefresh && (
          <button
            style={{
              padding: '8px 12px',
              color: '#6B7280',
              border: 'none',
              background: 'transparent',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
            onClick={handleRefresh}
            title="Refresh prompts and usage"
          >
            Refresh
          </button>
        )}
        <button
          style={{
            padding: '8px 12px',
            color: '#6B7280',
            border: 'none',
            background: 'transparent',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
          onClick={handleExport}
          title="Download all prompts as JSON"
        >
          <Download size={16} />
          Export
        </button>
        <button
          style={{
            padding: '8px 12px',
            color: '#6B7280',
            border: 'none',
            background: 'transparent',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
          onClick={handleImportClick}
          title="Upload prompts from JSON file"
        >
          <Upload size={16} />
          Import
        </button>
        {onLogout && (
          <button
            style={{
              padding: '8px 12px',
              color: '#6B7280',
              border: 'none',
              background: 'transparent',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              borderLeft: '1px solid #E5E7EB',
              paddingLeft: '16px',
            }}
            onClick={handleLogout}
            title="Logout from your account"
          >
            <LogOut size={16} />
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
}
