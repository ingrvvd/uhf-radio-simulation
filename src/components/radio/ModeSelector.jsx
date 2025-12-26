import React, { useState, useRef, useEffect } from 'react';

export default function ModeSelector({ value, onChange, options, labels }) {
  const knobRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startAngle, setStartAngle] = useState(0);
  const [startIndex, setStartIndex] = useState(0);

  const currentIndex = options.indexOf(value);
  
  // Map positions to angles (-45, 0, 45 for 3 options)
  const getRotationAngle = () => {
    const angleSpread = 90;
    const anglePerOption = angleSpread / (options.length - 1);
    return -angleSpread/2 + (currentIndex * anglePerOption);
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
    setStartIndex(currentIndex);
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
      
      const indexDiff = Math.round(angleDiff / 30);
      let newIndex = Math.max(0, Math.min(options.length - 1, startIndex + indexDiff));
      
      if (newIndex !== currentIndex) {
        onChange(options[newIndex]);
      }
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
  }, [isDragging, startAngle, startIndex, currentIndex, options, onChange]);

  return (
    <div className="flex flex-col items-center relative">
      {/* Labels around the knob */}
      <div className="relative w-24 h-8 mb-1">
        {labels.map((label, i) => {
          const angle = -45 + (i * 45);
          const radius = 40;
          const x = 48 + radius * Math.sin(angle * Math.PI / 180);
          const y = 24 - radius * Math.cos(angle * Math.PI / 180);
          return (
            <span
              key={label}
              className="absolute text-[9px] text-stone-300 font-medium tracking-wide whitespace-nowrap"
              style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {label}
            </span>
          );
        })}
      </div>
      
      <div
        ref={knobRef}
        className="w-14 h-14 relative cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleStart}
        onTouchStart={handleStart}
      >
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full bg-linear-to-b from-stone-400 via-stone-500 to-stone-600 shadow-lg" />
        
        {/* Knob body - gray pointer style */}
        <div 
          className="absolute inset-0.75 rounded-full bg-linear-to-br from-stone-500 via-stone-600 to-stone-700"
          style={{
            transform: `rotate(${getRotationAngle()}deg)`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          {/* Pointer/indicator */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-6 bg-linear-to-b from-stone-400 to-stone-600 rounded-t-full" 
               style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }} />
          
          {/* Center */}
          <div className="absolute inset-[25%] rounded-full bg-linear-to-br from-stone-600 to-stone-800 shadow-inner" />
        </div>
      </div>
    </div>
  );
}