import { useEffect, useRef } from "react";

export const useIntersection = (onEnter, onLeave) => {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onEnter?.();
        } else {
          onLeave?.();
        }
      },
      {
        threshold: 0.6, // 60% visibility triggers playback
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
      observer.disconnect();
    };
  }, [onEnter, onLeave]);

  return ref;
};
