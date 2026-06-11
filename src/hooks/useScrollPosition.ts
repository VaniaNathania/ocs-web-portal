import { useEffect, useState, RefObject } from 'react';

interface IUseScrollPositionProps {
  targetRef?: RefObject<HTMLElement | Document | undefined>;
}

const useScrollPosition = ({ targetRef }: IUseScrollPositionProps = {}): number => {
  const [scrollPosition, setScrollPosition] = useState<number>(0);

  useEffect(() => {
    const target = targetRef?.current || document;
    const scrollable = target === document ? window : target;

    let ticking = false;

    const updatePosition = () => {
      const scrollY = target === document ? window.scrollY : (target as HTMLElement).scrollTop;
      setScrollPosition(scrollY);
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updatePosition();
          ticking = false;
        });
        ticking = true;
      }
    };

    scrollable.addEventListener('scroll', handleScroll, { passive: true } as AddEventListenerOptions);
    updatePosition();

    return () => {
      scrollable.removeEventListener('scroll', handleScroll);
    };
  }, [targetRef]);

  return scrollPosition;
};

export { useScrollPosition };