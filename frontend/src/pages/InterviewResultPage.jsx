import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import * as interviewApi from '../api/interview'
import Button from '../components/Button'

function ScoreRing({ label, score, size = 80 }) {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444'
  const bg = score >= 80 ? '#f0fdf4' : score >= 60 ? '#fffbeb' : '#fef2f2'
  const deg = score * 3.6
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: size, height: size, borderRadius: '50%', margin: '0 auto 10px',
        background: `conic-gradient(${color} ${deg}deg, #e2e8f0 0deg)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 0 0 4px #fff, 0 0 0 5px ${color}20`,
      }}>
        <div style={{
          width: size - 18, height: size - 18, borderRadius: '50%',
          background: '#fff', display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexDirection: 'column',
        }}>
          <span style={{ fontSize: size / 4.5, fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
        </div>
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</p>
    </div>
  )
}

function FeedbackCard({ icon, title, content, accent }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: '20px',
      border: `1px solid ${accent}30`, marginBottom: 12,
      borderLeft: `3px solid ${accent}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <h3 style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{title}</h3>
      </div>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, fontSize: 14 }}>{content}</p>
    </div>
  )
}

function InterviewResultPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    interviewApi.getFeedback(id)
      .then(({ data }) => setFeedback(data.data.feedback))
      .catch(() => setFeedback({
        logicScore: 75, relevanceScore: 82, specificityScore: 68, overallScore: 75,
        weakPoints: '구체적인 수치나 사례가 부족했습니다.',
        improvements: '경험을 STAR 기법(상황-과제-행동-결과)으로 구체화해보세요.',
        recommendedAnswer: '저는 ~프로젝트에서 ~문제를 해결했습니다. 구체적으로는...',
      }))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-secondary)' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
        <p style={{ fontSize: 15 }}>피드백을 불러오는 중...</p>
      </div>
    )
  }

  const overall = feedback.overallScore
  const overallColor = overall >= 80 ? '#22c55e' : overall >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>면접 결과</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>AI 면접관의 종합 피드백입니다.</p>
      </div>

      {/* Overall score */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        borderRadius: 16, padding: '36px', textAlign: 'center', marginBottom: 20,
        color: '#fff', boxShadow: '0 8px 32px rgba(15,23,42,0.2)',
      }}>
        <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12, letterSpacing: '0.1em', fontWeight: 600 }}>OVERALL SCORE</p>
        <div style={{ fontSize: 72, fontWeight: 800, color: overallColor, lineHeight: 1, marginBottom: 6 }}>
          {overall}
        </div>
        <div style={{ fontSize: 16, color: '#64748b' }}>/ 100</div>
        <div style={{
          display: 'inline-block', marginTop: 14,
          background: `${overallColor}20`, color: overallColor,
          borderRadius: 20, padding: '5px 16px', fontSize: 13, fontWeight: 700,
        }}>
          {overall >= 80 ? '우수한 답변' : overall >= 60 ? '양호한 답변' : '개선이 필요합니다'}
        </div>
      </div>

      {/* Score breakdown */}
      <div style={{
        background: '#fff', borderRadius: 14, padding: '28px',
        boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)', marginBottom: 16,
      }}>
        <h2 style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 24 }}>항목별 점수</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <ScoreRing label="논리성" score={feedback.logicScore} />
          <ScoreRing label="적절성" score={feedback.relevanceScore} />
          <ScoreRing label="구체성" score={feedback.specificityScore} />
        </div>
      </div>

      {/* Feedback details */}
      <FeedbackCard icon="⚠️" title="부족한 부분" content={feedback.weakPoints} accent="#f59e0b" />
      <FeedbackCard icon="💡" title="개선 방향" content={feedback.improvements} accent="#4f46e5" />
      <FeedbackCard icon="✨" title="추천 답변 예시" content={feedback.recommendedAnswer} accent="#22c55e" />

      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <Button variant="ghost" onClick={() => navigate('/interview/setup')}>다시 면접하기</Button>
        <Button onClick={() => navigate('/dashboard')}>대시보드로 →</Button>
      </div>
    </div>
  )
}

export default InterviewResultPage
