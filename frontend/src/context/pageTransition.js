import { createContext, useContext } from 'react';

export const PageTransitionContext = createContext(null);

export const usePageTransition = () => {
  const ctx = useContext(PageTransitionContext);
  if (!ctx) throw new Error('usePageTransition must be used within PageTransitionProvider');
  return ctx;
};
