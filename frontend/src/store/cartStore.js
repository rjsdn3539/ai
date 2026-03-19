import { create } from 'zustand'

// localStorage helpers
const CART_KEY = 'cart_items'

const loadCart = () => {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]') } catch { return [] }
}

const saveCart = (items) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

const useCartStore = create((set, get) => ({
  items: loadCart(),   // [{ bookId, title, price, quantity }]

  addItem: (bookId, quantity = 1, bookInfo = {}) => {
    const items = get().items
    const existing = items.find((i) => i.bookId === bookId)
    let next
    if (existing) {
      next = items.map((i) =>
        i.bookId === bookId ? { ...i, quantity: i.quantity + quantity } : i
      )
    } else {
      next = [...items, { bookId, quantity, ...bookInfo }]
    }
    saveCart(next)
    set({ items: next })
  },

  updateItem: (bookId, quantity) => {
    if (quantity < 1) return
    const next = get().items.map((i) =>
      i.bookId === bookId ? { ...i, quantity } : i
    )
    saveCart(next)
    set({ items: next })
  },

  removeItem: (bookId) => {
    const next = get().items.filter((i) => i.bookId !== bookId)
    saveCart(next)
    set({ items: next })
  },

  clearCart: () => {
    saveCart([])
    set({ items: [] })
  },

  // 주문 완료 후 호출 (API가 생기면 연동 가능)
  fetchCart: () => {
    set({ items: loadCart() })
  },
}))

export default useCartStore
