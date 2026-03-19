import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import * as interviewApi from '../api/interview'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 6)  return { text: '밤늦게도 열심이시네요', sub: '꾸준함이 합격을 만들어요' }
  if (h < 12) return { text: '좋은 아침이에요', sub: '오늘 면접 연습으로 하루를 시작해봐요' }
  if (h < 18) return { text: '오늘 하루도 파이팅', sub: '잠깐 연습하면 실력이 쌓여요' }
  return             { text: '저녁 시간에도 열심이네요', sub: '오늘의 마지막 연습, 해볼까요?' }
}

const AI_TIPS = [
  { tag: 'STAR 기법', text: '상황 → 과제 → 행동 → 결과 순서로 답변을 구성하면 면접관의 신뢰를 얻을 수 있습니다.' },
  { tag: '자기소개', text: '"저는 ~를 잘합니다"보다 "저는 ~를 통해 ~를 이뤄냈습니다"로 성과 중심으로 말해보세요.' },
  { tag: '모르는 질문', text: '"없습니다", "모르겠습니다"는 금물. "현재 배우고 있습니다"로 전환하는 습관을 들이세요.' },
  { tag: '두괄식 답변', text: '결론부터 말하고 이유를 설명하면 논리적이고 명확한 인상을 남깁니다.' },
]

