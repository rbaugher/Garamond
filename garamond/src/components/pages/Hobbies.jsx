import React from 'react';
import '../../App.css';
import './Hobbies.css';

export default function Hobbies() {
  const legoImages = [
    '/images/Rainier1.jpg',
    '/images/Rainier2.jpg',
    '/images/Rainier3.jpg',
  ];

  return (
    <div className="page-container hobbies-page">
      <header className="page-hero">
        <h1>Hobbies</h1>
        <p>Projects, crafts and side quests — what we tinker with off the trail.</p>
      </header>

      <main className="page-content">
        <div className="hobbies-grid">
          {/* Large feature card */}
          <article className="hobby-card size-lg">
            <img src="/images/wood working.jpg" alt="Woodworking" className="card-media" />
            <div className="card-body">
              <h3>Woodworking</h3>
              <p>Small furniture builds, tool maintenance, and finishing techniques — bench projects, joinery and finishing.</p>
            </div>
          </article>

          <article className="hobby-card size-md">
            <img src="/images/lego.jpg" alt="Legos" className="card-media" />
            <div className="card-body">
              <h3>Lego Builds</h3>
              <p>Patience, iteration and clever engineering in small bricks!</p>
            </div>
          </article>

          <article className="hobby-card size-sm">
            <img src="/images/blacksmithing.jpg" alt="Blacksmithing" className="card-media" />
            <div className="card-body">
              <h3>Blacksmithing</h3>
              <p>Knife blanks, hooks, and decorative metalwork. Safety first: gloves, eye protection and ventilation.</p>
            </div>
          </article>

          <article className="hobby-card size-md">
            <img src="/images/robotics.jpg" alt="Robotics" className="card-media" />
            <div className="card-body">
              <h3>Robotics & Smart Machines</h3>
              <p>Animated micro-robots and small automatons — simple motors, linkages, and microcontroller code.</p>
            </div>
          </article>

          <article className="hobby-card size-sm">
            <img src="/images/rock-climber.jpg" alt="Climbing" className="card-media" />
            <div className="card-body">
              <h3>Rock Climbing</h3>
              <p>Technique, route reading, and training drills for bouldering and top-roping.</p>
            </div>
          </article>

          <article className="hobby-card size-md">
            <div className="card-body">
              <h3>Computer Programming</h3>
              <p>Automation scripts, firmware and web tools to document builds; snippets and configs accompany projects.</p>
            </div>
          </article>

          <article className="hobby-card size-sm">
            <div className="card-body">
              <h3>Crocheting</h3>
              <p>Blankets, amigurumi, and stitch exploration — relaxing, portable, and endlessly tweakable patterns.</p>
            </div>
          </article>

          <article className="hobby-card size-md">
            <img src="/images/bread.jpg" alt="Baking bread" className="card-media" />
            <div className="card-body">
              <h3>Baking (Bread & Donuts)</h3>
              <p>Sourdough starters, enriched doughs and fried treats — measurements, timing, and delicious experiments.</p>
            </div>
          </article>

          <article className="hobby-card size-md">
            <img src="/images/piano.jpg" alt="Playing piano" className="card-media" />
            <div className="card-body">
              <h3>Playing Piano</h3>
              <p>Practice routines, fingerings, and repertoire for both classical pieces and modern arrangements.</p>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
