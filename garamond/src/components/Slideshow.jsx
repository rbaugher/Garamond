import React, { useEffect, useRef, useState } from 'react';
import './Slideshow.css';

export default function Slideshow({
  slides: propSlides,
  interval = 4000,
  height, // optional CSS height value (e.g., '300px' or '30vh')
  showDots = true,
  showArrows = true,
  startIndex = 0,
  autoPlay = true,
  className = '',
}) {
  const defaultSlides = [
    { src: '/images/Rainier1.jpg', title: 'Views from the mountain', caption: '' },
    { src: '/images/rainier2.svg', title: 'Camp Sunrise', caption: 'A soft pulse animation brings the sunrise to life.' },
    { src: '/images/rainier3.svg', title: 'Trail Stories', caption: 'Slide-in panels reveal route notes and anecdotes.' },
  ];
  const slides = propSlides && propSlides.length ? propSlides : defaultSlides;

  const [index, setIndex] = useState(Math.min(Math.max(0, startIndex), slides.length - 1));
  const [paused, setPaused] = useState(!autoPlay);
  const autoRef = useRef();
  const containerRef = useRef(null);
  const currentRatio = useRef(null); // height / width
  const [containerHeight, setContainerHeight] = useState(undefined);

  // swipe/pointer tracking
  const pointerStartX = useRef(0);
  const pointerDelta = useRef(0);
  const isPointerDown = useRef(false);

  useEffect(() => {
    autoRef.current = () => {
      setIndex(i => (i + 1) % slides.length);
    };
  }, [slides.length]);

  // compute and set container height based on current slide's natural image ratio
  useEffect(() => {
    if (height) return; // explicit height prop takes precedence
    const src = slides[index] && slides[index].src;
    if (!src) return;
    let mounted = true;
    const img = new Image();
    img.src = src;
    img.onload = () => {
      if (!mounted) return;
      const ratio = img.naturalHeight / img.naturalWidth || 0.5;
      currentRatio.current = ratio;
      const width = containerRef.current ? containerRef.current.clientWidth : 0;
      if (width) setContainerHeight(Math.round(width * ratio));
    };
    // if image fails, leave height undefined
    img.onerror = () => { /* ignore */ };
    return () => { mounted = false; };
  }, [index, slides, height]);

  // update height on window resize using last measured ratio
  useEffect(() => {
    if (height) return;
    let timer = null;
    function onResize() {
      if (!currentRatio.current) return;
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      setContainerHeight(Math.round(w * currentRatio.current));
    }
    const debounced = () => { clearTimeout(timer); timer = setTimeout(onResize, 120); };
    window.addEventListener('resize', debounced);
    return () => { clearTimeout(timer); window.removeEventListener('resize', debounced); };
  }, [height]);

  useEffect(() => {
    if (paused) return undefined;
    const id = setInterval(() => autoRef.current(), interval);
    return () => clearInterval(id);
  }, [paused, interval]);

  const go = (dir) => {
    setIndex(i => {
      const next = (i + dir + slides.length) % slides.length;
      return next;
    });
  };

  // pointer handlers for swipe
  function onPointerDown(e) {
    isPointerDown.current = true;
    setPaused(true);
    const clientX = (typeof e.clientX === 'number') ? e.clientX : (e.touches && e.touches[0] && e.touches[0].clientX) || 0;
    pointerStartX.current = clientX;
    pointerDelta.current = 0;
  }

  function onPointerMove(e) {
    if (!isPointerDown.current) return;
    const x = (typeof e.clientX === 'number') ? e.clientX : (e.touches && e.touches[0] && e.touches[0].clientX) || 0;
    pointerDelta.current = x - pointerStartX.current;
  }

  function onPointerUp() {
    if (!isPointerDown.current) return;
    isPointerDown.current = false;
    const delta = pointerDelta.current;
    const threshold = 50; // px
    if (delta > threshold) go(-1);
    else if (delta < -threshold) go(1);
    pointerDelta.current = 0;
    setTimeout(() => setPaused(false), 300); // brief pause before resuming auto-rotate
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowLeft') go(-1);
    if (e.key === 'ArrowRight') go(1);
  }

  return (
    <div
      ref={containerRef}
      className={`slideshow ${className}`}
      onMouseEnter={() => autoPlay && setPaused(true)}
      onMouseLeave={() => autoPlay && setPaused(false)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onTouchStart={onPointerDown}
      onTouchMove={onPointerMove}
      onTouchEnd={onPointerUp}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Image slideshow"
      style={height ? { height } : (containerHeight ? { height: `${containerHeight}px` } : undefined)}
    >
      {slides.map((s, i) => (
        <div
          key={i}
          className={"slide" + (i === index ? ' active' : '')}
          role="group"
          aria-roledescription="slide"
          aria-label={`${i + 1} of ${slides.length}: ${s.title}`}
        >
          <img className="slide-img" src={s.src} alt={s.title || `slide ${i+1}`} draggable={false} />
          <div className="slide-caption">
            <h3>{s.title}</h3>
            {s.caption && <p>{s.caption}</p>}
          </div>
        </div>
      ))}

      {showArrows && (
        <>
          <button className="slideshow-arrow left" onClick={() => { go(-1); setPaused(true); setTimeout(()=>setPaused(false), 500); }} aria-label="Previous slide">‹</button>
          <button className="slideshow-arrow right" onClick={() => { go(1); setPaused(true); setTimeout(()=>setPaused(false), 500); }} aria-label="Next slide">›</button>
        </>
      )}

      {showDots && (
        <div className="slideshow-dots" aria-hidden={false}>
          {slides.map((_, i) => (
            <button
              key={i}
              className={"dot" + (i === index ? ' active' : '')}
              onClick={() => { setIndex(i); setPaused(true); setTimeout(()=>setPaused(false), 700); }}
              aria-label={`Show slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
