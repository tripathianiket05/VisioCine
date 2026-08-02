import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Adding a slight delay can help in case of render blocking, 
    // but typically just scrollTo works fine in React Router.
    window.scrollTo(0, 0);
  }, [pathname, search]);

  return null;
}
