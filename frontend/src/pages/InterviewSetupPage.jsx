import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import * as profileApi from '../api/profile'
import * as interviewApi from '../api/interview'
import Button from '../components/Button'
import useAuthStore from '../store/authStore'

function UploadZone({ label, hint, file, onFile, accept = '.txt,.pdf,.doc,.docx' }) {
  const ref = useRef()
  const hasFile = !!file
  const [hovered, setHovered] = useState(false)
  return (
    <div>
      <label style={{ display: 'block', fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 10 }}>{label}</label>
      <input type="file" accept={accept} ref={ref} style={{ display: 'none' }} onChange={onFile} />
      <div
        onClick={() => ref.current.click()}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          border: `2px dashed ${hasFile ? 'var(--primary)' : hovered ? 'var(--primary-border)' : 'var(--border)'}`,
          borderRadius: 14, padding: '32px 20px',
          background: hasFile ? 'var(--primary-light)' : hovered ? '#faf9ff' : 'var(--bg)',
          cursor: 'pointer', textAlign: 'center',
          transition: 'all 0.18s ease',
          transform: hovered && !hasFile ? 'translateY(-1px)' : 'none',
          boxShadow: hasFile ? '0 4px 16px rgba(124,106,240,0.12)' : 'none',
        }}
      >
        {hasFile ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>✅</div>
            <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 14 }}>{file.name}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>클릭해서 변경</span>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📄</div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 4 }}>클릭하여 업로드</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{hint}</p>
          </>
        )}
      </div>
    </div>
  )
}

