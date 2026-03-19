import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useCartStore from '../store/cartStore'
import Button from '../components/Button'

const BOOK_COLORS = ['#ddd6fe', '#bfdbfe', '#bbf7d0', '#fde68a', '#fecaca', '#c7d2fe']

function CartPage() {
  const { items, updateItem, removeItem } = useCartStore()
  const [address, setAddress] = useState('')
  const [addrFocused, setAddrFocused] = useState(false)
  const navigate = useNavigate()

  const total = items.reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0)

  const handleOrder = () => {
    if (!address.trim()) { alert('배송지를 입력하세요.'); return }
    const orderName = items.length === 1
      ? (items[0].title || '도서')
      : `${items[0].title || '도서'} 외 ${items.length - 1}건`
    navigate('/payment', {
      state: {
        orderName,
        totalAmount: total,
        type: 'cart',
        items,
        backTo: '/cart',
      },
    })
  }

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: 560, margin: '80px auto', textAlign: 'center' }}>
        <div style={{
          background: '#fff', borderRadius: 18, padding: '52px 40px',
          boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)',
        }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🛒</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>장바구니가 비었습니다</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28, fontSize: 14 }}>도서 스토어에서 마음에 드는 책을 담아보세요.</p>
          <Button onClick={() => navigate('/books')}>도서 스토어 보기 →</Button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>장바구니</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{items.length}개의 상품이 담겨있습니다.</p>
      </div>

      {/* Items */}
      <div style={{
        background: '#fff', borderRadius: 14, overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)', marginBottom: 16,
      }}>
        {items.map((item, idx) => (
          <div key={item.bookId} style={{
            display: 'flex', alignItems: 'center', padding: '18px 22px', gap: 16,
            borderBottom: idx < items.length - 1 ? '1px solid var(--border-light)' : 'none',
          }}>
            <div style={{
              width: 52, height: 68, borderRadius: 8,
              background: '#ddd6fe', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 24, flexShrink: 0,
            }}>📚</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>
                {item.title || '도서'}
              </p>
              <p style={{ color: '#4f46e5', fontWeight: 700, fontSize: 16 }}>
                {((item.price || 0) * item.quantity).toLocaleString()}원
                <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 4 }}>
                  (1권 {(item.price || 0).toLocaleString()}원)
                </span>
              </p>
            </div>
            {/* Qty controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={() => item.quantity > 1 && updateItem(item.bookId, item.quantity - 1)}
                style={{
                  width: 30, height: 30, borderRadius: 7, border: '1.5px solid var(--border)',
                  background: '#fff', cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                  fontWeight: 700, fontSize: 16, fontFamily: 'inherit', color: 'var(--text)',
                  opacity: item.quantity <= 1 ? 0.4 : 1,
                }}
              >−</button>
              <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', minWidth: 22, textAlign: 'center' }}>
                {item.quantity}
              </span>
              <button
                onClick={() => updateItem(item.bookId, item.quantity + 1)}
                style={{
                  width: 30, height: 30, borderRadius: 7, border: '1.5px solid var(--border)',
                  background: '#fff', cursor: 'pointer',
                  fontWeight: 700, fontSize: 16, fontFamily: 'inherit', color: 'var(--text)',
                }}
              >+</button>
            </div>
            <button
              onClick={() => removeItem(item.bookId)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 6,
                color: 'var(--text-muted)', fontSize: 18,
                borderRadius: 6, transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)' }}
            >✕</button>
          </div>
        ))}
      </div>

      {/* Checkout card */}
      <div style={{
        background: '#fff', borderRadius: 14, padding: '24px',
        boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>총 결제금액</span>
          <span style={{ fontWeight: 800, fontSize: 24, color: '#4f46e5' }}>
            {total.toLocaleString()}
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>원</span>
          </span>
        </div>

        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
          배송지
        </label>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="예: 서울시 강남구 테헤란로 123"
          onFocus={() => setAddrFocused(true)}
          onBlur={() => setAddrFocused(false)}
          style={{
            width: '100%', padding: '11px 13px',
            border: `1.5px solid ${addrFocused ? '#4f46e5' : 'var(--border)'}`,
            borderRadius: 9, marginBottom: 16, fontSize: 14,
            boxSizing: 'border-box', color: 'var(--text)', background: '#fff',
            outline: 'none', fontFamily: 'inherit', transition: 'all 0.15s',
            boxShadow: addrFocused ? '0 0 0 3px rgba(79,70,229,0.08)' : 'none',
          }}
        />
        <Button fullWidth size="lg" onClick={handleOrder}>
          결제하기 →
        </Button>
      </div>
    </div>
  )
}

export default CartPage
