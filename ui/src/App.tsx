import { type FC } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { Home } from '@/pages/Home';
import { NotFound } from '@/pages/NotFound';
import { Playroom } from '@/pages/Playroom';

export const App: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/giochi/scopone-scientifico" element={<div>Scopone scientifico (regole + crea/join)</div>} />
        <Route path="/giochi/tresette" element={<div>Tresette (regole + crea/join)</div>} />
        <Route path="/dev" element={<Playroom />} />

        {/* catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};
