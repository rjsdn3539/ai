import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import * as subscriptionApi from '../api/subscription'

const PLANS = [
  {
    tier: 'FREE', name: '무료', monthlyPrice: 0, yearlyPrice: 0,
    color: '#64748b', accentBg: '#f1f5f9',
    features: ['면접 월 1회', '학습 퀴즈 일 20문제', '피드백 요약 제공', '프로필 문서 각 1개', '도서 구매 가능'],
    icon: '🌱',
  },
  {
    tier: 'STANDARD', name: 'Standard', monthlyPrice: 9900, yearlyPrice: 99000,
    color: '#4f46e5', accentBg: '#eef2ff',
    badge: null,
    features: ['면접 월 10회', '질문 수 최대 3개', 'AI 피드백 전체 제공', '학습 퀴즈 무제한', '면접 기록 3개월 보관', '프로필 문서 각 3개'],
    icon: '⚡',
  },
  {
    tier: 'PRO', name: 'Pro', monthlyPrice: 19900, yearlyPrice: 189000,
    color: '#7c3aed', accentBg: '#f5f3ff',
    badge: '인기',
    features: ['면접 무제한', '질문 수 최대 10개', '맞춤형 AI 질문', '면접 기록 무기한', '프로필 문서 무제한', '성과 분석 리포트', '도서 5% 할인'],
    icon: '🚀',
  },
  {
    tier: 'PREMIUM', name: 'Premium', monthlyPrice: 39900, yearlyPrice: 359000,
    color: '#b45309', accentBg: '#fffbeb',
    badge: '프리미엄',
    features: ['Pro 모든 기능', '음성 발음 분석', '모범 답안 제공', '면접 음성 다운로드', '도서 10% 할인', '우선 고객 지원'],
    icon: '👑',
  },
]

const TIER_ORDER = { FREE: 0, STANDARD: 1, PRO: 2, PREMIUM: 3 }

function SubscriptionPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [billing, setBilling] = useState('monthly')
  const [status, setStatus] = useState(null)

  useEffect(() => {
    subscriptionApi.getMySubscription()
      .then(({ data }) => setStatus(data.data))
      .catch(() => {})
  }, [])

  const currentTier = status?.tier || user?.subscriptionTier || 'FREE'

  const handleUpgradeClick = (plan) => {
    const price = billing === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice
    const periodLabel = billing === 'monthly' ? '월간' : '연간'
    navigate('/payment', {
      state: {
        orderName: `${plan.name} ${periodLabel} 구독`,
        totalAmount: price,
        type: 'subscription',
        planName: plan.name,
        planTier: plan.tier,
        billing,
        backTo: '/subscription',
      },
    })
  }

  const getDiscountPct = (plan) => {
    if (!plan.monthlyPrice) return null
    return Math.round((1 - plan.yearlyPrice / (plan.monthlyPrice * 12)) * 100)
  }

  const formatPrice = (p) => p === 0 ? '무료' : p.toLocaleString('ko-KR') + '원'

  return (
    <div style={{ maxWidth: 940, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>구독 플랜</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          현재 플랜:{' '}
          <strong style={{ color: '#4f46e5' }}>{currentTier}</strong>
          {status?.expiresAt && (
            <span style={{ color: 'var(--text-muted)', marginLeft: 8, fontSize: 13 }}>
              (~{new Date(status.expiresAt).toLocaleDateString('ko-KR')} 까지)
            </span>
          )}
        </p>
      </div>

      {/* Usage info */}
      {status && currentTier !== 'FREE' && (
        <div style={{
          background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 12,
          padding: '13px 18px', marginBottom: 28, fontSize: 14, color: '#3730a3',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>📊</span>
          이번 달 면접 {status.usedInterviewsThisMonth}회 사용
          {status.monthlyInterviewLimit !== -1 && ` / ${status.monthlyInterviewLimit}회`}
          {status.remainingInterviews !== -1 && ` (${status.remainingInterviews}회 남음)`}
        </div>
      )}

      {/* Billing toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
        <div style={{
          display: 'flex', background: 'var(--bg)', borderRadius: 10,
          padding: 4, border: '1px solid var(--border)',
        }}>
          {[
            { key: 'monthly', label: '월간 결제' },
            { key: 'yearly', label: '연간 결제', badge: '최대 17% 할인' },
          ].map(({ key, label, badge }) => (
            <button
              key={key}
              onClick={() => setBilling(key)}
              style={{
                padding: '8px 20px', borderRadius: 7, border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: 13, fontFamily: 'inherit', transition: 'all 0.15s',
                background: billing === key ? '#fff' : 'transparent',
                color: billing === key ? 'var(--text)' : 'var(--text-muted)',
                boxShadow: billing === key ? 'var(--shadow-sm)' : 'none',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              {label}
              {badge && billing !== key && (
                <span style={{ background: '#dcfce7', color: '#166534', borderRadius: 20, padding: '2px 8px', fontSize: 11 }}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Plan cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
        {PLANS.map((plan) => {
          const isCurrent = plan.tier === currentTier
          const isUpgrade = TIER_ORDER[plan.tier] > TIER_ORDER[currentTier]
          const price = billing === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice
          const discount = billing === 'yearly' ? getDiscountPct(plan) : null

          return (
            <div
              key={plan.tier}
              style={{
                background: '#fff', borderRadius: 16,
                padding: isCurrent ? '26px 22px' : '24px 22px',
                boxShadow: isCurrent ? `0 0 0 2px ${plan.color}, var(--shadow)` : 'var(--shadow-sm)',
                border: isCurrent ? 'none' : '1px solid var(--border-light)',
                position: 'relative', display: 'flex', flexDirection: 'column',
                transition: 'all 0.2s',
              }}
            >
              {/* Popular/Premium badge */}
              {plan.badge && (
                <div style={{
                  position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)',
                  background: plan.color, color: '#fff',
                  borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}>
                  {plan.badge}
                </div>
              )}

              {isCurrent && (
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  background: plan.color + '20', color: plan.color,
                  borderRadius: 20, padding: '2px 9px', fontSize: 11, fontWeight: 700,
                }}>
                  현재
                </div>
              )}

              {/* Plan header */}
              <div style={{ marginBottom: 16 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: plan.accentBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, marginBottom: 10,
                }}>{plan.icon}</div>
                <div style={{ color: plan.color, fontWeight: 700, fontSize: 12, marginBottom: 3, letterSpacing: '0.05em' }}>
                  {plan.name.toUpperCase()}
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>
                  {formatPrice(price)}
                </div>
                {billing === 'yearly' && plan.monthlyPrice > 0 && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                    월 {formatPrice(Math.round(price / 12))}
                    {discount && (
                      <span style={{ color: '#22c55e', fontWeight: 700, marginLeft: 5 }}>-{discount}%</span>
                    )}
                  </div>
                )}
                {billing === 'monthly' && plan.monthlyPrice > 0 && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>/ 월</div>
                )}
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '0 0 16px' }} />

              {/* Features */}
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 18px', flex: 1 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 12, color: 'var(--text-secondary)', alignItems: 'flex-start' }}>
                    <span style={{ color: plan.color, flexShrink: 0, fontWeight: 700, marginTop: 1 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA button */}
              <button
                disabled={isCurrent || (!isUpgrade && plan.tier !== 'FREE')}
                onClick={() => {
                  if (isUpgrade) handleUpgradeClick(plan)
                }}
                style={{
                  width: '100%', padding: '11px', borderRadius: 9, border: 'none',
                  fontWeight: 700, fontSize: 13, fontFamily: 'inherit', transition: 'all 0.15s',
                  cursor: isCurrent ? 'default' : isUpgrade ? 'pointer' : 'not-allowed',
                  background: isCurrent ? plan.accentBg : isUpgrade ? plan.color : 'var(--bg)',
                  color: isCurrent ? plan.color : isUpgrade ? '#fff' : 'var(--text-muted)',
                }}
                onMouseEnter={(e) => { if (isUpgrade) e.currentTarget.style.opacity = '0.88' }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
              >
                {isCurrent ? '현재 플랜' : isUpgrade ? '업그레이드 →' : plan.tier === 'FREE' ? '다운그레이드' : '선택 불가'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Info footer */}
      <div style={{
        background: '#fff', borderRadius: 12, padding: '18px 22px',
        border: '1px solid var(--border-light)', fontSize: 13, color: 'var(--text-secondary)',
      }}>
        <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>이용 안내</p>
        {['카카오페이, 토스페이, 토스페이먼츠로 결제 가능합니다.', '구독은 매월 자동 갱신되며, 언제든 해지할 수 있습니다.', '연간 구독은 결제 시점부터 1년간 유효합니다.'].map((t) => (
          <p key={t} style={{ marginBottom: 5, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ color: '#4f46e5', fontWeight: 700 }}>·</span> {t}
          </p>
        ))}
      </div>
    </div>
  )
}

export default SubscriptionPage
