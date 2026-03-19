import { useState } from 'react'

function Input({ label, error, hint, ...props }) {
  const [focused, setFocused] = useState(false)

  return (
    <div style={{ marginBottom: 18 }}>
      {label && (
        <label style={{
          display: 'block', marginBottom: 6,
          fontWeight: 500, fontSize: 13,
          color: error ? 'var(--danger)' : 'var(--text)',
        }}>
          {label}
        </label>
      )}
      <input
        style={{
          width: '100%', padding: '10px 13px',
          border: `1.5px solid ${error ? 'var(--danger)' : focused ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: 8, fontSize: 14,
          outline: 'none', boxSizing: 'border-box',
          background: '#fff', color: 'var(--text)',
          transition: 'border-color 0.15s',
          boxShadow: focused && !error ? '0 0 0 3px rgba(79,70,229,0.08)' : 'none',
          fontFamily: 'inherit',
        }}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e) }}
        onBlur={(e) => { setFocused(false); props.onBlur?.(e) }}
        {...props}
      />
      {error && (
        <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          {error}
        </p>
      )}
      {hint && !error && (
        <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 5 }}>{hint}</p>
      )}
    </div>
  )
}

export default Input
