import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useToast } from '../hooks/useToast';

export default function AIOutputPanel({ output, optimizationOutput, tokensUsed, isLoading, isOptimizing }) {
  const [copiedSection, setCopiedSection] = useState(null);
  const { showSuccess } = useToast();

  const handleCopy = (text, section = null) => {
    navigator.clipboard.writeText(text).then(() => {
      showSuccess('Copied to clipboard!');
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    }).catch(() => {
      showSuccess('Copy to clipboard is not supported in your browser');
    });
  };

  if (!output && !optimizationOutput && !isLoading && !isOptimizing) {
    return (
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
    );
  }

  // Handle optimization output display
  if (optimizationOutput) {
    return (
      <div style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        flex: 1,
        overflowY: 'auto',
      }}>
        {/* Optimized Prompt Container */}
        <div>
          <div style={{
            backgroundColor: '#FAFAFA',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            padding: '12px',
            color: '#111827',
            fontFamily: '"Monaco", "Menlo", "Ubuntu Mono", monospace',
            fontSize: '12px',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            maxHeight: 'calc(100vh - 200px)',
            overflowY: 'auto',
            width: '100%',
          }}>
            {optimizationOutput.improved_prompt}
          </div>
          <button
            onClick={() => handleCopy(optimizationOutput.improved_prompt, 'prompt')}
            style={{
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              background: copiedSection === 'prompt' ? '#10B981' : '#EBF5FF',
              color: copiedSection === 'prompt' ? 'white' : '#1877F2',
              border: copiedSection === 'prompt' ? 'none' : '1px solid #DBEAFE',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (copiedSection !== 'prompt') {
                e.target.style.background = '#DBEAFE';
              }
            }}
            onMouseLeave={(e) => {
              if (copiedSection !== 'prompt') {
                e.target.style.background = '#EBF5FF';
              }
            }}
          >
            {copiedSection === 'prompt' ? (
              <>
                <Check size={14} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={14} />
                Copy Optimized Prompt
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
      }}>
        {isLoading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingY: '32px',
            height: '120px',
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              borderTop: '3px solid #1877F2',
              borderRight: '3px solid transparent',
              animation: 'spin 0.6s linear infinite',
            }}></div>
          </div>
        ) : (
          <>
            <div style={{
              backgroundColor: '#FAFAFA',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              padding: '12px',
              color: '#111827',
              fontFamily: '"Monaco", "Menlo", "Ubuntu Mono", monospace',
              fontSize: '12px',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              maxHeight: 'calc(100vh - 300px)',
              overflowY: 'auto',
              width: '100%',
            }}>
              {output}
            </div>
            <button
              onClick={() => handleCopy(output, 'output')}
              style={{
                marginTop: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                background: copiedSection === 'output' ? '#10B981' : '#EBF5FF',
                color: copiedSection === 'output' ? 'white' : '#1877F2',
                border: copiedSection === 'output' ? 'none' : '1px solid #DBEAFE',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (copiedSection !== 'output') {
                  e.target.style.background = '#DBEAFE';
                }
              }}
              onMouseLeave={(e) => {
                if (copiedSection !== 'output') {
                  e.target.style.background = '#EBF5FF';
                }
              }}
            >
              {copiedSection === 'output' ? (
                <>
                  <Check size={14} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copy Output
                </>
              )}
            </button>
          </>
        )}
      </div>
    </>
  );
}
