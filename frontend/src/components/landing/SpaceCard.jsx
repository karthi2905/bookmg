import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Users, Lock, Sparkles, ArrowRight, Tv, Video, Edit3, Wifi, Cpu, FlaskConical, DoorClosed } from 'lucide-react';
import { RESOURCE_IMAGE_MAP } from '../../constants/facilities';

export default function SpaceCard({ space }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const imageUrl = RESOURCE_IMAGE_MAP[space.name] || space.image;
  const isMostBooked = space.mostBooked !== undefined ? space.mostBooked : (space.capacity >= 8 || space.name.includes('Boardroom'));

  const handleBook = () => {
    if (!user) {
      navigate(`/login?returnTo=${encodeURIComponent(`/app/resources?bookId=${space.id}`)}`);
    } else {
      navigate(`/app/resources?bookId=${space.id}`);
    }
  };

  const getFeatureIcon = (feature) => {
    const f = feature.toLowerCase();
    if (f.includes('video') || f.includes('display')) return <Video size={12} />;
    if (f.includes('whiteboard')) return <Edit3 size={12} />;
    if (f.includes('projector') || f.includes('tv')) return <Tv size={12} />;
    if (f.includes('wi-fi') || f.includes('wifi')) return <Wifi size={12} />;
    if (f.includes('gpu') || f.includes('compute')) return <Cpu size={12} />;
    if (f.includes('lab') || f.includes('fume')) return <FlaskConical size={12} />;
    return <Tv size={12} />;
  };

  return (
    <article className="space-card">
      {/* 4:3 Image Container with corner tags */}
      <div className="space-card-image-wrap">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={space.name}
            className="space-card-image"
            loading="lazy"
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #EEF2F6 0%, #E2E8F0 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
            }}
          >
            <DoorClosed size={32} />
          </div>
        )}

        {/* Top-Left: Needs Approval amber badge */}
        {space.restricted && (
          <div className="space-card-tag-left">
            <span
              className="badge badge-pending"
              style={{
                fontSize: '11px',
                height: '22px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
              }}
            >
              <Lock size={11} />
              <span>Needs approval</span>
            </span>
          </div>
        )}

        {/* Top-Right: Most Booked lime badge */}
        {isMostBooked && (
          <div className="space-card-tag-right">
            <span
              className="badge badge-lime"
              style={{
                fontSize: '11px',
                height: '22px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
              }}
            >
              <Sparkles size={11} strokeWidth={2.5} />
              <span>Most booked</span>
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="space-card-body">
        {/* Title */}
        <h3
          title={space.name}
          style={{
            fontSize: '15px',
            fontWeight: 600,
            color: 'var(--text-strong)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginBottom: '6px',
          }}
        >
          {space.name}
        </h3>

        {/* Meta row: seats + feature chips */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: 'var(--text-muted)',
            marginBottom: '12px',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, fontWeight: 500 }}>
            <Users size={13} /> {space.capacity} {space.capacity === 1 ? 'Unit' : 'Seats'}
          </span>

          <span style={{ color: 'var(--border)' }}>•</span>

          <span
            title={space.location}
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '120px',
            }}
          >
            {space.location}
          </span>
        </div>

        {/* Feature Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
          {space.features?.slice(0, 3).map((feat) => (
            <span
              key={feat}
              title={feat}
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--bg-subtle)',
                color: 'var(--text-body)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap',
              }}
            >
              {getFeatureIcon(feat)}
              <span>{feat}</span>
            </span>
          ))}

          {space.features && space.features.length > 3 && (
            <span
              title={space.features.slice(3).join(', ')}
              style={{
                fontSize: '10px',
                fontWeight: 600,
                padding: '2px 6px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--bg-subtle)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)',
              }}
            >
              +{space.features.length - 3}
            </span>
          )}
        </div>

        {/* Footer row: status pill + Book CTA */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: '10px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span className="badge badge-confirmed">
            <span className="badge-dot" />
            Available now
          </span>

          <button
            type="button"
            onClick={handleBook}
            className="btn btn-ghost btn-sm"
            style={{
              fontWeight: 600,
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
            }}
          >
            <span>Book</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </article>
  );
}
