import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'
import PipelineBoard from '@/pages/PipelinePage'
import DashboardPage from '@/pages/DashboardPage'
import TeamPage from '@/pages/TeamPage'
import ReportsPage from '@/pages/ReportsPage'
import IdeasPage from '@/pages/IdeasPage'
import LearningsPage from '@/pages/LearningsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<Navigate to="/pipeline" replace />} />
        <Route path="pipeline"  element={<PipelineBoard />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="team"      element={<TeamPage />} />
        <Route path="reports"   element={<ReportsPage />} />
        <Route path="ideas"     element={<IdeasPage />} />
        <Route path="learnings" element={<LearningsPage />} />
      </Route>
    </Routes>
  )
}
