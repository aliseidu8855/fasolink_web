import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Scrolls to top on route (pathname) change. Keeps hash anchor behavior intact.
export default function ScrollToTop(){
  const { pathname, hash } = useLocation();
  useEffect(()=>{
    if (hash) return; // allow native anchor jump
    window.scrollTo({ top:0, left:0, behavior:'instant' in window ? 'instant' : 'auto' });
  }, [pathname, hash]);
  return null;
}
