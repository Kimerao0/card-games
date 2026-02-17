import { type FC } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { AuthGuard } from '@/components/AuthGuard';
import { AppLayout } from '@/components/AppLayout';
import { Home } from '@/pages/Home';
import { Login } from '@/pages/Login';
import { NotFound } from '@/pages/NotFound';
import { Playroom } from '@/pages/Playroom';

export const App: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* Protected */}
          <Route element={<AuthGuard />}>
            <Route path="/giochi/scopone-scientifico" element={<div>Scopone scientifico (regole + crea/join)</div>} />
            <Route path="/giochi/tresette" element={<div>Tresette (regole + crea/join)</div>} />
            <Route path="/dev" element={<Playroom />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
