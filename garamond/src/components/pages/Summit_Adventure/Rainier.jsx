import React from 'react';
import './rainier.css';
import Slideshow from '../../Slideshow';

export default function Rainier() {
  return (
    <div className="rainier-page">
      <header className="rainier-hero">
        <div className="hero-overlay" />
        <h1 className="hero-title">Mt. Rainier — 2026 Summit</h1>
      </header>

      <main className="rainier-content">
        <section className="intro logbook">
          <h2>Summit Logbook</h2>
          <p className="intro-sub">Field notes and anecdotes collected on our approach and climb. Read the team's short entries below — timestamps and authors preserved.</p>

          <div className="log-entries">
            <article className="log-entry">
              <div className="entry-meta">
                <span className="avatar">🧗‍♀️</span>
                <div className="meta-text">
                  <strong className="author">A. Morales</strong>
                  <time className="timestamp">Jun 12, 2026 — 07:14</time>
                </div>
              </div>
              <div className="entry-text">
                <p>We started just before dawn. The headlamp line looked like a string of slow-fire lanterns down the glacier. Crevasse training paid off — we roped up for the first big traverse.</p>
                <p className="entry-note">Saw a ptarmigan near Camp 1 — quiet reminder that we're guests up here.</p>
              </div>
            </article>

            <article className="log-entry">
              <div className="entry-meta">
                <span className="avatar">🧑‍💼</span>
                <div className="meta-text">
                  <strong className="author">K. Singh</strong>
                  <time className="timestamp">Jun 13, 2026 — 13:02</time>
                </div>
              </div>
              <div className="entry-text">
                <p>Camped at Ingraham Flats. Wind picked up overnight but the starglow and the west ridge silhouette made the cold worth it. Fixed a snapped ice screw — reminder to double-check gear before the ridge.</p>
                <p className="entry-note">Tip: Lay out crampons and harness the night before the summit push.</p>
              </div>
            </article>

            <article className="log-entry">
              <div className="entry-meta">
                <span className="avatar">🗺️</span>
                <div className="meta-text">
                  <strong className="author">L. Park</strong>
                  <time className="timestamp">Jun 14, 2026 — 10:12</time>
                </div>
              </div>
              <div className="entry-text">
                <p>Took a different line around the bergschrund to avoid refrozen ice. Route-finding felt cleaner with the morning light. Everyone kept pace, and morale stayed high.</p>
                <p className="entry-note">Note: mark the map with cairn locations for the descent.</p>
              </div>
            </article>

            <article className="log-entry">
              <div className="entry-meta">
                <span className="avatar">🧰</span>
                <div className="meta-text">
                  <strong className="author">M. Ortega</strong>
                  <time className="timestamp">Jun 14, 2026 — 11:47</time>
                </div>
              </div>
              <div className="entry-text">
                <p>Replaced a broken crampon strap during the approach. Quick field repair kept the rhythm going. Reminder to pack spare fasteners and a small multi-tool.</p>
                <p className="entry-note">Gear tip: duct tape wrapped around an ice screw works as a temporary strap in an emergency.</p>
              </div>
            </article>

            <article className="log-entry">
              <div className="entry-meta">
                <span className="avatar">☕</span>
                <div className="meta-text">
                  <strong className="author">S. Patel</strong>
                  <time className="timestamp">Jun 15, 2026 — 08:30</time>
                </div>
              </div>
              <div className="entry-text">
                <p>Last morning before departure, we shared stories over hot drinks. The simple routine of packing felt ceremonial — everyone double-checked their kit before the final push.</p>
                <p className="entry-note">Leave a short note in the summit log for future teams — a simple greeting carries weight.</p>
              </div>
            </article>

            <article className="log-entry">
              <div className="entry-meta">
                <span className="avatar">🌲</span>
                <div className="meta-text">
                  <strong className="author">R. Chen</strong>
                  <time className="timestamp">Jun 14, 2026 — 05:58</time>
                </div>
              </div>
              <div className="entry-text">
                <p>Summit day felt surreal. The sunrise at the crater rim — colors you'd swear were painted — and the team kept steady, step by step. Keep your breathing slow and deliberate on the final pitches.</p>
                <p className="entry-note">Celebrated with instant coffee and photos. Leave no trace — pack out all waste.</p>
              </div>
            </article>
          </div>
        </section>

        <section className="gallery">
          <h2>Animated Highlights</h2>
          <Slideshow
            slides={[
              { src: '/images/Rainier1.jpg', title: 'Sunrise over Camp', caption: '' },
              { src: '/images/Rainier2.jpg', title: 'View of the Summit', caption: '' },
              { src: '/images/Rainier3.jpg', title: 'Trail Legends', caption: '' },
            ]}
            interval={4500}
            showArrows={true}
            showDots={true}
            startIndex={0}
            autoPlay={true}
          />
        </section>

        <section className="articles">
          <h2>Articles & Tips</h2>
          <article>
            <h3>Safety and Preparation</h3>
            <p>Always check the weather, carry proper glacier gear, and travel with an experienced guide when crossing crevassed terrain. Helpful resources:
              <a href="https://www.alpineclub.org.uk/" target="_blank" rel="noopener noreferrer"> Alpine Club</a>,
              <a href="https://americanalpineclub.org/" target="_blank" rel="noopener noreferrer"> American Alpine Club</a>, and
              <a href="https://www.mountainproject.com/" target="_blank" rel="noopener noreferrer"> Mountain Project</a>.
            </p>
          </article>
          <article>
            <h3>Best Time to Climb</h3>
            <p>Late spring through early summer provides stable conditions, but always be prepared for sudden changes. Trip planning and beta:
              <a href="https://www.nps.gov/mora/planyourvisit/climbing.htm" target="_blank" rel="noopener noreferrer"> NPS Climbing Info</a>,
              <a href="https://www.mountainproject.com/route/105840736" target="_blank" rel="noopener noreferrer"> Route Notes (example)</a>, and
              <a href="https://www.outsideonline.com/" target="_blank" rel="noopener noreferrer"> Outside Online</a>.
            </p>
          </article>
        </section>

        <section className="notes">
          <h2>Notes & Itinerary</h2>
          <div className="itinerary">
            <ol className="itinerary-list">
              <li className="itinerary-item">
                <strong>Day 0 — Arrival</strong>: Meet at the trailhead, finalize gear checks and route briefing.
              </li>
              <li className="itinerary-item">
                <strong>Day 1 — Approach</strong>: Hike to Camp 1, practice crevasse rescue drills.
              </li>
              <li className="itinerary-item">
                <strong>Day 2 — Acclimatize</strong>: Rest day, weather check, and rope-team practice.
              </li>
              <li className="itinerary-item">
                <strong>Day 3 — Summit Push</strong>: Early start for summit push; descend to base camp in the afternoon.
              </li>
            </ol>
          </div>
        </section>
      </main>

      <footer className="rainier-footer">
        <p>© Summit Adventure 2026 — Mt. Rainier</p>
      </footer>
    </div>
  );
}
