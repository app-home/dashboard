import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '@/components/ProtectedRoute'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Rutas protegidas: requieren sesión */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
      </Route>

      {/* Cualquier otra ruta vuelve al inicio */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
