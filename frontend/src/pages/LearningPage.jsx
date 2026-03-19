import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import useAuthStore from '../store/authStore'

const FREE_DAILY_LIMIT = 20
const getDailyUsed = () => parseInt(localStorage.getItem(`learningDaily_${new Date().toISOString().slice(0, 10)}`) || '0', 10)

const SUBJECTS = [
  { id: '영어', label: '영어', icon: '🇺🇸', desc: '문법 · 독해 · 어휘' },
  { id: '국사', label: '국사', icon: '📜', desc: '한국사 · 근현대사' },
  { id: '일본어', label: '일본어', icon: '🇯🇵', desc: '히라가나 · 문법 · 어휘' },
  { id: '자바스크립트', label: 'JavaScript', icon: '🟨', desc: 'ES6+ · DOM · 비동기' },
  { id: 'C++', label: 'C++', icon: '⚡', desc: '포인터 · STL · 메모리' },
  { id: '파이썬', label: 'Python', icon: '🐍', desc: '문법 · 자료형 · 라이브러리' },
  { id: '데이터베이스', label: '데이터베이스', icon: '🗄️', desc: 'SQL · 인덱스 · 트랜잭션' },
  { id: '자바', label: 'Java', icon: '☕', desc: 'OOP · JVM · 컬렉션' },
  { id: '스프링', label: 'Spring', icon: '🍃', desc: 'IoC · AOP · MVC' },
]

const DIFFICULTY_META = {
  EASY:   { label: '쉬움',   color: '#2da65e', bg: '#f0fdf4', border: '#bbf7d0', emoji: '🟢' },
  MEDIUM: { label: '보통',   color: '#e09420', bg: '#fffbeb', border: '#fde68a', emoji: '🟡' },
  HARD:   { label: '어려움', color: '#e05252', bg: '#fef2f2', border: '#fecaca', emoji: '🔴' },
}

const COUNT_OPTIONS = [10, 15, 20, 25, 30, 35, 40]

