import React from 'react';
import Hero from '../components/landing/Hero';
import FeaturedSpaces from '../components/landing/FeaturedSpaces';
import HowItWorks from '../components/landing/HowItWorks';
import ApprovalsSection from '../components/landing/ApprovalsSection';
import StatsStrip from '../components/landing/StatsStrip';
import CtaBanner from '../components/landing/CtaBanner';

export default function Landing() {
  return (
    <>
      {/* Hero with embedded search card */}
      <Hero />

      {/* Featured Spaces showcase */}
      <FeaturedSpaces />

      {/* How BookMg Works (3 numbered steps) */}
      <HowItWorks />

      {/* Labs & Approvals 2-column section */}
      <ApprovalsSection />

      {/* Why Teams Use It stat strip */}
      <StatsStrip />

      {/* Final Call To Action Banner */}
      <CtaBanner />
    </>
  );
}
