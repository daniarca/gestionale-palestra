import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const SplitText = ({
  text,
  className,
  delay = 100,
  duration = 0.6,
  ease = "power3.out",
  splitType = "chars",
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  onLetterAnimationComplete
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const elements = containerRef.current.querySelectorAll('.split-char');
    if (elements.length === 0) return;

    gsap.fromTo(elements, 
      { ...from },
      { 
        ...to,
        duration,
        ease,
        stagger: delay / 1000, // GSAP usa i secondi, quindi convertiamo
        onComplete: onLetterAnimationComplete,
      }
    );
  }, [text, delay, duration, ease, from, to, onLetterAnimationComplete]);

  const chars = text.split('').map((char, index) => (
    <span
      key={index}
      className="split-char"
      style={{ display: 'inline-block', opacity: 0 }} // Inizia invisibile
    >
      {char === ' ' ? '\u00A0' : char}
    </span>
  ));

  return (
    <div ref={containerRef} className={className} aria-label={text}>
      {chars}
    </div>
  );
};

export default SplitText;