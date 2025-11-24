import React, { useRef, useState, useEffect } from 'react';
import './Outdoors.css';

const CARD_DATA = [
  {
    id: 'backpacking',
    title: 'Backpacking Trips',
    desc: 'Multi-day routes, campsite selection, water sources and resupply points.',
    size: 'size-lg',
    images: ['/images/backpacking.jpg']
  },
  {
    id: 'hiking',
    title: 'Hiking Trails',
    desc: 'Day hikes and local favorites with trailheads, distance and elevation details.',
    size: 'size-md',
    images: ['/images/hiking-trail.jpg']
  },
  {
    id: 'ragnar',
    title: 'Ragnar Races',
    desc: 'Relay race notes, team logistics, and training tips for multi-leg events.',
    size: 'size-md',
    images: ['/images/Ragnar.jpg']
  },
  {
    id: 'triathlon',
    title: 'Triathlon Training',
    desc: 'Swim/bike/run plans, brick workouts, and gear checklists for triathletes.',
    size: 'size-sm',
    images: ['/images/triathlon.jpg']
  },
  {
    id: 'parks',
    title: 'National Parks',
    desc: 'Highlights, permits, and best seasons for visiting the national parks.',
    size: 'size-md',
    images: ['/images/national-park.jpg']
  }
];

