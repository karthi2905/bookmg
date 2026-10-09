import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { resourceApi } from '../../api/client';
import SpaceCard from './SpaceCard';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';

const FALLBACK_SHOWCASE = [
  {
    id: 1,
    name: 'Innovation Boardroom',
    type: 'MEETING_ROOM',
    capacity: 22,
    location: 'Innovation Wing, Floor 3',
    restricted: false,
    mostBooked: true,
    features: ['4K Video Conference', 'Smart Whiteboard', 'Dual Display', 'Surround Audio'],
  },
  {
    id: 2,
    name: 'Electronics Lab',
    type: 'LAB',
    capacity: 14,
    location: 'Block B, Ground floor',
    restricted: false,
    mostBooked: true,
    features: ['Oscilloscopes', 'Soldering Stations', 'ESD Flooring', 'Component Bins'],
  },
  {
    id: 3,
    name: 'Chemistry Lab',
    type: 'LAB',
    capacity: 10,
    location: 'Block C, Floor 1',
    restricted: true,
    mostBooked: false,
    features: ['Fume Hood', 'Gas Purge Station', 'Eye Wash Station', 'Chemical Lockers'],
  },
  {
    id: 4,
    name: 'Prototyping Lab',
    type: 'LAB',
    capacity: 12,
    location: 'Block A, Ground floor',
    restricted: true,
    mostBooked: true,
    features: ['3D Printers', 'Laser Cutters', 'CNC Router', 'Safety Interlocks'],
  },
  {
    id: 5,
    name: 'Video Conference Pod',
    type: 'MEETING_ROOM',
    capacity: 4,
    location: 'Block B, Floor 2',
    restricted: false,
    mostBooked: true,
    features: ['Acoustic Isolation', 'Wide-Angle Camera', 'USB-C Dock', 'Soft Lighting'],
  },
  {
    id: 6,
    name: 'GPU Workstation',
    type: 'EQUIPMENT',
    capacity: 1,
    location: 'Innovation Wing, Floor 2',
    restricted: true,
    mostBooked: true,
    features: ['4x NVIDIA H100', 'CUDA 12', 'Direct Liquid Cooling', '100G RoCE'],
  },
  {
    id: 7,
    name: 'Training Room',
    type: 'MEETING_ROOM',
    capacity: 35,
    location: 'Block A, Floor 2',
    restricted: false,
    mostBooked: false,
    features: ['Ceiling Mic Array', 'Dual Projectors', 'Podium Screen', 'Breakout Tables'],
  },
  {
    id: 8,
    name: 'Huddle Room',
    type: 'MEETING_ROOM',
    capacity: 6,
    location: 'Innovation Wing, Ground floor',
    restricted: false,
    mostBooked: true,
    features: ['Display Screen', 'Whiteboard', 'Wireless Screen Share', 'Power Ports'],
  },
];

export default function FeaturedSpaces() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [spaces, setSpaces] = useState(FALLBACK_SHOWCASE);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const loadSpaces = async () => {
        setLoading(true);
        try {
          const res = await resourceApi.getResources({});
          const list = (res.data || []).filter((r) => r.active !== false);
          if (list.length > 0) {
            // Sort by most booked / active or take top items
            setSpaces(list.slice(0, 8));
          }
        } catch {
          // Keep fallback
        } finally {
          setLoading(false);
        }
      };
      loadSpaces();
    }
  }, [user]);

  const handleExploreMore = () => {
    if (!user) {
      navigate('/login?returnTo=/app/resources');
    } else {
      navigate('/app/resources');
    }
  };

  return (
    <section id="spaces" className="landing-section" aria-labelledby="featured-spaces-title">
      {/* Section Header Row */}
      <div className="section-header-row">
        <div>
          <h2 id="featured-spaces-title" className="section-title">
            Most booked spaces across the company
          </h2>
          <p className="section-subtitle">
            Explore high-demand conference suites, research laboratories, and shared engineering benches.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExploreMore}
          className="btn btn-outline btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <SlidersHorizontal size={14} />
          <span>Filters</span>
        </button>
      </div>

      {/* Grid of cards: 4 on desktop, 2 on tablet, 1 on mobile */}
      <div className="spaces-grid">
        {spaces.slice(0, 8).map((space) => (
          <SpaceCard key={space.id} space={space} />
        ))}
      </div>

      {/* Centered Explore More Pill Button with down arrow icon */}
      <div style={{ textAlign: 'center', marginTop: '36px' }}>
        <button
          type="button"
          onClick={handleExploreMore}
          className="btn btn-secondary"
          style={{
            borderRadius: 'var(--radius-pill)',
            padding: '12px 28px',
            fontSize: '13px',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: 'var(--shadow-sm)',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border)',
          }}
        >
          <span>Explore more</span>
          <ChevronDown size={15} />
        </button>
      </div>
    </section>
  );
}
