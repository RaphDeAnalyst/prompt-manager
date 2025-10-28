import Toast from './Toast';

export default function ToastContainer({ toasts, onRemoveToast }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <div key={toast.id} style={{ pointerEvents: 'auto' }}>
          <Toast
            id={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration || 5000}
            onClose={onRemoveToast}
          />
        </div>
      ))}
    </div>
  );
}