export default function Outdoors() {
  const gridRef = useRef(null);
  const [openCard, setOpenCard] = useState(null);
  const [modalStyle, setModalStyle] = useState(null);
  const [surfaceStyle, setSurfaceStyle] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const startRectRef = useRef(null);
  const measurerRef = useRef(null);
  const [measurerCard, setMeasurerCard] = useState(null);
  const [measurerWidth, setMeasurerWidth] = useState(null);
  const [awaitingMeasure, setAwaitingMeasure] = useState(false);
  // refs to keep latest values for resize handler without re-registering listeners
  const modalStyleRef = useRef(null);
  const surfaceStyleRef = useRef(null);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') setOpenCard(null);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // compute modal size/position to match outdoors-grid size and animate from card rect (FLIP)
  const openModalFor = (card, el) => {
    if (!el) {
      setModalStyle({ width: '90%', height: '70%' });
      setOpenCard(card);
      return;
    }
    const start = el.getBoundingClientRect();
    startRectRef.current = start;

    // On narrow screens, measure the modal content so we animate to the smallest content-fit size
    const isMobile = window.innerWidth <= 900;
    if (isMobile) {
      // target width for mobile modal (small horizontal padding)
      const targetWidth = Math.round(Math.min(window.innerWidth - 32, window.innerWidth * 0.96));
      setMeasurerWidth(targetWidth);
      setMeasurerCard(card);
      setAwaitingMeasure(true);
      // we'll continue the FLIP flow from the measurement effect
      return;
    }

    const gridRect = gridRef.current ? gridRef.current.getBoundingClientRect() : { width: window.innerWidth };
    const finalWidth = Math.min(gridRect.width, window.innerWidth * 0.96);
    const finalHeight = Math.min(gridRect.height, window.innerHeight * 0.9);
    const finalLeft = Math.round((window.innerWidth - finalWidth) / 2);
  const finalTop = Math.round((window.innerHeight - finalHeight) / 2);

    // initial surface matches the card's on-screen rect (viewport coordinates)
    const initial = {
      left: Math.round(start.left),
      top: Math.round(start.top),
      width: Math.round(start.width),
      height: Math.round(start.height)
    };

    const final = {
      left: finalLeft,
      top: finalTop,
      width: Math.round(finalWidth),
      height: Math.round(finalHeight)
    };

    // set states to trigger render of the surface at initial rect
    setSurfaceStyle(initial);
    surfaceStyleRef.current = initial;
    setModalStyle(final);
    modalStyleRef.current = final;
    setOpenCard(card);
    setIsAnimating(true);

    // request frame then set surface to final so CSS transitions animate it
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setSurfaceStyle(final);
      });
    });
  };

  const closeModal = () => {
    // quick fade out: clear openCard and surface
    setIsAnimating(false);
    setSurfaceStyle(null);
    surfaceStyleRef.current = null;
    setModalStyle(null);
    modalStyleRef.current = null;
    setOpenCard(null);
  };

  // respond to window resize/scroll so the modal/surface stays centered and sized to grid
  useEffect(() => {
    function getNavOffset() {
      try {
        const v = getComputedStyle(document.documentElement).getPropertyValue('--nav-height');
        if (!v) return 80;
        // strip non-digits
        const n = parseInt(v.replace(/[^0-9.-]+/g, ''), 10);
        return Number.isFinite(n) ? n : 80;
      } catch {
        return 80;
      }
    }
    function handleResize() {
      if (!openCard) return;
      const gridRect = gridRef.current ? gridRef.current.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
      let finalWidth = Math.min(gridRect.width, window.innerWidth * 0.96);
      let finalHeight = Math.min(gridRect.height, window.innerHeight * 0.9);
      const finalLeft = Math.round((window.innerWidth - finalWidth) / 2);
      const isMobile = window.innerWidth <= 900;
      const navOffset = getNavOffset();
      // if mobile, cap height to viewport minus nav and padding so modal fits and becomes scrollable
      if (isMobile) {
        const mobileMax = Math.max(0, Math.round(window.innerHeight - navOffset - 24));
        finalHeight = Math.min(finalHeight, mobileMax);
        finalWidth = Math.min(finalWidth, Math.round(window.innerWidth - 32));
      }
      // for fixed positioning the top should be viewport-relative (no scrollY) — on mobile stick under nav
      const finalTop = isMobile ? Math.round(navOffset + 8) : Math.round((window.innerHeight - finalHeight) / 2);

      const final = { left: finalLeft, top: finalTop, width: Math.round(finalWidth), height: Math.round(finalHeight) };

      // update modal style and refs
      setModalStyle(final);
      modalStyleRef.current = final;

      // if the FLIP surface is present, move it to the new final rect so it transitions smoothly
      if (surfaceStyleRef.current) {
        setSurfaceStyle(final);
        surfaceStyleRef.current = final;
      }
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [openCard]);

  // when awaitingMeasure is true and measurerRef exists, measure content and continue setting up FLIP animation
  useEffect(() => {
    if (!awaitingMeasure || !measurerRef.current) return;

    function getNavOffset() {
      try {
        const v = getComputedStyle(document.documentElement).getPropertyValue('--nav-height');
        if (!v) return 80;
        const n = parseInt(v.replace(/[^0-9.-]+/g, ''), 10);
        return Number.isFinite(n) ? n : 80;
      } catch {
        return 80;
      }
    }

    const measured = measurerRef.current.getBoundingClientRect();
    let finalWidth = Math.round(measured.width);
    let finalHeight = Math.round(measured.height);
    const finalLeft = Math.round((window.innerWidth - finalWidth) / 2);
    const isMobile = window.innerWidth <= 900;
    const navOffset = getNavOffset();
    if (isMobile) {
      const mobileMax = Math.max(0, Math.round(window.innerHeight - navOffset - 24));
      finalHeight = Math.min(finalHeight, mobileMax);
      finalWidth = Math.min(finalWidth, Math.round(window.innerWidth - 32));
    }
    const finalTop = isMobile ? Math.round(navOffset + 8) : Math.round((window.innerHeight - finalHeight) / 2);

    const final = { left: finalLeft, top: finalTop, width: finalWidth, height: finalHeight };

    const start = startRectRef.current;
    const initial = {
      left: Math.round(start.left),
      top: Math.round(start.top),
      width: Math.round(start.width),
      height: Math.round(start.height)
    };

    // set states and trigger animation
    setSurfaceStyle(initial);
    surfaceStyleRef.current = initial;
    setModalStyle(final);
    modalStyleRef.current = final;
    setOpenCard(measurerCard);
    setIsAnimating(true);

    // animate to final
    requestAnimationFrame(() => requestAnimationFrame(() => setSurfaceStyle(final)));

    // clear measurer state (we measured already)
    setAwaitingMeasure(false);
    setMeasurerCard(null);
    setMeasurerWidth(null);
  }, [awaitingMeasure, measurerRef.current]);

  return (
    <div className="page-container outdoors-page">
      <header className="page-hero outdoors-hero">
        <h1>Outdoors</h1>
        <p>Trails, overnights and route notes — get outside and explore.</p>
      </header>

      <main className="page-content">
        

        <section className="outdoors-grid" ref={gridRef}>
          {CARD_DATA.map((c) => (
            <article key={c.id} className={`outdoor-card ${c.size}`} tabIndex={0} onClick={(e) => openModalFor(c, e.currentTarget)} onKeyDown={(e) => { if (e.key === 'Enter') openModalFor(c, e.currentTarget); }}>
              <div className="card-body">
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </div>
            </article>
          ))}
        </section>

        {/* hidden measurer used to compute content-fit size on mobile */}
        {measurerCard && (
          <div className="modal-measurer" ref={measurerRef} aria-hidden="true">
            <div style={{ width: measurerWidth }}>
              <div className="outdoors-modal">
                <div className="modal-content">
                  <div className="modal-gallery">
                    {measurerCard.images.map((src, i) => (
                      <img key={i} src={src} alt={`${measurerCard.title} ${i+1}`} />
                    ))}
                  </div>
                  <div className="modal-text">
                    <h2>{measurerCard.title}</h2>
                    <p>{measurerCard.desc}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal / pop-out */}
        {openCard && (
          <div className="outdoors-modal-overlay" onClick={closeModal} aria-hidden={isAnimating ? 'true' : 'false'}>
            {/* FLIP surface that animates from card rect to centered modal */}
            {surfaceStyle ? (
              <div
                className="outdoors-modal-surface"
                style={{
                  left: surfaceStyle.left,
                  top: surfaceStyle.top,
                  width: surfaceStyle.width,
                  height: surfaceStyle.height
                }}
                onTransitionEnd={() => {
                  // once surface finished animating to final size, allow full modal content to render inside
                  setIsAnimating(false);
                }}
              >
                {/* During the FLIP animation render a simple placeholder that exactly fills the surface to avoid layout jumps */}
                {isAnimating ? (
                  // show a simple black placeholder panel while the FLIP surface animates
                  <div className="surface-placeholder" />
                ) : (
                  // After animation, render the full modal content and let it fill the surface
                  <div className="outdoors-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={`${openCard.title} details`}>
                    <button className="modal-close" onClick={closeModal} aria-label="Close">×</button>
                    <div className="modal-content">
                      <div className="modal-gallery">
                        {openCard.images.map((src, i) => (
                          <img key={i} src={src} alt={`${openCard.title} ${i+1}`} />
                        ))}
                      </div>
                      <div className="modal-text">
                        <h2>{openCard.title}</h2>
                        <p>{openCard.desc}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // fallback: if FLIP surface isn't available render centered modal sized by modalStyle
              <div className="outdoors-modal" style={{ position: 'fixed', ...modalStyle }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={`${openCard.title} details`}>
                <button className="modal-close" onClick={closeModal} aria-label="Close">×</button>
                <div className="modal-content">
                  <div className="modal-gallery">
                    {openCard.images.map((src, i) => (
                      <img key={i} src={src} alt={`${openCard.title} ${i+1}`} />
                    ))}
                  </div>
                  <div className="modal-text">
                    <h2>{openCard.title}</h2>
                    <p>{openCard.desc}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
