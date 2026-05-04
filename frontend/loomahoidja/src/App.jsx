import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SitterList from "./views/SitterList";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './views/auth/Login';
import Register from './views/auth/Register';
import { useAuth } from './context/AuthContext';

function DashboardRedirect() {
  const { user } = useAuth();
  return <Navigate to={user?.role === 'sitter' ? '/dashboard/sitter' : '/dashboard/owner'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<SitterList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={
          <ProtectedRoute><DashboardRedirect /></ProtectedRoute>
        } />

        <Route path="/dashboard/owner" element={
          <ProtectedRoute role="owner"><div>Owner dashboard</div></ProtectedRoute>
        } />
        <Route path="/dashboard/sitter" element={
          <ProtectedRoute role="sitter"><div>Sitter dashboard</div></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <Footer />
    </BrowserRouter>

  )
} 