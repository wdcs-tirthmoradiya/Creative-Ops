import { Outlet } from 'react-router-dom'
import NavBar from './NavBar'
import MetricsBar from './MetricsBar'
import Notifications from './Notifications'
import AdModal from '@/components/shared/AdModal'
import NewAdModal from '@/components/shared/NewAdModal'
import { useAppStore } from '@/store/useAppStore'
import { useAds } from '@/hooks/useAds'

export default function AppShell() {
  const selectedAdId   = useAppStore((s) => s.selectedAdId)
  const setSelectedAdId= useAppStore((s) => s.setSelectedAdId)
  const showNewAdModal = useAppStore((s) => s.showNewAdModal)
  const setShowNewAdModal = useAppStore((s) => s.setShowNewAdModal)
  const { ads } = useAds()

  const selectedAd = ads.find((a) => a.id === selectedAdId) || null

  return (
    <div className="min-h-screen bg-[#0f0f11] text-text-primary flex flex-col">
      <NavBar />
      <MetricsBar />

      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>

      <Notifications />

      {selectedAd && (
        <AdModal ad={selectedAd} onClose={() => setSelectedAdId(null)} />
      )}

      {showNewAdModal && (
        <NewAdModal onClose={() => setShowNewAdModal(false)} />
      )}
    </div>
  )
}
