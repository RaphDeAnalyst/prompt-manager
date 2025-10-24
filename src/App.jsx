import { useState, useEffect } from 'react';
import { FileText, CheckCircle } from 'lucide-react';
import './styles/App.css';
import PromptList from './components/PromptList';
import PromptDetail from './components/PromptDetail';
import PromptForm from './components/PromptForm';
import SettingsBar from './components/SettingsBar';
import { useAuth } from './context/AuthContext';
import { fetchPrompts, createPromptAPI, updatePromptAPI, deletePromptAPI, importPromptsAPI } from './services/api';

export default function App() {
  const { logout, token } = useAuth();
  const [prompts, setPrompts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load prompts from API on mount
  useEffect(() => {
    const loadPrompts = async () => {
      try {
        setLoading(true);
        setError(null);
        const loadedPrompts = await fetchPrompts();
        setPrompts(loadedPrompts);
        if (loadedPrompts.length > 0 && !selectedId) {
          setSelectedId(loadedPrompts[0].id);
        }
      } catch (err) {
        console.error('Error loading prompts:', err);
        setError('Failed to load prompts. Please check your connection.');
        // Could implement fallback to localStorage here
      } finally {
        setLoading(false);
      }
    };
    loadPrompts();
  }, [token]);

  const selectedPrompt = prompts.find(p => p.id === selectedId);

  const handleNewPrompt = () => {
    setSelectedId(null);
    setShowForm(true);
  };

  const handleSavePrompt = async (promptData) => {
    try {
      setError(null);
      if (selectedPrompt?.id) {
        // Update existing prompt
        const updated = await updatePromptAPI(selectedId, promptData);
        setPrompts(prompts.map(p => p.id === selectedId ? updated : p));
      } else {
        // Create new prompt
        const newPrompt = await createPromptAPI(promptData);
        setPrompts([...prompts, newPrompt]);
        setSelectedId(newPrompt.id);
      }
      setShowForm(false);
    } catch (err) {
      console.error('Error saving prompt:', err);
      setError(err.message);
    }
  };

  const handleDeletePrompt = async () => {
    if (selectedId && window.confirm('Are you sure you want to delete this prompt?')) {
      try {
        setError(null);
        await deletePromptAPI(selectedId);
        const remaining = prompts.filter(p => p.id !== selectedId);
        setPrompts(remaining);
        setSelectedId(remaining.length > 0 ? remaining[0].id : null);
      } catch (err) {
        console.error('Error deleting prompt:', err);
        setError(err.message);
      }
    }
  };

  const handleExportPrompts = async () => {
    try {
      const dataStr = JSON.stringify(prompts, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `prompts-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setError('Error exporting prompts: ' + error.message);
    }
  };

  const handleImportPrompts = async (file) => {
    try {
      setError(null);
      const text = await file.text();
      const imported = JSON.parse(text);

      if (!Array.isArray(imported)) {
        throw new Error('Invalid import file format. Expected an array of prompts.');
      }

      const result = await importPromptsAPI(imported);
      setPrompts([...prompts, ...result]);
      if (result.length > 0 && !selectedId) {
        setSelectedId(result[0].id);
      }
    } catch (err) {
      console.error('Error importing prompts:', err);
      setError('Error importing prompts: ' + err.message);
    }
  };

  const handleEditPrompt = () => {
    setShowForm(true);
  };

  const handleCopyNotification = () => {
    setShowCopyNotification(true);
    setTimeout(() => setShowCopyNotification(false), 2000);
  };

  return (
    <div className="app-container">
      <PromptList
        prompts={prompts}
        selectedId={selectedId}
        onSelectPrompt={setSelectedId}
        onNewPrompt={handleNewPrompt}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <main className="main-content">
        <SettingsBar
          onExport={handleExportPrompts}
          onImport={handleImportPrompts}
          onLogout={logout}
        />
        <div className="content-area">
          {error && (
            <div className="error-banner">
              <p>{error}</p>
              <button onClick={() => setError(null)}>Dismiss</button>
            </div>
          )}
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading prompts...</p>
            </div>
          ) : selectedPrompt ? (
            <PromptDetail
              prompt={selectedPrompt}
              onEdit={handleEditPrompt}
              onDelete={handleDeletePrompt}
              onCopy={handleCopyNotification}
            />
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <FileText size={60} strokeWidth={1.5} />
              </div>
              <div className="empty-state-text">
                {prompts.length === 0
                  ? 'No prompts yet. Create your first one!'
                  : 'Select a prompt or create a new one'}
              </div>
            </div>
          )}
        </div>
      </main>

      {showForm && (
        <PromptForm
          initialPrompt={selectedPrompt}
          onSave={handleSavePrompt}
          onCancel={() => setShowForm(false)}
        />
      )}

      {showCopyNotification && (
        <div className="copy-success">
          <CheckCircle size={20} style={{ display: 'inline', marginRight: '8px' }} />
          Copied to clipboard!
        </div>
      )}
    </div>
  );
}
