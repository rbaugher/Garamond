import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import './Summit_Adventure.css';

// use Heroicons package for badges
import {
    DocumentTextIcon,
    FireIcon,
    ChartBarIcon,
    CloudIcon,
    PhotoIcon,
    GlobeAltIcon,
    SparklesIcon,
    WrenchScrewdriverIcon,
    ArrowUpIcon,
    MapPinIcon
} from '@heroicons/react/24/solid';

const ICON_MAP = {
    mountain: MapPinIcon,
    volcano: FireIcon,
    scroll: DocumentTextIcon,
    ruler: ChartBarIcon,
    snow: CloudIcon,
    peak: PhotoIcon,
    compass: GlobeAltIcon,
    leaf: SparklesIcon,
    pick: WrenchScrewdriverIcon,
    ice: CloudIcon,
    climb: ArrowUpIcon,
    tree: GlobeAltIcon,
    rain: CloudIcon
};

const YEARS = [
    {
        year: 2026,
        title: 'Rainier',
        route: '/summit_adventure/rainier',
        facts: [
            { icon: 'mountain', text: 'Elevation: 14,411 ft — highest peak in Washington State.' },
            { icon: 'volcano', text: 'Volcano type: Stratovolcano with extensive glaciation (many glaciers on its flanks).' },
            { icon: 'scroll', text: 'First recorded ascent: 1870 by Hazard Stevens and P. B. Van Trump.' }
        ]
    },
    {
        year: 2027,
        title: 'St. Helens',
        facts: [
            { icon: 'volcano', text: 'Famous 1980 eruption dramatically altered the mountain and surrounding landscape.' },
            { icon: 'ruler', text: 'Elevation: ~8,363 ft (notable change after the 1980 eruption).' }
        ]
    },
    {
        year: 2028,
        title: 'Baker',
        facts: [
            { icon: 'snow', text: 'Active glacier-covered stratovolcano in the North Cascades.' },
            { icon: 'peak', text: 'Home to one of the heaviest snowfall records in the U.S.; great for alpine climbing.' }
        ]
    },
    {
        year: 2029,
        title: 'Adams',
        facts: [
            { icon: 'compass', text: 'Large, potentially active stratovolcano with varied climbing routes.' },
            { icon: 'leaf', text: 'Notable for its broad flanks and scenic high alpine meadows.' }
        ]
    },
    {
        year: 2030,
        title: 'Hood',
        facts: [
            { icon: 'pick', text: 'Oregon’s highest peak at 11,249 ft and a popular year-round climbing destination.' },
            { icon: 'ice', text: 'Features glaciers and several technical routes; visible from Portland on clear days.' }
        ]
    },
    {
        year: 2031,
        title: 'Shasta',
        facts: [
            { icon: 'mountain', text: 'Stands at 14,179 ft and is a prominent volcanic peak in Northern California.' },
            { icon: 'climb', text: 'Known for long climbing seasons and a variety of routes from hikes to technical climbs.' }
        ]
    },
    {
        year: 2032,
        title: 'Olympus',
        facts: [
            { icon: 'tree', text: 'Refers to the high peaks of the Olympic Mountains (e.g., Mount Olympus).' },
            { icon: 'rain', text: 'Coastal climate creates lush alpine meadows and rugged, weathered summits.' }
        ]
    }
];

