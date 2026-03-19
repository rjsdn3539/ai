import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import * as learningApi from '../api/learning'
import Button from '../components/Button'
import useAuthStore from '../store/authStore'

const getDailyKey = () => `learningDaily_${new Date().toISOString().slice(0, 10)}`
const getDailyUsed = () => parseInt(localStorage.getItem(getDailyKey()) || '0', 10)
const addDailyUsed = (count) => {
  const key = getDailyKey()
  localStorage.setItem(key, getDailyUsed() + count)
}

function ResultSummary({ problems, results, subject, onRetry }) {
  const [tab, setTab] = useState('all')
  const navigate = useNavigate()

  const allItems = problems.map((p, i) => ({ ...p, ...(results[i] || {}) }))
  const score = allItems.filter(x => x.isCorrect).length
  const wrongCount = allItems.filter(x => !x.isCorrect).length
  const pct = Math.round(score / problems.length * 100)

  const displayed = tab === 'all' ? allItems
    : tab === 'correct' ? allItems.filter(x => x.isCorrect)
    : allItems.filter(x => !x.isCorrect)

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{
        background: '#fff', borderRadius: 18, padding: '36px',
        boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-light)',
        textAlign: 'center', marginBottom: 16,
      }}>
        <div style={{ fontSize: 48, marginBottom: 10 }}>🎓</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>학습 완료!</h2>
        <div style={{ fontSize: 52, fontWeight: 800, marginBottom: 4, color: pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444' }}>
          {pct}%
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
          {problems.length}문제 중 <strong style={{ color: '#22c55e' }}>{score}문제 정답</strong>
          &nbsp;·&nbsp;
          <strong style={{ color: '#ef4444' }}>{wrongCount}문제 오답</strong>
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {wrongCount > 0 && (
            <Button variant="subtle" onClick={() => navigate('/learning/wrong-notes')}>
              📒 오답노트 보기
            </Button>
          )}
          <Button variant="ghost" onClick={onRetry}>다시 학습</Button>
          <Button onClick={() => navigate('/dashboard')}>대시보드로 →</Button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {[
          { key: 'all', label: `전체 (${allItems.length})` },
          { key: 'correct', label: `✓ 정답 (${score})` },
          { key: 'wrong', label: `✕ 오답 (${wrongCount})` },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
            border: `1.5px solid ${tab === key ? '#4f46e5' : 'var(--border)'}`,
            background: tab === key ? '#4f46e5' : '#fff',
            color: tab === key ? '#fff' : 'var(--text-secondary)',
          }}>{label}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {displayed.map((item, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: 14, padding: '20px',
            boxShadow: 'var(--shadow-sm)',
            border: `1px solid ${item.isCorrect ? '#bbf7d0' : '#fecaca'}`,
            borderLeft: `4px solid ${item.isCorrect ? '#22c55e' : '#ef4444'}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', flex: 1, whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                {item.question}
              </p>
              <span style={{
                marginLeft: 12, flexShrink: 0, fontSize: 13, fontWeight: 700,
                color: item.isCorrect ? '#16a34a' : '#dc2626',
                background: item.isCorrect ? '#f0fdf4' : '#fef2f2',
                padding: '3px 10px', borderRadius: 20,
              }}>
                {item.isCorrect ? '✓ 정답' : '✕ 오답'}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: item.aiFeedback ? 10 : 0 }}>
              {!item.isCorrect && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: '#fef2f2', borderRadius: 8, padding: '8px 12px' }}>
                  <span style={{ color: '#ef4444', fontWeight: 700, flexShrink: 0, fontSize: 12 }}>✕ 내 답변</span>
                  <span style={{ fontSize: 13, color: '#991b1b' }}>{item.userAnswer || '(미선택)'}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: '#f0fdf4', borderRadius: 8, padding: '8px 12px' }}>
                <span style={{ color: '#22c55e', fontWeight: 700, flexShrink: 0, fontSize: 12 }}>✓ 정답</span>
                <span style={{ fontSize: 13, color: '#166534' }}>{item.answer}</span>
              </div>
            </div>
            {item.aiFeedback && (
              <div style={{ background: '#eef2ff', borderRadius: 8, padding: '10px 12px', border: '1px solid #c7d2fe' }}>
                <p style={{ fontSize: 11, color: '#4f46e5', fontWeight: 700, marginBottom: 4 }}>AI 해설</p>
                <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.7 }}>{item.aiFeedback}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function LearningSessionPage() {
  const { state } = useLocation()
  const navigate = useNavigate()

  const [problems, setProblems] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  // userAnswers: { [idx]: string } — 각 문제별 선택한 답
  const [userAnswers, setUserAnswers] = useState({})
  // results: { [idx]: {isCorrect, aiFeedback, userAnswer} } — 채점 결과
  const [results, setResults] = useState({})
  const [answer, setAnswer] = useState('') // 현재 문제 선택값
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [finished, setFinished] = useState(false)
  // 힌트: { [idx]: { text, loading } }
  const [hints, setHints] = useState({})

  useEffect(() => {
    if (!state) { navigate('/learning'); return }
    let cancelled = false
    learningApi.generateProblems({ subject: state.subject, difficulty: state.difficulty, count: state.count })
      .then(({ data }) => {
        if (cancelled) return
        const ps = data.data?.problems
        setProblems(ps?.length ? ps : mockProblems())
      })
      .catch(() => { if (!cancelled) setProblems(mockProblems()) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  // 문제 이동 시 이전 답변 복원
  useEffect(() => {
    setAnswer(userAnswers[currentIdx] || '')
  }, [currentIdx])

  const mockProblems = () => [
    { type: 'MULTIPLE', question: '다음 중 올바른 영어 문장은?', choices: ['I am a student', 'I is a student', 'I are a student', 'I be a student'], answer: 'I am a student', explanation: 'be 동사는 주어에 따라 am/is/are를 사용합니다.' },
  ]

  const problem = problems[currentIdx]
  const answeredCount = Object.keys(results).length
  const allAnswered = problems.length > 0 && answeredCount === problems.length
  const isLastProblem = currentIdx === problems.length - 1
  const hasResult = results[currentIdx] !== undefined
  const isModifying = hasResult && answer !== userAnswers[currentIdx]
  const hint = hints[currentIdx]

  const handleHint = async () => {
    if (hint?.text || hint?.loading) return
    setHints(prev => ({ ...prev, [currentIdx]: { loading: true } }))
    try {
      const { data } = await learningApi.getHint({
        question: problem.question,
        choices: problem.choices || [],
        subject: state?.subject || '',
        difficulty: state?.difficulty || 'MEDIUM',
      })
      setHints(prev => ({ ...prev, [currentIdx]: { text: data.data?.hint || data.hint || '힌트를 불러오지 못했습니다.' } }))
    } catch {
      setHints(prev => ({ ...prev, [currentIdx]: { text: '힌트를 불러오지 못했습니다.' } }))
    }
  }

  const handleSubmit = async () => {
    if (!answer) { alert('선택지를 골라주세요.'); return }
    setSubmitting(true)
    try {
      const { data } = await learningApi.submitAttempt({
        question: problem.question,
        correctAnswer: problem.answer,
        userAnswer: answer,
        explanation: problem.explanation,
      })
      const r = data.data || { isCorrect: answer === problem.answer, aiFeedback: problem.explanation }
      const result = { ...r, userAnswer: answer }
      setUserAnswers(prev => ({ ...prev, [currentIdx]: answer }))
      setResults(prev => ({ ...prev, [currentIdx]: result }))
      // 마지막 문제가 아니면 자동으로 다음 문제로
      if (!isLastProblem) {
        setCurrentIdx(i => i + 1)
      }
    } catch {
      const isCorrect = answer === problem.answer
      const result = { isCorrect, aiFeedback: problem.explanation, userAnswer: answer }
      setUserAnswers(prev => ({ ...prev, [currentIdx]: answer }))
      setResults(prev => ({ ...prev, [currentIdx]: result }))
      if (!isLastProblem) {
        setCurrentIdx(i => i + 1)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleFinish = () => {
    // 오답 저장
    const saveKey = `wrongNotes_saved_${state?.subject}_${problems.length}_${Date.now()}`
    const wrongItems = problems
      .map((p, i) => ({ ...p, ...(results[i] || {}) }))
      .filter(x => !x.isCorrect)
      .map(item => ({
        id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
        date: new Date().toISOString().slice(0, 10),
        subject: state?.subject || '',
        difficulty: state?.difficulty || '',
        question: item.question,
        type: item.type,
        choices: item.choices || [],
        answer: item.answer,
        userAnswer: item.userAnswer,
        aiFeedback: item.aiFeedback || '',
        explanation: item.explanation || '',
      }))
    if (wrongItems.length > 0) {
      const prev = JSON.parse(localStorage.getItem('wrongNotes') || '[]')
      localStorage.setItem('wrongNotes', JSON.stringify([...prev, ...wrongItems]))
    }
    // 오늘 푼 문제 수 누적
    addDailyUsed(Object.keys(results).length)
    setFinished(true)
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-secondary)' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚙️</div>
        <p style={{ fontSize: 15, fontWeight: 500 }}>AI가 문제를 생성하고 있습니다...</p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>잠시만 기다려주세요</p>
      </div>
    )
  }

  if (finished) {
    return (
      <ResultSummary
        problems={problems}
        results={results}
        subject={state?.subject}
        onRetry={() => navigate('/learning')}
      />
    )
  }

  if (!problem) return null

  const progress = problems.length > 0 ? Math.round((currentIdx + 1) / problems.length * 100) : 0

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {currentIdx > 0 && (
            <button
              onClick={() => setCurrentIdx(i => i - 1)}
              style={{
                background: 'var(--bg)', border: '1.5px solid var(--border)',
                borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 600,
                color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.color = '#4f46e5' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            >
              ← 이전
            </button>
          )}
          <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
            {state?.subject} 학습
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* 답한 문제 수 표시 */}
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {answeredCount}/{problems.length} 완료
          </span>
          <span style={{
            background: '#eef2ff', color: '#4f46e5',
            padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
          }}>
            {currentIdx + 1} / {problems.length}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 5, background: 'var(--border)', borderRadius: 99, marginBottom: 24, overflow: 'hidden' }}>
        <div style={{
          height: '100%', background: '#4f46e5', borderRadius: 99,
          width: `${progress}%`, transition: 'width 0.4s ease',
        }} />
      </div>

      {/* Question card */}
      <div style={{
        background: '#fff', borderRadius: 14, padding: '28px',
        boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)',
      }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, gap: 12 }}>
          <p style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.75, color: 'var(--text)', whiteSpace: 'pre-line', flex: 1, margin: 0 }}>
            {problem.question}
          </p>
          <button
            onClick={handleHint}
            disabled={hint?.loading || !!hint?.text}
            style={{
              flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
              padding: '7px 13px', borderRadius: 9, cursor: hint?.text ? 'default' : 'pointer',
              fontFamily: 'inherit', fontSize: 12, fontWeight: 700,
              border: `1.5px solid ${hint?.text ? '#fde68a' : '#e0e7ff'}`,
              background: hint?.text ? '#fffbeb' : hint?.loading ? '#f5f3ff' : '#eef2ff',
              color: hint?.text ? '#92400e' : hint?.loading ? '#7c3aed' : '#4f46e5',
              transition: 'all 0.15s',
              opacity: hint?.loading ? 0.7 : 1,
            }}
          >
            {hint?.loading ? '⏳ 생성 중...' : hint?.text ? '💡 힌트 확인됨' : '💡 힌트'}
          </button>
        </div>

        {/* 힌트 표시 */}
        {hint?.text && (
          <div style={{
            marginBottom: 18, padding: '12px 16px', borderRadius: 10,
            background: '#fffbeb', border: '1.5px solid #fde68a',
            display: 'flex', gap: 10, alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>힌트</p>
              <p style={{ fontSize: 13, color: '#78350f', lineHeight: 1.7 }}>{hint.text}</p>
            </div>
          </div>
        )}

        {/* Choices */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 24 }}>
          {(problem.choices || []).map((c, i) => {
            const selected = answer === c

            return (
              <button
                key={c}
                onClick={() => setAnswer(c)}
                style={{
                  padding: '13px 16px', borderRadius: 10, textAlign: 'left',
                  cursor: 'pointer', fontSize: 14, fontFamily: 'inherit',
                  border: `2px solid ${selected ? '#4f46e5' : 'var(--border)'}`,
                  background: selected ? '#eef2ff' : 'var(--bg)',
                  color: selected ? '#3730a3' : 'var(--text)',
                  fontWeight: selected ? 600 : 400,
                  transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 10,
                }}
                onMouseEnter={(e) => {
                  if (!selected) {
                    e.currentTarget.style.borderColor = '#a5b4fc'
                    e.currentTarget.style.background = '#f8f8ff'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selected) {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.background = 'var(--bg)'
                  }
                }}
              >
                <span style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  background: selected ? '#4f46e5' : 'var(--border-light)',
                  color: selected ? '#fff' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                }}>
                  {['①','②','③','④','⑤'][i]}
                </span>
                {c}
              </button>
            )
          })}
        </div>

        {/* Action buttons */}
        {isLastProblem ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* 마지막 문제 미제출 시 제출 버튼 */}
            {!hasResult || isModifying ? (
              <Button fullWidth size="lg" loading={submitting} onClick={handleSubmit} disabled={!answer}>
                {isModifying ? '수정하여 제출하기' : '제출하기'}
              </Button>
            ) : null}
            {/* 모든 문제 완료 시 결과 보기 버튼 */}
            {allAnswered && !isModifying && (
              <Button fullWidth size="lg" onClick={handleFinish}
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
              >
                🎓 결과 보기
              </Button>
            )}
            {!allAnswered && hasResult && !isModifying && (
              <div style={{
                padding: '12px 16px', borderRadius: 10,
                background: '#fffbeb', border: '1px solid #fde68a',
                fontSize: 13, color: '#92400e', textAlign: 'center',
              }}>
                ⚠️ 아직 {problems.length - answeredCount}문제를 풀지 않았어요. 이전 문제로 돌아가서 완료해주세요.
              </div>
            )}
          </div>
        ) : (
          <Button fullWidth size="lg" loading={submitting} onClick={handleSubmit} disabled={!answer}>
            {isModifying ? '수정하여 제출하기' : hasResult ? '다음 문제 →' : '제출하기'}
          </Button>
        )}
      </div>

      {/* 문제 퀵 네비게이션 */}
      {problems.length > 1 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 16, justifyContent: 'center' }}>
          {problems.map((_, i) => {
            const answered = results[i] !== undefined
            const isCurrent = i === currentIdx
            return (
              <button
                key={i}
                onClick={() => setCurrentIdx(i)}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  border: `2px solid ${isCurrent ? '#4f46e5' : answered ? '#0ea5e9' : 'var(--border)'}`,
                  background: isCurrent ? '#4f46e5' : answered ? '#e0f2fe' : '#fff',
                  color: isCurrent ? '#fff' : answered ? '#0369a1' : 'var(--text-muted)',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}
              >
                {i + 1}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default LearningSessionPage
