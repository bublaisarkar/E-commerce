import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  // Get the current location object from React Router
  const { pathname } = useLocation();

  useEffect(() => {
    // Scrolls the window to the top-left corner (0, 0) whenever the pathname changes.
    // This is triggered every time a route navigation occurs.
    window.scrollTo(0, 0);
  }, [pathname]); // Dependency array: runs only when pathname changes

  // This component doesn't render anything, it just handles a side effect.
  return null;
};

export default ScrollToTop;