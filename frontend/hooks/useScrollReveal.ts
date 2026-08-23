'use client';

import { useEffect, useRef } from 'react';

interface ScrollRevealOptions {
  threshold?: number;   // 0-1, fraction of element visible before triggering
  rootMargin?: string;  // e.g. '0px 0px -80px 0px'
  once?: boolean;       // trigger only once (default true)
}

/**
 * useScrollReveal — attaches IntersectionObserver to a container element.
 * Any child with class `reveal` will get class `reveal-visible` when scrolled into view.
 * 
 * Usage:
 *   const ref = useScrollReveal();
 *   <section ref={ref}>
 *     <div className="reveal">I animate in</div>
 *   </section>
 */
export function useScrollReveal(options: ScrollRevealOptions = {}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const { threshold = 0.12, rootMargin = '0px 0px -60px 0px', once = true } = options;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            entry.target.classList.remove('reveal-visible');
          }
        });
      },
      { threshold, rootMargin }
    );

    // Observe all .reveal children
    const targets = el.querySelectorAll('.reveal');
    targets.forEach(t => observer.observe(t));

    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin, options.once]);

  return ref;
}
