import { useEffect, useRef, useState } from 'react';
import './Carousel.css';

const TRANSITION_TIME = 2000;
const AUTO_NEXT_TIME = 9000;

const desktopSlides = [
  { bg: '/images/beach.jpg', title: 'SLIDER', name: 'EAGLE', des: 'Explore the serene beaches with stunning views.' },
  { bg: '/images/Everest.jpg', title: 'SLIDER', name: 'OWL', des: 'Discover the majestic peaks of Everest.' },
  { bg: '/images/heavens.jpg', title: 'SLIDER', name: 'CROW', des: 'Soar through the heavenly skies.' },
  { bg: '/images/sands.jpg', title: 'SLIDER', name: 'OWL', des: 'Feel the warmth of desert sands.' },
  { bg: '/images/shuttle_launch.jpg', title: 'SLIDER', name: 'EAGLE', des: 'Experience the thrill of a shuttle launch.' },
  { bg: '/images/img-home.jpg', title: 'SLIDER', name: 'KINGFISHER', des: 'Dive into vibrant coastal waters.' },
  { bg: '/images/hiker.jpg', title: 'SLIDER', name: 'PARROT', des: 'Trek through lush mountain trails.' },
];

const mobileSlides = [
  { bg: '/images/moose.jpg', title: 'SLIDER', name: 'EAGLE', des: 'Beach views.' },
  { bg: '/images/Everest.jpg', title: 'SLIDER', name: 'OWL', des: 'Everest peaks.' },
  { bg: '/images/img-home.jpg', title: 'SLIDER', name: 'CROW', des: 'Sky adventures.' },
  { bg: '/images/heavens.jpg', title: 'SLIDER', name: 'BUTTERFLY', des: 'Nature’s beauty.' },

];

export default function Carousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 960);
  const autoNextRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const slides = isMobile ? mobileSlides : desktopSlides;
  const total = slides.length;

  const goTo = (index) => {
    setActiveIndex(index);
    if (autoNextRef.current) clearTimeout(autoNextRef.current);
    if (!isPaused) {
      autoNextRef.current = setTimeout(() => {
        goTo((index + 1) % total);
      }, AUTO_NEXT_TIME);
    }
  };

  const next = () => goTo((activeIndex + 1) % total);
  const prev = () => goTo((activeIndex - 1 + total) % total);

  const handlePreviewClick = (index) => {
    goTo(index);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (e.touches.length !== 1) return;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) > 50) {
      e.preventDefault();
      if (diff > 0) next();
      else prev();
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const handleTouchCancel = () => {
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 960);
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isPaused) {
      autoNextRef.current = setTimeout(next, AUTO_NEXT_TIME);
    }
    return () => clearTimeout(autoNextRef.current);
  }, [activeIndex, isPaused]);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  const getPreviewStyle = (index) => {
    const distance = (index - activeIndex + total) % total;
    if (distance === 0) return null;

    const spacing = 100;
    const startPercent = 75;
    const offsetPx = (distance - 1) * spacing;
    const leftPercent = startPercent + (offsetPx / window.innerWidth) * 100;

    const opacity = distance > 5 ? 0 : 1 - (distance - 1) * 0.15;
    const scale = 1 - (distance - 1) * 0.08;

    return {
      left: `${leftPercent}%`,
      opacity,
      transform: `translateY(-70%) scale(${scale}) translateZ(0)`,
      zIndex: 200 - distance,
    };
  };

  return (
    <div className="carousel-wrapper">
      <div className="navbar-spacer"></div>
      <div
        className={`timeRunning ${!isPaused ? 'active' : ''}`}
        key={activeIndex}
      ></div>

      <div
        className="carousel"
        role="region"
        aria-label="Carousel"
        tabIndex={0}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') prev();
          if (e.key === 'ArrowRight') next();
        }}
      >
        <ul className="list">
          {slides.map((slide, i) => {
            const isActive = i === activeIndex;
            const previewStyle = !isActive ? getPreviewStyle(i) : null;

            return (
              <li
                key={i}
                className={`item ${isActive ? 'active' : 'preview'}`}
                style={{
                  backgroundImage: `url(${slide.bg})`,
                  ...(isActive
                    ? {
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        borderRadius: 0,
                        transform: 'translate(0,0) translateZ(0)',
                      }
                    : previewStyle),
                }}
                role="group"
                aria-label={`Slide ${i + 1}: ${slide.name}`}
                aria-hidden={!isActive}
                onClick={() => !isActive && handlePreviewClick(i)}
              >
                {isActive && (
                  <div className="content">
                    <div className="title">{slide.title}</div>
                    <div className="name">{slide.name}</div>
                    <div className="des">{slide.des}</div>
                    <div className="btn">
                      <button>See More</button>
                      <button>Subscribe</button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}