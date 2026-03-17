import { Routes, Route, Navigate } from 'react-router-dom'
import { ChangelogPage } from './pages/ChangelogPage'

export default function App() {
  return (
    <Routes>
      <Route path="/changelog" element={<ChangelogPage />} />
      <Route path="*" element={<Navigate to="/changelog" replace />} />
    </Routes>
  )
}
