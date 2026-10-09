import React from 'react';
import SearchCard from './SearchCard';
import heroImage from '../../assets/hero.jpg';

export default function Hero() {
  return (
    <section className="hero-wrapper" aria-labelledby="hero-title">
      <div
        className="hero-container"
        style={{
          backgroundImage: `url(${heroImage})`,
        }}
      >
        {/* Dark gradient overlay (rgba(11,36,32,.65) to rgba(11,36,32,.35)) so text always has contrast */}
        <div className="hero-overlay" />

        {/* Designed decorative graphic circles and subtle grid */}
        <div
          style={{
            position: 'absolute',
            top: '-60px',
            right: '-60px',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(200, 245, 96, 0.16) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-40px',
            left: '-40px',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(46, 158, 91, 0.20) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* Hero Content */}
        <div className="hero-content">
          <h1 id="hero-title" className="hero-headline">
            Find the right <span className="hero-headline-highlight">space</span> for every meeting
          </h1>

          <p className="hero-subtext">
            Book company meeting rooms, engineering testbeds, and specialized lab equipment in minutes with automated conflict-free check-ins.
          </p>

          {/* Integrated Search Card */}
          <SearchCard />
        </div>
      </div>
    </section>
  );
}
