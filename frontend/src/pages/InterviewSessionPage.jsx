import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import * as interviewApi from '../api/interview'
import Button from '../components/Button'

function InterviewSessionPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const sessionId = state?.sessionId

  const [question, setQuestion] = useState('')
  const [questionId, setQuestionId] = useState(null)
  const [questionNum, setQuestionNum] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [answerText, setAnswerText] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!sessionId) { navigate('/interview/setup'); return }
    loadNextQuestion()
  }, [])

  useEffect(() => {
    if (question) speakQuestion(question)
  }, [question])

  const loadNextQuestion = async () => {
    try {
      const { data } = await interviewApi.getSession(sessionId)
      const questions = data.data?.questions || []
      const pending = questions.find((q) => !q.answer)
      if (pending) {
        setQuestion(pending.questionText)
        setQuestionId(pending.id)
        setQuestionNum(pending.sequenceNumber || questions.indexOf(pending) + 1)
      } else {
        // 모든 질문에 답변 완료
        setDone(true)
        await interviewApi.endSession(sessionId)
      }
    } catch {
      setQuestion('자기소개 부탁드립니다.')
    }
  }

  const speakQuestion = (text) => {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'ko-KR'
    window.speechSynthesis.speak(utterance)
  }

  const handleSubmit = async () => {
    if (!answerText.trim()) { alert('답변을 입력하세요.'); return }
    setSubmitting(true)
    try {
      await interviewApi.submitAnswer(sessionId, {
        questionId,
        answerText: answerText.trim(),
      })
      setAnswerText('')
      await loadNextQuestion()
    } catch {
      alert('답변 제출에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }



  if (done) {
    return (
      <div style={{ maxWidth: 520, margin: '80px auto', textAlign: 'center' }}>
        <div style={{
          background: '#fff', borderRadius: 20, padding: '52px 40px',
          boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-light)',
        }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>면접 완료!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 14 }}>
            AI가 답변을 분석하고 있습니다. 잠시 후 피드백을 확인하세요.
          </p>
          <Button fullWidth size="lg" onClick={() => navigate(`/interview/result/${sessionId}`)}>
            피드백 보기 →
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>AI 모의 면접</h1>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: n < questionNum ? '#4f46e5' : n === questionNum ? '#7c3aed' : '#e2e8f0',
              transition: 'all 0.3s',
            }} />
          ))}
          <span style={{
            marginLeft: 8, background: '#eef2ff', color: '#4f46e5',
            padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
          }}>
            {questionNum} / 5
          </span>
        </div>
      </div>

      {/* Question card */}
      <div style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        borderRadius: 16, padding: '32px', marginBottom: 16, color: '#fff',
        boxShadow: '0 8px 32px rgba(79,70,229,0.3)',
      }}>
        <p style={{ fontSize: 11, opacity: 0.65, marginBottom: 14, letterSpacing: '0.15em', fontWeight: 600 }}>
          QUESTION {questionNum}
        </p>
        <p style={{ fontSize: 19, lineHeight: 1.75, fontWeight: 500 }}>
          {question || '질문을 불러오는 중...'}
        </p>
        <button
          onClick={() => speakQuestion(question)}
          style={{
            marginTop: 18, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 7, padding: '7px 14px', color: '#fff', fontSize: 12, fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit',
          }}
        >
          🔊 다시 듣기
        </button>
      </div>

      {/* Answer text input card */}
      <div style={{
        background: '#fff', borderRadius: 16, padding: '32px',
        boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)',
      }}>
        <textarea
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          placeholder="답변을 입력하세요..."
          rows={6}
          style={{
            width: '100%', padding: '14px 16px', fontSize: 15, lineHeight: 1.7,
            border: '1.5px solid var(--border-light)', borderRadius: 12,
            resize: 'vertical', fontFamily: 'inherit', outline: 'none',
            transition: 'border-color 0.2s',
            boxSizing: 'border-box',
          }}
          onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
          onBlur={(e) => e.target.style.borderColor = ''}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {answerText.length} / 5,000자
          </span>
          <Button loading={submitting} onClick={handleSubmit} disabled={!answerText.trim()}>
            답변 제출 →
          </Button>
        </div>
      </div>
    </div>
  )
}

export default InterviewSessionPage
