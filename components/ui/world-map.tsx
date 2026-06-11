"use client"

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface City {
  name: string
  nameAr: string
  x: number
  y: number
  isHub?: boolean
}

const CITIES: City[] = [
  { name: 'Baghdad', nameAr: 'بغداد', x: 422, y: 153, isHub: true },
  { name: 'Dubai', nameAr: 'دبي', x: 438, y: 170 },
  { name: 'London', nameAr: 'لندن', x: 329, y: 108 },
  { name: 'Frankfurt', nameAr: 'فرانكفورت', x: 346, y: 112 },
  { name: 'Beijing', nameAr: 'بكين', x: 575, y: 135 },
  { name: 'New York', nameAr: 'نيويورك', x: 170, y: 125 },
  { name: 'Tokyo', nameAr: 'طوكيو', x: 606, y: 131 },
]

// Curved connection paths between Baghdad and other cities (Quadratic Bezier)
const CONNECTIONS = [
  { from: { x: 422, y: 153 }, to: { x: 329, y: 108 }, cx: 375, cy: 78 },   // Baghdad to London
  { from: { x: 422, y: 153 }, to: { x: 346, y: 112 }, cx: 384, cy: 87 },   // Baghdad to Frankfurt
  { from: { x: 422, y: 153 }, to: { x: 438, y: 170 }, cx: 430, cy: 138 },  // Baghdad to Dubai
  { from: { x: 422, y: 153 }, to: { x: 575, y: 135 }, cx: 498, cy: 95 },   // Baghdad to Beijing
  { from: { x: 422, y: 153 }, to: { x: 170, y: 125 }, cx: 296, cy: 65 },   // Baghdad to New York
  { from: { x: 422, y: 153 }, to: { x: 606, y: 131 }, cx: 514, cy: 71 },   // Baghdad to Tokyo
]

interface WorldMapProps {
  className?: string
  viewBox?: string
  aspectClass?: string
}

export function WorldMap({
  className,
  viewBox = "-5 -5 710 730",
  aspectClass = "aspect-[710/730]",
}: WorldMapProps) {
  return (
    <div
      className={cn(
        "relative w-full select-none pointer-events-none",
        aspectClass,
        className
      )}
    >
      {/* SVG Container with exact map viewBox */}
      <svg
        viewBox={viewBox}
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Custom style block for ripple and flow animations */}
          <style>{`
            @keyframes pulse-ring {
              0% { transform: scale(0.6); opacity: 0; }
              20% { opacity: 0.6; }
              100% { transform: scale(2.8); opacity: 0; }
            }
            @keyframes flow-dash {
              to {
                stroke-dashoffset: -24;
              }
            }
            .pulse-ring-1 {
              animation: pulse-ring 3s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
            }
            .pulse-ring-2 {
              animation: pulse-ring 3s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
              animation-delay: 1.5s;
            }
            .flow-connection {
              stroke-dasharray: 6 8;
              animation: flow-dash 4s linear infinite;
            }
          `}</style>

          {/* Gradients */}
          <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#8B0000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="cityGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#b5a36e" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#b5a36e" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. Vector Map Image Background */}
        <image
          href="/world-map.svg"
          x="-5"
          y="-5"
          width="710"
          height="730"
          className="opacity-[0.16] md:opacity-[0.22] transition-opacity duration-500"
        />

        {/* 2. Connection Arcs */}
        <g id="connections">
          {CONNECTIONS.map((conn, idx) => (
            <g key={idx}>
              {/* Underlay glowing path */}
              <path
                d={`M ${conn.from.x} ${conn.from.y} Q ${conn.cx} ${conn.cy} ${conn.to.x} ${conn.to.y}`}
                fill="none"
                stroke="rgba(181, 163, 110, 0.12)"
                strokeWidth="1.5"
              />
              {/* Animating dotted overlay path */}
              <path
                d={`M ${conn.from.x} ${conn.from.y} Q ${conn.cx} ${conn.cy} ${conn.to.x} ${conn.to.y}`}
                fill="none"
                stroke="rgba(181, 163, 110, 0.65)"
                strokeWidth="1"
                className="flow-connection"
              />
            </g>
          ))}
        </g>

        {/* 3. Glowing Pulsing Cities */}
        <g id="cities">
          {CITIES.map((city, idx) => {
            const color = city.isHub ? '#ef4444' : '#b5a36e'
            const glowId = city.isHub ? 'url(#hubGlow)' : 'url(#cityGlow)'
            
            return (
              <g key={idx}>
                {/* Large outer glow container */}
                <circle
                  cx={city.x}
                  cy={city.y}
                  r={city.isHub ? 24 : 14}
                  fill={glowId}
                />

                {/* Pulsing concentric rings */}
                <circle
                  cx={city.x}
                  cy={city.y}
                  r={city.isHub ? 12 : 8}
                  fill="none"
                  stroke={color}
                  strokeWidth="1"
                  className="pulse-ring-1"
                  style={{ transformOrigin: `${city.x}px ${city.y}px` }}
                />
                <circle
                  cx={city.x}
                  cy={city.y}
                  r={city.isHub ? 12 : 8}
                  fill="none"
                  stroke={color}
                  strokeWidth="1"
                  className="pulse-ring-2"
                  style={{ transformOrigin: `${city.x}px ${city.y}px` }}
                />

                {/* Core solid marker */}
                <circle
                  cx={city.x}
                  cy={city.y}
                  r={city.isHub ? 4.5 : 2.5}
                  fill={color}
                  className={city.isHub ? "shadow-lg shadow-red-500" : ""}
                />
              </g>
            )
          })}
        </g>
      </svg>
    </div>
  )
}