function LearningPage() {
  const { user } = useAuthStore()
  const isFree = (user?.subscriptionTier || 'FREE') === 'FREE'
  const dailyUsed = getDailyUsed()
  const remaining = isFree ? Math.max(0, FREE_DAILY_LIMIT - dailyUsed) : Infinity
  const availableOptions = COUNT_OPTIONS.filter(n => n <= remaining)

  const [subject, setSubject] = useState('')
  const [count, setCount] = useState(() => {
    const def = 10
    if (isFree && remaining < def) return availableOptions[0] || 0
    return def
  })
  const [difficulty, setDifficulty] = useState(
    localStorage.getItem('placementDifficulty') || 'MEDIUM'
  )
  const navigate = useNavigate()

  const placementDone = localStorage.getItem('placementDone') === 'true'
  const diffMeta      = DIFFICULTY_META[difficulty]

  const handleDifficultyChange = (d) => {
    setDifficulty(d)
    localStorage.setItem('placementDifficulty', d)
  }

  const handleStart = () => {
    if (!subject) { alert('과목을 선택해주세요.'); return }
    if (isFree && remaining === 0) { alert('오늘 학습 가능한 문제를 모두 풀었습니다.\n내일 다시 이용하거나 플랜을 업그레이드하세요.'); return }
    navigate('/learning/session', { state: { subject, difficulty, count } })
  }

  return (
    <div style={{ width: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>AI 학습</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>AI가 맞춤 문제를 생성하고 상세한 해설을 제공합니다.</p>
        </div>
        {(() => {
          const count = JSON.parse(localStorage.getItem('wrongNotes') || '[]').length
          return count > 0 ? (
            <button
              onClick={() => navigate('/learning/wrong-notes')}
              style={{
                background: '#fff', border: '1.5px solid #fecaca', borderRadius: 12,
                padding: '10px 18px', cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: 'var(--shadow-sm)', transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ef4444' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#fecaca' }}
            >
              <span style={{ fontSize: 16 }}>📒</span>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>오답노트</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#ef4444', margin: 0 }}>{count}개</p>
              </div>
            </button>
          ) : null
        })()}
      </div>

      {/* Placement banner */}
      {!placementDone ? (
        <div style={{
          background: 'linear-gradient(130deg, #3d2ee0 0%, #7c6af0 52%, #0ea5e9 100%)',
          borderRadius: 20, padding: '28px 36px', marginBottom: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
          boxShadow: '0 10px 36px rgba(61,46,224,0.28)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: 200, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.055)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>🎯</div>
            <h2 style={{ fontWeight: 800, fontSize: 20, color: '#fff', marginBottom: 6 }}>수준 진단 테스트를 먼저 해보세요!</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.78)', lineHeight: 1.65 }}>
              20문제로 여러분의 수준을 파악하고 AI가 최적 난이도를 자동 설정합니다.
            </p>
          </div>
          <button
            onClick={() => navigate('/learning/placement')}
            style={{
              background: '#fff', color: '#3d2ee0', border: 'none', borderRadius: 12,
              padding: '14px 28px', fontWeight: 800, fontSize: 15, cursor: 'pointer',
              whiteSpace: 'nowrap', fontFamily: 'inherit', flexShrink: 0,
              boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
              transition: 'all 0.18s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none' }}
          >테스트 시작 →</button>
        </div>
      ) : (
        <div style={{
          background: diffMeta.bg, border: `1.5px solid ${diffMeta.border}`,
          borderRadius: 16, padding: '16px 24px', marginBottom: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>🤖</span>
            <div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 2 }}>AI 추천 난이도</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: diffMeta.color }}>{diffMeta.emoji} {diffMeta.label}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/learning/placement')}
            style={{
              background: 'none', border: `1px solid ${diffMeta.border}`, color: diffMeta.color,
              fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              padding: '7px 16px', borderRadius: 8, transition: 'all 0.15s',
            }}
          >재진단 →</button>
        </div>
      )}

      {/* 2-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'start' }}>

        {/* Subject grid */}
        <div style={{
          background: '#fff', borderRadius: 20,
          padding: '32px 36px',
          boxShadow: 'var(--shadow-sm)', border: '1.5px solid var(--border-light)',
        }}>
          <h2 style={{ fontWeight: 700, fontSize: 17, color: 'var(--text)', marginBottom: 20 }}>과목 선택</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {SUBJECTS.map((s) => {
              const active = subject === s.id
              return (
                <div
                  key={s.id}
                  onClick={() => setSubject(s.id)}
                  style={{
                    padding: '28px 16px', borderRadius: 16, textAlign: 'center', cursor: 'pointer',
                    border: `2px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                    background: active ? 'var(--primary-light)' : '#fff',
                    transition: 'all 0.18s ease',
                    transform: active ? 'translateY(-3px)' : 'none',
                    boxShadow: active ? '0 8px 24px rgba(124,106,240,0.22)' : 'var(--shadow-sm)',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.borderColor = 'var(--primary-border)'
                      e.currentTarget.style.transform = 'translateY(-3px)'
                      e.currentTarget.style.boxShadow = 'var(--shadow)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.borderColor = 'var(--border)'
                      e.currentTarget.style.transform = 'none'
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                    }
                  }}
                >
                  <div style={{ fontSize: 38, marginBottom: 10 }}>{s.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: active ? 'var(--primary)' : 'var(--text)', marginBottom: 5 }}>{s.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>{s.desc}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right panel: count + start */}
        <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Count picker */}
          <div style={{
            background: '#fff', borderRadius: 20,
            padding: '28px 28px',
            boxShadow: 'var(--shadow-sm)', border: '1.5px solid var(--border-light)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ fontWeight: 700, fontSize: 17, color: 'var(--text)' }}>문제 수</h2>
              {isFree && (
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
                  background: remaining === 0 ? '#fef2f2' : '#f0fdf4',
                  color: remaining === 0 ? '#ef4444' : '#16a34a',
                  border: `1px solid ${remaining === 0 ? '#fecaca' : '#bbf7d0'}`,
                }}>
                  오늘 {remaining === 0 ? '0' : `${remaining}`}문제 남음
                </span>
              )}
            </div>

            {remaining === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <p style={{ fontSize: 13, color: '#ef4444', fontWeight: 600, marginBottom: 8 }}>오늘 학습 한도를 모두 사용했습니다.</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>내일 다시 이용하거나 플랜을 업그레이드하세요.</p>
                <button
                  onClick={() => navigate('/subscription')}
                  style={{
                    padding: '8px 18px', borderRadius: 9, border: 'none',
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    color: '#fff', fontWeight: 700, fontSize: 13,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >플랜 업그레이드 →</button>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {COUNT_OPTIONS.map((n) => {
                    const disabled = isFree && n > remaining
                    return (
                      <button
                        key={n}
                        onClick={() => !disabled && setCount(n)}
                        style={{
                          height: 52, borderRadius: 12, fontWeight: 800,
                          fontSize: 16, fontFamily: 'inherit',
                          cursor: disabled ? 'not-allowed' : 'pointer',
                          border: `2px solid ${count === n ? 'var(--primary)' : 'var(--border)'}`,
                          background: disabled ? '#f9fafb' : count === n ? 'var(--primary)' : '#fff',
                          color: disabled ? '#d1d5db' : count === n ? '#fff' : 'var(--text-secondary)',
                          transition: 'all 0.15s',
                          boxShadow: count === n ? '0 4px 14px rgba(124,106,240,0.35)' : 'none',
                          transform: count === n ? 'scale(1.06)' : 'none',
                          opacity: disabled ? 0.5 : 1,
                        }}
                      >{n}</button>
                    )
                  })}
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 14, textAlign: 'center' }}>
                  {count}문제 · 약 {count}~{count * 2}분 소요
                </p>
              </>
            )}
          </div>

          {/* Difficulty picker */}
          <div style={{
            background: '#fff', borderRadius: 20,
            padding: '24px 24px',
            boxShadow: 'var(--shadow-sm)', border: '1.5px solid var(--border-light)',
          }}>
            <h2 style={{ fontWeight: 700, fontSize: 17, color: 'var(--text)', marginBottom: 14 }}>난이도</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(DIFFICULTY_META).map(([key, meta]) => {
                const active = difficulty === key
                return (
                  <button
                    key={key}
                    onClick={() => handleDifficultyChange(key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                      fontFamily: 'inherit', textAlign: 'left',
                      border: `2px solid ${active ? meta.color : 'var(--border)'}`,
                      background: active ? meta.bg : '#fff',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${active ? meta.color : '#d1d5db'}`,
                      background: active ? meta.color : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {active && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: active ? 700 : 500, color: active ? meta.color : 'var(--text-secondary)' }}>
                      {meta.emoji} {meta.label}
                    </span>
                    {placementDone && localStorage.getItem('placementDifficulty') === key && (
                      <span style={{ marginLeft: 'auto', fontSize: 10, color: meta.color, fontWeight: 600, background: meta.bg, border: `1px solid ${meta.border}`, borderRadius: 20, padding: '2px 7px' }}>
                        AI 추천
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Start button */}
          <button
            onClick={handleStart}
            disabled={!subject}
            style={{
              width: '100%', padding: '18px',
              background: subject
                ? 'linear-gradient(135deg, var(--primary), var(--accent))'
                : 'var(--border)',
              color: subject ? '#fff' : 'var(--text-muted)',
              border: 'none', borderRadius: 16,
              fontSize: 16, fontWeight: 800,
              cursor: subject ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit',
              boxShadow: subject ? '0 8px 28px rgba(124,106,240,0.35)' : 'none',
              transition: 'all 0.2s ease',
              transform: subject ? 'none' : 'none',
            }}
            onMouseEnter={(e) => { if (subject) e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none' }}
          >
            {subject ? `📚 ${subject} 학습 시작 →` : '과목을 선택해주세요'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default LearningPage
