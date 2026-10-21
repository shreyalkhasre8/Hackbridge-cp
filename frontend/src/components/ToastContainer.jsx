import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useAuth();

  if (!toasts.length) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '1.5rem',
      right: '1.5rem',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      maxWidth: '380px',
      width: '100%',
    }}>
      {toasts.map(t => {
        let bg = 'var(--color-bg-surface)';
        let border = 'var(--border-default)';
        let Icon = Info;
        let iconColor = 'var(--color-info)';

        if (t.type === 'success') {
          Icon = CheckCircle;
          iconColor = 'var(--color-success)';
          border = 'var(--color-success)';
        } else if (t.type === 'danger' || t.type === 'error') {
          Icon = AlertCircle;
          iconColor = 'var(--color-danger)';
          border = 'var(--color-danger)';
        }

        return (
          <div
            key={t.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              background: bg,
              border: `1px solid ${border}`,
              padding: '0.85rem 1.15rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-md)',
              animation: 'slideUp 0.25s ease-out',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Icon size={18} color={iconColor} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                {t.message}
              </span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '0.2rem',
              }}
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
