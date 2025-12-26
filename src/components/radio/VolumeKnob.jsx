import React, { useState, useRef, useEffect } from 'react';

export default function VolumeKnob({ value, onChange, label }) {
  const knobRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startAngle, setStartAngle] = useState(0);
  const [startValue, setStartValue] = useState(0);

  const getRotationAngle = () => {
    // 0-100 mapped to -135 to 135 degrees
    return -135 + (value / 100) * 270;
  };

  const getAngleFromEvent = (e, rect) => {
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
  };

  const handleStart = (e) => {
    e.preventDefault();
    const rect = knobRef.current.getBoundingClientRect();
    setStartAngle(getAngleFromEvent(e, rect));
    setStartValue(value);
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMove = (e) => {
      if (!isDragging) return;
      
      const rect = knobRef.current.getBoundingClientRect();
      const currentAngle = getAngleFromEvent(e, rect);
      let angleDiff = currentAngle - startAngle;
      
      if (angleDiff > 180) angleDiff -= 360;
      if (angleDiff < -180) angleDiff += 360;
      
      const valueDiff = (angleDiff / 270) * 100;
      const newValue = Math.max(0, Math.min(100, startValue + valueDiff));
      
      onChange(Math.round(newValue));
    };

    const handleEnd = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, startAngle, startValue, onChange]);

  return (
    <div className="flex flex-col items-center">
      {label && (
        <span className="text-[10px] text-stone-300 font-medium tracking-wider mb-1 uppercase">
          {label}
        </span>
      )}
      
      <div
        ref={knobRef}
        className="w-10 h-10 relative cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleStart}
        onTouchStart={handleStart}
      >
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full bg-linear-to-b from-stone-400 via-stone-500 to-stone-600 shadow-md" />
        
        {/* Knob body */}
        <div 
          className="absolute inset-0.5 rounded-full bg-linear-to-br from-stone-700 via-stone-800 to-stone-900"
          style={{
            transform: `rotate(${getRotationAngle()}deg)`,
            transition: isDragging ? 'none' : 'transform 0.05s ease-out'
          }}
        >
          {/* Ridges */}
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className="absolute w-full h-px bg-stone-600/40 left-0 top-1/2"
              style={{ transform: `rotate(${i * 22.5}deg)` }}
            />
          ))}
          
          {/* Indicator */}
          <div className="absolute top-[12%] left-1/2 w-0.5 h-[22%] -translate-x-1/2 bg-stone-300 rounded-full" />
          
          {/* Center */}
          <div className="absolute inset-[30%] rounded-full bg-linear-to-br from-stone-600 to-stone-800" />
        </div>
      </div>
    </div>
  );
}