import { useEffect, useState } from 'react';

const useIsTablet = () => {
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsTablet(window.innerWidth < 1080); // Tailwind md breakpoint
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isTablet;
};

export default useIsTablet;