function FieldInput({ label, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      {label && <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{label}</label>}
      <input
        style={{
          width: '100%', padding: '13px 16px',
          border: `1.5px solid ${focused ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: 10, fontSize: 14, outline: 'none',
          background: '#fff', color: 'var(--text)', boxSizing: 'border-box',
          boxShadow: focused ? '0 0 0 3px rgba(124,106,240,0.1)' : 'none',
          transition: 'all 0.15s', fontFamily: 'inherit',
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
    </div>
  )
}

function StepBadge({ n, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 15, fontWeight: 800, color: '#fff',
        boxShadow: '0 4px 12px rgba(124,106,240,0.3)',
      }}>{n}</div>
      <h2 style={{ fontWeight: 700, fontSize: 17, color: 'var(--text)' }}>{label}</h2>
    </div>
  )
}

function InterviewSetupPage() {
  const { user } = useAuthStore()
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeContent, setResumeContent] = useState('')
  const [coverLetterFile, setCoverLetterFile] = useState(null)
  const [coverLetterContent, setCoverLetterContent] = useState('')
  const [coverLetterCompany, setCoverLetterCompany] = useState('')
  const [jobUrl, setJobUrl] = useState('')
  const [jobCompany, setJobCompany] = useState('')
  const [jobPosition, setJobPosition] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null) // { message, action? }
  const navigate = useNavigate()

  const readFile = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = reject
      reader.readAsText(file, 'UTF-8')
    })

  const handleResumeChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try { const c = await readFile(file); setResumeFile(file); setResumeContent(c); setError(null) }
    catch { setError({ message: '파일을 읽는데 실패했습니다. .txt 파일을 사용해주세요.' }) }
  }

  const handleCoverLetterChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try { const c = await readFile(file); setCoverLetterFile(file); setCoverLetterContent(c); setError(null) }
    catch { setError({ message: '파일을 읽는데 실패했습니다. .txt 파일을 사용해주세요.' }) }
  }

  const handleStart = async () => {
    if (!resumeFile)                { setError({ message: '이력서 파일을 업로드해주세요.' }); return }
    if (!coverLetterFile)           { setError({ message: '자기소개서 파일을 업로드해주세요.' }); return }
    if (!coverLetterCompany.trim()) { setError({ message: '자기소개서의 지원 회사명을 입력해주세요.' }); return }
    if (!jobUrl.trim())             { setError({ message: '채용공고 URL을 입력해주세요.' }); return }
    if (!jobCompany.trim())         { setError({ message: '채용공고 회사명을 입력해주세요.' }); return }
    if (!jobPosition.trim())        { setError({ message: '지원 직무명을 입력해주세요.' }); return }
    setError(null)
    setLoading(true)
    try {
      const [{ data: rD }, { data: cD }, { data: jD }] = await Promise.all([
        profileApi.createResume({ title: resumeFile.name.replace(/\.[^.]+$/, ''), content: resumeContent.slice(0, 5000) }),
        profileApi.createCoverLetter({ title: coverLetterFile.name.replace(/\.[^.]+$/, ''), companyName: coverLetterCompany, content: coverLetterContent.slice(0, 5000) }),
        profileApi.createJobPosting({ companyName: jobCompany, positionTitle: jobPosition, description: jobUrl, jobUrl }),
      ])
      const { data } = await interviewApi.startSession({
        title: `${jobCompany} ${jobPosition} 면접`,
        positionTitle: jobPosition,
        resumeId: rD.data.id,
        coverLetterId: cD.data.id,
        jobPostingId: jD.data.id,
      })
      navigate('/interview/session', { state: { sessionId: data.data.id } })
    } catch (err) {
      const code = err?.response?.data?.error?.code
      const msg  = err?.response?.data?.error?.message
      if (code === 'SUBSCRIPTION_REQUIRED') {
        setError({ message: '면접을 시작하려면 구독이 필요합니다.', action: { label: '구독 플랜 보기 →', path: '/subscription' } })
      } else if (code === 'MONTHLY_INTERVIEW_LIMIT_EXCEEDED') {
        setError({ message: '이번 달 면접 횟수를 모두 사용했습니다. 플랜을 업그레이드하면 더 이용할 수 있어요.', action: { label: '플랜 업그레이드 →', path: '/subscription' } })
      } else {
        setError({ message: msg || '면접 세션 시작에 실패했습니다. 잠시 후 다시 시도해주세요.' })
      }
    } finally { setLoading(false) }
  }

  const allFilled = resumeFile && coverLetterFile && coverLetterCompany && jobUrl && jobCompany && jobPosition

  return (
    <div style={{ width: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>면접 시작하기</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>이력서와 채용공고를 업로드하면 AI가 맞춤 면접 질문을 생성합니다.</p>
      </div>

      {/* 2-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Step 1: 문서 업로드 */}
        <div style={{
          background: '#fff', borderRadius: 20,
          padding: '32px 36px',
          boxShadow: 'var(--shadow-sm)', border: '1.5px solid var(--border-light)',
        }}>
          <StepBadge n="1" label="문서 업로드" />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <UploadZone
              label="이력서"
              hint=".txt · .pdf · .doc 지원"
              file={resumeFile}
              onFile={handleResumeChange}
            />
            <UploadZone
              label="자기소개서"
              hint=".txt · .pdf · .doc 지원"
              file={coverLetterFile}
              onFile={handleCoverLetterChange}
            />
            {coverLetterFile && (
              <FieldInput
                label="자기소개서 지원 회사"
                placeholder="예: 카카오"
                value={coverLetterCompany}
                onChange={(e) => setCoverLetterCompany(e.target.value)}
              />
            )}
          </div>
        </div>

        {/* Step 2: 채용공고 */}
        <div style={{
          background: '#fff', borderRadius: 20,
          padding: '32px 36px',
          boxShadow: 'var(--shadow-sm)', border: '1.5px solid var(--border-light)',
          display: 'flex', flexDirection: 'column',
        }}>
          <StepBadge n="2" label="채용공고 정보" />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, flex: 1 }}>
            <FieldInput
              label="채용공고 URL"
              placeholder="https://careers.kakao.com/..."
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
            />
            <FieldInput
              label="회사명"
              placeholder="카카오"
              value={jobCompany}
              onChange={(e) => setJobCompany(e.target.value)}
            />
            <FieldInput
              label="지원 직무"
              placeholder="백엔드 개발자"
              value={jobPosition}
              onChange={(e) => setJobPosition(e.target.value)}
            />

            {/* Tips */}
            <div style={{
              background: 'var(--bg)', borderRadius: 12, padding: '16px 18px',
              border: '1px solid var(--border-light)', marginTop: 'auto',
            }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>💡 면접 준비 팁</p>
              {[
                '이력서는 최신 내용으로 업데이트하세요',
                '자기소개서는 해당 회사 맞춤으로 작성하세요',
                'JD 키워드를 답변에 자연스럽게 녹여보세요',
              ].map((tip, i) => (
                <p key={i} style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: i < 2 ? 4 : 0 }}>• {tip}</p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 14,
          padding: '14px 20px', marginBottom: 14, gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" stroke="#dc2626" strokeWidth="2"/>
              <path d="M12 8v4M12 16h.01" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize: 14, color: '#dc2626', fontWeight: 600 }}>{error.message}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {error.action && (
              <button
                onClick={() => navigate(error.action.path)}
                style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                {error.action.label}
              </button>
            )}
            <button
              onClick={() => setError(null)}
              style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '2px 4px' }}
            >×</button>
          </div>
        </div>
      )}

      {/* Start button */}
      <div style={{
        background: allFilled
          ? 'linear-gradient(130deg, #3d2ee0 0%, #7c6af0 52%, #0ea5e9 100%)'
          : '#fff',
        borderRadius: 20, padding: '28px 36px',
        border: allFilled ? 'none' : '1.5px solid var(--border-light)',
        boxShadow: allFilled ? '0 10px 36px rgba(61,46,224,0.28)' : 'var(--shadow-sm)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'all 0.3s ease',
      }}>
        <div>
          <p style={{ fontSize: 14, color: allFilled ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)', marginBottom: 4 }}>
            {allFilled ? '모든 정보가 입력됐어요!' : '이력서, 자기소개서, 채용공고를 모두 입력해주세요'}
          </p>
          <p style={{ fontSize: 18, fontWeight: 800, color: allFilled ? '#fff' : 'var(--text)' }}>
            {allFilled ? `${jobCompany} ${jobPosition} 면접 시작 준비 완료` : '정보를 입력하면 면접을 시작할 수 있어요'}
          </p>
        </div>
        <button
          onClick={handleStart}
          disabled={loading}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: allFilled ? '#fff' : 'var(--primary)',
            color: allFilled ? '#3d2ee0' : '#fff',
            border: 'none', borderRadius: 14,
            padding: '16px 36px', fontSize: 16, fontWeight: 800,
            cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
            transition: 'all 0.18s ease',
            opacity: loading ? 0.7 : 1, flexShrink: 0,
          }}
        >
          {loading ? '⚙️ 면접 생성 중...' : '🎤 AI 면접 시작하기'}
        </button>
      </div>
    </div>
  )
}

export default InterviewSetupPage
