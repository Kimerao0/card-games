import { type FC } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { Home } from '@/pages/Home';
import { NotFound } from '@/pages/NotFound';

export const App: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};
