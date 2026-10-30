import { Navigate, useLocation } from "react-router";
import { useSignals } from "@preact/signals-react/runtime";
import { isAuthenticated } from "../store/authStore";

const rutaServidor = import.meta.env.VITE_BASE_URL_SERVIDOR || "";

interface AuthGuardProps {
  children: React.ReactNode;
  isPublic: boolean;
}

export const AuthGuard = ({ children, isPublic }: AuthGuardProps) => {
  useSignals();
  const location = useLocation();
  const logged = isAuthenticated.value;

  const loginPath = `${rutaServidor}/login`;
  const homePath = `${rutaServidor}/dashboard`;

  if (!logged && !isPublic) {
    return <Navigate to={loginPath} replace state={{ from: location }} />;
  }

  if (logged && isPublic && location.pathname === loginPath) {
    return <Navigate to={homePath} replace />;
  }

  return <>{children}</>;
};
