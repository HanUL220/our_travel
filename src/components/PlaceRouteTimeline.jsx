import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, ExternalLink, Layers, MapPin } from 'lucide-react';
import { geocodePlaceList } from '../utils/geoUtils';

export default function PlaceRouteTimeline({ places = [], regionHint = '' }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);

  const [resolvedSpots, setResolvedSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSpotIndex, setActiveSpotIndex] = useState(null);
  const [mapLayerType, setMapLayerType] = useState('roadmap'); // 'roadmap' or 'satellite'

  // 1. Resolve coordinates for all places
  useEffect(() => {
    let isMounted = true;
    async function loadCoords() {
      setLoading(true);
      try {
        const spots = await geocodePlaceList(places, regionHint);
        if (isMounted) {
          setResolvedSpots(spots);
        }
      } catch (err) {
        console.error('Failed to geocode places:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (places && places.length > 0) {
      loadCoords();
    } else {
      setResolvedSpots([]);
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [places, regionHint]);

  // 2. Initialize and update Google Maps via Leaflet
  useEffect(() => {
    if (!mapContainerRef.current || resolvedSpots.length === 0) return;

    // Clean up previous map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    markersRef.current = [];

    const firstSpot = resolvedSpots[0];
    const initialCenter = [firstSpot.lat, firstSpot.lng];

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 13,
      zoomControl: true,
      scrollWheelZoom: false // Smooth page scrolling
    });

    mapInstanceRef.current = map;

    // Google Maps Tile Layer with Korean language support (&hl=ko)
    const googleTileUrl = mapLayerType === 'satellite'
      ? 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&hl=ko' // Hybrid Satellite
      : 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=ko'; // Standard Roadmap

    const tileLayer = L.tileLayer(googleTileUrl, {
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      maxZoom: 20,
      attribution: '&copy; Google Maps'
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    const latLngs = [];

    // Create custom numbered markers
    resolvedSpots.forEach((spot, idx) => {
      const spotLatLng = [spot.lat, spot.lng];
      latLngs.push(spotLatLng);

      const customIcon = L.divIcon({
        className: 'apple-leaflet-custom-marker-wrap',
        html: `
          <div class="apple-map-marker-pin ${activeSpotIndex === idx ? 'is-active' : ''}">
            <span class="marker-number">${spot.index}</span>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -32]
      });

      const popupHtml = `
        <div class="apple-map-popup">
          <div class="apple-map-popup-header">
            <span class="popup-badge">코스 #${spot.index}</span>
            <strong class="popup-title">${spot.name}</strong>
          </div>
          <div class="popup-links">
            <a href="https://map.naver.com/v5/search/${encodeURIComponent(spot.name)}" target="_blank" rel="noopener noreferrer">
              네이버 지도에서 보기 ↗
            </a>
          </div>
        </div>
      `;

      const marker = L.marker(spotLatLng, { icon: customIcon })
        .addTo(map)
        .bindPopup(popupHtml, { className: 'apple-leaflet-popup' });

      marker.on('click', () => {
        setActiveSpotIndex(idx);
      });

      markersRef.current.push(marker);
    });

    // Draw route polyline if 2 or more spots
    if (latLngs.length > 1) {
      const polyline = L.polyline(latLngs, {
        color: '#ff4e78',
        weight: 4,
        opacity: 0.9,
        dashArray: '8, 8',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);
      polylineRef.current = polyline;

      map.fitBounds(polyline.getBounds(), {
        padding: [40, 40],
        maxZoom: 15
      });
    } else if (latLngs.length === 1) {
      map.setView(latLngs[0], 14);
    }

    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 250);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [resolvedSpots, mapLayerType]);

  // Click on a timeline step to highlight and fly to that marker
  const handleSpotClick = (index) => {
    setActiveSpotIndex(index);
    const spot = resolvedSpots[index];
    const map = mapInstanceRef.current;
    const marker = markersRef.current[index];

    if (map && spot) {
      map.flyTo([spot.lat, spot.lng], Math.max(map.getZoom(), 14), {
        duration: 0.8
      });
      if (marker) {
        marker.openPopup();
      }
    }
  };

  if (!places || places.length === 0) return null;

  return (
    <div className="apple-route-timeline-container">
      {/* Route Header */}
      <div className="apple-route-header">
        <div className="apple-route-title-group">
          <div className="apple-route-icon-badge">
            <Navigation size={15} />
          </div>
          <div>
            <h3 className="apple-route-title">
              여행 코스 & 타임라인
            </h3>
            <p className="apple-route-subtitle">
              방문한 {resolvedSpots.length || places.length}곳의 여행지를 순서대로 구글 지도에 기록했어요
            </p>
          </div>
        </div>

        <div className="apple-route-header-right">
          {/* Map Layer Switcher (일반 vs 위성) */}
          <div className="apple-map-layer-toggle">
            <button 
              type="button" 
              className={`apple-map-layer-btn ${mapLayerType === 'roadmap' ? 'active' : ''}`}
              onClick={() => setMapLayerType('roadmap')}
              title="구글 일반 지도"
            >
              일반
            </button>
            <button 
              type="button" 
              className={`apple-map-layer-btn ${mapLayerType === 'satellite' ? 'active' : ''}`}
              onClick={() => setMapLayerType('satellite')}
              title="구글 위성 지도"
            >
              위성
            </button>
          </div>

          <span className="apple-google-badge" title="Google Maps 기반 지도">
            <span className="google-g-icon">G</span> Google 지도
          </span>

          <span className="apple-route-count-badge">
            총 {resolvedSpots.length || places.length}개 스팟
          </span>
        </div>
      </div>

      {/* Interactive Google Map Box */}
      <div className="apple-route-map-box">
        {loading && (
          <div className="apple-map-loading-overlay">
            <div className="apple-map-spinner" />
            <span>장소 좌표를 확인하고 구글 지도를 불러오는 중...</span>
          </div>
        )}
        <div ref={mapContainerRef} className="apple-leaflet-map-root" />
      </div>

      {/* Sequential Timeline Stepper List */}
      <div className="apple-route-timeline-stepper">
        {resolvedSpots.map((spot, idx) => {
          const isActive = activeSpotIndex === idx;
          const naverUrl = `https://map.naver.com/v5/search/${encodeURIComponent(spot.name)}`;

          return (
            <div 
              key={spot.id || idx} 
              className={`apple-timeline-step-card ${isActive ? 'is-active' : ''}`}
              onClick={() => handleSpotClick(idx)}
            >
              {/* Step indicator with number */}
              <div className="apple-timeline-step-indicator">
                <div className="apple-timeline-pin-number">
                  {spot.index}
                </div>
              </div>

              {/* Step Main Info */}
              <div className="apple-timeline-step-content">
                <div className="apple-timeline-step-name-row">
                  <span className="apple-timeline-step-order">코스 {spot.index}</span>
                  <h4 className="apple-timeline-step-name">{spot.name}</h4>
                </div>

                <div className="apple-timeline-step-actions" onClick={(e) => e.stopPropagation()}>
                  <a 
                    href={naverUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="apple-timeline-btn apple-timeline-btn-naver"
                    title="네이버 지도에서 장소 보기"
                  >
                    <span className="naver-n-icon-xs">N</span>
                    <span>네이버 지도</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
