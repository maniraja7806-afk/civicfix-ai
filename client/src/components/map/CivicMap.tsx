import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Complaint, ComplaintPriority, ComplaintStatus } from '../../types';
import { getPriorityBadge, getStatusBadge } from '../../utils/priorityColors';
import { Link } from 'react-router-dom';

interface CivicMapProps {
  complaints?: Complaint[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  isPickerMode?: boolean;
  selectedLocation?: [number, number] | null;
  onLocationSelect?: (lat: number, lng: number) => void;
  showFilters?: boolean;
}

export const CivicMap: React.FC<CivicMapProps> = ({
  complaints = [],
  center = [28.6328, 77.2185], // Default: New Delhi Connaught Place
  zoom = 13,
  height = '500px',
  isPickerMode = false,
  selectedLocation = null,
  onLocationSelect
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  // Helper to create colored SVG map pin icons
  const createColorPinIcon = (colorHex: string, label?: string) => {
    const svgIconHtml = `
      <div style="position: relative; width: 32px; height: 32px; transform: translate(-16px, -32px);">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="${colorHex}" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3.5" fill="#ffffff"></circle>
        </svg>
      </div>
    `;

    return L.divIcon({
      html: svgIconHtml,
      className: 'custom-civic-pin',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true,
        scrollWheelZoom: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      const markerLayer = L.layerGroup().addTo(map);
      markerLayerRef.current = markerLayer;
      mapInstanceRef.current = map;

      // Handle map clicks in picker mode
      if (isPickerMode) {
        map.on('click', (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          if (onLocationSelect) {
            onLocationSelect(lat, lng);
          }
        });
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update center when prop changes
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView(center, zoom);
    }
  }, [center, zoom]);

  // Handle Location Picker pin in Report mode
  useEffect(() => {
    if (!mapInstanceRef.current || !isPickerMode) return;

    if (selectedLocation) {
      const [lat, lng] = selectedLocation;
      if (pickerMarkerRef.current) {
        pickerMarkerRef.current.setLatLng([lat, lng]);
      } else {
        const pickerIcon = createColorPinIcon('#0284c7');
        const marker = L.marker([lat, lng], {
          icon: pickerIcon,
          draggable: true
        }).addTo(mapInstanceRef.current);

        marker.on('dragend', (e: any) => {
          const newPos = e.target.getLatLng();
          if (onLocationSelect) {
            onLocationSelect(newPos.lat, newPos.lng);
          }
        });

        pickerMarkerRef.current = marker;
      }
      mapInstanceRef.current.setView([lat, lng], Math.max(mapInstanceRef.current.getZoom(), 15));
    }
  }, [selectedLocation, isPickerMode]);

  // Update complaint markers
  useEffect(() => {
    if (!markerLayerRef.current || isPickerMode) return;

    markerLayerRef.current.clearLayers();

    complaints.forEach(complaint => {
      if (!complaint.location?.coordinates) return;
      const [lng, lat] = complaint.location.coordinates;

      // Determine pin color: Red for Critical, Orange for High, Yellow for Medium, Green for Resolved
      let pinColor = '#3b82f6';
      if (complaint.status === 'Resolved' || complaint.status === 'Closed') {
        pinColor = '#10b981'; // Green
      } else if (complaint.priority === 'Critical') {
        pinColor = '#ef4444'; // Red
      } else if (complaint.priority === 'High') {
        pinColor = '#f97316'; // Orange
      } else if (complaint.priority === 'Medium') {
        pinColor = '#eab308'; // Yellow
      } else {
        pinColor = '#64748b'; // Gray/blue
      }

      const icon = createColorPinIcon(pinColor);
      const marker = L.marker([lat, lng], { icon });

      const pBadge = getPriorityBadge(complaint.priority);
      const sBadge = getStatusBadge(complaint.status);

      const popupHtml = `
        <div style="font-family: sans-serif; min-width: 220px; max-width: 280px; padding: 2px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: bold; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; color: #334155;">
              ${complaint.complaintId}
            </span>
            <span style="font-size: 10px; font-weight: bold; color: ${pBadge.hex}; border: 1px solid ${pBadge.hex}; padding: 1px 5px; border-radius: 999px;">
              ${complaint.priority}
            </span>
          </div>

          ${
            complaint.images && complaint.images.length > 0
              ? `<img src="${complaint.images[0]}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 6px; margin-bottom: 6px;" alt="Issue" />`
              : ''
          }

          <h4 style="font-size: 13px; font-weight: 700; margin: 0 0 4px 0; color: #0f172a; line-height: 1.3;">
            ${complaint.title}
          </h4>

          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
            <strong>Category:</strong> ${complaint.category}
          </div>

          <div style="font-size: 11px; color: #475569; margin-bottom: 8px; line-height: 1.4;">
            📍 ${complaint.address || complaint.landmark || 'Location specified on map'}
          </div>

          <div style="margin-bottom: 8px;">
            <span style="display: inline-block; font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 4px; background: #e0f2fe; color: #0369a1;">
              ${sBadge.label}
            </span>
          </div>

          <a href="/complaint/${complaint._id}" style="display: block; text-align: center; background: #0284c7; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: 600; padding: 6px 10px; border-radius: 6px;">
            View Tracking & Details →
          </a>
        </div>
      `;

      marker.bindPopup(popupHtml);
      markerLayerRef.current?.addLayer(marker);
    });
  }, [complaints, isPickerMode]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm z-0">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />

      {/* Picker Mode Instruction Banner */}
      {isPickerMode && (
        <div className="absolute top-3 left-3 right-3 sm:right-auto z-[1000] bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-lg shadow-md border border-slate-200 text-xs font-semibold text-slate-800 flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-civic-600 animate-ping" />
          <span>Click on the map or drag the pin to set the civic issue location</span>
        </div>
      )}

      {/* Legend */}
      {!isPickerMode && (
        <div className="absolute bottom-3 right-3 z-[1000] bg-white/95 backdrop-blur-md p-2 rounded-lg shadow-md border border-slate-200 text-[10px] space-y-1">
          <div className="font-bold text-slate-700 uppercase tracking-wider mb-1">Pin Legend</div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
            <span className="text-slate-600">Critical Priority</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span className="text-slate-600">High Priority</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <span className="text-slate-600">Medium Priority</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600">Resolved / Closed</span>
          </div>
        </div>
      )}
    </div>
  );
};
