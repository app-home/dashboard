import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '@/components/ProtectedRoute'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Settings from '@/pages/Settings'
import Notifications from '@/pages/Notifications'
import Finanzas from '@/pages/Finanzas'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Rutas protegidas: requieren sesión */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/finanzas" element={<Finanzas />} />
      </Route>

      {/* Cualquier otra ruta vuelve al inicio */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
