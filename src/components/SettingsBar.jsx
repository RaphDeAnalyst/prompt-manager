import { useRef } from 'react';
import { Download, Upload, LogOut } from 'lucide-react';

export default function SettingsBar({ onExport, onImport, onLogout }) {
  const fileInputRef = useRef(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      await onImport(file);
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  return (
    <div className="settings-bar">
      <div className="settings-actions">
        <button
          className="btn btn-secondary settings-btn"
          onClick={onExport}
          title="Download all prompts as JSON"
        >
          <Download size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
          Export
        </button>
        <button
          className="btn btn-secondary settings-btn"
          onClick={handleImportClick}
          title="Upload prompts from JSON file"
        >
          <Upload size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
          Import
        </button>
        {onLogout && (
          <button
            className="btn btn-secondary settings-btn logout-btn"
            onClick={handleLogout}
            title="Logout from your account"
          >
            <LogOut size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
            Logout
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
