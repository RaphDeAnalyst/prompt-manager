import { useState } from 'react';
import { FileText, Plus, Wand2, Download, Upload, LogOut, Copy, CheckCircle, Zap, Wand2 as WandIcon, Edit2, Trash2 } from 'lucide-react';

export default function DashboardDemo() {
  const [selectedPromptId, setSelectedPromptId] = useState(1);
  const [copied, setCopied] = useState(false);

  const prompts = [
    {
      id: 1,
      title: 'SEO Article Generator',
      content: 'Write a comprehensive SEO-optimized article about [TOPIC] with at least 2000 words. Include headers, meta description, and keywords.',
      category: 'Content',
      tags: 'seo,writing,marketing',
      created_at: new Date(Date.now() - 2 * 60000),
    },
    {
      id: 2,
      title: 'Code Review Assistant',
      content: 'Review the following code for: 1) Security vulnerabilities 2) Performance issues 3) Code style violations 4) Best practices',
      category: 'Development',
      tags: 'code,review,programming',
      created_at: new Date(Date.now() - 1 * 3600000),
    },
    {
      id: 3,
      title: 'Email Marketing Campaign',
      content: 'Create a professional email marketing campaign for [PRODUCT] targeting [AUDIENCE]. Include subject line, body copy, and CTA.',
      category: 'Marketing',
      tags: 'email,marketing,campaigns',
      created_at: new Date(Date.now() - 24 * 3600000),
    },
  ];

  const selectedPrompt = prompts.find(p => p.id === selectedPromptId);

  const formatDate = (date) => {
    const now = new Date();
    const diff = Math.floor((now - date) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: '24px',
        paddingRight: '24px',
        zIndex: 50,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>
          Prompt Manager
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button style={{
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
          }}>
            <Plus size={16} />
            New
          </button>
          <button style={{
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
          }}>
            <WandIcon size={16} />
            Generate
          </button>
          <button style={{
            padding: '8px 12px',
            color: '#6B7280',
            border: 'none',
            background: 'transparent',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
          }}>
            Refresh
          </button>
          <button style={{
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
          }}>
            <Download size={16} />
            Export
          </button>
          <button style={{
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
          }}>
            <Upload size={16} />
            Import
          </button>
          <button style={{
            padding: '8px 12px',
            color: '#6B7280',
            border: 'none',
            background: 'transparent',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            borderLeft: '1px solid #E5E7EB',
            paddingLeft: '16px',
          }}>
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Three-Column Layout */}
      <div style={{
        display: 'flex',
        height: 'calc(100vh - 60px)',
        marginTop: '60px',
      }}>
        {/* Left Column: Prompts Sidebar */}
        <div style={{
          width: '264px',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E5E7EB',
          padding: '20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '24px',
            fontSize: '18px',
            fontWeight: '700',
            color: '#111827',
          }}>
            <FileText size={20} color="#1877F2" />
            Prompts
          </div>

          <input
            type="text"
            placeholder="Search prompts..."
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '13px',
              boxSizing: 'border-box',
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {prompts.map(prompt => (
              <div
                key={prompt.id}
                onClick={() => setSelectedPromptId(prompt.id)}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  backgroundColor: selectedPromptId === prompt.id ? '#EBF5FF' : '#FFFFFF',
                  borderLeft: '3px solid ' + (selectedPromptId === prompt.id ? '#1877F2' : 'transparent'),
                  border: selectedPromptId === prompt.id ? '1px solid #1877F2' : '1px solid #E5E7EB',
                  boxShadow: selectedPromptId === prompt.id ? '0 1px 2px rgba(24, 119, 242, 0.1)' : 'none',
                }}
              >
                <div style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: selectedPromptId === prompt.id ? '#1877F2' : '#111827',
                  marginBottom: '4px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {prompt.title}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#9CA3AF',
                }}>
                  {formatDate(prompt.created_at)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center Column: Prompt Details */}
        {selectedPrompt && (
          <div style={{
            flex: 1,
            backgroundColor: '#FFFFFF',
            borderRight: '1px solid #E5E7EB',
            overflowY: 'auto',
            padding: '32px',
            maxWidth: 'none',
          }}>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '800',
              color: '#111827',
              margin: '0 0 12px 0',
              lineHeight: '1.2',
            }}>
              {selectedPrompt.title}
            </h1>

            <div style={{
              fontSize: '13px',
              color: '#6B7280',
              marginBottom: '32px',
              paddingBottom: '24px',
              borderBottom: '1px solid #E5E7EB',
            }}>
              Created: {selectedPrompt.created_at.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              {selectedPrompt.category && ` • Category: ${selectedPrompt.category}`}
            </div>

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
                {selectedPrompt.content}
              </div>
            </div>

            {selectedPrompt.tags && (
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
                  {selectedPrompt.tags.split(',').map((tag, i) => (
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
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

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
              }}>
                <Copy size={16} />
                Copy
              </button>
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
              }}>
                <Zap size={16} />
                Run
              </button>
              <button style={{
                padding: '10px 16px',
                background: '#F5F5F5',
                color: '#1877F2',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <WandIcon size={16} />
                Optimize
              </button>
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
              }}>
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
              }}>
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Right Column: AI Output Panel */}
        <div style={{
          width: '384px',
          backgroundColor: '#F9FAFB',
          borderLeft: '1px solid #E5E7EB',
          padding: '0',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '12px 16px',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h3 style={{
              fontWeight: '600',
              color: '#111827',
              fontSize: '14px',
              margin: 0,
            }}>
              AI Output
            </h3>
            <span style={{
              fontSize: '12px',
              color: '#6B7280',
            }}>
              Tokens: <span style={{ fontWeight: '600', color: '#1877F2' }}>0</span>
            </span>
          </div>

          <div style={{
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
          }}>
            <p style={{
              color: '#9CA3AF',
              fontSize: '13px',
              textAlign: 'center',
              margin: 0,
            }}>
              Run your prompt to see AI output here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
