import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import bikeIcon from '@/assets/bike-icon.png';

interface Courier {
  id: string;
  name: string;
  status: 'available' | 'on-delivery' | 'to-retailer';
  lat: number;
  lng: number;
  heading: number;
}

const CourierMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [apiKey, setApiKey] = useState('');
  const [showApiInput, setShowApiInput] = useState(true);

  // Mock courier data around Notting Hill Gate/Kensington
  const [couriers, setCouriers] = useState<Courier[]>([
    {
      id: 'courier1',
      name: 'Ali Al Nasiri',
      status: 'on-delivery',
      lat: 51.5074,
      lng: -0.1958,
      heading: 45
    },
    {
      id: 'courier2', 
      name: 'John Smith',
      status: 'available',
      lat: 51.5020,
      lng: -0.1947,
      heading: 120
    },
    {
      id: 'courier3',
      name: 'Emma Johnson',
      status: 'to-retailer',
      lat: 51.5095,
      lng: -0.1906,
      heading: 270
    },
    {
      id: 'courier4',
      name: 'David Wilson',
      status: 'available',
      lat: 51.5055,
      lng: -0.1890,
      heading: 180
    },
    {
      id: 'courier5',
      name: 'Sarah Davis',
      status: 'on-delivery',
      lat: 51.5030,
      lng: -0.1975,
      heading: 90
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-delivery': return '#84cc16'; // lime green
      case 'available': return '#000000'; // black
      case 'to-retailer': return '#6b7280'; // grey
      default: return '#000000';
    }
  };

  const createBikeElement = (courier: Courier) => {
    const el = document.createElement('div');
    el.className = 'courier-marker';
    el.style.width = '32px';
    el.style.height = '32px';
    el.style.backgroundImage = `url(${bikeIcon})`;
    el.style.backgroundSize = 'contain';
    el.style.backgroundRepeat = 'no-repeat';
    el.style.backgroundPosition = 'center';
    el.style.transform = `rotate(${courier.heading}deg)`;
    el.style.filter = `brightness(0) saturate(100%) invert(${courier.status === 'available' ? '0%' : courier.status === 'to-retailer' ? '50%' : '0%'})`;
    
    if (courier.status === 'on-delivery') {
      el.style.filter = 'hue-rotate(60deg) saturate(200%) brightness(1.2)';
    } else if (courier.status === 'to-retailer') {
      el.style.filter = 'grayscale(100%) brightness(0.7)';
    }
    
    el.style.cursor = 'pointer';
    el.title = `${courier.name} - ${courier.status.replace('-', ' ')}`;
    
    return el;
  };

  const initializeMap = (token: string) => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = token;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-0.1958, 51.5074], // Notting Hill Gate
      zoom: 14,
      pitch: 0,
      bearing: 0
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      updateCourierMarkers();
    });
  };

  const updateCourierMarkers = () => {
    if (!map.current) return;

    // Remove existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Add new markers
    couriers.forEach(courier => {
      const el = createBikeElement(courier);
      
      const marker = new mapboxgl.Marker(el)
        .setLngLat([courier.lng, courier.lat])
        .addTo(map.current!);

      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div class="p-2">
            <h3 class="font-semibold text-sm">${courier.name}</h3>
            <p class="text-xs text-gray-600 capitalize">${courier.status.replace('-', ' ')}</p>
            <div class="w-3 h-3 rounded-full mt-1" style="background-color: ${getStatusColor(courier.status)}"></div>
          </div>
        `);

      marker.setPopup(popup);
      markersRef.current[courier.id] = marker;
    });
  };

  // Simulate courier movement
  useEffect(() => {
    const interval = setInterval(() => {
      setCouriers(prev => prev.map(courier => {
        // Small random movement
        const deltaLat = (Math.random() - 0.5) * 0.0005;
        const deltaLng = (Math.random() - 0.5) * 0.0005;
        const deltaHeading = (Math.random() - 0.5) * 20;
        
        return {
          ...courier,
          lat: courier.lat + deltaLat,
          lng: courier.lng + deltaLng,
          heading: (courier.heading + deltaHeading) % 360
        };
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Update markers when couriers move
  useEffect(() => {
    if (map.current) {
      updateCourierMarkers();
    }
  }, [couriers]);

  const handleApiSubmit = () => {
    if (apiKey.trim()) {
      setShowApiInput(false);
      initializeMap(apiKey);
    }
  };

  if (showApiInput) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Mapbox API Key Required</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Please enter your Mapbox public token to view the courier map.
            <br />
            Get your token at <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">mapbox.com</a>
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="pk.eyJ1IjoieW91ci11c2VybmFtZSI..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="px-3 py-2 border rounded-md w-80"
          />
          <button
            onClick={handleApiSubmit}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Load Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-96 relative">
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      
      {/* Legend */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <h4 className="font-semibold text-sm mb-2">Courier Status</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#84cc16' }}></div>
            <span>On Delivery</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#000000' }}></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#6b7280' }}></div>
            <span>To Retailer</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourierMap;