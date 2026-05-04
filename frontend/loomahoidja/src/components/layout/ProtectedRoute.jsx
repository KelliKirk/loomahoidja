import { Navigate } from "react-router-dom";
import { useAuth } from '../../auth/AuthContext'

export default function ProtectedRoute({ children, role }) {
  const { isLoggedIn, user } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    return <Navigate to="/find" replace />
  }

  return children;
}