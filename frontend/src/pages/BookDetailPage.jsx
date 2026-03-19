import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import * as bookApi from '../api/book'
import useCartStore from '../store/cartStore'

const BOOK_COLORS   = ['#ddd6fe', '#bfdbfe', '#bbf7d0', '#fde68a', '#fecaca', '#c7d2fe']
const BOOK_ICON_BG  = ['#7c6af0', '#0ea5e9', '#2da65e', '#e09420', '#e05252', '#4f46e5']

// Mock enriched data — in production these fields would come from the API
const BOOK_META = {
  1: {
    desc: '소프트웨어 장인 로버트 마틴이 전하는 가독성 높은 코드 작성법. 변수명 짓기부터 함수 설계, 클래스 구조까지 실전 예제 중심으로 설명합니다.',
    pages: 431, publisher: '인사이트', published: '2013-12-24',
    tags: ['코드 품질', '리팩토링', '베스트셀러'],
    toc: ['깨끗한 코드', '의미 있는 이름', '함수', '주석', '형식 맞추기', '오류 처리', '단위 테스트'],
  },
  2: {
    desc: '현업 개발자가 면접에서 자주 묻는 기술 질문을 정리한 실전 가이드. 자료구조, 운영체제, 네트워크, 데이터베이스까지 핵심만 담았습니다.',
    pages: 368, publisher: '한빛미디어', published: '2021-09-01',
    tags: ['면접 준비', 'CS 기초', '추천도서'],
    toc: ['자료구조 & 알고리즘', '운영체제', '네트워크', '데이터베이스', '설계 패턴', '면접 Q&A'],
  },
  3: {
    desc: 'JavaScript 언어의 깊숙한 곳까지 탐구하는 바이블. ES6+의 모든 기능을 상세한 예제와 함께 완벽 정리한 레퍼런스 북입니다.',
    pages: 704, publisher: '한빛미디어', published: '2020-06-12',
    tags: ['JavaScript', 'ES6+', '완벽 가이드'],
    toc: ['타입, 값, 변수', '표현식과 연산자', '함수', '클래스와 모듈', '반복자와 제너레이터', '비동기 JavaScript'],
  },
  4: {
    desc: 'Spring Boot로 REST API를 설계하고 JPA로 데이터베이스를 다루는 실전 프로젝트 중심 학습서. 현업 패턴을 그대로 따라 배울 수 있습니다.',
    pages: 552, publisher: '인프런', published: '2022-04-15',
    tags: ['Spring Boot', 'JPA', '백엔드'],
    toc: ['스프링 부트 소개', 'REST API 설계', 'JPA 기초', '연관관계 매핑', '성능 최적화', '배포'],
  },
  5: {
    desc: '알고리즘 대회 수상 경력의 저자가 코딩 테스트에서 살아남는 전략을 알려줍니다. 문제 풀이 접근법과 시간복잡도 분석까지 체계적으로 다룹니다.',
    pages: 616, publisher: '인사이트', published: '2012-09-19',
    tags: ['알고리즘', '코딩테스트', '심화'],
    toc: ['알고리즘 설계 패러다임', '분할 정복', '동적 계획법', '그래프', '문자열', '조합 탐색'],
  },
  6: {
    desc: '면접관이 가장 많이 묻는 CS 전공 지식을 한 권에 압축. 디자인 패턴, 네트워크, OS, 자료구조를 체계적으로 정리한 필수 면접 교재입니다.',
    pages: 480, publisher: '길벗', published: '2022-03-25',
    tags: ['CS 지식', '면접', '필독서'],
    toc: ['디자인 패턴', '네트워크', '운영체제', '데이터베이스', '자료구조', '알고리즘'],
  },
}

const DEFAULT_META = {
  desc: 'AI 면접 준비와 개발 역량 향상에 도움이 되는 추천 도서입니다.',
  pages: 320, publisher: '출판사', published: '2024-01-01',
  tags: ['추천도서'],
  toc: ['Chapter 1', 'Chapter 2', 'Chapter 3'],
}

function BookDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem, items } = useCartStore()

  const [book, setBook]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty]         = useState(1)
  const [adding, setAdding]   = useState(false)
  const [added, setAdded]     = useState(false)

  useEffect(() => {
    setLoading(true)
    bookApi.getBook(id)
      .then(({ data }) => setBook(data.data))
      .catch(() => {
        // Fallback to mock
        const MOCK = [
          { id: 1, title: '클린 코드', author: '로버트 마틴', price: 32000, stock: 10 },
          { id: 2, title: '개발자를 위한 면접 교과서', author: '이동욱', price: 28000, stock: 5 },
          { id: 3, title: '자바스크립트 완벽 가이드', author: 'David Flanagan', price: 45000, stock: 8 },
          { id: 4, title: 'Spring Boot 실전', author: '김영한', price: 38000, stock: 3 },
          { id: 5, title: '알고리즘 문제 풀이 전략', author: '구종만', price: 40000, stock: 6 },
          { id: 6, title: '면접을 위한 CS 전공지식', author: '주홍철', price: 35000, stock: 0 },
        ]
        setBook(MOCK.find((b) => b.id === Number(id)) || MOCK[0])
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = () => {
    setAdding(true)
    try {
      addItem(book.id, qty, { title: book.title, author: book.author, price: book.price })
      setAdded(true)
      setTimeout(() => setAdded(false), 2500)
    } catch {
      alert('장바구니 추가에 실패했습니다.')
    } finally {
      setAdding(false)
    }
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: 40, marginBottom: 14 }}>📚</div>
      <p style={{ fontSize: 15 }}>도서 정보를 불러오는 중...</p>
    </div>
  )

  if (!book) return (
    <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: 40, marginBottom: 14 }}>😔</div>
      <p style={{ fontSize: 15 }}>도서를 찾을 수 없습니다.</p>
      <button onClick={() => navigate('/books')} style={{ marginTop: 16, background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 22px', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
        목록으로 돌아가기
      </button>
    </div>
  )

  const colorIdx  = (book.id - 1) % BOOK_COLORS.length
  const bgColor   = BOOK_COLORS[colorIdx]
  const iconColor = BOOK_ICON_BG[colorIdx]
  const meta      = BOOK_META[book.id] || DEFAULT_META
  const inCart    = items.some((i) => i.bookId === book.id)
  const isSoldOut = book.stock === 0

  return (
    <div style={{ width: '100%' }}>

      {/* Back */}
      <button
        onClick={() => navigate('/books')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', color: 'var(--text-secondary)',
          fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          marginBottom: 24, padding: '6px 0', transition: 'color 0.15s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        ← 도서 목록
      </button>

      {/* Main section */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 32, marginBottom: 32, alignItems: 'start' }}>

        {/* Cover */}
        <div>
          <div style={{
            background: bgColor, borderRadius: 22,
            height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 100, position: 'relative', overflow: 'hidden',
            boxShadow: `0 20px 56px ${bgColor}cc`,
          }}>
            {/* Decorative shapes */}
            <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.25)' }} />
            <div style={{ position: 'absolute', bottom: -40, left: -20, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 72, marginBottom: 12 }}>📚</div>
              <div style={{
                background: iconColor, color: '#fff',
                borderRadius: 10, padding: '6px 16px',
                fontSize: 12, fontWeight: 700, letterSpacing: '0.05em',
                display: 'inline-block',
              }}>BOOK</div>
            </div>
            {isSoldOut && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ background: '#e05252', color: '#fff', borderRadius: 10, padding: '8px 22px', fontSize: 16, fontWeight: 800 }}>품절</span>
              </div>
            )}
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
            {meta.tags.map((tag) => (
              <span key={tag} style={{
                background: 'var(--primary-light)', color: 'var(--primary)',
                borderRadius: 99, padding: '5px 14px',
                fontSize: 12, fontWeight: 700, border: '1px solid var(--primary-border)',
              }}>{tag}</span>
            ))}
          </div>
        </div>

        {/* Info + Purchase */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Title block */}
          <div style={{
            background: '#fff', borderRadius: 20,
            border: '1.5px solid var(--border-light)',
            padding: '32px 36px',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <h1 style={{ fontSize: 30, fontWeight: 900, color: 'var(--text)', marginBottom: 8, lineHeight: 1.3 }}>
              {book.title}
            </h1>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 20 }}>저자 · {book.author}</p>

            <div style={{ display: 'flex', gap: 24, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--border-light)' }}>
              {[
                { label: '출판사', value: meta.publisher },
                { label: '출간일', value: meta.published },
                { label: '페이지', value: `${meta.pages}p` },
                { label: '재고', value: isSoldOut ? '품절' : `${book.stock}권`, color: isSoldOut ? '#e05252' : '#2da65e' },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: color || 'var(--text)' }}>{value}</p>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>{meta.desc}</p>
          </div>

          {/* Purchase block */}
          <div style={{
            background: '#fff', borderRadius: 20,
            border: '1.5px solid var(--border-light)',
            padding: '28px 36px',
            boxShadow: 'var(--shadow-sm)',
          }}>
            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 24 }}>
              <span style={{ fontSize: 36, fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>
                {(book.price * qty).toLocaleString()}
              </span>
              <span style={{ fontSize: 18, color: 'var(--text-secondary)', marginBottom: 3 }}>원</span>
              {qty > 1 && (
                <span style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
                  ({book.price.toLocaleString()}원 × {qty})
                </span>
              )}
            </div>

            {/* Qty selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>수량</span>
              <div style={{
                display: 'flex', alignItems: 'center',
                border: '1.5px solid var(--border)', borderRadius: 12, overflow: 'hidden',
              }}>
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  style={{
                    width: 44, height: 44, border: 'none', background: qty <= 1 ? 'var(--bg)' : '#fff',
                    fontSize: 18, cursor: qty <= 1 ? 'not-allowed' : 'pointer',
                    color: qty <= 1 ? 'var(--text-muted)' : 'var(--text)',
                    transition: 'background 0.15s', fontFamily: 'inherit',
                  }}
                >−</button>
                <span style={{
                  width: 52, textAlign: 'center', fontSize: 16, fontWeight: 800,
                  color: 'var(--text)', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)',
                  lineHeight: '44px',
                }}>{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(book.stock || 99, q + 1))}
                  disabled={qty >= (book.stock || 99) || isSoldOut}
                  style={{
                    width: 44, height: 44, border: 'none',
                    background: qty >= book.stock ? 'var(--bg)' : '#fff',
                    fontSize: 18, cursor: qty >= book.stock ? 'not-allowed' : 'pointer',
                    color: qty >= book.stock ? 'var(--text-muted)' : 'var(--text)',
                    transition: 'background 0.15s', fontFamily: 'inherit',
                  }}
                >+</button>
              </div>
              {!isSoldOut && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>최대 {book.stock}권</span>
              )}
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleAddToCart}
                disabled={adding || isSoldOut}
                style={{
                  flex: 1, padding: '16px',
                  background: added
                    ? 'linear-gradient(135deg, #2da65e, #4ade80)'
                    : isSoldOut
                      ? 'var(--bg)'
                      : 'linear-gradient(135deg, var(--primary), var(--accent))',
                  color: isSoldOut ? 'var(--text-muted)' : '#fff',
                  border: 'none', borderRadius: 14,
                  fontSize: 16, fontWeight: 800, cursor: isSoldOut ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: isSoldOut ? 'none' : '0 8px 24px rgba(124,106,240,0.3)',
                  transition: 'all 0.2s ease',
                }}
              >
                {adding ? '⚙️ 담는 중...' : added ? '✓ 장바구니에 담겼어요!' : isSoldOut ? '품절된 상품입니다' : '🛒 장바구니에 담기'}
              </button>

              {inCart && !isSoldOut && (
                <button
                  onClick={() => navigate('/cart')}
                  style={{
                    padding: '16px 22px', background: '#fff',
                    color: 'var(--primary)', border: '2px solid var(--primary-border)',
                    borderRadius: 14, fontSize: 14, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all 0.15s', whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary-light)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#fff' }}
                >
                  장바구니 보기 →
                </button>
              )}
            </div>

            {added && (
              <div style={{
                marginTop: 12, padding: '10px 16px', background: '#f0fdf4',
                borderRadius: 10, border: '1px solid #bbf7d0',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 13, color: '#2da65e', fontWeight: 600 }}>
                  장바구니에 {qty}권 담겼어요!
                </span>
                <button onClick={() => navigate('/cart')}
                  style={{ background: 'none', border: 'none', color: '#2da65e', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                  바로 가기 →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table of contents */}
      <div style={{
        background: '#fff', borderRadius: 20,
        border: '1.5px solid var(--border-light)',
        padding: '32px 36px',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 20 }}>목차</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {meta.toc.map((chapter, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px', background: 'var(--bg)',
              borderRadius: 12, border: '1px solid var(--border-light)',
            }}>
              <span style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: bgColor, color: iconColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800,
              }}>{i + 1}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{chapter}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BookDetailPage
