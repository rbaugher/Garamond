import React from 'react';
import './rainier.css';

export default function Rainier() {
  return (
    <div className="rainier-page">
      <header className="rainier-hero">
        <div className="hero-overlay" />
        <h1 className="hero-title">Mt. Rainier — 2026 Summit</h1>
        <p className="hero-sub">Stories, tips, and animated highlights from our Rainier adventure.</p>
      </header>

      <main className="rainier-content">
        <section className="intro">
          <h2>About Mt. Rainier</h2>
          <p>
            Mount Rainier is an active stratovolcano in the Cascade Range of the Pacific Northwest.
            Rising to 14,411 feet (4,392 m), it is the highest mountain in Washington and a prominent landmark visible from Seattle.
          </p>
        </section>

        <section className="gallery">
          <h2>Animated Highlights</h2>
          <div className="cards">
            <article className="card float-card">
              <div className="card-image img1" />
              <h3>Glacier Approach</h3>
              <p>Watch the glacier shimmer with a subtle parallax float.</p>
            </article>
            <article className="card pulse-card">
              <div className="card-image img2" />
              <h3>Camp Sunrise</h3>
              <p>A soft pulse animation brings the sunrise to life.</p>
            </article>
            <article className="card slide-card">
              <div className="card-image img3" />
              <h3>Trail Stories</h3>
              <p>Slide-in panels reveal route notes and anecdotes.</p>
            </article>
          </div>
        </section>

        <section className="articles">
          <h2>Articles & Tips</h2>
          <article>
            <h3>Safety and Preparation</h3>
            <p>Always check the weather, carry proper glacier gear, and travel with an experienced guide when crossing crevassed terrain.</p>
          </article>
          <article>
            <h3>Best Time to Climb</h3>
            <p>Late spring through early summer provides stable conditions, but always be prepared for sudden changes.</p>
          </article>
        </section>
      </main>

      <footer className="rainier-footer">
        <p>© Summit Adventure 2026 — Mt. Rainier</p>
      </footer>
    </div>
  );
}
