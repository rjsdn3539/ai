import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tooltip, ResponsiveContainer, Area, AreaChart, XAxis, YAxis, ReferenceLine } from 'recharts'
import useAuthStore from '../store/authStore'
import * as interviewApi from '../api/interview'
import * as subscriptionApi from '../api/subscription'

const MOCK_SESSIONS = [
  { id: 1, company: '카카오', position: '백엔드', overallScore: 65, endedAt: '2026-03-10' },
  { id: 2, company: '네이버', position: '프론트엔드', overallScore: 72, endedAt: '2026-03-13' },
  { id: 3, company: '라인', position: '풀스택', overallScore: 80, endedAt: '2026-03-16' },
]
const MOCK_CHART = [
  { date: '3/10', score: 65 }, { date: '3/13', score: 72 }, { date: '3/16', score: 80 },
]

// Mock AI coaching — in production this would come from the last session's feedback
const MOCK_COACHING = [
  {
    type: 'weak',
    icon: '💬',
    title: '답변이 추상적이에요',
    desc: '"노력했습니다" 같은 표현보다 구체적인 수치와 결과를 넣어보세요.',
    tip: 'STAR 기법: 상황 → 과제 → 행동 → 결과 순으로 구성하세요',
  },
  {
    type: 'weak',
    icon: '📌',
    title: '사례가 부족해요',
    desc: '직무 관련 경험을 구체적으로 2~3개 준비해두면 설득력이 높아집니다.',
    tip: '경험 키워드: 협업 / 문제해결 / 성과 / 리더십',
  },
]

const GOAL_SCORE = 85
const TIER_COLOR = { FREE: '#b3a99e', STANDARD: '#7c6af0', PRO: '#9b5de5', PREMIUM: '#e09420' }

function getPercentile(score) {
  if (!score) return null
  if (score >= 90) return 5
  if (score >= 80) return 20
  if (score >= 70) return 35
  if (score >= 60) return 52
  return 70
}

// ── Custom dot: last point is larger & glowing
function CustomDot(props) {
  const { cx, cy, index, data } = props
  if (index !== data.length - 1) {
    return <circle cx={cx} cy={cy} r={3.5} fill="#7c6af0" stroke="#fff" strokeWidth={2} />
  }
  return (
    <g>
      <circle cx={cx} cy={cy} r={10} fill="rgba(124,106,240,0.12)" />
      <circle cx={cx} cy={cy} r={6} fill="#7c6af0" stroke="#fff" strokeWidth={2.5} />
    </g>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', boxShadow: 'var(--shadow)' }}>
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 3 }}>{label}</p>
      <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>{payload[0].value}점</p>
    </div>
  )
}