export default function Summit() {
    const [activeYear, setActiveYear] = useState(YEARS[0].year);
    const [seenYears, setSeenYears] = useState([]);
    const activeYearRef = React.useRef(activeYear);
    const timeoutsRef = React.useRef([]);

    // keep ref in sync
    useEffect(() => { activeYearRef.current = activeYear; }, [activeYear]);

    useEffect(() => {
        // Replace IntersectionObserver with a rAF-driven scroll handler that
        // computes which section's center is closest to the viewport center.
        // This approach reduces jitter and gives smoother transitions.
        let rafId = null;
        let running = false;

        const ids = YEARS.map(y => `year-${y.year}`);
        let sections = ids.map(id => document.getElementById(id)).filter(Boolean);

        function updateSections() {
            sections = ids.map(id => document.getElementById(id)).filter(Boolean);
        }

        function onScroll() {
            if (running) return;
            running = true;
            rafId = window.requestAnimationFrame(() => {
                const vpCenter = window.innerHeight / 2;
                let best = { year: activeYearRef.current, dist: Infinity };
                sections.forEach((el) => {
                    const rect = el.getBoundingClientRect();
                    const elCenter = rect.top + rect.height / 2;
                    const dist = Math.abs(elCenter - vpCenter);
                    if (dist < best.dist) {
                        const year = parseInt(el.id.replace('year-', ''), 10);
                        best = { year, dist };
                    }
                });
                if (best.year && best.year !== activeYearRef.current) {
                    setActiveYear(best.year);
                    activeYearRef.current = best.year;
                    // schedule marking this card as 'seen' after the animation duration
                    const t = setTimeout(() => {
                        setSeenYears(prev => (prev.includes(best.year) ? prev : [...prev, best.year]));
                    }, 800);
                    timeoutsRef.current.push(t);
                }
                running = false;
            });
        }

        // initial populate
        updateSections();
        // listen for layout changes
        window.addEventListener('resize', updateSections, { passive: true });
        window.addEventListener('scroll', onScroll, { passive: true });

        // trigger initial evaluation so the correct nav item is active on load
        onScroll();

        return () => {
            window.removeEventListener('resize', updateSections);
            window.removeEventListener('scroll', onScroll);
            if (rafId) window.cancelAnimationFrame(rafId);
            // clear any pending timeouts used to mark cards as seen
            timeoutsRef.current.forEach(t => clearTimeout(t));
            timeoutsRef.current = [];
        };
    }, []);

    const handleNavClick = (e, year) => {
        e.preventDefault();
        const el = document.getElementById(`year-${year}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setActiveYear(year);
        const t = setTimeout(() => {
            setSeenYears(prev => (prev.includes(year) ? prev : [...prev, year]));
        }, 800);
        timeoutsRef.current.push(t);
    };

    return (
            <div className="summit-container">
                <header className="summit-header">
                    <h1>Summit Adventure</h1>
                    <p>Explore our annual summit series — plans, stories, and highlights for each year.</p>
                </header>

                <div className="summit-body">
                    <nav className="summit-side-nav" aria-label="Year navigation">
                        <ul>
                            {YEARS.map(y => (
                                <li key={y.year}>
                                    <a
                                        href={`#year-${y.year}`}
                                        className={activeYear === y.year ? 'active' : ''}
                                        onClick={(e) => handleNavClick(e, y.year)}
                                        aria-current={activeYear === y.year ? 'true' : 'false'}
                                    >
                                        {y.year} · {y.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                            <div className="years-grid vertical">
                                {YEARS.map((y, idx) => (
                                    <React.Fragment key={y.year}>
                                        <div className="year-divider" aria-hidden="true"><span>{y.year}</span></div>
                                        <section id={`year-${y.year}`} className={`year-card ${activeYear === y.year ? 'in-view' : ''} ${seenYears.includes(y.year) ? 'seen' : ''}`}>
                                            <h3 className="year-title">
                                                {y.route ? (
                                                    <Link to={y.route} className="year-link">{y.title}</Link>
                                                ) : (
                                                    y.title
                                                )}
                                            </h3>
                                            <p className="year-summary">Adventures, logistics, and write-ups for the {y.year} summit.</p>
                                                {/* render facts to increase card height and provide quick mountain info */}
                                                {y.facts && (
                                                    <>
                                                        <ul className="year-facts">
                                                            {y.facts.map((f, i) => (
                                                                <li key={i}>
                                                                    <span className="fact-badge" aria-hidden="true">
                                                                        {(() => {
                                                                            const C = ICON_MAP[f.icon] || MapPinIcon;
                                                                            return <C className="fact-icon" aria-hidden="true" />;
                                                                        })()}
                                                                    </span>
                                                                    <span className="fact-text">{f.text}</span>
                                                                </li>
                                                            ))}
                                                        </ul>

                                                        {/* collapsible version for very small screens */}
                                                        <details className="year-facts-collapsible">
                                                            <summary>Facts</summary>
                                                            <ul>
                                                                {y.facts.map((f, i) => (
                                                                    <li key={`c-${i}`}>
                                                                        <span className="fact-badge" aria-hidden="true">
                                                                            {(() => {
                                                                                const C = ICON_MAP[f.icon] || MapPinIcon;
                                                                                return <C className="fact-icon" aria-hidden="true" />;
                                                                            })()}
                                                                        </span>
                                                                        <span className="fact-text">{f.text}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </details>
                                                    </>
                                                )}
                                                {y.route && <div className="year-cta"><Link to={y.route} className="cta">Explore {y.title}</Link></div>}
                                        </section>
                                    </React.Fragment>
                                ))}
                            </div>
                </div>
            </div>
        );
}