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
        title: 'Mt. Kilimanjaro',
        facts: [
            { icon: 'mountain', text: 'Highest free-standing mountain in the world; highest peak in Africa at 19,341 ft (5,895 m).' },
            { icon: 'volcano', text: 'A dormant volcanic massif composed of three cones (Kibo, Mawenzi, and Shira).' },
            { icon: 'compass', text: 'Popular non-technical trekking routes with distinct climate zones from rainforest to alpine desert.' }
        ]
    },
    {
        year: 2028,
        title: 'Mt. Fuji',
        facts: [
            { icon: 'volcano', text: 'Japan’s iconic stratovolcano with a near-perfect conical profile; elevation 3,776 m (12,389 ft).' },
            { icon: 'scroll', text: 'Last erupted in 1707–1708 (the Hōei eruption); a UNESCO World Heritage cultural site.' },
            { icon: 'peak', text: 'Popular for day climbs in summer; famous for sunrise views from the summit (goraiko).' }
        ]
    },
    {
        year: 2029,
        title: 'Everest Base Camp',
        facts: [
            { icon: 'compass', text: 'One of the world’s most famous trekking objectives; South Base Camp (Nepal) sits at ~5,364 m.' },
            { icon: 'climb', text: 'Serves as the staging area for summit expeditions; strong emphasis on acclimatization and logistics.' },
            { icon: 'mountain', text: 'Spectacular high-altitude scenery and Sherpa culture along the Khumbu route.' }
        ]
    },
    {
        year: 2030,
        title: 'Gran Paradiso',
        facts: [
            { icon: 'mountain', text: 'A 4,061 m peak in the Graian Alps of Italy; the centerpiece of Gran Paradiso National Park.' },
            { icon: 'leaf', text: 'Renowned for wildlife (ibex) and classic alpine routes popular with guided climbs.' },
            { icon: 'ice', text: 'Glaciated approaches and non-technical summit routes make it a classic alpine objective.' }
        ]
    },
    {
        year: 2031,
        title: 'Vinson Massif',
        facts: [
            { icon: 'mountain', text: 'The highest peak in Antarctica at 4,892 m (16,050 ft); extremely remote and cold.' },
            { icon: 'snow', text: 'Climbs require significant logistics and are typically flown in via ski-equipped aircraft.' },
            { icon: 'climb', text: 'Part of the Seven Summits — a popular objective for mountaineers pursuing the set.' }
        ]
    },
    {
        year: 2032,
        title: 'Mount Cook',
        facts: [
            { icon: 'mountain', text: 'Also called Aoraki / Mount Cook — New Zealand’s highest peak at 3,724 m (12,218 ft).' },
            { icon: 'ice', text: 'Known for steep, technical alpine routes and extensive glaciation in the Southern Alps.' },
            { icon: 'tree', text: 'Located in Aoraki/Mount Cook National Park with dramatic alpine scenery and mountain weather.' }
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