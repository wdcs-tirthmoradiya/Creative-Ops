import { create } from 'zustand'

let notifCounter = 0

export const useAppStore = create((set, get) => ({
  // ── Active user ─────────────────────────────────────────────────────────
  activeUser: 'Founder',
  setActiveUser: (user) => set({ activeUser: user }),

  // ── Selected ad (modal) ──────────────────────────────────────────────────
  selectedAdId: null,
  setSelectedAdId: (id) => set({ selectedAdId: id }),

  // ── Notifications ────────────────────────────────────────────────────────
  notifications: [],
  addNotification: (msg, type = 'info') => {
    const id = ++notifCounter
    set((state) => ({
      notifications: [{ id, msg, type, ts: Date.now() }, ...state.notifications.slice(0, 4)],
    }))
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }))
    }, 4000)
  },
  dismissNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  // ── Modal states ──────────────────────────────────────────────────────────
  showNewAdModal:      false,
  showNewIdeaModal:    false,
  showNewLearningModal:false,
  setShowNewAdModal:       (v) => set({ showNewAdModal: v }),
  setShowNewIdeaModal:     (v) => set({ showNewIdeaModal: v }),
  setShowNewLearningModal: (v) => set({ showNewLearningModal: v }),
}))
