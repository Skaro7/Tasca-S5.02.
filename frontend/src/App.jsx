import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CatalogPage from './pages/CatalogPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import { useAuth } from './context/AuthContext'
import AdminPage from './pages/AdminPage'


export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={user ? <CatalogPage /> : <Navigate to="/login" />} />
      <Route path="/product/:id" element={<ProductDetailPage />} />
      <Route path="/cart" element={user ? <CartPage /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" />} />
      <Route path="/admin" element={user?.roles?.includes('ROLE_ADMIN') ? <AdminPage /> : <Navigate to="/" />} />
    </Routes>
  )
}