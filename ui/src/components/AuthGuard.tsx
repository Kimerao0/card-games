import { type FC } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAppSelector } from '@/store/hooks';
import { selectAuthInitialized, selectIsAuthenticated } from '@/store/slices/authSlice';

export const AuthGuard: FC = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAuthInitialized = useAppSelector(selectAuthInitialized);
  const location = useLocation();

  if (!isAuthInitialized) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: 16,
        }}
        aria-busy="true"
        aria-live="polite"
      >
        Caricamento...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
