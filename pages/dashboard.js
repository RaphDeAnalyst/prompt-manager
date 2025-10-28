import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import PromptList from "../src/components/PromptList";
import PromptDetail from "../src/components/PromptDetail";
import SettingsBar from "../src/components/SettingsBar";
import AIOutputPanel from "../src/components/AIOutputPanel";
import GeneratePromptModal from "../src/components/GeneratePromptModal";
import OptimizePromptModal from "../src/components/OptimizePromptModal";
import EditPromptModal from "../src/components/EditPromptModal";
import UsageBar from "../src/components/UsageBar";
import { useToast } from "../src/hooks/useToast";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [aiOutput, setAiOutput] = useState("");
  const [optimizationOutput, setOptimizationOutput] = useState(null);
  const [tokensUsed, setTokensUsed] = useState(0);
  const [usage, setUsage] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showOptimizeModal, setShowOptimizeModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);

  // No authentication check - dashboard is public like the demo

  // Fetch prompts (works with or without session)
  useEffect(() => {
    fetchPrompts();
    fetchUsage();
  }, []);

  const fetchPrompts = async () => {
    try {
      const res = await fetch("/api/prompts");
      const data = await res.json();
      if (data.success) {
        setPrompts(data.prompts);
        if (data.prompts.length > 0 && !selectedPrompt) {
          setSelectedPrompt(data.prompts[0]);
        }
      } else {
        // No prompts available (possibly not authenticated) - show empty state
        console.log("No prompts available");
      }
    } catch (error) {
      console.error("Failed to fetch prompts:", error);
      // Continue rendering even if fetch fails
    } finally {
      setIsLoadingPrompts(false);
    }
  };

  const fetchUsage = async () => {
    try {
      const res = await fetch("/api/usage/current");
      const data = await res.json();
      if (data.success) {
        setUsage(data.usage);
      }
    } catch (error) {
      console.error("Failed to fetch usage:", error);
      // Continue rendering even if fetch fails
    }
  };

  const handleRunPrompt = async () => {
    if (!selectedPrompt) return;

    setIsRunning(true);
    setAiOutput("");
    setOptimizationOutput(null);

    try {
      const res = await fetch("/api/ai/run-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptId: selectedPrompt.id }),
      });

      const data = await res.json();

      if (data.success) {
        setAiOutput(data.response);
        setTokensUsed(data.tokens_used);
        fetchUsage(); // Update usage stats
        showSuccess("Prompt executed successfully!");
      } else {
        showError(`Error: ${data.error}`);
        setAiOutput(`Error: ${data.error}`);
      }
    } catch (error) {
      showError(`Error: ${error.message}`);
      setAiOutput(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleGeneratePrompt = async (task, context) => {
    setIsGenerating(true);
    setShowGenerateModal(false);

    try {
      const res = await fetch("/api/ai/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, context }),
      });

      const data = await res.json();

      if (data.success) {
        setPrompts([data.prompt, ...prompts]);
        setSelectedPrompt(data.prompt);
        setTokensUsed(data.tokens_used);
        fetchUsage();
        showSuccess("Prompt generated successfully!");
      } else {
        showError(`Error: ${data.error || "Failed to generate prompt"}`);
      }
    } catch (error) {
      console.error("Failed to generate prompt:", error);
      showError(`Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptimizePrompt = async () => {
    if (!selectedPrompt) return;

    setIsOptimizing(true);

    try {
      const res = await fetch("/api/ai/optimize-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptId: selectedPrompt.id }),
      });

      const data = await res.json();

      if (data.success) {
        // Store optimization output separately - optimized prompt and improvements in different containers
        setOptimizationOutput({
          improved_prompt: data.improved_prompt,
          improvement_notes: data.improvement_notes,
        });
        setAiOutput(""); // Clear regular output when showing optimization
        setTokensUsed(data.tokens_used);
        fetchUsage();
        showSuccess("Prompt optimized successfully!");
      } else {
        showError(`Error: ${data.error || "Failed to optimize prompt"}`);
      }
    } catch (error) {
      console.error("Failed to optimize prompt:", error);
      showError(`Error: ${error.message}`);
    } finally {
      setIsOptimizing(false);
      setShowOptimizeModal(false);
    }
  };

  const canRunPrompt = usage && !usage.limit_exceeded;

  // Show loading state only when initially loading prompts
  if (isLoadingPrompts && prompts.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          borderTop: '3px solid #1877F2',
          borderRight: '3px solid transparent',
          animation: 'spin 0.6s linear infinite',
        }}></div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>
      {/* Top Navigation Bar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        zIndex: 50,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
      }}>
        <SettingsBar
          onNewPrompt={() => setShowGenerateModal(true)}
          onGeneratePrompt={() => setShowGenerateModal(true)}
          onRefresh={() => {
            fetchPrompts();
            fetchUsage();
          }}
          onExport={() => {
            // Export prompts as JSON
            const dataStr = JSON.stringify(prompts, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `prompts-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);
          }}
          onImport={async (file) => {
            try {
              const text = await file.text();
              const importedPrompts = JSON.parse(text);
              // Create imported prompts
              for (const prompt of importedPrompts) {
                await fetch('/api/prompts', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(prompt)
                });
              }
              fetchPrompts();
            } catch (error) {
              alert('Error importing prompts: ' + error.message);
            }
          }}
          onLogout={() => signOut({ redirect: true, callbackUrl: '/auth/signin' })}
          canGenerate={usage && !usage.limit_exceeded}
        />
      </div>

      {/* Three-Column Main Layout */}
      <div style={{
        display: 'flex',
        height: 'calc(100vh - 60px)',
        marginTop: '60px',
      }}>
        {/* Column 1: Prompts Sidebar */}
        <div style={{
          width: isLeftPanelCollapsed ? '0px' : '264px',
          backgroundColor: '#FFFFFF',
          borderRight: isLeftPanelCollapsed ? 'none' : '1px solid #E5E7EB',
          overflowY: 'auto',
          transition: 'width 0.3s ease, border 0.3s ease',
          position: 'relative',
        }}>
          {!isLeftPanelCollapsed && (
            <PromptList
              prompts={prompts}
              selectedId={selectedPrompt?.id}
              onSelectPrompt={setSelectedPrompt}
              onNewPrompt={() => setShowGenerateModal(true)}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          )}
        </div>

        {/* Left Panel Collapse Button */}
        <button
          onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
          style={{
            position: 'absolute',
            left: isLeftPanelCollapsed ? '0px' : '264px',
            top: '60px',
            width: '32px',
            height: '32px',
            backgroundColor: '#F3F4F6',
            border: '1px solid #E5E7EB',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            transition: 'left 0.3s ease',
            fontSize: '16px',
            color: '#6B7280',
          }}
          title={isLeftPanelCollapsed ? 'Expand Prompts' : 'Collapse Prompts'}
        >
          {isLeftPanelCollapsed ? '→' : '←'}
        </button>

        {/* Column 2: Prompt Detail & Editor */}
        <div style={{
          flex: 1,
          borderRight: '1px solid #E5E7EB',
          overflowY: 'auto',
          backgroundColor: '#FFFFFF',
        }}>
          {selectedPrompt ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Usage Bar at Top */}
              <div style={{
                flexShrink: 0,
                padding: '16px',
                borderBottom: '1px solid #E5E7EB',
                backgroundColor: '#F9FAFB',
              }}>
                <UsageBar usage={usage} isPaid={session?.user?.isPaid} />
              </div>

              {/* Prompt Content */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '32px 24px',
                display: 'flex',
                justifyContent: 'center',
              }}>
                <div style={{
                  width: '100%',
                  maxWidth: '1000px',
                }}>
                  <PromptDetail
                    prompt={selectedPrompt}
                    onEdit={() => {
                      setShowEditModal(true);
                    }}
                    onDelete={() => {
                      if (window.confirm("Are you sure you want to delete this prompt? This action cannot be undone.")) {
                        // Call delete API
                        fetch("/api/prompts", {
                          method: "DELETE",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id: selectedPrompt.id }),
                        })
                          .then((res) => res.json())
                          .then((data) => {
                            if (data.success) {
                              showSuccess("Prompt deleted successfully!");
                              // Remove from list
                              setPrompts(prompts.filter((p) => p.id !== selectedPrompt.id));
                              setSelectedPrompt(null);
                            } else {
                              showError(`Error: ${data.error || "Failed to delete prompt"}`);
                            }
                          })
                          .catch((error) => {
                            showError(`Error: ${error.message}`);
                          });
                      }
                    }}
                    onCopy={() => {
                      /* Toast is now handled in PromptDetail component */
                    }}
                    onRun={handleRunPrompt}
                    onOptimize={() => setShowOptimizeModal(true)}
                    isRunning={isRunning}
                    isOptimizing={isOptimizing}
                    canRunPrompt={canRunPrompt}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#9CA3AF', fontSize: '16px', fontWeight: '500', margin: 0 }}>
                  Select a prompt to get started
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Column 3: AI Output Panel */}
        <div style={{
          width: isRightPanelCollapsed ? '0px' : '384px',
          backgroundColor: '#F9FAFB',
          borderLeft: isRightPanelCollapsed ? 'none' : '1px solid #E5E7EB',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.3s ease, border 0.3s ease',
          position: 'relative',
        }}>
          {!isRightPanelCollapsed && (
            <>
              {selectedPrompt ? (
                <>
                  <div style={{
                    flexShrink: 0,
                    padding: '12px 16px',
                    borderBottom: '1px solid #E5E7EB',
                    backgroundColor: '#FFFFFF',
                  }}>
                    <h3 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#111827',
                      margin: 0,
                    }}>
                      AI Output
                    </h3>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto' }}>
                    <AIOutputPanel
                      output={aiOutput}
                      optimizationOutput={optimizationOutput}
                      tokensUsed={tokensUsed}
                      isLoading={isRunning}
                      isOptimizing={isOptimizing}
                    />
                  </div>
                </>
              ) : (
                <div style={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <div style={{ textAlign: 'center', padding: '16px' }}>
                    <p style={{ color: '#9CA3AF', fontSize: '13px', margin: 0 }}>
                      Run a prompt to see AI output here
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Panel Collapse Button */}
        <button
          onClick={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
          style={{
            position: 'absolute',
            right: isRightPanelCollapsed ? '0px' : '384px',
            top: '60px',
            width: '32px',
            height: '32px',
            backgroundColor: '#F3F4F6',
            border: '1px solid #E5E7EB',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            transition: 'right 0.3s ease',
            fontSize: '16px',
            color: '#6B7280',
          }}
          title={isRightPanelCollapsed ? 'Expand AI Output' : 'Collapse AI Output'}
        >
          {isRightPanelCollapsed ? '←' : '→'}
        </button>
      </div>

      {/* Modals */}
      <GeneratePromptModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onGenerate={handleGeneratePrompt}
        isLoading={isGenerating}
      />

      <OptimizePromptModal
        isOpen={showOptimizeModal}
        onClose={() => setShowOptimizeModal(false)}
        promptContent={selectedPrompt?.content || ""}
        onOptimize={handleOptimizePrompt}
        isLoading={isOptimizing}
      />

      <EditPromptModal
        isOpen={showEditModal}
        prompt={selectedPrompt}
        onClose={() => setShowEditModal(false)}
        onSave={(updatedPrompt) => {
          // Update the selected prompt
          setSelectedPrompt(updatedPrompt);
          // Update in the list
          setPrompts(
            prompts.map((p) => (p.id === updatedPrompt.id ? updatedPrompt : p))
          );
          showSuccess("Prompt updated successfully!");
        }}
      />
    </div>
  );
}
