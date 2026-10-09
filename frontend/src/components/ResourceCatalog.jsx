import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { resourceApi } from '../api/client';
import { RESOURCE_IMAGE_MAP } from '../constants/facilities';
import FilterToolbar from './FilterToolbar';
import {
  Users,
  MapPin,
  Lock,
  Sparkles,
  MoreVertical,
  FlaskConical,
  Cpu,
  Tv,
  DoorClosed,
  Plus,
  Trash2,
  Calendar,
  Eye,
  X,
  Search,
  Building,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';

const PAGE_SIZE = 12;

export default function ResourceCatalog({ onBookResource, onNewResourceClick, isAdmin }) {
  const [searchParams] = useSearchParams();
  const [allResources, setAllResources] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state initialized from query params
  const [selectedType, setSelectedType] = useState(() => searchParams.get('type') || '');
  const [search, setSearch] = useState(() => searchParams.get('q') || '');
  const [selectedCampus, setSelectedCampus] = useState(() => searchParams.get('location') || '');
  const [capacityFilter, setCapacityFilter] = useState(() => {
    const minCap = searchParams.get('minCapacity');
    if (!minCap) return 'ALL';
    const num = parseInt(minCap, 10);
    if (num <= 4) return 'SMALL';
    if (num <= 10) return 'MEDIUM';
    if (num <= 25) return 'LARGE';
    return 'EXTRA_LARGE';
  });
  const [restrictedOnly, setRestrictedOnly] = useState(() => searchParams.get('restricted') === 'true');
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [sortBy, setSortBy] = useState('POPULAR');

  // Toolbar date/time
  const [selectedDate, setSelectedDate] = useState(() => searchParams.get('date') || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState(() => searchParams.get('start') || '09:00');
  const [endTime, setEndTime] = useState(() => searchParams.get('end') || '17:00');
  const [availableOnly, setAvailableOnly] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllPages, setShowAllPages] = useState(false);

  // Admin menu & delete modal
  const [activeKebabId, setActiveKebabId] = useState(null);
  const [deleteModalResource, setDeleteModalResource] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState('');

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await resourceApi.getResources({});
      const activeList = (res.data || []).filter((r) => r.active !== false);
      setAllResources(activeList);
    } catch (err) {
      console.error('Failed to load resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  // If URL has bookId query param, automatically trigger booking modal
  useEffect(() => {
    const bookId = searchParams.get('bookId');
    if (bookId && allResources.length > 0) {
      const target = allResources.find((r) => r.id === Number(bookId));
      if (target && onBookResource) {
        onBookResource(target);
      }
    }
  }, [allResources, searchParams, onBookResource]);

  const handleDeleteResource = async (id) => {
    setDeleting(true);
    try {
      await resourceApi.deleteResource(id);
      const target = allResources.find((r) => r.id === id);
      setAllResources((prev) => prev.filter((r) => r.id !== id));
      setDeleteModalResource(null);
      setDeleteSuccessMsg(`"${target?.name || 'Space'}" was successfully deleted from catalog.`);
      setTimeout(() => setDeleteSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to delete resource:', err);
    } finally {
      setDeleting(false);
    }
  };

  // Extract distinct campus / building zones
  const campusOptions = useMemo(() => {
    const set = new Set();
    allResources.forEach((r) => {
      if (r.location) {
        // e.g. "HQ Tower, Floor 8" -> "HQ Tower"
        const primary = r.location.split(',')[0].trim();
        set.add(primary);
      }
    });
    return Array.from(set).sort();
  }, [allResources]);

  // Live count computations for tabs
  const typeCounts = useMemo(() => {
    return {
      all: allResources.length,
      meeting: allResources.filter((r) => r.type === 'MEETING_ROOM').length,
      halls: allResources.filter((r) => r.type === 'CONFERENCE_HALL').length,
      labs: allResources.filter((r) => r.type === 'LAB' || r.type === 'LAB_BENCH').length,
      equipment: allResources.filter((r) => r.type === 'EQUIPMENT').length,
    };
  }, [allResources]);

  // Filtered & Sorted Resources
  const filteredResources = useMemo(() => {
    let list = [...allResources];

    // 1. Type
    if (selectedType) {
      list = list.filter((r) => r.type === selectedType);
    }

    // 2. Keyword search (name, location, description, features)
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((r) =>
        r.name?.toLowerCase().includes(q) ||
        r.location?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.features?.some((f) => f.toLowerCase().includes(q))
      );
    }

    // 3. Campus
    if (selectedCampus) {
      list = list.filter((r) => r.location?.includes(selectedCampus));
    }

    // 4. Capacity preset
    if (capacityFilter === 'HUDDLE') {
      list = list.filter((r) => r.capacity >= 1 && r.capacity <= 6);
    } else if (capacityFilter === 'TEAM') {
      list = list.filter((r) => r.capacity >= 7 && r.capacity <= 15);
    } else if (capacityFilter === 'BOARDROOM') {
      list = list.filter((r) => r.capacity >= 16 && r.capacity <= 30);
    } else if (capacityFilter === 'AUDITORIUM') {
      list = list.filter((r) => r.capacity >= 31);
    }

    // 5. Restricted only
    if (restrictedOnly) {
      list = list.filter((r) => r.restricted);
    }

    // 6. Selected features
    if (selectedFeatures.length > 0) {
      list = list.filter((r) =>
        selectedFeatures.every((f) => r.features?.includes(f))
      );
    }

    // 7. Sort
    if (sortBy === 'CAPACITY_DESC') {
      list.sort((a, b) => b.capacity - a.capacity);
    } else if (sortBy === 'CAPACITY_ASC') {
      list.sort((a, b) => a.capacity - b.capacity);
    } else if (sortBy === 'NAME_ASC') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // 'POPULAR'
      list.sort((a, b) => {
        const aPop = a.capacity >= 8 || a.name.includes('Boardroom') || a.name.includes('Amphitheater') || a.name.includes('Auditorium') ? 1 : 0;
        const bPop = b.capacity >= 8 || b.name.includes('Boardroom') || b.name.includes('Auditorium') ? 1 : 0;
        return bPop - aPop;
      });
    }

    return list;
  }, [allResources, selectedType, search, selectedCampus, capacityFilter, restrictedOnly, selectedFeatures, sortBy]);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedType, search, selectedCampus, capacityFilter, restrictedOnly, selectedFeatures, sortBy]);

  // Paginated Slice
  const totalPages = Math.ceil(filteredResources.length / PAGE_SIZE) || 1;
  const paginatedResources = useMemo(() => {
    if (showAllPages) return filteredResources;
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredResources.slice(start, start + PAGE_SIZE);
  }, [filteredResources, currentPage, showAllPages]);

  const handleResetFilters = () => {
    setSelectedType('');
    setSearch('');
    setSelectedCampus('');
    setCapacityFilter('ALL');
    setRestrictedOnly(false);
    setSelectedFeatures([]);
    setSortBy('POPULAR');
    setShowAllPages(false);
  };

  const getFallbackIcon = (type) => {
    switch (type) {
      case 'LAB':
      case 'LAB_BENCH':
        return <FlaskConical size={36} color="var(--primary)" strokeWidth={1.5} />;
      case 'EQUIPMENT':
        return <Cpu size={36} color="var(--primary)" strokeWidth={1.5} />;
      case 'CONFERENCE_HALL':
        return <Tv size={36} color="var(--primary)" strokeWidth={1.5} />;
      default:
        return <DoorClosed size={36} color="var(--primary)" strokeWidth={1.5} />;
    }
  };

  // Underline Sub-Navigation Tabs with dynamic counters
  const typeTabs = [
    { label: `All Spaces`, count: typeCounts.all, value: '' },
    { label: `Meeting Rooms`, count: typeCounts.meeting, value: 'MEETING_ROOM' },
    { label: `Auditoriums & Halls`, count: typeCounts.halls, value: 'CONFERENCE_HALL' },
    { label: `Laboratories`, count: typeCounts.labs, value: 'LAB' },
    { label: `Equipment Assets`, count: typeCounts.equipment, value: 'EQUIPMENT' },
  ];

  return (
    <div style={{ maxWidth: '1340px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner / Toast message if room deleted */}
      {deleteSuccessMsg && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '10px',
            backgroundColor: 'var(--success-soft)',
            border: '1px solid var(--success)',
            color: 'var(--success)',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Check size={16} />
          <span>{deleteSuccessMsg}</span>
        </div>
      )}

      {/* Admin Privilege Banner */}
      {isAdmin && (
        <div
          style={{
            padding: '10px 16px',
            borderRadius: '12px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '13px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-strong)' }}>
            <ShieldCheck size={16} color="var(--primary)" />
            <span>
              <strong>Administrator Access Active</strong>: You can add new meeting rooms/labs, edit details, or delete spaces from the enterprise catalog.
            </span>
          </div>

          <button
            type="button"
            onClick={onNewResourceClick}
            className="btn btn-primary btn-sm"
            style={{ fontWeight: 600 }}
          >
            <Plus size={15} /> Add New Space
          </button>
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-strong)', letterSpacing: '-0.02em' }}>
            Enterprise Space Catalog
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Browse and reserve {allResources.length} conference halls, meeting suites, engineering labs, and shared equipment.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isAdmin && (
            <button
              type="button"
              onClick={onNewResourceClick}
              className="btn btn-primary"
            >
              <Plus size={16} /> Add Catalog Resource
            </button>
          )}
        </div>
      </div>

      {/* Underline Sub-Navigation Tabs */}
      <div className="underline-tabs">
        {typeTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setSelectedType(tab.value)}
            className={`underline-tab ${selectedType === tab.value ? 'active' : ''}`}
          >
            <span>{tab.label}</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 7px',
                borderRadius: '10px',
                backgroundColor: selectedType === tab.value ? 'var(--primary)' : 'var(--bg-subtle)',
                color: selectedType === tab.value ? '#FFFFFF' : 'var(--text-muted)',
                marginLeft: '6px',
              }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Enterprise Fast Filter & Search Bar */}
      <div
        className="card"
        style={{
          padding: '14px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {/* Row 1: Search + Campus Dropdown + Sort Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Keyword Search */}
          <div style={{ flex: '1 1 280px', position: 'relative' }}>
            <Search
              size={15}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search by space name, building, or features (e.g. Boardroom, 4K, Lab)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '36px', height: '38px', fontSize: '13px' }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="btn-ghost"
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  padding: '4px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <X size={14} color="var(--text-muted)" />
              </button>
            )}
          </div>

          {/* Campus / Location Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '180px' }}>
            <Building size={15} color="var(--text-muted)" />
            <select
              className="select-field"
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              style={{ height: '38px', fontSize: '13px' }}
            >
              <option value="">All Campus Buildings</option>
              {campusOptions.map((campus) => (
                <option key={campus} value={campus}>
                  {campus}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '170px' }}>
            <ArrowUpDown size={15} color="var(--text-muted)" />
            <select
              className="select-field"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ height: '38px', fontSize: '13px' }}
            >
              <option value="POPULAR">Most Popular</option>
              <option value="CAPACITY_DESC">Capacity: High to Low</option>
              <option value="CAPACITY_ASC">Capacity: Low to High</option>
              <option value="NAME_ASC">Name (A – Z)</option>
            </select>
          </div>
        </div>

        {/* Row 2: Capacity Chips & Quick Reset */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginRight: '4px' }}>
              Capacity:
            </span>
            {[
              { id: 'ALL', label: 'All Capacities' },
              { id: 'HUDDLE', label: '1–6 Seats' },
              { id: 'TEAM', label: '7–15 Seats' },
              { id: 'BOARDROOM', label: '16–30 Seats' },
              { id: 'AUDITORIUM', label: '31+ Auditorium' },
            ].map((cap) => (
              <button
                key={cap.id}
                type="button"
                onClick={() => setCapacityFilter(cap.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '12px',
                  fontWeight: capacityFilter === cap.id ? 600 : 500,
                  border: '1px solid',
                  borderColor: capacityFilter === cap.id ? 'var(--primary)' : 'var(--border)',
                  backgroundColor: capacityFilter === cap.id ? 'var(--primary)' : 'var(--bg-card)',
                  color: capacityFilter === cap.id ? '#FFFFFF' : 'var(--text-body)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {cap.label}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setRestrictedOnly(!restrictedOnly)}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '12px',
                fontWeight: restrictedOnly ? 600 : 500,
                border: '1px solid',
                borderColor: restrictedOnly ? 'var(--warning)' : 'var(--border)',
                backgroundColor: restrictedOnly ? 'var(--warning-soft)' : 'var(--bg-card)',
                color: restrictedOnly ? 'var(--warning)' : 'var(--text-body)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Lock size={11} /> Approval Required
            </button>
          </div>

          {/* Results count & Clear filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Showing <strong>{filteredResources.length}</strong> of {allResources.length} spaces
            </span>

            {(search || selectedCampus || capacityFilter !== 'ALL' || restrictedOnly || selectedType) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '12px', color: 'var(--text-muted)' }}
              >
                Reset filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Date & Time Availability Toolbar */}
      <FilterToolbar
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        startTime={startTime}
        setStartTime={setStartTime}
        endTime={endTime}
        setEndTime={setEndTime}
        availableOnly={availableOnly}
        setAvailableOnly={setAvailableOnly}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        minCapacity=""
        setMinCapacity={() => {}}
        restrictedOnly={restrictedOnly}
        setRestrictedOnly={setRestrictedOnly}
        selectedFeatures={selectedFeatures}
        setSelectedFeatures={setSelectedFeatures}
        onResetFilters={handleResetFilters}
      />

      {/* Catalog Grid */}
      {loading ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
            <div
              key={idx}
              className="card"
              style={{ overflow: 'hidden', height: '360px', display: 'flex', flexDirection: 'column' }}
            >
              <div
                style={{
                  width: '100%',
                  aspectRatio: '16/10',
                  backgroundColor: 'var(--bg-subtle)',
                  animation: 'pulse 1.5s infinite ease-in-out',
                }}
              />
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                <div style={{ width: '60%', height: '16px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px' }} />
                <div style={{ width: '40%', height: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px' }} />
              </div>
            </div>
          ))}
        </div>
      ) : filteredResources.length === 0 ? (
        <div
          className="card"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <DoorClosed size={24} color="var(--text-muted)" />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-strong)' }}>
            No matching spaces found
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '380px' }}>
            We couldn't find any rooms matching your current campus, capacity, or keyword filter criteria.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="btn btn-outline btn-sm"
            style={{ marginTop: '8px' }}
          >
            Clear all filters
          </button>
        </div>
      ) : (
        /* Resource Grid */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {paginatedResources.map((item) => {
            const imageUrl = RESOURCE_IMAGE_MAP[item.name];
            const isMostBooked = item.capacity >= 8 || item.name.includes('Boardroom') || item.name.includes('Amphitheater') || item.name.includes('Auditorium');
            const isKebabOpen = activeKebabId === item.id;

            return (
              <div
                key={item.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
                }}
              >
                {/* Top Image Area (16:10, object-fit cover) */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '16 / 10',
                    backgroundColor: 'var(--bg-subtle)',
                    overflow: 'hidden',
                  }}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={item.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
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
                      }}
                    >
                      {getFallbackIcon(item.type)}
                    </div>
                  )}

                  {/* Corner Tags inside image with 12px inset */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      display: 'flex',
                      gap: '6px',
                      zIndex: 2,
                    }}
                  >
                    {isMostBooked && (
                      <span
                        className="badge badge-lime"
                        style={{
                          boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                          fontSize: '11px',
                          height: '22px',
                        }}
                      >
                        <Sparkles size={11} strokeWidth={2.5} /> Most booked
                      </span>
                    )}

                    {item.restricted && (
                      <span
                        className="badge badge-pending"
                        style={{
                          boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                          fontSize: '11px',
                          height: '22px',
                        }}
                      >
                        <Lock size={11} /> Needs approval
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Below Image */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  {/* Name (16 semibold, single line ellipsis) */}
                  <h3
                    title={item.name}
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
                    {item.name}
                  </h3>

                  {/* Meta Row: capacity & location */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      marginBottom: '10px',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                      <Users size={13} /> {item.capacity} {item.capacity === 1 ? 'Unit' : 'Seats'}
                    </span>
                    <span
                      title={item.location}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      <MapPin size={13} style={{ flexShrink: 0 }} /> {item.location}
                    </span>
                  </div>

                  {/* Features row: Max 3 tags + "+N" chip */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
                    {item.features?.slice(0, 3).map((feat) => (
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
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {feat}
                      </span>
                    ))}

                    {item.features && item.features.length > 3 && (
                      <span
                        title={item.features.slice(3).join(', ')}
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
                        +{item.features.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Footer Row */}
                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: '12px',
                      borderTop: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      position: 'relative',
                    }}
                  >
                    {/* Status Pill on Left */}
                    <span className="badge badge-confirmed">
                      <span className="badge-dot" />
                      Available now
                    </span>

                    {/* Right: Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => onBookResource(item)}
                        className="btn btn-ghost btn-sm"
                        style={{ fontWeight: 600, color: 'var(--primary)' }}
                      >
                        Book
                      </button>

                      {/* Admin Direct Delete Trash Button */}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteModalResource(item);
                          }}
                          className="btn-ghost"
                          title="Delete room from catalog"
                          style={{
                            width: '30px',
                            height: '30px',
                            padding: 0,
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            border: '1px solid var(--border)',
                            color: 'var(--danger)',
                            backgroundColor: '#FFF5F5',
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}

                      {/* Card Kebab Menu for extra options */}
                      <div style={{ position: 'relative' }}>
                        <button
                          type="button"
                          onClick={() => setActiveKebabId(isKebabOpen ? null : item.id)}
                          className="btn-ghost"
                          title="Space Options"
                          style={{
                            width: '28px',
                            height: '28px',
                            padding: 0,
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            border: 'none',
                          }}
                        >
                          <MoreVertical size={16} color="var(--text-muted)" />
                        </button>

                        {/* Kebab Dropdown */}
                        {isKebabOpen && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: 'calc(100% + 4px)',
                              right: 0,
                              width: '160px',
                              backgroundColor: 'var(--bg-card)',
                              border: '1px solid var(--border)',
                              borderRadius: '10px',
                              boxShadow: 'var(--shadow-popover)',
                              padding: '4px',
                              zIndex: 'var(--z-dropdown)',
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setActiveKebabId(null);
                                onBookResource(item);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                width: '100%',
                                padding: '6px 8px',
                                fontSize: '12px',
                                border: 'none',
                                background: 'transparent',
                                color: 'var(--text-strong)',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                textAlign: 'left',
                              }}
                            >
                              <Eye size={13} /> Reserve space
                            </button>

                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveKebabId(null);
                                  setDeleteModalResource(item);
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  width: '100%',
                                  padding: '6px 8px',
                                  fontSize: '12px',
                                  border: 'none',
                                  background: 'transparent',
                                  color: 'var(--danger)',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                }}
                              >
                                <Trash2 size={13} /> Delete room
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {filteredResources.length > PAGE_SIZE && (
        <div
          className="card"
          style={{
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginTop: '8px',
          }}
        >
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Showing <strong>{(currentPage - 1) * PAGE_SIZE + 1}</strong> –{' '}
            <strong>{Math.min(currentPage * PAGE_SIZE, filteredResources.length)}</strong> of{' '}
            <strong>{filteredResources.length}</strong> enterprise spaces
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1 || showAllPages}
              className="btn btn-outline btn-sm"
              style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <ChevronLeft size={14} /> Previous
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => {
                      setCurrentPage(pageNum);
                      setShowAllPages(false);
                    }}
                    style={{
                      width: '32px',
                      height: '32px',
                      padding: 0,
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: currentPage === pageNum && !showAllPages ? 700 : 500,
                      border: '1px solid',
                      borderColor: currentPage === pageNum && !showAllPages ? 'var(--primary)' : 'var(--border)',
                      backgroundColor: currentPage === pageNum && !showAllPages ? 'var(--primary)' : 'transparent',
                      color: currentPage === pageNum && !showAllPages ? '#FFFFFF' : 'var(--text-body)',
                      cursor: 'pointer',
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || showAllPages}
              className="btn btn-outline btn-sm"
              style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Next <ChevronRight size={14} />
            </button>

            <button
              type="button"
              onClick={() => setShowAllPages(!showAllPages)}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)' }}
            >
              {showAllPages ? 'Paginate' : `View All (${filteredResources.length})`}
            </button>
          </div>
        </div>
      )}

      {/* Admin Delete Resource Confirmation Dialog */}
      {deleteModalResource && (
        <div className="modal-overlay" onClick={() => setDeleteModalResource(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '460px',
              padding: 0,
              borderRadius: '24px',
              overflow: 'hidden',
              border: '1px solid var(--border)',
              boxShadow: '0 24px 64px rgba(11, 36, 32, 0.22)',
            }}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--danger-soft)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--danger)',
                  }}
                >
                  <Trash2 size={16} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-strong)' }}>
                  Delete / Deactivate Space
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setDeleteModalResource(null)}
                className="btn-ghost"
                style={{ padding: '4px', border: 'none', cursor: 'pointer' }}
              >
                <X size={18} color="var(--text-muted)" />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '20px 24px' }}>
              <p style={{ fontSize: '14px', color: 'var(--text-strong)', lineHeight: 1.5 }}>
                Are you sure you want to remove <strong>"{deleteModalResource.name}"</strong> from available rooms?
              </p>

              <div
                style={{
                  marginTop: '12px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontSize: '12px',
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Location: </span>
                  <strong>{deleteModalResource.location}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Capacity: </span>
                  <strong>{deleteModalResource.capacity} {deleteModalResource.capacity === 1 ? 'Unit' : 'Seats'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Type: </span>
                  <strong>{deleteModalResource.type}</strong>
                </div>
              </div>

              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px', lineHeight: 1.5 }}>
                This space will be immediately deactivated and hidden from the catalog, search, and availability calendars. Historical reservation records will remain archived.
              </p>
            </div>

            <div className="modal-footer" style={{ padding: '14px 24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setDeleteModalResource(null)}
                className="btn btn-secondary btn-sm"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteResource(deleteModalResource.id)}
                className="btn btn-danger-solid btn-sm"
                disabled={deleting}
                style={{
                  backgroundColor: 'var(--danger)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Trash2 size={14} />
                {deleting ? 'Removing...' : 'Confirm Delete Space'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
