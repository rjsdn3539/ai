function Button({ children, loading, variant = 'primary', fullWidth, size = 'md', style: styleProp, ...props }) {
  const sizes = {
    sm: { padding: '6px 14px', fontSize: 13 },
    md: { padding: '10px 20px', fontSize: 14 },
    lg: { padding: '13px 28px', fontSize: 15 },
  }

  const base = {
    ...sizes[size],
    borderRadius: 8,
    fontWeight: 600,
    cursor: loading || props.disabled ? 'not-allowed' : 'pointer',
    border: 'none',
    width: fullWidth ? '100%' : undefined,
    opacity: loading || props.disabled ? 0.6 : 1,
    transition: 'all 0.15s',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    letterSpacing: '-0.01em',
    fontFamily: 'inherit',
  }

  const variants = {
    primary:  { background: 'var(--primary)', color: '#fff' },
    danger:   { background: 'var(--danger)', color: '#fff' },
    outline:  { background: 'transparent', color: 'var(--primary)', border: '1.5px solid var(--primary-border)' },
    ghost:    { background: 'transparent', color: 'var(--text-secondary)', border: '1.5px solid var(--border)' },
    subtle:   { background: 'var(--primary-light)', color: 'var(--primary)', border: '1.5px solid var(--primary-border)' },
  }

  const hoverMap = {
    primary:  { background: 'var(--primary-hover)' },
    danger:   { background: '#dc2626' },
    outline:  { background: 'var(--primary-light)' },
    ghost:    { background: 'var(--border-light)' },
    subtle:   { background: '#e0e7ff' },
  }

  const handleMouseEnter = (e) => {
    if (!loading && !props.disabled) {
      Object.assign(e.currentTarget.style, hoverMap[variant] || {})
    }
    props.onMouseEnter?.(e)
  }

  const handleMouseLeave = (e) => {
    Object.assign(e.currentTarget.style, variants[variant] || {})
    props.onMouseLeave?.(e)
  }

  return (
    <button
      style={{ ...base, ...variants[variant], ...styleProp }}
      disabled={loading || props.disabled}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {loading ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.75s linear infinite' }}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          처리 중...
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </>
      ) : children}
    </button>
  )
}

export default Button
