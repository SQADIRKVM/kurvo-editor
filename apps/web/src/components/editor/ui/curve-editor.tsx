"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/utils/ui";

export interface CurvePoint {
  x: number; // 0 to 100
  y: number; // 0 to 100
  id: string;
}

interface CurveEditorProps {
  points: CurvePoint[];
  onChange: (points: CurvePoint[]) => void;
  color?: string;
  className?: string;
  grid?: boolean;
}

export function CurveEditor({
  points,
  onChange,
  color = "#8b5cf6",
  className,
  grid = true,
}: CurveEditorProps) {
  const containerRef = useRef<SVGSVGElement>(null);
  const [activePoint, setActivePoint] = useState<string | null>(null);

  // Sort points by X to ensure a valid function graph
  const sortedPoints = [...points].sort((a, b) => a.x - b.x);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!activePoint || !containerRef.current) return;

    const svg = containerRef.current;
    const rect = svg.getBoundingClientRect();
    
    // Calculate 0-100 coordinates
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = 100 - ((e.clientY - rect.top) / rect.height) * 100;

    // Clamp values
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));

    // For first and last points, prevent X movement
    const pointIndex = sortedPoints.findIndex(p => p.id === activePoint);
    if (pointIndex === 0) x = 0;
    if (pointIndex === sortedPoints.length - 1) x = 100;

    // Prevent points from crossing each other in X
    if (pointIndex > 0 && x <= sortedPoints[pointIndex - 1].x) {
      x = sortedPoints[pointIndex - 1].x + 1;
    }
    if (pointIndex < sortedPoints.length - 1 && x >= sortedPoints[pointIndex + 1].x) {
      x = sortedPoints[pointIndex + 1].x - 1;
    }

    const updatedPoints = sortedPoints.map((p) =>
      p.id === activePoint ? { ...p, x, y } : p
    );
    onChange(updatedPoints);
  };

  const handleAddPoint = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const svg = containerRef.current;
    const rect = svg.getBoundingClientRect();
    
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = 100 - ((e.clientY - rect.top) / rect.height) * 100;

    // Add new point in sorted position
    const newPoint: CurvePoint = {
      id: Math.random().toString(36).substr(2, 9),
      x,
      y,
    };
    
    onChange([...points, newPoint]);
  };

  // Build SVG Path string (Bezier or Linear)
  const buildPath = () => {
    if (sortedPoints.length < 2) return "";
    
    let path = `M ${sortedPoints[0].x} ${100 - sortedPoints[0].y}`;
    
    for (let i = 1; i < sortedPoints.length; i++) {
      const p1 = sortedPoints[i-1];
      const p2 = sortedPoints[i];
      
      // Using a simple cubic bezier for smoothing
      const cp1x = p1.x + (p2.x - p1.x) / 3;
      const cp2x = p1.x + 2 * (p2.x - p1.x) / 3;
      
      path += ` C ${cp1x} ${100 - p1.y}, ${cp2x} ${100 - p2.y}, ${p2.x} ${100 - p2.y}`;
    }
    
    return path;
  };

  return (
    <div className={cn("relative w-full aspect-square bg-black/40 rounded-lg overflow-hidden border border-white/5", className)}>
      {grid && (
        <div className="absolute inset-0 pointer-events-none opacity-10">
          {[25, 50, 75].map(v => (
            <div key={`v-${v}`} className="absolute top-0 bottom-0 border-l border-white" style={{ left: `${v}%` }} />
          ))}
          {[25, 50, 75].map(v => (
            <div key={`h-${v}`} className="absolute left-0 right-0 border-t border-white" style={{ top: `${v}%` }} />
          ))}
        </div>
      )}

      <svg
        ref={containerRef}
        viewBox="0 0 100 100"
        className="w-full h-full cursor-crosshair select-none"
        onMouseMove={handleMouseMove}
        onMouseUp={() => setActivePoint(null)}
        onMouseLeave={() => setActivePoint(null)}
        onDoubleClick={handleAddPoint}
      >
        {/* Connection Line */}
        <path
          d={buildPath()}
          fill="none"
          stroke={color}
          strokeWidth="2"
          className="drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]"
        />

        {/* Control Points */}
        {sortedPoints.map((p) => (
          <circle
            key={p.id}
            cx={p.x}
            cy={100 - p.y}
            r="3"
            fill={activePoint === p.id ? "white" : color}
            stroke="white"
            strokeWidth="0.5"
            className="cursor-pointer transition-transform hover:scale-150"
            onMouseDown={(e) => {
              e.stopPropagation();
              setActivePoint(p.id);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              if (sortedPoints.length > 2) {
                onChange(points.filter(pt => pt.id !== p.id));
              }
            }}
          />
        ))}
      </svg>
      
      <div className="absolute bottom-2 right-2 text-[8px] text-white/30 font-mono pointer-events-none uppercase tracking-widest">
        Double click to add • Right click to remove
      </div>
    </div>
  );
}
