import React, { useEffect, useState } from 'react';
import bikeIcon from '@/assets/bike-icon.png';

interface Courier {
  id: string;
  name: string;
  status: 'available' | 'on-delivery' | 'to-retailer';
  x: number; // percentage position
  y: number; // percentage position
  heading: number;
}

const CourierMap = () => {
  // Mock courier data positioned across the map
  const [couriers, setCouriers] = useState<Courier[]>([
    {
      id: 'courier1',
      name: 'Ali Al Nasiri',
      status: 'on-delivery',
      x: 25,
      y: 30,
      heading: 45
    },
    {
      id: 'courier2', 
      name: 'John Smith',
      status: 'available',
      x: 60,
      y: 70,
      heading: 120
    },
    {
      id: 'courier3',
      name: 'Emma Johnson',
      status: 'to-retailer',
      x: 80,
      y: 20,
      heading: 270
    },
    {
      id: 'courier4',
      name: 'David Wilson',
      status: 'available',
      x: 15,
      y: 80,
      heading: 180
    },
    {
      id: 'courier5',
      name: 'Sarah Davis',
      status: 'on-delivery',
      x: 45,
      y: 50,
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

  const getStatusFilter = (status: string) => {
    switch (status) {
      case 'on-delivery': return 'hue-rotate(60deg) saturate(200%) brightness(1.2)';
      case 'available': return 'brightness(0) saturate(100%)';
      case 'to-retailer': return 'grayscale(100%) brightness(0.7)';
      default: return 'brightness(0) saturate(100%)';
    }
  };

  // Simulate courier movement
  useEffect(() => {
    const interval = setInterval(() => {
      setCouriers(prev => prev.map(courier => {
        // Small random movement within bounds
        const deltaX = (Math.random() - 0.5) * 2;
        const deltaY = (Math.random() - 0.5) * 2;
        const deltaHeading = (Math.random() - 0.5) * 20;
        
        return {
          ...courier,
          x: Math.max(5, Math.min(95, courier.x + deltaX)),
          y: Math.max(5, Math.min(95, courier.y + deltaY)),
          heading: (courier.heading + deltaHeading) % 360
        };
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-96 relative">
      {/* Map Background */}
      <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 rounded-lg border-2 border-green-300 relative overflow-hidden">
        {/* Street Grid Pattern */}
        <div className="absolute inset-0 opacity-20">
          {/* Vertical streets */}
          {[20, 40, 60, 80].map(x => (
            <div 
              key={`v-${x}`}
              className="absolute h-full w-0.5 bg-gray-400"
              style={{ left: `${x}%` }}
            />
          ))}
          {/* Horizontal streets */}
          {[25, 50, 75].map(y => (
            <div 
              key={`h-${y}`}
              className="absolute w-full h-0.5 bg-gray-400"
              style={{ top: `${y}%` }}
            />
          ))}
        </div>

        {/* Area Labels */}
        <div className="absolute top-4 left-4 text-xs font-semibold text-green-800 bg-white/80 px-2 py-1 rounded">
          Notting Hill Gate
        </div>
        <div className="absolute top-4 right-4 text-xs font-semibold text-green-800 bg-white/80 px-2 py-1 rounded">
          Kensington
        </div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-green-800 bg-white/80 px-2 py-1 rounded">
          Hyde Park (South)
        </div>

        {/* Courier Bikes */}
        {couriers.map(courier => (
          <div
            key={courier.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-3000 cursor-pointer group"
            style={{
              left: `${courier.x}%`,
              top: `${courier.y}%`,
            }}
            title={`${courier.name} - ${courier.status.replace('-', ' ')}`}
          >
            <div
              className="w-8 h-8 bg-no-repeat bg-center bg-contain"
              style={{
                backgroundImage: `url(${bikeIcon})`,
                transform: `rotate(${courier.heading}deg)`,
                filter: getStatusFilter(courier.status),
              }}
            />
            
            {/* Tooltip on hover */}
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              <div className="font-semibold">{courier.name}</div>
              <div className="capitalize">{courier.status.replace('-', ' ')}</div>
            </div>
          </div>
        ))}
      </div>
      
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