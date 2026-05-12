import { AnimatePresence, LayoutGroup } from 'framer-motion';
import { Route, Routes, useLocation } from 'react-router-dom';
import { CharacterDetailPage } from './pages/CharacterDetailPage';
import { HomePage } from './pages/HomePage';

export default function App() {
   const location = useLocation();

   return (
      <LayoutGroup id="portal-app">
         {/* popLayout mantém a rota que sai no DOM o tempo da animação (bom para layoutId + saida do grid) */}
         <AnimatePresence mode="popLayout" initial={false}>
            <Routes location={location} key={location.pathname}>
               <Route path="/" element={<HomePage />} />
               <Route path="/character/:id" element={<CharacterDetailPage />} />
            </Routes>
         </AnimatePresence>
      </LayoutGroup>
   );
}
