import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export default function Toast({ id, message, type = 'info', duration = 5000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300); // Wait for fade animation
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const typeConfig = {
    success: {
      bgColor: '#D1FAE5',
      borderColor: '#6EE7B7',
      textColor: '#065F46',
      iconColor: '#10B981',
      icon: CheckCircle,
    },
    error: {
      bgColor: '#FEE2E2',
      borderColor: '#FCA5A5',
      textColor: '#7F1D1D',
      iconColor: '#EF4444',
      icon: AlertCircle,
    },
    warning: {
      bgColor: '#FEF3C7',
      borderColor: '#FCD34D',
      textColor: '#92400E',
      iconColor: '#F59E0B',
      icon: AlertTriangle,
    },
    info: {
      bgColor: '#DBEAFE',
      borderColor: '#93C5FD',
      textColor: '#1E40AF',
      iconColor: '#3B82F6',
      icon: Info,
    },
  };

  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div
      style={{
        animation: isVisible ? 'slideInRight 0.3s ease-out' : 'slideOutRight 0.3s ease-out',
        animationFillMode: 'forwards',
      }}
    >
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(400px);
            opacity: 0;
          }
        }
      `}</style>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          padding: '16px',
          backgroundColor: config.bgColor,
          border: `1px solid ${config.borderColor}`,
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          minWidth: '300px',
          maxWidth: '400px',
        }}
      >
        {/* Icon */}
        <Icon
          size={20}
          color={config.iconColor}
          style={{
            flexShrink: 0,
            marginTop: '2px',
          }}
        />

        {/* Message */}
        <div
          style={{
            flex: 1,
            color: config.textColor,
            fontSize: '14px',
            lineHeight: '1.5',
            fontWeight: '500',
            wordBreak: 'break-word',
          }}
        >
          {message}
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose(id), 300);
          }}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: config.textColor,
            opacity: 0.6,
            transition: 'opacity 0.2s',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.target.style.opacity = '1')}
          onMouseLeave={(e) => (e.target.style.opacity = '0.6')}
          title="Close notification"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