function DashboardPage() {
  const { user } = useAuthStore()
  const [sessions, setSessions]     = useState([])
  const [chartData, setChartData]   = useState(MOCK_CHART)
  const [subStatus, setSubStatus]   = useState(null)
  const [hoveredRow, setHoveredRow] = useState(null)
  const [ctaHovered, setCtaHovered] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    subscriptionApi.getMySubscription().then(({ data }) => setSubStatus(data.data)).catch(() => {})
    interviewApi.getSessions()
      .then(({ data }) => {
        const list = data.data || []
        setSessions(list.slice(0, 5))
        if (list.length > 0) setChartData(list.map((s) => ({ date: s.endedAt?.slice(5), score: s.overallScore || 0 })))
      })
      .catch(() => setSessions(MOCK_SESSIONS))
  }, [])

  const tier        = subStatus?.tier || user?.subscriptionTier || 'FREE'
  const avgScore    = sessions.length > 0 ? Math.round(sessions.reduce((s, x) => s + (x.overallScore || 0), 0) / sessions.length) : null
  const latestScore = sessions.length > 0 ? sessions[sessions.length - 1]?.overallScore : null
  const prevScore   = sessions.length > 1 ? sessions[sessions.length - 2]?.overallScore : null
  const scoreTrend  = latestScore != null && prevScore != null ? latestScore - prevScore : null
  const percentile  = getPercentile(avgScore)
  const toGoal      = avgScore != null ? GOAL_SCORE - avgScore : null
  const goalPct     = avgScore != null ? Math.min(100, Math.round((avgScore / GOAL_SCORE) * 100)) : 0

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* ══ A. 인사 헤더 ══ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 3 }}>
            {new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>
            안녕하세요, {user?.name || '사용자'}님 👋
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {avgScore && percentile && (
            <div style={{
              background: '#fff', border: '1.5px solid var(--border)',
              borderRadius: 99, padding: '6px 14px',
              display: 'flex', alignItems: 'center', gap: 7,
              boxShadow: 'var(--shadow-sm)', fontSize: 13,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: avgScore >= 70 ? '#2da65e' : '#e09420', flexShrink: 0 }} />
              <span style={{ fontWeight: 700, color: 'var(--text)' }}>{avgScore}점</span>
              <span style={{ color: 'var(--accent)', fontWeight: 700 }}>상위 {percentile}%</span>
            </div>
          )}
          <div
            onClick={() => navigate('/subscription')}
            style={{
              background: 'var(--primary-light)', borderRadius: 99, padding: '6px 14px',
              fontSize: 12, fontWeight: 700, color: 'var(--primary)', cursor: 'pointer',
              border: '1.5px solid var(--primary-border)',
            }}
          >✦ {tier}</div>
        </div>
      </div>

      {/* ══ B. 메인 CTA ══ */}
      <div
        onMouseEnter={() => setCtaHovered(true)}
        onMouseLeave={() => setCtaHovered(false)}
        style={{
          borderRadius: 22, marginBottom: 18, overflow: 'hidden',
          boxShadow: ctaHovered ? '0 24px 64px rgba(91,72,232,0.38)' : '0 10px 36px rgba(91,72,232,0.24)',
          transform: ctaHovered ? 'translateY(-2px)' : 'none',
          transition: 'all 0.25s ease',
        }}
      >
        {/* Main area */}
        <div style={{
          background: 'linear-gradient(130deg, #4a38e0 0%, #7c6af0 50%, #0ea5e9 100%)',
          padding: '36px 44px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* bg shapes */}
          <div style={{ position: 'absolute', top: -60, right: 260, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -80, right: -10, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Status badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: 'rgba(255,255,255,0.15)', borderRadius: 99,
              padding: '5px 14px', marginBottom: 18,
              fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.95)',
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%', background: '#4ade80',
                boxShadow: '0 0 0 3px rgba(74,222,128,0.3)',
              }} />
              AI 면접관 대기 중
            </div>

            <h2 style={{ fontSize: 34, fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: 10 }}>
              지금 면접을<br />시작할까요?
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.72)', lineHeight: 1.65, marginBottom: 28, maxWidth: 360 }}>
              {sessions.length === 0
                ? 'AI가 실제 면접관처럼 질문하고 즉각적인 피드백을 드립니다. 첫 면접을 시작해보세요!'
                : scoreTrend != null && scoreTrend > 0
                  ? `지난 면접보다 ${scoreTrend}점 올랐어요. 이 기세로 오늘도 도전해보세요!`
                  : scoreTrend != null && scoreTrend < 0
                    ? `점수가 ${Math.abs(scoreTrend)}점 낮아졌어요. 오늘 다시 도전하면 분명 나아질 거예요.`
                    : 'AI가 답변을 분석하고 구체적인 개선 방향을 제시합니다.'
              }
            </p>

            {/* Primary button */}
            <button
              onClick={() => navigate('/interview/setup')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: '#fff', color: '#4a38e0',
                border: 'none', borderRadius: 14,
                padding: '17px 36px', fontSize: 17, fontWeight: 900,
                cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 8px 28px rgba(0,0,0,0.2)',
                transition: 'all 0.18s ease',
                transform: ctaHovered ? 'scale(1.04)' : 'none',
                letterSpacing: '-0.01em',
              }}
            >
              🚀 지금 면접 시작하기
            </button>
          </div>

          {/* Right icon */}
          <div style={{
            position: 'relative', zIndex: 1, flexShrink: 0,
            width: 110, height: 110, borderRadius: '50%',
            background: 'rgba(255,255,255,0.13)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 50,
            boxShadow: '0 0 0 14px rgba(255,255,255,0.05), 0 0 0 28px rgba(255,255,255,0.025)',
          }}>🎤</div>
        </div>

        {/* Sub-action bar */}
        <div style={{
          background: '#2a2250',
          padding: '12px 44px',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginRight: 6 }}>다른 선택지</span>
          {[
            { label: '📚 학습하기', path: '/learning' },
            { label: '📊 최근 결과 보기', path: sessions.length > 0 ? `/interview/result/${sessions[sessions.length - 1]?.id}` : '/interview/setup' },
          ].map(({ label, path }) => (
            <button key={label} onClick={() => navigate(path)}
              style={{
                background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.65)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                padding: '6px 14px', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.13)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)' }}
            >{label}</button>
          ))}
        </div>
      </div>

      {/* ══ C. 목표 진행 바 ══ */}
      {avgScore != null && (
        <div style={{
          background: '#fff', borderRadius: 16, padding: '20px 24px', marginBottom: 16,
          border: '1.5px solid var(--border-light)', boxShadow: 'var(--shadow-sm)',
          display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 20,
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>목표 달성도</span>
                <span style={{
                  background: 'var(--primary-light)', color: 'var(--primary)',
                  fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 99,
                }}>목표 {GOAL_SCORE}점</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: toGoal <= 0 ? '#2da65e' : 'var(--text)' }}>
                {toGoal <= 0 ? '🎉 목표 달성!' : `+${toGoal}점 남았어요`}
              </span>
            </div>
            {/* Progress bar */}
            <div style={{ height: 10, background: 'var(--bg-warm)', borderRadius: 99, overflow: 'hidden', position: 'relative' }}>
              <div style={{
                height: '100%', borderRadius: 99,
                background: goalPct >= 100
                  ? 'linear-gradient(90deg, #2da65e, #4ade80)'
                  : 'linear-gradient(90deg, var(--primary), var(--accent))',
                width: `${goalPct}%`,
                transition: 'width 0.8s ease',
                boxShadow: '0 2px 6px rgba(124,106,240,0.4)',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>현재 평균 {avgScore}점</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{GOAL_SCORE}점 ({goalPct}%)</span>
            </div>
          </div>
          {/* Trend badge */}
          {scoreTrend != null && (
            <div style={{
              background: scoreTrend > 0 ? '#f0fdf4' : scoreTrend < 0 ? '#fef2f2' : '#f5f0eb',
              border: `1.5px solid ${scoreTrend > 0 ? '#bbf7d0' : scoreTrend < 0 ? '#fecaca' : '#e9e4db'}`,
              borderRadius: 14, padding: '12px 18px', textAlign: 'center', flexShrink: 0,
            }}>
              <p style={{ fontSize: 24, fontWeight: 900, color: scoreTrend > 0 ? '#2da65e' : scoreTrend < 0 ? '#e05252' : '#7c7068', lineHeight: 1 }}>
                {scoreTrend > 0 ? '▲' : scoreTrend < 0 ? '▼' : '='} {scoreTrend > 0 ? '+' : ''}{scoreTrend}점
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>지난 면접 대비</p>
            </div>
          )}
        </div>
      )}

      {/* ══ D+E. AI 코칭 + 성장 요약 ══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14, marginBottom: 16 }}>

        {/* D. AI 코칭 카드 */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: '22px 24px',
          border: '1.5px solid var(--border-light)', boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, var(--primary-light), #e0f6ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
            }}>🤖</div>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>AI 코칭 리포트</h3>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>최근 면접 분석 기반</p>
            </div>
            <span style={{
              marginLeft: 'auto', fontSize: 10, fontWeight: 700,
              background: '#fff0f0', color: '#e05252',
              padding: '3px 9px', borderRadius: 99, border: '1px solid #fecaca',
            }}>개선 필요 2가지</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {MOCK_COACHING.map((item, i) => (
              <div key={i} style={{
                background: 'var(--bg)', borderRadius: 12, padding: '14px 16px',
                border: '1px solid var(--border-light)',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{item.title}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 8 }}>{item.desc}</p>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      background: 'var(--primary-light)', borderRadius: 7, padding: '5px 10px',
                    }}>
                      <span style={{ fontSize: 10 }}>💡</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--primary)' }}>{item.tip}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/interview/setup')}
            style={{
              width: '100%', marginTop: 14, padding: '11px',
              background: 'var(--primary-light)', color: 'var(--primary)',
              border: '1.5px solid var(--primary-border)', borderRadius: 10,
              fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--primary-light)'; e.currentTarget.style.color = 'var(--primary)' }}
          >
            이 피드백 반영해서 다시 도전 →
          </button>
        </div>

        {/* E. 성장 요약 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Growth card */}
          <div style={{
            background: scoreTrend != null && scoreTrend > 0
              ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
              : '#fff',
            borderRadius: 16, padding: '20px 22px', flex: 1,
            border: `1.5px solid ${scoreTrend != null && scoreTrend > 0 ? '#bbf7d0' : 'var(--border-light)'}`,
            boxShadow: 'var(--shadow-sm)',
          }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 10 }}>성장 지표</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>지난 면접 대비</p>
                <p style={{ fontSize: 26, fontWeight: 900, color: scoreTrend != null && scoreTrend > 0 ? '#2da65e' : scoreTrend != null && scoreTrend < 0 ? '#e05252' : 'var(--text)' }}>
                  {scoreTrend != null
                    ? `${scoreTrend > 0 ? '▲ +' : scoreTrend < 0 ? '▼ ' : ''}${scoreTrend}점`
                    : sessions.length === 0 ? '—' : '첫 기록'
                  }
                </p>
                {scoreTrend != null && (
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {latestScore}점 → {latestScore}점
                  </p>
                )}
              </div>
              <div style={{ height: 1, background: 'var(--border-light)' }} />
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>전체 랭킹</p>
                <p style={{ fontSize: 26, fontWeight: 900, color: 'var(--accent)' }}>
                  {percentile ? `상위 ${percentile}%` : '—'}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {percentile ? '꾸준히 상위권에 있어요' : '면접 후 집계됩니다'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick stat: total */}
          <div style={{
            background: '#fff', borderRadius: 16, padding: '16px 22px',
            border: '1.5px solid var(--border-light)', boxShadow: 'var(--shadow-sm)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>총 면접 횟수</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>{sessions.length}회</p>
            </div>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'var(--primary-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
            }}>🎯</div>
          </div>
        </div>
      </div>

      {/* ══ F. 차트 + 기록 ══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 14 }}>

        {/* Chart */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '22px 24px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>점수 추이</h3>
              {scoreTrend != null && (
                <p style={{ fontSize: 12, color: scoreTrend > 0 ? '#2da65e' : '#e05252' }}>
                  {scoreTrend > 0 ? `▲ +${scoreTrend}점 상승 중` : `▼ ${scoreTrend}점 하락`}
                </p>
              )}
            </div>
            {latestScore && (
              <div style={{
                background: 'var(--primary-light)', borderRadius: 10, padding: '6px 12px', textAlign: 'right',
              }}>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 1 }}>최근</p>
                <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary)' }}>{latestScore}점</p>
              </div>
            )}
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={chartData} margin={{ top: 10, right: 4, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c6af0" stopOpacity={0.16} />
                  <stop offset="95%" stopColor="#7c6af0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis domain={[40, 100]} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={26} />
              <Tooltip content={<CustomTooltip />} />
              {/* Goal line */}
              <ReferenceLine y={GOAL_SCORE} stroke="#7c6af0" strokeDasharray="4 3" strokeOpacity={0.4}
                label={{ value: `목표 ${GOAL_SCORE}`, position: 'right', fontSize: 10, fill: '#7c6af0' }} />
              <Area
                type="monotone" dataKey="score"
                stroke="var(--primary)" strokeWidth={2.5}
                fill="url(#scoreGrad)"
                dot={(props) => <CustomDot {...props} data={chartData} />}
                activeDot={{ r: 6, fill: 'var(--primary)', strokeWidth: 2, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent interviews */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '22px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>최근 면접 기록</h3>
            <button onClick={() => navigate('/interview/setup')}
              style={{
                background: 'none', border: 'none', color: 'var(--primary)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                padding: '3px 9px', borderRadius: 6, transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-light)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >+ 새 면접</button>
          </div>
          {sessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🎤</div>
              <p style={{ fontSize: 13 }}>아직 면접 기록이 없어요</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>첫 면접을 시작해보세요!</p>
            </div>
          ) : sessions.map((s, i) => (
            <div key={s.id}
              onClick={() => navigate(`/interview/result/${s.id}`)}
              onMouseEnter={() => setHoveredRow(s.id)}
              onMouseLeave={() => setHoveredRow(null)}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '9px 8px', cursor: 'pointer',
                borderBottom: i < sessions.length - 1 ? '1px solid var(--border-light)' : 'none',
                borderRadius: 8, margin: '0 -8px',
                background: hoveredRow === s.id ? 'var(--bg)' : 'transparent',
                transition: 'background 0.15s',
              }}
            >
              <div>
                <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', marginBottom: 1 }}>{s.company}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.position} · {s.endedAt}</p>
              </div>
              <span style={{
                fontSize: 15, fontWeight: 800,
                color: s.overallScore >= 80 ? '#2da65e' : s.overallScore >= 60 ? '#e09420' : '#e05252',
              }}>{s.overallScore}<span style={{ fontSize: 10, fontWeight: 400, color: 'var(--text-muted)' }}>점</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
