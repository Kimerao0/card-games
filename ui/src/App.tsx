import { type FC } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { AuthGuard } from '@/components/AuthGuard';
import { AppLayout } from '@/components/AppLayout';
import { Home } from '@/pages/Home';
import { Login } from '@/pages/Login';
import { NotFound } from '@/pages/NotFound';
import { Playroom } from '@/pages/Playroom';
import { ScoponeScientifico } from '@/pages/ScoponeScientifico';
import { Tresette } from '@/pages/Tresette';
import { AdminDelete } from '@/pages/AdminDelete';
import { GameRoom } from '@/pages/GameRoom';
import { AuthInitializer } from '@/components/AuthInitializer';

export const App: FC = () => {
  return (
    <BrowserRouter>
      <AuthInitializer />
      <Routes>
        <Route element={<AppLayout />}>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* Protected */}
          <Route element={<AuthGuard />}>
            <Route path="/giochi/scopone-scientifico" element={<ScoponeScientifico />} />
            <Route path="/giochi/tresette" element={<Tresette />} />
            <Route path="/dev" element={<Playroom />} />
            <Route path="/game/:id" element={<GameRoom />} />
            <Route path="/admin/delete" element={<AdminDelete />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
