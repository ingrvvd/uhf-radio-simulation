import React, { useState, useRef, useEffect } from 'react';

const OPTIONS = ['OFF', 'MAIN', 'BOTH', 'ADF'];

export default function FunctionSelector({ value, onChange }) {
  const knobRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startAngle, setStartAngle] = useState(0);
  const [startIndex, setStartIndex] = useState(0);
  const options = OPTIONS;
  const currentIndex = options.indexOf(value);
  
  const getRotationAngle = () => {
    // Spread across about 120 degrees
    const anglePerOption = 40;
    return -60 + (currentIndex * anglePerOption);
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
      
      const indexDiff = Math.round(angleDiff / 25);
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
      {/* Labels */}
      <div className="flex justify-between w-24 mb-0.5 px-1">
        <span className="text-[8px] text-stone-300 font-medium">OFF</span>
        <span className="text-[8px] text-stone-300 font-medium">MAIN</span>
      </div>
      <div className="flex justify-between w-24 mb-1 px-3">
        <span className="text-[8px] text-stone-300 font-medium">BOTH</span>
        <span className="text-[8px] text-stone-300 font-medium">ADF</span>
      </div>
      
      <div
        ref={knobRef}
        className="w-12 h-12 relative cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleStart}
        onTouchStart={handleStart}
      >
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full bg-linear-to-b from-stone-400 via-stone-500 to-stone-600 shadow-lg" />
        
        {/* Knob body */}
        <div 
          className="absolute inset-0.5 rounded-full bg-linear-to-br from-stone-700 via-stone-800 to-stone-900"
          style={{
            transform: `rotate(${getRotationAngle()}deg)`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          {/* Ridges */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-full h-px bg-stone-600/30 left-0 top-1/2"
              style={{ transform: `rotate(${i * 18}deg)` }}
            />
          ))}
          
          {/* Indicator line */}
          <div className="absolute top-[10%] left-1/2 w-0.5 h-[25%] -translate-x-1/2 bg-stone-300 rounded-full" />
          
          {/* Center */}
          <div className="absolute inset-[28%] rounded-full bg-linear-to-br from-stone-600 to-stone-800" />
        </div>
      </div>
      
      {/* UHF label below */}
      <span className="text-[10px] text-stone-300 font-bold tracking-widest mt-1">UHF</span>
    </div>
  );
}