function HomePage() {
  const { user, accessToken } = useAuthStore()
  const navigate  = useNavigate()
  const [sessions, setSessions]     = useState([])
  const [ctaHovered, setCtaHovered] = useState(false)
  const [hoveredRow, setHoveredRow] = useState(null)
  const greeting = getGreeting()
  const tip = AI_TIPS[new Date().getDate() % AI_TIPS.length]

  useEffect(() => {
    if (!accessToken) return
    interviewApi.getSessions()
      .then(({ data }) => setSessions(data.data?.slice(0, 4) || []))
      .catch(() => { setSessions([]) })
  }, [accessToken])

  const latestScore = sessions.length > 0 ? sessions[sessions.length - 1]?.overallScore : null
  const prevScore   = sessions.length > 1 ? sessions[sessions.length - 2]?.overallScore : null
  const scoreTrend  = latestScore != null && prevScore != null ? latestScore - prevScore : null
  const avgScore    = sessions.length > 0
    ? Math.round(sessions.reduce((s, x) => s + (x.overallScore || 0), 0) / sessions.length)
    : null

  const handleCtaClick = () => navigate(accessToken ? '/interview/setup' : '/auth/login')

  return (
    <div style={{ width: '100%' }}>

      {/* ── 헤더 ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 5 }}>
            {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </p>
          {accessToken ? (
            <>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', lineHeight: 1.3 }}>
                {user?.name}님, {greeting.text} 👋
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>{greeting.sub}</p>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', lineHeight: 1.3 }}>
                AI 면접 플랫폼에 오신 걸 환영해요 👋
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
                로그인하고 AI와 함께 실전 면접을 준비해보세요
              </p>
            </>
          )}
        </div>
        {accessToken && avgScore && (
          <div style={{
            background: '#fff', border: '1.5px solid var(--border)',
            borderRadius: 16, padding: '14px 24px', textAlign: 'right',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 3 }}>내 평균 점수</p>
            <p style={{ fontSize: 28, fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>{avgScore}점</p>
            {scoreTrend != null && (
              <p style={{ fontSize: 12, fontWeight: 700, color: scoreTrend > 0 ? '#2da65e' : '#e05252', marginTop: 5 }}>
                {scoreTrend > 0 ? `▲ +${scoreTrend}` : `▼ ${scoreTrend}`}점 (지난 면접比)
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── 메인 2컬럼 ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* 왼쪽: CTA */}
        <div
          onMouseEnter={() => setCtaHovered(true)}
          onMouseLeave={() => setCtaHovered(false)}
          onClick={handleCtaClick}
          style={{
            borderRadius: 22, overflow: 'hidden', cursor: 'pointer',
            boxShadow: ctaHovered ? '0 24px 60px rgba(61,46,224,0.4)' : '0 10px 36px rgba(61,46,224,0.24)',
            transform: ctaHovered ? 'translateY(-3px)' : 'none',
            transition: 'all 0.28s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          {/* Gradient body */}
          <div style={{
            background: 'linear-gradient(130deg, #3d2ee0 0%, #7c6af0 52%, #0ea5e9 100%)',
            padding: '38px 40px 34px',
            position: 'relative', overflow: 'hidden',
            minHeight: 300,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div style={{ position: 'absolute', top: -60, right: -20, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.055)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -80, left: 60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Live badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)',
                borderRadius: 99, padding: '6px 14px', marginBottom: 22,
                border: '1px solid rgba(255,255,255,0.22)',
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 0 3px rgba(74,222,128,0.3)', animation: 'blink 2s ease infinite', flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.95)' }}>AI 면접관 대기 중</span>
              </div>

              <h2 style={{ fontSize: 36, fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: 14, letterSpacing: '-0.02em' }}>
                지금 면접을<br />시작할까요?
              </h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.75, marginBottom: 0, maxWidth: 360 }}>
                {latestScore
                  ? `지난 면접 ${latestScore}점, 오늘은 더 높이 갈 수 있어요.`
                  : 'AI가 실제 면접관처럼 질문하고, 답변을 분석해 구체적인 피드백을 드립니다.'}
              </p>
            </div>

            {/* Bottom: button + mic */}
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 28 }}>
              <button
                onClick={(e) => { e.stopPropagation(); handleCtaClick() }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  background: '#fff', color: '#3d2ee0',
                  border: 'none', borderRadius: 14, padding: '15px 32px',
                  fontSize: 16, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: '0 8px 28px rgba(0,0,0,0.22)',
                  transition: 'transform 0.18s ease',
                  transform: ctaHovered ? 'scale(1.05)' : 'none',
                }}
              >
                {accessToken ? '🚀 지금 시작하기' : '🔑 로그인하고 시작하기'}
              </button>

              <div style={{
                width: 86, height: 86, borderRadius: '50%',
                background: 'rgba(255,255,255,0.12)',
                border: '2px solid rgba(255,255,255,0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 40,
                boxShadow: '0 0 0 12px rgba(255,255,255,0.05), 0 0 0 24px rgba(255,255,255,0.025)',
              }}>🎤</div>
            </div>
          </div>

          {/* Stats strip */}
          <div style={{ background: '#231c5a', padding: '14px 40px', display: 'flex', gap: 24, alignItems: 'center' }}>
            {(accessToken ? [
              { label: '총 면접', value: `${sessions.length}회` },
              ...(latestScore != null ? [{ label: '최근 점수', value: `${latestScore}점` }] : []),
              ...(scoreTrend != null ? [{ label: '추세', value: scoreTrend > 0 ? `▲ +${scoreTrend}점` : scoreTrend < 0 ? `▼ ${scoreTrend}점` : '= 유지', color: scoreTrend > 0 ? '#4ade80' : scoreTrend < 0 ? '#f87171' : '#94a3b8' }] : []),
              ...(avgScore ? [{ label: '평균', value: `${avgScore}점`, color: '#7dd3fc' }] : []),
            ] : [
              { label: '누적 면접 횟수', value: '무제한' },
              { label: 'AI 피드백', value: '실시간' },
              { label: '분석 항목', value: '10가지+' },
            ]).map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{label}</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: color || 'rgba(255,255,255,0.9)' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 오른쪽: 최근 기록 */}
        <div style={{
          background: '#fff', borderRadius: 22,
          border: '1.5px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '22px 24px 16px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>최근 면접 기록</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                {!accessToken ? '로그인 후 확인 가능' : sessions.length > 0 ? `총 ${sessions.length}회 완료` : '아직 기록이 없어요'}
              </p>
            </div>
            {accessToken && (
              <button onClick={() => navigate('/dashboard')}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', padding: '4px 10px', borderRadius: 7, transition: 'background 0.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-light)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >전체 보기 →</button>
            )}
          </div>

          <div style={{ flex: 1, padding: '10px 16px' }}>
            {!accessToken ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px 0' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', marginBottom: 16,
                  background: 'var(--bg-warm)', border: '1.5px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
                }}>🔒</div>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>로그인이 필요해요</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.65 }}>
                  면접 기록은 로그인 후<br />확인하실 수 있어요
                </p>
                <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                  <button onClick={() => navigate('/auth/login')}
                    style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    로그인
                  </button>
                  <button onClick={() => navigate('/auth/register')}
                    style={{ background: 'transparent', color: 'var(--primary)', border: '1.5px solid var(--primary-border)', borderRadius: 10, padding: '10px 22px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    회원가입
                  </button>
                </div>
              </div>
            ) : sessions.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 44, marginBottom: 14 }}>🎤</div>
                <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>첫 면접을 시작해보세요</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>AI가 실전처럼 질문하고<br />상세한 피드백을 드려요</p>
                <button onClick={() => navigate('/interview/setup')}
                  style={{ marginTop: 20, background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  시작하기 →
                </button>
              </div>
            ) : sessions.map((s, i) => (
              <div key={s.id}
                onClick={() => navigate(`/interview/result/${s.id}`)}
                onMouseEnter={() => setHoveredRow(s.id)}
                onMouseLeave={() => setHoveredRow(null)}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '13px 10px', borderRadius: 12, cursor: 'pointer',
                  background: hoveredRow === s.id ? 'var(--bg)' : 'transparent',
                  borderBottom: i < sessions.length - 1 ? '1px solid var(--border-light)' : 'none',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: 'var(--bg-warm)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 800, color: 'var(--text-secondary)',
                  }}>
                    {s.company?.[0] || '?'}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>{s.company}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.position} · {s.endedAt}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: 20, fontWeight: 900, lineHeight: 1,
                    color: s.overallScore >= 80 ? '#2da65e' : s.overallScore >= 60 ? '#e09420' : '#e05252',
                  }}>{s.overallScore}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>점</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 하단 3컬럼 ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>

        {/* AI 코칭 팁 */}
        <div style={{
          background: '#fff', borderRadius: 20,
          border: '1.5px solid var(--primary-border)',
          padding: '22px 24px',
          boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden',
          gridColumn: 'span 2',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, var(--primary), var(--accent))' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 13, flexShrink: 0,
              background: 'linear-gradient(135deg, var(--primary-light), #e0f6ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
              border: '1px solid var(--primary-border)',
            }}>🤖</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>AI 오늘의 코칭 팁</span>
                <span style={{ fontSize: 11, fontWeight: 700, background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 9px', borderRadius: 99 }}>{tip.tag}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg)', padding: '2px 8px', borderRadius: 99, border: '1px solid var(--border)', marginLeft: 'auto' }}>
                  {new Date().toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.75 }}>💡 {tip.text}</p>
            </div>
          </div>
          <button onClick={handleCtaClick}
            style={{
              marginTop: 16, width: '100%', background: 'var(--primary)', color: '#fff',
              border: 'none', borderRadius: 11, padding: '12px',
              fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary)'}
          >
            {accessToken ? '이 팁 적용해서 면접 연습하기 →' : '로그인하고 면접 연습하기 →'}
          </button>
        </div>

        {/* 빠른 메뉴 카드 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { icon: '📚', label: 'AI 학습', desc: '맞춤 문제로 지식 쌓기', path: '/learning', bg: 'linear-gradient(135deg,#f4f2fd,#ede8fb)', border: 'var(--primary-border)' },
            { icon: '🛍', label: '도서 스토어', desc: '취업 도서 구경하기', path: '/books', bg: '#fff', border: 'var(--border-light)' },
            { icon: '📊', label: '내 통계', desc: '점수 추이 분석', path: accessToken ? '/dashboard' : '/auth/login', bg: 'linear-gradient(135deg,#e0f6ff,#c8edfc)', border: 'var(--accent-border)' },
          ].map(({ icon, label, desc, path, bg, border }) => (
            <div key={path} onClick={() => navigate(path)}
              style={{
                background: bg, borderRadius: 14, padding: '14px 18px', cursor: 'pointer',
                border: `1.5px solid ${border}`, flex: 1,
                display: 'flex', alignItems: 'center', gap: 14,
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <span style={{ fontSize: 24 }}>{icon}</span>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{label}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{desc}</p>
              </div>
              <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 16 }}>›</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HomePage
