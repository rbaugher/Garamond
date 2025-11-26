import { useEffect, useRef, useState } from 'react';
import './Carousel.css';

const TRANSITION_TIME = 2000;
// Increase slide display time by 50%
const AUTO_NEXT_TIME = 20000;

const desktopSlides = [
  { bg: '/images/waters.jpg', title: 'Waters', name: 'Genesis 1:2', des: 'The earth was without form and void, and darkness was over the face of the deep. And the Spirit of God was hovering over the face of the waters.' },
  { bg: '/images/Everest.jpg', title: 'Mountains', name: 'Psalm 65:5-6', des: 'By awesome deeds you answer us with righteousness, O God of our salvation, the hope of all the ends of the earth and of the farthest seas.' },
  { bg: '/images/heavens.jpg', title: 'Heavens', name: 'Psalm 19:1', des: 'The heavens declare the glory of God, and the sky above proclaims his handiwork.' },
  { bg: '/images/sands.jpg', title: 'Sands', name: 'Psalm 139:17-18', des: 'How precious to me are your thoughts, O God! How vast is the sum of them! If I would count them, they are more than the sand. I awake, and I am still with you.' },
  { bg: '/images/shuttle_launch.jpg', title: 'Above', name: 'Psalm 148:1', des: 'Praise the LORD! Praise the LORD from the heavens; praise Him in the heights!' },
  { bg: '/images/img-home.jpg', title: 'Seas', name: 'Mark 4:41', des: 'And they were filled with great fear and said to one another, "Who then is this, that even the wind and the sea obey him?"' },
  { bg: '/images/birds.jpg', title: 'Birds', name: 'Matthew 6:26', des: 'Look at the birds of the air: they neither sow nor reap nor gather into barns, and yet your heavenly Father feeds them. Are you not of more value than they?' },
];

const mobileSlides = [
  { bg: '/images/moose.jpg', title: 'Waters', name: 'Psalm 104:24,27', des: 'O LORD, how manifold are your works! In widsom have you made them all; the earth is full of your creatures. These all look to you, to give them their food in due season.' },
  { bg: '/images/Everest.jpg', title: 'Mountains', name: 'Psalm 65:5-6', des: 'By awesome deeds you answer us with righteousness, O God of our salvation, the hope of all the ends of the earth and of the farthest seas.' },
  { bg: '/images/img-home.jpg', title: 'Seas', name: 'Mark 4:41', des: 'And they were filled with great fear and said to one another, "Who then is this, that even the wind and the sea obey him?"' },
  { bg: '/images/heavens.jpg', title: 'Heavens', name: 'Psalm 19:1', des: 'The heavens declare the glory of God, and the sky above proclaims his handiwork.' },

];

export default function Carousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 960);
  const [showPopup, setShowPopup] = useState(false);
  const [chapterText, setChapterText] = useState('');
  const [chapterReference, setChapterReference] = useState('');
  const [chapterVersion, setChapterVersion] = useState('');
  const [loadingChapter, setLoadingChapter] = useState(false);
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

  // Do not pause on hover
  // const handleMouseEnter = () => setIsPaused(true);
  // const handleMouseLeave = () => setIsPaused(false);

  const handleSeeMore = async (reference) => {
    setLoadingChapter(true);
    setShowPopup(true);
    setIsPaused(true);
    
    try {
      const apiBase = (import.meta.env && import.meta.env.VITE_API_BASE) ? import.meta.env.VITE_API_BASE : '';
      const response = await fetch(`${apiBase}/api/bible?reference=${encodeURIComponent(reference)}`);
      const data = await response.json();
      
      if (response.ok) {
        setChapterText(data.text);
        setChapterReference(data.reference);
        setChapterVersion(data.version || 'WEB');
      } else {
        setChapterText('Failed to load chapter. Please try again.');
        setChapterReference(reference);
        setChapterVersion('');
      }
    } catch (err) {
      console.error('Error fetching Bible chapter:', err);
      setChapterText('Failed to load chapter. Please try again.');
      setChapterReference(reference);
      setChapterVersion('');
    } finally {
      setLoadingChapter(false);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setIsPaused(false);
  };

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
                  <div className="content-blur-backdrop">
                    {/* Pause / Resume control inside blurred component */}
                    <button
                      className="carousel-pause-btn"
                      onClick={() => setIsPaused(p => !p)}
                      aria-label={isPaused ? 'Resume carousel' : 'Pause carousel'}
                    >
                      {isPaused ? 'Resume' : 'Pause'}
                    </button>
                    <div className="content">
                      <div className="title">{slide.title}</div>
                      <div className="name">{slide.name}</div>
                      <div className="des">{slide.des}</div>
                      <div className="btn">
                        <button onClick={() => handleSeeMore(slide.name)}>See More</button>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Bible Chapter Popup */}
      {showPopup && (
        <div className="bible-popup-overlay" onClick={closePopup}>
          <div className="bible-popup" onClick={(e) => e.stopPropagation()}>
            <button className="bible-popup-close" onClick={closePopup} aria-label="Close popup">
              ×
            </button>
            <div className="bible-popup-header">
              <h2>{chapterReference}</h2>
            </div>
            <div className="bible-popup-content">
              {loadingChapter ? (
                <p className="loading">Loading chapter...</p>
              ) : (
                <div className="bible-text">{chapterText}</div>
              )}
            </div>
            <div className="bible-popup-footer">
              <p>{chapterVersion === 'ESV' ? 'English Standard Version (ESV)' : chapterVersion === 'WEB' ? 'World English Bible (WEB)' : chapterVersion}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}